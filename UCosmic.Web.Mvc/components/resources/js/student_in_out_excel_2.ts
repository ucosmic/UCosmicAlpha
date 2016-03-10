///// <reference path="../../typediff/lovefield.d.ts" />
//importScripts('/components/Polymer_1x/bower_components/rxjs/dist/rx.all.min.js');
//importScripts('/components/Polymer_1x/bower_components/firebase/firebase.js');
////importScripts('/components/polymer_1x/bower_components/firebase-util/dist/firebase-util.js');
//importScripts('/components/Polymer_1x/bower_components/lodash/lodash.min.js');
//importScripts('/components/Polymer_1x/bower_components/lovefield/dist/lovefield.js');
////var exports = Firebase;
////importScripts('/components/utilities/firebase-as-array.js');
//importScripts('/components/models/students.js');
//import Student_2 = Students;

//var DataModel = function () {
//    this.db = null;
//    this.observable = { notStarted: [], working: [] };
//    this.Mobilities = null;
//    this.Students = null;
//    this.mobilities = [];
//    this.students = [];

//    this.taskQuery_ = null;
//    this.allQuery_ = null;
//};
//var dataModel = new DataModel();
//self.addEventListener('message', function (e: any) {

//    function find_by_key(obj, key) {
//        if (_.has(obj, key)) // or just (key in obj)
//            return [obj];
//        // elegant:
//        return _.flatten(_.map(obj, function (v) {
//            return typeof v == "object" ? find_by_key(v, key) : [];
//        }), true);

//        // or efficient:
//        var res = [];
//        _.forEach(obj, function (v) {
//            if (typeof v == "object" && (v = find_by_key(v, key)).length)
//                res.push.apply(res, v);
//        });
//        return res;
//    }

//    var tenant_id = e.data.tenant_id, fire_members = new Firebase("https://UCosmic.firebaseio.com/Members_test/"),
//        fire_members_tenant = fire_members.child(tenant_id);



//    var excel = '',
//        sheet = JSON.parse(e.data.sheet),
//        my_array = JSON.parse(e.data.my_array),
//        //fire_students_students = null,
//        fire_establishments = null,
//        fire_students_terms = null,
//        fire_students_levels = null,
//        fire_students_programs = null,
//        //fire_students = new Firebase("https://UCosmic.firebaseio.com/Students/Mobilities"),
//        fire_students_mobilities_join = null,
//        fire_countries = null,
//        establishment_list = JSON.parse(e.data.establishment_list),
//        country_list = JSON.parse(e.data.country_list),
//        term_list = JSON.parse(e.data.term_list),
//        level_list = JSON.parse(e.data.level_list),
//        program_list = JSON.parse(e.data.program_list),
//        controller = null,
//        end_row = null,
//        end_col = null,
//        externalId = "",
//        status = "",
//        uCosmicAffiliation = "",
//        level = "",
//        rank = 0,
//        termDescription = "",
//        //termStart = "",
//        //termEnd = "",
//        country = "",
//        progCode = 0,
//        //progDescription = "",
//        uCosmicStudentAffiliation = "",
//        uCosmicForiegnAffiliation = "",
//        next_letter = function (s) {
//            return s.replace(/([a-zA-Z])[^a-zA-Z]*$/, function (a) {
//                var c = a.charCodeAt(0);
//                switch (c) {
//                    case 90: return 'A';
//                    case 122: return 'a';
//                    default: return String.fromCharCode(++c);
//                }
//            });
//        },
//        process_sheet_columns = function (sheet, col) {
//            var col_name = sheet[col + 1].h.toLowerCase();
//            switch (col_name) {
//                case "externalid":
//                    externalId = col;
//                    break;
//                case "ucosmicstudentaffiliation":
//                    uCosmicStudentAffiliation = col;
//                    break;
//                case "ucosmicforeignaffiliation":
//                    uCosmicForiegnAffiliation = col;
//                    break;
//                case "status":
//                    status = col;
//                    break;
//                case "rank":
//                    rank = col;
//                    break;
//                case "level":
//                    level = col;
//                    break;
//                case "ucosmicaffiliation":
//                    uCosmicAffiliation = col;
//                    break;
//                //case "termstart":
//                //    termStart = col;
//                //    break;
//                //case "termend":
//                //    termEnd = col;
//                //    break;
//                case "country":
//                    country = col;
//                    break;
//                case "progcode":
//                    progCode = col;
//                    break;
//                //case "progdescription":
//                //    progDescription = col;
//                //    break;
//                case "termdescription":
//                    termDescription = col;
//                    break;
//            }
//            var nextCol = next_letter(col);
//            if (nextCol.charCodeAt(0) > end_col.charCodeAt(0)) {
//                return;
//            } else {
//                return process_sheet_columns(sheet, nextCol);
//            }

