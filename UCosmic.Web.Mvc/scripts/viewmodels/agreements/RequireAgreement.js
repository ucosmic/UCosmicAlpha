require([
    "viewmodels/agreements/AgreementVM"
], function (Agreement) {
    var agreementViewModel = new Agreement.InstitutionalAgreementEditModel();
    ko.applyBindings(agreementViewModel, $('#main')[0]);
    agreementViewModel.sammy.run();
});
