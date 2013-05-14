/// <reference path="../../intellisense/references.js" />

//node ../../r.js -o app.build.js

//cd C:\websitesWorking\BuckeyeTekGit\BuckeyeTek\BuckeyeTek\Scripts\require

// Start the main app logic.
//check the path to see what initial scripts to load...

require(['app/viewmodels/agreements/requireagreement'],
        function () {
            //require(['compiled/site']);
            //the problem may be where I am not running upshot addin, before
            //upshot has run... check it out.
//                $(function () {
//                    upshot.metadata(@(Html.Metadata
//                        <DeliveryTracker.Controllers.DataServiceController>()));
//                    ko.applyBindings( new DeliveriesViewModel( ));
//                });

        });