import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.95.0";
const URL=Deno.env.get("SUPABASE_URL")||"";
let KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
try{KEY=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}").default||KEY;}catch{}
const db=createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const ORIGINS=new Set(["https://afaqmaths.github.io","http://localhost:8000","http://127.0.0.1:8000","http://localhost:5500","http://127.0.0.1:5500"]);
const headers=(o:string)=>({"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":ORIGINS.has(o)?o:"https://afaqmaths.github.io","Access-Control-Allow-Headers":"authorization,content-type,x-client-info","Access-Control-Allow-Methods":"POST,OPTIONS","Cache-Control":"no-store",Vary:"Origin"});
const reply=(o:string,payload:any,status=200)=>new Response(JSON.stringify(payload),{status,headers:headers(o)});
const fail=(o:string,error:string,status=400)=>reply(o,{ok:false,error},status);
const tiny=(x:unknown,n=200)=>String(x??"").trim().slice(0,n);
const norm=(x:unknown)=>tiny(x,80).replace(/[٠-٩۰-۹]/g,c=>{const i="٠١٢٣٤٥٦٧٨٩".indexOf(c);return String(i>=0?i:"۰۱۲۳۴۵۶۷۸۹".indexOf(c))});
const privileged=(role:string)=>role==="supervisor"||role==="supervisor_assistant";
const staff=(role:string)=>privileged(role)||role==="director"||role==="deputy";
async function sha(v:string){const a=new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v)));return [...a].map(x=>x.toString(16).padStart(2,"0")).join("")}
async function session(req:Request){
 const token=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
 if(token.length<35||token.length>128)return null;
 const{data,error}=await db.from("afaq_sessions").select("role,username,student_id,grade,expires_at,revoked_at")
 .eq("token_hash",await sha(token)).maybeSingle();
 if(error)throw error;
 return data&&!data.revoked_at&&new Date(data.expires_at).getTime()>Date.now()?data:null;
}

/* التقييم مرتبط الآن بدرجات التحصيل الحالية، وليس بجدول A القديم. */
const MARKS=[
 ["oral_score","الأعمال الشفوية",10],["short1_score","السؤال القصير الأول",5],
 ["short2_score","السؤال القصير الثاني",5],["short_exam1_score","الاختبار القصير الأول",10],
 ["short_exam2_score","الاختبار القصير الثاني",10],["written_score","الأعمال الكتابية",5],
 ["homework_score","الواجب المنزلي",5],["project_score","المشروع",10]
];
const classify=(score:number|null)=>score===null?"ungraded":score<=50?"remedial":score>=85?"enrichment":"standard";
const percent=(a:number,b:number)=>b>0?Math.round(a/b*10000)/100:0;
const activeTracks=(flags:any[])=>["remedial","enrichment"].filter(track=>flags.some(f=>f.active&&f.track===track&&(track!=="enrichment"||Number(f.percentage)>=85)));
const prioritize=(tracks:string[])=>tracks.includes("remedial")?"remedial":tracks.includes("enrichment")?"enrichment":"standard";

// Each recorded official mark may generate two historical signal keys: count one assessment only.
function signalIdentity(key:string){
 const p=key.split(":");
 if(p[0]==="official"){
  if(p.length===3&&/^\d+$/.test(p[1]))return "official:"+p[1]+":"+p[2];
  if(p.length===4&&/^t\d+$/.test(p[2]))return "official:"+p[2].slice(1)+":"+p[3];
 }
 return key;
}
function studentDifferentiation(flags:any[]){
 const enriched=new Set<string>(),remedial=new Set<string>();
 for(const f of flags){
  if(!f.active)continue;
  const id=signalIdentity(String(f.source_key||""));
  if(f.track==="enrichment"&&Number(f.percentage)>=85)enriched.add(id);
  if(f.track==="remedial")remedial.add(id);
 }
 const enrichment_count=enriched.size,remedial_count=remedial.size;
 return {enrichment_count,remedial_count,
  band:remedial_count>0?"remedial":enrichment_count>3?"enrichment_high":
   enrichment_count>0?"enrichment_low":"standard"};
}

