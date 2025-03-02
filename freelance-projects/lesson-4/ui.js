let worry_timer = 0;
let worry_max = 45;
let worry_increase = 0.5;

class Sparkle{
	constructor(pos){
		let size = windowH * 0.1 * random(0,2);
		this.size = size;
		this.rect = [pos[0]-size/2, pos[1]-size/2 + random(-8,8)*size, size, size];
		this.img = new image("./assets/imgs/ui/sparkle.png");
		this.rot = random(0,1) * math.pi;
		this.vel = [random(-1,1)*300, random(-1,1)*300];
		this.lifetime = random(0,4);
		this.start = this.lifetime;
	}
	update(dt){
		this.rot += dt*math.pi;
		this.rect[0] += this.vel[0]*dt;
		this.rect[1] += this.vel[1]*dt;
		this.vel[1] -= 10*dt;

		this.vel[0] -= this.vel[0]*dt/10;
		this.vel[1] -= this.vel[1]*dt/10;
		this.lifetime -= dt;

		this.rect[2] = this.size * this.lifetime/this.start;
		this.rect[3] = this.size * this.lifetime/this.start;
		if(this.lifetime <= 0){
			entities = arrayRemove(entities, this);
		}
	}
	draw(){
		this.img.drawRotatedImg(...this.rect, this.lifetime/this.start, this.rot);
	}
}

class CharPopUp{
	constructor(img_src, rect, text, above=false){
		this.above = above;
		this.string = "";
		this.img = new image(img_src);
		this.rect = rect;
		this.text = text;
		this.text_timer = 0;
		this.ind = 0;
		this.bubble = new image("./assets/imgs/ui/button.png");
		this.draw_rect = [...this.rect];
		this.draw_rect[1] = windowH;
		this.bubble_bounce = 0;
		this.targ = this.rect[1]

		this.change_string(this.string);
		this.timer = 0;
	}
	change_string(new_string){
		this.string = new_string;
		let w = windowW*0.3;
		let h = windowH*0.3;
		this.textBox = new TextBox(this.string, [this.rect[0]-w/1.3, this.rect[1]-h/1.3, w, h], 30*this.bubble_bounce, "black", [25,25]);
		//this.textBox.rect = [this.rect[0]-w/1.3 - this.bubble_bounce*w, this.rect[1]-h/1.3 - this.bubble_bounce*h, this.bubble_bounce*w, this.bubble_bounce*h]
	}
	close(){
		this.targ = windowH;
	}
	update(dt){
		this.text_timer += dt;
		if(this.text_timer > 0.04 && this.ind < this.text.length && math.abs(this.draw_rect[1]-this.rect[1]) < 1){
			this.bubble_bounce = lerp(this.bubble_bounce, (this.targ == windowH) ? 0 : 1, 0.3);
			let w = windowW*0.3;
			let h = windowH*0.3;
			this.change_string(this.string+this.text[this.ind]);
			this.textBox.rect = [w/2+this.rect[0]-w/1.3-w*this.bubble_bounce/2, h/2-h*this.bubble_bounce/2+this.rect[1]-h/1.3, this.bubble_bounce*w, this.bubble_bounce*h]
			if(this.above){
				this.textBox.rect[1] -= 90
				this.textBox.rect[0] += 250
			}
			this.textBox.textSize = 30*this.bubble_bounce;
			this.ind ++;
			this.text_timer = 0;
		}
		if(this.ind >= this.text.length){
			this.timer += dt;
			//if(this.timer > 4){
				//this.close();
			//}
			let w = windowW*0.3;
			let h = windowH*0.3;
			this.bubble_bounce = lerp(this.bubble_bounce, (this.targ == windowH) ? 0 : 1, 0.3);
			this.textBox.rect = [w/2+this.rect[0]-w/1.3-w*this.bubble_bounce/2, h/2-h*this.bubble_bounce/2+this.rect[1]-h/1.3, this.bubble_bounce*w, this.bubble_bounce*h]
			if(this.above){
				this.textBox.rect[1] -= 90
				this.textBox.rect[0] += 250
			}
			this.textBox.textSize = math.max(30*this.bubble_bounce, 0);
			if(math.abs(windowH - this.draw_rect[1]) < 1 && this.targ == windowH){
				return true;
			}
		}
		return false;

	}
	draw(){
		this.draw_rect[1] = lerp(this.draw_rect[1], this.targ, 0.1);
		let draw_rect = [...this.draw_rect];
		this.img.drawImg(...draw_rect, 1);
		if(this.string.length > 0){
			draw_rect = [...this.textBox.rect];
			draw_rect[1] += 10
			draw_rect[0] -= 4
			this.bubble.drawImg(...draw_rect, 1);
			this.textBox.draw();
		}
	}
}

