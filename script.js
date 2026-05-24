/* ════════════════════════════════
   CONFETTI ENGINE  ระบบเอฟเฟกต์
════════════════════════════════ */
const canvas = document.getElementById('confettiCanvas'); /* ดึง canvas มาใช้งาน */
const ctx    = canvas.getContext('2d'); /* ใช้ context แบบ 2D สำหรับวาด */
let particles = [], confettiRAF = null;

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas); /* เมื่อขนาดหน้าจอเปลี่ยนให้ resize canvas */
resizeCanvas(); /* เรียกใช้งานครั้งแรก */

/* สุ่มสี confetti */
function randomColor() {
    return ['#ff6b8b','#ff8e53','#ffd93d','#6bcb77','#4d96ff','#c77dff','#ff9ff3','#fff']
           [Math.floor(Math.random()*8)];
}
/* สร้าง confetti */
function spawnConfetti(n=120) {
    for (let i=0;i<n;i++) particles.push({
        x:Math.random()*canvas.width, y:-10,
        w:6+Math.random()*8, h:4+Math.random()*6,
        color:randomColor(), vx:(Math.random()-.5)*5,
        vy:2+Math.random()*4, rot:Math.random()*360,
        rotV:(Math.random()-.5)*8, life:1
    });
}
 /* สร้างดาว */
function spawnStars(n=60) {
    for (let i=0;i<n;i++) {
        const a=Math.random()*Math.PI*2, s=2+Math.random()*6;
        particles.push({
            x:canvas.width/2, y:canvas.height/2,
            w:4+Math.random()*5, h:4+Math.random()*5,
            color:randomColor(), vx:Math.cos(a)*s, vy:Math.sin(a)*s-2,
            rot:0, rotV:(Math.random()-.5)*12, life:1, isStar:true
        });
    }
}
function drawStar(cx,cy,r,color) {
    ctx.save(); ctx.fillStyle=color; ctx.beginPath();
    for (let i=0;i<5;i++) {
        const a=(i*4*Math.PI)/5-Math.PI/2, b=(i*4*Math.PI)/5+(2*Math.PI)/5-Math.PI/2;
        ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a));
        ctx.lineTo(cx+(r*.4)*Math.cos(b),cy+(r*.4)*Math.sin(b));
    }
    ctx.closePath(); ctx.fill(); ctx.restore();
}
/* อนิเมชัน confetti */
function animateConfetti() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles = particles.filter(p=>p.life>0.01);
    particles.forEach(p => {
        p.x+=p.vx; p.y+=p.vy; p.vy+=0.12; p.rot+=p.rotV; p.life-=0.008;
        ctx.save(); ctx.globalAlpha=p.life;
        ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180);
        if (p.isStar) drawStar(0,0,p.w,p.color);
        else { ctx.fillStyle=p.color; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); }
        ctx.restore();
    });
    if (particles.length>0) confettiRAF=requestAnimationFrame(animateConfetti); /* เล่นอนิเมชันต่อ */
    else { ctx.clearRect(0,0,canvas.width,canvas.height); confettiRAF=null; } /* ล้างจอ และรีเช็ต*/
}
/* ยิง confetti ใหญ่ */
function launchConfetti()   { spawnConfetti(160); spawnStars(70); if(!confettiRAF) animateConfetti(); }
/* เอฟเฟกต์ตอนเป่าเทียน */
function launchBlowEffect() { spawnConfetti(80);  spawnStars(40); if(!confettiRAF) animateConfetti(); }

/* ════════════════════════════════
   EMOTIONAL DAMAGE — นับวัน
   🗓️ แก้วันเกิดตรงนี้ (ว/ด/ป)
════════════════════════════════ */
const BIRTHDAY = { day:10, month:6, year:1992 }; // ← แก้ตรงนี้

