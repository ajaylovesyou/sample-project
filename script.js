/* ═══════════════════════════════════════
   ALL FUNCTIONS DEFINED BEFORE USE
   No inline onclick dependencies on load
═══════════════════════════════════════ */

/* ── PROXY ── */
const PROXY_URL = '/api/proxy';

/* ── STATE ── */
let isRec=false,audioCtx,analyser,stream,animId;
let detected=[],curStyle='jingle',melody=null,playMode='piano';
let toneOk=false,recSec=0,recTimer=null,melCnt=0,keyCnt=0;
let playTOs=[],userName='',library=[],speedMul=1.0;
let humSeq=[],curHumNote=null,humStart=0;
let therapyNodes=[],therapyActive=false,therapyType='tibetan',therapyVol=0.7;
let therapyAC=null,therapyGain=null;

/* ── STORAGE ── */
function setCookie(n,v,d=365){const x=new Date();x.setTime(x.getTime()+d*86400000);document.cookie=n+'='+encodeURIComponent(v)+';expires='+x.toUTCString()+';path=/';}
function getCookie(n){const p=n+'=',ca=document.cookie.split(';');for(let c of ca){let t=c.trim();if(t.startsWith(p))return decodeURIComponent(t.substring(p.length));}return '';}
function save(k,v){try{localStorage.setItem(k,typeof v==='string'?v:JSON.stringify(v));}catch(e){}setCookie(k,typeof v==='string'?v:JSON.stringify(v));}
function load(k){try{const l=localStorage.getItem(k);if(l!==null)return l;}catch(e){}return getCookie(k)||null;}

/* ── TOAST ── */
const TC={green:'rgba(16,185,129,.14)',purple:'rgba(91,33,182,.14)',amber:'rgba(245,158,11,.14)',red:'rgba(239,68,68,.14)'};
const TB={green:'rgba(16,185,129,.3)',purple:'rgba(139,92,246,.3)',amber:'rgba(245,158,11,.3)',red:'rgba(239,68,68,.3)'};
function toast(msg,col){col=col||'purple';const s=document.getElementById('toasts'),el=document.createElement('div');el.className='toast';el.style.background=TC[col]||TC.purple;el.style.borderColor=TB[col]||TB.purple;el.textContent=msg;el.onclick=function(){dismissToast(el);};s.appendChild(el);setTimeout(function(){dismissToast(el);},4500);const all=s.querySelectorAll('.toast');if(all.length>4)dismissToast(all[0]);}
function dismissToast(el){if(!el.parentNode)return;el.classList.add('out');setTimeout(function(){if(el.parentNode)el.remove();},300);}

/* ── PAGE NAV ── */
function showPage(id){
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
  const pg=document.getElementById('page-'+id);
  if(pg)pg.classList.add('active');
  document.querySelectorAll('.nav-link').forEach(function(l){l.classList.remove('active');});
  const nl=document.getElementById('nl-'+id);
  if(nl)nl.classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
  closeMobileNav();
}

/* ── MOBILE NAV ── */
function toggleMobileNav(){
  document.getElementById('mobileNav').classList.toggle('open');
  document.getElementById('hamburger').classList.toggle('open');
}
function closeMobileNav(){
  document.getElementById('mobileNav').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
}

/* ── THEME ── */
function setTheme(t,btn){
  document.documentElement.setAttribute('data-theme',t);
  save('cp_theme',t);
  document.querySelectorAll('.tbtn').forEach(function(b){b.classList.remove('on');});
  // Mark all buttons matching this theme in both desktop + mobile
  document.querySelectorAll('.tbtn').forEach(function(b){
    var txt=b.textContent.trim();
    if((t==='dark'&&txt.includes('🌙'))||(t==='light'&&txt.includes('☀️'))||(t==='default'&&txt.includes('🔮')))b.classList.add('on');
  });
  toast('🎨 '+t.charAt(0).toUpperCase()+t.slice(1)+' theme','purple');
}

/* ── USER NAME ── */
function setUserName(){
  var inp=document.getElementById('nameModalInput');
  var n=inp.value.trim();
  if(!n){document.getElementById('nameError').classList.add('show');return;}
  userName=n;
  save('cp_username',userName);
  applyUserName(userName);
  document.getElementById('welcomeModal').classList.remove('show');
  var ni=document.getElementById('nameInput');
  if(ni)ni.value=userName;
  showGreeting();
}
function updateName(){
  var n=document.getElementById('nameInput').value.trim();
  if(!n){toast('Please enter a name!','amber');return;}
  userName=n;save('cp_username',userName);applyUserName(userName);
  toast('Hello, '+userName+'! 👋','green');
}
function applyUserName(n){
  var f=n.split(' ')[0];
  document.getElementById('userNameDisplay').textContent=f;
  document.getElementById('userAvatar').textContent=n.charAt(0).toUpperCase();
}
function showGreeting(){
  var bar=document.getElementById('greetingBar'),txt=document.getElementById('greetingText');
  var f=userName.split(' ')[0];
  var g=['Welcome back, '+f+'! Ready to make music? 🎵','Hey '+f+'! Let\'s compose something amazing! ✨','Good to see you, '+f+'! Time to relax 🎶',f+', your AI studio is ready! 🚀'];
  txt.textContent=g[Math.floor(Math.random()*g.length)];
  bar.classList.add('show');
  setTimeout(function(){bar.classList.remove('show');},6000);
}
function showRenamePrompt(){
  var n=prompt('Enter your new name:',userName);
  if(n&&n.trim()){userName=n.trim();save('cp_username',userName);applyUserName(userName);toast('Name updated to '+userName+'!','green');var ni=document.getElementById('nameInput');if(ni)ni.value=userName;}
}

/* ── SPEEDOMETER ── */
function drawSpeedoDial(val){
  var cv=document.getElementById('speedoDial');if(!cv)return;
  var ctx=cv.getContext('2d'),W=cv.width,H=cv.height,cx=W/2,cy=H-10,r=Math.min(W,H*2)*0.42;
  ctx.clearRect(0,0,W,H);
  var mn=0.3,mx=3.0,fr=(val-mn)/(mx-mn),ang=Math.PI+fr*(0-Math.PI);
  ctx.beginPath();ctx.arc(cx,cy,r,Math.PI,0,false);ctx.strokeStyle='rgba(255,255,255,0.06)';ctx.lineWidth=14;ctx.stroke();
  var g=ctx.createLinearGradient(cx-r,cy,cx+r,cy);g.addColorStop(0,'#8b5cf6');g.addColorStop(.5,'#ec4899');g.addColorStop(1,'#ef4444');
  ctx.beginPath();ctx.arc(cx,cy,r,Math.PI,ang,false);ctx.strokeStyle=g;ctx.lineWidth=14;ctx.lineCap='round';ctx.stroke();
  var nx=cx+Math.cos(ang)*r*.83,ny=cy+Math.sin(ang)*r*.83;
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(nx,ny);ctx.strokeStyle='#fff';ctx.lineWidth=2.5;ctx.lineCap='round';ctx.stroke();
  ctx.beginPath();ctx.arc(cx,cy,5,0,Math.PI*2);ctx.fillStyle='#8b5cf6';ctx.fill();
}
function updateSpeed(val,sv){
  speedMul=parseFloat(val);
  document.getElementById('speedLabel').textContent=speedMul.toFixed(1)+'×';
  document.getElementById('speedoVal').textContent=speedMul.toFixed(1)+'×';
  document.getElementById('speedSlider').value=speedMul;
  drawSpeedoDial(speedMul);
  if(sv!==false)save('cp_speed',speedMul);
}
function setSpeed(v){updateSpeed(v);toast('Speed: '+v+'×','purple');}

