/* Afaq Math unified home artwork — Nov 2026.
   One golden hero, original blue text and live light lines, fully integrated
   lesson illustrations and relocated national-value card. No added adjacent hero image. */
'use strict';

const afaqIllustratedLessons = [
  ['numbers','الأعداد والعمليات','جمع • طرح • ضرب','right'],
  ['divide','القسمة والمضاعفات','قسمة • عوامل','right'],
  ['fractions','الكسور والعشريات','كسور • تقريب','right'],
  ['primes','الأعداد الأولية','فردي • زوجي','right'],
  ['algebra','الأنماط والجبر','متتاليات • معادلات','right'],
  ['percent','النسب والتناسب','نسب مئوية','right'],
  ['data','البيانات والاحتمال','جداول • مخططات','right'],
  ['solid','الأشكال والمجسمات','أوجه • أحرف • رؤوس','left'],
  ['nets','الشبكات والمقاطع','شبكات المجسمات','left'],
  ['angles','المثلثات والزوايا','زوايا • مضلعات','left'],
  ['coords','الإحداثيات والانسحاب','شبكات • إحداثيات','left'],
  ['area','المحيط والمساحة والحجم','قياس الأشكال','left'],
  ['clock','القياس والزمن','طول • كتلة • وقت','left']
];
const afaqSymbolArt = {
 numbers:'<text x="32" y="25" text-anchor="middle" font-size="20" font-weight="900" fill="#2368a3">7 + 5</text><text x="32" y="50" text-anchor="middle" font-size="21" font-weight="900" fill="#cf8c2c">= 12</text>',
 divide:'<text x="32" y="42" text-anchor="middle" font-size="25" font-weight="900" fill="#176fa1">24 ÷ 4</text>',
 fractions:'<path d="M12 32H52" stroke="#1e79ac" stroke-width="3"/><text x="32" y="27" text-anchor="middle" font-size="23" font-weight="900" fill="#1e79ac">3</text><text x="32" y="58" text-anchor="middle" font-size="23" font-weight="900" fill="#c18022">4</text>',
 primes:'<circle cx="30" cy="31" r="25" fill="#def1fc" stroke="#3585ba" stroke-width="3"/><text x="30" y="42" text-anchor="middle" font-size="30" font-weight="900" fill="#296e9f">7</text>',
 algebra:'<text x="31" y="43" text-anchor="middle" font-size="29" font-weight="900" fill="#397eb0">x²</text>',
 percent:'<text x="32" y="43" text-anchor="middle" font-size="27" font-weight="900" fill="#b97926">%</text>',
 data:'<path d="M10 52V13M10 52H55" fill="none" stroke="#4c7893" stroke-width="3"/><rect x="17" y="29" width="9" height="23" rx="2" fill="#39b9a0"/><rect x="30" y="18" width="9" height="34" rx="2" fill="#e9a345"/><rect x="43" y="35" width="9" height="17" rx="2" fill="#618cda"/>',
 solid:'<path d="M13 20L35 9L54 20L32 32Z M13 20V46L32 57V32M32 32L54 20V47L32 57" stroke="#2677ab" stroke-width="2.4" stroke-linejoin="round" fill="#90d5e9"/><path d="M13 20L32 32L54 20" fill="none" stroke="#fff" stroke-width="2"/>',
 nets:'<g fill="#a7e1e4" stroke="#2989a2" stroke-width="2"><rect x="22" y="10" width="19" height="19"/><rect x="22" y="30" width="19" height="19"/><rect x="2" y="30" width="19" height="19"/><rect x="42" y="30" width="19" height="19"/><rect x="22" y="50" width="19" height="12"/></g>',
 angles:'<path d="M7 54L32 10L58 54Z" fill="#ffdda2" stroke="#cc8a38" stroke-width="3"/><path d="M21 54A15 15 0 0 1 13 40" fill="none" stroke="#2089a5" stroke-width="3"/>',
 coords:'<path d="M10 54V6M7 48H57" stroke="#547e99" stroke-width="3"/><path d="M14 46L29 29L43 36L56 14" fill="none" stroke="#e08048" stroke-width="4"/><circle cx="29" cy="29" r="4" fill="#eb8c36"/>',
 area:'<rect x="8" y="16" width="45" height="36" rx="2" fill="#a8e5b3" stroke="#319c65" stroke-width="3"/><path d="M23 16V52M38 16V52M8 34H53" stroke="#fff" stroke-width="2.5"/>',
 clock:'<circle cx="32" cy="32" r="25" fill="#ecf8ff" stroke="#3178ac" stroke-width="3"/><path d="M32 14V32L46 40" fill="none" stroke="#bf862e" stroke-width="4" stroke-linecap="round"/>'
};
function afaqLessonIcon(kind) {
 return '<svg viewBox="0 0 64 64" width="58" height="58" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">'+(afaqSymbolArt[kind]||afaqSymbolArt.numbers)+'</svg>';
}
function afaqLessonGallery(side) {
 return '<div class="afaq-lesson-gallery afaq-lesson-gallery--'+side+'" aria-label="موضوعات ودروس الرياضيات">'+
 afaqIllustratedLessons.filter(row=>row[3]===side).map(row=>
 '<div class="afaq-lesson-art"><span class="afaq-lesson-glyph">'+afaqLessonIcon(row[0])+'</span>'+
 '<span class="afaq-lesson-writing"><strong>'+row[1]+'</strong><small>'+row[2]+'</small></span></div>').join('')+
 '</div>';
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
 const insert=afaqLessonGallery('left')+afaqLessonGallery('right');
 html=html.replace('<div class="afaq-hero-content">',insert+'<div class="afaq-hero-content">'+afaqElectricBlueLines()+'<div class="afaq-center-inner">');
 html=html.replace('نتعلّم • نكتشف • نبدع — رياضيات كامبردج من المفهوم إلى التطبيق والاستدلال',
   'نتعلّم • نكتشف • نبدع — رياضيات كامبردج من الفهم إلى التطبيق والاستدلال');
 html=html.replace('<button type="button" class="hub-primary" data-route="learning">ابدأ رحلتك في الرياضيات</button></div>',
   '<p class="afaq-blue-explainer">للصفوف الخامس والسادس والسابع والثامن • دروس وأنشطة واختبارات ومسابقات تفاعلية</p>'+
   '<button type="button" class="hub-primary" data-route="learning">ابدأ رحلتك في الرياضيات</button></div></div>');
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
