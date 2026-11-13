/* Afaq Math 8 — genuine interactive mathematics mixer, formative questions, print hub and homepage tools */
'use strict';
const AFAQ_TYPES=[
 ['oral','🗣️','السؤال الشفوي'],
 ['short_question','✏️','السؤال القصير'],
 ['short_test','📝','الاختبار القصير'],
 ['homework','📗','الواجب المنزلي'],
 ['mock_final','📋','الاختبار النهائي التجريبي']
];
const aeAssessment={grade:6,type:'short_question',questions:[],key:'',loading:'',error:'',
  responses:{},followupResponses:{},choices:{},followupChoices:{},busy:false,admin:[],adminKey:'',adminLoading:'',
  adminGrade:6,adminType:'all',editing:null,bankGrade:6,bankType:'all'};
const mix={input:3,rule:'multiply4',result:12,spins:0};
const mixRules={
 multiply4:{symbol:'× ٤',operation:x=>x*4,inverse:'اقسم الناتج على ٤ للعودة إلى المدخل',name:'الضرب في ٤'},
 add3:{symbol:'+ ٣',operation:x=>x+3,inverse:'اطرح ٣ من الناتج للعودة إلى المدخل',name:'جمع ٣'},
 subtract2:{symbol:'− ٢',operation:x=>x-2,inverse:'أضف ٢ إلى الناتج للعودة إلى المدخل',name:'طرح ٢'},
 divide2:{symbol:'÷ ٢',operation:x=>x/2,inverse:'اضرب الناتج في ٢ للعودة إلى المدخل',name:'القسمة على ٢'},
 square:{symbol:'x²',operation:x=>x*x,inverse:'إذا كان المدخل موجبًا، خذ الجذر التربيعي للناتج',name:'تربيع العدد'}
};
const aeCanManage=()=>auth.user?.role==='supervisor';
const aeCanRead=()=>['supervisor','supervisor_assistant','director','deputy','it_viewer'].includes(auth.user?.role);
const aeN=n=>new Intl.NumberFormat('ar-OM',{maximumFractionDigits:2}).format(Number(n)||0);
function aeGrade(){return auth.user?.role==='student'?Number(auth.user.grade)||6:Number(aeAssessment.grade)}
function aeKind(t){return AFAQ_TYPES.find(x=>x[0]===t)?.[2]||t}
function afaqMixerInteractive(compact=true){
 const rule=mixRules[mix.rule],n=Number(mix.input),res=rule.operation(n);
 const controls='<div class="afaq-mixer-numbers"><label>رقم الإدخال <input type="number" id="afaqMixerInput" min="-50" max="100" step="1" value="'+aeEsc(n)+'"></label>'+
  '<label>العملية الرياضية<select id="afaqMixerRule">'+
  Object.entries(mixRules).map(([key,op])=>'<option value="'+key+'"'+(mix.rule===key?' selected':'')+'>'+aeEsc(op.name)+'</option>').join('')+'</select></label>'+
  '<button type="button" id="afaqMixerStart" class="ae-mixer-go">▶ اخلط الأعداد</button></div>';
 return '<section class="afaq-mixer '+(compact?'afaq-mixer-compact':'afaq-mixer-full')+'">'+
  '<div class="afaq-mixer-heading"><h2>خلاط الرياضيات <span lang="en">Math Mixer</span></h2>'+
  '<p>مدخلات ← عملية ← مخرجات</p></div>'+
  '<div class="afaq-mixer-visual">'+
  '<div class="afaq-mixer-side"><span>المدخلات<br><small lang="en">Input</small></span>'+
  '<div class="ae-fruit">🥭</div><b>مانجو</b><div class="ae-math-value">'+aeN(n)+'</div></div>'+
  '<div class="afaq-mixer-blender"><img src="assets/afaq-mixer.svg?v=20261113-mixer1" width="225" height="234" alt="خلاط رياضيات يمزج المدخلات باستخدام عملية حسابية">'+
  '<strong class="afaq-mixer-operation">'+aeEsc(rule.symbol)+'</strong></div>'+
  '<div class="afaq-mixer-side"><span>المخرجات<br><small lang="en">Output</small></span>'+
  '<div class="ae-juice">🥤</div><b>عصير مانجو</b><div class="ae-math-value" id="afaqMixerResult">'+aeN(res)+'</div></div></div>'+
  controls+
  '<p class="afaq-mixer-caption">المدخل <b>'+aeN(n)+'</b> → '+aeEsc(rule.name)+' → المخرج <b>'+aeN(res)+'</b></p>'+
  (compact?'<button type="button" class="ae-mixer-details" data-route="mixer">اكتشف القاعدة والعملية العكسية</button>':
  '<article class="ae-mixer-explanation"><h3>كيف يرتبط الخلاط بالرياضيات؟</h3>'+
  '<p><b>١ — المدخلات (Input):</b> تبدأ بعدد، مثل '+aeN(n)+'، أو كمية حقيقية مثل حبات المانجو.</p>'+
  '<p><b>٢ — العملية (Operation):</b> كما يمزج الخلاط الفاكهة، تطبق الآلة الرياضية قاعدة ثابتة على العدد، مثل '+aeEsc(rule.name)+'.</p>'+
  '<p><b>٣ — المخرجات (Output):</b> تتغير قيمة العدد وفق العملية وتصبح '+aeN(res)+
  '؛ والمقارنة الواقعية هي تحويل الفاكهة إلى عصير بعد الخلط.</p>'+
  '<p><b>٤ — العملية العكسية:</b> '+aeEsc(rule.inverse)+'.</p>'+
  '<p><b>٥ — علاقة المدخل بالمخرج:</b> عند استعمال القاعدة نفسها لجميع المدخلات يمكن إنشاء جدول دالة رياضية أو متتالية؛ مثال ١ ← ٤، ٢ ← ٨، ٣ ← ١٢ في قاعدة الضرب في ٤.</p>'+
  '<p class="ae-mixer-note">تنبيه: المثال الواقعي يوضح فكرة التحويل، لكنه ليس مساواة عددية بين حبة المانجو وكأس العصير.</p></article>')+
 '</section>';
}
function aeMixerPage(){
 return '<div class="container ae-mixer-page" dir="rtl">'+afaqMixerInteractive(false)+'</div>';
}
/* Abstract national-colour ribbons: no coat of arms or approximated flag emblem. */
function afaqNationalRibbon(mode='card'){
 const design=mode==='horizon'?'horizon':mode==='detail'?'detail':'card';
 return '<div class="afaq-national-ribbon afaq-national-ribbon--'+design+'" role="img" '+
  'aria-label="زخرفة فنية متحركة باللون الأحمر والأبيض والأخضر مستوحاة من ألوان سلطنة عُمان">'+
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 210" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'+
  '<defs><linearGradient id="afRibbonWarm" x1="0" y1="0" x2="1" y2="0">'+
  '<stop stop-color="#e85d58"/><stop offset=".49" stop-color="#d52232"/><stop offset="1" stop-color="#f16c59"/></linearGradient>'+
  '<linearGradient id="afRibbonWhite" x1="0" y1="0" x2="1" y2="0">'+
  '<stop stop-color="#e5f7ff"/><stop offset=".55" stop-color="#fff"/><stop offset="1" stop-color="#d5eaf2"/></linearGradient>'+
  '<linearGradient id="afRibbonGreen" x1="0" y1="0" x2="1" y2="0">'+
  '<stop stop-color="#55b88e"/><stop offset=".53" stop-color="#168653"/><stop offset="1" stop-color="#58c59d"/></linearGradient></defs>'+
  '<g class="afaq-national-waves" fill="none" stroke-linecap="round">'+
  '<path class="afaq-national-wave afaq-national-wave--white" d="M-100 78 C80 5 207 161 384 87 S682 25 839 85 S1080 135 1300 52" stroke="url(#afRibbonWhite)" stroke-width="18"/>'+
  '<path class="afaq-national-wave afaq-national-wave--red" d="M-100 113 C92 40 221 199 395 116 S687 57 849 116 S1096 176 1300 87" stroke="url(#afRibbonWarm)" stroke-width="22"/>'+
  '<path class="afaq-national-wave afaq-national-wave--green" d="M-100 151 C95 81 225 236 399 156 S693 91 855 159 S1094 218 1300 123" stroke="url(#afRibbonGreen)" stroke-width="19"/>'+
  '</g><g class="afaq-national-glints" fill="#ffe6b0" opacity=".65">'+
  '<circle cx="175" cy="31" r="3"/><circle cx="1038" cy="62" r="4"/><circle cx="668" cy="182" r="3"/></g>'+
  '</svg></div>';
}
function afaqHomeShowcase(){
 const cards=[
  ['learning','📖','التعليم والتعلّم'],['library','📚','المكتبة الرقمية'],
  ['contests','🏆','المسابقات والتحديات'],['question_bank','🧩','بنك الأسئلة'],
  ['work','📝','مهام العمل وأوراق العمل'],['workshops','🎓','مشاغل الإنماء المهني'],
  ['adaptive','🎯','التغذية الراجعة الذكية'],['print_center','🖨️','مركز الطباعة'],
  ['adaptive','📋','التقويم والاختبارات'],['learning','🌿','الخطة العلاجية والإثرائية'],
  ['dashboard','📊','التقارير والإحصاءات'],['dashboard','🏅','التفاعل A+ وA−']
 ];
 return '<section class="afaq-home-showcase" aria-label="أدوات آفاق ماث">'+
 '<div class="afaq-home-side"><button type="button" class="afaq-national-card" data-route="national_values">'+
  afaqNationalRibbon('card')+
  '<span>✦ قيمة وطنية</span><strong>الانتماء للوطن مسؤولية ووفاء</strong></button>'+
  '<button type="button" class="afaq-science-card" data-route="science_news">'+
  '<span>🔬 الأخبار الثقافية والعلمية</span><strong>مستجدات العلم والتكنولوجيا</strong>'+
  '<small>أخبار موثقة من مصادرها الأصلية</small></button></div>'+
  '<div class="afaq-home-mixer">'+afaqMixerInteractive(true)+'</div>'+
  '<div class="afaq-home-modules">'+cards.map(([route,icon,label],i)=>{
   const action=(i===10&&aeCanRead())?'data-route="dashboard"':(i===11&&aeCanRead())?
    'data-ae-open-awards="true"':'data-route="'+route+'"';
   return '<button type="button" class="afaq-home-module" '+action+'>'+
    '<span class="afaq-home-module-icon">'+icon+'</span><strong>'+label+'</strong></button>';
  }).join('')+'</div></section>';
}
function aeNationalPage(){return '<div class="container ae-national-page" dir="rtl">'+
 '<section class="ae-section-hero"><h1>🇴🇲 قيمة وطنية — الانتماء للوطن مسؤولية ووفاء</h1>'+
 '<p>من قيمنا الاعتزاز بالهوية العُمانية، وحفظ منجزات الوطن، والعمل بإتقان لخدمة المجتمع.</p></section>'+
 afaqNationalRibbon('detail')+
 '<article class="ae-info-card"><h2>الرياضيات وخدمة الوطن</h2>'+
 '<p>نستخدم الرياضيات في التخطيط للمشاريع والبناء وقياس المساحات والمياه والطاقة وفهم الإحصاءات الوطنية، ونربط التعلم بالإبداع والوفاء لمسؤولياتنا.</p></article></div>';}
