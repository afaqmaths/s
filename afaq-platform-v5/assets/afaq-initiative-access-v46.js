/* AFAQMATHS — Extended initiative audience, duration, genuine/manual and automatic approvals. */
(function(){
'use strict';
const POLICY_AUDIENCES=[
 ['visitor','الزوار دون حساب','🌐'],['student','الطلاب','🎒'],
 ['director','الإدارة المدرسية','🏫'],['supervisor_assistant','المشرف المساعد وتقنية المعلومات','👨‍🏫'],
 ['supervisor','المشرف الرئيسي','🛡️'],['parent','أولياء الأمور','👨‍👩‍👧'],
 ['club','أعضاء جماعة آفاق ماث','🏅'],['demo','الحسابات التجريبية','📘']
];
const DEFAULT_AUDIENCES=POLICY_AUDIENCES.map(a=>a[0]);
const PREF_KEY='afaq_pending_initiative_request_v46';
const opts={data:null,delegates:null,loading:false,error:'',notice:'',approverAuthorized:false,
 lastCheckedToken:'',alertCount:0,alertIds:[],alertsInitialized:false,notifyBusy:false};
let pending=null;
try{pending=JSON.parse(sessionStorage.getItem(PREF_KEY)||'null')}catch{}
let pendingBusy=false,pendingTickTimer=null,notificationTimer=null;
const E=x=>iaEscape(x);
const basicBearer=iaBearer;
iaBearer=function(admin=false){
 if(!admin&&typeof hub!=='undefined'&&hub.parentToken&&!auth.token&&!iaState.pass)
  return hub.parentToken;
 return basicBearer(admin);
};
function durationHtml(config){
 let choice='unlimited',days=1;
 if(config?.public_until&&Date.parse(config.public_until)>Date.now()){
  days=Math.max(1,Math.ceil((Date.parse(config.public_until)-Date.now())/86400000));
  choice=[1,2,3,7,30].includes(days)?String(days):'custom';
 }
 return '<label class="ia-control-label">مدة الإتاحة للفئات المختارة'+
  '<select name="duration" id="iaPolicyDuration">'+
  [['1','٢٤ ساعة'],['2','يومان'],['3','ثلاثة أيام'],['7','أسبوع كامل'],['30','شهر (٣٠ يومًا)'],
   ['custom','عدد أيام أحدده'],['unlimited','مدة غير محدودة']].map(([v,t])=>
   '<option value="'+v+'"'+(choice===v?' selected':'')+'>'+t+'</option>').join('')+
  '</select></label>'+
  '<label class="ia-control-label">عدد الأيام عند اختيار مدة مخصصة'+
  '<input name="custom_days" type="number" min="1" max="365" value="'+days+'"></label>';
}
function policyForm(){
 const d=opts.data||{mode:iaState.visibility,allowed_audiences:DEFAULT_AUDIENCES,approval_mode:'manual'};
 const selected=d.allowed_audiences||DEFAULT_AUDIENCES,mode=d.mode||'permission';
 const stat=mode==='hidden'?'المبادرات مخفية عن الزوار':
   mode==='public'?'عرض مباشر للفئات المحددة':mode==='permission'?'الاطلاع بعد إذن أو تفعيل تلقائي':'جارٍ التحقق من الحالة';
 const members=(opts.delegates?.people||[]),current=new Set((opts.delegates?.delegates||[]).filter(x=>x.active).map(x=>x.principal_key));
 return '<section class="ia-visibility-box ia-visibility-in-management ia-policy-v46" dir="rtl">'+
 '<div class="ia-policy-intro"><div><span>⚙️ إدارة المبادرات • التحكم في الظهور</span>'+
 '<h2>الفئات والمدة وصلاحيات منح الإذن</h2>'+
 '<p>تُحفظ الصلاحيات على الخادم، وتُطبّق عند طلب فتح محتوى المبادرات المحمي.</p></div>'+
 '<button type="button" data-route="initiative_permissions">📨 متابعة طلبات الإذن</button></div>'+
 '<p class="ia-policy-current" role="status">الحالة الحالية: <strong>'+E(stat)+'</strong></p>'+
 (opts.error?'<p class="ia-policy-error" role="alert">'+E(opts.error)+'</p>':'')+
 (opts.notice?'<p class="ia-policy-notice" role="status">'+E(opts.notice)+'</p>':'')+
 '<form id="iaPolicyForm" class="ia-policy-form">'+
 '<fieldset><legend>١. الفئات المسموح لها بالاطلاع</legend>'+
 '<div class="ia-audience-options">'+POLICY_AUDIENCES.map(([v,name,icon])=>
  '<label class="ia-audience-option"><input type="checkbox" name="audience" value="'+v+'"'+
  (selected.includes(v)?' checked':'')+'><span aria-hidden="true">'+icon+'</span><strong>'+name+'</strong></label>').join('')+'</div>'+
 '<small>الطالب من أعضاء الجماعة يُعرَف من عضويته النشطة. ولا يكفي اختيار «أعضاء الجماعة» وحده لمنح حق اعتماد الطلبات.</small></fieldset>'+
 '<fieldset><legend>٢. طريقة إظهار المبادرات والمدة</legend>'+
 '<div class="ia-policy-two-col"><label class="ia-control-label">نوع الظهور'+
 '<select name="mode">'+
 [['public','إظهار مباشر للفئات المحددة'],['permission','إظهار بإذن أو تفعيل تلقائي'],['hidden','إخفاء المحتوى المحمي']].
 map(([value,title])=>'<option value="'+value+'"'+(mode===value?' selected':'')+'>'+title+'</option>').join('')+
 '</select></label>'+durationHtml(d)+'</div>'+
 '<small>تبدأ المدة من لحظة حفظ الإعدادات. يُستخدم تحديد الأيام لإتاحة العرض المباشر؛ انتهاء المدة يعيد المحتوى إلى نظام الإذن.</small></fieldset>'+
 '<fieldset><legend>٣. طريقة قبول طلب الدخول عند اختيار «بإذن»</legend>'+
 '<div class="ia-policy-approval-grid">'+
 '<label><input type="radio" name="approval_mode" value="manual"'+(d.approval_mode!=='auto'?' checked':'')+'>'+
 '<strong>🛎️ موافقة حقيقية من شخص مخوّل</strong><small>يظهر للطالب مؤقت انتظار ٥ دقائق، ويُنبَّه المشرفون والمخوّلون داخل المنصة. لا تُمنح الموافقة دون اعتماد فعلي.</small></label>'+
 '<label><input type="radio" name="approval_mode" value="auto"'+(d.approval_mode==='auto'?' checked':'')+'>'+
 '<strong>✅ تفعيل تلقائي خلال دقيقة</strong><small>يعرض للمتقدم عداد انتظار يصل إلى ٥ دقائق، مع توضيح أن التفعيل تلقائي بعد نحو دقيقة؛ محاولتان خلال نصف ساعة، ثم يُوقف قبول الطلبات الجديدة حتى انتهاء المدة.</small></label></div></fieldset>'+
 '<div class="ia-policy-footer"><button type="submit" class="ia-policy-save">💾 حفظ سياسة عرض المبادرات</button>'+
 '<button type="button" data-ia-policy-refresh>↻ تحديث الإعدادات</button></div></form>'+
 '<section class="ia-delegations"><header><h3>٤. تحديد من يحق له منح الموافقات الفعلية</h3>'+
 '<p>المشرف الرئيسي مخوَّل دائمًا؛ ويمكنك منح الصلاحية لأعضاء محددين من جماعة آفاق ماث أو للمشرف المساعد. لا يتم التفويض تلقائيًا.</p></header>'+
 (opts.delegates?'<div class="ia-delegate-grid">'+members.map(x=>'<label class="ia-delegate-item">'+
 '<input type="checkbox" data-ia-delegate="'+E(x.key)+'"'+(current.has(x.key)?' checked':'')+'>'+
 '<span>'+E(x.label)+'</span></label>').join('')+'</div>'+
 '<small class="ia-delegate-note">المخوَّلون: '+members.filter(x=>current.has(x.key)).length+
 ' • يمكنهم اعتماد الطلبات وإصدار رمز؛ ولا يستطيعون تغيير سياسة الظهور العامة.</small>':
 '<p>جارٍ تحميل أعضاء الجماعة والمشرفين المساعدين ...</p>')+
 '</section><div class="ia-policy-alerts" role="status" data-ia-alerts>🔔 تنبيهات طلبات الإذن: '+opts.alertCount+
 (opts.alertCount?' طلبًا بانتظار الموافقة':' — لا توجد طلبات معلقة')+'</div></section>';
}
async function refreshPolicy(){
 if(opts.loading||auth.user?.role!=='supervisor')return;
 opts.loading=true;opts.error='';
 try{
  const [policy,delegates]=await Promise.all([iaFetch('visibility_status',{},true),iaFetch('delegates_list',{},true)]);
  opts.data=policy;opts.delegates=delegates;
  iaState.visibility=policy.mode;iaState.publicUntil=policy.public_until||null;
  iaScheduleVisibilityExpiry();
 }catch(e){opts.error=e.message}
 finally{opts.loading=false;if(state.page==='dashboard'&&auth.section==='teacher_initiatives_admin')render()}
}
iaVisibilityPolicyMarkup=policyForm;
iaVisibilityForInitiativesAdmin=function(){
 if(auth.user?.role!=='supervisor')return '';
 if(!opts.data&&!opts.loading)Promise.resolve().then(refreshPolicy);
 return policyForm();
};
function countdown(iso,seconds){
 const elapsed=Math.max(0,Math.floor((Date.now()-Date.parse(iso||new Date().toISOString()))/1000));
 const remaining=Math.max(0,seconds-elapsed);
 return String(Math.floor(remaining/60)).padStart(2,'0')+':'+String(remaining%60).padStart(2,'0');
}
function pendingMarkup(){
 if(!pending)return '';
 const automatic=pending.approval_mode==='auto';
 return '<section class="ia-pending-panel" aria-label="متابعة طلب إذن المبادرات">'+
 '<span class="ia-pending-eyebrow">'+(automatic?'✅ التفعيل التلقائي مفعّل':'🛎️ موافقة بشرية فعلية')+'</span>'+
 '<h2>'+(automatic?'يُفعَّل إذنك تلقائيًا بعد نحو دقيقة':'طلبك بانتظار موافقة أحد المخوَّلين')+'</h2>'+
 '<p>'+(automatic?'لا يحتاج الطلب إلى قرار إداري يدوي؛ سيُفعَّل آليًا بعد انتهاء مدة التحقق.':
  'تم تسجيل طلبك وإرسال تنبيه داخل المنصة للمخولين. الموافقة غير مضمونة، ولا تُمنح إلا بعد اعتمادها.')+'</p>'+
 '<div class="ia-pending-clocks"><div><small>مهلة انتظار وإشعار</small><strong data-ia-clock-max>'+
 countdown(pending.requested_at,300)+'</strong></div>'+
 (automatic?'<div><small>التفعيل التلقائي المتوقع</small><strong data-ia-clock-auto>'+
 countdown(pending.requested_at,60)+'</strong></div>':'')+'</div>'+
 '<p class="ia-pending-label" data-ia-pending-label role="status">⏳ جاري التحقق من حالة الطلب ...</p>'+
 '<div class="ia-pending-buttons"><button type="button" data-ia-poll>↻ تحديث حالة الطلب الآن</button>'+
 '<button type="button" data-ia-cancel-local>العودة لطلب جديد</button></div>'+
 '<small>انتهاء مؤقت الخمس دقائق لا يعني موافقة تلقائية في وضع المراجعة البشرية. وفي الوضع التلقائي يكون التفعيل خلال دقيقة تقريبًا.</small>'+
 '</section>';
}
const gateBase=iaGateView;
iaGateView=function(page){
 const html=gateBase(page);
 if(!html.includes('id="iaRequestForm"'))return html;
 return html.replace('class="container ia-page"',pending?'class="container ia-page ia-has-pending"':'class="container ia-page"')
  .replace('<div class="ia-forms">',pendingMarkup()+'<div class="ia-forms">')
  .replace('لا يصدر هذا النموذج رمزًا تلقائيًا','في وضع الموافقة البشرية يصدر الرمز من الشخص المخوَّل؛ أما التفعيل التلقائي فيُنجز عبر متابعة طلبك');
};
async function pollPending(){
 if(!pending||pendingBusy)return;
 pendingBusy=true;
 try{
  const res=await iaFetch('request_status',{id:pending.id,request_secret:pending.request_secret});
  if(res.token){
   iaState.pass=res.token;iaState.expiresAt=res.expires_at;
   sessionStorage.setItem(IA_PASS_KEY,res.token);
   sessionStorage.setItem(IA_PASS_EXPIRY_KEY,res.expires_at);
   iaSchedulePassExpiry();iaClearView();pending=null;sessionStorage.removeItem(PREF_KEY);
   iaState.requestMsg='✅ تمت الموافقة وأصبح الدخول إلى المبادرات متاحًا الآن.';
   render();return;
  }
  if(res.status==='rejected'||res.already_delivered){
   iaState.requestMsg=res.status==='rejected'?'تم رفض طلب الإذن من الشخص المخوّل':
    'استُخدم هذا الإذن سابقًا. افتح المبادرات من حسابك أو اطلب إذنًا جديدًا وفق الشروط.';
   pending=null;sessionStorage.removeItem(PREF_KEY);render();return;
  }
  const label=document.querySelector('[data-ia-pending-label]');
  if(label)label.textContent=res.policy_changed?'تغيرت سياسة الإتاحة؛ يرجى مراجعة إدارة المنصة.':
   pending.approval_mode==='auto'?'الطلب قيد التفعيل التلقائي؛ لا يلزم انتظار موافقة بشرية.':
   'طلب الإذن قيد المراجعة الفعلية من المخوّلين.';
 }catch(err){
  const el=document.querySelector('[data-ia-pending-label]');
  if(el)el.textContent='تعذّر تحديث الحالة مؤقتًا: '+err.message;
 }finally{pendingBusy=false}
}
function tick(){
 if(!pending)return;
 const five=document.querySelector('[data-ia-clock-max]'),one=document.querySelector('[data-ia-clock-auto]');
 if(five)five.textContent=countdown(pending.requested_at,300);
 if(one)one.textContent=countdown(pending.requested_at,60);
}
function startPendingTimers(){
 if(pendingTickTimer!==null)return;
 pendingTickTimer=window.setInterval(tick,1000);
 window.setInterval(()=>{if(pending)pollPending()},3500);
}
function alertBeep(){
 try{
  const Context=window.AudioContext||window.webkitAudioContext;
  if(!Context)return;
  const ctx=new Context(),osc=ctx.createOscillator(),gain=ctx.createGain();
  const at=ctx.currentTime;osc.type='sine';osc.frequency.value=830;
  gain.gain.setValueAtTime(.001,at);gain.gain.exponentialRampToValueAtTime(.08,at+.05);
  gain.gain.exponentialRampToValueAtTime(.001,at+.32);
  osc.connect(gain);gain.connect(ctx.destination);osc.start(at);osc.stop(at+.34);
  window.setTimeout(()=>ctx.close(),600);
 }catch{}
}
async function refreshAlerts(){
 if(opts.notifyBusy||!auth.token||!['supervisor','student','supervisor_assistant'].includes(auth.user?.role))return;
 opts.notifyBusy=true;
 try{
  const data=await iaFetch('notifications',{},true);
  const old=opts.alertIds.join(',');
  opts.approverAuthorized=true;opts.alertCount=data.count||0;
  opts.alertIds=(data.requests||[]).map(x=>x.id);
  if(opts.alertCount&&opts.alertsInitialized&&old!==opts.alertIds.join(','))alertBeep();
  opts.alertsInitialized=true;
  const label=document.querySelector('[data-ia-alerts]');
  if(label)label.textContent='🔔 الطلبات التي تنتظر موافقة منك: '+opts.alertCount;
  if(state.page==='initiative_permissions'&&opts.alertCount&&!iaState.adminBusy)iaLoadAdmin();
  if(auth.user?.role!=='supervisor')showDelegateShortcut();
 }catch(e){
  if(e.reason==='supervisor_only')opts.approverAuthorized=false;
 }finally{opts.notifyBusy=false}
}
function showDelegateShortcut(){
 if(!opts.approverAuthorized||state.page==='initiative_permissions')return;
 const app=document.getElementById('app');
 if(!app||app.querySelector('.ia-delegate-shortcut'))return;
 const b=document.createElement('button');b.type='button';
 b.className='ia-delegate-shortcut';
 b.textContent='🔔 طلبات الإذن المفوضة إليّ'+(opts.alertCount?' ('+opts.alertCount+')':'');
 b.addEventListener('click',()=>route('initiative_permissions'));
 app.prepend(b);
}
const supervisorViewBase=iaSupervisorView;
iaSupervisorView=function(){
 if(auth.user?.role==='supervisor')return supervisorViewBase();
 if(!opts.approverAuthorized)return supervisorViewBase();
 const rows=iaState.adminRows||[];
 if(!iaState.adminRows&&!iaState.adminBusy)Promise.resolve().then(()=>iaLoadAdmin());
 return '<div class="container ia-admin ia-delegate-approval-page" dir="rtl">'+
 '<section class="ia-admin-header"><h1>🔔 الموافقات المفوّضة لمبادرات آفاق ماث</h1>'+
 '<p>تظهر هنا فقط الطلبات التي أذن لك مشرف المنصة بمراجعتها. هذه الصلاحية لا تشمل تغيير الإعدادات العامة.</p>'+
 '<button type="button" id="iaAdminRefresh">تحديث الطلبات</button></section>'+
 (iaState.issued?'<div class="ia-issued"><strong>رمز الدخول الصادر لصاحب الطلب:</strong><p dir="ltr">'+E(iaState.issued.code)+'</p><button id="iaCopyCode" type="button">نسخ الرمز</button></div>':'')+
 '<p class="ia-admin-status" role="status">'+E(iaState.adminMsg||'')+'</p>'+
 (rows.length?'<div class="ia-request-list">'+rows.map(r=>
  '<article class="ia-request-row"><div><strong>'+E(r.requester_name)+'</strong><small>'+E(r.requester_contact||'')+'</small>'+
  '</div><p>'+E(r.purpose)+'</p><div class="ia-actions">'+
  (r.status!=='rejected'?'<button data-ia-approve="'+E(r.id)+'">الموافقة وإصدار رمز</button><button data-ia-reject="'+E(r.id)+'">رفض الطلب</button>':'')+
  '</div></article>').join('')+'</div>':'<p class="ia-empty">لا توجد طلبات بحاجة إلى المراجعة.</p>')+'</div>';
};
const attachBase=attach;
attach=function(){
 attachBase();
 const form=document.getElementById('iaPolicyForm');
 form?.addEventListener('submit',async ev=>{
  ev.preventDefault();if(opts.loading)return;
  const fd=new FormData(form),allowed=fd.getAll('audience').map(String);
  if(!allowed.length){opts.error='اختر فئة واحدة على الأقل.';render();return}
  const d=String(fd.get('duration')||'unlimited');
  const days=d==='custom'?Number(fd.get('custom_days')):Number(d);
  if(d!=='unlimited'&&(!Number.isInteger(days)||days<1||days>365)){
   opts.error='المدة المخصصة يجب أن تكون بين يوم واحد و٣٦٥ يومًا.';render();return;
  }
  const mode=String(fd.get('mode')||'permission');
  const approval_mode=String(fd.get('approval_mode')||'manual');
  // Only open-visibility periods expire; the permission system has its own authorization gate.
  const public_until=mode==='public'&&d!=='unlimited'?
   new Date(Date.now()+days*86400000).toISOString():null;
  opts.loading=true;opts.error='';opts.notice='';
  try{
   const data=await iaFetch('set_visibility',{mode,allowed_audiences:allowed,approval_mode,public_until},true);
   opts.data=data;iaState.visibility=data.mode;iaState.publicUntil=data.public_until||null;
   iaClearView();iaScheduleVisibilityExpiry();
   opts.notice='✓ حُفظت الفئات والمدة ونوع الموافقة على الخادم.';
  }catch(e){opts.error=e.message}
  finally{opts.loading=false;render()}
 });
 document.querySelector('[data-ia-policy-refresh]')?.addEventListener('click',refreshPolicy);
 document.querySelectorAll('[data-ia-delegate]').forEach(el=>el.addEventListener('change',async()=>{
  const key=el.dataset.iaDelegate,active=el.checked;el.disabled=true;
  try{
   await iaFetch('delegate_save',{key,active},true);
   const r=opts.delegates?.delegates||[];
   const item=r.find(x=>x.principal_key===key);
   if(item)item.active=active;else r.push({principal_key:key,active});
   opts.notice=(active?'مُنحت':'أُلغيت')+' صلاحية الموافقة للمخوّل المحدد.';
   opts.error='';render();
  }catch(e){opts.error=e.message;el.checked=!active;render()}
 }));
 const req=document.getElementById('iaRequestForm');
 // Capture phase prevents the previous, manual-only submit handler from firing.
 req?.addEventListener('submit',async ev=>{
  ev.preventDefault();ev.stopImmediatePropagation();if(iaState.loading)return;
  iaState.loading=true;const f=ev.currentTarget;
  const vals={name:f.elements.name.value.trim(),contact:f.elements.contact.value.trim(),purpose:f.elements.purpose.value.trim()};
  try{
   const data=await iaFetch('request',vals);
   pending={id:data.id,request_secret:data.request_secret,approval_mode:data.approval_mode,
    requested_at:data.requested_at,ready_at:data.ready_at};
   sessionStorage.setItem(PREF_KEY,JSON.stringify(pending));
   iaState.requestMsg='تم تسجيل الطلب. يمكن متابعة النتيجة من العداد.';
   startPendingTimers();
  }catch(e){iaState.requestMsg=e.message}
  finally{iaState.loading=false;render();if(pending)pollPending()}
 },true);
 document.querySelector('[data-ia-poll]')?.addEventListener('click',pollPending);
 document.querySelector('[data-ia-cancel-local]')?.addEventListener('click',()=>{
  pending=null;sessionStorage.removeItem(PREF_KEY);render();
 });
 if(pending){startPendingTimers();tick()}
 if(auth.user?.role==='supervisor'&&state.page==='dashboard'&&auth.section==='teacher_initiatives_admin'&&!opts.data&&!opts.loading)
  refreshPolicy();
 if(auth.token&&['student','supervisor','supervisor_assistant'].includes(auth.user?.role)){
  if(opts.lastCheckedToken!==auth.token){
   opts.lastCheckedToken=auth.token;
   Promise.resolve().then(refreshAlerts);
  }
  if(opts.approverAuthorized)showDelegateShortcut();
  if(notificationTimer===null)notificationTimer=window.setInterval(refreshAlerts,16000);
 }
};
/* Hide even the PUBLIC initiative preview on the homepage for disallowed audiences.
   The Edge Function remains the authoritative gate for the protected content. */
const homeAudience={key:'',visible:false,loading:false,fetched:0,interval:null};
function applyHomeAudience(){
 if(state.page!=='home')return;
 const home=document.querySelector('#app .hub-home');
 if(!home)return;
 const bearer=iaBearer()||'visitor';
 const ready=homeAudience.key===bearer&&Date.now()-homeAudience.fetched<30000;
 home.classList.toggle('ia-home-initiatives-restricted',!ready||!homeAudience.visible);
 if(ready||homeAudience.loading)return;
 homeAudience.loading=true;
 Promise.resolve().then(async()=>{
  try{
   const d=await iaFetch('audience_status');
   homeAudience.key=bearer;homeAudience.visible=!!d.visible;
   homeAudience.fetched=Date.now();
  }catch(e){
   homeAudience.key=bearer;homeAudience.visible=false;
   homeAudience.fetched=Date.now();
  }finally{
   homeAudience.loading=false;
   const active=document.querySelector('#app .hub-home');
   if(state.page==='home'&&active)
    active.classList.toggle('ia-home-initiatives-restricted',!homeAudience.visible);
  }
 });
}
const postPolicyAttach=attach;
attach=function(){
 postPolicyAttach();
 applyHomeAudience();
 if(homeAudience.interval===null)
  homeAudience.interval=window.setInterval(()=>{if(state.page==='home')applyHomeAudience()},20000);
};
const basicFetch=iaFetch;
iaFetch=async function(action,payload={},admin=false){
 try{return await basicFetch(action,payload,admin)}
 catch(e){
  const msgs={
   audience_forbidden:'هذه المبادرات ليست متاحة لفئة حسابك في إعدادات المنصة الحالية.',
   cooldown_30_minutes:'استُنفدت المحاولتان المسموحتان. يمكن تقديم طلب جديد بعد مرور ٣٠ دقيقة.',
   permission_not_required:'هذه المبادرات متاحة مباشرة للفئات المسموح لها؛ لا تحتاج إلى تقديم طلب.',
   invalid_audiences:'يجب اختيار فئة واحدة على الأقل.',
   invalid_approval_mode:'اختر نمط موافقة صحيحًا.',
   invalid_expiry:'مدة الإتاحة المدخلة غير صحيحة.',
   invalid_delegate:'لا يمكن منح الصلاحية لهذا الحساب أو لهذه العضوية.',
   not_found:'تعذّر العثور على هذا الطلب أو رمز متابعته.'
  };
  if(msgs[e.reason])e.message=msgs[e.reason];
  throw e;
 }
};
// A visible green confirmation accompanies an approved automatic or manual session.
const priorApprovedAttach=attach;
attach=function(){
 priorApprovedAttach();
 if(!iaState.pass||!iaPrivatePages.has(state.page)||iaState.page!==state.page||!iaState.html)return;
 const app=document.getElementById('app');
 if(!app||app.querySelector('.ia-approved-banner'))return;
 const note=document.createElement('div');
 note.className='ia-approved-banner';
 note.setAttribute('role','status');
 note.textContent='✅ الضوء الأخضر: تمت الموافقة على دخولك، والمبادرات متاحة لك خلال مدة الجلسة المعتمدة.';
 app.prepend(note);
};
if(pending)startPendingTimers();
})();