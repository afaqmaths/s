'use strict';
/* كشف الرصد الفعلي 2026/2027 — مستقل عن سجل التوقعات وشهادة المسابقة. */
const OF_FIELDS=[
 ['oral_1','شفوي ١',5],['oral_2','شفوي ٢',5],
 ['homework_1','واجب ١',5],['homework_2','واجب ٢',5],
 ['question_1','سؤال ١',5],['question_2','سؤال ٢',5],
 ['exam_1','اختبار ١',10],['exam_2','اختبار ٢',10],
 ['project','المشروع',10],['final_exam','النهائي',40]
];
const OF_CLASSES=['السادس / ٤','السادس / ٥','السادس / ٦'];
const ofState={
 term:1,className:'السادس / ٤',report:null,reportKey:'',
 loading:false,attemptedKey:'',error:'',message:'',
 drafts:{},busy:{},paper:'a3-landscape',totalUpdating:false
};
const ofRead=()=>['supervisor','supervisor_assistant','director','deputy'].includes(auth.user?.role);
const ofEdit=()=>['supervisor','supervisor_assistant'].includes(auth.user?.role);
const ofAdmin=()=>auth.user?.role==='supervisor';
const ofSafe=v=>e(String(v??''));
const ofNumber=v=>new Intl.NumberFormat('ar-OM',{maximumFractionDigits:2}).format(Number(v)||0);
const ofDate=v=>v?new Intl.DateTimeFormat('ar-OM',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Muscat'}).format(new Date(v)):'لم تُحفظ درجات بعد';
const ofTerm=t=>Number(t)===1?'الأول':'الثاني';
const ofLevel=n=>n>=90?'A (أ)':n>=80?'B (ب)':n>=65?'C (ج)':n>=50?'D (د)':'E (هـ)';
const ofFieldError=k=>k==='diagnostic_score'?'تحقق من درجة الاختبار التشخيصي وحدّها الأعلى':k==='diagnostic_max'?'حد الاختبار التشخيصي من ١ إلى ١٠٠':'تأكد من درجات الطالب';
function ofError(err){
 const text=String(err?.message||err||'');
 const map={
 unauthorized:'انتهت جلسة تسجيل الدخول. أعد تسجيل الدخول.',
 forbidden:'الحساب غير مخوّل لهذا الإجراء.',
 grade_changed_reload:'تغيرت بيانات الطالب من جلسة أخرى. حدّث الكشف ثم أدخل تعديلك.',
 approved_reopen_first:'الدرجات معتمدة. يلزم إعادة فتح السجل من المشرف الرئيسي قبل التعديل.',
 incomplete_official_grade:'لا يمكن اعتماد المجموع حتى تدخل درجات المكونات التسعة والنهائي.',
 invalid_diagnostic_score:'درجة التشخيص خارج مجالها.',
 invalid_diagnostic_max:'الحد الأعلى للتشخيص غير صحيح.',
 supervisor_only:'الاعتماد وإعادة الفتح من صلاحيات المشرف الرئيسي.'
 };
 return map[text]||text.replace(/^invalid_mark:/,'درجة غير صحيحة في ');
}
async function ofCall(action,params={}){
 if(!auth.token)throw Error('unauthorized');
 const response=await fetch('https://xcwuwflggiwkehzquugz.supabase.co/functions/v1/afaq-official-math-2026',{
  method:'POST',cache:'no-store',headers:{'Content-Type':'application/json',Authorization:'Bearer '+auth.token},
  body:JSON.stringify({action,...params})
 });
 let data;try{data=await response.json()}catch{throw Error('تعذّر قراءة رد الخدمة. تحقق من الاتصال.')}
 if(!response.ok||!data?.ok)throw Error(data?.error||'تعذّر الاتصال بخدمة الرصد');
 return data;
}
const ofKey=()=>ofState.className+'|'+ofState.term;
const ofRowKey=n=>ofKey()+'|'+n;
function ofCourse(values){
 const subjects=OF_FIELDS.slice(0,9);
 let sum=0,seen=0,valid=true;
 for(const [key,,max] of subjects){
  const v=values[key];
  if(v===null||v===undefined||v==='')continue;
  const n=Number(v);
  if(!Number.isInteger(n)||n<0||n>max){valid=false;continue;}
  sum+=n;seen++;
 }
 const final=values.final_exam;
 const finalValid=final!==null&&final!==undefined&&final!==''&&
  Number.isInteger(Number(final))&&Number(final)>=0&&Number(final)<=40;
 const complete=valid&&seen===9;
 const total=complete&&finalValid?sum+Number(final):null;
 return {sum,seen,complete,total,level:total===null?null:ofLevel(total)};
}
function ofNameCell(s){
 return '<div class="of-person"><strong title="'+ofSafe(s.full_name||'—')+'">'+ofSafe(s.full_name||'—')+'</strong></div>';
}
function ofAssessmentInput(field,max,row,serial){
 const current=row[field]??'';
 return '<input class="of-number-input" aria-label="'+ofSafe(field)+' للطالب '+ofSafe(serial)+
 '" data-of-field="'+field+'" type="number" min="0" max="'+max+'" step="1" inputmode="numeric" '+
 'value="'+(current===''?'':ofSafe(current))+'" '+(!ofEdit()||row.status==='approved'?'disabled':'')+' placeholder="—">';
}
function ofRow(s){
 const marks={...s.marks,...(ofState.drafts[ofRowKey(s.serial_no)]||{})};
 const result=ofCourse(marks),locked=marks.status==='approved';
 const mark=(key,max)=>'<td>'+ofAssessmentInput(key,max,marks,s.serial_no)+'</td>';
 const base=OF_FIELDS.slice(0,9).map(([key,,max])=>mark(key,max));
 const diag='<td><div class="of-diag-cell">'+
 '<input class="of-number-input" type="number" data-of-field="diagnostic_score" min="0" step="0.5" max="'+ofSafe(marks.diagnostic_max??10)+'" '+
 'value="'+(marks.diagnostic_score??'')+'" placeholder="—" '+(!ofEdit()||locked?'disabled':'')+' aria-label="درجة التشخيص">'+
 '<small>من</small><input class="of-diag-max" data-of-field="diagnostic_max" type="number" min="1" max="100" step="1"'+
 ' value="'+ofSafe(marks.diagnostic_max??10)+'" '+(!ofEdit()||locked?'disabled':'')+' aria-label="الدرجة القصوى للتشخيص"></div></td>';
 const aPlus=marks.a_plus_points,aMinus=marks.a_minus_points;
 const indicator=(aPlus===null||aPlus===undefined||aPlus==='' )&&
  (aMinus===null||aMinus===undefined||aMinus==='')?null:
  Math.min(40,Math.max(0,Number(aPlus||0)-Number(aMinus||0)))/2;
 const aInput=(key,label)=>'<label>'+label+' <input type="number" data-of-field="'+key+'" min="0" max="500" step="1"'+
  ' value="'+(marks[key]??'')+'" placeholder="—" '+(!ofEdit()||locked?'disabled':'')+'></label>';
 const status=locked?'معتمد':marks.status==='draft'?'مسودة':'لم يُرصد';
 const controls=!ofEdit()?'للاطلاع':locked?
 (ofAdmin()?'<button type="button" data-of-reopen="'+s.serial_no+'" class="of-soft">إعادة فتح</button>':'معتمد'):
 '<button type="button" data-of-save="'+s.serial_no+'" class="of-save">حفظ</button>'+
 (ofAdmin()&&result.total!==null?'<button type="button" data-of-approve="'+s.serial_no+'" class="of-soft">اعتماد</button>':'');
 return '<tr data-of-serial="'+s.serial_no+'" class="'+(locked?'of-locked':'')+'">'+
 '<th class="of-name">'+ofNameCell(s)+'</th>'+
 '<th class="of-serial">'+ofNumber(s.serial_no)+'</th>'+
 diag+base.join('')+
 '<td class="of-subtotal" data-of-subtotal="'+s.serial_no+'">'+
 (result.seen===0?'—':result.seen===9?ofNumber(result.sum):ofNumber(result.sum)+'*')+'</td>'+
 mark('final_exam',40)+
 '<td class="of-total" data-of-total="'+s.serial_no+'">'+(result.total===null?'—':ofNumber(result.total))+'</td>'+
 '<td data-of-level="'+s.serial_no+'" data-of-band="'+(result.level?result.level[0]:'')+'" class="of-level">'+(result.level||'—')+'</td>'+
 '<td class="of-a-indicator" title="مؤشر A موجب وسالب: صافي الرصيد الحالي المحدد بسقف ٤٠ ثم القسمة على اثنين. لا يدخل في المجموع.">'+
 '<b data-of-indicator="'+s.serial_no+'">'+(indicator===null?'—':ofNumber(indicator))+' / ٢٠</b>'+
 '<div class="of-a-inputs">'+aInput('a_plus_points','A+')+aInput('a_minus_points','A−')+'</div></td>'+
 '<td class="of-remarks"><textarea data-of-field="remarks" rows="1" maxlength="500" aria-label="ملاحظات الطالب" '+
 (!ofEdit()||locked?'disabled':'')+'>'+ofSafe(marks.remarks||'')+'</textarea></td>'+
 '<td class="of-actions"><small data-of-status="'+s.serial_no+'">'+status+'</small>'+controls+'</td></tr>';
}
function ofTable(report){
 const students=report?.students||[];
 const cols=['name','serial','diagnostic',...Array(9).fill('mark'),'subtotal','final','total','level','indicator','remarks','actions'];
 return '<div class="of-table-scroll"><table class="of-table" dir="rtl">'+
 '<colgroup>'+cols.map(c=>'<col class="of-col-'+c+'">').join('')+'</colgroup>'+
 '<thead><tr class="of-group-row">'+
 '<th rowspan="2">اسم الطالب</th><th rowspan="2">م</th><th rowspan="2" class="of-diagnostic-head">الاختبار التشخيصي<br><small>مؤشر تحديد المستوى</small></th>'+
 '<th colspan="2">الأعمال الشفوية</th><th colspan="2">الواجبات المنزلية</th>'+
 '<th colspan="2">الأسئلة القصيرة</th><th colspan="2">الاختبارات القصيرة</th>'+
 '<th rowspan="2">المشروع<br>١٠</th><th rowspan="2" class="of-summary-head">مجموع<br>٦٠</th>'+
 '<th rowspan="2">النهائي<br>٤٠</th><th rowspan="2" class="of-summary-head">المجموع<br>١٠٠</th>'+
 '<th rowspan="2">المستوى</th><th rowspan="2" class="of-indicator-head">A+ و A−<br>مؤشر /٢٠<br><small>خارج المجموع</small></th>'+
 '<th rowspan="2">الملاحظات</th><th rowspan="2">إجراء</th></tr>'+
 '<tr class="of-subhead">'+
 '<th>١ /٥</th><th>٢ /٥</th><th>١ /٥</th><th>٢ /٥</th>'+
 '<th>١ /٥</th><th>٢ /٥</th><th>١ /١٠</th><th>٢ /١٠</th></tr></thead>'+
 '<tbody>'+students.map(ofRow).join('')+'</tbody></table></div>';
}
function ofStats(report){
 const rows=report?.students||[],fully=rows.filter(x=>x.marks?.complete).length;
 return '<div class="of-stats">'+[
 ['عدد الطلاب',rows.length],['المكتمل /١٠٠',fully],['المعتمد',report?.approved_count||0],
 ['المجموع الفصلي',60],['النهائي',40]
 ].map(([label,num])=>'<article><b>'+ofNumber(num)+'</b><span>'+label+'</span></article>').join('')+'</div>';
}
function ofPage(){
 const r=ofState.report;
 const classes=OF_CLASSES.map(c=>'<option'+(ofState.className===c?' selected':'')+'>'+c+'</option>').join('');
 return '<div class="container of-page" dir="rtl">'+
 '<header class="of-hero"><span>وزارة التربية والتعليم • المدرسة: الحسين بن علي للتعليم الأساسي</span>'+
 '<h1>📋 استمارة رصد درجات الرياضيات</h1>'+
 '<p>العام الدراسي ٢٠٢٦ / ٢٠٢٧ م — رصد فعلي مستقل عن الدرجات التقديرية السابقة</p></header>'+
 '<div class="of-term-switch">'+
 '<button type="button" data-of-term="1" class="'+(ofState.term===1?'active':'')+'">الفصل الدراسي الأول</button>'+
 '<button type="button" data-of-term="2" class="'+(ofState.term===2?'active':'')+'">الفصل الدراسي الثاني</button></div>'+
 '<section class="of-panel of-tools"><label>الشعبة<select id="ofClassSelect">'+classes+'</select></label>'+
 '<label>حجم واتجاه الورق<select id="ofPrintSize">'+
 [['a3-landscape','A3 أفقي (الأوضح للكشف الكبير)'],['a4-landscape','A4 أفقي'],['a4-portrait','A4 عمودي (بطاقة لكل طالب)']].map(x=>
 '<option value="'+x[0]+'"'+(ofState.paper===x[0]?' selected':'')+'>'+x[1]+'</option>').join('')+
 '</select></label>'+
 '<div class="of-toolbar">'+
 '<button id="ofRefresh" type="button" class="of-soft">تحديث الكشف</button>'+
 '<button type="button" data-of-print="class" class="of-primary" '+(!r?'disabled':'')+'>🖨️ طباعة الشعبة الحالية / PDF</button>'+
 '<button type="button" data-of-print="all" class="of-soft">طباعة الشعب الثلاث</button>'+
 '<button type="button" data-of-print="both" class="of-soft">طباعة الفصلين للشعبة</button></div>'+
 '<div class="of-info"><b>تنبيه:</b> التشخيص مستقل عن المجموع، ومؤشر A+ وA− بعد المجموع من ١٠٠، ولا يحتسب ضمن الدرجة.<br>'+
 'المؤشر = صافي النقاط التراكمية الموجبة والسالبة (بحد أقصى ٤٠) ÷ ٢؛ يستخدمه المعلم للاستئناس عند رصد شفوي ٥ + ٥.<br>'+
 'يظهر التقدير (أ، ب، ج، د، هـ) تلقائيًا فور اكتمال الدرجات التسع للأعمال الفصلية والاختبار النهائي من ٤٠، حتى قبل الحفظ. ولا تُحفظ المدخلات إلا بالضغط على حفظ.<br>'+
  'تظهر أنشطة العلاج عند ≤٥٠٪ من أي بند، والإثراء عند ≥٧٠٪. (*) يعني مجموعًا جزئيًا غير مكتمل.</div></section>'+
 (ofState.error?'<p class="of-error">'+ofSafe(ofState.error)+'</p>':'')+
 (ofState.message?'<p class="of-message">'+ofSafe(ofState.message)+'</p>':'')+
 (ofState.loading?'<p class="of-loading">جارٍ جلب أسماء الطلبة ودرجاتهم المسجلة…</p>':'')+
 (r?'<section class="of-panel"><div class="of-sheet-title"><h2>الصف السادس — '+ofSafe(ofState.className)+
 ' — الفصل الدراسي '+ofTerm(ofState.term)+'</h2>'+
 '<p>آخر تحديث للبيانات: '+ofSafe(ofDate(r.updated_at))+
 ' • تاريخ استخراج الكشف: '+ofSafe(ofDate(r.generated_at))+'</p></div>'+
 ofStats(r)+ofTable(r)+
 '<div class="of-legend"><b>رموز المستويات:</b> A (أ) من ٩٠ إلى ١٠٠؛ B (ب) من ٨٠ إلى ٨٩؛ C (ج) من ٦٥ إلى ٧٩؛ D (د) من ٥٠ إلى ٦٤؛ E (هـ) من صفر إلى ٤٩.'+
 '<p>عند عدم اكتمال درجات الفصل والنهائي لا يُعرض مستوى نهائي؛ ويمكن طباعة المسودات في أي وقت.</p></div></section>':
 '<section class="of-panel"><p>اختر الشعبة والفصل لعرض كشف الطلاب المسجلين.</p></section>')+
 '<footer class="of-footer"><span>الإعداد والإشراف: الأستاذ سعيد بن جمعة بن عبدالله البريكي</span>'+
 '<span>مدير المدرسة: الأستاذ عبد الله بن علي العيسائي</span></footer></div>';
}
async function ofLoad(force=false){
 if(!ofRead()||ofState.loading)return;
 const key=ofKey();
 if(!force&&(ofState.reportKey===key||ofState.attemptedKey===key))return;
 ofState.loading=true;ofState.attemptedKey=key;ofState.error='';ofState.message='';
 if(ofState.reportKey!==key)ofState.report=null;
 render();
 try{
  const d=await ofCall('class_report',{class_name:ofState.className,term:ofState.term});
  if(key!==ofKey())return;
  ofState.report=d.report;ofState.reportKey=key;
 }catch(err){if(key===ofKey())ofState.error=ofError(err)}
 finally{ofState.loading=false;if(state.page==='dashboard'&&auth.section==='official_register')render()}
}
function ofFindStudent(serial){return ofState.report?.students?.find(x=>Number(x.serial_no)===Number(serial))}
function ofDraft(row){
 const serial=Number(row.dataset.ofSerial);
 const values={};
 row.querySelectorAll('[data-of-field]').forEach(input=>{values[input.dataset.ofField]=input.value});
 return {serial,values};
}
function ofUpdateTotals(row){
 const s=ofFindStudent(row.dataset.ofSerial);if(!s)return;
 const {serial,values}=ofDraft(row);
 ofState.drafts[ofRowKey(serial)]=values;
 const marks={...s.marks,...values};
 const totals=ofCourse(marks);
 const subtotal=row.querySelector('[data-of-subtotal]');
 const total=row.querySelector('[data-of-total]');
 const level=row.querySelector('[data-of-level]');
 if(subtotal)subtotal.textContent=totals.seen===0?'—':ofNumber(totals.sum)+(totals.seen===9?'':'*');
 if(total)total.textContent=totals.total===null?'—':ofNumber(totals.total);
 if(level){level.textContent=totals.level||'—';level.dataset.ofBand=totals.level?totals.level[0]:'';}
 const indicator=row.querySelector('[data-of-indicator]');
 if(indicator){
  const plus=values.a_plus_points,minus=values.a_minus_points;
  indicator.textContent=plus===''&&minus===''?'— / ٢٠':
   ofNumber(Math.min(40,Math.max(0,Number(plus||0)-Number(minus||0)))/2)+' / ٢٠';
 }
}
async function ofSave(serial){
 if(!ofEdit()||ofState.busy[serial]||!ofState.report)return;
 const s=ofFindStudent(serial),tr=document.querySelector('[data-of-serial="'+serial+'"]');
 if(!s||!tr)return;
 const {values}=ofDraft(tr);
 const diagMax=Number(values.diagnostic_max||10);
 if(diagMax<=0||diagMax>100||!Number.isFinite(diagMax)){
  window.alert('الاختبار التشخيصي: حدد الدرجة العظمى بين ١ و١٠٠.');return;
 }
 const fields={diagnostic_max:diagMax,diagnostic_score:values.diagnostic_score||null,
  remarks:values.remarks||''};
 for(const key of ['a_plus_points','a_minus_points']){
  const v=values[key];
  if(v!==''&&v!==null&&v!==undefined&&(!Number.isInteger(Number(v))||Number(v)<0||Number(v)>500)){
   window.alert('نقاط A+ أو A− يجب أن تكون بين صفر و٥٠٠.');return;
  }
  fields[key]=v===''?null:v;
 }
 for(const [key,,max] of OF_FIELDS){
  const v=values[key];
  if(v!==''&&v!==null&&v!==undefined){
   const n=Number(v);
   if(!Number.isInteger(n)||n<0||n>max){window.alert('تأكد من درجة '+key+' (من ٠ إلى '+max+').');return}
  }
  fields[key]=v===''?null:v;
 }
 ofState.busy[serial]=true;const button=tr.querySelector('[data-of-save]');if(button)button.disabled=true;
 try{
  const d=await ofCall('save_row',{class_name:ofState.className,term:ofState.term,
   serial_no:serial,expected_revision:s.marks?.revision||0,...fields});
  s.marks=d.marks;
  delete ofState.drafts[ofRowKey(serial)];
  ofState.message='حُفظت درجات الطالب رقم '+ofNumber(serial)+'، ويجري تفعيل مؤشرات العلاج والإثراء آليًا.';
  ofState.report.updated_at=d.marks.updated_at;
  ofState.reportKey=ofKey();
  render();
 }catch(err){
  ofState.error=ofError(err);if(button)button.disabled=false;
  window.alert(ofState.error);
 }finally{delete ofState.busy[serial]}
}
async function ofApproval(serial,reopen){
 if(!ofAdmin())return;
 const s=ofFindStudent(serial);if(!s)return;
 const action=reopen?'reopen_row':'approve_row';
 if(!window.confirm(reopen?'هل تريد إعادة فتح درجات هذا الطالب للتعديل؟':'اعتماد درجات هذا الطالب النهائية وإغلاق تعديلها؟'))return;
 try{
  const d=await ofCall(action,{class_name:ofState.className,term:ofState.term,
   serial_no:serial,expected_revision:s.marks.revision||0});
  s.marks=d.marks;ofState.message=reopen?'أعيد فتح الرصد للتعديل.':'اعتمدت درجات الطالب.';
  render();
 }catch(err){window.alert(ofError(err))}
}
function ofPrintedTable(report){
 const rows=report.students||[];
 return '<table class="of-print-table"><thead><tr><th rowspan="2">اسم الطالب</th><th rowspan="2">م</th>'+
 '<th rowspan="2">تشخيصي</th><th colspan="2">الأعمال الشفوية</th><th colspan="2">الواجبات المنزلية</th>'+
 '<th colspan="2">الأسئلة القصيرة</th><th colspan="2">الاختبارات القصيرة</th>'+
 '<th rowspan="2">مشروع /١٠</th><th rowspan="2">المجموع /٦٠</th><th rowspan="2">النهائي /٤٠</th>'+
 '<th rowspan="2">الإجمالي /١٠٠</th><th rowspan="2">المستوى</th>'+
 '<th rowspan="2">مؤشر A± /٢٠</th><th rowspan="2">الملاحظات</th></tr>'+
 '<tr>'+[5,5,5,5,5,5,10,10].map((n,i)=>'<th>'+(i%2+1)+' /'+n+'</th>').join('')+'</tr></thead><tbody>'+
 rows.map(row=>{
  const v=row.marks||{},c=ofCourse(v),diag=v.diagnostic_score==null?'—':ofNumber(v.diagnostic_score)+'/'+ofNumber(v.diagnostic_max||10);
  const fields=OF_FIELDS.slice(0,9).map(([k])=>'<td>'+ofPrintMark(v[k])+'</td>').join('');
  return '<tr><td class="of-print-name">'+ofSafe(row.full_name)+'</td><td>'+ofNumber(row.serial_no)+'</td>'+
   '<td>'+diag+'</td>'+fields+'<td>'+(c.seen===0?'—':ofNumber(c.sum)+(c.complete?'':'*'))+'</td>'+
   '<td>'+ofPrintMark(v.final_exam)+'</td><td>'+(c.total===null?'—':ofNumber(c.total))+'</td>'+
   '<td>'+(c.level||'—')+'</td><td>'+(row.a_indicator20===null?'—':ofNumber(row.a_indicator20))+'</td>'+
   '<td>'+ofSafe(v.remarks||'')+'</td></tr>';
 }).join('')+'</tbody></table>';
}
const ofPrintMark=v=>v===null||v===undefined?'—':ofNumber(v);
function ofPrintedCards(report){
 return '<div class="of-print-cards">'+(report.students||[]).map(row=>{
  const m=row.marks||{},c=ofCourse(m);
  return '<article class="of-print-card"><h3>'+ofNumber(row.serial_no)+' — '+ofSafe(row.full_name)+'</h3>'+
  '<p>الاختبار التشخيصي: '+(m.diagnostic_score==null?'لم يرصد':ofNumber(m.diagnostic_score)+' من '+ofNumber(m.diagnostic_max||10))+'</p>'+
  '<div class="of-print-card-grid">'+OF_FIELDS.map(([k,label,max])=>
  '<span>'+ofSafe(label)+': '+ofPrintMark(m[k])+' / '+max+'</span>').join('')+'</div>'+
  '<p>الأعمال الفصلية: '+ofNumber(c.sum)+' /٦٠'+(c.complete?'':' (غير مكتملة)')+
  ' | الإجمالي: '+(c.total===null?'—':ofNumber(c.total)+' /١٠٠')+
  ' | المستوى: '+(c.level||'—')+'</p><p>A± غير الرسمي: '+ofNumber(row.a_indicator20||0)+' /٢٠'+
  ' • الملاحظات: '+ofSafe(m.remarks||'—')+'</p></article>';
 }).join('')+'</div>';
}
function ofPrintableDocument(reports,paper){
 const portrait=paper==='a4-portrait',all=reports.flat();
 const paperSize=paper==='a3-landscape'?'A3 landscape':paper==='a4-portrait'?'A4 portrait':'A4 landscape';
 return '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">'+
 '<title>استمارة رصد الرياضيات ٢٠٢٦–٢٠٢٧</title><style>'+
 '@page{size:'+paperSize+';margin:8mm}*{box-sizing:border-box}body{direction:rtl;font:9pt Tahoma,Arial,sans-serif;color:#173d56}'+
 'header{text-align:center;border-bottom:2px solid #ad833c;padding-bottom:3mm}h1{font-size:18pt;margin:0;color:#135780}'+
 'h2{font-size:12pt;margin:5mm 0 2mm;color:#9a6b2b}.of-sheet{break-before:page} .of-sheet:first-of-type{break-before:auto}'+
 '.of-meta{display:flex;justify-content:space-between;gap:4mm;margin:2mm 0 3mm;font-size:9pt}'+
 '.of-print-table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:'+(paper==='a3-landscape'?'8':'6')+'pt}'+
 '.of-print-table th,.of-print-table td{border:1px solid #91aabb;padding:1.7mm .7mm;text-align:center;overflow-wrap:anywhere}'+
 '.of-print-table th{background:#e4f0f6}.of-print-table tr{break-inside:avoid}'+
 '.of-print-table .of-print-name{width:21%;font-weight:bold;text-align:right;white-space:nowrap}'+
 '.of-print-cards{display:grid;grid-template-columns:1fr;gap:4mm}.of-print-card{border:1px solid #aaa;break-inside:avoid;padding:3mm}'+
 '.of-print-card h3{margin:0;font-size:12pt}.of-print-card p{margin:2mm 0}.of-print-card-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:1mm}'+
 '.of-print-card-grid span{border:1px solid #ccc;padding:2mm;font-size:8pt}'+
 'footer{display:flex;justify-content:space-between;gap:4mm;margin-top:4mm;border-top:1px solid #b99d57;padding-top:3mm;font-size:8pt}'+
 '.of-legend{font-size:8pt;margin:2mm 0;color:#495967}@media print{body{margin:0}}'+
 '</style></head><body><header><p>وزارة التربية والتعليم — مدرسة الحسين بن علي للتعليم الأساسي</p>'+
 '<h1>استمارة رصد درجات الرياضيات — ٢٠٢٦ / ٢٠٢٧ م</h1></header>'+
 all.map(r=>'<section class="of-sheet"><h2>الصف السادس — '+ofSafe(r.class_name)+
 ' — الفصل الدراسي '+ofTerm(r.term)+'</h2>'+
 '<div class="of-meta"><span>عدد الطلاب: '+ofNumber(r.count)+'</span>'+
 '<span>آخر تحديث للرصد: '+ofSafe(ofDate(r.updated_at))+'</span>'+
 '<span>تاريخ الطباعة: '+ofSafe(ofDate(new Date().toISOString()))+'</span></div>'+
 (portrait?ofPrintedCards(r):ofPrintedTable(r))+
 '<p class="of-legend">(*) مجموع جزئي لم تكتمل عناصره. الاختبار التشخيصي ومؤشر A± من ٢٠ خارج حساب الإجمالي. '+
 'المستويات: أ ٩٠–١٠٠؛ ب ٨٠–٨٩؛ ج ٦٥–٧٩؛ د ٥٠–٦٤؛ هـ ٠–٤٩.</p>'+
 '<footer><span>الإعداد والإشراف: الأستاذ سعيد بن جمعة بن عبدالله البريكي</span>'+
 '<span>مدير المدرسة: الأستاذ عبد الله بن علي العيسائي</span></footer></section>').join('')+
 '</body></html>';
}
async function ofPrint(scope){
 if(!ofRead()||ofState.loading)return;
 const paper=ofState.paper;
 let popup=window.open('','_blank');
 if(!popup){window.alert('اسمح بفتح نافذة الطباعة الجديدة من المتصفح.');return}
 popup.document.write('<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>تحميل كشف الرصد</title><body style="font:18px Tahoma;text-align:center;margin:80px">يجري إعداد كشف الدرجات للطباعة…</body></html>');
 try{
  let reports=[];
  if(scope==='class'){
   if(!ofState.report)throw Error('لم يُحمّل كشف الشعبة بعد.');
   reports=[ofState.report];
  }else if(scope==='all'){
   const x=await ofCall('all_reports',{term:ofState.term});reports=x.reports||[];
  }else if(scope==='both'){
   const [a,b]=await Promise.all([1,2].map(term=>ofCall('class_report',{term,class_name:ofState.className})));
   reports=[a.report,b.report];
  }
  const html=ofPrintableDocument(reports,paper);
  popup.document.open();popup.document.write(html);
  popup.onload=()=>{popup.focus();popup.print()};
  popup.document.close();
 }catch(err){
  popup.close();window.alert('تعذّر إنشاء الكشف: '+ofError(err));
 }
}
function ofBind(){
 document.querySelectorAll('[data-of-term]').forEach(b=>b.addEventListener('click',()=>{
  const value=Number(b.dataset.ofTerm);
  if(value===ofState.term)return;
  ofState.term=value;ofState.report=null;ofState.reportKey='';ofState.error='';render();ofLoad();
 }));
 document.getElementById('ofClassSelect')?.addEventListener('change',e=>{
  ofState.className=e.target.value;ofState.report=null;ofState.reportKey='';ofState.error='';render();ofLoad();
 });
 document.getElementById('ofPrintSize')?.addEventListener('change',e=>{ofState.paper=e.target.value});
 document.getElementById('ofRefresh')?.addEventListener('click',()=>ofLoad(true));
 document.querySelectorAll('[data-of-print]').forEach(b=>b.addEventListener('click',()=>ofPrint(b.dataset.ofPrint)));
 document.querySelectorAll('[data-of-serial]').forEach(tr=>{
  tr.querySelectorAll('[data-of-field]').forEach(input=>input.addEventListener('input',()=>ofUpdateTotals(tr)));
 });
 document.querySelectorAll('[data-of-save]').forEach(b=>b.addEventListener('click',()=>ofSave(Number(b.dataset.ofSave))));
 document.querySelectorAll('[data-of-approve]').forEach(b=>b.addEventListener('click',()=>ofApproval(Number(b.dataset.ofApprove),false)));
 document.querySelectorAll('[data-of-reopen]').forEach(b=>b.addEventListener('click',()=>ofApproval(Number(b.dataset.ofReopen),true)));
 document.getElementById('portalLogout')?.addEventListener('click',()=>{
  ofState.report=null;ofState.reportKey='';ofState.attemptedKey='';ofState.drafts={};ofState.error='';
 });
}
const ofOldStaffPanel=staffPanel;
staffPanel=function(){
 if(auth.section==='official_register'){
  if(!ofRead())return '<p class="notice">استمارة الرصد متاحة للحسابات المدرسية المصرح لها فقط.</p>';
  return ofPage();
 }
 return ofOldStaffPanel();
};
const ofOldStaffNav=hubStaffNav;
hubStaffNav=function(){
 const existing=ofOldStaffNav();
 if(existing.includes('data-tab="official_register"'))return existing;
 return existing.replace('</div>',
  '<button type="button" data-tab="official_register"'+(auth.section==='official_register'?' class="selected"':'')+
  '>📋 الرصد الفعلي ٢٠٢٦–٢٠٢٧</button></div>');
};
const ofOldStaffDash=hubStaffDashboard;
hubStaffDashboard=function(){
 const h=ofOldStaffDash();
 return h.replace('<details class="hub-staff-old">',
 '<section class="hub-staff-group"><div class="hub-heading"><h2>استمارة الرصد الفعلي — الفصلان الدراسيان</h2></div>'+
 '<div class="hub-gate-grid">'+hubGate('كشف الرصد الفعلي','clipboard-list',
 '٦٠ درجة للأعمال الفصلية، ٤٠ للنهائي، التشخيص والمستوى ومؤشر A± من ٢٠ خارج المجموع',
 'data-tab="official_register"','gold')+'</div></section>'+
 '<details class="hub-staff-old">');
};
const ofOldLoadForTab=hubLoadForTab;
hubLoadForTab=function(id){
 ofOldLoadForTab(id);
 if(id==='official_register'&&ofRead()&&!ofState.loading&&ofState.reportKey!==ofKey())
  ofLoad();
};
const ofOldAttachPortal=attachPortal;
attachPortal=function(){ofOldAttachPortal();ofBind()};
const ofOldRender=render;
render=function(){
 ofOldRender();
 if(state.page==='dashboard'&&auth.section==='official_register'&&ofRead()&&
  ofState.reportKey!==ofKey()&&!ofState.loading&&ofState.attemptedKey!==ofKey())ofLoad();
};
