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
        export function message(xhr: any, reason: string = '', autoAlert: boolean = false): string {

            // do not report error if user clicked on link or browser control
            if (xhr)
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
                        contentWidth = contentWidth == 0 ? $content.width() : contentWidth;
                        if (windowScrollTop > anchorOffsetTop) {
                            $content.css({
                                position: 'fixed',
                                // this was commented out on 2013.08.16 by tim because it caused display
                                // issues with the agreement form sidbar. re-added by dan on 2013.10.12
                                // by updating contentWidth when it is initialized as zero.
                                width: contentWidth,
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

    //export function getQueryStringValueByName(name: string): string {
    //    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    //    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    //        results = regex.exec(location.search);
    //    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    //}

    export function deparam(params: any, coerce: boolean = false): any {
        // https://github.com/cowboy/jquery-bbq/blob/master/jquery.ba-bbq.js
        var obj: any = {}, coerce_types = { 'true': !0, 'false': !1, 'null': null };
        var decode = decodeURIComponent;

        // Iterate over all name=value pairs.
        $.each(params.replace(/\+/g, ' ').split('&'), function (j, v) {
            var param = v.split('='),
                key = decode(param[0]),
                val,
                cur = obj,
                i = 0,

                // If key is more complex than 'foo', like 'a[]' or 'a[b][c]', split it
                // into its component parts.
                keys = key.split(']['),
                keys_last = keys.length - 1;

            // If the first keys part contains [ and the last ends with ], then []
            // are correctly balanced.
            if (/\[/.test(keys[0]) && /\]$/.test(keys[keys_last])) {
                // Remove the trailing ] from the last keys part.
                keys[keys_last] = keys[keys_last].replace(/\]$/, '');

                // Split first keys part into two parts on the [ and add them back onto
                // the beginning of the keys array.
                keys = keys.shift().split('[').concat(keys);

                keys_last = keys.length - 1;
            } else {
                // Basic 'foo' style key.
                keys_last = 0;
            }

            // Are we dealing with a name=value pair, or just a name?
            if (param.length === 2) {
                val = decode(param[1]);

                // Coerce values.
                if (coerce) {
                    val = val && !isNaN(val) ? +val              // number
                    : val === 'undefined' ? undefined         // undefined
                    : coerce_types[val] !== undefined ? coerce_types[val] // true, false, null
                    : val;                                                // string
                }

                if (keys_last) {
                    // Complex key, build deep object structure based on a few rules:
                    // * The 'cur' pointer starts at the object top-level.
                    // * [] = array push (n is set to array length), [n] = array if n is 
                    //   numeric, otherwise object.
                    // * If at the last keys part, set the value.
                    // * For each keys part, if the current level is undefined create an
                    //   object or array based on the type of the next keys part.
                    // * Move the 'cur' pointer to the next level.
                    // * Rinse & repeat.
                    for (; i <= keys_last; i++) {
                        key = keys[i] === '' ? cur.length : keys[i];
                        cur = cur[key] = i < keys_last
                        ? cur[key] || (keys[i + 1] && isNaN(Number(keys[i + 1])) ? {} : [])
                        : val;
                    }

                } else {
                    // Simple key, even simpler rules, since only scalars and shallow
                    // arrays are allowed.

                    if ($.isArray(obj[key])) {
                        // val is already an array, so push on the next value.
                        obj[key].push(val);

                    } else if (obj[key] !== undefined) {
                        // val isn't an array, but since a second value has been specified,
                        // convert val into an array.
                        obj[key] = [obj[key], val];

                    } else {
                        // val is a scalar.
                        obj[key] = val;
                    }
                }

            } else if (key) {
                // No value was defined, so set something meaningful.
                obj[key] = coerce
                ? undefined
                : '';
            }
        });

        return obj;
    }
}

