// --- 元素 ---
const player = document.getElementById('player');
const item = document.getElementById('item');
const enemy = document.getElementById('enemy');
const powerup = document.getElementById('powerup');
const gameArea = document.getElementById('gameArea');
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScore = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const startPage = document.getElementById('startPage');
const startBtn = document.getElementById('startBtn');
const joystick = document.getElementById('joystick');
const joystickContainer = document.getElementById('joystickContainer');
const bgMusic = document.getElementById('bgMusic');
const muteBtn = document.getElementById('muteBtn');

// --- 遊戲變數 ---
const stepBase = 5;
let position = { x: 160, y: 300 };
let enemyPos = { x: 160, y: 50 };
let score = 0;
let timeLeft = 60;
let gameOver = false;
let enemyFrozen = false;
let frozenTimeout = null;
let keysPressed = {};
let joystickDir = { x:0, y:0 };
let dragging = false;
let origin = { x:0, y:0 };
let isMuted = false;
const maxDistance = 40;

// --- 幫助函式 ---
function checkCollision(rect1, rect2) {
  return rect1.left < rect2.right &&
         rect1.right > rect2.left &&
         rect1.top < rect2.bottom &&
         rect1.bottom > rect2.top;
}

function canMove() {
  return !gameOver;
}

// --- 收集物與道具 ---
function spawnItem() {
  const x = Math.floor(Math.random() * (gameArea.clientWidth - item.offsetWidth));
  const y = Math.floor(Math.random() * (gameArea.clientHeight - item.offsetHeight));
  item.style.left = x + 'px';
  item.style.top = y + 'px';

  if(Math.random() < 0.3) {
    const px = Math.floor(Math.random() * (gameArea.clientWidth - powerup.offsetWidth));
    const py = Math.floor(Math.random() * (gameArea.clientHeight - powerup.offsetHeight));
    powerup.style.left = px + 'px';
    powerup.style.top = py + 'px';
    powerup.style.display = 'block';
  } else {
    powerup.style.display = 'none';
  }
}

function checkPowerup() {
  if(powerup.style.display==='block' && checkCollision(player.getBoundingClientRect(), powerup.getBoundingClientRect())){
    powerup.style.display='none';
    enemyFrozen = true;
    enemy.classList.add('shake');
    clearTimeout(frozenTimeout);
    frozenTimeout = setTimeout(()=>{
      enemyFrozen=false;
      enemy.classList.remove('shake');
    },3000);
  }
}

// --- 敵人追蹤 ---
function updateEnemy(speed) {
  if(gameOver || enemyFrozen) return;
  const dx = position.x - enemyPos.x;
  const dy = position.y - enemyPos.y;
  const dist = Math.sqrt(dx*dx+dy*dy);
  if(dist>0){
    enemyPos.x += (dx/dist)*speed;
    enemyPos.y += (dy/dist)*speed;
  }
  enemy.style.left = enemyPos.x+'px';
  enemy.style.top = enemyPos.y+'px';
  if(checkCollision(enemy.getBoundingClientRect(), player.getBoundingClientRect())){
    showGameOver();
  }
}

// --- 玩家更新 ---
function updatePosition() {
  if(!canMove()) return;

  const playerSpeed = stepBase + Math.floor(score/3);
  const enemySpeed = 2 + Math.floor(score/3);

  // 鍵盤
  if(keysPressed['ArrowUp']||keysPressed['w']||keysPressed['W']) position.y -= playerSpeed;
  if(keysPressed['ArrowDown']||keysPressed['s']||keysPressed['S']) position.y += playerSpeed;
  if(keysPressed['ArrowLeft']||keysPressed['a']||keysPressed['A']) position.x -= playerSpeed;
  if(keysPressed['ArrowRight']||keysPressed['d']||keysPressed['D']) position.x += playerSpeed;

  // 搖桿
  position.x += joystickDir.x * playerSpeed;
  position.y += joystickDir.y * playerSpeed;

  // 邊界
  position.x = Math.max(0, Math.min(gameArea.clientWidth - player.offsetWidth, position.x));
  position.y = Math.max(0, Math.min(gameArea.clientHeight - player.offsetHeight, position.y));

  player.style.left = position.x+'px';
  player.style.top = position.y+'px';

  if(checkCollision(player.getBoundingClientRect(), item.getBoundingClientRect())){
    score += 1;
    scoreDisplay.textContent = `分數: ${score} | 時間: ${timeLeft}s`;
    spawnItem();
  }

  checkPowerup();
  updateEnemy(enemySpeed);
  requestAnimationFrame(updatePosition);
}

