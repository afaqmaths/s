/* AFAQMATHS | Math Mixer initiative — original interactive illustrated teaser.
 * Two harmless public worked examples. The FULL mathematics mixer remains
 * under the existing supervisor approval / temporary-code server gate. */
'use strict';
const MX25_EXAMPLES=[
 {input:'٦',operator:'× ٤',output:'٢٤',formula:'٦ × ٤ = ٢٤',
  info:'أدخلنا العدد ٦، واختار الخلاط عملية الضرب في ٤؛ فكانت النتيجة ٢٤. نستخدم القاعدة نفسها مع أي عدد آخر.'},
 {input:'٣٦',operator:'÷ ٦',output:'٦',formula:'٣٦ ÷ ٦ = ٦',
  info:'أدخلنا العدد ٣٦، وحددنا القسمة على ٦؛ فكان الناتج ٦. القسمة تعكس الضرب، ويساعد الخلاط على اختبار صحة الإجابة.'}
];
const MX25={index:0,busy:false,done:false,timer:null};
function mx25MachineSvg(){
 return '<svg class="amx25-machine-art" viewBox="0 0 360 238" xmlns="http://www.w3.org/2000/svg" role="img" '+
 'aria-labelledby="amx25MachineTitle amx25MachineDesc">'+
 '<title id="amx25MachineTitle">خلاط الرياضيات التفاعلي</title>'+
 '<desc id="amx25MachineDesc">خلاط ذهبي وأزرق بوعاء شفاف وشفرات رياضية دوارة، يُدخل العدد ويطبّق العملية فتظهر النتيجة</desc>'+
 '<defs>'+
 '<linearGradient id="amx25Jar" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#edffff" stop-opacity=".96"/><stop offset=".52" stop-color="#83d4eb" stop-opacity=".54"/><stop offset="1" stop-color="#337db8" stop-opacity=".72"/></linearGradient>'+
 '<linearGradient id="amx25Body" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e6be71"/><stop offset=".45" stop-color="#ffedbb"/><stop offset="1" stop-color="#ad7327"/></linearGradient>'+
 '<linearGradient id="amx25Steel" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d6f5ff"/><stop offset=".5" stop-color="#7ca5c2"/><stop offset="1" stop-color="#d7f0fa"/></linearGradient>'+
 '<radialGradient id="amx25GoldGlow"><stop stop-color="#f8e2a6" stop-opacity=".82"/><stop offset="1" stop-color="#f8e2a6" stop-opacity="0"/></radialGradient>'+
 '<filter id="amx25Shadow" x="-30%" y="-30%" width="170%" height="170%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#173a60" flood-opacity=".26"/></filter></defs>'+
 '<ellipse cx="180" cy="222" rx="108" ry="10" fill="#13416e" opacity=".16"/>'+
 '<circle cx="178" cy="87" r="110" fill="url(#amx25GoldGlow)" opacity=".55"/>'+
 '<g class="amx25-machine" filter="url(#amx25Shadow)">'+
 '<path d="M112 39 H246 L231 135 Q222 153 199 155 H158 Q134 153 126 135 Z" fill="url(#amx25Jar)" stroke="#d2f7ff" stroke-width="4"/>'+
 '<path d="M131 60 H228 L219 130 Q213 141 199 141 H157 Q143 140 140 130 Z" fill="#5a9bdb" opacity=".24"/>'+
 '<path d="M112 39 H246 L242 49 H116 Z" fill="#acd8eb" opacity=".55"/>'+
 '<path d="M111 39 V30 Q111 24 119 24 H240 Q247 24 247 30 V39 Z" fill="#2d5f88" stroke="#d2eaf2" stroke-width="3"/>'+
 '<rect x="158" y="14" width="43" height="14" rx="6" fill="url(#amx25Steel)" stroke="#24567e" stroke-width="2"/>'+
 '<path d="M147 56 L156 128 M211 52 L207 123" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".47"/>'+
 '<path d="M244 51 Q281 46 271 78 Q266 99 243 95" fill="none" stroke="#d7ebf3" stroke-width="10" stroke-linecap="round"/>'+
 '<path d="M244 51 Q281 46 271 78 Q266 99 243 95" fill="none" stroke="#44789b" stroke-width="3"/>'+
 '<g class="amx25-bubbles" fill="#f8df8b" opacity=".92">'+
 '<circle class="amx25-bubble b1" cx="161" cy="73" r="5"/>'+
 '<circle class="amx25-bubble b2" cx="190" cy="93" r="6"/>'+
 '<circle class="amx25-bubble b3" cx="218" cy="79" r="4"/>'+
 '<circle class="amx25-bubble b4" cx="174" cy="112" r="3"/>'+
 '<text x="169" y="80" font-size="14" text-anchor="middle" font-weight="800" fill="#1b4c77">π</text>'+
 '<text x="199" y="119" font-size="13" text-anchor="middle" font-weight="900" fill="#1b4c77">÷</text>'+
 '</g>'+
 '<path d="M171 114 V157" stroke="#d3edfb" stroke-width="5"/>'+
 '<g transform="translate(180 111)"><g class="amx25-blades">'+
 '<path d="M-36 -7 Q-21 -19 0 -2 Q19 -21 36 -7 Q18 -3 7 5 Q19 21 7 27 Q-3 11 -6 5 Q-23 20 -35 10 Q-23 3 -6 -2Z" fill="url(#amx25Steel)" stroke="#2d7398" stroke-width="2"/>'+
 '<circle r="7" fill="#e9bb60" stroke="#fff6cb" stroke-width="3"/>'+
 '</g></g>'+
 '<rect x="127" y="155" width="107" height="66" rx="19" fill="url(#amx25Body)" stroke="#b67d2e" stroke-width="3"/>'+
 '<path d="M143 169 H219" stroke="#fff7d5" stroke-width="4" opacity=".8" stroke-linecap="round"/>'+
 '<rect x="147" y="178" width="68" height="27" rx="8" fill="#103d6e" stroke="#77bce4" stroke-width="2"/>'+
 '<text class="amx25-screen-text" x="181" y="195" fill="#ecfcff" font-size="12" font-weight="900" font-family="Tahoma,Arial,sans-serif" text-anchor="middle">AFAQ MATH</text>'+
 '<circle class="amx25-motor-lamp" cx="221" cy="208" r="5" fill="#91dabf" stroke="#fff4d3" stroke-width="2"/>'+
 '</g>'+
 '<g class="amx25-flying-math" fill="#d7a450" font-family="Tahoma,Arial,sans-serif" font-weight="900" font-size="18">'+
 '<text x="72" y="91">×</text><text x="272" y="113">+</text><text x="98" y="144">√</text>'+
 '<text x="254" y="155">∑</text><text x="82" y="50">½</text><text x="274" y="55">%</text></g>'+
 '</svg>';
}
function mx25Html(){
 const sample=MX25_EXAMPLES[MX25.index];
 return '<section class="amx25-showcase" aria-labelledby="amx25Heading" dir="rtl">'+
 '<header class="amx25-head"><span class="amx25-kicker">✨ ابتكار الأستاذ سعيد • نموذج مصغّر تفاعلي</span>'+
 '<h3 id="amx25Heading">خلاط الرياضيات <small lang="en" dir="ltr">MATH MIXER</small></h3>'+
 '<p>نضع العدد في المدخل، ونختار العملية، فيخلطها الجهاز ليُظهر الناتج والتفسير.</p></header>'+
 '<div class="amx25-scene">'+mx25MachineSvg()+
 '<div class="amx25-sparkles" aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span></div></div>'+
 '<div class="amx25-flow" aria-label="خطوات خلاط الرياضيات">'+
 '<div class="amx25-flow-step amx25-input"><span lang="en">INPUT</span><small>المدخلات</small>'+
 '<strong data-amx25-input>'+sample.input+'</strong></div>'+
 '<div class="amx25-flow-arrow" aria-hidden="true">←</div>'+
 '<div class="amx25-flow-step amx25-operation"><span lang="en">OPERATION</span><small>العملية</small>'+
 '<strong data-amx25-operation>'+sample.operator+'</strong></div>'+
 '<div class="amx25-flow-arrow" aria-hidden="true">←</div>'+
 '<div class="amx25-flow-step amx25-output"><span lang="en">OUTPUT</span><small>المخرجات</small>'+
 '<strong data-amx25-output>'+(MX25.done?sample.output:'؟')+'</strong></div></div>'+
 '<div class="amx25-choose" role="group" aria-label="اختر المثال المراد تشغيله">'+
 MX25_EXAMPLES.map((x,i)=>'<button type="button" data-amx25-example="'+i+'" '+
 'aria-pressed="'+(i===MX25.index)+'"'+(MX25.busy?' disabled':'')+'>'+
 'مثال '+(i===0?'١':'٢')+' <span dir="ltr">'+(i===0?'6 × 4':'36 ÷ 6')+'</span></button>').join('')+'</div>'+
 '<div class="amx25-controls">'+
 '<button type="button" class="amx25-run" data-amx25-run'+(MX25.busy?' disabled':'')+'>'+
 (MX25.busy?'⚙️ جارٍ خلط الأعداد ...':MX25.done?'↻ إعادة التشغيل':'▶ تشغيل الخلاط')+'</button>'+
 '<span class="amx25-run-status" data-amx25-status aria-live="polite">'+
 (MX25.busy?'يجري تطبيق العملية ...':MX25.done?'✓ اكتملت العملية':'جاهز للتشغيل')+'</span></div>'+
 '<div class="amx25-example-feedback" role="status" aria-live="polite" data-amx25-feedback>'+
 (MX25.done?'<strong>'+sample.formula+'</strong> '+sample.info:
 '<strong>الفكرة:</strong> نبدأ بالمدخل، ونُجري العملية المحددة، ثم نقرأ المخرج. اضغط «تشغيل الخلاط» لمشاهدة النتيجة.')+
 '</div>'+
 '<div class="amx25-summary"><strong>💡 ماذا نتعلّم؟</strong>'+
 '<p>خلاط الرياضيات نموذج للقاعدة الرياضية: <b>مدخلات ← عملية ← مخرجات</b>؛ يساعد على اكتشاف الأنماط، والتحقق من النتائج، وتعميم القواعد على دروس مختلفة.</p></div>'+
 '<p class="amx25-cta-note">قم بالدخول لتشغيل خلاط الرياضيات و تطبيقه على جميع الدروس</p>'+
 '<button type="button" class="amx25-access" data-route="mixer">🔐 طلب تصريح دخول لتشغيل الخلاط الكامل</button>'+
 '<small class="amx25-permission">العرضان أعلاه للتوضيح فقط؛ استخدام التطبيق الكامل يحتاج موافقة مشرف المنصة ورمز الدخول المؤقت.</small>'+
 '</section>';
}
const mx25OldTeacherPortal=afaqMidTeacherPortal;
afaqMidTeacherPortal=function(){
 let html=mx25OldTeacherPortal();
 if(!html.includes('data-route="mixer"')||html.includes('class="amx25-showcase"'))return html;
 // Replace only the former small mixer entry, preserving the other three initiatives.
 html=html.replace(/<button type="button" class="afaq-mid-initiative-link" data-route="mixer"[\s\S]*?<\/button>/,'');
 return html.replace('<div class="afaq-mid-initiative-links">',mx25Html()+'<div class="afaq-mid-initiative-links">');
};
const mx25OldInitArt=initArt;
initArt=function(row){
 if(row?.route!=='mixer'&&row?.icon!=='mixer')return mx25OldInitArt(row);
 return '<span class="amx25-mini-art" role="img" aria-label="خلاط الرياضيات؛ مدخلات وعملية ومخرجات">'+
 '<svg viewBox="0 0 106 112" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+
 '<path d="M25 24H81L73 72Q69 82 53 82T33 72Z" fill="#89d0e7" stroke="#3171a0" stroke-width="4"/>'+
 '<rect x="23" y="19" width="61" height="9" rx="4" fill="#234e79"/>'+
 '<rect x="34" y="6" width="39" height="14" rx="5" fill="#f3d89d"/>'+
 '<path d="M42 57L64 46M45 47L64 58" stroke="#f2ce76" stroke-width="5" stroke-linecap="round"/>'+
 '<rect x="28" y="81" width="51" height="25" rx="8" fill="#deb66b" stroke="#b27d37" stroke-width="2"/>'+
 '<rect x="37" y="88" width="33" height="12" rx="4" fill="#123c69"/>'+
 '<text x="53" y="97" text-anchor="middle" font-size="7" fill="white" font-family="Arial">AFAQ</text></svg>'+
 '<small lang="en" dir="ltr">IN · OP · OUT</small></span>';
};
function mx25SetSample(i){
 if(MX25.busy||i===MX25.index)return;
 MX25.index=i;MX25.done=false;
 const box=document.querySelector('.amx25-showcase');
 if(box)mx25Paint(box);
}
function mx25Paint(box){
 if(!box)return;
 const x=MX25_EXAMPLES[MX25.index];
 const put=(selector,text)=>{const el=box.querySelector(selector);if(el)el.textContent=text};
 box.classList.toggle('amx25-running',MX25.busy);
 box.classList.toggle('amx25-finished',MX25.done&&!MX25.busy);
 put('[data-amx25-input]',x.input);
 put('[data-amx25-operation]',x.operator);
 put('[data-amx25-output]',MX25.done?x.output:'؟');
 put('[data-amx25-status]',MX25.busy?'يجري تطبيق العملية ...':MX25.done?'✓ اكتملت العملية':'جاهز للتشغيل');
 const feedback=box.querySelector('[data-amx25-feedback]');
 if(feedback){
  feedback.textContent='';
  const bold=document.createElement('strong');
  bold.textContent=MX25.done?x.formula:MX25.busy?'⚙️ تنفيذ العملية...':'الفكرة:';
  feedback.appendChild(bold);
  feedback.appendChild(document.createTextNode(' '+(MX25.done?x.info:MX25.busy?'تدور شفرات الخلاط لمعالجة المدخلات وفق العملية المختارة.':
   'نبدأ بالمدخل، ونُجري العملية المحددة، ثم نقرأ المخرج. اضغط «تشغيل الخلاط» لمشاهدة النتيجة.')));
 }
 box.querySelectorAll('[data-amx25-example]').forEach(b=>{
  b.setAttribute('aria-pressed',String(Number(b.dataset.amx25Example)===MX25.index));
  b.disabled=MX25.busy;
 });
 const run=box.querySelector('[data-amx25-run]');
 if(run){run.disabled=MX25.busy;run.textContent=MX25.busy?'⚙️ جارٍ خلط الأعداد ...':MX25.done?'↻ إعادة التشغيل':'▶ تشغيل الخلاط'}
}
function mx25Start(){
 if(MX25.busy)return;
 MX25.busy=true;MX25.done=false;
 document.querySelectorAll('.amx25-showcase').forEach(mx25Paint);
 if(MX25.timer!==null)window.clearTimeout(MX25.timer);
 MX25.timer=window.setTimeout(()=>{
  MX25.busy=false;MX25.done=true;MX25.timer=null;
  document.querySelectorAll('.amx25-showcase').forEach(mx25Paint);
 },1500);
}
const mx25OldAttach=attach;
attach=function(){
 mx25OldAttach();
 document.querySelectorAll('[data-amx25-example]').forEach(button=>{
  button.addEventListener('click',()=>mx25SetSample(Number(button.dataset.amx25Example)));
 });
 document.querySelectorAll('[data-amx25-run]').forEach(button=>{
  button.addEventListener('click',mx25Start);
 });
};
