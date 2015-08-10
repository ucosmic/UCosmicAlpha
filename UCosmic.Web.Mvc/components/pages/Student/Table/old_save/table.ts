/// <reference path="../../../../../scripts/typings/lodash.d.ts" />
/// <reference path="../../../../typediff/mytypes.d.ts" />
/// <reference path="../../../../models/students.ts" />
/// <reference path="../../../../../scripts/typings/lodash.d.ts" />



//import Student_Table = Students 

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
            , observer: 'tags_changed'
        }
        , tags_split: {
            type: Array
            , computed: 'tags_splitter(tags)'
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
            value: [ //redo this based on columns shown - add foreign affiliation and student aff
                { value: 'start_date-desc', text: 'Most Recent First' }
                , { value: 'end_date-asc', text: 'Most Recent Last' }
                , { value: 'status-desc', text: 'In Coming First' }
                , { value: 'status-asc', text: 'Out Going First' }
                , { value: 'affiliation_name-desc', text: 'Affiliation A-Z' }
                , { value: 'affiliation_name-asc', text: 'Affiliation Z-A' }
                , { value: 'foreign_affiliation_name-desc', text: 'Foreign Affiliation A-Z' }
                , { value: 'foreign_affiliation_name-asc', text: 'Foreign Affiliation Z-A' }
                , { value: 'country_name-desc', text: 'country A-Z' }
                , { value: 'country_name-asc', text: 'country Z-A' }
                , { value: 'program_name-desc', text: 'program A-Z' }
                , { value: 'program_name-asc', text: 'program Z-A' }
                , { value: 'level_name-desc', text: 'level A-Z' }
                , { value: 'level_name-asc', text: 'level Z-A' }
                , { value: 'student_affiliation_name-desc', text: 'Student Affiliation A-Z' }
                , { value: 'student_affiliation_name-asc', text: 'Student Affiliation Z-A' }
            ]
        }
        , columns: {
            type: Array,
            notify: true,
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
    },
    //fire: null,
    //mobilities_page: [],
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
    is_routing_setup: false,
    lastEstablishmentSearch: "",
    last_selected_establishment_id: -1,
    data_loaded: { mobilities: 0, establishments: 0, countries: 0, tags: 0, programs: 0 },
    controller: null,
    created: function () {
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
    }

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
        //join_refs = function () {
        //var mobility_list = [], country_list, level_list, program_list, establishment_list, term_list, student_list;
        this.fire_students_mobilities = new Firebase("https://UCosmic.firebaseio.com/Students/Mobilities/" + new_value),
        this.fire_students_students = new Firebase("https://UCosmic.firebaseio.com/Students/Students/" + new_value),
        this.fire_students_terms = new Firebase("https://UCosmic.firebaseio.com/Students/Terms/" + new_value),
        this.fire_students_levels = new Firebase("https://UCosmic.firebaseio.com/Students/Levels/" + new_value),
        this.fire_establishments = new Firebase("https://UCosmic.firebaseio.com/Establishments/Establishments"),
        this.fire_students_programs = new Firebase("https://UCosmic.firebaseio.com/Students/Programs"),
        this.fire_countries = new Firebase("https://UCosmic.firebaseio.com/Places/Countries"),
        this.fire_students_mobilities = new Firebase("https://UCosmic.firebaseio.com/Students/Mobilities/" + new_value);

        //var all_loaded = false, temp_snapshot = [];
        //var load_data = _.after(5, function (_this2) {
        //    all_loaded = true;
        //});

        this.fire_establishments.once("value", (snapshot) => {
            this.establishment_list = _.map(snapshot.val(), function (value: any, index) {
                if (value) {
                    var object = { _id: index, text: value.establishment }
                    return object;
                }
            })
            //this.postMessage({
            //    'type': 'establishment_list'
            //    , 'value': JSON.stringify(establishment_list)
            //});
            //load_data(this);
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
            //this.postMessage({
            //    'type': 'level_list'
            //    , 'value': JSON.stringify(level_list)
            //});
            //load_data(this);
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
            //this.postMessage({
            //    'type': 'country_list'
            //    , 'value': JSON.stringify(country_list)
            //});
            //load_data(this);
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
            //this.postMessage({
            //    'type': 'program_list'
            //    , 'value': JSON.stringify(program_list)
            //});
            //load_data(this);
        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });


        this.fire_students_terms.once("value", (snapshot) => {
            this.term_list = _.map(snapshot.val(), function (value: any, index) {
                if (value) {
                    var object = { _id: index, text: value.name }
                    return object;
                }
            })
            //this.postMessage({
            //    'type': 'term_list'
            //    , 'value': JSON.stringify(term_list)
            //});
            //load_data(this);
        }, function (errorObject) {
                console.log("The read failed: " + errorObject.code);
            });
        var mobility_snapshot = []
        var counter = 0;
        //var _this2 = this;
        //function call_start_setup_filter() {
        //    this.postMessage({
        //        'type': 'mobility_list'
        //        , 'value': JSON.stringify(mobility_list)
        //    });
        //    console.log(counter++);
        //}
        //var debounce = _.throttle(call_start_setup_filter, 100, {
        //    'maxWait': 500
        //});
        this.start_setup_filter();


        //}
    }

    , start_setup_filter: _.after(2, function () {
        if (!this.is_routing_setup) {
            this.setup_routing();
        } else {
            this.filter_table(this);
        }
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
                this.columns = this.student_table_storage.columns ? this.student_table_storage.columns : [ //redo this based on columns shown - add foreign affiliation and student aff
                    { is_shown: true, text: 'Term' }
                    , { is_shown: true, text: 'Status' }
                    , { is_shown: true, text: 'Affiliation' }
                    , { is_shown: false, text: 'Foreign Affiliation' }
                    , { is_shown: true, text: 'Country' }
                    , { is_shown: true, text: 'Level' }
                    , { is_shown: true, text: 'Program' }
                    , { is_shown: false, text: 'Student Affiliation' }
                ];
                this.setup_routing();
            } else if (!this.mobilities && !this.establishment_list && !this.country_list && !this.program_list && !this.level_list && !this.tags) {
                this.mobilities = [];
                this.establishment_list = [];
                this.country_list = [];
                this.program_list = [];
                this.level_list = [];
                this.tags = [];
                this.columns = [ //redo this based on columns shown - add foreign affiliation and student aff
                    { is_shown: true, text: 'Term' }
                    , { is_shown: true, text: 'Status' }
                    , { is_shown: true, text: 'Affiliation' }
                    , { is_shown: false, text: 'Foreign Affiliation' }
                    , { is_shown: true, text: 'Country' }
                    , { is_shown: true, text: 'Level' }
                    , { is_shown: true, text: 'Program' }
                    , { is_shown: false, text: 'Student Affiliation' }
                ]
                this.start_setup_filter();
            }
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
                value.affiliation_name = _this.establishment_list[value.affiliation] ? _this.establishment_list[value.affiliation].text : "";
                value.student_affiliation_name = _this.establishment_list[value.student_affiliation] ? _this.establishment_list[value.student_affiliation].text : "";
                value.foreign_affiliation_name = _this.establishment_list[value.foreign_affiliation] ? _this.establishment_list[value.foreign_affiliation].text : "";
                return value;
            });

            _this.start_setup_filter();
        } else {

            _this.mobilities = _.map(_this.mobility_snapshot, function (value: any, index) {
                value.status = value.status == 'IN' ? "In Coming" : "Out Going";
                value.affiliation_name = _this.establishment_list[value.affiliation] ? _this.establishment_list[value.affiliation].text : "";
                value.student_affiliation_name = _this.establishment_list[value.student_affiliation] ? _this.establishment_list[value.student_affiliation].text : "";
                value.foreign_affiliation_name = _this.establishment_list[value.foreign_affiliation] ? _this.establishment_list[value.foreign_affiliation].text : "";
                return value;
            });

            _this.start_setup_filter();
        }
    },


    tags_changed: function (new_value, old_value) {
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
        return { affiliation_tags: affiliation_tags, country_tags: country_tags, program_tags: program_tags, level_tags: level_tags }
    }
    , tags_split_union: function () {
        var _this: any = document.querySelector("#page_student_table");
        var union_tags = _.union(_this.tags_split.affiliation_tags, _this.tags_split.country_tags, _this.tags_split.program_tags, _this.tags_split.level_tags);
        if (_this.tags.length != union_tags.length) {
            _this.tags = union_tags;
        }
    }

    , capitaliseFirstLetter: function (myString) {
        return myString.charAt(0).toUpperCase() + myString.slice(1);
    }
    , temp_list: []
    , process_tags_old: function (_this, tags_split, tags_split_index, fire_students_tenant_keys, fire_students_tenant_mobilities, tag_list, tag_list_index, key) {
        
        /************************ 
                
                may consider going from narrowest tag to broadest????
                .startAt((_this.page * _this.page_count) - (_this.page_count - 1)).limitToFirst(_this.page * _this.page_count)
        */
        if (tag_list.length > tag_list_index) {
            var tag_name = tag_list[tag_list_index];
            tag_name = _this.capitaliseFirstLetter(tag_name.replace('_tags', ''));
            if (tags_split[tag_list[tag_list_index]] && tags_split[tag_list[tag_list_index]].length > tags_split_index) {
                //fire_students_tenant_keys.child(tag_name).child(tags_split[tag_list[tag_list_index]][tags_split_index].text).child('Mobilities').child(key).on("child_added", function (snap) {
                //    tags_split_index++;
                //    _this.process_tags(_this, tags_split, tags_split_index,  fire_students_tenant_keys, fire_students_tenant_mobilities, tag_list, tag_list_index, snap.val());
                //});  
                _.forEach(tags_split[tag_list[tags_split_index]], function (value: any, key_2) {
                    fire_students_tenant_keys.child(tag_name).child(value.text).child('Mobilities').child(key).on("child_added", function (snap) {
                        tags_split_index++;
                        tags_split_index++;
                        _this.process_tags(_this, tags_split, tags_split_index, fire_students_tenant_keys, fire_students_tenant_mobilities, tag_list, tag_list_index, snap.val());
                    });
                });
            } else {
                //var tag_list_copy = JSON.parse(JSON.stringify(tag_list));
                //tag_list_copy.shift()
                tag_list_index++;
                _this.process_tags(_this, tags_split, tags_split_index, fire_students_tenant_keys, fire_students_tenant_mobilities, tag_list, tag_list_index, key);
            }
        } else {
            //var temp_list = _this.mobilities_page;
            fire_students_tenant_mobilities.child(key).once("value", function (snapshot) {
                var snapshot_value = snapshot.val();
                snapshot_value.key = snapshot.key();
                _this.temp_list.push(snapshot_value);
                _this.mobilities_page = JSON.parse(JSON.stringify(_this.temp_list));
 
                //_this.mobilities_page = _this.mobilities;
            }, function (errorObject) {
                    console.log("The read failed: " + errorObject.code);
                });
        }



        /* if (tags_split.affiliation_tags && tags_split.affiliation_tags.length > 0) {
             _.forEach(tags_split.affiliation_tags, function (affiliation: any, affiliation_key) {
                 fire_students_tenant_keys.child('Affiliations').child(affiliation.text).child('Mobilities').on("child_added", function (affiliations_snap) {
 
                     if (tags_split.country_tags && tags_split.country_tags.length > 0) {
                         _.forEach(tags_split.country_tags, function (country: any, country_key) {
                             fire_students_tenant_keys.child('Countries').child(country.text).child('Mobilities').child(affiliations_snap.key()).on("child_added", function (countries_snap) {
                                 //if this was the last level do this
                                 var temp_list = [];
                                 fire_students_mobilities.child(countries_snap.val()).once("value", function (snapshot) {
                                     var snapshot_value = snapshot.val();
                                     snapshot_value.key = snapshot.key();
                                     temp_list.push(snapshot_value);
                                     _this.mobilities_page = JSON.parse(JSON.stringify(temp_list));
 
                                     //_this.mobilities_page = _this.mobilities;
                                 }, function (errorObject) {
                                         console.log("The read failed: " + errorObject.code);
                                     });
                             });
                         });
                     } else {
                         //do the next level down
                         //if this was the last level do this
                         var temp_list = [];
                         fire_students_mobilities.child(affiliations_snap.key()).once("value", function (snapshot) {
                             var snapshot_value = snapshot.val();
                             snapshot_value.key = snapshot.key();
                             temp_list.push(snapshot_value);
                             _this.mobilities_page = JSON.parse(JSON.stringify(temp_list));
 
                             //_this.mobilities_page = _this.mobilities;
                         }, function (errorObject) {
                                 console.log("The read failed: " + errorObject.code);
                             });
                     }
                 });
             });
         } else {
             //do the next level down
             if (tags_split.country_tags && tags_split.country_tags.length > 0) {
                 _.forEach(tags_split.country_tags, function (country: any, country_key) {
                     fire_students_tenant_keys.child('Countries').child(country.text).child('Mobilities').on("child_added", function (countries_snap) {
                         //if this was the last level do this
                         var temp_list = [];
                         fire_students_mobilities.child(countries_snap.key()).once("value", function (snapshot) {
                             var snapshot_value = snapshot.val();
                             snapshot_value.key = snapshot.key();
                             temp_list.push(snapshot_value);
                             _this.mobilities_page = JSON.parse(JSON.stringify(temp_list));
 
                             //_this.mobilities_page = _this.mobilities;
                         }, function (errorObject) {
                                 console.log("The read failed: " + errorObject.code);
                             });
                     });
                 });
             } else {
                 //do the next level down
             }
         }
         */
    }


    , row_count: 0
    , table_processing_complete: false

    , process_tags: function (_this, tags_split, fire_students_tenant_keys, fire_students_tenant_mobilities, tag_list, tag_list_index, key) {
            
        
        /************************ 
                
                may consider going from narrowest tag to broadest????
                .startAt((_this.page * _this.page_count) - (_this.page_count - 1)).limitToFirst(_this.page * _this.page_count)
        */
        if (_this.table_processing_complete == false){
            var start_at_row = (_this.page * _this.page_count) - (_this.page_count - 1);
            var end_at_row = _this.page * _this.page_count;
            if (tag_list.length > tag_list_index) {
                var tag_name = tag_list[tag_list_index];
                tag_name = _this.capitaliseFirstLetter(tag_name.replace('_tags', ''));
                if (tags_split[tag_list[tag_list_index]] && tag_list.length > tag_list_index) {
                    //if (tags_split[tag_list[tag_list_index]] && tags_split[tag_list[tag_list_index]].length > tag_list_index) {
                    _.forEach(tags_split[tag_list[tag_list_index]], function (value: any, key_2) {
                        fire_students_tenant_keys.child(tag_name).child(value.text.replace(".", " ").replace("/", " ")).child('Mobilities').child(key).on("child_added", function (snap) {
                            tag_list_index++;
                            //tags_split_index++;
                            var row_count = _this.row_count == 0 ? 1 : _this.row_count;
                            if (row_count  >= start_at_row && _this.row_count <= end_at_row) {
                                _this.process_tags(_this, tags_split, fire_students_tenant_keys, fire_students_tenant_mobilities, tag_list, tag_list_index, snap.val());
                            }
                        });
                    });
                } else {
                    //var tag_list_copy = JSON.parse(JSON.stringify(tag_list));
                    //tag_list_copy.shift()
                    //tag_list_index++;
                    _this.process_tags(_this, tags_split, fire_students_tenant_keys, fire_students_tenant_mobilities, tag_list, tag_list_index, key);
                }
            } else {
                //var temp_list = _this.mobilities_page;
                _this.row_count++;
                if (_this.row_count >= start_at_row && _this.row_count <= end_at_row) {
                    fire_students_tenant_mobilities.child(key).once("value", function (snapshot) {
                        var snapshot_value = snapshot.val();
                        snapshot_value.key = snapshot.key();
                        _this.temp_list.push(snapshot_value);
                        _this.mobilities_page = JSON.parse(JSON.stringify(_this.temp_list));
 
                        //_this.mobilities_page = _this.mobilities;
                    }, function (errorObject) {
                            console.log("The read failed: " + errorObject.code);
                        });
                } else if (_this.row_count > end_at_row) {
                    _this.table_processing_complete = true;
                }

            }
        }
        


    }


    , filter_table: function (_this) {

        if (!_this.page || !_this.page_count) {
            page.redirect("#!/1/10/all/all/all/all/all/all/all/all/start_date/desc");
        } else {
            var tags_split = this.tags_split, mobility_id_list = [], temp_list = [];
            if (_this.tags && _this.tags.length > 0) {

                var fire_students_tenant_keys = new Firebase("https://UCosmic.firebaseio.com/Students/" + this.tenant_id + '/Keys')
                var fire_students_tenant_mobilities = new Firebase("https://UCosmic.firebaseio.com/Students/" + this.tenant_id + '/Mobilities')
                var tag_list = [];
                _.forEach(tags_split, function (value: any, index: any) {
                    if (value.length > 0) {
                        tag_list.push(index);
                    }
                });
                //_.remove(tag_list, function (value) {
                //    return value == _this.order_by + '_tags';
                //});
                //tag_list.unshift(_this.order_by + '_tags');
                //var tag_list = _.map(_.filter(tags_split, function (value: any) {
                //    if (value.length > 0) {
                //        return true;
                //    }
                //}), function (value: any, index) {
                //        return value.type;
                //    });
                _this.temp_list = [];
                _this.row_count = 0;
                _this.table_processing_complete = false;
                fire_students_tenant_keys.child(_this.capitaliseFirstLetter(_this.order_by)).orderByKey().on("child_added", function (snap) {
                    if (snap.val().Mobilities) {
                        var mobilities_array = _.toArray(snap.val().Mobilities);
                        if (mobilities_array.length > 0) {
                            _.forEach(snap.val().Mobilities, function (value, index) {
                                _this.process_tags(_this, tags_split, fire_students_tenant_keys, fire_students_tenant_mobilities, tag_list, 0, index);
                            });
                        }
                    }
                });


            } else {
                this.fire_students_mobilities.on("child_added", function (snapshot) {
                    var snapshot_value = snapshot.val();
                    snapshot_value.key = snapshot.key();
                    temp_list.push(snapshot_value);
                    _this.mobilities_page = JSON.parse(JSON.stringify(temp_list));
                    //_this.mobilities_page = _this.mobilities;
                }, function (errorObject) {
                        console.log("The read failed: " + errorObject.code);
                    });
            }
            _this.affiliation = 'all';
            _this.country = 'all';
            _this.program = 'all';
            _this.level = 'all';



            //_this.mobilities_page = _.sortBy(_this.mobilities_page, _this.order_by);
            //if (_this.asc_desc == 'asc') {
            //    _(_this.mobilities_page).reverse().value();
            //}

            //_this.mobilities_page = _.slice(_this.mobilities_page, _this.page - 1, (_this.page_count * _this.page));
        }

    }

    , filter_table_old: function (_this) {
        if (!_this.page || !_this.page_count) {
            page.redirect("#!/1/10/all/all/all/all/all/all/all/all/start_date/desc");
        } else {
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
            _this.affiliation = 'all';
            _this.country = 'all';
            _this.program = 'all';
            _this.level = 'all';



            _this.mobilities_page = _.sortBy(_this.mobilities_page, _this.order_by);
            if (_this.asc_desc == 'asc') {
                _(_this.mobilities_page).reverse().value();
            }

            _this.mobilities_page = _.slice(_this.mobilities_page, _this.page - 1, (_this.page_count * _this.page));

        }
    },

    navigate: function (ctx, next) {
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
        page('*', this.navigate);
        page({ hashbang: true });
        this.is_routing_setup = true;
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

        //this.filter_table(this);
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
        //this.filter_table(this);
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
        //this.filter_table(this);
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
        //this.filter_table(this);
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
        this.order_by = this.order_index.substr(0, this.order_index.indexOf('-'));
        this.order_by = this.order_by.replace(" ", "_");
        this.asc_desc = this.order_index.substr(this.order_index.indexOf('-') + 1);
        page('#!/' + this.page + '/' + this.page_count + '/' + this.affiliation + '/' + this.continent + '/' + this.country + '/' + this.program + '/' + this.level + '/' + this.status + '/' + this.start_date + '/' + this.end_date + '/' + this.order_by + '/' + this.asc_desc);

    }
}); 
