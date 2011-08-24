
JSDungeon.MAP = JAK.ClassMaker.makeClass({
	NAME : 'JSDungeon.MAP',
	VERSION : '1.0'
});

JSDungeon.MAP.prototype.$constructor = function(opt){
	this.opt = {
		mapElm : null,
		canvas : null,
		radius : 5,
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
	this._buildMap();
};

JSDungeon.MAP.prototype._fullscreen = function(){
	this.pointW = this.mapWidth/((this.opt.radius*2)+1);
	this.pointH = this.mapHeight/((this.opt.radius*2)+1);
};

JSDungeon.MAP.prototype._randRange = function(min, max){
	return (Math.floor(Math.random() * (min-max+1))+min)*-1;
};

JSDungeon.MAP.prototype._obsticlesFinder = function(coords){
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
	/*- jestlize chceme mit viditelnost prez celou hraci plochu -*/
	if(!this.opt.allMap){
		this._fullscreen();
	}
	/*- inicializace shadow lighting -*/
	this.shadows = new JSDungeon.ShadowLighting(this.MAP, this.opt.mapConst, this.opt.radius);
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
		case 'lava' : color = '#a30000'; break;
		case 'none' : color = '#272727'; break;
		case 'start' : color = '#fff'; break;
		case 'end' : color = '#0000cc'; break;
		default : color = '#272727'; break;
	}
	return color;
};

JSDungeon.MAP.prototype._smallRebuild = function(vis){
	var a = (this.opt.radius*2)+1;
	var middle = ((a-1)/2);
	var countNum = 0;
	for(var i=0;i<a;i++){
		for(var j=0;j<a;j++){
			var color = this._obsticlesFinder(vis[countNum]);
			if(i == middle && j == middle){
				this.canvasMap.fillStyle = '#FFFFFF';
			} else {
				this.canvasMap.fillStyle = color;
			}
			this.canvasMap.fillRect(this.pointW*j, this.pointH*i, this.pointW, this.pointH);
			
			countNum++;
		}
	}
};

JSDungeon.MAP.prototype._rebuildMap = function(){
	this._clearMap();
	var a = this.shadows.getResults(this.start);
	if(!this.opt.allMap){
		this._smallRebuild(a);
	} else {
		for(var i=0;i<a.length;i++){
			if(a[i]){
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
		}
	}
};

JSDungeon.MAP.prototype._placeStart = function(){
	var randx = this._randRange(1, this.mapConst);
	var randy = this._randRange(1, this.mapConst);
	this.canvasMap.fillStyle = '#ffffff';
	this.canvasMap.fillRect(this.pointW*randx, this.pointH*randy, this.pointW, this.pointH);
	this.start = [randx, randy];
	this.MAP[randx][randy] = 'start';
};

JSDungeon.MAP.prototype._placeEnd = function(){
	var randx = this._randRange(1, this.mapConst);
	var randy = this._randRange(1, this.mapConst);
	this.canvasMap.fillStyle = '#0000cc';
	this.canvasMap.fillRect(this.pointW*randx, this.pointH*randy, this.pointW, this.pointH);
	this.end = [randx, randy];
	this.MAP[randx][randy] = 'end';
};
