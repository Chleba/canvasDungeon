JSDungeon.Lightnings = JAK.ClassMaker.makeClass({
	NAME : 'JSDungeon.Lightnings',
	VERSION : '1.0'
});

JSDungeon.Lightnings.prototype.$constructor = function(dung, map, coords){
	this.dung = dung;
	this.map = map;
	this.coords = coords;
	this.init();
};

JSDungeon.Lightnings.prototype.init = function(){
	return;
};