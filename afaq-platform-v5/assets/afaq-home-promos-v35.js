/* Afaq Math • four editable image promotions and eight editable links on the homepage.
   All content persisted through authenticated supervisor endpoints in afaq-public-hub. */
(function(){
 'use strict';
 if(typeof hubHome!=='function'||typeof staffPanel!=='function'||typeof hubCall!=='function')return;
 const statePromos={public:[],admin:[],headings:[],adminLoaded:false,adminLoading:false,publicError:'',adminError:'',notice:'',busy:0};
 const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const adminReady=()=>auth.user?.role==='supervisor'&&!!auth.token;
 const idsForSide=(side,kind)=>kind==='image'?(side==='right'?[1,2]:[3,4]):(side==='right'?[5,6,7,8]:[9,10,11,12]);
 const slotData=(id,admin=false)=>{
  const rows=admin?statePromos.admin:statePromos.public;
  return rows.find(s=>Number(s.slot_id)===id)||{slot_id:id,title:'',target_url:'',image_url:'',external_image_url:'',image_path:'',enabled:false};
 };
 const isHttps=x=>{try{const u=new URL(String(x||''));return u.protocol==='https:'&&!!u.hostname&&!u.username&&!u.password}catch{return false}};
 function sideHeading(side){
  const found=statePromos.headings.find(item=>item.side===side);
  return found||{side,title:side==='right'?'الصور والروابط — الجانب الأيمن':'الصور والروابط — الجانب الأيسر',subtitle:'صورتان • أربعة روابط'};
 }
 function imageCard(id){
  const s=slotData(id),valid=s.enabled&&s.title&&isHttps(s.target_url)&&isHttps(s.image_url);
  return '<article class="afaq-promo-image-card afaq-promo-image-card--'+id+'">'+(valid?
   '<a class="afaq-promo-clickable" href="'+safe(s.target_url)+'" target="_blank" rel="noopener noreferrer" aria-label="'+safe(s.title)+'">'+
   '<img src="'+safe(s.image_url)+'" alt="'+safe(s.title)+'" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-afaq-promo-photo>'+
   '<span class="afaq-promo-visual-fallback" aria-hidden="true"><b>'+(id<=2?'⚽':'🎮')+'</b>'+
    '<i>'+safe(id<=2?'عالم الملاعب والرياضة':'عالم الألعاب والمرح')+'</i></span>'+
   '<strong>'+safe(s.title)+'</strong></a>':
   '<div class="afaq-promo-vacant" aria-label="مساحة إعلان فارغة">'+
   '<span aria-hidden="true">▧</span><strong>مساحة صورة إعلانية '+(id>2?id-2:id)+'</strong>'+
   '<small>تُضاف من لوحة مشرف آفاق ماث</small></div>')+'</article>';
 }
 function linksForSide(side){
  return idsForSide(side,'link').map((id,n)=>{
   const s=slotData(id),valid=s.enabled&&s.title&&isHttps(s.target_url);
   return valid?'<a class="afaq-promo-text-link" href="'+safe(s.target_url)+'" target="_blank" rel="noopener noreferrer">'+
    '<span aria-hidden="true">↗</span><span>'+safe(s.title)+'</span></a>':
    '<div class="afaq-promo-link-empty"><span aria-hidden="true">＋</span> رابط '+(n+1)+' قابل للإضافة</div>';
  }).join('');
 }
 function sideMarkup(side){
  const header=sideHeading(side);
  return '<div class="afaq-promo-side afaq-promo-side--'+side+'">'+
   '<div class="afaq-promo-side-head"><strong>'+safe(header.title)+
   '</strong><span>'+safe(header.subtitle)+'</span></div>'+
   '<div class="afaq-promo-images">'+idsForSide(side,'image').map(imageCard).join('')+'</div>'+
   '<div class="afaq-promo-links">'+linksForSide(side)+'</div></div>';
 }
 function homeMarkup(){
  return '<section class="afaq-promo-area" dir="rtl" aria-label="إعلانات وروابط آفاق ماث">'+
   '<div class="afaq-promo-title"><div><span>الرياضة • المباريات • الألعاب والمرح</span>'+
   '<h2>⚽🎮 اكتشف مواقع ومواد مفيدة</h2>'+
   '<p>ملاعب ونجوم كرة القدم على اليمين، وعالم الألعاب والمرح على اليسار؛ اختر عنوان الموقع داخل الإطار اللامع لفتحه، دون عرض عنوان الرابط الطويل.</p></div>'+
   (adminReady()?'<button type="button" class="afaq-promo-manage" data-afaq-promos-manage>⚙️ إدارة الصور والروابط</button>':'')+
   '</div><div class="afaq-promo-two-sides">'+sideMarkup('right')+sideMarkup('left')+'</div></section>';
 }
 const previousHome=hubHome;
 hubHome=function(...args){
  const html=previousHome.apply(this,args);
  if(typeof html!=='string'||html.includes('afaq-promo-area'))return html;
  const temp=document.createElement('div');temp.innerHTML=html;
  // Preserve the original "ما هي منصة آفاق ماث؟" introduction above the new advertisements.
  const introduction=temp.querySelector('.afaq-final-introduction');
  const hero=temp.querySelector('.hub-banner.afaq-animated-hero');
  const anchor=introduction||hero;
  if(!anchor)return html;
  anchor.insertAdjacentHTML('afterend',homeMarkup());
  return temp.innerHTML;
 };
 function adminSlotForm(id){
  const image=id<=4,s=slotData(id,true),side=(id<=2||id>=5&&id<=8)?'الأيمن':'الأيسر';
  const title=image?'صورة إعلان '+(id<=2?id:id-2):'رابط '+(id<=8?id-4:id-8);
  const img=image&&isHttps(s.image_url)?'<img class="afaq-promo-admin-thumb" src="'+safe(s.image_url)+'" alt="معاينة الصورة الحالية">':'';
  return '<form class="afaq-promo-admin-form" data-afaq-promo-form="'+id+'" dir="rtl">'+
   '<header><strong>'+(image?'🖼️ ':'🔗 ')+title+'</strong><small>الجانب '+side+'</small></header>'+
   img+
   '<label>العنوان الظاهر في الصفحة الرئيسية<input type="text" name="title" maxlength="120" placeholder="'+(image?'عنوان الإعلان':'عنوان الرابط')+'" value="'+safe(s.title||'')+'"></label>'+
   '<label>رابط الموقع عند النقر (https://)<input type="url" name="target_url" maxlength="900" placeholder="https://example.com" value="'+safe(s.target_url||'')+'"></label>'+
   (image?'<label>إضافة صورة من الجهاز (JPG / PNG / WebP، بحد أقصى 3 ميجابايت)'+
    '<input type="file" name="image_file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"></label>'+
    '<label>أو رابط الصورة المباشر (https://)<input type="url" name="external_image_url" maxlength="900" placeholder="https://example.com/banner.png" value="'+safe(s.external_image_url||(!s.image_path&&s.image_url?s.image_url:''))+'"></label>'+
    '<input type="hidden" name="image_path" value="'+safe(s.image_path||'')+'">':'')+
   '<label class="afaq-promo-enabled"><input type="checkbox" name="enabled" '+(s.enabled?'checked':'')+'> إظهار هذا '+(image?'الإعلان':'الرابط')+' للزوار بعد حفظه</label>'+
   '<div class="afaq-promo-form-actions"><button type="submit" '+(statePromos.busy?'disabled':'')+'>حفظ '+(image?'الصورة':'الرابط')+'</button>'+
   '<button type="button" class="afaq-promo-remove" data-afaq-promo-delete="'+id+'" '+(statePromos.busy?'disabled':'')+'>حذف المحتوى</button></div></form>';
 }
 function adminPanel(){
  if(!adminReady())return '<p class="notice">إدارة الصور الإعلانية وروابط المواقع متاحة للمشرف الرئيسي فقط.</p>';
  const nav=typeof hubStaffNav==='function'?hubStaffNav():'';
  const side=(where)=>{
   const header=sideHeading(where);
   return '<section class="afaq-promo-admin-side"><h3>الجانب '+(where==='right'?'الأيمن':'الأيسر')+'</h3>'+
    '<p>يمكنك تغيير العنوان الرئيسي والوصف المختصر اللذين يظهران فوق صور هذا الجانب.</p>'+
    '<form class="afaq-promo-heading-form" data-afaq-promo-heading="'+where+'">'+
    '<label>عنوان الجانب الظاهر في الصفحة الرئيسية<input name="title" type="text" maxlength="120" required value="'+safe(header.title)+'" placeholder="اكتب عنوان الجانب"></label>'+
    '<label>الوصف المختصر بجانب العنوان<input name="subtitle" type="text" maxlength="100" value="'+safe(header.subtitle)+'" placeholder="مثال: صور ومواقع تعليمية"></label>'+
    '<button type="submit"'+(statePromos.busy?' disabled':'')+'>حفظ عنوان هذا الجانب ووصفه</button></form>'+
    '<div class="afaq-promo-admin-images">'+idsForSide(where,'image').map(adminSlotForm).join('')+'</div>'+
    '<div class="afaq-promo-admin-links">'+idsForSide(where,'link').map(adminSlotForm).join('')+'</div></section>';
  };
  return '<div class="container afaq-promo-admin" dir="rtl">'+nav+
   '<div class="afaq-promo-admin-header"><h2>🖼️ إدارة صور وروابط الرياضة والألعاب</h2>'+
   '<p>الجانب الأيمن لـ beIN SPORTS والمباريات، والأيسر للألعاب والمرح: صورتان وأربعة روابط في كل جانب. تظهر للزوار أسماء المواقع داخل أطر لامعة، دون إظهار عناوين URL. روابط الصور ومواقع الانتقال قابلة للتعديل والحفظ من هنا. احتفظ بالصورة الحالية أو استبدلها بصورة جديدة.</p>'+
   '<button type="button" data-afaq-promo-refresh>تحديث بيانات الصور والروابط</button>'+
   (statePromos.notice?'<p class="afaq-promo-feedback" role="status">'+safe(statePromos.notice)+'</p>':'')+
   (statePromos.adminError?'<p class="afaq-promo-error" role="alert">'+safe(statePromos.adminError)+'</p>':'')+
   (!statePromos.adminLoaded?'<p>جارٍ تحميل بيانات الخانات المحفوظة...</p>':'')+
   '</div><div class="afaq-promo-admin-sides">'+side('right')+side('left')+'</div></div>';
 }
 const previousStaff=staffPanel;
 staffPanel=function(...args){
  if(auth.section==='home_promos')return adminPanel();
  return previousStaff.apply(this,args);
 };
 async function fetchPublic(){
  try{
   const r=await hubCall('home_promos_public');statePromos.public=r.slots||[];
   statePromos.headings=r.headings||statePromos.headings;statePromos.publicError='';
   if(state.page==='home')render();
  }catch(e){statePromos.publicError=e.message||'تعذر تحميل الإعلانات'}
 }
 async function fetchAdmin(){
  if(!adminReady()||statePromos.adminLoading)return;
  statePromos.adminLoading=true;
  try{
   const r=await hubCall('home_promos_admin',{},auth.token);statePromos.admin=r.slots||[];
   statePromos.headings=r.headings||statePromos.headings;
   statePromos.adminLoaded=true;statePromos.adminError='';
  }catch(e){statePromos.adminError=e.message||'تعذر تحميل سجل الإعلان'}finally{
   statePromos.adminLoading=false;
   if(state.page==='dashboard'&&auth.section==='home_promos')render();
  }
 }
 function readImage(file){
  return new Promise((resolve,reject)=>{
   const fr=new FileReader();
   fr.onerror=()=>reject(new Error('تعذر قراءة ملف الصورة'));
   fr.onload=()=>resolve(String(fr.result||'').split(',')[1]||'');
   fr.readAsDataURL(file);
  });
 }
 async function saveForm(form){
  if(!adminReady()||statePromos.busy)return;
  const id=Number(form.dataset.afaqPromoForm),f=new FormData(form);
  const title=String(f.get('title')||'').trim(),target_url=String(f.get('target_url')||'').trim();
  let external_image_url=String(f.get('external_image_url')||'').trim();
  let image_path=String(f.get('image_path')||'');
  const enabled=f.has('enabled'),image=id<=4;
  const file=form.querySelector('input[type="file"]')?.files?.[0];
  if((target_url&&!isHttps(target_url))||(image&&external_image_url&&!isHttps(external_image_url))){
   window.alert('الروابط يجب أن تبدأ بـ https:// وأن تكون صالحة.');return;
  }
  if(enabled&&(!title||!target_url||(image&&!file&&!image_path&&!external_image_url))){
   window.alert('اكتب العنوان ورابط الموقع'+(image?'، وحدد الصورة أيضًا.':'.'));return;
  }
  if(file&&(file.size>3145728||file.size<100||!['image/jpeg','image/png','image/webp'].includes(file.type))){
   window.alert('الصور المسموحة: JPG أو PNG أو WebP وبحد أقصى 3 ميجابايت.');return;
  }
  statePromos.busy=id;statePromos.notice='جارٍ حفظ الخانة '+id+' ...';
  form.querySelectorAll('button').forEach(b=>b.disabled=true);
  try{
   if(file){
    const b64=await readImage(file);
    const uploaded=await hubCall('home_promos_upload',{slot_id:id,filename:file.name,mime:file.type,base64:b64},auth.token);
    image_path=uploaded.image_path;external_image_url='';
   }else if(external_image_url){image_path='';}
   await hubCall('home_promos_save',{slot_id:id,title,target_url,external_image_url,image_path,enabled},auth.token);
   statePromos.notice='✓ حُفظت الخانة رقم '+id+' بنجاح، وتحدّث عرض الصفحة الرئيسية.';
   await Promise.all([fetchAdmin(),fetchPublic()]);
  }catch(e){statePromos.adminError='تعذر حفظ الخانة '+id+': '+(e.message||'خطأ غير معروف')}
  finally{statePromos.busy=0;if(state.page==='dashboard'&&auth.section==='home_promos')render()}
 }
 async function saveHeading(form){
  if(!adminReady()||statePromos.busy)return;
  const side=form.dataset.afaqPromoHeading;
  const data=new FormData(form);
  const title=String(data.get('title')||'').trim(),subtitle=String(data.get('subtitle')||'').trim();
  if(!['right','left'].includes(side)||title.length<2||title.length>120||subtitle.length>100){
   window.alert('العنوان يجب أن يكون بين حرفين و120 حرفًا، والوصف حتى 100 حرف.');return;
  }
  statePromos.busy=side;
  statePromos.adminError='';
  try{
   const result=await hubCall('home_promos_heading_save',{side,title,subtitle},auth.token);
   statePromos.headings=statePromos.headings.filter(item=>item.side!==side).concat(result.heading);
   statePromos.notice='✓ تم حفظ عنوان الجانب '+(side==='right'?'الأيمن':'الأيسر')+' ووصفه.';
   await fetchPublic();
  }catch(e){
   statePromos.adminError='تعذر تعديل العنوان: '+(e.message||'حدث خطأ');
  }finally{
   statePromos.busy=0;
   if(state.page==='dashboard'&&auth.section==='home_promos')render();
  }
 }
 async function deleteSlot(id){
  if(!adminReady()||statePromos.busy)return;
  if(!window.confirm('هل تريد حذف الصورة أو الرابط في الخانة رقم '+id+'؟ ستصبح الخانة فارغة في الصفحة الرئيسية.'))return;
  statePromos.busy=id;
  try{
   await hubCall('home_promos_clear',{slot_id:id},auth.token);
   statePromos.notice='✓ أُفرغت الخانة رقم '+id+'. يمكنك إضافة مادة أخرى فيها.';
   await Promise.all([fetchAdmin(),fetchPublic()]);
  }catch(e){statePromos.adminError='تعذر حذف الخانة: '+(e.message||'خطأ غير معروف')}
  finally{statePromos.busy=0;if(state.page==='dashboard'&&auth.section==='home_promos')render()}
 }
 function bindEvents(){
  document.querySelectorAll('[data-afaq-promo-photo]').forEach(img=>{
   if(img.dataset.afaqPhotoBound)return;
   img.dataset.afaqPhotoBound='1';
   const fail=()=>img.closest('.afaq-promo-image-card')?.classList.add('afaq-promo-photo-unavailable');
   const recovered=()=>img.closest('.afaq-promo-image-card')?.classList.remove('afaq-promo-photo-unavailable');
   img.addEventListener('error',fail);
   img.addEventListener('load',recovered);
   if(img.complete&&img.naturalWidth===0)fail();
  });
  document.querySelectorAll('[data-afaq-promos-manage]').forEach(node=>node.addEventListener('click',()=>{
   if(!adminReady())return;
   auth.section='home_promos';route('dashboard');
   if(!statePromos.adminLoaded)fetchAdmin();
  }));
  document.querySelectorAll('[data-afaq-promo-heading]').forEach(form=>form.addEventListener('submit',event=>{
   event.preventDefault();saveHeading(form);
  }));
  document.querySelectorAll('[data-afaq-promo-form]').forEach(form=>form.addEventListener('submit',event=>{
   event.preventDefault();saveForm(form);
  }));
  document.querySelectorAll('[data-afaq-promo-delete]').forEach(button=>button.addEventListener('click',()=>deleteSlot(Number(button.dataset.afaqPromoDelete))));
  document.querySelectorAll('[data-afaq-promo-refresh]').forEach(button=>button.addEventListener('click',()=>fetchAdmin()));
 }
 const oldAttach=attach;
 attach=function(...args){oldAttach.apply(this,args);bindEvents()};
 const oldLoadTab=hubLoadForTab;
 hubLoadForTab=function(id,...args){
  if(id==='home_promos'){if(adminReady())fetchAdmin();return;}
  return oldLoadTab.call(this,id,...args);
 };
 fetchPublic();
})();
