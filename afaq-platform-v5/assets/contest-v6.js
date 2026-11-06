'use strict';
/* نجوم آفاق الرياضيات: عرض مصوّر للمراحل الخمس، والتصحيح الخادمي للمحاولتين. */
const API='https://xcwuwflggiwkehzquugz.supabase.co/functions/v1/afaq-platform-api';
const GAME='https://xcwuwflggiwkehzquugz.supabase.co/functions/v1/afaq-contest-v2';
const tokenKey='afaq_access_token_v2';

/* Original synthesized motivational cues, stage celebrations and user-controlled sound. */
let afaqAudioEnabled=localStorage.getItem('afaq_stars_sound')==='on';
let afaqAudioContext=null, afaqLastEffect=0;
const afaqReduceMotion=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true;
function afaqAudioContextReady(){
 if(!afaqAudioEnabled)return null;
 try{afaqAudioContext??=new (window.AudioContext||window.webkitAudioContext)();afaqAudioContext.resume?.();return afaqAudioContext}catch{return null}
}
function afaqTone(freq,start,duration,type='sine',vol=.052){
 const ctx=afaqAudioContextReady();if(!ctx)return;
 const oscillator=ctx.createOscillator(),gain=ctx.createGain(),t=ctx.currentTime+start;
 oscillator.type=type;oscillator.frequency.setValueAtTime(freq,t);
 gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(vol,t+.025);
 gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
 oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start(t);oscillator.stop(t+duration+.04);
}
function afaqTune(stageNo,kind){
 if(!afaqAudioEnabled)return;
 const motifs={
  correct:[[659,784,988,1319],[392,523,659,784],[523,659,880,1047],[440,587,784,1175],[587,740,988,1480]],
  incorrect:[[523,440,392],[587,494,392],[622,494,370],[440,392,330],[494,415,349]],
  start:[[392,523,659],[440,554,740],[523,659,784],[587,740,880],[659,831,988]],
  finish:[[392,523,659,784,988,1319],[440,554,740,880,1108,1480],[523,659,784,1047,1319,1568],[587,740,880,1175,1480,1760],[659,831,988,1319,1661,1976]]
 };
 const pitches=motifs[kind]?.[Math.min(4,Math.max(0,stageNo-1))]||motifs.correct[0];
 pitches.forEach((f,i)=>afaqTone(f,i*(kind==='finish'?.125:.108),kind==='finish'?.27:.16,kind==='incorrect'?'triangle':'sine',kind==='incorrect'?.032:.055));
}
function afaqDecorate(kind='confetti',quantity=16){
 if(afaqReduceMotion())return;
 const symbols=kind==='balloons'?['🎈','🎈','⭐','✨']:kind==='fireworks'?['🎆','🎇','✨','🌟','💫']:['⭐','🎉','✨','💫','🎊'];
 const layer=document.createElement('div');layer.className='afaq-party-layer';layer.setAttribute('aria-hidden','true');
 const width=Math.min(96,quantity);for(let i=0;i<width;i++){
  const part=document.createElement('span');part.textContent=symbols[i%symbols.length];
  part.className='afaq-party-piece '+(kind==='balloons'?'afaq-balloon':kind==='fireworks'?'afaq-firework':'afaq-confetti');
  part.style.left=(4+(i*37)%92)+'%';part.style.animationDelay=((i*3)%17/22)+'s';
  part.style.fontSize=(kind==='fireworks'?25+(i%4)*7:21+(i%3)*6)+'px';
  layer.appendChild(part);
 }
 document.body.appendChild(layer);setTimeout(()=>layer.remove(),kind==='balloons'?4800:3300);
}
function afaqCelebrateCorrect(stageNo,final=false,stageEnd=false){
 afaqTune(stageNo,final?'finish':'correct');
 if(final)afaqDecorate('fireworks',52);
 else if(stageEnd)afaqDecorate('balloons',19);
 else afaqDecorate('confetti',12);
}
function afaqSoundButton(){
 return '<button type="button" class="afaq-audio-toggle" id="afaqSoundToggle" aria-pressed="'+afaqAudioEnabled+'" title="التحكم بالمؤثرات الصوتية">🔊 '+(afaqAudioEnabled?'الصوت مفعّل':'تشغيل الصوت')+'</button>';
}

const root=document.getElementById('contestApp');
const stageInfo=[
 {title:'جامبول وداروين',desc:'بوابة الأعداد والمفاهيم',time:25,detail:'١٠ أسئلة — ٢٥ ثانية لكل سؤال'},
 {title:'عامر',desc:'تحدي المهارات',time:20,detail:'١٠ أسئلة — ٢٠ ثانية لكل سؤال'},
 {title:'ستيف',desc:'سباق السرعة',time:17,detail:'١٠ أسئلة — ١٧ ثانية لكل سؤال'},
 {title:'مستر بين',desc:'المختبر الرياضي',time:720,detail:'٤ مسائل مركبة — ١٢ دقيقة للمرحلة'},
 {title:'الأستاذ سعيد',desc:'تحدي الاستدلال',time:600,detail:'٤ مسائل مركبة — ١٠ دقائق للمرحلة'}
];
const models={A:'المحاولة الرسمية الأولى',B:'المحاولة الرسمية الثانية',C:'نموذج الطالب',D:'نموذج الإدارة',E:'نموذج المشرف',F:'نموذج مساعد المشرف'};
const roleModels={student:'C',demo:'C',director:'D',deputy:'D',supervisor:'E',supervisor_assistant:'F'};
const gradeNames={5:'الخامس',6:'السادس',7:'السابع',8:'الثامن'};
const STATE={displayName:'',token:sessionStorage.getItem(tokenKey)||'',user:null,grade:6,section:1,mode:'training',catalog:[],report:null,summary:null,staffReport:null,
 questions:[],question:null,answers:{},index:0,readyStage:0,attemptId:null,attemptNo:0,started:0,stageStarted:0,
 waitingUntil:0,waitingMessage:'',lastFeedback:null,feedbackQuestion:null,feedbackAnswer:null,stageScores:{},completedStages:[],feedbackStage:1,holdHandle:null,timer:null,submitted:false,busy:false,result:null,error:'',feedback:'',bank:null,editModel:'A',editing:false,profile:null,certificates:[],certificateView:null,certificateError:''};
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const friendly=v=>escapeHtml(v);
const allowedStaff=()=>['supervisor','supervisor_assistant','director','deputy'].includes(STATE.user?.role);
const supervisor=()=>STATE.user?.role==='supervisor';
const student=()=>STATE.user?.role==='student';
const official=()=>student()&&STATE.grade===6;
const trainingModel=()=>roleModels[STATE.user?.role]||'C';
const trainingTitle=()=>models[trainingModel()]||'نموذج التدريب';
const sampleKey=()=> 'afaq_nonofficial_parts_'+(STATE.user?.username||'demo')+'_'+STATE.grade;
const savedSample=()=>{try{return JSON.parse(sessionStorage.getItem(sampleKey())||'{}')}catch{return {}}};
const keepSample=raw=>{if(STATE.grade===6)return;const p=savedSample();p[STATE.section]=Math.max(Number(p[STATE.section]||0),Number((raw/2).toFixed(2)));sessionStorage.setItem(sampleKey(),JSON.stringify(p))};
const sampleScorePanel=()=>{if(STATE.grade===6)return '';const p=savedSample(),sum=Number(p[1]||0)+Number(p[2]||0);return '<section class="contest-progress"><h3>📈 ملخص القسمين التدريبيين</h3><div class="contest-metrics"><div><strong>'+Number(p[1]||0)+' / ٢٥</strong><small>القسم الأول</small></div><div><strong>'+Number(p[2]||0)+' / ٢٥</strong><small>القسم الثاني</small></div><div><strong>'+(sum*2)+' / ١٠٠</strong><small>المجموع بعد المضاعفة</small></div></div><p>هذه نتائج تدريبية محفوظة في جلسة المتصفح الحالية فقط؛ لا تُسجَّل كمحاولات رسمية ولا تُخلط بنتائج الطلاب.</p></section>'};
const stage=(n)=>stageInfo[n-1]||stageInfo[0];
const image=(src,alt,cls)=>src?'<img class="'+cls+'" src="'+src+'" alt="'+friendly(alt)+'" loading="lazy">':'';
const entryArt=()=>window.AFAQ_ENTRY_ART?.[student()||STATE.user?.role==='demo'?'student':'staff']||'';
const stageArt=n=>window.AFAQ_STAGE_ART?.[n-1]||'';
const stageEndArt=n=>window.AFAQ_STAGE_END_ART?.[n-1]||stageArt(n);
const units=g=>g===6?4:2;
const splitSyllabus={5:[{name:'الأعداد والهندسة',topics:'الوحدتان ١أ الأعداد و١ب الهندسة'},{name:'القياس والأعداد',topics:'الوحدتان ١ج القياس و٢أ الأعداد'}],7:[{name:'الأعداد والجبر والأعداد العشرية والقياس',topics:'الوحدات ١–٤'},{name:'الزوايا والكسور والمساحة والنسب المئوية',topics:'الوحدات ٥–٨'}],8:[{name:'الأعداد والقوى والشبكات والزوايا والكسور',topics:'الوحدات ١–٤'},{name:'الجبر والمساحة والحجم والاحتمالات والنسب المئوية',topics:'الوحدات ٥–٨'}]};
const unitName=(g,s)=>g===6?['الأعداد (١)','القياس','الهندسة','الأعداد (٢)'][s-1]:'القسم '+s+' — '+(splitSyllabus[g]?.[s-1]?.name||'النصف '+(s===1?'الأول':'الثاني'));
const codeError={unauthorized:'انتهت الجلسة، ادخل إلى منصة آفاق أولًا.',forbidden:'هذا الإجراء غير متاح لهذا الحساب.',
 training_unavailable:'نموذج التدريب غير متاح حاليًا.',official_requires_individual_student_account:'تحتاج المحاولات الرسمية إلى حساب طالب فردي.',
 attempt_limit:'لقد استُنفدت المحاولتان الرسميتان لهذه الوحدة.',previous_section_required:'أكمل الوحدة السابقة أولًا.',
 weekly_locked:'لم يمض أسبوع على بداية الوحدة السابقة بعد.',official_model_not_approved:'لم تُعتمد أسئلة المنافسة الرسمية بعد، ويمكنك استخدام التدريب.',
 question_bank_incomplete:'لا تزال بعض الأسئلة قيد المراجعة.',stage_start_required:'اضغط إذن بدء المرحلة أولًا.',stage_not_ready:'المرحلة ليست جاهزة للانطلاق.',question_sequence_changed:'تم تحديث تسلسل الأسئلة؛ عد إلى بوابة الوحدة واستأنف.',invalid_parts:'بيانات السؤال المركب غير صحيحة.'};
