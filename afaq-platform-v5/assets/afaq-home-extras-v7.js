/* Afaq Math v7 • live notices, curated news, scientific news, professional workshops */
'use strict';
const AE_API='https://xcwuwflggiwkehzquugz.supabase.co/functions/v1/afaq-education-v7';
const aeState={public:null,publicTried:false,publicBusy:false,staffData:null,staffTried:false,staffBusy:false,
news:null,newsTried:false,newsBusy:false,newsTab:'science',editNotice:null,editWorkshop:null,
msg:'',noticeError:false,activeWorkshop:null};
const aeEsc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const aeSuper=()=>auth.user?.role==='supervisor';
const aeStaff=()=>['supervisor','supervisor_assistant','director','deputy'].includes(auth.user?.role);
const aeList=val=>Array.isArray(val)?val:[];
const aeExternal=(url,title='فتح المصدر')=>/^https:\/\/[a-z0-9.-]+(?:[/?#]|$)/i.test(String(url||''))?
 '<a href="'+aeEsc(url)+'" target="_blank" rel="noopener noreferrer">'+aeEsc(title)+'</a>':'';
async function aeApi(action,payload={},useSession=false){
 const h={'Content-Type':'application/json'};
 if(useSession){if(!auth.token)throw Error('سجل الدخول إلى المنصة.');h.Authorization='Bearer '+auth.token;}
 const response=await fetch(AE_API,{method:'POST',headers:h,cache:'no-store',body:JSON.stringify({action,...payload})});
 const data=await response.json().catch(()=>({}));
 if(!response.ok||data?.ok!==true)throw Error(data?.error||'تعذر الاتصال بخدمات آفاق ماث.');
 return data;
}
function aeStatus(message,error=false){aeState.msg=String(message||'');aeState.noticeError=error;
 const node=document.getElementById('aeLiveMessage');if(node){node.textContent=aeState.msg;node.classList.toggle('ae-error',error)}}
function aeRefresh(){if(state.page==='home'||state.page==='workshops'||state.page==='science_news'||state.page==='dashboard')render();}
async function aeLoadPublic(force=false){
 if(aeState.publicBusy||(!force&&aeState.publicTried))return;
 aeState.publicTried=true;aeState.publicBusy=true;
 try{aeState.public=await aeApi('public')}catch(err){aeStatus(err.message,true)}
 finally{aeState.publicBusy=false;aeRefresh()}
}
async function aeLoadNews(force=false){
 if(aeState.newsBusy||(!force&&aeState.newsTried))return;
 aeState.newsTried=true;aeState.newsBusy=true;
 try{aeState.news=await aeApi('news')}catch(err){aeStatus(err.message,true)}
 finally{aeState.newsBusy=false;aeRefresh()}
}
async function aeLoadStaff(force=false){
 if(!aeStaff()||aeState.staffBusy||(!force&&aeState.staffTried))return;
 aeState.staffTried=true;aeState.staffBusy=true;
 try{aeState.staffData=await aeApi('staff_list',{},true)}catch(err){aeStatus(err.message,true)}
 finally{aeState.staffBusy=false;aeRefresh()}
}
function aeEnsurePublic(){if(!aeState.publicTried)Promise.resolve().then(()=>aeLoadPublic())}
function aeEnsureNews(){if(!aeState.newsTried)Promise.resolve().then(()=>aeLoadNews())}
function aeEnsureStaff(){if(!aeState.staffTried)Promise.resolve().then(()=>aeLoadStaff())}
function afaqHomeUpdates(){
 aeEnsurePublic();
 const data=aeState.public;
 if(!data||data.notices_visible===false)return '';
 const rows=aeList(data.notices).filter(n=>n.published);
 if(!rows.length)return '';
 return '<aside class="ae-notice-bar" aria-label="تحديثات المنصة"><strong><span>🔔</span> تحديثات آفاق ماث</strong>'+
 '<div class="ae-notice-track"><div class="ae-notice-motion">'+rows.map(n=>
  '<span class="ae-notice-item">'+(n.url?aeExternal(n.url,n.title):aeEsc(n.title))+
  (n.description?' • '+aeEsc(n.description):'')+'</span>').join('<span class="ae-separator">✦</span>')+
 '</div></div></aside>';
}
const AE_NEWS_CATS=[['world','🌐','الأخبار العامة'],['national','🇴🇲','أخبار وطنية'],
 ['sport','⚽','الرياضة'],['business','💼','المال والأعمال'],['science','🔬','العلوم'],
 ['technology','💻','التكنولوجيا'],['culture','📚','الثقافة']];
function aeWeatherIcon(code){return [0,1].includes(Number(code))?'☀️':[2,3].includes(Number(code))?'⛅':
 [45,48].includes(Number(code))?'🌫️':[51,53,55,61,63,65,80,81,82].includes(Number(code))?'🌧️':'🌤️'}
function aeNewsLabel(code){return AE_NEWS_CATS.find(x=>x[0]===code)?.[2]||code}
function afaqHomeNewsTicker(){
 aeEnsureNews();
 const data=aeState.news,items=aeList(data?.items);
 const weather=aeList(data?.weather).slice(0,2).map(x=>
  '<span class="ae-weather-item">'+aeWeatherIcon(x.weather_code)+' '+aeEsc(x.city)+' '+aeEsc(x.temperature)+'°م</span>').join('');
 const preferred=['world','sport','business','science','technology'];
 const headlines=preferred.map(cat=>items.find(x=>x.category===cat)).filter(Boolean);
 return '<div class="ae-news-bar" aria-label="موجز الأخبار والطقس">'+
  '<button type="button" class="ae-news-title" data-route="science_news">🌐 آخر الأخبار</button>'+
  '<div class="ae-news-channels"><span>🇴🇲 '+aeExternal('https://omannews.gov.om','وكالة الأنباء العمانية')+'</span>'+
  headlines.map(x=>'<span><small>'+aeEsc(aeNewsLabel(x.category))+'</small> '+
   aeExternal(x.url,x.title)+'</span>').join('')+
  (!headlines.length?'<span>تصفح أخبار العلم والثقافة والرياضة من مصادرها</span>':'')+
  '</div>'+(weather?'<div class="ae-news-weather">'+weather+'</div>':'')+
  '<button type="button" class="ae-news-more" data-route="science_news">جميع الأخبار</button></div>';
}
function aeNewsPage(){
 aeEnsureNews();
 const d=aeState.news,items=aeList(d?.items);
 const active=aeState.newsTab;
 const chosen=items.filter(x=>x.category===active);
 return '<div class="container ae-news-page" dir="rtl">'+
 '<section class="ae-section-hero"><span>📰 مستجدات العالم</span><h1>أخبار الثقافة والعلوم والتكنولوجيا</h1>'+
 '<p>عناوين حديثة من مصادرها الأصلية، مع الأخبار العامة والرياضة والاقتصاد والطقس في سلطنة عُمان.</p></section>'+
 '<nav class="ae-news-tabs">'+AE_NEWS_CATS.map(([key,icon,label])=>
 '<button type="button" data-ae-news-tab="'+key+'" class="'+(key===active?'active':'')+'">'+icon+' '+label+'</button>').join('')+'</nav>'+
 (active==='national'?'<section class="ae-info-card"><h2>🇴🇲 أخبار سلطنة عُمان</h2>'+
 '<p>اطلع على الأخبار والمبادرات الوطنية في مصدرها الرسمي.</p>'+
 aeExternal('https://omannews.gov.om','فتح وكالة الأنباء العُمانية')+'</section>':
 '<div class="ae-article-grid">'+(chosen.length?chosen.map(x=>
  '<article class="ae-story-card"><span class="ae-source">'+aeEsc(x.source)+'</span>'+
  '<h2>'+aeExternal(x.url,x.title)+'</h2>'+
  '<p>'+aeEsc(x.published_at||'')+'</p></article>').join(''):
  '<article class="ae-story-card"><h2>لا تتوفر عناوين حديثة من المصدر الآن</h2>'+
  '<p>يمكنك متابعة المصدر مباشرة.</p>'+aeExternal(
  ({world:'https://www.bbc.com/arabic',sport:'https://www.bbc.com/sport',
   business:'https://www.bbc.com/news/business',science:'https://www.bbc.com/news/science_and_environment',
   technology:'https://www.bbc.com/news/technology',culture:'https://www.bbc.com/culture'})[active]||'https://www.bbc.com','فتح مصدر الأخبار')+'</article>')+
 '</div>')+
 '<section class="ae-info-card"><h2>🌤️ الطقس في سلطنة عُمان</h2>'+
 '<div class="ae-weather-grid">'+aeList(d?.weather).map(x=>
  '<article><strong>'+aeWeatherIcon(x.weather_code)+' '+aeEsc(x.city)+'</strong>'+
  '<b>'+aeEsc(x.temperature)+'°م</b><small>سرعة الرياح '+aeEsc(x.wind_speed)+' كم/س</small>'+
  '<small>المصدر: Open-Meteo • '+aeEsc(x.observed_at||'')+'</small></article>').join('')+
 (!d?.weather?.length?'<p>معلومات الطقس غير متاحة مؤقتًا.</p>':'')+'</div></section>'+
 '<p class="ae-news-credit">العناوين روابط إلى مصادر خارجية، وليست محتوى تحريريًا للمنصة. قد تتعذر تغذية الأخبار عند انقطاع الخدمة.</p>'+
 '<button class="ae-secondary" id="aeNewsRefresh" type="button">↻ تحديث الأخبار والطقس</button></div>';
}
function aeWorkshopSlides(w){
 const slides=[{heading:w.title,lines:[w.description]},
 {heading:'أهداف المشغل',lines:aeList(w.objectives).slice(0,3)},
 {heading:'التطبيق العملي',lines:aeList(w.objectives).slice(3).length?
 aeList(w.objectives).slice(3):['طبق المفهوم في درس للرياضيات ثم ناقش أثره على فهم الطالب.']},
 {heading:'التقويم وأثر التعلم',lines:['ما أثر الأداة أو الاستراتيجية على تعلم الطلاب؟',
 'كيف توثق الشواهد وتعدل النشاط وفق الاستجابة؟','سؤال ختامي: ما الذي ستطبقه في الحصة المقبلة؟']}];
 return '<div class="ae-slide-cover">'+slides.map((slide,i)=>
  '<section class="ae-presentation-slide"><span>آفاق ماث | Afaq Math • المشغل '+(i+1)+' / '+slides.length+'</span>'+
  '<h1>'+aeEsc(slide.heading)+'</h1>'+slide.lines.map(line=>'<p>✦ '+aeEsc(line)+'</p>').join('')+
  '<footer>تطوير مهني لمعلمي الرياضيات • '+aeEsc(w.duration_minutes)+' دقيقة</footer></section>').join('')+'</div>';
}
function aePrintSlides(w){
 const win=window.open('','_blank');if(!win){alert('اسمح بفتح نافذة الطباعة.');return}
 win.document.open();win.document.write('<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8">'+
 '<title>مشغل الإنماء المهني — '+aeEsc(w.title)+'</title><style>@page{size:A4 landscape;margin:0}'+
 'body{font-family:Tahoma,Arial,sans-serif;margin:0;color:#193c62;background:#edf4fb}'+
 '.ae-presentation-slide{height:210mm;box-sizing:border-box;padding:19mm 23mm;break-after:page;'+
 'display:flex;flex-direction:column;justify-content:center;gap:13mm;position:relative;'+
 'background:linear-gradient(130deg,#d8efff,#fff,#f1fcf3);border:8mm solid #125b8f}'+
 '.ae-presentation-slide>span{font-size:12pt;color:#357e7e;font-weight:bold}'+
 '.ae-presentation-slide h1{font-size:28pt;margin:0;color:#173f78}'+
 '.ae-presentation-slide p{font-size:18pt;line-height:1.7;margin:0}'+
 '.ae-presentation-slide footer{position:absolute;bottom:11mm;right:23mm;font-size:12pt;color:#47818b}'+
 '</style>'+aeWorkshopSlides(w));win.document.close();
 win.onload=()=>{win.focus();win.print()};
}
function aeWorkshopsPage(){
 aeEnsurePublic();
 const data=aeState.public;
 const workshops=aeList(data?.workshops).filter(x=>x.published);
 return '<div class="container ae-workshops-page" dir="rtl">'+
 '<section class="ae-section-hero"><span>🎓 التعليم والتعلّم</span>'+
 '<h1>مشاغل الإنماء المهني لمعلمي الرياضيات</h1>'+
 '<p>مشاغل تطبيقية قصيرة في الذكاء الاصطناعي والوسائل التعليمية والتقويم والتقنيات الرقمية، مع محاور وعروض قابلة للطباعة.</p></section>'+
 '<div class="ae-workshop-grid">'+(workshops.length?workshops.map((w,i)=>
  '<article class="ae-workshop-card"><div class="ae-workshop-icon">'+['🤖','🧮','🎯','📐','📋'][i%5]+'</div>'+
  '<div><small>'+aeEsc(w.duration_minutes)+' دقيقة</small><h2>'+aeEsc(w.title)+'</h2>'+
  '<p>'+aeEsc(w.description)+'</p><details><summary>محاور المشغل</summary><ol>'+
  aeList(w.objectives).map(x=>'<li>'+aeEsc(x)+'</li>').join('')+'</ol></details>'+
  '<div class="ae-workshop-actions"><button type="button" data-ae-slides="'+aeEsc(w.id)+'">'+
  '🖨️ عرض الشرائح / حفظ PDF</button>'+
  (w.resource_url?aeExternal(w.resource_url,'📎 ملف المشغل'):'')+'</div></div></article>').join(''):
  '<p>لم تُنشر مشاغل حتى الآن.</p>')+'</div></div>';
}
function aeWorkspaceLinks(){
 return '<section class="ae-learning-tools">'+
 '<div class="ae-tool-preview"><div class="ae-tool-icon">🥭</div><div><h2>خلاط الرياضيات — Math Mixer</h2>'+
 '<p>افهم العلاقة بين المدخلات والعملية والمخرجات، ثم جرّب العمليات والقواعد العكسية بنفسك.</p></div>'+
 '<button type="button" class="primary" data-route="mixer">تجربة خلاط الرياضيات</button></div>'+
 '<div class="ae-tool-preview"><div class="ae-tool-icon">🎓</div><div><h2>مشاغل الإنماء المهني</h2>'+
 '<p>مشاغل تعليمية تطبيقية جاهزة للمراجعة والطباعة.</p></div>'+
 '<button type="button" class="primary" data-route="workshops">فتح المشاغل</button></div>'+
 '<div class="ae-tool-preview"><div class="ae-tool-icon">🎯</div><div><h2>التقويم المتكيف والتغذية الراجعة</h2>'+
 '<p>شفوي، سؤال قصير، اختبار قصير، واجب واختبار نهائي تجريبي.</p></div>'+
 '<button type="button" class="primary" data-route="adaptive">بدء التقويم</button></div>'+
 '</section>';
}
const aeOldLearning=learning;
learning=function(){return aeOldLearning()+aeWorkspaceLinks()};
function aeAdminIndex(){
 return '<section class="ae-admin-shortcuts">'+
 '<button type="button" data-tab="ae_notices">🔔 تحديثات المنصة</button>'+
 '<button type="button" data-tab="ae_workshops">🎓 إدارة المشاغل</button>'+
 '<button type="button" data-tab="ae_question_bank">🧩 بنك الأسئلة والتغذية الراجعة</button>'+
 '<button type="button" data-tab="hub_print">🖨️ مركز الطباعة</button></section>';
}
const aeBeforeStaffPanel=staffPanel;
staffPanel=function(){
 if(auth.section==='ae_notices'&&aeStaff())return aeNoticeAdmin();
 if(auth.section==='ae_workshops'&&aeStaff())return aeWorkshopAdmin();
 if(auth.section==='ae_question_bank'&&aeStaff()&&typeof aeQuestionAdmin==="function")return aeQuestionAdmin();
 const old=aeBeforeStaffPanel();
 if(aeStaff()&&auth.section==='overview')return old+aeAdminIndex();
 return old;
};
function aeNoticeAdmin(){
 aeEnsureStaff();
 const d=aeState.staffData,edit=aeList(d?.notices).find(x=>x.id===aeState.editNotice);
 return '<div class="container ae-admin-page"><div class="ae-section-hero"><h1>🔔 إدارة شريط تحديثات المنصة</h1>'+
 '<p>أضف التحديثات وحدد ظهور الشريط في الصفحة الرئيسية.</p></div>'+
 '<div class="ae-admin-actions"><label class="ae-switch"><input type="checkbox" id="aeNoticeVisible" '+
 (d?.notices_visible!==false?'checked':'')+' '+(!aeSuper()?'disabled':'')+
 '> إظهار شريط تحديثات المنصة</label></div>'+
 (aeSuper()?'<form id="aeNoticeForm" class="ae-admin-form">'+
 '<input type="hidden" name="id" value="'+aeEsc(edit?.id||'')+'">'+
 '<label>عنوان التحديث<input name="title" maxlength="140" required value="'+aeEsc(edit?.title||'')+'"></label>'+
 '<label>التفاصيل<textarea name="description" maxlength="600" rows="2">'+aeEsc(edit?.description||'')+'</textarea></label>'+
 '<label>رابط اختياري<input type="url" name="url" value="'+aeEsc(edit?.url||'')+'" placeholder="https://..."></label>'+
 '<label><input type="checkbox" name="published" '+(edit?.published!==false?'checked':'')+'> منشور</label>'+
 '<button class="primary" type="submit">💾 '+(edit?'حفظ التعديل':'إضافة تحديث')+'</button></form>':'')+
 '<div class="ae-admin-list">'+aeList(d?.notices).map(n=>
  '<article><strong>'+aeEsc(n.title)+'</strong><p>'+aeEsc(n.description||'')+'</p>'+
  '<small>'+(n.published?'منشور':'غير منشور')+'</small>'+
  (aeSuper()?'<button type="button" data-ae-edit-notice="'+aeEsc(n.id)+'">تعديل</button>'+
  '<button type="button" data-ae-delete-notice="'+aeEsc(n.id)+'">حذف</button>':'')+
  '</article>').join('')+'</div><p id="aeLiveMessage" class="'+(aeState.noticeError?'ae-error':'')+'">'+aeEsc(aeState.msg)+'</p></div>';
}
function aeWorkshopAdmin(){
 aeEnsureStaff();
 const d=aeState.staffData,edit=aeList(d?.workshops).find(x=>x.id===aeState.editWorkshop);
 return '<div class="container ae-admin-page"><div class="ae-section-hero"><h1>🎓 إدارة مشاغل الإنماء المهني</h1>'+
 '<p>إضافة المشاغل وتحديث المحاور وإرفاق رابط ملف عرض أو مستند أو حذفه.</p></div>'+
 (aeSuper()?'<form id="aeWorkshopForm" class="ae-admin-form">'+
 '<input type="hidden" name="id" value="'+aeEsc(edit?.id||'')+'">'+
 '<label>عنوان المشغل<input name="title" maxlength="180" required value="'+aeEsc(edit?.title||'')+'"></label>'+
 '<label>الوصف<textarea name="description" maxlength="1000" rows="3">'+aeEsc(edit?.description||'')+'</textarea></label>'+
 '<label>المحاور (كل محور في سطر)<textarea name="objectives" rows="5">'+aeEsc(aeList(edit?.objectives).join('\n'))+'</textarea></label>'+
 '<label>المدة بالدقائق<input type="number" name="duration_minutes" min="5" max="240" value="'+aeEsc(edit?.duration_minutes||15)+'"></label>'+
 '<label>رابط ملف العرض أو الفيديو (اختياري)<input type="url" name="resource_url" value="'+aeEsc(edit?.resource_url||'')+'" placeholder="https://..."></label>'+
 '<label><input type="checkbox" name="published" '+(edit?.published!==false?'checked':'')+'> منشور</label>'+
 '<button class="primary" type="submit">💾 '+(edit?'حفظ المشغل':'إضافة مشغل')+'</button></form>':'')+
 '<div class="ae-admin-list">'+aeList(d?.workshops).map(w=>
  '<article><strong>'+aeEsc(w.title)+'</strong><p>'+aeEsc(w.description||'')+'</p>'+
  '<small>'+(w.published?'منشور':'غير منشور')+' • '+aeEsc(w.duration_minutes)+' دقيقة</small>'+
  (aeSuper()?'<button type="button" data-ae-edit-workshop="'+aeEsc(w.id)+'">تعديل</button>'+
  '<button type="button" data-ae-delete-workshop="'+aeEsc(w.id)+'">حذف</button>':'')+
  '</article>').join('')+'</div><p id="aeLiveMessage" class="'+(aeState.noticeError?'ae-error':'')+'">'+aeEsc(aeState.msg)+'</p></div>';
}
const aeOldGeneric=genericSection;
genericSection=function(page){
 if(page==='workshops')return aeWorkshopsPage();
 if(page==='science_news')return aeNewsPage();
 return aeOldGeneric(page);
};
const aePrevAttach=attach;
attach=function(){aePrevAttach();aeBind();};
function aeBind(){
 document.querySelectorAll('[data-ae-news-tab]').forEach(el=>el.addEventListener('click',()=>{
  aeState.newsTab=el.dataset.aeNewsTab;render();
 }));
 document.getElementById('aeNewsRefresh')?.addEventListener('click',()=>aeLoadNews(true));
 document.querySelectorAll('[data-ae-slides]').forEach(el=>el.addEventListener('click',()=>{
  const w=aeList(aeState.public?.workshops).find(x=>x.id===el.dataset.aeSlides);
  if(w)aePrintSlides(w);
 }));
 document.getElementById('aeNoticeVisible')?.addEventListener('change',async el=>{
  try{await aeApi('notice_visibility',{enabled:el.target.checked},true);
   aeState.staffData=null;aeState.staffTried=false;aeState.publicTried=false;
   await Promise.all([aeLoadStaff(),aeLoadPublic(true)]);
   aeStatus('تم تحديث ظهور شريط الأخبار بنجاح.');
  }catch(err){aeStatus(err.message,true);render()}
 });
 document.querySelectorAll('[data-ae-edit-notice]').forEach(el=>el.addEventListener('click',()=>{
  aeState.editNotice=el.dataset.aeEditNotice;render();
 }));
 document.querySelectorAll('[data-ae-edit-workshop]').forEach(el=>el.addEventListener('click',()=>{
  aeState.editWorkshop=el.dataset.aeEditWorkshop;render();
 }));
 const doDelete=async(action,id,description)=>{
  if(!aeSuper()||!window.confirm(description))return;
  try{await aeApi(action,{id},true);aeState.staffTried=false;aeState.publicTried=false;
   await Promise.all([aeLoadStaff(),aeLoadPublic(true)]);aeStatus('تم الحذف.')}
  catch(err){aeStatus(err.message,true)}
 };
 document.querySelectorAll('[data-ae-delete-notice]').forEach(el=>el.addEventListener('click',()=>
  doDelete('notice_delete',el.dataset.aeDeleteNotice,'حذف هذا التحديث من المنصة؟')));
 document.querySelectorAll('[data-ae-delete-workshop]').forEach(el=>el.addEventListener('click',()=>
  doDelete('workshop_delete',el.dataset.aeDeleteWorkshop,'حذف هذا المشغل من المنصة؟')));
 document.getElementById('aeNoticeForm')?.addEventListener('submit',async ev=>{
  ev.preventDefault();if(!aeSuper())return;
  const data=Object.fromEntries(new FormData(ev.currentTarget));
  try{await aeApi('notice_save',{...data,published:ev.currentTarget.querySelector('[name=published]').checked},true);
   aeState.editNotice=null;aeState.staffTried=false;aeState.publicTried=false;
   await Promise.all([aeLoadStaff(),aeLoadPublic(true)]);aeStatus('حُفظ التحديث بنجاح.')}
  catch(err){aeStatus(err.message,true)}
 });
 document.getElementById('aeWorkshopForm')?.addEventListener('submit',async ev=>{
  ev.preventDefault();if(!aeSuper())return;
  const data=Object.fromEntries(new FormData(ev.currentTarget));
  try{await aeApi('workshop_save',{...data,duration_minutes:Number(data.duration_minutes),
   objectives:String(data.objectives||'').split('\n').map(x=>x.trim()).filter(Boolean),
   published:ev.currentTarget.querySelector('[name=published]').checked},true);
   aeState.editWorkshop=null;aeState.staffTried=false;aeState.publicTried=false;
   await Promise.all([aeLoadStaff(),aeLoadPublic(true)]);aeStatus('حُفظ المشغل بنجاح.')}
  catch(err){aeStatus(err.message,true)}
 });
}
