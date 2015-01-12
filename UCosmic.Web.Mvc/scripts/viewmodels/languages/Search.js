var Languages;
(function (Languages) {
    var ViewModels;
    (function (ViewModels) {
        var Search = (function () {
            function Search(settings, establishmentId) {
                var _this = this;
                this.settings = settings;
                this.languageOptions = ko.observableArray(this.settings.languageOptions);
                this.languageCode = ko.observable(this.settings.input.languageCode);
                this.orderBy = ko.observable(this.settings.input.orderBy);
                this.keyword = ko.observable(this.settings.input.keyword);
                this.pager = new App.Pager(this.settings.input.pageNumber.toString(), this.settings.input.pageSize.toString());
                this.loadingSpinner = new App.Spinner();
                this.affiliationsLoaded = false;
                this.affiliations = ko.mapping.fromJS([]);
                this.hasEstablishmentSelects = ko.observable(false);
                this.selectedEstablishment = ko.observable();
                this.selectedTenant = ko.observable(0);
                this.rootEstablishment = 0;
                this.tenantId = 0;
                this.establishmentId = ko.observable(parseInt(sessionStorage.getItem(Search._establishmentIdKey)) || this.tenantId);
                this.hasTenancyData = ko.observable(false);
                this.isCreatingSelectEstablishments = false;
                this.tenancyData = new App.DataCacher(function () {
                    return _this._loadTenancyData();
                });
                this._selectedTenantChanged = ko.computed(function () {
                    var hasTenancyData = _this.hasTenancyData();
                    var selectedTenant = _this.selectedTenant();
                    if (_this.selectedTenant()) {
                        _this.tenantId = _this.selectedTenant();
                    }
                    var establishmentId = _this.establishmentId();
                    if (!hasTenancyData || !selectedTenant || selectedTenant == establishmentId)
                        return;
                    _this.establishmentId(selectedTenant);
                });
                this.tenantOptions = ko.observableArray();
                this.establishmentData = new App.DataCacher(function () {
                    return _this._loadEstablishmentData();
                });
                if (settings.input.ancestorId) {
                    this.selectedTenant(settings.input.ancestorId);
                    this.tenantId = settings.input.ancestorId;
                }
                else {
                    this.selectedTenant(establishmentId);
                    this.tenantId = establishmentId;
                }
                this.rootEstablishment = establishmentId;
                this.pager.apply(this.settings.output);
                this._loadTenancyData();
                $("form").submit(function (event) {
                    _this.loadingSpinner.start();
                });
                $('a').click(function () {
                    _this.loadingSpinner.start();
                });
            }
            Search.prototype.applyBindings = function (element) {
                ko.applyBindings(this, element);
                kendo.init($(element));
                this._applySubscriptions();
            };
            Search.prototype._applySubscriptions = function () {
                var _this = this;
                this.pager.input.pageSizeText.subscribe(function (newValue) {
                    _this._submitForm();
                });
                this.pager.input.pageNumberText.subscribe(function (newValue) {
                    _this._submitForm();
                });
                this.languageCode.subscribe(function (newValue) {
                    _this._submitForm();
                });
                this.orderBy.subscribe(function (newValue) {
                    _this._submitForm();
                });
            };
            Search.prototype._submitForm = function () {
                if (this.loadingSpinner.isVisible())
                    return;
                this.loadingSpinner.start();
                this.$form.submit();
            };
            Search.prototype.onKeywordInputSearchEvent = function (viewModel, e) {
                if ($.trim(this.keyword()) && !$.trim($(e.target).val()) && this.$form)
                    this.$form.submit();
            };
            Search.prototype._createEstablishmentSelects = function (response) {
                this.establishmentId();
                if (this.selectedTenant() == 0) {
                    this.selectedTenant(this.establishmentId());
                }
                var parentId = this.selectedTenant();
                if (!parentId) {
                    parentId = this.tenantId;
                }
                var previousParentId = 0;
                this.isCreatingSelectEstablishments = true;
                this.affiliations.removeAll();
                while (true) {
                    var options = Enumerable.From(response).Where("x => x.parentId==" + parentId).Select("x =>  {value: x.id, text: x.officialName}").OrderBy(function (x) {
                        return x.rank;
                    }).ThenBy(function (x) {
                        return x.contextName || x.officialName;
                    }).ToArray();
                    for (var i = 0; i < options.length; i++) {
                        if (options[i].text.indexOf(',') > 0) {
                            options[i].text = options[i].text.substring(0, options[i].text.indexOf(','));
                        }
                    }
                    if (options.length > 0) {
                        options.unshift({ value: null, text: 'Select sub-affiliation or leave empty' });
                        this.affiliations.unshift(ko.mapping.fromJS([{ options: options, value: previousParentId.toString() }])()[0]);
                    }
                    previousParentId = parentId;
                    var parentCheck = Enumerable.From(response).Where("x => x.id==" + parentId).ToArray();
                    if (parentCheck[0] != undefined) {
                        parentId = parentCheck[0].parentId;
                    }
                    else {
                        this.isCreatingSelectEstablishments = false;
                        this.hasEstablishmentSelects(true);
                        return;
                    }
                }
            };
            Search.prototype._loadEstablishmentData = function () {
                var _this = this;
                var promise = $.Deferred();
                this.mainCampus = this.rootEstablishment;
                if (!this.mainCampus) {
                    this.mainCampus = this.selectedTenant();
                    if (!this.mainCampus) {
                        this.mainCampus = this.tenantId;
                    }
                }
                var temp = sessionStorage.getItem('campuses' + this.mainCampus);
                if (temp) {
                    var response = $.parseJSON(temp);
                    this._createEstablishmentSelects(response);
                }
                else {
                    var settings = settings || {};
                    settings.url = '/api/establishments/' + this.mainCampus + '/offspring';
                    $.ajax(settings).done(function (response) {
                        promise.resolve(response);
                        sessionStorage.setItem('campuses' + _this.mainCampus, JSON.stringify(response));
                        _this._createEstablishmentSelects(response);
                    }).fail(function (xhr) {
                        promise.reject(xhr);
                    });
                }
                return promise;
            };
            Search.prototype._loadTenancyData = function () {
                var _this = this;
                var deferred = $.Deferred();
                $.when(Establishments.Servers.Single(this.tenantId), Establishments.Servers.GetChildren(this.tenantId)).done(function (parentData, childData) {
                    childData = childData || [];
                    var tenants = Enumerable.From(childData).OrderBy(function (x) {
                        return x.rank;
                    }).ToArray();
                    tenants.unshift(parentData);
                    _this.tenantOptions([]);
                    if (childData.length) {
                        var options = Enumerable.From(tenants).Select(function (x) {
                            var option = {
                                value: x.id,
                                text: x.contextName || x.officialName,
                            };
                            return option;
                        }).ToArray();
                        _this.tenantOptions(options);
                    }
                    deferred.resolve(tenants);
                    _this.establishmentData.ready();
                    var myThis = _this;
                    _this.selectedTenant(_this.establishmentId());
                    _this.selectedTenant.subscribe(function (newValue) {
                        _this.selectedEstablishment(_this.selectedTenant());
                    });
                    $("#campusSelect").on("change", "select", function () {
                        if (myThis.isCreatingSelectEstablishments == false) {
                            if (this.value != '') {
                                myThis.selectedTenant(this.value);
                                myThis._loadEstablishmentData();
                            }
                            else {
                                var prevCampusSelect = $(this).parent().parent().prev().find("select");
                                if (prevCampusSelect.length) {
                                    myThis.selectedTenant(prevCampusSelect.val());
                                    myThis._loadEstablishmentData();
                                }
                                else {
                                    myThis.selectedTenant(myThis.rootEstablishment);
                                    myThis._loadEstablishmentData();
                                }
                            }
                            myThis._submitForm();
                        }
                    });
                    if (childData.length)
                        _this.hasTenancyData(true);
                }).fail(function (xhr) {
                    App.Failures.message(xhr, 'while trying to load institution organizational data.', true);
                    deferred.reject();
                });
                return deferred.promise();
            };
            Search._establishmentIdKey = 'EmployeeLanguageEstablishmentId';
            return Search;
        })();
        ViewModels.Search = Search;
    })(ViewModels = Languages.ViewModels || (Languages.ViewModels = {}));
})(Languages || (Languages = {}));