async function request(endpoint,action,payload={}){
 let resp;try{resp=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',...(STATE.token?{Authorization:'Bearer '+STATE.token}:{})},body:JSON.stringify({action,...payload}),cache:'no-store'})}catch{throw Error('تعذر الاتصال بالإنترنت')}
 let data;try{data=await resp.json()}catch{throw Error('تعذر استلام رد الخادم')}
 if(!resp.ok||!data?.ok)throw Error(codeError[data?.error]||'تعذر تنفيذ الطلب: '+(data?.error||resp.status));
 return data;
}
const api=(action,payload)=>request(API,action,payload);
const back=(action,payload)=>request(GAME,action,payload);
async function authenticate(){
 if(!STATE.token)return;
 try{let r=await api('me');STATE.user=r.user;STATE.displayName=STATE.user?.role==='demo'?'متسابق الصف '+(gradeNames[Number(r.user.grade)]||''):(STATE.displayName||STATE.user?.username||'المتسابق');STATE.grade=student()||STATE.user.role==='demo'?Number(r.user.grade||6):6;
  if(student()||STATE.user.role==='demo'){STATE.report=(await back('my_results')).report;if(student()){try{const p=(await api('profile'))?.profile?.student;STATE.displayName=p?.full_name||p?.display_name||STATE.displayName;STATE.profile=p||null}catch{}}}
  else {const values=await Promise.all([back('staff_summary'),back('staff_results')]);STATE.summary=values[0].stats;STATE.staffReport=values[1].students;}
  if(student()){try{await loadCertificates()}catch(err){STATE.certificateError=err.message}}
 }catch(e){STATE.user=null;STATE.token='';sessionStorage.removeItem(tokenKey);}
}
const getCurrent=()=>STATE.mode==='official'?STATE.question:STATE.questions[STATE.index];
const currentStage=()=>STATE.readyStage||(getCurrent()?.stage||0);
async function loadCertificates(){
 if(!student())return;
 const r=await back('my_certificates');
 STATE.certificates=Array.isArray(r.certificates)?r.certificates:[];
 if(r.report)STATE.report=r.report;
 STATE.certificateError='';
}
function unitCards(){let cards=[];for(let s=1;s<=units(STATE.grade);s++){
 const part=STATE.report?.parts?.find(x=>x.section===s);
 cards.push('<button class="contest-unit '+(STATE.section===s?'selected':'')+'" data-unit="'+s+'"><span class="unit-num">'+s+'</span><strong>'+(STATE.grade===6?'الوحدة':'القسم')+' '+s+' — '+unitName(STATE.grade,s)+'</strong><small>'+(STATE.grade===6?'١٠٠':'٢٥')+' نقطة</small>'+(STATE.grade===6?'':'<small>'+friendly(splitSyllabus[STATE.grade]?.[s-1]?.topics||'')+'</small>')+(part?'<small>أفضل نتيجة: '+friendly(part.best??'—')+' / ١٠٠ • المحاولات المتاحة: '+friendly(part.attempts_remaining)+'</small>':'')+'</button>');
 }return '<div class="contest-units">'+cards.join('')+'</div>';
}
function road(active=0){return '<div class="stage-track">'+stageInfo.map((st,i)=>'<div class="stage-node '+(i+1===active?'active':i+1<active?'passed':'')+'">'+image(stageArt(i+1),st.title,'stage-pic')+'<strong>'+st.title+'</strong><small>'+st.detail+'</small><b class="stage-points">١٠ نقاط</b></div>').join('')+'</div>'}
function progress(){let r=STATE.report;if(!r)return '';
 return '<section class="contest-progress"><h3>🎖️ تقدمي في مسابقة نجوم آفاق</h3><div class="contest-metrics"><div><strong>'+friendly(r.total)+' / ٤٠٠</strong><small>مجموع أفضل نتائجي</small></div><div><strong>'+friendly(r.completed_units)+' / ٤</strong><small>الوحدات المكتملة</small></div><div><strong>'+friendly(r.attempts_remaining)+'</strong><small>المحاولات المتبقية</small></div><div><strong>'+friendly(r.points_needed)+'</strong><small>نقطة تفصلني عن التأهل</small></div></div><p>'+(r.qualified?'🏆 أكملت الوحدات الأربع وحققت ٣٥٠ نقطة فأكثر؛ أنت ضمن المتأهلين للمفاضلة على الجوائز.':'أكمل الوحدات الأربع، واجمع ٣٥٠ نقطة فأكثر للتأهل للجوائز. تُحتسب أفضل محاولتين رسميتين لكل وحدة.')+'</p></section>';
}
function staffResults(){if(!allowedStaff()||!STATE.staffReport)return '';
 const items=[...STATE.staffReport].sort((a,b)=>Number(b.total)-Number(a.total));
 const columns=supervisor()||STATE.user.role==='supervisor_assistant';
 const rows=items.map((x,i)=>'<tr><td>'+(i+1)+'</td><td>'+friendly(x.class_name)+' • '+friendly(x.serial_no)+'</td><td>'+friendly(x.full_name)+'</td><td>'+friendly(x.total)+'/٤٠٠</td><td>'+x.parts.map(p=>p.best??'—').join('، ')+'</td><td>'+(x.qualified?'متأهل':'لم يتأهل بعد')+'</td>'+(columns?'<td>'+friendly(x.student_id||'')+'</td>':'')+'</tr>').join('');
 return '<section class="panel staff-contest-panel"><h3>📊 نتائج نجوم آفاق الرياضيات للطلاب</h3><p>ترتيب مبدئي حسب مجموع أفضل نتائج الوحدات. التأهل يبدأ من ٣٥٠ نقطة بعد إتمام الوحدات الأربع.</p><div class="result-table-scroll"><table><thead><tr><th>م</th><th>الشعبة والرقم</th><th>الطالب</th><th>المجموع</th><th>الوحدات (١–٤)</th><th>الحالة</th>'+(columns?'<th>الرقم الأصلي</th>':'')+'</tr></thead><tbody>'+rows+'</tbody></table></div></section>';
}
function manager(){if(!supervisor())return '';
 return '<section class="panel contest-admin"><h3>إدارة النماذج ومراجعة الأسئلة المصورة</h3><p>تظهر الرسوم الأصلية وأجزاؤها في شاشة المراجعة. لا تُفتح المحاولات الرسمية حتى اعتماد نماذجها.</p><label for="editModel">النموذج</label><select id="editModel">'+Object.entries(models).map(([k,n])=>'<option value="'+k+'" '+(k===STATE.editModel?'selected':'')+'>'+n+'</option>').join('')+'</select><button class="outline" id="loadBank">عرض بنك الأسئلة</button>'+(STATE.bank?bankView():'')+'</section>';
}
function bankView(){const all=STATE.bank.questions||[];return '<div class="contest-bank"><p>عدد الأسئلة: '+all.length+' / ٣٨</p>'+all.map(q=>'<details><summary>س '+q.ordinal+' | '+friendly(q.objective)+' — '+friendly(q.prompt).slice(0,130)+'</summary>'+
 '<form class="edit-question" data-ordinal="'+q.ordinal+'"><label>نص السؤال</label><textarea name="prompt" rows="3">'+friendly(q.prompt)+'</textarea>'+
 (q.visual_svg?'<div class="contest-preview">'+figure(q)+'</div>':'')+
 '<label>ملف الرسم SVG (للمشرف فقط)</label><textarea name="visual_svg" rows="5">'+friendly(q.visual_svg||'')+'</textarea><label>وصف الرسم</label><input name="visual_caption" value="'+friendly(q.visual_caption||'')+'">'+
 (q.question_kind==='complex'?'<label>أجزاء السؤال بصيغة JSON</label><textarea name="parts" rows="7">'+friendly(JSON.stringify(q.parts,null,2))+'</textarea>':(q.options||[]).map((opt,i)=>'<label>الخيار '+(i+1)+'</label><input name="opt'+i+'" value="'+friendly(opt)+'">').join('')+'<label>رقم الإجابة الصحيحة (٠–٣)</label><input name="answer_index" type="number" min="0" max="3" value="'+q.answer_index+'">')+
 '<button class="soft" type="submit">حفظ التعديل</button></form></details>').join('')+'<button class="primary" id="publishBank">اعتماد النموذج</button><button class="outline" id="unpublishBank">إيقاف النموذج</button></div>'}
function home(){
 const approved=STATE.catalog.some(x=>x.grade===STATE.grade&&x.section===STATE.section&&x.model==='A'&&x.published);
 const introduction=STATE.grade===6?'أربع وحدات • ٤٠٠ نقطة • التأهل من ٣٥٠ نقطة • محاولتان رسميتان لكل وحدة':'قسمان من دروس الفصل الأول • ٢٥ نقطة لكل قسم • المجموع ٥٠ ويضاعف إلى ١٠٠ • تدريب رمزي دون محاولات رسمية';
 const allowed=STATE.mode!=='official'||approved;
 const avatar=image(entryArt(),student()?'الصورة المعتمدة للطالب':'الصورة المعتمدة للمشرف والإدارة','entry-approved-avatar');
 return '<div class="contest-home"><div class="contest-welcome contest-welcome-image">'+avatar+'<div><span class="contest-label">⭐ مسابقة نجوم آفاق الرياضيات ⭐</span><h2>مرحبًا '+friendly(STATE.displayName||STATE.user?.username||'بك')+'</h2><p>'+introduction+'</p></div><button class="outline" id="logoutContest">خروج</button></div>'+ (allowedStaff()?'<div class="contest-grades">'+[5,6,7,8].map(g=>'<button class="'+(STATE.grade===g?'chosen':'')+'" data-grade="'+g+'">الصف '+gradeNames[g]+'</button>').join('')+'</div>':'')+
 unitCards()+progress()+sampleScorePanel()+certificateHistoryPanel()+
 '<h3 class="contest-title">اختر النموذج</h3><div class="contest-modes"><button class="'+(STATE.mode==='training'?'primary':'outline')+'" data-mode="training">🎯 '+trainingTitle()+'</button>'+(official()?'<button class="'+(STATE.mode==='official'?'primary':'outline')+'" data-mode="official">🏆 المحاولات الرسمية</button>':'')+'</div>'+
 '<p class="contest-instructions">المراحل الخمس في التدريب والمحاولات الرسمية متشابهة في العرض والتوقيت والصور. بعد كل إجابة تُعرض الإجابة الصحيحة والتعزيز باسم المتسابق خلال ٥ ثوانٍ ثم تنتقل اللعبة تلقائيًا. وقبل كل مرحلة تظهر شاشة «استعد وابدأ».</p>'+road()+
 '<div class="contest-rules"><b>طريقة احتساب الدرجة:</b> ثلاث مراحل سريعة، ثم مختبر مستر بين، ثم تحدي الأستاذ سعيد. لكل مرحلة ١٠ نقاط، فيكون المجموع ٥٠ ويُضاعف إلى ١٠٠. تُحتسب أفضل نتيجة لكل وحدة.</div>'+
 (approved||STATE.mode!=='official'?'':'<div class="notice">المحاولة الرسمية لهذه الوحدة لم تعتمد بعد؛ يمكنك تجربة نموذج التدريب.</div>')+
 (STATE.error?'<p class="notice" role="alert">'+friendly(STATE.error)+'</p>':'')+
 '<div class="contest-start-wrap"><button class="primary" id="prepare" '+(allowed?'':'disabled')+'>'+(STATE.mode==='official'?'الاستعداد للمحاولة الرسمية':'بدء '+trainingTitle())+'</button></div>'+staffResults()+manager()+'</div>';
}
function readyPage(){
 const n=STATE.readyStage,st=stage(n);
 return '<div class="contest-between-stages">'+(n>1?stageResultsPanel():'')+
 '<section class="stage-ready-page"><div class="ready-art">'+image(stageArt(n),st.title,'stage-ready-photo')+'</div><span class="ready-kicker">استعد للمرحلة '+stext(n)+' من ٥</span><h2>'+st.title+'</h2><h3>'+st.desc+'</h3>'+
 '<p>'+st.detail+' — أحضر تركيزك واستعد للتحدي. سيبدأ وقت المرحلة بعد موافقتك على الانطلاق.</p>'+
 '<div class="ready-rules">✔️ عرض الإجابة الصحيحة بالأخضر والخاطئة بالأحمر • ✔️ الدرجة والنسبة بعد كل سؤال • ✔️ نتائج كل مرحلة • ✔️ الانتقال بعد ٥ ثوانٍ</div>'+
 (STATE.error?'<div class="notice">'+friendly(STATE.error)+'</div>':'')+
 '<div class="ready-buttons"><button class="primary" id="beginStage" '+(STATE.busy?'disabled':'')+'>✅ أوافق على بدء المرحلة — انطلق!</button><button class="outline" id="exitStage">العودة إلى لوحة الوحدات</button></div></section></div>';
}
function figure(q){const svg=String(q?.visual_svg||'');if(!svg.trim().startsWith('<svg')||svg.length>22000)return '';
 const safeSvg='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
 return '<figure class="contest-figure"><img class="contest-diagram" src="'+safeSvg+'" alt="'+friendly(q.visual_caption||q.objective||'شكل توضيحي للسؤال')+'"><figcaption>'+friendly(q.visual_caption||'انظر إلى الرسم ثم أجب عن السؤال')+'</figcaption></figure>';
}
function clockSec(n){if(n<=0)return 0;return Math.max(0,Math.ceil((n-Date.now())/1000))}
function remaining(){const q=getCurrent();if(!q)return 0;const st=stage(q.stage);
 if(q.stage<=3)return clockSec(STATE.started+st.time*1000);
 return clockSec(STATE.stageStarted+st.time*1000);
}
function tformat(seconds,which){return which<=3?seconds+' ث':String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0')}

const nscore=v=>Number.isFinite(Number(v))?Number(v):0;
const stext=v=>new Intl.NumberFormat('ar-OM',{maximumFractionDigits:2}).format(Math.round(nscore(v)*100)/100);
const sper=(a,b)=>b>0?Math.max(0,Math.min(100,Math.round(nscore(a)/b*100))):0;
const stcount=n=>n<=3?10:4;
const ststep=q=>q.stage<=3?(q.ordinal-1)%10+1:(q.ordinal-31)%4+1;
const sttotal=n=>STATE.stageScores[n]||{earned:0,possible:0,answered:0};
const totalEarned=()=>Object.values(STATE.stageScores).reduce((s,v)=>s+nscore(v.earned),0);
function logScore(n,f){if(!f)return;const s=STATE.stageScores[n]||(STATE.stageScores[n]={earned:0,possible:0,answered:0});s.earned+=nscore(f.earned);s.possible+=nscore(f.max);s.answered++;}
function closeStage(n){if(n>=1&&n<=5&&!STATE.completedStages.includes(n))STATE.completedStages.push(n)}
function raceTrack(q,answered=false){
 if(!q)return '';
 const count=stcount(q.stage),done=Math.min(count,Math.max(0,ststep(q)-(answered?0:1))),p=Math.round(100*done/count),from=Math.round(100*Math.max(0,done-1)/count);
 return '<section class="contest-race" aria-label="مؤشر التقدم في المرحلة"><div class="contest-race-heading"><strong>🚗 سباق المرحلة '+stext(q.stage)+'</strong><span>أُنجز '+stext(done)+' من '+stext(count)+' — '+stext(p)+'٪</span></div>'+
 '<div class="contest-race-track" role="progressbar" aria-label="تقدم حل أسئلة المرحلة" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+p+'"><div class="contest-race-fill '+(answered?'race-advance':'')+'" style="width:'+p+'%;--race-start:'+from+'%;--race-end:'+p+'%"><span class="contest-race-car" aria-hidden="true">🚙</span></div><span class="contest-race-finish" aria-hidden="true">🏁</span></div></section>';
}
function stageResultsPanel(){
 const done=STATE.completedStages.slice().sort((a,b)=>a-b);if(!done.length)return '';
 const earned=done.reduce((s,n)=>s+nscore(sttotal(n).earned),0),max=done.length*10;
 return '<section class="contest-stage-results"><h3>📊 حصيلة المراحل المنجزة</h3><div class="contest-stage-result-grid">'+done.map(n=>'<div class="contest-stage-result-item"><span>المرحلة '+stext(n)+' — '+friendly(stage(n).title)+'</span><strong>'+stext(sttotal(n).earned)+' / ١٠</strong><small>'+stext(sper(sttotal(n).earned,10))+'٪ من نقاط المرحلة</small></div>').join('')+
 '</div><div class="contest-stage-total">مجموع المراحل المكتملة: <strong>'+stext(earned)+' / '+stext(max)+'</strong> — <strong>'+stext(sper(earned,max))+'٪</strong></div></section>';
}
function quiz(){const q=getCurrent();if(!q)return '';
 const st=stage(q.stage),isMulti=q.question_kind==='complex',n=q.stage<=3?(q.ordinal-1)%10+1:(q.ordinal-31)%4+1;
 const seconds=remaining(),frac=Math.max(0,Math.min(100,seconds/st.time*100));
 const choices=isMulti?(q.parts||[]).map((part,i)=>'<div class="contest-subpart"><h4>('+String(i+1)+') '+friendly(part.text)+'</h4>'+(part.type==='choice'?'<div class="contest-choice-grid">'+(part.choices||[]).map(v=>'<label><input type="radio" name="part'+i+'" value="'+friendly(v)+'"><span>'+friendly(v)+'</span></label>').join('')+'</div>':'<input class="contest-number" inputmode="decimal" data-part="'+i+'" placeholder="اكتب الإجابة">')+'</div>').join(''):(q.options||[]).map((v,i)=>'<button class="contest-option" data-choice="'+i+'"><span class="option-letter">'+['أ','ب','ج','د'][i]+'</span>'+friendly(v)+'</button>').join('');
 return '<div class="contest-playing"><div class="contest-headline"><div><span>'+(STATE.mode==='official'?'🏆 المحاولة الرسمية':'🎯 '+trainingTitle())+'</span><h2>'+unitName(STATE.grade,STATE.section)+'</h2><small>'+friendly(STATE.displayName||STATE.user?.username||'الطالب')+'</small></div><div class="contest-score-badge"><strong>٥٠ ← ١٠٠</strong><small>أفضل نتيجة</small></div></div>'+road(q.stage)+raceTrack(q,false)+
 '<div class="contest-game-area"><div class="contest-stage-banner"><div class="contest-character">'+image(stageArt(q.stage),st.title,'stage-banner-photo')+'</div><div><span class="contest-label">المرحلة '+q.stage+' من ٥ — ١٠ درجات</span><h2>'+st.title+'</h2><p>'+st.desc+'</p></div><div class="contest-timer"><strong id="contestClock">'+tformat(seconds,q.stage)+'</strong><small>'+(q.stage<=3?'وقت السؤال':'وقت المرحلة')+'</small><span class="contest-timerline"><i id="contestTimerBar" style="width:'+frac+'%"></i></span></div></div><div class="contest-question-meta"><span>السؤال '+n+' من '+(q.stage<=3?10:4)+'</span><span>التقدم '+(STATE.index+1)+' / ٣٨</span><span>'+(isMulti?'مسألة متعددة الأجزاء':'اختيار من متعدد')+'</span></div><div class="contest-question"><h3>'+friendly(q.prompt)+'</h3>'+figure(q)+choices+
 '<div class="contest-help" id="contestHelp">'+friendly(STATE.feedback||('ركز يا '+(STATE.user?.username||'بطل')+'، ثم أجب عن السؤال.'))+'</div></div><div class="contest-controls">'+(isMulti?'<button id="sendComplex" class="primary">✅ إرسال الإجابات والمتابعة</button>':'<p class="auto-answer-hint">اختر الإجابة لعرض التصحيح والتعزيز ثم الانتقال تلقائيًا بعد ٥ ثوانٍ.</p>')+'<button id="finishEarly" class="outline">إنهاء '+(STATE.mode==='official'?'المحاولة':'التدريب')+' الآن</button></div>'+
 (STATE.error?'<div class="notice">'+friendly(STATE.error)+'</div>':'')+'</div></div>';
}
function transition(){
 const sec=clockSec(STATE.waitingUntil),n=STATE.feedbackStage||1,f=STATE.lastFeedback,q=STATE.feedbackQuestion,name=STATE.displayName||STATE.user?.username||'المتسابق';
 let heading='🌟 تم حفظ الإجابة',msg=STATE.waitingMessage||'استعد للتحدي التالي.';
 if(f?.unanswered){heading='⏰ انتهى وقت السؤال';msg='يا '+name+'، راجع الحل الصحيح ثم واصل بثقة.'}
 else if(f?.correct){heading='🌟 إجابة صحيحة!';msg='أحسنت يا '+name+'! إجابة موفقة، استمر!'}
 else if(f){heading='💡 تعلّم من المحاولة';msg='يا '+name+'، راجع التصحيح، والسؤال التالي فرصة جديدة.'}
 let review='';
 if(q){
  let options='';
  if(q.question_kind!=='complex'){
   options='<div class="contest-review-options">'+(q.options||[]).map((v,i)=>{
    const good=f&&String(v)===String(f.correct_answer),picked=STATE.feedbackAnswer!==null&&Number(STATE.feedbackAnswer)===i;
    const cls=good?'answer-correct':picked?'answer-wrong':'',tag=good?'✓ الإجابة الصحيحة':picked?'✕ اختيارك':'';
    return '<div class="contest-option contest-review-option '+cls+'"><span class="option-letter">'+['أ','ب','ج','د'][i]+'</span><span class="contest-option-value">'+friendly(v)+'</span>'+(tag?'<span class="contest-answer-tag">'+tag+'</span>':'')+'</div>';
   }).join('')+'</div>';
  }else{
   const a=Array.isArray(STATE.feedbackAnswer)?STATE.feedbackAnswer:[],correct=Array.isArray(f?.correct_answer)?f.correct_answer:[];
   options='<div class="contest-review-parts">'+(q.parts||[]).map((part,i)=>'<div class="contest-review-part"><strong>('+stext(i+1)+') '+friendly(part.text)+'</strong><span>إجابتك: '+friendly(a[i]??'لم تجب')+'</span><span class="contest-right-answer">✓ الإجابة الصحيحة: '+friendly(correct[i]??'—')+'</span></div>').join('')+'</div>';
  }
  review='<section class="contest-feedback-question"><h3>'+friendly(q.prompt)+'</h3>'+figure(q)+options+'</section>';
 }
 const earned=nscore(f?.earned),max=nscore(f?.max)||1,stageValue=nscore(sttotal(n).earned),grand=totalEarned();
 const metrics=f?'<div class="contest-feedback-metrics"><div><strong>'+stext(earned)+' / '+stext(max)+'</strong><small>درجة السؤال · '+stext(sper(earned,max))+'٪</small></div><div><strong>'+stext(stageValue)+' / ١٠</strong><small>حصيلة المرحلة · '+stext(sper(stageValue,10))+'٪</small></div><div><strong>'+stext(grand)+' / ٥٠</strong><small>الحصيلة العامة · '+stext(sper(grand,50))+'٪</small></div></div>':'';
 return '<div class="contest-feedback-screen">'+raceTrack(q,true)+'<div class="contest-feedback-grid">'+review+
 '<aside class="contest-feedback-summary '+(f?.correct?'is-success':'is-review')+'"><div class="contest-feedback-title">'+image(stageEndArt(n),'شخصية المرحلة','contest-feedback-avatar')+'<div><h2>'+heading+'</h2><p>'+friendly(msg)+'</p></div></div>'+
 metrics+(f?.correct_answer!==undefined?'<p class="contest-correction">✅ الإجابة الصحيحة: '+friendly(Array.isArray(f.correct_answer)?f.correct_answer.join('، '):f.correct_answer)+'</p>':'')+(f?.explanation?'<p class="contest-explanation">💡 '+friendly(f.explanation)+'</p>':'')+
 '<div class="contest-next-box"><span>الانتقال تلقائيًا خلال</span><strong id="nextCountdown">'+stext(sec)+'</strong><span>ثوانٍ</span></div></aside></div></div>';
}

const certStoreKey=()=> 'afaq_training_certificate_v3_'+String(STATE.user?.username||'guest')+'_'+STATE.grade+'_'+STATE.section;
function certificateStages(details){
 if(!Array.isArray(details)||details.length!==38)return [];
 return [1,2,3,4,5].map(n=>{
  const group=n<=3?details.slice((n-1)*10,n*10):details.slice(n===4?30:34,n===4?34:38);
  return {stage:n,earned:group.reduce((s,x)=>s+nscore(x.earned),0),max:10,percent:sper(group.reduce((s,x)=>s+nscore(x.earned),0),10)};
 });
}
function certificateForResult(){
 const r=STATE.result;if(!r)return null;
 const base={grade:STATE.grade,section:STATE.section,training:!!r.training,
  display_name:STATE.displayName||STATE.user?.username||'المتسابق',
  class_name:STATE.profile?.class_name||STATE.profile?.class||STATE.user?.class_name||'',
  serial_no:STATE.profile?.serial_no||STATE.profile?.serial_number||STATE.user?.serial_no||'',
  role:STATE.user?.role||'',ended_at:r.ended_at||new Date().toISOString()};
 if(r.training)return {...base,model:trainingModel(),raw_score:nscore(r.raw_score),score:nscore(r.score??r.percent),
  stage_scores:certificateStages(r.details),early_end:!!r.early_end,report:null};
 const verified=(STATE.certificates||[]).find(x=>x.id===STATE.attemptId);
 if(verified)return {...verified,...base,training:false,report:STATE.report,verified:true};
 const fallback=[1,2,3,4,5].map(n=>sttotal(n).answered===stcount(n)?
  {stage:n,earned:nscore(sttotal(n).earned),max:10,percent:sper(sttotal(n).earned,10)}:null);
 return {...base,id:STATE.attemptId,attempt_no:STATE.attemptNo,model:STATE.attemptNo===2?'B':'A',
  raw_score:nscore(r.raw_score??r.score/2),score:nscore(r.score),stage_scores:fallback,
  report:STATE.report,verified:false};
}
function readTrainingCertificate(){
 try{const c=JSON.parse(sessionStorage.getItem(certStoreKey())||'null');return c?.training&&c.grade===STATE.grade&&c.section===STATE.section?c:null}catch{return null}
}
function saveTrainingCertificate(){
 const cert=certificateForResult();if(!cert?.training)return;
 try{sessionStorage.setItem(certStoreKey(),JSON.stringify(cert))}catch{}
}
function hydrateCertificate(c){
 if(!c)return null;
 return {...c,display_name:STATE.displayName||STATE.user?.username||'المتسابق',
  class_name:STATE.profile?.class_name||STATE.profile?.class||STATE.user?.class_name||'',
  serial_no:STATE.profile?.serial_no||STATE.profile?.serial_number||STATE.user?.serial_no||'',
  role:STATE.user?.role||'',training:false,verified:true,report:STATE.report};
}

function pastTrainingUnit(section){
 try{
  const key='afaq_training_certificate_v3_'+String(STATE.user?.username||'guest')+'_6_'+section;
  const record=JSON.parse(sessionStorage.getItem(key)||'null');
  return record?.training&&Number(record.grade)===6&&Number(record.section)===section?record:null;
 }catch{return null}
}
function trainingResults400(){
 const parts=[1,2,3,4].map(section=>{
  const record=pastTrainingUnit(section);
  return {section,best:record?nscore(record.score):null,finished:!!record&&!record.early_end};
 });
 return {training:true,parts,total:parts.reduce((sum,p)=>sum+nscore(p.best),0),completed_units:parts.filter(p=>p.finished).length,qualified:false,max:400};
}
function certificateReport400(cert){
 if(Number(cert?.grade)!==6)return null;
 return cert.training?trainingResults400():cert.report||STATE.report||null;
}
function certificatePortfolio(training=false){
 if(Number(STATE.grade)!==6)return null;
 const report=training?trainingResults400():STATE.report;
 if(!report)return null;
 const examples=[1,2,3,4].map(section=>{
  if(training)return pastTrainingUnit(section);
  const p=(report.parts||[]).find(v=>Number(v.section)===section);
  if(p?.best==null)return null;
  return (STATE.certificates||[]).find(x=>Number(x.section)===section&&nscore(x.score)===nscore(p.best))||null;
 });
 const allStages=examples.every(x=>Array.isArray(x?.stage_scores)&&x.stage_scores.length===5);
 const stage_scores=allStages?[1,2,3,4,5].map(stageNo=>({
  stage:stageNo,earned:examples.reduce((sum,x)=>sum+nscore(x.stage_scores.find(p=>Number(p.stage)===stageNo)?.earned),0),max:40
 })):[];
 return {portfolio:true,training,grade:6,section:4,model:training?'C':'A',
  display_name:STATE.displayName||STATE.user?.username||'المتسابق',
  class_name:STATE.profile?.class_name||STATE.profile?.class||STATE.user?.class_name||'',
  serial_no:STATE.profile?.serial_no||STATE.profile?.serial_number||STATE.user?.serial_no||'',
  ended_at:new Date().toISOString(),score:nscore(report.total),raw_score:nscore(report.total)/2,
  stage_scores,report:training?null:report};
}

function certificateHistoryPanel(){
 const training=readTrainingCertificate(),official=student()?STATE.certificates||[]:[];
 const trainingAny=STATE.grade===6&&[1,2,3,4].some(n=>pastTrainingUnit(n));
 const officialAny=STATE.grade===6&&student()&&STATE.report;
 if(!training&&!official.length&&!trainingAny&&!officialAny)return '';
 return '<section class="contest-cert-history"><h3>📜 شهاداتي ونتائجي السابقة</h3>'+
 '<p>يمكن طباعة كشف نتائج الوحدات الأربع من ٤٠٠ نقطة، أو الاطلاع على تفاصيل كل محاولة. نتائج التدريب منفصلة عن المنافسة الرسمية.</p>'+
 '<div class="contest-cert-links">'+
 (officialAny?'<button class="primary" data-open-cert="portfolio-official">🏆 شهادة نتائج الوحدات الأربع — '+stext(STATE.report.total)+' / ٤٠٠</button>':'')+
 (trainingAny?'<button class="outline" data-open-cert="portfolio-training">🖨️ كشف نتائج التدريب للوحدات الأربع — '+stext(trainingResults400().total)+' / ٤٠٠</button>':'')+
 (training?'<button class="outline" data-open-cert="training">شهادة تدريب '+friendly(unitName(training.grade,training.section))+' — '+stext(training.score)+' / ١٠٠</button>':'')+
 official.map(x=>'<button class="outline" data-open-cert="'+friendly(x.id)+'">الوحدة '+stext(x.section)+' • المحاولة '+stext(x.attempt_no)+' • '+stext(x.score)+' / ١٠٠</button>').join('')+
 '</div></section>';
}
function certificateDate(v){
 try{return new Intl.DateTimeFormat('ar-OM',{dateStyle:'long',timeZone:'Asia/Muscat'}).format(new Date(v||Date.now()))}catch{return '—'}
}
function certMessage(score){
 if(score>=90)return 'لقد أظهرت تميزًا ملحوظًا في الأداء الرياضي، ودقة في التفكير، ومثابرة تستحق الإشادة.';
 if(score>=75)return 'نُثمن اجتهادك وحسن أدائك في حل التحديات الرياضية، ونتطلع إلى مزيد من التألق.';
 return 'نقدر مشاركتك ومثابرتك في خوض التحديات، ونشجعك على مواصلة التدريب والتقدم بخطى ثابتة.';
}
function certificateMarkup(cert){
 if(!cert)return '';
 const grade=gradeNames[cert.grade]||String(cert.grade),isSix=Number(cert.grade)===6,training=cert.training===true,portfolio=cert.portfolio===true;
 const report=certificateReport400(cert);
 const total=report?nscore(report.total):null,completed=report?nscore(report.completed_units):0;
 const qualified=!training&&report?.qualified===true&&completed===4&&total>=350;
 const stages=Array.isArray(cert.stage_scores)&&cert.stage_scores.length===5&&cert.stage_scores.every(x=>x&&Number.isFinite(Number(x.earned)));
 const title=isSix?(completed===4?'شهادة إنجاز الوحدات الأربع وبيان النتائج':'بيان تقدم ونتائج الوحدات الأربع'):(stages?'شهادة إتمام المراحل وبيان النتائج':'بيان نتائج المحاولة');
 const subtitle=training?'نسخة تدريبية — لا تُحتسب في المنافسة الرسمية':'نتائج المسابقة المسجلة في المنصة';
 const classLine=cert.class_name?'<span><b>الشعبة:</b> '+friendly(cert.class_name)+'</span>':'';
 const serialLine=cert.serial_no?'<span><b>الرقم التسلسلي:</b> '+friendly(cert.serial_no)+'</span>':'';
 let status='';
 if(training)status='نتائج تدريبية لا تُحتسب ضمن التأهل أو الجوائز الرسمية.';
 else if(!report)status='لا تتوفر حاليًا بيانات المجموع العام للوحدات الأربع؛ يرجى تحديث النتائج.';
 else if(qualified)status='متأهل للمفاضلة على الجوائز بعد إتمام الوحدات الأربع وتحقيق ٣٥٠ نقطة فأكثر من ٤٠٠.';
 else if(completed<4&&total>=350)status='بلغ المجموع ٣٥٠ نقطة فأكثر، لكن التأهل يتطلب إتمام الوحدات الأربع.';
 else if(completed<4)status='لم يكتمل التأهل بعد؛ يلزم إتمام الوحدات الأربع وتحقيق ٣٥٠ نقطة فأكثر.';
 else status='أتم الوحدات الأربع، لكنه لم يحقق حد التأهل البالغ ٣٥٠ نقطة.';
 let main='';
 if(isSix){
  const rows=[1,2,3,4].map(n=>{
   const p=(report?.parts||[]).find(x=>Number(x.section)===n);
   const has=p?.best!=null&&Number.isFinite(Number(p.best));
   const score=has?nscore(p.best):null;
   return '<tr><td>'+stext(n)+'</td><td>'+friendly(unitName(6,n))+'</td><td>'+(has?stext(score):'—')+' / ١٠٠</td>'+
    '<td>'+(has?stext(sper(score,100))+'٪':'—')+'</td><td>'+(p?.finished?'مكتملة':has?'غير مكتملة':'لم تُستكمل')+'</td></tr>';
  }).join('');
  main='<section class="afaq-cert-units"><h4>النتائج النهائية للوحدات الأربع</h4><table class="afaq-cert-units-table"><thead><tr>'+
   '<th>الوحدة</th><th>المجال</th><th>الدرجة</th><th>النسبة</th><th>الحالة</th></tr></thead><tbody>'+rows+
   '<tr class="afaq-cert-total"><td colspan="2">المجموع العام للمسابقة</td><td><strong>'+(report?stext(total):'—')+' / ٤٠٠</strong></td>'+
   '<td><strong>'+(report?stext(sper(total,400))+'٪':'—')+'</strong></td><td>'+stext(completed)+' / ٤ مكتملة</td></tr></tbody></table>'+
   '<div class="afaq-cert-overall"><span>المجموع النهائي للوحدات الأربع</span><strong>'+(report?stext(total):'—')+' / ٤٠٠</strong>'+
   '<span>'+(report?stext(sper(total,400))+'٪':'—')+'</span></div>'+
   '<p class="afaq-cert-qualification"><strong>حالة التأهل:</strong> '+friendly(status)+'</p></section>';
 }else{
  main='<div class="afaq-cert-score"><span>نتيجة القسم الحالي</span><strong>'+stext(cert.score)+' / ١٠٠</strong><span>'+stext(sper(cert.score,100))+'٪</span></div>'+
  '<p class="afaq-cert-qualification">'+friendly(status)+'</p>';
 }
 const denom=portfolio?40:10;
 const stageRows=stages?[1,2,3,4,5].map(n=>{
  const x=cert.stage_scores.find(x=>Number(x.stage)===n),val=nscore(x?.earned);
  return '<tr><td>'+stext(n)+'</td><td>'+friendly(stage(n).title)+'</td><td>'+stext(val)+' / '+stext(denom)+'</td>'+
   '<td>'+stext(sper(val,denom))+'٪</td></tr>';
 }).join(''):'';
 const stageTitle=portfolio?'المراحل الخمس مجمعة عبر الوحدات الأربع':'تفاصيل المراحل الخمس للوحدة الحالية';
 const detail=stages?'<section class="afaq-cert-stages"><h4 class="afaq-cert-table-title">'+stageTitle+'</h4>'+
  '<table class="afaq-cert-table"><thead><tr><th>م</th><th>المرحلة</th><th>الدرجة</th><th>النسبة</th></tr></thead><tbody>'+stageRows+
  '<tr class="afaq-cert-total"><td colspan="2">مجموع المراحل</td><td>'+stext(nscore(cert.raw_score))+' / '+stext(portfolio?200:50)+'</td>'+
  '<td>'+stext(sper(cert.raw_score,portfolio?200:50))+'٪</td></tr></tbody></table></section>':
  (!portfolio?'<p class="afaq-cert-warning">تفاصيل المراحل غير متاحة حاليًا؛ يرجى إعادة فتح سجل المحاولة.</p>':'');
 const unitDetail=isSix&&!portfolio?'<p class="afaq-cert-unit-detail">نتيجة '+friendly(unitName(cert.grade,cert.section))+': <strong>'+stext(cert.score)+' / ١٠٠</strong></p>':'';
 const identifier=cert.id&&!training?'<p class="afaq-cert-id">معرّف المحاولة: <b dir="ltr">'+friendly(cert.id)+'</b></p>':'';
 const thanks=completed===4&&isSix?'تقديرًا لإتمام جميع وحدات المسابقة وإظهار المثابرة والجدية في التحديات الرياضية.':
  'تقديرًا للمشاركة والجهد المبذول في التحديات الرياضية، وتحفيزًا لمواصلة التعلّم والتميّز.';
 return '<section class="afaq-certificate '+(portfolio?'afaq-cert-portfolio':'')+'" id="afaqPrintableCertificate" dir="rtl">'+
  '<div class="afaq-cert-top"><div class="afaq-cert-star">★</div><div><strong>منصة آفاق الرياضيات</strong><span>مسابقة نجوم آفاق الرياضيات</span></div><div class="afaq-cert-seal">🏆<small>إنجاز وتميّز</small></div></div>'+
  '<div class="afaq-cert-heading"><span>'+friendly(subtitle)+'</span><h2>'+friendly(title)+'</h2>'+
  '<p>بكل فخر وتقدير، نتقدم بالشكر والثناء للمتسابق</p><h3>'+friendly(cert.display_name||'المتسابق')+'</h3>'+
  '<p>'+friendly(thanks)+'</p></div>'+
  '<div class="afaq-cert-details"><span><b>الصف:</b> '+friendly(grade)+'</span>'+classLine+serialLine+
  (!portfolio?'<span><b>الوحدة / القسم:</b> '+friendly(unitName(cert.grade,cert.section))+'</span>':'')+
  (!portfolio?'<span><b>النموذج:</b> '+friendly(models[cert.model]||cert.model||'التدريب')+'</span>':'')+
  (!training&&!portfolio?'<span><b>رقم المحاولة:</b> '+stext(cert.attempt_no||1)+'</span>':'')+
  '<span><b>التاريخ:</b> '+friendly(certificateDate(cert.ended_at))+'</span></div>'+
  main+unitDetail+detail+identifier+
  '<div class="afaq-cert-footer"><div><b>الإعداد والإشراف</b><span>الأستاذ سعيد بن جمعة بن عبدالله البريكي</span></div>'+
  '<div><b>مدير المدرسة</b><span>الأستاذ عبد الله بن علي العيسائي</span></div></div>'+
  '<p class="afaq-cert-thanks">وفقك الله وسدد خطاك، وإلى مزيد من النجاح والتميز.</p>'+
  '<p class="afaq-cert-fineprint">هذه وثيقة نتائج صادرة عن منصة آفاق الرياضيات وفق البيانات المتاحة؛ ولا تمثل تصديقًا رسميًا من المدرسة أو إعلانًا نهائيًا للفائزين.</p></section>';
}
function certificateActions(cert){
 const isSix=Number(cert?.grade)===6;const report=certificateReport400(cert);
 const ready=isSix?!!report:(Array.isArray(cert?.stage_scores)&&cert.stage_scores.length===5&&cert.stage_scores.every(x=>x&&Number.isFinite(Number(x.earned))));
 return '<div class="afaq-cert-actions"><button class="primary" id="printCertificate" '+(ready?'':'disabled')+'>🖨️ طباعة شهادة النتائج / حفظ PDF</button>'+
 (!ready?'<p class="notice">تعذر تحميل تفاصيل المراحل. حدّث سجل النتائج أولًا حتى تظهر شهادة مكتملة.</p>':'')+'</div>';
}
function certificatePage(){
 const c=STATE.certificateView;
 return '<div class="afaq-cert-view"><h2>📜 شهادة المتسابق ونتائجه</h2><p>يمكنك طباعة الشهادة أو اختيار «حفظ بتنسيق PDF» من نافذة الطباعة.</p>'+
 certificateMarkup(c)+certificateActions(c)+'<button id="closeCertificate" class="outline">العودة إلى لوحة الوحدات</button></div>';
}

function result(){
 const r=STATE.result||{},score=nscore(r.score??r.percent),raw=nscore(r.raw_score??score/2),cert=certificateForResult();
 const report=certificateReport400(cert);
 return '<div class="contest-finish"><div class="contest-giant">🏆🎉⭐</div>'+
 '<h2>'+(r.training?'أكملت '+trainingTitle():'اكتملت المحاولة الرسمية')+'</h2>'+
 '<h3>'+friendly(STATE.displayName||STATE.user?.username||'المتسابق')+'</h3>'+
 '<div class="contest-metrics"><div><strong>'+stext(raw)+' / ٥٠</strong><small>الدرجة الأصلية</small></div>'+
 '<div><strong>'+stext(score)+' / ١٠٠</strong><small>بعد المضاعفة</small></div>'+
 (STATE.grade!==6?'<div><strong>'+stext(raw/2)+' / ٢٥</strong><small>نقاط القسم من أصل ٢٥</small></div>':'')+'</div>'+
 (STATE.grade===6&&report?'<div class="afaq-cert-overall"><span>المجموع العام للوحدات الأربع</span><strong>'+stext(report.total)+' / ٤٠٠</strong><span>'+stext(sper(report.total,400))+'٪</span></div>':'')+
 '<p>'+(r.training?'هذه نتيجة تدريبية ولا تستهلك محاولات المنافسة الرسمية.':'تم حفظ النتيجة الرسمية في نظام المسابقة، وتُحتسب أفضل نتيجة لكل وحدة.')+'</p>'+
 '<h3 class="afaq-cert-section-title">📜 شهادتك وبيان نتائج المراحل</h3>'+
 certificateMarkup(cert)+certificateActions(cert)+
 (r.training&&r.details?'<details class="contest-review"><summary>مراجعة الأسئلة والإجابات</summary>'+r.details.map((x,i)=>'<p>السؤال '+stext(i+1)+' : '+stext(x.earned)+' / '+stext(x.max)+' نقطة — '+friendly(x.explanation||'')+'</p>').join('')+'</details>':'')+
 '<button class="outline" id="returnHome">العودة إلى الوحدات والنتائج</button></div>';
}
function guest(){return '<div class="contest-lock"><div class="contest-icon">🔐</div><h2>بوابة نجوم آفاق الرياضيات</h2><p>تسجيل الدخول إلى المنصة شرط الدخول إلى المسابقة؛ لا توجد صفحة دخول ثانية.</p><div class="guest-avatar-row">'+image(window.AFAQ_ENTRY_ART?.student,'صورة الطالب المعتمدة','approved-guest-avatar')+image(window.AFAQ_ENTRY_ART?.staff,'صورة المشرف المعتمدة','approved-guest-avatar')+'</div><a href="index.html#competition" class="primary">دخول منصة آفاق الرياضيات</a></div>'}
function resetPlay(){clearInterval(STATE.timer);clearTimeout(STATE.holdHandle);STATE.timer=null;STATE.holdHandle=null;STATE.readyStage=0;STATE.waitingUntil=0;STATE.lastFeedback=null;STATE.feedbackQuestion=null;STATE.feedbackAnswer=null;STATE.stageScores={};STATE.completedStages=[];STATE.feedbackStage=1;STATE.index=0;STATE.question=null;STATE.questions=[];STATE.answers={};STATE.result=null;STATE.attemptId=null;STATE.attemptNo=0;STATE.feedback='';STATE.error='';STATE.lastFeedback=null;STATE.bank=null;STATE.busy=false;STATE.certificateView=null}
function render(){clearInterval(STATE.timer);const showQ=getCurrent();
 root.innerHTML=!STATE.user?guest():STATE.certificateView?certificatePage():STATE.waitingUntil>Date.now()?transition():STATE.result?result():STATE.readyStage?readyPage():showQ?quiz():home();root.insertAdjacentHTML('beforeend',afaqSoundButton());bind();document.getElementById('afaqSoundToggle')?.addEventListener('click',()=>{afaqAudioEnabled=!afaqAudioEnabled;localStorage.setItem('afaq_stars_sound',afaqAudioEnabled?'on':'off');if(afaqAudioEnabled){afaqAudioContextReady();afaqTune(STATE.feedbackStage||1,'start')}render()});
 if(STATE.waitingUntil>Date.now()){tickTransition();return}
 if(showQ&&!STATE.readyStage&&!STATE.result)tickGame();
}
function tickTransition(){clearInterval(STATE.timer);STATE.timer=setInterval(()=>{const left=clockSec(STATE.waitingUntil);const place=document.getElementById('nextCountdown');if(place)place.textContent=stext(left);if(left===0){clearInterval(STATE.timer);STATE.waitingUntil=0;render()}},150)}
function tickGame(){clearInterval(STATE.timer);STATE.timer=setInterval(()=>{
 const q=getCurrent();if(!q||STATE.busy||STATE.readyStage||STATE.waitingUntil)return;
 const sec=remaining(),label=document.getElementById('contestClock'),line=document.getElementById('contestTimerBar');
 if(label)label.textContent=tformat(sec,q.stage);
 if(line)line.style.width=Math.max(0,Math.min(100,sec/stage(q.stage).time*100))+'%';
 if(sec<=0){clearInterval(STATE.timer);q.stage<=3?submitResponse(null,true):expireStage()}
},200)}
function prepare(){resetPlay();STATE.readyStage=1;render()}
async function beginStage(){if(STATE.busy||!STATE.readyStage)return;afaqTune(STATE.readyStage,'start');STATE.busy=true;STATE.error='';try{
 if(STATE.mode==='official'){
   const r=STATE.attemptId&&STATE.readyStage>1?await back('begin_stage',{attempt_id:STATE.attemptId}):await back('start',{grade:STATE.grade,section:STATE.section});
   if(r.stage_ready){STATE.readyStage=r.stage_number;STATE.attemptId=r.attempt_id||STATE.attemptId;STATE.attemptNo=r.attempt_no||STATE.attemptNo;}
   else{STATE.question=r.question;STATE.index=r.index;STATE.attemptId=r.attempt_id||STATE.attemptId;STATE.attemptNo=r.attempt_no||STATE.attemptNo;STATE.started=Date.parse(r.question_started_at)||Date.now();STATE.stageStarted=Date.parse(r.stage_started_at)||Date.now();STATE.readyStage=0;}
 }else{
   if(STATE.questions.length===0){const r=await back('training',{grade:STATE.grade,section:STATE.section});STATE.questions=r.questions||[];STATE.index=0;if(STATE.questions.length!==38)throw Error('بنك التدريب غير مكتمل')}
   STATE.started=Date.now();STATE.stageStarted=Date.now();STATE.readyStage=0;
 }
}catch(err){STATE.error=err.message}finally{STATE.busy=false;render()}}
function getParts(){const q=getCurrent();return(q?.parts||[]).map((p,i)=>p.type==='choice'?document.querySelector('input[name="part'+i+'"]:checked')?.value??null:document.querySelector('[data-part="'+i+'"]')?.value?.trim()??null)}
async function submitResponse(answer,expired=false){
 if(STATE.busy||STATE.waitingUntil||STATE.readyStage)return;
 const q=getCurrent();if(!q)return;STATE.busy=true;clearInterval(STATE.timer);STATE.error='';
 const previousStage=q.stage;
 try{
  let feedback=null;
  if(STATE.mode==='official'){
   const r=await back('answer',{attempt_id:STATE.attemptId,index:STATE.index,answer:expired?null:answer});
   feedback=r.feedback||null;
   adoptOfficial(r);
   STATE.waitingUntil=r.finished||r.stage_ready?Date.now()+5000:STATE.started;
  }else{
   const r=await back('training_feedback',{grade:STATE.grade,section:STATE.section,ordinal:q.ordinal,answer:expired?null:answer});
   feedback=r.feedback||null;
   STATE.answers[q.id]=expired?null:answer;STATE.index++;
   if(STATE.index>=STATE.questions.length)await completeTraining();
   else if(STATE.questions[STATE.index].stage!==previousStage){STATE.readyStage=STATE.questions[STATE.index].stage;STATE.started=0;STATE.stageStarted=0;}
   else{STATE.started=Date.now()+5000;STATE.waitingUntil=STATE.started;if(previousStage>=4)STATE.stageStarted+=5000;}
   if(STATE.readyStage||STATE.result)STATE.waitingUntil=Date.now()+5000;
  }
  STATE.lastFeedback=feedback;STATE.feedbackQuestion=q;STATE.feedbackAnswer=expired?null:answer;STATE.feedbackStage=previousStage;
   logScore(previousStage,feedback);
   if(STATE.readyStage>previousStage||STATE.result)closeStage(previousStage);
  STATE.waitingMessage='راجع الإجابة الصحيحة يا '+(STATE.displayName||STATE.user?.username||'المتسابق')+' ثم استعد للمرحلة التالية.';
  if(STATE.result&&!STATE.result.training&&student()){try{await loadCertificates()}catch(err){STATE.certificateError=err.message}}
 }catch(err){STATE.error=err.message;STATE.feedback=err.message}
 finally{STATE.busy=false;render();if(STATE.waitingUntil>Date.now())root.scrollIntoView?.({block:'start',behavior:'auto'});if(STATE.result){afaqTune(previousStage,'finish');afaqDecorate('fireworks',45)}else if(STATE.readyStage){afaqTune(previousStage,'finish');afaqDecorate('balloons',23)}else if(STATE.lastFeedback){if(STATE.lastFeedback.correct)afaqCelebrateCorrect(previousStage);else afaqTune(previousStage,'incorrect');}}
}
function adoptOfficial(r){
 if(r.finished){STATE.result={...r,training:false};STATE.report=r.report||STATE.report;STATE.question=null;STATE.questions=[];return}
 STATE.index=r.index;
 if(r.stage_ready){STATE.question=null;STATE.readyStage=r.stage_number;STATE.started=0;STATE.stageStarted=0;return}
 STATE.question=r.question;STATE.started=Date.parse(r.question_started_at)||Date.now();STATE.stageStarted=Date.parse(r.stage_started_at)||Date.now();
}
async function expireStage(){if(STATE.busy||STATE.readyStage)return;const skippedStage=getCurrent()?.stage;STATE.busy=true;clearInterval(STATE.timer);try{
 if(STATE.mode==='official'){const r=await back('skip_stage',{attempt_id:STATE.attemptId,index:STATE.index});adoptOfficial(r)}
 else{const current=getCurrent()?.stage;while(getCurrent()?.stage===current){STATE.answers[getCurrent().id]=null;STATE.index++}
 if(STATE.index>=STATE.questions.length)await completeTraining();else STATE.readyStage=STATE.questions[STATE.index].stage;
 }
 if(skippedStage&&(STATE.readyStage>skippedStage||STATE.result))closeStage(skippedStage);
}catch(err){STATE.error=err.message}finally{STATE.busy=false;STATE.waitingUntil=0;render()}}
async function completeTraining(){const r=await back('check_training',{grade:STATE.grade,section:STATE.section,answers:STATE.answers});STATE.result={...r,training:true,ended_at:new Date().toISOString()};keepSample(r.raw_score);saveTrainingCertificate();STATE.questions=[];STATE.question=null;STATE.waitingUntil=0;}
async function finishEarly(){if(STATE.busy)return;if(!window.confirm('هل تريد إنهاء النموذج الآن دون إكمال بقية الأسئلة؟'))return;STATE.busy=true;clearInterval(STATE.timer);try{
 if(STATE.mode==='official'){const r=await back('submit',{attempt_id:STATE.attemptId});STATE.result={...r,training:false,ended_at:new Date().toISOString()};STATE.report=r.report||STATE.report;try{await loadCertificates()}catch(err){STATE.certificateError=err.message}}
 else {await completeTraining();if(STATE.result){STATE.result.early_end=true;saveTrainingCertificate()}}STATE.readyStage=0;STATE.waitingUntil=0;
}catch(err){STATE.error=err.message}finally{STATE.busy=false;render()}}
async function reloadReports(){if(student()){STATE.report=(await back('my_results')).report}else if(allowedStaff()){const [a,b]=await Promise.all([back('staff_summary'),back('staff_results')]);STATE.summary=a.stats;STATE.staffReport=b.students}}
async function fetchBank(){try{const el=document.getElementById('editModel');if(el)STATE.editModel=el.value;STATE.bank=await back('question_list',{grade:STATE.grade,section:STATE.section,model:STATE.editModel});STATE.error='';render()}catch(err){STATE.error=err.message;render()}}
function bindBank(){document.querySelectorAll('.edit-question').forEach(form=>form.addEventListener('submit',async ev=>{ev.preventDefault();const data=new FormData(form),ordinal=Number(form.dataset.ordinal),payload={grade:STATE.grade,section:STATE.section,model:STATE.editModel,ordinal,prompt:data.get('prompt'),visual_svg:data.get('visual_svg'),visual_caption:data.get('visual_caption')};
 if(ordinal<=30){const count=(STATE.bank.questions||[]).find(q=>q.ordinal===ordinal)?.options.length||4;payload.options=Array.from({length:count},(_,i)=>String(data.get('opt'+i)));payload.answer_index=Number(data.get('answer_index'))}else{try{payload.parts=JSON.parse(String(data.get('parts')))}catch{alert('تحقق من صيغة JSON للأجزاء');return}}
 try{await back('save_question',payload);alert('تم الحفظ');await fetchBank()}catch(err){alert(err.message)}}));
 for(const [id,published]of [['publishBank',true],['unpublishBank',false]])document.getElementById(id)?.addEventListener('click',async()=>{if(published&&!window.confirm('هل راجعت جميع الأسئلة والرسومات والإجابات وتريد اعتماد النموذج؟'))return;try{await back('publish_model',{grade:STATE.grade,section:STATE.section,model:STATE.editModel,published});STATE.catalog=(await back('catalog')).models;STATE.bank=null;render()}catch(err){alert(err.message)}})
}
function bind(){if(!STATE.user)return;
 document.getElementById('logoutContest')?.addEventListener('click',async()=>{try{await api('logout')}catch{}sessionStorage.removeItem(tokenKey);STATE.token='';STATE.user=null;resetPlay();render()});
 document.querySelectorAll('[data-grade]').forEach(btn=>btn.addEventListener('click',()=>{STATE.grade=Number(btn.dataset.grade);STATE.section=1;resetPlay();render()}));
 document.querySelectorAll('[data-unit]').forEach(btn=>btn.addEventListener('click',()=>{STATE.section=Number(btn.dataset.unit);resetPlay();render()}));
 document.querySelectorAll('[data-mode]').forEach(btn=>btn.addEventListener('click',()=>{STATE.mode=btn.dataset.mode;resetPlay();render()}));
 document.getElementById('prepare')?.addEventListener('click',prepare);
 document.getElementById('beginStage')?.addEventListener('click',beginStage);
 document.getElementById('exitStage')?.addEventListener('click',()=>{if(STATE.attemptId&&STATE.mode==='official'){if(!window.confirm('ستظل المحاولة الرسمية محفوظة ويمكن استكمالها عند العودة. هل تريد الخروج؟'))return}resetPlay();render()});
 document.querySelectorAll('[data-choice]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-choice]').forEach(x=>x.disabled=true);btn.classList.add('selected');submitResponse(Number(btn.dataset.choice))}));
 document.getElementById('sendComplex')?.addEventListener('click',()=>submitResponse(getParts()));
 document.getElementById('finishEarly')?.addEventListener('click',finishEarly);
 document.getElementById('printCertificate')?.addEventListener('click',()=>window.print());
 document.getElementById('closeCertificate')?.addEventListener('click',()=>{STATE.certificateView=null;render()});
 document.querySelectorAll('[data-open-cert]').forEach(btn=>btn.addEventListener('click',()=>{
  const key=btn.dataset.openCert;
  const cert=key==='portfolio-training'?certificatePortfolio(true):key==='portfolio-official'?certificatePortfolio(false):key==='training'?readTrainingCertificate():hydrateCertificate((STATE.certificates||[]).find(x=>x.id===key));
  if(!cert)return;resetPlay();STATE.certificateView=cert;render();
 }));
 document.getElementById('returnHome')?.addEventListener('click',async()=>{resetPlay();try{await reloadReports()}catch{}render()});
 document.getElementById('loadBank')?.addEventListener('click',fetchBank);
 document.getElementById('editModel')?.addEventListener('change',ev=>{STATE.editModel=ev.target.value;STATE.bank=null;render()});
 if(STATE.bank)bindBank();
}
(async()=>{await authenticate();try{STATE.catalog=(await back('catalog')).models||[]}catch(err){STATE.error=err.message}render()})();