//        },


//        process_sheet = function (row, student_activity_array: Students.Excel[]) {

//            //check both xls and xlsx or whatever
//            if (sheet[externalId + row]) {
//                //var student = "3306_" + sheet[externalId + row].v;
//                //var mobility_affiliation = uCosmicAffiliation;
//                var externalId2 = sheet[externalId + row].v;
//                var status2 = sheet[status + row].v;
//                var level2 = sheet[level + row].v;
//                var term2 = sheet[termDescription + row].v;
//                var term: any = _.find(term_list, { 'name': term2 });
//                //var term_start = term.start_date;
//                //var term_end = term.end_date;
//                var country2 = sheet[country + row].v;
//                var progCode2 = sheet[progCode + row] ? sheet[progCode + row].v.toFixed(4) : 'none';
//                //var progDesc2 = sheet[progDescription + row] ? sheet[progDescription + row].v : 'none';
//                //var program_is_standard = true;//************** fix later ***********
//                // check here if has code or none code, don't add if does not have both
//                var affiliation = sheet[uCosmicAffiliation + row] ? sheet[uCosmicAffiliation + row].v : 'none';
//                var student_affiliation = sheet[uCosmicStudentAffiliation + row] ? sheet[uCosmicStudentAffiliation + row].v : 'none';
//                var foreign_affiliation = sheet[uCosmicForiegnAffiliation + row] ? sheet[uCosmicForiegnAffiliation + row].v : 'none';
//                var options = {
//                    status: status2, level: level2, term: term2, country: country2, program: progCode2, establishment: tenant_id,//establishment needs to come from mvc server
//                    affiliation: affiliation, student_affiliation: student_affiliation, foreign_affiliation: foreign_affiliation,
//                    student_external_id: externalId2
//                }
//                var my_student_activity = new Student_2.Excel(options);

//                student_activity_array.push(my_student_activity);
//                row += 1;

//                if (row > end_row) {
//                    return student_activity_array;
//                } else {
//                    return process_sheet(row, student_activity_array);
//                }
//            } else {
//                return student_activity_array;
//            }
//        },
//        //test = function () {

//        //    var list = Firebase.getAsArray(fire_students_mobilities);
//        //},
 
//        create_student_imports = function (dataModel) {
//            var student_original_data = Rx.Observable.fromArray(excel);
//            //var list = Firebase.getAsArray(fire_students_mobilities);
//            var _this = this, excel_length = excel.length, count_2 = 0;

