ucosmic.scroll_snap_vertical = function (container, elements) {
    "use strict";
    container.scrollTop = 1;

    var last_scroll_position = 1;
    var is_mobile = false;
    var last_scroll_element_index = 0;//container.scrollTop ? 51 : container.scrollTop;
    var is_scrolling = false;
    var body = document.body,
        html = document.documentElement
        , scroll_direction = null;
    var touch_start_scroll_handler = function (event) {
        container.style.height = 'auto';
        is_mobile = true;
        last_scroll_position = event.targetTouches[0].clientY;
        //container.removeEventListener('onscroll', scrollHandler, false);
    }
    var touch_end_scroll_handler = function (event) {
        if(last_scroll_position - event.changedTouches[0].clientY > 30 || last_scroll_position - event.changedTouches[0].clientY < -30 ){
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

    var scroll_handler = function (event) {
        //last_scroll_position = event.changedTouches[0].clientY < last_scroll_position ? -1 : 100000;
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

    var body_height = Math.max(body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight);
    //function get_scroll_top() {
    //    if (typeof pageYOffset != 'undefined') {
    //        //most browsers except IE before #9
    //        return pageYOffset;
    //    }
    //    else {
    //        var B = document.body; //IE 'quirks'
    //        var D = document.documentElement; //IE with doctype
    //        D = (D.clientHeight) ? D : B;
    //        return D.scrollTop;
    //    }
    //}

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
            //document.documentElement.scrollTop = amount;
            //document.body.parentNode.scrollTop = amount;
            //document.body.scrollTop = amount;
            container.scrollTop = amount;
            //container.scrollY = amount;
            //alert(amount);
            //container.offsetTop = amount;
            //container.scrollTo(0,amount);
        }

        function position() {
            //return document.documentElement.scrollTop || document.body.parentNode.scrollTop || document.body.scrollTop;
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
        //alert("test")
        var scroll_top = container.scrollTop;// get_scroll_top();
        var scroll_to = 0;
        if (scroll_direction) {
            last_scroll_element_index = last_scroll_element_index == 0 ? elements.length - 1 : last_scroll_element_index - 1;

            scroll_to = elements[last_scroll_element_index].offsetTop - 1;
            //elements.forEach(function (element) {
            //    var difference = element.offsetTop > scroll_top ? element.offsetTop - scroll_top : scroll_top - element.offsetTop;
            //    if(element.offsetTop > scroll_top  && (scroll_to == 0 || element.offsetTop < scroll_to) && (last_scroll_element_offset != element.offsetTop)){
            //        scroll_to = element.offsetTop;
            //        //scroll_to = element.tagName == 'SECTION' ? element.offsetTop - 60 : element.offsetTop;
            //    }
            //});
        } else {
            last_scroll_element_index = last_scroll_element_index == elements.length - 1 ? 0 : last_scroll_element_index + 1;
            scroll_to = elements[last_scroll_element_index].offsetTop - 1;
            //elements.forEach(function (element) {
            //    var difference = element.offsetTop > scroll_top ? element.offsetTop - scroll_top : scroll_top - element.offsetTop;
            //    if(element.offsetTop < scroll_top && (scroll_to == 0 || element.offsetTop > scroll_to) && (last_scroll_element_offset != element.offsetTop)){
            //        scroll_to = element.offsetTop;
            //        //scroll_to = element.tagName == 'SECTION' ? element.offsetTop - 60 : element.offsetTop;
            //    }
            //});
        }
        var container_bottom = scroll_to + container.children[0].offsetHeight;
        var difference = body_height > container_bottom ? body_height - container_bottom : container_bottom - body_height;
        scroll_to = difference < 50 ? 1 : scroll_to;
        scroll_to = scroll_to < 100 ? scroll_top == 0 ? elements[elements.length - 1].offsetTop - 1 : 1 : scroll_to;
        last_scroll_position = scroll_to;
        //container.scrollTo(0,scroll_to);
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

    //container.addEventListener('scroll', function(event){
    //
    //    scrollHandler(event);
    //
    //} , false)
    //container.addEventListener('scroll', scrollHandler, false);
    //container.addEventListener('onscroll', scrollHandler, false);
    //container.onscroll = scrollHandler;
    //container.addEventListener('touchmove', scrollHandler, false)
    //container.addEventListener('touchmove', function(event){
    //    is_mobile = true;
    //    setTimeout(function(){
    //        event.preventDefault();
    //        //event.stopImmediatePropagation();
    //        //event.stopPropagation();
    //        //event.preventDefault();
    //        scrollHandler(event);
    //    },100);
    //    last_scroll_position = container.scrollTop;
    //    container.removeEventListener('onscroll', scrollHandler, false);
    //
    //} , true)


    setTimeout(function () {

        //container.scrollTop = 1;
        //container.scrollTo(0,1);


        container.addEventListener('touchstart', touch_start_scroll_handler, false)

        container.addEventListener('touchend', touch_end_scroll_handler, false)
        container.addEventListener('scroll', scroll_handler, false)

        //container.onscroll = function(event){
        //    //last_scroll_position = event.changedTouches[0].clientY < last_scroll_position ? -1 : 100000;
        //    if(!is_scrolling){
        //        is_scrolling = true;
        //        var current_scroll_direction = get_scroll_direction();
        //        if(scroll_direction != null && scroll_direction != current_scroll_direction){
        //            setTimeout(function(){
        //                scroll_direction = current_scroll_direction;
        //                scrollHandler(event, scroll_direction);
        //            }, 50)
        //        }else{
        //            scroll_direction = current_scroll_direction;
        //            scrollHandler(event, scroll_direction);
        //        }
        //    }else{
        //        //container.scrollTop = last_scroll_position;
        //    }
        //}
    }, 100);

    var remove_event_listeners = function(){
        container.removeEventListener('touchstart', touch_start_scroll_handler, false)

        container.removeEventListener('touchend', touch_end_scroll_handler, false)
        container.removeEventListener('scroll', scroll_handler, false)
    }

    return remove_event_listeners;
    // scroll header_big with touch
    // background in mobile
}

