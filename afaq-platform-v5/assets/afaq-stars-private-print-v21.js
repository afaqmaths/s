/* Private credential registers: no student passwords are stored in public GitHub files. */
'use strict';
const afaqPinPrint={className:'السادس / ٤',pages:1,students:null,token:'',loadedClass:'',loading:false,error:'',message:''};
const afaqPinSite='https://afaqmaths.github.io/s/afaq-platform-v5/';
const afaqPinQR='https://afaqmaths.github.io/s/afaq-platform-v5/assets/afaq-platform-qr-v22.svg';
const afaqPinSafe=s=>afaqStarsEsc(s);
const afaqPinDisplay=s=>s.pin_status==='changed'?'غيّره الطالب':(s.pin_status==='original'&&s.pin?s.pin:'غير متاح');
function afaqPinClear(){afaqPinPrint.students=null;afaqPinPrint.token='';afaqPinPrint.loadedClass='';afaqPinPrint.error='';afaqPinPrint.message=''}
function afaqPinPanel(){
 if(!afaqStarsSupervisor())return '';
 const ready=afaqPinPrint.students&&afaqPinPrint.loadedClass===afaqPinPrint.className&&afaqPinPrint.token===auth.token;
 const classes=['السادس / ٤','السادس / ٥','السادس / ٦'];
 return '<section class="afaq-stars-panel afaq-pin-print-panel" aria-labelledby="afaqPinPrintHeading">'+
 '<header class="afaq-pin-header"><span aria-hidden="true">🖨️</span><div><h2 id="afaqPinPrintHeading">كشوف بيانات دخول الطلاب مع الرقم السري</h2>'+
 '<p>كشف أفقي للشعبة في صفحة واحدة أو صفحتين، مع كود دخول المنصة ورابطها؛ للمعاينة والطباعة وحفظ PDF أو تنزيل ملف Excel.</p></div></header>'+
 '<div class="afaq-pin-toolbar"><label>الشعبة<select id="afaqPinPrintClass">'+classes.map(x=>
 '<option value="'+afaqPinSafe(x)+'"'+(afaqPinPrint.className===x?' selected':'')+'>'+afaqPinSafe(x)+'</option>').join('')+'</select></label>'+
 '<label>عدد الصفحات<select id="afaqPinPrintPages"><option value="1"'+(afaqPinPrint.pages===1?' selected':'')+'>صفحة أفقية واحدة</option>'+
 '<option value="2"'+(afaqPinPrint.pages===2?' selected':'')+'>صفحتان أفقيتان - أوضح</option></select></label>'+
 '<button id="afaqPinShow" type="button" class="afaq-pin-reveal"'+(afaqPinPrint.loading?' disabled':'')+'>'+
 (afaqPinPrint.loading?'جارٍ التحميل ...':ready?'تحديث البيانات':'🔐 عرض بيانات الدخول')+'</button></div>'+
 '<p class="afaq-pin-privacy">🔒 الأرقام السرية خاصة بالمشرف الرئيسي فقط. تجنّب عرضها أمام الطلبة، ووزّع بيانات كل طالب بصورة فردية.</p>'+
 (afaqPinPrint.error?'<p class="afaq-pin-error" role="alert">'+afaqPinSafe(afaqPinPrint.error)+'</p>':'')+
 (afaqPinPrint.message?'<p class="afaq-pin-status" role="status">'+afaqPinSafe(afaqPinPrint.message)+'</p>':'')+
 (ready?'<div class="afaq-pin-ready">'+
 '<div class="afaq-pin-actions"><button type="button" id="afaqPinPrintNow">🖨️ طباعة / حفظ PDF</button>'+
 '<button type="button" id="afaqPinDownloadCSV">⬇ تنزيل Excel (CSV)</button>'+
 '<button type="button" id="afaqPinHide">إخفاء الأرقام السرية</button></div>'+
 '<p><strong>'+afaqPinSafe(afaqPinPrint.className)+'</strong> — '+afaqPinPrint.students.length+' طالبًا، منهم '+
 afaqPinPrint.students.filter(s=>s.pin_status==='changed').length+' غيّروا الرقم السري.</p>'+
 '<div class="afaq-pin-scroll"><table><thead><tr><th>الاسم</th><th>اسم المستخدم</th><th>الرقم السري</th><th>باركود المنصة ورابطها</th></tr></thead><tbody>'+
 afaqPinPrint.students.map(s=>'<tr><td>'+afaqPinSafe(s.full_name)+'</td><td dir="ltr">'+afaqPinSafe(s.login_name)+'</td>'+
 '<td dir="ltr">'+afaqPinSafe(afaqPinDisplay(s))+'</td><td class="afaq-pin-preview-qr"><img loading="lazy" src="'+afaqPinSafe(afaqPinQR)+'" alt="باركود المنصة"><small dir="ltr">'+afaqPinSafe(afaqPinSite.replace("https://",""))+'</small></td></tr>').join('')+'</tbody></table></div></div>':'')+
 '</section>';
}
function afaqPinCredentialsTable(items){
 return '<table class="credentials"><thead><tr><th>اسم الطالب</th><th>اسم المستخدم</th><th>الرقم السري</th><th>كود دخول المنصة ورابطها</th></tr></thead><tbody>'+
 items.map(s=>'<tr class="credential-row"><td class="student-name">'+afaqPinSafe(s.full_name)+'</td>'+
 '<td class="login" dir="ltr">'+afaqPinSafe(s.login_name)+'</td>'+
 '<td class="pin" dir="ltr">'+afaqPinSafe(afaqPinDisplay(s))+'</td>'+
 '<td class="row-qr-cell"><div class="row-qr"><img loading="eager" src="'+afaqPinSafe(afaqPinQR)+'" alt="باركود الدخول إلى منصة آفاق ماث">'+
 '<small dir="ltr">'+afaqPinSafe(afaqPinSite.replace("https://",""))+'</small></div></td></tr>').join('')+'</tbody></table>';
}
function afaqPinPrintablePage(items,pageNumber,pageCount){
 const compact=afaqPinPrint.pages===1;
 const chunks=compact?[items.slice(0,Math.ceil(items.length/2)),items.slice(Math.ceil(items.length/2))]:[items];
 return '<section class="print-page '+(compact?'compact':'comfortable')+'">'+
 '<header class="print-head"><div><h1>منصة آفاق ماث | بيانات دخول الطلاب</h1>'+
 '<h2>'+afaqPinSafe(afaqPinPrint.className)+' — '+(compact?'جميع الطلاب في صفحة أفقية واحدة':'نسخة أوضح موزعة على صفحتين')+'</h2>'+
 '<p>AFAQMATHS • الصفحة '+pageNumber+' من '+pageCount+' • كود دخول ورابط مستقل أمام كل طالب</p></div></header>'+
 '<div class="credential-columns">'+chunks.map(x=>afaqPinCredentialsTable(x)).join('')+'</div>'+
 '<footer>كشف خاص بالمعلم — باركود المنصة ورابطها أمام كل طالب. «غيّره الطالب» تعني أن رقمه السري الحالي خاص به.</footer>'+
 '</section>';
}
function afaqPinBuildPrintDocument(){
 const all=afaqPinPrint.students||[],groups=afaqPinPrint.pages===1?[all]:
 [all.slice(0,Math.ceil(all.length/2)),all.slice(Math.ceil(all.length/2))];
 const css=[
 '*{box-sizing:border-box}body{direction:rtl;margin:0;font-family:Tahoma,Arial,sans-serif;background:#e9eef4;color:#153b64}',
 '.toolbar{position:sticky;top:0;z-index:9;padding:12px;text-align:center;background:#164675;color:#fff}.toolbar button{background:#ffe09c;color:#18416b;font-weight:900;border:0;padding:10px 18px;border-radius:8px;cursor:pointer;margin-right:10px}',
 '.print-page{width:281mm;height:197mm;margin:9px auto;background:#fff;padding:1mm;border:1px solid #bed2e4;break-after:page;display:flex;flex-direction:column;overflow:hidden}.print-page:last-child{break-after:auto}',
 '.print-head{height:19mm;flex:0 0 19mm;background:#153e74;color:#fff;display:flex;justify-content:space-between;align-items:center;padding:2mm 4mm;border-bottom:2px solid #d6ad69}',
 '.print-head h1{font-size:17px;margin:0 0 3px}.print-head h2{font-size:12px;color:#ffe2a1;margin:0 0 3px}.print-head p{font-size:9px;margin:0}',
 '.credential-columns{display:grid;grid-template-columns:1fr;gap:2mm;flex:1;min-height:0;margin-top:1mm}.compact .credential-columns{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}',
 'table.credentials{border-collapse:collapse;width:100%;height:100%;table-layout:fixed;direction:rtl;margin:0}',
 'table.credentials th{background:#e8f2fa;color:#184d81;font-size:10px;height:6mm;line-height:1.05;padding:.4mm;border:1px solid #c8d9e9}',
 'table.credentials td{border:1px solid #dde7f0;line-height:1.12;padding:.3mm .8mm;vertical-align:middle}table.credentials tr:nth-child(even){background:#f3f8fc}',
 'table.credentials th:first-child,table.credentials td.student-name{width:42%;text-align:right}table.credentials th:nth-child(2),table.credentials td.login{width:14%;text-align:center}table.credentials th:nth-child(3),table.credentials td.pin{width:14%;text-align:center}table.credentials th:nth-child(4),table.credentials td.row-qr-cell{width:30%;text-align:center}',
 '.compact table.credentials{font-size:9px}.compact td.student-name{font-size:8px}.comfortable table.credentials{font-size:14px}.comfortable td.student-name{font-size:13px}',
 'td.login,td.pin{font-weight:850}td.row-qr-cell{padding:0!important;line-height:1!important}.row-qr{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.1mm;height:100%;min-width:0}',
 '.row-qr img{display:block;width:7mm;height:7mm;object-fit:contain;flex-shrink:0;image-rendering:pixelated}.row-qr small{display:block;font-family:Arial,sans-serif;font-size:4.9px;line-height:1.05;max-width:100%;text-align:center;white-space:nowrap}',
 '.comfortable .row-qr img{width:7.8mm;height:7.8mm}.comfortable .row-qr small{font-size:7px;max-width:100%}',
 '.print-page footer{height:6mm;flex:0 0 6mm;text-align:center;color:#86542b;background:#fff9eb;font-size:9px;padding:1mm}',
 '@page{size:A4 landscape;margin:6mm}@media print{html,body{margin:0;padding:0;background:#fff}.toolbar{display:none}.print-page{border:0;margin:0;padding:0;width:100%;height:197mm}}'
 ].join('');
 return '<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow">'+
 '<title>كشف آفاق ماث '+afaqPinSafe(afaqPinPrint.className)+'</title><style>'+css+'</style></head><body>'+
 '<div class="toolbar">مستند خاص بالمشرف — باركود مستقل أمام كل طالب. <button onclick="window.print()">طباعة / حفظ PDF</button></div>'+
 groups.map((g,i)=>afaqPinPrintablePage(g,i+1,groups.length)).join('')+'</body></html>';
}
async function afaqPinLoadPrivate(){
 if(!afaqStarsSupervisor()||afaqPinPrint.loading)return;
 if(!window.confirm('هل تريد عرض الأرقام السرية للشعبة المختارة؟ تأكد من الحفاظ على سرية بيانات الطلاب.'))return;
 const token=auth.token,cls=afaqPinPrint.className;
 afaqPinPrint.loading=true;afaqPinPrint.error='';afaqPinPrint.message='جارٍ تحميل بيانات الشعبة المحمية ...';render();
 try{
  const result=await afaqStarsServer('staff_print_credentials',{class_name:cls});
  if(token!==auth.token||!afaqStarsSupervisor()||cls!==afaqPinPrint.className)return;
  afaqPinPrint.students=Array.isArray(result.students)?result.students:[];
  afaqPinPrint.token=token;afaqPinPrint.loadedClass=cls;
  afaqPinPrint.message='تم عرض بيانات '+afaqPinPrint.students.length+' طالبًا. اختر الطباعة أو التنزيل.';
 }catch(err){afaqPinClear();afaqPinPrint.error=err.message||'تعذر تحميل بيانات الدخول.';}
 finally{afaqPinPrint.loading=false;if(auth.section==='afaq_stars_center'&&state.page==='dashboard')render()}
}
function afaqPinOpenPrint(){
 if(!afaqStarsSupervisor()||afaqPinPrint.token!==auth.token||!afaqPinPrint.students?.length)return;
 const popup=window.open('','_blank','width=1200,height=840');
 if(!popup){window.alert('يرجى السماح بفتح نافذة الطباعة من المتصفح.');return}
 try{popup.document.open();popup.document.write(afaqPinBuildPrintDocument());popup.document.close();popup.focus()}
 catch(err){popup.close();window.alert('تعذر تجهيز الطباعة: '+err.message)}
}
function afaqPinDownloadCSV(){
 if(!afaqStarsSupervisor()||afaqPinPrint.token!==auth.token||!afaqPinPrint.students?.length)return;
 const cell=v=>'"'+String(v??'').replace(/^[=+\-@]/,"'$&").replace(/"/g,'""')+'"';
 const header=['اسم الطالب','اسم المستخدم','الرقم السري','الشعبة','حالة الرقم السري'];
 const lines=[header.map(cell).join(',')];
 for(const s of afaqPinPrint.students)
  lines.push([s.full_name,s.login_name,s.pin||'',afaqPinPrint.className,s.pin_status==='changed'?'غيّره الطالب':'الرقم الأولي'].map(cell).join(','));
 const blob=new Blob(['\ufeff'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;
 a.download='AFAQMATHS_Grade6_'+afaqPinPrint.className.replace(/[^٤٥٦]/g,'')+'_credentials.csv';
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
}
const afaqPinOriginalView=afaqStarsManagementView;
afaqStarsManagementView=function(){
 if((!afaqStarsSupervisor()||afaqPinPrint.token&&auth.token!==afaqPinPrint.token)&&afaqPinPrint.students)afaqPinClear();
 const html=afaqPinOriginalView();
 if(!afaqStarsSupervisor())return html;
 return html.replace('<div class="afaq-stars-message"',afaqPinPanel()+'<div class="afaq-stars-message"');
};
const afaqPinOriginalAttach=attachPortal;
attachPortal=function(){
 afaqPinOriginalAttach();
 if(auth.section!=='afaq_stars_center'||!afaqStarsSupervisor())return;
 document.getElementById('afaqPinPrintClass')?.addEventListener('change',event=>{
  afaqPinPrint.className=event.target.value;afaqPinClear();render();
 });
 document.getElementById('afaqPinPrintPages')?.addEventListener('change',event=>{
  afaqPinPrint.pages=Number(event.target.value)===2?2:1;render();
 });
 document.getElementById('afaqPinShow')?.addEventListener('click',afaqPinLoadPrivate);
 document.getElementById('afaqPinHide')?.addEventListener('click',()=>{afaqPinClear();render()});
 document.getElementById('afaqPinPrintNow')?.addEventListener('click',afaqPinOpenPrint);
 document.getElementById('afaqPinDownloadCSV')?.addEventListener('click',afaqPinDownloadCSV);
};
