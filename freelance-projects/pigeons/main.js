W = windowW;
H = windowH;
highScore = 0

let scalingFactor = [W/window.innerWidth, H/window.innerHeight];
const bgCol = "#d996fe"


if(!window.mobileCheck()){
	canvas.style.width = "40vw"
	let x = 0.3*window.innerWidth 
	canvas.style.left = x+"px"
	scalingFactor[0] *= 1/0.4
	scalingFactor[1] *= 1/0.9
}

class Pigeon{
	constructor(){
		this.w = 640/3;
		this.h = 640/3.5;
		this.x = (W-this.w)/2;
		this.y = (H-this.h)/2;
		this.drawXOffset = 0;
		this.drawYOffset = 0;
		this.sprite = new spriteSheet("player_sprite_sheet.png", 640, 640, 5, this.x,this.y,this.w,this.h);
		this.sprite.bounce = true;
		this.sprite.addState("right", 2, 5);
		this.sprite.addState("left", 3, 5);
		this.sprite.addState("up", 4, 5);
		this.sprite.addState("down", 1, 5);

		this.peckCooldown = 0;

		this.collisionRect = [0,0,0,0];

		this.score = 0;

		this.upRect = [0,0,0,0];
		this.downRect = [0,0,0,0];
		this.leftRect = [0,0,0,0];
		this.rightRect = [0,0,0,0];

		this.pecking = 0;
		this.peckingWindow = 20;
	}

	update(){
		
		if(this.peckCooldown <= 0 && (touch.pressed||mouse.button.left)){
			let offset = 0;
			this.upRect = [(W-this.w/2)/2, offset, this.w/2, this.y+this.w/2];
			this.downRect = [(W-this.w/2)/2, offset+this.y+this.w/2+50, this.w/2, H-this.y+this.w/2];
			this.leftRect = [0, offset + (H)/2, (W-this.w/2)/2, this.h/2];
			this.rightRect = [W/2+this.w/4, offset+(H)/2, (W-this.w/2)/2, this.h/2];

			let touchRect = [-1000,-1000,0,0]
			let mouseRect = [-1000,-1000,0,0]
			if(window.mobileCheck()){
				touchRect = [touch.x*scalingFactor[0], touch.y*scalingFactor[1], 0, 0];
			}
			else{
				mouseRect = [mouse.x*scalingFactor[0], mouse.y*scalingFactor[1], 0, 0];
			}

			let upRectTest = AABBCollision(touchRect, this.upRect) || AABBCollision(mouseRect, this.upRect);
			let downRectTest = AABBCollision(touchRect, this.downRect) || AABBCollision(mouseRect, this.downRect);
			let leftRectTest = AABBCollision(touchRect, this.leftRect) || AABBCollision(mouseRect, this.leftRect);
			let rightRectTest = AABBCollision(touchRect, this.rightRect) || AABBCollision(mouseRect, this.rightRect);

			if(!this.peck && upRectTest){ // UP
				this.peckCooldown = 270
				this.sprite.state = "up";
				this.peck = true;
			}
			if(!this.peck && leftRectTest){ // LEFT
				this.peckCooldown = 270
				this.sprite.state = "left";
				this.peck = true;
			}
			if(!this.peck && downRectTest){ // DOWN
				this.peckCooldown = 270
				this.sprite.state = "down";
				this.peck = true;
			}
			if(!this.peck && rightRectTest){ // RIGHT
				this.peckCooldown = 270
				this.sprite.state = "right";
				this.peck = true;
			}
			if(this.peck){
				this.pecking = this.peckingWindow;
			}
		}else{
			this.peckCooldown--;
		}
	}

