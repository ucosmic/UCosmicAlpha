function BaseViewModel() {
    var self = this;

    self.back = function() {
        history.back();
    };
}