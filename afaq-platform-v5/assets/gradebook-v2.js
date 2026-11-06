/* سجل نتائج آفاق الرياضيات — الشفوي ١٠، الكتابي ١٠، القصيرة ٢٠، الواجب ١٠، المشروع ١٠، منافسات A ٤٠. */
'use strict';
const GB_COMPONENTS=[
 ['oral_score','الأعمال الشفوية',10],
 ['short1_score','سؤال الوحدة الأولى',5],['short2_score','سؤال الوحدة الثانية',5],
 ['short3_score','سؤال الوحدة الثالثة',5],['short4_score','سؤال الوحدة الرابعة',5],
 ['short_exam1_score','الاختبار القصير الأول',10],['short_exam2_score','الاختبار القصير الثاني',10],
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
  '</p><p>٦٠ درجة أعمال فصلية (شفوي ١٠، أربعة أسئلة وحدات × ٥، اختباران قصيران × ١٠، مشروع ١٠)، و٤٠ درجة للتوقع أو الاختبار النهائي.</p></section>';
 const approved=a.status==='approved',real=a.final_status==='approved'&&a.final_complete&&a.actual_total!==null;
 const sections=[
  ['الأعمال الشفوية',a.oral_score,10],
  ['أسئلة الوحدات الأربع',a.short_questions,20],
  ['الاختباران القصيران',a.short_exams,20],
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
 '<details class="gb-breakdown"><summary>تفاصيل أسئلة الوحدات والاختبارين القصيرين وسجل A</summary>'+
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
 return '<div class="gb-print-controls"><button class="primary" type="button" data-print-gradebook="'+mode+'">🖨️ طباعة '+label+' / حفظ PDF</button>'+
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
 const questionRows=[1,2,3,4].map(n=>'<tr><td>سؤال الوحدة '+gbNum(n)+'</td><td>'+gbNum(a['short'+n+'_score'])+' / ٥</td></tr>').join('');
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
 '<tr class="gb-cert-sub"><td>مجموع أسئلة الوحدات الأربع</td><td>'+gbNum(a.short_questions)+' / ٢٠</td></tr>'+
 examRows+
 '<tr class="gb-cert-sub"><td>مجموع الاختبارين القصيرين</td><td>'+gbNum(a.short_exams)+' / ٢٠</td></tr>'+
 '<tr><td>المشروع الرياضي</td><td>'+gbNum(a.project_score)+' / ١٠</td></tr>'+
 '<tr class="gb-cert-sub"><td>المجموع قبل النهائي</td><td>'+gbNum(sub)+' / ٦٠</td></tr>'+
 '<tr class="gb-cert-last"><td>'+(final?'الاختبار النهائي (الدرجة الحقيقية)':
 'توقع الاختبار النهائي من مؤشرات A+ وA−')+'</td><td>'+gbNum(chosen)+' / ٤٠</td></tr>'+
 '</tbody></table></div><div class="gb-cert-achievement"><div class="gb-cert-emblem">★ <span>'+
 e(total>=90?'متفوق':total>=75?'مجتهد ومتميز':'روح المثابرة')+'</span> ★</div>'+
 '<p>الأعمال الشفوية وأسئلة الوحدات والاختبارات والمشروع</p><strong>'+gbNum(sub)+' / ٦٠</strong>'+
 '<p>'+(final?'درجة الاختبار النهائي':'التوقع وفق A+ وA−')+'</p><strong>'+gbNum(chosen)+' / ٤٠</strong>'+
 '<div class="gb-cert-total"><span>'+(final?'الدرجة الحقيقية النهائية':'الدرجة المتوقعة قبل النهائي')+
 '</span><b>'+gbNum(total)+' / ١٠٠</b><small>'+gbNum(total)+'٪</small></div>'+
 (!final?'<p class="gb-cert-a">مؤشرات الدفتر: A+ = '+gbNum(a.a_plus_points)+'، A− = '+gbNum(a.a_minus_points)+'</p>':
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
  'أسئلة الوحدات الأربع: '+gbNum(a.short_questions)+'/٢٠',
  'الاختباران القصيران: '+gbNum(a.short_exams)+'/٢٠',
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
 const a=p?.assessment||{},approved=a.status==='approved';
 const cells=GB_COMPONENTS.map(([k,label,max])=>'<div><label for="gb-'+k+'">'+e(label)+' — من '+gbNum(max)+'</label>'+
 '<input id="gb-'+k+'" name="'+k+'" type="number" min="0" max="'+max+'" step="1" value="'+(a[k]==null?'':e(a[k]))+'" '+(approved?'disabled':'')+' placeholder="لم تُرصد بعد"></div>').join('');
 const fields='<div class="gb-input-grid">'+cells+'</div>';
 const raw='<div class="gb-raw-points"><h4>🏅 سجل المنافسات الصفية A+ وA−</h4>'+
 '<p>النقاط الموجبة للمسابقات والتميز؛ السالبة للإخفاق أو المخالفات. تُرصد أسباب كل واقعة، ثم تُحدد الدرجة الفعلية للمنافسات من ٤٠ يدويًا.</p>'+
 '<div class="gb-tiles"><div><strong>A+ = '+gbNum(a.a_plus_points||0)+'</strong><small>مجموع النقاط الموجبة</small></div>'+
 '<div><strong>A− = '+gbNum(a.a_minus_points||0)+'</strong><small>مجموع النقاط السالبة</small></div>'+
 '<div><strong>'+gbNum(a.a_suggested||0)+' / ٤٠</strong><small>مؤشر استرشادي فقط</small></div></div>'+
 (approved?'<p class="notice">أعيد فتح الدرجة المعتمدة أولًا قبل تعديل نقاط المنافسات.</p>':
 '<form id="gbEventForm"><div class="gb-input-grid">'+
 '<div><label>نوع الرصد</label><select id="gbKind" name="kind"><option value="plus">A+ موجب</option><option value="minus">A− سالب</option></select></div>'+
 '<div><label>سبب الرصد</label><select id="gbCategory" name="category">'+GB_PLUS.map(x=>'<option value="'+e(x)+'">'+e(x)+'</option>').join('')+'</select></div>'+
 '<div><label>عدد النقاط</label><input name="points" type="number" min="1" max="20" value="1" required></div>'+
 '<div><label>توضيح اختياري</label><input name="note" type="text" maxlength="400" placeholder="مثال: الفوز في دائرة الضوء"></div></div>'+
 '<button class="soft" type="submit">إضافة نقطة موثقة في سجل A</button></form>')+'</div>';
 const save=approved?'':('<button class="primary" type="submit">💾 حفظ درجات المسودة</button>');
 const status='<p class="gb-approval '+(approved?'gb-approved':'gb-draft')+'">'+(approved?'✓ هذه الدرجة معتمدة':'مسودة لم تُعتمد بعد')+'</p>';
 const admin=isAdmin()?(approved?
 '<button type="button" class="outline gb-reopen" id="gbReopen">🔓 إعادة فتح الدرجة المعتمدة للتعديل</button>':
 '<button type="button" class="primary gb-approve" id="gbApprove" '+(!a.complete?'disabled':'')+'>✓ اعتماد النتيجة النهائية ونشرها للطالب</button>')+
 '<button type="button" class="outline" id="gbAudit">سجل عمليات التعديل والاعتماد</button>':'';
 return '<section class="gb-editor"><h3>📝 توزيع الـ١٠٠ درجة واعتماد المشرف</h3>'+
 '<p>الشفوي ١٠ + الكتابي ١٠ + ٤ قصيرة × ٥ = ٢٠ + الواجب ١٠ + المشروع ١٠ = ٦٠، وتضاف درجة منافسات A الفعلية من ٤٠.</p>'+
 status+'<form id="gbAssessmentForm">'+fields+'<div class="gb-form-buttons">'+save+'</div></form>'+
 raw+'<div class="gb-form-buttons">'+admin+'</div><div id="gbAuditOutput"></div></section>';
}
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
staffPanel=function(){
 if(auth.section!=='approvals'||!isAdmin())return gbOriginalStaffPanel();
 const tabs=staffMenu.map(([key,title])=>'<button class="chip '+(auth.section===key?'sel':'')+'" data-tab="'+e(key)+'">'+e(title)+'</button>').join('');
 const rows=(auth.roster||[]).filter(x=>x.status==='draft'||x.status==='approved');
 const stats='<div class="gb-tiles"><div><strong>'+gbNum(rows.filter(x=>x.status==='draft').length)+'</strong><small>مسودات تحتاج مراجعة</small></div>'+
 '<div><strong>'+gbNum(rows.filter(x=>x.status==='approved').length)+'</strong><small>نتائج معتمدة</small></div></div>';
 const entries=rows.map(x=>'<div class="admin-row"><span><b>'+e(x.full_name||x.display_name)+'</b> — '+e(x.class_name)+' • '+gbNum(x.serial_no)+
 ' — '+(x.status==='draft'?'قيد الاعتماد':'معتمد: '+gbNum(x.total)+' / ١٠٠')+'</span>'+
 '<button class="soft" data-gb-open="'+e(x.class_name)+'|'+gbNum(x.serial_no)+'">فتح سجل الطالب</button></div>').join('');
 return '<div class="dashboard-banner"><div><h2>مراجعة واعتماد نتائج الطلاب</h2>'+
 '<p>المشرف الرئيسي وحده يعتمد النتائج ويعيد فتحها للمراجعة. وتبقى المسودات غير ظاهرة للطلاب.</p></div>'+
 '<button class="outline" id="portalLogout">خروج آمن</button></div>'+
 '<div class="chips">'+tabs+'</div>'+(auth.error||auth.message?infoMessage():'')+
 '<section class="panel"><h3>سجل الاعتماد المدرسي — مستقل عن مسابقة النجوم</h3>'+stats+
 '<p>تحقق من الدرجات التسع، بما فيها الدرجة الفعلية لمنافسات A من ٤٠، قبل الاعتماد.</p>'+
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
function gbPrint(){
 const certificate=document.getElementById('afaqSchoolGradeCertificate');
 if(!certificate)return;
 const previous=document.getElementById('afaqSchoolPrintMount');
 if(previous)previous.remove();
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
attachPortal=function(){
 gbOriginalAttachPortal();
 document.querySelectorAll('[data-print-gradebook]').forEach(el=>el.addEventListener('click',gbPrint));
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
   await gbRefresh(result.profile,'حُفظت الدرجات كمسودة. لن تُنشر للطالب حتى تعتمد جميع عناصرها.')}
  catch(err){auth.error=gbErr(err.message);render()}
 });
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
 for(const [id,action,success] of [['gbApprove','approve_assessment','تم اعتماد الدرجة ونشرها للطالب.'],
                                  ['gbReopen','reopen_assessment','أعيد فتح الدرجة للمراجعة، ولم تعد معتمدة أمام الطالب.']]){
  document.getElementById(id)?.addEventListener('click',async()=>{
   if(!isAdmin()||!gbSelected())return;
   if(!window.confirm(action==='approve_assessment'?'اعتماد جميع الدرجات ونشرها للطالب؟':'إلغاء الاعتماد مؤقتًا وإعادة فتح الدرجات؟'))return;
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
