let transitionRectW = 0;
let transSpeed = 0.1;
let shakeTimer = 0;
let lastShake = 0;
let btn_down = false;

c.msImageSmoothingEnabled = false;
c.mozImageSmoothingEnabled = false;
c.webkitImageSmoothingEnabled = false;
c.imageSmoothingEnabled = false;

let bg = new image("./assets/menu.JPG");

let timer = 0;
let start_timer = 60*45;
let lvl = 1;
let my_score = null;

let disp_text = ""

let crossword_event_listener = [];
let crossword_grid = [];
for(let i=0; i < 11; i++){ 
	crossword_grid.push([null,null,null,null,null,null,null,null,null,null,null]);
}

function transition(){
	isTransitioned = false;
}

function create_draggable_btn(src, rect){
	let btn = new Button(rect, src, "", "black", function(btn){});
	btn.down = function(){
		if(!this.pressed){
			this.start_rect = [this.rect[0], this.rect[1]];
		}
		this.rect[0] = this.start_rect[0] - (this.start_rect[0] - mouse.x);
		this.rect[1] = this.start_rect[1] - (this.start_rect[1] - mouse.y);
	}
	btn.update = function(dt){
		let d = [this.rect[0]-mouse.x, this.rect[1]-mouse.y];
		this.hovered = math.abs(math.sqrt(d[0]**2 + d[1]**2)) < 12
		if(mouse.button.left && (this.stillClicked) && btn_down){
			this.down();
		}
		if(this.hovered){
			if(mouse.button.left && !this.pressed && !btn_down){
				this.stillClicked = true;
				btn_down = true;
				this.pressed = true;
				sfx.click.play();
			}
		}
		if(this.stillClicked && !mouse.button.left){
			this.stillClicked = false;
			btn_down = false;
		}
		this.prevHover = this.hovered;
		this.pressed = mouse.button.left;
	}
	btn.draw = function(){
		let drawing_rect = [...this.drawing_rect];
		drawing_rect[0] += Camera.position[0];
		drawing_rect[1] += Camera.position[1];
		if(this.hovered){
			drawing_rect = enlargeRect(drawing_rect, 1.05, 1.05);
			if(this.pressed){
				drawing_rect = enlargeRect(drawing_rect, 0.92, 0.92);
			}
		}

		if(this.img != null){
			this.img.drawImg(...drawing_rect, 1);
		}else{
			drawRect(drawing_rect, this.bg_col)
		}
		showText(this.string, this.center[0]+Camera.position[0], this.center[1] + this.rect[3]/7+Camera.position[1], drawing_rect[3]/2, this.col, this.bold, false, this.font);
		showText(this.number, this.center[0]+Camera.position[0] - this.rect[2]/2, this.center[1] + this.rect[3]/7+Camera.position[1] - this.rect[3]/3, drawing_rect[3]/3, this.col, true, false, this.font, "left");
		drawCircle([this.rect[0], this.rect[1]], 6.32, "red");
	}
	entities.push(btn);
}

function create_submission_elements(string, onAction=null){
	function verify(btn){
		for(let row of crossword_grid){
			for(let col of row){
				if(col != null && col.correct_string.toUpperCase() != col.string.toUpperCase()){
					shakeTimer = 0.1;
					sfx.error.play();
					for(let f of crossword_event_listener){
						document.removeEventListener('keydown', f);
					}
					create_error_popup()
					for(let row of crossword_grid){
						for(let col of row){
							if(col != null){
								col.string = "";
								col.typingInThis = false;
							}
						}
					}
					return
				}
			}
		}
		next_level();
	}
	let w = windowW*0.15;
	let h = windowH*0.1;
	let rect = [windowW/2 - w/2, windowH*0.92 - h/2, w, h];
	let func = (onAction == null) ? verify : onAction;
	entities.push(new Button(rect, "./assets/submit.png", "SUBMIT", "lime", func))

	let mid = 4
	let first = mid - math.floor(string.length/2);
	for(let i = 0; i < string.length; i++){
		let r = 1;
		let c = first + i;
		let sqr = add_new_crossword_square(string[i], r, c, "across", 0.1, string.length%2==0);
		sqr.off = 7;
		entities.push(sqr);
		crossword_grid[r][c] = sqr;
	}

	for(let i=0; i < 11; i++){
		for(let j=0; j < 11; j++){
			sqr = crossword_grid[i][j];
			if(sqr != null){
				let new_i = i;
				let new_j = j;
				if(sqr.dir == "down"){
					new_i++;
				}else{
					new_j++;
				}
				sqr.nextSqr = crossword_grid[new_i][new_j];
				entities.push(sqr)
			}
		}
	}
}

