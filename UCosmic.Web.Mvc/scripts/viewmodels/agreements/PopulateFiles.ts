/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../app/Routes.ts" />
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
