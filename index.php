<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<link rel="shortcut icon" href="/img/favicon.ico" />
		<link rel="icon" href="/img/favicon.ico" />
		<title>canvas dungeon</title>
	</head>
	<body>
	    <script type="text/javascript" src="./js/jak.js"></script>
	    <script type="text/javascript" src="./js/timekeeper.js"></script>
	    <script type="text/javascript" src="./js/dungeon.js"></script>
	    <script type="text/javascript" src="./js/util.js"></script>
	    <script type="text/javascript" src="./js/map.js"></script>
	    <script type="text/javascript" src="./js/shadowlighting.js"></script>
	    <script type="text/javascript" src="./js/imagemap.js"></script>
	    <script type="text/javascript" src="./js/npc.js"></script>
		<style>
			#canvasMain 	{ position:relative; height:600px; }
			#canvasMain canvas	{ display:block; position:absolute; top:0px; left:0px; }
		</style>
		<div id="page">
			<div id="canvasMain">
				<canvas id="canvasMap" width="600" height="600"></canvas>
				<canvas id="canvasPlace" width="600" height="600"></canvas>
			</div>
			<h2>Where is the blue dot ?</h2>
			<p>(Move with arrows.)</p>
			<script type="text/javascript">
				var canvasDungeon = new JSDungeon.Dungeon('canvasMap', 'canvasPlace');
			</script>			
		</div>
	</body>
</html>
