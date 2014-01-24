var ViewModels;
(function (ViewModels) {
    (function (Degrees) {
        var EstablishmentSearchNav = (function () {
            function EstablishmentSearchNav(institutionId, institutionOfficialName, institutionCountryOfficialName, institutionTranslatedName, degreeId, institutionOfficialNameDoesNotMatchTranslation) {
                this.lastURL = 'asdf';
                this.sammyUrl = 'new/';
                this.establishmentSearchViewModel = new Establishments.ViewModels.Search();
                this.hasBoundSearch = { does: false };
                this.hasBoundItem = false;
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
            EstablishmentSearchNav.prototype.SearchPageBind = function (parentOrParticipant) {
                var _this = this;
                var $cancelAddParticipant = $("#cancelAddParticipant"), $searchSideBarAddNew = $("#searchSideBarAddNew"), deferred = $.Deferred(), deferred2 = $.Deferred(), $obj = $("[data-current-module='degrees']"), $obj2 = $("#add_establishment"), time = 500;

                this.establishmentSearchViewModel.detailTooltip = function () {
                    return 'Choose this Institution as a ' + parentOrParticipant;
                };

                $cancelAddParticipant.off();
                $searchSideBarAddNew.off();
                $searchSideBarAddNew.on("click", function (e) {
                    _this.establishmentSearchViewModel.sammy.setLocation('#/new/');
                    e.preventDefault();
                    return false;
                });
                if (parentOrParticipant === "parent") {
                    $cancelAddParticipant.on("click", function (e) {
                        _this.establishmentSearchViewModel.sammy.setLocation('#/new/');
                        e.preventDefault();
                        return false;
                    });
                } else {
                    $cancelAddParticipant.on("click", function (e) {
                        _this.establishmentSearchViewModel.sammy.setLocation('#/index');
                        e.preventDefault();
                        return false;
                    });
                }
                this.fadeModsOut(deferred, deferred2, $obj, $obj2, time);

                $.when(deferred, deferred2).done(function () {
                    $("#establishment_search").fadeIn(500);
                });
            };

            EstablishmentSearchNav.prototype.fadeModsOut = function (deferred, deferred2, $obj, $obj2, time) {
                if ($obj.css("display") !== "none") {
                    $obj.fadeOut(time, function () {
                        deferred.resolve();
                    });
                } else {
                    deferred.resolve();
                }
                if ($obj2.css("display") !== "none") {
                    $obj2.fadeOut(time, function () {
                        deferred2.resolve();
                    });
                } else {
                    deferred2.resolve();
                }
            };

            EstablishmentSearchNav.prototype.bindSearch = function () {
                var _this = this;
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

                    this.establishmentSearchViewModel.sammy.bind("location-changed", function () {
                        if (_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf(_this.lastURL) < 0) {
                            var $asideRootSearch = $("#asideRootSearch"), $asideParentSearch = $("#asideParentSearch");

                            if (_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("" + _this.sammyUrl + "#/new/") > 0) {
                                var $addEstablishment = $("#add_establishment"), deferred = $.Deferred(), deferred2 = $.Deferred(), $obj = $("#establishment_search"), $obj2 = $("[data-current-module='home']"), time = 500;

                                _this.fadeModsOut(deferred, deferred2, $obj, $obj2, time);
                                $.when(deferred, deferred2).done(function () {
                                    $addEstablishment.css("visibility", "").hide().fadeIn(500, function () {
                                        if (!_this.hasBoundItem) {
                                            var $cancelAddEstablishment = $("#cancelAddEstablishment");

                                            _this.establishmentItemViewModel = new Establishments.ViewModels.Item(null, false);
                                            _this.establishmentItemViewModel.goToSearch = function () {
                                                sessionStorage.setItem("addest", "yes");
                                                _this.establishmentSearchViewModel.sammy.setLocation('#/page/1/');
                                            };
                                            _this.establishmentItemViewModel.submitToCreate = function (formElement) {
                                                if (!_this.establishmentItemViewModel.id || _this.establishmentItemViewModel.id === 0) {
                                                    var me = _this.establishmentItemViewModel, officialName = _this.establishmentItemViewModel.names()[0], officialUrl = _this.establishmentItemViewModel.urls()[0], location = _this.establishmentItemViewModel.location;

                                                    _this.establishmentItemViewModel.validatingSpinner.start();

                                                    if (officialName.text.isValidating() || officialUrl.value.isValidating() || _this.establishmentItemViewModel.ceebCode.isValidating() || _this.establishmentItemViewModel.uCosmicCode.isValidating()) {
                                                        setTimeout(function () {
                                                            var waitResult = _this.establishmentItemViewModel.submitToCreate(formElement);

                                                            return false;
                                                        }, 50);
                                                        return false;
                                                    }

                                                    _this.establishmentItemViewModel.isValidationSummaryVisible(true);
                                                    if (!_this.establishmentItemViewModel.isValid()) {
                                                        _this.establishmentItemViewModel.errors.showAllMessages();
                                                    }
                                                    if (!officialName.isValid()) {
                                                        officialName.errors.showAllMessages();
                                                    }
                                                    if (!officialUrl.isValid()) {
                                                        officialUrl.errors.showAllMessages();
                                                    }
                                                    _this.establishmentItemViewModel.validatingSpinner.stop();
                                                    if (officialName.isValid() && officialUrl.isValid() && _this.establishmentItemViewModel.isValid()) {
                                                        var $LoadingPage = $("#Loading_page").find("strong"), url = App.Routes.WebApi.Establishments.post(), data = _this.establishmentItemViewModel.serializeData();

                                                        $LoadingPage.text("Creating Institution...");
                                                        data.officialName = officialName.serializeData();
                                                        data.officialUrl = officialUrl.serializeData();
                                                        data.location = location.serializeData();
                                                        _this.establishmentItemViewModel.createSpinner.start();
                                                        $.post(url, data).done(function (response, statusText, xhr) {
                                                            _this.establishmentItemViewModel.createSpinner.stop();
                                                            $("#add_establishment").fadeOut(500, function () {
                                                            });
                                                            var establishmentId = parseInt(xhr.getResponseHeader('Location').substring(xhr.getResponseHeader('Location').lastIndexOf("/") + 1));
                                                            $.get(App.Routes.WebApi.Establishments.get(establishmentId)).done(function (response) {
                                                                App.flasher.flash("Institution Created.");
                                                                _this.institutionId(response.id);
                                                                _this.institutionOfficialName(response.officialName);
                                                                _this.institutionCountryOfficialName(response.countryName);
                                                                _this.institutionTranslatedName(response.translatedName);
                                                                _this.institutionOfficialNameDoesNotMatchTranslation(response.officialNameDoesNotMatchTranslation);
                                                                _this.establishmentSearchViewModel.sammy.setLocation("my/degrees/" + _this.sammyUrl + "");
                                                            }).fail(function (xhr, statusText, errorThrown) {
                                                                if (xhr.status === 400) {
                                                                    _this.establishmentItemViewModel.$genericAlertDialog.find('p.content').html(xhr.responseText.replace('\n', '<br /><br />'));
                                                                    _this.establishmentItemViewModel.$genericAlertDialog.dialog({
                                                                        title: 'Alert Message',
                                                                        dialogClass: 'jquery-ui',
                                                                        width: 'auto',
                                                                        resizable: false,
                                                                        modal: true,
                                                                        buttons: {
                                                                            'Ok': function () {
                                                                                _this.establishmentItemViewModel.$genericAlertDialog.dialog('close');
                                                                            }
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }).fail(function (xhr, statusText, errorThrown) {
                                                            if (xhr.status === 400) {
                                                                _this.establishmentItemViewModel.$genericAlertDialog.find('p.content').html(xhr.responseText.replace('\n', '<br /><br />'));
                                                                _this.establishmentItemViewModel.$genericAlertDialog.dialog({
                                                                    title: 'Alert Message',
                                                                    dialogClass: 'jquery-ui',
                                                                    width: 'auto',
                                                                    resizable: false,
                                                                    modal: true,
                                                                    buttons: {
                                                                        'Ok': function () {
                                                                            _this.establishmentItemViewModel.$genericAlertDialog.dialog('close');
                                                                        }
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                }
                                                return false;
                                            };
                                            ko.applyBindings(_this.establishmentItemViewModel, $addEstablishment[0]);
                                            $cancelAddEstablishment.on("click", function (e) {
                                                sessionStorage.setItem("addest", "no");
                                                _this.establishmentSearchViewModel.sammy.setLocation('#/page/1/');
                                                e.preventDefault();
                                                return false;
                                            });
                                            _this.hasBoundItem = true;
                                        }
                                    });
                                });
                                _this.lastURL = "#/new/";
                            } else if (_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("" + _this.sammyUrl + "#/page/") > 0) {
                                var establishment_search = $("#establishment_search"), deferred = $.Deferred(), deferred2 = $.Deferred(), $obj = $("[data-current-module='home']"), $obj2 = $("#add_establishment"), time = 500;

                                _this.lastURL = 'asdf';

                                _this.fadeModsOut(deferred, deferred2, $obj, $obj2, time);

                                $.when(deferred, deferred2).done(function () {
                                    establishment_search.css("visibility", "").hide().fadeIn(500);
                                });
                                if (sessionStorage.getItem("addest") === "yes") {
                                    _this.establishmentSearchViewModel.clickAction = function (context) {
                                        _this.establishmentItemViewModel.parentEstablishment(context);
                                        _this.establishmentItemViewModel.parentId(context.id());
                                        _this.establishmentSearchViewModel.sammy.setLocation('#/new/');
                                        return false;
                                    };
                                    _this.establishmentSearchViewModel.header("Choose a parent Institution");
                                    $asideRootSearch.hide();
                                    $asideParentSearch.show();
                                    _this.SearchPageBind("parent");
                                    _this.establishmentSearchViewModel.header("Choose a parent Institution");
                                } else {
                                    $asideRootSearch.show();
                                    $asideParentSearch.hide();
                                    _this.SearchPageBind("institution");
                                    _this.establishmentSearchViewModel.header("Choose an alma mater");
                                    _this.establishmentSearchViewModel.clickAction = function (context) {
                                        _this.institutionId(context.id());
                                        _this.institutionOfficialName(context.officialName());
                                        _this.institutionCountryOfficialName(context.countryName());
                                        _this.institutionTranslatedName(context.translatedName());
                                        _this.institutionOfficialNameDoesNotMatchTranslation(context.officialNameDoesNotMatchTranslation());
                                        _this.establishmentSearchViewModel.sammy.setLocation("my/degrees/" + _this.sammyUrl + "");

                                        return false;
                                    };
                                }
                                _this.lastURL = "#/page/";
                            } else if (_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("my/degrees/" + _this.sammyUrl + "") > 0) {
                                var deferred = $.Deferred(), deferred2 = $.Deferred(), $obj = $("#establishment_search"), $obj2 = $("#add_establishment"), time = 500;

                                sessionStorage.setItem("addest", "no");
                                _this.lastURL = "#/index";
                                _this.establishmentSearchViewModel.sammy.setLocation('#/index');
                                _this.fadeModsOut(deferred, deferred2, $obj, $obj2, time);
                                $.when(deferred, deferred2).done(function () {
                                    $("[data-current-module='home']").fadeIn(500).promise().done(function () {
                                        $(_this).show();
                                    });
                                });
                            } else {
                                window.location.replace(_this.establishmentSearchViewModel.sammy.getLocation());
                            }
                        }
                    });
                    this.establishmentSearchViewModel.sammy.run();
                }
            };
            return EstablishmentSearchNav;
        })();
        Degrees.EstablishmentSearchNav = EstablishmentSearchNav;
    })(ViewModels.Degrees || (ViewModels.Degrees = {}));
    var Degrees = ViewModels.Degrees;
})(ViewModels || (ViewModels = {}));
