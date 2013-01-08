///// <reference path="../../jquery/jquery-1.8.3.js" />
///// <reference path="../../jquery/jquery-ui-1.9.2.js" />
///// <reference path="../../ko/knockout-2.2.0.js" />
///// <reference path="../../ko/knockout.mapping-latest.js" />
///// <reference path="../../ko/knockout.validation.js" />
///// <reference path="../../app/Routes.js" />
///// <reference path="../FlasherViewModel.js" />

//ko.validation.rules['validEstablishmentUrlValue'] = {
//    async: true,
//    validator: function (val, vm, callback) {
//        var validation = this;
//        if (!vm.isValueValidatableAsync()) {
//            callback(true);
//        }
//        else if (!validation.isAwaitingResponse) {
//            var route = App.Routes.WebApi.EstablishmentUrls.validateValue(vm.ownerId(), vm.id());
//            validation.isAwaitingResponse = true;
//            $.post(route, vm.serializeData())
//            .complete(function() {
//                validation.isAwaitingResponse = false;
//            })
//            .success(function () {
//                callback(true);
//            })
//            .error(function (xhr) {
//                callback({ isValid: false, message: xhr.responseText });
//            });
//        }
//    },
//    message: 'error'
//};

//ko.validation.registerExtenders();

//function EstablishmentUrlViewModel(js, $parent) {
//    var self = this;
//    var saveEditorClicked;
//    if (!js)
//        js = {
//            id: 0,
//            ownerId: $parent.id,
//            value: '',
//            isOfficialUrl: false,
//            isFormerUrl: false
//        };
//    var originalValues = js; // hold onto original values so they can be reset on cancel
//    ko.mapping.fromJS(js, {}, self); // map api properties to observables

//    self.isOfficialUrlEnabled = ko.computed(function () {
//        return !originalValues.isOfficialUrl;
//    });

//    self.isValueValidatableAsync = ko.computed(function () {
//        return self.value() !== originalValues.value;
//    });

//    // validate value property
//    self.value.extend({
//        required: {
//            message: 'Establishment URL is required.'
//        },
//        maxLength: 200,
//        validEstablishmentUrlValue: self
//    });

//    self.value.isValidating.subscribe(function (isValidating) {
//        if (isValidating) {
//            self.isSpinningSaveValidator(true);
//        }
//        else {
//            self.isSpinningSaveValidator(false);
//            if (saveEditorClicked) self.saveEditor();
//        }
//    });

//    self.valueElement = undefined; // bind to this so we can focus it on actions

//    self.isOfficialUrl.subscribe(function (newValue) { // official url cannot be former url
//        if (newValue) self.isFormerUrl(false);
//    });

//    self.isSpinningSaveValidator = ko.observable(false);
//    self.isSpinningSave = ko.observable(false); // when save button is clicked
//    self.editMode = ko.observable(); // shows either form or read-only view
//    self.showEditor = function () { // click to hide viewer and show editor
//        var editingUrl = $parent.editingUrl(); // disallow if another url is being edited
//        if (!editingUrl) {
//            $parent.editingUrl(self.id() || -1); // tell parent which item is being edited
//            self.editMode(true); // show the form / hide the viewer
//            $(self.valueElement).trigger('autosize');
//            $(self.valueElement).focus(); // focus the text box
//        }
//    };

//    self.saveEditor = function () {
//        saveEditorClicked = true;
//        if (!self.isValid()) { // validate
//            saveEditorClicked = false;
//            self.errors.showAllMessages();
//        }
//        else if (!self.value.isValidating()) { // hit server
//            saveEditorClicked = false;
//            self.isSpinningSave(true); // start save spinner

//            if (self.id()) {
//                $.ajax({ // submit ajax PUT request
//                    url: App.Routes.WebApi.EstablishmentUrls.put($parent.id, self.id()),
//                    type: 'PUT',
//                    data: self.serializeData()
//                })
//                .success(mutationSuccess).error(mutationError);
//            }
//            else if ($parent.id) {
//                $.ajax({ // submit ajax POST request
//                    url: App.Routes.WebApi.EstablishmentUrls.post($parent.id),
//                    type: 'POST',
//                    data: self.serializeData()
//                })
//                .success(mutationSuccess).error(mutationError);
//            }
//        }
//    };

