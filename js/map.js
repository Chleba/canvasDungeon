
JSDungeon.MAP = JAK.ClassMaker.makeClass({
	NAME : 'JSDungeon.MAP',
	VERSION : '1.0',
	IMPLEMENT : JAK.ISignals
});

JSDungeon.MAP.prototype.$constructor = function(opt){
	this.opt = {
		mapElm : null,
		canvas : null,
		radius : 10,
		mapConst : 50,
		allMap : 1
	}
	for(i in opt){
		this.opt[i] = opt[i];
	}
	this.dom = {};
	this.dom.map = this.opt.mapElm;
	this.canvasMap = this.opt.canvas;
	this.mapConst = this.opt.mapConst;
	this.radius = this.opt.radius;
	this._buildMap();
};

JSDungeon.MAP.prototype._fullscreen = function(){
	this.pointW = this.mapWidth/((this.opt.radius*2)+1);
	this.pointH = this.mapHeight/((this.opt.radius*2)+1);
};

JSDungeon.MAP.prototype.getStart = function(){
	return this.start;
};

JSDungeon.MAP.prototype.getMap = function(){
	return this.MAP;
};

JSDungeon.MAP.prototype._randRange = function(min, max){
	var rand = (Math.floor(Math.random() * (min-max+1))+min)*-1;
	//var rand = Math.floor(Math.random() * (max - min + 1) + min)
	return rand;
};

JSDungeon.MAP.prototype._obsticlesFinder = function(coords){
	if(!coords){ return '#000'; }
	var x = coords[0];
	var y = coords[1];
	var color = '#000';
	switch(this.MAP[x][y]){
		case RPG.WALL : color = '#a30000'; break;
		case RPG.NONE : color = '#272727'; break;
		case RPG.YOU : color = '#fff'; break;
		case RPG.END : color = '#0000cc'; break;
		default : color = '#272727'; break;
	}
	return color;
};

JSDungeon.MAP.prototype._buildMap = function(){
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
			//if(i < 5 && j < 15){
				row.push(RPG.WALL);
				this.canvasMap.fillStyle = '#a30000';
			} else {
				row.push(RPG.NONE);
				this.canvasMap.fillStyle = '#272727';
			}
			this.canvasMap.fillRect(this.pointW*i, this.pointH*j, this.pointW, this.pointH);
		}
		this.MAP.push(row);
	}
	/*- jestlize chceme mit viditelnost prez celou hraci plochu -*/
	if(!this.opt.allMap){
		this._fullscreen();
	}
	this._placeStart();
	this._placeEnd();
	this._rebuildMap();
};

JSDungeon.MAP.prototype._clearMap = function(){
	this.canvasMap.clearRect(0, 0, this.mapWidth, this.mapHeight);
	this.canvasMap.fillStyle = '#000';
	this.canvasMap.fillRect(0, 0, this.mapWidth, this.mapHeight)
};

JSDungeon.MAP.prototype._obsticlesFinder = function(coords){
	if(!coords){ return '#000'; }
	var x = coords[0];
	var y = coords[1];
	var color = '#000';
	switch(this.MAP[x][y]){
		case RPG.WALL : color = '#a30000'; break;
		case RPG.NONE : color = '#272727'; break;
		case RPG.YOU : color = '#fff'; break;
		case RPG.END : color = '#0000cc'; break;
		default : color = '#272727'; break;
	}
	return color;
};

JSDungeon.MAP.prototype._smallCorner = function(){
	var a = (this.opt.radius*2)+1;
	var middle = ((a-1)/2);
	var x = this.start[1];
	var y = this.start[0];
	var xx = x-middle < 0 ? 0 : x-middle;
	var yy = y-middle < 0 ? 0 : y-middle;
	return { x : xx, y : yy }
};

JSDungeon.MAP.prototype._smallRebuild = function(vis){
	var a = (this.opt.radius*2)+1;
	var middle = ((a-1)/2);
	var startCoors = this._smallCorner();
	var sx = startCoors.x;
	var sy = startCoors.y;
	var ex = (sx+a)+1 > this.mapConst ? this.mapConst : (sx+a)+1;
	var ey = (sy+a)+1 > this.mapConst ? this.mapConst : (sy+a)+1;
	
	var ay = 0;
	for(var i=sy;i<ey;i++){
		var ax = 0;
		for(var j=sx;j<ex;j++){
			var coords = [i,j].toString();
			var isVisible = vis[coords] ? 1 : 0;
			var color = '#000';
			if(isVisible){
				switch(this.MAP[i][j]){
					case RPG.WALL :
						color = '#a30000';
						break;
					case RPG.NONE :
						color = '#272727';
						break;
					case RPG.YOU :
					    this.smallStart = [ay, ax];
						color = '#FFFFFF';
						break;
					case RPG.NPC :
						this.smallNpc = [ay, ax];
						color = '#00ff00';
						break;
					case RPG.END :
						color = '#0000cc'; 
						break;
					default : 
						return; 
						break;
				}
			}
			this.canvasMap.fillStyle = color;
			this.canvasMap.fillRect(this.pointW*ay, this.pointH*ax, this.pointW, this.pointH);
			ax = ax+1;
		}
		ay = ay+1;
	}
	this.makeEvent('rebuildMap');
};

