/*

  TO DO
  - upload text for pictures
  - legend with activity colours & pictograms
  - connect to custom fields
  


  NICE TO HAVE
  - handle edge cases (loops, dotted lines, multiple levels) ??
  - Ania (keeping and bringing, no partner)
  - Kinga (keeping and bringing, no partner)
  - allow comparisons ??



*/

/*var motherNames = [
		{
			mothers_name : 'Agnieszka',
			csv_file : "http://immigrantmothers.net/wp-content/uploads/2015/11/Agnieszka.csv"
		},
		{
			mothers_name : 'Ania',
			csv_file : "http://immigrantmothers.net/wp-content/uploads/2015/11/Ania.csv"
		}
	];*/

var gridAllocation = [0,4,6,2,3,7,5,1],
	imagesLoaded = false,
	backgroundImages = [],
	commentActive = false,
	debugMouse = false;

var motherNames,
	activeMother,
	motherName,
	table,
	data,
	w,
	h,
	comment,
	bodyFont,
	headingFont;

function preload() {
	motherNames = loadJSON('http://migrantmothers.staging.wpengine.com/wp-admin/admin-ajax.php?action=stuff',function() {
		activeMother = 0;
		motherName = motherNames[activeMother].mothers_name;
		table = loadTable(motherNames[activeMother].csv_file, "csv", "header");
	});	
	
	w = $('#data-vis').width() > 600 ? $('#data-vis').width() : 600;
	h = w * .66;

	backgroundImages.female = loadImage('images/female-background.png');
	backgroundImages.male = loadImage('images/male-background.png');
	backgroundImages.femalemale = loadImage('images/female-male-background.png');

	bodyFont = loadFont('fonts/CrimsonText-Roman.ttf');
	headingFont = loadFont('fonts/Oswald-Regular.ttf');

}


function setup() {
	var mothersList = $('<select class="form-control" id="mothers-list"></select>');
	_.each(motherNames,function(element,index,list) {
		mothersList.append('<option value="' + index + '">' + element.mothers_name + '</option>');
	});

	$('.form-controls').append(mothersList);

	mothersList.on('change', function() {
		imagesLoaded = false;
		activeMother = this.value;
		motherName = motherNames[activeMother].mothers_name,
		table = loadTable(motherNames[activeMother].csv_file, "csv", "header",function() {
			setupData();
		});
	});

	var cnv = createCanvas(w, h);
	cnv.parent("data-vis");
	
	setupData();
}

function draw() {
	var radius = width * .66;
	var gr = 235,gg = 225,gb = 204;
	background(gr, gg, gb);
	ellipseMode(RADIUS);
	noStroke();
	
	for (var r = radius; r > 0; --r) {
		fill(gr, gg, gb);
		ellipse(width/2, height/2, r, r);
		gr = gr + 0.15;
		gg = gg + 0.15;
		gb = gb + 0.15;
	}

	if (!imagesLoaded) {
		imagesLoaded = checkImages();
		return;
	} 

	var x1 = 0,
		x2 = 0,
		y1 = height/10,
		y2 = height / 2 - y1 * 1.5,
		isf = 1800/height,
		displacement = 175/isf; // image scale factor

	push();
		translate(width/2, height/2);

		_.each(data, function(element, index, list) {
			push();
				rotate(gridAllocation[index]/8 * TWO_PI);
				var numArrows = element.length - 1;
				var baseDisplace = numArrows * displacement * -1.0 / 2;
				// draw line
				_.each(element, function(innerElement, innerIndex, innerList) {
					push();
						translate(baseDisplace + innerIndex * displacement , 0);
						stroke(activityColors(innerElement.activityType));
						strokeWeight(2);
						line(x1, y1, x2, y2);
						// draw arrow head : https://processing.org/discourse/beta/num_1219607845.html
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
							translate(arrX2, arrY2);
							var a = atan2(arrX1-arrX2, arrY2-arrY1);
							rotate(a);
							line(0, 0, -10, -10);
							line(0, 0, 10, -10);
						pop();

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
				var yDisplace = baseDisplace * xTrans/hyp + innerIndex * displacement* xTrans/hyp;

				if (!innerElement.boundSet) {
					
					if (xTrans <= 0.5) {
						innerElement.x1 = (xTrans - xTrans/hyp * -169/isf - (169/isf)/2) + xDisplace + width/2;
					} else {
						innerElement.x1 = (Math.cos(theta) * hypShort - Math.cos(theta) * hypShort/hypShort * -169/isf ) * 0.5 + xDisplace + width/2;	
					}
					if (xTrans <= -0.5) {
						innerElement.x2 = (Math.cos(theta) * hypShort - Math.cos(theta) * hypShort/hypShort * -169/isf ) * 0.5 + xDisplace + width/2;
					} else {
						innerElement.x2 = (xTrans - xTrans/hyp * -169/isf - (169/isf)/2) + xDisplace + width/2 + 169/isf;
					}
					 
					
					if (yTrans <= 0.5) {
						innerElement.y1 = (yTrans - yTrans/hyp * -175/isf - 175/isf * .5) + yDisplace + height/2;
					} else {
						innerElement.y1 = ((Math.sin(theta) * hypShort - Math.sin(theta) * hypShort/hypShort * -169/isf )) * 0.5 + yDisplace + height/2;
					}
					if (yTrans <= -0.5) {
						innerElement.y2 = ((Math.sin(theta) * hypShort - Math.sin(theta) * hypShort/hypShort * -169/isf )) * 0.5 + yDisplace + height/2;
					} else {
						innerElement.y2 = (yTrans - yTrans/hyp * -175/isf - 175/isf * .5) + yDisplace + height/2 + 175/isf;
					}
					
					innerElement.boundSet = true;
				}
					
				push();
					translate(xTrans - xTrans/hyp * -169/isf - (169/isf)/2, yTrans - yTrans/hyp * -175/isf - 175/isf * .5);
					translate(xDisplace, yDisplace);
					if (innerElement.countryImage) image(innerElement.countryImage, 0, 0, 169/isf, 175/isf);
					
					if (innerElement.personImage) {
						if (!innerElement.backgroundImage === false)
							image(backgroundImages[innerElement.backgroundImage], 0, 0, 169/isf, 175/isf);
						tint(255,innerElement.transparency);
						image(innerElement.personImage, 0, 0, 169/isf, 175/isf);
						tint(255,255);
					} 
					
				pop();
				// add object image
				hyp = y2 * .4;
				xTrans = Math.cos(theta) * hyp;
				yTrans = Math.sin(theta) * hyp;
				push();
					translate(xTrans - xTrans/hyp * -169/isf - (169/isf)/2, yTrans - yTrans/hyp * -175/isf - 175/isf * .5);
					translate(xDisplace, yDisplace);
					if (innerElement.objectImage) image(innerElement.objectImage, 0, 0, 169/isf, 175/isf);
				pop();
			});
		});

		// Mothers name

		textAlign(CENTER);
		textFont(headingFont);
		textSize(32);
		var headingWidth = textWidth(motherName.toUpperCase());
		fill(255);
		strokeWeight(1);
		stroke(69);
		rect(-(headingWidth+15)/2, -22, headingWidth+15, 44);
		fill(69);
		strokeWeight(0);
		text(motherName.toUpperCase(), 0, 15);

	pop();

	if (commentActive) {
	
		fill(255);
		stroke(0);
		strokeWeight(1);
		textAlign(LEFT);
		textFont(bodyFont);
		textSize(16);
		var commentWidth = textWidth(comment);
		rect(mouseX + 20, mouseY + 20, 360, Math.ceil(commentWidth/340) * 24 + 20);
		fill(69);
		strokeWeight(0);
		text(comment,mouseX + 30, mouseY + 30, 340, 500);
	}

	// show mouse sensitive areas
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
	
	
}

