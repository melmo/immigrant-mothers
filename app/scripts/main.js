/*

  NICE TO HAVE

  - allow comparison of two graphs? have a double iframe

  - handle edge cases (loops, dotted lines, multiple levels)

	  DOTTED ( add a field to the table )
	  - Kinga ID 3
	  - Marlena ID 1
	  - Ania ID 4

	  LOOPS ( ?? spend a couple of hours on it, see what happens )
	  - Ania ID 1
	  - Kinga ID 3 (maybe others)
	  - Kaja ID 3

	  MULTIPLE LEVELS ( I think this will just be too hard )
	  - Paulina ID 2
	  - Monika


*/


/* Test data to avoid cross origin problems */
var motherNames = [
		{
			mothers_name : 'Agnieszka',
			csv_file : "data/Agnieszka.csv"
		},
		{
			mothers_name : 'Ania',
			csv_file : "data/Ania.csv"
		},
		{
			mothers_name : 'Iza',
			csv_file : "data/Iza.csv"
		},
		{
			mothers_name : 'Kaja',
			csv_file : "data/Kaja.csv"
		},
		{
			mothers_name : 'Kasia',
			csv_file : "data/Kasia.csv"
		},
		{
			mothers_name : 'Kinga',
			csv_file : "data/Kinga.csv"
		},
		{
			mothers_name : 'Maja',
			csv_file : "data/Maja.csv"
		},
		{
			mothers_name : 'Marlena',
			csv_file : "data/Marlena.csv"
		},
		{
			mothers_name : 'Marta',
			csv_file : "data/Marta.csv"
		},
		{
			mothers_name : 'Milena',
			csv_file : "data/Milena.csv"
		},
		{
			mothers_name : 'Monika',
			csv_file : "data/Monika.csv"
		},
		{
			mothers_name : 'Natalia',
			csv_file : "data/Natalia.csv"
		},
		{
			mothers_name : 'Paulina',
			csv_file : "data/Paulina.csv"
		},
		{
			mothers_name : 'Ula',
			csv_file : "data/Ula.csv"
		}
	];

var gridAllocation = [0,4,6,2,3,7,5,1], // which "arm" of the graph should be used
	imagesLoaded = false, // reset each time data set changes
	backgroundImages = [], // white underlays for semi transparent people icons
	commentActive = false, // is the mouse in a tooltip zone
	debugMouse = false; // renders tooltip zones if true

var headingWidth;

var /*motherNames, */
	activeMother, // index of current mother
	motherName, // name of current mother
	tSize, // size of the Mothers font
	table, // csv of current mother
	data, // structured data for current mother
	w, //available width in page
	h, // height
	comment, // current tooltip text
	shopping, // comment for a mother
	bodyFont, // fonts
	headingFont, //fonts
	closeIcon,
	mothersList, // html for showing mother names as clickable options
	tooltip,
	tooltip2;

function preload() {
//	motherNames = loadJSON('http://migrantmothers.staging.wpengine.com/wp-admin/admin-ajax.php?action=stuff',function() {
		activeMother = -1;
		tSize = 32;
//	});

	// Check available width, minimum 600
	w = $('#data-vis').width() > 600 ? $('#data-vis').width() : 600;
	h = w * .66;

	// preload underlay images and fonts
	backgroundImages.female = loadImage('images/female-background.png');
	backgroundImages.male = loadImage('images/male-background.png');
	backgroundImages.femalemale = loadImage('images/female-male-background.png');

	closeIcon = loadImage('images/close.png');

	bodyFont = loadFont('fonts/CrimsonText-Roman.ttf');
	headingFont = loadFont('fonts/Oswald-Regular.ttf');

}


function setup() {

	// create html for tiled list of mothers' names
	mothersList = $('<div id="mothers-list"></div>');
	_.each(motherNames,function(element,index,list) {
		mothersList.append('<a data-value="' + index + '"><h3>' + element.mothers_name + '</h3></a>');
	});

	$('.form-controls').append(mothersList);

	// set up click listener to initialise data
	mothersList.on('click', 'a', function() {
		imagesLoaded = false;
		activeMother = $(this).data('value');
		motherName = motherNames[activeMother].mothers_name,
		table = loadTable(motherNames[activeMother].csv_file, "csv", "header",function() {
			setupData();
			//call draw function with checking if images are loaded
			delayDraw();

		});
		mothersList.slideUp();
		resizeCanvas(w,h);
	});

	// create the canvas and append to the #data-vis div
	var cnv = createCanvas(0, 0);
	cnv.parent("data-vis");

	tooltip = $('<div id="tooltip-comment"></div>');
	$('#data-vis').append(tooltip);
	tooltip.popover({
		content : function() {
			return comment;
		},
		trigger : 'manual',
		animation : false
	});

	tooltip2 = $('<div id="tooltip2-comment"></div>');
	$('#data-vis').append(tooltip2);
	tooltip2.popover({
		content : function() {
			return shopping;
		},
		trigger : 'manual',
		animation : false
	});

}

