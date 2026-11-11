import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.95.0";
const url=Deno.env.get("SUPABASE_URL")||"";let secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
try{secret=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}").default||secret}catch{}
const db=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
const origins=new Set(["https://afaqmaths.github.io","http://localhost:8000","http://127.0.0.1:8000","http://localhost:5500","http://127.0.0.1:5500"]);
const headers=o=>({"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":origins.has(o)?o:"https://afaqmaths.github.io","Access-Control-Allow-Headers":"authorization,content-type,x-client-info","Access-Control-Allow-Methods":"POST, OPTIONS","Cache-Control":"no-store",Vary:"Origin"});
const answer=(o,v,s=200)=>new Response(JSON.stringify(v),{status:s,headers:headers(o)});
const bad=(o,e,s=400)=>answer(o,{ok:false,error:e},s);
const clean=(v,n=500)=>String(v??"").trim().slice(0,n);
const g=n=>[5,6,7,8].includes(+n);
const staff=r=>["supervisor","supervisor_assistant","director","deputy"].includes(r);
const edit=r=>["supervisor","supervisor_assistant"].includes(r);
const b64=a=>btoa(String.fromCharCode(...a));
const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function sha(s){const a=new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)));return [...a].map(x=>x.toString(16).padStart(2,"0")).join("")}
async function derived(pin,salt,n=150000){const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(pin),"PBKDF2",false,["deriveBits"]);return new Uint8Array(await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt:bytes(salt),iterations:n},k,256))}
async function good(pin,row){const a=await derived(pin,row.pin_salt,Number(row.pin_iterations)||150000),b=bytes(row.pin_hash);let d=a.length^b.length;for(let i=0;i<Math.min(a.length,b.length);i++)d|=a[i]^b[i];return d===0}
async function pinPatch(pin){const salt=b64(crypto.getRandomValues(new Uint8Array(16)));return{pin_salt:salt,pin_hash:b64(await derived(pin,salt)),pin_iterations:150000}}

const classNames=["السادس / ٤","السادس / ٥","السادس / ٦"];
function arabicDigits(value){
 const cleanInput=clean(value,120);
 return cleanInput.replace(/[٠-٩۰-۹]/g,c=>{
  const i="٠١٢٣٤٥٦٧٨٩".indexOf(c);
  return String(i>=0?i:"۰۱۲۳۴۵۶۷۸۹".indexOf(c));
 });
}
async function resolveStudentId(input,class_name){
 const raw=clean(input,120);if(!raw)return null;
 let cls=clean(class_name,30),number=raw;
 if(raw.includes("|")){const fields=raw.split("|");if(fields.length!==2)return null;cls=fields[0];number=fields[1]}
 number=arabicDigits(number);
 const query=db.from("competition_students").select("student_id");
 if(/^\d{1,3}$/.test(number)){
  if(!classNames.includes(cls))return null;
  query.eq("class_name",cls).eq("serial_no",Number(number));
 }else if(/^\d{12}$/.test(number)){
  query.eq("student_id",number);
 }else return null;
 const {data,error}=await query.maybeSingle();if(error)throw error;
 return data?.student_id||null;
}

async function verify(role,username,grade,pin){
 if(role==="supervisor"){if(!/^\d{8}$/.test(pin))return null;const {data,error}=await db.from("competition_teacher_keys").select("id").eq("pin_hash",await sha(pin)).eq("active",true).maybeSingle();if(error)throw error;return data?{role,username:"المشرف الرئيسي",grade:null,student_id:null}:null}

 if(role==="student"){
  const fields=username.split("|");
  if(grade!==6||fields.length!==2||!classNames.includes(fields[0])||! /^\d{4}$/.test(pin))return null;
  const serialText=arabicDigits(fields[1]);
  if(!/^\d{1,2}$/.test(serialText))return null;
  const {data,error}=await db.from("competition_students")
   .select("student_id,serial_no,class_name,full_name,display_name,pin_salt,pin_hash,pin_iterations,active,locked_until")
   .eq("class_name",fields[0]).eq("serial_no",Number(serialText)).maybeSingle();
  if(error)throw error;
  if(!data?.active||(data.locked_until&&new Date(data.locked_until)>new Date())||!await good(pin,data))return null;
  return {role,username:data.full_name||data.display_name,student_id:data.student_id,
   serial_no:data.serial_no,class_name:data.class_name,grade:6};
 }

 if(!["supervisor_assistant","director","deputy","demo"].includes(role))return null;
 const q=db.from("afaq_accounts").select("role,username,grade,pin_salt,pin_hash,pin_iterations,active").eq("role",role).eq("username",username).eq("active",true);
 if(role==="demo"){if(![5,7,8].includes(grade)||!["1000","2000"].includes(username))return null;q.eq("grade",grade)}else q.is("grade",null);
 const {data,error}=await q.maybeSingle();if(error)throw error;return data&&await good(pin,data)?{role,username,grade:data.grade,student_id:null}:null
}
async function session(req){const value=(req.headers.get("authorization")||"").replace(/^Bearer /,"");if(value.length<35||value.length>128)return null;const {data,error}=await db.from("afaq_sessions").select("*").eq("token_hash",await sha(value)).maybeSingle();if(error)throw error;return data&&!data.revoked_at&&new Date(data.expires_at)>new Date()?data:null}

