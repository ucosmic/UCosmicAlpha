/// <reference path="../../typings/jquery/jquery.d.ts" />

// Module
module scrollBody {

    //scroll based on top position
   export function  scrollMyBody(position): void {
        var $body;
        //ie sucks!
        if (!$("body").scrollTop()) {
        $("html, body").scrollTop(position);
        } else {
            $("body").scrollTop(position);
        }
    }

//scroll based on side nav
    export function goToSection(location, data, event): void {
        var offset = $("#" + location).offset();
        //ie sucks!
        if (!$("body").scrollTop()) {
            $("html, body").scrollTop(offset.top - 20);
        } else {
            $("body").scrollTop(offset.top - 20);
        }
        $(event.target).closest("ul").find("li").removeClass("current");
        $(event.target).closest("li").addClass("current");
    }

}
