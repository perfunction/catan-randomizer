// ----- Canvas globals -----

var mapCanvas;
var drawingContext;

var canvasCenterX;
var canvasCenterY;

// ----- Hexagon drawing parameters -----

var mapStyle = "retro";

var size = null;
var defaultFillStyle = "#ffffff";
var strokeStyle = "#000000";
var lineWidth = 3;
var resourceTypeToColor = {
	"ore": "#363636",
	"clay": "#E83200",
	"wool": "#98E82E",
	"wood": "#0A7300",
	"grain": "#E0E000",
	"desert": "#F2F0A0",
	"gold": "#FFD700",
	"none": "#ffffff"
};
var resourceTypeToImageCanvas = {
	"ore": null,
	"clay": null,
	"wool": null,
	"wood": null,
	"grain": null,
	"desert": null,
	"gold": null
};

//var allImagesLoaded = false;

// ----- Grid layout globals -----

var dx = size * (1 + Math.cos(Math.PI/3)) / 2;
var dy = size * Math.sin(Math.PI/3);

/*
 * Formula:
 *
 * Height = (coordSpacing + 2) * dy
 *        = (coordSpacing + 2) * Math.sin(Math.PI/3) * size
 * Size = Height / ( (coordSpacing + 2) * Math.sin(Math.PI/3) )
 *
 * Width = (coordSpacing * dx) + (2 * size)
 *       = (coordSpacing * (1 + Math.cos(Math.PI/3)) / 2 * size) + (2 * size)
 *       = ( (coordSpacing * (1 + Math.cos(Math.PI/3)) / 2) + 2 ) * size
 * Size = Width / ( (coordSpacing * (1 + Math.cos(Math.PI/3)) / 2) + 2 )
*/

// ----- Map definition globals -----

var catanMap = new CatanMap();

var normalMap = new MapDefinition();
normalMap.resourceDict = {
	"gold": 0,
	"desert": 1,
	"wood": 4,
	"clay": 3,
	"wool": 4,
	"grain": 4,
	"ore": 3
};
normalMap.numberDict = {
	2: 1,
	3: 2,
	4: 2,
	5: 2,
	6: 2,
	8: 2,
	9: 2,
	10: 2,
	11: 2,
	12: 1
}
normalMap.coordinatesArray = [
	[-4,2],[-4,0],[-4,-2],
	[-2,3],[-2,1],[-2,-1],[-2,-3],
	[0,4],[0,2],[0,0],[0,-2],[0,-4],
	[2,3],[2,1],[2,-1],[2,-3],
	[4,2],[4,0],[4,-2]
];

var expandedMap = new MapDefinition();
expandedMap.resourceDict = {
	"gold": 0,
	"desert": 2,
	"wood": 6,
	"clay": 5,
	"wool": 6,
	"grain": 6,
	"ore": 5
}
expandedMap.numberDict = {
	2: 2,
	3: 3,
	4: 3,
	5: 3,
	6: 3,
	8: 3,
	9: 3,
	10: 3,
	11: 3,
	12: 2
}
expandedMap.coordinatesArray = [
	[-6,2],[-6,0],[-6,-2],
	[-4,3],[-4,1],[-4,-1],[-4,-3],
	[-2,4],[-2,2],[-2,0],[-2,-2],[-2,-4],
	[0,5],[0,3],[0,1],[0,-1],[0,-3],[0,-5],
	[2,4],[2,2],[2,0],[2,-2],[2,-4],
	[4,3],[4,1],[4,-1],[4,-3],
	[6,2],[6,0],[6,-2]
];

var bountifulMap = new MapDefinition();
bountifulMap.resourceDict = {
	"gold": 3,
	"desert": 0,
	"wood": 6,
	"clay": 6,
	"wool": 5,
	"grain": 5,
	"ore": 5
}
bountifulMap.numberDict = {
	2: 1,
	3: 2,
	4: 3,
	5: 4,
	6: 4,
	8: 4,
	9: 4,
	10: 3,
	11: 2,
	12: 1
}
bountifulMap.coordinatesArray = [
	[-6,2],[-6,0],[-6,-2],
	[-4,3],[-4,1],[-4,-1],[-4,-3],
	[-2,4],[-2,2],[-2,0],[-2,-2],[-2,-4],
	[0,5],[0,3],[0,1],[0,-1],[0,-3],[0,-5],
	[2,4],[2,2],[2,0],[2,-2],[2,-4],
	[4,3],[4,1],[4,-1],[4,-3],
	[6,2],[6,0],[6,-2]
];

