import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.95.0";

const URL=Deno.env.get("SUPABASE_URL")||"";
let SECRET=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
try{SECRET=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}").default||SECRET}catch{}
const db=createClient(URL,SECRET,{auth:{persistSession:false,autoRefreshToken:false}});
const ORIGINS=new Set(["https://afaqmaths.github.io","http://localhost:8000","http://127.0.0.1:8000","http://localhost:5500","http://127.0.0.1:5500"]);
const CLASSES=["السادس / ٤","السادس / ٥","السادس / ٦"] as const;
const YEAR="2026/2027";
const FIELDS=[["oral_1",5,"الأعمال الشفوية ١"],["oral_2",5,"الأعمال الشفوية ٢"],
 ["homework_1",5,"الواجبات المنزلية ١"],["homework_2",5,"الواجبات المنزلية ٢"],
 ["question_1",5,"السؤال القصير الأول"],["question_2",5,"السؤال القصير الثاني"],
 ["exam_1",10,"الاختبار القصير الأول"],["exam_2",10,"الاختبار القصير الثاني"],
 ["project",10,"المشروع"],["final_exam",40,"الاختبار النهائي"]] as const;
type Session={role:string;username:string;student_id:string|null;token_hash:string};
const esc=(s:unknown,n=100)=>String(s??"").trim().slice(0,n);
const digits=(v:unknown)=>esc(v,150).replace(/[٠-٩۰-۹]/g,x=>{
 const i="٠١٢٣٤٥٦٧٨٩".indexOf(x);return String(i>=0?i:"۰۱۲۳۴۵۶۷۸۹".indexOf(x))
});
const sum=(values:number[])=>values.reduce((a,b)=>a+b,0);
const roleRead=(r:string)=>["supervisor","supervisor_assistant","director","deputy"].includes(r);
const roleEdit=(r:string)=>["supervisor","supervisor_assistant"].includes(r);
const header=(origin:string)=>({
 "Content-Type":"application/json; charset=utf-8",
 "Access-Control-Allow-Origin":ORIGINS.has(origin)?origin:"https://afaqmaths.github.io",
 "Access-Control-Allow-Headers":"authorization,content-type,x-client-info",
 "Access-Control-Allow-Methods":"POST, OPTIONS",
 "Cache-Control":"no-store",Vary:"Origin"
});
const ok=(o:string,data:Record<string,unknown>,status=200)=>new Response(JSON.stringify({ok:true,...data}),{status,headers:header(o)});
const fail=(o:string,error:string,status=400)=>new Response(JSON.stringify({ok:false,error}),{status,headers:header(o)});
async function hash(s:string){const out=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));
 return [...new Uint8Array(out)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
async function authenticate(req:Request):Promise<Session|null>{
 const bearer=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
 if(bearer.length<35||bearer.length>128)return null;
 const {data,error}=await db.from("afaq_sessions").select("role,username,student_id,token_hash,revoked_at,expires_at")
 .eq("token_hash",await hash(bearer)).maybeSingle();
 if(error)throw error;
 if(!data||data.revoked_at||new Date(data.expires_at).getTime()<=Date.now())return null;
 return data as Session;
}
function getTerm(raw:unknown){const n=Number(digits(raw));return n===1||n===2?n:null}
function parseScore(v:unknown,max:number):number|null|undefined{
 if(v===null||v===undefined||v==="")return null;
 const text=digits(v);
 if(!/^\d+$/.test(text))return undefined;
 const n=Number(text);
 return Number.isInteger(n)&&n>=0&&n<=max?n:undefined;
}
const scoreLevel=(v:number)=>v>=90?{ar:"أ",latin:"A"}:
 v>=80?{ar:"ب",latin:"B"}:
 v>=65?{ar:"ج",latin:"C"}:
 v>=50?{ar:"د",latin:"D"}:{ar:"هـ",latin:"E"};
function calculated(row:Record<string,any>|null){
 const data:Record<string,number|null>={};for(const [field] of FIELDS)data[field]=row?.[field]??null;
 const coursework=FIELDS.slice(0,9);
 const observed=coursework.filter(([field])=>data[field]!==null);
 const coursework_total=observed.length?sum(observed.map(([field])=>Number(data[field]))):null;
 const coursework_complete=observed.length===9;
 const final_present=data.final_exam!==null;
 const complete=coursework_complete&&final_present;
 const total=complete?Number(coursework_total)+Number(data.final_exam):null;
 return {...data,coursework_total,coursework_complete,coursework_recorded:observed.length,
  final_present,complete,total,level:total===null?null:scoreLevel(total),
  diagnostic_score:row?.diagnostic_score??null,diagnostic_max:Number(row?.diagnostic_max??10),
  remarks:row?.remarks||"",
  status:row?.status||"not_started",revision:row?.revision||0,
  updated_at:row?.updated_at||null,approved_at:row?.approved_at||null,recorded_by:row?.recorded_by||null};
}
const dataColumns="student_id,academic_year,term,diagnostic_score,diagnostic_max,remarks,oral_1,oral_2,homework_1,homework_2,question_1,question_2,exam_1,exam_2,project,final_exam,status,revision,created_at,updated_at,approved_at,recorded_by";
async function classReport(className:string,term:number){
 const r=await db.from("competition_students")
  .select("student_id,serial_no,class_name,full_name,display_name")
  .eq("active",true).eq("class_name",className).order("serial_no");
 if(r.error)throw r.error;
 const roster=r.data||[];
 const ids=roster.map(x=>x.student_id);
 let registers:any[]=[];
 if(ids.length){
  const rows=await db.from("afaq_official_math_grades").select(dataColumns)
   .eq("academic_year",YEAR).eq("term",term).in("student_id",ids);
  if(rows.error)throw rows.error;registers=rows.data||[];
 }
 const byId=new Map(registers.map(x=>[x.student_id,x]));
 let aEvents:any[]=[];
 if(ids.length){
  const r=await db.from("afaq_student_assessments").select("student_id,a_plus_points,a_minus_points").in("student_id",ids);
  if(r.error)throw r.error;
  aEvents=r.data||[];
 }
 const aIndex=new Map(aEvents.map(x=>[x.student_id,x]));
 const students=roster.map(s=>{
  const points=aIndex.get(s.student_id);
  const plus=Number(points?.a_plus_points||0),minus=Number(points?.a_minus_points||0);
  // مؤشر غير رسمي: سقف صافي النقاط 40 ثم يقسم على اثنين للحصول على مؤشر من 20.
  const indicator20=Math.round(Math.min(40,Math.max(0,plus-minus))/2*100)/100;
  return {student_id:s.student_id,serial_no:s.serial_no,class_name:s.class_name,
   full_name:s.full_name||s.display_name,marks:calculated(byId.get(s.student_id)||null),
   a_indicator20:indicator20,a_plus_points:plus,a_minus_points:minus};
 });
 const timestamps=registers.map(x=>x.updated_at).filter(Boolean).sort();
 return {academic_year:YEAR,term,class_name:className,students,count:students.length,
  updated_at:timestamps.length?timestamps[timestamps.length-1]:null,
  generated_at:new Date().toISOString(),
  approved_count:registers.filter(x=>x.status==="approved").length,
  complete_count:registers.filter(x=>calculated(x).complete).length,
  coursework_full_count:registers.filter(x=>calculated(x).coursework_complete).length};
}
async function ensureRoster(serial:unknown,cls:string){
 const n=Number(digits(serial));
 if(!Number.isInteger(n)||n<1||n>100||!CLASSES.includes(cls as any))return null;
 const r=await db.from("competition_students").select("student_id,serial_no,class_name,full_name,display_name")
 .eq("active",true).eq("class_name",cls).eq("serial_no",n).maybeSingle();
 if(r.error)throw r.error;return r.data;
}
async function existing(studentId:string,term:number){
 const r=await db.from("afaq_official_math_grades").select(dataColumns)
 .eq("student_id",studentId).eq("academic_year",YEAR).eq("term",term).maybeSingle();
 if(r.error)throw r.error;return r.data;
}
Deno.serve(async req=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response("ok",{headers:header(origin)});
 if(req.method!=="POST")return fail(origin,"method_not_allowed",405);
 if(origin&&!ORIGINS.has(origin))return fail(origin,"origin_not_allowed",403);
 try{
  let body:any;try{body=await req.json()}catch{return fail(origin,"invalid_json")}
  const action=esc(body?.action,50);
  const session=await authenticate(req);
  if(!session)return fail(origin,"unauthorized",401);
  if(action==="student_approved"){
   if(session.role!=="student"||!session.student_id)return fail(origin,"forbidden",403);
   const q=await db.from("afaq_official_math_grades").select(dataColumns)
    .eq("student_id",session.student_id).eq("academic_year",YEAR).eq("status","approved")
    .order("term");
   if(q.error)throw q.error;
   return ok(origin,{terms:(q.data||[]).map(x=>({term:x.term,...calculated(x)}))});
  }
  if(!roleRead(session.role))return fail(origin,"forbidden",403);
  if(action==="class_report"){
   const cls=esc(body.class_name,40),term=getTerm(body.term);
   if(!CLASSES.includes(cls as any)||!term)return fail(origin,"invalid_class_or_term");
   return ok(origin,{report:await classReport(cls,term)});
  }
  if(action==="all_reports"){
   const term=getTerm(body.term);
   if(!term)return fail(origin,"invalid_term");
   const reports=await Promise.all(CLASSES.map(c=>classReport(c,term)));
   return ok(origin,{academic_year:YEAR,term,reports,generated_at:new Date().toISOString()});
  }
  if(action==="save_row"){
   if(!roleEdit(session.role))return fail(origin,"forbidden",403);
   const cls=esc(body.class_name,40),term=getTerm(body.term);
   if(!CLASSES.includes(cls as any)||!term)return fail(origin,"invalid_class_or_term");
   const person=await ensureRoster(body.serial_no,cls);
   if(!person)return fail(origin,"student_not_found",404);
   const prev=await existing(person.student_id,term);
   if(prev?.status==="approved")return fail(origin,"approved_reopen_first",409);
   const expected=Number(body.expected_revision);
   if(!Number.isInteger(expected)||expected!==(prev?.revision||0))return fail(origin,"grade_changed_reload",409);
   const patch:Record<string,unknown>={};
   const diagnostic_max=body.diagnostic_max===null||body.diagnostic_max===undefined||body.diagnostic_max===""?10:Number(digits(body.diagnostic_max));
   if(!Number.isFinite(diagnostic_max)||diagnostic_max<=0||diagnostic_max>100)return fail(origin,"invalid_diagnostic_max",400);
   const diag=body.diagnostic_score===null||body.diagnostic_score===undefined||body.diagnostic_score===""?
    null:Number(digits(body.diagnostic_score));
   if(diag!==null&&(!Number.isFinite(diag)||diag<0||diag>diagnostic_max))
     return fail(origin,"invalid_diagnostic_score",400);
   const remarks=esc(body.remarks,500);
   patch.diagnostic_score=diag;
   patch.diagnostic_max=diagnostic_max;
   patch.remarks=remarks;
   for(const [key,max] of FIELDS){
    const value=parseScore(body[key],max);
    if(value===undefined)return fail(origin,"invalid_mark:"+key,400);
    patch[key]=value;
   }
   const actor=session.role+":"+session.username;
   let result:any;
   if(prev){
    const update=await db.from("afaq_official_math_grades")
     .update({...patch,status:"draft",recorded_by:actor})
     .eq("student_id",person.student_id).eq("academic_year",YEAR).eq("term",term)
     .eq("revision",prev.revision).select(dataColumns).maybeSingle();
    if(update.error)throw update.error;
    if(!update.data)return fail(origin,"grade_changed_reload",409);result=update.data;
   }else{
    const save=await db.from("afaq_official_math_grades").insert({
     student_id:person.student_id,academic_year:YEAR,term,
     ...patch,status:"draft",recorded_by:actor
    }).select(dataColumns).single();
    if(save.error){
     if(save.error.code==="23505")return fail(origin,"grade_changed_reload",409);
     throw save.error;
    }
    result=save.data;
   }
   return ok(origin,{serial_no:person.serial_no,class_name:cls,marks:calculated(result)});
  }
  if(action==="approve_row"||action==="reopen_row"){
   if(session.role!=="supervisor")return fail(origin,"supervisor_only",403);
   const cls=esc(body.class_name,40),term=getTerm(body.term);
   if(!CLASSES.includes(cls as any)||!term)return fail(origin,"invalid_class_or_term");
   const person=await ensureRoster(body.serial_no,cls);
   if(!person)return fail(origin,"student_not_found",404);
   const prev=await existing(person.student_id,term);
   if(!prev)return fail(origin,"no_grades_to_approve",404);
   const expected=Number(body.expected_revision);
   if(!Number.isInteger(expected)||expected!==prev.revision)return fail(origin,"grade_changed_reload",409);
   if(action==="approve_row"){
    if(prev.status!=="draft")return fail(origin,"already_approved",409);
    if(!calculated(prev).complete)return fail(origin,"incomplete_official_grade",409);
   }else if(prev.status!=="approved")return fail(origin,"not_approved",409);
   const approving=action==="approve_row";
   const patch=approving?{status:"approved",approved_by:session.username,approved_at:new Date().toISOString(),
    recorded_by:session.role+":"+session.username}:
    {status:"draft",approved_by:null,approved_at:null,recorded_by:session.role+":"+session.username};
   const updated=await db.from("afaq_official_math_grades").update(patch)
    .eq("student_id",person.student_id).eq("academic_year",YEAR).eq("term",term)
    .eq("revision",prev.revision).eq("status",approving?"draft":"approved")
    .select(dataColumns).maybeSingle();
   if(updated.error)throw updated.error;
   if(!updated.data)return fail(origin,"grade_changed_reload",409);
   return ok(origin,{serial_no:person.serial_no,marks:calculated(updated.data)});
  }
  if(action==="row_audit"){
   if(!roleEdit(session.role))return fail(origin,"forbidden",403);
   const cls=esc(body.class_name,40),term=getTerm(body.term);
   const person=await ensureRoster(body.serial_no,cls);
   if(!person||!term)return fail(origin,"student_not_found",404);
   const rows=await db.from("afaq_official_math_audit")
    .select("operation,actor,changed_at,id").eq("student_id",person.student_id)
    .eq("academic_year",YEAR).eq("term",term).order("changed_at",{ascending:false}).limit(35);
   if(rows.error)throw rows.error;return ok(origin,{audit:rows.data||[]});
  }
  return fail(origin,"unknown_action",404);
 }catch(e){
  console.error("official_grade_register:",e instanceof Error?e.message:String(e));
  return fail(origin,"server_error",500);
 }
});
