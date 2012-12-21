/// <reference path="../../jquery/jquery-1.8.3.js" />
/// <reference path="../../jquery/jquery-ui-1.9.2.js" />
/// <reference path="../../ko/knockout-2.2.0.js" />
/// <reference path="../../ko/knockout.mapping-latest.js" />
/// <reference path="../../ko/knockout.validation.js" />
/// <reference path="../../app/App.js" />
/// <reference path="../../app/Routes.js" />
/// <reference path="EstablishmentNameViewModel.js" />
/// <reference path="EstablishmentUrlViewModel.js" />
/// <reference path="Name.js" />

function EstablishmentItemViewModel(id) {
    var self = this;

    self.id = id || 0; // initialize the aggregate id
    self.genericAlertDialog = undefined;

    // languages dropdowns
    self.languages = ko.observableArray(); // select options
    ko.computed(function () { // get languages from the server
        $.getJSON(App.Routes.WebApi.Languages.get())
        .success(function (response) {
            response.splice(0, 0, { code: undefined, name: '[Language Neutral]' }); // add null option
            self.languages(response); // set the options dropdown
        });
    })
    .extend({ throttle: 1 });

    // names
    self.isSpinningNames = ko.observable(true);
    self.names = ko.observableArray();
    self.editingName = ko.observable();
    self.namesMapping = {
        create: function (options) {
            //return new EstablishmentNameViewModel(options.data, self);
            return new ViewModels.Establishments.Name(options.data, self);
        }
    };
    self.receiveNames = function (js) {
        ko.mapping.fromJS(js || [], self.namesMapping, self.names);
        self.isSpinningNames(false);
        App.Obtruder.obtrude(document);
    };
    self.requestNames = function (callback) {
        self.isSpinningNames(true);
        $.get(App.Routes.WebApi.EstablishmentNames.get(self.id), {})
        .success(function (response) {
            self.receiveNames(response);
            if (callback) callback(response);
        });
    };
    self.addName = function () {
        //var newName = new EstablishmentNameViewModel(null, self);
        var newName = new ViewModels.Establishments.Name(null, self);
        self.names.unshift(newName);
        newName.showEditor();
        App.Obtruder.obtrude(document);
    };

    ko.computed(self.requestNames).extend({ throttle: 1 });

    // urls
    self.isSpinningUrls = ko.observable(true);
    self.urls = ko.observableArray();
    self.editingUrl = ko.observable();
    self.urlsMapping = {
        create: function (options) {
            return new EstablishmentUrlViewModel(options.data, self);
        }
    };
    self.receiveUrls = function (js) {
        ko.mapping.fromJS(js || [], self.urlsMapping, self.urls);
        self.isSpinningUrls(false);
        App.Obtruder.obtrude(document);
    };
    self.requestUrls = function (callback) {
        self.isSpinningUrls(true);
        $.get(App.Routes.WebApi.EstablishmentUrls.get(self.id), {})
        .success(function (response) {
            self.receiveUrls(response);
            if (callback) callback(response);
        });
    };
    self.addUrl = function () {
        var newUrl = new EstablishmentUrlViewModel(null, self);
        self.urls.unshift(newUrl);
        newUrl.showEditor();
        App.Obtruder.obtrude(document);
    };

    ko.computed(self.requestUrls).extend({ throttle: 1 });
}