function create_hint_elems(string){
	let w2 = windowW * 0.15;
	let h2 = windowH * 0.1;
	entities.push(new Button(
		[windowW - w2*1.1, h2*0.1, w2, h2], "./assets/submit.png", "HINT", "lime", function(btn){
			timer -= 3 * 60; // -3 mins
			let t_w = windowW*0.9;
			let t_h = windowW*0.1125;
			let t_btn = new Button(
				[windowW/2-t_w/2, windowH/2-t_h/2, t_w, t_h], "./assets/hint.png", string, "lime",
				function(btn1){
					entities = arrayRemove(entities, btn1);
				}
			);
			t_btn.tag = "hint";
			entities.push(t_btn)
		}
	));
}

// tetris
function init_level_1(){
	/* apparently this puzzle is IRL
	create_draggable_btn("./assets/1.png", [random(10,150), random(150, 350), 125, 75]);
	create_draggable_btn("./assets/2.png", [random(10,150), random(150, 350), 80, 75]);
	create_draggable_btn("./assets/3.png", [random(10,150), random(150, 350), 80, 75]);
	create_draggable_btn("./assets/4.png", [random(10,150), random(150, 350), 80, 75]);
	create_draggable_btn("./assets/5.png", [random(10,150), random(150, 350), 80, 75]);
	create_draggable_btn("./assets/6.png", [random(10,150), random(150, 350), 150, 75]);
	create_draggable_btn("./assets/7.png", [random(10,150), random(150, 350), 80, 75]);
	*/

	create_hint_elems("Find all tetris pieces and place them together to read what it says, answer is GUARD")

	let w1 = windowH*0.25;
	let h1 = windowH*0.25;
	let btn = new Button(
		[windowW/2 - w1/2, windowH*0.05, w1, h1], "./assets/user.png", "", "black", function(btn){}
	)
	btn.disable = true;
	entities.push(btn);
	entities.push(new Label(
		"LOGIN AS ADMIN", 25,
		[windowW*0.5, windowH*0.35],
		"lime", "Orbitron", true,)
	);

	entities.push(new Label(
		"To enter the files on this computer", 25,
		[windowW*0.5, windowH*0.45],
		"lime", "Orbitron", true,)
	);
	entities.push(new Label(
		"please enter the password...", 25,
		[windowW*0.5, windowH*0.5],
		"lime", "Orbitron", true,)
	);

	create_submission_elements("guard");
}

function create_error_popup(){
	let w = windowW*0.9;
	let h = w*0.1125;
	let btn_rect = [windowW/2-w/2, windowH/2-h/2, w,h]
	let btn = new Button(
		btn_rect, "./assets/error.png", "", "lime", function(btn){
			entities = arrayRemove(entities, btn);
		}
	);

	entities.push(btn);
}

