const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const W=canvas.width,H=canvas.height;
const scoreEl=document.getElementById('score'),bestEl=document.getElementById('best');
const startPanel=document.getElementById('startPanel'),overPanel=document.getElementById('gameOverPanel');
const finalScore=document.getElementById('finalScore'),finalBest=document.getElementById('finalBest');
const toast=document.getElementById('toast'),music=document.getElementById('music');
let score=0,best=Number(localStorage.getItem('jumanjiBest')||0),active=false,frame=0,raf=0;
let speed=2.7,gates=[],soundOn=true,audioCtx;
bestEl.textContent=best;
const characterSprite=new Image();characterSprite.src='jumanji-character.png';
const hero={x:300,y:300,vy:0};
function sound(freq=550,duration=.08,type='sine'){if(!soundOn)return;try{audioCtx||=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.045,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+duration)}catch(e){}}
function rect(x,y,w,h,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function drawBackground(){
 const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#25b5f2');sky.addColorStop(.52,'#a8e7f3');sky.addColorStop(1,'#62b94a');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 // soft clouds
 for(let i=0;i<4;i++){let x=(i*270-frame*.25)%(W+180);if(x<0)x+=W+180;ctx.fillStyle='#ffffffcc';ctx.beginPath();ctx.arc(x,105+i%2*30,25,0,7);ctx.arc(x+28,91+i%2*30,34,0,7);ctx.arc(x+65,107+i%2*30,25,0,7);ctx.fill()}
 // hills
 ctx.fillStyle='#5fae68';ctx.beginPath();ctx.moveTo(0,380);ctx.quadraticCurveTo(160,230,330,365);ctx.quadraticCurveTo(500,230,700,360);ctx.quadraticCurveTo(825,265,960,350);ctx.lineTo(960,640);ctx.lineTo(0,640);ctx.fill();
 ctx.fillStyle='#3e934e';ctx.beginPath();ctx.moveTo(0,430);ctx.quadraticCurveTo(200,320,390,430);ctx.quadraticCurveTo(600,300,800,420);ctx.lineTo(960,410);ctx.lineTo(960,640);ctx.lineTo(0,640);ctx.fill();
 // sun
 ctx.fillStyle='#ffe66b';ctx.beginPath();ctx.arc(850,80,36,0,7);ctx.fill();
 // village houses scrolling
 for(let i=0;i<5;i++){let x=(i*220-frame*.45)%(W+180);if(x<-130)x+=W+180;
  ctx.fillStyle='#f0d1a0';ctx.fillRect(x,375,105,82);ctx.fillStyle='#b84c2e';ctx.beginPath();ctx.moveTo(x-10,377);ctx.lineTo(x+52,325);ctx.lineTo(x+115,377);ctx.fill();ctx.fillStyle='#77401f';ctx.fillRect(x+43,412,24,45);ctx.fillStyle='#9ed9e8';ctx.fillRect(x+12,393,19,18);ctx.fillRect(x+76,393,17,18)}
 // paddy fields
 ctx.fillStyle='#53a83d';ctx.fillRect(0,450,W,100);ctx.strokeStyle='#a4d66a';ctx.lineWidth=3;
 for(let i=0;i<14;i++){let x=(i*85-frame*.9)%(W+85);ctx.beginPath();ctx.moveTo(x,450);ctx.lineTo(x-12,500);ctx.stroke()}
 // coconut trees
 for(let i=0;i<5;i++){let x=(i*240-frame*.7)%(W+200);if(x< -30)x+=W+200;ctx.strokeStyle='#79502b';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(x,455);ctx.quadraticCurveTo(x+22,340,x+8,250);ctx.stroke();ctx.fillStyle='#187b3b';for(let j=0;j<7;j++){ctx.save();ctx.translate(x+8,252);ctx.rotate(j*Math.PI/3.5);ctx.beginPath();ctx.ellipse(0,-37,13,48,0,0,7);ctx.fill();ctx.restore()}}
 // buffalo in field
 ctx.fillStyle='#493c32';ctx.beginPath();ctx.ellipse(150,492,45,22,0,0,7);ctx.fill();ctx.beginPath();ctx.arc(191,481,16,0,7);ctx.fill();ctx.strokeStyle='#e9d5a4';ctx.lineWidth=5;ctx.beginPath();ctx.arc(183,466,17,3.4,5.7);ctx.stroke();ctx.beginPath();ctx.arc(201,466,17,3.7,6);ctx.stroke();
 // fence
 ctx.strokeStyle='#87522c';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(0,520);ctx.lineTo(W,520);ctx.moveTo(0,552);ctx.lineTo(W,552);ctx.stroke();for(let x=20;x<W;x+=100){ctx.beginPath();ctx.moveTo(x,505);ctx.lineTo(x,565);ctx.stroke()}
 // dirt foreground
 ctx.fillStyle='#75401f';ctx.fillRect(0,574,W,66);ctx.fillStyle='#b8793b';ctx.fillRect(0,574,W,10);ctx.fillStyle='#4a2818';for(let i=0;i<25;i++){let x=(i*44-frame*1.3)%(W+44);ctx.beginPath();ctx.arc(x,600+(i%3)*12,3,0,7);ctx.fill()}
}
function drawGate(g){
 const gap=g.gap,top=g.center-gap/2,bottom=g.center+gap/2;
 rect(g.x,0,82,top,12,'#299b19');rect(g.x-8,top-19,98,22,8,'#68d52b');
 rect(g.x,bottom,82,H-bottom,12,'#299b19');rect(g.x-8,bottom-3,98,22,8,'#68d52b');
 ctx.fillStyle='#7fe34a';ctx.fillRect(g.x+10,0,9,Math.max(0,top-18));ctx.fillRect(g.x+10,bottom+20,9,Math.max(0,H-bottom-20));
 ctx.strokeStyle='#1d6716';ctx.lineWidth=3;ctx.strokeRect(g.x+2,2,78,Math.max(0,top-4));ctx.strokeRect(g.x+2,bottom+22,78,Math.max(0,H-bottom-24));
}
function drawHero(){
  // Use the exact flying-character artwork supplied by the user.
  // The sprite already includes the real face, red cape, white shirt and blue pants.
  ctx.save();
  const bob = Math.sin(frame * 0.10) * 3;
  const tilt = Math.max(-0.08, Math.min(0.10, hero.vy * 0.008));
  ctx.translate(hero.x, hero.y + bob);
  ctx.rotate(tilt);
  if (characterSprite.complete && characterSprite.naturalWidth) {
    ctx.drawImage(characterSprite, -110, -107, 220, 214);
  }
  ctx.restore();
}
function spawn(){let gap=238;let center=175+Math.random()*260;gates.push({x:W+20,center,gap,passed:false})}
function hit(g){let l=hero.x-72,r=hero.x+72,t=hero.y-52,b=hero.y+52;if(r>g.x&&l<g.x+82)return t<g.center-g.gap/2||b>g.center+g.gap/2;return false}
function jump(){if(!active)return;hero.vy=-5.6;sound(650,.07,'triangle')}
function render(){drawBackground();gates.forEach(drawGate);drawHero();ctx.fillStyle='#fff';ctx.font='1000 19px Nunito';ctx.shadowColor='#333';ctx.shadowBlur=4;ctx.fillText('JUMANJI',22,35);ctx.shadowBlur=0}
function update(){frame++;hero.vy+=.22;hero.y+=hero.vy;if(frame%150===0)spawn();speed=Math.min(3.7,2.7+score*.012);for(let g of gates){g.x-=speed;if(!g.passed&&g.x+82<hero.x){g.passed=true;score++;scoreEl.textContent=score;sound(850,.08);if(score>best){best=score;bestEl.textContent=best;localStorage.setItem('jumanjiBest',best)}}if(hit(g)){endGame();return}}gates=gates.filter(g=>g.x>-110);if(hero.y<112||hero.y>525)endGame()}
function loop(){if(!active)return;update();render();if(active)raf=requestAnimationFrame(loop)}
function start(){cancelAnimationFrame(raf);score=0;gates=[];frame=0;speed=2.7;hero.y=300;hero.vy=0;scoreEl.textContent='0';active=true;startPanel.classList.add('hidden');overPanel.classList.add('hidden');toast.textContent='TAP TO FLY!';if(soundOn){music.currentTime=0;music.play().catch(()=>{toast.textContent='Tap the sound button to start music'});}sound(520,.1);loop()}
function endGame(){if(!active)return;active=false;music.pause();sound(140,.28,'sawtooth');finalScore.textContent=score;finalBest.textContent=best;overPanel.classList.remove('hidden');toast.textContent='AYYOO! TRY AGAIN';render()}
document.getElementById('startBtn').addEventListener('click',start);
document.getElementById('againBtn').addEventListener('click',start);
document.getElementById('soundBtn').addEventListener('click',()=>{soundOn=!soundOn;document.getElementById('soundBtn').textContent=soundOn?'🔊':'🔇';if(!soundOn){music.pause()}else if(active){music.play().catch(()=>{})}});
canvas.addEventListener('pointerdown',e=>{e.preventDefault();jump()});
window.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();jump()}});
render();
