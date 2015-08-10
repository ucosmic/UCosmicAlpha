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
            observer: 'tenant_id_changed'
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
        },
        columns: {
            type: Array,
            notify: true,
            observer: 'columns_changed'
        },
        term_search: {
            type: String,
            notify: true,
            value: ""
        },
        selected_term_id: {
            type: Number,
            notify: true,
            value: 0
        },
        term_auto_list: {
            type: Array,
            notify: true,
            value: []
        },
        default_terms: {
            type: Array,
            notify: true,
            value: [],
            observer: 'default_terms_changed'
        },
        can_start_file_processing: {
            type: Boolean,
            value: false
        }
    },
    worker_processing: false,
    progress: "",
    toggle_can_start_file_processing: _.after(5, function () {
        this.can_start_file_processing = true;
    }),
    created: function () {
        var _this = this;
        this.fire_students_programs = new Firebase("https://UCosmic.firebaseio.com/Students/Programs");
        this.fire_countries = new Firebase("https://UCosmic.firebaseio.com/Places/Countries");
        this.fire_establishments = new Firebase("https://UCosmic.firebaseio.com/Establishments/Establishments");
        this.fire_students_programs.on("value", function (snapshot) {
            var program_list = snapshot.val();
            _this.program_list = _.map(program_list, function (value, key) {
                value.id = key;
                return value;
            });
            _this.toggle_can_start_file_processing();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        this.fire_establishments.on("value", function (snapshot) {
            _this.establishment_list = snapshot.val();
            _this.toggle_can_start_file_processing();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        this.fire_countries.on("value", function (snapshot) {
            _this.country_list = snapshot.val();
            _this.toggle_can_start_file_processing();
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
    columns_changed: function (new_value, old_value) {
        if (old_value) {
            this.fire_members_settings_mobility_counts.set(new_value, function (error) {
            });
        }
    },
    default_terms_changed: function (new_value, old_value) {
        if (old_value) {
            var my_object = {};
            _.forEach(this.default_terms, function (value, index) {
                my_object[value] = true;
            });
            this.fire_members_settings_mobility_terms.set(my_object, function (error) {
            });
        }
    },
    tenant_id_changed: function (new_value, old_value) {
        var _this = this;
        this.fire_members_terms = new Firebase("https://UCosmic.firebaseio.com/Members/" + new_value + "/Terms");
        this.fire_students_levels = new Firebase("https://UCosmic.firebaseio.com/Members/" + new_value + "/Levels");
        this.fire_members_settings_mobility_counts = new Firebase("https://UCosmic.firebaseio.com/Members/" + new_value + "/Settings/Mobility_Counts");
        this.fire_members_settings_mobility_terms = new Firebase("https://UCosmic.firebaseio.com/Members/" + new_value + "/Settings/Terms");
        this.fire_members_terms.on("value", function (snapshot) {
            _this.term_list = snapshot.val();
            _this.term_list_2 = _.map(snapshot.val(), function (value, index) {
                if (value) {
                    var object = { _id: index, text: index };
                    return object;
                }
            });
            _this.toggle_can_start_file_processing();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        this.fire_students_levels.on("value", function (snapshot) {
            _this.level_list = snapshot.val();
            _this.toggle_can_start_file_processing();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        this.fire_members_settings_mobility_counts.once("value", function (snapshot) {
            _this.columns = snapshot.val();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        this.fire_members_settings_mobility_terms.once("value", function (snapshot) {
            _.forEach(snapshot.val(), function (value, index) {
                _this.push('default_terms', index);
            });
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    },
    start_file_process: function (worker, sheet, my_array, _this) {
        worker.postMessage({
            'sheet': JSON.stringify(sheet),
            'my_array': JSON.stringify(my_array),
            'tenant_id': _this.tenant_id.toString(),
            'establishment_list': JSON.stringify(_this.establishment_list),
            'country_list': JSON.stringify(_this.country_list),
            'program_list': JSON.stringify(_this.program_list),
            'term_list': JSON.stringify(_this.term_list),
            'level_list': JSON.stringify(_this.level_list)
        });
    },
    check_if_can_start_file_process: function (sheet, my_array, _this) {
        if (this.can_start_file_processing && !_this.worker_processing) {
            var worker = new Worker('/components/resources/js/student_in_out_excel.js');
            worker.addEventListener('message', function (e) {
                _this.progress = e.data;
                if (_this.progress == 'Completed!') {
                    _this.worker_processing = false;
                }
            }, false);
            _this.worker_processing = true;
            this.start_file_process(worker, sheet, my_array, _this);
        }
        else if (!_this.worker_processing) {
            this.check_if_can_start_file_process(sheet, my_array, _this);
        }
    },
    handleFile: function (e) {
        var _this = document.getElementById("new_student_page");
        _this.progress = 'Processing';
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
                if (_this.can_start_file_processing && !_this.worker_processing) {
                    var worker = new Worker('/components/resources/js/student_in_out_excel.js');
                    worker.addEventListener('message', function (e) {
                        _this.progress = e.data;
                        if (_this.progress == 'Completed!') {
                            _this.worker_processing = false;
                        }
                    }, false);
                    _this.worker_processing = true;
                    _this.start_file_process(worker, sheet, my_array, _this);
                }
                else {
                    _this.check_if_can_start_file_process(sheet, my_array, _this);
                }
            };
            reader.readAsBinaryString(f);
        }
    },
    term_selected: function (event, detail, sender) {
        this.term = this.selected_term_id ? this.selected_term_id : 'all';
        var term_selected = this.term != 'all' ? _.result(_.find(this.term_list, { '_id': this.term }), 'text') : 'all';
        this.$.term_auto_ddl.selected = '';
        if (term_selected != 'all') {
            this.default_terms.push(this.term);
            this.default_terms = _.uniq(this.default_terms);
        }
    },
    term_list_search: function (event, detail, sender) {
        this.term_auto_list = this.term_list_2;
    },
    remove_default_term: function (event) {
        var term = this.querySelector("#default_terms").itemForElement(event.target);
        var index = this.default_terms.indexOf(term);
        this.splice('default_terms', index, 1);
        this.default_terms_changed(this.default_terms, this.default_terms);
    }
});
