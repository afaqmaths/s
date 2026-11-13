/* Afaq Math v10 — football matchday, Oman and Real Madrid priority, original A4 image poster */
'use strict';
const footV10={filter:'all'};
const footFilters=[['all','جميع المباريات'],['oman','🇴🇲 المنتخب العُماني'],
 ['madrid','⚪ ريال مدريد'],['champions','🏆 دوري الأبطال'],
 ['laliga','🇪🇸 الدوري الإسباني'],['gulf','🌙 الخليج والعرب'],['national','🌍 المنتخبات']];
const footEsc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const footNum=x=>new Intl.NumberFormat('ar-OM',{maximumFractionDigits:2}).format(Number(x)||0);
const footT=m=>(String(m.home||'')+' '+String(m.away||'')).toLowerCase();
const footL=m=>String(m.league||'').toLowerCase();
const footNationalOman=m=>[m.home,m.away].some(x=>/^(oman|oman national team|عمان|عُمان|سلطنة عمان)$/i.test(String(x||'').trim()));
function footPriority(m){
 if(Number.isInteger(Number(m.priority)))return Number(m.priority);
 if(footNationalOman(m))return 1;
 if(/real madrid|ريال مدريد/.test(footT(m)))return 2;
 if(/champions league|دوري أبطال أوروبا/.test(footL(m)))return 3;
 if(/afc|gulf|arab|asian|خليج|عرب|آسيا/.test(footL(m)))return 4;
 if(/la liga|primera|spanish/.test(footL(m)))return 5;
 return 20;
}
function footAll(){
 if(typeof v9EnsureMatches==='function')v9EnsureMatches();
 const d=V9_MATCHES.data;
 return d?.date===v9Date()&&Array.isArray(d.matches)?d.matches.slice().sort((a,b)=>
  footPriority(a)-footPriority(b)||String(a.utc_start||'').localeCompare(String(b.utc_start||''))):[];
}
function footIs(m,filter){
 if(filter==='oman')return footNationalOman(m);
 if(filter==='madrid')return /real madrid|ريال مدريد/.test(footT(m));
 if(filter==='champions')return /champions league|دوري الأبطال/.test(footL(m));
 if(filter==='laliga')return /la liga|primera|spanish/.test(footL(m));
 if(filter==='gulf')return /gulf|afc|arab|asia|saudi|qatar|oman|bahrain|emirates|kuwait|خليج|عرب|آسيا/.test(footL(m));
 if(filter==='national')return /qualification|qualifier|world cup|nations|asian cup|arab cup|euro|تصفيات|منتخبات/.test(footL(m));
 return true;
}
function footSelected(){return footAll().filter(x=>footIs(x,footV10.filter))}
function footTag(m){
 const n=footPriority(m);
 return n===1?'🇴🇲 المنتخب العماني':n===2?'⚪ ريال مدريد':n===3?'🏆 دوري أبطال أوروبا':
 n===4?'🌙 بطولة عربية أو آسيوية':n===5?'🇪🇸 الدوري الإسباني':'⚽ مباراة اليوم';
}
function footDate(){
 return new Intl.DateTimeFormat('ar-OM',{timeZone:'Asia/Muscat',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());
}
function footCard(m){
 const score=m.home_score!=null&&m.away_score!=null?
 footNum(m.home_score)+' — '+footNum(m.away_score):'VS';
 return '<article class="foot-v10-game'+(footPriority(m)<=2?' featured':'')+'">'+
 '<header><span>'+footEsc(m.league||'بطولة كرة القدم')+'</span><small>'+footTag(m)+'</small></header>'+
 '<div class="foot-v10-clubs"><strong>'+footEsc(m.home)+'</strong><span>'+score+'</span><strong>'+footEsc(m.away)+'</strong></div>'+
 '<footer><span>🕒 '+footEsc(v9MatchTime(m))+'</span><span>'+footEsc(m.status||'المواعيد المتاحة من المصدر')+'</span></footer></article>';
}
function footFavorite(label,icon,match){
 return '<div class="foot-v10-favorite"><span>'+icon+' '+label+'</span><b>'+
 (match?footEsc(match.home)+' × '+footEsc(match.away):'لم تُرجع التغذية مباراة مؤكدة اليوم')+'</b></div>';
}
function footPage(){
 if(typeof v9EnsureMatches==='function')v9EnsureMatches();
 const data=V9_MATCHES.data,all=footAll(),rows=footSelected(),
 oman=all.find(x=>footIs(x,'oman')),madrid=all.find(x=>footIs(x,'madrid'));
 return '<div class="container foot-v10-page" dir="rtl"><section class="foot-v10-hero">'+
 '<img src="assets/afaq-football-stadium-v10.svg?v=20261113-v10" width="900" height="470" alt="ملعب كرة قدم ولاعبون وكرة تحت الأضواء" loading="lazy">'+
 '<div class="foot-v10-title"><span>FOOTBALL • MATCH DAY</span><h1>مباريات اليوم</h1>'+
 '<p>'+footDate()+' | بتوقيت سلطنة عُمان</p>'+
 '<div class="foot-v10-favorites">'+footFavorite('منتخب سلطنة عمان','🇴🇲',oman)+
 footFavorite('ريال مدريد','⚪',madrid)+'</div></div></section>'+
 '<div class="foot-v10-actions">'+
 '<button type="button" id="footPrint">🖨️ طباعة ملصق A4</button>'+
 '<button type="button" id="footPNG">🖼️ تنزيل ملصق PNG</button>'+
 '<button type="button" id="footSVG">⬇️ تنزيل ملصق SVG</button>'+
 '<button type="button" id="v9RefreshMatches">↻ تحديث الجدول</button></div>'+
 '<nav class="foot-v10-filters">'+footFilters.map(([key,label])=>
 '<button type="button" data-foot-filter="'+key+'" class="'+(footV10.filter===key?'selected':'')+'">'+label+'</button>').join('')+'</nav>'+
 (V9_MATCHES.loading?'<p class="foot-v10-message">جارٍ جلب مباريات اليوم...</p>':'')+
 (rows.length?'<div class="foot-v10-grid">'+rows.map(footCard).join('')+'</div>':
 '<section class="foot-v10-empty"><span>⚽</span><h2>لا توجد مباريات مؤكدة في التغطية المتاحة لهذا التحديد</h2>'+
 '<p>التغذية المجانية لا تشمل جميع مباريات البطولات، لذا فإن عدم ظهور مباراة لا يعني بالضرورة عدم وجودها.</p></section>')+
 '<p class="foot-v10-credits">المصدر: TheSportsDB (تغطية مجانية جزئية). تُعرض النتائج والمواعيد التي يوفرها المصدر فقط؛ لا تُنشأ مباريات افتراضية. تتحدث المعلومات دوريًا وتتغير بتاريخ اليوم في عُمان.</p>'+
 '<a class="foot-v10-source" href="https://www.thesportsdb.com/" target="_blank" rel="noopener noreferrer">التحقق من المصدر الرياضي</a></div>';
}
const footOldGeneric=genericSection;
genericSection=function(page){return page==='matches_today'?footPage():footOldGeneric(page)};
function footHomePromo(){
 return '<section class="foot-v10-promo" aria-label="ملصق مباريات اليوم">'+
 '<img src="assets/afaq-football-stadium-v10.svg?v=20261113-v10" alt="ملعب كرة قدم ليلي مضاء" width="900" height="470" loading="lazy">'+
 '<div><span>⚽ كُرة القدم والرياضة</span><h2>مباريات اليوم بملصق جميل</h2>'+
 '<p>المنتخب العُماني • ريال مدريد • دوري أبطال أوروبا • الدوري الإسباني • البطولات الخليجية</p>'+
 '<button type="button" data-route="matches_today">مباريات اليوم وملصق A4</button></div></section>';
}
/* A4 sports artwork generated from real returned events — not screenshots or fake schedules. */
function footPosterSVG(){
 const entries=footSelected().slice(0,9);
 const category=footFilters.find(x=>x[0]===footV10.filter)?.[1]||'جميع المباريات';
 const rows=entries.map((m,i)=>{
  const y=590+i*108,bg=i%2?'#f0f6fa':'#ffffff';
  const text=footEsc(String(m.home).slice(0,32)+'   ×   '+String(m.away).slice(0,32));
  return '<g><rect x="74" y="'+y+'" width="1092" height="98" rx="16" fill="'+bg+'"/>'+
  '<rect x="74" y="'+y+'" width="11" height="98" rx="5" fill="'+(footPriority(m)<=2?'#e7b454':'#279a9b')+'"/>'+
  '<text x="1117" y="'+(y+29)+'" text-anchor="end" font-size="21" fill="#598398">'+footEsc(m.league||'كرة القدم')+'</text>'+
  '<text x="1117" y="'+(y+70)+'" text-anchor="end" font-weight="bold" font-size="29" fill="#183e66">'+text+'</text>'+
  '<text x="114" y="'+(y+66)+'" text-anchor="start" font-size="23" fill="#207987">'+footEsc(v9MatchTime(m))+'</text></g>';
 }).join('');
 const none=entries.length?'':'<text x="620" y="705" font-size="35" text-anchor="middle" fill="#345a73">'+
 'لا تتوفر مباريات مؤكدة في المصدر لهذا التحديد</text>'+
 '<text x="620" y="770" font-size="23" text-anchor="middle" fill="#678292">لم تُنشأ مواعيد افتراضية في الملصق</text>';
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1240 1754" width="1240" height="1754" aria-label="ملصق مباريات اليوم">'+
 '<defs><linearGradient id="sky" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#071a46"/><stop offset="1" stop-color="#206c90"/></linearGradient></defs>'+
 '<rect width="1240" height="1754" fill="#e7eef5"/>'+
 '<rect x="0" y="0" width="1240" height="478" fill="url(#sky)"/>'+
 '<g opacity=".3" fill="none" stroke="#8fddde" stroke-width="7"><path d="M0 382Q620 210 1240 382"/><ellipse cx="620" cy="442" rx="240" ry="48"/></g>'+
 '<circle cx="620" cy="273" r="108" fill="#fff" stroke="#d8efff" stroke-width="7"/>'+
 '<path d="M620 222 659 247 645 303H595L581 247Z" fill="#193b6b"/>'+
 '<path d="M540 218 585 198 600 223 572 245ZM705 218 667 198 650 223 678 245ZM550 326 582 294 602 320 585 351ZM690 328 660 298 637 324 657 359Z" fill="#193b6b"/>'+
 '<g font-family="Tahoma,Arial,sans-serif" text-anchor="middle"><text x="620" y="73" fill="#d8f3ff" font-size="28">آفاق ماث | Afaq Math</text>'+
 '<text x="620" y="140" fill="white" font-size="70" font-weight="bold">مباريات اليوم</text>'+
 '<text x="620" y="198" fill="#ffe6af" font-size="28">'+footEsc(footDate())+'</text></g>'+
 '<rect x="74" y="495" width="1092" height="67" rx="19" fill="#d9ecee"/>'+
 '<text x="620" y="538" text-anchor="middle" font-size="28" font-weight="bold" fill="#245e79">'+footEsc(category)+' — توقيت سلطنة عُمان</text>'+
 '<g font-family="Tahoma,Arial,sans-serif">'+rows+none+'</g>'+
 '<rect x="0" y="1585" width="1240" height="169" fill="#fff"/>'+
 '<g fill="#527385" font-family="Tahoma,Arial,sans-serif" text-anchor="middle"><text x="620" y="1630" font-size="22">البيانات من تغذية TheSportsDB المجانية؛ قد لا تشمل جميع المباريات.</text>'+
 '<text x="620" y="1675" font-size="21">تصميم وإشراف: منصة آفاق ماث • سلطنة عمان</text></g>'+
 '<rect x="0" y="1710" width="1240" height="44" fill="#123f72"/>'+
 '<text x="620" y="1741" text-anchor="middle" fill="white" font-size="20" font-family="Tahoma,Arial,sans-serif">ملصق كروي متجدد بتوقيت عُمان</text></svg>';
}
function footSave(blob,extension){
 const a=document.createElement('a'),url=URL.createObjectURL(blob);
 a.href=url;a.download='afaq-math-matches-'+v9Date()+'.'+extension;
 document.body.appendChild(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),7000);
}
function footSaveSVG(){
 footSave(new Blob([footPosterSVG()],{type:'image/svg+xml;charset=utf-8'}),'svg');
}
function footSavePNG(){
 const blob=new Blob([footPosterSVG()],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob),img=new Image();
 img.onload=()=>{
  try{const canvas=document.createElement('canvas');canvas.width=1240;canvas.height=1754;
   const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,1240,1754);
   ctx.drawImage(img,0,0);
   canvas.toBlob(res=>res?footSave(res,'png'):footSaveSVG(),'image/png');
  }catch(err){console.warn(err);footSaveSVG()}
  finally{URL.revokeObjectURL(url)}
 };
 img.onerror=()=>{URL.revokeObjectURL(url);window.alert('تعذر تنزيل PNG. استخدم SVG أو الطباعة.')};
 img.src=url;
}
function footPrintPoster(){
 const win=window.open('','_blank');if(!win){window.alert('اسمح بفتح نافذة الطباعة.');return}
 win.document.open();
 win.document.write('<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>مباريات اليوم — آفاق ماث</title>'+
 '<style>@page{size:A4 portrait;margin:0}html,body{margin:0;background:#fff}svg{display:block;width:210mm;height:297mm;margin:auto;max-width:100%}</style>'+
 '</head><body>'+footPosterSVG()+'</body></html>');
 win.document.close();win.onload=()=>{win.focus();win.print()};
}
const footPreviousAttach=attach;
attach=function(){
 footPreviousAttach();
 document.getElementById('footPrint')?.addEventListener('click',footPrintPoster);
 document.getElementById('footPNG')?.addEventListener('click',footSavePNG);
 document.getElementById('footSVG')?.addEventListener('click',footSaveSVG);
 document.querySelectorAll('[data-foot-filter]').forEach(el=>el.addEventListener('click',()=>{
  footV10.filter=el.dataset.footFilter;render();
 }));
};