function delayDraw() {
	if (checkImages()) draw2();
	else setTimeout(delayDraw, 200);
}


function draw2() {

	// do nothing if no mother is selected
	if (activeMother == -1) {
		return;
	}

	var x1 = 0,
		x2 = 0,
		y1 = height/10,
		y2 = height / 2 - y1 * 1.5,
		isf = 1800/height,
		displacement = 175/isf; // image scale factor

	push();
		translate(Math.floor(width/2), Math.floor(height/2));

		_.each(data, function(element, index, list) {
			push();
				rotate(gridAllocation[index]/8 * TWO_PI);
				var numArrows = element.length - 1;
				var baseDisplace = numArrows * displacement * -1.0 / 2;
				// draw line
				_.each(element, function(innerElement, innerIndex, innerList) {
					push();
						translate(Math.floor(baseDisplace + innerIndex * displacement) , 0);
						stroke(activityColors(innerElement.activityType));
						strokeWeight(2);

						if (innerElement.activityType === "keeping and bringing" && !innerElement.countryImage) // halven the length of the line (represents a LOOP)
							line(x1,y1,x2,y2/2);

						else if (innerElement.dotted === "0" || innerElement.dotted === "") // normal line
							line(x1, y1, x2, y2);

						else if(innerElement.dotted === "1") { // make a dotted Line
							for (var i = 0; i <= 25; i++) {
								strokeWeight(3);
								var xDotted = lerp(x1, x2, i/25);
								var yDotted = lerp(y1, y2, i/25);
								point(xDotted, yDotted);
							}
						}

						// draw arrow head : https://processing.org/discourse/beta/num_1219607845.html
						if (innerElement.activityType !== "keeping and bringing") {
							push();
								if (innerElement.direction == 'to') {
									var arrX1 = x2;
									var arrX2 = x1;
									var arrY1 = y2;
									var arrY2 = y1;
								} else {
									var arrX1 = x1;
									var arrX2 = x2;
									var arrY1 = y1;
									var arrY2 = y2;
								}
								translate(Math.floor(arrX2), Math.floor(arrY2));
								var a = atan2(arrX1-arrX2, arrY2-arrY1);
								rotate(a);
								line(0, 0, -10, -10);
								line(0, 0, 10, -10);
							pop();
						}
					pop();
				});

			pop();

			// add images
			_.each(element, function(innerElement, innerIndex, innerList) {

				// add person image
				var theta = (gridAllocation[index] + 2) / 8 * TWO_PI;
				var hyp = y2 - displacement/6;
				var hypShort = y1;
				var xTrans = Math.cos(theta) * hyp;
				var yTrans = Math.sin(theta) * hyp;
				var xDisplace = baseDisplace * yTrans/hyp + innerIndex * displacement * yTrans/hyp;
				var yDisplace = baseDisplace * xTrans/hyp + innerIndex * displacement * xTrans/hyp;

				if (!innerElement.boundSet) {

					if (xTrans <= 0.5) innerElement.x1 = (xTrans - xTrans/hyp * -169/isf - (169/isf)/2) + xDisplace + width/2;
					else innerElement.x1 = (Math.cos(theta) * hypShort - Math.cos(theta) * hypShort/hypShort * -169/isf ) * 0.5 + xDisplace + width/2;

					if (xTrans <= -0.5) innerElement.x2 = (Math.cos(theta) * hypShort - Math.cos(theta) * hypShort/hypShort * -169/isf ) * 0.5 + xDisplace + width/2;
					else innerElement.x2 = (xTrans - xTrans/hyp * -169/isf - (169/isf)/2) + xDisplace + width/2 + 169/isf;

					if (yTrans <= 0.5) innerElement.y1 = (yTrans - yTrans/hyp * -175/isf - 175/isf * .5) + yDisplace + height/2;
					else innerElement.y1 = ((Math.sin(theta) * hypShort - Math.sin(theta) * hypShort/hypShort * -169/isf )) * 0.5 + yDisplace + height/2;

					if (yTrans <= -0.5) innerElement.y2 = ((Math.sin(theta) * hypShort - Math.sin(theta) * hypShort/hypShort * -169/isf )) * 0.5 + yDisplace + height/2;
					else innerElement.y2 = (yTrans - yTrans/hyp * -175/isf - 175/isf * .5) + yDisplace + height/2 + 175/isf;

					innerElement.boundSet = true;
				}

				push();
					translate(Math.floor(xTrans - xTrans/hyp * -169/isf - (169/isf)/2), Math.floor(yTrans - yTrans/hyp * -175/isf - 175/isf * .5));
				//	translate(Math.floor(xDisplace), Math.floor(yDisplace));

					if (innerElement.countryImage) image(innerElement.countryImage, 0, 0, Math.floor(169/isf), Math.floor(175/isf));

					if (innerElement.personImage) {
						if (!innerElement.backgroundImage === false)
							image(backgroundImages[innerElement.backgroundImage], 0, 0, Math.floor(169/isf), Math.floor(175/isf) );
						tint(255,innerElement.transparency);
						image(innerElement.personImage, 0, 0, Math.floor(169/isf), Math.floor(175/isf));

						// if there are persons > 1, add the same person again, slightly translated
						if (innerElement.doDoublePerson) {
							tint(255,255);
							if (!innerElement.backgroundImage === false)
								image(backgroundImages[innerElement.backgroundImage], -20, 0, Math.floor(169/isf), Math.floor(175/isf) );
							tint(255,innerElement.transparency);
							image(innerElement.personImage, -20, 0, Math.floor(169/isf), Math.floor(175/isf));
						}

					}

				pop();
				// add object image
				hyp = y2 * .4;
				xTrans = Math.cos(theta) * hyp;
				yTrans = Math.sin(theta) * hyp;
				push();
					translate(Math.floor(xTrans - xTrans/hyp * -169/isf - (169/isf)/2), Math.floor(yTrans - yTrans/hyp * -175/isf - 175/isf * .5));
					translate(Math.floor(xDisplace), Math.floor(yDisplace));
					if (innerElement.objectImage) {
						// placing a white rectangel behind the object-images (so the lines get interrupted)
						fill(255);
						noStroke();
						rect(0, 0, Math.floor(169/isf), Math.floor(175/isf));
						image(innerElement.objectImage, 0, 0, Math.floor(169/isf), Math.floor(175/isf));
					}
				pop();
			});
		});

		// Mothers name

		textAlign(CENTER);
		textFont(headingFont);
		textSize(tSize);
		headingWidth = textWidth(motherName.toUpperCase());
		fill(255);
		strokeWeight(1);
		stroke(69);
		rect(-(headingWidth+15)/2, -22, headingWidth+15, 44);
		fill(69);
		strokeWeight(0);
		text(motherName.toUpperCase(), 0, 15);

	pop();

	// end draw graph function


	// show mouse sensitive areas (for debug)
	if (debugMouse) {
		_.each(data, function(element, index, list) {
	  		_.each(element, function(innerElement, innerIndex, innerList) {
		  		if (innerElement.boundSet) {
	  				fill(0,0,0,125);
	  				tint(255,255);
	  				rect( innerElement.x1, innerElement.y1, innerElement.x2 - innerElement.x1,  innerElement.y2 - innerElement.y1);
		  		}
		  	});
		});
	}

	// draw close button
	image(closeIcon, width - 50 , 20, 30, 30);

}


