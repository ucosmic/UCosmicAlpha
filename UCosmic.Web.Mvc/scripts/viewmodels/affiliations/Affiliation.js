var ViewModels;
(function (ViewModels) {
    (function (Affiliations) {
        var Affiliation = (function () {
            function Affiliation() { }
            return Affiliation;
        })();
        Affiliations.Affiliation = Affiliation;        
    })(ViewModels.Affiliations || (ViewModels.Affiliations = {}));
    var Affiliations = ViewModels.Affiliations;
})(ViewModels || (ViewModels = {}));