// crossword
function init_level_2(){
	create_hint_elems("All the answers can be found in the room...")
	// submit
	function verify(btn){
		for(let row of crossword_grid){
			for(let col of row){
				if(col != null && col.correct_string.toUpperCase() != col.string.toUpperCase()){
					shakeTimer = 0.1;
					create_error_popup();
					sfx.error.play();
					return
				}
			}
		}
		next_level();
	}
	let w = windowW*0.075;
	let h = windowH*0.05;
	let rect = [windowW/2 - w/2, windowH*0.85 - h/2, w, h];
	entities.push(new Button(rect, "./assets/submit.png", "SUBMIT", "lime", verify))
	// across
	entities.push(new Label("Across", 25, [windowW/4, windowH*0.7], "lime", "Orbitron", true));
	add_crossword_word("patterson", "across", [1,2], 1); // 1
	add_crossword_word("bella", "across", [4,5], 2); // 2
	add_crossword_word("arizona", "across", [7,1], 3); // 3
	entities.push(new Label(
		"1. My favourite author", 15,
		[windowW*0.25, windowH*0.7+windowH*0.05],
		"lime", "Orbitron", false,)
	);
	entities.push(new Label(
		"2. My pride and joy", 15,
		[windowW*0.25, windowH*0.7+windowH*0.1],
		"lime", "Orbitron", false,)
	);
	entities.push(new Label(
		"3. 5th place in hunting", 15,
		[windowW*0.25, windowH*0.7+windowH*0.15],
		"lime", "Orbitron", false,)
	);

	// down
	entities.push(new Label("Down", 25, [3*windowW/4, windowH*0.7], "lime", "Orbitron", true));
	add_crossword_word("bison", "down", [4,5], 4); // 4
	add_crossword_word("hunting", "down", [3,3], 5); // 5
	add_crossword_word("rifle", "down", [1,7], 6); // 6
	entities.push(new Label(
		"4. Animal I hunted in Georgia", 15,
		[windowW*0.75, windowH*0.7+windowH*0.05],
		"lime", "Orbitron", false,)
	);
	entities.push(new Label(
		"5. My hobby", 15,
		[windowW*0.75, windowH*0.7+windowH*0.1],
		"lime", "Orbitron", false,)
	);
	entities.push(new Label(
		"6. My favourite weapon", 15,
		[windowW*0.75, windowH*0.7+windowH*0.15],
		"lime", "Orbitron", false,)
	);
	//

	for(let i=0; i < 11; i++){
		for(let j=0; j < 11; j++){
			sqr = crossword_grid[i][j];
			if(sqr != null){
				let new_i = i;
				let new_j = j;
				if(sqr.dir == "down"){
					new_i++;
				}else{
					new_j++;
				}
				sqr.nextSqr = crossword_grid[new_i][new_j];
				entities.push(sqr)
			}
		}
	}
}
function init_level_3(){
	entities.push(new Label(
		"Use the code:",
		25, [windowW/2, windowH*0.3], "lime", "Orbitron", true)
	);
	entities.push(new Label(
		"9275",
		25, [windowW/2, windowH*0.35], "lime", "Orbitron", true)
	);

	create_submission_elements("LASER");
}

// animal sounds
function init_level_4(){
	create_hint_elems("Use the laser to aim the targets in the order of pig, owl, frog, snake, kookaburra.")
	let w1 = windowH*0.2;
	let h1 = windowH*0.2;
	let btn = new Button(
		[3*windowW/8 - w1/2, windowH*0.2, w1, h1], "./assets/gun.png", "", "black", function(btn){}
	)
	btn.disable = true;
	entities.push(btn)

	btn = new Button(
		[5*windowW/8 - w1/2, windowH*0.2, w1, h1], "./assets/target.png", "", "black", function(btn){}
	)
	btn.disable = true;
	entities.push(btn)

	create_submission_elements("ROUTINE");
}

// FM radio riddle
function init_level_5(){
	create_hint_elems("Pour the hot drink into the black cup for your first year. Hold the piece of paper above the heater for your second year. Maybe you should add these?")
	entities.push(new Label(
		"Turn on the latest news",
		25, [windowW/2, windowH*0.3], "lime", "Orbitron", true)
	);
	entities.push(new Label(
		"on 97.2FM, have your favourite",
		25, [windowW/2, windowH*0.35], "lime", "Orbitron", true)
	);
	entities.push(new Label(
		"drink and figure out what",
		25, [windowW/2, windowH*0.4], "lime", "Orbitron", true)
	);
	entities.push(new Label(
		"the secret message is.",
		25, [windowW/2, windowH*0.45], "lime", "Orbitron", true)
	);

	let w = windowW*0.2;
	let h = windowH*0.05;
	let rect = [windowW/2 - w/2, windowH*0.85 - h/2, w, h];

	create_submission_elements("3881");
}

