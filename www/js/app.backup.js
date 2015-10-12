// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.controller('TodoCtrl', function($scope, $ionicLoading, $compile) {
    $scope.tasks = [
        {title: 'Read the tasks'},
        {title: 'Get the book'},
        {title: 'Go to college'}
        ];
    
    var map;
    var mapOptions;
    var directionsDisplay = new google.maps.DirectionsRenderer({ draggable: true });
    var directionsService = new google.maps.DirecionsService();
    
    $scope.initialize = function() {
        var pos = new google.maps.LatLng(38, -90);
        var mapOptions = {
            zoom: 4,
            center: pos,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    };
    
    $scope.calcRoute = function() {
        var end = document.getElementById('endLoc').value;
        var start = document.getElementById('startLoc').value;
        
        var request = {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.DRIVING
        };
        
        directionsService.route(request, function(response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsDisplay.setMap(map);
                directionsDisplay.setDirections(response);
                console.log(status);
            }
        });
    };
    
    google.maps.event.addDomListener(window, 'load', $scope.initialize);
});