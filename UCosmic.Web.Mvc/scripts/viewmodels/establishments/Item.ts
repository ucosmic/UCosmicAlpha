/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/googlemaps/google.maps.d.ts" />
/// <reference path="../../google/ToolsOverlay.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../app/SideSwiper.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../Spinner.ts" />
/// <reference path="../places/ServerApiModel.ts" />
/// <reference path="../languages/ServerApiModel.ts" />
/// <reference path="ServerApiModel.d.ts" />
/// <reference path="Name.ts" />
/// <reference path="Url.ts" />
/// <reference path="Location.ts" />
/// <reference path="Search.ts" />
/// <reference path="SearchResult.ts" />

module ViewModels.Establishments {

    import gm = google.maps

    class CeebCodeValidator implements KnockoutValidationAsyncRuleDefinition {
        async: boolean = true;
        message: string = 'error';
        private _isAwaitingResponse: boolean = false;
        private _ruleName: string = 'validEstablishmentCeebCode';
        validator(val: string, vm: Item, callback: KnockoutValidationAsyncCallback) {
            if (this._isValidatable(vm)) {
                var route = App.Routes.WebApi.Establishments
                    .validateCeebCode(vm.id);
                this._isAwaitingResponse = true;
                $.post(route, vm.serializeData())
                .always((): void => {
                    this._isAwaitingResponse = false;
                })
                .done((): void => {
                    callback(true);
                })
                .fail((xhr: JQueryXHR): void => {
                    callback({ isValid: false, message: xhr.responseText });
                });
            }
            else if (!this._isAwaitingResponse || this._isOk(vm)) {
                callback(true);
            }
        }
        private _isValidatable(vm: Item): boolean {
            var originalValues = vm.originalValues();
            if (vm.id && vm.id !== 0)
                return !this._isAwaitingResponse && vm && vm.ceebCode() && originalValues
                    && originalValues.ceebCode !== vm.ceebCode(); // edit
            return vm && vm.ceebCode() && !this._isAwaitingResponse; // create
        }
        private _isOk(vm: Item): boolean {
            var originalValues = vm.originalValues();
            if (vm.id && vm.id !== 0)
                return vm && vm.ceebCode() !== undefined && originalValues
                    && originalValues.ceebCode == vm.ceebCode();
            return false;
        }
        constructor() {
            ko.validation.rules[this._ruleName] = this;
            ko.validation.addExtender(this._ruleName);
        }
    }
    new CeebCodeValidator();

    class UCosmicCodeValidator implements KnockoutValidationAsyncRuleDefinition {
        async: boolean = true;
        message: string = 'error';
        private _isAwaitingResponse: boolean = false;
        private _ruleName: string = 'validEstablishmentUCosmicCode';
        validator(val: string, vm: Item, callback: KnockoutValidationAsyncCallback) {
            if (this._isValidatable(vm)) {
                var route = App.Routes.WebApi.Establishments
                    .validateUCosmicCode(vm.id);
                this._isAwaitingResponse = true;
                $.post(route, vm.serializeData())
                .always((): void => {
                    this._isAwaitingResponse = false;
                })
                .done((): void => {
                    callback(true);
                })
                .fail((xhr: JQueryXHR): void => {
                    callback({ isValid: false, message: xhr.responseText });
                });
            }
            else if (!this._isAwaitingResponse || this._isOk(vm)) {
                callback(true);
            }
        }
        private _isValidatable(vm: Item): boolean {
            var originalValues = vm.originalValues();
            if (vm.id && vm.id !== 0)
                return !this._isAwaitingResponse && vm && vm.uCosmicCode() && originalValues
                    && originalValues.uCosmicCode !== vm.uCosmicCode(); // edit
            return vm && vm.uCosmicCode() && !this._isAwaitingResponse; // create
        }
        private _isOk(vm: Item): boolean {
            var originalValues = vm.originalValues();
            if (vm.id && vm.id !== 0)
                return vm && vm.uCosmicCode() !== undefined && originalValues
                    && originalValues.uCosmicCode == vm.uCosmicCode();
            return false;
        }
        constructor() {
            ko.validation.rules[this._ruleName] = this;
            ko.validation.addExtender(this._ruleName);
        }
    }
    new UCosmicCodeValidator();

