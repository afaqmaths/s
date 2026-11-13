/* Afaq Math v10 — premium dark blue identity, hero imagery, meaningful first-page content */
'use strict';
const idPreviousHome=hubHome;
hubHome=function(){
 let html=idPreviousHome();
 const art='<div class="v10-hero-art" aria-hidden="true">'+
  '<img class="v10-hero-solid" src="assets/afaq-hero-3d-v10.svg?v=20261113-v10" width="560" height="560" alt="">'+
  '<img class="v10-hero-plane" src="assets/afaq-hero-coordinate-v10.svg?v=20261113-v10" width="570" height="540" alt=""></div>';
 html=html.replace(/<div class="v9-maths-forms"[\s\S]*?<\/div><div class="v9-coordinate-forms"[\s\S]*?<\/div>/,art);
 html=html.replace('<section class="hub-banner afaq-animated-hero"',
  '<section class="hub-banner afaq-animated-hero v10-premium-hero"');
 html=html.replace('</section><section class="hub-intro-panel">',
  '<div class="v10-teacher-signature">✦ من إعداد وإشراف الأستاذ سعيد البريكي • الرياضيات حياة وإبداع</div>'+
  '</section><section class="hub-intro-panel">');
 html=html.replace('<section class="hub-main afaq-home-sections">',
  footHomePromo()+'<section class="hub-main afaq-home-sections">');
 html=html.replace('<section class="afaq-home-showcase"',
  initHome()+'<section class="afaq-home-showcase"');
 return html;
};
/* The matchday illustration is featured once; omit the duplicated tiny tile. */
const idOldShowcase=afaqHomeShowcase;
afaqHomeShowcase=function(){
 return idOldShowcase().replace(/<button[^>]*v9-match-shortcut[^>]*>[\s\S]*?<\/button>/,'');
};
/* In teaching area also expose the user's unique mnemonic initiative. */
const idOldLearning=learning;
learning=function(){
 return idOldLearning()+'<section class="v10-teaching-initiative">'+
 '<div><b>✦ مبادرتان رياضيتان مميزتان</b><h2>ي / أ للأشكال — والمفتاح للقسمة</h2>'+
 '<p>انتقل من انسحاب النقاط والأضلاع والمضلعات إلى القسمة المطوّلة بخطوات المنازل ومفتاح الفاصلة العشرية.</p></div>'+
 '<div class="v11-teaching-actions"><button type="button" data-route="coordinate_ya">📐 تجربة ي / أ للأشكال</button>'+
 '<button type="button" data-route="division_key">🔑 المفتاح للقسمة المطوّلة</button></div></section>';
};
