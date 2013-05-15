require([
    "viewmodels/amd-modules/establishments/search", 
    "viewmodels/amd-modules/widgets/flasher"
], function (Search) {
    var establishmentSearchViewModel = new Search.Search();
    ko.applyBindings(establishmentSearchViewModel, $('[data-current-module=admin]')[0]);
    establishmentSearchViewModel.sammy.run();
});
