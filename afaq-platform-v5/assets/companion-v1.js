'use strict';
/* السجل المصاحب لمعلم الرياضيات ٢٠٢٦/٢٠٢٧ — خاص بالحسابات المدرسية */
const CP_CLASSES=['السادس / ٤','السادس / ٥','السادس / ٦'];
const CP_POS=['المشاركة الإيجابية','الانضباط والالتزام','التعاون ومساعدة الزملاء'];
const CP_NEG=['التحدث دون إذن','الخروج من المقعد دون إذن','تناول الطعام دون إذن','عدم إحضار الأدوات','عدم إنجاز المهام'];
const CP_LEVEL=['متابعة عامة','إثراء','دعم تعليمي'];
const CP_PROFILE=[
 ['strengths','نقاط القوة والتميز'],['learning_needs','المهارات التي تحتاج إلى تحسين'],
 ['enrichment_plan','الخطة الإثرائية والمشاريع التطبيقية'],['support_plan','الخطة العلاجية والخطوات التنفيذية'],
 ['followup_result','نتيجة المتابعة وقياس التحسن'],['descriptive_text','العبارات الوصفية الخاصة بالطالب']
];
const CP_CLASS=[
 ['classroom_rules','قواعد الانضباط الصفي المتفق عليها'],['classroom_management','إجراءات متابعة السلوك والتعزيز الإيجابي'],
 ['enrichment_policy','آليات التعرف إلى الطلاب المجيدين وإثرائهم'],['remedial_policy','آليات الدعم العلاجي والتعلم بالأقران'],
 ['assessment_plan','توزيع الأسئلة والتقويمات والتغذية الراجعة'],['teacher_reflection','التأمل المهني ومؤشرات تحسين الأداء']
];
const cpState={term:1,className:CP_CLASSES[0],tab:'overview',serial:null,report:null,reportKey:'',attemptedKey:'',loading:false,error:'',message:''};
const cpRead=()=>['supervisor','supervisor_assistant','director','deputy'].includes(auth.user?.role);
const cpEdit=()=>['supervisor','supervisor_assistant'].includes(auth.user?.role);
const cpEsc=v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const cpNum=v=>v==null?'—':new Intl.NumberFormat('ar-OM',{maximumFractionDigits:2}).format(Number(v));
const cpKey=()=>cpState.className+'|'+cpState.term;
const cpTerm=()=>cpState.term===1?'الأول':'الثاني';
const cpDate=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Muscat',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const cpStudent=()=>cpState.report?.students?.find(s=>Number(s.serial_no)===Number(cpState.serial));
const cpProfile=s=>cpState.report?.profiles?.find(p=>p.student_id===s?.student_id)||{};
const cpEvents=s=>(cpState.report?.events||[]).filter(x=>x.student_id===s?.student_id);
const cpQuestions=s=>(cpState.report?.questions||[]).filter(x=>x.student_id===s?.student_id);
const cpGrade=s=>cpState.report?.grades?.find(g=>g.student_id===s?.student_id)||{};
function cpGradeTotal(g){
 const fields=['oral_1','oral_2','homework_1','homework_2','question_1','question_2','exam_1','exam_2','project'];
 const present=fields.filter(k=>g[k]!=null),subtotal=present.reduce((n,k)=>n+Number(g[k]),0);
 const total=present.length===9&&g.final_exam!=null?subtotal+Number(g.final_exam):null;
 return {subtotal:present.length?subtotal:null,complete:present.length===9,total,level:total==null?'—':ofLevel(total),diagnostic:g.diagnostic_score??null};
}
async function cpCall(action,data={}){
 if(!auth.token)throw Error('unauthorized');
 const res=await fetch('https://xcwuwflggiwkehzquugz.supabase.co/functions/v1/afaq-companion-2026',{
  method:'POST',cache:'no-store',headers:{'Content-Type':'application/json',Authorization:'Bearer '+auth.token},
  body:JSON.stringify({action,class_name:cpState.className,term:cpState.term,...data})
 });
 let d;try{d=await res.json()}catch{throw Error('تعذّر قراءة استجابة الخدمة')};
 if(!res.ok||!d.ok)throw Error(d.error||'خطأ غير معروف');return d;
}
async function cpLoad(force=false){
 if(!cpRead()||cpState.loading)return;
 const key=cpKey();
 if(!force&&(cpState.reportKey===key||cpState.attemptedKey===key))return;
 cpState.attemptedKey=key;cpState.loading=true;cpState.error='';
 if(cpState.reportKey!==key)cpState.report=null;
 render();
 try{
  const r=await cpCall('class_report');
  if(key!==cpKey())return;
  cpState.report=r.report;cpState.reportKey=key;
  if(!cpState.report.students.some(s=>Number(s.serial_no)===Number(cpState.serial)))
   cpState.serial=cpState.report.students[0]?.serial_no??null;
 }catch(e){if(key===cpKey())cpState.error=e.message||String(e)}
 finally{cpState.loading=false;if(state.page==='dashboard'&&auth.section==='companion_register')render()}
}
const cpInput=(label,name,value='',rows=3)=>'<label class="cp-field"><span>'+label+'</span>'+
 '<textarea name="'+name+'" rows="'+rows+'" '+(!cpEdit()?'disabled':'')+'>'+cpEsc(value)+'</textarea></label>';
