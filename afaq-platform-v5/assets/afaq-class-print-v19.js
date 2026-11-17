/* AFAQMATHS — supervisor-approved classroom QR login tickets.
 * Each ticket includes full name, user name, new temporary PIN (if explicitly
 * issued), a valid URL-only QR and the URL directly underneath.
 */
'use strict';
const cpSite='https://afaqmaths.github.io/s/afaq-platform-v5/';
const cpQR=cpSite+'assets/afaq-login-qr.svg';
const cpClasses=['السادس / ٤','السادس / ٥','السادس / ٦'];
const CP={className:cpClasses[0],layout:'single',token:'',role:'',roster:[],loaded:false,loading:false,attempted:false,
 pins:new Map(),issuedAt:0,message:'',error:''};
const cpEsc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;',">":'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const cpStaff=()=>['supervisor','supervisor_assistant'].includes(auth.user?.role);
const cpSupervisor=()=>auth.user?.role==='supervisor';
function cpExpirePins(){
 if(CP.issuedAt&&Date.now()-CP.issuedAt>10*60*1000){
  CP.pins.clear();CP.issuedAt=0;
  CP.message='انتهت مهلة عرض الأرقام المؤقتة. لا تُسترجع كلمات المرور المشفرة.';
 }
}
function cpResetOnIdentity(){
 if(CP.token!==auth.token||CP.role!==auth.user?.role){
  CP.token=auth.token||'';CP.role=auth.user?.role||'';
  CP.loaded=false;CP.attempted=false;CP.roster=[];CP.pins.clear();CP.issuedAt=0;
 }
 cpExpirePins();
}
async function cpLoad(){
 cpResetOnIdentity();
 if(!cpStaff()||CP.loading)return;
 CP.loading=true;CP.attempted=true;CP.error='';const token=auth.token;
 try{
  const result=await arCall('staff_roster');
  if(token!==auth.token)return;
  CP.roster=(result.students||[]).filter(row=>cpClasses.includes(row.class_name));
  CP.loaded=true;
 }catch(e){if(token===auth.token)CP.error=e.message}
 finally{CP.loading=false;if(auth.section==='afaq_class_print'&&token===auth.token)render()}
}
function cpClassStudents(){
 return CP.roster.filter(row=>row.class_name===CP.className).sort((a,b)=>Number(a.serial_no)-Number(b.serial_no));
}
function cpCard(student){
 const code=CP.pins.get(student.student_id);
 return '<article class="cp-slip"><div class="cp-slip-info">'+
 '<div class="cp-slip-name">'+cpEsc(student.full_name||student.display_name||'طالب')+'</div>'+
 '<div><span>اسم المستخدم:</span><b dir="ltr">'+cpEsc(student.login_name)+'</b></div>'+
 '<div><span>الرقم السري:</span><b class="cp-pass" dir="ltr">'+(code?cpEsc(code):'________')+'</b></div>'+
 '</div><div class="cp-slip-qr"><img src="'+cpQR+'" alt="رمز QR لمنصة آفاق ماث">'+
 '<a href="'+cpSite+'"><span>https://afaqmaths.github.io/s/</span><span>afaq-platform-v5/</span></a>'+
 '</div></article>';
}
function cpPanel(){
 cpResetOnIdentity();
 if(!cpStaff())return '<div class="container"><p class="notice">طباعة بيانات دخول الطلاب متاحة للمشرف والمساعد فقط.</p></div>';
 if(!CP.loaded&&!CP.loading&&!CP.attempted)Promise.resolve().then(cpLoad);
 const students=cpClassStudents(), issued=students.filter(s=>CP.pins.has(s.student_id)).length;
 return '<div class="container cp-page" dir="rtl">'+(typeof hubStaffNav==='function'?hubStaffNav():'')+
 '<header class="cp-head"><span>🪪 طباعة بيانات دخول الطلاب</span>'+
 '<h1>بطاقات دخول آفاق ماث قابلة للقص</h1>'+
 '<p>كل بطاقة أفقية تتضمن الاسم واسم المستخدم والرقم السري، وبجانبها رمز QR وتحت الرمز رابط المنصة.</p>'+
 '<button type="button" data-tab="overview">العودة إلى لوحة المشرف</button></header>'+
 '<section class="cp-workarea"><div class="cp-inputs">'+
 '<label>اختر الشعبة<select id="cpChooseClass"'+(CP.loading?' disabled':'')+'>'+cpClasses.map(x=>
 '<option value="'+cpEsc(x)+'"'+(x===CP.className?' selected':'')+'>'+cpEsc(x)+'</option>').join('')+'</select></label>'+
 '<label>تنسيق ورقة الطباعة<select id="cpChooseLayout"'+(CP.loading?' disabled':'')+'>'+
 '<option value="single"'+(CP.layout==='single'?' selected':'')+'>صفحة واحدة: A3 أفقي — ٣ بطاقات بكل صف</option>'+
 '<option value="double"'+(CP.layout==='double'?' selected':'')+'>صفحتان: A4 أفقي — ٣ بطاقات بكل صف</option>'+
 '</select></label></div>'+
 '<div class="cp-actions"><button type="button" id="cpUpdate">تحديث قائمة الطلاب</button>'+
 '<button type="button" id="cpPreview"'+(!CP.loaded||CP.loading?' disabled':'')+'>🖨️ معاينة وطباعة / حفظ PDF</button>'+
 (cpSupervisor()?'<button class="cp-sensitive" type="button" id="cpIssue"'+(!CP.loaded?' disabled':'')+'>🔐 إصدار أرقام سرية مؤقتة للشعبة</button>':'')+'</div>'+
 '<p class="cp-status" role="status">'+cpEsc(CP.error||CP.message||'')+'</p>'+
 '<div class="cp-summary"><strong>'+students.length+' طالبًا</strong>'+
 '<span>الشعبة: '+cpEsc(CP.className)+'</span><span>رموز مؤقتة جاهزة للطباعة: '+issued+'</span></div>'+
 '<p class="cp-safety">لا يمكن قراءة الأرقام السرية الحالية من قاعدة البيانات. الكشف العادي يطبع خانة فارغة للرقم السري؛ ويمكن للمشرف الرئيسي فقط إصدار أرقام جديدة بعد تأكيد صريح. هذا سيُبطل الأرقام القديمة ويستلزم تغيير الطالب لرقمه بعد الدخول. لا تسلّم كشف الشعبة كاملًا؛ قص البطاقات وقدّم كل بطاقة لصاحبها بسرية.</p>'+
 '<div class="cp-sample"><h2>معاينة إحدى بطاقات الشعبة</h2>'+
 (students.length?cpCard(students[0]):'<p>لا توجد أسماء محمّلة حاليًا.</p>')+'</div></section></div>';
}
function cpSheet(rows,page,total){
 return '<section class="cp-print-sheet"><header class="cp-print-head"><div>'+
 '<h1>بيانات دخول منصة آفاق ماث <small lang="en">AFAQMATHS</small></h1>'+
 '<p>الشعبة '+cpEsc(CP.className)+' • قص كل بطاقة على امتداد الإطار المنقّط</p></div>'+
 '<div class="cp-print-page-number">صفحة '+page+' من '+total+'</div></header>'+
 '<div class="cp-print-grid">'+rows.map(cpCard).join('')+'</div>'+
 '<footer class="cp-print-footer"><strong>إعداد وإشراف الأستاذ سعيد البريكي</strong>'+
 '<span>رابط المنصة: '+cpSite+'</span><span>بيانات خاصة — تُسلّم البطاقة للطالب المعني فقط</span></footer></section>';
}
function cpPrintDocument(rows){
 const single=CP.layout==='single',sheets=single?[rows]:[rows.slice(0,18),rows.slice(18)];
 const pageStyle=single?'@page{size:A3 landscape;margin:7mm}.cp-print-grid .cp-slip{height:19.5mm}':
 '@page{size:A4 landscape;margin:7mm}.cp-print-grid .cp-slip{height:25.5mm}'+
 '.cp-print-grid .cp-slip-qr img{width:19mm;height:19mm}';
 const sensitive=rows.some(s=>CP.pins.has(s.student_id));
 return '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">'+
 '<meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<title>كشف الدخول '+cpEsc(CP.className)+' — آفاق ماث</title>'+
 '<link rel="stylesheet" href="'+cpSite+'assets/afaq-class-print-v19.css">'+
 '<style>'+pageStyle+'</style></head><body class="cp-preview-body">'+
 '<nav class="cp-print-tools"><button type="button" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>'+
 '<button type="button" onclick="window.close()">إغلاق</button><span>'+
 (sensitive?'تنبيه: الكشف يتضمن أرقامًا سرية مؤقتة؛ يُحفظ بسرية.':'الرقم السري الحالي غير قابل للعرض؛ الخانات المخصصة له فارغة.')+
 '</span></nav>'+sheets.map((rows,i)=>cpSheet(rows,i+1,sheets.length)).join('')+'</body></html>';
}
function cpOpenPrint(){
 const students=cpClassStudents();
 if(!CP.loaded||CP.loading||!students.length){CP.error='لا توجد بيانات جاهزة للطباعة لهذه الشعبة.';render();return}
 const popup=window.open('','_blank','width=1250,height=900');
 if(!popup){CP.error='رجاءً اسمح بالنوافذ المنبثقة لمعاينة كشف الشعبة.';render();return}
 popup.document.open();popup.document.write(cpPrintDocument(students));popup.document.close();popup.focus();
}
async function cpIssueTemporaryPins(){
 if(!cpSupervisor()||CP.loading||!CP.loaded)return;
 const students=cpClassStudents();if(!students.length)return;
 const reply=window.prompt('سيتم تغيير الأرقام السرية الحالية لجميع طلاب '+CP.className+
 ' وعددهم '+students.length+'. سيُلزم الطلاب بتغيير الرموز الجديدة عند أول دخول. اكتب «إصدار» للتأكيد:');
 if(reply!=='إصدار')return;
 if(!window.confirm('تأكيد نهائي: هل تريد بالفعل استبدال الأرقام السرية لكل طلاب '+CP.className+
 '؟ سيُلغى كل رقم سري قديم.'))return;
 CP.loading=true;CP.message='جارٍ إعداد أرقام جديدة وحفظ تجزئاتها المشفّرة ...';CP.error='';render();
 try{
  const response=await arCall('issue_class_temp_pins',{class_name:CP.className,confirmation:'ISSUE_TEMP_PINS'});
  CP.pins.clear();
  for(const item of response.credentials||[])CP.pins.set(item.student_id,item.pin);
  CP.issuedAt=Date.now();
  CP.message='أُصدرت '+response.issued+' كلمة مرور مؤقتة. افتح معاينة الطباعة الآن؛ لن يمكن استرجاعها لاحقًا.'+
  (response.partial?' توجد '+response.failed_count+' بطاقات لم ينجح تحديثها؛ ستظهر خاناتها فارغة.':'')+
  (response.credentials?.some(s=>s.session_revoke_warning)?' تنبيه: تعذر إلغاء بعض الجلسات السابقة.':'');
 }catch(err){CP.error=err.message}
 finally{CP.loading=false;if(auth.section==='afaq_class_print')render()}
}
const cpPreviousPanel=staffPanel;
staffPanel=function(){return auth.section==='afaq_class_print'?cpPanel():cpPreviousPanel()};
const cpPreviousNav=hubStaffNav;
hubStaffNav=function(){
 const html=cpPreviousNav();
 if(!cpStaff())return html;
 return html.replace('</div>','<button type="button" class="'+(auth.section==='afaq_class_print'?'selected':'')+
 '" data-tab="afaq_class_print">🪪 بطاقات دخول الشعب</button></div>');
};
const cpPreviousDashboard=hubStaffDashboard;
hubStaffDashboard=function(){
 const html=cpPreviousDashboard();
 if(!cpStaff())return html;
 const button='<section class="cp-feature"><span>🪪</span><div>'+
 '<strong>طباعة بطاقات دخول الطلاب</strong>'+
 '<p>الاسم واسم المستخدم والرقم السري، مع QR ورابط المنصة أسفل الرمز لكل طالب.</p></div>'+
 '<button type="button" data-tab="afaq_class_print">فتح الطباعة</button></section>';
 return html.replace('<section class="hub-main hub-staff-stats">',button+'<section class="hub-main hub-staff-stats">');
};
const cpPreviousAttach=attachPortal;
attachPortal=function(){
 cpPreviousAttach();
 if(auth.section!=='afaq_class_print'||!cpStaff())return;
 document.getElementById('cpChooseClass')?.addEventListener('change',e=>{
  CP.className=e.target.value;CP.pins.clear();CP.issuedAt=0;CP.error='';CP.message='';render();
 });
 document.getElementById('cpChooseLayout')?.addEventListener('change',e=>{
  CP.layout=e.target.value==='double'?'double':'single';render();
 });
 document.getElementById('cpUpdate')?.addEventListener('click',cpLoad);
 document.getElementById('cpPreview')?.addEventListener('click',cpOpenPrint);
 document.getElementById('cpIssue')?.addEventListener('click',cpIssueTemporaryPins);
};
