/// <reference path="../../typings/jquery/jquery.d.ts" />

module ScrollBody {

    export class Scroll {

        constructor(section1?: string, section2?: string, section3?: string, section4?: string, section5?: string, section6?: string,
        section7?: string, section8?: string, section9?: string, section10?: string, kendoWindowBug?) {
            this.section1 = ((section1) ? section1 : "");
            this.section2 = ((section2) ? section2 : "");
            this.section3 = ((section3) ? section3 : "");
            this.section4 = ((section4) ? section4 : "");
            this.section5 = ((section5) ? section5 : "");
            this.section6 = ((section6) ? section6 : "");
            this.section7 = ((section7) ? section7 : "");
            this.section8 = ((section8) ? section8 : "");
            this.section9 = ((section9) ? section9 : "");
            this.section10 = ((section10) ? section10 : "");
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
            this.kendoWindowBug = ((kendoWindowBug) ? kendoWindowBug : { val: 0 });
            this.$body;
        }

        //imported vars
        section1;
        section2;
        section3;
        section4;
        section5;
        section6;
        section7;
        section8;
        section9;
        section10;
        kendoWindowBug;

        //scrollVars
        $body;
        mySection1;
        mySection2;
        mySection3;
        mySection4;
        mySection5;
        mySection6;
        mySection7;
        mySection8;
        mySection9;
        mySection10;
        navSection1;
        navSection2;
        navSection3;
        navSection4;
        navSection5;
        navSection6;
        navSection7;
        navSection8;
        navSection9;
        navSection10;
        section1Top;
        section2Top;
        section3Top;
        section4Top;
        section5Top;
        section6Top;
        section7Top;
        section8Top;
        section9Top;
        section10Top;

        //scroll based on top position
        scrollMyBody = function (position): void {
            var $body;

            if (!$("body").scrollTop()) {
                $("html, body").scrollTop(position);
            } else {
                $("body").scrollTop(position);
            }
        }

        //scroll based on side nav
        goToSection = function (location, data, event): void {
            var offset = $("#" + location).offset();
            if (!$("body").scrollTop()) {
                $("html, body").scrollTop(offset.top - 20);
            } else {
                $("body").scrollTop(offset.top - 20);
            }
            $(event.target).closest("ul").find("li").removeClass("current");
            $(event.target).closest("li").addClass("current");
        }

        bindJquery(): void {
            var self = this;

            //bind scroll to side nav
            $(window).scroll(() => {
                if (this.kendoWindowBug.val != 0) {
                    this.scrollMyBody(this.kendoWindowBug.val)
                }
                this.section1Top = this.mySection1.offset();
                this.section2Top = this.mySection2.offset();
                this.section3Top = this.mySection3.offset();
                this.section4Top = this.mySection4.offset();
                this.section5Top = this.mySection5.offset();
                this.section6Top = this.mySection6.offset();
                if (!$("body").scrollTop()) {
                    this.$body = $("html, body").scrollTop() + 100;
                } else {
                    this.$body = $("body").scrollTop() + 100;
                }
                if (this.$body <= this.section1Top.top + this.mySection1.height() + 40) {
                    $("aside").find("li").removeClass("current");
                    this.navSection1.addClass("current");
                } else if (this.$body >= this.section2Top.top && (this.$body <= this.section2Top.top + this.mySection2.height() + 40 || this.section3 === "")) {
                    $("aside").find("li").removeClass("current");
                    this.navSection2.addClass("current");
                } else if (this.$body >= this.section3Top.top && (this.$body <= this.section3Top.top + this.mySection3.height() + 40 || this.section4 === "")) {
                    $("aside").find("li").removeClass("current");
                    this.navSection3.addClass("current");
                } else if (this.$body >= this.section4Top.top && (this.$body <= this.section4Top.top + this.mySection4.height() + 40 || this.section5 === "")) {
                    $("aside").find("li").removeClass("current");
                    this.navSection4.addClass("current");
                } else if (this.$body >= this.section5Top.top && (this.$body <= this.section5Top.top + this.mySection5.height() + 40 || this.section6 === "")) {
                    $("aside").find("li").removeClass("current");
                    this.navSection5.addClass("current");
                } else if (this.$body >= this.section6Top.top && (this.$body <= this.section6Top.top + this.mySection6.height() + 40 || this.section7 === "")) {
                    $("aside").find("li").removeClass("current");
                    this.navSection6.addClass("current");
                } else if (this.$body >= this.section7Top.top && (this.$body <= this.section7Top.top + this.mySection7.height() + 40 || this.section8 === "")) {
                    $("aside").find("li").removeClass("current");
                    this.navSection7.addClass("current");
                } else if (this.$body >= this.section8Top.top && (this.$body <= this.section8Top.top + this.mySection8.height() + 40 || this.section9 === "")) {
                    $("aside").find("li").removeClass("current");
                    this.navSection8.addClass("current");
                } else if (this.$body >= this.section9Top.top && (this.$body <= this.section9Top.top + this.mySection8.height() + 40 || this.section10 === "")) {
                    $("aside").find("li").removeClass("current");
                    this.navSection9.addClass("current");
                } else if (this.$body >= this.section10Top.top) {
                    $("aside").find("li").removeClass("current");
                    this.navSection10.closest("li").addClass("current");
                }
            })
        }
    }


}
