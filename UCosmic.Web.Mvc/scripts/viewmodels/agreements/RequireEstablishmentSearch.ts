/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../require.d.ts" />

require(["viewmodels/amd-modules/establishments/search"],
function (Search) {


    var establishmentSearchViewModel = new Search.Search();
    ko.applyBindings(establishmentSearchViewModel, $('#main')[0]);
    establishmentSearchViewModel.sammy.run();
});