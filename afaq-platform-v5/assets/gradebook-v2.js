/* سجل آفاق الرياضيات — شفوي ١٠ + سؤالان قصيران ١٠ + اختباران قصيران ٢٠ + كتابي ٥ + واجبات ٥ + مشروع ١٠ = ٦٠، ثم ٤٠ توقع/نهائي. */
'use strict';
const GB_COMPONENTS=[
 ['oral_score','الأعمال الشفوية',10],
 ['short1_score','السؤال القصير الأول (دروس خارج الاختبارات القصيرة)',5],
 ['short2_score','السؤال القصير الثاني (دروس خارج الاختبارات القصيرة)',5],
 ['short_exam1_score','الاختبار القصير الأول',10],
 ['short_exam2_score','الاختبار القصير الثاني',10],
 ['written_score','الأعمال الكتابية',5],
 ['homework_score','الواجبات المنزلية',5],
 ['project_score','المشروع الرياضي',10],
 ['a_score','توقع درجة النهائي وفق مؤشرات A+ وA−',40]
];
const GB_PLUS=['دائرة الضوء','إجابة مميزة','المعلم الصغير','الحل السريع','مسابقة صفية','مشاركة إيجابية','مبادرة أخرى','ترحيل من الدفتر'];
const GB_MINUS=['إخفاق في مسابقة','التحدث أثناء الشرح','الإهمال','سلوك غير مناسب داخل الصف','سلوك غير مناسب داخل المدرسة','مخالفة أخرى','ترحيل من الدفتر'];
const gbNum=v=>v===null||v===undefined||v===''?'—':new Intl.NumberFormat('ar-OM',{maximumFractionDigits:2}).format(Number(v));
const gbPresent=v=>v===null||v===undefined?'لم تُرصد':gbNum(v);
const gbDate=v=>{try{return new Intl.DateTimeFormat('ar-OM',{dateStyle:'long',timeZone:'Asia/Muscat'}).format(new Date(v||Date.now()))}catch{return '—'}};
const gbErr=code=>({
 invalid_assessment:'درجة غير صحيحة؛ تحقّق من الحدود المخصصة لكل عنصر.',
 invalid_classroom_event:'تحقّق من نوع النقطة وسببها والعدد بين ١ و٢٠.',
 assessment_incomplete:'لا يجوز اعتماد النتيجة قبل رصد جميع العناصر التسعة.',
 assessment_changed_reload:'السجل تغير من جلسة أخرى؛ حدّث بيانات الطالب.',
 reopen_approved_first:'الدرجات معتمدة؛ على المشرف إعادة فتحها أولًا.',
 assessment_not_found:'لا يوجد تقييم مسجل لهذا الطالب.',
 already_approved:'النتيجة معتمدة بالفعل.',
 not_approved:'الدرجات ليست معتمدة حاليًا.',
 invalid_final_score:'درجة الاختبار النهائي يجب أن تكون من ٠ إلى ٤٠.',
 prediction_not_approved:'يجب اعتماد التوقع أولًا قبل اعتماد الدرجة الفعلية.',
 final_score_required:'أدخل درجة الاختبار النهائي من ٤٠ قبل اعتماد النتيجة.',
 reopen_final_first:'أعد فتح اعتماد الاختبار النهائي أولًا قبل تعديل التوقع.'
})[code]||code;

