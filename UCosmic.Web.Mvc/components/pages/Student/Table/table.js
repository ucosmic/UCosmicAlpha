/// <reference path="../../../../scripts/typings/lodash.d.ts" />
/// <reference path="../../../typediff/mytypes.d.ts" />
/// <reference path="../../../models/students.ts" />
/// <reference path="../../../../scripts/typings/lodash.d.ts" />
/// <reference path="../../../behaviors/closest/closest.ts" />
/// <reference path="../../../behaviors/template_helpers/template_helpers.ts" />
var Student_Table = Students;
Polymer({
    is: "is-page-student-table",
    behaviors: [Polymer.NeonAnimationRunnerBehavior, closest, template_helpers],
    properties: {
        animationConfig: {
            value: function () {
                return {
                    'slide_left': {
                        name: 'transform-animation',
                        node: this.$.tags,
                        transformOrigin: '100% 0%',
                        transformFrom: 'translateX(0px)',
                        transformTo: 'translateX(-265px)'
                    },
                    'slide_right': {
                        name: 'transform-animation',
                        node: this.$.tags,
                        transformOrigin: '100% 0%',
                        transformFrom: 'translateX(0px)',
                        transformTo: 'translateX(265px)'
                    }
                };
            }
        },
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
            type: Array,
            notify: true,
            observer: 'mobilities_changed'
        },
        affiliation_search: {
            type: String,
            notify: true,
            value: ""
        },
        selected_affiliation_id: {
            type: Number,
            notify: true,
            value: 0
        },
        affiliation_auto_list: {
            type: Array,
            notify: true,
            value: []
        },
        countrySearch: {
            type: String,
            notify: true,
            value: ""
        },
        selectedCountryId: {
            type: Number,
            notify: true,
            value: 0
        },
        country_auto_list: {
            type: Array,
            notify: true,
            value: []
        },
        program_search: {
            type: String,
            notify: true,
            value: ""
        },
        selected_program_id: {
            type: Number,
            notify: true,
            value: 0
        },
        program_auto_list: {
            type: Array,
            notify: true,
            value: []
        },
        level_search: {
            type: String,
            notify: true,
            value: ""
        },
        selected_level_id: {
            type: Number,
            notify: true,
            value: 0
        },
        level_auto_list: {
            type: Array,
            notify: true,
            value: []
        },
        status_search: {
            type: String,
            notify: true,
            value: ""
        },
        selected_status_id: {
            type: Number,
            notify: true,
            value: 0
        },
        status_auto_list: {
            type: Array,
            notify: true,
            value: []
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
        foreign_affiliation_search: {
            type: String,
            notify: true,
            value: ""
        },
        selected_foreign_affiliation_id: {
            type: Number,
            notify: true,
            value: 0
        },
        foreign_affiliation_auto_list: {
            type: Array,
            notify: true,
            value: []
        },
        student_affiliation_search: {
            type: String,
            notify: true,
            value: ""
        },
        selected_student_affiliation_id: {
            type: Number,
            notify: true,
            value: 0
        },
        student_affiliation_auto_list: {
            type: Array,
            notify: true,
            value: []
        },
        tags_count: {
            type: Number,
            notify: true,
            observer: 'tags_count_changed'
        },
        tags: {
            type: Array,
            notify: true,
            observer: 'tags_changed'
        },
        tags_split: {
            type: Array,
            computed: 'tags_splitter(tags)'
        },
        status_list: {
            type: Array,
            notify: true
        },
        affiliation_list: {
            type: Array,
            notify: true
        },
        student_affiliation_list: {
            type: Array,
            notify: true
        },
        foreign_affiliation_list: {
            type: Array,
            notify: true
        },
        establishment_list: {
            type: Array,
            notify: true
        },
        country_list: {
            type: Array,
            notify: true,
        },
        program_list: {
            type: Array,
            notify: true,
        },
        student_list: {
            type: Array,
            notify: true,
        },
        level_list: {
            type: Array,
            notify: true,
        },
        student_table_storage: {
            type: Object,
            notify: true,
        },
        student_table_storage_computed: {
            type: Array,
            computed: 'student_table_storage_compute(mobilities, establishment_list, country_list, program_list, level_list, tags, columns, last_term_tags, last_status, terms_statuses)'
        },
        filter_closed: {
            type: Boolean,
            value: true,
            notify: true,
            observer: 'filter_closed_changed'
        },
        columns: {
            type: Array,
            notify: true,
            observer: 'columns_changed'
        },
        mobilities_page: {
            type: Array,
            notify: true,
            value: []
        },
        order_by: {
            type: String,
        },
        asc_desc: {
            type: String,
        },
        order_index: {
            type: Number,
            observer: 'order_index_changed'
        },
        data_loaded: {
            type: Object,
            observer: 'data_loaded_changed',
            value: { init: { 'is_loaded': false } }
        },
        is_data_loaded: {
            type: Boolean,
            value: false
        },
        terms_statuses: {
            type: Object,
            notify: true
        },
        term_is_selected: {
            type: String,
            computed: 'compute_term_is_selected(tags)'
        }
    },
    listeners: {
        'neon-animation-finish': '_onAnimationFinish'
    },
    _onAnimationFinish: function () {
        if (this._slide) {
            this.$.tags.style.left = '-300px';
        }
        else {
            this.$.tags.style.left = '-35px';
        }
    },
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
    total: 0,
    count_list_orignal: [{ name: 'Countries', is_clicked: false, show_all: false }, { name: 'Programs', is_clicked: false, show_all: false },
        { name: 'Levels', is_clicked: false, show_all: false }, { name: 'Affiliations', is_clicked: false, show_all: false },
        { name: 'Status', is_clicked: false, show_all: false }, { name: 'Terms', is_clicked: false, show_all: false },
        { name: 'Student Affiliations', is_clicked: false, show_all: false }, { name: 'Foreign Affiliations', is_clicked: false, show_all: false }],
    created: function () {
        this.controller = this;
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
        this.count_list_original = [{ name: 'Countries', is_clicked: false, show_all: false }, { name: 'Programs', is_clicked: false, show_all: false },
            { name: 'Levels', is_clicked: false, show_all: false }, { name: 'Affiliations', is_clicked: false, show_all: false },
            { name: 'Status', is_clicked: false, show_all: false }, { name: 'Terms', is_clicked: false, show_all: false },
            { name: 'Student Affiliations', is_clicked: false, show_all: false }, { name: 'Foreign Affiliations', is_clicked: false, show_all: false }];
        this.count_list1 = this.count_list_original;
        this.count_list2 = this.count_list1;
        this.mobilities_filtered = [];
        this.is_processing = false;
    },
    fire_students_tenant_keys: null,
    get_mobility_value: function (column_name, mobility) {
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
    },
    tenant_id_changed: function (new_value, old_value) {
        var _this = this;
        this.fire_members_terms = new Firebase("https://UCosmic.firebaseio.com/Members/" + new_value + "/Terms");
        this.fire_students_levels = new Firebase("https://UCosmic.firebaseio.com/Members/" + new_value + "/Levels");
        this.fire_members_settings_mobility_counts = new Firebase("https://UCosmic.firebaseio.com/Members/" + new_value + "/Settings/Mobility_Counts");
        this.fire_members_settings_terms = new Firebase("https://UCosmic.firebaseio.com/Members/" + new_value + "/Settings/Terms");
        this.fire_establishments = new Firebase("https://UCosmic.firebaseio.com/Establishments/Establishments");
        this.fire_terms = new Firebase("https://UCosmic.firebaseio.com/Establishments/Establishments");
        this.fire_students_programs = new Firebase("https://UCosmic.firebaseio.com/Students/Programs");
        this.fire_countries = new Firebase("https://UCosmic.firebaseio.com/Places/Countries");
        this.status_list = [{ _id: 'IN', text: 'Incoming' }, { _id: 'OUT', text: 'Outgoing' }];
        this.fire_establishments.once("value", function (snapshot) {
            _this.establishment_list = _.map(snapshot.val(), function (value, index) {
                if (value) {
                    var object = { _id: index, text: value.establishment };
                    return object;
                }
            });
            _this.start_setup_filter();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        this.fire_students_levels.on("value", function (snapshot) {
            _this.level_list = _.map(_.sortBy(snapshot.val(), 'rank'), function (value, index) {
                if (value) {
                    var object = { _id: index, text: value.name };
                    return object;
                }
            });
            _this.start_setup_filter();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        this.fire_countries.once("value", function (snapshot) {
            _this.country_list = _.map(snapshot.val(), function (value, index) {
                if (value) {
                    var object = { _id: index, text: value.country };
                    return object;
                }
            });
            _this.start_setup_filter();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        this.fire_students_programs.once("value", function (snapshot) {
            _this.program_list = _.map(snapshot.val(), function (value, index) {
                if (value) {
                    var object = { _id: index, text: value.name };
                    return object;
                }
            });
            _this.start_setup_filter();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        this.fire_members_terms.once("value", function (snapshot) {
            _this.term_list = _.map(snapshot.val(), function (value, index) {
                if (value) {
                    var object = { _id: index, text: index };
                    return object;
                }
            });
            _this.start_setup_filter();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        this.fire_members_settings_terms.once("value", function (snapshot) {
            var settings_term_list = _.map(snapshot.val(), function (value, index) {
                if (value) {
                    var object = { text: index };
                    return object;
                }
            });
            if (!_this.tags_split || !_this.tags_split.term_tags || _this.tags_split.term_tags.length == 0) {
                _.forEach(settings_term_list, function (value, index) {
                    _this.add_tag(value.text, value.text, 'term');
                });
            }
            _this.start_setup_filter();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
        var mobility_snapshot = [];
        var counter = 0;
        this.fire_students_tenant_values = new Firebase("https://UCosmic.firebaseio.com/Members/" + this.tenant_id + '/Mobilities/Values');
    },
    start_setup_filter: _.after(8, function () {
        if (!this.is_routing_setup) {
            this.setup_routing();
        }
        else {
            this.filter_table(this);
        }
    }),
    student_table_storage_compute: function (mobilities, establishment_list, country_list, program_list, level_list, tags, columns, last_term_tags, last_status, terms_statuses) {
        var date_stored = this.student_table_storage ? this.student_table_storage.date_stored : undefined;
        if (!date_stored || terms_statuses != this.student_table_storage.terms_statuses) {
            date_stored = Date.now();
        }
        this.student_table_storage = {
            mobilities: mobilities,
            establishment_list: establishment_list,
            country_list: country_list,
            program_list: program_list,
            level_list: level_list,
            tags: tags,
            columns: columns,
            last_term_tags: last_term_tags,
            last_status: last_status,
            terms_statuses: terms_statuses,
            date_stored: date_stored
        };
        this.$.student_table_storage.save();
        return this.student_table_storage;
    },
    in_days: function (t1, t2) {
        //var t2 = d2.getTime();
        //var t1 = d1.getTime();
        return (t2 - t1) / (24 * 3600 * 1000);
    },
    compute_term_is_selected: function (tags) {
        var term_tags = _.uniq(_.filter(tags, function (tag) {
            if (tag._type == 'term') {
                return tag;
            }
        }), '_id');
        if (term_tags.length > 0) {
            return true;
        }
        else {
            return false;
        }
    },
    has_results: function (results) {
        var _this = this;
        if (this.mobilities_filtered) {
            var count = 0;
            _.forEach(results, function (value, key) {
                count += _this.get_count(value.name);
            });
            return count ? true : false;
        }
        else {
            return true;
        }
    },
    student_table_storage_loaded: function () {
        var _this = this;
        if (!this.student_table_storage_computed) {
            if (this.student_table_storage && this.student_table_storage.mobilities && this.student_table_storage.mobilities.length && !(this.student_table_storage.date_stored ? (this.in_days(this.student_table_storage.date_stored, Date.now()) > 1 ? true : false) : false)) {
                this.mobilities = this.student_table_storage.mobilities;
                this.establishment_list = this.student_table_storage.establishment_list;
                this.country_list = this.student_table_storage.country_list;
                this.program_list = this.student_table_storage.program_list;
                this.level_list = this.student_table_storage.level_list;
                this.tags = this.student_table_storage.tags;
                this.last_term_tags = this.student_table_storage.last_term_tags;
                this.last_status = this.student_table_storage.last_status;
                this.terms_statuses = this.student_table_storage.terms_statuses ? this.student_table_storage.terms_statuses : {};
                this.columns = this.student_table_storage.columns;
                this.setup_routing();
            }
            else if (!this.mobilities && !this.establishment_list && !this.country_list && !this.program_list && !this.level_list && !this.tags) {
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
                this.start_setup_filter();
            }
        }
        if (this.columns) {
            this.start_setup_filter();
        }
        else {
            this.fire_members_settings_mobility_counts.once("value", function (snapshot) {
                _this.columns = snapshot.val();
                _this.start_setup_filter();
            }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });
        }
    },
    student_table_storage_loaded_empty: function () {
        this.start_setup_filter();
    },
    init2: function () {
    },
    filter_closed_changed: function (new_value, old_value) {
        if (old_value != undefined) {
            if (new_value) {
                this._slide = false;
                this.playAnimation('slide_right');
            }
            else {
                this._slide = true;
                this.playAnimation('slide_left');
            }
        }
    },
    mobilities_changed: function (new_value, old_value) {
        var _this = this;
        var affiliation_list = [];
        if (this.establishment_list) {
            _.forEach(new_value, function (value, index) {
                affiliation_list = _.union(affiliation_list, [_this.establishment_list[value.affiliation]]);
            });
        }
        var student_affiliation_list = [];
        if (this.establishment_list) {
            _.forEach(new_value, function (value, index) {
                student_affiliation_list = _.union(student_affiliation_list, [_this.establishment_list[value.student_affiliation]]);
            });
        }
        var foreign_affiliation_list = [];
        if (this.establishment_list) {
            _.forEach(new_value, function (value, index) {
                foreign_affiliation_list = _.union(foreign_affiliation_list, [_this.establishment_list[value.foreign_affiliation]]);
            });
        }
        this.student_affiliation_list = student_affiliation_list;
        this.affiliation_list = affiliation_list;
        this.foreign_affiliation_list = foreign_affiliation_list;
    },
    is_false: function (value) {
        if (value) {
            return false;
        }
        else {
            return true;
        }
    },
    _load_mobility_data: function (_this) {
        if (_this.mobilities && _this.mobilities.length > 0) {
            _this.mobilities = _.map(_this.mobility_snapshot, function (value, index) {
                value.status = value.status == 'IN' ? "Incoming" : "Outgoing";
                value.affiliation_name = _this.affiliation_list[value.affiliation] ? _this.affiliation_list[value.affiliation].text : "";
                value.student_affiliation_name = _this.student_affiliation_list[value.student_affiliation] ? _this.student_affiliation_list[value.student_affiliation].text : "";
                value.foreign_affiliation_name = _this.foreign_affiliation_list[value.foreign_affiliation] ? _this.foreign_affiliation_list[value.foreign_affiliation].text : "";
                return value;
            });
            _this.start_setup_filter();
        }
        else {
            _this.mobilities = _.map(_this.mobility_snapshot, function (value, index) {
                value.status = value.status == 'IN' ? "Incoming" : "Outgoing";
                value.affiliation_name = _this.affiliation_list[value.affiliation] ? _this.affiliation_list[value.affiliation].text : "";
                value.student_affiliation_name = _this.student_affiliation_list[value.student_affiliation] ? _this.student_affiliation_list[value.student_affiliation].text : "";
                value.foreign_affiliation_name = _this.foreign_affiliation[value.foreign_affiliation] ? _this.foreign_affiliation[value.foreign_affiliation].text : "";
                return value;
            });
            _this.start_setup_filter();
        }
    },
    tags_count_changed: function (new_value, old_value) {
        if (new_value < old_value) {
            this.calculate_counts(this);
        }
    },
    tags_changed: function (new_value, old_value) {
        if (old_value) {
            this.filter_table(this);
        }
        this.tags_split_union();
    },
    tags_splitter: function (tags) {
        var affiliation_tags = _.uniq(_.filter(tags, function (tag) {
            if (tag._type == 'affiliation') {
                return tag;
            }
        }), '_id');
        var country_tags = _.uniq(_.filter(tags, function (tag) {
            if (tag._type == 'country') {
                return tag;
            }
        }), '_id');
        var program_tags = _.uniq(_.filter(tags, function (tag) {
            if (tag._type == 'program') {
                return tag;
            }
        }), '_id');
        var level_tags = _.uniq(_.filter(tags, function (tag) {
            if (tag._type == 'level') {
                return tag;
            }
        }), '_id');
        var term_tags = _.uniq(_.filter(tags, function (tag) {
            if (tag._type == 'term') {
                return tag;
            }
        }), '_id');
        var status_tags = _.uniq(_.filter(tags, function (tag) {
            if (tag._type == 'status') {
                return tag;
            }
        }), '_id');
        var foreign_affiliation_tags = _.uniq(_.filter(tags, function (tag) {
            if (tag._type == 'foreign_affiliation') {
                return tag;
            }
        }), '_id');
        var student_affiliation_tags = _.uniq(_.filter(tags, function (tag) {
            if (tag._type == 'student_affiliation') {
                return tag;
            }
        }), '_id');
        return {
            affiliation_tags: affiliation_tags, country_tags: country_tags, program_tags: program_tags, level_tags: level_tags, term_tags: term_tags,
            status_tags: status_tags, foreign_affiliation_tags: foreign_affiliation_tags, student_affiliation_tags: student_affiliation_tags
        };
    },
    tags_split_union: function () {
        var _this = document.querySelector("#page_student_table");
        var union_tags = _.union(_this.tags_split.affiliation_tags, _this.tags_split.country_tags, _this.tags_split.program_tags, _this.tags_split.level_tags, _this.tags_split.term_tags, _this.tags_split.status_tags, _this.tags_split.foreign_affiliation_tags, _this.tags_split.student_affiliation_tags);
        if (_this.tags.length != union_tags.length) {
            _this.tags = union_tags;
        }
    },
    capitaliseFirstLetter: function (myString) {
        return myString.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    },
    show_all_check: function (show_all, index) {
        if (!show_all && index > 9) {
            return true;
        }
        else {
            return false;
        }
    },
    show_all: function (event, target, test) {
        var _this = this;
        var tag = this.$.count_l1.itemForElement(event.target);
        if (tag.show_all) {
            event.target.parentElement.parentElement.querySelector('#collapse_outer' + this.$.count_l1.indexForElement(event.target)).toggle();
            setTimeout(function () {
                tag.show_all = false;
                _this.count_list1 = JSON.parse(JSON.stringify(_this.count_list1));
                setTimeout(function () {
                    event.target.parentElement.parentElement.querySelector('#collapse_outer' + _this.$.count_l1.indexForElement(event.target)).toggle();
                }, 100);
            }, 200);
        }
        else {
            event.target.parentElement.parentElement.querySelector('#collapse_outer' + this.$.count_l1.indexForElement(event.target)).toggle();
            setTimeout(function () {
                tag.show_all = true;
                _this.count_list1 = JSON.parse(JSON.stringify(_this.count_list1));
                setTimeout(function () {
                    event.target.parentElement.parentElement.querySelector('#collapse_outer' + _this.$.count_l1.indexForElement(event.target)).toggle();
                }, 100);
            }, 100);
        }
    },
    count_clicked: function (event, target, test) {
        var _this = this;
        var index = 1;
        var tag = event.model.__data__['count_l1'];
        if (this.get_count(tag.name) > 0) {
            this.is_processing = true;
            setTimeout(function () {
                if (tag.is_clicked) {
                    _this.closest_utility().find_closest(event.target, '#collapse_outer' + event.model.__data__.__key__).opened = false;
                    _this.is_processing = false;
                    setTimeout(function () {
                        tag.is_clicked = false;
                        _this['count_list' + index] = JSON.parse(JSON.stringify(_this['count_list' + index]));
                    }, 500);
                }
                else {
                    tag.is_clicked = true;
                    _this['count_list' + index] = JSON.parse(JSON.stringify(_this['count_list' + index]));
                    setTimeout(function () {
                        _this.closest_utility().find_closest(event.target, '#collapse_outer' + event.model.__data__.__key__).opened = true;
                        _this.is_processing = false;
                    }, 50);
                }
            }, 10);
        }
    },
    array_clicked: function (event, target, test) {
        var _this = this;
        var index = event.target.parentElement.id;
        var parent = event.model.dataHost.parentElement.children['array_l' + index];
        var tag = event.model.__data__['array_l1'];
        var collection = event.model.dataHost.dataHost.dataHost.items;
        if (tag.is_clicked) {
            this.closest_utility().find_closest(event.target, 'iron-collapse').opened = false;
            setTimeout(function () {
                tag.is_clicked = false;
                event.model.dataHost.items = JSON.parse(JSON.stringify(event.model.dataHost.items));
            }, 500);
        }
        else {
            tag.is_clicked = true;
            var template = this.closest_utility().find_closest_parent(event.target, 'template');
            event.model.dataHost.items = JSON.parse(JSON.stringify(event.model.dataHost.items));
            setTimeout(function () {
                _this.closest_utility().find_closest(event.target, 'iron-collapse').opened = true;
            }, 50);
        }
    },
    get_count_name: function (value) {
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
    },
    get_name: function (my_array, count) {
        count = this.get_count_name(count);
        var x = _.find(this[count + '_list'], function (value, index) {
            if (value) {
                return value._id == my_array[count];
            }
        });
        if (x) {
            return x.text ? x.text : 'Not Reported';
        }
        else {
            return 'Not Reported';
        }
    },
    create_array: function (name, show_all) {
        var _this = this;
        var name = this.get_count_name(name);
        var my_list = _.union(_.uniq(this.mobilities_filtered, name), my_list);
        if (show_all) {
            return _.sortBy(my_list, function (my_array) {
                return -1 * (_.filter(_this.mobilities_filtered, function (value, index) {
                    return value[name] == my_array[name];
                }).length);
            });
        }
        else {
            return _.take(_.sortBy(my_list, function (my_array) {
                return -1 * (_.filter(_this.mobilities_filtered, function (value, index) {
                    return value[name] == my_array[name];
                }).length);
            }), 10);
        }
    },
    get_count: function () {
        var _this = this;
        var count = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            count[_i - 0] = arguments[_i];
        }
        var my_array = JSON.parse(JSON.stringify(this.mobilities_filtered));
        var my_list = [];
        _.forEach(count, function (value, index) {
            value = _this.get_count_name(value);
            my_array = _.filter(my_array, function (value2, index) {
                return value2[value] != 'none';
            });
            my_list = _.union(_.uniq(my_array, value), my_list);
        });
        return my_list.length;
    },
    check_is_clicked: function (name, index) {
        var tag = this.querySelector('#array_l' + index);
        return tag.items[index].is_clicked ? true : false;
    },
    set_id: function (name, index) {
        return name + index;
    },
    get_count_deep: function () {
        var _this = this;
        var count = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            count[_i - 0] = arguments[_i];
        }
        var my_array = JSON.parse(JSON.stringify(this.mobilities_filtered));
        var my_list = [];
        var array_length = count.length;
        _.forEach(count, function (value, index) {
            if (index % 2 != 0) {
                var x = _this.get_count_name(count[index - 1]);
                my_list = _.union(_.filter(my_array, function (value2, index) {
                    return value2[x] == value[x];
                }));
            }
            if (index + 1 == array_length) {
                var x = _this.get_count_name(value);
                my_list = _.filter(my_list, function (value2, index) {
                    return value2[x] != 'none';
                });
                my_list = _.uniq(my_list, x);
            }
        });
        return my_list.length;
    },
    get_count_inner: function (my_array, count) {
        count = this.get_count_name(count);
        var x = _.filter(this.mobilities_filtered, function (value, index) {
            return value[count] == my_array[count];
        });
        return x.length;
    },
    calculate_counts: function (_this) {
        if (_this.tags && _this.tags.length > 0) {
            var my_object = JSON.parse(JSON.stringify(_this.mobilities));
            _.forEach(_this.tags_split, function (tags, tags_index) {
                tags_index = tags_index.replace('_tags', '');
                if (tags.length > 0) {
                    var my_object_filtered = [];
                    _.forEach(tags, function (tag, tag_index) {
                        my_object_filtered = _.union(my_object_filtered, _.filter(my_object, function (value) {
                            return value[tags_index] == tag._id;
                        }));
                    });
                    my_object = my_object_filtered;
                }
            });
            _this.mobilities_filtered = my_object;
        }
        else {
            _this.mobilities_filtered = _this.mobilities;
        }
        this.count_list_original = JSON.parse(JSON.stringify(this.count_list_original));
        this.count_list1 = this.count_list_original;
        this.count_list2 = this.count_list1;
        _this.columns_changed(_this.columns);
        _this.total = _this.mobilities_filtered ? _this.mobilities_filtered.length : 0;
    },
    data_loaded_changed: function (new_value, old_value) {
        var is_data_loaded = true;
        _.forEach(new_value, function (value, index) {
            is_data_loaded = value.is_loaded && is_data_loaded ? true : false;
        });
        this.is_data_loaded = is_data_loaded;
        if (is_data_loaded && (this.mobilities && this.mobilities.length > 0) && _.toArray(new_value).length > 1) {
            this.calculate_counts(this);
        }
    },
    columns_changed: function (new_value, old_value) {
        var _this = this;
        if (new_value) {
            this.count_list1 = _.filter(this.count_list_original, function (value, index) {
                var obj = _.find(new_value, { 'text': _this.capitaliseFirstLetter(_this.get_count_name(value.name).replace('_', ' ')) });
                return obj.is_shown;
            });
            this.count_list2 = this.count_list1;
            this.mobilities_filtered = JSON.parse(JSON.stringify(this.mobilities_filtered));
        }
    },
    processing_table: false,
    last_term_tags: {},
    last_status: '',
    filter_table: function (_this) {
        if (!_this.processing_table) {
            var terms = _this.tags_split.term_tags;
            var status = _this.tags_split.status_tags.length == 1 ? _this.tags_split.status_tags[0] : 'all';
            if (!_.isEqual(terms, _this.last_term_tags) || status != _this.last_status || !_this.mobilities_filtered || _this.mobilities_filtered.length == 0) {
                _this.last_term_tags = terms;
                _this.last_status = status;
                if (!_this.mobilities_filtered || _this.mobilities_filtered.length == 0) {
                    _this.calculate_counts(_this);
                }
                _this.data_loaded['init'].is_loaded = true;
                _this.data_loaded_changed(_this.data_loaded);
                _this.processing_table = true;
                _this.mobilities = null;
                var how_many = _this.status != 'all' ? terms.length : terms.length * 2;
                var stop_processing_table = _.after(how_many, function () {
                    _this.processing_table = false;
                });
                if (!how_many) {
                    _this.processing_table = false;
                }
                if (_this.terms_statuses.length || _this.terms_statuses.length == 0) {
                    _this.terms_statuses = {};
                }
                if (status != 'all') {
                    _.forEach(terms, function (term, key) {
                        _this.data_loaded[term.text + _this.status] = { is_loaded: false };
                        _this.data_loaded_changed(_this.data_loaded);
                        if (_this.terms_statuses[_this.status + term.text]) {
                            _this.mobilities = _.union(_this.mobilities, _this.terms_statuses[_this.status + term.text]);
                            if (!_this.mobilities_filtered || _this.mobilities_filtered.length == 0) {
                                _this.calculate_counts(_this);
                            }
                            stop_processing_table();
                            _this.data_loaded[term.text + _this.status].is_loaded = true;
                            _this.data_loaded_changed(_this.data_loaded);
                        }
                        else {
                            _this.fire_students_tenant_values.child(_this.status).child(term.text).once("value", function (snap) {
                                _this.terms_statuses[_this.status + snap.key()] = _.toArray(snap.val());
                                _this.mobilities = _.union(_this.mobilities, _this.terms_statuses[_this.status + term.text]);
                                if (!_this.mobilities_filtered || _this.mobilities_filtered.length == 0) {
                                    _this.calculate_counts(_this);
                                }
                                stop_processing_table();
                                _this.data_loaded[term.text + _this.status].is_loaded = true;
                                _this.data_loaded_changed(_this.data_loaded);
                            });
                        }
                    });
                }
                else {
                    _.forEach(terms, function (term, key) {
                        _this.data_loaded[term.text + 'IN'] = { is_loaded: false };
                        _this.data_loaded_changed(_this.data_loaded);
                        if (_this.terms_statuses['IN' + term.text]) {
                            _this.mobilities = _.union(_this.mobilities, _this.terms_statuses['IN' + term.text]);
                            if (!_this.mobilities_filtered || _this.mobilities_filtered.length == 0) {
                                _this.calculate_counts(_this);
                            }
                            stop_processing_table();
                            _this.data_loaded[term.text + 'IN'].is_loaded = true;
                            _this.data_loaded_changed(_this.data_loaded);
                        }
                        else {
                            _this.fire_students_tenant_values.child('IN').child(term.text).once("value", function (snap) {
                                _this.terms_statuses['IN' + snap.key()] = _.toArray(snap.val());
                                _this.mobilities = _.union(_this.mobilities, _this.terms_statuses['IN' + term.text]);
                                if (!_this.mobilities_filtered || _this.mobilities_filtered.length == 0) {
                                    _this.calculate_counts(_this);
                                }
                                stop_processing_table();
                                _this.data_loaded[term.text + 'IN'].is_loaded = true;
                                _this.data_loaded_changed(_this.data_loaded);
                            });
                        }
                    });
                    _.forEach(terms, function (term, key) {
                        _this.data_loaded[term.text + 'OUT'] = { is_loaded: false };
                        _this.data_loaded_changed(_this.data_loaded);
                        if (_this.terms_statuses['OUT' + term.text]) {
                            _this.mobilities = _.union(_this.mobilities, _this.terms_statuses['OUT' + term.text]);
                            if (!_this.mobilities_filtered || _this.mobilities_filtered.length == 0) {
                                _this.calculate_counts(_this);
                            }
                            stop_processing_table();
                            _this.data_loaded[term.text + 'OUT'].is_loaded = true;
                            _this.data_loaded_changed(_this.data_loaded);
                        }
                        else {
                            _this.fire_students_tenant_values.child('OUT').child(term.text).once("value", function (snap) {
                                _this.terms_statuses['OUT' + snap.key()] = _.toArray(snap.val());
                                _this.mobilities = _.union(_this.mobilities, _this.terms_statuses['OUT' + term.text]);
                                if (!_this.mobilities_filtered || _this.mobilities_filtered.length == 0) {
                                    _this.calculate_counts(_this);
                                }
                                stop_processing_table();
                                _this.data_loaded[term.text + 'OUT'].is_loaded = true;
                                _this.data_loaded_changed(_this.data_loaded);
                            });
                        }
                    });
                }
                _this.affiliation = 'all';
                _this.country = 'all';
                _this.program = 'all';
                _this.level = 'all';
            }
        }
        else {
            setTimeout(function () {
                _this.filter_table(_this);
            }, 100);
        }
    },
    navigate: function (ctx, next) {
        var _this = document.querySelector("#page_student_table");
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
        var affiliation_selected = _this.affiliation != 'all' && _this.affiliation_list[_this.affiliation] ? _this.affiliation_list[_this.affiliation].text : 'all';
        _this.$.affiliation_auto_ddl.selected = '';
        if (affiliation_selected != 'all') {
            _this.add_tag(affiliation_selected, _this.affiliation, 'affiliation');
        }
        var country_selected = _this.country != 'all' && _this.country ? _.result(_.find(_this.country_list, { '_id': _this.country }), 'text') : 'all';
        _this.$.country_auto_ddl.selected = '';
        if (country_selected != 'all') {
            _this.add_tag(country_selected, _this.country, 'country');
        }
        var program_selected = _this.program != 'all' && _this.program ? _.result(_.find(_this.program_list, { '_id': _this.program }), 'text') : 'all';
        _this.$.program_auto_ddl.selected = '';
        if (program_selected != 'all') {
            _this.add_tag(program_selected, _this.program, 'program');
        }
        var level_selected = _this.level != 'all' && _this.level ? _.result(_.find(_this.level_list, { '_id': _this.level }), 'text') : 'all';
        _this.$.level_auto_ddl.selected = '';
        if (level_selected != 'all') {
            _this.add_tag(level_selected, _this.level, 'level');
        }
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
        var _this = this;
        setTimeout(function () {
            _this.affiliation_list = [];
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
        var affiliation_selected = this.affiliation != 'all' ? _.result(_.find(this.affiliation_list, { '_id': this.affiliation }), 'text') : 'all';
        this.$.affiliation_auto_ddl.selected = '';
        if (affiliation_selected != 'all') {
            this.add_tag(affiliation_selected, this.affiliation, 'affiliation');
            this.calculate_counts(this);
        }
    },
    affiliation_list_search: function (event, detail, sender) {
        var _this = this;
        if (this.affiliation_search == "") {
            this.affiliation_auto_list = _.take(this.affiliation_list, 10);
        }
        else {
            var list = _.filter(this.affiliation_list, function (value) {
                if (value) {
                    return (value.text.toLowerCase().indexOf(_this.affiliation_search.toLowerCase()) > -1);
                }
            });
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
    },
    countryListSearch: function (event, detail, sender) {
        var _this = this;
        if (this.countrySearch == "") {
            this.country_auto_list = _.take(this.country_list, 10);
        }
        else {
            var list = _.filter(this.country_list, function (value) {
                if (value) {
                    return (value.text.toLowerCase().indexOf(_this.countrySearch.toLowerCase()) > -1);
                }
            });
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
    },
    program_list_search: function (event, detail, sender) {
        var _this = this;
        if (this.program_search == "") {
            this.program_auto_list = _.take(this.program_list, 10);
        }
        else {
            var list = _.filter(this.program_list, function (value) {
                if (value) {
                    return (value.text.toLowerCase().indexOf(_this.program_search.toLowerCase()) > -1);
                }
            });
            this.program_auto_list = _.take(list, 10);
        }
    },
    level_selected: function (event, detail, sender) {
        this.level = (this.selected_level_id || this.selected_level_id == 0) ? this.selected_level_id : 'all';
        var level_selected = this.level != 'all' ? _.result(_.find(this.level_list, { '_id': this.level }), 'text') : 'all';
        this.$.level_auto_ddl.selected = '';
        if (level_selected != 'all') {
            this.add_tag(level_selected, this.level, 'level');
            this.calculate_counts(this);
        }
    },
    level_list_search: function (event, detail, sender) {
        this.level_auto_list = this.level_list;
    },
    student_affiliation_selected: function (event, detail, sender) {
        this.student_affiliation = this.selected_student_affiliation_id ? this.selected_student_affiliation_id : 'all';
        var student_affiliation_selected = this.student_affiliation != 'all' ? _.result(_.find(this.student_affiliation_list, { '_id': this.student_affiliation }), 'text') : 'all';
        this.$.student_affiliation_auto_ddl.selected = '';
        if (student_affiliation_selected != 'all') {
            this.add_tag(student_affiliation_selected, this.student_affiliation, 'student_affiliation');
            this.calculate_counts(this);
        }
    },
    student_affiliation_list_search: function (event, detail, sender) {
        var _this = this;
        if (this.student_affiliation_search == "") {
            this.student_affiliation_auto_list = _.take(this.student_affiliation_list, 10);
        }
        else {
            var list = _.filter(this.student_affiliation_list, function (value) {
                if (value) {
                    return (value.text.toLowerCase().indexOf(_this.student_affiliation_search.toLowerCase()) > -1);
                }
            });
            this.student_affiliation_auto_list = _.take(list, 10);
        }
    },
    foreign_affiliation_selected: function (event, detail, sender) {
        this.foreign_affiliation = this.selected_foreign_affiliation_id ? this.selected_foreign_affiliation_id : 'all';
        var foreign_affiliation_selected = this.foreign_affiliation != 'all' ? _.result(_.find(this.foreign_affiliation_list, { '_id': this.foreign_affiliation }), 'text') : 'all';
        this.$.foreign_affiliation_auto_ddl.selected = '';
        if (foreign_affiliation_selected != 'all') {
            this.add_tag(foreign_affiliation_selected, this.foreign_affiliation, 'foreign_affiliation');
            this.calculate_counts(this);
        }
    },
    foreign_affiliation_list_search: function (event, detail, sender) {
        var _this = this;
        if (this.foreign_affiliation_search == "") {
            this.foreign_affiliation_auto_list = _.take(this.foreign_affiliation_list, 10);
        }
        else {
            var list = _.filter(this.foreign_affiliation_list, function (value) {
                if (value) {
                    return (value.text.toLowerCase().indexOf(_this.foreign_affiliation_search.toLowerCase()) > -1);
                }
            });
            this.foreign_affiliation_auto_list = _.take(list, 10);
        }
    },
    term_selected: function (event, detail, sender) {
        this.term = this.selected_term_id ? this.selected_term_id : 'all';
        var term_selected = this.term != 'all' ? _.result(_.find(this.term_list, { '_id': this.term }), 'text') : 'all';
        this.$.term_auto_ddl.selected = '';
        if (term_selected != 'all') {
            this.add_tag(term_selected, this.term, 'term');
        }
    },
    term_list_search: function (event, detail, sender) {
        this.term_auto_list = this.term_list;
    },
    status_selected: function (event, detail, sender) {
        this.status = this.selected_status_id ? this.selected_status_id : 'all';
        var status_selected = this.status != 'all' ? _.result(_.find(this.status_list, { '_id': this.status }), 'text') : 'all';
        this.$.status_auto_ddl.selected = '';
        if (status_selected != 'all') {
            this.add_tag(status_selected, this.status, 'status');
        }
    },
    status_list_search: function (event, detail, sender) {
        this.status_auto_list = this.status_list;
    },
    order_index_changed: function () {
        this.order_by = this.order_index.substr(0, this.order_index.indexOf('-'));
        this.order_by = this.order_by.replace(" ", "_");
        this.asc_desc = this.order_index.substr(this.order_index.indexOf('-') + 1);
        page('#!/' + this.page + '/' + this.page_count + '/' + this.affiliation + '/' + this.continent + '/' + this.country + '/' + this.program + '/' + this.level + '/' + this.status + '/' + this.start_date + '/' + this.end_date + '/' + this.order_by + '/' + this.asc_desc);
    }
});
