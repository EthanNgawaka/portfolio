class Light{
	constructor(col, pos, size){
		this.col = col;
		this.pos = pos;
		this.r = size;
		this.alpha = random();
		this.timer = 0;
		this.a = random(1,2.5);
		this.t = 0;
	}
	update(dt){
		this.alpha = 0.5 * (math.sin(this.timer*math.pi*this.a) + 1)
		this.t = (math.abs(math.sin(this.timer*math.pi)) + 1)/2
		if(this.alpha < 0.1){
			this.pos[1] = random(0,windowH);
		}
		this.timer += dt;
	}
	draw(){
		drawCircle(this.pos, this.r*this.t, this.col, 1, this.col, this.alpha);
	}
}
class CycleImages{
	constructor(rect, imgs){
		this.images = [];
		for(let img of imgs){
			this.images.push(new image(img))
		}

		this.rect = rect;
		this.timer = 0;
		this.swap_freq = 1;
		this.last_swap = 0;
		this.index = 0;
	}
	draw(){
		if(math.abs(this.timer - this.last_swap) < this.swap_freq){
			this.images[this.index].drawImg(...this.rect, 1);
		}
	}
	update(dt){
		this.timer += dt;
		if(math.abs(this.timer - this.last_swap) > this.swap_freq*2){
			this.last_swap = this.timer;
			this.index ++;
			if(this.index >= this.images.length){
				this.index = 0;
			}
		}
	}
}
class Label{
	constructor(string, size, pos, col="lime", font="Orbitron", bold=false, alignment="center"){
		this.text = [string, size];
		this.pos = pos;
		this.col = "lime";
		this.font = font;
		this.bold = bold;
		this.alignment = alignment;

		this.cutoff = null;
		this.tag = "";
		this.oldDY = 0;
		this.vel = 0;
		this.timer = 0;
		this.startY = this.pos[1];

		this.flash_timer = 0;
		this.last_flash = 0;
		this.visible = true;
		this.outline = false;
	}

	update(dt){
		this.flash_timer -= dt;
		if(math.abs(this.flash_timer - this.last_flash) > 0.3){
			this.last_flash= this.flash_timer;
			this.visible = !this.visible;
		}
		if(this.timer > 0){
			this.timer -= dt;
		}else{
			this.pos[1] = lerp(this.pos[1], this.startY, 0.1);
		}
		if(this.tag == "scroll"){
			this.pos[1] -= this.vel;
			this.vel *= 0.8;
			if(mouse.scroll != 0 && mouse.scroll.deltaY != this.oldDY){
				this.timer = 5;
				this.vel += mouse.scroll.deltaY/15;
				this.oldDY = mouse.scroll.deltaY;
			}
			if(mouse.scroll == 0){
				this.oldDY = 0
			}
		}
	}

	draw(){
		if(this.cutoff == null || (this.pos[1] > this.cutoff[0] && this.pos[1] < this.cutoff[1])){
			if(this.text[0][0] == "!"){
				if(!this.visible){
					return;
				}
			}
			showText(this.text[0], this.pos[0], this.pos[1], this.text[1], this.col, this.bold, false, this.font, this.alignment);
			if(this.outline){
				drawRect([this.pos[0]-windowW*0.1/2,this.pos[1]-15, windowW*0.4, 15*1.2], "lime", 0)
			}
		}
	}
}

class Button{
	constructor(rect, image_path, string, txt_col, onAction, font="Orbitron"){
		this.rect = rect;
		this.drawing_rect = rect;
		this.img = image_path
		if(image_path != null){
			this.img = new image(image_path);
		}
		this.string = string;
		this.col = txt_col;
		this.font = font;
		this.onAction = onAction;

		this.hovered = false;
		this.pressed = true;
		this.disable = false;
		this.prevHover = false;
		this.bold = true;

		this.correct_string = null;
		this.nextSqr = null;
		this.prevSqr = null;
		this.typingInThis = false;

		this.bg_col = "lime";
		this.number = "";
		this.start_rect = [0,0];
		this.prevDown = false;
		this.stillClicked = false;
		this.off = 7;
		this.tag = "";
		this.txtBox = new TextBox(this.string, this.rect, this.rect[3]/6, "lime", [this.rect[3]/6,this.rect[3]/6]);
		this.crossword = true;
		this.scale = 1;
	}

	down(){
	}

	update(dt){
		if(this.tag == "hint"){
			//this.rect[1] = lerp(this.rect[1], windowH/2-this.rect[3]/2, 0.1);
			this.scale = lerp(this.scale, 1, 0.1);
		}
		this.hovered = AABBCollision(this.rect, [mouse.x,mouse.y,0,0])&&!this.disable;
		if(mouse.button.left){
			this.down();
		}
		if(this.hovered){
			if(!this.prevHover){
				sfx.select.play();
			}
			if(mouse.button.left && !this.pressed){
				this.stillClicked = true;
				this.onAction(this)
				this.pressed = true;
				sfx.click.play();
			}
		}
		this.prevHover = this.hovered;
		this.pressed = mouse.button.left;
	}

