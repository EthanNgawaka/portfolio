// imgs
const bg = new image("./assets/imgs/bg/room.png");
const rotate = new image("./assets/imgs/ui/rotate.png");
//
let shakeTimer = 0;
let lastShake = 0;
let transitionRectW = 0;
let isTransitioned = true;
let transSpeed = 0.1;

let bgMusicOn = true;
let score = 0;
let timer = 0;

//mobile formatting//
function onResize(){
	canvas.style.width = "92.5vw"
	canvas.style.height = "90vh"
	sf[0] = window.innerWidth/windowW;
	sf[1] = window.innerHeight/windowH;
}

function transition(){
	isTransitioned = false;
}

let correct_txt = "test";
let current_prompts = ["test","alksdjlka","aslkdjalksjdlkasj"];
let current_title = "title 1 aahhaha";

let round = 1;

function retry_round(){
	reset_stuff();
}

function fail_fn(chosen_txt){
	return function(){
		sfx.fail.play();
		shakeTimer = 0.2;
		for(let ent of entities){
			if(ent.disable != null){
				ent.disable = true;
			}
			if(chosen_txt == ent.string){
				ent.enlarge = 2;
			}
		}
		entities.push(new CharPopUp("./assets/imgs/eliza/frustrated.png", [windowW/2, windowH/2, windowW/2, windowH/2], "Hmmm, not quite... Let's try again!"));
		entities.push(new Button(
			[windowW/2-150,windowH*0.8,300,100],"./assets/imgs/ui/retry.png",
			"", "white", retry_round 
		));
	}
}

function correct_fn(){
	entities = [];
	sfx.pop.play();

	let x = windowW*0.4;

	score += 100;
	if(timer < 10){
		score += 50;
	}
	let w = windowW*0.3;
	let h = w*1.5;
	let mirror = new Button(
		[x-w/2,windowH/2-h/2,w,h],
		"./assets/imgs/ui/cleanmirror.png",
		"", "white", null
	)
	mirror.disable = true;
	mirror.enlarge = 1.25;
	entities.push(mirror);

	for(let i = 0; i < 60; i++){
		entities.push(new Sparkle(mirror.center));
	}

	let txt = correct_txt;
	h = windowH*0.08;
	c.save()
	c.font = h/2+"px Comic";
	w = c.measureText(txt).width + h;
	c.restore();
	let block = new Button(
		[x-w/2,windowH/2 - h/2,w,h],
		"./assets/imgs/ui/blank.png",
		txt, "black", function(){}, "Comic"
	)
	block.enlarge = 1.35;
	block.fade(0.1);
	entities.push(block);
	h = windowH*0.1;
	w = h*4;
	let rndtxt = "";
	for(let i = 1; i < round; i++){
		if(i == 5){
			rndtxt="v"
			continue;
		}
		if(i == 4){
			rndtxt="iv"
			continue;
		}
		rndtxt+="I"
	}
	let round_btn = new Button(
		[x-w/2,h/4 + h,w,h],
		"./assets/imgs/ui/blank.png",
		"round " + rndtxt, "black", null, "Comic"
	)
	round_btn.disable = true;
	entities.push(round_btn);

	w = h*5
	let scorebtn = new Button(
		[x-w/2,h/4,w,h],
		"./assets/imgs/ui/blank.png",
		"SCORE: "+score, "black", null, "Comic"
	)
	scorebtn.disable = true;
	entities.push(scorebtn);

	// btns
	entities.push(new Button(
		[x-150,windowH*0.8,300,100],"./assets/imgs/ui/continue.png",
		"", "white", new_round 
	));
	entities.push(new CharPopUp("./assets/imgs/eliza/happy.png", [windowW*0.65, windowH/2, windowW/2, windowH/2], "Great choice! The mirror reflects your growth!", true));
}

function check_answer(chosen_txt){
	return (chosen_txt==correct_txt) ? correct_fn : fail_fn(chosen_txt);
}

function shuffle(array) { // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
	let currentIndex = array.length;

	// While there remain elements to shuffle...
		while (currentIndex != 0) {

			// Pick a remaining element...
				let randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			// And swap it with the current element.
				[array[currentIndex], array[randomIndex]] = [
					array[randomIndex], array[currentIndex]];
		}
}
function change_prompt(){
	
	current_prompts = [...pool[random(0,pool.length-1, true)]];
	correct_txt = current_prompts[0]
	shuffle(current_prompts);
}

