import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.95.0";
const URL=Deno.env.get("SUPABASE_URL")||"";
let KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
try{KEY=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}").default||KEY}catch{}
const db=createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const ORIGINS=new Set(["https://afaqmaths.github.io","http://localhost:8000","http://127.0.0.1:8000","http://localhost:5500","http://127.0.0.1:5500"]);
const H=(origin:string)=>({"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":ORIGINS.has(origin)?origin:"https://afaqmaths.github.io","Access-Control-Allow-Headers":"authorization,content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Cache-Control":"no-store",Vary:"Origin"});
const ok=(origin:string,data:object)=>new Response(JSON.stringify({ok:true,...data}),{headers:H(origin)});
const fail=(origin:string,error:string,status=400)=>new Response(JSON.stringify({ok:false,error}),{headers:H(origin),status});
const str=(v:unknown,max=600)=>String(v??"").trim().slice(0,max);
const uuid=(v:string)=>/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(v);
const goodUrl=(u:string)=>!u||(()=>{try{const x=new URL(u);return x.protocol==="https:"&&!x.username&&!x.password&&x.hostname.length>4}catch{return false}})();
async function sha(s:string){const b=new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)));return [...b].map(x=>x.toString(16).padStart(2,"0")).join("")}
async function session(req:Request){
 const token=(req.headers.get("Authorization")||"").replace(/^Bearer\s+/i,"");
 if(token.length<35||token.length>128)return null;
 const {data,error}=await db.from("afaq_sessions").select("role,student_id,grade,username,expires_at,revoked_at")
 .eq("token_hash",await sha(token)).maybeSingle();if(error)throw error;
 return data&&!data.revoked_at&&new Date(data.expires_at).getTime()>Date.now()?data:null;
}
const supervisor=(s:any)=>s?.role==="supervisor";
const staff=(s:any)=>["supervisor","supervisor_assistant","director","deputy","it_viewer"].includes(s?.role);
const school=(s:any)=>!!s&&(staff(s)||s.role==="student");
const array=(v:unknown,n=12)=>Array.isArray(v)?v.map(x=>str(x,180)).filter(Boolean).slice(0,n):[];
async function entries(table:string,all=false){
 let q=db.from(table).select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:true}).limit(300);
 if(!all)q=q.eq("published",true);
 const {data,error}=await q;if(error)throw error;return data||[];
}
function choiceQuestion(q:any,admin=false){
 const safe={id:q.id,grade:q.grade,assessment_type:q.assessment_type,lesson:q.lesson,
 question:q.question,choices:q.choices,explanation:admin?q.explanation:undefined,
 published:admin?q.published:undefined,created_at:q.created_at};
 if(admin)return {...safe,correct_index:q.correct_index,remedial_question:q.remedial_question,
 remedial_choices:q.remedial_choices,remedial_correct_index:q.remedial_correct_index,
 enrichment_question:q.enrichment_question,enrichment_choices:q.enrichment_choices,
 enrichment_correct_index:q.enrichment_correct_index};
 return safe;
}
const KINDS=new Set(["oral","short_question","short_test","homework","mock_final"]);
const isInt=(n:unknown,max:number)=>Number.isInteger(Number(n))&&Number(n)>=0&&Number(n)<max;
function validQuestion(body:any){
 const grade=Number(body.grade),kind=str(body.assessment_type,35),
 choices=array(body.choices,5),r=array(body.remedial_choices,5),e=array(body.enrichment_choices,5);
 if(![5,6,7,8].includes(grade)||!KINDS.has(kind)||str(body.lesson,150).length<2||
 str(body.question,800).length<3||str(body.remedial_question,800).length<3||
 str(body.enrichment_question,800).length<3||choices.length<2||r.length<2||e.length<2||
 !isInt(body.correct_index,choices.length)||!isInt(body.remedial_correct_index,r.length)||
 !isInt(body.enrichment_correct_index,e.length))return null;
 return {grade,assessment_type:kind,lesson:str(body.lesson,150),question:str(body.question,800),
 choices,correct_index:Number(body.correct_index),explanation:str(body.explanation,1200),
 remedial_question:str(body.remedial_question,800),remedial_choices:r,
 remedial_correct_index:Number(body.remedial_correct_index),
 enrichment_question:str(body.enrichment_question,800),enrichment_choices:e,
 enrichment_correct_index:Number(body.enrichment_correct_index),
 published:body.published===true};
}
const xmlDecode=(raw:string)=>raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1")
 .replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,"<")
 .replace(/&gt;/g,">").replace(/&#(\d+);/g,(_,d)=>String.fromCodePoint(Number(d)))
 .replace(/<[^>]*>/g,"").trim().slice(0,250);
const FEEDS=[
 ["world","أخبار عامة","https://feeds.bbci.co.uk/arabic/rss.xml","BBC Arabic"],
 ["sport","الرياضة","https://feeds.bbci.co.uk/sport/rss.xml","BBC Sport"],
 ["business","المال والأعمال","https://feeds.bbci.co.uk/news/business/rss.xml","BBC News"],
 ["science","العلم","https://feeds.bbci.co.uk/news/science_and_environment/rss.xml","BBC Science"],
 ["technology","التكنولوجيا","https://feeds.bbci.co.uk/news/technology/rss.xml","BBC Technology"],
 ["culture","الثقافة","https://www.bbc.com/culture/feed.rss","BBC Culture"]
];
const WEATHER_CITIES=[
 ["muscat","مسقط",23.614,58.593],["sohar","صحار",24.35,56.73],
 ["salalah","صلالة",17.019,54.089],["nizwa","نزوى",22.933,57.533],
 ["sur","صور",22.566,59.528],["ibri","عبري",23.225,56.516],
 ["buraimi","البريمي",24.252,55.794],["rustaq","الرستاق",23.39,57.425],
 ["khasab","خصب",26.179,56.247],["seeb","السيب",23.67,58.19],
 ["barka","بركاء",23.707,57.889],["dubai","دبي",25.204,55.271],
 ["doha","الدوحة",25.286,51.533],["riyadh","الرياض",24.713,46.675]
] as const;
async function savedWeatherCities(){
 const {data,error}=await db.from("afaq_weather_cities_v7")
  .select("slot,city_code,city_label,lat,lon").order("slot").limit(2);
 if(error)throw error;
 return data||[];
}
let newsCache:any=null,newsAt=0;
async function fetchFeed(id:string,name:string,uri:string,source:string){
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),4300);
 try{
  const response=await fetch(uri,{headers:{"Accept":"application/rss+xml,application/xml,text/xml"},signal:controller.signal});
  if(!response.ok)return [];
  const xml=await response.text();if(xml.length>1300000)return [];
  const items=[...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].slice(0,5);
  return items.map(m=>{
   const field=(tag:string)=>{const hit=m[1].match(new RegExp("<"+tag+"(?:\\s[^>]*)?>([\\s\\S]*?)<\\/"+tag+">","i"));return hit?xmlDecode(hit[1]):"";};
   const link=field("link"),title=field("title"),pub=field("pubDate");
   if(!title||!goodUrl(link))return null;
   const time=Date.parse(pub)||0;if(time&&(Date.now()-time>10*86400000||time>Date.now()+86400000))return null;
   return {category:id,category_label:name,title,url:link,source,published_at:pub};
  }).filter(Boolean);
 }catch{return []}finally{clearTimeout(timer)}
}
async function getNews(){
 if(newsCache&&Date.now()-newsAt<2*60000)return newsCache;
 const feeds=await Promise.all(FEEDS.map(args=>fetchFeed(...args as [string,string,string,string])));
 const stored=await savedWeatherCities();
 const weatherPlaces=stored.map(x=>[x.city_label,Number(x.lat),Number(x.lon),x.slot,x.city_code]);
 const weather=await Promise.all(weatherPlaces.map(async([city,lat,lon,slot,code])=>{
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),4100);
  try{
   const u="https://api.open-meteo.com/v1/forecast?latitude="+lat+"&longitude="+lon+
    "&current=temperature_2m,weather_code,wind_speed_10m&timezone=Asia%2FMuscat";
   const response=await fetch(u,{signal:controller.signal});if(!response.ok)return null;
   const x=await response.json();const c=x?.current;
   if(!Number.isFinite(c?.temperature_2m))return null;
   return {city,slot,code,temperature:c.temperature_2m,weather_code:c.weather_code,
    wind_speed:c.wind_speed_10m,observed_at:c.time,source:"Open-Meteo"};
  }catch{return null}finally{clearTimeout(timer)}
 }));
 const d={items:feeds.flat(),weather:weather.filter(Boolean),selected_cities:stored,
   updated_at:new Date().toISOString(),
   national:{label:"وكالة الأنباء العُمانية",url:"https://omannews.gov.om"}};
 if(d.items.length||d.weather.length){newsCache=d;newsAt=Date.now()}return d;
}

