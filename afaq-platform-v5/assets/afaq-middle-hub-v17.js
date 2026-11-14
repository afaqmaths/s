/* AFAQMATHS — unified three-column middle area.
   Right: vertical entry choices. Center: teacher initiatives. Left: exploration.
   Existing login and navigation actions are preserved exactly. */
'use strict';
const afaqMidPreviousHome=hubHome;

function afaqMidTeacherPortal(){
 const activities=[
  ['✖️','المضاعفات الصفرية والموجبة','اكتشف رتب المضاعفات','afaq_multiples'],
  ['🔎','غربال الأعداد الأولية','من ١ إلى ١٠٠ بخطوات ملوّنة','afaq_prime_sieve'],
  ['🎛️','خلاط الرياضيات','تدريبات تفاعلية وتحديات','mixer'],
  ['🔑','المفتاح للقسمة','مبادرة لفهم القسمة المطوّلة','division_key']
 ];
 const buttons=activities.map(([icon,title,description,route])=>
   '<button type="button" class="afaq-mid-initiative-link" data-route="'+route+'" aria-label="فتح '+title+'">'+
   '<span class="afaq-mid-initiative-icon" aria-hidden="true">'+icon+'</span>'+
   '<span class="afaq-mid-initiative-copy"><strong>'+title+'</strong><small>'+description+'</small></span>'+
   '<span class="afaq-mid-initiative-arrow" aria-hidden="true">↗</span></button>'
 ).join('');
 return '<section class="afaq-mid-initiative-feature" aria-label="مبادرات الأستاذ سعيد البريكي">'+
  '<header class="afaq-mid-initiative-head">'+
   '<span class="afaq-mid-initiative-kicker">✦ بصمة تعليمية مبتكرة ✦</span>'+
   '<h2>مبادرات الأستاذ سعيد البريكي</h2>'+
   '<p>أفكار وتجارب رياضية تفاعلية تساعد الطالب على الفهم والتطبيق والاستدلال.</p>'+
  '</header>'+
  '<div class="afaq-mid-initiative-motif" aria-hidden="true">'+
   '<span>٦ × ٠ = ٠</span><span>٢ • ٣ • ٥ • ٧</span><span>△ □ ◇</span>'+
  '</div>'+
  '<div class="afaq-mid-initiative-links">'+buttons+'</div>'+
  '<button type="button" class="afaq-mid-initiative-primary" data-route="teaching_initiatives">✦ استكشف جميع مبادرات الأستاذ سعيد</button>'+
  '<p class="afaq-mid-initiative-policy">تخضع مشاهدة المبادرات لحالة الإظهار أو الإذن التي يحددها المشرف الرئيسي.</p>'+
  '</section>';
}
hubHome=function(){
 let html=afaqMidPreviousHome();
 if(html.includes('class="afaq-mid-layout"'))return html;
 const accessMatch=html.match(/<section class="hub-main afaq-home-access"[^>]*>[\s\S]*?<\/section>/);
 const sectionsMatch=html.match(/<section class="hub-main afaq-home-sections"[^>]*>[\s\S]*?<\/section>/);
 const oldTeaserMatch=html.match(/<section class="v10-init-home\b[^"]*"[^>]*>[\s\S]*?<\/section>/);
 if(!accessMatch||!sectionsMatch||!oldTeaserMatch)return html;
 const access=accessMatch[0],sections=sectionsMatch[0],teaser=oldTeaserMatch[0];
 // Remove only the old standalone sections. News rails, hero, counter and footer stay intact.
 html=html.replace(sections,'').replace(teaser,'');
 const mid='<div class="afaq-mid-layout" dir="rtl" aria-label="طرق الدخول والمبادرات وأقسام آفاق ماث">'+
  '<div class="afaq-mid-side afaq-mid-side--right">'+access+'</div>'+
  '<div class="afaq-mid-center">'+afaqMidTeacherPortal()+'</div>'+
  '<div class="afaq-mid-side afaq-mid-side--left">'+sections+'</div>'+
  '</div>';
 return html.replace(access,mid);
};
