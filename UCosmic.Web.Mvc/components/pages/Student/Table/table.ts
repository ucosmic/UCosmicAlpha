/// <reference path="../../../../scripts/typings/lodash.d.ts" />
/// <reference path="../../../typediff/mytypes.d.ts" />
/// <reference path="../../../models/students.ts" />
/// <reference path="../../../../scripts/typings/lodash.d.ts" />

 
 
import Student_Table = Students

Polymer({
    is: "is-page-student-table",
    properties: {
        style_domain: {
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
        mobilities: {
            type: Array
            , notify: true
            , observer: 'mobilities_changed'
        }
        , affiliation_search: {
            type: String,
            notify: true,
            value: ""
        }
        , selected_affiliation_id: {
            type: Number,
            notify: true,
            value: 0
        }
        , affiliation_auto_list: {
            type: Array,
            notify: true,
            value: []
        }
        , countrySearch: {
            type: String,
            notify: true,
            value: ""
        }
        , selectedCountryId: {
            type: Number,
            notify: true,
            value: 0
        }
        , country_auto_list: {
            type: Array,
            notify: true,
            value: []
        }
        , program_search: {
            type: String,
            notify: true,
            value: ""
        }
        , selected_program_id: {
            type: Number,
            notify: true,
            value: 0
        }
        , program_auto_list: {
            type: Array,
            notify: true,
            value: []
        }
        , level_search: {
            type: String,
            notify: true,
            value: ""
        }
        , selected_level_id: {
            type: Number,
            notify: true,
            value: 0
        }
        , level_auto_list: {
            type: Array,
            notify: true,
            value: []
        }
        , status_search: {
            type: String,
            notify: true,
            value: ""
        }
        , selected_status_id: {
            type: Number,
            notify: true,
            value: 0
        }
        , status_auto_list: {
            type: Array,
            notify: true,
            value: []
        }
        , term_search: {
            type: String,
            notify: true,
            value: ""
        }
        , selected_term_id: {
            type: Number,
            notify: true,
            value: 0
        }
        , term_auto_list: {
            type: Array,
            notify: true,
            value: []
        }
        , foreign_affiliation_search: {
            type: String,
            notify: true,
            value: ""
        }
        , selected_foreign_affiliation_id: {
            type: Number,
            notify: true,
            value: 0
        }
        , foreign_affiliation_auto_list: {
            type: Array,
            notify: true,
            value: []
        }
        , student_affiliation_search: {
            type: String,
            notify: true,
            value: ""
        }
        , selected_student_affiliation_id: {
            type: Number,
            notify: true,
            value: 0
        }
        , student_affiliation_auto_list: {
            type: Array,
            notify: true,
            value: []
        }
        , tags_count: {
            type: Number,
            notify: true
            , observer: 'tags_count_changed'
        }
        , tags: {
            type: Array,
            notify: true
            , observer: 'tags_changed'
        }
        , tags_split: {
            type: Array
            , computed: 'tags_splitter(tags)'
        }
        , status_list: {
            type: Array,
            notify: true
        }
        , affiliation_list: {
            type: Array,
            notify: true
        }
        , student_affiliation_list: {
            type: Array,
            notify: true
        }
        , foreign_affiliation_list: {
            type: Array,
            notify: true
        }
        , establishment_list: {
            type: Array,
            notify: true
        }
        , country_list: {
            type: Array,
            notify: true,
        }
        , program_list: {
            type: Array,
            notify: true,
        }
        , student_list: {
            type: Array,
            notify: true,
        }
        , level_list: {
            type: Array,
            notify: true,
        }
        , student_table_storage: {
            type: Object,
            notify: true,
        }
        , student_table_storage_computed: {
            type: Array
            , computed: 'student_table_storage_compute(mobilities, establishment_list, country_list, program_list, level_list, tags, columns, last_term_tags, last_status, terms_statuses)'
            //, observer: 'tags_split_changed'
        }
        , filter_closed: {
            type: Boolean,
            value: false
            , notify: true
            , observer: 'filter_closed_changed'
        }
    //, order_by_list: {
    //    type: Array,
    //    notify: true,
    //    value: [ //redo this based on columns shown - add foreign affiliation and student aff
    //        { value: 'start_date-desc', text: 'Most Recent First' }
    //        , { value: 'end_date-asc', text: 'Most Recent Last' }
    //        , { value: 'status-desc', text: 'In Coming First' }
    //        , { value: 'status-asc', text: 'Out Going First' }
    //        , { value: 'affiliation_name-desc', text: 'Affiliation A-Z' }
    //        , { value: 'affiliation_name-asc', text: 'Affiliation Z-A' }
    //        , { value: 'foreign_affiliation_name-desc', text: 'Foreign Affiliation A-Z' }
    //        , { value: 'foreign_affiliation_name-asc', text: 'Foreign Affiliation Z-A' }
    //        , { value: 'country_name-desc', text: 'country A-Z' }
    //        , { value: 'country_name-asc', text: 'country Z-A' }
    //        , { value: 'program_name-desc', text: 'program A-Z' }
    //        , { value: 'program_name-asc', text: 'program Z-A' }
    //        , { value: 'level_name-desc', text: 'level A-Z' }
    //        , { value: 'level_name-asc', text: 'level Z-A' }
    //        , { value: 'student_affiliation_name-desc', text: 'Student Affiliation A-Z' }
    //        , { value: 'student_affiliation_name-asc', text: 'Student Affiliation Z-A' }
    //    ]
    //}
        , columns: {
            type: Array,
            notify: true,
            observer: 'columns_changed'
        }
        , mobilities_page: {
            type: Array,
            notify: true,
            value: []
        }
        , order_by: {
            type: String,
        }
        , asc_desc: {
            type: String,
        }
        , order_index: {
            type: Number,
            observer: 'order_index_changed'
        }
        , data_loaded: {
            type: Object
            , observer: 'data_loaded_changed'
            , value: { init: { 'is_loaded': false } }
        }
        , is_data_loaded: {
            type: Boolean
            , value: false
        }
        , terms_statuses: {
            type: Object
            , notify: true
        }
    },
    //fire: null,
    //mobilities_page: [],
    keys: {},
    fire_students: null,
    fire_students_students: null,
    fire_establishments: null,
    fire_members_terms: null,
    fire_students_levels: null,
    fire_students_programs: null,
    fire_students_mobilities: null,
    fire_students_mobilities_join: null,
    fire_countries: null,
    fire_norm: null,
    is_routing_setup: false,
    lastEstablishmentSearch: "",
    last_selected_establishment_id: -1,
    controller: null,
    total: 0
//term_count: 0,
//status_count: 0,
//affiliation_count: 0,
//level_count: 0,
//student_affiliation_count: 0,
//foreign_affiliation_count: 0,
//program_count: 0,
//country_count: 0
    , count_list_orignal: [{ name: 'Countries', is_clicked: false, show_all: false }, { name: 'Programs', is_clicked: false, show_all: false }
        , { name: 'Levels', is_clicked: false, show_all: false }, { name: 'Affiliations', is_clicked: false, show_all: false }
        , { name: 'Status', is_clicked: false, show_all: false }, { name: 'Terms', is_clicked: false, show_all: false }
        , { name: 'Student Affiliations', is_clicked: false, show_all: false }, { name: 'Foreign Affiliations', is_clicked: false, show_all: false }]
    , count_list1: this.count_list_orignal
    , count_list2: this.count_list1
//, count_list3: [{ name: 'Countries', is_clicked: false, show_all: false }, { name: 'Programs', is_clicked: false, show_all: false }, { name: 'Levels', is_clicked: false, show_all: false }] 
    , created: function () {
        this.controller = this;
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
        this.count_list_original = [{ name: 'Countries', is_clicked: false, show_all: false }, { name: 'Programs', is_clicked: false, show_all: false }
            , { name: 'Levels', is_clicked: false, show_all: false }, { name: 'Affiliations', is_clicked: false, show_all: false }
            , { name: 'Status', is_clicked: false, show_all: false }, { name: 'Terms', is_clicked: false, show_all: false }
            , { name: 'Student Affiliations', is_clicked: false, show_all: false }, { name: 'Foreign Affiliations', is_clicked: false, show_all: false }];
        this.count_list1 = this.count_list_original;
        this.count_list2 = this.count_list1;

        this.mobilities_filtered = [];
    }
    , fire_students_tenant_keys: null
    , get_mobility_value: function (column_name, mobility) {

        switch (column_name.replace(" ", "_").toLowerCase()) {
            case "term": return mobility.term_name;
            case "status": return mobility.status;
            case "affiliation": return mobility.affiliation_name;
            case "country": return mobility.country_name;
            case "level": return mobility.level;
            case "program": return mobility.program_name;
            case "student_affiliation": return mobility.student_affiliation_name;
            case "foreign affiliation": return mobility.foreign_affiliation_name;
            default: return "";
        }
    }


    , tenant_id_changed: function (new_value, old_value) {

        //this.fire_members_terms = new Firebase("https://UCosmic.firebaseio.com/Students/Terms/" + new_value),
        this.fire_members_terms = new Firebase("https://UCosmic.firebaseio.com/Members/" + new_value + "/Terms");
        this.fire_students_levels = new Firebase("https://UCosmic.firebaseio.com/Members/" + new_value + "/Levels");
        this.fire_members_settings_mobility_counts = new Firebase("https://UCosmic.firebaseio.com/Members/" + new_value + "/Settings/Mobility_Counts");
        this.fire_members_settings_terms = new Firebase("https://UCosmic.firebaseio.com/Members/" + new_value + "/Settings/Terms");
        this.fire_establishments = new Firebase("https://UCosmic.firebaseio.com/Establishments/Establishments");
        this.fire_terms = new Firebase("https://UCosmic.firebaseio.com/Establishments/Establishments");
        this.fire_students_programs = new Firebase("https://UCosmic.firebaseio.com/Students/Programs");
        this.fire_countries = new Firebase("https://UCosmic.firebaseio.com/Places/Countries");

        this.status_list = [{ _id: 'IN', text: 'In' }, { _id: 'OUT', text: 'Out' }];


        this.fire_establishments.once("value", (snapshot) => {
            this.establishment_list = _.map(snapshot.val(), function (value: any, index) {
                if (value) {
                    var object = { _id: index, text: value.establishment }
                    return object;
                }
            })
             
            var affiliation_list = [];
            if (this.establishment_list) {
                _.forEach(new_value, (value: any, index) => {
                    affiliation_list = _.union(affiliation_list, [this.establishment_list[value.affiliation]]);
                })
            }
            var student_affiliation_list = [];
            if (this.establishment_list) {
                _.forEach(new_value, (value: any, index) => {
                    student_affiliation_list = _.union(student_affiliation_list, [this.establishment_list[value.student_affiliation]]);
                })
            }
            var foreign_affiliation_list = [];
            if (this.establishment_list) {
                _.forEach(new_value, (value: any, index) => {
                    foreign_affiliation_list = _.union(foreign_affiliation_list, [this.establishment_list[value.foreign_affiliation]]);
                })
            }
            this.student_affiliation_list = student_affiliation_list;
            this.affiliation_list = affiliation_list;
            this.foreign_affiliation_list = foreign_affiliation_list;
            this.start_setup_filter();

        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });

        this.fire_students_levels.once("value", (snapshot) => {
            this.level_list = _.map(snapshot.val(), function (value: any, index) {
                if (value) {
                    var object = { _id: index, text: value.name }
                    return object;
                }
            })
            this.start_setup_filter();

        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });

        this.fire_countries.once("value", (snapshot) => {
            this.country_list = _.map(snapshot.val(), function (value: any, index) {
                if (value) {
                    var object = { _id: index, text: value.country }
                    return object;
                }
            })
            this.start_setup_filter();
        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });

        this.fire_students_programs.once("value", (snapshot) => {
            this.program_list = _.map(snapshot.val(), function (value: any, index) {
                if (value) {
                    var object = { _id: index, text: value.name }
                    return object;
                }
            })
            this.start_setup_filter();
        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });


        this.fire_members_terms.once("value", (snapshot) => {
            this.term_list = _.map(snapshot.val(), function (value: any, index) {
                if (value) {
                    var object = { _id: index, text: index }
                    return object;
                }
            })
            this.start_setup_filter();
        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });

        this.fire_members_settings_terms.once("value", (snapshot) => {
            var settings_term_list = _.map(snapshot.val(), function (value: any, index) {
                if (value) {
                    var object = { text: index }
                    return object;
                }
            })
            if (!this.tags_split || !this.tags_split.term_tags || this.tags_split.term_tags.length == 0) {
                _.forEach(settings_term_list, (value: any, index) => {
                    this.add_tag(value.text, value.text, 'term');
                });
            }
            this.start_setup_filter();
        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });
        var mobility_snapshot = []
        var counter = 0;
        //this.start_setup_filter();
        //this.fire_students_tenant_keys = new Firebase("https://UCosmic.firebaseio.com/Members/" + this.tenant_id + '/Mobilities/Keys');

        //this.fire_students_tenant_keys.once("value", (snap) => {
        //    this.mobilities = snap.val();
        //    this.start_setup_filter();
        //});
        this.fire_students_tenant_values = new Firebase("https://UCosmic.firebaseio.com/Members/" + this.tenant_id + '/Mobilities/Values');


    }

    , start_setup_filter: _.after(8, function () {
        if (!this.is_routing_setup) {
            this.setup_routing();
        } else {
            this.filter_table(this);
        }
    })
    , student_table_storage_compute: function (mobilities, establishment_list, country_list, program_list, level_list, tags, columns, last_term_tags, last_status, terms_statuses) {
        var date_stored = this.student_table_storage ? this.student_table_storage.date_stored : undefined;

        if (!date_stored || terms_statuses != this.student_table_storage.terms_statuses) {
            date_stored = Date.now();
        }
        this.student_table_storage = {
            mobilities: mobilities
            , establishment_list: establishment_list
            , country_list: country_list
            , program_list: program_list
            , level_list: level_list
            , tags: tags
            , columns: columns
            , last_term_tags: last_term_tags
            , last_status: last_status
            , terms_statuses: terms_statuses
            , date_stored: date_stored
        }
        this.$.student_table_storage.save();
        return this.student_table_storage;
    }
    , in_days: function (t1, t2) {
        //var t2 = d2.getTime();
        //var t1 = d1.getTime();

        return (t2 - t1) / (24 * 3600 * 1000);
    }

    , student_table_storage_loaded: function () {
        if (!this.student_table_storage_computed) {
            //var load_new_data = this.student_table_storage.date_stored ? (this.in_days(this.student_table_storage.date_stored, Date.now()) > 1 ? true : false) : false;
            if (this.student_table_storage && this.student_table_storage.mobilities && this.student_table_storage.mobilities.length && !(this.student_table_storage.date_stored ? (this.in_days(this.student_table_storage.date_stored, Date.now()) > 1 ? true : false) : false)) {// && this.mobilities.length > 0) {
                this.mobilities = this.student_table_storage.mobilities;
                this.establishment_list = this.student_table_storage.establishment_list;
                this.country_list = this.student_table_storage.country_list;
                this.program_list = this.student_table_storage.program_list;
                this.level_list = this.student_table_storage.level_list;
                this.tags = this.student_table_storage.tags;
                this.last_term_tags = this.student_table_storage.last_term_tags;
                this.last_status = this.student_table_storage.last_status;
                this.terms_statuses = this.student_table_storage.terms_statuses ? this.student_table_storage.terms_statuses : {};
                this.columns = this.student_table_storage.columns
                //    ? this.student_table_storage.columns : [ //redo this based on columns shown - add foreign affiliation and student aff
                //    { is_shown: true, text: 'Term' }
                //    , { is_shown: true, text: 'Status' }
                //    , { is_shown: true, text: 'Affiliation' }
                //    , { is_shown: true, text: 'Foreign Affiliation' }
                //    , { is_shown: true, text: 'Country' }
                //    , { is_shown: true, text: 'Level' }
                //    , { is_shown: true, text: 'Program' }
                //    , { is_shown: true, text: 'Student Affiliation' }
                //];
                this.setup_routing();
            } else if (!this.mobilities && !this.establishment_list && !this.country_list && !this.program_list && !this.level_list && !this.tags) {
                if (this.student_table_storage) {
                    this.student_table_storage.date_stored = Date.now();
                }
                this.mobilities = [];
                this.establishment_list = [];
                this.country_list = [];
                this.program_list = [];
                this.level_list = [];
                this.tags = [];
                this.last_term_tags = [];
                this.last_status = [];
                this.terms_statuses = {};
                //this.columns = [ //redo this based on columns shown - add foreign affiliation and student aff
                //    { is_shown: true, text: 'Term' }
                //    , { is_shown: true, text: 'Status' }
                //    , { is_shown: true, text: 'Affiliation' }
                //    , { is_shown: true, text: 'Foreign Affiliation' }
                //    , { is_shown: true, text: 'Country' }
                //    , { is_shown: true, text: 'Level' }
                //    , { is_shown: true, text: 'Program' }
                //    , { is_shown: true, text: 'Student Affiliation' }
                //]
                this.start_setup_filter();
            }
        }
        if (this.columns) {
            this.start_setup_filter();
        } else {
            this.fire_members_settings_mobility_counts.once("value", (snapshot) => {

                this.columns = snapshot.val();
                this.start_setup_filter();
            }, function (errorObject) {
                    console.log("The read failed: " + errorObject.code);
                });
        }
    }
    , student_table_storage_loaded_empty: function () {
        this.start_setup_filter();
    },

    init2: function () {
    }

    , filter_closed_changed: function (new_value, old_value) {
        if (new_value) {
            this.$.tags.toggle(true);
        }
    }

    , mobilities_changed: function (new_value, old_value) {
        //should throttle/debounce
        //this.country_count = _.uniq(new_value, 'c');
        var affiliation_list = [];
        if (this.establishment_list) {
            _.forEach(new_value, (value: any, index) => {
                affiliation_list = _.union(affiliation_list, [this.establishment_list[value.affiliation]]);
            })
        }
        var student_affiliation_list = [];
        if (this.establishment_list) {
            _.forEach(new_value, (value: any, index) => {
                student_affiliation_list = _.union(student_affiliation_list, [this.establishment_list[value.student_affiliation]]);
            })
        }
        var foreign_affiliation_list = [];
        if (this.establishment_list) {
            _.forEach(new_value, (value: any, index) => {
                foreign_affiliation_list = _.union(foreign_affiliation_list, [this.establishment_list[value.foreign_affiliation]]);
            })
        }
        this.student_affiliation_list = student_affiliation_list;
        this.affiliation_list = affiliation_list;
        this.foreign_affiliation_list = foreign_affiliation_list;
    }

    , is_false: function (value) {
        if (value) {
            return false;
        } else {
            return true;
        }
    },
    _load_mobility_data: function (_this) {
        if (_this.mobilities && _this.mobilities.length > 0) {
            _this.mobilities = _.map(_this.mobility_snapshot, function (value: any, index) {
                value.status = value.status == 'IN' ? "In Coming" : "Out Going";
                value.affiliation_name = _this.affiliation_list[value.affiliation] ? _this.affiliation_list[value.affiliation].text : "";
                value.student_affiliation_name = _this.student_affiliation_list[value.student_affiliation] ? _this.student_affiliation_list[value.student_affiliation].text : "";
                value.foreign_affiliation_name = _this.foreign_affiliation_list[value.foreign_affiliation] ? _this.foreign_affiliation_list[value.foreign_affiliation].text : "";
                return value;
            });

            _this.start_setup_filter();
        } else {

            _this.mobilities = _.map(_this.mobility_snapshot, function (value: any, index) {
                value.status = value.status == 'IN' ? "In Coming" : "Out Going";
                value.affiliation_name = _this.affiliation_list[value.affiliation] ? _this.affiliation_list[value.affiliation].text : "";
                value.student_affiliation_name = _this.student_affiliation_list[value.student_affiliation] ? _this.student_affiliation_list[value.student_affiliation].text : "";
                value.foreign_affiliation_name = _this.foreign_affiliation[value.foreign_affiliation] ? _this.foreign_affiliation[value.foreign_affiliation].text : "";
                return value;
            });

            _this.start_setup_filter();
        }
    }

    , tags_count_changed: function (new_value, old_value) {
        if (new_value < old_value) {
            this.calculate_counts(this);
        }
    }

    , tags_changed: function (new_value, old_value) {
        if (old_value) {
            this.filter_table(this);
        }
        this.tags_split_union();
    }
    , tags_splitter: function (tags) {

        var affiliation_tags = _.uniq(_.filter(tags, function (tag: any) {
            if (tag._type == 'affiliation') {
                return tag;
            }
        }), '_id');
        var country_tags = _.uniq(_.filter(tags, function (tag: any) {
            if (tag._type == 'country') {
                return tag;
            }
        }), '_id');
        var program_tags = _.uniq(_.filter(tags, function (tag: any) {
            if (tag._type == 'program') {
                return tag;
            }
        }), '_id');
        var level_tags = _.uniq(_.filter(tags, function (tag: any) {
            if (tag._type == 'level') {
                return tag;
            }
        }), '_id');
        var term_tags = _.uniq(_.filter(tags, function (tag: any) {
            if (tag._type == 'term') {
                return tag;
            }
        }), '_id');
        var status_tags = _.uniq(_.filter(tags, function (tag: any) {
            if (tag._type == 'status') {
                return tag;
            }
        }), '_id');
        var foreign_affiliation_tags = _.uniq(_.filter(tags, function (tag: any) {
            if (tag._type == 'foreign_affiliation') {
                return tag;
            }
        }), '_id');
        var student_affiliation_tags = _.uniq(_.filter(tags, function (tag: any) {
            if (tag._type == 'student_affiliation') {
                return tag;
            }
        }), '_id');
        return {
            affiliation_tags: affiliation_tags, country_tags: country_tags, program_tags: program_tags, level_tags: level_tags, term_tags: term_tags
            , status_tags: status_tags, foreign_affiliation_tags: foreign_affiliation_tags, student_affiliation_tags: student_affiliation_tags
        }
    }
    , tags_split_union: function () {
        var _this: any = document.querySelector("#page_student_table");
        var union_tags = _.union(_this.tags_split.affiliation_tags, _this.tags_split.country_tags, _this.tags_split.program_tags, _this.tags_split.level_tags, _this.tags_split.term_tags
            , _this.tags_split.status_tags, _this.tags_split.foreign_affiliation_tags, _this.tags_split.student_affiliation_tags);
        if (_this.tags.length != union_tags.length) {
            _this.tags = union_tags;
        }
    }

    , capitaliseFirstLetter: function (myString) {
        return myString.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    }

    , show_all_check: function (show_all, index) {
        if (!show_all && index > 9) {
            return false;
        } else {
            return true;
        }
    }
    , show_all: function (event, target, test) {
        var tag = this.$.count_l1.itemForElement(event.target);
        //tag.show_all = tag.show_all ? false : true;
        if (tag.show_all) {
            event.target.parentElement.parentElement.querySelector('#collapse_outer' + this.$.count_l1.indexForElement(event.target)).toggle();
            setTimeout(() => {
                tag.show_all = false;
                this.count_list1 = JSON.parse(JSON.stringify(this.count_list1));
                setTimeout(() => {
                    event.target.parentElement.parentElement.querySelector('#collapse_outer' + this.$.count_l1.indexForElement(event.target)).toggle();
                }, 100);
            }, 200);

        } else {
            event.target.parentElement.parentElement.querySelector('#collapse_outer' + this.$.count_l1.indexForElement(event.target)).toggle();
            setTimeout(() => {
                tag.show_all = true;
                this.count_list1 = JSON.parse(JSON.stringify(this.count_list1));
                setTimeout(() => {
                    event.target.parentElement.parentElement.querySelector('#collapse_outer' + this.$.count_l1.indexForElement(event.target)).toggle();
                }, 100);
            }, 100);
        }
    }
    , count_clicked: function (event, target, test) {
        var index = event.target.parentElement.id;
        //var parent = event.model.dataHost.parentElement.children['count_l' + index];
        //var tag = parent.itemForElement(event.target); 
        var tag = event.model.__data__['count_l' + index];
        //var tag = this.$['count_l' + index].itemForElement(event.target);
        if (this.get_count(tag.name) > 0) {
            if (tag.is_clicked) {
                event.target.parentElement.parentElement.querySelector('#collapse_outer' + event.model.__data__.__key__).opened = false;
                setTimeout(() => {
                    tag.is_clicked = false;
                    this['count_list' + index] = JSON.parse(JSON.stringify(this['count_list' + index]));
                }, 500);

            } else {
                tag.is_clicked = true;
                this['count_list' + index] = JSON.parse(JSON.stringify(this['count_list' + index]));
                setTimeout(() => {
                    event.target.parentElement.parentElement.querySelector('#collapse_outer' + event.model.__data__.__key__).opened = true;
                }, 100);
            }
        }
        //event.model.is_clicked = true;
        //*** may have to reset the object with json parse stringify
    }
    , array_clicked: function (event, target, test) {
        var index = event.target.parentElement.id;
        //var tag = this.$['array_l' + index].itemForElement(event.target);
        var parent = event.model.dataHost.parentElement.children['array_l' + index];
        //var tag = parent.itemForElement(event.target);
        var tag = event.model.__data__['array_l1'];
        var collection = event.model.dataHost.dataHost.dataHost.items;//event.model.dataHost.modelForElement(event.target);//event.model.__data__;//parent.modelForElement(event.target);
        if (tag.is_clicked) {
            //event.target.parentElement.parentElement.querySelector('#collapse_inner' + parent.indexForElement(event.target)).opened = false;
            event.target.parentElement.parentElement.querySelector('#collapse_inner' + event.model.dataHost.dataHost.__key__).opened = false;
            setTimeout(() => {
                tag.is_clicked = false;
                event.model.dataHost.dataHost.dataHost.items = JSON.parse(JSON.stringify(event.model.dataHost.dataHost.dataHost.items));
                //collection.dataHost.items = JSON.parse(JSON.stringify(collection.dataHost.items));
            }, 500);

        } else {
            tag.is_clicked = true;
            //collection.dataHost.items = JSON.parse(JSON.stringify(collection.dataHost.items));
            event.model.dataHost.dataHost.dataHost.items = JSON.parse(JSON.stringify(event.model.dataHost.dataHost.dataHost.items));
            setTimeout(() => { 
                //event.target.parentElement.parentElement.querySelector('#collapse_inner' + parent.indexForElement(event.target)).opened = true;
                event.target.parentElement.parentElement.querySelector('#collapse_inner' + event.model.dataHost.dataHost.__key__).opened = true;
            }, 100);
        }

        //this['array_list' + index] = JSON.parse(JSON.stringify(this['array_list' + index]));
        //event.model.is_clicked = true;
        //*** may have to reset the object with json parse stringify
    }
    , get_count_name: function (value) {
        switch (value) {
            case "Countries":
                return 'country';
            case "Programs":
                return 'program';
            case "Levels":
                return 'level';
            case "Affiliations":
                return 'affiliation';
            case "Status":
                return 'status';
            case "Terms":
                return 'term';
            case "Student Affiliations":
                return 'student_affiliation';
            case "Foreign Affiliations":
                return 'foreign_affiliation';
        }
    }
    , get_name: function (my_array, count) {
        count = this.get_count_name(count);
        var x: any = _.find(this[count + '_list'], function (value: any, index) {
            if (value) {
                return value._id == my_array[count];
            }
        })
        if (x) {
            return x.text;
        }
    }
    , create_array: function (...count: string[]) {

        /* Go about 6/7 layers deep hard coded. 
            Each count can be clicked to expand and then show sub results, then repeated with the count_list
        */
        var my_list = [];
        _.forEach(count, (value, index) => {
            value = this.get_count_name(value);
            //switch (value) {
            //    case "Countries":
            //        value = 'country';
            //        break;
            //    case "Programs":
            //        value = 'program';
            //        break;
            //    case "Levels":
            //        value = 'level';
            //        break;
            //    case "Affiliations":
            //        value = 'affiliation';
            //        break;
            //}
            my_list = _.union(_.uniq(this.mobilities_filtered, value), my_list);
        });
        return _.sortBy(my_list, (my_array: any) => {
            return -1 * (this.get_count_inner(my_array, count[count.length - 1]));
        });
    }
    , get_count: function (...count: string[]) {
        var my_array = JSON.parse(JSON.stringify(this.mobilities_filtered));
        var my_list = [];
        _.forEach(count, (value, index) => {
            value = this.get_count_name(value);
            my_array = _.filter(my_array, function (value2, index) {
                return value2[value] != 'none';
            });
            //switch (value) {
            //    case "Countries":
            //        value = 'country';
            //        break;
            //    case "Programs":
            //        value = 'program';
            //        break;
            //    case "Levels":
            //        value = 'level';
            //        break;
            //    case "Affiliations":
            //        value = 'affiliation';
            //        break;
            //}
            my_list = _.union(_.uniq(my_array, value), my_list);
        });
        return my_list.length;
    }
    , check_is_clicked: function (name, index) {
        //document.querySelector(name + index)
        var tag = this.querySelector('#array_l' + index);//.itemForElement(this.querySelector('#array_item' + index)); 
        return tag.items[index].is_clicked ? true : false;
    }
    , set_id: function (name, index) {
        return name + index;
    }
    , get_count_deep: function (...count: string[]) {
        var my_array = JSON.parse(JSON.stringify(this.mobilities_filtered));
        var my_list = [];
        var array_length = count.length;
        _.forEach(count, (value, index) => {
            if (index % 2 != 0) {
                var x = this.get_count_name(count[index - 1]);
                my_array = _.filter(my_array, function (value2, index) {
                    return value2[x] != 'none';
                });
                //switch (count[index - 1]) {
                //    case "Countries":
                //        x = 'country';
                //        break;
                //    case "Programs":
                //        x = 'program';
                //        break;
                //    case "Levels":
                //        x = 'level';
                //        break;
                //    case "Affiliations":
                //        x = 'affiliation';
                //        break;
                //}
                my_list = _.union(_.filter(my_array, function (value2, index) {
                    return value2[x] == value[x]
                }));
            }
            if (index + 1 == array_length) {
                var x = this.get_count_name(value);
                my_list = _.filter(my_list, function (value2, index) {
                    return value2[x] != 'none';
                });
                //switch (value) {
                //    case "Countries":
                //        x = 'country';
                //        break;
                //    case "Programs":
                //        x = 'program';
                //        break;
                //    case "Levels":
                //        x = 'level';
                //        break;
                //    case "Affiliations":
                //        x = 'affiliation';
                //        break;
                //}
                my_list = _.uniq(my_list, x);
            }
        });
        return my_list.length;
    }
    , get_count_inner: function (my_array, count) {
        count = this.get_count_name(count);
        //switch (count) {
        //    case "Countries":
        //        count = 'country';
        //        break;
        //    case "Programs":
        //        count = 'program';
        //        break;
        //    case "Levels":
        //        count = 'level';
        //        break;
        //    case "Affiliations":
        //        count = 'affiliation';
        //        break;
        //}
        var x: any = _.filter(this.mobilities_filtered, function (value, index) {
            return value[count] == my_array[count]
        });

        return x.length;

        //var name = this.get_name(my_array);
        //var x: any = _.find(this.country_list, function (value: any, index) {
        //    return value._id == my_array.country;
        //})
        //if (x) {
        //    return x.text;
        //}
    }

    , calculate_counts: function (_this) {
        //var my_object = JSON.parse(JSON.stringify(_this.mobilities));
        if (_this.tags && _this.tags.length > 0) {
            var my_object = JSON.parse(JSON.stringify(_this.mobilities));


            _.forEach(_this.tags_split, function (tags: any, tags_index: any) {
                tags_index = tags_index.replace('_tags', '');
                if (tags.length > 0) {
                    var my_object_filtered = [];//JSON.parse(JSON.stringify(_this.mobilities));
                    _.forEach(tags, function (tag: any, tag_index: any) {
                        my_object_filtered = _.union(my_object_filtered, _.filter(my_object, function (value) {
                            return value[tags_index] == tag._id
                        }));
                    });
                    my_object = my_object_filtered;
                }
            });

            _this.mobilities_filtered = my_object;


            //_this.country_count = _.uniq(my_object, 'country').length;
            //_this.program_count = _.uniq(my_object, 'program').length;
            //_this.total_count = _.toArray(my_object).length;

        } else {
            _this.mobilities_filtered = _this.mobilities;

            //this.count_list1 = [{ name: 'Countries', is_clicked: false, show_all: false }, { name: 'Programs', is_clicked: false, show_all: false }, { name: 'Levels', is_clicked: false, show_all: false }];
            //this.count_list2 = [{ name: 'Countries', is_clicked: false, show_all: false }, { name: 'Programs', is_clicked: false, show_all: false }, { name: 'Levels', is_clicked: false, show_all: false }];
            //_this.country_count = _.uniq(_this.mobilities, 'country').length;
            //_this.program_count = _.uniq(_this.mobilities, 'program').length;
            //_this.total_count = _.toArray(_this.mobilities).length;
        }
        //this.count_list_original = [{ name: 'Countries', is_clicked: false, show_all: false }, { name: 'Programs', is_clicked: false, show_all: false }
        //    , { name: 'Levels', is_clicked: false, show_all: false }, { name: 'Affiliations', is_clicked: false, show_all: false }
        //    , { name: 'Status', is_clicked: false, show_all: false }, { name: 'Terms', is_clicked: false, show_all: false }
        //    , { name: 'Student Affiliations', is_clicked: false, show_all: false }, { name: 'Foreign Affiliations', is_clicked: false, show_all: false }];
        this.count_list_original = JSON.parse(JSON.stringify(this.count_list_original))
        this.count_list1 = this.count_list_original;
        this.count_list2 = this.count_list1;
        _this.columns_changed(_this.columns);
        _this.total = _this.mobilities_filtered.length;
        //this.count_list3 = [{ name: 'Countries', is_clicked: false, show_all: false }, { name: 'Programs', is_clicked: false, show_all: false }, { name: 'Levels', is_clicked: false, show_all: false }];
    }
    , data_loaded_changed: function (new_value, old_value) {
        var is_data_loaded = true;
        _.forEach(new_value, function (value: any, index) {
            //if (!value.is_loaded) {
            is_data_loaded = value.is_loaded && is_data_loaded ? true : false; 
            //}
        });
        this.is_data_loaded = is_data_loaded;
        if (is_data_loaded && (this.mobilities && this.mobilities.length > 0) && _.toArray(new_value).length > 1) {
            this.calculate_counts(this)
        }
    }
    , columns_changed: function (new_value, old_value) {
        if (new_value) {
            this.count_list1 = _.filter(this.count_list_original, (value: any, index) => {
                var obj: any = _.find(new_value, { 'text': this.capitaliseFirstLetter(this.get_count_name(value.name).replace('_', ' ')) });
                return obj.is_shown;
            })
            this.count_list2 = this.count_list1;

            this.mobilities_filtered = JSON.parse(JSON.stringify(this.mobilities_filtered));
        }
    }
    , processing_table: false
    , last_term_tags: {}
    , last_status: ''
    , filter_table: function (_this) {
        //if (!_this.page || !_this.page_count) {
        //    page.redirect("#!/1/10/all/all/all/all/all/all/all/all/start_date/desc");
        //} else
            if (!_this.processing_table) {
            var terms = _this.tags_split.term_tags;//_this.terms = ['Fall 2014', 'Fall 2015', 'Fall 2013'];//will be set by defaults, cannot be empty
            var status = _this.tags_split.status_tags.length == 1 ? _this.tags_split.status_tags[0] : 'all';//_this.terms = ['Fall 2014', 'Fall 2015', 'Fall 2013'];//will be set by defaults, cannot be empty

            if (!_.isEqual(terms, _this.last_term_tags) || status != _this.last_status || !_this.mobilities_filtered || _this.mobilities_filtered.length == 0) {
                _this.last_term_tags = terms;
                _this.last_status = status;
                if (!_this.mobilities_filtered || _this.mobilities_filtered.length == 0) {
                    _this.calculate_counts(_this);
                }
                //this.student_affiliation_list = this.establishment_list;
                //this.foreign_affiliation_list = this.establishment_list;
                _this.data_loaded['init'].is_loaded = true;
                _this.data_loaded_changed(_this.data_loaded);
                //_this.terms_statuses = terms;
                _this.processing_table = true;
                _this.mobilities = null;
                var how_many = _this.status != 'all' ? terms.length : terms.length * 2
                var stop_processing_table = _.after(how_many, function () {
                    _this.processing_table = false;
                })
                if (_this.terms_statuses.length || _this.terms_statuses.length == 0) {
                    _this.terms_statuses = {};
                }
                if (status != 'all') {
                    _.forEach(terms, function (term: any, key) {
                        _this.data_loaded[term.text + _this.status] = { is_loaded: false };
                        _this.data_loaded_changed(_this.data_loaded);

                        if (_this.terms_statuses[_this.status + term.text]) {
                            _this.mobilities = _.union(_this.mobilities, _this.terms_statuses[_this.status + term.text]);
                            if (!_this.mobilities_filtered || _this.mobilities_filtered.length == 0) {
                                _this.calculate_counts(_this);
                            }
                            stop_processing_table()
                            _this.data_loaded[term.text + _this.status].is_loaded = true;
                            _this.data_loaded_changed(_this.data_loaded);
                        } else {
                            _this.fire_students_tenant_values.child(_this.status).child(term.text).once("value", (snap) => {
                                //_this.mobilities.push(snap.val());
                                //_this.mobilities = _.union(_this.mobilities, _.toArray(snap.val()));
                                _this.terms_statuses[_this.status + snap.key()] = _.toArray(snap.val());
                                _this.mobilities = _.union(_this.mobilities, _this.terms_statuses[_this.status + term.text]);
                                //_this.calculate_counts(_this);
                                //this.start_setup_filter();
                                if (!_this.mobilities_filtered || _this.mobilities_filtered.length == 0) {
                                    _this.calculate_counts(_this);
                                }
                                stop_processing_table()
                                _this.data_loaded[term.text + _this.status].is_loaded = true;
                                _this.data_loaded_changed(_this.data_loaded);
                            });
                        }

                    });
                } else {
                    _.forEach(terms, function (term: any, key) {
                        _this.data_loaded[term.text + 'IN'] = { is_loaded: false };
                        _this.data_loaded_changed(_this.data_loaded);
                        if (_this.terms_statuses['IN' + term.text]) {
                            _this.mobilities = _.union(_this.mobilities, _this.terms_statuses['IN' + term.text]);
                            if (!_this.mobilities_filtered || _this.mobilities_filtered.length == 0) {
                                _this.calculate_counts(_this);
                            }
                            stop_processing_table()
                            _this.data_loaded[term.text + 'IN'].is_loaded = true;
                            _this.data_loaded_changed(_this.data_loaded);
                        } else {
                            _this.fire_students_tenant_values.child('IN').child(term.text).once("value", (snap) => {
                                //_this.mobilities.push(snap.val());
                                //_this.mobilities = _.union(_this.mobilities, _.toArray(snap.val()));
                                _this.terms_statuses['IN' + snap.key()] = _.toArray(snap.val());
                                _this.mobilities = _.union(_this.mobilities, _this.terms_statuses['IN' + term.text]);
                                if (!_this.mobilities_filtered || _this.mobilities_filtered.length == 0) {
                                    _this.calculate_counts(_this);
                                }
                                //_this.calculate_counts(_this);
                                stop_processing_table()
                                _this.data_loaded[term.text + 'IN'].is_loaded = true;
                                _this.data_loaded_changed(_this.data_loaded);
                                //this.start_setup_filter();
                            });
                        }
                    });
                    _.forEach(terms, function (term: any, key) {
                        _this.data_loaded[term.text + 'OUT'] = { is_loaded: false };
                        _this.data_loaded_changed(_this.data_loaded);
                        if (_this.terms_statuses['OUT' + term.text]) {
                            _this.mobilities = _.union(_this.mobilities, _this.terms_statuses['OUT' + term.text]);
                            //_this.mobilities = _this.terms_statuses['OUT' + term.text];
                            if (!_this.mobilities_filtered || _this.mobilities_filtered.length == 0) {
                                _this.calculate_counts(_this);
                            }
                            stop_processing_table()
                            _this.data_loaded[term.text + 'OUT'].is_loaded = true;
                            _this.data_loaded_changed(_this.data_loaded);
                        } else {
                            _this.fire_students_tenant_values.child('OUT').child(term.text).once("value", (snap) => {
                                //_this.mobilities.push(snap.val());
                                //_this.mobilities = _.union(_this.mobilities, _.toArray(snap.val()));
                                _this.terms_statuses['OUT' + snap.key()] = _.toArray(snap.val());
                                _this.mobilities = _.union(_this.mobilities, _this.terms_statuses['OUT' + term.text]);
                                if (!_this.mobilities_filtered || _this.mobilities_filtered.length == 0) {
                                    _this.calculate_counts(_this);
                                }
                                //_this.calculate_counts(_this);
                                stop_processing_table()
                                _this.data_loaded[term.text + 'OUT'].is_loaded = true;
                                _this.data_loaded_changed(_this.data_loaded);
                                //this.start_setup_filter();
                            });
                        }
                    });
                }
                //if (_this.tags && _this.tags.length > 0) {
                //    //_this.calculate_counts(_this)
                //    //_this.columns_changed(_this.columns);

                //}
                _this.affiliation = 'all';
                _this.country = 'all';
                _this.program = 'all';
                _this.level = 'all';
            }
            //else if (!_this.mobilities_filtered || _this.mobilities_filtered.length == 0) {
            //    _this.calculate_counts(_this);
            //}
            
        } else {
            setTimeout(function () {
                _this.filter_table(_this);
            }, 100);
        }

    }

    , navigate: function (ctx, next) {
        var _this: any = document.querySelector("#page_student_table");
        _this.page = ctx.params.page;
        _this.page_count = ctx.params.page_count;
        _this.affiliation = ctx.params.affiliation;
        _this.continent = ctx.params.continent;
        _this.country = ctx.params.country;
        _this.program = ctx.params.program;
        _this.level = ctx.params.level;
        _this.status = ctx.params.status;
        _this.start_date = ctx.params.start_date;
        _this.end_date = ctx.params.end_date;
        _this.order_by = ctx.params.order_by;
        _this.asc_desc = ctx.params.asc_desc;

        var affiliation_selected = _this.affiliation != 'all' && _this.affiliation_list[_this.affiliation] ? _this.affiliation_list[_this.affiliation].text : 'all';// id === index
        _this.$.affiliation_auto_ddl.selected = '';
        if (affiliation_selected != 'all') {
            _this.add_tag(affiliation_selected, _this.affiliation, 'affiliation');
        }

        var country_selected = _this.country != 'all' ? _.result(_.find(_this.country_list, { '_id': _this.country }), 'text') : 'all';
        _this.$.country_auto_ddl.selected = '';
        if (country_selected != 'all') {
            _this.add_tag(country_selected, _this.country, 'country');
        }

        var program_selected = _this.program != 'all' ? _.result(_.find(_this.program_list, { '_id': _this.program }), 'text') : 'all';
        _this.$.program_auto_ddl.selected = '';
        if (program_selected != 'all') {
            _this.add_tag(program_selected, _this.program, 'program');
        }

        var level_selected = _this.level != 'all' ? _.result(_.find(_this.level_list, { '_id': _this.level }), 'text') : 'all';
        _this.$.level_auto_ddl.selected = '';
        if (level_selected != 'all') {
            _this.add_tag(level_selected, _this.level, 'level');
        }
        //first check to see if url is correct
        _this.filter_table(_this);

    },
    setup_routing: function () {
        page.base(window.location.pathname);
        page('/:page/:page_count/:affiliation/:continent/:country/:program/:level/:status/:start_date/:end_date/:order_by/:asc_desc', this.navigate);
        page('*', this.navigate);
        page({ hashbang: true });
        this.is_routing_setup = true;
    },

    leave_affiliation_search: function (event, detail, sender) {
        setTimeout(() => {
            this.affiliation_list = [];
        }, 200);
    },
    update_page: function (_this) {
        page('#!/' + _this.page + '/' + _this.page_count + '/' + _this.affiliation + '/' + _this.continent + '/' + _this.country + '/' + _this.program + '/' + _this.level + '/' + _this.status + '/' + _this.start_date + '/' + _this.end_date + '/' + _this.order_by + '/' + _this.asc_desc);
    },
    add_tag: function (text, _id, _type) {
        this.tags = _.union(this.tags, [{ text: text.replace(".", " ").replace("/", " "), _id: _id, _type: _type }]);
    },
    affiliation_selected: function (event, detail, sender) {

        this.affiliation = this.selected_affiliation_id ? this.selected_affiliation_id : 'all';
        var affiliation_selected = this.affiliation != 'all' ? _.result(_.find(this.affiliation_list, { '_id': this.affiliation }), 'text') : 'all';// id === index
        this.$.affiliation_auto_ddl.selected = '';
        if (affiliation_selected != 'all') {
            this.add_tag(affiliation_selected, this.affiliation, 'affiliation');
            this.calculate_counts(this);
        }

        //first check to see if url is correct

        //this.filter_table(this);
    },
    affiliation_list_search: function (event, detail, sender) {

        if (this.affiliation_search == "") {
            this.affiliation_auto_list = _.take(this.affiliation_list, 10);
            //this.affiliation_auto_list = [];
        } else {
            var list = _.filter(this.affiliation_list, (value: any) => {
                if (value) {
                    return (value.text.toLowerCase().indexOf(this.affiliation_search.toLowerCase()) > -1);
                }
            })
            this.affiliation_auto_list = _.take(list, 10);
        }
    },
    countrySelected: function (event, detail, sender) {

        this.country = this.selectedCountryId ? this.selectedCountryId : 'all';
        var country_selected = this.country != 'all' ? _.result(_.find(this.country_list, { '_id': this.country }), 'text') : 'all';
        this.$.country_auto_ddl.selected = '';
        if (country_selected != 'all') {
            this.add_tag(country_selected, this.country, 'country');
            this.calculate_counts(this);
        }
        //this.filter_table(this);
    },
    countryListSearch: function (event, detail, sender) {
        if (this.countrySearch == "") {
            //this.country_auto_list = [];
            this.country_auto_list = _.take(this.country_list, 10);
        } else {
            var list = _.filter(this.country_list, (value: any) => {
                if (value) {
                    return (value.text.toLowerCase().indexOf(this.countrySearch.toLowerCase()) > -1);
                }
            })
            this.country_auto_list = _.take(list, 10);
        }
    },
    program_selected: function (event, detail, sender) {

        this.program = this.selected_program_id ? this.selected_program_id : 'all';
        var program_selected = this.program != 'all' ? _.result(_.find(this.program_list, { '_id': this.program }), 'text') : 'all';
        this.$.program_auto_ddl.selected = '';
        if (program_selected != 'all') {
            this.add_tag(program_selected, this.program, 'program');
            this.calculate_counts(this);
        }
        //this.filter_table(this);
    },
    program_list_search: function (event, detail, sender) {
        if (this.program_search == "") {
            //this.program_auto_list = [];
            this.program_auto_list = _.take(this.program_list, 10);
        } else {
            var list = _.filter(this.program_list, (value: any) => {
                if (value) {
                    return (value.text.toLowerCase().indexOf(this.program_search.toLowerCase()) > -1);
                }
            })
            this.program_auto_list = _.take(list, 10);
        }
    },
    level_selected: function (event, detail, sender) {

        this.level = this.selected_level_id ? this.selected_level_id : 'all';

        var level_selected = this.level != 'all' ? _.result(_.find(this.level_list, { '_id': this.level }), 'text') : 'all';
        this.$.level_auto_ddl.selected = '';
        if (level_selected != 'all') {
            this.add_tag(level_selected, this.level, 'level');
            this.calculate_counts(this);
        }
        //this.filter_table(this);
    },
    level_list_search: function (event, detail, sender) {
        this.level_auto_list = this.level_list;
        //if (this.level_search == "") {
        //    this.level_auto_list = [];
        //} else {
        //    var list = _.filter(this.level_list, (value: any) => {
        //        if (value) {
        //            return (value.text.toLowerCase().indexOf(this.level_search.toLowerCase()) > -1);
        //        }
        //    })
        //    this.level_auto_list = _.take(list, 10);
        //}
    }
    , student_affiliation_selected: function (event, detail, sender) {

        this.student_affiliation = this.selected_student_affiliation_id ? this.selected_student_affiliation_id : 'all';

        var student_affiliation_selected = this.student_affiliation != 'all' ? _.result(_.find(this.student_affiliation_list, { '_id': this.student_affiliation }), 'text') : 'all';
        this.$.student_affiliation_auto_ddl.selected = '';
        if (student_affiliation_selected != 'all') {
            this.add_tag(student_affiliation_selected, this.student_affiliation, 'student_affiliation');
            this.calculate_counts(this);
        }
        //this.filter_table(this);
    },
    student_affiliation_list_search: function (event, detail, sender) {
        if (this.student_affiliation_search == "") {
            //this.student_affiliation_auto_list = [];
            this.student_affiliation_auto_list = _.take(this.student_affiliation_list, 10);
        } else {
            var list = _.filter(this.student_affiliation_list, (value: any) => {
                if (value) {
                    return (value.text.toLowerCase().indexOf(this.student_affiliation_search.toLowerCase()) > -1);
                }
            })
            this.student_affiliation_auto_list = _.take(list, 10);
        }
    }
    , foreign_affiliation_selected: function (event, detail, sender) {

        this.foreign_affiliation = this.selected_foreign_affiliation_id ? this.selected_foreign_affiliation_id : 'all';

        var foreign_affiliation_selected = this.foreign_affiliation != 'all' ? _.result(_.find(this.foreign_affiliation_list, { '_id': this.foreign_affiliation }), 'text') : 'all';
        this.$.foreign_affiliation_auto_ddl.selected = '';
        if (foreign_affiliation_selected != 'all') {
            this.add_tag(foreign_affiliation_selected, this.foreign_affiliation, 'foreign_affiliation');
            this.calculate_counts(this);
        }
        //this.filter_table(this);
    },
    foreign_affiliation_list_search: function (event, detail, sender) {
        if (this.foreign_affiliation_search == "") {
            //this.foreign_affiliation_auto_list = [];
            this.foreign_affiliation_auto_list = _.take(this.foreign_affiliation_list, 10);
        } else {
            var list = _.filter(this.foreign_affiliation_list, (value: any) => {
                if (value) {
                    return (value.text.toLowerCase().indexOf(this.foreign_affiliation_search.toLowerCase()) > -1);
                }
            })
            this.foreign_affiliation_auto_list = _.take(list, 10);
        }
    }
    , term_selected: function (event, detail, sender) {

        this.term = this.selected_term_id ? this.selected_term_id : 'all';

        var term_selected = this.term != 'all' ? _.result(_.find(this.term_list, { '_id': this.term }), 'text') : 'all';
        this.$.term_auto_ddl.selected = '';
        if (term_selected != 'all') {
            this.add_tag(term_selected, this.term, 'term');
        }
        //this.filter_table(this);
    },
    term_list_search: function (event, detail, sender) {
        this.term_auto_list = this.term_list;
        //if (this.term_search == "") {
        //    this.term_auto_list = [];
        //} else {
        //    var list = _.filter(this.term_list, (value: any) => {
        //        if (value) {
        //            return (value.text.toLowerCase().indexOf(this.term_search.toLowerCase()) > -1);
        //        }
        //    })
        //    this.term_auto_list = _.take(list, 10);
        //}
    }
    , status_selected: function (event, detail, sender) {

        this.status = this.selected_status_id ? this.selected_status_id : 'all';

        var status_selected = this.status != 'all' ? _.result(_.find(this.status_list, { '_id': this.status }), 'text') : 'all';
        this.$.status_auto_ddl.selected = '';
        if (status_selected != 'all') {
            this.add_tag(status_selected, this.status, 'status');
            //this.calculate_counts(this);
        }
        //this.filter_table(this);
    },
    status_list_search: function (event, detail, sender) {
        this.status_auto_list = this.status_list;
        //if (this.status_search == "") {
        //    this.status_auto_list = [];
        //} else {
        //    var list = _.filter(this.status_list, (value: any) => {
        //        if (value) {
        //            return (value.text.toLowerCase().indexOf(this.status_search.toLowerCase()) > -1);
        //        }
        //    })
        //    this.status_auto_list = _.take(list, 10);
        //}
    }




    , order_index_changed: function () {
        this.order_by = this.order_index.substr(0, this.order_index.indexOf('-'));
        this.order_by = this.order_by.replace(" ", "_");
        this.asc_desc = this.order_index.substr(this.order_index.indexOf('-') + 1);
        page('#!/' + this.page + '/' + this.page_count + '/' + this.affiliation + '/' + this.continent + '/' + this.country + '/' + this.program + '/' + this.level + '/' + this.status + '/' + this.start_date + '/' + this.end_date + '/' + this.order_by + '/' + this.asc_desc);

    }
}); 

    //, count_clicked: function (event, target, test) {
    //    var tag = this.$.count_l1.itemForElement(event.target);
    //    tag.is_clicked = tag.is_clicked ? false : true;
    //    this.count_list1 = JSON.parse(JSON.stringify(this.count_list1));
    //    //event.model.is_clicked = true;
    //    //*** may have to reset the object with json parse stringify
    //}

//, filter_table: function (_this) {

//    if (!_this.page || !_this.page_count) {
//        page.redirect("#!/1/10/all/all/all/all/all/all/all/all/start_date/desc");
//    } else {
//        var tags_split = this.tags_split, mobility_id_list = [], temp_list = [];
//        if (_this.tags && _this.tags.length > 0) {

                
//            var fire_students_tenant_mobilities = new Firebase("https://UCosmic.firebaseio.com/Students/" + this.tenant_id + '/Mobilities')
//            var tag_list = [];
//            _.forEach(tags_split, function (value: any, index: any) {
//                if (value.length > 0) {
//                    tag_list.push(index);
//                }
//            });
//            _this.country_count = 0
//            _this.program_count = 0
//            _this.total_count = 0
//            _.forEach(tag_list, function (value: any, index: any) {
//                var tag_name = value;
//                tag_name = _this.capitaliseFirstLetter(tag_name.replace('_tags', ''));
//                _this.fire_students_tenant_keys.child(tag_name).on("child_added", function (snap) {
//                    _this[tag_name.toLowerCase() + '_count']++;
//                });
//            })




//        } else {

//        }
//        _this.affiliation = 'all';
//        _this.country = 'all';
//        _this.program = 'all';
//        _this.level = 'all';



//        //_this.mobilities_page = _.sortBy(_this.mobilities_page, _this.order_by);
//        //if (_this.asc_desc == 'asc') {
//        //    _(_this.mobilities_page).reverse().value();
//        //}

//        //_this.mobilities_page = _.slice(_this.mobilities_page, _this.page - 1, (_this.page_count * _this.page));
//    }

//}
//, caclulate_counts: function (_this, keys, key, tag_list, my_object) {
//    //_.forEach(keys, function (tag_name: any, index: any) {
//    var my_new_object;
//    if (tag_list[key] && tag_list[key].length > 0) {
//        _.forEach(tag_list[key], function (tag: any, index: any) {
//            my_new_object[tag]
//        });
//    } else {

//    }

//    //});
//}
//, create_object: function (_this, keys, keys_index, tag_list, my_object) {
//    var is_true = false;

//    var my_array = _.filter(my_object, function (value, index) {
//        if (keys.length > keys_index + 1) {
//            var current_tag = tag_list[keys[keys_index] + '_tags']
//            if (current_tag && current_tag.length > 0) {
//                _.forEach(current_tag, function (tag: any, index_key: any) {
//                    _.forEach(value, function (tag_2: any, index_key_2: any) {
//                        if (tag.text == index_key_2) {
//                            var x = _this.create_object(_this, keys, keys_index + 1, tag_list, value);
//                            return x.length > 0
//                            //return  _this.create_object(_this, keys, keys_index + 1, tag_list, value).length > 0
//                        } else {
//                            return  false;
//                        }
//                    });
//                });
//            } else {
//                _.forEach(value, function (tag: any, index_key: any) {
//                    var x = _this.create_object(_this, keys, keys_index + 1, tag_list, value);
//                    return x.length > 0
//                });
//                var x = _this.create_object(_this, keys, keys_index + 1, tag_list, value);
//                return x.length > 0
//            }
//        } else {
//            return  true;
//        }
//    })

//    return my_array;
//    //if(my_array && my_array.length > 0){
//    //    return true;
//    //}else{
//    //    return false;
//    //}

//}
//, create_object: function (_this, keys, keys_index, tag_list, my_object) {
//    var is_true = false;
//    var my_new_object = my_object;
//    _.forEach(my_object, function (term: any, term_index) {
//        var term_tags = tag_list['term_tags'];
//        if (term_tags && term_tags.length > 0) {
//            var affilation_found = _.find(term_tags, { text: term_index })
//            if (affilation_found == undefined) {
//                delete my_new_object[term_index][term_index][term_index];
//            };
//        } else {
//            var term_array = _.forEach(term, function (status: any, status_index) {
//                var status_tags = tag_list['status_tags'];
//                if (status_tags && status_tags.length > 0) {
//                    var affilation_found = _.find(status_tags, { text: status_index })
//                    if (affilation_found == undefined) {
//                        delete my_new_object[term_index][status_index][status_index];
//                    };
//                } else {
//                    var status_array = _.forEach(status, function (affiliation: any, affiliation_index) {
//                        var affiliation_tags = tag_list['affiliation_tags'];
//                        if (affiliation_tags && affiliation_tags.length > 0) {
//                            var affilation_found = _.find(affiliation_tags, { text: affiliation_index })
//                            if (affilation_found == undefined) {
//                                delete my_new_object[term_index][status_index][affiliation_index];
//                            };
//                        } else {
//                            var affiliations_array = _.filter(affiliation, function (level: any, level_index) {
//                                return true;// go down next level
//                            });
//                            if (_.toArray(affiliations_array).length == 0) {
//                                delete my_new_object[term_index][status_index][affiliation_index];
//                            };
//                        }
//                    });
//                    if (_.toArray(status_array).length == 0) {
//                        delete my_new_object[term_index][status_index];
//                    };
//                }
//            });
//            if (_.toArray(term_array).length == 0) {
//                delete my_new_object[term_index];
//            };
//        }
//    });
//    return my_new_object;
//}
//, create_object: function (_this, keys, keys_index, tag_list, my_object) {
//    var my_new_object = my_object;
//    _.forEach(my_object, function (value: any, value_index) {
//        var tags = tag_list[keys[keys_index]];
//        if (tags && tags.length > 0) {
//            var found = _.find(tags, { text: value_index })
//            if (found == undefined) {
//                delete my_new_object[value_index];
//            } else {
//                var value_array = _.forEach(value, function (value_2: any, value_index_2) {
//                    _this.create_object(_this, keys, keys_index + 1, tag_list, value);
//                    //return true;// go down next level
//                });
//                if (_.toArray(value_array).length == 0) {
//                    delete my_new_object[value_index];
//                };
//            }
//        } else {
//            if (keys.length > keys_index) {
//                var value_array = _.forEach(value, function (value_2: any, value_index_2) {
//                    //_this.create_object(_this, keys, keys_index + 1, tag_list, value);
//                    //return true;// go down next level
//                });
//                if (_.toArray(value_array).length == 0) {
//                    delete my_new_object[value_index];
//                };
//            }
//        }
//    });
//    if (_.toArray(my_new_object).length == 0) {
//        //delete my_object[value_index];
//    };
//    return my_new_object;
//}
//, create_object: function (_this, keys, keys_index, tag_list, my_object) {
//    var my_new_object = my_object;
//    _.forEach(my_object, function (term, term_index) {
//        var term_tags = tag_list['term_tags'];
//        if (term_tags && term_tags.length > 0) {
//            var term_found = _.find(term_tags, { text: term_index })
//            if (term_found == undefined) {
//                delete my_new_object[term_index];
//                term = [];
//            };
//        }
//        _.forEach(term, function (status, status_index) {
//            var status_tags = tag_list['status_tags'];
//            if (status_tags && status_tags.length > 0) {
//                var status_found = _.find(status_tags, { text: status_index })
//                if (status_found == undefined) {
//                    delete my_new_object[term_index][status_index];
//                    status = [];
//                };
//            }
//            if (_.toArray(my_new_object[term_index]).length == 0) {
//                delete my_new_object[term_index];
//            }
//            _.forEach(status, function (affiliation, affiliation_index) {
//                var affiliation_tags = tag_list['affiliation_tags'];
//                if (affiliation_tags && affiliation_tags.length > 0) {
//                    var affiliation_found = _.find(affiliation_tags, { text: affiliation_index })
//                    if (affiliation_found == undefined) {
//                        delete my_new_object[term_index][status_index][affiliation_index];
//                        affiliation = [];
//                    };
//                }
//                if (_.toArray(my_new_object[term_index][status_index]).length == 0) {
//                    delete my_new_object[term_index][status_index];
//                }
//                _.forEach(affiliation, function (level, level_index) {
//                    var level_tags = tag_list['level_tags'];
//                    if (level_tags && level_tags.length > 0) {
//                        var level_found = _.find(level_tags, { text: level_index })
//                        if (level_found == undefined) {
//                            delete my_new_object[term_index][status_index][affiliation_index][level_index];
//                            level = [];
//                        };
//                    }
//                    if (_.toArray(my_new_object[term_index][status_index][affiliation_index]).length == 0) {
//                        delete my_new_object[term_index][status_index][affiliation_index];
//                    }
//                    _.forEach(level, function (student_affiliation, student_affiliation_index) {
//                        var student_affiliation_tags = tag_list['student_affiliation_tags'];
//                        if (student_affiliation_tags && student_affiliation_tags.length > 0) {
//                            var student_affiliation_found = _.find(student_affiliation_tags, { text: student_affiliation_index })
//                            if (student_affiliation_found == undefined) {
//                                delete my_new_object[term_index][status_index][affiliation_index][level_index][student_affiliation_index];
//                                student_affiliation = [];
//                            };
//                        }
//                        if (_.toArray(my_new_object[term_index][status_index][affiliation_index][level_index]).length == 0) {
//                            delete my_new_object[term_index][status_index][affiliation_index][level_index];
//                        }
//                        _.forEach(student_affiliation, function (foreign_affiliation, foreign_affiliation_index) {
//                            var foreign_affiliation_tags = tag_list['foreign_affiliation_tags'];
//                            if (foreign_affiliation_tags && foreign_affiliation_tags.length > 0) {
//                                var foreign_affiliation_found = _.find(foreign_affiliation_tags, { text: foreign_affiliation_index })
//                                if (foreign_affiliation_found == undefined) {
//                                    delete my_new_object[term_index][status_index][affiliation_index][level_index][student_affiliation_index][foreign_affiliation_index];
//                                    foreign_affiliation = [];
//                                };
//                            }
//                            if (_.toArray(my_new_object[term_index][status_index][affiliation_index][level_index][student_affiliation_index]).length == 0) {
//                                delete my_new_object[term_index][status_index][affiliation_index][level_index][student_affiliation_index];
//                            }
//                            _.forEach(foreign_affiliation, function (program, program_index) {
//                                var program_tags = tag_list['program_tags'];
//                                if (program_tags && program_tags.length > 0) {
//                                    var program_found = _.find(program_tags, { text: program_index })
//                                    if (program_found == undefined) {
//                                        delete my_new_object[term_index][status_index][affiliation_index][level_index][student_affiliation_index][foreign_affiliation_index][program_index];
//                                        program = [];
//                                    };
//                                }
//                                if (_.toArray(my_new_object[term_index][status_index][affiliation_index][level_index][student_affiliation_index][foreign_affiliation_index]).length == 0) {
//                                    delete my_new_object[term_index][status_index][affiliation_index][level_index][student_affiliation_index][foreign_affiliation_index];
//                                }
//                                _.forEach(program, function (country: any, country_index) {
//                                    var country_tags = tag_list['country_tags'];
//                                    if (country_tags && country_tags.length > 0) {
//                                        var country_found = _.find(country_tags, { text: country_index })
//                                        if (country_found == undefined) {
//                                            delete my_new_object[term_index][status_index][affiliation_index][level_index][student_affiliation_index][foreign_affiliation_index][program_index][country_index];
//                                            country = [];
//                                        };
//                                    }
//                                    if (_.toArray(my_new_object[term_index][status_index][affiliation_index][level_index][student_affiliation_index][foreign_affiliation_index][program_index]).length == 0){
//                                        delete my_new_object[term_index][status_index][affiliation_index][level_index][student_affiliation_index][foreign_affiliation_index][program_index];                                       
//                                    }
//                                });
//                                if (_.toArray(my_new_object[term_index][status_index][affiliation_index][level_index][student_affiliation_index][foreign_affiliation_index]).length == 0) {
//                                    delete my_new_object[term_index][status_index][affiliation_index][level_index][student_affiliation_index][foreign_affiliation_index]
//                                }
//                            });
//                            if (_.toArray(my_new_object[term_index][status_index][affiliation_index][level_index][student_affiliation_index]).length == 0) {
//                                delete my_new_object[term_index][status_index][affiliation_index][level_index][student_affiliation_index]
//                            }
//                        });
//                        if (_.toArray(my_new_object[term_index][status_index][affiliation_index][level_index]).length == 0) {
//                            delete my_new_object[term_index][status_index][affiliation_index][level_index]
//                        }
//                    });
//                    if (_.toArray(my_new_object[term_index][status_index][affiliation_index]).length == 0) {
//                        delete my_new_object[term_index][status_index][affiliation_index]
//                    }
//                });
//                if (_.toArray(my_new_object[term_index][status_index]).length == 0) {
//                    delete my_new_object[term_index][status_index]
//                }
//            });
//            if (_.toArray(my_new_object[term_index]).length == 0) {
//                delete my_new_object[term_index]
//            }
//        });
//        //if (_.toArray(my_new_object[term_index]).length == 0) {
//        //    delete my_new_object[term_index]
//        //}
//    });
//    //if (_.toArray(my_new_object[term_index][status_index][affiliation_index][level_index][student_affiliation_index][foreign_affiliation_index]).length == 0) {
//    //    delete my_new_object[term_index][status_index][affiliation_index][level_index][student_affiliation_index][foreign_affiliation_index]
//    //}

//    return my_new_object;

//}
    //, show_all: function (event, target, test) {
    //    var tag = this.$.count_l1.itemForElement(event.target);
    //    tag.show_all = tag.show_all ? false : true;
    //    this.count_list1 = JSON.parse(JSON.stringify(this.count_list1));
    //}