function gbSummary(p,staff=false){
 if(!p||p.demo)return '';
 const a=p.assessment;
 if(!a)return '<section class="panel gb-summary"><h3>📊 نتائج الرياضيات من ١٠٠</h3><p class="notice">'+
  (p.assessment_status==='pending'?'درجات الطالب قيد الرصد والمراجعة.':'لم تُعتمد نتائج هذا الطالب بعد.')+
  '</p><p>٦٠ درجة أعمال فصلية: أعمال شفوية ١٠ + سؤالان قصيران (٢ × ٥) + اختباران قصيران (٢ × ١٠) + أعمال كتابية ٥ + واجبات منزلية ٥ + مشروع ١٠. وتضاف ٤٠ درجة للتوقع أو للاختبار النهائي.</p></section>';
 const approved=a.status==='approved',real=a.final_status==='approved'&&a.final_complete&&a.actual_total!==null;
 const sections=[
  ['الأعمال الشفوية',a.oral_score,10],
  ['السؤالان القصيران',a.short_questions,10],
  ['الاختباران القصيران',a.short_exams,20],
  ['الأعمال الكتابية',a.written_score,5],
  ['الواجبات المنزلية',a.homework_score,5],
  ['المشروع',a.project_score,10],
  ['التوقع A+ وA−',a.a_score,40]
 ].map(([label,value,max])=>'<div><strong>'+gbPresent(value)+' / '+gbNum(max)+'</strong><small>'+e(label)+'</small></div>').join('');
 const detail=GB_COMPONENTS.map(([key,label,max])=>'<tr><td>'+e(label)+'</td><td>'+gbPresent(a[key])+' / '+gbNum(max)+'</td></tr>').join('');
 const events=(p.assessment_events||[]).slice(0,30).map(x=>'<tr><td>'+(x.kind==='plus'?'A+':'A−')+'</td><td>'+e(x.category)+'</td><td>'+gbNum(x.points)+'</td><td>'+e(x.note||'—')+'</td><td>'+gbDate(x.created_at)+'</td></tr>').join('');
 const comparison=real?'<section class="gb-compare"><h4>📈 مقارنة الدرجة المتوقعة بالدرجة الفعلية بعد الاختبار النهائي</h4>'+
 '<div class="gb-compare-grid"><div><small>النتيجة المتوقعة</small><strong>'+gbNum(a.estimated_total)+' / ١٠٠</strong></div>'+
 '<div><small>النتيجة الحقيقية</small><strong>'+gbNum(a.actual_total)+' / ١٠٠</strong></div>'+
 '<div><small>الفرق (الحقيقية − المتوقعة)</small><strong>'+gbSigned(a.difference)+' درجة</strong></div></div>'+
 '<p>'+e(gbCompareText(a.difference))+'</p></section>':
 (a.final_score!==null&&a.final_score!==undefined&&staff?
 '<p class="notice">درجة الاختبار النهائي مسجلة كمسودة من ٤٠، ولم تُعتمد بعد، لذلك لا تظهر للطالب.</p>':'');
 const predictionButtons=approved?gbActions('prediction')+'<div class="gb-print-zone">'+gbCertificate(p,'prediction')+'</div>':
 '<p class="muted">شهادة التوقع لا تُتاح للطالب قبل اعتماد رصد الأعمال الفصلية ومؤشر A من ٤٠.</p>';
 const finalButtons=real?gbActions('final')+'<div class="gb-print-zone">'+gbCertificate(p,'final')+'</div>':
 '<p class="muted">الشهادة الفعلية متاحة بعد رصد درجة الاختبار النهائي من ٤٠ واعتماد المشرف لها.</p>';
 return '<section class="panel gb-summary"><h3>📊 '+(staff?'متابعة نتيجة الطالب':'نتائجي في الرياضيات')+' — ١٠٠ درجة</h3>'+
 '<p class="gb-approval '+(approved?'gb-approved':'gb-draft')+'">'+
 (approved?'✓ التوقع معتمد — '+(real?'والنتيجة الفعلية معتمدة':'والاختبار النهائي لم يُعتمد بعد'):
 'توقع غير معتمد — لا ينشر للطالب')+'</p>'+
 '<div class="gb-tiles">'+sections+'<div class="gb-final"><strong>'+(a.complete?gbNum(a.estimated_total):'—')+' / ١٠٠</strong><small>النتيجة المتوقعة قبل النهائي</small></div></div>'+
 comparison+
 '<details class="gb-breakdown"><summary>تفاصيل السؤالين القصيرين والاختبارين القصيرين وسجل A</summary>'+
 '<table><thead><tr><th>المجال</th><th>الدرجة</th></tr></thead><tbody>'+detail+
 '<tr><td>الاختبار النهائي (عوضًا عن A في النتيجة الفعلية)</td><td>'+gbPresent(a.final_score)+' / ٤٠</td></tr></tbody></table>'+
 '<p>مؤشرات الدفتر: A+ = '+gbNum(a.a_plus_points)+'، A− = '+gbNum(a.a_minus_points)+
 '. الفرق الاسترشادي: '+gbNum(a.a_suggested)+' / ٤٠؛ الدرجة المتوقعة تعتمد على تقدير المشرف، وليس على حساب آلي للنقاط.</p>'+
 (events?'<h4>سجل رصد A+ وA−</h4><div class="gb-table-scroll"><table><thead><tr><th>النوع</th><th>السبب</th><th>النقاط</th><th>ملاحظات</th><th>التاريخ</th></tr></thead><tbody>'+events+'</tbody></table></div>':'')+
 '</details>'+
 '<section class="gb-two-certificates"><h4>الشهادة الأولى: توقع النتيجة قبل الاختبار النهائي</h4>'+
 '<p>٦٠ درجة أعمال وتقييمات + ٤٠ درجة متوقعة وفق مؤشرات A+ وA−.</p>'+predictionButtons+
 '<h4>الشهادة الثانية: النتيجة الحقيقية بعد الاختبار النهائي</h4>'+
 '<p>٦٠ درجة أعمال وتقييمات + ٤٠ درجة الاختبار النهائي المعتمدة، مع المقارنة بالتوقع.</p>'+finalButtons+'</section></section>';
}
const gbSigned=v=>v>0?'+'+gbNum(v):gbNum(v);
function gbCompareText(delta){
 if(delta===null||delta===undefined)return 'النتيجة الفعلية لم تُعتمد بعد.';
 if(delta===0)return 'تطابقت النتيجة المتوقعة والنتيجة الحقيقية تمامًا.';
 if(delta>0)return 'تجاوزت النتيجة الحقيقية التوقع بمقدار '+gbNum(delta)+' درجات.';
 return 'جاءت النتيجة الحقيقية أقل من التوقع بمقدار '+gbNum(Math.abs(delta))+' درجات.';
}
function gbActions(mode){
 const label=mode==='final'?'شهادة الدرجة الحقيقية':'شهادة الدرجة المتوقعة';
 return '<div class="gb-print-controls"><label class="ss-print-label">اتجاه الورق <select id="gbOrientation-'+mode+'"><option value="portrait">A4 عمودي</option><option value="landscape">A4 أفقي</option></select></label>'+
 '<button class="primary" type="button" data-print-gradebook="'+mode+'">🖨️ طباعة '+label+' / حفظ PDF</button>'+
 '<button class="outline" type="button" data-gb-share="'+mode+'" data-gb-channel="whatsapp">مشاركة الملخص عبر واتساب</button>'+
 '<button class="outline" type="button" data-gb-share="'+mode+'" data-gb-channel="email">إرسال الملخص بالبريد الإلكتروني</button></div>';
}

function gbPraise(total){
 if(total>=90)return 'تقديرًا لتفوقك المتميز وجهودك المتواصلة في تعلم الرياضيات والمنافسات الصفية، نهنئك على هذا الإنجاز ونتمنى لك دوام الإبداع والتألق.';
 if(total>=80)return 'نُشيد بأدائك المتفوق واجتهادك في الأنشطة والاختبارات والمنافسات الصفية، ونثمن ما بذلته من جهد لتحقيق هذه النتيجة.';
 if(total>=65)return 'نشكر لك حرصك على التعلم والمشاركة الفاعلة في دروس الرياضيات، ونتطلع إلى مزيد من التطور والتميّز.';
 if(total>=50)return 'نثمّن جهودك ومثابرتك في أداء الواجبات والتقييمات، ونشجعك على مواصلة المحاولة والمراجعة والتقدم.';
 return 'نقدّر جهودك ومحاولاتك في التعلم، وندعوك إلى عدم التوقف عن التدريب؛ فكل محاولة خطوة نحو مزيد من الفهم والنجاح.';
}

