/// <reference path="../../typings/jquery/jquery.d.ts" />
/// <reference path="../../app/App.ts" />
/// <reference path="../../app/Routes.d.ts" />
/// <reference path="../employees/Models.d.ts" />
/// <reference path="Models.d.ts" />
/// <reference path="Routes.d.ts" />
var People;
(function (People) {
    (function (Servers) {
        function GetAffiliationsByPerson(personId, settings) {
            if (typeof personId === "undefined") { personId = 0; }
            var promise = $.Deferred();
            settings = settings || {};
            settings.url = Routes.Api.People.Affiliations.plural(personId);
            $.ajax(settings).done(function (response) {
                promise.resolve(response);
            }).fail(function (xhr) {
                promise.reject(xhr);
            });
            return promise;
        }
        Servers.GetAffiliationsByPerson = GetAffiliationsByPerson;

        function PutAffiliation(data, establishmentId, personId, settings) {
            if (typeof personId === "undefined") { personId = 0; }
            var promise = $.Deferred();
            settings = settings || {};
            settings.type = 'PUT';
            settings.url = Routes.Api.People.Affiliations.single(establishmentId, personId);
            settings.data = data;
            $.ajax(settings).done(function (response, status, xhr) {
                promise.resolve(xhr);
            }).fail(function (xhr) {
                promise.reject(xhr);
            });
            return promise;
        }
        Servers.PutAffiliation = PutAffiliation;

        function DeleteAffiliation(establishmentId, personId, settings) {
            if (typeof personId === "undefined") { personId = 0; }
            var promise = $.Deferred();
            settings = settings || {};
            settings.type = 'DELETE';
            settings.url = Routes.Api.People.Affiliations.single(establishmentId, personId);
            $.ajax(settings).done(function (response, status, xhr) {
                promise.resolve(xhr);
            }).fail(function (xhr) {
                promise.reject(xhr);
            });
            return promise;
        }
        Servers.DeleteAffiliation = DeleteAffiliation;
    })(People.Servers || (People.Servers = {}));
    var Servers = People.Servers;
})(People || (People = {}));
