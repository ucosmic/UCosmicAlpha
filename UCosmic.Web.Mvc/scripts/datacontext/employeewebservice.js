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
        EmployeeWebService.prototype.Get = function () {
            var deferred = $.Deferred();
            $.getJSON(this.GetBaseUrl() + "/" + this.GetId().toString(), function (data, textStatus, jqXHR) {
                deferred.resolve(data);
            });
            return deferred;
        };
        EmployeeWebService.prototype.Put = function (dataOut) {
            var deferred = $.Deferred();
            $.ajax({
                data: dataOut,
                type: "PUT",
                success: function (data, textStatus, jqXHR) {
                    deferred.resolve(data);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    deferred.reject(errorThrown);
                },
                url: this.GetBaseUrl() + "/" + this.GetId().toString()
            });
            return deferred;
        };
        EmployeeWebService.prototype.GetSalutations = function () {
            var deferred = $.Deferred();
            $.getJSON(this.GetBaseUrl() + "/" + this.GetId().toString() + "/salutations/", function (data, textStatus, jqXHR) {
                deferred.resolve(data);
            });
            return deferred;
        };
        EmployeeWebService.prototype.GetFacultyRanks = function () {
            var deferred = $.Deferred();
            $.getJSON(this.GetBaseUrl() + "/" + this.GetId().toString() + "/facultyranks/", function (data, textStatus, jqXHR) {
                deferred.resolve(data);
            });
            return deferred;
        };
        return EmployeeWebService;
    })(DataContext.IEmployee);
    DataContext.EmployeeWebService = EmployeeWebService;    
})(DataContext || (DataContext = {}));