function gbCertificate(p,mode='prediction'){
 const a=p?.assessment,st=p?.student||{},final=mode==='final';
 if(!a||a.status!=='approved'||!a.complete)return '';
 if(final&&!(a.final_status==='approved'&&a.final_complete&&a.actual_total!==null))return '';
 const total=Number(final?a.actual_total:a.estimated_total),sub=Number(a.coursework||0);
 const date=gbDate(final?a.final_approved_at:a.approved_at);
 const isFinal=final,chosen=Number(final?a.final_score:a.a_score);
 const examRows=[1,2].map(n=>'<tr><td>الاختبار القصير '+gbNum(n)+'</td><td>'+gbNum(a['short_exam'+n+'_score'])+' / ١٠</td></tr>').join('');
 const questionRows=[1,2].map(n=>'<tr><td>السؤال القصير '+(n===1?'الأول':'الثاني')+'</td><td>'+gbNum(a['short'+n+'_score'])+' / ٥</td></tr>').join('');
 const comparison=final?'<p class="gb-cert-compare">المتوقع قبل النهائي: '+gbNum(a.estimated_total)+
  ' / ١٠٠ • الفعلي بعد النهائي: '+gbNum(total)+' / ١٠٠ • الفرق: '+gbSigned(a.difference)+'</p>':'';
 return '<section class="gb-certificate '+(final?'gb-cert-actual':'gb-cert-prediction')+
  '" id="afaqSchoolGradeCertificate-'+mode+'" dir="rtl">'+
 '<div class="gb-flag"><span></span><span></span><span></span></div>'+
 '<div class="gb-cert-head"><div class="gb-icon" aria-hidden="true">🏆</div>'+
 '<div><p>سلطنة عُمان • مدرسة الحسين بن علي للتعليم الأساسي</p>'+
 '<h2>منصة آفاق الرياضيات</h2><h3>'+(final?'شهادة النتيجة الفعلية بعد الاختبار النهائي':
 'شهادة النتيجة المتوقعة قبل الاختبار النهائي')+'</h3></div>'+
 '<div class="gb-icon" aria-hidden="true">🥇</div></div>'+
 '<div class="gb-cert-name"><span>تتقدم المنصة بالشكر والتقدير للطالب</span>'+
 '<strong>'+e(st.full_name||st.display_name||'الطالب')+'</strong>'+
 '<small>'+e(st.class_name||'الصف السادس')+' • الرقم في الشعبة: '+e(st.serial_no??'—')+' • تاريخ الاعتماد: '+e(date)+'</small></div>'+
 '<div class="gb-cert-content"><div class="gb-cert-grades"><table><thead><tr>'+
 '<th>مجال التقييم</th><th>الدرجة</th></tr></thead><tbody>'+
 '<tr><td>الأعمال الشفوية</td><td>'+gbNum(a.oral_score)+' / ١٠</td></tr>'+
 questionRows+
 '<tr class="gb-cert-sub"><td>مجموع السؤالين القصيرين</td><td>'+gbNum(a.short_questions)+' / ١٠</td></tr>'+
 examRows+
 '<tr class="gb-cert-sub"><td>مجموع الاختبارين القصيرين</td><td>'+gbNum(a.short_exams)+' / ٢٠</td></tr>'+
 '<tr><td>الأعمال الكتابية</td><td>'+gbNum(a.written_score)+' / ٥</td></tr>'+
 '<tr><td>الواجبات المنزلية</td><td>'+gbNum(a.homework_score)+' / ٥</td></tr>'+
 '<tr><td>المشروع الرياضي</td><td>'+gbNum(a.project_score)+' / ١٠</td></tr>'+
 '<tr class="gb-cert-sub"><td>المجموع قبل النهائي</td><td>'+gbNum(sub)+' / ٦٠</td></tr>'+
 '<tr class="gb-cert-last"><td>'+(final?'الاختبار النهائي (الدرجة الحقيقية)':
 'توقع الاختبار النهائي من مؤشرات A+ وA−')+'</td><td>'+gbNum(chosen)+' / ٤٠</td></tr>'+
 '</tbody></table></div><div class="gb-cert-achievement"><div class="gb-cert-emblem">★ <span>'+
 e(total>=90?'متفوق':total>=75?'مجتهد ومتميز':'روح المثابرة')+'</span> ★</div>'+
 '<p>الأعمال الشفوية والسؤالان القصيران والاختباران والكتابي والواجب والمشروع</p><strong>'+gbNum(sub)+' / ٦٠</strong>'+
 '<p>'+(final?'درجة الاختبار النهائي':'التوقع وفق A+ وA−')+'</p><strong>'+gbNum(chosen)+' / ٤٠</strong>'+
 '<div class="gb-cert-total"><span>'+(final?'الدرجة الحقيقية النهائية':'الدرجة المتوقعة قبل النهائي')+
 '</span><b>'+gbNum(total)+' / ١٠٠</b><small>'+gbNum(total)+'٪</small></div>'+
 (!final?'<p class="gb-cert-a">مؤشرات الدفتر عند اعتماد التوقع: A+ = '+
 gbNum(a.a_plus_at_approval??a.a_plus_points)+'، A− = '+
 gbNum(a.a_minus_at_approval??a.a_minus_points)+'</p>':
 '<p class="gb-cert-a">درجة A المتوقعة: '+gbNum(a.a_score)+' / ٤٠، واستُبدلت في الحساب بدرجة النهائي الحقيقية.</p>')+
 '<p class="gb-cert-ok">'+(final?'تم اعتماد درجة الاختبار النهائي من المشرف':
 'التوقع معتمد لكنه ليس الدرجة النهائية للفصل')+'</p></div></div>'+
 comparison+'<div class="gb-cert-praise">'+e(gbPraise(total))+'</div>'+
 '<p class="gb-cert-wish">وفقك الله وسدد خطاك، وإلى مزيد من النجاح والتميّز.</p>'+
 '<p class="gb-cert-legal">'+(final?'هذه النتيجة مبنية على الدرجة المعتمدة للاختبار النهائي.':
 'هذا تقدير استرشادي قبل الاختبار النهائي، ولا يحل محل درجته الحقيقية.')+
 ' وثيقة من منصة آفاق الرياضيات وليست بديلًا عن السجل الرسمي للمدرسة.</p>'+
 '<div class="gb-cert-signatures"><div><b>الإعداد والإشراف</b>'+
 '<strong>الأستاذ سعيد بن جمعة بن عبدالله البريكي</strong></div>'+
 '<div><b>مدير المدرسة</b><strong>الأستاذ عبد الله بن علي العيسائي</strong></div></div></section>';
}
function gbShareText(p,mode){
 const a=p?.assessment,student=p?.student||{},isFinal=mode==='final';
 if(!a||a.status!=='approved'||(!isFinal&&a.estimated_total===null)|| 
  (isFinal&&(a.final_status!=='approved'||a.actual_total===null)))return '';
 const value=Number(isFinal?a.actual_total:a.estimated_total),name=student.full_name||student.display_name||'طالب';
 return ['منصة آفاق الرياضيات — '+(isFinal?'النتيجة الفعلية بعد الاختبار النهائي':'توقع النتيجة قبل الاختبار النهائي'),
  'الطالب: '+name,'الشعبة: '+(student.class_name||'السادس'),
  'الأعمال الشفوية: '+gbNum(a.oral_score)+'/١٠',
  'السؤالان القصيران (دروس غير داخلة في الاختبارين): '+gbNum(a.short_questions)+'/١٠',
  'الاختباران القصيران: '+gbNum(a.short_exams)+'/٢٠',
  'الأعمال الكتابية: '+gbNum(a.written_score)+'/٥',
  'الواجبات المنزلية: '+gbNum(a.homework_score)+'/٥',
  'المشروع: '+gbNum(a.project_score)+'/١٠',
  'المجموع قبل النهائي: '+gbNum(a.coursework)+'/٦٠',
  (isFinal?'الاختبار النهائي: '+gbNum(a.final_score)+'/٤٠':
  'توقع النهائي وفق A+ وA−: '+gbNum(a.a_score)+'/٤٠'),
  'النتيجة: '+gbNum(value)+'/١٠٠',
  ...(isFinal?['النتيجة المتوقعة سابقًا: '+gbNum(a.estimated_total)+'/١٠٠',
    'الفرق (الحقيقية − المتوقعة): '+gbSigned(a.difference)]:[]),
  isFinal?'درجة نهائية معتمدة في سجل المنصة.':'توقع استرشادي معتمد؛ لا يحل محل الاختبار النهائي.',
  'الإعداد والإشراف: الأستاذ سعيد بن جمعة بن عبدالله البريكي'
 ].join('\n');
}


