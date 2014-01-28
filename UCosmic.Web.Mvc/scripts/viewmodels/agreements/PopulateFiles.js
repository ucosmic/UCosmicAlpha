var Agreements;
(function (Agreements) {
    var FileListPopulator = (function () {
        function FileListPopulator() {
            this.files = ko.mapping.fromJS([]);
        }
        FileListPopulator.prototype.populate = function (agreementId, deferredPopFiles) {
            var _this = this;
            deferredPopFiles = ((deferredPopFiles) ? deferredPopFiles : $.Deferred());
            $.get(App.Routes.WebApi.Agreements.Files.get(agreementId)).done(function (response) {
                $.each(response, function (i, item) {
                    _this.files.push(ko.mapping.fromJS({
                        id: item.id,
                        originalName: item.originalName,
                        customName: item.customName,
                        visibility: item.visibility,
                        isEdit: false,
                        isNotValidated: false,
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
    Agreements.FileListPopulator = FileListPopulator;
})(Agreements || (Agreements = {}));
