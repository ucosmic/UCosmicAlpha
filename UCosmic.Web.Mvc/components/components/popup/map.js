Polymer('is-page-summary-map', {
    isAjaxing: false,
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
    data_loaded: { agreements_loaded: 0, activities_loaded: 0, degrees_loaded: 0 },
    ready: function () {
        var _this = this;
        var observer = new ObjectObserver(this.data_loaded);
        observer.open(function (added, removed, changed, getOldValueFn) {
            Object.keys(changed).forEach(function (property) {
                if (_this.data_loaded.agreements_loaded == 1 && _this.data_loaded.activities_loaded == 1 && _this.data_loaded.degrees_loaded == 1) {
                    _this.setupMapFilters();
                }
            });
        });
    },
    domReady: function () {
        this.setup_mouse_tracer();
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
    setup_mouse_tracer: function () {
        var _this = this;
        var offX = 15;
        var offY = 15;
        document.addEventListener("mousemove", function (evt) {
            var obj = _this.$.info_box.style;
            obj.left = (parseInt(_this.mouseX(evt)) + offX) + 'px';
            obj.top = (parseInt(_this.mouseY(evt)) + offY) + 'px';
        });
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
                percent = ((90 * percent) + 10) / 100;
                var percentString = percent.toFixed(2);
                color = 'rgba(0, 55, 0, ' + percentString + ')';
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
        map.addListener('bounds_changed', function (event) {
            _this.$.info_box_detail_container.innerHTML = "";
            _this.countries_showing_details = [];
        });
        map.data.addListener('click', function (event) {
            var country_name = event.feature.getProperty('name');
            if (_this.countries_showing_details.indexOf(country_name) > -1) {
                return;
            }
            _this.countries_showing_details.push(country_name);
            var elementContainer = _this.$.info_box_detail_container;
            var element = document.createElement("span");
            element.setAttribute('draggable', 'true');
            element.classList.add('popup');
            var elementClose = document.createElement("span");
            elementClose.classList.add('close');
            elementClose.textContent = 'X';
            elementClose.setAttribute('data-type', 'close');
            element.appendChild(elementClose);
            elementContainer.appendChild(element);
            element.addEventListener('dragstart', _this.drag_start, false);
            document.body.addEventListener('dragover', _this.drag_over, false);
            document.body.addEventListener('drop', _this.drop, false);
            (function () {
                var el = element, cn = country_name;
                _this.$.info_box_detail_container.addEventListener("click", function (evt) {
                    if (evt.target.dataset.type == 'close') {
                        el.remove();
                        _this.countries_showing_details.pop(cn);
                    }
                });
            })();
            var country = _.find(_this.countries, function (place, index) {
                return place.code == event.feature.getProperty('iso_a2');
            });
            element.innerHTML += event.feature.getProperty('name') + "<br /><a href='/summary/report/#!/" + event.feature.getProperty('iso_a2') + "'>Total: " + event.feature.getProperty('total_count') + "</a>" + "<br /><a href='/" + _this.styledomain + "/agreements/#/table/country/" + event.feature.getProperty('iso_a2') + "/type/any/sort/start-desc/size/10/page/1/'>Agreements: " + event.feature.getProperty('agreement_count') + "</a>" + "<br /><a href='/" + _this.styledomain + "/employees/table/?placeIds=" + country.id + "&placeNames='>Activities: " + event.feature.getProperty('activity_count') + "</a>" + "<br /><a href='/" + _this.styledomain + "/employees/degrees/table/?countryCode=" + event.feature.getProperty('iso_a2') + "'>Degrees: " + event.feature.getProperty('degree_count') + "</a>";
            _this.countries_showing_details = _.union(_this.countries_showing_details, [event.feature.getProperty('name')]);
            var offX = 15;
            var offY = 15;
            element.style.left = (parseInt(_this.mouseX(event.nb)) + offX) + 'px';
            element.style.top = (parseInt(_this.mouseY(event.nb)) + offY) + 'px';
            element.style.display = 'block';
        });
        map.data.addListener('mouseover', function (event) {
            _this.$.info_box.innerHTML = event.feature.getProperty('name') + "<br />Total: " + event.feature.getProperty('total_count');
            _this.$.info_box.style.display = 'block';
        });
        map.data.addListener('mouseout', function (event) {
            _this.$.info_box.style.display = 'none';
        });
    },
    current_draggable: {},
    drag_start: function (event) {
        var style = window.getComputedStyle(event.target, null), myThis = document.querySelector("is-page-summary-map");
        event.dataTransfer.setData("text/plain", (parseInt(style.getPropertyValue("left"), 10) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top"), 10) - event.clientY));
        myThis.current_draggable = event.target;
    },
    drag_over: function (event) {
        event.preventDefault();
        return false;
    },
    drop: function (event) {
        var offset = event.dataTransfer.getData("text/plain").split(','), myThis = document.querySelector("is-page-summary-map"), dm = myThis.current_draggable;
        dm.style.left = (event.clientX + parseInt(offset[0], 10)) + 'px';
        dm.style.top = (event.clientY + parseInt(offset[1], 10)) + 'px';
        event.preventDefault();
        return false;
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
    countriesResponse: function (response) {
        this.isAjaxing = false;
        if (!response.detail.response.error) {
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