// --- 搖桿控制 ---
function updateJoystickForKeyboard() {
  let dx=0, dy=0;
  if(keysPressed['ArrowUp']||keysPressed['w']||keysPressed['W']) dy -= maxDistance;
  if(keysPressed['ArrowDown']||keysPressed['s']||keysPressed['S']) dy += maxDistance;
  if(keysPressed['ArrowLeft']||keysPressed['a']||keysPressed['A']) dx -= maxDistance;
  if(keysPressed['ArrowRight']||keysPressed['d']||keysPressed['D']) dx += maxDistance;

  joystick.style.left = 20+dx+'px';
  joystick.style.top = 20+dy+'px';
  joystickDir.x = dx/maxDistance;
  joystickDir.y = dy/maxDistance;
}

// --- 計時器 ---
function startTimer(){
  const timer=setInterval(()=>{
    if(gameOver){ clearInterval(timer); return; }
    timeLeft -=1;
    scoreDisplay.textContent = `分數: ${score} | 時間: ${timeLeft}s`;
    if(timeLeft<=0){ clearInterval(timer); showGameOver(); }
  },1000);
}

// --- Game Over ---
function showGameOver(){
  gameOver = true;
  finalScore.textContent = `你吃了: ${score} 顆水果`;
  gameOverScreen.classList.remove('hidden');

  // 重置鍵盤狀態與搖桿方向
  keysPressed = {};
  joystickDir = { x: 0, y: 0 };
  joystick.style.left = '20px';
  joystick.style.top = '20px';
}

// --- 重新開始 ---
function resetGame(){
  position = { x: 160, y: 300 };
  enemyPos = { x: 160, y: 50 };
  score = 0;
  timeLeft = 60;
  gameOver = false;
  enemyFrozen = false;
  powerup.style.display='none';
  
  // 清除鍵盤與搖桿狀態
  keysPressed = {};
  joystickDir = { x:0, y:0 };
  joystick.style.left='20px';
  joystick.style.top='20px';

  scoreDisplay.textContent = `分數: ${score} | 時間: ${timeLeft}s`;
  gameOverScreen.classList.add('hidden');
  spawnItem();
  startTimer();
  requestAnimationFrame(updatePosition);
}

// --- 鍵盤事件 ---
document.addEventListener('keydown', e=>{
  if(!canMove()) return;
  keysPressed[e.key]=true;
  updateJoystickForKeyboard();
});
document.addEventListener('keyup', e=>{
  if(!canMove()) return;
  keysPressed[e.key]=false;
  updateJoystickForKeyboard();
});

// --- 搖桿觸控 ---
joystick.addEventListener('touchstart', e=>{
  if(!canMove()) return;
  dragging=true;
  const rect=joystickContainer.getBoundingClientRect();
  origin={ x: rect.left+rect.width/2, y: rect.top+rect.height/2 };
});
joystick.addEventListener('touchmove', e=>{
  if(!canMove() || !dragging) return;
  const touch=e.touches[0];
  let dx = touch.clientX - origin.x;
  let dy = touch.clientY - origin.y;
  const distance=Math.sqrt(dx*dx+dy*dy);
  if(distance>maxDistance){ dx=dx/distance*maxDistance; dy=dy/distance*maxDistance; }
  joystick.style.left=20+dx+'px';
  joystick.style.top=20+dy+'px';
  joystickDir.x=dx/maxDistance;
  joystickDir.y=dy/maxDistance;
});
joystick.addEventListener('touchend', e=>{
  if(!canMove()) return;
  dragging=false;
  joystick.style.left='20px';
  joystick.style.top='20px';
  joystickDir={x:0,y:0};
});

// --- 開始遊戲自動播放音樂 ---
startBtn.addEventListener('click', ()=>{
  startPage.classList.add('hidden');

  bgMusic.volume = isMuted ? 0 : 1;
  bgMusic.play().catch(err=>{
    console.log("音樂播放被阻擋，需要使用者互動", err);
  });

  resetGame();
});

// --- Game Over 返回 Start Page ---
restartBtn.addEventListener('click', ()=>{
  gameOverScreen.classList.add('hidden');
  startPage.classList.remove('hidden');
});

// --- 靜音按鈕切換 ---
muteBtn.addEventListener('click', ()=>{
  isMuted = !isMuted;
  bgMusic.muted = isMuted;   // iOS Safari 相容
  muteBtn.textContent = isMuted ? "🔇" : "🔊";
});

function resizeGameArea(){
  const vh = window.innerHeight; // 取得可視高度
  gameArea.style.height = vh + 'px';
}

window.addEventListener('resize', resizeGameArea);
window.addEventListener('orientationchange', resizeGameArea);
resizeGameArea(); // 初始化