//            var student_new_data = student_original_data
//                .map((data: Student_2.Excel, index) => {
//                var program_id = "";
//                if (data.program) {
//                    program_id = data.program.toString().replace(".", "_");
//                    program_id = _.find(program_list, { 'id': program_id }) ? data.program.toString().replace(".", "_") : "";
//                }
//                //program_id.toString().replace(".", "_");
//                var program_name: any = data.program_name ? data.program_name : _.find(program_list, { 'id': program_id }) ? _.find(program_list, { 'id': program_id }) : 'none';
//                if (program_name && program_name.name) {
//                    program_name = program_name.name;
//                }
//                var response = {
//                    country_id: _.findKey(country_list, { 'country': data.country }) ? _.findKey(country_list, { 'country': data.country }) : ''
//                    , status: data.status
//                    , country_name: data.country
//                    , term_name: data.term
//                //, term_start: data.term_start
//                //, term_end: data.term_end
//                    , program_id: program_id
//                    , program_name: program_name
//                    , level: data.level
//                    , establishment_id: data.establishment
//                    , affiliation_id: _.findKey(establishment_list, { 'establishment': data.affiliation }) ? _.findKey(establishment_list, { 'establishment': data.affiliation }) : 'none'
//                    , student_affiliation_id: _.findKey(establishment_list, { 'establishment': data.student_affiliation }) ? _.findKey(establishment_list, { 'establishment': data.student_affiliation }) : 'none'
//                    , foreign_affiliation_id: _.findKey(establishment_list, { 'establishment': data.foreign_affiliation }) ? _.findKey(establishment_list, { 'establishment': data.foreign_affiliation }) : 'none'
//                    , affiliation_name: data.affiliation
//                    , student_affiliation_name: data.student_affiliation
//                    , foreign_affiliation_name: data.foreign_affiliation
//                    , student_external_id: data.student_external_id
//                }
//                _this.postMessage('Processing: ' + index + "/" + excel_length + " %" + ((index / excel_length) * 100).toFixed(2));

//                return response;
//            });

//            function process_response() {
//                count_2 += 1;
//                if ((count_2 / 2) != excel_length) {
//                    if (!(count_2 % 2)) {
//                        _this.postMessage('Uploading: ' + (count_2 / 2) + "/" + excel_length + " %" + (((count_2 / 2) / excel_length) * 100).toFixed(2));
//                    }
//                } else {
//                    _this.postMessage('Completed!');
//                }
//            }
//            var has_error = false;

//            var subscription2 = student_new_data.subscribe(
//                function (x: any) {
//                    var status = x.status;
//                    var country = x.country_name;
//                    var affiliation_name = x.affiliation_name.replace(".", " ").replace("/", " ");
//                    affiliation_name = affiliation_name.replace(".", " ").replace("/", " ");
//                    //var mobility_id = x.term_name + "_" + x.student_external_id;
//                    var level = _.findKey(level_list, { 'name': x.level }) ? _.findKey(level_list, { 'name': x.level }) : 'none';
//                    var foreign_affiliation_name = x.foreign_affiliation_name.replace(".", " ").replace("/", " ");
//                    var student_affiliation_name = x.student_affiliation_name.replace(".", " ").replace("/", " ");
//                    foreign_affiliation_name = foreign_affiliation_name.replace(".", " ").replace("/", " ");
//                    student_affiliation_name = student_affiliation_name.replace(".", " ").replace("/", " ");
//                    var term = x.term_name;
//                    var program = x.program_name.replace(".", " ").replace("/", " ");
//                    var rank: any = _.find(level_list, { name: x.level });
//                    rank = rank.rank;
//                    program = program.replace(".", " ").replace("/", " ");



//                    var student = { external_id: x.student_external_id }
//                    var fire_members_tenant = fire_members.child(tenant_id);
//                    var mobility = {
//                        id: x.student_external_id + x.term_name,
//                        student_external_id: x.student_external_id,
//                        affiliation: x.affiliation_id, country: x.country_id, foreign_affiliation: x.foreign_affiliation_id, level: level, program: x.program_id,
//                        status: status, student_affiliation: x.student_affiliation_id, term: x.term_name
//                    }

//                    dataModel.mobilities.push(mobility);
//                    dataModel.students.push(student);
//                    //dataModel.mobilities.push(dataModel.Mobilities.createRow(mobility));
//                    //dataModel.students.push(dataModel.Students.createRow(student));
//                    //var insert_mobilities = dataModel.db.insert().into(dataModel.Mobilities).values(dataModel.mobilities);
//                    //var insert_students = dataModel.db.insert().into(dataModel.Students).values(dataModel.students);
//                    //var insert_mobilities = dataModel.db.insertOrReplace().into(dataModel.Mobilities).values([dataModel.Mobilities.createRow(mobility)]);
//                    //var insert_students = dataModel.db.insertOrReplace().into(dataModel.Students).values([dataModel.Students.createRow(student)]);
                    
