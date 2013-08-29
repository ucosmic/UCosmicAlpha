/// <reference path="../../typings/jquery/jquery.d.ts" />
// Module
var scrollBody;
(function (scrollBody) {
    //scroll based on top position
    function scrollMyBody(position) {
        var $body;

        if (!$("body").scrollTop()) {
            $("html, body").scrollTop(position);
        } else {
            $("body").scrollTop(position);
        }
    }
    scrollBody.scrollMyBody = scrollMyBody;

    //scroll based on side nav
    function goToSection(location, data, event) {
        var offset = $("#" + location).offset();

        if (!$("body").scrollTop()) {
            $("html, body").scrollTop(offset.top - 20);
        } else {
            $("body").scrollTop(offset.top - 20);
        }
        $(event.target).closest("ul").find("li").removeClass("current");
        $(event.target).closest("li").addClass("current");
    }
    scrollBody.goToSection = goToSection;
})(scrollBody || (scrollBody = {}));
