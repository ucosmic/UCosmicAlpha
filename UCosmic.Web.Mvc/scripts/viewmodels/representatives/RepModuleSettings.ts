/// <reference path="../../jquery/jquery.d.ts" />
/// <reference path="../../jquery/jqueryui.d.ts" />
/// <reference path="../../ko/knockout.d.ts" />
/// <reference path="../../ko/knockout.mapping.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../ko/knockout.validation.d.ts" />
/// <reference path="../../kendo/kendo.all.d.ts" />

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