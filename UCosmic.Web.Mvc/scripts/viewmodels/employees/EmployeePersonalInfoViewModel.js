var ViewModels;
(function (ViewModels) {
    (function (Employee) {
        var PersonalInfo = (function () {
            function PersonalInfo() {
                this.facultyRank = ko.observable();
                this.workingTitle = ko.observable();
                this.firstName = ko.observable();
                this.lastName = ko.observable();
                this.gender = ko.observable();
                this.primaryEmail = ko.observable();
                this.secondaryEmail = ko.observable();
                this.campus = ko.observable();
                this.college = ko.observable();
                this.department = ko.observable();
                this.administrativeAppointments = ko.observable();
                this.picture = ko.observable();
            }
            return PersonalInfo;
        })();
        Employee.PersonalInfo = PersonalInfo;        
    })(ViewModels.Employee || (ViewModels.Employee = {}));
    var Employee = ViewModels.Employee;
})(ViewModels || (ViewModels = {}));
//@ sourceMappingURL=EmployeePersonalInfoViewModel.js.map
