module Agreements {

    export class Participants {
        constructor(agreementId, dfdPopParticipants, agreementIsEdit, establishmentSearchViewModel, hasBoundSearch) {
            this.removeParticipant = <() => boolean> this.removeParticipant.bind(this);
            this.agreementIsEdit = agreementIsEdit;
            this.agreementId = agreementId;
            this.dfdPopParticipants = dfdPopParticipants;
            this.hasBoundSearch = hasBoundSearch;
            this.establishmentSearchViewModel = establishmentSearchViewModel;

            this.participantsShowErrorMsg = ko.computed(() => {
                var validateParticipantsHasOwner = false;

                $.each(this.participants(), function (i, item) {
                    if (item.isOwner() == true) {
                        validateParticipantsHasOwner = true;
                    }
                });
                if (validateParticipantsHasOwner == false) {
                    this.participantsErrorMsg("Home participant is required.");
                    return true;
                } else {
                    return false;
                }
            });
        }
        //imported vars
        agreementId;
        dfdPopParticipants;
        agreementIsEdit;
        establishmentSearchViewModel;
        hasBoundSearch;

        //participant vars
        participantsExport = ko.mapping.fromJS([]);
        participants = ko.mapping.fromJS([]);
        participantsErrorMsg = ko.observable();
        editParticipantsErrorMsg = ko.observable();
        editParticipantsShowErrorMsg = ko.observable(false);
        participantsShowErrorMsg;
        deletingParticipant = false;


        removeParticipant(establishmentResultViewModel, e): boolean {
            if (confirm('Are you sure you want to remove "' +
                establishmentResultViewModel.establishmentTranslatedName() +
                '" as a participant from this agreement?')) {
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
                            //alert("You must add another home participant before you can delete this one.");
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
                            success: (): void => {
                                this.deletingParticipant = false;
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
                            error: (xhr: JQueryXHR, statusText: string, errorThrown: string): void => {// validation message will be in xhr response text...
                                this.deletingParticipant = false;
                                alert(xhr.responseText);
                            }
                        })
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
        }

        receiveParticipants(js: any): void {
            if (!js) {
                ko.mapping.fromJS({
                    items: [],
                    itemTotal: 0
                }, this.participants);
            }
            else {
                ko.mapping.fromJS(js, this.participants);
            }
        }

        populateParticipants(): void {
            $.get(App.Routes.WebApi.Agreements.Participants.get(this.agreementId))
                .done((response: any): void => {
                    this.receiveParticipants(response);
                    this.dfdPopParticipants.resolve();
                });
        }

        addParticipant(establishmentResultViewModel): void {
            this.establishmentSearchViewModel.sammy.setLocation('#/page/1/');
            this.hasBoundSearch.does = true;
        }

    }
}