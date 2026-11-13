/* Afaq Math v11 — whole-shape translation (ي / أ) and the decimal-key long division innovation.
   No grades or student records are read or modified. */
'use strict';
const vi11={shape:'triangle',x:-2,y:-1,dx:3,dy:2};
const vd11={dividend:325,divisor:4,places:8,step:0,all:false};
const esc11=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ar11=n=>new Intl.NumberFormat('ar-OM',{maximumFractionDigits:4}).format(Number(n)||0);
const num11=str=>String(str).replace(/[0-9]/g,d=>'٠١٢٣٤٥٦٧٨٩'[Number(d)]).replace('.', '٫');
const shapes11={
 point:{label:'نقطة',offsets:[[0,0]]},
 segment:{label:'قطعة مستقيمة (ضلع)',offsets:[[0,0],[3,1]]},
 triangle:{label:'مثلث',offsets:[[0,0],[3,0],[1,3]]},
 square:{label:'مربع',offsets:[[0,0],[3,0],[3,3],[0,3]]},
 rectangle:{label:'مستطيل',offsets:[[0,0],[4,0],[4,2],[0,2]]},
 pentagon:{label:'مضلع خماسي',offsets:[[0,0],[2,-1],[4,1],[3,3],[1,3]]},
 hexagon:{label:'مضلع سداسي',offsets:[[0,0],[2,-1],[4,0],[4,2],[2,3],[0,2]]}
};
const vertexNames11=['أ','ب','ج','د','هـ','و'];
function verts11(){
 return shapes11[vi11.shape].offsets.map(([a,b],i)=>({name:vertexNames11[i],x:vi11.x+a,y:vi11.y+b}));
}
function transform11(points=verts11()){
 return points.map(p=>({...p,x:p.x+vi11.dx,y:p.y+vi11.dy}));
}
function geom11(){
 const points=verts11(),shifted=transform11(points),
 values=[...points,...shifted],range=Math.max(6,...values.flatMap(p=>[Math.abs(p.x),Math.abs(p.y)]))+1,
 unit=165/range,px=n=>245+n*unit,py=n=>245-n*unit;
 const grid=Array.from({length:2*range+1},(_,i)=>{
  const p=(i-range)*unit+245;
  return '<path d="M'+p.toFixed(2)+' 40V450 M40 '+p.toFixed(2)+'H450"/>';
 }).join('');
 const pair=p=>px(p.x).toFixed(2)+','+py(p.y).toFixed(2);
 const line=(arr,close)=>{
  if(arr.length===1)return '';
  return (close?'polygon':'polyline')+' points="'+arr.map(pair).join(' ')+'"';
 };
 const original=points.length>1?'<'+line(points,points.length>2)+' fill="'+(points.length>2?'#64bfd23a':'none')+
 '" stroke="#1594af" stroke-width="4.3" stroke-linejoin="round"/>':'';
 const target=shifted.length>1?'<'+line(shifted,shifted.length>2)+' fill="'+(shifted.length>2?'#f2b85a4a':'none')+
 '" stroke="#e0a149" stroke-width="4.3" stroke-linejoin="round"/>':'';
 const arrows=points.map((p,i)=>'<path d="M'+pair(p).replace(',',' ')+
 'L'+pair(shifted[i]).replace(',',' ')+'" fill="none" stroke="#dc9b52" stroke-dasharray="7 7" stroke-width="2.2" opacity=".8"/>').join('');
 const circles=(arr,color,prime)=>arr.map(p=>
 '<circle cx="'+px(p.x).toFixed(2)+'" cy="'+py(p.y).toFixed(2)+'" r="6.3" fill="'+color+'" stroke="white" stroke-width="2"/>'+
 '<text x="'+(px(p.x)+8).toFixed(2)+'" y="'+(py(p.y)-10).toFixed(2)+'" font-size="16" font-weight="bold" fill="'+color+'">'+
 p.name+(prime?'′':'')+'</text>').join('');
 return '<svg viewBox="0 0 490 490" class="vi11-chart" role="img" aria-label="المضلع أو القطعة قبل وبعد الانسحاب مع انتقال جميع الرؤوس">'+
 '<rect x="20" y="20" width="450" height="450" rx="22" fill="#f5fbff"/>'+
 '<g stroke="#d3e5f0" stroke-width=".8">'+grid+'</g>'+
 '<path d="M35 245H458 M245 456V35" stroke="#4b7197" stroke-width="2.8" fill="none"/>'+
 '<text x="458" y="264" font-size="17" fill="#325c83">س</text>'+
 '<text x="225" y="37" font-size="17" fill="#325c83">ص</text>'+
 arrows+original+target+circles(points,'#137f9a',false)+circles(shifted,'#ae7830',true)+
 '<g font-size="12" fill="#51718b"><text x="34" y="483">الأزرق: الأصل</text><text x="342" y="483">الذهبي: الصورة</text></g></svg>';
}
function coordsTable11(){
 const rows=verts11().map((p,i)=>{
 const n=transform11()[i];
 return '<tr><th>'+p.name+'</th><td>('+ar11(p.x)+' ، '+ar11(p.y)+')</td>'+
 '<td>('+ar11(n.x)+' ، '+ar11(n.y)+')</td>'+
 '<td>('+ar11(vi11.dx)+' ، '+ar11(vi11.dy)+')</td></tr>';
 }).join('');
 return '<table class="vi11-vertices"><thead><tr><th>الرأس</th><th>قبل الانسحاب</th>'+
 '<th>بعد الانسحاب</th><th>متجه الانسحاب (ي، أ)</th></tr></thead><tbody>'+rows+'</tbody></table>';
}
function coordinatePage11(){
 const options=Object.entries(shapes11).map(([k,v])=>
 '<button type="button" class="'+(vi11.shape===k?'selected':'')+'" data-vi11-shape="'+k+'">'+v.label+'</button>').join('');
 const labels=[['x','الإحداثي السيني (س) للرأس الأول'],['y','الإحداثي الصادي (ص) للرأس الأول'],
 ['dx','ي: يمين (+) أو يسار (−)'],['dy','أ: أعلى (+) أو أسفل (−)']];
 return '<div class="container vi11-page" dir="rtl">'+
 '<header class="vi11-hero"><span>مبادرات الأستاذ سعيد البريكي • الهندسة</span>'+
 '<h1>مبادرة «ي / أ» لتحريك النقاط والأضلاع والمضلعات</h1>'+
 '<p>«ي» تذكّر باليمين واليسار على محور السينات (س)، و«أ» تذكّر بالأعلى والأسفل على محور الصادات (ص).</p></header>'+
 '<div class="vi11-type-heading"><h2>اختر الشكل المراد انسحابه</h2><p>تطبّق قاعدة الانسحاب نفسها على كل رأس، وليس على نقطة واحدة فقط.</p></div>'+
 '<nav class="vi11-types" aria-label="أنواع الأشكال">'+options+'</nav>'+
 '<div class="vi11-interactive"><section class="vi11-controls">'+
 labels.map(([key,label])=>'<label>'+label+
 '<input type="number" min="-8" max="8" step="1" data-vi11-number="'+key+'" value="'+esc11(vi11[key])+'"></label>').join('')+
 '<div class="vi11-equation"><b>القاعدة:</b> (س، ص) ← (س + ي، ص + أ)'+
 '<p>ي = '+ar11(vi11.dx)+' ، أ = '+ar11(vi11.dy)+'</p></div>'+
 '<button type="button" class="vi11-reset" id="vi11Reset">↺ عُد إلى المثال الأول</button>'+
 '<div class="vi11-legend"><span>● الشكل الأصلي</span><span>● الشكل بعد الانسحاب</span></div>'+
 '</section><div class="vi11-graphic" id="vi11Graphic">'+geom11()+'</div></div>'+
 '<section class="vi11-results"><h2>إحداثيات جميع الرؤوس قبل الانسحاب وبعده</h2>'+
 '<div id="vi11VertexTable">'+coordsTable11()+'</div>'+
 '<p class="vi11-proof">المسافة والاتجاه ثابتان لكل رأس؛ لذلك يحافظ الانسحاب على أطوال الأضلاع والزوايا والشكل ومساحته.</p></section>'+
 '<section class="vi11-explain"><h2>توظيف المبادرة في الدرس</h2>'+
 '<p><strong>النقطة:</strong> نضيف (ي، أ) إلى الإحداثيين. <strong>القطعة المستقيمة:</strong> ننقل الطرفين بالمقدار نفسه، فلا يتغير طول القطعة أو اتجاهها.</p>'+
 '<p><strong>المضلع:</strong> ننقل كل رأس ثم نصل الرؤوس الجديدة بالترتيب نفسه؛ فنحصل على صورة مطابقة للمضلع الأصلي.</p>'+
 '<p>هذه وسيلة لفظية للتذكّر، ولا تلغي الرمزين الرياضيين (س، ص) أو القاعدة الرسمية للانسحاب.</p></section></div>';
}
/* Exact base-10 long division, stage by stage, without floating point computation. */
function division11(n,d,limit=8){
 n=Math.floor(Number(n));d=Math.floor(Number(d));limit=Math.floor(Number(limit));
 if(!Number.isInteger(n)||!Number.isInteger(d)||n<0||n>999999||d<1||d>9)throw Error('أدخل عددًا صحيحًا من صفر حتى ٩٩٩٩٩٩ ومقسومًا عليه من ١ إلى ٩');
 limit=Math.min(12,Math.max(1,limit));
 const digits=String(n).split('').map(Number),steps=[],raw=[];
 let rem=0;
 const places=['الآحاد','العشرات','المئات','الآلاف','عشرات الآلاف','مئات الآلاف'];
 for(let i=0;i<digits.length;i++){
  const before=rem,part=before*10+digits[i],q=Math.floor(part/d),product=q*d;
  rem=part-product;raw.push(String(q));
  const place=places[digits.length-i-1]||'منزلة أعلى';
  steps.push({type:'integer',place,part,carried:digits[i],before,q,product,remainder:rem,
   text:'مرحلة '+place+': نُنزل الرقم '+digits[i]+' فيصبح العدد المرحلي '+part+
    '؛ نقسم على '+d+' فنكتب '+q+'، ثم نطرح '+product+' ويبقى '+rem+'.'});
 }
 const whole=raw.join('').replace(/^0+(?=\d)/,'')||'0';
 const wholeRemainder=rem;let decimal='',cycle=-1,stop='finished';
 if(rem){
  steps.push({type:'key',remainder:rem,
   text:'ظهر باقٍ قدره '+rem+' بعد إتمام جميع منازل المقسوم. نضع المفتاح 🔑 أي الفاصلة العشرية في خارج القسمة، ثم نُضيف صفرًا على يمين الباقي ('+rem+' ← '+rem*10+') لنبدأ الأعشار.'});
  const seen=new Map();
  for(let i=0;i<limit&&rem!==0;i++){
   if(seen.has(rem)){cycle=seen.get(rem);stop='repeating';break;}
   seen.set(rem,i);
   const before=rem,part=before*10,q=Math.floor(part/d),product=q*d;
   rem=part-product;decimal+=q;
   const place=i===0?'الأعشار':i===1?'الأجزاء من مئة':i===2?'الأجزاء من ألف':'الخانة العشرية '+(i+1);
   steps.push({type:'decimal',place,before,part,q,product,remainder:rem,
    text:'نضيف صفرًا إلى يمين الباقي '+before+' فيصبح '+part+'. في منزلة '+place+
      ' نكتب '+q+'، ثم نطرح '+product+' فيبقى '+rem+'.'});
  }
  if(rem&&cycle<0&&decimal.length>=limit)stop='truncated';
  else if(!rem)stop='finished';
  if(cycle>=0)steps.push({type:'cycle',remainder:rem,
   text:'تكرر الباقي '+rem+' كما حدث سابقًا؛ لذلك تتكرر الأرقام العشرية ولا تنتهي القسمة. لا يجوز اعتبار الباقي صفرًا.'});
 }
 const quotient=whole+(decimal?'.'+decimal:'')+(stop==='repeating'||stop==='truncated'?'…':'');
 return {n,d,steps,whole,decimal,wholeRemainder,remainder:rem,quotient,cycle,stop,
  keyUsed:wholeRemainder>0,integerStages:digits.length,precision:limit};
}
const vdPreset11=[
 [325,4,'٣٢٥ ÷ ٤ : ينتهي بعد منزلتين عشريتين'],
 [372,4,'٣٧٢ ÷ ٤ : لا يحتاج إلى المفتاح'],
 [125,8,'١٢٥ ÷ ٨ : ثلاثة أرقام عشرية'],
 [217,6,'٢١٧ ÷ ٦ : ناتج عشري دوري'],
 [5,4,'٥ ÷ ٤ : آحاد ثم أعشار']
];
function divStep11(step,i,selected){
 const title=step.type==='integer'?step.place:step.type==='key'?'🔑 المفتاح (الفاصلة العشرية)':
  step.type==='decimal'?step.place:'تنبيه إلى تكرار الباقي';
 return '<article class="vd11-stage '+(step.type==='key'?'vd11-key ':'')+
 (selected?'active':'')+'" data-vd11-stage="'+i+'">'+
 '<header><span>المرحلة '+ar11(i+1)+'</span><strong>'+esc11(title)+'</strong></header>'+
 '<p>'+esc11(step.text)+'</p>'+
 (step.type==='integer'||step.type==='decimal'?'<div class="vd11-stage-math" dir="ltr">'+
 '<span>'+num11(step.part)+' ÷ '+num11(vd11.divisor)+' = '+num11(step.q)+'</span>'+
 '<span>− '+num11(step.product)+' = '+num11(step.remainder)+'</span></div>':'')+
 '</article>';
}
function divIllustration11(result,active){
 const integer=String(result.n),dec=result.decimal,hasKey=result.keyUsed;
 const display=num11(result.whole)+(hasKey?'<span class="vd11-decimal-key" title="المفتاح = الفاصلة العشرية">🔑 ٫</span>':'')+
 '<span>'+num11(dec)+'</span>'+(result.stop==='finished'?'':'…');
 const quotient=hasKey?result.whole+'.'+dec:result.whole;
 const highlight=active?.type==='key'?'vd11-highlight-key':'';
 return '<div class="vd11-long-division '+highlight+'">'+
 '<div class="vd11-quotient" dir="ltr"><span class="vd11-quotient-title">خارج القسمة</span>'+
 '<strong class="vd11-answer">'+display+'</strong></div>'+
 '<div class="vd11-bracket" dir="ltr"><strong>'+num11(result.d)+'</strong>'+
 '<div><span>'+num11(integer)+(hasKey?'<em>٫'+num11('0'.repeat(Math.max(1,dec.length)))+'</em>':'')+'</span></div></div>'+
 '<small>المقسوم عليه • المقسوم</small>'+
 '<div class="vd11-key-indicator">'+(hasKey?'🔑 المفتاح ظهر بعد انتهاء منازل المقسوم ووجود باقٍ':'لم نحتج إلى المفتاح؛ انتهت القسمة دون باقٍ بعد الآحاد.')+'</div></div>';
}
function divPage11(){
 let result;try{result=division11(vd11.dividend,vd11.divisor,vd11.places)}catch(e){return '<p>'+esc11(e.message)+'</p>'}
 vd11.step=Math.max(0,Math.min(result.steps.length-1,vd11.step));
 const active=result.steps[vd11.step];
 const status=result.stop==='finished'?'انتهت القسمة والباقي صفر.':
 result.stop==='repeating'?'ناتج عشري دوري: تكرر الباقي، لذلك تتكرر الأرقام.':
 'توقف العرض عند '+ar11(result.precision)+' خانات عشرية والباقي لم يصبح صفرًا.';
 const list=vd11.all?result.steps.map((s,i)=>divStep11(s,i,vd11.step===i)).join(''):
 divStep11(active,vd11.step,true);
 return '<div class="container vd11-page" dir="rtl"><header class="vd11-hero">'+
 '<span>🔑 مبادرة الأستاذ سعيد البريكي</span><h1>المفتاح للقسمة المطوّلة</h1>'+
 '<p>نُنهي مراحل المئات والعشرات والآحاد بحسب عدد خانات المقسوم. إذا بقي باقٍ نضع <b>مفتاح الفاصلة العشرية في خارج القسمة</b>؛ عندها نستطيع إضافة صفر إلى يمين الباقي واستكمال القسمة.</p></header>'+
 '<div class="vd11-preset-title">اختر مثالًا أو أدخل أعدادًا أخرى:</div>'+
 '<div class="vd11-presets">'+vdPreset11.map(([n,d,label])=>
 '<button type="button" data-vd11-preset="'+n+'-'+d+'" class="'+(vd11.dividend===n&&vd11.divisor===d?'selected':'')+'">'+label+'</button>').join('')+'</div>'+
 '<div class="vd11-inputs"><label>المقسوم<input type="number" id="vd11Dividend" value="'+esc11(vd11.dividend)+'" min="0" max="999999" step="1"></label>'+
 '<label>المقسوم عليه (١–٩)<input type="number" id="vd11Divisor" value="'+esc11(vd11.divisor)+'" min="1" max="9" step="1"></label>'+
 '<label>الحد الأقصى للخانات العشرية<select id="vd11Places">'+[2,4,6,8,10,12].map(n=>
 '<option value="'+n+'"'+(vd11.places===n?' selected':'')+'>'+ar11(n)+' خانات</option>').join('')+'</select></label>'+
 '<button type="button" id="vd11Calculate">ابدأ القسمة</button></div>'+
 '<div class="vd11-workspace"><div>'+divIllustration11(result,active)+
 '<div class="vd11-quotient-result"><span>الناتج:</span><strong dir="ltr">'+num11(result.quotient)+'</strong></div>'+
 '<p class="vd11-status">'+status+'</p></div>'+
 '<div class="vd11-stages"><div class="vd11-stages-heading"><h2>مراحل القسمة المطوّلة</h2>'+
 '<span>مرحلة '+ar11(vd11.step+1)+' من '+ar11(result.steps.length)+'</span></div>'+
 '<div class="vd11-progress"><span style="width:'+((vd11.step+1)/result.steps.length*100).toFixed(2)+'%"></span></div>'+
 '<div class="vd11-current">'+list+'</div>'+
 '<div class="vd11-controls"><button type="button" id="vd11Prev" '+(vd11.step===0?'disabled':'')+'>السابق</button>'+
 '<button type="button" id="vd11Next" '+(vd11.step>=result.steps.length-1?'disabled':'')+'>التالي</button>'+
 '<button type="button" id="vd11Toggle">'+(vd11.all?'إظهار المرحلة الحالية':'عرض جميع المراحل')+'</button></div></div></div>'+
 '<section class="vd11-principle"><h2>لماذا سمّينا الفاصلة العشرية «المفتاح»؟</h2>'+
 '<p>في مثال <b>٣٢٥ ÷ ٤</b> نبدأ من منزلة المئات (٣)، ثم العشرات (٢)، ثم الآحاد (٥). بعد القسمة الصحيحة يصبح الناتج <b>٨١</b> والباقي <b>١</b>. عند وضع الفاصلة العشرية في خارج القسمة، نستطيع إضافة صفر إلى يمين الباقي ليصير <b>١٠</b> ونقسمه على ٤ في خانة الأعشار، ثم نتابع حتى الباقي صفر فنحصل على <b>٨١٫٢٥</b>.</p>'+
 '<p>الفاصلة ليست عملية حسابية جديدة بحد ذاتها؛ إنها تُعلن الانتقال إلى المنازل العشرية. وإضافة الصفر إلى يمين الباقي في المرحلة التالية تعني ضرب الباقي في ١٠ مع الانتقال إلى منزلة عشرية أصغر.</p>'+
 '<p><b>تنبيه:</b> ليست كل عملية قسمة تنتهي؛ فإذا تكرر الباقي كان الناتج عشريًا دوريًا، وتُعرض علامة الاستمرار بدل الإيحاء بأن الباقي أصبح صفرًا.</p></section></div>';
}
const base11Generic=genericSection;
genericSection=function(page){
 if(page==='coordinate_ya')return coordinatePage11();
 if(page==='division_key')return divPage11();
 return base11Generic(page);
};
function vd11Refresh(){const app=document.getElementById('app');if(app&&state.page==='division_key')render()}
const base11Attach=attach;
attach=function(){
 base11Attach();
 document.querySelectorAll('[data-vi11-shape]').forEach(el=>el.addEventListener('click',()=>{
  vi11.shape=el.dataset.vi11Shape;render();
 }));
 document.querySelectorAll('[data-vi11-number]').forEach(el=>el.addEventListener('input',()=>{
  const n=Number(el.value);if(!Number.isInteger(n))return;
  const key=el.dataset.vi11Number;
  if(!['x','y','dx','dy'].includes(key))return;
  vi11[key]=Math.max(-8,Math.min(8,n));
  const chart=document.getElementById('vi11Graphic');if(chart)chart.innerHTML=geom11();
  const table=document.getElementById('vi11VertexTable');if(table)table.innerHTML=coordsTable11();
  const equation=document.querySelector('.vi11-equation p');if(equation)equation.textContent=
   'ي = '+ar11(vi11.dx)+' ، أ = '+ar11(vi11.dy);
 }));
 document.getElementById('vi11Reset')?.addEventListener('click',()=>{
  Object.assign(vi11,{shape:'triangle',x:-2,y:-1,dx:3,dy:2});render();
 });
 document.querySelectorAll('[data-vd11-preset]').forEach(el=>el.addEventListener('click',()=>{
  const [n,d]=el.dataset.vd11Preset.split('-').map(Number);
  Object.assign(vd11,{dividend:n,divisor:d,step:0,all:false});vd11Refresh();
 }));
 document.getElementById('vd11Calculate')?.addEventListener('click',()=>{
  const n=Number(document.getElementById('vd11Dividend')?.value),
   d=Number(document.getElementById('vd11Divisor')?.value);
  if(!Number.isInteger(n)||n<0||n>999999||!Number.isInteger(d)||d<1||d>9){
   window.alert('المقسوم عدد صحيح من ٠ حتى ٩٩٩٩٩٩، والمقسوم عليه عدد صحيح من ١ إلى ٩.');return;
  }
  Object.assign(vd11,{dividend:n,divisor:d,places:Number(document.getElementById('vd11Places')?.value)||8,step:0,all:false});
  vd11Refresh();
 });
 document.getElementById('vd11Prev')?.addEventListener('click',()=>{
  vd11.step=Math.max(0,vd11.step-1);vd11Refresh();
 });
 document.getElementById('vd11Next')?.addEventListener('click',()=>{
  vd11.step=Math.min(division11(vd11.dividend,vd11.divisor,vd11.places).steps.length-1,vd11.step+1);
  vd11Refresh();
 });
 document.getElementById('vd11Toggle')?.addEventListener('click',()=>{
  vd11.all=!vd11.all;vd11Refresh();
 });
};
