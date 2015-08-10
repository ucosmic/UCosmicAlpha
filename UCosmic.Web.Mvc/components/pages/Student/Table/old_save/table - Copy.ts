/// <reference path="../../../../../scripts/typings/lodash.d.ts" />
/// <reference path="../../../../typediff/mytypes.d.ts" />
/// <reference path="../../../../models/students.ts" />
/// <reference path="../../../../../scripts/typings/lodash.d.ts" />



//import Student_Table = Students

//var Student.stud = new Student_Module();
//var Student = Student_Module.Students;
Polymer({
    is: "is-page-student-table",
    //behaviors: [paginate],
    properties: {
        //styledomain, tenant_id, firebase_token
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
        , establishmentSearch: {
            type: String,
            notify: true,
            value: ""
        }
        , selectedEstablishmentId: {
            type: Number,
            notify: true,
            value: 0
        }
        , establishment_auto_list: {
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
        , tags: {
            type: Array,
            notify: true
        //, value: []
            , observer: 'tags_changed'
        }
        , tags_split: {
            type: Array
            , computed: 'tags_splitter(tags)'
            //, observer: 'tags_split_changed'
        }
        , establishment_list: {
            type: Array,
            notify: true
            //,value: []
        }
        , country_list: {
            type: Array,
            notify: true,
        }
        , program_list: {
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
            , computed: 'student_table_storage_compute(mobilities, establishment_list, country_list, program_list, level_list, tags, columns)'
            //, observer: 'tags_split_changed'
        }
        , filter_closed: {
            type: Boolean,
            value: false
            , notify: true
            , observer: 'filter_closed_changed'
        }
        , order_by_list: {
            type: Array,
            notify: true,
            value: [ //redo this based on columns shown - add foreign affiliation and sub aff
                { value: 'start_date-desc', text: 'Most Recent First' }
                , { value: 'end_date-asc', text: 'Most Recent Last' }
                , { value: 'status-desc', text: 'In Coming First' }
                , { value: 'status-asc', text: 'Out Going First' }
                , { value: 'affiliation_name-desc', text: 'Affiliation A-Z' }
                , { value: 'affiliation_name-asc', text: 'Affiliation Z-A' }
                , { value: 'foreign_affiliation_name-desc', text: 'Foreign Affiliation A-Z' }
                , { value: 'foreign_affiliation_name-asc', text: 'Foreign Affiliation Z-A' }
                , { value: 'country_official_name-desc', text: 'country A-Z' }
                , { value: 'country_official_name-asc', text: 'country Z-A' }
                , { value: 'program_name-desc', text: 'program A-Z' }
                , { value: 'program_name-asc', text: 'program Z-A' }
                , { value: 'level_name-desc', text: 'level A-Z' }
                , { value: 'level_name-asc', text: 'level Z-A' }
                , { value: 'sub_affiliation_name-desc', text: 'Sub Affiliation A-Z' }
                , { value: 'sub_affiliation_name-asc', text: 'Sub Affiliation Z-A' }
            ]
        }
        , columns: {
            type: Array,
            notify: true,
        }
        , order_by: {
            type: String,
            //notify: true,
            //reflectToAttribute: true
        }
        , asc_desc: {
            type: String,
            //notify: true,
            //reflectToAttribute: true
        }
        , order_index: {
            type: Number,
            observer: 'order_index_changed'
        }
    },
    //fire: null,
    fire_students: null,
    fire_students_students: null,
    fire_establishments: null,
    fire_students_terms: null,
    fire_students_levels: null,
    fire_students_programs: null,
    fire_students_mobilities: null,
    fire_students_mobilities_join: null,
    fire_countries: null,
    fire_norm: null,
    lastEstablishmentSearch: "",
    last_selected_establishment_id: -1,
    data_loaded: { mobilities: 0, establishments: 0, countries: 0, tags: 0, programs: 0 },
    //establishment_list: [],
    //country_list: [],
    //term_list: [],
    //level_list: [],
    //program_list: [],
    //mobilities: [],
    //mobilities_page: [],
    controller: null,
    created: function () {
        this.controller = this;
         
        //this.fire = new Firebase("https://UCosmic.firebaseio.com");
        this.fire_students = new Firebase("https://UCosmic.firebaseio.com/Students");
        this.fire_students_students = new Firebase("https://UCosmic.firebaseio.com/Students/Students");
        this.fire_students_mobilities = new Firebase("https://UCosmic.firebaseio.com/Students/Mobilities");
        this.fire_students_terms = new Firebase("https://UCosmic.firebaseio.com/Students/Terms");
        this.fire_students_programs = new Firebase("https://UCosmic.firebaseio.com/Students/Programs");
        this.fire_students_levels = new Firebase("https://UCosmic.firebaseio.com/Students/Levels");
        this.fire_countries = new Firebase("https://UCosmic.firebaseio.com/Places/Countries");
        this.fire_establishments = new Firebase("https://UCosmic.firebaseio.com/Establishments/Establishments");

        //this.fire_norm = 


        this.fire_countries.once("value", (snapshot) => {
            this.country_list = _.map(snapshot.val(), function (value: any, index) {
                if (value) {
                    var object = { _id: index, text: value.country }
                    return object;
                }
            });
        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });

        this.fire_students_programs.once("value", (snapshot) => {
            this.program_list = _.map(snapshot.val(), function (value: any, index) {
                if (value) {
                    var object = { _id: index, text: value.name }
                    return object;
                }
            });
        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });
        this.fire_students_levels.once("value", (snapshot) => {
            this.level_list = _.map(snapshot.val(), function (value: any, index) {
                if (value) {
                    var object = { _id: index, text: value.name }
                    return object;
                }
            });
        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });
        //var page = this.pagination_utility().pagination();
        //page.init(ref, 5); 


        //page.nextPage(function (val) {
        //    console.log(val);
        //    page.nextPage(function (val) {
        //        console.log(val);
        //    });
        //});
        //setTimeout(() => {

        //}, 1);
        //var load_content = _.after(5, () => {

        //});
        //this.fire_students_levels.on("value", (snapshot) => {
        //    this.level_list = snapshot.val();
        //    load_content();
        //}, function (errorObject) {
        //        console.log("The read failed: " + errorObject.code);
        //    });
        //this.fire_students_programs.on("value", (snapshot) => {
        //    this.program_list = snapshot.val();
        //    load_content();
        //}, function (errorObject) {
        //        console.log("The read failed: " + errorObject.code);
        //    });
        //this.fire_students_terms.on("value", (snapshot) => {
        //    this.term_list = snapshot.val();
        //    load_content();
        //}, function (errorObject) {
        //        console.log("The read failed: " + errorObject.code);
        //    });
        //this.fire_establishments.on("value", (snapshot) => {
        //    //console.log(snapshot.val());
        //    this.establishment_list = snapshot.val();
        //    load_content();
        //    //this.set_fire_students_mobilities_join(this);
        //    //this.test(this);
        //}, function (errorObject) {
        //        console.log("The read failed: " + errorObject.code);
        //    });
        //this.fire_countries.on("value", (snapshot) => {
        //    this.country_list = snapshot.val();
        //    load_content();
        //}, function (errorObject) {
        //        console.log("The read failed: " + errorObject.code);
        //    });
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
    }
//, check_if_data_loaded: function (_this) {
//    if (_this.data_loaded.mobilities && _this.data_loaded.establishments && _this.data_loaded.countries && _this.data_loaded.tags
//        && _this.data_loaded.programs) {
//        _this.setup_routing();
//    }
//},
    
    , get_mobility_value: function (column_name, mobility) {

        switch (column_name.replace(" ", "_").toLowerCase()) {
            case "term": return mobility.term_name;
            case "status": return mobility.status;
            case "affiliation": return mobility.affiliation_name;
            case "country": return mobility.country_official_name;
            case "level": return mobility.level_name;
            case "program": return mobility.program_name;
            case "sub_affiliation": return mobility.sub_affiliation_name;
            case "foreign affiliation": return mobility.foreign_affiliation_name;
            default: return "";
        }
    }


    , tenant_id_changed: function (nsad) {
        this.join_refs();
    }

    , start_setup_filter: _.after(2, function () {
        this.setup_routing();
    })
    , student_table_storage_compute: function (mobilities, establishment_list, country_list, program_list, level_list, tags, columns) {
        this.student_table_storage = {
            mobilities: mobilities
            , establishment_list: establishment_list
            , country_list: country_list
            , program_list: program_list
            , level_list: level_list
            , tags: tags
            , columns: columns
        }
        this.$.student_table_storage.save();
        return this.student_table_storage;
    }

    , student_table_storage_loaded: function () {
        if (!this.student_table_storage_computed) {
            if (this.student_table_storage && this.student_table_storage.mobilities && this.student_table_storage.mobilities.length) {// && this.mobilities.length > 0) {
                this.mobilities = this.student_table_storage.mobilities;
                this.establishment_list = this.student_table_storage.establishment_list;
                this.country_list = this.student_table_storage.country_list;
                this.program_list = this.student_table_storage.program_list;
                this.level_list = this.student_table_storage.level_list;
                this.tags = this.student_table_storage.tags;
                this.columns = this.student_table_storage.columns ? this.student_table_storage.columns : [ //redo this based on columns shown - add foreign affiliation and sub aff
                    { is_shown: true, text: 'Term' }
                    , { is_shown: true, text: 'Status' }
                    , { is_shown: true, text: 'Affiliation' }
                    , { is_shown: false, text: 'Foreign Affiliation' }
                    , { is_shown: true, text: 'Country' }
                    , { is_shown: true, text: 'Level' }
                    , { is_shown: true, text: 'Program' }
                    , { is_shown: false, text: 'Sub Affiliation' }
                ];
                this.setup_routing();
            } else if (!this.mobilities && !this.establishment_list && !this.country_list && !this.program_list && !this.level_list && !this.tags) {
                //this.student_table_storage = {
                //    mobilities: []
                //    , establishment_list: []
                //    , country_list: []
                //    , program_list: []
                //    , level_list: []
                //    , tags: []
                //};
                this.mobilities = [];
                this.establishment_list = [];
                this.country_list = [];
                this.program_list = [];
                this.level_list = [];
                this.tags = [];
                this.columns = [ //redo this based on columns shown - add foreign affiliation and sub aff
                    { is_shown: true, text: 'Term' }
                    , { is_shown: true, text: 'Status' }
                    , { is_shown: true, text: 'Affiliation' }
                    , { is_shown: false, text: 'Foreign Affiliation' }
                    , { is_shown: true, text: 'Country' }
                    , { is_shown: true, text: 'Level' }
                    , { is_shown: true, text: 'Program' }
                    , { is_shown: false, text: 'Sub Affiliation' }
                ]
                this.start_setup_filter();
            }
        }
    }
    , student_table_storage_loaded_empty: function () {
        this.start_setup_filter();
    },

    //mobility_loaded: function () {
    //    if (this.mobilities) {// && this.mobilities.length > 0) {
    //        this.data_loaded.mobilities = 1;
    //        this.check_if_data_loaded(this);
    //        //this.setup_routing();
    //    } else {
    //        this.mobilities = [];
    //        this.data_loaded.mobilities = 1;
    //        this.check_if_data_loaded(this);
    //    }
    //},
    //establishment_loaded: function () {
    //    if (this.establishment_list) {// && this.establishment_list.length > 0) {
    //        this.data_loaded.establishments = 1;
    //        this.check_if_data_loaded(this);
    //        //this.setup_routing();
    //    } else {
    //        this.establishment_list = [];
    //        this.data_loaded.tags = 1;
    //        this.check_if_data_loaded(this);
    //    }
    //},

    //country_loaded: function () {
    //    if (this.country_list) {// && this.country_list.length > 0) {
    //        this.data_loaded.countries = 1;
    //        this.check_if_data_loaded(this);
    //        //this.setup_routing();
    //    } else {
    //        this.country_list = [];
    //        this.data_loaded.countries = 1;
    //        this.check_if_data_loaded(this);
    //    }
    //},
    //program_loaded: function () {
    //    if (this.program_list) {// && this.country_list.length > 0) {
    //        this.data_loaded.programs = 1;
    //        this.check_if_data_loaded(this);
    //        //this.setup_routing();
    //    } else {
    //        this.program_list = [];
    //        this.data_loaded.programs = 1;
    //        this.check_if_data_loaded(this);
    //    }
    //},
    //tag_loaded: function () {
    //    if (this.tags) {// && this.tags.length > 0) {
    //        this.data_loaded.tags = 1;
    //        this.check_if_data_loaded(this);
    //        //this.setup_routing();
    //    } else {
    //        this.tags = [];
    //        this.data_loaded.tags = 1;
    //        this.check_if_data_loaded(this);
    //    }
    //},
    init2: function () {
        //if (this.mobilities && this.mobilities.length > 0) {
        //    this.setup_routing();
        //}
    }
//student_import_request: [],

    , filter_closed_changed: function (new_value, old_value) {
        if (new_value) {
            this.$.tags.toggle(true);
        }
    }

    , mobilities_changed: function (new_value, old_value) {
        //update page list /index.html#!/xmenu/search
        //this.page_list = _.map(new_value, (_page: any) => {
        //    if (_page.type != 'generic') {
        //        return { 'name': _page.name, 'url': '/index.html#!/' + this.restaurant_name + '/' + _page.name.replace(' ', '_'), 'type': _page.type };
        //    }
        //});
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
                //value.affiliation_name = _.result(_.find(_this.establishment_list, { '_id': value.establishment }), 'text');
                //value.sub_affiliation_name = _.result(_.find(_this.establishment_list, { '_id': value.student_establishment }), 'text');
                //value.foreign_affiliation_name = _.result(_.find(_this.establishment_list, { '_id': value.foreign_establishment }), 'text');
                value.status = value.status == 'IN' ? "In Coming" : "Out Going";
                value.affiliation_name = _this.establishment_list[value.affiliation] ? _this.establishment_list[value.affiliation].text : "";
                value.sub_affiliation_name = _this.establishment_list[value.sub_affiliation] ? _this.establishment_list[value.sub_affiliation].text : "";
                value.foreign_affiliation_name = _this.establishment_list[value.foreign_affiliation] ? _this.establishment_list[value.foreign_affiliation].text : "";
                return value;
            });
            //_this.mobilities = _.merge(ref_data, _this.establishment_list);
            //console.log(_this.mobilities);
            //_this.$.student_table_storage.save();
            //_this.filter_table(_this);

            _this.start_setup_filter();
        } else {

            _this.mobilities = _.map(_this.mobility_snapshot, function (value: any, index) {
                //value.affiliation_name = _.result(_.find(_this.establishment_list, { '_id': value.establishment }), 'text');
                //value.sub_affiliation_name = _.result(_.find(_this.establishment_list, { '_id': value.student_establishment }), 'text');
                //value.foreign_affiliation_name = _.result(_.find(_this.establishment_list, { '_id': value.foreign_establishment }), 'text');
                value.status = value.status == 'IN' ? "In Coming" : "Out Going";
                value.affiliation_name = _this.establishment_list[value.affiliation] ? _this.establishment_list[value.affiliation].text : "";
                value.sub_affiliation_name = _this.establishment_list[value.sub_affiliation] ? _this.establishment_list[value.sub_affiliation].text : "";
                value.foreign_affiliation_name = _this.establishment_list[value.foreign_affiliation] ? _this.establishment_list[value.foreign_affiliation].text : "";
                return value;
            });

            _this.start_setup_filter();
            //_this.$.mobilities_storage.save();
            //_this.$.student_table_storage.save();
            //_this.setup_routing();
        }
    },

    join_refs: function (_this) {
        _this = this;
        //var ref_data
        //this.fire_students = this.my_fire.child("Students");
        //this.fire_students_mobilities = this.my_fire.child("Mobilities");// new Firebase("https://UCosmic.firebaseio.com/Students/Mobilities")
        //var list3 = Firebase.getAsArray(this.fire_students_mobilities);

        //var list3 = Firebase.getAsArray(this.fire_students_mobilities); 

        var norm = new Firebase.util.NormalizedCollection(
            [_this.fire_students_mobilities, 'Mobilities']
        //, [_this.fire_establishments, 'Establishments', 'Mobilities.establishment']
        //, [_this.fire_establishments, 'Establishments_students', 'Mobilities.student_establishment']
        //, [_this.fire_establishments, 'Establishments_students_foreign', 'Mobilities.foreign_establishment']
            , [_this.fire_students_students, 'Students', 'Mobilities.student']
            , [_this.fire_students_levels, 'Levels', 'Mobilities.level']
            , [_this.fire_students_terms, 'Terms', 'Mobilities.term']
            , [_this.fire_countries, 'Countries', 'Mobilities.country']
            , [_this.fire_students_programs, 'Programs', 'Mobilities.program']
            );
        //norm = norm.filter(function (data, key, priority) {
        //    return data.external_id === '2345dd';
        //});
        norm.select('Mobilities.student', 'Mobilities.level', 'Mobilities.term', 'Mobilities.establishment', 'Mobilities.country', 'Mobilities.program', 'Mobilities.status'
            , 'Mobilities.foreign_affiliation', 'Mobilities.affiliation', 'Mobilities.sub_affiliation'
            , 'Students.external_id', { key: 'Levels.name', alias: 'level_name' }, 'Levels.rank', 'Terms.start_date', 'Terms.end_date', { key: 'Terms.name', alias: 'term_name' }
        //, { key: 'Establishments.establishment', alias: 'affiliation_name' }
            , { key: 'Countries.country', alias: 'country_official_name' }, { key: 'Programs.name', alias: 'program_name' }
            );
        var ref = norm.ref();

        //var norm2 = new Firebase.util.NormalizedCollection(
        //    [ref, 'Mobilities']
        //    , [_this.fire_establishments, 'Establishments_students', 'Mobilities.student_establishment']
        //    );
        //norm2.select('Mobilities.student', 'Mobilities.level', 'Mobilities.term', 'Mobilities.establishment', 'Mobilities.country', 'Mobilities.program', 'Mobilities.status'
        //    , 'Mobilities.foreign_establishment', 'Mobilities.student_establishment'
        //    , 'Mobilities.level_name', 'Mobilities.rank', 'Mobilities.start_date', 'Mobilities.end_date', 'Mobilities.term_name'
        //    , 'Mobilities.affiliation_name'
        //    , { key: 'Establishments_students.establishment', alias: 'sub_affiliation_name' }
        //    , 'Mobilities.country_official_name'
        //    );
        //var ref2 = norm2.ref();

        //var norm3 = new Firebase.util.NormalizedCollection(
        //    [ref, 'Mobilities']
        //    , [_this.fire_establishments, 'Establishments_students_foreign', 'Mobilities.foreign_establishment']
        //    );
        //norm3.select('Mobilities.student', 'Mobilities.level', 'Mobilities.term', 'Mobilities.establishment', 'Mobilities.country', 'Mobilities.program', 'Mobilities.status'
        //    , 'Mobilities.foreign_establishment', 'Mobilities.student_establishment'
        //    , 'Mobilities.level_name', 'Mobilities.rank', 'Mobilities.start_date', 'Mobilities.end_date', 'Mobilities.term_name'
        //    , 'Mobilities.affiliation_name'
        //    , 'Mobilities.sub_affiliation_name', { key: 'Establishments_students_foreign.establishment', alias: 'foreign_affiliation_name' }
        //    , 'Mobilities.country_official_name'
        //    );
        //var ref3 = norm3.ref();

        ////var norm2 = new Firebase.util.NormalizedCollection(
        ////    new Firebase("https://UCosmic.firebaseio.com/Students/Programs"),  // alias is "widgets1"
        ////    [ref, 'Mobilities', 'Programs.code']
        ////    );

        ////norm2.select('Programs.code', 'Mobilities.student', 'Mobilities.level', 'Mobilities.term', 'Mobilities.establishment', 'Mobilities.country', 'Mobilities.program', 'Mobilities.status',
        ////    'Mobilities.foreign_establishment', 'Mobilities.student_establishment', 
        ////    'Mobilities.external_id', 'Mobilities.level_name', 'Mobilities.rank', 'Mobilities.start_date', 'Mobilities.end_date', 'Mobilities.term_description',
        ////    'Mobilities.affiliation_name', 'Mobilities.country_name', 'Mobilities.program_code');
        ////var ref2 = norm.ref();
        ////var list = Firebase.getAsArray(ref2); 
        //var ref_data, ref2_data, ref3_data;


        //var load_data = _.after(3, function () {
        //    if (_this.mobilities && _this.mobilities.length > 0) {
        //        _this.mobilities = _.merge(ref_data, ref2_data, ref3_data);
        //        console.log(_this.mobilities);
        //        _this.$.mobilities_storage.save();
        //        _this.filter_table(_this);
        //    } else {
        //        _this.mobilities = _.merge(ref_data, ref2_data, ref3_data);
        //        console.log(_this.mobilities);
        //        _this.$.mobilities_storage.save();
        //        _this.setup_routing();
        //    }
        //    //_this.mobilities = _.toArray(merged);
            
        //});



        //ref3.on("value", function (snapshot) {
        //    ref3_data = _.toArray(snapshot.val());
        //    load_data();
        //}, function (errorObject) {
        //        console.log("The read failed: " + errorObject.code);
        //    });
        //ref2.on("value", function (snapshot) {
        //    //console.log(snapshot.val());
        //    ref2_data = _.toArray(snapshot.val());
        //    load_data();
        //    //setTimeout(function () {
        //    //    var list = Firebase.getAsArray(norm2.ref());
        //    //}, 1);
        //}, function (errorObject) {
        //        console.log("The read failed: " + errorObject.code);
        //    });



        var load_data = _.after(2, function (_this) {
            //_this.mobilities = _.toArray(merged);
            _this._load_mobility_data(_this)
        });


        this.fire_establishments.once("value", function (snapshot) {
            _this.establishment_list = _.map(snapshot.val(), function (value: any, index) {
                if (value) {
                    var object = { _id: index, text: value.establishment }
                    return object;
                }
            });
            load_data(_this);
        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });

        ref.orderByChild("establishment").equalTo('3306').once("value", function (snapshot) {
            //console.log(snapshot.val());
            _this.mobility_snapshot = _.toArray(snapshot.val());
            load_data(_this);
        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });
        //return (ref);
    },

    //student_import_response: function (response) {
    //    this.is_processing = false;

    //    if (!response.detail.response.error) {
    //        this.create_student_imports(response, this);

    //    } else {

    //        console.log(response.detail.response.error)
    //    }

    //},
    //ajax_error: function (response) {
    //    this.is_processing = false;

    //    if (!response.detail.response.error) {
    //        console.log(response.detail.response)
    //    } else {

    //        console.log(response.detail.response.error)
    //    }

    //},
    tags_changed: function (new_value, old_value) {
        if (old_value) {// && new_value.length != 0) {
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
        return { affiliation_tags: affiliation_tags, country_tags: country_tags, program_tags: program_tags, level_tags: level_tags }
    }
    , tags_split_union: function () {
        var _this: any = document.querySelector("#page_student_table");
        var union_tags = _.union(_this.tags_split.affiliation_tags, _this.tags_split.country_tags, _this.tags_split.program_tags, _this.tags_split.level_tags);
        if (_this.tags.length != union_tags.length) {
            _this.tags = union_tags;
            //this.$.filter_tags_storage.save(union_tags);
            //_this.$.student_table_storage.save();
        }
    }
    , filter_table: function (_this) {
        if (!_this.page || !_this.page_count) {
            page.redirect("#!/1/10/all/all/all/all/all/all/all/all/start_date/desc");
        } else {
            //_this.country = 165;
            var tags_split = this.tags_split;
            if (_this.tags && _this.tags.length > 0) {
                _this.mobilities_page = _.filter(_this.mobilities, function (mobility: any) {
                    var is_true = false;
                    if (tags_split.affiliation_tags && tags_split.affiliation_tags.length > 0) {
                        _.find(tags_split.affiliation_tags, function (tag: any) {
                            if (tag._id == mobility.affiliation) {
                                is_true = true;
                                return true;
                            }
                        });
                    } else {
                        is_true = true;
                    }
                    if (is_true) { // no reason to do this if false
                        is_true = false;
                        if (tags_split.country_tags && tags_split.country_tags.length > 0) {
                            _.find(tags_split.country_tags, function (tag: any) {
                                if (tag._id == mobility.country) {
                                    is_true = true;
                                    return true;
                                }
                            });
                        } else {
                            is_true = true;
                        }

                        if (is_true) { // no reason to do this if false
                            is_true = false;
                            if (tags_split.program_tags && tags_split.program_tags.length > 0) {
                                _.find(tags_split.program_tags, function (tag: any) {
                                    if (tag._id == mobility.program) {
                                        is_true = true;
                                        return true;
                                    }
                                });
                            } else {
                                is_true = true;
                            }

                            if (is_true) { // no reason to do this if false
                                is_true = false;
                                if (tags_split.level_tags && tags_split.level_tags.length > 0) {
                                    _.find(tags_split.level_tags, function (tag: any) {
                                        if (tag._id == mobility.level) {
                                            is_true = true;
                                            return true;
                                        }
                                    });
                                } else {
                                    is_true = true;
                                }
                            }
                        }
                    }
                    return is_true;
                });
            } else {
                _this.mobilities_page = _this.mobilities;
            }
            //_this.mobilities_page = _.filter(_this.mobilities, function (mobility: any) {
            //    var is_false = false;
            //    _.find(_this.tags, function (tag: any) {
            //        if (tag._type == 'affiliation') {
            //            if (tag._id != mobility.student_establishment) {
            //                is_false = true;
            //                return true
            //            }
            //        } else if (tag._type == 'country') {
            //            if (tag._id != mobility.country) {
            //                is_false = true;
            //                return true
            //            }
            //        }
            //    });

            //    return !is_false;
            //});
            _this.affiliation = 'all';
            _this.country = 'all';
            _this.program = 'all';
            _this.level = 'all';
            //_this.mobilities_page = _.filter(_this.mobilities, function (v: any) {
            //    if (_this.affiliation != 'all' && _this.affiliation != v.student_establishment) {
            //        return false;
            //    } else if (_this.country != 'all' && _this.country != v.country) {
            //        return false;
            //    } else if (_this.level != 'all' && _this.level != v.level) {
            //        return false;
            //    } else if (_this.status != 'all' && _this.status != v.status) {
            //        return false;
            //    } else if (_this.start_date != 'all' && _this.start_date != v.start_date) {
            //        return false;
            //    } else if (_this.end_date != 'all' && _this.end_date != v.end_date) {
            //        return false;
            //    } else {
            //        return true;
            //    }
            //});



            _this.mobilities_page = _.sortBy(_this.mobilities_page, _this.order_by);
            if (_this.asc_desc == 'asc') {
                _(_this.mobilities_page).reverse().value();
            }

            _this.mobilities_page = _.slice(_this.mobilities_page, _this.page - 1, (_this.page_count * _this.page));
            
            //var page = _this.pagination_utility().pagination();
            //page.init(_this.fire_norm, 5);


            //page.nextPage(function (val) {
            //    console.log(val);
            //    page.nextPage(function (val) {
            //        console.log(val);
            //    });
            //});
            //if(location.hash != "#!/1/10/all/all/all/all/all/all/all/all/start_date/desc"){
            //    page.redirect("#!/1/10/all/all/all/all/all/all/all/all/start_date/desc")
            //};
        }
    },

    navigate: function (ctx, next) {
        var _this: any = document.querySelector("#page_student_table");
        //var load_imports = _this.current_page_name ? false : true;
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

        var establishment_selected = _this.affiliation != 'all' && _this.establishment_list[_this.affiliation] ? _this.establishment_list[_this.affiliation].text : 'all';// id === index
        _this.$.establishment_auto_ddl.selected = '';
        if (establishment_selected != 'all') {
            _this.add_tag(establishment_selected, _this.affiliation, 'affiliation');
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
        //page('/:restaurant_id/:page_id', this.navigate);
        page('*', this.navigate);
        page({ hashbang: true });
    },

    leaveEstablishmentSearch: function (event, detail, sender) {
        setTimeout(() => {
            this.establishmentList = [];
        }, 200);
    },
    update_page: function (_this) {
        page('#!/' + _this.page + '/' + _this.page_count + '/' + _this.affiliation + '/' + _this.continent + '/' + _this.country + '/' + _this.program + '/' + _this.level + '/' + _this.status + '/' + _this.start_date + '/' + _this.end_date + '/' + _this.order_by + '/' + _this.asc_desc);
    },
    add_tag: function (text, _id, _type) {
        this.tags = _.union(this.tags, [{ text: text, _id: _id, _type: _type }]);
    },
    establishmentSelected: function (event, detail, sender) {

        this.affiliation = this.selectedEstablishmentId ? this.selectedEstablishmentId : 'all';
        var establishment_selected = this.affiliation != 'all' && this.establishment_list[this.affiliation] ? this.establishment_list[this.affiliation].text : 'all';// id === index
        this.$.establishment_auto_ddl.selected = '';
        if (establishment_selected != 'all') {
            this.add_tag(establishment_selected, this.affiliation, 'affiliation');
        }

        //first check to see if url is correct

        this.filter_table(this);
        //this.update_page(this);
    },
    establishmentListSearch: function (event, detail, sender) {
        if (this.establishmentSearch == "") {
            this.establishment_auto_list = [];
        } else {
            var list = _.filter(this.establishment_list, (value: any) => {
                if (value) {
                    return (value.text.toLowerCase().indexOf(this.establishmentSearch.toLowerCase()) > -1);
                }
            })
            this.establishment_auto_list = _.take(list, 10);
        }
    },
    countrySelected: function (event, detail, sender) {

        this.country = this.selectedCountryId ? this.selectedCountryId : 'all';
        var country_selected = this.country != 'all' ? _.result(_.find(this.country_list, { '_id': this.country }), 'text') : 'all';
        this.$.country_auto_ddl.selected = '';
        if (country_selected != 'all') {
            this.add_tag(country_selected, this.country, 'country');
        }
        this.filter_table(this);
    },
    countryListSearch: function (event, detail, sender) {
        if (this.countrySearch == "") {
            this.country_auto_list = [];
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
        }
        this.filter_table(this);
    },
    program_list_search: function (event, detail, sender) {
        if (this.program_search == "") {
            this.program_auto_list = [];
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
        }
        this.filter_table(this);
    },
    level_list_search: function (event, detail, sender) {
        if (this.level_search == "") {
            this.level_auto_list = [];
        } else {
            var list = _.filter(this.level_list, (value: any) => {
                if (value) {
                    return (value.text.toLowerCase().indexOf(this.level_search.toLowerCase()) > -1);
                }
            })
            this.level_auto_list = _.take(list, 10);
        }
    }


    , order_index_changed: function () {
        //var order: string = this.order_by_list[this.order_index].value;
        this.order_by = this.order_index.substr(0, this.order_index.indexOf('-'));
        this.order_by = this.order_by.replace(" ", "_");
        this.asc_desc = this.order_index.substr(this.order_index.indexOf('-') + 1);
        page('#!/' + this.page + '/' + this.page_count + '/' + this.affiliation + '/' + this.continent + '/' + this.country + '/' + this.program + '/' + this.level + '/' + this.status + '/' + this.start_date + '/' + this.end_date + '/' + this.order_by + '/' + this.asc_desc);
    
        //this.filter_table(this);
    }
}); 