// X marks the spot
function init_level_6(){ 
	create_hint_elems("Find the award medals and draw the line from Idaho to New York to Kentucky to Georgia to Arizona.")
	entities.push(new Label(
		"Follow my competition journey from",
		25, [windowW/2, windowH*0.3], "lime", "Orbitron", true)
	);
	entities.push(new Label(
		"1st place to last on the map.",
		25, [windowW/2, windowH*0.35], "lime", "Orbitron", true)
	);
	entities.push(new Label(
		"What number do you get?",
		25, [windowW/2, windowH*0.425], "lime", "Orbitron", true)
	);
	let w = windowW*0.2;
	let h = windowH*0.05;
	let rect = [windowW/2 - w/2, windowH*0.85 - h/2, w, h];

	create_submission_elements("3");
}

class Timer{
	constructor(len, func=function(){ next_level() }){
		this.len = len;
		this.onEnd = func;
	}
	update(dt){
		if(this.len > 0){
			this.len -= dt;
		}else{
			this.onEnd();
			entities = arrayRemove(entities, this);
		}
	}
	draw(){
	}
}
function init_level_7(){
	entities.push(new Timer(10*60, function(){switch_to_menu()}));
	entities.push(new Light("red", [0, windowH/3], 300));
	entities.push(new Light("#ff5050", [0, windowH/3], 250));
	entities.push(new Light("red", [windowW, windowH], 300));
	entities.push(new Light("#ff5050", [windowW, windowH], 250));
	sfx.siren.play();

	entities.push(new Light("blue", [windowW, windowH/4], 300));
	entities.push(new Light("#0099ff", [windowW, windowH/4], 250));
	entities.push(new Light("blue", [0, windowH/1.5], 300));
	entities.push(new Light("#0099ff", [0, windowH/1.5], 250));

	let lbl1 = new Label(
		"!!! ACCESS DENIED !!!",
		45, [windowW/2, windowH*0.45], "lime", "Orbitron", true
	)
	let lbl2 = new Label(
		"!!! ALARM TRIGGERED !!!",
		45, [windowW/2, windowH*0.5], "lime", "Orbitron", true
	)

	entities.push(lbl1);
	entities.push(lbl2);
	entities.push(new CycleImages([windowW/2 - windowW*0.1, windowH*0.6, windowW*0.2, windowW*0.2], ["./assets/1.png", "./assets/2.png", "./assets/3.png", "./assets/4.png"]));

}

let level_map = {
	1: init_level_1,
	2: init_level_2,
	3: init_level_3,
	4: init_level_4,
	5: init_level_5,
	6: init_level_6,
	7: init_level_7,
}

let menu = false;
function switch_to_menu(btn=null){
	menu = true;
	transition();

	let w = windowW*0.15;
	let h = windowH*0.1;
	let start_btn_rect = [windowW/2 - w/2, windowH/1.2 - h/2, w,h]
	entities = [
		new Button(start_btn_rect, "./assets/submit.png", "START", "lime", switch_to_main)
	];
}

function next_level(){
	for(let f of crossword_event_listener){
		document.removeEventListener('keydown', f);
	}
	crossword_event_listener = [];
	crossword_grid = [];
	for(let i=0; i < 11; i++){
		crossword_grid.push([null,null,null,null,null,null,null,null,null,null,null]);
	}
	disp_text = ""
	entities = [];
	isTransitioned = false;
	level_map[lvl]()
	lvl++;
}

function switch_to_main(btn=null){
	menu = false;
	transition();
	entities = [];
	timer = start_timer;
	next_level()
}

// this inits the whole thing
switch_to_menu();
//

