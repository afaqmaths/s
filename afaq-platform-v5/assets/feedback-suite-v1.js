'use strict';
/* آفاق ماث — ربط الرصد بالتغذية الراجعة والنتائج الفردية والصفية والعامة */
const feedbackState={
 scope:'class',className:'السادس / ٤',track:'all',orientation:'landscape',
 report:null,loadedKey:'',loadingKey:'',error:'',
 detail:null,detailKey:'',detailLoading:'',
 selectedKey:'',selectedLoading:'',selectedPaths:null,selectedError:''
};
const FB_TRACKS={remedial:'علاجي',enrichment:'إثرائي',standard:'متابعة عادية'};
const fbText=v=>typeof studyEsc==='function'?studyEsc(v===undefined||v===null?'':v):String(v||'');
const fbNum=v=>v===null||v===undefined?'—':new Intl.NumberFormat('ar-OM',{maximumFractionDigits:2}).format(Number(v)||0);
const fbPct=v=>v===null||v===undefined?'—':fbNum(v)+'٪';
const fbReasons=(reasons,track)=>((reasons||[]).filter(r=>!track||r.track===track)
 .map(r=>r.label+(r.percentage===null||r.percentage===undefined?' (ملاحظة علمية)':(' • '+fbPct(r.percentage))))).join('، ')||'—';
