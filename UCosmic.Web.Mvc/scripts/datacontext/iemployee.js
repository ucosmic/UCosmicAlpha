var DataContext;
(function (DataContext) {
    var EmployeeFacultyRank = (function () {
        function EmployeeFacultyRank() { }
        return EmployeeFacultyRank;
    })();
    DataContext.EmployeeFacultyRank = EmployeeFacultyRank;    
    ; ;
    var IEmployee = (function () {
        function IEmployee(inId) {
            this._baseUrl = "/api/person";
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
        IEmployee.prototype.Get = function (inObj, callback) {
        };
        IEmployee.prototype.Post = function (inObj, callback) {
        };
        IEmployee.prototype.Put = function (inObj, callback) {
        };
        IEmployee.prototype.Delete = function () {
        };
        IEmployee.prototype.GetSalutations = function (obj, callback) {
        };
        IEmployee.prototype.GetFacultyRanks = function (obj, callback) {
        };
        return IEmployee;
    })();
    DataContext.IEmployee = IEmployee;    
})(DataContext || (DataContext = {}));
