/// <reference path="../../../../scripts/typings/lodash.d.ts" />
/// <reference path="../../../typediff/mytypes.d.ts" />
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
    can_start_file_processing: false,
    created: function () {
        var _this = this;
        this.fire_students_terms = new Firebase("https://UCosmic.firebaseio.com/Students/Terms");
        this.fire_students_programs = new Firebase("https://UCosmic.firebaseio.com/Students/Programs");
        this.fire_students_levels = new Firebase("https://UCosmic.firebaseio.com/Students/Levels");
        this.fire_countries = new Firebase("https://UCosmic.firebaseio.com/Places/Countries");
        this.fire_establishments = new Firebase("https://UCosmic.firebaseio.com/Establishments/Establishments");
        var can_start_file_processing = _.after(5, function () {
            _this.can_start_file_processing = true;
        });
        this.fire_students_levels.on("value", function (snapshot) {
            _this.level_list = snapshot.val();
            can_start_file_processing();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        this.fire_students_programs.on("value", function (snapshot) {
            _this.program_list = snapshot.val();
            can_start_file_processing();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        this.fire_students_terms.on("value", function (snapshot) {
            _this.term_list = snapshot.val();
            can_start_file_processing();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        this.fire_establishments.on("value", function (snapshot) {
            _this.establishment_list = snapshot.val();
            can_start_file_processing();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        this.fire_countries.on("value", function (snapshot) {
            _this.country_list = snapshot.val();
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
                }
                else {
                    console.log("Login Succeeded!", authData);
                }
            });
        }
        this.$.file_input.addEventListener('change', this.handleFile, false);
    },
    start_file_process: function (worker, sheet, my_array, _this) {
        worker.postMessage({
            'sheet': JSON.stringify(sheet),
            'my_array': JSON.stringify(my_array),
            'tenant_id': _this.tenant_id.toString(),
            'establishment_list': JSON.stringify(_this.establishment_list),
            'country_list': JSON.stringify(_this.establishment_list),
            'program_list': JSON.stringify(_this.establishment_list),
            'term_list': JSON.stringify(_this.establishment_list),
            'level_list': JSON.stringify(_this.level_list)
        });
    },
    check_if_can_start_file_process: function (worker, sheet, my_array, _this) {
        if (this.can_start_file_processing) {
            this.start_file_process(worker, sheet, my_array, _this);
        }
        else {
            this.check_if_can_start_file_process(worker, sheet, my_array, _this);
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
                var my_array = new Array();
                var worker = new Worker('/components/resources/js/student_in_out_excel.js');
                if (this.can_start_file_processing) {
                    this.start_file_process(worker, sheet, my_array, _this);
                }
                else {
                    this.check_if_can_start_file_process(worker, sheet, my_array, _this);
                }
            };
            reader.readAsBinaryString(f);
        }
    },
});
