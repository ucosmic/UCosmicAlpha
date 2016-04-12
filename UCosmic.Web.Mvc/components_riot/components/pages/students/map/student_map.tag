<student_map>
    <style>
        #remove_country_button {
            /*background-color: red;*/
            height: 1em;
            width: 1em;
            outline: none;
            border-radius: 50%;
            border: 1px solid black;
            margin-left: 5px;
            opacity: .8;
            transition: opacity .25s ease-in-out;
            -moz-transition: opacity .25s ease-in-out;
            -webkit-transition: opacity .25s ease-in-out;
        }
        drop_down{
            margin: 10px 0;
        }
    </style>
    <div class="layout horizontal start center-justified">
        <div class="layout vertical start center-justified">
            <header>
                <h1>Student Engagement Snapshot</h1>
            </header>
            <div style="margin: 0 0 16px; height: 30px; font-size: 20px;">
                <strong style="font-size: 1.2em;">
                    {total_student_count}
                </strong>
                students {direction == 'all' ? 'representing' : direction == 'in' ? 'from' : 'in'}
                <strong style="font-size: 24px;">
                    {total_location_count}
                </strong>
                locations.
            </div>
            <div class="layout horizontal start self-stretch">
                <div show="{!country_selected}" style="font-size: 16px; margin-bottom: 20px;    padding: 5px 0;">
                    Click a location for more information.
                </div>
                <div show="{country_selected}" style="font-size: 16px; margin-bottom: 20px; " class="layout horizontal center">
                    <strong style="font-size: 1.2em; margin-right: 5px;">
                        {country_selected_student_count}
                    </strong>
                    students {direction == 'all' ? 'representing' : direction == 'in' ? 'from' : 'in'}
                    <div style="border-radius: 5px; background-color: #ddd; padding: 5px; margin: 0 5px;" class="layout horizontal">
                        <strong style="font-size: 1em;">{country_selected}</strong>
                        <div style="cursor: pointer;" onclick="{remove_country}">
                            <div id="remove_country_button" style="cursor: pointer;">
                                <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" style="pointer-events: none; display: inline-block; width: 1em; height: 1em;fill:black; ">
                                    <g>
                                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z">
                                        </path>
                                    </g>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex"></div>
                <div style="height: 0;width:0;">
                    <div class="layout horizontal center" style="display: inline-block; position: relative; right: 190px; top: 55px; z-index: 2; border: solid black 1px; width:170px; padding: 5px;">
                        <div class="layout horizontal center"  >
                            <div style="text-align: center;"  >
                                <span riot-style="{direction == 'all' ? 'font-weight: bolder' : ''}; cursor:pointer;" onclick="{change_direction}" data-direction="all">All</span>
                            </div>
                            <div  class="flex"></div>
                            <div  style="text-align: center;border-right: 1px solid black;border-left: 1px solid black; padding: 0 5px;" >
                                <span riot-style="{direction == 'out' ? 'font-weight: bolder' : ''}; cursor:pointer;" onclick="{change_direction}" data-direction="out">Outbound</span>
                            </div>
                            <div  class="flex"></div>
                            <div style="text-align: center">
                                <span riot-style="{direction == 'in' ? 'font-weight: bolder' : ''}; cursor:pointer;" onclick="{change_direction}" data-direction="in">Inbound</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="regions_div" style="width: 700px; height: 500px;"></div>
        </div>
        <div class="layout vertical end center-justified">
            <side_bar_filter id="side_bar_filter" style="width: 300px; ">
                <drop_down  id="sub_affiliations_level_1_ddl" list="{parent.sub_affiliations_level_1}" width="240px" max_height="300px" pre_scale_class="pre_scale_top_center"
                title="sub-affiliation" background_color="white" selected_callback="{parent.sub_affiliations_level_1_selected}"
                selected_item_id="{parent.sub_affiliations_level_1_id}" scale_type="scale_height" direction="ltr">
                </drop_down>
                <drop_down show="{parent.sub_affiliations_level_1_id}" width="240px" max_height="300px" id="sub_affiliations_level_2_ddl" list="{parent.sub_affiliations_level_2}" pre_scale_class="pre_scale_top_center"
                           title="sub-affiliation" background_color="white" selected_callback="{parent.sub_affiliations_level_2_selected}"
                           selected_item_id="{parent.sub_affiliations_level_2_id}" scale_type="scale_height" direction="ltr">
                </drop_down>
                <drop_down show="{parent.sub_affiliations_level_1_id && parent.sub_affiliations_level_2_id}" width="240px" max_height="300px" id="sub_affiliations_level_3_ddl" list="{parent.sub_affiliations_level_3}" pre_scale_class="pre_scale_top_center"
                           title="sub-affiliation" background_color="white" selected_callback="{parent.sub_affiliations_level_3_selected}"
                           selected_item_id="{parent.sub_affiliations_level_3_id}" scale_type="scale_height" direction="ltr">
                </drop_down>
            </side_bar_filter>
            <div show="{total_student_count}" id="bar_chart" style="width: 300px; "></div>
            <div show="{total_student_count}" id="line_chart" style="width: 300px; "></div>
        </div>
    </div>

    <script type="es6">
        // https://developers.google.com/chart/interactive/docs/gallery/geochart#region-geocharts
        var self = this;
        self.direction = 'all';
        self.sub_affiliations_level_1 = [];
        self.sub_affiliations_level_2 = [];
        self.sub_affiliations_level_1_id = null;
        self.countries_data_all = [];

        // ucosmic.load_tag('/components_riot/components/form_elements/drop_down/drop_down.js', document.head);
        // ucosmic.load_tag('/components_riot/components/side_bar_filter/side_bar_filter.js', document.head);

        // const load_sides_added_tag_stream = ucosmic.load_tag2('/components_riot/store/menus/menu/section/menu_item/sides_added/sides_added.js', document.head, false);
        // const load_tags_stream = Kefir.zip([load_menu_item_tag_stream, load_expander_tag_stream, load_menu_item_option_tag_stream, load_image_slide_tag_stream,
        //     load_menu_checkboxes_tag_stream, load_menu_drop_down_tag_stream, load_is_button_tag_stream, load_dialog_drop_down_tag_stream, load_checkboxes_tag_stream
        //     , load_drinks_tag_stream, load_drinks_added_tag_stream, load_sides_tag_stream, load_sides_added_tag_stream, load_walmart_item_tag_stream]);
        // load_tags_stream.onEnd(() => {

        self.change_direction = (event, is_direction_set) => {
            self.direction = is_direction_set ? self.direction : event.target.dataset.direction;
            // setup_map_bar(self.map_data);
            let map_data = [];
            self.term_data_all = JSON.parse(JSON.stringify(self.term_data_all_original))
            // if(self.country_selected_index){
            //     self.country_selected = self.map_data[self.country_selected_index + 1][0];
            // }
            function are_equal_2(g1, g2) {
                return g1.id === g2.id;
            }

            function are_equal(g1, g2) {
                return g1[0] === g2[0];
            }
            if (self.direction === 'all') {
                if(self.selected_sub_affiliation != parseInt(self.opts.tenant_id)){
                    // let term_data_all_in = [], term_data_all_out = [];
                    self.term_data = [];
                    self.term_data_all.in.forEach((term) => {
                        // return true; // check all term.countries.affiliations to see if it is in the available affiliation and remove if not,
                        let count = 0;
                        term.countries = term.countries.map((country) => {
                            country.affiliations = country.affiliations.filter((affiliation) => {
                                return self.selected_sub_affiliation_ancestors.find((ancestor) => {
                                    return parseInt(affiliation) == ancestor;
                                })
                            })
                            count += country.affiliations.length;
                            country.count = country.affiliations.length;
                            return country;
                        })
                        term.countries = term.countries.filter((country) => {
                            return country.count > 0;
                        })
                        term.count = count
                        const countries = term.countries.map((country) => {
                            return [country.country_id ? self.countries[country.country_id].country : 'none', country.count]
                        })
                        map_data = array_union_concat_2(map_data, countries, are_equal);
                        // self.term_data.push([term.id, term.count])
                        // term_data_all_in.push(term);
                        //// then count the affiliations inside of country
                    })
                    self.term_data_all.out.forEach((term) => {
                        // return true; // check all term.countries.affiliations to see if it is in the available affiliation and remove if not,
                        let count = 0;
                        term.countries = term.countries.map((country) => {
                            country.affiliations = country.affiliations.filter((affiliation) => {
                                return self.selected_sub_affiliation_ancestors.find((ancestor) => {
                                    return parseInt(affiliation) == ancestor;
                                })
                            })
                            count += country.affiliations.length;
                            country.count = country.affiliations.length;
                            return country;
                        })
                        term.countries = term.countries.filter((country) => {
                            return country.count > 0;
                        })
                        term.count = count

                            const countries = term.countries.map((country) => {
                                return [country.country_id ? self.countries[country.country_id].country : 'none', country.count]
                            })
                            map_data = array_union_concat_2(map_data, countries, are_equal);
                        // self.term_data.push([term.id, term.count])
                        // term_data_all_out.push(term);
                        //// then count the affiliations inside of country
                    })
                    // term_data_all.in = term_data_all_in;
                    // term_data_all.out = term_data_all_out;
                    self.term_data_all_union = array_union_concat(self.term_data_all.in, self.term_data_all.out, are_equal_2);
                    self.term_data = self.term_data_all_union.map((term) => {
                        return [term.id, term.count]
                    })
                    self.total_student_count = get_total_student_count(self.term_data_all, self.direction);

                    // self.term_data_all.in.forEach((term) => {
                    //     const countries = term.countries.map((country) => {
                    //         return [country.country_id ? self.countries[country.country_id].country : 'none', country.count]
                    //     })
                    //     map_data = array_union_concat_2(map_data, countries, are_equal);
                    // });
                    map_data.splice(0, 0, ['Country', 'Students'])
                    self.total_location_count = map_data.length - 1;
                    // map_data = self.map_data;
                }else{
                    self.term_data_all_union = array_union_concat(self.term_data_all.in, self.term_data_all.out, are_equal_2);
                    self.term_data = self.term_data_all_union.map((term) => {
                        return [term.id, term.count]
                    })
                    self.total_student_count = get_total_student_count(self.term_data_all, self.direction);
                    self.total_location_count = self.map_data.length - 1;
                    map_data = self.map_data;
                }
            } else if (self.direction === 'in') {
                if(self.selected_sub_affiliation != parseInt(self.opts.tenant_id)){
                    self.term_data = [];
                    self.term_data_all.in.forEach((term) => {
                        let count = 0;
                        term.countries = term.countries.map((country) => {
                            country.affiliations = country.affiliations.filter((affiliation) => {
                                return self.selected_sub_affiliation_ancestors.find((ancestor) => {
                                    return parseInt(affiliation) == ancestor;
                                })
                            })
                            count += country.affiliations.length;
                            country.count = country.affiliations.length;
                            return country;
                        })
                        term.countries = term.countries.filter((country) => {
                            return country.count > 0;
                        })
                        term.count = count
                        const countries = term.countries.map((country) => {
                            return [country.country_id ? self.countries[country.country_id].country : 'none', country.count]
                        })
                        map_data = array_union_concat_2(map_data, countries, are_equal);
                    })
                    self.term_data_all_union = array_union_concat(self.term_data_all.in, self.term_data_all.out, are_equal_2);
                    self.term_data = self.term_data_all_union.map((term) => {
                        return [term.id, term.count]
                    })
                    self.total_student_count = get_total_student_count(self.term_data_all, self.direction);

                    map_data.splice(0, 0, ['Country', 'Students'])
                    self.total_location_count = map_data.length - 1;
                }else{
                    // self.term_data_all_union = array_union_concat(self.term_data_all.in, self.term_data_all.out, are_equal_2);
                    // self.term_data = self.term_data_all_union.map((term) => {
                    //     return [term.id, term.count]
                    // })
                    // self.total_student_count = get_total_student_count(self.term_data_all, self.direction);
                    // self.total_location_count = self.map_data.length - 1;
                    // map_data = self.map_data;
                    function are_equal(g1, g2) {
                        return g1[0] === g2[0];
                    }
                    self.term_data = self.term_data_all.in.map((term) => {
                        return [term.id, term.count]
                    })
                    self.term_data_all.in.forEach((term) => {
                        // term.countries = term.countries.splice(0, 0, ['Country', 'Students']);
                        const countries = term.countries.map((country) => {
                            return [country.country_id ? self.countries[country.country_id].country : 'none', country.count]
                        })
                        map_data = array_union_concat_2(map_data, countries, are_equal);
                    });
                    self.total_location_count = map_data.length;
                    self.total_student_count = get_total_student_count(self.term_data_all, self.direction);
                    map_data.splice(0, 0, ['Country', 'Students'])
                }







            } else {


                if(self.selected_sub_affiliation != parseInt(self.opts.tenant_id)){
                    self.term_data = [];
                    self.term_data_all.out.forEach((term) => {
                        let count = 0;
                        term.countries = term.countries.map((country) => {
                            country.affiliations = country.affiliations.filter((affiliation) => {
                                return self.selected_sub_affiliation_ancestors.find((ancestor) => {
                                    return parseInt(affiliation) == ancestor;
                                })
                            })
                            count += country.affiliations.length;
                            country.count = country.affiliations.length;
                            return country;
                        })
                        term.countries = term.countries.filter((country) => {
                            return country.count > 0;
                        })
                        term.count = count
                        const countries = term.countries.map((country) => {
                            return [country.country_id ? self.countries[country.country_id].country : 'none', country.count]
                        })
                        map_data = array_union_concat_2(map_data, countries, are_equal);
                    })
                    self.term_data_all_union = array_union_concat(self.term_data_all.in, self.term_data_all.out, are_equal_2);
                    self.term_data = self.term_data_all_union.map((term) => {
                        return [term.id, term.count]
                    })
                    self.total_student_count = get_total_student_count(self.term_data_all, self.direction);

                    map_data.splice(0, 0, ['Country', 'Students'])
                    self.total_location_count = map_data.length - 1;
                }else{
                    // self.term_data_all_union = array_union_concat(self.term_data_all.in, self.term_data_all.out, are_equal_2);
                    // self.term_data = self.term_data_all_union.map((term) => {
                    //     return [term.id, term.count]
                    // })
                    // self.total_student_count = get_total_student_count(self.term_data_all, self.direction);
                    // self.total_location_count = self.map_data.length - 1;
                    // map_data = self.map_data;

                    function are_equal(g1, g2) {
                        return g1[0] === g2[0];
                    }
                    self.term_data = self.term_data_all.out.map((term) => {
                        return [term.id, term.count]
                    })
                    self.term_data_all.out.forEach((term) => {
                        // term.countries = term.countries.splice(0, 0, ['Country', 'Students']);
                        const countries = term.countries.map((country) => {
                            return [country.country_id ? self.countries[country.country_id].country : 'none', country.count]
                        })
                        map_data = array_union_concat_2(map_data, countries, are_equal);
                    });
                    self.total_location_count = map_data.length;
                    self.total_student_count = get_total_student_count(self.term_data_all, self.direction);
                    map_data.splice(0, 0, ['Country', 'Students'])
                }






            }

            if(self.country_selected_index){
                const map = new google.visualization.GeoChart(self.regions_div);
                const country_selected_student_count = map_data.find((country) => {
                    return country[0] == self.country_selected;
                });
                self.country_selected_student_count = country_selected_student_count ? country_selected_student_count[1] : 0;
                setup_map_clicked(map_data, map, self.map_options);
            }else{
                setup_map_bar(map_data);
                self.term_data.splice(0, 0, ['Term', 'Students'])
                setup_year_chart(self.term_data);
            }

            self.update();
        }


        function get_firebase_paths(paths, callback) {
            let new_paths = [], counter = 0;
            paths.forEach((path) => {
                var xmlHttp = new XMLHttpRequest();
                xmlHttp.onreadystatechange = function (response) {
                    if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                        if (xmlHttp.responseText) {
                            Object.keys(JSON.parse(xmlHttp.responseText)).forEach((key) => {
                                new_paths.push(path + '/' + key)
                            })
                            counter += 1;
                            if (counter === paths.length) {
                                callback(new_paths)
                            }
                        } else {

                        }
                    }
                };
                xmlHttp.open("GET", path + ".json?shallow=true&print=pretty", true);
                xmlHttp.send();
            })

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
                        union[i].count += union[j].count
                        union[i].affiliations = union[i].affiliations.concat(union[j].affiliations)
                        union[i].countries =  union[i].countries.map((country) => {
                            const country_2 = union[j].countries.find((country_found) => {
                                return country_found.country_id == country.country_id;
                            })
                            country.count += country_2 ? country_2.count : 0;
                            country.affiliations = country.affiliations.concat(country_2 && country_2.affiliations ? country_2.affiliations : [])
                            return country;
                        })
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

        self.remove_country = () => {
            //map.setSelection = '';
            self.country_selected = '';
            self.country_selected_index = 0;
            self.update();
            self.change_direction(null, true);
            // setup_map_bar(self.map_data);
            // if (self.direction === 'all') {
            //     function are_terms_equal(g1, g2) {
            //         return g1.id === g2.id;
            //     }
            //
            //     self.term_data_all_union = array_union(self.term_data_all.in, self.term_data_all.out, are_terms_equal);
            //     self.term_data = self.term_data_all_union.map((term) => {
            //         return [term.id, term.count]
            //     })
            // } else if (self.direction === 'in') {
            //     self.term_data = self.term_data_all.in.map((term) => {
            //         return [term.id, term.count]
            //     })
            // } else {
            //     self.term_data = self.term_data_all.out.map((term) => {
            //         return [term.id, term.count]
            //     })
            // }
            // self.term_data.splice(0, 0, ['Term', 'Students'])
            // setup_year_chart(self.term_data);
        }

        const setup_year_chart = (data) => {
            google.charts.setOnLoadCallback(init_charts);

            function init_charts() {


                var line_data = google.visualization.arrayToDataTable(data);
                const line_options = {colors: ['#006747']};
                const line_chart = new google.visualization.LineChart(self.line_chart);
                line_chart.draw(line_data, line_options);
            }
        }

        const setup_map_clicked = (data, map, map_options) => {
            var map_data = google.visualization.arrayToDataTable(data);
            self.update();
            map.draw(map_data, map_options);

            google.visualization.events.addListener(map,
                    'regionClick',
                    (e) => {
                        self.map_options = {
                            region: e.region,
                            backgroundColor: '#ACCCFD',
                        };
                    }
            );
            google.visualization.events.addListener(map,
                    'select',
                    (e) => {
                        if (map.getSelection() && map.getSelection().length) {
                            // const index = map.getSelection()[0].row;
                            self.country_selected_index = map.getSelection()[0].row;
                            self.country_selected = data[self.country_selected_index + 1][0];
                            self.country_selected_student_count = data[self.country_selected_index + 1][1];
                            setup_map_clicked(data, map, self.map_options);

                        }
                    }
            );
            if (self.direction === 'all') {
                function are_terms_equal(g1, g2) {
                    return g1.id === g2.id;
                }

                self.term_data_all_union = array_union(self.term_data_all.in, self.term_data_all.out, are_terms_equal);
                self.term_data = self.term_data_all_union.map((term) => {
                    let my_country = term.countries.find((country)=> {
                        return self.countries[country.country_id].country == self.country_selected;
                    });
                    return [term.id, my_country ? my_country.count : 0]
                })

            } else if (self.direction === 'in') {
                self.term_data = self.term_data_all.in.map((term) => {
                    let my_country = term.countries.find((country)=> {
                        return self.countries[country.country_id].country == self.country_selected;
                    });
                    return [term.id, my_country ? my_country.count : 0]
                })
            } else {
                self.term_data = self.term_data_all.out.map((term) => {
                    let my_country = term.countries.find((country)=> {
                        return self.countries[country.country_id].country == self.country_selected;
                    });
                    return [term.id, my_country ? my_country.count : 0]
                })
            }
            self.term_data.splice(0, 0, ['Term', 'Students'])
            setup_year_chart(self.term_data);
        }

        const setup_map_bar = (data) => {
            google.charts.setOnLoadCallback(init_charts);

            function init_charts() {


                var map_data = google.visualization.arrayToDataTable(data);
                let bar_data_pre = [];
                data.forEach((country_and_count, index) => {
                    if (index > 0) {
                        let add_in_at = bar_data_pre.length;
                        bar_data_pre.forEach((country_and_count_2, index) => {
                            add_in_at = country_and_count[1] > country_and_count_2[1] ? add_in_at > index && add_in_at !== 0 ? index : add_in_at : 10;
                        })
                        if (add_in_at < 5) {
                            bar_data_pre.splice(add_in_at, 0, country_and_count)
                            if (bar_data_pre.length > 5) {
                                bar_data_pre.pop();
                            }
                        }
                    }
                })
                bar_data_pre.splice(0, 0, ['Country', 'Students'])
                var bar_data = google.visualization.arrayToDataTable(bar_data_pre);

                var map_options = {
                    // region: '002', // Africa
                    // colorAxis: {colors: ['#00853f', 'black', '#e31b23']},
                    backgroundColor: '#ACCCFD',
                    // datalessRegionColor: '#f8bbd0',
                    // defaultColor: '#f5f5f5',
                };
                const bar_options = {colors: ['#006747']};
                const map = new google.visualization.GeoChart(self.regions_div);
                map.draw(map_data, map_options);

                google.visualization.events.addListener(map,
                        'regionClick',
                        (e) => {
                            self.map_options = {
                                region: e.region,
                                backgroundColor: '#ACCCFD',
                            };
                        }
                );
                google.visualization.events.addListener(map,
                        'select',
                        (e) => {
                            if (map.getSelection() && map.getSelection().length) {
                                // const index = map.getSelection()[0].row;
                                self.country_selected_index = map.getSelection()[0].row;
                                self.country_selected = data[self.country_selected_index + 1][0];
                                self.country_selected_student_count = data[self.country_selected_index + 1][1];
                                setup_map_clicked(data, map, self.map_options);

                            }
                        }
                );


                const bar_chart = new google.visualization.ColumnChart(self.bar_chart);
                bar_chart.draw(bar_data, bar_options);
            }
        }
        self.count_data = [];
        self.count_indexes = [];
        self.map_data = [['Country', 'Students']];
        self.term_data = [['Term', 'Students']];
        self.term_data_all = {in: [], out: []};
        self.total_location_count = 0;
        self.total_student_count = 0;
        self.countries;

        const get_total_student_count = (term_data_all, direction) => {
            let count = 0;
            if(direction === 'all'){
                term_data_all.in.forEach((term) => {
                    count += term.count;
                })
                term_data_all.out.forEach((term) => {
                    count += term.count;
                })
            }else if(direction === 'in'){
                term_data_all.in.forEach((term) => {
                    count += term.count;
                })
            }else{
                term_data_all.out.forEach((term) => {
                    count += term.count;
                })
            }
            return count;
        }

        const onlyUnique = (value, index, self) => {
            return self.indexOf(value) === index;
        }

        self.sub_affiliations_level_1_selected = (affiliation_id) => {
            let indexes = [];
            self.sub_affiliations_level_1_id = affiliation_id;
            self.selected_sub_affiliation = self.sub_affiliations_level_1[affiliation_id]._id;
            self.sub_affiliations_level_1_tenant_id = self.selected_sub_affiliation;
            if(self.selected_sub_affiliation){
                self.selected_sub_affiliation_ancestors = [];
                self.selected_sub_affiliation_ancestors_level_1 = [];




                let sub_affiliations_ancestors = JSON.parse(JSON.stringify(self.sub_affiliations_ancestors))
                self.sub_affiliations_level_2 = sub_affiliations_ancestors.filter((affiliation, index) => {
                    if(affiliation && affiliation.ancestors.find((ancestor) => {
                                if(ancestor == parseInt(self.selected_sub_affiliation)){
                                    return true;
                                }else{
                                    return false;
                                }
                            })){
                        // affiliation._id ? self.selected_sub_affiliation_ancestors_level_1.push(affiliation._id) : null;
                        return_true = affiliation.ancestors.length == 2;

                        affiliation.ancestors.pop();

                        affiliation.ancestors.pop();

                        affiliation.ancestors ? self.selected_sub_affiliation_ancestors_level_1 = self.selected_sub_affiliation_ancestors_level_1.concat(affiliation.ancestors) : null;

                        if(return_true){
                            indexes.push(index);
                            return true;
                        }else{
                            return false
                        }
                    }else{
                        return false;
                    }
                    // return affiliation.ancestors.length == 2 ? affiliation.ancestors.find((ancestor) => {
                    //     if(ancestor == parseInt(self.selected_sub_affiliation)){
                    //         indexes.push(index);
                    //         return true;
                    //     }else{
                    //         return false;
                    //     }
                    // }) : false
                }).map((ancestor, index) => {
                    ancestor._id = parseInt(indexes[index]);
                    ancestor.title = self.sub_affiliations[ancestor._id].establishment;
                    return ancestor;
                })
                self.sub_affiliations_level_2.push(self.selected_sub_affiliation);
                self.selected_sub_affiliation_ancestors_level_1.push(self.selected_sub_affiliation);
                self.selected_sub_affiliation_ancestors_level_1 = self.selected_sub_affiliation_ancestors_level_1.filter( onlyUnique );
                self.selected_sub_affiliation_ancestors = self.selected_sub_affiliation_ancestors_level_1;
            }else{
                self.sub_affiliations_level_2_id = 0;
                self.sub_affiliations_level_2 = [];
                self.sub_affiliations_level_3_id = 0;
                self.sub_affiliations_level_3 = [];
                self.selected_sub_affiliation = self.opts.tenant_id;
                self.selected_sub_affiliation_ancestors = [];
                self.selected_sub_affiliation_ancestors_level_1 = [];
                // self.side_bar_filter._tag.sub_affiliations_level_2_ddl._tag.opts.selected_item_id = self.sub_affiliations_level_2_id.toString();
                // self.side_bar_filter._tag.sub_affiliations_level_2_ddl._tag.update();
            }

            self.sub_affiliations_level_2.splice(0, 1, {title: 'Select sub-affiliation', _id: 0})
            // self.side_bar_filter._tag.sub_affiliations_level_2_ddl._tag.opts.list = self.sub_affiliations_level_2;
            // self.side_bar_filter._tag.sub_affiliations_level_2_ddl._tag.opts.selected_callback = self.sub_affiliations_level_2_selected;
            // self.side_bar_filter._tag.update();
            self.change_direction(null, true);
            self.update();
        }

        self.sub_affiliations_level_2_selected = (affiliation_id) => {
            let indexes = [];
            self.sub_affiliations_level_2_id = affiliation_id;
            self.selected_sub_affiliation = self.sub_affiliations_level_2[affiliation_id]._id;
            self.sub_affiliations_level_2_tenant_id = self.selected_sub_affiliation;
            if(self.selected_sub_affiliation){
                self.selected_sub_affiliation_ancestors = [];
                self.selected_sub_affiliation_ancestors_level_2 = [];
                let sub_affiliations_ancestors = JSON.parse(JSON.stringify(self.sub_affiliations_ancestors))
                self.sub_affiliations_level_3 = sub_affiliations_ancestors.filter((affiliation, index) => {
                    if(affiliation && affiliation.ancestors.find((ancestor) => {
                                if(ancestor == parseInt(self.selected_sub_affiliation)){
                                    return true;
                                }else{
                                    return false;
                                }
                            })){

                        return_true = affiliation.ancestors.length == 3;
                        affiliation.ancestors.pop();
                        affiliation.ancestors.pop();
                        affiliation.ancestors ? self.selected_sub_affiliation_ancestors_level_2 = self.selected_sub_affiliation_ancestors_level_2.concat(affiliation.ancestors) : null;

                        if(return_true){
                            indexes.push(index);
                            return true;
                        }else{
                            return false
                        }
                    }else{
                        return false;
                    }
                }).map((ancestor, index) => {
                    ancestor._id = parseInt(indexes[index]);
                    ancestor.title = self.sub_affiliations[ancestor._id].establishment;
                    return ancestor;
                })
                self.sub_affiliations_level_3.push(self.selected_sub_affiliation);
                self.selected_sub_affiliation_ancestors_level_2.push(self.selected_sub_affiliation);
                self.selected_sub_affiliation_ancestors_level_2 = self.selected_sub_affiliation_ancestors_level_2.filter( onlyUnique );
                self.selected_sub_affiliation_ancestors = self.selected_sub_affiliation_ancestors_level_2;
            }else{
                self.sub_affiliations_level_3_id = 0;
                self.sub_affiliations_level_3 = [];
                self.selected_sub_affiliation = self.sub_affiliations_level_1_tenant_id;
                // self.selected_sub_affiliation = self.opts.tenant_id;
                self.selected_sub_affiliation_ancestors = self.selected_sub_affiliation_ancestors_level_1;
                self.selected_sub_affiliation_ancestors_level_2 = [];
            }
            self.sub_affiliations_level_3.splice(0, 2, {title: 'Select sub-affiliation', _id: 0})
            self.change_direction(null, true);
            self.update();
        }


        // self.sub_affiliations_level_2_selected_old = (affiliation_id) => {
        //     let indexes = [];
        //     self.sub_affiliations_level_2_id = affiliation_id;
        //     self.selected_sub_affiliation = self.sub_affiliations_level_2[affiliation_id]._id;
        //     self.sub_affiliations_level_2_tenant_id = self.selected_sub_affiliation;
        //     if(self.selected_sub_affiliation){
        //         self.sub_affiliations_level_3 = self.sub_affiliations_ancestors.filter((affiliation, index) => {
        //             return affiliation.ancestors.length == 3 ? affiliation.ancestors.find((ancestor) => {
        //                 if(ancestor == parseInt(self.selected_sub_affiliation)){
        //                     indexes.push(index);
        //                     return true;
        //                 }else{
        //                     return false;
        //                 }
        //             }) : false
        //         }).map((ancestor, index) => {
        //             ancestor._id = parseInt(indexes[index]);
        //             ancestor.title = self.sub_affiliations[ancestor._id].establishment;
        //             return ancestor;
        //         })
        //     }else{
        //         self.selected_sub_affiliation = self.sub_affiliations_level_1_tenant_id;
        //         self.sub_affiliations_level_3_id = 0;
        //         self.sub_affiliations_level_3 = [];
        //         // self.side_bar_filter._tag.sub_affiliations_level_3_ddl._tag.opts.selected_item_id = self.sub_affiliations_level_3_id;
        //     }
        //     self.sub_affiliations_level_3.splice(0, 1, {title: 'Select sub-affiliation', _id: 0})
        //     // self.side_bar_filter._tag.sub_affiliations_level_3_ddl._tag.opts.list = self.sub_affiliations_level_3;
        //     // self.side_bar_filter._tag.sub_affiliations_level_3_ddl._tag.opts.selected_callback = self.sub_affiliations_level_3_selected;
        //     // self.side_bar_filter._tag.update();
        //     self.update();
        // }

        self.sub_affiliations_level_3_selected = (affiliation_id) => {
            let indexes = [];
            self.sub_affiliations_level_3_id = affiliation_id;
            self.selected_sub_affiliation = self.sub_affiliations_level_3[affiliation_id]._id;
            self.sub_affiliations_level_3_tenant_id = self.selected_sub_affiliation;
            if(self.selected_sub_affiliation){
                self.selected_sub_affiliation_ancestors = [];
                self.selected_sub_affiliation_ancestors_level_3 = [];
                let sub_affiliations_ancestors = JSON.parse(JSON.stringify(self.sub_affiliations_ancestors))
                sub_affiliations_ancestors.forEach((affiliation, index) => {
                    if(affiliation && affiliation.ancestors.find((ancestor) => {
                                if(ancestor == parseInt(self.selected_sub_affiliation)){
                                    return true;
                                }else{
                                    return false;
                                }
                            })){

                        affiliation.ancestors.pop();
                        affiliation.ancestors.pop();
                        affiliation.ancestors ? self.selected_sub_affiliation_ancestors_level_3 = self.selected_sub_affiliation_ancestors_level_3.concat(affiliation.ancestors) : null;

                    }
                })
                // self.sub_affiliations_level_4 = [self.selected_sub_affiliation];
                self.selected_sub_affiliation_ancestors_level_3.push(self.selected_sub_affiliation);
                self.selected_sub_affiliation_ancestors_level_3 = self.selected_sub_affiliation_ancestors_level_3.filter( onlyUnique );
                self.selected_sub_affiliation_ancestors = self.selected_sub_affiliation_ancestors_level_3;
            }else{
                // self.sub_affiliations_level_4_id = 0;
                // self.sub_affiliations_level_4 = [];
                self.selected_sub_affiliation = self.sub_affiliations_level_2_tenant_id;
                // self.selected_sub_affiliation = self.opts.tenant_id;
                // self.selected_sub_affiliation_ancestors = [];
                self.selected_sub_affiliation_ancestors = self.selected_sub_affiliation_ancestors_level_2;
                self.selected_sub_affiliation_ancestors_level_3 = [];
            }
            // self.sub_affiliations_level_4.splice(0, 3, {title: 'Select sub-affiliation', _id: 0})
            self.change_direction(null, true);
            self.update();
        }
        self.sub_affiliations_level_3_selected_old = (affiliation_id) => {
            let indexes = [];
            self.sub_affiliations_level_3_id = affiliation_id;

            self.selected_sub_affiliation = self.sub_affiliations_level_3[affiliation_id]._id;
            self.selected_sub_affiliation = self.selected_sub_affiliation ? self.selected_sub_affiliation : self.sub_affiliations_level_2_tenant_id;
            // self.sub_affiliations_level_3 = self.sub_affiliations_ancestors.filter((affiliation, index) => {
            //     return affiliation.ancestors.length == 3 ? affiliation.ancestors.find((ancestor) => {
            //         if(ancestor == parseInt(new_index)){
            //             indexes.push(index);
            //             return true;
            //         }else{
            //             return false;
            //         }
            //     }) : false
            // }).map((ancestor, index) => {
            //     ancestor._id = parseInt(indexes[index]);
            //     ancestor.title = self.sub_affiliations[ancestor._id].establishment;
            //     return ancestor;
            // })

            // self.side_bar_filter._tag.sub_affiliations_level_3_ddl._tag.opts.list = self.sub_affiliations_level_3;
            // self.side_bar_filter._tag.sub_affiliations_level_3_ddl._tag.opts.selected_callback = self.sub_affiliations_level_3_selected;
            // self.side_bar_filter._tag.update();
            self.update();
        }

        self.on('mount', function () {
            self.selected_sub_affiliation = self.opts.tenant_id;
            google.charts.load('current', {'packages': ['corechart', 'geochart', 'bar', 'line']});

            const fire_ref_countries = new Firebase("https://UCosmic.firebaseio.com/Places/Countries")
            fire_ref_countries.on("value", function (snapshot) {
                self.countries = snapshot.val();
            });

            const data_list_stream = Kefir.sequentially(0, [{url: "https://UCosmic.firebaseio.com/Members/" + self.opts.tenant_id + "/Mobilities/Counts/OUT", direction: 'out'}
                , {url: "https://UCosmic.firebaseio.com/Members/" + self.opts.tenant_id + "/Mobilities/Counts/IN", direction: 'in'}])
            // console.log(Date.now());
            const fire_stream = data_list_stream.flatMap(function (data_url) {
                var fire_ref = new Firebase(data_url.url);
                return Kefir.stream(function (emitter) {
                    fire_ref.on("child_added", function (snapshot) {
                        emitter.emit({snapshot: snapshot, direction: data_url.direction});
                    });
                })
            });

            const setup_count_arrays = (counts, term) => {
                if (self.countries) {
                    for (const name in counts) {
                        if (counts.hasOwnProperty(name)) {
                            const parsed_name = parseInt(name);
                            const country_name = self.countries[name] ? self.countries[name].country : 'none';
                            const index = self.count_indexes[parsed_name] !== undefined ? self.count_indexes[parsed_name] : -1;
                            if (index > -1) {
                                self.map_data[index][1] += parseInt(counts[name].count);
                                // self.count_indexes[parsed_name] = self.map_data.length - 1;
                            } else {
                                self.map_data.push([country_name, parseInt(counts[name].count)]);
                                self.count_indexes[parsed_name] = self.map_data.length - 1;
                            }
                            self.count_data.push({id: parsed_name, count: parseInt(counts[name].count), affiliations: counts[name].affiliation, term: term});
                        }
                    }
                    self.total_location_count = self.map_data.length - 1;
                    setup_map_bar(self.map_data);
                } else {
                    setTimeout(()=> {
                        setup_count_arrays(counts, term);
                    }, 50)
                }
            }

            const setup_count_arrays_terms = (counts, term, term_data, term_data_all, direction) => {
                let count = 0;
                let affiliations = [];
                // let term_data = [['Term', 'Students']];
                // let term_data_all = [];
                let term_affiliations = [];
                let term_countries = [];
                // let term_directions = [];
                for (const name in counts) {
                    if (counts.hasOwnProperty(name)) {
                        count += parseInt(counts[name].count);
                        term_countries.push({country_id: parseInt(name), count: parseInt(counts[name].count), affiliations: counts[name].affiliation})
                        term_affiliations = term_affiliations.concat(counts[name].affiliation);
                        // term_directions.push(direction);
                    }
                }
                let index = 0;
                const my_term = term_data.find((term_2, i) => {
                    index = i;
                    return term_2[0] == term;
                })
                if (my_term) {
                    term_data[index][1] += count;
                    term_data_all[direction][index - 1] = {id: term, count: count, affiliations: term_affiliations, countries: term_countries}
                    // term_data_all[direction][index - 1] = {id: term, count: term_data[index][1], affiliations: term_affiliations, countries: term_countries}
                    // term_data_all.push({id: term, count: term_data[index][1], affiliations: term_affiliations});
                } else {
                    term_data.push([term, count])
                    term_data_all[direction].push({id: term, count: count, affiliations: term_affiliations, countries: term_countries});
                }
                return {term_data: term_data, term_data_all: term_data_all};
            }


            // function array_union_concat_3(arr1, arr2, equalityFunc) {
            //     arr1 = JSON.parse(JSON.stringify(arr1));
            //     arr2 = JSON.parse(JSON.stringify(arr2));
            //     // var union = arr1.concat(arr2);
            //     //
            //     // for (var i = 0; i < union.length; i++) {
            //     //     for (var j = i + 1; j < union.length; j++) {
            //     //         if (equalityFunc(union[i], union[j])) {
            //     //             union[i] ? null : union[i] = {affiliation: []};
            //     //             union[i].affiliation.concat(union[j].affiliation);
            //     //
            //     //             union.splice(j, 1);
            //     //             j--;
            //     //         }
            //     //     }
            //     // }
            //
            //     arr1 = arr1.map((value, index) => {
            //         value ? null : value = {affiliation: []};
            //         arr2[index] && arr2[index].affiliation  ? null : arr2[index] = {affiliation: []}
            //         value.affiliation = value.affiliation.concat(arr2[index].affiliation)
            //         return value;
            //     })
            //     return arr1;
            // }

            fire_stream.onValue(function (data) {

                const terms_data = setup_count_arrays_terms(data.snapshot.val().countries, data.snapshot.key(), self.term_data, self.term_data_all, data.direction);
                self.term_data = terms_data.term_data;
                self.term_data_all = terms_data.term_data_all;
                self.term_data_all_original = terms_data.term_data_all;
                self.total_student_count = get_total_student_count(self.term_data_all, self.direction);
                setup_year_chart(self.term_data);

                setup_count_arrays(data.snapshot.val().countries, data.snapshot.key());

                // I need to take data.snapshot.val().countries and use a new union concat for it, once I have that and an affiliaiton is selected
                // countries_data_all = [];
                // Object.keys(data.snapshot.val().countries).forEach(key =>countries_data_all[parseInt(key)] = data.snapshot.val().countries[key]);
                // function are_equal(g1, g2) {
                //     return g1 || g2;
                // }
                // self.countries_data_all = array_union_concat_3(countries_data_all, self.countries_data_all,  are_equal)
                // I need to create a new list of sub affiliation ids and the selected affiliation id,
                // then I need to filter the list of countries with the list of sub affiliations, and use .lenth to get count


                self.update();
            });




            var fire_ref_est = new Firebase("https://UCosmic.firebaseio.com/Establishments/Establishments/");
            var fire_ref_est_ances = new Firebase("https://UCosmic.firebaseio.com/Establishments/Establishments_Ancestors/");


            const sub_affiliations_level_1_get = () => {
                if(self.sub_affiliations && self.sub_affiliations.length > 0 && self.sub_affiliations_ancestors && self.sub_affiliations_ancestors.length > 0){
                    let indexes = [];
                   self.sub_affiliations_level_1 = self.sub_affiliations_ancestors.filter((affiliation, index) => {
                       // affiliation.establishment = affiliation.establishment.indexOf(', ') > -1 ? affiliation.establishment.substr(1, affiliation.establishment.indexOf(', ')) : affiliation.establishment;
                        return affiliation.ancestors.length == 1 ? affiliation.ancestors.find((ancestor) => {
                            if(ancestor == parseInt(self.opts.tenant_id)){
                                indexes.push(index);
                                return true;
                            }else{
                                return false;
                            }
                        }) : false
                    }).map((ancestor, index) => {
                       ancestor._id = parseInt(indexes[index]);
                       ancestor.title = self.sub_affiliations[ancestor._id].establishment;
                       return ancestor;
                   })
                    self.sub_affiliations_level_1.splice(0, 1, {title: 'Select sub-affiliation', _id: 0})
                    self.side_bar_filter._tag.sub_affiliations_level_1_ddl._tag.opts.list = self.sub_affiliations_level_1;
                    self.side_bar_filter._tag.sub_affiliations_level_1_ddl._tag.opts.selected_callback = self.sub_affiliations_level_1_selected;
                    self.update();
                }
            }


            fire_ref_est.on("value", function (snapshot) {
                const sub_affiliations = snapshot.val();
                self.sub_affiliations = [];
                Object.keys(sub_affiliations).forEach(key =>self.sub_affiliations[parseInt(key)] = sub_affiliations[key]);
                self.sub_affiliations.map((affiliation, index) => {
                    affiliation.establishment = affiliation.establishment.indexOf(', ') > -1 ? affiliation.establishment.substr(0, affiliation.establishment.indexOf(', ')) : affiliation.establishment;
                    return affiliation;
                })
                sub_affiliations_level_1_get();
                // const est_ances_stream = Kefir.stream(function (emitter) {
                //     fire_ref_est_ances.on("child_added", function (snapshot) {
                //         emitter.emit(snapshot);
                //     });
                // })

                // est_ances_stream.onValue(function (snapshot) {
                //     const index = parseInt(snapshot.key());
                //     const ancestors = snapshot.val().ancestors;
                //     self.sub_affiliations[index].ancestors = ancestors;
                //     let new_index = 0;
                //     self.sub_affiliations_level_1 = self.sub_affiliations.filter((affiliation, i) => {
                //         // if(affiliation.ancestors && affiliation.ancestors.length > 1){
                //         //     const test = affiliation.ancestors.find((ancestor) => { return ancestor == parseInt(self.opts.tenant_id)})
                //         //     return test;
                //         // }else{
                //         //     return false
                //         // }
                //
                //         return affiliation.ancestors && affiliation.ancestors.length == 1 ? affiliation.ancestors.find((ancestor) => {
                //             if(ancestor == parseInt(self.opts.tenant_id)){
                //                 new_index = i;
                //                 return true;
                //             }else{
                //                 return false;
                //             }
                //         }) : false
                //     }).map((affiliation) => {
                //         affiliation._id = new_index;
                //         affiliation.title = affiliation.establishment;
                //         return affiliation;
                //     })
                //     self.update();
                // });
                //one level deep should have 1 ancestor only
                //2 levels deep should have 2 ancestors only
                //etc
                //so for 3306, find ones that only have 3306
                // for tampa_id, find ones with tampa and 3306 only
            });

            fire_ref_est_ances.on("value", function (snapshot) {
                const sub_affiliations = snapshot.val();
                self.sub_affiliations_ancestors = [];
                Object.keys(sub_affiliations).forEach(key =>self.sub_affiliations_ancestors[parseInt(key)] = sub_affiliations[key]);
                sub_affiliations_level_1_get();

                // est_ances_stream.onValue(function (snapshot) {
                //     const index = parseInt(snapshot.key());
                //     const ancestors = snapshot.val().ancestors;
                //     self.sub_affiliations[index].ancestors = ancestors;
                //     let new_index = 0;
                //     self.sub_affiliations_level_1 = self.sub_affiliations.filter((affiliation, i) => {
                //         return affiliation.ancestors && affiliation.ancestors.length == 1 ? affiliation.ancestors.find((ancestor) => {
                //             if(ancestor == parseInt(self.opts.tenant_id)){
                //                 new_index = i;
                //                 return true;
                //             }else{
                //                 return false;
                //             }
                //         }) : false
                //     }).map((affiliation) => {
                //         affiliation._id = new_index;
                //         affiliation.title = affiliation.establishment;
                //         return affiliation;
                //     })
                //     self.update();
                // });
                //one level deep should have 1 ancestor only
                //2 levels deep should have 2 ancestors only
                //etc
                //so for 3306, find ones that only have 3306
                // for tampa_id, find ones with tampa and 3306 only
            });


            // var worker = new Worker('/components_riot/components/workers/firebase_sync.js');
            //
            // worker.addEventListener('message', function (e) {
            //     const data = JSON.parse(e.data);
            // }, false);
            // //https://ucosmic.firebaseio.com/Members/3306/Mobilities/Values/OUT
            //
            // callback = (firebase_paths) => {
            //     worker.postMessage(JSON.stringify({paths:firebase_paths, tenant_id: self.opts.tenant_id}));
            //
            //     setTimeout(function () {
            //         let db = new PouchDB('students_' + self.opts.tenant_id);
            //         db.allDocs({
            //             include_docs: true
            //         }).then(function (result) {
            //             console.log(Date.now())
            //         }).catch(function (err) {
            //             console.log(err);
            //         });
            //         console.log(Date.now())
            //     },30000);
            // }
            //
            // get_firebase_paths(["https://UCosmic.firebaseio.com/Members/" + self.opts.tenant_id + "/Mobilities/Values/OUT"
            //     ,"https://UCosmic.firebaseio.com/Members/" + self.opts.tenant_id + "/Mobilities/Values/IN"], callback)

        })


    </script>
</student_map>