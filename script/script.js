
window.addEventListener('load',function(){
const canvas = document.getElementById("canvas1");
const ctx=canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width =700;
const CANVAS_HEIGHT = canvas.height =500;
let score =0;
let gameOver=false;
//InputHandler

setTimeout(function() {
  document.getElementById('startScreen').style.display = 'none';
}, 2000); // Hide after 3 seconds

class InputHandler {
  constructor(){
    this.keys = [];
    this.touchY='';
    this.touchThreshold = 40;
    window.addEventListener('keydown', e => {
      if (( e.key === 'ArrowDown' ||
          e.key === 'ArrowUp'    ||
          e.key === 'ArrowLeft'  ||
          e.key === 'ArrowRight' )
          && this.keys.indexOf(e.key) === -1){
            this.keys.push(e.key);
       } else if ((e.key === 'Enter' && gameOver) || Input.touchY>-1) restartGame();
    });
    window.addEventListener('keyup', e => {
      if ( e.key === 'ArrowDown' ||
          e.key === 'ArrowUp'    ||
          e.key === 'ArrowLeft'  ||
          e.key === 'ArrowRight' ){
          this.keys.splice(this.keys.indexOf(e.key), 1);
       }
    });
    window.addEventListener('touchstart',e => {
      this.touchY = e.changedTouches[0].pageY
    });
    window.addEventListener('touchmove',e => {
      const swipteDistance = e.changedTouches[0].pageY - this.touchY;
      if(swipteDistance < -this.touchThreshold && this.keys.indexOf('swipe up') ===- 1) this.keys.push('swipe up');
      else if(swipteDistance > this.touchThreshold && this.keys.indexOf('swipe down' === -1)){
        this.keys.push('swipe down');
        if(gameOver) restartGame();
      }
    });
    window.addEventListener('touchend',e => {
      this.keys.splice(this.keys.indexOf('swipe up'), 1);
      this.keys.splice(this.keys.indexOf('swipe down'), 1);
    });
  }
}

//Background

let gameSpeed=2;
let x1=0;
let x2=700;

const BackgroundImage1= new Image();
BackgroundImage1.src='assets/Backgound/PNG/CBG1/Layers/Middle_Decor.png';
const BackgroundImage2= new Image();
BackgroundImage2.src='assets/Backgound/PNG/CBG1/Layers/Ground.png';
const BackgroundImage3= new Image();
BackgroundImage3.src='assets/Backgound/PNG/CBG1/Layers/Sky.png';
const BackgroundImage4= new Image();   
BackgroundImage4.src='assets/Backgound/PNG/CBG1/Layers/Foreground.png';
const BackgroundImage5= new Image();
BackgroundImage5.src='assets/Backgound/PNG/CBG1/Layers/BG_Decor.png';

class Layer{
  constructor(image,speedModifier){
    this.x1=0;
    this.y=0;
    this.width=700;
    this.height=500;
    this.x2=this.width;
    this.image=image;
    this.speedModifier=speedModifier;
    this.speed=gameSpeed * this.speedModifier;
  }
  update(){

    this.speed = gameSpeed * this.speedModifier;
    if(this.x1 <= -this.width){
      this.x1 = this.width + this.x2 - this.speed;
    }
    if(this.x2 <= -this.width){
      this.x2 = this.width + this.x1 - this.speed;
    }
    this.x1=Math.floor(this.x1 - this.speed);
    this.x2=Math.floor(this.x2 - this.speed);
  }
  draw(){
    ctx.drawImage(this.image, this.x1, this.y, this.width ,this.height);
    ctx.drawImage(this.image, this.x2, this.y, this.width ,this.height);
  }
  restart(){
    this.x1=0;
    this.x2=this.width;
  }
}

const Layer1 = new Layer(BackgroundImage3,0.2); 
const Layer2 = new Layer(BackgroundImage5,0.4); 
const Layer3 = new Layer(BackgroundImage1,0.6); 
const Layer4 = new Layer(BackgroundImage4,0.8); 
const Layer5 = new Layer(BackgroundImage2,1); 

const LayerObj=[Layer1,Layer2,Layer3,Layer4,Layer5];

//Dragon
const spriteWidth=200;
const spriteHeight=160;
let gameFrame=gameSpeed;
const StaggerFrames=10;

const spriteAnimation=[];
const animationStates=[
      {
        name:'Run',
        frame: 4,
      },
      {
        name: 'Idle',
        frame: 4,
      },
      {
        name: 'Attack',
        frame:8,
      },
      {
        name: 'Fire',
        frame:4,
      }
];

animationStates.forEach( (state,index)=> {
  let frame={
      loc:[],
  }
  for(let j=0;j < state.frame; j++){
      let positionX=j*spriteWidth;
      let positionY=index * spriteHeight;
      frame.loc.push({x: positionX,y: positionY});
  }
  spriteAnimation[state.name] = frame;
  });

let Action="Run";
class dragon {
  constructor(gameWidth,gameHeight){  
    this.gameWidth =gameWidth;
    this.gameHeight = gameHeight;
    this.width=180;
    this.height = 140;
    this.image = document.getElementById('dragon');
    this.x=0;
    this.y= this.gameHeight - this.height;
    this.frameX = 0;
    this.maxframe = 4;
    this.framey = 0;
    this.fps = 20;
    this.frametimer = 0;
    this.frameinterval = 1000/this.fps;
    this.speed = 0;
    this.vy = 0;
    this.weight = 1;
  }
  restart(){
    this.x=0;
    this.y= this.gameHeight - this.height;
  }
  update(Input,deltaTime,Enemy){
    //collision detection
    Enemy.forEach(enemy => {
      const dx = ( enemy.x + enemy.width/2) - (this.x + this.width/2);
      const dy =( enemy.y + enemy.height/2) - (this.y + this.height/2 + 20);
      const distance = Math.sqrt(dx * dx + dy * dy);
      if(distance < enemy.width/2 + this.width/3){
        gameOver = true;
      }
    })

    //  this.x += this.speed;
    //sprite animation
    if(this.frametimer > this.frameinterval){
        if(this.frameX >= this.maxframe)this.frameX = 0;
        else this.frameX++;
        this.frametimer = 0;
    } else {
        this.frametimer += deltaTime;
    }
    //controls
     if (Input.keys.indexOf('ArrowRight') > -1){
      this.speed = 5;
     } else if(Input.keys.indexOf('ArrowLeft') > -1) {
        this.speed = -5;
     } else if((Input.keys.indexOf('ArrowUp') > -1 || Input.keys.indexOf('swipe up') > -1 ) && this.onGround()) {
        this.vy -= 20;
     } else {
      this.speed = 0;
     }
     //horixontal movemetn
     this.x += this.speed;
     if (this.x < 0) this.x = 0;
     else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width;
     //vertical movement
     this.y += this.vy;
     if (!this.onGround()){
      this.vy += this.weight;
     }else {
      this.vy = 0;
     }

     if(this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height;
     gameFrame++;
  }
  onGround(){
    return this.y >= this.gameHeight -this.height;
  }
  draw(context){
    let position = Math.floor(gameFrame/StaggerFrames)%spriteAnimation[Action].loc.length;
    let frameX=spriteWidth * position;
    let frameY = spriteAnimation[Action].loc[position].y;

    // context.beginPath();
    // context.arc(this.x + this.width/2,this.y + this.height/ 2 +20,this.width/3,0,Math.PI * 2);
    // context.stroke();

    // context.strokeStyle = 'white';
    // context.strokeRect(this.x,this.y,this.width,this.height);
    context.drawImage(this.image,frameX,frameY,this.width,this.height,this.x,this.y,this.width,this.height);
  }
}

//Enemy


const Draco=new Image();
Draco.src='assets/Enemies/Flying/Dracoo.png';
const numberofEnemy=3;
let MyEnemys=[];

class Enemy {
      constructor(gameWidth,gameHeight){
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.width = 77;
        this.height = 67;
        this.image = document.getElementById('grassmonster');
        this.x = this.gameWidth;
        this.y = this.gameHeight  - this.height;
        this.frameX = 0;
        this.maxframe = 13;
        this.fps = 20;
        this.speed = 8;
        this.frametimer = 0;
        this.frameinterval = 1000/this.fps;
        this.markedfordeletion = false;
      }
      draw(context){
        // context.strokeStyle = 'white';
        // context.strokeRect(this.x,this.y,this.width,this.height);

        // context.beginPath();
        // context.arc(this.x + this.width/2,this.y + this.height/ 2,this.width/2,0,Math.PI * 2);
        // context.stroke();   

        context.drawImage(this.image,this.frameX * this.width, 0 , this.width, this.height,this.x,this.y,this.width,this.height);
      }
      update(deltaTime){
        if(this.frametimer > this.frameinterval){
          if (this.frameX >= this.maxframe)this.frameX = 0;
          else this.frameX++;
          this.frametimer=0;
        } else {
          this.frametimer += deltaTime;
        }
        this.x -= this.speed;
        if(this.x < 0 -this.width) {
          this.markedfordeletion = true;
          score++;
        }
      }
      
}


function handleEnemies(deltaTime){
  if(EnemyTimer > EnemyInterval + randomenemyinterval){
    MyEnemys.push(new Enemy(canvas.width,canvas.height));
    randomenemyinterval = Math.random() * 1000 + 500;
    EnemyTimer=0
  }else{
    EnemyTimer += deltaTime;
  }
    MyEnemys.forEach(enemy => {
      enemy.draw(ctx);
      enemy.update(deltaTime);
    })
    MyEnemys = MyEnemys.filter(enemy => !enemy.markedfordeletion);
}

function displayStatusText(context){
  context.textAlign= 'left';
  context.font = '40px Helvetica';
  context.fillStyle = 'black';
  context.fillText('Score: '+score,20,50);
  context.fillStyle = 'white';
  context.fillText('Score: '+score,22,52);
  if(gameOver){
    context.textAlign = 'center';
    context.fillStyle = 'black';
    context.fillText('Game Over,Try Again!,\npress Enter to continue',canvas.width/2,200,450);
    context.fillStyle = 'white';
    context.fillText('Game Over,Try Again!,\npress Enter to continue',canvas.width/2 + 2,202,450);
  }

}

function restartGame(){
  drg.restart();
  Layer1.restart();
  score =0;
  gameOver=false;
  MyEnemys=[];
  animate(0);

}

let lastTime=0;
let EnemyTimer=0;
let EnemyInterval = 1000;
let randomenemyinterval = Math.random() * 1000 + 500;

const Input = new InputHandler()
const drg = new dragon(canvas.width,canvas.height);

function animate(timeStamp){
  ctx.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
  const deltaTime = timeStamp - lastTime;
  lastTime = timeStamp;
  LayerObj.forEach( object => {  
    object.update(Input);
    object.draw(ctx);
  });
  drg.draw(ctx);
  drg.update(Input,deltaTime,MyEnemys);
  handleEnemies(deltaTime);
  displayStatusText(ctx);
  if(!gameOver)requestAnimationFrame(animate);
}
animate(0);
});