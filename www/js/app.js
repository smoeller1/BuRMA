// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova'])

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
    
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var map;
    var mapOptions;
    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    
    $scope.initialize = function() {
        console.log("initialize: Entered initialize function");
        
        var lat;
        var long;
        var end = new google.maps.LatLng(0, 0);
      
        $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
            console.log("initialize: Entered getCurrentPosition within initialize");
            lat = position.coords.latitude
            long = position.coords.longitude
            console.log("initialize: Location determined to be " + lat + ", " + long);
            var site = new google.maps.LatLng(lat, long);
            $scope.routeingError = site.lat() + ", " + site.lng();
            var userHome = localStorage.getItem("address");
            if (userHome == null) {
                $scope.startLoc = site.lat() + ", " + site.lng();
            } else {
                $scope.startLoc = userHome;
            }
            mapOptions = {
                streetViewControl:true,
                center: site,
                zoom: 12,
                mapTypeId: google.maps.MapTypeId.TERRAIN
            };
            console.log("initialize: creating new google maps Map");
            map = new google.maps.Map(document.getElementById("map"),
                mapOptions); 

            $scope.map = map;
            var request = $scope.setRequest(site, end); 
            console.log("initialize: creating directions service route");
            directionsService.route(request, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);
                }
            });
            directionsDisplay.setMap(map);
        }, function(err) {
            console.log("Einitialize: ntered error function of getCurrentPosition of initialize");
            $scope.routingError = "Unable to get current location";
            lat = 0;
            long = 0;
        }); 
        console.log("initialize: Finished getCurrentPosition in initialize");
        console.log("initialize: Finished initialize function");
        
       
      }; //initialize
  
      google.maps.event.addDomListener(window, 'load', $scope.initialize);

    
    $scope.centerOnMe = function() {
        console.log("Entered centerOnMe function");
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
        console.log("Entered calcRoute function");
        var request = $scope.setRequest(start, end);
        
        directionsService.route(request, function(response, status) {
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
        console.log("Entered setRequest function");
        var request = {
            origin: start,
            destination: end,
            travelMode : google.maps.TravelMode.DRIVING
        };
        return request;
    };
    
})

