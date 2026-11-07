/* API منفصلة لبوابات آفاق العامة، دون تعديل نظام نتائج الطلاب والمسابقات الرسمي. */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.95.0";
const db=createClient(Deno.env.get("SUPABASE_URL")||"",Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"",{auth:{persistSession:false,autoRefreshToken:false}});
const allowOrigins=new Set(["https://afaqmaths.github.io","http://localhost:8000","http://localhost:5500","http://127.0.0.1:8000","http://127.0.0.1:5500"]);
const headers=(origin:string)=>({"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":allowOrigins.has(origin)?origin:"https://afaqmaths.github.io","Access-Control-Allow-Headers":"authorization,content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Cache-Control":"no-store","Vary":"Origin"});
const ok=(o:string,data:object,status=200)=>new Response(JSON.stringify({ok:true,...data}),{status,headers:headers(o)});
const err=(o:string,error:string,status=400)=>new Response(JSON.stringify({ok:false,error}),{status,headers:headers(o)});
const cl=(v:unknown,max=300)=>String(v??"").trim().slice(0,max);
const digits=(v:unknown)=>cl(v,120).replace(/[٠-٩۰-۹]/g,c=>String(Math.max("٠١٢٣٤٥٦٧٨٩".indexOf(c),"۰۱۲۳۴۵۶۷۸۹".indexOf(c))));
const enc=new TextEncoder();
async function sha(s:string){const v=new Uint8Array(await crypto.subtle.digest("SHA-256",enc.encode(s)));return [...v].map(x=>x.toString(16).padStart(2,"0")).join("")}
function rawToken(){const bytes=crypto.getRandomValues(new Uint8Array(32));return btoa(String.fromCharCode(...bytes)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
const toB64=(x:Uint8Array)=>btoa(String.fromCharCode(...x));
async function derived(pin:string,salt:string,n=150000){
 const k=await crypto.subtle.importKey("raw",enc.encode(pin),"PBKDF2",false,["deriveBits"]);
 const bytes=Uint8Array.from(atob(salt),c=>c.charCodeAt(0));
 return new Uint8Array(await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt:bytes,iterations:n},k,256));
}
async function pinFields(pin:string){const salt=toB64(crypto.getRandomValues(new Uint8Array(16)));return {pin_salt:salt,pin_hash:toB64(await derived(pin,salt)),pin_iterations:150000}}
async function good(pin:string,row:any){const x=await derived(pin,row.pin_salt,row.pin_iterations||150000),y=Uint8Array.from(atob(row.pin_hash),c=>c.charCodeAt(0));let diff=x.length^y.length;for(let i=0;i<Math.min(x.length,y.length);i++)diff|=x[i]^y[i];return diff===0}
const bearer=(req:Request)=>cl((req.headers.get("authorization")||"").replace(/^Bearer /,""),140);
async function staff(req:Request){
 const token=bearer(req);if(token.length<32)return null;
 const {data,error}=await db.from("afaq_sessions").select("role,username,expires_at,revoked_at")
  .eq("token_hash",await sha(token)).maybeSingle();
 if(error)throw error;
 return data&&!data.revoked_at&&new Date(data.expires_at)>new Date()&&
 ["supervisor","supervisor_assistant","director","deputy"].includes(data.role)?data:null;
}
async function parentSession(req:Request){
 const token=bearer(req);if(token.length<32)return null;
 const {data,error}=await db.from("afaq_parent_sessions").select("student_id,expires_at")
 .eq("token_hash",await sha(token)).maybeSingle();if(error)throw error;
 return data&&new Date(data.expires_at)>new Date()?data:null;
}
async function janaSession(req:Request){
 const token=bearer(req);if(token.length<32)return null;
 const {data,error}=await db.from("afaq_jana_sessions").select("player_id,expires_at")
 .eq("token_hash",await sha(token)).maybeSingle();if(error)throw error;
 return data&&new Date(data.expires_at)>new Date()?data:null;
}
async function visitorHash(v:unknown){const id=cl(v,80);return /^[a-f0-9-]{36}$/.test(id)?sha("afaq-visitor-v1:"+id):null}
const cats=new Set(["contest","history","scholars","daily_math","books","exams","question_bank","video","game","flash","cartoon","article","fun_book","learning","other"]);
const icons=new Set(["trophy","gamepad-2","landmark","graduation-cap","ruler","lightbulb","book-open","file-text","list-checks","video","joystick","sparkles","smile","notebook-pen","puzzle","calculator","school","microscope","book-marked","brain","shapes","globe","notebook","music","palette","message-circle","smartphone"]);
const allowUrl=(url:string)=>!url||/^https:\/\/[a-z0-9.-]+(?:\/[^\s]*)?$/i.test(url)||/^(?:exams|competition|learning-pathways|jana-challenge)\.html(?:\?[^\s]*)?$/.test(url);
async function listItems(publishedOnly:boolean){
 let q=db.from("afaq_public_items").select("id,category,title,description,body,resource_url,icon,grade,published,featured,sort_order,created_at,updated_at")
  .order("sort_order").order("id").limit(500);
 if(publishedOnly)q=q.eq("published",true);
 const {data,error}=await q;if(error)throw error;return data||[];
}
const questions=[
 ["كم ناتج ٢ + ٣؟",["٤","٥","٦","٧"],1],
 ["ما العدد التالي بعد ٩؟",["٨","١٠","١١","١٢"],1],
 ["كم ناتج ٥ × ٢؟",["١٠","٧","١٢","٥"],0],
 ["ما العدد الزوجي؟",["٧","٩","١٢","١٥"],2],
 ["كم ناتج ١٢ − ٤؟",["٦","٨","٩","١٠"],1],
 ["كم عدد أضلاع المثلث؟",["٢","٣","٤","٥"],1],
 ["كم ناتج ٢٤ ÷ ٤؟",["٤","٥","٦","٨"],2],
 ["ما أقرب عشرة للعدد ٣٧؟",["٢٠","٣٠","٤٠","٥٠"],2],
 ["أي عدد أكبر؟",["١٩","٢١","١٧","١٥"],1],
 ["كم ناتج ١٠ + ١٥؟",["٢٠","٢٥","٣٠","٣٥"],1]
];
const trialPublic=(record:any)=>({started_at:record.started_at,completed_at:record.completed_at,
 score:record.completed_at?record.score:null,total:10,
 questions:record.completed_at?[]:record.questions.map((x:any,i:number)=>({number:i+1,text:x[0],options:x[1]}))});
