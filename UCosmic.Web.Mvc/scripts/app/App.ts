/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/jquery.plugins/jquery.autosize.d.ts" />
/// <reference path="../typings/jquery.plugins/jquery.placeholder.d.ts" />

interface String {
    format(...args: any[]): string;
}
if (!String.prototype.format) {
    String.prototype.format = function () {
        var formatted = this;
        for (var i = 0; i < arguments.length; i++) {
            var regexp = new RegExp('\\{' + i + '\\}', 'gi');
            formatted = formatted.replace(regexp, arguments[i]);
        }
        return formatted;
    };
}

module App {

    // react to unexpected situations
    export module Failures {
        export function message(xhr: JQueryXHR, reason: string = '', autoAlert: boolean = false): string {

            // do not report error if user clicked on link or browser control
            if (xhr.readyState === 0 || xhr.status === 0) return null;

            if (reason !== '') reason = ' ' + reason;
            var format = 'UCosmic experienced an unexpected error{0}. If this continues to happen, ' +
                'please use the Feedback & Support link on this page to report it.';
            var message = format.format(reason);
            if (autoAlert) alert(message);
            return message;
        }
    }

    export module Constants {
        export var int32Max: number = 2147483647;
    }

    // track & get/set window scroll position
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

        static getTop() : number {
            return $(window).scrollTop();
        }

        static setTop(value: number) {
            $(window).scrollTop(value);
        }

        static restoreTop(): void {
            $(window).scrollTop($(WindowScroller.scrollTopTrackerId).val());
        }
    }
    $(function () { App.WindowScroller.init(); });

    // fix sidebar elements when scrolling vertically
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
    $(function () { SidebarFixedScroller.init(); });

    // unobtrusive behaviors
    export module Obtruders {
        export function autosize(selector: any):void {
            if ($.fn.autosize)
                $(selector).find('textarea[data-autosize]').autosize();
        }
        export function placeholder(selector: any):void {
            if ($.fn.placeholder)
                $(selector).find('input[placeholder], textarea[placeholder]').placeholder();
        }
        export function moduleNav(selector: any):void {
            $(selector).find('[data-current-module]').each(function () {
                var current = $(this).data('current-module');
                $('nav.modules li.' + current).addClass('current');
            });
            $('nav.modules').removeClass('hide');
        }
        export function bibNav(selector: any):void {
            $(selector).find('[data-current-bib]').each(function () {
                var current = $(this).data('current-bib');
                $('nav.bib li.' + current).addClass('current');
            });
            $('nav.bib').removeClass('hide');
        }
    }

    // unobtrusive behavior applicator
    export class Obtruder {
        static obtrude(selector: any, obtruders?: any):void {
            var obtruder;
            obtruders = obtruders || App.Obtruders;
            for (obtruder in obtruders) { // execute every registered obtruder
                if (obtruders.hasOwnProperty(obtruder)) { // skip any inherited members

                    // apply an unobtrusive behavior
                    if (typeof obtruders[obtruder] === 'function') {
                        obtruders[obtruder].apply(this,
                            Array.prototype.slice.call(arguments, 0, 1) || document);
                    }

                    // apply all unobtrusive behaviors in set
                    if (typeof obtruders[obtruder] === 'object') {
                        App.Obtruder.obtrude(selector, obtruders[obtruder]);
                    }
                }
            }
        }
    }
    $(function () { App.Obtruder.obtrude(document); });
}

