/* API منفصلة لبوابات آفاق العامة، دون تعديل نظام نتائج الطلاب والمسابقات الرسمي. */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.95.0";
const url=Deno.env.get("SUPABASE_URL")||"";
let secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
try{secret=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}").default||secret}catch{}
const db=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
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

/* Gentle promotional set with exactly the same 5 stages and 38-question scoring model
   as the official competition: 10+10+10 MCQ, then 4+4 multistep, 50 raw x2 = 100. */
const starsDigits=(v:unknown)=>String(v).replace(/[0-9]/g,c=>"٠١٢٣٤٥٦٧٨٩"[Number(c)]);
const starsEasyChoiceSource=[
 ["أي عدد من هذه الأعداد زوجي؟","12",["7","9","15"],"الأعداد الزوجية"],
 ["ما العدد الأولي من بين هذه الأعداد؟","7",["4","6","9"],"الأعداد الأولية"],
 ["كم ناتج ٦ × ٤ ؟","24",["20","26","28"],"الضرب"],
 ["أي عدد يُعد من مضاعفات ٥؟","25",["12","18","22"],"المضاعفات"],
 ["أي عدد يُعد عاملًا للعدد ١٢؟","3",["5","7","11"],"العوامل"],
 ["أكمل المتتالية: ٣ ، ٦ ، ٩ ، ...","12",["10","11","13"],"المتتاليات"],
 ["ما منزلة الرقم ٤ في العدد ١٤٢٥؟","المئات",["العشرات","الآحاد","الآلاف"],"القيمة المكانية"],
 ["قرّب العدد ٤٣٢ إلى أقرب عشرة.","430",["420","440","400"],"التقريب"],
 ["ما أكبر عدد من الأعداد الآتية؟","256",["245","234","250"],"المقارنة"],
 ["ما العدد السابق مباشرة للعدد ١٠٠٠؟","999",["1001","990","899"],"الترتيب"],
 ["ما ناتج قسمة ٤٨ على ٦؟","8",["6","7","9"],"القسمة"],
 ["ما المضاعف الرابع للعدد ٣؟","12",["6","9","15"],"المضاعفات"],
 ["كم ناتج ٢٥ + ٣٥؟","60",["50","55","65"],"الجمع"],
 ["أي عدد يقبل القسمة على ٣؟","27",["16","20","25"],"قواعد القسمة"],
 ["ما العامل المشترك بين ١٢ و١٨؟","6",["5","7","11"],"العوامل المشتركة"],
 ["احسب ذهنيًا: ١٢٠ ÷ ١٠.","12",["10","120","1200"],"القسمة على 10"],
 ["ما العدد الفردي من بين الأعداد؟","33",["20","28","42"],"الزوجي والفردي"],
 ["أكمل: ١٠ ، ٢٠ ، ٣٠ ، ...","40",["35","45","50"],"المتتاليات"],
 ["قرّب العدد ١٦٨ إلى أقرب عشرة.","170",["160","150","180"],"التقريب"],
 ["ما قيمة الرقم ٥ في العدد ٣٥٨؟","50",["5","500","5000"],"القيمة المكانية"],
 ["أوجد ناتج ١٢ × ٥.","60",["50","55","65"],"الضرب الذهني"],
 ["ما ناتج ٨٤ ÷ ٧؟","12",["11","13","14"],"القسمة"],
 ["ما العدد الذي يكمل: ٤ ، ٨ ، ١٢ ، ... ؟","16",["14","18","20"],"المتتاليات"],
 ["أي الأعداد أصغر من ١٥٠؟","149",["151","160","200"],"المقارنة"],
 ["أي عدد من مضاعفات ٤؟","28",["22","26","30"],"المضاعفات"],
 ["ما ناتج ٣٢ + ١٨؟","50",["45","48","55"],"الجمع"],
 ["كم ناتج ضرب ٧ × ٨؟","56",["54","58","64"],"جداول الضرب"],
 ["ما أكبر عامل للعدد ١٨ غير العدد نفسه؟","9",["6","8","12"],"العوامل"],
 ["أوجد ناتج ٤٥٠ ÷ ١٠.","45",["40","50","450"],"القسمة على 10"],
 ["ما أصغر عدد أولي؟","2",["1","4","6"],"الأعداد الأولية"]
] as const;
const starsEasyComplexSource=[
 {prompt:"العدد ١٢٤٥ يتكون من أربع منازل. استخدم القيمة المكانية والتقريب.",
  topic:"القيمة المكانية",parts:[["كم قيمة الرقم ٢ في العدد؟",200],["قرّب العدد إلى أقرب ألف.",1000]]},
 {prompt:"لدى فريق ٢٤ قلمًا، يريد ترتيبها في مجموعات متساوية.",
  topic:"العوامل",parts:[["كم مجموعة إذا كانت كل مجموعة تضم ٦ أقلام؟",4],["كم قلمًا يمثل نصف العدد؟",12],["ما أصغر عدد أولي من عوامل ٢٤؟",2]]},
 {prompt:"في مكتبة المدرسة ٢٥ كتابًا، أضيف إليها ١٥ كتابًا ثم وزعت بالتساوي على ٥ أرفف.",
  topic:"الجمع والقسمة",parts:[["ما مجموع الكتب الآن؟",40],["كم كتابًا يوضع على كل رف؟",8]]},
 {prompt:"يوزع المعلم ٣٦ بطاقة على مجموعات متساوية، ثم يقارن عدد البطاقات.",
  topic:"العوامل والقسمة",parts:[["كم مجموعة مكوّنة من ٤ بطاقات؟",9],["كم مجموعة مكوّنة من ٦ بطاقات؟",6],["كم بطاقة في نصف العدد؟",18]]},
 {prompt:"في متجر المدرسة، سعر القلم ريالان وسعر الدفتر ٣ ريالات. مع سارة ١٠ ريالات.",
  topic:"موقف حياتي",parts:[["كم مجموع سعر القلم والدفتر؟",5],["كم ريالًا يتبقى من الميزانية؟",5]]},
 {prompt:"أكمل بعض مضاعفات العدد ٦ لتحصل على متتالية صحيحة.",
  topic:"المضاعفات",parts:[["ما ناتج ٦ × ٤ ؟",24],["ما ناتج ٦ × ٥ ؟",30],["ما ناتج ٦ × ٦ ؟",36]]},
 {prompt:"انظر إلى المتتالية: ٥ ، ١٠ ، ١٥ ، ... ، ... .",
  topic:"المتتاليات",parts:[["ما العدد التالي بعد ١٥؟",20],["ما العدد الذي يليه مباشرة؟",25]]},
 {prompt:"لدى طالب ٩٦ بطاقة ويريد تقسيمها على مجموعات متساوية.",
  topic:"القسمة والاستدلال",parts:[["كم ناتج ٩٦ ÷ ٣؟",32],["كم ناتج ٩٦ ÷ ٤؟",24],["كم ناتج ٩٦ ÷ ٦؟",16]]}
] as const;

