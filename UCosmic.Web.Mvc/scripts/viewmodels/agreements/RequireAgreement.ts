
/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../require.d.ts" />

require(["viewmodels/agreements/AgreementVM", 'jquery/jquery-1.8.2'],
function (Agreement) {
        var agreementViewModel = new Agreement.InstitutionalAgreementEditModel();
        ko.applyBindings(agreementViewModel, $('#main')[0]);
        agreementViewModel.sammy.run();
});

//import agreement = module('../agreements/AgreementVM');

//var establishmentSearchViewModel = new agreement.InstitutionalAgreementEditModel();
//    ko.applyBindings(establishmentSearchViewModel, $('#main')[0]);
//    establishmentSearchViewModel.sammy.run();