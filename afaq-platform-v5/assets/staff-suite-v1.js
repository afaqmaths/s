/* منظومة أعمال المعلم — منصة آفاق الرياضيات. لا تتضمن مفاتيح أو كلمات مرور. */
'use strict';
const ssState={
 year:'2026/2027',term:1,tab:'motto',records:[],contacts:[],
 loadedYear:'',contactsLoaded:false,loading:false,error:'',
 editing:null,editingContact:null,contactStudent:null,contactId:'',
 commDraft:'',commChannel:'whatsapp',commRecipient:'',
 dayDraft:[],customLesson:'',printOrientation:'landscape'
};
const ssEsc=v=>e(v??'');
const ssStr=v=>String(v??'').trim();
const ssItems=v=>String(v??'').split(/\r?\n|،|,/).map(x=>x.trim()).filter(Boolean);
const ssOptions=(items,selected)=>items.map(x=>'<option value="'+ssEsc(x)+'"'+(x===selected?' selected':'')+'>'+ssEsc(x)+'</option>').join('');
const ssTxt=(label,name,val='',rows=3)=>'<label class="ss-field"><span>'+label+'</span><textarea name="'+name+'" rows="'+rows+'">'+ssEsc(val)+'</textarea></label>';
const ssInp=(label,name,val='',type='text',attr='')=>'<label class="ss-field"><span>'+label+'</span><input name="'+name+'" type="'+type+'" value="'+ssEsc(val)+'" '+attr+'></label>';
const ssFieldSelect=(label,name,items,val)=>'<label class="ss-field"><span>'+label+'</span><select name="'+name+'">'+ssOptions(items,val)+'</select></label>';
const ssOptChecks=(name,items,selected=[])=>'<div class="ss-checks">'+items.map(x=>
 '<label><input type="checkbox" name="'+name+'" value="'+ssEsc(x)+'"'+(selected.includes(x)?' checked':'')+'><span>'+ssEsc(x)+'</span></label>').join('')+'</div>';
