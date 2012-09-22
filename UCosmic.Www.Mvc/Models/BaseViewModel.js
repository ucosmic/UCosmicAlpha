function BaseViewModel() {
    var self = this;

    self.isBound = ko.observable();

    self.back = function() {
        history.back();
    };
}