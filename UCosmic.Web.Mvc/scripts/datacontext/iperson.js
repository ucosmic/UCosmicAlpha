var DataContext;
(function (DataContext) {
    var IPerson = (function () {
        function IPerson(inId) {
            this.Id = inId;
        }
        Object.defineProperty(IPerson.prototype, "Id", {
            get: function () {
                return this._id;
            },
            set: function (inValue) {
                this.Id = inValue;
            },
            enumerable: true,
            configurable: true
        });
        IPerson.prototype.GetFacultyRanks = function () {
            return null;
        };
        IPerson.prototype.Save = function () {
        };
        return IPerson;
    })();
    DataContext.IPerson = IPerson;    
})(DataContext || (DataContext = {}));
