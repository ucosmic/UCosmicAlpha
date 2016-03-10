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
        immigration_status_search: {
            type: String,
            notify: true,
            value: ""
        },
        selected_immigration_status_id: {
            type: Number,
            notify: true,
            value: 0
        },
        immigration_status_auto_list: {
            type: Array,
            notify: true,
            value: []
        },
        gender_search: {
            type: String,
            notify: true,
            value: ""
        },
        selected_gender_id: {
            type: Number,
            notify: true,
            value: 0
        },
        gender_auto_list: {
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
        gender_list: {
            type: Array,
            notify: true,
        },
        immigration_status_list: {
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
        },
        count_list_original: {
            type: Array,
            notify: true,
            value: []
        },
        is_processing: {
            type: Boolean,
            notify: true,
            value: false
        },
        mobilities_filtered: {
            type: Array,
            notify: true,
            value: []
        },
        tags_to_add: {
            type: Array,
            value: []
        },
        db: {
            type: Object,
            value: {}
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
    },
    setup_db: function (_this) {
        _this.db_name = 'students_' + _this.tenant_id;
        _this.db = new PouchDB(_this.db_name);
        _this.db.get('student_table', function (error, response) {
            if (!error) {
                _this._rev = response._rev;
                _this.student_table_storage = response.data;
            }
            if (_this.student_table_storage && _this.student_table_storage.mobilities && _this.student_table_storage.mobilities.length && !(_this.student_table_storage.date_stored ? (_this.in_days(_this.student_table_storage.date_stored, Date.now()) > 1 ? true : false) : false)) {
                _this.mobilities = _this.student_table_storage.mobilities;
                _this.establishment_list = _this.student_table_storage.establishment_list;
                _this.country_list = _this.student_table_storage.country_list;
                _this.program_list = _this.student_table_storage.program_list;
                _this.level_list = _this.student_table_storage.level_list;
                _this.tags = _this.student_table_storage.tags;
                _this.last_term_tags = _this.student_table_storage.last_term_tags;
                _this.last_status = _this.student_table_storage.last_status;
                _this.terms_statuses = _this.student_table_storage.terms_statuses ? _this.student_table_storage.terms_statuses : {};
                _this.count_list_original = _.map(_this.student_table_storage.columns, function (value, index) {
                    if (value) {
                        return { name: _this.process_text_to_name(value.text), is_clicked: false, show_all: false };
                    }
                });
                _this.columns = _this.student_table_storage.columns;
                _this.filter_table(_this);
            }
            else if (!_this.mobilities && !_this.establishment_list && !_this.country_list && !_this.program_list && !_this.level_list && !_this.tags) {
                if (_this.student_table_storage) {
                    _this.student_table_storage.date_stored = Date.now();
                }
                _this.mobilities = [];
                _this.establishment_list = [];
                _this.country_list = [];
                _this.program_list = [];
                _this.gender_list = [];
                _this.level_list = [];
                _this.tags = [];
                _this.last_term_tags = [];
                _this.last_status = [];
                _this.terms_statuses = {};
                _this.start_setup_filter();
            }
            if (_this.columns) {
                _this.start_setup_filter();
            }
            else {
                _this.load_settings_counts(_this);
            }
        });
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
            case "immigration_status": return mobility.immigration_status_name;
            case "gender": return mobility.gender_name;
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
            _this.establishment_list = [];
            _this.establishment_list = _.map(_.range(15000), function () { return undefined; });
            _.each(snapshot.val(), function (value, index) {
                var index_2 = parseInt(index);
                _this.establishment_list.splice(index_2, 1, { _id: index_2, text: value.establishment });
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
            var associations = [];
            var country_list = _.map(snapshot.val(), function (value, index) {
                if (value) {
                    var object = { _id: index, text: value.country, associations: value.associations };
                    if (value.associations) {
                        value.associations.forEach(function (association, index_2) {
                            associations.push({ _id: association.id, text: association.name });
                        });
                    }
                    return object;
                }
            });
            _this.region_list = _.uniqBy(associations, 'text');
            _this.country_list = country_list.concat(_this.region_list);
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
        this.load_settings_counts(this);
        this.setup_db(this);
    },
    start_setup_filter: _.after(8, function () {
        this.filter_table(this);
    }),
    pouchDB_save: function (my_this) {
        if (!my_this.db_updating) {
            my_this.db_updating = true;
            my_this.db.get('student_table', function (error, response) {
                if (!error) {
                    my_this._rev = response._rev;
                }
                if (my_this._rev) {
                    my_this.db.put({ _id: 'student_table', _rev: my_this._rev, data: my_this.student_table_storage }).then(function (response) {
                        my_this.db_updating = false;
                    }).catch(function (err) {
                        my_this.db_updating = false;
                        console.log(err);
                    });
                }
                else {
                    my_this.db.put({ _id: 'student_table', data: my_this.student_table_storage }).then(function (response) {
                        my_this.db_updating = false;
                    }).catch(function (err) {
                        my_this.db_updating = false;
                        console.log(err);
                    });
                }
            });
        }
        else {
            setTimeout(function () {
                my_this.pouchDB_save(my_this);
            }, 50);
        }
    },
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
        this.pouchDB_save(this);
        return this.student_table_storage;
    },
    in_days: function (t1, t2) {
        //var t2 = d2.getTime();
        //var t1 = d1.getTime();
        return (t2 - t1) / (24 * 3600 * 1000);
    },
    compute_term_is_selected: function (tags) {
        var term_tags = _.uniqBy(_.filter(tags, function (tag) {
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
    process_text_to_name: function (text) {
        switch (text) {
            case "Country":
                return 'Countries';
            case "Program":
                return 'Field of Study';
            case "Level":
                return 'Levels';
            case "Affiliation":
                return 'Affiliations';
            case "Status":
                return 'Status';
            case "Term":
                return 'Terms';
            case "Student Affiliation":
                return 'Student Affiliations';
            case "Immigration Status":
                return 'Immigration Status';
            case "Gender":
                return 'Gender';
            case "Foreign Affiliation":
                return 'Foreign Affiliations';
            case "Region":
                return 'Regions';
        }
    },
    student_table_storage_loaded: function () {
    },
    load_settings_counts: _.after(2, function (my_this) {
        var _this = this;
        this.fire_members_settings_mobility_counts.once("value", function (snapshot) {
            _this.count_list_original = _.map(snapshot.val(), function (value, index) {
                if (value) {
                    return { name: my_this.process_text_to_name(value.text), is_clicked: false, show_all: false };
                }
            });
            _this.columns = snapshot.val();
            _this.count_list_original = _.map(_this.columns, function (value, index) {
                return { name: my_this.process_text_to_name(value.text), is_clicked: false, show_all: false };
            });
            _this.count_list1 = _this.count_list_original;
            _this.count_list2 = _this.count_list1;
            _this.start_setup_filter();
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    }),
    student_table_storage_loaded_empty: function () {
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
                student_affiliation_list = value.student_affiliation != 'none' ? _.union(student_affiliation_list, [_this.establishment_list[value.student_affiliation]]) : student_affiliation_list;
            });
        }
        var immigration_status_list = _.uniqBy(new_value, 'immigration_status').map(function (value, index) {
            var new_value = { _id: 0, text: '' };
            new_value._id = index;
            new_value.text = value.immigration_status;
            return new_value;
        });
        var gender_list = _.uniqBy(new_value, 'gender').map(function (value, index) {
            var new_value = { _id: 0, text: '' };
            new_value._id = index;
            new_value.text = value.gender;
            return new_value;
        });
        var foreign_affiliation_list = [];
        if (this.establishment_list) {
            _.forEach(new_value, function (value, index) {
                foreign_affiliation_list = value.foreign_affiliation != 'none' ? _.union(foreign_affiliation_list, [_this.establishment_list[value.foreign_affiliation]]) : foreign_affiliation_list;
            });
        }
        this.student_affiliation_list = student_affiliation_list;
        this.gender_list = gender_list;
        this.immigration_status_list = immigration_status_list;
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
        var affiliation_tags = _.uniqBy(_.filter(tags, function (tag) {
            if (tag._type == 'affiliation') {
                return tag;
            }
        }), '_id');
        var country_tags = _.uniqBy(_.filter(tags, function (tag) {
            if (tag._type == 'country') {
                return tag;
            }
        }), '_id');
        var program_tags = _.uniqBy(_.filter(tags, function (tag) {
            if (tag._type == 'program') {
                return tag;
            }
        }), '_id');
        var level_tags = _.uniqBy(_.filter(tags, function (tag) {
            if (tag._type == 'level') {
                return tag;
            }
        }), '_id');
        var term_tags = _.uniqBy(_.filter(tags, function (tag) {
            if (tag._type == 'term') {
                return tag;
            }
        }), '_id');
        var status_tags = _.uniqBy(_.filter(tags, function (tag) {
            if (tag._type == 'status') {
                return tag;
            }
        }), '_id');
        var foreign_affiliation_tags = _.uniqBy(_.filter(tags, function (tag) {
            if (tag._type == 'foreign_affiliation') {
                return tag;
            }
        }), '_id');
        var student_affiliation_tags = _.uniqBy(_.filter(tags, function (tag) {
            if (tag._type == 'student_affiliation') {
                return tag;
            }
        }), '_id');
        var gender_tags = _.uniqBy(_.filter(tags, function (tag) {
            if (tag._type == 'gender') {
                return tag;
            }
        }), '_id');
        var immigration_status_tags = _.uniqBy(_.filter(tags, function (tag) {
            if (tag._type == 'immigration_status') {
                return tag;
            }
        }), '_id');
        return {
            affiliation_tags: affiliation_tags, country_tags: country_tags, program_tags: program_tags, level_tags: level_tags, term_tags: term_tags,
            status_tags: status_tags, foreign_affiliation_tags: foreign_affiliation_tags, student_affiliation_tags: student_affiliation_tags,
            gender_tags: gender_tags, immigration_status_tags: immigration_status_tags
        };
    },
    tags_split_union: function () {
        var _this = document.querySelector("#page_student_table");
        var union_tags = _.union(_this.tags_split.affiliation_tags, _this.tags_split.country_tags, _this.tags_split.program_tags, _this.tags_split.level_tags, _this.tags_split.term_tags, _this.tags_split.status_tags, _this.tags_split.foreign_affiliation_tags, _this.tags_split.student_affiliation_tags, _this.tags_split.gender_tags, _this.tags_split.immigration_status_tags);
        if (_this.tags.length != union_tags.length) {
            _this.tags = union_tags;
        }
    },
    capitaliseFirstLetter: function (myString) {
        return myString.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    },
    get_expand_icon: function (is_expanded) {
        return is_expanded ? 'student_table:unfold-less' : 'student_table:unfold-more';
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
        this.is_processing = true;
        var tag = this.$.count_l1.itemForElement(event.target);
        var target = this.closest_utility().find_closest(event.target, '#collapse_outer' + this.$.count_l1.indexForElement(event.target));
        if (tag.show_all) {
            target.toggle();
            setTimeout(function () {
                tag.show_all = false;
                _this.count_list1 = JSON.parse(JSON.stringify(_this.count_list1));
                setTimeout(function () {
                    target.toggle();
                    _this.is_processing = false;
                }, 100);
            }, 200);
        }
        else {
            target.toggle();
            setTimeout(function () {
                tag.show_all = true;
                _this.count_list1 = JSON.parse(JSON.stringify(_this.count_list1));
                setTimeout(function () {
                    target.toggle();
                    _this.is_processing = false;
                }, 100);
            }, 100);
        }
    },
    get_chart_name: function (value, name) {
        switch (value) {
            case 0:
                return 'bar';
            case 1:
                return 'column';
            case 2:
                return 'pie';
            case 3:
                return this.is_country(name) ? 'geo' : 'line';
        }
        return 'column';
    },
    is_country: function (name) {
        if (name == 'Countries') {
            return true;
        }
        else {
            return false;
        }
        console.log(name);
    },
    is_term: function (name) {
        if (name == 'Terms') {
            return true;
        }
        else {
            return false;
        }
        console.log('term');
    },
    show_charts: function (event, target, test) {
        var target = this.closest_utility().find_closest(event.target, '.dialog_charts');
        var chart = this.closest_utility().find_closest(event.target, 'google-chart');
        var paper_tabs = this.closest_utility().find_closest(event.target, 'paper-menu');
        paper_tabs.selected = 0;
        var template = this.closest_utility().find_closest(event.target, '#count_l1');
        var index = template.indexForElement(event.target);
        var item = template.itemForElement(event.target);
        var template2 = this.closest_utility().find_closest(event.target, '#array_l' + index);
        var rows = [], my_this = this;
        _.each(template2.collection.store, function (value, index, array) {
            rows.push([my_this.get_name(array[index], item.name), my_this.get_count_inner(array[index], item.name)]);
        });
        var chart = this.closest_utility().find_closest(event.target, 'google-chart');
        chart.cols = [{ "label": "Value", "type": "string" }, { "label": "Count", "type": "number" }];
        chart.rows = rows;
        target.toggle();
        setTimeout(function () {
            chart.drawChart();
        }, 100);
    },
    chart_selected: function (event, target, test) {
        var target = this.closest_utility().find_closest(event.target, '.dialog_charts');
        var chart = this.closest_utility().find_closest(event.target, 'google-chart');
        var template = this.closest_utility().find_closest(event.target, '#count_l1');
        var index = template.indexForElement(event.target);
        var item = template.itemForElement(event.target);
        var template2 = this.closest_utility().find_closest(event.target, '#array_l' + index);
        var rows = [], my_this = this;
        if (event.target.selected == 2) {
            _.each(template2.collection.store, function (value, index, array) {
                rows.push([my_this.get_name(array[index], item.name), my_this.get_count_inner(array[index], item.name)]);
            });
        }
        else {
            _.each(template2.collection.store, function (value, index, array) {
                rows.push([my_this.get_name(array[index], item.name), my_this.get_count_inner(array[index], item.name)]);
            });
        }
        var chart = this.closest_utility().find_closest(event.target, 'google-chart');
        chart.cols = [{ "label": "Value", "type": "string" }, { "label": "Count", "type": "number" }];
        chart.rows = rows;
        setTimeout(function () {
            chart.drawChart();
        }, 100);
    },
    clear_tags: function () {
        this.tags = [];
        this.calculate_counts(this);
    },
    close_dialog: function (event) {
        var target = this.closest_utility().find_closest(event.target, '.dialog_charts');
        target.toggle();
    },
    show_charts_2: function (event, target, test) {
        var target = this.closest_utility().find_closest(event.target, '.dialog_charts');
        var chart = this.closest_utility().find_closest(event.target, 'google-chart');
        var paper_tabs = this.closest_utility().find_closest(event.target, 'paper-menu');
        paper_tabs.selected = 0;
        target.toggle();
        var template_parent = this.closest_utility().find_closest(event.target, '#count_l1');
        var index_parent = template_parent.indexForElement(event.target);
        var item_parent = template_parent.itemForElement(event.target);
        var template = this.closest_utility().find_closest(event.target, '.count_l2');
        var index = template.indexForElement(event.target);
        var item = template.itemForElement(event.target);
        var rows = [], my_this = this;
        _.each(this.count_list2, function (value) {
            rows.push([value.name, my_this.get_count_deep(item_parent.name, template.collection.store[index_parent], value.name)]);
        });
        var chart = this.closest_utility().find_closest(event.target, 'google-chart');
        chart.cols = [{ "label": "Value", "type": "string" }, { "label": "Count", "type": "number" }];
        chart.rows = rows;
        setTimeout(function () {
            chart.drawChart();
        }, 100);
    },
    count_clicked: function (event) {
        var _this = this;
        var index = 1;
        var tag = event.model.__data__['count_l1'];
        if (this.get_count(tag.name) > 0) {
            this.is_processing = true;
            var is_closing_expandables = this.is_closing_expandables;
            setTimeout(function () {
                if (tag.is_clicked) {
                    _this.closest_utility().find_closest(event.target, '#collapse_outer' + event.model.__data__.__key__).opened = false;
                    _this.is_processing = false;
                    setTimeout(function () {
                        tag.is_clicked = false;
                        tag.is_expanded = false;
                        _this['count_list' + index] = JSON.parse(JSON.stringify(_this['count_list' + index]));
                    }, 500);
                }
                else {
                    tag.is_clicked = true;
                    tag.is_expanded = true;
                    _this['count_list' + index] = JSON.parse(JSON.stringify(_this['count_list' + index]));
                    setTimeout(function () {
                        _this.closest_utility().find_closest(event.target, '#collapse_outer' + event.model.__data__.__key__).opened = true;
                        _this.is_processing = false;
                    }, 50);
                }
            }, 10);
        }
    },
    array_clicked: function (event) {
        var _this = this;
        this.is_processing = true;
        setTimeout(function () {
            var index = event.target.parentElement.id;
            var parent = event.model.dataHost.parentElement.children['array_l' + index];
            var tag = event.model.__data__['array_l1'];
            var collection = event.model.dataHost.dataHost.dataHost.items;
            if (tag.is_clicked) {
                _this.closest_utility().find_closest(event.target, 'iron-collapse').opened = false;
                _this.is_processing = false;
                setTimeout(function () {
                    tag.is_clicked = false;
                    tag.is_expanded = false;
                    event.model.dataHost.items = JSON.parse(JSON.stringify(event.model.dataHost.items));
                }, 500);
            }
            else {
                tag.is_clicked = true;
                tag.is_expanded = true;
                var template = _this.closest_utility().find_closest_parent(event.target, 'template');
                event.model.dataHost.items = JSON.parse(JSON.stringify(event.model.dataHost.items));
                setTimeout(function () {
                    _this.closest_utility().find_closest(event.target, 'iron-collapse').opened = true;
                    _this.is_processing = false;
                }, 50);
            }
        }, 1);
    },
    get_count_name: function (value) {
        switch (value) {
            case "Countries":
                return 'country';
            case "Field of Study":
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
            case "Gender":
                return 'gender';
            case "Immigration Status":
                return 'immigration_status';
            case "Foreign Affiliations":
                return 'foreign_affiliation';
            default:
                return 'region';
        }
    },
    get_name: function (my_array, count) {
        count = this.get_count_name(count);
        var x = _.find(this[count + '_list'], function (value, index) {
            if (value) {
                return value._id == my_array[count] || value.text == my_array[count];
            }
        });
        if (x) {
            return x.text ? x.text : count == 'student_affiliation' ? 'No College Designated' : 'Not Reported';
        }
        else {
            return count == 'student_affiliation' ? 'No College Designated' : 'Not Reported';
        }
    },
    create_array: function (name, show_all) {
        var _this = this;
        var name = this.get_count_name(name);
        var my_list = [];
        if (name == 'region') {
            var new_array = [], new_array_length;
            _.forEach(this.mobilities_filtered, function (val, index) {
                my_list = _.uniqBy(_.union(my_list, val.regions), 'name');
            });
            my_list.map(function (val) {
                val.region = val.id;
                return val;
            });
        }
        else {
            my_list = _.union(_.uniqBy(this.mobilities_filtered, name), my_list);
        }
        if (show_all) {
            return _.sortBy(my_list, function (my_array, index) {
                var count = (_.filter(_this.mobilities_filtered, function (value, index) {
                    if (Array.isArray(value[name + 's'])) {
                        return value[name + 's'].find(function (v2) {
                            return v2.name == my_array.name;
                        });
                    }
                    else {
                        return value[name] == my_array[name];
                    }
                }).length);
                my_array.count = count;
                return -1 * count;
            });
        }
        else {
            return _.take(_.sortBy(my_list, function (my_array, index) {
                var count = (_.filter(_this.mobilities_filtered, function (value, index) {
                    if (Array.isArray(value[name + 's'])) {
                        return value[name + 's'].find(function (v2) {
                            return v2.name == my_array.name;
                        });
                    }
                    else {
                        return value[name] == my_array[name];
                    }
                }).length);
                my_array.count = count;
                return -1 * count;
            }), 10);
        }
    },
    get_count: function (count) {
        var my_array = JSON.parse(JSON.stringify(this.mobilities_filtered));
        var my_list = [];
        var value = this.get_count_name(count);
        _.remove(my_array, function (value2, index) {
            return value2[value] == 'none';
        });
        if (value == 'region') {
            _.forEach(my_array, function (val, index) {
                my_list = _.uniqBy(_.union(my_list, val.regions), 'name');
            });
        }
        else {
            my_list = _.union(_.uniqBy(my_array, value), my_list);
        }
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
                    return Array.isArray(value2[x + 's']) ? value2[x + 's'].find(function (val) {
                        return val.id == value[x];
                    }) : value2[x] == value[x];
                }));
            }
            if (index + 1 == array_length) {
                var x = _this.get_count_name(value);
                my_list = _.filter(my_list, function (value2, index) {
                    return Array.isArray(value2[x + 's']) ? value2[x + 's'].find(function (val) {
                        return val.id != 'none';
                    }) : value2[x] != 'none';
                });
                if (x == 'region') {
                    var my_list_2 = [];
                    _.forEach(my_list, function (val, index) {
                        my_list_2 = _.uniqBy(_.union(my_list_2, val.regions), 'name');
                    });
                    my_list = my_list_2;
                }
                else {
                    my_list = _.uniqBy(my_list, x);
                }
            }
        });
        return my_list.length;
    },
    get_count_inner: function (my_array, count) {
        count = this.get_count_name(count);
        var x = _.filter(this.mobilities_filtered, function (value, index) {
            return Array.isArray(value[count + 's']) ? value[count + 's'].find(function (val) {
                return val.id == my_array[count];
            }) : my_array[count] == value[count];
        });
        return x.length;
    },
    add_tags: function (event) {
        var _this = this;
        this.tags_to_add.forEach(function (tag) {
            _this.add_tag(tag.tag_name, tag._id, tag.type);
        });
        this.tags_to_add = [];
        this.$.affiliation_auto_ddl.selected = '';
        this.$.term_auto_ddl.selected = '';
        this.$.status_auto_ddl.selected = '';
        this.$.country_auto_ddl.selected = '';
        this.$.student_affiliation_auto_ddl.selected = '';
        this.$.immigration_status_auto_ddl.selected = '';
        this.$.gender_auto_ddl.selected = '';
        this.$.level_auto_ddl.selected = '';
        this.$.program_auto_ddl.selected = '';
        this.calculate_counts(this);
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
                            if (tag._type == 'country') {
                                return value[tags_index] == tag._id ? value[tags_index] == tag._id : value['regions'] && value['regions'] != 'none' ? value['regions'].find(function (val) {
                                    return val.id == tag._id;
                                }) : false;
                            }
                            else {
                                return value[tags_index] == tag._id;
                            }
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
        function add_regions(snap) {
            var new_term = _.map(_.toArray(snap.val()), function (value, index) {
                var country = _this.country_list[parseInt(value.country)];
                value.regions = country ? _this.country_list[parseInt(value.country)].associations : 'none';
                return value;
            });
            return new_term;
        }
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
                                _this.terms_statuses[_this.status + snap.key()] = add_regions(snap);
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
                                _this.terms_statuses['IN' + snap.key()] = add_regions(snap);
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
                                _this.terms_statuses['OUT' + snap.key()] = add_regions(snap);
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
                _this.gender = 'all';
                _this.immigration_status = 'all';
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
    leave_affiliation_search: function (event, detail, sender) {
        var _this = this;
        setTimeout(function () {
            _this.affiliation_list = [];
        }, 200);
    },
    add_tag: function (text, _id, _type) {
        this.tags = _.union(this.tags, [{ text: text.replace(".", " ").replace("/", " "), _id: _id, _type: _type }]);
    },
    affiliation_selected: function (event, detail, sender) {
        this.affiliation = this.selected_affiliation_id ? this.selected_affiliation_id : 'all';
        var affiliation_selected = this.affiliation != 'all' ? _.result(_.find(this.affiliation_list, { '_id': this.affiliation }), 'text') : 'all';
        if (affiliation_selected != 'all') {
            this.tags_to_add.push({ tag_name: affiliation_selected, _id: this.affiliation, type: 'affiliation' });
        }
    },
    affiliation_list_search: function (event, detail, sender) {
        var _this = this;
        if (this.affiliation_search == "") {
            this.affiliation_auto_list = this.affiliation_list;
        }
        else {
            var list = _.filter(this.affiliation_list, function (value) {
                if (value) {
                    return (value.text.toLowerCase().indexOf(_this.affiliation_search.toLowerCase()) > -1);
                }
            });
            this.affiliation_auto_list = list;
        }
    },
    countrySelected: function (event, detail, sender) {
        this.country = this.selectedCountryId ? this.selectedCountryId : 'all';
        var country_selected = this.country != 'all' ? _.result(_.find(this.country_list, { '_id': this.country }), 'text') : 'all';
        if (country_selected != 'all') {
            this.tags_to_add.push({ tag_name: country_selected, _id: this.country, type: 'country' });
        }
    },
    countryListSearch: function (event, detail, sender) {
        var _this = this;
        if (this.countrySearch == "") {
            this.country_auto_list = this.country_list;
        }
        else {
            var list = _.filter(this.country_list, function (value) {
                if (value) {
                    return (value.text.toLowerCase().indexOf(_this.countrySearch.toLowerCase()) > -1);
                }
            });
            this.country_auto_list = list;
        }
    },
    program_selected: function (event, detail, sender) {
        this.program = this.selected_program_id ? this.selected_program_id : 'all';
        var program_selected = this.program != 'all' ? _.result(_.find(this.program_list, { '_id': this.program }), 'text') : 'all';
        if (program_selected != 'all') {
            this.tags_to_add.push({ tag_name: program_selected, _id: this.program, type: 'program' });
        }
    },
    program_list_search: function (event, detail, sender) {
        var _this = this;
        if (this.program_search == "") {
            this.program_auto_list = this.program_list;
        }
        else {
            var list = _.filter(this.program_list, function (value) {
                if (value) {
                    return (value.text.toLowerCase().indexOf(_this.program_search.toLowerCase()) > -1);
                }
            });
            this.program_auto_list = list;
        }
    },
    level_selected: function (event, detail, sender) {
        this.level = (this.selected_level_id || this.selected_level_id == 0) ? this.selected_level_id : 'all';
        var level_selected = this.level != 'all' ? _.result(_.find(this.level_list, { '_id': this.level }), 'text') : 'all';
        if (level_selected != 'all') {
            this.tags_to_add.push({ tag_name: level_selected, _id: this.level, type: 'level' });
        }
    },
    level_list_search: function (event, detail, sender) {
        this.level_auto_list = this.level_list;
    },
    student_affiliation_selected: function (event, detail, sender) {
        this.student_affiliation = this.selected_student_affiliation_id ? this.selected_student_affiliation_id : 'all';
        var student_affiliation_selected = this.student_affiliation != 'all' ? _.result(_.find(this.student_affiliation_list, { '_id': this.student_affiliation }), 'text') : 'all';
        if (student_affiliation_selected != 'all') {
            this.tags_to_add.push({ tag_name: student_affiliation_selected, _id: this.student_affiliation, type: 'student_affiliation' });
        }
    },
    student_affiliation_list_search: function (event, detail, sender) {
        var _this = this;
        if (this.student_affiliation_search == "") {
            this.student_affiliation_auto_list = this.student_affiliation_list;
        }
        else {
            var list = _.filter(this.student_affiliation_list, function (value) {
                if (value) {
                    return (value.text.toLowerCase().indexOf(_this.student_affiliation_search.toLowerCase()) > -1);
                }
            });
            this.student_affiliation_auto_list = list;
        }
    },
    immigration_status_selected: function (event, detail, sender) {
        this.immigration_status = this.selected_immigration_status_id ? this.selected_immigration_status_id : 'all';
        var immigration_status_selected = this.immigration_status != 'all' ? _.result(_.find(this.immigration_status_list, { '_id': this.immigration_status }), 'text') : 'all';
        if (immigration_status_selected != 'all') {
            this.tags_to_add.push({ tag_name: immigration_status_selected, _id: this.immigration_status, type: 'immigration_status' });
        }
    },
    immigration_status_list_search: function (event, detail, sender) {
        var _this = this;
        if (this.immigration_status_search == "") {
            this.immigration_status_auto_list = this.immigration_status_list;
        }
        else {
            var list = _.filter(this.immigration_status_list, function (value) {
                if (value) {
                    return (value.text.toLowerCase().indexOf(_this.immigration_status_search.toLowerCase()) > -1);
                }
            });
            this.immigration_status_auto_list = list;
        }
    },
    gender_selected: function (event, detail, sender) {
        this.gender = this.selected_gender_id ? this.selected_gender_id : 'all';
        var gender_selected = this.gender != 'all' ? _.result(_.find(this.gender_list, { '_id': this.gender }), 'text') : 'all';
        if (gender_selected != 'all') {
            this.tags_to_add.push({ tag_name: gender_selected, _id: this.gender, type: 'gender' });
        }
    },
    gender_list_search: function (event, detail, sender) {
        var _this = this;
        if (this.gender_search == "") {
            this.gender_auto_list = this.gender_list;
        }
        else {
            var list = _.filter(this.gender_list, function (value) {
                if (value) {
                    return (value.text.toLowerCase().indexOf(_this.gender_search.toLowerCase()) > -1);
                }
            });
            this.gender_auto_list = list;
        }
    },
    foreign_affiliation_selected: function (event, detail, sender) {
        this.foreign_affiliation = this.selected_foreign_affiliation_id ? this.selected_foreign_affiliation_id : 'all';
        var foreign_affiliation_selected = this.foreign_affiliation != 'all' ? _.result(_.find(this.foreign_affiliation_list, { '_id': this.foreign_affiliation }), 'text') : 'all';
        if (foreign_affiliation_selected != 'all') {
            this.tags_to_add.push({ tag_name: foreign_affiliation_selected, _id: this.foreign_affiliation, type: 'foreign_affiliation' });
        }
    },
    foreign_affiliation_list_search: function (event, detail, sender) {
        var _this = this;
        if (this.foreign_affiliation_search == "") {
            this.foreign_affiliation_auto_list = this.foreign_affiliation_list;
        }
        else {
            var list = _.filter(this.foreign_affiliation_list, function (value) {
                if (value) {
                    return (value.text.toLowerCase().indexOf(_this.foreign_affiliation_search.toLowerCase()) > -1);
                }
            });
            this.foreign_affiliation_auto_list = list;
        }
    },
    term_selected: function (event, detail, sender) {
        this.term = this.selected_term_id ? this.selected_term_id : 'all';
        var term_selected = this.term != 'all' ? _.result(_.find(this.term_list, { '_id': this.term }), 'text') : 'all';
        if (term_selected != 'all') {
            this.tags_to_add.push({ tag_name: term_selected, _id: this.term, type: 'term' });
        }
    },
    term_list_search: function (event, detail, sender) {
        this.term_auto_list = this.term_list;
    },
    status_selected: function (event, detail, sender) {
        this.status = this.selected_status_id ? this.selected_status_id : 'all';
        var status_selected = this.status != 'all' ? _.result(_.find(this.status_list, { '_id': this.status }), 'text') : 'all';
        if (status_selected != 'all') {
            this.tags_to_add.push({ tag_name: status_selected, _id: this.status, type: 'status' });
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
