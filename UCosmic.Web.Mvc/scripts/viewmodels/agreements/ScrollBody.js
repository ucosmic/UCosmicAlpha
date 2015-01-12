var ScrollBody;
(function (ScrollBody) {
    var Scroll = (function () {
        function Scroll(iScrollBody) {
            this.scrollMyBody = function (position) {
                var $body;
                if (!$("body").scrollTop()) {
                    $("html, body").scrollTop(position);
                }
                else {
                    $("body").scrollTop(position);
                }
            };
            this.section1 = ((iScrollBody.section1) ? iScrollBody.section1 : "");
            this.section2 = ((iScrollBody.section2) ? iScrollBody.section2 : "");
            this.section3 = ((iScrollBody.section3) ? iScrollBody.section3 : "");
            this.section4 = ((iScrollBody.section4) ? iScrollBody.section4 : "");
            this.section5 = ((iScrollBody.section5) ? iScrollBody.section5 : "");
            this.section6 = ((iScrollBody.section6) ? iScrollBody.section6 : "");
            this.section7 = ((iScrollBody.section7) ? iScrollBody.section7 : "");
            this.section8 = ((iScrollBody.section8) ? iScrollBody.section8 : "");
            this.section9 = ((iScrollBody.section9) ? iScrollBody.section9 : "");
            this.section10 = ((iScrollBody.section10) ? iScrollBody.section10 : "");
            this.mySection1 = $("#" + this.section1);
            this.mySection2 = $("#" + this.section2);
            this.mySection3 = $("#" + this.section3);
            this.mySection4 = $("#" + this.section4);
            this.mySection5 = $("#" + this.section5);
            this.mySection6 = $("#" + this.section6);
            this.mySection7 = $("#" + this.section7);
            this.mySection8 = $("#" + this.section8);
            this.mySection9 = $("#" + this.section9);
            this.mySection10 = $("#" + this.section10);
            this.navSection1 = $("#nav_" + this.section1);
            this.navSection2 = $("#nav_" + this.section2);
            this.navSection3 = $("#nav_" + this.section3);
            this.navSection4 = $("#nav_" + this.section4);
            this.navSection5 = $("#nav_" + this.section5);
            this.navSection6 = $("#nav_" + this.section6);
            this.navSection7 = $("#nav_" + this.section7);
            this.navSection8 = $("#nav_" + this.section8);
            this.navSection9 = $("#nav_" + this.section9);
            this.navSection10 = $("#nav_" + this.section10);
            this.kendoWindowBug = ((iScrollBody.kendoWindowBug) ? iScrollBody.kendoWindowBug : { val: 0 });
            this.$body;
            this.$bindTo = $(iScrollBody.bindTo);
        }
        Scroll.prototype.bindJquery = function () {
            var _this = this;
            var self = this;
            $(window).scroll(function () {
                if (_this.kendoWindowBug.val != 0) {
                    _this.scrollMyBody(_this.kendoWindowBug.val);
                }
                _this.section1Top = _this.mySection1.offset();
                _this.section2Top = _this.mySection2.offset();
                _this.section3Top = _this.mySection3.offset();
                _this.section4Top = _this.mySection4.offset();
                _this.section5Top = _this.mySection5.offset();
                _this.section6Top = _this.mySection6.offset();
                if (!$("body").scrollTop()) {
                    _this.$body = $("html, body").scrollTop() + 100;
                }
                else {
                    _this.$body = $("body").scrollTop() + 100;
                }
                var aside = _this.$bindTo.find("aside");
                if (_this.$body <= _this.section1Top.top + _this.mySection1.height() + 40) {
                    aside.find("li").removeClass("current");
                    _this.navSection1.addClass("current");
                }
                else if (_this.$body >= _this.section2Top.top && (_this.$body <= _this.section2Top.top + _this.mySection2.height() + 40 || _this.section3 === "")) {
                    aside.find("li").removeClass("current");
                    _this.navSection2.addClass("current");
                }
                else if (_this.$body >= _this.section3Top.top && (_this.$body <= _this.section3Top.top + _this.mySection3.height() + 40 || _this.section4 === "")) {
                    aside.find("li").removeClass("current");
                    _this.navSection3.addClass("current");
                }
                else if (_this.$body >= _this.section4Top.top && (_this.$body <= _this.section4Top.top + _this.mySection4.height() + 40 || _this.section5 === "")) {
                    aside.find("li").removeClass("current");
                    _this.navSection4.addClass("current");
                }
                else if (_this.$body >= _this.section5Top.top && (_this.$body <= _this.section5Top.top + _this.mySection5.height() + 40 || _this.section6 === "")) {
                    aside.find("li").removeClass("current");
                    _this.navSection5.addClass("current");
                }
                else if (_this.$body >= _this.section6Top.top && (_this.$body <= _this.section6Top.top + _this.mySection6.height() + 40 || _this.section7 === "")) {
                    aside.find("li").removeClass("current");
                    _this.navSection6.addClass("current");
                }
                else if (_this.$body >= _this.section7Top.top && (_this.$body <= _this.section7Top.top + _this.mySection7.height() + 40 || _this.section8 === "")) {
                    aside.find("li").removeClass("current");
                    _this.navSection7.addClass("current");
                }
                else if (_this.$body >= _this.section8Top.top && (_this.$body <= _this.section8Top.top + _this.mySection8.height() + 40 || _this.section9 === "")) {
                    aside.find("li").removeClass("current");
                    _this.navSection8.addClass("current");
                }
                else if (_this.$body >= _this.section9Top.top && (_this.$body <= _this.section9Top.top + _this.mySection8.height() + 40 || _this.section10 === "")) {
                    aside.find("li").removeClass("current");
                    _this.navSection9.addClass("current");
                }
                else if (_this.$body >= _this.section10Top.top) {
                    aside.find("li").removeClass("current");
                    _this.navSection10.closest("li").addClass("current");
                }
            });
            this.$bindTo.find(".side").find("a").click(function (event) {
                var $body = $("body");
                var location = $(this).parent().attr("id").substring(4);
                var offset = $("#" + location).offset();
                if (!$body.scrollTop()) {
                    $("html, body").scrollTop(offset.top - 20);
                }
                else {
                    $body.scrollTop(offset.top - 20);
                }
                $(event.target).closest("ul").find("li").removeClass("current");
                $(event.target).closest("li").addClass("current");
                event.preventDefault();
                event.stopPropagation();
            });
        };
        return Scroll;
    })();
    ScrollBody.Scroll = Scroll;
})(ScrollBody || (ScrollBody = {}));
