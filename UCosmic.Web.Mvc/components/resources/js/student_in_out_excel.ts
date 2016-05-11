importScripts('/components/Polymer_1x/bower_components/rxjs/dist/rx.all.min.js');
importScripts('/components/Polymer_1x/bower_components/firebase/firebase.js');
importScripts('/components/Polymer_1x/bower_components/lodash/lodash.min.js');
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
        fire_establishments = null,
        fire_students_terms = null,
        fire_students_levels = null,
        fire_students_programs = null,
        firebase_token = JSON.parse(e.data.firebase_token),
        fire_members = new Firebase("https://UCosmic.firebaseio.com/Members/"),
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
        gender = "",
        immigrationStatus = "",
        uCosmicAffiliation = "",
        level = "",
        rank = 0,
        termDescription = "",
        country = "",
        progCode = 0,
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
                case "gender":
                    gender = col;
                    break;
                case "immigrationstatus":
                    immigrationStatus = col;
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
                case "country":
                    country = col;
                    break;
                case "progcode":
                    progCode = col;
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

            //check both xls and xlsx or whatever
            if (sheet[externalId + row]) {
                var externalId2 = sheet[externalId + row].v;
                var status2 = sheet[status + row].v;
                var gender2 = sheet[gender + row] ? sheet[gender + row].v : 'none';
                var immigrationStatus2 = sheet[immigrationStatus + row] ? sheet[immigrationStatus + row].v : 'none';
                var level2 = sheet[level + row].v;
                var term2 = sheet[termDescription + row].v;
                //var term: any =  _.find(term_list, { 'name': term2 });
                var country2 = sheet[country + row].v;
                var progCode2 = sheet[progCode + row] ? sheet[progCode + row].v.toFixed(4) : 'none';
                var affiliation = sheet[uCosmicAffiliation + row] ? sheet[uCosmicAffiliation + row].v : 'none';
                var student_affiliation = sheet[uCosmicStudentAffiliation + row] ? sheet[uCosmicStudentAffiliation + row].v : 'none';
                var foreign_affiliation = sheet[uCosmicForiegnAffiliation + row] ? sheet[uCosmicForiegnAffiliation + row].v : 'none';
                var options = {
                    status: status2, level: level2, term: term2, country: country2, program: progCode2, establishment: tenant_id,//establishment needs to come from mvc server
                    affiliation: affiliation, student_affiliation: student_affiliation, foreign_affiliation: foreign_affiliation,
                    student_external_id: externalId2, gender: gender2, immigration_status: immigrationStatus2
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

        create_student_imports = function () {
            var student_original_data = Rx.Observable.fromArray(excel);
            var _this = this, excel_length = excel.length, count_2 = 0;
            //var last_rank = term_list;

            var student_new_data = student_original_data
                .map((data: Student.Excel, index) => {
                var program_id = "";
                if (data.program) {
                    program_id = data.program.toString().replace(".", "_");
                    program_id = _.find(program_list, { 'id': program_id }) ? data.program.toString().replace(".", "_") : "";
                }
                var program_name: any = data.program_name ? data.program_name : _.find(program_list, { 'id': program_id }) ? _.find(program_list, { 'id': program_id }) : 'none';
                if (program_name && program_name.name) {
                    program_name = program_name.name;
                }
                var response = {
                    country_id: _.findKey(country_list, { 'country': data.country }) ? _.findKey(country_list, { 'country': data.country }) : ''
                    , status: data.status
                    , gender: data.gender
                    , immigration_status: data.immigration_status
                    , country_name: data.country
                    , term_name: data.term
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
                    // ************************ here do the error checking, use the other ref's like terms and make sure it exists ***********************
                    var status = x.status;
                    var gender = x.gender;
                    var immigration_status = x.immigration_status;
                    var country = x.country_name;
                    var affiliation_name = x.affiliation_name.replace(".", " ").replace("/", " ");
                    affiliation_name = affiliation_name.replace(".", " ").replace("/", " ");
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
                    var mobility = {
                        affiliation: x.affiliation_id, country: x.country_id, foreign_affiliation: x.foreign_affiliation_id, level: level, program: x.program_id,
                        status: status, gender: gender, immigration_status: immigration_status, student_affiliation: x.student_affiliation_id, term: x.term_name
                    }

                    if (!term_list[x.term_name]) {
                        const rank = Object.keys(term_list).length;
                        const name = x.term_name
                        term_list[x.term_name] = true;
                        //setTimeout(() => {
                            fire_members_tenant.child('Terms').child(name).set({ rank: rank }, (error) => {
                            })
                        //}, 1000)
                    }

                    fire_members_tenant.child('Mobilities').child('Values').child(status).child(x.term_name).child('last_updated').set(Firebase.ServerValue.TIMESTAMP, (error) => {

                    })



                    fire_members_tenant.child('Mobilities').child('Values').child(status).child(x.term_name).child('Values').child(x.student_external_id).set(mobility, (error) => {
                        if (!has_error) {
                            if (error) {
                                has_error = true;
                                _this.postMessage('Error uploading, please try again - (' + error + ')');
                            }
                            process_response()
                        }
                    });
                    //fire_members_tenant.child('Mobilities').child('Values').child(status).child(x.term_name).child(x.student_external_id).set(mobility, (error) => {
                    //    if (!has_error) {
                    //        if (error) {
                    //            has_error = true;
                    //            _this.postMessage('Error uploading, please try again - (' + error + ')');
                    //        }
                    //        process_response()
                    //    }
                    //});

                    fire_members_tenant.child('Students').child(x.student_external_id).set(student, (error) => {
                        process_response()
                    });


                },
                function (err) {
                    console.log('Error: ' + err);
                },
                function () {
                    console.log('Completed');
                });

        },
        end_col = sheet["!ref"].substr(3, 1);
    end_row = sheet["!ref"].substr(4);
    process_sheet_columns(sheet, 'A'); // may need to impliment => http://raganwald.com/2013/03/28/trampolines-in-javascript.html
    excel = process_sheet(2, my_array);

    if (firebase_token) {
        fire_members.authWithCustomToken(firebase_token, function (error, authData) {
            if (error) {
                console.log("Login Failed!", error);
            } else {
                console.log("Login Succeeded!", authData);
                create_student_imports();
            }
        });
    }
});