let onTop = [];
function draw(){
	onTop = []
	drawRect(enlargeRect([0,0,windowW,windowH],3,3), col_pal[0]);
	c.save()
	if(lvl > 7 && !menu){
		let w = windowW*0.6;
		let h = windowH*0.6;
		let rect = [windowW/2-w/2,windowH*0.5-h*0.6,w,h];
	}
	if(!menu){
		draw_main_ui();
	}
	for(let e of entities){
		if(e instanceof Light){
			onTop.push(e);
			continue;
		}
		e.draw();
	}
	showText("kidnappedOS v0.1.2", 6.5*windowW/8, windowH - 15, 15, "lime");
	if(menu){
		bg.drawImg(windowW/2 - 200, windowH/3 - 200, 400, 400, 1);
	}
	c.globalCompositeOperation = 'multiply';
    c.fillStyle = '#b3b3b3'; // CHANGE OVERLAY LUMINOSITY HERE
    c.fillRect(0, 0, canvas.width, canvas.height);
	c.globalCompositeOperation = 'color';
    c.fillStyle = 'green'; // CHANGE OVERLAY HUE AND SATURATION HERE
    c.fillRect(0, 0, canvas.width, canvas.height);

	c.restore()
	for(let e of onTop){
		e.draw();
	}
}

let rand_vec = [0,0];
function update(dt){
	for(let e of entities){
		e.update(dt);
	}
	
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

function update_main_ui(dt){
	if(lvl <= 6 && lvl > 2){
		timer -= dt;
	}
	if(timer <= 0){
		switch_to_menu();
	}
}

function draw_main_ui(){
	let disp_sec = String(math.round(timer) % 60).padStart(2, '0');
	let disp_min = String(math.floor(timer / 60)).padStart(2,'0')+":"
	let disp_time = disp_min+disp_sec

	for(let i of crossword_grid){
		for(let j of i){
			if(j != null){
				if(j.typingInThis){
					let drawing_rect = [...j.drawing_rect];
					drawing_rect[0] += Camera.position[0];
					drawing_rect[1] += Camera.position[1];
					drawRect(drawing_rect, "lime", 0, "black", 1, 5)
				}
			}
		}
	}

	if(lvl > 2 && lvl-2 < 6){
		if(disp_text.length < 23 && question_timer < 0){
			question_timer = 0.1;
			sfx.click.play()
			let targ = "SECURITY QUESTION No. "+(lvl-2)
			disp_text+=targ[disp_text.length]
		}
		showText(disp_text, windowW*0.5, windowH*0.15, 35, "lime", true);
	}
}

function addNoise() {
	let ctx = c;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Randomly modify pixel values to add noise
    for (let i = 0; i < data.length; i += 4) {
      data[i] += Math.random() * 30 - 10;   // Red
      data[i + 1] += Math.random() * 30 - 10; // Green
      data[i + 2] += Math.random() * 30 - 10; // Blue
    }

    ctx.putImageData(imageData, 0, 0);
  }

let prev_time = 0
let b = 0.05;
let d = 0.05;
let mag = 0.01
let theta = 0;
let question_timer = 0.5
function main(curr_time){
	if(prev_time == 0){ prev_time = curr_time; }
	let dt = (curr_time - prev_time)/1000;
	prev_time = curr_time;

	b = math.sin(theta)*mag;
	d = math.cos(theta)*mag;
	//theta += dt*math.pi/2;
	question_timer -= dt;
	if(isTransitioned){
		draw();
		if(!menu){
			update_main_ui(dt);
		}
		update(dt);
		addNoise();
	}
	// trans stuff
	if(transitionRectW > 0){
		drawRect([0 ,0,windowW, (transitionRectW/windowW) * windowH/1.5])
		drawRect([0 ,windowH,windowW, -(transitionRectW/windowW) * windowH/1.5])
	}
	if(math.abs(transitionRectW - windowW) < 0.5){
		isTransitioned = true;
		transitionRectW = windowW
	}

	if(isTransitioned){
		transitionRectW = lerp(transitionRectW, 0, transSpeed*5);
	}else{
		transitionRectW = lerp(transitionRectW, windowW, transSpeed);
	}

	oldKeys = {...keys};
	mouse.oldx = mouse.x;
	mouse.oldy = mouse.y;
	mouse.scroll = 0;
	requestAnimationFrame(main);
}

requestAnimationFrame(main);