var bigislandMap = new MapDefinition();
bigislandMap.resourceDict = {
	"gold": 0,
	"desert": 1,
	"wood": 8,
	"clay": 6,
	"wool": 8,
	"grain": 8,
	"ore": 6
};
bigislandMap.numberDict = {
	2: 2,
	3: 4,
	4: 4,
	5: 4,
	6: 4,
	8: 4,
	9: 4,
	10: 4,
	11: 4,
	12: 2
}
bigislandMap.coordinatesArray = [
	[-6,3],[-6,1],[-6,-1],[-6,-3],
	[-4,4],[-4,2],[-4,0],[-4,-2],[-4,-4],
	[-2,5],[-2,3],[-2,1],[-2,-1],[-2,-3],[-2,-5],
	[0,6],[0,4],[0,2],[0,0],[0,-2],[0,-4],[0,-6],
	[2,5],[2,3],[2,1],[2,-1],[2,-3],[2,-5],
	[4,4],[4,2],[4,0],[4,-2],[4,-4],
	[6,3],[6,1],[6,-1],[6,-3]
];

let urlParams = getUrlVars();
let seed = genRandomSeed();
let genSeed = new Math.seedrandom(seed);
// ----- FUNCTIONS -----

window.onresize = function(event) {
	sizeCanvas();
	catanMap.resize();
	catanMap.draw();
}

function init() {
	$("input:radio['name=game-type']").click(resetUserCounts);
	$("input.user-value").blur(checkUserCounts);

	loadImages(function() {
		var button = $('button#gen-map-button')[0];
		$(button).click(()=>{
			seed = genRandomSeed();
			genSeed = new Math.seedrandom(seed);
			generate();
		});
		button.disabled = false;
		button.innerHTML = "Click to generate.";


		$('#copy-link').click(()=>{
			let getUrl = window.location;
			let baseUrl = getUrl .protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1] + '?seed='+seed;

			let inputs = $('#gen-options input[type="text"]');
			inputs.each(function (){
				baseUrl += '&' + $(this).attr('id') + '=' + $(this).val()
			});
			let selectedGameType = $("input:radio['name=game-type']:checked");
			baseUrl += '&' + selectedGameType.attr('name') + '=' + selectedGameType.val();

			let linkEle = $('#link');
			linkEle.val(baseUrl);
			linkEle.select();
			document.execCommand("copy");
			alert('Copied the url to your clip board');
		});

		if(urlParams !== {}){
			if(typeof urlParams['seed'] != 'undefined') {
				seed = urlParams['seed'];
				for (let p in urlParams) {
					if(p === 'game-type'){
						$('input[name=game-type][value=' + urlParams[p] + ']').attr('checked', true)
					} else if(p !== 'seed'){
						let input = $('#' + p)

						if (input.length > 0) {
							input.val(urlParams[p]);
							checkUserCounts();
						}
					}

				}
				genSeed = new Math.seedrandom(seed);
				generate()
			}
		}

	});

	addCanvas();
	resetUserCounts();
}

function whichMap() {
	switch($("input:radio['name=game-type']:checked").val()) {
		case "bigisland":
			return jQuery.extend(true, {}, bigislandMap);
		case "bountiful":
			return jQuery.extend(true, {}, bountifulMap);
		case "expanded":
			return jQuery.extend(true, {}, expandedMap);
		default:
			return jQuery.extend(true, {}, normalMap);
	}
}

function resetUserCounts() {
	var mapDef = whichMap();

	// resources
	var total = 0;

	for (var key in mapDef.resourceDict) {
		var num = mapDef.resourceDict[key];
		total += num;
		$("#"+key).val(num);
	}

	$("#count").html(total + "/" + total);
	$("#count").css("color", "black");

	// numbers
	for (var key in mapDef.numberDict) {
		var num = mapDef.numberDict[key];
		$("#num"+key).val(num);
	}

	total -= mapDef.resourceDict["desert"];
	$("#numcount").html(total + "/" + total);
	$("#numcount").css("color", "black");
}

