var DataContext;
(function (DataContext) {
    var EmployeeFacultyRank = (function () {
        function EmployeeFacultyRank() { }
        return EmployeeFacultyRank;
    })();
    DataContext.EmployeeFacultyRank = EmployeeFacultyRank;    
    var IEmployee = (function () {
        function IEmployee(inId) {
            this._baseUrl = "/api/people";
            this.SetId(inId);
        }
        IEmployee.prototype.GetId = function () {
            return this._id;
        };
        IEmployee.prototype.SetId = function (inValue) {
            this._id = inValue;
        };
        IEmployee.prototype.GetBaseUrl = function () {
            return this._baseUrl;
        };
        IEmployee.prototype.Get = function () {
            return null;
        };
        IEmployee.prototype.Post = function (dataOut) {
            return null;
        };
        IEmployee.prototype.Put = function (dataOut) {
            return null;
        };
        IEmployee.prototype.Delete = function () {
            return null;
        };
        IEmployee.prototype.GetSalutations = function () {
            return null;
        };
        IEmployee.prototype.GetFacultyRanks = function () {
            return null;
        };
        return IEmployee;
    })();
    DataContext.IEmployee = IEmployee;    
})(DataContext || (DataContext = {}));
