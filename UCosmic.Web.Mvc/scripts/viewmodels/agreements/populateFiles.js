/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../app/Routes.ts" />
var agreements;
(function (agreements) {
    var populateFiles = (function () {
        function populateFiles() {
            this.files = ko.mapping.fromJS([]);
        }
        populateFiles.prototype.populate = function (agreementId, dfdPopFiles) {
            var _this = this;
            $.get(App.Routes.WebApi.Agreements.Files.get(agreementId.val), { useTestData: true }).done(function (response) {
                $.each(response, function (i, item) {
                    _this.files.push(ko.mapping.fromJS({
                        id: item.id,
                        originalName: item.originalName,
                        customName: item.customName,
                        visibility: item.visibility,
                        isEdit: false,
                        customNameFile: item.customName.substring(0, item.customName.lastIndexOf(".")),
                        customNameExt: item.customName.substring(item.customName.lastIndexOf("."), item.customName.length)
                    }));
                });
                dfdPopFiles.resolve();
            });
        };
        return populateFiles;
    })();
    agreements.populateFiles = populateFiles;
})(agreements || (agreements = {}));
