'use strict';
/* نجوم آفاق الرياضيات: عرض مصوّر للمراحل الخمس، والتصحيح الخادمي للمحاولتين. */
const API='https://xcwuwflggiwkehzquugz.supabase.co/functions/v1/afaq-platform-api';
const GAME='https://xcwuwflggiwkehzquugz.supabase.co/functions/v1/afaq-contest-v2';
const tokenKey='afaq_access_token_v2';

/* Original synthesized motivational cues, stage celebrations and user-controlled sound. */
let afaqAudioEnabled=localStorage.getItem('afaq_stars_sound')!=='off';
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

/* Contest bell cues are synthesized locally (no copyrighted audio file).
   Browser audio may require the learner's first button click; all alarms also
   have a visible text and numeric-clock counterpart. */
const afaqCueHistory=new Set();
function afaqOnceCue(key,cb){
 if(afaqCueHistory.has(key))return false;
 afaqCueHistory.add(key);cb();return true;
}
function afaqRisingBell(kind){
 if(!afaqAudioEnabled)return;
 const pitches=kind==='start'?[523,659,831,1047,1319]:
  kind==='break'?[392,494,622,784,988]:
  kind==='long'?[415,523,659,831]:
  [659,784,988,1175];
 pitches.forEach((freq,i)=>afaqTone(freq,i*.145,.31,'triangle',.06+i*.006));
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
 {title:'أقليدس وأرخميدس',desc:'بوابة الأعداد والمفاهيم',time:25,detail:'١٠ أسئلة — ٢٥ ثانية لكل سؤال'},
 {title:'ابن الهيثم والخوارزمي',desc:'تحدي المهارات',time:20,detail:'١٠ أسئلة — ٢٠ ثانية لكل سؤال'},
 {title:'نيوتن وجاوس',desc:'سباق السرعة',time:20,detail:'١٠ أسئلة — ٢٠ ثانية لكل سؤال'},
 {title:'عمر الخيام وأويلر',desc:'المختبر الرياضي',time:600,detail:'٤ مسائل مركبة — ١٠ دقائق للمرحلة'},
 {title:'أنا ومعلمي أ.سعيد البريكي',desc:'تحدي الاستدلال',time:300,detail:'٤ مسائل مركبة — ٥ دقائق للمرحلة'}
];
const models={A:'السابق A',B:'السابق B',C:'نموذج الطالب',D:'نموذج الإدارة',E:'نموذج المشرف',F:'نموذج مساعد المشرف',...Object.fromEntries(Array.from({length:10},(_,i)=>[String(i+1).padStart(2,'0'),'النموذج '+(i+1)]))};
const numberedModels=Array.from({length:10},(_,i)=>String(i+1).padStart(2,'0'));
const roleModels={student:'C',demo:'C',director:'D',deputy:'D',supervisor:'E',supervisor_assistant:'F'};
const gradeNames={5:'الخامس',6:'السادس',7:'السابع',8:'الثامن'};
const STATE={displayName:'',token:sessionStorage.getItem(tokenKey)||'',user:null,grade:6,section:1,mode:'training',testerProfile:0,testerStatuses:[],catalog:[],report:null,summary:null,staffReport:null,access:null,
 questions:[],question:null,answers:{},index:0,readyStage:0,attemptId:null,attemptNo:0,started:0,stageStarted:0,
 waitingUntil:0,waitingMessage:'',stageBreakUntil:0,breakReady:false,breakAutoBusy:false,breakRetryAt:0,hintFor:null,digitStyle:'ar',audioNotice:'',lastFeedback:null,feedbackQuestion:null,feedbackAnswer:null,stageScores:{},completedStages:[],feedbackStage:1,holdHandle:null,timer:null,submitted:false,busy:false,result:null,error:'',feedback:'',bank:null,editModel:'01',previewModel:null,modelSummary:null,modelAssignments:null,modelNotice:'',editing:false,profile:null,certificates:[],certificateView:null,certificateError:''};
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const friendly=v=>escapeHtml(v);
const supervisor=()=>STATE.user?.role==='supervisor';
const isTester=()=>supervisor()&&Number(STATE.testerProfile)>0;
const allowedStaff=()=>!isTester()&&['supervisor','supervisor_assistant','director','deputy'].includes(STATE.user?.role);
const student=()=>STATE.user?.role==='student';
const player=()=>student()||isTester();
const official=()=>player()&&STATE.grade===6;
const trainingModel=()=>supervisor()&&!isTester()&&STATE.previewModel?STATE.previewModel:isTester()?'C':roleModels[STATE.user?.role]||'C';
const trainingTitle=()=>models[trainingModel()]||'نموذج التدريب';
const sampleKey=()=> 'afaq_nonofficial_parts_'+(STATE.user?.username||'demo')+'_'+STATE.grade;
const savedSample=()=>{try{return JSON.parse(sessionStorage.getItem(sampleKey())||'{}')}catch{return {}}};
const keepSample=raw=>{if(STATE.grade===6)return;const p=savedSample();p[STATE.section]=Math.max(Number(p[STATE.section]||0),Number((raw/2).toFixed(2)));sessionStorage.setItem(sampleKey(),JSON.stringify(p))};
const sampleScorePanel=()=>{if(STATE.grade===6)return '';const p=savedSample(),sum=Number(p[1]||0)+Number(p[2]||0);return '<section class="contest-progress"><h3>📈 ملخص القسمين التدريبيين</h3><div class="contest-metrics"><div><strong>'+Number(p[1]||0)+' / ٢٥</strong><small>القسم الأول</small></div><div><strong>'+Number(p[2]||0)+' / ٢٥</strong><small>القسم الثاني</small></div><div><strong>'+(sum*2)+' / ١٠٠</strong><small>المجموع بعد المضاعفة</small></div></div><p>هذه نتائج تدريبية محفوظة في جلسة المتصفح الحالية فقط؛ لا تُسجَّل كمحاولات رسمية ولا تُخلط بنتائج الطلاب.</p></section>'};
const stage=(n)=>stageInfo[n-1]||stageInfo[0];
const image=(src,alt,cls)=>src?'<img class="'+cls+'" src="'+src+'" alt="'+friendly(alt)+'" loading="lazy">':'';
const entryArt=()=>window.AFAQ_ENTRY_ART?.[player()||STATE.user?.role==='demo'?'student':'staff']||'';
/* Historical portraits are illustrative, not photographic identification
   of historical figures. Show both scholars named in each round.
   On the fifth round retain the competition's previously approved teacher art. */
const stageThemeClass=n=>['stage-theme-khwarizmi','stage-theme-amer','stage-theme-jabir',
 'stage-theme-mrbean','stage-theme-saeed'][Number(n)-1]||'stage-theme-khwarizmi';
const contestPairedArt={
 1:[
  {name:'أقليدس',file:'Euclid. Line engraving. Wellcome V0001794.jpg'},
  {name:'أرخميدس',file:'Archimedes by Patania.jpg'}
 ],
 2:[
  {name:'ابن الهيثم',file:'Ibn Al-Haytham portrait.jpg'},
  {name:'الخوارزمي',file:'Al-Khwarizmi portrait.jpg'}
 ],
 3:[
  {name:'نيوتن',file:'Isaac Newton by Sir Godfrey Kneller.jpg'},
  {name:'جاوس',file:'Carl Friedrich Gauss.jpg'}
 ],
 4:[
  {name:'عمر الخيام',file:'Omar Khayyam2.JPG'},
  {name:'أويلر',file:'Leonhard Euler.jpg'}
 ]
};
const contestCommonsBase='https://commons.wikimedia.org/wiki/';
const contestCommonsFile=item=>contestCommonsBase+'File:'+encodeURIComponent(item.file);
const contestCommonsImage=item=>contestCommonsBase+'Special:FilePath/'+encodeURIComponent(item.file)+'?width=550';
const stageArt=n=>window.AFAQ_STAGE_ART?.[n-1]||'';
const stageEndArt=n=>window.AFAQ_STAGE_END_ART?.[n-1]||stageArt(n);
const stageArtAlt=n=>n===5?'رسم المرحلة الخامسة: أنا ومعلمي الأستاذ سعيد البريكي':
  'رسم رمزي لشخصيات المرحلة '+stage(n).title;
function stagePortrait(n,variant){
 /* Both entry images are the precise approved student and teacher artwork
    already loaded in this competition by contest-original-art.js. */
 if(n===5){
  const student=window.AFAQ_ENTRY_ART?.student||'';
  const teacher=window.AFAQ_ENTRY_ART?.staff||'';
  if(student&&teacher){
   const duo=[
    {name:'أنا الطالب',description:'صورة الطالب المعتمدة في منصة آفاق ماث',src:student},
    {name:'معلمي أ. سعيد البريكي',description:'صورة المعلم العُماني المعتمدة في منصة آفاق ماث',src:teacher}
   ];
   return '<div class="contest-pair-art contest-pair-'+variant+' contest-student-teacher" aria-label="أنا ومعلمي الأستاذ سعيد البريكي">'+
    duo.map(item=>'<figure class="contest-pair-portrait">'+
     '<img class="contest-scholar-image" src="'+item.src+'" alt="'+item.description+'" loading="eager">'+
     '<figcaption>'+item.name+'</figcaption></figure>').join('')+'</div>';
  }
  /* Retain the approved older fifth-stage artwork only as a graceful fallback. */
  return image(stageArt(n),stageArtAlt(n),variant==='ready'?'stage-ready-photo':variant==='road'?'stage-pic':'stage-banner-photo');
 }
 const two=contestPairedArt[n];
 if(!two)return image(stageArt(n),stageArtAlt(n),variant==='ready'?'stage-ready-photo':
  variant==='road'?'stage-pic':'stage-banner-photo');
 return '<div class="contest-pair-art contest-pair-'+variant+'" aria-label="'+friendly(stage(n).title)+'">'+
  two.map(item=>'<figure class="contest-pair-portrait">'+
   '<img class="contest-scholar-image" src="'+contestCommonsImage(item)+'" alt="تصوير تاريخي فني لـ'+friendly(item.name)+'" loading="lazy">'+
   '<figcaption>'+friendly(item.name)+'</figcaption></figure>').join('')+'</div>';
}
const stageArtCaption=n=>contestPairedArt[n]?
 '<small class="contest-art-credit">تصويرات تاريخية وفنية، وليست صورًا فوتوغرافية. المصدر: '+
 contestPairedArt[n].map(item=>'<a href="'+contestCommonsFile(item)+'" target="_blank" rel="noopener noreferrer">'+friendly(item.name)+'</a>').join(' • ')+
 ' — Wikimedia Commons</small>':'';
const units=g=>g===6?4:2;
const splitSyllabus={5:[{name:'الأعداد والهندسة',topics:'الوحدتان ١أ الأعداد و١ب الهندسة'},{name:'القياس والأعداد',topics:'الوحدتان ١ج القياس و٢أ الأعداد'}],7:[{name:'الأعداد والجبر والأعداد العشرية والقياس',topics:'الوحدات ١–٤'},{name:'الزوايا والكسور والمساحة والنسب المئوية',topics:'الوحدات ٥–٨'}],8:[{name:'الأعداد والقوى والشبكات والزوايا والكسور',topics:'الوحدات ١–٤'},{name:'الجبر والمساحة والحجم والاحتمالات والنسب المئوية',topics:'الوحدات ٥–٨'}]};
const unitName=(g,s)=>g===6?['الأعداد (١)','القياس','الهندسة','الأعداد (٢)'][s-1]:'القسم '+s+' — '+(splitSyllabus[g]?.[s-1]?.name||'النصف '+(s===1?'الأول':'الثاني'));
const codeError={unauthorized:'انتهت الجلسة، ادخل إلى منصة آفاق أولًا.',forbidden:'هذا الإجراء غير متاح لهذا الحساب.',
 training_unavailable:'نموذج التدريب غير متاح حاليًا.',official_requires_individual_student_account:'تحتاج المحاولات الرسمية إلى حساب طالب فردي.',contest_global_closed:'🔒 أوقف المشرف الرئيسي دخول المسابقة لجميع الطلاب مؤقتًا.',
 contest_student_closed:'🔒 أوقف المشرف دخول هذا الحساب إلى المسابقة مؤقتًا.',
 password_change_required:'🔒 غيّر رقمك السري بنفسك في حسابك بالمنصة، ثم عد إلى المسابقة.',
 attempt_limit:'استنفدت المحاولتين الرسميتين للوحدة. لا يمكنك إنشاء محاولة أخرى إلا بعد إعادة الضبط من المشرف.',previous_section_required:'أكمل الوحدة السابقة أولًا.',
 stage_break_active:'🔔 الاستراحة إلزامية؛ تبدأ المرحلة التالية بعد اكتمال الدقيقتين.',weekly_locked:'لم تمضِ أربعة أيام (٩٦ ساعة) على بدء الوحدة السابقة بعد. تُفتح الوحدة التالية بعد انقضاء المدة وإكمال الوحدة السابقة.',official_model_not_approved:'لم تُعتمد أسئلة المنافسة الرسمية بعد، ويمكنك استخدام التدريب.',
 question_bank_incomplete:'لا تزال بعض الأسئلة قيد المراجعة.',stage_start_required:'اضغط إذن بدء المرحلة أولًا.',stage_not_ready:'المرحلة ليست جاهزة للانطلاق.',question_sequence_changed:'تم تحديث تسلسل الأسئلة؛ عد إلى بوابة الوحدة واستأنف.',invalid_parts:'بيانات السؤال المركب غير صحيحة.'};
