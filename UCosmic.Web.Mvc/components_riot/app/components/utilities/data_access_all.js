
/**************************************** when updating only bring down new records based on last_updated or create_date(if they are new)  *****************/
var config = {
    apiKey: "AIzaSyBpzIaweLPBcKOodY8JdxDlwARwbcEvhc4",
    authDomain: "ucosmic.firebaseapp.com",
    databaseURL: "https://ucosmic.firebaseio.com",
    storageBucket: "project-4691094245668174778.appspot.com",
};
firebase.initializeApp(config);
ttw.root_ref = firebase.database().ref();
ttw.data_access_idb = function (url) {
    //use strict;

    console.log('start: ', Date.now())
    return new Promise(function (resolve, reject) {
        idbKeyval.get(url).then(function (val) {
            console.log('idb: ', Date.now())
            resolve(val);
        })
    })
};

ttw.data_access_ajax = function (url, ajax_verb) {
    //use strict;

    console.log('start: ', Date.now())
    var value;
    return new Promise(function (resolve, reject) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                if (xmlHttp.responseText) {
                    console.log('ajax: ', Date.now())
                    value = {data: xmlHttp.responseText, time_stamp: Date.now()};
                    resolve(value);
                    idbKeyval.set(url, value)
                        .then(function () {
                            console.log('Data saved!')
                        })
                        .catch(function (err) {
                            console.log('Data not saved!', err)
                        });
                } else {
                    reject("didn't work")
                }
            }
        };
        xmlHttp.open(ajax_verb, url, true);
        xmlHttp.send();
    })
};

ttw.data_access_fb = function (url, fb_verb, fb_type) {
    //use strict;

    console.log('start: ', Date.now())
    var value;
    return new Promise(function (resolve, reject) {
        ref_places = firebase.database().ref(url);
        ref_places[fb_verb](fb_type, function (snapshot) {
            console.log('fb: ', Date.now())
            value = {data: snapshot.val(), time_stamp: Date.now()};
            resolve(value);
            idbKeyval.set(url, {data: snapshot.val(), time_stamp: Date.now()})
                .then(function () {
                    console.log('Data saved!')
                })
                .catch(function (err) {
                    console.log('Data not saved!', err)
                });
        });
    })
}

ttw.data_access_fastest = function(url, fb_verb, fb_type, ajax_verb){
    //call the 3 funcs above and see the fastest
}