/* ── PITCH ── */
var NOTENAMES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
function freq2note(f){if(!f||f<70||f>1400)return null;var n=12*Math.log2(f/440)+69;var o=Math.max(2,Math.min(6,Math.floor(n/12)-1));return NOTENAMES[Math.round(n)%12]+o;}
function autocorrelate(buf,sr){var rms=0;for(var i=0;i<buf.length;i++)rms+=buf[i]*buf[i];rms=Math.sqrt(rms/buf.length);if(rms<0.007)return -1;var r1=0,r2=buf.length-1;for(var i=0;i<buf.length/2;i++)if(Math.abs(buf[i])<0.2){r1=i;break;}for(var i=1;i<buf.length/2;i++)if(Math.abs(buf[buf.length-i])<0.2){r2=buf.length-i;break;}buf=buf.slice(r1,r2);var sz=buf.length;var c=new Float32Array(sz+1);for(var i=0;i<sz;i++)for(var j=0;j<sz-i;j++)c[i]+=buf[j]*buf[j+i];var d=0;while(c[d]>c[d+1])d++;var mx=-1,mp=-1;for(var i=d;i<sz;i++)if(c[i]>mx){mx=c[i];mp=i;}if(mp<2)return -1;var x1=c[mp-1],x2=c[mp],x3=c[mp+1];var a=(x1+x3-2*x2)/2,b2=(x3-x1)/2;var T=mp;if(a)T=mp-b2/(2*a);return sr/T;}

/* ── RECORDING ── */
function toggleMic(){if(isRec)stopRec();else startRec();}
async function startRec(){
  try{
    stream=await navigator.mediaDevices.getUserMedia({audio:true,echoCancellation:true,noiseSuppression:true});
    audioCtx=new AudioContext();analyser=audioCtx.createAnalyser();analyser.fftSize=2048;
    audioCtx.createMediaStreamSource(stream).connect(analyser);
    isRec=true;detected=[];humSeq=[];curHumNote=null;
    document.getElementById('nbox').innerHTML='<span class="nempty">Listening... hum now! 🎵</span>';
    document.getElementById('micBtn').classList.add('rec');document.getElementById('micBtn').textContent='⏹️';
    setHint('live','● REC — Hum your tune...');setStep(1);
    recSec=0;document.getElementById('stt').textContent='0s';
    recTimer=setInterval(function(){recSec++;document.getElementById('stt').textContent=recSec+'s';},1000);
    drawLoop();
  }catch(e){toast('Mic denied! Please enable microphone access.','red');}
}
function stopRec(){
  if(curHumNote&&humStart>0){var dur=Math.max(0.1,(Date.now()-humStart)/1000);humSeq.push({note:curHumNote,dur:+dur.toFixed(2)});curHumNote=null;humStart=0;}
  isRec=false;if(stream)stream.getTracks().forEach(function(t){t.stop();});if(audioCtx)audioCtx.close();
  cancelAnimationFrame(animId);clearInterval(recTimer);
  document.getElementById('micBtn').classList.remove('rec');document.getElementById('micBtn').textContent='🎙️';
  var n=detected.length;
  setHint(n>0?'done':'',n>0?'✓ '+n+' notes! Pick style & generate →':'No notes — hum louder!');
  document.getElementById('pf').style.width='0%';document.getElementById('pn').textContent='—';document.getElementById('stn').textContent=n;lightKey(null);
  if(n>0){setStep(2);toast(n+' notes captured! Pick a style.','purple');}
  /* BACKEND: save hum recording */
  if(n>0){ saveHumToDB(detected, humSeq); }
  saveSessionToDB();
}
function setHint(cls,txt){var el=document.getElementById('mhint');el.className='mhint'+(cls?' '+cls:'');el.textContent=txt;}