    class ParentIdValidator implements KnockoutValidationAsyncRuleDefinition {
        async: boolean = true;
        message: string = 'error';
        private _isAwaitingResponse: boolean = false;
        private _ruleName: string = 'validEstablishmentParentId';
        validator(val: string, vm: Item, callback: KnockoutValidationAsyncCallback) {
            if (this._isValidatable(vm)) {
                var route = App.Routes.WebApi.Establishments
                    .validateParentId(vm.id);
                this._isAwaitingResponse = true;
                $.post(route, vm.serializeData())
                .always((): void => {
                    this._isAwaitingResponse = false;
                })
                .done((): void => {
                    callback(true);
                })
                .fail((xhr: JQueryXHR): void => {
                    callback({ isValid: false, message: xhr.responseText });
                });
            }
            else if (!this._isAwaitingResponse || this._isOk(vm)) {
                callback(true);
            }
        }
        private _isValidatable(vm: Item): boolean {
            var originalValues = vm.originalValues();
            if (vm.id && vm.id !== 0)
                return !this._isAwaitingResponse && vm && vm.parentId() && originalValues
                    && originalValues.parentId !== vm.parentId(); // edit
            return false; // create
        }
        private _isOk(vm: Item): boolean {
            var originalValues = vm.originalValues();
            if (vm.id && vm.id !== 0)
                return vm && vm.parentId() && originalValues
                    && originalValues.parentId == vm.parentId();
            return true;
        }
        constructor() {
            ko.validation.rules[this._ruleName] = this;
            ko.validation.addExtender(this._ruleName);
        }
    }
    new ParentIdValidator();

    export class Item implements KnockoutValidationGroup {

        // fields
        id: number = 0;
        originalValues: KnockoutObservable<any> = ko.observable();
        private _isInitialized: KnockoutObservable<boolean> = ko.observable(false);
        $genericAlertDialog: JQuery = undefined;
        location: Location;
        createSpinner: Spinner = new Spinner(new SpinnerOptions(0));
        validatingSpinner: Spinner = new Spinner(new SpinnerOptions(200));
        categories: KnockoutObservableArray<any> = ko.observableArray();
        typeIdSaveSpinner: Spinner = new Spinner(new SpinnerOptions(200));
        typeIdValidatingSpinner: Spinner = new Spinner(new SpinnerOptions(200));
        isTypeIdSaveDisabled: KnockoutComputed<boolean>;
        typeId: KnockoutObservable<number> = ko.observable();
        typeText: KnockoutObservable<string> = ko.observable('[Loading...]');
        ceebCode: KnockoutObservable<string> = ko.observable();
        uCosmicCode: KnockoutObservable<string> = ko.observable();
        isEditingTypeId: KnockoutObservable<boolean> = ko.observable();
        isValidationSummaryVisible = ko.observable(false);
        typeEmptyText: KnockoutComputed<string>;
        isValid: () => boolean;
        errors: KnockoutValidationErrors;
        flasherProxy = new App.FlasherProxy();

