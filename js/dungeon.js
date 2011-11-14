/**
 * Simple canvas dungeon game with discreet shadow casting algorithm with many thanks to Ondrej Zara <ondra.zarovi.cz>
 * Made by cHLeB@ <chleba@chleba.org>
 */
var JSDungeon = {};

RPG = {};
RPG.N				= 0;
RPG.NE				= 1;
RPG.E				= 2;
RPG.SE				= 3;
RPG.S				= 4;
RPG.SW				= 5;
RPG.W				= 6;
RPG.NW				= 7;
RPG.CENTER			= 8;
RPG.DIR = {};
RPG.DIR[RPG.N] =  [0, -1];
RPG.DIR[RPG.NE] = [1, -1];
RPG.DIR[RPG.E] =  [1,  0];
RPG.DIR[RPG.SE] = [1,  1];
RPG.DIR[RPG.S] =  [0,  1];
RPG.DIR[RPG.SW] = [-1, 1];
RPG.DIR[RPG.W] =  [-1, 0];
RPG.DIR[RPG.NW] = [-1,-1];
RPG.DIR[RPG.CENTER] =  [0, 0];

RPG.NONE = 0;
RPG.NPC = 1;
RPG.WALL = 2;
RPG.YOU = 3;
RPG.END = 4;

RPG.HP = 500;

RPG.SPELL = {}
RPG.SPELL.L = 10;

RPG.IMG = {};
RPG.IMG[RPG.NPC] = {
	img : './img/man.png',
	up : 96,
	left : 32,
	right : 64,
	down : 0,
	width : 30,
	height : 32,
	steps : 3,
	interval : 400
};
RPG.IMG[RPG.YOU] = {
	img : './img/capeman.png',
	up : 96,
	left : 32,
	right : 64,
	down : 0,
	width : 30,
	height : 32,
	steps : 3,
	interval : 400
};
RPG.IMG[RPG.WALL] = {
	img : './img/wall.png',
	width : 50,
	height : 50,
	steps : 0
};
RPG.IMG[RPG.NONE] = {
	img : './img/none.png',
	width : 50,
	height : 50,
	steps : 0
}

Array.prototype.min = function(){
	return Math.min.apply(Math, this);
};
Array.prototype.max = function(){
	return Math.max.apply(Math, this);
};

JSDungeon.Dungeon = JAK.ClassMaker.makeClass({
	NAME : 'CanvasDungeon',
	VERSION : '1.45',
	IMPLEMENT : JAK.ISignals
});
JSDungeon.Dungeon.prototype.$constructor = function(map, place){
	this.opt = {
		allMap : 0,
		radius : 8
	}
	this.direction = RPG.E;
	this.mapConst = 50;
	this.HP = RPG.HP;
	this.DMG = 10;
	this.dom = {};
	this.ec = [];
	this.dom.map = JAK.gel(map);
	this.dom.place = JAK.gel(place);
	this.dom.map.parentNode.appendChild(this.dom.place);
	this.canvasMap = this.dom.map.getContext('2d');
	this.canvasPlace = this.dom.place.getContext('2d');
	this.timekeeper = JAK.Timekeeper.getInstance();
	this.cUtil = new JSDungeon.cUtil(this.canvasMap);
	//this.map = new JSDungeon.MAP({
	//this.map = new JSDungeon.ShadowLighting({
	this._imageLoad();
	/*this.map = new JSDungeon.ImageMap({
		mapElm : this.dom.map,
		canvas : this.canvasMap,
		radius : this.opt.radius,
		mapConst : this.mapConst,
		allMap : this.opt.allMap
	});*/
};

JSDungeon.Dungeon.prototype.stopTicker = function(){
	this.timekeeper.removeListener(this.ticker);
};

JSDungeon.Dungeon.prototype.setTicker = function(){
	try{
		this.ticker = this.timekeeper.addListener(this.map, '_rebuildMap', 2);
	} catch(e){ return; }
};

JSDungeon.Dungeon.prototype._imageLoad = function(){
	for( i in RPG.IMG ){
		if(!RPG.IMG[i].loaded){
			var img = JAK.mel('img');
			img.src = RPG.IMG[i].img;
			RPG.IMG[i].loaded = 1;
			RPG.IMG[i].img = img;
			this.ec.push( JAK.Events.addListener(img, 'load', this, '_imageLoad') );
			return;
		}
	}
	this._imagesLoaded();
};

