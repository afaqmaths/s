'use strict';
/* تنقل آفاق الرياضيات: تاريخ آمن للوحة المشرف، دون تغيير جلسات الحساب */
(function(){
 const KEY='afaqNavigationV1';
 const SESSION='nav-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
 let ready=false,restoring=false,position=0;
 let entries=[];
 const safeString=v=>String(v??'');
 function staffLoggedIn(){return !!auth.user&&['supervisor','supervisor_assistant','director','deputy'].includes(auth.user.role)}
 function view(){
  const page=safeString(state.page||'home');
  const next={page};
  if(page==='dashboard'){
   next.section=safeString(auth.section||'overview');
   if(next.section==='staff_hub'&&typeof ssState!=='undefined')next.staffTab=safeString(ssState.tab||'');
   if(next.section==='companion_register'&&typeof cpState!=='undefined')next.companionTab=safeString(cpState.tab||'');
  }else if(page==='grade'){
   next.grade=state.grade;
   next.unit=state.lessonUnit;
  }else if(page==='library'){
   next.libraryTab=safeString(state.libraryTab||'history');
   if(typeof hub!=='undefined')next.hubLibrary=safeString(hub.libraryCat||'');
  }else if(page==='fun'&&typeof hub!=='undefined'){
   next.hubFun=safeString(hub.funCat||'');
  }
  return next;
 }
 const signature=x=>JSON.stringify(x||{});
 const stateFor=(v,i)=>({[KEY]:{session:SESSION,index:i,view:v}});
 const urlFor=v=>'#'+encodeURIComponent(v.page||'home');
 function remember(){
  if(!ready||restoring)return;
  const next=view();
  if(signature(next)===signature(entries[position]))return;
  // عند الرجوع ثم فتح قسم جديد تحذف عناصر التقدم القديمة (سلوك المتصفح المعتاد).
  entries=entries.slice(0,position+1);
  entries.push(next);position=entries.length-1;
  try{history.pushState(stateFor(next,position),'',urlFor(next))}
  catch(err){console.warn('Afaq navigation history:',err.message)}
 }
 function paint(){
  const app=document.getElementById('app');
  if(!app||!staffLoggedIn())return;
  const toolbar=document.createElement('nav');
  toolbar.className='afaq-nav-toolbar';
  toolbar.setAttribute('aria-label','التنقل الآمن داخل لوحة المشرف');
  const previous=entries[position-1];
  const allowPrevious=!!previous&&previous.page==='dashboard';
  const atMain=state.page==='dashboard'&&(auth.section||'overview')==='overview';
  toolbar.innerHTML='<div class="afaq-nav-actions">'+
    '<button type="button" id="afaqNavBack"'+(!allowPrevious&&atMain?' disabled':'')+
      ' aria-label="الرجوع إلى القسم السابق داخل لوحة المشرف">❮ رجوع</button>'+
    '<button type="button" id="afaqNavDashboard">⌂ الرئيسية — لوحة المشرف</button></div>'+
    '<small>الرجوع لا يسجل خروجك. مفتاح Backspace يعمل خارج حقول الكتابة.</small>';
  app.prepend(toolbar);
  toolbar.querySelector('#afaqNavBack')?.addEventListener('click',goBack);
  toolbar.querySelector('#afaqNavDashboard')?.addEventListener('click',goDashboard);
 }
 function goDashboard(){
  if(!staffLoggedIn())return;
  if(state.page==='dashboard'&&auth.section==='overview')return;
  state.page='dashboard';auth.section='overview';render();
  window.scrollTo({top:0,behavior:'smooth'});
 }
 function goBack(){
  // لا يخرج زر الرجوع أو Backspace من لوحة المشرف عند وصوله لجذر اللوحة.
  if(staffLoggedIn()&&state.page==='dashboard'){
   const previous=entries[position-1];
   if(previous?.page==='dashboard'){history.back();return}
   if(auth.section!=='overview'){goDashboard();return}
   return;
  }
  if(position>0){history.back();return}
  if(staffLoggedIn())goDashboard();
 }
 function restore(saved){
  if(!saved||typeof saved.page!=='string')return;
  restoring=true;
  try{
   // لا يُعاد إنشاء صلاحيات أو جلسات من سجل التنقل.
   state.page=saved.page;
   if(saved.page==='dashboard'){
    auth.section=saved.section||'overview';
    if(saved.section==='staff_hub'&&typeof ssState!=='undefined'&&saved.staffTab)ssState.tab=saved.staffTab;
    if(saved.section==='companion_register'&&typeof cpState!=='undefined'&&saved.companionTab)cpState.tab=saved.companionTab;
   }else if(saved.page==='grade'){
    if(Number.isInteger(saved.grade))state.grade=saved.grade;
    if(Number.isInteger(saved.unit))state.lessonUnit=saved.unit;
   }else if(saved.page==='library'){
    if(saved.libraryTab)state.libraryTab=saved.libraryTab;
    if(typeof hub!=='undefined'&&saved.hubLibrary)hub.libraryCat=saved.hubLibrary;
   }else if(saved.page==='fun'&&typeof hub!=='undefined'&&saved.hubFun)hub.funCat=saved.hubFun;
   render();
   if(saved.page==='dashboard'&&typeof hubLoadForTab==='function'&&auth.user)
    hubLoadForTab(saved.section||'overview');
   window.scrollTo({top:0,behavior:'instant'});
  }finally{restoring=false}
 }
 function isEditable(node){
  if(!node)return false;
  if(node.isContentEditable)return true;
  const tag=safeString(node.tagName).toLowerCase();
  if(['input','textarea','select'].includes(tag))return true;
  return !!node.closest?.('[contenteditable=""],[contenteditable="true"],[role="textbox"],[role="combobox"]');
 }
 window.addEventListener('keydown',event=>{
  if(event.key!=='Backspace'||event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey)return;
  if(isEditable(event.target)||document.querySelector('dialog[open]'))return;
  // عندما لا يوجد سجل سابق للوحة المشرف لا يجوز أن يعيدنا المفتاح إلى موقع آخر.
  if(staffLoggedIn()||position>0){event.preventDefault();goBack()}
 });
 window.addEventListener('popstate',event=>{
  const nav=event.state?.[KEY];
  if(nav&&nav.view){
   if(nav.session===SESSION&&Number.isInteger(nav.index)&&entries[nav.index]){
    position=nav.index;
   }else{
    // دعم سجل متصفح سابق بعد إعادة التحميل، دون تحميل أي بيانات خاصة من التاريخ.
    entries=[nav.view];position=0;
   }
   restore(nav.view);
   return;
  }
  // قد تكون هذه صفحة أقدم من تحميل نظام التنقل؛ لا تغيّر تسجيل الدخول.
  const raw=(location.hash||'').replace(/^#/,'');
  let page='home';try{page=decodeURIComponent(raw)||'home'}catch{}
  const fixed=['home','dashboard','learning','library','grade','quiz','competition','contact','suggestions','complaints','visitor','fun','contests','guest_trial','parent','support','exams','ai','apps','projects','flashes','games'];
  const category=typeof sections!=='undefined'&&sections.some(s=>s[0]===page);
  if(!/^[a-z0-9_-]{1,48}$/i.test(page)||(!fixed.includes(page)&&!category))page='home';
  const backView={page};
  entries=[backView];position=0;
  restore(backView);
  try{history.replaceState(stateFor(backView,0),'',urlFor(backView))}catch{}
 });
 const priorRender=render;
 render=function(){
  priorRender.apply(this,arguments);
  remember();
  paint();
 };
 // الدالة القديمة تستبدل history.state بالعدم؛ نستبدلها بتنقل يحفظ الإدخال.
 route=function(page,scroll=true){
  if(!page)return;
  state.page=page;
  render();
  if(scroll)window.scrollTo({top:0,behavior:'smooth'});
 };
 if(typeof v4Navigate==='function')v4Navigate=function(page){route(page)};
 entries=[view()];position=0;
 try{history.replaceState(stateFor(entries[0],0),'',urlFor(entries[0]))}catch{}
 ready=true;
 paint();
 // للاختبارات الداخلية فقط؛ لا يغير جلسة الدخول ولا ينشر بيانات الطلاب.
 window.afaqNavigation={goBack,goDashboard,view};
})();