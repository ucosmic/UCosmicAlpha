<content_scroller>
    <style scoped>
        img{
            margin: 0;
        }
        .content_list_icon{
            cursor: pointer;
            position: relative;
            width: 3em;
        }
        /*.content_list_icon.left{*/
            /*!*right: .8em;*!*/
            /*!*width:1.5em;*!*/
            /*overflow: visible;*/
        /*}*/
        .content_list_icon.right{
            width: 1em;
            position: relative;
            right: 1em;
        }
        #scroller_content_container{
            overflow: hidden;
            /*white-space: nowrap;*/
            margin: 0 10px;
            padding:0;
        }
        #scroller_content_container_inner{
            display: inline-flex;
            position: relative;
            margin: 0;
            padding:0;
            /*overflow: hidden;*/
        }
        .scroller_content{
            display: inline-block;
            margin: 0;
            /*padding:10px;*/
        }
        
        #content_div{
            display: inline-block;
            width: 100%;
            max-width: 800px;
        }

        .dot{
            background-color: white;
            border-radius: 10px;
            height:20px;
            width: 20px;
        }
        .dot.selected{
            height:16px;
            width: 16px;
            background-color: green;
            border: 2px solid white;
        }
        .dot:not(:last-child){
            margin-bottom: 10px;
        }

        @media (max-width: 500px) {
            img{
                width: 100%;
            }
        }
    </style>

    <div id="content_scroller_main_container" class="layout horizontal center center-justified " show="{content_list && content_list.length > 0}"
         riot-style="max-width: {opts.max_width}; width: {opts.width}; height: {opts.height}; max-height: {opts.height};">
        <!--<div onclick="{top}" class="content_list_icon left" show="{content_list.length > 1}">-->
            <!--<svg viewBox="0 0 24 24" preserveAspectRatio="none" style="pointer-events: none; display: inline-block; width: 3em; height: 8em; ">-->
                <!--<g>-->
                    <!--<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z">-->
                    <!--</path>-->
                <!--</g>-->
            <!--</svg>-->
        <!--</div>-->
        <div id="scroller_content_container" class="flex">
            <div id="scroller_content_container_inner" class="layout vertical">
                <div  each="{ content, i in content_list }" class="scroller_content layout horizontal center center-justified" id="content{i}">
                    <echo_html class=" " content="{content}"></echo_html>
                </div>
            </div>
        </div>
        <div  class="content_list_icon right layout vertical center center-justified" show="{content_list.length > 1}" >
            <div  each="{ content, i in content_list }" class="dot {i == content_index ? 'selected' : ''}" id="scroll_dot{i}" onclick="{dot_clicked}">
            </div>
        </div>
        <!--<div onclick="{bottom}" class="content_list_icon right" show="{content_list.length > 1}" >-->
            <!--<svg viewBox="0 0 24 24" preserveAspectRatio="none" style="pointer-events: none; display: inline-block; width: 3em; height: 8em; ">-->
                <!--<g>-->
                    <!--<path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z">-->
                    <!--</path>-->
                <!--</g>-->
            <!--</svg>-->
        <!--</div>-->
    </div>
    <script type="es6">
        "use strict";
    let self = this
    self.content_index = 0;
    let last_scroll_position = 1
            , is_scrolling = false;
    self.on('mount', function() {
    })
    self.start_top = 0;


        // snabbt(element, {
        //     position: [200, 0, 0],
        //     easing: function(value) {
        //         return value + 0.3 * Math.sin(2*Math.PI * value);
        //     }
        // }).snabbt({
        //     position: [0, 0, 0],
        //     easing: 'easeOut'
        // });
    //I need to get the page height or the widht I am going to use here, and pass it back into the function
    const animate = (time, start_time, element, start_top, is_bottom, height) => {
        if(is_bottom){
            snabbt(element, {
                position: [0, start_top - height, 0],
                easing: 'easeOut'
                , duration: 250
            })
            // const new_top = start_top + (-1 * (((time/start_time) < 1) ? (time/start_time) * height : height));
            // element.style.top = new_top  + 'px'
            // if((time/start_time) < 1){
            //     setTimeout(() => {
            //         animate(time+10, start_time, element, start_top, is_bottom, height);
            //     }, 2)
            // }
            // else{
            //     is_scrolling = false;
            // }
        }else{
            snabbt(element, {
                position: [0, start_top + height, 0],
                easing: 'easeOut'
                , duration: 250
            })
            // const new_top = start_top + (((time/start_time) < 1) ? (time/start_time) * height : height);
            // element.style.top = new_top  + 'px'
            // if((time/start_time) < 1){
            //     setTimeout(() => {
            //         animate(time+10, start_time, element, start_top, is_bottom, height);
            //     }, 2)
            // }
            // else{
            //     is_scrolling = false;
            // }
        }
        setTimeout(() => {
            element.style.webkitTransform = element.style.transform;
            self.update();
        }, 300)

    }


        self.dot_clicked = (event) => {
            if(self.content_index < event.item.i){
                self.content_index = event.item.i - 1;//(is_bottom ? 1 : 0);
                self.bottom();
            }else if(self.content_index > event.item.i){
                self.content_index = event.item.i + 1;//(is_bottom ? 1 : 0);
                self.top();
            }
        }

    self.top = () => {

        const prev_content_index = self.content_index;
        self.content_index != 0 ? self.content_index -= 1 : self.content_index = self.list_length - 1;
        self.start_top = -1 * (self.content_index+1) * self.scroller_content_container.clientHeight;
        animate(0, self.opts.time_out, self.scroller_content_container_inner, self.start_top, false, self.scroller_content_container.clientHeight)
    }
    self.bottom = () => {
        const prev_content_index = self.content_index;
        self.content_index != self.list_length - 1 ? self.content_index += 1 : self.content_index = 0;
        self.start_top = -1 * (self.content_index-1) * self.scroller_content_container.clientHeight;
        animate(0, self.opts.time_out, self.scroller_content_container_inner, self.start_top, true, self.scroller_content_container.clientHeight)
    }

        let is_scrolling_2 = false;

    var scroll_handler = function (event) {
        if(!is_scrolling_2){
            event.wheelDelta < 0 || event.detail > 0 ? self.bottom() : self.top();
            is_scrolling_2 = true;
            setTimeout(() => {is_scrolling_2 = false}, 250);
        }
        // console.log(wDelta);
    }
    // var touch_end_scroll_handler = function (event) {
    //     if ((last_scroll_position - event.changedTouches[0].clientX > 30 || last_scroll_position - event.changedTouches[0].clientX < -30) && !is_scrolling) {
    //         last_scroll_position = event.changedTouches[0].clientX < last_scroll_position ? -1 : 100000;
    //         is_scrolling = true;
    //         if (event.changedTouches[0].clientX < last_scroll_position) {
    //             self.top();
    //         } else {
    //             self.bottom();
    //         }
    //     }
    // }
    var add_event_listeners = function(){
        setTimeout(function () {
            // self.content_scroller_main_container.addEventListener('scroll', touch_start_scroll_handler, false)
            // self.content_scroller_main_container.addEventListener('touchend', touch_end_scroll_handler, false)

            self.content_scroller_main_container.addEventListener('DOMMouseScroll', scroll_handler, false)
            self.content_scroller_main_container.addEventListener('mousewheel', scroll_handler, false)
            // mousewheel
        }, 100);

    }

    var remove_event_listeners = function(){
        self.content_scroller_main_container.removeEventListener('mousewheel', scroll_handler, false)
        self.content_scroller_main_container.removeEventListener('mousewheel', scroll_handler, true)
        self.content_scroller_main_container.removeEventListener('DOMMouseScroll', scroll_handler, false)
        self.content_scroller_main_container.removeEventListener('DOMMouseScroll', scroll_handler, true)
    }
    self.update_me = (list) => {
        self.content_list = list;
        self.list_length = self.content_list ? self.content_list.length : 0;
        self.update()
        setTimeout(() => {
            list.forEach((item, index) => {
                self['content'+index].style.minHeight = self.scroller_content_container.clientHeight + 'px';
                // self['content'+index].style.maxheight = self.opts.max_height;
            })
            self.content_index = 0
            self.start_top = 0;
            self.scroller_content_container_inner.style.top = 0;
        }, 0)
    }
    self.on('mount', () => {
        add_event_listeners();
    })
    </script>
</content_scroller>