function aeSelectChoices(choices,key,disabled=false,selected=null){
 return '<div class="ae-assessment-options">'+aeList(choices).map((choice,i)=>
  '<label class="'+(selected===i?'ae-option-selected':'')+'"><input type="radio" name="'+aeEsc(key)+'" value="'+i+'" '+
  (selected===i?'checked':'')+(disabled?' disabled':'')+'><span>'+aeEsc(choice)+'</span></label>').join('')+'</div>';
}
function aeQuestionCard(q,i){
 const selection=aeAssessment.choices[q.id],result=aeAssessment.responses[q.id],
  follow=aeAssessment.followupResponses[q.id],followChoice=aeAssessment.followupChoices[q.id];
 const prompt='السؤال '+aeN(i+1)+' — '+aeEsc(q.lesson);
 return '<article class="ae-assessment-card"><header><span>'+prompt+'</span><span>'+aeEsc(aeKind(q.assessment_type))+'</span></header>'+
 '<h3>'+aeEsc(q.question)+'</h3>'+
 aeSelectChoices(q.choices,'ae-choice-'+q.id,!!result,selection)+
 (!result?'<button type="button" data-ae-submit="'+aeEsc(q.id)+'" class="ae-action" '+
  (selection===undefined||aeAssessment.busy?'disabled':'')+'>تصحيح الإجابة</button>':'')+
 (result?'<div class="ae-question-feedback '+(result.correct?'correct':'incorrect')+'">'+
 '<strong>'+(result.correct?'✓ إجابة صحيحة':'✗ إجابة غير صحيحة')+'</strong>'+
 '<p>الإجابة الصحيحة: '+aeEsc(result.correct_answer)+'</p>'+
 (result.explanation?'<p>'+aeEsc(result.explanation)+'</p>':'')+
 '<div class="ae-followup"><h4>'+(result.track==='remedial'?'🧩 سؤال علاجي':'🌿 سؤال إثرائي')+' من المفهوم نفسه</h4>'+
 '<p>'+aeEsc(result.followup?.question)+'</p>'+
 (!follow?aeSelectChoices(result.followup?.choices,'ae-follow-'+q.id,false,followChoice)+
 '<button type="button" class="ae-action" data-ae-followup="'+aeEsc(q.id)+'" '+
 (followChoice===undefined||aeAssessment.busy?'disabled':'')+'>تحقق من المتابعة</button>':
 '<p class="'+(follow.correct?'ae-fb-good':'ae-fb-bad')+'">'+
 (follow.correct?'✓ ممتاز، أجبت عن المتابعة بصورة صحيحة.':'الإجابة الصحيحة: '+aeEsc(follow.correct_answer))+'</p>'+
 '<p>'+aeEsc(follow.explanation||'')+'</p>')+'</div></div>':'')+'</article>';
}
async function aeLoadAssessment(force=false){
 if(!auth.user)return;
 const grade=aeGrade(),type=aeAssessment.type,key=[auth.token,grade,type].join(':');
 if(!force&&(aeAssessment.key===key||aeAssessment.loading===key))return;
 aeAssessment.loading=key;aeAssessment.error='';
 try{
  const d=await aeApi('question_list',{grade,assessment_type:type},true);
  if(aeAssessment.loading!==key)return;
  aeAssessment.questions=aeList(d.questions);aeAssessment.key=key;
  aeAssessment.choices={};aeAssessment.responses={};aeAssessment.followupChoices={};aeAssessment.followupResponses={};
 }catch(err){aeAssessment.error=err.message}
 finally{if(aeAssessment.loading===key){aeAssessment.loading='';if(state.page==='adaptive')render()}}
}
function aeAdaptivePage(){
 const grade=aeGrade(),type=aeAssessment.type;
 if(auth.user&&aeAssessment.key!==[auth.token,grade,type].join(':')&&!aeAssessment.loading)
  Promise.resolve().then(()=>aeLoadAssessment());
 return '<div class="container ae-adaptive-page" dir="rtl"><section class="ae-section-hero">'+
 '<span>التعلّم المتكيف</span><h1>التقويم والتغذية الراجعة</h1>'+
 '<p>ابدأ بسؤال من الدرس، ثم يمنحك النظام سؤالًا علاجيًا عند الخطأ أو إثرائيًا عند الإجابة الصحيحة، مع شرح الحل في لوحة السؤال نفسها.</p></section>'+
 (auth.user?
  (aeCanRead()?'<label class="ae-assessment-grade">الصف <select id="aeAssGrade">'+
   [5,6,7,8].map(n=>'<option value="'+n+'"'+(grade===n?' selected':'')+'>الصف '+aeN(n)+'</option>').join('')+
   '</select></label>':'<p class="ae-grade-label">الصف '+aeN(grade)+'</p>')+
  '<div class="ae-assess-tabs">'+AFAQ_TYPES.map(([key,icon,label])=>
   '<button type="button" class="'+(type===key?'selected':'')+'" data-ae-kind="'+key+'">'+icon+' '+label+'</button>').join('')+'</div>'+
  '<div class="ae-assessment-grid">'+(aeAssessment.loading?'<p>جارٍ تحميل الأسئلة...</p>':
   aeAssessment.error?'<p>'+aeEsc(aeAssessment.error)+'</p>':
   aeAssessment.questions.length?aeAssessment.questions.map(aeQuestionCard).join(''):
   '<p>لا توجد أسئلة منشورة لهذا الصف والنوع بعد.</p>')+'</div>'+
  '<p class="ae-feedback-note">هذا تدريب تعليمي مستقل؛ لا يغيّر الدرجات الرسمية أو محاولات مسابقة نجوم آفاق.</p>':
  '<div class="ae-info-card"><p>سجّل الدخول للوصول إلى أسئلة التقويم وحفظ المتابعة.</p>'+
  '<button data-ae-login="student" class="primary">دخول الطالب</button></div>')+'</div>';
}
function aeBankPage(){
 return '<div class="container ae-bank-page" dir="rtl"><section class="ae-section-hero"><h1>📚 بنك الأسئلة المنظم</h1>'+
 '<p>حدد الصف الدراسي ونوع التقويم؛ ستظهر الأسئلة وشرح الإجابة والأنشطة العلاجية والإثرائية بعد الإجابة، وليس قبلها.</p></section>'+
 '<div class="ae-bank-controls"><label>الصف الدراسي<select id="aeBankGrade">'+
 [5,6,7,8].map(n=>'<option value="'+n+'"'+(aeAssessment.bankGrade===n?' selected':'')+'>الصف '+aeN(n)+'</option>').join('')+
 '</select></label><label>نوع السؤال<select id="aeBankType"><option value="all">جميع الأنواع</option>'+
 AFAQ_TYPES.map(([key,icon,label])=>'<option value="'+key+'"'+(aeAssessment.bankType===key?' selected':'')+'>'+label+'</option>').join('')+'</select></label></div>'+
 '<div class="ae-bank-types">'+AFAQ_TYPES.filter(x=>aeAssessment.bankType==='all'||x[0]===aeAssessment.bankType).map(([key,icon,label])=>
 '<article><span>'+icon+'</span><h2>'+label+'</h2>'+
 '<p>أسئلة ملائمة للصف مع نماذج التصحيح والمتابعة بعد الحل.</p>'+
 '<button type="button" data-ae-start-bank="'+key+'">فتح الأسئلة</button></article>').join('')+'</div>'+
 (aeCanRead()?'<button type="button" class="ae-secondary" data-tab="ae_question_bank">عرض إدارة بنك الأسئلة ونماذج الإجابة</button>':'')+
 '</div>';
}
async function aeLoadAdminQuestions(force=false){
 if(!aeCanRead())return;
 const key=[auth.token,aeAssessment.adminGrade,aeAssessment.adminType].join(':');
 if(!force&&(aeAssessment.adminKey===key||aeAssessment.adminLoading===key))return;
 aeAssessment.adminLoading=key;
 try{
  const d=await aeApi('question_staff',{grade:aeAssessment.adminGrade,assessment_type:aeAssessment.adminType},true);
  if(aeAssessment.adminLoading!==key)return;
  aeAssessment.admin=d.questions||[];aeAssessment.adminKey=key;aeAssessment.error='';
 }catch(e){aeAssessment.error=e.message}
 finally{if(aeAssessment.adminLoading===key){aeAssessment.adminLoading='';if(state.page==='dashboard')render()}}
}
function aeQuestionAdmin(){
 const key=[auth.token,aeAssessment.adminGrade,aeAssessment.adminType].join(':');
 if(aeAssessment.adminKey!==key&&!aeAssessment.adminLoading)Promise.resolve().then(()=>aeLoadAdminQuestions());
 const edit=aeAssessment.admin.find(x=>x.id===aeAssessment.editing)||null;
 const esc=aeEsc,v=(key,fallback='')=>esc(edit?.[key]??fallback);
 const field=(key,label)=>'<label>'+label+'<textarea name="'+key+'" required rows="2">'+v(key)+'</textarea></label>';
 const choices=(key,label)=>'<label>'+label+' (اختيار واحد في كل سطر)<textarea name="'+key+'" required rows="4">'+
  esc(aeList(edit?.[key]).join('\n'))+'</textarea></label>';
 const number=(key,label)=>'<label>'+label+'<input name="'+key+'" type="number" min="1" max="5" value="'+
  (edit?Number(edit[key])+1:1)+'" required></label>';
 const select=(selected,blank=false)=>AFAQ_TYPES.map(([key,icon,label])=>
  '<option value="'+key+'"'+(selected===key?' selected':'')+'>'+icon+' '+label+'</option>').join('');
 return '<div class="container ae-admin-page"><section class="ae-section-hero"><h1>🧩 بنك الأسئلة ونماذج الإجابة</h1>'+
 '<p>كل سؤال له صف ومجال ونموذج حل، وسؤال علاجي وسؤال إثرائي مرتبطان به.</p></section>'+
 '<div class="ae-bank-controls"><label>الصف<select id="aeAdminGrade">'+[5,6,7,8].map(n=>
 '<option value="'+n+'"'+(aeAssessment.adminGrade===n?' selected':'')+'>الصف '+aeN(n)+'</option>').join('')+
 '</select></label><label>النوع<select id="aeAdminType"><option value="all">جميع الأنواع</option>'+
 select(aeAssessment.adminType)+'</select></label></div>'+
 '<div class="ae-admin-items">'+aeAssessment.admin.map(q=>
 '<article><strong>'+aeEsc(q.lesson)+' • '+aeEsc(aeKind(q.assessment_type))+'</strong>'+
 '<p>'+aeEsc(q.question)+'</p><p>نموذج الإجابة: <b>'+aeEsc(aeList(q.choices)[q.correct_index])+'</b></p>'+
 '<small>'+(q.published?'منشور':'غير منشور')+'</small>'+
 (aeCanManage()?'<button data-ae-question-edit="'+aeEsc(q.id)+'">تعديل</button>'+
 '<button data-ae-question-archive="'+aeEsc(q.id)+'">إخفاء</button>':'')+'</article>').join('')+'</div>'+
 (aeCanManage()?'<details class="ae-admin-editor" '+(edit?'open':'')+'><summary>'+
 (edit?'تعديل السؤال ونموذج الإجابة':'＋ إضافة سؤال جديد')+'</summary>'+
 '<form id="aeQuestionEditor">'+
 '<input type="hidden" name="id" value="'+v('id')+'">'+
 '<label>الصف<select name="grade">'+[5,6,7,8].map(n=>
  '<option value="'+n+'"'+(Number(edit?.grade||aeAssessment.adminGrade)===n?' selected':'')+'>الصف '+aeN(n)+'</option>').join('')+'</select></label>'+
 '<label>نوع السؤال<select name="assessment_type">'+select(edit?.assessment_type||aeAssessment.adminType)+'</select></label>'+
 '<label>اسم الدرس<input name="lesson" value="'+v('lesson')+'" maxlength="150" required></label>'+
 field('question','السؤال الأصلي')+choices('choices','الاختيارات')+number('correct_index','رقم الإجابة الصحيحة')+
 '<label>شرح الإجابة<textarea name="explanation">'+v('explanation')+'</textarea></label>'+
 '<h3>سؤال علاجي</h3>'+field('remedial_question','السؤال العلاجي')+
 choices('remedial_choices','خيارات العلاجي')+number('remedial_correct_index','رقم الإجابة الصحيحة للعلاجي')+
 '<h3>سؤال إثرائي</h3>'+field('enrichment_question','السؤال الإثرائي')+
 choices('enrichment_choices','خيارات الإثرائي')+number('enrichment_correct_index','رقم الإجابة الصحيحة للإثرائي')+
 '<label><input type="checkbox" name="published" '+(edit?.published?'checked':'')+'> نشر للطلاب</label>'+
 '<button class="primary" type="submit">💾 حفظ السؤال ونموذج الإجابة</button></form></details>':'')+
 '<p id="aeQuestionMessage" role="status">'+aeEsc(aeAssessment.error||'')+'</p></div>';
}
const aeOldGenericV8=genericSection;
genericSection=function(page){
 if(page==='mixer')return aeMixerPage();
 if(page==='adaptive')return aeAdaptivePage();
 if(page==='question_bank')return aeBankPage();
 if(page==='national_values')return aeNationalPage();
 if(page==='print_center')return afaqPrintCenter(false);
 return aeOldGenericV8(page);
};
const aeOldHubPrintCenterV8=hubPrintCenter;
hubPrintCenter=function(){return afaqPrintCenter(true)+
 '<details class="afaq-print-legacy"><summary>المصادر الإضافية والتصدير إلى Word</summary>'+
 aeOldHubPrintCenterV8()+'</details>';};
