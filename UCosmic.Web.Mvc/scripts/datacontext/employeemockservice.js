var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var DataContext;
(function (DataContext) {
    var EmployeeMockService = (function (_super) {
        __extends(EmployeeMockService, _super);
        function EmployeeMockService(inId) {
                _super.call(this, inId);
        }
        EmployeeMockService.prototype.GetFacultyRanks = function () {
            var facultyRanks = new Array();
            facultyRanks.push("Alpha");
            facultyRanks.push("Beta");
            facultyRanks.push("Gamma");
            facultyRanks.push("Delta");
            return facultyRanks;
        };
        return EmployeeMockService;
    })(DataContext.IEmployee);
    DataContext.EmployeeMockService = EmployeeMockService;    
})(DataContext || (DataContext = {}));