const ssMotto='التعليم رسالة شريفة لنقل العلم والثقافة والقيم للأجيال، وللعطاء وخدمة الوطن. أعمل بإخلاص وضمير، وأجعل مصلحة الطالب ونموه المعرفي والوجداني في المقام الأول.';
const SS_CATALOG={
 1:{
 'الأعداد':['القيمة المكانية','ترتيب ومقارنة وتقريب الأعداد','المتتاليات العددية','الأعداد الفردية والزوجية','الأعداد الأولية','الضرب والقسمة على ١٠ و١٠٠ و١٠٠٠','القسمة على ٣ و٤ و٥','المضاعفات والعوامل'],
 'القياس':['التعامل مع الطول','رسم الخطوط','الجداول الزمنية','التقويمات','المساحة والمحيط (١)'],
 'الهندسة':['تمييز المضلعات','خصائص الأشكال ثلاثية الأبعاد ومقاطعها العرضية','الشبكات','الزوايا في المثلثات','وصف الانسحاب','انعكاس الأشكال','الدوران على الشبكة'],
 'الأعداد (٢)':['نظام الأعداد (١)','تاريخ الأعداد','النظام العشري','العمليات على الأعداد العشرية','مضاعفات مشتركة','استراتيجيات ذهنية للجمع والطرح','قواعد قابلية القسمة','الضرب','القسمة (٢)','الأعداد الخاصة']
 },2:{}
};
const SS_OBJECTIVES={
 'المساحة والمحيط (١)':['6Ma1 — يقيس ويحسب محيط ومساحة أشكال مستقيمة الخطوط.','6Ma2 — يقدّر مساحة شكل غير منتظم باستخدام عدّ المربعات.','6Ma3 — يحسب محيط ومساحة الأشكال المركبة البسيطة.','6Ps1 — يشرح سبب اختياره طريقة الحساب ويعرض خطواته.'],
 'تمييز المضلعات':['6Gs1 — يصنّف المضلع وغير المضلع من الأشكال ثنائية الأبعاد.','6Gs3 — يصف خصائص المضلعات الرباعية ويصنّفها وفق الأضلاع والزوايا.'],
 'خصائص الأشكال ثلاثية الأبعاد ومقاطعها العرضية':['6Gs2 — يصف الوجوه والحواف والرؤوس للأشكال ثلاثية الأبعاد.','6Pt4 — يميّز الأشكال ثنائية الأبعاد وثلاثية الأبعاد ومقاطعها العرضية.']
};
const SS_STRATEGIES=['دائرة الضوء (بقعة الضوء)','المعلم الصغير','التعلم التعاوني','التعلم التشاركي','التعلم الذاتي','التعلم باللعب','التعلم بالنمذجة','الفصل المقلوب','العصف الذهني','فكر–زاوج–شارك','التعلم بالاكتشاف','التعلم القائم على المشروعات','حل المشكلات','التعلم بالاستقصاء','التعلم القائم على الأقران','المجموعات المرنة','البطاقات الملونة','السبورات البيضاء الصغيرة','الأكواب','الاستجابة الحركية','السلم العددي','التحدي الزمني','التعلم الرقمي','الحوار والمناقشة','التعلم المحطات','التعلم بالاستقراء'];
const SS_ACTIVITIES=['فردي','ثنائي','جماعي','تعاوني','تنافسي','تطبيقي','استقصائي','محسوس','رقمي','حركي','علاجي','إثرائي','ختامي'];
const SS_MATERIALS=['الكتاب المدرسي','كتاب النشاط','بطاقات الأعداد','مجسمات ثلاثية الأبعاد','مكعبات العد','أشكال هندسية','مسطرة وفرجار','أكواب','لوحة المئة','شبكات مربعات','النقود التعليمية','ساعة تدريبية','نماذج ورقية','سبورات صغيرة'];
const SS_DIGITAL=['السبورة الذكية','عرض تقديمي','صور ومقاطع','محاكاة رياضية','أنشطة تفاعلية','QR','رابط تعليم إلكتروني','ملف PDF'];
const SS_APPS=['GeoGebra','Polypad (Amplify)','Microsoft Teams','Microsoft PowerPoint','Microsoft Sway','Microsoft Whiteboard','Google Classroom','Google Forms','Google Slides','Google Sheets','Google Docs','Canva','Desmos','Kahoot','Wordwall','Wayground / Quizizz','Scratch','YouTube','H5P'];
const SS_ASSESSMENTS=['قبلي','تشخيصي','شفوي','ملاحظة الأداء','تكويني','تقويم الأقران','تقييم ذاتي','عبارات أستطيع','ورقة عمل','تذكرة الخروج','ختامي','واجب منزلي','سؤال استدلالي','تصحيح فوري','مشروع وتطبيق'];
const SS_EXAMS=[
 {name:'رياضيات السادس — امتحان الوزارة السابق (الدور الأول، الفصل الأول ٢٠٢٣/٢٠٢٤)',url:'https://main.moe.gov.om/images/zawity/file/Book287473.pdf',source:'ملف PDF من نطاق الوزارة'},
 {name:'رياضيات السادس — امتحان الوزارة السابق (الدور الثاني، الفصل الأول ٢٠٢٣/٢٠٢٤)',url:'https://main.moe.gov.om/images/zawity/file/Book502516.pdf',source:'ملف PDF من نطاق الوزارة'},
 {name:'نماذج المنصة التفاعلية واختبارات آفاق',url:'exams.html',source:'ملفات منصة آفاق، نماذج تدريبية وليست اختبارات وزارة رسمية'},
 {name:'خدمة زاويتي ومكتبة الامتحانات في بوابة وزارة التربية والتعليم',url:'https://site.moe.gov.om/Students',source:'صفحة خدمات الوزارة'},
 {name:'نماذج رياضيات الصف السادس في عمان سكول',url:'https://oman-school.com/exams-and-tests/',source:'موقع خارجي غير رسمي؛ تحقق من الروابط قبل اعتمادها'}
];
const SS_FORMS=[
 {title:'خدمات المراجعين — المديرية العامة للتربية والتعليم بمحافظة شمال الباطنة',url:'https://istmarah.moe.gov.om/app/form?id=bcf24fc1-b270-44c3-9c01-2c76f87aa6af'},
 {title:'خدمات المراجعين — وزارة التربية والتعليم',url:'https://istmarah.moe.gov.om/app/form?id=870c31fd-ad8e-44e6-934f-3e4694aef618'}
];
const ssYearOptions=['2025/2026','2026/2027','2027/2028','2028/2029'];
const ssLessonOptions=()=>Object.entries(SS_CATALOG[ssState.term]||{}).flatMap(([unit,lessons])=>lessons.map(l=>({unit,lesson:l})));
const ssCustomLessons=()=>ssState.records.filter(x=>x.record_type==='custom_lesson'&&x.semester===ssState.term).map(x=>({unit:x.unit||'مضاف',lesson:x.lesson||x.title}));
const ssAllLessons=()=>[...ssLessonOptions(),...ssCustomLessons()];
const ssUniq=v=>[...new Set(v)];
function ssMenu(role){
 const items=[['overview','الملخص'],['students','الطلاب'],['class_results','كشوف الشعب'],['staff_hub','دليل أعمال المعلم'],['staff_contacts','التواصل والدليل'],['content','الموارد']];
 if(role==='supervisor')items.push(['approvals','اعتماد النتائج'],['messages','المراسلات'],['security','الصلاحيات']);
 return '<div class="chips ss-main-menu">'+items.map(([key,label])=>'<button class="chip '+(auth.section===key?'sel':'')+'" data-tab="'+key+'">'+label+'</button>').join('')+'</div>';
}
function ssBanner(title,description){
 return '<div class="dashboard-banner"><div><h2>'+title+'</h2><p>'+description+'</p></div><button class="outline" id="portalLogout">خروج آمن</button></div>';
}
function ssDataNotice(){
 if(ssState.loading)return '<p class="notice">جارٍ قراءة السجلات المحفوظة...</p>';
 if(ssState.error)return '<p class="notice">'+ssEsc(ssState.error)+'</p>';
 return '';
}
function ssRecordList(type){
 const records=ssState.records.filter(x=>x.record_type===type&&(!x.semester||x.semester===ssState.term));
 if(!records.length)return '<p class="muted">لم تُحفظ سجلات لهذا القسم بعد. ابدأ من النموذج وأضف ما تريد.</p>';
 return '<div class="ss-record-list">'+records.map(r=>'<article class="ss-record">'+
 '<div><strong>'+ssEsc(r.title)+'</strong><small>'+ssEsc(r.unit||'')+(r.lesson?' • '+ssEsc(r.lesson):'')+
 (r.body?.is_sample?' • نموذج استرشادي مستخلص من الملف المرفق':'')+' • تحديث: '+ssEsc((r.updated_at||'').slice(0,10))+'</small></div>'+
 '<div><button type="button" class="soft" data-ss-edit="'+r.id+'">تحرير</button>'+
 (auth.user?.role==='supervisor'?'<button type="button" class="outline" data-ss-archive="'+r.id+'">أرشفة</button>':'')+'</div></article>').join('')+'</div>';
}
function ssYearsAndTerm(){
 return '<div class="ss-filters"><label>العام الدراسي <select id="ssYear">'+ssOptions(ssYearOptions,ssState.year)+'</select></label>'+
 '<label>الفصل الدراسي <select id="ssTerm"><option value="1"'+(ssState.term===1?' selected':'')+'>الأول</option>'+
 '<option value="2"'+(ssState.term===2?' selected':'')+'>الثاني</option></select></label></div>';
}
function ssTabs(){
 const opts=[['motto','ميثاق المعلم'],['goals','أهداف إجادة'],['initiatives','المبادرات'],['annual','الخطة السنوية'],['term','الخطة الفصلية'],['lessons','التحضير اليومي'],['resources','مصادر التعلم'],['exams','بنك الاختبارات']];
 return '<div class="ss-tabs">'+opts.map(([id,label])=>'<button class="'+(ssState.tab===id?'sel':'')+
 '" type="button" data-ss-tab="'+id+'">'+label+'</button>').join('')+'</div>';
}
function ssCurrentEdit(type){
 const e=ssState.editing;return e&&e.record_type===type?e:null;
}
function ssNewButton(){
 return '<button type="button" class="outline" id="ssNewRecord">إضافة سجل جديد / مسح حقول التحرير</button>';
}
function ssMottoView(){
 const r=ssCurrentEdit('motto')||ssState.records.find(x=>x.record_type==='motto');
 const body=r?.body||{};
 return '<section class="ss-card"><h3>ميثاق المعلم ورسالة التعليم</h3>'+
 '<p>المعلم حامل رسالة العلم والقيم للأجيال؛ يضع مصلحة الطالب في المقام الأول، ويبذل جهده بإخلاص وضمير لخدمة الوطن.</p>'+
 '<form id="ssRecordForm" data-type="motto">'+
 ssInp('عنوان الميثاق','title',r?.title||'رسالة المعلم وشعاره')+
 ssTxt('شعار المعلم وبيان رسالته','statement',body.statement||ssMotto,6)+
 ssTxt('القيم والمبادئ (قيمة في كل سطر)','values',Array.isArray(body.values)?body.values.join('\n'):'الإخلاص\nمصلحة الطالب\nاحترام الفروق الفردية\nالعدل والتحفيز\nخدمة الوطن',4)+
 '<button type="submit" class="primary">حفظ الميثاق</button></form>'+ssRecordList('motto')+'</section>';
}
function ssGoalView(kind){
 const type=kind==='goals'?'egada_goal':'initiative',r=ssCurrentEdit(type),b=r?.body||{};
 const word=type==='egada_goal'?'هدف إجادة':'مبادرة';
 return '<section class="ss-card"><h3>'+word+' خلال العام الدراسي '+ssEsc(ssState.year)+'</h3>'+
 '<p>أضف أهدافًا قابلة للقياس وخطوات التنفيذ ومؤشرات النجاح والشواهد، مع إمكانية مراجعتها وتعديلها.</p>'+
 ssNewButton()+'<form id="ssRecordForm" data-type="'+type+'">'+
 ssInp('عنوان '+word,'title',r?.title||'', 'text','required maxlength="240"')+
 ssFieldSelect('مجال العمل','domain',['تعليم وتعلم','تحصيل الطلاب','تنمية مهارات','إدارة صفية','تقنية تعليم','ابتكار','أنشطة ومشروعات','تطوير مهني'],b.domain||'تعليم وتعلم')+
 ssTxt('الوصف والأهداف التفصيلية','description',b.description||'',4)+
 ssTxt('مؤشرات الأداء القابلة للقياس','kpis',b.kpis||'',3)+
 ssTxt('خطوات التنفيذ','steps',b.steps||'',4)+
 ssTxt('الشواهد والأدلة','evidence',b.evidence||'',3)+
 ssInp('موعد التنفيذ أو المراجعة','deadline',b.deadline||'','date')+
 ssFieldSelect('الحالة','status',['مخطط','قيد التنفيذ','مكتمل','يحتاج متابعة'],b.status||'مخطط')+
 '<button class="primary" type="submit">حفظ '+word+'</button></form>'+ssRecordList(type)+'</section>';
}
function ssPlanView(kind){
 const type=kind==='annual'?'annual_plan':'term_plan',r=ssCurrentEdit(type),b=r?.body||{};
 return '<section class="ss-card"><h3>'+(type==='annual_plan'?'الخطة الدراسية السنوية':'الخطة الفصلية / الزمنية')+
 ' — '+ssEsc(ssState.year)+' — الفصل '+(ssState.term===1?'الأول':'الثاني')+'</h3>'+
 '<p>تُراجع الخطة وفق دليل المدرسة وكتاب الطالب وتقدم الدروس والتقويم المستمر.</p>'+ssNewButton()+
 '<form id="ssRecordForm" data-type="'+type+'">'+
 ssInp('عنوان الخطة','title',r?.title||((type==='annual_plan'?'الخطة السنوية':'الخطة الفصلية')+' للرياضيات ـ الصف السادس'),'text','required')+
 ssTxt('الأهداف العامة للتعلم','general_goals',b.general_goals||'تنمية التفكير الرياضي وحل المشكلات.\nتوظيف الرياضيات في الحياة اليومية.\nتعزيز الدقة والتواصل الرياضي.',4)+
 ssTxt('الوحدات ومجالات التعلم (قابلة للإضافة)','units',b.units||(ssState.term===1?Object.keys(SS_CATALOG[1]).join('\n'):'يرجى إضافة وحدات الفصل الثاني بحسب فهرس الكتاب المقرر'),5)+
 ssTxt('توزيع الدروس على الأسابيع والحصص','pacing',b.pacing||'',5)+
 ssTxt('طرائق التعلم واستراتيجيات التمايز','teaching_methods',b.teaching_methods||'',4)+
 ssTxt('خطة التقويم والتغذية الراجعة','assessment_plan',b.assessment_plan||'',4)+
 ssTxt('الإثراء والعلاج والمتابعة','intervention',b.intervention||'',4)+
 ssTxt('مؤشرات الإنجاز والشواهد','evidence',b.evidence||'',3)+
 '<button class="primary" type="submit">حفظ الخطة</button></form>'+ssRecordList(type)+'</section>';
}


