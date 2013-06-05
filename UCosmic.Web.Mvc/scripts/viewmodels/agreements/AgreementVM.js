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
            this.isOwner = ko.computed(function () {
                return isOwner;
            });
            this.establishmentId = ko.computed(function () {
                return establishmentId;
            });
            this.establishmentOfficialName = ko.computed(function () {
                return establishmentOfficialName;
            });
            this.establishmentTranslatedName = ko.computed(function () {
                return establishmentTranslatedName;
            });
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
            this.trail = ko.observableArray([]);
            this.nextForceDisabled = ko.observable(false);
            this.prevForceDisabled = ko.observable(false);
            this.pageNumber = ko.observable();
            this.populateParticipants();
            this.isBound(true);
            this.removeParticipant = this.removeParticipant.bind(this);
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
                this.establishmentSearchViewModel.sammy.run();
            }
            this.hasBoundSearch = true;
            this.establishmentSearchViewModel.detailTooltip = function () {
                return 'Choose this establishment as a participant';
            };
            $("#cancelAddParticipant").on("click", function () {
                $("#estSearch").fadeOut(500, function () {
                    $("#allParticipants").fadeIn(500);
                });
            });
            this.establishmentSearchViewModel.clickAction = function (context) {
                var myParticipant = new InstitutionalAgreementParticipantModel(false, context.id(), context.officialName(), context.translatedName());
                var alreadyExist = false;
                for(var i = 0; i < _this.participants().length; i++) {
                    if(_this.participants()[i].establishmentId() === myParticipant.establishmentId()) {
                        alreadyExist = true;
                        break;
                    }
                }
                if(alreadyExist !== true) {
                    _this.participants.push(myParticipant);
                    $("#estSearch").fadeOut(500, function () {
                        $("#allParticipants").fadeIn(500);
                    });
                } else {
                    alert("This Participant has already been added.");
                }
            };
            $("#searchSideBarAddNew").on("click", function (e) {
                $("#estSearch").fadeOut(500, function () {
                    $("#addEstablishment").fadeIn(500);
                });
                e.preventDefault();
                var establishmentItemViewModel = new Item();
                _this.establishmentSearchViewModel.sammy.setLocation('agreements/new/#/');
                ko.applyBindings(establishmentItemViewModel, $('[data-current-module=admin]')[0]);
                return false;
            });
            $("#allParticipants").fadeOut(500, function () {
                $("#estSearch").fadeIn(500);
            });
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
