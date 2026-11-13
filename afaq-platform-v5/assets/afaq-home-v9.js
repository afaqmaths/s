/* Afaq Math v9 | Math shapes, daily football, news ticker, lesson-based Math Mixer */
'use strict';
const V9_MATCHES={date:'',data:null,loading:false,lastFetch:0,error:''};
const V9_LESSON={selected:'times10',a:4,b:3,c:2};
const v9Safe=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const v9Ar=x=>new Intl.NumberFormat('ar-OM',{maximumFractionDigits:3}).format(Number(x)||0);
const v9Date=()=>{const p=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Muscat',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const v=t=>p.find(x=>x.type===t)?.value;return v('year')+'-'+v('month')+'-'+v('day')};
const v9Link=(label,url)=>'<a target="_blank" rel="noopener noreferrer" href="'+v9Safe(url)+'">'+v9Safe(label)+'</a>';
async function v9GetMatches(force=false){
 const d=v9Date();
 if(V9_MATCHES.loading||(!force&&V9_MATCHES.date===d&&Date.now()-V9_MATCHES.lastFetch<10*60*1000))return;
 V9_MATCHES.loading=true;V9_MATCHES.date=d;V9_MATCHES.error='';
 try{
  const data=await aeApi('matches_today');
  if(data.date!==v9Date())return;
  V9_MATCHES.data=data;
  V9_MATCHES.lastFetch=Date.now();
  V9_MATCHES.error=data.available?'':'تعذر الوصول إلى بيانات المباريات من المصدر في الوقت الحالي.';
 }catch(err){V9_MATCHES.error=err.message||'تعذر تحميل المباريات'}
 finally{V9_MATCHES.loading=false;if(state.page==='matches_today'||state.page==='home')render()}
}
function v9EnsureMatches(){if(!V9_MATCHES.loading&&(V9_MATCHES.date!==v9Date()||Date.now()-V9_MATCHES.lastFetch>10*60*1000))Promise.resolve().then(()=>v9GetMatches())}
const v9OriginalHome=hubHome;
hubHome=function(){
 let html=v9OriginalHome();
 /* Other plugins used to prepend the audio teaser before the platform introduction. */
 if(typeof afAudioCTA==='function')html=html.replace(afAudioCTA(),'');
 const illustrations='<div class="v9-maths-forms" aria-hidden="true">'+
 '<img src="assets/afaq-v9-shapes.svg?v=20261113-v9" alt="" width="310" height="330"></div>'+
 '<div class="v9-coordinate-forms" aria-hidden="true">'+
 '<img src="assets/afaq-v9-plane.svg?v=20261113-v9" alt="" width="310" height="280"></div>';
 html=html.replace('<div class="afaq-hero-content">',illustrations+'<div class="afaq-hero-content">');
 html=html.replace('</section><section class="hub-intro-panel">',
 '</section><div class="v9-oman-horizon afaq-national-horizon">'+
 afaqNationalRibbon('horizon')+'</div>'+
 '<section class="hub-intro-panel">');
 return html.replace(/<button[^>]*>\s*الانتقال إلى آفاق ماث\s*<\/button>/g,'');
};
const v9OriginalNews=afaqHomeNewsTicker;
afaqHomeNewsTicker=function(){
 aeEnsureNews();v9EnsureMatches();
 const articles=Array.isArray(aeState.news?.items)?aeState.news.items:[];
 const classes=[
  ['🌍','الأخبار العالمية','world','https://www.bbc.com/arabic'],
  ['🇴🇲','الأخبار الوطنية','national','https://omannews.gov.om'],
  ['⚽','الأخبار الرياضية','sport','https://www.bbc.com/sport'],
  ['💼','المال والأعمال','business','https://www.bbc.com/news/business']
 ];
 const cells=classes.map(([icon,label,group,url])=>{
  const article=articles.find(x=>x.category===group);
  return '<span class="v9-news-item"><strong>'+icon+' '+v9Safe(label)+'</strong> '+
   v9Link(article?.title||'تابع آخر المستجدات',article?.url||url)+'</span>';
 }).join('<span class="v9-news-divider">✦</span>');
 const time=aeState.news?.updated_at?new Intl.DateTimeFormat('ar-OM',{timeZone:'Asia/Muscat',hour:'2-digit',minute:'2-digit'}).format(new Date(aeState.news.updated_at)):'';
 return '<div class="v9-news-container" aria-label="شريط الأخبار العالمية والوطنية والرياضة والاقتصاد" dir="rtl">'+
  '<span class="v9-news-brand">🗞️ شريط الأخبار <small>مباشر من المصادر</small></span>'+
  '<div class="v9-news-window"><div class="v9-news-motion">'+cells+'<span class="v9-news-divider">✦</span>'+cells+'</div></div>'+
  '<button type="button" class="v9-news-matches" data-route="matches_today">⚽ مباريات اليوم</button>'+
  '<button type="button" class="v9-news-more" data-route="science_news">أخبار أخرى</button>'+
  (time?'<small class="v9-news-update">'+time+'</small>':'')+
  '</div>';
};
const v9OldShowcase=afaqHomeShowcase;
afaqHomeShowcase=function(){
 const html=v9OldShowcase();
 return html.replace('<div class="afaq-home-modules">',
 '<div class="afaq-home-modules"><button type="button" class="afaq-home-module v9-match-shortcut" data-route="matches_today">'+
 '<span class="afaq-home-module-icon">⚽</span><strong>مباريات اليوم</strong></button>');
};
function v9MatchTime(row){
 if(row.utc_start&&Number.isFinite(Date.parse(row.utc_start)))
  return new Intl.DateTimeFormat('ar-OM',{timeZone:'Asia/Muscat',hour:'2-digit',minute:'2-digit',hour12:true}).format(new Date(row.utc_start));
 return 'التوقيت غير مؤكد';
}
function v9MatchesPage(){
 v9EnsureMatches();
 const d=V9_MATCHES.data,day=v9Date(),list=d?.date===day&&Array.isArray(d.matches)?d.matches:[];
 const pretty=new Intl.DateTimeFormat('ar-OM',{timeZone:'Asia/Muscat',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());
 const rows=list.map(m=>'<article class="v9-match-card">'+
 '<div class="v9-match-league">🏆 '+v9Safe(m.league||'مباراة كرة قدم')+'</div>'+
 '<div class="v9-match-teams"><strong>'+v9Safe(m.home)+'</strong>'+
 '<span class="v9-match-versus">'+(m.home_score!==null&&m.away_score!==null?
 v9Ar(m.home_score)+' — '+v9Ar(m.away_score):'ضد')+'</span><strong>'+v9Safe(m.away)+'</strong></div>'+
 '<p>🕒 '+v9MatchTime(m)+' • '+v9Safe(m.status||'البيانات المتاحة من المصدر')+'</p></article>').join('');
 return '<div class="container v9-matches-page" dir="rtl">'+
 '<header class="v9-match-header"><span>⚽ كرة القدم العالمية</span>'+
 '<h1>مباريات اليوم</h1><p>'+pretty+' — جميع الأوقات بتوقيت سلطنة عُمان (UTC+4).</p></header>'+
 '<div class="v9-match-actions"><button type="button" id="v9RefreshMatches">↻ تحديث المباريات</button>'+
 '<button type="button" data-route="home">العودة إلى الرئيسية</button></div>'+
 (V9_MATCHES.loading?'<p class="v9-match-notice">جارٍ جلب المواعيد...</p>':'')+
 (rows?'<div class="v9-matches-grid">'+rows+'</div>':
 '<p class="v9-match-notice">'+(V9_MATCHES.error?'المصدر غير متاح مؤقتًا.':
 'لا توجد مباريات معروضة لهذا اليوم في الاستجابة المتاحة من المصدر.')+'</p>')+
 '<p class="v9-match-source">المصدر: TheSportsDB (النسخة المجانية). قد تكون التغطية جزئية، ولا تعرض هذه الصفحة جميع الدوريات بالضرورة.'+
 ' تتجدد البيانات تلقائيًا عند فتح الصفحة وبشكل دوري، وتبدأ قائمة جديدة مع تاريخ اليوم في عُمان.</p>'+
 '<p>'+v9Link('عرض جدول المباريات في المصدر','https://www.thesportsdb.com/')+'</p></div>';
}
const v9OldGeneric=genericSection;
genericSection=function(route){return route==='matches_today'?v9MatchesPage():v9OldGeneric(route)};
const V9_UNITS=['الأعداد والعمليات','القياس','الهندسة والتحويلات','الكسور والنسب والتطبيقات'];
const V9_LESSONS=[
 ['times10',0,'الضرب في ١٠', 'العدد × ١٠','إزاحة منزلة واحدة إلى اليسار في قيمة الأرقام', [4,0,0],(a)=>a*10],
 ['times100',0,'الضرب في ١٠٠','العدد × ١٠٠','تزداد القيمة مئة مرة',[3,0,0],a=>a*100],
 ['times1000',0,'الضرب في ١٠٠٠','العدد × ١٠٠٠','تتحرك منازل القيمة ثلاث مراتب',[2,0,0],a=>a*1000],
 ['divide10',0,'القسمة على ١٠','العدد ÷ ١٠','تصبح القيمة عُشر الأصل',[120,0,0],a=>a/10],
 ['divide100',0,'القسمة على ١٠٠','العدد ÷ ١٠٠','تصبح القيمة جزءًا من مئة',[275,0,0],a=>a/100],
 ['parity',0,'زوجي أم فردي؟','العدد ÷ ٢','الزوجي يقبل القسمة على ٢ دون باق',[15,0,0],a=>Number.isInteger(a)?(a%2===0?'عدد زوجي':'عدد فردي'):'أدخل عددًا صحيحًا'],
 ['prime',0,'الأعداد الأولية','عدد العوامل','العدد الأولي له عاملان مختلفان فقط',[17,0,0],a=>{if(!Number.isInteger(a)||a<2)return 'ليس أوليًا';for(let i=2;i<=Math.sqrt(a);i++)if(a%i===0)return 'عدد مركب';return 'عدد أولي'}],
 ['round10',0,'التقريب لأقرب عشرة','تقريب إلى ١٠','تُستخدم منزلة الآحاد',[47,0,0],a=>Math.round(a/10)*10],
 ['sequence',0,'المتتاليات العددية','الحد + مقدار الزيادة','تطبيق القاعدة المتكررة على الحد السابق',[12,5,0],(a,b)=>a+b],
 ['factor',0,'قابلية القسمة','العدد ÷ المقسوم عليه','نختبر بقاء الصفر بعد القسمة',[24,3,0],(a,b)=>b===0?'لا تجوز القسمة على صفر':a%b===0?'يقبل القسمة':'لا يقبل القسمة'],
 ['length',1,'من المتر إلى السنتيمتر','متر × ١٠٠','تبديل وحدة الطول دون تغيير الطول الحقيقي',[2,0,0],a=>v9Ar(a*100)+' سم'],
 ['mass',1,'من الكيلوجرام إلى الجرام','كجم × ١٠٠٠','تحويل وحدة الكتلة',[3,0,0],a=>v9Ar(a*1000)+' جم'],
 ['time',1,'الساعات والدقائق','ساعة × ٦٠','الساعة ستون دقيقة',[2,0,0],a=>v9Ar(a*60)+' دقيقة'],
 ['perimeter',1,'محيط المستطيل','٢ × (الطول + العرض)','قياس المسافة حول المستطيل',[5,3,0],(a,b)=>v9Ar(2*(a+b))+' وحدة طول'],
 ['area',1,'مساحة المستطيل','الطول × العرض','عدد الوحدات المربعة داخل المستطيل',[5,3,0],(a,b)=>v9Ar(a*b)+' وحدة مربعة'],
 ['triangleArea',1,'مساحة المثلث','القاعدة × الارتفاع ÷ ٢','نصف مساحة مستطيل له القاعدة والارتفاع نفسيهما',[8,5,0],(a,b)=>v9Ar(a*b/2)+' وحدة مربعة'],
 ['angle',2,'الزاوية الثالثة في المثلث','١٨٠° − (أ + ب)','مجموع الزوايا الداخلية للمثلث ١٨٠°',[50,60,0],(a,b)=>a>0&&b>0&&a+b<180?v9Ar(180-a-b)+'°':'الزاويتان غير صالحتين'],
 ['straight',2,'زاويتان على خط مستقيم','١٨٠° − الزاوية','مجموع الزوايا على مستقيم يساوي ١٨٠°',[65,0,0],a=>a>=0&&a<=180?v9Ar(180-a)+'°':'زاوية خارج المجال'],
 ['cube',2,'حجم المكعب','طول الحرف × نفسه × نفسه','الحجم بعدد الوحدات المكعبة',[4,0,0],a=>v9Ar(a**3)+' وحدة مكعبة'],
 ['cubeSurface',2,'مساحة سطح المكعب','٦ × مربع الحرف','ستة أوجه مربعة متطابقة',[3,0,0],a=>v9Ar(6*a*a)+' وحدة مربعة'],
 ['cuboid',2,'حجم متوازي المستطيلات','الطول × العرض × الارتفاع','المقارنة بين الحجم والمساحة',[5,3,2],(a,b,c)=>v9Ar(a*b*c)+' وحدة مكعبة'],
 ['translate',2,'الانسحاب على المستوى الإحداثي','(س،ص) ← (س+٢،ص+٣)','تتحرك كل نقطة بالاتجاه والمسافة نفسيهما',[2,1,0],(a,b)=>'('+v9Ar(a+2)+' ، '+v9Ar(b+3)+')',true],
 ['reflectX',2,'الانعكاس حول محور السينات','(س،ص) ← (س،−ص)','تتغير إشارة الصاد وتبقى السين ثابتة',[2,3,0],(a,b)=>'('+v9Ar(a)+' ، '+v9Ar(-b)+')',true],
 ['reflectY',2,'الانعكاس حول محور الصادات','(س،ص) ← (−س،ص)','تتغير إشارة السين وتبقى الصاد ثابتة',[2,3,0],(a,b)=>'('+v9Ar(-a)+' ، '+v9Ar(b)+')',true],
 ['rotation',2,'الدوران ٩٠° عكس عقارب الساعة','(س،ص) ← (−ص،س)','دوران حول نقطة الأصل',[2,3,0],(a,b)=>'('+v9Ar(-b)+' ، '+v9Ar(a)+')',true],
 ['fraction',3,'كسر من كمية','الكمية × البسط ÷ المقام','حساب جزء من الكل',[24,4,0],(a,b)=>b!==0?v9Ar(a/b):'المقام لا يمكن أن يكون صفرًا'],
 ['percent',3,'النسبة المئوية','العدد × النسبة ÷ ١٠٠','حساب الجزء النسبي من المجموع',[200,25,0],(a,b)=>v9Ar(a*b/100)],
 ['decimalPercent',3,'العشري إلى نسبة مئوية','العدد العشري × ١٠٠','تحويل الصيغة العشرية إلى نسبة',[0.35,0,0],a=>v9Ar(a*100)+'٪'],
 ['ratio',3,'المضاعف والتناسب','الكمية × معامل التوسع','تكبير كمية بنسبة ثابتة',[6,3,0],(a,b)=>a*b],
 ['daily',3,'الميزانية اليومية','الدخل − المصروف','التفكير في الباقي المالي',[15,7,0],(a,b)=>v9Ar(a-b)+' ريال']
].map(([id,unit,title,operation,explanation,defaults,compute,plane])=>({id,unit,title,operation,explanation,defaults,compute,plane:!!plane}));
function v9Lesson(){return V9_LESSONS.find(x=>x.id===V9_LESSON.selected)||V9_LESSONS[0]}
function v9LabResult(){
 const l=v9Lesson();const values=[V9_LESSON.a,V9_LESSON.b,V9_LESSON.c].map(Number);
 if(!values.every(Number.isFinite))return 'أدخل أعدادًا صحيحة';
 try{return String(l.compute(...values))}catch{return 'تعذر الحساب'}
}
function v9InputText(l){
 const m=l.plane?['الإحداثي س','الإحداثي ص','']:l.id==='cuboid'?['الطول','العرض','الارتفاع']:
 ['المدخل الأول','المدخل الثاني','المدخل الثالث'];
 return m;
}
function v9CoordinateGraph(l){
 if(!l.plane)return '';
 const x=Math.max(-5,Math.min(5,V9_LESSON.a)),y=Math.max(-5,Math.min(5,V9_LESSON.b));
 const transform=l.id==='translate'?[x+2,y+3]:l.id==='reflectX'?[x,-y]:l.id==='reflectY'?[-x,y]:[-y,x];
 const c=n=>125+Math.max(-5,Math.min(5,n))*20,d=n=>125-Math.max(-5,Math.min(5,n))*20;
 const grid=Array.from({length:11},(_,i)=>'<path d="M'+(25+i*20)+' 25V225M25 '+(25+i*20)+'H225"/>').join('');
 return '<svg viewBox="0 0 250 250" class="v9-graph" role="img" aria-label="رسم إحداثي يوضح النقطة قبل التحويل وبعده">'+
 '<g stroke="#b4d4e9" stroke-width=".7">'+grid+'</g><path d="M25 125H225M125 25V225" stroke="#356f98" stroke-width="2"/>'+
 '<path d="M'+c(x)+' '+d(y)+'L'+c(transform[0])+' '+d(transform[1])+'" stroke="#e8a13c" stroke-width="3" stroke-dasharray="5 3"/>'+
 '<circle cx="'+c(x)+'" cy="'+d(y)+'" r="5" fill="#1b9eaa"/>'+
 '<circle cx="'+c(transform[0])+'" cy="'+d(transform[1])+'" r="6" fill="#e8a13c"/>'+
 '<text x="'+(c(x)+5)+'" y="'+(d(y)-8)+'" fill="#1a688e">A</text>'+
 '<text x="'+(c(transform[0])+5)+'" y="'+(d(transform[1])-8)+'" fill="#ae7423">A′</text>'+
 '</svg>';
}
function v9LessonLab(){
 const l=v9Lesson(),labels=v9InputText(l);
 return '<section class="v9-lesson-lab" aria-label="أنشطة خلاط الرياضيات لجميع وحدات الصف السادس">'+
 '<div class="v9-lesson-heading"><span>🧮 تطبيقات المنهج</span><h2>خلاط الرياضيات عبر وحدات الصف السادس</h2>'+
 '<p>اختر الدرس ثم غيّر المدخلات لتلاحظ كيف تولّد القاعدة الرياضية المخرجات؛ وتتغير شبكة الإحداثيات في الهندسة.</p></div>'+
 '<label class="v9-lesson-select">الدرس <select id="v9LessonPick">'+V9_UNITS.map((unit,j)=>
 '<optgroup label="'+v9Safe(unit)+'">'+V9_LESSONS.filter(x=>x.unit===j).map(x=>
 '<option value="'+v9Safe(x.id)+'"'+(x.id===l.id?' selected':'')+'>'+v9Safe(x.title)+'</option>').join('')+'</optgroup>').join('')+'</select></label>'+
 '<div class="v9-lesson-process"><div><small>Input • المدخلات</small><div class="v9-lesson-inputs">'+
 [0,1,2].map(i=>'<label id="v9Field'+i+'" class="'+(i>0&&!['sequence','factor','perimeter','area','triangleArea','angle','cuboid','translate','reflectX','reflectY','rotation','fraction','percent','ratio','daily'].includes(l.id)?'v9-hidden':i===2&&l.id!=='cuboid'?'v9-hidden':'')+'">'+
 '<span>'+v9Safe(labels[i]||'المدخل')+'</span><input type="number" id="v9Input'+i+'" value="'+v9Safe(V9_LESSON[['a','b','c'][i]])+'" step="any"></label>').join('')+
 '</div></div><div class="v9-lesson-op"><small>Operation • العملية</small><strong id="v9Rule">'+v9Safe(l.operation)+'</strong></div>'+
 '<div><small>Output • المخرجات</small><strong id="v9Output">'+v9Safe(v9LabResult())+'</strong></div></div>'+
 '<div class="v9-lesson-explanation"><p id="v9Explanation">'+v9Safe(l.explanation)+'</p>'+
 '<div id="v9Plot">'+v9CoordinateGraph(l)+'</div></div>'+
 '<button type="button" id="v9TryLesson">🔁 جرّب مدخلات أخرى</button>'+
 '<p class="v9-lab-foot">هذه نماذج تعليمية قابلة للتجربة ولا تمثل أسئلة اختبار أو درجات رسمية.</p></section>';
}
const v9OldMixerPage=aeMixerPage;
aeMixerPage=function(){
 let html=v9OldMixerPage();
 return html.replace(/<\/div>\s*$/,v9LessonLab()+'</div>');
};
function v9RefreshLab(){
 const l=v9Lesson(),result=document.getElementById('v9Output');
 if(result)result.textContent=v9LabResult();
 const plot=document.getElementById('v9Plot');if(plot)plot.innerHTML=v9CoordinateGraph(l);
 const rule=document.getElementById('v9Rule');if(rule)rule.textContent=l.operation;
 const explanation=document.getElementById('v9Explanation');if(explanation)explanation.textContent=l.explanation;
}
const v9OldAttach=attach;
attach=function(){
 v9OldAttach();
 /* The main landing page begins with its hero; login and competition shortcuts live below it. */
 const isHome=state.page==='home';
 const topLogin=document.getElementById('accountBtn');
 if(topLogin)topLogin.hidden=isHome;
 const topStars=document.querySelector('.stars-shortcut');
 if(topStars)topStars.hidden=isHome;
 document.getElementById('v9RefreshMatches')?.addEventListener('click',()=>v9GetMatches(true));
 v9BindLesson();
};
function v9BindLesson(){
 const l=v9Lesson();
 [0,1,2].forEach((i)=>{
  document.getElementById('v9Input'+i)?.addEventListener('input',event=>{
   V9_LESSON[['a','b','c'][i]]=Number(event.target.value);v9RefreshLab();
  });
 });
 document.getElementById('v9TryLesson')?.addEventListener('click',()=>{
  const lesson=v9Lesson();
  [V9_LESSON.a,V9_LESSON.b,V9_LESSON.c]=lesson.defaults.map((v,i)=>v+(i===0?1:0));
  const node=document.querySelector('.v9-lesson-lab');
  if(node){node.outerHTML=v9LessonLab();v9BindLesson()}
 });
 document.getElementById('v9LessonPick')?.addEventListener('change',event=>{
  V9_LESSON.selected=event.target.value;
  [V9_LESSON.a,V9_LESSON.b,V9_LESSON.c]=v9Lesson().defaults;
  const node=document.querySelector('.v9-lesson-lab');
  if(node){node.outerHTML=v9LessonLab();v9BindLesson()}
 });
}
if(typeof window!=='undefined'&&typeof window.setInterval==='function')window.setInterval(()=>{
 if(state.page==='home'||state.page==='matches_today'){
  if(V9_MATCHES.date!==v9Date()||Date.now()-V9_MATCHES.lastFetch>12*60*1000)v9GetMatches();
  if(typeof aeLoadNews==='function'&&Date.now()-(v9NewsStamp||0)>12*60*1000){v9NewsStamp=Date.now();aeLoadNews(true)}
 }
},60*1000);
let v9NewsStamp=Date.now();