//                    //fire_members_tenant.child('Mobilities').child('Values').child(status).child(x.term_name).child(x.student_external_id).set(mobility, (error) => {
//                    //    if (!has_error) {
//                    //        if (error) {
//                    //            has_error = true;
//                    //            _this.postMessage('Error uploading, please try again - (' + error + ')');
//                    //        }
//                    //        process_response()
//                    //    }
//                    //});
//                    //fire_members_tenant.child('Students').child(x.student_external_id).set(student, (error) => {
//                    //    process_response()
//                    //});

//                },
//                function (err) {
//                    console.log('Error: ' + err);
//                },
//                function () {
//                    console.log('Completed');
//                    _this.postMessage('Completed!');
//                    try {
//                        var mobilities = [], students = [];
//                        _.uniqBy(dataModel.mobilities, 'id').forEach(function(value, index){
//                            mobilities.push(dataModel.Mobilities.createRow(value));
//                        });
//                        _.uniqBy(dataModel.students, 'external_id').forEach(function (value, index) {
//                            students.push(dataModel.Students.createRow(value));
//                        });
//                        //dataModel.mobilities.push(dataModel.Mobilities.createRow(mobility));
//                        //dataModel.students.push(dataModel.Students.createRow(student));
//                        var insert_mobilities = dataModel.db.insert().into(dataModel.Mobilities).values(mobilities);
//                        var insert_students = dataModel.db.insert().into(dataModel.Students).values(students);
//                        return dataModel.db.createTransaction().exec([insert_mobilities, insert_students]);
//                    } catch (e) {
//                        console.log(e);
//                    }
//                    //return Promise.resolve();
//                });

//        };
//    end_col = sheet["!ref"].substr(3, 1);
//    end_row = sheet["!ref"].substr(4);
//    process_sheet_columns(sheet, 'A'); // may need to impliment => http://raganwald.com/2013/03/28/trampolines-in-javascript.html
//    excel = process_sheet(2, my_array);


//    DataModel.prototype.connect_ = function () {
//        var builder = lf.schema.create('scrum', 1);
//        builder.createTable('Mobilities').
//            addColumn('id', lf.Type.STRING).
//            addColumn('affiliation', lf.Type.STRING).
//            addColumn('country', lf.Type.STRING).
//            addColumn('foreign_affiliation', lf.Type.STRING).
//            addColumn('level', lf.Type.STRING).
//            addColumn('status', lf.Type.STRING).
//            addColumn('student_affiliation', lf.Type.STRING).
//            addColumn('term', lf.Type.STRING).
//            addPrimaryKey(['id']);
//        builder.createTable('Students').
//            addColumn('external_id', lf.Type.STRING).
//            addPrimaryKey(['external_id']);

//        return builder.connect({
//            storeType: lf.schema.DataStoreType.FIREBASE,
//            firebase: fire_members_tenant
//        }).then(function (db) {
//            this.db = db;
//            this.Mobilities = db.getSchema().table('Mobilities');
//            this.Students = db.getSchema().table('Students');
//        }.bind(this));
//    };

//    dataModel.connect_().then(function () {
        
//        return create_student_imports(dataModel);
//    }.bind(this)).then(function(){
//        dataModel.allQuery_ = dataModel.db.select().from(dataModel.Students);
//        dataModel.db.observe(dataModel.allQuery_, function () {

//            dataModel.db.select().from(dataModel.Mobilities).exec().then(function (results) {
//                var test = results;    
//            });
//        }.bind(this));



//        //Object.observe(uiModel, function () {
//        //    this.updateObservable_(uiModel);
//        //}.bind(this));
//        //this.updateObservable_(uiModel);  // Provide initial update.
//    }.bind(this));
//});