JSDungeon.Dungeon.prototype._imagesLoaded = function(){
	//this.map = new JSDungeon.MAP({
	//this.map = new JSDungeon.ShadowLighting({
	this.map = new JSDungeon.ImageMap({
		dung : this,
		mapElm : this.dom.map,
		canvas : this.canvasMap,
		place : this.canvasPlace,
		radius : this.opt.radius,
		mapConst : this.mapConst,
		allMap : this.opt.allMap
	});
	this.npcs = [
		new JSDungeon.NPC(this.map),
		new JSDungeon.NPC(this.map),
		new JSDungeon.NPC(this.map),
		new JSDungeon.NPC(this.map),
		new JSDungeon.NPC(this.map),
		new JSDungeon.NPC(this.map),
		new JSDungeon.NPC(this.map),
		new JSDungeon.NPC(this.map),
		new JSDungeon.NPC(this.map),
		new JSDungeon.NPC(this.map)
	];
	this.MAP = this.map.getMap();
	this.makeHPBar();
	this.setTicker();
	this._link();
};

JSDungeon.Dungeon.prototype._finder = function(ns){
	if((ns[0] >= 0 || ns[0] < this.mapConst) && (ns[1] >= 0 || ns[1] < this.mapConst)){
		switch(this.MAP[ns[0]][ns[1]]){
			case RPG.NONE : return 1; break;
			case RPG.WALL : return 0; break;
			case RPG.END : this._win(); break;
			default : return; break;
		}
	}
};
JSDungeon.Dungeon.prototype._end = function(){
	alert('The End');
};
JSDungeon.Dungeon.prototype._win = function(){
	alert('The Win');
};
JSDungeon.Dungeon.prototype._moveUp = function(e){
	JAK.Events.cancelDef(e);
	this.direction = RPG.N;
	var ns = [this.start[0], this.start[1]-1];
	var canI = this._finder(ns);
	if(canI){
		this.MAP[this.start[0]][this.start[1]] = RPG.NONE;
		this.start[1] = this.start[1] == 0 ? this.start[1] : this.start[1]-1;
		this.MAP[this.start[0]][this.start[1]] = RPG.YOU;
	}
};
JSDungeon.Dungeon.prototype._moveDown = function(e){
	JAK.Events.cancelDef(e);
	this.direction = RPG.S;
	var ns = [this.start[0], this.start[1]+1];
	var canI = this._finder(ns);
	if(canI){
		this.MAP[this.start[0]][this.start[1]] = RPG.NONE;
		this.start[1] = this.start[1] == this.MAP[0].length-1 ? this.start[1] : this.start[1]+1;
		this.MAP[this.start[0]][this.start[1]] = RPG.YOU;
	}
};
JSDungeon.Dungeon.prototype._moveRight = function(e){
	JAK.Events.cancelDef(e);
	this.direction = RPG.E;
	var ns = [this.start[0]+1, this.start[1]];
	var canI = this._finder(ns);
	if(canI){
		this.MAP[this.start[0]][this.start[1]] = RPG.NONE;
		this.start[0] = this.start[0] == this.MAP.length-1 ? this.start[0] : this.start[0]+1;
		this.MAP[this.start[0]][this.start[1]] = RPG.YOU;
	}
};
JSDungeon.Dungeon.prototype._moveLeft = function(e){
	JAK.Events.cancelDef(e);
	this.direction = RPG.W;
	var ns = [this.start[0]-1, this.start[1]];
	var canI = this._finder(ns);
	if(canI){
		this.MAP[this.start[0]][this.start[1]] = RPG.NONE;
		this.start[0] = this.start[0] == 0 ? this.start[0] : this.start[0]-1;
		this.MAP[this.start[0]][this.start[1]] = RPG.YOU;
	}
};
JSDungeon.Dungeon.prototype._attack = function(e){
	if(!this.attack){
		this.attack = 1;
		var sc = this.opt.allMap ? this.map.start : this.map.smallStart;
		this.attackCoords = [(sc[0]+RPG.DIR[this.direction][0]), sc[1]+RPG.DIR[this.direction][1]];
		this.canvasMap.beginPath();
		var fromX = (sc[0]*this.map.pointW)+this.map.pointW/2
		var from = [(sc[0]*this.map.pointW)+this.map.pointW/2, (sc[1]*this.map.pointH)+this.map.pointH/2];
		var toX = (((sc[0])+RPG.DIR[this.direction][0])*this.map.pointW)-this.map.pointW/2;
		var toY = (((sc[1])+RPG.DIR[this.direction][1])*this.map.pointH)-this.map.pointH/2;
		var to = [ toX+this.map.pointW, toY+this.map.pointH ];
		this.canvasMap.strokeStyle = '#FFF';
		this.canvasMap.lineWidth = 5.0;
		this.canvasMap.moveTo(from[0], from[1]);
		this.canvasMap.lineTo(to[0], to[1]);
		this.canvasMap.stroke();
 		this.canvasMap.closePath();
	}
};
JSDungeon.Dungeon.prototype._doneAttack = function(e, elm){
	if(e.keyCode == 32){
		var cc = [this.map.start[0]+RPG.DIR[this.direction][0], this.map.start[1]+RPG.DIR[this.direction][1]];
  		var color = this.map.getMapColor(cc);
  		this.map.fillSingleSquare(this.attackCoords, color);
  		this.attack = 0;
	}
};
JSDungeon.Dungeon.prototype._move = function(e, elm){
	this.start = this.map.getStart();
	switch(e.keyCode){
		case 38 :
		    this.attack = 0;
			this._moveUp(e);
			break;
		case 40 :
		    this.attack = 0;
			this._moveDown(e);
			break;
		case 37 :
		    this.attack = 0;
			this._moveLeft(e);
			break;
		case 39 :
		    this.attack = 0;
			this._moveRight(e);
			break;
		case 32 :
			this._attack(e);
			break;
		case 88 :
		    if(e.shiftKey){
		        this._circleLightning();
		    } else {
		    	this._lightning();
		    }
		    break;
		default :
			return;
			break;
	}
};