function reset_stuff(){
	transition();
	entities = [];
	let w = windowW*0.3;
	let h = w*1.5;
	let mirror = new Button(
		[windowW/2-w/2,windowH/2-h/2,w,h],
		"./assets/imgs/ui/oldmirror.png",
		"", "white", null
	)
	mirror.disable = true;
	entities.push(mirror);

	h = windowH*0.1;
	w = h*4;
	let rndtxt = "";
	for(let i = 1; i < round; i++){
		if(i == 5){
			rndtxt="v"
			continue;
		}
		if(i == 4){
			rndtxt="iv"
			continue;
		}
		rndtxt+="I"
	}
	let round_btn = new Button(
		[windowW/2-w/2,h/4 + h,w,h/1.3],
		"./assets/imgs/ui/blank.png",
		"round " + rndtxt, "black", null, "Comic"
	)
	round_btn.disable = true;
	entities.push(round_btn);

	w = h*5
	let scorebtn = new Button(
		[windowW/2-w/2,h/4,w,h],
		"./assets/imgs/ui/blank.png",
		"SCORE: "+score, "black", null, "Comic"
	)
	scorebtn.disable = true;
	entities.push(scorebtn);

	let texts = current_prompts;
	for(let i = 0; i < texts.length; i++){
		let txt = texts[i];
		h = windowH*0.08;
		c.save()
		c.font = h/2+"px Comic";
		w = c.measureText(txt).width + h;
		c.restore();
		let block = new Button(
			[windowW/2-w/2,h*(3.5 + i*2.5),w,h],
			"./assets/imgs/ui/blank.png",
			txt, "black", check_answer(txt), "Comic"
		)
		block.fade(2+(i+1)*2);
		entities.push(block);
	}
}

function end_fn(){
	end = true;
	transition();
	entities = [];
	let w = windowW*0.3;
	let h = w*1.5;
	let mirror = new Button(
		[windowW/2-w/2,windowH/2-h/2,w,h],
		"./assets/imgs/ui/cleanmirror.png",
		"", "white", null
	)
	mirror.disable = true;
	mirror.enlarge = 1.25;
	entities.push(mirror);
	h = windowH*0.1;
	w = h*5
	let scorebtn = new Button(
		[windowW/2-w/2,h/4,w,h],
		"./assets/imgs/ui/blank.png",
		"SCORE: "+score, "black", null, "Comic"
	)
	scorebtn.disable = true;
	entities.push(scorebtn);

	entities.push(new CharPopUp("./assets/imgs/eliza/happy.png", [windowW*0.6, windowH/2, windowW/2, windowH/2], "You’ve mastered the Reflection Room! Positive self-talk clears your path to success. Try again for a higher score!"));

	entities.push(new Button(
		[windowW/2-150,windowH*0.8,300,100],"./assets/imgs/ui/retry.png",
		"", "white", switch_to_menu
	));

}

function new_round(){
	timer = 0;
	if(round == 6){
		score += 200;
		end_fn();
		return;
	}
	round += 1;
	change_prompt();
	reset_stuff();
}

if(window.mobileCheck()){
	document.addEventListener('orientationchange', onResize);
	onResize();
}

let menu = false;
function switch_to_main(temp=null){
	score = 0;
	round = 1;
	menu = false;
	transition();
	entities = [];
	new_round();
}

function unmute(btn){
	bgMusicOn = true;
	btn.img = new image("./assets/imgs/ui/audioOn.png");
	btn.onAction = mute;
	if(bgMusicOn){
		sfx.bg_music.volume(0.2);
	}else{
		sfx.bg_music.volume(0);
	}
}
function mute(btn){
	bgMusicOn = false;
	btn.img = new image("./assets/imgs/ui/audioOff.png");
	btn.onAction = unmute;
	if(bgMusicOn){
		sfx.bg_music.volume(0.2);
	}else{
		sfx.bg_music.volume(0);
	}
}

function switch_to_menu(){
	isEnd = false;
	transition();
	menu = true;
	entities = [];
	end = false;

	entities.push(new Button(
		[windowW/2-150,windowH/2+100,300,100],"./assets/imgs/ui/start.png",
		"", "white", switch_to_main 
	));
	let w = 600;
	let title = new Button(
		[windowW/2-w/2,50,w,w/3],"./assets/imgs/ui/title.png",
		"", "white", null 
	)
	title.disable = true;
	entities.push(title);
	entities.push(new Button(
		[windowW/2-50,windowH/2+250,100,100],
		bgMusicOn ? "./assets/imgs/ui/audioOn.png":"./assets/imgs/ui/audioOff.png",
		"", "white", bgMusicOn ? mute : unmute
	));
	entities.push(new CharPopUp(
		"./assets/imgs/eliza/happy.png",
		[windowW*0.57, windowH*0.55, windowW/2, windowH/2],
		"Welcome to the Reflection Room. These mirrors reveal your inner thoughts. Help me polish them by choosing the right positive self-talk!"));
}


