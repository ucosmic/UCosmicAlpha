/*

cd C:\Users\Tim\UCosmic\UCosmicGit\Layout3\Layout3\UCosmic.Web.Mvc\node_server
node firebase_student_aggregator.js

*/
var Firebase = require('firebase');
var FirebaseAggregator = require('./aggregator');
var rootUrl = 'https://UCosmic.firebaseio.com/';
var rootRef = new Firebase(rootUrl);
var tenant_list_ref = rootRef.child('tenant_list');
var tenant_list = [3306];




tenant_list.forEach(function (tennant) {

    var term_list_in_ref = rootRef.child('Members').child(tennant).child('term_list');
    var term_list_in = ['Fall 2014']


    var term_list_out_ref = rootRef.child('Members').child(tennant).child('term_list');
    var term_list_out = ['Fall 2014', 'Fall 2013', 'Fall 2012']

    term_list_in.forEach(function (term) {
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

        //do I need to do terms since I will get terms along with countries...
        //terms would be the aggregate of all countries counts.

        //var rawDataRef3 = rootRef.child('Members').child(tennant).child('Mobilities').child('Values').child('IN').child(term);
        //var resultsRef3 = rootRef.child('Members').child(tennant).child('Mobilities').child('Counts').child('IN').child(term).child('terms');

        //FirebaseAggregator({
        //    rawDataRef: rawDataRef3,
        //    resultsRef: resultsRef3,
        //    fields: ['affiliation', 'student_affiliation'],
        //    groupFunction: function (row) {
        //        //console.log('test_group:', row, row.country)
        //        //return term;
        //        return row.term ? row.term : 'none';
        //    }
        //});
        //var rawDataRef4 = rootRef.child('Members').child(tennant).child('Mobilities').child('Values').child('OUT').child(term);
        //var resultsRef4 = rootRef.child('Members').child(tennant).child('Mobilities').child('Counts').child('OUT').child(term).child('terms');

        //FirebaseAggregator({
        //    rawDataRef: rawDataRef4,
        //    resultsRef: resultsRef4,
        //    fields: ['affiliation', 'student_affiliation'],
        //    groupFunction: function (row) {
        //        //console.log('test_group:', row, row.country)
        //        //return term;
        //        return row.term ? row.term : 'none';
        //    }
        //});
    })

})
