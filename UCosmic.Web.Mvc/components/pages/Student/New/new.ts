/// <reference path="../../../../scripts/typings/lodash.d.ts" />
/// <reference path="../../../typediff/mytypes.d.ts" />



//import Student = Students

//var Student.stud = new Student_Module();
//var Student = Student_Module.Students;
Polymer({
    is: "is-page-student-new",
    properties: {
        //styledomain, tenant_id, firebase_token
        styledomain: {
            type: String,
            notify: true,
        },
        tenant_id: {
            type: String,
            notify: true,
        },
        firebase_token: {
            type: String,
            notify: true,
        },
        my_fire: {
            type: Object,
            readOnly: true,
            notify: true,
            value: new Firebase("https://UCosmic.firebaseio.com")
        },
        controller: {
            type: Object,
            readOnly: true,
            notify: true,
            value: function () {
                return this;
            },
        }
    },
    //fire: null,
    //fire_students: null,
    //fire_students_students: null,
    //fire_establishments: null,
    //fire_students_terms: null,
    //fire_students_levels: null,
    //fire_students_programs: null,
    //fire_students_mobilities: null,
    //fire_students_mobilities_join: null,
    //fire_countries: null,
    //establishment_list: [],
    //country_list: [],
    //term_list: [],
    //level_list: [],
    //program_list: [],
    //controller: null,
    //end_row: null,
    //end_col: null,
    //externalId: "",
    //status: "",
    //uCosmicAffiliation: "",
    //level: "",
    //rank: 0,
    //termDescription: "",
    //termStart: "",
    //termEnd: "",
    //country: "",
    //progCode: 0,
    //progDescription: "",
    //uCosmicSubAffiliation: "",
    //uCosmicForiegnAffiliation: "",
    //excel: [],
    //student_import_request: [],
    can_start_file_processing: false,
    created: function () {
        //this.controller = this;
        //this.my_fire = new Firebase("https://UCosmic.firebaseio.com");
        //this.fire_students = new Firebase("https://UCosmic.firebaseio.com/Students");
        //this.fire_students_students = new Firebase("https://UCosmic.firebaseio.com/Students/Students");
        //this.fire_students_mobilities = new Firebase("https://UCosmic.firebaseio.com/Students/Mobilities");
        this.fire_students_terms = new Firebase("https://UCosmic.firebaseio.com/Students/Terms");
        this.fire_students_programs = new Firebase("https://UCosmic.firebaseio.com/Students/Programs");
        this.fire_students_levels = new Firebase("https://UCosmic.firebaseio.com/Students/Levels");
        this.fire_countries = new Firebase("https://UCosmic.firebaseio.com/Places/Countries");
        this.fire_establishments = new Firebase("https://UCosmic.firebaseio.com/Establishments/Establishments");
        
            var can_start_file_processing = _.after(5,  () => {
                this.can_start_file_processing = true;
            })
        //this.set_fire_students_mobilities_join(this);
        this.fire_students_levels.on("value", (snapshot) => {
            this.level_list = snapshot.val();
            can_start_file_processing();
        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });
        this.fire_students_programs.on("value", (snapshot) => {
            this.program_list = snapshot.val();
            can_start_file_processing();
        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });
        this.fire_students_terms.on("value", (snapshot) => {
            this.term_list = snapshot.val();
            can_start_file_processing();
        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });
        this.fire_establishments.on("value", (snapshot) => {
            //console.log(snapshot.val());
            this.establishment_list = snapshot.val();
            //this.set_fire_students_mobilities_join(this);
            can_start_file_processing();
            //this.test(this);
        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });
        this.fire_countries.on("value", (snapshot) => {
            this.country_list = snapshot.val();
            can_start_file_processing();
        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });
    },
    attached: function () {
        if (this.firebase_token) {
            this.my_fire.authWithCustomToken(this.firebase_token, function (error, authData) {
                if (error) {
                    console.log("Login Failed!", error);
                } else {
                    console.log("Login Succeeded!", authData);
                }
            });
        }
        this.$.file_input.addEventListener('change', this.handleFile, false);
    },
    //next_letter: function (s) {
    //    return s.replace(/([a-zA-Z])[^a-zA-Z]*$/, function (a) {
    //        var c = a.charCodeAt(0);
    //        switch (c) {
    //            case 90: return 'A';
    //            case 122: return 'a';
    //            default: return String.fromCharCode(++c);
    //        }
    //    });
    //},
    //process_sheet_columns: function (sheet, col, _this) {
    //    var col_name = sheet[col + 1].h.toLowerCase();
    //    switch (col_name) {
    //        case "externalid":
    //            _this.externalId = col;
    //            break;
    //        case "ucosmicsubaffiliation":
    //            _this.uCosmicSubAffiliation = col;
    //            break;
    //        case "ucosmicforeignaffiliation":
    //            _this.uCosmicForiegnAffiliation = col;
    //            break;
    //        case "status":
    //            _this.status = col;
    //            break;
    //        case "rank":
    //            _this.rank = col;
    //            break;
    //        case "level":
    //            _this.level = col;
    //            break;
    //        case "ucosmicaffiliation":
    //            _this.uCosmicAffiliation = col;
    //            break;
    //        case "termstart":
    //            _this.termStart = col;
    //            break;
    //        case "termend":
    //            _this.termEnd = col;
    //            break;
    //        case "country":
    //            _this.country = col;
    //            break;
    //        case "progcode":
    //            _this.progCode = col;
    //            break;
    //        case "progdescription":
    //            _this.progDescription = col;
    //            break;
    //        case "termdescription":
    //            _this.termDescription = col;
    //            break;
    //    }
    //    var nextCol = _this.next_letter(col);
    //    if (nextCol.charCodeAt(0) > _this.end_col.charCodeAt(0)) {
    //        return;
    //    } else {
    //        return _this.process_sheet_columns(sheet, nextCol, _this);
    //    }

    //},


    //process_sheet: function (sheet, row, _this, student_activity_array: Students.Excel[]) {
    //    //check both xls and xlsx or whatever
    //    if (sheet[_this.externalId + row]) {
    //        var student = "3306_" + sheet[_this.externalId + row].v;
    //        //var mobility_affiliation = uCosmicAffiliation;
    //        var externalId = sheet[_this.externalId + row].v;
    //        var status = sheet[_this.status + row].v;
    //        var level = "3306_" + sheet[_this.level + row].v;
    //        //var level_establishment = uCosmicAffiliation;
    //        //var level_name = sheet[_this.level + row].v;
    //        //var rank = sheet[_this.rank + row].v;
    //        var term = "3306_" + sheet[_this.termDescription + row].v;
    //        //var term_establishment = uCosmicAffiliation;
    //        //var termDescription = sheet[_this.termDescription + row].v;
    //        //var termStart = sheet[_this.termStart + row].w;
    //        //var termEnd = sheet[_this.termEnd + row].w;
    //        var country = sheet[_this.country + row].v;
    //        var progCode = sheet[_this.progCode + row] ? sheet[_this.progCode + row].v : 'null';
    //        //var program_establishment = uCosmicAffiliation;
    //        //var program_is_standard = true;//************** fix later ***********
    //        //var progDescription = sheet[_this.progDescription + row] ? sheet[_this.progDescription + row].v : null;
    //        // check here if has code or none code, don't add if does not have both
    //        var mobility_affiliation = sheet[_this.uCosmicAffiliation + row] ? sheet[_this.uCosmicAffiliation + row].v : 'null';
    //        var mobility_sub_affiliation = sheet[_this.uCosmicSubAffiliation + row] ? sheet[_this.uCosmicSubAffiliation + row].v : 'null';
    //        var mobility_foreign_affiliation = sheet[_this.uCosmicForiegnAffiliation + row] ? sheet[_this.uCosmicForiegnAffiliation + row].v : 'null';
    //        var options = {
    //            mobility_status: status, mobility_level: level, mobility_term: term, mobility_country: country, mobility_program: progCode, mobility_establishment: _this.tenant_id,//mobility_establishment needs to come from mvc server
    //            mobility_affiliation: mobility_affiliation, mobility_sub_affiliation: mobility_sub_affiliation, mobility_foreign_affiliation: mobility_foreign_affiliation,
    //            mobility_student: student, student: student, student_external_id: externalId,
    //        }
    //        var my_student_activity = new Student.Excel(options);

    //        student_activity_array.push(my_student_activity);
    //        row += 1;

    //        if (row > _this.end_row) {
    //            return student_activity_array;
    //        } else {
    //            return _this.process_sheet(sheet, row, _this, student_activity_array);
    //        }
    //    } else {
    //        return student_activity_array;
    //    }
    //},
    ////serialize: function (obj, _this, prefix?) {
    ////    var str = [];
    ////    for (var p in obj) {
    ////        if (obj.hasOwnProperty(p)) {
    ////            var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
    ////            str.push(typeof v == "object" ?
    ////                _this.serialize(v, _this, k) :
    ////                encodeURIComponent(k) + "=" + encodeURIComponent(v));
    ////        }
    ////    }
    ////    return str.join("&");
    ////},

    start_file_process: function(worker, sheet, my_array, _this){
        worker.postMessage({
            'sheet': JSON.stringify(sheet)
            , 'my_array': JSON.stringify(my_array)
            , 'tenant_id': _this.tenant_id.toString()
            , 'establishment_list': JSON.stringify(_this.establishment_list)
            , 'country_list': JSON.stringify(_this.establishment_list)
            , 'program_list': JSON.stringify(_this.establishment_list)
            , 'term_list': JSON.stringify(_this.establishment_list)
            , 'level_list': JSON.stringify(_this.level_list)

        });//, list: list);
    },
    check_if_can_start_file_process: function (worker, sheet, my_array, _this) {

        if (this.can_start_file_processing) {
            this.start_file_process(worker, sheet, my_array, _this);
        } else {
            this.check_if_can_start_file_process(worker, sheet, my_array, _this);
        }
    },

    handleFile: function (e) {
        var _this: any = document.getElementById("new_student_page");
        var files = e.target.files;
        var i, f;
        for (i = 0, f = files[i]; i != files.length; ++i) {
            var reader: any = new FileReader();
            var name = f.name;
            reader.onload = function (e: any) {
                var data = e.target.result;

                var workbook = XLSX.read(data, { type: 'binary' });

                /* DO SOMETHING WITH workbook HERE */
                var sheet = workbook.Sheets[workbook.SheetNames[0]];
                _this.end_col = sheet["!ref"].substr(3, 1);
                _this.end_row = sheet["!ref"].substr(4);
                //_this.process_sheet_columns(sheet, 'A', _this);

                var my_array = new Array<Students.Excel>()
                //_this.excel = _this.process_sheet(sheet, 2, _this, my_array);
                //_this.create_student_imports(_this);

                

                var worker = new Worker('/components/resources/js/student_in_out_excel.js');

                //worker.addEventListener('message', function (e) {
                //    console.log('Worker said: ', e.data);
                //}, false); 
                if (this.can_start_file_processing){
                    this.start_file_process(worker, sheet, my_array, _this);
                } else {
                    this.check_if_can_start_file_process(worker, sheet, my_array, _this);
                }



                //var sheet_stream = Rx.Observable.fromArray(_this.excel);

                //break sheet_json into correct stuff to upload to firebase., get establishments etc...
                //var student_import_request = sheet_stream.select(function (student_activity: Students.Excel)
                //{
                //    return new Student.Request_Azure(student_activity.country_official_name, student_activity.student_establishment_official_name, 
                //        student_activity.foreign_establishment_official_name, student_activity.establishment_official_name);
                //});
                //var excel_request = [];
                //var subscription = student_import_request.subscribe(
                //    function (x) {
                //        excel_request.push(x);
                //    },
                //    function (err) {
                //        console.log('Error: ' + err);
                //    },
                //    function () {
                //        console.log('Completed');
                //    });
                //_this.$.ajax_student_import.method = 'POST';
                //_this.$.ajax_student_import.contentType = "application/json;charset=UTF-8";

                //var my_json = JSON.stringify(excel_request);
                //_this.$.ajax_student_import.body = my_json;


                //_this.$.ajax_student_import.go();
                

            };
            reader.readAsBinaryString(f);
        }
    },
    //test: function () {

    //    var list = Firebase.getAsArray(this.fire_students_mobilities_join);
    //},

    //create_student_imports: function (_this) {
    //    //var student_response_data = Rx.Observable.fromArray(response.detail.response);
    //    var student_original_data = Rx.Observable.fromArray(_this.excel);
    //    /*
    //placeId: number;
    //uCosmicAffiliationId: number;
    //uCosmicSubAffiliationId: number;
    //uCosmicForeignAffiliationId: number;*/
    //    //var student_data = Rx.Observable.combineLatest(student_original_data, student_response_data, (s1: Student.Excel, s2) => {
    //    //    //return s1;
    //    //    return new Student.Excel_Merged({
    //    //            external_id: s1.external_id, status: s1.status, level: s1.level, rank: s1.rank, term_name: s1.term_name, start_date: s1.start_date, end_date: s1.end_date, country_official_name: s1.country_official_name,
    //    //            student_establishment_official_name: s1.student_establishment_official_name, foreign_establishment_official_name: s1.foreign_establishment_official_name, establishment_official_name: s1.establishment_official_name,
    //    //            program: s1.program, program_name: s1.program_name,  establishment: s2.uCosmicAffiliationId, student_establishment: s2.uCosmicSubAffiliationId,
    //    //            foreign_establishment: s2.uCosmicForeignAffiliationId, country: s2.placeId
    //    //    })
    //    //});

        
    //    //list.$add({
    //    //    external_id: "New 234jkasd3",
    //    //    level: "1",
    //    //    name: "graduate",
    //    //    rank: "1",
    //    //    status: "in",
    //    //    student: "2"
    //    //});
    //    //var list = _this.get_mobility_list(_this);
    //    var list = Firebase.getAsArray(_this.fire_students_mobilities_join);


    //    var student_new_data = student_original_data
    //        .map((data: Student.Excel) => {
    //            data.mobility_country = _.findKey(_this.country_list, { 'country': data.mobility_country }) ? _.findKey(_this.country_list, { 'country': data.mobility_country }) : 'null';
    //            data.mobility_term = _.has(_this.term_list, data.mobility_term.toLowerCase()) ? data.mobility_term.toLowerCase() : "false";
    //            data.mobility_level = _.has(_this.level_list, data.mobility_level.toLowerCase()) ? data.mobility_level.toLowerCase() : "false";
    //            data.mobility_program = _.has(_this.program_list, data.mobility_program.toString().replace(".", "_").toLowerCase()) ? data.mobility_program.toString().replace(".", "_").toLowerCase() : "false";
    //            data.mobility_establishment = data.mobility_establishment;//_.findKey(_this.establishment_list, { 'establishment': data.mobility_establishment }) ? _.findKey(_this.establishment_list, { 'establishment': data.mobility_establishment }) : 'null';
    //            data.mobility_affiliation = _.findKey(_this.establishment_list, { 'establishment': data.mobility_affiliation }) ? _.findKey(_this.establishment_list, { 'establishment': data.mobility_affiliation }) : 'null';
    //            data.mobility_sub_affiliation = _.findKey(_this.establishment_list, { 'establishment': data.mobility_sub_affiliation }) ? _.findKey(_this.establishment_list, { 'establishment': data.mobility_sub_affiliation }) : 'null';
    //            data.mobility_foreign_affiliation = _.findKey(_this.establishment_list, { 'establishment': data.mobility_foreign_affiliation }) ? _.findKey(_this.establishment_list, { 'establishment': data.mobility_foreign_affiliation }) : 'null';
                

    //            return data;
    //    });

    //    //var student_new_data = student_original_data.zip(
    //    //    student_original_data,
    //    //    Rx.Observable.from(_this.establishment_list),
    //    //    function (s1, s2, s3) {
    //    //        return s1 + ':' + s2 + ':' + s3;
    //    //    }
    //    //    );

    //    //_this.country_list = Object.keys(_this.country_list).map(function (k) { return _this.country_list[k] });
    //    //var student_mobility_country = student_original_data
    //    //    .flatMap((data: Student.Excel) => {
    //    //        return Rx.Observable.just(_.findKey(_this.country_list, { 'country': data.mobility_country }));
    //    //    });
    //    //var student_mobility_term = student_original_data
    //    //    .flatMap((data: Student.Excel) => {
    //    //        return Rx.Observable.just(_.has(_this.term_list, data.mobility_term.toLowerCase()));//_.findKey(_this.term_list, { 'term': data.mobility_term.toLowerCase() });
    //    //    });
    //    //var student_mobility_level = student_original_data
    //    //    .flatMap((data: Student.Excel) => {
    //    //        return Rx.Observable.just(_.has(_this.level_list, data.mobility_level.toLowerCase()));//_.findKey(_this.level_list, { 'level': data.mobility_level.toLowerCase() });
    //    //    });
    //    //var student_mobility_program = student_original_data
    //    //    .flatMap((data: Student.Excel) => {
    //    //        return Rx.Observable.just(_.has(_this.program_list, data.mobility_program.toString().replace(".", "_")));
    //    //    });
    //    //var student_mobility_establishment = student_original_data
    //    //    .flatMap((data: Student.Excel) => {
    //    //    return Rx.Observable.fromArray(_this.establishment_list)
    //    //        .findIndex(function (x: any, i, obs) {
    //    //        if (!x) {
    //    //            return null;
    //    //        } else {
    //    //            return x.establishment === data.mobility_establishment;
    //    //        }
    //    //    });
    //    //    });
    //    //var student_establishment_observer = student_original_data
    //    //    .flatMap((data: Student.Excel) => {
    //    //    return Rx.Observable.fromArray(_this.establishment_list)
    //    //        .findIndex(function (x: any, i, obs) {
    //    //        if (!x) {
    //    //            return null;
    //    //        } else {
    //    //            return x.establishment === data.student_establishment;
    //    //        }
    //    //    });
    //    //    });
    //    //var student_mobility_student_establishment = student_original_data
    //    //    .flatMap((data: Student.Excel) => {
    //    //    return Rx.Observable.fromArray(_this.establishment_list)
    //    //        .findIndex(function (x: any, i, obs) {
    //    //        if (!x) {
    //    //            return null;
    //    //        } else {
    //    //            return x.establishment === data.mobility_student_establishment;
    //    //        }
    //    //    });
    //    //    });
    //    //var student_mobility_student_foreign_establishment = student_original_data
    //    //    .flatMap((data: Student.Excel) => {
    //    //    return Rx.Observable.fromArray(_this.establishment_list)
    //    //        .findIndex(function (x: any, i, obs) {
    //    //        if (!x) {
    //    //            return null;
    //    //        } else {
    //    //            return x.establishment === data.mobility_student_foreign_establishment;
    //    //        }
    //    //    });
    //    //});
    //    //var student_new_data = Rx.Observable.combineLatest(student_original_data, student_mobility_establishment, student_mobility_country, student_mobility_term, student_mobility_level, student_mobility_program
    //    //    , student_establishment_observer, student_mobility_student_establishment, student_mobility_student_foreign_establishment
    //    //    , (s1: Student.Excel, mobility_establishment, mobility_country, mobility_term, mobility_level, mobility_program, student_establishment, mobility_student_establishment, mobility_student_foreign_establishment) => {
    //    //    //return s1;

    //    //    var options = {
    //    //        mobility_status: s1.mobility_status, mobility_level: mobility_level ? s1.mobility_level : "-1", mobility_term: mobility_term ? s1.mobility_term : "-1", mobility_country: mobility_country
    //    //        , mobility_program: mobility_program ? s1.mobility_program : "-1", mobility_establishment: mobility_establishment, mobility_student_foreign_establishment: mobility_student_foreign_establishment
    //    //        , mobility_student_establishment: mobility_student_establishment
    //    //        , mobility_student: s1.mobility_student, student_establishment: student_establishment, student: s1.student, student_external_id: s1.student_external_id
    //    //    }
    //    //    var my_student_activity = new Student.Excel(options);
    //    //    return my_student_activity
    //    //});


    //    //var x2 = student_original_data.toArray();


    //    //var worker = new Worker('/components/resources/js/student_in_out_excel.js');

    //    //worker.addEventListener('message', function (e) {
    //    //    console.log('Worker said: ', e.data);
    //    //}, false);

    //    //worker.postMessage({ student_new_data: JSON.parse(JSON.stringify(student_new_data)), list: list });//, list: list);



    //    var count = 0
    //    var subscription2 = student_new_data.subscribe(
    //        function (x: Student.Excel) {
    //            x.mobility_program = x.mobility_program.toString().replace(".", "_");
    //            console.log(count++);

    //            // ************************ here do the error checking, use the other ref's like terms and make sure it exists ***********************
    //            list.$set(x.mobility_term + "_" + x.student, x);
    //            //worker.postMessage({ x: JSON.parse(JSON.stringify(x)), list: JSON.parse(JSON.stringify(list)) });//, list: list);
    //        },
    //        function (err) {
    //            console.log('Error: ' + err);
    //        },
    //        function () {
    //            console.log('Completed');
    //        });

    //},
    //set_fire_students_mobilities_join: function (_this) {
    //    //_this = this;

    //    //this.fire_students = this.my_fire.child("Students");
    //    //this.fire_students_mobilities = this.my_fire.child("Mobilities");// new Firebase("https://UCosmic.firebaseio.com/Students/Mobilities")
    //    //var list3 = Firebase.getAsArray(this.fire_students_mobilities);

    //    //var list3 = Firebase.getAsArray(this.fire_students_mobilities); 

    //    var norm = new Firebase.util.NormalizedCollection(
    //        _this.fire_students_mobilities,  // alias is "widgets1"
    //        [_this.fire_students_students, 'Students', 'Mobilities.student']
    //    //,[_this.fire_students_levels, 'Levels', 'Mobilities.level']
    //    //, [_this.fire_students_terms, 'Terms', 'Mobilities.term']
    //    //, [_this.fire_countries, 'Countries', 'Mobilities.country']
    //    //, [_this.fire_students_programs, 'Programs', 'Mobilities.program']
    //    //, [_this.fire_establishments, 'Establishments', 'Mobilities.establishment']
    //        );
    //    //norm = norm.filter(function (data, key, priority) {
    //    //    return data.external_id === '2345dd';
    //    //});
    //    //norm.select('Mobilities.student', 'Mobilities.level', 'Mobilities.term', 'Mobilities.establishment', 'Mobilities.country', 'Mobilities.program', 'Mobilities.status',
    //    //    'Mobilities.foreign_establishmente', 'Mobilities.student_establishment'
    //    //    //,{ key: 'Students.external_id', alias: 'Students_external_id' }, { key: 'Students.establishment', alias: 'student_establishment2' }, { key: 'Levels.name', alias: 'level_name' }
    //    //    //, 'Levels.rank', 'Terms.start_date', 'Terms.end_date', { key: 'Terms.name', alias: 'term_name' }, { key: 'Programs.name', alias: 'program_name' }
    //    //    );
    //    norm.select({ key: 'Mobilities.student', alias: 'mobility_student' }, { key: 'Mobilities.level', alias: 'mobility_level' }, { key: 'Mobilities.term', alias: 'mobility_term' }
    //        , { key: 'Mobilities.establishment', alias: 'mobility_establishment' }, { key: 'Mobilities.country', alias: 'mobility_country' }
    //        , { key: 'Mobilities.program', alias: 'mobility_program' }, { key: 'Mobilities.status', alias: 'mobility_status' }
    //        , { key: 'Mobilities.affiliation', alias: 'mobility_affiliation' }, { key: 'Mobilities.foreign_affiliation', alias: 'mobility_foreign_affiliation' }
    //        , { key: 'Mobilities.sub_affiliation', alias: 'mobility_sub_affiliation' }
    //        , { key: 'Students.external_id', alias: 'student_external_id' }
    //    //, { key: 'Levels.name', alias: 'level_name' }, 'Levels.rank', 'Terms.start_date', 'Terms.end_date', { key: 'Terms.name', alias: 'term_name' }, { key: 'Programs.name', alias: 'program_name' }
    //        );
    //    //norm.select('Mobilities.student', 'Mobilities.level', 'Mobilities.term', 'Mobilities.establishment', 'Mobilities.country', 'Mobilities.program', 'Mobilities.status',
    //    //    'Mobilities.foreign_establishmente', 'Mobilities.student_establishment',
    //    //    'Students.external_id', { key: 'Students.establishment', alias: 'students_establishment' }, { key: 'Levels.name', alias: 'level_name' }, 'Levels.rank', 'Terms.start_date', 'Terms.end_date', { key: 'Terms.name', alias: 'term_name' }
    //    //    , { key: 'Establishments.official_name', alias: 'establishment_official_name' }, { key: 'Countries.official_name', alias: 'country_official_name' },
    //    //    { key: 'Programs.name', alias: 'program_name' }
    //    //    );
    //    var ref = norm.ref();
    //    //var norm2 = new Firebase.util.NormalizedCollection(
    //    //    new Firebase("https://UCosmic.firebaseio.com/Students/Programs"),  // alias is "widgets1"
    //    //    [ref, 'Mobilities', 'Programs.code']
    //    //    );

    //    //norm2.select('Programs.code', 'Mobilities.student', 'Mobilities.level', 'Mobilities.term', 'Mobilities.establishment', 'Mobilities.country', 'Mobilities.program', 'Mobilities.status',
    //    //    'Mobilities.foreign_establishment', 'Mobilities.student_establishment', 
    //    //    'Mobilities.external_id', 'Mobilities.level_name', 'Mobilities.rank', 'Mobilities.start_date', 'Mobilities.end_date', 'Mobilities.term_description',
    //    //    'Mobilities.establishment_name', 'Mobilities.country_name', 'Mobilities.program_code');
    //    //var ref2 = norm.ref();
    //    //var list = Firebase.getAsArray(ref2); 
    //    //var list = Firebase.getAsArray(ref);
    //    ref.on("value", function (snapshot) {
    //        console.log(snapshot.val());
    //        setTimeout(function () {
    //            _this.fire_students_mobilities_join = norm.ref();
    //            var list = Firebase.getAsArray(_this.fire_students_mobilities_join);
    //        }, 1);
    //    }, function (errorObject) {
    //            console.log("The read failed: " + errorObject.code);
    //        });

    //    _this.fire_students_mobilities_join = norm.ref();
    //    //return (ref);
    //},
    //test2: function (_this) {
    //    _this = this;

    //    //this.fire_students = this.my_fire.child("Students");
    //    //this.fire_students_mobilities = this.my_fire.child("Mobilities");// new Firebase("https://UCosmic.firebaseio.com/Students/Mobilities")
    //    //var list3 = Firebase.getAsArray(this.fire_students_mobilities);

    //    //var list3 = Firebase.getAsArray(this.fire_students_mobilities); 

    //    var norm = new Firebase.util.NormalizedCollection(
    //        _this.fire_students_mobilities  // alias is "widgets1"
    //        , [_this.fire_students_students, 'Students', 'Mobilities.student'],
    //        [_this.fire_students_levels, 'Levels', 'Mobilities.level'],
    //        [_this.fire_students_terms, 'Terms', 'Mobilities.term']
    //        , [_this.fire_establishments, 'Establishments', 'Mobilities.establishment']
    //        , [_this.fire_countries, 'Countries', 'Mobilities.country']
    //        , [_this.fire_students_programs, 'Programs', 'Mobilities.program']
    //        );
    //    //norm = norm.filter(function (data, key, priority) {
    //    //    return data.external_id === '2345dd';
    //    //});
    //    norm.select('Mobilities.student', 'Mobilities.level', 'Mobilities.term', 'Mobilities.establishment', 'Mobilities.country', 'Mobilities.program', 'Mobilities.status'
    //        , 'Mobilities.foreign_establishment_official_name', 'Mobilities.student_establishment_official_name'
    //        , 'Students.external_id', { key: 'Levels.name', alias: 'level_name' }, 'Levels.rank', 'Terms.start_date', 'Terms.end_date', { key: 'Terms.name', alias: 'term_name' }
    //        , { key: 'Establishments.official_name', alias: 'establishment_official_name' }, { key: 'Countries.official_name', alias: 'country_official_name' },
    //        { key: 'Programs.name', alias: 'program_name' }
    //        );
    //    var ref = norm.ref();
    //    //var norm2 = new Firebase.util.NormalizedCollection(
    //    //    new Firebase("https://UCosmic.firebaseio.com/Students/Programs"),  // alias is "widgets1"
    //    //    [ref, 'Mobilities', 'Programs.code']
    //    //    );

    //    //norm2.select('Programs.code', 'Mobilities.student', 'Mobilities.level', 'Mobilities.term', 'Mobilities.establishment', 'Mobilities.country', 'Mobilities.program', 'Mobilities.status',
    //    //    'Mobilities.foreign_establishment', 'Mobilities.student_establishment', 
    //    //    'Mobilities.external_id', 'Mobilities.level_name', 'Mobilities.rank', 'Mobilities.start_date', 'Mobilities.end_date', 'Mobilities.term_description',
    //    //    'Mobilities.establishment_name', 'Mobilities.country_name', 'Mobilities.program_code');
    //    //var ref2 = norm.ref();
    //    //var list = Firebase.getAsArray(ref2); 
    //    ref.on("value", function (snapshot) {
    //        console.log(snapshot.val());
    //        setTimeout(function () {
    //            var list = Firebase.getAsArray(norm.ref());
    //        }, 1);
    //    }, function (errorObject) {
    //            console.log("The read failed: " + errorObject.code);
    //        });
    //    return (ref);
    //},

    ////student_import_response: function (response) {
    ////    this.isAjaxing = false;

    ////    if (!response.detail.response.error) {
    ////        this.create_student_imports(response, this);

    ////    } else {

    ////        console.log(response.detail.response.error)
    ////    }

    ////},
    //ajax_error: function (response) {
    //    this.isAjaxing = false;

    //    if (!response.detail.response.error) {
    //        console.log(response.detail.response)
    //    } else {

    //        console.log(response.detail.response.error)
    //    }

    //},


}); 
