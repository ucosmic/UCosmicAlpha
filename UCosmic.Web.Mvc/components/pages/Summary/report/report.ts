/// <reference path="../../../../scripts/typings/lodash.d.ts" />
/// <reference path="../../../typediff/mytypes.d.ts" />
/// <reference path="../../../../scripts/typings/page.d.ts" />


Polymer('is-page-summary-report', {
    isAjaxing: false,
    ancestor: "*none*",
    activityTypeCounts: [],
    agreementTypeCounts: [],
    establishmentSearch: "",
    establishment_search_url: "",
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
        };//this should be as a global _ function somewhere
        
    },
    domReady: function () {
    },

    filter: function (ctx, next) {

        var myThis: any = document.querySelector("is-page-summary-report");
        var country_code = ctx.params.country_code,
            country = _.find(myThis.countries_original, function (place: any, index: any) {
                selectedIndex = index + 1;
                return place.code == country_code || place._id == country_code;
            }), place_id = country ? country._id : 0,
            establishment_id = parseInt(ctx.params.establishment_id),
            establishment_search = ctx.params.establishment_search,
            tenant_id = parseInt(ctx.params.tenant_id);
        if (establishment_id != myThis.last_selected_establishment_id || place_id != myThis.last_selected_place_id || tenant_id != myThis.last_tenant_id) {
            myThis.last_selected_establishment_id = establishment_id;
            myThis.last_selected_place_id = place_id;
            myThis.selectedEstablishmentId = establishment_id ? establishment_id : 0;// should also ajax get name and put in text field.
            myThis.establishmentSearch = establishment_search ? establishment_search : '';// should also ajax get name and put in text field.
            //myThis.establishment_search_url = myThis.establishmentSearch ? "\"" + myThis.establishmentSearch + "\"" : ""; 
            myThis.last_tenant_id = tenant_id;
            myThis.new_tenant_id = tenant_id && tenant_id != 0 ? tenant_id : myThis.new_tenant_id ? myThis.new_tenant_id : myThis.tenant_id ? myThis.tenant_id : 0;// should also ajax get name and put in text field.
            //myThis.affiliation_selected = myThis.new_tenant_id;
            var selectedIndex;
            if (!myThis.affiliations) {
                myThis.$.ajax_affiliations.go();
            } else {
                myThis.$.cascading_ddl.item_selected = myThis.new_tenant_id;
            }
            myThis.selectedPlaceId = country && country.text != "[clear]" ? country._id : 0;
            myThis.selectedPlaceName = country && country.text != "[clear]" ? country.text : undefined;
            myThis.selectedCountryCode = country && country.text != "[clear]" ? country.code : 'any';

            //if (!myThis.selectedEstablishmentId ) {
            //    myThis.$.ajax_activities.go();
            //    myThis.activityTypeCountsLoaded = false;
            //}else{
            //    myThis.activityTypeCountsLoaded = true
            //}
            myThis.$.ajax_activities.go();
            myThis.$.ajax_agreements.go();
            myThis.$.ajax_degrees.go();
            myThis.degreeCountsLoaded = false;
            myThis.agreementTypeCountsLoaded = false;
        }

    },
    setup_routing: function () {
        page.base('/summary/report');
        page('/:country_code/:establishment_id/:tenant_id/:establishment_search', this.filter);
        page('/:country_code/:establishment_id/:tenant_id', this.filter);
        page('/:country_code/:establishment_id/', this.filter);
        page('/:country_code', this.filter);
        page('*', this.filter);
        page({ hashbang: true });
    },

    selectCountry: function (event, detail, sender) {
        if (this.establishmentSearch != "") {
            this.activityTypeCounts = [];
        } else {

        }
        page('#!/' + this.selectedPlaceId + '/' + this.selectedEstablishmentId + '/' + this.new_tenant_id + '/' + this.establishmentSearch);
    },
    filter_countries: function (event, detail, sender) {
        if (!this.selectedPlaceName || this.selectedPlaceName == "") {
            this.countries = this.countries_original;
        } else {
            this.countries = _.filter(this.countries_original, (country: any) => {
                return _.startsWith(country.text.toLowerCase(), this.selectedPlaceName.toLowerCase()) || country.text == '[clear]';
            });
        }
        //this.countries.unshift({ _id: 0, text: '[clear]' })
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

        }
        page('#!/' + this.selectedPlaceId + '/' + this.selectedEstablishmentId + '/' + this.new_tenant_id + '/' + this.establishmentSearch);
    },
    establishmentListSearch: function (event, detail, sender) {
        this.establishmentList = [{ _id: 0, text: '[clear]' }]
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
    new_tenant_idChanged: function (oldValue, newValue) {
        //var establishment_keyword_object: any = _.find(this.affiliations, { id: parseInt(newValue) });
        //this.establishment_search_url = establishment_keyword_object ? "\"" + establishment_keyword_object.text + "\"" : "";
        if (newValue) {
            var ancestor = _.find(this.affiliations, function (aff: any) {
                return aff._id == newValue;
            });
            this.ancestor = ancestor ? encodeURIComponent(ancestor.officialName) : "*none*";
        }
        this.establishment_search_url = newValue ? newValue : ""; 
        page('#!/' + this.selectedPlaceId + '/' + this.selectedEstablishmentId + '/' + newValue + '/' + this.establishmentSearch);
    },
    establishmentSearchChanged: function (oldValue: string, newValue) {
        this.establishment_search_url = newValue ? "\"" + newValue + "\"" : ""; 
    },
    activitiesResponse: function (response) {
        this.isAjaxing = false;
        this.activityTypeCountsLoaded = true;

        if (!response.detail.response.error) {
            this.activityTypeCounts = response.detail.response.activitySummaryTypes;
            this.activity_total_location_count = response.detail.response.totalLocations
            this.activity_total_activity_count = response.detail.response.totalActivities
            this.activity_total_person_count = response.detail.response.totalPeople
            
        } else {

            console.log(response.detail.response.error)
        }

    },
    agreementsResponse: function (response) {
        this.agreementTypeCountsLoaded = true;
        this.isAjaxing = false;
        if (!response.detail.response.error) {
            this.agreementTypeCounts = response.detail.response.items;
            //this.agreementTypeCounts.forEach(function (element, index, array){

            //})
            this.agreementTypeCounts = this.agreementTypeCounts.map(function (obj) {
                obj.type = obj.type.replace(' Agreement', '');
                return obj;
            });
            this.agreement_total_location_count = response.detail.response.locationCount;
            this.agreement_total_agreement_count = response.detail.response.typeCount
            //this.agreement_total_location_count = _.sum(this.agreementTypeCounts, function (agreement: any) {
            //    return agreement.locationCount;
            //});
            //this.agreement_total_agreement_count = _.sum(this.agreementTypeCounts, function (agreement: any) {
            //    return agreement.typeCount;
            //});
        } else {

            console.log(response.detail.response.error)
        }
    },
    degreesResponse: function (response) {
        this.degreeCountsLoaded = true;
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
            _.insert(response.detail.response, 8, { code: 'AQ', id: 17, name: 'Antarctica' })//hack alert

            response.detail.response.unshift({ id: 0, name: '[clear]' })
            this.countries_original = response.detail.response.map(function (country) {
                country._id = country.id;
                country.text = country.name;
                delete country.id, delete country.name, delete country.continentId, delete country.continentCode, delete country.continentName, delete country.center, delete country.box;
                return country;
            })
            //this.countries_original = this.countries;
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
            //this.establishmentSearch.unshift({ _id: 0, text: '[all]' });
            response.detail.response.unshift({ _id: 0, text: '[clear]' })
            this.establishmentList = response.detail.response;
        } else {
            console.log(response.detail.response.error)
        }

    },

    affiliations_response: function (response) {
        this.isAjaxing = false;

        if (!response.detail.response.error) {
            var affiliations = response.detail.response;
            this.affiliations = affiliations.map(function (affiliation) {
                affiliation._id = affiliation.id;
                //affiliation.text = affiliation.officialName;
                var remove_me: any = _.find(affiliations, function (affiliation2: any, index: any) {
                    return affiliation.parentId == affiliation2.id;
                });
                if (remove_me) {
                    affiliation.text = affiliation.officialName.replace(", " + remove_me.officialName, "");
                } else {
                    affiliation.text = affiliation.officialName
                }
                //delete country.id, delete country.name, delete country.continentId, delete country.continentCode, delete country.continentName, delete country.center, delete country.box;
                return affiliation;
            })
            this.$.cascading_ddl.item_selected = this.new_tenant_id;
            //this.$.cascading_ddl2.item_selected = this.new_tenant_id;
            //this.create_affiliation_select(this.new_tenant_id);

        } else {

            console.log(response.detail.response.error)
        }

    },
    ajaxError: function (response) {
        this.isAjaxing = false;

        if (!response.detail.response.error) {
            console.log(response.detail.response)
        } else {

            console.log(response.detail.response.error)
        }

    },


}); 

