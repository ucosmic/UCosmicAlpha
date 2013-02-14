var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var DataContext;
(function (DataContext) {
    var PeopleWebService = (function (_super) {
        __extends(PeopleWebService, _super);
        function PeopleWebService(inId) {
                _super.call(this, inId);
        }
        PeopleWebService.prototype.Get = function () {
            var deferred = $.Deferred();
            $.getJSON(this.GetBaseUrl() + "/" + this.GetId().toString(), function (data, textStatus, jqXHR) {
                deferred.resolve(data);
            });
            return deferred;
        };
        PeopleWebService.prototype.Put = function (dataOut) {
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
        PeopleWebService.prototype.GetSalutations = function () {
            var deferred = $.Deferred();
            $.getJSON(App.Routes.WebApi.People.Names.Salutations.get(), function (data, textStatus, jqXHR) {
                deferred.resolve(data);
            });
            return deferred;
        };
        PeopleWebService.prototype.GetSuffixes = function () {
            var deferred = $.Deferred();
            $.getJSON(App.Routes.WebApi.People.Names.Suffixes.get(), function (data, textStatus, jqXHR) {
                deferred.resolve(data);
            });
            return deferred;
        };
        PeopleWebService.prototype.GetFacultyRanks = function () {
            var deferred = $.Deferred();
            $.getJSON(this.GetBaseUrl() + "/" + this.GetId().toString() + "/facultyranks/", function (data, textStatus, jqXHR) {
                deferred.resolve(data);
            });
            return deferred;
        };
        return PeopleWebService;
    })(DataContext.People);
    DataContext.PeopleWebService = PeopleWebService;    
})(DataContext || (DataContext = {}));
