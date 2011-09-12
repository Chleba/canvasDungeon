
JSDungeon.NPC = JAK.ClassMaker.makeClass({
	NAME : 'JSDungeon.NPC',
	VERSION : '1.0'
});

JSDungeon.NPC.prototype.$constructor = function(map){
	this.map = map;
	this.interval = 500;
	this._makeNPC();
};

JSDungeon.NPC.prototype._makeNPC = function(){
	var rx = this.map._randRange(0, this.map.mapConst);
	var ry = this.map._randRange(0, this.map.mapConst);
	this.coords = [rx, ry];
	this.map.MAP[rx][ry] = 'npc';
	this.setTicker();
};

JSDungeon.NPC.prototype.stopTicker = function(){
	clearInterval(this.ticker);
};

JSDungeon.NPC.prototype.setTicker = function(){
	this.ticker = setInterval(this._move.bind(this), 1000);
};

JSDungeon.NPC.prototype._direction = function(){
	var rand = Math.floor(Math.random() * (4 - 1 + 1) + 1);
	switch(rand){
		case 1 : var dir = RPG.N; break;
		case 2 : var dir = RPG.S; break;
		case 3 : var dir = RPG.E; break;
		case 4 : var dir = RPG.W; break;
		default : var dir = RPG.N; break;
	}
	return dir;
};

JSDungeon.NPC.prototype._moveCoords = function(){
	var place = 'none';
	do {
		var dir = RPG.DIR[this._direction()];
		var nc = [this.coords[0]+dir[0], this.coords[1]+dir[1]];
		var x = nc[0];
		var y = nc[1];
		if(x < 0){ x = 0; } else if(x > this.map.mapConst){ x = this.map.mapConst; }
		if(y < 0){ y = 0; } else if(y > this.map.mapConst){ y = this.map.mapConst; }
		var place = this.map.MAP[x][y];
	} while(place == 'lava' || place == 'npc' || place == 'start');
	return nc;
};

JSDungeon.NPC.prototype._isOnRange = function(){
	/*var a = this.coords[0]*this.coords[0];
	var b = this.coords[1]*this.coords[1];
	var c = Math.sqrt(a+b);
	*/
	var a = Math.sqrt((this.map.start[0]*this.map.start[0])+(this.map.start[1]*this.map.start[1]));
	var b = Math.sqrt((this.coords[0]*this.coords[0])+(this.coords[1]*this.coords[1]));
	//var c = Math.sqrt(a+b);
	c = Math.sqrt(a+b);
	console.log(c);
};

JSDungeon.NPC.prototype._move = function(){
	var isOnRange = this._isOnRange();
	var nc = this._moveCoords();
	this.map.MAP[this.coords[0]][this.coords[1]] = 'none';
	this.map.MAP[nc[0]][nc[1]] = 'npc';
	this.coords = nc;
	this.map._rebuildMap();
};