async function signalsFor(studentId:string){
 const {data,error}=await db.from("afaq_learning_signals").select("source_key,source_type,source_label,raw_score,maximum_score,percentage,track,active,reason_public,source_date")
  .eq("student_id",studentId).eq("active",true).order("source_date",{ascending:false}).limit(30);
 if(error)throw error;return data||[];
}
const assessmentPercent=(r:any)=>{
 if(!r)return null;
 const known=MARKS.filter(([k])=>r[k]!==null&&r[k]!==undefined);
 return known.length?percent(known.reduce((s,[k])=>s+Number(r[k]||0),0),
  known.reduce((s,[k,l])=>s+Number(l),0)):null;
};
async function scoreFor(studentId:string){
 const {data,error}=await db.from("afaq_student_assessments")
  .select(MARKS.map(x=>x[0]).join(",")).eq("student_id",studentId).maybeSingle();
 if(error)throw error;return assessmentPercent(data);
}

async function studentInfo(studentId:string){
 const{data,error}=await db.from("competition_students").select("student_id,serial_no,class_name,full_name,display_name,active").eq("student_id",studentId).maybeSingle();
 if(error)throw error;return data?.active?data:null;
}
async function taskItems(track:string,studentId:string){
 if(!["remedial","enrichment"].includes(track))return [];
 const units=track==="remedial"?[1,2,3]:[1,2,3,4];
 const{data,error}=await db.from("afaq_learning_tasks")
 .select("task_id,track,unit,objective,question,options,correct_index,explanation,difficulty")
 .eq("track",track).eq("grade",6).eq("active",true).order("task_id");
 if(error)throw error;
 const hash=await sha(studentId),seed=parseInt(hash.slice(0,8),16);
 const selected:any[]=[];
 for(const unit of units){
  const pool=(data||[]).filter(x=>x.unit===unit);
  if(pool.length<4)continue;
  const used=new Set<string>();
  for(let j=0;j<4;j++){
   let idx=(seed+unit*3+j*5)%pool.length,task=pool[idx];
   while(used.has(task.task_id)){idx=(idx+1)%pool.length;task=pool[idx]}
   used.add(task.task_id);selected.push(task);
  }
 }
 return selected;
}

async function answered(studentId:string,taskIds:string[]){
 if(!taskIds.length)return {};
 const{data,error}=await db.from("afaq_learning_answers")
 .select("task_id,answer_index,is_correct,answered_at,id")
 .eq("student_id",studentId).in("task_id",taskIds).order("answered_at",{ascending:true}).order("id",{ascending:true}).limit(5000);
 if(error)throw error;
 const result:Record<string,any>={};
 for(const row of data||[]){
  if(!result[row.task_id])result[row.task_id]={first:row,latest:row,attempts:0};
  result[row.task_id].latest=row;result[row.task_id].attempts++;
 }
 return result;
}
const publicTask=(t:any,record:any)=>({
 task_id:t.task_id,unit:t.unit,objective:t.objective,question:t.question,options:t.options,
 difficulty:t.difficulty,completed:!!record,correct:record?record.latest.is_correct:null,
 first_correct:record?record.first.is_correct:null,attempts:record?.attempts||0,
 selected_answer:record?.latest.answer_index??null,
 explanation:record?t.explanation:null,correct_answer:record?t.options[t.correct_index]:null
});
function taskSummary(tasks:any[],history:Record<string,any>){
 const total=tasks.length,completed=tasks.filter(t=>history[t.task_id]).length;
 const first=tasks.filter(t=>history[t.task_id]?.first.is_correct).length,
  latest=tasks.filter(t=>history[t.task_id]?.latest.is_correct).length,
  attempts=tasks.reduce((s,t)=>s+(history[t.task_id]?.attempts||0),0);
 return {total_tasks:total,completed,correct:latest,first_correct:first,attempts,
  initial_percent:percent(first,total),current_percent:percent(latest,total),
  improvement_percent:percent(latest-first,total),completion_percent:percent(completed,total)};
}


