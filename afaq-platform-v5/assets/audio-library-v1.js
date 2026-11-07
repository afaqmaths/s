'use strict';
/* إضافة مستقلة لبوابة الاستماع لا تمس المسابقات أو درجات الطلاب. */
const afAudio={
 items:[],adminItems:[],loaded:false,loading:false,adminLoaded:false,adminLoading:false,
 selected:'all',search:'',playingVideo:null,edit:null,uploaded:null,
 busy:false,warning:'',message:''
};
const AF_CATS=[
 ['all','جميع الملفات','headphones','blue'],
 ['quran','القرآن الكريم','book-open','green'],
 ['hadith','الأحاديث النبوية','book-marked','gold'],
 ['wisdom','أقوال وحِكَم','lightbulb','blue'],
 ['nasheed','أناشيد تربوية','music','purple'],
 ['patriotic','أناشيد وأغانٍ وطنية','flag','red'],
 ['motivation','تحفيز العلم والنجاح','trophy','gold']
];
const afEsc=v=>hv(v??'');
const afNum=v=>new Intl.NumberFormat('ar-OM').format(Number(v)||0);
function afCat(id){return AF_CATS.find(x=>x[0]===id)||AF_CATS[0]}
function afPlayIcon(category){
 const icons={quran:'📖',hadith:'🌿',wisdom:'💡',nasheed:'🎵',patriotic:'🇴🇲',motivation:'🏆'};
 return icons[category]||'🎧';
}
function afAudioCTA(){
 return '<section class="af-audio-feature" dir="rtl"><div class="af-audio-feature-icon">'+
 '🎧<span>♪</span></div><div><span class="af-audio-eyebrow">قسم جديد للجميع</span>'+
 '<h2>المكتبة الصوتية — استمع وتعلّم</h2>'+
 '<p>تلاوات قرآنية بأصوات قرّاء معروفين، وأحاديث موثقة، وحِكَم وأناشيد وطنية وتربوية ومقاطع تحفيزية للعلم والنجاح.</p>'+
 '<button type="button" class="hub-primary" data-route="audio">ادخل إلى بوابة الاستماع</button></div>'+
 '<div class="af-audio-feature-notes"><span>📖 القرآن الكريم</span><span>🎤 الأناشيد</span><span>🇴🇲 الوطن</span><span>🏅 النجاح</span></div></section>';
}
function afCard(item){
 const video=afVideoId(item.youtube_url);
 const playing=Number(afAudio.playingVideo)===Number(item.id);
 const src=(item.audio_url||'');
 const source=item.source_url||item.youtube_url||'';
 const ready=item.media_type==='audio'&&src;
 const audioBar=ready?'<div class="af-audio-player"><audio controls preload="none" playsinline src="'+afEsc(src)+'" aria-label="الاستماع إلى '+afEsc(item.title)+'">متصفحك لا يدعم التشغيل الصوتي.</audio>'+
 '<small>قد يعتمد التشغيل على سماح الموقع المصدر بالوصول المباشر إلى ملف الصوت.</small></div>':'';
 const youtubeBar=item.media_type==='youtube'&&video?
  (playing?'<div class="af-youtube-player"><iframe title="'+afEsc(item.title)+'" src="https://www.youtube-nocookie.com/embed/'+video+
  '?rel=0" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>':
   '<button type="button" class="af-action-play" data-af-video="'+item.id+'">▶ مشاهدة واستماع داخل البوابة</button>'):'';
 const tts=item.media_type==='spoken'&&item.spoken_text?
 '<div class="af-audio-tts"><blockquote>'+afEsc(item.spoken_text)+'</blockquote>'+
 '<button type="button" class="af-action-play" data-af-speak="'+item.id+'">🔊 استمع بصوت قراءة عربية آلية</button>'+
 '<button type="button" class="af-secondary" data-af-stop-speech>إيقاف الصوت</button>'+
 '<small>الصوت اصطناعي من المتصفح وقد يختلف نطقه؛ راجع النص والمصدر الموثق.</small></div>':'';
 const external=item.media_type==='external'&&source?
  '<p class="af-external-notice">🎧 يفتح الاستماع على الموقع الأصلي الذي يوفر مشغّلًا صوتيًا وخياراته.</p>':'';
 const download=item.can_download&&item.download_url?
 '<a class="af-download" target="_blank" rel="noopener noreferrer" href="'+afEsc(item.download_url)+'">⬇ تنزيل الملف المصرّح بنشره</a>':'';
 const sourceLink=source?'<a class="af-source-link" href="'+afEsc(source)+'" target="_blank" rel="noopener noreferrer">'+
 (item.category==='quran'?'🔗 الاستماع واختيار السورة والتنزيل من المصدر':item.youtube_url?'🔗 فتح الفيديو الأصلي في يوتيوب':'🔗 فتح المصدر والتفاصيل')+'</a>':'';
 return '<article class="af-audio-card" data-af-category="'+afEsc(item.category)+'" tabindex="0">'+
 '<div class="af-audio-card-head"><div class="af-audio-emblem af-audio-'+afEsc(item.category)+'">'+afPlayIcon(item.category)+'</div>'+
 '<div><small>'+afEsc(afCat(item.category)[1])+(item.featured?' • مميز':'')+'</small>'+
 '<h3>'+afEsc(item.title)+'</h3><b>'+afEsc(item.performer||'مكتبة آفاق الرياضيات')+'</b></div></div>'+
 (item.summary?'<p>'+afEsc(item.summary)+'</p>':'')+
 audioBar+youtubeBar+tts+external+
 '<div class="af-audio-card-links">'+sourceLink+download+'</div>'+
 (item.copyright_note?'<div class="af-rights">'+afEsc(item.copyright_note)+'</div>':'')+
 '</article>';
}
function afVideoId(v){
 const match=String(v||'').match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
 return match?match[1]:null;
}
function afAudioPage(){
 const count=afAudio.items.filter(x=>x.published).length;
 const featuredSong=afAudio.items.find(x=>x.published&&x.category==='motivation'&&x.featured&&x.youtube_url);
 const matches=afAudio.items.filter(x=>x.published&&
 (afAudio.selected==='all'||afAudio.selected===x.category)&&
 (!afAudio.search||[x.title,x.performer,x.summary,x.spoken_text].some(v=>String(v||'').toLocaleLowerCase('ar').includes(afAudio.search.toLocaleLowerCase('ar')))));
 const cats=AF_CATS.map(([id,title,ico])=>{
  const total=id==='all'?count:afAudio.items.filter(x=>x.published&&x.category===id).length;
  return '<button class="af-category-button'+(afAudio.selected===id?' chosen':'')+
  '" type="button" data-af-cat="'+id+'"><strong>'+afPlayIcon(id)+'</strong><span>'+title+'</span><small>'+afNum(total)+'</small></button>';
 }).join('');
 return '<div class="container af-page" dir="rtl"><section class="af-hero">'+
 '<div><span class="af-audio-eyebrow">🎧 بوابة المكتبة العامة — للجميع</span>'+
 '<h1>آفاق الاستماع</h1><h2>استمع • تعلّم • استلهم</h2>'+
 '<p>استراحة معرفية وتربوية داخل منصة آفاق الرياضيات: تلاوات قرآنية، ومختارات من الحديث النبوي، وحِكَم وأناشيد وأغانٍ وطنية ومقاطع تشجع على العلم والإنجاز.</p>'+
 '<div class="af-hero-actions"><button class="af-button-white" data-route="library">المكتبة العامة</button>'+
 '<button class="af-button-white" data-route="visitor">بوابة الزائر</button>'+
 '<span>'+afNum(count)+' مادة منشورة</span></div></div>'+
 '<div class="af-hero-art" role="img" aria-label="سماعات حديثة وموجات صوتية"><span>🎧</span><i>♪</i><i>♫</i><i>★</i></div></section>'+
 (featuredSong?'<section class="af-featured-story"><span class="af-story-star">⭐</span>'+
 '<div><strong>اختيار تحفيزي: '+afEsc(featuredSong.title)+'</strong>'+
 '<p>'+afEsc(featuredSong.summary||'مقطع تحفيزي عن الطموح والنجاح.')+
 ' يُعرض من مصدره الرسمي دون إعادة نشر الملف الصوتي.</p></div>'+
 '<button class="hub-secondary" type="button" data-af-cat="motivation">استكشف التحفيز والنجاح</button></section>':'')+
 '<section class="af-catalog-panel"><div class="af-heading"><h2>اختر قسم الاستماع</h2>'+
 '<p>اضغط على القسم لتصفية المواد، أو ابحث عن اسم القارئ أو عنوان المقطع.</p></div>'+
 '<div class="af-categories">'+cats+'</div>'+
 '<form id="afSearchForm" class="af-search"><label for="afSearchTerm">البحث داخل المكتبة الصوتية</label>'+
 '<input id="afSearchTerm" name="query" autocomplete="off" placeholder="مثلاً: العفاسي، الحديث، عمان، حكاية الأبطال" value="'+afEsc(afAudio.search)+'">'+
 '<button class="hub-primary" type="submit">🔎 بحث</button>'+
 (afAudio.search?'<button class="hub-secondary" type="button" id="afClearSearch">مسح البحث</button>':'')+
 '</form></section>'+
 (afAudio.warning?'<p class="af-warning">'+afEsc(afAudio.warning)+'</p>':'')+
 (afAudio.loading?'<section class="af-loading" role="status">جارٍ تحميل المواد الصوتية المنشورة...</section>':
  matches.length?'<div class="af-item-count">يعرض '+afNum(matches.length)+' من '+afNum(count)+' مادة</div>'+
  '<section class="af-cards">'+matches.map(afCard).join('')+'</section>':
  '<section class="af-loading">لا توجد مواد مطابقة لهذا الاختيار. يمكنك تجربة قسم آخر.</section>')+
 '<section class="af-guide"><h2>كيف أستمع أو أحمل ملفًا؟</h2>'+
 '<div><article><b>▶ التشغيل</b><p>المقاطع ذات الملف الصوتي المصرّح به تعمل في مشغل الصوت، ومقاطع يوتيوب تُعرض عبر المشغل الرسمي، والتلاوات المرجعية تُفتح لدى المصدر.</p></article>'+
 '<article><b>🔊 قراءة الأقوال</b><p>الأحاديث الموثقة والحِكَم المختارة يمكن سماع نصوصها بصوت آلي من المتصفح. لا تُستخدم القراءة الآلية لتلاوة القرآن الكريم.</p></article>'+
 '<article><b>⬇ التنزيل</b><p>يظهر زر التنزيل للملفات التي أذن أصحابها بتوزيعها فقط؛ وإلا تُعرض خيارات المصدر نفسه دون نسخ المقاطع المحمية.</p></article></div></section>'+
 '<footer class="af-audio-footer"><span>إعداد وإشراف: الأستاذ سعيد بن جمعة بن عبدالله البريكي</span>'+
 '<span>مدير المدرسة: الأستاذ عبد الله بن علي العيسائي</span></footer></div>';
}
async function afLoadPublic(){
 if(afAudio.loading)return;afAudio.loading=true;afAudio.warning='';
 try{
  const r=await hubCall('audio_list');afAudio.items=r.items||[];afAudio.loaded=true;
 }catch(e){afAudio.warning=e.message}
 finally{afAudio.loading=false;if(state.page==='audio')render()}
}
async function afLoadAdmin(){
 if(!isAdmin()||afAudio.adminLoading)return;afAudio.adminLoading=true;
 try{const r=await hubCall('audio_admin',{},auth.token);
  afAudio.adminItems=r.items||[];afAudio.adminLoaded=true;afAudio.warning='';
 }catch(e){afAudio.warning=e.message}
 finally{afAudio.adminLoading=false;if(state.page==='dashboard'&&auth.section==='hub_audio')render()}
}
function afAdminPage(){
 const edit=afAudio.edit;
 const select=(name,value,choices)=>'<select name="'+name+'" id="afField'+name+'">'+choices.map(([val,label])=>
 '<option value="'+afEsc(val)+'"'+(val===value?' selected':'')+'>'+afEsc(label)+'</option>').join('')+'</select>';
 const check=(name,yes,label)=>'<label class="af-checkbox"><input type="checkbox" name="'+name+'"'+(yes?' checked':'')+'>'+label+'</label>';
 const categories=AF_CATS.filter(x=>x[0]!=='all').map(x=>[x[0],x[1]]);
 const forms=afAudio.adminItems.map(it=>'<article class="af-admin-item"><div><strong>'+afEsc(it.title)+'</strong>'+
 '<span>'+afEsc(afCat(it.category)[1])+' · '+(it.published?'منشور للجميع':'مخفي عن الزوار')+'</span>'+
 (it.audio_url?'<small>🎧 ملف صوتي</small>':it.youtube_url?'<small>▶ يوتيوب</small>':'')+'</div>'+
 '<div class="af-admin-actions"><button type="button" class="hub-secondary" data-af-edit="'+it.id+'">تعديل</button>'+
 '<button type="button" class="hub-secondary" data-af-toggle="'+it.id+'">'+(it.published?'إخفاء':'نشر')+'</button>'+
 '<button type="button" class="hub-danger" data-af-delete="'+it.id+'">حذف</button></div></article>').join('');
 return '<div class="container af-admin-page" dir="rtl"><section class="af-admin-head"><span>لوحة المشرف الرئيسي</span>'+
 '<h1>إدارة المكتبة الصوتية</h1><p>إضافة المواد وتعديلها وترتيبها وإظهارها للزوار، مع رفع الملفات المصرح باستخدامها فقط.</p>'+
 '<button class="hub-secondary" data-route="audio">فتح بوابة الاستماع العامة</button></section>'+
 '<div class="hub-staff-nav"><button type="button" data-tab="overview">العودة إلى لوحة المشرف</button>'+
 '<button type="button" data-tab="hub_catalog">إدارة المكتبة العامة</button></div>'+
 '<section class="hub-main"><h2>'+(edit?'تعديل ملف صوتي':'إضافة ملف جديد')+'</h2>'+
 '<form id="afAdminForm"><div class="af-form-grid">'+
 '<label>القسم'+select('category',edit?.category||'quran',categories)+'</label>'+
 '<label>نوع التشغيل'+select('media_type',edit?.media_type||'external',[
 ['external','مكتبة خارجية تتيح الاستماع من المصدر'],['youtube','فيديو رسمي من يوتيوب'],
 ['audio','مشغل صوت لملف MP3 / OGG / WAV / M4A'],['spoken','قراءة آلية لنص مكتوب']])+'</label>'+
 '<label>العنوان<input name="title" minlength="2" maxlength="170" required value="'+afEsc(edit?.title||'')+'"></label>'+
 '<label>القارئ / المنشد / المؤدي / المصدر<input name="performer" maxlength="160" value="'+afEsc(edit?.performer||'')+'"></label>'+
 '<label>الترتيب<input type="number" name="sort_order" value="'+afEsc(edit?.sort_order??100)+'"></label>'+
 '<label>رابط الصفحة الأصلية<input type="url" name="source_url" placeholder="https://..." value="'+afEsc(edit?.source_url||'')+'"></label>'+
 '<label>رابط يوتيوب الأصلي<input type="url" name="youtube_url" placeholder="https://www.youtube.com/watch?v=..." value="'+afEsc(edit?.youtube_url||'')+'"></label>'+
 '<label>رابط الملف الصوتي المباشر<input type="url" name="audio_url" id="afMediaUrl" placeholder="https://.../audio.mp3" value="'+afEsc(edit?.audio_url||'')+'"></label>'+
 '<label>رابط التنزيل المصرح به<input type="url" name="download_url" placeholder="https://.../audio.mp3" value="'+afEsc(edit?.download_url||'')+'"></label>'+
 '<label>مسار الملف المرفوع (تلقائي)<input name="uploaded_path" readonly value="'+afEsc(edit?.uploaded_path||'')+'"></label></div>'+
 '<label>وصف المادة<textarea name="summary" maxlength="650" rows="3">'+afEsc(edit?.summary||'')+'</textarea></label>'+
 '<label>نص القراءة الآلية (الحديث أو الحكمة فقط)<textarea name="spoken_text" maxlength="1500" rows="3">'+afEsc(edit?.spoken_text||'')+'</textarea></label>'+
 '<label>معلومات الحقوق والتصريح بالاستخدام<textarea name="copyright_note" id="afCopyright" maxlength="350" rows="3" placeholder="اسم صاحب الحقوق ونوع الإذن أو الملكية الموثقة">'+afEsc(edit?.copyright_note||'')+'</textarea></label>'+
 '<div class="af-checks">'+check('published',edit?edit.published:true,'منشور للجميع')+
 check('featured',!!edit?.featured,'مادة مميزة')+
 check('can_download',!!edit?.can_download,'السماح بتنزيل الملف الصوتي')+'</div>'+
 '<label class="af-permission"><input name="permission_confirmed" type="checkbox">'+
 'أؤكد أن لدي حق رفع هذا الملف وإتاحته، وأن السماح بالتنزيل يستند إلى إذن صريح من صاحب الحقوق، وليس إلى مجرد ظهور المقطع على الإنترنت.</label>'+
 '<div class="af-form-actions"><button class="hub-primary" type="submit">'+(edit?'حفظ التعديل':'إضافة المادة')+'</button>'+
 (edit?'<button class="hub-secondary" type="button" id="afCancelEdit">إلغاء التحرير</button>':'')+'</div></form>'+
 '</section><section class="hub-main"><h2>رفع ملف صوتي مملوك أو مُصرح بتوزيعه</h2>'+
 '<p>يمكن للمشرف رفع ملف MP3 أو OGG أو WAV أو M4A حتى ٨ ميجابايت. بعد الرفع تُدرج روابطه في الحقول أعلاه، ويجب حفظ بيانات المادة. لا ترفع تسجيلات الفنانين أو الأناشيد المحمية دون إذن مكتوب.</p>'+
 '<form id="afUploadForm"><label>ملف الصوت من الجهاز<input type="file" name="audiofile" accept=".mp3,.ogg,.wav,.m4a,audio/mpeg,audio/ogg,audio/wav,audio/mp4" required></label>'+
 '<label class="af-permission"><input name="permission_confirmed" type="checkbox" required>أملك حقوق الملف أو لدي تصريح صريح لنشره على منصة آفاق الرياضيات.</label>'+
 '<label>تفاصيل حق النشر / اسم صاحب الإذن<input name="copyright_note" minlength="20" maxlength="350" required placeholder="صاحب الحقوق ونوع الإذن وتاريخه إن وجد"></label>'+
 '<button type="submit" class="hub-primary">⬆ رفع الملف وربطه بالنموذج أعلاه</button></form>'+
 (afAudio.message?'<p class="af-success">'+afEsc(afAudio.message)+'</p>':'')+
 '</section><section class="hub-main"><h2>إدارة المواد المحفوظة ('+afNum(afAudio.adminItems.length)+')</h2>'+
 '<div class="af-admin-list">'+(forms||'<p>لا توجد مواد بعد.</p>')+'</div>'+
 '</section></div>';
}
async function afSaveForm(form){
 if(!isAdmin()||afAudio.busy)return;
 const f=new FormData(form),obj=Object.fromEntries(f.entries()),id=afAudio.edit?.id;
 const payload={...obj,id:id??null,sort_order:Number(obj.sort_order||100),
  published:f.has('published'),featured:f.has('featured'),can_download:f.has('can_download'),
  permission_confirmed:f.has('permission_confirmed')};
 if(payload.media_type==='audio'&&payload.can_download&&!payload.download_url&&payload.audio_url){
  payload.download_url=payload.audio_url;
 }
 afAudio.busy=true;
 try{
  await hubCall('audio_save',payload,auth.token);
  afAudio.edit=null;afAudio.message='تم حفظ المادة الصوتية بنجاح.';
  await Promise.all([afLoadAdmin(),afLoadPublic()]);
 }catch(e){window.alert(e.message)}
 finally{afAudio.busy=false;render()}
}
async function afUpload(form){
 if(!isAdmin()||afAudio.busy)return;
 const f=new FormData(form),file=f.get('audiofile');
 if(!(file instanceof File)||file.size<500||file.size>8000000){window.alert('اختر ملفًا صوتيًا يقل عن ٨ ميجابايت.');return}
 const rights=String(f.get('copyright_note')||'').trim();
 if(!f.has('permission_confirmed')||rights.length<20){
  window.alert('أقرّ بحقك في نشر الملف واكتب بيانات الإذن قبل الرفع.');return
 }
 const types={mp3:'audio/mpeg',ogg:'audio/ogg',wav:'audio/wav',m4a:'audio/mp4'};
 const ext=String(file.name).split('.').pop().toLowerCase(),mime=types[ext];
 if(!mime){window.alert('صيغة الملف غير مدعومة.');return}
 afAudio.busy=true;afAudio.message='جارٍ رفع الملف المصرّح به...';
 try{
  const base64=await new Promise((resolve,reject)=>{
   const reader=new FileReader();
   reader.onload=()=>resolve(String(reader.result||'').split(',')[1]||'');
   reader.onerror=()=>reject(new Error('تعذر قراءة ملف الصوت'));
   reader.readAsDataURL(file);
  });
  const result=await hubCall('audio_upload',{filename:file.name,mime,base64,
   copyright_note:rights,permission_confirmed:true},auth.token);
  const current=Object.fromEntries(new FormData(document.getElementById('afAdminForm')));
  const prior=afAudio.edit||{};
  afAudio.edit={...prior,...current,media_type:'audio',audio_url:result.audio_url,
   download_url:current.download_url||'',uploaded_path:result.uploaded_path,
   copyright_note:rights,published:current.published==='on',
   featured:current.featured==='on',can_download:current.can_download==='on'};
  afAudio.message='نجح رفع الملف. راجع عنوانه ونوعه واضغط «حفظ المادة» أعلى الصفحة لتثبيته في المكتبة.';
  render();document.getElementById('afAdminForm')?.scrollIntoView({block:'start',behavior:'smooth'});
 }catch(e){afAudio.message='';window.alert(e.message)}
 finally{afAudio.busy=false}
}
async function afToggle(id){
 if(!isAdmin())return;
 const item=afAudio.adminItems.find(x=>Number(x.id)===Number(id));if(!item)return;
 try{await hubCall('audio_toggle',{id,published:!item.published},auth.token);
  await Promise.all([afLoadAdmin(),afLoadPublic()]);
 }catch(e){window.alert(e.message)}
}
async function afDelete(id){
 if(!isAdmin())return;
 const item=afAudio.adminItems.find(x=>Number(x.id)===Number(id));if(!item)return;
 if(!window.confirm('حذف «'+item.title+'» من المكتبة الصوتية نهائيًا؟'))return;
 try{await hubCall('audio_delete',{id},auth.token);afAudio.edit=null;
  await Promise.all([afLoadAdmin(),afLoadPublic()]);
 }catch(e){window.alert(e.message)}
}
function afSpeech(item){
 if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){
  window.alert('القراءة الصوتية الآلية غير مدعومة في هذا المتصفح. يمكن قراءة النص وفتح مصدره.');return}
 const source=String(item.spoken_text||'');
 if(!source||item.category==='quran')return;
 window.speechSynthesis.cancel();
 const u=new SpeechSynthesisUtterance(source);
 u.lang='ar';u.rate=0.85;u.pitch=1;u.volume=1;
 const voices=window.speechSynthesis.getVoices?.()||[];
 const voice=voices.find(v=>v.lang?.toLowerCase().startsWith('ar'));
 if(voice)u.voice=voice;
 window.speechSynthesis.speak(u);
}
function afBind(){
 document.querySelectorAll('[data-af-cat]').forEach(b=>b.addEventListener('click',()=>{
  afAudio.selected=b.dataset.afCat;afAudio.playingVideo=null;
  window.speechSynthesis?.cancel();render();
 }));
 document.getElementById('afSearchForm')?.addEventListener('submit',e=>{
  e.preventDefault();afAudio.search=String(new FormData(e.currentTarget).get('query')||'').trim().slice(0,100);
  afAudio.playingVideo=null;render();
 });
 document.getElementById('afClearSearch')?.addEventListener('click',()=>{afAudio.search='';render()});
 document.querySelectorAll('[data-af-video]').forEach(b=>b.addEventListener('click',()=>{
  afAudio.playingVideo=Number(b.dataset.afVideo);window.speechSynthesis?.cancel();render();
 }));
 document.querySelectorAll('[data-af-speak]').forEach(b=>b.addEventListener('click',()=>{
  const item=afAudio.items.find(x=>String(x.id)===b.dataset.afSpeak);if(item)afSpeech(item);
 }));
 document.querySelectorAll('[data-af-stop-speech]').forEach(b=>b.addEventListener('click',()=>window.speechSynthesis?.cancel()));
 document.querySelectorAll('.af-audio-player audio').forEach(a=>a.addEventListener('play',()=>{
  document.querySelectorAll('.af-audio-player audio').forEach(other=>{if(other!==a)other.pause()});
  window.speechSynthesis?.cancel();
 }));
 document.getElementById('afAdminForm')?.addEventListener('submit',e=>{e.preventDefault();afSaveForm(e.currentTarget)});
 document.getElementById('afUploadForm')?.addEventListener('submit',e=>{e.preventDefault();afUpload(e.currentTarget)});
 document.getElementById('afCancelEdit')?.addEventListener('click',()=>{afAudio.edit=null;render()});
 document.querySelectorAll('[data-af-edit]').forEach(b=>b.addEventListener('click',()=>{
  afAudio.edit=afAudio.adminItems.find(x=>String(x.id)===b.dataset.afEdit)||null;
  afAudio.message='';render();document.getElementById('afAdminForm')?.scrollIntoView({block:'start',behavior:'smooth'});
 }));
 document.querySelectorAll('[data-af-toggle]').forEach(b=>b.addEventListener('click',()=>afToggle(b.dataset.afToggle)));
 document.querySelectorAll('[data-af-delete]').forEach(b=>b.addEventListener('click',()=>afDelete(b.dataset.afDelete)));
 document.getElementById('portalLogout')?.addEventListener('click',()=>{
  afAudio.adminItems=[];afAudio.adminLoaded=false;afAudio.edit=null;afAudio.uploaded=null;afAudio.message='';
 });
}
/* ربط غير تدميري للبوابات السابقة. */
const afOldLibrary=hubLibrary;
hubLibrary=function(){
 const previous=afOldLibrary();
 return previous.replace('</section><div class="hub-tabs">','</section>'+afAudioCTA()+'<div class="hub-tabs">');
};
const afOldVisitor=hubVisitor;
hubVisitor=function(){
 const previous=afOldVisitor();
 return previous.replace('<section class="hub-main"><div class="hub-heading"><h2>استكشف بوابات المنصة</h2>',
  afAudioCTA()+'<section class="hub-main"><div class="hub-heading"><h2>استكشف بوابات المنصة</h2>');
};
const afOldHome=hubHome;
hubHome=function(){
 const previous=afOldHome();
 return previous.replace(hubAbout(),afAudioCTA()+hubAbout());
};
const afOldStaffNav=hubStaffNav;
hubStaffNav=function(){
 const original=afOldStaffNav();
 if(original.includes('data-tab="hub_audio"'))return original;
 return original.replace('</div>','<button class="'+(auth.section==='hub_audio'?'selected':'')+
 '" data-tab="hub_audio">🎧 المكتبة الصوتية</button></div>');
};
const afOldStaffDash=hubStaffDashboard;
hubStaffDashboard=function(){
 const previous=afOldStaffDash();
 return previous.replace('<details class="hub-staff-old">',
  '<section class="hub-staff-group"><div class="hub-heading"><h2>المكتبة الصوتية والتحفيز</h2></div>'+
  '<div class="hub-gate-grid">'+hubGate('إدارة الاستماع','music','قرآن وحديث وحكم وأناشيد وملفات صوتية قابلة للإضافة','data-tab="hub_audio"','green')+
  hubGate('استمع كزائر','book-open','عرض المواد المنشورة للجميع','data-route="audio"','blue')+
  '</div></section><details class="hub-staff-old">');
};
const afOldStaffPanel=staffPanel;
staffPanel=function(){
 if(auth.section==='hub_audio'){
  if(!isAdmin())return '<div class="container"><p class="notice">إضافة ملفات الاستماع وتعديلها تتطلب صلاحية مشرف المنصة الرئيسي.</p></div>';
  return afAdminPage();
 }
 return afOldStaffPanel();
};
const afOldRender=render;
render=function(){
 if(state.page==='audio'){
  document.getElementById('app').innerHTML=afAudioPage();
  document.querySelectorAll('[data-route]').forEach(x=>x.classList.toggle('active',x.dataset.route==='audio'));
  attach();attachPortal();
  if(!afAudio.loaded&&!afAudio.loading)afLoadPublic();
  return;
 }
 afOldRender();
 if(state.page==='dashboard'&&auth.section==='hub_audio'&&isAdmin()&&!afAudio.adminLoaded&&!afAudio.adminLoading)
  afLoadAdmin();
};
const afOldAttach=attach;
attach=function(){afOldAttach();afBind();};
const afOrigLoadStaff=hubLoadForTab;
hubLoadForTab=function(tab){
 afOrigLoadStaff(tab);
 if(tab==='hub_audio'&&isAdmin()&&!afAudio.adminLoaded&&!afAudio.adminLoading)afLoadAdmin();
};
HUB_MAIN_MENU.splice(3,0,['audio','الاستماع']);
hubTopNavigation();
if(location.hash==='#audio'){state.page='audio';render()}else render();
