/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />
var App;
(function (App) {
    var ImageSwapper = (function () {
        function ImageSwapper(noHoverSrc, hoverSrc) {
            var _this = this;
            this.hoverSrc = ko.observable('');
            this.noHoverSrc = ko.observable('');
            this._state = ko.observable('none');
            this.isNoHover = ko.computed(function () {
                return _this._state() == 'none';
            });
            this.isHover = ko.computed(function () {
                return _this._state() == 'hover';
            });
            this.src = ko.computed(function () {
                return _this.isHover() ? _this.hoverSrc() : _this.noHoverSrc();
            });
            this.noHoverSrc(noHoverSrc || '');
            this.hoverSrc(hoverSrc || '');
        }
        ImageSwapper.prototype.onMouseEnter = function (self, e) {
            this._state('hover');
        };

        ImageSwapper.prototype.onMouseLeave = function (self, e) {
            this._state('none');
        };
        return ImageSwapper;
    })();
    App.ImageSwapper = ImageSwapper;
})(App || (App = {}));
//# sourceMappingURL=ImageSwapper.js.map
