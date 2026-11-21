/* Afaq Math journey directory: comprehensive, searchable public and authenticated site map. */
(function(){
'use strict';
if(typeof hubHome!=='function'||typeof route!=='function'||typeof render!=='function')return;
const PAGE='afaq_directory';
const sections=[
 {id:'homepage',icon:'🏠',title:'الصفحة الرئيسية',desc:'انتقل مباشرة إلى أي قسم ظاهر في الصفحة الرئيسية',
  items:[
   ['الرئيسية كاملة','العودة إلى الصفحة الرئيسية','route','home','🏠'],
   ['العلم العُماني وعنوان المنصة','الهوية الوطنية والعنوان الذهبي المتحرك','anchor','title','🇴🇲'],
   ['طرق الدخول','بوابات دخول الطالب وولي الأمر والإدارة والمشرف','anchor','entry','🔐'],
   ['ما هي منصة آفاق ماث؟','التعريف بالمنصة وأهدافها','anchor','about','💠'],
   ['الإعلانات والروابط','صور وروابط الصفحة الرئيسية','anchor','promos','📸'],
   ['لوحة شرف الطلاب','ست فئات للطلاب المكرمين','anchor','honor','🏅'],
   ['أبواب المعرفة','اختصارات المعرفة والتعلم','anchor','knowledge','📖'],
   ['المبادرات العلمية','شرح التجارب الرياضية وأمثلتها','anchor','scientific','🧪'],
   ['المبادرات المجتمعية','معرض الصور والتوثيق المجتمعي','anchor','community','🤝'],
   ['قناة يوتيوب التعليمية','فيديوهات قناة الأستاذ سعيد البريكي','anchor','youtube','▶️'],
   ['المبادرات الصحية والبيئية','المساحات الجديدة للمبادرات','anchor','other','🌿'],
   ['أخبار المنصة والتحديثات','مستجدات الأخبار والتوجيهات','anchor','news','🗞️'],
   ['مباريات اليوم','صفحة مباريات اليوم','route','matches_today','⚽']
  ]},
 {id:'study',icon:'🎓',title:'التعليم والتعلّم',desc:'الصفوف والوحدات والدروس والواجبات والتقويم والمشروعات',
  items:[
   ['المنصة العلمية للطلاب','تصفح جميع الصفوف والمقررات','route','learning','📘'],
   ['رياضيات الصف الخامس','الوحدات والدروس والتدريبات','grade','5','5️⃣'],
   ['رياضيات الصف السادس','المحتوى والتدريبات والمسابقات','grade','6','6️⃣'],
   ['رياضيات الصف السابع','الوحدات والمسارات العلمية','grade','7','7️⃣'],
   ['رياضيات الصف الثامن','الوحدات والمسارات العلمية','grade','8','8️⃣'],
   ['بنك الأسئلة','أسئلة واختبارات بحسب المستويات','route','question_bank','❓'],
   ['الاختبارات القصيرة','أمثلة التدريب والاختبارات','route','quiz','📝'],
   ['التقويم المتكيف','أنشطة فهم وتطبيق واستدلال','route','adaptive','🎯'],
   ['أوراق العمل والمهام','التدريبات والملفات المرتبطة بالدروس','route','work','📄'],
   ['المشاغل التعليمية','أنشطة تعلم وتطبيق عملية','route','workshops','🧰'],
   ['المشاريع الرياضية','مشاريع وتطبيقات رياضية من واقع الحياة','route','initiatives','🧩'],
   ['الرياضيات في حياتنا','الرياضيات والمهن والعبادات والتقنية','route','importance','🌍'],
   ['آفاق علم الرياضيات','الأعداد والهندسة والجبر والعلوم','route','horizons','🔭']
  ]},
 {id:'initiatives',icon:'💡',title:'مبادرات الأستاذ سعيد البريكي',desc:'مبادرات عملية تظهر قبل الدخول مع صور وأمثلة وتمارين',
  items:[
   ['جميع المبادرات التعليمية','الانتقال لبوابة المبادرات التفصيلية','route','teaching_initiatives','✨'],
   ['خلاط الرياضيات','المدخلات والعملية والمخرجات','route','mixer','🎛️'],
   ['غربال الأعداد الأولية','تمييز الأعداد الأولية وتصفية المضاعفات','route','afaq_prime_sieve','🔎'],
   ['المضاعفات الصفرية والموجبة','أنماط المضاعفات والجمع المتكرر','route','afaq_multiples','✖️'],
   ['المفتاح للقسمة المطوّلة','خطوات القسمة ومفتاح المنازل العشرية','route','division_key','🔑'],
   ['مبادرة ي / أ للإحداثيات','الانسحاب يمينًا ويسارًا وأعلى وأسفل','route','coordinate_ya','📐'],
   ['استراتيجيات الضرب الذهني','التجزئة والضرب المرن','route','mental_multiply','🧠'],
   ['استراتيجيات الجمع والطرح','التقريب والتعويض الذهني','route','mental_add_sub','➕'],
   ['التقويم المتكيف','التعلم بتغذية راجعة','route','adaptive','🎯'],
   ['عرض المبادرات المجتمعية','صور وتعليقات المبادرات','anchor','community','🤝'],
   ['مبادرات صحية وبيئية','أنشطة مستقبلية متنوعة','anchor','other','🌿'],
   ['صلاحيات المبادرات','طلب التصريح لمحتوى المبادرات المحمي','route','initiative_permissions','🔐']
  ]},
 {id:'library',icon:'📚',title:'المكتبة والمعرفة والوسائط',desc:'تاريخ الرياضيات والعلماء والكتب والمعلومات والفيديوهات والاستماع',
  items:[
   ['المكتبة العامة','المصادر العلمية المتاحة للزوار','route','library','📚'],
   ['تاريخ الرياضيات','الحضارات ونظم العد والرموز','lib','history','🏛️'],
   ['علماء الرياضيات','أبرز العلماء واكتشافاتهم','lib','scholars','👨‍🔬'],
   ['كتب الرياضيات والمراجع','الفهارس والكتب والمصادر','lib','books','📖'],
   ['مكتبة الاستماع','القرآن والحديث والحِكَم والأناشيد','route','audio','🎧'],
   ['الأخبار العلمية','علوم واكتشافات ومعلومات','route','science_news','🔬'],
   ['القيم الوطنية','الانتماء والقيم في التعلّم','route','national_values','🇴🇲'],
   ['الرياضيات والبيئة','الأنماط والقياس والطبيعة','route','environment','🌿'],
   ['عالم الرياضيات وآفاقه','فروع الرياضيات وصلتها بالعلوم','route','horizons','🌌'],
   ['الرياضيات في الحياة','استخدامات الرياضيات اليومية','route','importance','💡'],
   ['قناة يوتيوب التعليمية','مقاطع المنصة وروابطها','anchor','youtube','▶️']
  ]},
 {id:'play',icon:'🏆',title:'الألعاب والمسابقات والتميز',desc:'الألعاب والتحديات والمسابقات والنجوم ولوحات الشرف',
  items:[
   ['الألعاب والمسابقات','البوابة العامة للمنافسات','route','contests','🏆'],
   ['المرح والتسلية','الألغاز والأنشطة الممتعة','route','fun','🎲'],
   ['الألعاب الرياضية','ألعاب وحدات الرياضيات','route','games','🎮'],
   ['المسابقات الصغيرة','دائرة الضوء والتحديات القصيرة','route','minicontests','🌟'],
   ['مسابقة نجوم آفاق','المسابقة المستقلة ومراحلها','url','competition.html','🥇'],
   ['مسابقة رياضية داخلية','صفحة المسابقة الموجودة في المنصة','route','competition','🏅'],
   ['نجوم آفاق والإنجازات','التميز العلمي والسلوكي','route','stars','✨'],
   ['لوحة الشرف','صور الطلبة وإنجازاتهم وكلماتهم','anchor','honor','🎖️'],
   ['تجربة الزائر','أنشطة ومحاولات تدريبية للزائر','route','guest_trial','🎯'],
   ['ألعاب الصف السادس — الأعداد','رابط اللعبة المنشورة للأعداد','url','https://afaqmaths.github.io/s/grade6-numbers-game1.html','1️⃣'],
   ['ألعاب الصف السادس — القياس','رابط اللعبة المنشورة للقياس','url','https://afaqmaths.github.io/s/grade6-measurement-game2.html','2️⃣'],
   ['ألعاب الصف السادس — الهندسة','رابط اللعبة المنشورة للهندسة','url','https://afaqmaths.github.io/s/grade6-geometry-visual-game3.html','3️⃣']
  ]},
 {id:'support',icon:'🤝',title:'التواصل والمجتمع',desc:'الشراكة مع أولياء الأمور والاقتراحات والدعم ومتابعة المبادرات',
  items:[
   ['الدعم والتواصل','صفحة التواصل والاستفسارات','route','support','💬'],
   ['اقتراحات التطوير','شارك برأيك ومقترحاتك','route','suggestions','💡'],
   ['الشكاوى والملاحظات','المتابعة عبر قنوات الدعم','route','complaints','📩'],
   ['اتصل بنا','الاستفسارات والتواصل مع المنصة','route','contact','📞'],
   ['بوابة ولي الأمر','متابعة الأبناء عبر الحساب المعتمد','route','parent','👨‍👩‍👧'],
   ['المتميزون من أولياء الأمور','الشراكة المجتمعية في التعلم','route','parents','❤️'],
   ['تقدير الكادر التعليمي','مبادرات المعلمين والشركاء','route','faculty','👨‍🏫'],
   ['المبادرات المجتمعية','صور ومشاركات المجتمع','anchor','community','🤝']
  ]},
 {id:'accounts',icon:'🔐',title:'حسابات المنصة والدخول',desc:'ابدأ الدخول حسب الدور المصرح به والصف أو المهمة',
  items:[
   ['دخول الطالب — الصف السادس','فتح نافذة دخول حساب الطالب','login','student','🎒'],
   ['دخول طلاب الصفوف ٥ و٧ و٨','حسابات التعلّم والتدريب','login','demo','🎓'],
   ['دخول المشرف الرئيسي','لوحة إدارة آفاق ماث','login','supervisor','👨‍💻'],
   ['دخول المشرف المساعد','الحساب المخصص للمساعد','login','supervisor_assistant','📋'],
   ['دخول الإدارة المدرسية','مدير المدرسة ومساعده','login','director','🏫'],
   ['حسابي ولوحة المتابعة','الحسابات والخدمات المصرح بها','route','dashboard','👤'],
   ['الدخول كزائر','تصفح الموارد العامة بلا حساب','route','visitor','🌐']
  ]},
 {id:'staff',icon:'🗂️',title:'لوحات المعلم والمشرف',desc:'تظهر الأدوات المحمية بعد الدخول بالحساب المصرح به',
  items:[
   ['لوحة أعمال المشرف','الإحصاءات وروابط الإدارة العامة','admin','overview','📊'],
   ['تحضير الدروس','التحضير والأنشطة التعليمية','admin','staff_hub','📘'],
   ['تقويم الطلاب','البيانات والدرجات والمتابعة','admin','students','🧮'],
   ['نتائج الشعب','الكشوف والإحصاءات الصفية','admin','class_results','📈'],
   ['التطبيقات والبرامج','قائمة الأدوات الرقمية','admin','hub_apps','🖥️'],
   ['إدارة المحتوى','المكتبة والمواد العلمية','admin','hub_catalog','📚'],
   ['إدارة العلماء','موسوعة علماء الرياضيات','admin','hub_catalog_scholars','🏛️'],
   ['إدارة المبادرات','إضافة صور وشروحات وتعليقات','admin','teacher_initiatives_admin','💡'],
   ['إدارة لوحة الشرف','إضافة بيانات المكرّمين','admin','honor_board','🏅'],
   ['إعلانات وروابط الصفحة الرئيسية','تعديل الصور والروابط المنشورة','admin','home_promos','🖼️'],
   ['عنوان المنصة المتحرك','تعديل العربية والإنجليزية للعنوان','admin','platform_title','✨'],
   ['مركز الطباعة','طباعة المستندات والكشوف','admin','hub_print','🖨️'],
   ['التواصل المؤسسي','بيانات الإدارة والجهات','admin','staff_contacts','☎️'],
   ['صندوق الرسائل','قراءة الوارد والردود','admin','hub_inbox','📬'],
   ['حسابات أولياء الأمور','إصدار الرموز وإدارة الوصول','admin','hub_parent_codes','👨‍👩‍👧']
  ]}
];
const anchors={
 title:'.afaq-gilded-platform-title',
 entry:'.afaq-home-access.afaq-entry-between-flag-hero',
 about:'.afaq-final-introduction',
 promos:'.afaq-promo-area',
 honor:'.afaq-honor-board',
 knowledge:'.afaq-home-sections',
 scientific:'#afaq-scientific',
 community:'#afaq-community',
 youtube:'#afaq-youtube',
 other:'#afaq-other-initiatives',
 news:'.afaq-final-news-block'
};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const secureUrl=v=>{
 const raw=String(v||'');
 if(/^(?:[a-zA-Z0-9_.-]+\/)*[a-zA-Z0-9_.-]+\.html(?:#[\w-]+)?$/.test(raw))return raw;
 try{const u=new URL(raw);if(u.protocol!=='https:'||u.username||u.password)return '';
  return raw;}catch{return ''}
};
function catalogLinks(){
 const list=(typeof hub!=='undefined'&&Array.isArray(hub.catalog))?hub.catalog:[];
 const seen=new Set();
 return list.filter(row=>row.published===true).map(row=>{
  const url=secureUrl(row.resource_url);
  if(!url||!row.title)return null;
  const key=String(row.title).trim()+'|'+url;
  if(seen.has(key))return null;seen.add(key);
  return [String(row.title).slice(0,130),String(row.description||'مصدر معتمد منشور في المنصة').slice(0,185),
   'url',url,'🔗'];
 }).filter(Boolean).slice(0,80);
}
function groupList(){
 const listed=[...sections];
 const dynamic=catalogLinks();
 if(dynamic.length)listed.push({id:'published',icon:'🔗',title:'الروابط والموارد المنشورة',
  desc:'مواد إضافية منشورة من إدارة محتوى المنصة',items:dynamic});
 return listed;
}
const showLoginRequired=['hub_catalog','hub_catalog_scholars','teacher_initiatives_admin',
 'honor_board','home_promos','platform_title','hub_parent_codes'];
function navItem(item,idx,gid){
 const [label,desc,action,target,emoji]=item;
 const adminOnly=action==='admin'&&showLoginRequired.includes(target);
 const locked=adminOnly&&auth.user?.role!=='supervisor';
 const extra=locked?' <span class="afaq-directory-locked">🔒 حساب المشرف</span>':'';
 if(action==='url'){
  const safe=secureUrl(target);
  if(!safe)return '';
  return '<a class="afaq-directory-link" data-dir-search="'+esc(label+' '+desc)+'" href="'+esc(safe)+
   '" target="_blank" rel="noopener noreferrer"><span class="afaq-directory-link-icon">'+emoji+
   '</span><span class="afaq-directory-link-text"><strong>'+esc(label)+'</strong><small>'+esc(desc)+
   '</small></span><span class="afaq-directory-link-arrow" aria-hidden="true">↗</span></a>';
 }
 return '<button type="button" class="afaq-directory-link" data-directory-action="'+esc(action)+
  '" data-directory-target="'+esc(target)+'" data-dir-search="'+esc(label+' '+desc)+
  '" aria-label="'+esc(label)+'"><span class="afaq-directory-link-icon">'+emoji+
  '</span><span class="afaq-directory-link-text"><strong>'+esc(label)+extra+'</strong>'+
  '<small>'+esc(desc)+'</small></span><span class="afaq-directory-link-arrow" aria-hidden="true">↗</span></button>';
}
function directoryMarkup(){
 const groups=groupList();
 const count=groups.reduce((a,g)=>a+g.items.length,0);
 return '<div class="container afaq-directory-page" dir="rtl">'+
 '<section class="afaq-directory-hero"><div class="afaq-directory-glow" aria-hidden="true"></div>'+
 '<span class="afaq-directory-eyebrow">✦ خريطة منصة آفاق ماث ✦</span>'+
 '<h1>ابدأ رحلتك في الرياضيات</h1>'+
 '<p>جميع الأبواب في مكان واحد: تعلم، استكشف، جرّب، نافس، تواصل، وانتقل إلى أقسام الصفحة الرئيسية أو أدوات حسابك.</p>'+
 '<div class="afaq-directory-hero-actions">'+
 '<button type="button" data-directory-action="route" data-directory-target="home">🏠 الصفحة الرئيسية</button>'+
 '<button type="button" data-directory-action="route" data-directory-target="learning">🎓 ابدأ التعلّم</button>'+
 '<button type="button" data-directory-action="route" data-directory-target="visitor">🌐 التصفح كزائر</button></div></section>'+
 '<section class="afaq-directory-tools" aria-label="البحث في خريطة المنصة">'+
 '<label for="afaqDirectorySearch">🔎 ابحث عن قسم أو درس أو مبادرة</label>'+
 '<input id="afaqDirectorySearch" type="search" autocomplete="off" placeholder="مثال: السادس، الخلاط، بنك الأسئلة، لوحة الشرف ..." />'+
 '<p class="afaq-directory-count" aria-live="polite" id="afaqDirectoryCount">يتضمن الدليل '+count+' رابطًا واختصارًا منظّمًا في '+groups.length+' أقسام.</p>'+
 '<div class="afaq-directory-shortcuts">'+groups.map(g=>
 '<button type="button" data-directory-jump="'+g.id+'"><span aria-hidden="true">'+g.icon+'</span>'+esc(g.title)+'</button>').join('')+
 '</div></section>'+
 '<div class="afaq-directory-groups">'+groups.map(g=>
 '<section class="afaq-directory-group" id="afaq-dir-'+g.id+'" data-directory-group="'+g.id+'">'+
 '<header><span class="afaq-directory-group-icon">'+g.icon+'</span><div>'+
 '<h2>'+esc(g.title)+'</h2><p>'+esc(g.desc)+'</p></div>'+
 '<span class="afaq-directory-group-count">'+g.items.length+' روابط</span></header>'+
 '<div class="afaq-directory-links">'+g.items.map((item,i)=>navItem(item,i,g.id)).join('')+'</div></section>').join('')+
 '</div><footer class="afaq-directory-footer">🔐 تتطلب بعض الخدمات الدخول والتصريح وفق دور المستخدم؛ ولا يُتيح هذا الدليل تجاوز أذونات المنصة.</footer></div>';
}
function goAnchor(key){
 const selector=anchors[key];
 route('home',false);
 window.requestAnimationFrame(()=>{
  const area=selector?document.querySelector('#app .hub-home '+selector):null;
  if(area){area.scrollIntoView({behavior:'smooth',block:'start'});area.setAttribute('tabindex','-1')}
  else window.scrollTo({top:0,behavior:'smooth'});
 });
}
function action(type,target){
 if(type==='route')return route(target);
 if(type==='anchor')return goAnchor(target);
 if(type==='grade'){
  state.grade=Number(target);state.lessonUnit=0;
  return route('grade');
 }
 if(type==='lib'){state.libraryTab=target;return route('library')}
 if(type==='login'){
  if(typeof hubSetLogin==='function')return hubSetLogin(target);
  return route('home');
 }
 if(type==='admin'){
  if(!auth.user||!auth.token)return typeof hubSetLogin==='function'?hubSetLogin('supervisor'):route('home');
  if(showLoginRequired.includes(target)&&auth.user.role!=='supervisor')
   return window.alert('هذه الصفحة مخصصة للمشرف الرئيسي فقط.');
  if(!['supervisor','supervisor_assistant'].includes(auth.user.role)&&target!=='overview')
   return window.alert('هذه الصفحة تتطلب حسابًا مخولًا بالإدارة أو الإشراف.');
  auth.section=target;route('dashboard');
  if(typeof hubLoadForTab==='function')hubLoadForTab(target);
 }
}
function filterDirectory(){
 const inp=document.getElementById('afaqDirectorySearch');
 if(!inp)return;
 const term=String(inp.value||'').trim().toLocaleLowerCase('ar');
 let visible=0;
 document.querySelectorAll('.afaq-directory-group').forEach(group=>{
  let shown=0;
  group.querySelectorAll('.afaq-directory-link').forEach(link=>{
   const matches=!term||String(link.dataset.dirSearch||'').toLocaleLowerCase('ar').includes(term);
   link.hidden=!matches;if(matches){shown++;visible++}
  });
  group.hidden=shown===0;
 });
 const text=document.getElementById('afaqDirectoryCount');
 if(text)text.textContent=term?'نتائج البحث: '+visible+' رابطًا متوافقًا مع "'+String(inp.value||'').trim()+'".':
  'الدليل يعرض '+visible+' رابطًا واختصارًا في أقسام المنصة.';
}
function bindDirectory(){
 const root=document.querySelector('.afaq-directory-page');if(!root)return;
 root.querySelectorAll('[data-directory-action]').forEach(el=>el.addEventListener('click',()=>
  action(el.dataset.directoryAction,el.dataset.directoryTarget)));
 root.querySelectorAll('[data-directory-jump]').forEach(el=>el.addEventListener('click',()=>{
  const target=document.getElementById('afaq-dir-'+el.dataset.directoryJump);
  if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
 }));
 document.getElementById('afaqDirectorySearch')?.addEventListener('input',filterDirectory);
}
const previousHome=hubHome;
hubHome=function(...args){
 const html=previousHome.apply(this,args);
 if(typeof html!=='string')return html;
 // Update the actual, visible hero button even if earlier templates reintroduce it.
 return html.replace(/(<button\b[^>]*class="hub-primary"[^>]*data-route=")learning("[^>]*>\s*ابدأ رحلتك في الرياضيات\s*<\/button>)/,
 '$1'+PAGE+'$2');
};
const previousRender=render;
render=function(...args){
 if(state.page!==PAGE)return previousRender.apply(this,args);
 const app=document.getElementById('app');if(!app)return;
 app.innerHTML=directoryMarkup();
 document.querySelectorAll('[data-route]').forEach(node=>node.classList.toggle('active',node.dataset.route===PAGE));
 attach();
 if(typeof attachPortal==='function')attachPortal();
};
const previousAttach=attach;
attach=function(...args){previousAttach.apply(this,args);bindDirectory()};
if(window.location.hash.replace('#','')===PAGE){
 state.page=PAGE;render();
}
})();