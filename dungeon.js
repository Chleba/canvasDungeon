/**
 * Simple canvas dungeon, looking for end, game with discreet shadow casting algorithm with many thanks to Ondrej Zara <ondra.zarovi.cz>
 */

CanvasDungeon = JAK.ClassMaker.makeClass({
	NAME : 'CanvasDungeon',
	VERSION : '1.1'
});
CanvasDungeon.prototype.$constructor = function(map){
	this.mapConst = 50;
	this.dom = {};
	this.ec = [];
	this.dom.map = JAK.gel(map);
	this.canvasMap = this.dom.map.getContext('2d');
	this._buildMap();
	this._link();
};
CanvasDungeon.prototype._randRange = function(min, max){
	return (Math.floor(Math.random() * (min-max+1))+min)*-1;
};
CanvasDungeon.prototype._buildMap = function(){
	this.MAP = [];
	this.mapWidth = this.dom.map.offsetWidth;
	this.mapHeight = this.dom.map.offsetHeight;
	this.pointW = this.mapWidth/this.mapConst;
	this.pointH = this.mapHeight/this.mapConst;
	for(var i=0;i<this.mapConst;i++){
		var row = [];
		for(var j=0;j<this.mapConst;j++){
			var rand = Math.random()*10;
			if(Math.round(rand) == 5){
				row.push('lava');
				this.canvasMap.fillStyle = '#a30000';
			} else {
				row.push('none');
				this.canvasMap.fillStyle = '#272727';
			}
			this.canvasMap.fillRect(this.pointW*i, this.pointH*j, this.pointW, this.pointH);
		}
		this.MAP.push(row);
	}
	this._placeStart();
	this._placeEnd();
	this._rebuildMap();
};

CanvasDungeon.prototype._visibleCoords = function(blocks, startArc, arcsPerCell, arcs) {
	var eps = 1e-4;
	var startIndex = Math.floor(startArc);
	var arcCount = arcs.length;
	
	var ptr = startIndex;
	var given = 0; /* amount already distributed */
	var amount = 0;
	var arc = null;
	var ok = false;
	do {
		var index = ptr; /* ptr recomputed to avail range */
		if (index < 0) { index += arcCount; }
		if (index >= arcCount) { index -= arcCount; }
		arc = arcs[index];
		
		/* is this arc is already totally obstructed? */
		var chance = (arc[0] + arc[1] + eps < 1);

		if (ptr < startArc) {
			/* blocks left part of blocker (with right cell part) */
			amount += ptr + 1 - startArc;
			if (chance && amount > arc[0]+eps) {
				/* blocker not blocked yet, this cell is visible */
				ok = true;
				/* adjust blocking amount */
				if (blocks) { arc[0] = amount; }
			}
		} else if (given + 1 > arcsPerCell)  { 
			/* blocks right part of blocker (with left cell part) */
			amount = arcsPerCell - given;
			if (chance && amount > arc[1]+eps) {
				/* blocker not blocked yet, this cell is visible */
				ok = true;
				/* adjust blocking amount */
				if (blocks) { arc[1] = amount; }
			}
		} else {
			/* this cell completely blocks a blocker */
			amount = 1;
			if (chance) {
				ok = true;
				if (blocks) {
					arc[0] = 1;
					arc[1] = 1;
				}
			}
		}
		
		given += amount;
		ptr++;
	} while (given < arcsPerCell);
	
	return ok;
};

/**
 * @constant
 **/
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

CanvasDungeon.prototype.getCoordsInCircle = function(center, radius, includeInvalid) {
	var arr = [];
	var W = this.mapConst;
	var H = this.mapConst;
	var c1 = [];
	for(var i=0;i<center.length;i++){
		c1.push(center[i]);
	}
	var c2 = [c1[0]+radius, c1[1]+radius];
	/*-var c = center.clone().plus(new RPG.Misc.Coords(radius, radius));-*/
	var c = c2;
	
	var dirs = [0, 6, 4, 2];
	
	var count = 8*radius;
	for (var i=0;i<count;i++) {
		if (c[0] < 0 || c[1] < 0 || c[0] >= W || c[1] >= H) {
			if (includeInvalid) { arr.push(null); }
		} else {
			arr.push(c);
		}
		
		var dir = dirs[Math.floor(i*dirs.length/count)];
		c = [c[0]+RPG.DIR[dir][0], c[1]+RPG.DIR[dir][1]];
		/*-c.plus(RPG.DIR[dir]);-*/
	}
	return arr;
};

