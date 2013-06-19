require([
    "../../viewmodels/agreements/AgreementVM"
], function (Agreement) {
    var agreementViewModel = new Agreement.InstitutionalAgreementEditModel();
    ko.applyBindings(agreementViewModel, $('#allParticipants')[0]);
});
