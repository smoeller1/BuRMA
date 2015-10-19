// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

angular.module('myApp', [])
.controller('formCtrl', function($scope, $http, $window) {
    
    $scope.submit = function (firstName,lastName,DOB,phone,uname,pwd,repwd,email,address) {
    //console.log("inside  register function);
        $http({
            method: 'POST',
            url : 'https://api.mongolab.com/api/1/databases/aselab/collections/example?apiKey=hHuxLAqR1i6wzXYAy6cZ69t3ZNg_E0-g',
            data: JSON.stringify({
                fname : firstName,
                lname : lastName,
                dob : DOB,
                ph_number : phone,
                user_name : uname,
                passwd : pwd,
                re_passwd : repwd,
                email_id : email,
                address : address
                }),
            contentType: "application/json"
        }).success(function() {
            localStorage.setItem("firstname", firstName);
            localStorage.setItem("lastname", lastName);
            localStorage.setItem("username", uname);
            localStorage.setItem("address", address);
            alert("Registration Successful");
            $window.location.href = "/mapshome.html";
        })
    };



$scope.login = function (uname,pwd) {
    $http({
    method: 'GET',
    //url : 'https://api.mongolab.com/api/1/databases/aselab/collections/example?apiKey=hHuxLAqR1i6wzXYAy6cZ69t3ZNg_E0-g',
    url : 'https://api.mongolab.com/api/1/databases/aselab/collections/example?q={"user_name":"'+uname+'"}&f={"passwd":1,"address":1}&fo=true&apiKey=hHuxLAqR1i6wzXYAy6cZ69t3ZNg_E0-g'
    })  
    .success(function(data) {
        if(data.passwd == pwd){
            localStorage.setItem("username", uname);
            localStorage.setItem("address", data.address);
            console.log("formCtrl: login: " + uname + ", " + data.address);
            $window.location.href = "mapshome.html";} 
        else{
            alert("Invlid username or password");} 
        })
            
    .error(function() {
            alert('Failed to authenticate user '+uname);})
           
};

$scope.remove = function (uname,pwd) {
    $http({
    method: 'GET',
    //url : 'https://api.mongolab.com/api/1/databases/aselab/collections/example?apiKey=hHuxLAqR1i6wzXYAy6cZ69t3ZNg_E0-g',
    url : 'https://api.mongolab.com/api/1/databases/aselab/collections/example?q={"user_name":"'+uname+'"}&f={"passwd":1}&fo=true&apiKey=hHuxLAqR1i6wzXYAy6cZ69t3ZNg_E0-g'
    })  
    .success(function(data) {
        if(data.passwd == pwd){
            $http({
                    method : 'DELETE',
                    url : 'https://api.mongolab.com/api/1/databases/aselab/collections/example/'+data._id.$oid+'?apiKey=hHuxLAqR1i6wzXYAy6cZ69t3ZNg_E0-g',
                async : true
            })
        alert("Account has been deleted");}
                    
        else{
            alert("invalid password");} 
        })
            
    .error(function() {
            alert('Failed to authenticate user '+uname);})
           
};
    
$scope.changepassword = function (uname,pwd,changepwd) {
    $http({
    method: 'GET',
    //url : 'https://api.mongolab.com/api/1/databases/aselab/collections/example?apiKey=hHuxLAqR1i6wzXYAy6cZ69t3ZNg_E0-g',
    url : 'https://api.mongolab.com/api/1/databases/aselab/collections/example?q={"user_name":"'+uname+'"}&f={"passwd":1}&fo=true&apiKey=hHuxLAqR1i6wzXYAy6cZ69t3ZNg_E0-g'
    })  
    .success(function(data) {
        if(data.passwd == pwd){
            $http({
    method: 'PUT',
    url : 'https://api.mongolab.com/api/1/databases/aselab/collections/example/'+data._id.$oid+'?apiKey=hHuxLAqR1i6wzXYAy6cZ69t3ZNg_E0-g',
    data: JSON.stringify({"$set":{passwd : changepwd,re_passwd : changepwd}
                }),
        contentType: "application/json"
    
})
        alert("Password has been changed");}
                    
        else{
            alert("invalid password");} 
        })
            
    .error(function() {
            alert('Failed to authenticate user '+uname);})
           
};
    
});

angular.module('GoogleDirection', ['ionic', 'ngCordova'])
.controller('googlemapoutput', function ($scope,$http) {
    

    var map;
    var mapOptions;
    var directionsDisplay = new google.maps.DirectionsRenderer({
        draggable: true
    });
    var directionsService = new google.maps.DirectionsService();

    $scope.initialize = function () {
          var pos = new google.maps.LatLng(0, 0); 
          var mapOptions = {
                zoom: 3,
                center: pos
            };

            map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);
     };
    $scope.calcRoute = function () {
        alert("hi");
       var end = document.getElementById('endlocation').value;
            var start = document.getElementById('startlocation').value;

            var request = {
                origin: start,
                destination: end,
                travelMode: google.maps.TravelMode.DRIVING
            };

            directionsService.route(request, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setMap(map);
                    directionsDisplay.setDirections(response);
                    console.log(status);
                    
                }
           
        });
        
        $http.get(   'http://api.wunderground.com/api/36b799dc821d5836/conditions/q/MO/Kansas%20City.json').success(function(data) {
      console.log(data);
          temp = data.current_observation.temp_f;
                icon = data.current_observation.icon_url;
                weather = data.current_observation.weather;
             console.log(temp);
                $scope.currentweather = {html:"Currently " +temp +" &deg; F and " + weather + ""}
                $scope.currentIcon=  {html:"<img src='" + icon  +"'/>"}
                     
})

    };

    google.maps.event.addDomListener(window, 'load', $scope.initialize);
    
   
});


    

