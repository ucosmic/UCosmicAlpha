function WebApiRoutes(applicationPath) {
    var self = this;

    self.Countries = {
        Get: function() {
            var url = 'api/countries';
            return applicationPath + url;
        }
    };
}