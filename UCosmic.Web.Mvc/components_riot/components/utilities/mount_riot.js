function init_app(){
    "use strict";
    if(riot && RiotControl && ucosmic.app_store){
        var SharedMixin = {
            observable: riot.observable()
        };

        var app_store = new ucosmic.app_store()
        RiotControl.addStore(app_store)
        riot.mount('layout') // Kickoff the Riot app.
    }else{
        setTimeout(function(){
            init_app();
        },50)
    }
}

init_app();


(function(){
    if(!Array.prototype.find){
        Array.prototype.find = function(callback){
            "use strict";
            var found = false;
            var return_val = this.filter(function(value, index, arr){
                if(!found && callback(value, index, arr)){
                    found = true;
                    return true;
                }else{
                    return false;
                }
            });
            return !return_val || return_val.length == 0 ? undefined : return_val[0];
            // return !return_val || return_val.length == 0 ? false : true;
        }
    }
    if (!Array.prototype.findIndex) {
        Array.prototype.findIndex = function(predicate) {
            if (this === null) {
                throw new TypeError('Array.prototype.findIndex called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            var value;

            for (var i = 0; i < length; i++) {
                value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return i;
                }
            }
            return -1;
        };
    }
})();

window.onbeforeunload = disconnect_firebase;
function disconnect_firebase()
{
    firebase.database().goOffline()
}
//RiotControl.on('render_app', function (){
//    riot.update();
//});
//
//ucosmic.menus = localStorage.getItem('my_menu');
//RiotControl.on('save_app', function (){
//    localStorage.setItem('my_menu', JSON.stringify(ucosmic.menus))
//    setTimeout(function () {
//        // application has renderd itself
//        // web application controls element <div id="app">
//        bottleService.refill('ucosmic', 'app')
//    }, 0);
//});