function gbForm(p){
 const a=p?.assessment||{},approved=a.status==='approved',finalApproved=a.final_status==='approved';
 const cells=GB_COMPONENTS.map(([key,label,max])=>
  '<div><label for="gb-'+key+'">'+e(label)+' — من '+gbNum(max)+'</label>'+
  '<input id="gb-'+key+'" name="'+key+'" type="number" min="0" max="'+max+
  '" step="1" value="'+(a[key]==null?'':e(a[key]))+'" '+(approved?'disabled':'')+
  ' placeholder="لم تُرصد بعد"></div>').join('');
 const forecastStatus='<p class="gb-approval '+(approved?'gb-approved':'gb-draft')+'">'+
  (approved?'✓ التوقع معتمد؛ لا يُعدل إلا بعد إعادة فتحه.':'التوقع مسودة لم تُعتمد بعد.')+'</p>';
 const save=approved?'':'<button class="primary" type="submit">💾 حفظ درجات الشفوي والأعمال والتوقع كمسودة</button>';
 const admin=isAdmin()?(approved?
   '<button type="button" class="outline" id="gbReopen" '+(finalApproved?'disabled':'')+
   '>🔓 إعادة فتح التوقع للتعديل</button>':
   '<button type="button" class="primary" id="gbApprove" '+(!a.complete?'disabled':'')+
   '>✓ اعتماد توقع الدرجة قبل النهائي ونشر الشهادة الأولى</button>')+
   '<button type="button" class="outline" id="gbAudit">سجل التغييرات والاعتمادات</button>':'';
 const raw='<section class="gb-raw-points"><h4>🏅 نقاط A+ وA− كمؤشرات لتوقع درجة الاختبار النهائي</h4>'+
  '<p>تدوّن A+ للتميز والمسابقات الإيجابية، وتدوّن A− للإخفاق والملاحظات السلوكية. يراجعها المشرف ويحدد توقعًا من ٤٠ دون احتساب آلي.</p>'+
  '<div class="gb-tiles"><div><strong>A+ = '+gbNum(a.a_plus_points||0)+'</strong><small>موجبة</small></div>'+
  '<div><strong>A− = '+gbNum(a.a_minus_points||0)+'</strong><small>سالبة</small></div>'+
  '<div><strong>'+gbNum(a.a_suggested||0)+' / ٤٠</strong><small>مؤشر غير ملزم</small></div></div>'+
  (approved?'<p class="notice">يمكنك مواصلة رصد النقاط تراكميًا بعد الاعتماد، لكن توقع الاختبار النهائي المحفوظ من ٤٠ لا يتغير، وتبقى الشهادة الأولى معتمدة برصيد يوم الاعتماد.</p>':'')+
  '<form id="gbEventForm"><div class="gb-input-grid">'+
  '<div><label>نوع الرصد</label><select id="gbKind" name="kind"><option value="plus">A+ موجب</option>'+
  '<option value="minus">A− سالب</option></select></div>'+
  '<div><label>سبب الرصد</label><select id="gbCategory" name="category">'+GB_PLUS.map(x=>'<option value="'+e(x)+'">'+e(x)+'</option>').join('')+'</select></div>'+
  '<div><label>عدد النقاط</label><input name="points" type="number" min="1" max="20" value="1" required></div>'+
  '<div><label>توضيح اختياري</label><input name="note" type="text" maxlength="400" placeholder="مثال: إجابة مميزة في دائرة الضوء"></div></div>'+
  '<button class="soft" type="submit">إضافة نقاط متكررة مع سببها إلى الرصيد التراكمي</button></form>'+
  '<button class="outline" type="button" data-ss-open-comm>💬 مشاركة الرصد الأخير اختياريًا مع ولي الأمر أو إدارة المدرسة</button></section>';
 const finalStatus='<p class="gb-approval '+(finalApproved?'gb-approved':'gb-draft')+'">'+
  (finalApproved?'✓ تم اعتماد الدرجة الحقيقية والشهادة الثانية.':
  a.final_score==null?'الاختبار النهائي لم تُدخل درجته بعد؛ لا تُحتسب في شهادة التوقع.':
  'درجة النهائي مدخلة كمسودة؛ لا تدخل في النتيجة الحقيقية المنشورة قبل اعتمادها.')+'</p>';
 const finalForm='<section class="gb-final-editor"><h4>🧾 الاختبار النهائي من ٤٠ — يحل محل توقع A بعد الاعتماد فقط</h4>'+
  '<p>يمكن إدخال درجة النهائي الآن أو لاحقًا، ولا تتغير شهادة التوقع. يستلزم نشر شهادة النتيجة الحقيقية اعتماد المشرف.</p>'+
  finalStatus+
  '<form id="gbFinalForm"><div class="gb-input-grid"><div><label>الدرجة الفعلية للاختبار النهائي — من ٤٠</label>'+
  '<input type="number" name="final_score" min="0" max="40" step="1" value="'+(a.final_score==null?'':e(a.final_score))+
  '" '+(finalApproved?'disabled':'')+' placeholder="لا تُحتسب إلا بعد الاعتماد"></div></div>'+
  (!finalApproved?'<button class="soft" type="submit">💾 حفظ درجة النهائي كمسودة مستقلة</button>':'')+'</form>'+
  '<div class="gb-form-buttons">'+(isAdmin()?(finalApproved?
   '<button class="outline" type="button" id="gbReopenFinal">🔓 إعادة فتح درجة النهائي للمراجعة</button>':
   '<button class="primary" type="button" id="gbApproveFinal" '+(!approved||a.final_score==null?'disabled':'')+
   '>✓ اعتماد الاختبار النهائي وإصدار الشهادة الثانية</button>'):'')+'</div>'+
  ((approved&&finalApproved)?'<p class="gb-compare">المتوقع: <strong>'+gbNum(a.estimated_total)+'/١٠٠</strong> • الفعلي: <strong>'+
   gbNum(a.actual_total)+'/١٠٠</strong> • الفرق: <strong>'+gbSigned(a.difference)+'</strong></p>':'')+
  '</section>';
 return '<section class="gb-editor"><h3>📝 نظام رصد التوقع والنتيجة الحقيقية من ١٠٠</h3>'+
  '<p>الشفوي ١٠ + سؤالان قصيران ١٠ (٢ × ٥) للدروس غير الداخلة في الاختبارات القصيرة + اختباران قصيران ٢٠ (٢ × ١٠) + الأعمال الكتابية ٥ + الواجبات المنزلية ٥ + المشروع ١٠ = ٦٠؛ وتضاف ٤٠ نقطة للتوقع قبل النهائي أو درجة النهائي بعد أدائه.</p>'+
  forecastStatus+
  '<form id="gbAssessmentForm"><div class="gb-input-grid">'+cells+'</div><div class="gb-form-buttons">'+save+'</div></form>'+
  '<div class="gb-form-buttons">'+admin+'</div>'+raw+finalForm+'<div id="gbAuditOutput"></div></section>';
}


