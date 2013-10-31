 // Javascript


//var w = 640;
//var h = 360;
var w = 640;
var h = 360;

function init_altitudeForecast(elementId){
      //alt_paper = Raphael(elementId, w, h);
      alt_paper = Raphael(elementId);
      //var alt_paper = Raphael("wrap");
      alt_paper.setViewBox(0,0,w,h,true);

      //below does not seem to do anything?  notes:http://www.w3.org/TR/SVG11/coords.html#PreserveAspectRatioAttribute
      //   http://stackoverflow.com/questions/11176396/how-can-i-scale-raphael-js-elements-on-window-resize-using-jquery
      alt_paper.canvas.setAttribute('preserveAspectRatio', 'xMidYMid meet');

      // from: http://jsfiddle.net/AUNwC/44/
      // ok, raphael sets width/height even though a viewBox has been set, so let's rip out those attributes (yes, this will not work for VML)
      
      // remove to keep dimentions on Android?... did not work?
      var svg = document.querySelector("svg");
      svg.removeAttribute("width");
      svg.removeAttribute("height");


}

function calcTime(UTCoffset) {
        // create Date object for current location
        d = new Date();
        
        // convert to msec
        // add local time zone offset 
        // get UTC time in msec
        utc = d.getTime() + (d.getTimezoneOffset() * 60000);
        
        // create new Date object for different city
        // using supplied offset
        nd = new Date(utc + UTCoffset*1000);

        // return time as a string
        return nd.getHours()+':'+nd.getMinutes();
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

        return r.push(alt_paper.path([['M',startX, startY],['A',radius,radius,0,flg1,1,endX,endY],['L',centerX,centerY],['L',startX, startY]]));
}

//roundedRectangle(x, y, width, height, upper_left_corner, upper_right_corner, lower_right_corner, lower_left_corner)
Raphael.fn.roundedRectangle = function (x, y, w, h, r1, r2, r3, r4){
        var array = [];
        array = array.concat(["M",x,r1+y, "Q",x,y, x+r1,y]); //A
        array = array.concat(["L",x+w-r2,y, "Q",x+w,y, x+w,y+r2]); //B
        array = array.concat(["L",x+w,y+h-r3, "Q",x+w,y+h, x+w-r3,y+h]); //C
        array = array.concat(["L",x+r4,y+h, "Q",x,y+h, x,y+h-r4, "Z"]); //D
        return this.path(array);
    };
//    var paper = Raphael("canvas", 840, 480);
//    paper.roundedRectangle(10, 10, 80, 80, 0, 10, 25, 5).attr({fill: "#f00"});