/* ── DRAW LOOP ── */
var lastNote=null,noteTick=0;
function drawLoop(){
  animId=requestAnimationFrame(drawLoop);
  var cvs=document.getElementById('wave'),ctx=cvs.getContext('2d');
  cvs.width=cvs.offsetWidth*devicePixelRatio;cvs.height=cvs.offsetHeight*devicePixelRatio;
  ctx.scale(devicePixelRatio,devicePixelRatio);var W=cvs.offsetWidth,H=cvs.offsetHeight;
  var buf=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(buf);
  ctx.fillStyle='#08081a';ctx.fillRect(0,0,W,H);
  ctx.beginPath();for(var i=0;i<buf.length;i++){var x=(i/buf.length)*W,y=(buf[i]*.5+.5)*H;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
  ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();
  var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(139,92,246,.2)');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fill();
  ctx.save();ctx.strokeStyle='#a78bfa';ctx.lineWidth=1.7;ctx.shadowColor='#8b5cf6';ctx.shadowBlur=11;ctx.beginPath();
  for(var i=0;i<buf.length;i++){var x=(i/buf.length)*W,y=(buf[i]*.5+.5)*H;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
  ctx.stroke();ctx.restore();
  var freq=autocorrelate(buf,audioCtx.sampleRate),note=freq2note(freq);
  if(note){
    document.getElementById('pf').style.width=Math.min(100,((freq-70)/(1400-70))*100)+'%';
    document.getElementById('pn').textContent=note;lightKey(note);
    if(note!==lastNote){
      if(curHumNote&&humStart>0){var d=Math.max(0.1,(Date.now()-humStart)/1000);humSeq.push({note:curHumNote,dur:+d.toFixed(2)});}
      curHumNote=note;humStart=Date.now();lastNote=note;noteTick++;
      if(noteTick%4===0&&detected.length<24){detected.push(note);addPill(note);document.getElementById('stn').textContent=detected.length;}
    }
  }else{
    if(curHumNote&&humStart>0){var d=Math.max(0.1,(Date.now()-humStart)/1000);if(d>0.09)humSeq.push({note:curHumNote,dur:+d.toFixed(2)});curHumNote=null;humStart=0;}
    document.getElementById('pf').style.width='0%';document.getElementById('pn').textContent='—';lastNote=null;
  }
}
function addPill(note){var b=document.getElementById('nbox');if(b.querySelector('.nempty'))b.innerHTML='';var p=document.createElement('span');p.className='npill';p.textContent=note;p.title='Click to hear '+note;p.onclick=function(){pianoPlay(note);};b.appendChild(p);}

/* ── PIANO ── */
var WK=['C','D','E','F','G','A','B'],BKmap={C:'C#',D:'D#',F:'F#',G:'G#',A:'A#'},OCTS=[3,4,5];
function buildPiano(){
  var wrap=document.getElementById('pianoWrap'),keysEl=document.getElementById('pianoKeys');
  OCTS.forEach(function(oct){WK.forEach(function(w){var note=w+oct,k=document.createElement('div');k.className='wkey';k.id='wk_'+note;k.textContent=w;k.addEventListener('mousedown',function(){k.classList.add('lit');pianoPlay(note);});k.addEventListener('mouseup',function(){k.classList.remove('lit');});k.addEventListener('mouseleave',function(){k.classList.remove('lit');});k.addEventListener('touchstart',function(e){e.preventDefault();k.classList.add('lit');pianoPlay(note);},{passive:false});k.addEventListener('touchend',function(){k.classList.remove('lit');});keysEl.appendChild(k);});});
  setTimeout(function(){OCTS.forEach(function(oct){WK.forEach(function(w){if(!BKmap[w])return;var bn=BKmap[w]+oct,wk=document.getElementById('wk_'+w+oct);if(!wk)return;var bk=document.createElement('div');bk.className='bkey';bk.id='bk_'+bn.replace('#','s');bk.textContent='♯';var wr=wrap.getBoundingClientRect(),kr=wk.getBoundingClientRect();bk.style.left=(kr.left-wr.left+kr.width-11)+'px';bk.style.top='0';bk.addEventListener('mousedown',function(e){e.stopPropagation();bk.classList.add('lit');pianoPlay(bn);});bk.addEventListener('mouseup',function(){bk.classList.remove('lit');});bk.addEventListener('mouseleave',function(){bk.classList.remove('lit');});bk.addEventListener('touchstart',function(e){e.stopPropagation();e.preventDefault();bk.classList.add('lit');pianoPlay(bn);},{passive:false});bk.addEventListener('touchend',function(){bk.classList.remove('lit');});wrap.appendChild(bk);});});},80);
}
function lightKey(note){document.querySelectorAll('.wkey,.bkey').forEach(function(k){k.classList.remove('lit');});if(!note)return;var wk=document.getElementById('wk_'+note);if(wk){wk.classList.add('lit');return;}var bk=document.getElementById('bk_'+note.replace('#','s'));if(bk)bk.classList.add('lit');}

/* ── SOUND ENGINE ── */
var lim,hall,room,plate,sdelay,ldelay,wchorus,schorus,warmEQ;
var pianoS,humS,bellS,gtarS,fluteS;
async function initTone(){
  if(toneOk)return;await Tone.start();toneOk=true;
  lim=new Tone.Limiter(-1).toDestination();
  hall=new Tone.Reverb({decay:5.0,wet:.38,preDelay:.035}).connect(lim);await hall.ready;
  room=new Tone.Reverb({decay:2.2,wet:.30}).connect(lim);await room.ready;
  plate=new Tone.Reverb({decay:3.0,wet:.32}).connect(lim);await plate.ready;
  sdelay=new Tone.FeedbackDelay({delayTime:'16n',feedback:.14,wet:.10}).connect(hall);
  ldelay=new Tone.FeedbackDelay({delayTime:'8n.',feedback:.22,wet:.15}).connect(plate);
  wchorus=new Tone.Chorus({frequency:1.4,delayTime:4,depth:.45,wet:.35}).connect(hall);wchorus.start();
  schorus=new Tone.Chorus({frequency:.8,delayTime:5.8,depth:.65,wet:.50}).connect(hall);schorus.start();
  warmEQ=new Tone.EQ3({low:4,mid:1,high:-5,lowFrequency:200,highFrequency:5500}).connect(sdelay);
  pianoS=new Tone.PolySynth(Tone.Synth,{oscillator:{type:'custom',partials:[1,.80,.50,.28,.16,.08,.035],partialCount:7},envelope:{attack:.006,decay:1.2,sustain:.22,release:2.8},volume:-4}).connect(warmEQ);
  humS=new Tone.PolySynth(Tone.Synth,{oscillator:{type:'custom',partials:[1,.55,.26,.11,.05],partialCount:5},envelope:{attack:.06,decay:.4,sustain:.65,release:2.0},volume:-7}).connect(room);
  bellS=new Tone.PolySynth(Tone.FMSynth,{harmonicity:5.2,modulationIndex:13,oscillator:{type:'sine'},envelope:{attack:.001,decay:1.8,sustain:.07,release:3.2},modulation:{type:'sine'},modulationEnvelope:{attack:.001,decay:.7,sustain:.22,release:1.5},volume:-8}).connect(hall);
  gtarS=new Tone.PolySynth(Tone.AMSynth,{harmonicity:2.6,oscillator:{type:'custom',partials:[1,.62,.30,.12,.05],partialCount:5},envelope:{attack:.003,decay:.62,sustain:.16,release:1.3},modulation:{type:'square'},modulationEnvelope:{attack:.002,decay:.20,sustain:.09,release:.55},volume:-8}).connect(room);
  var vib=new Tone.Vibrato({frequency:5.2,depth:.065,wet:.75}).connect(hall);
  fluteS=new Tone.PolySynth(Tone.Synth,{oscillator:{type:'custom',partials:[1,.20,.07,.03],partialCount:4},envelope:{attack:.13,decay:.36,sustain:.74,release:1.7},volume:-6}).connect(vib);
}
var MCFG={piano:{s:function(){return pianoS;},dur:'8n.',gm:1.0,lbl:'🎹 Grand Piano'},hum:{s:function(){return humS;},dur:'4n.',gm:1.0,lbl:'🎤 My Hum'},bell:{s:function(){return bellS;},dur:'4n.',gm:1.2,lbl:'🔔 Crystal Bell'},guitar:{s:function(){return gtarS;},dur:'8n',gm:.95,lbl:'🎸 Acoustic Guitar'},flute:{s:function(){return fluteS;},dur:'4n',gm:1.1,lbl:'🪈 Flute'}};
async function pianoPlay(note){await initTone();keyCnt++;document.getElementById('stk').textContent=keyCnt;lightKey(note);if(pianoS)pianoS.triggerAttackRelease(note,'8n.');setTimeout(function(){lightKey(null);},420);}

/* ── STYLE ── */
function setStyle(btn,s){document.querySelectorAll('.sopt').forEach(function(b){b.classList.remove('on');});btn.classList.add('on');curStyle=s;setStep(3);}

/* ── MODE ── */
function pickMode(mode,btn){
  therapyStop();playMode=mode;therapyType='';
  document.querySelectorAll('.mcard').forEach(function(c){c.classList.remove('on');});btn.classList.add('on');
  document.getElementById('therapyPlayer').classList.remove('show');
  setStep(4);var lbl=MCFG[mode]?MCFG[mode].lbl:mode;
  if(melody){document.getElementById('modeline').classList.add('on');document.getElementById('mlineText').textContent=lbl;}
  toast(lbl,'purple');
}

/* ── THERAPY ── */
var THERAPY_INFO={
  tibetan:{icon:'🪘',title:'Tibetan Singing Bowl Therapy',desc:'Ancient healing resonance therapy using harmonic overtone frequencies (174Hz, 285Hz, 528Hz). These frequencies calm the nervous system and promote deep meditative relaxation. Close your eyes and breathe deeply.'},
  binaural:{icon:'🧠',title:'Binaural Beats — Theta Waves (6Hz)',desc:'Brain entrainment therapy. A 174Hz tone in left ear and 180Hz in right — your brain perceives the 6Hz difference as a Theta wave, associated with deep meditation and stress relief. Use headphones for best results.'},
  soundbath:{icon:'🌊',title:'Sound Bath Meditation',desc:'A full immersive sonic healing experience combining layered harmonic drones and sustained resonance tones. Sound baths reduce anxiety, lower blood pressure, and induce a deeply peaceful state.'}
};
function pickTherapy(type,btn){
  doStop();playMode='therapy';therapyType=type;
  document.querySelectorAll('.mcard').forEach(function(c){c.classList.remove('on');});btn.classList.add('on');
  var info=THERAPY_INFO[type];
  document.getElementById('tpIcon').textContent=info.icon;
  document.getElementById('tpTitle').textContent=info.title;
  document.getElementById('tpDesc').textContent=info.desc;
  document.getElementById('therapyPlayer').classList.add('show');
  document.getElementById('therapyPlayer').scrollIntoView({behavior:'smooth',block:'nearest'});
  toast(info.title+' ready!','purple');
}
function therapyPlay(){
  therapyStop();
  document.getElementById('tpPlayBtn').textContent='⏸ Playing...';
  if(!therapyAC)therapyAC=new AudioContext();
  therapyGain=therapyAC.createGain();therapyGain.gain.setValueAtTime(therapyVol,therapyAC.currentTime);therapyGain.connect(therapyAC.destination);
  therapyActive=true;
  if(therapyType==='tibetan')playTibetan();
  else if(therapyType==='binaural')playBinaural();
  else if(therapyType==='soundbath')playSoundBath();
  toast('Therapy started. Breathe deeply... 🧘','purple');
}
function playTibetan(){
  if(!therapyActive)return;
  var ac=therapyAC,g=therapyGain;
  var chosen=[174,396,528];
  function scheduleStrike(freq,time,dur){
    [1,2.76,5.40,8.93].forEach(function(mult,idx){
      var o=ac.createOscillator(),e=ac.createGain();
      o.type='sine';o.frequency.setValueAtTime(freq*mult,time);
      var vol=[0.7,0.35,0.15,0.06][idx];
      e.gain.setValueAtTime(0,time);e.gain.linearRampToValueAtTime(vol*0.4,time+0.08);e.gain.exponentialRampToValueAtTime(0.001,time+dur);
      o.connect(e);e.connect(g);o.start(time);o.stop(time+dur);
    });
  }
  var t=ac.currentTime+0.3;
  chosen.forEach(function(f,i){scheduleStrike(f,ac.currentTime+i*0.8,8);});
  function scheduleNext(){
    if(!therapyActive)return;
    var freq=chosen[Math.floor(Math.random()*chosen.length)];
    scheduleStrike(freq,t,6+Math.random()*3);t+=3.5+Math.random()*4;
    therapyNodes.push(setTimeout(scheduleNext,3000+Math.random()*3000));
  }
  setTimeout(scheduleNext,4000);
}
function playBinaural(){
  if(!therapyActive)return;
  var ac=therapyAC,g=therapyGain;
  var merger=ac.createChannelMerger(2);
  var oscL=ac.createOscillator(),gainL=ac.createGain();
  oscL.type='sine';oscL.frequency.setValueAtTime(174,ac.currentTime);
  gainL.gain.setValueAtTime(0,ac.currentTime);gainL.gain.linearRampToValueAtTime(0.35,ac.currentTime+3);
  oscL.connect(gainL);gainL.connect(merger,0,0);
  var oscR=ac.createOscillator(),gainR=ac.createGain();
  oscR.type='sine';oscR.frequency.setValueAtTime(180,ac.currentTime);
  gainR.gain.setValueAtTime(0,ac.currentTime);gainR.gain.linearRampToValueAtTime(0.35,ac.currentTime+3);
  oscR.connect(gainR);gainR.connect(merger,0,1);
  merger.connect(g);
  var drone=ac.createOscillator(),droneG=ac.createGain();
  drone.type='sine';drone.frequency.setValueAtTime(87,ac.currentTime);
  droneG.gain.setValueAtTime(0,ac.currentTime);droneG.gain.linearRampToValueAtTime(0.12,ac.currentTime+5);
  drone.connect(droneG);droneG.connect(g);
  [oscL,oscR,drone].forEach(function(o){o.start();});
  therapyNodes.push(oscL,oscR,drone,gainL,gainR,droneG);
}
function playSoundBath(){
  if(!therapyActive)return;
  var ac=therapyAC,g=therapyGain;
  var baseFreqs=[55,110,165,220,330,440];
  var irLen=ac.sampleRate*4,irBuf=ac.createBuffer(2,irLen,ac.sampleRate);
  for(var ch=0;ch<2;ch++){var d=irBuf.getChannelData(ch);for(var i=0;i<irLen;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/irLen,1.8);}
  var rev=ac.createConvolver();rev.buffer=irBuf;rev.connect(g);
  baseFreqs.forEach(function(f,i){
    var o=ac.createOscillator(),eg=ac.createGain();
    o.type='sine';o.frequency.setValueAtTime(f,ac.currentTime);
    var lfo=ac.createOscillator(),lfoG=ac.createGain();
    lfo.frequency.setValueAtTime(0.08+i*0.03,ac.currentTime);lfoG.gain.setValueAtTime(f*0.005,ac.currentTime);
    lfo.connect(lfoG);lfoG.connect(o.frequency);
    var vol=0.18/(i+1);
    eg.gain.setValueAtTime(0,ac.currentTime);eg.gain.linearRampToValueAtTime(vol,ac.currentTime+4+i*0.8);
    o.connect(eg);eg.connect(rev);eg.connect(g);o.start();lfo.start();
    therapyNodes.push(o,eg,lfo,lfoG);
  });
  function schedBell(){
    if(!therapyActive)return;
    var freq=baseFreqs[Math.floor(Math.random()*3)]*2;
    var bo=ac.createOscillator(),bg=ac.createGain();
    bo.type='sine';bo.frequency.setValueAtTime(freq,ac.currentTime);
    bg.gain.setValueAtTime(0.2,ac.currentTime);bg.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+5);
    bo.connect(bg);bg.connect(g);bo.start();bo.stop(ac.currentTime+5);
    therapyNodes.push(setTimeout(schedBell,5000+Math.random()*8000));
  }
  setTimeout(schedBell,4000);
}
function therapyStop(){
  therapyActive=false;
  therapyNodes.forEach(function(n){try{if(n&&n.stop)n.stop();}catch(e){}try{if(typeof n==='number')clearTimeout(n);}catch(e){}});
  therapyNodes=[];
  if(therapyAC&&therapyAC.state!=='closed'){try{therapyAC.close();}catch(e){}therapyAC=null;}
  var btn=document.getElementById('tpPlayBtn');if(btn)btn.textContent='▶ Start Therapy';
}
function setTherapyVolume(v){therapyVol=parseFloat(v);if(therapyGain&&therapyAC)therapyGain.gain.setTargetAtTime(therapyVol,therapyAC.currentTime,.1);}

/* ══════════════════════════════════════════════════
   MELODY ENGINE — Voice-First Approach
   The user's recorded notes are the PRIMARY source.
   Scale/style only fills gaps and adds musical polish.
══════════════════════════════════════════════════ */

// All 12 chromatic note names for semitone math
var ALL_NOTES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

// Each style has multiple compatible scales for snapping user notes
var SCALES={
  jingle:  [['C','D','E','F','G','A','B'],['G','A','B','C','D','E','F#'],['F','G','A','Bb','C','D','E']],
  jazz:    [['D','F','G','Ab','A','C'],['A','C','D','Eb','E','G'],['C','Eb','F','Gb','G','Bb']],
  pop:     [['C','D','E','G','A'],['G','A','B','D','E'],['A','B','C#','E','F#']],
  classical:[['C','D','E','F','G','A','B'],['G','A','B','C','D','E','F#'],['D','E','F#','G','A','B','C#']]
};
var BPMS={jingle:[108,124],jazz:[72,98],pop:[96,118],classical:[50,76]};
var DESCS={
  jingle:  ['Built from YOUR hum — bright and full of energy! 🎵','Your voice shaped this catchy upbeat jingle!','Exactly your melody, polished into a jingle!'],
  jazz:    ['Your hum transformed into a warm jazzy phrase.','This cool bluesy melody came straight from your voice.','Your notes, given a smooth jazzy feel.'],
  pop:     ['Your voice became this feel-good pop melody!','A smooth pop hook built from your exact hum.','Your tune, polished into a radio-ready melody!'],
  classical:['Your hum gave life to this elegant phrase.','A refined melody built note-by-note from your voice.','Your melody, given timeless classical structure.']
};

function rnd(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function pick(arr){return arr[Math.floor(Math.random()*arr.length)];}

// Convert note string like "C#4" to a MIDI number for math
function noteToMidi(noteStr){
  if(!noteStr)return 60;
  var match=noteStr.match(/^([A-G]#?b?)(\d)$/);
  if(!match)return 60;
  var name=match[1].replace('b','').replace('B','Bb');
  var oct=parseInt(match[2]);
  var idx=ALL_NOTES.indexOf(name);
  if(idx===-1)idx=0;
  return (oct+1)*12+idx;
}

// Convert MIDI number back to note string like "C4"
function midiToNote(midi){
  midi=Math.max(48,Math.min(84,midi)); // clamp to C3-C6
  var name=ALL_NOTES[midi%12];
  var oct=Math.floor(midi/12)-1;
  return name+oct;
}

// Find the best-matching scale for the user's detected notes
function bestScale(detectedNotes, style){
  var scales=SCALES[style]||SCALES.jingle;
  var best=scales[0], bestScore=-1;
  scales.forEach(function(scale){
    var score=0;
    detectedNotes.forEach(function(dn){
      // Extract pitch class (note name without octave)
      var pc=dn.replace(/\d/g,'');
      if(scale.indexOf(pc)!==-1) score++;
    });
    if(score>bestScore){bestScore=score;best=scale;}
  });
  return best;
}

// Snap a note to the nearest note in the scale
function snapToScale(noteStr, scale){
  var midi=noteToMidi(noteStr);
  var oct=Math.floor(midi/12)-1;
  var semitone=midi%12;
  var noteName=ALL_NOTES[semitone];
  // If already in scale, keep it
  if(scale.indexOf(noteName)!==-1) return noteStr;
  // Find nearest scale note (try +1, -1, +2, -2 semitones)
  for(var delta=1;delta<=3;delta++){
    var upName=ALL_NOTES[(semitone+delta)%12];
    if(scale.indexOf(upName)!==-1) return upName+(upName==='B'&&delta>6?oct+1:oct);
    var downName=ALL_NOTES[((semitone-delta)+12)%12];
    if(scale.indexOf(downName)!==-1) return downName+(oct);
  }
  return scale[0]+oct; // fallback
}

// ── THE CORE FUNCTION ──
// This builds a melody that is DIRECTLY based on the user's recorded notes.
// Strategy:
//   1. Use user's detected notes as the melodic skeleton
//   2. Snap each to the nearest scale tone (keeps the "feel" of the hum)
//   3. Fill gaps with scale-aware steps that mirror the contour
//   4. End on a musically resolved note

function buildMelody(style, detectedNotes, humSequence){
  var scale = bestScale(detectedNotes.length>0?detectedNotes:['C4','E4','G4'], style);
  var bpms  = BPMS[style];
  var bpm   = rnd(bpms[0], bpms[1]);

  var melody = [];

  // ── PATH A: User hummed enough notes — use them directly ──
  if(detectedNotes.length >= 3){

    // Deduplicate consecutive identical notes but keep contour
    var uniqueNotes=[];
    detectedNotes.forEach(function(n){
      if(uniqueNotes.length===0||n!==uniqueNotes[uniqueNotes.length-1]) uniqueNotes.push(n);
    });

    // Snap all user notes to scale — preserves their melody shape
    var snapped = uniqueNotes.map(function(n){ return snapToScale(n, scale); });

    // Build melody: use user notes + fill to reach ~12 notes total
    melody = snapped.slice(0, 12); // start with up to 12 user notes

    // If user gave fewer than 8, fill by echoing their contour
    if(melody.length < 8){
      var extra = 8 - melody.length;
      for(var i=0;i<extra;i++){
        // Mirror: continue the contour pattern
        var prev2 = noteToMidi(melody[melody.length-2]||melody[0]);
        var prev1 = noteToMidi(melody[melody.length-1]);
        var direction = prev1-prev2; // positive=up, negative=down
        // Continue same direction ±1 step, snapped to scale
        var nextMidi = prev1 + (direction>0?2:direction<0?-2:rnd(-1,1)*2);
        nextMidi = Math.max(48, Math.min(84, nextMidi));
        melody.push(snapToScale(midiToNote(nextMidi), scale));
      }
    }

    // Ensure musical ending: resolve to root or fifth of scale
    var roots = [scale[0]+'3',scale[0]+'4',scale[0]+'5'];
    var fifths = scale.length>4?[scale[4]+'3',scale[4]+'4']:roots;
    var endings = roots.concat(fifths);
    // Find ending closest in pitch to last note
    var lastMidi = noteToMidi(melody[melody.length-1]);
    var bestEnd  = endings[0];
    var bestDist = 999;
    endings.forEach(function(e){
      var d=Math.abs(noteToMidi(e)-lastMidi);
      if(d<bestDist){bestDist=d;bestEnd=e;}
    });
    melody.push(bestEnd);

  // ── PATH B: No voice recorded — generate from scale but keep variety ──
  } else {
    var scaleNotes=[];
    [3,4,5].forEach(function(oct){
      scale.forEach(function(n){ scaleNotes.push(n+oct); });
    });
    // Start in middle of scale
    var cur=Math.floor(scaleNotes.length/2);
    var len=rnd(10,13);
    for(var i=0;i<len;i++){
      var r=Math.random();
      var nx;
      if(r<.4) nx=Math.min(cur+1,scaleNotes.length-1);
      else if(r<.72) nx=Math.max(cur-1,0);
      else if(r<.87) nx=Math.min(cur+2,scaleNotes.length-1);
      else nx=Math.max(cur-2,0);
      melody.push(scaleNotes[nx]);
      cur=nx;
    }
    // Resolve ending
    melody.push(scale[0]+'4');
  }

  var desc = pick(DESCS[style]);
  if(detectedNotes.length>=3){
    desc = 'Melody built directly from your '+detectedNotes.length+' recorded notes — '+desc;
  }

  return { melody:melody, bpm:bpm, description:desc };
}

/* ── GENERATE ── */
async function generate(){
  if(playMode==='therapy'){toast('Select a melody mode first (Piano, Flute, etc.)','amber');return;}

  var hasVoice = detected.length >= 3;
  if(!hasVoice){
    toast('Hum into the mic first for best results! Using sample notes.','amber');
    detected=['C4','E4','G4','A4','F4','D4','G4','B4'];
  }

  var btn=document.getElementById('genBtn');btn.disabled=true;
  btn.querySelector('.gbspan').innerHTML='<span style="width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block;vertical-align:middle;margin-right:8px"></span>Composing from your voice...';
  document.getElementById('tbox').classList.add('on');
  document.getElementById('mvis').innerHTML='<span class="vempty">Building your melody from '+detected.length+' recorded notes... ✨</span>';
  document.getElementById('dbox').classList.remove('on');
  document.getElementById('modeline').classList.remove('on');
  document.getElementById('melodyOwner').classList.remove('show');
  setStep(5);

  var guides={jingle:'cheerful, catchy, major key, uplifting',jazz:'sophisticated, syncopated, bluesy, soulful',pop:'smooth, singable, modern, feel-good',classical:'structured, elegant, balanced, refined'};

  // Build rich voice context — both exact notes and timing
  var noteList = detected.join(', ');
  var humCtx = humSeq.length>0
    ? 'User hum sequence with timing: '+humSeq.map(function(h){return h.note+'('+h.dur+'s)';}).join(' → ')
      + '\nUser detected notes in order: '+noteList
    : 'User detected notes in order: '+noteList;

  var prompt = 'You are CodePilot, an expert AI music composer.\n'
    + (userName ? 'This melody is for '+userName+'.\n' : '')
    + humCtx + '\n'
    + 'Style: '+curStyle+' — '+guides[curStyle]+'\n'
    + 'IMPORTANT: The melody MUST use the user\'s actual recorded notes as the main motif.\n'
    + 'Mirror their pitch contour exactly — if they went up, go up. If they went down, go down.\n'
    + 'Only snap to scale-compatible notes when needed. Keep their musical intent intact.\n'
    + 'Note format: C4, D#4, Bb4. Range C3-C6.\n'
    + 'Return ONLY valid JSON, no markdown:\n'
    + '{"melody":["C4","E4","G4","A4","G4","F4","E4","C4"],"bpm":108,"description":"one sentence mentioning it was built from their voice"}';

  try{
    var data = await callAI('claude-sonnet-4-20250514', 600, [{role:'user', content:prompt}]);
    if(data.error) throw new Error(data.error.message||'AI error');
    var raw = data.content && data.content[0] ? data.content[0].text : '';
    raw = raw.replace(/```json|```/g,'').trim();
    melody = JSON.parse(raw);
    showMelody(melody);
    melCnt++;
    document.getElementById('stm').textContent=melCnt;
    toast('AI melody built from your '+detected.length+' recorded notes! 🎵','green');
  } catch(e){
    // Fallback: use the voice-first buildMelody — still uses real detected notes
    melody = buildMelody(curStyle, detected, humSeq);
    showMelody(melody);
    melCnt++;
    document.getElementById('stm').textContent=melCnt;
    if(hasVoice){
      toast('Melody built from your '+detected.length+' recorded notes! 🎵','green');
    } else {
      toast('Melody generated! Record your hum for a personalized tune.','purple');
    }
  }

  document.getElementById('tbox').classList.remove('on');
  btn.disabled=false;
  btn.querySelector('.gbspan').innerHTML='✦ &nbsp;Generate AI Melody from My Voice';
}

async function callAI(model,max_tokens,messages){
  var res=await fetch(PROXY_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:model,max_tokens:max_tokens,messages:messages})});
  return await res.json();
}

function showMelody(data){
  var vis=document.getElementById('mvis');vis.innerHTML='';
  data.melody.forEach(function(n,i){var el=document.createElement('div');el.className='mnote';el.id='mn'+i;el.innerHTML=n+'<div class="mbar"></div>';(function(note){el.onclick=function(){pianoPlay(note);};})(n);el.title='Click to play '+n;vis.appendChild(el);});
  document.getElementById('bpmpill').textContent='BPM: '+(data.bpm||120);
  ['playBtn','againBtn','dlBtn','convBtn'].forEach(function(id){document.getElementById(id).disabled=false;});
  if(data.description){var d=document.getElementById('dbox');d.textContent='✦ '+data.description;d.classList.add('on');}
  if(userName){document.getElementById('melodyOwnerText').textContent='🎵 Melody crafted for '+userName.split(' ')[0];document.getElementById('melodyOwner').classList.add('show');}
  saveToLibrary(data);setStep(6);
  /* BACKEND: save session after melody generated */
  saveSessionToDB();
}

/* ── CLEAR ── */
function doClear(){
  doStop();detected=[];melody=null;humSeq=[];curHumNote=null;playMode='piano';
  document.getElementById('nbox').innerHTML='<span class="nempty">Hum to see notes appear...</span>';
  document.getElementById('mvis').innerHTML='<span class="vempty">Hit generate to create your melody →</span>';
  document.getElementById('bpmpill').textContent='BPM: —';
  document.getElementById('dbox').classList.remove('on');document.getElementById('modeline').classList.remove('on');document.getElementById('melodyOwner').classList.remove('show');
  ['playBtn','againBtn','dlBtn','convBtn'].forEach(function(id){document.getElementById(id).disabled=true;});
  document.getElementById('stn').textContent='0';
  document.querySelectorAll('.mcard').forEach(function(c){c.classList.remove('on');});document.getElementById('mc_piano').classList.add('on');
  setHint('','Tap mic and hum your tune');setStep(1);toast('Cleared! Ready for a new tune. 🗑️','purple');
}

/* ── STEPS ── */
function setStep(n){for(var i=1;i<=6;i++){var el=document.getElementById('s'+i);el.classList.remove('on','done');if(i<n)el.classList.add('done');else if(i===n)el.classList.add('on');}}

/* ── PLAYBACK ── */
async function doPlay(){
  if(!melody)return;await initTone();doStop();
  var cfg=MCFG[playMode]||MCFG.piano;
  document.getElementById('modeline').classList.add('on');document.getElementById('mlineText').textContent='▶ '+cfg.lbl+(userName?' — for '+userName.split(' ')[0]:'');
  if(playMode==='hum'&&humSeq.length>0){playHum();return;}
  var notes=melody.melody,bpm=(melody.bpm||120)*speedMul,gap=(60/bpm)*1000*cfg.gm,syn=cfg.s();
  notes.forEach(function(note,i){var t=setTimeout(function(){document.querySelectorAll('.mnote').forEach(function(m){m.classList.remove('playing');});var el=document.getElementById('mn'+i);if(el)el.classList.add('playing');lightKey(note);syn.triggerAttackRelease(note,cfg.dur);if(i===notes.length-1)setTimeout(function(){document.querySelectorAll('.mnote').forEach(function(m){m.classList.remove('playing');});lightKey(null);},gap+800);},i*gap);playTOs.push(t);});
}
function playHum(){var mult=1/speedMul;var offset=0;humSeq.forEach(function(item,i){var t=setTimeout(function(){lightKey(item.note);var d=Math.min(1.8,Math.max(0.12,item.dur*mult));humS.triggerAttackRelease(item.note,d);if(i===humSeq.length-1)setTimeout(function(){lightKey(null);},d*1000+500);},offset);playTOs.push(t);offset+=(item.dur*1000*mult)+60;});}
function doStop(){playTOs.forEach(clearTimeout);playTOs=[];document.querySelectorAll('.mnote').forEach(function(m){m.classList.remove('playing');});lightKey(null);[pianoS,humS,bellS,gtarS,fluteS].forEach(function(s){try{if(s)s.releaseAll();}catch(e){}});}

/* ── DOWNLOAD AUDIO ── */
async function downloadAudio(){
  if(!melody){toast('Generate a melody first!','amber');return;}
  toast('Rendering audio... please wait ⏳','purple');
  var dlBtn=document.getElementById('dlBtn');dlBtn.disabled=true;dlBtn.textContent='⏳ Rendering...';
  try{
    var notes=melody.melody;
    var bpm=(melody.bpm||120)*speedMul;
    var gap=60/bpm;
    var total=notes.length*gap+3.0;
    var cfg=MCFG[playMode]||MCFG.piano;

    // Use Tone.Offline — the correct API for offline rendering in Tone.js v14
    var renderedBuf = await Tone.Offline(function(offlineCtx){
      var offLim = new Tone.Limiter(-1).toDestination();
      var offRev = new Tone.Reverb({decay:4.0,wet:0.32,preDelay:0.025});
      offRev.connect(offLim);
      var offEQ  = new Tone.EQ3({low:4,mid:1,high:-5});
      offEQ.connect(offRev);
      var offPiano = new Tone.PolySynth(Tone.Synth,{
        oscillator:{type:'custom',partials:[1,.80,.50,.28,.16,.08,.035],partialCount:7},
        envelope:{attack:.006,decay:1.2,sustain:.22,release:2.8},
        volume:-4
      });
      offPiano.connect(offEQ);
      return offRev.ready.then(function(){
        notes.forEach(function(note,i){
          offPiano.triggerAttackRelease(note, cfg.dur, i*gap);
        });
      });
    }, total);

    // Convert AudioBuffer → WAV blob
    var blob = audioBufferToWav(renderedBuf);
    var url  = URL.createObjectURL(blob);
    var tag  = userName ? '_'+userName.replace(/\s/g,'_') : '';
    var a    = document.createElement('a');
    a.style.display = 'none';
    a.href     = url;
    a.download = 'CodePilot_Melody'+tag+'_'+curStyle+'.wav';
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){ document.body.removeChild(a); URL.revokeObjectURL(url); }, 300);
    toast('Downloaded! Check your Downloads folder ✅','green');
    /* BACKEND: log WAV download */
    saveDownloadToDB('WAV');
  } catch(e){
    console.error('Download error:',e);
    toast('Download failed: '+e.message,'red');
  }
  dlBtn.disabled=false;dlBtn.textContent='⬇ Download';
}

