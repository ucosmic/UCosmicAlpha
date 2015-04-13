/// <reference path="../../../../scripts/typings/lodash.d.ts" />
/// <reference path="../../../typediff/mytypes.d.ts" />
/// <reference path="../../../../scripts/typings/page.d.ts" />
//class activityCount{
//    locationCount: number;
//    type: string;
//    typeCount: number;
//    constructor(type: string = "", typeCount: number = 0, locationCount: number = 0){
//        this.type = type;
//        this.typeCount = typeCount;
//        this.locationCount = locationCount;    }

//}


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

        var myThis: any = document.querySelector("is-page-summary-report"),
            country_code = ctx.params.country_code,
            country = _.find(myThis.countries, function (place: any, index: any) {
                selectedIndex = index + 1;
                return place.code == country_code;
            }), place_id = country ? country.id : 0,
            establishment_id = parseInt(ctx.params.establishment_id);
        if (establishment_id != myThis.last_selected_establishment_id || place_id != myThis.last_selected_place_id) {
            myThis.last_selected_establishment_id = establishment_id;
            myThis.last_selected_place_id = place_id;
            myThis.selectedEstablishmentId = establishment_id ? establishment_id : 0;// should also ajax get name and put in text field.
            //var country = _.result(_.find(myThis.countries, 'id', place_id), 'user');
            var selectedIndex;
            if (country) {
                setTimeout(function () {
                    myThis.$.selectCountry.selectedIndex = selectedIndex;
                }, 200);
            }
            //var establishment = _.result(_.find(myThis.countries, 'id', country), 'user');
            myThis.selectedPlaceId = country ? country.id : 0;
            myThis.selectedPlaceName = country ? country.name : undefined;
            myThis.selectedCountryCode = country ? country.code : 'any';

            if (!myThis.selectedEstablishmentId) {
                myThis.$.ajax_activities.go();
            }
            myThis.$.ajax_agreements.go();
            myThis.$.ajax_degrees.go();
            //{ { selectedPlaceId } } /{{selectedEstablishmentId}}
        }

    },
    setup_routing: function () {
        page.base('/summary/report');
        page('/:country_code/:establishment_id', this.filter);
        page('/:country_code', this.filter);
        page('*', this.filter);
        page({ hashbang: true });
        // page('#/' + window.location.hash.substr(1));
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
        page('#!/' + this.selectedCountryCode + '/' + this.selectedEstablishmentId);
          
        //this.$.ajax_activities.go();
        //this.$.ajax_agreements.go();
        //this.$.ajax_degrees.go();
    },
    leaveEstablishmentSearch: function (event, detail, sender) {
        setTimeout(() => {
            this.establishmentList = [];
        }, 200);
    },
    establishmentSelected: function (event, detail, sender) {

        if (this.establishmentSearch != "") {
            this.activityTypeCounts = [];
        } else {
            //this.$.ajax_activities.go();
        }
        page('#!/' + this.selectedPlaceId + '/' + this.selectedEstablishmentId);
        //this.$.ajax_agreements.go();
        //this.$.ajax_degrees.go();
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
    //selectedCountryChanged: function (oldVal, newVal) {
    //    if (newVal != 0) {
    //        this.selectedPlaceId = this.countries[newVal - 1].id;
    //        this.selectedPlaceName = this.countries[newVal - 1].name;
    //        this.selectedCountryCode = this.countries[newVal - 1].code;
    //    } else {
    //        this.selectedPlaceId = 0;
    //        this.selectedPlaceName = undefined;
    //        this.selectedCountryCode = 'any';
    //    }
    //    this.$.ajax_activities.go();
    //    this.$.ajax_agreements.go();
    //    this.$.ajax_degrees.go();
    //},
    activitiesResponse: function (response) {
        this.isAjaxing = false;
        this.activityTypeCountsLoaded = true;

        if (!response.detail.response.error) {
            this.activityTypeCounts = response.detail.response;
        } else {

            console.log(response.detail.response.error)
        }

    },
    agreementsResponse: function (response) {
        this.agreementTypeCountsLoaded = true;
        this.isAjaxing = false;
        if (!response.detail.response.error) {
            this.agreementTypeCounts = response.detail.response;
        } else {

            console.log(response.detail.response.error)
        }
    },
    degreesResponse: function (response) {
        this.degreeCountLoaded = true;
        this.isAjaxing = false;
        if (!response.detail.response.error) {
            this.degrees = response.detail.response[0];
        } else {

            console.log(response.detail.response.error)
        }
    },
    affiliationsResponse: function (response) {
        this.isAjaxing = false;
        this.affiliationCountLoaded = true;
        if (!response.detail.response.error) {
            this.affiliations = response.detail.response[0];
        } else {

            console.log(response.detail.response.error)
        }
    },
    expertisesResponse: function (response) {
        this.isAjaxing = false;
        this.expertiseCountLoaded = true;
        if (!response.detail.response.error) {
            this.expertises = response.detail.response[0];
        } else {

            console.log(response.detail.response.error)
        }
    },
    countriesResponse: function (response) {
        this.isAjaxing = false;

        if (!response.detail.response.error) {
            this.countries = response.detail.response
            this.setup_routing();
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


//    establishmentData = new App.DataCacher<Establishments.ApiModels.ScalarEstablishment[]>(
//        (): JQueryPromise<Establishments.ApiModels.ScalarEstablishment[]> => {
//            return this._loadEstablishmentData();
//        });

//        private _createEstablishmentSelects(response): void {

//    var parentId = this.settings.input.ancestorId;
//    if(!parentId) {
//    parentId = this.settings.tenantId;
//}
//var previousParentId = 0;
//while (true) {

//    response.map(function (x, index, array) {
//        x.officialName = x.contextName ? x.contextName : x.officialName && x.officialName.indexOf(',') > -1 ? x.officialName.substring(0, x.officialName.indexOf(',')) : x.officialName;
//        return x;
//    });

//    var options: any = Enumerable.From(response)
//        .Where("x => x.parentId==" + parentId)
//        .OrderBy(function (x: Establishments.ApiModels.ScalarEstablishment): number {
//        return x.rank; // sort by rank, then by name
//    })
//        .ThenBy(function (x: Establishments.ApiModels.ScalarEstablishment): string {
//        return x.contextName || x.officialName;
//    })
//        .Select("x =>  {value: x.id, text: x.officialName}").ToArray();

//    if (options.length > 0) {
//        options.unshift({ value: null, text: 'Select sub-affiliation or leave empty' });
//        this.affiliations.unshift(ko.mapping.fromJS([{ options: options, value: previousParentId.toString() }])()[0]);
//    }
//    previousParentId = parentId;
//    var parentCheck = Enumerable.From(response).Where("x => x.id==" + parentId).ToArray();
//    if (parentCheck[0] != undefined) {
//        parentId = parentCheck[0].parentId;
//    } else {
//        this.hasEstablishmentSelects(true);
//        return;
//    }
//}

//        }

//        private _loadEstablishmentData(): JQueryPromise < Establishments.ApiModels.ScalarEstablishment[] > {
//    var promise: JQueryDeferred<Establishments.ApiModels.ScalarEstablishment[]> = $.Deferred();
//    //var mainCampus = this.settings.tenantId;

//    if(!this.mainCampus) {
//    this.mainCampus = this.settings.tenantId;
//}

//var temp = sessionStorage.getItem('campuses' + this.mainCampus);
//if (temp) {
//    var response = $.parseJSON(temp);
//    this._createEstablishmentSelects(response);
//    //this._ConstructMapData();
//} else {

//    var settings = settings || {};
//    settings.url = '/api/establishments/' + this.mainCampus + '/offspring';
//    $.ajax(settings)
//        .done((response: ApiModels.ScalarEstablishment[]): void => {
//        promise.resolve(response);
//        sessionStorage.setItem('campuses' + this.mainCampus, JSON.stringify(response));

//        this._createEstablishmentSelects(response);
//        //this._ConstructMapData();

//    })
//        .fail((xhr: JQueryXHR): void => {
//        promise.reject(xhr);
//    });
//}

//return promise;
//        }
}); 