/* كشف نتائج كل شعبة — قراءة وطباعة للمشرف والمشرف المساعد فقط. */
const GB_CLASS_NAMES=['السادس / ٤','السادس / ٥','السادس / ٦'];
auth.gbSelectedClass=auth.gbSelectedClass||GB_CLASS_NAMES[0];
auth.gbClassReport=null;
auth.gbClassLoading=false;
auth.gbClassError='';
const gbClassAllowed=()=>['supervisor','supervisor_assistant'].includes(auth.user?.role);
async function gbLoadClassReport(className=auth.gbSelectedClass){
 if(!gbClassAllowed()||!GB_CLASS_NAMES.includes(className))return;
 auth.gbSelectedClass=className;auth.gbClassReport=null;
 auth.gbClassLoading=true;auth.gbClassError='';render();
 try{
  const report=await api('class_assessments',{class_name:className});
  if(auth.gbSelectedClass!==className)return;
  auth.gbClassReport=report;
 }catch(err){
  if(auth.gbSelectedClass!==className)return;
  auth.gbClassError=gbErr(err.message);
 }finally{
  if(auth.gbSelectedClass===className){auth.gbClassLoading=false;render()}
 }
}
function gbClassScore(v){
 return v===null||v===undefined?'—':gbNum(v);
}
function gbClassCell(v,extra=''){
 return '<td'+(extra?' class="'+extra+'"':'')+'>'+gbClassScore(v)+'</td>';
}
function gbClassStatus(row){
 if(row.final_status==='approved')return 'الفعلي معتمد';
 if(row.assessment_status==='approved')return row.final_status==='draft'?'توقع معتمد • النهائي مسودة':'التوقع معتمد';
 if(row.assessment_status==='draft')return 'مسودة غير معتمدة';
 return 'لم تُرصد درجات';
}
function gbClassTableRows(report){
 return [...(report?.students||[])].sort((a,b)=>Number(a.serial_no)-Number(b.serial_no))
 .map(row=>{
  const s=row.scores||{},predicted=row.assessment_status==='approved',actual=row.final_status==='approved';
  const finalEntry=s.final_score===null||s.final_score===undefined?'—':
   gbNum(s.final_score)+(actual?'':'*');
  const cells=[
   s.oral_score,s.short1_score,s.short2_score,
   s.short_exam1_score,s.short_exam2_score,
   s.written_score,s.homework_score,s.project_score,s.coursework,
   s.a_plus_points,s.a_minus_points,s.a_score
  ];
  return '<tr class="'+(actual?'gb-class-actual':predicted?'gb-class-predicted':'gb-class-draft')+'">'+
   '<td class="gb-class-no">'+gbNum(row.serial_no)+'</td>'+
   '<td class="gb-class-student-name">'+e(row.full_name||row.display_name||'—')+'</td>'+
   cells.map((v,i)=>gbClassCell(v,i===8?'gb-class-subtotal':i===11?'gb-class-a-est':'')).join('')+
   '<td class="gb-class-real-40">'+finalEntry+'</td>'+
   gbClassCell(s.estimated_total,'gb-class-est-total')+
   gbClassCell(actual?s.actual_total:null,'gb-class-actual-total')+
   '<td class="gb-class-difference">'+(actual&&s.difference!=null?gbSigned(s.difference):'—')+'</td>'+
   '<td class="gb-class-status">'+e(gbClassStatus(row))+'</td>'+
   '</tr>';
 }).join('');
}
function gbClassTable(report){
 return '<table class="gb-class-grade-table" dir="rtl">'+
 '<colgroup><col class="gb-col-no"><col class="gb-col-name">'+
 Array.from({length:16},()=>'<col>').join('')+'<col class="gb-col-status"></colgroup>'+
 '<thead><tr class="gb-class-group-header">'+
 '<th rowspan="2">م</th><th rowspan="2" class="gb-class-name-header">اسم الطالب</th>'+
 '<th colspan="9">الأعمال الفصلية (٦٠)</th><th colspan="3">المؤشرات والتوقع</th>'+
 '<th rowspan="2">النهائي الفعلي<br>٤٠</th>'+
 '<th colspan="3">المجموع والمقارنة (١٠٠)</th><th rowspan="2">الاعتماد</th></tr>'+
 '<tr class="gb-class-subheader">'+
 '<th>شفوي<br>١٠</th><th title="السؤال القصير الأول؛ دروس خارج الاختبارات القصيرة">س١<br>٥</th>'+
 '<th title="السؤال القصير الثاني؛ دروس خارج الاختبارات القصيرة">س٢<br>٥</th>'+
 '<th>اخت١<br>١٠</th><th>اخت٢<br>١٠</th>'+
 '<th>كتابي<br>٥</th><th>واجب<br>٥</th><th>مشروع<br>١٠</th><th>المجموع<br>٦٠</th>'+
 '<th>A+</th><th>A−</th><th>المتوقع<br>٤٠</th>'+
 '<th>المتوقع<br>١٠٠</th><th>الفعلي<br>١٠٠</th><th>الفرق</th></tr></thead>'+
 '<tbody>'+gbClassTableRows(report)+'</tbody></table>';
}
function gbClassReportMarkup(report){
 if(!report)return '';
 const classLabel=e(report.class_name||auth.gbSelectedClass);
 const all=Number(report.count)||0,approved=Number(report.approved_predictions)||0,finals=Number(report.approved_finals)||0;
 return '<section class="gb-class-sheet" id="gbPrintableClassSheet" dir="rtl">'+
  '<div class="gb-class-flag" aria-hidden="true"><span></span><span></span><span></span></div>'+
  '<div class="gb-class-heading"><div class="gb-class-icon" aria-hidden="true">📐</div>'+
  '<div><span>سلطنة عُمان • مدرسة الحسين بن علي للتعليم الأساسي</span>'+
  '<h2>منصة آفاق الرياضيات — كشف نتائج الشعبة</h2>'+
  '<h3>'+classLabel+' | مقارنة المتوقع بالفعلي</h3></div>'+
  '<div class="gb-class-icon" aria-hidden="true">🏆</div></div>'+
  '<div class="gb-class-summary">'+
  '<span><b>الشعبة:</b> '+classLabel+'</span><span><b>عدد الطلاب:</b> '+gbNum(all)+'</span>'+
  '<span><b>التوقعات المعتمدة:</b> '+gbNum(approved)+'</span>'+
  '<span><b>النتائج الفعلية المعتمدة:</b> '+gbNum(finals)+'</span>'+
  '<span><b>تاريخ الكشف:</b> '+gbDate(report.generated_at)+'</span></div>'+
  '<div class="gb-class-table-wrap">'+gbClassTable(report)+'</div>'+
  '<div class="gb-class-legend"><p><b>المتوقع:</b> الأعمال الفصلية من ٦٠ + تقييم A+ وA− التقديري من ٤٠. '+
  '<b>الفعلي:</b> الأعمال نفسها من ٦٠ + الاختبار النهائي من ٤٠ بعد اعتماده.</p>'+
  '<p><b>الرمز (—):</b> لم تُرصد الدرجة أو لم تُعتمد بعد. '+
  '<b>(*)</b> درجة نهائي مدخلة كمسودة ولا تدخل في المجموع الحقيقي حتى اعتماد المشرف. '+
  'س١ وس٢: السؤالان القصيران من دروس غير مشمولة بالاختبارين؛ اخت١ واخت٢: الاختباران القصيران، كل منهما من ١٠. والفرق = الفعلي − المتوقع.</p>'+
  '<p class="gb-class-private-note">للاستخدام التعليمي الداخلي من قبل المشرف؛ هذا كشف من المنصة ولا يحل محل سجلات المدرسة الرسمية.</p></div>'+
  '<div class="gb-class-signatures"><div><b>الإعداد والإشراف</b>'+
   '<strong>الأستاذ سعيد بن جمعة بن عبدالله البريكي</strong></div>'+
   '<div><b>مدير المدرسة</b><strong>الأستاذ عبد الله بن علي العيسائي</strong></div></div>'+
  '</section>';
}
function gbClassPanel(){
 const report=auth.gbClassReport,cls=auth.gbSelectedClass;
 const choices=GB_CLASS_NAMES.map(name=>'<option value="'+e(name)+'"'+(cls===name?' selected':'')+'>'+e(name)+'</option>').join('');
 return '<section class="panel gb-class-panel"><h3>🧾 طباعة كشف الدرجات الجماعي لكل شعبة</h3>'+
 '<p>يعرض كشف الشعبة أسماء طلابها حسب الرقم التسلسلي المعتمد، والشفوي ١٠، والسؤالين القصيرين ١٠، والاختبارين القصيرين ٢٠، والكتابي ٥، والواجب ٥، والمشروع ١٠؛ ثم التوقع وفق A+ وA− من ٤٠ والنهائي الحقيقي من ٤٠، والنتيجتين من ١٠٠ والفرق بينهما.</p>'+
 '<div class="gb-class-toolbar"><label for="gbClassSelect">اختر شعبة الصف السادس</label>'+
 '<select id="gbClassSelect">'+choices+'</select>'+
 '<label class="ss-print-label">اتجاه الورق <select id="gbClassOrientation"><option value="landscape">A4 أفقي (كشف جدولي)</option><option value="portrait">A4 عمودي (بطاقات واضحة لكل طالب)</option></select></label>'+
 '<button class="soft" type="button" id="gbClassReload" '+(auth.gbClassLoading?'disabled':'')+'>تحديث الكشف</button>'+
 '<button class="primary" type="button" id="gbClassPrint" '+(!report||auth.gbClassLoading?'disabled':'')+'>🖨️ طباعة كشف الشعبة / حفظ PDF</button></div>'+
 (auth.gbClassLoading?'<p class="notice">يُحمّل سجل الشعبة من قاعدة البيانات...</p>':'')+
 (auth.gbClassError?'<p class="notice">'+e(auth.gbClassError)+'</p>':'')+
 (report?'<div class="gb-class-screen-result">'+gbClassReportMarkup(report)+'</div>':
 !auth.gbClassLoading?'<p class="muted">اختر الشعبة ثم حدّث الكشف لعرض درجات جميع طلابها، حتى من لم تُسجل لهم درجات بعد.</p>':'')+
 '</section>';
}
function gbPrintClassReport(){
 if(!gbClassAllowed()||!auth.gbClassReport)return;
 const source=document.getElementById('gbPrintableClassSheet');if(!source)return;
 const orientation=document.getElementById('gbClassOrientation')?.value||'landscape';
 if(typeof staffSuitePrint==='function'){
  staffSuitePrint(source,'class',orientation,auth.gbClassReport);return
 }
 document.getElementById('afaqClassPrintMount')?.remove();
 const mount=document.createElement('div');mount.id='afaqClassPrintMount';
 mount.appendChild(source.cloneNode(true));document.body.appendChild(mount);
 document.body.classList.add('afaq-print-class-sheet');
 window.print();
}
window.addEventListener('afterprint',()=>{
 document.body.classList.remove('afaq-print-class-sheet');
 document.getElementById('afaqClassPrintMount')?.remove();
});

