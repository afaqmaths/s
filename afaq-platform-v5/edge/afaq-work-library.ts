import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.95.0";

// All file access passes through the platform's authenticated sessions.
// No service key or unpublished answer is returned to the browser.
const PROJECT_URL=Deno.env.get("SUPABASE_URL")||"";
let SERVICE_KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
try{SERVICE_KEY=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}").default||SERVICE_KEY}catch{}
const db=createClient(PROJECT_URL,SERVICE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const BUCKET="afaq-work-private";
const ORIGINS=new Set(["https://afaqmaths.github.io","http://localhost:8000","http://127.0.0.1:8000","http://localhost:5500","http://127.0.0.1:5500"]);
const EXT:Record<string,string>={
 "application/pdf":"pdf","image/jpeg":"jpg","image/png":"png","image/webp":"webp",
 "application/msword":"doc","application/vnd.openxmlformats-officedocument.wordprocessingml.document":"docx",
 "application/vnd.ms-excel":"xls","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":"xlsx",
 "application/vnd.ms-powerpoint":"ppt","application/vnd.openxmlformats-officedocument.presentationml.presentation":"pptx",
 "text/plain":"txt","video/mp4":"mp4","video/webm":"webm","video/quicktime":"mov"
};
const MAX_BYTES=26214400;
const txt=(v:any,n=300)=>String(v??"").trim().slice(0,n);
const headers=(origin:string)=>({
 "Content-Type":"application/json; charset=utf-8",
 "Access-Control-Allow-Origin":ORIGINS.has(origin)?origin:"https://afaqmaths.github.io",
 "Access-Control-Allow-Headers":"authorization,content-type,x-client-info",
 "Access-Control-Allow-Methods":"POST,OPTIONS",
 "Cache-Control":"no-store",Vary:"Origin"
});
const ok=(origin:string,data:any)=>new Response(JSON.stringify({ok:true,...data}),{headers:headers(origin)});
const err=(origin:string,error:string,status=400)=>new Response(JSON.stringify({ok:false,error}),{status,headers:headers(origin)});
const isSupervisor=(role:string)=>role==="supervisor";
const isStaff=(role:string)=>["supervisor","supervisor_assistant","director","deputy","it_viewer"].includes(role);
const uuid=(v:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
async function sha(value:string){
 const raw=new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value)));
 return [...raw].map(x=>x.toString(16).padStart(2,"0")).join("");
}
async function session(req:Request){
 const token=(req.headers.get("Authorization")||"").replace(/^Bearer\s+/i,"");
 if(token.length<35||token.length>128)return null;
 const {data,error}=await db.from("afaq_sessions").select("role,student_id,grade,expires_at,revoked_at")
   .eq("token_hash",await sha(token)).maybeSingle();
 if(error)throw error;
 return data&&!data.revoked_at&&new Date(data.expires_at).getTime()>Date.now()?data:null;
}
function canSee(item:any,user:any){
 if(!item)return false;
 if(["supervisor","supervisor_assistant"].includes(user.role))return true;
 if(user.role==="director"||user.role==="deputy"||user.role==="it_viewer")return item.published===true;
 return user.role==="student"&&Number(user.grade)===6&&item.published===true&&item.audience==="student";
}
function canSeeDocument(item:any,role:string){
 return item && (role!=="student"||item.answer_released===true);
}
async function getItem(id:string){
 if(!uuid(id))return null;
 const {data,error}=await db.from("afaq_work_items").select("*").eq("id",id).maybeSingle();
 if(error)throw error;return data;
}
async function validLesson(id:number){
 if(!Number.isSafeInteger(id)||id<1)return false;
 const {data,error}=await db.from("afaq_work_lessons").select("id").eq("id",id)
   .eq("grade",6).eq("semester",1).maybeSingle();
 if(error)throw error;return !!data;
}
async function storageRemove(paths:string[]){
 if(!paths.length)return;
 const {error}=await db.storage.from(BUCKET).remove(paths);
 if(error)throw error;
}
function youtube(value:string){
 try{
  const u=new URL(value);
  if(u.protocol!=="https:"||u.username||u.password)return null;
  if(!["youtube.com","www.youtube.com","m.youtube.com","youtu.be","www.youtu.be",
    "www.youtube-nocookie.com","youtube-nocookie.com"].includes(u.hostname.toLowerCase()))return null;
  if(u.toString().length>900)return null;
  return u.toString();
 }catch{return null}
}

