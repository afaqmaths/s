/* AFAQ MATH | Grade 6 mathematics teacher initiatives
 * Zeroth & positive multiples; the Eratosthenes prime sieve (1..100).
 * No changes to student grades or personal data. */
'use strict';
const amiPrimes=[2,3,5,7];
const amiState={number:6,index:3,sieveStage:0,answer:'',answerChecked:false,notice:''};
const amiAr=n=>new Intl.NumberFormat('ar-OM',{useGrouping:false}).format(n);
const amiMathNum=n=>Number.isFinite(Number(n))?Number(n):NaN;
function amiFirstDivisor(n){
 for(const p of amiPrimes){if(n>p&&n%p===0)return p}
 return null;
}
function amiIsPrime(n){return n>1&&amiFirstDivisor(n)===null}
function amiStepItems(stage){
 const p=amiPrimes[Math.max(0,stage-1)];
 return stage>0?Array.from({length:100},(_,i)=>i+1).filter(n=>n>p&&n%p===0&&amiFirstDivisor(n)===p):[];
}
function amiInitiativeCard(route,emoji,title,summary){
 return '<article class="ami-feature-card">'+
 '<button type="button" data-route="'+route+'" aria-label="فتح '+title+'">'+
 '<span class="ami-feature-art" aria-hidden="true">'+emoji+'</span>'+
 '<span><strong>'+title+'</strong><small>'+summary+'</small></span>'+
 '<span class="ami-feature-arrow" aria-hidden="true">↗</span></button></article>';
}
const amiFeatures=[
 ['afaq_multiples','✖️','المضاعفات: من الصفر إلى ما بعده','اكتشف المضاعف الصفري والمضاعفات الموجبة، واحسب أي مضاعف'],
 ['afaq_prime_sieve','🔎','غربال الأعداد الأولية','احذف مضاعفات ٢ ثم ٣ ثم ٥ ثم ٧ في جدول من ١ إلى ١٠٠']
];
function amiFeaturesGrid(brief=false){
 return '<section class="ami-feature-section" aria-label="مبادرتان رياضيتان تفاعليتان">'+
 (!brief?'<div class="ami-feature-heading"><span>مبادرات تفاعلية للصف السادس</span><h2>المضاعفات والأعداد الأولية</h2>'+
 '<p>أنشطة استكشافية مستقلة لإثراء ما ورد في الدرس، مع تطبيق عملي وتصحيح ذاتي.</p></div>':'')+
 '<div class="ami-feature-grid">'+amiFeatures.map(x=>amiInitiativeCard(...x)).join('')+'</div></section>';
}
/* Add cards even when a supervisor has customized the other initiatives. */
const amiOldInitHome=initHome;
initHome=function(){
 const h=amiOldInitHome();
 return h.replace('<div class="v10-init-grid">',amiFeaturesGrid(true)+'<div class="v10-init-grid">');
};
const amiOldInitPage=initPage;
initPage=function(){
 const h=amiOldInitPage();
 return h.replace('<div class="v10-init-grid v10-init-grid-large">',amiFeaturesGrid(false)+'<div class="v10-init-grid v10-init-grid-large">');
};
function amiPageStart(tag,title,desc){
 return '<div class="container ami-page" dir="rtl"><header class="ami-page-head">'+
 '<span>مبادرات الأستاذ سعيد البريكي • الصف السادس</span><h1>'+title+'</h1><p>'+desc+'</p>'+
 '<button type="button" data-route="teaching_initiatives">العودة إلى المبادرات</button></header>'+tag;
}
function amiMultiplesPage(){
 const n=amiState.number,k=amiState.index,value=n*k;
 const calculations=Array.from({length:11},(_,i)=>
 '<div class="ami-multiple-chip'+(i===k?' selected':'')+'"><span>م'+amiAr(i)+'</span><b>'+
 amiAr(n*i)+'</b><small>'+amiAr(n)+' × '+amiAr(i)+'</small></div>').join('');
 return amiPageStart(
 '<section class="ami-info"><h2>ما المقصود برتبة المضاعف؟</h2>'+
 '<p>إذا كان <strong>ن</strong> عددًا طبيعيًا موجبًا، فإن مضاعفاته تبدأ بالصفر، ثم العدد نفسه، ثم ضعفه، ثم ثلاثة أمثاله، وهكذا. نحصل على المضاعف ذي الرتبة <strong>ك</strong> بضرب العدد في ك.</p>'+
 '<div class="ami-formula" dir="ltr">M<sub>k</sub>(n) = n × k &nbsp; (k = 0, 1, 2, 3, ...)</div>'+
 '<div class="ami-three-facts"><article><strong>المضاعف الصفري (م٠)</strong><b>ن × ٠ = ٠</b><small>الصفر مضاعف لكل عدد.</small></article>'+
 '<article><strong>المضاعف الأول الموجب (م١)</strong><b>ن × ١ = ن</b><small>يساوي العدد نفسه، وليس ن × ن.</small></article>'+
 '<article><strong>المضاعف الثاني (م٢)</strong><b>ن × ٢ = ٢ن</b><small>ضعف العدد.</small></article></div>'+
 '<p class="ami-accuracy"><strong>تنبيه مهم:</strong> نضرب العدد في <strong>١</strong> لنحصل على المضاعف الأول الموجب، وليس في نفسه. والحديث عن «المضاعفات الموجبة» يفترض أن العدد المدخل أكبر من الصفر.</p>'+
 '</section>'+
 '<section class="ami-lab"><h2>حاسبة المضاعفات التفاعلية</h2>'+
 '<p>اختر العدد، ثم أدخل رتبة المضاعف (٠ للمضاعف الصفري، ١ للأول الموجب، ٢ للثاني، وهكذا).</p>'+
 '<form id="amiMultipleForm" class="ami-inputs">'+
 '<label>العدد الطبيعي<input name="number" id="amiMultipleNumber" type="number" required min="1" max="9999" step="1" inputmode="numeric" value="'+n+'"></label>'+
 '<label>رتبة المضاعف<input name="index" id="amiMultipleIndex" type="number" required min="0" max="100" step="1" inputmode="numeric" value="'+k+'"></label>'+
 '<button type="submit">احسب المضاعف</button></form>'+
 '<div class="ami-quick-steps" aria-label="رتب سريعة">'+[0,1,2,3,5,10].map(i=>
 '<button type="button" data-ami-ordinal="'+i+'"'+(k===i?' class="current"':'')+'>م'+amiAr(i)+'</button>').join('')+'</div>'+
 '<p class="ami-validation" id="amiValidation" role="status" aria-live="polite">'+amiState.notice+'</p>'+
 '<div class="ami-result"><span>المضاعف '+(k===0?'الصفري':k===1?'الأول الموجب':k===2?'الثاني':('ذو الرتبة '+amiAr(k)))+' للعدد '+amiAr(n)+'</span>'+
 '<strong>'+amiAr(value)+'</strong><p dir="ltr">'+amiAr(n)+' × '+amiAr(k)+' = '+amiAr(value)+'</p></div>'+
 '<h3>لوحة المضاعفات الأولى من ٠ إلى ١٠</h3><div class="ami-multiple-strip">'+calculations+'</div>'+
 '<p class="ami-note">إذا كانت الرتبة أكبر من ١٠، سيظهر ناتجها في الحاسبة حتى إن لم تكن ضمن لوحة المضاعفات الأولى.</p></section>'+
 '</div>',
 'مبادرة المضاعفات الصفرية والموجبة',
 'منهجية منظمة تربط جدول الضرب برتبة المضاعف، وتُظهر المضاعف الصفري الذي لا يُبرز دائمًا في الأمثلة المدرسية.'
 );
}
function amiSieveGrid(stage,staticGrid=false){
 return '<div class="ami-hundred-grid" role="grid" aria-label="'+(staticGrid?'الجدول الأصلي للأعداد من ١ إلى ١٠٠':'جدول الغربال بعد '+amiAr(stage)+' مراحل')+'">'+
 Array.from({length:100},(_,i)=>{
  const n=i+1,p=amiFirstDivisor(n),removed=stage>0&&p!==null&&amiPrimes.slice(0,stage).includes(p);
  const visiblePrime=stage===4&&amiIsPrime(n);
  const isBasePrime=amiPrimes.slice(0,stage).includes(n);
  const cls=staticGrid?'':n===1?' ami-unit':removed?' ami-removed ami-by-'+p:
  visiblePrime?' ami-prime':isBasePrime?' ami-known-prime':'';
  const label=n===1?'الواحد ليس أوليًا':removed?'حذف لأنه مضاعف للعدد '+p:
   visiblePrime?'عدد أولي':'العدد '+n;
  return '<div role="gridcell" class="ami-hundred-cell'+cls+'" title="'+label+'" aria-label="'+label+
  '"><span>'+amiAr(n)+'</span></div>';
 }).join('')+'</div>';
}
function amiSieveStepExplanation(){
 const stage=amiState.sieveStage;
 if(stage===0)return 'هذه هي الأعداد من ١ إلى ١٠٠. العدد ١ ليس أوليًا؛ لأنه يملك عاملًا موجبًا واحدًا فقط.';
 if(stage===4)return 'اكتمل الغربال! لم تُحذف الأعداد ٢ و٣ و٥ و٧ نفسها. كل عدد متبقٍ أكبر من ١ هو عدد أولي.';
 const p=amiPrimes[stage-1],deleted=amiStepItems(stage);
 return 'حُذفت الآن '+amiAr(deleted.length)+' أعداد جديدة من مضاعفات '+amiAr(p)+
 '، مع الإبقاء على العدد '+amiAr(p)+' نفسه لأنه أولي. بقيت الأعداد التي لم تُحذف في المراحل السابقة.';
}
function amiSievePage(){
 const stage=amiState.sieveStage;
 const primeCount=Array.from({length:100},(_,i)=>i+1).filter(amiIsPrime).length;
 const answer=amiState.answer.trim();
 const checked=amiState.answerChecked,correct=Number(answer)===primeCount;
 const answerMessage=!checked?'':correct?
 'أحسنت! إجابتك صحيحة: يوجد '+amiAr(primeCount)+' عددًا أوليًا من ١ إلى ١٠٠.':
 'لم تتطابق الإجابة. احسب الأعداد الباقية بعد حذف المضاعفات، مع استبعاد العدد ١، وحاول مجددًا.';
 const current=amiPrimes[stage]??null;
 const color=[2,3,5,7];
 return amiPageStart(
 '<section class="ami-info"><h2>متى يكون العدد أوليًا؟</h2>'+
 '<p>العدد الأولي عدد طبيعي أكبر من <strong>١</strong> وله <strong>عاملان موجبان فقط</strong>: العدد ١ والعدد نفسه. العدد <strong>١ ليس أوليًا</strong>؛ لأنه له عامل موجب واحد، والعدد <strong>٢ هو العدد الأولي الزوجي الوحيد</strong>؛ لأن أي عدد زوجي آخر يقبل القسمة على ٢.</p>'+
 '<p>نستخدم <strong>غربال إراتوستينس</strong>: نحتفظ بالعدد الأولي ٢ ونحذف مضاعفاته الأكبر منه، ثم نفعل الأمر نفسه مع ٣ و٥ و٧. وبما أن الجذر التربيعي لـ١٠٠ يساوي ١٠، فلا نحتاج إلى تجربة عدد أولي بعد ٧ لفحص الأعداد حتى ١٠٠.</p>'+
 '</section>'+
 '<section class="ami-lab"><h2>جدول الغربال التفاعلي — ١٠ × ١٠</h2>'+
 '<p>نفّذ أوامر الغربال بالترتيب. تتغير ألوان الخلايا بحسب العدد الذي أدى إلى حذفها، وتبقى الأعداد الأولية ظاهرة.</p>'+
 '<div class="ami-sieve-actions"><button type="button" data-ami-reset>ابدأ من جديد</button>'+
 '<button type="button" data-ami-back'+(stage===0?' disabled':'')+'>الخطوة السابقة</button>'+
 amiPrimes.map((p,i)=>'<button type="button" class="ami-step-button ami-step-'+p+
 (stage>i?' completed':'')+'" data-ami-step="'+(i+1)+'"'+(stage!==i?' disabled':'')+'>'+
 (stage>i?'✓ ':'')+'احذف مضاعفات '+amiAr(p)+'</button>').join('')+
 '</div>'+
 '<div class="ami-sieve-progress" role="status" aria-live="polite"><strong>المرحلة '+amiAr(stage)+' من ٤</strong><span>'+
 amiSieveStepExplanation()+'</span></div>'+
 '<div class="ami-sieve-pair">'+
 '<figure class="ami-sieve-figure"><figcaption>الجدول الأصلي — قبل الحذف</figcaption>'+
 '<div class="ami-grid-scroll">'+amiSieveGrid(0,true)+'</div>'+
 '<button type="button" class="ami-export" data-ami-export="initial">تنزيل صورة الجدول الأصلي SVG</button></figure>'+
 '<figure class="ami-sieve-figure"><figcaption>الغربال بعد الخطوة '+amiAr(stage)+'</figcaption>'+
 '<div class="ami-grid-scroll">'+amiSieveGrid(stage)+'</div>'+
 '<button type="button" class="ami-export" data-ami-export="current">تنزيل صورة الغربال الحالي SVG</button></figure>'+
 '</div>'+
 '<div class="ami-legend">'+
 '<span><i class="ami-dot ami-by-2"></i>مضاعفات ٢</span><span><i class="ami-dot ami-by-3"></i>مضاعفات ٣</span>'+
 '<span><i class="ami-dot ami-by-5"></i>مضاعفات ٥</span><span><i class="ami-dot ami-by-7"></i>مضاعفات ٧</span>'+
 '<span><i class="ami-dot ami-prime"></i>الأعداد الأولية</span><span><i class="ami-dot ami-unit"></i>العدد ١ مستبعد</span></div>'+
 '<p class="ami-note">إذا حُذف عدد في خطوة سابقة فلا يُعاد تلوينه في الخطوة اللاحقة. العدد ٢ و٣ و٥ و٧ لا يُحذف كلٌّ منها عند اختيار مضاعفاته.</p>'+
 '</section>'+
 '<section class="ami-lab ami-question"><h2>سؤال استدلالي للطالب</h2>'+
 '<p>كم عدد الأعداد الأولية التي حصلت عليها في التجربة للأعداد المحصورة من <strong>١ إلى ١٠٠</strong>؟</p>'+
 '<form id="amiPrimeAnswer" class="ami-answer-form">'+
 '<label>عدد الأعداد الأولية<input type="number" name="answer" min="0" max="100" step="1" required value="'+(answer||'')+'" placeholder="اكتب العدد هنا"'+(stage<4?' disabled':'')+'></label>'+
 '<button type="submit"'+(stage<4?' disabled':'')+'>تحقق من إجابتي</button></form>'+
 (stage<4?'<p class="ami-note">أكمل مراحل الغربال الأربع أولًا لتفعيل السؤال.</p>':'')+
 (checked?'<p role="status" class="ami-answer-feedback '+(correct?'ami-correct':'ami-tryagain')+'">'+answerMessage+'</p>':'')+
 '</section>'+
 '</div>',
 'مبادرة غربال الأعداد الأولية',
 'تجربة بصرية استقصائية لاكتشاف الأعداد الأولية من ١ إلى ١٠٠ بطريقة الحذف المنظّم، وتفسير سبب استبعاد العدد ١.'
 );
}
function amiSieveSVG(stage,plain){
 const colors={2:'#fbe0df',3:'#fce7c5',5:'#dfe8ff',7:'#eadbfa'};
 const stroke={2:'#b83c42',3:'#a86b19',5:'#4461bc',7:'#8752ae'};
 const cells=Array.from({length:100},(_,i)=>{
  const n=i+1,c=i%10,r=Math.floor(i/10),x=36+c*69,y=115+r*64;
  const p=amiFirstDivisor(n),removed=!plain&&p!==null&&amiPrimes.slice(0,stage).includes(p);
  const prime=!plain&&stage===4&&amiIsPrime(n);
  const unit=!plain&&n===1;
  const fill=removed?colors[p]:prime?'#bdf2d2':unit?'#e4e7eb':'#fffaf0';
  const line=removed?'<path d="M'+(x+9)+' '+(y+49)+'L'+(x+49)+' '+(y+8)+'" stroke="'+stroke[p]+'" stroke-width="3.5"/>':'';
  return '<rect x="'+x+'" y="'+y+'" width="58" height="55" rx="8" fill="'+fill+'" stroke="#c4d7e5" stroke-width="1.5"/>'+
  '<text x="'+(x+29)+'" y="'+(y+36)+'" font-family="Arial,Tahoma,sans-serif" font-size="26" text-anchor="middle" fill="#203f5c">'+n+'</text>'+line;
 }).join('');
 const subtitle=plain?'1 to 100 (before elimination)':'Completed steps: '+stage+' / 4';
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 800" width="760" height="800">'+
 '<rect width="760" height="800" fill="#f7f9ff"/>'+
 '<rect x="22" y="22" width="716" height="68" rx="15" fill="#173d75"/>'+
 '<text x="380" y="52" font-family="Arial,Tahoma,sans-serif" font-size="25" text-anchor="middle" fill="#ffffff">AFAQ MATH — PRIME SIEVE</text>'+
 '<text x="380" y="78" font-family="Arial,Tahoma,sans-serif" font-size="16" text-anchor="middle" fill="#f5db9a">'+subtitle+'</text>'+
 cells+'</svg>';
}
function amiDownloadSVG(stage,plain){
 const svg=amiSieveSVG(stage,plain),blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=plain?'afaq-primes-1-to-100-original.svg':'afaq-prime-sieve-stage-'+stage+'.svg';
 document.body.appendChild(a);a.click();a.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),1200);
}
const amiBaseGeneric=genericSection;
genericSection=function(page){
 if(page==='afaq_multiples')return amiMultiplesPage();
 if(page==='afaq_prime_sieve')return amiSievePage();
 return amiBaseGeneric(page);
};
const amiBaseAttach=attach;
attach=function(){
 amiBaseAttach();
 document.getElementById('amiMultipleForm')?.addEventListener('submit',event=>{
  event.preventDefault();
  const f=event.currentTarget,n=Number(f.elements.number.value),k=Number(f.elements.index.value);
  if(!Number.isInteger(n)||n<1||n>9999||!Number.isInteger(k)||k<0||k>100){
   const e=document.getElementById('amiValidation');if(e)e.textContent='أدخل عددًا صحيحًا من ١ إلى ٩٩٩٩، ورتبة صحيحة من ٠ إلى ١٠٠.';
   return;
  }
  amiState.number=n;amiState.index=k;amiState.notice='';render();
 });
 document.querySelectorAll('[data-ami-ordinal]').forEach(button=>button.addEventListener('click',()=>{
  const raw=Number(document.getElementById('amiMultipleNumber')?.value);
  const k=Number(button.dataset.amiOrdinal);
  if(Number.isInteger(raw)&&raw>=1&&raw<=9999)amiState.number=raw;
  amiState.index=k;amiState.notice='';render();
 }));
 document.querySelector('[data-ami-reset]')?.addEventListener('click',()=>{
  amiState.sieveStage=0;amiState.answer='';amiState.answerChecked=false;render();
 });
 document.querySelector('[data-ami-back]')?.addEventListener('click',()=>{
  amiState.sieveStage=Math.max(0,amiState.sieveStage-1);
  amiState.answer='';amiState.answerChecked=false;render();
 });
 document.querySelectorAll('[data-ami-step]').forEach(button=>button.addEventListener('click',()=>{
  const next=Number(button.dataset.amiStep);
  if(next!==amiState.sieveStage+1)return;
  amiState.sieveStage=next;amiState.answer='';amiState.answerChecked=false;render();
 }));
 document.getElementById('amiPrimeAnswer')?.addEventListener('submit',event=>{
  event.preventDefault();if(amiState.sieveStage!==4)return;
  amiState.answer=event.currentTarget.elements.answer.value.trim();
  amiState.answerChecked=true;render();
 });
 document.querySelectorAll('[data-ami-export]').forEach(button=>button.addEventListener('click',()=>{
  const plain=button.dataset.amiExport==='initial';
  amiDownloadSVG(plain?0:amiState.sieveStage,plain);
 }));
};
