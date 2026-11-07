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
