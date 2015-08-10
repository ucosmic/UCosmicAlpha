/// <reference path="../../../../scripts/typings/lodash.d.ts" />
/// <reference path="../../../typediff/mytypes.d.ts" />
/// <reference path="../../../../scripts/typings/page.d.ts" />
Polymer('is-page-summary-report', {
    isAjaxing: false,
    activityTypeCounts: [],
    agreementTypeCounts: [],
    establishmentSearch: "",
    lastEstablishmentSearch: "",
    selectedEstablishmentId: 0,
    last_selected_establishment_id: -1,
    selectedCountry: 0,
    selectedCountryCode: 'any',
    selectedPlaceId: 0,
    last_selected_place_id: -1,
    last_tenant_id: -1,
    agreement_total_location_count: 0,
    agreement_total_agreement_count: 0,
    activity_total_location_count: 0,
    activity_total_agreement_count: 0,
    expertiseCountLoaded: false,
    affiliationCountLoaded: false,
    degreeCountsLoaded: false,
    agreementTypeCountsLoaded: false,
    activityTypeCountsLoaded: false,
    countries_original: [],
    affiliations: [],
    ready: function () {
        _.insert = function (arr, index, item) {
            arr.splice(index, 0, item);
        };
    },
    domReady: function () {
    },
    filter: function (ctx, next) {
        var myThis = document.querySelector("is-page-summary-report"), country_code = ctx.params.country_code, country = _.find(myThis.countries_original, function (place, index) {
            selectedIndex = index + 1;
            return place.code == country_code || place._id == country_code;
        }), place_id = country ? country._id : 0, establishment_id = parseInt(ctx.params.establishment_id), tenant_id = parseInt(ctx.params.tenant_id);
        if (establishment_id != myThis.last_selected_establishment_id || place_id != myThis.last_selected_place_id || tenant_id != myThis.last_tenant_id) {
            myThis.last_selected_establishment_id = establishment_id;
            myThis.last_selected_place_id = place_id;
            myThis.selectedEstablishmentId = establishment_id ? establishment_id : 0;
            myThis.last_tenant_id = tenant_id;
            myThis.new_tenant_id = tenant_id && tenant_id != 0 ? tenant_id : myThis.new_tenant_id ? myThis.new_tenant_id : myThis.tenant_id ? myThis.tenant_id : 0;
            var selectedIndex;
            if (!myThis.affiliations) {
                myThis.$.ajax_affiliations.go();
            }
            else {
                myThis.$.cascading_ddl.item_selected = myThis.new_tenant_id;
            }
            myThis.selectedPlaceId = country ? country._id : 0;
            myThis.selectedPlaceName = country ? country.text : undefined;
            myThis.selectedCountryCode = country ? country.code : 'any';
            if (!myThis.selectedEstablishmentId) {
                myThis.$.ajax_activities.go();
                myThis.activityTypeCountsLoaded = false;
            }
            else {
                myThis.activityTypeCountsLoaded = true;
            }
            myThis.$.ajax_agreements.go();
            myThis.$.ajax_degrees.go();
            myThis.degreeCountsLoaded = false;
            myThis.agreementTypeCountsLoaded = false;
        }
    },
    setup_routing: function () {
        page.base('/summary/report');
        page('/:country_code/:establishment_id/:tenant_id', this.filter);
        page('/:country_code/:establishment_id/', this.filter);
        page('/:country_code', this.filter);
        page('*', this.filter);
        page({ hashbang: true });
    },
    selectCountry: function (event, detail, sender) {
        if (this.establishmentSearch != "") {
            this.activityTypeCounts = [];
        }
        else {
        }
        page('#!/' + this.selectedPlaceId + '/' + this.selectedEstablishmentId + '/' + this.new_tenant_id);
    },
    filter_countries: function (event, detail, sender) {
        var _this = this;
        if (!this.selectedPlaceName || this.selectedPlaceName == "") {
            this.countries = this.countries_original;
        }
        else {
            this.countries = _.filter(this.countries_original, function (country) {
                return _.startsWith(country.text.toLowerCase(), _this.selectedPlaceName.toLowerCase());
            });
        }
    },
    leaveEstablishmentSearch: function (event, detail, sender) {
        var _this = this;
        setTimeout(function () {
            _this.establishmentList = [];
        }, 200);
    },
    establishmentSelected: function (event, detail, sender) {
        if (this.establishmentSearch != "") {
            this.activityTypeCounts = [];
        }
        else {
        }
        page('#!/' + this.selectedPlaceId + '/' + this.selectedEstablishmentId + '/' + this.new_tenant_id);
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
    new_tenant_idChanged: function (oldValue, newValue) {
        page('#!/' + this.selectedPlaceId + '/' + this.selectedEstablishmentId + '/' + newValue);
    },
    activitiesResponse: function (response) {
        this.isAjaxing = false;
        this.activityTypeCountsLoaded = true;
        if (!response.detail.response.error) {
            this.activityTypeCounts = response.detail.response.activitySummaryTypes;
            this.activity_total_location_count = response.detail.response.totalLocations;
            this.activity_total_activity_count = response.detail.response.totalActivities;
            this.activity_total_person_count = response.detail.response.totalPeople;
        }
        else {
            console.log(response.detail.response.error);
        }
    },
    agreementsResponse: function (response) {
        this.agreementTypeCountsLoaded = true;
        this.isAjaxing = false;
        if (!response.detail.response.error) {
            this.agreementTypeCounts = response.detail.response.items;
            this.agreement_total_location_count = response.detail.response.locationCount;
            this.agreement_total_agreement_count = response.detail.response.typeCount;
        }
        else {
            console.log(response.detail.response.error);
        }
    },
    degreesResponse: function (response) {
        this.degreeCountsLoaded = true;
        this.isAjaxing = false;
        if (!response.detail.response.error) {
            this.degrees = response.detail.response[0];
        }
        else {
            console.log(response.detail.response.error);
        }
    },
    affiliationsResponse: function (response) {
        this.isAjaxing = false;
        this.affiliationCountLoaded = true;
        if (!response.detail.response.error) {
            this.affiliations = response.detail.response[0];
        }
        else {
            console.log(response.detail.response.error);
        }
    },
    expertisesResponse: function (response) {
        this.isAjaxing = false;
        this.expertiseCountLoaded = true;
        if (!response.detail.response.error) {
            this.expertises = response.detail.response[0];
        }
        else {
            console.log(response.detail.response.error);
        }
    },
    countriesResponse: function (response) {
        this.isAjaxing = false;
        if (!response.detail.response.error) {
            _.insert(response.detail.response, 8, { code: 'AQ', id: 17, name: 'Antarctica' });
            this.countries_original = response.detail.response.map(function (country) {
                country._id = country.id;
                country.text = country.name;
                delete country.id, delete country.name, delete country.continentId, delete country.continentCode, delete country.continentName, delete country.center, delete country.box;
                return country;
            });
            this.setup_routing();
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