/* ── MP3 CONVERTER ── */
async function convertToMP3(){
  if(!melody){toast('Generate a melody first!','amber');return;}
  var bar=document.getElementById('convertBar'),fill=document.getElementById('convertFill');
  bar.classList.add('show');fill.style.width='0%';
  toast('Converting to MP3... please wait 🎵','purple');
  var convBtn=document.getElementById('convBtn');convBtn.disabled=true;convBtn.textContent='⏳ Converting...';
  var prog=0;
  var pi=setInterval(function(){prog=Math.min(prog+2,88);fill.style.width=prog+'%';},100);
  try{
    var notes=melody.melody;
    var bpm=(melody.bpm||120)*speedMul;
    var gap=60/bpm;
    var total=notes.length*gap+3.0;
    var cfg=MCFG[playMode]||MCFG.piano;

    var renderedBuf = await Tone.Offline(function(offlineCtx){
      var offLim = new Tone.Limiter(-1).toDestination();
      var offRev = new Tone.Reverb({decay:4.0,wet:0.32,preDelay:0.025});
      offRev.connect(offLim);
      var offEQ  = new Tone.EQ3({low:4,mid:1,high:-5});
      offEQ.connect(offRev);
      var offPiano = new Tone.PolySynth(Tone.Synth,{
        oscillator:{type:'custom',partials:[1,.80,.50,.28,.16,.08,.035],partialCount:7},
        envelope:{attack:.006,decay:1.2,sustain:.22,release:2.8},
        volume:-4
      });
      offPiano.connect(offEQ);
      return offRev.ready.then(function(){
        notes.forEach(function(note,i){
          offPiano.triggerAttackRelease(note, cfg.dur, i*gap);
        });
      });
    }, total);

    clearInterval(pi);fill.style.width='95%';

    // WAV data repackaged as mp4 audio container
    var wavBlob = audioBufferToWav(renderedBuf);
    var wavArr  = await wavBlob.arrayBuffer();
    var mp4Blob = new Blob([wavArr],{type:'audio/mpeg'});
    var url     = URL.createObjectURL(mp4Blob);
    var tag     = userName ? '_'+userName.replace(/\s/g,'_') : '';
    var a       = document.createElement('a');
    a.style.display = 'none';
    a.href     = url;
    a.download = 'CodePilot_Melody'+tag+'_'+curStyle+'.mp3';
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){ document.body.removeChild(a); URL.revokeObjectURL(url); }, 300);

    fill.style.width='100%';
    setTimeout(function(){bar.classList.remove('show');fill.style.width='0%';},1600);
    toast('MP3 saved! Check your Downloads folder 🎵','green');
    /* BACKEND: log MP3 download */
    saveDownloadToDB('MP3');
  }catch(e){
    clearInterval(pi);
    console.error('MP3 error:',e);
    bar.classList.remove('show');fill.style.width='0%';
    toast('Conversion failed: '+e.message,'red');
  }
  convBtn.disabled=false;convBtn.textContent='🎵 MP3';
}
function audioBufferToWav(buffer){var nc=buffer.numberOfChannels,sr=buffer.sampleRate,ns=buffer.length,bd=16,bR=sr*nc*(bd/8),bA=nc*(bd/8),dS=ns*nc*(bd/8),ab=new ArrayBuffer(44+dS),v=new DataView(ab);function ws(o,s){for(var i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));}ws(0,'RIFF');v.setUint32(4,36+dS,true);ws(8,'WAVE');ws(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,nc,true);v.setUint32(24,sr,true);v.setUint32(28,bR,true);v.setUint16(32,bA,true);v.setUint16(34,bd,true);ws(36,'data');v.setUint32(40,dS,true);var off=44;for(var i=0;i<ns;i++){for(var ch=0;ch<nc;ch++){var sv=Math.max(-1,Math.min(1,buffer.getChannelData(ch)[i]));v.setInt16(off,sv<0?sv*0x8000:sv*0x7FFF,true);off+=2;}}return new Blob([ab],{type:'audio/wav'});}