function mouseMoved() {
	var tempComment = false;
  	_.each(data, function(element, index, list) {
	  	_.each(element, function(innerElement, innerIndex, innerList) {
	  		if (innerElement.boundSet) {
	  			if (mouseX > innerElement.x1 && mouseX < innerElement.x2 && mouseY > innerElement.y1 && mouseY < innerElement.y2) {
	  				tempComment = true;
	  				comment = innerElement.comment;
	  			}
	  		}

	  	});
	});
	commentActive = tempComment;
	return false;
}


function activityColors(activityType) {
	if (activityType == "presenting") { //green
		return color(1, 149, 63);
	} else if (activityType == "giving") { //orange
		return color(234, 78, 27);
	} else if (activityType == "borrowing and lending") { //yellow
		return color(255, 238, 63);
	} else if (activityType == "buying and selling") { //purple
		return color(102, 35, 132);
	} else if (activityType == "keeping and bringing") { // darkGray
		return color(28);
	}
	return color(0);
}

function setupData() {
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

		var objImageString = table.get(i, 'obj_name').split(' ').join('-');

		var transparency = 255;
		if (table.get(i, 'rel_type').indexOf('friend') > -1) {
			transparency = 255 * .75;
		} else if (table.get(i, 'rel_type').indexOf('colleague') > -1) {
			transparency = 255 * .5;
		} else if (table.get(i, 'rel_type').indexOf('playgroup') > -1) {
			transparency = 255 * .25;
		}
		
		data[cid].push({
			id : cid,
			objName : table.get(i, 'obj_name'),
			direction : table.get(i, 'direction'),
			activityType : table.get(i, 'activity_type'),
			relType : table.get(i, 'rel_type'),
			country : table.get(i, 'country'),
			gender : table.get(i, 'gender'),
			comment : table.get(i, 'comment'),
			personImage : personImageString == '' ? false : loadImage('images/' + personImageString + '.png'),
			countryImage : table.get(i, 'country') == '' ? false : loadImage('images/' + table.get(i, 'country') + '.png'),
			objectImage : objImageString == '' ? false : loadImage('images/obj-' + objImageString + '.png'),
			transparency : transparency,
			backgroundImage : backgroundImage,
			comment : table.get(i, 'comment'),
			x1 : 0,
			x2 : 0,
			y1 : 0,
			y2 : 0,
			boundSet : false
		});
	}
}

function checkImages() {

	var testImages = _.find(data, function(element) {
		var test = _.find(element, function(innerElement) {
			return innerElement.personImage.width < 1 && innerElement.countryImage.width < 1 && innerElement.objectImage.width < 1; // return true if image not loaded
		});

		return test;
	});

	return !testImages;

}

