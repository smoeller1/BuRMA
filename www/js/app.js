// Ionic Starter App

var services = angular.module("mongoapp.services", []);
//var url = "http://localhost:9080/MongoRestApp/user";
var url = "http://mongorestapp.mybluemix.net/user";


//Factory use
services.factory('MongoRESTService', function($http) {
    return {
        login: function(username, password, callback) {
            console.log("MongoRESTService: login: started");
            var res = $http.get(url+"?requesttype=1&username="+username+"&password="+password);
            res.success(function(data, status, headers, config) {
                console.log("MongoRESTService: login: Success: " + data);
                callback(data);
            });
            res.error(function(data, status, headers, config) {
                console.log("MongoRESTService: login: Error: " + data);
            });
        }, // end login
        register: function(username, password, password2, email, address, city, state, country, callback) {
            console.log("MongoRESTService: register: started");
            var res = $http({
                method: 'POST',
                url : url + "?requesttype=2&username="+username+"&password="+password,
                data: JSON.stringify({
                    password2: password,
                    email: email,
                    address: {
                        streetaddress: address,
                        city: city,
                        state: state,
                        country: country
                    }
                }) /*,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST",
                    "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
                    "Access-Control-Max-Age": "86400"
                } */
            });
            res.success(function(data, status, headers, config) {
                console.log("MongoRESTService: register: Success: "+data);
                callback(data);
            });
            res.error(function(data, status, headers, config) {
                console.log("MongoRESTService: register: Error: "+data);
            });
        }, //end register
        changePassword: function(username, password, newpassword, callback) {
            console.log("MongoRESTService: changePassword: started");
            var res = $http({
                method: 'POST',
                url : url + "?requesttype=3&username="+username+"&password="+password,
                data: JSON.stringify({
                    newpassword: newpassword
                }),
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST",
                    "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
                    "Access-Control-Max-Age": "86400"
                }
            });
            res.success(function(data, status, headers, config) {
                console.log("MongoRESTService: changePassword: Success: "+data);
                callback(data);
            });
            res.error(function(data, status, headers, config) {
                console.log("MongoRESTService: changePassword: Error: "+data);
            });
        }, //end changePassword
        deleteAccount: function(username, password, callback) {
            console.log("MongoRESTService: deleteAccount: started");
            var res = $http.get(url+"?requesttype=4&username="+username+"&password="+password);
            res.success(function(data, status, headers, config) {
                console.log("MongoRESTService: deleteAccount: Success: " + data);
                callback(data);
            });
            res.error(function(data, status, headers, config) {
                console.log("MongoRESTService: deleteAccount: Error: " + data);
            });
        } //end deleteAccount
    }
});

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova', 'mongoapp.services'])

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

.controller('TodoCtrl', function($scope, $cordovaGeolocation, $ionicPlatform, $ionicLoading, $compile, $http) {
    
    
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var map;
    var mapOptions;
    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    
    $scope.initialize = function() {
        Log.log(5, "TodoCtrl: initialize: Entered initialize function");
        
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
                $scope.startLoc = localStorage.getItem("address") + ", " + localStorage.getItem("city") + ", " + localStorage.getItem("state") + ", " + localStorage.getItem("country");;
            }
            mapOptions = {
                streetViewControl:true,
                center: site,
                zoom: 12,
                mapTypeId: google.maps.MapTypeId.TERRAIN
            };
            console.log("TodoCtrl: initialize: creating new google maps Map");
            map = new google.maps.Map(document.getElementById("map"),
                mapOptions); 

            $scope.map = map;
            var request = $scope.setRequest(site, end); 
            console.log("TodoCtrl: initialize: creating directions service route");
            directionsService.route(request, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);
                }
            });
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
  
      google.maps.event.addDomListener(window, 'load', $scope.initialize);

    $scope.getWeather = function(city, state) {
        console.log("TodoCtrl: getWeather: started with " + city + ", " + state);
        $http.get('http://api.wunderground.com/api/36b799dc821d5836/conditions/q/' + state + '/' + city + '.json')
        .success(function(data) {
            console.log("TodoCtrl: getWeather: temp is " + data.current_observation.temp_c);
            $scope.sourceTemp = city + ", " + state + " is " + data.current_observation.temp_c + "C";
        })
        .error(function() {
            console.log("TodoCtrl: getWeather: error with $http.get");
        });
        console.log("TodoCtrl: getWeather: finished");
    };
    
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
        console.log("TodoCtrl: calcRoute: Entered function");
        var request = $scope.setRequest(start, end);
        
        directionsService.route(request, function(response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsDisplay.setMap(map);
                directionsDisplay.setDirections(response);
                console.log(status);
                $scope.getWeather(localStorage.getItem("city"), localStorage.getItem("state"));
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
    
})

