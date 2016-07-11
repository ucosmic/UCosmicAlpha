riot.tag2('student_map', '<div class="layout horizontal start center-justified"> <div class="layout vertical start center-justified"> <header> <h1>Student Engagement Snapshot</h1> </header> <div style="margin: 0 0 16px; height: 30px; font-size: 20px;"> <strong style="font-size: 1.2em;"> {total_student_count} </strong> students {direction == \'all\' ? \'representing\' : direction == \'in\' ? \'from\' : \'in\'} <strong style="font-size: 24px;"> {total_location_count} </strong> locations. </div> <div class="layout horizontal start self-stretch"> <div show="{!country_selected}" style="font-size: 16px; margin-bottom: 20px; padding: 5px 0;"> Click a location for more information. </div> <div show="{country_selected}" style="font-size: 16px; margin-bottom: 20px; " class="layout horizontal center"> <strong style="font-size: 1.2em; margin-right: 5px;"> {country_selected_student_count} </strong> students {direction == \'all\' ? \'representing\' : direction == \'in\' ? \'from\' : \'in\'} <div style="border-radius: 5px; background-color: #ddd; padding: 5px; margin: 0 5px;" class="layout horizontal"> <strong style="font-size: 1em;">{country_selected}</strong> <div style="cursor: pointer;" onclick="{remove_country}"> <div id="remove_country_button" style="cursor: pointer;"> <svg viewbox="0 0 24 24" preserveaspectratio="xMidYMid meet" style="pointer-events: none; display: inline-block; width: 1em; height: 1em;fill:black; "> <g> <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"> </path> </g> </svg> </div> </div> </div> </div> <div class="flex"></div> <div style="height: 0;width:0;"> <div class="layout horizontal center" style="display: inline-block; position: relative; right: 190px; top: 55px; z-index: 2; border: solid black 1px; width:170px; padding: 5px;"> <div class="layout horizontal center"> <div style="text-align: center;"> <span riot-style="{direction == \'all\' ? \'font-weight: bolder\' : \'\'}; cursor:pointer;" onclick="{change_direction}" data-direction="all">All</span> </div> <div class="flex"></div> <div style="text-align: center;border-right: 1px solid black;border-left: 1px solid black; padding: 0 5px;"> <span riot-style="{direction == \'out\' ? \'font-weight: bolder\' : \'\'}; cursor:pointer;" onclick="{change_direction}" data-direction="out">Outbound</span> </div> <div class="flex"></div> <div style="text-align: center"> <span riot-style="{direction == \'in\' ? \'font-weight: bolder\' : \'\'}; cursor:pointer;" onclick="{change_direction}" data-direction="in">Inbound</span> </div> </div> </div> </div> </div> <div id="regions_div" style="width: 700px; height: 500px;"></div> </div> <div class="layout vertical end center-justified"> <side_bar_filter id="side_bar_filter" style="width: 300px; "> <drop_down id="sub_affiliations_level_1_ddl" list="{parent.sub_affiliations_level_1}" max_width="240px" max_height="300px" pre_scale_class="pre_scale_top_center" title="sub-affiliation" background_color="white" selected_callback="{parent.sub_affiliations_level_1_selected}" selected_item_id="{parent.sub_affiliations_level_1_id}" scale_type="scale_height" direction="ltr"> </drop_down> <drop_down show="{parent.sub_affiliations_level_1_id}" max_width="240px" max_height="300px" id="sub_affiliations_level_2_ddl" list="{parent.sub_affiliations_level_2}" pre_scale_class="pre_scale_top_center" title="sub-affiliation" background_color="white" selected_callback="{parent.sub_affiliations_level_2_selected}" selected_item_id="{parent.sub_affiliations_level_2_id}" scale_type="scale_height" direction="ltr"> </drop_down> <drop_down show="{parent.sub_affiliations_level_1_id && parent.sub_affiliations_level_2_id}" max_width="240px" max_height="300px" id="sub_affiliations_level_3_ddl" list="{parent.sub_affiliations_level_3}" pre_scale_class="pre_scale_top_center" title="sub-affiliation" background_color="white" selected_callback="{parent.sub_affiliations_level_3_selected}" selected_item_id="{parent.sub_affiliations_level_3_id}" scale_type="scale_height" direction="ltr"> </drop_down> </side_bar_filter> <div show="{total_student_count}" id="bar_chart" style="width: 300px; "></div> <div show="{total_student_count}" id="line_chart" style="width: 300px; "></div> </div> </div>', '#remove_country_button { height: 1em; width: 1em; outline: none; border-radius: 50%; border: 1px solid black; margin-left: 5px; opacity: .8; transition: opacity .25s ease-in-out; -moz-transition: opacity .25s ease-in-out; -webkit-transition: opacity .25s ease-in-out; } drop_down { margin: 10px 0; }', '', function(opts) {
var self = this;
self.direction = 'all';
self.sub_affiliations_level_1 = [];
self.sub_affiliations_level_2 = [];
self.sub_affiliations_level_1_id = null;
self.countries_data_all = [];

var config = {
    apiKey: "AIzaSyBpzIaweLPBcKOodY8JdxDlwARwbcEvhc4",
    authDomain: "ucosmic.firebaseapp.com",
    databaseURL: "https://ucosmic.firebaseio.com",
    storageBucket: "project-4691094245668174778.appspot.com"
};
firebase.initializeApp(config);
self.root_ref = firebase.database().ref();

self.change_direction = function (event, is_direction_set) {
    self.direction = is_direction_set ? self.direction : event.target.dataset.direction;
    var map_data = [];
    self.term_data_all = JSON.parse(JSON.stringify(self.term_data_all_original));
    function are_equal_2(g1, g2) {
        return g1.id === g2.id;
    }

    function are_equal(g1, g2) {
        return g1[0] === g2[0];
    }

    if (self.direction === 'all') {
        if (self.selected_sub_affiliation != parseInt(self.opts.tenant_id)) {
            self.term_data = [];
            self.term_data_all["in"].forEach(function (term) {
                var count = 0;
                term.countries = term.countries.map(function (country) {
                    country.affiliations = country.affiliations.filter(function (affiliation) {
                        return self.selected_sub_affiliation_ancestors.find(function (ancestor) {
                            return parseInt(affiliation) == ancestor;
                        });
                    });
                    count += country.affiliations.length;
                    country.count = country.affiliations.length;
                    return country;
                });
                term.countries = term.countries.filter(function (country) {
                    return country.count > 0;
                });
                term.count = count;
                var countries = term.countries.map(function (country) {
                    return [country.country_id ? self.countries[country.country_id].country : 'none', country.count];
                });
                map_data = array_union_concat_2(map_data, countries, are_equal);
            });
            self.term_data_all.out.forEach(function (term) {
                var count = 0;
                term.countries = term.countries.map(function (country) {
                    country.affiliations = country.affiliations.filter(function (affiliation) {
                        return self.selected_sub_affiliation_ancestors.find(function (ancestor) {
                            return parseInt(affiliation) == ancestor;
                        });
                    });
                    count += country.affiliations.length;
                    country.count = country.affiliations.length;
                    return country;
                });
                term.countries = term.countries.filter(function (country) {
                    return country.count > 0;
                });
                term.count = count;

                var countries = term.countries.map(function (country) {
                    return [country.country_id ? self.countries[country.country_id].country : 'none', country.count];
                });
                map_data = array_union_concat_2(map_data, countries, are_equal);
            });
            self.term_data_all_union = array_union_concat(self.term_data_all["in"], self.term_data_all.out, are_equal_2);
            self.term_data = self.term_data_all_union.map(function (term) {
                return [term.id, term.count];
            });
            self.total_student_count = get_total_student_count(self.term_data_all, self.direction);

            map_data.splice(0, 0, ['Country', 'Students']);
            self.total_location_count = map_data.length - 1;
        } else {
                self.term_data_all_union = array_union_concat(self.term_data_all["in"], self.term_data_all.out, are_equal_2);
                self.term_data = self.term_data_all_union.map(function (term) {
                    return [term.id, term.count];
                });
                self.total_student_count = get_total_student_count(self.term_data_all, self.direction);
                self.total_location_count = self.map_data.length - 1;
                map_data = self.map_data;
            }
    } else if (self.direction === 'in') {
        if (self.selected_sub_affiliation != parseInt(self.opts.tenant_id)) {
            self.term_data = [];
            self.term_data_all["in"].forEach(function (term) {
                var count = 0;
                term.countries = term.countries.map(function (country) {
                    country.affiliations = country.affiliations.filter(function (affiliation) {
                        return self.selected_sub_affiliation_ancestors.find(function (ancestor) {
                            return parseInt(affiliation) == ancestor;
                        });
                    });
                    count += country.affiliations.length;
                    country.count = country.affiliations.length;
                    return country;
                });
                term.countries = term.countries.filter(function (country) {
                    return country.count > 0;
                });
                term.count = count;
                var countries = term.countries.map(function (country) {
                    return [country.country_id ? self.countries[country.country_id].country : 'none', country.count];
                });
                map_data = array_union_concat_2(map_data, countries, are_equal);
            });
            self.term_data_all_union = array_union_concat(self.term_data_all["in"], self.term_data_all.out, are_equal_2);

            self.term_data = self.term_data_all["in"].map(function (term) {
                return [term.id, term.count];
            });
            self.total_student_count = get_total_student_count(self.term_data_all, self.direction);

            map_data.splice(0, 0, ['Country', 'Students']);
            self.total_location_count = map_data.length - 1;
        } else {
            (function () {
                var are_equal = function are_equal(g1, g2) {
                    return g1[0] === g2[0];
                };

                self.term_data = self.term_data_all["in"].map(function (term) {
                    return [term.id, term.count];
                });
                self.term_data_all["in"].forEach(function (term) {
                    var countries = term.countries.map(function (country) {
                        return [country.country_id ? self.countries[country.country_id].country : 'none', country.count];
                    });
                    map_data = array_union_concat_2(map_data, countries, are_equal);
                });
                self.total_location_count = map_data.length;
                self.total_student_count = get_total_student_count(self.term_data_all, self.direction);
                map_data.splice(0, 0, ['Country', 'Students']);
            })();
        }
    } else {

        if (self.selected_sub_affiliation != parseInt(self.opts.tenant_id)) {
            self.term_data = [];
            self.term_data_all.out.forEach(function (term) {
                var count = 0;
                term.countries = term.countries.map(function (country) {
                    country.affiliations = country.affiliations.filter(function (affiliation) {
                        return self.selected_sub_affiliation_ancestors.find(function (ancestor) {
                            return parseInt(affiliation) == ancestor;
                        });
                    });
                    count += country.affiliations.length;
                    country.count = country.affiliations.length;
                    return country;
                });
                term.countries = term.countries.filter(function (country) {
                    return country.count > 0;
                });
                term.count = count;
                var countries = term.countries.map(function (country) {
                    return [country.country_id ? self.countries[country.country_id].country : 'none', country.count];
                });
                map_data = array_union_concat_2(map_data, countries, are_equal);
            });
            self.term_data_all_union = array_union_concat(self.term_data_all["in"], self.term_data_all.out, are_equal_2);

            self.term_data = self.term_data_all.out.map(function (term) {
                return [term.id, term.count];
            });
            self.total_student_count = get_total_student_count(self.term_data_all, self.direction);

            map_data.splice(0, 0, ['Country', 'Students']);
            self.total_location_count = map_data.length - 1;
        } else {
            (function () {
                var are_equal = function are_equal(g1, g2) {
                    return g1[0] === g2[0];
                };

                self.term_data = self.term_data_all.out.map(function (term) {
                    return [term.id, term.count];
                });
                self.term_data_all.out.forEach(function (term) {
                    var countries = term.countries.map(function (country) {
                        return [country.country_id ? self.countries[country.country_id].country : 'none', country.count];
                    });
                    map_data = array_union_concat_2(map_data, countries, are_equal);
                });
                self.total_location_count = map_data.length;
                self.total_student_count = get_total_student_count(self.term_data_all, self.direction);
                map_data.splice(0, 0, ['Country', 'Students']);
            })();
        }
    }

    if (self.country_selected_index) {
        var map = new google.visualization.GeoChart(self.regions_div);
        var country_selected_student_count = map_data.find(function (country) {
            return country[0] == self.country_selected;
        });
        self.country_selected_student_count = country_selected_student_count ? country_selected_student_count[1] : 0;
        setup_map_clicked(map_data, map, self.map_options);
    } else {
        setup_map_bar(map_data);
        self.term_data.splice(0, 0, ['Term', 'Students']);
        setup_year_chart(self.term_data);
    }

    self.update();
};

function get_firebase_paths(paths, callback) {
    var new_paths = [],
        counter = 0;
    paths.forEach(function (path) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function (response) {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                if (xmlHttp.responseText) {
                    Object.keys(JSON.parse(xmlHttp.responseText)).forEach(function (key) {
                        new_paths.push(path + '/' + key);
                    });
                    counter += 1;
                    if (counter === paths.length) {
                        callback(new_paths);
                    }
                } else {}
            }
        };
        xmlHttp.open("GET", path + ".json?shallow=true&print=pretty", true);
        xmlHttp.send();
    });
}

