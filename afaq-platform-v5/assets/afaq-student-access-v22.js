/* AFAQMATHS | 2026-11-17 | Authenticated supervised student view + gradebook behavior.
 * NO student tokens or passwords are minted. Staff see a recorded, read-only student account view.
 */
'use strict';
const AS22={editingId:null,editingStudent:'',busy:false,error:'',message:''};
const as22Allowed=()=>typeof arStaff==='function'&&arStaff();
const as22T=v=>arEsc(v??'');
const as22GradesInfo=grades=>{
 const visible=Array.isArray(grades)?grades:[];
 const recent=visible.find(x=>x.source==='official');
 // Never add two academic terms together or include diagnostic marks in the /100 total.
 const current=recent?visible.filter(x=>x.source==='official'&&x.academic_year===recent.academic_year&&x.term===recent.term):
 visible.filter(x=>x.source==='legacy');
 const total=current.find(x=>x.category==='total'&&Number(x.max)===100);
 const group=current.filter(x=>!['total','diagnostic'].includes(x.category));
 const seen=group.filter(x=>x.score!=null).length;
 const partial=group.reduce((n,x)=>n+Number(x.score||0),0),available=group.reduce((n,x)=>n+Number(x.max||0),0);
 return '<div class="as22-summary" aria-live="polite">'+
 (total?'<strong>المجموع المعتمد المنشور: '+arNum(total.score)+' من ١٠٠</strong>':
 '<strong>المجموع النهائي من ١٠٠: غير منشور أو غير معتمد بعد</strong>')+
 '<p>'+(seen?'مجموع بنود التقييم المنشورة حاليًا: '+arNum(partial)+' من '+arNum(available)+'.':
 'لا توجد درجات معتمدة ومنشورة حتى الآن.')+'</p>'+
 '<small>المجموع الجزئي لا يمثل درجة نهائية من ١٠٠، ولا تُحتسب البنود غير المرصودة بصفر.</small></div>';
};
function as22StudentMirror(){
 if(!as22Allowed()||!AR.current?.student||AR.current.read_only!==true)return '';
 const x=AR.current,s=x.student;
 const visibleGrades=x.visible_grades||[],visiblePapers=x.visible_papers||[];
 return '<section class="ar-card as22-mirror" aria-label="معاينة حساب الطالب الفعلية">'+
 '<div class="as22-mirror-head"><span>👁️</span><div><h2>الدخول الإداري إلى عرض حساب الطالب — دون رقم سري</h2>'+
 '<p>المشرف/المساعد: '+as22T(auth.user?.username||auth.user?.role)+
 ' • تُوثق كل عملية اطلاع • وضع قراءة فقط • لا تغيّر هوية الطالب أو درجاته أو محاولاته.</p></div></div>'+
 '<div class="as22-student-id"><b>'+as22T(s.full_name||s.display_name)+'</b>'+
 '<span>'+as22T(s.class_name)+' • اسم المستخدم <b dir="ltr">'+as22T(s.login_name)+'</b></span></div>'+
 '<h3>الدرجات التي يستطيع الطالب رؤيتها الآن</h3>'+as22GradesInfo(visibleGrades)+arGradeView(visibleGrades)+
 '<h3>أوراق التقييم التي يستطيع الطالب رؤيتها الآن</h3>'+
 arPaperRows(visiblePapers)+
 '<p class="as22-tip">بيانات هذا العرض مطابقة لصلاحيات النشر الحالية، وقد تختلف عن الدرجات غير المعتمدة الموجودة في ملف الإدارة أسفله.</p></section>';
}
function as22DemoWindow(){
 if(!as22Allowed())return;
 const html='<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>حساب الطالب التجريبي — آفاق ماث</title>'+
 '<style>body{margin:0;padding:27px;direction:rtl;font-family:Tahoma,Arial,sans-serif;background:#eff7fb;color:#153e68}main{max-width:850px;margin:auto;background:white;padding:29px;border:2px solid #e2c27b;border-radius:20px}h1{color:#194d80}span{background:#ffedcd;padding:7px;border-radius:8px}article{border:1px solid #cddfec;border-radius:10px;padding:14px;margin:12px 0}.blank{color:#798ea0}button{padding:11px;border-radius:8px}</style></head><body><main>'+
 '<span>حساب تجريبي للمشرف الرئيسي والمساعد فقط</span><h1>👨‍🎓 واجهة الطالب التجريبية</h1>'+
 '<p>هذا العرض تعليمي توضيحي، وليس حساب طالب حقيقيًا؛ لا يفتح جلسة باسم طالب ولا يستطيع تغيير درجات أو محاولات أو كلمات مرور.</p>'+
 '<article><h3>درجاتي من ١٠٠</h3><p class="blank">لا توجد بيانات طالب حقيقية. تُعرض الدرجات هنا عند اعتمادها والسماح بنشرها.</p></article>'+
 '<article><h3>أوراق التقييم</h3><p class="blank">تُظهر المنصة الملفات المرفوعة المصرّح للطالب بعرضها فقط.</p></article>'+
 '<article><h3>محتوى آفاق ماث</h3><p>الأعداد • القياس • الهندسة • التدريب • نجوم آفاق الرياضيات.</p></article>'+
 '<button onclick="window.close()">إغلاق المعاينة</button></main></body></html>';
 const popup=window.open('','_blank','width=900,height=780');
 if(!popup){AS22.message='اسمح بفتح نافذة معاينة الطالب التجريبي من المتصفح.';render();return}
 popup.document.open();popup.document.write(html);popup.document.close();popup.focus();
}
function as22ReferralPrint(note,student,autoPrint=false){
 if(!as22Allowed()||!note)return;
 const notes=(Array.isArray(note)?note:[note]).filter(Boolean);
 if(!notes.length)return;
 const safe=as22T,school='مدرسة الحسين بن علي للتعليم الأساسي';
 const sheets=notes.map(n=>'<article class="referral-sheet"><header>'+
  '<b>سلطنة عُمان — وزارة التربية والتعليم</b><h1>خطاب إحالة ملاحظة مدرسية</h1><div>'+safe(school)+'</div></header>'+
  '<p>التاريخ: <strong>'+safe(n.note_date)+'</strong></p>'+
  '<p>نوع الملاحظة: <b>'+safe(arCategories.find(x=>x[0]===n.category)?.[1]||n.category||'مدرسية')+'</b></p>'+
  '<p>إلى الفاضل/ة: <b>'+safe(n.referred_to||'الجهة المختصة')+'</b> المحترم/ة</p>'+
  '<p>الموضوع: إحالة ملاحظة بشأن الطالب <b>'+safe(student?.full_name||student?.display_name||'.....................')+
  '</b> — '+safe(student?.class_name||n.class_name)+'</p>'+
  '<p>تحية طيبة وبعد ،</p><p>نفيدكم بأن الملاحظة التالية قد سُجلت بتاريخ أعلاه للمتابعة التربوية المناسبة:</p>'+
  '<p><b>وصف الملاحظة:</b> '+safe(n.description)+'</p>'+
  '<p><b>الإجراء المتبع:</b> '+safe(n.action_taken||'قيد التحديد')+'</p>'+
  '<p><b>حالة الإحالة في السجل:</b> '+safe(n.referral_status||'draft')+'</p>'+
  '<p>نرجو التكرم بالاطلاع واتخاذ ما ترونه مناسبًا وفق الإجراءات المدرسية المعتمدة، مع إفادتنا بنتيجة المتابعة.</p>'+
  '<div class="sign">اسم المُحيل: ............................................<br>التوقيع: ............................................<br>الاستلام والتاريخ: ............................................</div>'+
  '<div class="admin-followup"><p><b>تعقيب الإدارة في الإجراء المتبع :</b></p>'+
  '<div class="admin-followup-lines">..............................................................................................................................</div>'+
  '<div class="admin-followup-meta"><span>التوقيع : ................................</span><span>الختم : ................................</span></div></div>'+
  '</article>').join('');
 const html='<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>خطاب إحالة ملاحظة مدرسية</title>'+
 '<style>body{font:17px/2 Tahoma,Arial,sans-serif;color:#193c61;padding:35px;direction:rtl}header{text-align:center;border-bottom:2px solid #c4a165;padding-bottom:15px}h1{font-size:26px;color:#153d78}p{margin:11px 0}.sign{margin-top:47px}.admin-followup{margin-top:28px;border-top:1px solid #c5d5df;padding-top:12px;break-inside:avoid}.admin-followup p{margin:0 0 8px}.admin-followup-lines{min-height:50px;overflow:hidden;white-space:nowrap;color:#8397a6}.admin-followup-meta{display:flex;justify-content:space-between;gap:25px;flex-wrap:wrap;margin-top:10px;font-weight:bold}.toolbar{margin:18px;padding:9px}.referral-sheet+.referral-sheet{margin-top:35px;border-top:2px solid #c5d5df;padding-top:20px}button{padding:11px;background:#184e7e;color:#fff;border:0;border-radius:8px}@media print{.toolbar{display:none}.referral-sheet{break-after:page;page-break-after:always}.referral-sheet:last-child{break-after:auto;page-break-after:auto}.referral-sheet+.referral-sheet{margin-top:0;border-top:0;padding-top:0}}@page{size:A4 portrait;margin:17mm}</style>'+
 '</head><body><main>'+sheets+'</main>'+
 '<div class="toolbar"><button onclick="window.print()">طباعة / حفظ PDF</button></div></body></html>';
 const popup=window.open('','_blank','width=900,height=800');
 if(!popup){AS22.message='اسمح بفتح نافذة خطاب الإحالة.';render();return}
 popup.document.open();
 popup.document.write(html);
 if(autoPrint)popup.onload=()=>{popup.focus();popup.print()};
 popup.document.close();popup.focus();
}
const as22PreviousAdmin=arAdminPage;
arAdminPage=function(){
 let html=as22PreviousAdmin();
 if(!as22Allowed())return html;
 html=html.replace(/<div class="ar-demo-note">[\s\S]*?<\/div>/,
 '<div class="ar-demo-note">👨‍🎓 حساب الطالب التجريبي — للمشرف الرئيسي والمساعد فقط: '+
 '<button type="button" id="as22OpenDemo">فتح عرض الطالب التجريبي</button></div>');
 if(AR.current?.student){
  html=html.replace('<section class="ar-card ar-preview">',as22StudentMirror()+'<section class="ar-card ar-preview">');
 }
 return html;
};
const as22PreviousStudentSection=arStudentSection;
arStudentSection=function(){
 const html=as22PreviousStudentSection();
 if(!arStudent())return html;
 return html.replace('<h3>الدرجات المنشورة</h3>',as22GradesInfo(AR.myPanel?.grades||[])+'<h3>الدرجات المنشورة</h3>');
};
function as22BehaviorGradeCard(){
 if(!as22Allowed()||!auth.selectedStudent)return '';
 const id=auth.selectedStudent;
 if(AS22.editingStudent&&AS22.editingStudent!==id){AS22.editingId=null;AS22.editingStudent=''}
 const match=(auth.students||AR.roster||[]).find(x=>x.student_id===id);
 const notes=AR.notes.filter(x=>x.student_id===id&&['behavior','daily'].includes(x.category));
 const editing=notes.find(n=>String(n.id)===String(AS22.editingId))||null;
 return '<section class="ar-card as22-gradebook" data-as22-student="'+as22T(id)+'">'+
 '<div class="as22-gr-head"><span>📝</span><div><h3>الملاحظات السلوكية واليومية — ضمن سجل درجات الطالب</h3>'+
 '<p>'+as22T(match?.full_name||match?.display_name||'الطالب المحدد')+' • سجلات خاصة لا تظهر في درجاته المنشورة. قابلة للإضافة والتعديل والأرشفة.</p></div></div>'+
 (AS22.message?'<p class="as22-tip" role="status">'+as22T(AS22.message)+'</p>':'')+
 (!AR.loaded?'<p>جارٍ تحميل السجل السلوكي المحمي ...</p>':'')+
 '<form id="as22BehaviorForm" class="as22-behavior-form">'+
 '<label>تاريخ الواقعة<input type="date" name="note_date" required value="'+as22T(editing?.note_date||arToday())+'"></label>'+
 '<label class="wide">الملاحظة السلوكية<textarea name="description" maxlength="2000" minlength="3" rows="2" required placeholder="تدوين الواقعة بطريقة موضوعية">'+as22T(editing?.description||'')+'</textarea></label>'+
 '<label class="wide">الإجراء المتبع<textarea name="action_taken" maxlength="1000" rows="2" placeholder="تنبيه تربوي • متابعة • خطة تعديل سلوك">'+as22T(editing?.action_taken||'')+'</textarea></label>'+
 '<label>الجهة المطلوب إحالة الملاحظة إليها<input name="referred_to" maxlength="160" value="'+as22T(editing?.referred_to||'')+'" placeholder="الإدارة المدرسية / الأخصائي الاجتماعي"></label>'+
 '<label>حالة الإحالة<select name="referral_status">'+[['draft','قيد المعالجة'],['referred','مُعدّ للإحالة'],['resolved','تمت المعالجة'],['closed','مغلقة']].map(([v,l])=>
 '<option value="'+v+'"'+((editing?.referral_status||'draft')===v?' selected':'')+'>'+l+'</option>').join('')+'</select></label>'+
 '<label class="check"><input name="guardian_invitation" type="checkbox"'+(editing?.guardian_invitation?' checked':'')+'> مطلوب استدعاء ولي الأمر</label>'+
 '<div class="as22-gr-actions"><button type="submit"'+(AS22.busy?' disabled':'')+'>'+
 (editing?'حفظ تعديل الملاحظة':'إضافة الملاحظة إلى سجل درجات الطالب')+'</button>'+
 (editing?'<button type="button" id="as22CancelEdit">إلغاء التعديل</button>':'')+
 '<button type="button" data-tab="afaq_student_records">فتح سجل المدرسة والمتابعة</button></div></form>'+
 '<div class="as22-behavior-rows">'+(notes.length?notes.map(n=>
 '<article><strong>'+(n.category==='daily'?'يومية':'سلوكية')+' • '+as22T(n.note_date)+'</strong><p>'+as22T(n.description)+'</p>'+
 '<p><b>الإجراء:</b> '+as22T(n.action_taken||'قيد المتابعة')+'</p>'+
 (n.referred_to?'<small>الجهة: '+as22T(n.referred_to)+'</small>':'')+
 '<div class="as22-gr-actions"><button type="button" data-as22-edit="'+as22T(n.id)+'">تعديل</button>'+
 '<button type="button" data-as22-archive="'+as22T(n.id)+'">حذف من السجل النشط</button>'+
 '<button type="button" data-as22-guardian="'+as22T(n.id)+'">استدعاء ولي الأمر</button>'+
 '<button type="button" data-as22-referral="'+as22T(n.id)+'">طباعة الإحالة</button></div></article>').join(''):
 '<p class="as22-tip">لا توجد ملاحظات سلوكية أو يومية مسجلة لهذا الطالب حتى الآن.</p>')+'</div></section>';
}
/* Clearly visible trial account on both supervisor and assistant main dashboards. */
const as22PreviousStaffHome=hubStaffDashboard;
hubStaffDashboard=function(){
 const html=as22PreviousStaffHome();
 if(!as22Allowed())return html;
 const shortcut='<section class="as22-demo-teaser" aria-label="حساب الطالب التجريبي">'+
 '<span>👨‍🎓</span><div><strong>حساب الطالب التجريبي</strong>'+
 '<p>معاينة آمنة لواجهة الطالب دون الدخول باسم أي طالب حقيقي ودون التأثير في درجاته.</p></div>'+
 '<button type="button" id="as22DashboardDemo">فتح الطالب التجريبي</button></section>';
 return html.replace('<section class="hub-main hub-staff-stats">',shortcut+'<section class="hub-main hub-staff-stats">');
};
const as22PreviousStudentAdmin=studentAdmin;
studentAdmin=function(){
 const base=as22PreviousStudentAdmin();
 if(!as22Allowed()||!auth.selectedStudent)return base;
 arReset();
 if(!AR.loaded&&!AR.loading){
  const chosen=auth.selectedStudent;AR.selected=chosen;
  Promise.resolve().then(async()=>{
   await arLoadAdmin();
   if(auth.selectedStudent===chosen&&state.page==='dashboard'&&auth.section==='students')render();
  });
 }
 return base+as22BehaviorGradeCard();
};
async function as22RefreshAndRender(){
 AR.loaded=false;
 await arLoadAdmin();
 render();
}
/* Open the same protected student grades and notes from the serial number,
   removing the behavior link that previously crowded each student's name. */