class ComicChar{
	constructor(img_src, rect, text){
		this.string = "";
		this.img = new image(img_src);
		this.rect = rect;
		this.text = text;
		this.text_timer = 0;
		this.ind = 0;
		this.bubble = new image("./assets/imgs/ui/button.png");
		this.draw_rect = [...this.rect];
		this.draw_rect[1] = windowH;
		this.bubble_bounce = 0;
		this.targ = this.rect[1]

		this.change_string(this.string);
	}
	change_string(new_string){
		this.string = new_string;
		let w = windowW*0.3;
		let h = windowH*0.3;
		this.textBox = new TextBox(this.string, [this.rect[0]-w/1.3, this.rect[1]-h/1.3, w, h], 30*this.bubble_bounce, "black", [25,25]);
		//this.textBox.rect = [this.rect[0]-w/1.3 - this.bubble_bounce*w, this.rect[1]-h/1.3 - this.bubble_bounce*h, this.bubble_bounce*w, this.bubble_bounce*h]
	}
	close(){
		this.targ = windowH;
	}
	update(dt){
		this.text_timer += dt;
		if(this.text_timer > 0.04 && this.ind < this.text.length && math.abs(this.draw_rect[1]-this.rect[1]) < 1){
			this.bubble_bounce = lerp(this.bubble_bounce, (this.targ == windowH) ? 0 : 1, 0.3);
			let w = windowW*0.3;
			let h = windowH*0.3;
			this.change_string(this.string+this.text[this.ind]);
			this.textBox.rect = [w/2+this.rect[0]-w/1.3-w*this.bubble_bounce/2, h/2-h*this.bubble_bounce/2+this.rect[1]-h/1.3, this.bubble_bounce*w, this.bubble_bounce*h]
			this.textBox.textSize = 30*this.bubble_bounce;
			this.ind ++;
			this.text_timer = 0;
		}
		if(mouse.button.left && !mouse_down2){
			this.close();
			if(this.text.length > 0){
				this.change_string(this.text[0]);
				this.ind = this.text.length
			}
		}
		if(this.ind >= this.text.length){
			let w = windowW*0.3;
			let h = windowH*0.3;
			this.bubble_bounce = lerp(this.bubble_bounce, (this.targ == windowH) ? 0 : 1, 0.3);
			this.textBox.rect = [w/2+this.rect[0]-w/1.3-w*this.bubble_bounce/2, h/2-h*this.bubble_bounce/2+this.rect[1]-h/1.3, this.bubble_bounce*w, this.bubble_bounce*h]
			this.textBox.textSize = math.max(30*this.bubble_bounce, 0);
			if(math.abs(windowH - this.draw_rect[1]) < 1 && this.targ == windowH){
				return true;
			}
		}
		return false;

	}
	draw(){
		this.draw_rect[1] = lerp(this.draw_rect[1], this.targ, 0.1);
		let draw_rect = [...this.draw_rect];
		this.img.drawImg(...draw_rect, 1);
		if(this.string.length > 0){
			draw_rect = [...this.textBox.rect];
			draw_rect[1] += 10
			draw_rect[0] -= 4
			this.bubble.drawImg(...draw_rect, 1);
			this.textBox.draw();
		}
	}
}

class Overlay{
	constructor(col, lifetime){
		this.col = col;
		this.lifetime = lifetime;
		this.maxlifetime = lifetime;
	}
	draw(){
		drawRect([0,0,windowW,windowH], this.col, 1, this.col, this.lifetime/2*this.maxlifetime)
	}
	update(dt){
		this.lifetime -= dt;
		if(this.lifetime <= 0){
			entities = arrayRemove(entities, this);
		}
	}
}

class Button{
	constructor(rect, image_path, string, txt_col, onAction, font="Komika"){
		this.rect = rect;
		this.drawing_rect = rect;
		this.img = new image(image_path);
		this.string = string;
		this.col = txt_col;
		this.font = font;
		this.onAction = onAction;

		this.hovered = false;
		this.pressed = true;
		this.disable = false;
		this.prevHover = false;

		this.override_size = 0;
		this.fade_in = 0;
		this.fade_in_start = 0;
		this.wiggle_timer = 0;
		this.wiggle = 0;
		this.a = 1;
		this.b = random(1,3);
		this.enlarge = 1;
	}
	fade(time){
		this.fade_in = time;
		this.fade_in_start = time;
	}
	update(dt){
		if(this.fade_in > 0){
			this.fade_in -= dt*7;
		}
		let w = 40;
		let h = 40;
		this.hovered = AABBCollision(this.rect, [mouse.x-w/2,mouse.y-h/2,w,h])&&!this.disable;
		if(this.hovered){
			if(!this.prevHover){
				sfx.select.play();
			}
			if(mouse.button.left && !this.pressed){
				this.onAction(this)
				this.pressed = true;
				sfx.click.play();
			}
		}
		this.prevHover = this.hovered;
		this.pressed = mouse.button.left;
		if(this.fade_in_start > 0 && !this.disable){
			this.wiggle_timer += dt;
			this.wiggle = this.a*math.cos(this.b*this.wiggle_timer)*this.rect[3]/10;
		}
	}

