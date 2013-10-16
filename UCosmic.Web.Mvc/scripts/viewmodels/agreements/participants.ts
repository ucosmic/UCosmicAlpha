/// <reference path="../../app/Routes.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/kendo/kendo.all.d.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../establishments/ApiModels.d.ts" />

module agreements {

    export class participants {
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
        participantsShowErrorMsg;


        removeParticipant(establishmentResultViewModel, e): boolean {
            if (confirm('Are you sure you want to remove "' +
                establishmentResultViewModel.establishmentTranslatedName() +
                '" as a participant from this agreement?')) {
                    var self = this;

                if (this.agreementIsEdit()) {
                    var url = App.Routes.WebApi.Agreements.Participants.del(this.agreementId, ko.dataFor(e.target).establishmentId());

                    $.ajax({
                        url: url,
                        type: 'DELETE',
                        success: (): void => {
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
                            alert(xhr.responseText);
                        }
                    })
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