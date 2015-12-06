// Ionic Starter App

var services = angular.module("mongoapp.services", []);
var url = "http://mongorestapp.mybluemix.net/user";

//Factory use
services.factory('MongoRESTService', function($http) {
    return {
        login: function(username, password, callback) {
            console.log("MongoRESTService: login: started");
            var res = $http({
                url: url,
                method: 'POST',
                data: JSON.stringify({
                    RequestType: 2,
                    Password: password,
                    Username: username
                })
            });
            res.success(function(data, status, headers, config) {
                console.log("MongoRESTService: login: Success: " + data.StatusReason);
                callback(data);
            });
            res.error(function(data, status, headers, config) {
                console.log("MongoRESTService: login: Error: " + data.StatusReason);
            });
        }, // end login
        register: function(username, password, fname, lname, email, mobilenum, address, city, state, country, language, routepref, callback) {
            console.log("MongoRESTService: register: started");
            var res = $http({
                method: 'POST',
                url : url,
                data: JSON.stringify({
                    Password: password,
                    Username: username,
                    FirstName: fname,
                    LastName: lname,
                    EmailAddress: email,
                    MobileNumber: mobilenum,
                    RequestType: 1,
                    HomeAddress: {
                        StreetAddress: address,
                        City: city,
                        State: state,
                        Country: country
                    },
                    Language: language,
                    RoutePref: routepref
                })
            });
            res.success(function(data, status, headers, config) {
                console.log("MongoRESTService: register: Success: "+data.toString());
                callback(data);
            });
            res.error(function(data, status, headers, config) {
                console.log("MongoRESTService: register: Error: "+data);
            });
        }, //end register
        updateAccount: function(username, password, newpassword, fname, lname, email, mobilenum, address, city, state, country, language, routepref, callback) {
            //TODO change any calling functions that use this
            console.log("MongoRESTService: changePassword: started");
            var res = $http({
                method: 'POST',
                url : url,
                data: JSON.stringify({
                    Password: password,
                    Username: username,
                    NewPassword: newpassword,
                    FirstName: fname,
                    LastName: lname,
                    EmailAddress: email,
                    MobileNumber: mobilenum,
                    RequestType: 3,
                    HomeAddress: {
                        StreetAddress: address,
                        City: city,
                        State: state,
                        Country: country
                    },
                    Language: language,
                    RoutePref: routepref
                })
            });
            res.success(function(data, status, headers, config) {
                console.log("MongoRESTService: updateAccount: Success: "+data);
                callback(data);
            });
            res.error(function(data, status, headers, config) {
                console.log("MongoRESTService: updateAccount: Error: "+data);
            });
        }, //end updateAccount
        deleteAccount: function(username, password, callback) {
            console.log("MongoRESTService: deleteAccount: started");
            var res = $http({
                url: url,
                method: 'POST',
                data: JSON.stringify({
                    RequestType: 4,
                    Password: password,
                    Username: username
                })
            });
            res.success(function(data, status, headers, config) {
                console.log("MongoRESTService: deleteAccount: Success: " + data);
                callback(data);
            });
            res.error(function(data, status, headers, config) {
                console.log("MongoRESTService: deleteAccount: Error: " + data);
            });
        }, //end deleteAccount
        getDirections: function(startAddress, endAddress, waypoint, routepref, callback) {
            console.log("MongoRESTService: getDirections: started");
            var res = $http({
                url: url,
                method: 'POST',
                data: JSON.stringify({
                    RequestType: 10,
                    RouteStartAddress: startAddress,
                    RouteEndAddress: endAddress,
                    WaypointAddress: waypoint,
                    RoutePref: routepref
                })
            });
            res.success(function(data, status, headers, config) {
                console.log("MongoRESTService: getDirections: Success: " + data.Status + ": " + data.StatusReason);
                callback(data);
            });
            res.error(function(data, status, headers, config) {
                console.log("MongoRESTService: getDirections: Error: "+ data.Status + ": " + data.StatusReason);
            });
        }, //end getDirections
        translate: function(targetLanguage, text, callback) {
            console.log("MongoRESTService: translate: started from en to " + targetLanguage);
            if (targetLanguage == 'null') {
                targetLanguage = 'en';
                console.log("MongoRESTService: translate: language null, setting to en");
            }
            var res = $http({
                url: url,
                method: 'POST',
                data: JSON.stringify({
                    RequestType: 15,
                    Translate: {
                        SrcLang: 'en',
                        TargLang: targetLanguage,
                        SrcTxt: text
                    }
                })
            });
            res.success(function(data, status, headers, config) {
                console.log("MongoRESTService: translate: Success: " + data.Status + ": " + data.StatusReason);
                callback(data);
            });
            res.error(function(data, status, headers, config) {
                console.log("MongoRESTService: translate: Error: " + data.Status + ": " + data.StatusReason);
            });
        } //end translate
    }
});  //end MongoRESTService

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

