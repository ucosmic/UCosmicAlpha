/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />

// Module
module ViewModels.Employee {
  export class PersonalInfo {

    /* This is a work-in-progress. */
    firstName: KnockoutObservableString = ko.observable();
    lastName: KnockoutObservableString = ko.observable();
    gender: KnockoutObservableString = ko.observable();
    primaryEmail: KnockoutObservableString = ko.observable();
    secondaryEmail: KnockoutObservableString = ko.observable();
    facultyRankId = ko.observable();
    workingTitle = ko.observable();
    administrativeAppointments = ko.observable();
    picture: KnockoutObservableString = ko.observable();
    genderOptions: Array;
  }
}