Deno.serve(async (req:Request)=>{
 const origin=req.headers.get("Origin")||"";
 if(req.method==="OPTIONS")return new Response("ok",{headers:headers(origin)});
 if(req.method!=="POST")return err(origin,"method_not_allowed",405);
 if(origin&&!ORIGINS.has(origin))return err(origin,"origin_not_allowed",403);
 try{
  const b=await req.json(),action=txt(b.action,40),user=await session(req);
  if(!user)return err(origin,"unauthorized",401);
  if(!isStaff(user.role)&&!(user.role==="student"&&Number(user.grade)===6))
    return err(origin,"forbidden",403);

  if(action==="list"){
   // Server-side student-view filtering, restricted to the authenticated principal supervisor.
   const preview=b.preview_as_student===true&&isSupervisor(user.role);
   const viewUser=preview?{...user,role:"student",grade:6}:user;
   const [{data:lessons,error:le},{data:all,error:ie}]=await Promise.all([
    db.from("afaq_work_lessons").select("id,unit_no,unit_name,lesson_code,lesson_title,sort_order")
      .eq("grade",6).eq("semester",1).order("sort_order").limit(200),
    db.from("afaq_work_items").select("id,kind,audience,lesson_id,title,instructions,published,answer_released,sort_order,created_at,updated_at")
      .order("sort_order").order("created_at").limit(5000)
   ]);
   if(le||ie)throw le||ie;
   const items=(all||[]).filter(x=>canSee(x,viewUser));
   const itemIds=items.map(x=>x.id);
   let documents:any[]=[],videos:any[]=[];
   if(itemIds.length){
    const [dr,vr]=await Promise.all([
     db.from("afaq_work_documents").select("id,item_id,doc_role,file_name,mime_type,bytes,created_at")
       .in("item_id",itemIds).order("created_at").limit(10000),
     db.from("afaq_work_video_links").select("id,item_id,title,url,created_at")
       .in("item_id",itemIds).order("created_at").limit(10000)
    ]);
    if(dr.error||vr.error)throw dr.error||vr.error;
    const map=new Map(items.map(x=>[x.id,x]));
    documents=(dr.data||[]).filter(x=>x.doc_role!=="answer"||canSeeDocument(map.get(x.item_id),viewUser.role));
    videos=vr.data||[];
   }
   return ok(origin,{lessons:lessons||[],items,documents,videos,
    can_manage:isSupervisor(viewUser.role),can_see_answers:isStaff(viewUser.role),
    preview_as_student:preview});
  }
  if(action==="save_item"){
   if(!isSupervisor(user.role))return err(origin,"forbidden",403);
   const id=txt(b.id,50),kind=txt(b.kind,20),audience=txt(b.audience,20),
     title=txt(b.title,160),instructions=txt(b.instructions,3000);
   if(!["worksheet","task","lesson_resource"].includes(kind)||!["student","management"].includes(audience)||
      title.length<2)return err(origin,"invalid_item");
   const lessonId=b.lesson_id==null||b.lesson_id===""?null:Number(b.lesson_id);
   if(["worksheet","lesson_resource"].includes(kind)&&(audience!=="student"||!lessonId||!await validLesson(lessonId)))
     return err(origin,"invalid_lesson");
   if(kind==="task"&&lessonId!==null&&!await validLesson(lessonId))
     return err(origin,"invalid_lesson");
   const current=id?await getItem(id):null;
   if(id&&!current)return err(origin,"item_not_found",404);
   const fields:any={kind,audience,lesson_id:lessonId,title,instructions,
     published:b.published===true,answer_released:b.answer_released===true,
     updated_at:new Date().toISOString()};
   if(current){
    // Never move a worksheet, lesson resource, or task's existing files to another scope.
    if(current.kind!==kind||current.audience!==audience||current.lesson_id!==lessonId)
      return err(origin,"item_scope_locked");
    const {error}=await db.from("afaq_work_items").update(fields).eq("id",id);
    if(error)throw error;return ok(origin,{id,updated:true});
   }
   const {data,error}=await db.from("afaq_work_items").insert({...fields,created_by:"supervisor"})
     .select("id").single();
   if(error)throw error;return ok(origin,{id:data.id,updated:false});
  }
  if(action==="delete_item"){
   if(!isSupervisor(user.role))return err(origin,"forbidden",403);
   const item=await getItem(txt(b.id,50));
   if(!item)return err(origin,"item_not_found",404);
   const [stored,pending]=await Promise.all([
    db.from("afaq_work_documents").select("storage_path").eq("item_id",item.id),
    db.from("afaq_work_uploads_pending").select("storage_path").eq("item_id",item.id)
   ]);
   if(stored.error||pending.error)throw stored.error||pending.error;
   const paths=[...(stored.data||[]),...(pending.data||[])].map(x=>x.storage_path);
   // Remove metadata first; orphaned storage files cannot be accessed through the authenticated service.
   const {error}=await db.from("afaq_work_items").delete().eq("id",item.id);
   if(error)throw error;
   try{await storageRemove(paths)}catch(e){console.error("afaq-work item storage cleanup",e)}
   return ok(origin,{deleted:true});
  }
  if(action==="upload_prepare"){
   if(!isSupervisor(user.role))return err(origin,"forbidden",403);
   const item=await getItem(txt(b.item_id,50));
   if(!item)return err(origin,"item_not_found",404);
   const role=txt(b.doc_role,25),name=txt(b.file_name,200),
     mime=txt(b.mime_type,150).toLowerCase(),bytes=Number(b.bytes);
   if(!["worksheet","answer","attachment","video"].includes(role)||
       !name||!EXT[mime]||!Number.isSafeInteger(bytes)||bytes<1||bytes>MAX_BYTES)
     return err(origin,"invalid_upload");
   if(role==="video"&&!mime.startsWith("video/"))return err(origin,"invalid_video_type");
   if(role!=="video"&&mime.startsWith("video/"))return err(origin,"invalid_file_type");
   const folder=item.id,filename=crypto.randomUUID()+"."+EXT[mime],path=folder+"/"+filename;
   const {data:pending,error:pe}=await db.from("afaq_work_uploads_pending").insert({
    item_id:item.id,doc_role:role,storage_path:path,file_name:name,mime_type:mime,bytes
   }).select("id").single();
   if(pe)throw pe;
   const {data:signed,error:se}=await db.storage.from(BUCKET).createSignedUploadUrl(path);
   if(se){
    await db.from("afaq_work_uploads_pending").delete().eq("id",pending.id);
    throw se;
   }
   return ok(origin,{pending_id:pending.id,upload_url:signed.signedUrl,path:signed.path,
     token:signed.token,max_bytes:MAX_BYTES});
  }
  if(action==="upload_confirm"){
   if(!isSupervisor(user.role))return err(origin,"forbidden",403);
   const id=txt(b.pending_id,50);
   if(!uuid(id))return err(origin,"invalid_pending_id");
   const {data:pending,error:pe}=await db.from("afaq_work_uploads_pending").select("*")
      .eq("id",id).maybeSingle();
   if(pe)throw pe;
   if(!pending)return err(origin,"upload_not_found",404);
   if(!await getItem(pending.item_id))return err(origin,"item_not_found",404);
   const filename=pending.storage_path.split("/").pop();
   const {data:files,error:le}=await db.storage.from(BUCKET).list(pending.item_id,
     {limit:100,search:filename});
   if(le)throw le;
   const match=(files||[]).find(f=>f.name===filename);
   if(!match)return err(origin,"upload_missing",409);
   if(match.metadata?.size&&Number(match.metadata.size)!==Number(pending.bytes))
     return err(origin,"upload_size_mismatch",409);
   const {data:inserted,error:de}=await db.from("afaq_work_documents").insert({
    item_id:pending.item_id,doc_role:pending.doc_role,storage_path:pending.storage_path,
    file_name:pending.file_name,mime_type:pending.mime_type,bytes:pending.bytes
   }).select("id").single();
   if(de)throw de;
   await db.from("afaq_work_uploads_pending").delete().eq("id",pending.id);
   return ok(origin,{id:inserted.id});
  }
  if(action==="file_url"){
   const id=txt(b.id,50);
   if(!uuid(id))return err(origin,"invalid_file");
   const {data:doc,error:de}=await db.from("afaq_work_documents")
      .select("id,item_id,doc_role,storage_path").eq("id",id).maybeSingle();
   if(de)throw de;
   if(!doc)return err(origin,"file_not_found",404);
   const item=await getItem(doc.item_id);
   const preview=b.preview_as_student===true&&isSupervisor(user.role);
   const viewUser=preview?{...user,role:"student",grade:6}:user;
   if(!canSee(item,viewUser)||doc.doc_role==="answer"&&!canSeeDocument(item,viewUser.role))
     return err(origin,"forbidden",403);
   const {data,error}=await db.storage.from(BUCKET).createSignedUrl(doc.storage_path,120);
   if(error)throw error;
   return ok(origin,{url:data.signedUrl});
  }
  if(action==="delete_file"){
   if(!isSupervisor(user.role))return err(origin,"forbidden",403);
   const id=txt(b.id,50);
   if(!uuid(id))return err(origin,"invalid_file");
   const {data:doc,error:re}=await db.from("afaq_work_documents")
     .select("id,storage_path").eq("id",id).maybeSingle();
   if(re)throw re;if(!doc)return err(origin,"file_not_found",404);
   const {error:de}=await db.from("afaq_work_documents").delete().eq("id",id);
   if(de)throw de;
   try{await storageRemove([doc.storage_path])}catch(e){console.error("afaq-work file storage cleanup",e)}
   return ok(origin,{deleted:true});
  }
  if(action==="add_video_link"){
   if(!isSupervisor(user.role))return err(origin,"forbidden",403);
   const item=await getItem(txt(b.item_id,50));
   if(!item)return err(origin,"item_not_found",404);
   const url=youtube(txt(b.url,900)),title=txt(b.title,140)||"فيديو الدرس";
   if(!url)return err(origin,"invalid_youtube_url");
   const {data,error}=await db.from("afaq_work_video_links")
     .insert({item_id:item.id,title,url}).select("id").single();
   if(error)throw error;return ok(origin,{id:data.id});
  }
  if(action==="delete_video_link"){
   if(!isSupervisor(user.role))return err(origin,"forbidden",403);
   const id=txt(b.id,50);
   if(!uuid(id))return err(origin,"invalid_video");
   const {error}=await db.from("afaq_work_video_links").delete().eq("id",id);
   if(error)throw error;return ok(origin,{deleted:true});
  }
  return err(origin,"unknown_action",404);
 }catch(e:any){console.error("afaq-work-library",String(e?.message||"unknown"));
  return err(origin,"server_error",500)}
});
