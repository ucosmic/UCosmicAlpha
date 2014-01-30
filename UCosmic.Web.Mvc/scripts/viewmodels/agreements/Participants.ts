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
                                        });
                                    }
                                    return false;
                                });
                            },
                            error: (xhr: JQueryXHR): void => {
                                App.Failures.message(xhr, xhr.responseText, true);
                                alert(xhr.responseText);
                            }
                        })
                    }
                } else {
                    self.participants.remove(function (item) {
                        if (item.establishmentId() === establishmentResultViewModel.establishmentId()) {
                            $(item.participantEl).slideUp('fast', function () {
                                self.participants.remove(item);
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
                // specifies the create callback for the 'persons' property
                var mappingOptions = {

                    // overriding the default creation / initialization code
                    create: function (options) {

                        // immediately return a new instance of an inline-function.  We're doing this so the
                        //     context ("this"), is correct when the code is actually executed.
                        //     "this" should point to the item in what will be the observable array.
                        //     I put a few more parens in here to make things a little more obvious
                        return (new (function () {

                            // setup the computed binding 
                            this.officialNameDoesNotMatchTranslation = ko.computed(function () {
                                return !(options.data.establishmentOfficialName === options.data.establishmentTranslatedName || !options.data.establishmentOfficialName);
                            });

                            // let the ko mapping plugin continue to map out this object, so the rest of it will be observable
                            ko.mapping.fromJS(options.data, {}, this);
                        })(/* call the ctor here */));
                    }
                };
                ko.mapping.fromJS(js, mappingOptions, this.participants);
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