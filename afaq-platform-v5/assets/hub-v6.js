/* تصميم بوابات آفاق ماث — الزائر والمكتبة والمسابقات وولي الأمر والدعم والطباعة. */
'use strict';
const HUB_API='https://xcwuwflggiwkehzquugz.supabase.co/functions/v1/afaq-public-hub';
const hub={
 catalog:[], visitorCount:null,visitPinged:false,fetching:false,error:'',
 libraryCat:'all',funCat:'all',trial:null,trialAnswers:{},trialBusy:false,
 trialStarted:false,trialLoaded:false,supportTickets:[],supportTicketResult:null,
 parentToken:sessionStorage.getItem('afaq_parent_access_v6')||'',
 parentProfile:null,parentStatus:'',parentBusy:false,
 adminItems:[],adminLoaded:false,adminEdit:null,
 inbox:[],legacyInbox:[],inboxLoaded:false,
 stats:null,statsLoaded:false,loading:false,
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
const HUB_ART={globe:'guest','graduation-cap':'supervision',school:'faculty',
 'book-open':'student','heart-handshake':'parents',smile:'games',trophy:'competition',
 smartphone:'contact',lightbulb:'initiatives',puzzle:'minicontests'};
function hubArtPicture(art,color,label){
 const valid=['library','importance','horizons','environment','learning','competition',
 'games','minicontests','initiatives','stars','parents','faculty','suggestions','complaints','contact',
 'student','supervision','guest'];
 if(!valid.includes(art))return '';
 return '<div class="hub-visual hub-visual-'+color+' hub-illustration">'+
  '<svg viewBox="0 0 160 132" role="img" aria-label="رسم توضيحي: '+hv(label)+'">'+
  '<use href="assets/afaq-section-art.svg?v=20261112-brand3#art-'+art+'"></use></svg></div>';
}
function hubGate(title,icon,description,action,color='blue',art=null){
 const illustration=hubArtPicture(art||HUB_ART[icon]||'learning',color,title);
 return '<button class="hub-gate hub-gate-illustrated" type="button" '+action+'><strong>'+hv(title)+'</strong>'+
  (illustration||hubIcon(icon,color))+'<span>'+hv(description)+'</span><small>اضغط للدخول</small></button>';
}
function hubSectionCard(title,icon,desc,route,color){
 const art={learning:'learning',library:'library',fun:'games',contests:'competition',
  support:'contact',importance:'importance',environment:'environment'}[route]||HUB_ART[icon]||'learning';
 return hubGate(title,icon,desc,'data-route="'+route+'"',color,art);
}
const hubAudience=[
 ['زائر','تصفح المكتبة والتعلم والألعاب العامة، وتجربة سهلة واحدة لمسابقة النجوم.'],
 ['طالب','دروس وأنشطة ونتائج معتمدة ومسابقات رسمية بحساب الطالب.'],
 ['ولي أمر','متابعة نتائج الأبناء المعتمدة والتواصل الآمن برمز مخصص.'],
 ['معلم ومشرف','تحضير دروس وتقويم الطلاب ومبادرات ومصادر وكشوف وطباعة.']
];
function hubAbout(){
 return '<section class="hub-intro-panel"><h2>ما هي منصة آفاق ماث؟</h2><p>مساحة تعليمية عمانية لتعلّم الرياضيات من الصف الخامس إلى الثامن، وتوسّع المعرفة بتاريخ الرياضيات وعلمائها وتطبيقاتها، وتجمع الدروس والاختبارات والألعاب والمسابقات والأنشطة المساندة.</p>'+
 '<div class="hub-audience">'+hubAudience.map(([role,desc])=>'<article><b>'+role+'</b><p>'+desc+'</p></article>').join('')+'</div>'+
 '<p class="hub-note">تُتاح الموارد العامة دون تسجيل دخول، وتبقى بيانات الطلاب ونتائجهم محمية.</p>'+
 '</section>';
}
function hubHome(){
 const paths='<svg class="afaq-hero-lines" viewBox="0 0 1200 350" preserveAspectRatio="none" aria-hidden="true">'+
 '<path d="M-50 245 C180 135 245 335 452 205 S830 100 1250 205"/>'+
 '<path d="M-60 265 C190 145 305 370 500 225 S880 105 1250 230"/>'+
 '<path d="M-40 285 C180 180 335 400 565 245 S945 145 1260 250"/>'+
 '<path d="M40 95 Q265 -30 445 130 T855 90 T1245 125"/>'+
 '</svg>';
 const math='<div class="afaq-math-symbols" aria-hidden="true">'+
 '<span>π</span><span>½</span><span>∑</span><span>√</span><span>∠ 60°</span>'+
 '<span>¾</span><span>12 × 4</span><span>△</span><span>□</span><span>⅓</span><span>x ↦ 3x</span><span>∞</span>'+
 '<span>y = x + 2</span><span>▱</span><span>25%</span><span>6²</span></div>';
 return '<div class="container hub-home afaq-home-v7">'+
 '<section class="hub-banner afaq-animated-hero" aria-label="منصة آفاق ماث">'+paths+math+
 '<div class="afaq-hero-content"><span class="afaq-hero-eyebrow">منصة تعليم الرياضيات التفاعلية • سلطنة عُمان</span>'+
 '<h1><span>منصة آفاق ماث</span><small lang="en" dir="ltr">Afaq Math</small></h1>'+
 '<p>نتعلّم • نكتشف • نبدع — رياضيات كامبردج من المفهوم إلى التطبيق والاستدلال</p>'+
 '<button type="button" class="hub-primary" data-route="learning">ابدأ رحلتك في الرياضيات</button></div>'+
 '</section>'+
 hubAbout()+
 (typeof afaqHomeUpdates==="function"?afaqHomeUpdates():"")+
 /* Four category news ribbons are inserted between homepage sections by the layout layer. */
 ''+
 '<section class="hub-main afaq-home-access"><div class="hub-heading"><span>بوابات الدخول</span><h2>اختر طريقة الدخول</h2></div>'+
 '<div class="hub-gate-grid hub-gate-grid-4">'+
 hubGate('دخول الطالب','book-open','حساب الطالب والدروس والنتائج','data-hub-login="student"','green')+
 hubGate('الإدارة المدرسية','school','مدير المدرسة ومساعده','data-hub-login="director"','purple')+
 hubGate('التصفح كضيف','globe','استكشف المحتوى العام دون حساب','data-route="visitor"','cyan')+
 hubGate('دخول المشرفين','graduation-cap','المشرف الرئيسي والمساعد وتقنية المعلومات','data-hub-login="supervisor"','gold')+
 '</div></section>'+
 '<section class="hub-main afaq-home-sections"><div class="hub-heading"><span>أبواب المعرفة</span><h2>استكشف أقسام آفاق ماث</h2></div>'+
 '<div class="hub-gate-grid">'+
 hubSectionCard('التعليم والتعلّم','graduation-cap','الدروس والمشاغل والتدريبات','learning','green')+
 hubSectionCard('المكتبة العامة','book-open','تاريخ الرياضيات والمعرفة','library','blue')+
 hubSectionCard('المرح والتسلية','smile','ألغاز وتحديات رياضية','fun','rose')+
 hubSectionCard('الألعاب والمسابقات','trophy','نجوم آفاق والمنافسات','contests','gold')+
 hubSectionCard('الدعم والتواصل','smartphone','الاقتراحات والرسائل','support','cyan')+
 '</div></section>'+
 (typeof afaqHomeShowcase==="function"?afaqHomeShowcase():"")+
 '<div class="hub-counter"><span>🌐 عدّاد المتصفحات التراكمي</span><strong id="hubVisitorCount">'+
 (hub.visitorCount==null?'—':hn(hub.visitorCount))+'</strong><small>٦٬٥٠٠ رصيد افتتاحي + المتصفحات المسجلة</small></div></div>';
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
  const contestLink=document.querySelector('.stars-shortcut');
  if(contestLink)contestLink.hidden=!hub.catalog.some(x=>x.published&&x.category==='contest'&&x.resource_url==='competition.html');
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
 if(!items.length)return '<p class="hub-empty">لا توجد مواد معروضة حاليًا.</p>';
 return '<div class="hub-resource-grid">'+items.map(hubCard).join('')+'</div>';
}

function hubVisitor(){
 const contests=hub.catalog.filter(x=>x.published&&x.category==='contest'&&x.resource_url!=='competition.html');
 return '<div class="container hub-page"><section class="hub-page-head"><span>بوابة الزوار</span>'+
 '<h1>أهلًا بك في آفاق ماث</h1>'+
 '<p>تصفح المكتبة والدروس والمحتوى الثقافي، وتعرف إلى نظام المسابقة الرسمية، واستمتع بثلاث مسابقات مجانية منفصلة.</p>'+
 hubIcon('globe','cyan')+'</section>'+
 '<section class="hub-main"><div class="hub-heading"><h2>استكشف بوابات المنصة</h2></div>'+
 '<div class="hub-gate-grid">'+
 hubSectionCard('التعليم والتعلّم','graduation-cap','دروس وأنشطة عامة','learning','green')+
 hubSectionCard('المكتبة العامة','book-open','تاريخ وعلماء وكتب وامتحانات','library','blue')+
 hubSectionCard('المرح والتسلية','smile','ألغاز ورسوم ومقالات','fun','rose')+
 hubSectionCard('الألعاب والمسابقات','trophy','نجوم آفاق، تحدي جنى، والتحدي السريع','contests','gold')+
 hubSectionCard('الدعم والتواصل','smartphone','راسل المشرف وأرسل فكرة أو شكوى','support','cyan')+
 '</div></section>'+hubAbout()+
 '<section class="hub-main"><div class="hub-heading"><h2>المسابقات المجانية الثلاث للزائر</h2>'+
 '<p>نموذج نجوم آفاق الكامل له الشخصيات والمراحل الخمس والتوقيت والتصحيح أنفسها مع أسئلة أسهل قليلًا؛ بجانبه تحدي جنى والتحدي السريع.</p></div>'+
 (contests.length?'<div class="hub-resource-grid hub-free-contests">'+contests.map(hubCard).join('')+'</div>':
 '<p class="hub-empty">لم تُنشر مسابقات مجانية في الوقت الحالي.</p>')+
 '<div class="hub-inline-actions"><button class="hub-secondary" data-route="contests">عرض جميع تفاصيل المسابقات</button></div></section>'+
 hubCompetitionGuide()+
 '<div class="hub-counter"><span>عدّاد المتصفحات التراكمي</span><strong>'+hn(hub.visitorCount||0)+'</strong>'+
 '<small>يشمل رصيدًا افتتاحيًا قدره ٦٬٥٠٠، إضافة إلى المتصفحات المسجلة فعليًا.</small></div></div>';
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
 '<div class="hub-inline-actions">'+
 (hub.catalog.some(x=>x.published&&x.category==='contest'&&x.resource_url==='competition.html')?
  '<a class="hub-primary" href="competition.html">دخول نجوم آفاق الرسمية</a>':
  '<p>الدخول إلى المسابقة الرسمية غير منشور حاليًا في البوابة.</p>')+
 '<button class="hub-secondary" data-route="guest_trial">تجربة الزائر (مرة واحدة)</button></div></section>';
}

function hubContests(){
 const all=hub.catalog.filter(x=>x.published&&x.category==='contest');
 const free=all.filter(x=>x.resource_url!=='competition.html');
 const official=all.find(x=>x.resource_url==='competition.html');
 return '<div class="container hub-page"><section class="hub-page-head">'+
 '<span>بوابة الألعاب والمسابقات</span><h1>ثلاث مسابقات مجانية في مكان واحد</h1>'+
 '<p>اختر بين نموذج «نجوم آفاق» الكامل بمراحله الخمس الأصلية، وتحدي جنى وأصدقائها، والتحدي السريع ذي الأسئلة العشرة. هذه المسابقات الثلاث مستقلة عن محاولات الطلاب الرسمية.</p>'+
 hubIcon('gamepad-2','gold')+'</section>'+
 '<section class="hub-main"><div class="hub-heading"><span>تحديات الزوار</span><h2>اختر مسابقتك المجانية</h2>'+
 '<p>لنجوم آفاق وتجربة جنى حساب مجاني باسم مستعار ورمز دخول، وللتحدي السريع محاولة واحدة دون حساب.</p></div>'+
 (free.length?'<div class="hub-resource-grid hub-free-contests">'+free.map(hubCard).join('')+'</div>':
 '<p class="hub-empty">لا توجد مسابقات مجانية منشورة حاليًا؛ يتحكم المشرف في إتاحتها.</p>')+
 '</section>'+
 '<section class="hub-main"><h2>الفرق بين تجربة نجوم آفاق والمسابقة الرسمية</h2>'+
 '<p>التجربة الكاملة للزائر تطابق نظام المراحل الخمس الأصلي (٣٨ سؤالًا ودرجة من ١٠٠)، بأسئلة أبسط قليلًا، ومحاولة واحدة بحساب مجاني. أما المسابقة الرسمية فمخصصة للطلاب المسجلين، وتشمل أربع وحدات، ومحاولتين لكل وحدة، والتأهل بعد إكمالها وتحقيق ٣٥٠ من ٤٠٠.</p>'+
 (official?'<a class="hub-secondary" href="competition.html">الدخول إلى المسابقة الرسمية للطلاب المسجلين</a>':
 '<p class="hub-note">الدخول إلى المسابقة الرسمية غير منشور حاليًا من المشرف.</p>')+
 '</section>'+
 hubCompetitionGuide()+
 '<section class="hub-main"><h2>ألعاب وفلاشات رياضية أخرى</h2>'+
 hubResourceGrid(['game','flash'])+
 '<div class="hub-inline-actions"><button class="hub-secondary" data-route="games">الألعاب التفاعلية</button>'+
 '<button class="hub-secondary" data-route="flashes">الفلاشات</button></div></section></div>';
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
 '</section><section class="hub-main"><h2>بنك الأسئلة حسب المرحلة التعليمية</h2>'+
 '<div class="hub-audience">'+
 '<article><b>الصفوف ١–٤</b><p>مساحة لاستقبال التدريبات التأسيسية الملائمة للصفوف الأولى. لم تُنشر ملفات رسمية في هذه المجموعة بعد.</p></article>'+
 '<article><b>الصفوف ٥–٨</b><p>نماذج وتمارين تدريبية متاحة من بوابة الاختبارات الحالية.</p></article>'+
 '<article><b>الصفوف ٩–١٢</b><p>تُضاف مواد هذه الصفوف بعد مراجعة توافقها مع المناهج المعتمدة.</p></article>'+
 '</div>'+
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
 '<section class="hub-main hub-cartoon"><h2>موقف رياضي مصوّر من آفاق</h2>'+
 '<figure class="hub-original-comic" role="img" aria-label="كاريكاتير تعليمي لعددين يتحدثان عن الجمع">'+
 '<svg viewBox="0 0 520 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+
 '<rect width="520" height="170" rx="22" fill="#f4faff"/>'+
 '<circle cx="104" cy="90" r="49" fill="#fff0c9" stroke="#c4a159" stroke-width="3"/>'+
 '<circle cx="378" cy="90" r="49" fill="#e0f5eb" stroke="#6cbfa0" stroke-width="3"/>'+
 '<text x="104" y="105" text-anchor="middle" font-family="Tahoma" font-size="52" fill="#9b6b2a">٥</text>'+
 '<text x="378" y="105" text-anchor="middle" font-family="Tahoma" font-size="52" fill="#147b62">٥</text>'+
 '<rect x="170" y="24" width="140" height="74" rx="15" fill="white" stroke="#bed8ea" stroke-width="2"/>'+
 '<text x="240" y="54" text-anchor="middle" font-family="Tahoma" font-size="15" fill="#1c5179">لو اجتمعنا،</text>'+
 '<text x="240" y="77" text-anchor="middle" font-family="Tahoma" font-size="15" fill="#1c5179">فكم نصبح؟</text>'+
 '<text x="240" y="144" text-anchor="middle" font-family="Tahoma" font-weight="bold" font-size="23" fill="#9a6c30">٥ + ٥ = ١٠</text>'+
 '</svg><figcaption>رسم تعليمي أصلي لتوظيف العمليات الحسابية في قصص قصيرة.</figcaption></figure></section>'+
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
 '<p>إرسال اقتراح أو شكوى أو رسالة إلى مشرف آفاق ماث، ثم متابعة الرد عبر رقم متابعة خاص.</p>'+
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


const HUB_STAFF_BLOCKS=[
 ['المعلم والتخطيط',[
  ['التحضير اليومي','notebook-pen','إعداد الدروس والأهداف والأنشطة والاستراتيجيات','hub-staff="lessons"','blue'],
  ['أهداف إجادة والمبادرات','lightbulb','الأهداف والخطط ومؤشرات الأداء','hub-staff="goals"','gold'],
  ['الخطة الدراسية','book-open','التخطيط السنوي والفصلي للمنهج','hub-staff="term"','green'],
  ['التطبيقات والبرامج','calculator','GeoGebra وPolypad وTeams وغيرها','data-tab="hub_apps"','purple']
 ]],
 ['الطلاب والتقويم',[
  ['تقويم الطلبة','list-checks','الدرجات والشفوي والأنشطة وA+ وA−','data-tab="students"','green'],
  ['كشوف النتائج والشهادات','file-text','مقارنة المتوقع والحقيقي وطباعة الشهادات','data-tab="class_results"','blue'],
  ['حسابات أولياء الأمور','heart-handshake','إصدار رمز سري خاص للأسرة','data-tab="hub_parent_codes"','rose'],
  ['مركز الطباعة والتصدير','printer','طباعة A4 أفقي أو عمودي، PDF وWord','data-tab="hub_print"','gold']
 ]],
 ['الموارد والمحتوى',[
  ['إدارة المكتبة العامة','book-open','إضافة وحذف ونشر مواد المكتبة','data-tab="hub_catalog"','purple'],
  ['إدارة الألعاب والمسابقات','trophy','إضافة أو إخفاء مسابقات المنصة','data-tab="hub_catalog_contests"','gold'],
  ['بنك الأسئلة والاختبارات','file-text','نماذج سابقة وتدريبية','hub-staff="exams"','blue'],
  ['الموارد التعليمية','video','دروس وفيديوهات وتطبيقات وفلاشات','data-tab="hub_apps"','green']
 ]],
 ['التواصل والدعم',[
  ['إدارة المدرسة','school','التواصل مع المدير ومساعده','data-tab="staff_contacts"','blue'],
  ['المديرية التعليمية','globe','روابط خدمات المراجعين بالمديرية','data-tab="staff_contacts"','cyan'],
  ['وزارة التربية والتعليم','school','التواصل والخدمات الوزارية','data-tab="staff_contacts"','gold'],
  ['الجهات الأخرى ودليل الهاتف','smartphone','تسجيل جهات جديدة وأرقامها','data-tab="staff_contacts"','rose'],
  ['صندوق الاقتراحات والشكاوى','message-circle','قراءة الرسائل والرد على أصحابها','data-tab="hub_inbox"','purple']
 ]]
];
function hubStaffNav(){
 const routes=[
  ['overview','الرئيسية'],['staff_hub','التحضير'],['students','تقويم الطلبة'],
  ['hub_apps','التطبيقات والبرامج'],['class_results','كشوف الشعب'],
  ['hub_catalog','إدارة المحتوى'],['staff_contacts','التواصل المؤسسي'],
  ['hub_inbox','الرسائل والدعم'],['hub_parent_codes','أولياء الأمور'],
  ['hub_print','مركز الطباعة']
 ];
 return '<div class="hub-staff-nav">'+routes.map(([id,label])=>'<button class="'+(auth.section===id?'selected':'')+'" data-tab="'+id+'">'+label+'</button>').join('')+'</div>';
}
function hubStaffDashboard(){
 const role=auth.user?.role;const admin=role==='supervisor';
 const blocks=HUB_STAFF_BLOCKS.map(([title,items])=>{
  const entries=items.filter(([label,icon,desc,attribute])=>admin||!['data-tab="hub_catalog"','data-tab="hub_catalog_contests"','data-tab="hub_parent_codes"'].includes(attribute));
  return '<section class="hub-staff-group"><div class="hub-heading"><h2>'+title+'</h2></div>'+
  '<div class="hub-gate-grid">'+entries.map(([name,icon,desc,attr,color])=>hubGate(name,icon,desc,attr.startsWith('data-')?attr:'data-'+attr,color)).join('')+'</div></section>';
 }).join('');
 const overview=typeof staffOverview==='function'?staffOverview():'';
 return '<div class="container hub-staff-home">'+
 (typeof ssBanner==='function'?ssBanner('لوحة '+(admin?'مشرف المنصة':'المشرف المساعد'),
 'دليل منظم من التخطيط العام إلى التقييم والتواصل والطباعة مع الصلاحيات المحفوظة'):
 '<div class="dashboard-banner"><h2>لوحة أعمال المعلم</h2></div>')+
 hubStaffNav()+
 '<section class="hub-main hub-staff-stats"><h2>إحصاءات البوابة</h2>'+
 (hub.stats?'<div class="hub-stats-grid">'+
 [['عدّاد الزيارات التراكمي (مع الرصيد الافتتاحي)',hub.stats.visitors],['تجارب الزوار المكتملة',hub.stats.trial_finished],
 ['حسابات تحدي جنى',hub.stats.jana_accounts],['نتائج تحدي جنى',hub.stats.jana_scores],
 ['رسائل بانتظار الرد',hub.stats.unanswered]].map(([k,v])=>'<article><b>'+hn(v)+'</b><small>'+k+'</small></article>').join('')+
 '</div>':'<p>تُحمّل إحصاءات الزيارات والمسابقات والرسائل عند فتح لوحة المشرف.</p>')+
 '<button class="hub-secondary" id="hubStatsReload">تحديث الإحصاءات</button></section>'+blocks+
 '<details class="hub-staff-old"><summary>الملخص الأصلي والبيانات السابقة للمنصة</summary>'+overview+'</details></div>';
}
async function hubLoadStaffStats(){
 if(!canEdit())return;
 hub.statsLoaded=true;
 try{const d=await hubCall('staff_stats',{},auth.token);hub.stats=d.stats;if(state.page==='dashboard'&&auth.section==='overview')render()}
 catch(err){hub.error=err.message}
}
async function hubLoadAdminCatalog(){
 if(!isAdmin())return;
 try{const d=await hubCall('catalog_admin',{},auth.token);hub.adminItems=d.items||[];hub.adminLoaded=true;
  if(state.page==='dashboard'&&['hub_catalog','hub_catalog_contests'].includes(auth.section))render()}
 catch(err){hub.error=err.message}
}
async function hubLoadInbox(){
 if(!canEdit())return;
 try{const d=await hubCall('support_inbox',{},auth.token);hub.inbox=d.tickets||[];hub.legacyInbox=d.legacy||[];hub.inboxLoaded=true;
  if(state.page==='dashboard'&&auth.section==='hub_inbox')render()}
 catch(err){hub.error=err.message}
}
function hubAdminCatalog(){
 const type=auth.section==='hub_catalog_contests'?'contest':null;
 const items=(hub.adminLoaded?hub.adminItems:hub.catalog).filter(x=>!type||x.category===type);
 const r=hub.adminEdit&&(!type||hub.adminEdit.category===type)?hub.adminEdit:null;
 const fields=['contest','history','scholars','daily_math','books','exams','question_bank','video','game','flash','cartoon','article','fun_book','learning','other'];
 return '<div class="container hub-admin-page">'+
 (typeof ssBanner==='function'?ssBanner('إدارة المكتبة والمسابقات','النشر والإخفاء والإضافة والحذف من حساب المشرف الرئيسي'):'')+
 hubStaffNav()+
 '<section class="hub-main"><h2>إضافة محتوى أو مسابقة</h2>'+
 '<p>تتحكم حالة «منشور» في ظهوره للزوار. يُسمح بإضافة رابط لعبة أو مصدر من موقع موثوق؛ لا تُحذف بيانات الطلاب أو نتائجهم عند إخفاء مسابقة من القائمة.</p>'+
 '<form id="hubCatalogForm" class="hub-admin-form"><div class="hub-form-grid">'+
 '<label>نوع المادة<select name="category">'+fields.map(cat=>'<option value="'+cat+'"'+((r?.category||type||'contest')===cat?' selected':'')+'>'+hv(H_CATEGORIES[cat])+'</option>').join('')+'</select></label>'+
 '<label>العنوان<input name="title" minlength="2" maxlength="180" required value="'+hv(r?.title||'')+'"></label>'+
 '<label>رمز الصورة / الأيقونة<select name="icon">'+
 ['trophy','gamepad-2','landmark','graduation-cap','book-open','ruler','lightbulb','file-text','list-checks','video','joystick','sparkles','smile','notebook-pen','puzzle','calculator','smartphone','globe','music','palette','brain','shapes'].map(v=>'<option value="'+v+'"'+((r?.icon||'book-open')===v?' selected':'')+'>'+v+'</option>').join('')+'</select></label>'+
 '<label>الصف المستهدف (اختياري)<select name="grade"><option value="">جميع الصفوف</option>'+
 Array.from({length:12},(_,i)=>i+1).map(n=>'<option value="'+n+'"'+(Number(r?.grade)===n?' selected':'')+'>'+hn(n)+'</option>').join('')+'</select></label>'+
 '<label>ترتيب العرض<input name="sort_order" type="number" value="'+(r?.sort_order??100)+'"></label>'+
 '<label>رابط المادة أو المسابقة<input name="resource_url" placeholder="https://... أو competition.html" value="'+hv(r?.resource_url||'')+'"></label></div>'+
 '<label>وصف مختصر<textarea name="description" rows="3" maxlength="500">'+hv(r?.description||'')+'</textarea></label>'+
 '<label>نص معلوماتي للمكتبة<textarea name="body" rows="5" maxlength="4500">'+hv(r?.body||'')+'</textarea></label>'+
 '<div class="hub-inline-actions"><label class="hub-check"><input type="checkbox" name="published"'+((r?r.published:true)?' checked':'')+'> منشور للزوار</label>'+
 '<label class="hub-check"><input type="checkbox" name="featured"'+(r?.featured?' checked':'')+'> محتوى مميز</label></div>'+
 '<button class="hub-primary" type="submit">'+(r?'حفظ تعديلات المحتوى':'إضافة محتوى جديد')+'</button>'+
 (r?'<button type="button" class="hub-secondary" id="hubCancelCatalogEdit">إلغاء التحرير</button>':'')+
 '</form></section><section class="hub-main"><h2>العناصر المدرجة ('+hn(items.length)+')</h2>'+
 '<div class="hub-admin-item-list">'+items.map(item=>'<article><div class="hub-admin-item-head"><b>'+hv(item.title)+'</b>'+
 '<small>'+(item.published?'منشور':'مخفي')+' — '+hv(H_CATEGORIES[item.category]||item.category)+'</small></div>'+
 '<p>'+hv(item.description||'')+'</p><div class="hub-inline-actions">'+
 '<button class="hub-secondary" data-hub-edit-item="'+item.id+'">تحرير</button>'+
 '<button class="hub-secondary" data-hub-toggle-item="'+item.id+'">'+(item.published?'إخفاء عن الزوار':'إظهار للزوار')+'</button>'+
 '<button class="hub-danger" data-hub-delete-item="'+item.id+'">حذف العنصر</button></div></article>').join('')+'</div></section></div>';
}
async function hubSaveCatalog(form){
 const f=new FormData(form),data=Object.fromEntries(f.entries()),r=hub.adminEdit;
 const payload={...data,id:r?.id,grade:data.grade===''?null:Number(data.grade),
  sort_order:Number(data.sort_order||100),published:f.has('published'),featured:f.has('featured')};
 try{await hubCall('catalog_save',payload,auth.token);hub.adminEdit=null;await hubLoadAdminCatalog();await hubLoadCatalog();
  auth.message='تم حفظ العنصر وتحديث حالة نشره.';render()}
 catch(err){window.alert(err.message)}
}
async function hubToggleCatalog(id){
 const r=hub.adminItems.find(x=>String(x.id)===String(id));if(!r)return;
 try{await hubCall('catalog_toggle',{id:r.id,published:!r.published},auth.token);await hubLoadAdminCatalog();await hubLoadCatalog()}
 catch(err){window.alert(err.message)}
}
async function hubDeleteCatalog(id){
 const r=hub.adminItems.find(x=>String(x.id)===String(id));if(!r)return;
 if(!window.confirm('حذف «'+r.title+'» من دليل المحتوى نهائيًا؟ لا يحذف هذا الإجراء ملفات اللعبة أو نتائج الطلاب.'))return;
 try{await hubCall('catalog_archive',{id:r.id},auth.token);hub.adminEdit=null;await hubLoadAdminCatalog();await hubLoadCatalog()}
 catch(err){window.alert(err.message)}
}
function hubInbox(){
 const rows=hub.inbox||[];
 return '<div class="container hub-admin-page">'+
 (typeof ssBanner==='function'?ssBanner('الدعم والاقتراحات والشكاوى','صندوق رسائل خاص مع إمكانية كتابة الرد ومتابعته بواسطة صاحب الرسالة'):'')+
 hubStaffNav()+
 '<section class="hub-main"><h2>صندوق الرسائل ('+hn(rows.length)+')</h2>'+
 '<button class="hub-secondary" id="hubInboxReload">تحديث الصندوق</button>'+
 (!rows.length?'<p class="hub-empty">لا توجد رسائل زوار أو أولياء أمور جديدة.</p>':'')+
 '<div class="hub-inbox-list">'+rows.map(row=>'<article class="hub-inbox-ticket"><div class="hub-admin-item-head"><b>'+hv(row.sender)+' — '+hv(row.kind)+'</b>'+
 '<small>'+hv(new Date(row.created_at).toLocaleDateString('ar-OM'))+' • '+(row.answered_at?'تم الرد':'بانتظار الرد')+'</small></div>'+
 '<p>'+hv(row.message)+'</p>'+
 (row.contact_email?'<p><b>بريد المرسل:</b> '+hv(row.contact_email)+'</p>':'')+
 '<form class="hubReplyForm" data-hub-ticket="'+row.id+'"><label>الرد الذي سيظهر لصاحب رمز المتابعة<textarea name="response" rows="3" minlength="3" maxlength="2500" required>'+
 hv(row.response||'')+'</textarea></label><button class="hub-primary" type="submit">'+(row.response?'تحديث الرد':'إرسال الرد إلى صندوق الرسالة')+'</button></form></article>').join('')+'</div></section>'+
 '<section class="hub-main"><h2>المراسلات القديمة في المنصة</h2><p>يمكن قراءة الرسائل السابقة هنا، لكنها لم تكن مزودة برمز متابعة؛ لذلك لا يُفترض أن الرد عليها يصل لصاحبها تلقائيًا.</p>'+
 (hub.legacyInbox.length?'<div class="hub-inbox-list">'+hub.legacyInbox.map(m=>'<article><b>'+hv(m.sender)+'</b><p>'+hv(m.message)+'</p></article>').join('')+'</div>':'<p>لا توجد مراسلات قديمة.</p>')+
 '</section></div>';
}
function hubParentCodes(){
 const cls=hub.selectedClass;
 const nums=Array.isArray(auth.students)?auth.students.filter(x=>x.class_name===cls).sort((a,b)=>a.serial_no-b.serial_no):[];
 return '<div class="container hub-admin-page">'+
 (typeof ssBanner==='function'?ssBanner('رموز دخول أولياء الأمور','رمز مستقل لكل طالب، وتُحفظ الرموز مشفرة ولا تظهر إلا عند الإصدار'):'')+
 hubStaffNav()+
 '<section class="hub-main"><h2>إصدار أو إيقاف رمز ولي الأمر</h2><p>اختر الشعبة والرقم التسلسلي، ثم أصدر رمزًا من ٦ أرقام وأبلغه لولي الأمر عبر وسيلة رسمية خاصة.</p>'+
 '<form id="hubParentCodeForm" class="hub-admin-form"><div class="hub-form-grid">'+
 '<label>الشعبة<select name="class_name" id="hubParentClass">'+
 ['السادس / ٤','السادس / ٥','السادس / ٦'].map(x=>'<option'+(cls===x?' selected':'')+'>'+x+'</option>').join('')+'</select></label>'+
 '<label>الطالب ورقمه التسلسلي<select name="serial_no">'+
 nums.map(x=>'<option value="'+x.serial_no+'"'+(hub.selectedSerial===x.serial_no?' selected':'')+'>'+
 hn(x.serial_no)+' — '+hv(x.full_name||x.display_name||'')+'</option>').join('')+'</select></label></div>'+
 '<div class="hub-inline-actions"><button class="hub-primary" name="task" value="create" type="submit">إصدار رمز جديد (يلغي القديم)</button>'+
 '<button class="hub-secondary" name="task" value="status" type="submit">التحقق من حالة الرمز</button>'+
 '<button class="hub-danger" name="task" value="disable" type="submit">إيقاف رمز ولي الأمر</button></div></form>'+
 (hub.parentIssued?'<div class="hub-ticket-result"><p>الرمز الجديد يظهر مرة واحدة:</p><strong class="hub-secret-number">'+hv(hub.parentIssued)+'</strong>'+
 '<button class="hub-secondary" id="hubCopyParentCode">نسخ الرمز لتسليمه بصورة خاصة</button></div>':'')+
 (hub.parentsStatus?'<p class="hub-note">'+hv(hub.parentsStatus)+'</p>':'')+
 '</section></div>';
}
async function hubManageParentCode(form,button){
 const values=Object.fromEntries(new FormData(form));
 const task=button?.value||'status';
 if(task==='disable'&&!window.confirm('هل تريد إيقاف رمز ولي الأمر وإلغاء جميع جلساته؟'))return;
 try{
  const action=task==='create'?'parent_code_create':task==='disable'?'parent_code_disable':'parent_code_status';
  const d=await hubCall(action,values,auth.token);
  hub.parentIssued=d.code||null;
  hub.parentsStatus=task==='status'?(d.configured?'الرمز مُفعّل. آخر تعديل: '+(d.updated_at||''):'لم يصدر رمز نشط لهذا الطالب.'):
    task==='disable'?'أُوقف الرمز وأُلغيت الجلسات السابقة.':'صدر رمز جديد، وجرى إلغاء الجلسات والرموز القديمة.';
  render();
 }catch(err){window.alert(err.message)}
}
function hubApps(){
 const picks=['GeoGebra','Polypad','Microsoft Teams','Microsoft Sway','Canva','Google Forms','Wordwall','Kahoot','PowerPoint'];
 const urls=['https://www.geogebra.org/','https://polypad.amplify.com/','https://teams.microsoft.com/',
  'https://sway.cloud.microsoft/','https://www.canva.com/','https://forms.google.com/',
  'https://wordwall.net/','https://kahoot.com/','https://www.microsoft.com/microsoft-365/powerpoint'];
 return '<div class="container hub-admin-page">'+
 (typeof ssBanner==='function'?ssBanner('التطبيقات والبرامج','وسائل رقمية تساعد المعلم في الشرح والتقويم والتوثيق'):'')+
 hubStaffNav()+'<section class="hub-main"><h2>أدوات المعلم الرقمية</h2><div class="hub-resource-grid">'+
 picks.map((p,i)=>'<article class="hub-resource-card"><b>'+hv(p)+'</b>'+
 hubIcon(i<2?'calculator':i<5?'video':'notebook-pen',i%2?'green':'blue')+
 '<p>استخدم الأداة بحسب الهدف التعليمي وطبيعة النشاط.</p><a class="hub-resource-link" href="'+urls[i]+'" target="_blank" rel="noopener noreferrer">فتح البرنامج</a></article>').join('')+
 '</div><div class="hub-inline-actions"><button class="hub-secondary" data-hub-work="resources">إضافة رابط في دليل أعمال المعلم</button>'+
 '<button class="hub-secondary" data-tab="hub_catalog">إضافة مصدر إلى المكتبة العامة</button></div></section></div>';
}
function hubPrintableList(){
 const current=ssState?.records||[],sources=[
 ['intro','تعريف المنصة وبوابات الدخول','صفحة عامة من المنصة'],
 ['library','محتويات المكتبة المنشورة','المكتبة العامة'],
 ['contest_guide','شرح مسابقة النجوم والجوائز','دليل زوار المسابقة'],
 ['class','كشف درجات الشعبة الحالية','يحتاج تحميل الشعبة أولًا'],
 ['student_pred','شهادة الطالب المتوقعة (إن كانت معتمدة)','حساب المشرف'],
 ['student_final','شهادة الطالب الحقيقية (إن كانت معتمدة)','حساب المشرف']
 ];
 for(const r of current)sources.push(['record:'+r.id,r.title,'سجل أعمال المعلم']);
 for(const row of hub.adminItems.filter(x=>x.published))sources.push(['item:'+row.id,row.title,'مورد من المكتبة العامة']);
 return sources;
}
function hubPrintCenter(){
 const opts=hubPrintableList(),selected=hub.printChosen;
 return '<div class="container hub-admin-page">'+
 (typeof ssBanner==='function'?ssBanner('مركز الطباعة والتصدير','اجمع التقارير والمصادر من المنصة واطبعها أفقيًا أو عموديًا'):'')+
 hubStaffNav()+
 '<section class="hub-main"><h2>اختيار محتوى للطباعة</h2>'+
 '<p>اختر المصدر أولًا ثم اختر نوع الورق؛ يطبع PDF من نافذة المتصفح، ويُنشأ ملف Word قابل للتحرير للمستندات النصية. ملفات PDF الخارجية تُفتح من مصدرها ولا تُحوّل إلى Word تلقائيًا.</p>'+
 '<div class="hub-form-grid"><label>المستند<select id="hubPrintSource">'+opts.map(([key,label,desc])=>'<option value="'+hv(key)+'"'+(key===selected?' selected':'')+'>'+hv(label)+' — '+hv(desc)+'</option>').join('')+'</select></label>'+
 '<label>اتجاه الورق<select id="hubPrintOrientation"><option value="portrait"'+(hub.printOrientation==='portrait'?' selected':'')+'>A4 عمودي</option>'+
 '<option value="landscape"'+(hub.printOrientation==='landscape'?' selected':'')+'>A4 أفقي</option></select></label></div>'+
 '<div class="hub-inline-actions"><button class="hub-primary" id="hubPrintPDF">طباعة / حفظ PDF</button>'+
 '<button class="hub-secondary" id="hubPrintWord">تصدير Word</button>'+
 '<button class="hub-secondary" id="hubPrintPreview">معاينة المحتوى</button>'+
 '<button class="hub-secondary" id="hubPrintReload">تحديث قائمة المستندات</button></div>'+
 '<div id="hubPrintPreviewArea"></div></section></div>';
}
function hubPrintHtml(){
 const src=hub.printChosen;
 if(src.startsWith('record:')){
  const r=ssState.records.find(x=>String(x.id)===src.slice(7));
  return r&&typeof ssPrintableRecord==='function'?ssPrintableRecord(r):'<p>هذا السجل غير محمّل حاليًا.</p>';
 }
 if(src==='student_pred'||src==='student_final'){
  const p=auth.selectedProfile;return p&&typeof gbCertificate==='function'?
   gbCertificate(p,src==='student_pred'?'prediction':'final')||'<p>لا توجد شهادة معتمدة.</p>':
   '<p>حدد طالبًا من تبويب تقويم الطلبة وافتح نتيجته أولًا.</p>';
 }
 if(src==='class'){
  if(!auth.gbClassReport)return '<p>اختر شعبة وحمّل الكشف من تبويب كشوف الشعب أولًا.</p>';
  return hub.printOrientation==='portrait'&&typeof ssClassPortraitLayout==='function'?
   ssClassPortraitLayout(auth.gbClassReport):gbClassReportMarkup(auth.gbClassReport);
 }
 if(src.startsWith('item:')){
  const item=hub.adminItems.find(x=>String(x.id)===src.slice(5));if(!item)return '<p>المادة غير موجودة.</p>';
  return '<h2>'+hv(item.title)+'</h2><p>'+hv(item.description||'')+'</p><p>'+hv(item.body||'')+'</p>'+
   (item.resource_url?'<p>رابط المصدر: '+hv(item.resource_url)+'</p>':'');
 }
 if(src==='library')return '<h2>محتويات المكتبة العامة</h2>'+
 hub.catalog.filter(x=>x.published).map(x=>'<h3>'+hv(x.title)+'</h3><p>'+hv(x.description||'')+'</p>').join('');
 if(src==='contest_guide')return '<h2>دليل مسابقة النجوم</h2><p>٤ وحدات × ١٠٠ = ٤٠٠، محاولتان رسميتان لكل وحدة، التأهل بإكمال الوحدات و٣٥٠ نقطة على الأقل.</p>'+
 '<p>جوائز المراكز: '+HUB_PRIZES.map((x,i)=>(i+1)+' ـ '+x+' ر.ع').join(' | ')+'</p>';
 return '<h2>آفاق ماث — التعريف بالمنصة</h2><p>بوابة للمعلمين والطلاب وأولياء الأمور والزوار.</p><p>أقسام: التعليم والتعلم؛ المكتبة العامة؛ المرح والتسلية؛ الألعاب والمسابقات؛ الدعم والتواصل.</p>';
}
function hubPaper(){
 return '<article class="hub-printed-document" dir="rtl"><header><p>سلطنة عُمان • مدرسة الحسين بن علي للتعليم الأساسي</p>'+
 '<h1>منصة آفاق ماث</h1></header><main>'+hubPrintHtml()+'</main>'+
 '<footer>الإعداد والإشراف: الأستاذ سعيد بن جمعة بن عبدالله البريكي<br>مدير المدرسة: الأستاذ عبد الله بن علي العيسائي</footer></article>';
}
function hubPdfPrint(){
 const data=hubPaper(),orient=hub.printOrientation==='landscape'?'landscape':'portrait',pop=window.open('','_blank');
 if(!pop){window.alert('اسمح بفتح نافذة الطباعة الجديدة في المتصفح.');return}
 const page='<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">'+
 '<title>طباعة آفاق ماث</title><style>@page{size:A4 '+orient+';margin:10mm}'+
 'body{direction:rtl;font-family:Tahoma,Arial,sans-serif;color:#1a436b}'+
 '.hub-printed-document{max-width:100%;line-height:1.65}'+
 '.hub-printed-document header{border-bottom:3px solid #bd9c5b;text-align:center}'+
 '.hub-printed-document h1{font-size:22pt}.hub-printed-document main{padding:8mm 0}'+
 '.hub-printed-document footer{border-top:2px solid #bd9c5b;padding-top:3mm;margin-top:8mm}'+
 '.hub-printed-document table{border-collapse:collapse;width:100%;font-size:7pt}'+
 '.hub-printed-document th,.hub-printed-document td{border:1px solid #aaa;padding:2mm}'+
 '.gb-certificate{font-size:9pt!important;min-height:0!important;max-width:none!important;}'+
 '.ss-portrait-student{border:1px solid #aaa;margin-bottom:2mm;padding:2mm;break-inside:avoid}'+
 '.ss-portrait-grade-line,.ss-portrait-totals{display:grid;grid-template-columns:repeat(4,1fr);gap:2mm;font-size:8pt}'+
 '</style></head><body>'+data+'</body></html>';
 pop.document.open();pop.document.write(page);pop.onload=()=>{pop.focus();pop.print()};pop.document.close();
}
function hubExportWord(){
 const html=hubPaper().replace(/<svg[\s\S]*?<\/svg>/g,'');
 const content='<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">'+
 '<style>body{font-family:Tahoma,Arial;direction:rtl;line-height:1.65}'+
 'table{border-collapse:collapse;width:100%}td,th{border:1px solid #aaa;padding:4px}'+
 'h1,h2,h3{color:#17476d}footer{border-top:1px solid #aaa;margin-top:25px}</style></head><body>'+html+'</body></html>';
 const blob=new Blob(['\ufeff',content],{type:'application/msword;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;
 a.download='آفاق-الرياضيات-'+new Date().toISOString().slice(0,10)+'.doc';document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),3000);
}


/* تفعيل الطبقة الجديدة دون إعادة كتابة وظائف المسابقة أو صفحة نتائج الطلاب. */
const hubOldHome=home,hubOldLibrary=library;
home=function(){return hubHome()};
library=function(){return hubLibrary()};
const hubOriginalStaffPanel=staffPanel;
staffPanel=function(){
 if(!canEdit())return hubOriginalStaffPanel();
 if(auth.section==='overview')return hubStaffDashboard();
 if(auth.section==='hub_catalog'||auth.section==='hub_catalog_contests'){
  if(!isAdmin())return '<div class="notice">تعديل الموارد والمسابقات متاح للمشرف الرئيسي فقط.</div>';
  return hubAdminCatalog();
 }
 if(auth.section==='hub_inbox')return hubInbox();
 if(auth.section==='hub_parent_codes'){
  if(!isAdmin())return '<div class="notice">إصدار رمز ولي الأمر يتطلب صلاحية المشرف الرئيسي.</div>';
  return hubParentCodes();
 }
 if(auth.section==='hub_apps')return hubApps();
 if(auth.section==='hub_print')return hubPrintCenter();
 const prev=hubOriginalStaffPanel();
 if(!prev.includes('hub-staff-nav'))return prev.replace('<div class="chips">',hubStaffNav()+'<div class="chips">');
 return prev;
};
const hubLastRender=render;
const hubCustomRoutes=['visitor','fun','contests','guest_trial','parent','support'];
render=function(){
 if(hubCustomRoutes.includes(state.page)){
  const html=state.page==='visitor'?hubVisitor():state.page==='fun'?hubFun():
    state.page==='contests'?hubContests():state.page==='guest_trial'?hubTrialPage():
    state.page==='parent'?hubParentPage():hubSupport();
  document.getElementById('app').innerHTML=html;
  document.querySelectorAll('[data-route]').forEach(node=>node.classList.toggle('active',node.dataset.route===state.page));
  attach();
  attachPortal();
  return;
 }
 hubLastRender();
};
const hubOldAttach=attach;
attach=function(){
 hubOldAttach();
 hubAttach();
};
function hubSetLogin(role){
 const select=document.getElementById('loginRole');
 if(!select)return;
 if(typeof selectEntryGate==='function'){
  const group=['supervisor','supervisor_assistant','it_viewer'].includes(role)?'supervision':
   ['director','deputy'].includes(role)?'management':'student';
  selectEntryGate(group);
 }else document.getElementById('authDialog')?.showModal();
 select.value=role;
 if(typeof loginUi==='function')loginUi();
}
function hubSelectWork(tab){
 if(!canEdit())return;
 ssState.tab=tab;
 ssState.editing=null;
 auth.section='staff_hub';render();
 if(ssState.loadedYear!==ssState.year&&!ssState.loading)ssLoadRecords();
}
function hubLoadForTab(id){
 if(!canEdit())return;
 if(['hub_catalog','hub_catalog_contests'].includes(id)&&isAdmin()&&!hub.adminLoaded)hubLoadAdminCatalog();
 if(id==='hub_inbox'&&!hub.inboxLoaded)hubLoadInbox();
 if(id==='overview'&&!hub.stats)hubLoadStaffStats();
 if(id==='hub_print'){
  if(isAdmin()&&!hub.adminLoaded)hubLoadAdminCatalog();
  if(ssState.loadedYear!==ssState.year&&!ssState.loading)ssLoadRecords();
 }
 if(id==='hub_parent_codes'){
  const cls=hub.selectedClass;
  const set=auth.students.filter(x=>x.class_name===cls).sort((a,b)=>Number(a.serial_no)-Number(b.serial_no));
  if(set.length)hub.selectedSerial=set[0].serial_no;
 }
}
async function hubReplySupport(form){
 const id=Number(form.dataset.hubTicket),data=new FormData(form);
 try{await hubCall('support_reply',{id,response:data.get('response')},auth.token);await hubLoadInbox();
  auth.message='تم حفظ الرد في التذكرة، وأصبح متاحًا لصاحب رمز المتابعة.';render();
 }catch(e){window.alert(e.message)}
}
function hubPrintUpdateState(){
 hub.printChosen=document.getElementById('hubPrintSource')?.value||hub.printChosen;
 hub.printOrientation=document.getElementById('hubPrintOrientation')?.value||hub.printOrientation;
}
async function hubRefreshPrintData(){
 if(!canEdit())return;
 if(isAdmin()&&!hub.adminLoaded)await hubLoadAdminCatalog();
 if(ssState.loadedYear!==ssState.year&&!ssState.loading)await ssLoadRecords();
 render();
}
function hubAttach(){
 document.getElementById('portalLogout')?.addEventListener('click',()=>{
  hub.parentIssued=null;hub.adminItems=[];hub.inbox=[];hub.legacyInbox=[];
  hub.stats=null;hub.adminLoaded=false;hub.inboxLoaded=false;hub.statsLoaded=false;
  hub.parentProfile=null;hub.parentsStatus=null;
 });
 if(state.page==='guest_trial'&&!hub.trialLoaded&&!hub.trialBusy){
  hub.trialLoaded=true;
  hubTrialLoad();
 }
 if(state.page==='dashboard'&&auth.section==='overview'&&canEdit()&&!hub.statsLoaded){
  hubLoadStaffStats();
 }
 document.querySelectorAll('[data-hub-login]').forEach(x=>x.addEventListener('click',()=>hubSetLogin(x.dataset.hubLogin)));
 document.querySelectorAll('[data-hub-library]').forEach(x=>x.addEventListener('click',()=>{
  hub.libraryCat=x.dataset.hubLibrary;render();
 }));
 document.querySelectorAll('[data-hub-fun]').forEach(x=>x.addEventListener('click',()=>{
  hub.funCat=x.dataset.hubFun;render();
 }));
 document.getElementById('hubStartTrial')?.addEventListener('click',hubTrialStart);
 document.querySelectorAll('[data-hub-answer]').forEach(x=>x.addEventListener('change',()=>{
  hub.trialAnswers[Number(x.dataset.hubAnswer)]=Number(x.value);
 }));
 document.getElementById('hubTrialForm')?.addEventListener('submit',ev=>{ev.preventDefault();hubTrialSubmit()});
 document.getElementById('hubSupportForm')?.addEventListener('submit',ev=>{ev.preventDefault();hubSubmitSupport(ev.currentTarget)});
 document.getElementById('hubTicketCheckForm')?.addEventListener('submit',ev=>{
  ev.preventDefault();hubCheckTicket(new FormData(ev.currentTarget).get('ticket'));
 });
 document.querySelectorAll('[data-hub-check-ticket]').forEach(x=>x.addEventListener('click',()=>hubCheckTicket(x.dataset.hubCheckTicket)));
 document.querySelectorAll('[data-hub-copy-ticket]').forEach(x=>x.addEventListener('click',async()=>{
  if(hub.supportTicketResult)await navigator.clipboard?.writeText(hub.supportTicketResult);
 }));
 document.getElementById('hubParentLogin')?.addEventListener('submit',ev=>{ev.preventDefault();hubParentLogin(ev.currentTarget)});
 document.getElementById('hubParentMessage')?.addEventListener('submit',ev=>{ev.preventDefault();hubParentMessage(ev.currentTarget)});
 document.getElementById('hubParentLogout')?.addEventListener('click',hubParentLogout);
 document.getElementById('hubStatsReload')?.addEventListener('click',hubLoadStaffStats);
 document.querySelectorAll('[data-hub-work]').forEach(x=>x.addEventListener('click',()=>hubSelectWork(x.dataset.hubWork)));
 document.querySelectorAll('[data-hub-staff]').forEach(x=>x.addEventListener('click',()=>hubSelectWork(x.dataset.hubStaff)));
 document.querySelectorAll('[data-tab]').forEach(x=>x.addEventListener('click',()=>hubLoadForTab(x.dataset.tab)));
 document.getElementById('hubCatalogForm')?.addEventListener('submit',ev=>{ev.preventDefault();hubSaveCatalog(ev.currentTarget)});
 document.getElementById('hubCancelCatalogEdit')?.addEventListener('click',()=>{hub.adminEdit=null;render()});
 document.querySelectorAll('[data-hub-edit-item]').forEach(x=>x.addEventListener('click',()=>{
  hub.adminEdit=hub.adminItems.find(r=>String(r.id)===x.dataset.hubEditItem)||null;
  render();document.getElementById('hubCatalogForm')?.scrollIntoView({behavior:'smooth'});
 }));
 document.querySelectorAll('[data-hub-toggle-item]').forEach(x=>x.addEventListener('click',()=>hubToggleCatalog(x.dataset.hubToggleItem)));
 document.querySelectorAll('[data-hub-delete-item]').forEach(x=>x.addEventListener('click',()=>hubDeleteCatalog(x.dataset.hubDeleteItem)));
 document.getElementById('hubInboxReload')?.addEventListener('click',hubLoadInbox);
 document.querySelectorAll('.hubReplyForm').forEach(x=>x.addEventListener('submit',ev=>{ev.preventDefault();hubReplySupport(ev.currentTarget)}));
 document.getElementById('hubParentClass')?.addEventListener('change',ev=>{
  hub.selectedClass=ev.target.value;
  hub.parentIssued=null;
  const kids=auth.students.filter(x=>x.class_name===hub.selectedClass).sort((a,b)=>a.serial_no-b.serial_no);
  hub.selectedSerial=kids[0]?.serial_no||1;render();
 });
 document.getElementById('hubParentCodeForm')?.addEventListener('submit',ev=>{
  ev.preventDefault();hub.selectedSerial=Number(new FormData(ev.currentTarget).get('serial_no'));
  hubManageParentCode(ev.currentTarget,ev.submitter);
 });
 document.getElementById('hubCopyParentCode')?.addEventListener('click',async()=>{
  if(hub.parentIssued)await navigator.clipboard?.writeText(hub.parentIssued);
 });
 document.getElementById('hubPrintSource')?.addEventListener('change',hubPrintUpdateState);
 document.getElementById('hubPrintOrientation')?.addEventListener('change',hubPrintUpdateState);
 document.getElementById('hubPrintPDF')?.addEventListener('click',()=>{hubPrintUpdateState();hubPdfPrint()});
 document.getElementById('hubPrintWord')?.addEventListener('click',()=>{hubPrintUpdateState();hubExportWord()});
 document.getElementById('hubPrintPreview')?.addEventListener('click',()=>{
  hubPrintUpdateState();const area=document.getElementById('hubPrintPreviewArea');
  if(area)area.innerHTML=hubPaper();
 });
 document.getElementById('hubPrintReload')?.addEventListener('click',hubRefreshPrintData);
}
const HUB_MAIN_MENU=[
 ['home','الرئيسية'],['learning','التعليم والتعلّم'],['library','المكتبة العامة'],
 ['fun','المرح والتسلية'],['contests','الألعاب والمسابقات'],['support','الدعم والتواصل']
];
function hubTopNavigation(){
 const nav=document.querySelector('.desktopnav');
 if(nav)nav.innerHTML=HUB_MAIN_MENU.map(([key,name])=>'<button data-route="'+key+'">'+name+'</button>').join('');
 const mnav=document.getElementById('mobileNav');
 if(mnav)mnav.innerHTML=HUB_MAIN_MENU.map(([key,name])=>'<button data-route="'+key+'">'+name+'</button>').join('');
 const mainBtn=document.getElementById('accountBtn');
 if(mainBtn)mainBtn.textContent=auth.user?'حسابي • '+(roleLabel?.[auth.user.role]||'مستخدم'):'دخول المنصة';
}
function hubInitial(){
 try{hub.supportTickets=JSON.parse(localStorage.getItem('afaq_support_tickets_v6')||'[]').filter(x=>typeof x==='string').slice(-15)}catch{}
 hubTopNavigation();
 hubLoadCatalog();
 hubVisit();
 if(hub.parentToken)hubLoadParent();
 // أنشئت الواجهة بعد تحميل السكربت؛ لا تُنقل حسابات قديمة ولا تُمسح النتائج.
 const oldHash=(location.hash||'').replace('#','');
 if(hubCustomRoutes.includes(oldHash)){state.page=oldHash;render()}
 else render();
}
hubInitial();
