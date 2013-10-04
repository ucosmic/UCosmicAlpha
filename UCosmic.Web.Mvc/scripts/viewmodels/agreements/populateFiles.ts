/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../app/Routes.ts" />
module agreements {
    export class populateFiles{
        files = ko.mapping.fromJS([]);
        populate(agreementId, dfdPopFiles): void {
            $.get(App.Routes.WebApi.Agreements.Files.get(agreementId.val), { useTestData: true })
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
                    dfdPopFiles.resolve();
                });
        }
    }
}
