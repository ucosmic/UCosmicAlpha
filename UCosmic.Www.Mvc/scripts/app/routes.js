function WebApiRoutes(applicationPath) {
    var self = this;

    self.Countries = {
        Get: function() {
            var url = 'api/countries';
            return applicationPath + url;
        }
    };

    self.Languages = {
        Get: function () {
            var url = 'api/languages';
            return applicationPath + url;
        }
    };
}