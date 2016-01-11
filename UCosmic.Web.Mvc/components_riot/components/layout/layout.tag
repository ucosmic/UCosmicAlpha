<layout>
    <style>
        header_toolbar{
            position: absolute;
            z-index: 10;
        }
    </style>
    <header></header>
    <header_toolbar></header_toolbar>
    <content></content>
    <toast></toast>
    <script>
        // This is essentially the equivalent of the Flux view-controller.
        // Could be broken down further into more sub-componenets, if you wished to re-use views.

        var self = this



        self.on('mount', function() {
            //RiotControl.trigger('item_list_init')
        })



    </script>
</layout>