	draw(){
		this.pecking--;
		switch(this.sprite.state){
			case "up":
				this.drawXOffset = 0;
				this.drawYOffset = 0;
				break;
			case "left":
				this.drawXOffset = -8;
				this.drawYOffset = 0;
				break;
			case "right":
				this.drawXOffset = 8;
				this.drawYOffset = 0;
				break;
			case "down":
				this.drawXOffset = 0;
				this.drawYOffset = 44;
				break;

		}

		this.sprite.x = this.x+this.drawXOffset;
		this.sprite.y = this.y+this.drawYOffset;

		this.sprite.draw();
		if(this.peck){
			this.sprite.frameCalc(0);
			if(this.sprite.sheetX == 640 && this.sprite.changeW <= 0){
				this.sprite.sheetX = 0;
				this.sprite.changeW *= -1;
				this.peck = false;
			}
		}else{
			this.sprite.timer = this.sprite.fps;
		}
		this.collisionRect = enlargeRect([this.sprite.x,this.sprite.y+this.h/7,this.w,this.h], 1.1,1.2)
		//drawRect(this.collisionRect, "red", false);

		showText("SCORE: " + this.score, W/2-5, 80+5, 50, "black", true);
		showText("SCORE: " + this.score, W/2, 80, 50, "white", true);

		/*drawRect(this.upRect, "red",false);
		drawRect(this.downRect, "red",false);
		drawRect(this.leftRect, "red",false);
		drawRect(this.rightRect, "red",false);
		*/
	}

}

class Crumb{
	constructor(dir){
		this.rect = [0,0,40,40];
		this.vel = [0,0];
		this.speed = 2;
		this.dir = dir;
		this.sprite = new image("crumb.png");
		switch(dir){
			case "down":
				this.rect[0] = (W-this.rect[2])/2;
				this.rect[1] = H*0.65+this.rect[3];
				this.vel = [0, -1];
				break;
			case "up":
				this.rect[0] = (W-this.rect[2])/2
				this.rect[1] = H*0.45-this.rect[3];
				this.vel = [0, 1];
				break;
			case "left":
				this.rect[0] = this.rect[2]*1.7;
				this.rect[1] = (H-this.rect[2])/2 + this.rect[2]*1.7;
				this.vel = [1, 0];
				break;
			case "right":
				this.rect[0] = W-this.rect[2]*2.7;
				this.rect[1] = (H-this.rect[2])/2 + this.rect[2]*1.7;
				this.vel = [-1, 0];
				break;
		}
		this.puffSprite = new spriteSheet("puff.png", 171, 171, 2, this.rect[0]-20,this.rect[1]-20, 80,80 );
		this.puffSprite.addState("def", 1, 9);
		this.puff = true;
	}

	draw(){
		//drawRect(this.rect, "yellow", false);
		this.sprite.drawImg(this.rect[0], this.rect[1], this.rect[2], this.rect[3], 1);

		if(this.puff){
			this.puffSprite.bounce = true;
			this.puffSprite.draw();
			this.puffSprite.frameCalc(1);
			if(this.puffSprite.changeW <= 0){
				this.puff = false;
			}
		}

	}

	update(){
		if(player.sprite.state == this.dir && AABBCollision(this.rect, player.collisionRect)){
			if(player.pecking > 0){
				player.score += 1
				deathTimer = 200
				crumbs = arrayRemove(crumbs, this);
				player.peckCooldown = 0;
				spawnTimer = spawnTimerMax;
			}
		}
	}
}

player = new Pigeon();
crumbs = [];

function spawnCrumb(){
	dir = "";
	randomInt = Math.round(random(0,3));
	switch(randomInt){
		case 0:
			dir = "up";
			break;
		case 1:
			dir = "down";
			break;
		case 2:
			dir = "left";
			break;
		case 3:
			dir = "right";
			break;
	}

	crumbs.push(new Crumb(dir));
	deathTimer = deathTimerMax;
	deathTimerMax = Math.max(40, -45*Math.log(player.score+1)+200);
}

spawnTimer = 0;
spawnTimerMax = 60;

deathTimerMax = 200;
deathTimer = deathTimerMax;
gameOver = false;

function die(){
	gameOver = true;
	if(player.score > highScore){
		highScore = player.score
	}
}

