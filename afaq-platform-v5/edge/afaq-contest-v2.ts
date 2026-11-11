import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.95.0";
const URL=Deno.env.get("SUPABASE_URL")||"";
let KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
try{KEY=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}").default||KEY}catch{}
const db=createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const ALLOWED_ORIGINS=new Set(["https://afaqmaths.github.io","http://localhost:8000","http://127.0.0.1:8000","http://localhost:5500","http://127.0.0.1:5500"]);
const hdr=(o:string)=>({"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":ALLOWED_ORIGINS.has(o)?o:"https://afaqmaths.github.io","Access-Control-Allow-Headers":"authorization,content-type,x-client-info","Access-Control-Allow-Methods":"POST, OPTIONS","Cache-Control":"no-store",Vary:"Origin"});
const response=(o:string,obj:any,status=200)=>new Response(JSON.stringify(obj),{status,headers:hdr(o)});
const fail=(o:string,error:string,status=400)=>response(o,{ok:false,error},status);
const tiny=(v:unknown,n=200)=>String(v??"").trim().slice(0,n);
const roleMap:Record<string,string>={student:"C",demo:"C",director:"D",deputy:"D",supervisor:"E",supervisor_assistant:"F"};
const staff=(role:string)=>["supervisor","supervisor_assistant","director","deputy"].includes(role);
const officialModel=(m:string)=>["A","B"].includes(m);
const TEST_PROFILES:Record<string,string>={"1":"AFAQ-CONTEST-TEST-01","2":"AFAQ-CONTEST-TEST-02"};
const TEST_IDS=new Set(Object.values(TEST_PROFILES));
const testerName=(n:string)=>n==="1"?"المشرف التجريبي الأول":"المشرف التجريبي الثاني";
const allowedGrade=(g:number)=>[5,6,7,8].includes(g);
const totalUnits=(g:number)=>g===6?4:2;
const valid=(g:number,s:number)=>allowedGrade(g)&&Number.isInteger(s)&&s>=1&&s<=totalUnits(g);
const secondsForStage=(stage:number)=>({1:25,2:20,3:17,4:720,5:600} as any)[stage]||10;
const fullQuestionCount=38;
const neutralTime=()=>new Date().toISOString();
async function sha(s:string){const a=new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)));return [...a].map(x=>x.toString(16).padStart(2,"0")).join("")}
async function sess(req:Request){
 const token=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
 if(token.length<35||token.length>128)return null;
 const {data,error}=await db.from("afaq_sessions").select("token_hash,role,username,student_id,grade,expires_at,revoked_at").eq("token_hash",await sha(token)).maybeSingle();
 if(error)throw error;
 return data&&!data.revoked_at&&new Date(data.expires_at).getTime()>Date.now()?data:null;
}
const publicQuestion=(q:any)=>({id:q.id,ordinal:q.ordinal,stage:q.stage,question_kind:q.question_kind||"choice",prompt:q.prompt,options:q.question_kind==="complex"?[]:q.options,parts:q.question_kind==="complex"?(q.parts||[]).map((p:any)=>({type:p.type,text:p.text,choices:p.type==="choice"?p.choices:undefined})):[],objective:q.objective,visual_svg:q.visual_svg||'',visual_caption:q.visual_caption||''});
async function questions(g:number,s:number,m:string){
 const {data,error}=await db.from("afaq_v2_questions")
  .select("id,ordinal,stage,question_kind,prompt,options,answer_index,parts,objective,explanation,visual_svg,visual_caption")
  .eq("grade",g).eq("section",s).eq("model",m).order("ordinal");
 if(error)throw error;return data||[];
}
async function isPublished(g:number,s:number,m:string){const {data,error}=await db.from("afaq_v2_models").select("published").eq("grade",g).eq("section",s).eq("model",m).maybeSingle();if(error)throw error;return data?.published===true}
function bankValid(qs:any[]){return qs.length===fullQuestionCount&&qs.every((q,i)=>q.ordinal===i+1&&q.stage===(i<30?Math.floor(i/10)+1:i<34?4:5)&&
 (i<30?q.question_kind!=="complex":q.question_kind==="complex"&&Array.isArray(q.parts)&&[2,3].includes(q.parts.length)))}
