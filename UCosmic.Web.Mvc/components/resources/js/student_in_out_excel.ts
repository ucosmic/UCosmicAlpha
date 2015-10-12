importScripts('/components/Polymer_1x/bower_components/rxjs/dist/rx.all.min.js');
importScripts('/components/Polymer_1x/bower_components/firebase/firebase.js');
//importScripts('/components/polymer_1x/bower_components/firebase-util/dist/firebase-util.js');
importScripts('/components/Polymer_1x/bower_components/lodash/lodash.min.js');
//var exports = Firebase;
//importScripts('/components/utilities/firebase-as-array.js');
importScripts('/components/models/students.js');
import Student = Students;

self.addEventListener('message', function (e: any) {

    function find_by_key(obj, key) {
        if (_.has(obj, key)) // or just (key in obj)
            return [obj];
        // elegant:
        return _.flatten(_.map(obj, function (v) {
            return typeof v == "object" ? find_by_key(v, key) : [];
        }), true);

        // or efficient:
        var res = [];
        _.forEach(obj, function (v) {
            if (typeof v == "object" && (v = find_by_key(v, key)).length)
                res.push.apply(res, v);
        });
        return res;
    }

    var excel = '',
        sheet = JSON.parse(e.data.sheet),
        my_array = JSON.parse(e.data.my_array),
        //fire_students_students = null,
        fire_establishments = null,
        fire_students_terms = null,
        fire_students_levels = null,
        fire_students_programs = null,
        fire_members = new Firebase("https://UCosmic.firebaseio.com/Members/"),
        //fire_students = new Firebase("https://UCosmic.firebaseio.com/Students/Mobilities"),
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
        //termStart = "",
        //termEnd = "",
        country = "",
        progCode = 0,
        //progDescription = "",
        uCosmicStudentAffiliation = "",
        uCosmicForiegnAffiliation = "",
        tenant_id = e.data.tenant_id,
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
                case "ucosmicstudentaffiliation":
                    uCosmicStudentAffiliation = col;
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
                //case "termstart":
                //    termStart = col;
                //    break;
                //case "termend":
                //    termEnd = col;
                //    break;
                case "country":
                    country = col;
                    break;
                case "progcode":
                    progCode = col;
                    break;
                //case "progdescription":
                //    progDescription = col;
                //    break;
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

            //check both xls and xlsx or whatever
            if (sheet[externalId + row]) {
                //var student = "3306_" + sheet[externalId + row].v;
                //var mobility_affiliation = uCosmicAffiliation;
                var externalId2 = sheet[externalId + row].v;
                var status2 = sheet[status + row].v;
                var level2 = sheet[level + row].v;
                var term2 = sheet[termDescription + row].v;
                var term: any = _.find(term_list, { 'name': term2 });
                //var term_start = term.start_date;
                //var term_end = term.end_date;
                var country2 = sheet[country + row].v;
                var progCode2 = sheet[progCode + row] ? sheet[progCode + row].v.toFixed(4) : 'none';
                //var progDesc2 = sheet[progDescription + row] ? sheet[progDescription + row].v : 'none';
                //var program_is_standard = true;//************** fix later ***********
                // check here if has code or none code, don't add if does not have both
                var affiliation = sheet[uCosmicAffiliation + row] ? sheet[uCosmicAffiliation + row].v : 'none';
                var student_affiliation = sheet[uCosmicStudentAffiliation + row] ? sheet[uCosmicStudentAffiliation + row].v : 'none';
                var foreign_affiliation = sheet[uCosmicForiegnAffiliation + row] ? sheet[uCosmicForiegnAffiliation + row].v : 'none';
                var options = {
                    status: status2, level: level2, term: term2, country: country2, program: progCode2, establishment: tenant_id,//establishment needs to come from mvc server
                    affiliation: affiliation, student_affiliation: student_affiliation, foreign_affiliation: foreign_affiliation,
                    student_external_id: externalId2
                }
                var my_student_activity = new Student.Excel(options);

                student_activity_array.push(my_student_activity);
                row += 1;

                if (row > end_row) {
                    return student_activity_array;
                } else {
                    return process_sheet(row, student_activity_array);
                }
            } else {
                return student_activity_array;
            }
        },
        //test = function () {

        //    var list = Firebase.getAsArray(fire_students_mobilities);
        //},

        create_student_imports = function () {
            var student_original_data = Rx.Observable.fromArray(excel);
            //var list = Firebase.getAsArray(fire_students_mobilities);
            var _this = this, excel_length = excel.length, count_2 = 0;

            var student_new_data = student_original_data
                .map((data: Student.Excel, index) => {
                var program_id = "";
                if (data.program) {
                    program_id = data.program.toString().replace(".", "_");
                    program_id = _.find(program_list, { 'id': program_id }) ? data.program.toString().replace(".", "_") : "";
                }
                //program_id.toString().replace(".", "_");
                var program_name: any = data.program_name ? data.program_name : _.find(program_list, { 'id': program_id }) ? _.find(program_list, { 'id': program_id }) : 'none';
                if (program_name && program_name.name) {
                    program_name = program_name.name;
                }
                var response = {
                    country_id: _.findKey(country_list, { 'country': data.country }) ? _.findKey(country_list, { 'country': data.country }) : ''
                    , status: data.status
                    , country_name: data.country
                    , term_name: data.term
                //, term_start: data.term_start
                //, term_end: data.term_end
                    , program_id: program_id
                    , program_name: program_name
                    , level: data.level
                    , establishment_id: data.establishment
                    , affiliation_id: _.findKey(establishment_list, { 'establishment': data.affiliation }) ? _.findKey(establishment_list, { 'establishment': data.affiliation }) : 'none'
                    , student_affiliation_id: _.findKey(establishment_list, { 'establishment': data.student_affiliation }) ? _.findKey(establishment_list, { 'establishment': data.student_affiliation }) : 'none'
                    , foreign_affiliation_id: _.findKey(establishment_list, { 'establishment': data.foreign_affiliation }) ? _.findKey(establishment_list, { 'establishment': data.foreign_affiliation }) : 'none'
                    , affiliation_name: data.affiliation
                    , student_affiliation_name: data.student_affiliation
                    , foreign_affiliation_name: data.foreign_affiliation
                    , student_external_id: data.student_external_id
                }
                _this.postMessage('Processing: ' + index + "/" + excel_length + " %" + ((index / excel_length) * 100).toFixed(2));

                return response;
            });

            function process_response() {
                count_2 += 1;
                if ((count_2 / 2) != excel_length) {
                    if (!(count_2 % 2)) {
                        _this.postMessage('Uploading: ' + (count_2 / 2) + "/" + excel_length + " %" + (((count_2 / 2) / excel_length) * 100).toFixed(2));
                    }
                } else {
                    _this.postMessage('Completed!');
                }
            }
            var has_error = false;

            var subscription2 = student_new_data.subscribe(
                function (x: any) {
                    //x.mobility_program = x.mobility_program.toString().replace(".", "_");
                    //console.log(x);

                    // ************************ here do the error checking, use the other ref's like terms and make sure it exists ***********************
                    //list.$set(x.mobility_term + "_" + x.student, x);
                    //var fire_students_mobilities_tenant = fire_students.child(tenant_id);
                    var status = x.status;
                    var country = x.country_name;
                    var affiliation_name = x.affiliation_name.replace(".", " ").replace("/", " ");
                    affiliation_name = affiliation_name.replace(".", " ").replace("/", " ");
                    //var mobility_id = x.term_name + "_" + x.student_external_id;
                    var level = _.findKey(level_list, { 'name': x.level }) ? _.findKey(level_list, { 'name': x.level }) : 'none';
                    var foreign_affiliation_name = x.foreign_affiliation_name.replace(".", " ").replace("/", " ");
                    var student_affiliation_name = x.student_affiliation_name.replace(".", " ").replace("/", " ");
                    foreign_affiliation_name = foreign_affiliation_name.replace(".", " ").replace("/", " ");
                    student_affiliation_name = student_affiliation_name.replace(".", " ").replace("/", " ");
                    var term = x.term_name;
                    var program = x.program_name.replace(".", " ").replace("/", " ");
                    var rank: any = _.find(level_list, { name: x.level });
                    rank = rank.rank;
                    program = program.replace(".", " ").replace("/", " ");

                    var student = { external_id: x.student_external_id }
                    var fire_members_tenant = fire_members.child(tenant_id);
                    //var mobility = { a: x.affiliation_id, c: x.country_id, e: x.establishment_id, f: x.foreign_affiliation_id, l: x.level, p: x.program_id, s: status, sa: x.student_affiliation_id, t: x.term_name }
                    var mobility = { affiliation: x.affiliation_id, country: x.country_id, foreign_affiliation: x.foreign_affiliation_id, level: level, program: x.program_id, status: status, student_affiliation: x.student_affiliation_id, term: x.term_name }

                    fire_members_tenant.child('Mobilities').child('Values').child(status).child(x.term_name).child(x.student_external_id).set(mobility, (error) => {
                        if (!has_error) {
                            if (error) {
                                has_error = true;
                                _this.postMessage('Error uploading, please try again - (' + error + ')');
                            }
                            process_response()
                        }
                    });

                    fire_members_tenant.child('Students').child(x.student_external_id).set(student, (error) => {
                        process_response()
                    });

                    
                    //fire_members_tenant.child('Mobilities').child('Keys').child(term).child(status).child(affiliation_name).child(level).child(student_affiliation_name).child(foreign_affiliation_name).child(program).child(country).child(x.student_external_id).set(student, (error) => {
                    //    if (!has_error) {
                    //        if (error) {
                    //            has_error = true;
                    //            _this.postMessage('Error uploading, please try again - (' + error + ')');
                    //        }
                    //        process_response()
                    //    }
                    //});
                    //var indexes_value = {};
                    //indexes_value[mobility_id] = true;
                    //var indexes = {};
                    //indexes[status] = {
                    //    'By_terms': {}
                    //    //, 'Mobilities': {
                    //    //    mobility_id: true
                    //    //}
                    //}
                    //indexes[status].By_terms[term] = {
                    //    'By_affiliations': {}
                    //    //, 'Mobilities': {
                    //    //    mobility_id: true
                    //    //}
                    //}
                    //indexes[status].By_terms[term].By_affiliations[affiliation_name] = {
                    //    'By_programs': {}
                    //    //, 'Mobilities': {
                    //    //    mobility_id: true
                    //    //}
                    //}
                    //indexes[status].By_terms[term].By_affiliations[affiliation_name].By_programs[program] = {
                    //    'By_countries': {}
                    //    //, 'Mobilities': {
                    //    //    mobility_id: true
                    //    //}
                    //}
                    //indexes[status].By_terms[term].By_affiliations[affiliation_name].By_programs[program].By_countries[country] = {
                    //    'By_levels': {}
                    //    //, 'Mobilities': {
                    //    //    mobility_id: true
                    //    //}
                    //}
                    //indexes[status].By_terms[term].By_affiliations[affiliation_name].By_programs[program].By_countries[country].By_levels[level] = {
                    //    'By_student_affiliations': {}
                    //    //, 'Mobilities': {
                    //    //    mobility_id: true
                    //    //}
                    //}
                    //indexes[status].By_terms[term].By_affiliations[affiliation_name].By_programs[program].By_countries[country].By_levels[level].By_student_affiliations[student_affiliation_name] = {
                    //    'By_foreign_affiliations': {}
                    //    //, 'Mobilities': {
                    //    //    mobility_id: true
                    //    //}
                    //}
                    //indexes[status].By_terms[term].By_affiliations[affiliation_name].By_programs[program].By_countries[country].By_levels[level].By_student_affiliations[student_affiliation_name].By_foreign_affiliations[foreign_affiliation_name] = {
                    //    'By_mobilities': {}
                    //    //'Mobilities': {
                    //    //    mobility_id: true
                    //    //}
                    //}
                    //indexes[status].By_terms[term].By_affiliations[affiliation_name].By_programs[program].By_countries[country].By_levels[level].By_student_affiliations[student_affiliation_name].By_foreign_affiliations[foreign_affiliation_name].By_mobilities[mobility_id] = true



                    //var indexes_old = {
                    //    status: {
                    //        'By_term': {
                    //            term: {
                    //                'By_affiliation': {
                    //                    affiliation_name: {
                    //                        'By_countries': {
                    //                            country: {
                    //                                'By_levels': {
                    //                                    level: {
                    //                                        'By_student_affiliations': {
                    //                                            student_affiliation_name: {
                    //                                                'By_foreign_affiliations': {
                    //                                                    foreign_affiliation_name: {
                    //                                                        'Mobilities': {
                    //                                                            mobility_id: true
                    //                                                        }
                    //                                                    }
                    //                                                }
                    //                                                , 'Mobilities': {
                    //                                                    mobility_id: true
                    //                                                }
                    //                                            }
                    //                                        }
                    //                                        , 'Mobilities': {
                    //                                            mobility_id: true
                    //                                        }
                    //                                    }
                    //                                }
                    //                                , 'Mobilities': {
                    //                                    mobility_id: true
                    //                                }
                    //                            }
                    //                        }
                    //                        , 'Mobilities': {
                    //                            mobility_id: true
                    //                        },
                    //                    }
                    //                }
                    //                , 'Mobilities': {
                    //                    mobility_id: true
                    //                }
                    //            }
                    //        }
                    //        , 'Mobilities': {
                    //            mobility_id: true
                    //        }
                    //    }
                    //}
                    //fire_students_mobilities_tenant.child('By_status').child(status).child('By_terms').child(term).child('By_affiliations').child(affiliation_name)
                    //    .child('By_programs').child(program).child('By_countries').child(country).child('By_levels').child(level).child('By_student_affiliations').child(student_affiliation_name)
                    //    .child('By_foreign_affiliation').child(foreign_affiliation_name).child('By_mobilities').set(indexes_value, (error) => {
                    //    process_response()
                    //});
                    //var fire_members_tenant = fire_members.child(tenant_id);
                    //var fire_members_tenant_mobility = fire_members_tenant.child('Mobilities').child('Values').child(mobility_id); 
                    //fire_members_tenant_mobility.set({ student: x.student_external_id }, (error) => {//*** may not need to store the whole mobility? could just store the student_id
                    //    if (!has_error) {
                    //        if (error) {
                    //            has_error = true;
                    //            _this.postMessage('Error uploading, please try again - (' + error + ')');
                    //        }
                    //        process_response()
                    //    }
                    //});
                    //term should be faster since term will have less results and it will be defaulted to a term.
                    //fire_members.child(tenant_id).child('Mobilities').child('Keys').child(term).child(status).child(country).child(affiliation_name).child(level).child(program).child(student_affiliation_name).child(foreign_affiliation_name).child(mobility_id).set(true, (error) => {

                    //fire_members_tenant_mobility_keys_term_status.child('Level').child(level).child('Mobilities').child(mobility_id).set(true, (error) => {

                    //    if (!has_error) {
                    //        if (error) {
                    //            has_error = true;
                    //            _this.postMessage('Error uploading, please try again - (' + error + ')');
                    //        }
                    //        process_response()
                    //    }
                    //});
                    //fire_members_tenant_mobility_keys_term_status.child('Program').child(program).child('Mobilities').child(mobility_id).set(true, (error) => {

                    //    if (!has_error) {
                    //        if (error) {
                    //            has_error = true;
                    //            _this.postMessage('Error uploading, please try again - (' + error + ')');
                    //        }
                    //        process_response()
                    //    }
                    //});
                    //fire_members_tenant_mobility_keys_term_status.child('Term').child(term).child('Mobilities').child(mobility_id).set(true, (error) => {

                    //    if (!has_error) {
                    //        if (error) {
                    //            has_error = true;
                    //            _this.postMessage('Error uploading, please try again - (' + error + ')');
                    //        }
                    //        process_response()
                    //    }
                    //});
                    //fire_members_tenant_mobility_keys_term_status.child('Affiliation').child(affiliation_name).child('Mobilities').child(mobility_id).set(true, (error) => {

                    //    if (!has_error) {
                    //        if (error) {
                    //            has_error = true;
                    //            _this.postMessage('Error uploading, please try again - (' + error + ')');
                    //        }
                    //        process_response()
                    //    }
                    //});
                    //fire_members_tenant_mobility_keys_term_status.child('Student_Affiliation').child(student_affiliation_name).child('Mobilities').child(mobility_id).set(true, (error) => {

                    //    if (!has_error) {
                    //        if (error) {
                    //            has_error = true;
                    //            _this.postMessage('Error uploading, please try again - (' + error + ')');
                    //        }
                    //        process_response()
                    //    }
                    //});
                    //fire_members_tenant_mobility_keys_term_status.child('Foreign_Affiliation').child(foreign_affiliation_name).child('Mobilities').child(mobility_id).set(true, (error) => {

                    //    if (!has_error) {
                    //        if (error) {
                    //            has_error = true;
                    //            _this.postMessage('Error uploading, please try again - (' + error + ')');
                    //        }
                    //        process_response()
                    //    }
                    //});
                    //fire_members_tenant_mobility_keys_term_status.child('Country').child(country).child('Mobilities').child(mobility_id).set(true, (error) => {

                    //    if (!has_error) {
                    //        if (error) {
                    //            has_error = true;
                    //            _this.postMessage('Error uploading, please try again - (' + error + ')');
                    //        }
                    //        process_response()
                    //    }
                    //});


                },
                function (err) {
                    console.log('Error: ' + err);
                },
                function () {
                    console.log('Completed');
                });

        },
        //set_fire_students_mobilities_join = function () {

        //    var norm = new Firebase.util.NormalizedCollection(
        //        fire_students_mobilities,  // alias is "widgets1"
        //        //[fire_students_students, 'Students', 'Mobilities.student']
        //        );
        //    norm.select({ key: 'Mobilities.student', alias: 'mobility_student' }
        //        , { key: 'Mobilities.level', alias: 'mobility_level' }, { key: 'Mobilities.level_rank', alias: 'mobility_level_rank' }
        //        , { key: 'Mobilities.term', alias: 'mobility_term' }, { key: 'Mobilities.term_start', alias: 'mobility_term_end' }, { key: 'Mobilities.term', alias: 'mobility_term' }
        //        , { key: 'Mobilities.establishment', alias: 'mobility_establishment' }
        //        , { key: 'Mobilities.country', alias: 'mobility_country' }, { key: 'Mobilities.country_name', alias: 'mobility_country_name' }
        //        , { key: 'Mobilities.program', alias: 'mobility_program' }, { key: 'Mobilities.program_name', alias: 'mobility_program_name' }
        //        , { key: 'Mobilities.status', alias: 'mobility_status' }
        //        , { key: 'Mobilities.affiliation', alias: 'mobility_affiliation' }, { key: 'Mobilities.foreign_affiliation', alias: 'mobility_foreign_affiliation' }
        //        , { key: 'Mobilities.student_affiliation', alias: 'mobility_student_affiliation' }
        //        //, { key: 'Students.external_id', alias: 'student_external_id' }
        //    //, { key: 'Levels.name', alias: 'level_name' }, 'Levels.rank', 'Terms.start_date', 'Terms.end_date', { key: 'Terms.name', alias: 'term_name' }, { key: 'Programs.name', alias: 'program_name' }
        //        );
        //    var ref = norm.ref();
            

        //    fire_students_mobilities_join = norm.ref();
        //    end_col = sheet["!ref"].substr(3, 1);
        //    end_row = sheet["!ref"].substr(4);
        //    process_sheet_columns(sheet, 'A'); // may need to impliment => http://raganwald.com/2013/03/28/trampolines-in-javascript.html
        //    excel = process_sheet( 2, my_array);
        //    create_student_imports(); 
        //}
        

        //created();
        //set_fire_students_mobilities_join();
        end_col = sheet["!ref"].substr(3, 1);
    end_row = sheet["!ref"].substr(4);
    process_sheet_columns(sheet, 'A'); // may need to impliment => http://raganwald.com/2013/03/28/trampolines-in-javascript.html
    excel = process_sheet(2, my_array);
    create_student_imports();
});