function checkUserCounts() {
	var mapDef = whichMap();

	// resources
	var rTotal = 0;
	var deserts = -mapDef.resourceDict["desert"];
	var rDictLen = mapDef.sumDictVals(mapDef.resourceDict);

	for (var key in mapDef.resourceDict) {
		var num = parseInt($("#"+key).val());
		rTotal += num;

		if (key == "desert") {
			deserts += num;
		}
	}

	$("#count").html(rTotal + "/" + rDictLen);

	if (rTotal != rDictLen) {
		$("#count").css("color", "red");
	} else {
		$("#count").css("color", "black");
	}

	// numbers
	var nTotal = 0
	var nDictLen = mapDef.sumDictVals(mapDef.numberDict) - deserts;

	for (var key in mapDef.numberDict) {
		nTotal += parseInt($("#num"+key).val());
	}

	$("#numcount").html(nTotal + "/" + nDictLen);

	if (nTotal != nDictLen) {
		$("#numcount").css("color", "red");
	} else {
		$("#numcount").css("color", "black");
	}
}

function applyUserCounts(mapDef) {
	for (var key in mapDef.resourceDict) {
		mapDef.resourceDict[key] = parseInt($("#"+key).val());
	}

	for (var key in mapDef.numberDict) {
		mapDef.numberDict[key] = parseInt($("#num"+key).val());
	}
}

function preloadImages(arr, callback){
	//http://www.javascriptkit.com/javatutors/preloadimagesplus.shtml

	var newimages=[], loadedimages=0;
	var postaction=function(){};
	var arr=(typeof arr!="object")? [arr] : arr;
	function imageloadpost(){
		loadedimages++;
		if (loadedimages==arr.length){
			callback(newimages); //call postaction and pass in newimages array as parameter
		}
	}
	for (var i=0; i<arr.length; i++){
		newimages[i]=new Image();
		newimages[i].src=arr[i];
		newimages[i].onload=function(){
			imageloadpost();
		}
		newimages[i].onerror=function(){
			imageloadpost();
		}
	}

}

function loadImages(callback) {

	var rTypes = [];
	var imgPaths = [];
	for (var key in resourceTypeToImageCanvas) {
		rTypes.push(key);
		imgPaths.push("images/"+key+".png");
	}

	preloadImages(imgPaths, function(images) {

		for (var i = 0; i < imgPaths.length; i += 1) {
			//resourceTypeToImage[ rTypes[i] ] = images[i];
			var img = images[i];
			var imgCanvas = document.createElement("canvas");
			var imgContext = imgCanvas.getContext("2d");

			imgCanvas.width = img.width;
			imgCanvas.height = img.height;
			imgContext.drawImage(img, 0, 0);

			resourceTypeToImageCanvas[ rTypes[i] ] = imgCanvas;
		}

		callback();

	});

}

function generate() {
	var mapDef = whichMap();

	applyUserCounts(mapDef);

	catanMap.defineMap(mapDef);

	var retry;
	do {
		retry = catanMap.generate();
	} while(retry);

	catanMap.resize();
	catanMap.draw();

}

function MapDefinition() {
	this.resourceDict = null;
	this.numberDict = null;
	this.coordinatesArray = null;
}
MapDefinition.prototype.checkValidity = function() {
	var cArrLen = this.coordinatesArray.length;
	var rDictLen = this.sumDictVals(this.resourceDict);
	var nDictLen = this.sumDictVals(this.numberDict);
	var numDeserts = this.resourceDict["desert"];

	return (cArrLen == rDictLen) && (rDictLen == (nDictLen + numDeserts));
}
MapDefinition.prototype.sumDictVals = function(dict) {
	var sum = 0;
	for (var key in dict) {
		sum += dict[key];
	}
	return sum;
}

