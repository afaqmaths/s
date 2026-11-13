/* Use the two approved generated page images as actual page artwork, never an inline chat preview.
   Preserve the real login, navigation, news and matchday controls. */
'use strict';
const afaqRealHeroBase=hubHome;
hubHome=function(){
 let markup=afaqRealHeroBase();
 const source='<img class="afaq-generated-hero" '+
 'src="assets/afaq-math-hero-20261113.webp" '+
 'alt="منصة آفاق ماث: لوحة ذهبية تعليمية تحيط باللوحة الزرقاء المركزية، وتوضح المجسمات والإحداثيات والقياس والهندسة والأعداد" '+
 'width="1672" height="941" loading="eager" fetchpriority="high">'+
 '<button type="button" class="afaq-generated-hero-action" data-route="learning">ابدأ رحلتك في الرياضيات</button>';
 markup=markup.replace('<div class="v10-hero-art" aria-hidden="true">',source+'<div class="v10-hero-art" aria-hidden="true">');
 return markup;
};
const afaqRealFootballBase=footHomePromo;
footHomePromo=function(){
 return afaqRealFootballBase().replace(
  /<img src="assets\/afaq-football-stadium-v10\.svg\?v=20261113-v10" alt="ملعب كرة قدم ليلي مضاء"/,
  '<img class="afaq-generated-football" src="assets/afaq-football-matchday-20261113.webp" data-fallback="assets/afaq-football-stadium-v10.svg?v=20261113-v10" alt="مشهد كروي واقعي داخل ملعب ممتلئ بالجمهور وتحت أضواء الكشافات"');
};
const afaqRealMatchBase=genericSection;
genericSection=function(page){
 let markup=afaqRealMatchBase(page);
 if(page==='matches_today'){
  markup=markup.replace(
   /<img src="assets\/afaq-football-stadium-v10\.svg\?v=20261113-v10" width="900" height="470"/,
   '<img class="afaq-generated-football" data-fallback="assets/afaq-football-stadium-v10.svg?v=20261113-v10" src="assets/afaq-football-matchday-20261113.webp" width="1672" height="941"');
 }
 return markup;
};
const afaqRealAttachBase=attach;
attach=function(){
 afaqRealAttachBase();
 document.querySelectorAll('.afaq-generated-hero').forEach(image=>{
  const hero=image.closest('.v10-premium-hero');
  const setReady=()=>{
   if(image.naturalWidth>0)hero?.classList.add('afaq-artwork-ready');
  };
  image.addEventListener('load',setReady,{once:true});
  image.addEventListener('error',()=>{image.hidden=true;hero?.classList.remove('afaq-artwork-ready')},{once:true});
  if(image.complete)setReady();
 });
 document.querySelectorAll('.afaq-generated-football').forEach(image=>{
  image.addEventListener('error',()=>{
   if(image.dataset.fallback&&image.src!==new URL(image.dataset.fallback,document.baseURI).href){
    image.src=image.dataset.fallback;
   }
  });
 });
};
