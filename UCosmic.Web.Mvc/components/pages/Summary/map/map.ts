/// <reference path="../../../../scripts/typings/lodash.d.ts" />
/// <reference path="../../../typediff/mytypes.d.ts" />
//class activityCount{
//    locationCount: number;
//    type: string;
//    typeCount: number;
//    constructor(type: string = "", typeCount: number = 0, locationCount: number = 0){
//        this.type = type;
//        this.typeCount = typeCount;
//        this.locationCount = locationCount;    }

//} 


Polymer('is-page-summary-map', {
    isAjaxing: false,
    color: function (c, n, i, d) { for (i = 3; i--; c[i] = d < 0 ? 0 : d > 255 ? 255 : d | 0)d = c[i] + n; return c },
    activity_location_counts: [],
    agreement_location_counts: [],
    degree_location_counts: [],
    establishmentSearch: "",
    selectedCountry: 0,
    selectedCountryCode: 'any',
    selectedPlaceId: 0,
    expertiseCountLoaded: false,
    affiliationCountLoaded: false,
    lastEstablishmentSearch: "",
    selectedEstablishmentId: 0,
    is_showing_detail: false,
    countries_showing_details: [],

    data_loaded: { agreements_loaded: 0, activities_loaded: 0, degrees_loaded: 0 },
    ready: function () {

        var observer = new ObjectObserver(this.data_loaded);
        observer.open((added, removed, changed, getOldValueFn) => {
            // respond to changes to the obj.
            //Object.keys(added).forEach(function (property) {
            //    property; // a property which has been been added to obj
            //    added[property]; // its value
            //});
            //Object.keys(removed).forEach(function (property) {
            //    property; // a property which has been been removed from obj
            //    getOldValueFn(property); // its old value
            //});
            Object.keys(changed).forEach((property) => {
                //property; // a property on obj which has changed value.
                //getOldValueFn(property); // its old value
                //changed[property]; // its value
                if (this.data_loaded.agreements_loaded == 1 && this.data_loaded.activities_loaded == 1 && this.data_loaded.degrees_loaded == 1) {
                    this.setupMapFilters();
                }
            });
        });
    },
    domReady: function () {
        this.setup_mouse_tracer();
    },
    mouseX: function (evt) {
        if (!evt) evt = window.event;
        if (evt.pageX) return evt.pageX;
        else if (evt.clientX) return evt.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
        else return 0;
    },
    mouseY: function (evt) {
        if (!evt) evt = window.event;
        if (evt.pageY) return evt.pageY;
        else if (evt.clientY) return evt.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
        else return 0;
    },
    setup_mouse_tracer: function () {

        // Simple follow the mouse script

        // (must be position:absolute)
        var offX = 15;          // X offset from mouse position
        var offY = 15;          // Y offset from mouse position

        //function mouseX(evt) { if (!evt) evt = window.event; if (evt.pageX) return evt.pageX; else if (evt.clientX) return evt.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft); else return 0; }
        //function mouseY(evt) { if (!evt) evt = window.event; if (evt.pageY) return evt.pageY; else if (evt.clientY) return evt.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop); else return 0; }

        document.addEventListener("mousemove",(evt) => {
            //if (!this.is_showing_detail) {
            var obj = this.$.info_box.style;
            //obj.visibility = 'visible';
            obj.left = (parseInt(this.mouseX(evt)) + offX) + 'px';
            obj.top = (parseInt(this.mouseY(evt)) + offY) + 'px';
            //}
        });
    },
    setupMapFilters: function () {


        var map = new google.maps.Map(this.$.map_canvas, {
            center: new google.maps.LatLng(30, 0),
            zoom: 2,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }), map_styles = [
                {
                    "featureType": "landscape.natural.landcover",
                    "stylers": [
                        { "color": "#1d8080" },
                        { "visibility": "off" }
                    ]
                }, {
                    "featureType": "landscape.natural.terrain",
                    "stylers": [
                        { "visibility": "off" }
                    ]
                }, {
                    "featureType": "administrative",
                    "stylers": [
                        { "visibility": "off" }
                    ]
                }
            ];
        map.setOptions({ styles: map_styles });
        map.data.loadGeoJson('/content/countries/ne-countries-110m.json');
        //map.data.setStyle({
        //    fillColor: 'transparent',
        //    strokeWeight: .5
        //});
        //map.data.loadGeoJson('https://storage.googleapis.com/maps-devrel/google.json');
        var biggest_country = 0;
        //var biggest_agreement = 0;

        var total_count: any;

        var total_count = JSON.parse(JSON.stringify(this.activity_location_counts))//copy object.
        //add agreement counts to location copy
        this.agreement_location_counts.forEach((value, index, test) => {
            var my_index = 0;
            var activity = total_count.filter(function (value2, index2, test2) {
                if (value2.countryCode != value.countryCode) {
                    return false;
                } else {
                    my_index = index2
                    return true;
                }
            })[0];
            if (activity) {
                total_count[my_index].locationCount = activity.locationCount + value.locationCount;
            } else {
                total_count.push(value);
            }
        });
        
        //add degree counts to location copy
        this.degree_location_counts.forEach((value, index, test) => {
            var my_index = 0;
            var activity = total_count.filter(function (value2, index2, test2) {
                if (value2.countryCode != value.countryCode) {
                    return false;
                } else {
                    my_index = index2
                    return true;
                }
            })[0];
            if (activity) {
                total_count[my_index].locationCount = activity.locationCount + value.locationCount;
            } else {
                total_count.push(value);
            }
        });

        total_count.forEach((value, index, test) => {
            if (value.locationCount > biggest_country && value.countryCode != null) {
                biggest_country = value.locationCount;
            }
        });

        map.data.setStyle((feature) => {
            var countryCode = feature.getProperty('iso_a2');//feature.B;
            //var country = this.activity_location_counts.indexOf(countryCode);
            var activity = null;
            var agreement = null;
            var degree = null;
            var total = null;
            if (countryCode) {
                activity = this.activity_location_counts.filter(function (value, index, test) {
                    if (value.countryCode != countryCode) {
                        return false;
                    } else {
                        return true;
                    }
                })[0];
                total = total_count.filter(function (value, index, test) {
                    if (value.countryCode != countryCode) {
                        return false;
                    } else {
                        return true;
                    }
                })[0];
                agreement = this.agreement_location_counts.filter(function (value, index, test) {
                    if (value.countryCode != countryCode) {
                        return false;
                    } else {
                        return true;
                    }
                })[0];
                degree = this.degree_location_counts.filter(function (value, index, test) {
                    if (value.countryCode != countryCode) {
                        return false;
                    } else {
                        return true;
                    }
                })[0];
            }
            var color = 'transparent';
            if (activity) {
                var percent = (total.locationCount) / biggest_country;
                if (percent < .01) {
                    percent = 0.01;
                }

                //feature.setProperty('activity_count', activity ? activity.locationCount : 0);
                //feature.setProperty('total_count', total ? total.locationCount : 0);
                //feature.setProperty('agreement_count', agreement? agreement.locationCount : 0);
                //feature.setProperty('degree_count', degree ? degree.locationCount : 0);

                //percent = percent * 100;
                //color = 'rgb(200, 255, 200)';
                //var colorArray = color.replace("rgb(", "").replace(")", "").split(", ").map(function (x) {
                //    return parseFloat(x);
                //});
                //var colorTemp = this.color(colorArray,(percent * -1));
                //colorTemp = this.color(colorArray,(percent * -1));
                //color = 'rgb(' + colorTemp.join() + ')';

                percent = ((90 * percent) + 10) / 100;
                var percentString = percent.toFixed(2);
                color = 'rgba(0, 55, 0, ' + percentString + ')';
            }// else {
            feature.setProperty('activity_count', activity ? activity.locationCount : 0);
            feature.setProperty('total_count', total ? total.locationCount : 0);
            feature.setProperty('agreement_count', agreement ? agreement.locationCount : 0);
            feature.setProperty('degree_count', degree ? degree.locationCount : 0);
            //}

            //use featuer.setProperty to set the agreements count and activities count *********************************************


            //var color = 'gray';
            //if (feature.getProperty('isColorful')) {
            //    color = feature.getProperty('color');
            //}else{
            //    color = 'transparent';
            //}
            //return /** @type {google.maps.Data.StyleOptions} */({
            //    fillColor: color,
            //    strokeColor: 'gray',
            //    strokeWeight: 1
            //});
            return /** @type {google.maps.Data.StyleOptions} */({
                fillColor: color,
                strokeWeight: 1,
                strokeOpacity: 0.50,
                fillOpacity: 1
            });
        });
        // Set the fill color to red when the feature is clicked.
        // Stroke weight remains 3.

        map.addListener('bounds_changed',(event) => {
            this.$.info_box_detail_container.innerHTML = ""
            this.countries_showing_details = [];
        });

        map.data.addListener('click',(event) => {

            var country_name = event.feature.getProperty('name');
            if (this.countries_showing_details.indexOf(country_name) > -1) {
                return;
            }
            this.countries_showing_details.push(country_name);

            var elementContainer = this.$.info_box_detail_container;
            var element:any = document.createElement("is-popup");
            
            ////element.style.backgroundColor = 'lightgray';
            ////element.style.position = 'absolute';
            ////element.style.padding = '5px';
            ////element.style.borderRadius = '8px';
            ////element.style.fontSize = '18px';
            ////element.style.display = 'block';
            ////element.setAttribute('id', '
            //element.setAttribute('draggable', 'true');
            //element.classList.add('popup');
            //var elementClose = document.createElement("span");

            ////elementClose.style.backgroundColor = 'darkgray';
            ////elementClose.style.position = 'absolute';
            ////elementClose.style.padding = '5px';
            ////elementClose.style.borderRadius = '8px';
            ////elementClose.style.display = 'block';
            ////elementClose.style.top = '4px';
            ////elementClose.style.right = '4px';
            //elementClose.classList.add('close');
            //elementClose.textContent = 'X';
            //elementClose.setAttribute('data-type', 'close');
            //element.appendChild(elementClose);

            elementContainer.appendChild(element);

            element.addEventListener('close', (event) => {
                this.countries_showing_details.pop(event.target.country_name);
                
            }, false)

            //element.addEventListener('dragstart', this.drag_start, false);
            //document.body.addEventListener('dragover', this.drag_over, false);
            //document.body.addEventListener('drop', this.drop, false); 

            ////javascript closure :<) - used to capture country name and containing element
            //(() => {
            //    var el: any = element, cn = country_name;
            //    this.$.info_box_detail_container.addEventListener("click",(evt) => {
            //        if (evt.target.dataset.type == 'close') {
            //            el.remove();
            //            //evt.target.parentElement.remove();
            //            //element.remove();
            //            this.countries_showing_details.pop(cn);
            //        }
            //    });
            //})()
            var country = _.find(this.countries, function (place: any, index: any) {
                return place.code == event.feature.getProperty('iso_a2');
            })
            element.country_name = country_name;
            element.content = event.feature.getProperty('name') + "<br /><a href='/summary/report/#!/" + event.feature.getProperty('iso_a2') + "'>Total: " + event.feature.getProperty('total_count') + "</a>"
            + "<br /><a href='/" + this.styledomain + "/agreements/#/table/country/" + event.feature.getProperty('iso_a2') + "/type/any/sort/start-desc/size/10/page/1/'>Agreements: " + event.feature.getProperty('agreement_count') + "</a>"
            + "<br /><a href='/" + this.styledomain + "/employees/table/?placeIds=" + country.id + "&placeNames='>Activities: " + event.feature.getProperty('activity_count') + "</a>"
            + "<br /><a href='/" + this.styledomain + "/employees/degrees/table/?countryCode=" + event.feature.getProperty('iso_a2') + "'>Degrees: " + event.feature.getProperty('degree_count') + "</a>";

            this.countries_showing_details = _.union(this.countries_showing_details, [event.feature.getProperty('name')]);
            
            //this.is_showing_detail = true;
            //map.data.overrideStyle(event.feature, { fillColor: 'transparent' });
            //event.feature.setProperty('isColorful', true);

            var offX = 15;          // X offset from mouse position
            var offY = 15;          // Y offset from mouse position
            
            //obj.visibility = 'visible';
            element.style.left = (parseInt(this.mouseX(event.nb)) + offX) + 'px';
            element.style.top = (parseInt(this.mouseY(event.nb)) + offY) + 'px';
            //element.style.display = 'block';
        });
        //map.addListener('click',(event) => {
        //    this.is_showing_detail = false;
        //    this.$.info_box.style.display = 'none';
        //});
        map.data.addListener('mouseover',(event) => {
            //if (!this.is_showing_detail) {
            //this.$.info_box.textContent = event.feature.getProperty('name') + " total";
            this.$.info_box.innerHTML = event.feature.getProperty('name') + "<br />Total: " + event.feature.getProperty('total_count');
            this.$.info_box.style.display = 'block';
            //}
        });
        map.data.addListener('mouseout',(event) => {
            //if (!this.is_showing_detail) {
            this.$.info_box.style.display = 'none';
            //}
        });


        //this.agreement_location_counts.forEach((value, index, test) => {
        //    var my_index = 0, count = 0;
        //    var activity = this.activity_location_counts.filter(function (value2, index2, test2) {
        //        if (value2.countryCode != value.countryCode) {
        //            if (value2.locationCount > biggest_country && value2.countryCode != null) {
        //                biggest_country = value2.locationCount;
        //            }
        //            return false;
        //        } else {
        //            my_index = index2
        //            return true;
        //        }
        //    })[0];
        //    if (activity) {
        //        count = this.activity_location_counts[my_index].locationCount + value.locationCount;
        //    } else {
        //        count = value.locationCount;//this.activity_location_counts.push(value);
        //    }

        //    if (count > biggest_country) {
        //        biggest_country = count;
        //    }
        //    //if (activity) {
        //    //    this.activity_location_counts[my_index].locationCount = this.activity_location_counts[my_index].locationCount + value.locationCount;
        //    //} else {
        //    //    this.activity_location_counts.push(value);
        //    //}

        //});

        //this.activity_location_counts.map( (value) => {
        //    if(value.countryCode != null){
        //        //var count = 0;
        //        //var agreement = this.agreement_location_counts.filter(function (value2, index, test) {
        //        //    if (value2.countryCode != value.countryCode) {
        //        //        return false;
        //        //    } else {
        //        //        return true;
        //        //    }
        //        //})[0];
        //        //if(agreement){
        //        //    count = agreement.locationCount;
        //        //}
        //        //count = value.locationCount + count;

        //        if (value.locationCount > biggest_country) {
        //            biggest_country = value.locationCount;
        //        }
        //    }
        //    return value;
        //});

        //this.agreement_location_counts.map((value) => {
        //    if (value.countryCode != null) {
        //        //var count = 0;
        //        //var agreement = this.agreement_location_counts.filter(function (value2, index, test) {
        //        //    if (value2.countryCode != value.countryCode) {
        //        //        return false;
        //        //    } else {
        //        //        return true;
        //        //    }
        //        //})[0];
        //        //if(agreement){
        //        //    count = agreement.locationCount;
        //        //}
        //        //count = value.locationCount + count;

        //        if (value.locationCount > biggest_activity) {
        //            biggest_agreement = value.locationCount;
        //        }
        //    }
        //    return value;
        //});


        //map.data.addListener('click', function (event) {
        //});
        //var world_geometry = new google.maps.FusionTablesLayer({
        //    //query: {
        //    //    select: 'geometry',
        //    //    from: '1N2LBk4JHwWpOY4d9fobIn27lfnZ5MDy-NoqqRpk'
        //    //},
        //    query: {
        //        select: 'geometry',
        //        from: '1N2LBk4JHwWpOY4d9fobIn27lfnZ5MDy-NoqqRpk',
        //        where: "ISO_2DIGIT IN ('US', 'GB', 'DE')"
        //    },
        //    map: map,
        //    //suppressInfoWindows: true
        //});
        //var layer = new google.maps.FusionTablesLayer({
        //    query: {
        //        select: '\'Geocodable address\'',
        //        from: '1mZ53Z70NsChnBMm-qEYmSDOvLXgrreLTkQUvvg'
        //    }
        //});
        //layer.setMap(map);
    },
    selectCountry: function (event, detail, sender) {
        var index = sender.selectedIndex;
        if (index != 0) {
            this.selectedPlaceId = this.countries[index - 1].id;
            this.selectedPlaceName = this.countries[index - 1].name;
            this.selectedCountryCode = this.countries[index - 1].code;
        } else {
            this.selectedPlaceId = 0;
            this.selectedPlaceName = undefined;
            this.selectedCountryCode = '';
        }
        this.$.ajax_activities.go();
        this.$.ajax_agreements.go();
        this.$.ajax_degrees.go();
    },
    leaveEstablishmentSearch: function (event, detail, sender) {
        setTimeout(() => {
            this.establishmentList = [];
        }, 200);
    },
    establishmentSelected: function (event, detail, sender) {

        if (this.establishmentSearch != "") {
            this.activity_location_counts = [];
        } else {
            this.$.ajax_activities.go();
        }
        this.$.ajax_agreements.go();
        this.$.ajax_degrees.go();
    },
    establishmentListSearch: function (event, detail, sender) {
        if (this.establishmentSearch == "") {
            this.establishmentList = [];
        } else {
            if (this.isAjaxing != true) {
                this.isAjaxing = true;
                this.$.ajax_establishmentsList.go();
                this.lastEstablishmentSearch = this.establishmentSearch;
            } else {
                setTimeout(() => {
                    if (this.lastEstablishmentSearch != this.establishmentSearch) {
                        this.isAjaxing = true;
                        this.$.ajax_establishmentsList.go();
                        this.lastEstablishmentSearch = this.establishmentSearch;
                    }
                }, 500);
            }
        }
    },
    selectedCountryChanged: function (oldVal, newVal) {
        if (newVal != 0) {
            this.selectedPlaceId = this.countries[newVal - 1].id;
            this.selectedPlaceName = this.countries[newVal - 1].name;
            this.selectedCountryCode = this.countries[newVal - 1].code;
        } else {
            this.selectedPlaceId = 0;
            this.selectedPlaceName = undefined;
            this.selectedCountryCode = 'any';
        }
        this.$.ajax_activities.go();
        this.$.ajax_agreements.go();
        this.$.ajax_degrees.go();
    },
    activitiesResponse: function (response) {
        this.isAjaxing = false;


        if (!response.detail.response.error) {
            this.activity_location_counts = response.detail.response;
        } else {

            console.log(response.detail.response.error)
        }
        this.data_loaded.activities_loaded = 1;
        //this.setupMapFilters();
    },
    agreementsResponse: function (response) {
        this.isAjaxing = false;
        if (!response.detail.response.error) {
            this.agreement_location_counts = response.detail.response;
        } else {

            console.log(response.detail.response.error)
        }
        this.data_loaded.agreements_loaded = 1;
    },
    degreesResponse: function (response) {
        this.isAjaxing = false;
        if (!response.detail.response.error) {
            this.degree_location_counts = response.detail.response;
        } else {

            console.log(response.detail.response.error)
        }
        this.data_loaded.degrees_loaded = 1;
    },
    //affiliationsResponse: function (response) {
    //    this.isAjaxing = false;
    //    this.affiliationCountLoaded = true;
    //    if (!response.detail.response.error) {
    //        this.affiliations = response.detail.response[0];
    //    } else {

    //        console.log(response.detail.response.error)
    //    }
    //},
    //expertisesResponse: function (response) {
    //    this.isAjaxing = false;
    //    this.expertiseCountLoaded = true;
    //    if (!response.detail.response.error) {
    //        this.expertises = response.detail.response[0];
    //    } else {

    //        console.log(response.detail.response.error)
    //    }
    //},
    countriesResponse: function (response) {
        this.isAjaxing = false;

        if (!response.detail.response.error) {
            this.countries = response.detail.response
        } else {

            console.log(response.detail.response.error)
        }

    },
    establishmentResponse: function (response) {
        this.isAjaxing = false;

        if (!response.detail.response.error) {

            var list = response.detail.response
            for (var i = 0; i < list.length; i++) {
                list[i]._id = list[i].forestablishmentId;
                delete list[i].forestablishmentId;
            }
            this.establishmentList = response.detail.response;
        } else {

            console.log(response.detail.response.error)
        }

    },
    ajaxError: function (response) {
        this.isAjaxing = false;

        if (!response.detail.response.error) {
            console.log(response.detail.response)
            //this.countries = response.detail.response
        } else {

            console.log(response.detail.response.error)
        }

    },
}); 