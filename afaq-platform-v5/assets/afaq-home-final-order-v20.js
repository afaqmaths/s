/* AFAQMATHS 2026-11-17 — final accessible home order.
 * Removes decorative/nonworking role gates; retains the real account dialog.
 * News follows all three middle columns; football poster then visitor count close the page. */
'use strict';

function afaqFinalAboutMarkup(){
 const cards=[
  {title:'الصفوف والدروس التفاعلية',desc:'مسارات الرياضيات للصفوف الخامس والسادس والسابع والثامن، مع دروس الأعداد والعمليات والقياس والهندسة والبيانات، ومحتوى يُضاف ويُعتمد تدريجيًا.',route:'learning',tag:'تعلّم واكتشاف',visual:'<svg viewBox="0 0 160 132" role="img" aria-label="رسم توضيحي للدروس"><use href="assets/afaq-section-art.svg?v=20261112-brand3#art-learning"></use></svg>',color:'blue'},
  {title:'التدريب والاختبارات',desc:'أسئلة وتدريبات تشخيصية وقصيرة، ومهام تقويم متنوعة؛ تتدرج من الفهم والمعرفة إلى التطبيق والاستدلال مع تغذية راجعة تساعد على التحسن.',route:'question_bank',tag:'افهم • طبّق • استدل',visual:'<img src="assets/afaq-hero-coordinate-v10.svg" loading="lazy" decoding="async" alt="مستوى إحداثي وشكل هندسي ومفهوم الانسحاب" width="160" height="132">',color:'cyan'},
  {title:'العلاج والإثراء ومتابعة التقدم',desc:'أنشطة داعمة لمن يحتاج إلى تأسيس المهارة، وتحديات إثرائية للمتفوقين، مع متابعة الأداء والنتائج في الحسابات المصرح لها.',route:'adaptive',tag:'تعلّم يناسب الجميع',visual:'<svg viewBox="0 0 160 132" role="img" aria-label="رسم تطور التعلم"><use href="assets/afaq-section-art.svg?v=20261112-brand3#art-initiatives"></use></svg>',color:'rose'},
  {title:'المبادرات العلمية المبتكرة',desc:'جرّب خلاط الرياضيات، وغربال الأعداد الأولية، والمضاعفات، ومفتاح القسمة، والإحداثيات، واستراتيجيات الحساب الذهني، والتقويم المتكيف.',route:'teaching_initiatives',tag:'جرّب بنفسك',visual:'<img src="assets/afaq-mixer.svg" loading="lazy" decoding="async" alt="خلاط الرياضيات المصور والمدخلات والعمليات" width="160" height="132">',color:'gold'},
  {title:'المكتبة الرياضية والمعرفة',desc:'رحلة عبر تاريخ الأرقام والحضارات وعلماء الرياضيات وكتبها وفروعها، لفهم كيف أسهمت الرياضيات في تطور العلوم والحياة.',route:'library',tag:'اقرأ واستكشف',visual:'<svg viewBox="0 0 160 132" role="img" aria-label="رسم الكتب والمصادر"><use href="assets/afaq-section-art.svg?v=20261112-brand3#art-library"></use></svg>',color:'purple'},
  {title:'الألعاب والمسابقات ونجوم آفاق',desc:'مسابقات متعددة المراحل، وتحديات وألعاب وألغاز رياضية، تشجع التفكير والمنافسة الإيجابية وتقدير التميز والمثابرة.',route:'contests',tag:'تحدَّ نفسك',visual:'<svg viewBox="0 0 160 132" role="img" aria-label="رسم الألعاب والمسابقات"><use href="assets/afaq-section-art.svg?v=20261112-brand3#art-competition"></use></svg>',color:'amber'},
  {title:'مكتبة الاستماع والوسائط',desc:'مواد للاستماع إلى القرآن الكريم والأحاديث والحِكَم والأناشيد، مع موارد مرئية وفيديوهات تعليمية تزيد تنوع تجربة الطالب.',route:'audio',tag:'شاهد واستمع',visual:'<div class="afaq-about-sound-art" role="img" aria-label="رسم موجات صوتية ونغمات"><span>♫</span><i></i><i></i><i></i><i></i><i></i><b>▶</b></div>',color:'teal'},
  {title:'الرياضيات في الحياة والمشروعات',desc:'أوراق عمل ومهام ومشروعات تطبيقية تربط الرياضيات بالقياس والتخطيط والبيئة والعلوم والشراء والمواقف اليومية.',route:'work',tag:'من الفكرة إلى الواقع',visual:'<img src="assets/afaq-v9-shapes.svg?v=20261113-v9" loading="lazy" decoding="async" alt="مجسمات هندسية متنوّعة للقياس وتطبيقات الحياة" width="160" height="132">',color:'green'}
 ];
 return '<section class="afaq-final-introduction afaq-about-2026" aria-label="تعرف على منصة آفاق ماث وخدماتها المتنوعة" dir="rtl">'+
 '<div class="afaq-final-intro-main">'+
 '<div class="afaq-final-intro-copy">'+
 '<span class="afaq-final-eyebrow"><span aria-hidden="true">✦</span> التعليم والابتكار • سلطنة عُمان <span aria-hidden="true">✦</span></span>'+
 '<h2>ما هي منصة آفاق ماث؟ <span lang="en" dir="ltr">AFAQMATHS</span></h2>'+
 '<p class="afaq-about-lead"><strong>آفاق ماث</strong> عالم تعليمي عُماني تفاعلي يجعل الرياضيات أكثر فهمًا وتشويقًا؛ يجمع بين <strong>الشرح والاستكشاف والتطبيق والاستدلال</strong> في مكان واحد، ويفتح للطلاب أبواب المعرفة والابتكار والتحدي.</p>'+
 '<p>تخدم المنصة مسارات الصفوف <strong>الخامس والسادس والسابع والثامن</strong>، مع اهتمام موسع بمحتوى الصف السادس، وتتدرج في بناء المهارات من المفاهيم الأساسية إلى الأنشطة العملية والاختبارات والمشروعات المرتبطة بالحياة اليومية، مع تطوير المواد واعتمادها تباعًا.</p>'+
 '<p>ولا تقتصر آفاق ماث على الدروس؛ فهي تضم <strong>مبادرات رياضية مصوّرة وتفاعلية</strong>، ومكتبة علمية وتاريخية، ومكتبة للاستماع والوسائط، وألعابًا ومسابقات تحفيزية، ومساحات للتواصل والشراكة بين الطالب وولي الأمر والمدرسة.</p>'+
 '<div class="afaq-final-intro-highlights">'+
 '<span>📘 الصفوف ٥–٨</span><span>🧠 فهم وتطبيق واستدلال</span>'+
 '<span>💡 مبادرات رياضية</span><span>🏆 نجوم آفاق</span>'+
 '<span>📚 قراءة واستماع</span><span>🤝 أسرة ومدرسة</span></div>'+
 '<div class="afaq-about-primary-actions">'+
 '<button type="button" data-route="afaq_directory">🧭 استكشف خريطة المنصة الشاملة</button>'+
 '<button type="button" data-route="learning">📘 ابدأ التعلّم</button></div>'+
 '</div>'+
 '<div class="afaq-final-intro-illustration afaq-about-math-gallery" aria-label="معرض مصغر لصور المجسمات والإحداثيات وخلاط الرياضيات">'+
 '<span class="afaq-about-art-eyebrow">الرياضيات من زوايا مختلفة ✦</span>'+
 '<div class="afaq-about-art-grid">'+
 '<div class="afaq-about-art-main"><img src="assets/afaq-hero-3d-v10.svg" loading="lazy" decoding="async" width="320" height="320" alt="مجسمات هندسية مضيئة ومكعب ثلاثي الأبعاد"></div>'+
 '<div class="afaq-about-art-secondary"><img src="assets/afaq-hero-coordinate-v10.svg" loading="lazy" decoding="async" width="210" height="210" alt="مستوى إحداثي يوضح الانسحاب والحركة الهندسية"></div>'+
 '<div class="afaq-about-art-secondary afaq-about-art-mixer"><img src="assets/afaq-mixer.svg" loading="lazy" decoding="async" width="210" height="210" alt="مبادرة خلاط الرياضيات ومدخلات العمليات الحسابية"></div>'+
 '</div>'+
 '<div class="afaq-about-art-formulas" aria-hidden="true"><span>π</span><span>√</span><span>∑</span><span>△</span><span>x²</span><span>∞</span></div>'+
 '<div class="afaq-about-art-caption"><strong>نفكر بالأعداد، ونرسم بالأشكال، ونبدع بالتجربة</strong>'+
 '<small>الأعداد • الهندسة • القياس • الأنماط • التفكير الرياضي</small></div></div>'+
 '</div>'+
 '<div class="afaq-about-learning-path" aria-label="رحلة الطالب في آفاق ماث">'+
 '<span class="afaq-about-path-label">رحلتك مع الرياضيات</span>'+
 '<div class="afaq-about-path-steps"><span>🔎 أستكشف</span><span>💡 أفهم</span><span>🧩 أطبّق</span><span>🧠 أستدل</span><span>🌟 أتقدّم</span></div></div>'+
 '<div class="afaq-about-block-heading"><div><span>✦ أبواب تتكامل لتصنع تجربة متكاملة ✦</span>'+
 '<h3>ماذا تجد داخل آفاق ماث؟</h3></div><p>ثمانية مجالات تعليمية ومعرفية وترفيهية متصلة بصفحاتها وخدماتها.</p></div>'+
 '<div class="afaq-final-about-cards afaq-about-rich-cards">'+
 cards.map((item,index)=>'<article class="afaq-about-rich-card afaq-about-rich-card--'+item.color+'">'+
 '<div class="afaq-about-card-top"><span class="afaq-about-card-index">'+String(index+1).replace(/[0-9]/g,d=>"٠١٢٣٤٥٦٧٨٩"[Number(d)])+'</span>'+
 '<span class="afaq-about-card-category">'+item.tag+'</span></div>'+
 '<span class="afaq-final-card-art">'+item.visual+'</span>'+
 '<div class="afaq-about-card-body"><h3>'+item.title+'</h3><p>'+item.desc+'</p></div>'+
 '<button type="button" class="afaq-about-card-link" data-route="'+item.route+'">استكشف القسم <span aria-hidden="true">↗</span></button>'+
 '</article>').join('')+
 '</div>'+
 '<div class="afaq-about-audiences"><div class="afaq-about-audiences-symbol" aria-hidden="true">✧</div>'+
 '<div><strong>تعلّم يربط الطالب بأسرته ومدرسته</strong>'+
 '<p>يستكشف الزائر الموارد العامة دون حساب، بينما يطّلع الطالب وولي الأمر والإدارة والمشرف على خدماتهم وبياناتهم المصرّح بها فقط. وتتطور أقسام المنصة ومحتوياتها وفق الإضافة والاعتماد.</p></div>'+
 '<button type="button" data-route="afaq_directory">تعرّف على جميع الأبواب <span aria-hidden="true">↗</span></button></div>'+
 '</section>';
}
function afaqFinalEntryMarkup(){
 return '<div class="afaq-final-entry-guide" dir="rtl">'+
 '<p class="afaq-entry-lead">اختر الطريقة المناسبة من <strong>نافذة الدخول الفعلية</strong>، بدل أزرار منفصلة قد لا تفتح حسابًا. يمكنك الاطلاع على الموارد العامة دون تسجيل، أما بيانات الطلاب وإدارة المسابقة فتتطلب حسابًا مصرحًا به.</p>'+
 '<ol class="afaq-final-entry-steps">'+
 '<li><span class="afaq-final-step-icon" aria-hidden="true">1</span><p><strong>افتح نافذة الدخول</strong><small>اضغط زر «دخول المنصة» الموجود أعلى الصفحة، أو الزر أدناه.</small></p></li>'+
 '<li><span class="afaq-final-step-icon" aria-hidden="true">2</span><p><strong>حدّد نوع الحساب</strong><small>اختر «طلاب صف 6» أو «طلاب الصفوف الأخرى» أو بوابة المشرفين والإدارة المدرسية. ولولي الأمر بوابة مستقلة لمتابعة بيانات ابنه.</small></p></li>'+
 '<li><span class="afaq-final-step-icon" aria-hidden="true">3</span><p><strong>أدخل بيانات الدخول المعتمدة</strong><small>طلاب الصف السادس يستخدمون اسم المستخدم والرقم السري المعتمدين؛ وطلاب الصفوف 5 و7 و8 يختارون صفهم الدراسي. يدخل ولي الأمر عبر بوابته برمز مستقل.</small></p></li>'+
 '<li><span class="afaq-final-step-icon" aria-hidden="true">4</span><p><strong>ابدأ التعلم والمتابعة</strong><small>ستظهر لك الخدمات المناسبة لحسابك، بما فيها الدروس والأنشطة والنتائج المصرّح بها.</small></p></li>'+
 '</ol>'+
 '<button type="button" class="afaq-final-entry-button" data-afaq-open-account-dialog>🔐 فتح نافذة الدخول إلى المنصة</button>'+
 '<p class="afaq-entry-guest-note">📚 <strong>هل تريد التصفح فقط؟</strong> أقسام المكتبة والمحتوى العام يمكن استكشافها دون حساب؛ ولا تتطلب تسجيلًا قبل الاطلاع.</p>'+
 '</div>';
}
const afaqFinalPriorHome=hubHome;
hubHome=function(){
 const html=afaqFinalPriorHome();
 if(!html.includes('hub-home'))return html;
 const mount=document.createElement('div');
 mount.innerHTML=html;
 const home=mount.querySelector('.hub-home');
 if(!home||home.classList.contains('afaq-final-reordered'))return html;
 home.classList.add('afaq-final-reordered');
 // Clear descriptions of user roles from the prominent presentation; preserve functional account controls elsewhere.
 const intro=home.querySelector('.hub-intro-panel');
 if(intro){
  const replacement=document.createElement('div');
  replacement.innerHTML=afaqFinalAboutMarkup();
  intro.replaceWith(replacement.firstElementChild);
 }
 // Preserve the four REAL entry controls.  These buttons open the existing account
 // dialogs and guest view; only the decorative audience tiles in hubAbout were removed.
 const access=home.querySelector('.afaq-mid-side--right .afaq-home-access')||home.querySelector('.afaq-home-access');
 const mid=home.querySelector('.afaq-mid-layout')||access;
 if(!mid)return mount.innerHTML;
 // Place the ORIGINAL, functional login section directly after the animated Oman flag
 // and before the final blue math hero. MOVE the node; do not clone or replace gates.
 const hero=home.querySelector('.hub-banner.afaq-animated-hero');
 if(hero&&access){
  hero.parentNode.insertBefore(access,hero);
  access.classList.add('afaq-entry-between-flag-hero');
  const oldSidebar=mid.querySelector('.afaq-mid-side--right');
  if(oldSidebar&&!oldSidebar.querySelector('.afaq-home-access')&&!oldSidebar.children.length)oldSidebar.remove();
  if(mid.classList.contains('afaq-mid-layout'))mid.classList.add('afaq-mid-layout--two');
 }
 // Move the live notices and ALL four news rails after "choose entry" and teacher initiatives.
 const feedItems=[...home.querySelectorAll('.ae-notice-bar,.v13-news-rail,.v9-news-container,.ae-news-bar')];
 const news=document.createElement('section');
 news.className='afaq-final-news-block';
 news.setAttribute('aria-label','تحديثات آفاق ماث والأخبار العامة');
 news.setAttribute('dir','rtl');
 news.innerHTML='<header class="afaq-final-news-heading"><span>🗞️ مستجدات المنصة والعالم</span>'+
 '<h2>تحديثات آفاق ماث والأخبار العامة</h2>'+
 '<p>آخر تنبيهات المنصة والأخبار الوطنية والعامة والرياضية والعلمية والاقتصادية من مصادرها، بعد دليل الدخول والمبادرات.</p></header>';
 const byClass=cls=>feedItems.filter(el=>el.classList.contains(cls));
 const notice=byClass('ae-notice-bar');
 if(notice.length)notice.forEach(el=>news.appendChild(el));
 else{
  const text=document.createElement('p');
  text.className='afaq-final-no-updates';text.textContent='🔔 تظهر تحديثات آفاق هنا عند نشرها واعتمادها من المشرف.';
  news.appendChild(text);
 }
 for(const cls of ['v13-news-rail--general','v13-news-rail--sport','v13-news-rail--business','v13-news-rail--science']){
  feedItems.filter(el=>el.classList.contains('v13-news-rail')&&el.classList.contains(cls)).forEach(el=>news.appendChild(el));
 }
 feedItems.filter(el=>!el.classList.contains('ae-notice-bar')&&!el.classList.contains('v13-news-rail')).forEach(el=>news.appendChild(el));
 mid.insertAdjacentElement('afterend',news);
 // Finish with the football illustration, followed immediately by the visitor total.
 const count=home.querySelector('.hub-counter');
 const football=[...home.querySelectorAll('.foot-v10-promo')];
 if(count){
  const label=count.querySelector('span');
  if(label)label.textContent='عدد زوار المنصة';
  count.classList.add('afaq-final-visitor-counter');
  count.setAttribute('aria-label','عدد زوار المنصة التراكمي');
  let explanation=count.querySelector('.afaq-final-counter-note');
  if(!explanation){
   explanation=document.createElement('small');
   explanation.className='afaq-final-counter-note';
   explanation.textContent='شكرًا لزيارتكم آفاق ماث؛ نتمنى لكم تصفحًا ممتعًا ومعرفةً نافعة، ونسأل الله أن يكلّل مسيرتكم بالتوفيق والنجاح والتفوّق.';
   count.appendChild(explanation);
  }
 }
 // Keep the matches panel as the last content section; the number of visitors is last of all.
 if(football.length){
  football.forEach(panel=>{
   panel.classList.add('afaq-final-football');
   home.appendChild(panel);
  });
 }
 if(count)home.appendChild(count);
 // The older lock-image initiative teaser is redundant now that the real,
 // interactive Math Mixer is presented above. Remove its DOM node entirely;
 // do not touch the protected full mixer route or supervisor permissions.
 home.querySelectorAll('.v10-init-home.ia-init-teaser').forEach(teaser=>teaser.remove());
 return mount.innerHTML;
};
const afaqFinalPriorAttach=attach;
attach=function(){
 afaqFinalPriorAttach();
 document.querySelectorAll('[data-afaq-open-account-dialog]').forEach(button=>button.addEventListener('click',()=>{
  const account=document.getElementById('accountBtn');
  if(account){account.click();return}
  const dialog=document.getElementById('authDialog');
  if(dialog&&typeof dialog.showModal==='function'&&!dialog.open)dialog.showModal();
 }));
};