/* ฟังก์ชันคำนวณจำนวนวันที่เกิดมาแล้ว */
function calcDaysAlive() {
    const birth = new Date(BIRTHDAY.year, BIRTHDAY.month-1, BIRTHDAY.day);
    const now   = new Date();
    const diff  = now - birth;
    const days  = Math.floor(diff / 86400000);
    const years = now.getFullYear() - birth.getFullYear()
                - (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
    const hours = Math.floor((diff % 86400000) / 3600000);

    document.getElementById('daysAlive').textContent = days.toLocaleString('th-TH');
    document.getElementById('daysAliveSub').textContent = `(${years} ปี ${hours} ชั่วโมงนับจากเที่ยงคืน)`;

    const row = document.getElementById('daysAliveEmoji');
    if      (days < 7000)  row.textContent = '🌱 ยังเด็กมากเลย!';
    else if (days < 10000) row.textContent = '✨ หมื่นวันใกล้มาแล้วน้า!';
    else if (days < 15000) row.textContent = '😲 เกิน 10,000 วันแล้ว!!';
    else if (days < 25000) row.textContent = '😅 ก้าวเข้าสู่วัยทอง...';
    else                   row.textContent = '🧓 ประสบการณ์สูงมาก 555';
}

/* ════════════════════════════════
   PAPER FOLD ANIMATION
   แสดง overlay พับกระดาษก่อนบินเข้าโหล
════════════════════════════════ */
/* สีของกระดาษโหลอธิษฐาน */
const wishColors     = ['#4fc3f7','#29b6f6','#80deea','#4dd0e1','#b3e5fc','#00e5ff','#81d4fa','#e0f7fa'];
/* สีของกระดาษโหลคำอวยพร */
const blessingColors = ['#f48fb1','#f06292','#ce93d8','#ba68c8','#ff80ab','#ea80fc','#f8bbd0','#e040fb'];

/**
 * showFoldThenFly(color, onDone)
 * แสดง animation พับกระดาษกลางหน้าจอ (~1.6s)
 * แล้วเรียก onDone() เพื่อ spawn กระดาษบิน
 */

 /* ฟังก์ชันแสดงอนิเมชันพับกระดาษ */
function showFoldThenFly(color, onDone) {
    /* สร้าง overlay */
    const overlay = document.createElement('div');
    overlay.className = 'fold-overlay';

    const stage = document.createElement('div');
    stage.className = 'paper-stage';

    const face = document.createElement('div');
    face.className = 'face';
    face.style.background = color;

    const corner = document.createElement('div');
    corner.className = 'corner';

    const lines = document.createElement('div');
    lines.className = 'lines';
    [100, 100, 60].forEach(w => {
        const l = document.createElement('div');
        l.className = 'line';
        l.style.width = w + '%';
        lines.appendChild(l);
    });

    face.appendChild(corner);
    face.appendChild(lines);
    stage.appendChild(face);
    overlay.appendChild(stage);
    document.body.appendChild(overlay);

    /* หลังจาก animation เสร็จ */
    stage.addEventListener('animationend', () => {
        overlay.remove();
        onDone();
    }, { once: true });
}

/* ════════════════════════════════
   CANDLE BLOW — ปุ่มกด
════════════════════════════════ */
let blowProgress=0, blowInterval=null, candleOut=false;  /* ตัวแปรเก็บสถานะการเป่า */

/* ข้อความหลังเป่าเทียนสำเร็จ */
const blowMessages = [
    "เย้! เทียนดับ! ✨ ความปรารถนาจะสมหวังแน่ๆ!",
];

/* เริ่มเป่าเทียนแบบกดปุ่ม */
function startBlow() {
    if (candleOut) return;
    const btn  = document.getElementById('blowBtn');
    const wrap = document.getElementById('blowProgressWrap');
    const bar  = document.getElementById('blowBar');
    wrap.style.display='block'; btn.textContent='💨 กำลังเป่า...'; btn.disabled=true;
    blowProgress=0;
    blowInterval=setInterval(()=>{
        blowProgress+=4; bar.style.width=Math.min(blowProgress,100)+'%';
        if(blowProgress>=100){ clearInterval(blowInterval); blowDone(); }
    },60);
}

/* ════════════════════════════════
   CANDLE BLOW — ไมค์ (Web Audio)
════════════════════════════════ */
let micStream=null, micCtx=null, micAnalyser=null, micRAF=null; /* ตัวแปรเกี่ยวกับไมโครโฟน */
let micBlowing=false, micBlowAccum=0; /* สถานะการเป่า */
const MIC_THRESHOLD = 0.18;   // ความดังขั้นต่ำที่ถือว่า "เป่า" (0–1)
const MIC_NEEDED    = 8.0;     // เฟรมสะสมที่ต้องเป่าให้ครบ (~0.8 วิ)

async function startMicBlow() {
    if (candleOut) return;
    if (micBlowing) return;

    const statusEl = document.getElementById('micStatus');
    const micWrap  = document.getElementById('micLevelWrap');
    const micBar   = document.getElementById('micLevelBar');
    const btn      = document.getElementById('micBlowBtn');

    statusEl.textContent = '🎙️ กำลังขอสิทธิ์ไมค์...';

    try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio:true, video:false });
    } catch(e) {
        statusEl.textContent = '❌ ไม่สามารถเข้าถึงไมค์ได้'; /* ถ้าเข้าถึงไมค์ไม่ได้ */
        return;
    }

    /* สร้าง audio context */
    micCtx      = new (window.AudioContext||window.webkitAudioContext)();
    const src   = micCtx.createMediaStreamSource(micStream); /* สร้าง source จากไมค์ */
    micAnalyser = micCtx.createAnalyser();
    micAnalyser.fftSize = 256;  /* กำหนดขนาดข้อมูลเสียง */
    src.connect(micAnalyser); /* เชื่อม source กับ analyser */

    const data = new Uint8Array(micAnalyser.frequencyBinCount); /* สร้าง array เก็บข้อมูลเสียง */
    micBlowing = true; micBlowAccum = 0;
    btn.disabled=true; btn.textContent='🎙️ กำลังฟัง...';
    micWrap.style.display='block';
    statusEl.textContent = '💨 เป่าใส่ไมค์เลย!';

     /* ตรวจจับเสียง */
    function detect() {
        micAnalyser.getByteTimeDomainData(data);
        /* คำนวณ RMS (ความดัง) */
        let sum=0;
        data.forEach(v=>{ const n=(v-128)/128; sum+=n*n; });
        const rms = Math.sqrt(sum/data.length);

        /* แสดง level bar */
        micBar.style.width = Math.min(rms*4*100,100)+'%';

        if(rms > MIC_THRESHOLD) micBlowAccum++;
        else if(micBlowAccum>0) micBlowAccum = Math.max(0,micBlowAccum-0.5);

        /* progress overlay บนเปลวเทียน */
        const pct = Math.min(micBlowAccum/MIC_NEEDED,1);
        document.getElementById('flame').style.opacity = (1-pct).toFixed(2);

        if(micBlowAccum >= MIC_NEEDED){
            stopMic();
            blowDone();
        } else {
            micRAF = requestAnimationFrame(detect);
        }
    }
    micRAF = requestAnimationFrame(detect);
}