const starsVisual=(topic:string,ordinal:number)=>{
 const palette=["#145c91","#1c9277","#a57928","#8057ad","#b96084"];
 const stroke=palette[(ordinal-1)%5];
 const chips=Array.from({length:5},(_,i)=>'<rect x="'+(56+i*128)+'" y="111" rx="15" width="94" height="76" fill="#fff" stroke="'+stroke+'" stroke-width="3"/>'+
 '<circle cx="'+(102+i*128)+'" cy="149" r="'+(12+(i%3)*4)+'" fill="'+stroke+'" opacity=".8"/>').join('');
 return '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="235" viewBox="0 0 720 235">'+
 '<rect x="3" y="3" width="714" height="229" rx="26" fill="#f2f9ff" stroke="'+stroke+'" stroke-width="4"/>'+
 '<text x="360" y="59" text-anchor="middle" font-size="32" font-family="Tahoma, Arial" font-weight="bold" fill="'+stroke+'">'+topic+'</text>'+
 chips+
 '<text x="360" y="220" text-anchor="middle" font-size="17" font-family="Tahoma, Arial" fill="'+stroke+'">تأمل الفكرة الرياضية ثم أجب عن السؤال</text></svg>';
};

const starsEasyQuestions=[
 ...starsEasyChoiceSource.map((x,i)=>{
  const options=["","","",""];const idx=i%4;options[idx]=starsDigits(x[1]);
  let a=0;for(let n=0;n<4;n++)if(n!==idx)options[n]=starsDigits(x[2][a++]);
  return {id:"stars-easy-"+(i+1),ordinal:i+1,stage:Math.floor(i/10)+1,question_kind:"choice",
   prompt:starsDigits(x[0]),objective:x[3],options,answer_index:idx,parts:[],explanation:"تأكد من فهمك للمفهوم، ثم راجع خطوات الحل.",
   visual_svg:starsVisual(x[3],i+1),visual_caption:"شكل تعليمي مبسّط يرافق السؤال"};
 }),
 ...starsEasyComplexSource.map((q,i)=>({id:"stars-easy-"+(i+31),ordinal:i+31,stage:i<4?4:5,
  question_kind:"complex",prompt:starsDigits(q.prompt),objective:q.topic,options:[],
  answer_index:null,parts:q.parts.map(p=>({type:"number",text:starsDigits(p[0]),answer:p[1],
    displayAnswer:starsDigits(p[1])})),explanation:"فكّر في خطوات المسألة واحدة بعد الأخرى.",
   visual_svg:starsVisual(q.topic,i+31),visual_caption:"تمثيل مرئي للمسألة متعددة الأجزاء"}))
];
const starsQuestionPublic=(q:any)=>({id:q.id,ordinal:q.ordinal,stage:q.stage,question_kind:q.question_kind,
 prompt:q.prompt,options:q.question_kind==="choice"?q.options:[],parts:q.question_kind==="complex"?
 q.parts.map((p:any)=>({type:p.type,text:p.text,choices:p.choices||undefined})):[],
 objective:q.objective,visual_svg:q.visual_svg,visual_caption:q.visual_caption});
