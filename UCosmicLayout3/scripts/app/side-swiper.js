function SideSwiper(options) {
    var self = this;
    options = options || {};
    var defaults = {
        speed: 'fast',
        frameWidth: 710
    };
    var settings = $.extend(defaults, options);

    var currentFrameSelector = '[data-side-swiper=root] > [data-side-swiper=deck] > [data-side-swiper=on]';
    var otherFrameSelector = '[data-side-swiper=off]';

    self.next = function (distance) {
        var $currentFrame = $(currentFrameSelector),
            $nextFrame = $currentFrame.next(otherFrameSelector);
        distance = distance || 1;
        for (var i = distance; i > 1; i--) {
            $nextFrame.hide();
            $nextFrame = $nextFrame.next(otherFrameSelector);
        }

        // display the next/right frame since its parent's overflow will obscure it
        $nextFrame.show();

        // reduce the left margin of the left frame to slide the right frame into view
        $currentFrame.animate({ marginLeft: (settings.frameWidth * -1) }, settings.speed, function () {

            // after the left frame has slid out of view, hide it
            $currentFrame.hide()

                // now that it's hidden, go ahead and put its margin back to zero
                .css({ marginLeft: 0 })

                // remove the css class since this is no longer the current frame
                .attr('data-side-swiper', 'off');

            // the left frame is now current
            $nextFrame.attr('data-side-swiper', 'on');
        });
    };

    self.prev = function (distance) {
        var $currentFrame = $(currentFrameSelector),
            $prevFrame = $currentFrame.prev(otherFrameSelector);
        distance = distance || 1;
        for (var i = distance; i > 1; i--) {
            $prevFrame.hide();
            $prevFrame = $prevFrame.prev(otherFrameSelector);
        }

        // reset the left frame to a negative left margin
        $prevFrame.css({ marginLeft: (settings.frameWidth * -1) })

            // show the left frame, since its parent's overflow will obscure it
            .show()

                // increase the left margin of the left frame to slide it into view (pushing right)
                .animate({ marginLeft: 0 }, settings.speed, function () {

                    // after the right frame  is slid out of view, hide it
                    $currentFrame.hide()

                        // remove the css class since this is no longer the current frame
                        .attr('data-side-swiper', 'off');

                    // the right frame is now current
                    $prevFrame.attr('data-side-swiper', 'on');
                });
    };
}