//    self.cancelEditor = function () { // decide not to edit this item
//        $parent.editingUrl(undefined); // tell parent no item is being edited anymore
//        if (self.id()) {
//            ko.mapping.fromJS(originalValues, {}, self); // restore original values
//            self.editMode(false); // hide the form, show the view
//        }
//        else {
//            $parent.urls.shift(); // remove the new empty item
//        }
//    };

//    self.clickOfficialUrlCheckbox = function () { // educate users on how to change the official url
//        if (originalValues.isOfficialUrl) { // only when the url is already official in the db
//            $($parent.genericAlertDialog).find('p.content')
//                .html('In order to choose a different official URL for this establishment, edit the URL you wish to make the new official URL.');
//            $($parent.genericAlertDialog).dialog({
//                title: 'Alert Message',
//                dialogClass: 'jquery-ui',
//                width: 'auto',
//                resizable: false,
//                modal: true,
//                buttons: {
//                    'Ok': function () { $(this).dialog('close'); }
//                }
//            });
//        }
//        return true;
//    };

//    self.valueHref = ko.computed(function() {
//        var url = self.value();
//        if (!url) return url;
//        return 'http://' + url;
//    });

//    self.clickLink = function (vm, e) {
//        e.stopPropagation();
//        return true;
//    };

//    self.isSpinningPurge = ko.observable(false);
//    self.purge = function (vm, e) {
//        e.stopPropagation();
//        if ($parent.editingUrl()) return;
//        if (self.isOfficialUrl()) {
//            $($parent.genericAlertDialog).find('p.content')
//                .html('You cannot delete an establishment\'s official URL.<br />To delete this URL, first assign another URL as official.');
//            $($parent.genericAlertDialog).dialog({
//                title: 'Alert Message',
//                dialogClass: 'jquery-ui',
//                width: 'auto',
//                resizable: false,
//                modal: true,
//                buttons: {
//                    'Ok': function () { $(this).dialog('close'); }
//                }
//            });
//            return;
//        }
//        self.isSpinningPurge(true);
//        var shouldRemainSpinning = false;
//        $(self.confirmPurgeDialog).dialog({
//            dialogClass: 'jquery-ui',
//            width: 'auto',
//            resizable: false,
//            modal: true,
//            close: function () {
//                if (!shouldRemainSpinning) self.isSpinningPurge(false);
//            },
//            buttons: [
//                {
//                    text: 'Yes, confirm delete',
//                    click: function () {
//                        shouldRemainSpinning = true;
//                        $(self.confirmPurgeDialog).dialog('close');
//                        $.ajax({ // submit ajax DELETE request
//                            url: App.Routes.WebApi.EstablishmentUrls.del($parent.id, self.id()),
//                            type: 'DELETE'
//                        })
//                        .success(mutationSuccess)
//                        .error(mutationError);
//                    }
//                },
//                {
//                    text: 'No, cancel delete',
//                    click: function () {
//                        $(self.confirmPurgeDialog).dialog('close');
//                        self.isSpinningPurge(false);
//                    },
//                    'data-css-link': true
//                }
//            ]
//        });
//    };

//    self.serializeData = function () {
//        return {
//            id: self.id(),
//            ownerId: self.ownerId(),
//            value: $.trim(self.value()),
//            isOfficialUrl: self.isOfficialUrl(),
//            isFormerUrl: self.isFormerUrl()
//        };
//    };
//    var mutationError = function (xhr) {
//        if (xhr.status === 400) { // validation message will be in xhr response text...
//            $($parent.genericAlertDialog).find('p.content').html(xhr.responseText.replace('\n', '<br /><br />'));
//            $($parent.genericAlertDialog).dialog({
//                title: 'Alert Message',
//                dialogClass: 'jquery-ui',
//                width: 'auto',
//                resizable: false,
//                modal: true,
//                buttons: {
//                    'Ok': function () { $(this).dialog('close'); }
//                }
//            });
//        }
//        self.isSpinningSave(false); // stop save spinner TODO: what if server throws non-validation exception?
//        self.isSpinningPurge(false);
//    };
//    var mutationSuccess = function (response) {
//        $parent.requestUrls(function () { // when parent receives response,
//            $parent.editingUrl(undefined); // tell parent no item is being edited anymore
//            self.editMode(false); // hide the form, show the view
//            self.isSpinningSave(false); // stop save spinner
//            self.isSpinningPurge(false); // stop purge spinner
//            App.flasher.flash(response);
//        });
//    };

//    ko.validation.group(self); // create a separate validation group for this item
//}