const starsArabicNumbers=(v:any)=>String(v??"").trim().replace(/[٠-٩۰-۹]/g,c=>{const a="٠١٢٣٤٥٦٧٨٩".indexOf(c);
 return String(a>=0?a:"۰۱۲۳۴۵۶۷۸۹".indexOf(c))}).replace(/[٫،]/g,".").replace(/\s/g,"");
const starsNormalize=(q:any,a:any)=>q.question_kind==="choice"?
 Number.isInteger(a)&&a>=0&&a<=3?a:null:
 Array.isArray(a)?q.parts.map((p:any,i:number)=>starsArabicNumbers(a[i]).slice(0,80)):null;
const starsFeedback=(q:any,input:any)=>{
 const answer=starsNormalize(q,input),max=q.question_kind==="choice"?1:q.parts.length;
 const earned=q.question_kind==="choice"?(answer===q.answer_index?1:0):
  Array.isArray(answer)?q.parts.reduce((sum:number,part:any,i:number)=>sum+
  (answer[i]!==""&&Number.isFinite(Number(answer[i]))&&Math.abs(Number(answer[i])-Number(part.answer))<.0000001?1:0),0):0;
 const correctAnswer=q.question_kind==="choice"?q.options[q.answer_index]:q.parts.map((p:any)=>p.displayAnswer);
 return {earned,max,correct:earned===max,correct_answer:correctAnswer,
  unanswered:input===null||input===undefined,explanation:q.explanation};
};
const starsAnswerStats=(map:any)=>{
 const perStage:Record<string,number>={};let raw=0;
 for(const q of starsEasyQuestions){const f=starsFeedback(q,map?.[String(q.ordinal)]??null);
  raw+=f.earned;perStage[String(q.stage)]=(perStage[String(q.stage)]||0)+f.earned}
 return {raw_score:raw,score:raw*2,stage_scores:perStage,
  details:starsEasyQuestions.map(q=>({id:q.id,ordinal:q.ordinal,stage:q.stage,
   ...starsFeedback(q,map?.[String(q.ordinal)]??null)}))};
};
const starsAttemptView=(a:any)=>a?{
 status:a.completed_at?"completed":"in_progress",started_at:a.started_at,completed_at:a.completed_at,
 current_index:a.current_index,total_questions:38,
 raw_score:a.completed_at?a.raw_score:null,score:a.completed_at?a.score:null,
 stage_scores:a.stage_scores||{},questions:a.completed_at?[]:starsEasyQuestions.map(starsQuestionPublic)
}:null;