/* Daily football matches, in Asia/Muscat timezone, from a public sports provider.
   Free tier may provide a subset; never manufacture fixtures, scores or times. */
let matchCache:any=null;
function muscatDate(date:Date){
 const parts=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Muscat",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(date);
 const field=(type:string)=>parts.find(x=>x.type===type)?.value||"";
 return field("year")+"-"+field("month")+"-"+field("day");
}
async function getMatches(){
 const date=muscatDate(new Date()),prev=muscatDate(new Date(Date.now()-86400000));
 if(matchCache?.date===date&&Date.now()-matchCache.saved_at<12*60*1000)return matchCache.data;
 const checks=[
  {d:date,s:"Soccer"},{d:prev,s:"Soccer"},
  {d:date,l:"4335"},{d:prev,l:"4335"},
  {d:date,l:"4480"},{d:prev,l:"4480"},
  {d:date,l:"4502"},{d:date,l:"4562"}
 ];
 const fetchOne=async (params:{d:string,s?:string,l?:string})=>{
  const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),5100);
  try{
   const url=new URL("https://www.thesportsdb.com/api/v1/json/123/eventsday.php");
   url.searchParams.set("d",params.d);
   if(params.s)url.searchParams.set("s",params.s);
   if(params.l)url.searchParams.set("l",params.l);
   const response=await fetch(url.toString(),{signal:ctrl.signal,headers:{Accept:"application/json"}});
   if(!response.ok)return {success:false,events:[]};
   const json=await response.json();
   return {success:true,events:Array.isArray(json.events)?json.events:[]};
  }catch{return {success:false,events:[]}}
  finally{clearTimeout(timer)}
 };
 const results=await Promise.all(checks.map(fetchOne));
 const seen=new Set<string>(),matches:any[]=[];
 const normalize=(e:any)=>{
  const raw=String(e.strTimestamp||"").trim(),dateEvent=String(e.dateEvent||"").trim();
  const strTime=String(e.strTime||"").trim();
  let epoch=raw&&Number.isFinite(Date.parse(raw))?Date.parse(raw):null;
  // strTime in TheSportsDB is UTC. Do not invent a time if both fields are missing.
  if(epoch===null&&/^\d{4}-\d{2}-\d{2}$/.test(dateEvent)&&/^\d\d:\d\d(?::\d\d)?$/.test(strTime)&&strTime!=="00:00"&&strTime!=="00:00:00"){
   const stamp=Date.parse(dateEvent+"T"+(strTime.length===5?strTime+":00":strTime)+"Z");
   if(Number.isFinite(stamp))epoch=stamp;
  }
  const local=epoch!==null?muscatDate(new Date(epoch)):dateEvent;
  if(local!==date)return null;
  const home=String(e.strHomeTeam||"").trim().slice(0,95),away=String(e.strAwayTeam||"").trim().slice(0,95);
  if(!home||!away)return null;
  const id=String(e.idEvent||"").trim()||local+"-"+home+"-"+away;
  const hs=e.intHomeScore==null?null:Number(e.intHomeScore);
  const as=e.intAwayScore==null?null:Number(e.intAwayScore);
  return {id,home,away,league:String(e.strLeague||"").trim().slice(0,95),
   utc_start:epoch!==null?new Date(epoch).toISOString():null,
   home_score:hs!==null&&Number.isFinite(hs)?hs:null,
   away_score:as!==null&&Number.isFinite(as)?as:null,
   status:String(e.strStatus||"").slice(0,35),local_date:local};
 };
 for(const result of results)for(const event of result.events){
  const row=normalize(event);
  if(row&&!seen.has(row.id)){seen.add(row.id);matches.push(row)}
 }
 const score=(m:any)=>{
  const teams=(m.home+" "+m.away).toLowerCase(),league=m.league.toLowerCase();
  if(/^(oman|oman national team|عمان|عُمان|سلطنة عمان)$/.test(m.home.toLowerCase().trim())||/^(oman|oman national team|عمان|عُمان|سلطنة عمان)$/.test(m.away.toLowerCase().trim()))return 1;
  if(/real madrid|ريال مدريد/.test(teams))return 2;
  if(/champions league|دوري أبطال أوروبا/.test(league))return 3;
  if(/afc|asian cup|gulf cup|arab cup|آسيا|خليج|عرب/.test(league))return 4;
  if(/la liga|primera|spanish|الدوري الإسباني/.test(league))return 5;
  if(/euro|nations|world cup|qualif|تصفيات/.test(league))return 6;
  if(/saudi|oman|qatar|emirates|bahrain|kuwait|خليج/.test(league))return 7;
  return 20;
 };
 matches.sort((a,b)=>score(a)-score(b)||String(a.utc_start||"").localeCompare(String(b.utc_start||"")));
 const data={date,timezone:"Asia/Muscat",source:"TheSportsDB",limited_feed:true,
  available:results.some(x=>x.success),updated_at:new Date().toISOString(),
  matches:matches.slice(0,120).map(m=>({...m,priority:score(m)})),
  coverage_notice:"بيانات منتقاة من عدة تغذيات مجانية، لكنها ليست قائمة شاملة لجميع مباريات اليوم."};
 if(data.available)matchCache={date,saved_at:Date.now(),data};
 return data;
}
Deno.serve(async req=>{
 const origin=req.headers.get("Origin")||"";
 if(req.method==="OPTIONS")return new Response("ok",{headers:H(origin)});
 if(req.method!=="POST")return fail(origin,"method_not_allowed",405);
 if(origin&&!ORIGINS.has(origin))return fail(origin,"origin_not_allowed",403);
 try{
  const b=await req.json(),action=str(b.action,50);
  if(action==="news")return ok(origin,await getNews());
  if(action==="matches_today")return ok(origin,await getMatches());
  if(action==="initiatives_public"){
   const rows=await entries("afaq_teaching_initiatives_v10");
   return ok(origin,{initiatives:rows});
  }
  if(action==="public"){
   const [notices,workshops,settings]=await Promise.all([
    entries("afaq_site_notices_v7"),entries("afaq_professional_workshops_v7"),
    db.from("afaq_site_settings_v7").select("key,enabled").limit(20)
   ]);
   if(settings.error)throw settings.error;
   return ok(origin,{notices,workshops,
    notices_visible:settings.data?.find((x:any)=>x.key==="notices_visible")?.enabled!==false});
  }
  const s=await session(req);
  if(!s)return fail(origin,"unauthorized",401);
  if(action==="weather_cities"){
   return ok(origin,{selected:await savedWeatherCities(),
    cities:WEATHER_CITIES.map(([code,label])=>({code,label}))});
  }
  if(action==="weather_city_save"){
   if(!supervisor(s))return fail(origin,"forbidden",403);
   const slot=Number(b.slot),code=str(b.city_code,40);
   const match=WEATHER_CITIES.find(x=>x[0]===code);
   if(![1,2].includes(slot)||!match)return fail(origin,"invalid_city",400);
   const {error}=await db.from("afaq_weather_cities_v7").upsert({
    slot,city_code:match[0],city_label:match[1],lat:match[2],lon:match[3],
    updated_at:new Date().toISOString()});
   if(error)throw error;
   newsCache=null;newsAt=0;
   return ok(origin,{selected:await savedWeatherCities()});
  }
  if(action==="initiatives_staff"){
   if(!staff(s))return fail(origin,"forbidden",403);
   const rows=await entries("afaq_teaching_initiatives_v10",true);
   return ok(origin,{initiatives:rows});
  }
  if(action==="initiative_save"){
   if(!supervisor(s))return fail(origin,"forbidden",403);
   const title=str(b.title,140),subtitle=str(b.subtitle,220),
    description=str(b.description,1500),icon=str(b.icon,50),
    accent=str(b.accent,20),route=str(b.route,100),
    resource_url=str(b.resource_url,600);
   const routes=new Set(["","mixer","coordinate_ya","division_key","workshops","learning","adaptive","work","library","question_bank","contests","national_values","print_center"]);
   if(title.length<3||!routes.has(route)||!["blue","teal","gold","violet","coral"].includes(accent)
   ||!goodUrl(resource_url))return fail(origin,"invalid_initiative",400);
   const payload={title,subtitle,description,icon:icon||"sparkles",accent,route,resource_url,
    sort_order:Number.isInteger(Number(b.sort_order))?Math.max(0,Math.min(999,Number(b.sort_order))):0,
    published:b.published===true,updated_at:new Date().toISOString()};
   const id=str(b.id,48);
   if(id&&!uuid(id))return fail(origin,"invalid_id",400);
   const result=id?await db.from("afaq_teaching_initiatives_v10").update(payload).eq("id",id).select("id").maybeSingle():
    await db.from("afaq_teaching_initiatives_v10").insert(payload).select("id").single();
   if(result.error)throw result.error;
   if(!result.data)return fail(origin,"initiative_not_found",404);
   return ok(origin,{id:result.data.id});
  }
  if(action==="initiative_delete"){
   if(!supervisor(s)||!uuid(str(b.id,48)))return fail(origin,"forbidden",403);
   const r=await db.from("afaq_teaching_initiatives_v10").delete().eq("id",b.id);
   if(r.error)throw r.error;
   return ok(origin,{deleted:true});
  }
  if(action==="staff_list"){
   if(!staff(s))return fail(origin,"forbidden",403);
   const [notices,workshops,settings]=await Promise.all([
    entries("afaq_site_notices_v7",true),entries("afaq_professional_workshops_v7",true),
    db.from("afaq_site_settings_v7").select("key,enabled").limit(20)
   ]);
   if(settings.error)throw settings.error;
   return ok(origin,{notices,workshops,notices_visible:settings.data?.find((x:any)=>x.key==="notices_visible")?.enabled!==false});
  }
  if(action==="notice_visibility"){
   if(!supervisor(s))return fail(origin,"forbidden",403);
   const {error}=await db.from("afaq_site_settings_v7").upsert({
    key:"notices_visible",enabled:b.enabled===true,updated_at:new Date().toISOString()});
   if(error)throw error;return ok(origin,{enabled:b.enabled===true});
  }
  if(action==="notice_save"){
   if(!supervisor(s))return fail(origin,"forbidden",403);
   const title=str(b.title,140),description=str(b.description,600),url=str(b.url,800);
   if(title.length<2||!goodUrl(url))return fail(origin,"invalid_notice");
   const id=str(b.id,48);
   const data={title,description,url,published:b.published===true,updated_at:new Date().toISOString()};
   const r=id&&uuid(id)?await db.from("afaq_site_notices_v7").update(data).eq("id",id).select("id").single():
     await db.from("afaq_site_notices_v7").insert(data).select("id").single();
   if(r.error)throw r.error;return ok(origin,{id:r.data.id});
  }
  if(action==="notice_delete"){
   if(!supervisor(s)||!uuid(str(b.id,48)))return fail(origin,"forbidden",403);
   const r=await db.from("afaq_site_notices_v7").delete().eq("id",b.id);
   if(r.error)throw r.error;return ok(origin,{deleted:true});
  }
  if(action==="workshop_save"){
   if(!supervisor(s))return fail(origin,"forbidden",403);
   const title=str(b.title,180),description=str(b.description,1000),
    objectives=array(b.objectives,15),resource_url=str(b.resource_url,900);
   const duration_minutes=Number(b.duration_minutes||10);
   if(title.length<3||!Number.isInteger(duration_minutes)||duration_minutes<5||
    duration_minutes>240||!goodUrl(resource_url))return fail(origin,"invalid_workshop");
   const data={title,description,objectives,resource_url,duration_minutes,published:b.published===true};
   const id=str(b.id,48);
   const r=id&&uuid(id)?await db.from("afaq_professional_workshops_v7").update(data).eq("id",id).select("id").single():
     await db.from("afaq_professional_workshops_v7").insert(data).select("id").single();
   if(r.error)throw r.error;return ok(origin,{id:r.data.id});
  }
  if(action==="workshop_delete"){
   if(!supervisor(s)||!uuid(str(b.id,48)))return fail(origin,"forbidden",403);
   const r=await db.from("afaq_professional_workshops_v7").delete().eq("id",b.id);
   if(r.error)throw r.error;return ok(origin,{deleted:true});
  }
  if(action==="question_list"||action==="question_staff"){
   const isAdmin=action==="question_staff";
   if(isAdmin&&!staff(s))return fail(origin,"forbidden",403);
   const grade=Number(b.grade||6);
   if(![5,6,7,8].includes(grade))return fail(origin,"invalid_grade");
   const kind=str(b.assessment_type,40);
   let qr=db.from("afaq_adaptive_questions_v7").select("*").eq("grade",grade)
     .order("created_at",{ascending:true}).limit(500);
   if(kind&&kind!=="all"&&KINDS.has(kind))qr=qr.eq("assessment_type",kind);
   if(!isAdmin)qr=qr.eq("published",true);
   const {data,error}=await qr;if(error)throw error;
   // Student never gets an answer key or private solution until responding.
   return ok(origin,{questions:(data||[]).map((x:any)=>choiceQuestion(x,isAdmin)),grade});
  }
  if(action==="question_save"){
   if(!supervisor(s))return fail(origin,"forbidden",403);
   const data=validQuestion(b);if(!data)return fail(origin,"invalid_question");
   const id=str(b.id,48);
   const r=id&&uuid(id)?await db.from("afaq_adaptive_questions_v7").update(data).eq("id",id).select("id").single():
    await db.from("afaq_adaptive_questions_v7").insert(data).select("id").single();
   if(r.error)throw r.error;return ok(origin,{id:r.data.id});
  }
  if(action==="question_archive"){
   if(!supervisor(s)||!uuid(str(b.id,48)))return fail(origin,"forbidden",403);
   const r=await db.from("afaq_adaptive_questions_v7").update({published:false}).eq("id",b.id);
   if(r.error)throw r.error;return ok(origin,{archived:true});
  }
  if(action==="practice_answer"){
   if(!school(s))return fail(origin,"forbidden",403);
   const id=str(b.id,48),index=Number(b.selected_index);
   if(!uuid(id)||!Number.isInteger(index))return fail(origin,"invalid_answer");
   const {data:q,error}=await db.from("afaq_adaptive_questions_v7").select("*").eq("id",id).maybeSingle();
   if(error)throw error;if(!q||(!q.published&&!staff(s)))return fail(origin,"question_unavailable",404);
   if(s.role==="student"&&Number(q.grade)!==Number(s.grade))return fail(origin,"forbidden",403);
   if(!isInt(index,q.choices.length))return fail(origin,"invalid_answer");
   const correct=index===q.correct_index,track=correct?"enrichment":"remedial";
   const followup=track==="enrichment"?{question:q.enrichment_question,choices:q.enrichment_choices}:
    {question:q.remedial_question,choices:q.remedial_choices};
   let attempt_id=null;
   if(s.role==="student"){
    if(!s.student_id)return fail(origin,"student_missing",403);
    const r=await db.from("afaq_adaptive_attempts_v7").insert({
     student_id:s.student_id,question_id:id,selected_index:index,correct,level:track
    }).select("id").single();
    if(r.error)throw r.error;attempt_id=r.data.id;
   }
   return ok(origin,{correct,score:correct?100:0,track,correct_answer:q.choices[q.correct_index],
    explanation:q.explanation,followup,attempt_id});
  }
  if(action==="followup_answer"){
   if(!school(s))return fail(origin,"forbidden",403);
   const id=str(b.attempt_id,48),qid=str(b.question_id,48),index=Number(b.selected_index);
   if(!Number.isInteger(index)||!uuid(qid))return fail(origin,"invalid_answer");
   if(s.role==="student"&&!uuid(id))return fail(origin,"invalid_answer");
   let attempt:any=null;
   if(s.role==="student"){
    const a=await db.from("afaq_adaptive_attempts_v7").select("*").eq("id",id).eq("student_id",s.student_id)
     .is("followup_index",null).maybeSingle();if(a.error)throw a.error;
    if(!a.data)return fail(origin,"attempt_not_found_or_complete",409);attempt=a.data;
    if(attempt.question_id!==qid)return fail(origin,"forbidden",403);
   }
   const {data:q,error}=await db.from("afaq_adaptive_questions_v7").select("*").eq("id",qid).maybeSingle();
   if(error)throw error;if(!q)return fail(origin,"question_unavailable",404);
   const track=attempt?.level||str(b.track,20);
   if(!["remedial","enrichment"].includes(track))return fail(origin,"invalid_track");
   const choices=track==="remedial"?q.remedial_choices:q.enrichment_choices;
   const answer=track==="remedial"?q.remedial_correct_index:q.enrichment_correct_index;
   if(!isInt(index,choices.length))return fail(origin,"invalid_answer");
   const correct=index===answer;
   if(attempt){
    const r=await db.from("afaq_adaptive_attempts_v7").update({followup_index:index,followup_correct:correct})
      .eq("id",id).eq("student_id",s.student_id).is("followup_index",null).select("id").maybeSingle();
    if(r.error)throw r.error;if(!r.data)return fail(origin,"attempt_not_found_or_complete",409);
   }
   return ok(origin,{correct,correct_answer:choices[answer],track,
    explanation:correct?"أحسنت! استُخدمت المهارة بصورة صحيحة.":"راجع المثال المرتبط بالسؤال وحاول تطبيق القاعدة مرة أخرى."});
  }
  return fail(origin,"unknown_action",404);
 }catch(error){console.error("afaq-education-v7",error);return fail(origin,"server_error",500)}
});