function CatanMap() {

	this.mapDefinition = null;
	this.hexTiles = null;
	this.coordToTile = {};
	this.coordSpan = [0,0];

}
CatanMap.prototype.defineMap = function(mapDefinition) {

	if (mapDefinition.checkValidity()) {

		this.mapDefinition = mapDefinition;

		var coordRangeX = [0,0];
		var coordRangeY = [0,0];

		for (var i = 0; i < mapDefinition.coordinatesArray.length; i += 1) {
			var coord = mapDefinition.coordinatesArray[i];
			coordRangeX = [
				Math.min(coordRangeX[0], coord[0]),
				Math.max(coordRangeX[1], coord[0])
			];
			coordRangeY = [
				Math.min(coordRangeY[0], coord[1]),
				Math.max(coordRangeY[1], coord[1])
			];
		}

		this.coordSpan = [
			coordRangeX[1] - coordRangeX[0],
			coordRangeY[1] - coordRangeY[0]
		];

	} else {
		console.log("Invalid map definition.");
		alert("Invalid map definition.");
	}
}
CatanMap.prototype.generate = function() {

	this.coordToTile = {};

	if (this.mapDefinition) {

		this.hexTiles = [];

		var numTiles = this.mapDefinition.coordinatesArray.length;

		var tileCoordinates = this.mapDefinition.coordinatesArray.copy();

		var tileNumbers = [];
		for (var key in this.mapDefinition.numberDict) {
			for (var i = 0; i < this.mapDefinition.numberDict[key]; i += 1) {
				tileNumbers.push(parseInt(key));
			}
		}

		var tileTypes = [];
		for (var key in this.mapDefinition.resourceDict) {
			if (key != "desert") {
				for (var i = 0; i < this.mapDefinition.resourceDict[key]; i += 1) {
					tileTypes.push(key);
				}
			}
		}

		var newCoords = null;
		var numDeserts = this.mapDefinition.resourceDict["desert"];

		for (var i = 0; i < numDeserts; i += 1) {
			var desertHexTile = new HexTile();
			newCoords = tileCoordinates.random(true);
			desertHexTile.setCoordinate.apply(
				desertHexTile,
				newCoords
			);
			desertHexTile.setResourceType("desert");
			this.hexTiles.push(desertHexTile);
			this.coordToTile[newCoords.toString()] = desertHexTile;
		}

		// Move all highly productive tile number (6 and 8) to the front
		// of the tileNumbers array
		var highlyProductiveIdx = [];
		highlyProductiveIdx = highlyProductiveIdx.concat(
			tileNumbers.indexOfArray(6),
			tileNumbers.indexOfArray(8)
		);
		for (var i = 0; i < highlyProductiveIdx.length; i += 1) {
			tileNumbers.swap(i,highlyProductiveIdx[i]);
		}

		// Handle all other tiles
		for (var i = 0; i < (numTiles - numDeserts); i += 1) {

			var newHexTile = new HexTile();
			newHexTile.setNumber(tileNumbers[i]);
			newHexTile.setResourceType(tileTypes.random(true));

			var invalid;

			if ( newHexTile.isHighlyProductive() ) {
				var tmpCoords = [];
				do {
					newCoords = tileCoordinates.random(true);
					newHexTile.setCoordinate.apply(
						newHexTile,
						newCoords
					);
					invalid = this.hasHighlyProductiveNeighbors(newHexTile);
					if (invalid) {
						tmpCoords.push(newCoords);
					}
				} while ( invalid );
				tileCoordinates = tileCoordinates.concat(tmpCoords);
			} else {

				invalid = true;
				var tmpCoords = [];
				while ( invalid && tileCoordinates.length > 0) {
					newCoords = tileCoordinates.random(true);
					newHexTile.setCoordinate.apply(
						newHexTile,
						newCoords
					);
					invalid = this.doesFormTriangle(newHexTile) || this.doesFormChain(newHexTile) || this.hasSameNumberedNeighbour(newHexTile);

					if( invalid ) {
						if( tileCoordinates.length === 0 ) {
							console.log("gotcha! Try again!");
							return true;
						} else {
							tmpCoords.push(newCoords);
						}
					}
				}
				tileCoordinates = tileCoordinates.concat(tmpCoords);
			}

			this.hexTiles.push(newHexTile);
			this.coordToTile[newCoords.toString()] = newHexTile;
		} // end for loop

		return false;

	} else {

		console.log("No map definition.");
		return false;
	}

}
CatanMap.prototype.draw = function() {

	if (this.hexTiles) {
		drawingContext.clear();
		for (var i = 0; i < this.hexTiles.length; i += 1) {
			this.hexTiles[i].draw();
		}
	}

}
CatanMap.prototype.resize = function() {
	/* Size = Height / ( (coordSpacing + 2) * Math.sin(Math.PI/3) )
     * Size = Width / ( (coordSpacing * (1 + Math.cos(Math.PI/3)) / 2) + 2 )
    */
	var wSize = (mapCanvas.width-10) /
		( (this.coordSpan[0] * (1 + Math.cos(Math.PI/3)) / 2) + 2 );
	var hSize = (mapCanvas.height-10) /
		( (this.coordSpan[1] + 2) * Math.sin(Math.PI/3) );
	size = Math.floor(Math.min(wSize, hSize));
	dx = size * (1 + Math.cos(Math.PI/3)) / 2;
	dy = size * Math.sin(Math.PI/3);
}
CatanMap.prototype.getAdjacentTiles = function(tile) {

	var tileX = tile.gridX;
	var tileY = tile.gridY;

	var adjTiles = [];

	// (+0,+2), (+2,+1), (+2,-1), (+0,-2), (-2,-1), (-2,1)
	xshift = [0, 2, 2, 0, -2, -2];
	yshift = [2, 1, -1, -2, -1, 1];

	for (var i = 0; i < 6; i += 1) {
		var adjTile = this.coordToTile[
			[tileX + xshift[i], tileY + yshift[i]].toString()
			];
		// Will be null if no hex tile found at that coordinate
		if (adjTile) {
			adjTiles.push(adjTile);
		}
	}

	return adjTiles;

}
CatanMap.prototype.hasHighlyProductiveNeighbors = function(tile) {
	var adjacentTiles = this.getAdjacentTiles(tile);
	for (var i = 0; i < adjacentTiles.length; i += 1) {
		if ( adjacentTiles[i].isHighlyProductive() ) {
			return true;
		}
	}
	return false;
}