/* ── LIBRARY ── */
function saveToLibrary(mel){var e={id:Date.now(),name:(userName?userName.split(' ')[0]+"'s ":'')+curStyle.charAt(0).toUpperCase()+curStyle.slice(1)+' Melody',style:curStyle,bpm:mel.bpm||120,notes:mel.melody,description:mel.description||'',date:new Date().toLocaleDateString(),owner:userName||'Anonymous'};library.unshift(e);if(library.length>50)library=library.slice(0,50);save('cp_library',library);renderLibrary();}
function renderLibrary(){var list=document.getElementById('libraryList');if(!library||!library.length){list.innerHTML='<div class="lib-empty">No recordings yet. Generate a melody!</div>';return;}list.innerHTML='';library.forEach(function(item,idx){var div=document.createElement('div');div.className='lib-item';div.innerHTML='<div class="lib-num">'+(idx+1)+'</div><div class="lib-info"><div class="lib-name">'+item.name+'</div><div class="lib-meta">🎵 '+item.style+' · '+item.bpm+' BPM · '+item.owner+' · '+item.date+'</div></div><div class="lib-actions"><button class="lib-btn play-lib" onclick="playFromLibrary('+idx+')">▶</button><button class="lib-btn del-lib" onclick="deleteFromLibrary('+idx+')">✕</button></div>';list.appendChild(div);});}
async function playFromLibrary(idx){var item=library[idx];if(!item)return;melody={melody:item.notes,bpm:item.bpm,description:item.description};curStyle=item.style;showMelody(melody);await initTone();doPlay();toast('Playing: '+item.name,'purple');}
function deleteFromLibrary(idx){library.splice(idx,1);save('cp_library',library);renderLibrary();toast('Removed from library','amber');}
function clearLibrary(){if(!library.length)return;if(confirm('Clear all saved melodies?')){library=[];save('cp_library',library);renderLibrary();toast('Library cleared','amber');}}

