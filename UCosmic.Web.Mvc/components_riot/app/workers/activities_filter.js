'use strict';
const ttw = {};
let url = self.location.href.includes('localhost') ? "/components_riot/app/bower_components/lodash/lodash.min.js" : "https://ucosmic.firebaseapp.com/bower_components/lodash/lodash.min.js";

importScripts(url);
url = self.location.href.includes('localhost') ? "/components_riot/app/components/utilities/replaceAll.min.js" : "https://ucosmic.firebaseapp.com/components/utilities/replaceAll.min.js";
importScripts(url);

function sort_by(items, order, direction, array) {

    const items_sorted = items.sort(function (a, b) {

        var nameA = typeof a[order] == 'string' ? a[order].toUpperCase() : typeof a[order] == 'number' ? a[order] : '';
        var nameB = typeof b[order] == 'string' ? b[order].toUpperCase() : typeof b[order] == 'number' ? b[order] : '';

        /********mainly used for the title, consider using .map **************
         // var nameA = typeof a[order] == 'string' ? a[order].replace('"', "").replace("'", "").replace(" ", "").replace("(", "").toUpperCase() : typeof a[order] == 'number' ? a[order] : '';
         // var nameB = typeof b[order] == 'string' ? b[order].replace('"', "").replace("'", "").replace(" ", "").replace("(", "").toUpperCase() : typeof b[order] == 'number' ? b[order] : '';
         **********************************************************/
        // if(a[order]){
        //     if(a[order] == 'string'){
        //         var nameA = a[order].toUpperCase();
        //     }else if(a[order] == 'number'){
        //         var nameA = a[order];
        //     }else{
        //         var nameA = '';
        //     }
        // }
        if (nameA < nameB) {
            return direction == 'asc' ? -1 : 1;
        }
        if (nameA > nameB) {
            return direction == 'desc' ? -1 : 1;
        }
        return 0;
    });
    array.shift();
    if (array.length > 0) {
        const order_by = array[0];
        return sort_by(items_sorted, order_by.order, order_by.direction, array)
    } else {
        return items_sorted
    }
}


function sort(items, order, direction) {


    if (order == "recency") {
        if (direction == "desc") {
            items = sort_by(items, 'title', 'asc', [{order: 'displayName', direction: 'asc'}, {order: 'firstNameSort', direction: 'asc'}, {order: 'lastNameSort', direction: 'asc'}
                , {order: 'startsOnCalc', direction: 'desc'}, {order: 'endsOnCalc', direction: 'desc'}, {order: 'onGoingSort', direction: 'desc'}]);
            // sql += " order by onGoingSort desc, endsOnCalc desc, startsOnCalc desc, locationName asc, lastNameSort asc, firstNameSort asc, av.title asc";
        }
        else {
            items = sort_by(items, 'title', 'asc', [{order: 'displayName', direction: 'asc'}, {order: 'firstNameSort', direction: 'asc'}, {order: 'lastNameSort', direction: 'asc'}
                , {order: 'startsOnCalc', direction: 'asc'}, {order: 'endsOnCalc', direction: 'asc'}, {order: 'onGoingSort', direction: 'asc'}]);
            // sql += " order by onGoingSort asc, endsOnCalc asc, startsOnCalc asc, locationName asc, lastNameSort asc, firstNameSort asc, av.title asc";
        }
    }
    else if (order == "lastNameSort") {
        items = sort_by(items, 'title', 'asc', [{order: 'displayName', direction: 'asc'}, {order: 'firstNameSort', direction: 'asc'}
            , {order: 'startsOnCalc', direction: 'asc'}, {order: 'endsOnCalc', direction: 'asc'}, {order: 'onGoingSort', direction: 'asc'}, {order: order, direction: 'asc'}]);
        // orderBy = "lastNameSort";
        // sql += " order by " + orderBy + " " + ascDesc + ", firstNameSort asc, onGoingSort desc, endsOnCalc desc, startsOnCalc desc, locationName asc, av.title asc";
    }
    // else if (order == "locationName")
    // {
    //     items = sort_by(items, order, direction, [{order: 'title', direction: 'asc'}, {order: 'firstNameSort', direction: 'asc'}, {order: 'lastNameSort', direction: 'asc'}
    //         , {order: 'startsOnCalc', direction: 'asc'}, {order: 'endsOnCalc', direction: 'asc'}, {order: 'onGoingSort', direction: 'asc'}, {order: order, direction: direction}]);
    // sql += " order by " + orderBy + " " + ascDesc + ", onGoingSort desc, endsOnCalc desc, startsOnCalc desc, lastNameSort asc, firstNameSort asc, av.title asc";
    // }
    else if (order == "title") {
        items = sort_by(items, 'displayName', 'asc', [{order: 'firstNameSort', direction: 'asc'}, {order: 'lastNameSort', direction: 'asc'}
            , {order: 'startsOnCalc', direction: 'asc'}, {order: 'endsOnCalc', direction: 'asc'}, {order: 'onGoingSort', direction: 'asc'}, {order: order, direction: direction}]);
        // sql += " order by " + orderBy + " " + ascDesc + ", onGoingSort desc, endsOnCalc desc, startsOnCalc desc, locationName asc, lastNameSort asc, firstNameSort asc";
    }
    else {
        items = sort_by(items, 'title', 'asc', [{order: 'displayName', direction: 'asc'}, {order: 'firstNameSort', direction: 'asc'}, {order: 'lastNameSort', direction: 'asc'}
            , {order: 'startsOnCalc', direction: 'asc'}, {order: 'endsOnCalc', direction: 'asc'}, {order: 'onGoingSort', direction: 'asc'}, {order: order, direction: direction}]);
        // sql += " order by " + orderBy + " " + ascDesc + ", onGoingSort desc, endsOnCalc desc, startsOnCalc desc, locationName asc, lastNameSort asc, firstNameSort asc, av.title asc";
    }
    return items;
}

