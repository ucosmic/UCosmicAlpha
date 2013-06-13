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
import SearchModule = module('../amd-modules/Establishments/Search');
import ItemModule = module('../amd-modules/Establishments/Item');
import SearchApiModel = module('../amd-modules/Establishments/ServerApiModel');
import Spinner = module('../amd-modules/Widgets/Spinner');
var Search = SearchModule.Search;
var Item = ItemModule.Item;
var SearchResult = SearchResultModule.SearchResult;


export class InstitutionalAgreementParticipantModel {

    constructor(isOwner: any, establishmentId: number, establishmentOfficialName: string,
        establishmentTranslatedName: string) {
        this.isOwner = ko.observable(isOwner);
        this.establishmentId = ko.observable(establishmentId);
        this.establishmentOfficialName = ko.observable(establishmentOfficialName);
        this.establishmentTranslatedName = ko.observable(establishmentTranslatedName);
    }

    isOwner;

    establishmentId;
    establishmentOfficialName;
    establishmentTranslatedName;

};

export class InstitutionalAgreementEditModel {
    constructor(public initDefaultPageRoute?: bool = true) {

        this.populateParticipants();

        this.isBound(true);
        this.removeParticipant = <() => bool> this.removeParticipant.bind(this);

        this.hideOtherGroups();
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
    tenantDomain = "uc.edu"; 
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
        this.spinner.stop();
    }

    populateParticipants(): void {

        this.spinner.start();
        $.get(App.Routes.WebApi.Agreements.Participants.get())
            .done((response: SearchApiModel.IServerApiFlatModel[]): void => {
                this.receiveResults(response);
               
            });


    }
    
    hideOtherGroups(): void {
        $("#estSearch").css("visibility", "").hide();
        $("#addEstablishment").css("visibility", "").hide();
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


    hasBoundSearch = false;

    hasBoundItem = false;

    SearchPageBind = function () {

        this.establishmentSearchViewModel.detailTooltip = (): string => {
            return 'Choose this establishment as a participant';
        };

        $("#cancelAddParticipant").on("click", function () => {
            this.establishmentSearchViewModel.sammy.setLocation('#/');
        });
        $("#searchSideBarAddNew").on("click", function (e) => {
            this.establishmentSearchViewModel.sammy.setLocation('#/new/');
            e.preventDefault();
            return false;
        });
        var dfd = $.Deferred();
        var dfd2 = $.Deferred();
        var $obj = $("#allParticipants");
        var $obj2 = $("#addEstablishment");
        var time = 500;
        this.fadeModsOut(dfd, dfd2, $obj, $obj2, time);
        $.when(dfd, dfd2)
            .done(function () => {
            $("#estSearch").fadeIn(500);
        });
        
    };
    fadeModsOut = function (dfd, dfd2, $obj, $obj2, time) {
        $obj.fadeOut(time, function () {
            dfd.resolve();
        });
        $obj2.fadeOut(time, function () {
            dfd2.resolve();
        });
    };
    
    addParticipant(establishmentResultViewModel): void {
        if (!this.hasBoundSearch) {
            ko.applyBindings(this.establishmentSearchViewModel, $('#estSearch')[0]);
            var lastURL = "asdf";
            this.establishmentSearchViewModel.sammy.bind("location-changed", function () => {
                if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf(lastURL) < 0) {
                   
                    if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("#/new/") > 0) {
                        var $addEstablishment = $("#addEstablishment");
                        var dfd = $.Deferred();
                        var dfd2 = $.Deferred();
                        var $obj = $("#estSearch");
                        var $obj2 = $("#allParticipants");
                        var time = 500;
                        this.fadeModsOut(dfd, dfd2, $obj, $obj2, time);
                        $.when(dfd, dfd2)
                            .done(function () => {
                                $addEstablishment.css("visibility", "").hide().fadeIn(500, function () => {
                                    if (!this.hasBoundItem) {
                                        var establishmentItemViewModel = new Item();
                                        establishmentItemViewModel.goToSearch = function () => {
                                            this.establishmentSearchViewModel.clickAction = function (context): bool => {
                                                establishmentItemViewModel.parentEstablishment(context);
                                                establishmentItemViewModel.parentId(context.id());
                                                this.establishmentSearchViewModel.sammy.setLocation('#/new/');
                                            };
                                            this.establishmentSearchViewModel.header("Choose a parent establishment");
                                            this.establishmentSearchViewModel.sammy.setLocation('#/addest/page/1/');
                                        }
                                        ko.applyBindings(establishmentItemViewModel, $addEstablishment[0]);
                                        this.hasBoundItem = true;
                                    }
                                });
                            })
                        lastURL = "#/new/";
                    } else if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("#/page/") > 0) {
                        $("#asideRootSearch").show();
                        $("#asideParentSearch").hide();
                        this.SearchPageBind();
                        this.establishmentSearchViewModel.header("Choose a participant");

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
                                $.ajax({
                                    url: App.Routes.WebApi.Agreements.Participant.get(myParticipant.establishmentId()),
                                    type: 'GET',
                                    async: false
                                })
                                .done(function (response) => {
                                    myParticipant.isOwner(response.isOwner);
                                    this.participants.push(myParticipant);
                                    this.establishmentSearchViewModel.sammy.setLocation('Agreements/');
                                })
                                .fail(function () => {
                                    //alert('fail');
                                    this.participants.push(myParticipant);
                                    this.establishmentSearchViewModel.sammy.setLocation('Agreements/');
                                });
                            } else {
                                alert("This Participant has already been added.")
                            }
                        }
                        lastURL = "#/page/";
                    } else if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("#/addest/page/") > 0) {
                        $("#asideRootSearch").hide();
                        $("#asideParentSearch").show();
                        this.SearchPageBind();
                        lastURL = "#/addest/page/";
                    } else {
                        this.establishmentSearchViewModel.sammy.setLocation('#/');
                        var dfd = $.Deferred();
                        var dfd2 = $.Deferred();
                        var $obj = $("#estSearch");
                        var $obj2 = $("#addEstablishment");
                        var time = 500;
                        this.fadeModsOut(dfd, dfd2, $obj, $obj2, time);
                        $.when(dfd, dfd2)
                            .done(function () => {
                            $("#allParticipants").fadeIn(500);
                        });
                        lastURL = "#/index";
                    }

                }
            });

            this.establishmentSearchViewModel.sammy.run();
        }
        this.establishmentSearchViewModel.sammy.setLocation('#/page/1/');
        this.hasBoundSearch = true;

        //this.establishmentSearchViewModel.newParticipant = ko.observable();

        ////this should work, but does not override the function correctly
        //probably something to do with ko bindings because the above clickaction works
        //this.establishmentSearchViewModel.gotoAddNew = (viewModel: any, e: JQueryEventObject): bool => {

        //var $addEstablishment = $("#addEstablishment");
        //$("#estSearch").fadeOut(500, function () => {
        //    $addEstablishment.css("visibility", "").hide().fadeIn(500, function () => {
        //        var establishmentItemViewModel = new Item();
        //        this.establishmentSearchViewModel.sammy.setLocation('agreements/new/#/');
        //        ko.applyBindings(establishmentItemViewModel, $addEstablishment[0]);
        //    });
        //});
        //e.preventDefault();
        //return false;

        //}


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

