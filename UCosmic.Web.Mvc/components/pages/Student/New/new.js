/// <reference path="../../../../scripts/typings/lodash.d.ts" />
/// <reference path="../../../typediff/mytypes.d.ts" />
var Student = Students;
Polymer({
    is: "is-page-student-new",
    properties: {
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
    fire_students: null,
    fire_students_students: null,
    fire_establishments: null,
    fire_students_terms: null,
    fire_students_levels: null,
    fire_students_programs: null,
    fire_students_mobilities: null,
    fire_students_mobilities_join: null,
    fire_countries: null,
    establishment_list: [],
    country_list: [],
    term_list: [],
    level_list: [],
    program_list: [],
    controller: null,
    end_row: null,
    end_col: null,
    externalId: "",
    status: "",
    uCosmicAffiliation: "",
    level: "",
    rank: 0,
    termDescription: "",
    termStart: "",
    termEnd: "",
    country: "",
    progCode: 0,
    progDescription: "",
    uCosmicStudentAffiliation: "",
    uCosmicForiegnAffiliation: "",
    excel: [],
    created: function () {
        var _this = this;
        this.fire_students = new Firebase("https://UCosmic.firebaseio.com/Students");
        this.fire_students_students = new Firebase("https://UCosmic.firebaseio.com/Students/Students");
        this.fire_students_mobilities = new Firebase("https://UCosmic.firebaseio.com/Students/Mobilities");
        this.fire_students_terms = new Firebase("https://UCosmic.firebaseio.com/Students/Terms");
        this.fire_students_programs = new Firebase("https://UCosmic.firebaseio.com/Students/Programs");
        this.fire_students_levels = new Firebase("https://UCosmic.firebaseio.com/Students/Levels");
        this.fire_countries = new Firebase("https://UCosmic.firebaseio.com/Places/Countries");
        this.fire_establishments = new Firebase("https://UCosmic.firebaseio.com/Establishments/Establishments");
        this.fire_students_levels.on("value", function (snapshot) {
            _this.level_list = snapshot.val();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        this.fire_students_programs.on("value", function (snapshot) {
            _this.program_list = snapshot.val();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        this.fire_students_terms.on("value", function (snapshot) {
            _this.term_list = snapshot.val();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        this.fire_establishments.on("value", function (snapshot) {
            _this.establishment_list = snapshot.val();
            _this.set_fire_students_mobilities_join(_this);
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        this.fire_countries.on("value", function (snapshot) {
            _this.country_list = snapshot.val();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    },
    attached: function () {
        if (this.firebase_token) {
            this.my_fire.authWithCustomToken(this.firebase_token, function (error, authData) {
                if (error) {
                    console.log("Login Failed!", error);
                }
                else {
                    console.log("Login Succeeded!", authData);
                }
            });
        }
        this.$.file_input.addEventListener('change', this.handleFile, false);
    },
    next_letter: function (s) {
        return s.replace(/([a-zA-Z])[^a-zA-Z]*$/, function (a) {
            var c = a.charCodeAt(0);
            switch (c) {
                case 90: return 'A';
                case 122: return 'a';
                default: return String.fromCharCode(++c);
            }
        });
    },
    process_sheet_columns: function (sheet, col, _this) {
        var col_name = sheet[col + 1].h;
        switch (col_name) {
            case "externalId":
                _this.externalId = col;
                break;
            case "uCosmicStudentAffiliation":
                _this.uCosmicStudentAffiliation = col;
                break;
            case "uCosmicForiegnAffiliation":
                _this.uCosmicForiegnAffiliation = col;
                break;
            case "status":
                _this.status = col;
                break;
            case "rank":
                _this.rank = col;
                break;
            case "level":
                _this.level = col;
                break;
            case "uCosmicAffiliation":
                _this.uCosmicAffiliation = col;
                break;
            case "termStart":
                _this.termStart = col;
                break;
            case "termEnd":
                _this.termEnd = col;
                break;
            case "country":
                _this.country = col;
                break;
            case "progCode":
                _this.progCode = col;
                break;
            case "progDescription":
                _this.progDescription = col;
                break;
            case "termDescription":
                _this.termDescription = col;
                break;
        }
        var nextCol = _this.next_letter(col);
        if (nextCol.charCodeAt(0) > _this.end_col.charCodeAt(0)) {
            return;
        }
        else {
            return _this.process_sheet_columns(sheet, nextCol, _this);
        }
    },
    process_sheet: function (sheet, row, _this, student_activity_array) {
        if (sheet[_this.externalId + row]) {
            var uCosmicAffiliation = sheet[_this.uCosmicAffiliation + row] ? sheet[_this.uCosmicAffiliation + row].v : null;
            var student = "3306_" + sheet[_this.externalId + row].v;
            var student_establishment = uCosmicAffiliation;
            var externalId = sheet[_this.externalId + row].v;
            var status = sheet[_this.status + row].v;
            var level = "3306_" + sheet[_this.level + row].v;
            var term = "3306_" + sheet[_this.termDescription + row].v;
            var country = sheet[_this.country + row].v;
            var progCode = sheet[_this.progCode + row] ? sheet[_this.progCode + row].v : null;
            var uCosmicStudentAffiliation = sheet[_this.uCosmicStudentAffiliation + row] ? sheet[_this.uCosmicStudentAffiliation + row].v : null;
            var uCosmicForiegnAffiliation = sheet[_this.uCosmicForiegnAffiliation + row] ? sheet[_this.uCosmicForiegnAffiliation + row].v : null;
            var options = {
                mobility_status: status, mobility_level: level, mobility_term: term, mobility_country: country, mobility_program: progCode, mobility_establishment: uCosmicAffiliation,
                mobility_student_foreign_establishment: uCosmicForiegnAffiliation, mobility_student_establishment: uCosmicStudentAffiliation, mobility_student: student,
                student_establishment: uCosmicAffiliation, student: student, student_external_id: externalId,
            };
            var my_student_activity = new Student.Excel(options);
            student_activity_array.push(my_student_activity);
            row += 1;
            if (row > _this.end_row) {
                return student_activity_array;
            }
            else {
                return _this.process_sheet(sheet, row, _this, student_activity_array);
            }
        }
        else {
            return student_activity_array;
        }
    },
    handleFile: function (e) {
        var _this = document.getElementById("new_student_page");
        var files = e.target.files;
        var i, f;
        for (i = 0, f = files[i]; i != files.length; ++i) {
            var reader = new FileReader();
            var name = f.name;
            reader.onload = function (e) {
                var data = e.target.result;
                var workbook = XLSX.read(data, { type: 'binary' });
                var sheet = workbook.Sheets[workbook.SheetNames[0]];
                _this.end_col = sheet["!ref"].substr(3, 1);
                _this.end_row = sheet["!ref"].substr(4);
                _this.process_sheet_columns(sheet, 'A', _this);
                var my_array = new Array();
                _this.excel = _this.process_sheet(sheet, 2, _this, my_array);
                _this.create_student_imports(_this);
            };
            reader.readAsBinaryString(f);
        }
    },
    test: function () {
        var list = Firebase.getAsArray(this.fire_students_mobilities_join);
    },
    create_student_imports: function (_this) {
        var student_original_data = Rx.Observable.fromArray(_this.excel);
        var list = Firebase.getAsArray(_this.fire_students_mobilities_join);
        var student_new_data = student_original_data
            .map(function (data) {
            data.mobility_country = _.findKey(_this.country_list, { 'country': data.mobility_country });
            data.mobility_term = _.has(_this.term_list, data.mobility_term.toLowerCase()) ? data.mobility_term.toLowerCase() : "false";
            data.mobility_level = _.has(_this.level_list, data.mobility_level.toLowerCase()) ? data.mobility_level.toLowerCase() : "false";
            data.mobility_program = _.has(_this.program_list, data.mobility_program.toString().replace(".", "_").toLowerCase()) ? data.mobility_program.toString().replace(".", "_").toLowerCase() : "false";
            data.mobility_establishment = _.findKey(_this.establishment_list, { 'establishment': data.mobility_establishment });
            data.student_establishment = _.findKey(_this.establishment_list, { 'establishment': data.student_establishment });
            data.mobility_student_establishment = _.findKey(_this.establishment_list, { 'establishment': data.mobility_student_establishment });
            data.mobility_student_foreign_establishment = _.findKey(_this.establishment_list, { 'establishment': data.mobility_student_foreign_establishment });
            return data;
        });
        var subscription2 = student_new_data.subscribe(function (x) {
            x.mobility_program = x.mobility_program.toString().replace(".", "_");
            console.log(x);
            list.$set(x.mobility_term + "_" + x.student, x);
        }, function (err) {
            console.log('Error: ' + err);
        }, function () {
            console.log('Completed');
        });
    },
    set_fire_students_mobilities_join: function (_this) {
        //_this = this;
        var norm = new Firebase.util.NormalizedCollection(_this.fire_students_mobilities, [_this.fire_students_students, 'Students', 'Mobilities.student']);
        norm.select({ key: 'Mobilities.student', alias: 'mobility_student' }, { key: 'Mobilities.level', alias: 'mobility_level' }, { key: 'Mobilities.term', alias: 'mobility_term' }, { key: 'Mobilities.establishment', alias: 'mobility_establishment' }, { key: 'Mobilities.country', alias: 'mobility_country' }, { key: 'Mobilities.program', alias: 'mobility_program' }, { key: 'Mobilities.status', alias: 'mobility_status' }, { key: 'Mobilities.foreign_establishmente', alias: 'mobility_foreign_establishmente' }, { key: 'Mobilities.student_establishment', alias: 'mobility_student_establishment' }, { key: 'Students.external_id', alias: 'student_external_id' }, { key: 'Students.establishment', alias: 'student_establishment' });
        var ref = norm.ref();
        ref.on("value", function (snapshot) {
            console.log(snapshot.val());
            setTimeout(function () {
                _this.fire_students_mobilities_join = norm.ref();
                var list = Firebase.getAsArray(_this.fire_students_mobilities_join);
            }, 1);
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        _this.fire_students_mobilities_join = norm.ref();
    },
    test2: function (_this) {
        _this = this;
        var norm = new Firebase.util.NormalizedCollection(_this.fire_students_mobilities, [_this.fire_students_students, 'Students', 'Mobilities.student'], [_this.fire_students_levels, 'Levels', 'Mobilities.level'], [_this.fire_students_terms, 'Terms', 'Mobilities.term'], [_this.fire_establishments, 'Establishments', 'Mobilities.establishment'], [_this.fire_countries, 'Countries', 'Mobilities.country'], [_this.fire_students_programs, 'Programs', 'Mobilities.program']);
        norm.select('Mobilities.student', 'Mobilities.level', 'Mobilities.term', 'Mobilities.establishment', 'Mobilities.country', 'Mobilities.program', 'Mobilities.status', 'Mobilities.foreign_establishment_official_name', 'Mobilities.student_establishment_official_name', 'Students.external_id', { key: 'Levels.name', alias: 'level_name' }, 'Levels.rank', 'Terms.start_date', 'Terms.end_date', { key: 'Terms.name', alias: 'term_name' }, { key: 'Establishments.official_name', alias: 'establishment_official_name' }, { key: 'Countries.official_name', alias: 'country_official_name' }, { key: 'Programs.name', alias: 'program_name' });
        var ref = norm.ref();
        ref.on("value", function (snapshot) {
            console.log(snapshot.val());
            setTimeout(function () {
                var list = Firebase.getAsArray(norm.ref());
            }, 1);
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        return (ref);
    },
    ajax_error: function (response) {
        this.isAjaxing = false;
        if (!response.detail.response.error) {
            console.log(response.detail.response);
        }
        else {
            console.log(response.detail.response.error);
        }
    },
});