.controller('TodoCtrl', function($scope, $cordovaGeolocation, $ionicPlatform, $ionicLoading, $compile, $http, MongoRESTService) {
    
    $scope.Math = window.Math;
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var map;
    var mapOptions;
    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    
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
    
    $scope.initialize = function() {
        Log.log(5, "TodoCtrl: initialize: Entered initialize function");
        
        var lat;
        var long;
        var end = new google.maps.LatLng(0, 0);
        
        if (localStorage.getItem("language") != 'undefined') {
            var result = MongoRESTService.translate(localStorage.getItem("language"), 'Start', function(result) {
                console.log("TodoCtrl: initialize: Translated Start to " + result.TranslatedTxt);
                $scope.startLocalized = result.TranslatedTxt;
            });
            result = MongoRESTService.translate(localStorage.getItem("language"), 'End', function(result) {
                console.log("TodoCtrl: initialize: Translated End to " + result.TranslatedTxt);
                $scope.endLocalized = result.TranslatedTxt;
            });
            result = MongoRESTService.translate(localStorage.getItem("language"), 'Go', function(result) {
                console.log("TodoCtrl: initialize: Translated Go to " + result.TranslatedTxt);
                $scope.goLocalized = result.TranslatedTxt;
            });
            result = MongoRESTService.translate(localStorage.getItem("language"), 'Waypoint', function(result) {
                console.log("TodoCtrl: initialize: Tranlated Waypoint to " + result.TranslatedTxt);
                $scope.waypointLocalized = result.TranslatedTxt;
        } else {
            $scope.startLocalized = "Start";
            $scope.endLocalized = "End";
            $scope.goLocalized = "Go";
            $sope.waypointLocalized = "Waypoint";
        }
      
        $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
            Log.log(5, "TodoCtrl: initialize: Entered getCurrentPosition within initialize");
            lat = position.coords.latitude
            long = position.coords.longitude
            Log.log(5, "TodoCtrl: initialize: Location determined to be " + lat + ", " + long);
            var site = new google.maps.LatLng(lat, long);
            Log.log(5, "TodoCtrl: initialize: getCurrentPosition: " + site.lat() + ", " + site.lng());
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
        var result = MongoRESTService.getDirections(start, end, null, function(result) {
            //The result object is a JSON object of Google Maps directions directives
            console.log("TodoCtrl: calcRoute: Received results (" + result.Status + "), totalTime: "+result.TotalTime);
            console.log("TodoCtrl: calcRoute: JSON Object: "+result.Status+", "+result.StatusReason);
            $scope.weather = result.WeatherInfo;
            if (localStorage.getItem("language") == 'en'
               || localStorage.getItem("language") == 'undefined') {
                $scope.startWeather = "Current weather: " + result.WeatherInfo[0].temp_f + "F and " + result.WeatherInfo[0].icon;
                $scope.endWeather = "Current weather: " + result.WeatherInfo[2].temp_f + "F and " + result.WeatherInfo[2].icon;
            } else {
                var result = MongoRESTService.translate(localStorage.getItem("language"), "Current weather: " + result.WeatherInfo[0].temp_c + "C and " + result.WeatherInfo[0].icon, function(result) {
                    console.log("TodoCtrl: initialize: Translated Start to " + result.TranslatedTxt);
                    $scope.startWeather = result.TranslatedTxt;
                });
                result = MongoRESTService.translate(localStorage.getItem("language"), "Current weather: " + result.WeatherInfo[2].temp_c + "C and " + result.WeatherInfo[2].icon, function(result) {
                    console.log("TodoCtrl: initialize: Translated Start to " + result.TranslatedTxt);
                    $scope.endWeather = result.TranslatedTxt;
                });
            }
        });
        var request = $scope.setRequest(start, end);
        
        directionsService.route(request, function(response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsDisplay.setMap(map);
                directionsDisplay.setDirections(response);
                console.log("TodoCtrl: calcRoute: directionService.route: "+status);
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
    
    $scope.initializeModAccount = function() {
        Log.log(6, "RegisterCtrl: initialize: Started");
        if (localStorage.getItem("username") != 'undefined') {
            $scope.Username = localStorage.getItem("username");
        }
        if (localStorage.getItem("email") != 'undefined') {
            $scope.UserMailCom = localStorage.getItem("email");
        }
        if (localStorage.getItem("address") != 'undefined') {
            $scope.MyStreet = localStorage.getItem("address");
        }
        if (localStorage.getItem("city") != 'undefined') {
            $scope.AnyTown = localStorage.getItem("city");
        }
        if (localStorage.getItem("state") != 'undefined') {
            $scope.StateMO = localStorage.getItem("state");
        }
        if (localStorage.getItem("country") != 'undefined') {
            $scope.UnitedStates = localStorage.getItem("country");
        }
        if (localStorage.getItem("firstname") != 'undefined') {
            $scope.FirstName = localStorage.getItem("firstname");
        }
        if (localStorage.getItem("lastname") != 'undefined') {
            $scope.LastName = localStorage.getItem("lastname");
        }
        if (localStorage.getItem("mobilenum") != 'undefined') {
            $scope.MobileNumber = localStorage.getItem("mobilenum");
        }
        Log.log(6, "RegisterCtrl: Initialize: End");
    };  //initialize
    
    $scope.removeUser = function(uname, pword) {
        Log.log(6, "RegisterCtrl: removeUser: Entered with: " + uname + ", " + pword);
        var result = MongoRESTService.deleteAccount(uname, pword, function(result) {
            Log.log(6, "RegisterCtrl: removeUser: Results: "+result.Status+": "+result.StatusReason);
            if (result.Status == '1') {
                Log.log(5, "RegisterCtrl: removeUser: Account deleted");
                $window.location.href = "/index.html";
            } else {
                Log.log(3, "RegisterCtrl: removeUser: Failed");
                alert("Account delete failed");
            }
        });
        Log.log(6, "RegisterCtrl: removeUser: Finished");
    }; //removeUser
    
    $scope.loginUser = function(uname, pword) {
        Log.log(6, "RegisterCtrl: loginUser: Entered with: " + uname + ", " + pword);
        var result = MongoRESTService.login(uname, pword, function(result) {
            Log.log(6, "RegisterCtrl: loginUser: Results: "+result.Status+": "+result.StatusReason);
            if (result.Status == '1') {
                Log.log(5, "RegisterCtrl: loginUser: Login success");
                var aUser = new endUser();
                augment(endUser, Mixin);
                aUser.setLocalStorage(result.EmailAddress, uname, result.HomeAddress.StreetAddress, result.HomeAddress.City, result.HomeAddress.State, result.HomeAddress.Country);
                $window.location.href = "/map.html";
            } else {
                Log.log(3, "RegisterCtrl: loginUser: Failed login");
                alert("Login failed");
            }
        });
        Log.log(6, "RegisterCtrl: loginUser: Finished");
    }; //loginUser
    
    $scope.ModifyAccount = function(uname, oldpass, newpass, newpass2, fname, lname, email, mobilenum, address, city, state, country, language, routepref) {
        Log.log(6, "RegisterCtrl: ModifyAccount: started");
        
        var result = MongoRESTService.updateAccount(uname, oldpass, fname, lname, email, mobilenum, address, city, state, country, language, routepref, function(result) {
            Log.log(6, "RegisterCtrl: ModifyAccount: updated account");
        });
        
        if (newpass != null) {
            //Assume the user is wanting to change their password since they entered a new one
            changePword(uname, oldpass, newpass, newpass2);
        }
        
        var aUser = new endUser();
        augment(endUser, Mixin);
        aUser.setLocalStorage(email, uname, address, city, state, country, language, routepref, fname, lname, mobilenum);
        $window.location.href = "/map.html";
    }; //ModifyAccount
    
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
    }; //changePword
    
    $scope.registerUser = function(uname, pword, pword2, fname, lname, email, mobilenum, address, city, state, country, language, routepref) {
        Log.log(6, "RegisterCtrl: registerUser: Entered with: " + uname + ", " + pword + ", " + pword2 + ", " + email + ", " + address + ", " + city + ", " + state + ", " + country + "; " + language + ", " + routepref);
        
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
        var result = MongoRESTService.register(uname, pword, fname, lname, email, mobilenum, address, city, state, country, language, routepref, function(result) {
            Log.log(6, "RegisterCtrl: registerUser: Results: "+result.Status+": "+result.StatusReason);
            if (result.Status == '1') {
                Log.log(5, "RegisterCtrl: registerUser: Login success");
                var aUser = new endUser();
                augment(endUser, Mixin);
                aUser.setLocalStorage(email, uname, address, city, state, country, language, routepref, fname, lname, mobilenum);
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
    
    Log.log(6, "RegisterCtrl: End of controller");
});


//Mixin use
var Mixin = function() {}
Mixin.prototype = {
    setLocalStorage: function(email, uname, address, city, state, country, language, routepref, fname, lname, mobilenum){
        console.log("Mixin: setLocalStorage");
        if (email != 'undefined') {
            localStorage.setItem("email", email);
        }
        if (uname != 'undefined') {
            localStorage.setItem("username", uname);
        }
        if (address != 'undefined') {
            localStorage.setItem("address", address);
        }
        if (city != 'undefined') {
            localStorage.setItem("city", city);
        }
        if (state != 'undefined') {
            localStorage.setItem("state", state);
        }
        if (country != 'undefined') {
            localStorage.setItem("country", country);
        }
        if (language == 'undefined') {
            localStorage.setItem("language", "en");
        } else {
            localStorage.setItem("language", language);
        }
        if (routepref == 'undefined') {
            localStorage.setItem("routepref", "1");
        } else {
            localStorage.setItem("routepref", routepref);
        }
        if (fname != 'undefined') {
            localStorage.setItem("firstname", fname);
        }
        if (lname != 'undefined') {
            localStorage.setItem("lastname", lname);
        }
        if (mobilenum != 'undefined') {
            localStorage.setItem("mobilenum", mobilenum);
        }
    },
    getLocation: function(){
        console.log("Mixin: getLocation");
    }
};

function augment( receivingClass, givingClass ) {
    // only provide certain methods
    if ( arguments[2] ) {
        for ( var i = 2, len = arguments.length; i < len; i++ ) {
            receivingClass.prototype[arguments[i]] = givingClass.prototype[arguments[i]];
        }
    }
    // provide all methods
    else {
        for ( var methodName in givingClass.prototype ) {
            // check to make sure the receiving class doesn't
            // have a method of the same name as the one currently
            // being processed
            if ( !Object.hasOwnProperty.call(receivingClass.prototype, methodName) ) {
                receivingClass.prototype[methodName] = givingClass.prototype[methodName];
            }

            // Alternatively (check prototype chain as well):
            // if ( !receivingClass.prototype[methodName] ) {
            //      receivingClass.prototype[methodName] = givingClass.prototype[methodName];
            // }
        }
    }
}