function draw(){
	drawRect([0,0,W,H],bgCol);
	for(i = 0; i < crumbs.length; i++){
		crumbs[i].draw();
	}
	player.draw();
	if(gameOver){
		showText("You missed!", W/2-5, H*0.54+5, 50, "black");
		showText("You missed!", W/2, H*0.54, 50, "white");


		showText("Try again?", W/2-5, H*0.82+5, 40, "black");
		showText("Try again?", W/2, H*0.82, 40, "white");

		retryRect = [(W/2-120)/2+90, H*0.82-30, 120, 50]

		showText("Menu", W/2-5, H*0.92+5, 40, "black");
		showText("Menu", W/2, H*0.92, 40, "white");

		menuRect = [(W/2-120)/2+90, H*0.92-30, 120, 50]

		let touchRect = [-1000,-1000,0,0]
		let mouseRect = [-1000,-1000,0,0]
		if(window.mobileCheck()){
			touchRect = [touch.x*scalingFactor[0], touch.y*scalingFactor[1], 10, 10];
		}
		else{
			mouseRect = [mouse.x*scalingFactor[0], mouse.y*scalingFactor[1], 10, 10];
		}

		if(mouse.button.left || touch.pressed){
			if(AABBCollision(menuRect, touchRect)||AABBCollision(menuRect, mouseRect)){
				menu = true;
				player.score = 0
				player.sprite.state = "down"
				crumbs = [];
				gameOver = false;
				deathTimer = 200;
				deathTimerMax = 200;
				player.peckCooldown = 0;
			}
			if(AABBCollision(retryRect, touchRect)||AABBCollision(retryRect, mouseRect)){
				player.score = 0
				player.sprite.state = "down"
				crumbs = [];
				gameOver = false;
				deathTimer = 200;
				deathTimerMax = 200;
				player.peckCooldown = 20;

			}
		}
	}
}



function update(){
	if(!gameOver){
		player.update();
		for(i = 0; i < crumbs.length; i++){
			crumbs[i].update();
		}

		deathTimer--;
		if(deathTimer <= 0){
			die();
		}
		if(spawnTimer <= 0 && crumbs.length <= 0){
			spawnCrumb();
		}else{
			spawnTimer --;
		}
	}
}

menu = true;
menuImg = new image("menu.png");

let fallingCrumbs = [];
for(i = 0; i < 20; i ++){
	size = random(5,60);
	fallingCrumbs.push([new image("fallingCrumb.png"), random(0,W-size), random(-size, -500), size, random(1,size/3), random(0, 2)*Math.PI]);
}

menuBird = new spriteSheet("player_sprite_sheet.png", 640, 640, 10, -40, H-160, 160, 160);
menuBird.addState("right", 2, 5);
menuBird.bounce = true;
menuBirdTimer = 0;
menuBirdTimerMax = 240;


function menuFunc(){
	drawRect([0,0,W,H],bgCol);
	if(menuBirdTimer <= 0){
		menuBird.frameCalc(1);
		if(menuBird.changeW < 0 && menuBird.timer == 0 && menuBird.sheetX == 640){
			menuBirdTimer = random(120, menuBirdTimerMax*2);
			menuBird.sheetX = 0;
			menuBird.changeW *= -1;
		}
		
	}else{
		menuBirdTimer--;
	}

	for(i = 0; i < fallingCrumbs.length; i ++){
		crumb = fallingCrumbs[i];
		crumb[0].drawRotatedImg(crumb[1], crumb[2], crumb[3], crumb[3], crumb[3]/30, crumb[5]);
		crumb[2] += crumb[4];

		if(crumb[2] > H+crumb[3]){
			crumb[2] = random(-crumb[3], -500);
			crumb[1] = random(0,W-crumb[3]);
		}
	}
	menuImg.drawImg((W-320)/2,0,320,320);
	menuBird.draw();
	showText("START", W/2-10, H*0.6+10, 50, "black", true);
	showText("START", W/2, H*0.6, 50, "white", true);

	showText("HIGHSCORE: "+highScore, W/2-5, H*0.8+5, 50, "black", true);
	showText("HIGHSCORE: "+highScore, W/2, H*0.8, 50, "white", true);

	let touchRect = [touch.x*scalingFactor[0], touch.y*scalingFactor[1], 0, 0];
	
	buttonRect = [(W-120)/2, (H*0.6-50), 120, 70];

	check1 = false
	check2 = false
	if(window.mobileCheck()){
		check1 = AABBCollision(touchRect, buttonRect) && touch.pressed
	}else{
		check2 = AABBCollision([mouse.x*scalingFactor[0],mouse.y*scalingFactor[1],0,0],buttonRect) && mouse.button.left
	}

	if(check1 || check2){
		menu = false;
		player.score = 0
		player.sprite.state = "down"
		crumbs = [];
	}

}

function main(){
	if(menu){
		menuFunc();
	}
	else{
		update();
		draw();
	}
	oldKeys = {...keys};
	touch.pressed = false;
	if(mouse.button.oldLeft && mouse.button.left){
		mouse.button.left = false;
	}
}

setInterval(main, 1000/60)
