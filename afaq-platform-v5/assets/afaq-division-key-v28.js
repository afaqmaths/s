/* Afaq Math — مفتاح القسمة: fully interactive, permission-preserving long division.
   Loaded after the existing protected initiative layer; no access policy changes. */
'use strict';
const dk28={
 dividend:325,divisor:4,places:8,guess:null,started:false,index:-1,mode:'pending',
 showAll:false,multiply:false,calculator:false,error:''
};
const dk28Esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dk28Num=x=>new Intl.NumberFormat('ar-OM',{useGrouping:false,maximumFractionDigits:12}).format(Number(x));
const dk28Digit=x=>String(x??'').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
const dk28Places=['الآحاد','العشرات','المئات','الآلاف','عشرات الآلاف','مئات الآلاف'];
const dk28Examples=[
 [325,4,'٣٢٥ ÷ ٤ • الفاصلة العشرية'],
 [372,4,'٣٧٢ ÷ ٤ • بدون باقٍ'],
 [125,8,'١٢٥ ÷ ٨ • الأعشار والمئات والألوف'],
 [217,6,'٢١٧ ÷ ٦ • عدد عشري دوري'],
 [105,5,'١٠٥ ÷ ٥ • الصفر في الخارج'],
 [864,7,'٨٦٤ ÷ ٧ • القسمة مع الباقي']
];
function dk28Build(n,d,limit=8){
 if(!Number.isInteger(n)||n<0||n>999999||!Number.isInteger(d)||d<1||d>9||
    !Number.isInteger(limit)||limit<1||limit>12)throw Error('أدخل مقسومًا صحيحًا من ٠ إلى ٩٩٩٩٩٩، ومقسومًا عليه من ١ إلى ٩، وخانات عشرية من ١ إلى ١٢.');
 const digits=String(n).split('').map(Number),groups=[],integerFrames=[],decimalFrames=[];
 let rem=0,wholeDigits='',decimalDigits='',keyShown=false;
 const makeFrame=(group,action,title,description)=>({
  group,action,title,description,whole:wholeDigits.replace(/^0+(?=\d)/,'')||'0',
  decimal:decimalDigits,keyShown,remainder:rem
 });
 for(let i=0;i<digits.length;i++){
  const incoming=digits[i],before=rem,part=before*10+incoming,q=Math.floor(part/d),
   product=q*d,after=part-product,place=dk28Places[digits.length-i-1]||'المنزلة';
  const group={index:i,type:'integer',place,digit:incoming,before,part,q,product,after};
  groups.push(group);
  if(i>0)integerFrames.push(makeFrame(i,'bring','أنزل رقم '+place,
   'أنزل الرقم '+dk28Num(incoming)+' من منزلة '+place+' إلى يمين الباقي '+dk28Num(before)+'؛ فيصبح العدد '+dk28Num(part)+'.'));
  integerFrames.push(makeFrame(i,'divide','١ • أقسم','أقسم '+dk28Num(part)+' على '+dk28Num(d)+'؛ العدد الصحيح هو '+dk28Num(q)+'.'+(i===0&&q===0&&digits.length>1?' لا أكتب الصفر في بداية خارج القسمة، لكنني أحفظ منزلته.':'')));
  wholeDigits+=String(q);
  integerFrames.push(makeFrame(i,'write','٢ • أكتب',(i===0&&q===0&&digits.length>1?'أضع الصفر مؤقتًا فوق منزلة '+place+' لفهم القسمة، ولا أكتبه في بداية خارج القسمة.':'أكتب '+dk28Num(q)+' في خارج القسمة، فوق منزلة '+place+'.')));
  integerFrames.push(makeFrame(i,'multiply','٣ • أضرب','أضرب '+dk28Num(q)+' × '+dk28Num(d)+' = '+dk28Num(product)+'.'));
  rem=after;
  integerFrames.push(makeFrame(i,'subtract','٤ • أطرح','أطرح '+dk28Num(part)+' − '+dk28Num(product)+' = '+dk28Num(after)+'.'+(i<digits.length-1?' الآن أستعد لإنزال المنزلة التالية.':' انتهت منازل المقسوم.')));
 }
 const whole=wholeDigits.replace(/^0+(?=\d)/,'')||'0',intRemainder=rem;
 let decimalRemainder=rem,cycleFrom=-1,reason=rem?'limit':'finished';
 if(rem){
  keyShown=true;
  decimalFrames.push(makeFrame(groups.length,'key','🔑 أفتح مفتاح الفاصلة العشرية',
   'بقي '+dk28Num(rem)+' بعد إنزال جميع منازل المقسوم. أضع الفاصلة العشرية في خارج القسمة، وأُضيف صفرًا إلى يمين الباقي للانتقال إلى الأعشار.'));
  const seen=new Map();
  for(let i=0;i<limit&&decimalRemainder!==0;i++){
   if(seen.has(decimalRemainder)){cycleFrom=seen.get(decimalRemainder);reason='repeating';break}
   seen.set(decimalRemainder,i);
   const before=decimalRemainder,part=before*10,q=Math.floor(part/d),product=q*d,
     after=part-product,place=i===0?'الأعشار':i===1?'الأجزاء من مئة':i===2?'الأجزاء من ألف':'الخانة العشرية '+dk28Num(i+1),
     groupIndex=digits.length+i;
   groups.push({index:groupIndex,type:'decimal',place,digit:0,before,part,q,product,after});
   decimalFrames.push(makeFrame(groupIndex,'bring','أنزل صفرًا','أضيف صفرًا إلى يمين الباقي '+dk28Num(before)+'؛ فيصبح '+dk28Num(part)+' وأبدأ منزلة '+place+'.'));
   decimalFrames.push(makeFrame(groupIndex,'divide','١ • أقسم','أقسم '+dk28Num(part)+' على '+dk28Num(d)+'؛ خارج القسمة في هذه المنزلة '+dk28Num(q)+'.'));
   decimalDigits+=String(q);
   decimalFrames.push(makeFrame(groupIndex,'write','٢ • أكتب','أكتب الرقم '+dk28Num(q)+' بعد الفاصلة في منزلة '+place+'.'));
   decimalFrames.push(makeFrame(groupIndex,'multiply','٣ • أضرب','أضرب '+dk28Num(q)+' × '+dk28Num(d)+' = '+dk28Num(product)+'.'));
   decimalRemainder=after;
   decimalFrames.push(makeFrame(groupIndex,'subtract','٤ • أطرح','أطرح '+dk28Num(part)+' − '+dk28Num(product)+' = '+dk28Num(after)+'.'));
  }
  if(decimalRemainder===0)reason='finished';
  else if(cycleFrom<0)reason='precision';
 }
 return {n,d,limit,digits,groups,integerFrames,decimalFrames,whole,intRemainder,
  decimalDigits,decimalRemainder,reason,cycleFrom,exact:n%d===0};
}
function dk28Current(model){
 const frames=dk28.mode==='decimal'?model.integerFrames.concat(model.decimalFrames):model.integerFrames;
 const index=Math.max(-1,Math.min(dk28.index,frames.length-1));
 return {frames,index,frame:index<0?null:frames[index],integerEnd:model.integerFrames.length-1,
  atIntegerEnd:index>=model.integerFrames.length-1,finished:index===frames.length-1};
}
function dk28ShownQuotient(model,ctx){
 const frame=ctx.frame,whole=frame?.whole||'—';
 if(!frame)return '—';
 if(!frame.keyShown)return whole;
 const dec=frame.decimal;
 if(ctx.finished&&dk28.mode==='decimal'&&model.reason==='repeating'){
  const start=model.cycleFrom;
  return model.whole+'٫'+model.decimalDigits.slice(0,start)+'('+model.decimalDigits.slice(start)+')';
 }
 return whole+'٫'+dec+(ctx.finished&&dk28.mode==='decimal'&&model.reason==='precision'?'…':'');
}
function dk28PlaceCards(model,ctx){
 return '<div class="dk28-parts-grid">'+model.groups.filter(g=>g.type==='integer'||dk28.mode==='decimal').map(group=>{
  const steps=ctx.frames.map((f,i)=>({...f,at:i})).filter(f=>f.group===group.index);
  if(!steps.length)return '';
  const last=steps[steps.length-1].at,started=ctx.index>=steps[0].at;
  const complete=ctx.index>=last;
  const visible=dk28.showAll||started;
  const has=kind=>visible&&(dk28.showAll||steps.some(f=>f.action===kind&&ctx.index>=f.at));
  const cell=(kind,value,label)=>'<div class="dk28-mini-op '+(has(kind)?'shown':'hidden')+
   (ctx.frame?.group===group.index&&ctx.frame.action===kind?' current':'')+'">'+
   '<span>'+label+'</span><strong dir="ltr">'+(has(kind)?dk28Num(value):'؟')+'</strong></div>';
  const divText=group.part+' ÷ '+model.d+' = '+group.q;
  const multText=group.q+' × '+model.d+' = '+group.product;
  const subText=group.part+' − '+group.product+' = '+group.after;
  return '<article class="dk28-part '+(complete?'complete ':started?'in-progress ':'')+
    (group.type==='decimal'?'decimal':'')+'"><header><span>'+(group.type==='decimal'?'المرحلة العشرية':'المرحلة')+
    ' '+dk28Num(group.index+1)+'</span><strong>'+group.place+'</strong></header>'+
    '<div class="dk28-part-digits" dir="ltr"><span>'+dk28Num(group.part)+'</span><em>÷</em><span>'+dk28Num(model.d)+'</span></div>'+
    '<div class="dk28-mini-ops">'+cell('divide',divText,'١ أقسم')+
    cell('write',group.q,'٢ أكتب')+cell('multiply',multText,'٣ أضرب')+
    cell('subtract',subText,'٤ أطرح')+'</div>'+
    (complete?'<small class="dk28-complete">✓ اكتملت خطوات هذه المنزلة</small>':'')+
    '</article>';
 }).join('')+'</div>';
}
function dk28Verify(model,ctx){
 if(!dk28.started||!ctx.atIntegerEnd)return '';
 const decimalMode=dk28.mode==='decimal',completed=ctx.finished,stopped=dk28.mode==='stop';
 if(!completed&&!stopped)return '';
 const whole=model.whole,rem=decimalMode?model.decimalRemainder:model.intRemainder,
  digits=decimalMode?model.decimalDigits:'',k=digits.length,scaled=10n**BigInt(k);
 const scaledQuotient=BigInt(whole)*scaled+BigInt(digits||0);
 const left=scaledQuotient*BigInt(model.d)+BigInt(rem),right=BigInt(model.n)*scaled;
 const proof=left===right;
 const multiplySentence=decimalMode?
   'التحقق الدقيق: ('+dk28Num(model.whole)+(digits?'٫'+digits:'')+') × '+dk28Num(model.d)+
   ' + '+dk28Num(rem)+' / ١٠^'+dk28Num(k)+' = '+dk28Num(model.n):
   dk28Num(model.d)+' × '+dk28Num(whole)+' + '+dk28Num(rem)+' = '+dk28Num(model.n);
 const calculate=new Intl.NumberFormat('ar-OM',{maximumFractionDigits:11}).format(model.n/model.d);
 const qShow=decimalMode?(model.whole+(digits?'٫'+digits:'')):(whole+' والباقي '+dk28Num(rem));
 return '<section class="dk28-verify"><div class="dk28-section-heading"><span>✓</span><div><h2>التحقق بطريقتين مستقلتين</h2>'+
  '<p>لا نعتمد على مجرد نقل الناتج؛ نراجع بالضرب ونقارن بنتيجة الحاسبة.</p></div></div>'+
  '<div class="dk28-verify-grid"><div class="dk28-verify-card"><h3>✖️ أولًا: التحقق بعملية الضرب</h3>'+
  '<button type="button" data-dk28-check="multiply">'+(dk28.multiply?'إخفاء خطوات التحقق':'أظهر التحقق بالضرب')+'</button>'+
  (dk28.multiply?'<div class="dk28-verify-result"><strong dir="ltr">'+dk28Esc(multiplySentence)+'</strong>'+
    '<p>'+(proof?'✔ صحيح: عاد الناتج إلى المقسوم الأصلي.':'راجع الحساب: يوجد اختلاف في الناتج.')+
    (decimalMode&&rem?' الباقي هنا جزء من '+dk28Num(scaled)+'، فلا يجوز حذفه عند التحقق الدقيق.':'')+'</p></div>':'')+
  '</div><div class="dk28-verify-card"><h3>🧮 ثانيًا: التحقق بالحاسبة</h3>'+
  '<button type="button" data-dk28-check="calculator">'+(dk28.calculator?'إخفاء نتيجة الحاسبة':'شغّل الحاسبة الآن')+'</button>'+
  (dk28.calculator?'<div class="dk28-verify-result"><div class="dk28-calculator" dir="ltr">'+
  dk28Num(model.n)+' ÷ '+dk28Num(model.d)+' = <b>'+calculate+'</b></div>'+
  '<p>ناتج المبادرة: '+dk28Esc(qShow)+
  (decimalMode&&model.reason!=='finished'?' — الجزء العشري المعروض تقريب أو عدد دوري، وليس عددًا عشريًا منتهيًا.':'')+
  '</p></div>':'')+'</div></div></section>';
}
function dk28Page(){
 let model;try{model=dk28Build(dk28.dividend,dk28.divisor,dk28.places)}catch(err){
  return '<div class="container dk28-page" dir="rtl"><p class="dk28-error">'+dk28Esc(err.message)+'</p></div>';
 }
 const ctx=dk28Current(model);
 const answerCorrect=dk28.guess!==null&&dk28.guess===model.exact;
 const showDecision=dk28.started&&ctx.atIntegerEnd&&model.intRemainder>0;
 const isEnd=dk28.started&&ctx.finished&&(!model.intRemainder||dk28.mode==='stop'||dk28.mode==='decimal');
 const groupIndex=ctx.frame?.group??0;
 const phase=ctx.frame?.title||'استعد لبدء أول منزلة';
 const total=ctx.frames.length;
 const progress=total?Math.round((ctx.index+1)*100/total):0;
 const actionLabel=ctx.index<0?'ابدأ من منزلة '+(dk28Places[model.digits.length-1]||'أعلى منزلة'):phase;
 const digits=model.digits.map((d,i)=>'<span class="dk28-digit '+(ctx.frame?.group===i?'active':'')+'">'+dk28Num(d)+'</span>').join('');
 const quo=dk28ShownQuotient(model,ctx);
 const status=dk28.started?(ctx.frame?.description||'نستعد لبدء حل القسمة، ونتقدم حسب ترتيب منازل المقسوم.'):
   'قبل أن نبدأ القسمة، أجب عن السؤال: هل ستنتهي القسمة دون باقٍ؟';
 const decisions=showDecision?'<section class="dk28-decision"><div class="dk28-decision-icon">🔑</div>'+
  '<div><h3>انتهت منازل المقسوم، وبقي '+dk28Num(model.intRemainder)+'</h3>'+
  '<p>أمامك خياران صحيحان: التوقف عند الباقي، أو فتح «مفتاح الفاصلة العشرية» وإضافة الصفر إلى يمين الباقي.</p>'+
  '<div class="dk28-decision-actions"><button type="button" data-dk28-mode="stop" class="'+(dk28.mode==='stop'?'selected':'')+'">⏹ أكتفي بالباقي</button>'+
  '<button type="button" data-dk28-mode="decimal" class="'+(dk28.mode==='decimal'?'selected':'')+'">🔑 أفتح المفتاح وأكمل عشريًا</button></div></div></section>':'';
 const endMessage=isEnd?(!model.intRemainder?'✅ انتهت القسمة دون باقٍ.':
   dk28.mode==='stop'?'✅ انتهينا عند خارج القسمة '+dk28Num(model.whole)+' والباقي '+dk28Num(model.intRemainder)+'.':
   model.reason==='repeating'?'🔁 ظهر عدد عشري دوري؛ الجزء بين القوسين يتكرر إلى ما لا نهاية.':
   model.reason==='precision'?'🔎 توقف العرض عند '+dk28Num(model.limit)+' خانات عشرية؛ ما زال هناك باقٍ، ولا يجوز اعتباره صفرًا.':
   '✅ انتهت القسمة العشرية، وأصبح الباقي صفرًا.'):'';
 return '<div class="container dk28-page" dir="rtl">'+
 '<header class="dk28-hero"><div class="dk28-hero-key">🔑</div><div><span>مبادرات الأستاذ سعيد البريكي • معمل الرياضيات التفاعلي</span>'+
 '<h1>مفتاح القسمة المطوّلة</h1>'+
 '<p>أفكّر أولًا، ثم أقسم وأكتب وأضرب وأطرح، وأنزل المنزلة التالية. وعند وجود باقٍ أختار بين التوقف أو استخدام مفتاح الفاصلة العشرية.</p>'+
 '</div><div class="dk28-hero-symbol"><b>÷</b><small>🔑</small></div></header>'+
 '<section class="dk28-start"><div class="dk28-start-head"><div><h2>اختر مسألة القسمة</h2><p>يمكنك اختيار مثال أو إدخال أعداد جديدة.</p></div>'+
 '<button type="button" id="dk28Restart" class="dk28-reset">↺ إعادة البدء</button></div>'+
 '<div class="dk28-presets">'+dk28Examples.map(([n,d,label])=>'<button type="button" data-dk28-example="'+n+'-'+d+'" '+
   (n===dk28.dividend&&d===dk28.divisor?'class="active"':'')+'>'+label+'</button>').join('')+'</div>'+
 '<form id="dk28Form" class="dk28-form">'+
 '<label>المقسوم<input name="n" inputmode="numeric" pattern="[0-9٠-٩۰-۹]*" value="'+dk28Esc(dk28.dividend)+'" required></label>'+
 '<label>المقسوم عليه (١–٩)<input name="d" inputmode="numeric" pattern="[0-9٠-٩۰-۹]*" value="'+dk28Esc(dk28.divisor)+'" required></label>'+
 '<label>عدد الخانات العشرية عند الحاجة<select name="places">'+[2,4,6,8,10,12].map(n=>'<option value="'+n+'"'+(dk28.places===n?' selected':'')+'>'+dk28Num(n)+' خانات</option>').join('')+'</select></label>'+
 '<button type="submit">تجهيز مسألة جديدة</button></form>'+
 (dk28.error?'<p class="dk28-error" role="alert">'+dk28Esc(dk28.error)+'</p>':'')+'</section>'+
 '<section class="dk28-question"><div class="dk28-question-icon">؟</div><div><span class="dk28-kicker">السؤال أولًا • فكّر قبل إجراء القسمة</span>'+
 '<h2>هل '+dk28Num(model.n)+' يقبل القسمة على '+dk28Num(model.d)+' <u>دون باقٍ</u>؟</h2>'+
 '<div class="dk28-answer-actions"><button type="button" data-dk28-guess="yes" class="'+(dk28.guess===true?'chosen':'')+'">نعم، يقبل دون باقٍ</button>'+
 '<button type="button" data-dk28-guess="no" class="'+(dk28.guess===false?'chosen':'')+'">لا، سيظهر باقٍ</button></div>'+
 (dk28.guess!==null?'<p class="dk28-feedback '+(answerCorrect?'correct':'think')+'">'+
 (answerCorrect?'✅ إجابة صحيحة! ':'💡 إجابة تحتاج إلى مراجعة: ')+
 (model.exact?'القسمة تامة، والباقي صفر.':'القسمة غير تامة بالأعداد الصحيحة؛ سيظهر باقٍ، ويمكن متابعة الناتج العشري.')+
 ' يمكنك الآن تنفيذ خطوات القسمة.</p>':'<p class="dk28-waiting">اختر إحدى الإجابتين لتفعيل الحل خطوة بخطوة.</p>')+
 (!dk28.started?'<button type="button" class="dk28-start-btn" id="dk28Begin" '+(dk28.guess===null?'disabled':'')+'>🚀 ابدأ خطوات القسمة</button>':'')+
 '</div></section>'+
 (dk28.started?'<section class="dk28-workspace"><div class="dk28-live">'+
 '<div class="dk28-section-heading"><span>١</span><div><h2>لوحة القسمة المطوّلة</h2><p>شاهد خارج القسمة يتكون رقمًا بعد رقم.</p></div></div>'+
 '<div class="dk28-bracket-panel"><div class="dk28-quotient-label">خارج القسمة حتى الآن</div>'+
 '<div class="dk28-top-answer" dir="ltr">'+dk28Esc(quo)+'</div>'+ (ctx.frame?.keyShown?'<div class="dk28-key-open" role="status">🔑 فُتح مفتاح الفاصلة العشرية</div>':'')+
 '<div class="dk28-bracket" dir="ltr"><b>'+dk28Num(model.d)+'</b><div>'+digits+'</div></div>'+
 '<div class="dk28-bracket-legend">المقسوم عليه <span>✦</span> المقسوم حسب المنازل</div>'+
 '<div class="dk28-live-remainder">الباقي عند هذه الخطوة <strong>'+dk28Num(ctx.frame?.remainder??0)+'</strong></div></div>'+
 '<div class="dk28-action-box"><span class="dk28-action-chip">'+dk28Esc(actionLabel)+'</span>'+
 '<p aria-live="polite">'+dk28Esc(status)+'</p></div>'+
 '</div><div class="dk28-track"><div class="dk28-section-heading"><span>٢</span><div><h2>الخطوة التالية أو السابقة</h2>'+
 '<p>الانتقال محفوظ في التسلسل الصحيح، ويمكن الرجوع في أي لحظة.</p></div></div>'+
 '<div class="dk28-progress-line"><div role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+progress+'" style="width:'+progress+'%"></div></div>'+
 '<div class="dk28-progress-numbers">الخطوة '+dk28Num(Math.max(0,ctx.index+1))+' من '+dk28Num(total)+' • '+dk28Num(progress)+'٪</div>'+
 '<div class="dk28-stage-now"><div class="dk28-step-flag">'+(ctx.frame?.action==='key'?'🔑':'✍️')+'</div>'+
 '<h3>'+dk28Esc(ctx.frame?.title||'جاهز للحل')+'</h3><p>'+dk28Esc(status)+'</p></div>'+
 '<div class="dk28-controls"><button type="button" id="dk28Prev" '+(ctx.index<0?'disabled':'')+'>→ السابق</button>'+
 '<button type="button" id="dk28Next" '+(ctx.finished?'disabled':'')+'>التالي ←</button>'+
 '<button type="button" id="dk28All">'+(dk28.showAll?'إخفاء الخطوات المقبلة':'عرض جميع خطوات الحل')+'</button></div>'+
 (isEnd?'<p class="dk28-finish">'+dk28Esc(endMessage)+'</p>':'')+
 '</div></section>'+
 decisions+
 '<section class="dk28-stages"><div class="dk28-section-heading"><span>٣</span><div><h2>عمليات القسمة بحسب المنازل</h2>'+
 '<p>لكل منزلة: أقسم ← أكتب ← أضرب ← أطرح؛ وقبل المنزلة التالية أنزل الرقم.</p></div></div>'+
 dk28PlaceCards(model,ctx)+'</section>'+
 dk28Verify(model,ctx)+
 '<footer class="dk28-footer"><strong>مبادرة «مفتاح القسمة» — الأستاذ سعيد جمعة عبدالله البريكي</strong>'+
 '<p>الفاصلة العشرية لا تُغيّر قيمة المسألة؛ وإنما تسمح باستكمال القسمة بانتقال صحيح إلى المنازل العشرية.</p></footer>':'')+
 '</div>';
}
function dk28Reset(n=dk28.dividend,d=dk28.divisor,places=dk28.places){
 Object.assign(dk28,{dividend:n,divisor:d,places,guess:null,started:false,index:-1,mode:'pending',
  showAll:false,multiply:false,calculator:false,error:''});
}
function dk28Go(delta){
 const model=dk28Build(dk28.dividend,dk28.divisor,dk28.places),ctx=dk28Current(model);
 if(!dk28.started)return;
 dk28.index=Math.max(-1,Math.min(ctx.frames.length-1,ctx.index+delta));
 render();
}
// Preserve the original permission gate and backend view-check. Only substitute the
// protected page after the existing service has confirmed that viewing is allowed.
const dk28PreviousSection=genericSection;
genericSection=function(page){
 const pageHtml=dk28PreviousSection(page);
 if(page!=='division_key'||typeof iaState==='undefined'||iaState.page!==page||!iaState.html||iaState.blocked)return pageHtml;
 return dk28Page();
};
const dk28PreviousAttach=attach;
attach=function(){
 dk28PreviousAttach();
 if(state.page!=='division_key'||typeof iaState==='undefined'||iaState.page!=='division_key'||!iaState.html||iaState.blocked)return;
 document.querySelectorAll('[data-dk28-example]').forEach(button=>button.addEventListener('click',()=>{
  const [n,d]=button.dataset.dk28Example.split('-').map(Number);dk28Reset(n,d);render();
 }));
 document.getElementById('dk28Form')?.addEventListener('submit',event=>{
  event.preventDefault();
  const form=event.currentTarget,nText=dk28Digit(form.elements.n.value),dText=dk28Digit(form.elements.d.value);
  const n=Number(nText),d=Number(dText),places=Number(form.elements.places.value);
  if(!/^\d+$/.test(nText)||!/^\d+$/.test(dText)||!Number.isInteger(n)||n<0||n>999999||!Number.isInteger(d)||d<1||d>9){
   dk28.error='أدخل مقسومًا صحيحًا بين ٠ و٩٩٩٩٩٩، ومقسومًا عليه من ١ إلى ٩.';render();return;
  }
  dk28Reset(n,d,places);render();
 });
 document.getElementById('dk28Restart')?.addEventListener('click',()=>{dk28Reset();render()});
 document.querySelectorAll('[data-dk28-guess]').forEach(button=>button.addEventListener('click',()=>{
  if(dk28.started)return;
  dk28.guess=button.dataset.dk28Guess==='yes';render();
 }));
 document.getElementById('dk28Begin')?.addEventListener('click',()=>{
  if(dk28.guess===null)return;dk28.started=true;dk28.index=-1;render();
 });
 document.getElementById('dk28Prev')?.addEventListener('click',()=>dk28Go(-1));
 document.getElementById('dk28Next')?.addEventListener('click',()=>dk28Go(1));
 document.getElementById('dk28All')?.addEventListener('click',()=>{dk28.showAll=!dk28.showAll;render()});
 document.querySelectorAll('[data-dk28-mode]').forEach(button=>button.addEventListener('click',()=>{
  dk28.mode=button.dataset.dk28Mode==='decimal'?'decimal':'stop';
  dk28.index=dk28Build(dk28.dividend,dk28.divisor,dk28.places).integerFrames.length-1;
  dk28.showAll=false;dk28.multiply=false;dk28.calculator=false;render();
 }));
 document.querySelectorAll('[data-dk28-check]').forEach(button=>button.addEventListener('click',()=>{
  const key=button.dataset.dk28Check;
  if(key==='multiply'||key==='calculator'){dk28[key]=!dk28[key];render()}
 }));
};
