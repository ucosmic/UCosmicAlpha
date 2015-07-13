importScripts('/components/Polymer_1x/bower_components/firebase/firebase.js');
importScripts('/components/Polymer_1x/bower_components/lodash/lodash.min.js');

self.addEventListener('message', function (e) {


    var join_refs = function () {
        var mobility_list = [], country_list, level_list, program_list, establishment_list, term_list, student_list; 
        var fire_students_mobilities = new Firebase("https://UCosmic.firebaseio.com/Students/Mobilities"),
            fire_students_students = new Firebase("https://UCosmic.firebaseio.com/Students/Students"),
            fire_students_terms = new Firebase("https://UCosmic.firebaseio.com/Students/Terms"),
            fire_students_levels = new Firebase("https://UCosmic.firebaseio.com/Students/Levels"),
            fire_establishments = new Firebase("https://UCosmic.firebaseio.com/Establishments/Establishments"),
            fire_students_programs = new Firebase("https://UCosmic.firebaseio.com/Students/Programs"),
            fire_countries = new Firebase("https://UCosmic.firebaseio.com/Places/Countries"),
            fire_students_mobilities = new Firebase("https://UCosmic.firebaseio.com/Students/Mobilities");

        var all_loaded = false, temp_snapshot = [];
        var load_data = _.after(5, function (_this2) {
            //_mobilities = _.toArray(merged);
            all_loaded = true;
        });

        fire_establishments.once("value", (snapshot) => {
            //var message: string = JSON.stringify((snapshot.val()));
            establishment_list = _.map(snapshot.val(), function (value: any, index) {
                if (value) {
                    var object = { _id: index, text: value.establishment }
                    return object;
                }
            })
            this.postMessage({
                'type': 'establishment_list'
                , 'value': JSON.stringify(establishment_list)
            });
            //establishment_list = _.map(snapshot.val(), function (value: any, index) {
            //    if (value) {
            //        var object = { _id: index, text: value.establishment }
            //        return object;
            //    }
            //});
            load_data(this);
        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });

        fire_students_levels.orderByChild("establishment").equalTo('3306').once("value", (snapshot) => {
            level_list = _.map(snapshot.val(), function (value: any, index) {
                if (value) {
                    var object = { _id: index, text: value.name }
                    return object;
                }
            })
            this.postMessage({
                'type': 'level_list'
                , 'value': JSON.stringify(level_list)
            });
            //level_list = _.map(snapshot.val(), function (value: any, index) {
            //    if (value) {
            //        var object = { _id: index, text: value.name }
            //        return object;
            //    }
            //});
            load_data(this);
        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });

        fire_countries.once("value", (snapshot) => {
            country_list = _.map(snapshot.val(), function (value: any, index) {
                if (value) {
                    var object = { _id: index, text: value.country }
                    return object;
                }
            })
            this.postMessage({
                'type': 'country_list'
                , 'value': JSON.stringify(country_list)
            });
            //country_list = _.map(snapshot.val(), function (value: any, index) {
            //    if (value) {
            //        var object = { _id: index, text: value.country }
            //        return object;
            //    }
            //});
            load_data(this);
        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });

        fire_students_programs.once("value", (snapshot) => {
            program_list = _.map(snapshot.val(), function (value: any, index) {
                if (value) {
                    var object = { _id: index, text: value.name }
                    return object;
                }
            })
            this.postMessage({
                'type': 'program_list'
                , 'value': JSON.stringify(program_list)
            });
            //program_list = _.map(snapshot.val(), function (value: any, index) {
            //    if (value) {
            //        var object = { _id: index, text: value.name }
            //        return object;
            //    }
            //});
            load_data(this);
        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });


        //fire_students_students.orderByChild("establishment").equalTo('3306').once("value", (snapshot) => {
        //    student_list = _.map(snapshot.val(), function (value: any, index) {
        //        if (value) {
        //            var object = { _id: index, text: value.name }
        //            return object;
        //        }
        //    })
        //    this.postMessage({
        //        'type': 'student_list'
        //        , 'value': JSON.stringify(student_list)
        //    });
        //    //student_list = _.map(snapshot.val(), function (value: any, index) {
        //    //    if (value) {
        //    //        var object = { _id: index, text: value.name }
        //    //        return object;
        //    //    }
        //    //});
        //    load_data(this);
        //}, function (errorObject) {
        //        console.log("The read failed: " + errorObject.code);
        //    });

        fire_students_terms.orderByChild("establishment").equalTo('3306').once("value", (snapshot) => {
            term_list = _.map(snapshot.val(), function (value: any, index) {
                if (value) {
                    var object = { _id: index, text: value.name }
                    return object;
                }
            })
            this.postMessage({
                'type': 'term_list'
                , 'value': JSON.stringify(term_list)
            });
            //term_list = _.map(snapshot.val(), function (value: any, index) {
            //    if (value) {
            //        var object = { _id: index, text: value.name }
            //        return object;
            //    }
            //});
            load_data(this);
        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });
        var mobility_snapshot = []
        var counter = 0;
        //var call_start_setup_filter = () => {
        //    start_setup_filter()
        //}
        var _this2 = this;
        function call_start_setup_filter() {
            //_this2.mobilities = JSON.parse(JSON.stringify(_this2.mobilities));
            this.postMessage({
                'type': 'mobility_list'
                , 'value': JSON.stringify(mobility_list)
            });
            //_this2.start_setup_filter()
            console.log(counter++);
        }
        var debounce = _.throttle(call_start_setup_filter, 100, {
            'maxWait': 500
        });
        fire_students_mobilities.orderByChild("establishment").equalTo('3306').on("child_added", (snapshot) => {
            //console.log(snapshot.val());
            //mobility_snapshot = _.toArray(snapshot.val());
            //load_data(_this);
            //var self;
            //var message: string = JSON.stringify((snapshot.val()));
            //this.postMessage(message);temp_snapshot.push(JSON.parse(e.data))
            var snapshot_value = snapshot.val();
            snapshot_value.key = snapshot.key();
            temp_snapshot.push(snapshot_value);

            if (all_loaded) {
                _.forEach(temp_snapshot, (value) => {
                    mobility_list.push(
                        {
                            key: value.key,
                            country_name: _.result(_.find(country_list, { '_id': value.country }), 'text'), //
                            level_name: _.result(_.find(level_list, { '_id': value.level }), 'text'), //level_list[value.level] ? level_list[value.level].text : "",
                            program_name: _.result(_.find(program_list, { '_id': value.program }), 'text'), //program_list[value.program] ? program_list[value.program].text : "",
                            student_name: _.result(_.find(student_list, { '_id': value.student }), 'text'), //student_list[value.student] ? student_list[value.student].text : "",
                            term_name: _.result(_.find(term_list, { '_id': value.term }), 'text'), //term_list[value.term] ? term_list[value.term].text : "",
                            status: value.status == 'IN' ? "In Coming" : "Out Going",
                            affiliation_name: establishment_list[value.affiliation] ? establishment_list[value.affiliation].text : "",
                            sub_affiliation_name: establishment_list[value.sub_affiliation] ? establishment_list[value.sub_affiliation].text : "",
                            foreign_affiliation_name: establishment_list[value.foreign_affiliation] ? establishment_list[value.foreign_affiliation].text : "",
                        }
                        );
                })
                temp_snapshot = [];
                debounce();
                //_.throttle(call_start_setup_filter, 500)
                //start_setup_filter();
                //_load_mobility_data(this)
            }
        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });
        //var norm = new Firebase.util.NormalizedCollection(
        //    [fire_students_mobilities, 'Mobilities']
        ////, [fire_establishments, 'Establishments', 'Mobilities.establishment']
        ////, [fire_establishments, 'Establishments_students', 'Mobilities.student_establishment']
        ////, [fire_establishments, 'Establishments_students_foreign', 'Mobilities.foreign_establishment']
        //    , [fire_students_students, 'Students', 'Mobilities.student']
        //    , [fire_students_levels, 'Levels', 'Mobilities.level']
        //    , [fire_students_terms, 'Terms', 'Mobilities.term']
        //    , [fire_countries, 'Countries', 'Mobilities.country']
        //    , [fire_students_programs, 'Programs', 'Mobilities.program']
        //    );
        ////norm = norm.filter(function (data, key, priority) {
        ////    return data.external_id === '2345dd';
        ////});
        //norm.select('Mobilities.student', 'Mobilities.level', 'Mobilities.term', 'Mobilities.establishment', 'Mobilities.country', 'Mobilities.program', 'Mobilities.status'
        //    , 'Mobilities.foreign_affiliation', 'Mobilities.affiliation', 'Mobilities.sub_affiliation'
        //    , 'Students.external_id', { key: 'Levels.name', alias: 'level_name' }, 'Levels.rank', 'Terms.start_date', 'Terms.end_date', { key: 'Terms.name', alias: 'term_name' }
        ////, { key: 'Establishments.establishment', alias: 'affiliation_name' }
        //    , { key: 'Countries.country', alias: 'country_official_name' }, { key: 'Programs.name', alias: 'program_name' }
        //    );
        //var ref = norm.ref();
        


        //fire_students_mobilities.orderByChild("establishment").equalTo('3306').on("child_added", (snapshot) => {
        //    //console.log(snapshot.val());
        //    //mobility_snapshot = _.toArray(snapshot.val());
        //    //load_data(_this);
        //    //var self;
        //    var message: string = JSON.stringify((snapshot.val()));
        //    this.postMessage(message);
        //}, function (errorObject) {
        //        console.log("The read failed: " + errorObject.code);
        //    });


    }
    join_refs();
});

