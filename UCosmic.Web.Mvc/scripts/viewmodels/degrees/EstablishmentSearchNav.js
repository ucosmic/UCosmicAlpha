var ViewModels;
(function (ViewModels) {
    (function (Degrees) {
        var InstitutionalAgreementParticipantModel = (function () {
            function InstitutionalAgreementParticipantModel(isOwner, establishmentId, establishmentOfficialName, establishmentTranslatedName) {
                this.isOwner = ko.observable(isOwner);
                this.establishmentId = ko.observable(establishmentId);
                this.establishmentOfficialName = ko.observable(establishmentOfficialName);
                this.establishmentTranslatedName = ko.observable(establishmentTranslatedName);
            }
            return InstitutionalAgreementParticipantModel;
        })();
        Degrees.InstitutionalAgreementParticipantModel = InstitutionalAgreementParticipantModel;
        ;

        var EstablishmentSearchNav = (function () {
            function EstablishmentSearchNav(institutionId, institutionOfficialName, institutionCountryOfficialName) {
                this.sammyUrl = '#/new/';
                this.establishmentSearchViewModel = new Establishments.ViewModels.Search();
                this.hasBoundSearch = { does: false };
                this.hasBoundItem = false;
                this.institutionId = institutionId;
                this.institutionOfficialName = institutionOfficialName;
                this.institutionCountryOfficialName = institutionCountryOfficialName;
            }
            EstablishmentSearchNav.prototype.SearchPageBind = function (parentOrParticipant) {
                var _this = this;
                var $cancelAddParticipant = $("#cancelAddParticipant"), $searchSideBarAddNew = $("#searchSideBarAddNew"), deferred = $.Deferred(), deferred2 = $.Deferred(), $obj = $("[data-current-module='agreements']"), $obj2 = $("#add_establishment"), time = 500;

                this.establishmentSearchViewModel.detailTooltip = function () {
                    return 'Choose this establishment as a ' + parentOrParticipant;
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
                    var lastURL = "asdf";

                    this.establishmentSearchViewModel.sammyBeforeRoute = /\#\/index\/(.*)\//;
                    this.establishmentSearchViewModel.sammyGetPageRoute = '#/index';
                    this.establishmentSearchViewModel.sammyDefaultPageRoute = '/agreements[\/]?';
                    ko.applyBindings(this.establishmentSearchViewModel, $('#establishment_search')[0]);
                    if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("#") === -1) {
                        if (this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("" + this.sammyUrl + "") === -1) {
                            this.establishmentSearchViewModel.sammy.setLocation("/agreements/" + this.sammyUrl + "#/index");
                        } else {
                            this.establishmentSearchViewModel.sammy.setLocation('#/index');
                        }
                    }
                    if (sessionStorage.getItem("addest") == undefined) {
                        sessionStorage.setItem("addest", "no");
                    }

                    this.establishmentSearchViewModel.sammy.bind("location-changed", function () {
                        if (_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf(lastURL) < 0) {
                            var $asideRootSearch = $("#asideRootSearch"), $asideParentSearch = $("#asideParentSearch");

                            if (_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("" + _this.sammyUrl + "#/new/") > 0) {
                                var $addEstablishment = $("#add_establishment");
                                deferred = $.Deferred(), deferred2 = $.Deferred(), $obj = $("#establishment_search"), $obj2 = $("[data-current-module='agreements']"), time = 500;

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

                                                        $LoadingPage.text("Creating Establishment...");
                                                        data.officialName = officialName.serializeData();
                                                        data.officialUrl = officialUrl.serializeData();
                                                        data.location = location.serializeData();
                                                        _this.establishmentItemViewModel.createSpinner.start();
                                                        $.post(url, data).done(function (response, statusText, xhr) {
                                                            _this.establishmentItemViewModel.createSpinner.stop();
                                                            $LoadingPage.text("Establishment created, you are being redirected to previous page...");
                                                            $("#add_establishment").fadeOut(500, function () {
                                                                $("#Loading_page").fadeIn(500);
                                                                setTimeout(function () {
                                                                    $("#Loading_page").fadeOut(500, function () {
                                                                        $LoadingPage.text("Loading Page...");
                                                                    });
                                                                    _this.establishmentSearchViewModel.sammy.setLocation('#/page/1/');
                                                                }, 5000);
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

                                lastURL = "#/new/";
                            } else if (_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("" + _this.sammyUrl + "#/page/") > 0) {
                                if (sessionStorage.getItem("addest") === "yes") {
                                    _this.establishmentSearchViewModel.clickAction = function (context) {
                                        _this.establishmentItemViewModel.parentEstablishment(context);
                                        _this.establishmentItemViewModel.parentId(context.id());
                                        _this.establishmentSearchViewModel.sammy.setLocation('#/new/');
                                        return false;
                                    };
                                    _this.establishmentSearchViewModel.header("Choose a parent establishment");
                                    $asideRootSearch.hide();
                                    $asideParentSearch.show();
                                    _this.SearchPageBind("parent");
                                    _this.establishmentSearchViewModel.header("Choose a parent establishment");
                                } else {
                                    $asideRootSearch.show();
                                    $asideParentSearch.hide();
                                    _this.SearchPageBind("participant");
                                    _this.establishmentSearchViewModel.header("Choose a participant");
                                    _this.establishmentSearchViewModel.clickAction = function (context) {
                                        var myParticipant = new InstitutionalAgreementParticipantModel(false, context.id(), context.officialName(), context.translatedName()), alreadyExist = false;

                                        if (alreadyExist !== true) {
                                            $.ajax({
                                                url: App.Routes.WebApi.Agreements.Participants.isOwner(myParticipant.establishmentId()),
                                                type: 'GET',
                                                async: false
                                            }).done(function (response) {
                                                myParticipant.isOwner(response);

                                                _this.establishmentSearchViewModel.sammy.setLocation("agreements/" + _this.sammyUrl + "");
                                                $("body").css("min-height", ($(window).height() + $("body").height() - ($(window).height() * .85)));
                                            }).fail(function () {
                                                _this.establishmentSearchViewModel.sammy.setLocation("agreements/" + _this.sammyUrl + "");
                                            });
                                        } else {
                                            alert("This Participant has already been added.");
                                        }
                                        return false;
                                    };
                                }

                                lastURL = "#/page/";
                            } else if (_this.establishmentSearchViewModel.sammy.getLocation().toLowerCase().indexOf("agreements/" + _this.sammyUrl + "") > 0) {
                                var deferred = $.Deferred(), deferred2 = $.Deferred(), $obj = $("#establishment_search"), $obj2 = $("#add_establishment"), time = 500;

                                sessionStorage.setItem("addest", "no");
                                lastURL = "#/index";
                                _this.establishmentSearchViewModel.sammy.setLocation('#/index');
                                _this.fadeModsOut(deferred, deferred2, $obj, $obj2, time);
                                $.when(deferred, deferred2).done(function () {
                                    $("[data-current-module='agreements']").fadeIn(500).promise().done(function () {
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
