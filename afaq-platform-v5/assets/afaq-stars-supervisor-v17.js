/* Dedicated Star Contest controls in Afaq Math supervisor dashboard.
 * All sensitive actions and student data are server-verified, never local-only. */
'use strict';
const AFAQ_STARS_GAME_API='https://xcwuwflggiwkehzquugz.supabase.co/functions/v1/afaq-contest-v2';
const afaqStarsConsole={
 loaded:false,loading:false,attempted:false,token:'',students:[],globalOpen:true,
 updatedAt:'',error:'',message:'',busy:false,query:'',classFilter:'all'
};
const afaqStarsEsc=value=>String(value??'').replace(/[&<>"']/g,chr=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[chr]));
const afaqStarsNumber=value=>new Intl.NumberFormat('ar-OM',{useGrouping:false}).format(Number(value)||0);
const afaqStarsSupervisor=()=>auth.user?.role==='supervisor'&&Boolean(auth.token);
async function afaqStarsServer(action,data={}){
 if(!afaqStarsSupervisor())throw Error('تتطلب هذه العملية تسجيل الدخول بصفة المشرف الرئيسي.');
 const response=await fetch(AFAQ_STARS_GAME_API,{
  method:'POST',cache:'no-store',
  headers:{'Content-Type':'application/json','Authorization':'Bearer '+auth.token},
  body:JSON.stringify({action,...data})
 });
 let json;try{json=await response.json()}catch{throw Error('تعذر الاتصال بخدمة مسابقة نجوم آفاق.')}
 if(!response.ok||!json.ok){
  const reasons={
   unauthorized:'انتهت جلسة المشرف؛ أعد تسجيل الدخول.',
   forbidden:'ليس لديك صلاحية تنفيذ هذا الإجراء.',
   supervisor_only:'الإجراء متاح للمشرف الرئيسي فقط.',
   invalid_student:'بيانات الطالب غير صحيحة.',
   student_not_found:'لم يُعثر على الطالب في كشوف المسابقة.',
   invalid_scope:'نطاق التغيير غير صحيح.'
  };
  throw Error(reasons[json.error]||('تعذر إتمام العملية: '+(json.error||response.status)));
 }
 return json;
}
async function afaqStarsLoad(force=false){
 if(!afaqStarsSupervisor()||afaqStarsConsole.loading)return;
 if(!force&&afaqStarsConsole.attempted&&afaqStarsConsole.token===auth.token)return;
 const token=auth.token;
 afaqStarsConsole.loading=true;afaqStarsConsole.attempted=true;
 afaqStarsConsole.token=token;afaqStarsConsole.error='';
 try{
  const [settings,report]=await Promise.all([
   afaqStarsServer('contest_gate_status'),
   afaqStarsServer('staff_results')
  ]);
  if(token!==auth.token||!afaqStarsSupervisor())return;
  afaqStarsConsole.students=Array.isArray(report.students)?report.students:[];
  afaqStarsConsole.globalOpen=settings.global_open===true;
  afaqStarsConsole.updatedAt=settings.updated_at||'';
  afaqStarsConsole.loaded=true;
 }catch(error){
  if(token!==auth.token)return;
  afaqStarsConsole.error=error.message||'تعذر تحميل حالة المسابقة.';
 }finally{
  afaqStarsConsole.loading=false;
  if(auth.section==='afaq_stars_center'&&state.page==='dashboard'&&token===auth.token)render();
 }
}
function afaqStarsHeader(){
 return '<header class="afaq-stars-hero"><div class="afaq-stars-hero-medal" aria-hidden="true">🏆</div>'+
 '<div class="afaq-stars-hero-copy"><span>حساب المشرف الرئيسي — أدوات فعلية متصلة بقاعدة المسابقة</span>'+
 '<h1>مركز إدارة نجوم آفاق الرياضيات</h1>'+
 '<p>تحكّم في السماح بالدخول، وتابع عدد مرات دخول الطلاب ومحاولاتهم والمراحل المجتازة والدرجات. لا يؤدي إغلاق الدخول إلى حذف النتائج أو المحاولات السابقة.</p></div>'+
 '<div class="afaq-stars-hero-links"><button type="button" id="afaqStarsRefresh" class="afaq-stars-main-button">تحديث بيانات المسابقة</button>'+
 '<a href="competition.html" class="afaq-stars-secondary-button">إدارة الأسئلة والنماذج وإعادة المحاولات</a>'+
 '<button type="button" data-tab="overview" class="afaq-stars-return">العودة إلى لوحة المشرف</button></div></header>';
}
function afaqStarsStats(){
 const xs=afaqStarsConsole.students;
 const entered=xs.filter(x=>Number(x.contest_entry_count)>0).length;
 const qualified=xs.filter(x=>x.qualified).length;
 const started=xs.filter(x=>(x.parts||[]).some(p=>Number(p.attempts_used)>0)).length;
 const completed=xs.filter(x=>(x.parts||[]).every(p=>p.best!==null&&p.best!==undefined)).length;
 const blocked=xs.filter(x=>x.contest_enabled===false).length;
 const counts=[
  ['الطلاب المسجلون',xs.length,'users'],
  ['دخلوا المسابقة',entered,'log-in'],
  ['بدؤوا المحاولات',started,'play'],
  ['أكملوا الوحدات الأربع',completed,'check-circle'],
  ['المتأهلون (٣٥٠ فأكثر)',qualified,'award'],
  ['الممنوعون فرديًا',blocked,'lock']
 ];
 return '<div class="afaq-stars-metrics">'+counts.map(([name,value,icon])=>
  '<article><strong>'+afaqStarsNumber(value)+'</strong><span>'+name+'</span></article>').join('')+'</div>';
}
function afaqStarsDate(input){
 if(!input)return 'لم يسجل دخول';
 const date=new Date(input);
 return Number.isNaN(date.getTime())?'—':new Intl.DateTimeFormat('ar-OM',{dateStyle:'short',timeStyle:'short',timeZone:'Asia/Muscat'}).format(date);
}
function afaqStarsStudentRow(x){
 const parts=Array.isArray(x.parts)?x.parts:[];
 const attempts=parts.map(p=>'و'+afaqStarsNumber(p.section)+': '+afaqStarsNumber(p.attempts_used)+'/٢').join(' · ')||'لم يبدأ';
 const stages=parts.map(p=>'و'+afaqStarsNumber(p.section)+': '+afaqStarsNumber(p.stages_completed)+'/٥').join(' · ')||'—';
 const scores=parts.map(p=>'و'+afaqStarsNumber(p.section)+': '+(p.best==null?'—':afaqStarsNumber(p.best))).join(' · ');
 const allowed=x.contest_enabled!==false;
 const search=(x.full_name+' '+x.class_name+' '+x.serial_no).toLowerCase();
 return '<tr data-stars-class="'+afaqStarsEsc(x.class_name)+'" data-stars-search="'+afaqStarsEsc(search)+'">'+
 '<td><strong>'+afaqStarsEsc(x.full_name)+'</strong><small>'+afaqStarsEsc(x.class_name)+' — رقم '+afaqStarsNumber(x.serial_no)+'</small></td>'+
 '<td>'+afaqStarsNumber(x.platform_login_count)+'</td>'+
 '<td>'+afaqStarsNumber(x.contest_entry_count)+'<small>'+afaqStarsDate(x.last_contest_entry)+'</small></td>'+
 '<td><span class="afaq-stars-table-mini">'+afaqStarsEsc(attempts)+'</span></td>'+
 '<td><span class="afaq-stars-table-mini">'+afaqStarsEsc(stages)+'</span></td>'+
 '<td><b>'+afaqStarsNumber(x.total)+' / ٤٠٠</b><small>'+afaqStarsEsc(scores)+'</small></td>'+
 '<td><span class="afaq-stars-pill '+(x.qualified?'qualifies':'ongoing')+'">'+(x.qualified?'متأهل':'غير متأهل بعد')+'</span>'+
 (!x.pin_changed?'<small class="afaq-stars-pin-warning">لم يغيّر الرقم السري الأولي</small>':'')+'</td>'+
 '<td><span class="afaq-stars-pill '+(allowed?'enabled':'disabled')+'">'+(allowed?'مسموح':'موقوف')+'</span>'+
 '<button type="button" data-stars-student="'+afaqStarsEsc(x.student_id)+'" data-stars-enabled="'+(allowed?'false':'true')+'" class="afaq-stars-row-action"'+(afaqStarsConsole.busy?' disabled':'')+'>'+
 (allowed?'إيقاف دخول الطالب':'السماح بدخول الطالب')+'</button></td></tr>';
}
function afaqStarsTable(){
 const students=afaqStarsConsole.students.slice().sort((a,b)=>(b.total||0)-(a.total||0)||
 String(a.class_name).localeCompare(String(b.class_name),'ar')||
 Number(a.serial_no)-Number(b.serial_no));
 const classes=[...new Set(students.map(x=>String(x.class_name)))].sort((a,b)=>a.localeCompare(b,'ar'));
 return '<section class="afaq-stars-panel">'+
 '<div class="afaq-stars-section-title"><div><h2>متابعة دخول الطلاب وتقدمهم</h2><p>بيانات فعلية: دخول المسابقة، المحاولات الرسمية، المراحل الخمس لكل وحدة، أفضل درجات الطالب وحالة التأهل.</p></div>'+
 '<a href="competition.html" class="afaq-stars-secondary-button">فتح لوحة المسابقة التفصيلية</a></div>'+
 '<div class="afaq-stars-filters"><label>البحث عن طالب<input id="afaqStarsSearch" type="search" autocomplete="off" placeholder="الاسم أو الشعبة أو رقم الطالب" value="'+afaqStarsEsc(afaqStarsConsole.query)+'"></label>'+
 '<label>الشعبة<select id="afaqStarsClass"><option value="all">جميع الشعب</option>'+classes.map(name=>
 '<option value="'+afaqStarsEsc(name)+'"'+(afaqStarsConsole.classFilter===name?' selected':'')+'>'+afaqStarsEsc(name)+'</option>').join('')+'</select></label>'+
 '<span id="afaqStarsVisible" role="status"></span></div>'+
 '<div class="afaq-stars-table-scroll"><table class="afaq-stars-table"><thead><tr>'+
 '<th>الطالب والشعبة</th><th>دخول المنصة</th><th>دخول المسابقة وآخر دخول</th>'+
 '<th>محاولات الوحدات</th><th>المراحل المجتازة</th><th>الدرجات</th><th>التأهل</th><th>التحكم في الدخول</th>'+
 '</tr></thead><tbody>'+students.map(afaqStarsStudentRow).join('')+'</tbody></table></div>'+
 '<p class="afaq-stars-note">عدد مرات الدخول يعكس الجلسات التي سجلها النظام؛ قد يختلف عن عدد الزيارات أو الأشخاص المتصلين الآن. عدم تغيير الرقم السري الأولي يمنع بدء المسابقة حتى لو كان الدخول مسموحًا.</p></section>';
}
function afaqStarsGateControls(){
 const open=afaqStarsConsole.globalOpen;
 return '<section class="afaq-stars-panel afaq-stars-global-gate"><div><h2>صلاحية دخول الطلاب إلى المسابقة</h2>'+
 '<p>تُطبق هذه الإعدادات على المسابقة فقط، ولا تعطل حسابات الطلاب في المنصة التعليمية أو تحذف أي نتائج مسجلة.</p></div>'+
 '<div class="afaq-stars-gate-row"><span class="afaq-stars-gate-status '+(open?'open':'closed')+'">'+
 (open?'🟢 المسابقة مفتوحة للطلاب المسموح لهم':'🔴 المسابقة مغلقة أمام جميع الطلاب')+'</span>'+
 '<button type="button" id="afaqStarsToggleAll" class="afaq-stars-gate-action '+(open?'danger':'success')+'"'+(afaqStarsConsole.busy?' disabled':'')+'>'+
 (open?'إغلاق دخول جميع الطلاب':'فتح دخول جميع الطلاب')+'</button></div>'+
 '<p class="afaq-stars-note">عند الإغلاق العام تتوقف المحاولات الجديدة والاستكمال والتدريب حتى إعادة الفتح. تبقى بيانات التقدم السابقة محفوظة. ويمكن السماح لطالب بعينه أو منعه باستخدام الجدول أدناه.</p></section>';
}
function afaqStarsManagementView(){
 if(!afaqStarsSupervisor())return '<div class="container"><p class="notice">إدارة دخول مسابقة نجوم آفاق متاحة للمشرف الرئيسي فقط بعد تسجيل الدخول المعتمد.</p></div>';
 if(!afaqStarsConsole.loading&&(!afaqStarsConsole.attempted||afaqStarsConsole.token!==auth.token)){
  Promise.resolve().then(()=>afaqStarsLoad());
 }
 return '<div class="container afaq-stars-console" dir="rtl">'+
 (typeof hubStaffNav==='function'?hubStaffNav():'')+
 afaqStarsHeader()+
 '<div class="afaq-stars-message" role="status" aria-live="polite">'+
 afaqStarsEsc(afaqStarsConsole.loading?'جارٍ تحميل بيانات المسابقة ...':afaqStarsConsole.message||afaqStarsConsole.error)+'</div>'+
 (afaqStarsConsole.loaded&&afaqStarsConsole.token===auth.token?
 afaqStarsGateControls()+afaqStarsStats()+afaqStarsTable():
 '<section class="afaq-stars-panel"><p>'+(afaqStarsConsole.error?afaqStarsEsc(afaqStarsConsole.error):'جارٍ تحميل بيانات المسابقة من الخادم ...')+'</p>'+
 '<button id="afaqStarsRetry" type="button">إعادة المحاولة</button></section>')+
 '</div>';
}
function afaqStarsVisibleRows(){
 const search=afaqStarsConsole.query.trim().toLowerCase();
 let count=0;
 document.querySelectorAll('.afaq-stars-table tbody tr').forEach(row=>{
  const matchesClass=afaqStarsConsole.classFilter==='all'||row.dataset.starsClass===afaqStarsConsole.classFilter;
  const matchesText=!search||String(row.dataset.starsSearch||'').toLowerCase().includes(search);
  row.hidden=!(matchesClass&&matchesText);
  if(!row.hidden)count++;
 });
 const counter=document.getElementById('afaqStarsVisible');if(counter)counter.textContent='الطلاب المعروضون: '+afaqStarsNumber(count);
}
async function afaqStarsChangeGate(scope,enabled,studentId='',studentName=''){
 if(!afaqStarsSupervisor()||afaqStarsConsole.busy)return;
 const message=scope==='global'?
 (enabled?'هل تؤكد فتح دخول جميع الطلاب المسموح لهم إلى مسابقة نجوم آفاق؟':'هل تؤكد إغلاق دخول جميع الطلاب إلى المسابقة؟ ستتوقف محاولاتهم الجارية حتى إعادة الفتح.'):
 (enabled?'هل تؤكد السماح للطالب '+studentName+' بدخول المسابقة؟':'هل تؤكد منع الطالب '+studentName+' من دخول المسابقة دون المساس بحسابه ودرجاته؟');
 if(!window.confirm(message))return;
 afaqStarsConsole.busy=true;afaqStarsConsole.message='جارٍ حفظ التغيير في خادم المسابقة ...';render();
 try{
  await afaqStarsServer('contest_gate_set',{scope,enabled,...(scope==='student'?{student_id:studentId}:{})});
  afaqStarsConsole.message=scope==='global'?(enabled?'تم فتح المسابقة للجميع بنجاح.':'تم إغلاق المسابقة أمام الجميع بنجاح.'):(enabled?'تم السماح للطالب بالدخول.':'تم منع دخول الطالب للمسابقة.');
  await afaqStarsLoad(true);
 }catch(err){afaqStarsConsole.error=err.message;afaqStarsConsole.message='تعذر حفظ التغيير: '+err.message}
 finally{afaqStarsConsole.busy=false;if(auth.section==='afaq_stars_center')render()}
}
const afaqStarsPriorStaffPanel=staffPanel;
staffPanel=function(){
 if(auth.section==='afaq_stars_center')return afaqStarsManagementView();
 return afaqStarsPriorStaffPanel();
};
const afaqStarsPriorHubNav=hubStaffNav;
hubStaffNav=function(){
 const base=afaqStarsPriorHubNav();
 if(auth.user?.role!=='supervisor')return base;
 return base.replace('</div>','<button class="afaq-stars-nav-link '+(auth.section==='afaq_stars_center'?'selected':'')+
 '" type="button" data-tab="afaq_stars_center">🏆 إدارة نجوم آفاق</button></div>');
};
const afaqStarsPriorHubDashboard=hubStaffDashboard;
hubStaffDashboard=function(){
 const original=afaqStarsPriorHubDashboard();
 if(!afaqStarsSupervisor())return original;
 const feature='<section class="afaq-stars-spotlight"><span class="afaq-stars-spotlight-icon" aria-hidden="true">🏆</span>'+
 '<div><strong>إدارة مسابقة نجوم آفاق الرياضيات</strong>'+
 '<p>التحكم في دخول الطلاب • المراحل والمحاولات • النتائج والتأهل</p></div>'+
 '<button type="button" data-tab="afaq_stars_center">فتح مركز إدارة المسابقة</button></section>';
 return original.replace('<section class="hub-main hub-staff-stats">',feature+'<section class="hub-main hub-staff-stats">');
};
const afaqStarsPriorAttachPortal=attachPortal;
attachPortal=function(){
 afaqStarsPriorAttachPortal();
 if(auth.section!=='afaq_stars_center'||!afaqStarsSupervisor())return;
 document.getElementById('afaqStarsRefresh')?.addEventListener('click',()=>afaqStarsLoad(true));
 document.getElementById('afaqStarsRetry')?.addEventListener('click',()=>afaqStarsLoad(true));
 document.getElementById('afaqStarsToggleAll')?.addEventListener('click',()=>{
  afaqStarsChangeGate('global',!afaqStarsConsole.globalOpen);
 });
 document.querySelectorAll('[data-stars-student]').forEach(button=>button.addEventListener('click',()=>{
  const id=button.dataset.starsStudent;
  const entry=afaqStarsConsole.students.find(x=>String(x.student_id)===id);
  if(entry)afaqStarsChangeGate('student',button.dataset.starsEnabled==='true',id,entry.full_name);
 }));
 document.getElementById('afaqStarsSearch')?.addEventListener('input',event=>{
  afaqStarsConsole.query=event.target.value;afaqStarsVisibleRows();
 });
 document.getElementById('afaqStarsClass')?.addEventListener('change',event=>{
  afaqStarsConsole.classFilter=event.target.value;afaqStarsVisibleRows();
 });
 afaqStarsVisibleRows();
};
