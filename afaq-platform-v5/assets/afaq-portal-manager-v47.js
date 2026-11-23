/* AFAQ MATH — supervisor-only management action beside every portal, public directory item,
   and major homepage section. Dedicated editors remain authoritative for their content. */
(function(){
'use strict';
if(typeof render!=='function'||typeof attach!=='function'||typeof route!=='function')return;
const API='https://xcwuwflggiwkehzquugz.supabase.co/functions/v1/afaq-portal-controls';
const CENTER='afaq_portals_control_center';
const registry=new Map(), portals=new Map();
let fetched=false,fetching=null,activeKey='',modal=null,loading=false;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const supervisor=()=>auth.user?.role==='supervisor'&&!!auth.token;
const hash=t=>{let h=2166136261;for(const c of String(t)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(36)};
const keySafe=k=>/^[a-z][a-z0-9_-]{1,79}$/.test(k);
const managerEntries=[
 [/honor|شرف|المكرم|التميّز|تكريم/i,'honor_board','إدارة لوحة الشرف'],
 [/initiative|scientific|community|youtube|mixer|multiples|prime|division|mental|coordinate|مبادرات|المبادرة|الخلاط|الغربال/i,'teacher_initiatives_admin','إدارة المبادرات'],
 [/promo|announcement|advert|photo|إعلان|الإعلانات/i,'home_promos','إدارة الإعلانات والصور والروابط'],
 [/platform_title|national_top|العنوان الذهبي|عنوان المنصة/i,'platform_title','إدارة عنوان المنصة'],
 [/parent|ولي الأمر|أولياء الأمور|الأسر/i,'hub_parent_codes','إدارة حسابات أولياء الأمور'],
 [/quiz|contests|competition|games|fun|stars|تحدي|مسابقة|مسابقات|ألعاب|اللعب/i,'hub_catalog_contests','إدارة الألعاب والمسابقات'],
 [/scholar|تاريخ|العلماء/i,'hub_catalog_scholars','إدارة علماء الرياضيات'],
 [/contact|support|feedback|complaint|suggest|ملاحظات|الرسائل|الدعم|الشكاوى/i,'hub_inbox','إدارة الرسائل والدعم'],
 [/director|school|management|الإدارة المدرسية|التواصل المؤسسي/i,'staff_contacts','إدارة التواصل المؤسسي'],
 [/gradebook|class_results|assessment|records|نتائج|درجات|تقويم الطلبة/i,'students','إدارة تقويم الطلاب'],
 [/grade|learning|lesson|books|audio|library|work|question|adaptive|tutorial|horizons|importance|environment|scientific_news|content|المكتبة|التعلم|الدروس/i,'hub_catalog','إدارة المحتوى والمواد']
];
function managerFor(key,label){
 const fixed={
  login_student:['students','إدارة بيانات الطلبة وحساباتهم'],
  login_demo:['hub_catalog','إدارة المواد التدريبية'],
  login_supervisor:['overview','لوحة المشرف الرئيسي'],
  login_supervisor_assistant:['overview','لوحة الإشراف'],
  login_director:['staff_contacts','إدارة التواصل المؤسسي'],
  route_afaq_directory:['hub_catalog','إدارة المحتوى المرتبط بالدليل'],
  section_about:['home_promos','إدارة عناوين وتعريفات الصفحة'],
  section_entry:['hub_parent_codes','إدارة حسابات الدخول والأسرة'],
  section_honor_board:['honor_board','إدارة لوحة الشرف'],
  section_title:['platform_title','إدارة عنوان المنصة الذهبي'],
  gate_student_club:['afaq_student_club','إدارة جماعة آفاق ماث الطلابية']
 };
 if(fixed[key])return {tab:fixed[key][0],title:fixed[key][1]};
 for(const [re,tab,title] of managerEntries)if(re.test(key+' '+label))return {tab,title};
 return {tab:'',title:'تعديل بطاقة البوابة وعرضها'};
}
async function api(action,payload={},withToken=false){
 const bearer=withToken&&supervisor()?auth.token:'';
 const r=await fetch(API,{method:'POST',headers:{
  'Content-Type':'application/json',...(bearer?{Authorization:'Bearer '+bearer}:{})
 },body:JSON.stringify({action,...payload}),cache:'no-store'});
 let data;try{data=await r.json()}catch{throw Error('تعذّر قراءة استجابة إدارة البوابات')}
 if(!r.ok||!data?.ok)throw Error(data?.error==='supervisor_only'?'هذه العملية للمشرف الرئيسي فقط':
  data?.error==='too_long'?'تجاوز العنوان أو الوصف الحد المسموح':data?.error||'تعذّر حفظ بيانات البوابة');
 return data;
}
async function loadRegistry(force=false){
 if(fetching)return fetching;
 if(fetched&&!force)return;
 fetching=(async()=>{
  try{
   const data=await api('list');
   registry.clear();
   for(const row of data.portals||[])if(keySafe(row.portal_key))registry.set(row.portal_key,row);
   fetched=true;
   if(state.page===CENTER)render();
   else decorate();
  }catch(e){console.warn('Portal options unavailable:',e.message)}
  finally{fetching=null}
 })();
 return fetching;
}
function remember(key,title,desc){
 if(!keySafe(key))return;
 if(!portals.has(key))portals.set(key,{key,title:String(title||key).trim(),description:String(desc||'').trim()});
 const item=portals.get(key);
 if(!item.title&&title)item.title=String(title).trim();
}
function keyFor(el){
 if(el.hasAttribute('data-afaq-club-open'))return 'gate_student_club';
 const login=el.dataset.hubLogin;
 if(login)return 'login_'+login.toLowerCase().replace(/[^a-z0-9_-]/g,'');
 const r=el.dataset.route;
 if(r)return 'route_'+r.toLowerCase().replace(/[^a-z0-9_-]/g,'');
 if(el.dataset.directoryAction&&el.dataset.directoryTarget){
  const type=el.dataset.directoryAction,target=el.dataset.directoryTarget;
  return (type+'_'+target).toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,79);
 }
 if(el.matches('a[href]')){
  return 'external_'+hash(el.getAttribute('href'));
 }
 return null;
}
function titleNode(card){
 if(card.classList.contains('afaq-footer-topic'))return card.querySelector('.afaq-footer-topic-text strong');
 if(card.classList.contains('afaq-mid-initiative-link'))return card.querySelector('.afaq-mid-initiative-copy strong');
 return card.querySelector(':scope > strong')||
  card.querySelector('.afaq-directory-link-text strong')||
  card.querySelector('.afaq-about-card-body h3')||
  card.querySelector('h2,h3,strong');
}
function descriptionNode(card){
 if(card.classList.contains('afaq-footer-topic'))return card.querySelector('.afaq-footer-topic-text small');
 if(card.classList.contains('afaq-mid-initiative-link'))return card.querySelector('.afaq-mid-initiative-copy small');
 if(card.classList.contains('afaq-directory-link'))
  return card.querySelector('.afaq-directory-link-text small');
 if(card.classList.contains('hub-gate'))
  return card.querySelector(':scope > span:last-of-type:not(.hub-gate-arrow)');
 return card.querySelector('.afaq-directory-link-text small')||
  card.querySelector('.afaq-about-card-body p')||
  card.querySelector('p');
}
function originalText(node){
 if(!node)return '';
 const locked=node.querySelector('.afaq-directory-locked');
 return String(node.textContent||'').replace(locked?.textContent||'', '').trim();
}
function markText(node,what){
 if(!node)return;
 const attr=what==='title'?'afaqPortalOriginalTitle':'afaqPortalOriginalDescription';
 if(node.dataset[attr]===undefined)node.dataset[attr]=originalText(node);
 node.setAttribute('data-afaq-portal-'+what,'');
}
function textOverride(node,value){
 if(!node)return;
 const attr=node.hasAttribute('data-afaq-portal-title')?'afaqPortalOriginalTitle':'afaqPortalOriginalDescription';
 const t=String(value||node.dataset[attr]||'');
 // Leave the original DOM untouched unless the supervisor actually saved an override.
 // This preserves bilingual titles, icons, locked badges and styled descriptive text.
 if(!value&&originalText(node)===t)return;
 const lock=node.querySelector('.afaq-directory-locked');
 if(lock){
  const copy=lock.cloneNode(true);node.textContent=t;node.append(copy);return;
 }
 // Preserve small bilingual/illustrated accents in existing headings.
 const first=node.firstChild;
 if(node.querySelector('[lang="en"]')&&first?.nodeType===3){
  first.textContent=t+' ';return;
 }
 if(node.textContent!==t)node.textContent=t;
}
function currentPortalKey(node){
 return node.dataset.afaqPortalKey||'';
}
function markPortal(el,key,title,desc,tNode,dNode){
 if(!keySafe(key))return;
 el.dataset.afaqPortalKey=key;
 remember(key,title,desc);
 markText(tNode,'title');markText(dNode,'description');
 if(tNode)tNode.dataset.afaqPortalPartKey=key;
 if(dNode)dNode.dataset.afaqPortalPartKey=key;
 const row=registry.get(key);
 if(tNode)textOverride(tNode,row?.title_override||'');
 if(dNode)textOverride(dNode,row?.description_override||'');
 const directoryLink=el.matches?.('.afaq-directory-link')?el:el.querySelector?.('.afaq-directory-link');
 if(directoryLink){
  if(directoryLink.dataset.afaqDefaultDirSearch===undefined)
   directoryLink.dataset.afaqDefaultDirSearch=directoryLink.dataset.dirSearch||'';
  directoryLink.dataset.dirSearch=[
   directoryLink.dataset.afaqDefaultDirSearch,row?.title_override||'',row?.description_override||''
  ].join(' ').trim();
 }
 el.classList.toggle('afaq-portal-hidden',row?.is_visible===false&&!supervisor());
 el.classList.toggle('afaq-portal-hidden-preview',row?.is_visible===false&&supervisor());
 const note=el.querySelector('.afaq-portal-private-indicator');
 if(note)note.hidden=row?.is_visible!==false;
}
function manageButton(key,title,compact=false){
 const b=document.createElement('button');b.type='button';
 b.className='afaq-portal-manage-button'+(compact?' is-compact':'');
 b.dataset.afaqManageKey=key;
 b.textContent=compact?'⚙️ إدارة':'⚙️ إدارة البوابة';
 b.setAttribute('aria-label','إدارة بوابة '+title);
 return b;
}
function insertCard(card){
 if(card.dataset.afaqCardReady)return;
 const key=keyFor(card);
 if(!keySafe(key))return;
 const titleEl=titleNode(card),descEl=descriptionNode(card);
 const name=originalText(titleEl)||card.getAttribute('aria-label')||key;
 const detail=originalText(descEl);
 card.dataset.afaqCardReady='1';
 if(supervisor()){
  const wrap=document.createElement('div');
  wrap.className='afaq-portal-gate-wrap';
  card.parentNode.insertBefore(wrap,card);
  wrap.append(card);
  const flag=document.createElement('small');flag.className='afaq-portal-private-indicator';
  flag.textContent='مخفية عن الزوار';flag.hidden=true;
  const actions=document.createElement('div');actions.className='afaq-portal-gate-actions';
  actions.append(manageButton(key,name,true),flag);
  wrap.append(actions);
  markPortal(wrap,key,name,detail,titleEl,descEl);
 }else{
  markPortal(card,key,name,detail,titleEl,descEl);
 }
}
function insertAboutCard(card){
 if(card.dataset.afaqCardReady)return;
 const btn=card.querySelector('[data-route]');if(!btn)return;
 const key=keyFor(btn);if(!keySafe(key))return;
 const title=card.querySelector('.afaq-about-card-body h3');
 const desc=card.querySelector('.afaq-about-card-body p');
 card.dataset.afaqCardReady='1';
 markPortal(card,key,originalText(title),originalText(desc),title,desc);
 if(supervisor()){
  const b=manageButton(key,originalText(title),true);
  b.classList.add('afaq-portal-about-manage');
  card.append(b);
 }
}
const sectionDefs=[
 ['.afaq-final-introduction','section_about','التعريف بمنصة آفاق ماث','','.afaq-final-intro-copy h2','.afaq-about-lead'],
 ['.afaq-promo-area','section_promos','الإعلانات والروابط','','h2,h3','.afaq-promo-intro'],
 ['.afaq-home-access','section_entry','بوابات الدخول','','.hub-heading h2','.hub-heading p'],
 ['.afaq-home-sections','section_knowledge','أبواب المعرفة','','.hub-heading h2','.hub-heading p'],
 ['.afaq-initiatives-main-heading','section_initiatives','مبادرات الأستاذ سعيد','','h2','p'],
 ['#afaq-scientific','section_scientific','المبادرات العلمية','','header h3','header p'],
 ['#afaq-community','section_community','المبادرات المجتمعية','','header h3','header p'],
 ['#afaq-youtube','section_youtube','قناة يوتيوب','','header h3','header p'],
 ['#afaq-other-initiatives','section_other_initiatives','مبادرات أخرى','','header h3','header p'],
 ['.afaq-final-news-block','section_news','أخبار المنصة','','h2,h3','p'],
 ['.afaq-matches-today','section_matches','مباريات اليوم','','h2,h3','p'],
 ['.afaq-honor-board','section_honor_board','لوحة الشرف','','.honor-header h2','header p']
];
function insertSection(area,key,fallback,ts,ds){
 if(area.dataset.afaqSectionReady)return;
 area.dataset.afaqSectionReady='1';
 const titleEl=ts?area.querySelector(ts):area.querySelector('h2,h3');
 const descEl=ds?area.querySelector(ds):area.querySelector('p');
 const title=originalText(titleEl)||fallback,desc=originalText(descEl);
 markPortal(area,key,title,desc,titleEl,descEl);
 if(!supervisor())return;
 // Existing honor board already has the exact native "إدارة لوحة الشرف" action.
 if(area.querySelector('[data-honor-admin]'))return;
 const header=area.querySelector(':scope > header')||
  area.querySelector('.afaq-initiative-heading,.afaq-initiative-subtitle,.hub-heading,.afaq-final-intro-copy')||area;
 const bar=document.createElement('div');bar.className='afaq-portal-section-tools';
 bar.append(manageButton(key,title,false));
 const note=document.createElement('small');note.className='afaq-portal-private-indicator';
 note.textContent='مخفية عن الزوار';note.hidden=true;bar.append(note);
 header.append(bar);
 markPortal(area,key,title,desc,titleEl,descEl);
}
function insertPageBar(app){
 if(['home','dashboard',CENTER,'initiative_permissions'].includes(state.page))return;
 if(app.querySelector(':scope > .afaq-portal-page-bar'))return;
 // Same registry entry powers both the portal card and its opened content page.
 const key='route_'+String(state.page||'page').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,72);
 const header=app.querySelector('.container > header,.ae-section-hero,.hub-section-hero,.ami-page-head,.afaq-directory-hero');
 const heading=header?.querySelector('h1,h2')||app.querySelector('h1,h2');
 const description=header?.querySelector('p')||null;
 const name=originalText(heading)||'بوابة '+state.page;
 const summary=originalText(description);
 remember(key,name,summary);
 const saved=registry.get(key);
 if(heading){markText(heading,'title');heading.dataset.afaqPortalPartKey=key;textOverride(heading,saved?.title_override||'')}
 if(description){markText(description,'description');description.dataset.afaqPortalPartKey=key;textOverride(description,saved?.description_override||'')}
 app.dataset.afaqPortalPageKey=key;
 // Direct-route content remains protected by its own permissions.
 // Portal-card visibility is only a navigation/display preference.
 if(!supervisor())return;
 const bar=document.createElement('div');bar.className='afaq-portal-page-bar';
 bar.innerHTML='<strong>⚙️ إدارة هذه البوابة</strong><span>التحكم بعنوانها ووصفها وظهور بطاقة الدخول</span>';
 bar.append(manageButton(key,name,false));
 app.prepend(bar);
}
function appendSupervisorShortcut(app){
 if(!supervisor())return;
 const nav=app.querySelector('.hub-staff-nav');
 if(nav&&!nav.querySelector('[data-afaq-portals-center]')){
  const b=document.createElement('button');b.type='button';b.dataset.afaqPortalsCenter='1';
  b.className='afaq-portal-center-nav';b.textContent='⚙️ إدارة جميع البوابات';
  nav.append(b);
 }
}
function decorate(){
 const app=document.getElementById('app');if(!app)return;
 if(!supervisor())document.querySelector('.afaq-portal-modal-backdrop')?.remove();
 if(state.page===CENTER){appendSupervisorShortcut(app);return}
 if(state.page==='home'){
  for(const [sel,key,defaultName,,title,description] of sectionDefs){
   const target=app.querySelector('.hub-home '+sel);
   if(target)insertSection(target,key,defaultName,title,description);
  }
 }
 if(state.page==='home'||state.page==='afaq_directory'){
  // All gate buttons are wrapped with a separate management button; never nest buttons.
  app.querySelectorAll('.hub-home .hub-gate-grid > .hub-gate, .hub-home .afaq-footer-topic[data-route], .hub-home .afaq-mid-initiative-link[data-route], .afaq-directory-page .afaq-directory-links > .afaq-directory-link')
   .forEach(insertCard);
  if(state.page==='home')app.querySelectorAll('.afaq-about-rich-card').forEach(insertAboutCard);
  if(state.page==='afaq_directory')
   app.querySelectorAll('.afaq-directory-group').forEach(group=>{
    const id=group.dataset.directoryGroup;
    if(!id)return;
    insertSection(group,'section_directory_'+id,'مجموعة '+id,'header h2','header p');
   });
 }
 if(state.page==='dashboard')appendSupervisorShortcut(app);
 else insertPageBar(app);
 if(state.page==='learning'||state.page==='home'){
  app.querySelectorAll('.ae-tool-preview').forEach(card=>{
   if(card.dataset.afaqCardReady)return;
   const target=card.querySelector('[data-route]');
   const key=target&&keyFor(target);if(!keySafe(key))return;
   card.dataset.afaqCardReady='1';
   const title=card.querySelector('h2,h3'),desc=card.querySelector('p');
   markPortal(card,key,originalText(title),originalText(desc),title,desc);
   if(supervisor())card.append(manageButton(key,originalText(title),true));
  });
 }
 reapplyExisting();
}

/* Apply server-saved appearance settings to already-rendered portal cards. */
function reapplyExisting(){
 const app=document.getElementById('app');
 if(!app)return;
 app.querySelectorAll('[data-afaq-portal-key]').forEach(el=>{
  const key=el.dataset.afaqPortalKey;
  if(!keySafe(key))return;
  const title=el.querySelector('[data-afaq-portal-title][data-afaq-portal-part-key="'+key+'"]');
  const desc=el.querySelector('[data-afaq-portal-description][data-afaq-portal-part-key="'+key+'"]');
  const item=portals.get(key)||{};
  markPortal(el,key,item.title||key,item.description||'',title,desc);
 });
 const key=app.dataset.afaqPortalPageKey;
 if(keySafe(key)){
  const row=registry.get(key);
  const title=app.querySelector('[data-afaq-portal-title][data-afaq-portal-part-key="'+key+'"]');
  const desc=app.querySelector('[data-afaq-portal-description][data-afaq-portal-part-key="'+key+'"]');
  if(title)textOverride(title,row?.title_override||'');
  if(desc)textOverride(desc,row?.description_override||'');
 }
}

function makeToast(msg){
 const el=document.createElement('div');el.className='afaq-portal-toast';el.role='status';el.textContent=msg;
 document.body.append(el);window.setTimeout(()=>el.remove(),4200);
}
function closeDialog(){
 modal?.remove();modal=null;activeKey='';
}
function editDialog(key){
 if(!supervisor())return;
 if(key==='section_title'){openTab('platform_title');return}
 activeKey=key;
 const info=portals.get(key)||{key,title:key,description:''};
 const row=registry.get(key)||{title_override:'',description_override:'',is_visible:true};
 const m=managerFor(key,info.title);
 closeDialog();activeKey=key;
 modal=document.createElement('div');modal.className='afaq-portal-modal-backdrop';
 modal.innerHTML='<section class="afaq-portal-dialog" dir="rtl" role="dialog" aria-modal="true" aria-label="إدارة البوابة">'+
 '<header><span>⚙️ إدارة البوابة</span><h2>'+esc(info.title)+'</h2>'+
 '<button type="button" class="afaq-portal-close" data-afaq-close aria-label="إغلاق">×</button></header>'+
 '<form id="afaqPortalEditForm">'+
 '<p>يمكنك تعديل اسم بطاقة البوابة ووصفها وإظهارها أو إخفاءها عن الواجهة العامة، دون المساس بالنتائج أو سجلات الطلاب.</p>'+
 '<label>اسم البوابة البديل<input name="title_override" maxlength="120" value="'+esc(row.title_override||'')+'" placeholder="'+esc(info.title)+'"></label>'+
 '<label>الوصف التعريفي البديل<textarea name="description_override" maxlength="400" rows="3" placeholder="'+esc(info.description||'الوصف الأصلي للبوابة')+'">'+esc(row.description_override||'')+'</textarea></label>'+
 '<label class="afaq-portal-visible"><input type="checkbox" name="is_visible"'+(row.is_visible!==false?' checked':'')+'>'+
 '<strong>إظهار بطاقة البوابة للزوار والفئات المسموح لها</strong></label>'+
 '<small class="afaq-portal-help">إخفاء البطاقة يزيلها من واجهة التصفح؛ لا يلغي روابط الوصول المباشر أو صلاحيات الدخول المحمية، التي تُدار من أدواتها المتخصصة.</small>'+
 '<div class="afaq-portal-form-actions"><button type="submit">💾 حفظ تغييرات البوابة</button>'+
 '<button type="button" data-afaq-reset>↺ استعادة الإعدادات الأصلية</button></div>'+
 '<p class="afaq-portal-form-status" aria-live="polite"></p></form>'+
 '<div class="afaq-portal-special"><strong>الإدارة المتخصصة</strong><p>'+
 (m.tab?'انتقل إلى لوحة الإدارة الأصلية لتعديل المحتوى الداخلي والملفات والأذونات الخاصة بهذه البوابة.':'يمكن تعديل بيانات هذه البوابة هنا. ولإدارة المحتوى المدرسي العام استخدم لوحة إدارة المحتوى.')+
 '</p><button type="button" data-afaq-manager-tab="'+(m.tab||'hub_catalog')+'">'+
 esc(m.tab?'🗂️ '+m.title:'🗂️ فتح إدارة المحتوى العام')+'</button></div></section>';
 modal.addEventListener('click',ev=>{if(ev.target===modal)closeDialog()});
 document.body.append(modal);
 modal.querySelector('.afaq-portal-close')?.focus();
}
async function openDialog(key){
 if(!supervisor())return;
 if(!keySafe(key))return;
 await loadRegistry();
 editDialog(key);
}
async function savePortal(form){
 if(!supervisor()||loading||!activeKey)return;
 loading=true;
 const el=modal?.querySelector('.afaq-portal-form-status');
 if(el)el.textContent='جارٍ حفظ إعدادات البوابة...';
 const fd=new FormData(form);
 try{
  const resp=await api('save',{portal_key:activeKey,title_override:String(fd.get('title_override')||''),
   description_override:String(fd.get('description_override')||''),
   is_visible:fd.has('is_visible')},true);
  registry.set(activeKey,resp.portal);
  const page=state.page;
  closeDialog();render();
  makeToast('✓ تم حفظ إعدادات البوابة وتطبيقها على العرض.');
 }catch(err){if(el)el.textContent='تعذّر الحفظ: '+err.message}
 finally{loading=false}
}
async function resetPortal(){
 if(!supervisor()||!activeKey||loading)return;
 if(!window.confirm('هل تريد استعادة العنوان والوصف وحالة الظهور الأصلية لهذه البوابة؟'))return;
 loading=true;
 try{
  await api('reset',{portal_key:activeKey},true);
  registry.delete(activeKey);closeDialog();render();makeToast('تمت استعادة الإعدادات الأصلية للبوابة.');
 }catch(err){const el=modal?.querySelector('.afaq-portal-form-status');if(el)el.textContent=err.message}
 finally{loading=false}
}
function openTab(tab){
 if(!supervisor())return;
 closeDialog();
 if(typeof auth!=='undefined')auth.section=tab;
 route('dashboard');
 if(typeof hubLoadForTab==='function')hubLoadForTab(tab);
}
const CENTER_DATA=[
 ['هوية المنصة','section_about','home_promos'],['عنوان المنصة الذهبي','section_title','platform_title'],
 ['إعلانات الصفحة الرئيسية','section_promos','home_promos'],['لوحة الشرف','section_honor_board','honor_board'],
 ['بوابات الدخول','section_entry','hub_parent_codes'],['أبواب المعرفة','section_knowledge','hub_catalog'],
 ['الدروس والتعليم','route_learning','hub_catalog'],['المكتبة العامة','route_library','hub_catalog'],
 ['الصفوف والدرجات','route_grade','students'],['الواجبات وأوراق العمل','route_work','hub_catalog'],
 ['الاختبارات وبنك الأسئلة','route_question_bank','hub_catalog'],['مكتبة الاستماع','route_audio','hub_catalog'],
 ['الألعاب والمسابقات','route_contests','hub_catalog_contests'],['مسابقة نجوم آفاق','route_competition','hub_catalog_contests'],
 ['المبادرات العلمية','section_scientific','teacher_initiatives_admin'],['المبادرات المجتمعية','section_community','teacher_initiatives_admin'],
 ['قناة يوتيوب','section_youtube','teacher_initiatives_admin'],['المبادرات الصحية والبيئية','section_other_initiatives','teacher_initiatives_admin'],
 ['خلاط الرياضيات','route_mixer','teacher_initiatives_admin'],['الأنشطة العلاجية والإثرائية','route_adaptive','hub_catalog'],
 ['أولياء الأمور','route_parent','hub_parent_codes'],['إدارة المدرسة','login_director','staff_contacts'],
 ['التواصل والدعم','route_support','hub_inbox'],['الأخبار والتحديثات','section_news','home_promos'],
 ['بوابة دليل المنصة','route_afaq_directory','hub_catalog'],['صفحة مباريات اليوم','route_matches_today','home_promos'],
 ['طلاب الصف السادس','login_student','students'],['طلاب الصفوف الأخرى','login_demo','hub_catalog'],
 ['بوابة دخول المشرفين','login_supervisor','overview'],['جماعة آفاق ماث الطلابية','gate_student_club','afaq_student_club'],
 ['التصفح كزائر','route_visitor','hub_catalog']
];
function centerMarkup(){
 const grouped=[
 ['الهوية والصفحة الرئيسية',CENTER_DATA.slice(0,6)],
 ['التعلّم والمصادر والتقويم',CENTER_DATA.slice(6,12)],
 ['المسابقات والمبادرات',CENTER_DATA.slice(12,20)],
 ['حسابات المنصة والتواصل',CENTER_DATA.slice(20)]
 ];
 return '<div class="container afaq-portals-center" dir="rtl"><header class="afaq-portals-center-head">'+
 '<span>🛠️ أدوات المشرف الرئيسي</span><h1>إدارة بوابات منصة آفاق ماث</h1>'+
 '<p>لكل بوابة زر إدارة مستقل: يمكنك تعديل عنوان البطاقة ووصفها وحالة عرضها، ثم الانتقال إلى لوحة إدارة محتواها المتخصصة.</p>'+
 '<button type="button" data-afaq-center-back>↩ لوحة المشرف الرئيسية</button></header>'+
 grouped.map(([heading,items])=>'<section class="afaq-portals-center-group"><h2>'+esc(heading)+'</h2><div class="afaq-portals-center-cards">'+
 items.map(([name,key,tab])=>{
  remember(key,name,'');
  const override=registry.get(key);
  return '<article'+(override?.is_visible===false?' class="is-hidden"':'')+'>'+
   '<strong>'+esc(override?.title_override||name)+'</strong>'+
   '<small>'+(override?.is_visible===false?'🚫 مخفية عن الزوار':'✓ بطاقة قابلة للإدارة')+'</small>'+
   '<div><button type="button" data-afaq-manage-key="'+esc(key)+'">⚙️ إدارة البوابة</button>'+
   '<button type="button" data-afaq-manager-tab="'+esc(tab)+'">تعديل المحتوى</button></div></article>';
 }).join('')+'</div></section>').join('')+
 '<footer>تُطبق صلاحيات المشرف على الخادم. الإخفاء هنا يخص عرض البطاقة، ولا يغيّر بيانات الطلاب أو صلاحيات المسابقات.</footer></div>';
}
function renderCenter(){
 const app=document.getElementById('app');if(!app)return;
 if(!supervisor()){
  app.innerHTML='<div class="container afaq-portals-center"><h2>هذه الصفحة للمشرف الرئيسي فقط.</h2><button type="button" data-route="home">العودة للرئيسية</button></div>';
 }else app.innerHTML=centerMarkup();
 if(typeof attach==='function')attach();
}
const previousRender=render;
render=function(...args){
 if(state.page===CENTER){renderCenter();return}
 const result=previousRender.apply(this,args);
 decorate();
 return result;
};
const previousAttach=attach;
attach=function(...args){
 const result=previousAttach.apply(this,args);
 decorate();
 return result;
};
document.addEventListener('click',ev=>{
 const manage=ev.target.closest('[data-afaq-manage-key]');
 if(manage){ev.preventDefault();ev.stopPropagation();openDialog(manage.dataset.afaqManageKey);return}
 if(ev.target.closest('[data-afaq-close]')){ev.preventDefault();closeDialog();return}
 if(ev.target.closest('[data-afaq-reset]')){ev.preventDefault();resetPortal();return}
 const specialized=ev.target.closest('[data-afaq-manager-tab]');
 if(specialized){ev.preventDefault();openTab(specialized.dataset.afaqManagerTab);return}
 if(ev.target.closest('[data-afaq-portals-center]')){ev.preventDefault();route(CENTER);return}
 if(ev.target.closest('[data-afaq-center-back]')){ev.preventDefault();openTab('overview');return}
});
document.addEventListener('submit',ev=>{
 if(ev.target.id==='afaqPortalEditForm'){ev.preventDefault();savePortal(ev.target)}
});
document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&modal)closeDialog()});
loadRegistry();
if(state.page===CENTER)render();else decorate();
})();