var People;
(function (People) {
    //var modelData;// just for typescript because this is passed set up in the page itself.
    (function (ViewModels) {
        var LanguageViewModel = (function () {
            function LanguageViewModel(modelData) {
            }
            return LanguageViewModel;
        })();
        ViewModels.LanguageViewModel = LanguageViewModel;
    })(People.ViewModels || (People.ViewModels = {}));
    var ViewModels = People.ViewModels;
})(People || (People = {}));