const audioCats=new Set(["quran","hadith","wisdom","nasheed","patriotic","motivation"]);
const audioTypes=new Set(["external","youtube","audio","spoken"]);
const audioHttps=(v:string)=>!v||/^https:\/\/[^\s]+$/i.test(v);
const audioYouTube=(v:string)=>!v||/^https:\/\/(?:(?:www\.)?youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}(?:[&?][^\s]*)?$/.test(v);
const audioFileUrl=(v:string)=>!v||/^https:\/\/[^\s]+\.(?:mp3|ogg|wav|m4a|mp4)(?:[?#][^\s]*)?$/i.test(v);
const audioCols="id,category,title,performer,summary,spoken_text,media_type,source_url,youtube_url,audio_url,download_url,can_download,copyright_note,featured,published,sort_order,uploaded_path,created_at,updated_at";
async function audioList(onlyPublished:boolean){
 let q=db.from("afaq_audio_items").select(audioCols).order("sort_order").order("id").limit(500);
 if(onlyPublished)q=q.eq("published",true);
 const {data,error}=await q;if(error)throw error;return data||[];
}
function audioMagic(bytes:Uint8Array,mime:string){
 const x=new TextDecoder("latin1").decode(bytes.subarray(0,16));
 if(mime==="audio/mpeg"||mime==="audio/mp3")return x.startsWith("ID3")||(bytes[0]===255&&(bytes[1]&224)===224);
 if(mime==="audio/ogg")return x.startsWith("OggS");
 if(mime==="audio/wav")return x.startsWith("RIFF")&&x.slice(8,12)==="WAVE";
 if(mime==="audio/mp4"||mime==="audio/x-m4a")return x.slice(4,8)==="ftyp";
 return false;
}

Deno.serve(async req=>{
 const origin=req.headers.get("origin")||"";
 if(req.method==="OPTIONS")return new Response("ok",{headers:headers(origin)});
 if(req.method!=="POST")return err(origin,"method_not_allowed",405);
 if(origin&&!allowOrigins.has(origin))return err(origin,"origin_not_allowed",403);
 try{
  let b:any;try{b=await req.json()}catch{return err(origin,"invalid_json")}
  const action=cl(b?.action,55);

  if(action==="audio_list")return ok(origin,{items:await audioList(true)});
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


  if(action==="stars_preview_leaderboard"){
   const {data:all,error}=await db.from("afaq_stars_preview_attempts")
    .select("player_id,score,completed_at,started_at").not("completed_at","is",null)
    .order("score",{ascending:false}).limit(250);
   if(error)throw error;
   const playerIds=(all||[]).map(x=>x.player_id);
   let people:any[]=[];if(playerIds.length){const r=await db.from("afaq_jana_players").select("id,nickname").in("id",playerIds);if(r.error)throw r.error;people=r.data||[]}
   const names=new Map(people.map(x=>[x.id,x.nickname]));
   return ok(origin,{ranking:(all||[]).map((x,i)=>({rank:i+1,nickname:names.get(x.player_id)||"متسابق",
    score:x.score,completed_at:x.completed_at})),total:(all||[]).length,
    notice:"ترتيب تشجيعي خاص بزوار المنصة، لا علاقة له بنتائج المسابقة الرسمية."});
  }
  if(["stars_preview_me","stars_preview_start","stars_preview_answer","stars_preview_skip","stars_preview_finish"].includes(action)){
   const session=await janaSession(req);
   if(!session)return err(origin,"jana_login_required",401);
   const {data:player,error:pe}=await db.from("afaq_jana_players").select("nickname")
    .eq("id",session.player_id).single();if(pe)throw pe;
   let {data:attempt,error:ae}=await db.from("afaq_stars_preview_attempts").select("*")
    .eq("player_id",session.player_id).maybeSingle();if(ae)throw ae;
   if(action==="stars_preview_me")return ok(origin,{nickname:player.nickname,attempt:starsAttemptView(attempt)});
   if(action==="stars_preview_start"){
    const hash=await visitorHash(b.visitor_id);
    if(!hash)return err(origin,"invalid_visitor",400);
    if(!attempt){
     const {data:found,error:fe}=await db.from("afaq_stars_preview_attempts")
      .select("player_id").eq("visitor_hash",hash).maybeSingle();if(fe)throw fe;
     if(found&&found.player_id!==session.player_id)return err(origin,"preview_trial_limit",409);
     const r=await db.from("afaq_stars_preview_attempts").insert({
       player_id:session.player_id,visitor_hash:hash,current_index:0,answers:{},
       stage_scores:{},started_at:new Date().toISOString()}).select("*").maybeSingle();
     if(r.error&&r.error.code!=="23505")throw r.error;
     attempt=r.data||(await db.from("afaq_stars_preview_attempts").select("*").eq("player_id",session.player_id).single()).data;
    }
    if(attempt?.completed_at)return err(origin,"preview_trial_limit",409);
    return ok(origin,{nickname:player.nickname,attempt:starsAttemptView(attempt)});
   }
   if(!attempt||attempt.completed_at)return err(origin,"preview_trial_limit",409);
   const index=Number(b.index);
   if(!Number.isInteger(index)||index!==attempt.current_index||index<0||index>=38)
    return err(origin,"preview_sequence_changed",409);
   let next=index,answerMap={...(attempt.answers||{})};
   let feedback:any=null;
   if(action==="stars_preview_answer"){
    const question=starsEasyQuestions[index];
    const response=b.expired?null:starsNormalize(question,b.answer);
    answerMap[String(question.ordinal)]=response;
    feedback=starsFeedback(question,response);
    next=index+1;
   }else if(action==="stars_preview_skip"){
    const stage=starsEasyQuestions[index].stage;
    while(next<38&&starsEasyQuestions[next].stage===stage){
     answerMap[String(next+1)]=null;next++;
    }
   }else if(action==="stars_preview_finish"){
    while(next<38){answerMap[String(next+1)]=null;next++}
   }else return err(origin,"invalid_preview_action");
   const calculated=starsAnswerStats(answerMap),complete=next===38;
   const stamp=new Date().toISOString();
   const patch={
    current_index:next,answers:answerMap,stage_scores:calculated.stage_scores,
    last_answered_at:stamp,
    ...(complete?{completed_at:stamp,raw_score:calculated.raw_score,score:calculated.score}:{})
   };
   const updated=await db.from("afaq_stars_preview_attempts").update(patch)
     .eq("player_id",session.player_id).eq("current_index",index)
     .is("completed_at",null).select("*").maybeSingle();
   if(updated.error)throw updated.error;if(!updated.data)return err(origin,"preview_sequence_changed",409);
   return ok(origin,{nickname:player.nickname,attempt:starsAttemptView(updated.data),
    feedback,finished:complete,
    ...(complete?{result:{score:calculated.score,raw_score:calculated.raw_score,
      percent:calculated.score,details:calculated.details,training:true}}:{})});
  }

  const user=await staff(req);
  if(!user||!["supervisor","supervisor_assistant"].includes(user.role))return err(origin,"staff_login_required",403);

  if(action==="audio_admin")return ok(origin,{items:await audioList(false)});
  if(action==="audio_save"){
   if(user.role!=="supervisor")return err(origin,"supervisor_only",403);
   const id=b.id===undefined||b.id===null||b.id===""?null:Number(b.id),
    category=cl(b.category,30),title=cl(b.title,170),performer=cl(b.performer,160),
    summary=cl(b.summary,650),spoken_text=cl(b.spoken_text,1500),media_type=cl(b.media_type,25),
    source_url=cl(b.source_url,850),youtube_url=cl(b.youtube_url,850),
    audio_url=cl(b.audio_url,850),download_url=cl(b.download_url,850),
    copyright_note=cl(b.copyright_note,350),uploaded_path=cl(b.uploaded_path,180),
    order=Number(b.sort_order??100),can_download=b.can_download===true;
   if((id!==null&&(!Number.isSafeInteger(id)||id<1))||!audioCats.has(category)||!audioTypes.has(media_type)||
    title.length<2||!Number.isInteger(order)||Math.abs(order)>100000||
    !audioHttps(source_url)||!audioYouTube(youtube_url)||!audioFileUrl(audio_url)||!audioFileUrl(download_url)||
    (media_type==="youtube"&&!youtube_url)||(media_type==="audio"&&!audio_url)||
    (media_type==="spoken"&&spoken_text.length<8)||(media_type==="external"&&!source_url)||
    (can_download&&(media_type!=="audio"||!download_url||copyright_note.length<12||
      b.permission_confirmed!==true))||
    (uploaded_path&&!/^files\/[a-f0-9-]{36}\.(?:mp3|ogg|wav|m4a)$/i.test(uploaded_path)))
      return err(origin,"audio_validation_error");
   if(uploaded_path){
    const validPublicUrl=url+"/storage/v1/object/public/afaq-open-audio/"+uploaded_path;
    if(audio_url!==validPublicUrl)return err(origin,"audio_upload_mismatch");
   }
   const patch={category,title,performer,summary,spoken_text,media_type,
    source_url:source_url||null,youtube_url:youtube_url||null,audio_url:audio_url||null,
    download_url:download_url||null,can_download,copyright_note,featured:b.featured===true,
    published:b.published===true,sort_order:order,uploaded_path:uploaded_path||null,
    updated_at:new Date().toISOString()};
   if(id!==null){
    const x=await db.from("afaq_audio_items").update(patch).eq("id",id).select(audioCols).maybeSingle();
    if(x.error)throw x.error;if(!x.data)return err(origin,"audio_not_found",404);
    return ok(origin,{item:x.data});
   }
   const x=await db.from("afaq_audio_items").insert({...patch,created_by:user.username}).select(audioCols).single();
   if(x.error)throw x.error;return ok(origin,{item:x.data});
  }
  if(action==="audio_toggle"||action==="audio_delete"){
   if(user.role!=="supervisor")return err(origin,"supervisor_only",403);
   const id=Number(b.id);if(!Number.isSafeInteger(id)||id<1)return err(origin,"audio_invalid_id");
   const previous=await db.from("afaq_audio_items").select("uploaded_path").eq("id",id).maybeSingle();
   if(previous.error)throw previous.error;if(!previous.data)return err(origin,"audio_not_found",404);
   if(action==="audio_toggle"){
    const x=await db.from("afaq_audio_items").update({published:b.published===true,updated_at:new Date().toISOString()})
     .eq("id",id).select("id,published").single();
    if(x.error)throw x.error;return ok(origin,{item:x.data});
   }
   const x=await db.from("afaq_audio_items").delete().eq("id",id);if(x.error)throw x.error;
   if(previous.data.uploaded_path){
    const count=await db.from("afaq_audio_items").select("id",{head:true,count:"exact"}).eq("uploaded_path",previous.data.uploaded_path);
    if(!count.count){
     const rem=await db.storage.from("afaq-open-audio").remove([previous.data.uploaded_path]);
     if(rem.error)console.error("audio_cleanup:",rem.error.message);
    }
   }
   return ok(origin,{deleted:true});
  }
  if(action==="audio_upload"){
   if(user.role!=="supervisor")return err(origin,"supervisor_only",403);
   const filename=cl(b.filename,130),mime=cl(b.mime,40),rights=cl(b.copyright_note,350);
   if(b.permission_confirmed!==true||rights.length<20||
    !["audio/mpeg","audio/mp3","audio/ogg","audio/wav","audio/mp4","audio/x-m4a"].includes(mime)||
    !/\.(?:mp3|ogg|wav|m4a)$/i.test(filename))
     return err(origin,"audio_upload_permission_required",403);
   const base64=String(b.base64||"");
   if(!/^[A-Za-z0-9+/]+={0,2}$/.test(base64)||base64.length>10700000)return err(origin,"audio_upload_invalid_size",413);
   let raw:string;try{raw=atob(base64)}catch{return err(origin,"audio_upload_invalid_base64",400)}
   if(raw.length<500||raw.length>8000000)return err(origin,"audio_upload_invalid_size",413);
   const bytes=Uint8Array.from(raw,x=>x.charCodeAt(0));
   if(!audioMagic(bytes,mime))return err(origin,"audio_upload_bad_format");
   const ext=filename.toLowerCase().split(".").pop()||"mp3";
   const path="files/"+crypto.randomUUID()+"."+ext;
   const contentType=mime==="audio/mp3"?"audio/mpeg":mime==="audio/x-m4a"?"audio/mp4":mime;
   const uploaded=await db.storage.from("afaq-open-audio").upload(path,bytes,{contentType,cacheControl:"3600",upsert:false});
   if(uploaded.error)throw uploaded.error;
   const publicUrl=db.storage.from("afaq-open-audio").getPublicUrl(path).data.publicUrl;
   return ok(origin,{audio_url:publicUrl,uploaded_path:path,size:bytes.length,
    notice:"أكمل بيانات المادة واحفظها؛ التنزيل متاح فقط بالتصريح المناسب."});
  }

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