function move_not_keywords(keywords, index = 0) {
    if (keywords[index][0] == '-') {
        const not_keyword = keywords[index]
        keywords.splice(index, 1);
        keywords.push(not_keyword);
    }

    index++;
    if (index > keywords.length - 1) {
        return keywords;
    } else {
        return move_not_keywords(keywords, index);
    }
}

function filter_for_keywords(keywords_array, list, new_list = [], grouped_keywords) {
    let new_list_to_add = [];
    const keyword = keywords_array[0].substr(1);
    if (keyword == '"') {
        if (grouped_keywords) {
            /*filter the grouped_keywords*/
            new_list_to_add = list.filter((value, index) => {
                return ((value.displayName && value.displayName.toLowerCase().includes(keyword))
                || (value.firstName && value.firstName.toLowerCase().includes(keyword))
                || (value.lastName && value.lastName.toLowerCase().includes(keyword))
                || (value.id_name && value.id_name.toLowerCase().includes(keyword))
                || (value.tag_text && value.tag_text.toLowerCase().includes(keyword))
                || (value.title && value.title.toLowerCase().includes(keyword))
                || (value.place_ids && value.place_ids.find((place) => {
                    place.place_name.toLowerCase().includes(keyword)
                }))
                || (value.contentsearchable && value.contentsearchable.toLowerCase().includes(keyword)))
            });
            new_list = new_list_to_add.concat(new_list);
            grouped_keywords = null;
        } else {
            grouped_keywords = " ";
        }
    } else if (keyword != "") {
        if (grouped_keywords) {
            grouped_keywords = grouped_keywords == " " ? keyword : grouped_keywords + " " + keyword;
        } else {
            if (keyword[0] == '-') {
                new_list = new_list.filter((value, index) => {
                    return ((!value.displayName || (value.displayName && !value.displayName.toLowerCase().includes(keyword)))
                    && (!value.firstName || (value.firstName && !value.firstName.toLowerCase().includes(keyword)))
                    && (!value.lastName || (value.lastName && !value.lastName.toLowerCase().includes(keyword)))
                    && (!value.id_name || (value.id_name && !value.id_name.toLowerCase().includes(keyword)))
                    && (!value.tag_text || (value.tag_text && !value.tag_text.toLowerCase().includes(keyword)))
                    && (!value.title || (value.title && !value.title.toLowerCase().includes(keyword)))
                    && (!value.place_ids || (value.place_ids && !value.place_ids.find((place) => {
                        place.place_name.toLowerCase().includes(keyword)
                    })))
                    && (!value.contentsearchable || (value.contentsearchable && !value.contentsearchable.toLowerCase().includes(keyword))))
                });
            } else {
                new_list_to_add = list.filter((value, index) => {
                    return ((value.displayName && value.displayName.toLowerCase().includes(keyword))
                    || (value.firstName && value.firstName.toLowerCase().includes(keyword))
                    || (value.lastName && value.lastName.toLowerCase().includes(keyword))
                    || (value.id_name && value.id_name.toLowerCase().includes(keyword))
                    || (value.tag_text && value.tag_text.toLowerCase().includes(keyword))
                    || (value.title && value.title.toLowerCase().includes(keyword))
                    || (value.place_ids && value.place_ids.find((place) => {
                        place.place_name.toLowerCase().includes(keyword)
                    }))
                    || (value.contentsearchable && value.contentsearchable.toLowerCase().includes(keyword)))
                });
                new_list = new_list_to_add.concat(new_list);
            }
        }
    }
    keywords_array.shift();
    if (keywords_array.length > 0) {
        return filter_for_keywords(keywords_array, list, new_list, grouped_keywords)
    } else {
        if (grouped_keywords) {/* if they forgot the last " */
            new_list_to_add = list.filter((value, index) => {
                return (value.displayName.includes(keywords_array[0]) || value.firstName.includes(keywords_array[0]) || value.lastName.includes(keywords_array[0])
                || value.id_name.includes(keywords_array[0]) || value.tag_text.includes(keywords_array[0]) || value.title.includes(keywords_array[0])
                || value.contentsearchable.includes(keywords_array[0]))
            });
            new_list = new_list_to_add.concat(new_list);
        }
        var flags = {};

        var new_list = new_list.filter(function (entry) {
            if (flags[entry.id]) {
                return false;
            }
            flags[entry.id] = true;
            return true;
        });
        return new_list
    }
}