// check on mouse move if we are inside a tooltip area
function mouseMoved() {

	if (activeMother < 0) return;

	var tempComment = false;
	var whichComment = 0;
  	_.each(data, function(element, index, list) {
	  	_.each(element, function(innerElement, innerIndex, innerList) {
	  		if (innerElement.boundSet) {
	  			if (mouseX > innerElement.x1 && mouseX < innerElement.x2 && mouseY > innerElement.y1 && mouseY < innerElement.y2) {
	  				whichComment = 1;
	  				tempComment = true;
	  				comment = null;
	  				comment = innerElement.comment;
	  				tooltip.css({
						position : 'absolute',
						left : (mouseX + 20) + 'px',
						top : mouseY + 'px'
					});
	  			}

	  			// check wether the mouse is over the Mothers name
	  			if(mouseX > (width/2 - headingWidth/2) && mouseX < (width/2 + headingWidth/2) && mouseY > (height/2 - tSize/2) && mouseY < (height/2 + tSize/2)) {
	  				whichComment = 2;
	  				tempComment = true;
	  				shopping = null;
	  				shopping = innerElement.shopping;
	  				tooltip2.css({
	  					position : 'absolute',
	  					left : (mouseX + 20) + 'px',
	  					top : mouseY + 'px'
	  				});
	  			}
	  		}
	  	});
	});


	if (tempComment && whichComment == 1) tooltip.popover('show');
	else if (tempComment && whichComment == 2) tooltip2.popover('show');
	else if (commentActive && !tempComment) {
		whichComment = 0;
		tooltip.popover('hide');
		tooltip2.popover('hide');
	}
	commentActive = tempComment;
	return false;
}


