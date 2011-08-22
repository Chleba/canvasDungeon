/**
 * Simple canvas dungeon, looking for end, game with discreet shadow casting algorithm with many thanks to Ondrej Zara <ondra.zarovi.cz>
 */
var JSDungeon = {};

JSDungeon.Dungeon = JAK.ClassMaker.makeClass({
	NAME : 'CanvasDungeon',
	VERSION : '1.1'
});
JSDungeon.Dungeon.prototype.$constructor = function(map){
	this.opt = {
		allMap : 1,
		radius : 5
	}
	this.mapConst = 50;
	this.dom = {};
	this.ec = [];
	this.dom.map = JAK.gel(map);
	this.canvasMap = this.dom.map.getContext('2d');
	this.map = new JSDungeon.MAP({
		mapElm : this.dom.map,
		canvas : this.canvasMap,
		radius : this.opt.radius,
		mapConst : this.mapConst,
		allMap : this.opt.allMap
	});
	this._link();
};
JSDungeon.Dungeon.prototype._fullscreen = function(){
	this.pointW = this.mapWidth/((this.opt.radius*2)+1);
	this.pointH = this.mapHeight/((this.opt.radius*2)+1);
};

JSDungeon.Dungeon.prototype._obsticlesFinder = function(coords){
	if(!coords){ return '#000'; }
	var x = coords[0];
	var y = coords[1];
	var color = '#000';
	switch(this.MAP[x][y]){
		case 'lava' : color = '#a30000'; break;
		case 'none' : color = '#272727'; break;
		case 'start' : color = '#fff'; break;
		case 'end' : color = '#0000cc'; break;
		default : color = '#272727'; break;
	}
	return color;
};

JSDungeon.Dungeon.prototype._finder = function(ns){
	switch(this.MAP[ns[0]][ns[1]]){
		case 'none' : return 1; break;
		case 'lava' : return 0; break;
		case 'end' : this._win(); break;
		default : return; break;
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
	var ns = [this.start[0], this.start[1]-1];
	var canI = this._finder(ns);
	if(canI){
		this.MAP[this.start[0]][this.start[1]] = 'none';
		this.start[1] = this.start[1] == 0 ? this.start[1] : this.start[1]-1;
		this.MAP[this.start[0]][this.start[1]] = 'start';
		this._rebuildMap();
	}
};
JSDungeon.Dungeon.prototype._moveDown = function(e){
	JAK.Events.cancelDef(e);
	var ns = [this.start[0], this.start[1]+1];
	var canI = this._finder(ns);
	if(canI){
		this.MAP[this.start[0]][this.start[1]] = 'none';
		this.start[1] = this.start[1] == this.MAP[0].length-1 ? this.start[1] : this.start[1]+1;
		this.MAP[this.start[0]][this.start[1]] = 'start';
		this._rebuildMap();
	}
};
JSDungeon.Dungeon.prototype._moveRight = function(e){
	JAK.Events.cancelDef(e);
	var ns = [this.start[0]+1, this.start[1]];
	var canI = this._finder(ns);
	if(canI){
		this.MAP[this.start[0]][this.start[1]] = 'none';
		this.start[0] = this.start[0] == this.MAP.length-1 ? this.start[0] : this.start[0]+1;
		this.MAP[this.start[0]][this.start[1]] = 'start';
		this._rebuildMap();
	}
};
JSDungeon.Dungeon.prototype._moveLeft = function(e){
	JAK.Events.cancelDef(e);
	var ns = [this.start[0]-1, this.start[1]];
	var canI = this._finder(ns);
	if(canI){
		this.MAP[this.start[0]][this.start[1]] = 'none';
		this.start[0] = this.start[0] == 0 ? this.start[0] : this.start[0]-1;
		this.MAP[this.start[0]][this.start[1]] = 'start';
		this._rebuildMap();
	}
};
JSDungeon.Dungeon.prototype._move = function(e, elm){
	switch(e.keyCode){
		case 38 :
			this._moveUp(e);
			break;
		case 40 :
			this._moveDown(e);
			break;
		case 37 :
			this._moveLeft(e);
			break;
		case 39 :
			this._moveRight(e);
			break;
		default :
			return;
			break;
	}
};
JSDungeon.Dungeon.prototype._link = function(){
	this.ec.push( JAK.Events.addListener( window, 'keypress', this, '_move' ) );
};