CatanMap.prototype.hasSameNumberedNeighbour = function(tile) {
	if (!$("#sameNumber").is(':checked')) {
		return false;
	}

	var adjacentTiles = this.getAdjacentTiles(tile);
	for (var i = 0; i < adjacentTiles.length; i += 1) {
		if ( tile.number == adjacentTiles[i].number ) {
			return true;
		}
	}
	return false;
}

CatanMap.prototype.doesFormTriangle = function(tile) {
	if (!$("#sameResource").is(':checked')) {
		return false;
	}

	var adjacentTiles = this.getAdjacentTiles(tile);
	for (var i = 0; i < adjacentTiles.length; i += 1) {
		var j = (i + 1) % adjacentTiles.length;
		if ( tile.resourceType === adjacentTiles[i].resourceType && adjacentTiles[i].resourceType === adjacentTiles[j].resourceType ) {
			return true;
		}
	}
	return false;
}

CatanMap.prototype.doesFormChain = function(tile) {
	if (!$("#sameResource").is(':checked')) {
		return false;
	}

	var adjacentTiles = this.getAdjacentTiles(tile);

	var count = 0;
	for (var i = 0; i < adjacentTiles.length; i += 1) {
		if ( tile.resourceType === adjacentTiles[i].resourceType ) {
			count = count + 1;
		}
	}

	if( count >= 2 ) {
		console.log("tile: " + tile.number + ", " + tile.resourceType + " -> true");
		return true;
	}

	for (var i = 0; i < adjacentTiles.length; i += 1) {
		if ( tile.resourceType === adjacentTiles[i].resourceType ) {
			var ad2 = this.getAdjacentTiles(adjacentTiles[i]);
			for (var j = 0; j < ad2.length; j += 1) {
				if( tile.gridX === ad2[j].gridX && tile.gridY === ad2[j].gridY ) {
					continue;
				}

				if( tile.resourceType === ad2[j].resourceType ) {
					console.log("tile: " + tile.number + ", " + tile.resourceType + " -> true");
					return true;
				}
			}
		}
	}

	console.log("tile: " + tile.number + ", " + tile.resourceType + " -> false");
	return false;
}

