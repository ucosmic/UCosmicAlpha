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
    last_tenant_id: -1,
    agreement_total_location_count: 0,
    agreement_total_agreement_count: 0,
    activity_total_location_count: 0,
    activity_total_agreement_count: 0,
    //root_tenant_id: -1,
    expertiseCountLoaded: false,
    affiliationCountLoaded: false,
    lastEstablishmentSearch: "",
    selectedEstablishmentId: 0,
    last_selected_establishment_id: -1,
    degreeCountsLoaded: false,
    agreementTypeCountsLoaded: false,
    activityTypeCountsLoaded: false,
    countries_original: [],
    affiliations: [],
    ready: function () {

        _.insert = function (arr, index, item) {
            arr.splice(index, 0, item);
        };//this should be as a global _ function somewhere
        //this.$.ajax_affiliations.go()
        //this.root_tenant_id = this.new_tenant_id;
    },
    domReady: function () {
    },

    filter: function (ctx, next) {

        var myThis: any = document.querySelector("is-page-summary-report"),
            country_code = ctx.params.country_code,
            country = _.find(myThis.countries_original, function (place: any, index: any) {
                selectedIndex = index + 1;
                return place.code == country_code || place._id == country_code;
            }), place_id = country ? country._id : 0,
            establishment_id = parseInt(ctx.params.establishment_id),
            tenant_id = parseInt(ctx.params.tenant_id);
        if (establishment_id != myThis.last_selected_establishment_id || place_id != myThis.last_selected_place_id || tenant_id != myThis.last_tenant_id) {
            myThis.last_selected_establishment_id = establishment_id;
            myThis.last_selected_place_id = place_id;
            myThis.selectedEstablishmentId = establishment_id ? establishment_id : 0;// should also ajax get name and put in text field.
            myThis.last_tenant_id = tenant_id;
            myThis.new_tenant_id = tenant_id && tenant_id != 0 ? tenant_id : myThis.new_tenant_id ? myThis.new_tenant_id : myThis.tenant_id ? myThis.tenant_id : 0;// should also ajax get name and put in text field.
            //myThis.affiliation_selected = myThis.new_tenant_id;
            var selectedIndex;
            //if (country) {
            //    setTimeout(function () {
            //        myThis.$.selectCountry.selectedIndex = selectedIndex;
            //    }, 200);
            //}
            if (!myThis.affiliations) {
                myThis.$.ajax_affiliations.go();
            } else {
                myThis.$.cascading_ddl.item_selected = myThis.new_tenant_id;
            }
            myThis.selectedPlaceId = country ? country._id : 0;
            myThis.selectedPlaceName = country ? country.text : undefined;
            myThis.selectedCountryCode = country ? country.code : 'any';

            if (!myThis.selectedEstablishmentId) {
                myThis.$.ajax_activities.go();
                myThis.activityTypeCountsLoaded = false;
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
        } else {

        }
        page('#!/' + this.selectedPlaceId + '/' + this.selectedEstablishmentId + '/' + this.new_tenant_id);
    },
    filter_countries: function (event, detail, sender) {
        if (!this.selectedPlaceName || this.selectedPlaceName == "") {
            this.countries = this.countries_original;
        } else {
            this.countries = _.filter(this.countries_original,(country: any) => {
                return _.startsWith(country.text.toLowerCase(), this.selectedPlaceName.toLowerCase());
            });
        }
    },
    //selectCountry: function (event, detail, sender) {
    //    var index = sender.selectedIndex;
    //    if (index != 0) {
    //        this.selectedPlaceId = this.countries[index - 1].id;
    //        this.selectedPlaceName = this.countries[index - 1].name;
    //        this.selectedCountryCode = this.countries[index - 1].code;
    //    } else {
    //        this.selectedPlaceId = 0;
    //        this.selectedPlaceName = undefined;
    //        this.selectedCountryCode = '';
    //    }
    //    page('#!/' + this.selectedCountryCode + '/' + this.selectedEstablishmentId);
    //},
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
        page('#!/' + this.selectedPlaceId + '/' + this.selectedEstablishmentId + '/' + this.new_tenant_id);
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
    new_tenant_idChanged: function (oldValue, newValue) {
        page('#!/' + this.selectedPlaceId + '/' + this.selectedEstablishmentId + '/' + newValue);
        //this.create_affiliation_select(newValue);
    },
    //create_affiliation_select: function (tenant_id) {
    //    this.$.affiliations_container.innerHTML = "";

    //    function get_ids(affiliations, start_id, end_id, arr = []) {
    //        var affiliation: any = {};
    //        if (start_id != end_id) {
    //            affiliation = _.find(affiliations,(affiliation: any) => {
    //                return affiliation._id == start_id;
    //            });
    //            arr.push(affiliation.parentId.toString());
    //        } else {
    //            affiliation.parentId = end_id;
    //            arr = _.union(arr, [end_id]);
    //        }
    //        if (affiliation.parentId == end_id) {
    //            return arr;
    //        } else {
    //            return get_ids(affiliations, affiliation.parentId, end_id, arr);
    //        }
    //    }

    //    function create_element(affiliations, label_text) {
    //        var paper_dropdown_menu: any = document.createElement('is-ddl');
    //        paper_dropdown_menu.setAttribute('label', label_text);
    //        paper_dropdown_menu.style.marginBottom = '0';
    //        paper_dropdown_menu.style.marginTop = '10px';
    //        paper_dropdown_menu.style.height = '50px';
    //        paper_dropdown_menu.setAttribute('selected', "{{affiliation_selected}}");
    //        paper_dropdown_menu.setAttribute('selectedid', "{{affiliation_selected_id}}");
    //        paper_dropdown_menu.setAttribute('layout', "");
    //        paper_dropdown_menu.setAttribute('horizontal', "");
    //        paper_dropdown_menu.list = affiliations;
    //        return paper_dropdown_menu;
    //    }

    //    function update_affiliations(affiliations, id) {
    //        affiliations = _.filter(affiliations,(affiliation: any) => {
    //            return affiliation.parentId == id;
    //        });
    //        affiliations.unshift({ text: "[all]", _id: id });
    //        return affiliations;
    //    }

    //    function append_elements(affiliations, ids_array, myThis) {

    //        var affiliations_new = update_affiliations(affiliations, ids_array[ids_array.length - 1]);
    //        var label_text = "Select sub-affiliation";
    //        if (ids_array.length > 1) {
    //            var affiliation = _.find(affiliations,(affiliation: any) => {
    //                return affiliation._id == ids_array[ids_array.length - 2];
    //            });
    //            label_text = affiliation.text;
    //        }
    //        if (affiliations_new.length > 1) {
    //            var paper_dropdown_menu = create_element(affiliations_new, label_text);
    //            paper_dropdown_menu.addEventListener("selected_updated",(id) => {
    //                myThis.affiliation_selected = paper_dropdown_menu.selected;
    //            });

    //            myThis.$.affiliations_container.appendChild(paper_dropdown_menu);
    //        }
    //        if (ids_array.length > 1) {
    //            ids_array.pop()
    //            return append_elements(affiliations, ids_array, myThis);
    //        } else {
    //            return true;
    //        }

    //    }


    //    var ids_array = get_ids(this.affiliations, tenant_id, this.tenant_id, [tenant_id.toString()]);


    //    append_elements(this.affiliations, ids_array, this)

    //},
    activitiesResponse: function (response) {
        this.isAjaxing = false;
        this.activityTypeCountsLoaded = true;

        if (!response.detail.response.error) {
            this.activityTypeCounts = response.detail.response;
            this.activity_total_location_count = _.sum(this.activityTypeCounts, function (activity: any) {
                return activity.locationCount;
            });
            this.activity_total_activity_count = _.sum(this.activityTypeCounts, function (activity: any) {
                return activity.typeCount;
            });
        } else {

            console.log(response.detail.response.error)
        }

    },
    agreementsResponse: function (response) {
        this.agreementTypeCountsLoaded = true;
        this.isAjaxing = false;
        if (!response.detail.response.error) {
            this.agreementTypeCounts = response.detail.response;
            this.agreement_total_location_count = _.sum(this.agreementTypeCounts, function (agreement: any) {
                return agreement.locationCount;
            });
            this.agreement_total_agreement_count = _.sum(this.agreementTypeCounts, function (agreement: any) {
                return agreement.typeCount;
            });
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


//var establishmentData = new App.DataCacher<Establishments.ApiModels.ScalarEstablishment[]>(
//    (): JQueryPromise<Establishments.ApiModels.ScalarEstablishment[]> => {
//        return this._loadEstablishmentData();
//    });

//        private _createEstablishmentSelects(response): void {

//    var parentId = this.settings.input.ancestorId;
//    if(!parentId) {
//    parentId = this.settings.new_tenant_id;
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
//    //var mainCampus = this.settings.new_tenant_id;

//    if(!this.mainCampus) {
//    this.mainCampus = this.settings.new_tenant_id;
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