async function learningPath(studentId:string,requestedTrack=""){
 const student=await studentInfo(studentId);if(!student)return null;
 const [score,signals]=await Promise.all([scoreFor(studentId),signalsFor(studentId)]);
 const active=activeTracks(signals);
 const current=prioritize(active);
 // حتى لو انتقل الطالب من العلاج إلى الإثراء لا تضيع نتائج أنشطته العلاجية القديمة.
 const {data:previousActivities,error:previousError}=await db.from("afaq_learning_progress_summary")
  .select("track").eq("student_id",studentId);
 if(previousError)throw previousError;
 const historic=(previousActivities||[]).map(x=>x.track).filter(t=>["remedial","enrichment"].includes(t));
 let track=(active.includes(requestedTrack)||historic.includes(requestedTrack))?requestedTrack:current;
 if(track==="standard"&&historic.length)track=historic[0];
 const tasks=["remedial","enrichment"].includes(track)?await taskItems(track,studentId):[];
 const progress=await answered(studentId,tasks.map(t=>t.task_id));
 const summary=taskSummary(tasks,progress);
 return {student:{name:student.full_name||student.display_name,class_name:student.class_name,serial_no:student.serial_no},
  score,track,current_track:current,tracks:active,historic_tracks:historic,
  reasons:signals.filter(s=>s.track===track).map(s=>({
   label:s.source_label,percentage:s.percentage,source_type:s.source_type,
   reason:s.reason_public,date:s.source_date
  })),
  ...summary,tasks:tasks.map(t=>publicTask(t,progress[t.task_id])),
  thresholds:{remedial_at_or_below:50,enrichment_at_or_above:85},
  archived:!active.includes(track)&&historic.includes(track)};
}


async function overview(role:string,className=""){
 const [studentsQuery,assessmentQuery,signalsQuery,consentQuery,progressQuery]=await Promise.all([
  db.from("competition_students").select("student_id,serial_no,class_name,full_name,display_name")
   .eq("active",true).order("class_name").order("serial_no").limit(500),
  db.from("afaq_student_assessments").select(["student_id",...MARKS.map(x=>x[0])].join(",")).limit(500),
  db.from("afaq_learning_signals").select("student_id,source_key,source_label,source_type,track,percentage,active,reason_public")
   .eq("active",true).limit(3000),
  db.from("afaq_excellence_publication").select("student_id,parent_consent_confirmed,school_approved").limit(500),
  db.from("afaq_learning_progress_summary").select("student_id,track,completed_questions,total_attempts,initially_correct,currently_correct")
   .limit(500)
 ]);
 const fatal=[studentsQuery,assessmentQuery,signalsQuery,consentQuery,progressQuery].find(x=>x.error);
 if(fatal)throw fatal.error;
 const students=studentsQuery.data||[],assessments=new Map((assessmentQuery.data||[]).map(x=>[x.student_id,x]));
 const flags=new Map<string,any[]>();
 for(const f of signalsQuery.data||[]){if(!flags.has(f.student_id))flags.set(f.student_id,[]);flags.get(f.student_id)!.push(f)}
 const consent=new Map((consentQuery.data||[]).map(x=>[x.student_id,x]));
 const progress=new Map((progressQuery.data||[]).map(x=>[x.student_id+"|"+x.track,x]));
 return students.filter(s=>!className||s.class_name===className).map(s=>{
  const indicators=flags.get(s.student_id)||[],tracks=activeTracks(indicators);
   const differentiation=studentDifferentiation(indicators);
  const score=assessmentPercent(assessments.get(s.student_id));
  const current=prioritize(tracks),published=consent.get(s.student_id);
  const pathProgress:any={};
  for(const track of ["remedial","enrichment"]){
   const p=progress.get(s.student_id+"|"+track)||{};
   const count=track==="remedial"?12:16,
    first=Number(p.initially_correct||0),latest=Number(p.currently_correct||0);
   pathProgress[track]={total_tasks:count,completed:Number(p.completed_questions||0),
    attempts:Number(p.total_attempts||0),first_correct:first,correct:latest,
    initial_percent:percent(first,count),current_percent:percent(latest,count),
    improvement_percent:percent(latest-first,count)};
  }
  const info:any={name:s.full_name||s.display_name,class_name:s.class_name,serial_no:s.serial_no,
   score,track:current,tracks,differentiation,
   reasons:indicators.map(x=>({label:x.source_label,track:x.track,percentage:x.percentage,
    source_type:x.source_type,reason:x.reason_public})),
   progress_by_track:pathProgress,
   showcase_approved:tracks.includes("enrichment")&&!tracks.includes("remedial")&&
    published?.parent_consent_confirmed===true&&published?.school_approved===true};
  if(privileged(role))info.original_student_id=s.student_id;
  return info;
 });
}