/* ปิดไมค์ */
function stopMic() {
    if(micRAF)    { cancelAnimationFrame(micRAF); micRAF=null; }
    if(micStream) { micStream.getTracks().forEach(t=>t.stop()); micStream=null; }
    if(micCtx)    { micCtx.close(); micCtx=null; }
    micBlowing=false;
    document.getElementById('micLevelWrap').style.display='none';
    document.getElementById('micStatus').textContent='';
}

/* ── ผลลัพธ์เทียนดับ (ใช้ร่วมกันทั้ง 2 วิธี) ── */
function blowDone() {
    if(candleOut) return;
    candleOut=true;
    stopMic();

    document.getElementById('flame').classList.add('out');
    document.getElementById('flame').style.opacity='';
    document.getElementById('cake').style.background='#e0e0e0';
    document.getElementById('blowSection').style.display='none';

    const msg = document.getElementById('postBlowMsg');
    msg.textContent = blowMessages[Math.floor(Math.random()*blowMessages.length)];
    msg.style.display='block';
    launchBlowEffect();
}

/* ════════════════════════════════
   BLESSINGS 
════════════════════════════════ */
/* รายการคำอวยพร  แก้คำอวยพรตรงนี้ได้เลย*/ 
const blessingsList = [
    "ขอให้ปีนี้เป็นปีที่ใจดีกับพี่ที่สุดนะ! 🌸",
    "คิดเงินให้ได้เงิน คิดทองให้ได้ทอง 💰✨",
    "กินอิ่ม นอนหลับ ไม่ปวดหลัง สุขภาพแข็งแรงๆ 💪",
    "ขอให้โลกนี้มอบรอยยิ้มและความสดใสให้พี่เยอะๆ ให้เท่าความน่ารักของพี่เลย555 💖",
    "เย้! โตขึ้นอีกปีแล้ว ขอให้เป็นผู้ใหญ่ที่มีความสุขที่สุดในโลกนะคนเก่ง 🌟",
    "หวังสิ่งใดไว้  ขอให้สมหวังทุกประการตั้งแต่วันนี้เลยยย เพี้ยง!🎉",
    "ขอให้มีแต่เรื่องดีๆเข้ามาในชีวิต 🎂",
    "ขอให้มีพลังบวกเต็มเปี่ยมในทุกๆ วัน",
    "ขอให้สมองแล่น ไอเดียเจ๋ง เจ้านายรัก ลูกค้าหลง💕",
    "อย่าหาเวลาพักด้วยนะ เป็นห่วง💕"


];

