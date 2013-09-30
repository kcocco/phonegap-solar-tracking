// Javascript
function init_alignmentGauge(elementId){
  //<script src="raphael-min.js" type="text/javascript"></script>
      // Creates canvas 320 × 200 at 10, 50
      paper = Raphael(elementId, 360, 360);
      c = paper.rect(0, 0, 360, 360, 10);
      centerX = paper.width/2;
      centerY = paper.height/2;
      outering = 42;
      radius = centerX - outering;
      sunAngle = 0;
      ovenAngle = 0;
      ovenwidth = 20;
      sunDiam = outering/2;
      armStrokeWidth =4;
      sunRiseAngle = 64;
      sunRiseTime = "5:32"
      sunSetAngle = 292;
      sunSetTime = "9:15"
      heading_font = 33;
      degrees_font =14;
      suntime_font =16;
}

function drawArc(r, centerX, centerY, radius, startAngle, endAngle) {
        var startX = centerX+radius*Math.cos((90-startAngle)*Math.PI/180); 
        var startY = centerY-radius*Math.sin((90-startAngle)*Math.PI/180);
        var endX = centerX+radius*Math.cos((90-endAngle)*Math.PI/180); 
        var endY = centerY-radius*Math.sin((90-endAngle)*Math.PI/180);
        var flg1 = 0;

        if (startAngle>endAngle)
            flg1 = 1;
        else if (startAngle<180 && endAngle<180)
            flg1 = 0;
        else if (startAngle>180 && endAngle>180)
            flg1 = 0;
        else if (startAngle<180 && endAngle>180)
            flg1 = 0; // edited for bugfix here, previously this was 1
        else if (startAngle>180 && endAngle<180)
            flg1 = 1;

        return r.path([['M',startX, startY],['A',radius,radius,0,flg1,1,endX,endY]]);
}

function drawPie(r, centerX, centerY, radius, startAngle, endAngle) {
        var startX = centerX+radius*Math.cos((90-startAngle)*Math.PI/180); 
        var startY = centerY-radius*Math.sin((90-startAngle)*Math.PI/180);
        var endX = centerX+radius*Math.cos((90-endAngle)*Math.PI/180); 
        var endY = centerY-radius*Math.sin((90-endAngle)*Math.PI/180);
        var flg1 = 0;

        if (startAngle>endAngle)
            flg1 = 1;
        else if (startAngle<180 && endAngle<180)
            flg1 = 0;
        else if (startAngle>180 && endAngle>180)
            flg1 = 0;
        else if (startAngle<180 && endAngle>180)
            flg1 = 0; // edited for bugfix here, previously this was 1
        else if (startAngle>180 && endAngle<180)
            flg1 = 1;

        return r.push(paper.path([['M',startX, startY],['A',radius,radius,0,flg1,1,endX,endY],['L',centerX,centerY],['L',startX, startY]]));
}

