/* Afaq Math — time, calendar, search, selectable city weather */
'use strict';
const aw={cities:null,loading:false,month:0};
function awDates(){
 const fmt=o=>new Intl.DateTimeFormat('ar-OM',{timeZone:'Asia/Muscat',...o}).format(new Date());
 const time=document.getElementById('awTime'),date=document.getElementById('awDate'),h=document.getElementById('awHijri');
 if(time)time.textContent=fmt({hour:'2-digit',minute:'2-digit',hour12:true});
 if(date)date.textContent=fmt({weekday:'long',day:'numeric',month:'long',year:'numeric'});
 if(h)try{h.textContent=new Intl.DateTimeFormat('ar-OM-u-ca-islamic-umalqura',{timeZone:'Asia/Muscat',day:'numeric',month:'long',year:'numeric'}).format(new Date())}catch{h.textContent=''}
}
function awWeather(){
 const el=document.getElementById('awWeather');if(!el)return;
 const rows=aeList(aeState.news?.weather);
 el.innerHTML=rows.length?rows.map(x=>'<span>🌤️ <b>'+aeEsc(x.city)+'</b> '+aeEsc(x.temperature)+'°م</span>').join(''):
 '<span>🌤️ الطقس المباشر</span>';
}
const awLinks=[['رياضيات','learning'],['التعليم','learning'],['أوراق العمل','work'],
 ['الخلاط','mixer'],['خلاط','mixer'],['الإنماء','workshops'],['مشاغل','workshops'],
 ['تقويم','adaptive'],['اختبار','adaptive'],['شفوي','adaptive'],['أسئلة','question_bank'],
 ['المكتبة','library'],['منافسة','contests'],['مسابقة','contests'],
 ['الأخبار','science_news'],['التكنولوجيا','science_news'],['الطقس','science_news'],
 ['طباعة','print_center'],['شهادة','print_center'],['قيمة وطنية','national_values']];