        constructor(id?: number) {

            // initialize the aggregate id
            this.id = id || 0;

            this._initNamesComputeds();
            this._initUrlsComputeds();
            this.location = new Location(this.id);

            this.typeEmptyText = ko.computed((): string => {
                return this.categories().length > 0 ? '[Select a classification]' : '[Loading...]';
            });
            this.typeId.subscribe((newValue: number): void => {
                var categories = this.categories();
                for (var i = 0; i < categories.length; i++) {
                    var types: any[] = categories[i].types();
                    for (var ii = 0; ii < types.length; ii++) {
                        if (types[ii].id() == this.typeId()) {
                            this.typeText(types[ii].text());
                            return;
                        }
                    }
                }
                this.typeText('[Unknown]');
            });
            this.typeId.extend({
                required: {
                    message: 'Establishment type is required'
                }
            });

            this.ceebCode.subscribe((newValue: string): void => {
                if (this.ceebCode()) // disallow space characters
                    this.ceebCode($.trim(this.ceebCode()));
            });
            this.ceebCode.extend({
                //throttle: 5000,
                validEstablishmentCeebCode: this
            });

            this.uCosmicCode.extend({
                validEstablishmentUCosmicCode: this
            });
            this.uCosmicCode.subscribe((newValue: string): void => {
                if (this.uCosmicCode()) // disallow space characters
                    this.uCosmicCode($.trim(this.uCosmicCode()));
            });

            this.isTypeIdSaveDisabled = ko.computed((): boolean => {
                return this.typeId.isValidating()
                    || this.uCosmicCode.isValidating()
                    || this.ceebCode.isValidating()
                    || this.typeIdSaveSpinner.isVisible()
                    || this.typeIdValidatingSpinner.isVisible()
                    || this.typeId.error
                    || this.ceebCode.error
                    || this.uCosmicCode.error;
            });

            this.parentId.extend({
                validEstablishmentParentId: this
            });

            // load the scalars
            var categoriesPact = $.Deferred();
            $.get(App.Routes.WebApi.Establishments.Categories.get())
                .done((data: any, textStatus: string, jqXHR: JQueryXHR): void => {
                    categoriesPact.resolve(data);
                })
                .fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    categoriesPact.reject(jqXHR, textStatus, errorThrown);
                });

            var viewModelPact = this._loadScalars();

            $.when(categoriesPact, viewModelPact).then(

                // all requests succeeded
                (categories: any[], viewModel: IServerApiScalarModel): void => {

                    ko.mapping.fromJS(categories, {}, this.categories);

                    this._pullScalars(viewModel);

                    if (!id) {
                        this.isEditingTypeId(true);
                        this.errors.showAllMessages(false);
                    }

                    if (!this._isInitialized()) {
                        this._isInitialized(true); // bindings have been applied
                    }
                },

                // one of the responses failed (never called more than once, even on multifailures)
                (xhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    //alert('a GET API call failed :(');
                });

            ko.validation.group(this);

