/* Managed six-category honor board. Public student details require guardian consent. */
(function(){
'use strict';
if(typeof hubHome!=='function'||typeof staffPanel!=='function'||typeof hubCall!=='function')return;
const C=['academic','a_plus','rising','afaq','noor','math_club'];
const icons=['🏅','🌟','🚀','🏆','💻','🔢'];
const labels=['المتفوقون دراسيًا','المتفوقون في A+','النجوم الصاعدون','المتفوقون في منصة آفاق','المتفوقون في منصة نور','نجوم جماعة الرياضيات'];
const descriptions=['تفوق دراسي وتحصيل متميز','المشاركة والتفاعل الإيجابي','الإصرار والتقدم المستمر','إنجازات وتحديات آفاق ماث','الواجبات والتعلم في منصة نور','المبادرات والابتكار الرياضي'];
const stateHonor={settings:{title:'لوحة الشرف — نجوم آفاق الرياضيات',subtitle:'نحتفي بالتميز والعطاء',image_url:''},categories:[],entries:[],admin:[],loaded:false,loading:false,working:false,error:'',message:'',selected:'academic',editing:null};
const e=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const supervisor=()=>auth.user?.role==='supervisor'&&Boolean(auth.token);
const https=u=>{try{const v=new URL(String(u||''));return v.protocol==='https:'&&v.hostname.length>2&&!v.username&&!v.password}catch{return false}};
const category=code=>stateHonor.categories.find(x=>x.category_code===code)||{category_code:code,title:labels[C.indexOf(code)],description:descriptions[C.indexOf(code)]};
const students=(code,admin=false)=>(admin?stateHonor.admin:stateHonor.entries).filter(x=>x.category_code===code).sort((a,b)=>a.sort_order-b.sort_order||a.id-b.id);
const portrait=(url,name)=>https(url)?'<img loading="lazy" decoding="async" src="'+e(url)+'" alt="'+e(name)+'">':'<span aria-hidden="true">🎓</span>';
function studentCard(s){
 if(!s)return '<article class="honor-person honor-empty"><div class="honor-portrait">'+portrait('','')+'</div>'+
 '<strong>اسم الطالب</strong><p>مساحة للنبذة عن تفوق الطالب وإنجازه</p>'+
 '<div class="honor-quote"><b>رؤيتي وكلمتي</b><span>مساحة لكلمة الطالب</span></div>'+
 '<div class="honor-quote"><b>نصيحتي لزملائي</b><span>مساحة لنصيحته</span></div></article>';
 return '<article class="honor-person"><div class="honor-portrait">'+portrait(s.image_url,'صورة '+s.student_name)+'</div>'+
 '<strong>'+e(s.student_name)+'</strong><p>'+e(s.achievement||'')+'</p>'+
 '<div class="honor-quote"><b>رؤيتي وكلمتي</b><span>'+e(s.student_message||'—')+'</span></div>'+
 '<div class="honor-quote"><b>نصيحتي لزملائي</b><span>'+e(s.advice||'—')+'</span></div></article>';
}
function board(){
 return '<section class="afaq-honor-board" dir="rtl" aria-label="لوحة الشرف لطلاب منصة آفاق ماث">'+
 '<header class="honor-head"><div class="honor-head-image">'+portrait(stateHonor.settings.image_url,'شعار لوحة الشرف')+'</div>'+
 '<div><span>طلاب نفخر بهم</span><h2>'+e(stateHonor.settings.title)+'</h2>'+
 '<p>'+e(stateHonor.settings.subtitle||'')+'</p></div>'+
 (supervisor()?'<button type="button" data-honor-admin>⚙️ إدارة لوحة الشرف</button>':'')+'</header>'+
 '<div class="honor-six">'+C.map((code,i)=>{
  const c=category(code),arr=students(code),show=arr.concat(Array(Math.max(0,4-arr.length)).fill(null));
  return '<section class="honor-category"><header><span>'+icons[i]+'</span><div><h3>'+e(c.title)+'</h3><p>'+e(c.description)+'</p></div></header>'+
   '<div class="honor-people">'+show.map(studentCard).join('')+'</div>'+
   (arr.length>4?'<small>المكرمون: '+arr.length+' طلاب</small>':'')+'</section>';
 }).join('')+'</div>'+
 '<p class="honor-consent-public">تُنشر بيانات الطلاب وصورهم وكلماتهم بعد اعتماد المشرف وتوثيق موافقة ولي الأمر.</p></section>';
}
const oldHome=hubHome;
hubHome=function(...args){
 const html=oldHome.apply(this,args);if(!html||html.includes('afaq-honor-board'))return html;
 const doc=document.createElement('div');doc.innerHTML=html;
 const anchor=doc.querySelector('.afaq-promo-area')||doc.querySelector('.afaq-final-introduction')||doc.querySelector('.hub-banner');
 if(!anchor)return html;anchor.insertAdjacentHTML('afterend',board());return doc.innerHTML;
};
function imageFields(data){
 return '<div class="honor-image-fields">'+(https(data.image_url)?'<img class="honor-preview" src="'+e(data.image_url)+'" alt="معاينة الصورة">':'')+
 '<label>رفع صورة من الجهاز JPG أو PNG أو WebP — أقصى حجم 3 ميجابايت<input type="file" name="upload" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"></label>'+
 '<label>أو رابط الصورة المباشر (https://)<input type="url" name="external" maxlength="900" value="'+e(data.external_image_url||data.emblem_url||'')+'" placeholder="https://example.com/image.jpg"></label>'+
 '<label class="honor-check"><input type="checkbox" name="remove">حذف الصورة الحالية</label>'+
 '<input type="hidden" name="image_path" value="'+e(data.image_path||data.emblem_path||'')+'"></div>';
}
function adminForm(){
 const s=stateHonor.settings,code=stateHonor.selected,current=stateHonor.editing!==null?stateHonor.admin.find(x=>x.id===stateHonor.editing):null;
 const optionList=C.map(v=>'<option value="'+v+'"'+((current?.category_code||code)===v?' selected':'')+'>'+e(category(v).title)+'</option>').join('');
 return '<div class="honor-admin-forms">'+
 '<form class="honor-form" id="honorSettings"><h3>عنوان لوحة الشرف والصورة المجاورة له</h3>'+
 '<label>عنوان اللوحة<input name="title" type="text" required maxlength="140" value="'+e(s.title)+'"></label>'+
 '<label>وصف اللوحة<textarea name="subtitle" maxlength="300">'+e(s.subtitle)+'</textarea></label>'+
 imageFields({...s,image_url:s.image_url})+
 '<button type="submit" class="honor-save">حفظ عنوان وصورة لوحة الشرف</button></form>'+
 '<form class="honor-form" id="honorStudent"><h3>'+(current?'تعديل بيانات الطالب':'إضافة طالب مكرم')+'</h3>'+
 '<label>القسم<select name="category_code">'+optionList+'</select></label>'+
 '<label>اسم الطالب<input type="text" name="student_name" maxlength="150" required value="'+e(current?.student_name||'')+'"></label>'+
 '<label>نبذة عن تفوقه<textarea name="achievement" maxlength="800" placeholder="تصف إنجازه علميًا أو سلوكيًا">'+e(current?.achievement||'')+'</textarea></label>'+
 '<label>رؤيته وكلمته<textarea name="student_message" maxlength="750" placeholder="كلمة الطالب بنفسه">'+e(current?.student_message||'')+'</textarea></label>'+
 '<label>نصيحته لزملائه<textarea name="advice" maxlength="750" placeholder="نصيحتي لزملائي...">'+e(current?.advice||'')+'</textarea></label>'+
 imageFields(current||{})+
 '<label>ترتيبه في لوحته<input type="number" name="sort_order" min="0" max="100000" value="'+Number(current?.sort_order??(students(code,true).length+1)*10)+'"></label>'+
 '<div class="honor-consent"><label class="honor-check"><input type="checkbox" name="guardian_consent"'+(current?.guardian_consent?' checked':'')+'>'+
 ' أؤكد الحصول على موافقة ولي الأمر على نشر اسم الطالب وصورته وكلماته في صفحة عامة.</label>'+
 '<label class="honor-check"><input type="checkbox" name="published"'+(current?.published?' checked':'')+'>نشر البطاقة للزوار</label>'+
 '<small>دون موافقة ولي الأمر، يمكنك حفظ البطاقة مسودةً ولا تظهر للزوار.</small></div>'+
 '<div class="honor-form-buttons"><button type="submit" class="honor-save">حفظ بطاقة الطالب</button>'+
 '<button type="button" data-honor-cancel>بطاقة طالب جديد</button></div></form></div>';
}
function adminPage(){
 if(!supervisor())return '<p class="notice">إدارة لوحة الشرف متاحة للمشرف الرئيسي فقط.</p>';
 return '<div class="container honor-admin" dir="rtl">'+(typeof hubStaffNav==='function'?hubStaffNav():'')+
 '<div class="honor-admin-intro"><h2>🏆 إدارة لوحة الشرف</h2><p>ست لوحات ثابتة، ثلاث بالأعلى وثلاث بالأسفل. تُعرض أربع مساحات في كل لوحة مبدئيًا وتُزاد البطاقات تلقائيًا عند إضافة الطلاب. يمكنك تعديل الصور والأسماء والنبذات وكلمات الطلاب، أو إزالة البطاقات.</p>'+
 '<button type="button" data-honor-reload>تحديث السجلات</button>'+
 (stateHonor.message?'<p class="honor-feedback" role="status">'+e(stateHonor.message)+'</p>':'')+
 (stateHonor.error?'<p class="honor-error" role="alert">'+e(stateHonor.error)+'</p>':'')+'</div>'+
 (!stateHonor.loaded?'<p>جارٍ تحميل بيانات لوحة الشرف...</p>':
 adminForm()+'<div class="honor-admin-categories">'+C.map((code,i)=>{
  const cat=category(code),arr=students(code,true);
  return '<section class="honor-admin-category"><h3>'+icons[i]+' '+e(cat.title)+'</h3>'+
  '<form data-honor-cat="'+code+'" class="honor-cat-form">'+
  '<label>عنوان هذه اللوحة<input name="title" required maxlength="130" value="'+e(cat.title)+'"></label>'+
  '<label>وصفها<input name="description" maxlength="260" value="'+e(cat.description)+'"></label>'+
  '<button type="submit">حفظ عنوان اللوحة</button></form>'+
  '<button type="button" data-honor-add="'+code+'">＋ إضافة طالب لهذه اللوحة</button>'+
  '<div class="honor-admin-students">'+(arr.length?arr.map(x=>
   '<div><span>'+e(x.student_name)+' <small>'+(x.published&&x.guardian_consent?'منشور':'مسودة')+'</small></span>'+
   '<button type="button" data-honor-edit="'+Number(x.id)+'">تعديل</button>'+
   '<button type="button" data-honor-delete="'+Number(x.id)+'">حذف</button></div>').join(''):
   '<p>لا توجد بطاقات محفوظة بعد؛ ستظهر أربع مساحات مخصصة للطلاب.</p>')+'</div></section>';
 }).join('')+'</div>')+'</div>';
}
const oldStaff=staffPanel;
staffPanel=function(...args){return auth.section==='honor_board'?adminPage():oldStaff.apply(this,args)};
async function loadPublic(){
 try{
  const d=await hubCall('honor_board_public');
  stateHonor.settings={...stateHonor.settings,...(d.settings||{})};
  stateHonor.categories=d.categories||[];stateHonor.entries=d.entries||[];
  if(state.page==='home')render();
 }catch(err){stateHonor.error='تعذر تحميل بيانات لوحة الشرف.'}
}
async function loadAdmin(){
 if(!supervisor()||stateHonor.loading)return;
 stateHonor.loading=true;
 try{
  const d=await hubCall('honor_board_admin',{},auth.token);
  stateHonor.settings={...stateHonor.settings,...(d.settings||{})};
  stateHonor.categories=d.categories||[];stateHonor.admin=d.entries||[];
  stateHonor.loaded=true;stateHonor.error='';
 }catch(err){stateHonor.error='تعذر تحميل لوحة الشرف: '+err.message}
 finally{stateHonor.loading=false;if(state.page==='dashboard'&&auth.section==='honor_board')render()}
}
function openBoardAdmin(){
 if(!supervisor())return;
 auth.section='honor_board';route('dashboard');
 if(!stateHonor.loaded)loadAdmin();
}
async function encodeImage(file){return new Promise((resolve,reject)=>{
 const reader=new FileReader();reader.onerror=()=>reject(Error('تعذر قراءة الصورة'));
 reader.onload=()=>resolve(String(reader.result||'').split(',')[1]||'');
 reader.readAsDataURL(file);
})}
async function uploadedImage(form,kind){
 let path=String(form.elements.image_path?.value||''),external=String(form.elements.external?.value||'').trim();
 if(form.elements.remove?.checked){path='';external=''}
 if(external&&!https(external))throw Error('اكتب رابط صورة صحيحًا يبدأ بـ https://');
 const file=form.elements.upload?.files?.[0];
 if(file){
  if(file.size>3145728||file.size<100||!['image/jpeg','image/png','image/webp'].includes(file.type))
   throw Error('الصورة المقبولة JPG أو PNG أو WebP بحجم لا يزيد على 3 ميجابايت.');
  const res=await hubCall('honor_board_image_upload',{
   filename:file.name,mime:file.type,kind,base64:await encodeImage(file)},auth.token);
  path=res.image_path;external='';
 }else if(external)path='';
 return {path,external};
}
async function save(form,action,payload){
 if(!supervisor()||stateHonor.working)return;
 stateHonor.working=true;stateHonor.error='';stateHonor.message='';
 form.querySelectorAll('button').forEach(b=>b.disabled=true);
 try{
  await hubCall(action,payload,auth.token);
  stateHonor.message='✓ تم الحفظ بنجاح.';
  stateHonor.editing=null;
  await Promise.all([loadAdmin(),loadPublic()]);
 }catch(err){stateHonor.error='تعذر الحفظ: '+err.message}
 finally{stateHonor.working=false;if(state.page==='dashboard'&&auth.section==='honor_board')render()}
}
async function saveSettings(form){
 const f=new FormData(form),title=String(f.get('title')||'').trim();
 if(title.length<2)return window.alert('عنوان لوحة الشرف مطلوب.');
 try{
  const img=await uploadedImage(form,'emblems');
  await save(form,'honor_board_settings_save',{title,subtitle:String(f.get('subtitle')||''),emblem_path:img.path,emblem_url:img.external});
 }catch(err){stateHonor.error=err.message;render()}
}
async function saveStudent(form){
 const f=new FormData(form),published=f.has('published'),guardian_consent=f.has('guardian_consent');
 if(published&&!guardian_consent)return window.alert('لا يمكن نشر الطالب إلا بعد التحقق من موافقة ولي الأمر.');
 const data={category_code:String(f.get('category_code')),student_name:String(f.get('student_name')||'').trim(),
 achievement:String(f.get('achievement')||''),student_message:String(f.get('student_message')||''),
 advice:String(f.get('advice')||''),sort_order:Number(f.get('sort_order')||100),
 guardian_consent,published};
 if(data.student_name.length<2)return window.alert('أدخل اسم الطالب.');
 if(stateHonor.editing!==null)data.id=stateHonor.editing;
 try{
  const img=await uploadedImage(form,'students');
  data.image_path=img.path;data.external_image_url=img.external;
  await save(form,'honor_board_entry_save',data);
 }catch(err){stateHonor.error=err.message;render()}
}
async function remove(id){
 if(!supervisor()||stateHonor.working||!window.confirm('حذف بطاقة الطالب من لوحة الشرف؟ لن تُمسّ درجاته أو سجلاته المدرسية.'))return;
 stateHonor.working=true;stateHonor.error='';
 try{
  await hubCall('honor_board_entry_delete',{id},auth.token);
  stateHonor.editing=null;stateHonor.message='✓ حُذفت بطاقة الطالب من لوحة الشرف.';
  await Promise.all([loadAdmin(),loadPublic()]);
 }catch(err){stateHonor.error='تعذر الحذف: '+err.message}
 finally{stateHonor.working=false;render()}
}
function bind(){
 document.querySelectorAll('[data-honor-admin]').forEach(x=>x.addEventListener('click',openBoardAdmin));
 document.querySelectorAll('[data-honor-reload]').forEach(x=>x.addEventListener('click',loadAdmin));
 document.getElementById('honorSettings')?.addEventListener('submit',ev=>{ev.preventDefault();saveSettings(ev.currentTarget)});
 document.getElementById('honorStudent')?.addEventListener('submit',ev=>{ev.preventDefault();saveStudent(ev.currentTarget)});
 document.querySelectorAll('[data-honor-cat]').forEach(x=>x.addEventListener('submit',ev=>{
  ev.preventDefault();const f=new FormData(ev.currentTarget);save(ev.currentTarget,'honor_board_category_save',
   {category_code:ev.currentTarget.dataset.honorCat,title:String(f.get('title')||''),description:String(f.get('description')||'')});
 }));
 document.querySelectorAll('[data-honor-add]').forEach(x=>x.addEventListener('click',()=>{
  stateHonor.selected=x.dataset.honorAdd;stateHonor.editing=null;render();
  document.getElementById('honorStudent')?.scrollIntoView({behavior:'smooth'});
 }));
 document.querySelectorAll('[data-honor-edit]').forEach(x=>x.addEventListener('click',()=>{
  const s=stateHonor.admin.find(v=>v.id===Number(x.dataset.honorEdit));if(!s)return;
  stateHonor.editing=s.id;stateHonor.selected=s.category_code;render();
  document.getElementById('honorStudent')?.scrollIntoView({behavior:'smooth'});
 }));
 document.querySelectorAll('[data-honor-delete]').forEach(x=>x.addEventListener('click',()=>remove(Number(x.dataset.honorDelete))));
 document.querySelectorAll('[data-honor-cancel]').forEach(x=>x.addEventListener('click',()=>{stateHonor.editing=null;render()}));
}
const oldAttach=attach;
attach=function(...args){oldAttach.apply(this,args);bind()};
const oldTab=hubLoadForTab;
hubLoadForTab=function(id,...args){
 if(id==='honor_board'){if(supervisor()&&!stateHonor.loaded)loadAdmin();return}
 return oldTab.call(this,id,...args);
};
loadPublic();
})();