/// <reference path="../../require/require.d.ts" />
/// <reference path="../../jquery/jquery.d.ts" />
/// <reference path="../../ko/knockout.d.ts" />

require(["../../viewmodels/agreements/AgreementVM"],
function (Agreement) {

        var agreementViewModel = new Agreement.InstitutionalAgreementEditModel();
        ko.applyBindings(agreementViewModel, $('#allParticipants')[0]);
        //agreementViewModel.sammy.run();
});

//import agreement = module('../agreements/AgreementVM');

//var establishmentSearchViewModel = new agreement.InstitutionalAgreementEditModel();
//    ko.applyBindings(establishmentSearchViewModel, $('#main')[0]);
//    establishmentSearchViewModel.sammy.run();