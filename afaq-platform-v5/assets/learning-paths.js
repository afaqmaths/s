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
 return studyHead('بوابة الطلاب المجيدين','نحتفي بمن تتجاوز نتيجته ٦٠٪ من تقييم المنصة. تُنشر الأسماء والنسب بعد موافقة ولي الأمر واعتماد المدرسة.')+
 '<div class="panel"><h2>🏅 لوحة المجيدين المعتمدين</h2><div id="studyGallery">جارٍ تحميل البيانات المعتمدة…</div></div><div id="studyPrivate"></div></div>';
}
function studySupport(){
 return studyHead('بوابة الدعم والتقدم','أنشطة تأسيسية مخصصة للطلاب الذين تقل نتائجهم عن ٣٠٪، من الوحدات الأولى والثانية والثالثة.')+
 '<div class="panel"><h2>🌱 معًا نحو التقدم</h2><p>برنامج تعليمي خاص يساعد على تثبيت المهارات. أسماء الطلاب ودرجاتهم وأنشطتهم الفردية لا تُعرض للزوار أو الزملاء.</p></div><div id="studyPrivate"></div></div>';
}
const studyBaseGeneric=genericSection;
genericSection=function(page){if(page==='stars')return studyStars();if(page==='support')return studySupport();return studyBaseGeneric(page)};
if(!sections.some(x=>x[0]==='support')){const n=sections.findIndex(x=>x[0]==='stars');sections.splice(n+1,0,['support','🌱','بوابة الدعم والتقدم','تدريبات علاجية شخصية من الوحدات الثلاث الأولى'])}
function galleryHtml(students){
 if(!students.length)return '<p class="muted">لا توجد أسماء معتمدة للنشر حتى الآن. ستظهر بعد رصد التقييمات وتوثيق الموافقات.</p>';
 return '<div class="study-gallery">'+students.map(s=>'<article><span>🏅</span><h3>'+studyEsc(s.name)+'</h3><p>'+studyEsc(s.class_name)+' — رقم '+studyEsc(s.serial_no)+'</p><strong>'+studyEsc(s.score)+'٪</strong></article>').join('')+'</div>';
}
function taskHtml(t,student){
 const radio=t.options.map((v,i)=>'<label><input type="radio" name="answer" value="'+i+'"><span>'+studyEsc(v)+'</span></label>').join('');
 return '<article class="study-task"><span class="tag">الوحدة '+studyEsc(t.unit)+' • '+studyEsc(t.objective)+'</span><h3>'+studyEsc(t.question)+'</h3>'+
 (t.completed?'<p class="study-done '+(t.correct?'ok':'try')+'">'+(t.correct?'✓ إجابة صحيحة سابقًا':'راجع طريقة الحل ويمكنك المحاولة مجددًا')+(t.correct_answer?' — الإجابة: '+studyEsc(t.correct_answer):'')+'</p>':'')+
 (student?'<form class="study-answer" data-task="'+studyEsc(t.task_id)+'"><div class="study-options">'+radio+'</div><button class="soft" type="submit">تحقق من إجابتي</button></form>':'<p class="muted">واجب فردي مخصص لهذا الطالب.</p>')+'</article>';
}
function pathHtml(p,student){
 if(!p)return '<p class="muted">لا تتوفر خطة الطالب بعد.</p>';
 if(p.track==='ungraded')return '<div class="panel"><h3>لم تُرصد درجة المنصة بعد</h3><p>ستظهر خطة مخصصة بعد إدخال نتائج التقييم من المشرف. لا يُعد الطالب بحاجة للدعم تلقائيًا دون درجة مرصودة.</p></div>';
 if(p.track==='standard')return '<div class="panel"><h3>استمر في التعلم</h3><p>تقييمك الحالي '+studyEsc(p.score)+'٪. يمكنك الاستفادة من الألعاب والدروس المتاحة لجميع الطلاب.</p></div>';
 return '<div class="panel"><h2>'+(p.track==='remedial'?'🌱 خطة التأسيس':'🌟 خطة الإثراء')+'</h2><p>'+studyEsc(p.student?.name)+' — '+studyEsc(p.student?.class_name)+' — رقم '+studyEsc(p.student?.serial_no)+'</p>'+
 '<div class="study-metrics"><div><b>'+studyEsc(p.score)+'٪</b><small>تقييم المنصة</small></div><div><b>'+studyEsc(p.completed)+' / '+studyEsc(p.total_tasks)+'</b><small>أسئلة أُنجزت</small></div><div><b>'+studyEsc(p.correct)+'</b><small>إجابات صحيحة</small></div></div></div>'+
 '<div class="study-tasks">'+p.tasks.map(t=>taskHtml(t,student)).join('')+'</div>';
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
   if(r.path){const panel=target;setTimeout(()=>{if(panel.isConnected){panel.innerHTML=pathHtml(r.path,true);studentForms(panel)}},5000)}
  }catch(err){alert(err.message)}finally{button.disabled=false}
 }));
}
function staffTable(rows,track){
 const selected=rows.filter(s=>s.track===track);
 if(!selected.length)return '<div class="panel"><p>لا توجد درجات مرصودة تضع طلابًا في هذا المسار الآن. لا تُعرض أسماء افتراضية.</p></div>';
 const isHonor=track==='enrichment',supervisor=auth.user.role==='supervisor';
 return '<div class="panel"><h2>'+(isHonor?'تقييمات الطلاب المجيدين':'الكشف الخاص بالدعم التعليمي')+'</h2><div class="study-table-scroll"><table class="study-table"><thead><tr><th>الطالب</th><th>الشعبة ورقم الطالب</th><th>النتيجة</th><th>الأسئلة المخصصة</th>'+(isHonor?'<th>التكريم</th>':'')+'</tr></thead><tbody>'+
 selected.map(s=>'<tr><td>'+studyEsc(s.name)+'</td><td>'+studyEsc(s.class_name)+' / '+studyEsc(s.serial_no)+'</td><td>'+studyEsc(s.score)+'٪</td>'+
 '<td><button type="button" class="soft study-view" data-class="'+studyEsc(s.class_name)+'" data-num="'+studyEsc(s.serial_no)+'">عرض الأسئلة الفردية</button></td>'+
 (isHonor?'<td>'+(s.showcase_approved?'معتمد':'غير منشور')+(supervisor?' <button type="button" class="outline study-approve" data-class="'+studyEsc(s.class_name)+'" data-num="'+studyEsc(s.serial_no)+'" data-active="'+(s.showcase_approved?'true':'false')+'">'+(s.showcase_approved?'إلغاء النشر':'اعتماد بعد الموافقة')+'</button>':'')+'</td>':'')+'</tr>').join('')+'</tbody></table></div><div id="studyDetail"></div></div>';
}
function attachStaff(target,track){
 target.querySelectorAll('.study-view').forEach(btn=>btn.addEventListener('click',async()=>{
  const slot=target.querySelector('#studyDetail');slot.textContent='جارٍ تحميل خطة الطالب…';
  try{const r=await studyRequest('staff_student_path',{student_number:btn.dataset.num,class_name:btn.dataset.class});slot.innerHTML=pathHtml(r.path,false);slot.scrollIntoView({behavior:'smooth',block:'center'})}
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
  try{const r=await studyRequest('my_path');if(token!==studyRenderToken)return;
   if(r.path.track===(page==='support'?'remedial':'enrichment')){place.innerHTML=pathHtml(r.path,true);studentForms(place)}
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
   studentSlot.innerHTML='<div class="panel"><h3>🎯 مساري التعليمي</h3><p>'+(
    p.track==='remedial'?'لديك '+p.total_tasks+' سؤالًا لتقوية أساسيات الوحدات الثلاث الأولى.':
    p.track==='enrichment'?'لديك '+p.total_tasks+' سؤالًا إثرائيًا من الوحدات الأربع.':
    p.track==='ungraded'?'ستظهر خطة مخصصة بعد رصد درجتك.':'استمر في الدروس والألعاب والتمارين العامة.')+'</p>'+
    '<button type="button" class="primary" id="studyGo">فتح بوابة المسار</button></div>';
   studentSlot.querySelector('#studyGo')?.addEventListener('click',()=>route(p.track==='enrichment'?'stars':'support'));
  }catch(err){if(studentSlot.isConnected)studentSlot.textContent=err.message}
 }
 const staffSlot=document.getElementById('studyStaffDashboard');
 if(staffSlot&&studyStaff()){
  try{const r=await studyRequest('staff_overview');if(!staffSlot.isConnected)return;
   const rows=r.students||[],low=rows.filter(x=>x.track==='remedial').length,high=rows.filter(x=>x.track==='enrichment').length;
   staffSlot.innerHTML='<div class="panel"><h3>📊 مؤشرات الدعم والإثراء</h3><p>الطلاب المحتاجون للدعم: '+low+' • الطلاب المجيدون: '+high+' • من دون درجة: '+rows.filter(x=>x.score===null).length+'</p><button class="soft" data-route="support">بوابة الدعم</button> <button class="soft" data-route="stars">بوابة المجيدين</button></div>';
   staffSlot.querySelectorAll('[data-route]').forEach(b=>b.addEventListener('click',()=>route(b.dataset.route)));
  }catch(err){if(staffSlot.isConnected)staffSlot.textContent=err.message}
 }
}
const studyRenderOriginal=render;
render=function(){studyRenderOriginal();if(state.page==='stars'||state.page==='support')loadStudyPage(state.page);if(state.page==='dashboard')loadDashboardStudy()};
