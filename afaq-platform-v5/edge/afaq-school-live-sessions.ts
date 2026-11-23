import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.95.0";
const url=Deno.env.get("SUPABASE_URL")||"";
let secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
try{secret=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}").default||secret}catch{}
const db=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
const table="afaq_school_live_sessions";
const allowedOrigins=new Set(["https://afaqmaths.github.io","http://localhost:8000","http://127.0.0.1:8000","http://localhost:5500","http://127.0.0.1:5500"]);
const classes=["السادس / ٤","السادس / ٥","السادس / ٦"];
const editors=["supervisor","supervisor_assistant"];
const staff=["supervisor","supervisor_assistant","director","deputy","it_viewer"];
const clean=(x,max=200)=>String(x??"").trim().slice(0,max);
function headers(origin){
 return {"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":allowedOrigins.has(origin)?origin:"https://afaqmaths.github.io",
 "Access-Control-Allow-Headers":"authorization,content-type,x-client-info","Access-Control-Allow-Methods":"POST,OPTIONS",
 "Cache-Control":"no-store","Vary":"Origin"};
}
const respond=(origin,body,status=200)=>new Response(JSON.stringify(body),{status,headers:headers(origin)});
async function hash(token){
 const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(token));
 return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("");
}
async function verify(req){
 const token=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
 if(!/^[A-Za-z0-9_-]{35,128}$/.test(token))return null;
 const {data,error}=await db.from("afaq_sessions").select("role,username,student_id,grade,revoked_at,expires_at")
 .eq("token_hash",await hash(token)).maybeSingle();
 if(error)throw error;
 return data&&!data.revoked_at&&new Date(data.expires_at)>new Date()?data:null;
}
async function getClass(studentId){
 if(!/^\d{12}$/.test(String(studentId||"")))return null;
 const {data,error}=await db.from("competition_students").select("class_name,active").eq("student_id",studentId).maybeSingle();
 if(error)throw error;
 return data?.active?data.class_name:null;
}
function sanitizeLink(x){
 const t=clean(x,900);if(!t)return null;
 try{const u=new URL(t);if(u.protocol!=="https:"||!u.hostname||u.username||u.password)return false;return t}catch{return false}
}
function formatPublic(row,now,editor=false){
 const d={id:row.id,title:row.title,subject:row.subject,grade:row.grade,class_name:row.class_name,
 teacher_name:row.teacher_name,details:row.details,starts_at:row.starts_at,duration_minutes:row.duration_minutes,published:row.published};
 if(editor||row.meeting_url&&(new Date(row.starts_at).getTime()-now<=15*60000)&&(now<new Date(row.starts_at).getTime()+(row.duration_minutes+15)*60000)){
  d.meeting_url=row.meeting_url;
 }
 return d;
}
Deno.serve(async(req)=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:headers(origin)});
 if(req.method!=="POST")return respond(origin,{ok:false,error:"method_not_allowed"},405);
 if(req.headers.get("content-length")&&Number(req.headers.get("content-length"))>12000)return respond(origin,{ok:false,error:"request_too_large"},413);
 try{
  const user=await verify(req);
  if(!user)return respond(origin,{ok:false,error:"unauthorized"},401);
  let payload;try{payload=await req.json()}catch{return respond(origin,{ok:false,error:"invalid_json"},400)}
  const action=clean(payload.action,40);
  const editing=editors.includes(user.role);
  if(action==="list"||action==="admin_list"){
   if(action==="admin_list"&&!editing)return respond(origin,{ok:false,error:"forbidden"},403);
   if(user.role==="demo")return respond(origin,{ok:true,sessions:[],message:"demo_account_no_private_meetings"});
   if(!staff.includes(user.role)&&user.role!=="student")return respond(origin,{ok:false,error:"forbidden"},403);
   const now=Date.now();let query=db.from(table).select("*").order("starts_at",{ascending:true}).limit(120);
   if(action==="list"){
    query=query.eq("published",true).gte("starts_at",new Date(now-7*86400000).toISOString());
    if(user.role==="student")query=query.eq("grade",6);
   }
   const {data,error}=await query;
   if(error)throw error;
   let records=data||[];
   if(user.role==="student"){
    const cls=await getClass(user.student_id);
    if(!cls||!classes.includes(cls))return respond(origin,{ok:false,error:"unauthorized_student"},403);
    records=records.filter(x=>x.grade===6&&(x.class_name===cls||x.class_name===null));
   }
   return respond(origin,{ok:true,sessions:records.map(x=>formatPublic(x,now,action==="admin_list"&&editing))});
  }
  if(!editing)return respond(origin,{ok:false,error:"forbidden"},403);
  if(action==="save"){
   const x=payload.session&&typeof payload.session==="object"?payload.session:{};
   const title=clean(x.title,140),subject=clean(x.subject||"الرياضيات",90),
    teacher_name=clean(x.teacher_name,120),details=clean(x.details,650),
    grade=Number(x.grade||6),class_name=x.class_name?clean(x.class_name,25):null,
    duration_minutes=Number(x.duration_minutes||45),published=x.published===true,
    meeting_url=sanitizeLink(x.meeting_url);
   const when=new Date(x.starts_at);
   if(title.length<3||subject.length<2||grade!==6||!Number.isInteger(duration_minutes)||duration_minutes<15||duration_minutes>180||
    class_name!==null&&!classes.includes(class_name)||Number.isNaN(when.getTime())||when.getUTCFullYear()<2026||when.getUTCFullYear()>2100||
    meeting_url===false)return respond(origin,{ok:false,error:"invalid_session"},400);
   const row={title,subject,grade,class_name,teacher_name,details,starts_at:when.toISOString(),
    duration_minutes,meeting_url,published,updated_at:new Date().toISOString()};
   let query=db.from(table);
   if(x.id){
    if(!/^[0-9a-f-]{36}$/.test(String(x.id)))return respond(origin,{ok:false,error:"invalid_id"},400);
    query=query.update(row).eq("id",x.id);
   }else query=query.insert(row);
   const {data,error}=await query.select("id").maybeSingle();
   if(error)throw error;
   if(!data)return respond(origin,{ok:false,error:"not_found"},404);
   return respond(origin,{ok:true,id:data.id});
  }
  if(action==="delete"){
   const id=clean(payload.id,50);
   if(!/^[0-9a-f-]{36}$/.test(id))return respond(origin,{ok:false,error:"invalid_id"},400);
   const {error}=await db.from(table).delete().eq("id",id);if(error)throw error;
   return respond(origin,{ok:true});
  }
  return respond(origin,{ok:false,error:"unknown_action"},400);
 }catch(e){
  console.error("school live calendar",e instanceof Error?e.message:"error");
  return respond(origin,{ok:false,error:"service_unavailable"},503);
 }
});