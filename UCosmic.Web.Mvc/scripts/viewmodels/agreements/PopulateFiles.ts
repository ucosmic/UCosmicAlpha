module Agreements {
    export class FileListPopulator {
        files = ko.mapping.fromJS([]);
        populate(agreementId, deferredPopFiles?): void {
            deferredPopFiles = ((deferredPopFiles) ? deferredPopFiles : $.Deferred());
            $.get(App.Routes.WebApi.Agreements.Files.get(agreementId))
                .done((response: any): void => {
                    $.each(response, (i, item) => {
                        this.files.push(ko.mapping.fromJS({
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
        }
    }
}
