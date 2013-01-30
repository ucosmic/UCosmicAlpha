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
            this.Id = inId;
        }
        Object.defineProperty(IEmployee.prototype, "Id", {
            get: function () {
                return this._id;
            },
            set: function (inValue) {
                this._id = inValue;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(IEmployee.prototype, "BaseUrl", {
            get: function () {
                return this._baseUrl;
            },
            enumerable: true,
            configurable: true
        });
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
