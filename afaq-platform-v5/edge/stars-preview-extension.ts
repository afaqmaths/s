
/* Gentle promotional set with exactly the same 5 stages and 38-question scoring model
   as the official competition: 10+10+10 MCQ, then 4+4 multistep, 50 raw x2 = 100. */
const starsDigits=(v:unknown)=>String(v).replace(/[0-9]/g,c=>"٠١٢٣٤٥٦٧٨٩"[Number(c)]);
const starsEasyChoiceSource=[
 ["أي عدد من هذه الأعداد زوجي؟","12",["7","9","15"],"الأعداد الزوجية"],
 ["ما العدد الأولي من بين هذه الأعداد؟","7",["4","6","9"],"الأعداد الأولية"],
 ["كم ناتج ٦ × ٤ ؟","24",["20","26","28"],"الضرب"],
 ["أي عدد يُعد من مضاعفات ٥؟","25",["12","18","22"],"المضاعفات"],
 ["أي عدد يُعد عاملًا للعدد ١٢؟","3",["5","7","11"],"العوامل"],
 ["أكمل المتتالية: ٣ ، ٦ ، ٩ ، ...","12",["10","11","13"],"المتتاليات"],
 ["ما منزلة الرقم ٤ في العدد ١٤٢٥؟","المئات",["العشرات","الآحاد","الآلاف"],"القيمة المكانية"],
 ["قرّب العدد ٤٣٢ إلى أقرب عشرة.","430",["420","440","400"],"التقريب"],
 ["ما أكبر عدد من الأعداد الآتية؟","256",["245","234","250"],"المقارنة"],
 ["ما العدد السابق مباشرة للعدد ١٠٠٠؟","999",["1001","990","899"],"الترتيب"],
 ["ما ناتج قسمة ٤٨ على ٦؟","8",["6","7","9"],"القسمة"],
 ["ما المضاعف الرابع للعدد ٣؟","12",["6","9","15"],"المضاعفات"],
 ["كم ناتج ٢٥ + ٣٥؟","60",["50","55","65"],"الجمع"],
 ["أي عدد يقبل القسمة على ٣؟","27",["16","20","25"],"قواعد القسمة"],
 ["ما العامل المشترك بين ١٢ و١٨؟","6",["5","7","11"],"العوامل المشتركة"],
 ["احسب ذهنيًا: ١٢٠ ÷ ١٠.","12",["10","120","1200"],"القسمة على 10"],
 ["ما العدد الفردي من بين الأعداد؟","33",["20","28","42"],"الزوجي والفردي"],
 ["أكمل: ١٠ ، ٢٠ ، ٣٠ ، ...","40",["35","45","50"],"المتتاليات"],
 ["قرّب العدد ١٦٨ إلى أقرب عشرة.","170",["160","150","180"],"التقريب"],
 ["ما قيمة الرقم ٥ في العدد ٣٥٨؟","50",["5","500","5000"],"القيمة المكانية"],
 ["أوجد ناتج ١٢ × ٥.","60",["50","55","65"],"الضرب الذهني"],
 ["ما ناتج ٨٤ ÷ ٧؟","12",["11","13","14"],"القسمة"],
 ["ما العدد الذي يكمل: ٤ ، ٨ ، ١٢ ، ... ؟","16",["14","18","20"],"المتتاليات"],
 ["أي الأعداد أصغر من ١٥٠؟","149",["151","160","200"],"المقارنة"],
 ["أي عدد من مضاعفات ٤؟","28",["22","26","30"],"المضاعفات"],
 ["ما ناتج ٣٢ + ١٨؟","50",["45","48","55"],"الجمع"],
 ["كم ناتج ضرب ٧ × ٨؟","56",["54","58","64"],"جداول الضرب"],
 ["ما أكبر عامل للعدد ١٨ غير العدد نفسه؟","9",["6","8","12"],"العوامل"],
 ["أوجد ناتج ٤٥٠ ÷ ١٠.","45",["40","50","450"],"القسمة على 10"],
 ["ما أصغر عدد أولي؟","2",["1","4","6"],"الأعداد الأولية"]
] as const;
const starsEasyComplexSource=[
 {prompt:"العدد ١٢٤٥ يتكون من أربع منازل. استخدم القيمة المكانية والتقريب.",
  topic:"القيمة المكانية",parts:[["كم قيمة الرقم ٢ في العدد؟",200],["قرّب العدد إلى أقرب ألف.",1000]]},
 {prompt:"لدى فريق ٢٤ قلمًا، يريد ترتيبها في مجموعات متساوية.",
  topic:"العوامل",parts:[["كم مجموعة إذا كانت كل مجموعة تضم ٦ أقلام؟",4],["كم قلمًا يمثل نصف العدد؟",12],["ما أصغر عدد أولي من عوامل ٢٤؟",2]]},
 {prompt:"في مكتبة المدرسة ٢٥ كتابًا، أضيف إليها ١٥ كتابًا ثم وزعت بالتساوي على ٥ أرفف.",
  topic:"الجمع والقسمة",parts:[["ما مجموع الكتب الآن؟",40],["كم كتابًا يوضع على كل رف؟",8]]},
 {prompt:"يوزع المعلم ٣٦ بطاقة على مجموعات متساوية، ثم يقارن عدد البطاقات.",
  topic:"العوامل والقسمة",parts:[["كم مجموعة مكوّنة من ٤ بطاقات؟",9],["كم مجموعة مكوّنة من ٦ بطاقات؟",6],["كم بطاقة في نصف العدد؟",18]]},
 {prompt:"في متجر المدرسة، سعر القلم ريالان وسعر الدفتر ٣ ريالات. مع سارة ١٠ ريالات.",
  topic:"موقف حياتي",parts:[["كم مجموع سعر القلم والدفتر؟",5],["كم ريالًا يتبقى من الميزانية؟",5]]},
 {prompt:"أكمل بعض مضاعفات العدد ٦ لتحصل على متتالية صحيحة.",
  topic:"المضاعفات",parts:[["ما ناتج ٦ × ٤ ؟",24],["ما ناتج ٦ × ٥ ؟",30],["ما ناتج ٦ × ٦ ؟",36]]},
 {prompt:"انظر إلى المتتالية: ٥ ، ١٠ ، ١٥ ، ... ، ... .",
  topic:"المتتاليات",parts:[["ما العدد التالي بعد ١٥؟",20],["ما العدد الذي يليه مباشرة؟",25]]},
 {prompt:"لدى طالب ٩٦ بطاقة ويريد تقسيمها على مجموعات متساوية.",
  topic:"القسمة والاستدلال",parts:[["كم ناتج ٩٦ ÷ ٣؟",32],["كم ناتج ٩٦ ÷ ٤؟",24],["كم ناتج ٩٦ ÷ ٦؟",16]]}
] as const;
const starsEasyQuestions=[
 ...starsEasyChoiceSource.map((x,i)=>{
  const options=["","","",""];const idx=i%4;options[idx]=starsDigits(x[1]);
  let a=0;for(let n=0;n<4;n++)if(n!==idx)options[n]=starsDigits(x[2][a++]);
  return {id:"stars-easy-"+(i+1),ordinal:i+1,stage:Math.floor(i/10)+1,question_kind:"choice",
   prompt:starsDigits(x[0]),objective:x[3],options,answer_index:idx,parts:[],explanation:"تأكد من فهمك للمفهوم، ثم راجع خطوات الحل.",visual_svg:"",visual_caption:""};
 }),
 ...starsEasyComplexSource.map((q,i)=>({id:"stars-easy-"+(i+31),ordinal:i+31,stage:i<4?4:5,
  question_kind:"complex",prompt:starsDigits(q.prompt),objective:q.topic,options:[],
  answer_index:null,parts:q.parts.map(p=>({type:"number",text:starsDigits(p[0]),answer:p[1],
    displayAnswer:starsDigits(p[1])})),explanation:"فكّر في خطوات المسألة واحدة بعد الأخرى.",visual_svg:"",visual_caption:""}))
];
const starsQuestionPublic=(q:any)=>({id:q.id,ordinal:q.ordinal,stage:q.stage,question_kind:q.question_kind,
 prompt:q.prompt,options:q.question_kind==="choice"?q.options:[],parts:q.question_kind==="complex"?
 q.parts.map((p:any)=>({type:p.type,text:p.text,choices:p.choices||undefined})):[],
 objective:q.objective,visual_svg:q.visual_svg,visual_caption:q.visual_caption});
