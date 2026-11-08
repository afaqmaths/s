'use strict';
const STUDY_API='https://xcwuwflggiwkehzquugz.supabase.co/functions/v1/afaq-learning-paths';
const studyEsc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const studyStaff=()=>['supervisor','supervisor_assistant','director','deputy'].includes(auth.user?.role);
async function studyRequest(action,data={}){
 const token=auth.token||sessionStorage.getItem('afaq_access_token_v2')||'';
 const r=await fetch(STUDY_API,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify({action,...data}),cache:'no-store'});
 let d;try{d=await r.json()}catch{throw Error('تعذر الاتصال بالخادم.')}
 if(!r.ok||!d.ok)throw Error(({unauthorized:'يرجى تسجيل الدخول أولًا.',forbidden:'هذه البيانات غير متاحة لحسابك.',student_not_found:'لم نجد الطالب في الشعبة المحددة.',threshold_not_met:'لم يبلغ الطالب الحد المطلوب للتكريم.'})[d.error]||d.error||'تعذر تحميل البيانات');
 return d;
}
function studyHead(title,description){
 return '<div class="container study-area"><section class="v4-page-intro"><div><span class="v4-eyebrow">برامج آفاق التعليمية</span><h1>'+title+'</h1><p>'+description+'</p></div><div class="v4-corner-art">∑<span>★</span><small>∞</small></div></section>';
}
function studyStars(){
 return studyHead('بوابة الطلاب المجيدين','أنشطة إثرائية مخصصة لمن بلغت نسبته ٨٥٪ فأكثر في أي عنصر تحصيلي مرصود. ظهور الطالب هنا لا يعني نشر اسمه للعموم؛ النشر يتطلب موافقة ولي الأمر واعتماد المدرسة.')+
 '<div class="panel"><h2>🏅 لوحة المجيدين المعتمدين</h2><div id="studyGallery">جارٍ تحميل البيانات المعتمدة…</div></div><div id="studyPrivate"></div></div>';
}
function studySupport(){
 return studyHead('بوابة الدعم والتقدم','أنشطة تأسيسية من الوحدات الثلاث الأولى لكل طالب تبلغ نسبته ٥٠٪ أو أقل في أي سؤال قصير أو اختبار أو شفوي أو عمل تحصيلي، أو تسجل له ملاحظة علمية تدل على الضعف.')+
 '<div class="panel"><h2>🌱 معًا نحو التقدم</h2><p>برنامج تعليمي خاص يساعد على تثبيت المهارات. أسماء الطلاب ودرجاتهم وأنشطتهم الفردية لا تُعرض للزوار أو الزملاء.</p></div><div id="studyPrivate"></div></div>';
}
const studyBaseGeneric=genericSection;
genericSection=function(page){if(page==='stars')return studyStars();if(page==='support')return studySupport();return studyBaseGeneric(page)};
if(!sections.some(x=>x[0]==='support')){const n=sections.findIndex(x=>x[0]==='stars');sections.splice(n+1,0,['support','🌱','بوابة الدعم والتقدم','تدريبات علاجية شخصية من الوحدات الأربع'])}
function galleryHtml(students){
 if(!students.length)return '<p class="muted">لا توجد أسماء معتمدة للنشر حتى الآن. ستظهر بعد رصد التقييمات وتوثيق الموافقات.</p>';
 return '<div class="study-gallery">'+students.map(s=>'<article><span>🏅</span><h3>'+studyEsc(s.name)+'</h3><p>'+studyEsc(s.class_name)+' — رقم '+studyEsc(s.serial_no)+'</p><strong>'+studyEsc(s.score)+'٪</strong></article>').join('')+'</div>';
}
function taskHtml(t,student){
 const radio=t.options.map((v,i)=>'<label><input type="radio" name="answer" value="'+i+'"><span>'+studyEsc(v)+'</span></label>').join('');
 return '<article class="study-task"><span class="tag">الوحدة '+studyEsc(t.unit)+' • '+studyEsc(t.objective)+'</span><h3>'+studyEsc(t.question)+'</h3>'+
 (t.completed?'<p class="study-done '+(t.correct?'ok':'try')+'">'+(t.correct?'✓ وصلت إلى الإجابة الصحيحة':'راجع طريقة الحل ويمكنك المحاولة مجددًا')+
 ' • المحاولات: '+studyEsc(t.attempts||1)+' • أول إجابة: '+(t.first_correct?'صحيحة':'تحتاج إلى مراجعة')+
 ' • آخر إجابة: '+(t.correct?'صحيحة':'تحتاج إلى مراجعة')+
 (t.correct_answer?' — الإجابة: '+studyEsc(t.correct_answer):'')+'</p>':'')+
 (student?'<form class="study-answer" data-task="'+studyEsc(t.task_id)+'"><div class="study-options">'+radio+'</div><button class="soft" type="submit">تحقق من إجابتي</button></form>':'<p class="muted">واجب فردي مخصص لهذا الطالب.</p>')+'</article>';
}

