/// <reference path="../../typings/knockout.postbox/knockout-postbox.d.ts" />
/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../app/SideSwiper.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../../sammy/sammyjs-0.7.d.ts" />

import SearchResultModule = module('../amd-modules/Establishments/SearchResult');
//import app = module('../amd-modules/app/app');
import SearchModule = module('../amd-modules/Establishments/Search');
var Search = SearchModule.Search;
var SearchResult = SearchResultModule.SearchResult;
var InstitutionalAgreementParticipantModel = SearchModule.InstitutionalAgreementParticipantModel;


//function InstitutionalAgreementParticipantModel2(js) {
//    var self = this;
//    ko.mapping.fromJS(js, {}, self);

//    self.isNotOwner = ko.computed(function () {
//        return !self.isOwner();
//    });

//    self.participantEl = undefined;
//}

export class InstitutionalAgreementEditModel {
    constructor(public initDefaultPageRoute?: bool = true) {

        this.populateParticipants();
        //this.setupSearchVM();
        //this._setupSammy();
        this.isBound(true);
        this.removeParticipant = <() => bool> this.removeParticipant.bind(this);
        //this.addNewParticipant = <() => bool> this.addNewParticipant.bind(this);
        this.addNewParticipant = ko.computed((): void => {
            if (this.newParticipant() !== undefined) {
                this.participants.push(this.newParticipant());
            }
        });
    }

    addNewParticipant: KnockoutComputed;
    isBound = ko.observable();

    back = function () {
        history.back();
    };

    sideSwiper = new App.SideSwiper({
        speed: '',
        frameWidth: 970,
        root: '[data-current-module=agreements]'
    });

    // participants
    owner = new Search(false);
    tenantDomain = "uc.edu"; //$('#tenancy_domain').val();

    populateParticipants(): void {
        var homeParticipant = new InstitutionalAgreementParticipantModel({
            isOwner: true,
            establishment: new SearchResult({
                id: 1,
                officialName: 'University of Cincinnati',
                translatedName: 'University of Cincinnati',
                officialUrl: 'www.uc.edu',
                countryName: 'United States',
                countryCode: 'asdf',
                uCosmicCode: 'asdf',
                ceebCode: 'asdf'
            }, this.owner)
        });
        if (this.tenantDomain === 'usf.edu') {
            homeParticipant.establishment = new SearchResult({
                id: 1,
                officialName: 'University of South Florida',
                translatedName: 'University of South Florida',
                officialUrl: 'www.usf.edu',
                countryName: 'United States',
                countryCode: 'asdf',
                uCosmicCode: 'asdf',
                ceebCode: 'asdf'
            }, this.owner)
        }
        if (this.tenantDomain === 'lehigh.edu') {
            homeParticipant.establishment = new SearchResult({
                id: 1,
                officialName: 'Lehigh University',
                translatedName: 'Lehigh University',
                officialUrl: 'www.lehigh.edu',
                countryName: 'United States',
                countryCode: 'asdf',
                uCosmicCode: 'asdf',
                ceebCode: 'asdf'
            }, this.owner);
        }
        if (this.tenantDomain === 'umn.edu') {
            homeParticipant.establishment = new SearchResult({
                id: 1,
                officialName: 'University of Minnesota',
                translatedName: 'University of Minnesota',
                officialUrl: 'www.umn.edu',
                countryName: 'United States',
                countryCode: 'asdf',
                uCosmicCode: 'asdf',
                ceebCode: 'asdf'
            }, this.owner)
        }
        if (this.tenantDomain === 'uc.edu') {
            homeParticipant.establishment = new SearchResult({
                id: 1,
                officialName: 'University of Cincinnati',
                translatedName: 'University of Cincinnati',
                officialUrl: 'www.uc.edu',
                countryName: 'United States',
                countryCode: 'asdf',
                uCosmicCode: 'asdf',
                ceebCode: 'asdf'
            }, this. owner)
        }
        if (this.tenantDomain === 'suny.edu') {
            homeParticipant.establishment = new SearchResult({
                id: 1,
                officialName: 'State University of New York',
                translatedName: 'State University of New York',
                officialUrl: 'www.suny.edu',
                countryName: 'United States',
                countryCode: 'asdf',
                uCosmicCode: 'asdf',
                ceebCode: 'asdf'
            }, this.owner)
        }
        this.participants.push(homeParticipant);
    }
    



     
    removeParticipant(establishmentResultViewModel, e): bool {
        if (confirm('Are you sure you want to remove "' +
            establishmentResultViewModel.translatedName() +
            '" as a participant from this agreement?')) {
            var self = this;
            self.participants.remove(function (item) {
                if (item.establishment.id() === establishmentResultViewModel.id()) {
                    $(item.participantEl).slideUp('fast', function () {
                        self.participants.remove(item);
                    });
                }
                return false;
            });
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
    };
    establishmentSearchViewModel = new Search();
        // override establishment item click to add as participant
    addParticipant(establishmentResultViewModel): void {
        //var establishmentSearchViewModel = new Search();
        ko.applyBindings(this.establishmentSearchViewModel, $('#estSearch')[0]);
        this.establishmentSearchViewModel.sammy.run();

        $("#allParticipants").fadeOut(500, function () {
            $("#estSearch").fadeIn(500);
        });

        sessionStorage.setItem("Agreement", "1");
    };
       

    x = ko.observable().publishOn("test");
    newParticipant = ko.observable().syncWith("participants", true);
    participants = ko.observableArray();
    


    trail: KnockoutObservableStringArray = ko.observableArray([]);
    swipeCallback(): void {
    }
    $itemsPage: JQuery = undefined;
    nextForceDisabled: KnockoutObservableBool = ko.observable(false);
    prevForceDisabled: KnockoutObservableBool = ko.observable(false);
    pageNumber: KnockoutObservableNumber = ko.observable();
    lockAnimation(): void {
        this.nextForceDisabled(true);
        this.prevForceDisabled(true);
    }
    unlockAnimation(): void {
        this.nextForceDisabled(false);
        this.prevForceDisabled(false);
    }



}

