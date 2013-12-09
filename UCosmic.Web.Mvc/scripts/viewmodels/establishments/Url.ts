/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
/// <reference path="../../app/Routes.ts" />
/// <reference path="../../app/Flasher.ts" />
/// <reference path="../../app/Spinner.ts" />
/// <reference path="Item.ts" />
/// <reference path="ApiModels.d.ts" />

module Establishments.ServerModels {
    export class Url implements ApiModels.Url {

        id: number = 0;
        ownerId: number = 0;
        value: string = '';
        isOfficialUrl: boolean = false;
        isFormerUrl: boolean = false;

        constructor (ownerId: number) {
            this.ownerId = ownerId;
        }
    }
}

module Establishments.ViewModels {

    class EstablishmentUrlValueValidator implements KnockoutValidationAsyncRuleDefinition {
        private _ruleName: string = 'validEstablishmentUrlValue';
        private _isAwaitingResponse: boolean = false;
        async: boolean = true;
        message: string =  'error';
        validator(val: string, vm: Url, callback: KnockoutValidationAsyncCallback) {
            if (!vm.isValueValidatableAsync()) {
                callback(true);
            }
            else if (!this._isAwaitingResponse && vm.value()) {
                var route = App.Routes.WebApi.Establishments.Urls
                    .validateValue(vm.ownerId(), vm.id());
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
        }
        constructor () {
            ko.validation.rules[this._ruleName] = this;
            ko.validation.addExtender(this._ruleName);
        }
    }
    new EstablishmentUrlValueValidator();

    export class Url implements KnockoutValidationGroup {

        // api observables
        id = ko.observable<number>();
        ownerId = ko.observable<number>();
        value = ko.observable<string>();
        isOfficialUrl = ko.observable<boolean>();
        isFormerUrl = ko.observable<boolean>();

        // other observables
        editMode = ko.observable<boolean>();
        $valueElement: JQuery = undefined; // bind to this so we can focus it on actions
        $confirmPurgeDialog: JQuery = undefined;
        isValid: () => boolean;
        errors: KnockoutValidationErrors;

        // computeds
        isOfficialUrlEnabled: KnockoutComputed<boolean>;
        isValueValidatableAsync: KnockoutComputed<boolean>;
        isDeletable: KnockoutComputed<boolean>;
        valueHref: KnockoutComputed<string>;

        // spinners
        saveSpinner = new App.Spinner();
        purgeSpinner = new App.Spinner();
        valueValidationSpinner = new App.Spinner();

        // private fields
        private saveEditorClicked: boolean = false;
        private originalValues: ApiModels.Url;
        private owner: Item;
        private mutationSuccess: (response: string) => void;
        private mutationError: (xhr: JQueryXHR) => void;

        constructor (js: ApiModels.Url, owner: Item) {
            this.owner = owner;

            // when adding new URL, js is not defined
            if (!js) js = new ServerModels.Url(this.owner.id);
            if (js.id === 0) js.ownerId = this.owner.id;

            // hold onto original values so they can be reset on cancel
            this.originalValues = js;

            // map api properties to observables
            ko.mapping.fromJS(js, {}, this);

            // view computeds
            this.isOfficialUrlEnabled = ko.computed((): boolean => {
                return !this.originalValues.isOfficialUrl;
            });

            // value validation
            this.isValueValidatableAsync = ko.computed((): boolean => {
                return this.value() !== this.originalValues.value;
            });
            this.value.extend({
                maxLength: 200,
                validEstablishmentUrlValue: this
            });
            if (this.owner.id) {
                this.value.extend({
                    required: {
                        message: 'Establishment URL is required.'
                    },
                });
            }
            this.value.isValidating.subscribe((isValidating: boolean): void => {
                if (isValidating) {
                    this.valueValidationSpinner.start();
                }
                else {
                    this.valueValidationSpinner.stop();
                    if (this.saveEditorClicked) this.saveEditor();
                }
            });

            // official URL cannot be former URL
            this.isOfficialUrl.subscribe((newValue: boolean): void => {
                if (newValue) this.isFormerUrl(false);
            });

            // prepend protocol to URL for hrefs
            this.valueHref = ko.computed((): string => {
                var url = this.value();
                if (!url) return url;
                return 'http://' + url;
            });

            this.isDeletable = ko.computed((): boolean => {
                if (this.owner.editingUrl()) return false;
                if (this.owner.urls().length == 1) return true;
                return !this.isOfficialUrl();
            });

            this.mutationSuccess = (response: string): void => {
                this.owner.requestUrls((): void => {
                    this.owner.editingUrl(0); // tell parent no item is being edited anymore
                    this.editMode(false); // hide the form, show the view
                    this.saveSpinner.stop(); // stop save spinner
                    this.purgeSpinner.stop(); // stop purge spinner
                    App.flasher.flash(response);
                });
            };

            this.mutationError = (xhr: JQueryXHR): void => {
                if (xhr.status === 400) { // validation message will be in xhr response text...
                    this.owner.$genericAlertDialog.find('p.content')
                        .html(xhr.responseText.replace('\n', '<br /><br />'));
                    this.owner.$genericAlertDialog.dialog({
                        title: 'Alert Message',
                        dialogClass: 'jquery-ui',
                        width: 'auto',
                        resizable: false,
                        modal: true,
                        buttons: {
                            'Ok': (): void => { this.owner.$genericAlertDialog.dialog('close'); }
                        }
                    });
                }
                this.saveSpinner.stop();
                this.purgeSpinner.stop();
            };

            ko.validation.group(this);
        }

