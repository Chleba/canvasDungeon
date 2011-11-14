
JSDungeon.NPC = JAK.ClassMaker.makeClass({
	NAME : 'JSDungeon.NPC',
	VERSION : '1.0',
	IMPLEMENT : JAK.ISignals
});

JSDungeon.NPC.prototype.$constructor = function(map){
	this.DMG = 5;
	this.HP = 10;
	this.map = map;
	this.interval = 500;
	this._makeNPC();
};

JSDungeon.NPC.prototype.$destructor = function(){
	this.stopTicker();
	this.map.MAP[this.coords[0]][this.coords[1]] = RPG.NONE;
	this.DMG = null;
	this.HP = null;
	this.map = null;
	this.interval = null;
};

JSDungeon.NPC.prototype.hasCoords = function(coords){
	if(String(this.coords) == String(coords)){
		return this;
	}
	return 0;
};

JSDungeon.NPC.prototype.getDmg = function(dmg){
	this.HP -= dmg;
	if(this.HP <= 0){
		this._die();
	}
};

JSDungeon.NPC.prototype._die = function(){
	this.$destructor();
};

JSDungeon.NPC.prototype._makeNPC = function(){
	var rx = this.map._randRange(0, this.map.mapConst);
	var ry = this.map._randRange(0, this.map.mapConst);
	
	this.coords = [rx, ry];
	this.map.MAP[rx][ry] = RPG.NPC;
	this.setTicker();
};

JSDungeon.NPC.prototype.stopTicker = function(){
	clearInterval(this.ticker);
};

JSDungeon.NPC.prototype.setTicker = function(){
	this.ticker = setInterval(this._move.bind(this), this.interval);
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
	var place = RPG.NONE;
	var i = 0;
	do {
	    if(i == 8){ return this.coords; };
	    i++;
		var dir = RPG.DIR[this._direction()];
		var nc = [this.coords[0]+dir[0], this.coords[1]+dir[1]];
		var x = nc[0];
		var y = nc[1];
		if(x < 0){ x = 0; } else if(x > this.map.mapConst-1){ x = this.map.mapConst-1; }
		if(y < 0){ y = 0; } else if(y > this.map.mapConst-1){ y = this.map.mapConst-1; }
		var place = this.map.MAP[x][y];
	} while(place == RPG.WALL || place == RPG.NPC || place == RPG.YOU || place == RPG.END);
	return nc;
};

JSDungeon.NPC.prototype._isOnRange = function(coords){
	var a = (this.map.start[0]-coords[0])
	var b = (this.map.start[1]-coords[1])
	var c = Math.sqrt((a*a)+(b*b));
	if(c < this.map.opt.radius){ return c; }
	return 0;
};

JSDungeon.NPC.prototype._nearCoords = function(){
	var r = this._isOnRange(this.coords);
	var far = [];
	var fc = {};
	var i = 0;
 	do {
        var coords = this._moveCoords();
		var r1 = this._isOnRange(coords);
		if(r1 < 2){ this._attack(); break; }
		if(far.indexOf(r1) == -1){
			far.push(r1);
			fc[r1] = coords;
		}
		if(i == 8){
			return fc[far.min()];
		}
		i++;
	} while(r1 >= r)
	return coords;
};

JSDungeon.NPC.prototype._move = function(){
	var isOnRange = this._isOnRange(this.coords);
	if(isOnRange){
	    var nc = this._nearCoords();
	} else {
		var nc = this._moveCoords();
	}
	this.map.MAP[this.coords[0]][this.coords[1]] = RPG.NONE;
	this.map.MAP[nc[0]][nc[1]] = RPG.NPC;
	this.coords = nc;
};

JSDungeon.NPC.prototype._attack = function(){
	this.makeEvent('npcAttack', { dmg : this.DMG });
};
