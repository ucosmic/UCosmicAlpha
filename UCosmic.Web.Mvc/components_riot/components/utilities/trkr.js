"use strict";
var start_trkr = function () {
    "use strict";
    var track_mouse_moves = false;
    var unique_user = localStorage.getItem('unique_user');
    var unique_session = 'session_' + Math.floor(Math.random() * (1000000 - 0 + 1)) + 0;
    var utc = new Date().toJSON().slice(0,10);

    if (!unique_user) {
        unique_user = 'user_' + Math.floor(Math.random() * (1000000 - 0 + 1)) + 0;
        localStorage.setItem('unique_user', unique_user);
    }

    function successFunction(position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        xmenu.fire_ref.child('Analytics').child(utc).child(unique_user).child(unique_session).child('Geo').push({lat: lat, lng: lng, time: firebase.database.ServerValue.TIMESTAMP}, function (error) {
        })

    }
    function errorFunction(){

    }

    function trk_user(unique_user){

        xmenu.fire_ref.child('Analytics').child(utc).child(unique_user).child(unique_session).child('user_agent').set({agent: navigator.userAgent, time: firebase.database.ServerValue.TIMESTAMP}, function (error) {
        });

        xmenu.fire_ref.child('Analytics').child('users').child(unique_user).child(unique_session).child('time').child('enter_time').set({time: firebase.database.ServerValue.TIMESTAMP}, function (error) {
        })
        xmenu.fire_ref.child('Analytics').child(utc).child(unique_user).child(unique_session).child('time').child('enter_time').set({time: firebase.database.ServerValue.TIMESTAMP}, function (error) {
        })
        window.onbeforeunload = function (e) {
            xmenu.fire_ref.child('Analytics').child('users').child(unique_user).child(unique_session).child('time').child('exit_time').set({time: firebase.database.ServerValue.TIMESTAMP}, function (error) {
            })
            xmenu.fire_ref.child('Analytics').child(utc).child(unique_user).child(unique_session).child('time').child('exit_time').set({time: firebase.database.ServerValue.TIMESTAMP}, function (error) {
            })
        };
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
        }

        if(xmenu && xmenu.last_page){

            xmenu.fire_ref.child('Analytics').child(utc).child(unique_user).child(unique_session).child('page').push({page: xmenu.last_page, time: firebase.database.ServerValue.TIMESTAMP}, function (error) {
            })
        }

        RiotControl.on('page_changed', function(current_page, last_page) {

            xmenu.fire_ref.child('Analytics').child(utc).child(unique_user).child(unique_session).child('page').push({page: current_page, time: firebase.database.ServerValue.TIMESTAMP}, function (error) {
            })
        });
        var dragTarget = document.querySelector('#draggable');
        var mouse_clicks = Kefir.fromEvents(document, 'mouseup');
        if(track_mouse_moves){
            var mouse_moves = Kefir.fromEvents(document, 'mousemove');

            const mouse_moves_throttled = mouse_moves.throttle(50);
            mouse_moves_throttled.onValue(function (event) {
                var eventDoc, doc, body, pageX, pageY;

                event = event || window.event; // IE-ism
                if (event.pageX == null && event.clientX != null) {
                    eventDoc = (event.target && event.target.ownerDocument) || document;
                    doc = eventDoc.documentElement;
                    body = eventDoc.body;

                    event.pageX = event.clientX +
                        (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                        (doc && doc.clientLeft || body && body.clientLeft || 0);
                    event.pageY = event.clientY +
                        (doc && doc.scrollTop || body && body.scrollTop || 0) -
                        (doc && doc.clientTop || body && body.clientTop || 0 );
                }
                xmenu.fire_ref.child('Analytics').child(utc).child(unique_user).child(unique_session).child('mouse').child('move').push({x: event.pageX, y: event.pageY, time: firebase.database.ServerValue.TIMESTAMP}, function (error) {
                })
            });
        }
        mouse_clicks.onValue(function (event) {

            event = event || window.event; // IE-ism
            var target_id = event.target.id || 'none';
            var parent_id = (event.target && event.target.parentElement && event.target.parentElement.id) ? event.target.parentElement.id : 'none';
            var parent_parent_id = (event.target && event.target.parentElement && event.target.parentElement.parentElement && event.target.parentElement.parentElement.id) ? event.target.parentElement.id : 'none';

            xmenu.fire_ref.child('Analytics').child(utc).child(unique_user).child(unique_session).child('mouse').child('click').push(
                {
                    target_id:target_id,
                    parent_id: parent_id,
                    parent_parent_id: parent_parent_id,
                    time: firebase.database.ServerValue.TIMESTAMP
                }
                , function (error) {
                })
        });
    }

    if(window.location.href.includes('localhost')){
        return;
    } else if (firebase && Kefir && xmenu.fire_ref) {


        trk_user(unique_user);



    } else {
        setTimeout(function () {
            start_trkr();
        }, 50)
    }
}
start_trkr();