var People;
(function (People) {
    var Servers;
    (function (Servers) {
        function GetAffiliationsByPerson(personId, settings) {
            if (personId === void 0) { personId = 0; }
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
            if (personId === void 0) { personId = 0; }
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
            if (personId === void 0) { personId = 0; }
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
    })(Servers = People.Servers || (People.Servers = {}));
})(People || (People = {}));