function array_union(arr1, arr2, equalityFunc) {
    arr1 = JSON.parse(JSON.stringify(arr1));
    arr2 = JSON.parse(JSON.stringify(arr2));
    var union = arr1.concat(arr2);

    for (var i = 0; i < union.length; i++) {
        for (var j = i + 1; j < union.length; j++) {
            if (equalityFunc(union[i], union[j])) {
                union.splice(j, 1);
                j--;
            }
        }
    }

    return union;
}

function array_union_concat(arr1, arr2, equalityFunc) {
    arr1 = JSON.parse(JSON.stringify(arr1));
    arr2 = JSON.parse(JSON.stringify(arr2));
    var union = arr1.concat(arr2);

    for (var i = 0; i < union.length; i++) {
        for (var j = i + 1; j < union.length; j++) {
            if (equalityFunc(union[i], union[j])) {
                union[i].count += union[j].count;
                union[i].affiliations = union[i].affiliations.concat(union[j].affiliations);
                union[i].countries = union[i].countries.map(function (country) {
                    var country_2 = union[j].countries.find(function (country_found) {
                        return country_found.country_id == country.country_id;
                    });
                    country.count += country_2 ? country_2.count : 0;
                    country.affiliations = country.affiliations.concat(country_2 && country_2.affiliations ? country_2.affiliations : []);
                    return country;
                });
                union.splice(j, 1);
                j--;
            }
        }
    }

    return union;
}

