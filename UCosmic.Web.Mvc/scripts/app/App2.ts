/// <reference path="../jquery/jquery-1.8.d.ts" />

declare var app: any;

module App {

    export class WindowScroller {

        private static scrollTopTrackerId: string = '#scroll_top_tracker';

        static init(): void {
            // track the scroll top in a hidden field
            var trackTop = function () {
                var windowScrollTop = $(window).scrollTop();
                $(WindowScroller.scrollTopTrackerId).val(windowScrollTop);
            }
            $(window).off('scroll', trackTop);
            $(window).on('scroll', trackTop);
        }

        static get top() : number {
            return $(window).scrollTop();
        }

        static set top(value: number) {
            $(window).scrollTop(value);
        }

        static restoreTop(): void {
            $(window).scrollTop($(WindowScroller.scrollTopTrackerId).val());
        }
    }
    App.WindowScroller.init();

    class SidebarFixedScroller {
        static init(): void {
            $('[data-fixed-scroll=root]').each(function () {
                var $window = $(window),
                    $root = $(this),
                    $content = $root.find('[data-fixed-scroll=content]'),
                    $anchor = $root.find('[data-fixed-scroll=anchor]'),
                    contentWidth = $content.width(),
                    update = function () {
                        var windowScrollTop = $window.scrollTop(),
                            anchorOffsetTop = $anchor.offset().top;
                        if (windowScrollTop > anchorOffsetTop) {
                            $content.css({
                                position: 'fixed',
                                width: contentWidth
                            });
                            if ($content.height() > $window.height())
                                $content.css({
                                    top: '',
                                    bottom: '0px'
                                });
                            else
                                $content.css({
                                    top: '0px',
                                    bottom: ''
                                });
                        }
                        else if (windowScrollTop <= anchorOffsetTop) {
                            $content.css({
                                position: 'relative',
                                top: '',
                                bottom: ''
                            });
                        }
                    };
                $window.scroll(update).resize(update);
                update();
            });
        }
    }
    SidebarFixedScroller.init();
}

