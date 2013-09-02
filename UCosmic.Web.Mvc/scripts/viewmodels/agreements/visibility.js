/// <reference path="../../typings/knockout/knockout.d.ts" />
var agreements;
(function (agreements) {
    var visibility = (function () {
        function visibility() {
            this.visibility = ko.observable();
        }
        return visibility;
    })();
    agreements.visibility = visibility;
})(agreements || (agreements = {}));