function pathHtml(p,student){
 if(!p)return '<p class="muted">لا توجد بيانات متاحة حتى الآن.</p>';
 const active=p.tracks||[],current=p.current_track||'standard';
 if(!['remedial','enrichment'].includes(p.track)){
  return '<div class="panel"><h3>📘 متابعة التعلم</h3><p>'+(p.score===null?'لم تُرصد درجة تحصيلية بعد.':
   'متوسط الأداء في العناصر المرصودة: '+studyEsc(p.score)+'٪.')+
   ' تظهر أسئلة الدعم عندما تبلغ نسبة أي عنصر ٥٠٪ أو أقل، وأسئلة الإثراء عند ٨٥٪ فأكثر.</p></div>';
 }
 const rem=p.track==='remedial',title=rem?'🌱 خطة الدعم العلاجي':'🌟 خطة الإثراء',
  s=p.student||{},archived=p.archived===true;
 const reasons=(p.reasons||[]).map(r=>'<li>'+studyEsc(r.label)+
  (r.percentage!==null?' — '+studyEsc(r.percentage)+'٪':' — ملاحظة علمية تستلزم الدعم')+'</li>').join('');
 return '<div class="panel study-path-detail" data-study-track="'+p.track+'"><h2>'+title+(archived?' — نتائج سابقة':'')+'</h2>'+
 '<p><strong>'+studyEsc(s.name)+'</strong> — '+studyEsc(s.class_name)+' — الرقم المتسلسل: '+studyEsc(s.serial_no)+'</p>'+
 '<p>تُخصص الأنشطة بحسب <b>نسبة كل عنصر تحصيلي مرصود</b>، وليس مجموع الـ١٠٠ فقط. العلاج عند ٥٠٪ فأقل، والإثراء عند ٨٥٪ فأكثر. ويمكن أن يظهر المساران للطالب إذا توافرت أسباب كل منهما.</p>'+
 (archived?'<p class="notice">السبب التحصيلي السابق لم يعد نشطًا، لكن الإجابات والتقدم السابق محفوظان للمراجعة.</p>':'')+
 (reasons?'<div class="study-reasons"><strong>سبب ظهور هذه الخطة:</strong><ul>'+reasons+'</ul></div>':'')+
 '<div class="study-metrics study-metrics-extended">'+
 '<div><b>'+studyEsc(p.completed)+' / '+studyEsc(p.total_tasks)+'</b><small>الأسئلة المجاب عنها</small></div>'+
 '<div><b>'+studyEsc(p.first_correct)+' / '+studyEsc(p.total_tasks)+'</b><small>الصحيح قبل التغذية الراجعة</small></div>'+
 '<div><b>'+studyEsc(p.correct)+' / '+studyEsc(p.total_tasks)+'</b><small>الصحيح بعد آخر محاولة</small></div>'+
 '<div><b>'+studyEsc(p.improvement_percent>0?'+':'')+studyEsc(p.improvement_percent)+'٪</b><small>مؤشر التحسن</small></div>'+
 '<div><b>'+studyEsc(p.attempts||0)+'</b><small>مجموع المحاولات</small></div>'+
 '</div><div class="study-print-actions"><button type="button" class="soft" data-study-print="'+p.track+'">🖨️ طباعة نتيجتي التعليمية</button></div></div>'+
 '<div class="study-tasks">'+(p.tasks||[]).map(t=>taskHtml(t,student&&!archived)).join('')+'</div>';
}

