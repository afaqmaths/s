/* Afaq Math v13: four separate, verified-source headline tickers distributed between homepage sections */
'use strict';
const v13Types={
 general:{label:'الأخبار العامة والوطنية',emoji:'🌍',group:['world'],url:'https://feeds.bbci.co.uk/arabic/rss.xml',source:'BBC عربي',theme:'general'},
 sport:{label:'الأخبار الرياضية',emoji:'⚽',group:['sport'],url:'https://www.bbc.com/sport',source:'BBC Sport',theme:'sport'},
 business:{label:'المال والأعمال',emoji:'💼',group:['business'],url:'https://www.bbc.com/news/business',source:'BBC News',theme:'business'},
 science:{label:'العلم والثقافة والتكنولوجيا',emoji:'🔬',group:['science','technology','culture'],url:'https://www.bbc.com/news/technology',source:'BBC News',theme:'science'}
};
const v13Escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const v13SafeUrl=url=>/^https:\/\/[a-z0-9.-]+(?:[/?#]|$)/i.test(String(url||''))?String(url):null;
function v13Headlines(type){
 const conf=v13Types[type];
 if(!conf)return '';
 if(typeof aeEnsureNews==='function')aeEnsureNews();
 const data=aeState.news,items=Array.isArray(data?.items)?data.items.filter(x=>conf.group.includes(x.category)):[];
 const unique=new Set();
 const headlines=items.filter(x=>{
  if(!x?.title||!v13SafeUrl(x.url))return false;
  const key=String(x.title).trim().toLowerCase();
  if(unique.has(key))return false;
  unique.add(key);return true;
 }).sort((a,b)=>(Date.parse(b.published_at)||0)-(Date.parse(a.published_at)||0)).slice(0,type==='science'?9:6);
 const links=headlines.map(item=>{
  const label=type==='science'?({'science':'علم','technology':'تكنولوجيا','culture':'ثقافة'}[item.category]||'أخبار'):'';
  return '<span class="v13-headline"><a href="'+v13Escape(item.url)+'" target="_blank" rel="noopener noreferrer"'+
  ' title="'+v13Escape(item.source||conf.source)+'">'+
  (label?'<b>'+v13Escape(label)+'</b> ':'')+v13Escape(item.title)+'</a>'+
  '<small>'+v13Escape(item.source||conf.source)+'</small></span>';
 });
 if(type==='general')links.unshift('<span class="v13-headline v13-omani-source">'+
  '<a href="https://omannews.gov.om" target="_blank" rel="noopener noreferrer">🇴🇲 أحدث الأخبار الوطنية من وكالة الأنباء العُمانية</a>'+
  '<small>رابط المصدر الوطني</small></span>');
 if(!headlines.length)links.push('<span class="v13-headline v13-headline-fallback">'+
  '<a href="'+v13Escape(conf.url)+'" target="_blank" rel="noopener noreferrer">'+
  'الاطلاع على الأخبار من المصدر</a><small>'+(aeState.newsBusy?'جارٍ تحديث العناوين':'لا تتوفر عناوين مباشرة حاليًا')+'</small></span>');
 const time=data?.updated_at&&Number.isFinite(Date.parse(data.updated_at))?
  new Intl.DateTimeFormat('ar-OM',{timeZone:'Asia/Muscat',hour:'2-digit',minute:'2-digit'}).format(new Date(data.updated_at)):'';
 const markup=links.join('<span class="v13-headline-separator" aria-hidden="true">✦</span>');
 return '<aside class="v13-news-rail v13-news-rail--'+conf.theme+'" dir="rtl" aria-label="'+conf.label+'">'+
  '<span class="v13-news-title">'+conf.emoji+' '+conf.label+'</span>'+
  '<div class="v13-headlines-viewport"><div class="v13-headlines-track">'+
  '<div class="v13-headlines-set">'+markup+'</div>'+
  '<div class="v13-headlines-set" aria-hidden="true">'+markup+'</div></div></div>'+
  (time?'<span class="v13-news-timestamp" title="آخر طلب للمصدر">تحديث '+v13Escape(time)+'</span>':'')+
  '</aside>';
}
const v13BaseHome=hubHome;
hubHome=function(){
 let html=v13BaseHome();
 const anchors=[
  ['<section class="hub-main afaq-home-access">','general'],
  ['<section class="hub-main afaq-home-sections">','sport'],
  ['<section class="v10-init-home"','business'],
  ['<section class="afaq-home-showcase"','science']
 ];
 for(const [anchor,group] of anchors){
  if(html.includes(anchor))html=html.replace(anchor,v13Headlines(group)+anchor);
 }
 return html;
};
/* Existing aeLoadNews makes a no-store request each fresh page load.
   In an open tab, fetch new public headlines at a moderate three-minute cadence. */
if(typeof window!=='undefined'&&typeof window.setInterval==='function')
 window.setInterval(()=>{
  if(state.page==='home'&&typeof aeLoadNews==='function'&&!aeState.newsBusy)aeLoadNews(true);
 },180000);
