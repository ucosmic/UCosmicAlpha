importScripts('/components/Polymer_1x/bower_components/rxjs/dist/rx.all.min.js');
importScripts('/components/Polymer_1x/bower_components/firebase/firebase.js');
importScripts('/components/polymer_1x/bower_components/firebase-util/dist/firebase-util.js');
importScripts('/components/Polymer_1x/bower_components/lodash/lodash.min.js');
var exports = Firebase;
importScripts('/components/utilities/firebase-as-array.js');
importScripts('/components/models/students.js');
var Student = Students;
self.addEventListener('message', function (e) {
    var fire_students = null, excel = '', sheet = JSON.parse(e.data.sheet), my_array = JSON.parse(e.data.my_array), fire_students_students = null, fire_establishments = null, fire_students_terms = null, fire_students_levels = null, fire_students_programs = null, fire_students_mobilities = null, fire_students_mobilities_join = null, fire_countries = null, establishment_list = [], country_list = [], term_list = [], level_list = [], program_list = [], controller = null, end_row = null, end_col = null, externalId = "", status = "", uCosmicAffiliation = "", level = "", rank = 0, termDescription = "", termStart = "", termEnd = "", country = "", progCode = 0, progDescription = "", uCosmicSubAffiliation = "", uCosmicForiegnAffiliation = "", tenant_id = e.data.tenant_id, created = function () {
        fire_students = new Firebase("https://UCosmic.firebaseio.com/Students");
        fire_students_students = new Firebase("https://UCosmic.firebaseio.com/Students/Students");
        fire_students_mobilities = new Firebase("https://UCosmic.firebaseio.com/Students/Mobilities");
        fire_students_terms = new Firebase("https://UCosmic.firebaseio.com/Students/Terms");
        fire_students_programs = new Firebase("https://UCosmic.firebaseio.com/Students/Programs");
        fire_students_levels = new Firebase("https://UCosmic.firebaseio.com/Students/Levels");
        fire_countries = new Firebase("https://UCosmic.firebaseio.com/Places/Countries");
        fire_establishments = new Firebase("https://UCosmic.firebaseio.com/Establishments/Establishments");
        var start_file_processing = _.after(5, function () {
            set_fire_students_mobilities_join(this);
        });
        fire_students_levels.once("value", function (snapshot) {
            level_list = snapshot.val();
            start_file_processing();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        fire_students_programs.once("value", function (snapshot) {
            program_list = snapshot.val();
            start_file_processing();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        fire_students_terms.once("value", function (snapshot) {
            term_list = snapshot.val();
            start_file_processing();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        fire_establishments.once("value", function (snapshot) {
            establishment_list = snapshot.val();
            start_file_processing();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        fire_countries.once("value", function (snapshot) {
            country_list = snapshot.val();
            start_file_processing();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    }, next_letter = function (s) {
        return s.replace(/([a-zA-Z])[^a-zA-Z]*$/, function (a) {
            var c = a.charCodeAt(0);
            switch (c) {
                case 90: return 'A';
                case 122: return 'a';
                default: return String.fromCharCode(++c);
            }
        });
    }, process_sheet_columns = function (sheet, col) {
        var col_name = sheet[col + 1].h.toLowerCase();
        switch (col_name) {
            case "externalid":
                externalId = col;
                break;
            case "ucosmicsubaffiliation":
                uCosmicSubAffiliation = col;
                break;
            case "ucosmicforeignaffiliation":
                uCosmicForiegnAffiliation = col;
                break;
            case "status":
                status = col;
                break;
            case "rank":
                rank = col;
                break;
            case "level":
                level = col;
                break;
            case "ucosmicaffiliation":
                uCosmicAffiliation = col;
                break;
            case "termstart":
                termStart = col;
                break;
            case "termend":
                termEnd = col;
                break;
            case "country":
                country = col;
                break;
            case "progcode":
                progCode = col;
                break;
            case "progdescription":
                progDescription = col;
                break;
            case "termdescription":
                termDescription = col;
                break;
        }
        var nextCol = next_letter(col);
        if (nextCol.charCodeAt(0) > end_col.charCodeAt(0)) {
            return;
        }
        else {
            return process_sheet_columns(sheet, nextCol);
        }
    }, process_sheet = function (row, student_activity_array) {
        if (sheet[externalId + row]) {
            var student = "3306_" + sheet[externalId + row].v;
            var externalId2 = sheet[externalId + row].v;
            var status2 = sheet[status + row].v;
            var level2 = "3306_" + sheet[level + row].v;
            var term2 = "3306_" + sheet[termDescription + row].v;
            var country2 = sheet[country + row].v;
            var progCode2 = sheet[progCode + row] ? sheet[progCode + row].v : 'null';
            var mobility_affiliation = sheet[uCosmicAffiliation + row] ? sheet[uCosmicAffiliation + row].v : 'null';
            var mobility_sub_affiliation = sheet[uCosmicSubAffiliation + row] ? sheet[uCosmicSubAffiliation + row].v : 'null';
            var mobility_foreign_affiliation = sheet[uCosmicForiegnAffiliation + row] ? sheet[uCosmicForiegnAffiliation + row].v : 'null';
            var options = {
                mobility_status: status2, mobility_level: level2, mobility_term: term2, mobility_country: country2, mobility_program: progCode2, mobility_establishment: tenant_id,
                mobility_affiliation: mobility_affiliation, mobility_sub_affiliation: mobility_sub_affiliation, mobility_foreign_affiliation: mobility_foreign_affiliation,
                mobility_student: student, student: student, student_external_id: externalId2,
            };
            var my_student_activity = new Student.Excel(options);
            student_activity_array.push(my_student_activity);
            row += 1;
            if (row > end_row) {
                return student_activity_array;
            }
            else {
                return process_sheet(row, student_activity_array);
            }
        }
        else {
            return student_activity_array;
        }
    }, test = function () {
        var list = Firebase.getAsArray(fire_students_mobilities_join);
    }, create_student_imports = function () {
        var student_original_data = Rx.Observable.fromArray(excel);
        var list = Firebase.getAsArray(fire_students_mobilities_join);
        var student_new_data = student_original_data
            .map(function (data) {
            data.mobility_country = _.findKey(country_list, { 'country': data.mobility_country }) ? _.findKey(country_list, { 'country': data.mobility_country }) : 'null';
            data.mobility_term = _.has(term_list, data.mobility_term.toLowerCase()) ? data.mobility_term.toLowerCase() : "false";
            data.mobility_level = _.has(level_list, data.mobility_level.toLowerCase()) ? data.mobility_level.toLowerCase() : "false";
            data.mobility_program = _.has(program_list, data.mobility_program.toString().replace(".", "_").toLowerCase()) ? data.mobility_program.toString().replace(".", "_").toLowerCase() : "false";
            data.mobility_establishment = data.mobility_establishment;
            data.mobility_affiliation = _.findKey(establishment_list, { 'establishment': data.mobility_affiliation }) ? _.findKey(establishment_list, { 'establishment': data.mobility_affiliation }) : 'null';
            data.mobility_sub_affiliation = _.findKey(establishment_list, { 'establishment': data.mobility_sub_affiliation }) ? _.findKey(establishment_list, { 'establishment': data.mobility_sub_affiliation }) : 'null';
            data.mobility_foreign_affiliation = _.findKey(establishment_list, { 'establishment': data.mobility_foreign_affiliation }) ? _.findKey(establishment_list, { 'establishment': data.mobility_foreign_affiliation }) : 'null';
            return data;
        });
        var subscription2 = student_new_data.subscribe(function (x) {
            x.mobility_program = x.mobility_program.toString().replace(".", "_");
            list.$set(x.mobility_term + "_" + x.student, x);
        }, function (err) {
            console.log('Error: ' + err);
        }, function () {
            console.log('Completed');
        });
    }, set_fire_students_mobilities_join = function (_this) {
        //_this = this;
        var norm = new Firebase.util.NormalizedCollection(fire_students_mobilities, [fire_students_students, 'Students', 'Mobilities.student']);
        norm.select({ key: 'Mobilities.student', alias: 'mobility_student' }, { key: 'Mobilities.level', alias: 'mobility_level' }, { key: 'Mobilities.term', alias: 'mobility_term' }, { key: 'Mobilities.establishment', alias: 'mobility_establishment' }, { key: 'Mobilities.country', alias: 'mobility_country' }, { key: 'Mobilities.program', alias: 'mobility_program' }, { key: 'Mobilities.status', alias: 'mobility_status' }, { key: 'Mobilities.affiliation', alias: 'mobility_affiliation' }, { key: 'Mobilities.foreign_affiliation', alias: 'mobility_foreign_affiliation' }, { key: 'Mobilities.sub_affiliation', alias: 'mobility_sub_affiliation' }, { key: 'Students.external_id', alias: 'student_external_id' });
        var ref = norm.ref();
        fire_students_mobilities_join = norm.ref();
        end_col = sheet["!ref"].substr(3, 1);
        end_row = sheet["!ref"].substr(4);
        process_sheet_columns(sheet, 'A');
        excel = process_sheet(2, my_array);
        create_student_imports();
    };
    created();
});