const fbProgress=(s,track)=>s.progress_by_track?.[track]||{
 total_tasks:track==='remedial'?12:16,completed:0,first_correct:0,correct:0,
 attempts:0,improvement_percent:0,initial_percent:0,current_percent:0
};
function fbStatus(s){
 const tracks=s.tracks||[],historical=[];
 return tracks.length?tracks.map(t=>FB_TRACKS[t]||t).join(' + '):'متابعة عادية / لم يرصد سبب خاص';
}
function fbGroupText(p){
 const reason=(p.reasons||[]).map(r=>r.label+(r.percentage===null||r.percentage===undefined?' (ملاحظة علمية)':' • '+fbPct(r.percentage))).join('، ');
 return reason||'متابعة وتوثيق نتائج تدريب سابق';
}
const FB_CLASS_NAMES=['السادس / ٤','السادس / ٥','السادس / ٦'];
const fbRatio=(part,total)=>total?fbNum(Math.round(part/total*1000)/10)+'٪':'٠٪';
const fbHasTrack=(student,track)=>Array.isArray(student.tracks)&&student.tracks.includes(track);
function fbCountStats(rows){
 const count=rows.length,remedial=rows.filter(s=>fbHasTrack(s,'remedial')).length,
  enrichment=rows.filter(s=>fbHasTrack(s,'enrichment')).length,
  both=rows.filter(s=>fbHasTrack(s,'remedial')&&fbHasTrack(s,'enrichment')).length;
 return {count,remedial,enrichment,both,
  started:rows.filter(s=>['remedial','enrichment'].some(t=>(s.progress_by_track?.[t]?.completed||0)>0)).length};
}
function fbSummaryCards(rows){
 const data=fbCountStats(rows);
 const tiles=[
  ['إجمالي الطلاب',data.count,null],
  ['الخطة العلاجية • ≤٥٠٪',data.remedial,fbRatio(data.remedial,data.count)],
  ['الخطة الإثرائية • ≥٨٥٪',data.enrichment,fbRatio(data.enrichment,data.count)],
  ['مؤهلون للمسارين',data.both,fbRatio(data.both,data.count)],
  ['بدؤوا أنشطة المتابعة',data.started,fbRatio(data.started,data.count)]
 ];
 return '<div class="fb-stats">'+tiles.map(([label,n,pct])=>
  '<article><strong>'+fbNum(n)+'</strong><span>'+label+'</span>'+
  (pct!==null?'<em>'+pct+' من إجمالي الطلاب</em>':'<em>طالبًا في النطاق المحدد</em>')+'</article>').join('')+'</div>'+
  '<p class="fb-stat-footnote">النسبة = عدد الطلاب المؤهلين ÷ إجمالي الطلاب المسجلين × ١٠٠. الطالب الذي يستحق العلاج والإثراء في مهارتين مختلفتين يُحتسب في المسارين.</p>';
}
function fbClassStats(rows){
 const all=rows||[],visible=FB_CLASS_NAMES.some(name=>all.some(s=>s.class_name===name));
 if(!visible)return '';
 const subsets=FB_CLASS_NAMES.map(name=>[name,all.filter(s=>s.class_name===name)])
  .filter(([,group])=>group.length);
 if(subsets.length<2)return '';
 subsets.push(['إجمالي الشعب',all]);
 return '<section class="fb-class-comparison"><h3>الإحصائيات حسب الشعبة — العدد والنسبة</h3>'+
  '<div class="fb-table-wrap"><table class="fb-report-table fb-class-table"><thead><tr>'+
  '<th>الشعبة</th><th>عدد الطلاب</th><th>العلاجي (≤٥٠٪)</th><th>نسبته</th>'+
  '<th>الإثرائي (≥٨٥٪)</th><th>نسبته</th><th>المساران معًا</th></tr></thead><tbody>'+
  subsets.map(([name,group])=>{
   const stats=fbCountStats(group);
   return '<tr><th>'+fbText(name)+'</th><td>'+fbNum(stats.count)+'</td>'+
    '<td>'+fbNum(stats.remedial)+'</td><td>'+fbRatio(stats.remedial,stats.count)+'</td>'+
    '<td>'+fbNum(stats.enrichment)+'</td><td>'+fbRatio(stats.enrichment,stats.count)+'</td>'+
    '<td>'+fbNum(stats.both)+'</td></tr>';
  }).join('')+'</tbody></table></div></section>';
}
function fbStudentBand(student){
 const d=student?.differentiation||{};
 const enrich=Math.max(0,Number(d.enrichment_count)||0),remedy=Math.max(0,Number(d.remedial_count)||0);
 if(remedy)return {css:'fb-band-pink',label:'علاجي',note:'علاج: '+fbNum(remedy)+' • إثراء: '+fbNum(enrich)};
 if(enrich>3)return {css:'fb-band-green',label:'إثراء متكرر',note:'إثراء: '+fbNum(enrich)+' مؤشرات'};
 if(enrich)return {css:'fb-band-yellow',label:'إثرائي',note:'إثراء: '+fbNum(enrich)+' من ٣'};
 return {css:'fb-band-blue',label:'عادي',note:'متابعة عادية'};
}
function fbColorLegend(){
 return '<div class="fb-color-legend" aria-label="دليل ألوان تصنيف الطلاب">'+
 '<b>مفتاح الألوان:</b><span class="fb-key fb-key-green">أخضر فاتح: إثراء أكثر من ٣</span>'+
 '<span class="fb-key fb-key-yellow">أصفر: إثراء من ١ إلى ٣</span>'+
 '<span class="fb-key fb-key-pink">وردي: علاج</span>'+
 '<span class="fb-key fb-key-blue">أزرق فاتح: عادي</span>'+
 '<small>اللون الوردي له الأولوية عند اجتماع المسارين. لا تُكرر مؤشرات التقييم الواحد عند حساب مرات الإثراء.</small></div>';
}
function fbRowsForReport(report,track='all'){
 const rows=[];
 for(const s of report?.students||[]){
  const types=['remedial','enrichment'].filter(t=>s.tracks?.includes(t)||
   (s.progress_by_track?.[t]?.completed||0)>0);
  for(const type of types){
   if(track!=='all'&&track!==type)continue;
   rows.push({student:s,track:type,p:fbProgress(s,type),active:!!s.tracks?.includes(type)});
  }
  if(!types.length&&track==='all')rows.push({student:s,track:'standard',p:null,active:true});
 }
 return rows;
}
function fbDetailedTable(report,track='all'){
 const rows=fbRowsForReport(report,track);
 if(!rows.length)return '<div class="fb-empty">لم تُسجَّل تكليفات في النطاق المحدد حتى الآن.</div>';
 return '<div class="fb-table-wrap"><table class="fb-report-table"><thead><tr>'+
 '<th>م</th><th>الطالب</th><th>الشعبة</th><th>المسار</th><th>سبب التكليف</th>'+
 '<th>الأسئلة</th><th>المنجزة</th><th>أول صحيح</th><th>آخر صحيح</th>'+
 '<th>التحسن</th><th>المحاولات</th></tr></thead><tbody>'+
 rows.map(x=>{
  const s=x.student,p=x.p,band=fbStudentBand(s);
  return '<tr class="'+band.css+'" title="'+fbText(band.note)+'"><td>'+fbNum(s.serial_no)+'</td><td>'+fbText(s.name)+
   '<small class="fb-band-marker">'+fbText(band.label)+' • '+fbText(band.note)+'</small></td><td>'+fbText(s.class_name)+'</td>'+
  '<td>'+fbText(FB_TRACKS[x.track]||x.track)+(x.active?'':' (سابق)')+'</td>'+
  '<td>'+fbText(fbReasons(s.reasons,x.track))+'</td>'+
  '<td>'+fbNum(p?.total_tasks)+'</td><td>'+fbNum(p?.completed)+'</td>'+
  '<td>'+fbNum(p?.first_correct)+'</td><td>'+fbNum(p?.correct)+'</td>'+
  '<td>'+fbPct(p?.improvement_percent)+'</td><td>'+fbNum(p?.attempts)+'</td></tr>';
 }).join('')+'</tbody></table></div>';
}
function fbPrintDetail(paths){
 if(!paths?.length)return '<p>لم تُسجَّل خطة علاجية أو إثرائية لهذا الطالب حتى الآن.</p>';
 const p=paths[0],who=p.student||{};
 return '<h2>تقرير التغذية الراجعة الفردي</h2><p>الطالب: '+fbText(who.name)+
 ' • الشعبة: '+fbText(who.class_name)+' • الرقم المتسلسل: '+fbNum(who.serial_no)+'</p>'+
 paths.map(p=>{
  const tasks=p.tasks||[];
  return '<section class="fb-print-group"><h3>'+fbText(FB_TRACKS[p.track])+
   (p.archived?' — سجل سابق':'')+'</h3>'+
   '<p><b>سبب التكليف:</b> '+fbText(fbGroupText(p))+'</p>'+
   '<p>الأسئلة: '+fbNum(p.completed)+' / '+fbNum(p.total_tasks)+
   ' • قبل التغذية: '+fbNum(p.first_correct)+' • بعد المتابعة: '+fbNum(p.correct)+
   ' • التحسن: '+fbPct(p.improvement_percent)+' • المحاولات: '+fbNum(p.attempts)+'</p>'+
   '<table class="fb-report-table"><thead><tr><th>الوحدة</th><th>السؤال</th><th>الحالة</th>'+
   '<th>الأولى</th><th>الأخيرة</th><th>المحاولات</th></tr></thead><tbody>'+
   tasks.map(t=>'<tr><td>'+fbNum(t.unit)+'</td><td>'+fbText(t.question)+'</td>'+
    '<td>'+(t.completed?'أجاب':'لم يجب')+'</td>'+
    '<td>'+(t.completed?(t.first_correct?'صحيحة':'غير صحيحة'):'—')+'</td>'+
    '<td>'+(t.completed?(t.correct?'صحيحة':'غير صحيحة'):'—')+'</td>'+
    '<td>'+fbNum(t.attempts)+'</td></tr>').join('')+'</tbody></table></section>';
 }).join('');
}
function fbPaperContents(){
 if(feedbackState.scope==='student')return fbPrintDetail(feedbackState.detail?.paths||[]);
 if(!feedbackState.report)return '<p>لم يُحمّل التقرير بعد.</p>';
 const label=feedbackState.scope==='class'?'كشف التغذية الراجعة — '+fbText(feedbackState.className):'الكشف العام — جميع الشعب';
 return '<h2>'+label+'</h2>'+fbSummaryCards(feedbackState.report.students||[])+
 fbClassStats(feedbackState.report.students||[])+fbColorLegend()+
 '<p>معيار التمايز: علاجي عند ٥٠٪ فأقل، إثرائي عند ٨٥٪ فأكثر؛ المصدر كل عنصر تحصيلي مرصود أو ملاحظة علمية تستلزم دعمًا.</p>'+
 fbDetailedTable(feedbackState.report,feedbackState.track);
}
function fbPrintablePage(body,orientation){
 return '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">'+
 '<title>تقرير التغذية الراجعة — منصة آفاق ماث</title>'+
 '<style>@page{size:A4 '+orientation+';margin:9mm}'+
 '*{box-sizing:border-box}body{font-family:Tahoma,Arial,sans-serif;color:#23425d;font-size:9pt;direction:rtl}'+
 'header{text-align:center;border-bottom:3px double #ac843f;padding-bottom:3mm}h1{font-size:18pt;color:#145378;margin:1mm}'+
 'h2{font-size:15pt;color:#976c2a}h3{font-size:12pt;color:#1b6683}'+
 '.fb-stats{display:flex;flex-wrap:wrap;gap:2mm;margin:3mm 0}.fb-stats article{border:1px solid #cee0e9;padding:2mm 3mm;display:flex;gap:2mm;flex-direction:column;text-align:center}'+
 '.fb-stats article em{font-size:8pt;font-weight:bold;font-style:normal}.fb-stat-footnote{font-size:8pt;margin:2mm 0}.fb-class-comparison{margin:5mm 0}.fb-class-comparison h3{margin:3mm 0}'+
 '.fb-table-wrap{width:100%;overflow:visible}table{width:100%;border-collapse:collapse;font-size:7pt;table-layout:fixed}'+
 '.fb-report-table tbody tr.fb-band-green td{background:#dcf4e2}.fb-report-table tbody tr.fb-band-yellow td{background:#fff3c2}'+
 '.fb-report-table tbody tr.fb-band-pink td{background:#ffe0e9}.fb-report-table tbody tr.fb-band-blue td{background:#e3f2ff}'+
 '.fb-report-table tbody td{print-color-adjust:exact;-webkit-print-color-adjust:exact}'+
 '.fb-band-marker{display:block;font-size:7pt;margin-top:1mm}.fb-color-legend{display:flex;gap:2mm;flex-wrap:wrap;margin:3mm 0;font-size:8pt}'+
 '.fb-color-legend span{padding:1mm 2mm;border:1px solid #abc}.fb-color-legend small{flex-basis:100%}'+
 'th,td{padding:1.5mm 1mm;border:1px solid #adbcc8;overflow-wrap:anywhere}th{background:#eaf6ff}'+
 'tr{break-inside:avoid}footer{border-top:2px double #b69a54;margin-top:7mm;padding-top:4mm;display:flex;justify-content:space-between;gap:4mm}'+
 '.fb-print-group{margin:5mm 0;page-break-inside:avoid}p{line-height:1.65}'+
 '</style></head><body><header><p>سلطنة عُمان • وزارة التربية والتعليم</p>'+
 '<h1>مدرسة الحسين بن علي للتعليم الأساسي</h1><p>منصة آفاق ماث — نتائج الدعم والإثراء</p></header>'+
 '<main>'+body+'</main><footer><span>الإعداد والإشراف: الأستاذ سعيد بن جمعة بن عبدالله البريكي</span>'+
 '<span>مدير المدرسة: الأستاذ عبد الله بن علي العيسائي</span></footer></body></html>';
}
function fbPrintHTML(html,orientation='portrait'){
 const popup=window.open('','_blank');
 if(!popup){window.alert('اسمح بفتح نافذة الطباعة في إعدادات المتصفح.');return}
 const page=fbPrintablePage(html,orientation==='landscape'?'landscape':'portrait');
 popup.document.open();popup.document.write(page);
 popup.onload=()=>{popup.focus();popup.print()};
 popup.document.close();
}
function afFeedbackPrintPath(path,orientation='portrait'){
 if(!path)return;
 fbPrintHTML(fbPrintDetail([path]),orientation);
}
function fbPrintLoaded(){
 fbPrintHTML(fbPaperContents(),feedbackState.orientation);
}
function fbReportHeader(){
 return '<section class="fb-hero"><span>التقويم المستمر والتمايز التعليمي</span>'+
 '<h1>🌱 التغذية الراجعة والعلاج والإثراء 🌟</h1>'+
 '<p>يرتبط التكليف بنسبة كل سؤال قصير أو اختبار قصير أو شفوي أو عمل تحصيلي فور حفظه. وتُرصد ملاحظات الضعف العلمي كذلك، مع حفظ الإجابة الأولى والمحاولات والتقدم بعد التغذية الراجعة.</p></section>';
}
function fbReportPage(){
 const rows=feedbackState.report?.students||[];
 return '<div class="container fb-page" dir="rtl">'+fbReportHeader()+
 '<div class="hub-staff-nav"><button type="button" data-tab="overview">لوحة المشرف</button>'+
 '<button type="button" data-tab="students">رصد الدرجات</button>'+
 '<button type="button" data-tab="class_results">كشوف التحصيل</button></div>'+
 '<section class="fb-panel"><h2>تحديد كشف نتائج الدعم والإثراء</h2>'+
 '<div class="fb-controls"><label>نوع الكشف<select id="fbScope">'+
 '<option value="class"'+(feedbackState.scope==='class'?' selected':'')+'>كشف شعبة محددة</option>'+
 '<option value="all"'+(feedbackState.scope==='all'?' selected':'')+'>الكشف العام لجميع الشعب</option>'+
 '<option value="student"'+(feedbackState.scope==='student'?' selected':'')+'>تقرير طالب مفصل</option></select></label>'+
 '<label>الشعبة<select id="fbClass">'+['السادس / ٤','السادس / ٥','السادس / ٦'].map(x=>'<option'+(x===feedbackState.className?' selected':'')+'>'+x+'</option>').join('')+'</select></label>'+
 (feedbackState.scope==='student'?'<label>الطالب<select id="fbStudent">'+
 '<option value="">اختر الطالب...</option>'+
 (auth.students||[]).filter(s=>s.class_name===feedbackState.className)
  .map(s=>'<option value="'+fbText(s.serial_no)+'"'+(String(feedbackState.studentNumber||'')===String(s.serial_no)?' selected':'')+'>'+
 fbNum(s.serial_no)+' — '+fbText(s.full_name||s.display_name)+'</option>').join('')+'</select></label>':'')+
 '<label>نوع الأسئلة<select id="fbTrack"><option value="all"'+(feedbackState.track==='all'?' selected':'')+'>العلاج والإثراء معًا</option>'+
 '<option value="remedial"'+(feedbackState.track==='remedial'?' selected':'')+'>العلاجي فقط</option>'+
 '<option value="enrichment"'+(feedbackState.track==='enrichment'?' selected':'')+'>الإثرائي فقط</option></select></label>'+
 '<label>اتجاه الطباعة<select id="fbOrientation"><option value="landscape"'+(feedbackState.orientation==='landscape'?' selected':'')+'>A4 أفقي</option>'+
 '<option value="portrait"'+(feedbackState.orientation==='portrait'?' selected':'')+'>A4 عمودي</option></select></label></div>'+
 '<div class="fb-toolbar"><button class="hub-primary" id="fbLoad">🔄 تحميل / تحديث النتائج</button>'+
 '<button class="hub-secondary" id="fbPrint" '+(!feedbackState.report&&!feedbackState.detail?'disabled':'')+'>🖨️ طباعة أو حفظ PDF</button></div>'+
 '<p class="fb-note">البيانات سرية للمشرف والمساعد، ولا تظهر للزائر. التقرير يعتمد آخر إجابة لكل سؤال ويعرض مقارنة بالإجابة الأولى، ولا يُغيّر درجات التحصيل الأصلية.</p></section>'+
 (feedbackState.error?'<p class="fb-error">'+fbText(feedbackState.error)+'</p>':'')+
 (feedbackState.loadingKey?'<p class="fb-loading">جارٍ قراءة النتائج من قاعدة البيانات…</p>':'')+
 (feedbackState.scope==='student'&&feedbackState.detail?
  '<section class="fb-panel">'+fbPrintDetail(feedbackState.detail.paths||[])+'</section>':
  feedbackState.scope!=='student'&&feedbackState.report?
   '<section class="fb-panel">'+fbSummaryCards(rows)+fbClassStats(rows)+fbColorLegend()+fbDetailedTable(feedbackState.report,feedbackState.track)+'</section>':
   '<section class="fb-panel"><p>اختر التقرير واضغط «تحميل النتائج» لرؤية المتابعة الفعلية.</p></section>')+
 '</div>';
}
async function fbLoad(force=false){
 if(!['supervisor','supervisor_assistant'].includes(auth.user?.role)||feedbackState.loadingKey)return;
 const key=feedbackState.scope+'|'+feedbackState.className+'|'+(feedbackState.studentNumber||'');
 if(!force&&feedbackState.loadedKey===key)return;
 feedbackState.loadingKey=key;feedbackState.error='';feedbackState.report=null;feedbackState.detail=null;
 if(state.page==='dashboard'&&auth.section==='study_reports')render();
 try{
  const fields={scope:feedbackState.scope,class_name:feedbackState.className};
  if(feedbackState.scope==='student'){
   if(!feedbackState.studentNumber)throw Error('اختر الطالب المطلوب أولًا.');
   fields.student_number=feedbackState.studentNumber;
  }
  const result=await studyRequest('intervention_reports',fields);
  if(key!==feedbackState.scope+'|'+feedbackState.className+'|'+(feedbackState.studentNumber||''))return;
  if(feedbackState.scope==='student')feedbackState.detail=result;
  else feedbackState.report=result;
  feedbackState.loadedKey=key;
 }catch(e){feedbackState.error=e.message}
 finally{feedbackState.loadingKey='';if(state.page==='dashboard'&&auth.section==='study_reports')render()}
}
async function fbLoadSelectedStudent(){
 if(!['supervisor','supervisor_assistant'].includes(auth.user?.role)||!auth.selectedProfile||!auth.selectedStudent)return;
 const student=(auth.students||[]).find(x=>x.student_id===auth.selectedStudent);
 if(!student)return;
 const signature=[auth.selectedStudent,auth.selectedProfile?.assessment?.updated_at||'',
  (auth.selectedProfile?.notes||[]).map(x=>x.id||x.created_at).join(',')].join('|');
 const container=document.getElementById('fbStudentSignals');
 if(!container)return;
 if(feedbackState.selectedKey===signature&&feedbackState.selectedPaths){
  container.innerHTML=fbSelectedHTML(feedbackState.selectedPaths);fbBindSelectedPrint(container);return;
 }
 if(feedbackState.selectedLoading===signature)return;
 feedbackState.selectedLoading=signature;container.innerHTML='<p>جارٍ فحص النسب ورصد الملاحظات العلمية…</p>';
 try{
  const result=await studyRequest('intervention_reports',{
    scope:'student',class_name:student.class_name,student_number:student.serial_no});
  if(auth.selectedStudent!==student.student_id)return;
  feedbackState.selectedPaths=result.paths||[];feedbackState.selectedKey=signature;feedbackState.selectedError='';
  const node=document.getElementById('fbStudentSignals');
  if(node){node.innerHTML=fbSelectedHTML(result.paths||[]);fbBindSelectedPrint(node)}
 }catch(e){
  feedbackState.selectedError=e.message;
  const node=document.getElementById('fbStudentSignals');if(node)node.textContent=e.message;
 }finally{feedbackState.selectedLoading=''}
}
function fbSelectedHTML(paths){
 if(!paths?.length)return '<p>لا توجد إشارات علاجية أو إثرائية نشطة لهذا الطالب وفق درجاته المرصودة أو ملاحظات ضعف التعلم.</p>'+
 '<p>عندما تكون الدرجة ٥٠٪ أو أقل يظهر العلاج، وعندما تبلغ ٨٥٪ فأكثر يظهر الإثراء. أي درجة غير مرصودة لا تؤدي إلى تكليف تلقائي.</p>';
 return paths.map(p=>'<article class="fb-selected-track"><h4>'+
  (p.track==='remedial'?'🌱 نموذج الأسئلة العلاجية':'🌟 نموذج الأسئلة الإثرائية')+
  (p.archived?' — تدريب محفوظ سابقًا':'')+'</h4>'+
  '<p><b>السبب:</b> '+fbText(fbGroupText(p))+'</p>'+
  '<p>الأسئلة '+fbNum(p.total_tasks)+'، المنجز '+fbNum(p.completed)+
  '، الصحيح قبل التغذية '+fbNum(p.first_correct)+'، الصحيح الحالي '+fbNum(p.correct)+
  '، التحسن '+fbPct(p.improvement_percent)+'.</p>'+
  '<details><summary>معاينة النموذج المخصص والأسئلة ونتائج الإجابات</summary>'+
  '<div class="fb-task-preview">'+p.tasks.map(t=>'<p><b>الوحدة '+fbNum(t.unit)+':</b> '+fbText(t.question)+
   ' — '+(t.completed?(t.correct?'أجاب إجابة صحيحة':'يحتاج إلى مراجعة'):'لم يجب بعد')+'</p>').join('')+'</div></details>'+
 '</article>').join('')+
 '<button class="hub-secondary" id="fbPrintSelected">🖨️ طباعة تقرير الطالب وتغذيته الراجعة</button>';
}
function fbBindSelectedPrint(container){
 container.querySelector('#fbPrintSelected')?.addEventListener('click',()=>fbPrintHTML(
  fbPrintDetail(feedbackState.selectedPaths||[]),'portrait'));
}
const fbOldStudentAdmin=studentAdmin;
studentAdmin=function(){
 const base=fbOldStudentAdmin();
 if(!auth.selectedStudent||!auth.selectedProfile)return base;
 return base+'<section class="panel fb-selected-panel"><h3>🎯 المتابعة العلاجية والإثرائية الفورية</h3>'+
 '<p>تظهر الأسئلة الخاصة بالطالب بمجرد حفظ درجة السؤال أو الاختبار أو الشفوي التي تستوفي حدود التمايز، أو تدوين ملاحظة علمية عن الضعف. لا تؤثر هذه الأسئلة على الدرجة الأصلية.</p>'+
 '<div id="fbStudentSignals">جارٍ تحميل خطة الطالب…</div></section>';
};
const fbPreviousStaffPanel=staffPanel;
staffPanel=function(){
 if(auth.section==='study_reports'){
  if(!['supervisor','supervisor_assistant'].includes(auth.user?.role))
   return '<div class="notice">نتائج التغذية الراجعة خاصة بالمشرف والمساعد.</div>';
  return fbReportPage();
 }
 return fbPreviousStaffPanel();
};
const fbOldHubStaffNav=hubStaffNav;
hubStaffNav=function(){
 const prior=fbOldHubStaffNav();
 if(prior.includes('data-tab="study_reports"'))return prior;
 return prior.replace('</div>','<button type="button" data-tab="study_reports"'+
 (auth.section==='study_reports'?' class="selected"':'')+'>📊 التغذية الراجعة</button></div>');
};
const fbOldHubDashboard=hubStaffDashboard;
hubStaffDashboard=function(){
 const html=fbOldHubDashboard();
 return html.replace('<details class="hub-staff-old">',
  '<section class="hub-staff-group"><div class="hub-heading"><h2>التمايز وقياس أثر التدخل</h2></div>'+
  '<div class="hub-gate-grid">'+hubGate('التغذية الراجعة','list-checks',
   'رصد أثر العلاج والإثراء ونتائج الطالب والشعبة والكشف العام','data-tab="study_reports"','green')+
  hubGate('بوابة الدعم','lightbulb','نماذج من الوحدات الثلاث الأولى','data-route="support"','blue')+
  hubGate('بوابة المجيدين','trophy','نماذج متقدمة من الوحدات الأربع','data-route="stars"','gold')+
  '</div></section><details class="hub-staff-old">');
};
const fbOldPrintCenter=hubPrintCenter;
hubPrintCenter=function(){
 const previous=fbOldPrintCenter();
 if(!['supervisor','supervisor_assistant'].includes(auth.user?.role))return previous;
 return previous.replace('<div id="hubPrintPreviewArea"></div></section></div>',
 '<div id="hubPrintPreviewArea"></div><div class="fb-toolbar"><button type="button" class="hub-secondary" data-tab="study_reports">🌱 كشوف العلاج والإثراء وتغذيتها الراجعة</button></div></section></div>');
};
const fbOldHubLoadForTab=hubLoadForTab;
hubLoadForTab=function(id){
 fbOldHubLoadForTab(id);
 if(id==='study_reports'&&['supervisor','supervisor_assistant'].includes(auth.user?.role)&&
    !feedbackState.loadedKey&&!feedbackState.loadingKey)fbLoad();
};
const fbOldAttach=attachPortal;
attachPortal=function(){
 fbOldAttach();
 if(state.page==='dashboard'&&auth.section==='students'&&auth.selectedStudent&&auth.selectedProfile)
  fbLoadSelectedStudent();
 document.getElementById('fbScope')?.addEventListener('change',ev=>{
  feedbackState.scope=ev.target.value;
  feedbackState.report=null;feedbackState.detail=null;feedbackState.loadedKey='';
  feedbackState.orientation=feedbackState.scope==='student'?'portrait':'landscape';
  render();
 });
 document.getElementById('fbClass')?.addEventListener('change',ev=>{
  feedbackState.className=ev.target.value;feedbackState.studentNumber='';feedbackState.loadedKey='';
  feedbackState.report=null;feedbackState.detail=null;render();
 });
 document.getElementById('fbStudent')?.addEventListener('change',ev=>{
  feedbackState.studentNumber=ev.target.value;feedbackState.loadedKey='';feedbackState.detail=null;render();
 });
 document.getElementById('fbTrack')?.addEventListener('change',ev=>{feedbackState.track=ev.target.value;render()});
 document.getElementById('fbOrientation')?.addEventListener('change',ev=>{feedbackState.orientation=ev.target.value});
 document.getElementById('fbLoad')?.addEventListener('click',()=>fbLoad(true));
 document.getElementById('fbPrint')?.addEventListener('click',fbPrintLoaded);
 document.getElementById('portalLogout')?.addEventListener('click',()=>{
  feedbackState.report=null;feedbackState.detail=null;feedbackState.selectedPaths=null;
  feedbackState.loadedKey='';feedbackState.selectedKey='';feedbackState.error='';
 });
};
