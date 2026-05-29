const TRACKS = [
  { src: "The Neighbourhood - Compass (Official Audio).mp3", title: "Compass", artist: "The Neighbourhood" },
  { src: "Starting Over.mp3", title: "Starting Over", artist: "" },
  { src: "Until I Drown.mp3", title: "Until I Drown", artist: "" },
];

let currentTrack = -1;
let isPlaying = false;
let rafId = null;
let waveShape = null;

const audio = document.getElementById('realAudio');

// --- STARS & DUST ANIMATIONS ---
(function(){
  const layer = document.getElementById('starsLayer');
  if(!layer) return;
  for(let i=0;i<200;i++){
    const s = document.createElement('div'); s.className = 'star';
    const size = Math.random() < .12 ? (Math.random()*2+2) : (Math.random()*1.5+.5);
    const op = Math.random() * .65 + .2;
    s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*72}%;width:${size}px;height:${size}px;opacity:${op};box-shadow:0 0 ${size*2}px ${size*.5}px rgba(255,255,255,${op*.6});animation:starPulse ${Math.random()*4+2.5}s ${Math.random()*6}s ease-in-out infinite alternate;`;
    layer.appendChild(s);
  }
})();

// --- PLAYER LOGIC ---
function initWave() {
  const canvas = document.getElementById('waveCanvas');
  const wrapper = document.getElementById('vnWaves');
  if(!canvas || !wrapper) return;
  
  const W = wrapper.clientWidth;
  const H = wrapper.clientHeight;
  canvas.width = W * window.devicePixelRatio;
  canvas.height = H * window.devicePixelRatio;
  const ctx = canvas.getContext('2d');
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  
  const bars = 44;
  waveShape = Array.from({length:bars}, (_,i) => 
    0.15 + 0.78 * Math.abs(Math.sin(i*.38) * Math.cos(i*.14+.9) * Math.sin(i*.07+.3))
  );
  drawWave(ctx, W, H, 0);
}

function drawWave(ctx, W, H, progress) {
  if(!waveShape) return;
  const bars = waveShape.length, gap = 2.5;
  const bw = (W - gap*(bars-1)) / bars;
  ctx.clearRect(0,0,W,H);
  for(let i=0; i<bars; i++) {
    const bh = Math.max(3, waveShape[i] * H * 0.84);
    const x = i * (bw + gap);
    const y = (H - bh) / 2;
    ctx.fillStyle = (i/bars < progress) ? '#c0405a' : 'rgba(180,100,120,0.22)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x,y,bw,bh,2) : ctx.rect(x,y,bw,bh);
    ctx.fill();
  }
}

function refreshWave() {
  const canvas = document.getElementById('waveCanvas');
  const wrapper = document.getElementById('vnWaves');
  if(!canvas || !wrapper) return;
  const ctx = canvas.getContext('2d');
  const W = wrapper.clientWidth, H = wrapper.clientHeight;
  const progress = audio.duration ? audio.currentTime / audio.duration : 0;
  drawWave(ctx, W, H, progress);
  
  const t = Math.floor(audio.currentTime || 0);
  document.getElementById('vnTime').textContent = Math.floor(t/60) + ':' + (t%60).toString().padStart(2, '0');
}

function selectTrack(idx) {
  audio.pause();
  if(rafId) { cancelAnimationFrame(rafId); rafId = null; }
  
  const hint = document.getElementById('songsHint');
  if(hint) {
    hint.style.opacity = '0';
    setTimeout(() => hint.remove(), 400);
  }

  document.querySelectorAll('.vinyl-disc').forEach(d => d.classList.remove('spinning'));
  document.querySelectorAll('.vinyl').forEach(v => v.classList.remove('active'));
  
  currentTrack = idx;
  audio.src = TRACKS[idx].src;
  document.getElementById('vnTitle').textContent = TRACKS[idx].title;
  document.getElementById('vinyl'+idx).classList.add('active');
  
  audio.play().then(() => {
    isPlaying = true;
    document.getElementById('disc'+idx).classList.add('spinning');
    updatePlayBtn();
    rafId = requestAnimationFrame(function loop() {
      refreshWave();
      if(isPlaying) rafId = requestAnimationFrame(loop);
    });
  });
}

function togglePlay() {
  if(currentTrack < 0) { selectTrack(0); return; }
  if(isPlaying) {
    audio.pause();
    isPlaying = false;
    document.getElementById('disc'+currentTrack).classList.remove('spinning');
  } else {
    audio.play();
    isPlaying = true;
    document.getElementById('disc'+currentTrack).classList.add('spinning');
  }
  updatePlayBtn();
}

function updatePlayBtn() {
  const icon = document.getElementById('playIcon');
  icon.innerHTML = isPlaying 
    ? '<rect x="5" y="3" width="4" height="18"/><rect x="15" y="3" width="4" height="18"/>' 
    : '<polygon points="5,3 19,12 5,21"/>';
}

function openGift() {
  const card = document.getElementById('giftCard');
  const bqSvg = card.querySelector('.bouquet-wrap svg');
  card.querySelector('.bouquet-wrap').style.pointerEvents = 'none';

  // Phase 1: bouquet floats up
  bqSvg.style.transition = 'transform 0.55s cubic-bezier(.22,1,.36,1), filter 0.55s ease';
  bqSvg.style.transform = 'translateY(-42px) scale(1.1)';
  bqSvg.style.filter = 'drop-shadow(0 28px 44px rgba(180,40,80,.5)) brightness(1.1)';

  // Phase 2: ribbon overlay unties
  setTimeout(() => {
    const rect = card.querySelector('.bouquet-wrap').getBoundingClientRect();
    const rib = document.createElement('div');
    rib.id = 'ribOverlay';
    rib.style.cssText = `position:fixed;left:${rect.left+rect.width/2-55}px;top:${rect.top+rect.height*.6}px;width:110px;height:55px;pointer-events:none;z-index:300;overflow:visible;`;
    rib.innerHTML = `<svg viewBox="0 0 110 55" width="110" height="55" overflow="visible" xmlns="http://www.w3.org/2000/svg">
      <path id="bL" d="M55,28 C44,14 18,10 16,22 C14,33 38,33 55,28Z" fill="#f08090" stroke="#9a1830" stroke-width=".9"/>
      <path id="bR" d="M55,28 C66,14 92,10 94,22 C96,33 72,33 55,28Z" fill="#f08090" stroke="#9a1830" stroke-width=".9"/>
      <ellipse id="bK" cx="55" cy="28" rx="6" ry="4.5" fill="#e05070" stroke="#9a1830" stroke-width=".8"/>
      <path id="tL" d="M55,28 C46,35 40,48 34,53" fill="none" stroke="#c0304a" stroke-width="2.2" stroke-linecap="round"/>
      <path id="tR" d="M55,28 C64,35 70,48 76,53" fill="none" stroke="#c0304a" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`;
    document.body.appendChild(rib);
    let t=0;
    const ri = setInterval(()=>{
      t+=16; const p=Math.min(t/480,1); const e=1-Math.pow(1-p,3);
      const bL=rib.querySelector('#bL'), bR=rib.querySelector('#bR'), bK=rib.querySelector('#bK');
      const tL=rib.querySelector('#tL'), tR=rib.querySelector('#tR');
      bL.style.transform=`translate(${e*26}px,${e*7}px) scale(${1-e*.92})`; bL.style.transformOrigin='55px 28px';
      bR.style.transform=`translate(${-e*26}px,${e*7}px) scale(${1-e*.92})`; bR.style.transformOrigin='55px 28px';
      bK.style.opacity=1-e;
      tL.setAttribute('d',`M55,28 C${46-e*38},${35+e*18} ${40-e*55},${48+e*8} ${34-e*74},${53+e*18}`);
      tR.setAttribute('d',`M55,28 C${64+e*38},${35+e*18} ${70+e*55},${48+e*8} ${76+e*74},${53+e*18}`);
      if(p>=1) clearInterval(ri);
    },16);
  }, 380);

  // Phase 3: petal burst
  setTimeout(()=>{
    const cx=window.innerWidth/2, cy=window.innerHeight/2-50;
    const cols=['#f87090','#ffb8c8','#e04060','#ffd0dc','#ff9060','#ffc8a0','#d060c0','#f0a0d0','#a060d0','#c8a0f0','#f0c040','#ffe090','#ff6080','#ffaabb','#e868a0','#ffc0e0','#ff80c0','#ffd8f0','#c040e0','#e8a0ff','#60c0ff','#b0e8ff','#ff4468','#ff88aa'];
    const ems=['🌸','🌺','💐','🌹','🌷','💫','✨','🌼','🌻','✿','🌸','🌺','🌷','💐','🌹','🌸','✨','💫','🌼','🌺','🌸','🌷','🌹','💐','✿','🌻','🌸','🌺','💫','🌷'];
    for(let i=0;i<100;i++){
      const ang=(i/100)*360+(Math.random()-0.5)*8, dist=80+Math.random()*280;
      const col=cols[i%cols.length], sz=9+Math.random()*16, dur=0.75+Math.random()*.65, del=Math.random()*.16;
      const tx=Math.cos(ang*Math.PI/180)*dist, ty=Math.sin(ang*Math.PI/180)*dist-75;
      const st=document.createElement('style');
      st.textContent=`@keyframes pF${i}{0%{opacity:1;transform:translate(-50%,-50%) rotate(${ang}deg) scale(1)}70%{opacity:.9}100%{opacity:0;transform:translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px)) rotate(${ang+200}deg) scale(.1)}}`;
      document.head.appendChild(st);
      const p=document.createElement('div');
      p.style.cssText=`position:fixed;left:${cx}px;top:${cy}px;width:${sz}px;height:${sz*1.65}px;background:${col};border-radius:50% 50% 50% 50%/70% 70% 30% 30%;pointer-events:none;z-index:500;animation:pF${i} ${dur}s ${del}s cubic-bezier(.2,.8,.3,1) forwards;`;
      document.body.appendChild(p);
      setTimeout(()=>{p.remove();st.remove();},(dur+del)*1000+200);
    }
    ems.forEach((em,i)=>{
      const ang=(i/ems.length)*360+(Math.random()-0.5)*12, dist=70+Math.random()*220;
      const tx=Math.cos(ang*Math.PI/180)*dist, ty=Math.sin(ang*Math.PI/180)*dist-95;
      const dur=.95+Math.random()*.55, del=.04+Math.random()*.18;
      const st2=document.createElement('style');
      st2.textContent=`@keyframes eF${i}{0%{opacity:1;transform:translate(-50%,-50%) scale(0) rotate(0deg)}30%{opacity:1;transform:translate(calc(-50% + ${tx*.3}px),calc(-50% + ${ty*.3}px)) scale(1.3) rotate(${15-i*4}deg)}100%{opacity:0;transform:translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px)) scale(.3) rotate(${180+i*20}deg)}}`;
      document.head.appendChild(st2);
      const fl=document.createElement('div');
      fl.style.cssText=`position:fixed;left:${cx}px;top:${cy}px;font-size:${1.1+Math.random()*.7}rem;pointer-events:none;z-index:501;animation:eF${i} ${dur}s ${del}s ease-out forwards;`;
      fl.textContent=em;
      document.body.appendChild(fl);
      setTimeout(()=>{fl.remove();st2.remove();},(dur+del)*1000+200);
    });
    const rng=document.createElement('div');
    const rSt=document.createElement('style');
    rSt.textContent=`@keyframes sw{0%{width:0;height:0;opacity:.85}100%{width:680px;height:680px;opacity:0;border-width:1px}}`;
    document.head.appendChild(rSt);
    rng.style.cssText=`position:fixed;left:${cx}px;top:${cy}px;border-radius:50%;border:3px solid rgba(240,120,160,.65);pointer-events:none;z-index:499;transform:translate(-50%,-50%);animation:sw .85s ease-out forwards;`;
    document.body.appendChild(rng);
    setTimeout(()=>{rng.remove();rSt.remove();document.getElementById('ribOverlay')?.remove();},900);
  }, 860);

  // Phase 4: card out, reveal in
  setTimeout(()=>{ card.classList.add('out'); }, 1050);
  setTimeout(()=>{
    document.getElementById('revealWrap').classList.add('in');
    initWave();
    setTimeout(()=>{
      document.querySelectorAll('.card-bouquet-left,.card-bouquet-right').forEach(b=>b.classList.add('risen'));
    }, 100);
  }, 1550);
}

// --- PHOTO INTERACTIONS ---
document.querySelectorAll('.sphoto-wrap').forEach(wrap => {
  wrap.addEventListener('click', function() {
    // Prevent spam-clicking the animation
    if(this.style.pointerEvents === 'none') return;
    this.style.pointerEvents = 'none';
    
    // Replay the pull animation cleanly
    this.classList.remove('pulled');
    void this.offsetWidth; // Trigger DOM reflow
    this.classList.add('pulled');
    
    if(!this.classList.contains('flipped')) {
      setTimeout(() => this.classList.add('flipped'), 250); // Flips mid-pull
    } else {
      setTimeout(() => this.classList.remove('flipped'), 250); // Un-flips mid-pull
    }
    
    setTimeout(() => {
      this.classList.remove('pulled'); // Clean up class after animation ends
      this.style.pointerEvents = 'auto';
    }, 600);
  });
});