function numberText(v:any){return String(v??"").trim().replace(/[٠-٩۰-۹]/g,c=>{let i="٠١٢٣٤٥٦٧٨٩".indexOf(c);return String(i>=0?i:"۰۱۲۳۴۵۶۷۸۹".indexOf(c))}).replace(/[٫]/g,".").replace(/[٬]/g,"").replace(/\s/g,"")}
function normalizeResponse(q:any,response:any){
 if(q.question_kind==="complex"){
  if(!Array.isArray(response))return null;
  return q.parts.map((p:any,i:number)=>p.type==="choice"?tiny(response[i],150):numberText(response[i]).slice(0,60));
 }
 return Number.isInteger(response)&&response>=0&&response<=3?response:null;
}
function pointsFor(q:any,answer:any){
 if(answer===null||answer===undefined)return 0;
 if(q.question_kind!=="complex")return answer===q.answer_index?1:0;
 if(!Array.isArray(answer))return 0;
 return (q.parts||[]).reduce((sum:number,part:any,index:number)=>{
  const received=answer[index];
  if(part.type==="choice")return sum+(String(received??"")===String(part.answer)?1:0);
  const n=Number(numberText(received));const expected=Number(part.answer);
  return sum+(numberText(received)!==""&&Number.isFinite(n)&&Number.isFinite(expected)&&Math.abs(n-expected)<1e-9?1:0);
 },0);
}
function feedbackFor(q:any,value:any){
 const answer=normalizeResponse(q,value),earned=pointsFor(q,answer);
 const max=q.question_kind==="complex"?(q.parts||[]).length:1;
 const correct=q.question_kind==="complex"?(q.parts||[]).map((p:any)=>p.displayAnswer??String(p.answer)):q.options[q.answer_index];
 return {earned,max,correct:earned===max,correct_answer:correct,explanation:tiny(q.explanation,250),unanswered:value===null||value===undefined};
}
function tally(qs:any[],answers:Record<string,any>){
 const raw=qs.reduce((sum,q)=>sum+pointsFor(q,answers?.[q.id]),0);
 return {raw_score:raw,score:Math.min(100,raw*2),correct_count:raw,total_points:50};
}
async function listAttempts(id:string){
 const {data,error}=await db.from("afaq_v2_attempts").select("id,section,attempt_no,model,status,score,raw_score,correct_count,started_at,ended_at")
 .eq("student_id",id).order("started_at");
 if(error)throw error;return data||[];
}
async function report(id:string){
 const attempts=await listAttempts(id);
 const parts=[1,2,3,4].map(section=>{
  const records=attempts.filter(a=>a.section===section);
  const submitted=records.filter(a=>["submitted","expired"].includes(a.status));
  const best=submitted.length?Math.max(...submitted.map(a=>a.score??0)):null;
  const done=submitted.some(a=>a.status==="submitted");
  return {section,best,finished:done,attempts_used:records.length,attempts_remaining:Math.max(0,2-records.length),records:records.map(a=>({attempt_no:a.attempt_no,status:a.status,score:a.score,started_at:a.started_at}))};
 });
 const total=parts.reduce((sum,x)=>sum+(x.best||0),0);
 const completed_units=parts.filter(x=>x.finished).length;
 const needed=Math.max(0,350-total);
 return {parts,total,max:400,qualified:completed_units===4&&total>=350,threshold:350,points_needed:needed,completed_units,total_units:4,attempts_remaining:parts.reduce((sum,x)=>sum+x.attempts_remaining,0)};
}
async function finishAttempt(a:any,answerMap:Record<string,any>,qs:any[]){
 const computed=tally(qs,answerMap),expired=Object.keys(answerMap||{}).length===0;
 const {data, error}=await db.from("afaq_v2_attempts").update({status:expired?"expired":"submitted",answers:answerMap,raw_score:computed.raw_score,score:computed.score,correct_count:computed.correct_count,ended_at:neutralTime(),current_index:fullQuestionCount}).eq("id",a.id).eq("status","in_progress").eq("current_index",a.current_index||0).select("id");
 if(error)throw error;
 if(!data?.length)return null;
 return {raw_score:computed.raw_score,score:computed.score,correct:computed.correct_count,total:50,expired};
}
function modelFor(role:string){return roleMap[role]||null}
function gradeAccess(u:any,g:number){return staff(u.role)||Number(player.grade)===g}
function cleanAnswers(payload:any,qs:any[]){
 const result:Record<string,any>={};const given=payload&&typeof payload==="object"&&!Array.isArray(payload)?payload:{};
 for(const q of qs)result[q.id]=normalizeResponse(q,given[q.id]);
 return result;
}
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response("ok",{headers:hdr(origin)});
 if(req.method!=="POST")return fail(origin,"method_not_allowed",405);
 if(origin&&!ALLOWED_ORIGINS.has(origin))return fail(origin,"origin_not_allowed",403);
 try{
  const b=await req.json();const action=tiny(b.action,50);
  if(action==="catalog"){
   const {data,error}=await db.from("afaq_v2_models").select("grade,section,model,published").order("grade");
   if(error)throw error;
   return response(origin,{ok:true,models:data||[]});
  }
  const u=await sess(req);
  if(!u)return fail(origin,"unauthorized",401);
  const testerProfile=tiny(b.tester_profile,2);
  if(testerProfile&&(!TEST_PROFILES[testerProfile]||u.role!=="supervisor"))
   return fail(origin,"forbidden_tester_profile",403);
  const testerId=testerProfile?TEST_PROFILES[testerProfile]:null;
  const player=testerId?{...u,role:"student",student_id:testerId,grade:6,username:testerName(testerProfile)}:u;
  const role=player.role,g=Number(b.grade??player.grade),section=Number(b.section);
  if(action==="contest_visit"){
   if(role!=="student"||!player.student_id)return fail(origin,"forbidden",403);
   const {error}=await db.from("afaq_v2_contest_visits").upsert({
     student_id:player.student_id,session_hash:u.token_hash
   },{onConflict:"student_id,session_hash",ignoreDuplicates:true});
   if(error)throw error;
   return response(origin,{ok:true});
  }
  if(action==="my_certificates"){
    if(role!=="student"||!player.student_id)return fail(origin,"forbidden",403);
    const {data:finished,error:readError}=await db.from("afaq_v2_attempts")
      .select("id,grade,section,attempt_no,model,status,answers,raw_score,score,ended_at")
      .eq("student_id",player.student_id).in("status",["submitted","expired"])
      .order("ended_at",{ascending:false}).limit(16);
    if(readError)throw readError;
    const certificates:any[]=[];
    for(const a of finished||[]){
      if(Number(a.grade)!==6||!officialModel(a.model)||!valid(Number(a.grade),Number(a.section)))continue;
      const qs=await questions(Number(a.grade),Number(a.section),String(a.model));
      if(!bankValid(qs))continue;
      const stage_scores=[1,2,3,4,5].map(n=>{
        const group=qs.filter(q=>q.stage===n);
        const earned=group.reduce((sum,q)=>sum+pointsFor(q,(a.answers||{})[q.id]),0);
        return {stage:n,earned,max:10,percent:Math.round(earned*10)};
      });
      certificates.push({
        id:a.id,grade:a.grade,section:a.section,attempt_no:a.attempt_no,model:a.model,
        status:a.status,raw_score:a.raw_score,score:a.score,ended_at:a.ended_at,stage_scores
      });
    }
    return response(origin,{ok:true,certificates,report:await report(player.student_id)});
  }
  if(action==="my_results"){
   if(role==="student")return response(origin,{ok:true,report:await report(player.student_id)});
   if(role==="demo")return response(origin,{ok:true,demo:true,report:null});
   return fail(origin,"forbidden",403);
  }
  if(action==="training"||action==="check_training"||action==="training_feedback"){
   if(!valid(g,section)||!gradeAccess(u,g))return fail(origin,"forbidden",403);
   const model=modelFor(role);if(!model)return fail(origin,"forbidden",403);
   const qs=await questions(g,section,model);
   if(!bankValid(qs)||!await isPublished(g,section,model))return fail(origin,"training_unavailable",404);
   if(action==="training")return response(origin,{ok:true,training:true,grade:g,section,role,stage_times:[25,20,17,720,600],raw_max:50,points_max:100,questions:qs.map(publicQuestion)});
   if(action==="training_feedback"){
    const ordinal=Number(b.ordinal);
    if(!Number.isInteger(ordinal)||ordinal<1||ordinal>38)return fail(origin,"invalid_question",400);
    return response(origin,{ok:true,feedback:feedbackFor(qs[ordinal-1],b.answer)});
   }
   const normalized=cleanAnswers(b.answers,qs);
   const result=tally(qs,normalized);
   return response(origin,{ok:true,training:true,...result,percent:result.score,correct:result.correct_count,total:50,
    section_points:g===6?result.score:result.raw_score/2,
    details:qs.map(q=>({id:q.id,kind:q.question_kind,earned:pointsFor(q,normalized[q.id]),max:q.question_kind==="complex"?q.parts.length:1,explanation:q.explanation,
     correct:q.question_kind==="complex"?q.parts.map((p:any)=>p.displayAnswer||p.answer):q.answer_index}))});
  }
  if(action==="start"){
   if(role!=="student"||Number(player.grade)!==6||g!==6||!valid(g,section))return fail(origin,"official_requires_individual_student_account",403);
   const current=await listAttempts(player.student_id);
   const inUnit=current.filter(a=>a.section===section);
   const running=inUnit.find(a=>a.status==="in_progress");
   if(running){
    const {data:live,error}=await db.from("afaq_v2_attempts")
     .select("id,model,current_index,question_started_at,stage_started_at,stage_number,started_at,answers,awaiting_stage_start")
     .eq("id",running.id).maybeSingle();
    if(error)throw error;
    if(live){
     const qs=await questions(g,section,live.model);
     if(!bankValid(qs))return fail(origin,"question_bank_incomplete",409);
     if(live.current_index<fullQuestionCount){
      const currentQ=qs[live.current_index];
      if(live.awaiting_stage_start)return response(origin,{ok:true,resumed:true,stage_ready:true,attempt_id:live.id,attempt_no:running.attempt_no,index:live.current_index,stage_number:live.stage_number});
      return response(origin,{ok:true,attempt_id:live.id,attempt_no:running.attempt_no,resumed:true,
       index:live.current_index,question:publicQuestion(currentQ),question_started_at:live.question_started_at,stage_started_at:live.stage_started_at,
       stage_number:live.stage_number,time:secondsForStage(live.stage_number),total_questions:qs.length});
     }
    }
    return fail(origin,"attempt_incomplete_contact_supervisor",409);
   }
   if(inUnit.length>=2)return fail(origin,"attempt_limit",409);
   if(section>1){
    const before=current.filter(a=>a.section===section-1);
    if(!before.some(a=>a.status==="submitted"))return fail(origin,"previous_section_required",403);
    const first=Math.min(...before.map(a=>new Date(a.started_at).getTime()));
    if(Date.now()-first<7*86400000)return fail(origin,"weekly_locked",403);
   }
   const attempt_no=inUnit.length+1,model=attempt_no===1?"A":"B";
   if(!await isPublished(g,section,model))return fail(origin,"official_model_not_approved",403);
   const qs=await questions(g,section,model);
   if(!bankValid(qs))return fail(origin,"question_bank_incomplete",409);
   const started=neutralTime();
   const {data:a,error}=await db.from("afaq_v2_attempts").insert({
    student_id:player.student_id,grade:6,section,attempt_no,model,status:"in_progress",
    started_at:started,question_started_at:started,stage_started_at:started,stage_number:1,current_index:0,answers:{}
   }).select("id").single();
   if(error){if(error.code==="23505")return fail(origin,"simultaneous_attempt_retry",409);throw error}
   return response(origin,{ok:true,attempt_id:a.id,attempt_no,index:0,question:publicQuestion(qs[0]),
    question_started_at:started,stage_started_at:started,stage_number:1,time:25,total_questions:qs.length});
  }
  if(action==="begin_stage"){
   if(role!=="student"||!player.student_id)return fail(origin,"forbidden",403);
   const id=tiny(b.attempt_id,50);
   const {data:a,error}=await db.from("afaq_v2_attempts")
    .select("id,grade,section,model,current_index,stage_number,awaiting_stage_start,status")
    .eq("id",id).eq("student_id",player.student_id).maybeSingle();
   if(error)throw error;
   if(!a||a.status!=="in_progress"||!a.awaiting_stage_start)return fail(origin,"stage_not_ready",409);
   const qs=await questions(a.grade,a.section,a.model);
   if(!bankValid(qs)||!qs[a.current_index]||qs[a.current_index].stage!==a.stage_number)return fail(origin,"question_bank_incomplete",409);
   const clock=neutralTime();
   const {data:changed,error:writeErr}=await db.from("afaq_v2_attempts")
    .update({awaiting_stage_start:false,question_started_at:clock,stage_started_at:clock})
    .eq("id",a.id).eq("awaiting_stage_start",true).eq("status","in_progress")
    .eq("current_index",a.current_index).eq("stage_number",a.stage_number).select("id");
   if(writeErr)throw writeErr;
   if(!changed?.length)return fail(origin,"stage_not_ready",409);
   return response(origin,{ok:true,finished:false,index:a.current_index,question:publicQuestion(qs[a.current_index]),stage_number:a.stage_number,
    question_started_at:clock,stage_started_at:clock,time:secondsForStage(a.stage_number)});
  }
  if(action==="answer"||action==="skip_stage"||action==="submit"){
   if(role!=="student"||!player.student_id)return fail(origin,"forbidden",403);
   const id=tiny(b.attempt_id,50);
   const {data:a,error}=await db.from("afaq_v2_attempts")
    .select("id,student_id,grade,section,model,status,answers,current_index,question_started_at,stage_started_at,stage_number,started_at,score,awaiting_stage_start")
    .eq("id",id).eq("student_id",player.student_id).maybeSingle();
   if(error)throw error;if(!a)return fail(origin,"attempt_not_found",404);
   if(a.status!=="in_progress")return response(origin,{ok:true,finished:true,score:a.score,report:await report(player.student_id)});
   const qs=await questions(a.grade,a.section,a.model);
   if(!bankValid(qs))return fail(origin,"question_bank_incomplete",409);
   let index=a.current_index||0;
   const previous={...(a.answers||{})};
   let justCompletedFeedback:any=null;
   if(action==="submit"){
    const finished=await finishAttempt(a,previous,qs);
    if(!finished)return fail(origin,"already_submitted",409);
    return response(origin,{ok:true,finished:true,...finished,report:await report(player.student_id)});
   }
   if(index>=qs.length)return fail(origin,"already_submitted",409);
   if(a.awaiting_stage_start)return fail(origin,"stage_start_required",409);
   const now=Date.now(),currentQ=qs[index],currentStage=currentQ.stage;
   const qTime=new Date(a.question_started_at||a.started_at).getTime();
   const stageTime=new Date(a.stage_started_at||a.started_at).getTime();
   const qDeadline=(currentStage<=3?secondsForStage(currentStage)*1000:Infinity);
   const stageDeadline=(currentStage>=4?secondsForStage(currentStage)*1000:Infinity);
   const allowedTime=now-qTime>=-750&&now-qTime<=qDeadline+750&&now-stageTime<=stageDeadline+750;
   const requestedIndex=Number(b.index);
   if(!Number.isInteger(requestedIndex)||requestedIndex!==index)return fail(origin,"question_sequence_changed",409);
   if(action==="skip_stage"){
    while(index<qs.length&&qs[index].stage===currentStage){previous[qs[index].id]=null;index++}
   }else{
    previous[currentQ.id]=allowedTime?normalizeResponse(currentQ,b.answer):null;
    justCompletedFeedback=feedbackFor(currentQ,previous[currentQ.id]);
    index++;
   }
   if(index>=qs.length){
    const finished=await finishAttempt(a,previous,qs);
    if(!finished)return fail(origin,"question_sequence_changed",409);
    return response(origin,{ok:true,finished:true,...finished,feedback:justCompletedFeedback,transition_delay_seconds:5,report:await report(player.student_id)});
   }
   const nextQ=qs[index],stageChanged=nextQ.stage!==currentStage;
   const clock=new Date(Date.now()+5000).toISOString();
   const {data:changed,error:writeErr}=await db.from("afaq_v2_attempts").update({
    answers:previous,current_index:index,stage_number:nextQ.stage,awaiting_stage_start:stageChanged,
    question_started_at:stageChanged?null:clock,
    stage_started_at:stageChanged?null:(currentStage>=4?new Date(new Date(a.stage_started_at||a.started_at).getTime()+5000).toISOString():(a.stage_started_at||a.started_at))
   }).eq("id",a.id).eq("status","in_progress").eq("current_index",a.current_index||0).select("id");
   if(writeErr)throw writeErr;
   if(!changed?.length)return fail(origin,"question_sequence_changed",409);
   if(stageChanged)return response(origin,{ok:true,finished:false,stage_ready:true,index,stage_number:nextQ.stage,stage_changed:true,feedback:justCompletedFeedback,transition_delay_seconds:5});
   return response(origin,{ok:true,finished:false,index,question:publicQuestion(nextQ),
    question_started_at:clock,stage_started_at:currentStage>=4?new Date(new Date(a.stage_started_at||a.started_at).getTime()+5000).toISOString():(a.stage_started_at||a.started_at),
    stage_number:nextQ.stage,stage_changed:false,total_questions:qs.length,
    time:secondsForStage(nextQ.stage),transition_delay_seconds:5,feedback:justCompletedFeedback});
  }
  if(action==="staff_summary"){
   if(!staff(role))return fail(origin,"forbidden",403);
   const {data,error}=await db.from("afaq_v2_attempts").select("student_id,section,score,status");
   if(error)throw error;
   const stats=[1,2,3,4].map(section=>{const done=(data||[]).filter(a=>!TEST_IDS.has(a.student_id)&&a.section===section&&a.status==="submitted");
    return {section,submitted:done.length,average:done.length?Math.round(done.reduce((sum,a)=>sum+(a.score||0),0)/done.length):null}});
   return response(origin,{ok:true,stats});
  }
  if(action==="staff_results"){
   if(!staff(role))return fail(origin,"forbidden",403);
   const [{data:students,error:se},{data:rows,error:re},
      {data:visits,error:ve},{data:logins,error:le}]=await Promise.all([
       db.from("competition_students").select("student_id,serial_no,class_name,full_name,display_name").eq("active",true),
       db.from("afaq_v2_attempts").select("student_id,section,score,status,attempt_no,started_at,current_index,answers"),
       db.from("afaq_v2_contest_visits").select("student_id,entered_at").limit(10000),
       db.from("afaq_sessions").select("student_id,created_at").eq("role","student").limit(10000)
   ]);
   if(se||re||ve||le)throw se||re||ve||le;
   const perId=new Map(),visitsById=new Map(),loginsById=new Map();
   for(const a of rows||[]){
    if(!perId.has(a.student_id))perId.set(a.student_id,[]);
    perId.get(a.student_id).push(a);
   }
   for(const visit of visits||[]){
    const item=visitsById.get(visit.student_id)||{count:0,last:null};
    item.count++;
    if(!item.last||visit.entered_at>item.last)item.last=visit.entered_at;
    visitsById.set(visit.student_id,item);
   }
   for(const login of logins||[]){
    if(!login.student_id)continue;
    const item=loginsById.get(login.student_id)||{count:0,last:null};
    item.count++;
    if(!item.last||login.created_at>item.last)item.last=login.created_at;
    loginsById.set(login.student_id,item);
   }
   const completedStages=(attempt:any)=>{
    const total=Object.keys(attempt.answers||{}).length;
    return [10,20,30,34,38].filter(threshold=>total>=threshold).length;
   };
   const details=(students||[]).map(student=>{
    const hits=perId.get(student.student_id)||[];
    const parts=[1,2,3,4].map(section=>{
     const unit=hits.filter((a:any)=>a.section===section);
     const scored=unit.filter((a:any)=>["submitted","expired"].includes(a.status));
     return {section,best:scored.length?Math.max(...scored.map((a:any)=>a.score||0)):null,
      attempts_used:unit.length,attempts_remaining:Math.max(0,2-unit.length),
      stages_completed:Math.max(0,...unit.map(completedStages)),
      attempts:unit.map((a:any)=>({number:a.attempt_no,status:a.status,
        completed_stages:completedStages(a),answered_questions:Object.keys(a.answers||{}).length}))};
    });
    const total=parts.reduce((z:number,p:any)=>z+(p.best||0),0);
    const item:any={serial_no:student.serial_no,class_name:student.class_name,
     full_name:student.full_name||student.display_name,
     total,qualified:total>=350&&parts.every(p=>p.best!==null),parts,
     platform_login_count:loginsById.get(student.student_id)?.count||0,
     last_platform_login:loginsById.get(student.student_id)?.last||null,
     contest_entry_count:visitsById.get(student.student_id)?.count||0,
     last_contest_entry:visitsById.get(student.student_id)?.last||null,
     stages_completed:parts.reduce((n:number,p:any)=>n+p.stages_completed,0)};
    if(["supervisor","supervisor_assistant"].includes(role))item.student_id=student.student_id;
    return item;
   });
   return response(origin,{ok:true,students:details});
  }
  if(action==="tester_status"){
   if(u.role!=="supervisor"||testerId)return fail(origin,"forbidden",403);
   const profiles=await Promise.all(Object.entries(TEST_PROFILES).map(async ([n,id])=>({
    number:Number(n),name:testerName(n),report:await report(id)})));
   return response(origin,{ok:true,profiles});
  }
  if(action==="reset_attempts"){
   if(u.role!=="supervisor"||testerId)return fail(origin,"forbidden",403);
   if(b.confirmed!==true)return fail(origin,"reset_confirmation_required",400);
   const resetSection=Number(b.reset_section);
   if(!Number.isInteger(resetSection)||resetSection<0||resetSection>4)return fail(origin,"invalid_section",400);
   const tester=tiny(b.target_tester,2);
   let targetId="",targetName="";
   if(tester){
    if(!TEST_PROFILES[tester])return fail(origin,"invalid_tester",400);
    targetId=TEST_PROFILES[tester];targetName=testerName(tester);
   }else{
    const className=tiny(b.target_class,40),serial=Number(b.target_serial);
    if(!["السادس / ٤","السادس / ٥","السادس / ٦"].includes(className)||
      !Number.isInteger(serial)||serial<1||serial>100)return fail(origin,"invalid_student",400);
    const {data:record,error:rosterError}=await db.from("competition_students")
      .select("student_id,full_name").eq("class_name",className).eq("serial_no",serial)
      .eq("active",true).maybeSingle();
    if(rosterError)throw rosterError;
    if(!record)return fail(origin,"student_not_found",404);
    targetId=record.student_id;targetName=record.full_name;
   }
   let query=db.from("afaq_v2_attempts").select("*").eq("student_id",targetId);
   if(resetSection>0)query=query.eq("section",resetSection);
   const {data:records,error:historyError}=await query;
   if(historyError)throw historyError;
   const previous=records||[];
   if(!previous.length)return response(origin,{ok:true,reset_count:0,name:targetName,report:await report(targetId)});
   const reason=tiny(b.reason,250)||"إعادة ضبط محاولات نجوم آفاق بطلب المشرف";
   const {error:logError}=await db.from("afaq_v2_attempt_reset_log").insert({
    student_id:targetId,section:resetSection,actor_username:u.username,
    reason,archived_attempts:previous,reset_at:neutralTime()
   });
   if(logError)throw logError;
   let deletion=db.from("afaq_v2_attempts").delete().eq("student_id",targetId);
   if(resetSection>0)deletion=deletion.eq("section",resetSection);
   const {data:deleted,error:deleteError}=await deletion.select("id");
   if(deleteError)throw deleteError;
   return response(origin,{ok:true,reset_count:(deleted||[]).length,name:targetName,
    report:await report(targetId)});
  }
  if(action==="question_list"){
   if(role!=="supervisor")return fail(origin,"forbidden",403);
   const model=tiny(b.model,1);if(!valid(g,section)||!["A","B","C","D","E","F"].includes(model))return fail(origin,"invalid_model");
   return response(origin,{ok:true,questions:await questions(g,section,model)});
  }
  if(action==="save_question"){
   if(role!=="supervisor")return fail(origin,"forbidden",403);
   const model=tiny(b.model,1),ordinal=Number(b.ordinal);
   if(!valid(g,section)||!["A","B","C","D","E","F"].includes(model)||!Number.isInteger(ordinal)||ordinal<1||ordinal>38)
    return fail(origin,"invalid_question");
   if(officialModel(model)&&await isPublished(g,section,model))return fail(origin,"unpublish_before_editing",403);
   const stage=ordinal<=30?Math.ceil(ordinal/10):ordinal<=34?4:5;
   const kind=stage<=3?"choice":"complex";
   const prompt=tiny(b.prompt,800),objective=tiny(b.objective,140),explanation=tiny(b.explanation,500);
   if(prompt.length<5)return fail(origin,"invalid_question");
   const {data:oldVisual,error:oldVisualError}=await db.from("afaq_v2_questions").select("visual_svg,visual_caption")
      .eq("grade",g).eq("section",section).eq("model",model).eq("ordinal",ordinal).maybeSingle();
   if(oldVisualError)throw oldVisualError;
   const row:any={grade:g,section,model,ordinal,stage,question_kind:kind,prompt,objective,explanation,updated_at:neutralTime(),
    answer_index:0,options:["١","٢","٣","٤"],parts:[],visual_svg:b.visual_svg===undefined?(oldVisual?.visual_svg||""):tiny(b.visual_svg,14000),
    visual_caption:b.visual_caption===undefined?(oldVisual?.visual_caption||""):tiny(b.visual_caption,400)};
   if(kind==="choice"){
    const opts=b.options,correct=Number(b.answer_index);
    if(!Array.isArray(opts)||(opts.length<2||opts.length>4)||opts.some((x:any)=>typeof x!=="string"||x.length>150)||!Number.isInteger(correct)||correct<0||correct>3)
     return fail(origin,"invalid_question");
    row.options=opts;row.answer_index=correct;
   }else{
    const parts=b.parts;
    if(!Array.isArray(parts)||parts.length!==(ordinal===32||ordinal===34||ordinal===36||ordinal===38?3:2))
     return fail(origin,"invalid_parts");
    row.parts=parts.map((p:any)=>{
     if(!["choice","number"].includes(p.type)||tiny(p.text,240).length<3)throw Error("invalid_parts");
     if(p.type==="choice"&&(!Array.isArray(p.choices)||p.choices.length<2||p.choices.length>4))throw Error("invalid_parts");
     return {type:p.type,text:tiny(p.text,240),answer:p.type==="number"?Number(p.answer):tiny(p.answer,150),
      choices:p.type==="choice"?p.choices.map((x:any)=>tiny(x,100)):undefined,
      displayAnswer:tiny(p.displayAnswer??p.answer,100)};
    });
   }
   const {error}=await db.from("afaq_v2_questions").upsert(row,{onConflict:"grade,section,model,ordinal"});
   if(error)throw error;return response(origin,{ok:true});
  }
  if(action==="publish_model"){
   if(role!=="supervisor")return fail(origin,"forbidden",403);
   const model=tiny(b.model,1);
   if(!valid(g,section)||!["A","B","C","D","E","F"].includes(model))return fail(origin,"invalid_model");
   if(officialModel(model)&&g!==6)return fail(origin,"grade_needs_individual_accounts",409);
   const bank=await questions(g,section,model);if(!bankValid(bank))return fail(origin,"question_bank_incomplete",409);
   if(officialModel(model)){
    const{count,error}=await db.from("afaq_v2_attempts").select("id",{head:true,count:"exact"}).eq("grade",g).eq("section",section).eq("model",model);
    if(error)throw error;if((count||0)>0&&!b.published)return fail(origin,"active_attempts_prevent_unpublish",409);
   }
   const enabled=b.published===true;
   const{error}=await db.from("afaq_v2_models").upsert({grade:g,section,model,published:enabled,approved_at:enabled?neutralTime():null});
   if(error)throw error;return response(origin,{ok:true,published:enabled});
  }
  return fail(origin,"unknown_action",404);
 }catch(error:any){console.error("afaq-contest-v3",error?.message||"unknown");return fail(origin,"server_error",500)}
});
