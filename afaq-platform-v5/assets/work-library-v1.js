/* آفاق الرياضيات ٢٠٢٦ / ٢٠٢٧ — مهام العمل وأوراق دروس الصف السادس */
'use strict';
const WORK_API_URL='https://xcwuwflggiwkehzquugz.supabase.co/functions/v1/afaq-work-library';
const WORK_STORAGE_ORIGIN='https://xcwuwflggiwkehzquugz.supabase.co';
const workState={token:'',data:null,loaded:false,loading:false,attempted:false,tab:'worksheets',status:'',statusError:false,previewStudent:false,generation:0};
const workEsc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const workSuperUser=()=>auth.user?.role==='supervisor';
const workSuper=()=>workSuperUser()&&!workState.previewStudent;
const workStaff=()=>!workState.previewStudent&&['supervisor','supervisor_assistant','director','deputy'].includes(auth.user?.role);
const workDocCount=(item,role)=>(workState.data?.documents||[]).filter(x=>x.item_id===item.id&&x.doc_role===role).length;
const workLessons=()=>workState.data?.lessons||[];
const workItems=()=>workState.data?.items||[];
const workDocuments=()=>workState.data?.documents||[];
const workVideos=()=>workState.data?.videos||[];
const workAr=n=>new Intl.NumberFormat('ar-OM',{maximumFractionDigits:0}).format(n||0);
const workErrors={
 unauthorized:'انتهت جلسة الدخول. سجل الدخول من جديد.',
 forbidden:'ليس لهذا الحساب صلاحية إجراء العملية.',
 invalid_item:'يرجى إدخال عنوان المهمة أو ورقة العمل بصورة صحيحة.',
 invalid_lesson:'اختر درسًا صحيحًا من كتاب الطالب.',
 item_scope_locked:'لا يمكن نقل ورقة العمل إلى درس آخر؛ أنشئ ورقة جديدة في الدرس المقصود.',
 invalid_upload:'الملف غير مدعوم أو أكبر من ٢٥ ميجابايت.',
 invalid_file_type:'صيغة الملف غير مسموحة في هذا العمود.',
 invalid_video_type:'اختر فيديو من نوع MP4 أو WebM أو MOV.',
 invalid_youtube_url:'ضع رابط يوتيوب صالحًا يبدأ بـ https.',
 upload_missing:'لم يصل الملف إلى المخزن بعد؛ أعد رفعه.',
 upload_size_mismatch:'حجم الملف المستلم لا يطابق الملف المختار.'
};
function workErrorMessage(error){
 const message=error?.message||String(error||'تعذر تنفيذ العملية');
 return workErrors[message]||'تعذر تنفيذ الطلب: '+message;
}
async function workApi(action,payload={}){
 if(!auth.token)throw Error('unauthorized');
 let response;
 try{response=await fetch(WORK_API_URL,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+auth.token},
  body:JSON.stringify({action,...payload}),cache:'no-store'})}
 catch{throw Error('تعذر الاتصال بالخادم.')}
 let data;
 try{data=await response.json()}catch{throw Error('تعذر قراءة استجابة الخادم.')}
 if(!response.ok||data?.ok!==true)throw Error(data?.error||'server_error');
 return data;
}
function workSetStatus(message,isError=false){
 workState.status=message;workState.statusError=isError;
 const el=document.getElementById('workLiveStatus');
 if(el){el.textContent=message;el.classList.toggle('work-error',isError)}
}
async function workRefresh(){
 if(workState.loading||!auth.user||!auth.token)return;
 const generation=++workState.generation,preview=workState.previewStudent,token=auth.token;
 workState.loading=true;workState.attempted=true;
 workSetStatus(preview?'جارٍ تحميل أوراق العمل كما تظهر للطالب...':'جارٍ تحديث أوراق العمل والمهام...');
 try{
  const data=await workApi('list',{preview_as_student:preview});
  if(workState.generation!==generation||workState.token!==token||workState.previewStudent!==preview)return;
  workState.data=data;workState.loaded=true;
  workSetStatus(preview?'معاينة الطالب جاهزة: تظهر الملفات المنشورة والمسموحة فقط.':'تم تحديث المحتوى. المستندات تُضاف تدريجيًا لكل درس.');
 }catch(error){
  if(workState.generation===generation)workSetStatus(workErrorMessage(error),true);
 }finally{
  if(workState.generation===generation){
   workState.loading=false;if(state.page==='work')render();
  }
 }
}
function workInEducation(){
 return '<section class="work-learning-link">'+
  '<div class="work-learning-icon" aria-hidden="true">📚</div><div><h2>مهام العمل وأوراق عمل الرياضيات</h2>'+
  '<p>دروس الصف السادس مرتبة حسب كتاب الطالب. أوراق العمل، نماذج الإجابة، صور السبورة، وملفات الفيديو وروابط يوتيوب. وتوجد مهام مستقلة للطلاب والإدارة.</p></div>'+
  '<button type="button" class="primary" data-route="work">فتح مهام العمل وأوراق الدروس</button></section>';
}
const workOldLearning=learning;
learning=function(){return workOldLearning()+workInEducation()};
const workOldSixthGrade=gradePage;
gradePage=function(){
 const html=workOldSixthGrade();
 return state.grade===6?html+'<div class="container">'+workInEducation()+'</div>':html;
};
const workOldGeneric=genericSection;
genericSection=function(page){return page==='work'?workPage():workOldGeneric(page)};
const workOldDashboard=dashboard;
dashboard=function(){
 const html=workOldDashboard();
 if(!auth.user)return html;
 const title=workSuper()?'إدارة مهام العمل والمستندات':'مهام العمل وأوراق الدروس';
 const text=workSuper()?'إضافة أوراق العمل، نماذج الحلول، صور السبورة والفيديوهات، وإنشاء مهام الطلاب والإدارة ونشرها أو حذفها.':
  'عرض المهام ومواد الدروس المنشورة وفق صلاحية حسابك.';
 return html+'<section class="container work-dashboard-shortcut"><div><h3>📚 '+title+'</h3><p>'+text+
  '</p></div><button type="button" class="primary" data-route="work">'+
  (workSuper()?'فتح إدارة مهام العمل':'فتح مهام العمل')+'</button></section>';
};
function workTabs(){
 const entries=[['worksheets','📗 أوراق عمل الصف السادس'],['student_tasks','📝 مهام الطلاب'],
 ...(workStaff()?[['management_tasks','🏫 مهام الإدارة المدرسية']]:[])];
 return '<nav class="work-tabs" aria-label="أقسام مهام العمل">'+entries.map(([key,label])=>
  '<button type="button" data-work-tab="'+key+'" class="'+(workState.tab===key?'work-tab-active':'')+'">'+label+'</button>').join('')+'</nav>';
}
function workDocLink(doc){
 return '<span class="work-file-chip"><button type="button" class="work-open-file" data-work-open="'+workEsc(doc.id)+'" title="فتح أو تنزيل الملف">📎 '+workEsc(doc.file_name)+'</button>'+
 (workSuper()?'<button type="button" class="work-delete-mini" data-work-delete-file="'+workEsc(doc.id)+'" aria-label="حذف الملف">×</button>':'')+'</span>';
}
function workUploadButton(item,role){
 if(!workSuper())return '';
 return '<button type="button" class="work-add-small" data-work-upload="'+workEsc(item.id)+'" data-work-role="'+role+'">＋ إرفاق '+(role==='answer'?'حل':role==='video'?'فيديو':'ملف')+'</button>';
}
function workDocsCell(item,role){
 if(!item)return '<span class="work-empty">—</span>';
 const docs=workDocuments().filter(d=>d.item_id===item.id&&d.doc_role===role);
 const note=!docs.length?'<span class="work-empty">'+(role==='answer'&&!workStaff()&&!item.answer_released?'🔒 النموذج غير منشور':'لم يُرفق بعد')+'</span>':'';
 return '<div class="work-cell-files">'+docs.map(workDocLink).join('')+note+workUploadButton(item,role)+'</div>';
}
function workVideoCell(item){
 if(!item)return '<span class="work-empty">—</span>';
 const docs=workDocuments().filter(d=>d.item_id===item.id&&d.doc_role==='video');
 const links=workVideos().filter(d=>d.item_id===item.id);
 const linksHtml=links.map(v=>'<span class="work-file-chip"><a href="'+workEsc(v.url)+'" target="_blank" rel="noopener noreferrer">▶️ '+workEsc(v.title)+'</a>'+
  (workSuper()?'<button type="button" class="work-delete-mini" data-work-delete-video="'+workEsc(v.id)+'" aria-label="حذف رابط الفيديو">×</button>':'')+'</span>').join('');
 return '<div class="work-cell-files">'+docs.map(workDocLink).join('')+linksHtml+
  (!docs.length&&!links.length?'<span class="work-empty">لا يوجد فيديو بعد</span>':'')+
  (workSuper()?workUploadButton(item,'video')+
    '<button type="button" class="work-add-small" data-work-add-youtube="'+workEsc(item.id)+'">＋ رابط يوتيوب</button>':'')+
  '</div>';
}
function workSettings(item){
 if(!workSuper())return '';
 const name=item.kind==='task'?'المهمة':item.kind==='lesson_resource'?'مواد الدرس':'الورقة';
 return '<details class="work-settings"><summary>⚙️ إدارة '+name+'</summary>'+
  '<form data-work-edit="'+workEsc(item.id)+'">'+
  '<label>العنوان<input name="title" maxlength="160" value="'+workEsc(item.title)+'" required></label>'+
  '<label>تعليمات إضافية<textarea name="instructions" rows="2">'+workEsc(item.instructions||'')+'</textarea></label>'+
  '<label class="work-check"><input type="checkbox" name="published" '+(item.published?'checked':'')+'> نشر المهمة والملفات للفئة المخصصة</label>'+
  '<label class="work-check"><input type="checkbox" name="answer_released" '+(item.answer_released?'checked':'')+'> السماح للطلاب بالاطلاع على نماذج الإجابة</label>'+
  '<button type="submit" class="primary">💾 حفظ إعدادات '+name+'</button> '+
  '<button type="button" class="work-danger" data-work-delete-item="'+workEsc(item.id)+'">حذف '+name+' ومرفقاتها</button>'+
  '</form></details>';
}
function workItemName(item){
 if(!item)return '<span class="work-empty">لم تُضف ورقة عمل بعد</span>';
 return '<div class="work-item-heading"><strong>'+workEsc(item.title)+'</strong>'+
  (workStaff()?'<small class="'+(item.published?'work-published':'work-draft')+'">'+
   (item.published?'منشورة':'مسودة غير منشورة')+'</small>':'')+
  (item.instructions?'<p>'+workEsc(item.instructions)+'</p>':'')+
  '</div>'+(item.kind==='lesson_resource'?'<span class="work-empty">مواد مرتبطة بالدرس (دون ورقة عمل محددة)</span>':workDocsCell(item,'worksheet'))+workSettings(item);
}
function workWorksheetTable(lessons){
 return '<div class="work-table-scroller"><table class="work-lessons-table">'+
  '<thead><tr><th scope="col">اسم الدرس</th><th scope="col">ورقة العمل</th><th scope="col">نموذج الإجابة</th>'+
  '<th scope="col">ملفات أخرى / صور السبورة</th><th scope="col">الفيديو / يوتيوب</th></tr></thead><tbody>'+
  lessons.map(lesson=>{
   const list=workItems().filter(x=>['worksheet','lesson_resource'].includes(x.kind)&&Number(x.lesson_id)===Number(lesson.id));
   const shown=list.length?list:[null];
   return shown.map((item,index)=>{
    const first=index===0?'<th scope="rowgroup" rowspan="'+shown.length+'" class="work-lesson-cell"><strong>'+
      workEsc(lesson.lesson_code)+' — '+workEsc(lesson.lesson_title)+'</strong>'+
      (workSuper()?'<button class="work-add-worksheet" type="button" data-work-new-worksheet="'+workEsc(lesson.id)+
      '" data-work-lesson-title="'+workEsc(lesson.lesson_title)+'">＋ ورقة عمل</button>'+
      '<button type="button" class="work-add-resource" data-work-new-resource="'+workEsc(lesson.id)+
      '" data-work-lesson-title="'+workEsc(lesson.lesson_title)+'">＋ صور أو فيديو للدرس</button>':'')+'</th>':'';
    return '<tr>'+first+
     '<td class="work-main-file-cell">'+workItemName(item)+'</td>'+
     '<td>'+workDocsCell(item,'answer')+'</td>'+
     '<td>'+workDocsCell(item,'attachment')+'</td>'+
     '<td>'+workVideoCell(item)+'</td></tr>';
   }).join('');
  }).join('')+'</tbody></table></div>';
}
function workLessonsPane(){
 const lessons=workLessons();
 if(!lessons.length)return '<div class="notice">لم يتم تحميل فهرس الدروس بعد.</div>';
 const unitNumbers=[...new Set(lessons.map(l=>Number(l.unit_no)))];
 return '<div class="work-intro"><p>يمكن إرفاق <b>أكثر من ورقة عمل لكل درس</b>، ولكل ورقة عدد غير محدود من الملفات ونماذج الإجابة وصور السبورة والفيديوهات. المرفقات تُعرض للطلاب بعد نشرها، ونماذج الحلول محجوبة حتى السماح بها صراحةً.</p>'+
  '<strong>عدد الدروس المفهرسة: '+workAr(lessons.length)+' — الفصل الدراسي الأول</strong></div>'+
  unitNumbers.map(n=>{
   const unitLessons=lessons.filter(l=>Number(l.unit_no)===n),unitName=unitLessons[0]?.unit_name||'';
   return '<section class="work-unit"><div class="work-unit-head"><h2>الوحدة '+workAr(n)+' — '+workEsc(unitName)+'</h2>'+
    '<span>'+workAr(unitLessons.length)+' دروس</span></div>'+workWorksheetTable(unitLessons)+'</section>';
  }).join('');
}
function workTaskPane(audience){
 const tasks=workItems().filter(x=>x.kind==='task'&&x.audience===audience);
 const title=audience==='student'?'مهام العمل الخاصة بالطلاب':'مهام العمل الخاصة بالإدارة المدرسية';
 return '<section class="work-unit"><div class="work-unit-head"><h2>'+title+'</h2>'+
  (workSuper()?'<button type="button" class="primary" data-work-new-task="'+audience+'">＋ إضافة مهمة جديدة</button>':'')+'</div>'+
  '<p>تُضاف الملفات والتعليمات تدريجيًا، ويمكن إرفاق أكثر من مستند وفيديو لكل مهمة.</p>'+
  (tasks.length?'<div class="work-table-scroller"><table class="work-lessons-table"><thead><tr>'+
   '<th>المهمة والتعليمات</th><th>ملفات المهمة</th><th>نماذج الإجابة</th><th>صور وملفات أخرى</th><th>الفيديو / يوتيوب</th>'+
   '</tr></thead><tbody>'+
   tasks.map(item=>'<tr><th class="work-lesson-cell">'+workItemName(item)+'</th>'+
    '<td>'+workDocsCell(item,'worksheet')+'</td><td>'+workDocsCell(item,'answer')+'</td>'+
    '<td>'+workDocsCell(item,'attachment')+'</td><td>'+workVideoCell(item)+'</td></tr>').join('')+
   '</tbody></table></div>':
   '<div class="work-empty-panel">لا توجد مهام منشورة لهذا القسم حاليًا.'+
   (workSuper()?' استخدم زر «إضافة مهمة جديدة» لبدء الإعداد.':'')+'</div>')+'</section>';
}
function workPreviewPanel(){
 if(!workSuperUser())return '';
 if(!workState.previewStudent)return '<div class="work-preview-actions">'+
  '<div><strong>👁️ اختبر طريقة عرض أوراق العمل للطالب</strong>'+
  '<p>شاهد المحتوى المنشور كما يظهر للطالب، دون تسجيل خروج أو تغيير حسابك.</p></div>'+
  '<button type="button" class="work-preview-button" data-work-preview="student">🧑‍🎓 معاينة كطالب</button></div>';
 const publicWorks=workItems().filter(i=>i.kind==='worksheet'&&i.published&&i.audience==='student');
 const summary=workState.loaded?'أوراق العمل المنشورة حاليًا: '+workAr(publicWorks.length)+'.':'جارٍ تحميل قائمة أوراق الطالب...';
 return '<section class="work-preview-student" role="note">'+
  '<div class="work-preview-identity"><span class="work-preview-avatar">🧑‍🎓</span><div>'+
  '<strong>أنت الآن تعاين أوراق العمل كما يراها طالب الصف السادس</strong>'+
  '<p>تظهر الدروس والملفات المنشورة فقط، وتختفي أدوات المشرف والحلول المحجوبة. '+summary+'</p>'+
  '</div></div><button type="button" class="work-preview-back" data-work-preview="supervisor">'+
  '↩ العودة إلى وضع المشرف</button></section>';
}
function workPage(){
 const token=auth.token||'';
 if(workState.token!==token){
  workState.token=token;workState.data=null;workState.loaded=false;
  workState.loading=false;workState.attempted=false;workState.status='';
  workState.previewStudent=false;workState.generation++;
 }
 if(!workStaff()&&workState.tab==='management_tasks')workState.tab='worksheets';
 if(auth.user&&!workState.attempted){
  workState.attempted=true;
  Promise.resolve().then(()=>workRefresh());
 }
 let inside='';
 if(!auth.user)inside='<div class="work-empty-panel"><h2>دخول الحساب مطلوب</h2>'+
   '<p>تستطيع التصفح كضيف في أقسام المنصة العامة. أوراق العمل والمهام مخصصة للطلاب والموظفين المسجلين.</p>'+
   '<button type="button" class="primary" data-work-login>تسجيل الدخول للوصول إلى المهام</button></div>';
 else if(!workState.loaded)inside='<div class="work-empty-panel">'+
   (workState.loading?'جارٍ تحميل فهرس الدروس والملفات...':workState.status||'لم تُحمّل البيانات بعد.')+'</div>';
 else inside=workTabs()+(workState.tab==='worksheets'?workLessonsPane():
  workState.tab==='management_tasks'?workTaskPane('management'):workTaskPane('student'));
 return '<div class="container work-page" dir="rtl"><div class="work-hero"><div><span>📚 التعليم والتعلّم</span>'+
   '<h1>مهام العمل وأوراق عمل الرياضيات</h1><p>الصف السادس — فهرس كتاب الطالب، مع أوراق العمل وحلولها وصور السبورة والفيديوهات.</p>'+
   '</div><button type="button" class="outline" data-route="learning">العودة إلى التعليم والتعلّم</button></div>'+
   workPreviewPanel()+
   '<div class="work-toolbar"><button type="button" class="outline" data-work-refresh '+(!auth.user?'disabled':'')+
   '>↻ تحديث الملفات</button>'+
   (workSuper()?'<span class="work-super-note">أنت المشرف الرئيسي: الإضافة والتعديل والحذف والنشر متاحة لحسابك فقط.</span>':'')+'</div>'+
   '<p id="workLiveStatus" class="work-live-status '+(workState.statusError?'work-error':'')+'" role="status">'+
   workEsc(workState.status)+'</p>'+inside+'</div>';
}
function workNeedSupervisor(){if(!workSuper())throw Error('forbidden')}
async function workDo(action,payload,success){
 await workApi(action,payload);
 await workRefresh();
 workSetStatus(success||'تم حفظ التحديث بنجاح.');
}
async function workNewWorksheet(button){
 workNeedSupervisor();
 const lessonId=Number(button.dataset.workNewWorksheet),lessonName=button.dataset.workLessonTitle||'';
 const title=window.prompt('عنوان ورقة العمل لهذا الدرس:', 'ورقة عمل — '+lessonName);
 if(title===null||!title.trim())return;
 await workDo('save_item',{kind:'worksheet',audience:'student',lesson_id:lessonId,title:title.trim(),
  published:false,answer_released:false},'أضيفت ورقة العمل بوصفها مسودة. أرفق المستندات ثم انشرها.');
}
async function workNewResource(button){
 workNeedSupervisor();
 const lessonId=Number(button.dataset.workNewResource),lessonName=button.dataset.workLessonTitle||'';
 await workDo('save_item',{kind:'lesson_resource',audience:'student',lesson_id:lessonId,
  title:'مواد الدرس — '+lessonName,published:false,answer_released:false},
  'أنشئت مساحة خاصة لهذا الدرس. أضف صور السبورة أو الفيديوهات ثم انشرها.');
}
async function workNewTask(audience){
 workNeedSupervisor();
 const title=window.prompt('اكتب عنوان المهمة الجديدة:',audience==='management'?'مهمة إدارية جديدة':'مهمة تعليمية جديدة');
 if(title===null||!title.trim())return;
 await workDo('save_item',{kind:'task',audience,title:title.trim(),lesson_id:null,
  published:false,answer_released:false},'أضيفت المهمة كمسودة قابلة للإرفاق والنشر.');
}
const WORK_UPLOAD_ACCEPT='application/pdf,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.webp';
function workFileMime(file){
 const known={'pdf':'application/pdf','doc':'application/msword',
 'docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 'xls':'application/vnd.ms-excel','xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
 'ppt':'application/vnd.ms-powerpoint',
 'pptx':'application/vnd.openxmlformats-officedocument.presentationml.presentation',
 'txt':'text/plain','jpg':'image/jpeg','jpeg':'image/jpeg','png':'image/png',
 'webp':'image/webp','mp4':'video/mp4','webm':'video/webm','mov':'video/quicktime'};
 const ext=String(file.name).split('.').pop().toLowerCase();
 return known[ext]||file.type||'';
}
async function workUploadOne(file,itemId,role){
 const mime=workFileMime(file);
 if(file.size<1||file.size>26214400)throw Error('invalid_upload');
 const prepare=await workApi('upload_prepare',{item_id:itemId,doc_role:role,
   file_name:file.name,mime_type:mime,bytes:file.size});
 const url=new URL(prepare.upload_url,WORK_STORAGE_ORIGIN);
 if(url.origin!==WORK_STORAGE_ORIGIN||!url.pathname.startsWith('/storage/v1/'))
  throw Error('عنوان رفع الملف غير موثوق.');
 const body=new FormData();
 body.append('cacheControl','3600');
 body.append('',file.type===mime?file:new File([file],file.name,{type:mime}),file.name);
 const response=await fetch(url.href,{method:'PUT',headers:{'x-upsert':'false'},body});
 if(!response.ok){
  let detail='';try{detail=(await response.json())?.message||''}catch{}
  throw Error('فشل رفع الملف ('+response.status+'). '+detail);
 }
 await workApi('upload_confirm',{pending_id:prepare.pending_id});
}
async function workUploadFiles(button){
 workNeedSupervisor();
 const itemId=button.dataset.workUpload,role=button.dataset.workRole;
 const picker=document.createElement('input');
 picker.type='file';picker.multiple=true;
 picker.accept=role==='video'?'.mp4,.webm,.mov,video/mp4,video/webm,video/quicktime':WORK_UPLOAD_ACCEPT;
 picker.addEventListener('change',async()=>{
  const files=Array.from(picker.files||[]);
  if(!files.length)return;
  let saved=0;
  try{
   for(const file of files){
    workSetStatus('جارٍ رفع الملف '+workAr(saved+1)+' من '+workAr(files.length)+': '+file.name);
    await workUploadOne(file,itemId,role);saved++;
   }
   workSetStatus('تم رفع '+workAr(saved)+' ملفًا بنجاح.');
  }catch(error){workSetStatus('رُفع '+workAr(saved)+' ملفًا فقط. '+workErrorMessage(error),true)}
  const message=workState.status,failed=workState.statusError;
  await workRefresh();
  workSetStatus(message,failed);
 });
 picker.click();
}
async function workOpenFile(docId){
 // Open synchronously to avoid browser popup blocking while waiting for a signed download URL.
 const tab=window.open('about:blank','_blank');
 if(tab)tab.opener=null;
 try{
  const data=await workApi('file_url',{id:docId,preview_as_student:workState.previewStudent});
  const url=new URL(data.url,WORK_STORAGE_ORIGIN);
  if(url.origin!==WORK_STORAGE_ORIGIN||!url.pathname.startsWith('/storage/v1/'))
   throw Error('رابط ملف غير موثوق.');
  if(tab)tab.location.replace(url.href);else window.location.assign(url.href);
 }catch(error){
  if(tab)tab.close();
  workSetStatus(workErrorMessage(error),true);
 }
}
document.addEventListener('click',async ev=>{
 const button=ev.target.closest('[data-work-preview],[data-work-tab],[data-work-refresh],[data-work-login],[data-work-new-worksheet],'+
  '[data-work-new-task],[data-work-new-resource],[data-work-delete-item],[data-work-upload],[data-work-add-youtube],'+
  '[data-work-open],[data-work-delete-file],[data-work-delete-video]');
 if(!button)return;
 ev.preventDefault();
 try{
  if(button.dataset.workPreview){
   if(!workSuperUser())throw Error('forbidden');
   const preview=button.dataset.workPreview==='student';
   if(workState.previewStudent===preview)return;
   workState.previewStudent=preview;
   workState.data=null;workState.loaded=false;workState.loading=false;
   workState.attempted=false;workState.tab='worksheets';workState.generation++;
   workState.status='';workState.statusError=false;
   render();return;
  }
  if(button.dataset.workTab){workState.tab=button.dataset.workTab;render();return}
  if(button.hasAttribute('data-work-refresh')){await workRefresh();return}
  if(button.hasAttribute('data-work-login')){
   if(typeof selectEntryGate==='function')selectEntryGate('student');
   else document.getElementById('authDialog')?.showModal();
   return;
  }
  if(button.dataset.workNewWorksheet){await workNewWorksheet(button);return}
  if(button.dataset.workNewResource){await workNewResource(button);return}
  if(button.dataset.workNewTask){await workNewTask(button.dataset.workNewTask);return}
  if(button.dataset.workUpload){await workUploadFiles(button);return}
  if(button.dataset.workOpen){await workOpenFile(button.dataset.workOpen);return}
  if(button.dataset.workAddYoutube){
   workNeedSupervisor();
   const url=window.prompt('ألصق رابط فيديو يوتيوب (https://...):','https://www.youtube.com/watch?v=');
   if(!url)return;
   const title=window.prompt('عنوان الفيديو:', 'شرح الدرس');
   if(title===null)return;
   await workDo('add_video_link',{item_id:button.dataset.workAddYoutube,url,title},'تم إرفاق رابط الفيديو.');
   return;
  }
  if(button.dataset.workDeleteFile){
   workNeedSupervisor();
   if(!window.confirm('هل تريد حذف هذا الملف نهائيًا من هذه الورقة؟'))return;
   await workDo('delete_file',{id:button.dataset.workDeleteFile},'حُذف الملف.');
   return;
  }
  if(button.dataset.workDeleteVideo){
   workNeedSupervisor();
   if(!window.confirm('حذف رابط الفيديو من هذا الدرس؟'))return;
   await workDo('delete_video_link',{id:button.dataset.workDeleteVideo},'حُذف رابط الفيديو.');
   return;
  }
  if(button.dataset.workDeleteItem){
   workNeedSupervisor();
   if(!window.confirm('سيُحذف هذا البند وجميع مرفقاته ونماذج إجابته. هل تؤكد؟'))return;
   await workDo('delete_item',{id:button.dataset.workDeleteItem},'حُذفت الورقة أو المهمة ومرفقاتها.');
   return;
  }
 }catch(error){workSetStatus(workErrorMessage(error),true)}
});
document.addEventListener('submit',async ev=>{
 const form=ev.target.closest('form[data-work-edit]');
 if(!form)return;
 ev.preventDefault();
 try{
  workNeedSupervisor();
  const id=form.dataset.workEdit,original=workItems().find(x=>x.id===id);
  if(!original)throw Error('العنصر لم يعد متاحًا. حدّث الكشف.');
  const data=new FormData(form),title=String(data.get('title')||'').trim();
  await workDo('save_item',{id,kind:original.kind,audience:original.audience,
   lesson_id:original.lesson_id,title,instructions:String(data.get('instructions')||''),
   published:data.has('published'),answer_released:data.has('answer_released')},
   'حُفظت إعدادات الورقة ونشرها بنجاح.');
 }catch(error){workSetStatus(workErrorMessage(error),true)}
});

// Respect direct links to the educational work area after legacy routes initialize.
if(window.AFAQ_REQUESTED_HASH==='work')Promise.resolve().then(()=>route('work',false));