.controller('RegisterCtrl', function($scope, $ionicPlatform, $ionicLoading, $compile, $http, $window) {
    //api key : txrusPCK4DZrtU0mq2_bsKgxb2FgvGyP
    // https://api.mongolab.com/api/1/database/quasily/collections/CS5551?apiKey=txrusPCK4DZrtU0mq2_bsKgxb2FgvGyP
    console.log("RegisterCtrl: Started controller");
    
    $scope.removeUser = function(uname, pword) {
        console.log("RegisterCtrl: removeUser: Entered with: " + uname + ", " + pword);
        $http({
            method: 'GET',
            url : 'https://api.mongolab.com/api/1/databases/quasily/collections/CS5551?q={"name":"'+uname+'"}&f={"password":1,"_id":1}&fo=true&apiKey=txrusPCK4DZrtU0mq2_bsKgxb2FgvGyP'
        })
        .success(function(data) {
            console.log("RegisterCtrl: removeUser: Found "+data.password+", "+data._id.$oid);
            if (data.password == pword) {
                $http({
                    method: 'DELETE',
                    url: 'https://api.mongolab.com/api/1/databases/quasily/collections/'+data._id.$oid+'?apiKey=txrusPCK4DZrtU0mq2_bsKgxb2FgvGyP',
                    async: true
                })
                .success(function() {
                    $scope.displayRMsg = "User "+uname+" has been removed";
                })
                .error(function() {
                    alert("Failed to remove user");
                });
            } else {
                alert("Invalid password");
            }
        })
        .error(function() {
            alert('Failed to find user '+uname);
        });
        console.log("RegisterCtrl: removeUser: Finished");
    };
    
    $scope.loginUser = function(uname, pword) {
        console.log("RegisterCtrl: loginUser: Entered with: " + uname + ", " + pword);
        $http({
            method: 'GET',
            url : 'https://api.mongolab.com/api/1/databases/quasily/collections/CS5551?q={"name":"'+uname+'"}&f={"password":1,"address":1}&fo=true&apiKey=txrusPCK4DZrtU0mq2_bsKgxb2FgvGyP'
        })
        .success(function(data) {
            if (data.password == pword) {
                localStorage.setItem("address" : address);
                $window.location.href = "/map.html";
            } else {
                alert("Invalid password");
            }
        })
        .error(function() {
            alert('Failed to authenticate user '+uname);
        });
        console.log("RegisterCtrl: loginUser: Finished");
    };
    
    $scope.changeEmail = function(uname, pword, newemail) {
        console.log("RegisterCtrl: changeEmail: Entered with: " + uname + ", " + pword + ", " + newemail);
        $http({
            method: 'GET',
            url: 'https://api.mongolab.com/api/1/databases/quasily/collections/CS5551?q={"name":"'+uname+'"}&f={"_id":1}&fo=true&apiKey=txrusPCK4DZrtU0mq2_bsKgxb2FgvGyP'
        })
        .success(function(dat) {
            console.log("RegisterCtrl: changeEmail: found user");
                $http({
                    method: 'PUT',
                    url: 'https://api.mongolab.com/api/1/databases/quasily/collections/CS5551?q={"name":"'+uname+'"}&apiKey=txrusPCK4DZrtU0mq2_bsKgxb2FgvGyP',
                    data: JSON.stringify({ "$set" : { "email": newemail } }),
                    contentType: 'Application/json'
                })
                .success(function() {
                    $scope.displayEMsg = "Email changed";
                })
                .error(function() {
                    alert('Failed to update email');
                });
        })
        .error(function() {
            alert('Failed to find existing info for ' + uname);
        });
        console.log("RegisterCtrl: changeEmail: Finished");
    };
    
    $scope.changePword = function(uname, oldpass, newpass, newpass2) {
        console.log("RegisterCtrl: changePword: Entered with: " + uname + ", " + oldpass + ", " + newpass + ", " + newpass2);
        if (newpass != newpass2) {
            alert('New passwords do not match');
            return;
        }
        $http({
            method: 'GET',
            url: 'https://api.mongolab.com/api/1/databases/quasily/collections/CS5551?q={"name":"'+uname+'"}&f={"password":1}&fo=true&apiKey=txrusPCK4DZrtU0mq2_bsKgxb2FgvGyP'
        })
        .success(function(dat) {
            if (dat.password == oldpass) {
                $http({
                    method: 'PUT',
                    url: 'https://api.mongolab.com/api/1/databases/quasily/collections/CS5551?q={"name":"'+uname+'"}&apiKey=txrusPCK4DZrtU0mq2_bsKgxb2FgvGyP',
                    data: JSON.stringify({ "$set" : { "password": newpass } }),
                    contentType: 'Application/json'
                })
                .success(function() {
                    $scope.displayMsg = "Password changed";
                })
                .error(function() {
                    alert('Failed to update password');
                });
                        
            } else {
                alert('Old password is invalid');
            }
        })
        .error(function() {
            alert('Failed to authenticate existing info for ' + uname);
        });
        console.log("RegisterCtrl: changePword: Finished");
    };
    
    $scope.registerUser = function(uname, pword, pword2, email, address) {
        console.log("RegisterCtrl: registerUser: Entered with: " + uname + ", " + pword + ", " + pword2 + ", " + email + ", " + address);
        if (pword != pword2) {
            alert("RegisterCtrl: registerUser: Passwords do not match");
            return;
        };
        
        $http({
            method: 'POST',
            url : 'https://api.mongolab.com/api/1/databases/quasily/collections/CS5551?apiKey=txrusPCK4DZrtU0mq2_bsKgxb2FgvGyP',
            data: JSON.stringify({
                name : uname,
                password : pword,
                email : email,
                address : address
            }),
            contentType : 'Application/json'
        })
        .success(function() {
            localStorage.setItem("address" : address);
            console.log("RegisterCtrl: registerUser: User is registered");
            $window.location.href = "/map.html";
        })
        .error(function() {
            alert("RegisterCtrl: registerUser: Failed to register user");
        });
        console.log("RegisterCtrl: registerUser: Finished");
    };
    
    console.log("RegisterCtrl: End of controller");
});