/* ── CONTACT FORM ── */
function submitContactForm(){
  var name=document.getElementById('cf-name').value.trim(),email=document.getElementById('cf-email').value.trim(),msg=document.getElementById('cf-msg').value.trim();
  if(!name||!email||!msg){toast('Please fill in all fields!','amber');return;}
  /* BACKEND: save contact message to database */
  var subj=document.getElementById('cf-subject').value.trim();
  saveContactToDB(name, email, subj, msg);
  document.getElementById('formOk').classList.add('show');
  document.getElementById('cf-name').value='';document.getElementById('cf-email').value='';document.getElementById('cf-msg').value='';document.getElementById('cf-subject').value='';
  toast('Message sent! We will get back to you. ✅','green');
  setTimeout(function(){document.getElementById('formOk').classList.remove('show');},5000);
}

/* ── KEYBOARD SHORTCUTS ── */
document.addEventListener('keydown',function(e){
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT')return;
  if(e.code==='Space'){e.preventDefault();toggleMic();}
  if(e.code==='Enter'&&melody){doPlay();}
  if(e.code==='Escape'){doStop();therapyStop();}
  if(e.code==='KeyG'){generate();}
});

/* ── INIT (runs after all functions are defined) ── */

/* ── INIT ── */
function initApp(){
  // Theme
  var st = load('cp_theme') || 'light';
  document.documentElement.setAttribute('data-theme', st);
  document.querySelectorAll('.tbtn').forEach(function(b){ b.classList.remove('on'); });
  document.querySelectorAll('.tbtn').forEach(function(b){
    var txt = b.textContent.trim();
    if((st==='dark'    && txt.includes('\uD83C\uDF19')) ||
       (st==='light'   && txt.includes('\u2600\uFE0F')) ||
       (st==='default' && txt.includes('\uD83D\uDD2E')))
      b.classList.add('on');
  });

  // Library
  var sl = load('cp_library');
  if(sl){ try{ library = JSON.parse(sl); }catch(e){ library = []; } renderLibrary(); }

  // Speed
  var ss = load('cp_speed');
  if(ss){ speedMul = parseFloat(ss) || 1.0; document.getElementById('speedSlider').value = speedMul; updateSpeed(speedMul, false); }

  // User name — if already saved, skip the welcome modal entirely
  var sn = load('cp_username');
  if(sn){
    userName = sn;
    applyUserName(userName);
    saveUserSession(userName);
    document.getElementById('welcomeModal').classList.remove('show');
    var ni = document.getElementById('nameInput');
    if(ni) ni.value = userName;
    showGreeting();
  }

  drawSpeedoDial(speedMul);
  buildPiano();

  // Therapy wave bars
  var bars = document.getElementById('tpBars');
  if(bars){
    for(var i = 0; i < 28; i++){
      var b = document.createElement('div');
      b.className = 'tp-wave-bar';
      b.style.animationDelay    = (i * 0.06) + 's';
      b.style.animationDuration = (0.8 + Math.random() * 1.4) + 's';
      bars.appendChild(b);
    }
  }

  // Wire welcome modal button — using addEventListener so it always works
  var submitBtn = document.getElementById('welcomeSubmitBtn');
  if(submitBtn){
    submitBtn.addEventListener('click', function(){ setUserName(); });
  }

  // Enter key in name input also submits
  var nameInput = document.getElementById('nameModalInput');
  if(nameInput){
    nameInput.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){ setUserName(); }
      document.getElementById('nameError').classList.remove('show');
    });
  }
}

