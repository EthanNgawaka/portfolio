class Entry{
	constructor(text, list, startingIndex, actualIndex){
		this.text = text;
		this.parent = list;
		this.index = startingIndex;
		this.debugIndex = actualIndex;

		this.rect = [this.parent.rect[0]+this.parent.rect[2]*0.125,this.parent.rect[1]+this.parent.rect[3]/2+this.index,0,0];
		this.oldMousePos = [null, null];
		this.targetRect = this.rect;

		this.box = new image("./assets/imgs/ui/button.png");
		this.prevCol = false;
		this.confirmation = true;
		this.flick = false;
		this.oldIndex = this.index;
	}

	update(){
		if(this.parent.draggedObj != this){
			let t = 0.1;
			this.rect[0] = lerp(this.rect[0], this.targetRect[0], t);
			this.rect[1] = lerp(this.rect[1], this.targetRect[1], t);
			if(this.oldIndex != this.index){
				if(!this.flick && transTimer <= transThresh/4 && this.parent.animationTimer <= 0){
					this.flick = true;
					sfx.select.play()
				}
			}else{
				this.flick = false;
			}
			this.oldIndex = this.index;
		}

		if(!this.parent.draggedObj){
			let collision = AABBCollision(this.rect, [mouse.x,mouse.y,0,0]);
			if(collision && mouse.button.left){
				sfx.click.play();
				this.parent.draggedObj = this;
				this.oldMousePos = [mouse.x, mouse.y];
			}
		}
	}

	drag(){
		let ds = [mouse.x - this.oldMousePos[0], mouse.y - this.oldMousePos[1]];
		this.rect = add_rect(this.rect, ds);
		this.oldMousePos = [mouse.x, mouse.y];

		if(!mouse.button.left){
			this.parent.draggedObj = null;
			this.confirmation = false;
		}
	}

	snap(index){
		this.index = index;
		this.targetRect = this.parent.get_rect_from_index(index);
		this.rect[2] = this.targetRect[2];
		this.rect[3] = this.targetRect[3];
	}

	draw(){
		//drawRect(this.rect);
		let collision = AABBCollision(this.rect, [mouse.x,mouse.y,0,0]);
		let drawing_rect = this.rect;
		if(this.parent.shake > 0){
			drawing_rect = add_rect(drawing_rect, [random(-this.parent.shakeIntensity, this.parent.shakeIntensity), random(-this.parent.shakeIntensity, this.parent.shakeIntensity)]);
			this.parent.shake -= 1;
		}
		let size = 1;
		let comparison_rect = drawing_rect;
		if(collision && (!this.parent.draggedObj || this.parent.draggedObj==this)){
			if(!this.prevCol){ sfx.select.play(); }
			drawing_rect = enlargeRect(this.rect, 1.05, 1.05);
			size = 1.05;
		}
		if(this.parent.mode == "easy" && this.parent.draggedObj == this){
			drawGlowRect(this.parent.get_rect_from_index(this.debugIndex), "#f1ffc7");
		}
		this.box.drawImg(...drawing_rect, 1);
		showText(this.text, drawing_rect[0]+drawing_rect[2]/2, drawing_rect[1]+drawing_rect[3]/1.5, 30*size, "black", false, false, "Delicious Handrawn");

		if(
			this.parent.draggedObj != this && 
			this.parent.mode == "easy" &&
			this.index == this.debugIndex &&
			comparison_rect[1] == this.rect[1] &&
			comparison_rect[0] == this.rect[0] &&
			!("retry" in buttons)
		){
			if(!this.confirmation){
				this.confirmation = true;
				sfx.confirmation.play();
			}
			drawGlowRect(drawing_rect, "#00ff08");
		}

		this.prevCol = collision;

		// debug showText(this.debugIndex, this.rect[0]-100, this.rect[1]+this.rect[3]/1.5, 20, "black");
	}
}

class List{
	constructor(rect){
		this.hammerImg = new image("./assets/imgs/kai/hammer.webp");
		this.hammer_pos = [windowW/1.3,windowH/6];
		this.hammer_deg = -Math.PI/2;
		this.entries = [];
		this.rect = rect;
		this.draggedObj = null;
		this.task = null;
		this.sorting_self = false;
		this.previous_tasks = [];

		this.notebook = new image("./assets/imgs/bg/book.png");
		this.doShatter = true;

		this.shake = 0;
		this.shakeIntensity = 1;
		this.mode = '';
		this.titleBg = new image("./assets/imgs/bg/torn_paper.png");

		this.animationTimer = 0;
		this.animationTimerMax = 5.5;
		this.startOfRound = false;
		this.animationLerpFact = 0;
		this.deg = 0;
	}

	get_entry_from_text(string){
		for(let i of this.entries){
			if(i.text == string){ return i; }
		}
		return false;
	}

	retry(){
		this.sorting_self = false;
		this.shuffle(this.task.subtasks);
	}

	sort_self(){
		this.sorting_self = true;
		let order = this.format_entries();
		let ordered_subtasks = this.task.subtasks;

		for(let [index, text]  of Object.entries(ordered_subtasks)){
			this.get_entry_from_text(text).snap(index);
		}
	}

	format_entries(){
		let order = {};
		for(let i of this.entries){
			order[i.text] = i.index;
		}
		return order;
	}

