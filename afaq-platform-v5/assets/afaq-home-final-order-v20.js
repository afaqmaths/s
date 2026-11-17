/* AFAQMATHS 2026-11-17 — final accessible home order.
 * Removes decorative/nonworking role gates; retains the real account dialog.
 * News follows all three middle columns; football poster then visitor count close the page. */
'use strict';

function afaqFinalAboutMarkup(){
 return '<section class="afaq-final-introduction" aria-label="تعرف على منصة آفاق ماث" dir="rtl">'+
 '<div class="afaq-final-intro-main">'+
 '<div class="afaq-final-intro-copy">'+
 '<span class="afaq-final-eyebrow">التعليم والابتكار • سلطنة عُمان</span>'+
 '<h2>ما هي منصة آفاق ماث؟ <span lang="en" dir="ltr">AFAQMATHS</span></h2>'+
 '<p><strong>آفاق ماث</strong> بيئة تعليمية تفاعلية لمادة الرياضيات، تجمع بين شرح المفاهيم والأنشطة العملية والتدريبات والتقويم والمسابقات، وتخدم طلاب الصفوف <strong>الخامس والسادس والسابع والثامن</strong>، مع اهتمام خاص بمهارات الصف السادس وفق تدرج الفهم والتطبيق والاستدلال.</p>'+
 '<p>تهدف المنصة إلى جعل الطالب مشاركًا في التعلم؛ يكتشف الفكرة الرياضية، ويتدرّب عليها، ويتلقى تغذية راجعة، ثم ينتقل إلى تطبيقات أقرب إلى الحياة اليومية. وتتيح كذلك مصادر للمعلم ومواد للقراءة والاستماع والبحث في تاريخ الرياضيات.</p>'+
 '<div class="afaq-final-intro-highlights"><span>📘 تعليم تفاعلي</span><span>🎯 تدريب وتقويم</span><span>🏆 مسابقات تحفيزية</span><span>📚 مكتبة رياضية</span></div>'+
 '</div>'+
 '<div class="afaq-final-intro-illustration" aria-label="رسومات توضح المجسمات الهندسية من دروس الصف السادس">'+
 '<img src="assets/afaq-v9-shapes.svg?v=20261113-v9" alt="مجسمات الصف السادس: مكعب ومتوازي مستطيلات وهرم وأسطوانة ومخروط" width="350" height="370" loading="lazy">'+
 '<div><strong>رياضيات نفهمها ونطبقها</strong><small>الأعداد • القياس • الهندسة • البيانات</small></div></div>'+
 '</div>'+
 '<div class="afaq-final-about-cards">'+
 '<article><span class="afaq-final-card-art"><svg viewBox="0 0 160 132" role="img" aria-label="رسم الدروس التفاعلية"><use href="assets/afaq-section-art.svg?v=20261112-brand3#art-learning"></use></svg></span>'+
 '<div><h3>الدروس والتعلم</h3><p>موضوعات الأعداد والعمليات والمضاعفات والعوامل والمتتاليات والقياس والهندسة والتمثيلات الرياضية، مع أمثلة وأسئلة مصنفة بحسب مستوى التعلم.</p></div></article>'+
 '<article><span class="afaq-final-card-art"><svg viewBox="0 0 160 132" role="img" aria-label="رسم المكتبة الرياضية"><use href="assets/afaq-section-art.svg?v=20261112-brand3#art-library"></use></svg></span>'+
 '<div><h3>المكتبة والوسائط</h3><p>مراجع عن تاريخ الرياضيات وعلمائها والكتب والمعرفة العلمية، إلى جانب الفيديوهات التعليمية ومكتبة الاستماع والتحفيز.</p></div></article>'+
 '<article><span class="afaq-final-card-art"><svg viewBox="0 0 160 132" role="img" aria-label="رسم الألعاب والمسابقات"><use href="assets/afaq-section-art.svg?v=20261112-brand3#art-competition"></use></svg></span>'+
 '<div><h3>الألعاب والمسابقات</h3><p>أنشطة وألغاز وتحديات رياضية، من بينها مسابقة <strong>نجوم آفاق الرياضيات</strong> بمراحلها ومحاولاتها المعتمدة، لتعزيز المثابرة والتنافس الإيجابي.</p></div></article>'+
 '<article><span class="afaq-final-card-art"><svg viewBox="0 0 160 132" role="img" aria-label="رسم البرامج التعليمية"><use href="assets/afaq-section-art.svg?v=20261112-brand3#art-initiatives"></use></svg></span>'+
 '<div><h3>الإثراء والعلاج ومتابعة التقدم</h3><p>أوراق عمل وبنك أسئلة وتقويمات وأنشطة علاجية وإثرائية، وتظهر البيانات الشخصية ونتائج الطالب في حسابه المعتمد فقط.</p></div></article>'+
 '</div></section>';
}
function afaqFinalEntryMarkup(){
 return '<div class="afaq-final-entry-guide" dir="rtl">'+
 '<p class="afaq-entry-lead">اختر الطريقة المناسبة من <strong>نافذة الدخول الفعلية</strong>، بدل أزرار منفصلة قد لا تفتح حسابًا. يمكنك الاطلاع على الموارد العامة دون تسجيل، أما بيانات الطلاب وإدارة المسابقة فتتطلب حسابًا مصرحًا به.</p>'+
 '<ol class="afaq-final-entry-steps">'+
 '<li><span class="afaq-final-step-icon" aria-hidden="true">1</span><p><strong>افتح نافذة الدخول</strong><small>اضغط زر «دخول المنصة» الموجود أعلى الصفحة، أو الزر أدناه.</small></p></li>'+
 '<li><span class="afaq-final-step-icon" aria-hidden="true">2</span><p><strong>حدّد نوع الحساب</strong><small>اختر الطالب أو المشرف الرئيسي أو المشرف المساعد أو الإدارة المدرسية، بحسب أنواع الحسابات المتاحة لك داخل النافذة. وتبقى متابعة ولي الأمر ضمن قنواتها المخصصة.</small></p></li>'+
 '<li><span class="afaq-final-step-icon" aria-hidden="true">3</span><p><strong>أدخل بيانات الدخول المعتمدة</strong><small>طالب السادس يختار شعبته ويدخل رقمه في الكشف والرمز السري المستلم بصورة خاصة.</small></p></li>'+
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
 const access=home.querySelector('.afaq-mid-side--right .afaq-home-access')||home.querySelector('.afaq-home-access');
 if(access){
  const gates=access.querySelector('.hub-gate-grid');
  if(gates){
   const content=document.createElement('div');
   content.innerHTML=afaqFinalEntryMarkup();
   gates.replaceWith(content.firstElementChild);
  }
 }
 const mid=home.querySelector('.afaq-mid-layout')||access;
 if(!mid)return mount.innerHTML;
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
 // The first-login reminder is now written as a numbered step inside the actual entry guide.
 home.querySelectorAll('.ia-first-login-guide').forEach(el=>el.remove());
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
   explanation.textContent='عداد تراكمي يشمل رصيدًا افتتاحيًا قدره ٦٬٥٠٠ إضافة إلى المتصفحات المسجّلة؛ وليس إحصاءً موثقًا لأشخاص فريدين.';
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