function altitudeForecast(refresh, sunrise, sunset, currentTime, currentAlt, altitudeArray, UTCoffset, cloudCoverArray, precipProbabilityArray, windSpeedArray){

      console.log('altitudeForecast vars'+' * '+ refresh+' * '+ sunrise+' * '+ sunset+' * '+ currentTime +' * '+currentAlt +' * '+altitudeArray +' * '+cloudCoverArray +' * '+precipProbabilityArray+' * '+windSpeedArray);
      if (UTCoffset != 9999) {
        var currentTime = calcTime(UTCoffset);
      }      
      var currentTimeSplit = currentTime.split(":");
      var sunRiseSplit = sunrise.split(":");
      var sunSetSplit = sunset.split(":");
      var numberTimeSlots = sunSetSplit[0]-sunRiseSplit[0]+2
      var columnWidth = w/numberTimeSlots;
      
      
      
      // refresh = 1(yes draw entire compass) 0(draw only update items compass and sun)
      if (parseInt(refresh) == 1) {
        alt_paper.clear()
        c = alt_paper.rect(0, 0,w,h, 0);
        c.attr({fill:"black",stroke:"black"});

        //alt_paper.roundedRectangle(10, 10, 80, 80, 0, 10, 25, 5).attr({fill: "#f00"});

        var timeGrid =alt_paper.set();
        var sunChartBottom =h-columnWidth/2
        var topSunChart = 150;
        var timeTextSpace = 18;
        var topForecastSpace = timeTextSpace * 2;
        var bottomForecastSpace = topSunChart - columnWidth/2;
        var temp16percent = (bottomForecastSpace-topForecastSpace)/6
        var TimeLineAttr = {fill:'grey',stroke:"grey","stroke-width":1,"stroke-dasharray":"."};
        var fontAttr = {font:'12px Verdana','font-size':12,'text-anchor':'middle',fill:'white',stroke:"white"};
        
        // Find max altitude to create scale ratio
        var maxAltitude = 0;
        for (var i = 0; i < altitudeArray.length; i++) {
            if (parseInt(altitudeArray[i])>maxAltitude) {maxAltitude = parseInt(altitudeArray[i])}
        }
        window.altScale = (sunChartBottom-topSunChart)/maxAltitude;
        var TimeSlot = 1;
        while (TimeSlot<numberTimeSlots){
          timeGrid.push(alt_paper.path([['M',TimeSlot*columnWidth,0],['L', TimeSlot*columnWidth,h]]).attr(TimeLineAttr)); 

          if (TimeSlot == 1) {
            var tempHour = (TimeSlot+parseInt(sunRiseSplit[0])-1)+"am";
          }
          else {
            var tempHour = (TimeSlot+parseInt(sunRiseSplit[0])-1);
          }
          // Draw Time
          timeGrid.push(alt_paper.text(TimeSlot*columnWidth-(columnWidth/2),timeTextSpace,tempHour).attr(fontAttr));
          // Draw Sun
          timeGrid.push(alt_paper.circle((TimeSlot*columnWidth)-(columnWidth/2), sunChartBottom - (parseInt(altitudeArray[TimeSlot-1])*window.altScale),columnWidth/2).attr({fill:"yellow",stroke:"yellow"}));
          // Draw Cloud
          timeGrid.push(alt_paper.rect((TimeSlot*columnWidth)-columnWidth+1, topForecastSpace, columnWidth-2, (temp16percent*2)*parseFloat(cloudCoverArray[TimeSlot-1]), 2).attr({fill:"grey",stroke:"grey"}));
          // Draw Rain
          timeGrid.push(alt_paper.rect((TimeSlot*columnWidth)-columnWidth+1, temp16percent*2+topForecastSpace, columnWidth-2, (temp16percent*2)*parseFloat(precipProbabilityArray[TimeSlot-1]), 4).attr({fill:"blue",stroke:"blue"}));
          // Draw Wind
          //timeGrid.push(alt_paper.path("M10,10 C20,15 30,5 40,10").attr({stroke:"white"}));
          var windDivX = columnWidth/3;
          //var WindDivY = (temp16percent*2) / (abs(windSpeedArray[TimeSlot-1]/10))
          
          var WindDivY = (temp16percent*2) / (Math.abs(parseFloat(windSpeedArray[TimeSlot-1])/10)+1)

          var i = Math.abs(parseFloat(windSpeedArray[TimeSlot-1])/10)
          var yChange = 1;
          if (parseFloat(windSpeedArray[TimeSlot-1]) > 9.9)
          {
            while (yChange<=i)
              {
                timeGrid.push(alt_paper.path([['M',(TimeSlot*columnWidth)-columnWidth+3,temp16percent*4+topForecastSpace+(WindDivY*yChange)],['C',(TimeSlot*columnWidth)-columnWidth+windDivX,temp16percent*4+topForecastSpace+(WindDivY*yChange)+5], [(TimeSlot*columnWidth)-columnWidth+windDivX*2,temp16percent*4+topForecastSpace+(WindDivY*yChange)-5], [(TimeSlot*columnWidth)-columnWidth+windDivX*3-3,temp16percent*4+topForecastSpace+(WindDivY*yChange)]]).attr({stroke:"white"}));
                yChange++;
              }
          }
          TimeSlot=TimeSlot+1;
        }
        
        // Draw labels: TIME , RAIN, WIND
        var textLabelsAttr = {font:'12px Verdana','font-size':11,'text-anchor':'left',fill:'white',stroke:"white"};
        timeGrid.push(alt_paper.text(w-columnWidth/2,timeTextSpace,"Time").attr(textLabelsAttr));
        timeGrid.push(alt_paper.text(w-columnWidth/2,temp16percent+topForecastSpace,"Cloud").attr(textLabelsAttr));
        timeGrid.push(alt_paper.text(w-columnWidth/2,temp16percent*3+topForecastSpace,"Rain").attr(textLabelsAttr));
        timeGrid.push(alt_paper.text(w-columnWidth/2,temp16percent*5+topForecastSpace,"Wind").attr(textLabelsAttr));

        // draw bottom border 'night' alt_paper.rect(x, y, width, height, [r])
        var nightFooterAttr = {"opacity":0.8,fill:"black",stroke:"black"};
        timeGrid.push(alt_paper.rect(0,sunChartBottom,w,h-sunChartBottom).attr(nightFooterAttr));
        
        // draw Degrees on right border
        // maxAltitude+"°"  works in test but not with prod?  temp removed
        timeGrid.push(alt_paper.text(w-20,sunChartBottom-maxAltitude*window.altScale,maxAltitude).attr(fontAttr));
        tempDegree = Math.round((maxAltitude-10)/10) * 10;
        while (tempDegree>=10){
          timeGrid.push(alt_paper.text(w-20,sunChartBottom-tempDegree*window.altScale,tempDegree).attr(fontAttr));
          tempDegree =tempDegree - 10;
        }
        timeGrid.push(alt_paper.text(w-20,sunChartBottom,"0").attr(fontAttr))

        
        // draw forcast.io cloud hourly data
        var forecastGrid = alt_paper.set();
        
        // draw cloud grid
        var forecastLineAttr = {fill:'grey',stroke:"white","stroke-width":1,"stroke-dasharray":"."};
        forecastGrid.push(alt_paper.path([['M',0,topForecastSpace],['L',w-columnWidth,topForecastSpace]]).attr(forecastLineAttr));
        forecastGrid.push(alt_paper.path([['M',0,((bottomForecastSpace-topForecastSpace)/3)+topForecastSpace],['L',w-columnWidth,((bottomForecastSpace-topForecastSpace)/3)+topForecastSpace]]).attr(forecastLineAttr));
        forecastGrid.push(alt_paper.path([['M',0,((bottomForecastSpace-topForecastSpace)/3)*2+topForecastSpace],['L',w-columnWidth,((bottomForecastSpace-topForecastSpace)/3)*2+topForecastSpace]]).attr(forecastLineAttr));
        forecastGrid.push(alt_paper.path([['M',0,bottomForecastSpace],['L',w-columnWidth,bottomForecastSpace]]).attr(forecastLineAttr));
        // Draw cloud grid text labels 100%, 50%, 0%...
        //var cloudFontAttr = {font:'12px Verdana','font-size':12,'text-anchor':'left',fill:'white',stroke:"white"};
        //timeGrid.push(alt_paper.text(w-columnWidth,topForecastSpace,"100%").attr(cloudFontAttr));
        //timeGrid.push(alt_paper.text(w-columnWidth,((bottomForecastSpace-topForecastSpace)/2)+topForecastSpace,"50%").attr(cloudFontAttr));
        //timeGrid.push(alt_paper.text(w-columnWidth,bottomForecastSpace,"0%").attr(cloudFontAttr));

      }
      else {  // refresh != 1 ... only refresh current time & alt overlay
        //alert (window.armsSunCompass);
        window.timeAltOverlay.remove();  
      }
      window.timeAltOverlay = alt_paper.set();
      //draw sun overlay
      columnTimeRatio = columnWidth/60;
      //console.log("altitudeForecast vars:"+currentTimeSplit[0]+" : "+ sunRiseSplit[0] +" : "+ columnWidth +" : "+ columnTimeRatio +" : "+ currentTimeSplit[1]);
      // 15 : 5 : 37.64705882352941 : 0.6274509803921569 : 15
      tempX = parseInt(((parseInt(currentTimeSplit[0])-parseInt(sunRiseSplit[0])+1)*columnWidth)-parseInt(columnTimeRatio*(60-currentTimeSplit[1])));
      //alert ('tempX: '+tempX);

      tempY = parseInt(h - (currentAlt * window.altScale) - columnWidth/2);
      //console.log("altitudeForecast vars tempX:"+tempX+" tempY:"+tempY+" window.altScale:"+window.altScale);

      tempRadius = columnWidth/2+4;
      var SunMarkerSunAttr = {"opacity":0.8,fill:"orange",stroke:"orange"};
      var SunMarkerLineAttr = {"opacity":0.8,fill:'orange',stroke:"orange","stroke-width":6,"stroke-dasharray":"-"};
      window.timeAltOverlay.push(alt_paper.circle(tempX, tempY, tempRadius).attr(SunMarkerSunAttr));
      //draw time line
      window.timeAltOverlay.push(alt_paper.path([['M',tempX,tempY],['L', tempX,h]]).attr(SunMarkerLineAttr));
      //draw alt line
      window.timeAltOverlay.push(alt_paper.path([['M',tempX,tempY],['L',w,tempY]]).attr(SunMarkerLineAttr));     
}