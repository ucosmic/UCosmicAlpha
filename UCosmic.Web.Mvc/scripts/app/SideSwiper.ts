module App {

    export interface SideSwiperOptions {
        speed: any;
        frameWidth: any;
        root: any;
    }

    var defaults: SideSwiperOptions = {
        speed: '',
        frameWidth: 710,
        root: window.document,
    };

    var currentFrameSelector = '[data-side-swiper=on]';
    var otherFrameSelector = '[data-side-swiper=off]';

    export class SideSwiper {

        private settings: SideSwiperOptions;
        private $root: JQuery;

        constructor (options?: SideSwiperOptions) {
            this.settings = <SideSwiperOptions>$.extend(defaults, options);
            this.$root = $(this.settings.root);
            if (this.$root.attr('data-side-swiper') !== 'root')
                this.$root = this.$root.find('[data-side-swiper=root]:first');
        }

        next(distance?: number, callback?: () => void): void {
            var $deck = this.$root.find('[data-side-swiper=deck]:first'),
                $currentFrame = $deck.children(currentFrameSelector),
                $nextFrame = $currentFrame.next(otherFrameSelector),
                negativeFrameWidth = (this.settings.frameWidth * -1);
            distance = distance || 1;
            for (var i = distance; i > 1; i--) {
                $nextFrame.hide();
                $nextFrame = $nextFrame.next(otherFrameSelector);
            }

            // display the next/right frame since its parent's overflow will obscure it
            $nextFrame.css({ left: 0 });
            $nextFrame.show();
            $nextFrame.animate({ left: negativeFrameWidth }, this.settings.speed, () => {
                $nextFrame.css({ left: 0 });
            });

            // the left frame is now on
            $nextFrame.attr('data-side-swiper', 'on')
                .data('side-swiper', 'on');

            // reduce the left margin of the left frame to slide the right frame into view
            $currentFrame.animate({ left: negativeFrameWidth }, this.settings.speed, () => {

                // after the left frame has slid out of view, hide it
                $currentFrame.hide()

                    // now that it's hidden, go ahead and put its margin back to zero
                    .css({ left: 0 })

                    // remove the css class since this is no longer the current frame
                    .attr('data-side-swiper', 'off')
                    .data('side-swiper', 'off');

                // invoke callback if one was passed
                if (callback) callback();
            });
        }

        prev(distance?: number, callback?: () => void) {
            var $deck = this.$root.find('[data-side-swiper=deck]:first'),
                $currentFrame = $deck.children(currentFrameSelector),
                $prevFrame = $currentFrame.prev(otherFrameSelector),
                negativeFrameWidth = (this.settings.frameWidth * -1);
            distance = distance || 1;
            for (var i = distance; i > 1; i--) {
                $prevFrame.hide();
                $prevFrame = $prevFrame.prev(otherFrameSelector);
            }

            $currentFrame.css({ position: 'absolute', left: 0 });
            $currentFrame.animate({ left: this.settings.frameWidth }, this.settings.speed, () => {
                $currentFrame.css({ position: 'relative' });
            });

            // reset the left frame to a negative left margin
            $prevFrame.css({ left: negativeFrameWidth })

            // the right frame is now on
            .attr('data-side-swiper', 'on').data('side-swiper', 'on')

            // show the left frame, since its parent's overflow will obscure it
            .show()

            // increase the left margin of the left frame to slide it into view (pushing right)
            .animate({ left: 0 }, this.settings.speed, () => {

                // after the right frame  is slid out of view, hide it
                $currentFrame.hide()

                    // remove the css class since this is no longer the current frame
                    .attr('data-side-swiper', 'off')
                    .data('side-swiper', 'off');

                // invoke callback if one was passed
                if (callback) callback();
            });
        }
    }
}