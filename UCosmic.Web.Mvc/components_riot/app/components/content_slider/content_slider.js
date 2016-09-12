riot.tag2('content_slider', '<div id="content_slider_main_container" class="layout horizontal center center-justified " show="{content_list && content_list.length > 0}" riot-style="max-width: {opts.max_width}; width: {opts.width}; height: {opts.height}; max-height: {opts.height};"> <div onclick="{left}" class="content_list_icon left" show="{content_list.length > 1}"> <svg viewbox="0 0 24 24" preserveaspectratio="none" style="pointer-events: none; display: inline-block; width: 3em; height: 8em; "> <g> <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"> </path> </g> </svg> </div> <div id="slider_content_container" class="flex"> <div id="slider_content_container_inner" class="layout horizontal"> <div each="{content, i in content_list}" class="slider_content " id="content{i}"> <echo_html class=" " content="{content}"></echo_html> </div> </div> </div> <div onclick="{right}" class="content_list_icon right" show="{content_list.length > 1}"> <svg viewbox="0 0 24 24" preserveaspectratio="none" style="pointer-events: none; display: inline-block; width: 3em; height: 8em; "> <g> <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"> </path> </g> </svg> </div> </div>', 'content_slider img,[riot-tag="content_slider"] img,[data-is="content_slider"] img{ margin: 0; } content_slider .content_list_icon,[riot-tag="content_slider"] .content_list_icon,[data-is="content_slider"] .content_list_icon{ cursor: pointer; position: relative; width: 3em; height: 8em; } content_slider #slider_content_container,[riot-tag="content_slider"] #slider_content_container,[data-is="content_slider"] #slider_content_container{ overflow: hidden; margin: 0; padding:0; } content_slider #slider_content_container_inner,[riot-tag="content_slider"] #slider_content_container_inner,[data-is="content_slider"] #slider_content_container_inner{ display: inline-flex; position: relative; margin: 0; padding:0; } content_slider .slider_content,[riot-tag="content_slider"] .slider_content,[data-is="content_slider"] .slider_content{ display: inline-block; margin: 0; } content_slider #content_div,[riot-tag="content_slider"] #content_div,[data-is="content_slider"] #content_div{ display: inline-block; width: 100%; max-width: 800px; } @media (max-width: 500px) { content_slider img,[riot-tag="content_slider"] img,[data-is="content_slider"] img{ width: 100%; } }', '', function(opts) {
"use strict";
var self = this;
self.content_index = 0;
var last_scroll_position = 1,
    is_scrolling = false;
self.on('mount', function () {});
self.start_left = 0;

var animate = function animate(time, start_time, element, start_left, is_right, width) {
    var start_left2 = start_left;
    var width2 = width;
    if (is_right) {
        snabbt(element, {
            position: [start_left - width, 0, 0],
            easing: 'easeOut',
            duration: 250
        });
    } else {
            snabbt(element, {
                position: [start_left + width, 0, 0],
                easing: 'easeOut',
                duration: 250
            });
        }
    setTimeout(function () {
        element.style.webkitTransform = element.style.transform;
        is_scrolling = false;
        self.update();
    }, 300);
};

self.left = function () {

    var prev_content_index = self.content_index;
    self.content_index != 0 ? self.content_index -= 1 : self.content_index = self.list_length - 1;
    self.start_left = -1 * (self.content_index + 1) * self.slider_content_container.clientWidth;
    animate(0, self.opts.time_out, self.slider_content_container_inner, self.start_left, false, self.slider_content_container.clientWidth);
};
self.right = function () {
    var prev_content_index = self.content_index;
    self.content_index != self.list_length - 1 ? self.content_index += 1 : self.content_index = 0;
    self.start_left = -1 * (self.content_index - 1) * self.slider_content_container.clientWidth;
    animate(0, self.opts.time_out, self.slider_content_container_inner, self.start_left, true, self.slider_content_container.clientWidth);
};
var touch_start_scroll_handler = function touch_start_scroll_handler(event) {
    last_scroll_position = event.targetTouches[0].clientX;
};
var touch_end_scroll_handler = function touch_end_scroll_handler(event) {
    if ((last_scroll_position - event.changedTouches[0].clientX > 30 || last_scroll_position - event.changedTouches[0].clientX < -30) && !is_scrolling) {
        last_scroll_position = event.changedTouches[0].clientX < last_scroll_position ? -1 : 100000;
        is_scrolling = true;
        if (event.changedTouches[0].clientX < last_scroll_position) {
            self.left();
        } else {
            self.right();
        }
    }
};
var add_event_listeners = function add_event_listeners() {
    setTimeout(function () {
        self.content_slider_main_container.addEventListener('touchstart', touch_start_scroll_handler, false);
        self.content_slider_main_container.addEventListener('touchend', touch_end_scroll_handler, false);
    }, 100);
};

var remove_event_listeners = function remove_event_listeners() {
    self.content_slider_main_container.removeEventListener('touchstart', touch_start_scroll_handler, false);
    self.content_slider_main_container.removeEventListener('touchend', touch_end_scroll_handler, false);
    self.content_slider_main_container.removeEventListener('touchstart', touch_start_scroll_handler, true);
    self.content_slider_main_container.removeEventListener('touchend', touch_end_scroll_handler, true);
};
self.update_me = function (list) {
    self.content_list = list;
    self.list_length = self.content_list ? self.content_list.length : 0;
    self.update();
    setTimeout(function () {
        list.forEach(function (item, index) {
            self['content' + index].style.minWidth = self.slider_content_container.clientWidth + 'px';
        });
        self.content_index = 0;
        self.start_left = 0;
        self.slider_content_container_inner.style.left = 0;
    }, 0);
};
self.on('mount', function () {
    add_event_listeners();
});
});