const gbOriginalPersonalPanel=personalPanel,gbOriginalStudentAdmin=studentAdmin;
const gbOriginalStaffPanel=staffPanel,gbOriginalStaffOverview=staffOverview,gbOriginalAttachPortal=attachPortal;
personalPanel=function(p){
 const page=gbOriginalPersonalPanel(p);
 return p&&!p.demo?page.replace(scoreTiles(scoreView(p)),gbSummary(p,false)):page;
};
studentAdmin=function(){
 let page=gbOriginalStudentAdmin();
 if(!auth.selectedStudent)return page;
 if(auth.selectedProfile){
  const old=scoreTiles(scoreView(auth.selectedProfile));
  page=page.replace(old,gbSummary(auth.selectedProfile,true));
 }
 page=page.replace(/<form id="scoreForm">[\s\S]*?<\/form>/,gbForm(auth.selectedProfile));
 return page;
};
if(!staffMenu.some(x=>x[0]==='approvals'))staffMenu.push(['approvals','اعتماد النتائج']);
if(!staffMenu.some(x=>x[0]==='class_results'))staffMenu.push(['class_results','كشوف الشعب']);
staffPanel=function(){
 if(auth.section==='class_results'&&gbClassAllowed()){
  const tabs=staffMenu.filter(([key])=>isAdmin()||key!=='approvals').map(([key,title])=>
   '<button class="chip '+(auth.section===key?'sel':'')+'" data-tab="'+e(key)+'">'+e(title)+'</button>').join('');
  return '<div class="dashboard-banner"><div><h2>كشوف درجات الشعب الثلاث</h2>'+
   '<p>كشوف خاصة بالمشرف ومساعده؛ تعرض المتوقع والحقيقي وحالة اعتماد كل طالب.</p></div>'+
   '<button class="outline" id="portalLogout">خروج آمن</button></div>'+
   '<div class="chips">'+tabs+'</div>'+
   (auth.error||auth.message?infoMessage():'')+gbClassPanel();
 }
 if(auth.section!=='approvals'||!isAdmin()){
  const base=gbOriginalStaffPanel();
  if(gbClassAllowed()&&!isAdmin()&&base.includes('<div class="chips">'))
   return base.replace('<div class="chips">','<div class="chips"><button class="chip" data-tab="class_results">كشوف الشعب</button>');
  return base;
 }
 const tabs=staffMenu.map(([key,title])=>'<button class="chip '+(auth.section===key?'sel':'')+'" data-tab="'+e(key)+'">'+e(title)+'</button>').join('');
 const rows=(auth.roster||[]).filter(x=>x.status==='draft'||x.status==='approved');
 const stats='<div class="gb-tiles"><div><strong>'+gbNum(rows.filter(x=>x.status==='draft').length)+'</strong><small>مسودات تحتاج مراجعة</small></div>'+
 '<div><strong>'+gbNum(rows.filter(x=>x.status==='approved').length)+'</strong><small>نتائج معتمدة</small></div></div>';
 const entries=rows.map(x=>'<div class="admin-row"><span><b>'+e(x.full_name||x.display_name)+'</b> — '+e(x.class_name)+' • '+gbNum(x.serial_no)+
 ' — '+(x.status==='draft'?'التوقع قيد الاعتماد':'التوقع معتمد: '+gbNum(x.total)+' / ١٠٠')+
 (x.final_status==='approved'?' • الفعلي معتمد: '+gbNum(x.actual_total)+' / ١٠٠':'')+'</span>'+
 '<button class="soft" data-gb-open="'+e(x.class_name)+'|'+gbNum(x.serial_no)+'">فتح سجل الطالب</button></div>').join('');
 return '<div class="dashboard-banner"><div><h2>مراجعة واعتماد نتائج الطلاب</h2>'+
 '<p>المشرف الرئيسي وحده يعتمد النتائج ويعيد فتحها للمراجعة. وتبقى المسودات غير ظاهرة للطلاب.</p></div>'+
 '<button class="outline" id="portalLogout">خروج آمن</button></div>'+
 '<div class="chips">'+tabs+'</div>'+(auth.error||auth.message?infoMessage():'')+
 '<section class="panel"><h3>سجل الاعتماد المدرسي — مستقل عن مسابقة النجوم</h3>'+stats+
 '<p>تحقق من درجات الأسئلة الأربعة والاختبارين والمشروع والشفوي، ومن التوقع A من ٤٠؛ واعتمد الاختبار النهائي لاحقًا بصورة مستقلة.</p>'+
 (entries||'<p>لا توجد مسودات مسجلة بعد. استخدم قسم «الطلاب والدرجات» لبدء الرصد.</p>')+'</section>';
};
staffOverview=function(){
 const html=gbOriginalStaffOverview();
 return html.replaceAll('تقييمًا، المتوسط','نتيجة معتمدة، المتوسط').replaceAll('التقييم: لم يرصد','التقييم: لم يُعتمد');
};
const gbRefresh=async (profile,message)=>{
 auth.selectedProfile=profile;auth.error='';auth.message=message;
 try{const [d,r]=await Promise.all([api('dashboard'),api('public_roster')]);auth.stats=d;auth.roster=r.students||[]}catch{}
 render();
};
const gbSelected=()=>auth.selectedStudent;