function array_union_concat_2(arr1, arr2, equalityFunc) {
    arr1 = JSON.parse(JSON.stringify(arr1));
    arr2 = JSON.parse(JSON.stringify(arr2));
    var union = arr1.concat(arr2);

    for (var i = 0; i < union.length; i++) {
        for (var j = i + 1; j < union.length; j++) {
            if (equalityFunc(union[i], union[j])) {
                union[i][1] += union[j][1];

                union.splice(j, 1);
                j--;
            }
        }
    }

    return union;
}

self.remove_country = function () {
    self.country_selected = '';
    self.country_selected_index = 0;
    self.update();
    self.change_direction(null, true);
};

var setup_year_chart = function setup_year_chart(data) {

    var students_year_chart = [];
    students_year_chart[0] = data[0];

    self.terms.forEach(function (term) {
        var temp_term = data.find(function (value) {
            return value[0] == term;
        });

        if (temp_term) {
            students_year_chart.push(temp_term);
        }
    });
    data = students_year_chart;

    google.charts.setOnLoadCallback(init_charts);

    function init_charts() {

        var line_data = google.visualization.arrayToDataTable(data);
        var line_options = { colors: ['#006747'] };
        var line_chart = new google.visualization.LineChart(self.line_chart);
        line_chart.draw(line_data, line_options);
    }
};

