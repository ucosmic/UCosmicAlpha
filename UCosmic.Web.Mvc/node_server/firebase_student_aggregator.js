/*

cd C:\Users\Tim\UCosmic\UCosmicGit\Layout3\Layout3\UCosmic.Web.Mvc\node_server
node firebase_student_aggregator.js

*/
var firebase = require('firebase');
var FirebaseAggregator = require('./aggregator');
var rootUrl = 'https://UCosmic.firebaseio.com/';
//var rootRef = new Firebase(rootUrl);
//var tenant_list_ref = rootRef.child('tenant_list');
var tenant_list = [3306];
//var tenant_list = [3306, 1, 66];

//var FirebaseTokenGenerator = require("firebase-token-generator");
//var tokenGenerator = new FirebaseTokenGenerator("pXxnmMQ4YPK97bFKoN4JzGOJT40nOhM921z3JKl6");
/*
need to make a rule for admin rights, not just for 3306.
*/
//var roles = [
//    { name: 'Institutional Student Supervisor', for_establishment: '3306' }
//    , { name: 'Institutional Student Manager', for_establishment: '3306' }
//    //, { name: 'Institutional Student Supervisor', for_establishment: '1' }
//    //, { name: 'Institutional Student Manager', for_establishment: '1' }
//    //, { name: 'Institutional Student Supervisor', for_establishment: '66' }
//    //, { name: 'Institutional Student Manager', for_establishment: '66' }
//]
//var token = tokenGenerator.createToken({ uid: "custom:admin", role: roles, data: "here" });


//rootRef.authWithCustomToken(token, function (error, authData) {
//    if (error) {
//        console.log("Authentication Failed!", error);
//    } else {
//        console.log("Authenticated successfully with payload:", authData);
//        start()
//    }
//});
var db;
var rootRef;
function init_fb() {
    firebase.initializeApp({
        databaseURL: rootUrl,
        serviceAccount: "UCosmic-dd777a19cb70.json",
        databaseAuthVariableOverride: {
            uid: "custom:admin",
            is_super: true,
            data: "here"
        }
    });

    // The app only has access as defined in the Security Rules
    db = firebase.database();
    rootRef = db.ref();
}
init_fb();

//setInterval(function () {
//    init_fb();
//}, 60000)


function start() {


    // do this functionally and do it with a timer to do the recursion.
    function term_count(term, term_list, tennant) {
        console.log(term, tennant);
        var rawDataRef = rootRef.child('Members').child(tennant).child('Mobilities').child('Values').child('IN').child(term).child('Values');
        var resultsRef = rootRef.child('Members').child(tennant).child('Mobilities').child('Counts').child('IN').child(term).child('countries');

        FirebaseAggregator({
            rawDataRef: rawDataRef,
            resultsRef: resultsRef,
            fields: ['affiliation', 'student_affiliation'],
            groupFunction: function (row) {
                //console.log('test_group:', row, row.country)
                //return term;
                return row.country ? row.country : 'none';
            }
        });
        console.log(term, tennant);
        var rawDataRef2 = rootRef.child('Members').child(tennant).child('Mobilities').child('Values').child('OUT').child(term).child('Values');
        var resultsRef2 = rootRef.child('Members').child(tennant).child('Mobilities').child('Counts').child('OUT').child(term).child('countries');

        FirebaseAggregator({
            rawDataRef: rawDataRef2,
            resultsRef: resultsRef2,
            fields: ['affiliation', 'student_affiliation'],
            groupFunction: function (row) {
                //console.log('test_group:', row, row.country)
                //return term;
                return row.country ? row.country : 'none';
            }
        });
        if (term_list.length != 1) {
            setTimeout(function () {
                term_list.pop();
                term_count(term_list[term_list.length - 1], term_list, tennant)
            }, 360000)
        }

    }



    tenant_list.forEach(function (tennant) {
        //var term_list_ref = rootRef.child('Members').child(tennant).child('term_list');
        var term_list = ['Fall 2010', 'Fall 2011', 'Fall 2012', 'Fall 2013', 'Fall 2014', 'Fall 2015'
            , 'Spring 2010', 'Spring 2011', 'Spring 2012', 'Spring 2013', 'Spring 2014', 'Spring 2015', 'Spring 2016'
            , 'Summer 2010', 'Summer 2011', 'Summer 2012', 'Summer 2013', 'Summer 2014', 'Summer 2015']


        //var term_list_out_ref = rootRef.child('Members').child(tennant).child('term_list');
        //var term_list_out = ['Fall 2010', 'Fall 2011', 'Fall 2012', 'Spring 2011', 'Spring 2012', 'Spring 2013', 'Summer 2011', 'Summer 2012', 'Summer 2013']
        //var term_list_out = ['Fall 2014', 'Fall 2013', 'Fall 2012']

        term_count(term_list[term_list.length-1], term_list, tennant)



        //term_list_in.forEach(function (term) {
        //    console.log(term, tennant);
        //    var rawDataRef = rootRef.child('Members').child(tennant).child('Mobilities').child('Values').child('IN').child(term).child('Values');
        //    var resultsRef = rootRef.child('Members').child(tennant).child('Mobilities').child('Counts').child('IN').child(term).child('countries');

        //    FirebaseAggregator({
        //        rawDataRef: rawDataRef,
        //        resultsRef: resultsRef,
        //        fields: ['affiliation', 'student_affiliation'],
        //        groupFunction: function (row) {
        //            //console.log('test_group:', row, row.country)
        //            //return term;
        //            return row.country ? row.country : 'none';
        //        }
        //    });
        //    console.log(term, tennant);
        //    var rawDataRef2 = rootRef.child('Members').child(tennant).child('Mobilities').child('Values').child('OUT').child(term).child('Values');
        //    var resultsRef2 = rootRef.child('Members').child(tennant).child('Mobilities').child('Counts').child('OUT').child(term).child('countries');

        //    FirebaseAggregator({
        //        rawDataRef: rawDataRef2,
        //        resultsRef: resultsRef2,
        //        fields: ['affiliation', 'student_affiliation'],
        //        groupFunction: function (row) {
        //            //console.log('test_group:', row, row.country)
        //            //return term;
        //            return row.country ? row.country : 'none';
        //        }
        //    });

        //    //do I need to do terms since I will get terms along with countries...
        //    //terms would be the aggregate of all countries counts.

        //})

    })

}
start();