//_this = this;
        //var ref_data
        //var fire_students = var my_fire.child("Students");
        //var fire_students_mobilities = var my_fire.child("Mobilities");// new Firebase("https://UCosmic.firebaseio.com/Students/Mobilities")
        //var list3 = Firebase.getAsArray(var fire_students_mobilities);

        //var list3 = Firebase.getAsArray(var fire_students_mobilities); 

        

        //var norm2 = new Firebase.util.NormalizedCollection(
        //    [ref, 'Mobilities']
        //    , [fire_establishments, 'Establishments_students', 'Mobilities.student_establishment']
        //    );
        //norm2.select('Mobilities.student', 'Mobilities.level', 'Mobilities.term', 'Mobilities.establishment', 'Mobilities.country', 'Mobilities.program', 'Mobilities.status'
        //    , 'Mobilities.foreign_establishment', 'Mobilities.student_establishment'
        //    , 'Mobilities.level_name', 'Mobilities.rank', 'Mobilities.start_date', 'Mobilities.end_date', 'Mobilities.term_name'
        //    , 'Mobilities.affiliation_name'
        //    , { key: 'Establishments_students.establishment', alias: 'sub_affiliation_name' }
        //    , 'Mobilities.country_official_name'
        //    );
        //var ref2 = norm2.ref();

        //var norm3 = new Firebase.util.NormalizedCollection(
        //    [ref, 'Mobilities']
        //    , [fire_establishments, 'Establishments_students_foreign', 'Mobilities.foreign_establishment']
        //    );
        //norm3.select('Mobilities.student', 'Mobilities.level', 'Mobilities.term', 'Mobilities.establishment', 'Mobilities.country', 'Mobilities.program', 'Mobilities.status'
        //    , 'Mobilities.foreign_establishment', 'Mobilities.student_establishment'
        //    , 'Mobilities.level_name', 'Mobilities.rank', 'Mobilities.start_date', 'Mobilities.end_date', 'Mobilities.term_name'
        //    , 'Mobilities.affiliation_name'
        //    , 'Mobilities.sub_affiliation_name', { key: 'Establishments_students_foreign.establishment', alias: 'foreign_affiliation_name' }
        //    , 'Mobilities.country_official_name'
        //    );
        //var ref3 = norm3.ref();

        ////var norm2 = new Firebase.util.NormalizedCollection(
        ////    new Firebase("https://UCosmic.firebaseio.com/Students/Programs"),  // alias is "widgets1"
        ////    [ref, 'Mobilities', 'Programs.code']
        ////    );

        ////norm2.select('Programs.code', 'Mobilities.student', 'Mobilities.level', 'Mobilities.term', 'Mobilities.establishment', 'Mobilities.country', 'Mobilities.program', 'Mobilities.status',
        ////    'Mobilities.foreign_establishment', 'Mobilities.student_establishment', 
        ////    'Mobilities.external_id', 'Mobilities.level_name', 'Mobilities.rank', 'Mobilities.start_date', 'Mobilities.end_date', 'Mobilities.term_description',
        ////    'Mobilities.affiliation_name', 'Mobilities.country_name', 'Mobilities.program_code');
        ////var ref2 = norm.ref();
        ////var list = Firebase.getAsArray(ref2); 
        //var ref_data, ref2_data, ref3_data;


        //var load_data = _.after(3, function () {
        //    if (mobilities && mobilities.length > 0) {
        //        mobilities = _.merge(ref_data, ref2_data, ref3_data);
        //        console.log(mobilities);
        //        $.mobilities_storage.save();
        //        filter_table(_this);
        //    } else {
        //        mobilities = _.merge(ref_data, ref2_data, ref3_data);
        //        console.log(mobilities);
        //        $.mobilities_storage.save();
        //        setup_routing();
        //    }
        //    //mobilities = _.toArray(merged);
            
        //});



        //ref3.on("value", function (snapshot) {
        //    ref3_data = _.toArray(snapshot.val());
        //    load_data();
        //}, function (errorObject) {
        //        console.log("The read failed: " + errorObject.code);
        //    });
        //ref2.on("value", function (snapshot) {
        //    //console.log(snapshot.val());
        //    ref2_data = _.toArray(snapshot.val());
        //    load_data();
        //    //setTimeout(function () {
        //    //    var list = Firebase.getAsArray(norm2.ref());
        //    //}, 1);
        //}, function (errorObject) {
        //        console.log("The read failed: " + errorObject.code);
        //    });




        //ref.orderByChild("establishment").equalTo('3306').on("child_added", (snapshot) => {
        //    //console.log(snapshot.val());
        //    //mobility_snapshot = _.toArray(snapshot.val());
        //    //load_data(_this);
        //    //var self;
        //    var message: string = JSON.stringify((snapshot.val()));
        //    this.postMessage(message);
        //}, function (errorObject) {
        //        console.log("The read failed: " + errorObject.code);
        //    });


        //ref.orderByChild("establishment").equalTo('3306').once("value", (snapshot) => {
        //    //console.log(snapshot.val());
        //    //mobility_snapshot = _.toArray(snapshot.val());
        //    //load_data(_this);
        //    //var self;
        //    var message:string = JSON.stringify(_.toArray(snapshot.val()));
        //    this.postMessage(message);
        //}, function (errorObject) {
        //        console.log("The read failed: " + errorObject.code);
        //    });
        //return (ref);