var setup_map_clicked = function setup_map_clicked(data, map, map_options) {
    var map_data = google.visualization.arrayToDataTable(data);
    self.update();
    map.draw(map_data, map_options);

    google.visualization.events.addListener(map, 'regionClick', function (e) {
        self.map_options = {
            region: e.region,
            backgroundColor: '#ACCCFD'
        };
    });
    google.visualization.events.addListener(map, 'select', function (e) {
        if (map.getSelection() && map.getSelection().length) {
            self.country_selected_index = map.getSelection()[0].row;
            self.country_selected = data[self.country_selected_index + 1][0];
            self.country_selected_student_count = data[self.country_selected_index + 1][1];
            setup_map_clicked(data, map, self.map_options);
        }
    });
    if (self.direction === 'all') {
        var are_terms_equal = function are_terms_equal(g1, g2) {
            return g1.id === g2.id;
        };

        self.term_data_all_union = array_union(self.term_data_all["in"], self.term_data_all.out, are_terms_equal);
        self.term_data = self.term_data_all_union.map(function (term) {
            var my_country = term.countries.find(function (country) {
                return self.countries[country.country_id].country == self.country_selected;
            });
            return [term.id, my_country ? my_country.count : 0];
        });
    } else if (self.direction === 'in') {
        self.term_data = self.term_data_all["in"].map(function (term) {
            var my_country = term.countries.find(function (country) {
                return self.countries[country.country_id].country == self.country_selected;
            });
            return [term.id, my_country ? my_country.count : 0];
        });
    } else {
        self.term_data = self.term_data_all.out.map(function (term) {
            var my_country = term.countries.find(function (country) {
                return self.countries[country.country_id].country == self.country_selected;
            });
            return [term.id, my_country ? my_country.count : 0];
        });
    }
    self.term_data.splice(0, 0, ['Term', 'Students']);
    setup_year_chart(self.term_data);
};

