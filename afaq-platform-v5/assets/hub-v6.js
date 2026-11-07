/* تصميم بوابات آفاق الرياضيات — الزائر والمكتبة والمسابقات وولي الأمر والدعم والطباعة. */
'use strict';
const HUB_API='https://xcwuwflggiwkehzquugz.supabase.co/functions/v1/afaq-public-hub';
const hub={
 catalog:[], visitorCount:null,visitPinged:false,fetching:false,error:'',
 libraryCat:'all',funCat:'all',trial:null,trialAnswers:{},trialBusy:false,
 trialStarted:false,supportTickets:[],supportTicketResult:null,
 parentToken:sessionStorage.getItem('afaq_parent_access_v6')||'',
 parentProfile:null,parentStatus:'',parentBusy:false,
 adminItems:[],adminLoaded:false,adminEdit:null,
 inbox:[],legacyInbox:[],inboxLoaded:false,
 stats:null,loading:false,
 parentIssued:null,selectedClass:'السادس / ٤',selectedSerial:1,parentsStatus:null,
 printOrientation:'portrait',printChosen:'intro'
};
const hv=v=>escapeHtml(v??'');
const hn=v=>new Intl.NumberFormat('ar-OM',{maximumFractionDigits:0}).format(Number(v)||0);
const H_CATEGORIES={
 contest:'المسابقات',history:'تاريخ الرياضيات',scholars:'علماء الرياضيات',
 daily_math:'الرياضيات في حياتنا',books:'الكتب والمراجع',
 exams:'الاختبارات السابقة والتدريبية',question_bank:'بنك الأسئلة',
 video:'يوتيوب تعليمي',game:'الألعاب الرياضية',flash:'الفلاشات',
 cartoon:'الرسوم الكاريكاتيرية',article:'المقالات الرياضية',fun_book:'كتب التسلية',
 learning:'التعليم والتعلّم',other:'مواد إضافية'
};
const H_ICONS={
 'users':'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3c0-3 3-5 6-5s6 2 6 5v3"/><path d="M17 6a3 3 0 0 1 0 6M18 14c3 .6 4 2 4 5v2"/>',
 'school':'<path d="M3 21V9l9-6 9 6v12M2 21h20M10 21v-7h4v7"/><path d="M9 9h6M12 7v4"/>',
 'graduation-cap':'<path d="m2 10 10-5 10 5-10 5zM6 12v5c3 3 9 3 12 0v-5M22 10v8"/>',
 'book-open':'<path d="M12 21V6C9 3 5 3 2 5v14c4-2 7-2 10 2ZM12 21V6c3-3 7-3 10-1v14c-4-2-7-2-10 2Z"/>',
 'gamepad-2':'<path d="M6 11h12c4 0 5 6 3 9-2 2-4-2-6-3H9c-2 1-4 5-6 3-2-3-1-9 3-9Z"/><path d="M7 14h5M9.5 11.5v5M17 13h.1M19 15h.1"/>',
 'smartphone':'<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 5h4M11 18h2"/><circle cx="12" cy="11" r="2"/>',
 'message-circle':'<path d="M21 11.5c0 5-4 9-9 9-2 0-4-.5-6-2L2 20l1.5-4c-.9-1.4-1.5-3-1.5-4.5 0-5 4-9 9.5-9S21 6.5 21 11.5Z"/><path d="M7 11h9M7 15h5"/>',
 'heart-handshake':'<path d="M3 8 8 4l5 3 4-3 4 4-5 5-4 5-3-3-4-4Z"/><path d="m8 8 4 2 3-2M3 17l3 3M21 17l-3 3"/>',
 'printer':'<path d="M6 9V3h12v6M6 18H3v-8h18v8h-3M6 15h12v6H6z"/><path d="M17 12h.1"/>',
 'trophy':'<path d="M7 3h10v6a5 5 0 0 1-10 0zM7 5H3v3c0 3 2 5 5 5M17 5h4v3c0 3-2 5-5 5M12 14v5M8 21h8"/>',
 'lightbulb':'<path d="M9 18h6M9 21h6M8 14c-2-2-3-4-3-6a7 7 0 0 1 14 0c0 2-1 4-3 6l-1 3H9z"/>',
 'landmark':'<path d="m2 9 10-6 10 6M4 9v11M8 9v11M12 9v11M16 9v11M20 9v11M2 21h20"/>',
 'calculator':'<rect x="5" y="2" width="14" height="20" rx="2"/><rect x="8" y="5" width="8" height="4"/><path d="M8 12h2M13 12h2M8 16h2M13 16h2"/>',
 'video':'<rect x="2" y="5" width="15" height="14" rx="2"/><path d="m17 10 5-4v12l-5-4z"/>',
 'sparkles':'<path d="m12 2 2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5zM19 19l1 2M4 2l1 2"/>',
 'smile':'<circle cx="12" cy="12" r="10"/><path d="M8 14c2 3 6 3 8 0M8 9h.1M16 9h.1"/>',
 'notebook-pen':'<rect x="5" y="2" width="16" height="20" rx="2"/><path d="M9 6h8M9 10h8M9 14h5M2 6h5M2 12h5M2 18h5"/>',
 'puzzle':'<path d="M3 3h7c-1 3 1 5 3 3 1-1 1-2 0-3h8v7c-3-1-5 1-3 3 1 1 2 1 3 0v8h-8c1-3-1-5-3-3-1 1-1 2 0 3H3v-8c3 1 5-1 3-3-1-1-2-1-3 0z"/>',
 'globe':'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2c4 4 4 16 0 20M12 2c-4 4-4 16 0 20M4 6h16M4 18h16"/>',
 'ruler':'<path d="M3 15 15 3l6 6L9 21zM11 7l3 3M8 10l3 3M5 13l3 3"/>',
 'file-text':'<path d="M14 2H5v20h14V7zM14 2v5h5M8 12h8M8 16h8"/>',
 'list-checks':'<path d="m3 5 2 2 3-3M11 6h10M3 12l2 2 3-3M11 13h10M3 19l2 2 3-3M11 20h10"/>',
 'joystick':'<path d="M12 16V7M12 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM5 16h14l2 6H3z"/>',
 'palette':'<path d="M12 2a10 10 0 0 0 0 20c2 0 2-3 0-4-1-1 0-3 2-3h4c3 0 4-4 3-6A10 10 0 0 0 12 2Z"/><circle cx="7" cy="9" r="1"/><circle cx="12" cy="6" r="1"/><circle cx="17" cy="9" r="1"/>',
 'brain':'<path d="M12 4c-3-4-8-1-7 3-4 1-3 6 0 7-2 4 3 7 7 4 4 3 9 0 7-4 3-1 4-6 0-7 1-4-4-7-7-3Z"/><path d="M12 4v14M8 9l4 3M16 9l-4 3"/>',
 'shapes':'<circle cx="7" cy="7" r="4"/><rect x="12" y="3" width="9" height="9" rx="1"/><path d="m3 21 6-10 6 10z"/>',
 'book-marked':'<path d="M5 3h15v18H5c-3 0-3-4 0-4h15M8 3v10l3-2 3 2V3"/>',
 'music':'<path d="M9 18V6l12-2v12M9 18c0 2-2 3-4 3s-4-1-4-3 2-3 4-3 4 1 4 3ZM21 16c0 2-2 3-4 3s-4-1-4-3 2-3 4-3 4 1 4 3Z"/>'
};
function hubIcon(name,color='blue'){
 const svg='<svg viewBox="0 0 24 24" aria-hidden="true" width="84" height="84" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">'+
 (H_ICONS[name]||H_ICONS['book-open'])+'</svg>';
 return '<div class="hub-visual hub-visual-'+color+'">'+svg+'<span class="hub-visual-glow"></span></div>';
}
function hubGate(title,icon,description,action,color='blue'){
 return '<button class="hub-gate" type="button" '+action+'><strong>'+hv(title)+'</strong>'+hubIcon(icon,color)+
 '<span>'+hv(description)+'</span><small>اضغط للدخول</small></button>';
}
function hubSectionCard(title,icon,desc,route,color){
 return hubGate(title,icon,desc,'data-route="'+route+'"',color);
}
const hubAudience=[
 ['زائر','تصفح المكتبة والتعلم والألعاب العامة، وتجربة سهلة واحدة لمسابقة النجوم.'],
 ['طالب','دروس وأنشطة ونتائج معتمدة ومسابقات رسمية بحساب الطالب.'],
 ['ولي أمر','متابعة نتائج الأبناء المعتمدة والتواصل الآمن برمز مخصص.'],
 ['معلم ومشرف','تحضير دروس وتقويم الطلاب ومبادرات ومصادر وكشوف وطباعة.']
];
function hubAbout(){
 return '<section class="hub-intro-panel"><h2>ما هي منصة آفاق الرياضيات؟</h2><p>مساحة تعليمية عمانية لتعلّم الرياضيات من الصف الخامس إلى الثامن، وتوسّع المعرفة بتاريخ الرياضيات وعلمائها وتطبيقاتها، وتجمع الدروس والاختبارات والألعاب والمسابقات والأنشطة المساندة.</p>'+
 '<div class="hub-audience">'+hubAudience.map(([role,desc])=>'<article><b>'+role+'</b><p>'+desc+'</p></article>').join('')+'</div>'+
 '<p class="hub-note">تُتاح الموارد العامة دون تسجيل دخول، بينما تظل بيانات الطلاب ونتائجهم الخاصة محمية برمز الدخول والصلاحيات.</p></section>';
}
function hubHome(){
 return '<div class="container hub-home"><section class="hub-banner"><div><span>🇴🇲 منصة آفاق الرياضيات • ٢٠٢٦ / ٢٠٢٧</span>'+
 '<h1>نافذتك إلى المعرفة والتعلّم والمرح</h1><p>مساحة منظّمة للطالب والمعلم وولي الأمر والزائر، تضم دروس الرياضيات ومكتبتها الثقافية وألعابها ومسابقاتها ودعمها التربوي.</p>'+
 '<button class="hub-primary" data-route="visitor">تعرّف إلى المنصة وتصفح كزائر</button></div>'+
 '<div class="hub-math-scene"><span>π</span><span>∑</span><span>√</span><span>∞</span></div></section>'+
 '<section class="hub-main"><div class="hub-heading"><span>ابدأ من هنا</span><h2>اختر بوابة الدخول</h2><p>العنوان أولًا، وأسفله صورة واضحة تعبر عن وظيفته</p></div>'+
 '<div class="hub-gate-grid hub-gate-grid-5">'+
 hubGate('التصفح كزائر','globe','محتوى عام وتجربة واحدة مجانية','data-route="visitor"','cyan')+
 hubGate('مشرف المنصة','graduation-cap','الإدارة والتحضير والتقويم','data-hub-login="supervisor"','gold')+
 hubGate('إدارة المدرسة','school','مدير المدرسة ومساعده','data-hub-login="director"','purple')+
 hubGate('الطالب','book-open','مقرراتك ونتائجك ومسابقاتك','data-hub-login="student"','green')+
 hubGate('ولي الأمر','heart-handshake','متابعة الطالب برمز خاص','data-route="parent"','rose')+
 '</div></section><section class="hub-main"><div class="hub-heading"><span>أقسام المنصة</span>'+
 '<h2>ماذا تريد أن تستكشف؟</h2></div><div class="hub-gate-grid">'+
 hubSectionCard('التعليم والتعلّم','graduation-cap','الصفوف والمناهج والدروس والأنشطة','learning','green')+
 hubSectionCard('المكتبة العامة','book-open','تاريخ الرياضيات والعلماء والاختبارات والمراجع','library','blue')+
 hubSectionCard('المرح والتسلية','smile','كاريكاتير وألغاز ومقالات وكتب تسلية','fun','rose')+
 hubSectionCard('الألعاب والمسابقات','trophy','نجوم آفاق وتحدي جنى والفلاشات','contests','gold')+
 hubSectionCard('الدعم والتواصل','smartphone','الاقتراحات والشكاوى ومراسلة مشرف المنصة','support','cyan')+
 '</div></section>'+hubAbout()+
 '<div class="hub-counter"><span>🌐 عدد المتصفحات الزائرة المسجلة</span><strong id="hubVisitorCount">'+(hub.visitorCount==null?'—':hn(hub.visitorCount))+'</strong>'+
 '<small>عدد تقريبي للمتصفحات المختلفة، وليس عدد أشخاص فريدين موثّقًا.</small></div></div>';
}
async function hubCall(action,payload={},token=''){
 const result=await fetch(HUB_API,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify({action,...payload}),cache:'no-store'});
 let data;try{data=await result.json()}catch{throw Error('تعذر قراءة استجابة الخدمة')};
 if(!result.ok||!data.ok){
  const messages={invalid_visitor:'تأكد من أن المتصفح يسمح بحفظ بيانات الزائر.',
   trial_already_completed:'انتهت المحاولة المجانية المسموحة لهذا المتصفح.',
   invalid_answers:'أجب عن الأسئلة العشرة قبل إنهاء التجربة.',
   invalid_jana_login:'اسم اللاعب أو رمز الدخول غير صحيح؛ حاول من جديد.',
   locked_15_min:'تعذر الدخول مؤقتًا بسبب محاولات خاطئة متكررة؛ حاول لاحقًا.',
   parent_login_failed:'بيانات ولي الأمر أو رمز الدخول غير صحيح.',
   parent_login_required:'انتهت جلسة ولي الأمر؛ سجل الدخول مرة أخرى.',
   invalid_support:'تحقق من نوع الرسالة والاسم ونصها.',
   daily_message_limit:'وصلت إلى الحد اليومي للرسائل.',
   staff_login_required:'يجب دخول حساب المشرف أو المساعد.',
   supervisor_only:'هذا التعديل يتطلب صلاحية المشرف الرئيسي.',
   server_error:'تعذر تنفيذ الإجراء على الخادم.'};
  throw Error(messages[data.error]||'لم تكتمل العملية: '+(data.error||result.status));
 }
 return data;
}
function hubVisitorKey(){
 let id=localStorage.getItem('afaq_public_visitor_v6');
 if(!id){id=crypto.randomUUID();localStorage.setItem('afaq_public_visitor_v6',id)}
 return id;
}
async function hubLoadCatalog(){
 try{
  const result=await hubCall('public_catalog');hub.catalog=result.items||[];
  if(['home','visitor','library','fun','contests'].includes(state.page))render();
 }catch(e){hub.error=e.message}
}
async function hubVisit(){
 if(hub.visitPinged)return;hub.visitPinged=true;
 try{
  const result=await hubCall('visitor_ping',{visitor_id:hubVisitorKey()});
  hub.visitorCount=result.visitors;
  if(['home','visitor'].includes(state.page))render();
 }catch(e){hub.visitPinged=false;hub.error=e.message}
}
function hubItemIcon(row){return H_ICONS[row.icon]?row.icon:'book-open'}
function hubCard(row){
 const url=row.resource_url||'';
 const link=url?'<a href="'+hv(url)+'" '+(url.startsWith('https://')?'target="_blank" rel="noopener noreferrer"':'')+' class="hub-resource-link">فتح المحتوى</a>':'';
 return '<article class="hub-resource-card"><b>'+hv(row.title)+'</b>'+
 hubIcon(hubItemIcon(row),row.category==='contest'?'gold':'blue')+
 '<p>'+hv(row.description||'')+'</p>'+
 (row.body?'<details><summary>اقرأ المزيد</summary><p>'+hv(row.body)+'</p></details>':'')+link+'</article>';
}
function hubResourceGrid(categories){
 const items=hub.catalog.filter(x=>x.published&&(!categories||categories.includes(x.category)));
 if(!items.length)return '<p class="hub-empty">لا توجد موارد منشورة في هذا القسم حاليًا. يستطيع مشرف المنصة إضافة موارد جديدة.</p>';
 return '<div class="hub-resource-grid">'+items.map(hubCard).join('')+'</div>';
}
function hubVisitor(){
 return '<div class="container hub-page"><section class="hub-page-head"><span>بوابة الزوار</span><h1>أهلًا بك في آفاق الرياضيات</h1>'+
 '<p>استكشف موارد المنصة دون حساب، واقرأ عن المسابقات وطريقة المشاركة وجرب النموذج المجاني البسيط.</p>'+
 hubIcon('globe','cyan')+'</section>'+
 '<section class="hub-main"><div class="hub-heading"><h2>استكشف بوابات المنصة</h2></div>'+
 '<div class="hub-gate-grid">'+
 hubSectionCard('التعليم والتعلّم','graduation-cap','دروس وأنشطة عامة','learning','green')+
 hubSectionCard('المكتبة العامة','book-open','تاريخ وعلماء وكتب وامتحانات','library','blue')+
 hubSectionCard('المرح والتسلية','smile','ألغاز ورسوم ومقالات','fun','rose')+
 hubSectionCard('الألعاب والمسابقات','trophy','تعرف إلى نجوم آفاق وتحدي جنى','contests','gold')+
 hubSectionCard('الدعم والتواصل','smartphone','راسل المشرف وأرسل فكرة أو شكوى','support','cyan')+
 '</div></section>'+hubAbout()+
 hubCompetitionGuide()+
 '<section class="hub-main hub-trial-teaser"><h2>تجربة الزائر المجانية — نموذج مبسّط</h2>'+
 '<p>عشرة أسئلة سهلة للتعرّف إلى أسلوب اللعب، ومحاولة واحدة لهذا المتصفح فقط. لا تدخل هذه النتيجة في ترتيب الطلاب أو التأهل للجوائز.</p>'+
 '<button class="hub-primary" data-route="guest_trial">بدء التجربة المجانية أو متابعة محاولتي</button></section>'+
 '<div class="hub-counter"><span>المتصفحات الزائرة المسجلة</span><strong>'+hn(hub.visitorCount||0)+'</strong>'+
 '<small>إحصاء تقريبي حسب معرّف المتصفح، لا يجمع أسماء الزوار.</small></div></div>';
}
const HUB_PRIZES=[100,75,50,40,30,20,10,5,5,5];
function hubCompetitionGuide(){
 return '<section class="hub-main hub-guide"><div class="hub-heading"><span>دليل المسابقة الرسمية</span>'+
 '<h2>نجوم آفاق الرياضيات — كل ما تحتاج إلى معرفته</h2></div>'+
 '<div class="hub-guide-grid"><article><h3>لمن المسابقة؟</h3>'+
 '<p>لطلاب الصف السادس المشاركين في المنصة؛ يدخل الطالب بالحساب والرقم التسلسلي الخاص بشعبته ورمز الدخول المعتمد من المشرف.</p></article>'+
 '<article><h3>الوحدات والدرجات</h3><p>أربع وحدات، كل وحدة من ١٠٠ نقطة، والمجموع الكلي ٤٠٠. يحسب النظام أفضل نتيجة من محاولتين رسميتين لكل وحدة.</p></article>'+
 '<article><h3>شرط التأهل</h3><p>يجب إكمال جميع الوحدات الأربع وجمع ٣٥٠ نقطة على الأقل من ٤٠٠. التدريب وتجربة الزائر لا يدخلان في هذا المجموع.</p></article>'+
 '<article><h3>كيف أدخل؟</h3><p>اختر بوابة الطالب، ثم الصف السادس والشعبة والرقم المسلسل وكلمة المرور. انتقل إلى المسابقة الرسمية وابدأ الوحدة عند إتاحتها لك.</p></article></div>'+
 '<h3>الجوائز المعلنة للمراكز من الأول إلى العاشر (بالريال العُماني)</h3>'+
 '<div class="hub-prizes">'+HUB_PRIZES.map((v,i)=>'<span><strong>'+hn(i+1)+'</strong><b>'+hn(v)+' ر.ع</b></span>').join('')+'</div>'+
 '<p class="hub-note">المراكز والجوائز خاضعة لإجراءات الإشراف والتحقق من النتائج؛ ويُرجع إلى الإعلان المعتمد لأي تعديل.</p>'+
 '<div class="hub-inline-actions"><a class="hub-primary" href="competition.html">دخول نجوم آفاق الرسمية</a>'+
 '<button class="hub-secondary" data-route="guest_trial">تجربة الزائر (مرة واحدة)</button></div></section>';
}
function hubContests(){
 const contests=hub.catalog.filter(x=>x.published&&x.category==='contest');
 const games=hub.catalog.filter(x=>x.published&&['game','flash'].includes(x.category));
 return '<div class="container hub-page"><section class="hub-page-head"><span>بوابة الألعاب والمسابقات</span><h1>تحديات للجميع، وتعلّم ممتع</h1>'+
 '<p>المسابقات الرسمية والحسابات المجانية مستقلة عن تجربة الزوار، ويحدد المشرف ما يظهر في هذه البوابة.</p>'+
 hubIcon('gamepad-2','gold')+'</section><section class="hub-main"><h2>المسابقات المنشورة</h2>'+
 (contests.length?'<div class="hub-resource-grid">'+contests.map(hubCard).join('')+'</div>':'<p class="hub-empty">لا توجد مسابقات منشورة حاليًا.</p>')+
 '</section><section class="hub-main"><h2>تجربة الزائر</h2><p>نموذج بسيط من ١٠ أسئلة، ومحاولة واحدة مستقلة عن النتائج الرسمية.</p>'+
 '<button class="hub-primary" data-route="guest_trial">فتح تجربة الزائر</button></section>'+
 hubCompetitionGuide()+
 '<section class="hub-main"><h2>ألعاب وفلاشات أخرى</h2>'+hubResourceGrid(['game','flash'])+
 '<div class="hub-inline-actions"><button class="hub-secondary" data-route="games">عرض الألعاب التفاعلية</button>'+
 '<button class="hub-secondary" data-route="flashes">عرض الفلاشات</button></div></section></div>';
}
function hubLibrary(){
 const categories=[['all','جميع محتويات المكتبة'],['history','تاريخ الرياضيات'],['scholars','العلماء'],['daily_math','الرياضيات في الحياة'],['books','الكتب'],['exams','الاختبارات'],['question_bank','بنك الأسئلة'],['video','يوتيوب تعليمي'],['game','الألعاب'],['flash','الفلاشات']];
 let chosen=hub.libraryCat;
 const filter=['all','history','scholars','daily_math','books','exams','question_bank','video','game','flash'].includes(chosen)?chosen:'all';
 return '<div class="container hub-page"><section class="hub-page-head"><span>المكتبة العامة</span><h1>معرفة رياضية مفتوحة للجميع</h1><p>من تاريخ الأرقام والعلماء إلى الاختبارات والأسئلة والكتب والفيديوهات التعليمية والألعاب والمحاكاة.</p>'+
 hubIcon('book-open','blue')+'</section>'+
 '<div class="hub-tabs">'+categories.map(([c,t])=>'<button type="button" data-hub-library="'+c+'"'+(filter===c?' class="selected"':'')+'>'+t+'</button>').join('')+'</div>'+
 '<section class="hub-main"><h2>'+hv(categories.find(x=>x[0]===filter)?.[1]||'المكتبة')+'</h2>'+
 hubResourceGrid(filter==='all'?['history','scholars','daily_math','books','exams','question_bank','video','game','flash','learning']: [filter])+
 '</section><section class="hub-main"><h2>خيارات إضافية</h2>'+
 '<div class="hub-inline-actions"><a class="hub-secondary" href="exams.html">اختبارات قابلة للطباعة والتنزيل بصيغة Word</a>'+
 '<button class="hub-secondary" data-route="learning">الوحدات والدروس</button></div></section></div>';
}
function hubFun(){
 const cats=[['all','جميع مواد المرح'],['cartoon','الكاريكاتير'],['article','المقالات والألغاز'],['fun_book','كتب التسلية']];
 const value=hub.funCat;
 return '<div class="container hub-page"><section class="hub-page-head"><span>المرح والتسلية</span><h1>الرياضيات متعة وتفكير</h1>'+
 '<p>مواقف كاريكاتيرية، وألغاز وقصص ومقالات وكتب ترفيهية، يضيف المشرف محتواها المناسب للأعمار.</p>'+
 hubIcon('smile','rose')+'</section>'+
 '<div class="hub-tabs">'+cats.map(([v,t])=>'<button data-hub-fun="'+v+'"'+(value===v?' class="selected"':'')+'>'+t+'</button>').join('')+'</div>'+
 '<section class="hub-main">'+hubResourceGrid(value==='all'?['cartoon','article','fun_book']:[value])+'</section>'+
 '<section class="hub-main"><h2>تحدٍّ فكري قصير</h2><p>عدد زوجي أكبر من ٢٠ وأصغر من ٣٠، وهو من مضاعفات العدد ٤. ما العدد؟</p>'+
 '<details><summary>افتح الحل</summary><strong>٢٤</strong>؛ لأنه زوجي ومن مضاعفات ٤.</details></section></div>';
}


