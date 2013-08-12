/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../../typings/knockout.mapping/knockout.mapping.d.ts" />
/// <reference path="../../typings/knockout.validation/knockout.validation.d.ts" />
/// <reference path="../../typings/kendo/kendo.all.d.ts" />

module ViewModels.RepModuleSettings{


    export class RepModuleSettings{
        _welcomeMessage: string;
        _emailMessage: string;

        constructor(welcomeMessage:string, emailMessage:string){
            this._welcomeMessage = welcomeMessage;
            this._emailMessage = emailMessage;
        }
    }
}