const gradeParts=[
 ["oral_score",10],
 ["short1_score",5],["short2_score",5],
 ["short_exam1_score",10],["short_exam2_score",10],
 ["written_score",5],["homework_score",5],
 ["project_score",10],["a_score",40]
];
const gbCoreKeys=gradeParts.filter(([k])=>k!=="a_score").map(([k])=>k);
const gradeCoreComplete=r=>!!r&&gbCoreKeys.every(k=>r[k]!==null&&r[k]!==undefined&&Number.isInteger(Number(r[k])));
const gradeComplete=r=>gradeCoreComplete(r)&&r.a_score!==null&&r.a_score!==undefined&&Number.isInteger(Number(r.a_score));
function gradeSummary(r,hideUnapprovedFinal=false){
 if(!r)return null;
 const scores=Object.fromEntries([...gradeParts,["final_score",40]].map(([k])=>[k,r[k]==null?null:Number(r[k])]));
 const subtotal=gbCoreKeys.reduce((sum,k)=>sum+Number(r[k]??0),0);
 const all=gradeComplete(r);
 const finalApproved=r.final_status==="approved"&&all&&Number.isInteger(Number(r.final_score));
 const visibleFinal=!hideUnapprovedFinal||finalApproved;
 const predicted=all?subtotal+Number(r.a_score):null;
 const actual=finalApproved?subtotal+Number(r.final_score):null;
 const shortQuestions=["short1_score","short2_score"];
 const exams=["short_exam1_score","short_exam2_score"];
 return {...scores,final_score:visibleFinal?scores.final_score:null,
  a_plus_points:Number(r.a_plus_points||0),a_minus_points:Number(r.a_minus_points||0),
  a_plus_at_approval:r.a_plus_at_approval==null?null:Number(r.a_plus_at_approval),
  a_minus_at_approval:r.a_minus_at_approval==null?null:Number(r.a_minus_at_approval),
  a_suggested:Math.min(40,Math.max(0,Number(r.a_plus_points||0)-Number(r.a_minus_points||0))),
  coursework:gradeCoreComplete(r)?subtotal:null,
  short_questions:shortQuestions.every(k=>r[k]!=null)?shortQuestions.reduce((s,k)=>s+Number(r[k]),0):null,
  short_exams:exams.every(k=>r[k]!=null)?exams.reduce((s,k)=>s+Number(r[k]),0):null,
  estimated_total:predicted,actual_total:visibleFinal?actual:null,
  difference:visibleFinal&&actual!==null&&predicted!==null?actual-predicted:null,
  provisional_total:subtotal+Number(r.a_score??0),total:predicted,
  max:100,complete:all,prediction_complete:all,
  final_complete:finalApproved,final_status:visibleFinal?r.final_status:"draft",
  status:r.status,updated_at:r.updated_at,approved_at:r.approved_at||null,
  final_approved_at:visibleFinal?r.final_approved_at||null:null,
  final_approved_by:visibleFinal?r.final_approved_by||null:null,
  approved_by:r.approved_by||null,recorded_by:r.recorded_by||null};
}
function validateGradeBody(b){
 const row={};
 for(const [key,max] of gradeParts){
  const val=b[key];if(val===null||val===""||val===undefined){row[key]=null;continue}
  const n=Number(arabicDigits(val));if(!Number.isInteger(n)||n<0||n>max)return null;row[key]=n;
 }
 return row;
}
async function auditGrade(student_id,action,ss,prior_data,new_data){
 const {error}=await db.from("afaq_assessment_audit").insert({
  student_id,action,actor_role:ss.role,actor_username:ss.username,prior_data:prior_data||null,new_data:new_data||null});
 if(error)throw error;
}
async function fetchAssessment(id){
 const {data,error}=await db.from("afaq_student_assessments").select("*").eq("student_id",id).maybeSingle();
 if(error)throw error;return data;
}

async function profile(id,privateNotes=false){
 const {data:s}=await db.from("competition_students").select("student_id,serial_no,class_name,full_name,display_name").eq("student_id",id).maybeSingle();if(!s)return null;
 const [{data:p},{data:n},{data:a}]=await Promise.all([
 db.from("afaq_student_scores").select("*").eq("student_id",id).maybeSingle(),
 db.from("afaq_student_notes").select("category,note,created_at,visible_to_student").eq("student_id",id).order("created_at",{ascending:false}).limit(40),
 db.from("competition_attempts").select("game_id,percent,attempt_no,completed").eq("student_id",id)]);
 const ids=["grade6-numbers-game1","grade6-measurement-game2","grade6-geometry-visual-game3","grade6-numbers-visual-game4"];
 const units=ids.map((game_id,i)=>{const rows=(a||[]).filter(x=>x.game_id===game_id);const done=rows.filter(x=>x.completed&&x.percent!=null);return{unit:i+1,game_id,attempts_used:rows.length,attempts_remaining:Math.max(0,2-rows.length),best:done.length?Math.max(...done.map(x=>+x.percent)):null}});
 const total=units.reduce((sum,x)=>sum+(x.best||0),0);
 const safeStudent=privateNotes?s:{serial_no:s.serial_no,class_name:s.class_name,full_name:s.full_name,display_name:s.display_name};
 const {student_id:internalScoreId,...publicScore}=p||{};
 const fields=p?(privateNotes?p:publicScore):null;
 const scores=fields?{...fields,challenge:Math.max(0,Math.min(50,p.plus_points-p.minus_points)),total:Math.max(0,Math.min(50,p.plus_points-p.minus_points))+p.oral_score+p.written_score+p.homework_score,max:100}:null;
 const current=await fetchAssessment(id);
 const allowed=privateNotes||current?.status==="approved";
 const assessment=allowed?gradeSummary(current,!privateNotes):null;
 const assessment_status=current?.status==="approved"?"approved":current?"pending":"not_started";
 let assessment_events=[];
 if(allowed&&current){
  const {data:rows,error:logErr}=await db.from("afaq_assessment_events")
   .select("kind,category,points,note,created_at").eq("student_id",id)
   .order("created_at",{ascending:false}).limit(100);
  if(logErr)throw logErr;
  assessment_events=rows||[];
 }
 return{student:safeStudent,scores,assessment,assessment_status,assessment_events,notes:(n||[]).filter(x=>privateNotes||x.visible_to_student).map(({visible_to_student,...rest})=>rest),competition:{units,total,max:400,qualified:total>=350}}
}
async function budget(role){const {data:c}=await db.from("afaq_settings").select("value").eq("key","management_weekly_logins").maybeSingle();const limit=Math.max(0,Math.min(30,Number(c?.value??3)));const shift=new Date(Date.now()+4*3600000);const day=(shift.getUTCDay()+6)%7;shift.setUTCDate(shift.getUTCDate()-day);shift.setUTCHours(0,0,0,0);const start=new Date(shift.getTime()-4*3600000).toISOString();const{count,error}=await db.from("afaq_login_events").select("id",{count:"exact",head:true}).eq("role",role).gte("logged_at",start);if(error)throw error;return{used:count||0,limit}}

