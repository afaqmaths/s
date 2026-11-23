/* AFAQ MATHS Academy — standalone, no payments, no authentication, no production PII. */
(function(){
"use strict";
var VERSION="2026-11-24-a1", KEY="afaq-academy-preview-finance-v1";
var subjects=[
 {id:"math",name:"الرياضيات",icon:"π",desc:"العدد والهندسة والجبر"},
 {id:"science",name:"العلوم",icon:"⚗",desc:"التجارب والظواهر"},
 {id:"arabic",name:"اللغة العربية",icon:"ض",desc:"اللغة والأدب"},
 {id:"english",name:"اللغة الإنجليزية",icon:"Aa",desc:"الفهم والتواصل"},
 {id:"social",name:"الدراسات الاجتماعية",icon:"◈",desc:"التاريخ والجغرافيا"},
 {id:"skills",name:"المهارات التقنية",icon:"⌘",desc:"التقنية والمستقبل"}
];
var teachers=[
 {id:"math",name:"معلم الرياضيات — تجريبي",subject:"الرياضيات"},
 {id:"science",name:"معلم العلوم — تجريبي",subject:"العلوم"},
 {id:"arabic",name:"معلم اللغة العربية — تجريبي",subject:"اللغة العربية"},
 {id:"english",name:"معلم اللغة الإنجليزية — تجريبي",subject:"الإنجليزية"}
];
var plans=[
 {id:"recorded",name:"درس مسجل منفرد",price:0.900,subtitle:"مشاهدة درس واحد وفق مدة الصلاحية",features:["شرح تفصيلي لدرس واحد","إعادة المشاهدة أثناء الصلاحية","ملخص قابل للعرض"]},
 {id:"solution",name:"حزمة حلول وتمارين",price:1.400,subtitle:"وحدة مختارة مع تمارين وأنشطة",features:["حلول أصلية خطوة بخطوة","ملفات تدريبية مرافقة","تدرج من السهل إلى المتقدم"]},
 {id:"review",name:"مراجعة ونموذج إجابة",price:2.400,subtitle:"مراجعة قبل الاختبار",features:["بنك أسئلة مصنّف","اختبار تجريبي","نموذج إجابة مشروح"]},
 {id:"live",name:"حصة جماعية مباشرة",price:3.000,subtitle:"حصة واحدة في مجموعة",features:["حجز مقعد في حصة","مشاركة الأسئلة أثناء الشرح","ملخص بعد الدرس"]},
 {id:"monthly",name:"مكتبة المادة الشهرية",price:4.900,subtitle:"فيديوهات مسجلة لمادة واحدة",features:["الدروس المنشورة للمادة","تمارين ومراجعات مرافقة","صلاحية شهر واحد"]},
 {id:"private",name:"حصة فردية مباشرة",price:9.000,subtitle:"جلسة فردية مع المعلم",features:["وقت مخصص للطالب","مسائل بحسب الاحتياج","تقييم بعد الحصة"]},
 {id:"livepack",name:"أربع حصص جماعية",price:10.000,subtitle:"باقة تدريب على مدى الشهر",features:["أربع جلسات مباشرة","واجبات تدريبية","متابعة تقدم الطالب"]},
 {id:"complete",name:"الباقة الشاملة الشهرية",price:12.900,subtitle:"محتوى مادة + حصص + اختبارات",features:["المحتوى المسجل للمادة","أربع حصص جماعية","مراجعات واختبارات ونماذج إجابة"],featured:true}
];
var programs=[
 {id:"p1",title:"النظام العشري والأعداد",subject:"math",grade:6,type:"recorded",plan:"recorded",icon:"10",style:"violet",teacher:"معلم الرياضيات"},
 {id:"p2",title:"الزوايا والمثلثات",subject:"math",grade:6,type:"solutions",plan:"solution",icon:"△",style:"amber",teacher:"معلم الرياضيات"},
 {id:"p3",title:"تدريب ومراجعة الرياضيات",subject:"math",grade:6,type:"exams",plan:"review",icon:"∑",style:"blue",teacher:"معلم الرياضيات"},
 {id:"p4",title:"حالات المادة والتغيرات",subject:"science",grade:6,type:"recorded",plan:"recorded",icon:"⚗",style:"teal",teacher:"معلم العلوم"},
 {id:"p5",title:"تجارب العلوم الحية",subject:"science",grade:7,type:"live",plan:"live",icon:"✳",style:"teal",teacher:"معلم العلوم"},
 {id:"p6",title:"التعبير والقراءة الناقدة",subject:"arabic",grade:6,type:"recorded",plan:"recorded",icon:"ض",style:"rose",teacher:"معلم اللغة العربية"},
 {id:"p7",title:"المهارات اللغوية والكتابة",subject:"english",grade:8,type:"exams",plan:"review",icon:"Aa",style:"blue",teacher:"معلم الإنجليزية"},
 {id:"p8",title:"الجغرافيا والخرائط",subject:"social",grade:7,type:"solutions",plan:"solution",icon:"◈",style:"amber",teacher:"معلم الدراسات"},
 {id:"p9",title:"التفكير الحاسوبي",subject:"skills",grade:9,type:"live",plan:"live",icon:"⌘",style:"violet",teacher:"معلم التقنية"}
];
var roleMap={
 student:{title:"لوحة الطالب",desc:"محتواي التعليمي وجدول الحصص ومستوى التقدم.",tiles:[["▣","اشتراكاتي","الباقات الفعالة وتواريخ الصلاحية"],["▶","فيديوهاتي","الدروس المسجلة المتاحة"],["✓","نتائجي","المراجعات والاختبارات"]]},
 parent:{title:"لوحة ولي الأمر",desc:"إدارة اشتراكات الأبناء ومتابعة التعلم.",tiles:[["♙","حسابات الأبناء","إضافة حساب بموافقة ولي الأمر"],["▣","الفواتير","سجل الرسوم والتحصيل"],["▤","التقارير","حضور الحصص والتقدم"]]},
 teacher:{title:"لوحة المعلم",desc:"إدارة مقررات المعلم وحصصه ومستحقاته فقط.",tiles:[["▶","نشر الدروس","إضافة فيديو وملفات عبر مراجعة المحتوى"],["▣","جدول الحصص","إضافة موعد وإدارة الحجوزات"],["◈","مستحقاتي","إيراداتي وعمولتي وتسوياتي"]]},
 head:{title:"رئيس المادة",desc:"مراجعة ما يُنشر في المادة المعينة له دون الوصول إلى البيانات المالية الخاصة.",tiles:[["✓","اعتماد المحتوى","التحقق من جودة الشرح والإجابات"],["♙","فريق المعلمين","متابعة معلمي المادة"],["▤","تقارير المادة","إحصاءات الدروس والتقييم"]]},
 manager:{title:"إدارة الأكاديمية",desc:"إدارة المعلمين والمواد والجداول وخدمات الدعم ضمن التفويض.",tiles:[["♙","إدارة المستخدمين","صلاحيات مبنية على الدور"],["▣","الجدول العام","تعارضات الحصص والسعة"],["◈","تقارير التشغيل","المشاركة وجودة المحتوى"]]}
};
var base={prices:{},enabled:{},teacherPercent:70,paymentFee:2.5,overrides:{},globalDiscount:0,couponCode:"AFAQ15",couponPercent:15,couponEnabled:true,couponExpiry:""};
plans.forEach(function(p){base.prices[p.id]=p.price;base.enabled[p.id]=true});
function capNumber(n,min,max,def){n=Number(n);return Number.isFinite(n)&&n>=min&&n<=max?n:def}
function load(){
 var raw;try{raw=JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){raw=null}
 if(!raw||typeof raw!=="object")return JSON.parse(JSON.stringify(base));
 var s=JSON.parse(JSON.stringify(base));
 plans.forEach(function(p){
  s.prices[p.id]=capNumber(raw.prices&&raw.prices[p.id],0.100,1000,p.price);
  s.enabled[p.id]=raw.enabled&&typeof raw.enabled[p.id]==="boolean"?raw.enabled[p.id]:true;
 });
 s.teacherPercent=capNumber(raw.teacherPercent,0,100,70);
 s.paymentFee=capNumber(raw.paymentFee,0,30,2.5);
 s.globalDiscount=capNumber(raw.globalDiscount,0,80,0);
 s.couponPercent=capNumber(raw.couponPercent,0,80,15);
 s.couponEnabled=typeof raw.couponEnabled==="boolean"?raw.couponEnabled:true;
 s.couponCode=String(raw.couponCode||"AFAQ15").replace(/[^A-Za-z0-9_-]/g,"").slice(0,30).toUpperCase()||"AFAQ15";
 s.couponExpiry=/^20\d{2}-\d{2}-\d{2}$/.test(String(raw.couponExpiry||""))?raw.couponExpiry:"";
 teachers.forEach(function(t){if(raw.overrides&&raw.overrides[t.id]!==undefined&&raw.overrides[t.id]!==null&&raw.overrides[t.id]!==""){s.overrides[t.id]=capNumber(raw.overrides[t.id],0,100,s.teacherPercent)}});
 return s;
}
var state=load(),currentSubject="all",currentType="all",currentGrade="all",currentSearch="",couponApplied=false,currentRole="student",currentAdmin="plans",toastTimer=0;
var $=function(s){return document.querySelector(s)};
function escape(s){return String(s===undefined||s===null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function save(){
 try{localStorage.setItem(KEY,JSON.stringify(state));return true}
 catch(e){toast("تعذر الحفظ في هذا المتصفح. سيظل التغيير مؤقتًا.");return false}
}
function money(n){return Number(n).toLocaleString("en-OM",{minimumFractionDigits:3,maximumFractionDigits:3})}
function lookupPlan(id){return plans.find(function(p){return p.id===id})||plans[0]}
function typeName(id){return {live:"مباشر",recorded:"مسجل",solutions:"تمارين وحلول",exams:"اختبارات"}[id]||"تعليم"}
function subjectName(id){var s=subjects.find(function(s){return s.id===id});return s?s.name:"المواد"}
function expiryOk(){if(!state.couponExpiry)return true;var today=new Date(),str=today.getFullYear()+"-"+String(today.getMonth()+1).padStart(2,"0")+"-"+String(today.getDate()).padStart(2,"0");return str<=state.couponExpiry}
function discountPercent(){return Math.max(state.globalDiscount,couponApplied&&state.couponEnabled&&expiryOk()?state.couponPercent:0)}
function pricing(id){var original=state.prices[id];return {original:original,discount:discountPercent(),current:Math.round(original*(1-discountPercent()/100)*1000)/1000}}
function toast(message){var node=$("#toast");if(!node)return;node.textContent=message;node.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(function(){node.hidden=true},4200)}
function nav(page){
 var target={home:"#homeHero",catalog:"#catalogSection",live:"#liveSection",pricing:"#pricingSection",workspace:"#workspaceSection",finance:"#financeSection"}[page]||"#homeHero";
 document.querySelectorAll("[data-nav]").forEach(function(b){if(b.classList.contains("navlink"))b.classList.toggle("active",b.dataset.nav===page)});
 var node=$(target);if(node)node.scrollIntoView({behavior:"smooth",block:"start"});
 $("#mainNav").classList.remove("open");$("#menuToggle").setAttribute("aria-expanded","false");
}
function renderSubjects(){
 $("#subjectGrid").innerHTML=subjects.map(function(s){
  return '<button class="subject-card'+(currentSubject===s.id?' selected':'')+'" type="button" data-subject="'+escape(s.id)+'" aria-pressed="'+(currentSubject===s.id)+'"><span class="subject-icon">'+escape(s.icon)+'</span><strong>'+escape(s.name)+'</strong><small>'+escape(s.desc)+'</small></button>';
 }).join("");
}
function renderPrograms(){
 var list=programs.filter(function(p){
  var text=[p.title,p.teacher,subjectName(p.subject),typeName(p.type)].join(" ");
  return (currentSubject==="all"||p.subject===currentSubject)&&(currentType==="all"||p.type===currentType)&&(currentGrade==="all"||String(p.grade)===currentGrade)&&(!currentSearch||text.indexOf(currentSearch)>=0);
 });
 $("#catalogResults").innerHTML=list.length?list.map(function(p){
  var plan=lookupPlan(p.plan),rate=pricing(p.plan),active=state.enabled[p.plan];
  return '<article class="program-card"><div class="program-art '+escape(p.style)+'"><span class="art-kind">'+escape(typeName(p.type))+'</span><strong>'+escape(p.icon)+'</strong></div><div class="program-content"><div class="program-sub">'+escape(subjectName(p.subject))+' • الصف '+p.grade+' • '+escape(p.teacher)+' (تجريبي)</div><h3>'+escape(p.title)+'</h3><p>تصور لمحتوى تعليمي سيتم إنتاجه ونشره بعد اعتماد المعلم والمادة والملفات.</p><div class="program-foot"><span><strong>'+(active?money(rate.current)+' ر.ع':'غير معروض')+'</strong><small>'+escape(plan.name)+'</small></span><button class="mini-button" data-program="'+escape(p.id)+'">تفاصيل الدرس ←</button></div></div></article>';
 }).join(""):'<div class="empty-results">لم نجد نتيجة مطابقة. جرّب اختيار مادة أو صف أو نوع مختلف.</div>';
}
function renderLive(){
 var sessions=[
 {icon:"π",name:"تطبيقات في الرياضيات",subject:"الرياضيات",grade:"السادس",teacher:"معلم الرياضيات",style:"حصص جماعية"},
 {icon:"⚗",name:"مختبر العلوم الافتراضي",subject:"العلوم",grade:"السابع",teacher:"معلم العلوم",style:"حصص جماعية"},
 {icon:"ض",name:"مهارات التعبير والقراءة",subject:"اللغة العربية",grade:"السادس",teacher:"معلم اللغة العربية",style:"حصص جماعية"}
 ];
 $("#liveGrid").innerHTML=sessions.map(function(s){
  return '<article class="live-card"><div class="live-head"><div class="live-date"><strong>—</strong><span>قريبًا</span></div><div><h3>'+escape(s.name)+'</h3><p>'+escape(s.subject)+' • الصف '+escape(s.grade)+'</p></div></div><div class="live-facts"><span>◉ '+escape(s.style)+'</span><span>◉ الموعد غير محدد</span><span>◉ '+escape(s.teacher)+'</span><span>◉ الحجز غير مفعل</span></div><button class="btn btn-outline" data-preview="live">معرفة التفاصيل</button></article>';
 }).join("");
}
function renderPrices(){
 var list=plans.filter(function(p){return state.enabled[p.id]});
 $("#priceGrid").innerHTML=list.map(function(p){
  var n=pricing(p.id);
  return '<article class="price-card'+(p.featured?' featured':'')+'"><span class="pill '+(p.featured?'amber':'purple')+'" style="align-self:flex-start;margin-bottom:10px">'+(p.featured?'باقة متكاملة':'خدمة تعليمية')+'</span><h3>'+escape(p.name)+'</h3><p class="price-desc">'+escape(p.subtitle)+'</p><div class="price-amount">'+money(n.current)+' <small>ر.ع</small></div><div class="price-before">'+(n.discount>0?'قبل الخصم: '+money(n.original)+' ر.ع':'السعر التأسيسي المقترح')+'</div><ul>'+p.features.map(function(f){return '<li>'+escape(f)+'</li>'}).join("")+'</ul><button class="btn '+(p.featured?'btn-gold':'btn-outline')+'" data-plan="'+escape(p.id)+'">تفاصيل الاشتراك ←</button></article>';
 }).join("")||'<div class="empty-results">جميع الباقات مخفية في معاينة الإدارة.</div>';
}
function renderRole(){
 var role=roleMap[currentRole];
 $("#roleContent").innerHTML='<div class="role-top"><div><h3>'+escape(role.title)+'</h3><p>'+escape(role.desc)+'</p></div><span class="pill purple">معاينة دون تسجيل دخول</span></div><div class="role-preview">'+role.tiles.map(function(t){return '<article class="role-tile"><span class="tile-emoji">'+escape(t[0])+'</span><h4>'+escape(t[1])+'</h4><p>'+escape(t[2])+'</p></article>'}).join("")+'</div><div class="role-warning">هذه معاينة للأدوار فقط؛ الحسابات والصلاحيات الحقيقية تُفعّل عبر خادم مصادق عليه، ولا تُحفظ بيانات الطلاب أو المدفوعات في هذا النموذج.</div>';
 document.querySelectorAll(".role-btn").forEach(function(b){var active=b.dataset.role===currentRole;b.classList.toggle("active",active);b.setAttribute("aria-selected",active?"true":"false")});
}
function field(name,id,value,type,extra,help){
 return '<div class="field"><label for="'+escape(id)+'">'+escape(name)+'</label><input id="'+escape(id)+'" type="'+(type||"text")+'" value="'+escape(value)+'" '+(extra||"")+'><div class="field-help">'+escape(help||"")+'</div></div>';
}
function adminIntro(title,desc){return '<h3>'+title+'</h3><p class="panel-intro">'+desc+'</p>'}
function plansView(){
 return adminIntro("إدارة الباقات والأسعار","يمكنك تحديث سعر كل باقة بالريال العُماني وإظهارها أو إخفاؤها في المعاينة العامة.")+
 '<form id="plansForm">'+plans.map(function(p){
  return '<div class="config-row"><label for="price-'+escape(p.id)+'">'+escape(p.name)+'</label><input id="price-'+escape(p.id)+'" name="price-'+escape(p.id)+'" type="number" required min="0.100" max="1000" step="0.001" value="'+state.prices[p.id].toFixed(3)+'"><label style="font-size:11px"><input type="checkbox" name="enabled-'+escape(p.id)+'" '+(state.enabled[p.id]?'checked':'')+' style="width:auto;height:auto;margin-left:5px">إظهار</label></div>';
 }).join("")+'<div class="panel-buttons"><button class="btn btn-dark" type="submit">حفظ أسعار الباقات</button><button class="btn btn-outline" type="button" data-reset="all">استعادة الافتراضي</button></div></form><div class="config-legend">جميع الأسعار بالريال العُماني (ثلاث منازل عشرية). لا تُعرض رسوم لمستخدمين حقيقيين ولا تُجرى معاملات مالية من هذه المعاينة.</div>';
}
function commissionsView(){
 var pct=state.teacherPercent;
 return adminIntro("اعتماد سياسة عمولات المعلمين","النموذج المعتمد افتراضيًا: ٧٠٪ من صافي التحصيل للمعلم و٣٠٪ للأكاديمية، مع إمكانية تخصيص نسبة لكل معلم.")+
 '<form id="commissionForm"><div class="field-grid">'+field("النسبة العامة للمعلم (%)","teacherPercent",pct,"number",'min="0" max="100" step="0.5" required',"حصة الأكاديمية تُحسب تلقائيًا: ١٠٠٪ ناقص حصة المعلم.")+
 field("رسوم بوابة الدفع الافتراضية (%)","paymentFee",state.paymentFee,"number",'min="0" max="30" step="0.1" required',"تستخدم في التقدير فقط؛ تُعدل بعد الاتفاق مع مزود الدفع.")+'</div>'+
 '<div class="commission-bar" aria-label="نسبة العمولة العامة"><span class="commission-teacher" style="width:'+pct+'%"></span><span class="commission-academy" style="width:'+(100-pct)+'%"></span></div>'+
 '<div class="bar-labels"><span>المعلم: '+pct+'٪</span><span>الأكاديمية: '+(100-pct)+'٪</span></div>'+
 '<h3 style="margin-top:25px">نسب مخصصة بحسب المعلم</h3><div class="field-grid">'+teachers.map(function(t){
  return field(t.name+" (%)","teacher-"+t.id,state.overrides[t.id]===undefined?"":state.overrides[t.id],"number",'min="0" max="100" step="0.5" placeholder="النسبة العامة"',"اتركها فارغة لاستخدام النسبة العامة.");
 }).join("")+'</div><div class="panel-buttons"><button class="btn btn-dark" type="submit">حفظ سياسة العمولات</button></div></form>'+
 '<div class="config-legend">تُحسب الحصص من المبلغ المحصّل بعد الخصومات ورسوم بوابة الدفع. يُخصم المرتجع من التسويات وفق السياسة التي ستُعتمد تعاقديًا. جميع الأرقام تجريبية وغير ملزمة.</div>';
}
function discountsView(){
 return adminIntro("إدارة الحملات والخصومات","خصم عام مع رمز قسيمة اختياري. لا تُجمع النسبتان: يُطبق الخصم الأكبر حتى لا تتجاوز الحسومات الحد المقصود.")+
 '<form id="discountForm"><div class="field-grid">'+
 field("الخصم العام لجميع الباقات (%)","globalDiscount",state.globalDiscount,"number",'min="0" max="80" step="1" required',"صفر يعني عدم وجود حملة عامة.")+
 field("رمز قسيمة الخصم","couponCode",state.couponCode,"text",'maxlength="30" pattern="[A-Za-z0-9_-]+" required',"يمكن تغييره في أي وقت.")+
 field("نسبة خصم القسيمة (%)","couponPercent",state.couponPercent,"number",'min="0" max="80" step="1" required',"النسبة قابلة للتغيير.")+
 field("تاريخ انتهاء القسيمة (اختياري)","couponExpiry",state.couponExpiry,"date",'',"اتركه فارغًا إذا لم تحدد تاريخ انتهاء.")+
 '</div><label style="font-weight:900;font-size:12px"><input id="couponEnabled" type="checkbox" '+(state.couponEnabled?'checked':'')+'> تفعيل القسيمة في المعاينة</label>'+
 '<div class="panel-buttons"><button class="btn btn-dark" type="submit">حفظ إعدادات الخصومات</button></div></form><div class="config-legend">الخصومات لا تغيّر الأسعار الأصلية، وإنما تغيّر السعر المعروض للمشترك. حسابات الضرائب والاسترداد وقيود الحملة النهائية تحتاج إلى ربط نظام الدفع الحقيقي.</div>';
}
function teacherPct(id){return state.overrides[id]===undefined?state.teacherPercent:state.overrides[id]}
function calcView(){
 return adminIntro("محاكاة تحصيل ورسوم وعمولات","حاسبة تشغيلية لنموذج مالي مقترح؛ لا تُنشئ فواتير أو تحويلات أو عمليات دفع.")+
 '<div class="field-grid"><div class="field"><label for="calcPlan">الباقة</label><select id="calcPlan">'+plans.map(function(p){return '<option value="'+p.id+'">'+escape(p.name)+'</option>'}).join("")+'</select></div><div class="field"><label for="calcTeacher">المعلم</label><select id="calcTeacher">'+teachers.map(function(t){return '<option value="'+escape(t.id)+'">'+escape(t.name)+'</option>'}).join("")+'</select></div>'+
 field("عدد الاشتراكات الافتراضي","calcCount",20,"number",'min="1" max="10000" step="1"',"للمحاكاة فقط.")+'</div>'+
 '<div class="panel-buttons"><button type="button" class="btn btn-dark" id="calculateBtn">احسب التوزيع المالي</button></div><div id="calcResult"></div>';
}
function structureView(){
 var r=[
 ["المشرف الرئيسي","صلاحيات النظام والتعيينات والسياسات المالية"],
 ["مدير الأكاديمية","الجدول والتخصصات والإدارة التشغيلية"],
 ["المسؤول المالي","الفواتير والتسويات بعد تفويض محدد"],
 ["رئيس المادة","مراجعة المحتوى الخاص بمادته"],
 ["المعلم","مقرراته وحصصه وإيراداته فقط"],
 ["الطالب","الدروس المسموح بها والحضور والاختبارات"],
 ["ولي الأمر","إدارة حسابات الأبناء وموافقاتهم"],
 ["الزائر","الاطلاع على التعريفات والمحتوى العام"]
 ];
 return adminIntro("بنية الصلاحيات متعددة الأدوار","تُنفذ الصلاحيات في الخادم وقاعدة البيانات، وليس بإخفاء الأزرار فقط.")+
 '<div class="admin-grid">'+r.map(function(i){return '<article><strong>'+escape(i[0])+'</strong><small>'+escape(i[1])+'</small></article>'}).join("")+'</div>'+
 '<p class="fine-print">لا تستضيف صفحات GitHub Pages العامة مفاتيح دخول خاصة أو ملفات مدفوعة دون حماية. قبل التشغيل التجاري نستخدم تسجيل دخول حقيقي، أذونات على الخادم، دفعًا مؤكدًا بإشعارات موثوقة، ملفات وفيديوهات بمشاهدة محدودة، وسجلات تدقيق.</p>';
}
function renderFinance(){
 document.querySelectorAll(".admin-tab").forEach(function(b){b.classList.toggle("active",b.dataset.adminTab===currentAdmin)});
 var renderers={plans:plansView,commissions:commissionsView,discounts:discountsView,calculator:calcView,structure:structureView};
 $("#financePanel").innerHTML=(renderers[currentAdmin]||plansView)();
 if(currentAdmin==="calculator")calculate();
}
function calculate(){
 var planId=$("#calcPlan")?$("#calcPlan").value:"complete";
 var teacherId=$("#calcTeacher")?$("#calcTeacher").value:"math";
 var count=capNumber($("#calcCount")?$("#calcCount").value:20,1,10000,20);
 var rate=pricing(planId),collected=rate.current*count,fee=collected*state.paymentFee/100,pool=Math.max(0,collected-fee),pct=teacherPct(teacherId),teacher=pool*pct/100,academy=pool-teacher;
 $("#calcResult").innerHTML='<div class="money-split"><div class="money-box"><small>الإيراد المحصل تجريبيًا</small><strong>'+money(collected)+'</strong><small>ريال عُماني</small></div><div class="money-box"><small>حصة المعلم ('+pct+'٪)</small><strong>'+money(teacher)+'</strong><small>ريال عُماني</small></div><div class="money-box"><small>حصة الأكاديمية ('+(100-pct)+'٪)</small><strong>'+money(academy)+'</strong><small>ريال عُماني</small></div></div><div class="config-legend">العدد '+count+' × السعر النهائي '+money(rate.current)+' = '+money(collected)+' ر.ع. رسوم الدفع الافتراضية: '+money(fee)+' ر.ع. صافي التوزيع: '+money(pool)+' ر.ع. المبالغ قبل المصروفات التشغيلية والضرائب والاستردادات.</div>';
}
function detailModal(title,subtitle,items,price){
 $("#detailBody").innerHTML='<span class="pill amber">معاينة، وليست خدمة متاحة للشراء الآن</span><h2 style="margin-top:12px">'+escape(title)+'</h2><p>'+escape(subtitle)+'</p>'+
 (price!==null?'<h3 style="color:#243555;margin:12px 0">السعر المقترح: '+money(price)+' ر.ع</h3>':'')+
 '<ul class="dialog-detail-list">'+items.map(function(i){return '<li>'+escape(i)+'</li>'}).join("")+'</ul>'+
 '<p class="fine-print">لا يمكن إتمام الاشتراك أو حجز الحصص قبل استكمال متطلبات التشغيل التجاري والربط الآمن. لا تُدخل بيانات بطاقة دفع في هذه النسخة.</p><button class="btn btn-dark" id="okDialog">فهمت</button>';
 var dialog=$("#detailDialog");if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
}
function applyCoupon(){
 var value=($("#couponInput").value||"").trim().toUpperCase();
 if(!state.couponEnabled){couponApplied=false;$("#couponMessage").textContent="القسيمة غير مفعّلة في الإعدادات.";return}
 if(!expiryOk()){couponApplied=false;$("#couponMessage").textContent="انتهت صلاحية القسيمة التجريبية.";return}
 if(value!==state.couponCode){couponApplied=false;$("#couponMessage").textContent="الرمز غير مطابق للقسيمة التجريبية الحالية.";return}
 couponApplied=true;
 $("#couponMessage").textContent="✓ تم تطبيق خصم القسيمة بنسبة "+state.couponPercent+"٪ (أو الخصم العام إذا كان أعلى).";
 renderPrices();renderPrograms();if(currentAdmin==="calculator")calculate();
}
function setupEvents(){
 document.addEventListener("click",function(e){
  var n=e.target.closest("[data-nav]");if(n){e.preventDefault();if(n.dataset.filter){currentType=n.dataset.filter;$("#typeFilter").value=currentType;renderPrograms()}nav(n.dataset.nav);return}
  var subj=e.target.closest("[data-subject]");if(subj){currentSubject=currentSubject===subj.dataset.subject?"all":subj.dataset.subject;renderSubjects();renderPrograms();return}
  var b=e.target.closest("[data-role]");if(b){currentRole=b.dataset.role;renderRole();return}
  var tab=e.target.closest("[data-admin-tab]");if(tab){currentAdmin=tab.dataset.adminTab;renderFinance();return}
  var program=e.target.closest("[data-program]");if(program){var p=programs.find(function(x){return x.id===program.dataset.program});if(p){detailModal(p.title,"محتوى نموذجي: "+subjectName(p.subject)+" للصف "+p.grade,["شرح من إعداد المعلم المعتمد","ملفات وأنشطة تُضاف بعد إقرار النشر","صلاحية المحتوى تتحدد وفق الباقة"],state.prices[p.plan])}return}
  var plan=e.target.closest("[data-plan]");if(plan){var pp=lookupPlan(plan.dataset.plan);detailModal(pp.name,pp.subtitle,pp.features,pricing(pp.id).current);return}
  var preview=e.target.closest("[data-preview]");if(preview){detailModal("الحصص المباشرة","هيكل عرض تجريبي، بلا مواعيد أو حجوزات مؤكدة.",["يسجل المعلم وقت الحصة بعد الاعتماد","يُحجز المقعد عند تفعيل نظام الدفع","رابط الاجتماع محمي ولا يظهر إلا للمشترك المصرح له"],null);return}
  if(e.target.id==="applyCoupon"){applyCoupon();return}
  if(e.target.id==="calculateBtn"){calculate();return}
  if(e.target.id==="okDialog"||e.target.id==="closeDialog"){$("#detailDialog").close();return}
  var reset=e.target.closest("[data-reset]");if(reset){if(window.confirm("هل تريد إعادة جميع أسعار وعمولات وخصومات المعاينة إلى قيمها الافتراضية في هذا المتصفح؟")){state=JSON.parse(JSON.stringify(base));couponApplied=false;save();renderPrices();renderPrograms();renderFinance();toast("تمت استعادة الإعدادات التجريبية الافتراضية.")}return}
 });
 document.addEventListener("submit",function(e){
  if(e.target.id==="plansForm"){e.preventDefault();var f=new FormData(e.target),err=false;
   plans.forEach(function(p){var number=Number(f.get("price-"+p.id));if(!Number.isFinite(number)||number<.100||number>1000)err=true});
   if(err){toast("أدخل أسعارًا بين ٠٫١٠٠ و١٠٠٠ ريال.");return}
   plans.forEach(function(p){state.prices[p.id]=Math.round(Number(f.get("price-"+p.id))*1000)/1000;state.enabled[p.id]=f.has("enabled-"+p.id)});
   save();renderPrices();renderPrograms();renderFinance();toast("حُفظت الأسعار محليًا لهذه المعاينة.");return
  }
  if(e.target.id==="commissionForm"){e.preventDefault();var pct=Number($("#teacherPercent").value),fee=Number($("#paymentFee").value);
   if(!Number.isFinite(pct)||pct<0||pct>100||!Number.isFinite(fee)||fee<0||fee>30){toast("تحقق من حدود النسب المالية.");return}
   var overrides={},invalid=false;
   teachers.forEach(function(t){var v=$("#teacher-"+t.id).value;if(v==="")return;var n=Number(v);if(!Number.isFinite(n)||n<0||n>100)invalid=true;else overrides[t.id]=n});
   if(invalid){toast("يجب أن تكون نسب المعلمين من ٠ إلى ١٠٠٪.");return}
   state.teacherPercent=pct;state.paymentFee=fee;state.overrides=overrides;save();renderFinance();toast("حُفظت سياسة العمولات ونسب المعلمين في المعاينة.");return
  }
  if(e.target.id==="discountForm"){e.preventDefault();var g=Number($("#globalDiscount").value),p=Number($("#couponPercent").value),c=$("#couponCode").value.trim().toUpperCase(),expiry=$("#couponExpiry").value;
   if(!Number.isFinite(g)||g<0||g>80||!Number.isFinite(p)||p<0||p>80||!/^[A-Z0-9_-]{1,30}$/.test(c)){toast("تحقق من صحة رمز القسيمة والنسب.");return}
   state.globalDiscount=g;state.couponPercent=p;state.couponCode=c;state.couponEnabled=$("#couponEnabled").checked;state.couponExpiry=expiry;couponApplied=false;
   $("#couponInput").value="";$("#couponMessage").textContent="";save();renderPrices();renderPrograms();renderFinance();toast("حُفظت إعدادات الخصومات محليًا.");return
  }
 });
 $("#catalogSearch").addEventListener("input",function(e){currentSearch=e.target.value.trim();renderPrograms()});
 $("#gradeFilter").addEventListener("change",function(e){currentGrade=e.target.value;renderPrograms()});
 $("#typeFilter").addEventListener("change",function(e){currentType=e.target.value;renderPrograms()});
 $("#couponInput").addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();applyCoupon()}});
 $("#menuToggle").addEventListener("click",function(){var nav=$("#mainNav");nav.classList.toggle("open");this.setAttribute("aria-expanded",nav.classList.contains("open")?"true":"false")});
 $("#detailDialog").addEventListener("click",function(e){if(e.target===$("#detailDialog"))this.close()});
}
function start(){
 renderSubjects();renderPrograms();renderLive();renderPrices();renderRole();renderFinance();setupEvents();
 if(location.hash&&["#catalog","#live","#pricing","#workspace","#finance"].indexOf(location.hash)>=0){nav(location.hash.substring(1))}
}
start();
})();