	get center(){
		return [this.rect[0]+this.rect[2]/2, this.rect[1]+this.rect[3]/2];
	}

	draw(){
		let drawing_rect = [...this.drawing_rect];
		drawing_rect[0] += Camera.position[0];
		drawing_rect[1] += Camera.position[1];
		if(this.hovered && this.tag != "hint"){
			drawing_rect = enlargeRect(drawing_rect, 1.05, 1.05);
			if(this.pressed){
				drawing_rect = enlargeRect(drawing_rect, 0.92, 0.92);
			}
		}

		if(this.img != null){
			this.img.drawImg(...enlargeRect(drawing_rect,this.scale, this.scale), 1);
			if(this.tag == "hint"){
				this.txtBox.rect = this.rect;
				this.txtBox.draw();
				return;
			}
			showText(this.string, this.center[0]+Camera.position[0], this.center[1] + this.rect[3]/this.off+Camera.position[1], drawing_rect[3]/2, this.col, this.bold, false, this.font);
		}else if(this.crossword){
			this.col = "lime";
			drawRect(drawing_rect, "lime", 0)
			showText(this.string, this.center[0]+Camera.position[0], this.center[1] + this.rect[3]/this.off+Camera.position[1], drawing_rect[3]/2, this.col, this.bold, false, this.font);
			showText(this.number, this.center[0]+Camera.position[0] - this.rect[2]/2, this.center[1] + this.rect[3]/7+Camera.position[1] - this.rect[3]*0.9, drawing_rect[3]/3, this.col, true, false, this.font, "left");
		}else{
			this.col = "lime";
			drawing_rect[1] += drawing_rect[3] * 0.9;
			drawing_rect[3] *= 0.1;
			drawRect(enlargeRect(drawing_rect,0.85,1), "lime")
			showText(this.string, this.center[0]+Camera.position[0], this.center[1] + this.rect[3]/this.off+Camera.position[1], drawing_rect[3]*6, this.col, this.bold, false, this.font);
		}
	}
}

function add_new_crossword_square(correct_letter, row, col, acrossOrDown, size=0.05, isEven=false, crossword=false){
	let w = windowW*size/2;
	let h = windowW*size/2;
	let topleft = [w*14, h*6];
	if(size != 0.05){
		topleft = [w*5.5, h*7.5];
	}
	if(isEven){
		topleft[0] += w*0.5
	}
	let btn1 = new Button(
		[topleft[0]+col*w, topleft[1]+row*h, w, h], null, "", "black",
		function(btn){
			for(let row of crossword_grid){
				for(let col of row){
					if(col != null){
						col.typingInThis = false;
					}
				}
			}
			btn.typingInThis = true;
			for(let f of crossword_event_listener){
				document.removeEventListener('keydown', f);
			}
			function handleKeyPress(event) {
				btn.typingInThis = false;
				sfx.click.play();
				for(let f of crossword_event_listener){
					document.removeEventListener('keydown', f);
				}
				let code = event.keyCode;
				if(event.key == "Backspace"){
					btn.string = "";
					if(btn.prevSqr != null){
						btn.prevSqr.onAction(btn.prevSqr);
					}
					return;
				}else if((code > 47 && code < 58) || (code > 64 && code < 91)){ // TODO if an alphabet char
					btn.string = event.key.toUpperCase();
				}else{
					shakeTimer = 0.1;
					sfx.fail.play();
					return;
				}
				// this is kinda hacky but it works soooo
				if(btn.nextSqr != null){
					btn.nextSqr.prevSqr = btn;
					btn.nextSqr.dir = btn.dir;
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
							}
						}
					}
					btn.nextSqr.onAction(btn.nextSqr);
				}
			}
			crossword_event_listener.push(handleKeyPress);
			document.addEventListener('keydown', handleKeyPress);
		}
	);
	btn1.correct_string = correct_letter;
	btn1.bold = true;
	btn1.dir = acrossOrDown;
	btn1.crossword = crossword;
	return btn1
}

function add_crossword_word(string, acrossOrDown, startRowCol, number){
	let rC = startRowCol;
	let sqrs = [];
	for(let i = 0; i < string.length; i++){
		crossword_grid[rC[0]][rC[1]] = add_new_crossword_square(string[i], rC[0], rC[1], acrossOrDown, 0.05, false, true);
		if(i == 0){
			crossword_grid[rC[0]][rC[1]].number = number;
			if(number == 4){
				crossword_grid[rC[0]][rC[1]].number = "4, 2";
			}
		}
		if(acrossOrDown == "down"){ rC[0]++; }
		else{ rC[1]++; }
	}
}
