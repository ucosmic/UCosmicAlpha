/// <reference path="../../jquery/jquery-1.8.d.ts" />
/// <reference path="../../ko/knockout-2.2.d.ts" />
/// <reference path="../../ko/knockout.mapping-2.0.d.ts" />

// Module
module ViewModels.Employee
{
    export class PersonalInfo
    {
        facultyRank = ko.observable();
        workingTitle = ko.observable();
        firstName = ko.observable();
        lastName = ko.observable();
        gender = ko.observable();
        primaryEmail = ko.observable();
        secondaryEmail = ko.observable();
        campus = ko.observable();
        college = ko.observable();
        department = ko.observable();
        administrativeAppointments = ko.observable();
        picture = ko.observable();

        genderOptions: Array;
        

    }
}