function studentForms(target){
 target.querySelectorAll('.study-answer').forEach(form=>form.addEventListener('submit',async ev=>{
  ev.preventDefault();const selected=form.querySelector('input[name="answer"]:checked');
  if(!selected){alert('اختر إجابتك أولًا.');return}
  const button=form.querySelector('button');button.disabled=true;
  try{
   const r=await studyRequest('answer_task',{task_id:form.dataset.task,answer_index:Number(selected.value)});
   const message=document.createElement('p');message.className='study-feedback '+(r.correct?'ok':'try');
   message.textContent=r.feedback+' الإجابة الصحيحة: '+r.correct_answer+'. '+r.explanation;
   form.appendChild(message);
   if(r.path){const panel=target;setTimeout(()=>{if(panel.isConnected){panel.innerHTML=pathHtml(r.path,true);studentForms(panel);studyBindPrinting(panel,r.path)}},5000)}
  }catch(err){alert(err.message)}finally{button.disabled=false}
 }));
}

function staffTable(rows,track){
 const selected=(rows||[]).filter(s=>(s.tracks||[s.track]).includes(track));
 if(!selected.length)return '<div class="panel"><p>لا يوجد طالب مكلّف بهذا المسار بعد؛ تظهر التكليفات تلقائيًا عند حفظ أي درجة تستدعي العلاج أو الإثراء.</p></div>';
 const isHonor=track==='enrichment',supervisor=auth.user.role==='supervisor';
 return '<div class="panel"><h2>'+(isHonor?'🌟 الطلاب المجيدون — التغذية الراجعة':'🌱 الطلاب ذوو الصعوبات — متابعة العلاج')+'</h2>'+
 '<p>تظهر الأسباب ومؤشرات التحسن بعد كل إجابة أو محاولة جديدة، وتظل النتائج خاصة بحساب الطالب والمشرف.</p>'+
 '<div class="study-table-scroll"><table class="study-table"><thead><tr>'+
 '<th>الطالب</th><th>الشعبة / م</th><th>سبب التكليف</th><th>الإنجاز</th><th>الصحيح الأول</th><th>الصحيح الحالي</th><th>التحسن</th><th>الأسئلة الفردية</th>'+
 (isHonor?'<th>النشر المعتمد</th>':'')+'</tr></thead><tbody>'+
 selected.map(s=>{
  const x=s.progress_by_track?.[track]||{},reason=(s.reasons||[]).filter(r=>r.track===track);
  return '<tr><td>'+studyEsc(s.name)+'</td><td>'+studyEsc(s.class_name)+' / '+studyEsc(s.serial_no)+'</td>'+
  '<td>'+studyEsc(reason.map(r=>r.label+(r.percentage!==null?' • '+r.percentage+'٪':'')).join('، ')||'ملاحظة أو تقييم')+'</td>'+
  '<td>'+studyEsc(x.completed||0)+' / '+studyEsc(x.total_tasks||(isHonor?16:12))+'</td>'+
  '<td>'+studyEsc(x.first_correct||0)+'</td><td>'+studyEsc(x.correct||0)+'</td>'+
  '<td>'+studyEsc(x.improvement_percent>0?'+':'')+studyEsc(x.improvement_percent||0)+'٪</td>'+
  '<td><button type="button" class="soft study-view" data-track="'+track+'" data-class="'+studyEsc(s.class_name)+
   '" data-num="'+studyEsc(s.serial_no)+'">الأسئلة والنتائج</button></td>'+
  (isHonor?'<td>'+(s.showcase_approved?'معتمد':'خاص غير منشور')+
    (supervisor?' <button type="button" class="outline study-approve" data-class="'+studyEsc(s.class_name)+
     '" data-num="'+studyEsc(s.serial_no)+'" data-active="'+(s.showcase_approved?'true':'false')+'">'+
     (s.showcase_approved?'إلغاء النشر':'اعتماد بعد الموافقة')+'</button>':'')+'</td>':'')+'</tr>';
 }).join('')+'</tbody></table></div><div id="studyDetail"></div></div>';
}

