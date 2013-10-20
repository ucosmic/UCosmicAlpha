/// <reference path="../../app/Routes.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/kendo/kendo.all.d.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../establishments/ApiModels.d.ts" />
var Agreements;
(function (Agreements) {
    var Participants = (function () {
        function Participants(agreementId, dfdPopParticipants, agreementIsEdit, establishmentSearchViewModel, hasBoundSearch) {
            var _this = this;
            //participant vars
            this.participantsExport = ko.mapping.fromJS([]);
            this.participants = ko.mapping.fromJS([]);
            this.participantsErrorMsg = ko.observable();
            this.removeParticipant = this.removeParticipant.bind(this);
            this.agreementIsEdit = agreementIsEdit;
            this.agreementId = agreementId;
            this.dfdPopParticipants = dfdPopParticipants;
            this.hasBoundSearch = hasBoundSearch;
            this.establishmentSearchViewModel = establishmentSearchViewModel;

            this.participantsShowErrorMsg = ko.computed(function () {
                var validateParticipantsHasOwner = false;

                $.each(_this.participants(), function (i, item) {
                    if (item.isOwner() == true) {
                        validateParticipantsHasOwner = true;
                    }
                });
                if (validateParticipantsHasOwner == false) {
                    _this.participantsErrorMsg("Home participant is required.");
                    return true;
                } else {
                    return false;
                }
            });
        }
        Participants.prototype.removeParticipant = function (establishmentResultViewModel, e) {
            if (confirm('Are you sure you want to remove "' + establishmentResultViewModel.establishmentTranslatedName() + '" as a participant from this agreement?')) {
                var self = this;

                if (this.agreementIsEdit()) {
                    var url = App.Routes.WebApi.Agreements.Participants.del(this.agreementId, ko.dataFor(e.target).establishmentId());

                    $.ajax({
                        url: url,
                        type: 'DELETE',
                        success: function () {
                            self.participants.remove(function (item) {
                                if (item.establishmentId() === establishmentResultViewModel.establishmentId()) {
                                    $(item.participantEl).slideUp('fast', function () {
                                        self.participants.remove(item);
                                        $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * 1.1)));
                                    });
                                }
                                return false;
                            });
                        },
                        error: function (xhr, statusText, errorThrown) {
                            alert(xhr.responseText);
                        }
                    });
                } else {
                    self.participants.remove(function (item) {
                        if (item.establishmentId() === establishmentResultViewModel.establishmentId()) {
                            $(item.participantEl).slideUp('fast', function () {
                                self.participants.remove(item);
                                $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * 1.1)));
                            });
                        }
                        return false;
                    });
                }
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
        };

        Participants.prototype.receiveParticipants = function (js) {
            if (!js) {
                ko.mapping.fromJS({
                    items: [],
                    itemTotal: 0
                }, this.participants);
            } else {
                ko.mapping.fromJS(js, this.participants);
            }
        };

        Participants.prototype.populateParticipants = function () {
            var _this = this;
            $.get(App.Routes.WebApi.Agreements.Participants.get(this.agreementId)).done(function (response) {
                _this.receiveParticipants(response);
                _this.dfdPopParticipants.resolve();
            });
        };

        Participants.prototype.addParticipant = function (establishmentResultViewModel) {
            this.establishmentSearchViewModel.sammy.setLocation('#/page/1/');
            this.hasBoundSearch.does = true;
        };
        return Participants;
    })();
    Agreements.Participants = Participants;
})(Agreements || (Agreements = {}));
