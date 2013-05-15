/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../require.d.ts" />


require(["viewmodels/amd-modules/establishments/search", "viewmodels/amd-modules/widgets/flasher"],
function (Search) {


    var establishmentSearchViewModel = new Search.Search();
    ko.applyBindings(establishmentSearchViewModel, $('[data-current-module=admin]')[0]);
    establishmentSearchViewModel.sammy.run();
});