function attachStaff(target,track){
 target.querySelectorAll('.study-view').forEach(btn=>btn.addEventListener('click',async()=>{
  const slot=target.querySelector('#studyDetail');slot.textContent='جارٍ تحميل خطة الطالب…';
  try{const r=await studyRequest('staff_student_path',{student_number:btn.dataset.num,class_name:btn.dataset.class,track:btn.dataset.track});slot.innerHTML=pathHtml(r.path,false);studyBindPrinting(slot,r.path);slot.scrollIntoView({behavior:'smooth',block:'center'})}
  catch(err){slot.textContent=err.message}
 }));
 target.querySelectorAll('.study-approve').forEach(btn=>btn.addEventListener('click',async()=>{
  const was=btn.dataset.active==='true';
  if(!confirm(was?'هل تريد إيقاف نشر اسم الطالب؟':'هل تحققت من موافقة ولي الأمر واعتماد المدرسة على نشر اسم الطالب ودرجته؟'))return;
  try{
   await studyRequest('approve_excellence',{student_number:btn.dataset.num,class_name:btn.dataset.class,parent_consent_confirmed:!was,school_approved:!was,confirmed_review:!was});
   const roster=(await studyRequest('staff_overview')).students;
   target.innerHTML=staffTable(roster,track);attachStaff(target,track);
   const gallery=document.getElementById('studyGallery');if(gallery)gallery.innerHTML=galleryHtml((await studyRequest('excellence_gallery')).students||[]);
  }catch(err){alert(err.message)}
 }));
}
let studyRenderToken=0;
async function loadStudyPage(page){
 const token=++studyRenderToken,gallery=document.getElementById('studyGallery'),place=document.getElementById('studyPrivate');
 if(gallery)try{const r=await studyRequest('excellence_gallery');if(token===studyRenderToken)gallery.innerHTML=galleryHtml(r.students||[])}catch(err){if(token===studyRenderToken)gallery.textContent=err.message}
 if(!place||token!==studyRenderToken)return;
 if(!auth.user){place.innerHTML='<div class="panel"><h3>الدخول بالحساب المعتمد</h3><p>سجل دخولك إلى المنصة أولًا حتى تظهر لك خطة التعلم المرتبطة بتقييمك.</p><button class="primary" id="studyLogin">تسجيل الدخول</button></div>';place.querySelector('#studyLogin')?.addEventListener('click',()=>document.getElementById('authDialog')?.showModal());return}
 if(auth.user.role==='student'){
  try{const expected=page==='support'?'remedial':'enrichment';
   const r=await studyRequest('my_path',{track:expected});if(token!==studyRenderToken)return;
   if(r.path.track===expected){place.innerHTML=pathHtml(r.path,true);studentForms(place);studyBindPrinting(place,r.path)}
   else place.innerHTML='<div class="panel"><p>تقييمك الحالي: '+(r.path.score==null?'لم يُرصد':studyEsc(r.path.score)+'٪')+'. هذا القسم يعرض الأنشطة بحسب حدود التقييم المعتمدة، ويمكنك زيارة بقية الدروس والألعاب.</p></div>';
  }catch(err){if(token===studyRenderToken)place.innerHTML='<div class="notice">'+studyEsc(err.message)+'</div>'}
 }else if(studyStaff()){
  try{const r=await studyRequest('staff_overview');if(token!==studyRenderToken)return;const t=page==='support'?'remedial':'enrichment';place.innerHTML=staffTable(r.students||[],t);attachStaff(place,t)}
  catch(err){if(token===studyRenderToken)place.textContent=err.message}
 }else place.innerHTML='<div class="panel"><p>الحسابات التجريبية لا تحتوي بيانات طالب حقيقية.</p></div>';
}
async function loadDashboardStudy(){
 if(!auth.user)return;
 const studentSlot=document.getElementById('studyStudentDashboard');
 if(studentSlot&&auth.user.role==='student'){
  try{const r=await studyRequest('my_path');if(!studentSlot.isConnected)return;
   const p=r.path;
   const tracks=p.tracks||[],past=p.historic_tracks||[];
   studentSlot.innerHTML='<div class="panel"><h3>🎯 مساري التعليمي</h3><p>'+(
    tracks.length?('تم تخصيص '+(tracks.includes('remedial')?'١٢ سؤالًا علاجيًا من الوحدات الثلاث الأولى':'')+
     (tracks.length===2?'، بالإضافة إلى ':'')+
     (tracks.includes('enrichment')?'١٦ سؤالًا إثرائيًا من الوحدات الأربع':'')+'؛ ويمكنك متابعة نتائج إجاباتك بعد التغذية الراجعة.'):
    past.length?'يمكنك مراجعة نتائج تدريبك السابقة حتى بعد تحسن مستواك.':
    p.score===null?'ستظهر خطة خاصة عندما تُرصد درجتك الأولى.':
    'درجاتك المرصودة ضمن نطاق المتابعة المعتادة؛ استمر في الدروس والألعاب.')+'</p>'+
    (tracks.includes('remedial')||past.includes('remedial')?'<button type="button" class="primary" data-study-go="support">🌱 أسئلة العلاج</button> ':'')+
    (tracks.includes('enrichment')||past.includes('enrichment')?'<button type="button" class="soft" data-study-go="stars">🌟 أسئلة الإثراء</button>':'')+'</div>';
   studentSlot.querySelectorAll('[data-study-go]').forEach(b=>b.addEventListener('click',()=>route(b.dataset.studyGo)));
  }catch(err){if(studentSlot.isConnected)studentSlot.textContent=err.message}
 }
 const staffSlot=document.getElementById('studyStaffDashboard');
 if(staffSlot&&studyStaff()){
  try{const r=await studyRequest('staff_overview');if(!staffSlot.isConnected)return;
   const rows=r.students||[],low=rows.filter(x=>(x.tracks||[]).includes('remedial')).length,
    high=rows.filter(x=>(x.tracks||[]).includes('enrichment')).length;
   staffSlot.innerHTML='<div class="panel"><h3>📊 مؤشرات الدعم والإثراء</h3><p>الطلاب المحتاجون للدعم: '+low+' • الطلاب المجيدون: '+high+' • من دون درجة: '+rows.filter(x=>x.score===null).length+'</p><button class="soft" data-route="support">بوابة الدعم</button> <button class="soft" data-route="stars">بوابة المجيدين</button></div>';
   staffSlot.querySelectorAll('[data-route]').forEach(b=>b.addEventListener('click',()=>route(b.dataset.route)));
  }catch(err){if(staffSlot.isConnected)staffSlot.textContent=err.message}
 }
}

function studyBindPrinting(container,path){
 container.querySelectorAll('[data-study-print]').forEach(b=>b.addEventListener('click',()=>{
  if(typeof afFeedbackPrintPath==='function')afFeedbackPrintPath(path,'portrait');
  else window.print();
 }));
}

const studyRenderOriginal=render;
render=function(){studyRenderOriginal();if(state.page==='stars'||state.page==='support')loadStudyPage(state.page);if(state.page==='dashboard')loadDashboardStudy()};
if(['stars','support'].includes(window.AFAQ_REQUESTED_HASH)){state.page=window.AFAQ_REQUESTED_HASH;}
render();