function HexTile() {
	this.gridX;
	this.gridY;
	this.xCenter;
	this.yCenter;
	this.resourceType = "none";
	this.fillStyle = defaultFillStyle;
	this.number;
}
HexTile.prototype.strokeStyle = strokeStyle;
HexTile.prototype.lineWidth = lineWidth;
HexTile.prototype.hexColorMap = resourceTypeToColor;
HexTile.prototype.size = size;
HexTile.prototype.setResourceType = function(resourceType) {
	if (this.hexColorMap[resourceType]) {
		this.resourceType = resourceType;
		this.fillStyle = this.hexColorMap[resourceType];
	} else {
		console.log("Unrecognized resource type:",resourceType);
	}
}
HexTile.prototype.isHighlyProductive = function() {
	return ( (this.number == 6) || (this.number == 8) );
}
HexTile.prototype.setNumber = function(number) {
	this.number = number;
}
HexTile.prototype.setCoordinate = function(x,y) {
	this.gridX = x;
	this.gridY = y;
}
HexTile.prototype.draw = function() {
	this.xCenter = canvasCenterX + dx*this.gridX;
	this.yCenter = canvasCenterY + dy*this.gridY;

	this.drawBase();
	// Don't draw number if desert
	if (this.number) {
		this.drawNumber();
	}
}
HexTile.prototype.drawBase = function() {

	if (mapStyle == "retro") {
		drawingContext.lineWidth = 10;
		drawingContext.fillStyle = "rgba(255,255,255,0)";
		drawingContext.strokeStyle = "#FAEB96";
	} else {
		drawingContext.lineWidth = this.lineWidth;
		drawingContext.fillStyle = this.fillStyle;
		drawingContext.strokeStyle = this.strokeStyle;
	}

	var angleOffset = Math.PI / 6;

	// Begin Path and start at top of hexagon
	drawingContext.beginPath();
	drawingContext.moveTo (
		this.xCenter + size * Math.sin(angleOffset),
		this.yCenter - size * Math.cos(angleOffset)
	);
	// Move clockwise and draw hexagon
	var newAngle;
	for (var i = 1; i <= 6; i += 1) {
		newAngle = i * Math.PI / 3;
		drawingContext.lineTo (
			this.xCenter + size * Math.sin(newAngle + angleOffset),
			this.yCenter - size * Math.cos(newAngle + angleOffset)
		);
	}
	drawingContext.closePath();

	if (mapStyle == "retro") {

		var imgCanvas = resourceTypeToImageCanvas[this.resourceType];

		drawingContext.drawImage(
			imgCanvas,
			0, 0, imgCanvas.width, imgCanvas.height,
			this.xCenter - size,
			this.yCenter - dy,
			2*size,
			2*dy
		);

	} else {
		drawingContext.fill();
	}

	drawingContext.stroke();

}
HexTile.prototype.drawNumber = function() {

	drawingContext.fillStyle = "#FFFFFF";
	drawingContext.strokeStyle = "#000000";
	drawingContext.lineWidth = 3;

	drawingContext.beginPath();
	drawingContext.arc(this.xCenter, this.yCenter, 0.375 * size,
		0, 2 * Math.PI, false);
	drawingContext.closePath();

	drawingContext.fill();
	drawingContext.stroke();

	var fontSizePt = Math.ceil(30/40*(.45*size-8)+6);

	drawingContext.font = "bold " + fontSizePt + "pt sans-serif";
	drawingContext.textAlign = "center";
	if ( this.isHighlyProductive() ) {
		drawingContext.fillStyle = "#FF0000";
	} else {
		drawingContext.fillStyle = "#000000";
	}
	drawingContext.fillText(
		this.number.toString(),
		this.xCenter,
		this.yCenter + Math.ceil( 0.85 * fontSizePt/2 )
	);

}

Array.prototype.random = function(removeElem) {

	var idx = Math.floor(genSeed() * this.length);
	var val = this[idx];
	if (removeElem) {
		this.splice(idx,1);
	}
	return val;
}
Array.prototype.copy = function() {
	return this.slice();
}
Array.prototype.indexOfArray = function(val) {
	var arr = [];
	var sIdx = 0;
	var tmpCopy = this.copy();
	do {
		var rIdx = tmpCopy.indexOf(val);
		var valid = (rIdx >= 0);
		if (valid) {
			tmpCopy.splice(0, rIdx + 1);
			arr.push(sIdx + rIdx);
			sIdx += rIdx + 1;
		}
	} while (valid);
	return arr;
}
Array.prototype.swap = function(idx1, idx2) {
	var tmp = this[idx1];
	this[idx1] = this[idx2];
	this[idx2] = tmp;
}

function addCanvas() {
	//$(mapCanvas).attr("width", 600);
	//$(mapCanvas).attr("height", 400);
	mapCanvas = document.createElement("canvas");
	drawingContext = mapCanvas.getContext('2d');
	mapCanvas.id = "map-canvas";

	sizeCanvas();

	document.getElementById("map-container").appendChild(mapCanvas);

}

function sizeCanvas() {
	var mapContainer = $("div#map-container")[0];
	$(mapCanvas).attr("width", $(mapContainer).width());
	$(mapCanvas).attr("height", $(mapContainer).height());
	canvasCenterY = mapCanvas.height/2;
	canvasCenterX = mapCanvas.width/2;
}

// http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
CanvasRenderingContext2D.prototype.clear =
	CanvasRenderingContext2D.prototype.clear || function (preserveTransform) {
		if (preserveTransform) {
			this.save();
			this.setTransform(1, 0, 0, 1, 0, 0);
		}

		this.clearRect(0, 0, this.canvas.width, this.canvas.height);

		if (preserveTransform) {
			this.restore();
		}
	};


function getUrlVars() {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
		vars[key] = value;
	});
	return vars;
}

function genRandomSeed() {
	return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
