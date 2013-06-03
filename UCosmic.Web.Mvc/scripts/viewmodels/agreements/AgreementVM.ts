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
import SearchApiModel = module('../amd-modules/Establishments/ServerApiModel');
import Spinner = module('../amd-modules/Widgets/Spinner');
var Search = SearchModule.Search;
var SearchResult = SearchResultModule.SearchResult;


export class InstitutionalAgreementParticipantModel {

    constructor(isOwner: any, establishmentId: number, establishmentOfficialName: string,
        establishmentTranslatedName: string) {
        this.isOwner = ko.computed(function () {
            return isOwner
        });
        this.establishmentId = ko.computed(function () {
            return establishmentId
        });
        this.establishmentOfficialName = ko.computed(function () {
            return establishmentOfficialName
        });
        this.establishmentTranslatedName = ko.computed(function () {
            return establishmentTranslatedName
        });
    }

    isOwner;

    establishmentId;
    establishmentOfficialName;
    establishmentTranslatedName;


    //isNotOwner = ko.computed(function () {
    //    return false; //participant.isOwner();
    //});

};

export class InstitutionalAgreementEditModel {
    constructor(public initDefaultPageRoute?: bool = true) {

        this.populateParticipants();

        this.isBound(true);
        this.removeParticipant = <() => bool> this.removeParticipant.bind(this);


    }

    participants = ko.mapping.fromJS([]);


    officialNameDoesNotMatchTranslation = ko.computed( function() {
        return !(this.participants.establishmentOfficialName === this.participants.establishmentTranslatedName);
    });

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
    owner2 = new Search(false);
    //mySR = new SearchResult();
    tenantDomain = "uc.edu"; //$('#tenancy_domain').val();
    spinner: Spinner.Spinner = new Spinner.Spinner(new Spinner.SpinnerOptions(400, true));
    receiveResults(js: SearchApiModel.IServerApiFlatModel[]): void {
        if (!js) {
            ko.mapping.fromJS({
                items: [],
                itemTotal: 0
            }, this.participants);
        }
        else {
            ko.mapping.fromJS(js, this.participants);
        }
        //App.WindowScroller.restoreTop(); // restore scroll when coming back from detail page
        this.spinner.stop();
    }

    populateParticipants(): void {

        this.spinner.start();
        $.get(App.Routes.WebApi.Agreements.Participants.get())
            .done((response: SearchApiModel.IServerApiFlatModel[]): void => {
                this.receiveResults(response);
               
            });
    }
    



     
    removeParticipant(establishmentResultViewModel, e): bool {
        if (confirm('Are you sure you want to remove "' +
            establishmentResultViewModel.establishmentTranslatedName() +
            '" as a participant from this agreement?')) {
            var self = this;
            self.participants.remove(function (item) {
                if (item.establishmentId() === establishmentResultViewModel.establishmentId()) {
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
    hasBoundSearch = false;

  
    addParticipant(establishmentResultViewModel): void {
        //var establishmentSearchViewModel = new Search();
        if (!this.hasBoundSearch) {
            ko.applyBindings(this.establishmentSearchViewModel, $('#estSearch')[0]);
            this.establishmentSearchViewModel.sammy.run();
        }
        this.hasBoundSearch = true;

        //this.establishmentSearchViewModel.newParticipant = ko.observable();

        this.establishmentSearchViewModel.detailTooltip = (): string => {
            return 'Choose this establishment as a participant';
        };

        $("#cancelAddParticipant").on("click", function () {
            $("#estSearch").fadeOut(500, function () {
                $("#allParticipants").fadeIn(500);
            });
        });
        this.establishmentSearchViewModel.clickAction = function (context): bool => {


            var myParticipant = new InstitutionalAgreementParticipantModel(
                false,
                context.id(),
                context.officialName(),
                context.translatedName()
            );
            var alreadyExist = false;
            for (var i = 0; i < this.participants().length; i++) {
                if (this.participants()[i].establishmentId() === myParticipant.establishmentId()) {
                    alreadyExist = true;
                    break;
                }
            }
            if (alreadyExist !== true) {
                this.participants.push(myParticipant);
                $("#estSearch").fadeOut(500, function () {
                    $("#allParticipants").fadeIn(500);
                });
            } else {
                alert("This Participant has already been added.")
            }


        }

        $("#allParticipants").fadeOut(500, function () {
            $("#estSearch").fadeIn(500);
        });

    };
       

    //x = ko.observable().publishOn("test");
   // newParticipant = ko.observable().syncWith("participants", true);
    


    trail: KnockoutObservableStringArray = ko.observableArray([]);
    swipeCallback(): void {
    }
    //$itemsPage: JQuery = undefined;
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

