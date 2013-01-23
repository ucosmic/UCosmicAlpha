var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var DataContext;
(function (DataContext) {
    var EmployeeWebService = (function (_super) {
        __extends(EmployeeWebService, _super);
        function EmployeeWebService(inId) {
                _super.call(this, inId);
        }
        EmployeeWebService.prototype.Get = function (inObj, callback) {
            $.getJSON(this.BaseUrl + "/" + this.Id.toString(), function (data) {
                callback(inObj, data);
            });
        };
        EmployeeWebService.prototype.Post = function (inObj, callback) {
        };
        EmployeeWebService.prototype.Put = function (inObj, callback) {
            $.ajax({
                data: callback(inObj),
                type: "PUT",
                url: this.BaseUrl + "/" + this.Id.toString()
            });
        };
        EmployeeWebService.prototype.Delete = function () {
        };
        EmployeeWebService.prototype.GetSalutations = function (inObj, callback) {
            $.getJSON(this.BaseUrl + "/" + this.Id.toString() + "/salutations/", function (data) {
                callback(inObj, data);
            });
        };
        EmployeeWebService.prototype.GetFacultyRanks = function (inObj, callback) {
            $.getJSON(this.BaseUrl + "/" + this.Id.toString() + "/facultyranks/", function (data) {
                callback(inObj, data);
            });
        };
        return EmployeeWebService;
    })(DataContext.IEmployee);
    DataContext.EmployeeWebService = EmployeeWebService;    
})(DataContext || (DataContext = {}));
