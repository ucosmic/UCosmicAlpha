importScripts('/components_riot/bower_components/kefir/dist/kefir.min.js');
importScripts('/components_riot/bower_components/firebase/firebase.js');
importScripts('/components_riot/components/lib/pouchdb-5.2.1.min.js');

//function get_firebase_shallow(){
//    var xmlHttp = new XMLHttpRequest();
//    xmlHttp.onreadystatechange = function (response) {
//        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
//            if (xmlHttp.responseText) {
//                console.log(xmlHttp.responseText);
//                console.log(Date.now());
//            } else {
//
//            }
//        }
//    };
//    xmlHttp.open("GET", "https://ucosmic.firebaseio.com/Members/3306.json?shallow=true&print=pretty", true);
//    xmlHttp.send();
//    console.log(Date.now());
//}

function pouchDB_save(url,key, data, db) {

    _ref = null;
       db.get(key, function (error, response) {
           var _rev = null;
            if (!error) {
                _rev = response._rev;
            }
            if (_rev) {
                db.put({_id: key, _rev: _rev, data: data}).then(function (response) {
                    //console.log(Date.now());
                    //db_updating = false;
                }).catch(function (err) {
                    //db_updating = false;
                    console.log(err);
                });//this won't save without the correct _rev id thingy
            } else {
                db.put({_id: key, data: data}).then(function (response) {
                    //console.log(Date.now());
                    //db_updating = false;
                }).catch(function (err) {
                    //db_updating = false;
                    console.log(err);
                });
            }
        });
    //}
    //else {
    //    setTimeout(function () {
    //            pouchDB_save(my_this);
    //        },50);
    //}
    //}
}

onmessage = function (data) {
    var data_object = JSON.parse(data.data);
    var data_list = data_object.paths;
    var db = new PouchDB('students_' + data_object.tenant_id)
    var data_list_stream = Kefir.sequentially(0, data_list)


    var fire_stream = data_list_stream.flatMap(function (data_url) {
        var fire_ref = new Firebase(data_url);
        return Kefir.stream(function (emitter) {
            fire_ref.on("child_added", function (snapshot) {
                emitter.emit({snapshot: snapshot, url: data_url});
            });
        })
    });
    fire_stream.onValue(function(data) {
        pouchDB_save(data.url, data.url.substr(data.url.lastIndexOf('/')).replace(' ', '2') + data.snapshot.key(), data.snapshot.val(), db);
    });

    console.log('test');

    //setTimeout(function () {
    //    db.allDocs({
    //        include_docs: true
    //    }).then(function (result) {
    //        console.log(Date.now())
    //    }).catch(function (err) {
    //        console.log(err);
    //    });
    //    console.log(Date.now())
    //},30000);

    this.postMessage(JSON.stringify({}));


}