function alignmentGauge(refresh,sunAngle,ovenAngle,sunRiseAngle,sunSetAngle,sunRiseTime,sunSetTime){
      sunAngle = parseFloat(sunAngle);
      ovenAngle = parseFloat(ovenAngle);
      var displaySunAngle = ((sunAngle+90)%360);
      var displayOvenAngle = ((ovenAngle+90)%360);
      //console.log("displayOvenAngle " + displayOvenAngle);
      console.log("centerY " + centerY);

      //var displayOvenAngle = ((ovenAngle)%360);

      // refresh = 1(yes draw entire compass) 0(draw only update items compass and sun)
      if (parseInt(refresh) == 1) {
      	  paper.clear() 
	      // Draw Compass Outer Dial
	      var compassDial = paper.set();
	      compassDial.push(paper.circle(centerX, centerY, radius+outering).attr({fill:'black'}));
      
	      // Draw Compass Headings and marks
	      var fontAttr = {font:'12px Verdana','font-size':heading_font,'text-anchor':'middle',fill:'white',stroke:"white"};
	      var headingDiff = 20;
	      compassDial.push(paper.text( centerX, centerY+radius+headingDiff, "N").attr(fontAttr));
	      compassDial.push(paper.text( centerX, centerY-radius-headingDiff, "S").attr(fontAttr));
	      compassDial.push(paper.text( centerX+radius+headingDiff, centerY, "W").attr(fontAttr).rotate(90));
	      compassDial.push(paper.text( centerX-radius-headingDiff, centerY, "E").attr(fontAttr).rotate(-90));
      
	      var tickLength=22;
	      var tickLengthSmall=8;
	      var tickAttr = {fill:'white',stroke:"white","stroke-width":2};
	      var tickAngle=0;
	      var textAngle=360;
	      var fontNumberAttr = {font:'12px Verdana','font-size':degrees_font,'text-anchor':'middle',fill:'white',stroke:'white'};
        var degreeDiff = 17
	      while (tickAngle<360) {
	        compassDial.rotate(tickAngle+180,centerX,centerY);
	        if (tickAngle%90!=0) {compassDial.push(paper.path([['M',centerX, centerY+radius],['L',centerX, centerY+radius+tickLength]]).attr(tickAttr))}
	        compassDial.rotate(10,centerX,centerY);
	        if ((textAngle-10)%90!=0) {
	            compassDial.push(paper.text( centerX, centerY-radius-degreeDiff, textAngle-10).attr(fontNumberAttr))
			    compassDial.push(paper.path([['M',centerX, centerY+radius],['L',centerX, centerY+radius+tickLengthSmall]]).attr(tickAttr))
			}
            
	        compassDial.rotate(-(tickAngle+10+180),centerX,centerY);
	        tickAngle = tickAngle + 20;
	        textAngle = textAngle-20
	      }

		  // Arc - Pies
		  var sunArc = paper.set();
	      var sunArc = drawPie(sunArc, centerX, centerY, radius, 180+sunRiseAngle, sunSetAngle-180);
	      sunArc.attr({fill:'yellow'});
	      var nightArc = paper.set();
	      var nightArc = drawPie(nightArc, centerX, centerY, radius, sunSetAngle-180,180+sunRiseAngle);
	      nightArc.attr({fill:'grey'});
	      // Draw Sun Set Rise text
	      var fontRiseSetAttr = {font:'12px Verdana','font-size':suntime_font,'text-anchor':'middle',fill:'white',stroke:'white'};
	      nightArc.rotate(270-sunSetAngle,centerX,centerY)
	      nightArc.push(paper.text( centerX+radius/2+6, centerY+8, sunSetTime).attr(fontRiseSetAttr))
	      nightArc.rotate(-(90-sunSetAngle),centerX,centerY)
		  nightArc.rotate(270-sunRiseAngle,centerX,centerY)
	      nightArc.push(paper.text( centerX-radius/2-6, centerY+8, sunRiseTime+" am").attr(fontRiseSetAttr))
	      nightArc.rotate(-(90-sunRiseAngle),centerX,centerY)
	  }
      
      else {	// refresh != 1 ... only refresh arms and oven
        //alert (window.armsSunCompass);
        window.armsSunCompass.remove();
        window.oven.remove();
      }
      window.armsSunCompass = paper.set();
	  window.oven = paper.set();
      
      // Draw Oven Angle Line
      var temppath = ["M", centerX,centerY, "L", Math.cos(displayOvenAngle*(Math.PI/180))*radius+centerX, Math.sin(displayOvenAngle*(Math.PI/180))*radius+centerY].join(' ');
      window.armsSunCompass.push(paper.path(temppath).attr({'stroke-width':armStrokeWidth,'arrow-end':"classic-long-wide"}));
      
      // Draw Sun Angle Line
      var temppath = ["M", centerX,centerY, "L", Math.cos(displaySunAngle*(Math.PI/180))*radius+centerX, Math.sin(displaySunAngle*(Math.PI/180))*radius+centerY].join(' ');
      window.armsSunCompass.push(paper.path(temppath).attr({"opacity":0.9,"stroke-width":armStrokeWidth,"stroke":"orange","stroke-dasharray":"-"}));

      // Draw Sun
      window.armsSunCompass.push(paper.circle(Math.cos(displaySunAngle*(Math.PI/180))*(radius+outering/2)+centerX, Math.sin(displaySunAngle*(Math.PI/180))*(radius+outering/2)+centerY,sunDiam).attr({fill:"orange",stroke:"orange",opacity:0.9}));

      // Creates oven
      window.oven.push(paper.rect(centerX - ovenwidth/2, centerY - ovenwidth/2, ovenwidth, ovenwidth, 2 ).attr({fill:'black'}));
      ovenReflectorPath =["M", centerX - ovenwidth/2, centerY + ovenwidth/2, "L", centerX - ovenwidth, centerY + ovenwidth, "L", centerX + ovenwidth, centerY + ovenwidth, "L", centerX + ovenwidth/2, centerY + ovenwidth/2].join(' ');
      window.oven.push(paper.path(ovenReflectorPath).attr({fill:'#edf1f9'}));
      window.oven.attr("stroke", "black");
      window.oven.attr("stroke-width",1);
      // rotate oven
       window.oven.rotate(displayOvenAngle-90, centerX, centerY);      
      //window.oven.rotate(displayOvenAngle, centerX, centerY);      
}