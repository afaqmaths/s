/* Afaq Math — ornamental bilingual platform title between Oman flag and login access. */
(function(){
'use strict';
if(typeof hubHome!=='function'||typeof staffPanel!=='function'||typeof hubCall!=='function')return;
const ST={title:{arabic_title:'منصة آفاق ماث',english_title:'Afaq Math'},error:'',notice:'',busy:false,adminLoaded:false,loading:false};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isSupervisor=()=>auth.user?.role==='supervisor'&&!!auth.token;
const arabicChars=x=>String(x??'').trim().length;
function headingMarkup(){
 const titleAr=ST.title.arabic_title||'منصة آفاق ماث';
 const titleEn=ST.title.english_title||'Afaq Math';
 return '<section class="afaq-gilded-platform-title" dir="rtl" aria-label="عنوان منصة آفاق ماث بالعربية والإنجليزية">'+
 '<div class="afaq-gilded-frame">'+
 '<span class="afaq-gilded-ornament afaq-gilded-ornament--tr" aria-hidden="true">❧</span>'+
 '<span class="afaq-gilded-ornament afaq-gilded-ornament--tl" aria-hidden="true">❧</span>'+
 '<span class="afaq-gilded-ornament afaq-gilded-ornament--br" aria-hidden="true">❧</span>'+
 '<span class="afaq-gilded-ornament afaq-gilded-ornament--bl" aria-hidden="true">❧</span>'+
 '<div class="afaq-gilded-line" aria-hidden="true"><span>✦</span><span>❖</span><span>✦</span></div>'+
 '<h2 class="afaq-gilded-ar">'+esc(titleAr)+'</h2>'+
 '<div class="afaq-gilded-english" lang="en" dir="ltr">'+esc(titleEn)+'</div>'+
 '<div class="afaq-gilded-line afaq-gilded-line--bottom" aria-hidden="true"><span>✦</span><span>❖</span><span>✦</span></div>'+
 '</div>'+
 (isSupervisor()?'<button type="button" class="afaq-gilded-edit-shortcut" data-afaq-platform-title-manage>'+
 '⚙️ تعديل عنوان المنصة</button>':'')+
 '</section>';
}
const earlierHome=hubHome;
hubHome=function(...args){
 const html=earlierHome.apply(this,args);
 if(typeof html!=='string'||html.includes('afaq-gilded-platform-title'))return html;
 const temp=document.createElement('div');temp.innerHTML=html;
 const home=temp.querySelector('.hub-home');if(!home)return html;
 // The original national flag is rendered immediately above the functional login gates.
 // Insert immediately BEFORE the login section, so flag and every original login button survive.
 const access=home.querySelector('.afaq-home-access.afaq-entry-between-flag-hero');
 const flag=home.querySelector('.v9-oman-horizon[data-national-ribbon="true"]');
 if(access)access.insertAdjacentHTML('beforebegin',headingMarkup());
 else if(flag)flag.insertAdjacentHTML('afterend',headingMarkup());
 else {
  const banner=home.querySelector('.hub-banner.afaq-animated-hero');
  if(banner)banner.insertAdjacentHTML('beforebegin',headingMarkup());
  else return html;
 }
 return temp.innerHTML;
};
function adminPage(){
 if(!isSupervisor())return '<div class="notice">تعديل اسم المنصة متاح للمشرف الرئيسي فقط.</div>';
 const ar=ST.title.arabic_title||'منصة آفاق ماث',en=ST.title.english_title||'Afaq Math';
 return '<div class="container afaq-gilded-title-admin" dir="rtl">'+
 (typeof hubStaffNav==='function'?hubStaffNav():'')+
 '<section class="afaq-gilded-title-admin-panel">'+
 '<header><span>✦ إعدادات هوية المنصة ✦</span><h2>تعديل عنوان آفاق ماث الذهبي</h2>'+
 '<p>تظهر اللوحة أسفل صورة العلم العُماني مباشرة وقبل خيارات الدخول. يمكنك تغيير الاسم بالعربية والإنجليزية مستقلين، وسيتم تحديثهما في الصفحة الرئيسية دون تغيير بقية النصوص أو وظائف المنصة.</p></header>'+
 (ST.notice?'<p class="afaq-gilded-admin-success" role="status">'+esc(ST.notice)+'</p>':'')+
 (ST.error?'<p class="afaq-gilded-admin-error" role="alert">'+esc(ST.error)+'</p>':'')+
 (ST.adminLoaded?'<form id="afaqGildedTitleForm">'+
 '<label>العنوان بالعربية<input type="text" name="arabic_title" maxlength="90" minlength="2" required value="'+esc(ar)+'" placeholder="منصة آفاق ماث"></label>'+
 '<label>العنوان بالإنجليزية<input type="text" name="english_title" maxlength="90" minlength="2" required dir="ltr" value="'+esc(en)+'" placeholder="Afaq Math"></label>'+
 '<p class="afaq-gilded-admin-hint">يُحفظ العنوانان كبيانات منفصلة. أحجام الخط والألوان والزخارف ثابتة للحفاظ على التصميم.</p>'+
 '<div class="afaq-gilded-admin-actions">'+
 '<button type="submit" class="afaq-gilded-admin-save"'+(ST.busy?' disabled':'')+'>💾 حفظ عنوان المنصة</button>'+
 '<button type="button" data-afaq-platform-title-refresh>تحديث من قاعدة البيانات</button>'+
 '<button type="button" data-afaq-platform-title-home>العودة إلى الصفحة الرئيسية</button>'+
 '</div></form>':
 '<div class="afaq-gilded-admin-loading">جارٍ استرجاع العنوان الحالي من قاعدة بيانات المنصة...</div>')+
 '</section></div>';
}
const earlierPanel=staffPanel;
staffPanel=function(...args){
 if(auth.section==='platform_title')return adminPage();
 return earlierPanel.apply(this,args);
};
async function fetchPublic(){
 try{
  const result=await hubCall('platform_title_public');
  if(result.title)ST.title={...ST.title,...result.title};
  if(state.page==='home')render();
 }catch(err){console.warn('platform title public load:',err?.message||err)}
}
async function fetchAdmin(){
 if(!isSupervisor()||ST.loading)return;
 ST.loading=true;ST.error='';
 try{
  const result=await hubCall('platform_title_admin',{},auth.token);
  if(result.title)ST.title={...ST.title,...result.title};
  ST.adminLoaded=true;
 }catch(err){ST.error='تعذر تحميل العنوان: '+(err.message||'خطأ غير معروف')}
 finally{
  ST.loading=false;
  if(state.page==='dashboard'&&auth.section==='platform_title')render();
 }
}
async function saveTitle(form){
 if(!isSupervisor()||ST.busy)return;
 const values=new FormData(form);
 const arabic_title=String(values.get('arabic_title')||'').trim();
 const english_title=String(values.get('english_title')||'').trim();
 if(arabicChars(arabic_title)<2||arabicChars(english_title)<2)
  return window.alert('الاسم بالعربية والإنجليزية مطلوب، وبحد أدنى حرفين لكل منهما.');
 if(arabic_title.length>90||english_title.length>90)
  return window.alert('الحد الأقصى لكل عنوان هو 90 حرفًا.');
 ST.busy=true;ST.error='';ST.notice='';
 try{
  const response=await hubCall('platform_title_save',{arabic_title,english_title},auth.token);
  ST.title={...ST.title,...response.title};
  ST.notice='✓ حُفظ الاسم العربي والإنجليزي. سيظهر التعديل في الصفحة الرئيسية فور الانتقال إليها.';
 }catch(err){ST.error='تعذر حفظ العنوان: '+(err.message||'خطأ غير معروف')}
 finally{
  ST.busy=false;
  if(state.page==='dashboard'&&auth.section==='platform_title')render();
 }
}
function openAdmin(){
 if(!isSupervisor())return;
 auth.section='platform_title';route('dashboard');
 if(!ST.adminLoaded)fetchAdmin();
}
function bind(){
 document.querySelectorAll('[data-afaq-platform-title-manage]').forEach(n=>n.addEventListener('click',openAdmin));
 document.getElementById('afaqGildedTitleForm')?.addEventListener('submit',ev=>{ev.preventDefault();saveTitle(ev.currentTarget)});
 document.querySelectorAll('[data-afaq-platform-title-refresh]').forEach(n=>n.addEventListener('click',fetchAdmin));
 document.querySelectorAll('[data-afaq-platform-title-home]').forEach(n=>n.addEventListener('click',()=>route('home')));
}
const earlierAttach=attach;
attach=function(...args){earlierAttach.apply(this,args);bind()};
const earlierLoad=hubLoadForTab;
hubLoadForTab=function(id,...args){
 if(id==='platform_title'){if(isSupervisor()&&!ST.adminLoaded)fetchAdmin();return}
 return earlierLoad.call(this,id,...args);
};
fetchPublic();
})();