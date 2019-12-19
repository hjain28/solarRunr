
$(function () {
   
        var chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        theme: "light2",
        title:{
        text: "Simple Line Chart"
        },
        axisY:{
         includeZero: true
      },
        data: [{        
            type: "line",       
            dataPoints: [{x:2, y:4},{x:45, y:87}]
          }]
   });
   chart.render();
  });


