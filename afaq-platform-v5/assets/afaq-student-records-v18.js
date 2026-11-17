/* AFAQMATHS protected student records — school/staff management.
   Deliberately read-only student preview: no impersonation or passwords. */
'use strict';
const AR_API='https://xcwuwflggiwkehzquugz.supabase.co/functions/v1/afaq-student-records-v1';
const arEsc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arNum=n=>new Intl.NumberFormat('ar-OM',{maximumFractionDigits:2}).format(Number(n)||0);
const arToday=()=>new Date(Date.now()+14400000).toISOString().slice(0,10);
const arStaff=()=>['supervisor','supervisor_assistant'].includes(auth.user?.role);
const arOwner=()=>auth.user?.role==='supervisor';
const arStudent=()=>auth.user?.role==='student';
const arTypes=[['diagnostic','التشخيصي'],['oral','الشفوي'],['homework','الواجبات'],['question','الأسئلة القصيرة'],['short_exam','الاختبارات القصيرة'],['project','المشروع'],['final_exam','النهائي'],['total','المجموع من ١٠٠'],['work_samples','أوراق التقييم']];
const arCategories=[['daily','يومية'],['behavior','سلوكية'],['academic','تعليمية'],['attendance','حضور'],['positive','إيجابية'],['other','أخرى']];
const AR={token:'',loaded:false,loading:false,studentLoaded:false,studentLoading:false,roster:[],visibility:{},notes:[],selected:'',current:null,myPanel:null,message:'',error:'',filter:'',activeTab:'student',editing:null,search:'',behaviorOnly:false};
function arReset(){
 if(AR.token===auth.token)return;
 Object.assign(AR,{token:auth.token||'',loaded:false,loading:false,studentLoaded:false,studentLoading:false,roster:[],visibility:{},notes:[],selected:'',current:null,myPanel:null,message:'',error:'',filter:'',activeTab:'student',editing:null,search:'',behaviorOnly:false});
}
async function arCall(action,data={}){
 if(!auth.token)throw Error('الرجاء تسجيل الدخول أولاً.');
 const res=await fetch(AR_API,{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json','Authorization':'Bearer '+auth.token},body:JSON.stringify({action,...data})});
 let obj;try{obj=await res.json()}catch{throw Error('تعذر قراءة استجابة الخادم.')}
 if(!res.ok||!obj.ok){
  const dict={unauthorized:'انتهت جلسة الدخول.',forbidden:'لا تملك صلاحية الاطلاع.',staff_only:'الخيار مخصص للمشرف ومساعده.',
   supervisor_only:'تغيير إعدادات النشر متاح للمشرف الرئيسي فقط.',student_not_found:'الطالب غير موجود.',
   invalid_attachment:'الملف غير صالح. يرجى اختيار PDF أو JPG أو PNG أو WebP بحد أقصى ٥ ميجابايت.',
   invalid_score:'درجة غير صحيحة.',invalid_note:'أكمل بيانات الملاحظة.',invalid_login_name:'اسم المستخدم يجب أن يكون ٣ إلى ٣٢ حرفًا أو رقمًا إنجليزيًا دون مسافات.',
   login_name_taken:'اسم المستخدم مستخدم بالفعل. اختر اسمًا آخر.',server_error:'حدث خطأ في الخادم؛ لم يُحفظ التغيير.'};
  throw Error(dict[obj.error]||'تعذر تنفيذ العملية: '+(obj.error||res.status));
 }
 return obj;
}
function arLoading(){
 return '<p class="ar-info">'+arEsc(AR.loading||AR.studentLoading?'جارٍ تحميل السجلات المؤمّنة ...':AR.error||'اضغط تحديث لعرض السجلات.')+'</p>';
}
async function arLoadMe(){
 arReset();if(!arStudent()||AR.studentLoading)return;
 AR.studentLoading=true;const token=auth.token;
 try{const data=await arCall('my_panel');if(token===auth.token){AR.myPanel=data;AR.studentLoaded=true;AR.error='';}}
 catch(e){if(token===auth.token)AR.error=e.message}
 finally{AR.studentLoading=false;if(token===auth.token&&state.page==='dashboard'&&arStudent())render()}
}
async function arLoadAdmin(){
 arReset();if(!arStaff()||AR.loading)return;
 AR.loading=true;const token=auth.token;
 try{
  const [roster,notes]=await Promise.all([arCall('staff_roster'),arCall('notes_list')]);
  if(token!==auth.token)return;
  AR.roster=roster.students||[];AR.visibility=roster.visibility||{};AR.notes=notes.notes||[];
  AR.loaded=true;AR.error='';
  if(!AR.selected)AR.selected=auth.selectedStudent||AR.roster[0]?.student_id||'';
  if(AR.selected)await arPreview(AR.selected,false);
 }catch(e){if(token===auth.token)AR.error=e.message}
 finally{AR.loading=false;if(token===auth.token&&state.page==='dashboard'&&auth.section==='afaq_student_records')render()}
}
async function arPreview(id,repaint=true){
 if(!arStaff()||!id)return;
 AR.selected=id;AR.current=null;
 const token=auth.token;
 try{const data=await arCall('preview_student',{student_id:id});if(token===auth.token&&AR.selected===id){AR.current=data;AR.error='';}}
 catch(e){if(token===auth.token)AR.error=e.message}
 if(repaint&&token===auth.token&&auth.section==='afaq_student_records')render();
}
function arGradeView(grades){
 if(!grades?.length)return '<p class="ar-info">لم يُنشر أي بند من الدرجات لهذا الطالب بعد.</p>';
 return '<div class="ar-grades">'+grades.map(g=>'<article><b>'+arEsc(g.label)+'</b><strong>'+arNum(g.score)+' / '+arNum(g.max)+'</strong>'+
 '<small>'+arEsc(g.source==='official'?'السجل الرسمي':'السجل السابق')+(g.term?' • الفصل '+arNum(g.term):'')+'</small></article>').join('')+'</div>';
}
function arPaperRows(rows,supervised=false){
 if(!rows?.length)return '<p class="ar-info">لا توجد أوراق تقييم مرفوعة حاليًا.</p>';
 return '<div class="ar-paper-list">'+rows.map(p=>
 '<article><div><strong>'+arEsc(p.title)+'</strong><small>'+arEsc(p.category)+' • '+arEsc((p.created_at||'').slice(0,10))+
 (p.score==null?'':' • '+arNum(p.score)+' / '+arNum(p.max_score))+'</small></div>'+
 '<button type="button" data-ar-paper-url="'+arEsc(p.id)+'">عرض الورقة</button>'+
 (supervised&&arOwner()?'<button type="button" data-ar-paper-toggle="'+arEsc(p.id)+'" data-visible="'+(!p.visible_to_student)+'">'+(p.visible_to_student?'إخفاء':'إظهار')+'</button>'+
 '<button type="button" data-ar-paper-delete="'+arEsc(p.id)+'" class="ar-danger">حذف</button>':'')+
 (supervised?'<span class="ar-small">'+(p.visible_to_student?'مرئية بعد السماح العام':'مخفية عن الطالب')+'</span>':'')+'</article>').join('')+'</div>';
}
function arStudentSection(){
 arReset();
 if(!AR.studentLoaded&&!AR.studentLoading)Promise.resolve().then(arLoadMe);
 const d=AR.myPanel;
 return '<section class="ar-student-card"><h2>📋 درجاتي وأوراق التقييم</h2>'+
 '<p>تظهر هنا البنود التي اعتمدت ونُشرت بإذن المشرف، مع درجة كل عنصر ودرجته العظمى. لا يعني عدم ظهور بند أن درجتك فيه صفر.</p>'+
 (d?'<p class="ar-info">اسم المستخدم الحالي: <strong dir="ltr">'+arEsc(d.student.login_name)+'</strong></p>'+
 '<form id="arChangeLogin" class="ar-inline"><label>تغيير اسم المستخدم (اختياري)<input name="login" required minlength="3" maxlength="32" value="'+arEsc(d.student.login_name)+'" autocapitalize="none" autocomplete="off" pattern="[A-Za-z0-9][A-Za-z0-9._-]{2,31}"></label>'+
 '<button type="submit">حفظ اسم المستخدم</button></form>'+
 '<h3>الدرجات المنشورة</h3>'+arGradeView(d.grades)+'<h3>أوراق التقييم المنشورة</h3>'+arPaperRows(d.papers):
 arLoading())+
 '<p class="ar-info" role="status">'+arEsc(AR.message||AR.error)+'</p></section>';
}
function arStudentOptions(){
 return '<option value="">اختر الطالب</option>'+AR.roster.map(x=>'<option value="'+arEsc(x.student_id)+'"'+(AR.selected===x.student_id?' selected':'')+'>'+
 arEsc(x.full_name||x.display_name)+' — '+arEsc(x.class_name)+' — '+arEsc(x.login_name)+'</option>').join('');
}
function arVisibility(){
 return '<section class="ar-card"><h2>🔐 التحكم في نشر درجات الطلاب</h2>'+
 '<p>النشر مغلق افتراضيًا. ينطبق السماح على البنود المعتمدة فقط، ولا يُظهر مسودات الدرجات. لا يُنشر أي ملف إلا بعد تفعيل فئة الأوراق والسماح بإظهار الملف نفسه.</p>'+
 '<div class="ar-toggles">'+arTypes.map(([key,name])=>
 '<div><strong>'+name+'</strong><span class="ar-status '+(AR.visibility[key]?.visible?'yes':'no')+'">'+(AR.visibility[key]?.visible?'ظاهر للطلاب':'مخفي')+'</span>'+
 (arOwner()?'<button type="button" data-ar-visibility="'+key+'" data-show="'+(!AR.visibility[key]?.visible)+'">'+
 (AR.visibility[key]?.visible?'إخفاء':'إظهار')+'</button>':'')+'</div>').join('')+'</div></section>';
}
function arDocuments(){
 return '<section class="ar-card"><h2>📄 رفع أوراق التقييم الخاصة بالطالب</h2>'+
 '<p>ارفع ورقة سؤال قصير أو اختبار قصير أو تقييم شفوي مصحّح، بصورة أو PDF. الملفات خاصة وغير مرئية للطالب حتى يسمح المشرف الرئيسي بنشرها.</p>'+
 '<form class="ar-form ar-upload" id="arUploadPaper"><label>اسم الورقة<input name="title" required minlength="2" maxlength="160" placeholder="اختبار قصير ٢ — ورقة الطالب"></label>'+
 '<label>نوع التقييم<select name="category">'+arTypes.filter(x=>!['total','work_samples'].includes(x[0])).map(([key,title])=>'<option value="'+key+'">'+title+'</option>').join('')+
 '<option value="other">تقييم آخر</option></select></label>'+
 '<label>الدرجة المحققة (اختياري)<input name="score" type="number" min="0" max="100" step="0.5" placeholder="مثال: ٨"></label>'+
 '<label>الدرجة العظمى (اختياري)<input name="max_score" type="number" min="1" max="100" step="0.5" placeholder="مثال: ١٠"></label>'+
 '<label>الملف<input type="file" name="attachment" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" required></label>'+
 '<button type="submit">رفع الورقة وحفظها بصورة خاصة</button></form>'+
 '<h3>الأوراق المحفوظة للطالب</h3>'+arPaperRows(AR.current?.papers||[],true)+'</section>';
}
function arNoteForm(){
 const n=AR.editing||{};
 return '<section class="ar-card"><h2>📝 '+(n.id?'تعديل الملاحظة المدرسية':'إضافة ملاحظة مدرسية يومية أو سلوكية')+'</h2>'+
 '<p>السجلات خاصة بالمشرف ومساعده، وتوثّق الواقعة وإجراء المعالجة والجهة المحال إليها. الإحالة هنا للتوثيق وإعداد الخطاب، ولا ترسل البيانات تلقائيًا إلى جهات خارجية.</p>'+
 '<form id="arNoteForm" class="ar-form">'+
 '<label>التاريخ<input type="date" name="note_date" required value="'+arEsc(n.note_date||arToday())+'"></label>'+
 '<label>التصنيف<select name="category">'+arCategories.map(([k,t])=>'<option value="'+k+'"'+(n.category===k?' selected':'')+'>'+t+'</option>').join('')+'</select></label>'+
 '<label class="ar-wide">وصف الواقعة أو الملاحظة<textarea name="description" required minlength="3" maxlength="2000" rows="3" placeholder="اكتب ملاحظة موضوعية، دقيقة، قابلة للتوثيق">'+arEsc(n.description||'')+'</textarea></label>'+
 '<label class="ar-wide">الإجراء التربوي المتبع<textarea name="action_taken" maxlength="1000" rows="2" placeholder="حوار • تنبيه • خطة متابعة • إشراك ولي الأمر">'+arEsc(n.action_taken||'')+'</textarea></label>'+
 '<label>الجهة المحال إليها<input name="referred_to" maxlength="160" value="'+arEsc(n.referred_to||'')+'" placeholder="الإدارة المدرسية أو الأخصائي الاجتماعي ..."></label>'+
 '<label>حالة الإحالة<select name="referral_status">'+[['draft','قيد المعالجة'],['referred','تمت الإحالة'],['resolved','تم الحل'],['closed','مغلق']].map(([k,t])=>'<option value="'+k+'"'+(n.referral_status===k?' selected':'')+'>'+t+'</option>').join('')+'</select></label>'+
 '<label class="ar-checkbox"><input type="checkbox" name="guardian_invitation"'+(n.guardian_invitation?' checked':'')+'> مطلوب استدعاء ولي الأمر</label>'+
 '<div class="ar-buttons"><button type="submit">'+(n.id?'حفظ التعديل':'إضافة الملاحظة إلى السجل')+'</button>'+
 (n.id?'<button type="button" id="arCancelEdit">إلغاء التعديل</button>':'')+'</div></form></section>';
}
function arPrintNote(note,student){
 const safe=s=>arEsc(s||'');
 const studentName=safe(student?.full_name||student?.display_name||'................................');
 const html='<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>طلب حضور ولي أمر</title>'+
 '<style>body{font:18px Tahoma,Arial;padding:45px;color:#182f4b;line-height:2.2}h1{text-align:center;font-size:29px;color:#163f77}p{margin:18px 0}.sig{margin-top:70px}small{display:block;text-align:center}@media print{button{display:none}}</style></head><body>'+
 '<small>سلطنة عُمان • وزارة التربية والتعليم</small><h1>إشعار لولي الأمر بطلب الحضور</h1>'+
 '<p>التاريخ: '+safe(note.note_date)+'</p>'+
 '<p>ولي أمر الطالب: <b>'+studentName+'</b> — '+safe(student?.class_name||note.class_name)+'</p>'+
 '<p>تحية طيبة وبعد ،</p>'+
 '<p>نرجو منكم التكرم بالحضور إلى المدرسة للتشاور بشأن متابعة الطالب تربويًا، والتعاون في وضع الخطوات المناسبة لدعم تقدمه وانضباطه.</p>'+
 '<p>موعد الحضور المقترح: .................................................</p>'+
 '<p>ملاحظات لولي الأمر: ..................................................</p>'+
 '<p class="sig">المعلم / المختص: ..........................................<br>توقيع الإدارة: ....................................................</p>'+
 '<small>وثيقة متابعة تربوية — تُحفظ وتُتداول بسرية</small><button onclick="print()">طباعة / حفظ PDF</button></body></html>';
 const w=window.open('','_blank','width=850,height=850');if(!w){AR.message='يرجى السماح بالنوافذ المنبثقة لطباعة الخطاب.';return}
 w.document.open();w.document.write(html);w.document.close();w.focus();
}
function arNotesTable(){
 const xs=AR.notes.filter(n=>(!AR.selected||n.student_id===AR.selected)&&(!AR.behaviorOnly||n.category==='behavior'));
 const student=AR.roster.find(x=>x.student_id===AR.selected);
 const behavior=AR.notes.filter(n=>n.category==='behavior'&&n.student_id);
 const flagged=[...new Map(behavior.map(n=>[n.student_id,AR.roster.find(s=>s.student_id===n.student_id)])).entries()].filter(x=>x[1]);
 return '<section class="ar-card"><h2>⚠️ سجل المتابعة السلوكية والملاحظات اليومية</h2>'+ 
 '<div class="ar-behavior-list"><h3>طلاب لديهم ملاحظات سلوكية مسجلة</h3>'+ 
 (flagged.length?'<div class="ar-behavior-rows">'+flagged.map(([id,person])=>{const last=behavior.find(n=>n.student_id===id);return '<article><strong>'+arEsc(person.full_name||person.display_name)+'</strong><small>'+arEsc(person.class_name)+' • '+arEsc(last?.note_date||'')+'</small><p>'+arEsc(last?.action_taken||'الإجراء قيد التحديد')+'</p><button type="button" data-ar-select-behavior="'+arEsc(id)+'">فتح الملاحظات والإجراءات</button></article>'}).join('')+'</div>':'<p class="ar-info">لا توجد أسماء في قائمة الملاحظات السلوكية.</p>')+'</div>'+ 
 '<div class="ar-inline"><button type="button" id="arShowAllNotes">إظهار الملاحظات المدرسية لجميع الطلاب</button>'+
 '<button type="button" id="arShowBehavior">قائمة الطلاب غير المنضبطين سلوكيًا</button></div>'+
 '<div class="ar-notes">'+(xs.length?xs.map(n=>'<article class="ar-note-item">'+
 '<div><strong>'+arEsc(arCategories.find(x=>x[0]===n.category)?.[1]||n.category)+'</strong>'+
 '<small>'+arEsc(n.note_date)+' • '+arEsc(n.referral_status)+(n.referred_to?' • '+arEsc(n.referred_to):'')+'</small></div>'+
 '<p>'+arEsc(n.description)+'</p>'+(n.action_taken?'<p><b>الإجراء:</b> '+arEsc(n.action_taken)+'</p>':'')+
 '<div class="ar-buttons"><button type="button" data-ar-edit="'+n.id+'">تعديل</button>'+
 '<button type="button" data-ar-archive="'+n.id+'" class="ar-danger">حذف من السجل النشط</button>'+
 '<button type="button" data-ar-parent="'+n.id+'">استدعاء ولي الأمر • طباعة / PDF</button>'+
 '<button type="button" data-ar-referral="'+n.id+'">إعداد خطاب إحالة • طباعة / PDF</button></div></article>').join(''):
 '<p class="ar-info">لا توجد ملاحظات في هذا العرض.</p>')+'</div></section>';
}
function arAdminPage(){
 arReset();
 if(!arStaff())return '<p class="ar-info">هذه البيانات محمية ومخصصة للمشرف ومساعده.</p>';
 if(!AR.loaded&&!AR.loading)Promise.resolve().then(arLoadAdmin);
 const s=AR.current?.student;
 return '<div class="container ar-admin" dir="rtl">'+
 (typeof hubStaffNav==='function'?hubStaffNav():'')+
 '<header class="ar-admin-head"><span>🔐 سجلات الطلاب المحمية</span><h1>إدارة ملفات الطلاب والدرجات والملاحظات</h1>'+
 '<p>عرض حساب الطالب دون رقم سري • نشر الدرجات • رفع الأوراق المصححة • السلوك والإحالات • استدعاء ولي الأمر</p>'+
 '<div class="ar-buttons"><button type="button" id="arRefresh">تحديث البيانات</button>'+
 '<button type="button" data-tab="overview">العودة إلى لوحة المشرف</button></div></header>'+
 '<div class="ar-feedback" role="status">'+arEsc(AR.message||AR.error)+'</div>'+
 (AR.loaded?'<section class="ar-card"><h2>اختيار حساب الطالب للمتابعة المباشرة</h2>'+
 '<p>اختر طالبًا لتفتح ملفه للقراءة والمتابعة دون طلب الرقم السري ودون تغيير هويته أو نتائج الاختبار.</p>'+
 '<label class="ar-field">الطالب<select id="arSelectStudent">'+arStudentOptions()+'</select></label>'+
 '<div class="ar-demo-note">حساب الطالب التجريبي (للمشرف فقط): <button type="button" id="arDemoView"'+(arOwner()?'':' disabled')+'>معاينة تجريبية آمنة دون تسجيل دخول كطالب</button></div></section>'+
 (AR.current?'<section class="ar-card ar-preview"><h2>ملف الطالب — عرض وإدارة</h2><p><b>'+arEsc(s?.full_name||s?.display_name)+
 '</b> • '+arEsc(s?.class_name)+' • الرقم '+arNum(s?.serial_no)+' • اسم الدخول <b dir="ltr">'+arEsc(s?.login_name)+'</b></p>'+
 '<h3>الدرجات المسجلة (غير منشورة تلقائيًا)</h3>'+arGradeView(AR.current.grades)+'</section>':arLoading())+
 arVisibility()+arDocuments()+arNoteForm()+arNotesTable():arLoading())+'</div>';
}
const arOriginalStaffPanel=staffPanel;
staffPanel=function(){
 if(auth.section==='afaq_student_records')return arAdminPage();
 return arOriginalStaffPanel();
};
const arOriginalPersonal=personalPanel;
personalPanel=function(p){
 const html=arOriginalPersonal(p);
 return arStudent()?html+arStudentSection():html;
};
const arOriginalHubNav=hubStaffNav;
hubStaffNav=function(){
 const html=arOriginalHubNav();
 if(!arStaff())return html;
 return html.replace('</div>','<button class="'+(auth.section==='afaq_student_records'?'selected':'')+
 '" type="button" data-tab="afaq_student_records">📋 ملفات الطلاب والسلوك</button></div>');
};
const arOriginalHubDashboard=hubStaffDashboard;
hubStaffDashboard=function(){
 const html=arOriginalHubDashboard();
 if(!arStaff())return html;
 const banner='<section class="ar-admin-teaser"><span>📋</span><div><b>ملفات الطلاب والدرجات والسلوك</b>'+
 '<p>معاينة حساب الطالب دون كلمة مرور • نشر نتائج التقييم • أوراق مصححة • سجل ملاحظات وإحالات</p></div>'+
 '<button type="button" data-tab="afaq_student_records">فتح مركز سجلات الطلاب</button></section>';
 return html.replace('<section class="hub-main hub-staff-stats">',banner+'<section class="hub-main hub-staff-stats">');
};
const arOriginalStudentAdmin=studentAdmin;
studentAdmin=function(){
 const html=arOriginalStudentAdmin();
 if(!arStaff())return html;
 return html+'<section class="ar-score-link"><button type="button" data-tab="afaq_student_records">📝 الملاحظات السلوكية وأوراق التقييم للطالب</button></section>';
};
async function arRefresh(){
 const selected=AR.selected;AR.loaded=false;AR.message='';AR.error='';
 await arLoadAdmin();
 if(selected&&AR.selected!==selected)await arPreview(selected);
}
function arFileAsBase64(file){
 return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(Error('تعذر قراءة الملف.'));
 reader.onload=()=>resolve(String(reader.result||'').split(',')[1]||'');reader.readAsDataURL(file)});
}
const arOriginalAttachPortal=attachPortal;
attachPortal=function(){
 arOriginalAttachPortal();
 document.getElementById('arRefresh')?.addEventListener('click',arRefresh);
 document.getElementById('arSelectStudent')?.addEventListener('change',e=>{AR.selected=e.target.value;AR.editing=null;arPreview(AR.selected)});
 document.getElementById('arDemoView')?.addEventListener('click',()=>{
  if(!arOwner())return;
  AR.message='الحساب التجريبي متاح للمشرف في وضع معاينة فقط؛ لا يمكنه إنشاء درجات فعلية أو تجاوز كلمة مرور طالب.';
  render();
 });
 document.getElementById('arChangeLogin')?.addEventListener('submit',async e=>{
  e.preventDefault();const value=e.target.elements.login.value.trim();
  try{const res=await arCall('set_my_login',{login_name:value});AR.message='تم حفظ اسم المستخدم الجديد: '+res.login_name;await arLoadMe()}
  catch(err){AR.message=err.message;render()}
 });
 document.querySelectorAll('[data-ar-visibility]').forEach(b=>b.addEventListener('click',async()=>{
  if(!arOwner())return;try{await arCall('grade_visibility',{category:b.dataset.arVisibility,visible:b.dataset.show==='true'});
  AR.message='تم تحديث صلاحية نشر النتائج.';await arRefresh()}catch(e){AR.message=e.message;render()}
 }));
 document.getElementById('arUploadPaper')?.addEventListener('submit',async e=>{
  e.preventDefault();if(!AR.selected)return;
  const f=e.target,fl=f.elements.attachment.files?.[0];if(!fl||fl.size>5242880){AR.message='اختر ملفًا حتى ٥ ميجابايت.';render();return}
  const types=['application/pdf','image/jpeg','image/png','image/webp'];
  if(!types.includes(fl.type)){AR.message='الملف يجب أن يكون PDF أو صورة.';render();return}
  AR.message='جارٍ رفع الملف الخاص بصورة محمية ...';const status=document.querySelector('.ar-feedback');if(status)status.textContent=AR.message;
  try{const base64=await arFileAsBase64(fl);const n=f.elements.score.value,max=f.elements.max_score.value;
   await arCall('paper_upload',{student_id:AR.selected,title:f.elements.title.value,category:f.elements.category.value,mime_type:fl.type,
    score:n===''?null:Number(n),max_score:max===''?null:Number(max),base64});
   AR.message='تم حفظ الورقة بصورة خاصة. لم تُنشر للطالب.';await arPreview(AR.selected)}
  catch(err){AR.message=err.message;render()}
 });
 document.querySelectorAll('[data-ar-paper-url]').forEach(b=>b.addEventListener('click',async()=>{
  const popup=window.open('about:blank','_blank'); // Open synchronously to avoid pop-up blocking.
  try{const r=await arCall('paper_url',{id:b.dataset.arPaperUrl});if(popup)popup.location.replace(r.url);else window.location.assign(r.url)}
  catch(err){popup?.close();AR.message=err.message;render()}
 }));
 document.querySelectorAll('[data-ar-paper-toggle]').forEach(b=>b.addEventListener('click',async()=>{
  if(!arOwner())return;try{await arCall('paper_toggle',{id:b.dataset.arPaperToggle,visible:b.dataset.visible==='true'});AR.message='تم تحديث ظهور الورقة.';await arPreview(AR.selected)}
  catch(err){AR.message=err.message;render()}
 }));
 document.querySelectorAll('[data-ar-paper-delete]').forEach(b=>b.addEventListener('click',async()=>{
  if(!arOwner()||!window.confirm('هل تؤكد حذف الورقة المرفوعة؟'))return;
  try{await arCall('paper_delete',{id:b.dataset.arPaperDelete});AR.message='تم حذف الورقة.';await arPreview(AR.selected)}
  catch(err){AR.message=err.message;render()}
 }));
 document.getElementById('arNoteForm')?.addEventListener('submit',async e=>{
  e.preventDefault();const f=e.target;
  const data={id:AR.editing?.id||'',student_id:AR.editing?.student_id||AR.selected,
   note_date:f.elements.note_date.value,category:f.elements.category.value,
   description:f.elements.description.value,action_taken:f.elements.action_taken.value,
   referred_to:f.elements.referred_to.value,referral_status:f.elements.referral_status.value,
   guardian_invitation:f.elements.guardian_invitation.checked};
  try{await arCall('note_save',data);AR.editing=null;AR.message='تم حفظ الملاحظة مع الإجراء والإحالة.';await arRefresh()}
  catch(err){AR.message=err.message;render()}
 });
 document.getElementById('arCancelEdit')?.addEventListener('click',()=>{AR.editing=null;render()});
 document.getElementById('arShowAllNotes')?.addEventListener('click',()=>{AR.selected='';AR.current=null;AR.behaviorOnly=false;render()});
 document.getElementById('arShowBehavior')?.addEventListener('click',()=>{AR.selected='';AR.current=null;AR.behaviorOnly=true;
  const offenders=new Map(AR.notes.filter(n=>n.category==='behavior'&&n.student_id).map(n=>{
   const student=AR.roster.find(x=>x.student_id===n.student_id);
   return [n.student_id,student?.full_name||student?.display_name||'طالب']}));
  const names=[...offenders.values()];AR.message=names.length?'الطلاب المسجلون في سجل الملاحظات السلوكية: '+names.join('، '):'لا توجد ملاحظات سلوكية مسجلة حتى الآن.';
  render();
 });
 document.querySelectorAll('[data-ar-select-behavior]').forEach(b=>b.addEventListener('click',()=>{AR.behaviorOnly=true;AR.selected=b.dataset.arSelectBehavior;arPreview(AR.selected)}));
 document.querySelectorAll('[data-ar-edit]').forEach(b=>b.addEventListener('click',()=>{
  AR.editing=AR.notes.find(n=>n.id===b.dataset.arEdit)||null;render();
  document.getElementById('arNoteForm')?.scrollIntoView({block:'start',behavior:'smooth'});
 }));
 document.querySelectorAll('[data-ar-archive]').forEach(b=>b.addEventListener('click',async()=>{
  if(!window.confirm('هل تؤكد أرشفة هذه الملاحظة من السجل النشط؟'))return;
  try{await arCall('note_delete',{id:b.dataset.arArchive});AR.message='تمت أرشفة الملاحظة، مع حفظ أثر العملية.';await arRefresh()}
  catch(err){AR.message=err.message;render()}
 }));
 document.querySelectorAll('[data-ar-parent]').forEach(b=>b.addEventListener('click',()=>{
  const note=AR.notes.find(x=>x.id===b.dataset.arParent);
  if(!note)return;
  const student=AR.roster.find(x=>x.student_id===note.student_id);
  arPrintNote(note,student);
 }));
};
