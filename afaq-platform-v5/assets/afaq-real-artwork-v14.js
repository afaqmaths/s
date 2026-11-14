/* Afaq Math unified home artwork — Nov 2026.
   One golden hero, original blue text and live light lines, fully integrated
   lesson illustrations and relocated national-value card. No added adjacent hero image. */
'use strict';

/* Two balanced working navigation columns for Afaq Math. Each item points to an existing page. */
const afaqHomeColumns={
 right:{
  title:'التعليم والتعلّم',
  caption:'استكشف المعرفة الرياضية',
  items:[
   ['📘','دروس الرياضيات','الأعداد والعمليات • القياس • الهندسة • البيانات','learning'],
   ['🎓','التعليم والتعلّم','الصفوف ٥–٨ • شرح وأنشطة • علاج وإثراء','learning'],
   ['📚','مكتبة آفاق ماث','تاريخ الرياضيات • العلماء • الكتب • الفيديو','library'],
   ['📝','أوراق العمل والمهام','واجبات • تدريبات • نماذج إجابة','work'],
   ['🧠','بنك الأسئلة','فهم • تطبيق • استدلال • تدريبات','question_bank'],
   ['🎯','التقويم والاختبارات','تشخيصي • اختبارات • تغذية راجعة','adaptive'],
   ['💡','مبادرات الأستاذ سعيد','خلاط الرياضيات • ي/أ • المفتاح للقسمة','teaching_initiatives']
  ]
 },
 left:{
  title:'المرح والمسابقات',
  caption:'تعلّم باللعب والمنافسة',
  items:[
   ['🎭','المرح والتسلية','ألغاز رياضية • كاريكاتير • قصص','fun'],
   ['🎮','الألعاب التفاعلية','ألعاب الأعداد والقياس والهندسة','games'],
   ['🧩','الألعاب والمسابقات','تحديات وأنشطة ومسابقات متنوعة','contests'],
   ['🏆','مسابقة نجوم آفاق الرياضيات','بوابة المسابقة والمراحل والجوائز',null,'competition.html'],
   ['⚽','مباريات اليوم','المباريات والمواعيد بتوقيت عُمان','matches_today'],
   ['💬','الدعم والتواصل','اقتراحات • استفسارات • متابعة الرسائل','support']
  ]
 }
};
function afaqContactSymbol(kind){
 if(kind==='whatsapp')return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><path d="M21 11.6a8.9 8.9 0 0 1-13.5 7.7L3 21l1.6-4.5A8.9 8.9 0 1 1 21 11.6Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.2 7.5c-.5.4-.8 1.1-.7 1.9.1 1.9 2.9 5.2 5.4 6.3 1.4.6 2.2.4 2.8-.2l.9-1.2-2.9-1.3-.9 1c-1.4-.5-2.8-1.9-3.5-3.3l1-1-1.4-2.8-.7.6Z" fill="currentColor"/></svg>';
 return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><rect x="3.1" y="3.1" width="17.8" height="17.8" rx="5.1" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.6" cy="6.6" r="1.2" fill="currentColor"/></svg>';
}
function afaqContactLinks(){
 return '<div class="afaq-column-contact" aria-label="التواصل المباشر">'+
 '<span class="afaq-contact-title">التواصل المباشر</span>'+
 '<a class="afaq-contact-link afaq-contact-whatsapp" href="https://wa.me/96897414000" target="_blank" rel="noopener noreferrer" aria-label="التواصل عبر واتساب على 0096897414000">'+afaqContactSymbol('whatsapp')+'<span><strong>واتساب</strong><small dir="ltr">0096897414000</small></span></a>'+
 '<a class="afaq-contact-link afaq-contact-instagram" href="https://www.instagram.com/afaq.om/" target="_blank" rel="noopener noreferrer" aria-label="متابعة حساب إنستغرام AFAQ.OM">'+afaqContactSymbol('instagram')+'<span><strong>إنستغرام</strong><small dir="ltr">AFAQ.OM</small></span></a>'+
 '</div>';
}
function afaqPortalButton(item){
 const [icon,title,description,route,href]=item;
 const link=!!href,tag=link?'a':'button';
 const attr=link?'href="'+href+'"':'type="button" data-route="'+route+'"';
 return '<'+tag+' class="afaq-nav-row" '+attr+' aria-label="'+title+'">'+
 '<span class="afaq-nav-icon" aria-hidden="true">'+icon+'</span>'+
 '<span class="afaq-nav-copy"><strong>'+title+'</strong><small>'+description+'</small></span>'+
 '<span class="afaq-nav-arrow" aria-hidden="true">↗</span></'+tag+'>';
}
function afaqLessonGallery(side){
 const column=afaqHomeColumns[side];
 return '<nav class="afaq-navigation-column afaq-navigation-column--'+side+'" aria-label="'+column.title+'">'+
 '<header class="afaq-nav-heading"><strong>'+column.title+'</strong><span>'+column.caption+'</span></header>'+
 '<div class="afaq-nav-items">'+column.items.map(afaqPortalButton).join('')+'</div>'+
 (side==='left'?afaqContactLinks():'')+'</nav>';
}
function afaqElectricBlueLines(){
 return '<svg class="afaq-blue-energy" viewBox="0 0 600 440" preserveAspectRatio="none" aria-hidden="true" focusable="false">'+
 '<path d="M-55 180C90 15 130 390 285 190S530 35 660 190"/>'+
 '<path d="M-45 260C75 90 205 390 325 225S510 100 660 260"/>'+
 '<path d="M-50 325C115 180 180 440 345 260S540 185 650 310"/>'+
 '<path d="M-20 120C115 10 220 250 360 110S525 20 645 126"/>'+
 '</svg>';
}
const afaqIntegratedHomeBase=hubHome;
hubHome=function(){
 let html=afaqIntegratedHomeBase();
 /* Remove the superseded 2026-11-13 standalone SVG and its redundant CTA. */
 html=html.replace(/<img class="afaq-generated-hero"[\s\S]*?<button type="button" class="afaq-generated-hero-action"[^>]*>[\s\S]*?<\/button>/,'');
 html=html.replace(/<div class="v10-hero-art"[\s\S]*?<\/div>/,'');
 /* Move (not duplicate) the real clickable national-values card from the footer showcase. */
 const cardMatch=html.match(/<button type="button" class="afaq-national-card"[\s\S]*?<\/button>/);
 if(cardMatch) html=html.replace(cardMatch[0],'');
 const national=cardMatch?'<div class="afaq-hero-national">'+cardMatch[0].replace('✦ قيمة وطنية','🇴🇲 قيمي و اعتزازي بوطنيتي')+'</div>':'';
 /* Place the preserved-size value card to the LEFT of the moving flag-colour
    strip, in a shared top row OUTSIDE and ABOVE the blue mathematics panel. */
 const topRibbon='<div class="v9-oman-horizon" data-national-ribbon="true">';
 const heroStart='<section class="hub-banner afaq-animated-hero v10-premium-hero"';
 if(html.includes(topRibbon)&&html.includes(heroStart)){
  html=html.replace(topRibbon,'<div class="afaq-national-top-row" aria-label="القيم الوطنية وألوان العلم العماني">'+topRibbon);
  html=html.replace(heroStart,national+'</div>'+heroStart);
 }
 const signatureMatch=html.match(/<div class="v10-teacher-signature">[\s\S]*?<\/div>/);
 const signature=signatureMatch?signatureMatch[0]:'';
 if(signatureMatch)html=html.replace(signatureMatch[0],'');
 const insert=afaqLessonGallery('left')+afaqLessonGallery('right');
 html=html.replace('<div class="afaq-hero-content">',insert+'<div class="afaq-hero-content">'+afaqElectricBlueLines()+'<div class="afaq-center-inner">');
 html=html.replace('نتعلّم • نكتشف • نبدع — رياضيات كامبردج من المفهوم إلى التطبيق والاستدلال',
   'نتعلّم • نكتشف • نبدع — رياضيات كامبردج من الفهم إلى التطبيق والاستدلال');
 html=html.replace('<button type="button" class="hub-primary" data-route="learning">ابدأ رحلتك في الرياضيات</button></div>',
   '<p class="afaq-blue-explainer">للصفوف الخامس والسادس والسابع والثامن • دروس وأنشطة واختبارات ومسابقات تفاعلية</p>'+
   '<button type="button" class="hub-primary" data-route="learning">ابدأ رحلتك في الرياضيات</button></div>'+signature+'</div>');
 return html;
};
/* One image-backed stadium banner; no split image next to a blue information box. */
footHomePromo=function(){
 return '<section class="foot-v10-promo afaq-stadium-banner" aria-label="مباريات اليوم" role="region">'+
 '<div class="afaq-stadium-message"><span>⚽ أجواء المنافسات الرياضية</span>'+
 '<h2>مباريات اليوم</h2>'+
 '<p>المنتخب العُماني • ريال مدريد • دوري أبطال أوروبا • الدوري الإسباني • البطولات الخليجية</p>'+
 '<button type="button" data-route="matches_today">عرض المباريات والمواعيد</button></div>'+
 '<span class="afaq-stadium-photo-credit">تصوير: Jonathan Petersson — CC0</span>'+
 '</section>';
};
const afaqStadiumPageBase=genericSection;
genericSection=function(page){
 let html=afaqStadiumPageBase(page);
 if(page==='matches_today'){
  /* Keep every original match filter, date, schedule and download control. */
  html=html.replace(/<img class="afaq-generated-football"[\s\S]*?>/,'');
 }
 return html;
};
