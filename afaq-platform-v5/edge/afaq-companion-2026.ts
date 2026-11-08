import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.95.0";
const URL=Deno.env.get("SUPABASE_URL")||"";
let SECRET=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
try{SECRET=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}").default||SECRET}catch{}
const db=createClient(URL,SECRET,{auth:{persistSession:false,autoRefreshToken:false}});
const ORIGINS=new Set(["https://afaqmaths.github.io","http://localhost:8000","http://127.0.0.1:8000","http://localhost:5500","http://127.0.0.1:5500"]);
const YEAR="2026/2027";
const CLASSES=["السادس / ٤","السادس / ٥","السادس / ٦"];
const READ=["supervisor","supervisor_assistant","director","deputy"];
const EDIT=["supervisor","supervisor_assistant"];
const POS=["المشاركة الإيجابية","الانضباط والالتزام","التعاون ومساعدة الزملاء"];
const NEG=["التحدث دون إذن","الخروج من المقعد دون إذن","تناول الطعام دون إذن","عدم إحضار الأدوات","عدم إنجاز المهام"];
const hdr=(o:string)=>({"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":ORIGINS.has(o)?o:"https://afaqmaths.github.io","Access-Control-Allow-Headers":"authorization,content-type,x-client-info","Access-Control-Allow-Methods":"POST,OPTIONS","Cache-Control":"no-store",Vary:"Origin"});
const ok=(o:string,p:any)=>new Response(JSON.stringify({ok:true,...p}),{headers:hdr(o)});
const fail=(o:string,message:string,status=400)=>new Response(JSON.stringify({ok:false,error:message}),{status,headers:hdr(o)});
const str=(v:any,max=1000)=>String(v??"").trim().slice(0,max);
const digit=(v:any)=>str(v,25).replace(/[٠-٩]/g,x=>String("٠١٢٣٤٥٦٧٨٩".indexOf(x)));
const term=(v:any)=>[1,2].includes(Number(digit(v)))?Number(digit(v)):null;
async function hash(s:string){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return [...new Uint8Array(b)].map(n=>n.toString(16).padStart(2,"0")).join("")}
async function sessionOf(req:Request){
 const tok=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
 if(tok.length<35||tok.length>128)return null;
 const {data,error}=await db.from("afaq_sessions").select("role,username,student_id,revoked_at,expires_at").eq("token_hash",await hash(tok)).maybeSingle();
 if(error)throw error;
 if(!data||data.revoked_at||new Date(data.expires_at).getTime()<=Date.now())return null;
 return data;
}
async function student(cls:string,serial:any){
 const n=Number(digit(serial));if(!Number.isInteger(n)||n<1||n>100)return null;
 const q=await db.from("competition_students").select("student_id,serial_no,full_name,class_name").eq("active",true).eq("class_name",cls).eq("serial_no",n).maybeSingle();
 if(q.error)throw q.error;return q.data;
}
async function clsReport(cls:string,t:number){
 const r=await db.from("competition_students").select("student_id,serial_no,full_name,class_name").eq("active",true).eq("class_name",cls).order("serial_no");
 if(r.error)throw r.error;const students=r.data||[],ids=students.map((s:any)=>s.student_id);
 let profiles:any[]=[],events:any[]=[],questions:any[]=[],grades:any[]=[];
 if(ids.length){
  const results=await Promise.all([
   db.from("afaq_companion_profiles").select("*").eq("academic_year",YEAR).eq("term",t).in("student_id",ids),
   db.from("afaq_companion_events").select("id,student_id,category,code,details,event_date,created_by,created_at").eq("academic_year",YEAR).eq("term",t).is("retracted_at",null).in("student_id",ids).order("event_date",{ascending:false}).limit(2000),
   db.from("afaq_companion_questions").select("id,student_id,activity_type,question_text,result_text,followup_action,question_date,created_by,created_at").eq("academic_year",YEAR).eq("term",t).is("retracted_at",null).in("student_id",ids).order("question_date",{ascending:false}).limit(2000),
   db.from("afaq_official_math_grades").select("student_id,diagnostic_score,oral_1,oral_2,homework_1,homework_2,question_1,question_2,exam_1,exam_2,project,final_exam").eq("academic_year",YEAR).eq("term",t).in("student_id",ids)
  ]);
  for(const v of results)if(v.error)throw v.error;
  [profiles,events,questions,grades]=results.map((v:any)=>v.data||[]);
 }
 const cn=await db.from("afaq_companion_class_notes").select("*").eq("class_name",cls).eq("academic_year",YEAR).eq("term",t).maybeSingle();
 if(cn.error)throw cn.error;
 return {class_name:cls,academic_year:YEAR,term:t,students,profiles,events,questions,grades,class_notes:cn.data,generated_at:new Date().toISOString()};
}
const profileKeys=["student_track","strengths","learning_needs","enrichment_plan","support_plan","followup_result","descriptive_text"];
const classKeys=["classroom_rules","classroom_management","enrichment_policy","remedial_policy","assessment_plan","teacher_reflection"];
Deno.serve(async req=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response("ok",{headers:hdr(origin)});
 if(req.method!=="POST")return fail(origin,"method_not_allowed",405);
 if(origin&&!ORIGINS.has(origin))return fail(origin,"origin_not_allowed",403);
 try{
  let body:any;try{body=await req.json()}catch{return fail(origin,"invalid_json")}
  const session=await sessionOf(req);
  if(!session)return fail(origin,"unauthorized",401);
  if(!READ.includes(session.role))return fail(origin,"forbidden",403);
  const a=str(body.action,40),cls=str(body.class_name,40),t=term(body.term);
  if(!CLASSES.includes(cls)||!t)return fail(origin,"invalid_class_or_term");
  if(a==="class_report")return ok(origin,{report:await clsReport(cls,t)});
  if(!EDIT.includes(session.role))return fail(origin,"read_only",403);
  const who=session.role+":"+session.username;
  if(a==="save_class_notes"){
   const record:any={class_name:cls,academic_year:YEAR,term:t,updated_by:who,updated_at:new Date().toISOString()};
   for(const key of classKeys)record[key]=str(body[key],2000);
   const q=await db.from("afaq_companion_class_notes").upsert(record,{onConflict:"class_name,academic_year,term"}).select("*").single();
   if(q.error)throw q.error;return ok(origin,{class_notes:q.data});
  }
  const s=await student(cls,body.serial_no);if(!s)return fail(origin,"student_not_found",404);
  if(a==="save_profile"){
   const track=str(body.student_track,40);
   if(!["متابعة عامة","إثراء","دعم تعليمي"].includes(track))return fail(origin,"invalid_track");
   const record:any={student_id:s.student_id,academic_year:YEAR,term:t,updated_by:who,updated_at:new Date().toISOString(),descriptive_source:"إدخال المعلم"};
   for(const key of profileKeys)record[key]=key==="student_track"?track:str(body[key],2500);
   const q=await db.from("afaq_companion_profiles").upsert(record,{onConflict:"student_id,academic_year,term"}).select("*").single();
   if(q.error)throw q.error;return ok(origin,{profile:q.data});
  }
  if(a==="add_event"){
   const category=str(body.category,20),code=str(body.code,80),details=str(body.details,600);
   if(category==="إيجابي"&&!POS.includes(code)||category==="سلبي"&&!NEG.includes(code)||category==="أخرى"&&code!=="ملاحظة أخرى")return fail(origin,"invalid_event");
   if(!["إيجابي","سلبي","أخرى"].includes(category))return fail(origin,"invalid_event");
   const date=str(body.event_date,10);
   if(!/^20\d\d-\d\d-\d\d$/.test(date))return fail(origin,"invalid_date");
   const q=await db.from("afaq_companion_events").insert({student_id:s.student_id,academic_year:YEAR,term:t,category,code,details,event_date:date,created_by:who}).select("id").single();
   if(q.error)throw q.error;return ok(origin,{id:q.data.id});
  }
  if(a==="add_question"){
   const type=str(body.activity_type,20),question=str(body.question_text,1500),result=str(body.result_text,800),followup=str(body.followup_action,800),date=str(body.question_date,10);
   if(!["علاجي","إثرائي","تقويمي"].includes(type)||!question||!/^20\d\d-\d\d-\d\d$/.test(date))return fail(origin,"invalid_question");
   const q=await db.from("afaq_companion_questions").insert({student_id:s.student_id,academic_year:YEAR,term:t,activity_type:type,question_text:question,result_text:result,followup_action:followup,question_date:date,created_by:who}).select("id").single();
   if(q.error)throw q.error;return ok(origin,{id:q.data.id});
  }
  if(a==="retract_event"||a==="retract_question"){
   const uuid=str(body.record_id,60);if(!/^[a-f0-9-]{36}$/i.test(uuid))return fail(origin,"invalid_record");
   const table=a==="retract_event"?"afaq_companion_events":"afaq_companion_questions";
   const q=await db.from(table).update({retracted_at:new Date().toISOString(),retracted_by:who}).eq("id",uuid).eq("student_id",s.student_id).eq("academic_year",YEAR).eq("term",t).is("retracted_at",null).select("id").maybeSingle();
   if(q.error)throw q.error;if(!q.data)return fail(origin,"not_found",404);return ok(origin,{id:uuid});
  }
  return fail(origin,"unknown_action",404);
 }catch(error){console.error("companion:",error instanceof Error?error.message:String(error));return fail(origin,"server_error",500)}
});
