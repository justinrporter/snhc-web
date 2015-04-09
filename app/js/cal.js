'use strict';

/* Controllers */

angular.module('myApp.calcontrol', ['myApp.calService', 'firebase'])
  .value('fbURL', "https://blistering-fire-6953.firebaseio.com")
  .value('max_volunteers', { clinical : 3,
                             preclinical : 3,
                             attending : 1 })
  .service('fbRef', function(fbURL) {
    return new Firebase(fbURL)
  })
  .service('fbo', function( $firebaseObject, fbRef ) {
    return $firebaseObject(fbRef.child("events"));
  })
  .controller('CalCtrl', function($scope, $window, cal_http ) {
    cal_http
    .success(function(data, status, headers, config) {
      $scope.cal_events = [];
      for ( var index in data.items ) {
        // data.times are "events" resources.
        // API doc: https://developers.google.com/google-apps/calendar/v3/reference/events#resource

        // This dictionary is interpreted by the FullCalendar module to render an appropriate calendar.
        // API doc: http://fullcalendar.io/docs/event_data/events_array/
        var event_properties = { title : data.items[index].summary,
                                 start : data.items[index].start.dateTime,
                                 end : data.items[index].end.dateTime,
                                 id : data.items[index].id
                                };
        $scope.cal_events.push( event_properties );
      }
    })
    .error(function(data, status, headers, config) {
      $window.alert("Whoops! We failed to contact the Google Calendar. Response was "+status+". Sorry!");
    });
  })
  .controller('FirebaseCtrl', function($scope, $firebaseArray, $firebaseObject, fbRef, max_volunteers ){
    $scope.firebase_volunteers = $firebaseObject(fbRef.child("events").child($scope.event.id));
    $scope.max_volunteers = max_volunteers;

    $scope.open = function(clinfilter) {
      var n_volunteers = 0;
      // console.log( $scope.firebase_volunteers );

      for( var volunteer in $scope.firebase_volunteers[clinfilter] ){
        if(volunteer.charAt(0) != "$"){
          n_volunteers += 1;
        }
      }

      // use the max_volunteers value object to decide if this is an open event
      return ( n_volunteers < $scope.max_volunteers[clinfilter] );
    }

    $scope.volunteer = function(clinfilter){
      if( !$scope.open(clinfilter)){
        alert( "The date doesn't look to be availiable. That's all we know." );
        return;
      } else if( !$scope.uname ){
        alert( "You must enter a username to volunteer." );
      }

      var volunteer_info = $firebaseObject(fbRef.child("users").child($scope.uname).child("type"));

      volunteer_info.$loaded().then( function() {
        if( volunteer_info != clinfilter ) {
          alert( "You (username '" + $scope.uname + "') don't seem to be authorized to volunteer for this "+clinfilter+" spot." );
          return;
        } else {
          var user_entry = $firebaseObject(fbRef.child("events")
                                                .child($scope.event.id)
                                                .child(clinfilter)
                                                .child($scope.uname));
          user_entry.$value = true;
          user_entry.$save().then( function() {
            console.log($firebaseObject(fbRef.child("events")
                                             .child($scope.event.id)
                                             .child(clinfilter)
                                             .child($scope.uname)));
            alert( "You've successfully signed up to volunteer on " + $scope.event.start + ".")
          }).catch(function(error){
            alert( "We couldn't sign you up. The error was " + error );
          });
        }
      })

    }
  });