function ssLessonCatalogView(){
 const units=Object.keys(SS_CATALOG[ssState.term]||{});
 const added=ssCustomLessons();
 return '<section class="ss-card ss-index"><h3>فهرس رياضيات الصف السادس</h3>'+
 '<p>'+(ssState.term===1?'أسماء الدروس المعروضة مستندة إلى فهرس كتاب الطالب للفصل الأول وإلى نماذج التحضير المرفقة، وهي قابلة للتعديل والإضافة.':
 'لم يُرفق كتاب الفصل الثاني للتحقق من فهرسه كاملاً؛ أضف الوحدات والدروس دون اعتبار المقترحات افتراضًا للمقرر الرسمي.')+'</p>'+
 (units.length?'<div class="ss-index-grid">'+units.map(u=>'<div><h4>'+ssEsc(u)+'</h4><ol>'+SS_CATALOG[ssState.term][u].map(l=>'<li>'+ssEsc(l)+'</li>').join('')+'</ol></div>').join('')+'</div>':'')+
 (added.length?'<h4>دروس أضافها المشرف</h4><p>'+added.map(x=>ssEsc(x.unit+' — '+x.lesson)).join('، ')+'</p>':'')+
 '<details><summary>إضافة وحدة أو درس إلى الفهرس</summary>'+
 '<form id="ssCustomLessonForm" class="ss-grid">'+
 ssInp('الوحدة / المجال','unit','','text','required')+
 ssInp('عنوان الدرس الجديد','lesson','','text','required')+
 ssTxt('الأهداف المقترحة (كل هدف في سطر)','objectives','',3)+
 '<button class="soft" type="submit">إضافة الدرس إلى قائمة الاختيار</button></form></details></section>';
}
function ssLessonForm(){
 const r=ssCurrentEdit('lesson_plan'),b=r?.body||{};
 const all=ssAllLessons(),units=ssUniq([...Object.keys(SS_CATALOG[ssState.term]||{}),...ssCustomLessons().map(x=>x.unit)]);
 const unit=ssState.lessonUnit||r?.unit||units[0]||'وحدة جديدة',
 lessons=ssUniq(all.filter(x=>x.unit===unit).map(x=>x.lesson));
 const lesson=ssState.lessonName||r?.lesson||lessons[0]||'درس جديد';
 const goals=(SS_OBJECTIVES[lesson]||ssState.records.find(x=>x.record_type==='custom_lesson'&&x.lesson===lesson)?.body?.objectives||[]);
 const oldGoals=Array.isArray(b.learning_objectives)?b.learning_objectives:[];
 const suggested=goals.length?'<div class="ss-catalog-objectives"><h4>أهداف قابلة للاختيار'+(SS_OBJECTIVES[lesson]?' (مستخرجة من نموذج التحضير المرفق)':' (مقترحة)')+'</h4>'+
 ssOptChecks('learning_objectives',goals,oldGoals)+'</div>':
 '<p class="muted">لا توجد أهداف موثقة في الملفات المتاحة لهذا الدرس؛ أضف الأهداف القابلة للقياس أدناه.</p>';
 const customGoals=oldGoals.filter(x=>!goals.includes(x)).join('\n');
 const checked=(key,list)=>ssOptChecks(key,list,Array.isArray(b[key])?b[key]:[]);
 const free=(label,key,rows=3)=>ssTxt(label,key,b[key]||'',rows);
 return '<section class="ss-card"><h3>التحضير اليومي الشامل للدرس</h3>'+
 '<p>مرجع عملي مستخلص من نماذج المساحة والمحيط، وتمييز المضلعات، والمجسمات ومقاطعها: تعلم قبلي، أهداف، نشاط أساسي، أنشطة متنوعة، تقويم تكويني وختامي، واجب، تمايز وإثراء وعلاج.</p>'+
 ssNewButton()+ssLessonCatalogView()+
 '<form id="ssRecordForm" data-type="lesson_plan">'+
 '<div class="ss-grid">'+
 ssFieldSelect('الوحدة / المجال','unit',units.length?units:[unit],unit)+
 ssFieldSelect('الدرس','lesson',lessons.length?lessons:[lesson],lesson)+
 ssInp('عنوان الخطة','title',r?.title||('تحضير درس: '+lesson),'text','required')+
 ssInp('تاريخ الإعداد','date_prepared',b.date_prepared||'','date')+
 '</div><div class="ss-grid">'+
 '<label class="ss-field"><span>الفصول المستهدفة</span>'+checked('classes',['السادس / ٤','السادس / ٥','السادس / ٦'])+'</label>'+
 '<label class="ss-field"><span>أيام التدريس (تاريخ في كل سطر)</span>'+
 '<textarea name="teach_days" id="ssTeachDays" rows="3">'+ssEsc((b.teach_days||[]).join('\n'))+'</textarea>'+
 '<div class="ss-date-helper"><input type="date" id="ssDayPicker"><button type="button" class="soft" id="ssAddDay">إضافة يوم</button></div></label></div>'+
 suggested+free('أهداف إضافية / مخرجات التعلم (هدف في كل سطر)','custom_objectives',4)+
 '<div class="ss-grid">'+free('التعلم القبلي / التهيئة / التمهيد','prior_learning',3)+
 free('النشاط الأساسي: المهمة، السؤال، خطوات التنفيذ','main_activity',5)+'</div>'+
 '<h4>أنماط الأنشطة التعليمية (اختيار متعدد)</h4>'+checked('activities',SS_ACTIVITIES)+
 free('وصف النشاط الفردي والثنائي والجماعي','activity_details',4)+
 '<h4>استراتيجيات التعلم (اختيار متعدد)</h4>'+checked('strategies',SS_STRATEGIES)+
 free('استراتيجية إضافية / توضيح توظيفها','extra_strategies',3)+
 '<h4>وسائل تعليمية محسوسة</h4>'+checked('physical_resources',SS_MATERIALS)+
 free('وسائل محسوسة إضافية','extra_physical_resources',2)+
 '<h4>وسائل تعليمية غير محسوسة ورقمية</h4>'+checked('digital_resources',SS_DIGITAL)+
 '<h4>البرامج والتطبيقات التعليمية</h4>'+checked('apps',SS_APPS)+
 free('برامج وتطبيقات إضافية','extra_apps',2)+
 free('روابط العروض والألعاب والمحاكاة والفيديو والمرفقات (رابط لكل سطر)','resource_links',3)+
 '<h4>التقويم بأنواعه (اختيار متعدد)</h4>'+checked('assessment_types',SS_ASSESSMENTS)+
 '<div class="ss-grid">'+free('التقويم القبلي','diagnostic_assessment',2)+
 free('التقويم التكويني أثناء الدرس','formative',3)+
 free('التقويم الختامي / تذكرة الخروج','final_assessment',3)+
 free('أسئلة الدرس وأسئلة الاختبارات بحسب الأهداف','assessment_questions',4)+
 free('الواجب المنزلي','homework',3)+
 free('نشاط إثرائي للطلاب المتفوقين','enrichment',3)+
 free('نشاط علاجي للطلاب ذوي الصعوبات','remedial',3)+
 free('تأمل المعلم والتغذية الراجعة','reflection',3)+
 free('ملاحظات / أدلة وشواهد','notes',3)+'</div>'+
 '<button type="submit" class="primary">💾 حفظ تحضير الدرس في سجل المعلم</button></form>'+
 ssRecordList('lesson_plan')+'</section>';
}
function ssResourceView(mode){
 const isExam=mode==='exams',type=isExam?'exam_resource':'resource',r=ssCurrentEdit(type),b=r?.body||{};
 const items=(isExam?SS_EXAMS:[
 {name:'Polypad — ملعب الرياضيات التفاعلي (Amplify)',url:'https://polypad.amplify.com/',source:'أدوات رياضية افتراضية مجانية'},
 {name:'GeoGebra — برنامج الهندسة والرسوم البيانية',url:'https://www.geogebra.org/',source:'منصة رياضية تفاعلية'},
 {name:'منصة Microsoft Sway',url:'https://sway.cloud.microsoft/',source:'توثيق الدروس والشواهد'},
 {name:'Microsoft Teams للتعليم',url:'https://teams.microsoft.com/',source:'المتابعة والتواصل التعليمي'}
 ]);
 return '<section class="ss-card"><h3>'+(isExam?'الاختبارات السابقة والتمارين والروابط التعليمية':'الموارد التعليمية والبرامج الرقمية')+'</h3>'+
 '<p>'+(isExam?'الروابط الرسمية التالية ملفات الوزارة مباشرة، بدل الاعتماد على صفحة وسيطة قد تتعطل. افتح الملف في المتصفح ثم استخدم زر التنزيل أو الطباعة؛ وموقع عمان سكول مصدر إضافي غير رسمي.':
 'تظهر برامج الرياضيات والتطبيقات التعليمية وروابطها المباشرة، مع إمكانية حفظ أي لعبة أو عرض أو فيديو أو ملف خارجي.')+'</p>'+
 '<div class="ss-resources">'+items.map(x=>'<article><strong>'+ssEsc(x.name)+'</strong>'+
 '<p>'+ssEsc(x.source)+'</p><a href="'+ssEsc(x.url)+'" target="_blank" rel="noopener noreferrer">فتح المورد والتحقق من التنزيل ↗</a></article>').join('')+'</div>'+
 '<p class="muted">توفر الرابط الخارجي قد يتغير. المنصة لا تزعم وجود ملفات قابلة للتنزيل قبل اختبار المصدر من متصفحك.</p>'+
 ssNewButton()+'<form id="ssRecordForm" data-type="'+type+'">'+
 ssInp('عنوان المورد / الاختبار','title',r?.title||'','text','required')+
 ssInp('الرابط المباشر الآمن HTTPS','resource_url',b.resource_url||'','url','placeholder="https://..."')+
 ssFieldSelect('تصنيف المورد','classification',['اختبار سابق','اختبار قصير','اختبار تدريبي','ورقة عمل','عروض تقديمية','لعبة','فيديو','محاكاة','ملف تعليمي','كتاب أو دليل'],b.classification||(isExam?'اختبار سابق':'محاكاة'))+
 ssTxt('وصف المورد ومحتواه','description',b.description||'',4)+
 ssTxt('ملاحظات الاستخدام والربط بالدرس','notes',b.notes||'',3)+
 '<button type="submit" class="primary">حفظ الرابط في مكتبة المعلم</button></form>'+
 ssRecordList(type)+'</section>';
}
async function ssLoadRecords(year=ssState.year){
 if(!canEdit())return;
 if(ssState.loading)return;
 ssState.loading=true;ssState.error='';render();
 try{
  const response=await api('teacher_records',{academic_year:year});
  if(year!==ssState.year)return;
  ssState.records=response.items||[];ssState.loadedYear=year;
 }catch(err){ssState.error=err.message}
 finally{ssState.loading=false;render()}
}
async function ssLoadContacts(){
 if(!canEdit()||ssState.loading)return;
 ssState.loading=true;ssState.error='';render();
 try{
  const response=await api('staff_directory');
  ssState.contacts=response.items||[];ssState.contactsLoaded=true;
 }catch(err){ssState.error=err.message}
 finally{ssState.loading=false;render()}
}
function ssCollectForm(form){
 const f=new FormData(form),type=form.dataset.type,body={};
 const title=ssStr(f.get('title'));
 if(!title)return null;
 const excl=['title','unit','lesson','date_prepared','resource_url'];
 if(type==='lesson_plan'){
  const arr=['classes','activities','strategies','physical_resources','digital_resources','apps','assessment_types'];
  for(const key of arr)body[key]=f.getAll(key).map(ssStr).filter(Boolean);
  const selected=f.getAll('learning_objectives').map(ssStr);
  body.learning_objectives=ssUniq([...selected,...ssItems(f.get('custom_objectives'))]);
  body.teach_days=ssUniq(ssItems(f.get('teach_days')));
  body.date_prepared=ssStr(f.get('date_prepared'));
  for(const [key,val] of f.entries())if(![...arr,'learning_objectives','custom_objectives','teach_days',...excl].includes(key))
   body[key]=ssStr(val);
 }else{
  for(const [key,value] of f.entries())if(!excl.includes(key))body[key]=ssStr(value);
  if(type==='motto')body.values=ssItems(f.get('values'));
  if(type==='resource'||type==='exam_resource')body.resource_url=ssStr(f.get('resource_url'));
 }
 const r=ssState.editing?.record_type===type?ssState.editing:null;
 return {id:r?.id,expected_updated_at:r?.updated_at,
  title,record_type:type,academic_year:ssState.year,semester:ssState.term,
  unit:type==='lesson_plan'?ssStr(f.get('unit')):r?.unit||null,
  lesson:type==='lesson_plan'?ssStr(f.get('lesson')):r?.lesson||null,
  body};
}
async function ssSaveRecord(form){
 const payload=ssCollectForm(form);
 if(!payload){ssState.error='يجب إدخال عنوان السجل.';render();return}
 try{
  await api('save_teacher_record',payload);
  ssState.editing=null;ssState.error='';auth.message='تم حفظ السجل في قاعدة البيانات مع المحافظة على نسخ التعديلات السابقة.';
  await ssLoadRecords();
 }catch(err){ssState.error=err.message;render()}
}
async function ssAddCustomLesson(form){
 const f=new FormData(form);const unit=ssStr(f.get('unit')),lesson=ssStr(f.get('lesson'));
 if(unit.length<2||lesson.length<2)return;
 try{
  await api('save_teacher_record',{record_type:'custom_lesson',title:lesson,unit,lesson,
    academic_year:ssState.year,semester:ssState.term,body:{objectives:ssItems(f.get('objectives'))}});
  ssState.lessonUnit=unit;ssState.lessonName=lesson;auth.message='تمت إضافة الدرس إلى فهرس الاختيار.';
  await ssLoadRecords();
 }catch(err){ssState.error=err.message;render()}
}
function ssTeacherView(){
 let part='';
 if(ssState.tab==='motto')part=ssMottoView();
 if(ssState.tab==='goals')part=ssGoalView('goals');
 if(ssState.tab==='initiatives')part=ssGoalView('initiatives');
 if(ssState.tab==='annual')part=ssPlanView('annual');
 if(ssState.tab==='term')part=ssPlanView('term');
 if(ssState.tab==='lessons')part=ssLessonForm();
 if(ssState.tab==='resources')part=ssResourceView('resources');
 if(ssState.tab==='exams')part=ssResourceView('exams');
 return ssBanner('دليل أعمال معلم الرياضيات','رسالة المعلم ← أهداف إجادة ← المبادرات ← الخطة الدراسية ← التحضير اليومي ← التقويم والمصادر')+
 ssMenu(auth.user?.role)+
 '<div class="ss-workspace"><p class="ss-privacy">مساحة عمل خاصة بالمشرف والمساعد؛ جميع الإضافات محفوظة في قاعدة البيانات، ويمكن تعديلها أو أرشفتها دون المساس بسجلات المسابقة أو النتائج.</p>'+
 ssYearsAndTerm()+ssTabs()+ssDataNotice()+part+'</div>';
}


