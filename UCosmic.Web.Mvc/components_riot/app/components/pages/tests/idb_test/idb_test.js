riot.tag2('idb_test', '<div class="page_container" style=""> test </div>', '@media (max-width: 500px) { idb_test .benefits_section .home_icon,[riot-tag="idb_test"] .benefits_section .home_icon,[data-is="idb_test"] .benefits_section .home_icon{ width: 75px; height: 75px; } }', '', function(opts) {
console.log("Start program: ", Date.now());
var self = this;
var activities = undefined,
    filtered_activities = undefined;
var milli_to_refresh = 60 * 60 * 1000 * 24;
milli_to_refresh = 20000;
var delay = 0;

var get_countries = function get_countries(update) {
    console.log("Start countries: ", Date.now());

    return new Promise(function (resolve, reject) {
        ttw.data_access_idb("/Places/Countries").then(function (value) {
            function resolve_array(val) {
                var array = Object.keys(val.data).map(function (key) {
                    var obj = val.data[key];
                    obj.id = parseInt(key);
                    return obj;
                });
                var associations = [];
                var country_list = array.map(function (value, index) {
                    if (value) {
                        var associations_mapped = [];
                        if (value.associations) {
                            associations_mapped = value.associations.map(function (association, index_2) {
                                associations.push({ _id: association.id, text: association.name });
                                var object_2 = { _id: association.id, text: association.name };
                                return object_2;
                            });
                        }
                        var object = { _id: value.id, text: value.country, associations: associations_mapped };
                        return object;
                    }
                });

                var flags = {};
                var region_list = associations.filter(function (entry) {
                    if (flags[entry.text]) {
                        return false;
                    }
                    flags[entry.text] = true;
                    return true;
                });
                var location_list = country_list.concat(region_list);
                console.log("Received countries: ", Date.now());
                resolve(location_list);
                !update ? get_countries(true) : null;
            }
            function do_request() {
                ttw.data_access_fb("/Places/Countries", 'once', 'value').then(function (value) {
                    if (value) {
                        resolve_array(value);
                    } else {
                        reject('could not fb');
                    }
                });
            }
            if (value) {
                if (update && (!value.time_stamp || value.time_stamp + milli_to_refresh < Date.now())) {
                    do_request();
                } else {
                    resolve_array(value);
                }
            } else {
                do_request();
            }
        });
    });
};

var get_establishments = function get_establishments(update) {
    console.log("Start establishments: ", Date.now());

    return new Promise(function (resolve, reject) {
        ttw.data_access_idb("Establishments/Establishments_Ancestors").then(function (value) {
            function resolve_array(val) {
                var establishments_ancestors = Object.keys(val.data).map(function (key) {
                    var obj = val.data[key];
                    obj.id = parseInt(key);
                    return obj;
                });
                console.log("Received establishments: ", Date.now());
                resolve(establishments_ancestors);
                !update ? get_establishments(true) : null;
            }
            function do_request() {
                ttw.data_access_fb("/Establishments/Establishments_Ancestors", 'once', 'value').then(function (value) {
                    if (value) {
                        resolve_array(value);
                    } else {
                        reject('could not fb');
                    }
                });
            }
            if (value) {
                if (update && (!value.time_stamp || value.time_stamp + milli_to_refresh < Date.now())) {
                    do_request();
                } else {
                    resolve_array(value);
                }
            } else {
                do_request();
            }
        });
    });
};

var get_activities = function get_activities(update, establishment_id) {
    console.log("Start get_activities: ", Date.now());

    return new Promise(function (resolve, reject) {
        ttw.data_access_idb("/api/tests/idb_test/" + establishment_id + "/").then(function (value) {
            function resolve_array(val) {
                var new_array = JSON.parse(val.data);

                resolve(new_array);
                console.log("Received activities: ", Date.now());
                !update ? get_activities(true, establishment_id) : null;
            }
            function do_request() {
                ttw.data_access_ajax("/api/tests/idb_test/" + establishment_id + "/", 'GET').then(function (value) {
                    if (value) {
                        resolve_array(value);
                    } else {
                        reject('could not ajax');
                    }
                });
            }
            if (value) {
                if (update && (!value.time_stamp || value.time_stamp + milli_to_refresh < Date.now())) {
                    do_request();
                } else {
                    resolve_array(value);
                }
            } else {
                do_request();
            }
        });
    });
};

var get_activities_limit = function get_activities_limit(offset, limit, array, update) {

    return new Promise(function (resolve, reject) {
        ttw.data_access_idb("/api/tests/idb_test/" + 3306 + "/" + offset + "/" + limit + "/").then(function (value) {
            function resolve_array(val) {
                var new_array = JSON.parse(val.data);
                if (new_array && new_array.length > 0) {
                    array = array.concat(new_array);
                    offset = array[array.length - 1].id;
                    resolve(get_activities(offset, limit, array, update));
                } else {
                    resolve(array);
                    !update ? get_activities(0, 100, [], true) : null;
                }
            }
            function do_request() {
                resolve(ttw.data_access_ajax("/api/tests/idb_test/" + 3306 + "/" + offset + "/" + limit + "/", 'GET').then(function (value) {
                    if (value) {
                        resolve_array(value);
                    } else {
                        reject('could not ajax');
                    }
                }));
            }
            if (value) {
                if (update && (!value.time_stamp || value.time_stamp + milli_to_refresh < Date.now())) {
                    do_request();
                } else {
                    resolve_array(value);
                }
            } else {
                do_request();
            }
        });
    });
};

function filter_activities(activities, input) {
    return new Promise(function (resolve, reject) {
        var url = window.location.href.includes('localhost') ? "/components_riot/app/workers/activities_filter.js" : "https://ucosmic.firebaseapp.com/workers/activities_filter.js";
        var worker = new Worker(url);
        worker.onmessage = function (e) {
            resolve(JSON.parse(e.data));
        };

        worker.postMessage(JSON.stringify(input));
    });
}

var establishment_id = 3306;
Promise.all([get_activities(false, establishment_id), get_countries(false), get_establishments(false)]).then(function (values) {
    console.log("Received countries & activities: ", Date.now());

    activities = values[0];
    var locations = values[1];
    var establishments_ancestors = values[2];
    activities = activities.map(function (value) {
        value.place_ids = value.place_ids.map(function (place_id) {
            var place = locations.find(function (location) {
                return location._id == place_id;
            });
            return { place_id: place_id, place_name: place ? place.text : '', associations: place && place.associations ? place.associations : [] };
        });

        value.person_affiliations = value.person_affiliations ? value.person_affiliations.map(function (affiliation_id) {
            var establishment = establishments_ancestors.find(function (est) {
                return est.id == affiliation_id;
            });
            return { affiliation_id: affiliation_id, ancestors: establishment && establishment.ancestors ? establishment.ancestors : [] };
        }) : [];
        return value;
    });
    var input = {
        keyword: '"test case" -details Twelve women',
        place_ids: [2],
        activity_type_ids: [1, 4, 5],
        since: new Date("2010").getTime(),
        until: new Date("2014").getTime(),
        include_undated: false,
        order_by: { order: 'recency', direction: 'asc' },
        activities: activities,
        ancestor_id: 4868
    };
    filter_activities(activities, input).then(function (results) {
        console.log("Received filtered activities: ", Date.now());
        filtered_activities = results.map(function (value, index) {

            return value;
        });
    });
});
});