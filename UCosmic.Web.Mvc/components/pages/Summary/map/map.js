Polymer('is-page-summary-map', {
    isAjaxing: false,
    affiliations: undefined,
    color: function (c, n, i, d) {
        for (i = 3; i--; c[i] = d < 0 ? 0 : d > 255 ? 255 : d | 0)
            d = c[i] + n;
        return c;
    },
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
    color_picker_opened: false,
    map_color: { r: 0, g: 55, b: 0 },
    close_full_screen: function (e) {
        var _this = this;
        this.fadeIn(this.$.overlay, 200, function () {
            _this.$.map_canvas.style.position = '';
            _this.$.map_canvas.style.height = '800px';
            _this.$.map_canvas.style.width = '990px';
            _this.$.map_canvas.style.marginRight = '8px';
            _this.$.map_canvas.removeAttribute('fit');
            _this.$.map_bottom_bar.style.position = 'relative';
            _this.$.map_bottom_bar.style.bottom = '';
            _this.$.map_bottom_bar.style.left = '';
            _this.$.map_bottom_bar.style.width = '';
            _this.$.open_full_screen.style.display = 'block';
            _this.$.side_filter.style.top = '';
            _this.$.side_filter.style.right = '';
            _this.$.side_filter.is_full_screen = false;
            _this.$.close_full_screen.style.display = 'none';
            _this.setupMapFilters();
            _this.setup_mouse_tracer(_this.$.map_canvas);
            _this.fadeOut(_this.$.overlay, 500);
        });
    },
    full_screen: function (e) {
        var _this = this;
        this.fadeIn(this.$.overlay, 200, function () {
            _this.$.map_canvas.style.position = 'absolute';
            _this.$.map_canvas.style.height = '';
            _this.$.map_canvas.style.width = '';
            _this.$.map_canvas.style.marginRight = '';
            _this.$.map_canvas.setAttribute('fit', '');
            _this.$.map_bottom_bar.style.position = 'absolute';
            _this.$.map_bottom_bar.style.bottom = '20px';
            _this.$.map_bottom_bar.style.left = '10px';
            _this.$.map_bottom_bar.style.width = '900px';
            _this.$.open_full_screen.style.display = 'none';
            _this.$.side_filter.style.top = '25px';
            _this.$.side_filter.style.right = '60px';
            _this.$.side_filter.is_full_screen = true;
            _this.$.close_full_screen.style.display = 'block';
            _this.setupMapFilters();
            _this.setup_mouse_tracer(_this.$.map_canvas);
            _this.fadeOut(_this.$.overlay, 500);
        });
    },
    data_loaded: { agreements_loaded: 0, activities_loaded: 0, degrees_loaded: 0 },
    ready: function () {
        var _this = this;
        _.insert = function (arr, index, item) {
            arr.splice(index, 0, item);
        };
        var observer = new ObjectObserver(this.data_loaded);
        observer.open(function (added, removed, changed, getOldValueFn) {
            Object.keys(changed).forEach(function (property) {
                if (_this.data_loaded.agreements_loaded == 1 && _this.data_loaded.activities_loaded == 1 && _this.data_loaded.degrees_loaded == 1) {
                    _this.setupMapFilters();
                }
            });
        });
        this.setup_routing();
    },
    open_color_picker: function () {
        var _this = this;
        if (this.$.color_picker_container.style.display != 'none') {
            this.$.color_picker_container.style.transformOrigin = "left bottom";
            this.shrink(this.$.color_picker_container, 200);
            this.fadeOut(this.$.color_picker_container, 200, function () {
                _this.$.open_color_picker.style.left = '';
                _this.$.open_color_picker.style.visibility = "visible";
            });
            this.$.open_color_picker.icon = "editor:format-color-fill";
        }
        else {
            if (!this.is_full_screen) {
                this.$.open_color_picker.style.left = (parseInt(this.width) - 40) + 'px';
            }
            else {
                this.$.open_color_picker.style.left = (parseInt(this.width) - 40 + 60) + 'px';
            }
            this.fadeIn(this.$.color_picker_container, 500);
            this.$.color_picker_container.style.transformOrigin = "bottom left";
            this.grow(this.$.color_picker_container, 500);
            this.$.open_color_picker.icon = 'close';
        }
    },
    color_picked: function (e) {
        this.map_color = e.target.color.rgb;
        this.setupMapFilters();
    },
    domReady: function () {
        this.setup_mouse_tracer();
        if (!this.affiliations) {
            this.$.ajax_affiliations.go();
        }
        else {
            this.$.cascading_ddl.item_selected = this.new_tenant_id;
        }
    },
    mouseX: function (evt) {
        if (!evt)
            evt = window.event;
        if (evt.pageX)
            return evt.pageX;
        else if (evt.clientX)
            return evt.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
        else
            return 0;
    },
    mouseY: function (evt) {
        if (!evt)
            evt = window.event;
        if (evt.pageY)
            return evt.pageY;
        else if (evt.clientY)
            return evt.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
        else
            return 0;
    },
    setup_mouse_tracer: function (el) {
        var _this = this;
        if (el === void 0) { el = document; }
        var offX = 15;
        var offY = 15;
        el.addEventListener("mousemove", function (evt) {
            var obj = _this.$.info_box.style;
            obj.left = (parseInt(_this.mouseX(evt)) + offX) + 'px';
            obj.top = (parseInt(_this.mouseY(evt)) + offY) + 'px';
        });
    },
    filter: function (ctx, next) {
        var myThis = document.querySelector("is-page-summary-map"), tenant_id = parseInt(ctx.params.tenant_id);
        if (tenant_id != myThis.last_tenant_id) {
            myThis.last_tenant_id = tenant_id;
            myThis.new_tenant_id = tenant_id && tenant_id != 0 ? tenant_id : myThis.new_tenant_id ? myThis.new_tenant_id : myThis.tenant_id ? myThis.tenant_id : 0;
            myThis.data_loaded.agreements_loaded = 0;
            myThis.data_loaded.activities_loaded = 0;
            myThis.data_loaded.degrees_loaded = 0;
            myThis.$.ajax_degrees.go();
            myThis.$.ajax_activities.go();
            myThis.$.ajax_agreements.go();
        }
    },
    setup_routing: function () {
        page.base('/summary/map');
        page('/:tenant_id', this.filter);
        page('*', this.filter);
        page({ hashbang: true });
    },
    setupMapFilters: function () {
        var _this = this;
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
            },
            {
                "featureType": "landscape.natural.terrain",
                "stylers": [
                    { "visibility": "off" }
                ]
            },
            {
                "featureType": "administrative",
                "stylers": [
                    { "visibility": "off" }
                ]
            }
        ];
        map.setOptions({ styles: map_styles });
        map.data.loadGeoJson('/content/countries/ne-countries-110m.json');
        var biggest_country = 0;
        var total_count;
        var total_count = JSON.parse(JSON.stringify(this.activity_location_counts));
        this.agreement_location_counts.forEach(function (value, index, test) {
            var my_index = 0;
            var activity = total_count.filter(function (value2, index2, test2) {
                if (value2.countryCode != value.countryCode) {
                    return false;
                }
                else {
                    my_index = index2;
                    return true;
                }
            })[0];
            if (activity) {
                total_count[my_index].locationCount = activity.locationCount + value.locationCount;
            }
            else {
                total_count.push(value);
            }
        });
        this.degree_location_counts.forEach(function (value, index, test) {
            var my_index = 0;
            var activity = total_count.filter(function (value2, index2, test2) {
                if (value2.countryCode != value.countryCode) {
                    return false;
                }
                else {
                    my_index = index2;
                    return true;
                }
            })[0];
            if (activity) {
                total_count[my_index].locationCount = activity.locationCount + value.locationCount;
            }
            else {
                total_count.push(value);
            }
        });
        total_count.forEach(function (value, index, test) {
            if (value.locationCount > biggest_country && value.countryCode != null) {
                biggest_country = value.locationCount;
            }
        });
        map.data.setStyle(function (feature) {
            var countryCode = feature.getProperty('iso_a2');
            var activity = null;
            var agreement = null;
            var degree = null;
            var total = null;
            if (countryCode) {
                activity = _this.activity_location_counts.filter(function (value, index, test) {
                    if (value.countryCode != countryCode) {
                        return false;
                    }
                    else {
                        return true;
                    }
                })[0];
                total = total_count.filter(function (value, index, test) {
                    if (value.countryCode != countryCode) {
                        return false;
                    }
                    else {
                        return true;
                    }
                })[0];
                agreement = _this.agreement_location_counts.filter(function (value, index, test) {
                    if (value.countryCode != countryCode) {
                        return false;
                    }
                    else {
                        return true;
                    }
                })[0];
                degree = _this.degree_location_counts.filter(function (value, index, test) {
                    if (value.countryCode != countryCode) {
                        return false;
                    }
                    else {
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
                percent = ((95 * percent) + 5) / 100;
                var percentString = percent.toFixed(2);
                color = 'rgba(' + _this.map_color.r + ', ' + _this.map_color.g + ', ' + _this.map_color.b + ', ' + percentString + ')';
            }
            feature.setProperty('activity_count', activity ? activity.locationCount : 0);
            feature.setProperty('total_count', total ? total.locationCount : 0);
            feature.setProperty('agreement_count', agreement ? agreement.locationCount : 0);
            feature.setProperty('degree_count', degree ? degree.locationCount : 0);
            return ({
                fillColor: color,
                strokeWeight: 1,
                strokeOpacity: 0.50,
                fillOpacity: 1
            });
        });
        map.data.addListener('click', function (event) {
            var country_name = event.feature.getProperty('name');
            if (_this.countries_showing_details.indexOf(country_name) > -1) {
                return;
            }
            _this.countries_showing_details.push(country_name);
            var elementContainer = _this.$.info_box_detail_container;
            var element = document.createElement("is-popup");
            elementContainer.appendChild(element);
            element.addEventListener('close', function (event) {
                _this.countries_showing_details.pop(event.target.country_name);
            }, false);
            var country = _.find(_this.countries, function (place, index) {
                return place.code == event.feature.getProperty('iso_a2');
            });
            element.country_name = country_name;
            element.content = "<b>" + event.feature.getProperty('name') + "</b><br /><a href='/summary/report/#!/" + event.feature.getProperty('iso_a2') + "'>Total: " + event.feature.getProperty('total_count') + "</a>" + "<br /><a href='/" + _this.styledomain + "/agreements/#/table/country/" + event.feature.getProperty('iso_a2') + "/type/any/sort/start-desc/size/10/page/1/'>Agreements: " + event.feature.getProperty('agreement_count') + "</a>" + "<br /><a href='/" + _this.styledomain + "/employees/table/?placeIds=" + country.id + "&placeNames='>Activities: " + event.feature.getProperty('activity_count') + "</a>" + "<br /><a href='/" + _this.styledomain + "/employees/degrees/table/?countryCode=" + event.feature.getProperty('iso_a2') + "'>Degrees: " + event.feature.getProperty('degree_count') + "</a>";
            _this.countries_showing_details = _.union(_this.countries_showing_details, [event.feature.getProperty('name')]);
            var offX = 15;
            var offY = 15;
            element.style.left = (parseInt(_this.mouseX(event.nb)) + offX) + 'px';
            element.style.top = (parseInt(_this.mouseY(event.nb)) + offY) + 'px';
        });
        map.data.addListener('mouseover', function (event) {
            _this.$.info_box.innerHTML = event.feature.getProperty('name') + "<br />Total: " + event.feature.getProperty('total_count');
            _this.$.info_box.style.display = 'block';
        });
        map.data.addListener('mouseout', function (event) {
            _this.$.info_box.style.display = 'none';
        });
    },
    selectCountry: function (event, detail, sender) {
        var index = sender.selectedIndex;
        if (index != 0) {
            this.selectedPlaceId = this.countries[index - 1].id;
            this.selectedPlaceName = this.countries[index - 1].name;
            this.selectedCountryCode = this.countries[index - 1].code;
        }
        else {
            this.selectedPlaceId = 0;
            this.selectedPlaceName = undefined;
            this.selectedCountryCode = '';
        }
        this.$.ajax_activities.go();
        this.$.ajax_agreements.go();
        this.$.ajax_degrees.go();
    },
    leaveEstablishmentSearch: function (event, detail, sender) {
        var _this = this;
        setTimeout(function () {
            _this.establishmentList = [];
        }, 200);
    },
    establishmentSelected: function (event, detail, sender) {
        if (this.establishmentSearch != "") {
            this.activity_location_counts = [];
        }
        else {
            this.$.ajax_activities.go();
        }
        this.$.ajax_agreements.go();
        this.$.ajax_degrees.go();
    },
    establishmentListSearch: function (event, detail, sender) {
        var _this = this;
        if (this.establishmentSearch == "") {
            this.establishmentList = [];
        }
        else {
            if (this.isAjaxing != true) {
                this.isAjaxing = true;
                this.$.ajax_establishmentsList.go();
                this.lastEstablishmentSearch = this.establishmentSearch;
            }
            else {
                setTimeout(function () {
                    if (_this.lastEstablishmentSearch != _this.establishmentSearch) {
                        _this.isAjaxing = true;
                        _this.$.ajax_establishmentsList.go();
                        _this.lastEstablishmentSearch = _this.establishmentSearch;
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
        }
        else {
            this.selectedPlaceId = 0;
            this.selectedPlaceName = undefined;
            this.selectedCountryCode = 'any';
        }
        this.$.ajax_activities.go();
        this.$.ajax_agreements.go();
        this.$.ajax_degrees.go();
    },
    new_tenant_idChanged: function (oldValue, newValue) {
        page('#!/' + newValue);
        this.$.info_box_detail_container.innerHTML = "";
        this.countries_showing_details = [];
    },
    activitiesResponse: function (response) {
        this.isAjaxing = false;
        if (!response.detail.response.error) {
            this.activity_location_counts = response.detail.response;
        }
        else {
            console.log(response.detail.response.error);
        }
        this.data_loaded.activities_loaded = 1;
    },
    agreementsResponse: function (response) {
        this.isAjaxing = false;
        if (!response.detail.response.error) {
            this.agreement_location_counts = response.detail.response;
        }
        else {
            console.log(response.detail.response.error);
        }
        this.data_loaded.agreements_loaded = 1;
    },
    degreesResponse: function (response) {
        this.isAjaxing = false;
        if (!response.detail.response.error) {
            this.degree_location_counts = response.detail.response;
        }
        else {
            console.log(response.detail.response.error);
        }
        this.data_loaded.degrees_loaded = 1;
    },
    affiliations_response: function (response) {
        this.isAjaxing = false;
        if (!response.detail.response.error) {
            var affiliations = response.detail.response;
            this.affiliations = affiliations.map(function (affiliation) {
                affiliation._id = affiliation.id;
                var remove_me = _.find(affiliations, function (affiliation2, index) {
                    return affiliation.parentId == affiliation2.id;
                });
                if (remove_me) {
                    affiliation.text = affiliation.officialName.replace(", " + remove_me.officialName, "");
                }
                else {
                    affiliation.text = affiliation.officialName;
                }
                return affiliation;
            });
            this.$.cascading_ddl.item_selected = this.new_tenant_id;
        }
        else {
            console.log(response.detail.response.error);
        }
    },
    countriesResponse: function (response) {
        this.isAjaxing = false;
        if (!response.detail.response.error) {
            _.insert(response.detail.response, 4, { code: 'AQ', id: 17, name: 'Antarctica' });
            this.countries = response.detail.response;
        }
        else {
            console.log(response.detail.response.error);
        }
    },
    establishmentResponse: function (response) {
        this.isAjaxing = false;
        if (!response.detail.response.error) {
            var list = response.detail.response;
            for (var i = 0; i < list.length; i++) {
                list[i]._id = list[i].forestablishmentId;
                delete list[i].forestablishmentId;
            }
            this.establishmentList = response.detail.response;
        }
        else {
            console.log(response.detail.response.error);
        }
    },
    ajaxError: function (response) {
        this.isAjaxing = false;
        if (!response.detail.response.error) {
            console.log(response.detail.response);
        }
        else {
            console.log(response.detail.response.error);
        }
    },
});
