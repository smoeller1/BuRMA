// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('mapper', ['ionic', 'ngCordova'])

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

.controller('TodoCtrl', function($scope, $cordovaGeolocation, $ionicPlatform, $ionicLoading, $compile) {
    console.log("TodoCtrl: Entered controller");
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var map;
    var mapOptions;
    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    
    $scope.initialize = function() {
        console.log("TodoCtrl: initialize: Entered initialize function");
        
        var lat;
        var long;
        var end = new google.maps.LatLng(0, 0);
      
        $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
            console.log("TodoCtrl: initialize: Entered getCurrentPosition within initialize");
            lat = position.coords.latitude
            long = position.coords.longitude
            console.log("TodoCtrl: initialize: Location determined to be " + lat + ", " + long);
            var site = new google.maps.LatLng(lat, long);
            console.log("TodoCtrl: initialize: getCurrentPosition: " + site.lat() + ", " + site.lng());
            if (localStorage.getItem("address") == 'undefined') {
                $scope.startLoc = site.lat() + ", " + site.lng();
            } else {
                //$scope.startLoc = localStorage.getItem("address") + ", " + localStorage.getItem("city") + ", " + localStorage.getItem("state") + ", " + localStorage.getItem("country");;
                $scope.startLoc = localStorage.getItem("address");
            }
            mapOptions = {
                streetViewControl:true,
                center: site,
                zoom: 12,
                mapTypeId: google.maps.MapTypeId.TERRAIN
            };
            console.log("TodoCtrl: initialize: creating new google maps Map centered at: " + $scope.startLoc);
            map = new google.maps.Map(document.getElementById("map"),
                mapOptions); 

            $scope.map = map;
            var request = $scope.setRequest(site, end); 
            console.log("TodoCtrl: initialize: creating directions service route");
            directionsService.route(request, function(response, status) {
                console.log("TodoCtrl: initialize: directionsService.route: " + status);
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);
                }
            });
            console.log("TodoCtrl: initialize: Running directionsDisplay.setMap");
            directionsDisplay.setMap(map);
        }, function(err) {
            console.log("TodoCtrl: initialize: Entered error function of getCurrentPosition of initialize");
            $scope.routingError = "Unable to get current location";
            lat = 0;
            long = 0;
        }); 
        console.log("TodoCtrl: initialize: Finished getCurrentPosition in initialize");
        console.log("TodoCtrl: initialize: Finished initialize function");
        
       
      }; //initialize
  
    console.log("TodoCtrl: continuing after initialize");
      google.maps.event.addDomListener(window, 'load', $scope.initialize);

    
    $scope.centerOnMe = function() {
        console.log("TodoCtrl: centerOnMe: Entered function");
        if(!$scope.map) {
          return;
        }

        $scope.loading = $ionicLoading.show({
          content: 'Getting current location...',
          showBackdrop: false
        });
        navigator.geolocation.getCurrentPosition(function(pos) {
          $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
          $scope.loading.hide();
        }, function(error) {
          alert('Unable to get location: ' + error.message);
        });
      };
      
      $scope.clickTest = function() {
        alert('Example of infowindow with ng-click')
      };
    
    $scope.calcRoute = function(start, end) {
        console.log("TodoCtrl: calcRoute: Entered function with: " + start + ", " + end);
        var request = $scope.setRequest(start, end);
        
        directionsService.route(request, function(response, status) {
            console.log("TodoCtrl: calcRoute: directionsService.route response: " + status);
            if (status === google.maps.DirectionsStatus.OK) {
                directionsDisplay.setMap(map);
                directionsDisplay.setDirections(response);
                console.log(status);
            } else {
                return false;
            }
        });
        return true;
    };
    
    $scope.setRequest = function(start, end) {
        console.log("TodoCtrl: setRequest: Entered function");
        var request = {
            origin: start,
            destination: end,
            travelMode : google.maps.TravelMode.DRIVING
        };
        return request;
    };
    
});