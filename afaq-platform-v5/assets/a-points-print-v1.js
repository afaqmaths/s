/* Afaq Math | Printing independent A+ / A− participation statements and class registers. */
'use strict';
const AP_CLASSES=['السادس / ٤','السادس / ٥','السادس / ٦'];
const apState={reports:{},loading:false,requested:false,token:'',error:'',selectedClass:'all',
 selectedStudent:'',search:'',orientation:'landscape'};
const apAllowed=()=>['supervisor','supervisor_assistant'].includes(auth.user?.role);
const apEsc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const apNum=n=>new Intl.NumberFormat('ar-OM',{maximumFractionDigits:0}).format(Number(n)||0);
const apDate=()=>new Intl.DateTimeFormat('ar-OM',{year:'numeric',month:'long',day:'numeric',timeZone:'Asia/Muscat'}).format(new Date());
function apRows(){
 return AP_CLASSES.flatMap(name=>apState.reports[name]?.students||[])
  .map(r=>({...r,plus:r.scores?Number(r.scores.a_plus_points||0):null,
   minus:r.scores?Number(r.scores.a_minus_points||0):null}));
}
const apKey=row=>row.class_name+'|'+row.serial_no;
function apBalance(row){return row.plus===null||row.minus===null?null:row.plus-row.minus}
function apRecord(row){return row.plus!==null||row.minus!==null}
function apStatus(row){
 if(!apRecord(row))return ['لم يبدأ الرصد','ap-state-empty'];
 if(row.plus>row.minus)return ['تفاعل إيجابي','ap-state-positive'];
 if(row.plus<row.minus)return ['يحتاج إلى متابعة','ap-state-needs'];
 return ['متوازن','ap-state-regular'];
}
function apScopedRows(){
 const cls=apState.selectedClass,needle=apState.search.trim().toLowerCase();
 return apRows().filter(r=>(cls==='all'||r.class_name===cls)&&(!needle||
  [r.full_name||r.display_name||'',r.class_name,String(r.serial_no)].join(' ').toLowerCase().includes(needle)));
}
async function apLoad(){
 if(!apAllowed()||apState.loading)return;
 const token=auth.token;
 apState.token=token;apState.requested=true;apState.loading=true;apState.error='';
 try{
  const reports=await Promise.all(AP_CLASSES.map(name=>api('class_assessments',{class_name:name})));
  if(token!==auth.token)return;
  for(let i=0;i<AP_CLASSES.length;i++)apState.reports[AP_CLASSES[i]]=reports[i];
 }catch(err){if(token===auth.token)apState.error=err.message||'تعذر تحميل كشوف الطلاب'}
 finally{if(token===auth.token){apState.loading=false;if(state.page==='dashboard')render()}}
}
function apTableRows(rows){
 return rows.map(row=>{
  const [status,klass]=apStatus(row),net=apBalance(row);
  return '<tr class="'+klass+'"><td>'+apNum(row.serial_no)+'</td><td class="ap-name">'+
    apEsc(row.full_name||row.display_name||'—')+'</td><td>'+apEsc(row.class_name)+'</td>'+
    '<td class="ap-positive">'+(row.plus===null?'—':apNum(row.plus))+'</td>'+
    '<td class="ap-negative">'+(row.minus===null?'—':apNum(row.minus))+'</td>'+
    '<td class="ap-net">'+(net===null?'—':(net>0?'+':'')+apNum(net))+'</td>'+
    '<td><span class="ap-pill '+klass+'">'+status+'</span></td></tr>';
 }).join('');
}
function apTable(rows){
 return '<div class="ap-table-scroll"><table class="ap-points-table"><thead>'+
 '<tr><th>م</th><th>اسم الطالب</th><th>الشعبة</th><th>A+ الموجبة</th>'+
 '<th>A− السالبة</th><th>صافي المؤشر</th><th>حالة التفاعل</th></tr></thead>'+
 '<tbody>'+apTableRows(rows)+'</tbody></table></div>';
}
function apShortcut(){
 return '<section class="ap-shortcut"><div><h3>🏅 شهادات A+ وA− وكشوف التفاعل</h3>'+
  '<p>شهادة مستقلة للطالب وكشوف بالاسم أو الشعبة أو جميع الشعب الثلاث، من سجل نقاط التفاعل المحفوظ.</p>'+
  '</div><button type="button" class="primary" data-tab="a_awards">فتح مركز الشهادات والكشوف</button></section>';
}
function apPanel(){
 if(apState.token!==auth.token){
  apState.token=auth.token;apState.reports={};apState.requested=false;apState.loading=false;apState.error='';
  apState.selectedStudent='';apState.search='';
 }
 if(!apState.requested&&!apState.loading){
  apState.requested=true;Promise.resolve().then(()=>apLoad());
 }
 const all=apRows(),scoped=apScopedRows(),withPlus=all.filter(r=>r.plus!==null&&r.plus>0).length;
 const choices='<option value="">اختر الطالب لطباعة شهادته...</option>'+
  scoped.map(r=>'<option value="'+apEsc(apKey(r))+'"'+(apKey(r)===apState.selectedStudent?' selected':'')+'>'+
  apEsc(r.class_name)+' — '+apNum(r.serial_no)+' — '+apEsc(r.full_name||r.display_name||'')+'</option>').join('');
 return '<section class="ap-print-center" dir="rtl"><div class="ap-header"><div>'+
  '<span class="ap-eyebrow">آفاق ماث | Afaq Math • متابعة التفاعل</span>'+
  '<h2>🏅 شهادات وكشوف نقاط A+ وA−</h2>'+
  '<p>طباعة شهادة الطالب، أو كشف بالأسماء لشعبة واحدة أو للشعب الثلاث. المؤشر غير رسمي ولا يُضاف تلقائيًا إلى المجموع الدراسي.</p></div>'+
  '<button type="button" class="outline" data-tab="overview">العودة إلى لوحة المشرف</button></div>'+
  '<div class="ap-facts"><article><strong>'+apNum(all.length)+'</strong><span>طالبًا في الكشوف</span></article>'+
  '<article><strong>'+apNum(withPlus)+'</strong><span>لديهم نقاط A+ مسجلة</span></article>'+
  '<article><strong>'+apNum(scoped.length)+'</strong><span>طالبًا ضمن التصفية</span></article></div>'+
  (apState.loading?'<p class="notice">جارٍ تحميل رصد A+ وA− للشعب الثلاث...</p>':'')+
  (apState.error?'<p class="notice">'+apEsc(apState.error)+'</p>':'')+
  '<div class="ap-filters"><label>اختيار الشعبة<select id="apClass">'+
  '<option value="all"'+(apState.selectedClass==='all'?' selected':'')+'>الشعب الثلاث معًا</option>'+
  AP_CLASSES.map(cls=>'<option value="'+apEsc(cls)+'"'+(apState.selectedClass===cls?' selected':'')+'>'+apEsc(cls)+'</option>').join('')+
  '</select></label><label>بحث بالاسم أو الرقم<input id="apSearch" value="'+apEsc(apState.search)+
  '" placeholder="ابحث عن اسم طالب أو رقمه" autocomplete="off"></label>'+
  '<label>الطالب لشهادته<select id="apStudent">'+choices+'</select></label>'+
  '<label>اتجاه الكشف<select id="apOrientation"><option value="landscape"'+(apState.orientation==='landscape'?' selected':'')+
  '>A4 أفقي</option><option value="portrait"'+(apState.orientation==='portrait'?' selected':'')+'>A4 عمودي</option></select></label></div>'+
  '<div class="ap-buttons"><button type="button" class="primary" id="apPrintStudent" '+(!apState.selectedStudent?'disabled':'')+
  '>🏅 طباعة شهادة الطالب / PDF</button>'+
  '<button type="button" class="outline" id="apPrintFiltered" '+(!scoped.length?'disabled':'')+
  '>🖨️ طباعة الكشف حسب البحث والشعبة</button>'+
  '<button type="button" class="outline" id="apPrintAll" '+(!all.length?'disabled':'')+
  '>🖨️ طباعة كشف الشعب الثلاث كاملة</button>'+
  '<button type="button" class="soft" id="apReload" '+(apState.loading?'disabled':'')+'>↻ تحديث الرصد</button></div>'+
  '<p class="ap-explain">النقاط: <b>A+</b> للمشاركات والتعزيز، و<b>A−</b> للملاحظات والسلوكيات أو الإخفاقات المسجلة. صافي المؤشر = A+ − A−، دون تحويله إلى درجة رسمية. «—» تعني عدم وجود سجل رصد لهذه الخانة.</p>'+
  apTable(scoped)+'</section>';
}
function apCertificateData(row){
 const net=apBalance(row),hasPositive=row.plus!==null&&row.plus>row.minus&&row.plus>0;
 const title=hasPositive?'شهادة إشادة بالتفاعل والمشاركة':'إفادة متابعة التفاعل والمشاركة';
 const description=hasPositive?'تقديرًا لمشاركته الإيجابية ومساهمته في أنشطة الرياضيات، وفق نقاط التفاعل المرصودة في منصة آفاق ماث.':
  'بيان متابعة لنقاط المشاركة والتفاعل ضمن أنشطة الرياضيات، بغرض التشجيع وتطوير الأداء.';
 return {title,description,net};
}
function apCertificateMarkup(row){
 const data=apCertificateData(row),date=apDate(),name=apEsc(row.full_name||row.display_name||'—');
 return '<article class="ap-cert-sheet" dir="rtl"><div class="ap-cert-decoration ap-deco-one"></div>'+
  '<div class="ap-cert-decoration ap-deco-two"></div>'+
  '<div class="ap-cert-heading"><div class="ap-cert-emblem">✦</div><div>'+
  '<span>سلطنة عُمان — مدرسة الحسين بن علي للتعليم الأساسي</span>'+
  '<h1>آفاق ماث <small lang="en">Afaq Math</small></h1><p>التميز في التعلم • التحفيز والمشاركة</p>'+
  '</div><div class="ap-cert-emblem">🏅</div></div>'+
  '<div class="ap-cert-ribbon">✦ '+data.title+' ✦</div>'+
  '<p class="ap-cert-dear">يُقدم هذا المستند للطالب</p>'+
  '<h2 class="ap-cert-name">'+name+'</h2>'+
  '<p class="ap-cert-klass">الصف '+apEsc(row.class_name)+' — الرقم التسلسلي '+apNum(row.serial_no)+'</p>'+
  '<p class="ap-cert-description">'+data.description+'</p>'+
  '<div class="ap-cert-points"><div><small>النقاط الإيجابية A+</small><strong>'+ (row.plus===null?'—':apNum(row.plus))+'</strong></div>'+
  '<div><small>النقاط السالبة A−</small><strong>'+(row.minus===null?'—':apNum(row.minus))+'</strong></div>'+
  '<div><small>صافي مؤشر التفاعل</small><strong>'+(data.net===null?'—':(data.net>0?'+':'')+apNum(data.net))+'</strong></div></div>'+
  '<p class="ap-cert-caution">وثيقة متابعة وتحفيز من المنصة؛ ليست شهادة تحصيل رسمية، ولا تمثل نتيجة الاختبار أو المجموع من ١٠٠.</p>'+
  '<div class="ap-cert-footer"><div><b>الإعداد والإشراف</b><strong>الأستاذ سعيد جمعة عبد الله البريكي</strong></div>'+
  '<div><b>تاريخ الإصدار</b><strong>'+date+'</strong></div>'+
  '<div><b>اعتماد المدرسة</b><strong>المدير: عبد الله علي العيسائي</strong><small>خانة توقيع عند الاعتماد</small></div></div>'+
  '</article>';
}
function apRosterMarkup(rows,title){
 const totalPlus=rows.reduce((x,r)=>x+Number(r.plus||0),0),totalMinus=rows.reduce((x,r)=>x+Number(r.minus||0),0);
 return '<section class="ap-print-register" dir="rtl"><div class="ap-register-head">'+
  '<span>آفاق ماث | Afaq Math</span><h1>'+apEsc(title)+'</h1>'+
  '<p>مدرسة الحسين بن علي للتعليم الأساسي — العام الدراسي ٢٠٢٦ / ٢٠٢٧</p>'+
  '<div><span>عدد الطلاب: '+apNum(rows.length)+'</span><span>مجموع A+: '+apNum(totalPlus)+'</span>'+
  '<span>مجموع A−: '+apNum(totalMinus)+'</span><span>تاريخ الطباعة: '+apDate()+'</span></div></div>'+
  apTable(rows)+
  '<p class="ap-explain">الرصيد للملاحظة والتشجيع والمتابعة؛ لا يدخل في الدرجات الرسمية تلقائيًا. لا تُفسر خانات «—» على أنها صفر مثبت.</p>'+
  '<div class="ap-print-signatures"><span>المشرف: سعيد جمعة عبد الله البريكي</span>'+
  '<span>مدير المدرسة: عبد الله علي العيسائي</span></div></section>';
}
function apPrintDocument(content,orientation='landscape'){
 const win=window.open('','_blank');
 if(!win){window.alert('اسمح بفتح النوافذ المنبثقة لطباعة الشهادة أو الكشف.');return}
 const sheet=orientation==='portrait'?'portrait':'landscape';
 const styles=Array.from(document.styleSheets).flatMap(st=>{
  const href=st.href||'';return href&&href.includes('a-points-print-v1.css')?['<link rel="stylesheet" href="'+href+'">']:[];
 }).join('');
 win.document.open();
 win.document.write('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">'+
 '<meta name="viewport" content="width=device-width,initial-scale=1"><title>آفاق ماث | طباعة A+ وA−</title>'+
 styles+'<style>@page{size:A4 '+sheet+';margin:10mm}body{margin:0;background:white!important;font-family:Tahoma,Arial,sans-serif;color:#163c58}'+
 '.ap-print-center,.ap-shortcut{display:none}@media print{body{background:white!important}}'+
 '</style></head><body class="ap-print-only">'+content+'</body></html>');
 win.document.close();
 win.onload=()=>{win.focus();win.print()};
}
function apPrintSelected(){
 const row=apRows().find(r=>apKey(r)===apState.selectedStudent);
 if(!row){window.alert('اختر الطالب قبل طباعة الشهادة.');return}
 apPrintDocument(apCertificateMarkup(row),'landscape');
}
function apPrintFiltered(all=false){
 const rows=all?apRows():apScopedRows();
 if(!rows.length){window.alert('لا يوجد طلاب في التحديد الحالي.');return}
 const title=all?'كشف نقاط A+ وA− — الشعب الثلاث':
  apState.selectedClass==='all'?'كشف نقاط A+ وA− — نتائج البحث':'كشف نقاط A+ وA− — '+apState.selectedClass;
 apPrintDocument(apRosterMarkup(rows,title),apState.orientation);
}
const apPreviousStaffPanel=staffPanel;
staffPanel=function(){
 if(auth.section==='a_awards'&&apAllowed())return apPanel();
 const original=apPreviousStaffPanel();
 return apAllowed()&&auth.section==='overview'?original+apShortcut():original;
};
const apPreviousPersonalPanel=personalPanel;
personalPanel=function(p){
 const original=apPreviousPersonalPanel(p);
 if(p?.demo||!p?.assessment||p.assessment.status!=='approved')return original;
 const plus=p.assessment.a_plus_points??0,minus=p.assessment.a_minus_points??0;
 return original+'<section class="panel ap-personal-access"><h3>🏅 شهادة التفاعل A+ وA−</h3>'+
  '<p>يمكنك طباعة إفادة نقاط مشاركتك المعتمدة داخل المنصة. هذا مؤشر مشاركة وليس درجة اختبار رسمي.</p>'+
  '<div class="ap-balance-inline"><span>A+ : '+apNum(plus)+'</span><span>A− : '+apNum(minus)+'</span></div>'+
  '<button type="button" class="primary" id="apStudentSelfPrint">🖨️ طباعة شهادة التفاعل / PDF</button></section>';
};
const apPrevAttachPortal=attachPortal;
attachPortal=function(){
 apPrevAttachPortal();
 document.getElementById('apClass')?.addEventListener('change',ev=>{
  apState.selectedClass=ev.target.value;apState.selectedStudent='';render();
 });
 document.getElementById('apSearch')?.addEventListener('change',ev=>{
  apState.search=ev.target.value;apState.selectedStudent='';render();
 });
 document.getElementById('apStudent')?.addEventListener('change',ev=>{
  apState.selectedStudent=ev.target.value;render();
 });
 document.getElementById('apOrientation')?.addEventListener('change',ev=>{apState.orientation=ev.target.value});
 document.getElementById('apPrintStudent')?.addEventListener('click',apPrintSelected);
 document.getElementById('apPrintFiltered')?.addEventListener('click',()=>apPrintFiltered(false));
 document.getElementById('apPrintAll')?.addEventListener('click',()=>apPrintFiltered(true));
 document.getElementById('apReload')?.addEventListener('click',()=>apLoad());
 document.getElementById('apStudentSelfPrint')?.addEventListener('click',()=>{
  const p=auth.profile,a=p?.assessment,student=p?.student;
  if(!student||!a||a.status!=='approved')return;
  apPrintDocument(apCertificateMarkup({...student,plus:Number(a.a_plus_points||0),
   minus:Number(a.a_minus_points||0)}),'landscape');
 });
};