let wishCount = 0; /* ตัวนับจำนวนคำอธิษฐาน */

 /* สร้างกระดาษในโหลคำอวยพร */
function initBlessingJarPapers() {
    const area = document.getElementById('blessingPapersArea');
    if (area.children.length > 0) return;
    for (let i=0; i<12; i++) {
        const p   = document.createElement('div');
        p.className = 'deco-paper';
        const color = blessingColors[i % blessingColors.length];
        const w=11+(i%3)*3, h=8+(i%2)*3, r=(i*31)%36-18;
        p.style.cssText=`width:${w}px;height:${h}px;background:${color};transform:rotate(${r}deg);border-radius:2px;opacity:0.92;position:relative;`;
        p.innerHTML=`<span style="position:absolute;top:0;right:0;width:0;height:0;border-style:solid;border-width:0 4px 4px 0;border-color:transparent rgba(0,0,0,0.2) transparent transparent;"></span>`;
        area.appendChild(p);
    }
}

/* ════════════════════════════════
   PAGE NAV + MUSIC
════════════════════════════════ */
/* เปลี่ยนหน้า */
function nextPage(n) {
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.getElementById('page'+n).classList.add('active');
}

function startExperience() {
    nextPage(1);

    /* เอฟเฟกต์เปิดตัว */
    launchConfetti();
}

/* โน้ตดนตรีและความถี่เสียง */
const NOTE = {G4:392,A4:440,B4:494,C5:523,D5:587,E5:659,F5:698,G5:784};
/* โน้ตเพลง Happy Birthday */
const song  = [
    [NOTE.G4,.375],[NOTE.G4,.125],[NOTE.A4,.5],[NOTE.G4,.5],[NOTE.C5,.5],[NOTE.B4,1],[0,.25],
    [NOTE.G4,.375],[NOTE.G4,.125],[NOTE.A4,.5],[NOTE.G4,.5],[NOTE.D5,.5],[NOTE.C5,1],[0,.25],
    [NOTE.G4,.375],[NOTE.G4,.125],[NOTE.G5,.5],[NOTE.E5,.5],[NOTE.C5,.5],[NOTE.B4,.5],[NOTE.A4,1],[0,.25],
    [NOTE.F5,.375],[NOTE.F5,.125],[NOTE.E5,.5],[NOTE.C5,.5],[NOTE.D5,.5],[NOTE.C5,1.25]
];
let audioCtx=null, musicNodes=[], musicTimeout=null;

 /* เล่นเพลง Happy Birthday */