function gbPrint(mode='prediction'){
 if(!['prediction','final'].includes(mode))return;
 const certificate=document.getElementById('afaqSchoolGradeCertificate-'+mode);
 if(!certificate)return;
 const orientation=document.getElementById('gbOrientation-'+mode)?.value||'portrait';
 if(typeof staffSuitePrint==='function'){
  staffSuitePrint(certificate,'certificate',orientation);return
 }
 document.getElementById('afaqSchoolPrintMount')?.remove();
 const mount=document.createElement('div');
 mount.id='afaqSchoolPrintMount';
 mount.appendChild(certificate.cloneNode(true));
 document.body.appendChild(mount);
 document.body.classList.add('afaq-print-school-grade');
 window.print();
}
window.addEventListener('afterprint',()=>{
 document.body.classList.remove('afaq-print-school-grade');
 document.getElementById('afaqSchoolPrintMount')?.remove();
});
function gbShare(mode,channel){
 if(!['prediction','final'].includes(mode)||!['whatsapp','email'].includes(channel))return;
 const source=auth.user?.role==='student'?auth.profile:auth.selectedProfile;
 const text=gbShareText(source,mode);
 if(!text)return;
 if(channel==='whatsapp'){
  window.open('https://api.whatsapp.com/send?text='+encodeURIComponent(text),'_blank','noopener,noreferrer');
 }else{
  const subject=mode==='final'?'نتيجة الرياضيات الفعلية بعد الاختبار النهائي':'توقع درجة الرياضيات قبل الاختبار النهائي';
  window.location.href='mailto:?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(text);
 }
}

