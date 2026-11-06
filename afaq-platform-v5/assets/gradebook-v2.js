/* سجل نتائج آفاق الرياضيات — الشفوي ١٠، الكتابي ١٠، القصيرة ٢٠، الواجب ١٠، المشروع ١٠، منافسات A ٤٠. */
'use strict';
const GB_COMPONENTS=[
 ['oral_score','الشفوي',10],['written_score','الأعمال الكتابية',10],
 ['short1_score','الاختبار القصير الأول',5],['short2_score','الاختبار القصير الثاني',5],
 ['short3_score','الاختبار القصير الثالث',5],['short4_score','الاختبار القصير الرابع',5],
 ['homework_score','الواجب المنزلي',10],['project_score','المشروع الرياضي',10],
 ['a_score','الدرجة الفعلية للمنافسات الصفية A',40]
];
const GB_PLUS=['دائرة الضوء','إجابة مميزة','المعلم الصغير','الحل السريع','مسابقة صفية','مشاركة إيجابية','مبادرة أخرى','ترحيل من الدفتر'];
const GB_MINUS=['إخفاق في مسابقة','التحدث أثناء الشرح','الإهمال','سلوك غير مناسب داخل الصف','سلوك غير مناسب داخل المدرسة','مخالفة أخرى','ترحيل من الدفتر'];
const gbNum=v=>v===null||v===undefined||v===''?'—':new Intl.NumberFormat('ar-OM',{maximumFractionDigits:2}).format(Number(v));
const gbPresent=v=>v===null||v===undefined?'لم تُرصد':gbNum(v);
const gbDate=v=>{try{return new Intl.DateTimeFormat('ar-OM',{dateStyle:'long',timeZone:'Asia/Muscat'}).format(new Date(v||Date.now()))}catch{return '—'}};
const gbErr=code=>({
 invalid_assessment:'درجة غير صحيحة؛ تحقّق من الحدود المخصصة لكل عنصر.',
 invalid_classroom_event:'تحقّق من نوع النقطة وسببها والعدد بين ١ و٢٠.',
 assessment_incomplete:'لا يجوز اعتماد النتيجة قبل رصد جميع العناصر التسعة.',
 assessment_changed_reload:'السجل تغير من جلسة أخرى؛ حدّث بيانات الطالب.',
 reopen_approved_first:'الدرجات معتمدة؛ على المشرف إعادة فتحها أولًا.',
 assessment_not_found:'لا يوجد تقييم مسجل لهذا الطالب.',
 already_approved:'النتيجة معتمدة بالفعل.',
 not_approved:'الدرجات ليست معتمدة حاليًا.'
})[code]||code;
function gbSummary(p,staff=false){
 if(!p||p.demo)return '';
 const a=p.assessment;
 if(!a)return '<section class="panel gb-summary"><h3>📊 نتائج الرياضيات من ١٠٠</h3><p class="notice">'+
  (p.assessment_status==='pending'?'الدرجات قيد الرصد والمراجعة من المشرف.':'لم تُعتمد نتائج هذا الطالب بعد.')+
  '</p><p>الشفوي ١٠، الكتابي ١٠، أربع اختبارات قصيرة × ٥، الواجب ١٠، المشروع ١٠، منافسات A من ٤٠.</p></section>';
 const approved=a.status==='approved';
 const cards=[
 ['الشفوي',a.oral_score,10],['الأعمال الكتابية',a.written_score,10],
 ['الأسئلة القصيرة',a.short_tests,20],['الواجب المنزلي',a.homework_score,10],
 ['المشروع',a.project_score,10],['المنافسات الصفية A',a.a_score,40]
 ];
 const sections=cards.map(x=>'<div><strong>'+gbPresent(x[1])+' / '+gbNum(x[2])+'</strong><small>'+e(x[0])+'</small></div>').join('');
 const detail=GB_COMPONENTS.map(x=>'<tr><td>'+e(x[1])+'</td><td>'+gbPresent(a[x[0]])+' / '+gbNum(x[2])+'</td></tr>').join('');
 const ev=(p.assessment_events||[]).slice(0,30).map(x=>'<tr><td>'+(x.kind==='plus'?'A+':'A−')+'</td><td>'+e(x.category)+'</td><td>'+gbNum(x.points)+'</td><td>'+e(x.note||'—')+'</td><td>'+gbDate(x.created_at)+'</td></tr>').join('');
 return '<section class="panel gb-summary"><h3>📊 '+(staff?'متابعة درجات الطالب':'نتيجتي في مادة الرياضيات')+' — ١٠٠ درجة</h3>'+
 '<p class="gb-approval '+(approved?'gb-approved':'gb-draft')+'">'+(approved?'✓ نتيجة معتمدة من مشرف المنصة':'مسودة قيد الاعتماد — ليست نتيجة نهائية')+'</p>'+
 '<div class="gb-tiles">'+sections+'<div class="gb-final"><strong>'+(a.complete?gbNum(a.total):'—')+' / ١٠٠</strong><small>المجموع الكلي</small></div></div>'+
 '<details class="gb-breakdown"><summary>إظهار تفاصيل التقييمات الأربعة القصيرة وبقية الدرجات</summary>'+
 '<table><thead><tr><th>مجال التقييم</th><th>الدرجة</th></tr></thead><tbody>'+detail+'</tbody></table>'+
 '<p>نقاط الدفتر: A+ = '+gbNum(a.a_plus_points)+'، A− = '+gbNum(a.a_minus_points)+
 '. الفرق الاسترشادي: '+gbNum(a.a_suggested)+' / ٤٠؛ لا يحلّ محل الدرجة الفعلية التي يحددها المشرف.</p>'+
 (ev?'<h4>سجل رصد نقاط A+ وA−</h4><div class="gb-table-scroll"><table><thead><tr><th>النوع</th><th>السبب</th><th>النقاط</th><th>ملاحظات</th><th>التاريخ</th></tr></thead><tbody>'+ev+'</tbody></table></div>':'')+
 '</details>'+
 (approved?'<div class="gb-print-controls"><button class="primary" type="button" data-print-gradebook>🖨️ طباعة شهادة النتائج / حفظ PDF (A4 أفقي)</button></div>'+
 '<div class="gb-print-zone">'+gbCertificate(p)+'</div>':'<p class="muted">تتاح الشهادة بعد رصد جميع الدرجات واعتماد المشرف الرئيسي.</p>')+
 '</section>';
}
function gbPraise(total){
 if(total>=90)return 'تقديرًا لتفوقك المتميز وجهودك المتواصلة في تعلم الرياضيات والمنافسات الصفية، نهنئك على هذا الإنجاز ونتمنى لك دوام الإبداع والتألق.';
 if(total>=80)return 'نُشيد بأدائك المتفوق واجتهادك في الأنشطة والاختبارات والمنافسات الصفية، ونثمن ما بذلته من جهد لتحقيق هذه النتيجة.';
 if(total>=65)return 'نشكر لك حرصك على التعلم والمشاركة الفاعلة في دروس الرياضيات، ونتطلع إلى مزيد من التطور والتميّز.';
 if(total>=50)return 'نثمّن جهودك ومثابرتك في أداء الواجبات والتقييمات، ونشجعك على مواصلة المحاولة والمراجعة والتقدم.';
 return 'نقدّر جهودك ومحاولاتك في التعلم، وندعوك إلى عدم التوقف عن التدريب؛ فكل محاولة خطوة نحو مزيد من الفهم والنجاح.';
}
function gbCertificate(p){
 const a=p?.assessment,st=p?.student||{};
 if(!a||a.status!=='approved'||!a.complete)return '';
 const total=Number(a.total||0),date=gbDate(a.approved_at);
 const qs=[1,2,3,4].map(n=>'<tr><td>الاختبار القصير '+gbNum(n)+'</td><td>'+gbNum(a['short'+n+'_score'])+' / ٥</td></tr>').join('');
 const award=total>=90?'شهادة تفوق وتقدير':'شهادة نتائج وتقدير';
 return '<section class="gb-certificate" id="afaqSchoolGradeCertificate" dir="rtl">'+
 '<div class="gb-flag"><span></span><span></span><span></span></div>'+
 '<div class="gb-cert-head"><div class="gb-icon" aria-hidden="true">🏆</div><div><p>سلطنة عُمان • مدرسة الحسين بن علي للتعليم الأساسي</p>'+
 '<h2>منصة آفاق الرياضيات</h2><h3>'+award+' — مادة الرياضيات</h3></div><div class="gb-icon" aria-hidden="true">🥇</div></div>'+
 '<div class="gb-cert-name"><span>تتقدم المنصة بالشكر والتقدير للطالب</span><strong>'+e(st.full_name||st.display_name||'الطالب')+'</strong>'+
 '<small>'+e(st.class_name||'الصف السادس')+' • الرقم في الشعبة: '+e(st.serial_no??'—')+' • '+e(date)+'</small></div>'+
 '<div class="gb-cert-content"><div class="gb-cert-grades"><table><thead><tr><th>مجال التقييم</th><th>الدرجة المستحقة</th></tr></thead><tbody>'+
 '<tr><td>الشفوي</td><td>'+gbNum(a.oral_score)+' / ١٠</td></tr>'+
 '<tr><td>الأعمال الكتابية</td><td>'+gbNum(a.written_score)+' / ١٠</td></tr>'+
 qs+'<tr class="gb-cert-sub"><td>مجموع الاختبارات القصيرة</td><td>'+gbNum(a.short_tests)+' / ٢٠</td></tr>'+
 '<tr><td>الواجب المنزلي</td><td>'+gbNum(a.homework_score)+' / ١٠</td></tr>'+
 '<tr><td>المشروع الرياضي</td><td>'+gbNum(a.project_score)+' / ١٠</td></tr>'+
 '<tr><td>الدرجة المعتمدة للمنافسات الصفية A</td><td>'+gbNum(a.a_score)+' / ٤٠</td></tr>'+
 '</tbody></table></div><div class="gb-cert-achievement"><div class="gb-cert-emblem">★ <span>'+e(total>=90?'متفوق':total>=75?'مجتهد ومتميز':'روح المثابرة')+'</span> ★</div>'+
 '<p>المهام والتقويمات</p><strong>'+gbNum(a.coursework)+' / ٦٠</strong>'+
 '<p>المنافسات الصفية</p><strong>'+gbNum(a.a_score)+' / ٤٠</strong>'+
 '<div class="gb-cert-total"><span>المجموع النهائي</span><b>'+gbNum(total)+' / ١٠٠</b><small>'+gbNum(total)+'٪</small></div>'+
 '<p class="gb-cert-a">نقاط الدفتر: A+ = '+gbNum(a.a_plus_points)+' وA− = '+gbNum(a.a_minus_points)+'</p>'+
 '<p class="gb-cert-ok">الدرجة معتمدة من مشرف المنصة</p></div></div>'+
 '<div class="gb-cert-praise">'+e(gbPraise(total))+'</div>'+
 '<p class="gb-cert-wish">وفقك الله وسدد خطاك، وإلى مزيد من النجاح والتميّز.</p>'+
 '<p class="gb-cert-legal">وثيقة نتائج صادرة عن منصة آفاق الرياضيات؛ ليست بديلًا عن كشوف درجات المدرسة الرسمية.</p>'+
 '<div class="gb-cert-signatures"><div><b>الإعداد والإشراف</b><strong>الأستاذ سعيد بن جمعة بن عبدالله البريكي</strong></div>'+
 '<div><b>مدير المدرسة</b><strong>الأستاذ عبد الله بن علي العيسائي</strong></div></div></section>';
}
function gbForm(p){
 const a=p?.assessment||{},approved=a.status==='approved';
 const cells=GB_COMPONENTS.map(([k,label,max])=>'<div><label for="gb-'+k+'">'+e(label)+' — من '+gbNum(max)+'</label>'+
 '<input id="gb-'+k+'" name="'+k+'" type="number" min="0" max="'+max+'" step="1" value="'+(a[k]==null?'':e(a[k]))+'" '+(approved?'disabled':'')+' placeholder="لم تُرصد بعد"></div>').join('');
 const fields='<div class="gb-input-grid">'+cells+'</div>';
 const raw='<div class="gb-raw-points"><h4>🏅 سجل المنافسات الصفية A+ وA−</h4>'+
 '<p>النقاط الموجبة للمسابقات والتميز؛ السالبة للإخفاق أو المخالفات. تُرصد أسباب كل واقعة، ثم تُحدد الدرجة الفعلية للمنافسات من ٤٠ يدويًا.</p>'+
 '<div class="gb-tiles"><div><strong>A+ = '+gbNum(a.a_plus_points||0)+'</strong><small>مجموع النقاط الموجبة</small></div>'+
 '<div><strong>A− = '+gbNum(a.a_minus_points||0)+'</strong><small>مجموع النقاط السالبة</small></div>'+
 '<div><strong>'+gbNum(a.a_suggested||0)+' / ٤٠</strong><small>مؤشر استرشادي فقط</small></div></div>'+
 (approved?'<p class="notice">أعيد فتح الدرجة المعتمدة أولًا قبل تعديل نقاط المنافسات.</p>':
 '<form id="gbEventForm"><div class="gb-input-grid">'+
 '<div><label>نوع الرصد</label><select id="gbKind" name="kind"><option value="plus">A+ موجب</option><option value="minus">A− سالب</option></select></div>'+
 '<div><label>سبب الرصد</label><select id="gbCategory" name="category">'+GB_PLUS.map(x=>'<option value="'+e(x)+'">'+e(x)+'</option>').join('')+'</select></div>'+
 '<div><label>عدد النقاط</label><input name="points" type="number" min="1" max="20" value="1" required></div>'+
 '<div><label>توضيح اختياري</label><input name="note" type="text" maxlength="400" placeholder="مثال: الفوز في دائرة الضوء"></div></div>'+
 '<button class="soft" type="submit">إضافة نقطة موثقة في سجل A</button></form>')+'</div>';
 const save=approved?'':('<button class="primary" type="submit">💾 حفظ درجات المسودة</button>');
 const status='<p class="gb-approval '+(approved?'gb-approved':'gb-draft')+'">'+(approved?'✓ هذه الدرجة معتمدة':'مسودة لم تُعتمد بعد')+'</p>';
 const admin=isAdmin()?(approved?
 '<button type="button" class="outline gb-reopen" id="gbReopen">🔓 إعادة فتح الدرجة المعتمدة للتعديل</button>':
 '<button type="button" class="primary gb-approve" id="gbApprove" '+(!a.complete?'disabled':'')+'>✓ اعتماد النتيجة النهائية ونشرها للطالب</button>')+
 '<button type="button" class="outline" id="gbAudit">سجل عمليات التعديل والاعتماد</button>':'';
 return '<section class="gb-editor"><h3>📝 توزيع الـ١٠٠ درجة واعتماد المشرف</h3>'+
 '<p>الشفوي ١٠ + الكتابي ١٠ + ٤ قصيرة × ٥ = ٢٠ + الواجب ١٠ + المشروع ١٠ = ٦٠، وتضاف درجة منافسات A الفعلية من ٤٠.</p>'+
 status+'<form id="gbAssessmentForm">'+fields+'<div class="gb-form-buttons">'+save+'</div></form>'+
 raw+'<div class="gb-form-buttons">'+admin+'</div><div id="gbAuditOutput"></div></section>';
}
const gbOriginalPersonalPanel=personalPanel,gbOriginalStudentAdmin=studentAdmin;
const gbOriginalStaffPanel=staffPanel,gbOriginalStaffOverview=staffOverview,gbOriginalAttachPortal=attachPortal;
personalPanel=function(p){
 const page=gbOriginalPersonalPanel(p);
 return p&&!p.demo?page.replace(scoreTiles(scoreView(p)),gbSummary(p,false)):page;
};
studentAdmin=function(){
 let page=gbOriginalStudentAdmin();
 if(!auth.selectedStudent)return page;
 if(auth.selectedProfile){
  const old=scoreTiles(scoreView(auth.selectedProfile));
  page=page.replace(old,gbSummary(auth.selectedProfile,true));
 }
 page=page.replace(/<form id="scoreForm">[\s\S]*?<\/form>/,gbForm(auth.selectedProfile));
 return page;
};
if(!staffMenu.some(x=>x[0]==='approvals'))staffMenu.push(['approvals','اعتماد النتائج']);
staffPanel=function(){
 if(auth.section!=='approvals'||!isAdmin())return gbOriginalStaffPanel();
 const tabs=staffMenu.map(([key,title])=>'<button class="chip '+(auth.section===key?'sel':'')+'" data-tab="'+e(key)+'">'+e(title)+'</button>').join('');
 const rows=(auth.roster||[]).filter(x=>x.status==='draft'||x.status==='approved');
 const stats='<div class="gb-tiles"><div><strong>'+gbNum(rows.filter(x=>x.status==='draft').length)+'</strong><small>مسودات تحتاج مراجعة</small></div>'+
 '<div><strong>'+gbNum(rows.filter(x=>x.status==='approved').length)+'</strong><small>نتائج معتمدة</small></div></div>';
 const entries=rows.map(x=>'<div class="admin-row"><span><b>'+e(x.full_name||x.display_name)+'</b> — '+e(x.class_name)+' • '+gbNum(x.serial_no)+
 ' — '+(x.status==='draft'?'قيد الاعتماد':'معتمد: '+gbNum(x.total)+' / ١٠٠')+'</span>'+
 '<button class="soft" data-gb-open="'+e(x.class_name)+'|'+gbNum(x.serial_no)+'">فتح سجل الطالب</button></div>').join('');
 return '<div class="dashboard-banner"><div><h2>مراجعة واعتماد نتائج الطلاب</h2>'+
 '<p>المشرف الرئيسي وحده يعتمد النتائج ويعيد فتحها للمراجعة. وتبقى المسودات غير ظاهرة للطلاب.</p></div>'+
 '<button class="outline" id="portalLogout">خروج آمن</button></div>'+
 '<div class="chips">'+tabs+'</div>'+(auth.error||auth.message?infoMessage():'')+
 '<section class="panel"><h3>سجل الاعتماد المدرسي — مستقل عن مسابقة النجوم</h3>'+stats+
 '<p>تحقق من الدرجات التسع، بما فيها الدرجة الفعلية لمنافسات A من ٤٠، قبل الاعتماد.</p>'+
 (entries||'<p>لا توجد مسودات مسجلة بعد. استخدم قسم «الطلاب والدرجات» لبدء الرصد.</p>')+'</section>';
};
staffOverview=function(){
 const html=gbOriginalStaffOverview();
 return html.replaceAll('تقييمًا، المتوسط','نتيجة معتمدة، المتوسط').replaceAll('التقييم: لم يرصد','التقييم: لم يُعتمد');
};
const gbRefresh=async (profile,message)=>{
 auth.selectedProfile=profile;auth.error='';auth.message=message;
 try{const [d,r]=await Promise.all([api('dashboard'),api('public_roster')]);auth.stats=d;auth.roster=r.students||[]}catch{}
 render();
};
const gbSelected=()=>auth.selectedStudent;
function gbPrint(){
 if(!document.getElementById('afaqSchoolGradeCertificate'))return;
 document.body.classList.add('afaq-print-school-grade');
 window.print();
}
window.addEventListener('afterprint',()=>document.body.classList.remove('afaq-print-school-grade'));
attachPortal=function(){
 gbOriginalAttachPortal();
 document.querySelectorAll('[data-print-gradebook]').forEach(el=>el.addEventListener('click',gbPrint));
 document.querySelectorAll('[data-gb-open]').forEach(el=>el.addEventListener('click',async()=>{
  const pair=el.dataset.gbOpen.split('|'),student=(auth.students||[]).find(x=>x.class_name===pair[0]&&gbNum(x.serial_no)===pair[1]);
  if(!student)return;
  auth.selectedStudent=student.student_id;auth.selectedProfile=null;auth.section='students';
  try{auth.selectedProfile=(await api('profile',{student_id:student.student_id})).profile;auth.error=''}catch(err){auth.error=err.message}
  render();
 }));
 document.getElementById('gbKind')?.addEventListener('change',ev=>{
  const types=ev.target.value==='plus'?GB_PLUS:GB_MINUS;
  const sel=document.getElementById('gbCategory');
  if(sel)sel.innerHTML=types.map(x=>'<option value="'+e(x)+'">'+e(x)+'</option>').join('');
 });
 document.getElementById('gbAssessmentForm')?.addEventListener('submit',async ev=>{
  ev.preventDefault();const student=gbSelected();if(!student)return;
  const data=new FormData(ev.currentTarget),fields={};
  for(const [key] of GB_COMPONENTS){const raw=String(data.get(key)??'').trim();fields[key]=raw===''?null:Number(raw)}
  try{const result=await api('save_assessment',{student_id:student,
    expected_updated_at:auth.selectedProfile?.assessment?.updated_at||null,...fields});
   await gbRefresh(result.profile,'حُفظت الدرجات كمسودة. لن تُنشر للطالب حتى تعتمد جميع عناصرها.')}
  catch(err){auth.error=gbErr(err.message);render()}
 });
 document.getElementById('gbEventForm')?.addEventListener('submit',async ev=>{
  ev.preventDefault();const student=gbSelected();if(!student)return;
  const data=new FormData(ev.currentTarget);
  try{const result=await api('record_a_event',{student_id:student,
   expected_updated_at:auth.selectedProfile?.assessment?.updated_at||null,
   kind:data.get('kind'),category:data.get('category'),points:Number(data.get('points')),
   note:String(data.get('note')||'')});
   await gbRefresh(result.profile,'حُفظت نقاط A+ أو A− مع السبب، دون تغيير الدرجة النهائية المعتمدة من ٤٠.')}
  catch(err){auth.error=gbErr(err.message);render()}
 });
 for(const [id,action,success] of [['gbApprove','approve_assessment','تم اعتماد الدرجة ونشرها للطالب.'],
                                  ['gbReopen','reopen_assessment','أعيد فتح الدرجة للمراجعة، ولم تعد معتمدة أمام الطالب.']]){
  document.getElementById(id)?.addEventListener('click',async()=>{
   if(!isAdmin()||!gbSelected())return;
   if(!window.confirm(action==='approve_assessment'?'اعتماد جميع الدرجات ونشرها للطالب؟':'إلغاء الاعتماد مؤقتًا وإعادة فتح الدرجات؟'))return;
   try{const result=await api(action,{student_id:gbSelected(),
     expected_updated_at:auth.selectedProfile?.assessment?.updated_at||null});
    await gbRefresh(result.profile,success)}
   catch(err){auth.error=gbErr(err.message);render()}
  });
 }
 document.getElementById('gbAudit')?.addEventListener('click',async()=>{
  try{const r=await api('assessment_audit',{student_id:gbSelected()});
   const box=document.getElementById('gbAuditOutput');
   if(box)box.innerHTML='<h4>آخر إجراءات الرصد والاعتماد</h4>'+
    (r.events||[]).map(x=>'<p>'+e(x.action)+' • '+e(x.actor_username)+' • '+gbDate(x.created_at)+'</p>').join('')||'لا توجد عمليات';
  }catch(err){auth.error=gbErr(err.message);render()}
 });
};