Deno.serve(async req=>{
 const origin=req.headers.get("origin")||"";if(req.method==="OPTIONS")return new Response("ok",{headers:headers(origin)});
 if(req.method!=="POST")return bad(origin,"method_not_allowed",405);
 if(origin&&!origins.has(origin))return bad(origin,"origin_not_allowed",403);
 try{
 const b=await req.json();const action=clean(b.action,40);
 if(action==="public_content"){const{data,error}=await db.from("afaq_content").select("id,kind,grade,unit,title,body,resource_url,published,updated_at").eq("published",true).order("updated_at",{ascending:false}).limit(200);if(error)throw error;return answer(origin,{ok:true,items:data||[]})}
 if(action==="login"){
 const role=clean(b.role,30),username=clean(b.username,100),grade=g(b.grade)?+b.grade:null,pin=arabicDigits(b.pin);
 if(!/^\d{4,12}$/.test(pin))return bad(origin,"invalid_credentials",401);
 const fp=await sha(role+":"+username+":"+(req.headers.get("cf-connecting-ip")||req.headers.get("x-forwarded-for")||"unknown"));
 const{data:ff}=await db.from("afaq_auth_failures").select("attempts,locked_until").eq("fingerprint",fp).maybeSingle();
 if(ff?.locked_until&&new Date(ff.locked_until)>new Date())return bad(origin,"temporarily_locked",423);
 const p=await verify(role,username,grade,pin);
 if(!p){const n=(ff?.attempts||0)+1;await db.from("afaq_auth_failures").upsert({fingerprint:fp,attempts:n>=5?0:n,locked_until:n>=5?new Date(Date.now()+600000).toISOString():null,updated_at:new Date().toISOString()});return bad(origin,"invalid_credentials",401)}
 if(role==="director"||role==="deputy"){const value=await budget(role);if(value.used>=value.limit)return answer(origin,{ok:false,error:"weekly_limit",...value},429);const{error}=await db.from("afaq_login_events").insert({role,username});if(error)throw error}
 await db.from("afaq_auth_failures").delete().eq("fingerprint",fp);
 const token=b64(crypto.getRandomValues(new Uint8Array(32))).replaceAll("+","-").replaceAll("/","_").replaceAll("=","");
 const expires_at=new Date(Date.now()+21600000).toISOString();
 const{error}=await db.from("afaq_sessions").insert({token_hash:await sha(token),role:p.role,username:p.username,student_id:p.student_id,grade:p.grade,expires_at});if(error)throw error;
 return answer(origin,{ok:true,token,expires_at,user:{role:p.role,username:p.username,grade:p.grade,serial_no:p.serial_no??null,class_name:p.class_name??null}});
 }
 const ss=await session(req);if(!ss)return bad(origin,"unauthorized",401);const role=ss.role;
 if(action==="logout"){await db.from("afaq_sessions").update({revoked_at:new Date().toISOString()}).eq("token_hash",ss.token_hash);return answer(origin,{ok:true})}
 if(action==="me"){
  let serial_no=null;
  let class_name=null;if(role==="student"&&ss.student_id){const{data,error}=await db.from("competition_students").select("serial_no,class_name").eq("student_id",ss.student_id).maybeSingle();if(error)throw error;serial_no=data?.serial_no??null;class_name=data?.class_name??null}
  return answer(origin,{ok:true,user:{role,username:ss.username,grade:ss.grade,serial_no,class_name}});
 }
 
 if(action==="student_change_pin"){
  if(role!=="student"||!ss.student_id)return bad(origin,"forbidden",403);
  const current=arabicDigits(b.current_pin),next=arabicDigits(b.new_pin),confirm=arabicDigits(b.confirm_pin);
  if(!/^\d{4}$/.test(next)||next!==confirm||next===current)return bad(origin,"invalid_new_pin",400);
  if(!/^\d{4}$/.test(current))return bad(origin,"invalid_current_pin",401);
  const{data:entry,error:readError}=await db.from("competition_students")
   .select("student_id,pin_hash,pin_salt,pin_iterations,active").eq("student_id",ss.student_id).maybeSingle();
  if(readError)throw readError;
  if(!entry?.active||!await good(current,entry))return bad(origin,"invalid_current_pin",401);
  const{error:changeError}=await db.from("competition_students")
   .update({...await pinPatch(next),failed_attempts:0,locked_until:null}).eq("student_id",ss.student_id);
  if(changeError)throw changeError;
  // Keep the current authenticated session, revoke other sessions for this student.
  const{error:revokeError}=await db.from("afaq_sessions").update({revoked_at:new Date().toISOString()})
   .eq("role","student").eq("student_id",ss.student_id).neq("token_hash",ss.token_hash)
   .is("revoked_at",null);
  if(revokeError)throw revokeError;
  return answer(origin,{ok:true,message:"pin_updated"});
 }
 if(action==="profile"){if(role==="student")return answer(origin,{ok:true,profile:await profile(ss.student_id)});if(role==="demo")return answer(origin,{ok:true,profile:{student:{display_name:ss.username==="1000"?"الحساب التجريبي الأول":"الحساب التجريبي الثاني",class_name:"الصف "+ss.grade},scores:null,notes:[],competition:null,demo:true}});if(!edit(role))return bad(origin,"forbidden",403);const id=await resolveStudentId(b.student_id,b.class_name);if(!id)return bad(origin,"student_not_found",404);return answer(origin,{ok:true,profile:await profile(id,true)})}
 if(action==="dashboard"){
  if(!staff(role))return bad(origin,"forbidden",403);
  const [{data:s,error:er1},{data:sc,error:er2}]=await Promise.all([
   db.from("competition_students").select("student_id,class_name").eq("active",true),
   db.from("afaq_student_assessments").select("*")]);
  if(er1||er2)throw er1||er2;
  const map=new Map((sc||[]).map(x=>[x.student_id,x]));
  const summary=classNames.map(name=>{
   const students=(s||[]).filter(x=>x.class_name===name),grades=students.map(x=>map.get(x.student_id)).filter(Boolean);
   const approved=grades.filter(x=>x.status==="approved"&&gradeComplete(x));
   const totals=approved.map(x=>gradeSummary(x).total);
   return {class_name:name,count:students.length,graded:approved.length,
    pending:grades.filter(x=>x.status==="draft").length,
    average:totals.length?Math.round(totals.reduce((a,b)=>a+b,0)/totals.length*10)/10:null};
  });
  return answer(origin,{ok:true,summary,total_students:(s||[]).length,
   budget:["director","deputy"].includes(role)?await budget(role):null});
 }
 if(action==="students"){if(!edit(role))return bad(origin,"forbidden",403);const{data,error}=await db.from("competition_students").select("student_id,serial_no,class_name,full_name,display_name,sort_order").eq("active",true).order("class_name").order("serial_no");if(error)throw error;return answer(origin,{ok:true,students:data||[]})}
 if(action==="class_assessments"){
  if(!edit(role))return bad(origin,"forbidden",403);
  const class_name=clean(b.class_name,30);
  if(!classNames.includes(class_name))return bad(origin,"invalid_class_name",400);
  const {data:roster,error:re}=await db.from("competition_students")
   .select("student_id,serial_no,class_name,full_name,display_name")
   .eq("active",true).eq("class_name",class_name).order("serial_no");
  if(re)throw re;
  const ids=(roster||[]).map(x=>x.student_id);
  const {data:allScores,error:se}=ids.length?await db.from("afaq_student_assessments")
   .select("*").in("student_id",ids):{data:[],error:null};
  if(se)throw se;
  const grades=new Map((allScores||[]).map(x=>[x.student_id,x]));
  const students=(roster||[]).map(student=>{
   const record=grades.get(student.student_id);
   const summary=record?gradeSummary(record):null;
   const predictedApproved=!!record&&record.status==="approved"&&gradeComplete(record);
   const actualApproved=predictedApproved&&record.final_status==="approved"&&summary?.final_complete===true;
   return {
    serial_no:student.serial_no,class_name:student.class_name,
    full_name:student.full_name,display_name:student.display_name,
    assessment_status:predictedApproved?"approved":record?"draft":"not_started",
    final_status:actualApproved?"approved":record?.final_score!=null?"draft":"not_started",
    scores:summary?{
     oral_score:summary.oral_score,
     short1_score:summary.short1_score,short2_score:summary.short2_score,
     short_exam1_score:summary.short_exam1_score,short_exam2_score:summary.short_exam2_score,
     written_score:summary.written_score,homework_score:summary.homework_score,
     project_score:summary.project_score,short_questions:summary.short_questions,
     short_exams:summary.short_exams,
     coursework:summary.coursework,
     a_plus_points:summary.a_plus_points,a_minus_points:summary.a_minus_points,
     a_score:summary.a_score,final_score:summary.final_score,
     estimated_total:summary.estimated_total,
     actual_total:actualApproved?summary.actual_total:null,
     difference:actualApproved?summary.difference:null
    }:null
   };
  });
  return answer(origin,{ok:true,class_name,students,count:students.length,
   approved_predictions:students.filter(x=>x.assessment_status==="approved").length,
   approved_finals:students.filter(x=>x.final_status==="approved").length,
   generated_at:new Date().toISOString()});
 }

 if(action==="staff_directory"){
  if(!edit(role))return bad(origin,"forbidden",403);
  const {data,error}=await db.from("afaq_staff_directory")
    .select("id,label,organization,organization_type,phone,whatsapp,email,resource_url,notes,built_in,active,updated_at")
    .eq("active",true).order("organization_type").order("label").limit(400);
  if(error)throw error;return answer(origin,{ok:true,items:data||[]});
 }
 if(action==="save_staff_contact"){
  if(!edit(role))return bad(origin,"forbidden",403);
  const label=clean(b.label,120),organization=clean(b.organization,140),
   organization_type=clean(b.organization_type,20)||"other";
  const phone=arabicDigits(b.phone).replace(/[\s()+-]/g,""),whatsapp=arabicDigits(b.whatsapp).replace(/[\s()+-]/g,"");
  const email=clean(b.email,180).toLowerCase(),resource_url=clean(b.resource_url,600),notes=clean(b.notes,300);
  if(label.length<2||organization.length<2||
   !["school","directorate","ministry","other"].includes(organization_type)||
   (phone&&!/^\d{6,15}$/.test(phone))||(whatsapp&&!/^\d{7,15}$/.test(whatsapp))||
   (email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))||
   (resource_url&&(!/^https:\/\/[a-z0-9.-]+(?:\/|$)/i.test(resource_url)||resource_url.includes("@"))))
   return bad(origin,"invalid_contact",400);
  const vals={label,organization,organization_type,phone:phone||null,whatsapp:whatsapp||null,
    email:email||null,resource_url:resource_url||null,notes:notes||null,
    updated_at:new Date().toISOString()};
  let data,error;
  if(b.id!=null&&b.id!==""){
   const id=Number(b.id);if(!Number.isSafeInteger(id)||id<1)return bad(origin,"invalid_contact",400);
   const {data:before,error:e1}=await db.from("afaq_staff_directory").select("built_in,updated_at")
    .eq("id",id).eq("active",true).maybeSingle();
   if(e1)throw e1;
   if(!before)return bad(origin,"contact_not_found",404);
   if(before.built_in&&role!=="supervisor")return bad(origin,"forbidden",403);
   if(before.updated_at!==b.expected_updated_at)return bad(origin,"record_changed_reload",409);
   ({data,error}=await db.from("afaq_staff_directory").update(vals)
    .eq("id",id).eq("updated_at",before.updated_at).eq("active",true).select("*").maybeSingle());
   if(!error&&!data)return bad(origin,"record_changed_reload",409);
  }else{
   ({data,error}=await db.from("afaq_staff_directory").insert({...vals,created_by:role+":"+ss.username})
    .select("*").single());
  }
  if(error)throw error;return answer(origin,{ok:true,item:data});
 }
 if(action==="archive_staff_contact"){
  if(role!=="supervisor")return bad(origin,"forbidden",403);
  const id=Number(b.id);
  if(!Number.isSafeInteger(id)||id<1)return bad(origin,"invalid_contact",400);
  const {data:existing,error:readErr}=await db.from("afaq_staff_directory")
   .select("built_in,updated_at").eq("id",id).maybeSingle();
  if(readErr)throw readErr;
  if(!existing||existing.built_in)return bad(origin,"cannot_archive_contact",409);
  const {error}=await db.from("afaq_staff_directory").update({active:false,updated_at:new Date().toISOString()})
   .eq("id",id).eq("updated_at",existing.updated_at);
  if(error)throw error;return answer(origin,{ok:true});
 }
 if(action==="teacher_records"){
  if(!edit(role))return bad(origin,"forbidden",403);
  const year=clean(b.academic_year,20)||"2026/2027";
  if(!/^20\d{2}\/20\d{2}$/.test(year))return bad(origin,"invalid_academic_year",400);
  const {data,error}=await db.from("afaq_teacher_records")
   .select("id,record_type,academic_year,semester,unit,lesson,title,body,archived,created_by,updated_by,created_at,updated_at")
   .eq("academic_year",year).eq("archived",false).order("updated_at",{ascending:false}).limit(800);
  if(error)throw error;return answer(origin,{ok:true,items:data||[],academic_year:year});
 }
 if(action==="save_teacher_record"){
  if(!edit(role))return bad(origin,"forbidden",403);
  const record_type=clean(b.record_type,35),
   title=clean(b.title,240),year=clean(b.academic_year,20)||"2026/2027",
   semester=b.semester==null||b.semester===""?null:Number(b.semester),
   unit=clean(b.unit,120)||null,lesson=clean(b.lesson,180)||null;
  const validTypes=["motto","egada_goal","initiative","annual_plan","term_plan","lesson_plan",
    "custom_lesson","resource","exam_resource"];
  const body=b.body;
  if(!validTypes.includes(record_type)||title.length<2||
    !/^20\d{2}\/20\d{2}$/.test(year)||
    (semester!==null&&![1,2].includes(semester))||
    !body||typeof body!=="object"||Array.isArray(body)||
    JSON.stringify(body).length>18000)
    return bad(origin,"invalid_teacher_record",400);
  const now=new Date().toISOString();
  const dataIn={record_type,title,academic_year:year,semester,unit,lesson,body,
   updated_by:role+":"+ss.username,updated_at:now};
  let data,error;
  if(b.id!=null&&b.id!==""){
   const id=Number(b.id);if(!Number.isSafeInteger(id)||id<1)return bad(origin,"invalid_teacher_record",400);
   const {data:before,error:e1}=await db.from("afaq_teacher_records").select("*")
    .eq("id",id).eq("archived",false).maybeSingle();
   if(e1)throw e1;
   if(!before)return bad(origin,"record_not_found",404);
   if(before.updated_at!==b.expected_updated_at)return bad(origin,"record_changed_reload",409);
   const {error:backupError}=await db.from("afaq_teacher_record_versions")
    .insert({record_id:id,content:before,changed_by:role+":"+ss.username});
   if(backupError)throw backupError;
   ({data,error}=await db.from("afaq_teacher_records").update(dataIn)
    .eq("id",id).eq("updated_at",before.updated_at).eq("archived",false)
    .select("*").maybeSingle());
   if(!error&&!data)return bad(origin,"record_changed_reload",409);
  }else{
   ({data,error}=await db.from("afaq_teacher_records")
    .insert({...dataIn,created_by:role+":"+ss.username}).select("*").single());
  }
  if(error)throw error;return answer(origin,{ok:true,item:data});
 }
 if(action==="archive_teacher_record"){
  if(role!=="supervisor")return bad(origin,"forbidden",403);
  const id=Number(b.id);if(!Number.isSafeInteger(id)||id<1)return bad(origin,"invalid_teacher_record",400);
  const {data:before,error:e1}=await db.from("afaq_teacher_records").select("*").eq("id",id).maybeSingle();
  if(e1)throw e1;
  if(!before)return bad(origin,"record_not_found",404);
  if(before.updated_at!==b.expected_updated_at)return bad(origin,"record_changed_reload",409);
  const {error:backupError}=await db.from("afaq_teacher_record_versions")
   .insert({record_id:id,content:before,changed_by:role+":"+ss.username});
  if(backupError)throw backupError;
  const {data,error}=await db.from("afaq_teacher_records")
   .update({archived:true,updated_at:new Date().toISOString(),updated_by:role+":"+ss.username})
   .eq("id",id).eq("updated_at",before.updated_at).select("id").maybeSingle();
  if(error)throw error;if(!data)return bad(origin,"record_changed_reload",409);
  return answer(origin,{ok:true});
 }
 if(action==="teacher_record_history"){
  if(!edit(role))return bad(origin,"forbidden",403);
  const id=Number(b.id);if(!Number.isSafeInteger(id)||id<1)return bad(origin,"invalid_teacher_record",400);
  const {data,error}=await db.from("afaq_teacher_record_versions")
   .select("id,changed_at,changed_by,content").eq("record_id",id)
   .order("changed_at",{ascending:false}).limit(40);
  if(error)throw error;return answer(origin,{ok:true,items:data||[]});
 }

 if(action==="public_roster"){
  if(!staff(role))return bad(origin,"forbidden",403);
  const [{data:rows,error:e1},{data:points,error:e2}]=await Promise.all([
   db.from("competition_students").select("student_id,serial_no,class_name,full_name,display_name").eq("active",true).order("class_name").order("serial_no"),
   db.from("afaq_student_assessments").select("*")]);
  if(e1||e2)throw e1||e2;
  const byId=new Map((points||[]).map(x=>[x.student_id,x]));
  const students=(rows||[]).map(x=>{
   const p=byId.get(x.student_id),approved=p?.status==="approved"&&gradeComplete(p);
   const summ=approved?gradeSummary(p):null;
   return {serial_no:x.serial_no,class_name:x.class_name,full_name:x.full_name,
    display_name:x.display_name,total:approved?summ.estimated_total:null,
    actual_total:approved&&p.final_status==="approved"?summ.actual_total:null,
    final_status:approved&&p.final_status==="approved"?"approved":"draft",
    status:approved?"approved":p?"draft":"not_started"};
  });
  return answer(origin,{ok:true,students});
 }
 if(action==="save_score")return bad(origin,"legacy_grading_replaced_use_assessment",409);
 if(action==="record_a_event"){
  if(!edit(role))return bad(origin,"forbidden",403);
  const id=await resolveStudentId(b.student_id,b.class_name);
  if(!id)return bad(origin,"student_not_found",404);
  const kind=clean(b.kind,10),category=clean(b.category,80),note=clean(b.note,400);
  const plus=["دائرة الضوء","إجابة مميزة","المعلم الصغير","الحل السريع","مسابقة صفية","مشاركة إيجابية","مبادرة أخرى","ترحيل من الدفتر"];
  const minus=["إخفاق في مسابقة","التحدث أثناء الشرح","الإهمال","سلوك غير مناسب داخل الصف","سلوك غير مناسب داخل المدرسة","مخالفة أخرى","ترحيل من الدفتر"];
  const points=Number(arabicDigits(b.points));
  if(!((kind==="plus"&&plus.includes(category))||(kind==="minus"&&minus.includes(category)))||
    !Number.isInteger(points)||points<1||points>20)return bad(origin,"invalid_classroom_event",400);
  const previous=await fetchAssessment(id);
  if((previous?.updated_at||null)!==(b.expected_updated_at||null))return bad(origin,"assessment_changed_reload",409);
  const {data,error}=await db.rpc("afaq_record_classroom_event",{
   p_student_id:id,p_kind:kind,p_category:category,p_points:points,p_note:note||null,
   p_actor_role:role,p_actor_username:ss.username,
   p_expected_updated_at:previous?.updated_at||null
  });
  if(error){if(/reopen_approved_first|assessment_changed_reload|classroom_points_limit/.test(error.message))
    return bad(origin,error.message.includes("reopen_approved_first")?"reopen_approved_first":error.message.includes("assessment_changed_reload")?"assessment_changed_reload":"invalid_classroom_event",409);
   throw error;
  }
  return answer(origin,{ok:true,assessment:gradeSummary(data),profile:await profile(id,true)});
 }
 if(action==="save_assessment"){
  if(!edit(role))return bad(origin,"forbidden",403);
  const id=await resolveStudentId(b.student_id,b.class_name);
  if(!id)return bad(origin,"student_not_found",404);
  const fields=validateGradeBody(b);if(!fields)return bad(origin,"invalid_assessment",400);
  const previous=await fetchAssessment(id);
  if(previous?.status==="approved")return bad(origin,"reopen_approved_first",409);
  if((previous?.updated_at||null)!==(b.expected_updated_at||null))return bad(origin,"assessment_changed_reload",409);
  const now=new Date().toISOString();
  const row={...fields,a_plus_points:previous?.a_plus_points||0,a_minus_points:previous?.a_minus_points||0,student_id:id,status:"draft",approved_by:null,approved_at:null,
   recorded_by:role+":"+ss.username,updated_at:now};
  let data,error;
  if(previous){
   ({data,error}=await db.from("afaq_student_assessments").update(row).eq("student_id",id)
     .eq("updated_at",previous.updated_at).select("*").maybeSingle());
   if(!error&&!data)return bad(origin,"assessment_changed_reload",409);
  }else{
   ({data,error}=await db.from("afaq_student_assessments").insert(row).select("*").single());
  }
  if(error)throw error;
  await auditGrade(id,"save_draft",ss,previous,data);
  return answer(origin,{ok:true,assessment:gradeSummary(data),profile:await profile(id,true)});
 }
 if(action==="approve_assessment"||action==="reopen_assessment"){
  if(role!=="supervisor")return bad(origin,"forbidden",403);
  const id=await resolveStudentId(b.student_id,b.class_name);
  if(!id)return bad(origin,"student_not_found",404);
  const previous=await fetchAssessment(id);
  if(!previous)return bad(origin,"assessment_not_found",404);
  if((previous.updated_at||null)!==(b.expected_updated_at||null))return bad(origin,"assessment_changed_reload",409);
  if(action==="approve_assessment"){
   if(previous.status!=="draft")return bad(origin,"already_approved",409);
   if(!gradeComplete(previous))return bad(origin,"assessment_incomplete",409);
  }else {
   if(previous.status!=="approved")return bad(origin,"not_approved",409);
   if(previous.final_status==="approved")return bad(origin,"reopen_final_first",409);
  }
  const approve=action==="approve_assessment";
  const updates={status:approve?"approved":"draft",
   approved_by:approve?ss.username:null,
   approved_at:approve?new Date().toISOString():null,
   a_plus_at_approval:approve?previous.a_plus_points:null,
   a_minus_at_approval:approve?previous.a_minus_points:null,
   updated_at:new Date().toISOString()};
  const {data,error}=await db.from("afaq_student_assessments").update(updates)
   .eq("student_id",id).eq("updated_at",previous.updated_at)
   .eq("status",approve?"draft":"approved").select("*").maybeSingle();
  if(error)throw error;
  if(!data)return bad(origin,"assessment_changed_reload",409);
  await auditGrade(id,approve?"approve":"reopen",ss,previous,data);
  return answer(origin,{ok:true,assessment:gradeSummary(data),profile:await profile(id,true)});
 }
 if(action==="save_final_score"){
  if(!edit(role))return bad(origin,"forbidden",403);
  const id=await resolveStudentId(b.student_id,b.class_name);
  if(!id)return bad(origin,"student_not_found",404);
  const previous=await fetchAssessment(id);
  if(!previous)return bad(origin,"assessment_not_found",404);
  if(previous.final_status==="approved")return bad(origin,"reopen_final_first",409);
  if((previous.updated_at||null)!==(b.expected_updated_at||null))return bad(origin,"assessment_changed_reload",409);
  const score=b.final_score==null||b.final_score===""?null:Number(arabicDigits(b.final_score));
  if(score!==null&&(!Number.isInteger(score)||score<0||score>40))return bad(origin,"invalid_final_score",400);
  const {data,error}=await db.from("afaq_student_assessments")
    .update({final_score:score,final_status:"draft",
      final_approved_by:null,final_approved_at:null,updated_at:new Date().toISOString(),
      recorded_by:role+":"+ss.username})
    .eq("student_id",id).eq("updated_at",previous.updated_at).select("*").maybeSingle();
  if(error)throw error;if(!data)return bad(origin,"assessment_changed_reload",409);
  await auditGrade(id,"save_final",ss,previous,data);
  return answer(origin,{ok:true,assessment:gradeSummary(data),profile:await profile(id,true)});
 }
 if(action==="approve_final_score"||action==="reopen_final_score"){
  if(role!=="supervisor")return bad(origin,"forbidden",403);
  const id=await resolveStudentId(b.student_id,b.class_name);
  if(!id)return bad(origin,"student_not_found",404);
  const previous=await fetchAssessment(id);
  if(!previous)return bad(origin,"assessment_not_found",404);
  if((previous.updated_at||null)!==(b.expected_updated_at||null))return bad(origin,"assessment_changed_reload",409);
  const approve=action==="approve_final_score";
  if(approve){
   if(previous.status!=="approved"||!gradeComplete(previous))return bad(origin,"prediction_not_approved",409);
   if(previous.final_status==="approved")return bad(origin,"already_approved",409);
   if(previous.final_score===null||previous.final_score===undefined)return bad(origin,"final_score_required",409);
  }else if(previous.final_status!=="approved")return bad(origin,"not_approved",409);
  const changes={final_status:approve?"approved":"draft",final_approved_by:approve?ss.username:null,
    final_approved_at:approve?new Date().toISOString():null,updated_at:new Date().toISOString()};
  const {data,error}=await db.from("afaq_student_assessments").update(changes)
    .eq("student_id",id).eq("updated_at",previous.updated_at)
    .eq("final_status",approve?"draft":"approved").select("*").maybeSingle();
  if(error)throw error;if(!data)return bad(origin,"assessment_changed_reload",409);
  await auditGrade(id,approve?"approve_final":"reopen_final",ss,previous,data);
  return answer(origin,{ok:true,assessment:gradeSummary(data),profile:await profile(id,true)});
 }
 if(action==="assessment_audit"){
  if(role!=="supervisor")return bad(origin,"forbidden",403);
  const id=await resolveStudentId(b.student_id,b.class_name);
  if(!id)return bad(origin,"student_not_found",404);
  const {data,error}=await db.from("afaq_assessment_audit")
   .select("id,action,actor_role,actor_username,created_at")
   .eq("student_id",id).order("created_at",{ascending:false}).limit(40);
  if(error)throw error;return answer(origin,{ok:true,events:data||[]});
 }
 if(action==="add_note"){if(!edit(role))return bad(origin,"forbidden",403);const note=clean(b.note,700),category=clean(b.category,35);if(note.length<2||!["positive","needs_improvement","academic","behavior"].includes(category))return bad(origin,"invalid_note");const{error}=await db.from("afaq_student_notes").insert({student_id:await resolveStudentId(b.student_id,b.class_name),note,category,visible_to_student:b.visible_to_student!==false,created_by:role});if(error)throw error;return answer(origin,{ok:true})}
 if(action==="content_list"){if(!staff(role))return bad(origin,"forbidden",403);const{data,error}=await db.from("afaq_content").select("id,kind,grade,unit,title,body,resource_url,published,updated_at").order("updated_at",{ascending:false}).limit(250);if(error)throw error;return answer(origin,{ok:true,items:data||[]})}
 if(action==="save_content"){if(role!=="supervisor")return bad(origin,"forbidden",403);const kind=clean(b.kind,30),title=clean(b.title,180),url=clean(b.resource_url,500);if(!["lesson","activity","worksheet","short1","short2","final","project","library","initiative","game","contest","announcement","excellence","parent","staff"].includes(kind)||title.length<2||(url&&!url.startsWith("https://")))return bad(origin,"invalid_content");const row={kind,title,grade:g(b.grade)?+b.grade:null,unit:clean(b.unit,150),body:clean(b.body,8000),resource_url:url||null,published:b.published===true,updated_at:new Date().toISOString()};if(b.id)row.id=clean(b.id,50);const{data,error}=await db.from("afaq_content").upsert(row).select("id").single();if(error)throw error;return answer(origin,{ok:true,id:data.id})}
 if(action==="message"){if(role==="demo")return bad(origin,"demo_read_only",403);const kind=clean(b.kind,25),sender=clean(b.sender,100),body=clean(b.body,2000);if(!["complaint","suggestion"].includes(kind)||sender.length<2||body.length<5)return bad(origin,"invalid_message");const{error}=await db.from("afaq_messages").insert({kind,sender,body});if(error)throw error;return answer(origin,{ok:true})}
 if(action==="messages"){if(role!=="supervisor")return bad(origin,"forbidden",403);const{data,error}=await db.from("afaq_messages").select("*").order("created_at",{ascending:false}).limit(100);if(error)throw error;return answer(origin,{ok:true,messages:data||[]})}
 if(action==="management_limit"){if(role!=="supervisor"||!Number.isInteger(+b.limit)||+b.limit<0||+b.limit>30)return bad(origin,"forbidden",403);const{error}=await db.from("afaq_settings").upsert({key:"management_weekly_logins",value:+b.limit,updated_at:new Date().toISOString()});if(error)throw error;return answer(origin,{ok:true,limit:+b.limit})}
 if(action==="change_password"){
 if(role!=="supervisor")return bad(origin,"forbidden",403);
 const target=clean(b.target_role,30),username=clean(b.username,100),grade=g(b.grade)?+b.grade:null,n=clean(b.new_pin,20),confirm=clean(b.confirm_pin,20);
 if(n!==confirm||!/^\d{4,12}$/.test(n)||!await verify("supervisor","",null,clean(b.current_pin,20)))return bad(origin,"invalid_current_pin",401);
 if(target==="supervisor"){if(!/^\d{8}$/.test(n))return bad(origin,"invalid_new_pin");const{error}=await db.from("competition_teacher_keys").update({pin_hash:await sha(n)}).eq("pin_hash",await sha(clean(b.current_pin,20)));if(error)throw error}
 else if(target==="student"){if(!/^\d{4}$/.test(n))return bad(origin,"invalid_new_pin");const id=await resolveStudentId(username,b.class_name);if(!id)return bad(origin,"student_not_found",404);const{error}=await db.from("competition_students").update({...await pinPatch(n),failed_attempts:0,locked_until:null}).eq("student_id",id);if(error)throw error}
 else if(["director","deputy","supervisor_assistant","demo"].includes(target)){const query=db.from("afaq_accounts").update(await pinPatch(n)).eq("role",target).eq("username",username);if(target==="demo")query.eq("grade",grade);else query.is("grade",null);const{error}=await query;if(error)throw error}
 else return bad(origin,"invalid_target");
 let q=db.from("afaq_sessions").update({revoked_at:new Date().toISOString()}).eq("role",target);if(target==="student")q=q.eq("student_id",await resolveStudentId(username,b.class_name));else if(target!=="supervisor")q=q.eq("username",username);await q;return answer(origin,{ok:true});
 }
 return bad(origin,"unknown_action");
 }catch(e){console.error("afaq-api",e?.message||"unknown");return bad(origin,"server_error",500)}
});
