ucosmic.scroll_snap_vertical = function (container, elements) {
    "use strict";
    container.scrollTop = 1;

    RiotControl.on('page_changed', function (current_page, last_page) {
        //alert(current_page);
        if (current_page == 'home') {
            document.documentElement.style.height = '100%';
            document.documentElement.style.overflow = 'hidden';
            document.body.style.height = '100vh';
        } else {
            document.documentElement.style.height = '';
            document.documentElement.style.overflow = '';
            document.body.style.height = ''
        }
    })
    if (ucosmic.last_page == 'home') {
        document.documentElement.style.height = '100%';
        document.documentElement.style.overflow = 'hidden';
        document.body.style.height = '100vh';
    }

    var last_scroll_position = 1;
    var is_mobile = false;
    var last_scroll_element_index = 0;//container.scrollTop ? 51 : container.scrollTop;
    var is_scrolling = false;
    var disabled = false;
    var body = document.body,
        html = document.documentElement
        , scroll_direction = null;
    var touch_start_scroll_handler = function (event) {
        if(!disabled){
            container.style.height = 'auto';
            is_mobile = true;
            last_scroll_position = event.targetTouches[0].clientY;
        }
    }
    var touch_end_scroll_handler = function (event) {
        if(!disabled) {
            if (last_scroll_position - event.changedTouches[0].clientY > 30 || last_scroll_position - event.changedTouches[0].clientY < -30) {
                last_scroll_position = event.changedTouches[0].clientY < last_scroll_position ? -1 : 100000;
                if (!is_scrolling) {
                    is_scrolling = true;
                    var current_scroll_direction = get_scroll_direction();
                    if (scroll_direction != null && scroll_direction != current_scroll_direction) {
                        setTimeout(function () {
                            scroll_direction = current_scroll_direction;
                            scrollHandler(event, scroll_direction);
                        }, 50)
                    } else {
                        scroll_direction = current_scroll_direction;
                        scrollHandler(event, scroll_direction);
                    }
                } else {
                    container.scrollTop = last_scroll_position;
                }
            }
        }
    }

    var scroll_handler = function (event) {
        if(!disabled) {
            if (!is_scrolling) {
                is_scrolling = true;
                var current_scroll_direction = get_scroll_direction();
                if (scroll_direction != null && scroll_direction != current_scroll_direction) {
                    setTimeout(function () {
                        scroll_direction = current_scroll_direction;
                        scrollHandler(event, scroll_direction);
                    }, 50)
                } else {
                    scroll_direction = current_scroll_direction;
                    scrollHandler(event, scroll_direction);
                }
            } else {
                container.scrollTop = last_scroll_position;
            }
        }
    }

    var body_height = Math.max(body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight);

    function get_scroll_direction() {

        var new_scroll_position = container.scrollTop;

        if (new_scroll_position < last_scroll_position) {
            return true;
        } else {
            return false;
        }

    }

    // easing functions http://goo.gl/5HLl8
    Math.easeInOutQuad = function (t, b, c, d) {
        t /= d / 2;
        if (t < 1) {
            return c / 2 * t * t + b
        }
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    };

    Math.easeInCubic = function (t, b, c, d) {
        var tc = (t /= d) * t * t;
        return b + c * (tc);
    };

    Math.inOutQuintic = function (t, b, c, d) {
        var ts = (t /= d) * t,
            tc = ts * t;
        return b + c * (6 * tc * ts + -15 * ts * ts + 10 * tc);
    };

// requestAnimationFrame for Smart Animating http://goo.gl/sx5sts
    var requestAnimFrame = (function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    function scroll_me(to, container, callback, duration) {

        function move(amount) {
            container.style.overflow = 'hidden!important';
            container.scrollTop = amount;
            container.style.overflow = 'scroll';
            container.scrollY = amount;
            container.pageYOffset = amount;
        }

        function position() {
            return container.scrollTop || 0;
        }

        var start = position(),
            change = to - start,
            currentTime = 0,
            increment = 20;
        duration = (typeof(duration) === 'undefined') ? 500 : duration;
        var animateScroll = function() {
            // increment the time
            currentTime += increment;
            // find the value with the quadratic in-out easing function
            var val = Math.easeInOutQuad(currentTime, start, change, duration);
            // move the document.body
            move(val);
            // do the animation unless its over
            if (currentTime < duration) {
                requestAnimFrame(animateScroll);
            } else {
                if (callback && typeof(callback) === 'function') {
                    // the animation is done so lets callback
                    callback();
                }
            }
        };
        animateScroll();
    }

    var scrollHandler = function (event, scroll_direction) {
        var scroll_top = container.scrollTop;
        var scroll_to = 0;
        if (scroll_direction) {
            last_scroll_element_index = last_scroll_element_index == 0 ? elements.length - 1 : last_scroll_element_index - 1;

            scroll_to = elements[last_scroll_element_index].offsetTop - 1;
        } else {
            last_scroll_element_index = last_scroll_element_index == elements.length - 1 ? 0 : last_scroll_element_index + 1;
            scroll_to = elements[last_scroll_element_index].offsetTop - 1;
        }
        var container_bottom = scroll_to + container.children[0].offsetHeight;
        var difference = body_height > container_bottom ? body_height - container_bottom : container_bottom - body_height;
        scroll_to = difference < 50 ? 1 : scroll_to;
        scroll_to = scroll_to < 100 ? scroll_top == 0 ? elements[elements.length - 1].offsetTop - 1 : 1 : scroll_to;
        last_scroll_position = scroll_to;
        if(ucosmic.is_mobile){
            elements[last_scroll_element_index].scrollIntoView({block: "end", behavior: "smooth"});
            is_scrolling = false;
        }else{
            if (ucosmic.is_ie) {
                container.scrollTop = scroll_to;
                event.preventDefault();
                setTimeout(function () {
                    is_scrolling = false;
                }, 500)
            } else {
                scroll_me(scroll_to, container, function() {
                    setTimeout(function () {
                        is_scrolling = false;
                    }, 500)
                }, 200);
            }
        }

    }



    setTimeout(function () {

        container.addEventListener('touchstart', touch_start_scroll_handler, false)

        container.addEventListener('touchend', touch_end_scroll_handler, false)
        container.addEventListener('scroll', scroll_handler, false)

    }, 100);


    var remove_event_listeners = function(){
        disabled = true;
        container.style.height = '100vh';
        container.removeEventListener('touchstart', touch_start_scroll_handler, false)

        container.removeEventListener('touchend', touch_end_scroll_handler, false)
        container.removeEventListener('scroll', scroll_handler, false)
        container.removeEventListener('touchstart', touch_start_scroll_handler, true)

        container.removeEventListener('touchend', touch_end_scroll_handler, true)
        container.removeEventListener('scroll', scroll_handler, true)
    }

    return remove_event_listeners;
    // scroll header_big with touch
    // background in mobile
}

