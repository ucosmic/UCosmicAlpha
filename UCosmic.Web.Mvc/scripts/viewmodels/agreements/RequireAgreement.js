/// <reference path="../../typings/requirejs/require.d.ts" />
/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
require(["../../viewmodels/agreements/AgreementVM"], function (Agreement) {
    var agreementViewModel = new Agreement.InstitutionalAgreementEditModel();
    ko.applyBindings(agreementViewModel, $('#allParticipants')[0]);
    //agreementViewModel.sammy.run();
});