self.onmessage = function (e, t) {
    console.log("Start filter: ", Date.now());
    const data = JSON.parse(e.data);
    let activities_filtered = data.activities;
    if (data.ancestor_id) {
        activities_filtered = activities_filtered.filter((value, index) => {
            return (value.person_affiliations.find((affiliation) => {

                return affiliation.affiliation_id == data.ancestor_id || affiliation.ancestors ? affiliation.ancestors.find(ancestor => {
                        return data.ancestor_id == ancestor;
                    }) : false;
            }))
        });
    }
    console.log("End filter ancestor: ", Date.now());
    if (data.place_ids) {
        activities_filtered = activities_filtered.filter((value, index) => {
            return (value.place_ids.find((place) => {

                return data.place_ids.indexOf(place.place_id) > -1 || place.associations.find(association => {
                        return data.place_ids.indexOf(association._id) > -1;
                    });
            }))
        });
    }
    console.log("End filter place_ids: ", Date.now());
    if (data.activity_type_ids) {
        activities_filtered = activities_filtered.filter((value, index) => {
            return (value.typeIds.find((id) => {
                return data.activity_type_ids.indexOf(id) > -1
            }))
        });
    }
    console.log("End filter activity_type_ids: ", Date.now());
    if (data.since || data.until) {
        activities_filtered = activities_filtered.filter((value, index) => {
            const starts_on_calc_undated = data.include_undated ? value.startsOnCalc == '1901-01-01T00:00:00' ? true : false : false;
            const ends_on_calc_undated = data.include_undated ? (value.endsOnCalc == '1901-01-01T00:00:00' || value.endsOnCalc == '2999-01-01T00:00:00') ? true : false : false;
            const starts_on = new Date(value.startsOnCalc).getTime();
            const ends_on = new Date(value.endsOnCalc).getTime();
            if (data.since && data.until) {
                return ((starts_on <= data.until || starts_on_calc_undated) && (ends_on >= data.since || ends_on_calc_undated || value.onGoing))
            } else if (data.since) {
                return ((starts_on <= data.since || starts_on_calc_undated) && (ends_on >= data.since || ends_on_calc_undated || value.onGoing))
                // Output = Output.Where(x => ((x.startsOnCalc <= Since || x.startsOnCalc == null) && (x.endsOnCalc >= Since || x.endsOnCalc == null || x.onGoing))).ToList();
            } else if (data.until) {
                return ((starts_on <= data.until || starts_on_calc_undated) && (ends_on >= data.until || ends_on_calc_undated || value.onGoing))
                // Output = Output.Where(x => ((x.startsOnCalc <= Until || x.StartsOnCalc == null) && (x.EndsOnCalc >= Until || x.EndsOnCalc == null || x.onGoing))).ToList();
            }
        });
    }
    console.log("End filter until: ", Date.now());
    if (data.keyword) {
        const keywords = move_not_keywords(ttw.replaceAll(data.keyword, '"', ' " ').toLowerCase().split(' '), 0);
        // const keywords = ttw.replaceAll(ttw.replaceAll(data.keyword, '"', ' " '), '-', '- ').split(' ');
        activities_filtered = filter_for_keywords(keywords, activities_filtered, [], null);
    }
    console.log("End filter keyword: ", Date.now());
    if (!data.include_undated) {
        activities_filtered = activities_filtered.filter((value, index) => {
            return (value.startsOnCalc != '1901-01-01T00:00:00') || (value.endsOnCalc != '1901-01-01T00:00:00' && value.endsOnCalc != '2999-01-01T00:00:00')
        });
    }

    console.log("End filter include_undated: ", Date.now());
    activities_filtered = sort(activities_filtered, data.order_by.order, data.order_by.direction)
    self.postMessage(JSON.stringify(activities_filtered));
};