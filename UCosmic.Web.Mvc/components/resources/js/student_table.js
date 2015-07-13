importScripts('/components/Polymer_1x/bower_components/firebase/firebase.js');
importScripts('/components/Polymer_1x/bower_components/lodash/lodash.min.js');
self.addEventListener('message', function (e) {
    var join_refs = function () {
        var _this = this;
        var mobility_list = [], country_list, level_list, program_list, establishment_list, term_list, student_list;
        var fire_students_mobilities = new Firebase("https://UCosmic.firebaseio.com/Students/Mobilities"), fire_students_students = new Firebase("https://UCosmic.firebaseio.com/Students/Students"), fire_students_terms = new Firebase("https://UCosmic.firebaseio.com/Students/Terms"), fire_students_levels = new Firebase("https://UCosmic.firebaseio.com/Students/Levels"), fire_establishments = new Firebase("https://UCosmic.firebaseio.com/Establishments/Establishments"), fire_students_programs = new Firebase("https://UCosmic.firebaseio.com/Students/Programs"), fire_countries = new Firebase("https://UCosmic.firebaseio.com/Places/Countries"), fire_students_mobilities = new Firebase("https://UCosmic.firebaseio.com/Students/Mobilities");
        var all_loaded = false, temp_snapshot = [];
        var load_data = _.after(5, function (_this2) {
            all_loaded = true;
        });
        fire_establishments.once("value", function (snapshot) {
            establishment_list = _.map(snapshot.val(), function (value, index) {
                if (value) {
                    var object = { _id: index, text: value.establishment };
                    return object;
                }
            });
            _this.postMessage({
                'type': 'establishment_list',
                'value': JSON.stringify(establishment_list)
            });
            load_data(_this);
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        fire_students_levels.orderByChild("establishment").equalTo('3306').once("value", function (snapshot) {
            level_list = _.map(snapshot.val(), function (value, index) {
                if (value) {
                    var object = { _id: index, text: value.name };
                    return object;
                }
            });
            _this.postMessage({
                'type': 'level_list',
                'value': JSON.stringify(level_list)
            });
            load_data(_this);
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        fire_countries.once("value", function (snapshot) {
            country_list = _.map(snapshot.val(), function (value, index) {
                if (value) {
                    var object = { _id: index, text: value.country };
                    return object;
                }
            });
            _this.postMessage({
                'type': 'country_list',
                'value': JSON.stringify(country_list)
            });
            load_data(_this);
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        fire_students_programs.once("value", function (snapshot) {
            program_list = _.map(snapshot.val(), function (value, index) {
                if (value) {
                    var object = { _id: index, text: value.name };
                    return object;
                }
            });
            _this.postMessage({
                'type': 'program_list',
                'value': JSON.stringify(program_list)
            });
            load_data(_this);
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        fire_students_terms.orderByChild("establishment").equalTo('3306').once("value", function (snapshot) {
            term_list = _.map(snapshot.val(), function (value, index) {
                if (value) {
                    var object = { _id: index, text: value.name };
                    return object;
                }
            });
            _this.postMessage({
                'type': 'term_list',
                'value': JSON.stringify(term_list)
            });
            load_data(_this);
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        var mobility_snapshot = [];
        var counter = 0;
        var _this2 = this;
        function call_start_setup_filter() {
            this.postMessage({
                'type': 'mobility_list',
                'value': JSON.stringify(mobility_list)
            });
            console.log(counter++);
        }
        var debounce = _.throttle(call_start_setup_filter, 100, {
            'maxWait': 500
        });
        fire_students_mobilities.orderByChild("establishment").equalTo('3306').on("child_added", function (snapshot) {
            var snapshot_value = snapshot.val();
            snapshot_value.key = snapshot.key();
            temp_snapshot.push(snapshot_value);
            if (all_loaded) {
                _.forEach(temp_snapshot, function (value) {
                    mobility_list.push({
                        key: value.key,
                        country_name: _.result(_.find(country_list, { '_id': value.country }), 'text'),
                        level_name: _.result(_.find(level_list, { '_id': value.level }), 'text'),
                        program_name: _.result(_.find(program_list, { '_id': value.program }), 'text'),
                        student_name: _.result(_.find(student_list, { '_id': value.student }), 'text'),
                        term_name: _.result(_.find(term_list, { '_id': value.term }), 'text'),
                        status: value.status == 'IN' ? "In Coming" : "Out Going",
                        affiliation_name: establishment_list[value.affiliation] ? establishment_list[value.affiliation].text : "",
                        sub_affiliation_name: establishment_list[value.sub_affiliation] ? establishment_list[value.sub_affiliation].text : "",
                        foreign_affiliation_name: establishment_list[value.foreign_affiliation] ? establishment_list[value.foreign_affiliation].text : "",
                    });
                });
                temp_snapshot = [];
                debounce();
            }
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    };
    join_refs();
});
