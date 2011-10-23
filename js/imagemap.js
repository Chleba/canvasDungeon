
JSDungeon.ImageMap = JAK.ClassMaker.makeClass({
	NAME : 'JSDungeon.ImageMap',
	VERSION : '1.0',
	EXTEND : JSDungeon.MAP,
	EXTEND : JSDungeon.ShadowLighting
});

JSDungeon.ImageMap.prototype._obsticlesFinder = function(coords){
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

JSDungeon.ImageMap.prototype._buildMap = function(){
	this.mapWidth = this.dom.map.offsetWidth;
	this.mapHeight = this.dom.map.offsetHeight;
	this.pointW = this.mapWidth/this.mapConst;
	this.pointH = this.mapHeight/this.mapConst;
	for(var i=0;i<this.mapConst;i++){
		var row = [];
		for(var j=0;j<this.mapConst;j++){
			var img = 0;
			var rand = Math.random()*10;
			if(Math.round(rand) == 5){
			//if(i < 5 && j < 15){
				row.push(RPG.WALL);
				if(RPG.IMG[RPG.WALL]){
					img = 1;
				} else {
					this.canvasMap.fillStyle = '#a30000';
				}
			} else {
				row.push(RPG.NONE);
				if(RPG.IMG[RPG.NONE]){
					img = 1;
				} else {
					this.canvasMap.fillStyle = '#272727';
				}
			}
			if(img){
				var di = RPG.IMG[row[row.length-1]].img;
				this.canvasMap.drawImage(di, this.pointW*i, this.pointH*j, this.pointW, this.pointH);
			} else {
				this.canvasMap.fillRect(this.pointW*i, this.pointH*j, this.pointW, this.pointH);
			}
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

JSDungeon.ImageMap.prototype._rebuildMap = function(){
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

JSDungeon.ImageMap.prototype._smallRebuild = function(vis){
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
			var cons = this.MAP[i][j];
			var color = '#000';
			var img = 0;
			if(isVisible){
				switch(cons){
					case RPG.WALL :
						if(RPG.IMG[RPG.WALL]){ img = 1; }
						color = '#a30000';
						break;
					case RPG.NONE :
						if(RPG.IMG[RPG.NONE]){ img = 1; }
						color = '#272727';
						break;
					case RPG.YOU :
						if(RPG.IMG[RPG.YOU]){ img = 1; }
					    this.smallStart = [ay, ax];
						color = '#FFFFFF';
						break;
					case RPG.NPC :
						if(RPG.IMG[RPG.NPC]){ img = 1; }
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
			if(img){
				var di = RPG.IMG[cons].img;
				this.canvasMap.drawImage(di, this.pointW*ay, this.pointH*ax, this.pointW, this.pointH);
			} else {
				this.canvasMap.fillStyle = color;
				this.canvasMap.fillRect(this.pointW*ay, this.pointH*ax, this.pointW, this.pointH);
			}
			ax = ax+1;
		}
		ay = ay+1;
	}
	this.makeEvent('rebuildMap');
};

