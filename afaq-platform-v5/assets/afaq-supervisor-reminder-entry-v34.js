/* Afaq Math • supervisor dashboard reminder preview on signed-in homepage.
   The dedicated competition dashboard provides full add/delete controls. */
(function(){
 'use strict';
 if(typeof staffPanel!=='function')return;
 const originalStaffPanel=staffPanel;
 let cache=null,lastToken='',lastAt=0,loading=false,fetchError='',refreshTimer=null;
 const encode=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 function eligible(){return typeof auth!=='undefined'&&auth.user?.role==='supervisor'&&Boolean(auth.token)}
 async function fetchPreview(force=false){
  if(!eligible()||loading)return;
  const token=auth.token;
  if(token!==lastToken){cache=null;lastToken=token;lastAt=0}
  if(!force&&Date.now()-lastAt<45000)return;
  loading=true;
  try{
   const target=typeof COMPETITION_API==='string'?COMPETITION_API:
    'https://xcwuwflggiwkehzquugz.supabase.co/functions/v1/afaq-contest-v2';
   const response=await fetch(target,{
    method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},
    body:JSON.stringify({action:'supervisor_reminders'}),cache:'no-store'
   });
   const data=await response.json();
   if(!response.ok||!data.ok)throw Error('تعذر استرجاع تذكيرات المسابقة');
   if(!eligible()||auth.token!==token)return;
   cache={reminders:data.reminders||[],pending:data.pending_approvals||0};
   fetchError='';
  }catch(err){fetchError=err.message||'تعذر اتصال التذكيرات'}finally{
   loading=false;lastAt=Date.now();
   if(eligible()&&auth.token===token&&typeof state!=='undefined'&&state.page==='dashboard'&&typeof render==='function')render();
  }
 }
 staffPanel=function(...args){
  const base=originalStaffPanel.apply(this,args);
  if(!eligible())return base;
  if(!cache||Date.now()-lastAt>=45000)fetchPreview();
  const count=cache?.reminders?.length??null;
  const stage=cache?.reminders?.filter(x=>x.kind==='stage').length||0;
  const review=cache?.pending||0;
  const latest=(cache?.reminders||[]).slice(0,3);
  return '<section class="afaq-supervisor-entry-reminders" aria-label="تذكيرات مسابقة نجوم آفاق" dir="rtl">'+
   '<div class="afaq-supervisor-entry-header"><div><span>🔔 منبه المشرف</span>'+
   '<h3>تذكيرات مسابقة نجوم آفاق الرياضيات</h3>'+
   '<p>'+(count===null?'جارٍ تحميل تذكيراتك المحفوظة من النظام...':
     'لديك '+count+' تذكير معلّق، منها '+stage+' تنبيهًا عن إكمال الطلاب لجولات المسابقة.')+
   (review?' • توجد '+review+' نماذج تنتظر المراجعة والاعتماد.':'')+'</p></div>'+
   '<a class="afaq-supervisor-reminders-link" href="competition.html">مراجعة التذكيرات • إضافة أو حذف</a></div>'+
   (latest.length?'<div class="afaq-supervisor-entry-items">'+latest.map(x=>'<div><b>'+encode(x.kind==='stage'?'🏅':x.kind==='review'?'📋':'📝')+'</b>'+
   '<strong>'+encode(x.title)+'</strong></div>').join('')+'</div>':'')+
   (fetchError?'<small class="afaq-supervisor-entry-error">'+encode(fetchError)+'</small>':'')+
   '</section>'+base;
 };
 if(!refreshTimer)refreshTimer=setInterval(()=>{
  if(eligible()&&typeof state!=='undefined'&&state.page==='dashboard')fetchPreview();
 },60000);
})();
