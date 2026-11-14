/* Afaq Math discovery links alongside the mixer and culture/science news.
   Each card uses an existing page or existing published catalog category. */
'use strict';
const afaqFooterTopics=[
 {title:'مكتبة الاستماع والموسيقى',icon:'🎧',subtitle:'أناشيد • تلاوات • حكم • مقاطع تربوية',route:'audio',tone:'audio'},
 {title:'اليوتيوب التعليمي',icon:'youtube',subtitle:'فيديوهات وشرح مفاهيم الرياضيات',route:'library',category:'video',tone:'youtube'},
 {title:'تاريخ الرياضيات والحضارات',icon:'📜',subtitle:'تاريخ الأعداد والحضارات والعلوم',route:'library',category:'history',tone:'history'},
 {title:'الألعاب والمسابقات',icon:'🧩',subtitle:'ألغاز • منافسات • تحديات رياضية',route:'contests',tone:'games'}
];
function afaqFooterIcon(kind){
 return kind==='youtube'?
 '<svg viewBox="0 0 48 35" width="44" height="34" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">'+
 '<rect x="1" y="1" width="46" height="33" rx="9" fill="#e8262d"/>'+
 '<path d="M20 9L34 17.5 20 26Z" fill="white"/></svg>':kind;
}
function afaqFooterTile(row){
 const attr='data-route="'+row.route+'"'+(row.category?' data-afaq-library-category="'+row.category+'"':'');
 return '<button type="button" class="afaq-footer-topic afaq-footer-topic--'+row.tone+
 '" '+attr+' aria-label="فتح '+row.title+'">'+
 '<span class="afaq-footer-icon" aria-hidden="true">'+afaqFooterIcon(row.icon)+'</span>'+
 '<span class="afaq-footer-topic-text"><strong>'+row.title+'</strong><small>'+row.subtitle+'</small></span>'+
 '<span class="afaq-footer-topic-arrow" aria-hidden="true">↗</span></button>';
}
const afaqFooterOldShowcase=afaqHomeShowcase;
afaqHomeShowcase=function(){
 let html=afaqFooterOldShowcase();
 if(html.includes('class="afaq-footer-topic '))return html;
 const cards=afaqFooterTopics.map(afaqFooterTile).join('');
 const original=/(<button type="button" class="afaq-science-card"[\s\S]*?<\/button>)(<\/div>)/;
 if(original.test(html))html=html.replace(original,(_,news,closing)=>news+cards+closing);
 return html;
};
/* Set the catalog filter BEFORE the existing data-route listener opens the library. */
document.addEventListener('click',event=>{
 const el=event.target?.closest?.('[data-afaq-library-category]');
 if(el&&typeof hub!=='undefined')hub.libraryCat=el.dataset.afaqLibraryCategory;
},true);