var setup_map_bar = function setup_map_bar(data) {
    google.charts.setOnLoadCallback(init_charts);

    function init_charts() {

        var map_data = google.visualization.arrayToDataTable(data);
        var bar_data_pre = [];
        data.forEach(function (country_and_count, index) {
            if (index > 0) {
                (function () {
                    var add_in_at = bar_data_pre.length;
                    bar_data_pre.forEach(function (country_and_count_2, index) {
                        add_in_at = country_and_count[1] > country_and_count_2[1] ? add_in_at > index && add_in_at !== 0 ? index : add_in_at : 10;
                    });
                    if (add_in_at < 5) {
                        bar_data_pre.splice(add_in_at, 0, country_and_count);
                        if (bar_data_pre.length > 5) {
                            bar_data_pre.pop();
                        }
                    }
                })();
            }
        });
        bar_data_pre.splice(0, 0, ['Country', 'Students']);
        var bar_data = google.visualization.arrayToDataTable(bar_data_pre);

        var map_options = {
            backgroundColor: '#ACCCFD'
        };
        var bar_options = { colors: ['#006747'] };
        var map = new google.visualization.GeoChart(self.regions_div);
        map.draw(map_data, map_options);

        google.visualization.events.addListener(map, 'regionClick', function (e) {
            self.map_options = {
                region: e.region,
                backgroundColor: '#ACCCFD'
            };
        });
        google.visualization.events.addListener(map, 'select', function (e) {
            if (map.getSelection() && map.getSelection().length) {
                self.country_selected_index = map.getSelection()[0].row;
                self.country_selected = data[self.country_selected_index + 1][0];
                self.country_selected_student_count = data[self.country_selected_index + 1][1];
                setup_map_clicked(data, map, self.map_options);
            }
        });

        var bar_chart = new google.visualization.ColumnChart(self.bar_chart);
        bar_chart.draw(bar_data, bar_options);
    }
};
self.count_data = [];
self.count_indexes = [];
self.map_data = [['Country', 'Students']];
self.term_data = [['Term', 'Students']];
self.term_data_all = { "in": [], out: [] };
self.total_location_count = 0;
self.total_student_count = 0;
self.countries;

var get_total_student_count = function get_total_student_count(term_data_all, direction) {
    var count = 0;
    if (direction === 'all') {
        term_data_all["in"].forEach(function (term) {
            count += term.count;
        });
        term_data_all.out.forEach(function (term) {
            count += term.count;
        });
    } else if (direction === 'in') {
        term_data_all["in"].forEach(function (term) {
            count += term.count;
        });
    } else {
        term_data_all.out.forEach(function (term) {
            count += term.count;
        });
    }
    return count;
};

var onlyUnique = function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
};