	validate(){
		let order = this.format_entries();

		return this.task.validate_order(order);
	}

	shuffle(chosen_list){
		this.entries = [];
		let indices = [1,2,3,4,5];
		for(let [index, string] of Object.entries(chosen_list)){
			let ind = random(0,indices.length-1,true);
			this.entries.push(new Entry(string, this, indices[ind], index));
			indices = arrayRemove(indices, indices[ind]);
		}
	}

	populate_from_rand_array(rand_list){
		if(this.task){ this.previous_tasks.push(this.task); }
		this.sorting_self = false;
		this.draggedObj = null;
		//this.previous_tasks = [];

		let mod_rand = rand_list;
		for(let prev_task of this.previous_tasks){
			mod_rand = arrayRemove(mod_rand, prev_task);
		}
		this.task = mod_rand[random(0, mod_rand.length-1, true)];
		if(!this.task){
			console.log(mod_rand);
			this.previous_tasks = [];
			this.populate_from_rand_array(rand_list);
			return;
		}
		let chosen_list = this.task.subtasks;

		this.shuffle(chosen_list);
		this.snap_to_list();
		this.startOfRound = true;
	}
	update(){
		if(this.animationTimer <= 0){
			for(let entry of this.entries){
				entry.update();
			}

			if(this.draggedObj){
				this.draggedObj.drag();
			}
		}
	}

	sort_entries(){
		let indices = [];
		let map = {};
		for(let i of this.entries){
			map[i.rect[1]+i.rect[3]/2] = i;
			indices.push(i.rect[1]+i.rect[3]/2);
		}
		indices.sort((a,b) => a - b);
		let sorted_entries = [];
		for(let i of indices){
			sorted_entries.push(map[i]);
		}
		return sorted_entries;
	}

	get_rect_from_index(index){
		let vpadding = 0.05;
		let w = this.rect[2] * 0.75;
		let h = (this.rect[3]/5)*(1-(5+1)*vpadding)
		let x = this.rect[0] + this.rect[2] * 0.125;
		let y = this.rect[1] + index*(vpadding*this.rect[3]) + (index-1)*h;
		return [x,y,w,h];
	}

	snap_to_list(){
		if(this.sorting_self){ return; }
		let sorted_entries = this.sort_entries();
		for(let i = 0; i < sorted_entries.length; i ++){
			let entry = sorted_entries[i];
			if(entry == this.draggedObj){ continue; }
			entry.snap(i+1);
		}
	}

	draw(dt){
		//drawRect(this.rect, "gray");
		let drawingRect = enlargeRect(this.rect, 1.75, 1.5);
		this.notebook.drawImg(...drawingRect, 1);
		this.snap_to_list();

		if(this.startOfRound){
			this.startOfRound = false;
			this.animationTimer = this.animationTimerMax;
			this.hammer_pos = [windowW/1.3,windowH/6];
		}

		let drawOrder = this.entries;
		if(this.draggedObj){
			drawOrder = arrayRemove(this.entries, this.draggedObj);
			drawOrder.push(this.draggedObj);
		}

		let title_rect = [...this.rect];
		title_rect[3] = 60;
		title_rect[1] -= 65;
		title_rect[1] += this.rect[3]/2*this.animationLerpFact

		let growth = lerpFunc((this.animationTimer-this.animationTimerMax/3)*2/this.animationTimerMax);
		title_rect = enlargeRect(title_rect, 1+growth/5, 1+this.animationLerpFact*2);

		let angle2 = Math.PI/12 * Math.sin(this.deg); 
		let used_angle = 0;
		if(this.deg > 0){
			used_angle = angle2;
		}

		this.titleBg.drawRotatedImg(...title_rect, 1, used_angle);
		showText("task: " + this.task.name, title_rect[0]+title_rect[2]/2,title_rect[1]+title_rect[3]/(1.4 + 0.6*this.animationLerpFact), 40+10*this.animationLerpFact+10*growth, "black" , false, false, "Delicious Handrawn");

		if(this.animationTimer <= 0){
			for(let i of drawOrder){
				i.draw();
			}
			this.animationLerpFact = lerp(this.animationLerpFact, 0, 0.1);
			this.deg = lerp(this.deg, 16*Math.PI/2, 0.1);
			this.hammer_deg = lerp(this.hammer_deg, -Math.PI/2, 0.2);
			if(Math.abs(this.hammer_deg + Math.PI/2) < 1){
				if(this.doShatter){
					conf_man.shatter();
					this.doShatter = false;
				}
			}
			if(Math.abs(this.hammer_deg + Math.PI/2) < 0.1){
				this.hammer_pos = lerpArray(this.hammer_pos, [windowW+400,0], 0.05);
			}
		}else{
			this.deg = 0;
			this.doShatter = true;
			this.hammer_deg = lerp(this.hammer_deg, Math.PI/4, 0.01);
			this.hammer_pos = lerpArray(this.hammer_pos, [windowW/2,0], 0.01);
			this.animationLerpFact = 1;
			this.animationTimer -= dt/1000;
			if(this.animationTimer <= 0.3 && !sfx.hammer1.playing()){
				sfx.hammer1.play();
				//sfx.hammer2.play();
			}
		}
		this.hammerImg.drawRotatedImg(...this.hammer_pos,400,400, 1, this.hammer_deg);
	}
}