async function failedGate(table:string,key:string,value:string,max=5){
 const {data}=await db.from(table).select("failed_count,first_failed_at").eq(key,value).maybeSingle();
 return !!data&&Date.now()-new Date(data.first_failed_at).getTime()<15*60000&&data.failed_count>=max;
}
async function failedAdd(table:string,key:string,value:string){
 const {data}=await db.from(table).select("failed_count,first_failed_at").eq(key,value).maybeSingle();
 const reset=!data||Date.now()-new Date(data.first_failed_at).getTime()>15*60000;
 await db.from(table).upsert({[key]:value,failed_count:reset?1:data.failed_count+1,first_failed_at:reset?new Date().toISOString():data.first_failed_at},{onConflict:key});
}
async function studentId(className:unknown,serial:unknown){
 const cls=cl(className,30),n=Number(digits(serial));if(!["السادس / ٤","السادس / ٥","السادس / ٦"].includes(cls)||!Number.isInteger(n)||n<1||n>60)return null;
 const {data,error}=await db.from("competition_students").select("student_id").eq("class_name",cls).eq("serial_no",n).eq("active",true).maybeSingle();
 if(error)throw error;return data?.student_id||null;
}
async function issueTicket(vhash:string|null,student_id:string|null,kind:string,sender:string,message:string,email:string){
 const ticket=rawToken().slice(0,22),ticket_hash=await sha("afaq-ticket-v1:"+ticket);
 const {data,error}=await db.from("afaq_support_tickets").insert({ticket_hash,visitor_hash:vhash,student_id,kind,sender,contact_email:email||null,message})
  .select("id,created_at").single();if(error)throw error;
 return {ticket,submitted_at:data.created_at};
}
Deno.serve(async req=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response("ok",{headers:headers(origin)});
 if(req.method!=="POST")return err(origin,"method_not_allowed",405);
 if(origin&&!allowOrigins.has(origin))return err(origin,"origin_not_allowed",403);
 try{
  let b:any;try{b=await req.json()}catch{return err(origin,"invalid_json")}
  const action=cl(b?.action,55);

  if(action==="public_catalog")return ok(origin,{items:await listItems(true)});

  if(action==="visitor_ping"){
   const hash=await visitorHash(b.visitor_id);if(!hash)return err(origin,"invalid_visitor",400);
   const {data:before,error:readErr}=await db.from("afaq_guest_visitors").select("views").eq("visitor_hash",hash).maybeSingle();if(readErr)throw readErr;
   if(before){
    const {error}=await db.from("afaq_guest_visitors").update({views:Math.min(1000000,before.views+1),last_seen:new Date().toISOString()})
     .eq("visitor_hash",hash);if(error)throw error;
   }else{
    const {error}=await db.from("afaq_guest_visitors").insert({visitor_hash:hash});
    if(error&&error.code!=="23505")throw error;
   }
   const {count,error}=await db.from("afaq_guest_visitors").select("visitor_hash",{head:true,count:"exact"});
   if(error)throw error;
   return ok(origin,{visitors:count||0,definition:"معرّفات متصفحات مختلفة؛ ليس عدد أشخاص موثّقًا"});
  }

  if(action==="guest_trial_status"||action==="guest_trial_start"||action==="guest_trial_submit"){
   const hash=await visitorHash(b.visitor_id);if(!hash)return err(origin,"invalid_visitor");
   let {data:record,error:readError}=await db.from("afaq_guest_trials").select("*").eq("visitor_hash",hash).maybeSingle();
   if(readError)throw readError;
   if(action==="guest_trial_start"&&!record){
    const {error:ve}=await db.from("afaq_guest_visitors").upsert({visitor_hash:hash},{onConflict:"visitor_hash",ignoreDuplicates:true});if(ve)throw ve;
    const {data:newRow,error}=await db.from("afaq_guest_trials").insert({visitor_hash:hash,questions,started_at:new Date().toISOString()})
     .select("*").maybeSingle();
    if(error&&error.code!=="23505")throw error;
    record=newRow|| (await db.from("afaq_guest_trials").select("*").eq("visitor_hash",hash).single()).data;
   }
   if(!record)return ok(origin,{trial:null,available:true});
   if(action==="guest_trial_submit"){
    if(record.completed_at)return err(origin,"trial_already_completed",409);
    const answers=b.answers;if(!Array.isArray(answers)||answers.length!==10||!answers.every(x=>Number.isInteger(x)&&x>=0&&x<=3))return err(origin,"invalid_answers");
    const correct=(record.questions as unknown[]).reduce((sum:number,x:any,i:number)=>sum+(x[2]===answers[i]?1:0),0);
    const {data:saved,error}=await db.from("afaq_guest_trials").update({answers,score:correct,completed_at:new Date().toISOString()})
     .eq("visitor_hash",hash).is("completed_at",null).select("*").maybeSingle();
    if(error)throw error;if(!saved)return err(origin,"trial_already_completed",409);
    return ok(origin,{trial:trialPublic(saved),available:false});
   }
   return ok(origin,{trial:trialPublic(record),available:!record.completed_at});
  }

  if(action==="jana_login"){
   const nickname=cl(b.nickname,40).replace(/\s+/g," ");
   const pin=digits(b.pin);
   if(!/^[\p{L}\p{N} _-]{2,40}$/u.test(nickname)||!/^\d{4,8}$/.test(pin))return err(origin,"invalid_jana_login");
   if(await failedGate("afaq_jana_login_fails","nickname",nickname))return err(origin,"locked_15_min",429);
   let {data:player,error}=await db.from("afaq_jana_players").select("*").eq("nickname",nickname).maybeSingle();if(error)throw error;
   if(!player){
    const fields=await pinFields(pin);
    const added=await db.from("afaq_jana_players").insert({nickname,...fields}).select("*").maybeSingle();
    if(added.error&&added.error.code!=="23505")throw added.error;
    player=added.data||(await db.from("afaq_jana_players").select("*").eq("nickname",nickname).single()).data;
   }
   if(!player||!await good(pin,player)){
    await failedAdd("afaq_jana_login_fails","nickname",nickname);
    return err(origin,"invalid_jana_login",401);
   }
   await db.from("afaq_jana_login_fails").delete().eq("nickname",nickname);
   const token=rawToken();
   const expires_at=new Date(Date.now()+12*3600*1000).toISOString();
   const {error:se}=await db.from("afaq_jana_sessions").insert({token_hash:await sha(token),player_id:player.id,expires_at});
   if(se)throw se;
   return ok(origin,{token,expires_at,nickname:player.nickname});
  }
  if(action==="jana_leaderboard"){
   const {data,error}=await db.from("afaq_jana_scores").select("player_id,score").order("score",{ascending:false}).limit(4000);
   if(error)throw error;
   const scores=new Map<string,{best:number,attempts:number}>();
   for(const r of data||[]){const prev=scores.get(r.player_id)||{best:0,attempts:0};prev.best=Math.max(prev.best,r.score);prev.attempts++;scores.set(r.player_id,prev)}
   const ids=[...scores.keys()];
   let players:any[]=[];
   if(ids.length){const x=await db.from("afaq_jana_players").select("id,nickname").in("id",ids);if(x.error)throw x.error;players=x.data||[]}
   const ranking=players.map(p=>({nickname:p.nickname,...scores.get(p.id)})).sort((a,b)=>b.best-a.best||a.attempts-b.attempts).slice(0,30);
   return ok(origin,{ranking,note:"ترتيب للمتعة والتدريب، نتائج غير محكّمة خارجياً"});
  }
  if(["jana_me","jana_score"].includes(action)){
   const session=await janaSession(req);if(!session)return err(origin,"jana_login_required",401);
   const {data:player,error:pe}=await db.from("afaq_jana_players").select("nickname").eq("id",session.player_id).single();if(pe)throw pe;
   const {data:attempts,error:ae}=await db.from("afaq_jana_scores").select("score,created_at").eq("player_id",session.player_id).order("created_at",{ascending:false}).limit(80);if(ae)throw ae;
   if(action==="jana_score"){
    const score=Number(b.score);
    if(!Number.isInteger(score)||score<0||score>30)return err(origin,"invalid_score");
    if(attempts?.[0]&&Date.now()-new Date(attempts[0].created_at).getTime()<30000)return err(origin,"slow_down",429);
    const {error}=await db.from("afaq_jana_scores").insert({player_id:session.player_id,score,total:30});if(error)throw error;
    return ok(origin,{nickname:player.nickname,score,recorded:true});
   }
   return ok(origin,{nickname:player.nickname,attempts:attempts||[],best:Math.max(0,...(attempts||[]).map(x=>x.score))});
  }

  if(action==="parent_login"){
   const id=await studentId(b.class_name,b.serial_no),pin=digits(b.pin);
   if(!id||!/^\d{6}$/.test(pin))return err(origin,"parent_login_failed",401);
   if(await failedGate("afaq_parent_login_fails","student_id",id))return err(origin,"locked_15_min",429);
   const {data,error}=await db.from("afaq_parent_codes").select("*").eq("student_id",id).eq("active",true).maybeSingle();if(error)throw error;
   if(!data||!await good(pin,data)){await failedAdd("afaq_parent_login_fails","student_id",id);return err(origin,"parent_login_failed",401)}
   await db.from("afaq_parent_login_fails").delete().eq("student_id",id);
   const token=rawToken();const expires_at=new Date(Date.now()+12*3600*1000).toISOString();
   const {error:se}=await db.from("afaq_parent_sessions").insert({token_hash:await sha(token),student_id:id,expires_at});if(se)throw se;
   return ok(origin,{token,expires_at});
  }
  if(["parent_profile","parent_message","parent_logout"].includes(action)){
   const session=await parentSession(req);if(!session)return err(origin,"parent_login_required",401);
   if(action==="parent_logout"){
    await db.from("afaq_parent_sessions").delete().eq("token_hash",await sha(bearer(req)));
    return ok(origin,{logged_out:true});
   }
   const {data:student,error:se}=await db.from("competition_students").select("class_name,serial_no,full_name").eq("student_id",session.student_id).single();if(se)throw se;
   if(action==="parent_message"){
    const message=cl(b.message,2500);if(message.length<8)return err(origin,"message_too_short");
    const today=new Date(Date.now()-24*3600*1000).toISOString();
    const {count,error:ce}=await db.from("afaq_support_tickets").select("id",{count:"exact",head:true})
      .eq("student_id",session.student_id).gte("created_at",today);if(ce)throw ce;
    if((count||0)>=5)return err(origin,"daily_message_limit",429);
    const result=await issueTicket(null,session.student_id,"support","ولي أمر الطالب: "+student.full_name,message,"");
    return ok(origin,{...result});
   }
   const [{data:assessment,error:e1},{data:notes,error:e2},{data:messages,error:e3}]=await Promise.all([
    db.from("afaq_student_assessments").select("*").eq("student_id",session.student_id).maybeSingle(),
    db.from("afaq_student_notes").select("category,note,created_at").eq("student_id",session.student_id).eq("visible_to_student",true).order("created_at",{ascending:false}).limit(20),
    db.from("afaq_support_tickets").select("id,kind,message,response,created_at,answered_at").eq("student_id",session.student_id).order("created_at",{ascending:false}).limit(30)
   ]);
   if(e1||e2||e3)throw e1||e2||e3;
   let grade:any=null;
   if(assessment?.status==="approved"){
    const keys=["oral_score","short1_score","short2_score","short_exam1_score","short_exam2_score","written_score","homework_score","project_score"];
    const coursework=keys.reduce((sum,k)=>sum+Number(assessment[k]||0),0);
    grade={coursework,estimated_total:coursework+Number(assessment.a_score||0),prediction_approved:true,
      a_plus:assessment.a_plus_points,a_minus:assessment.a_minus_points,
      final_approved:assessment.final_status==="approved",
      actual_total:assessment.final_status==="approved"?coursework+Number(assessment.final_score||0):null};
   }
   return ok(origin,{student,assessment:grade,notes:notes||[],messages:messages||[]});
  }

  if(action==="support_submit"){
   const hash=await visitorHash(b.visitor_id);if(!hash)return err(origin,"invalid_visitor");
   const kind=cl(b.kind,25),sender=cl(b.sender,100),message=cl(b.message,2500),email=cl(b.contact_email,180);
   if(!["suggestion","complaint","support"].includes(kind)||sender.length<2||message.length<8||
    (email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))return err(origin,"invalid_support");
   const today=new Date(Date.now()-24*3600*1000).toISOString();
   const {count,error:ce}=await db.from("afaq_support_tickets").select("id",{count:"exact",head:true}).eq("visitor_hash",hash).gte("created_at",today);
   if(ce)throw ce;if((count||0)>=3)return err(origin,"daily_message_limit",429);
   return ok(origin,await issueTicket(hash,null,kind,sender,message,email));
  }
  if(action==="support_check"){
   const code=cl(b.ticket,60);
   if(code.length!==22||!/^[A-Za-z0-9_-]+$/.test(code))return err(origin,"invalid_ticket");
   const {data,error}=await db.from("afaq_support_tickets")
    .select("created_at,response,answered_at").eq("ticket_hash",await sha("afaq-ticket-v1:"+code)).maybeSingle();
   if(error)throw error;
   if(!data)return err(origin,"ticket_not_found",404);
   return ok(origin,{ticket:{created_at:data.created_at,answered_at:data.answered_at,response:data.response}});
  }

  const user=await staff(req);
  if(!user||!["supervisor","supervisor_assistant"].includes(user.role))return err(origin,"staff_login_required",403);
  if(action==="staff_stats"){
   const [{count:visitors},{count:trialStarts},{count:trialFinished},{count:janaAccounts},{count:janaResults},{count:unanswered}]=await Promise.all([
    db.from("afaq_guest_visitors").select("visitor_hash",{head:true,count:"exact"}),
    db.from("afaq_guest_trials").select("visitor_hash",{head:true,count:"exact"}),
    db.from("afaq_guest_trials").select("visitor_hash",{head:true,count:"exact"}).not("completed_at","is",null),
    db.from("afaq_jana_players").select("id",{head:true,count:"exact"}),
    db.from("afaq_jana_scores").select("id",{head:true,count:"exact"}),
    db.from("afaq_support_tickets").select("id",{head:true,count:"exact"}).is("answered_at",null)
   ]);
   return ok(origin,{stats:{visitors:visitors||0,trial_starts:trialStarts||0,trial_finished:trialFinished||0,
    jana_accounts:janaAccounts||0,jana_scores:janaResults||0,unanswered:unanswered||0}});
  }
  if(action==="catalog_admin")return ok(origin,{items:await listItems(false)});
  if(action==="catalog_save"){
   if(user.role!=="supervisor")return err(origin,"supervisor_only",403);
   const id=b.id===null||b.id===undefined||b.id===""?null:Number(b.id);
   const cat=cl(b.category,30),title=cl(b.title,180),description=cl(b.description,500),
    body=cl(b.body,4500),resource_url=cl(b.resource_url,650),icon=cl(b.icon,40);
   const grade=b.grade===""||b.grade==null?null:Number(b.grade),order=Number(b.sort_order??100);
   if((id!==null&&(!Number.isSafeInteger(id)||id<1))||!cats.has(cat)||title.length<2||
    !icons.has(icon)||!allowUrl(resource_url)||!Number.isInteger(order)||Math.abs(order)>100000||
    (grade!==null&&(!Number.isInteger(grade)||grade<1||grade>12)))return err(origin,"invalid_catalog_item");
   const patch={category:cat,title,description,body,resource_url:resource_url||null,icon,grade,
    published:b.published===true,featured:b.featured===true,sort_order:order,updated_at:new Date().toISOString()};
   if(id!==null){
    const {data,error}=await db.from("afaq_public_items").update(patch).eq("id",id).select("*").maybeSingle();
    if(error)throw error;if(!data)return err(origin,"not_found",404);return ok(origin,{item:data});
   }
   const {data,error}=await db.from("afaq_public_items").insert({...patch,created_by:user.username}).select("*").single();
   if(error)throw error;return ok(origin,{item:data});
  }
  if(action==="catalog_toggle"){
   if(user.role!=="supervisor")return err(origin,"supervisor_only",403);
   const id=Number(b.id);if(!Number.isSafeInteger(id)||id<1)return err(origin,"invalid_id");
   const {data,error}=await db.from("afaq_public_items")
    .update({published:b.published===true,updated_at:new Date().toISOString()}).eq("id",id).select("id,published").maybeSingle();
   if(error)throw error;if(!data)return err(origin,"not_found",404);return ok(origin,{item:data});
  }
  if(action==="catalog_archive"){
   if(user.role!=="supervisor")return err(origin,"supervisor_only",403);
   const id=Number(b.id);if(!Number.isSafeInteger(id)||id<1)return err(origin,"invalid_id");
   const {error}=await db.from("afaq_public_items").delete().eq("id",id);if(error)throw error;return ok(origin,{removed:true});
  }
  if(action==="support_inbox"){
   const {data,error}=await db.from("afaq_support_tickets")
    .select("id,kind,sender,contact_email,message,response,answered_at,answered_by,created_at,student_id")
    .order("created_at",{ascending:false}).limit(150);if(error)throw error;
   const old=await db.from("afaq_messages").select("id,kind,sender,body,status,created_at").order("created_at",{ascending:false}).limit(60);
   if(old.error)throw old.error;
   return ok(origin,{tickets:data||[],legacy:(old.data||[]).map(x=>({id:x.id,kind:x.kind,sender:x.sender,message:x.body,status:x.status,created_at:x.created_at}))});
  }
  if(action==="support_reply"){
   const id=Number(b.id),response=cl(b.response,2500);
   if(!Number.isSafeInteger(id)||id<1||response.length<3)return err(origin,"invalid_reply");
   const {data,error}=await db.from("afaq_support_tickets").update({response,answered_at:new Date().toISOString(),answered_by:user.role+":"+user.username})
    .eq("id",id).select("id,answered_at").maybeSingle();if(error)throw error;
   if(!data)return err(origin,"ticket_not_found",404);
   return ok(origin,{ticket:data});
  }
  if(action==="parent_code_status"||action==="parent_code_create"||action==="parent_code_disable"){
   if(user.role!=="supervisor")return err(origin,"supervisor_only",403);
   const id=await studentId(b.class_name,b.serial_no);if(!id)return err(origin,"student_not_found",404);
   if(action==="parent_code_status"){
    const {data,error}=await db.from("afaq_parent_codes").select("active,updated_at,issued_by").eq("student_id",id).maybeSingle();if(error)throw error;
    return ok(origin,{configured:!!data?.active,updated_at:data?.updated_at||null});
   }
   if(action==="parent_code_disable"){
    const {error}=await db.from("afaq_parent_codes").update({active:false,updated_at:new Date().toISOString()})
    .eq("student_id",id);if(error)throw error;
    await db.from("afaq_parent_sessions").delete().eq("student_id",id);
    return ok(origin,{disabled:true});
   }
   const code=String(100000+(crypto.getRandomValues(new Uint32Array(1))[0]%900000));
   const fields=await pinFields(code);
   const {error}=await db.from("afaq_parent_codes").upsert({student_id:id,...fields,active:true,
    issued_by:user.username,updated_at:new Date().toISOString()},{onConflict:"student_id"});
   if(error)throw error;
   await db.from("afaq_parent_sessions").delete().eq("student_id",id);
   await db.from("afaq_parent_login_fails").delete().eq("student_id",id);
   return ok(origin,{code,warning:"يظهر الرمز مرة واحدة. أبلغه لولي الأمر عبر قناة خاصة وآمنة فقط."});
  }
  return err(origin,"unknown_action",404);
 }catch(ex){
  console.error("afaq-public-hub:",ex instanceof Error?ex.message:String(ex));
  return err(origin,"server_error",500);
 }
});
