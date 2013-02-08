var DataContext;
(function (DataContext) {
    var EmployeeFacultyRank = (function () {
        function EmployeeFacultyRank() { }
        return EmployeeFacultyRank;
    })();
    DataContext.EmployeeFacultyRank = EmployeeFacultyRank;    
    var People = (function () {
        function People(inId) {
            this._baseUrl = "/api/people";
            this.SetId(inId);
        }
        People.prototype.GetId = function () {
            return this._id;
        };
        People.prototype.SetId = function (inValue) {
            this._id = inValue;
        };
        People.prototype.GetBaseUrl = function () {
            return this._baseUrl;
        };
        People.prototype.Get = function () {
            return null;
        };
        People.prototype.Post = function (dataOut) {
            return null;
        };
        People.prototype.Put = function (dataOut) {
            return null;
        };
        People.prototype.Delete = function () {
            return null;
        };
        People.prototype.GetSalutations = function () {
            return null;
        };
        People.prototype.GetSuffixes = function () {
            return null;
        };
        People.prototype.GetFacultyRanks = function () {
            return null;
        };
        return People;
    })();
    DataContext.People = People;    
})(DataContext || (DataContext = {}));
