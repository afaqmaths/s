/* Afaq Math | Teacher's unique educational initiatives and Y/A coordinate lab */
'use strict';
const initV10={public:null,staff:null,publicLoaded:false,staffLoaded:false,loading:false,edit:'',error:''};
const initEsc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initArr=x=>Array.isArray(x)?x:[];
const initAdmin=()=>auth.user?.role==='supervisor';
const initStaff=()=>['supervisor','supervisor_assistant','director','deputy','it_viewer'].includes(auth.user?.role);
const initRoutes=[['mixer','خلاط الرياضيات'],['coordinate_ya','الإحداثيات ي/أ'],['workshops','المشاغل المهنية'],
 ['learning','التعليم والتعلم'],['adaptive','التقويم'],['work','أوراق العمل'],['library','المكتبة'],['question_bank','بنك الأسئلة'],['contests','المسابقات']];
const initDefaults=[
 {id:'default1',title:'خلاط الرياضيات',subtitle:'مدخلات ← عمليات ← مخرجات',description:'مبادرة تربط قواعد الرياضيات بالتجريب والتطبيق الحياتي.',icon:'mixer',accent:'gold',route:'mixer'},
 {id:'default2',title:'مبادرة ي/أ للإحداثيات',subtitle:'ي: يمين ويسار • أ: أعلى وأسفل',description:'مفتاح تذكّر للحركة الأفقية والرأسية مع الحفاظ على رمزي (س، ص).',icon:'coordinates',accent:'teal',route:'coordinate_ya'},
 {id:'default3',title:'الوسائل التعليمية المحسوسة والرقمية',subtitle:'المحسوس ← المصوّر ← المجرّد',description:'تمثيل مفاهيم الرياضيات باليد وبالأدوات الرقمية.',icon:'teaching',accent:'violet',route:'workshops'}
];
async function initFetchPublic(force=false){
 if(initV10.loading||(!force&&initV10.publicLoaded))return;
 initV10.loading=true;initV10.publicLoaded=true;
 try{const data=await aeApi('initiatives_public');initV10.public=initArr(data.initiatives)}
 catch(e){console.warn('initiatives',e)}
 finally{initV10.loading=false;if(state.page==='home'||state.page==='teaching_initiatives')render()}
}
async function initFetchStaff(force=false){
 if(!initStaff()||(!force&&initV10.staffLoaded))return;
 initV10.staffLoaded=true;
 try{const data=await aeApi('initiatives_staff',{},true);initV10.staff=initArr(data.initiatives)}
 catch(e){initV10.error=e.message}
 finally{if(state.page==='dashboard'&&auth.section==='ae_initiatives')render()}
}
function initPublic(){
 if(!initV10.publicLoaded)Promise.resolve().then(()=>initFetchPublic());
 return initV10.public==null?initDefaults:initV10.public.filter(x=>x.published);
}
function initArt(row){
 if(row.icon==='coordinates'||row.route==='coordinate_ya')
  return '<svg viewBox="0 0 160 100" aria-hidden="true" class="v10-initiative-mini-plane">'+
   '<g stroke="#c3dce9" stroke-width="1"><path d="M20 35H145M20 60H145M50 12V90M80 12V90M110 12V90"/></g>'+
   '<path d="M15 72H146M50 92V12" stroke="#3b76a6" stroke-width="3"/>'+
   '<path d="M64 72H109V31" stroke="#1ba2a4" stroke-width="5" fill="none"/>'+
   '<circle cx="64" cy="72" r="5" fill="#32b5c3"/><circle cx="109" cy="31" r="6" fill="#e6b051"/>'+
   '<g fill="#235e7e" font-size="17" font-weight="bold"><text x="117" y="72">ي</text><text x="115" y="25">أ</text></g></svg>';
 if(row.icon==='mixer'||row.route==='mixer')
  return '<img src="assets/afaq-mixer.svg?v=20261113-mixer1" width="102" height="109" loading="lazy" alt="خلاط الرياضيات">';
 const emojis={teaching:'🧰',mentor:'👨‍🏫',life:'📏'};
 return '<span class="v10-initiative-emoji">'+(emojis[row.icon]||'✨')+'</span>';
}
function initCard(r,brief=false){
 const route=initRoutes.some(x=>x[0]===r.route)?r.route:'teaching_initiatives';
 return '<article class="v10-init-card v10-init-'+initEsc(r.accent||'blue')+'">'+
 '<button type="button" data-route="'+initEsc(route)+'">'+
 initArt(r)+'<span class="v10-init-text"><strong>'+initEsc(r.title)+'</strong>'+
 '<small>'+initEsc(r.subtitle||'مبادرات تعليمية متجددة')+'</small>'+
 (!brief?'<span>'+initEsc(r.description||'')+'</span>':'')+'</span>'+
 '<span class="v10-init-arrow">↗</span></button></article>';
}
function initHome(){
 const data=initPublic().slice(0,3);
 return '<section class="v10-init-home" aria-label="مبادرات الأستاذ سعيد البريكي"><div class="v10-init-head">'+
 '<div><span>بصمة تعليمية خاصة</span><h2>مبادرات الأستاذ سعيد البريكي</h2>'+
 '<p>أفكار ملهمة تربط الرياضيات بالتجربة والتفكير والإبداع.</p></div>'+
 '<button type="button" data-route="teaching_initiatives">استكشف كل المبادرات</button></div>'+
 '<div class="v10-init-grid">'+(data.length?data.map(x=>initCard(x,true)).join(''):
 '<p class="v10-init-empty">لا توجد مبادرات منشورة بعد.</p>')+'</div></section>';
}
function initPage(){
 const data=initPublic();
 return '<div class="container v10-init-page" dir="rtl">'+
 '<header class="v10-init-page-hero"><span>من التجربة إلى الاكتشاف</span>'+
 '<h1>مبادرات الأستاذ سعيد البريكي</h1>'+
 '<p>مسارات مبتكرة لفهم الرياضيات وتطبيقها، قابلة للتجديد بإضافة المبادرات والمواد التعليمية.</p></header>'+
 '<div class="v10-init-grid v10-init-grid-large">'+data.map(x=>initCard(x,false)).join('')+'</div>'+
 (initAdmin()?'<button type="button" class="v10-init-manage" data-tab="ae_initiatives">إدارة المبادرات</button>':'')+'</div>';
}
function initAdminPage(){
 if(!initV10.staffLoaded)Promise.resolve().then(()=>initFetchStaff());
 const data=initArr(initV10.staff),edit=data.find(x=>x.id===initV10.edit);
 const v=k=>initEsc(edit?.[k]??'');
 return '<div class="container v10-init-admin" dir="rtl">'+
 '<header><h1>⚙️ إدارة المبادرات</h1><p>أضف أو عدّل أو احذف مبادرة، وحدد ما يظهر في الصفحة الرئيسية.</p></header>'+
 (initAdmin()?'<form id="initV10Form">'+
 '<input type="hidden" name="id" value="'+v('id')+'">'+
 '<label>اسم المبادرة<input name="title" maxlength="140" required value="'+v('title')+'"></label>'+
 '<label>عبارة قصيرة<input name="subtitle" maxlength="220" value="'+v('subtitle')+'"></label>'+
 '<label class="wide">وصف المبادرة<textarea name="description" rows="3" maxlength="1500">'+v('description')+'</textarea></label>'+
 '<label>وجهة المبادرة<select name="route"><option value="">صفحة المبادرات</option>'+
 initRoutes.map(([key,label])=>'<option value="'+key+'"'+(edit?.route===key?' selected':'')+'>'+label+'</option>').join('')+'</select></label>'+
 '<label>الرمز<select name="icon">'+['mixer','coordinates','teaching','mentor','life','sparkles'].map(x=>
 '<option value="'+x+'"'+((edit?.icon||'sparkles')===x?' selected':'')+'>'+
 ({mixer:'خلاط',coordinates:'إحداثيات',teaching:'وسائل',mentor:'معلم صغير',life:'الرياضيات والحياة',sparkles:'ابتكار'})[x]+'</option>').join('')+'</select></label>'+
 '<label>اللون<select name="accent">'+['blue','teal','gold','violet','coral'].map(x=>
 '<option value="'+x+'"'+((edit?.accent||'blue')===x?' selected':'')+'>'+
 ({blue:'أزرق',teal:'فيروزي',gold:'ذهبي',violet:'بنفسجي',coral:'مرجاني'})[x]+'</option>').join('')+'</select></label>'+
 '<label>الترتيب<input name="sort_order" type="number" min="0" max="999" value="'+initEsc(edit?.sort_order??data.length+1)+'"></label>'+
 '<label class="wide">رابط مستند أو فيديو (اختياري)<input name="resource_url" type="url" value="'+v('resource_url')+'" placeholder="https://..."></label>'+
 '<label class="wide"><input type="checkbox" name="published" '+(edit?.published!==false?'checked':'')+'> تظهر للطلاب والزوار</label>'+
 '<div class="wide"><button type="submit" class="primary">'+(edit?'حفظ تعديلات المبادرة':'＋ إضافة مبادرة')+'</button>'+
 (edit?'<button type="button" data-init-reset>إلغاء</button>':'')+'</div></form>':'')+
 '<div class="v10-init-admin-list">'+data.map(row=>'<article><div><strong>'+initEsc(row.title)+'</strong>'+
 '<p>'+initEsc(row.subtitle||'')+'</p><small>'+(row.published?'منشورة':'مخفية')+'</small></div>'+
 (initAdmin()?'<div><button type="button" data-init-edit="'+initEsc(row.id)+'">تعديل</button>'+
 '<button type="button" data-init-delete="'+initEsc(row.id)+'">حذف</button></div>':'')+'</article>').join('')+'</div>'+
 '<p role="status">'+initEsc(initV10.error)+'</p></div>';
}
const initBaseStaff=staffPanel;
staffPanel=function(){
 if(auth.section==='ae_initiatives'&&initStaff())return initAdminPage();
 const original=initBaseStaff();
 if(auth.section==='overview'&&initAdmin())
 return original+'<div class="container v10-init-admin-shortcut">'+
  '<button type="button" data-tab="ae_initiatives">✨ إدارة مبادرات الأستاذ سعيد البريكي</button></div>';
 return original;
};
const initPoint={x:1,y:2,dx:3,dy:2};
function initCoordGraph(){
 const s=initPoint,clamp=n=>Math.max(-6,Math.min(6,n)),px=n=>240+clamp(n)*27,py=n=>226-clamp(n)*27;
 const lines=Array.from({length:13},(_,i)=>{
 const p=64+i*27;return '<path d="M64 '+p+'H416 M'+p+' 64V388"/>';
 }).join('');
 return '<svg viewBox="0 0 490 445" class="v10-coord-chart" role="img" aria-label="رسم إحداثي لنقطة قبل وبعد الانسحاب">'+
 '<rect x="35" y="20" width="423" height="409" rx="24" fill="#edf8ff"/>'+
 '<g stroke="#c5deed" stroke-width="1">'+lines+'</g>'+
 '<path d="M64 226H416 M240 388V64" fill="none" stroke="#315e9c" stroke-width="3"/>'+
 '<path d="M'+px(s.x)+' '+py(s.y)+'L'+px(s.x+s.dx)+' '+py(s.y+s.dy)+'" stroke="#e0a344" stroke-width="5" stroke-dasharray="9 5"/>'+
 '<circle cx="'+px(s.x)+'" cy="'+py(s.y)+'" r="9" fill="#1ba4b0" stroke="#fff" stroke-width="3"/>'+
 '<circle cx="'+px(s.x+s.dx)+'" cy="'+py(s.y+s.dy)+'" r="10" fill="#e2a344" stroke="#fff" stroke-width="3"/>'+
 '<g font-size="17" fill="#274e78" font-weight="bold"><text x="417" y="244">س</text><text x="222" y="56">ص</text>'+
 '<text x="'+(px(s.x)+11)+'" y="'+(py(s.y)-12)+'">A</text>'+
 '<text x="'+(px(s.x+s.dx)+10)+'" y="'+(py(s.y+s.dy)-12)+'">A′</text></g></svg>';
}
function initCoordPage(){
 const s=initPoint,fmt=n=>new Intl.NumberFormat('ar-OM').format(n);
 return '<div class="container v10-coord-page" dir="rtl">'+
 '<header><span>مبادرات الأستاذ سعيد البريكي</span><h1>«ي / أ» — تعلّم الانسحاب بالإحداثيات</h1>'+
 '<p><b>ي</b> تعني يمينًا ويسارًا على محور س، و<b>أ</b> تعني أعلى وأسفل على محور ص.</p></header>'+
 '<div class="v10-coord-lab"><div class="v10-coord-inputs">'+
 [['x','الإحداثي السيني س'],['y','الإحداثي الصادي ص'],['dx','ي: يمين (+) أو يسار (−)'],['dy','أ: أعلى (+) أو أسفل (−)']].map(([key,label])=>
 '<label>'+label+'<input type="number" step="1" min="-6" max="6" data-init-coordinate="'+key+'" value="'+initEsc(s[key])+'"></label>').join('')+
 '<div id="initCoordinateResult"><b>من:</b> ('+fmt(s.x)+' ، '+fmt(s.y)+') <b>إلى:</b> ('+
 fmt(s.x+s.dx)+' ، '+fmt(s.y+s.dy)+')</div>'+
 '<p>هذه طريقة لفظية لتذكّر اتجاه الانسحاب، ولا تستبدل رمزي (س، ص) في كتابة الإحداثيات الرياضية.</p></div>'+
 '<div id="initCoordinatePlot">'+initCoordGraph()+'</div></div>'+
 '<article class="v10-coord-explain"><h2>كيف نستخدم المبادرة؟</h2><p>نقرأ إحداثيي نقطة البداية. التغير الأفقي (ي) موجب نحو اليمين وسالب نحو اليسار، والتغير الرأسي (أ) موجب لأعلى وسالب لأسفل. تُضاف القيمتان إلى (س، ص) للحصول على صورة النقطة بعد الانسحاب.</p>'+
 '<p>مثال: من (١، ٢) وبانسحاب ٣ وحدات يمينًا و٢ وحدتين أعلى، تصبح الصورة (٤، ٤). غيّر المدخلات لترى الحركة على المستوى.</p></article></div>';
}
const initBaseGeneric=genericSection;
genericSection=function(page){
 if(page==='teaching_initiatives')return initPage();
 if(page==='coordinate_ya')return initCoordPage();
 return initBaseGeneric(page);
};
const initBaseAttach=attach;
attach=function(){
 initBaseAttach();
 document.querySelectorAll('[data-init-coordinate]').forEach(el=>el.addEventListener('input',()=>{
  const v=Number(el.value);
  if(!Number.isFinite(v))return;
  initPoint[el.dataset.initCoordinate]=Math.max(-6,Math.min(6,v));
  const graph=document.getElementById('initCoordinatePlot');if(graph)graph.innerHTML=initCoordGraph();
  const label=document.getElementById('initCoordinateResult');
  if(label)label.textContent='من: ('+initPoint.x+' ، '+initPoint.y+') إلى: ('+
   (initPoint.x+initPoint.dx)+' ، '+(initPoint.y+initPoint.dy)+')';
 }));
 document.querySelectorAll('[data-init-edit]').forEach(el=>el.addEventListener('click',()=>{
  initV10.edit=el.dataset.initEdit;render();
 }));
 document.querySelector('[data-init-reset]')?.addEventListener('click',()=>{initV10.edit='';render()});
 document.querySelectorAll('[data-init-delete]').forEach(el=>el.addEventListener('click',async()=>{
  if(!initAdmin()||!window.confirm('حذف المبادرة من المنصة؟'))return;
  try{await aeApi('initiative_delete',{id:el.dataset.initDelete},true);initV10.staffLoaded=false;
   initV10.publicLoaded=false;initV10.edit='';initV10.error='تم الحذف.';
   await Promise.all([initFetchStaff(),initFetchPublic()]);
  }catch(e){initV10.error=e.message;render()}
 }));
 document.getElementById('initV10Form')?.addEventListener('submit',async event=>{
  event.preventDefault();if(!initAdmin())return;
  const form=event.currentTarget,data=Object.fromEntries(new FormData(form).entries());
  data.sort_order=Number(data.sort_order)||0;data.published=form.querySelector('[name=published]').checked;
  try{await aeApi('initiative_save',data,true);initV10.edit='';
   initV10.error='تم حفظ المبادرة بنجاح.';initV10.publicLoaded=false;initV10.staffLoaded=false;
   await Promise.all([initFetchStaff(),initFetchPublic()]);
  }catch(e){initV10.error=e.message;render()}
 });
};
