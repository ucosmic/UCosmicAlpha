module ViewModels.Degrees {

    export class EstablishmentSearchNav {
        constructor(institutionId, institutionOfficialName, institutionCountryOfficialName,
            institutionTranslatedName, degreeId, institutionOfficialNameDoesNotMatchTranslation) {
            this.institutionOfficialNameDoesNotMatchTranslation = institutionOfficialNameDoesNotMatchTranslation;
            this.institutionId = institutionId;
            this.institutionOfficialName = institutionOfficialName;
            this.institutionCountryOfficialName = institutionCountryOfficialName;
            this.degreeId = degreeId;

            this.institutionTranslatedName = institutionTranslatedName;
            if (this.degreeId() && this.degreeId() > 0) {
                this.sammyUrl = this.degreeId() + "/";
            }
        }

        //imported vars
        degreeId;
        institutionId;
        institutionOfficialName;
        institutionCountryOfficialName;
        institutionTranslatedName;
        institutionOfficialNameDoesNotMatchTranslation;

        //search vars
        lastURL = 'asdf';
        sammyUrl = 'new/';
        establishmentSearchViewModel = new Establishments.ViewModels.Search();
        establishmentItemViewModel;
        hasBoundSearch = { does: false };
        hasBoundItem = false;

        SearchPageBind(parentOrParticipant: string): void {
            var $cancelAddParticipant = $("#cancelAddParticipant"),
                $searchSideBarAddNew = $("#searchSideBarAddNew"),
                deferred = $.Deferred(),
                deferred2 = $.Deferred(),
                $obj = $("[data-current-module='degrees']"),
                $obj2 = $("#add_establishment"),
                time = 500;

            this.establishmentSearchViewModel.detailTooltip = (): string => {
                return 'Choose this Institution as a ' + parentOrParticipant;
            }

            $cancelAddParticipant.off();
            $searchSideBarAddNew.off();
            $searchSideBarAddNew.on("click", (e) => {
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
                this.establishmentSearchViewModel.sammyBeforeRoute = /\#\/index\/(.*)\//;
                this.establishmentSearchViewModel.sammyGetPageRoute = '#/index';
                this.establishmentSearchViewModel.sammyDefaultPageRoute = '/degrees[\/]?';
                ko.applyBindings(this.establishmentSearchViewModel, $('#establishment_search')[0]);
                if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("#") === -1) {
                    if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("" + this.sammyUrl + "") === -1) {
                        this.establishmentSearchViewModel.sammy.setLocation("/degrees/" + this.sammyUrl + "#/index");
                    } else {
                        this.establishmentSearchViewModel.sammy.setLocation('#/index');
                    }
                }
                if (sessionStorage.getItem("addest") == undefined) {
                    sessionStorage.setItem("addest", "no");
                }
                //Check the url for changes 
                this.establishmentSearchViewModel.sammy.bind("location-changed", () => {
                    if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf(this.lastURL) < 0) {
                        var $asideRootSearch = $("#asideRootSearch"),
                            $asideParentSearch = $("#asideParentSearch");

                        if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("" + this.sammyUrl + "#/new/") > 0) {
                            var $addEstablishment = $("#add_establishment"),
                                deferred = $.Deferred(),
                                deferred2 = $.Deferred(),
                                $obj = $("#establishment_search"),
                                $obj2 = $("[data-current-module='home']"),
                                time = 500;

                            this.fadeModsOut(deferred, deferred2, $obj, $obj2, time);
                            $.when(deferred, deferred2)
                                .done(() => {
                                    $addEstablishment.css("visibility", "").hide().fadeIn(500, () => {
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

                                                        $LoadingPage.text("Creating Institution...");
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
                                                                        App.flasher.flash("Institution Created.");
                                                                        this.institutionId(response.id);
                                                                        this.institutionOfficialName(response.officialName);
                                                                        this.institutionCountryOfficialName(response.countryName);
                                                                        this.institutionTranslatedName(response.translatedName);
                                                                        this.institutionOfficialNameDoesNotMatchTranslation(!((this.institutionOfficialName() === this.institutionTranslatedName()) || this.institutionOfficialName() == undefined));
                                                                        this.establishmentItemViewModel.urls()[0].value("")
                                                                                this.establishmentItemViewModel.names()[0].text("");
                                                                        officialName.errors.showAllMessages(false);
                                                                        officialUrl.errors.showAllMessages(false);
                                                                        this.establishmentItemViewModel.isValidationSummaryVisible(false);
                                                                        this.establishmentSearchViewModel.sammy.setLocation("my/degrees/" + this.sammyUrl + "");
                                                                    })
                                                                    .fail((xhr: JQueryXHR): void => {
                                                                        //if (xhr.status === 400) { // validation message will be in xhr response text...
                                                                        //    this.establishmentItemViewModel.$genericAlertDialog.find('p.content')
                                                                        //        .html(xhr.responseText.replace('\n', '<br /><br />'));
                                                                        //    this.establishmentItemViewModel.$genericAlertDialog.dialog({
                                                                        //        title: 'Alert Message',
                                                                        //        dialogClass: 'jquery-ui',
                                                                        //        width: 'auto',
                                                                        //        resizable: false,
                                                                        //        modal: true,
                                                                        //        buttons: {
                                                                        //            'Ok': (): void => { this.establishmentItemViewModel.$genericAlertDialog.dialog('close'); }
                                                                        //        }
                                                                        //    });
                                                                        //}
                                                                        App.Failures.message(xhr, xhr.responseText, true);
                                                                    });
                                                            })
                                                            .fail((xhr: JQueryXHR): void => {
                                                                //if (xhr.status === 400) { // validation message will be in xhr response text...
                                                                //    this.establishmentItemViewModel.$genericAlertDialog.find('p.content')
                                                                //        .html(xhr.responseText.replace('\n', '<br /><br />'));
                                                                //    this.establishmentItemViewModel.$genericAlertDialog.dialog({
                                                                //        title: 'Alert Message',
                                                                //        dialogClass: 'jquery-ui',
                                                                //        width: 'auto',
                                                                //        resizable: false,
                                                                //        modal: true,
                                                                //        buttons: {
                                                                //            'Ok': (): void => { this.establishmentItemViewModel.$genericAlertDialog.dialog('close'); }
                                                                //        }
                                                                //    });
                                                                //}
                                                                App.Failures.message(xhr, xhr.responseText, true);
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
                                })
                            this.lastURL = "#/new/";
                        } else if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("" + this.sammyUrl + "#/page/") > 0) {
                            var establishment_search = $("#establishment_search"),
                                deferred = $.Deferred(),
                                deferred2 = $.Deferred(),
                                $obj = $("[data-current-module='home']"),
                                $obj2 = $("#add_establishment"),
                                time = 500;

                            this.lastURL = 'asdf';

                            this.fadeModsOut(deferred, deferred2, $obj, $obj2, time);

                            $.when(deferred, deferred2)
                                .done(() => {
                                    establishment_search.css("visibility", "").hide().fadeIn(500)
                                });
                            if (sessionStorage.getItem("addest") === "yes") {
                                this.establishmentSearchViewModel.clickAction = (context: any): boolean => {
                                    this.establishmentItemViewModel.parentEstablishment(context);
                                    this.establishmentItemViewModel.parentId(context.id());
                                    this.establishmentSearchViewModel.sammy.setLocation('#/new/');
                                    return false;
                                }
                                this.establishmentSearchViewModel.header("Choose a parent Institution");
                                $asideRootSearch.hide();
                                $asideParentSearch.show();
                                this.SearchPageBind("parent");
                                this.establishmentSearchViewModel.header("Choose a parent Institution");
                            }
                            else {
                                $asideRootSearch.show();
                                $asideParentSearch.hide();
                                this.SearchPageBind("institution");
                                this.establishmentSearchViewModel.header("Choose an alma mater");
                                this.establishmentSearchViewModel.clickAction = (context: any): boolean => {
                                    this.institutionId(context.id());
                                    this.institutionOfficialName(context.officialName());
                                    this.institutionCountryOfficialName(context.countryName());
                                    this.institutionTranslatedName(context.translatedName());
                                    this.institutionOfficialNameDoesNotMatchTranslation(context.officialNameDoesNotMatchTranslation());
                                    this.establishmentSearchViewModel.sammy.setLocation("my/degrees/" + this.sammyUrl + "");
                                    //update the institiution values
                                    return false;
                                }
                            }
                            this.lastURL = "#/page/";
                        } else if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("my/degrees/" + this.sammyUrl + "") > 0) {
                            var deferred = $.Deferred(),
                                deferred2 = $.Deferred(),
                                $obj = $("#establishment_search"),
                                $obj2 = $("#add_establishment"),
                                time = 500;

                            sessionStorage.setItem("addest", "no");
                            this.lastURL = "#/index";
                            this.establishmentSearchViewModel.sammy.setLocation('#/index');
                            this.fadeModsOut(deferred, deferred2, $obj, $obj2, time);
                            $.when(deferred, deferred2)
                                .done(() => {
                                    $("[data-current-module='home']").fadeIn(500).promise().done(() => {
                                        $(this).show();
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