function afaqPrintCenter(inStaff){
 const groups=[
  ['education','📘 التعليم والتعلّم',[
    ['work','أوراق العمل والمهام'],['workshops','مشاغل الإنماء المهني'],
    ['mixer','أنشطة خلاط الرياضيات'],['adaptive','الأسئلة والتغذية الراجعة']]],
  ['library','📚 المكتبة والمعرفة',[
    ['library','المكتبة العامة'],['question_bank','بنك الأسئلة ونماذج الحلول'],
    ['national_values','القيم الوطنية'],['science_news','العلوم والثقافة']]],
  ['assessment','📝 التقويم والخطط',[
    ['adaptive','الأسئلة القصيرة والشفوية والواجبات'],['learning','الخطة العلاجية والإثرائية'],
    ['dashboard','سجل الرصد والتقارير','official_register'],['dashboard','كشوف الشعب','class_results']]],
  ['certificates','🏅 الشهادات',[
    ['dashboard','الشهادات التعليمية','students'],['dashboard','شهادات التفاعل A+ وA−','a_awards'],
    ['contests','شهادات المسابقات']]]];
 return '<div class="container afaq-print-hub" dir="rtl"><section class="ae-section-hero">'+
 '<span>مركز الطباعة</span><h1>مركز الطباعة والتوثيق</h1>'+
 '<p>اختَر القسم الرئيسي، ثم المستند أو النموذج الفرعي لعرضه أو طباعته. الطباعة الرسمية والدرجات تتطلب حسابًا مخولًا.</p></section>'+
 '<div class="afaq-print-categories">'+groups.map(([id,title,items])=>
  '<section class="afaq-print-group"><h2>'+title+'</h2>'+
  '<div>'+items.map(([route,label,tab])=>{
   const staffTab=tab&&aeCanRead()&&auth.user?.role!=='it_viewer';
   const attr=staffTab?'data-tab="'+tab+'"':(tab&&auth.user?.role==='it_viewer')?
    'data-route="dashboard"':tab&&!auth.user?'data-ae-login="student"':'data-route="'+route+'"';
   return '<button type="button" '+attr+'>'+aeEsc(label)+'</button>';
  }).join('')+
  '</div></section>').join('')+'</div>'+
 (inStaff?'<p>بعد اختيار القسم، استخدم أزرار الطباعة الخاصة بالمستند؛ كما يمكن تصدير السجلات النصية إلى Word من المصادر الإضافية.</p>':
 '<p>للحصول على كشوف الدرجات والشهادات المعتمدة، سجل دخولك ثم افتح مركز الطباعة من حسابك.</p>')+
 '</div>';
}
const aeOldStaffPanelV8=staffPanel;
staffPanel=function(){
 if(auth.section==='ae_question_bank'&&aeCanRead())return aeQuestionAdmin();
 return aeOldStaffPanelV8();
};
function aeSetChoice(id,index,isFollow){
 const map=isFollow?aeAssessment.followupChoices:aeAssessment.choices;
 map[id]=index;render();
}
const aeOldAttachV8=attach;
attach=function(){aeOldAttachV8();aeBindLearning();};
function aeBindLearning(){
 const input=document.getElementById('afaqMixerInput'),rule=document.getElementById('afaqMixerRule');
 const calculate=()=>{
  const node=document.getElementById('afaqMixerResult'),cap=document.querySelector('.afaq-mixer-caption');
  if(!node||!rule||!input)return;
  const value=Number(input.value),f=mixRules[rule.value];if(!Number.isFinite(value)||!f)return;
  mix.input=value;mix.rule=rule.value;mix.result=f.operation(value);
  node.textContent=aeN(mix.result);
  const operation=document.querySelector('.afaq-mixer-operation');if(operation)operation.textContent=f.symbol;
  const start=document.querySelector('.afaq-mixer-side .ae-math-value');if(start)start.textContent=aeN(value);
  if(cap)cap.innerHTML='المدخل <b>'+aeN(value)+'</b> → '+aeEsc(f.name)+' → المخرج <b>'+aeN(mix.result)+'</b>';
 };
 input?.addEventListener('input',calculate);
 rule?.addEventListener('change',calculate);
 document.getElementById('afaqMixerStart')?.addEventListener('click',()=>{
  calculate();const blender=document.querySelector('.afaq-mixer-blender');
  if(blender){blender.classList.remove('ae-mixing');void blender.offsetWidth;blender.classList.add('ae-mixing');
   window.setTimeout(()=>blender.classList.remove('ae-mixing'),850);}
 });
 document.querySelectorAll('[data-ae-kind]').forEach(el=>el.addEventListener('click',()=>{
  aeAssessment.type=el.dataset.aeKind;aeAssessment.key='';aeAssessment.responses={};
  render();
 }));
 document.getElementById('aeAssGrade')?.addEventListener('change',el=>{
  aeAssessment.grade=Number(el.target.value);aeAssessment.key='';render();
 });
 document.getElementById('aeBankGrade')?.addEventListener('change',el=>{aeAssessment.bankGrade=Number(el.target.value);render()});
 document.getElementById('aeBankType')?.addEventListener('change',el=>{aeAssessment.bankType=el.target.value;render()});
 document.querySelectorAll('[data-ae-start-bank]').forEach(el=>el.addEventListener('click',()=>{
  aeAssessment.grade=aeAssessment.bankGrade;aeAssessment.type=el.dataset.aeStartBank;
  aeAssessment.key='';route('adaptive');
 }));
 document.querySelectorAll('.ae-assessment-card').forEach(card=>{
  const id=card.querySelector('[data-ae-submit]')?.dataset.aeSubmit||
   card.querySelector('[data-ae-followup]')?.dataset.aeFollowup;
  if(!id)return;
  card.querySelectorAll('input[type=radio]').forEach(el=>el.addEventListener('change',()=>{
   const follow=el.name.startsWith('ae-follow-');
   aeSetChoice(id,Number(el.value),follow);
  }));
 });
 document.querySelectorAll('[data-ae-submit]').forEach(el=>el.addEventListener('click',async()=>{
  if(aeAssessment.busy)return;const id=el.dataset.aeSubmit;
  const selected=aeAssessment.choices[id];if(selected===undefined)return;
  aeAssessment.busy=true;el.disabled=true;
  try{
   const x=await aeApi('practice_answer',{id,selected_index:selected},true);
   aeAssessment.responses[id]=x;render();
  }catch(err){aeAssessment.error=err.message;window.alert(err.message)}
  finally{aeAssessment.busy=false}
 }));
 document.querySelectorAll('[data-ae-followup]').forEach(el=>el.addEventListener('click',async()=>{
  if(aeAssessment.busy)return;const id=el.dataset.aeFollowup,
   index=aeAssessment.followupChoices[id],result=aeAssessment.responses[id];
  if(index===undefined||!result)return;
  aeAssessment.busy=true;el.disabled=true;
  try{
   const x=await aeApi('followup_answer',{question_id:id,selected_index:index,
    attempt_id:result.attempt_id||null,track:result.track},true);
   aeAssessment.followupResponses[id]=x;render();
  }catch(err){window.alert(err.message)}
  finally{aeAssessment.busy=false}
 }));
 document.getElementById('aeAdminGrade')?.addEventListener('change',el=>{
  aeAssessment.adminGrade=Number(el.target.value);aeAssessment.adminKey='';render();
 });
 document.getElementById('aeAdminType')?.addEventListener('change',el=>{
  aeAssessment.adminType=el.target.value;aeAssessment.adminKey='';render();
 });
 document.querySelectorAll('[data-ae-question-edit]').forEach(el=>el.addEventListener('click',()=>{
  aeAssessment.editing=el.dataset.aeQuestionEdit;render();
 }));
 document.querySelectorAll('[data-ae-question-archive]').forEach(el=>el.addEventListener('click',async()=>{
  if(!aeCanManage()||!window.confirm('إخفاء السؤال من واجهة الطالب؟'))return;
  try{await aeApi('question_archive',{id:el.dataset.aeQuestionArchive},true);
   aeAssessment.adminKey='';await aeLoadAdminQuestions(true)}
  catch(err){window.alert(err.message)}
 }));
 document.getElementById('aeQuestionEditor')?.addEventListener('submit',async ev=>{
  ev.preventDefault();if(!aeCanManage())return;
  const form=ev.currentTarget,fields=Object.fromEntries(new FormData(form));
  const arr=key=>String(fields[key]||'').split('\n').map(x=>x.trim()).filter(Boolean);
  const index=key=>Number(fields[key])-1;
  const payload={...fields,grade:Number(fields.grade),choices:arr('choices'),
   remedial_choices:arr('remedial_choices'),enrichment_choices:arr('enrichment_choices'),
   correct_index:index('correct_index'),remedial_correct_index:index('remedial_correct_index'),
   enrichment_correct_index:index('enrichment_correct_index'),
   published:form.querySelector('[name=published]').checked};
  try{await aeApi('question_save',payload,true);aeAssessment.editing=null;
   aeAssessment.adminKey='';await aeLoadAdminQuestions(true);
  }catch(err){window.alert(err.message)}
 });
 document.querySelectorAll('[data-ae-open-awards]').forEach(el=>el.addEventListener('click',()=>{
  if(aeCanRead()){auth.section='a_awards';route('dashboard');}
  else if(typeof selectEntryGate==='function')selectEntryGate('student');
 }));
 document.querySelectorAll('[data-ae-login]').forEach(el=>el.addEventListener('click',()=>{
  if(typeof selectEntryGate==='function')selectEntryGate(el.dataset.aeLogin||'student');
 }));
}
