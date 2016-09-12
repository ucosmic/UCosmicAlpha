<header>
    <style>
        /*#header_background{*/
            /*position: absolute;*/
            /*top: 0;*/
            /*width: 100%;*/
            /*height: 200px;*/
            /*z-index: -1;*/
            /*overflow-x: hidden;*/
        /*}*/
        /*#header_background_image{*/
            /*background-image: url("/resources/images/main/menu_ordering_banner_2.png");*/
            /*background-repeat: repeat-x;*/
            /*background-color: #909090;*/
            /*width: 100%;*/
            /*height: 100%;*/
            /*position: absolute;*/
            /*top: 0;*/
            /*left: 0;*/
        /*}*/
        /*#header_logo_image_1{*/
            /*top:0px;*/
            /*position: absolute;*/
            /*left: 0px;*/
            /*height:100%;*/
            /*z-index: 2;*/
        /*}*/
        /*#header_logo_image_1_background{*/
            /*top:0px;*/
            /*position: absolute;*/
            /*left: 0px;*/
            /*height:100%;*/
            /*z-index: 1;*/
            /*width: 40%;*/
            /*background: linear-gradient(to right, #909090 60%, transparent);*/
        /*}*/
        /*@media (max-width: 1000px) {*/
            /*#header_logo_image_1_background{*/
                /*width: 50%;*/
            /*}*/
        /*}*/
        /*@media (max-width: 700px) {*/
            /*#header_background{*/
                /*height: 150px;*/
            /*}*/
            /*#header_logo_image_1_background{*/
                /*width: 60%;*/
            /*}*/
        /*}*/
        /*@media (max-width: 450px) {*/
            /*#header_logo_image_1_background{*/
                /*width: 70%;*/
            /*}*/
        /*}*/



        #header_toolbar a {
            text-decoration: none;
        }

        #header_toolbar_logo_container{
            margin-left: 50px;
        }
        /*#header_toolbar_logo_text_container{*/
        /*}*/

        #logo_image_1, #logo_text{

            opacity: 1;
        }
        #logo_text{
            font-size: 36px;
            margin: 0 0 0 10px;
            text-shadow: 0 0 1px rgba(255, 0, 0, 0.8);
            background-color: rgba(144,144,144, .9);
            border-radius: 10px;
            line-height: 1;
            padding: 4px;
            text-decoration: none;
            color: black;
            box-shadow: 1px 1px 5px black;
        }
        #logo_text span{
            color: red;
            text-shadow: 0 0 2px rgba(0, 0, 0, 0.8);
            font-family: cursive;
        }
        #header_toolbar_background_inner{

            background-image: url("/resources/images/main/menu_ordering_banner_2.png");
            background-repeat: repeat;
            width: 100%;
            height: 20000px;
            background-attachment: local;
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            /*right: -15px; !* Decrease this value for cross-browser compatibility *!*/
            overflow: auto;
        }
        #header_toolbar_background{
            background-color: rgba(102,102,102, 1);
            box-shadow: 0px 1px 5px black;
            width: 100%;
            height: 60px;
            overflow-y: hidden;
            opacity: 1;
            top: 0;
            position: fixed;
            z-index: 2;
        }

        @media (max-width: 700px), (max-height: 700px) {
            #header_toolbar_background {
                height: 40px;
            }
            #logo_image_1{
                height:35px;
                /*left: 55px;*/
                /*bottom: 0px;*/
            }
            #logo_text {
                font-size: 24px;
                height: 26px;
                /*bottom: 0;*/
                /*margin-left: 0;*/
            }

            #header_toolbar_logo_container{
                margin-left: 25px;
            }
        }


        @media (max-width: 500px) {
            /*#logo_image_1, #logo_text{*/
                /*!*left: 25px;*!*/
            /*}*/
            #header_toolbar_logo_container{
                margin-left: 10px;
            }
        }
        @media (max-width: 360px) {
            #logo_text {
                font-size: 18px;
                height: 20px;
                /*bottom: 0;*/
            }
        }
        @media (max-width: 326px) {
            .hide_smaller {
                display: none!important;
            }
        }
        @media (max-width: 290px) {
            #logo_text {
                margin:0;
            }
        }
    </style>
    <div id="header_toolbar_background">
        <div style="height: 100%; width: 100%; z-index: 1; position: relative;" class="layout horizontal start-justified end">
            <div id="header_toolbar_logo_container" class="layout vertical end hide_smaller">
                <img id="logo_image_1" src="/resources/images/main/icon-57x57.png">
                <!--<div id="logo_text">X-Menu</div>-->
            </div>
            <div id="header_toolbar_logo_text_container" class="layout horizontal center-justified center" style="height: 100%;">
                <a href="/#home" id="logo_text" class=""><span>X</span>-Menu</a>
            </div>
        </div>
        <div id="header_toolbar_background_inner"></div>
    </div>
    <!--<div id="header_background" class="layout flex">-->
        <!--<img id="header_logo_image_1" src="/resources/images/main/menu_ordering_banner_original_transparent.png">-->
        <!--<div id="header_logo_image_1_background"></div>-->
        <!--<div id="header_background_image"></div>-->
    <!--</div>-->
    <script type="es6">
        "use strict";
        var self = this;
        //function getScrollTop(){
        //    if(typeof pageYOffset!= 'undefined'){
        //        //most browsers except IE before #9
        //        return pageYOffset;
        //    }
        //    else{
        //        var B= document.body; //IE 'quirks'
        //        var D= document.documentElement; //IE with doctype
        //        D= (D.clientHeight)? D: B;
        //        return D.scrollTop;
        //    }
        //}
        //var scrollHandler2 = function(event) {
        //    var scroll_top = document.body.scrollTop;// getScrollTop();
        //    //header_toolbar_backgronud_inner = document.querySelector('#header_toolbar_backgronud_inner');
        //    self.header_toolbar_background_inner.style.top =(scroll_top * -1) + 'px';
        //}

        document.body.addEventListener('scroll', function(event) {
            var scroll_top = document.body.scrollTop;// getScrollTop();
            //header_toolbar_backgronud_inner = document.querySelector('#header_toolbar_backgronud_inner');
            self.header_toolbar_background_inner.style.top =(scroll_top * -1) + 'px';
        }, false);

        //document.body.addEventListener('touchmove', function (event) {
        //    var scroll_top = document.body.scrollTop;// getScrollTop();
        //    //header_toolbar_backgronud_inner = document.querySelector('#header_toolbar_backgronud_inner');
        //    self.header_toolbar_background_inner.style.top =(scroll_top * -1) + 'px';
        //}, false)

        document.body.addEventListener('touchend', function (event) {
            setTimeout(function(){
                "use strict";
                var scroll_top = document.body.scrollTop;// getScrollTop();
                //header_toolbar_backgronud_inner = document.querySelector('#header_toolbar_backgronud_inner');
                self.header_toolbar_background_inner.style.top =(scroll_top * -1) + 'px';
            }, 1)
        }, false)
        //window.onscroll = scrollHandler;
    </script>
</header>