/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../app/Routes.ts" />
var agreements;
(function (agreements) {
    var FileListPopulator = (function () {
        function FileListPopulator() {
            this.files = ko.mapping.fromJS([]);
        }
        FileListPopulator.prototype.populate = function (agreementId, deferredPopFiles) {
            var _this = this;
            deferredPopFiles = ((deferredPopFiles) ? deferredPopFiles : $.Deferred());
            $.get(App.Routes.WebApi.Agreements.Files.get(agreementId), { useTestData: true }).done(function (response) {
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
                if (deferredPopFiles != undefined) {
                    deferredPopFiles.resolve();
                }
            });
        };
        return FileListPopulator;
    })();
    agreements.FileListPopulator = FileListPopulator;
})(agreements || (agreements = {}));
