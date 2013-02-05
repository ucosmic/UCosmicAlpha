/*
    Notes on Knockout compatible combox.

    The hard part to making a combobox definable as:

        <select id="salutationCombobox" data-bind="options: _salutations, value: _salutation"></select>

    and then:

        <script>
            $("#salutationCombobox").combobox()
        </script>

    is embedding the <input> inside the <select> and then being able to ko data-bind to both the
    <select> and <input>.  The second level problem is keeping the two elements in sync and also
    creating them with an initial value.

    This turned out to be more than I wanted to get into right now.  So, below is the code I started
    with. Its NOT ko compatible, but it does combine <select> + <input> + <a> with autocomplete.

    It came from:

        http://jqueryui.com/autocomplete/#combobox

    BTW, the  Anders Malmgren implementation on Git did not work in IE9 in jsfiddler.  Worked in FF.
    I didn't go any further, but maybe figuring out why is easier then building another implementation.
    Or, maybe we just buy the Telerik control?
*/


//.ui-combobox {
//    position: relative;
//    display: inline-block;
//}

//.ui-combobox-toggle {
//    position: absolute;
//    top: 0;
//    bottom: 0;
//    margin-left: -1px;
//    padding: 0; /* support: IE7 */
//    *height: 1.7em;
//    *top: 0.1em;
//}

//.ui-combobox-input {
//    margin: 0;
//    padding: 0.3em;
//}


//(function ($) {
//    $.widget("ui.combobox", {
//        _create: function () {
//            var input,
//                that = this,
//                wasOpen = false,
//                select = this.element.hide(),
//                selected = select.children(":selected"),
//                value = selected.val() ? selected.text() : "",
//                wrapper = this.wrapper = $("<span>").addClass("ui-combobox").insertAfter(select);

//            input = $("<input>")
//                .appendTo(wrapper)
//                .val(value)
//                .attr("title", "")
//                .addClass("ui-state-default ui-combobox-input")
//                .autocomplete({
//                    delay: 0,
//                    minLength: 0,
//                    source: function (request, response) {
//                        var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
//                        response(select.children("option").map(function () {
//                            var text = $(this).text();
//                            if (this.value && (!request.term || matcher.test(text))) return {
//                                label: text.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + $.ui.autocomplete.escapeRegex(request.term) + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>"),
//                                value: text,
//                                option: this
//                            };
//                        }));
//                    },
//                    select: function (event, ui) {
//                        ui.item.option.selected = true;
//                        that._trigger("selected", event, { item: ui.item.option });
//                    },
//                    change: function (event, ui) {
//                        if (!ui.item) { }
//                    }

//                })
//                .addClass("ui-widget ui-widget-content ui-corner-left");

//            input.data("ui-autocomplete")
//                ._renderItem = function (ul, item) {
//                    return $("<li>").append("<a>" + item.label + "</a>").appendTo(ul);
//                };

//            $("<a>").attr("tabIndex", -1)
//                .tooltip().appendTo(wrapper)
//                .button({ icons: { primary: "ui-icon-triangle-1-s" }, text: false })
//                .removeClass("ui-corner-all")
//                .addClass("ui-corner-right ui-combobox-toggle")
//                .mousedown(function () {
//                    wasOpen = input.autocomplete("widget").is(":visible");
//                })
//                .click(function () {
//                    input.focus();  // close if already visible
//                    if (wasOpen) { return; }    // pass empty string as value to search for, displaying all results
//                    input.autocomplete("search", "");
//                });

//            input.tooltip({ tooltipClass: "ui-state-highlight" });
//        },
//        _destroy: function () { this.wrapper.remove(); this.element.show(); }

//    });
//})(jQuery);


function updateTextbox(inSelector, inTextboxId)
{
    $("#" + inTextboxId)[0].value = inSelector.options[inSelector.selectedIndex].innerHTML;
    $("#" + inTextboxId).trigger("change");
    inSelector.selectedIndex = 0;
    inSelector.blur();
}