// if we click on the close button, go back to the list of names
function mouseClicked() {
	if (mouseX > width - 50 && mouseX < width - 20 && mouseY > 20 && mouseY < 50) {
		tooltip.popover('hide');
		activeMother = -1;
		resizeCanvas(0,0);
		mothersList.slideDown();
	}
}

// set colours for activities
function activityColors(activityType) {
	if (activityType      == "presenting") return color(1, 149, 63); //green
	else if (activityType == "giving") return color(234, 78, 27); //orange
	else if (activityType == "borrowing and lending") return color(255, 238, 63); //yellow
	else if (activityType == "buying and selling") return color(102, 35, 132); //purple
	else if (activityType == "keeping and bringing") return color(28); // darkGray

	return color(0);
}


// read data in from table and make it into a usable structure
function setupData() {
	data = null;
	data = [];
	var active_cid = -1;
	for (var i = 0; i < table.getRowCount(); i++) {
		var cid = table.get(i, 'connection_id') - 1;
		if ( active_cid != cid ) {
			active_cid = cid;
			data[cid] = [];
		}
		var personImageString = '';
		var backgroundImage = false;
		if (table.get(i, 'rel_type').indexOf('commercial') > -1) {
			personImageString = table.get(i, 'rel_type').split(' ').join('-');
		} else {
			personImageString = table.get(i, 'gender') == 'female/male' ? 'female-male' : table.get(i, 'gender');
			backgroundImage = personImageString.split('-').join('');
		}

		var doDoublePerson = false;
		var relTypeLastCharacter = table.get(i, 'rel_type').slice(-1);

		if (backgroundImage !== "femalemale" && table.get(i, 'rel_type').indexOf('commercial') === -1 && relTypeLastCharacter === "s")
			doDoublePerson = true;

		var objImageString = table.get(i, 'obj_name').split(' ').join('-');

		var transparency = 255;
		if (table.get(i, 'rel_type').indexOf('friend') > -1) transparency = 255 * .75;
		else if (table.get(i, 'rel_type').indexOf('colleague') > -1) transparency = 255 * .5;
		else if (table.get(i, 'rel_type').indexOf('playgroup') > -1) transparency = 255 * .25;

		data[cid].push({
			id : cid,
			objName : table.get(i, 'obj_name'),
			direction : table.get(i, 'direction'),
			activityType : table.get(i, 'activity_type'),
			relType : table.get(i, 'rel_type'),
			country : table.get(i, 'country'),
			gender : table.get(i, 'gender'),
			comment : table.get(i, 'comment'),
			dotted : table.get(i, 'dotted'),
			shopping : table.get(i, 'shopping'),
			personImage : personImageString == '' ? false : loadImage('images/' + personImageString + '.png'),
			countryImage : table.get(i, 'country') == '' ? false : loadImage('images/' + table.get(i, 'country') + '.png'),
			objectImage : objImageString == '' ? false : loadImage('images/obj-' + objImageString + '.png'),
			transparency : transparency,
			backgroundImage : backgroundImage,
			doDoublePerson : doDoublePerson,
			x1 : 0,
			x2 : 0,
			y1 : 0,
			y2 : 0,
			boundSet : false
		});
	}
}


// check if images are loaded
function checkImages() {

	var testImages = _.find(data, function(element) {
		var test = _.find(element, function(innerElement) {
			/*console.log(innerElement.personImage.width);
			console.log(innerElement.countryImage.width);
			console.log(innerElement.objectImage.width);*/
			return innerElement.personImage.width < 2 || innerElement.countryImage.width < 2 || innerElement.objectImage.width < 2; // return true if image not loaded
		});

		return test !== undefined; // true if unloaded images found
	});

	return testImages === undefined; // true if no unloaded images found
}