function awSearch(){
 const value=document.getElementById('awSearchInput')?.value.trim()||'',
 results=document.getElementById('awSearchResults');if(!results)return;
 const found=value?awLinks.filter(([name])=>name.includes(value)||value.includes(name)).slice(0,8):[];
 results.innerHTML=value?(found.length?found.map(([name,page])=>
  '<button type="button" data-aw-route="'+page+'">'+aeEsc(name)+'</button>').join(''):
  '<p>لا توجد نتيجة مطابقة.</p>'):'';
 results.hidden=!value;return found;
}
function awCalendar(){
 const today=new Date(),date=new Date(Date.UTC(today.getFullYear(),today.getMonth()+aw.month,1));
 const year=date.getUTCFullYear(),month=date.getUTCMonth(),
  length=new Date(Date.UTC(year,month+1,0)).getUTCDate(),offset=(date.getUTCDay()+1)%7;
 const names=['السبت','الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'];
 return '<div class="aw-calendar-top"><button data-aw-month="-1">❮</button>'+
 '<h2>'+new Intl.DateTimeFormat('ar-OM',{month:'long',year:'numeric',timeZone:'UTC'}).format(date)+'</h2>'+
 '<button data-aw-month="1">❯</button></div><div class="aw-calendar-days">'+
 names.map(x=>'<strong>'+x+'</strong>').join('')+
 Array(offset).fill('<span></span>').join('')+
 Array.from({length},(_,i)=>'<span class="'+(i+1===today.getDate()&&month===today.getMonth()&&year===today.getFullYear()?'today':'')+'">'+
 new Intl.NumberFormat('ar-OM').format(i+1)+'</span>').join('')+'</div>'+
 '<p>التوقيت المعتمد: سلطنة عُمان • التقويم الهجري بحسب حساب أم القرى.</p>';
}
async function awCities(force=false){
 if(aw.loading||(!force&&aw.cities))return;
 aw.loading=true;try{aw.cities=await aeApi('weather_cities')}
 catch(err){aeStatus(err.message,true)}finally{aw.loading=false;if(auth.section==='ae_weather')render()}
}
function awSettings(){
 if(!aw.cities)Promise.resolve().then(()=>awCities());
 const selected=aeList(aw.cities?.selected),cities=aeList(aw.cities?.cities);
 return '<div class="container aw-admin" dir="rtl"><section class="ae-section-hero"><h1>🌤️ اختيار مدينتي الطقس</h1>'+
 '<p>يمكن للمشرف اختيار مدينتين ليظهر طقسهما المباشر في أعلى المنصة وشريط الأخبار.</p></section>'+
 '<form id="awCitiesForm">'+[1,2].map(slot=>{
  const code=selected.find(x=>x.slot===slot)?.city_code;
  return '<label>المدينة '+slot+'<select name="slot'+slot+'">'+cities.map(c=>
   '<option value="'+aeEsc(c.code)+'"'+(c.code===code?' selected':'')+'>'+aeEsc(c.label)+'</option>').join('')+
   '</select></label>';
 }).join('')+
 '<button type="submit" class="primary" '+(auth.user?.role==='supervisor'?'':'disabled')+'>'+
 '💾 حفظ المدينتين</button></form><p id="awMessage" role="status"></p></div>';
}
const awStaff=staffPanel;staffPanel=function(){
 if(auth.section==='ae_weather'&&auth.user?.role==='supervisor')return awSettings();
 const html=awStaff();
 if(auth.section==='overview'&&auth.user?.role==='supervisor')
  return html+'<div class="container aw-shortcut"><button type="button" data-tab="ae_weather">🌤️ إعداد مدينتي الطقس</button></div>';
 return html;
};
const awAttach=attach;attach=function(){
 awAttach();
 document.getElementById('awCitiesForm')?.addEventListener('submit',async ev=>{
  ev.preventDefault();if(auth.user?.role!=='supervisor')return;
  const data=new FormData(ev.currentTarget),cities=[data.get('slot1'),data.get('slot2')];
  const status=document.getElementById('awMessage');
  if(cities[0]===cities[1]){status.textContent='اختر مدينتين مختلفتين.';return}
  try{await aeApi('weather_city_save',{slot:1,city_code:cities[0]},true);
   await aeApi('weather_city_save',{slot:2,city_code:cities[1]},true);
   await Promise.all([awCities(true),aeLoadNews(true)]);
   awWeather();status.textContent='تم تحديث المدينتين بنجاح.';
  }catch(err){status.textContent=err.message}
 });
};
function awInit(){
 if(document.getElementById('awUtility'))return;
 const top=document.querySelector('header.topbar');if(!top)return;
 const bar=document.createElement('section');bar.id='awUtility';bar.className='aw-utility';bar.dir='rtl';
 bar.innerHTML='<button type="button" id="awHome" aria-label="الرئيسية">⌂</button>'+
 '<form id="awSearchForm" class="aw-search"><button type="submit" aria-label="بحث">⌕</button>'+
 '<input id="awSearchInput" type="search" placeholder="ابحث في آفاق ماث...">'+
 '<div id="awSearchResults" class="aw-search-results" hidden></div></form>'+
 '<div class="aw-datetime"><span>🕒 <strong id="awTime"></strong></span>'+
 '<button id="awCalendarOpen" type="button">📅 <span id="awDate"></span></button>'+
 '<small>هجري: <span id="awHijri"></span></small></div>'+
 '<div id="awWeather" class="aw-weather"><span>🌤️ الطقس المباشر</span></div>';
 top.before(bar);
 const modal=document.createElement('dialog');modal.id='awCalendarDialog';modal.className='aw-calendar-dialog';
 modal.innerHTML='<button id="awClose" type="button" class="aw-close">×</button><div id="awCalendar"></div>';
 document.body.appendChild(modal);
 document.getElementById('awHome').addEventListener('click',()=>route('home'));
 document.getElementById('awCalendarOpen').addEventListener('click',()=>{
  aw.month=0;document.getElementById('awCalendar').innerHTML=awCalendar();modal.showModal();
 });
 document.getElementById('awClose').addEventListener('click',()=>modal.close());
 modal.addEventListener('click',ev=>{
  const x=ev.target.closest('[data-aw-month]');if(!x)return;
  aw.month+=Number(x.dataset.awMonth);document.getElementById('awCalendar').innerHTML=awCalendar();
 });
 document.getElementById('awSearchInput').addEventListener('input',awSearch);
 document.getElementById('awSearchResults').addEventListener('click',ev=>{
  const x=ev.target.closest('[data-aw-route]');if(x){document.getElementById('awSearchResults').hidden=true;route(x.dataset.awRoute)}
 });
 document.getElementById('awSearchForm').addEventListener('submit',ev=>{
  ev.preventDefault();const hits=awSearch();if(hits.length===1)route(hits[0][1]);
 });
 awDates();awWeather();window.setInterval(awDates,45000);window.setInterval(awWeather,30000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',awInit);else awInit();