// this inits the whole thing
switch_to_menu();
//
function draw(){
	bg.drawImg(0,0,windowW,windowH, 1);
	for(let e of entities){
		e.draw();
	}

	if(end){
	}
}

let rand_vec = [0,0];
function update_camera(dt){
	shakeTimer -= dt;
	if(shakeTimer > 0){
		if(Math.abs(lastShake - shakeTimer) < 0.1 || lastShake <= 0.1){
			rand_vec = [random(-5,5), random(-5,5)];
			lastShake = shakeTimer;
		}
		Camera.position = lerpArray(Camera.position, add(Camera.position, rand_vec), 1);
	}else{
		Camera.position = lerpArray(Camera.position, [0,0], 0.1);
	}
}

spawn_rate = 2;
spawn_timer = 0;
over = false; // debug
let loading = true;
if(over){
	spawn_rate = 0;
	loading = false;
	//intro = false;
}
let sparkle_t = 0
function update(dt){
	for(let e of entities){
		e.update(dt);
	}

	if(!menu){
	}

	if(end){
		sparkle_t += dt;
		if(sparkle_t > 0.2){
			entities.push(new Sparkle([windowW/2, windowH/2]));
			sparkle_t = 0;
		}
	}

	update_camera(dt);
}

let prev_time = 0;
let mouse_down = false;
let t = 0;

let index = 0;
let change = false;
let play_start =true;

function main(curr_time){
	if(prev_time == 0){ prev_time = curr_time; }
	let dt = (curr_time - prev_time)/1000;
	prev_time = curr_time;
	timer += dt;

	if(loading){
		drawRect([0,0,windowW,windowH], "black");
		console.log(total_images, loaded_images);
		if(total_images == loaded_images){
			showText("Click to continue...",windowW/2, windowH/2, 40, "white", false, false, "Comic")
			if(mouse.button.left){
				loading=false;
				mouse_down =true;
			}
			if(window.mobileCheck()){
				onResize();
			}
			if(window.innerHeight > window.innerWidth){
				rotate.drawImg(windowW/2 - 150/sf[0],windowH/2 - 150/sf[1],300/sf[0],300/sf[1],1);
			}
			requestAnimationFrame(main);
			return;
		}
		t += dt;
		let r = 100
		for(let i = 1; i < 6; i++){
			drawCircle([windowW/2 + math.sin((i*math.pi/6 + t*math.pi))*r, windowH/2 + r*math.cos((i*math.pi/6 + t*math.pi))], 10, "white");
		}
		showText("Loading...",windowW/2, windowH/2 + 150, 20, "white")
		showText(loaded_images+"/"+total_images,windowW/2, windowH/2 + 200, 20, "white");
		mouse_down = mouse.button.left;
		oldKeys = {...keys};
		if(window.mobileCheck()){
			onResize();
		}
		if(window.innerHeight > window.innerWidth){
			rotate.drawImg(windowW/2 - 150/sf[0],windowH/2 - 150/sf[1],300/sf[0],300/sf[1],1);
		}
		requestAnimationFrame(main);
		return;
	}

	if(isTransitioned){
		draw();
		update(dt);
		drawRect([0,0,transitionRectW,windowH])
		if(transitionRectW > 0){
			transitionRectW = lerp(transitionRectW, 0, transSpeed);
		}
	}else{
		drawRect([0,0,transitionRectW+5,windowH])
		transitionRectW = lerp(transitionRectW, windowW, transSpeed);
	}
	if(math.abs(transitionRectW - windowW) < 5){
		isTransitioned = true;
		transitionRectW = windowW
	}
	if(transitionRectW < 1){
		transitionRectW = 0
	}

	oldKeys = {...keys};
	if(window.mobileCheck()){
		onResize();
	}
	if(window.innerHeight > window.innerWidth){
		rotate.drawImg(windowW/2 - 150/sf[0],windowH/2 - 150/sf[1],300/sf[0],300/sf[1],1);
	}
	requestAnimationFrame(main);
}

requestAnimationFrame(main);