/* التواصل: إنشاء مسودات يراجعها المشرف، لا إرسال صامت أو تلقائي لبيانات القُصّر. */
function ssSafeUrl(v){const x=ssStr(v);return /^https:\/\/[a-z0-9.-]+(?:\/|$)/i.test(x)?x:''}
const ssWa=n=>{let x=String(n||'').replace(/[^\d]/g,'');if(x.length===8)x='968'+x;return /^\d{9,15}$/.test(x)?x:''};
const ssContactsByOrg=org=>ssState.contacts.filter(x=>x.organization_type===org);
function ssDirectoryList(){
 if(!ssState.contacts.length)return '<p class="muted">لا توجد أرقام في دليل الهاتف، أو لم يتم تحميلها بعد.</p>';
 return '<div class="ss-contacts-grid">'+ssState.contacts.map(x=>'<article class="ss-contact">'+
 '<h4>'+ssEsc(x.label)+'</h4><p>'+ssEsc(x.organization)+' • '+ssEsc(x.organization_type)+'</p>'+
 (x.phone?'<p>الهاتف: <a href="tel:'+ssEsc(x.phone)+'">'+ssEsc(x.phone)+'</a></p>':'')+
 (x.whatsapp&&ssWa(x.whatsapp)?'<a target="_blank" rel="noopener noreferrer" href="https://wa.me/'+ssWa(x.whatsapp)+'">محادثة واتساب</a>':'')+
 (x.email?'<a href="mailto:'+encodeURIComponent(x.email)+'">بريد إلكتروني</a>':'')+
 (x.resource_url&&ssSafeUrl(x.resource_url)?'<a href="'+ssEsc(x.resource_url)+'" target="_blank" rel="noopener noreferrer">خدمة / موقع المؤسسة</a>':'')+
 (x.notes?'<p>'+ssEsc(x.notes)+'</p>':'')+
 '<div class="ss-row-buttons"><button type="button" class="outline" data-ss-contact-edit="'+x.id+'">تحرير</button>'+
 (auth.user?.role==='supervisor'&&!x.built_in?'<button type="button" class="outline" data-ss-contact-archive="'+x.id+'">أرشفة</button>':'')+'</div></article>').join('')+'</div>';
}
function ssContactForm(){
 const r=ssState.editingContact||{};
 const groups=['school','directorate','ministry','other'];
 const names={'school':'المدرسة','directorate':'المديرية التعليمية','ministry':'وزارة التربية والتعليم','other':'جهة أخرى'};
 return '<section class="ss-card"><h3>دليل الهاتف المؤسسي القابل للإضافة</h3>'+
 '<p>يمكن إضافة اسم وعنوان جهة، والمؤسسة التابعة لها، ورقم الهاتف أو الواتساب والبريد والرابط الرسمي؛ وتُعرض المعلومات للمشرف ومساعده فقط بعد تسجيل الدخول.</p>'+
 '<button type="button" id="ssContactNew" class="outline">إضافة جهة جديدة</button>'+
 '<form id="ssContactForm"><div class="ss-grid">'+
 ssInp('عنوان جهة الاتصال','label',r.label||'','text','required maxlength="120"')+
 ssInp('المؤسسة التي تتبعها','organization',r.organization||'','text','required')+
 '<label class="ss-field"><span>نوع المؤسسة</span><select name="organization_type">'+
 groups.map(k=>'<option value="'+k+'"'+(r.organization_type===k?' selected':'')+'>'+names[k]+'</option>').join('')+'</select></label>'+
 ssInp('هاتف الاتصال','phone',r.phone||'','tel','placeholder="242550000"')+
 ssInp('رقم الواتساب الدولي','whatsapp',r.whatsapp||'','tel','placeholder="9689XXXXXXX"')+
 ssInp('البريد الإلكتروني','email',r.email||'','email')+
 ssInp('رابط المؤسسة HTTPS','resource_url',r.resource_url||'','url')+
 ssTxt('ملاحظات الجهة','notes',r.notes||'',2)+'</div>'+
 '<button type="submit" class="primary">حفظ جهة الاتصال</button></form></section>';
}
function ssReferralLinks(){
 return '<section class="ss-card"><h3>التواصل مع إدارة المدرسة والمديرية والوزارة</h3>'+
 '<p>اختر وسيلة اتصال رسمية؛ تفتح المنصة الرابط فقط وتترك كتابة الطلب وإرساله لمستخدم الحساب، دون إرسال تلقائي.</p>'+
 '<div class="ss-resources">'+SS_FORMS.map(x=>'<article><strong>'+ssEsc(x.title)+'</strong>'+
 '<p>استمارة رسمية قد تتطلب التحقق أو تسجيل الدخول.</p>'+
 '<a href="'+ssEsc(x.url)+'" target="_blank" rel="noopener noreferrer">فتح نموذج خدمات المراجعين</a></article>').join('')+'</div>'+
 '<p>يمكن الوصول إلى مدير المدرسة وأرقام الوزارة من الدليل أدناه. يُراعى توثيق المراسلات المهمة وفق الإجراءات المدرسية المعتمدة.</p></section>';
}
function ssComposeStudentSelect(){
 const rows=Array.isArray(auth.students)?[...auth.students].sort((a,b)=>String(a.class_name||'').localeCompare(String(b.class_name||''),'ar')||Number(a.serial_no)-Number(b.serial_no)):[];
 return '<label class="ss-field"><span>الطالب (اختياري)</span><select id="ssContactStudent"><option value="">مراسلة عامة بدون بيانات طالب</option>'+
 rows.map(x=>'<option value="'+ssEsc(x.student_id)+'"'+(ssState.contactId===x.student_id?' selected':'')+'>'+
 ssEsc(x.class_name)+' — '+ssEsc(x.serial_no)+' — '+ssEsc(x.full_name||x.display_name)+'</option>').join('')+'</select></label>';
}
function ssComposeNoteOptions(){
 const p=ssState.contactStudent;if(!p)return '';
 const events=(p.assessment_events||[]).slice(0,50);
 const notes=(p.notes||[]).slice(0,20);
 let items=events.map((x,i)=>'<option value="event:'+i+'">'+(x.kind==='plus'?'A+':'A−')+
 ' • '+ssEsc(x.category)+' • '+ssEsc(x.points)+' نقطة</option>');
 items=items.concat(notes.map((x,i)=>'<option value="note:'+i+'">ملاحظة: '+ssEsc(x.category)+' — '+ssEsc(x.note.slice(0,70))+'</option>'));
 return '<label class="ss-field"><span>إدراج نقطة A أو ملاحظة سلوكية أو دراسية في المسودة (اختياري)</span>'+
 '<select id="ssContactNote"><option value="">اختر واقعة لإدراجها</option>'+items.join('')+'</select></label>';
}
function ssComposeView(){
 const school=ssContactsByOrg('school'),manager=school.find(x=>/مدير المدرسة/.test(x.label)),sender=school.find(x=>/مشرف/.test(x.label));
 return '<section class="ss-card"><h3>إنشاء رسالة اختيارية للطالب أو ولي الأمر أو إدارة المدرسة</h3>'+
 '<p>اختر واقعة من دفتر A+ وA− أو من الملاحظات السلوكية، ثم راجع نص الرسالة قبل فتح التطبيق. لا تُرسل المنصة أي رسالة آليًا، ولا تحفظ أرقام أولياء الأمور دون طلب مستقل.</p>'+
 '<div class="ss-grid">'+ssComposeStudentSelect()+ssComposeNoteOptions()+
 '<label class="ss-field"><span>وجهة الاتصال</span><select id="ssRecipientType">'+
 ['ولي الأمر / الطالب','إدارة المدرسة','المشرف على المنصة','جهة أخرى'].map(x=>'<option>'+x+'</option>').join('')+
 '</select></label>'+
 '<label class="ss-field"><span>طريقة المشاركة</span><select id="ssCommChannel">'+
 '<option value="whatsapp">واتساب</option><option value="instagram">إنستجرام (نسخ النص يدويًا)</option>'+
 '<option value="email">بريد إلكتروني / البريد الوزاري</option></select></label>'+
 ssInp('رقم واتساب المستلم الدولي أو بريده (يُدخل يدويًا للطالب أو ولي أمره)','recipient',ssState.commRecipient,'text','id="ssCommRecipient" placeholder="968XXXXXXXX أو name@example.com"')+
 ssTxt('نص الرسالة بعد المراجعة','message',ssState.commDraft||'',7)+'</div>'+
 '<label class="ss-consent"><input type="checkbox" id="ssShareConsent">أؤكد أنني مخوّل بمشاركة هذه المعلومات مع الجهة المحددة، وقد راجعت خلوها من بيانات غير لازمة.</label>'+
 '<div class="ss-row-buttons"><button class="primary" type="button" id="ssCommSend">فتح تطبيق المشاركة (لا يرسل تلقائيًا)</button>'+
 '<button class="outline" type="button" id="ssCommCopy">نسخ الرسالة فقط</button></div>'+
 '<p class="muted">إنستجرام لا يدعم إنشاء رسالة خاصة جاهزة عبر رابط ويب موثوق؛ ننسخ النص ونفتح صندوق الرسائل لتلصقه بنفسك.</p>'+
 (manager?'<div class="ss-contact-shortcuts"><p>جهة الإدارة المدرسية: <b>'+ssEsc(manager.label)+'</b></p>'+
 '<button class="soft" type="button" data-ss-fill-contact="'+manager.id+'">اختيار جهة المدير للمراسلة</button></div>':'')+
 (sender?'<p class="muted">التوقيع المقترح: '+ssEsc(sender.label)+'</p>':'')+
 '</section>';
}
function ssContactsView(){
 return ssBanner('التواصل المهني ودليل الهاتف','إدارة المدرسة • المديرية التعليمية • وزارة التربية والتعليم • أولياء الأمور')+
 ssMenu(auth.user?.role)+
 '<div class="ss-workspace">'+ssDataNotice()+ssReferralLinks()+ssComposeView()+
 ssContactForm()+ssDirectoryList()+'</div>';
}
function ssComposeMessageFromSelection(selected){
 const p=ssState.contactStudent,student=p?.student||{};
 const name=student.full_name||student.display_name||'';
 const intro='السلام عليكم ورحمة الله وبركاته،\n';
 let detail='';
 if(selected.startsWith('event:')){
  const x=p?.assessment_events?.[Number(selected.slice(6))];
  if(x)detail='نوع الرصد: '+(x.kind==='plus'?'A+ موجب (تميز ومشاركة)':'A− سالب (تحدٍ أو ملاحظة)')+
   '\nسبب الرصد: '+x.category+'\nعدد النقاط: '+x.points+
   (x.note?'\nالتفصيل: '+x.note:'');
 }else if(selected.startsWith('note:')){
  const x=p?.notes?.[Number(selected.slice(5))];
  if(x)detail='نوع المتابعة: '+x.category+'\nالملاحظة: '+x.note;
 }
 const studentLine=name?'بشأن الطالب: '+name+' — '+(student.class_name||'')+'\n':'';
 return intro+studentLine+(detail?detail+'\n':'')+
 'نرجو الاطلاع والمتابعة بما يخدم مصلحة الطالب، مع الشكر والتقدير.\n'+
 'الأستاذ سعيد بن جمعة بن عبدالله البريكي\nمنصة آفاق الرياضيات.';
}
function ssContactInfoSelected(){
 const select=document.getElementById('ssRecipientType');
 const receiver=document.getElementById('ssCommRecipient');
 if(!select||!receiver)return;
 const type=select.value,contacts=ssState.contacts;
 let c=null;
 if(type==='إدارة المدرسة')c=contacts.find(x=>x.organization_type==='school'&&/مدير المدرسة/.test(x.label));
 else if(type==='المشرف على المنصة')c=contacts.find(x=>x.organization_type==='school'&&/مشرف/.test(x.label));
 const channel=document.getElementById('ssCommChannel')?.value||'whatsapp';
 if(c)receiver.value=channel==='email'?(c.email||''):(c.whatsapp||c.phone||'');
}
function ssCommText(){
 const m=ssStr(document.querySelector('#ssContactsView_dummy')?.value||
 document.querySelector('#ssContactForm')?.dataset?.unused||
 document.querySelector('.ss-card textarea[name="message"]')?.value);
 return m;
}
function ssCopyText(text){
 if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(text).then(()=>true).catch(()=>false);
 const area=document.createElement('textarea');area.value=text;area.style.position='fixed';
 area.style.opacity='0';document.body.appendChild(area);area.select();
 let ok=false;try{ok=document.execCommand('copy')}catch{}
 area.remove();return Promise.resolve(ok);
}
function ssShareMessage(){
 const text=ssCommText(),approved=document.getElementById('ssShareConsent')?.checked;
 if(!text||!approved){window.alert('اكتب رسالة وفعّل إقرار مراجعة معلومات الطالب والمستلم قبل فتح المشاركة.');return}
 const channel=document.getElementById('ssCommChannel')?.value||'whatsapp',
 recipient=ssStr(document.getElementById('ssCommRecipient')?.value);
 if(channel==='whatsapp'){
  const phone=ssWa(recipient);
  if(!phone){window.alert('أدخل رقم واتساب دوليًا صحيحًا للمستلم؛ مثلاً 968XXXXXXXX.');return}
  window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(text),'_blank','noopener,noreferrer');
 }else if(channel==='email'){
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)){window.alert('أدخل عنوان بريد إلكتروني صحيحًا.');return}
  const subject='متابعة تربوية — منصة آفاق الرياضيات';
  window.location.href='mailto:'+recipient+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(text);
 }else{
  window.open('https://www.instagram.com/direct/inbox/','_blank','noopener,noreferrer');
  ssCopyText(text).then(ok=>{if(!ok)window.prompt('انسخ نص الرسالة وألصقه بنفسك في إنستجرام:',text);else window.alert('نُسخ النص، ويمكنك لصقه في رسالة إنستجرام بعد اختيار المستلم.')});
 }
}