const as22PreviousOfficialRow=ofRow;
ofRow=function(student){
 const html=as22PreviousOfficialRow(student);
 if(!as22Allowed())return html;
 const oldCell='<th class="of-serial">'+ofNumber(student.serial_no)+'</th>';
 if(!html.includes(oldCell))return html;
 const serial=as22T(student.serial_no);
 const button='<button type="button" class="as22-official-serial" data-as22-official-note="'+
  serial+'" data-as22-official-class="'+as22T(ofState.className)+'"'+
  ' aria-label="فتح ملف درجات وملاحظات الطالب رقم '+serial+'"'+
  ' title="فتح ملف درجات الطالب وملاحظاته">'+ofNumber(student.serial_no)+'</button>';
 return html.replace(oldCell,'<th class="of-serial">'+button+'</th>');
};
const as22PreviousAttachPortal=attachPortal;
attachPortal=function(){
 as22PreviousAttachPortal();
 document.getElementById('as22OpenDemo')?.addEventListener('click',as22DemoWindow);
 document.getElementById('as22DashboardDemo')?.addEventListener('click',as22DemoWindow);
 document.querySelectorAll('[data-ar-referral]').forEach(btn=>btn.addEventListener('click',()=>{
  const n=AR.notes.find(x=>String(x.id)===btn.dataset.arReferral);
  if(n)as22ReferralPrint(n,AR.roster.find(x=>x.student_id===n.student_id));
 }));
 if(!as22Allowed())return;
 document.querySelectorAll('[data-as22-official-note]').forEach(button=>button.addEventListener('click',async()=>{
  const serial=Number(button.dataset.as22OfficialNote);
  const className=button.dataset.as22OfficialClass;
  try{
   if(!AR.roster.length){
    const roster=await arCall('staff_roster');AR.roster=roster.students||[];
   }
   const student=AR.roster.find(x=>Number(x.serial_no)===serial&&x.class_name===className);
   if(!student){window.alert('تعذر تحديد الطالب من كشف الدرجات الرسمي.');return}
   AR.selected=student.student_id;auth.selectedStudent=student.student_id;
   AS22.editingId=null;AS22.editingStudent='';
   auth.section='afaq_student_records';
   if(!AR.loaded){await arLoadAdmin()}else{await arPreview(student.student_id,false)}
   render();
  }catch(e){AS22.message=e.message;window.alert('تعذر فتح السجل السلوكي: '+e.message)}
 }));
 const form=document.getElementById('as22BehaviorForm');
 if(!form)return;
 if(!AR.loaded&&!AR.loading)Promise.resolve().then(arLoadAdmin);
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(AS22.busy||!auth.selectedStudent)return;
  const f=event.currentTarget;const sid=auth.selectedStudent;AS22.busy=true;AS22.message='جارٍ حفظ الملاحظة ...';
  try{
   await arCall('note_save',{id:AS22.editingId||'',student_id:sid,category:'behavior',
    note_date:f.elements.note_date.value,description:f.elements.description.value,
    action_taken:f.elements.action_taken.value,referred_to:f.elements.referred_to.value,
    referral_status:f.elements.referral_status.value,guardian_invitation:f.elements.guardian_invitation.checked});
   AS22.editingId=null;AS22.editingStudent='';AS22.message='حُفظت الملاحظة السلوكية بصورة خاصة مع توثيق العملية.';
   await as22RefreshAndRender();
  }catch(err){AS22.message=err.message}
  finally{AS22.busy=false;if(state.page==='dashboard')render()}
 });
 document.getElementById('as22CancelEdit')?.addEventListener('click',()=>{AS22.editingId=null;AS22.editingStudent='';render()});
 document.querySelectorAll('[data-as22-edit]').forEach(btn=>btn.addEventListener('click',()=>{
  AS22.editingId=btn.dataset.as22Edit;AS22.editingStudent=auth.selectedStudent;render();
  document.getElementById('as22BehaviorForm')?.scrollIntoView({block:'center',behavior:'smooth'});
 }));
 document.querySelectorAll('[data-as22-archive]').forEach(btn=>btn.addEventListener('click',async()=>{
  if(!window.confirm('هل تريد حذف هذه الملاحظة من السجل النشط؟ ستبقى عملية الأرشفة موثقة.'))return;
  try{await arCall('note_delete',{id:btn.dataset.as22Archive});AS22.editingId=null;AS22.message='أُرشفت الملاحظة وأُزيلت من السجل النشط.';await as22RefreshAndRender()}
  catch(err){AS22.message=err.message;render()}
 }));
 document.querySelectorAll('[data-as22-guardian]').forEach(btn=>btn.addEventListener('click',()=>{
  const n=AR.notes.find(x=>String(x.id)===btn.dataset.as22Guardian);
  if(n)arPrintNote(n,AR.roster.find(x=>x.student_id===n.student_id));
 }));
 document.querySelectorAll('[data-as22-referral]').forEach(btn=>btn.addEventListener('click',()=>{
  const n=AR.notes.find(x=>String(x.id)===btn.dataset.as22Referral);
  if(n)as22ReferralPrint(n,AR.roster.find(x=>x.student_id===n.student_id));
 }));
};
