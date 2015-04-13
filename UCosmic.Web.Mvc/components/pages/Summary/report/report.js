Polymer('is-page-summary-report', {
    isAjaxing: false,
    activityTypeCounts: [],
    agreementTypeCounts: [],
    establishmentSearch: "",
    selectedCountry: 0,
    selectedCountryCode: 'any',
    selectedPlaceId: 0,
    last_selected_place_id: -1,
    expertiseCountLoaded: false,
    affiliationCountLoaded: false,
    lastEstablishmentSearch: "",
    selectedEstablishmentId: 0,
    last_selected_establishment_id: -1,
    degreeCountLoaded: false,
    agreementTypeCountsLoaded: false,
    activityTypeCountsLoaded: false,
    filter: function (ctx, next) {
        var myThis = document.querySelector("is-page-summary-report"), country_code = ctx.params.country_code, country = _.find(myThis.countries, function (place, index) {
            selectedIndex = index + 1;
            return place.code == country_code;
        }), place_id = country ? country.id : 0, establishment_id = parseInt(ctx.params.establishment_id);
        if (establishment_id != myThis.last_selected_establishment_id || place_id != myThis.last_selected_place_id) {
            myThis.last_selected_establishment_id = establishment_id;
            myThis.last_selected_place_id = place_id;
            myThis.selectedEstablishmentId = establishment_id ? establishment_id : 0;
            var selectedIndex;
            if (country) {
                setTimeout(function () {
                    myThis.$.selectCountry.selectedIndex = selectedIndex;
                }, 200);
            }
            myThis.selectedPlaceId = country ? country.id : 0;
            myThis.selectedPlaceName = country ? country.name : undefined;
            myThis.selectedCountryCode = country ? country.code : 'any';
            if (!myThis.selectedEstablishmentId) {
                myThis.$.ajax_activities.go();
            }
            myThis.$.ajax_agreements.go();
            myThis.$.ajax_degrees.go();
        }
    },
    setup_routing: function () {
        page.base('/summary/report');
        page('/:country_code/:establishment_id', this.filter);
        page('/:country_code', this.filter);
        page('*', this.filter);
        page({ hashbang: true });
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
        page('#!/' + this.selectedCountryCode + '/' + this.selectedEstablishmentId);
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
        page('#!/' + this.selectedPlaceId + '/' + this.selectedEstablishmentId);
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
    activitiesResponse: function (response) {
        this.isAjaxing = false;
        this.activityTypeCountsLoaded = true;
        if (!response.detail.response.error) {
            this.activityTypeCounts = response.detail.response;
        }
        else {
            console.log(response.detail.response.error);
        }
    },
    agreementsResponse: function (response) {
        this.agreementTypeCountsLoaded = true;
        this.isAjaxing = false;
        if (!response.detail.response.error) {
            this.agreementTypeCounts = response.detail.response;
        }
        else {
            console.log(response.detail.response.error);
        }
    },
    degreesResponse: function (response) {
        this.degreeCountLoaded = true;
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
            this.countries = response.detail.response;
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