        clickLink(vm: Url, e: JQueryEventObject): boolean {
            e.stopPropagation();
            return true;
        }

        clickOfficialUrlCheckbox(): boolean { // educate users on how to change the official URL
            if (this.originalValues.isOfficialUrl) { // only when the URL is already official in the db
                this.owner.$genericAlertDialog.find('p.content')
                    .html('In order to choose a different official URL for this establishment, edit the URL you wish to make the new official URL.');
                this.owner.$genericAlertDialog.dialog({
                    title: 'Alert Message',
                    dialogClass: 'jquery-ui',
                    width: 'auto',
                    resizable: false,
                    modal: true,
                    buttons: {
                        'Ok': (): void => { this.owner.$genericAlertDialog.dialog('close'); }
                    }
                });
            }
            return true;
        }

        showEditor(): void {
            var editingUrl = this.owner.editingUrl(); // disallow if another URL is being edited
            if (!editingUrl) {
                this.owner.editingUrl(this.id() || -1); // tell parent which item is being edited
                this.editMode(true); // show the form / hide the viewer
                this.$valueElement.trigger('autosize');
                this.$valueElement.focus(); // focus the text box
            }
        }

        saveEditor(): boolean {
            this.saveEditorClicked = true;
            if (!this.isValid()) { // validate
                this.saveEditorClicked = false;
                this.errors.showAllMessages();
            }
            else if (!this.value.isValidating()) { // hit server
                this.saveEditorClicked = false;
                this.saveSpinner.start(); // start save spinner

                if (this.id()) {
                    $.ajax({ // submit ajax PUT request
                        url: App.Routes.WebApi.Establishments.Urls.put(this.owner.id, this.id()),
                        type: 'PUT',
                        data: this.serializeData()
                    })
                    .done(this.mutationSuccess).fail(this.mutationError);
                }
                else if (this.owner.id) {
                    $.ajax({ // submit ajax POST request
                        url: App.Routes.WebApi.Establishments.Urls.post(this.owner.id),
                        type: 'POST',
                        data: this.serializeData()
                    })
                    .done(this.mutationSuccess).fail(this.mutationError);
                }
            }
            return false;
        }

        cancelEditor(): void {
            this.owner.editingUrl(0); // tell parent no item is being edited anymore
            if (this.id()) {
                ko.mapping.fromJS(this.originalValues, {}, this); // restore original values
                this.editMode(false); // hide the form, show the view
            }
            else {
                this.owner.urls.shift(); // remove the new empty item
            }
        }

        purge(vm: Url, e: JQueryEventObject): void {
            e.stopPropagation();
            if (this.owner.editingUrl()) return;

            if (this.isOfficialUrl() && this.owner.urls().length > 1) {
                this.owner.$genericAlertDialog.find('p.content')
                    .html('You cannot delete an establishment\'s official URL.<br />To delete this URL, first assign another URL as official.');
                this.owner.$genericAlertDialog.dialog({
                    title: 'Alert Message',
                    dialogClass: 'jquery-ui',
                    width: 'auto',
                    resizable: false,
                    modal: true,
                    buttons: {
                        'Ok': (): void => { this.owner.$genericAlertDialog.dialog('close'); }
                    }
                });
                return;
            }
            this.purgeSpinner.start();
            var shouldRemainSpinning = false;
            this.$confirmPurgeDialog.dialog({
                dialogClass: 'jquery-ui',
                width: 'auto',
                resizable: false,
                modal: true,
                close: (): void => {
                    if (!shouldRemainSpinning) this.purgeSpinner.stop();
                },
                buttons: [
                    {
                        text: 'Yes, confirm delete',
                        click: (): void => {
                            shouldRemainSpinning = true;
                            this.$confirmPurgeDialog.dialog('close');
                            $.ajax({ // submit ajax DELETE request
                                url: App.Routes.WebApi.Establishments.Urls.del(this.owner.id, this.id()),
                                type: 'DELETE'
                            })
                            .done(this.mutationSuccess)
                            .fail(this.mutationError);
                        }
                    },
                    {
                        text: 'No, cancel delete',
                        click: (): void => {
                            this.$confirmPurgeDialog.dialog('close');
                            this.purgeSpinner.stop();
                        },
                        'data-css-link': true
                    }
                ]
            });
        }

        serializeData(): ApiModels.Url {
            return {
                id: this.id(),
                ownerId: this.ownerId(),
                value: $.trim(this.value()),
                isOfficialUrl: this.isOfficialUrl(),
                isFormerUrl: this.isFormerUrl(),
            };
        }
    }
}