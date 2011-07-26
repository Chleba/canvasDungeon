
CanvasDungeon = JAK.ClassMaker.makeClass({
	NAME : 'CanvasDungeon',
	VERSION : '1.0'
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
	var mapWidth = this.dom.map.offsetWidth;
	var mapHeight = this.dom.map.offsetHeight;
	this.pointW = mapWidth/this.mapConst;
	this.pointH = mapHeight/this.mapConst;
	for(var i=0;i<this.mapConst;i++){
		var row = [];
		for(var j=0;j<this.mapConst;j++){
			var rand = Math.random()*10;
			if(Math.round(rand) == 5){
				row.push('lava');
				this.canvasMap.fillStyle = '#a30000';
			} else {
				row.push('none');
				this.canvasMap.fillStyle = '#000';
			}
			this.canvasMap.fillRect(this.pointW*i, this.pointH*j, this.pointW, this.pointH);
		}
		this.MAP.push(row);
	}
	this._placeStart();
	this._placeEnd();
};
CanvasDungeon.prototype._isOnRange = function(pos){
	var np = [pos[0]*this.pointW, pos[1]*this.pointH];
	this.canvasMap.strokeStyle = '#000';
	this.canvasMap.beginPath();
	this.canvasMap.arc(this.start[0]*this.pointW, this.start[1]*this.pointH, this.pointW*2.5, 0, Math.PI*2, true);
	this.canvasMap.closePath();
	this.canvasMap.stroke();
	var isIn = this.canvasMap.isPointInPath(np[0], np[1]);
	return isIn;
};
CanvasDungeon.prototype._rebuildMap = function(){
	for(var i=0;i<this.MAP.length;i++){
		for(j=0;j<this.MAP[i].length;j++){
			var color = '#000';
			switch(this.MAP[i][j]){
				case 'lava' : color = '#a30000'; break;
				case 'none' : color = '#000'; break;
				case 'start' : color = '#fff'; break;
				case 'end' : color = '#0000cc'; break;
				default : JAK.Events.cancelDef(e); return; break;
			}
			
			if(this._isOnRange([i, j])){			
				this.canvasMap.fillStyle = color;
			} else {
				this.canvasMap.fillStyle = '#000';
			}
			this.canvasMap.fillRect(this.pointW*i, this.pointH*j, this.pointW, this.pointH);
		}
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
