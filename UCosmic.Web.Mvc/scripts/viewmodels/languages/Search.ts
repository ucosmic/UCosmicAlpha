/// <reference path="models.d.ts" />
/// <reference path="serviceapimodel.d.ts" />
module Languages.ViewModels {

    export interface SearchSettings {
        input: ApiModels.SearchInput;
        output: App.PageOf<ApiModels.SearchResult>;
        languageOptions: App.ApiModels.SelectOption<string>[];
    }

    export class Search {
        //#region Construction

        languageOptions = ko.observableArray(this.settings.languageOptions);
        languageCode = ko.observable(this.settings.input.languageCode);
        orderBy = ko.observable(this.settings.input.orderBy);
        keyword = ko.observable(this.settings.input.keyword);
        pager = new App.Pager<ApiModels.SearchResult>(this.settings.input.pageNumber.toString(), this.settings.input.pageSize.toString());

        $form: JQuery;
        loadingSpinner = new App.Spinner()
        

        constructor(public settings: SearchSettings, establishmentId: number) {
            if (settings.input.ancestorId) {
                this.selectedTenant(settings.input.ancestorId);
                this.tenantId = settings.input.ancestorId;
            } else {
                this.selectedTenant(establishmentId);
                this.tenantId = establishmentId;
            }
            this.rootEstablishment = establishmentId;
            this.pager.apply(this.settings.output);
            this._loadTenancyData();
            $("form").submit((event) => {
                this.loadingSpinner.start();
            });
            $('a').click(() => {
                this.loadingSpinner.start();
            });
        }

        //#endregion
        //#region Initialization

        applyBindings(element: Element): void {
            ko.applyBindings(this, element);
            kendo.init($(element));
            this._applySubscriptions();
        }

        private _applySubscriptions(): void {
            this.pager.input.pageSizeText.subscribe((newValue: string): void => { this._submitForm(); });
            this.pager.input.pageNumberText.subscribe((newValue: string): void => { this._submitForm(); });
            this.languageCode.subscribe((newValue: string): void => { this._submitForm(); });
            this.orderBy.subscribe((newValue: string): void => { this._submitForm(); });
        }

        //#endregion
        //#region Automatic Form Submits

        private _submitForm(): void {
            if (this.loadingSpinner.isVisible()) return;
            this.loadingSpinner.start();
            this.$form.submit();
        }

        onKeywordInputSearchEvent(viewModel: Search, e: JQueryEventObject): void {
            // this will auto-submit the form when the keyword box's X icon is clicked.
            if ($.trim(this.keyword()) && !$.trim($(e.target).val()) && this.$form)
                this.$form.submit();
        }
        //#endregion

        //#region Tenancy
        affiliationsLoaded = false;
        affiliations = ko.mapping.fromJS([]);
        hasEstablishmentSelects = ko.observable<boolean>(false);
        selectedEstablishment = ko.observable<number>();
        mainCampus: number;
        selectedTenant = ko.observable<number>(0);
        rootEstablishment = 0;
        tenantId = 0;
        private static _establishmentIdKey = 'EmployeeLanguageEstablishmentId';
        establishmentId = ko.observable<number>(
            parseInt(sessionStorage.getItem(Search._establishmentIdKey)) || this.tenantId);

        hasTenancyData = ko.observable<boolean>(false);
        //selectedTenant = ko.observable<number>(this.tenantId);
        isCreatingSelectEstablishments = false;

        tenancyData: App.DataCacher<Establishments.ApiModels.ScalarEstablishment[]> = new App.DataCacher(
            (): JQueryPromise<Establishments.ApiModels.ScalarEstablishment[]> => {
                return this._loadTenancyData();
            });

        private _selectedTenantChanged = ko.computed((): void => {
            //var areBindingsApplied = this.areBindingsApplied();
            var hasTenancyData = this.hasTenancyData();
            var selectedTenant = this.selectedTenant();
            if (this.selectedTenant()) {
                this.tenantId = this.selectedTenant();
            }
            var establishmentId = this.establishmentId();
            if (!hasTenancyData || !selectedTenant || selectedTenant == establishmentId)
                return;

            //$.when(this.placeData.reload(), this.activityCountsData.reload()).done((): void => {
                this.establishmentId(selectedTenant);
            //});
        });

        tenantOptions = ko.observableArray<App.ApiModels.SelectOption<number>>();

