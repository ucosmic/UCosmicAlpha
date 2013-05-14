/// <reference path="../../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../../jquery/jqueryui-1.9.d.ts" />
/// <reference path="../../../ko/knockout-2.2.d.ts" />
/// <reference path="../../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../../ko/knockout.validation.d.ts" />
/// <reference path="../../../app/Routes.ts" />
/// <reference path="../../Flasher.ts" />

  


import SearchApiModel = module('./ServerApiModel')
import Item = module('./Item')

import Spinner = module('../Widgets/Spinner')
export class ServerNameApiModel implements SearchApiModel.IServerNameApiModel {
        
        id: number = 0;
        ownerId: number = 0;
        text: string = '';
        isOfficialName: bool = false;
        isFormerName: bool = false;
        languageCode: string = '';
        languageName: string = '';

        constructor (ownerId: number) {
            this.ownerId = ownerId;
        }
    }

    class EstablishmentNameTextValidator implements KnockoutValidationAsyncRuleDefinition {
        private _ruleName: string = 'validEstablishmentNameText';
        private _isAwaitingResponse: bool = false;
        async: bool = true;
        message: string =  'error';
        validator(val: string, vm: Name, callback: KnockoutValidationAsyncCallback) {
            if (!vm.isTextValidatableAsync()) {
                callback(true);
            }
            else if (!this._isAwaitingResponse) {
                var route = App.Routes.WebApi.Establishments.Names
                    .validateText(vm.ownerId(), vm.id());
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
    new EstablishmentNameTextValidator();

    export class Name implements KnockoutValidationGroup {

        // api observables
        id: KnockoutObservableNumber = ko.observable();
        ownerId: KnockoutObservableNumber = ko.observable();
        text: KnockoutObservableString = ko.observable();
        isOfficialName: KnockoutObservableBool = ko.observable();
        isFormerName: KnockoutObservableBool = ko.observable();
        languageName: KnockoutObservableString = ko.observable();
        languageCode: KnockoutObservableString = ko.observable();

        // other observables
        editMode: KnockoutObservableBool = ko.observable();
        $textElement: JQuery = undefined; // bind to this so we can focus it on actions
        $languagesElement: JQuery = undefined; // bind to this so we can restore on back button
        selectedLanguageCode: KnockoutObservableString; // shadow to restore after list Item.Items are bound
        $confirmPurgeDialog: JQuery = undefined;
        isValid: () => bool;
        errors: KnockoutValidationErrors;

        // computeds
        isOfficialNameEnabled: KnockoutComputed;
        isTextValidatableAsync: KnockoutComputed;

        
        // spinners
        saveSpinner: Spinner.Spinner = new Spinner.Spinner(new Spinner.SpinnerOptions(0, false));
        purgeSpinner: Spinner.Spinner = new Spinner.Spinner(new Spinner.SpinnerOptions(0, false));
        textValidationSpinner = new Spinner.Spinner(new Spinner.SpinnerOptions(0, false));

        
        // private fields
        private saveEditorClicked: bool = false;
        private originalValues: ServerNameApiModel;
        private owner: Item.Item;
        private mutationSuccess: (response: string) => void;
        private mutationError: (xhr: JQueryXHR) => void;

        constructor(js: ServerNameApiModel, owner: Item.Item) {
            this.owner = owner;

            // when adding new name, js is not defined
            if (!js) js = new ServerNameApiModel(this.owner.id);
            if (js.id === 0) js.ownerId = this.owner.id;

            // hold onto original values so they can be reset on cancel
            this.originalValues = js;

            // map api properties to observables
            ko.mapping.fromJS(js, {}, this);

            // view computeds
            this.isOfficialNameEnabled = ko.computed((): bool => {
                return !this.originalValues.isOfficialName;
            });

            // text validation
            this.isTextValidatableAsync = ko.computed((): bool => {
                return this.text() !== this.originalValues.text;
            });
            this.text.extend({
                required: {
                    message: 'Establishment name is required.'
                },
                maxLength: 400,
                validEstablishmentNameText: this
            });
            this.text.isValidating.subscribe((isValidating: bool): void => {
                if (isValidating) {
                    this.textValidationSpinner.start();
                }
                else {
                    this.textValidationSpinner.stop();
                    if (this.saveEditorClicked) this.saveEditor();
                }
            });

            // languages
            this.selectedLanguageCode = ko.observable(this.originalValues.languageCode);
            this.owner.languages.subscribe((): void => { // select correct option after options are loaded
                this.selectedLanguageCode(this.languageCode()); // shadow property is bound to dropdown list
            });

            // official name cannot be former name
            this.isOfficialName.subscribe((newValue: bool): void => {
                if (newValue) this.isFormerName(false);
            });

            this.mutationSuccess = (response: string): void => {
                this.owner.requestNames((): void => {
                    this.owner.editingName(0); // tell parent no Item.Item is being edited anymore
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

        clickOfficialNameCheckbox(): bool { // educate users on how to change the official name
            if (this.originalValues.isOfficialName) { // only when the name is already official in the db
                this.owner.$genericAlertDialog.find('p.content')
                    .html('In order to choose a different official name for this establishment, edit the name you wish to make the new official name.');
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

        showEditor(): void { // click to hide viewer and show editor
            var editingName = this.owner.editingName(); // disallow if another name is being edited
            if (!editingName) {
                this.owner.editingName(this.id() || -1); // tell parent which Item.Item is being edited
                this.editMode(true); // show the form / hide the viewer
                this.$textElement.trigger('autosize');
                this.$textElement.focus(); // focus the text box
            }
        }

        saveEditor(): bool {
            this.saveEditorClicked = true;
            if (!this.isValid()) { // validate
                this.saveEditorClicked = false;
                this.errors.showAllMessages();
            }
            else if (!this.text.isValidating()) { // hit server
                this.saveEditorClicked = false;
                this.saveSpinner.start(); // start save spinner

                if (this.id()) {
                    $.ajax({ // submit ajax PUT request
                        url: App.Routes.WebApi.Establishments.Names.put(this.owner.id, this.id()),
                        type: 'PUT',
                        data: this.serializeData()
                    })
                    .done(this.mutationSuccess).fail(this.mutationError);
                }
                else if (this.owner.id) {
                    $.ajax({ // submit ajax POST request
                        url: App.Routes.WebApi.Establishments.Names.post(this.owner.id),
                        type: 'POST',
                        data: this.serializeData()
                    })
                    .done(this.mutationSuccess).fail(this.mutationError);
                }
            }
            return false;
        }

        cancelEditor(): void {
            this.owner.editingName(0); // tell parent no Item.Item is being edited anymore
            if (this.id()) {
                ko.mapping.fromJS(this.originalValues, {}, this); // restore original values
                this.editMode(false); // hide the form, show the view
            }
            else {
                this.owner.Names.shift(); // remove the new empty Item.Item
            }
        }

        purge(vm: Name, e: JQueryEventObject): void {
            e.stopPropagation();
            if (this.owner.editingName()) return;
            if (this.isOfficialName()) {
                this.owner.$genericAlertDialog.find('p.content')
                    .html('You cannot delete an establishment\'s official name.<br />To delete this name, first assign another name as official.');
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
                                url: App.Routes.WebApi.Establishments.Names.del(this.owner.id, this.id()),
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

        serializeData(): SearchApiModel.IServerNameInputModel {
            return {
                id: this.id(),
                ownerId: this.ownerId(),
                text: $.trim(this.text()),
                isOfficialName: this.isOfficialName(),
                isFormerName: this.isFormerName(),
                languageCode: this.selectedLanguageCode()
            };
        }
    }