            this._setupSammy();
            this._setupParentComputeds();
        }

        //#region Names

        // observables, computeds, & variables
        languages: KnockoutObservableArray<Languages.IServerApiModel> = ko.observableArray(); // select options
        names: KnockoutObservableArray<Establishments.Name> = ko.observableArray();
        editingName: KnockoutObservable<number> = ko.observable(0);
        canAddName: KnockoutComputed<boolean>;
        private _namesMapping: any;
        namesSpinner: Spinner = new Spinner(new SpinnerOptions(0, true));

        // methods
        requestNames(callback?: (response?: IServerNameApiModel[]) => void ): void {
            this.namesSpinner.start();
            $.get(App.Routes.WebApi.Establishments.Names.get(this.id))
                .done((response: IServerNameApiModel[]): void => {
                    this.receiveNames(response);
                    if (callback) callback(response);
                });
        }

        goToSearch(): void {
            window.location.hash = '#/select-parent/page/1/';
        }

        receiveNames(js: IServerNameApiModel[]): void {
            ko.mapping.fromJS(js || [], this._namesMapping, this.names);
            this.namesSpinner.stop();
            App.Obtruder.obtrude(document);
        }

        addName(): void {
            var apiModel = new ServerNameApiModel(this.id);
            if (this.names().length === 0)
                apiModel.isOfficialName = true;
            var newName = new Name(apiModel, this);
            this.names.unshift(newName);
            newName.showEditor();
            App.Obtruder.obtrude(document);
        }

        private _initNamesComputeds(): void {

            // languages dropdowns
            ko.computed((): void => { // get languages from the server
                $.getJSON(App.Routes.WebApi.Languages.get())
                    .done((response: Languages.IServerApiModel[]): void => {
                        var emptyValue = new Languages.ServerApiModel(undefined,
                            '[Language Neutral]');
                        response.splice(0, 0, emptyValue); // add null option
                        this.languages(response); // set the options dropdown
                    });
            }).extend({ throttle: 1 });

            // set up names mapping
            this._namesMapping = {
                create: (options: any): Name => {
                    return new Name(options.data, this);
                }
            };

            this.canAddName = ko.computed((): boolean => {
                return !this.namesSpinner.isVisible() && this.editingName() === 0 && this.id !== 0;
            });

            // request names
            ko.computed((): void => {
                if (this.id) // only get names if this is an existing establishment
                    this.requestNames();

                else setTimeout(() => { // otherwise, stop spinning and load a single name form
                    this.namesSpinner.stop();
                    this.addName();
                }, 0);
            }).extend({ throttle: 1 });
        }

        //#endregion
        //#region URLs

        // observables, computeds, & variables
        urls: KnockoutObservableArray<Establishments.Url> = ko.observableArray();
        editingUrl: KnockoutObservable<number> = ko.observable(0);
        canAddUrl: KnockoutComputed<boolean>;
        private _urlsMapping: any;
        urlsSpinner: Spinner = new Spinner(new SpinnerOptions(0, true));

        // methods
        requestUrls(callback?: (response?: IServerUrlApiModel[]) => void ): void {
            this.urlsSpinner.start();
            $.get(App.Routes.WebApi.Establishments.Urls.get(this.id))
                .done((response: IServerUrlApiModel[]): void => {
                    this.receiveUrls(response);
                    if (callback) callback(response);
                });
        }

        receiveUrls(js: IServerUrlApiModel[]): void {
            ko.mapping.fromJS(js || [], this._urlsMapping, this.urls);
            this.urlsSpinner.stop();
            App.Obtruder.obtrude(document);
        }

        addUrl(): void {
            var apiModel = new ServerUrlApiModel(this.id);
            if (this.urls().length === 0)
                apiModel.isOfficialUrl = true;
            var newUrl = new Url(apiModel, this);
            this.urls.unshift(newUrl);
            newUrl.showEditor();
            App.Obtruder.obtrude(document);
        }

        _initUrlsComputeds(): void {
            // set up URLs mapping
            this._urlsMapping = {
                create: (options: any): Url => {
                    return new Url(options.data, this);
                }
            };

            this.canAddUrl = ko.computed((): boolean => {
                return !this.urlsSpinner.isVisible() && this.editingUrl() === 0 && this.id !== 0;
            });

            // request URLs
            ko.computed((): void => {
                if (this.id)
                    this.requestUrls();

                else setTimeout(() => {
                    this.urlsSpinner.stop();
                    this.addUrl();
                }, 0);
            }).extend({ throttle: 1 });
        }

        //#endregion

        submitToCreate(formElement: HTMLFormElement): boolean {
            if (!this.id || this.id === 0) {
                var me = this;
                this.validatingSpinner.start();

                // reference the single name and url
                var officialName: Name = this.names()[0];
                var officialUrl: Url = this.urls()[0];
                var location = this.location;

                // wait for async validation to stop
                if (officialName.text.isValidating() || officialUrl.value.isValidating() ||
                    this.ceebCode.isValidating() || this.uCosmicCode.isValidating()) {
                    setTimeout((): boolean => {
                        var waitResult = this.submitToCreate(formElement);
                        return false;
                    }, 50);
                    return false;
                }

                // check validity
                this.isValidationSummaryVisible(true);
                if (!this.isValid()) {
                    this.errors.showAllMessages();
                }
                if (!officialName.isValid()) {
                    officialName.errors.showAllMessages();
                }
                if (!officialUrl.isValid()) {
                    officialUrl.errors.showAllMessages();
                }
                this.validatingSpinner.stop();
                if (officialName.isValid() && officialUrl.isValid() && this.isValid()) {
                    var url = App.Routes.WebApi.Establishments.post();
                    var data = this.serializeData();
                    data.officialName = officialName.serializeData();
                    data.officialUrl = officialUrl.serializeData();
                    data.location = location.serializeData();
                    this.createSpinner.start();
                    $.post(url, data)
                    .done((response: any, statusText: string, xhr: JQueryXHR): void => {
                        // redirect to show
                        window.location.href = App.Routes.Mvc.Establishments
                            .created({ location: xhr.getResponseHeader('Location') });
                    })
                    .fail((xhr: JQueryXHR, statusText: string, errorThrown: string): void => {
                        this.createSpinner.stop();
                        if (xhr.status === 400) { // validation message will be in xhr response text...
                            this.$genericAlertDialog.find('p.content')
                                .html(xhr.responseText.replace('\n', '<br /><br />'));
                            this.$genericAlertDialog.dialog({
                                title: 'Alert Message',
                                dialogClass: 'jquery-ui',
                                width: 'auto',
                                resizable: false,
                                modal: true,
                                buttons: {
                                    'Ok': (): void => { this.$genericAlertDialog.dialog('close'); }
                                }
                            });
                        }
                    });
                }
            }

            return false;
        }

        serializeData(): any {
            var data: any = {};
            data.parentId = this.parentId();
            data.typeId = this.typeId();
            data.ceebCode = this.ceebCode();
            data.uCosmicCode = this.uCosmicCode();
            return data;
        }

        // hit /api/establishments/{id} for scalar values
        private _loadScalars(): JQueryDeferred<void> {
            var deferred = $.Deferred();
            if (this.id) {
                $.get(App.Routes.WebApi.Establishments.get(this.id))
                    .done((response: IServerApiScalarModel, textStatus: string, jqXHR: JQueryXHR): void => {
                        deferred.resolve(response);
                    })
                    .fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
                        deferred.reject(jqXHR, textStatus, errorThrown);
                    });
            }
            else {
                deferred.resolve(undefined);
            }
            return deferred;
        }

        // populate scalar value observables from api values
        private _pullScalars(response: IServerApiScalarModel): void {
            this.originalValues(response);
            if (response) {
                ko.mapping.fromJS(response, {
                    ignore: ['id']
                }, this);
            }
        }

        // hide read-only UI and allow form input for typeId & institution codes
        clickToEditTypeId(): void {
            this.isEditingTypeId(true);
        }

        // save typeId & institution codes
        clickToSaveTypeId(): void {
            if (!this.id) return; // guard against a put before establishment is created

            // wait for async validators to finish
            if (this.ceebCode.isValidating() || this.uCosmicCode.isValidating()) {
                this.typeIdValidatingSpinner.start();
                window.setTimeout((): void => {
                    this.clickToSaveTypeId();
                }, 50);
                return;
            }

            this.typeIdValidatingSpinner.stop();
            if (!this.isValid()) {
                this.errors.showAllMessages();
            }
            else {
                this.typeIdSaveSpinner.start();
                var data = this.serializeData();
                var originalValues = this.originalValues();
                data.parentId = originalValues.parentId;
                var url = App.Routes.WebApi.Establishments.put(this.id);
                $.ajax({
                    url: url,
                    type: 'PUT',
                    data: data
                })
                .always((): void => {
                    this.typeIdSaveSpinner.stop();
                })
                .done((response: string, statusText: string, xhr: JQueryXHR): void => {
                    App.flasher.flash(response);
                    this.typeIdSaveSpinner.stop();
                    this.clickToCancelTypeIdEdit();
                });
            }
        }

        // restore original values when cancelling edit of typeId & institution codes
        clickToCancelTypeIdEdit(): void {
            this.isEditingTypeId(false);
            this._loadScalars().done((response: IServerApiScalarModel): void => {
                this._pullScalars(response);
            });
        }

        sideSwiper = new App.SideSwiper({
            frameWidth: 980, speed: 'fast', root: '#establishment_page'
        });
        parentSearch = new Search(false);
        sammy: Sammy.Application = Sammy();
        private _findingParent: boolean = false;
        parentEstablishment: KnockoutObservable<any> = ko.observable();
        parentId: KnockoutObservable<number> = ko.observable();
        private _parentScrollTop: number;
        parentIdSaveSpinner: Spinner = new Spinner(new SpinnerOptions(200));
        parentIdValidatingSpinner: Spinner = new Spinner(new SpinnerOptions(200));

        private _setupSammy(): void {
            var self = this;

            this.parentSearch.sammyBeforeRoute = /\#\/select-parent\/page\/(.*)\//;
            this.parentSearch.sammyGetPageRoute = '#/select-parent/page/:pageNumber/';
            this.parentSearch.initDefaultPageRoute = false;
            this.parentSearch.setLocation = (): void => {
                var location = '#/select-parent/page/' + this.parentSearch.pageNumber() + '/';
                if (this.parentSearch.sammy.getLocation() !== location)
                    this.parentSearch.sammy.setLocation(location);
            }

            this.parentSearch.clickAction = (viewModel: SearchResult, e: JQueryEventObject): boolean => {
                this.parentEstablishment(viewModel);
                this.parentId(viewModel.id());
                this.sammy.setLocation('/establishments/' + this.id + '/#/');
                return false;
            }

            this.parentSearch.detailHref = (): string => {
                return '#/';
            }

            this.parentSearch.detailTooltip = (): string => {
                return 'Choose this establishment as the parent';
            }

            this.parentSearch.sammy.run();

            this.sammy.get('/#/select-parent/page/:pageNumber/', function () {
                if (!self._findingParent) {
                    self._findingParent = true;
                    self._parentScrollTop = App.WindowScroller.getTop();
                    self.sideSwiper.next();
                    self.parentSearch.pageNumber(1);
                    self.parentSearch.transitionedPageNumber(1);
                }
                else {
                    self.parentSearch.getPage(this.params['pageNumber']);
                }
            });

            this.sammy.get('/establishments/:establishmentId/#/', function () {
                if (self._findingParent) {
                    self.sideSwiper.prev(1, (): void => {
                        App.WindowScroller.setTop(self._parentScrollTop);
                    });
                    self._findingParent = false;
                }
            });

            this.sammy.setLocation('#/');
        }

        hasParent: KnockoutComputed<boolean>;
        isParentDirty: KnockoutComputed<boolean>;
        isParentIdSaveDisabled: KnockoutComputed<boolean>;
        private _setupParentComputeds(): void {
            var parentId = this.parentId();

            this.isParentDirty = ko.computed((): boolean => {
                var parentId = this.parentId();
                var originalValues = this.originalValues();
                if (!this.id) return false;
                if (originalValues)
                    return parentId != originalValues.parentId;
                return false;
            });

            this.hasParent = ko.computed((): boolean => {
                return this.parentId() !== undefined && this.parentId() > 0;
            });

            this.isParentIdSaveDisabled = ko.computed((): boolean => {
                return this.parentId.isValidating()
                    || this.parentIdSaveSpinner.isVisible()
                    || this.parentIdValidatingSpinner.isVisible()
                    || this.parentId.error;
            });

            this.parentId.subscribe((newValue: number): void => {
                if (!newValue) {
                    this.parentEstablishment(undefined);
                }
                else {
                    var url = App.Routes.WebApi.Establishments.get();
                    $.get(url, { id: newValue })
                    .done((response: any): void => {
                        if (response && response.items && response.items.length) {
                            var parent = response.items[0];
                            this.parentEstablishment(new SearchResult(parent, this.parentSearch));
                        }
                    });
                }
            });

        }

        clearParent(vm: any, e: JQueryEventObject): void {
            this.parentId(undefined);
            e.stopPropagation();
        }

        clickToCancelParentIdEdit(): void {
            this.parentId(this.originalValues().parentId);
        }

        // save typeId & institution codes
        clickToSaveParentId(): void {
            if (!this.id) return; // guard against a put before establishment is created

            // wait for async validator to finish
            if (this.parentId.isValidating()) {
                this.parentIdValidatingSpinner.start();
                window.setTimeout((): void => {
                    this.clickToSaveParentId();
                }, 50);
                return;
            }

            this.parentIdValidatingSpinner.stop();
            if (!this.isValid()) {
                this.errors.showAllMessages();
            }
            else {
                this.parentIdSaveSpinner.start();
                var data = this.serializeData();
                var originalValues = this.originalValues();
                data.typeId = originalValues.typeId;
                data.ceebCode = originalValues.ceebCode;
                data.uCosmicCode = originalValues.uCosmicCode;
                var url = App.Routes.WebApi.Establishments.put(this.id);
                $.ajax({
                    url: url,
                    type: 'PUT',
                    data: data
                })
                .always((): void => {
                    this.parentIdSaveSpinner.stop();
                })
                .done((response: string, statusText: string, xhr: JQueryXHR): void => {
                    App.flasher.flash(response);
                    this.parentIdSaveSpinner.stop();
                    var originalValues = this.originalValues();
                    originalValues.parentId = data.parentId;
                    this.originalValues(originalValues);
                });
            }
        }
    }
}
