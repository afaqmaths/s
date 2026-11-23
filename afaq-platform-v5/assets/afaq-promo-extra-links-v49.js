/* AFAQMATHS — unlimited additional public website links, two distinct home columns.
   Existing four links and two image cards per side remain untouched. */
(function(){
 'use strict';
 if(typeof hubHome!=='function'||typeof staffPanel!=='function'||typeof attach!=='function')return;
 const API='https://xcwuwflggiwkehzquugz.supabase.co/functions/v1/afaq-home-extra-links';
 const stateExtra={public:[],admin:[],publicLoaded:false,adminLoaded:false,
  publicLoading:false,adminLoading:false,busy:false,error:'',notice:''};
 const escapeHtml=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const adminAccess=()=>auth.user?.role==='supervisor'&&!!auth.token;
 async function call(action,payload={},withToken=false){
  const token=withToken&&adminAccess()?auth.token:null;
  const resp=await fetch(API,{method:'POST',headers:{
   'Content-Type':'application/json',...(token?{'Authorization':'Bearer '+token}:{})
  },cache:'no-store',body:JSON.stringify({action,...payload})});
  let data;
  try{data=await resp.json()}catch{throw Error('تعذرت قراءة استجابة خدمة المواقع الإضافية')}
  if(!resp.ok||!data?.ok){
   const errors={
    supervisor_only:'هذا الإجراء مخصص للمشرف الرئيسي فقط.',
    invalid_title:'اكتب عنوان الموقع، بطول لا يتجاوز ١٢٠ حرفًا.',
    invalid_https_url:'اكتب رابطًا صحيحًا يبدأ بـ https://.',
    duplicate_link:'هذا الموقع مضاف مسبقًا في الجانب نفسه.',
    invalid_side:'اختر الجانب الأيمن أو الأيسر.',
    invalid_sort_order:'ترتيب الرابط يجب أن يكون رقمًا بين ١ و٩٩٩٩.',
    link_not_found:'هذا الرابط غير موجود، حدّث القائمة.'
   };
   throw Error(errors[data?.error]||data?.error||'تعذر إكمال العملية.');
  }
  return data;
 }
 function extraLinkHtml(entry){
  if(entry?.enabled!==true||!entry.title||!/^https:\/\//i.test(entry.target_url||''))return '';
  return '<a class="afaq-promo-text-link afaq-promo-additional-link" href="'+
    escapeHtml(entry.target_url)+'" target="_blank" rel="noopener noreferrer" aria-label="'+
    escapeHtml(entry.title)+'"><span class="afaq-link-title-only">'+
    escapeHtml(entry.title)+'</span></a>';
 }
 const homeOriginal=hubHome;
 hubHome=function(...args){
  const html=homeOriginal.apply(this,args);
  if(typeof html!=='string'||!html.includes('afaq-promo-area'))return html;
  const temp=document.createElement('div');temp.innerHTML=html;
  for(const side of ['right','left']){
   const list=temp.querySelector('.afaq-promo-side--'+side+' .afaq-promo-links');
   if(!list)continue;
   const markup=stateExtra.public
    .filter(item=>item.side===side&&item.enabled)
    .sort((a,b)=>Number(a.sort_order)-Number(b.sort_order)||Number(a.id)-Number(b.id))
    .map(extraLinkHtml).join('');
   if(markup)list.insertAdjacentHTML('beforeend',markup);
  }
  return temp.innerHTML;
 };
 function fields(item={},side='right',isNew=false){
  const title=isNew?'':item.title||'';
  const url=isNew?'':item.target_url||'';
  const id=isNew?'new':item.id;
  const order=isNew?Math.max(10,...stateExtra.admin.filter(x=>x.side===side)
   .map(x=>Number(x.sort_order)||0))+10:Number(item.sort_order)||100;
  const active=isNew||item.enabled!==false;
  return '<form class="afaq-promo-extra-form" data-afaq-extra-form="'+escapeHtml(id)+
   '" data-afaq-extra-side="'+side+'" dir="rtl">'+
   '<div class="afaq-promo-extra-form-title">'+
   (isNew?'🔗 موقع إضافي جديد':'🔗 '+escapeHtml(title))+
   (isNew?'':'<small>رقم الموقع '+escapeHtml(id)+'</small>')+'</div>'+
   '<div class="afaq-promo-extra-fields">'+
   '<label>العنوان الظاهر للزوار<input name="title" type="text" required maxlength="120" '+
    'placeholder="اسم الموقع فقط" value="'+escapeHtml(title)+'"></label>'+
   '<label>الرابط الحقيقي (لا يظهر للزائر)<input name="target_url" type="url" required maxlength="900" '+
    'placeholder="https://example.com" value="'+escapeHtml(url)+'"></label>'+
   '<label>ترتيب العرض<input name="sort_order" type="number" required min="1" max="9999" '+
    'value="'+escapeHtml(order)+'"></label>'+
   '</div>'+
   '<label class="afaq-promo-extra-enabled"><input name="enabled" type="checkbox"'+
    (active?' checked':'')+'> إظهار الرابط في الصفحة الرئيسية</label>'+
   '<div class="afaq-promo-extra-actions">'+
   '<button type="submit" class="afaq-promo-extra-save"'+(stateExtra.busy?' disabled':'')+'>'+
    (isNew?'✚ إضافة الموقع إلى الصفحة':'💾 حفظ التعديلات')+'</button>'+
   (isNew?'':'<button type="button" class="afaq-promo-extra-delete" data-afaq-extra-delete="'+
    escapeHtml(id)+'"'+(stateExtra.busy?' disabled':'')+'>حذف هذا الموقع</button>')+
   '</div></form>';
 }
 function managerSection(side){
  const named=side==='right'?'الأيمن':'الأيسر';
  const items=stateExtra.admin.filter(x=>x.side===side)
   .sort((a,b)=>Number(a.sort_order)-Number(b.sort_order)||Number(a.id)-Number(b.id));
  return '<section class="afaq-promo-extra-manager" data-afaq-extra-manager="'+side+'">'+
   '<header><h4>🌐 مواقع وروابط إضافية — الجانب '+named+'</h4>'+
   '<p>أضف ما تريد من مواقع جديدة. يظهر عنوان كل موقع فقط داخل إطار لامع، ويمكن تغيير ترتيبه أو إخفاؤه أو حذفه.</p></header>'+
   (stateExtra.error?'<p class="afaq-promo-extra-error" role="alert">'+
    escapeHtml(stateExtra.error)+'</p>':'')+
   (stateExtra.notice?'<p class="afaq-promo-extra-notice" role="status">'+
    escapeHtml(stateExtra.notice)+'</p>':'')+
   (!stateExtra.adminLoaded?'<p class="afaq-promo-extra-loading">جارٍ تحميل المواقع الإضافية المحفوظة...</p>':'')+
   '<div class="afaq-promo-extra-rows">'+items.map(x=>fields(x,side)).join('')+'</div>'+
   '<details class="afaq-promo-extra-add"><summary>✚ إضافة موقع جديد إلى الجانب '+named+
    '</summary>'+fields({},side,true)+'</details>'+
   '<button type="button" class="afaq-promo-extra-refresh" data-afaq-extra-refresh>'+
    '↻ تحديث قائمة المواقع الإضافية</button>'+
   '</section>';
 }
 const originalStaff=staffPanel;
 staffPanel=function(...args){
  const html=originalStaff.apply(this,args);
  if(auth.section!=='home_promos'||!adminAccess()||
    typeof html!=='string'||!html.includes('afaq-promo-admin-sides'))return html;
  const temp=document.createElement('div');temp.innerHTML=html;
  for(const [n,side]of [[0,'right'],[1,'left']]){
   const area=temp.querySelectorAll('.afaq-promo-admin-sides>.afaq-promo-admin-side')[n];
   if(area)area.insertAdjacentHTML('beforeend',managerSection(side));
  }
  const p=temp.querySelector('.afaq-promo-admin-header>p');
  if(p)p.textContent='صورتان إعلانيّتان وأربعة روابط أساسية في كل جانب، ويمكنك إضافة مواقع جديدة دون حدّ ثابت من قسم «مواقع وروابط إضافية» أسفل كل جانب. يظهر اسم الموقع للزائر داخل إطار لامع فقط، بينما يظهر عنوان الرابط الحقيقي في لوحة المشرف.';
  return temp.innerHTML;
 };
 async function refreshPublic(){
  if(stateExtra.publicLoading)return;
  stateExtra.publicLoading=true;
  try{
   const response=await call('list');
   stateExtra.public=response.links||[];
   stateExtra.publicLoaded=true;
   if(state.page==='home')render();
  }catch(e){console.warn('Additional links unavailable:',e.message)}
  finally{stateExtra.publicLoading=false}
 }
 async function refreshAdmin(){
  if(!adminAccess()||stateExtra.adminLoading)return;
  stateExtra.adminLoading=true;
  try{
   const response=await call('admin_list',{},true);
   stateExtra.admin=response.links||[];
   stateExtra.adminLoaded=true;
   stateExtra.error='';
  }catch(e){stateExtra.error=e.message}
  finally{
   stateExtra.adminLoading=false;
   if(state.page==='dashboard'&&auth.section==='home_promos')render();
  }
 }
 async function saveExtra(form){
  if(!adminAccess()||stateExtra.busy)return;
  const f=new FormData(form),id=form.dataset.afaqExtraForm,side=form.dataset.afaqExtraSide;
  const payload={
   side,title:String(f.get('title')||'').trim(),
   target_url:String(f.get('target_url')||'').trim(),
   enabled:f.has('enabled'),sort_order:Number(f.get('sort_order'))
  };
  if(id!=='new')payload.id=Number(id);
  stateExtra.busy=true;stateExtra.notice='';stateExtra.error='';
  form.querySelectorAll('button').forEach(b=>b.disabled=true);
  try{
   await call('save',payload,true);
   stateExtra.notice='✓ تم حفظ الموقع بنجاح في الجانب '+(side==='right'?'الأيمن':'الأيسر')+'.';
   await Promise.all([refreshPublic(),refreshAdmin()]);
  }catch(e){stateExtra.error=e.message}
  finally{
   stateExtra.busy=false;
   if(state.page==='dashboard'&&auth.section==='home_promos')render();
  }
 }
 async function deleteExtra(id){
  if(!adminAccess()||stateExtra.busy)return;
  const row=stateExtra.admin.find(x=>Number(x.id)===id);
  if(!row)return;
  if(!window.confirm('هل تريد حذف موقع «'+row.title+'» نهائيًا من القسم؟'))return;
  stateExtra.busy=true;stateExtra.notice='';stateExtra.error='';
  try{
   await call('delete',{id},true);
   stateExtra.notice='✓ تم حذف الموقع «'+row.title+'».';
   await Promise.all([refreshPublic(),refreshAdmin()]);
  }catch(e){stateExtra.error=e.message}
  finally{
   stateExtra.busy=false;
   if(state.page==='dashboard'&&auth.section==='home_promos')render();
  }
 }
 function bindExtra(){
  document.querySelectorAll('form[data-afaq-extra-form]').forEach(form=>{
   form.addEventListener('submit',e=>{e.preventDefault();saveExtra(form)});
  });
  document.querySelectorAll('[data-afaq-extra-delete]').forEach(button=>{
   button.addEventListener('click',()=>deleteExtra(Number(button.dataset.afaqExtraDelete)));
  });
  document.querySelectorAll('[data-afaq-extra-refresh]').forEach(button=>{
   button.addEventListener('click',()=>refreshAdmin());
  });
  if(state.page==='dashboard'&&auth.section==='home_promos'&&adminAccess()&&
    !stateExtra.adminLoaded&&!stateExtra.adminLoading){
   Promise.resolve().then(refreshAdmin);
  }
 }
 const oldAttach=attach;
 attach=function(...args){const result=oldAttach.apply(this,args);bindExtra();return result};
 const oldTab=hubLoadForTab;
 hubLoadForTab=function(id,...args){
  const result=oldTab.call(this,id,...args);
  if(id==='home_promos'&&adminAccess())refreshAdmin();
  return result;
 };
 refreshPublic();
})();