JSDungeon.MAP.prototype.fillSingleSquare = function(coords, color){
	this.canvasMap.fillStyle = color;
	this.canvasMap.fillRect(this.pointW*coords[0], this.pointH*coords[1], this.pointW, this.pointH);
};

JSDungeon.MAP.prototype.getMapColor = function(coords){
    switch(this.MAP[coords[0]][coords[1]]){
		case RPG.WALL :
			color = '#a30000';
			break;
		case RPG.NONE :
			color = '#272727';
			break;
		case RPG.YOU :
			color = '#FFFFFF';
			break;
		case RPG.END :
			color = '#0000cc';
			break;
		case RPG.NPC :
			color = '#00ff00';
			break;
		default :
			return;
			break;
	}
	return color;
};

JSDungeon.MAP.prototype._makeObjectFromVisibleCoords = function(vis){
	var obj = {};
	for(var i=0;i<vis.length;i++){
		var coords = vis[i].toString();
		obj[coords] = 1;
	}
	return obj;
};

JSDungeon.MAP.prototype._rebuildMap = function(){
	this._clearMap();
	var a = this.showShadow();
	if(!this.opt.allMap){
		var visCoords = this._makeObjectFromVisibleCoords(a)
		this._smallRebuild(visCoords);
	} else {
		if(!a){
			this._normalMap();
		} else {
			for(var i=0;i<a.length;i++){
				if(a[i]){
					var x = a[i][0];
					var y = a[i][1];
					
					var color = '#000';
					switch(this.MAP[x][y]){
						case RPG.WALL : color = '#a30000'; break;
						case RPG.NONE : color = '#272727'; break;
						case RPG.YOU : color = '#fff'; break;
						case RPG.NPC : color = '#00FF00'; break;
						case RPG.END : color = '#0000cc'; break;
						default : return; break;
					}
					this.canvasMap.fillStyle = color;
					this.canvasMap.fillRect(this.pointW*x, this.pointH*y, this.pointW, this.pointH);
				}
			}
		}
	}
	this.makeEvent('rebuildMap');
};

JSDungeon.MAP.prototype._normalMap = function(){
	for(var i=0;i<this.MAP.length;i++){
		for(var j=0;j<this.MAP[i].length;j++){
			var color = '#000';
			switch(this.MAP[i][j]){
				case RPG.WALL : color = '#a30000'; break;
				case RPG.NONE : color = '#272727'; break;
				case RPG.YOU : color = '#fff'; break;
				case RPG.NPC : color = '#00FF00'; break;
				case RPG.END : color = '#0000cc'; break;
				default : return; break;
			}
			this.canvasMap.fillStyle = color;
			this.canvasMap.fillRect(this.pointW*i, this.pointH*j, this.pointW, this.pointH);
		}
	}
	this.makeEvent('rebuildMap');
};

JSDungeon.MAP.prototype.showShadow = function(){
	return 0;
};

JSDungeon.MAP.prototype._placeStart = function(){
	var randx = this._randRange(1, this.mapConst);
	var randy = this._randRange(1, this.mapConst);
	
	this.canvasMap.fillStyle = '#ffffff';
	this.canvasMap.fillRect(this.pointW*randx, this.pointH*randy, this.pointW, this.pointH);
	this.start = [randx, randy];
	this.MAP[randx][randy] = RPG.YOU;
};

JSDungeon.MAP.prototype._placeEnd = function(){
	var randx = this._randRange(1, this.mapConst);
	var randy = this._randRange(1, this.mapConst);
	this.canvasMap.fillStyle = '#0000cc';
	this.canvasMap.fillRect(this.pointW*randx, this.pointH*randy, this.pointW, this.pointH);
	this.end = [randx, randy];
	this.MAP[randx][randy] = RPG.END;
};