async function hubTrialLoad(){
 if(hub.trialBusy)return;hub.trialBusy=true;
 try{
  const d=await hubCall('guest_trial_status',{visitor_id:hubVisitorKey()});
  hub.trial=d.trial;hub.error='';
 }catch(e){hub.error=e.message}
 finally{hub.trialBusy=false;if(state.page==='guest_trial')render()}
}
async function hubTrialStart(){
 if(hub.trialBusy)return;hub.trialBusy=true;hub.error='';render();
 try{
  const d=await hubCall('guest_trial_start',{visitor_id:hubVisitorKey()});
  hub.trial=d.trial;hub.trialAnswers={};
 }catch(e){hub.error=e.message}
 finally{hub.trialBusy=false;render()}
}
async function hubTrialSubmit(){
 if(!hub.trial||hub.trial.completed_at||hub.trialBusy)return;
 const answers=hub.trial.questions.map((q,i)=>hub.trialAnswers[i]);
 if(answers.some(x=>!Number.isInteger(x))){window.alert('أجب عن جميع الأسئلة العشرة أولًا.');return}
 if(!window.confirm('هل تريد تسليم تجربة الزائر؟ لا يمكن تكرارها بعد التسليم.'))return;
 hub.trialBusy=true;render();
 try{
  const d=await hubCall('guest_trial_submit',{visitor_id:hubVisitorKey(),answers});
  hub.trial=d.trial;hub.error='';
 }catch(e){hub.error=e.message}
 finally{hub.trialBusy=false;render()}
}
function hubTrialPage(){
 const t=hub.trial,done=t?.completed_at;
 const completed=done?'<div class="hub-trial-result"><h2>أكملت تجربة نجوم آفاق!</h2>'+
 '<strong>'+hn(t.score)+' / ١٠</strong>'+
 '<p>هذه نتيجة ترفيهية للزائر ولا تؤثر في المحاولات الرسمية أو الجوائز أو ترتيب الطلاب. لا تتاح إعادة التجربة لهذا المتصفح.</p>'+
 '<button class="hub-secondary" data-route="contests">العودة إلى المسابقات</button></div>':'';
 const ready=t&&!done?'<form id="hubTrialForm"><p>اختر إجابة واحدة لكل سؤال. لا توجد درجة سالبة على الخطأ.</p>'+
 t.questions.map((q,i)=>'<fieldset class="hub-trial-q"><legend>'+hn(i+1)+'. '+hv(q.text)+'</legend>'+
 '<div>'+q.options.map((choice,j)=>'<label><input name="trial'+i+'" type="radio" value="'+j+'" data-hub-answer="'+i+'"'+(hub.trialAnswers[i]===j?' checked':'')+'><span>'+hv(choice)+'</span></label>').join('')+'</div></fieldset>').join('')+
 '<button class="hub-primary" type="submit"'+(hub.trialBusy?' disabled':'')+'>تسليم إجاباتي وإنهاء المحاولة</button></form>':'';
 const start=!t?'<div class="hub-trial-cta"><p>لا توجد محاولة مسجلة لهذا المتصفح. عند الضغط على البدء ستُحجز محاولتك المجانية الوحيدة؛ إذا أغلقت الصفحة قبل التسليم، يمكنك استكمالها لاحقًا على المتصفح نفسه.</p>'+
 '<button class="hub-primary" id="hubStartTrial"'+(hub.trialBusy?' disabled':'')+'>ابدأ المحاولة المجانية الوحيدة</button></div>':'';
 return '<div class="container hub-page"><section class="hub-page-head"><span>تجربة مجانية للزائر</span><h1>نموذج مبسط من نجوم آفاق</h1>'+
 '<p>١٠ أسئلة سهلة، ومحاولة واحدة لكل متصفح، مستقلة عن نتائج المسابقة الرسمية للصف السادس.</p>'+
 hubIcon('trophy','gold')+'</section>'+
 '<section class="hub-main"><h2>قبل البدء</h2><p>اقرأ الأسئلة واختر الإجابات المناسبة. تبدأ المحاولة عند الضغط على زر البدء، وتُحفظ على الخادم. لا تُجمع أسماء الطلاب في هذه التجربة.</p>'+
 '<p class="hub-note">قيد المحاولة مرتبط بمعرّف محفوظ في هذا المتصفح؛ تغيير الجهاز أو مسح بيانات المتصفح قد يتيح معرّفًا جديدًا، لذا لا يعد ذلك تحققًا من هوية الشخص.</p>'+
 (hub.error?'<p class="hub-error">'+hv(hub.error)+'</p>':'')+
 (hub.trialBusy?'<p>جارٍ تحديث المحاولة...</p>':'')+completed+ready+start+
 '</section><section class="hub-main"><button class="hub-secondary" data-route="visitor">دليل الزائر والمسابقات</button></section></div>';
}
function hubSupport(){
 const last=hub.supportTickets.slice(-8).reverse();
 return '<div class="container hub-page"><section class="hub-page-head"><span>الدعم والتواصل</span><h1>نستمع إليك ونقدّر مساهمتك</h1>'+
 '<p>إرسال اقتراح أو شكوى أو رسالة إلى مشرف آفاق الرياضيات، ثم متابعة الرد عبر رقم متابعة خاص.</p>'+
 hubIcon('smartphone','cyan')+'</section>'+
 '<div class="hub-support-grid"><section class="hub-main"><h2>إنشاء رسالة</h2>'+
 '<form id="hubSupportForm"><label>نوع الرسالة<select name="kind"><option value="suggestion">اقتراح لتطوير المنصة</option>'+
 '<option value="complaint">شكوى أو مشكلة</option><option value="support">تواصل مع مشرف المنصة</option></select></label>'+
 '<label>الاسم أو اسم مستعار<input name="sender" maxlength="100" minlength="2" required placeholder="الاسم الذي ترغب في ظهوره للمشرف"></label>'+
 '<label>البريد الإلكتروني (اختياري)<input name="contact_email" type="email" autocomplete="email" placeholder="للتواصل الخارجي عند الحاجة"></label>'+
 '<label>نص الرسالة<textarea name="message" rows="6" minlength="8" maxlength="2500" required placeholder="وضح اقتراحك أو المشكلة بالتفصيل"></textarea></label>'+
 '<label class="hub-consent"><input type="checkbox" required>أقر بأنني لا أشارك معلومات طالب خاصة أو كلمات مرور في رسالة عامة.</label>'+
 '<button class="hub-primary" type="submit">إرسال الرسالة إلى صندوق المشرف</button></form>'+
 (hub.supportTicketResult?'<div class="hub-ticket-result"><strong>تم تسجيل رسالتك.</strong><p>احتفظ بهذا الرمز السري لمتابعة الرد:</p>'+
 '<code>'+hv(hub.supportTicketResult)+'</code><button type="button" data-hub-copy-ticket>نسخ رمز المتابعة</button></div>':'')+
 '</section><section class="hub-main"><h2>متابعة رد المشرف</h2>'+
 '<form id="hubTicketCheckForm"><label>رمز الرسالة<input name="ticket" minlength="20" maxlength="28" placeholder="الرمز الذي ظهر عند الإرسال" required></label>'+
 '<button class="hub-secondary" type="submit">عرض حالة الطلب والرد</button></form><div id="hubTicketAnswer"></div>'+
 (last.length?'<h3>رسائلك المحفوظة على هذا المتصفح</h3>'+
 '<div class="hub-inline-actions">'+last.map(t=>'<button class="hub-mini" data-hub-check-ticket="'+hv(t)+'">'+hv(t.slice(0,6))+'…</button>').join('')+'</div>':'')+
 '<p class="hub-note">لا تُعرض الرسائل للعموم. رمز المتابعة خاص بصاحب الرسالة؛ احتفظ به ولا تشاركه علنًا.</p></section></div></div>';
}
async function hubSubmitSupport(form){
 const fields=Object.fromEntries(new FormData(form));
 try{
  const d=await hubCall('support_submit',{...fields,visitor_id:hubVisitorKey()});
  hub.supportTicketResult=d.ticket;
  hub.supportTickets=[...new Set([...hub.supportTickets,d.ticket])].slice(-15);
  localStorage.setItem('afaq_support_tickets_v6',JSON.stringify(hub.supportTickets));
  hub.error='';render();
 }catch(err){window.alert(err.message)}
}
async function hubCheckTicket(code){
 try{
  const d=await hubCall('support_check',{ticket:code});
  const area=document.getElementById('hubTicketAnswer');
  if(area)area.innerHTML='<div class="hub-ticket-result"><strong>'+(d.ticket.response?'تم الرد على رسالتك':'الرسالة قيد المراجعة')+'</strong>'+
   (d.ticket.response?'<p>'+hv(d.ticket.response)+'</p>':'<p>لم يصدر رد بعد. يمكنك العودة برمز المتابعة نفسه.</p>')+'</div>';
 }catch(err){window.alert(err.message)}
}
function hubParentPage(){
 const p=hub.parentProfile,s=p?.student||{},a=p?.assessment||null;
 const account=hub.parentToken&&p?'<section class="hub-main"><h2>مرحبًا بولي أمر '+hv(s.full_name||'الطالب')+'</h2>'+
 '<p>الشعبة: '+hv(s.class_name||'')+' • الرقم: '+hn(s.serial_no)+'</p>'+
 (a?'<div class="hub-parent-scores"><article><small>الأعمال الفصلية</small><strong>'+hn(a.coursework)+'/٦٠</strong></article>'+
 '<article><small>المجموع المتوقع</small><strong>'+hn(a.estimated_total)+'/١٠٠</strong></article>'+
 '<article><small>المجموع الحقيقي بعد النهائي</small><strong>'+(a.actual_total===null?'لم يُعتمد':hn(a.actual_total)+'/١٠٠')+'</strong></article>'+
 '<article><small>الرصيد التراكمي A+ / A−</small><strong>'+hn(a.a_plus)+' / '+hn(a.a_minus)+'</strong></article></div>':
 '<p class="hub-note">لم تُعتمد نتيجة هذا الطالب بعد. لا تظهر المسودات أو معلومات الطلاب الآخرين.</p>')+
 '<h3>ملاحظات ومتابعة الطالب المتاحة للأسرة</h3>'+
 ((p.notes||[]).length?'<div class="hub-notes">'+p.notes.map(n=>'<p>'+hv(n.category)+' — '+hv(n.note)+'</p>').join('')+'</div>':
 '<p>لا توجد ملاحظات مخصصة للمشاركة حاليًا.</p>')+
 '<h3>مراسلاتك مع المشرف</h3>'+
 ((p.messages||[]).length?'<div class="hub-notes">'+p.messages.map(n=>'<article><p>'+hv(n.message)+'</p>'+
 (n.response?'<p><b>رد المشرف:</b> '+hv(n.response)+'</p>':'<small>في انتظار الرد</small>')+'</article>').join('')+'</div>':'<p>لا توجد رسائل سابقة.</p>')+
 '<form id="hubParentMessage"><label>رسالة خاصة إلى مشرف المنصة<textarea name="message" rows="5" minlength="8" maxlength="2500" required></textarea></label>'+
 '<button class="hub-primary" type="submit">إرسال رسالة ومتابعة الرد من هنا</button></form>'+
 '<button class="hub-secondary" id="hubParentLogout">الخروج من حساب ولي الأمر</button></section>':'';
 const login=!p?'<section class="hub-main"><h2>الدخول الآمن لولي الأمر</h2>'+
 '<p>يُصدر المشرف الرئيسي رمزًا خاصًا بولي أمر كل طالب، ولا يُستخدم رمز الطالب نفسه. تظل النتائج الخاصة محمية.</p>'+
 '<form id="hubParentLogin"><label>شعبة الصف السادس<select name="class_name">'+
 ['السادس / ٤','السادس / ٥','السادس / ٦'].map(x=>'<option>'+x+'</option>').join('')+'</select></label>'+
 '<label>الرقم التسلسلي للطالب<input name="serial_no" type="number" min="1" max="60" required></label>'+
 '<label>رمز ولي الأمر المخصص (٦ أرقام)<input name="pin" type="password" inputmode="numeric" pattern="[0-9٠-٩]{6}" minlength="6" maxlength="6" autocomplete="off" required></label>'+
 '<button class="hub-primary" type="submit">الدخول للاطلاع على بيانات ابني / ابنتي</button></form>'+
 (hub.parentStatus?'<p class="hub-error">'+hv(hub.parentStatus)+'</p>':'')+
 '<p class="hub-note">للحصول على الرمز، تواصل مع مشرف المنصة عبر قنوات المدرسة الرسمية. يحظر مشاركة الرمز علنًا.</p></section>':'';
 return '<div class="container hub-page"><section class="hub-page-head"><span>بوابة أولياء الأمور</span><h1>الشراكة مع الأسرة أساس النجاح</h1>'+
 '<p>استكشف الموارد العامة كزائر، وسجّل الدخول برمز ولي الأمر للاطلاع على نتيجة الطالب المعتمدة ومتابعته والتواصل مع المشرف.</p>'+
 hubIcon('heart-handshake','rose')+'</section>'+
 '<div class="hub-inline-actions"><button class="hub-secondary" data-route="visitor">التصفح العام كزائر</button>'+
 '<button class="hub-secondary" data-route="library">المكتبة التعليمية</button></div>'+login+account+'</div>';
}
async function hubParentLogin(form){
 if(hub.parentBusy)return;hub.parentBusy=true;
 try{
  const fields=Object.fromEntries(new FormData(form));
  const result=await hubCall('parent_login',fields);
  hub.parentToken=result.token;
  sessionStorage.setItem('afaq_parent_access_v6',result.token);
  hub.parentStatus='';await hubLoadParent();
 }catch(err){hub.parentStatus=err.message;render()}
 finally{hub.parentBusy=false}
}
async function hubLoadParent(){
 if(!hub.parentToken)return;
 try{
  const result=await hubCall('parent_profile',{},hub.parentToken);
  hub.parentProfile=result;hub.parentStatus='';if(state.page==='parent')render();
 }catch(err){hub.parentToken='';sessionStorage.removeItem('afaq_parent_access_v6');hub.parentProfile=null;
  hub.parentStatus=err.message;if(state.page==='parent')render()}
}
async function hubParentMessage(form){
 try{
  const r=await hubCall('parent_message',Object.fromEntries(new FormData(form)),hub.parentToken);
  window.alert('تم إرسال الرسالة إلى مشرف المنصة ويمكن متابعة الرد من حساب ولي الأمر.');
  await hubLoadParent();
 }catch(err){window.alert(err.message)}
}
async function hubParentLogout(){
 try{if(hub.parentToken)await hubCall('parent_logout',{},hub.parentToken)}catch{}
 hub.parentToken='';hub.parentProfile=null;sessionStorage.removeItem('afaq_parent_access_v6');render();
}
