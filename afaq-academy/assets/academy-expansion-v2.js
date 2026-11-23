/* AFAQ MATHS ACADEMY V2 — independent expansion; preview-only editing; no real accounts or payment. */
(function(){
"use strict";
if(!document.getElementById("catalogSection")||document.getElementById("afa2-hub"))return;
var KEY="afaq-academy-extension-v2",VISIT_KEY="afaq-academy-visitor-demo-v2";
var subjects=[
 {id:"math",name:"الرياضيات",abbr:"π",a:"#668cc4",b:"#224a8a"},
 {id:"science",name:"العلوم",abbr:"⚗",a:"#53b5a8",b:"#117b80"},
 {id:"arabic",name:"اللغة العربية",abbr:"ض",a:"#daaa71",b:"#b76b49"},
 {id:"english",name:"الإنجليزية",abbr:"En",a:"#9d80d9",b:"#6249a8"},
 {id:"social",name:"الاجتماعيات",abbr:"🌐",a:"#6596ab",b:"#396b84"},
 {id:"skills",name:"التقنية",abbr:"⌘",a:"#d67a9a",b:"#96476d"}
];
var categories=[
 ["math","الرياضيات"],["science","العلوم والتجارب"],["literature","المبادرات الأدبية"],["psychology","علم النفس والقياس والتقويم"],["social","المبادرات الاجتماعية"],["sports","المبادرات الرياضية"]
];
var initialInitiatives=[
 {id:"mix",cat:"math",icon:"⚙",title:"خلاط الرياضيات",desc:"مدخلات وعمليات ومخرجات متحركة لتمثيل التحويلات العددية بالخطوات، مع مثال تطبيقي تفاعلي."},
 {id:"division",cat:"math",icon:"÷",title:"المفتاح للقسمة",desc:"استراتيجيات القسمة وتقدير الناتج والتحقق منه وخطوات ترتيب الفاصلة العشرية."},
 {id:"mental",cat:"math",icon:"∑",title:"استراتيجيات الحساب الذهني",desc:"الجمع والطرح والضرب الذهني وتفكيك الأعداد وتوظيف العلاقات العددية."},
 {id:"primes",cat:"math",icon:"◈",title:"الأعداد الأولية والعوامل",desc:"الغربال والأعداد الأولية والمضاعفات والعوامل وبناء الفهم بالاستقصاء."},
 {id:"science-lab",cat:"science",icon:"⚗",title:"مختبر آفاق للعلوم",desc:"تجارب افتراضية آمنة، وملاحظات علمية، وفرضيات، ومهام استقصاء."},
 {id:"science-eco",cat:"science",icon:"🌿",title:"البيئة والاستدامة",desc:"مشروعات حول المياه والطاقة والبيئة والتجارب المدرسية."},
 {id:"literature-lab",cat:"literature",icon:"✒",title:"مختبر الإبداع الأدبي",desc:"ورش الكتابة والخاطرة والقصة والإلقاء والنقد القرائي."},
 {id:"reading",cat:"literature",icon:"📚",title:"نادي القراءة والحوار",desc:"مطالعة نصوص مختارة وندوات أدبية ومناقشات تربوية."},
 {id:"psych-measure",cat:"psychology",icon:"◉",title:"مركز القياس والتقويم",desc:"بناء أدوات القياس وتحليل نتائج التعلم والتقويم التشخيصي والبنائي والختامي."},
 {id:"psych-care",cat:"psychology",icon:"🧠",title:"المهارات النفسية والتعلم",desc:"مهارات التنظيم الذاتي والدافعية والرفاه النفسي التعليمي."},
 {id:"social-vol",cat:"social",icon:"🤝",title:"العمل التطوعي والمجتمع",desc:"مشروعات طلابية لخدمة المجتمع والمواطنة وقيم التعاون."},
 {id:"sports-motion",cat:"sports",icon:"🏃",title:"الحركة والصحة والرياضة",desc:"أنشطة صحية ومسابقات حركية تربط الرياضة بالمهارات العلمية."}
];
var initialLinks=[
 {id:"r1",side:"right",icon:"⚽",title:"beIN SPORTS",desc:"الأخبار الرياضية",url:"https://www.beinsports.com/en-mena/"},
 {id:"r2",side:"right",icon:"📅",title:"جدول قنوات beIN",desc:"مواعيد البرامج والمباريات",url:"https://www.beinsports.com/en-mena/tv-guide"},
 {id:"r3",side:"right",icon:"🎬",title:"أحدث الأفلام والمسلسلات",desc:"دليل المحتوى",url:"https://www.imdb.com/what-to-watch/"},
 {id:"r4",side:"right",icon:"📖",title:"المكتبة الموسوعية",desc:"موسوعات وتاريخ العلوم",url:"#afa2-library"},
 {id:"r5",side:"right",icon:"🔭",title:"علماء ومفكرون",desc:"رواد العلوم والآداب",url:"#afa2-library"},
 {id:"l1",side:"left",icon:"⛏",title:"Minecraft Classic",desc:"البناء والإبداع",url:"https://classic.minecraft.net/"},
 {id:"l2",side:"left",icon:"🚀",title:"Rocket League",desc:"عالم الألعاب",url:"https://www.rocketleague.com/"},
 {id:"l3",side:"left",icon:"🎲",title:"مسابقات آفاق",desc:"تحديات ومنافسات",url:"#afa2-leisure"},
 {id:"l4",side:"left",icon:"📜",title:"مكتبة المعرفة",desc:"علوم وآداب وكتب",url:"#afa2-library"},
 {id:"l5",side:"left",icon:"🧪",title:"المبادرات العلمية",desc:"مختبرات ومشروعات",url:"#afa2-initiatives"}
];
var defaultVisibility={
 hub:true,initiatives:true,library:true,print:true,leisure:true,
 homeHero:true,homeBenefits:true,catalogSection:true,liveSection:true,pricingSection:true,workspaceSection:true,financeSection:true
};
var defaults={visibility:defaultVisibility,initiatives:initialInitiatives,links:initialLinks,city:["sohar","muscat"],sound:false};
var cityMap={
 sohar:{name:"صحار",lat:24.34,lon:56.73},muscat:{name:"مسقط",lat:23.61,lon:58.59},saham:{name:"صحم",lat:24.17,lon:56.89},
 salalah:{name:"صلالة",lat:17.02,lon:54.09},nizwa:{name:"نزوى",lat:22.93,lon:57.53},sur:{name:"صور",lat:22.57,lon:59.53},
 ibri:{name:"عبري",lat:23.23,lon:56.52},barka:{name:"بركاء",lat:23.68,lon:57.89},seeb:{name:"السيب",lat:23.67,lon:58.19}
};
function clean(v){return String(v===undefined||v===null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function getSaved(){var v;try{v=JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){};if(!v||typeof v!=="object")return JSON.parse(JSON.stringify(defaults));
 return {
 visibility:Object.assign({},defaultVisibility,v.visibility||{}),
 initiatives:Array.isArray(v.initiatives)?v.initiatives.filter(function(x){return x&&typeof x.id==="string"&&typeof x.title==="string"}).slice(0,100):JSON.parse(JSON.stringify(initialInitiatives)),
 links:Array.isArray(v.links)?v.links.filter(function(x){return x&&typeof x.id==="string"}).slice(0,60):JSON.parse(JSON.stringify(initialLinks)),
 city:Array.isArray(v.city)?[String(v.city[0]||"sohar"),String(v.city[1]||"muscat")]:["sohar","muscat"],
 sound:!!v.sound
 };
}
var cfg=getSaved(),activeCat="all",adminTab="portals",editingInit="",editingLink="",audioOn=false,scheduleSession=false;
function $ (s){return document.querySelector(s)}
function store(){try{localStorage.setItem(KEY,JSON.stringify(cfg));return true}catch(e){alert("تعذر الحفظ في المتصفح");return false}}
function say(s){var n=$("#afa2-admin-notice");if(n)n.textContent=s}
function insert(){
 var top='<div class="afa2-topline afa2-no-print" id="afa2-topline"><div class="container afa2-topline-inner"><div id="afa2-date" class="afa2-date">◷ التاريخ واليوم</div><div class="afa2-cityrow"><div class="afa2-weather-unit">☀ <select data-afa2-city="0" aria-label="المدينة الأولى"></select><span class="afa2-temperature" id="afa2-temp-0">— °م</span></div><div class="afa2-weather-unit">☀ <select data-afa2-city="1" aria-label="المدينة الثانية"></select><span class="afa2-temperature" id="afa2-temp-1">— °م</span></div></div><small class="afa2-weather-note" id="afa2-weather-note">تحديث الطقس التجريبي</small></div></div>';
 $(".site-header").insertAdjacentHTML("beforebegin",top);
 var hub='<section class="afa2-expansion afa2-hub afa2-no-print" id="afa2-hub"><div class="afa2-shell"><div class="afa2-heading"><span class="afa2-kicker">بوابة آفاق الفضائية</span><h2>عالم المعرفة يدور حولك</h2><p>مواد العلوم والآداب كواكب متحركة داخل اللوحة الزرقاء؛ اختر كوكبًا للانتقال إلى مادته.</p></div>'+
 '<div class="afa2-cols"><aside class="afa2-aside" aria-label="مواقع رياضية وثقافية"><h3>الرياضة والثقافة</h3><p>روابط مختارة داخل إطارات مميزة</p><div id="afa2-right-links"></div></aside>'+
 '<div class="afa2-orbit-panel" id="afa2-orbit-panel" aria-label="لوحة الكواكب التعليمية المتحركة"><div class="afa2-rays"></div><div class="afa2-stars"></div><div class="afa2-panel-top"><h3>كواكب العلوم والآداب</h3><p>حين تتلاقى المعارف ينبثق الإبداع</p></div><div class="afa2-orbit-system">'+
 subjects.map(function(p,i){var ins=[7,12,17,21,25,29],dur=[28,37,47,60,73,83],diam=[67,64,62,58,55,52];
  return '<div class="afa2-track" style="--ring:'+ins[i]+'%;--duration:'+dur[i]+'s;--direction:'+(i%2?'reverse':'normal')+';--inverse-direction:'+(i%2?'normal':'reverse')+'"><button type="button" data-afa2-subject="'+p.id+'" class="afa2-planet" style="--planet-size:'+diam[i]+'px;--planet-a:'+p.a+';--planet-b:'+p.b+'" title="'+clean(p.name)+'"><strong>'+clean(p.abbr)+'</strong><small>'+clean(p.name)+'</small></button></div>';
 }).join("")+
 '<div class="afa2-core"><span>AFAQ</span></div></div><div class="afa2-impact"></div>'+
 '<div class="afa2-panel-footer"><button type="button" class="afa2-control" id="afa2-explosion">✦ إطلاق الإشعاع</button><button type="button" class="afa2-control" id="afa2-sound">🔇 تفعيل الصوت</button><button type="button" class="afa2-control" id="afa2-pause">⏸ إيقاف الحركة</button></div></div>'+
 '<aside class="afa2-aside" aria-label="مواقع ترفيهية وتعليمية"><h3>المعرفة والترفيه</h3><p>مواقع وألعاب ومبادرات</p><div id="afa2-left-links"></div></aside></div>'+
 '<div class="afa2-subject-matrix">'+subjects.map(function(p){return '<a href="#catalogSection" data-afa2-subject="'+p.id+'">'+clean(p.name)+' • '+clean(p.abbr)+'</a>'}).join("")+'</div></div></section>';
 $("#homeBenefits").insertAdjacentHTML("beforebegin",hub);
 var initiative='<section class="afa2-expansion afa2-initiative-wrap afa2-section afa2-no-print" id="afa2-initiatives"><div class="afa2-shell"><div class="afa2-heading"><span class="afa2-kicker">مبادرات العلم والفكر</span><h2>مركز مبادرات الأكاديمية</h2><p>مبادرات الأستاذ سعيد الرياضية والذهنية، إلى جانب مبادرات العلوم والآداب وعلم النفس والقياس والتقويم والأنشطة الاجتماعية والرياضية.</p></div>'+
 '<div class="afa2-filter-bar" id="afa2-init-filters"></div><div class="afa2-initiatives" id="afa2-initiative-grid"></div></div></section>';
 $("#workspaceSection").insertAdjacentHTML("beforebegin",initiative);
 var library='<section class="afa2-expansion afa2-section afa2-no-print" id="afa2-library"><div class="afa2-shell"><div class="afa2-heading"><span class="afa2-kicker">موسوعة آفاق</span><h2>مكتبة العلماء والمفكرين والآداب</h2><p>مكتبة متعددة المواد تنطلق بالرياضيات والعلوم وتتسع للغة والآداب والقياس والتقويم.</p></div><div class="afa2-initiatives">'+[
 ["📐","الرياضيات عبر الحضارات","الأعداد والنظم الهندسية، الخوارزمي وابن الهيثم وإقليدس ونيوتن وأويلر وأبحاث العصر الحديث."],
 ["🔭","علماء العلوم","ابن الهيثم والبيروني وماري كوري ونيوتن وآينشتاين ومسارات البحث العلمي."],
 ["✒","رواد اللغة والأدب","الخليل بن أحمد الفراهيدي وسيبويه والمتنبي وأعلام الأدب العربي والعالمي."],
 ["🧠","علم النفس والتقويم","التعلم والذاكرة والقياس وبناء الاختبارات والتقويم وتحليل النتائج."],
 ["🌍","التاريخ والمجتمع","الحضارات والثقافات وتاريخ عمان والجغرافيا والمواطنة."],
 ["🏅","الرياضة والصحة","التربية البدنية وقواعد الرياضات والمعلومات الصحية والمهارات الحركية."]
 ].map(function(x){return '<article class="afa2-init-card"><span class="afa2-init-icon">'+x[0]+'</span><h3>'+x[1]+'</h3><p>'+x[2]+'</p><button type="button" data-afa2-library="'+clean(x[1])+'">عرض المحاور العلمية ←</button></article>'}).join("")+'</div></div></section>';
 $("#workspaceSection").insertAdjacentHTML("beforebegin",library);
 var printing='<section class="afa2-expansion afa2-section afa2-printwrap afa2-no-print" id="afa2-print"><div class="afa2-shell"><div class="afa2-heading"><span class="afa2-kicker">الوثائق والشهادات</span><h2>مركز الطباعة وشهادات المشاركة</h2><p>طباعة الجداول والقوائم وشهادة للمنتسب أو المشارك، مع الاحتفاظ بنموذج الشهادة الرسمي للتفعيل بعد الاعتماد.</p></div><div class="afa2-print-grid"><div class="afa2-print-card"><h3>✦ إعداد شهادة</h3><form id="afa2-cert-form"><div class="afa2-print-form"><label>اسم المشارك / المنتسب<input id="afa2-cert-name" required maxlength="100" placeholder="أدخل اسم المشارك"></label><label>نوع الشهادة<select id="afa2-cert-kind"><option value="المشاركة">شهادة مشاركة</option><option value="الانتساب">شهادة انتساب</option><option value="الإتمام">شهادة إتمام برنامج</option><option value="التميز">شهادة تميز</option></select></label><label>البرنامج أو المادة<input id="afa2-cert-subject" required maxlength="100" value="برنامج أكاديمية آفاق ماذس"></label><label>تاريخ الشهادة<input id="afa2-cert-date" type="date" required></label></div><div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:15px"><button type="submit" class="afa2-btn afa2-btn-primary">معاينة الشهادة</button><button type="button" id="afa2-print-schedule" class="afa2-btn">طباعة جدول الحصص</button><button type="button" id="afa2-print-catalog" class="afa2-btn">طباعة فهرس المواد</button></div></form><p>الشهادات الصادرة من النموذج التجريبي غير معتمدة ولا تحمل توقيعًا أو ختمًا رسميًا.</p></div><div class="afa2-print-card"><div id="afa2-cert-preview" class="afa2-cert-paper"><span class="afa2-cert-demo">نسخة تجريبية غير معتمدة</span><div class="afa2-cert-org">أكاديمية آفاق ماذس التعليمية للعلوم والآداب</div><h3>شهادة مشاركة</h3><p>تُمنح هذه الشهادة تقديرًا للمشاركة في أنشطة الأكاديمية</p><div class="afa2-cert-recipient">اسم المشارك</div><p>العلم والمعرفة والأدب قيم نعتز بها</p><div class="afa2-cert-sign"><span>إدارة الأكاديمية</span><span>التاريخ</span></div></div><button class="afa2-btn" type="button" id="afa2-print-certificate" style="margin-top:14px">🖨 طباعة الشهادة المعروضة</button></div></div></div></section>';
 $("#financeSection").insertAdjacentHTML("beforebegin",printing);
 var leisure='<section class="afa2-expansion afa2-section afa2-leisure afa2-no-print" id="afa2-leisure"><div class="afa2-shell"><div class="afa2-heading"><span class="afa2-kicker">أفق آخر للتعلم</span><h2>المرح والمسابقات والتحديات</h2><p>برامج متنوعة قابلة للزيادة والتغيير، مستقلة عن نظام درجات طلاب المدرسة.</p></div><div class="afa2-leisure-grid">'+[
 ["🏆","نجوم آفاق الجديدة","مسابقات في الرياضيات والعلوم والآداب، بنماذج ومستويات متعددة."],
 ["🎮","مساحة الألعاب","ألعاب بناء وتفكير وتحديات علمية وترفيهية مختارة."],
 ["🎭","المهرجان الثقافي","إلقاء وكتابة ومسرح وأبحاث ومشروعات واكتشاف المواهب."]
 ].map(function(x){return '<article class="afa2-leisure-card"><span style="font-size:32px">'+x[0]+'</span><strong>'+x[1]+'</strong><p>'+x[2]+'</p><button type="button" data-afa2-leisure="'+clean(x[1])+'">عرض البرنامج ←</button></article>'}).join("")+'</div></div></section>';
 $(".closing-banner").insertAdjacentHTML("beforebegin",leisure);
 var admin='<section class="afa2-expansion afa2-admin-shelf afa2-no-print" id="afa2-manage"><div class="afa2-shell"><div class="afa2-admin-shell"><div class="afa2-admin-head"><div><span class="afa2-kicker">إدارة البوابات كلها</span><h2>مركز إدارة الأكاديمية الشامل</h2><p>معاينة لتحكم المشرف في البوابات والمواد والمبادرات والروابط والمدن. الحفظ محلي في هذا المتصفح فقط.</p></div><button type="button" id="afa2-restore-all" class="afa2-btn">استعادة إعدادات العرض الافتراضية</button></div><div class="afa2-admin-tabs" id="afa2-admin-tabs"></div><div class="afa2-admin-panel" id="afa2-admin-content"></div><div class="afa2-admin-hint">هذه إعدادات معاينة وليس نظام صلاحيات فعليًا. يلزم خادم آمن للمشرف، ومستودع بيانات منفصل، وسجل تدقيق، قبل تفعيل الإدارة للطلاب والمعلمين.</div><div class="afa2-status" id="afa2-admin-notice" role="status"></div></div></div></section>';
 $("#financeSection").insertAdjacentHTML("afterend",admin);
 $("#financeSection .admin-sidebar .admin-menu").insertAdjacentHTML("beforeend",'<a href="#afa2-manage" class="admin-tab" style="display:block;text-decoration:none">✦ إدارة جميع بوابات الأكاديمية</a>');
 $(".site-footer").insertAdjacentHTML("beforebegin",'<div class="afa2-visit afa2-no-print"><span>زائرنا الكريم، نتمنى لك التوفيق والنجاح</span><span>عدد الزيارات <strong id="afa2-visits">2000</strong></span></div>');
 document.body.insertAdjacentHTML("beforeend",'<button class="afa2-to-top afa2-no-print" id="afa2-up" type="button" aria-label="العودة إلى أعلى الصفحة">↑</button><div id="afa2-print-document"></div>');
}
function setVisibility(){
 var mapping={hub:"#afa2-hub",initiatives:"#afa2-initiatives",library:"#afa2-library",print:"#afa2-print",leisure:"#afa2-leisure",homeHero:"#homeHero",homeBenefits:"#homeBenefits",catalogSection:"#catalogSection",liveSection:"#liveSection",pricingSection:"#pricingSection",workspaceSection:"#workspaceSection",financeSection:"#financeSection"};
 Object.entries(mapping).forEach(function(x){var el=$(x[1]);if(el)el.hidden=cfg.visibility[x[0]]===false});
}
function renderLinks(){
 ["right","left"].forEach(function(side){
  var target=$("#afa2-"+side+"-links");if(!target)return;
  target.innerHTML=cfg.links.filter(function(l){return l.side===side&&l.enabled!==false&&validHref(l.url)}).map(function(l){
   var ext=l.url.indexOf("https://")===0;return '<a class="afa2-sideitem" href="'+clean(l.url)+'" '+(ext?'target="_blank" rel="noopener noreferrer"':"")+'><span class="afa2-sideicon">'+clean(l.icon||"🔗")+'</span><span>'+clean(l.title)+'<small>'+clean(l.desc)+'</small></span></a>';
  }).join("");
 });
}
function validHref(u){return /^https:\/\/[^ <>"']{3,500}$/i.test(String(u||""))||/^#[a-z0-9-]{2,75}$/i.test(String(u||""))}
function catName(id){var c=categories.find(function(x){return x[0]===id});return c?c[1]:"مبادرة"}
function renderInitiatives(){
 $("#afa2-init-filters").innerHTML='<button type="button" data-afa2-filter="all" class="afa2-filter'+(activeCat==="all"?" active":"")+'">جميع المبادرات</button>'+categories.map(function(c){return '<button type="button" data-afa2-filter="'+c[0]+'" class="afa2-filter'+(activeCat===c[0]?" active":"")+'">'+c[1]+'</button>'}).join("");
 $("#afa2-initiative-grid").innerHTML=cfg.initiatives.filter(function(x){return activeCat==="all"||x.cat===activeCat}).map(function(x){
  return '<article class="afa2-init-card"><span class="afa2-init-category">'+clean(catName(x.cat))+'</span><span class="afa2-init-icon">'+clean(x.icon||"✦")+'</span><h3>'+clean(x.title)+'</h3><p>'+clean(x.desc)+'</p><button type="button" data-afa2-show="'+clean(x.id)+'">الدخول إلى المبادرة ←</button></article>';
 }).join("")||'<p>لا توجد مبادرات منشورة في هذا القسم حاليًا.</p>';
}
function showInitiative(id){
 var x=cfg.initiatives.find(function(z){return z.id===id});if(!x)return;
 var body='<span class="pill amber">'+clean(catName(x.cat))+'</span><h2>'+clean(x.title)+'</h2><p>'+clean(x.desc)+'</p>';
 if(x.id==="mix")body+='<form id="afa2-mixer-form"><div class="afa2-admin-fields"><label>المدخل الأول<input name="a" type="number" step="any" value="12" required></label><label>المدخل الثاني<input name="b" type="number" step="any" value="3" required></label><label>العملية<select name="op"><option value="+">جمع +</option><option value="-">طرح −</option><option value="*">ضرب ×</option><option value="/">قسمة ÷</option></select></label></div><button class="afa2-btn afa2-btn-primary" type="submit">تشغيل الخلاط الرياضي ⚙</button><p id="afa2-mixer-output" aria-live="polite"></p></form>';
 else if(x.id==="primes")body+='<button type="button" class="afa2-btn" id="afa2-prime-demo">عرض الأعداد الأولية حتى 50</button><p id="afa2-prime-output"></p>';
 else body+='<div class="afa2-admin-hint">مسار مخصص لرفع درس المبادرة وملفاتها وأسئلتها وتجاربها بعد إقرار المحتوى العلمي.</div>';
 var dlg=$("#detailDialog");$("#detailBody").innerHTML=body;if(dlg){if(dlg.open)dlg.close();dlg.showModal()}
}
function tempOptions(){var c=Object.entries(cityMap).map(function(x){return '<option value="'+x[0]+'">'+x[1].name+'</option>'}).join("");
 document.querySelectorAll("[data-afa2-city]").forEach(function(s){var idx=Number(s.dataset.afa2City);s.innerHTML=c;s.value=cityMap[cfg.city[idx]]?cfg.city[idx]:"muscat"});
}
function renderDate(){var d=new Date();$("#afa2-date").textContent="🗓 "+new Intl.DateTimeFormat("ar-OM",{weekday:"long",day:"numeric",month:"long",year:"numeric",timeZone:"Asia/Muscat"}).format(d)}
async function weather(){
 /* Open-Meteo free API: demonstration only. Commercial use requires a licensed endpoint. */
 $("#afa2-weather-note").textContent="الطقس: عرض تجريبي • المصدر Open-Meteo";
 await Promise.all(cfg.city.map(async function(city,index){
  var x=cityMap[city];var out=$("#afa2-temp-"+index);if(!x||!out)return;out.textContent="…";
  var url="https://api.open-meteo.com/v1/forecast?latitude="+x.lat+"&longitude="+x.lon+"&current=temperature_2m&timezone=Asia%2FMuscat";
  try{
   var signal=typeof AbortSignal!=="undefined"&&AbortSignal.timeout?AbortSignal.timeout(9000):undefined;
   var r=await fetch(url,{cache:"no-store",signal:signal});
   if(!r.ok)throw new Error("weather");
   var data=await r.json();var t=Number(data.current&&data.current.temperature_2m);
   out.textContent=Number.isFinite(t)?Math.round(t)+"°م":"— °م";
  }catch(e){out.textContent="— °م";out.title="تعذر تحميل الطقس الآن"}
 }));
}
function getVisits(){
 var n=2000;try{n=Math.max(2000,Math.min(900000,Number(localStorage.getItem(VISIT_KEY))||2000));if(!sessionStorage.getItem(VISIT_KEY)){n++;localStorage.setItem(VISIT_KEY,String(n));sessionStorage.setItem(VISIT_KEY,"1")}}catch(e){}
 $("#afa2-visits").textContent=n.toLocaleString("ar-OM");
}
function doExplosion(){
 var p=$("#afa2-orbit-panel");if(!p)return;p.classList.remove("is-bursting");void p.offsetWidth;p.classList.add("is-bursting");setTimeout(function(){p.classList.remove("is-bursting")},1580);
 if(audioOn)playExplosion();
}
function playExplosion(){
 var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;try{
  var c=new AC(),t=c.currentTime,osc=c.createOscillator(),gain=c.createGain();
  osc.type="sawtooth";osc.frequency.setValueAtTime(220,t);osc.frequency.exponentialRampToValueAtTime(44,t+1.3);
  gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.11,t+.05);gain.gain.exponentialRampToValueAtTime(.0001,t+1.4);
  osc.connect(gain);gain.connect(c.destination);osc.start(t);osc.stop(t+1.5);
  var len=Math.round(c.sampleRate*.8),buf=c.createBuffer(1,len,c.sampleRate),arr=buf.getChannelData(0);for(var i=0;i<len;i++)arr[i]=(Math.random()*2-1)*(1-i/len);
  var noise=c.createBufferSource(),ngain=c.createGain();noise.buffer=buf;ngain.gain.setValueAtTime(.12,t);ngain.gain.exponentialRampToValueAtTime(.0001,t+.8);noise.connect(ngain);ngain.connect(c.destination);noise.start(t);noise.stop(t+.85);
  setTimeout(function(){c.close().catch(function(){})},2200);
 }catch(e){}
}
function todayDate(){var d=new Date(),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),day=String(d.getDate()).padStart(2,"0");return y+"-"+m+"-"+day}
function printDoc(html){
 var root=$("#afa2-print-document");root.innerHTML=html;
 document.body.classList.add("afa2-printing");
 window.print();
 setTimeout(function(){document.body.classList.remove("afa2-printing");root.innerHTML=""},900);
}
function doCertificate(){
 var f=$("#afa2-cert-form");if(!f.reportValidity())return;
 var name=$("#afa2-cert-name").value.trim().slice(0,100),kind=$("#afa2-cert-kind").value,subject=$("#afa2-cert-subject").value.trim().slice(0,100),date=$("#afa2-cert-date").value;
 var html='<span class="afa2-cert-demo">نسخة تجريبية غير معتمدة</span><div class="afa2-cert-org">أكاديمية آفاق ماذس التعليمية للعلوم والآداب</div><h3>شهادة '+clean(kind)+'</h3><p>يسر الأكاديمية منح هذه الشهادة إلى</p><div class="afa2-cert-recipient">'+clean(name||"اسم المشارك")+'</div><p>تقديرًا لمشاركته / انتسابه في <strong>'+clean(subject)+'</strong></p><p>مع أطيب الأمنيات بالتقدم والنجاح</p><div class="afa2-cert-sign"><span>إدارة الأكاديمية — بدون توقيع أو ختم</span><span>'+clean(date)+'</span></div>';
 $("#afa2-cert-preview").innerHTML=html;return html;
}
function headerPrint(title,body){
 var t='<section class="afa2-cert-paper" style="min-height:auto;text-align:right"><h3>'+clean(title)+'</h3><p>أكاديمية آفاق ماذس التعليمية للعلوم والآداب • نسخة إرشادية تجريبية</p><div style="font-size:14px;line-height:2">'+body+'</div></section>';
 printDoc(t);
}
function adminTabs(){
 var tabs=[["portals","البوابات والأقسام"],["initiatives","المبادرات"],["links","الروابط الجانبية"],["cities","المدن والطقس"],["print","الطباعة والانتساب"]];
 $("#afa2-admin-tabs").innerHTML=tabs.map(function(t){return '<button type="button" class="afa2-admin-tab'+(adminTab===t[0]?" active":"")+'" data-afa2-admin-tab="'+t[0]+'">'+t[1]+'</button>'}).join("");
 var intro='<p class="afa2-admin-hint">المشرف الرئيسي في الإصدار النهائي سيتمكن من التحكم في جميع البوابات وحسابات المعلمين والمحتوى والرسوم. في هذا النموذج لا توجد مصادقة: التعديلات محلية فقط.</p>';
 var content=$("#afa2-admin-content");
 if(adminTab==="portals"){
  var names={hub:"لوحة الكواكب والروابط",initiatives:"المبادرات",library:"مكتبة العلماء والآداب",print:"الشهادات والطباعة",leisure:"الترفيه والمسابقات",homeHero:"واجهة الأكاديمية الرئيسية",homeBenefits:"الخدمات الرئيسية",catalogSection:"الصفوف والمواد",liveSection:"الفصول المباشرة",pricingSection:"الباقات والاشتراكات",workspaceSection:"لوحات المستخدمين",financeSection:"الإدارة المالية"};
  content.innerHTML=intro+'<div class="afa2-admin-grid">'+Object.keys(names).map(function(k){return '<div class="afa2-admin-row"><label for="afa2-visible-'+k+'">'+names[k]+'</label><input id="afa2-visible-'+k+'" type="checkbox" data-afa2-visible="'+k+'" '+(cfg.visibility[k]!==false?"checked":"")+'></div>'}).join("")+'</div><p class="afa2-admin-hint">يؤثر إخفاء البوابة في العرض فقط؛ لا يمثل إجراءً أمنيًا. تقييد الوصول للمشتركين والمعلمين سيُنفذ على الخادم.</p>';
 }else if(adminTab==="initiatives"){
  var row=cfg.initiatives.map(function(x){return '<div class="afa2-admin-item"><strong>'+clean(x.icon)+" "+clean(x.title)+'</strong><br><small>'+clean(catName(x.cat))+'</small><div class="afa2-admin-actions"><button type="button" class="afa2-btn" data-afa2-edit-init="'+clean(x.id)+'">تعديل</button><button type="button" class="afa2-btn" data-afa2-del-init="'+clean(x.id)+'">حذف</button></div></div>'}).join("");
  var editor=cfg.initiatives.find(function(x){return x.id===editingInit})||{title:"",cat:"math",icon:"✦",desc:""};
  content.innerHTML=intro+'<form id="afa2-form-init"><h3>'+(editingInit?"تعديل المبادرة":"إضافة مبادرة جديدة")+'</h3><div class="afa2-admin-fields"><label>عنوان المبادرة<input name="title" required maxlength="90" value="'+clean(editor.title)+'"></label><label>التصنيف<select name="cat">'+categories.map(function(c){return '<option value="'+c[0]+'" '+(c[0]===editor.cat?"selected":"")+'>'+c[1]+'</option>'}).join("")+'</select></label><label>رمز المبادرة<input name="icon" maxlength="4" value="'+clean(editor.icon)+'"></label><label style="grid-column:1/-1">وصف موجز<textarea rows="3" name="desc" required maxlength="350">'+clean(editor.desc)+'</textarea></label></div><button class="afa2-btn afa2-btn-primary" type="submit">حفظ المبادرة</button> <button class="afa2-btn" type="button" id="afa2-init-clear">إضافة جديدة</button></form><h3 style="margin-top:20px">المبادرات الحالية</h3>'+row;
 }else if(adminTab==="links"){
  var editor=cfg.links.find(function(x){return x.id===editingLink})||{side:"right",title:"",icon:"🔗",desc:"",url:"https://",enabled:true};
  content.innerHTML=intro+'<form id="afa2-form-link"><h3>'+(editingLink?"تعديل رابط":"إضافة موقع جديد")+'</h3><div class="afa2-admin-fields"><label>عنوان الموقع<input name="title" maxlength="80" required value="'+clean(editor.title)+'"></label><label>الجانب<select name="side"><option value="right" '+(editor.side==="right"?"selected":"")+'>الجانب الأيمن</option><option value="left" '+(editor.side==="left"?"selected":"")+'>الجانب الأيسر</option></select></label><label>أيقونة<input name="icon" maxlength="4" value="'+clean(editor.icon)+'"></label><label>وصف قصير<input name="desc" maxlength="100" value="'+clean(editor.desc)+'"></label><label style="grid-column:1/-1">الرابط الحقيقي (لن يظهر كعنوان للمستخدم)<input name="url" required maxlength="500" value="'+clean(editor.url)+'"></label></div><label><input type="checkbox" name="enabled" '+(editor.enabled!==false?"checked":"")+'> إظهار الرابط</label><div class="afa2-admin-actions"><button type="submit" class="afa2-btn afa2-btn-primary">حفظ الرابط</button><button type="button" class="afa2-btn" id="afa2-link-clear">إضافة جديد</button></div></form><h3>المواقع المسجلة</h3>'+cfg.links.map(function(x){return '<div class="afa2-admin-item"><strong>'+clean(x.title)+'</strong> <small>'+(x.side==="right"?"يمين":"يسار")+'</small><div class="afa2-admin-actions"><button type="button" class="afa2-btn" data-afa2-edit-link="'+clean(x.id)+'">تعديل</button><button type="button" class="afa2-btn" data-afa2-del-link="'+clean(x.id)+'">حذف</button></div></div>'}).join("");
 }else if(adminTab==="cities"){
  content.innerHTML=intro+'<h3>تحديد المدينتين العلويتين</h3><form id="afa2-form-cities"><div class="afa2-admin-fields">'+[0,1].map(function(i){return '<label>المدينة '+(i+1)+'<select name="city'+i+'">'+Object.entries(cityMap).map(function(x){return '<option value="'+x[0]+'" '+(cfg.city[i]===x[0]?"selected":"")+'>'+x[1].name+'</option>'}).join("")+'</select></label>'}).join("")+'</div><button type="submit" class="afa2-btn afa2-btn-primary">حفظ المدن وتحديث العرض</button></form><p class="afa2-admin-hint">يعرض النموذج درجات الحرارة التقريبية من Open-Meteo للاختبار؛ خدمة Open-Meteo المجانية للاستخدام غير التجاري فقط، ويستلزم إطلاق الأكاديمية التجارية ترخيصًا أو مزود طقس مرخصًا.</p>';
 }else {
  content.innerHTML=intro+'<div class="afa2-admin-grid"><div class="afa2-admin-item"><strong>شهادات المشاركين والمنتسبين</strong><p>النموذج الحالي للطباعة والتجربة، دون توقيع أو اعتماد رسمي.</p><a href="#afa2-print" class="afa2-btn" style="display:inline-block">فتح مركز الشهادات</a></div><div class="afa2-admin-item"><strong>كشف الجداول وفهرس المحتوى</strong><p>طباعة بيانات عامة، مع تطوير قوالب خاصة للمعلم والمشرف لاحقًا.</p><a href="#afa2-print" class="afa2-btn" style="display:inline-block">فتح مركز الطباعة</a></div></div>';
 }
}
function parseForm(form){return new FormData(form)}
function bind(){
 document.addEventListener("click",function(e){
  var t=e.target.closest("[data-afa2-filter]");if(t){activeCat=t.dataset.afa2Filter;renderInitiatives();return}
  t=e.target.closest("[data-afa2-show]");if(t){showInitiative(t.dataset.afa2Show);return}
  t=e.target.closest("[data-afa2-subject]");if(t){e.preventDefault();var cat=t.dataset.afa2Subject;var b=document.querySelector('.subject-card[data-subject="'+cat+'"]');if(b){b.click();document.getElementById("catalogSection").scrollIntoView({behavior:"smooth"})}return}
  t=e.target.closest("[data-afa2-library]");if(t){detail("مكتبة "+t.dataset.afa2Library,"تتوسع المكتبة بالمراجع والملفات بعد مراجعة حقوق النشر واعتماد المحتوى.");return}
  t=e.target.closest("[data-afa2-leisure]");if(t){detail(t.dataset.afa2Leisure,"واجهة أولية لبرنامج قابل لإضافة المراحل والجوائز وشروط المشاركة لاحقًا.");return}
  t=e.target.closest("[data-afa2-admin-tab]");if(t){adminTab=t.dataset.afa2AdminTab;adminTabs();return}
  t=e.target.closest("[data-afa2-edit-init]");if(t){editingInit=t.dataset.afa2EditInit;adminTabs();return}
  t=e.target.closest("[data-afa2-del-init]");if(t){if(confirm("حذف هذه المبادرة من هذا المتصفح؟")){cfg.initiatives=cfg.initiatives.filter(function(x){return x.id!==t.dataset.afa2DelInit});store();renderInitiatives();adminTabs()}return}
  t=e.target.closest("[data-afa2-edit-link]");if(t){editingLink=t.dataset.afa2EditLink;adminTabs();return}
  t=e.target.closest("[data-afa2-del-link]");if(t){if(confirm("حذف هذا الرابط من هذا المتصفح؟")){cfg.links=cfg.links.filter(function(x){return x.id!==t.dataset.afa2DelLink});store();renderLinks();adminTabs()}return}
  if(e.target.id==="afa2-init-clear"){editingInit="";adminTabs();return}
  if(e.target.id==="afa2-link-clear"){editingLink="";adminTabs();return}
  if(e.target.id==="afa2-explosion"){doExplosion();return}
  if(e.target.id==="afa2-sound"){audioOn=!audioOn;e.target.textContent=audioOn?"🔊 إيقاف الصوت":"🔇 تفعيل الصوت";return}
  if(e.target.id==="afa2-pause"){var p=$("#afa2-orbit-panel"),pause=p.classList.toggle("is-paused");e.target.textContent=pause?"▶ تشغيل الحركة":"⏸ إيقاف الحركة";return}
  if(e.target.id==="afa2-up"){window.scrollTo({top:0,behavior:"smooth"});return}
  if(e.target.id==="afa2-print-certificate"){var cert=$("#afa2-cert-preview");printDoc('<section class="afa2-cert-paper">'+cert.innerHTML+'</section>');return}
  if(e.target.id==="afa2-print-schedule"){headerPrint("جدول حصص الأكاديمية",'<p>لم تُعتمد مواعيد للحصص المباشرة بعد. يظهر الجدول المعتمد هنا بعد إضافته من إدارة الأكاديمية.</p>');return}
  if(e.target.id==="afa2-print-catalog"){headerPrint("فهرس المواد التعليمية",'<ol>'+subjects.map(function(p){return '<li>'+clean(p.name)+'</li>'}).join("")+'</ol>');return}
  if(e.target.id==="afa2-restore-all"){if(confirm("إعادة إعدادات هذه المعاينة فقط إلى الوضع الأصلي؟")){cfg=JSON.parse(JSON.stringify(defaults));editingInit="";editingLink="";store();renderLinks();renderInitiatives();setVisibility();tempOptions();weather();adminTabs();say("تمت استعادة الإعدادات الأصلية في هذا المتصفح.")}return}
  if(e.target.id==="afa2-prime-demo"){var p=[];for(var n=2;n<=50;n++){var prime=true;for(var k=2;k*k<=n;k++){if(n%k===0){prime=false;break}}if(prime)p.push(n)}$("#afa2-prime-output").textContent="الأعداد الأولية حتى ٥٠: "+p.join("، ");return}
  t=e.target.closest("[data-afa2-visible]");if(t){var key=t.dataset.afa2Visible;cfg.visibility[key]=!!t.checked;store();setVisibility();say("تم حفظ حالة قسم «"+key+"» للمعاينة المحلية.");return}
 });
 document.addEventListener("submit",function(e){
  var id=e.target.id;if(!id||id.indexOf("afa2-")!==0)return;e.preventDefault();
  if(id==="afa2-cert-form"){if(doCertificate())document.getElementById("afa2-cert-preview").scrollIntoView({behavior:"smooth"});return}
  if(id==="afa2-mixer-form"){var f=parseForm(e.target),a=Number(f.get("a")),b=Number(f.get("b")),op=f.get("op");var out=op==="+"?a+b:op==="-"?a-b:op==="*"?a*b:b===0?"غير معرف (لا يجوز القسمة على صفر)":a/b;$("#afa2-mixer-output").textContent="مدخلات: "+a+" و "+b+" ← العملية "+op+" ← الناتج: "+out;return}
  if(id==="afa2-form-cities"){var f=parseForm(e.target);cfg.city=[String(f.get("city0")),String(f.get("city1"))];store();tempOptions();weather();say("حُفظت المدينتان في المعاينة.");return}
  if(id==="afa2-form-init"){var f=parseForm(e.target),title=String(f.get("title")||"").trim(),desc=String(f.get("desc")||"").trim(),cat=String(f.get("cat"));if(!title||!desc||!categories.some(function(x){return x[0]===cat}))return;
   var entity={id:editingInit||"user-"+Date.now(),title:title.slice(0,90),cat:cat,desc:desc.slice(0,350),icon:String(f.get("icon")||"✦").slice(0,4)};
   if(editingInit){cfg.initiatives=cfg.initiatives.map(function(x){return x.id===editingInit?entity:x})}else cfg.initiatives.push(entity);
   editingInit="";store();adminTabs();renderInitiatives();say("تم حفظ المبادرة ضمن إعدادات المعاينة.");return}
  if(id==="afa2-form-link"){var f=parseForm(e.target),url=String(f.get("url")||"").trim();if(!validHref(url)){say("الرابط غير صالح: استخدم HTTPS أو رابطًا داخليًا #.");return}
   var x={id:editingLink||"link-"+Date.now(),title:String(f.get("title")||"").trim().slice(0,80),side:f.get("side")==="left"?"left":"right",icon:String(f.get("icon")||"🔗").slice(0,4),desc:String(f.get("desc")||"").trim().slice(0,100),url:url,enabled:f.has("enabled")};
   if(!x.title)return;
   if(editingLink)cfg.links=cfg.links.map(function(l){return l.id===editingLink?x:l});else cfg.links.push(x);
   editingLink="";store();adminTabs();renderLinks();say("حُفظ الرابط في المعاينة.");return}
 });
 document.querySelectorAll("[data-afa2-city]").forEach(function(el){el.addEventListener("change",function(){var k=Number(this.dataset.afa2City);cfg.city[k]=this.value;store();weather()})});
 document.addEventListener("scroll",function(){$("#afa2-up").classList.toggle("visible",scrollY>420)},{passive:true});
 window.addEventListener("afterprint",function(){document.body.classList.remove("afa2-printing");$("#afa2-print-document").innerHTML=""});
}
function detail(title,desc){var dlg=$("#detailDialog");$("#detailBody").innerHTML='<h2>'+clean(title)+'</h2><p>'+clean(desc)+'</p><button id="okDialog" class="btn btn-dark">حسنًا</button>';if(dlg){if(dlg.open)dlg.close();dlg.showModal()}}
insert();setVisibility();renderLinks();renderInitiatives();renderDate();tempOptions();weather();getVisits();adminTabs();
$("#afa2-cert-date").value=todayDate();bind();
})();