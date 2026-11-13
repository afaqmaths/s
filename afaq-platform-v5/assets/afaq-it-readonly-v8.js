/* Afaq Math — information technology supervisors: server-sanitized read-only review */
'use strict';
const IT_VIEWS=[['overview','لوحة المتابعة'],['students','الطلاب ١–٩٨'],['assessment','التقويم والدرجات'],
 ['competition','المسابقات'],['enrichment','العلاج والإثراء'],['resources','الموارد والمشاغل'],
 ['news','الأخبار والتحديثات']];
const itState={tab:'overview',className:'all',search:'',selected:null};
const itEsc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const itNum=x=>x==null?'—':new Intl.NumberFormat('ar-OM',{maximumFractionDigits:2}).format(x);
const itOnly=()=>auth.user?.role==='it_viewer';
function itRows(){
 const students=auth.itOverview?.students||[];
 const needle=itState.search.trim().toLocaleLowerCase('ar');
 return students.filter(s=>(itState.className==='all'||s.class_name===itState.className)&&
  (!needle||[s.name,s.class_name,String(s.number)].join(' ').toLocaleLowerCase('ar').includes(needle)));
}
function itCell(row,col){
 switch(col){
 case 'number':return itNum(row.number);
 case 'name':return '<button type="button" class="it-view-student" data-it-open="'+itEsc(row.number)+'">'+itEsc(row.name)+'</button>';
 case 'class_name':return itEsc(row.class_name);
 case 'assessment':return row.assessment_total==null?'—':itNum(row.assessment_total)+' / ١٠٠';
 case 'diagnostic':return itNum(row.diagnostic);
 case 'plus':return itNum(row.a_plus);
 case 'minus':return itNum(row.a_minus);
 case 'contest':return itNum(row.contest_attempts);
 case 'completed':return itNum(row.contest_completed_units);
 case 'track':return (row.enrichment?'🌿 إثرائي':'')+(row.remedial?(row.enrichment?' + ':'')+'🧩 علاجي':'')||'عادي';
 default:return '—';
 }
}
function itTable(rows,columns){
 return '<div class="it-scroll"><table class="it-roster"><thead><tr>'+
 columns.map(([key,title])=>'<th>'+itEsc(title)+'</th>').join('')+
 '</tr></thead><tbody>'+
 rows.map(r=>'<tr>'+columns.map(([key])=>'<td>'+itCell(r,key)+'</td>').join('')+'</tr>').join('')+
 '</tbody></table></div>';
}
const itCore=[['number','الرقم'],['name','اسم الطالب'],['class_name','الشعبة']];
function itCards(s){
 const summary=s.summary||{};
 const metrics=[['👥','الطلاب',summary.students],['🏫','الشعب',summary.classes?.length||0],
 ['📘','أوراق ومهام العمل',summary.work_items],['📚','موارد المكتبة',summary.library_items],
 ['🎓','مشاغل مهنية',summary.workshops],['🏆','محاولات المسابقة',summary.contest_attempts]];
 return '<div class="it-metrics">'+metrics.map(([icon,title,value])=>
  '<article><span>'+icon+'</span><strong>'+itNum(value)+'</strong><small>'+title+'</small></article>').join('')+'</div>';
}
function itFilteredTable(){
 const rows=itRows();const columns=itState.tab==='assessment'?[...itCore,['assessment','المجموع الموثق'],
  ['diagnostic','التشخيصي'],['plus','A+'],['minus','A−']]:
  itState.tab==='competition'?[...itCore,['contest','المحاولات'],['completed','الوحدات المنجزة']]:
  itState.tab==='enrichment'?[...itCore,['track','المسار التعليمي']]:itCore;
 return '<div class="it-filter"><label>الشعبة<select id="itClass">'+
  '<option value="all">الشعب الثلاث</option>'+['السادس / ٤','السادس / ٥','السادس / ٦'].map(x=>
  '<option value="'+itEsc(x)+'"'+(itState.className===x?' selected':'')+'>'+itEsc(x)+'</option>').join('')+
  '</select></label><label>بحث بالاسم أو رقم المتابعة<input id="itSearch" value="'+itEsc(itState.search)+'" placeholder="الاسم أو الرقم ١–٩٨"></label>'+
  '<strong>'+itNum(rows.length)+' طالبًا</strong></div>'+
  itTable(rows,columns);
}
function itModules(){
 const s=auth.itOverview||{modules:{}};
 const m=s.modules||{};
 const item=(x)=>'<article><b>'+itEsc(x.title)+'</b>'+
  '<small>'+(x.published?'منشور':'غير منشور')+'</small></article>';
 return '<div class="it-modules">'+
 '<section><h3>أوراق العمل والمهام</h3>'+ (m.works||[]).slice(0,45).map(item).join('')+'</section>'+
 '<section><h3>المكتبة والمواد</h3>'+(m.library||[]).slice(0,45).map(item).join('')+'</section>'+
 '<section><h3>مشاغل الإنماء المهني</h3>'+(m.workshops||[]).map(x=>
  '<article><b>'+itEsc(x.title)+'</b><small>'+itNum(x.duration_minutes)+' دقيقة</small></article>').join('')+'</section>'+
 '</div>';
}
function itQuickLinks(){
 const sections=[['learning','📘 التعليم والتعلّم'],['work','📝 مهام العمل وأوراقه'],
 ['workshops','🎓 مشاغل الإنماء المهني'],['library','📚 المكتبة الرقمية'],
 ['question_bank','🧩 بنك الأسئلة'],['science_news','📰 الأخبار العلمية'],
 ['mixer','🥭 خلاط الرياضيات'],['contests','🏆 المسابقات'],
 ['print_center','🖨️ مركز الطباعة'],['adaptive','🎯 التدريب التكيفي']];
 return '<div class="it-quick-links">'+sections.map(([route,label])=>
  '<button type="button" data-route="'+route+'">'+label+'</button>').join('')+'</div>';
}
function itStudentDetails(){
 const row=auth.itOverview?.students?.find(s=>Number(s.number)===Number(itState.selected));
 if(!row)return '';
 const map={oral_1:'شفوي ١',oral_2:'شفوي ٢',
 homework_1:'واجب ١',homework_2:'واجب ٢',
 question_1:'سؤال قصير ١',question_2:'سؤال قصير ٢',
 exam_1:'اختبار قصير ١',exam_2:'اختبار قصير ٢',
 project:'المشروع',final_exam:'الاختبار النهائي'};
 return '<aside class="it-student-detail"><div><h2>بيانات المتابعة — رقم '+itNum(row.number)+'</h2>'+
 '<p>'+itEsc(row.name)+' • '+itEsc(row.class_name)+'</p></div>'+
 '<button type="button" data-it-close>إغلاق</button>'+
 '<div class="it-student-marks">'+Object.entries(map).map(([key,label])=>
 '<article><small>'+label+'</small><b>'+itNum(row.assessments?.[key])+'</b></article>').join('')+'</div>'+
 '<p>المجموع: <strong>'+itNum(row.assessment_total)+'</strong> • التفاعل A+: '+itNum(row.a_plus)+
 ' • التفاعل A−: '+itNum(row.a_minus)+
 ' • وحدات المسابقة المنجزة: '+itNum(row.contest_completed_units)+'</p></aside>';
}
function itPage(){
 const d=auth.itOverview;
 if(!d)return '<div class="container it-page"><h2>مشرف تقنية المعلومات</h2><p>جارٍ تحميل بيانات العرض...</p></div>';
 let main=itState.tab==='overview'?itCards(d)+
  '<h3>الانتقال إلى أقسام المنصة</h3>'+itQuickLinks()+
  '<h3>إحصائيات الشعب</h3>'+itTable((d.summary?.classes||[]).map((r,i)=>({number:i+1,name:r.class_name,class_name:r.class_name,assessment_total:r.records})),
   [['number','م'],['name','الشعبة'],['assessment','سجلات التقويم']]):
 itState.tab==='resources'?itModules():
 itState.tab==='news'?'<div class="it-quick-links"><button data-route="science_news">📰 الأخبار والثقافة والعلوم</button>'+
 '<button data-route="workshops">🎓 المشاغل المهنية</button></div>':itFilteredTable();
 return '<div class="container it-page" dir="rtl"><header class="it-hero">'+
 '<div><span>🔐 دخول مشرفي تقنية المعلومات</span><h1>لوحة الاطلاع والمتابعة</h1>'+
 '<p>يمكنك استعراض الأقسام والبيانات المسموح بها دون تعديل. أرقام الطلاب هنا تسلسلية من ١ إلى ٩٨ ولا تُعرض الأرقام المدرسية.</p></div>'+
 '<strong class="it-readonly">للاطلاع فقط</strong></header>'+
 '<nav class="it-tabs">'+IT_VIEWS.map(([id,label])=>
 '<button type="button" data-it-tab="'+id+'" class="'+(itState.tab===id?'selected':'')+'">'+label+'</button>').join('')+'</nav>'+
 main+itStudentDetails()+'<footer class="it-privacy">التقارير في هذه اللوحة للقراءة، ولا تحتوي على أرقام الهوية المدرسية أو رموز الطلاب السرية.</footer></div>';
}
const itOldStaffPanel=staffPanel;
staffPanel=function(){return itOnly()?itPage():itOldStaffPanel();};
const itOldAttach=attach;
attach=function(){
 itOldAttach();
 document.querySelectorAll('[data-it-tab]').forEach(el=>el.addEventListener('click',()=>{
  itState.tab=el.dataset.itTab;render();
 }));
 document.getElementById('itClass')?.addEventListener('change',el=>{
  itState.className=el.target.value;render();
 });
 document.querySelectorAll('[data-it-open]').forEach(el=>el.addEventListener('click',()=>{
  itState.selected=Number(el.dataset.itOpen);render();
 }));
 document.querySelectorAll('[data-it-close]').forEach(el=>el.addEventListener('click',()=>{
  itState.selected=null;render();
 }));
 document.getElementById('itSearch')?.addEventListener('change',el=>{
  itState.search=el.target.value;render();
 });
};
