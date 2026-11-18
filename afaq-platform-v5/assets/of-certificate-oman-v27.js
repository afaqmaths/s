/* Oman-flag A4 math certificate; faithful to the approved ornamental sample.
   This is the existing authenticated gradebook data, without sample names/grades. */
'use strict';
(function(){
 if(typeof ofCertificateDocument!=='function')return;
 const safe=v=>ofSafe(v??''),num=v=>ofNumber(v);
 const mark=v=>v===null||v===undefined||v===''?'—':num(v);
 const shorten=(v,max=190)=>{
  const s=String(v??'').replace(/\s+/g,' ').trim();
  if(s.length<=max)return s;
  const text=s.slice(0,max-1),breakAt=text.lastIndexOf(' ');
  return text.slice(0,breakAt>max-26?breakAt:max-1).trimEnd()+'…';
 };
 const schoolIcon='<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M28 48V14h11v7h9v-7h11v7h10v-7h7v34" stroke="#23653c" stroke-width="3" fill="none"/><path d="M39 48V33h23v15" fill="none" stroke="#b42028" stroke-width="2.8"/><path d="M9 68Q28 51 50 66Q72 51 91 68L85 86Q69 76 50 86Q31 76 15 86Z" fill="#fff9ec" stroke="#187345" stroke-width="3"/><path d="M50 66V86M14 72Q32 65 47 76M86 72Q68 65 53 76" fill="none" stroke="#ae252b" stroke-width="2.5"/></svg>';
 const minIcon='<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="none" stroke="#c6262c" stroke-linecap="round"><path d="M10 84Q49 44 85 13M90 84Q50 44 14 13" stroke-width="5"/><path d="M14 12l-6 13 14-3M86 12l6 13-14-3M9 84l12 3-4-12M91 84l-12 3 4-12" stroke-width="2.5"/><path d="M48 23l9 10v29Q56 73 50 80Q42 72 42 62V33Z" fill="#fff9ec" stroke-width="3"/><path d="M49 32V72M42 48H57M40 27l10-15 11 15" stroke-width="2.5"/></g></svg>';
 let visionDots='';
 for(let ring=0;ring<8;ring++)for(let i=0;i<11;i++){
  const angle=(-2.7+i*.39+ring*.04),r=13+ring*4+i*.55,x=48+Math.cos(angle)*r,y=54+Math.sin(angle)*r;
  visionDots+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(1.1+ring*.19).toFixed(1)+'" fill="'+(ring<3?'#a54899':ring<5?'#776ab3':'#24a4b8')+'"/>';
 }
 const visionIcon='<svg viewBox="0 0 100 95" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+visionDots+'</svg>';
 function assessment(student,notes,show){
  const m=student.marks||{};
  let got=0,available=0;
  OF_FIELDS.forEach(([key,,max])=>{
   if(m[key]===null||m[key]===undefined||m[key]==='')return;
   const n=Number(m[key]);if(Number.isFinite(n)&&n>=0&&n<=max){got+=n;available+=max}
  });
  const percent=available?got*100/available:null,complete=ofCourse(m).total!==null;
  let text;
  if(percent===null)text='نرجو للطالب انطلاقة موفقة في الرياضيات، مع التشجيع على المواظبة والمشاركة في الأنشطة التعليمية.';
  else if(percent>=90)text='أظهر الطالب تفوقًا في الرياضيات؛ نشجعه على مواصلة الاجتهاد والإبداع والمحافظة على مستواه المتميز.';
  else if(percent>=80)text='أظهر الطالب أداءً جيدًا جدًا في الرياضيات، ونشجعه على الاستمرار في التدريب وصولًا إلى مزيد من التفوق.';
  else if(percent>=65)text='يحقق الطالب مستوى جيدًا في الرياضيات، ونوصي بمواصلة التدريب والتركيز للارتقاء بمستواه.';
  else if(percent>=50)text='يحتاج الطالب إلى تطوير بعض المهارات الرياضية ومتابعة التدريبات بانتظام لتعزيز تحصيله.';
  else text='يحتاج الطالب إلى دعم تعليمي ومتابعة منتظمة ومراجعة المهارات الأساسية لتحسين تحصيله في الرياضيات.';
  if(!complete&&percent!==null)text='تشير الدرجات المرصودة حتى الآن إلى ما يلي: '+text;
  if(show&&notes.some(n=>/التحدث|تشويش|عدم\s*(?:الانضباط|الالتزام|متابعة)|إهمال|تأخر|إحالة|استدعاء|مخالفة|السلوك|مقاطعة|تكرار\s*الغياب/.test(String(n.description||'')+' '+String(n.action_taken||''))))
   text+=' مع التأكيد على الالتزام بالتعليمات الصفية والتعاون مع الأسرة والمدرسة.';
  return shorten(text,285);
 }
 function notesBox(student,notes,show){
  if(!show)return '';
  const remark=String(student.marks?.remarks||'').trim();
  if(!notes.length&&!remark)return '';
  let parts=[];
  if(remark)parts.push('الرصد: '+shorten(remark,90));
  notes.slice(0,2).forEach(n=>parts.push((n.category==='daily'?'يومية':'سلوكية')+': '+shorten(n.description,125)));
  const summary=shorten(parts.join(' • '),250),len=summary.length;
  const font=len>215?9:len>160?10:len>105?11:12;
  return '<section class="oc-notes"><div class="oc-ribbon oc-red">الملاحظات والمتابعة التربوية</div>'+
    '<div class="oc-notes-field"><p style="font-size:'+font+'px">'+safe(summary)+'</p></div></section>';
 }
 function signature(title,fullname){return '<div class="oc-sign"><b>'+title+'</b><strong>'+fullname+'</strong><span>التوقيع : ...........................</span></div>'}
 ofCertificateDocument=function(student){
  if(!student)return '';
  const m=student.marks||{},calc=ofCourse(m),serial=Number(student.serial_no);
  const shown=!ofState.behavior.hidden?.[ofState.className+'|'+serial];
  const notes=shown&&ofEdit()?ofBehaviorNotes(student):[];
  const issued=new Intl.DateTimeFormat('ar-OM',{dateStyle:'short',timeZone:'Asia/Muscat'}).format(new Date());
  const rows=OF_FIELDS.map(([id,label,max])=>'<tr><td>'+safe(label)+'</td><td>'+mark(m[id])+'</td><td>'+num(max)+'</td></tr>').join('');
  const table='<table class="oc-grades"><thead><tr><th>البند</th><th>الدرجة</th><th>من</th></tr></thead><tbody>'+
    '<tr class="oc-diagnostic"><td>الاختبار التشخيصي</td><td>'+mark(m.diagnostic_score)+'</td><td>١٠</td></tr>'+
    rows+'<tr class="oc-total"><td>المجموع النهائي</td><td>'+(calc.total===null?'—':num(calc.total))+'</td><td>١٠٠</td></tr>'+
    '<tr class="oc-level"><td>المستوى</td><td colspan="2">'+(calc.level?safe(calc.level):'—')+'</td></tr></tbody></table>';
  const evaluation=assessment(student,notes,shown),noteSection=notesBox(student,notes,shown);
  const school=safe(student.class_name||ofState.className);
  const heading='<div class="oc-heading"><div class="oc-logos">'+
     '<div class="oc-logo">'+schoolIcon+'<strong>مدرسة الحسين بن علي<br>للتعليم الأساسي</strong></div>'+
     '<div class="oc-logo oc-ministry">'+minIcon+'<strong>وزارة التربية والتعليم</strong></div>'+
     '<div class="oc-logo oc-vision">'+visionIcon+'<strong>رؤية عُمان 2040</strong></div>'+
    '</div><div class="oc-ministry-lines"><b>سلطنة عُمان</b><b>وزارة التربية والتعليم</b>'+
    '<b>المديرية العامة للتربية والتعليم لمحافظة شمال الباطنة</b>'+
    '<b>مدرسة الحسين بن علي للتعليم الأساسي</b></div>'+
    '<div class="oc-divider">❖</div></div>';
  const info='<div class="oc-info">'+
    '<div><b>اسم الطالب :</b><span>'+safe(student.full_name||'—')+'</span></div>'+
    '<div><b>رقم الطالب :</b><span>'+num(serial)+'</span></div>'+
    '<div><b>الصف والشعبة :</b><span>'+school+'</span></div>'+
    '<div><b>الفصل الدراسي :</b><span>'+ofTerm(ofState.term)+'</span></div>'+
    '<div class="oc-date"><b>تاريخ الإصدار :</b><span>'+safe(issued)+'</span></div></div>';
  const foot='<div class="oc-foot">'+signature('معلم المادة :','سعيد جمعة عبدالله البريكي')+
    signature('مدير المدرسة :','عبدالله علي العيسائي')+
    '<div class="oc-stamp"><b>الختم الرسمي</b><i></i></div></div>';
const style="<style>\n@page{size:A4 portrait;margin:0}\n*{box-sizing:border-box}html,body{margin:0;padding:0;width:210mm;background:#fff}\nbody{direction:rtl;font:13px/1.4 Tahoma,Arial,sans-serif;color:#1b2923;-webkit-print-color-adjust:exact;print-color-adjust:exact}\n.oc-page{width:210mm;height:297mm;position:relative;margin:0 auto;overflow:hidden;background:#fffaf1;isolation:isolate}\n.oc-page:before{content:\"\";position:absolute;inset:2.9mm;border:1.3mm solid #b92229;outline:.65mm solid #106537;outline-offset:-3.1mm;pointer-events:none;z-index:1}\n.oc-page:after{content:\"\";position:absolute;inset:6.5mm;border:.35mm solid #bb945e;border-radius:3mm;pointer-events:none;z-index:1}\n.oc-pattern{position:absolute;inset:8mm;opacity:.22;z-index:0;pointer-events:none;background:repeating-linear-gradient(45deg,transparent 0 14px,#c7ad7c45 15px,transparent 16px 29px),repeating-linear-gradient(-45deg,transparent 0 14px,#c7ad7c45 15px,transparent 16px 29px)}\n.oc-flag{position:absolute;width:70mm;height:16mm;pointer-events:none;z-index:2;background:linear-gradient(to bottom,#bd2330 0 36%,#fff 36% 61%,#087242 61%)}\n.oc-flag-top{right:-21mm;top:1mm;transform:rotate(35deg)}\n.oc-flag-bottom{left:-23mm;bottom:3mm;transform:rotate(35deg)}\n.oc-knot{position:absolute;width:15mm;height:15mm;border:1mm double #b71e29;z-index:2;pointer-events:none}\n.oc-knot:before{content:\"\";position:absolute;inset:3mm;border:.85mm solid #0a713b;transform:rotate(45deg)}\n.oc-knot.tr{right:3mm;top:3mm}.oc-knot.tl{left:3mm;top:3mm}.oc-knot.br{right:3mm;bottom:3mm}.oc-knot.bl{left:3mm;bottom:3mm}\n.oc-content{position:relative;z-index:3;display:flex;flex-direction:column;height:100%;padding:8.5mm 13mm 10mm}\n.oc-heading{text-align:center;flex:none;margin-bottom:1mm}\n.oc-logos{display:grid;grid-template-columns:1fr 1.15fr 1fr;align-items:start;gap:3mm;height:26mm}\n.oc-logo{min-width:0;display:flex;flex-direction:column;align-items:center;gap:0}\n.oc-logo svg{width:19mm;height:18mm;display:block}\n.oc-logo strong{font-size:10px;line-height:1.3}\n.oc-ministry svg{width:18mm;height:18mm}\n.oc-vision svg{width:20mm}.oc-vision strong{font-size:12px}\n.oc-ministry-lines{font-size:11.2px;line-height:1.4;display:flex;align-items:center;flex-direction:column;white-space:nowrap}\n.oc-ministry-lines b:first-child{font-size:13px}\n.oc-divider{color:#b3292c;font-size:14px;display:flex;justify-content:center;align-items:center;height:4mm}\n.oc-divider:before,.oc-divider:after{content:\"\";border-top:1px solid #ac3333;width:25mm;margin:0 4mm}\n.oc-title{margin:1.5mm 4mm 1.2mm;padding:1.8mm 2mm 1mm;background:#fff7e6;border:2px double #aa2930;border-radius:45% 45% 18px 18px/30% 30% 12px 12px;color:#a51e22;font-weight:950;font-size:18px;text-align:center;position:relative}\n.oc-title:before,.oc-title:after{content:\"❖\";position:absolute;top:20%;font-size:22px;color:#b62727}\n.oc-title:before{right:-6mm}.oc-title:after{left:-6mm}\n.oc-year{margin:0 auto 2mm;background:#f4f9ef;border:1px solid #36824b;border-radius:20px;padding:1mm 9mm;font-size:12px;font-weight:900}\n.oc-info{display:grid;grid-template-columns:1fr 1fr;gap:1mm;border:1px solid #c49b6e;border-radius:3mm;background:#fffbf3;padding:1mm 1.5mm;margin-bottom:2.2mm}\n.oc-info>div{border:1px solid #87a17e;border-radius:20px;padding:.8mm 2mm;display:flex;align-items:center;gap:5px;min-width:0;min-height:8mm;white-space:nowrap;font-size:10.8px}\n.oc-info b{color:#a7242a;flex:none}.oc-info span{font-weight:900;overflow:hidden;text-overflow:ellipsis}\n.oc-info .oc-date{grid-column:1/-1;justify-content:center}\n.oc-grades{width:94%;margin:0 auto;border-collapse:collapse;table-layout:fixed;flex:none;font-size:11px;line-height:1.12}\n.oc-grades th,.oc-grades td{border:1px solid #657369;padding:1.15mm 2mm;white-space:nowrap}\n.oc-grades th{text-align:center;background:#0c5a38!important;color:white!important;font-size:12.7px;height:7mm}\n.oc-grades th:first-child{width:59%}.oc-grades th:nth-child(2){width:20%}.oc-grades th:nth-child(3){width:21%}\n.oc-grades tbody tr{height:6.2mm;background:#fffdf8}\n.oc-grades tbody tr:nth-child(even){background:#f8f4e8}\n.oc-grades td:first-child{font-weight:850}\n.oc-grades td:nth-child(2),.oc-grades td:nth-child(3){text-align:center;font-weight:900}\n.oc-grades .oc-total{background:#dcefdc!important;font-weight:950;height:7mm;font-size:12.2px}\n.oc-grades .oc-level{background:#fff0ed!important;font-weight:900;height:6.4mm}\n.oc-note-guide{text-align:center;margin:1mm 2mm 0;font-size:8px;line-height:1.3;color:#7b6c58}\n.oc-bottom{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:flex-end;gap:2mm}\n.oc-ribbon{position:relative;width:max-content;max-width:90%;margin:0 auto -1.5mm;padding:.8mm 8mm;color:white;font-size:12.5px;font-weight:950;border-radius:20px;z-index:1}\n.oc-ribbon:before,.oc-ribbon:after{content:\"✥\";position:absolute;top:50%;transform:translateY(-50%);color:#b82c31;font-size:16px}\n.oc-ribbon:before{right:-6mm}.oc-ribbon:after{left:-6mm}\n.oc-red{background:#b3292a!important}.oc-green{background:#12683d!important}\n.oc-notes-field{border:1.3px solid #ac2a29;border-radius:4mm;height:19.5mm;display:flex;align-items:center;justify-content:center;padding:3mm 5mm 1.5mm;background:#fff9ee}\n.oc-notes-field p{margin:0;width:100%;font-weight:850;line-height:1.42;text-align:center;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden;overflow-wrap:anywhere}\n.oc-evaluation-field{border:1.2px solid #1f7142;border-radius:4mm;height:19.5mm;display:flex;align-items:center;justify-content:center;padding:3mm 5mm 1.5mm;background:#f3f7ea}\n.oc-evaluation-field p{font-weight:800;font-size:11.1px;line-height:1.48;margin:0;text-align:center;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}\n.oc-foot{display:grid;grid-template-columns:1fr 1fr .72fr;border:1px solid #538153;border-radius:3mm;background:#fffaf0;padding:1.7mm 1mm;min-height:21mm}\n.oc-sign{display:flex;align-items:center;flex-direction:column;justify-content:space-between;padding:0 1mm;text-align:center;min-width:0}\n.oc-sign:not(:nth-child(2)){border-left:1px solid #539053}\n.oc-sign b,.oc-stamp b{font-size:10.5px;color:#a9252b}\n.oc-sign strong{font-size:10px;line-height:1.1;white-space:normal}.oc-sign span{font-size:8.5px;white-space:nowrap}\n.oc-stamp{display:flex;align-items:center;flex-direction:column;gap:1.5mm}\n.oc-stamp i{display:block;width:14mm;height:11mm;border:1px solid #478453;border-radius:50%}\n.oc-tools{display:flex;justify-content:center;margin:10px;gap:9px}\n.oc-tools button{border:0;border-radius:8px;background:#137247;color:#fff;padding:11px 23px;cursor:pointer}\n@media screen{body{background:#e0eaed}.oc-page{box-shadow:0 8px 27px #143a4f35}}\n@media print{body{background:#fff}.oc-page{margin:0;box-shadow:none}.oc-tools{display:none!important}}\n</style>";

  const documentHTML='<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">'+
    '<meta name="viewport" content="width=device-width,initial-scale=1">'+
    '<title>شهادة رصد درجات الرياضيات — '+safe(student.full_name||'الطالب')+'</title>'+
    style+'</head><body><main class="oc-page" role="document">'+
    '<div class="oc-pattern"></div>'+ "<svg viewBox=\"0 0 840 240\" xmlns=\"http://www.w3.org/2000/svg\" aria-hidden=\"true\" style=\"position:absolute;bottom:16mm;left:6mm;width:196mm;height:62mm;opacity:.22;z-index:0;pointer-events:none\"><path d=\"M0 210 L58 160 L121 198 L173 152 L250 201 L340 175 M510 205 L570 148 L640 198 L711 158 L840 212\" fill=\"none\" stroke=\"#b08b5a\" stroke-width=\"7\"/><path d=\"M10 208 L20 113 L99 113 L109 208 Z M35 112 L35 86 L55 86 L55 94 L70 94 L70 86 L90 86 L90 112\" fill=\"#d2b083\" stroke=\"#9c784f\" stroke-width=\"3\"/><path d=\"M48 210 V176 Q60 164 74 176 V210 M20 139 H100 M20 162 H100\" fill=\"none\" stroke=\"#a18055\" stroke-width=\"3\"/><path d=\"M776 216 V106\" stroke=\"#718e5b\" stroke-width=\"6\"/><path d=\"M777 119 Q730 56 697 86 Q739 86 777 119 M777 119 Q824 54 840 89 Q801 83 777 119 M777 119 Q716 110 720 148 Q738 118 777 119 M777 119 Q832 114 835 145 Q808 118 777 119\" fill=\"none\" stroke=\"#6e925b\" stroke-width=\"5\"/></svg>" +'<div class="oc-flag oc-flag-top"></div><div class="oc-flag oc-flag-bottom"></div>'+
    '<div class="oc-knot tr"></div><div class="oc-knot tl"></div><div class="oc-knot br"></div><div class="oc-knot bl"></div>'+
    '<div class="oc-content">'+heading+
    '<div class="oc-title">شهادة رصد درجات الطالب في مادة الرياضيات</div>'+
    '<div class="oc-year">العام الدراسي ٢٠٢٦ / ٢٠٢٧ م</div>'+info+table+
    '<p class="oc-note-guide">الاختبار التشخيصي خارج المجموع. تظهر البنود غير المرصودة بعلامة (—) ولا يُحسب الإجمالي النهائي إلا عند اكتمال جميع عناصره.</p>'+
    '<div class="oc-bottom">'+noteSection+
    '<section class="oc-evaluation"><div class="oc-ribbon oc-green">التقييم العام</div>'+
    '<div class="oc-evaluation-field"><p>'+safe(evaluation)+'</p></div></section>'+foot+
    '</div></div></main>'+
    '<div class="oc-tools"><button type="button" onclick="window.print()">🖨️ طباعة / حفظ PDF</button></div>'+
    '</body></html>';
  return documentHTML;
 };
})();
