var App;
(function (App) {
    var defaults = {
        speed: '',
        frameWidth: 710,
        root: window.document
    };
    var currentFrameSelector = '[data-side-swiper=on]';
    var otherFrameSelector = '[data-side-swiper=off]';
    var SideSwiper2 = (function () {
        function SideSwiper2(options) {
            this.settings = $.extend(defaults, options);
            this.$root = $(this.settings.root);
            if(this.$root.attr('data-side-swiper') !== 'root') {
                this.$root = this.$root.find('[data-side-swiper=root]:first');
            }
        }
        SideSwiper2.prototype.next = function (distance, callback) {
            var $deck = this.$root.find('[data-side-swiper=deck]:first');
            var $currentFrame = $deck.children(currentFrameSelector);
            var $nextFrame = $currentFrame.next(otherFrameSelector);
            var negativeFrameWidth = (this.settings.frameWidth * -1);

            distance = distance || 1;
            for(var i = distance; i > 1; i--) {
                $nextFrame.hide();
                $nextFrame = $nextFrame.next(otherFrameSelector);
            }
            $nextFrame.css({
                left: 0
            });
            $nextFrame.show();
            $nextFrame.animate({
                left: negativeFrameWidth
            }, this.settings.speed, function () {
                $nextFrame.css({
                    left: 0
                });
            });
            $currentFrame.animate({
                left: negativeFrameWidth
            }, this.settings.speed, function () {
                $currentFrame.hide().css({
                    left: 0
                }).attr('data-side-swiper', 'off').data('side-swiper', 'off');
                $nextFrame.attr('data-side-swiper', 'on').data('side-swiper', 'on');
                if(callback) {
                    callback();
                }
            });
        };
        SideSwiper2.prototype.prev = function (distance, callback) {
            var $deck = this.$root.find('[data-side-swiper=deck]:first');
            var $currentFrame = $deck.children(currentFrameSelector);
            var $prevFrame = $currentFrame.prev(otherFrameSelector);
            var negativeFrameWidth = (this.settings.frameWidth * -1);

            distance = distance || 1;
            for(var i = distance; i > 1; i--) {
                $prevFrame.hide();
                $prevFrame = $prevFrame.prev(otherFrameSelector);
            }
            $currentFrame.css({
                position: 'absolute',
                left: 0
            });
            $currentFrame.animate({
                left: this.settings.frameWidth
            }, this.settings.speed, function () {
                $currentFrame.css({
                    position: 'relative'
                });
            });
            $prevFrame.css({
                left: negativeFrameWidth
            }).show().animate({
                left: 0
            }, this.settings.speed, function () {
                $currentFrame.hide().attr('data-side-swiper', 'off').data('side-swiper', 'off');
                $prevFrame.attr('data-side-swiper', 'on').data('side-swiper', 'on');
                if(callback) {
                    callback();
                }
            });
        };
        return SideSwiper2;
    })();
    App.SideSwiper2 = SideSwiper2;    
})(App || (App = {}));

