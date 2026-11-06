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
 waitingUntil:0,waitingMessage:'',lastFeedback:null,feedbackStage:1,holdHandle:null,timer:null,submitted:false,busy:false,result:null,error:'',feedback:'',bank:null,editModel:'A',editing:false};
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
  if(student()||STATE.user.role==='demo'){STATE.report=(await back('my_results')).report;if(student()){try{const p=(await api('profile'))?.profile?.student;STATE.displayName=p?.full_name||p?.display_name||STATE.displayName}catch{}}}
  else {const values=await Promise.all([back('staff_summary'),back('staff_results')]);STATE.summary=values[0].stats;STATE.staffReport=values[1].students;}
 }catch(e){STATE.user=null;STATE.token='';sessionStorage.removeItem(tokenKey);}
}
const getCurrent=()=>STATE.mode==='official'?STATE.question:STATE.questions[STATE.index];
const currentStage=()=>STATE.readyStage||(getCurrent()?.stage||0);
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
 unitCards()+progress()+sampleScorePanel()+
 '<h3 class="contest-title">اختر النموذج</h3><div class="contest-modes"><button class="'+(STATE.mode==='training'?'primary':'outline')+'" data-mode="training">🎯 '+trainingTitle()+'</button>'+(official()?'<button class="'+(STATE.mode==='official'?'primary':'outline')+'" data-mode="official">🏆 المحاولات الرسمية</button>':'')+'</div>'+
 '<p class="contest-instructions">المراحل الخمس في التدريب والمحاولات الرسمية متشابهة في العرض والتوقيت والصور. بعد كل إجابة تُعرض الإجابة الصحيحة والتعزيز باسم المتسابق خلال ٥ ثوانٍ ثم تنتقل اللعبة تلقائيًا. وقبل كل مرحلة تظهر شاشة «استعد وابدأ».</p>'+road()+
 '<div class="contest-rules"><b>طريقة احتساب الدرجة:</b> ثلاث مراحل سريعة، ثم مختبر مستر بين، ثم تحدي الأستاذ سعيد. لكل مرحلة ١٠ نقاط، فيكون المجموع ٥٠ ويُضاعف إلى ١٠٠. تُحتسب أفضل نتيجة لكل وحدة.</div>'+
 (approved||STATE.mode!=='official'?'':'<div class="notice">المحاولة الرسمية لهذه الوحدة لم تعتمد بعد؛ يمكنك تجربة نموذج التدريب.</div>')+
 (STATE.error?'<p class="notice" role="alert">'+friendly(STATE.error)+'</p>':'')+
 '<div class="contest-start-wrap"><button class="primary" id="prepare" '+(allowed?'':'disabled')+'>'+(STATE.mode==='official'?'الاستعداد للمحاولة الرسمية':'بدء '+trainingTitle())+'</button></div>'+staffResults()+manager()+'</div>';
}
function readyPage(){const n=STATE.readyStage,st=stage(n);return '<section class="stage-ready-page"><div class="ready-art">'+image(stageArt(n),st.title,'stage-ready-photo')+'</div><span class="ready-kicker">استعد للمرحلة '+n+' من ٥</span><h2>'+st.title+'</h2><h3>'+st.desc+'</h3><p>'+st.detail+' — أحضر تركيزك واستعد للتحدي. سيبدأ وقت المرحلة بعد موافقتك على الانطلاق.</p><div class="ready-rules">✔️ تُعرض الأسئلة والرسومات المصورة • ✔️ ١٠ درجات لكل مرحلة • ✔️ الانتقال التلقائي بعد ٥ ثوانٍ مع عرض الإجابة الصحيحة وتعزيز باسم المتسابق</div>'+(STATE.error?'<div class="notice">'+friendly(STATE.error)+'</div>':'')+'<div class="ready-buttons"><button class="primary" id="beginStage" '+(STATE.busy?'disabled':'')+'>✅ أوافق على بدء المرحلة — انطلق!</button><button class="outline" id="exitStage">العودة إلى لوحة الوحدات</button></div></section>'}
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
function quiz(){const q=getCurrent();if(!q)return '';
 const st=stage(q.stage),isMulti=q.question_kind==='complex',n=q.stage<=3?(q.ordinal-1)%10+1:(q.ordinal-31)%4+1;
 const seconds=remaining(),frac=Math.max(0,Math.min(100,seconds/st.time*100));
 const choices=isMulti?(q.parts||[]).map((part,i)=>'<div class="contest-subpart"><h4>('+String(i+1)+') '+friendly(part.text)+'</h4>'+(part.type==='choice'?'<div class="contest-choice-grid">'+(part.choices||[]).map(v=>'<label><input type="radio" name="part'+i+'" value="'+friendly(v)+'"><span>'+friendly(v)+'</span></label>').join('')+'</div>':'<input class="contest-number" inputmode="decimal" data-part="'+i+'" placeholder="اكتب الإجابة">')+'</div>').join(''):(q.options||[]).map((v,i)=>'<button class="contest-option" data-choice="'+i+'"><span class="option-letter">'+['أ','ب','ج','د'][i]+'</span>'+friendly(v)+'</button>').join('');
 return '<div class="contest-playing"><div class="contest-headline"><div><span>'+(STATE.mode==='official'?'🏆 المحاولة الرسمية':'🎯 '+trainingTitle())+'</span><h2>'+unitName(STATE.grade,STATE.section)+'</h2><small>'+friendly(STATE.displayName||STATE.user?.username||'الطالب')+'</small></div><div class="contest-score-badge"><strong>٥٠ ← ١٠٠</strong><small>أفضل نتيجة</small></div></div>'+road(q.stage)+
 '<div class="contest-game-area"><div class="contest-stage-banner"><div class="contest-character">'+image(stageArt(q.stage),st.title,'stage-banner-photo')+'</div><div><span class="contest-label">المرحلة '+q.stage+' من ٥ — ١٠ درجات</span><h2>'+st.title+'</h2><p>'+st.desc+'</p></div><div class="contest-timer"><strong id="contestClock">'+tformat(seconds,q.stage)+'</strong><small>'+(q.stage<=3?'وقت السؤال':'وقت المرحلة')+'</small><span class="contest-timerline"><i id="contestTimerBar" style="width:'+frac+'%"></i></span></div></div><div class="contest-question-meta"><span>السؤال '+n+' من '+(q.stage<=3?10:4)+'</span><span>التقدم '+(STATE.index+1)+' / ٣٨</span><span>'+(isMulti?'مسألة متعددة الأجزاء':'اختيار من متعدد')+'</span></div><div class="contest-question"><h3>'+friendly(q.prompt)+'</h3>'+figure(q)+choices+
 '<div class="contest-help" id="contestHelp">'+friendly(STATE.feedback||('ركز يا '+(STATE.user?.username||'بطل')+'، ثم أجب عن السؤال.'))+'</div></div><div class="contest-controls">'+(isMulti?'<button id="sendComplex" class="primary">✅ إرسال الإجابات والمتابعة</button>':'<p class="auto-answer-hint">اختر الإجابة لعرض التصحيح والتعزيز ثم الانتقال تلقائيًا بعد ٥ ثوانٍ.</p>')+'<button id="finishEarly" class="outline">إنهاء '+(STATE.mode==='official'?'المحاولة':'التدريب')+' الآن</button></div>'+
 (STATE.error?'<div class="notice">'+friendly(STATE.error)+'</div>':'')+'</div></div>';
}
function transition(){
 const sec=clockSec(STATE.waitingUntil),n=STATE.feedbackStage||1,f=STATE.lastFeedback;
 const name=STATE.displayName||STATE.user?.username||'المتسابق';
 let heading='🌟 تم حفظ الإجابة',message=STATE.waitingMessage||'استعد للتحدي التالي.',solution='';
 if(f){
  if(f.unanswered){heading='⏰ انتهى وقت السؤال';message='يا '+name+'، راجع الإجابة ثم واصل المحاولة بثقة.';}
  else if(f.correct){heading='🌟 إجابة صحيحة!';message='أحسنت يا '+name+'! تفكيرك الرياضي متميز، استمر!';}
  else{heading='💡 لنتعلم من الإجابة';message='يا '+name+'، حاول مجددًا في السؤال القادم، وستحقق تقدمًا بإذن الله.';}
  const correct=Array.isArray(f.correct_answer)?f.correct_answer.join('، '):f.correct_answer;
  solution='<div class="contest-solution"><strong>✅ الإجابة الصحيحة: '+friendly(correct??'—')+'</strong>'+
   '<small>درجتك لهذا السؤال: '+Number(f.earned||0)+' من '+Number(f.max||1)+'</small>'+
   (f.explanation?'<p>'+friendly(f.explanation)+'</p>':'')+'</div>';
 }
 return '<div class="contest-transition '+(f?.correct?'feedback-success':f?'feedback-review':'')+'">'+
  '<div class="transition-art">'+image(stageEndArt(n),'صورة نهاية السؤال','transition-photo')+'</div>'+
  '<h2>'+heading+'</h2><p>'+friendly(message)+'</p>'+solution+
  '<span>الانتقال التلقائي إلى التحدي التالي خلال</span><strong id="nextCountdown">'+sec+'</strong><span>ثوانٍ</span></div>';
}
function result(){const r=STATE.result||{},score=Number(r.score??r.percent??0),raw=Number(r.raw_score??score/2);
 return '<div class="contest-finish"><div class="contest-giant">🏆🎉⭐</div><h2>'+(r.training?'أكملت '+trainingTitle():'اكتملت المحاولة الرسمية')+'</h2><h3>'+friendly(STATE.displayName||STATE.user?.username||'المتسابق')+'</h3><div class="contest-metrics"><div><strong>'+raw+' / ٥٠</strong><small>الدرجة الأصلية</small></div><div><strong>'+score+' / ١٠٠</strong><small>بعد المضاعفة</small></div>'+(STATE.grade!==6?'<div><strong>'+(raw/2)+' / ٢٥</strong><small>نقاط القسم من أصل ٢٥</small></div>':'')+'</div><p>'+(r.training?'نتيجتك تدريبية لا تستهلك محاولات المنافسة.':'حفظت نتيجتك، وتُحتسب أفضل نتيجة من المحاولتين لهذه الوحدة.')+'</p>'+(r.training&&r.details?'<details class="contest-review"><summary>مراجعة الأجزاء والإجابات</summary>'+r.details.map((x,i)=>'<p>السؤال '+(i+1)+' : '+x.earned+' / '+x.max+' نقطة — '+friendly(x.explanation||'')+'</p>').join('')+'</details>':'')+'<button class="primary" id="returnHome">العودة إلى الوحدات والنتائج</button></div>';
}
function guest(){return '<div class="contest-lock"><div class="contest-icon">🔐</div><h2>بوابة نجوم آفاق الرياضيات</h2><p>تسجيل الدخول إلى المنصة شرط الدخول إلى المسابقة؛ لا توجد صفحة دخول ثانية.</p><div class="guest-avatar-row">'+image(window.AFAQ_ENTRY_ART?.student,'صورة الطالب المعتمدة','approved-guest-avatar')+image(window.AFAQ_ENTRY_ART?.staff,'صورة المشرف المعتمدة','approved-guest-avatar')+'</div><a href="index.html#competition" class="primary">دخول منصة آفاق الرياضيات</a></div>'}
function resetPlay(){clearInterval(STATE.timer);clearTimeout(STATE.holdHandle);STATE.timer=null;STATE.holdHandle=null;STATE.readyStage=0;STATE.waitingUntil=0;STATE.lastFeedback=null;STATE.feedbackStage=1;STATE.index=0;STATE.question=null;STATE.questions=[];STATE.answers={};STATE.result=null;STATE.attemptId=null;STATE.attemptNo=0;STATE.feedback='';STATE.error='';STATE.lastFeedback=null;STATE.bank=null;STATE.busy=false}
function render(){clearInterval(STATE.timer);const showQ=getCurrent();
 root.innerHTML=!STATE.user?guest():STATE.waitingUntil>Date.now()?transition():STATE.result?result():STATE.readyStage?readyPage():showQ?quiz():home();root.insertAdjacentHTML('beforeend',afaqSoundButton());bind();document.getElementById('afaqSoundToggle')?.addEventListener('click',()=>{afaqAudioEnabled=!afaqAudioEnabled;localStorage.setItem('afaq_stars_sound',afaqAudioEnabled?'on':'off');if(afaqAudioEnabled){afaqAudioContextReady();afaqTune(STATE.feedbackStage||1,'start')}render()});
 if(STATE.waitingUntil>Date.now()){tickTransition();return}
 if(showQ&&!STATE.readyStage&&!STATE.result)tickGame();
}
function tickTransition(){clearInterval(STATE.timer);STATE.timer=setInterval(()=>{const left=clockSec(STATE.waitingUntil);const place=document.getElementById('nextCountdown');if(place)place.textContent=left;if(left===0){clearInterval(STATE.timer);STATE.waitingUntil=0;render()}},150)}
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
  STATE.lastFeedback=feedback;STATE.feedbackStage=previousStage;
  STATE.waitingMessage='راجع الإجابة الصحيحة يا '+(STATE.displayName||STATE.user?.username||'المتسابق')+' ثم استعد للمرحلة التالية.';
 }catch(err){STATE.error=err.message;STATE.feedback=err.message}
 finally{STATE.busy=false;render();if(STATE.result){afaqTune(previousStage,'finish');afaqDecorate('fireworks',45)}else if(STATE.readyStage){afaqTune(previousStage,'finish');afaqDecorate('balloons',23)}else if(STATE.lastFeedback){if(STATE.lastFeedback.correct)afaqCelebrateCorrect(previousStage);else afaqTune(previousStage,'incorrect');}}
}
function adoptOfficial(r){
 if(r.finished){STATE.result={...r,training:false};STATE.report=r.report||STATE.report;STATE.question=null;STATE.questions=[];return}
 STATE.index=r.index;
 if(r.stage_ready){STATE.question=null;STATE.readyStage=r.stage_number;STATE.started=0;STATE.stageStarted=0;return}
 STATE.question=r.question;STATE.started=Date.parse(r.question_started_at)||Date.now();STATE.stageStarted=Date.parse(r.stage_started_at)||Date.now();
}
async function expireStage(){if(STATE.busy||STATE.readyStage)return;STATE.busy=true;clearInterval(STATE.timer);try{
 if(STATE.mode==='official'){const r=await back('skip_stage',{attempt_id:STATE.attemptId,index:STATE.index});adoptOfficial(r)}
 else{const current=getCurrent()?.stage;while(getCurrent()?.stage===current){STATE.answers[getCurrent().id]=null;STATE.index++}
 if(STATE.index>=STATE.questions.length)await completeTraining();else STATE.readyStage=STATE.questions[STATE.index].stage;
 }
}catch(err){STATE.error=err.message}finally{STATE.busy=false;STATE.waitingUntil=0;render()}}
async function completeTraining(){const r=await back('check_training',{grade:STATE.grade,section:STATE.section,answers:STATE.answers});STATE.result={...r,training:true};keepSample(r.raw_score);STATE.questions=[];STATE.question=null;STATE.waitingUntil=0;}
async function finishEarly(){if(STATE.busy)return;if(!window.confirm('هل تريد إنهاء النموذج الآن دون إكمال بقية الأسئلة؟'))return;STATE.busy=true;clearInterval(STATE.timer);try{
 if(STATE.mode==='official'){const r=await back('submit',{attempt_id:STATE.attemptId});STATE.result={...r,training:false};STATE.report=r.report||STATE.report;}
 else await completeTraining();STATE.readyStage=0;STATE.waitingUntil=0;
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
 document.getElementById('returnHome')?.addEventListener('click',async()=>{resetPlay();try{await reloadReports()}catch{}render()});
 document.getElementById('loadBank')?.addEventListener('click',fetchBank);
 document.getElementById('editModel')?.addEventListener('change',ev=>{STATE.editModel=ev.target.value;STATE.bank=null;render()});
 if(STATE.bank)bindBank();
}
(async()=>{await authenticate();try{STATE.catalog=(await back('catalog')).models||[]}catch(err){STATE.error=err.message}render()})();