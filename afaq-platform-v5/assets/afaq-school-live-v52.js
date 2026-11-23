/* AFAQMATHS: additive school live schedule in existing authenticated student dashboard. */
(function(){
"use strict";
var API="https://xcwuwflggiwkehzquugz.supabase.co/functions/v1/afaq-school-live-sessions";
var classes=["السادس / ٤","السادس / ٥","السادس / ٦"];
var cache=[],busy=false,lastError="",pending=false,editingId="",lastRole="";
function $(s){return document.querySelector(s)}
function safe(x){return String(x===null||x===undefined?"":x).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function account(){try{return typeof auth!=="undefined"&&auth.user?auth.user:null}catch(e){return null}}
function token(){try{return typeof auth!=="undefined"?auth.token||"":""}catch(e){return ""}}
function page(){try{return typeof state!=="undefined"?state.page:""}catch(e){return ""}}
function editor(){var a=account();return a&&["supervisor","supervisor_assistant"].includes(a.role)}
function formattedTime(value){
 try{return new Intl.DateTimeFormat("ar-OM",{weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"numeric",minute:"2-digit",hour12:true,timeZone:"Asia/Muscat"}).format(new Date(value))}
 catch(e){return "الموعد غير محدد"}
}
function valueInMuscat(value){
 try{var s=new Intl.DateTimeFormat("sv-SE",{timeZone:"Asia/Muscat",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date(value));return s.replace(" ","T")}
 catch(e){return ""}
}
function isUrl(x){try{var u=new URL(x);return u.protocol==="https:"&&!u.username&&!u.password}catch(e){return false}}
async function request(action,payload){
 var k=token();if(!k)throw new Error("سجّل الدخول إلى حسابك أولًا");
 var r=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+k},cache:"no-store",body:JSON.stringify(Object.assign({action:action},payload||{}))});
 var data;try{data=await r.json()}catch(e){throw new Error("تعذر استلام البيانات من خادم المواعيد")}
 if(!r.ok||!data.ok){throw new Error(({unauthorized:"انتهت الجلسة أو لم تُعتمد؛ سجّل الدخول مرة أخرى",forbidden:"لا تسمح صلاحيات حسابك بهذا الإجراء",invalid_session:"تحقق من بيانات الحصة والموعد والرابط",unauthorized_student:"حساب الطالب غير مخوّل لعرض هذا الجدول"})[data.error]||"تعذر تنفيذ العملية")}
 return data;
}
function studentShell(){
 return '<section class="afaq-school-live-addon" id="afaq-school-student-widget" aria-label="مواعيد حصصي المباشرة">'+
 '<div class="afaq-school-live-heading"><div class="afaq-school-live-title"><span class="afaq-school-live-emblem">▣</span><div><h3>لوحتي التعليمية ومواعيد الحصص المباشرة</h3><p>مواعيدي المخصصة لشعبتي، والدروس والأنشطة المرتبطة بحسابي</p></div></div><button type="button" class="afaq-school-live-btn" data-afaq-schedule-refresh>↻ تحديث المواعيد</button></div>'+
 '<div class="afaq-school-live-additional"><h4>الوصول السريع إلى خدماتي</h4><div class="afaq-school-shortcuts">'+[
 ["learning","الدروس والأنشطة"],["library","مكتبة الرياضيات"],["contests","المسابقات"],["grade","دروسي"]
 ].map(function(x){return '<button class="afaq-school-live-btn" type="button" data-afaq-schedule-route="'+x[0]+'">'+x[1]+'</button>'}).join("")+'</div></div>'+
 '<h4 style="margin-top:18px">حصصي القادمة</h4><div id="afaq-school-student-list" class="afaq-school-live-cards"><p>جارٍ تحميل المواعيد…</p></div>'+
 '<p class="afaq-school-live-footnote">خدمات الجدول المدرسي مجانية ومستقلة عن أكاديمية آفاق ماذس المدفوعة. رابط الحصة لا يظهر إلا للطالب المصرح له قرب وقت بدايتها.</p></section>';
}
function staffShell(){
 var select='<option value="">جميع شعب الصف السادس</option>'+classes.map(function(v){return '<option value="'+safe(v)+'">'+safe(v)+'</option>'}).join("");
 return '<section class="afaq-school-live-addon afaq-school-live-admin" id="afaq-school-admin-widget" aria-label="إدارة مواعيد الفصول المباشرة"><div class="afaq-school-live-heading"><div class="afaq-school-live-title"><span class="afaq-school-live-emblem">▣</span><div><h3>إدارة الفصول المباشرة والمواعيد</h3><p>تحديد الحصص المجانية، والشعب المستهدفة، ورابط الجلسة الآمن</p></div></div><button class="afaq-school-live-btn" type="button" data-afaq-schedule-refresh>↻ تحديث الجدول</button></div>'+
 '<form id="afaq-school-schedule-form"><div class="afaq-school-live-grid"><label>عنوان الحصة<input required name="title" maxlength="140" placeholder="مثل: مراجعة الوحدة الرابعة"></label><label>المادة<input required name="subject" maxlength="90" value="الرياضيات"></label><label>المعلم<input name="teacher_name" maxlength="120" placeholder="اسم معلم الحصة"></label><label>الشعبة المستهدفة<select name="class_name">'+select+'</select></label><label>التاريخ والوقت (عُمان)<input type="datetime-local" name="starts_at" required></label><label>المدة بالدقائق<input type="number" name="duration_minutes" min="15" max="180" value="45" required></label><label class="afaq-school-wide">رابط الاجتماع HTTPS (اختياري)<input type="url" name="meeting_url" placeholder="https://teams.microsoft.com/..." maxlength="900"></label><label class="afaq-school-wide">وصف الحصة أو تعليمات الدخول<textarea name="details" maxlength="650" placeholder="الكتاب أو الدرس المطلوب للتحضير"></textarea></label></div><div class="afaq-school-live-admin-actions"><label style="display:flex;align-items:center;gap:5px;font-weight:900;font-size:13px"><input type="checkbox" name="published"> نشر الموعد للطلاب</label><button type="submit" class="afaq-school-live-btn primary">حفظ الحصة</button><button type="button" id="afaq-school-schedule-clear" class="afaq-school-live-btn">إضافة حصة جديدة</button></div></form><div class="afaq-school-live-status" role="status" id="afaq-school-admin-status"></div><h4>الحصص المحفوظة</h4><div class="afaq-school-live-list" id="afaq-school-admin-list"><p>جارٍ تحميل الجدول…</p></div><p class="afaq-school-live-verify">يُحجب رابط الحصة عن الطالب حتى آخر 15 دقيقة قبل بدايتها، ويختفي بعد نهاية الحصة بربع ساعة. لا تُرسل روابط الحصص عبر محتوى عام.</p></section>';
}
function showStudent(){
 var target=$("#afaq-school-student-list");if(!target)return;
 if(lastError){target.innerHTML='<div class="afaq-school-live-empty">'+safe(lastError)+'</div>';return}
 var a=cache.filter(function(x){return x.published!==false});
 if(!a.length){target.innerHTML='<div class="afaq-school-live-empty">لا توجد حصص مباشرة منشورة لشعبتك حاليًا. ستظهر هنا بعد اعتماد المعلم أو المشرف للمواعيد.</div>';return}
 target.innerHTML=a.map(function(x){
  var start=new Date(x.starts_at).getTime(),now=Date.now(),open=isUrl(x.meeting_url||"")&&now>=start-15*60000&&now<start+(Number(x.duration_minutes)+15)*60000;
  var link=open?'<a class="afaq-school-live-btn primary" href="'+safe(x.meeting_url)+'" target="_blank" rel="noopener noreferrer">الدخول إلى الحصة ↗</a>':
   '<span class="afaq-schedule-tag">رابط الحصة يُتاح قبل الموعد بـ15 دقيقة</span>';
  return '<article class="afaq-school-live-card"><span class="afaq-schedule-tag">'+safe(x.subject)+'</span><h4>'+safe(x.title)+'</h4><div class="afaq-schedule-time">◷ '+safe(formattedTime(x.starts_at))+' • '+safe(x.duration_minutes)+' دقيقة</div><p>المعلم: '+safe(x.teacher_name||"سيُعلن")+(x.class_name?' • '+safe(x.class_name):' • جميع الشعب')+'</p>'+(x.details?'<p>'+safe(x.details)+'</p>':"")+'<div>'+link+'</div></article>';
 }).join("");
}
function showAdmin(){
 var node=$("#afaq-school-admin-list");if(!node)return;
 if(lastError){node.innerHTML='<p>'+safe(lastError)+'</p>';return}
 if(!cache.length){node.innerHTML='<p>لا توجد مواعيد محفوظة بعد. أضف الحصة الأولى من النموذج أعلاه.</p>';return}
 node.innerHTML=cache.map(function(x){
  return '<div><span><strong>'+safe(x.title)+'</strong> <small>'+safe(formattedTime(x.starts_at))+' • '+safe(x.class_name||"جميع الشعب")+' • '+(x.published?'منشور':'مسودة')+'</small></span><span><button type="button" class="afaq-school-live-btn" data-afaq-schedule-edit="'+safe(x.id)+'">تعديل</button> <button class="afaq-school-live-btn" type="button" data-afaq-schedule-delete="'+safe(x.id)+'">حذف</button></span></div>';
 }).join("");
}
async function refresh(){
 if(busy)return;var a=account();if(!a||!token())return;
 var widget=a.role==="student"||a.role==="demo"?$("#afaq-school-student-widget"):$("#afaq-school-admin-widget");if(!widget)return;
 busy=true;lastError="";
 try{var result=await request(editor()?"admin_list":"list");cache=result.sessions||[]}
 catch(e){lastError=e.message;cache=[]}
 finally{busy=false;showStudent();showAdmin()}
}
function setAdminStatus(msg){var x=$("#afaq-school-admin-status");if(x)x.textContent=msg}
function clearForm(){
 editingId="";var f=$("#afaq-school-schedule-form");if(!f)return;
 f.reset();f.elements.namedItem("subject").value="الرياضيات";f.elements.namedItem("duration_minutes").value=45;
 setAdminStatus("يمكنك الآن إدخال حصة جديدة.");
}
function startEdit(id){
 if(!editor())return;
 var row=cache.find(function(x){return x.id===id}),f=$("#afaq-school-schedule-form");if(!row||!f)return;
 editingId=id;["title","subject","teacher_name","class_name","duration_minutes","details","meeting_url"].forEach(function(k){var el=f.elements.namedItem(k);if(el)el.value=row[k]||""});
 f.elements.namedItem("duration_minutes").value=row.duration_minutes;
 f.elements.namedItem("starts_at").value=valueInMuscat(row.starts_at);
 f.elements.namedItem("published").checked=!!row.published;
 setAdminStatus("جارٍ تعديل الحصة: "+row.title);f.scrollIntoView({behavior:"smooth",block:"center"});
}
async function saveForm(f){
 if(!editor()){setAdminStatus("هذا الإجراء مخصص للمشرفين المخولين.");return}
 var d=new FormData(f),time=String(d.get("starts_at")||"");if(!time){setAdminStatus("أدخل موعد الحصة.");return}
 var date=new Date(time+"+04:00");if(Number.isNaN(date.getTime())){setAdminStatus("موعد الحصة غير صالح.");return}
 var out={id:editingId||undefined,title:String(d.get("title")||"").trim(),subject:String(d.get("subject")||"").trim(),
  class_name:String(d.get("class_name")||"")||null,grade:6,teacher_name:String(d.get("teacher_name")||"").trim(),details:String(d.get("details")||"").trim(),
  duration_minutes:Number(d.get("duration_minutes")),starts_at:date.toISOString(),meeting_url:String(d.get("meeting_url")||"").trim(),published:d.has("published")};
 setAdminStatus("جارٍ حفظ الحصة...");var button=f.querySelector('button[type=submit]');button.disabled=true;
 try{await request("save",{session:out});setAdminStatus("تم حفظ الحصة بنجاح.");clearForm();await refresh()}
 catch(e){setAdminStatus("تعذر الحفظ: "+e.message)}
 finally{button.disabled=false}
}
function inject(){
 var a=account(),p=page();if(p!=="dashboard"||!a)return;
 if(a.role==="student"||a.role==="demo"){
  var host=$("#studyStudentDashboard");
  if(host&&!$("#afaq-school-student-widget")){host.insertAdjacentHTML("afterend",studentShell());refresh()}
 }else if(editor()){
  var banner=$("#app .dashboard-banner");
  if(banner&&!$("#afaq-school-admin-widget")){banner.insertAdjacentHTML("afterend",staffShell());editingId="";refresh()}
 }
}
function install(){
 if(!$("#afaq-school-to-top")){document.body.insertAdjacentHTML("beforeend",'<button type="button" id="afaq-school-to-top" class="afaq-school-to-top" aria-label="العودة إلى أعلى الصفحة" title="العودة إلى الأعلى">↑</button>')}
 var top=$("#afaq-school-to-top"),onScroll=function(){top.classList.toggle("visible",scrollY>400)};
 window.addEventListener("scroll",onScroll,{passive:true});onScroll();
 top.addEventListener("click",function(){window.scrollTo({top:0,behavior:"smooth"})});
 document.addEventListener("click",function(e){
  if(e.target.closest("[data-afaq-schedule-refresh]")){refresh();return}
  var r=e.target.closest("[data-afaq-schedule-route]");if(r){var routeName=r.dataset.afaqScheduleRoute;if(["learning","library","contests","grade"].includes(routeName)&&typeof route==="function")route(routeName);return}
  r=e.target.closest("[data-afaq-schedule-edit]");if(r){startEdit(r.dataset.afaqScheduleEdit);return}
  r=e.target.closest("[data-afaq-schedule-delete]");if(r&&editor()){var id=r.dataset.afaqScheduleDelete;if(!confirm("هل تريد حذف هذه الحصة نهائيًا من الجدول؟"))return;request("delete",{id:id}).then(function(){setAdminStatus("تم حذف الحصة.");refresh()}).catch(function(err){setAdminStatus(err.message)});return}
  if(e.target.id==="afaq-school-schedule-clear"){clearForm()}
 });
 document.addEventListener("submit",function(e){if(e.target.id==="afaq-school-schedule-form"){e.preventDefault();saveForm(e.target)}});
 var observer=new MutationObserver(function(){if(pending)return;pending=true;queueMicrotask(function(){pending=false;inject()})});
 var root=$("#app");if(root)observer.observe(root,{childList:true,subtree:true});
 inject();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});else install();
})();