function WebApiRoutes(applicationPath) {
    var self = this;

    self.Countries = {
        GetCountries: function() {
            var url = 'api/countries';
            return applicationPath + url;
        }
    };
}