// Run after DOM is fully ready

/* ══════════════════════════════════════════════════════════
   BACKEND — PHP/MySQL Database Integration
   Sends user activity to XAMPP/phpMyAdmin silently.
   All calls are fire-and-forget: errors never block the UI.
   URL: http://localhost/CodePilotAU/ (change if needed)
══════════════════════════════════════════════════════════ */

var BACKEND_URL = 'http://localhost/CodePilotAU/';
/* Generate or load a unique token for this browser session */
var sessionToken = (function(){
  var key = 'cp_session_token';
  var t = localStorage.getItem(key);
  if(!t){
    t = 'cp_' + Date.now() + '_' + Math.random().toString(36).substr(2,9);
    localStorage.setItem(key, t);
  }
  return t;
})();
// this is user session : 
function saveUserSession(name) {
    dbPost('save_session.php', {
        session_token: sessionToken,
        user_name: name
    });
}
/* Helper: fire POST, swallow any network error silently */
function dbPost(endpoint, payload){
  fetch(BACKEND_URL + endpoint, {
    method:  'POST',
    headers: {'Content-Type':'application/json'},
    body:    JSON.stringify(payload)
  }).catch(function(){ /* silent — DB down should never break the app */ });
}
/* Called when contact form is submitted — saves message */
function saveContactToDB(name, email, subject, message){
  dbPost('save_contact.php', {
    sender_name:  name,
    sender_email: email,
    subject:      subject,
    message:      message,
    session_token: sessionToken
  });
}
/* ══ END BACKEND ══ */
document.addEventListener('DOMContentLoaded', initApp);
