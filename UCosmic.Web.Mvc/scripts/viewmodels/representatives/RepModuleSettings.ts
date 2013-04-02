/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../jquery/jqueryui-1.9.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />
/// <reference path="../../ko/knockout.extensions.d.ts" />
/// <reference path="../../ko/knockout.validation.d.ts" />
/// <reference path="../../kendo/kendouiweb.d.ts" />

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