function playHappyBirthday() {
    if(audioCtx) stopMusic();
    audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    let t = audioCtx.currentTime+0.1;
    /* เล่นเพลงวน */
    function loop() {
        song.forEach(([freq,dur])=>{
            if(!freq){t+=dur;return;}
            const osc=audioCtx.createOscillator(), g=audioCtx.createGain();
            osc.type='sine'; osc.frequency.setValueAtTime(freq,t);
            g.gain.setValueAtTime(0,t);
            g.gain.linearRampToValueAtTime(0.4,t+0.02);
            g.gain.exponentialRampToValueAtTime(0.001,t+dur*0.95);
            osc.connect(g); g.connect(audioCtx.destination);
            osc.start(t); osc.stop(t+dur); musicNodes.push(osc); t+=dur;
        });
        musicTimeout=setTimeout(()=>{ musicNodes=[]; t=audioCtx.currentTime+0.1; loop(); },
                                (t-audioCtx.currentTime+1.5)*1000);
    }
    loop();
}
function stopMusic() {
    clearTimeout(musicTimeout);
    musicNodes.forEach(n=>{try{n.stop();}catch(e){}});
    musicNodes=[];
    if(audioCtx){audioCtx.close();audioCtx=null;}
}

function goToCakePage() {
    nextPage(3);
    initBlessingJarPapers();
    calcDaysAlive();
    playHappyBirthday();
    setTimeout(launchConfetti, 300);
}

/* ════════════════════════════════
   WISH JAR — พับกระดาษก่อนบิน
════════════════════════════════ */
function castWish() {
    const input = document.getElementById('wishText');
    if(!input.value.trim()){ alert("อย่าลืมพิมพ์คำอธิษฐานก่อนส่งน้าาา 🤫"); return; }

    const text  = input.value.trim();
    const color = wishColors[wishCount % wishColors.length];
    input.value = '';

    /* STEP 1: แสดง animation พับกระดาษ (~1.6s) */
    showFoldThenFly(color, () => {
        /* STEP 2: หลังพับเสร็จ → กระดาษบินเข้าโหล */
        const btn = document.getElementById('sendWishBtn');
        const jar = document.getElementById('jarWishContainer');
        const bR  = btn.getBoundingClientRect();
        const jR  = jar.getBoundingClientRect();

        const paper = document.createElement('div');
        paper.className = 'flying-paper';
        paper.style.cssText = `left:${bR.left+bR.width/2}px;top:${bR.top+bR.height/2}px;background:${color};`;
        paper.style.setProperty('--tx',(jR.left+jR.width/2  - bR.left-bR.width/2) +'px');
        paper.style.setProperty('--ty',(jR.top +jR.height/2 - bR.top -bR.height/2)+'px');
        document.body.appendChild(paper);

        /* STEP 3: พอบินถึงโหล → เพิ่มกระดาษพับในโหล */
        setTimeout(()=>{
            paper.remove();
            const area   = document.getElementById('wishPapersArea');
            const inJar  = document.createElement('div');
            inJar.className='folded-paper';
            const r=(Math.random()*30-15).toFixed(1);
            inJar.style.cssText=`background:${color};--r:${r}deg;`;
            inJar.innerHTML=`<span style="position:absolute;top:0;right:0;width:0;height:0;border-style:solid;border-width:0 4px 4px 0;border-color:transparent rgba(0,0,0,0.22) transparent transparent;"></span>`;
            area.appendChild(inJar);

            const papers=area.querySelectorAll('.folded-paper');
            if(papers.length>18) papers[0].remove();

            wishCount++;
            const badge=document.getElementById('wishCounter');
            badge.textContent=wishCount;
            badge.style.animation='none';
            requestAnimationFrame(()=>{ badge.style.animation=''; });
        }, 1000);
    });
}

/* ════════════════════════════════
   BLESSING JAR + POPUP
════════════════════════════════ */
/* ตัวนับลำดับคำอวยพร */
let currentBlessingIndex = 0;

function openBlessingJar() {
    /* แสดงคำอวยพรตามลำดับ */
    document.getElementById('blessingText').innerText =
        blessingsList[currentBlessingIndex];

    document.getElementById('overlay').style.display = 'block';
    document.getElementById('popupBlessing').style.display = 'block';

    /* เลื่อนไปคำถัดไป */
    currentBlessingIndex++;

    /* ถ้าครบทุกอันแล้วให้เริ่มใหม่ */
    if (currentBlessingIndex >= blessingsList.length) {
        currentBlessingIndex = 0;
    }
}
function closePopup() {
    document.getElementById('overlay').style.display='none';
    document.getElementById('popupBlessing').style.display='none';
}