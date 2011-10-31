
JSDungeon.cUtil = JAK.ClassMaker.makeClass({
	NAME : 'JSDungeon.cUtil',
	VERSION : '1.0'
});

JSDungeon.cUtil.prototype.$constructor = function(canvas, opt){
	this.canvas = canvas;
	this.color = '#666';
	this.Lopt = {
	    lwidth : 1,
	    part : 5,
	    color : '#0000cc',
	    lastDist : 10
	};
	for(i in opt){
	    this.Lopt[i] = opt[i];
	}
};

JSDungeon.cUtil.prototype.randRange = function(min, max){
	var rand = (Math.floor(Math.random() * (min-max+1))+min)*-1;
	//var rand = Math.floor(Math.random() * (max - min + 1) + min)
	return rand;
};

JSDungeon.cUtil.prototype.makeLine = function(f, t){
	this.canvas.save();
	this.canvas.beginPath();
	this.canvas.moveTo(f.x, f.y);
	this.canvas.lineTo(t.x, t.y);
	this.canvas.stroke();
	this.canvas.closePath();
	this.canvas.restore();
};

JSDungeon.cUtil.prototype.makeLight = function(f, t){
	this.canvas.save();
	this.canvas.beginPath();
	this.canvas.strokeStyle = this.Lopt.color;
	this.canvas.lineWidth = 2;
	this.canvas.moveTo(f.x, f.y);
	/*- pocatek -*/
	var tx = t.x-f.x;
	var ty = t.y-f.y;
	var ta = Math.atan2(ty, tx);
	var dist = Math.sqrt(((f.x-t.x)*(f.x-t.x))+((f.y-t.y)*(f.y-t.y)));
	var trans = 0;
	var partx = f.x;
	var party = f.y;
	var tn = ta;
	var i = 0;
	while( trans < dist ){
		var ra = Math.random();
	    ra = ra < 0.5 ? ra*-1 : ra;
		tn = Math.atan2((t.y-party), (t.x-partx));
	    partx = partx + this.Lopt.part * Math.cos(tn);
		party = party + this.Lopt.part * Math.sin(tn);
	    if(ra < 0.8){
	        tn = ta + ra;
	        partx = partx + this.Lopt.part * Math.cos(tn);
			party = party + this.Lopt.part * Math.sin(tn);
	    }
		lineDist = Math.sqrt(((partx-t.x)*(partx-t.x))+((party-t.y)*(party-t.y)));
		trans = dist - lineDist;
	    this.canvas.lineTo(partx, party);
		this.canvas.moveTo(partx, party);
		this.canvas.stroke();
		if(lineDist < this.Lopt.lastDist){ this.makeLine({ x : partx, y : party}, t); return; }
	}
	this.canvas.stroke();
	this.canvas.closePath();
	this.canvas.restore();
};

JSDungeon.cUtil.prototype.makeCircleLight = function(f, r){
	var a = 0;
	var tx = 0;
	var ty = 0;
	do{
		tx = f.x + r * Math.cos(a);
		ty = f.y + r * Math.sin(a);
		this.makeLight(f, {x:tx, y:ty});
		a += (Math.PI*6/100);
	} while( a <= 6.1 );
};

/**
 * sprite animation
 */
JSDungeon.Sprite = JAK.ClassMaker.makeClass({
	NAME : 'JSDungeon.Sprite',
	VERSION : '1.0'
});

JSDungeon.Sprite.prototype.$constructor = function(canvas, img, opt){
	this.opt = opt || {};
	this.dom = {};
	this.dom.canvas = JAK.gel(canvas);
	this.canvas = this.dom.canvas.getContext('2d');
	this.img = JAK.mel('img', { src : img });
	this.interval = this.opt.interval;
	this.step = this.interval/this.opt.steps;
	this.stepw = this.opt.step;
	this.direction = 'right';
	this.time = new Date().getTime()+this.interval;
	this.timekeeper = JAK.Timekeeper.getInstance();
	this.tick = this.timekeeper.addListener(this, '_anim', 2);
};

JSDungeon.Sprite.prototype._anim = function(){
	var dt = new Date().getTime();
	if(this.time > dt){
	    var sy = this.opt[this.direction].top;
	    var height = this.opt[this.direction].height;
	    this.canvas.clearRect(0, 0, 100, 100);
	    var fl = this.interval - (this.time-dt);
	    var step = Math.floor(fl/this.step);
	    this.canvas.drawImage(this.img, step*this.stepw, sy, this.stepw, height, 0, 0, this.stepw, height);
	} else {
	    this.time = dt+this.interval;
	}
};