async function resolveStudent(input:any,cls:any){
 const id=norm(input),category=tiny(cls,35);
 const q=db.from("competition_students").select("student_id");
 if(/^\d{1,3}$/.test(id)){
  if(!["السادس / ٤","السادس / ٥","السادس / ٦"].includes(category))return null;
  q.eq("class_name",category).eq("serial_no",Number(id));
 }else if(/^\d{12}$/.test(id)){q.eq("student_id",id);}
 else return null;
 const{data,error}=await q.maybeSingle();if(error)throw error;return data?.student_id||null;
}
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response("ok",{headers:headers(origin)});
 if(req.method!=="POST")return fail(origin,"method_not_allowed",405);
 if(origin&&!ORIGINS.has(origin))return fail(origin,"origin_not_allowed",403);
 try{
  const b=await req.json(),action=tiny(b.action,50);
  // Public list contains no personal data unless parental consent and school approval exist.
  if(action==="excellence_gallery"){
   const {data:consents,error:e}=await db.from("afaq_excellence_publication").select("student_id").eq("parent_consent_confirmed",true).eq("school_approved",true);
   if(e)throw e;
   const allowed=new Set((consents||[]).map(x=>x.student_id));
   if(!allowed.size)return reply(origin,{ok:true,students:[],note:"No parent-approved publications yet"});
   const {data:students,error:er}=await db.from("competition_students").select("student_id,full_name,display_name,class_name,serial_no").eq("active",true);
   const {data:scores,error:es}=await db.from("afaq_learning_signals").select("student_id,track,active,percentage").eq("active",true);
   if(er||es)throw er||es;
   const byFlags=new Map<string,string[]>();
   for(const row of scores||[]){if(row.track==="enrichment"&&Number(row.percentage)<85)continue;if(!byFlags.has(row.student_id))byFlags.set(row.student_id,[]);byFlags.get(row.student_id)!.push(row.track)}
   const {data:grades,error:ge}=await db.from("afaq_student_assessments")
    .select(["student_id",...MARKS.map(x=>x[0])].join(",")).limit(500);
   if(ge)throw ge;
   const byGrades=new Map((grades||[]).map(x=>[x.student_id,x]));
   const result=(students||[]).filter(s=>allowed.has(s.student_id))
    .filter(s=>(byFlags.get(s.student_id)||[]).includes("enrichment")&&!(byFlags.get(s.student_id)||[]).includes("remedial"))
    .map(s=>({name:s.full_name||s.display_name,class_name:s.class_name,serial_no:s.serial_no,
      score:assessmentPercent(byGrades.get(s.student_id))}))
    .sort((a,b)=>(b.score||0)-(a.score||0));
   return reply(origin,{ok:true,students:result});
  }
  const u=await session(req);if(!u)return fail(origin,"unauthorized",401);
  if(action==="my_path"){
   if(u.role!=="student"||Number(u.grade)!==6)return fail(origin,"student_account_required",403);
   const data=await learningPath(u.student_id,tiny(b.track,20));
   if(!data)return fail(origin,"student_not_found",404);
   return reply(origin,{ok:true,path:data});
  }
  if(action==="answer_task"){
   if(u.role!=="student"||Number(u.grade)!==6)return fail(origin,"student_account_required",403);
   const id=tiny(b.task_id,60),answer=Number(b.answer_index);
   if(!Number.isInteger(answer)||answer<0||answer>3)return fail(origin,"invalid_answer",400);
   const flags=await signalsFor(u.student_id),active=activeTracks(flags);
   if(!active.length)return fail(origin,"path_not_assigned",403);
   const trackCandidates=await Promise.all(active.map(async track=>({track,tasks:await taskItems(track,u.student_id)})));
   const choice=trackCandidates.find(x=>x.tasks.some(t=>t.task_id===id));
   if(!choice)return fail(origin,"not_your_question",403);
   const track=choice.track,task=choice.tasks.find(t=>t.task_id===id);
   if(!task)return fail(origin,"not_your_question",403);
   const correct=answer===task.correct_index;
   const {error}=await db.from("afaq_learning_answers").insert({student_id:u.student_id,task_id:id,answer_index:answer,is_correct:correct});
   if(error)throw error;
   return reply(origin,{ok:true,correct,correct_answer:task.options[task.correct_index],
    explanation:task.explanation,feedback:correct?"أحسنت! أنت تتقدم بخطوات رائعة.":"محاولة جيدة. راجع طريقة الحل، ويمكنك المحاولة مرة أخرى.",path:await learningPath(u.student_id,track)});
  }
  if(action==="staff_overview"){
   if(!staff(u.role))return fail(origin,"forbidden",403);
   return reply(origin,{ok:true,students:await overview(u.role,tiny(b.class_name,35))});
  }

  if(action==="intervention_reports"){
   if(!staff(u.role))return fail(origin,"forbidden",403);
   const type=tiny(b.scope,20),cls=tiny(b.class_name,35);
   if(!["all","class","student"].includes(type))return fail(origin,"invalid_scope",400);
   if(type==="class"&&!["السادس / ٤","السادس / ٥","السادس / ٦"].includes(cls))return fail(origin,"invalid_class",400);
   if(type==="student"){
    const id=await resolveStudent(b.student_number,cls);
    if(!id)return fail(origin,"student_not_found",404);
    const paths=[];
    for(const t of ["remedial","enrichment"]){
     const p=await learningPath(id,t);
     if(p&&(p.tracks.includes(t)||p.historic_tracks.includes(t)))paths.push(p);
    }
    return reply(origin,{ok:true,paths});
   }
   const rows=await overview(u.role,type==="class"?cls:"");
   return reply(origin,{ok:true,scope:type,class_name:type==="class"?cls:null,students:rows,
    thresholds:{remedial_at_or_below:50,enrichment_at_or_above:85}});
  }
  if(action==="staff_student_path"){
   if(!staff(u.role))return fail(origin,"forbidden",403);
   const id=await resolveStudent(b.student_number,b.class_name);
   if(!id)return fail(origin,"student_not_found",404);
   const path=await learningPath(id,tiny(b.track,20));if(!path)return fail(origin,"student_not_found",404);
   return reply(origin,{ok:true,path});
  }
  if(action==="approve_excellence"){
   if(u.role!=="supervisor")return fail(origin,"forbidden",403);
   const id=await resolveStudent(b.student_number,b.class_name);
   if(!id)return fail(origin,"student_not_found",404);
   const flags=await signalsFor(id),active=activeTracks(flags);
   if(!active.includes("enrichment")||active.includes("remedial"))
    return fail(origin,"threshold_not_met",409);
   const parent=b.parent_consent_confirmed===true,school=b.school_approved===true;
   if(parent&&school&&!b.confirmed_review)return fail(origin,"approval_confirmation_required",400);
   const {error}=await db.from("afaq_excellence_publication").upsert({
    student_id:id,parent_consent_confirmed:parent,school_approved:school,
    approved_by:u.username,approved_at:parent&&school?new Date().toISOString():null,
    updated_at:new Date().toISOString()
   });
   if(error)throw error;
   return reply(origin,{ok:true,published:parent&&school});
  }
  return fail(origin,"unknown_action",404);
 }catch(error:any){console.error("afaq-learning",error?.message||"unknown");return fail(origin,"server_error",500);}
});
