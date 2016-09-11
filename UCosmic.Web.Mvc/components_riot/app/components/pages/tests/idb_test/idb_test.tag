<idb_test>
    <style scoped>


        @media (max-width: 500px) {
            .benefits_section .home_icon {
                width: 75px;
                height: 75px;
            }
        }

    </style>
    <div class="page_container" style="">
      test
    </div>

    <!--<worker id="worker1" type="none" style="display: none;">-->
    <!--self.onmessage = function(e) {-->
      <!--self.postMessage('msg from worker');-->
    <!--};-->
  <!--</worker>-->

    <script type="es6">
        console.log("Start program: ", Date.now());
        const self = this;
        let activities, filtered_activities;
        let milli_to_refresh = 60 * 60 * 1000 * 24; //24hours
        milli_to_refresh = 20000; //20 seconds
        let delay = 0;


        // var root_ref = firebase.database().ref(), region_list, location_list;
        // const fire_ref_countries = root_ref.child('Places').child('Countries');// new Firebase("https://UCosmic.firebaseio.com/Places/Countries")
        
        let get_countries = (update) => {
            console.log("Start countries: ", Date.now());

            return new Promise(function (resolve, reject) {
                ttw.data_access_idb("/Places/Countries").then((value) => {
                    function resolve_array(val){
                    //     var associations = []
                    //     var country_list = val.map((value, index) => {
                    //         if (value) {
                    //             var object = { _id: index, text: value.country, associations: value.associations }
                    //             if (value.associations) {
                    //                 value.associations.forEach(function (association, index_2) {
                    //                     associations.push({ _id: association.id, text: association.name });
                    //                 })
                    //             }
                    //             return object;
                    //         }
                    //     })
                    //     // region_list = _.uniqBy(associations, 'text');
                    //
                    //     const flags = {};
                    //     const region_list = associations.filter(function(entry) {
                    //         if (flags[entry.text]) {
                    //             return false;
                    //         }
                    //         flags[entry.text] = true;
                    //         return true;
                    //     });
                    // .map(country_list.concat(region_list), function(value, index){
                    //         return { _id: value._id, title: value.text };
                    //     })
                    //
                    //     location_list = _.orderBy(_.map(country_list.concat(region_list), function(value, index){
                    //         return { _id: value._id, title: value.text };
                    //     }), ['title'], ['asc']);

                        // const country_list = Object.keys(val.data).map(key => {
                        //     let obj = {_id: parseInt(key), text: val.data[key].country};
                        //     return obj;
                        // })
                        const array = Object.keys(val.data).map(key => {
                            let obj = val.data[key];
                            obj.id = parseInt(key);
                            return obj;
                        })
                        let associations = [];
                        var country_list = array.map( (value, index) => {
                            if (value) {
                                let associations_mapped = [];
                                if (value.associations) {
                                    associations_mapped = value.associations.map(function (association, index_2) {
                                        associations.push({ _id: association.id, text: association.name });
                                        const object_2 = { _id: association.id, text: association.name}
                                        return object_2;
                                    })
                                }
                                const object = { _id: value.id, text: value.country, associations: associations_mapped}
                                return object;
                            }
                        })
                        // country_list.forEach( (value, index) => {
                        //     if (value) {
                        //         if (value.associations) {
                        //             value.associations.forEach(function (association, index_2) {
                        //                 associations.push({ _id: association.id, text: association.name });
                        //             })
                        //         }
                        //     }
                        // })
                        const flags = {};
                        const region_list = associations.filter(function(entry) {
                            if (flags[entry.text]) {
                                return false;
                            }
                            flags[entry.text] = true;
                            return true;
                        });
                        let location_list = country_list.concat(region_list)
                        console.log("Received countries: ", Date.now());
                        resolve(location_list);
                        !update ? get_countries(true) : null;
                    }
                    function do_request(){
                        ttw.data_access_fb("/Places/Countries", 'once', 'value').then((value) => {
                            if(value){
                                resolve_array(value)
                            }else{
                                reject('could not fb');
                            }
                        });
                    }
                    if(value){
                        if(update && (!value.time_stamp || (value.time_stamp + milli_to_refresh < Date.now()))){
                            do_request()
                        }else{
                            resolve_array(value)
                        }
                    }else{
                        do_request()
                    }
                });
            });
        }

        let get_establishments = (update) => {
            console.log("Start establishments: ", Date.now());

            return new Promise(function (resolve, reject) {
                ttw.data_access_idb("Establishments/Establishments_Ancestors").then((value) => {
                    function resolve_array(val){
                        const establishments_ancestors = Object.keys(val.data).map(key => {
                            let obj = val.data[key];
                            obj.id = parseInt(key);
                            return obj;
                        })
                        console.log("Received establishments: ", Date.now());
                        resolve(establishments_ancestors);
                        !update ? get_establishments(true) : null;
                    }
                    function do_request(){
                        ttw.data_access_fb("/Establishments/Establishments_Ancestors", 'once', 'value').then((value) => {
                            if(value){
                                resolve_array(value)
                            }else{
                                reject('could not fb');
                            }
                        });
                    }
                    if(value){
                        if(update && (!value.time_stamp || (value.time_stamp + milli_to_refresh < Date.now()))){
                            do_request()
                        }else{
                            resolve_array(value)
                        }
                    }else{
                        do_request()
                    }
                });
            });
        }

        let get_activities = (update, establishment_id) => {
            console.log("Start get_activities: ", Date.now());

            return new Promise(function (resolve, reject) {
                ttw.data_access_idb("/api/tests/idb_test/" + establishment_id + "/").then((value) => {
                    function resolve_array(val){
                        const new_array = JSON.parse(val.data);
                        // resolve('tdfgh');
                        resolve(new_array);
                        console.log("Received activities: ", Date.now());
                        !update ? get_activities(true, establishment_id) : null;
                    }
                    function do_request(){
                        ttw.data_access_ajax("/api/tests/idb_test/" + establishment_id + "/", 'GET').then((value) => {
                            if(value){
                                resolve_array(value)
                            }else{
                                reject('could not ajax');
                            }
                        });
                    }
                    if(value){
                        if(update && (!value.time_stamp || (value.time_stamp + milli_to_refresh < Date.now()))){
                            do_request()
                        }else{
                            resolve_array(value)
                        }
                    }else{
                        do_request()
                    }
                });
            });
        }

        let get_activities_limit = (offset, limit, array, update) => {

            return new Promise(function (resolve, reject) {
                ttw.data_access_idb("/api/tests/idb_test/" + 3306 + "/" + offset + "/" + limit + "/").then((value) => {
                    function resolve_array(val){
                        const new_array = JSON.parse(val.data);
                        if(new_array && new_array.length > 0){
                            array = array.concat(new_array);
                            offset = array[array.length  - 1].id;
                            resolve(get_activities(offset, limit, array, update));
                        }else{
                            resolve(array);
                            !update ? get_activities(0, 100, [], true) : null;
                        }
                    }
                    function do_request(){
                        resolve(ttw.data_access_ajax("/api/tests/idb_test/" + 3306 + "/" + offset + "/" + limit + "/", 'GET').then((value) => {
                            if(value){
                                resolve_array(value)
                            }else{
                                reject('could not ajax');
                            }
                        }));
                    }
                    if(value){
                        if(update && (!value.time_stamp || (value.time_stamp + milli_to_refresh < Date.now()))){
                            do_request()
                        }else{
                            resolve_array(value)
                        }
                    }else{
                        do_request()
                    }
                });
            });
        }





        function filter_activities(activities, input) {
            return new Promise(function (resolve, reject) {
                const url = window.location.href.includes('localhost') ? "/components_riot/app/workers/activities_filter.js" : "https://ucosmic.firebaseapp.com/workers/activities_filter.js";
                const worker = new Worker(url);
                worker.onmessage = function (e) {
                    resolve(JSON.parse(e.data));
                };

                worker.postMessage(JSON.stringify(input));
            });
        }

        // get_activities([], false).then((array) => {
        //     activities = array;
        //     const input = {
        //         // pivot: number,
        //         keyword: '"test case" -details Twelve women',
        //         // placeIds: number[],
        //         // ancestorIds: number,
        //         // placeNames: string[],
        //         // activityTypeIds: number[],
        //         // since: string,
        //         // until: string,
        //         include_undated: false,
        //         order_by: {order: 'recency', direction: 'asc'},
        //         // ancestorId: number,
        //         activities: activities
        //     }
        //     filter_activities(array, input).then((results) => {
        //         console.log("Received: " + results);
        //         filtered_activities = results;
        //     });
        // });
        const establishment_id = 3306
        Promise.all([get_activities(false, establishment_id), get_countries(false), get_establishments(false)]).then((values) => {
            console.log("Received countries & activities: ", Date.now());

            activities = values[0];
            const locations = values[1];
            const establishments_ancestors = values[2];
            activities = activities.map((value) => {
                value.place_ids = value.place_ids.map((place_id) => {
                    let place = locations.find((location) => location._id == place_id)
                    return {place_id: place_id, place_name: place ? place.text : '', associations: place && place.associations ? place.associations : []};
                })
                // const establishment_with_ancestors = establishments_ancestors.find((value) => {
                //     value.id ==1
                // });
                value.person_affiliations = value.person_affiliations ? value.person_affiliations.map((affiliation_id) => {
                            let establishment = establishments_ancestors.find((est) => est.id == affiliation_id)
                            return {affiliation_id: affiliation_id, ancestors: establishment && establishment.ancestors ? establishment.ancestors : []};
                        }) : [];
                return value;
            })
            const input = {
                // pivot: number,
                keyword: '"test case" -details Twelve women',
                place_ids: [2],
                activity_type_ids: [1, 4, 5],
                since:  new Date("2010").getTime(),
                until:  new Date("2014").getTime(),
                include_undated: false,
                order_by: {order: 'recency', direction: 'asc'},
                activities: activities,
                ancestor_id: 4868
            }
            filter_activities(activities, input).then((results) => {
                console.log("Received filtered activities: ", Date.now());
                filtered_activities = results.map((value, index) => {

                    return value;
                });
            });

        });



    </script>
</idb_test>