/// <reference path="../jquery/jquery-1.8.d.ts" />

interface JQuery {
    kendoDropDownList(arg1?: any): JQuery;
    kendoComboBox(arg1?: any): JQuery;
    kendoUpload(arg1?: any): JQuery;
    kendoMenu(arg1?: any): JQuery;
    kendoDatePicker(arg1?: any): JQuery;
    kendoMultiSelect(arg1?: any): JQuery;
    kendoAutoComplete(arg1?: any): JQuery;
    kendoTabStrip(arg1?: any): JQuery;
}

module kendo {
    declare function template(template: string, options?: any): (data: any) => string;
}

//declare module kendo.data {
//    export class DataSource {
//        constructor(arg1?: any);
//    }
//}