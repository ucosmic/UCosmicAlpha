/// <reference path="../typings/jquery/jquery.d.ts" />
var App;
(function (App) {
    var defaults = {
        speed: '',
        frameWidth: 710,
        root: window.document
    };

    var currentFrameSelector = '[data-side-swiper=on]';
    var otherFrameSelector = '[data-side-swiper=off]';

    var SideSwiper = (function () {
        function SideSwiper(options) {
            this.settings = $.extend(defaults, options);
            this.$root = $(this.settings.root);
            if (this.$root.attr('data-side-swiper') !== 'root')
                this.$root = this.$root.find('[data-side-swiper=root]:first');
        }
        SideSwiper.prototype.next = function (distance, callback) {
            var $deck = this.$root.find('[data-side-swiper=deck]:first'), $currentFrame = $deck.children(currentFrameSelector), $nextFrame = $currentFrame.next(otherFrameSelector), negativeFrameWidth = (this.settings.frameWidth * -1);
            distance = distance || 1;
            for (var i = distance; i > 1; i--) {
                $nextFrame.hide();
                $nextFrame = $nextFrame.next(otherFrameSelector);
            }

            // display the next/right frame since its parent's overflow will obscure it
            $nextFrame.css({ left: 0 });
            $nextFrame.show();
            $nextFrame.animate({ left: negativeFrameWidth }, this.settings.speed, function () {
                $nextFrame.css({ left: 0 });
            });

            // the left frame is now on
            $nextFrame.attr('data-side-swiper', 'on').data('side-swiper', 'on');

            // reduce the left margin of the left frame to slide the right frame into view
            $currentFrame.animate({ left: negativeFrameWidth }, this.settings.speed, function () {
                // after the left frame has slid out of view, hide it
                $currentFrame.hide().css({ left: 0 }).attr('data-side-swiper', 'off').data('side-swiper', 'off');

                // invoke callback if one was passed
                if (callback)
                    callback();
            });
        };

        SideSwiper.prototype.prev = function (distance, callback) {
            var $deck = this.$root.find('[data-side-swiper=deck]:first'), $currentFrame = $deck.children(currentFrameSelector), $prevFrame = $currentFrame.prev(otherFrameSelector), negativeFrameWidth = (this.settings.frameWidth * -1);
            distance = distance || 1;
            for (var i = distance; i > 1; i--) {
                $prevFrame.hide();
                $prevFrame = $prevFrame.prev(otherFrameSelector);
            }

            $currentFrame.css({ position: 'absolute', left: 0 });
            $currentFrame.animate({ left: this.settings.frameWidth }, this.settings.speed, function () {
                $currentFrame.css({ position: 'relative' });
            });

            // reset the left frame to a negative left margin
            $prevFrame.css({ left: negativeFrameWidth }).attr('data-side-swiper', 'on').data('side-swiper', 'on').show().animate({ left: 0 }, this.settings.speed, function () {
                // after the right frame  is slid out of view, hide it
                $currentFrame.hide().attr('data-side-swiper', 'off').data('side-swiper', 'off');

                // invoke callback if one was passed
                if (callback)
                    callback();
            });
        };
        return SideSwiper;
    })();
    App.SideSwiper = SideSwiper;
})(App || (App = {}));