self.sub_affiliations_level_1_selected = function (affiliation_id) {
    var indexes = [];
    self.sub_affiliations_level_1_id = affiliation_id;
    self.selected_sub_affiliation = self.sub_affiliations_level_1[affiliation_id]._id;
    self.sub_affiliations_level_1_tenant_id = self.selected_sub_affiliation;
    if (self.selected_sub_affiliation) {
        self.selected_sub_affiliation_ancestors = [];
        self.selected_sub_affiliation_ancestors_level_1 = [];

        var sub_affiliations_ancestors = JSON.parse(JSON.stringify(self.sub_affiliations_ancestors));
        self.sub_affiliations_level_2 = sub_affiliations_ancestors.filter(function (affiliation, index) {
            if (affiliation && affiliation.ancestors.find(function (ancestor) {
                if (ancestor == parseInt(self.selected_sub_affiliation)) {
                    return true;
                } else {
                    return false;
                }
            })) {
                return_true = affiliation.ancestors.length == 2;

                affiliation.ancestors.pop();

                affiliation.ancestors.pop();

                affiliation.ancestors ? self.selected_sub_affiliation_ancestors_level_1 = self.selected_sub_affiliation_ancestors_level_1.concat(affiliation.ancestors) : null;

                if (return_true) {
                    indexes.push(index);
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }).map(function (ancestor, index) {
            ancestor._id = parseInt(indexes[index]);
            ancestor.title = self.sub_affiliations[ancestor._id].establishment;
            return ancestor;
        });
        self.sub_affiliations_level_2.push(self.selected_sub_affiliation);
        self.selected_sub_affiliation_ancestors_level_1.push(self.selected_sub_affiliation);
        self.selected_sub_affiliation_ancestors_level_1 = self.selected_sub_affiliation_ancestors_level_1.filter(onlyUnique);
        self.selected_sub_affiliation_ancestors = self.selected_sub_affiliation_ancestors_level_1;
    } else {
        self.sub_affiliations_level_2_id = 0;
        self.sub_affiliations_level_2 = [];
        self.sub_affiliations_level_3_id = 0;
        self.sub_affiliations_level_3 = [];
        self.selected_sub_affiliation = self.opts.tenant_id;
        self.selected_sub_affiliation_ancestors = [];
        self.selected_sub_affiliation_ancestors_level_1 = [];
    }

    self.sub_affiliations_level_2.splice(0, 1, { title: '[All sub-affiliation]', _id: 0 });
    self.change_direction(null, true);
    self.update();
};

self.sub_affiliations_level_2_selected = function (affiliation_id) {
    var indexes = [];
    self.sub_affiliations_level_2_id = affiliation_id;
    self.selected_sub_affiliation = self.sub_affiliations_level_2[affiliation_id]._id;
    self.sub_affiliations_level_2_tenant_id = self.selected_sub_affiliation;
    if (self.selected_sub_affiliation) {
        self.selected_sub_affiliation_ancestors = [];
        self.selected_sub_affiliation_ancestors_level_2 = [];
        var sub_affiliations_ancestors = JSON.parse(JSON.stringify(self.sub_affiliations_ancestors));
        self.sub_affiliations_level_3 = sub_affiliations_ancestors.filter(function (affiliation, index) {
            if (affiliation && affiliation.ancestors.find(function (ancestor) {
                if (ancestor == parseInt(self.selected_sub_affiliation)) {
                    return true;
                } else {
                    return false;
                }
            })) {

                return_true = affiliation.ancestors.length == 3;
                affiliation.ancestors.pop();
                affiliation.ancestors.pop();
                affiliation.ancestors ? self.selected_sub_affiliation_ancestors_level_2 = self.selected_sub_affiliation_ancestors_level_2.concat(affiliation.ancestors) : null;

                if (return_true) {
                    indexes.push(index);
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }).map(function (ancestor, index) {
            ancestor._id = parseInt(indexes[index]);
            ancestor.title = self.sub_affiliations[ancestor._id].establishment;
            return ancestor;
        });
        self.sub_affiliations_level_3.push(self.selected_sub_affiliation);
        self.selected_sub_affiliation_ancestors_level_2.push(self.selected_sub_affiliation);
        self.selected_sub_affiliation_ancestors_level_2 = self.selected_sub_affiliation_ancestors_level_2.filter(onlyUnique);
        self.selected_sub_affiliation_ancestors = self.selected_sub_affiliation_ancestors_level_2;
    } else {
        self.sub_affiliations_level_3_id = 0;
        self.sub_affiliations_level_3 = [];
        self.selected_sub_affiliation = self.sub_affiliations_level_1_tenant_id;

        self.selected_sub_affiliation_ancestors = self.selected_sub_affiliation_ancestors_level_1;
        self.selected_sub_affiliation_ancestors_level_2 = [];
    }
    self.sub_affiliations_level_3.splice(0, 2, { title: '[All sub-affiliation]', _id: 0 });
    self.change_direction(null, true);
    self.update();
};

self.sub_affiliations_level_3_selected = function (affiliation_id) {
    var indexes = [];
    self.sub_affiliations_level_3_id = affiliation_id;
    self.selected_sub_affiliation = self.sub_affiliations_level_3[affiliation_id]._id;
    self.sub_affiliations_level_3_tenant_id = self.selected_sub_affiliation;
    if (self.selected_sub_affiliation) {
        self.selected_sub_affiliation_ancestors = [];
        self.selected_sub_affiliation_ancestors_level_3 = [];
        var sub_affiliations_ancestors = JSON.parse(JSON.stringify(self.sub_affiliations_ancestors));
        sub_affiliations_ancestors.forEach(function (affiliation, index) {
            if (affiliation && affiliation.ancestors.find(function (ancestor) {
                if (ancestor == parseInt(self.selected_sub_affiliation)) {
                    return true;
                } else {
                    return false;
                }
            })) {

                affiliation.ancestors.pop();
                affiliation.ancestors.pop();
                affiliation.ancestors ? self.selected_sub_affiliation_ancestors_level_3 = self.selected_sub_affiliation_ancestors_level_3.concat(affiliation.ancestors) : null;
            }
        });

        self.selected_sub_affiliation_ancestors_level_3.push(self.selected_sub_affiliation);
        self.selected_sub_affiliation_ancestors_level_3 = self.selected_sub_affiliation_ancestors_level_3.filter(onlyUnique);
        self.selected_sub_affiliation_ancestors = self.selected_sub_affiliation_ancestors_level_3;
    } else {
        self.selected_sub_affiliation = self.sub_affiliations_level_2_tenant_id;
        self.selected_sub_affiliation_ancestors = self.selected_sub_affiliation_ancestors_level_2;
        self.selected_sub_affiliation_ancestors_level_3 = [];
    }
    self.change_direction(null, true);
    self.update();
};
self.sub_affiliations_level_3_selected_old = function (affiliation_id) {
    var indexes = [];
    self.sub_affiliations_level_3_id = affiliation_id;

    self.selected_sub_affiliation = self.sub_affiliations_level_3[affiliation_id]._id;
    self.selected_sub_affiliation = self.selected_sub_affiliation ? self.selected_sub_affiliation : self.sub_affiliations_level_2_tenant_id;
    self.update();
};

self.on('mount', function () {

    self.selected_sub_affiliation = self.opts.tenant_id;
    google.charts.load('current', { 'packages': ['corechart', 'geochart', 'bar', 'line'] });

    var fire_ref_countries = self.root_ref.child('Places').child('Countries');
    fire_ref_countries.on("value", function (snapshot) {
        self.countries = snapshot.val();
    });

    var data_list_stream = Kefir.sequentially(0, [{ tenant_id: self.opts.tenant_id, direction: 'out' }, { tenant_id: self.opts.tenant_id, direction: 'in' }]);

    var fire_stream = data_list_stream.flatMap(function (data_url) {
        var fire_ref = self.root_ref.child('Members').child(parseInt(data_url.tenant_id)).child('Mobilities').child('Counts').child(data_url.direction.toUpperCase());
        return Kefir.stream(function (emitter) {
            fire_ref.on("child_added", function (snapshot) {
                emitter.emit({ snapshot: snapshot, direction: data_url.direction });
            });
        });
    });

    var setup_count_arrays = function setup_count_arrays(counts, term) {
        if (self.countries) {
            for (var _name in counts) {
                if (counts.hasOwnProperty(_name)) {
                    var parsed_name = parseInt(_name);
                    var country_name = self.countries[_name] ? self.countries[_name].country : 'none';
                    var index = self.count_indexes[parsed_name] !== undefined ? self.count_indexes[parsed_name] : -1;
                    if (index > -1) {
                        self.map_data[index][1] += parseInt(counts[_name].count);
                    } else {
                            self.map_data.push([country_name, parseInt(counts[_name].count)]);
                            self.count_indexes[parsed_name] = self.map_data.length - 1;
                        }
                    self.count_data.push({ id: parsed_name, count: parseInt(counts[_name].count), affiliations: counts[_name].affiliation, term: term });
                }
            }
            self.total_location_count = self.map_data.length - 1;
            setup_map_bar(self.map_data);
        } else {
            setTimeout(function () {
                setup_count_arrays(counts, term);
            }, 50);
        }
    };

    var setup_count_arrays_terms = function setup_count_arrays_terms(counts, term, term_data, term_data_all, direction) {
        var count = 0;
        var affiliations = [];

        var term_affiliations = [];
        var term_countries = [];

        for (var _name2 in counts) {
            if (counts.hasOwnProperty(_name2)) {
                count += parseInt(counts[_name2].count);
                term_countries.push({ country_id: parseInt(_name2), count: parseInt(counts[_name2].count), affiliations: counts[_name2].affiliation });
                term_affiliations = term_affiliations.concat(counts[_name2].affiliation);
            }
        }
        var index = 0;
        var my_term = term_data.find(function (term_2, i) {
            index = i;
            return term_2[0] == term;
        });
        if (my_term) {
            term_data[index][1] += count;
        } else {
                term_data.push([term, count]);
            }
        term_data_all[direction].push({ id: term, count: count, affiliations: term_affiliations, countries: term_countries });
        return { term_data: term_data, term_data_all: term_data_all };
    };

    fire_stream.onValue(function (data) {

        var terms_data = setup_count_arrays_terms(data.snapshot.val().countries, data.snapshot.key, self.term_data, self.term_data_all, data.direction);
        self.term_data = terms_data.term_data;
        self.term_data_all = terms_data.term_data_all;
        self.term_data_all_original = terms_data.term_data_all;
        self.total_student_count = get_total_student_count(self.term_data_all, self.direction);
        setup_year_chart(self.term_data);

        setup_count_arrays(data.snapshot.val().countries, data.snapshot.key);

        self.update();
    });

    var fire_ref_est = self.root_ref.child('Establishments').child('Establishments');
    var fire_ref_est_ances = self.root_ref.child('Establishments').child('Establishments_Ancestors');
    var fire_ref_terms = self.root_ref.child('Members').child(self.opts.tenant_id).child('Terms').child('Ranks');

    var sub_affiliations_level_1_get = function sub_affiliations_level_1_get() {
        if (self.sub_affiliations && self.sub_affiliations.length > 0 && self.sub_affiliations_ancestors && self.sub_affiliations_ancestors.length > 0) {
            (function () {
                var indexes = [];
                self.sub_affiliations_level_1 = self.sub_affiliations_ancestors.filter(function (affiliation, index) {
                    return affiliation.ancestors.length == 1 ? affiliation.ancestors.find(function (ancestor) {
                        if (ancestor == parseInt(self.opts.tenant_id)) {
                            indexes.push(index);
                            return true;
                        } else {
                            return false;
                        }
                    }) : false;
                }).map(function (ancestor, index) {
                    ancestor._id = parseInt(indexes[index]);
                    ancestor.title = self.sub_affiliations[ancestor._id].establishment;
                    return ancestor;
                });
                self.sub_affiliations_level_1.splice(0, 1, { title: '[All sub-affiliation]', _id: 0 });
                self.side_bar_filter._tag.sub_affiliations_level_1_ddl._tag.opts.list = self.sub_affiliations_level_1;
                self.side_bar_filter._tag.sub_affiliations_level_1_ddl._tag.opts.selected_callback = self.sub_affiliations_level_1_selected;
                self.update();
            })();
        }
    };

    fire_ref_est.on("value", function (snapshot) {
        var sub_affiliations = snapshot.val();
        self.sub_affiliations = [];
        Object.keys(sub_affiliations).forEach(function (key) {
            return self.sub_affiliations[parseInt(key)] = sub_affiliations[key];
        });
        self.sub_affiliations.map(function (affiliation, index) {
            affiliation.establishment = affiliation.establishment.indexOf(', ') > -1 ? affiliation.establishment.substr(0, affiliation.establishment.indexOf(', ')) : affiliation.establishment;
            return affiliation;
        });
        sub_affiliations_level_1_get();
    });

    fire_ref_est_ances.on("value", function (snapshot) {
        var sub_affiliations_ancestors = snapshot.val();
        self.sub_affiliations_ancestors = [];
        Object.keys(sub_affiliations_ancestors).forEach(function (key) {
            return self.sub_affiliations_ancestors[parseInt(key)] = sub_affiliations_ancestors[key];
        });
        sub_affiliations_level_1_get();
    });

    fire_ref_terms.on("value", function (snapshot) {
        self.terms = snapshot.val();
    });
});
});