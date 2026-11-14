/* AFAQ MATH — protected initiatives; request, supervisor approval and single-use temporary code.
   Educational lesson HTML is no longer embedded in this publicly downloadable file. */
'use strict';
const IA_API='https://xcwuwflggiwkehzquugz.supabase.co/functions/v1/afaq-initiative-access';
const IA_PASS_KEY='afaq_initiative_view_pass_v1';
const iaPrivatePages=new Set(['teaching_initiatives','initiatives','afaq_multiples','afaq_prime_sieve','mixer','coordinate_ya','division_key']);
const iaState={
 pass:sessionStorage.getItem(IA_PASS_KEY)||'',loading:false,blocked:false,lastPage:'',lastBearer:'',page:'',html:'',error:'',
 requestMsg:'',codeMsg:'',codeError:'',adminBusy:false,adminRows:null,adminMsg:'',issued:null,
 params:{number:6,index:3,sieveStage:0,answer:'',answerChecked:false}
};
const iaEscape=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const iaArabic=n=>new Intl.NumberFormat('ar-OM',{useGrouping:false}).format(n);
function iaBearer(forAdmin=false){
 if(forAdmin)return auth.token||'';
 if(auth.user?.role==='supervisor'&&auth.token)return auth.token;
 return iaState.pass||auth.token||'';
}
async function iaFetch(action,payload={},admin=false){
 const bearer=iaBearer(admin);
 const response=await fetch(IA_API,{method:'POST',headers:{
  'Content-Type':'application/json',...(bearer?{'Authorization':'Bearer '+bearer}:{})
 },body:JSON.stringify({action,...payload}),cache:'no-store'});
 let result;try{result=await response.json()}catch{throw Error('تعذر قراءة استجابة خادم الأذونات')}
 if(!response.ok||!result.ok){
  const errors={
   permission_required:'يلزم الحصول على إذن من المشرف قبل الاطلاع على المبادرات.',
   permission_denied:'لم يتم اعتماد هذا الطلب من المشرف.',
   supervisor_only:'هذه العملية متاحة للمشرف الرئيسي فقط.',
   invalid_code:'الرمز غير صحيح، أو انتهت صلاحيته، أو استُخدم من قبل.',
   code_used:'استُخدم هذا الرمز سابقًا، ويجب طلب رمز جديد.',
   request_limit:'لقد بلغت الحد المسموح من طلبات الإذن لهذا اليوم.',
   invalid_request:'أدخل الاسم وسبب طلب الاطلاع بصورة واضحة.',
   server_error:'تعذر إكمال العملية على الخادم. حاول مرة أخرى.'
  };
  const err=new Error(errors[result.error]||'تعذر إكمال العملية: '+(result.error||response.status));
  err.reason=result.error||'unknown';throw err;
 }
 return result;
}
function iaGateView(page){
 const label=page==='afaq_multiples'?'مبادرة المضاعفات الصفرية والموجبة':
 page==='afaq_prime_sieve'?'مبادرة غربال الأعداد الأولية':'مبادرات الأستاذ سعيد البريكي';
 return '<div class="container ia-page" dir="rtl"><section class="ia-gate">'+
 '<div class="ia-shield">🔐</div><span class="ia-eyebrow">محتوى تعليمي محمي بإذن المشرف</span>'+
 '<h1>'+iaEscape(label)+'</h1>'+
 '<p>هذه المبادرات من إعداد الأستاذ سعيد بن جمعة بن عبدالله البريكي. يلزم تقديم طلب إذن أو استخدام رمز مشاهدة مؤقت يمنحه المشرف الرئيسي. الرمز صالح للاستعمال مرة واحدة، وتستمر جلسة المشاهدة مدة محدودة.</p>'+
 (iaState.loading?'<p class="ia-loading" role="status">جارٍ التحقق من إذن الدخول ...</p>':'')+
 '<div class="ia-forms">'+
 '<form id="iaRequestForm" class="ia-form"><h2>طلب إذن من الأستاذ سعيد</h2>'+
 '<label>الاسم<input name="name" maxlength="100" minlength="2" required placeholder="اسم طالب الإذن"></label>'+
 '<label>وسيلة التواصل (اختيارية)<input name="contact" maxlength="150" placeholder="هاتف أو بريد لاستلام الرد"></label>'+
 '<label>سبب الاطلاع<textarea name="purpose" rows="3" maxlength="500" minlength="5" required placeholder="مثل: الاستخدام التعليمي في الصف"></textarea></label>'+
 '<button type="submit"'+(iaState.loading?' disabled':'')+'>إرسال طلب الإذن</button>'+
 '<p class="ia-form-msg" role="status">'+iaEscape(iaState.requestMsg)+'</p></form>'+
 '<form id="iaCodeForm" class="ia-form"><h2>لدي رمز دخول مؤقت</h2>'+
 '<label>الرمز الصادر من المشرف<input name="code" required minlength="12" maxlength="22" autocomplete="one-time-code" dir="ltr" placeholder="AF-XXXX-XXXX-XXXX"></label>'+
 '<button type="submit"'+(iaState.loading?' disabled':'')+'>التحقق والدخول</button>'+
 '<p class="ia-form-msg" role="status">'+iaEscape(iaState.codeMsg||iaState.codeError||iaState.error)+'</p>'+
 '<p class="ia-help">تصل الموافقة من المشرف خارج المنصة؛ لا يصدر هذا النموذج رمزًا تلقائيًا. يمكنك التواصل عبر <a href="https://wa.me/96897414000" target="_blank" rel="noopener noreferrer">واتساب الأستاذ سعيد</a>.</p>'+
 '</form></div>'+
 '<div class="ia-credit">© إعداد وإشراف الأستاذ سعيد بن جمعة بن عبدالله البريكي — آفاق ماث. يُمنع النسخ وإعادة النشر أو إعادة النسبة دون موافقة صاحب العمل.</div>'+
 '<button type="button" class="ia-manage-link" data-route="initiative_permissions">إدارة الأذونات — حساب المشرف الرئيسي</button>'+
 '</section></div>';
}
function iaSupervisorView(){
 const admin=auth.user?.role==='supervisor';
 const rows=iaState.adminRows||[];
 const issued=iaState.issued;
 return '<div class="container ia-admin" dir="rtl"><section class="ia-admin-header">'+
 '<h1>إدارة أذونات مبادرات الأستاذ سعيد</h1>'+
 '<p>الموافقات والرموز تصدر فقط من الحساب المعتمد للمشرف الرئيسي. لا يظهر رمز الدخول إلا عند إصداره، ويُستخدم مرة واحدة خلال ١٥ دقيقة.</p>'+
 (admin?'<button type="button" id="iaAdminRefresh">تحديث طلبات الإذن</button>':'<button type="button" id="iaAdminLogin">تسجيل الدخول بصفة المشرف الرئيسي</button>')+
 '<button type="button" data-route="teaching_initiatives">العودة إلى مبادرات الأستاذ سعيد</button></section>'+
 (!admin?'<p class="ia-warning">يجب أولًا تسجيل الدخول من بوابة المشرف الرئيسي. لا تكفي صلاحيات الطالب أو الزائر أو الإدارة المدرسية أو مساعد المشرف لإصدار الرموز.</p>':
 '<section class="ia-admin-requests">'+
 (issued?'<div class="ia-issued" role="status"><strong>رمز جديد — أرسله لصاحب الطلب بصورة خاصة:</strong>'+
 '<p dir="ltr">'+iaEscape(issued.code)+'</p><small>تنتهي صلاحيته '+iaEscape(new Date(issued.expires_at).toLocaleString('ar-OM',{timeZone:'Asia/Muscat'}))+'</small>'+
 '<button type="button" id="iaCopyCode">نسخ الرمز</button></div>':'')+
 '<p class="ia-admin-status" role="status">'+iaEscape(iaState.adminMsg)+'</p>'+
 (iaState.adminBusy?'<p>جارٍ تحميل الطلبات ...</p>':'')+
 (rows.length?'<div class="ia-request-list">'+rows.map(r=>
 '<article class="ia-request-row"><div><span class="ia-status ia-status-'+iaEscape(r.status)+'">'+
 (r.status==='pending'?'قيد المراجعة':r.status==='approved'?'تمت الموافقة':'مرفوض')+'</span>'+
 '<strong>'+iaEscape(r.requester_name)+'</strong><small>'+iaEscape(r.requester_contact||'لا توجد وسيلة تواصل مضافة')+'</small>'+
 '<time>'+iaEscape(new Date(r.requested_at).toLocaleString('ar-OM',{timeZone:'Asia/Muscat'}))+'</time></div>'+
 '<p>'+iaEscape(r.purpose)+'</p><div class="ia-actions">'+
 (r.status!=='rejected'?'<button type="button" data-ia-approve="'+iaEscape(r.id)+'">'+
 (r.status==='approved'?'إصدار رمز جديد':'الموافقة وإصدار رمز')+'</button>':'')+
 (r.status!=='rejected'?'<button type="button" data-ia-reject="'+iaEscape(r.id)+'">رفض / سحب الإذن</button>':'')+
 '</div></article>').join('')+'</div>':
 '<p class="ia-empty">لا توجد طلبات معروضة. اضغط «تحديث طلبات الإذن» للتحقق من الطلبات الجديدة.</p>')+
 '</section>')+'</div>';
}
function iaPreview(){
 return '<section class="v10-init-home ia-init-teaser" aria-label="مبادرات الأستاذ سعيد البريكي">'+
 '<div class="v10-init-head"><div><span>بصمة تعليمية خاصة</span>'+
 '<h2>مبادرات الأستاذ سعيد البريكي</h2>'+
 '<p>أنشطة رياضية مبتكرة تُعرض بإذن المشرف الرئيسي، مع توثيق مصدرها وحقوق إعدادها.</p></div>'+
 '<button type="button" data-route="teaching_initiatives">طلب إذن أو دخول برمز مؤقت</button></div>'+
 '<div class="ia-preview-art"><span>🔐</span><strong>المضاعفات • الأعداد الأولية • المبادرات الرياضية</strong>'+
 '<button type="button" data-route="teaching_initiatives">استكشف المبادرات بتصريح مشاهدة</button></div></section>';
}
initHome=function(){return iaPreview()};
function iaClearView(){
 iaState.page='';iaState.html='';iaState.error='';iaState.blocked=false;
}
async function iaLoadProtected(page){
 if(iaState.loading)return;
 iaState.loading=true;iaState.error='';iaState.lastBearer=iaBearer();iaState.lastPage=page;
 try{
  const response=await iaFetch('view',{page,params:iaState.params});
  iaState.page=page;
  iaState.html=response.legacy?iaOriginalGeneric(page):response.html;
  iaState.blocked=false;iaState.error='';
 }catch(err){
  iaState.error=err.message;
  if(err.reason==='permission_required'){iaState.pass='';sessionStorage.removeItem(IA_PASS_KEY)}
  iaState.page='';iaState.html='';iaState.blocked=true;
 }finally{
  iaState.loading=false;
  if(state.page===page)render();
 }
}
const iaOriginalGeneric=genericSection;
genericSection=function(page){
 if(page==='initiative_permissions')return iaSupervisorView();
 if(!iaPrivatePages.has(page))return iaOriginalGeneric(page);
 if(iaState.page===page&&iaState.html){
  let html=iaState.html;
  if(auth.user?.role==='supervisor'&&page==='teaching_initiatives'){
   html='<div class="ia-owner-actions"><button type="button" data-route="initiative_permissions">إدارة أذونات المبادرات</button></div>'+html;
  }
  return html;
 }
 if(!iaState.loading&&(!iaState.blocked||iaState.lastBearer!==iaBearer()||iaState.lastPage!==page))
  Promise.resolve().then(()=>iaLoadProtected(page));
 return iaGateView(page);
};
async function iaLoadAdmin(){
 if(iaState.adminBusy)return;
 iaState.adminBusy=true;iaState.adminMsg='';
 try{const response=await iaFetch('admin_list',{},true);iaState.adminRows=response.requests;}
 catch(err){iaState.adminMsg=err.message;}
 finally{iaState.adminBusy=false;if(state.page==='initiative_permissions')render();}
}
function iaInputs(result){
 const current=iaState.params;
 const ints=['number','index'];
 const NumberEl=k=>document.getElementById(k);
 if(NumberEl('amiMultipleForm')){
  document.getElementById('amiMultipleForm').addEventListener('submit',event=>{
   event.preventDefault();const form=event.currentTarget;
   const n=Number(form.elements.number.value),k=Number(form.elements.index.value);
   if(!Number.isInteger(n)||n<1||n>9999||!Number.isInteger(k)||k<0||k>100){
    const msg=document.getElementById('amiValidation');if(msg)msg.textContent='أدخل عددًا من ١ إلى ٩٩٩٩ ورتبة من ٠ إلى ١٠٠.';
    return;
   }
   current.number=n;current.index=k;iaClearView();render();
  });
 }
 document.querySelectorAll('[data-ami-ordinal]').forEach(button=>button.addEventListener('click',()=>{
  const raw=Number(document.getElementById('amiMultipleNumber')?.value);
  if(Number.isInteger(raw)&&raw>=1&&raw<=9999)current.number=raw;
  current.index=Number(button.dataset.amiOrdinal);iaClearView();render();
 }));
 document.querySelector('[data-ami-reset]')?.addEventListener('click',()=>{
  current.sieveStage=0;current.answer='';current.answerChecked=false;iaClearView();render();
 });
 document.querySelector('[data-ami-back]')?.addEventListener('click',()=>{
  current.sieveStage=Math.max(0,current.sieveStage-1);
  current.answer='';current.answerChecked=false;iaClearView();render();
 });
 document.querySelectorAll('[data-ami-step]').forEach(btn=>btn.addEventListener('click',()=>{
  const step=Number(btn.dataset.amiStep);
  if(step!==current.sieveStage+1)return;
  current.sieveStage=step;current.answer='';current.answerChecked=false;iaClearView();render();
 }));
 document.getElementById('amiPrimeAnswer')?.addEventListener('submit',event=>{
  event.preventDefault();
  if(current.sieveStage!==4)return;
  current.answer=event.currentTarget.elements.answer.value.trim().replace(/[^0-9]/g,'').slice(0,3);
  current.answerChecked=true;iaClearView();render();
 });
 document.querySelectorAll('[data-ami-export]').forEach(btn=>btn.addEventListener('click',()=>{
  const plain=btn.dataset.amiExport==='initial';
  iaDownloadSieve(plain?0:current.sieveStage,plain);
 }));
}
function iaNumberPrime(n){
 if(n<2)return false;
 for(let x=2;x*x<=n;x++)if(n%x===0)return false;
 return true;
}
function iaSieveColor(n,stage){
 if(n===1)return stage?'#e4e7eb':'#fffaf0';
 for(const [i,p] of [2,3,5,7].entries()){
  if(i<stage&&n>p&&n%p===0)return {2:'#fbe0df',3:'#fce7c5',5:'#dfe8ff',7:'#eadbfa'}[p];
 }
 return stage===4&&iaNumberPrime(n)?'#bdf2d2':'#fffaf0';
}
function iaDownloadSieve(stage,plain){
 const cells=Array.from({length:100},(_,i)=>{
  const n=i+1,c=i%10,r=Math.floor(i/10),x=36+c*69,y=115+r*64;
  return '<rect x="'+x+'" y="'+y+'" width="58" height="55" rx="8" fill="'+iaSieveColor(n,plain?0:stage)+'" stroke="#c4d7e5"/>'+
  '<text x="'+(x+29)+'" y="'+(y+35)+'" text-anchor="middle" font-family="Tahoma,Arial" font-size="25" fill="#21415d">'+n+'</text>';
 }).join('');
 const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 800">'+
 '<rect width="760" height="800" fill="#f7f9ff"/><rect x="22" y="22" width="716" height="68" rx="15" fill="#173d75"/>'+
 '<text x="380" y="55" text-anchor="middle" font-size="24" font-family="Tahoma,Arial" fill="white">AFAQ MATH - PRIME SIEVE</text>'+
 '<text x="380" y="77" text-anchor="middle" font-size="15" font-family="Tahoma,Arial" fill="#ffdfa2">© سعيد جمعة عبدالله البريكي — المرحلة '+(plain?0:stage)+'</text>'+
 cells+'</svg>';
 const obj=new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(obj),a=document.createElement('a');
 a.href=url;a.download=plain?'afaq-original-1-100.svg':'afaq-prime-sieve-'+stage+'.svg';
 document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1200);
}
const iaAttachBase=attach;
attach=function(){
 iaAttachBase();
 document.getElementById('iaRequestForm')?.addEventListener('submit',async event=>{
  event.preventDefault();if(iaState.loading)return;
  const f=event.currentTarget;
  const vals={name:f.elements.name.value.trim(),contact:f.elements.contact.value.trim(),purpose:f.elements.purpose.value.trim()};
  iaState.loading=true;
  try{
   const res=await iaFetch('request',vals);
   iaState.requestMsg='تم تسجيل طلب الإذن برقم '+res.id+'؛ راجع المشرف الرئيسي لمتابعة الموافقة واستلام الرمز.';
   f.reset();
  }catch(e){iaState.requestMsg=e.message}
  finally{iaState.loading=false;render()}
 });
 document.getElementById('iaCodeForm')?.addEventListener('submit',async event=>{
  event.preventDefault();if(iaState.loading)return;
  const code=event.currentTarget.elements.code.value.trim();
  iaState.loading=true;
  try{
   const res=await iaFetch('redeem',{code});
   iaState.pass=res.token;sessionStorage.setItem(IA_PASS_KEY,res.token);
   iaState.codeError='';iaState.codeMsg='تمت الموافقة. يمكن الآن مشاهدة المبادرات خلال مدة الجلسة.';
   iaClearView();
  }catch(e){iaState.codeError=e.message}
  finally{iaState.loading=false;render()}
 });
 document.getElementById('iaAdminLogin')?.addEventListener('click',()=>{
  if(typeof selectEntryGate==='function')selectEntryGate('supervision');
  else document.getElementById('accountBtn')?.click();
 });
 document.getElementById('iaAdminRefresh')?.addEventListener('click',iaLoadAdmin);
 document.querySelectorAll('[data-ia-approve]').forEach(button=>button.addEventListener('click',async()=>{
  iaState.adminBusy=true;iaState.issued=null;
  try{
   const res=await iaFetch('approve',{id:button.dataset.iaApprove},true);
   iaState.issued={code:res.code,expires_at:res.expires_at};
   iaState.adminMsg='تم إصدار رمز مؤقت. شاركه مع صاحب الطلب برسالة خاصة.';
   const list=await iaFetch('admin_list',{},true);iaState.adminRows=list.requests;
  }catch(e){iaState.adminMsg=e.message}
  finally{iaState.adminBusy=false;render()}
 }));
 document.querySelectorAll('[data-ia-reject]').forEach(button=>button.addEventListener('click',async()=>{
  if(!window.confirm('هل تريد رفض هذا الطلب وسحب أي إذن مشاهدة مرتبط به؟'))return;
  iaState.adminBusy=true;
  try{
   await iaFetch('reject',{id:button.dataset.iaReject},true);
   const list=await iaFetch('admin_list',{},true);iaState.adminRows=list.requests;
   iaState.adminMsg='تم رفض الطلب وإبطال الجلسات المرتبطة به.';
  }catch(e){iaState.adminMsg=e.message}
  finally{iaState.adminBusy=false;render()}
 }));
 document.getElementById('iaCopyCode')?.addEventListener('click',()=>{
  if(iaState.issued?.code)navigator.clipboard?.writeText(iaState.issued.code);
 });
 if(iaPrivatePages.has(state.page)&&iaState.page===state.page&&iaState.html)iaInputs();
};
if(typeof location!=='undefined'){
 const deep=(location.hash||'').slice(1);
 if(iaPrivatePages.has(deep)||deep==='initiative_permissions'){
  state.page=deep;render();
 }
}