async function request(endpoint,action,payload={}){
 let resp;try{resp=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',...(STATE.token?{Authorization:'Bearer '+STATE.token}:{})},body:JSON.stringify({action,...payload}),cache:'no-store'})}catch{throw Error('تعذر الاتصال بالإنترنت')}
 let data;try{data=await resp.json()}catch{throw Error('تعذر استلام رد الخادم')}
 if(!resp.ok||!data?.ok){
  if(student()&&(data?.error==='contest_global_closed'||data?.error==='contest_student_closed')){
   STATE.access={allowed:false,global_open:data.error!=='contest_global_closed',student_enabled:data.error!=='contest_student_closed'};
   resetPlay();
  }
  throw Error(codeError[data?.error]||'تعذر تنفيذ الطلب: '+(data?.error||resp.status));
 }
 return data;
}
const api=(action,payload)=>request(API,action,payload);
const PLAYER_ACTIONS=new Set(['my_results','my_certificates','start','begin_stage','answer','skip_stage','submit',
 'training','training_feedback','check_training']);
const previewActions=new Set(['training','check_training','training_feedback']);
const back=(action,payload={})=>request(GAME,action,
 isTester()&&PLAYER_ACTIONS.has(action)?{...payload,tester_profile:STATE.testerProfile}:
 supervisor()&&!isTester()&&STATE.previewModel&&previewActions.has(action)?{...payload,preview_model:STATE.previewModel}:payload);
async function authenticate(){
 if(!STATE.token)return;
 try{let r=await api('me');STATE.user=r.user;STATE.displayName=STATE.user?.role==='demo'?'متسابق الصف '+(gradeNames[Number(r.user.grade)]||''):(STATE.displayName||STATE.user?.username||'المتسابق');STATE.grade=student()||STATE.user.role==='demo'?Number(r.user.grade||6):6;
  if(student()||STATE.user.role==='demo'){
   if(student()){
    STATE.mode='official';
    STATE.access=await back('contest_gate_status');
    if(STATE.user.pin_changed)STATE.report=(await back('my_results')).report;
    try{const p=(await api('profile'))?.profile?.student;STATE.displayName=p?.full_name||p?.display_name||STATE.displayName;STATE.profile=p||null}catch{}
   }else{
    STATE.report=(await back('my_results')).report;
   }
  }
  else {const values=await Promise.all([back('staff_summary'),back('staff_results'),...(supervisor()?[back('tester_status')]:[])]);STATE.summary=values[0].stats;STATE.staffReport=values[1].students;if(supervisor())STATE.testerStatuses=values[2]?.profiles||[];}
  if(student()&&STATE.user.pin_changed){
    if(STATE.access?.allowed){
     try{await back('contest_visit')}catch(err){console.warn('Contest visit tracking unavailable',err.message)}
    }
    try{await loadCertificates()}catch(err){STATE.certificateError=err.message}
  }
 }catch(e){STATE.user=null;STATE.token='';sessionStorage.removeItem(tokenKey);}
}
const getCurrent=()=>STATE.mode==='official'?STATE.question:STATE.questions[STATE.index];
const currentStage=()=>STATE.readyStage||(getCurrent()?.stage||0);
async function loadCertificates(){
 if(!player())return;
 const r=await back('my_certificates');
 STATE.certificates=Array.isArray(r.certificates)?r.certificates:[];
 if(r.report)STATE.report=r.report;
 STATE.certificateError='';
}
function unitCards(){
 let cards=[];
 for(let s=1;s<=units(STATE.grade);s++){
  const part=STATE.report?.parts?.find(x=>x.section===s);
  const requiresFourDayRelease=STATE.grade===6&&STATE.mode==='official'&&student()&&s>1;
  const prev=STATE.report?.parts?.find(x=>x.section===s-1);
  const begins=(prev?.records||[]).map(x=>Date.parse(x.started_at)).filter(Number.isFinite);
  const first=begins.length?Math.min(...begins):null;
  const openAt=first==null?null:first+4*24*60*60*1000;
  const locked=requiresFourDayRelease&&(!prev?.finished||openAt===null||Date.now()<openAt);
  const timeLeft=openAt===null?0:Math.max(0,Math.ceil((openAt-Date.now())/3600000));
  const days=Math.floor(timeLeft/24),hours=timeLeft%24;
  const lockText=locked?(!prev?.finished?'🔒 أكمل الوحدة السابقة أولًا':
   '🔒 تُفتح بعد ٤ أيام من بدء الوحدة السابقة — المتبقي '+stext(days)+' يوم و'+stext(hours)+' ساعة'):'';
  cards.push('<button class="contest-unit '+(STATE.section===s?'selected ':'')+
   (locked?'contest-unit-locked':'')+'" data-unit="'+s+'"'+(locked?' disabled aria-disabled="true"':'')+'>'+
   '<span class="unit-num">'+s+'</span><strong>'+(STATE.grade===6?'الوحدة':'القسم')+' '+s+' — '+unitName(STATE.grade,s)+'</strong>'+
   '<small>'+(STATE.grade===6?'١٠٠':'٢٥')+' نقطة</small>'+
   (STATE.grade===6?'':'<small>'+friendly(splitSyllabus[STATE.grade]?.[s-1]?.topics||'')+'</small>')+
   (part?'<small>أفضل نتيجة: '+friendly(part.best??'—')+' / ١٠٠ • المحاولات المتاحة: '+friendly(part.attempts_remaining)+'</small>':'')+
   (locked?'<small class="contest-unit-lock-note">'+lockText+'</small>':'')+'</button>');
 }
 return '<div class="contest-units">'+cards.join('')+'</div>';
}
function road(active=0){return '<div class="stage-track">'+stageInfo.map((st,i)=>'<div class="stage-node '+stageThemeClass(i+1)+' '+(i+1===active?'active':i+1<active?'passed':'')+'">'+stagePortrait(i+1,'road')+'<strong>'+st.title+'</strong><small>'+st.detail+'</small><b class="stage-points">١٠ نقاط</b></div>').join('')+'</div>'}
function progress(){let r=STATE.report;if(!r)return '';
 return '<section class="contest-progress"><h3>🎖️ تقدمي في مسابقة نجوم آفاق</h3><div class="contest-metrics"><div><strong>'+friendly(r.total)+' / ٤٠٠</strong><small>مجموع أفضل نتائجي</small></div><div><strong>'+friendly(r.completed_units)+' / ٤</strong><small>الوحدات المكتملة</small></div><div><strong>'+friendly(r.attempts_remaining)+'</strong><small>المحاولات المتبقية</small></div><div><strong>'+friendly(r.points_needed)+'</strong><small>نقطة تفصلني عن التأهل</small></div></div><p>'+(r.qualified?'🏆 أكملت الوحدات الأربع وحققت ٣٥٠ نقطة فأكثر؛ أنت ضمن المتأهلين للمفاضلة على الجوائز.':'أكمل الوحدات الأربع، واجمع ٣٥٠ نقطة فأكثر للتأهل للجوائز. تُحتسب أفضل محاولتين رسميتين لكل وحدة.')+'</p></section>';
}
function staffResults(){
 if(!allowedStaff()||!STATE.staffReport)return '';
 const items=[...STATE.staffReport].sort((a,b)=>String(a.class_name).localeCompare(String(b.class_name),'ar')||Number(a.serial_no)-Number(b.serial_no));
 const isPrivileged=supervisor()||STATE.user.role==='supervisor_assistant';
 const rows=items.map((x,i)=>{
  const partInfo=(x.parts||[]).map(p=>'و'+stext(p.section)+': '+stext(p.attempts_used)+'/٢').join(' | ');
  const stages=(x.parts||[]).map(p=>'و'+stext(p.section)+': '+stext(p.stages_completed||0)+'/٥').join(' | ');
  const last=x.last_platform_login?new Date(x.last_platform_login).toLocaleString('ar-OM',{dateStyle:'short',timeStyle:'short'}):'—';
  return '<tr><td>'+stext(i+1)+'</td><td>'+friendly(x.class_name)+'</td><td>'+stext(x.serial_no)+'</td>'+
   '<td>'+friendly(x.full_name)+'</td><td>'+stext(x.platform_login_count||0)+'</td>'+
   '<td>'+stext(x.contest_entry_count||0)+'</td><td>'+friendly(last)+'</td>'+
   '<td>'+friendly(partInfo)+'</td><td>'+friendly(stages)+'</td><td>'+stext(x.total)+'/٤٠٠</td>'+
   '<td>'+(x.qualified?'متأهل':'لم يتأهل بعد')+'</td>'+
   (isPrivileged?'<td>'+friendly(x.student_id||'')+'</td>':'')+'</tr>';
 }).join('');
 return '<section class="panel staff-contest-panel"><h3>📊 كشف دخول الطلاب ومراحل مسابقة نجوم آفاق</h3>'+
 '<p>يظهر الاسم والشعبة ورقم الطالب المخصص للدخول وعدد جلسات الدخول للمنصة والمسابقة ومراحل الوحدات الأربع. لا تُعرض الأرقام السرية. يبدأ عداد الدخول إلى المسابقة من تاريخ تفعيل تسجيل الزيارات.</p>'+
 '<div class="result-table-scroll"><table class="contest-detailed-students"><thead><tr>'+
 '<th>م</th><th>الشعبة</th><th>رقم الدخول</th><th>اسم الطالب</th><th>دخول المنصة</th>'+
 '<th>دخول المسابقة</th><th>آخر دخول للمنصة</th><th>المحاولات للوحدات</th><th>المراحل المجتازة</th>'+
 '<th>المجموع</th><th>الحالة</th>'+(isPrivileged?'<th>معرف الطالب الداخلي</th>':'')+
 '</tr></thead><tbody>'+rows+'</tbody></table></div></section>';
}
function contestSupervisorControls(){
 const profiles=STATE.testerStatuses||[],students=STATE.staffReport||[];
 const accounts=[1,2].map(number=>{
  const profile=profiles.find(x=>Number(x.number)===number);
  const used=profile?.report?.parts?.map(p=>'الوحدة '+stext(p.section)+': '+stext(p.attempts_used)+'/٢').join(' | ')||'محاولتان في كل وحدة';
  return '<article class="contest-tester-card"><h4>🎓 حساب المشرف التجريبي '+stext(number)+'</h4>'+
   '<p>محاكاة تجربة الطالب الرسمية، دون إضافته إلى الطلاب أو إلى ترتيب الجوائز.</p>'+
   '<p>'+used+'</p><button class="primary" type="button" data-tester-enter="'+number+'">الدخول بواجهة الطالب</button> '+
   '<button class="outline" type="button" data-tester-reset="'+number+'">إعادة احتساب المحاولات</button></article>';
 }).join('');
 const options=students.slice().sort((a,b)=>String(a.class_name).localeCompare(String(b.class_name),'ar')||Number(a.serial_no)-Number(b.serial_no))
  .map(x=>'<option value="'+friendly(x.class_name)+'|'+friendly(x.serial_no)+'">'+friendly(x.class_name)+' — '+stext(x.serial_no)+' — '+friendly(x.full_name)+'</option>').join('');
 const units=[0,1,2,3,4].map(n=>'<option value="'+n+'">'+(n===0?'جميع الوحدات الأربع':unitName(6,n))+'</option>').join('');
 return '<section class="panel contest-supervisor-console"><h3>🧑‍🎓 حسابا المشرف التجريبيان</h3>'+
 '<p>لكل حساب محاولتان رسميتان فقط في كل وحدة؛ لا تُحتسب نتائجه ضمن نتائج الطلاب الـ٩٨.</p>'+
 '<div class="contest-tester-grid">'+accounts+'</div>'+
 '<h3>🔐 إعادة ضبط محاولات طالب</h3><p>يمكن إعادة المحاولات المحددة بعد تأكيد المشرف. تُحفظ نسخة من النتائج السابقة في سجل محمي.</p>'+
 '<div class="contest-supervisor-form"><label>الطالب<select id="contestResetStudent"><option value="">اختر الطالب...</option>'+options+'</select></label>'+
 '<label>الوحدة<select id="contestResetUnit">'+units+'</select></label>'+
 '<button id="contestResetNow" class="outline" type="button">إعادة محاولات الطالب</button></div>'+
 '<p id="contestResetMessage" role="status" class="contest-admin-message"></p>'+
 '<h3>🔑 تعيين رقم سري جديد لطالب</h3>'+
 '<p>لا تُعرض الأرقام السرية الحالية؛ يمكنك تسليم رقم جديد للطالب ليغيره بنفسه بعد دخوله.</p>'+
 '<form id="contestStudentPinReset"><label>الطالب<select id="contestPinStudent" required><option value="">اختر الطالب...</option>'+options+'</select></label>'+
 '<label>الرقم الجديد (٤ أرقام)<input id="contestPinNew" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="new-password" required></label>'+
 '<label>الرقم السري الحالي للمشرف (٨ أرقام)<input id="contestSupervisorPin" type="password" inputmode="numeric" pattern="[0-9]{8}" maxlength="8" required></label>'+
 '<button class="primary" type="submit">اعتماد الرقم الجديد للطالب</button></form>'+
 '<p id="contestPinResetMessage" role="status" class="contest-admin-message"></p></section>';
}
function studentPasswordPanel(){
 if(!student())return '';
 return '<details class="panel contest-change-pin"><summary>🔑 تغيير رقمي السري بعد استلامه من المشرف</summary>'+
 '<p>يمكنك اختيار رقم سري جديد من ٤ أرقام بعد التحقق من رقمك الحالي. لا يؤثر التغيير على محاولات المسابقة.</p>'+
 '<form id="contestChangePin"><label>الرقم الحالي<input id="contestCurrentPin" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="current-password" required></label>'+
 '<label>الرقم الجديد<input id="contestNewPin" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="new-password" required></label>'+
 '<label>تأكيد الرقم الجديد<input id="contestConfirmPin" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="new-password" required></label>'+
 '<button type="submit" class="primary">حفظ الرقم السري الجديد</button></form>'+
 '<p id="contestPinChangeStatus" role="status"></p></details>';
}
function manager(){
 if(!supervisor()||isTester())return '';
 return contestSupervisorControls()+contestModelTools()+
  '<section class="panel contest-admin"><h3>تحرير النماذج العشرة والأسئلة المصورة</h3>'+
  '<p>النماذج ١–٥ للمحاولة الأولى، و٦–١٠ للمحاولة الثانية. يمكنك استعراض الرسومات وتعديل السؤال وإجابته، واعتماد النموذج بعد المراجعة.</p>'+
  '<label for="editModel">اختر نموذج المسابقة</label><select id="editModel">'+
  [...numberedModels,'A','B','C','D','E','F'].map(k=>'<option value="'+k+'" '+(STATE.editModel===k?'selected':'')+'>'+friendly(models[k])+'</option>').join('')+'</select>'+
  '<div class="contest-model-actions"><button class="outline" id="loadBank">عرض جميع الأسئلة وصورها</button>'+
  '<button class="primary" id="tryContestModel" '+(numberedModels.includes(STATE.editModel)?'':'disabled')+'>🎮 تجربة النموذج بواجهة الطالب</button></div>'+
  (STATE.bank?bankView():'')+'</section>';
}
function contestModelTools(){
 const summaries=STATE.modelSummary?.models||[];
 const assignment=STATE.modelAssignments?.assignments||[];
 const grouped=Object.values(assignment.reduce((obj,x)=>{
  const id=x.class_name+'|'+x.serial_no;
  if(!obj[id])obj[id]={class_name:x.class_name,serial:x.serial_no,name:x.student_name,first:'—',second:'—',source:'آلي'};
  obj[id][x.attempt_no===1?'first':'second']=x.model;
  if(x.assignment_source==='supervisor')obj[id].source='تعديل المشرف';
  return obj;
 },{})).sort((a,b)=>String(a.class_name).localeCompare(String(b.class_name),'ar')||Number(a.serial)-Number(b.serial));
 return '<section class="panel contest-admin contest-supervisor-models"><h3>🎯 النماذج ١–١٠ وتوزيعها على الطلاب</h3>'+
 '<p>خمسة نماذج للمحاولة الأولى، وخمسة للمحاولة الثانية؛ موزعة بالتساوي تقريبًا (٦–٧ طلاب للنموذج الواحد في الشعبة). لا يُسمح بتبديل نموذج محاولة بدأت بالفعل.</p>'+
 '<div class="contest-model-actions"><button id="loadModelSummary" class="primary">مراجعة العشرة نماذج</button>'+
 '<button id="loadModelAssignments" class="outline">كشف توزيع نماذج الطلاب</button></div>'+
 (summaries.length?'<div class="contest-model-summary">'+summaries.map(m=>
 '<div><strong>النموذج '+friendly(m.model)+'</strong><span>'+m.questions+'/٣٨ سؤال • '+m.images+' رسم • '+m.objectives+' هدف</span>'+
 '<small>'+(m.published?'✅ معتمد':'🔒 مسودة تحتاج الاعتماد')+'</small></div>').join('')+'</div>':'')+
 '<h4>تعديل نموذج طالب محدد قبل بدء المحاولة</h4>'+
 '<form id="contestModelOverride" class="contest-model-override">'+
 '<label>الشعبة<select name="class_name">'+['السادس / ٤','السادس / ٥','السادس / ٦'].map(n=>'<option>'+n+'</option>').join('')+'</select></label>'+
 '<label>رقم الطالب<input name="serial_no" type="number" min="1" max="100" required></label>'+
 '<label>المحاولة<select name="attempt_no"><option value="1">الأولى</option><option value="2">الثانية</option></select></label>'+
 '<label>النموذج<select name="model">'+numberedModels.map(n=>'<option value="'+n+'">نموذج '+n+'</option>').join('')+'</select></label>'+
 '<button class="primary" type="submit">حفظ التعديل</button></form>'+
 '<p class="contest-model-note" role="status">'+friendly(STATE.modelNotice||'النماذج ١–٥ للأولى، و٦–١٠ للثانية. سيُوثَّق كل تغيير.')+'</p>'+
 (grouped.length?'<div class="contest-model-table-wrap"><table class="contest-model-table"><thead><tr><th>الشعبة</th><th>الرقم</th><th>الطالب</th><th>المحاولة الأولى</th><th>المحاولة الثانية</th><th>المصدر</th></tr></thead><tbody>'+
 grouped.map(x=>'<tr><td>'+friendly(x.class_name)+'</td><td>'+friendly(x.serial)+'</td><td>'+friendly(x.name)+'</td><td>'+friendly(x.first)+'</td><td>'+friendly(x.second)+'</td><td>'+friendly(x.source)+'</td></tr>').join('')+'</tbody></table></div>':'')+
 '</section>';
}
function bankView(){const all=STATE.bank.questions||[];return '<div class="contest-bank"><p>عدد الأسئلة: '+all.length+' / ٣٨</p>'+all.map(q=>'<details><summary>س '+q.ordinal+' | '+friendly(q.objective)+' — '+friendly(q.prompt).slice(0,130)+'</summary>'+
 '<form class="edit-question" data-ordinal="'+q.ordinal+'"><label>نص السؤال</label><textarea name="prompt" rows="3">'+friendly(q.prompt)+'</textarea>'+
 (q.visual_svg?'<div class="contest-preview">'+figure(q)+'</div>':'')+
 '<label>ملف الرسم SVG (للمشرف فقط)</label><textarea name="visual_svg" rows="5">'+friendly(q.visual_svg||'')+'</textarea><label>وصف الرسم</label><input name="visual_caption" value="'+friendly(q.visual_caption||'')+'">'+
 (q.question_kind==='complex'?'<label>أجزاء السؤال بصيغة JSON</label><textarea name="parts" rows="7">'+friendly(JSON.stringify(q.parts,null,2))+'</textarea>':(q.options||[]).map((opt,i)=>'<label>الخيار '+(i+1)+'</label><input name="opt'+i+'" value="'+friendly(opt)+'">').join('')+'<label>رقم الإجابة الصحيحة (٠–٣)</label><input name="answer_index" type="number" min="0" max="3" value="'+q.answer_index+'">')+
 '<button class="soft" type="submit">حفظ التعديل</button></form></details>').join('')+'<button class="primary" id="publishBank">اعتماد النموذج</button><button class="outline" id="unpublishBank">إيقاف النموذج</button></div>'}
function home(){
 const approved=STATE.catalog.some(x=>x.grade===STATE.grade&&x.section===STATE.section&&numberedModels.includes(x.model)&&x.published);
 const introduction=STATE.grade===6?'أربع وحدات • ٤٠٠ نقطة • التأهل من ٣٥٠ نقطة • محاولتان رسميتان لكل وحدة':'قسمان من دروس الفصل الأول • ٢٥ نقطة لكل قسم • المجموع ٥٠ ويضاعف إلى ١٠٠ • تدريب رمزي دون محاولات رسمية';
 const thisUnit=STATE.report?.parts?.find(p=>p.section===STATE.section);
 const exhausted=!!(STATE.mode==='official'&&thisUnit?.attempts_remaining===0&&
  !(thisUnit.records||[]).some(x=>x.status==='in_progress'));
 const allowed=STATE.mode!=='official'||(approved&&!exhausted);
 const avatar=image(entryArt(),player()?'الصورة المعتمدة للطالب':'الصورة المعتمدة للمشرف والإدارة','entry-approved-avatar');
 return '<div class="contest-home">'+(isTester()?'<div class="contest-tester-active"><b>🎓 وضع الطالب التجريبي رقم '+stext(STATE.testerProfile)+' — تخضع محاولاتك لقواعد الطالب نفسها.</b><button type="button" id="leaveTester" class="outline">العودة إلى دائرة الإشراف</button></div>':'')+
 '<div class="contest-welcome contest-welcome-image">'+avatar+'<div><span class="contest-label">⭐ مسابقة نجوم آفاق الرياضيات ⭐</span><h2>مرحبًا '+friendly(STATE.displayName||STATE.user?.username||'بك')+'</h2><p>'+introduction+'</p></div><button class="outline" id="logoutContest">خروج</button></div>'+ (allowedStaff()?'<div class="contest-grades">'+[5,6,7,8].map(g=>'<button class="'+(STATE.grade===g?'chosen':'')+'" data-grade="'+g+'">الصف '+gradeNames[g]+'</button>').join('')+'</div>':'')+
 unitCards()+progress()+sampleScorePanel()+certificateHistoryPanel()+studentPasswordPanel()+
 '<h3 class="contest-title">اختر النموذج</h3><div class="contest-modes"><button class="'+(STATE.mode==='training'?'primary':'outline')+'" data-mode="training">🎯 تدريب غير رسمي — '+trainingTitle()+'</button>'+(official()?'<button class="'+(STATE.mode==='official'?'primary':'outline')+'" data-mode="official">🏆 المحاولات الرسمية</button>':'')+'</div>'+
 '<p class="contest-instructions">المراحل الخمس في التدريب والمحاولات الرسمية متشابهة في العرض والتوقيت والصور. تظهر الإجابة الصحيحة والتعزيز خلال ٥ ثوانٍ، وبين كل مرحلتين استراحة ثابتة مدتها دقيقتان مع عداد رقمي وجرس؛ ثم تبدأ المرحلة التالية تلقائيًا ولو لم يضغط الطالب زر الاستعداد. لكل سؤال تلميح مساعد، ويتضمن النموذج سؤالين فقط بأسلوب صوتي أو بإدخال أرقام عربية أو إنجليزية.</p>'+road()+
 '<div class="contest-rules"><b>طريقة احتساب الدرجة:</b> ثلاث مراحل سريعة، ثم مختبر مستر بين، ثم تحدي الأستاذ سعيد. لكل مرحلة ١٠ نقاط، فيكون المجموع ٥٠ ويُضاعف إلى ١٠٠. تُحتسب أفضل نتيجة لكل وحدة.</div>'+
 (exhausted?'<div class="notice">اكتملت المحاولتان الرسميتان لهذه الوحدة؛ لن تُفتح محاولة ثالثة إلا بعد إعادة الضبط من دائرة الإشراف.</div>':approved||STATE.mode!=='official'?'':'<div class="notice">المحاولة الرسمية لهذه الوحدة لم تعتمد بعد؛ يمكنك تجربة نموذج التدريب.</div>')+
 (STATE.error?'<p class="notice" role="alert">'+friendly(STATE.error)+'</p>':'')+
 '<div class="contest-start-wrap"><button class="primary" id="prepare" '+(allowed?'':'disabled')+'>'+(STATE.mode==='official'?'الاستعداد للمحاولة الرسمية':'بدء '+trainingTitle())+'</button></div>'+staffResults()+manager()+'</div>';
}
function readyPage(){
 const n=STATE.readyStage,st=stage(n),breakRequired=n>1&&STATE.stageBreakUntil>0;
 const left=breakRequired?clockSec(STATE.stageBreakUntil):0;
 const fraction=breakRequired?Math.max(0,Math.min(100,left/120*100)):0;
 return '<div class="contest-between-stages">'+(n>1?stageResultsPanel():'')+
 '<section class="stage-ready-page '+stageThemeClass(n)+' '+(breakRequired?'contest-stage-rest':'')+'"><div class="ready-art">'+
 stagePortrait(n,'ready')+stageArtCaption(n)+'</div>'+
 '<span class="ready-kicker">استعد للمرحلة '+stext(n)+' من ٥</span><h2>'+st.title+'</h2><h3>'+st.desc+'</h3>'+
 '<p>'+st.detail+(breakRequired?' — استراحة إلزامية مدتها دقيقتان قبل المرحلة التالية.':' — أحضر تركيزك واستعد للتحدي.')+'</p>'+
 (breakRequired?'<div class="contest-break-panel" aria-label="الاستراحة بين مراحل المسابقة">'+
 '<span class="contest-break-caption">⏳ الوقت المتبقي لبداية المرحلة التالية</span>'+
 '<strong class="contest-digital-clock" id="contestBreakClock" role="timer" aria-live="off">'+tformat(left,n)+'</strong>'+
 '<div class="contest-break-progress"><i id="contestBreakBar" style="width:'+fraction+'%"></i></div>'+
 '<p id="contestBreakStatus" role="status">'+(left<=20?'🔔 اقترب موعد الانطلاق. استعد الآن!':'ستسمع تنبيهًا تصاعديًا عند بقاء ٢٠ ثانية، ثم جرس بدء المرحلة.')+'</p>'+
 '<div id="contestBreakReadyStatus" class="contest-break-ready" role="status">'+
 (STATE.breakReady?'✅ تم تسجيل استعدادك. ستبدأ المرحلة تلقائيًا عند انتهاء الدقيقتين.':
 'يمكنك إعلان استعدادك الآن؛ وحتى إن لم تفعل فستبدأ المرحلة تلقائيًا عند نهاية الاستراحة.')+
 '</div></div>':'')+
 '<div class="ready-rules">✔️ '+(breakRequired?'فاصل ٠٢:٠٠ ثابت • انطلاق تلقائي • جرس قبل ٢٠ ثانية':'يمكنك بدء المرحلة الأولى الآن')+
 ' • ✔️ التصحيح بعد كل سؤال • ✔️ تنبيه قبل نهاية وقت الإجابة</div>'+
 (STATE.error?'<div class="notice">'+friendly(STATE.error)+'</div>':'')+
 '<div class="ready-buttons"><button class="primary" id="beginStage" '+
 (STATE.busy||breakRequired&&STATE.breakReady?'disabled':'')+'>'+
 (breakRequired?(STATE.breakReady?'✅ أنا مستعد للمرحلة القادمة':'✅ أنا مستعد وسأكمل'):'✅ أوافق على بدء المرحلة — انطلق!')+
 '</button><button class="outline" id="exitStage">العودة إلى لوحة الوحدات</button></div></section></div>';
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
function tformat(seconds,which){return String(Math.floor(Math.max(0,seconds)/60)).padStart(2,'0')+':'+String(Math.max(0,seconds)%60).padStart(2,'0')}

const nscore=v=>Number.isFinite(Number(v))?Number(v):0;
const stext=v=>new Intl.NumberFormat('ar-OM',{maximumFractionDigits:2}).format(Math.round(nscore(v)*100)/100);
const sper=(a,b)=>b>0?Math.max(0,Math.min(100,Math.round(nscore(a)/b*100))):0;
const percentExact=(a,b)=>b>0?Math.max(0,Math.min(100,Math.round(nscore(a)/b*10000)/100)):0;
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
 return '<section class="contest-stage-results"><h3>📊 حصيلة المراحل المنجزة</h3><div class="contest-stage-result-grid">'+done.map(n=>'<div class="contest-stage-result-item '+stageThemeClass(n)+'"><span>المرحلة '+stext(n)+' — '+friendly(stage(n).title)+'</span><strong>'+stext(sttotal(n).earned)+' / ١٠</strong><small>'+stext(sper(sttotal(n).earned,10))+'٪ من نقاط المرحلة</small></div>').join('')+
 '</div><div class="contest-stage-total">مجموع المراحل المكتملة: <strong>'+stext(earned)+' / '+stext(max)+'</strong> — <strong>'+stext(sper(earned,max))+'٪</strong></div></section>';
}

/* Accessible presentation variations: only ordinals 7 and 18 in the 38-question
   model. Correct answers never leave the server before assessment. */
function contestToASCII(v){return String(v??'').replace(/[٠-٩]/g,x=>'٠١٢٣٤٥٦٧٨٩'.indexOf(x))
 .replace(/[۰-۹]/g,x=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(x)).replace(/٫/g,'.').replace(/[٬\s]/g,'').replace(/[−–]/g,'-')}
function contestReadable(v){
 let s=String(v??'');
 if(STATE.digitStyle==='en')s=s.replace(/[٠-٩]/g,x=>'٠١٢٣٤٥٦٧٨٩'.indexOf(x)).replace(/[۰-۹]/g,x=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(x));
 else s=s.replace(/[0-9]/g,x=>'٠١٢٣٤٥٦٧٨٩'[Number(x)]).replace(/[۰-۹]/g,x=>'٠١٢٣٤٥٦٧٨٩'['۰۱۲۳۴۵۶۷۸۹'.indexOf(x)]);
 return friendly(s);
}
function contestSpecial(q){
 if(!q||q.question_kind==='complex')return '';
 if(q.ordinal===7)return 'voice';
 if(q.ordinal===18)return (q.options||[]).length>0&&q.options.every(v=>/^[+-]?\d+(?:\.\d+)?$/.test(contestToASCII(v)))?'number':'voice';
 return '';
}
function contestHint(q){
 const t=String(q?.prompt||'')+' '+String(q?.objective||'');
 if(/محيط/.test(t)&&/مساحة/.test(t))return 'انتبه: المحيط مجموع الأطوال الخارجية، أما المساحة فتُقاس بوحدات مربعة داخل الشكل.';
 if(/متتاليات|متتالية|نمط/.test(t))return 'راقب الفرق أو عامل الضرب بين كل حدين متتالين، ثم طبّق القاعدة نفسها.';
 if(/جمع الأعداد العشرية|طرح الأعداد العشرية/.test(t))return 'حاذِ الفواصل العشرية ورتّب المنازل المتناظرة قبل الجمع أو الطرح.';
 if(/الأعداد العشرية|الأعشار|جزء من مئة/.test(t))return 'حدّد منزلة كل رقم على يمين الفاصلة العشرية قبل إجراء العملية أو المقارنة.';
 if(/وحدات الطول|التحويل بين الوحدات|متر|سنتيمتر|كيلومتر/.test(t))return 'وحّد وحدة القياس أولًا، ثم استخدم الضرب أو القسمة بحسب اتجاه التحويل.';
 if(/تقويم|تاريخ|الأسبوع|أيام الشهر/.test(t))return 'تذكّر أن الأسبوع سبعة أيام؛ استخدم العد المتتابع وحدد عدد أيام الشهر.';
 if(/قيمة مكانية|منزلة|مئات|عشرات|آحاد|الألوف/.test(t))return 'حدّد المنزلة من جهة الآحاد وانتبه للفرق بين الرقم وقيمته المكانية.';
 if(/تقريب|أقرب/.test(t))return 'حدّد المنزلة المطلوبة وافحص الرقم المجاور: ٥ أو أكثر يعني رفع المنزلة.';
 if(/أولي|قاسم|عوامل|القواسم/.test(t))return 'اختبر القواسم الصغيرة وتحقق من شرط المسألة.';
 if(/المضاعفات|مضاعف/.test(t))return 'استعن بجدول الضرب وابحث عن نمط المضاعفات.';
 if(/ضرب|×/.test(t))return 'استعن بالتوزيع أو المضاعفة والتنصيف ثم تحقق بالتقدير.';
 if(/قسمة|÷|باقي/.test(t))return 'استخدم الضرب العكسي، وتحقق من علاقة المقسوم بالضرب والباقي.';
 if(/جمع|طرح/.test(t))return 'جرّب التجزئة حسب المنازل أو التعويض، ثم تحقق عكسيًا.';
 if(/محيط/.test(t))return 'اجمع أطوال الأضلاع الخارجية واحفظ وحدة القياس.';
 if(/مساحة/.test(t))return 'تخيّل المربعات التي تغطي داخل الشكل وحدد الوحدات المناسبة.';
 if(/زاوية|مستقيم|مثلث|مربع|مستطيل/.test(t))return 'راجع خصائص الأضلاع والزوايا قبل الحل.';
 if(/زمن|ساعة|دقيقة/.test(t))return 'وحّد الوحدات؛ الساعة ٦٠ دقيقة.';
 if(q?.question_kind==='complex')return 'جزّئ المسألة إلى خطوات، وحدّد العملية المناسبة لكل جزء.';
 return 'اقرأ المعطيات وحدد المطلوب، ثم قدّر الناتج واستبعد الإجابة غير المنطقية.';
}
function contestSpeakQuestion(q){
 const status=document.getElementById('contestAudioStatus');
 if(!('speechSynthesis' in window)||typeof SpeechSynthesisUtterance==='undefined'){
  if(status)status.textContent='تعذّر تشغيل الصوت؛ جميع نصوص السؤال والخيارات ظاهرة ويمكن قراءتها.';
  return;
 }
 try{
  window.speechSynthesis.cancel();
  const choices=(q.options||[]).map((v,i)=>'الخيار '+['الأول','الثاني','الثالث','الرابع'][i]+': '+v).join('، ');
  const utterance=new SpeechSynthesisUtterance(String(q.prompt)+'، '+choices);
  utterance.lang='ar-OM';utterance.rate=.86;
  utterance.voice=(window.speechSynthesis.getVoices?.()||[]).find(v=>/^ar(-|$)/i.test(v.lang))||null;
  utterance.onerror=()=>{if(status)status.textContent='تعذّر سماع القراءة، ويظل السؤال والخيارات ظاهرة أمامك.'};
  window.speechSynthesis.speak(utterance);
  if(status)status.textContent='🔊 تُقرأ المسألة بالعربية، وجميع خيارات الإجابة ظاهرة على الشاشة.';
 }catch{if(status)status.textContent='تعذّر تشغيل الصوت؛ اقرأ النص الظاهر أمامك.'}
}
function quiz(){const q=getCurrent();if(!q)return '';
 const st=stage(q.stage),isMulti=q.question_kind==='complex',n=q.stage<=3?(q.ordinal-1)%10+1:(q.ordinal-31)%4+1;
 const seconds=remaining(),frac=Math.max(0,Math.min(100,seconds/st.time*100));
 const special=contestSpecial(q);
 const choices=isMulti?(q.parts||[]).map((part,i)=>'<div class="contest-subpart"><h4>('+String(i+1)+') '+contestReadable(part.text)+'</h4>'+
 (part.type==='choice'?'<div class="contest-choice-grid">'+(part.choices||[]).map(v=>'<label><input type="radio" name="part'+i+'" value="'+friendly(v)+'"><span>'+contestReadable(v)+'</span></label>').join('')+'</div>':
 '<input class="contest-number" inputmode="decimal" data-part="'+i+'" placeholder="أرقام عربية ١٢٣ أو إنجليزية 123">')+'</div>').join(''):
 special==='number'?'<form class="contest-numeric-entry" id="contestNumericForm">'+
 '<label for="contestNumericInput">🔢 اكتب الإجابة بأرقام عربية أو إنجليزية</label>'+
 '<div class="contest-numeric-line"><input id="contestNumericInput" inputmode="decimal" autocomplete="off" required placeholder="١٠٠ أو 100">'+
 '<button type="submit" class="primary">✅ تأكيد العدد</button></div>'+
 '<p class="contest-numeric-values">القيم المتاحة: '+(q.options||[]).map(contestReadable).join(' • ')+'</p>'+
 '<p id="contestNumericError" role="alert" class="contest-numeric-error"></p></form>':
 (q.options||[]).map((v,i)=>'<button class="contest-option" data-choice="'+i+'">'+
 '<span class="option-letter">'+['أ','ب','ج','د'][i]+'</span>'+contestReadable(v)+'</button>').join('');
 const helpTools='<div class="contest-question-tools">'+
 '<button type="button" id="contestHintButton" aria-expanded="'+(STATE.hintFor===q.id)+'">💡 '+(STATE.hintFor===q.id?'إخفاء التلميح':'تلميح مساعد')+'</button>'+
 (special==='voice'?'<button type="button" id="contestListenButton">🔊 استمع للسؤال بالعربية</button>':'')+
 (special?'<button type="button" id="contestDigitsToggle">🔢 تبديل الأرقام '+(STATE.digitStyle==='ar'?'١٢٣ / 123':'123 / ١٢٣')+'</button>':'')+
 '</div>'+(special==='voice'?'<p class="contest-audio-transcript">📝 النص والخيارات ظاهرة حتى عند تعذر الصوت.</p>':'')+
 '<p class="contest-audio-status" id="contestAudioStatus" role="status"></p>'+
 '<div id="contestHintText" class="contest-hint-box" '+(STATE.hintFor===q.id?'':'hidden')+'>'+friendly(contestHint(q))+'</div>';
 return '<div class="contest-playing '+stageThemeClass(q.stage)+'"><div class="contest-headline"><div><span>'+(STATE.mode==='official'?'🏆 المحاولة الرسمية':'🎯 '+trainingTitle())+'</span><h2>'+unitName(STATE.grade,STATE.section)+'</h2><small>'+friendly(STATE.displayName||STATE.user?.username||'الطالب')+'</small></div><div class="contest-score-badge"><strong>٥٠ ← ١٠٠</strong><small>أفضل نتيجة</small></div></div>'+road(q.stage)+raceTrack(q,false)+
 '<div class="contest-game-area '+stageThemeClass(q.stage)+'"><div class="contest-stage-banner"><div class="contest-character">'+stagePortrait(q.stage,'banner')+'</div><div><span class="contest-label">المرحلة '+q.stage+' من ٥ — ١٠ درجات</span><h2>'+st.title+'</h2><p>'+st.desc+'</p>'+stageArtCaption(q.stage)+'</div><div class="contest-timer"><strong id="contestClock">'+tformat(seconds,q.stage)+'</strong><small>'+(q.stage<=3?'وقت السؤال':'وقت المرحلة')+'</small><span class="contest-timerline"><i id="contestTimerBar" style="width:'+frac+'%"></i></span><small class="contest-clock-warning" id="contestTimeWarning" role="status">'+(seconds<=(q.stage<=3?5:90)?'🔔 بقي وقت قليل، استعد لإنهاء الإجابة.':'')+'</small></div></div><div class="contest-question-meta"><span>السؤال '+n+' من '+(q.stage<=3?10:4)+'</span><span>التقدم '+(STATE.index+1)+' / ٣٨</span><span>'+(isMulti?'مسألة متعددة الأجزاء':'اختيار من متعدد')+'</span></div><div class="contest-question"><h3>'+contestReadable(q.prompt)+'</h3>'+figure(q)+choices+helpTools+
 '<div class="contest-help" id="contestHelp">'+friendly(STATE.feedback||('ركز يا '+(STATE.user?.username||'بطل')+'، ثم أجب عن السؤال.'))+'</div></div><div class="contest-controls">'+(isMulti?'<button id="sendComplex" class="primary">✅ إرسال الإجابات والمتابعة</button>':'<p class="auto-answer-hint">اختر الإجابة لعرض التصحيح والتعزيز ثم الانتقال تلقائيًا بعد ٥ ثوانٍ.</p>')+'<button id="finishEarly" class="outline">إنهاء '+(STATE.mode==='official'?'المحاولة':'التدريب')+' الآن</button></div>'+
 (STATE.error?'<div class="notice">'+friendly(STATE.error)+'</div>':'')+'</div></div>';
}
function transition(){
 const f=STATE.lastFeedback,q=STATE.feedbackQuestion,n=STATE.feedbackStage||1,
  name=STATE.displayName||STATE.user?.username||'المتسابق';
 if(!q)return '<section class="contest-playing"><p>يجري الانتقال إلى السؤال التالي… <b id="nextCountdown">'+stext(clockSec(STATE.waitingUntil))+'</b></p></section>';
 const correct=f?.correct===true,unanswered=f?.unanswered===true;
 const status=unanswered?'⏰ لم تُجب في الوقت المحدد':correct?'✅ إجابة صحيحة':'❌ إجابة خاطئة';
 const encouragement=unanswered?'انتهى وقت السؤال يا '+name+'؛ راجع التصحيح ثم حاول الإجابة بسرعة في القادم.':
  correct?'أحسنت يا '+name+'، إجابة ممتازة! استمر في تقدمك.':
  'لم تكن إجابتك صحيحة يا '+name+'؛ تعلّم من التصحيح وركز في السؤال القادم، تستطيع أن تتحسن.';
 let choices='';
 if(q.question_kind!=='complex'){
  choices='<div class="contest-review-options">'+(q.options||[]).map((v,i)=>{
   const right=f&&String(v)===String(f.correct_answer);
   const selected=STATE.feedbackAnswer!==null&&Number(STATE.feedbackAnswer)===i;
   const css=right?'answer-correct':selected?'answer-wrong':'';
   const tag=right?'✓ الاختيار الصحيح':selected?'✕ إجابتك خاطئة':'';
   return '<div class="contest-option contest-review-option '+css+'"><span class="option-letter">'+['أ','ب','ج','د'][i]+'</span>'+
    '<span class="contest-option-value">'+friendly(v)+'</span>'+(tag?'<b class="contest-answer-tag">'+tag+'</b>':'')+'</div>';
  }).join('')+'</div>';
 }else{
  const answers=Array.isArray(STATE.feedbackAnswer)?STATE.feedbackAnswer:[],
   solutions=Array.isArray(f?.correct_answer)?f.correct_answer:[];
  choices='<div class="contest-review-parts">'+(q.parts||[]).map((part,i)=>{
   const chosen=answers[i]??'',right=solutions[i]??'',matched=String(chosen).trim()===String(right).trim();
   return '<div class="contest-review-part '+(matched?'answer-correct':'answer-wrong')+'">'+
    '<strong>('+stext(i+1)+') '+friendly(part.text)+'</strong>'+
    '<span>'+(matched?'✅ إجابتك صحيحة: ':'❌ إجابتك خاطئة: ')+friendly(chosen||'لم تجب')+'</span>'+
    (!matched?'<span class="contest-right-answer">✓ التصحيح: '+friendly(right||'—')+'</span>':'')+'</div>';
  }).join('')+'</div>';
 }
 const earned=nscore(f?.earned),max=nscore(f?.max)||1,
  stageScore=nscore(sttotal(n).earned),overall=totalEarned();
 const metric='<div class="contest-feedback-metrics"><div><strong>'+stext(earned)+' / '+stext(max)+'</strong><small>درجة السؤال • '+stext(sper(earned,max))+'٪</small></div>'+
  '<div><strong>'+stext(stageScore)+' / ١٠</strong><small>المرحلة • '+stext(sper(stageScore,10))+'٪</small></div>'+
  '<div><strong>'+stext(overall)+' / ٥٠</strong><small>الإجمالي • '+stext(sper(overall,50))+'٪</small></div></div>';
 const art=stage(n),sec=clockSec(STATE.waitingUntil);
 return '<div class="contest-playing contest-answer-phase '+stageThemeClass(n)+'"><div class="contest-headline">'+
  '<div><span>'+(STATE.mode==='official'?'🏆 محاولة رسمية':'🎯 تدريب')+'</span><h2>'+unitName(STATE.grade,STATE.section)+'</h2>'+
  '<small>'+friendly(name)+'</small></div><div class="contest-score-badge"><strong>'+stext(overall)+' / ٥٠</strong><small>المجموع الحالي</small></div></div>'+
  road(n)+raceTrack(q,true)+
  '<div class="contest-game-area '+stageThemeClass(n)+'"><div class="contest-stage-banner"><div class="contest-character">'+
  stagePortrait(n,'banner')+'</div><div><span class="contest-label">المرحلة '+stext(n)+' من ٥</span>'+
  '<h2>'+friendly(art.title)+'</h2><p>التصحيح داخل لوحة السؤال نفسها</p>'+stageArtCaption(n)+'</div></div>'+
  '<div class="contest-question contest-correction-inline"><h3>'+friendly(q.prompt)+'</h3>'+figure(q)+
  choices+'<div class="contest-answer-status '+(correct?'is-correct':'is-wrong')+'" role="status"><h3>'+status+'</h3>'+
  '<p>'+friendly(encouragement)+'</p>'+
  (!correct&&f?.correct_answer!==undefined?'<p class="contest-correction">✅ الإجابة الصحيحة: '+
   friendly(Array.isArray(f.correct_answer)?f.correct_answer.join('، '):f.correct_answer)+'</p>':'')+
  (f?.explanation?'<p class="contest-explanation">💡 '+friendly(f.explanation)+'</p>':'')+
  metric+'<p class="contest-inline-countdown">الانتقال تلقائيًا إلى السؤال التالي خلال <strong id="nextCountdown">'+
  stext(sec)+'</strong> ثوانٍ.</p></div></div></div></div>';
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
 const training=readTrainingCertificate(),official=player()?STATE.certificates||[]:[];
 const trainingAny=STATE.grade===6&&[1,2,3,4].some(n=>pastTrainingUnit(n));
 const officialAny=STATE.grade===6&&player()&&STATE.report;
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

function certificateTrophyArt(){
 return '<svg viewBox="0 0 138 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="كأس التميز الذهبي">'+
 '<defs><linearGradient id="afaqCupGold" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#fff2b5"/><stop offset=".42" stop-color="#ebbc53"/><stop offset="1" stop-color="#a8751e"/></linearGradient></defs>'+
 '<g fill="none" stroke="#39866b" stroke-width="4.6" stroke-linecap="round"><path d="M34 123C17 106 12 88 17 63M104 123c17-17 22-35 17-60"/>'+
 '<path d="M22 73l-12-8M23 84l-13-2M28 96l-13 4M35 108l-13 9M116 73l12-8M115 84l13-2M110 96l13 4M103 108l13 9"/></g>'+
 '<path d="M43 30h52v47c0 21-16 36-26 36S43 98 43 77Z" fill="url(#afaqCupGold)" stroke="#98671a" stroke-width="2.5"/>'+
 '<path d="M43 38H25c-3 25 5 36 20 36M95 38h18c3 25-5 36-20 36" fill="none" stroke="#bf8b30" stroke-width="8" stroke-linecap="round"/>'+
 '<path d="M69 113v18M49 134h40" stroke="#aa771f" stroke-width="9" stroke-linecap="round"/>'+
 '<path d="m69 48 6 13 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2Z" fill="#fff7dc"/>'+
 '<circle cx="35" cy="18" r="4.2" fill="#d1a544"/><circle cx="101" cy="17" r="4.2" fill="#d1a544"/>'+
 '</svg>';
}
function certificateMedalArt(){
 return '<svg viewBox="0 0 130 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ميدالية الإنجاز">'+
 '<defs><linearGradient id="afaqMedalGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff9db"/><stop offset=".5" stop-color="#efca66"/><stop offset="1" stop-color="#a66b1d"/></linearGradient></defs>'+
 '<path d="M37 12h25l20 63-21 10ZM93 12H68L48 75l21 10Z" fill="#bf2e3a" stroke="#f4e3c3" stroke-width="2"/>'+
 '<circle cx="65" cy="94" r="39" fill="url(#afaqMedalGold)" stroke="#a87825" stroke-width="4"/>'+
 '<circle cx="65" cy="94" r="30" fill="none" stroke="#fff5d7" stroke-width="3"/>'+
 '<path d="m65 72 7 14 15 2-11 11 3 16-14-8-14 8 3-16-11-11 15-2Z" fill="#fff8df" stroke="#bb8a30" stroke-width="1.6"/>'+
 '<g fill="#cc9e48"><circle cx="16" cy="70" r="4"/><circle cx="113" cy="65" r="4"/><circle cx="20" cy="117" r="3"/></g>'+
 '</svg>';
}
function certificatePraise(cert,report){
 const training=cert.training===true,total=report?nscore(report.total):nscore(cert.score),max=report?400:100;
 const pct=max?total/max*100:0,finished=report?nscore(report.completed_units)===4:true;
 if(!finished)return 'نُقدّر مشاركتك الجادّة والجهد الذي بذلته حتى الآن في حل التحديات الرياضية. نحثّك على مواصلة المحاولة وإكمال الوحدات المتبقية، ونتمنى لك دوام التقدم والنجاح.';
 if(pct>=87.5)return training?
  'نُشيد بتفوقك في التدريب وحُسن توظيف مهاراتك الرياضية، ونثمّن مثابرتك وجهدك المتميز. نتطلع إلى تألقك في المنافسة الرسمية.':
  'نُبارك لك هذا التفوق الرياضي المتميز، ونُثمن دقتك ومثابرتك التي أثمرت تحقيق حد التأهل للمفاضلة على الجوائز. تستحق الشكر والتقدير على هذا الإنجاز.';
 if(pct>=75)return 'نُشيد بمستواك الجيد والجهد الكبير الذي بذلته في إتمام التحديات الرياضية. ونتطلع إلى مواصلة التدريب للوصول إلى مراتب أعلى من التفوق والتميز.';
 if(pct>=50)return 'نُقدّر اجتهادك ومثابرتك في إتمام وحدات المسابقة، ونشكرك على ما بذلته من جهد. نثق بقدرتك على تحسين النتائج بمزيد من المراجعة والتدريب.';
 return 'نشكرك على شجاعة المحاولة والمشاركة وإتمام التحديات. كل محاولة خطوة نحو التعلم والتقدم؛ استمر في التدريب، ولا تتوقف عن اكتشاف إمكاناتك الرياضية.';
}
function certificateMarkup(cert){
 if(!cert)return '';
 const grade=gradeNames[cert.grade]||String(cert.grade),isSix=Number(cert.grade)===6,training=cert.training===true;
 const report=certificateReport400(cert);
 const total=report?nscore(report.total):nscore(cert.score);
 const maximum=isSix?400:100, percent=percentExact(total,maximum);
 const completed=report?nscore(report.completed_units):0;
 const qualified=!training&&isSix&&report?.qualified===true&&completed===4&&total>=350;
 const allDone=isSix&&completed===4;
 const note=training?'نسخة تدريبية لا تُحتسب في المنافسة الرسمية':'مسابقة نجوم آفاق الرياضيات';
 const title=isSix?(allDone?'شهادة إنجاز وتقدير':'شهادة مشاركة وبيان نتائج'):'شهادة تقدير ونتائج';
 const mark=training?'تدريب غير رسمي':qualified?'متأهل للمفاضلة على الجوائز':isSix&&completed<4?'لم يستكمل شروط التأهل':isSix?'غير متأهل للمفاضلة':'بيان أداء';
 const statusClass=training?'is-training':qualified?'is-qualified':'is-not-qualified';
 let status='';
 if(training)status='هذه النتيجة تدريبية ولا تُعد تأهلًا للمسابقة أو اعتمادًا للجوائز.';
 else if(!isSix)status='نتيجة هذا القسم لا تُعد شهادة تأهل رسمية.';
 else if(!report)status='لم تتوفر بيانات الوحدات الأربع كاملة؛ يُرجى تحديث النتائج.';
 else if(qualified)status='أكمل الوحدات الأربع وحصل على ٣٥٠ نقطة فأكثر؛ متأهل للمفاضلة على الجوائز.';
 else if(completed<4&&total>=350)status='حقق ٣٥٠ نقطة فأكثر، لكن يلزمه إكمال جميع الوحدات الأربع للتأهل.';
 else if(completed<4)status='لم يُكمل الوحدات الأربع؛ يلزم إتمامها وجمع ٣٥٠ نقطة فأكثر للتأهل.';
 else status='أكمل الوحدات الأربع، لكنه لم يبلغ حد التأهل البالغ ٣٥٠ نقطة.';
 const rows=isSix?[1,2,3,4].map(n=>{
  const p=(report?.parts||[]).find(x=>Number(x.section)===n);
  const available=p?.best!=null&&Number.isFinite(Number(p.best));
  const value=available?nscore(p.best):null;
  const done=!!p?.finished;
  return '<tr><td>'+stext(n)+'</td><td>'+friendly(unitName(6,n))+'</td>'+
   '<td>'+(available?stext(value):'—')+' / ١٠٠</td>'+
   '<td>'+(available?stext(percentExact(value,100))+'٪':'—')+'</td>'+
   '<td class="'+(done?'afaq-cert-done':'afaq-cert-pending')+'">'+(done?'مكتملة':available?'غير مكتملة':'لم تُستكمل')+'</td></tr>';
 }).join(''):'';
 const unitTable=isSix?'<section class="afaq-cert-units"><h4>النتائج في الوحدات الأربع</h4>'+
  '<table class="afaq-cert-units-table"><thead><tr><th>الوحدة</th><th>مجال التحدي</th><th>الدرجة</th><th>النسبة</th><th>الحالة</th></tr></thead><tbody>'+rows+'</tbody></table></section>':'';
 const classLine=cert.class_name?'<span><b>الشعبة:</b> '+friendly(cert.class_name)+'</span>':'';
 const serialLine=cert.serial_no?'<span><b>الرقم التسلسلي:</b> '+friendly(cert.serial_no)+'</span>':'';
 const scoreText=(report||!isSix)?stext(total):'—';
 const pctText=(report||!isSix)?stext(percent)+'٪':'—';
 const id=cert.id&&!training?'<span class="afaq-cert-ref"><b>رقم مرجعي:</b> <span dir="ltr">'+friendly(cert.id)+'</span></span>':'';
 const thanks=certificatePraise(cert,report);
 return '<section class="afaq-certificate afaq-cert-v4 '+statusClass+'" id="afaqPrintableCertificate" dir="rtl">'+
  '<div class="afaq-cert-flag-ribbon" aria-hidden="true"><span></span><span></span><span></span></div>'+
  '<div class="afaq-cert-top"><div class="afaq-cert-art">'+certificateTrophyArt()+'</div>'+
   '<div class="afaq-cert-brand"><span class="afaq-cert-eyebrow">'+friendly(note)+'</span>'+
    '<strong>منصة آفاق ماث</strong><span>مسابقة نجوم آفاق الرياضيات</span></div>'+
   '<div class="afaq-cert-art">'+certificateMedalArt()+'</div></div>'+
  '<div class="afaq-cert-heading"><h2>'+friendly(title)+'</h2>'+
   '<p>بكل فخر واعتزاز، نتقدم بالشكر والتقدير إلى المتسابق</p>'+
   '<h3 class="afaq-cert-contestant">'+friendly(cert.display_name||'المتسابق')+'</h3></div>'+
  '<div class="afaq-cert-details"><span><b>الصف:</b> '+friendly(grade)+'</span>'+
   classLine+serialLine+'<span><b>التاريخ:</b> '+friendly(certificateDate(cert.ended_at))+'</span>'+id+'</div>'+
  unitTable+
  '<div class="afaq-cert-summary"><div class="afaq-cert-score-main"><span>المجموع الكلي '+(isSix?'للوحدات الأربع':'للقسم')+'</span>'+
   '<strong>'+scoreText+' / '+stext(maximum)+'</strong><small>'+pctText+'</small></div>'+
   '<div class="afaq-cert-status '+statusClass+'"><strong>'+friendly(mark)+'</strong>'+
   '<span>'+friendly(status)+'</span></div></div>'+
  '<p class="afaq-cert-praise">'+friendly(thanks)+'</p>'+
  '<p class="afaq-cert-thanks">وفقك الله وسدد خطاك، ونتمنى لك مزيدًا من النجاح والتقدم.</p>'+
  '<p class="afaq-cert-fineprint">هذه وثيقة نتائج من منصة آفاق ماث حسب البيانات المتاحة، وليست تصديقًا رسميًا من المدرسة أو إعلانًا نهائيًا للفائزين.</p>'+
  '<div class="afaq-cert-footer"><div><b>الإعداد والإشراف</b><span>الأستاذ سعيد بن جمعة بن عبدالله البريكي</span></div>'+
  '<div><b>مدير المدرسة</b><span>الأستاذ عبد الله بن علي العيسائي</span></div></div></section>';
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
 (STATE.grade===6&&report?'<div class="afaq-cert-overall"><span>المجموع العام للوحدات الأربع</span><strong>'+stext(report.total)+' / ٤٠٠</strong><span>'+stext(percentExact(report.total,400))+'٪</span></div>':'')+
 '<p>'+(r.training?'هذه نتيجة تدريبية ولا تستهلك محاولات المنافسة الرسمية.':'تم حفظ النتيجة الرسمية في نظام المسابقة، وتُحتسب أفضل نتيجة لكل وحدة.')+'</p>'+
 '<h3 class="afaq-cert-section-title">📜 شهادتك وبيان نتائج المراحل</h3>'+
 certificateMarkup(cert)+certificateActions(cert)+
 (r.training&&r.details?'<details class="contest-review"><summary>مراجعة الأسئلة والإجابات</summary>'+r.details.map((x,i)=>'<p>السؤال '+stext(i+1)+' : '+stext(x.earned)+' / '+stext(x.max)+' نقطة — '+friendly(x.explanation||'')+'</p>').join('')+'</details>':'')+
 '<button class="outline" id="returnHome">العودة إلى الوحدات والنتائج</button></div>';
}
function passwordChangeLock(){return '<div class="contest-lock" dir="rtl"><div class="contest-icon">🔐</div>'+
 '<h2>دخول مسابقة نجوم آفاق مغلق مؤقتًا لحسابك</h2>'+
 '<p>يجب أن تغيّر الرقم السري الأولي بنفسك من لوحة حسابك في منصة آفاق ماث؛ ثم تعود إلى المسابقة باستخدام الرقم الجديد. تبقى الدروس وبقية الأنشطة متاحة لك.</p>'+
 '<a class="primary" href="index.html#dashboard">🔑 الانتقال إلى حسابي لتغيير الرقم السري</a> '+
 '<a class="outline" href="index.html">العودة إلى المنصة</a></div>';}
function studentGateLock(){
 const globallyClosed=STATE.access?.global_open===false;
 return '<div class="contest-lock" role="status"><div class="contest-icon">🔐</div>'+
 '<h2>دخول مسابقة نجوم آفاق غير متاح حاليًا</h2>'+
 '<p>'+(globallyClosed?'أوقف المشرف الرئيسي دخول جميع الطلاب إلى المسابقة مؤقتًا.':'لم يُفعّل المشرف الرئيسي السماح بدخول حسابك إلى المسابقة.')+
 ' يمكنك استخدام بقية أقسام منصة آفاق ماث، وتظل نتائجك السابقة محفوظة.</p>'+
 '<button class="primary" id="afaqContestGateRefresh" type="button">التحقق من تصريح الدخول مجددًا</button> '+
 '<a class="outline" href="index.html#dashboard">العودة إلى حسابي</a></div>';
}
function guest(){return '<div class="contest-lock"><div class="contest-icon">🔐</div><h2>بوابة نجوم آفاق الرياضيات</h2><p>تسجيل الدخول إلى المنصة شرط الدخول إلى المسابقة؛ لا توجد صفحة دخول ثانية.</p><div class="guest-avatar-row">'+image(window.AFAQ_ENTRY_ART?.student,'صورة الطالب المعتمدة','approved-guest-avatar')+image(window.AFAQ_ENTRY_ART?.staff,'صورة المشرف المعتمدة','approved-guest-avatar')+'</div><div class="contest-guest-links"><a href="index.html#competition" class="primary">🔐 الدخول بالحساب المعتمد</a> <a href="index.html#home" class="outline">📚 التصفح كضيف دون تسجيل دخول</a></div></div>'}
function resetPlay(){clearInterval(STATE.timer);clearTimeout(STATE.holdHandle);afaqCueHistory.clear();STATE.timer=null;STATE.holdHandle=null;STATE.readyStage=0;STATE.waitingUntil=0;STATE.stageBreakUntil=0;STATE.breakReady=false;STATE.breakAutoBusy=false;STATE.breakRetryAt=0;STATE.hintFor=null;STATE.audioNotice='';STATE.lastFeedback=null;STATE.feedbackQuestion=null;STATE.feedbackAnswer=null;STATE.stageScores={};STATE.completedStages=[];STATE.feedbackStage=1;STATE.index=0;STATE.question=null;STATE.questions=[];STATE.answers={};STATE.result=null;STATE.attemptId=null;STATE.attemptNo=0;STATE.feedback='';STATE.error='';STATE.lastFeedback=null;STATE.bank=null;STATE.busy=false;STATE.certificateView=null}
function render(){clearInterval(STATE.timer);const showQ=getCurrent();
 root.innerHTML=!STATE.user?guest():student()&&!STATE.user.pin_changed?passwordChangeLock():student()&&STATE.access?.allowed===false?studentGateLock():STATE.certificateView?certificatePage():STATE.waitingUntil>Date.now()?transition():STATE.result?result():STATE.readyStage?readyPage():showQ?quiz():home();
  if(isTester()&&!document.getElementById('leaveTester'))root.insertAdjacentHTML('afterbegin',
   '<div class="contest-tester-active"><span>🎓 تعمل الآن بصفحة الطالب التجريبي '+stext(STATE.testerProfile)+'</span>'+
   '<button class="outline" id="leaveTester">العودة إلى دائرة الإشراف</button></div>');
  root.insertAdjacentHTML('beforeend',afaqSoundButton());bind();document.getElementById('afaqSoundToggle')?.addEventListener('click',()=>{afaqAudioEnabled=!afaqAudioEnabled;localStorage.setItem('afaq_stars_sound',afaqAudioEnabled?'on':'off');if(afaqAudioEnabled){afaqAudioContextReady();afaqTune(STATE.feedbackStage||1,'start')}render()});
 if(STATE.waitingUntil>Date.now()){tickTransition();return}
 if(STATE.readyStage>1&&STATE.stageBreakUntil){tickBreak();return}
 if(showQ&&!STATE.readyStage&&!STATE.result)tickGame();
}
function tickTransition(){clearInterval(STATE.timer);STATE.timer=setInterval(()=>{const left=clockSec(STATE.waitingUntil);const place=document.getElementById('nextCountdown');if(place)place.textContent=stext(left);if(left===0){clearInterval(STATE.timer);STATE.waitingUntil=0;render()}},150)}

function tickBreak(){
 clearInterval(STATE.timer);
 const execute=()=>{
  if(STATE.busy||!STATE.readyStage||!STATE.stageBreakUntil)return;
  const left=clockSec(STATE.stageBreakUntil);
  const label=document.getElementById('contestBreakClock');
  const fill=document.getElementById('contestBreakBar');
  const status=document.getElementById('contestBreakStatus');
  if(label)label.textContent=tformat(left,STATE.readyStage);
  if(fill)fill.style.width=Math.max(0,Math.min(100,left/120*100))+'%';
  if(status&&left<=20&&left>0)status.textContent='🔔 الاستعداد النهائي: تبقى '+left+' ثانية للانطلاق التلقائي.';
  const k='break|'+STATE.stageBreakUntil+'|'+STATE.readyStage;
  if(left>0&&left<=20)afaqOnceCue(k+'|20',()=>afaqRisingBell('break'));
  if(left>0&&left<=5)afaqOnceCue(k+'|5',()=>afaqRisingBell('short'));
  if(left===0){
   clearInterval(STATE.timer);
   afaqOnceCue(k+'|start',()=>afaqRisingBell('start'));
   if(!STATE.breakAutoBusy&&Date.now()>=STATE.breakRetryAt){STATE.breakAutoBusy=true;beginStage(true).finally(()=>{STATE.breakAutoBusy=false});}
  }
 };
 execute();
 if(STATE.readyStage&&STATE.stageBreakUntil)STATE.timer=setInterval(execute,250);
}
function tickGame(){clearInterval(STATE.timer);STATE.timer=setInterval(()=>{
 const q=getCurrent();if(!q||STATE.busy||STATE.readyStage||STATE.waitingUntil)return;
 const sec=remaining(),label=document.getElementById('contestClock'),line=document.getElementById('contestTimerBar');
 if(label)label.textContent=tformat(sec,q.stage);
 if(line)line.style.width=Math.max(0,Math.min(100,sec/stage(q.stage).time*100))+'%';
 const warning=q.stage<=3?5:90;
 const id=q.stage<=3?'q|'+q.id+'|'+STATE.started:'stage|'+q.stage+'|'+STATE.stageStarted;
 if(sec>0&&sec<=warning)afaqOnceCue(id+'|warning',()=>{
  afaqRisingBell(q.stage<=3?'short':'long');
  const notice=document.getElementById('contestTimeWarning');
  if(notice)notice.textContent='🔔 تبقّى '+tformat(sec,q.stage)+' على '+(q.stage<=3?'السؤال':'المرحلة')+'.';
 });
 if(sec<=0){clearInterval(STATE.timer);q.stage<=3?submitResponse(null,true):expireStage()}
},200)}
function prepare(){resetPlay();STATE.readyStage=1;render()}
async function beginStage(automatic=false){
 if(STATE.busy||!STATE.readyStage)return;
 if(STATE.readyStage>1&&STATE.stageBreakUntil>Date.now()){
  STATE.breakReady=true;
  const label=document.getElementById('contestBreakReadyStatus');
  if(label)label.textContent='✅ تم تسجيل استعدادك. يبدأ التحدي تلقائيًا عند اكتمال الدقيقتين.';
  const button=document.getElementById('beginStage');
  if(button){button.disabled=true;button.textContent='✅ أنت مستعد للمرحلة التالية'}
  return;
 }
 if(!automatic)afaqTune(STATE.readyStage,'start');
 STATE.busy=true;STATE.error='';try{
 if(STATE.mode==='official'){
   const r=STATE.attemptId&&STATE.readyStage>1?await back('begin_stage',{attempt_id:STATE.attemptId}):await back('start',{grade:STATE.grade,section:STATE.section});
   if(r.stage_ready){STATE.readyStage=r.stage_number;STATE.attemptId=r.attempt_id||STATE.attemptId;STATE.attemptNo=r.attempt_no||STATE.attemptNo;
     STATE.stageBreakUntil=Date.parse(r.break_ends_at)||Date.now()+120000;STATE.breakReady=false;}
   else{STATE.question=r.question;STATE.index=r.index;STATE.attemptId=r.attempt_id||STATE.attemptId;STATE.attemptNo=r.attempt_no||STATE.attemptNo;STATE.started=Date.parse(r.question_started_at)||Date.now();STATE.stageStarted=Date.parse(r.stage_started_at)||Date.now();STATE.readyStage=0;STATE.stageBreakUntil=0;STATE.breakReady=false;}
 }else{
   if(STATE.questions.length===0){const r=await back('training',{grade:STATE.grade,section:STATE.section});STATE.questions=r.questions||[];STATE.index=0;if(STATE.questions.length!==38)throw Error('بنك التدريب غير مكتمل')}
   STATE.started=Date.now();STATE.stageStarted=Date.now();STATE.readyStage=0;STATE.stageBreakUntil=0;STATE.breakReady=false;
 }
}catch(err){STATE.error=err.message;STATE.breakRetryAt=Date.now()+5000}finally{STATE.busy=false;render()}}
function getParts(){const q=getCurrent();return(q?.parts||[]).map((p,i)=>p.type==='choice'?document.querySelector('input[name="part'+i+'"]:checked')?.value??null:contestToASCII(document.querySelector('[data-part="'+i+'"]')?.value?.trim()??null))}
async function submitResponse(answer,expired=false){
 if(STATE.busy||STATE.waitingUntil||STATE.readyStage)return;
 const q=getCurrent();if(!q)return;STATE.busy=true;clearInterval(STATE.timer);STATE.error='';
 const previousStage=q.stage;
 STATE.hintFor=null;STATE.audioNotice='';try{window.speechSynthesis?.cancel()}catch{}
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
   else if(STATE.questions[STATE.index].stage!==previousStage){STATE.readyStage=STATE.questions[STATE.index].stage;STATE.stageBreakUntil=Date.now()+120000;STATE.breakReady=false;STATE.started=0;STATE.stageStarted=0;}
   else{STATE.started=Date.now()+5000;STATE.waitingUntil=STATE.started;if(previousStage>=4)STATE.stageStarted+=5000;}
   if(STATE.readyStage||STATE.result)STATE.waitingUntil=Date.now()+5000;
  }
  STATE.lastFeedback=feedback;STATE.feedbackQuestion=q;STATE.feedbackAnswer=expired?null:answer;STATE.feedbackStage=previousStage;
   logScore(previousStage,feedback);
   if(STATE.readyStage>previousStage||STATE.result)closeStage(previousStage);
  STATE.waitingMessage='راجع الإجابة الصحيحة يا '+(STATE.displayName||STATE.user?.username||'المتسابق')+' ثم استعد للمرحلة التالية.';
  if(STATE.result&&!STATE.result.training&&player()){try{await loadCertificates()}catch(err){STATE.certificateError=err.message}}
 }catch(err){STATE.error=err.message;STATE.feedback=err.message}
 finally{STATE.busy=false;render();if(STATE.waitingUntil>Date.now())root.scrollIntoView?.({block:'start',behavior:'auto'});if(STATE.result){afaqTune(previousStage,'finish');afaqDecorate('fireworks',45)}else if(STATE.readyStage){afaqTune(previousStage,'finish');afaqDecorate('balloons',23)}else if(STATE.lastFeedback){if(STATE.lastFeedback.correct)afaqCelebrateCorrect(previousStage);else afaqTune(previousStage,'incorrect');}}
}
function adoptOfficial(r){
 if(r.finished){STATE.result={...r,training:false};STATE.report=r.report||STATE.report;STATE.question=null;STATE.questions=[];return}
 STATE.index=r.index;
 if(r.stage_ready){STATE.question=null;STATE.readyStage=r.stage_number;STATE.stageBreakUntil=Date.parse(r.break_ends_at)||Date.now()+120000;STATE.breakReady=false;STATE.started=0;STATE.stageStarted=0;return}
 STATE.question=r.question;STATE.stageBreakUntil=0;STATE.breakReady=false;STATE.started=Date.parse(r.question_started_at)||Date.now();STATE.stageStarted=Date.parse(r.stage_started_at)||Date.now();
}
async function expireStage(){if(STATE.busy||STATE.readyStage)return;const skippedStage=getCurrent()?.stage;STATE.busy=true;clearInterval(STATE.timer);try{
 if(STATE.mode==='official'){const r=await back('skip_stage',{attempt_id:STATE.attemptId,index:STATE.index});adoptOfficial(r)}
 else{const current=getCurrent()?.stage;while(getCurrent()?.stage===current){STATE.answers[getCurrent().id]=null;STATE.index++}
 if(STATE.index>=STATE.questions.length)await completeTraining();else{STATE.readyStage=STATE.questions[STATE.index].stage;STATE.stageBreakUntil=Date.now()+120000;STATE.breakReady=false;}
 }
 if(skippedStage&&(STATE.readyStage>skippedStage||STATE.result))closeStage(skippedStage);
}catch(err){STATE.error=err.message}finally{STATE.busy=false;STATE.waitingUntil=0;render()}}
async function completeTraining(){const r=await back('check_training',{grade:STATE.grade,section:STATE.section,answers:STATE.answers});STATE.result={...r,training:true,ended_at:new Date().toISOString()};keepSample(r.raw_score);saveTrainingCertificate();STATE.questions=[];STATE.question=null;STATE.waitingUntil=0;}
async function finishEarly(){if(STATE.busy)return;if(!window.confirm('هل تريد إنهاء النموذج الآن دون إكمال بقية الأسئلة؟'))return;STATE.busy=true;clearInterval(STATE.timer);try{
 if(STATE.mode==='official'){const r=await back('submit',{attempt_id:STATE.attemptId});STATE.result={...r,training:false,ended_at:new Date().toISOString()};STATE.report=r.report||STATE.report;try{await loadCertificates()}catch(err){STATE.certificateError=err.message}}
 else {await completeTraining();if(STATE.result){STATE.result.early_end=true;saveTrainingCertificate()}}STATE.readyStage=0;STATE.waitingUntil=0;
}catch(err){STATE.error=err.message}finally{STATE.busy=false;render()}}
async function reloadReports(){
 if(player()){STATE.report=(await back('my_results')).report;await loadCertificates()}
 else if(allowedStaff()){
  const [a,b,c]=await Promise.all([back('staff_summary'),back('staff_results'),...(supervisor()?[back('tester_status')]:[Promise.resolve(null)])]);
  STATE.summary=a.stats;STATE.staffReport=b.students;if(supervisor())STATE.testerStatuses=c?.profiles||[];
 }
}
async function switchTester(number){
 if(!supervisor()||![1,2].includes(number))return;
 STATE.testerProfile=number;
 STATE.grade=6;STATE.section=1;STATE.mode='official';
 STATE.displayName=number===1?'المشرف التجريبي الأول':'المشرف التجريبي الثاني';
 resetPlay();
 try{
  STATE.report=(await back('my_results')).report;
  await loadCertificates();
  await back('contest_visit');
 }catch(err){STATE.error=err.message}
 render();
}
function leaveTester(){
 if(!isTester())return;
 if(STATE.attemptId&&STATE.mode==='official'&&!window.confirm('ستبقى المحاولة التجريبية قيد التقدم عند العودة. هل تريد مغادرة تجربة الطالب؟'))return;
 STATE.testerProfile=0;STATE.displayName=STATE.user?.username||'المشرف الرئيسي';
 STATE.mode='training';STATE.grade=6;STATE.section=1;STATE.report=null;
 resetPlay();render();
 reloadReports().then(render).catch(err=>{STATE.error=err.message;render()});
}
async function supervisorReset(payload,message){
 if(!supervisor()||isTester())return;
 if(!window.confirm(message+'\nسيُعاد احتساب المحاولتين من الصفر، وتُحفظ نسخة من المحاولات السابقة بسجل المراجعة. هل تؤكد الإجراء؟'))return;
 const status=document.getElementById('contestResetMessage');
 if(status)status.textContent='جارٍ تنفيذ إعادة الضبط...';
 try{
  const result=await back('reset_attempts',{...payload,confirmed:true});
  await reloadReports();
  render();
  const next=document.getElementById('contestResetMessage');
  if(next)next.textContent='تمت إعادة ضبط '+stext(result.reset_count)+' محاولة للحساب: '+friendly(result.name);
 }catch(err){if(status)status.textContent=err.message;else{STATE.error=err.message;render()}}
}
async function fetchBank(){try{const el=document.getElementById('editModel');if(el)STATE.editModel=el.value;STATE.bank=await back('question_list',{grade:STATE.grade,section:STATE.section,model:STATE.editModel});STATE.error='';render()}catch(err){STATE.error=err.message;render()}}
function bindBank(){document.querySelectorAll('.edit-question').forEach(form=>form.addEventListener('submit',async ev=>{ev.preventDefault();const data=new FormData(form),ordinal=Number(form.dataset.ordinal),payload={grade:STATE.grade,section:STATE.section,model:STATE.editModel,ordinal,prompt:data.get('prompt'),visual_svg:data.get('visual_svg'),visual_caption:data.get('visual_caption')};
 if(ordinal<=30){const count=(STATE.bank.questions||[]).find(q=>q.ordinal===ordinal)?.options.length||4;payload.options=Array.from({length:count},(_,i)=>String(data.get('opt'+i)));payload.answer_index=Number(data.get('answer_index'))}else{try{payload.parts=JSON.parse(String(data.get('parts')))}catch{alert('تحقق من صيغة JSON للأجزاء');return}}
 try{await back('save_question',payload);alert('تم الحفظ');await fetchBank()}catch(err){alert(err.message)}}));
 for(const [id,published]of [['publishBank',true],['unpublishBank',false]])document.getElementById(id)?.addEventListener('click',async()=>{if(published&&!window.confirm('هل راجعت جميع الأسئلة والرسومات والإجابات وتريد اعتماد النموذج؟'))return;try{await back('publish_model',{grade:STATE.grade,section:STATE.section,model:STATE.editModel,published});STATE.catalog=(await back('catalog')).models;STATE.bank=null;render()}catch(err){alert(err.message)}})
}
function bind(){if(!STATE.user)return;
 document.getElementById('afaqContestGateRefresh')?.addEventListener('click',async()=>{
  const button=document.getElementById('afaqContestGateRefresh');if(button)button.disabled=true;
  try{STATE.access=await back('contest_gate_status');STATE.error='';}
  catch(err){STATE.error=err.message}
  render();
 });
 document.getElementById('logoutContest')?.addEventListener('click',async()=>{try{await api('logout')}catch{}sessionStorage.removeItem(tokenKey);STATE.token='';STATE.user=null;resetPlay();render()});
 document.querySelectorAll('[data-grade]').forEach(btn=>btn.addEventListener('click',()=>{STATE.grade=Number(btn.dataset.grade);STATE.section=1;resetPlay();render()}));
 document.querySelectorAll('[data-unit]').forEach(btn=>btn.addEventListener('click',()=>{STATE.section=Number(btn.dataset.unit);resetPlay();render()}));
 document.querySelectorAll('[data-mode]').forEach(btn=>btn.addEventListener('click',()=>{STATE.mode=btn.dataset.mode;resetPlay();render()}));
 document.getElementById('prepare')?.addEventListener('click',prepare);
 document.getElementById('beginStage')?.addEventListener('click',()=>beginStage(false));
 document.getElementById('exitStage')?.addEventListener('click',()=>{if(STATE.attemptId&&STATE.mode==='official'){if(!window.confirm('ستظل المحاولة الرسمية محفوظة ويمكن استكمالها عند العودة. هل تريد الخروج؟'))return}resetPlay();render()});
 document.querySelectorAll('[data-choice]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-choice]').forEach(x=>x.disabled=true);btn.classList.add('selected');submitResponse(Number(btn.dataset.choice))}));
 document.getElementById('contestHintButton')?.addEventListener('click',()=>{
  const q=getCurrent();if(!q)return;
  STATE.hintFor=STATE.hintFor===q.id?null:q.id;
  const box=document.getElementById('contestHintText');
  const button=document.getElementById('contestHintButton');
  if(box)box.hidden=STATE.hintFor!==q.id;
  if(button){button.setAttribute('aria-expanded',String(STATE.hintFor===q.id));
   button.textContent=STATE.hintFor===q.id?'💡 إخفاء التلميح':'💡 تلميح مساعد';}
 });
 document.getElementById('contestListenButton')?.addEventListener('click',()=>{
  const q=getCurrent();if(q&&contestSpecial(q)==='voice')contestSpeakQuestion(q);
 });
 document.getElementById('contestDigitsToggle')?.addEventListener('click',()=>{
  STATE.digitStyle=STATE.digitStyle==='ar'?'en':'ar';render();
 });
 document.getElementById('contestNumericForm')?.addEventListener('submit',event=>{
  event.preventDefault();
  const q=getCurrent();if(!q||contestSpecial(q)!=='number')return;
  const answer=contestToASCII(document.getElementById('contestNumericInput')?.value||'');
  const optionIndex=(q.options||[]).findIndex(x=>contestToASCII(x)===answer);
  if(optionIndex<0){
   const msg=document.getElementById('contestNumericError');
   if(msg)msg.textContent='اكتب أحد الأعداد الظاهرة بالأرقام العربية ١٢٣ أو الإنجليزية 123.';
   return;
  }
  const submit=event.currentTarget.querySelector('button');if(submit)submit.disabled=true;
  submitResponse(optionIndex);
 });
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

 document.querySelectorAll('[data-tester-enter]').forEach(b=>b.addEventListener('click',()=>switchTester(Number(b.dataset.testerEnter))));
 document.querySelectorAll('[data-tester-reset]').forEach(b=>b.addEventListener('click',()=>{
  const n=Number(b.dataset.testerReset);
  supervisorReset({target_tester:String(n),reset_section:0,reason:'إعادة محاولات المشرف التجريبية'},
   'إعادة ضبط جميع المحاولات للحساب التجريبي رقم '+stext(n));
 }));
 document.getElementById('leaveTester')?.addEventListener('click',leaveTester);
 document.getElementById('contestResetNow')?.addEventListener('click',()=>{
  const chosen=document.getElementById('contestResetStudent')?.value||'';
  const [cls,num]=chosen.split('|');
  if(!cls||!/^[0-9]+$/.test(num)){window.alert('اختر طالبًا من القائمة أولًا.');return}
  const section=Number(document.getElementById('contestResetUnit')?.value||0);
  const item=(STATE.staffReport||[]).find(x=>x.class_name===cls&&Number(x.serial_no)===Number(num));
  supervisorReset({target_class:cls,target_serial:Number(num),reset_section:section,
   reason:'إعادة منح محاولتين للمسابقة بطلب المشرف'},
   'هل تريد إعادة محاولات '+(item?.full_name||'الطالب')+' للوحدة '+(section||'جميع الوحدات')+'؟');
 });
 document.getElementById('contestStudentPinReset')?.addEventListener('submit',async ev=>{
  ev.preventDefault();
  const select=document.getElementById('contestPinStudent'),
   [cls,num]=String(select?.value||'').split('|');
  const newPin=document.getElementById('contestPinNew').value,
   currentPin=document.getElementById('contestSupervisorPin').value,
   status=document.getElementById('contestPinResetMessage');
  if(!cls||!/^[0-9]+$/.test(num)){status.textContent='اختر الطالب أولًا.';return}
  if(!/^[0-9]{4}$/.test(newPin)||!/^[0-9]{8}$/.test(currentPin)){status.textContent='الرمز الجديد ٤ أرقام، ورمز المشرف ٨ أرقام.';return}
  try{
   await api('change_password',{target_role:'student',username:num,class_name:cls,
    current_pin:currentPin,new_pin:newPin,confirm_pin:newPin});
   ev.target.reset();status.textContent='تم تعيين الرقم الجديد للطالب. سلّمه له بسرية ليتمكن من تغييره.';
  }catch(err){status.textContent=err.message}
 });
 document.getElementById('contestChangePin')?.addEventListener('submit',async ev=>{
  ev.preventDefault();
  const current=document.getElementById('contestCurrentPin').value,
   next=document.getElementById('contestNewPin').value,
   confirmed=document.getElementById('contestConfirmPin').value,
   status=document.getElementById('contestPinChangeStatus');
  if(!/^[0-9]{4}$/.test(next)||next!==confirmed||next===current){
   status.textContent='تأكد من أن الرقم الجديد ٤ أرقام ويختلف عن الحالي ويطابق التأكيد.';return
  }
  try{
   await api('student_change_pin',{current_pin:current,new_pin:next,confirm_pin:confirmed});
   ev.target.reset();status.textContent='نجح تغيير رقمك السري. استعمل الرقم الجديد في الدخول القادم.';
  }catch(err){status.textContent=err.message}
 });
 document.getElementById('loadBank')?.addEventListener('click',fetchBank);
 document.getElementById('editModel')?.addEventListener('change',ev=>{STATE.editModel=ev.target.value;STATE.bank=null;render()});
 if(STATE.bank)bindBank();
}
(async()=>{await authenticate();try{STATE.catalog=(await back('catalog')).models||[]}catch(err){STATE.error=err.message}render()})();