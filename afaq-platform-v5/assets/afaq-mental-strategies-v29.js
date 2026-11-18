/* Afaq Math — protected mental multiplication, addition and subtraction labs.
   All computations are deterministic and local; no student identifiers or scores saved. */
'use strict';
const mm29Config={
 mul:{a:24,b:6,method:'split',question:'الضرب الذهني',symbol:'×',theme:'violet'},
 add:{a:398,b:47,method:'comp',question:'الجمع الذهني',symbol:'+',theme:'teal'},
 sub:{a:403,b:198,method:'comp',question:'الطرح الذهني',symbol:'−',theme:'amber'}
};
const mm29={
 operation:'mul',states:{
  mul:{...mm29Config.mul,guess:'',checked:false,started:false,step:-1,showAll:false,showInverse:false,showCalculator:false,error:''},
  add:{...mm29Config.add,guess:'',checked:false,started:false,step:-1,showAll:false,showInverse:false,showCalculator:false,error:''},
  sub:{...mm29Config.sub,guess:'',checked:false,started:false,step:-1,showAll:false,showInverse:false,showCalculator:false,error:''}
 }
};
const mm29Esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mm29Digits=s=>String(s??'').replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace(/[۰-۹]/g,c=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(c));
const mm29Num=n=>new Intl.NumberFormat('ar-OM',{useGrouping:false,maximumFractionDigits:0}).format(Number(n));
const mm29Props=[
 {code:'mul',title:'مختبر الضرب الذهني',label:'استراتيجيات ذهنية للضرب',icon:'✖️',caption:'تفكيك • توزيع • تعويض • مضاعفة وتنصيف'},
 {code:'add',title:'مختبر الجمع الذهني',label:'استراتيجيات ذهنية للجمع',icon:'➕',caption:'تكملة العشرة • تعويض • القيمة المكانية'},
 {code:'sub',title:'مختبر الطرح الذهني',label:'استراتيجيات ذهنية للطرح',icon:'➖',caption:'التعويض • ثبات الفرق • العد التصاعدي'}
];
const mm29Methods={
 mul:[['split','خاصية التوزيع','تفكيك أحد العددين إلى منازل ثم جمع النواتج الجزئية'],
      ['near','الضرب في عدد قريب','استبدال العامل بعدد سهل ثم تعويض الفرق'],
      ['double','المضاعفة والتنصيف','نصف أحد العاملين وضاعف الآخر دون تغيير الناتج'],
      ['five','مفتاح ×٥ أو ×٢٥','الضرب في ١٠ أو ١٠٠ ثم القسمة المناسبة']],
 add:[['comp','التعويض والتقريب','أقرب أحد العددين إلى عشرة أو مئة ثم أعوض الزيادة'],
      ['place','القيمة المكانية','أجمع الآلاف والمئات والعشرات والآحاد'],
      ['make10','تكوين العشرة التالية','أنقل جزءًا من أحد العددين لتكوين عشرة كاملة'],
      ['jumps','القفزات الذهنية','أضيف المئات ثم العشرات ثم الآحاد']],
 sub:[['comp','التعويض والتقريب','أطرح عددًا مستديرًا ثم أعوض الفرق'],
      ['same','ثبات الفرق','أزيد أو أنقص العددين بالمقدار نفسه'],
      ['jumps','العد التصاعدي','أحسب الفرق بالقفز من المطروح إلى المطروح منه'],
      ['place','طرح القيم المكانية','أطرح المئات والعشرات والآحاد بالتتابع']]
};
const mm29Samples={
 mul:[[24,6,'٢٤ × ٦'],[16,25,'١٦ × ٢٥'],[27,9,'٢٧ × ٩'],[48,5,'٤٨ × ٥'],[32,14,'٣٢ × ١٤']],
 add:[[398,47,'٣٩٨ + ٤٧'],[58,27,'٥٨ + ٢٧'],[256,137,'٢٥٦ + ١٣٧'],[79,36,'٧٩ + ٣٦'],[1250,875,'١٢٥٠ + ٨٧٥']],
 sub:[[403,198,'٤٠٣ − ١٩٨'],[83,29,'٨٣ − ٢٩'],[532,278,'٥٣٢ − ٢٧٨'],[752,324,'٧٥٢ − ٣٢٤'],[1000,375,'١٠٠٠ − ٣٧٥']]
};
const mm29M=(a,s,b)=>mm29Num(a)+' '+s+' '+mm29Num(b);
function mm29Reset(op,a,b,method){
 const previous=mm29.states[op];
 const chosen=method||previous.method;
 const valid=mm29Compatible(op,a,b,chosen)?chosen:op==='mul'?'split':op==='add'?'place':'comp';
 mm29.states[op]={...previous,a,b,method:valid,guess:'',checked:false,started:false,step:-1,
  showAll:false,showInverse:false,showCalculator:false,error:''};
}
function mm29Round(number){
 const n=Number(number);
 if(n===0||n%10===0)return {target:n,delta:0,unit:10};
 const candidates=[10,100,1000].flatMap(unit=>{
  const lower=Math.floor(n/unit)*unit,upper=lower+unit;
  return [{target:lower,delta:lower-n,unit},{target:upper,delta:upper-n,unit}];
 }).filter(x=>x.target>0&&x.target!==n);
 candidates.sort((a,b)=>Math.abs(a.delta)-Math.abs(b.delta)||b.unit-a.unit);
 return candidates[0]||{target:n,delta:0,unit:10};
}
function mm29Parts(value){
 let rem=value;const parts=[];
 for(const unit of [10000,1000,100,10,1]){
  const count=Math.floor(rem/unit);
  if(count){parts.push(count*unit);rem-=count*unit}
 }
 return parts.length?parts:[0];
}
function mm29Compatible(op,a,b,code){
 if(op==='mul'&&code==='double')return a>0&&b>0&&(a%2===0||b%2===0);
 if(op==='mul'&&code==='five')return [5,25,50].includes(a)||[5,25,50].includes(b);
 if(op==='add'&&code==='make10'){
  const aa=(10-a%10)%10,bb=(10-b%10)%10;
  return (aa>0&&b>=aa)||(bb>0&&a>=bb);
 }
 return true;
}
const mm29Step=(heading,formula,explain)=>({heading,formula,explain});
function mm29Build(op,a,b,selected){
 if(!['mul','add','sub'].includes(op)||!Number.isSafeInteger(a)||!Number.isSafeInteger(b)||a<0||b<0||
  a>99999||b>99999||(op==='mul'&&(a>9999||b>9999))||(op==='sub'&&a<b))
  throw Error(op==='sub'?'في الطرح أدخل عددين صحيحين غير سالبين بحيث لا يقل المطروح منه عن المطروح.':'أدخل عددين صحيحين غير سالبين ضمن المجال المسموح.');
 const result=op==='mul'?a*b:op==='add'?a+b:a-b;
 if(!Number.isSafeInteger(result))throw Error('الناتج خارج المجال العددي الآمن.');
 const selectedAvailable=mm29Compatible(op,a,b,selected);
 const method=mm29Methods[op].some(x=>x[0]===selected)&&selectedAvailable?selected:op==='mul'?'split':op==='add'?'place':'comp';
 const steps=[],add=(title,formula,explain)=>steps.push(mm29Step(title,formula,explain));
 const sign=op==='mul'?'×':op==='add'?'+':'−';
 const estimate=x=>Math.round(x/10)*10;
 add('أقدّر الناتج أولًا',mm29M(estimate(a),sign,estimate(b)),
  'أقرّب العددين إلى أقرب عشرة لأتوقع حجم الناتج، ثم أبحث عن الطريقة الأسهل للحساب الدقيق.');
 if(op==='mul'){
  if(method==='split'){
   const chosen=b>=10?b:a,other=b>=10?a:b;
   const parts=mm29Parts(chosen);
   add('أفكك إلى قيم مكانية',mm29Num(chosen)+' = '+parts.map(mm29Num).join(' + '),
    'استعمل خاصية التوزيع: أضرب كل جزء في العامل الآخر ثم أجمع النواتج الجزئية.');
   let running=0;
   parts.forEach((part,i)=>{const partial=part*other;running+=partial;
    add('أضرب الجزء '+mm29Num(i+1),mm29M(part,'×',other)+' = '+mm29Num(partial),
     'أحسب حاصل ضرب '+mm29Num(part)+' في '+mm29Num(other)+' ثم أضيفه إلى مجموع النواتج الجزئية: '+mm29Num(running)+'.');
   });
   add('أجمع النواتج الجزئية',parts.map(p=>mm29Num(p*other)).join(' + ')+' = '+mm29Num(result),
     'لأن '+mm29Num(other)+' × ('+parts.map(mm29Num).join(' + ')+') يساوي المجموع الأصلي.');
  }else if(method==='near'){
   const choice=mm29Round(b),base=choice.target,delta=base-b;
   add('أبحث عن عامل أقرب لعدد سهل',mm29Num(b)+' = '+mm29Num(base)+(delta?' − ('+mm29Num(delta)+')':''),
    'أستخدم العدد '+mm29Num(base)+' بدلًا من '+mm29Num(b)+' ثم أعوّض الفرق.');
   add('أضرب في العدد المستدير',mm29M(a,'×',base)+' = '+mm29Num(a*base),
    'الضرب في عشرة أو مئة أسهل ذهنيًا.');
   add('أعوّض الفرق',mm29Num(a*base)+' − ('+mm29Num(a*delta)+') = '+mm29Num(result),
    'طرحنا أثر '+mm29Num(delta)+' من العامل؛ وهذا يحافظ على الناتج الصحيح.');
  }else if(method==='double'){
   let left=a,right=b;
   if(left%2!==0){left=b;right=a}
   add('أبدّل العاملين عند الحاجة',mm29M(left,'×',right)+' = '+mm29Num(result),
    'تبادل العاملين لا يغيّر حاصل الضرب.');
   for(let i=0;i<2&&left>0&&left%2===0;i++){
    const beforeL=left,beforeR=right;left/=2;right*=2;
    add('أنصّف وأضاعف',mm29M(beforeL,'×',beforeR)+' = '+mm29M(left,'×',right),
     'نصف العامل الأول وضِعف الثاني يعطيان الناتج نفسه.');
   }
   add('أحسب حاصل الضرب الأسهل',mm29M(left,'×',right)+' = '+mm29Num(result),
    'استُخدمت المضاعفة والتنصيف دون تغيير قيمة حاصل الضرب.');
  }else if(method==='five'){
   const special=[a,b].find(x=>[5,25,50].includes(x)),other=special===a?b:a;
   const base=special===5?10:100,div=special===5?2:special===25?4:2;
   add('أستبدل العامل المفتاح',mm29Num(special)+' = '+mm29Num(base)+' ÷ '+mm29Num(div),
    'هذا التحويل يسهّل الحساب الذهني.');
   add('أضرب في عشرة أو مئة',mm29M(other,'×',base)+' = '+mm29Num(other*base),
    'أنقل العدد إلى قيمة مكانية أسهل.');
   add('أقسم الناتج',mm29Num(other*base)+' ÷ '+mm29Num(div)+' = '+mm29Num(result),
    'القسمة هنا تعوض الزيادة التي حدثت في العامل.');
  }
 }else if(op==='add'){
  if(method==='comp'){
   const ca=mm29Round(a),cb=mm29Round(b),first=Math.abs(ca.delta)<=Math.abs(cb.delta);
   const target=first?ca.target:cb.target,delta=first?ca.delta:cb.delta,other=first?b:a,value=first?a:b;
   add('أقرب العدد الأكثر ملاءمة',mm29Num(value)+' → '+mm29Num(target),
    'أضفت '+mm29Num(delta)+' ليصبح العدد أسهل في الجمع. قد تكون الإضافة سالبة إذا قربنا للأسفل.');
   add('أحسب الجمع السهل',mm29M(target,'+',other)+' = '+mm29Num(target+other),
    'الجمع بعد التقريب أسهل.');
   add('أصحح التعويض',mm29Num(target+other)+' − ('+mm29Num(delta)+') = '+mm29Num(result),
    'أطرح مقدار التغيير الذي استخدمته عند التقريب.');
  }else if(method==='place'){
   const ap=mm29Parts(a),bp=mm29Parts(b);
   add('أفكك بحسب المنازل',mm29Num(a)+' = '+ap.map(mm29Num).join(' + '),
    'أفصل الآلاف والمئات والعشرات والآحاد.');
   add('أفكك العدد الثاني',mm29Num(b)+' = '+bp.map(mm29Num).join(' + '),
    'أحافظ على كل قيمة مكانية.');
   let running=a;
   bp.forEach((part,i)=>{const next=running+part;
    add('أجمع الجزء '+mm29Num(i+1),mm29M(running,'+',part)+' = '+mm29Num(next),
      'إضافة '+mm29Num(part)+' تحافظ على قيم المنازل.');running=next;
   });
  }else if(method==='make10'){
   const da=(10-a%10)%10,db=(10-b%10)%10;
   const first=da>0&&b>=da&&(!(db>0&&a>=db)||da<=db);
   const start=first?a:b,other=first?b:a,delta=first?da:db;
   add('أبحث عن العشرة التالية',mm29M(start,'+',delta)+' = '+mm29Num(start+delta),
     'أنقل '+mm29Num(delta)+' من العدد الآخر لأكمل عشرة.');
   add('أحافظ على المجموع',mm29Num(other)+' − '+mm29Num(delta)+' = '+mm29Num(other-delta),
     'نقلت الجزء فقط، ولم أزد مجموع العددين.');
   add('أجمع عددًا سهلًا',mm29M(start+delta,'+',other-delta)+' = '+mm29Num(result),
     'تكوين عشرة كاملة يجعل الجمع أسرع.');
  }else if(method==='jumps'){
   const parts=mm29Parts(b);let running=a;
   add('أبدأ من العدد الأول',mm29Num(a),'سنقفز بمقادير المئات والعشرات والآحاد.');
   parts.forEach((part,i)=>{const next=running+part;
    add('أضيف قفزة '+mm29Num(i+1),mm29M(running,'+',part)+' = '+mm29Num(next),
      'أضفت '+mm29Num(part)+' في هذه القفزة.');running=next;
   });
  }
 }else{
  if(method==='comp'||method==='same'){
   const round=mm29Round(b),delta=round.delta,target=round.target;
   add('أقرّب المطروح',mm29Num(b)+' → '+mm29Num(target),
     'العدد المستدير أسهل ذهنيًا.');
   if(method==='comp'){
    add('أطرح العدد المستدير',mm29M(a,'−',target)+' = '+mm29Num(a-target),
      'قد يكون الناتج المرحلي سالبًا أحيانًا، وهذا لا يغيّر صحة التعويض.');
    add('أعيد مقدار التعويض',mm29Num(a-target)+' + ('+mm29Num(delta)+') = '+mm29Num(result),
      'أضيف التغيير نفسه الذي أضفته إلى المطروح.');
   }else{
    add('أزيد أو أنقص العددين معًا',mm29M(a,'+',delta)+' = '+mm29Num(a+delta),
      'عندما نغيّر العددين بالمقدار نفسه يبقى الفرق ثابتًا.');
    add('أطرح بعد المحافظة على الفرق',mm29M(a+delta,'−',target)+' = '+mm29Num(result),
      'الطرح بعد التسوية أسهل ذهنيًا.');
   }
  }else if(method==='place'){
   const parts=mm29Parts(b);let running=a;
   add('أفكك المطروح',mm29Num(b)+' = '+parts.map(mm29Num).join(' + '),
     'أقسّم المطروح بحسب القيم المكانية.');
   parts.forEach((part,i)=>{const next=running-part;
    add('أطرح الجزء '+mm29Num(i+1),mm29M(running,'−',part)+' = '+mm29Num(next),
      'أطرح '+mm29Num(part)+' وأتابع إلى الجزء التالي.');running=next;
   });
  }else if(method==='jumps'){
   let running=b,sum=0,jumps=[];
   const push=(target,explain)=>{
    if(target<=running||target>a)return;
    const gap=target-running;sum+=gap;
    add(explain,mm29M(running,'+',gap)+' = '+mm29Num(target),
      'هذه قفزة مقدارها '+mm29Num(gap)+'، ومجموع القفزات أصبح '+mm29Num(sum)+'.');
    jumps.push(gap);running=target;
   };
   add('أنطلق من المطروح',mm29Num(b),'نعدّ تصاعديًا حتى نصل إلى المطروح منه '+mm29Num(a)+'.');
   for(const unit of [10,100,1000,10000]){
    const target=Math.ceil(running/unit)*unit;
    if(target>running&&target<=a)push(target,'أقفز إلى '+mm29Num(unit)+' أو مضاعفها التالي');
   }
   for(const unit of [10000,1000,100,10]){
    const target=Math.floor(a/unit)*unit;
    if(target>running&&target<a)push(target,'أقفز إلى أقرب '+mm29Num(unit)+' داخل المدى');
   }
   push(a,'أكمل القفزة الأخيرة');
   if(!jumps.length)add('لم أحتج إلى قفزة',mm29Num(a)+' = '+mm29Num(b),'لأن العددين متساويان فالفرق صفر.');
   else add('أجمع قفزات الفرق',jumps.map(mm29Num).join(' + ')+' = '+mm29Num(result),
    'مجموع القفزات من المطروح إلى المطروح منه يساوي فرق العددين.');
  }
 }
 add('أعلن الناتج الدقيق',mm29M(a,sign,b)+' = '+mm29Num(result),
  'هذا الناتج ثابت مهما كانت الاستراتيجية الذهنية الصحيحة التي استخدمتها.');
 return {op,a,b,result,method,steps,available:selectedAvailable,estimate:op==='mul'?estimate(a)*estimate(b):op==='add'?estimate(a)+estimate(b):estimate(a)-estimate(b)};
}
function mm29CurrentOperation(){
 return state.page==='mental_multiply'?'mul':mm29.operation==='sub'?'sub':'add';
}
function mm29Verification(model,s){
 if(!s.started||s.step<model.steps.length-1)return '';
 const {op,a,b,result}=model;const expression=op==='mul'?
  (a!==0?mm29M(result,'÷',a)+' = '+mm29Num(b):b!==0?mm29M(result,'÷',b)+' = '+mm29Num(a):
   '٠ × ٠ = ٠؛ القسمة العكسية على صفر غير معرفة'):
  op==='add'?mm29M(result,'−',b)+' = '+mm29Num(a):
  mm29M(result,'+',b)+' = '+mm29Num(a);
 const proof=op==='mul'?(a===0||result/a===b):op==='add'?result-b===a:result+b===a;
 const independent=op==='mul'?Number(a)*Number(b):op==='add'?Number(a)+Number(b):Number(a)-Number(b);
 const calculator=mm29M(a,op==='mul'?'×':op==='add'?'+':'−',b)+' = '+mm29Num(independent);
 return '<section class="mm29-verify"><header><span>✓</span><div><h2>تحقق من الناتج بطريقتين</h2><p>العملية العكسية ثم الحاسبة، لتطمئن إلى صحة التفكير الذهني.</p></div></header>'+
 '<div class="mm29-check-grid"><div class="mm29-check-card"><h3>١ • العملية العكسية</h3>'+
 '<button type="button" data-mm29-verify="inverse">'+(s.showInverse?'إخفاء التحقق':'أظهر التحقق العكسي')+'</button>'+
 (s.showInverse?'<p class="mm29-math-proof" dir="ltr">'+mm29Esc(expression)+'</p><small>'+
 (proof?'✔ التحقق صحيح، أعادنا إلى أحد العددين الأصليين.':'راجع الناتج مرة أخرى.')+'</small>':'')+
 '</div><div class="mm29-check-card"><h3>٢ • الحاسبة العلمية</h3>'+
 '<button type="button" data-mm29-verify="calculator">'+(s.showCalculator?'إخفاء الحاسبة':'شغّل الحاسبة وتحقق')+'</button>'+
 (s.showCalculator?'<p class="mm29-math-proof" dir="ltr">'+mm29Esc(calculator)+'</p>'+
 '<small>'+(independent===result?'✔ ناتج الحاسبة مطابق لنتيجة الخطوات الذهنية.':'⚠ النتيجة غير مطابقة؛ راجع العمليات.')+'</small>':'')+
 '</div></div></section>';
}
function mm29Page(){
 const op=mm29CurrentOperation(),s=mm29.states[op],prop=mm29Props.find(p=>p.code===op);
 let m;try{m=mm29Build(op,s.a,s.b,s.method)}catch(e){return '<div class="container mm29-page"><p class="mm29-error">'+mm29Esc(e.message)+'</p></div>'}
 const progress=Math.max(0,Math.round((s.step+1)*100/m.steps.length));
 const complete=s.started&&s.step>=m.steps.length-1;
 const nav=op==='mul'?'mental_multiply':'mental_add_sub';
 const methods=mm29Methods[op].map(([id,title,caption])=>{
  const available=mm29Compatible(op,s.a,s.b,id);
  return '<button type="button" data-mm29-method="'+id+'" class="'+(s.method===id?'active':'')+'" '+
   (available?'':'disabled title="هذه الاستراتيجية لا تناسب العددين المدخلين"')+'>'+
   '<strong>'+mm29Esc(title)+'</strong><small>'+mm29Esc(caption)+'</small></button>';
 }).join('');
 const prep='<section class="mm29-prep"><div class="mm29-section-title"><span>١</span><div><h2>اختر الأعداد والاستراتيجية</h2>'+
 '<p>لكل مسألة أكثر من طريقة؛ جرّب طريقتين وقارن أيهما أسرع وأسهل لك.</p></div></div>'+
 '<div class="mm29-presets">'+mm29Samples[op].map(([a,b,label])=>'<button type="button" data-mm29-preset="'+a+'-'+b+'" '+
 (a===s.a&&b===s.b?'class="active"':'')+'>'+label+'</button>').join('')+'</div>'+
 '<form id="mm29Form"><label>العدد الأول<input name="a" inputmode="numeric" value="'+mm29Esc(s.a)+'" required></label>'+
 '<label>العدد الثاني<input name="b" inputmode="numeric" value="'+mm29Esc(s.b)+'" required></label>'+
 '<button type="submit">🔄 جهّز مسألة جديدة</button></form>'+
 (s.error?'<p class="mm29-error" role="alert">'+mm29Esc(s.error)+'</p>':'')+
 '<div class="mm29-strategy-heading"><h3>أي استراتيجية تريد تجربتها؟</h3><span>اختر استراتيجية من الخيارات المتاحة</span></div>'+
 '<div class="mm29-methods">'+methods+'</div></section>';
 const guess='<section class="mm29-guess"><div class="mm29-section-title"><span>٢</span><div><h2>أفكّر قبل الحل</h2>'+
 '<p>قدّر الناتج ذهنيًا ثم جرّب كتابة إجابتك قبل مشاهدة الخطوات.</p></div></div>'+
 '<div class="mm29-question"><b dir="ltr">'+mm29Esc(mm29M(s.a,mm29Config[op].symbol,s.b))+' = ؟</b>'+
 '<p>ما الناتج الذي تتوقعه؟</p></div>'+
 '<form id="mm29GuessForm"><label>إجابتي الذهنية<input name="answer" inputmode="numeric" placeholder="اكتب تقديرك أو إجابتك" value="'+mm29Esc(s.guess)+'"></label>'+
 '<button type="submit">تحقق من إجابتي</button></form>'+
 (s.checked?'<p class="mm29-guess-feedback '+(Number(mm29Digits(s.guess))===m.result&&String(s.guess).trim()?'correct':'try')+'">'+
 (Number(mm29Digits(s.guess))===m.result&&String(s.guess).trim()?'🌟 أحسنت! إجابتك صحيحة.':
  '💡 محاولة جيدة. قارن تفكيرك بالخطوات؛ الناتج الصحيح سيظهر في النهاية.')+'</p>':'')+
 (!s.started?'<button type="button" id="mm29Begin">🚀 ابدأ التفكير خطوة بخطوة</button>':'')+'</section>';
 const stages=s.started?'<section class="mm29-workspace"><div class="mm29-section-title"><span>٣</span><div>'+
 '<h2>خطوات الاستراتيجية خطوةً خطوة</h2><p>الانتقال إلى التالي والسابق يعمل دون تغيير الأعداد أو فقدان المرحلة.</p></div></div>'+
 '<div class="mm29-progress"><span style="width:'+progress+'%" role="progressbar" aria-valuenow="'+progress+'" aria-valuemin="0" aria-valuemax="100"></span></div>'+
 '<div class="mm29-progress-caption">الخطوة '+mm29Num(Math.max(0,s.step+1))+' من '+mm29Num(m.steps.length)+' • '+mm29Num(progress)+'٪</div>'+
 '<div class="mm29-step-layout"><div class="mm29-active-step"><span>✨ '+(s.step<0?'استعد لبدء الاستراتيجية':mm29Num(s.step+1)+' / '+mm29Num(m.steps.length))+'</span>'+
 '<h3>'+mm29Esc(s.step<0?'جاهز للتفكير':m.steps[s.step].heading)+'</h3>'+
 '<div class="mm29-step-math" dir="ltr">'+mm29Esc(s.step<0?mm29M(s.a,mm29Config[op].symbol,s.b):m.steps[s.step].formula)+'</div>'+
 '<p>'+mm29Esc(s.step<0?'اضغط التالي للكشف عن الخطوة الأولى.':m.steps[s.step].explain)+'</p>'+
 '</div><div class="mm29-step-map">'+m.steps.map((step,i)=>'<div class="mm29-step-mini '+(i===s.step?'current':i<s.step||s.showAll?'visible':'locked')+'">'+
 '<span>'+mm29Num(i+1)+'</span><div><strong>'+mm29Esc(step.heading)+'</strong>'+
 ((i<=s.step||s.showAll)?'<small dir="ltr">'+mm29Esc(step.formula)+'</small>':'<small>يُفتح في الخطوة التالية</small>')+
 '</div></div>').join('')+'</div></div>'+
 '<div class="mm29-step-buttons"><button type="button" id="mm29Prev" '+(s.step<0?'disabled':'')+'>→ السابق</button>'+
 '<button type="button" id="mm29Next" '+(complete?'disabled':'')+'>التالي ←</button>'+
 '<button type="button" id="mm29All">'+(s.showAll?'إخفاء بقية الخطوات':'عرض جميع الخطوات')+'</button></div>'+
 (complete?'<div class="mm29-result"><span>🏆 الناتج الدقيق بعد اكتمال جميع الخطوات</span>'+
 '<strong dir="ltr">'+mm29M(s.a,mm29Config[op].symbol,s.b)+' = '+mm29Num(m.result)+'</strong></div>':'')+
 '</section>'+mm29Verification(m,s):'';
 return '<div class="container mm29-page mm29-'+op+'" dir="rtl">'+
 '<header class="mm29-hero"><div class="mm29-hero-icon">'+prop.icon+'</div><div>'+
 '<span>مبادرات الأستاذ سعيد البريكي • مختبر مهارات الحساب الذهني</span><h1>'+prop.title+'</h1>'+
 '<p>'+prop.caption+' • أفكّر، أختار، أحسب ثم أتحقق.</p></div><div class="mm29-hero-dots" aria-hidden="true">✦ ✧ ✦</div></header>'+
 '<nav class="mm29-tabs" aria-label="مختبرات الحساب الذهني"><button data-route="mental_multiply" class="'+(nav==='mental_multiply'?'active':'')+'">✖️ الضرب الذهني</button>'+
 '<button data-mm29-op="add" class="'+(op==='add'?'active':'')+'">➕ الجمع الذهني</button>'+
 '<button data-mm29-op="sub" class="'+(op==='sub'?'active':'')+'">➖ الطرح الذهني</button></nav>'+
 prep+guess+stages+
 '<footer class="mm29-footer"><strong>إعداد وإشراف الأستاذ سعيد جمعة عبدالله البريكي</strong>'+
 '<p>مبادرة تعليمية تعتمد التفكير المرن، وتعدد طرائق الحل، والتحقق من صحة النتائج بأساليب مستقلة.</p></footer></div>';
}
const mm29PreviousGeneric=genericSection;
genericSection=function(page){
 const html=mm29PreviousGeneric(page);
 if(!['mental_multiply','mental_add_sub'].includes(page)||typeof iaState==='undefined'||
    iaState.page!==page||!iaState.html||iaState.blocked)return html;
 return mm29Page();
};
const mm29PreviousAttach=attach;
attach=function(){
 mm29PreviousAttach();
 if(!['mental_multiply','mental_add_sub'].includes(state.page)||typeof iaState==='undefined'||
    iaState.page!==state.page||!iaState.html||iaState.blocked)return;
 document.querySelectorAll('[data-mm29-op]').forEach(button=>button.addEventListener('click',()=>{
  mm29.operation=button.dataset.mm29Op==='sub'?'sub':'add';
  if(state.page!=='mental_add_sub')route('mental_add_sub');
  else render();
 }));
 document.querySelectorAll('[data-mm29-preset]').forEach(button=>button.addEventListener('click',()=>{
  const op=mm29CurrentOperation(),[a,b]=button.dataset.mm29Preset.split('-').map(Number);
  mm29Reset(op,a,b);render();
 }));
 document.getElementById('mm29Form')?.addEventListener('submit',event=>{
  event.preventDefault();const f=event.currentTarget,op=mm29CurrentOperation();
  const ra=mm29Digits(f.elements.a.value.trim()),rb=mm29Digits(f.elements.b.value.trim());
  const a=Number(ra),b=Number(rb);
  if(!/^\d+$/.test(ra)||!/^\d+$/.test(rb)||!Number.isSafeInteger(a)||!Number.isSafeInteger(b)||
     a>99999||b>99999||(op==='mul'&&(a>9999||b>9999))||(op==='sub'&&a<b)){
    mm29.states[op].error='أدخل أعدادًا صحيحة غير سالبة؛ وفي الطرح يجب ألا يقل العدد الأول عن الثاني. الحد الأعلى ٩٩٩٩ في الضرب، و٩٩٩٩٩ في الجمع والطرح.';
    render();return;
  }
  mm29Reset(op,a,b);if(!mm29Compatible(op,a,b,mm29.states[op].method))mm29.states[op].method=op==='mul'?'split':'place';
  render();
 });
 document.querySelectorAll('[data-mm29-method]').forEach(button=>button.addEventListener('click',()=>{
  const op=mm29CurrentOperation(),s=mm29.states[op],method=button.dataset.mm29Method;
  if(!mm29Compatible(op,s.a,s.b,method))return;
  mm29Reset(op,s.a,s.b,method);render();
 }));
 document.getElementById('mm29GuessForm')?.addEventListener('submit',event=>{
  event.preventDefault();const s=mm29.states[mm29CurrentOperation()];
  s.guess=event.currentTarget.elements.answer.value.trim();s.checked=true;render();
 });
 document.getElementById('mm29Begin')?.addEventListener('click',()=>{
  const s=mm29.states[mm29CurrentOperation()];s.started=true;s.step=-1;render();
 });
 document.getElementById('mm29Prev')?.addEventListener('click',()=>{
  const s=mm29.states[mm29CurrentOperation()];s.step=Math.max(-1,s.step-1);render();
 });
 document.getElementById('mm29Next')?.addEventListener('click',()=>{
  const op=mm29CurrentOperation(),s=mm29.states[op],length=mm29Build(op,s.a,s.b,s.method).steps.length;
  s.step=Math.min(length-1,s.step+1);render();
 });
 document.getElementById('mm29All')?.addEventListener('click',()=>{
  const s=mm29.states[mm29CurrentOperation()];s.showAll=!s.showAll;render();
 });
 document.querySelectorAll('[data-mm29-verify]').forEach(button=>button.addEventListener('click',()=>{
  const s=mm29.states[mm29CurrentOperation()],prop=button.dataset.mm29Verify;
  if(prop==='inverse')s.showInverse=!s.showInverse;
  if(prop==='calculator')s.showCalculator=!s.showCalculator;
  render();
 }));
};
if(typeof iaPrivatePages!=='undefined'){
 iaPrivatePages.add('mental_multiply');
 iaPrivatePages.add('mental_add_sub');
}
/* Direct links to both protected lessons must enter their existing permission gate. */
if(typeof window!=='undefined'&&typeof state!=='undefined'){
 const requested=(window.AFAQ_REQUESTED_HASH||window.location?.hash?.slice(1)||'');
 if(['mental_multiply','mental_add_sub'].includes(requested)&&state.page!==requested){
  state.page=requested;
  if(typeof render==='function')render();
 }
}
