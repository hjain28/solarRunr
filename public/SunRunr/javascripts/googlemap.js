
$(function(){ 
      function initMap() {
          var myLatLng = {lat: -33.950198, lng: 151.259302};
          var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 16,
          center: myLatLng
        });
  
        var count;
 
    for (count = 0; count < locations.length; count++) {  
      new google.maps.Marker({
        position: new google.maps.LatLng(locations[count][1], locations[count][2]),
        map: map,
        title: locations[count][0]
        });
     }
 });   
