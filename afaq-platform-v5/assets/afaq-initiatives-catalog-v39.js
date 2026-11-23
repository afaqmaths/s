/* Afaq Math • full-width scientific initiatives and supervisor-managed community/gallery/youtube initiatives. */
(function(){
'use strict';
if(typeof hubHome!=='function'||typeof staffPanel!=='function'||typeof hubCall!=='function')return;
const scientificRoutes=[
 ['✖️','المضاعفات الصفرية والموجبة','اكتشف المضاعفات وترتيبها بأسلوب تفاعلي يساعد على فهم الأنماط.','afaq_multiples'],
 ['🔎','غربال الأعداد الأولية','تعرّف الأعداد الأولية عبر خطوات الفرز والاستكشاف.','afaq_prime_sieve'],
 ['🎛️','خلاط الرياضيات','المدخلات والعمليات والمخرجات: اختر القاعدة واختبر توقعاتك.','mixer'],
 ['🔑','المفتاح للقسمة المطوّلة','خطوات منظمة لفهم القسمة المطولة ومفاتيحها.','division_key'],
 ['📐','ي / أ للأشكال الهندسية','استكشف نقاط الأشكال وإحداثياتها وتحويلاتها.','coordinate_ya'],
 ['🧠','استراتيجيات الضرب الذهني','خطوات مرنة للحساب الذهني مع التحقق من النتائج.','mental_multiply'],
 ['➕','استراتيجيات الجمع والطرح الذهني','طرائق ذكية للجمع والطرح وتقريب الأعداد والتحقق.','mental_add_sub'],
 ['🎯','التقويم المتكيف والتغذية الراجعة','تدرب على أسئلة بمستويات مختلفة وتلقّ تغذية راجعة.','adaptive']
];
const supportedRoutes=[...scientificRoutes.map(x=>x[3]),'teaching_initiatives'];
const categories=[['scientific','المبادرات العلمية'],['community','المبادرات المجتمعية'],['youtube_video','مقاطع قناة يوتيوب'],['health','مبادرات صحية'],['environment','مبادرات بيئية'],['other','مبادرات أخرى']];
const initState={settings:{title:'مبادرات الأستاذ سعيد البريكي',
 scientific_intro:'بصمة تعليمية مبتكرة • أفكار وتجارب رياضية تفاعلية تساعد الطالب على الفهم والتطبيق والاستدلال.',
 community_intro:'مبادرات ومشاركات مجتمعية تُوثّق بالصور والتعليقات.',
 youtube_channel_url:'',youtube_channel_title:'قناة الأستاذ سعيد البريكي على يوتيوب',
 other_intro:'مساحات مستقبلية للمبادرات الصحية والبيئية وغيرها.'},
 items:[],publicLoaded:false,adminItems:[],adminLoaded:false,adminLoading:false,busy:false,
 selected:'community',editing:null,error:'',notice:''};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const supervisor=()=>auth.user?.role==='supervisor'&&Boolean(auth.token);
const external=u=>{try{const parsed=new URL(String(u||''));return parsed.protocol==='https:'&&!!parsed.hostname&&!parsed.username&&!parsed.password}catch{return false}};
const currentItems=(cat,admin=false)=>(admin?initState.adminItems:initState.items).filter(x=>x.category===cat)
 .sort((a,b)=>Number(a.sort_order||0)-Number(b.sort_order||0)||Number(a.id)-Number(b.id));
const placeholders=scientificRoutes.map((v,i)=>({id:-(i+1),category:'scientific',title:v[1],
 description:v[2],icon:v[0],route:v[3],target_url:'',image_url:'',published:true,sort_order:(i+1)*10}));
function imageMarkup(img,alt){
 return external(img)?'<img src="'+esc(img)+'" loading="lazy" decoding="async" alt="'+esc(alt)+'">':'';
}
function clickableCard(item,body,css){
 if(item.route&&supportedRoutes.includes(item.route))return '<button type="button" class="'+css+'" data-route="'+esc(item.route)+'">'+body+'</button>';
 if(external(item.target_url))return '<a class="'+css+'" href="'+esc(item.target_url)+'" target="_blank" rel="noopener noreferrer">'+body+'</a>';
 return '<article class="'+css+'">'+body+'</article>';
}

/* Illustrated pre-entry previews. Reuse the original full mixer demonstration rather
   than replacing the user's machine/animation with a small icon. */
const scientificStories={
 afaq_multiples:{
  caption:'كيف تتولد المضاعفات من الصفر؟',
  details:'يبدأ الطالب من الصفر، ثم ينتقل بخطوات ثابتة ليلاحظ التكرار وقاعدة المضاعفات.',
  math:'٠ ← ٦ ← ١٢ ← ١٨ ← ٢٤',
  benefit:'الربط بين الجمع المتكرر والضرب واكتشاف أنماط الأعداد.'
 },
 afaq_prime_sieve:{
  caption:'كيف نميّز العدد الأولي من غيره؟',
  details:'نستبعد مضاعفات الأعداد تدريجيًا؛ فيبقى كل عدد أولي ظاهرًا بلونه المميز.',
  math:'٢ ، ٣ ، ٥ ، ٧ ، ١١ ، ١٣',
  benefit:'الفهم البصري للأعداد الأولية والمركّبة والعوامل.'
 },
 division_key:{
  caption:'متى يظهر مفتاح الفاصلة العشرية؟',
  details:'نتدرج في القسمة وفق المنازل: أقسم، أكتب، أضرب، أطرح، ثم أنزل. وعند بقاء جزء ننتقل إلى الخانات العشرية.',
  math:'٣٢٥ ÷ ٤ = ٨١٫٢٥',
  benefit:'ترتيب خطوات القسمة وفهم الباقي والانتقال للأجزاء العشرية.'
 },
 coordinate_ya:{
  caption:'كيف نتذكر حركة الشكل على المستوى؟',
  details:'ي / أ مفتاح تذكّر: يَمين ويسار للحركة الأفقية، وأعلى وأسفل للحركة الرأسية؛ تتحرك جميع رؤوس الشكل معًا.',
  math:'(١ ، ٢) ← يمين ٣ وأعلى ٢ ← (٤ ، ٤)',
  benefit:'فهم الانسحاب والإحداثيات مع الحفاظ على شكل المضلع وأبعاده.'
 },
 mental_multiply:{
  caption:'هل يوجد أكثر من طريق للوصول إلى الناتج؟',
  details:'نحلّل العدد إلى أجزاء سهلة، ثم نجمع النواتج لنجري عملية الضرب ذهنيًا بمرونة.',
  math:'٢٤ × ٦ = (٢٠ × ٦) + (٤ × ٦) = ١٤٤',
  benefit:'المرونة العددية والتقدير والتحقق من الإجابة دون اعتماد دائم على الخوارزمية.'
 },
 mental_add_sub:{
  caption:'قرّب العدد ثم عوّض الفرق!',
  details:'نختار عددًا قريبًا يسهل التعامل معه، ثم نُصحح الفرق بدقة في الجمع أو الطرح.',
  math:'٣٩٨ + ٤٧ = ٤٠٠ + ٤٥ = ٤٤٥',
  benefit:'توظيف التعويض والتقريب لبناء سرعة الحساب الذهني مع الدقة.'
 },
 adaptive:{
  caption:'تعلّم ثم طبّق وتحقق من إجابتك',
  details:'تُعرض أسئلة بمستويات متدرجة، ويستفيد الطالب من التغذية الراجعة قبل الانتقال إلى تحدٍّ آخر.',
  math:'٧ × ٨ = ؟     الإجابة: ٥٦',
  benefit:'الانتقال من الفهم إلى التطبيق والاستدلال مع مراعاة الفروق الفردية.'
 }
};
function scientificArtwork(item){
 const src=item.image_url;
 if(external(src))return '<div class="afaq-scene-upload"><img src="'+esc(src)+'" loading="lazy" decoding="async" alt="صورة توضيحية لمبادرة '+esc(item.title)+'"></div>';
 const route=item.route;
 if(route==='afaq_multiples')
  return '<div class="afaq-scene-multiples" role="img" aria-label="مضاعفات العدد ستة من الصفر إلى أربعة وعشرين">'+
   '<div class="afaq-scene-step-label">نضيف ٦ في كل خطوة</div>'+
   '<div class="afaq-multiple-numbers">'+['٠','٦','١٢','١٨','٢٤'].map((n,i)=>
    '<span class="afaq-multiple-number">'+n+'<small>'+(i===0?'البداية':'+'+'٦')+'</small></span>').join('<span class="afaq-step-arrow">←</span>')+
   '</div><div class="afaq-scene-caption">المضاعفات تتبع قاعدة ثابتة</div></div>';
 if(route==='afaq_prime_sieve'){
  const prime=new Set([2,3,5,7,11,13,17,19,23,29]);
  return '<div class="afaq-scene-primes" role="img" aria-label="غربال الأعداد من واحد إلى ثلاثين مع تمييز الأعداد الأولية">'+
   '<div class="afaq-scene-step-label">لوّن الأعداد الأولية واستبعد مضاعفاتها</div>'+
   '<div class="afaq-prime-grid">'+Array.from({length:30},(_,i)=>{
    const n=i+1;return '<span class="'+(prime.has(n)?'is-prime':n===1?'is-one':'is-composite')+'">'+
     String(n).replace(/[0-9]/g,d=>'٠١٢٣٤٥٦٧٨٩'[Number(d)])+'</span>';
   }).join('')+'</div><div class="afaq-scene-legend"><span>● عدد أولي</span><span>○ عدد مركب</span><span>١ ليس أوليًا</span></div></div>';
 }
 if(route==='division_key')
  return '<div class="afaq-scene-division" role="img" aria-label="رسم يوضح عملية قسمة ٣٢٥ على ٤ مع مفتاح الفاصلة العشرية">'+
   '<div class="afaq-longdivision"><span class="afaq-division-divisor">٤</span><span class="afaq-division-arc">⟌</span>'+
   '<span class="afaq-division-dividend">٣٢٥٫٠٠</span><strong>٨١٫٢٥</strong></div>'+
   '<div class="afaq-division-unlock"><span>🔑</span><span>مفتاح الفاصلة</span><strong>من الباقي إلى الأجزاء العشرية</strong></div></div>';
 if(route==='coordinate_ya'){
  const art=typeof initArt==='function'?initArt({route:'coordinate_ya',icon:'coordinates'}):'📐';
  return '<div class="afaq-scene-coordinate" role="img" aria-label="شبكة إحداثيات توضّح التحرك يمينًا وأعلى">'+
   '<div class="afaq-coordinate-graphic">'+art+'</div><div class="afaq-coordinate-key"><span>ي ← يمين / يسار</span><span>أ ← أعلى / أسفل</span></div></div>';
 }
 if(route==='mental_multiply')
  return '<div class="afaq-scene-mental" role="img" aria-label="تقسيم ٢٤ إلى ٢٠ و٤ لحساب الضرب في ٦">'+
   '<div class="afaq-mental-title">٢٤ × ٦</div><div class="afaq-mental-pieces"><span>٢٠ × ٦ <b>١٢٠</b></span>'+
   '<span class="afaq-mental-plus">＋</span><span>٤ × ٦ <b>٢٤</b></span></div>'+
   '<div class="afaq-mental-result">١٢٠ + ٢٤ = <strong>١٤٤</strong></div></div>';
 if(route==='mental_add_sub')
  return '<div class="afaq-scene-compensation" role="img" aria-label="توضيح التعويض في الجمع بتقريب ٣٩٨ إلى ٤٠٠">'+
   '<div class="afaq-comp-start"><strong>٣٩٨ + ٤٧</strong><span>قرّب العدد</span></div>'+
   '<div class="afaq-comp-arrow">⇣</div>'+
   '<div class="afaq-comp-middle">٤٠٠ + ٤٥</div><div class="afaq-comp-result">الناتج <strong>٤٤٥</strong></div></div>';
 if(route==='adaptive')
  return '<div class="afaq-scene-adaptive" role="img" aria-label="بطاقة تدريب بمستويات الفهم والتطبيق والاستدلال">'+
   '<div class="afaq-adaptive-levels"><span>الفهم</span><span>التطبيق</span><span>الاستدلال</span></div>'+
   '<div class="afaq-adaptive-question">٧ × ٨ = ؟</div><div class="afaq-adaptive-choices">'+
   '<span>٤٨</span><span class="correct">٥٦ ✓</span><span>٦٤</span></div>'+
   '<div class="afaq-adaptive-feedback">تغذية راجعة فورية تعزز التعلم</div></div>';
 return '<div class="afaq-scene-other"><span aria-hidden="true">'+esc(item.icon||'🧮')+'</span>'+
  '<strong>نموذج بصري للمبادرة</strong></div>';
}
function scientificEntryAction(item){
 if(item.route&&supportedRoutes.includes(item.route))
  return '<button type="button" class="afaq-scientific-open" data-route="'+esc(item.route)+'">🔐 الدخول الكامل للمبادرة <span aria-hidden="true">↗</span></button>';
 if(external(item.target_url))
  return '<a class="afaq-scientific-open" href="'+esc(item.target_url)+'" target="_blank" rel="noopener noreferrer">🌐 فتح المبادرة الكاملة <span aria-hidden="true">↗</span></a>';
 return '<span class="afaq-scientific-pending">يمكن للمشرف إضافة رابط تشغيل المبادرة لاحقًا.</span>';
}
function scientificCard(item){
 const details=scientificStories[item.route];
 if(item.route==='mixer'&&typeof mx25Html==='function'){
  return '<article class="afaq-scientific-card afaq-scientific-card--mixer">'+
   '<div class="afaq-scientific-card-tag">🎛️ عرض تفاعلي قبل الدخول الكامل</div>'+
   mx25Html()+'</article>';
 }
 return '<article class="afaq-scientific-card">'+
  '<div class="afaq-scientific-card-head"><span class="afaq-scientific-card-symbol">'+esc(item.icon||'✦')+'</span>'+
  '<div><h4>'+esc(item.title)+'</h4><p>'+esc(item.description||details?.caption||'تجربة تعليمية مبتكرة')+'</p></div></div>'+
  '<div class="afaq-scientific-artboard">'+scientificArtwork(item)+'</div>'+
  '<div class="afaq-scientific-card-brief"><b>💡 فكرة المبادرة</b><p>'+esc(details?.details||item.comment||item.description||'اكتشف مفهومًا رياضيًا مع أمثلة وتطبيقات.')+'</p></div>'+
  (details?'<div class="afaq-scientific-mini-example"><span>🧪 مثال تطبيقي مصغّر</span>'+
   '<strong dir="rtl">'+esc(details.math)+'</strong></div>'+
   '<div class="afaq-scientific-skill"><b>🎯 ماذا نتعلّم؟</b><p>'+esc(details.benefit)+'</p></div>':'')+
  '<div class="afaq-scientific-card-footer">'+scientificEntryAction(item)+'</div></article>';
}

function scientificBlock(){
 const data=initState.publicLoaded?currentItems('scientific'):placeholders;
 const items=data.map(scientificCard).join('');
 return '<section id="afaq-scientific" class="afaq-initiatives-science" aria-label="المبادرات العلمية">'+
 '<header class="afaq-initiative-heading">'+
 '<h3>المبادرات العلمية</h3>'+
 '<p>'+esc(String(initState.settings.scientific_intro||'').replace(/^بصمة تعليمية مبتكرة\s*[•—:–-]?\s*/,'') )+'</p></header>'+
 '<div class="afaq-scientific-grid">'+(items||'<p>يمكن للمشرف إضافة المبادرات العلمية هنا.</p>')+'</div>'+
 '<div class="afaq-initiative-bottom"><button type="button" class="afaq-initiative-more" data-route="teaching_initiatives">✨ استكشف المزيد من المبادرات العلمية</button>'+
 (supervisor()?'<button type="button" class="afaq-initiative-manage" data-init-admin="scientific">إدارة المبادرات العلمية</button>':'')+
 '</div><p class="afaq-initiative-privacy">تظل المبادرات المحمية خاضعة لتصريح المشاهدة والإذن الصادر من المشرف الرئيسي.</p>'+
 '</section>';
}
function galleryCard(item){
 const image=imageMarkup(item.image_url,item.title);
 return '<article class="afaq-community-card">'+
 (image?'<figure>'+image+'</figure>':'<div class="afaq-community-empty-image" aria-hidden="true">📷</div>')+
 '<div class="afaq-community-copy"><h3>'+esc(item.title)+'</h3>'+
 (item.description?'<p>'+esc(item.description)+'</p>':'')+
 (item.comment?'<blockquote>'+esc(item.comment)+'</blockquote>':'')+
 (external(item.target_url)?'<a href="'+esc(item.target_url)+'" rel="noopener noreferrer" target="_blank">عرض المزيد عن المبادرة ↗</a>':'')+
 '</div></article>';
}
function communityBlock(){
 const items=currentItems('community');
 return '<section id="afaq-community" class="afaq-community-initiatives" aria-label="المبادرات المجتمعية">'+
 '<header class="afaq-initiative-subtitle"><span>🤝 العطاء والمشاركة</span><h3>المبادرات المجتمعية</h3>'+
 '<p>'+esc(initState.settings.community_intro)+'</p></header>'+
 (items.length?'<div class="afaq-community-gallery">'+items.map(galleryCard).join('')+'</div>':
 '<div class="afaq-community-placeholder"><span>🖼️</span><strong>معرض الصور والمشاركات المجتمعية</strong>'+
 '<p>تظهر هنا صور المبادرات المجتمعية وتوثيق أنشطتها والتعليقات المرافقة بعد اعتمادها.</p></div>')+
 (supervisor()?'<div class="afaq-initiative-bottom"><button type="button" class="afaq-initiative-manage" data-init-admin="community">＋ إضافة صور وتعليقات للمبادرات المجتمعية</button></div>':'')+
 '</section>';
}
function ytID(u){
 try{
  const x=new URL(u),host=x.hostname.toLowerCase();
  if(host==='youtu.be')return /^[\w-]{11}$/.test(x.pathname.slice(1))?x.pathname.slice(1):'';
  if(!['youtube.com','www.youtube.com','m.youtube.com','www.youtube-nocookie.com'].includes(host))return '';
  const path=x.pathname.split('/').filter(Boolean);
  const id=x.searchParams.get('v')||(path[0]==='shorts'||path[0]==='embed'||path[0]==='live'?path[1]:'');
  return /^[\w-]{11}$/.test(id||'')?id:'';
 }catch{return ''}
}
function youtubeBlock(){
 const settings=initState.settings;
 const channel=external(settings.youtube_channel_url)?settings.youtube_channel_url:'';
 const videos=currentItems('youtube_video');
 return '<section id="afaq-youtube" class="afaq-youtube-initiatives" aria-label="قناة الأستاذ سعيد على يوتيوب">'+
 '<header class="afaq-initiative-subtitle"><span>▶️ تعليم ومعرفة على يوتيوب</span>'+
 '<h3>تصفح قناة يوتيوب الخاصة بالأستاذ سعيد البريكي</h3>'+
 '<p>فيديوهات وشروحات ومشاركات يمكن للمشرف إضافتها وربطها بالقناة الأصلية.</p></header>'+
 '<div class="afaq-youtube-bar"><div class="afaq-youtube-mark" aria-hidden="true">▶</div><div><strong>'+esc(settings.youtube_channel_title)+'</strong>'+
 '<small>'+(channel?'رابط القناة معتمد من مشرف المنصة':'سيظهر رابط القناة فور إضافته من حساب المشرف')+'</small></div>'+
 (channel?'<a href="'+esc(channel)+'" target="_blank" rel="noopener noreferrer">زيارة القناة وتصفح فيديوهاتها ↗</a>':
 supervisor()?'<button type="button" data-init-admin="youtube_video">إضافة رابط قناة يوتيوب</button>':'')+'</div>'+
 (videos.length?'<div class="afaq-youtube-videos">'+videos.map(v=>{
  const vid=ytID(v.target_url),thumb=imageMarkup(v.image_url,v.title);
  return '<article class="afaq-youtube-video">'+(thumb?'<div class="afaq-youtube-thumbnail">'+thumb+'</div>':'<div class="afaq-youtube-glyph">▶</div>')+
   '<div class="afaq-youtube-video-copy"><h3>'+esc(v.title)+'</h3><p>'+esc(v.description||'')+'</p>'+
   '<div class="afaq-youtube-actions">'+(vid?'<button type="button" data-init-youtube="'+vid+'">مشاهدة الفيديو هنا</button>':'')+
   (external(v.target_url)?'<a href="'+esc(v.target_url)+'" rel="noopener noreferrer" target="_blank">فتح في يوتيوب</a>':'')+'</div>'+
   '<div class="afaq-youtube-inline" data-init-video-target="'+esc(vid)+'"></div></div></article>';
 }).join('')+'</div>':'')+
 (supervisor()?'<div class="afaq-initiative-bottom"><button type="button" class="afaq-initiative-manage" data-init-admin="youtube_video">إدارة القناة والفيديوهات</button></div>':'')+
 '</section>';
}
function otherBlock(){
 const groups=[['health','🩺','المبادرات الصحية'],['environment','🌿','المبادرات البيئية'],['other','✨','مبادرات في مجالات أخرى']];
 return '<section id="afaq-other-initiatives" class="afaq-other-initiatives" aria-label="مبادرات أخرى">'+
 '<header class="afaq-initiative-subtitle"><span>✦ آفاق متجددة ✦</span><h3>مبادرات أخرى</h3>'+
 '<p>'+esc(initState.settings.other_intro)+'</p></header>'+
 '<div class="afaq-other-grid">'+groups.map(([code,icon,title])=>{
  const items=currentItems(code);
  return '<section class="afaq-other-category"><h3>'+icon+' '+title+'</h3>'+
  (items.length?items.map(galleryCard).join(''):'<p>مساحة مفتوحة لإضافة مبادرات '+title+' لاحقًا.</p>')+
  (supervisor()?'<button type="button" data-init-admin="'+code+'">＋ إضافة مبادرة</button>':'')+
  '</section>';
 }).join('')+'</div></section>';
}
function fullMarkup(){
 return '<div class="afaq-teacher-initiatives" dir="rtl">'+
 '<header class="afaq-initiatives-main-heading">'+
 '<span>✦ بصمة تعليمية مبتكرة ✦</span>'+
 '<h2>'+esc(initState.settings.title)+'</h2>'+
 '<p>أفكار وتجارب ومشاركات في الرياضيات والمجتمع والتعلم، تمتد إلى مجالات جديدة.</p>'+
 '</header>'+
 scientificBlock()+communityBlock()+youtubeBlock()+otherBlock()+'</div>';
}
const oldHome=hubHome;
hubHome=function(...args){
 const html=oldHome.apply(this,args);
 if(typeof html!=='string'||html.includes('class="afaq-teacher-initiatives"'))return html;
 const holder=document.createElement('div');holder.innerHTML=html;
 const home=holder.querySelector('.hub-home');if(!home)return html;
 // Remove the old narrow initiative column, retaining every original working route.
 const oldFeature=home.querySelector('.afaq-mid-initiative-feature');
 if(oldFeature)oldFeature.remove();
 const mid=home.querySelector('.afaq-mid-layout');
 let anchor=null;
 if(mid){
  const sections=mid.querySelector('.afaq-home-sections');
  if(sections){
   mid.parentNode.insertBefore(sections,mid);
   sections.classList.add('afaq-sections-full');
   anchor=sections;
  }
  const stray=Array.from(mid.children).filter(el=>!el.classList.contains('afaq-mid-center')&&
   !el.classList.contains('afaq-mid-side--left')&&!el.classList.contains('afaq-mid-side--right'));
  stray.forEach(el=>mid.parentNode.insertBefore(el,mid));
  mid.remove();
 }
 if(!anchor)anchor=home.querySelector('.afaq-home-sections')||home.querySelector('.afaq-honor-board')||
  home.querySelector('.afaq-final-introduction')||home.querySelector('.hub-banner');
 if(!anchor)return html;
 anchor.insertAdjacentHTML('afterend',fullMarkup());
 return holder.innerHTML;
};
function adminImageRow(item){
 return '<div class="afaq-init-admin-image">'+(external(item.image_url)?'<img src="'+esc(item.image_url)+'" alt="معاينة الصورة">':'')+
 '<label>رفع صورة JPG أو PNG أو WebP (أقصى حجم 3 ميجابايت)<input type="file" name="upload" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"></label>'+
 '<label>أو رابط الصورة المباشر<input type="url" name="external_image_url" maxlength="900" placeholder="https://example.com/photo.jpg" value="'+esc(item.external_image_url||'')+'"></label>'+
 '<label class="afaq-init-inline-check"><input type="checkbox" name="clear_image">إزالة الصورة الحالية</label>'+
 '<input type="hidden" name="image_path" value="'+esc(item.image_path||'')+'"></div>';
}
function settingsForm(){
 const s=initState.settings;
 return '<form class="afaq-init-admin-form" id="afaqInitSettings">'+
 '<h3>العناوين العامة والقناة الرسمية</h3>'+
 '<label>اسم صاحب المبادرات<input name="title" required maxlength="140" value="'+esc(s.title)+'"></label>'+
 '<label>وصف المبادرات العلمية<textarea name="scientific_intro" maxlength="450">'+esc(s.scientific_intro)+'</textarea></label>'+
 '<label>وصف المبادرات المجتمعية<textarea name="community_intro" maxlength="450">'+esc(s.community_intro)+'</textarea></label>'+
 '<label>الرابط الرسمي لقناة الأستاذ سعيد على يوتيوب (https://)<input type="url" name="youtube_channel_url" maxlength="900" placeholder="https://www.youtube.com/@YourChannel" value="'+esc(s.youtube_channel_url)+'"></label>'+
 '<label>الاسم المعروض للقناة<input name="youtube_channel_title" required maxlength="160" value="'+esc(s.youtube_channel_title)+'"></label>'+
 '<label>وصف المبادرات المستقبلية<textarea name="other_intro" maxlength="450">'+esc(s.other_intro)+'</textarea></label>'+
 '<button type="submit" class="afaq-init-admin-save">حفظ إعدادات المبادرات وقناة يوتيوب</button></form>';
}
function itemForm(){
 const current=initState.editing!==null?initState.adminItems.find(x=>Number(x.id)===Number(initState.editing)):null;
 const item=current||{category:initState.selected,title:'',description:'',comment:'',icon:'✨',route:'',target_url:'',sort_order:100,published:true};
 return '<form id="afaqInitItem" class="afaq-init-admin-form" data-init-edit="'+(current?.id||'')+'">'+
 '<h3>'+(current?'تعديل المبادرة الحالية':'إضافة صورة أو مبادرة جديدة')+'</h3>'+
 '<label>نوع المبادرة<select name="category">'+categories.map(([k,v])=>'<option value="'+k+'"'+(k===item.category?' selected':'')+'>'+v+'</option>').join('')+'</select></label>'+
 '<label>عنوان المبادرة أو الصورة<input name="title" required maxlength="170" value="'+esc(item.title)+'"></label>'+
 '<label>وصف المبادرة<textarea name="description" maxlength="900">'+esc(item.description)+'</textarea></label>'+
 '<label>تعليق الصورة أو تفاصيل المشاركة<textarea name="comment" maxlength="1800" placeholder="اكتب وصف الحدث، أو التعليق المصاحب للصورة">'+esc(item.comment)+'</textarea></label>'+
 '<label>رمز المبادرة (اختياري)<input name="icon" maxlength="24" value="'+esc(item.icon||'✨')+'"></label>'+
 '<label>رابط فتح المبادرة داخل المنصة<select name="route"><option value="">لا يوجد رابط داخلي</option>'+
 supportedRoutes.map(route=>'<option value="'+route+'"'+(route===item.route?' selected':'')+'>'+route+'</option>').join('')+'</select></label>'+
 '<label>رابط خارجي للمبادرة أو رابط فيديو يوتيوب<input type="url" name="target_url" maxlength="900" placeholder="https://..." value="'+esc(item.target_url||'')+'"></label>'+
 adminImageRow(item)+
 '<label>ترتيب العرض<input type="number" name="sort_order" min="0" max="100000" value="'+Number(item.sort_order??100)+'"></label>'+
 '<label class="afaq-init-inline-check"><input type="checkbox" name="published"'+(item.published?' checked':'')+'>نشر المبادرة للزوار (ألغ الاختيار لحفظها مسودة)</label>'+
 '<p class="afaq-init-admin-note">لإضافة صور مجتمعية متعددة: أضف بطاقة مستقلة لكل صورة وتعليق. تستخدم المبادرات العلمية الداخلية نظام أذونات المشرف القائم بالفعل.</p>'+
 '<div class="afaq-init-actions"><button type="submit" class="afaq-init-admin-save">حفظ المبادرة</button>'+
 '<button type="button" data-init-cancel>بدء إضافة مبادرة جديدة</button></div></form>';
}
function adminList(){
 return '<div class="afaq-init-admin-list">'+categories.map(([code,label])=>{
  const rows=currentItems(code,true);
  return '<section class="afaq-init-admin-category"><h3>'+esc(label)+' <small>('+rows.length+')</small></h3>'+
   '<button type="button" data-init-add="'+code+'">＋ إضافة في هذا القسم</button>'+
   (rows.length?'<div class="afaq-init-admin-items">'+rows.map(x=>
    '<article>'+(external(x.image_url)?'<img loading="lazy" src="'+esc(x.image_url)+'" alt="">':'<span class="afaq-init-admin-ico">'+esc(x.icon||'✨')+'</span>')+
    '<div><strong>'+esc(x.title)+'</strong><small>'+(x.published?'منشورة':'مسودة')+' • ترتيب '+Number(x.sort_order)+'</small></div>'+
    '<button type="button" data-init-edit-item="'+Number(x.id)+'">تعديل</button>'+
    '<button type="button" class="afaq-init-danger" data-init-remove="'+Number(x.id)+'">حذف</button></article>').join('')+'</div>':
   '<p>لا توجد مبادرات منشورة أو محفوظة في هذا القسم حتى الآن.</p>')+
  '</section>';
 }).join('')+'</div>';
}
function adminPage(){
 if(!supervisor())return '<p class="notice">إدارة المبادرات مخصصة للمشرف الرئيسي فقط.</p>';
 return '<div class="container afaq-initiatives-admin" dir="rtl">'+
 (typeof hubStaffNav==='function'?hubStaffNav():'')+
 '<header class="afaq-init-admin-head"><h2>✦ إدارة المبادرات العلمية والمجتمعية</h2>'+
 '<p>تحكّم في إظهار المبادرات أو إخفائها أو إتاحتها بإذن المشرف، ثم أدر ٨ بطاقات علمية ومعرض الصور المجتمعية وتعليقاتها وفيديوهات يوتيوب والمسارات المستقبلية من هذه الصفحة.</p>'+
 '<button type="button" data-init-reload>تحديث المبادرات</button>'+
 (initState.notice?'<p role="status" class="afaq-init-success">'+esc(initState.notice)+'</p>':'')+
 (initState.error?'<p role="alert" class="afaq-init-error">'+esc(initState.error)+'</p>':'')+'</header>'+
 (typeof iaVisibilityForInitiativesAdmin==='function'?iaVisibilityForInitiativesAdmin():'')+
 (initState.adminLoaded?'<div class="afaq-init-admin-forms">'+settingsForm()+itemForm()+'</div>'+adminList():
 '<p>جارٍ استرجاع بيانات المبادرات المحفوظة...</p>')+'</div>';
}
const oldStaff=staffPanel;
staffPanel=function(...args){
 return auth.section==='teacher_initiatives_admin'?adminPage():oldStaff.apply(this,args);
};
async function loadPublic(){
 try{
  const res=await hubCall('teacher_initiatives_public');
  initState.settings={...initState.settings,...(res.settings||{})};
  initState.items=res.items||[];
  initState.publicLoaded=true;
  if(state.page==='home')render();
 }catch(err){initState.error='تعذر تحميل سجل المبادرات: '+err.message}
}
async function loadAdmin(){
 if(!supervisor()||initState.adminLoading)return;
 initState.adminLoading=true;
 try{
  const result=await hubCall('teacher_initiatives_admin',{},auth.token);
  initState.settings={...initState.settings,...(result.settings||{})};
  initState.adminItems=result.items||[];initState.adminLoaded=true;initState.error='';
 }catch(err){initState.error='تعذر استرجاع المبادرات: '+err.message}
 finally{initState.adminLoading=false;if(state.page==='dashboard'&&auth.section==='teacher_initiatives_admin')render()}
}
function openAdmin(category){
 if(!supervisor())return;
 if(categories.some(x=>x[0]===category))initState.selected=category;
 auth.section='teacher_initiatives_admin';initState.error='';route('dashboard');
 if(!initState.adminLoaded)loadAdmin();
}
function toBase64(file){return new Promise((resolve,reject)=>{
 const reader=new FileReader();reader.onerror=()=>reject(Error('تعذر قراءة الصورة'));
 reader.onload=()=>resolve(String(reader.result||'').split(',')[1]||'');
 reader.readAsDataURL(file);
})}
async function imageForm(form,category){
 let path=String(form.elements.image_path?.value||''),external_image_url=String(form.elements.external_image_url?.value||'').trim();
 if(form.elements.clear_image?.checked){path='';external_image_url=''}
 if(external_image_url&&!external(external_image_url))throw Error('رابط الصورة يجب أن يبدأ بـ https://');
 const file=form.elements.upload?.files?.[0];
 if(file){
  if(file.size<100||file.size>3145728||!['image/jpeg','image/png','image/webp'].includes(file.type))
   throw Error('الصورة يجب أن تكون JPG أو PNG أو WebP وبحجم أقل من ٣ ميجابايت.');
  const response=await hubCall('teacher_initiatives_image_upload',{
   category,filename:file.name,mime:file.type,base64:await toBase64(file)
  },auth.token);
  path=response.image_path;external_image_url='';
 }else if(external_image_url)path='';
 return {image_path:path,external_image_url};
}
async function submit(form,action,payload){
 if(!supervisor()||initState.busy)return;
 initState.busy=true;initState.error='';initState.notice='';
 form.querySelectorAll('button').forEach(btn=>btn.disabled=true);
 try{
  await hubCall(action,payload,auth.token);
  initState.notice='✓ تم حفظ التعديل بنجاح.';
  initState.editing=null;
  await Promise.all([loadAdmin(),loadPublic()]);
 }catch(err){initState.error='تعذر حفظ التعديل: '+err.message}
 finally{initState.busy=false;if(state.page==='dashboard'&&auth.section==='teacher_initiatives_admin')render()}
}
async function submitSettings(form){
 const data=new FormData(form),payload={};
 for(const key of ['title','scientific_intro','community_intro','youtube_channel_url','youtube_channel_title','other_intro']){
  payload[key]=String(data.get(key)||'').trim();
 }
 if(payload.youtube_channel_url&&!/^https:\/\/(?:www\.|m\.)?(?:youtube\.com|youtu\.be)\//i.test(payload.youtube_channel_url))
  return window.alert('أدخل رابط قناة يوتيوب الرسمي فقط، أو اتركه فارغًا حتى يتوفر.');
 await submit(form,'teacher_initiatives_settings_save',payload);
}
async function submitItem(form){
 const data=new FormData(form),payload={
  category:String(data.get('category')||'community'),
  title:String(data.get('title')||'').trim(),
  description:String(data.get('description')||'').trim(),
  comment:String(data.get('comment')||'').trim(),
  icon:String(data.get('icon')||'✨').trim(),
  route:String(data.get('route')||''),
  target_url:String(data.get('target_url')||'').trim(),
  sort_order:Number(data.get('sort_order')||100),
  published:data.has('published')
 };
 if(payload.title.length<2)return window.alert('اكتب عنوان المبادرة.');
 if(payload.target_url&&!external(payload.target_url))return window.alert('استخدم رابط https صحيحًا.');
 if(payload.published&&payload.category==='youtube_video'&&!payload.target_url)return window.alert('أدخل رابط فيديو يوتيوب قبل نشره.');
 if(form.dataset.initEdit)payload.id=Number(form.dataset.initEdit);
 try{
  Object.assign(payload,await imageForm(form,payload.category));
  await submit(form,'teacher_initiatives_save',payload);
 }catch(err){initState.error=err.message;render()}
}
async function removeItem(id){
 if(!supervisor()||initState.busy)return;
 if(!window.confirm('هل تريد حذف هذا المحتوى نهائيًا من المبادرات؟ لا يؤثر الحذف على المبادرات التعليمية المحمية أو سجلات الطلاب.'))return;
 initState.busy=true;initState.error='';
 try{
  await hubCall('teacher_initiatives_delete',{id},auth.token);
  initState.notice='✓ تم حذف المبادرة وصورتها المرفوعة من معرض المبادرات.';
  initState.editing=null;
  await Promise.all([loadAdmin(),loadPublic()]);
 }catch(err){initState.error='تعذر الحذف: '+err.message}
 finally{initState.busy=false;if(state.page==='dashboard'&&auth.section==='teacher_initiatives_admin')render()}
}
function bind(){
 document.querySelectorAll('[data-init-admin]').forEach(btn=>btn.addEventListener('click',()=>openAdmin(btn.dataset.initAdmin)));
 document.querySelectorAll('[data-init-reload]').forEach(btn=>btn.addEventListener('click',()=>loadAdmin()));
 document.getElementById('afaqInitSettings')?.addEventListener('submit',event=>{event.preventDefault();submitSettings(event.currentTarget)});
 document.getElementById('afaqInitItem')?.addEventListener('submit',event=>{event.preventDefault();submitItem(event.currentTarget)});
 document.querySelectorAll('[data-init-add]').forEach(btn=>btn.addEventListener('click',()=>{
  initState.selected=btn.dataset.initAdd;initState.editing=null;render();
  document.getElementById('afaqInitItem')?.scrollIntoView({behavior:'smooth',block:'start'});
 }));
 document.querySelectorAll('[data-init-edit-item]').forEach(btn=>btn.addEventListener('click',()=>{
  const item=initState.adminItems.find(x=>Number(x.id)===Number(btn.dataset.initEditItem));
  if(!item)return;
  initState.editing=item.id;initState.selected=item.category;render();
  document.getElementById('afaqInitItem')?.scrollIntoView({behavior:'smooth',block:'start'});
 }));
 document.querySelectorAll('[data-init-remove]').forEach(btn=>btn.addEventListener('click',()=>removeItem(Number(btn.dataset.initRemove))));
 document.querySelectorAll('[data-init-cancel]').forEach(btn=>btn.addEventListener('click',()=>{initState.editing=null;render()}));
 document.querySelectorAll('[data-init-youtube]').forEach(btn=>btn.addEventListener('click',()=>{
  const id=btn.dataset.initYoutube;
  if(!/^[\w-]{11}$/.test(id))return;
  const target=btn.closest('.afaq-youtube-video')?.querySelector('.afaq-youtube-inline');
  if(!target)return;
  if(target.querySelector('iframe')){target.innerHTML='';return}
  target.innerHTML='<iframe title="مشاهدة فيديو مبادرة تعليمية" loading="lazy" allowfullscreen allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" src="https://www.youtube-nocookie.com/embed/'+id+'"></iframe>';
 }));
}
const oldAttach=attach;
attach=function(...args){oldAttach.apply(this,args);bind()};
const oldTab=hubLoadForTab;
hubLoadForTab=function(id,...args){
 if(id==='teacher_initiatives_admin'){if(supervisor()&&!initState.adminLoaded)loadAdmin();return}
 return oldTab.call(this,id,...args);
};
loadPublic();
})();