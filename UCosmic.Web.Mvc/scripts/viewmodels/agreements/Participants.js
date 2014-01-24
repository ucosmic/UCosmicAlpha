var Agreements;
(function (Agreements) {
    var Participants = (function () {
        function Participants(agreementId, dfdPopParticipants, agreementIsEdit, establishmentSearchViewModel, hasBoundSearch) {
            var _this = this;
            this.participantsExport = ko.mapping.fromJS([]);
            this.participants = ko.mapping.fromJS([]);
            this.participantsErrorMsg = ko.observable();
            this.editParticipantsErrorMsg = ko.observable();
            this.editParticipantsShowErrorMsg = ko.observable(false);
            this.deletingParticipant = false;
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
            var _this = this;
            if (confirm('Are you sure you want to remove "' + establishmentResultViewModel.establishmentTranslatedName() + '" as a participant from this agreement?')) {
                var self = this;
                if (this.agreementIsEdit()) {
                    if (ko.dataFor(e.target).isOwner()) {
                        var counter = 0;
                        $.each(ko.contextFor(e.target).$parent.participants(), function (i, item) {
                            if (item.isOwner() == true) {
                                counter++;
                            }
                        });
                        this.editParticipantsShowErrorMsg(false);
                        if (counter < 2) {
                            this.editParticipantsErrorMsg("You must add another home participant before you can delete this one.");
                            this.editParticipantsShowErrorMsg(true);
                            return false;
                        }
                    }

                    if (this.deletingParticipant == false) {
                        this.deletingParticipant = true;
                        var url = App.Routes.WebApi.Agreements.Participants.del(this.agreementId, ko.dataFor(e.target).establishmentId());

                        $.ajax({
                            url: url,
                            type: 'DELETE',
                            success: function () {
                                _this.deletingParticipant = false;
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
                                _this.deletingParticipant = false;
                                alert(xhr.responseText);
                            }
                        });
                    }
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
                var mappingOptions = {
                    create: function (options) {
                        return (new (function () {
                            this.officialNameDoesNotMatchTranslation = ko.computed(function () {
                                return !(options.data.establishmentOfficialName === options.data.establishmentTranslatedName || !options.data.establishmentOfficialName);
                            });

                            ko.mapping.fromJS(options.data, {}, this);
                        })());
                    }
                };
                ko.mapping.fromJS(js, mappingOptions, this.participants);
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
