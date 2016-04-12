/*

cd C:\Users\Tim\UCosmic\UCosmicGit\Layout3\Layout3\UCosmic.Web.Mvc\node_server
node firebase_student_aggregator.js

*/
var Firebase = require('firebase');
var rootUrl = 'https://UCosmic.firebaseio.com/';
var rootRef = new Firebase(rootUrl);



function get_ancestors(establishment_list, establishment, ancestors) {
    
    if (establishment.parent_id) {
        ancestors.push(establishment.parent_id)
        //console.log(establishment.parent_id);
        //console.log(establishment_list[establishment.parent_id])
        get_ancestors(establishment_list, establishment_list[establishment.parent_id], ancestors)
    } else {
        return ancestors;
    }
}


(function () {
    rootRef.child('Establishments').child('Establishments').on('value', function (snap) {
        var establishment_list = snap.val();// Object.keys(snap.val()).map(function (key) { return snap.val()[key] });
        for (var name in establishment_list) {
            if (establishment_list.hasOwnProperty(name)) {
                var establishment = establishment_list[name]
                var ancestors = [];
                var establishment_ancestors = rootRef.child('Establishments').child('Establishments_Ancestors').child(name);
                var ancestors2 = get_ancestors(establishment_list, establishment, ancestors);
                var ancestors3 = ancestors ? ancestors : [];
                //console.log(ancestors3)
                establishment_ancestors.set({ ancestors: ancestors3 }, function (error) {
                    if (error) {
                        console.log(error);
                    }
                });
                //establishment_ancestors.transaction(function (establishment) {
                //    establishment ? establishment.ancestors = ancestors3 : establishment = { ancestors: ancestors3 };
                //    console.log(establishment);
                //    return establishment;
                //});
            }
        }
        //establishment_list.forEach(function (establishment, index) {
        //    if (establishment) {
        //        //console.log('testaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
        //        var ancestors = [];
        //        var establishment_ancestors = rootRef.child('Establishments').child('Establishments_Ancestors').child(index);
        //        establishment_ancestors.transaction(function (total) {
        //            return get_ancestors(establishment_list, establishment, ancestors);
        //        });
        //    }
        //})

    })
})()