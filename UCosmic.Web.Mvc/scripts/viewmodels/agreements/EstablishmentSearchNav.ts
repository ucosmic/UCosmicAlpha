module Agreements {

    export class InstitutionalAgreementParticipantModel {
        constructor(isOwner: any, establishmentId: number, establishmentOfficialName: string,
            establishmentTranslatedName: string) {
            this.isOwner = ko.observable(isOwner);
            this.establishmentId = ko.observable(establishmentId);
            this.establishmentOfficialName = ko.observable(establishmentOfficialName);
            this.establishmentTranslatedName = ko.observable(establishmentTranslatedName);

            this.officialNameDoesNotMatchTranslation = ko.computed(() => {
                return !(this.establishmentOfficialName === this.establishmentTranslatedName || !this.establishmentOfficialName);
            });
        }
        isOwner;
        establishmentId;
        establishmentOfficialName;
        establishmentTranslatedName;
        officialNameDoesNotMatchTranslation;
    };

    export class EstablishmentSearchNav {
        constructor(editOrNewUrl, participants, agreementIsEdit, agreementId, scrollBody, deferredPageFadeIn) {
            this.editOrNewUrl = editOrNewUrl;
            this.participants = participants;
            this.agreementIsEdit = agreementIsEdit;
            this.agreementId = agreementId;
            this.scrollBody = scrollBody;
            this.deferredPageFadeIn = deferredPageFadeIn;
        }

        //imported vars
        editOrNewUrl;
        participants;
        agreementIsEdit;
        agreementId;
        scrollBody;
        deferredPageFadeIn;

        //search vars
        establishmentSearchViewModel = new Establishments.ViewModels.Search();
        establishmentItemViewModel;
        hasBoundSearch = { does: false };
        hasBoundItem = false;

        SearchPageBind(parentOrParticipant: string): void {
            var $cancelAddParticipant = $("#cancelAddParticipant"),
                $searchSideBarAddNew = $("#searchSideBarAddNew"),
                $searchSideBarAddNew2 = $("#searchSideBarAddNew2"),
                deferred = $.Deferred(),
                deferred2 = $.Deferred(),
                $obj = $("[data-current-module=agreements]"),
                $obj2 = $("#add_establishment"),
                time = 500;

            this.establishmentSearchViewModel.detailTooltip = (): string => {
                return 'Choose this establishment as a ' + parentOrParticipant;
            }

            $cancelAddParticipant.off();
            $searchSideBarAddNew.off();
            $searchSideBarAddNew.on("click", (e) => {
                this.establishmentSearchViewModel.sammy.setLocation('#/new/');
                e.preventDefault();
                return false;
            });
            $searchSideBarAddNew2.off();
            $searchSideBarAddNew2.on("click", (e) => {
                this.establishmentSearchViewModel.sammy.setLocation('#/new/');
                e.preventDefault();
                return false;
            });
            if (parentOrParticipant === "parent") {
                $cancelAddParticipant.on("click", (e) => {
                    this.establishmentSearchViewModel.sammy.setLocation('#/new/');
                    e.preventDefault();
                    return false;
                });
            } else {
                $cancelAddParticipant.on("click", (e) => {
                    this.establishmentSearchViewModel.sammy.setLocation('#/index');
                    e.preventDefault();
                    return false;
                });
            }
            this.fadeModsOut(deferred, deferred2, $obj, $obj2, time);

            $.when(deferred, deferred2).done(function () {
                $("#establishment_search").fadeIn(500);
            });
        }

        //fade non active modules out
        fadeModsOut(deferred, deferred2, $obj, $obj2, time): void {
            if ($obj.css("display") !== "none") {
                $obj.fadeOut(time, function () {
                    deferred.resolve();
                });
            }
            else {
                deferred.resolve();
            }
            if ($obj2.css("display") !== "none") {
                $obj2.fadeOut(time, function () {
                    deferred2.resolve();
                });
            }
            else {
                deferred2.resolve();
            }
        }

        //sammy navigation
        bindSearch(): void {
            if (!this.hasBoundSearch.does) {
                var lastURL = "asdf";
                $("body").css("min-height", "0");

                this.establishmentSearchViewModel.sammyBeforeRoute = /\#\/index\/(.*)\//;
                this.establishmentSearchViewModel.sammyGetPageRoute = '#/index';
                this.establishmentSearchViewModel.sammyDefaultPageRoute = '/agreements[\/]?';
                ko.applyBindings(this.establishmentSearchViewModel, $('#establishment_search')[0]);
                if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("#") === -1) {
                    if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("" + this.editOrNewUrl.val + "") === -1) {
                        this.establishmentSearchViewModel.sammy.setLocation("/agreements/" + this.editOrNewUrl.val + "#/index");
                    } else {
                        this.establishmentSearchViewModel.sammy.setLocation('#/index');
                    }
                }
                if (sessionStorage.getItem("addest") == undefined) {
                    sessionStorage.setItem("addest", "no");
                }
                //Check the url for changes
                this.establishmentSearchViewModel.sammy.bind("location-changed", () => {
                    if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf(lastURL) < 0) {
                        var $asideRootSearch = $("#asideRootSearch"),
                            $asideParentSearch = $("#asideParentSearch");

                        if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("" + this.editOrNewUrl.val + "#/new/") > 0) {
                            var $addEstablishment = $("#add_establishment");
                            deferred = $.Deferred(),
                            deferred2 = $.Deferred(),
                            $obj = $("#establishment_search"),
                            $obj2 = $("[data-current-module=agreements]"),
                            time = 500;
                            this.fadeModsOut(deferred, deferred2, $obj, $obj2, time);
                            $.when(deferred, deferred2)
                                .done(() => {
                                    $("#establishment_page").find("aside").find("li").removeClass("current");
                                    $("#nav_names").addClass("current");
                                    $addEstablishment.css("visibility", "").hide().fadeIn(500, () => {
                                    //ko.cleanNode($addEstablishment[0]);
                                    if (!this.hasBoundItem) {
                                        var $cancelAddEstablishment = $("#cancelAddEstablishment");

                                        this.establishmentItemViewModel = new Establishments.ViewModels.Item(null, false);
                                        this.establishmentItemViewModel.goToSearch = () => {
                                            sessionStorage.setItem("addest", "yes");
                                            this.establishmentSearchViewModel.sammy.setLocation('#/page/1/');
                                        }
                                        this.establishmentItemViewModel.submitToCreate = (formElement: HTMLFormElement): boolean => {
                                            if (!this.establishmentItemViewModel.id || this.establishmentItemViewModel.id === 0) {
                                                var me = this.establishmentItemViewModel,
                                                    officialName: Establishments.ViewModels.Name = this.establishmentItemViewModel.names()[0],
                                                    officialUrl: Establishments.ViewModels.Url = this.establishmentItemViewModel.urls()[0],
                                                    location = this.establishmentItemViewModel.location;

                                                this.establishmentItemViewModel.validatingSpinner.start();
                                                // reference the single name and url
                                                // wait for async validation to stop
                                                if (officialName.text.isValidating() || officialUrl.value.isValidating() ||
                                                    this.establishmentItemViewModel.ceebCode.isValidating() || this.establishmentItemViewModel.uCosmicCode.isValidating()) {
                                                    setTimeout((): boolean => {
                                                        var waitResult = this.establishmentItemViewModel.submitToCreate(formElement);

                                                        return false;
                                                    }, 50);
                                                    return false;
                                                }
                                                // check validity
                                                this.establishmentItemViewModel.isValidationSummaryVisible(true);
                                                if (!this.establishmentItemViewModel.isValid()) {
                                                    this.establishmentItemViewModel.errors.showAllMessages();
                                                }
                                                if (!officialName.isValid()) {
                                                    officialName.errors.showAllMessages();
                                                }
                                                if (!officialUrl.isValid()) {
                                                    officialUrl.errors.showAllMessages();
                                                }
                                                this.establishmentItemViewModel.validatingSpinner.stop();
                                                if (officialName.isValid() && officialUrl.isValid() && this.establishmentItemViewModel.isValid()) {
                                                    var $LoadingPage = $("#Loading_page").find("strong"),
                                                        url = App.Routes.WebApi.Establishments.post(),
                                                        data = this.establishmentItemViewModel.serializeData();

                                                    $LoadingPage.text("Creating Establishment...");
                                                    data.officialName = officialName.serializeData();
                                                    data.officialUrl = officialUrl.serializeData();
                                                    data.location = location.serializeData();
                                                    this.establishmentItemViewModel.createSpinner.start();
                                                    $.post(url, data)
                                                        .done((response: any, statusText: string, xhr: JQueryXHR): void => {
                                                            this.establishmentItemViewModel.createSpinner.stop();
                                                            $("#add_establishment").fadeOut(500, () => {
                                                            });
                                                            var establishmentId = parseInt(xhr.getResponseHeader('Location').substring(xhr.getResponseHeader('Location').lastIndexOf("/") + 1));
                                                            $.get(App.Routes.WebApi.Establishments.get(establishmentId))
                                                                .done((response: any): void => {
                                                                    App.flasher.flash("Establishment Created.");
                                                                    var myParticipant = new InstitutionalAgreementParticipantModel(
                                                                            false,
                                                                            response.id,
                                                                            response.officialName,
                                                                            response.translatedName
                                                                        ),
                                                                        alreadyExist = false;
                                                                    $.ajax({
                                                                            url: App.Routes.WebApi.Agreements.Participants.isOwner(myParticipant.establishmentId()),
                                                                            type: 'GET',
                                                                            async: false
                                                                        })
                                                                        .done((response) => {
                                                                            myParticipant.isOwner(response);
                                                                            if (this.agreementIsEdit()) {
                                                                                var url = App.Routes.WebApi.Agreements.Participants.put(this.agreementId, myParticipant.establishmentId());

                                                                                $.ajax({
                                                                                    type: 'PUT',
                                                                                    url: url,
                                                                                    data: myParticipant,
                                                                                    success: (response: any, statusText: string, xhr: JQueryXHR): void => {
                                                                                        this.participants.participants.push(myParticipant);
                                                                                    },
                                                                                    error: (xhr: JQueryXHR): void => {
                                                                                        App.Failures.message(xhr, xhr.responseText, true);
                                                                                    }
                                                                                });
                                                                            } else {
                                                                                this.participants.participants.push(myParticipant);
                                                                            }
                                                                            //reset values
                                                                            this.establishmentItemViewModel.urls()[0].value("")
                                                                            this.establishmentItemViewModel.names()[0].text("");
                                                                            this.establishmentItemViewModel.names()[0].selectedLanguageCode("");
                                                                            this.establishmentItemViewModel.parentId(undefined);
                                                                            this.establishmentItemViewModel.location.countryId(null);
                                                                            this.establishmentItemViewModel.typeId(null);
                                                                            this.establishmentItemViewModel.ceebCode(null);
                                                                            this.establishmentItemViewModel.uCosmicCode(null);
                                                                            this.establishmentItemViewModel.errors.showAllMessages(false);
                                                                            officialName.errors.showAllMessages(false);
                                                                            officialUrl.errors.showAllMessages(false);
                                                                            this.establishmentItemViewModel.isValidationSummaryVisible(false);

                                                                            this.establishmentSearchViewModel.sammy.setLocation("agreements/" + this.editOrNewUrl.val + "");
                                                                        })
                                                                        .fail(() => {
                                                                            if (this.agreementIsEdit()) {
                                                                                var url = App.Routes.WebApi.Agreements.Participants.put(this.agreementId, myParticipant.establishmentId());

                                                                                $.ajax({
                                                                                    type: 'PUT',
                                                                                    url: url,
                                                                                    data: myParticipant,
                                                                                    success: (response: any, statusText: string, xhr: JQueryXHR): void => {
                                                                                        this.participants.participants.push(myParticipant);
                                                                                    },
                                                                                    error: (xhr: JQueryXHR): void => {
                                                                                        App.Failures.message(xhr, xhr.responseText, true);
                                                                                    }
                                                                                });
                                                                            } else {
                                                                                this.participants.participants.push(myParticipant);
                                                                            }
                                                                            this.establishmentSearchViewModel.sammy.setLocation("agreements/" + this.editOrNewUrl.val + "");
                                                                        });
                                                                })
                                                                .fail((xhr: JQueryXHR, statusText: string, errorThrown: string): void => {
                                                                    App.Failures.message(xhr, xhr.responseText, true);
                                                                });
                                                        });
                                                }
                                            }
                                            return false;
                                        }
                                        ko.applyBindings(this.establishmentItemViewModel, $addEstablishment[0]);
                                        $cancelAddEstablishment.on("click", (e) => {
                                            sessionStorage.setItem("addest", "no");
                                            this.establishmentSearchViewModel.sammy.setLocation('#/page/1/');
                                            e.preventDefault();
                                            return false;
                                        });
                                        this.hasBoundItem = true;
                                    }
                                    });
                                });
                            this.scrollBody.scrollMyBody(0);
                            lastURL = "#/new/";
                        } else if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("" + this.editOrNewUrl.val + "#/page/") > 0) {
                            if (sessionStorage.getItem("addest") === "yes") {
                                this.establishmentSearchViewModel.clickAction = (context: any): boolean => {
                                    this.establishmentItemViewModel.parentEstablishment(context);
                                    this.establishmentItemViewModel.parentId(context.id());
                                    this.establishmentSearchViewModel.sammy.setLocation('#/new/');
                                    return false;
                                }
                                this.establishmentSearchViewModel.header("Choose a parent establishment");
                                $asideRootSearch.hide();
                                $asideParentSearch.show();
                                this.SearchPageBind("parent");
                                this.establishmentSearchViewModel.header("Choose a parent establishment");
                            }
                            else {
                                $asideRootSearch.show();
                                $asideParentSearch.hide();
                                this.SearchPageBind("participant");
                                this.establishmentSearchViewModel.header("Choose a participant");
                                this.establishmentSearchViewModel.clickAction = (context: any): boolean => {
                                    var myParticipant = new InstitutionalAgreementParticipantModel(
                                        false,
                                        context.id(),
                                        context.officialName(),
                                        context.translatedName()
                                        ),
                                        alreadyExist = false;

                                    for (var i = 0, j = this.participants.participants().length; i < j; i++) {
                                        if (this.participants.participants()[i].establishmentId() === myParticipant.establishmentId()) {
                                            alreadyExist = true;
                                            break;
                                        }
                                    }
                                    if (alreadyExist !== true) {
                                        $.ajax({
                                            url: App.Routes.WebApi.Agreements.Participants.isOwner(myParticipant.establishmentId()),
                                            type: 'GET',
                                            async: false
                                        })
                                            .done((response) => {
                                                myParticipant.isOwner(response);
                                                if (this.agreementIsEdit()) {
                                                    var url = App.Routes.WebApi.Agreements.Participants.put(this.agreementId, myParticipant.establishmentId());

                                                    $.ajax({
                                                        type: 'PUT',
                                                        url: url,
                                                        data: myParticipant,
                                                        success: (response: any, statusText: string, xhr: JQueryXHR): void => {
                                                            this.participants.participants.push(myParticipant);
                                                        },
                                                        error: (xhr: JQueryXHR): void => {
                                                            App.Failures.message(xhr, xhr.responseText, true);
                                                        }
                                                    });
                                                } else {
                                                    this.participants.participants.push(myParticipant);
                                                }
                                                this.establishmentSearchViewModel.sammy.setLocation("agreements/" + this.editOrNewUrl.val + "");
                                            })
                                            .fail(() => {
                                                if (this.agreementIsEdit()) {
                                                    var url = App.Routes.WebApi.Agreements.Participants.put(this.agreementId, myParticipant.establishmentId());

                                                    $.ajax({
                                                        type: 'PUT',
                                                        url: url,
                                                        data: myParticipant,
                                                        success: (response: any, statusText: string, xhr: JQueryXHR): void => {
                                                            this.participants.participants.push(myParticipant);
                                                        },
                                                        error: (xhr: JQueryXHR): void => {
                                                            App.Failures.message(xhr, xhr.responseText, true);
                                                        }
                                                    });
                                                } else {
                                                    this.participants.participants.push(myParticipant);
                                                }
                                                this.establishmentSearchViewModel.sammy.setLocation("agreements/" + this.editOrNewUrl.val + "");
                                            });
                                    } else {
                                        alert("This Participant has already been added.")
                                    }
                                    return false;
                                }
                            }
                            this.scrollBody.scrollMyBody(0);
                            lastURL = "#/page/";
                        } else if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("agreements/" + this.editOrNewUrl.val + "") > 0) {
                            var deferred = $.Deferred(),
                                deferred2 = $.Deferred(),
                                $obj = $("#establishment_search"),
                                $obj2 = $("#add_establishment"),
                                time = 500;

                            sessionStorage.setItem("addest", "no");
                            lastURL = "#/index";
                            this.establishmentSearchViewModel.sammy.setLocation('#/index');
                            this.fadeModsOut(deferred, deferred2, $obj, $obj2, time);
                            $.when(deferred, deferred2)
                                .done(() => {
                                    $("[data-current-module=agreements]").fadeIn(500).promise().done(() => {
                                        $("[data-current-module=agreements]").find("aside").find("li").removeClass("current");
                                        $("#nav_participants").addClass("current");
                                        $(this).show();
                                        this.scrollBody.scrollMyBody(0);
                                        this.deferredPageFadeIn.resolve();
                                    });
                                });
                        } else {
                            window.location.replace(this.establishmentSearchViewModel.sammy.getLocation());
                        }
                    }
                });
                this.establishmentSearchViewModel.sammy.run();
            }
        }
    }
}