	get center(){
		return [this.rect[0]+this.rect[2]/2, this.rect[1]+this.rect[3]/2];
	}

	draw(){
		let opacity = 1;
		if(this.fade_in > 0){
			opacity = (1-this.fade_in/this.fade_in_start);
		}
		let drawing_rect = enlargeRect([...this.drawing_rect], this.enlarge, this.enlarge);
		this.enlarge = lerp(this.enlarge, 1, 0.1);
		drawing_rect[1] += (1-opacity)*this.rect[3]/2 + this.wiggle
		if(this.hovered){
			drawing_rect = enlargeRect(drawing_rect, 1.05, 1.05);
			if(this.pressed){
				drawing_rect = enlargeRect(drawing_rect, 0.92, 0.92);
			}
		}

		this.img.drawImg(...drawing_rect, opacity);

		let size = drawing_rect[3]/2
		if(this.override_size > 0){
			size = this.override_size
		}
		c.globalAlpha = opacity;
		showText(this.string, this.center[0], this.wiggle + this.center[1] + (1-opacity)*this.rect[3]/2 + this.rect[3]/7, size, this.col, false, false, this.font);
		c.globalAlpha = 1;
	}
}

const pool = [
  ["I can solve this math problem if I take it one step at a time.", "I’ll never be good at math, so why try?", "It’s too hard; I should just give up now."],
  ["Mistakes are part of learning; I’ll try again.", "I’m so bad at this; I can’t get anything right.", "If I fail once, I’ll always fail."],
  ["I might not know it yet, but I can learn if I keep trying.", "I’ll never understand this no matter how hard I try.", "Some people are just naturally better than me."],
  ["I am allowed to take a break and try again when I feel ready.", "If I stop now, I’m a failure.", "Everyone else would finish without needing a break."],
  ["I’ll improve my drawing with practice and patience.", "I’m just not talented enough to draw well.", "I’ll never get better, so why bother practicing?"],
  ["I am doing my best, and that is enough.", "My best isn’t good enough.", "Everyone else is better than me."],
  ["I can make new friends by being kind and open.", "Nobody will want to be my friend.", "I’m not interesting enough for anyone to like me."],
  ["I can try a different strategy if this one isn’t working.", "There’s no point in trying something new; it won’t work.", "If I couldn’t do it the first time, I never will."],
  ["I am brave enough to face this challenge.", "I can’t handle this; it’s too scary.", "I’ll embarrass myself if I even try."],
  ["Even if it’s hard, I’ll feel proud once I’ve done it.", "This is too difficult; it’s not worth the effort.", "I’ll only feel worse if I fail."],
  ["I can apologize and make things right.", "I’ve messed up too badly to fix this.", "Nobody will forgive me no matter what I do."],
  ["It’s okay not to know everything; I’ll ask for help.", "If I ask for help, people will think I’m dumb.", "Everyone else already knows this; I should too."],
  ["I am stronger than I think I am.", "I don’t have what it takes to get through this.", "Other people are stronger than me."],
  ["Every small step I take brings me closer to my goal.", "Small steps won’t make any difference.", "I’ll never reach my goal, no matter what I do."],
  ["I can speak up and share my ideas.", "Nobody wants to hear what I have to say.", "If I speak up, I’ll sound stupid."],
  ["I deserve to treat myself with kindness.", "I’m too lazy to deserve kindness.", "If I’m not perfect, I don’t deserve anything nice."],
  ["I’ll try again tomorrow with a fresh perspective.", "If I couldn’t do it today, I won’t be able to tomorrow.", "Why even bother trying again?"],
  ["I can learn from this mistake and do better next time.", "This mistake proves I’ll never be good enough.", "Failing once means I’ll always fail."],
  ["It’s okay to feel nervous before trying something new.", "If I feel nervous, it means I’m not ready.", "Being nervous means I’ll fail."],
  ["I can improve with practice and time.", "I don’t have what it takes to improve.", "No matter how much I practice, it won’t help."],
  ["I am capable of handling difficult situations.", "I can’t deal with this; it’s too much.", "Everyone else could handle this better than me."],
  ["I can take deep breaths and stay calm.", "Calming down won’t help; I’ll still mess up.", "Nothing I do will make this better."],
  ["I am proud of what I’ve achieved so far.", "What I’ve done isn’t good enough.", "There’s nothing to be proud of."],
  ["I can focus on what I can control.", "Everything is out of my control.", "No matter what I do, it won’t matter."],
  ["I can try my best, and that’s what counts.", "If I’m not perfect, my effort doesn’t matter.", "Trying my best isn’t enough."],
  ["It’s okay to ask questions if I don’t understand.", "I’ll look silly if I ask questions.", "Everyone will think I’m dumb for not knowing."],
  ["I can stay focused and finish this task step by step.", "This task is too big for me to handle.", "I’ll never finish, so why start?"],
  ["I am unique and bring value to the world.", "I don’t matter as much as other people.", "There’s nothing special about me."],
  ["I can ask for support when I need it.", "Asking for help is a sign of weakness.", "Nobody will want to help me."],
  ["I can choose to see the good in myself and others.", "There’s nothing good about me or my efforts.", "Other people always have it better than me."],
  ["I can learn from this challenge and grow stronger.", "This challenge is too much for me to handle.", "I’ll only get weaker if I keep failing."],
  ["I am allowed to take things one step at a time.", "If I’m not doing everything at once, I’m failing.", "There’s no point in doing things slowly."],
  ["I am worthy of love and kindness, no matter what.", "I need to earn love by being perfect.", "If I make mistakes, I don’t deserve kindness."],
  ["I can handle this situation calmly and thoughtfully.", "I’m too emotional to deal with this properly.", "I always mess things up when it matters most."],
  ["I am resilient and can bounce back from setbacks.", "Once I fail, I can never recover.", "I’m too fragile to handle tough situations."],
  ["It’s okay to start over if I need to.", "Starting over is just another way to fail.", "If I didn’t get it right the first time, I never will."],
  ["I can learn to focus on what truly matters.", "There’s too much to do; I’ll never prioritize correctly.", "I can’t tell what’s important anymore."],
  ["I can be kind to myself even when I make mistakes.", "I don’t deserve kindness if I mess up.", "Being hard on myself is the only way to improve."],
  ["I can try new things and discover my strengths.", "I’m not good at anything new, so why bother?", "Other people are already better at this than I could ever be."],
  ["I am capable of solving problems with patience and creativity.", "I’m not smart enough to figure this out.", "No solution will work because I’ll mess it up."],
  ["I can find joy in the process, not just the outcome.", "If the result isn’t perfect, the effort is pointless.", "There’s nothing enjoyable about trying hard."],
  ["I can trust myself to make good decisions.", "I always choose the wrong thing.", "I need someone else to decide for me."],
  ["I can manage my feelings and stay calm.", "I always lose control when things go wrong.", "Staying calm is impossible for me."],
  ["I can forgive myself for my mistakes.", "I should always feel bad about my failures.", "I don’t deserve forgiveness for what I’ve done."],
  ["I am brave enough to face my fears.", "My fears are too big for me to handle.", "Avoiding things is the only way I’ll feel safe."],
  ["I can improve my skills with consistent practice.", "I’ll never get better no matter how hard I try.", "Practice doesn’t work for someone like me."],
  ["I am in control of my own happiness.", "Other people are responsible for my happiness.", "I can’t feel happy unless everything is perfect."],
  ["I can be proud of my progress, no matter how small.", "Small progress doesn’t count for anything.", "There’s nothing to feel proud of yet."],
  ["I can adapt and find new ways to succeed.", "Change is too hard for me to handle.", "I can’t succeed if things don’t go as planned."],
  ["I can ask for help and still be strong.", "Asking for help makes me look weak.", "If I need help, I’m not capable enough."],
  ["I am enough just as I am.", "I need to be better for anyone to accept me.", "There’s nothing good about who I am right now."],
  ["I can overcome challenges by staying persistent.", "This challenge is too big for me to handle.", "Giving up is the only option when it’s hard."],
  ["I can take responsibility without blaming myself.", "Everything that goes wrong is my fault.", "I shouldn’t take responsibility because I’ll just fail."],
  ["I can be patient with myself as I learn.", "If I’m not perfect right away, I’ve failed.", "I don’t have the patience to improve."],
  ["I can enjoy the journey without worrying about the destination.", "If I don’t reach my goal fast, it’s not worth it.", "The process doesn’t matter if I don’t win."],
  ["I can share my feelings and be understood.", "Nobody will care about how I feel.", "Sharing my feelings will only make things worse."],
  ["I am capable of achieving my goals with time and effort.", "I don’t have what it takes to reach my goals.", "Some goals are just impossible for me."],
  ["I can focus on what’s going well in my life.", "Everything is going wrong right now.", "There’s nothing good to focus on."],
  ["I can take care of myself and my needs.", "Taking care of myself is selfish.", "My needs aren’t important compared to others."],
  ["I can handle criticism and use it to grow.", "Criticism means I’m not good enough.", "I can’t handle people pointing out my flaws."]
]