CanvasDungeon.prototype._isOnRange = function(pos){	
	var R = 5
	var center = this.start;
	var map = this.MAP;
	var eps = 1e-4;
	var c = false;

	/* directions blocked */
	var arcs = [];
	
	/* results */
	var result = [];
	result.push(this.start);

	/* number of cells in current ring */
	var cellCount = 0;

	var arcCount = R*8; /* length of longest ring */
	for (var i=0;i<arcCount;i++) { arcs.push([0, 0]); }
	
	/* analyze surrounding cells in concentric rings, starting from the center */
	for (var r=1; r<=R; r++) {
		cellCount += 8;
		var arcsPerCell = arcCount / cellCount; /* number of arcs per cell */
		
		var coords = this.getCoordsInCircle(center, r, true);
		for (var i=0;i<coords.length;i++) {
			if (!coords[i]) { continue; }
			c = coords[i];

			var startArc = (i-0.5) * arcsPerCell + 0.5;
			if (this._visibleCoords(this._blocks(c), startArc, arcsPerCell, arcs)) { 
				result.push(c);
			}

			/* cutoff? */
			var done = true;
			for (var j=0;j<arcCount;j++) {
				if (arcs[j][0] + arcs[j][1] + eps < 1) {
					done = false;
					break;
				}
			}
			if (done) { return result; }
		} /* for all cells in this ring */
	} /* for all rings */
	
	return result;
	
	
	/*-
	var a = Math.sqrt((Math.pow((this.start[0]-pos[0]), 2) + Math.pow((this.start[1]-pos[1]), 2)));
	if(a < 5.2){
		return 1;
	}
	return 0;
	-*/
};
CanvasDungeon.prototype._blocks = function(c){
	if(this.MAP[c[0]][c[1]] == 'lava'){
		return true
	}
	return false;
};

CanvasDungeon.prototype._clearMap = function(){
	this.canvasMap.clearRect(0, 0, this.mapWidth, this.mapHeight);
	this.canvasMap.fillStyle = '#000';
	this.canvasMap.fillRect(0, 0, this.mapWidth, this.mapHeight)
};

CanvasDungeon.prototype._rebuildMap = function(){
	this._clearMap();
	var a = this._isOnRange();
	for(var i=0;i<a.length;i++){
	    var x = a[i][0];
	    var y = a[i][1];
	    var color = '#000';
		switch(this.MAP[x][y]){
			case 'lava' : color = '#a30000'; break;
			case 'none' : color = '#272727'; break;
			case 'start' : color = '#fff'; break;
			case 'end' : color = '#0000cc'; break;
			default : JAK.Events.cancelDef(e); return; break;
		}
		this.canvasMap.fillStyle = color;
		this.canvasMap.fillRect(this.pointW*x, this.pointH*y, this.pointW, this.pointH);
	}
};
CanvasDungeon.prototype._placeStart = function(){
	var randx = this._randRange(1, this.mapConst);
	var randy = this._randRange(1, this.mapConst);
	this.canvasMap.fillStyle = '#ffffff';
	this.canvasMap.fillRect(this.pointW*randx, this.pointH*randy, this.pointW, this.pointH);
	this.start = [randx, randy];
	this.MAP[randx][randy] = 'start';
};
CanvasDungeon.prototype._placeEnd = function(){
	var randx = this._randRange(1, this.mapConst);
	var randy = this._randRange(1, this.mapConst);
	this.canvasMap.fillStyle = '#0000cc';
	this.canvasMap.fillRect(this.pointW*randx, this.pointH*randy, this.pointW, this.pointH);
	this.end = [randx, randy];
	this.MAP[randx][randy] = 'end';
};
CanvasDungeon.prototype._finder = function(ns){
	switch(this.MAP[ns[0]][ns[1]]){
		case 'none' : return; break;
		case 'lava' : this._end(); break;
		case 'end' : this._win(); break;
		default : return; break;
	}
};
CanvasDungeon.prototype._end = function(){
	alert('The End');
};
CanvasDungeon.prototype._win = function(){
	alert('The Win');
};
CanvasDungeon.prototype._moveUp = function(e){
	JAK.Events.cancelDef(e);
	var ns = [this.start[0], this.start[1]-1];
	this._finder(ns);
	this.MAP[this.start[0]][this.start[1]] = 'none';
	this.start[1] = this.start[1] == 0 ? this.start[1] : this.start[1]-1;
	this.MAP[this.start[0]][this.start[1]] = 'start';
	this._rebuildMap();
};
CanvasDungeon.prototype._moveDown = function(e){
	JAK.Events.cancelDef(e);
	var ns = [this.start[0], this.start[1]+1];
	this._finder(ns);
	this.MAP[this.start[0]][this.start[1]] = 'none';
	this.start[1] = this.start[1] == this.MAP[0].length-1 ? this.start[1] : this.start[1]+1;
	this.MAP[this.start[0]][this.start[1]] = 'start';
	this._rebuildMap();
};
CanvasDungeon.prototype._moveRight = function(e){
	JAK.Events.cancelDef(e);
	var ns = [this.start[0]+1, this.start[1]];
	this._finder(ns);
	this.MAP[this.start[0]][this.start[1]] = 'none';
	this.start[0] = this.start[0] == this.MAP.length-1 ? this.start[0] : this.start[0]+1;
	this.MAP[this.start[0]][this.start[1]] = 'start';
	this._rebuildMap();
};
CanvasDungeon.prototype._moveLeft = function(e){
	JAK.Events.cancelDef(e);
	var ns = [this.start[0]-1, this.start[1]];
	this._finder(ns);
	this.MAP[this.start[0]][this.start[1]] = 'none';
	this.start[0] = this.start[0] == 0 ? this.start[0] : this.start[0]-1;
	this.MAP[this.start[0]][this.start[1]] = 'start';
	this._rebuildMap();
};
CanvasDungeon.prototype._move = function(e, elm){
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
CanvasDungeon.prototype._link = function(){
	this.ec.push( JAK.Events.addListener( window, 'keypress', this, '_move' ) );
};