        private _createEstablishmentSelects(response): void {
            <number>this.establishmentId()
            //var parentId = this.settings.input.ancestorId;
            if (this.selectedTenant() == 0) {
                this.selectedTenant(this.establishmentId())
            }
            var parentId = this.selectedTenant();
            if (!parentId) {
                parentId = this.tenantId;
            }
            var previousParentId = 0;
            this.isCreatingSelectEstablishments = true;
            this.affiliations.removeAll();
            while (true) {
                var options: any = Enumerable.From(response)
                    .Where("x => x.parentId==" + parentId)
                    .Select("x =>  {value: x.id, text: x.officialName}")
                    .OrderBy(function (x: Establishments.ApiModels.ScalarEstablishment): number {
                        return x.rank; // sort by rank, then by name
                    })
                    .ThenBy(function (x: Establishments.ApiModels.ScalarEstablishment): string {
                        return x.contextName || x.officialName;
                    }).ToArray();
                for (var i = 0; i < options.length; i++) {
                    if (options[i].text.indexOf(',') > 0) {
                        options[i].text = options[i].text.substring(0, options[i].text.indexOf(','))
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
                } else {
                    this.isCreatingSelectEstablishments = false;
                    this.hasEstablishmentSelects(true);
                    return;
                }
            }

        }

        private _loadEstablishmentData(): JQueryPromise<Establishments.ApiModels.ScalarEstablishment[]> {
            var promise: JQueryDeferred<Establishments.ApiModels.ScalarEstablishment[]> = $.Deferred();
            this.mainCampus = this.rootEstablishment;// this.selectedTenant(); 
            if (!this.mainCampus) {
                this.mainCampus = this.selectedTenant();
                if (!this.mainCampus) {
                    this.mainCampus = this.tenantId;
                }
            }

            var temp = sessionStorage.getItem('campuses' + this.mainCampus);
            if (temp) {
                var response = $.parseJSON(temp);
                //this.selectedTenant(this.establishmentId());
                this._createEstablishmentSelects(response);
            } else {

                var settings = settings || {};
                settings.url = '/api/establishments/' + this.mainCampus + '/offspring';
                $.ajax(settings)
                    .done((response: ApiModels.ScalarEstablishment[]): void => {
                        promise.resolve(response);
                        sessionStorage.setItem('campuses' + this.mainCampus, JSON.stringify(response));
                        //this.selectedTenant(this.establishmentId());
                        this._createEstablishmentSelects(response);


                    })
                    .fail((xhr: JQueryXHR): void => {
                        promise.reject(xhr);
                    });
            }

            return promise;
        }

        establishmentData = new App.DataCacher<Establishments.ApiModels.ScalarEstablishment[]>(
            (): JQueryPromise<Establishments.ApiModels.ScalarEstablishment[]> => {
                return this._loadEstablishmentData();
            });

        private _loadTenancyData(): JQueryPromise<Establishments.ApiModels.ScalarEstablishment[]> {
            // calling .ready() on tenancyData invokes this
            var deferred: JQueryDeferred<Establishments.ApiModels.ScalarEstablishment[]> = $.Deferred();
            $.when(Establishments.Servers.Single(this.tenantId), Establishments.Servers.GetChildren(this.tenantId))
                .done((parentData: Establishments.ApiModels.ScalarEstablishment, childData: Establishments.ApiModels.ScalarEstablishment[]): void => {
                    childData = childData || [];
                    var tenants = Enumerable.From(childData)
                        .OrderBy(function (x: Establishments.ApiModels.ScalarEstablishment): number {
                            return x.rank;
                        }).ToArray();
                    tenants.unshift(parentData);

                    this.tenantOptions([]);
                    if (childData.length) {
                        var options = Enumerable.From(tenants)
                            .Select(function (x: Establishments.ApiModels.ScalarEstablishment): App.ApiModels.SelectOption<number> {
                                var option: App.ApiModels.SelectOption<number> = {
                                    value: x.id,
                                    text: x.contextName || x.officialName,
                                };
                                return option;
                            }).ToArray();
                        this.tenantOptions(options);
                    }

                    deferred.resolve(tenants);

                    this.establishmentData.ready();

                    var myThis = this;
                    //this.establishmentId(this.selectedTenant());
                    this.selectedTenant(<number>this.establishmentId());
                    this.selectedTenant.subscribe((newValue: number): void => {
                        this.selectedEstablishment(this.selectedTenant());
                    });
                    $("#campusSelect").on("change", "select", function () {
                        if (myThis.isCreatingSelectEstablishments == false) {
                            if (this.value != '') {
                                myThis.selectedTenant(this.value);
                                myThis._loadEstablishmentData();
                            } else {
                                var prevCampusSelect = $(this).parent().parent().prev().find("select");
                                if (prevCampusSelect.length) {
                                    myThis.selectedTenant(prevCampusSelect.val());
                                    myThis._loadEstablishmentData();
                                } else {
                                    myThis.selectedTenant(myThis.rootEstablishment);
                                    myThis._loadEstablishmentData();
                                }
                            }
                            myThis._submitForm();
                        }
                    })
                    if (childData.length) this.hasTenancyData(true);

                })
                .fail((xhr: JQueryXHR): void => {
                    App.Failures.message(xhr, 'while trying to load institution organizational data.', true);
                    deferred.reject();
                })
            return deferred.promise();
        }

        //#endregion

    }
}