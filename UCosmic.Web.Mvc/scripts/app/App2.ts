/// <reference path="../jquery/jquery-1.8.d.ts" />

declare var app: any;

module App {

    export class WindowScroller {

        private static scrollTopTrackerId: string = '#scroll_top_tracker';

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

    // track the scroll top in a hidden field
    $(window).on('scroll', function() {
        var windowScrollTop = $(window).scrollTop();
        $(WindowScroller.scrollTopTrackerId).val(windowScrollTop);
    });

}
