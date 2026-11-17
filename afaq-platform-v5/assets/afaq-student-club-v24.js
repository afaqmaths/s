/* AFAQMATHS student club • no independent PINs or supervisor authority for members. */
'use strict';
const AC24_ROLES=[
 ['president','الرئيس'],['vice_president','نائب الرئيس'],
 ['secretary','أمين السر'],['relations','مسؤول العلاقات'],
 ['admin_one','إداري أول'],['admin_two','إداري ثانٍ'],['member','عضو']
];
const AC24_LABEL=Object.fromEntries(AC24_ROLES);
const AC24_ORDER=Object.fromEntries(AC24_ROLES.map(([k],i)=>[k,i]));
const AC24_STATES={assigned:'مُسندة',in_progress:'قيد التنفيذ',completed:'مكتملة'};
const AC24={roster:[],tasks:[],candidates:[],member:null,loaded:false,loading:false,
 token:'',adminLoaded:false,adminLoading:false,editMember:null,editTask:null,
 message:'',error:'',modalLoading:false,loginPending:false};
const ac24Supervisor=()=>auth.user?.role==='supervisor';
const ac24Student=()=>auth.user?.role==='student';
const ac24Safe=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const ac24Role=k=>AC24_LABEL[k]||'عضو';
const ac24Status=k=>AC24_STATES[k]||AC24_STATES.assigned;
const ac24Error=code=>({
 unauthorized:'انتهت الجلسة؛ يرجى تسجيل الدخول من جديد.',
 supervisor_only:'إدارة الجماعة متاحة للمشرف الرئيسي فقط.',
 supervisor_or_student_member_only:'هذه البيانات خاصة بالمشرف الرئيسي أو أعضاء الجماعة المعتمدين.',
 role_already_assigned:'هذا المنصب مشغول بالفعل؛ عَدّل منصب صاحبه أولًا.',
 member_not_found:'العضو غير موجود أو أزيل سابقًا.',
 student_not_found:'حساب الطالب غير موجود أو غير نشط.',
 invalid_member:'يرجى اختيار الطالب والمنصب الصحيحين.',
 student_not_active_member:'يجب اعتماد عضوية الطالب أولًا قبل إسناد المهام.',
 invalid_task:'عنوان المهمة أو تاريخها أو حالتها غير صالح.',
 task_student_mismatch:'لا يمكن نقل المهمة إلى عضو آخر أثناء تعديلها؛ أنشئ مهمة جديدة.',
 task_not_found:'المهمة غير موجودة أو حُذفت.',
 not_a_member:'العضوية غير مفعلة.',
 server_error:'تعذر إتمام العملية على الخادم. حاول إعادة المحاولة.'
}[code]||String(code||'تعذر إتمام العملية'));
function ac24Clear(){
 AC24.roster=[];AC24.tasks=[];AC24.candidates=[];AC24.member=null;
 AC24.loaded=false;AC24.loading=false;AC24.adminLoaded=false;AC24.adminLoading=false;
 AC24.token='';AC24.editMember=null;AC24.editTask=null;AC24.message='';AC24.error='';
}
async function ac24Call(action,params={}){
 if(!auth.token)throw Error('unauthorized');
 const response=await fetch('https://xcwuwflggiwkehzquugz.supabase.co/functions/v1/afaq-student-club-v1',{
  method:'POST',cache:'no-store',headers:{'Content-Type':'application/json',Authorization:'Bearer '+auth.token},
  body:JSON.stringify({action,...params})
 });
 let obj;try{obj=await response.json()}catch{throw Error('تعذر قراءة استجابة خادم الجماعة')}
 if(!response.ok||!obj?.ok)throw Error(obj?.error||'server_error');
 return obj;
}
function ac24Tile(){
 return '<button type="button" class="hub-gate hub-gate-illustrated afaq-club-entry" data-afaq-club-open="1" aria-label="دخول جماعة آفاق ماث الطلابية">'+
 '<span class="hub-visual ac24-icon-art" aria-hidden="true">'+
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 80" role="img" aria-label="جماعة طلابية">'+
 '<defs><linearGradient id="ac24gold" x2="1" y2="1"><stop stop-color="#f0d48b"/><stop offset="1" stop-color="#b78a37"/></linearGradient></defs>'+
 '<circle cx="45" cy="21" r="13" fill="url(#ac24gold)" stroke="#a7752a" stroke-width="1.5"/>'+
 '<circle cx="18" cy="30" r="9" fill="#6bc9c5"/><circle cx="72" cy="30" r="9" fill="#75b7e4"/>'+
 '<path d="M25 67v-9c0-13 8-20 20-20s20 7 20 20v9Z" fill="#23588b"/>'+
 '<path d="M3 66v-15c0-8 6-13 15-13 7 0 12 3 15 8M87 66v-15c0-8-6-13-15-13-7 0-12 3-15 8" fill="none" stroke="#59b3b3" stroke-width="8" stroke-linecap="round"/>'+
 '<path d="M39 52l6-5 6 5-6 12Z" fill="#f6d47e"/></svg></span>'+
 '<strong>جماعة آفاق ماث الطلابية</strong>'+
 '<span>الرئيس ونائبه وأمين السر والعلاقات والإداريان والأعضاء</span>'+
 '<small>ادخل إلى رابط الجماعة ومهام العضوية</small></button>';
}
const ac24BaseHome=hubHome;
hubHome=function(){
 const html=ac24BaseHome();
 if(!html.includes('afaq-entry-between-flag-hero'))return html;
 const mount=document.createElement('div');mount.innerHTML=html;
 const home=mount.querySelector('.hub-home');
 const supervisor=home?.querySelector('.afaq-entry-between-flag-hero [data-hub-login="supervisor"]');
 if(supervisor&&!home.querySelector('[data-afaq-club-open]')){
  const node=document.createElement('div');node.innerHTML=ac24Tile();
  supervisor.insertAdjacentElement('afterend',node.firstElementChild);
 }
 return mount.innerHTML;
};
function ac24MemberRoster(){
 const roster=[...AC24.roster].sort((a,b)=>(AC24_ORDER[a.club_role]??9)-(AC24_ORDER[b.club_role]??9)||Number(a.serial_no)-Number(b.serial_no));
 if(!roster.length)return '<p class="ac24-note">لم يُعتمد أعضاء بعد. يحدد المشرف الرئيسي الأسماء والمناصب أولًا.</p>';
 return '<div class="ac24-roster-grid">'+roster.map(m=>
  '<article><span class="ac24-role-pill">'+ac24Safe(ac24Role(m.club_role))+'</span>'+
  '<strong>'+ac24Safe(m.name)+'</strong><small>'+ac24Safe(m.class_name)+'</small>'+
  '<p><b>المهام:</b> '+ac24Safe(m.role_tasks||'تُحدَّد مهام المنصب من المشرف الرئيسي')+'</p></article>').join('')+'</div>';
}
function ac24MemberTaskList(){
 if(!AC24.tasks.length)return '<p class="ac24-note">لا توجد مهام فردية مسندة لك حتى الآن.</p>';
 return '<div class="ac24-task-list">'+AC24.tasks.map(t=>
  '<article><div><strong>'+ac24Safe(t.title)+'</strong><span class="ac24-state">'+ac24Safe(ac24Status(t.status))+'</span></div>'+
  (t.details?'<p>'+ac24Safe(t.details)+'</p>':'')+
  (t.due_date?'<small>الموعد المحدد: '+ac24Safe(t.due_date)+'</small>':'')+
  (t.status!=='completed'?'<button type="button" data-ac24-progress="'+ac24Safe(t.id)+'" data-status="'+(t.status==='assigned'?'in_progress':'completed')+'">'+
  (t.status==='assigned'?'بدأت تنفيذ المهمة':'تم إنجاز المهمة')+'</button>':'')+'</article>').join('')+'</div>';
}
function ac24Modal(){
 let node=document.getElementById('afaqClubDialog');
 if(!node){
  node=document.createElement('dialog');node.id='afaqClubDialog';node.className='ac24-modal';node.dir='rtl';
  node.addEventListener('click',ev=>{
   const button=ev.target.closest('button');if(!button)return;
   if(button.dataset.ac24Close!==undefined){node.close();return}
   if(button.dataset.ac24Login!==undefined){
    node.close();AC24.loginPending=true;
    if(typeof selectEntryGate==='function')selectEntryGate('student');
    else document.getElementById('accountBtn')?.click();
    return;
   }
   if(button.dataset.ac24Admin!==undefined){node.close();ac24GoAdmin();return}
   if(button.dataset.ac24Refresh!==undefined){ac24LoadMember();return}
   if(button.dataset.ac24Progress){
    ac24ChangeProgress(button.dataset.ac24Progress,button.dataset.status);
   }
  });
  document.body.appendChild(node);
 }
 return node;
}
function ac24ModalContent(){
 const authRole=auth.user?.role;
 let content='';
 if(!auth.user){
  content='<div class="ac24-callout"><h3>دخول أعضاء جماعة آفاق ماث</h3>'+
  '<p>يستخدم الطالب حسابه الحالي في منصة آفاق ماث؛ لا يحتاج إلى رقم سري جديد. يجب أن يعتمد المشرف عضويته أولًا.</p>'+
  '<button type="button" data-ac24-login>🔐 دخول الطالب بحسابه المعتمد</button></div>';
 }else if(authRole==='supervisor'){
  content='<div class="ac24-callout"><h3>أهلًا بالمشرف الرئيسي</h3>'+
  '<p>يمكنك إضافة الأعضاء وتوزيع المناصب وتعديل المهام ومتابعة التنفيذ من لوحة المشرف.</p>'+
  '<button type="button" data-ac24-admin>فتح إدارة الجماعة الطلابية</button></div>';
 }else if(authRole==='student'){
  if(AC24.modalLoading)content='<p class="ac24-note">جارٍ التحقق من العضوية وجلب المهام ...</p>';
  else if(AC24.error)content='<p class="ac24-error">'+ac24Safe(AC24.error)+'</p><button type="button" data-ac24-refresh>إعادة المحاولة</button>';
  else if(!AC24.member){
   content='<div class="ac24-callout"><h3>عضويتك لم تُفعّل بعد</h3>'+
   '<p>حسابك كطالب يعمل بصورة مستقلة. يُرجى مراجعة المشرف الرئيسي لإضافتك إلى الجماعة وتحديد دورك ومهامك.</p></div>';
  }else{
   content='<section class="ac24-own"><span>بطاقة العضو</span><h3>'+ac24Safe(AC24.member.name)+'</h3>'+
    '<p>'+ac24Safe(AC24.member.class_name)+'</p><div class="ac24-own-role">'+ac24Safe(ac24Role(AC24.member.club_role))+'</div>'+
    '<p><b>مهام منصبي:</b> '+ac24Safe(AC24.member.role_tasks||'يحدد المشرف مهام هذا المنصب قريبًا.')+'</p></section>'+
    '<h3>مهامي الفردية ومتابعة إنجازها</h3>'+ac24MemberTaskList()+
    '<h3>مجلس جماعة آفاق ماث وأعضاؤه</h3>'+ac24MemberRoster();
  }
 }else content='<p class="ac24-note">هذه البوابة مخصصة لأعضاء الجماعة الطلابية المعتمدين ولمشرف المنصة الرئيسي.</p>';
 return '<div class="ac24-modal-head"><span>👥 الجماعة الطلابية</span>'+
 '<button type="button" class="ac24-close" data-ac24-close aria-label="إغلاق">×</button>'+
 '<h2>جماعة آفاق ماث الطلابية</h2><p>مسؤولية • تعاون • مبادرة • إبداع رياضي</p></div>'+
 '<div class="ac24-modal-body">'+content+'</div>';
}
function ac24RedrawModal(){
 const dlg=document.getElementById('afaqClubDialog');
 if(dlg?.open)dlg.innerHTML=ac24ModalContent();
}
async function ac24LoadMember(){
 if(!ac24Student()||!auth.token)return;
 const token=auth.token;
 AC24.modalLoading=true;AC24.error='';ac24RedrawModal();
 try{
  const data=await ac24Call('club_view');
  if(token!==auth.token||!ac24Student())return;
  AC24.member=data.is_member?data.own:null;
  AC24.roster=data.is_member?data.roster||[]:[];
  AC24.tasks=data.is_member?data.tasks||[]:[];
  AC24.token=token;AC24.loaded=true;
 }catch(e){AC24.error=ac24Error(e.message);AC24.member=null}
 finally{AC24.modalLoading=false;ac24RedrawModal()}
}
async function ac24ChangeProgress(taskId,status){
 if(!ac24Student()||!auth.token)return;
 try{await ac24Call('club_task_status',{task_id:taskId,status});await ac24LoadMember()}
 catch(e){AC24.error=ac24Error(e.message);ac24RedrawModal()}
}
function ac24Open(){
 if(AC24.token&&AC24.token!==auth.token)ac24Clear();
 const dlg=ac24Modal();
 dlg.innerHTML=ac24ModalContent();
 if(!dlg.open)dlg.showModal();
 if(ac24Student())ac24LoadMember();
}
function ac24GoAdmin(){
 if(!ac24Supervisor())return;
 auth.section='afaq_student_club';
 if(state.page==='dashboard')render();
 else route('dashboard');
}
function ac24AdminShortcut(){
 return '<section class="ac24-admin-shortcut"><span class="ac24-admin-icon">👥</span>'+
 '<div><h2>جماعة آفاق ماث الطلابية</h2>'+
 '<p>اعتماد الأعضاء • اختيار الرئيس ونائبه • مهام أمين السر والعلاقات والإداريين • متابعة الإنجاز</p></div>'+
 '<button type="button" data-tab="afaq_student_club">إدارة الجماعة</button></section>';
}
const ac24PreviousStaffHome=hubStaffDashboard;
hubStaffDashboard=function(){
 const html=ac24PreviousStaffHome();
 if(!ac24Supervisor())return html;
 return html.replace('<section class="hub-main hub-staff-stats">',ac24AdminShortcut()+'<section class="hub-main hub-staff-stats">');
};
const ac24PreviousStaffNav=hubStaffNav;
hubStaffNav=function(){
 const html=ac24PreviousStaffNav();
 if(!ac24Supervisor()||html.includes('data-tab="afaq_student_club"'))return html;
 return html.replace('</div>','<button type="button" class="'+(auth.section==='afaq_student_club'?'selected':'')+'" data-tab="afaq_student_club">👥 الجماعة الطلابية</button></div>');
};
function ac24MemberOptions(includeNone=true){
 return (includeNone?'<option value="">اختر عضوًا معتمدًا</option>':'')+
 AC24.roster.map(m=>'<option value="'+ac24Safe(m.student_id)+'">'+ac24Safe(m.name)+' — '+ac24Safe(ac24Role(m.club_role))+'</option>').join('');
}
function ac24CandidateOptions(selected){
 return '<option value="">اختر الطالب من الشعب المسجلة</option>'+
 AC24.candidates.map(s=>'<option value="'+ac24Safe(s.student_id)+'"'+(selected===s.student_id?' selected':'')+'>'+
 ac24Safe(s.full_name||s.display_name)+' — '+ac24Safe(s.class_name)+' — '+ac24Safe(s.login_name||s.serial_no)+'</option>').join('');
}
function ac24AdminMemberForm(){
 const curr=AC24.editMember||{};
 return '<section class="ac24-card"><h2>➕ '+(curr.student_id?'تعديل منصب ومهام عضو':'تمكين طالب وإضافته إلى الجماعة')+'</h2>'+
 '<p>اختر طالبًا من حسابات المنصة المسجلة، ثم عيّن منصبه ومهامه. كل منصب قيادي لشخص واحد، بينما خانة «عضو» مفتوحة للجميع.</p>'+
 '<form id="ac24MemberForm" class="ac24-form">'+
 '<label>اسم الطالب<select name="student_id" required'+(curr.student_id?' disabled':'')+'>'+ac24CandidateOptions(curr.student_id||'')+'</select></label>'+
 '<label>المنصب<select name="club_role">'+AC24_ROLES.map(([k,t])=>'<option value="'+k+'"'+((curr.club_role||'member')===k?' selected':'')+'>'+t+'</option>').join('')+'</select></label>'+
 '<label class="wide">المهام والمسؤوليات<textarea name="role_tasks" maxlength="2000" rows="3" placeholder="مثال: تنسيق الأنشطة الرياضية، توثيق الاجتماعات، تقديم المقترحات...">'+ac24Safe(curr.role_tasks||'')+'</textarea></label>'+
 '<div class="ac24-actions"><button type="submit">'+(curr.student_id?'حفظ تعديل العضوية':'إضافة الطالب إلى الجماعة')+'</button>'+
 (curr.student_id?'<button type="button" data-ac24-cancel-member>إلغاء التعديل</button>':'')+'</div></form></section>';
}
function ac24AdminTaskForm(){
 const curr=AC24.editTask||{};
 return '<section class="ac24-card"><h2>📋 '+(curr.id?'تعديل مهمة':'إسناد مهمة جديدة لأحد الأعضاء')+'</h2>'+
 '<form id="ac24TaskForm" class="ac24-form">'+
 '<label>العضو المكلف<select name="student_id" required'+(curr.id?' disabled':'')+'><option value="">اختر عضوًا معتمدًا</option>'+
 AC24.roster.map(m=>'<option value="'+ac24Safe(m.student_id)+'"'+(m.student_id===curr.student_id?' selected':'')+'>'+
 ac24Safe(m.name)+' — '+ac24Safe(ac24Role(m.club_role))+'</option>').join('')+'</select></label>'+
 '<label>عنوان المهمة<input name="title" required minlength="3" maxlength="160" value="'+ac24Safe(curr.title||'')+'" placeholder="مثال: إعداد لقاء رياضي"></label>'+
 '<label class="wide">تفاصيل المهمة<textarea name="details" maxlength="1500" rows="2">'+ac24Safe(curr.details||'')+'</textarea></label>'+
 '<label>الموعد المستهدف<input name="due_date" type="date" value="'+ac24Safe(curr.due_date||'')+'"></label>'+
 '<label>الحالة<select name="status">'+Object.entries(AC24_STATES).map(([k,t])=>
 '<option value="'+k+'"'+((curr.status||'assigned')===k?' selected':'')+'>'+t+'</option>').join('')+'</select></label>'+
 '<div class="ac24-actions"><button type="submit">'+(curr.id?'حفظ المهمة':'إضافة المهمة')+'</button>'+
 (curr.id?'<button type="button" data-ac24-cancel-task>إلغاء التعديل</button>':'')+'</div></form></section>';
}
function ac24AdminList(){
 if(!AC24.roster.length)return '<p class="ac24-empty">لا توجد عضويات معتمدة بعد. ابدأ بإضافة الرئيس أو أي عضو.</p>';
 const ordered=[...AC24.roster].sort((a,b)=>(AC24_ORDER[a.club_role]??9)-(AC24_ORDER[b.club_role]??9));
 return '<div class="ac24-admin-list">'+ordered.map(m=>
  '<article><span class="ac24-role-pill">'+ac24Safe(ac24Role(m.club_role))+'</span>'+
  '<strong>'+ac24Safe(m.name)+'</strong><small>'+ac24Safe(m.class_name)+'</small>'+
  '<p>'+ac24Safe(m.role_tasks||'لم يحدد المشرف مهام هذا العضو بعد')+'</p>'+
  '<div class="ac24-actions"><button type="button" data-ac24-edit-member="'+ac24Safe(m.student_id)+'">تعديل</button>'+
  '<button type="button" class="danger" data-ac24-remove-member="'+ac24Safe(m.student_id)+'">إلغاء العضوية</button></div></article>'
 ).join('')+'</div>';
}
function ac24AdminTasksList(){
 if(!AC24.tasks.length)return '<p class="ac24-empty">لا توجد مهام فردية مسندة بعد.</p>';
 return '<div class="ac24-admin-tasks">'+AC24.tasks.map(t=>{
  const m=AC24.roster.find(x=>x.student_id===t.student_id);
  return '<article><div><strong>'+ac24Safe(t.title)+'</strong><span class="ac24-state">'+ac24Safe(ac24Status(t.status))+'</span></div>'+
  '<p><b>المكلف:</b> '+ac24Safe(m?.name||'عضوية غير نشطة')+'</p>'+
  (t.details?'<p>'+ac24Safe(t.details)+'</p>':'')+
  (t.due_date?'<small>الموعد: '+ac24Safe(t.due_date)+'</small>':'')+
  '<div class="ac24-actions"><button type="button" data-ac24-edit-task="'+ac24Safe(t.id)+'">تعديل</button>'+
  '<button type="button" class="danger" data-ac24-remove-task="'+ac24Safe(t.id)+'">حذف المهمة</button></div></article>';
 }).join('')+'</div>';
}
function ac24AdminPage(){
 if(!ac24Supervisor())return '<div class="container"><p class="ac24-error">إدارة الجماعة متاحة للمشرف الرئيسي فقط.</p></div>';
 if(!AC24.adminLoaded&&!AC24.adminLoading){
  AC24.adminLoading=true;Promise.resolve().then(ac24RefreshAdmin);
 }
 return '<div class="container ac24-admin" dir="rtl">'+(typeof hubStaffNav==='function'?hubStaffNav():'')+
 '<header class="ac24-admin-head"><span>👥 قسم الإشراف الطلابي</span>'+
 '<h1>إدارة جماعة آفاق ماث الطلابية</h1>'+
 '<p>تمكين الأعضاء والمناصب، توزيع مهام الفرق، متابعة الإنجاز، وتعديل أو إلغاء العضوية.</p>'+
 '<div class="ac24-actions"><button type="button" data-ac24-reload>تحديث كشف الجماعة</button>'+
 '<button type="button" data-tab="overview">العودة إلى لوحة المشرف</button></div></header>'+
 (AC24.message?'<p class="ac24-success" role="status">'+ac24Safe(AC24.message)+'</p>':'')+
 (AC24.error?'<p class="ac24-error" role="alert">'+ac24Safe(AC24.error)+'</p>':'')+
 (AC24.adminLoaded?'<div class="ac24-admin-stats"><strong>أعضاء الجماعة: '+AC24.roster.length+'</strong>'+
 '<strong>المناصب القيادية المشغولة: '+AC24.roster.filter(m=>m.club_role!=='member').length+' من ٦</strong>'+
 '<strong>المهام النشطة: '+AC24.tasks.length+'</strong></div>'+
 '<div class="ac24-admin-columns">'+ac24AdminMemberForm()+ac24AdminTaskForm()+'</div>'+
 '<section class="ac24-card"><h2>الأعضاء والمناصب الحالية</h2>'+ac24AdminList()+'</section>'+
 '<section class="ac24-card"><h2>المهام المكلف بها الأعضاء</h2>'+ac24AdminTasksList()+'</section>':
 '<section class="ac24-card"><p>جارٍ جلب قوائم الطلاب والمناصب والمهام ...</p></section>')+
 '</div>';
}
async function ac24RefreshAdmin(){
 if(!ac24Supervisor()||!auth.token)return;
 const token=auth.token;
 AC24.adminLoading=true;AC24.error='';
 try{
  const data=await ac24Call('club_candidates');
  if(token!==auth.token||!ac24Supervisor())return;
  AC24.candidates=data.students||[];AC24.roster=data.roster||[];AC24.tasks=data.tasks||[];
  AC24.adminLoaded=true;AC24.token=token;
 }catch(e){AC24.error=ac24Error(e.message)}
 finally{AC24.adminLoading=false;if(auth.section==='afaq_student_club'&&state.page==='dashboard')render()}
}
async function ac24RunAdmin(action,args,succeed){
 if(!ac24Supervisor())return;
 AC24.error='';AC24.message='';
 try{
  await ac24Call(action,args);
  AC24.editMember=null;AC24.editTask=null;
  AC24.message=succeed;await ac24RefreshAdmin();
 }catch(e){AC24.error=ac24Error(e.message);if(auth.section==='afaq_student_club')render()}
}
const ac24PreviousStaffPanel=staffPanel;
staffPanel=function(){
 if(auth.section==='afaq_student_club'&&ac24Supervisor())return ac24AdminPage();
 return ac24PreviousStaffPanel();
};
const ac24PreviousPersonal=personalPanel;
personalPanel=function(profile){
 const html=ac24PreviousPersonal(profile);
 if(!ac24Student())return html;
 return html+'<section class="ac24-student-shortcut">'+
 '<span>👥</span><div><strong>جماعة آفاق ماث الطلابية</strong><p>اطّلع على عضويتك ومنصبك ومهامك، إذا اعتمدك المشرف.</p></div>'+
 '<button type="button" data-afaq-club-open="1">دخول جماعة آفاق ماث</button></section>';
};
function ac24BindEvents(){
 document.querySelectorAll('[data-afaq-club-open]').forEach(btn=>btn.addEventListener('click',ac24Open));
 document.getElementById('ac24MemberForm')?.addEventListener('submit',event=>{
  event.preventDefault();
  const form=event.currentTarget,data=new FormData(form);
  const id=AC24.editMember?.student_id||String(data.get('student_id')||'');
  if(!id)return;
  ac24RunAdmin('club_save_member',{student_id:id,club_role:String(data.get('club_role')),role_tasks:String(data.get('role_tasks')||'')},
   'تم حفظ العضوية والمنصب والمهام بنجاح.');
 });
 document.getElementById('ac24TaskForm')?.addEventListener('submit',event=>{
  event.preventDefault();const data=new FormData(event.currentTarget);
  const studentId=AC24.editTask?.student_id||String(data.get('student_id')||'');
  if(!studentId)return;
  ac24RunAdmin('club_task_save',{
   id:AC24.editTask?.id||'',student_id:studentId,title:String(data.get('title')||''),
   details:String(data.get('details')||''),due_date:String(data.get('due_date')||''),
   status:String(data.get('status')||'assigned')},'تم حفظ المهمة وتحديث لوحة العضو.');
 });
 document.querySelectorAll('[data-ac24-edit-member]').forEach(btn=>btn.addEventListener('click',()=>{
  AC24.editMember=AC24.roster.find(m=>m.student_id===btn.dataset.ac24EditMember)||null;
  render();document.getElementById('ac24MemberForm')?.scrollIntoView({behavior:'smooth',block:'start'});
 }));
 document.querySelectorAll('[data-ac24-edit-task]').forEach(btn=>btn.addEventListener('click',()=>{
  AC24.editTask=AC24.tasks.find(t=>t.id===btn.dataset.ac24EditTask)||null;
  render();document.getElementById('ac24TaskForm')?.scrollIntoView({behavior:'smooth',block:'start'});
 }));
 document.querySelectorAll('[data-ac24-remove-member]').forEach(btn=>btn.addEventListener('click',()=>{
  const item=AC24.roster.find(x=>x.student_id===btn.dataset.ac24RemoveMember);
  if(!item||!window.confirm('إلغاء عضوية «'+item.name+'»؟ سيُمنع من عرض مجلس الجماعة ومهامه، وتُحفظ سجلات التكليف السابقة.'))return;
  ac24RunAdmin('club_remove_member',{student_id:item.student_id},'ألغيت العضوية من السجل النشط.');
 }));
 document.querySelectorAll('[data-ac24-remove-task]').forEach(btn=>btn.addEventListener('click',()=>{
  if(!window.confirm('حذف هذه المهمة من السجل النشط؟'))return;
  ac24RunAdmin('club_task_remove',{id:btn.dataset.ac24RemoveTask},'حُذفت المهمة من السجل النشط.');
 }));
 document.querySelectorAll('[data-ac24-cancel-member]').forEach(btn=>btn.addEventListener('click',()=>{AC24.editMember=null;render()}));
 document.querySelectorAll('[data-ac24-cancel-task]').forEach(btn=>btn.addEventListener('click',()=>{AC24.editTask=null;render()}));
 document.querySelectorAll('[data-ac24-reload]').forEach(btn=>btn.addEventListener('click',()=>{AC24.message='';ac24RefreshAdmin()}));
}
const ac24PreviousAttach=attach;
attach=function(){
 ac24PreviousAttach();
 if(AC24.token&&AC24.token!==auth.token)ac24Clear();
 ac24BindEvents();
 if(AC24.loginPending&&ac24Student()&&auth.token){
  AC24.loginPending=false;
  Promise.resolve().then(ac24Open);
 }
};