attachPortal=function(){
 gbOriginalAttachPortal();
 document.getElementById('portalLogout')?.addEventListener('click',()=>{
  auth.gbClassReport=null;auth.gbClassError='';auth.gbClassLoading=false;
 });
 document.querySelectorAll('[data-tab="class_results"]').forEach(el=>el.addEventListener('click',()=>{
  if(gbClassAllowed()&&!auth.gbClassReport&&!auth.gbClassLoading)
   gbLoadClassReport(auth.gbSelectedClass);
 }));
 document.getElementById('gbClassSelect')?.addEventListener('change',ev=>{
  const selected=ev.target.value;if(GB_CLASS_NAMES.includes(selected))gbLoadClassReport(selected);
 });
 document.getElementById('gbClassReload')?.addEventListener('click',()=>gbLoadClassReport(auth.gbSelectedClass));
 document.getElementById('gbClassPrint')?.addEventListener('click',gbPrintClassReport);
 document.querySelectorAll('[data-print-gradebook]').forEach(el=>el.addEventListener('click',()=>gbPrint(el.dataset.printGradebook)));
 document.querySelectorAll('[data-gb-share]').forEach(el=>el.addEventListener('click',()=>gbShare(el.dataset.gbShare,el.dataset.gbChannel)));
 document.querySelectorAll('[data-gb-open]').forEach(el=>el.addEventListener('click',async()=>{
  const pair=el.dataset.gbOpen.split('|'),student=(auth.students||[]).find(x=>x.class_name===pair[0]&&gbNum(x.serial_no)===pair[1]);
  if(!student)return;
  auth.selectedStudent=student.student_id;auth.selectedProfile=null;auth.section='students';
  try{auth.selectedProfile=(await api('profile',{student_id:student.student_id})).profile;auth.error=''}catch(err){auth.error=err.message}
  render();
 }));
 document.getElementById('gbKind')?.addEventListener('change',ev=>{
  const types=ev.target.value==='plus'?GB_PLUS:GB_MINUS;
  const sel=document.getElementById('gbCategory');
  if(sel)sel.innerHTML=types.map(x=>'<option value="'+e(x)+'">'+e(x)+'</option>').join('');
 });
 document.getElementById('gbAssessmentForm')?.addEventListener('submit',async ev=>{
  ev.preventDefault();const student=gbSelected();if(!student)return;
  const data=new FormData(ev.currentTarget),fields={};
  for(const [key] of GB_COMPONENTS){const raw=String(data.get(key)??'').trim();fields[key]=raw===''?null:Number(raw)}
  try{const result=await api('save_assessment',{student_id:student,
    expected_updated_at:auth.selectedProfile?.assessment?.updated_at||null,...fields});
   await gbRefresh(result.profile,'حُفظت الدرجات كمسودة؛ تُفعّل أسئلة العلاج والإثراء فورًا بحسب نسبة كل عنصر، وتظهر أسباب التكليف ونتائج التغذية الراجعة أدناه. أما درجات التحصيل فلا تُنشر للطالب حتى اعتمادها.')}
  catch(err){auth.error=gbErr(err.message);render()}
 });
 
 document.getElementById('gbFinalForm')?.addEventListener('submit',async ev=>{
  ev.preventDefault();const student=gbSelected();if(!student)return;
  const data=new FormData(ev.currentTarget);
  const raw=String(data.get('final_score')??'').trim();
  try{
   const result=await api('save_final_score',{student_id:student,
    expected_updated_at:auth.selectedProfile?.assessment?.updated_at||null,
    final_score:raw===''?null:Number(raw)});
   await gbRefresh(result.profile,'حُفظت درجة الاختبار النهائي بصورة مستقلة، ولم تُنشر بعد في شهادة النتيجة الفعلية.');
  }catch(err){auth.error=gbErr(err.message);render()}
 });
 for(const [id,action,success] of [
  ['gbApproveFinal','approve_final_score','تم اعتماد الاختبار النهائي وإصدار شهادة الدرجة الحقيقية والمقارنة مع التوقع.'],
  ['gbReopenFinal','reopen_final_score','أُعيد فتح درجة النهائي للمراجعة؛ بقيت شهادة التوقع الأولى معتمدة.']
 ]){
  document.getElementById(id)?.addEventListener('click',async()=>{
   if(!isAdmin()||!gbSelected())return;
   if(!window.confirm(action==='approve_final_score'?'اعتماد درجة النهائي من ٤٠ ونشر الشهادة الثانية؟':
    'إلغاء اعتماد النتيجة الحقيقية مؤقتًا مع إبقاء التوقع معتمدًا؟'))return;
   try{
    const result=await api(action,{student_id:gbSelected(),
     expected_updated_at:auth.selectedProfile?.assessment?.updated_at||null});
    await gbRefresh(result.profile,success);
   }catch(err){auth.error=gbErr(err.message);render()}
  });
 }

 document.getElementById('gbEventForm')?.addEventListener('submit',async ev=>{
  ev.preventDefault();const student=gbSelected();if(!student)return;
  const data=new FormData(ev.currentTarget);
  try{const result=await api('record_a_event',{student_id:student,
   expected_updated_at:auth.selectedProfile?.assessment?.updated_at||null,
   kind:data.get('kind'),category:data.get('category'),points:Number(data.get('points')),
   note:String(data.get('note')||'')});
   await gbRefresh(result.profile,'حُفظت نقاط A+ أو A− مع السبب، دون تغيير الدرجة النهائية المعتمدة من ٤٠.')}
  catch(err){auth.error=gbErr(err.message);render()}
 });
 for(const [id,action,success] of [['gbApprove','approve_assessment','تم اعتماد درجة التوقع ونشر الشهادة الأولى للطالب.'],
                                  ['gbReopen','reopen_assessment','أعيد فتح التوقع للمراجعة وأوقفت شهادته مؤقتًا.']]){
  document.getElementById(id)?.addEventListener('click',async()=>{
   if(!isAdmin()||!gbSelected())return;
   if(!window.confirm(action==='approve_assessment'?'اعتماد درجة التوقع ونشر الشهادة الأولى للطالب؟':'إعادة فتح التوقع للتعديل وإيقاف اعتماده مؤقتًا؟'))return;
   try{const result=await api(action,{student_id:gbSelected(),
     expected_updated_at:auth.selectedProfile?.assessment?.updated_at||null});
    await gbRefresh(result.profile,success)}
   catch(err){auth.error=gbErr(err.message);render()}
  });
 }
 document.getElementById('gbAudit')?.addEventListener('click',async()=>{
  try{const r=await api('assessment_audit',{student_id:gbSelected()});
   const box=document.getElementById('gbAuditOutput');
   if(box)box.innerHTML='<h4>آخر إجراءات الرصد والاعتماد</h4>'+
    (r.events||[]).map(x=>'<p>'+e(x.action)+' • '+e(x.actor_username)+' • '+gbDate(x.created_at)+'</p>').join('')||'لا توجد عمليات';
  }catch(err){auth.error=gbErr(err.message);render()}
 });
};
