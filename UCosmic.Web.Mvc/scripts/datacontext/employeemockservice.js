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
        return EmployeeMockService;
    })(DataContext.IEmployee);
    DataContext.EmployeeMockService = EmployeeMockService;    
})(DataContext || (DataContext = {}));