.controller('RegisterCtrl', function($scope, $ionicPlatform, $ionicLoading, MongoRESTService, $compile, $http, $window) {
    //api key : txrusPCK4DZrtU0mq2_bsKgxb2FgvGyP
    // https://api.mongolab.com/api/1/database/quasily/collections/CS5551?apiKey=txrusPCK4DZrtU0mq2_bsKgxb2FgvGyP
    
    //Singleton log function
    var Log = (function() {
        var instance;
        function init() {
            function privateMethodOne(){
                console.log("privateMethodOne");
            }
            var currentLogLvl = 6;  //Log level: 7 is highest, 1 is lowest, 5 is default
            return {
                log: function(loglvl, message){
                    if (loglvl <= currentLogLvl) {
                        console.log(loglvl+": "+message);
                    }
                },
                publicVariableOne : "Public"
            };
        };
        return {
            getInstance: function() {
                if (!instance) {
                    instance = init();
                }
                return instance;
            }
        };
    })();
    
    
    var Log = new Log.getInstance();
    Log.log(6, "RegisterCtrl: Started controller");
    
    $scope.removeUser = function(uname, pword) {
        Log.log(6, "RegisterCtrl: removeUser: Entered with: " + uname + ", " + pword);
        var result = MongoRESTService.deleteAccount(uname, pword, function(result) {
            Log.log(6, "RegisterCtrl: removeUser: Results: "+result);
            if (angular.fromJson(result).status == 'SUCCESS') {
                Log.log(5, "RegisterCtrl: removeUser: Account deleted");
                $window.location.href = "/index.html";
            } else {
                Log.log(3, "RegisterCtrl: removeUser: Failed");
                alert("Account delete failed");
            }
        });
        Log.log(6, "RegisterCtrl: removeUser: Finished");
    };
    
    $scope.loginUser = function(uname, pword) {
        Log.log(6, "RegisterCtrl: loginUser: Entered with: " + uname + ", " + pword);
        var result = MongoRESTService.login(uname, pword, function(result) {
            Log.log(6, "RegisterCtrl: loginUser: Results: "+result);
            if (angular.fromJson(result).status == 'SUCCESS') {
                Log.log(5, "RegisterCtrl: loginUser: Login success");
                localStorage.setItem("email", angular.fromJson(result).email);
                localStorage.setItem("username", uname);
                $window.location.href = "/map.html";
            } else {
                Log.log(3, "RegisterCtrl: loginUser: Failed login");
                alert("Login failed");
            }
        });
        Log.log(6, "RegisterCtrl: loginUser: Finished");
    };
    
    $scope.changeEmail = function(uname, pword, newemail) {
        Log.log(6, "RegisterCtrl: changeEmail: Entered with: " + uname + ", " + pword + ", " + newemail);
        $http({
            method: 'GET',
            url: 'https://api.mongolab.com/api/1/databases/quasily/collections/burmaUsers?q={"name":"'+uname+'"}&f={"_id":1}&fo=true&apiKey=txrusPCK4DZrtU0mq2_bsKgxb2FgvGyP'
        })
        .success(function(dat) {
            Log.log(5, "RegisterCtrl: changeEmail: found user");
                $http({
                    method: 'PUT',
                    url: 'https://api.mongolab.com/api/1/databases/quasily/collections/burmaUsers?q={"name":"'+uname+'"}&apiKey=txrusPCK4DZrtU0mq2_bsKgxb2FgvGyP',
                    data: JSON.stringify({ "$set" : { "email": newemail } }),
                    contentType: 'Application/json'
                })
                .success(function() {
                    $scope.displayEMsg = "Email changed";
                    Log.log(5, "Email changed");
                })
                .error(function() {
                    Log.log(3, "Failed to update email");
                    alert('Failed to update email');
                });
        })
        .error(function() {
            Log.log(3, "Failed to find user");
            alert('Failed to find existing info for ' + uname);
        });
        Log.log(6, "RegisterCtrl: changeEmail: Finished");
    };
    
    $scope.changePword = function(uname, oldpass, newpass, newpass2) {
        Log.log(6, "RegisterCtrl: changePword: Entered with: " + uname + ", " + oldpass + ", " + newpass + ", " + newpass2);
        if (newpass != newpass2) {
            Log.log(3, "Passwords dont match");
            alert('New passwords do not match');
            return;
        }
        
        var result = MongoRESTService.changePassword(uname, oldpass, newpass, function(result) {
            Log.log(6, "RegisterCtrl: changePword: Results: "+result);
            if (angular.fromJson(result).status == 'SUCCESS') {
                Log.log(5, "RegisterCtrl: changePword: Password changed");
                $window.location.href = "/map.html";
            } else {
                Log.log(3, "RegisterCtrl: changePword: Failed to change");
                alert("Password change failed");
            }
        });
        Log.log(6, "RegisterCtrl: changePword: Finished");
    };
    
    $scope.registerUser = function(uname, pword, pword2, email, address, city, state, country) {
        Log.log(6, "RegisterCtrl: registerUser: Entered with: " + uname + ", " + pword + ", " + pword2 + ", " + email + ", " + address + ", " + city + ", " + state + ", " + country);
        
        if (uname == null) {
            alert("Username is required");
            return;
        }
        
        if (pword == null) {
            alert("Password is required");
            return;
        }
        
        if (pword != pword2) {
            alert("RegisterCtrl: registerUser: Passwords do not match");
            return;
        };
        
        var result = MongoRESTService.register(uname, pword, pword2, email, address, city, state, country, function(result) {
            Log.log(6, "RegisterCtrl: registerUser: Results: "+result);
            if (angular.fromJson(result).status == 'SUCCESS') {
                Log.log(5, "RegisterCtrl: registerUser: Login success");
                var aUser = new endUser();
                //augment(endUser, Mixin);
                aUser.setLocalStorage(email, uname, address, city, state, country);
                $window.location.href = "/map.html";
            } else {
                Log.log(3, "RegisterCtrl: registerUser: Failed login");
                alert("Login failed");
            }
        });
        Log.log(6, "RegisterCtrl: registerUser: Finished");
    };
    
    function endUser(){
        Log.log(6, "RegisterCtrl: endUser: started");
    };
    //augment(endUser, Mixin);
    
    Log.log(6, "RegisterCtrl: End of controller");
});


//Mixin use
var Mixin = function() {}
Mixin.prototype = {
    setLocalStorage: function(email, uname, address, city, state, country){
        console.log("Mixin: setLocalStorage");
                localStorage.setItem("email", email);
                localStorage.setItem("username", uname);
                localStorage.setItem("address", address);
                localStorage.setItem("city", city);
                localStorage.setItem("state", state);
                localStorage.setItem("country", country);
    },
    getLocation: function(){
        console.log("Mixin: getLocation");
    }
};

