


ttw.data_access = function (url, fb_verb, fb_type, ajax_verb, do_idb_first, milli_to_refresh, delay) {
    //use strict;

     console.log('start: ', Date.now())
    var value;
    return new Promise(function(resolve, reject) {
        idbKeyval.get(url).then(function(val) {
            console.log('idb: ', Date.now())
            if (val) {
                value = val;
                resolve(val);
            }
            // if(do_idb_first){
                do_request();
            // }
        })
        function do_request(){

            if(!value || !value.time_stamp || (value.time_stamp + milli_to_refresh < Date.now())){
                setTimeout( function(){
                    if(fb_verb){
                        ref_places = firebase.database().ref(url);
                        ref_places[fb_verb](fb_type, function (snapshot) {
                            console.log('fb: ', Date.now())
                            value = {data: snapshot.val(), time_stamp: Date.now()};
                            resolve(value);
                            idbKeyval.set(url, {data: snapshot.val(), time_stamp: Date.now()})
                                .then(function(){
                                    console.log('Data saved!')
                                })
                                .catch(function(err){
                                    console.log('Data not saved!', err  )
                                } );
                        });
                    }else if(ajax_verb){
                        var xmlHttp = new XMLHttpRequest();
                        xmlHttp.onreadystatechange = function () {
                            if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                                if (xmlHttp.responseText) {
                                    console.log('ajax: ', Date.now())
                                    value = {data: xmlHttp.responseText, time_stamp: Date.now()};
                                    resolve(value);
                                    idbKeyval.set(url, value)
                                        .then(function(){
                                            console.log('Data saved!')
                                        })
                                        .catch(function(err){
                                            console.log('Data not saved!', err  )
                                        } );
                                } else {
                                    reject("didn't work")
                                }
                            }
                        };
                        xmlHttp.open(ajax_verb, url, true);
                        xmlHttp.send();
                    }
                }, delay ? delay : 0);
            }
        }
        if(!do_idb_first){
            do_request()
        }


    });
}
