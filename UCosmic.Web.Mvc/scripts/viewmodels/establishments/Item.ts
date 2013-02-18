/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../google/google.maps.d.ts" />
/// <reference path="../../google/ToolsOverlay.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../Spinner.ts" />
/// <reference path="../places/ServerApiModel.ts" />
/// <reference path="../languages/ServerApiModel.ts" />
/// <reference path="ServerApiModel.d.ts" />
/// <reference path="Name.ts" />
/// <reference path="Url.ts" />
/// <reference path="Location.ts" />


module ViewModels.Establishments {

    import gm = google.maps

    export class Item implements KnockoutValidationGroup {

        // fields
        id: number = 0;
        private _originalValues: any;
        private _isInitialized: KnockoutObservableBool = ko.observable(false);
        $genericAlertDialog: JQuery = undefined;
        location: Location;
        createSpinner: Spinner = new Spinner(new SpinnerOptions(0));
        validatingSpinner: Spinner = new Spinner(new SpinnerOptions(200));
        categories: KnockoutObservableArray = ko.observableArray();
        typeId: KnockoutObservableNumber = ko.observable();
        typeEmptyText: KnockoutComputed;
        isValid: () => bool;
        errors: KnockoutValidationErrors;

        constructor(id?: number) {

            // initialize the aggregate id
            this.id = id || 0;

            this._initNamesComputeds();
            this._initUrlsComputeds();
            this.location = new Location(this.id);

            this.typeEmptyText = ko.computed((): string => {
                return this.categories().length > 0 ? '[Select a type]' : '[Loading...]';
            });

            this.typeId.extend({
                required: {
                    message: 'Establishment type is required'
                }
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

            var viewModelPact = $.Deferred();
            if (this.id) {
                $.get(App.Routes.WebApi.Establishments.get(this.id))
                    .done((data: IServerApiScalarModel, textStatus: string, jqXHR: JQueryXHR): void => {
                        viewModelPact.resolve(data);
                    })
                    .fail((jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
                        viewModelPact.reject(jqXHR, textStatus, errorThrown);
                    });
            }
            else {
                viewModelPact.resolve(undefined);
            }

            $.when(categoriesPact, viewModelPact).then(

                // all requests succeeded
                (categories: any[], viewModel: IServerApiScalarModel): void => {

                    ko.mapping.fromJS(categories, {}, this.categories);
                    if (viewModel) {
                        ko.mapping.fromJS(viewModel, {
                            ignore: ['id']
                        }, this);
                    }

                    this._originalValues = viewModel;
                    
                    if (!this._isInitialized()) {
                        //$(this).trigger('ready'); // ready to apply bindings
                        this._isInitialized(true); // bindings have been applied
                        //this.$facultyRanks().kendoDropDownList(); // kendoui dropdown for faculty ranks
                    }
                },

                // one of the responses failed (never called more than once, even on multifailures)
                (xhr: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    //alert('a GET API call failed :(');
                });

            ko.computed((): void => {
                if (!this.id || !this._isInitialized()) return;
                var typeId = this.typeId();
                var data = {
                    typeId: typeId
                };
                if (data.typeId == this._originalValues.typeId) {
                    return;
                }
                var url = App.Routes.WebApi.Establishments.put(this.id);
                $.ajax({
                    url: url,
                    type: 'PUT',
                    data: data
                })
                .done((response: string, statusText: string, xhr: JQueryXHR): void => {
                    App.flasher.flash(response);
                    $.get(App.Routes.WebApi.Establishments.get(this.id))
                        .done((viewModel: IServerApiScalarModel, textStatus: string, jqXHR: JQueryXHR): void => {
                            // TODO: not dry
                            if (viewModel) {
                                ko.mapping.fromJS(viewModel, {
                                    ignore: ['id']
                                }, this);
                            }
                            // TODO: not dry
                            this._originalValues = viewModel;
                        })
                })
                .fail((xhr: JQueryXHR, statusText: string, errorThrown: string): void => {
                    //alert('fail :(');
                });
            }).extend({ throttle: 400 });

            ko.validation.group(this);
        }

        //#region Names

        // observables, computeds, & variables
        languages: KnockoutObservableLanguageModelArray = ko.observableArray(); // select options
        names: KnockoutObservableEstablishmentNameViewModelArray = ko.observableArray();
        editingName: KnockoutObservableNumber = ko.observable(0);
        canAddName: KnockoutComputed;
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

            this.canAddName = ko.computed((): bool => {
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
        urls: KnockoutObservableEstablishmentUrlViewModelArray = ko.observableArray();
        editingUrl: KnockoutObservableNumber = ko.observable(0);
        canAddUrl: KnockoutComputed;
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

            this.canAddUrl = ko.computed((): bool => {
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

        submitToCreate(formElement: HTMLFormElement): bool {
            if (!this.id || this.id === 0) {
                var me = this;
                this.validatingSpinner.start();

                // reference the single name and url
                var officialName: Name = this.names()[0];
                var officialUrl: Url = this.urls()[0];
                var location = this.location;

                // wait for async validation to stop
                if (officialName.text.isValidating() || officialUrl.value.isValidating()) {
                    setTimeout((): bool => {
                        var waitResult = this.submitToCreate(formElement);
                        return false;
                    }, 5);
                    return false;
                }

                // check validity
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
                if (officialName.isValid() && officialUrl.isValid()) {
                    var url = App.Routes.WebApi.Establishments.post();
                    var data: any = {
                        typeId: me.typeId(),
                        officialName: officialName.serializeData(),
                        officialUrl: officialUrl.serializeData(),
                        location: location.serializeData()
                    };
                    this.createSpinner.start();
                    $.post(url, data)
                    .done((response: any, statusText: string, xhr: JQueryXHR): void => {
                        // redirect to show
                        window.location.href = App.Routes.Mvc.Establishments
                            .created(xhr.getResponseHeader('Location'));
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
    }
}