function cpStudentOptions(){
 const r=cpState.report;
 return (r?.students||[]).map(s=>'<option value="'+s.serial_no+'"'+(Number(s.serial_no)===Number(cpState.serial)?' selected':'')+'>'+
 cpEsc(s.serial_no+' — '+s.full_name)+'</option>').join('');
}
function cpCount(s,cat,code){
 return cpEvents(s).filter(x=>x.category===cat&&x.code===code).length;
}
function cpBehaviorTable(){
 const r=cpState.report;
 return '<div class="cp-table-scroll"><table class="cp-behavior-table"><thead><tr>'+
 '<th rowspan="2">م</th><th rowspan="2" class="cp-name">اسم الطالب</th>'+
 '<th colspan="3" class="cp-positive">الإيجابيات (٣)</th><th colspan="5" class="cp-negative">السلبيات (٥)</th>'+
 '<th rowspan="2">أخرى</th><th rowspan="2">المسار</th><th rowspan="2">المتابعة</th></tr><tr>'+
 [...CP_POS,...CP_NEG].map(x=>'<th title="'+cpEsc(x)+'">'+cpEsc(x)+'</th>').join('')+'</tr></thead><tbody>'+
 (r?.students||[]).map(s=>'<tr><td>'+cpNum(s.serial_no)+'</td><td class="cp-name">'+cpEsc(s.full_name)+'</td>'+
 CP_POS.map(code=>'<td class="cp-positive">'+cpNum(cpCount(s,'إيجابي',code))+'</td>').join('')+
 CP_NEG.map(code=>'<td class="cp-negative">'+cpNum(cpCount(s,'سلبي',code))+'</td>').join('')+
 '<td>'+cpNum(cpCount(s,'أخرى','ملاحظة أخرى'))+'</td><td>'+cpEsc(cpProfile(s).student_track||'—')+'</td>'+
 '<td><button type="button" data-cp-select="'+s.serial_no+'">عرض</button></td></tr>').join('')+
 '</tbody></table></div>';
}
function cpRoster(){
 const r=cpState.report;
 return '<div class="cp-table-scroll"><table class="cp-roster"><thead><tr>'+
 '<th>م</th><th class="cp-name">اسم الطالب</th><th>التشخيصي /١٠</th><th>أعمال /٦٠</th>'+
 '<th>النهائي /٤٠</th><th>الإجمالي /١٠٠</th><th>التقدير</th><th>مسار المتابعة</th>'+
 '<th>الملاحظات</th><th>الأسئلة الموثقة</th><th>الملف</th></tr></thead><tbody>'+
 (r?.students||[]).map(s=>{
  const g=cpGradeTotal(cpGrade(s)),p=cpProfile(s);
  return '<tr><td>'+cpNum(s.serial_no)+'</td><td class="cp-name">'+cpEsc(s.full_name)+'</td>'+
  '<td>'+cpNum(g.diagnostic)+'</td><td>'+cpNum(g.subtotal)+(g.complete?'':' *')+'</td>'+
  '<td>'+cpNum(cpGrade(s).final_exam)+'</td><td>'+cpNum(g.total)+'</td><td>'+cpEsc(g.level)+'</td>'+
  '<td>'+cpEsc(p.student_track||'متابعة عامة')+'</td><td>'+cpNum(cpEvents(s).length)+'</td>'+
  '<td>'+cpNum(cpQuestions(s).length)+'</td>'+
  '<td><button type="button" data-cp-select="'+s.serial_no+'">ملف الطالب</button></td></tr>';
 }).join('')+'</tbody></table></div>';
}
function cpFields(items,values){
 return '<div class="cp-field-grid">'+items.map(([k,label])=>cpInput(label,k,values?.[k]||'',k==='descriptive_text'?5:3)).join('')+'</div>';
}
function cpProfilePanel(s){
 const p=cpProfile(s);
 return '<section class="cp-card"><h3>ملف المتابعة الفردية — '+cpEsc(s.full_name)+'</h3>'+
 '<p class="cp-help">المسار التربوي يحدده المعلم بناء على شواهد التعلم، ولا يمثل تشخيصًا طبيًا أو حكمًا نهائيًا على الطالب.</p>'+
 '<form id="cpProfileForm"><label class="cp-field"><span>مسار المتابعة</span><select name="student_track" '+(!cpEdit()?'disabled':'')+'>'+
 CP_LEVEL.map(v=>'<option'+((p.student_track||CP_LEVEL[0])===v?' selected':'')+'>'+v+'</option>').join('')+
 '</select></label>'+cpFields(CP_PROFILE.filter(([key])=>key!=="descriptive_text"),p)+
 '<section class="cp-descriptor-box"><h4>العبارات الوصفية — ملف مستقل داخل سجل الطالب</h4>'+
 cpInput('الوصف التربوي الخاص بالطالب','descriptive_text',p.descriptive_text||'',5)+'</section>'+
 '<div class="cp-description-hint"><b>التوصيفات الوصفية:</b> يمكن كتابة وصف فردي وحفظه الآن. '+ 
 'التعبئة المقترحة تلقائيًا من وثيقة التوصيفات ستُفعّل بعد إرفاقها واعتماد قواعدها.</div>'+
 '<button type="button" class="cp-muted-button" disabled>تعبئة الوصف تلقائيًا — بانتظار الوثيقة</button> '+
 (cpEdit()?'<button type="submit" class="primary">💾 حفظ ملف الطالب والعبارات الوصفية</button>':'')+'</form></section>';
}
function cpEventPanel(s){
 const events=cpEvents(s);
 return '<section class="cp-card"><h3>رصد الانضباط الصفي والإيجابيات والسلبيات</h3>'+
 '<p class="cp-help">ثلاث فئات للإيجابيات وخمس للسلبيات، إضافة إلى ملاحظة أخرى. كل واقعة تُسجّل بتاريخها، ولا تدخل في درجات الاختبارات.</p>'+
 (cpEdit()?'<form id="cpEventForm" class="cp-entry-grid">'+
 '<label>نوع الملاحظة<select id="cpEventCategory" name="category"><option>إيجابي</option><option>سلبي</option><option>أخرى</option></select></label>'+
 '<label>التصنيف<select id="cpEventCode" name="code">'+CP_POS.map(x=>'<option>'+cpEsc(x)+'</option>').join('')+'</select></label>'+
 '<label>التاريخ<input type="date" name="event_date" value="'+cpDate()+'" required></label>'+
 '<label class="cp-wide">تفاصيل الملاحظة (اختياري)<textarea name="details" rows="2" maxlength="600"></textarea></label>'+
 '<button type="submit" class="primary">إضافة الملاحظة إلى سجل الطالب</button></form>':'')+
 '<h4>الملاحظات المسجلة ('+cpNum(events.length)+')</h4>'+
 (events.length?'<div class="cp-table-scroll"><table><thead><tr><th>التاريخ</th><th>النوع</th><th>التصنيف</th><th>التفاصيل</th><th>الإجراء</th></tr></thead><tbody>'+
 events.map(x=>'<tr><td>'+cpEsc(x.event_date)+'</td><td>'+cpEsc(x.category)+'</td><td>'+cpEsc(x.code)+'</td><td>'+cpEsc(x.details||'—')+'</td>'+
 '<td>'+(cpEdit()?'<button type="button" data-cp-retract="event" data-cp-id="'+cpEsc(x.id)+'">إلغاء القيد</button>':'—')+'</td></tr>').join('')+'</tbody></table></div>':
 '<p class="cp-help">لم تُسجّل ملاحظات بعد.</p>')+'</section>';
}
function cpQuestionsPanel(s){
 const list=cpQuestions(s);
 return '<section class="cp-card"><h3>توزيع الأسئلة والأنشطة الفردية ونتائجها</h3>'+
 '<p class="cp-help">توثيق السؤال أو المهمة العلاجية أو الإثرائية، نتيجة أداء الطالب، والتغذية الراجعة وخطوة المتابعة التالية.</p>'+
 (cpEdit()?'<form id="cpQuestionForm" class="cp-entry-grid">'+
 '<label>نوع النشاط<select name="activity_type"><option>علاجي</option><option>إثرائي</option><option>تقويمي</option></select></label>'+
 '<label>التاريخ<input type="date" name="question_date" value="'+cpDate()+'" required></label>'+
 '<label class="cp-wide">السؤال أو المهمة المقدمة للطالب<textarea name="question_text" rows="3" required maxlength="1500"></textarea></label>'+
 '<label class="cp-wide">نتيجة الطالب / ملخص أدائه<textarea name="result_text" rows="2" maxlength="800"></textarea></label>'+
 '<label class="cp-wide">التغذية الراجعة والخطوة اللاحقة<textarea name="followup_action" rows="2" maxlength="800"></textarea></label>'+
 '<button type="submit" class="primary">حفظ السؤال ونتيجة المتابعة</button></form>':'')+
 '<h4>الأسئلة والأنشطة الموثقة ('+cpNum(list.length)+')</h4>'+
 (list.length?'<div class="cp-table-scroll"><table><thead><tr><th>التاريخ</th><th>النوع</th><th>السؤال / المهمة</th><th>النتيجة</th><th>الإجراء التالي</th><th></th></tr></thead><tbody>'+
 list.map(x=>'<tr><td>'+cpEsc(x.question_date)+'</td><td>'+cpEsc(x.activity_type)+'</td><td>'+cpEsc(x.question_text)+'</td>'+
 '<td>'+cpEsc(x.result_text||'—')+'</td><td>'+cpEsc(x.followup_action||'—')+'</td><td>'+
 (cpEdit()?'<button type="button" data-cp-retract="question" data-cp-id="'+cpEsc(x.id)+'">إلغاء</button>':'—')+
 '</td></tr>').join('')+'</tbody></table></div>':'<p class="cp-help">لم تُوثّق أسئلة فردية بعد.</p>')+'</section>';
}
function cpClassPanel(){
 const c=cpState.report?.class_notes||{};
 return '<section class="cp-card"><h3>إدارة الشعبة وخطة المتابعة المهنية</h3>'+
 '<p class="cp-help">خطة عامة للشعبة لتوثيق الانضباط والعلاج والإثراء والتقويم والتأمل المهني.</p>'+
 '<form id="cpClassForm">'+cpFields(CP_CLASS,c)+
 (cpEdit()?'<button type="submit" class="primary">💾 حفظ الخطة والملاحظات العامة للشعبة</button>':'')+
 '</form><details class="cp-guide"><summary>إرشادات جاهزة لإدارة التمايز والانضباط الصفي</summary>'+
 '<p><b>للمجيدين:</b> مسائل مفتوحة متعددة الحلول، مشروع رياضي واقعي، مهام استدلال وتفسير النتائج، مع متابعة التقدم دون إغراق في الواجبات.</p>'+
 '<p><b>لمن يحتاج دعمًا:</b> تحديد المهارة غير المتقنة بالتشخيص، أنشطة متدرجة قصيرة، وسائل ملموسة، زميل داعم عند الحاجة، وتقويم قبلي وبعدي وتعديل الخطة.</p>'+
 '<p><b>للانضباط:</b> قواعد واضحة، تعزيز السلوك الإيجابي، توثيق واقعي مختصر، وتنبيه تربوي متناسب مع الموقف دون وصم الطالب أو نشر بياناته.</p></details></section>';
}
function cpPage(){
 const r=cpState.report,s=cpStudent(),tabs=[['overview','نظرة عامة وكشف الدرجات'],['behavior','كشف الانضباط الصفي'],['student','المتابعة الفردية'],['questions','الأسئلة والأنشطة'],['class','خطة الشعبة']];
 let content='';
 if(r){
  if(cpState.tab==='overview')content='<section class="cp-card"><h3>كشف الطلاب والدرجات ومسارات التعلم</h3>'+cpRoster()+'</section>';
  else if(cpState.tab==='behavior')content='<section class="cp-card"><h3>سجل الانضباط الصفي للشعبة</h3>'+cpBehaviorTable()+'</section>';
  else if(cpState.tab==='class')content=cpClassPanel();
  else if(!s)content='<section class="cp-card">لا يوجد طالب محدد.</section>';
  else if(cpState.tab==='student')content=cpProfilePanel(s)+cpEventPanel(s);
  else if(cpState.tab==='questions')content=cpQuestionsPanel(s);
 }
 const classSelect=CP_CLASSES.map(c=>'<option'+(cpState.className===c?' selected':'')+'>'+c+'</option>').join('');
 const tabButtons=tabs.map(([id,label])=>'<button data-cp-tab="'+id+'" class="'+(cpState.tab===id?'active':'')+'">'+label+'</button>').join('');
 return '<div class="container cp-page" dir="rtl">'+
 '<header class="cp-head"><h1>📚 السجل المصاحب لمعلم الرياضيات</h1><p>الصف السادس — ٢٠٢٦ / ٢٠٢٧ • متابعة أكاديمية وسلوكية وخطط علاجية وإثرائية</p></header>'+
 '<section class="cp-card cp-toolbar"><label>الشعبة<select id="cpClass">'+classSelect+'</select></label>'+
 '<label>الفصل الدراسي<select id="cpTerm"><option value="1"'+(cpState.term===1?' selected':'')+'>الأول</option><option value="2"'+(cpState.term===2?' selected':'')+'>الثاني</option></select></label>'+
 '<label>الطالب<select id="cpStudentSelect" '+(!r?'disabled':'')+'>'+cpStudentOptions()+'</select></label>'+
 '<button type="button" id="cpRefresh">تحديث البيانات</button>'+
 '<button type="button" data-cp-print="class" '+(!r?'disabled':'')+'>🖨️ كشف الشعبة</button>'+
 '<button type="button" data-cp-print="behavior" '+(!r?'disabled':'')+'>🖨️ سجل الانضباط</button>'+
 '<button type="button" data-cp-print="full" '+(!r?'disabled':'')+'>🖨️ السجل المصاحب كاملًا</button>'+
 '<button type="button" data-cp-print="student" '+(!s?'disabled':'')+'>🖨️ تقرير الطالب / ولي الأمر</button></section>'+
 (cpState.error?'<p class="cp-error">'+cpEsc(cpState.error)+'</p>':'')+
 (cpState.message?'<p class="cp-message">'+cpEsc(cpState.message)+'</p>':'')+
 (cpState.loading?'<p class="cp-card">جارٍ تحميل سجل الشعبة…</p>':'')+
 (r?'<nav class="cp-tabs">'+tabButtons+'</nav><p class="cp-help">عدد الطلاب: '+cpNum(r.students.length)+' • الشعبة: '+cpEsc(cpState.className)+' • الفصل: '+cpTerm()+
 ' • الطباعة تستخرج البيانات المحفوظة فقط.</p>'+content:'<section class="cp-card">اختر الشعبة والفصل لبدء المتابعة.</section>')+
 '<p class="cp-help">البيانات خاصة بالحسابات المدرسية المخوّلة، ويجب مراجعة التقرير قبل مشاركته مع ولي الأمر.</p></div>';
}
function cpSign(){return typeof ofSignatureTable==='function'?ofSignatureTable():''}
function cpPrintRoster(r){
 return '<table><thead><tr><th>م</th><th>اسم الطالب</th><th>تشخيصي /١٠</th><th>الأعمال /٦٠</th><th>النهائي /٤٠</th>'+
 '<th>الإجمالي /١٠٠</th><th>المستوى</th><th>المسار</th><th>إيجابيات</th><th>سلبيات</th><th>أخرى</th><th>الأسئلة</th></tr></thead><tbody>'+
 r.students.map(s=>{const g=cpGradeTotal(cpGrade(s)),ev=cpEvents(s),p=cpProfile(s);
  const count=k=>ev.filter(x=>x.category===k).length;
  return '<tr><td>'+cpNum(s.serial_no)+'</td><td>'+cpEsc(s.full_name)+'</td>'+
  '<td>'+cpNum(g.diagnostic)+'</td><td>'+cpNum(g.subtotal)+(g.complete?'':'*')+'</td>'+
  '<td>'+cpNum(cpGrade(s).final_exam)+'</td><td>'+cpNum(g.total)+'</td><td>'+cpEsc(g.level)+'</td>'+
  '<td>'+cpEsc(p.student_track||'متابعة عامة')+'</td><td>'+count('إيجابي')+'</td><td>'+count('سلبي')+'</td>'+
  '<td>'+count('أخرى')+'</td><td>'+cpQuestions(s).length+'</td></tr>';
 }).join('')+'</tbody></table>';
}
function cpPrintDetailedGrades(r){
 const fields=[['oral_1','شفوي ١'],['oral_2','شفوي ٢'],['homework_1','واجب ١'],['homework_2','واجب ٢'],
 ['question_1','سؤال ١'],['question_2','سؤال ٢'],['exam_1','اختبار ١'],['exam_2','اختبار ٢'],['project','مشروع']];
 return '<section class="cp-print-section"><h2>تفصيل سجل درجات الرياضيات — الفصل '+cpTerm()+'</h2>'+
 '<table class="cp-print-grades"><thead><tr><th>م</th><th>اسم الطالب</th><th>تشخيصي /١٠</th>'+
 fields.map(([k,label])=>'<th>'+label+'</th>').join('')+
 '<th>أعمال /٦٠</th><th>نهائي /٤٠</th><th>المجموع /١٠٠</th><th>الرمز</th></tr></thead><tbody>'+
 r.students.map(s=>{const g=cpGrade(s),v=cpGradeTotal(g);
 return '<tr><td>'+cpNum(s.serial_no)+'</td><td>'+cpEsc(s.full_name)+'</td><td>'+cpNum(g.diagnostic_score)+'</td>'+
 fields.map(([k])=>'<td>'+cpNum(g[k])+'</td>').join('')+
 '<td>'+cpNum(v.subtotal)+(v.complete?'':'*')+'</td><td>'+cpNum(g.final_exam)+'</td>'+
 '<td>'+cpNum(v.total)+'</td><td>'+cpEsc(v.level)+'</td></tr>';}).join('')+'</tbody></table>'+
 '<p>(*) مجموع جزئي. لا يدخل الاختبار التشخيصي في المجموع.</p></section>';
}
function cpPrintClassPlan(){
 const c=cpState.report?.class_notes||{};
 return '<section class="cp-print-section"><h2>خطة الشعبة ومؤشرات الأداء</h2><table><tbody>'+
 CP_CLASS.map(([k,v])=>'<tr><th width="28%">'+cpEsc(v)+'</th><td>'+cpEsc(c[k]||'لم تُدوّن بعد')+'</td></tr>').join('')+'</tbody></table></section>';
}
function cpPrintStudent(s,scope='staff'){
 const p=cpProfile(s),grade=cpGradeTotal(cpGrade(s)),events=cpEvents(s),questions=cpQuestions(s);
 const fields=CP_PROFILE; // تراجع بيانات كل تقرير فردي قبل تسليمه للجهة المطلوبة
 return '<article class="cp-print-student"><h2>الطالب: '+cpEsc(s.full_name)+'</h2>'+
 '<p>الرقم: '+cpNum(s.serial_no)+' • الشعبة: '+cpEsc(s.class_name)+' • الفصل: '+cpTerm()+
 ' • التشخيصي: '+cpNum(grade.diagnostic)+'/١٠ • الإجمالي: '+cpNum(grade.total)+'/١٠٠ • التقدير: '+cpEsc(grade.level)+'</p>'+
 '<p><b>المسار:</b> '+cpEsc(p.student_track||'متابعة عامة')+'</p>'+
 '<table><tbody>'+fields.map(([k,v])=>'<tr><th width="28%">'+cpEsc(v)+'</th><td>'+cpEsc(p[k]||'—')+'</td></tr>').join('')+'</tbody></table>'+
 '<h3>المتابعة السلوكية والصفية</h3>'+ (events.length?'<table><thead><tr><th>التاريخ</th><th>النوع</th><th>التصنيف</th><th>البيان</th></tr></thead><tbody>'+
 events.map(x=>'<tr><td>'+cpEsc(x.event_date)+'</td><td>'+cpEsc(x.category)+'</td><td>'+cpEsc(x.code)+'</td><td>'+cpEsc(x.details||'—')+'</td></tr>').join('')+'</tbody></table>':'<p>لا توجد ملاحظات مسجلة.</p>')+
 '<h3>الأسئلة والأنشطة والنتائج</h3>'+(questions.length?'<table><thead><tr><th>التاريخ</th><th>النوع</th><th>السؤال</th><th>النتيجة</th><th>المتابعة</th></tr></thead><tbody>'+
 questions.map(q=>'<tr><td>'+cpEsc(q.question_date)+'</td><td>'+cpEsc(q.activity_type)+'</td><td>'+cpEsc(q.question_text)+'</td><td>'+cpEsc(q.result_text||'—')+'</td><td>'+cpEsc(q.followup_action||'—')+'</td></tr>').join('')+'</tbody></table>':'<p>لا توجد أنشطة فردية مسجلة.</p>')+
 cpSign()+'</article>';
}
function cpPrint(mode){
 if(!cpState.report)return;
 const r=cpState.report,s=cpStudent();
 if(mode==='student'&&!s)return;
 const title=mode==='student'?'تقرير متابعة الطالب':mode==='full'?'السجل المصاحب الكامل':
  mode==='behavior'?'سجل الانضباط الصفي للشعبة':'كشف متابعة الشعبة';
 const behaviorSheet='<section class="cp-print-section"><h2>سجل الإيجابيات والسلبيات ـ ثلاث إيجابيات وخمس سلبيات</h2>'+
  cpBehaviorTable().replaceAll('عرض</button>','—</button>')+cpSign()+'</section>';
 const classSheet='<section class="cp-print-section"><h2>كشف درجات الطلاب ومسارات المتابعة</h2>'+cpPrintRoster(r)+cpSign()+'</section>';
 const body=mode==='student'?cpPrintStudent(s,'parent'):
  mode==='behavior'?behaviorSheet:classSheet+
  (mode==='full'?cpPrintDetailedGrades(r)+cpPrintClassPlan()+behaviorSheet+
   r.students.map(item=>cpPrintStudent(item)).join(''):'');
 const css=`@page{size:${mode==='full'||mode==='behavior'?'A3':'A4'} landscape;margin:9mm}*{box-sizing:border-box}body{font:9pt Tahoma,Arial,sans-serif;color:#18384a;direction:rtl}header{text-align:center;border-bottom:2px solid #148a92;margin-bottom:5mm}h1{font-size:17pt;color:#12627a}h2{font-size:12pt;color:#116579}h3{font-size:10pt}p{line-height:1.7}table{width:100%;border-collapse:collapse;font-size:8pt;table-layout:fixed}th,td{border:1px solid #9db8c5;padding:1.7mm 1mm;text-align:right;overflow-wrap:anywhere;vertical-align:top}th{background:#e8f3f7}.cp-print-section{break-after:page}.cp-print-student{break-before:page}.cp-print-student h2{margin-top:5mm}.cp-print-student table{margin-bottom:4mm}.cp-table-scroll{overflow:visible}.cp-behavior-table .cp-name{width:18%}.cp-behavior-table td,.cp-behavior-table th{text-align:center}.cp-behavior-table td:nth-child(2){text-align:right}.of-signatures{width:100%;margin-top:5mm;table-layout:fixed;font-size:7pt}.of-signatures th,.of-signatures td{text-align:center}.of-signatures td{height:12mm}button{display:none}`;
 const win=window.open('','_blank');
 if(!win){alert('يرجى السماح بالنوافذ المنبثقة لطباعة التقرير.');return}
 win.document.open();win.document.write('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>'+
 cpEsc(title)+'</title><style>'+css+'</style></head><body><header><p>وزارة التربية والتعليم — مدرسة الحسين بن علي للتعليم الأساسي</p><h1>'+
 cpEsc(title)+'</h1><p>العام ٢٠٢٦/٢٠٢٧ — '+cpEsc(r.class_name)+' — الفصل '+cpTerm()+
 ' • استخراج '+cpEsc(cpDate())+'</p></header>'+body+
 '<footer><small>هذا التقرير مستخرج من البيانات المدرسية المحفوظة في منصة آفاق الرياضيات، ويُراجع قبل تسليمه إلى أي جهة.</small></footer></body></html>');
 win.onload=()=>{win.focus();win.print()};win.document.close();
}
async function cpSaveForm(form,action,more={}){
 if(!cpEdit())return;
 const data=Object.fromEntries(new FormData(form).entries());
 try{
  await cpCall(action,{...data,...more});cpState.message='حُفظت البيانات بنجاح.';await cpLoad(true);
 }catch(err){cpState.error=err.message||String(err);alert('تعذّر الحفظ: '+cpState.error)}
}
function cpBind(){
 document.getElementById('cpClass')?.addEventListener('change',e=>{
  cpState.className=e.target.value;cpState.serial=null;cpState.report=null;cpState.reportKey='';cpState.attemptedKey='';render();cpLoad();
 });
 document.getElementById('cpTerm')?.addEventListener('change',e=>{
  cpState.term=Number(e.target.value);cpState.report=null;cpState.reportKey='';cpState.attemptedKey='';render();cpLoad();
 });
 document.getElementById('cpStudentSelect')?.addEventListener('change',e=>{cpState.serial=Number(e.target.value);render()});
 document.getElementById('cpRefresh')?.addEventListener('click',()=>cpLoad(true));
 document.querySelectorAll('[data-cp-tab]').forEach(b=>b.addEventListener('click',()=>{cpState.tab=b.dataset.cpTab;render()}));
 document.querySelectorAll('[data-cp-select]').forEach(b=>b.addEventListener('click',()=>{cpState.serial=Number(b.dataset.cpSelect);cpState.tab='student';render()}));
 document.querySelectorAll('[data-cp-print]').forEach(b=>b.addEventListener('click',()=>cpPrint(b.dataset.cpPrint)));
 document.getElementById('cpProfileForm')?.addEventListener('submit',e=>{e.preventDefault();cpSaveForm(e.currentTarget,'save_profile',{serial_no:cpState.serial})});
 document.getElementById('cpClassForm')?.addEventListener('submit',e=>{e.preventDefault();cpSaveForm(e.currentTarget,'save_class_notes')});
 const category=document.getElementById('cpEventCategory'),code=document.getElementById('cpEventCode');
 category?.addEventListener('change',()=>{
  const items=category.value==='إيجابي'?CP_POS:category.value==='سلبي'?CP_NEG:['ملاحظة أخرى'];
  code.innerHTML=items.map(x=>'<option>'+cpEsc(x)+'</option>').join('');
 });
 document.getElementById('cpEventForm')?.addEventListener('submit',e=>{e.preventDefault();cpSaveForm(e.currentTarget,'add_event',{serial_no:cpState.serial})});
 document.getElementById('cpQuestionForm')?.addEventListener('submit',e=>{e.preventDefault();cpSaveForm(e.currentTarget,'add_question',{serial_no:cpState.serial})});
 document.querySelectorAll('[data-cp-retract]').forEach(b=>b.addEventListener('click',async()=>{
  if(!confirm('هل تريد إلغاء القيد؟ سيبقى محفوظًا للأغراض التدقيقية لكنه لن يظهر في الكشف.'))return;
  try{await cpCall('retract_'+b.dataset.cpRetract,{record_id:b.dataset.cpId,serial_no:cpState.serial});cpState.message='أُلغي القيد من الكشف.';await cpLoad(true)}
  catch(err){alert('تعذّر إلغاء القيد: '+err.message)}
 }));
}
const cpOldStaffPanel=staffPanel;
staffPanel=function(){
 if(auth.section==='companion_register')return cpRead()?cpPage():'<p class="notice">السجل المصاحب محصور بالحسابات المدرسية المخوّلة.</p>';
 return cpOldStaffPanel();
};
const cpOldNav=hubStaffNav;
hubStaffNav=function(){
 const h=cpOldNav();
 return h.includes('data-tab="companion_register"')?h:h.replace('</div>',
  '<button type="button" data-tab="companion_register"'+(auth.section==='companion_register'?' class="selected"':'')+'>📚 السجل المصاحب</button></div>');
};
const cpOldDash=hubStaffDashboard;
hubStaffDashboard=function(){
 const h=cpOldDash();
 return h.replace('<details class="hub-staff-old">',
 '<section class="hub-staff-group"><div class="hub-heading"><h2>السجل المصاحب للمعلم — التوثيق والمتابعة</h2></div>'+
 '<div class="hub-gate-grid">'+hubGate('السجل المصاحب للمعلم','book-open',
 'درجات الطلاب، الانضباط، الدعم والإثراء، الأسئلة الفردية، والتقارير القابلة للطباعة',
 'data-tab="companion_register"','blue')+'</div></section><details class="hub-staff-old">');
};
const cpOldTab=hubLoadForTab;
hubLoadForTab=function(id){cpOldTab(id);if(id==='companion_register'&&cpRead())cpLoad()};
const cpOldAttach=attachPortal;
attachPortal=function(){cpOldAttach();cpBind()};
const cpOldRender=render;
render=function(){
 cpOldRender();
 if(state.page==='dashboard'&&auth.section==='companion_register'&&cpRead()&&!cpState.loading&&
 cpState.reportKey!==cpKey()&&cpState.attemptedKey!==cpKey())cpLoad();
};