const starsArabicNumbers=(v:any)=>String(v??"").trim().replace(/[٠-٩۰-۹]/g,c=>{const a="٠١٢٣٤٥٦٧٨٩".indexOf(c);
 return String(a>=0?a:"۰۱۲۳۴۵۶۷۸۹".indexOf(c))}).replace(/[٫،]/g,".").replace(/\s/g,"");
const starsNormalize=(q:any,a:any)=>q.question_kind==="choice"?
 Number.isInteger(a)&&a>=0&&a<=3?a:null:
 Array.isArray(a)?q.parts.map((p:any,i:number)=>starsArabicNumbers(a[i]).slice(0,80)):null;
const starsFeedback=(q:any,input:any)=>{
 const answer=starsNormalize(q,input),max=q.question_kind==="choice"?1:q.parts.length;
 const earned=q.question_kind==="choice"?(answer===q.answer_index?1:0):
  Array.isArray(answer)?q.parts.reduce((sum:number,part:any,i:number)=>sum+
  (answer[i]!==""&&Number.isFinite(Number(answer[i]))&&Math.abs(Number(answer[i])-Number(part.answer))<.0000001?1:0),0):0;
 const correctAnswer=q.question_kind==="choice"?q.options[q.answer_index]:q.parts.map((p:any)=>p.displayAnswer);
 return {earned,max,correct:earned===max,correct_answer:correctAnswer,
  unanswered:input===null||input===undefined,explanation:q.explanation};
};
const starsAnswerStats=(map:any)=>{
 const perStage:Record<string,number>={};let raw=0;
 for(const q of starsEasyQuestions){const f=starsFeedback(q,map?.[String(q.ordinal)]??null);
  raw+=f.earned;perStage[String(q.stage)]=(perStage[String(q.stage)]||0)+f.earned}
 return {raw_score:raw,score:raw*2,stage_scores:perStage,
  details:starsEasyQuestions.map(q=>({id:q.id,ordinal:q.ordinal,stage:q.stage,
   ...starsFeedback(q,map?.[String(q.ordinal)]??null)}))};
};
const starsAttemptView=(a:any)=>a?{
 status:a.completed_at?"completed":"in_progress",started_at:a.started_at,completed_at:a.completed_at,
 current_index:a.current_index,total_questions:38,
 raw_score:a.completed_at?a.raw_score:null,score:a.completed_at?a.score:null,
 stage_scores:a.stage_scores||{},questions:a.completed_at?[]:starsEasyQuestions.map(starsQuestionPublic)
}:null;


  if(action==="stars_preview_leaderboard"){
   const {data:all,error}=await db.from("afaq_stars_preview_attempts")
    .select("player_id,score,completed_at,started_at").not("completed_at","is",null)
    .order("score",{ascending:false}).limit(250);
   if(error)throw error;
   const playerIds=(all||[]).map(x=>x.player_id);
   let people:any[]=[];if(playerIds.length){const r=await db.from("afaq_jana_players").select("id,nickname").in("id",playerIds);if(r.error)throw r.error;people=r.data||[]}
   const names=new Map(people.map(x=>[x.id,x.nickname]));
   return ok(origin,{ranking:(all||[]).map((x,i)=>({rank:i+1,nickname:names.get(x.player_id)||"متسابق",
    score:x.score,completed_at:x.completed_at})),total:(all||[]).length,
    notice:"ترتيب تشجيعي خاص بزوار المنصة، لا علاقة له بنتائج المسابقة الرسمية."});
  }
  if(["stars_preview_me","stars_preview_start","stars_preview_answer","stars_preview_skip","stars_preview_finish"].includes(action)){
   const session=await janaSession(req);
   if(!session)return err(origin,"jana_login_required",401);
   const {data:player,error:pe}=await db.from("afaq_jana_players").select("nickname")
    .eq("id",session.player_id).single();if(pe)throw pe;
   let {data:attempt,error:ae}=await db.from("afaq_stars_preview_attempts").select("*")
    .eq("player_id",session.player_id).maybeSingle();if(ae)throw ae;
   if(action==="stars_preview_me")return ok(origin,{nickname:player.nickname,attempt:starsAttemptView(attempt)});
   if(action==="stars_preview_start"){
    const hash=await visitorHash(b.visitor_id);
    if(!hash)return err(origin,"invalid_visitor",400);
    if(!attempt){
     const {data:found,error:fe}=await db.from("afaq_stars_preview_attempts")
      .select("player_id").eq("visitor_hash",hash).maybeSingle();if(fe)throw fe;
     if(found&&found.player_id!==session.player_id)return err(origin,"preview_trial_limit",409);
     const r=await db.from("afaq_stars_preview_attempts").insert({
       player_id:session.player_id,visitor_hash:hash,current_index:0,answers:{},
       stage_scores:{},started_at:new Date().toISOString()}).select("*").maybeSingle();
     if(r.error&&r.error.code!=="23505")throw r.error;
     attempt=r.data||(await db.from("afaq_stars_preview_attempts").select("*").eq("player_id",session.player_id).single()).data;
    }
    if(attempt?.completed_at)return err(origin,"preview_trial_limit",409);
    return ok(origin,{nickname:player.nickname,attempt:starsAttemptView(attempt)});
   }
   if(!attempt||attempt.completed_at)return err(origin,"preview_trial_limit",409);
   const index=Number(b.index);
   if(!Number.isInteger(index)||index!==attempt.current_index||index<0||index>=38)
    return err(origin,"preview_sequence_changed",409);
   let next=index,answerMap={...(attempt.answers||{})};
   let feedback:any=null;
   if(action==="stars_preview_answer"){
    const question=starsEasyQuestions[index];
    const response=b.expired?null:starsNormalize(question,b.answer);
    answerMap[String(question.ordinal)]=response;
    feedback=starsFeedback(question,response);
    next=index+1;
   }else if(action==="stars_preview_skip"){
    const stage=starsEasyQuestions[index].stage;
    while(next<38&&starsEasyQuestions[next].stage===stage){
     answerMap[String(next+1)]=null;next++;
    }
   }else if(action==="stars_preview_finish"){
    while(next<38){answerMap[String(next+1)]=null;next++}
   }else return err(origin,"invalid_preview_action");
   const calculated=starsAnswerStats(answerMap),complete=next===38;
   const stamp=new Date().toISOString();
   const patch={
    current_index:next,answers:answerMap,stage_scores:calculated.stage_scores,
    last_answered_at:stamp,
    ...(complete?{completed_at:stamp,raw_score:calculated.raw_score,score:calculated.score}:{})
   };
   const updated=await db.from("afaq_stars_preview_attempts").update(patch)
     .eq("player_id",session.player_id).eq("current_index",index)
     .is("completed_at",null).select("*").maybeSingle();
   if(updated.error)throw updated.error;if(!updated.data)return err(origin,"preview_sequence_changed",409);
   return ok(origin,{nickname:player.nickname,attempt:starsAttemptView(updated.data),
    feedback,finished:complete,
    ...(complete?{result:{score:calculated.score,raw_score:calculated.raw_score,
      percent:calculated.score,details:calculated.details,training:true}}:{})});
  }