JSDungeon.Dungeon.prototype._circleLightning = function(){
	var ss = this.opt.allMap ? this.start : this.map.smallStart;
	var f = { x : ss[0]*this.map.pointW+(this.map.pointW/2), y : ss[1]*this.map.pointH+(this.map.pointW/2) };
	var c = this.cUtil.makeCircleLight(f, this.map.pointW*3);
};

JSDungeon.Dungeon.prototype._lightning = function(){
	var td = RPG.DIR[this.direction];
	var ss = this.opt.allMap ? this.start : this.map.smallStart;
	var t = { x : ((ss[0]+(td[0]*4))*this.map.pointW), y : ((ss[1]+(td[1]*4))*this.map.pointH)+(this.map.pointH/2) };
	var f = { x : (ss[0]*this.map.pointW)+(this.map.pointW/2), y : (ss[1]*this.map.pointH)+(this.map.pointH/2) };
	this.castStart = new Date().getTime()+400;
	
	var enemyOnPath = this._lightEnemyOnPath(ss, td);
	
	if(!this.castTick){
		this.castTick = this.timekeeper.addListener(this, this._castLight.bind(this, f, t), 2);
	}
	//var l = this._castLight(f, t);
};

JSDungeon.Dungeon.prototype._lightEnemyOnPath = function(ss, d){
	var npc = 0;
	for(var i=0;i<4;i++){
		var coords = [this.start[0]+(d[0]*i), this.start[1]+(d[1]*i)];
		if(this.MAP[coords[0]][coords[1]] == RPG.NPC){
			var npc = this._getNPC(coords);
		}
	}
	if(npc){
		npc.getDmg(RPG.SPELL.L);
	}
};

JSDungeon.Dungeon.prototype._getNPC = function(coords){
	for(var i=0;i<this.npcs.length;i++){
		if(this.npcs[i].hasCoords(coords)){
			return this.npcs[i];
		}
	}
	return 0;
};

JSDungeon.Dungeon.prototype._castLight = function(f, t){
	var delta = new Date().getTime() - this.castStart;
	if(delta < 0){
		for(var i=0;i<3;i++){
			this.cUtil.makeLight(f, t);
		}
	} else {
		try{ this.timekeeper.removeListener(this); } catch (e) { return; }
		this.castTick = 0;
	}
};

JSDungeon.Dungeon.prototype._dmg = function(e){
	this.HP = this.HP-e.data.dmg < 0 ? 0 : this.HP-e.data.dmg;
	this.makeHPBar();
};

JSDungeon.Dungeon.prototype.makeHPBar = function(){
	this.canvasMap.fillStyle = 'rgba(204, 0, 0, 0.3)';
	this.canvasMap.fillRect( this.map.mapWidth-105, this.map.mapHeight-23, 100, 18 );
	this.canvasMap.fillStyle = 'rgba(0, 204, 0, 0.3)';/*-#00cc00-*/
	var hp = this.HP/(RPG.HP/100);
	this.canvasMap.fillRect( this.map.mapWidth-105, this.map.mapHeight-23, hp, 18 );
}

JSDungeon.Dungeon.prototype._link = function(){
	this.ec.push( JAK.Events.addListener( window, 'keydown', this, '_move' ) );
	this.ec.push( JAK.Events.addListener( window, 'keyup', this, '_doneAttack' ) );
	this.addListener('npcAttack', '_dmg');
	this.addListener('rebuildMap', 'makeHPBar');
};
