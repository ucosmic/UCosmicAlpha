importScripts('/components/Polymer_1x/bower_components/rxjs/dist/rx.all.min.js');
importScripts('/components/Polymer_1x/bower_components/firebase/firebase.js');
importScripts('/components/polymer_1x/bower_components/firebase-util/dist/firebase-util.js');
importScripts('/components/Polymer_1x/bower_components/lodash/lodash.min.js');
var exports = Firebase;
importScripts('/components/utilities/firebase-as-array.js');
importScripts('/components/models/students.js');
import Student = Students; 

self.addEventListener('message', function (e) { 



    var fire_students = null,
        excel = '',
        sheet = JSON.parse(e.data.sheet),
        my_array = JSON.parse(e.data.my_array),
        //fire_students_students = null,
        fire_establishments = null,
        fire_students_terms = null,
        fire_students_levels = null,
        fire_students_programs = null,
        fire_students_mobilities = null,
        fire_students_mobilities_join = null,
        fire_countries = null,
        establishment_list = JSON.parse(e.data.establishment_list),
        country_list = JSON.parse(e.data.country_list),
        term_list = JSON.parse(e.data.term_list),
        level_list = JSON.parse(e.data.level_list),
        program_list = JSON.parse(e.data.program_list),
        controller = null,
        end_row = null,
        end_col = null,
        externalId = "",
        status = "",
        uCosmicAffiliation = "",
        level = "",
        rank = 0,
        termDescription = "",
        termStart = "",
        termEnd = "",
        country = "",
        progCode = 0,
        progDescription = "",
        uCosmicSubAffiliation = "",
        uCosmicForiegnAffiliation = "",
        tenant_id = e.data.tenant_id,
        //excel = [],
        //student_import_request = [],
        //created = function () {
        //    //controller = this;
        //    //my_fire = new Firebase("https://UCosmic.firebaseio.com");
        //    fire_students = new Firebase("https://UCosmic.firebaseio.com/Students");
        //    fire_students_students = new Firebase("https://UCosmic.firebaseio.com/Students/Students");
        //    fire_students_mobilities = new Firebase("https://UCosmic.firebaseio.com/Students/Mobilities");
        //    fire_students_terms = new Firebase("https://UCosmic.firebaseio.com/Students/Terms");
        //    fire_students_programs = new Firebase("https://UCosmic.firebaseio.com/Students/Programs");
        //    fire_students_levels = new Firebase("https://UCosmic.firebaseio.com/Students/Levels");
        //    fire_countries = new Firebase("https://UCosmic.firebaseio.com/Places/Countries");
        //    fire_establishments = new Firebase("https://UCosmic.firebaseio.com/Establishments/Establishments");

        //    var start_file_processing = _.after(5, function () {
        //        set_fire_students_mobilities_join(this);
        //    })

        //    //set_fire_students_mobilities_join(this);
        //    fire_students_levels.once("value", (snapshot) => {
        //        level_list = snapshot.val();
        //        start_file_processing();
        //    }, function (errorObject) {
        //            console.log("The read failed: " + errorObject.code);
        //        });
        //    fire_students_programs.once("value", (snapshot) => {
        //        program_list = snapshot.val();
        //        start_file_processing();
        //    }, function (errorObject) {
        //            console.log("The read failed: " + errorObject.code);
        //        });
        //    fire_students_terms.once("value", (snapshot) => {
        //        term_list = snapshot.val();
        //        start_file_processing();
        //    }, function (errorObject) {
        //            console.log("The read failed: " + errorObject.code);
        //        });
        //    fire_establishments.once("value", (snapshot) => {
        //        //console.log(snapshot.val());
        //        establishment_list = snapshot.val();
        //        start_file_processing();
        //        //test(this);
        //    }, function (errorObject) {
        //            console.log("The read failed: " + errorObject.code);
        //        });
        //    fire_countries.once("value", (snapshot) => {
        //        country_list = snapshot.val();
        //        start_file_processing();
        //    }, function (errorObject) {
        //            console.log("The read failed: " + errorObject.code);
        //        });
        //},
        next_letter = function (s) {
            return s.replace(/([a-zA-Z])[^a-zA-Z]*$/, function (a) {
                var c = a.charCodeAt(0);
                switch (c) {
                    case 90: return 'A';
                    case 122: return 'a';
                    default: return String.fromCharCode(++c);
                }
            });
        },
        process_sheet_columns = function (sheet, col) {
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
            } else {
                return process_sheet_columns(sheet, nextCol);
            }

        },


        process_sheet = function (row, student_activity_array: Students.Excel[]) {

        //}, externalId, uCosmicSubAffiliation, uCosmicForiegnAffiliation, status, rank, level
        //    , uCosmicAffiliation, termStart, termEnd, country, progCode, progDescription, termDescription) {
            //check both xls and xlsx or whatever
            if (sheet[externalId + row]) {
                var student = "3306_" + sheet[externalId + row].v;
                //var mobility_affiliation = uCosmicAffiliation;
                var externalId2 = sheet[externalId + row].v;
                var status2 = sheet[status + row].v;
                var level2 = "3306_" + sheet[level + row].v;
                //var level_establishment = uCosmicAffiliation;
                //var level_name = sheet[level + row].v;
                //var rank = sheet[rank + row].v;
                var term2 = "3306_" + sheet[termDescription + row].v;
                //var term_establishment = uCosmicAffiliation;
                //var termDescription = sheet[termDescription + row].v;
                //var termStart = sheet[termStart + row].w;
                //var termEnd = sheet[termEnd + row].w;
                var country2 = sheet[country + row].v;
                var progCode2 = sheet[progCode + row] ? sheet[progCode + row].v : 'null';
                //var program_establishment = uCosmicAffiliation;
                //var program_is_standard = true;//************** fix later ***********
                //var progDescription = sheet[progDescription + row] ? sheet[progDescription + row].v : null;
                // check here if has code or none code, don't add if does not have both
                var mobility_affiliation = sheet[uCosmicAffiliation + row] ? sheet[uCosmicAffiliation + row].v : 'null';
                var mobility_sub_affiliation = sheet[uCosmicSubAffiliation + row] ? sheet[uCosmicSubAffiliation + row].v : 'null';
                var mobility_foreign_affiliation = sheet[uCosmicForiegnAffiliation + row] ? sheet[uCosmicForiegnAffiliation + row].v : 'null';
                var options = {
                    mobility_status: status2, mobility_level: level2, mobility_term: term2, mobility_country: country2, mobility_program: progCode2, mobility_establishment: tenant_id,//mobility_establishment needs to come from mvc server
                    mobility_affiliation: mobility_affiliation, mobility_sub_affiliation: mobility_sub_affiliation, mobility_foreign_affiliation: mobility_foreign_affiliation,
                    mobility_student: student, student: student, student_external_id: externalId2,
                }
                var my_student_activity = new Student.Excel(options);

                student_activity_array.push(my_student_activity);
                row += 1;

                if (row > end_row) {
                    return student_activity_array;
                } else {
                    return process_sheet( row, student_activity_array);
                    //, externalId, uCosmicSubAffiliation, uCosmicForiegnAffiliation, status, rank, level
                    //    , uCosmicAffiliation, termStart, termEnd, country, progCode, progDescription, termDescription);
                }
            } else {
                return student_activity_array;
            }
        },
        test = function () {

            var list = Firebase.getAsArray(fire_students_mobilities_join);
        },

        create_student_imports = function () {
            //var student_response_data = Rx.Observable.fromArray(response.detail.response);
            var student_original_data = Rx.Observable.fromArray(excel);
            /*
        placeId: number;
        uCosmicAffiliationId: number;
        uCosmicSubAffiliationId: number;
        uCosmicForeignAffiliationId: number;*/
            //var student_data = Rx.Observable.combineLatest(student_original_data, student_response_data, (s1: Student.Excel, s2) => {
            //    //return s1;
            //    return new Student.Excel_Merged({
            //            external_id: s1.external_id, status: s1.status, level: s1.level, rank: s1.rank, term_name: s1.term_name, start_date: s1.start_date, end_date: s1.end_date, country_official_name: s1.country_official_name,
            //            student_establishment_official_name: s1.student_establishment_official_name, foreign_establishment_official_name: s1.foreign_establishment_official_name, establishment_official_name: s1.establishment_official_name,
            //            program: s1.program, program_name: s1.program_name,  establishment: s2.uCosmicAffiliationId, student_establishment: s2.uCosmicSubAffiliationId,
            //            foreign_establishment: s2.uCosmicForeignAffiliationId, country: s2.placeId
            //    })
            //});

        
            //list.$add({
            //    external_id: "New 234jkasd3",
            //    level: "1",
            //    name: "graduate",
            //    rank: "1",
            //    status: "in",
            //    student: "2"
            //});
            //var list = get_mobility_list(_this);
            var list = Firebase.getAsArray(fire_students_mobilities_join);


            var student_new_data = student_original_data
                .map((data: Student.Excel) => {
                data.mobility_country = _.findKey(country_list, { 'country': data.mobility_country }) ? _.findKey(country_list, { 'country': data.mobility_country }) : 'null';
                data.mobility_term = _.has(term_list, data.mobility_term.toLowerCase()) ? data.mobility_term.toLowerCase() : "false";
                data.mobility_level = _.has(level_list, data.mobility_level.toLowerCase()) ? data.mobility_level.toLowerCase() : "false";
                data.mobility_program = _.has(program_list, data.mobility_program.toString().replace(".", "_").toLowerCase()) ? data.mobility_program.toString().replace(".", "_").toLowerCase() : "false";
                data.mobility_establishment = data.mobility_establishment;//_.findKey(establishment_list, { 'establishment': data.mobility_establishment }) ? _.findKey(establishment_list, { 'establishment': data.mobility_establishment }) : 'null';
                data.mobility_affiliation = _.findKey(establishment_list, { 'establishment': data.mobility_affiliation }) ? _.findKey(establishment_list, { 'establishment': data.mobility_affiliation }) : 'null';
                data.mobility_sub_affiliation = _.findKey(establishment_list, { 'establishment': data.mobility_sub_affiliation }) ? _.findKey(establishment_list, { 'establishment': data.mobility_sub_affiliation }) : 'null';
                data.mobility_foreign_affiliation = _.findKey(establishment_list, { 'establishment': data.mobility_foreign_affiliation }) ? _.findKey(establishment_list, { 'establishment': data.mobility_foreign_affiliation }) : 'null';


                return data;
            });

            //var student_new_data = student_original_data.zip(
            //    student_original_data,
            //    Rx.Observable.from(establishment_list),
            //    function (s1, s2, s3) {
            //        return s1 + ':' + s2 + ':' + s3;
            //    }
            //    );

            //country_list = Object.keys(country_list).map(function (k) { return country_list[k] });
            //var student_mobility_country = student_original_data
            //    .flatMap((data: Student.Excel) => {
            //        return Rx.Observable.just(_.findKey(country_list, { 'country': data.mobility_country }));
            //    });
            //var student_mobility_term = student_original_data
            //    .flatMap((data: Student.Excel) => {
            //        return Rx.Observable.just(_.has(term_list, data.mobility_term.toLowerCase()));//_.findKey(term_list, { 'term': data.mobility_term.toLowerCase() });
            //    });
            //var student_mobility_level = student_original_data
            //    .flatMap((data: Student.Excel) => {
            //        return Rx.Observable.just(_.has(level_list, data.mobility_level.toLowerCase()));//_.findKey(level_list, { 'level': data.mobility_level.toLowerCase() });
            //    });
            //var student_mobility_program = student_original_data
            //    .flatMap((data: Student.Excel) => {
            //        return Rx.Observable.just(_.has(program_list, data.mobility_program.toString().replace(".", "_")));
            //    });
            //var student_mobility_establishment = student_original_data
            //    .flatMap((data: Student.Excel) => {
            //    return Rx.Observable.fromArray(establishment_list)
            //        .findIndex(function (x: any, i, obs) {
            //        if (!x) {
            //            return null;
            //        } else {
            //            return x.establishment === data.mobility_establishment;
            //        }
            //    });
            //    });
            //var student_establishment_observer = student_original_data
            //    .flatMap((data: Student.Excel) => {
            //    return Rx.Observable.fromArray(establishment_list)
            //        .findIndex(function (x: any, i, obs) {
            //        if (!x) {
            //            return null;
            //        } else {
            //            return x.establishment === data.student_establishment;
            //        }
            //    });
            //    });
            //var student_mobility_student_establishment = student_original_data
            //    .flatMap((data: Student.Excel) => {
            //    return Rx.Observable.fromArray(establishment_list)
            //        .findIndex(function (x: any, i, obs) {
            //        if (!x) {
            //            return null;
            //        } else {
            //            return x.establishment === data.mobility_student_establishment;
            //        }
            //    });
            //    });
            //var student_mobility_student_foreign_establishment = student_original_data
            //    .flatMap((data: Student.Excel) => {
            //    return Rx.Observable.fromArray(establishment_list)
            //        .findIndex(function (x: any, i, obs) {
            //        if (!x) {
            //            return null;
            //        } else {
            //            return x.establishment === data.mobility_student_foreign_establishment;
            //        }
            //    });
            //});
            //var student_new_data = Rx.Observable.combineLatest(student_original_data, student_mobility_establishment, student_mobility_country, student_mobility_term, student_mobility_level, student_mobility_program
            //    , student_establishment_observer, student_mobility_student_establishment, student_mobility_student_foreign_establishment
            //    , (s1: Student.Excel, mobility_establishment, mobility_country, mobility_term, mobility_level, mobility_program, student_establishment, mobility_student_establishment, mobility_student_foreign_establishment) => {
            //    //return s1;

            //    var options = {
            //        mobility_status: s1.mobility_status, mobility_level: mobility_level ? s1.mobility_level : "-1", mobility_term: mobility_term ? s1.mobility_term : "-1", mobility_country: mobility_country
            //        , mobility_program: mobility_program ? s1.mobility_program : "-1", mobility_establishment: mobility_establishment, mobility_student_foreign_establishment: mobility_student_foreign_establishment
            //        , mobility_student_establishment: mobility_student_establishment
            //        , mobility_student: s1.mobility_student, student_establishment: student_establishment, student: s1.student, student_external_id: s1.student_external_id
            //    }
            //    var my_student_activity = new Student.Excel(options);
            //    return my_student_activity
            //});


            //var x2 = student_original_data.toArray();
            var subscription2 = student_new_data.subscribe(
                function (x: Student.Excel) {
                    x.mobility_program = x.mobility_program.toString().replace(".", "_");
                    //console.log(x);

                    // ************************ here do the error checking, use the other ref's like terms and make sure it exists ***********************
                    list.$set(x.mobility_term + "_" + x.student, x);
                },
                function (err) {
                    console.log('Error: ' + err);
                },
                function () {
                    console.log('Completed');
                });

        },
        set_fire_students_mobilities_join = function () {
            //_this = this;

            //fire_students = my_fire.child("Students");
            //fire_students_mobilities = my_fire.child("Mobilities");// new Firebase("https://UCosmic.firebaseio.com/Students/Mobilities")
            //var list3 = Firebase.getAsArray(fire_students_mobilities);

            //var list3 = Firebase.getAsArray(fire_students_mobilities); 

            var norm = new Firebase.util.NormalizedCollection(
                fire_students_mobilities,  // alias is "widgets1"
                [fire_students_students, 'Students', 'Mobilities.student']
            //,[fire_students_levels, 'Levels', 'Mobilities.level']
            //, [fire_students_terms, 'Terms', 'Mobilities.term']
            //, [fire_countries, 'Countries', 'Mobilities.country']
            //, [fire_students_programs, 'Programs', 'Mobilities.program']
            //, [fire_establishments, 'Establishments', 'Mobilities.establishment']
                );
            //norm = norm.filter(function (data, key, priority) {
            //    return data.external_id === '2345dd';
            //});
            //norm.select('Mobilities.student', 'Mobilities.level', 'Mobilities.term', 'Mobilities.establishment', 'Mobilities.country', 'Mobilities.program', 'Mobilities.status',
            //    'Mobilities.foreign_establishmente', 'Mobilities.student_establishment'
            //    //,{ key: 'Students.external_id', alias: 'Students_external_id' }, { key: 'Students.establishment', alias: 'student_establishment2' }, { key: 'Levels.name', alias: 'level_name' }
            //    //, 'Levels.rank', 'Terms.start_date', 'Terms.end_date', { key: 'Terms.name', alias: 'term_name' }, { key: 'Programs.name', alias: 'program_name' }
            //    );
            norm.select({ key: 'Mobilities.student', alias: 'mobility_student' }, { key: 'Mobilities.level', alias: 'mobility_level' }, { key: 'Mobilities.term', alias: 'mobility_term' }
                , { key: 'Mobilities.establishment', alias: 'mobility_establishment' }, { key: 'Mobilities.country', alias: 'mobility_country' }
                , { key: 'Mobilities.program', alias: 'mobility_program' }, { key: 'Mobilities.status', alias: 'mobility_status' }
                , { key: 'Mobilities.affiliation', alias: 'mobility_affiliation' }, { key: 'Mobilities.foreign_affiliation', alias: 'mobility_foreign_affiliation' }
                , { key: 'Mobilities.sub_affiliation', alias: 'mobility_sub_affiliation' }
                , { key: 'Students.external_id', alias: 'student_external_id' }
            //, { key: 'Levels.name', alias: 'level_name' }, 'Levels.rank', 'Terms.start_date', 'Terms.end_date', { key: 'Terms.name', alias: 'term_name' }, { key: 'Programs.name', alias: 'program_name' }
                );
            //norm.select('Mobilities.student', 'Mobilities.level', 'Mobilities.term', 'Mobilities.establishment', 'Mobilities.country', 'Mobilities.program', 'Mobilities.status',
            //    'Mobilities.foreign_establishmente', 'Mobilities.student_establishment',
            //    'Students.external_id', { key: 'Students.establishment', alias: 'students_establishment' }, { key: 'Levels.name', alias: 'level_name' }, 'Levels.rank', 'Terms.start_date', 'Terms.end_date', { key: 'Terms.name', alias: 'term_name' }
            //    , { key: 'Establishments.official_name', alias: 'establishment_official_name' }, { key: 'Countries.official_name', alias: 'country_official_name' },
            //    { key: 'Programs.name', alias: 'program_name' }
            //    );
            var ref = norm.ref();
            //var norm2 = new Firebase.util.NormalizedCollection(
            //    new Firebase("https://UCosmic.firebaseio.com/Students/Programs"),  // alias is "widgets1"
            //    [ref, 'Mobilities', 'Programs.code']
            //    );

            //norm2.select('Programs.code', 'Mobilities.student', 'Mobilities.level', 'Mobilities.term', 'Mobilities.establishment', 'Mobilities.country', 'Mobilities.program', 'Mobilities.status',
            //    'Mobilities.foreign_establishment', 'Mobilities.student_establishment', 
            //    'Mobilities.external_id', 'Mobilities.level_name', 'Mobilities.rank', 'Mobilities.start_date', 'Mobilities.end_date', 'Mobilities.term_description',
            //    'Mobilities.establishment_name', 'Mobilities.country_name', 'Mobilities.program_code');
            //var ref2 = norm.ref();
            //var list = Firebase.getAsArray(ref2); 
            //var list = Firebase.getAsArray(ref);
            //ref.on("value", function (snapshot) {
            //    console.log(snapshot.val());
            //    setTimeout(function () {
            //        fire_students_mobilities_join = norm.ref();
            //        var list = Firebase.getAsArray(fire_students_mobilities_join);
            //    }, 1);
            //}, function (errorObject) {
            //        console.log("The read failed: " + errorObject.code);
            //    });

            fire_students_mobilities_join = norm.ref();
            end_col = sheet["!ref"].substr(3, 1);
            end_row = sheet["!ref"].substr(4);
            process_sheet_columns(sheet, 'A'); // may need to impliment => http://raganwald.com/2013/03/28/trampolines-in-javascript.html
            excel = process_sheet( 2, my_array);
            //, externalId, uCosmicSubAffiliation, uCosmicForiegnAffiliation, status, rank, level
            //    , uCosmicAffiliation, termStart, termEnd, country, progCode, progDescription, termDescription);
            create_student_imports(); 
            //return (ref);
        }
        

    //created();
    set_fire_students_mobilities_join();
});