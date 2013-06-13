define(["require", "exports", '../amd-modules/Establishments/SearchResult', '../amd-modules/Establishments/Search', '../amd-modules/Establishments/Item', '../amd-modules/Widgets/Spinner'], function(require, exports, __SearchResultModule__, __SearchModule__, __ItemModule__, __Spinner__) {
    var SearchResultModule = __SearchResultModule__;

    var SearchModule = __SearchModule__;

    var ItemModule = __ItemModule__;

    
    var Spinner = __Spinner__;

    var Search = SearchModule.Search;
    var Item = ItemModule.Item;
    var SearchResult = SearchResultModule.SearchResult;
    var InstitutionalAgreementParticipantModel = (function () {
        function InstitutionalAgreementParticipantModel(isOwner, establishmentId, establishmentOfficialName, establishmentTranslatedName) {
            this.isOwner = ko.observable(isOwner);
            this.establishmentId = ko.observable(establishmentId);
            this.establishmentOfficialName = ko.observable(establishmentOfficialName);
            this.establishmentTranslatedName = ko.observable(establishmentTranslatedName);
        }
        return InstitutionalAgreementParticipantModel;
    })();
    exports.InstitutionalAgreementParticipantModel = InstitutionalAgreementParticipantModel;    
    ;
    var InstitutionalAgreementEditModel = (function () {
        function InstitutionalAgreementEditModel(initDefaultPageRoute) {
            if (typeof initDefaultPageRoute === "undefined") { initDefaultPageRoute = true; }
            this.initDefaultPageRoute = initDefaultPageRoute;
            this.participants = ko.mapping.fromJS([]);
            this.officialNameDoesNotMatchTranslation = ko.computed(function () {
                return !(this.participants.establishmentOfficialName === this.participants.establishmentTranslatedName);
            });
            this.isBound = ko.observable();
            this.back = function () {
                history.back();
            };
            this.sideSwiper = new App.SideSwiper({
                speed: '',
                frameWidth: 970,
                root: '[data-current-module=agreements]'
            });
            this.owner = new Search(false);
            this.owner2 = new Search(false);
            this.tenantDomain = "uc.edu";
            this.spinner = new Spinner.Spinner(new Spinner.SpinnerOptions(400, true));
            this.establishmentSearchViewModel = new Search();
            this.hasBoundSearch = false;
            this.hasBoundItem = false;
            this.SearchPageBind = function () {
                var _this = this;
                this.establishmentSearchViewModel.detailTooltip = function () {
                    return 'Choose this establishment as a participant';
                };
                $("#cancelAddParticipant").on("click", function () {
                    _this.establishmentSearchViewModel.sammy.setLocation('#/');
                });
                $("#searchSideBarAddNew").on("click", function (e) {
                    _this.establishmentSearchViewModel.sammy.setLocation('#/new/');
                    e.preventDefault();
                    return false;
                });
                var dfd = $.Deferred();
                var dfd2 = $.Deferred();
                var $obj = $("#allParticipants");
                var $obj2 = $("#addEstablishment");
                var time = 500;
                this.fadeModsOut(dfd, dfd2, $obj, $obj2, time);
                $.when(dfd, dfd2).done(function () {
                    $("#estSearch").fadeIn(500);
                });
            };
            this.fadeModsOut = function (dfd, dfd2, $obj, $obj2, time) {
                $obj.fadeOut(time, function () {
                    dfd.resolve();
                });
                $obj2.fadeOut(time, function () {
                    dfd2.resolve();
                });
            };
            this.trail = ko.observableArray([]);
            this.nextForceDisabled = ko.observable(false);
            this.prevForceDisabled = ko.observable(false);
            this.pageNumber = ko.observable();
            this.populateParticipants();
            this.isBound(true);
            this.removeParticipant = this.removeParticipant.bind(this);
            this.hideOtherGroups();
        }
        InstitutionalAgreementEditModel.prototype.receiveResults = function (js) {
            if(!js) {
                ko.mapping.fromJS({
                    items: [],
                    itemTotal: 0
                }, this.participants);
            } else {
                ko.mapping.fromJS(js, this.participants);
            }
            this.spinner.stop();
        };
        InstitutionalAgreementEditModel.prototype.populateParticipants = function () {
            var _this = this;
            this.spinner.start();
            $.get(App.Routes.WebApi.Agreements.Participants.get()).done(function (response) {
                _this.receiveResults(response);
            });
        };
        InstitutionalAgreementEditModel.prototype.hideOtherGroups = function () {
            $("#estSearch").css("visibility", "").hide();
            $("#addEstablishment").css("visibility", "").hide();
        };
        InstitutionalAgreementEditModel.prototype.removeParticipant = function (establishmentResultViewModel, e) {
            if(confirm('Are you sure you want to remove "' + establishmentResultViewModel.establishmentTranslatedName() + '" as a participant from this agreement?')) {
                var self = this;
                self.participants.remove(function (item) {
                    if(item.establishmentId() === establishmentResultViewModel.establishmentId()) {
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
        InstitutionalAgreementEditModel.prototype.addParticipant = function (establishmentResultViewModel) {
            var _this = this;
            if(!this.hasBoundSearch) {
                ko.applyBindings(this.establishmentSearchViewModel, $('#estSearch')[0]);
                var lastURL = "asdf";
                this.establishmentSearchViewModel.sammy.bind("location-changed", function () {
                    if(_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf(lastURL) < 0) {
                        if(_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("#/new/") > 0) {
                            var $addEstablishment = $("#addEstablishment");
                            var dfd = $.Deferred();
                            var dfd2 = $.Deferred();
                            var $obj = $("#estSearch");
                            var $obj2 = $("#allParticipants");
                            var time = 500;
                            _this.fadeModsOut(dfd, dfd2, $obj, $obj2, time);
                            $.when(dfd, dfd2).done(function () {
                                $addEstablishment.css("visibility", "").hide().fadeIn(500, function () {
                                    if(!_this.hasBoundItem) {
                                        var establishmentItemViewModel = new Item();
                                        establishmentItemViewModel.goToSearch = function () {
                                            _this.establishmentSearchViewModel.clickAction = function (context) {
                                                establishmentItemViewModel.parentEstablishment(context);
                                                establishmentItemViewModel.parentId(context.id());
                                                _this.establishmentSearchViewModel.sammy.setLocation('#/new/');
                                            };
                                            _this.establishmentSearchViewModel.header("Choose a parent establishment");
                                            _this.establishmentSearchViewModel.sammy.setLocation('#/addest/page/1/');
                                        };
                                        ko.applyBindings(establishmentItemViewModel, $addEstablishment[0]);
                                        _this.hasBoundItem = true;
                                    }
                                });
                            });
                            lastURL = "#/new/";
                        } else if(_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("#/page/") > 0) {
                            $("#asideRootSearch").show();
                            $("#asideParentSearch").hide();
                            _this.SearchPageBind();
                            _this.establishmentSearchViewModel.header("Choose a participant");
                            _this.establishmentSearchViewModel.clickAction = function (context) {
                                var myParticipant = new InstitutionalAgreementParticipantModel(false, context.id(), context.officialName(), context.translatedName());
                                var alreadyExist = false;
                                for(var i = 0; i < _this.participants().length; i++) {
                                    if(_this.participants()[i].establishmentId() === myParticipant.establishmentId()) {
                                        alreadyExist = true;
                                        break;
                                    }
                                }
                                if(alreadyExist !== true) {
                                    $.ajax({
                                        url: App.Routes.WebApi.Agreements.Participant.get(myParticipant.establishmentId()),
                                        type: 'GET',
                                        async: false
                                    }).done(function (response) {
                                        myParticipant.isOwner(response.isOwner);
                                        _this.participants.push(myParticipant);
                                        _this.establishmentSearchViewModel.sammy.setLocation('Agreements/');
                                    }).fail(function () {
                                        _this.participants.push(myParticipant);
                                        _this.establishmentSearchViewModel.sammy.setLocation('Agreements/');
                                    });
                                } else {
                                    alert("This Participant has already been added.");
                                }
                            };
                            lastURL = "#/page/";
                        } else if(_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("#/addest/page/") > 0) {
                            $("#asideRootSearch").hide();
                            $("#asideParentSearch").show();
                            _this.SearchPageBind();
                            lastURL = "#/addest/page/";
                        } else {
                            _this.establishmentSearchViewModel.sammy.setLocation('#/');
                            var dfd = $.Deferred();
                            var dfd2 = $.Deferred();
                            var $obj = $("#estSearch");
                            var $obj2 = $("#addEstablishment");
                            var time = 500;
                            _this.fadeModsOut(dfd, dfd2, $obj, $obj2, time);
                            $.when(dfd, dfd2).done(function () {
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
        };
        InstitutionalAgreementEditModel.prototype.swipeCallback = function () {
        };
        InstitutionalAgreementEditModel.prototype.lockAnimation = function () {
            this.nextForceDisabled(true);
            this.prevForceDisabled(true);
        };
        InstitutionalAgreementEditModel.prototype.unlockAnimation = function () {
            this.nextForceDisabled(false);
            this.prevForceDisabled(false);
        };
        return InstitutionalAgreementEditModel;
    })();
    exports.InstitutionalAgreementEditModel = InstitutionalAgreementEditModel;    
})
