Polymer('is-page-locations-index', {
    isAjaxing: false,
    activityTypeCounts: [],
    selectedCountry: 0,
    selectedPlaceId: 0,
    ready: function () {
    },
    activitiesResponse: function (response) {
        this.isAjaxing = false;
        if (!response.detail.response.error) {
            this.activityTypeCounts = response.detail.response;
        }
        else {
            console.log(response.detail.response.error);
        }
    },
    selectedCountryChanged: function (oldVal, newVal) {
        if (newVal != 0) {
            this.selectedPlaceId = this.countries[newVal - 1].id;
            this.selectedPlaceName = this.countries[newVal - 1].name;
        }
        else {
            this.selectedPlaceId = 0;
            this.selectedPlaceName = undefined;
        }
        this.$.ajax_activities.go();
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
    ajaxError: function (response) {
        this.isAjaxing = false;
        if (!response.detail.response.error) {
            console.log(response.detail.response);
            this.countries = response.detail.response;
        }
        else {
            console.log(response.detail.response.error);
        }
    },
});
