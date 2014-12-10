/// <reference path="../../typediff/mytypes.d.ts" />
//class activityCount{
//    locationCount: number;
//    type: string;
//    typeCount: number;
//    constructor(type: string = "", typeCount: number = 0, locationCount: number = 0){
//        this.type = type;
//        this.typeCount = typeCount;
//        this.locationCount = locationCount;    }

//}


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
            //console.log(response.detail.response)
            //this.countries = response.detail.response
            //response.detail.response.forEach(function (value: any, index: number, array: Array<Object>) {
            //    if (index == indexes[1]) {
            //        value.isSelected = true;
            //    } else {
            //        value.isSelected = false;
            //    }
            //});
        } else {

            console.log(response.detail.response.error)
        }

    },
    selectedCountryChanged: function (oldVal, newVal) {
        if (newVal != 0) {
            this.selectedPlaceId = this.countries[newVal-1].id;
            this.selectedPlaceName = this.countries[newVal-1].name;
        } else {
            this.selectedPlaceId = 0;
            this.selectedPlaceName = undefined;
        }
        this.$.ajax_activities.go();
    },
    countriesResponse: function (response) {
        this.isAjaxing = false;

        if (!response.detail.response.error) {
            //console.log(response.detail.response)
            this.countries = response.detail.response
        } else {

            console.log(response.detail.response.error)
        }

    },
    ajaxError: function (response) {
        this.isAjaxing = false;

        if (!response.detail.response.error) {
            console.log(response.detail.response)
            this.countries = response.detail.response
        } else {

            console.log(response.detail.response.error)
        }

    },
}); 