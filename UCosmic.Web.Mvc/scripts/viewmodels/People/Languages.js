var People;
(function (People) {
    //var modelData;// just for typescript because this is passed set up in the page itself.
    (function (ViewModels) {
        var LanguageViewModel = (function () {
            function LanguageViewModel(modelData) {
                google.load('visualization', '1', { 'packages': ['corechart'] });
                google.setOnLoadCallback(function () {
                    $(document).ready(function () {
                        $.each(modelData, function (item) {
                        });
                        var data = google.visualization.arrayToDataTable([
                            ['Categories', "Proficiency", { type: 'string', role: 'tooltip' }, { role: 'style' }],
                            ['Speaking', 1, "test1", '#319CBD'],
                            ['Listening', 5, "test2", '#94CE39'],
                            ['Reading', 3, "test3", '#73218C'],
                            ['Writing', 4, "test4", '#B5184A']
                        ]);

                        //no gradients yet - http://code.google.com/p/google-visualization-api-issues/issues/detail?id=550
                        //data.addRows([
                        //    ["none", 1],
                        //    ["some", 2],
                        //    ["more", 3],
                        //    ["even more", 4],
                        //    ["most", 5]
                        //]);
                        var options = {
                            //vAxis: { title: 'Categories', titleTextStyle: { color: 'red' } },
                            hAxis: {
                                ticks: [
                                    { v: 0, f: "none" }, { v: 1, f: "Elementary" }, { v: 2, f: "Limited" }, { v: 3, f: "General" },
                                    { v: 4, f: "Advanced" }, { v: 5, f: "Fluent" }]
                            }
                        };

                        var chart = new google.visualization.BarChart(document.getElementById('chart_div+' + modelData[1].Id));
                        chart.draw(data, options);
                    });
                });
            }
            return LanguageViewModel;
        })();
        ViewModels.LanguageViewModel = LanguageViewModel;
    })(People.ViewModels || (People.ViewModels = {}));
    var ViewModels = People.ViewModels;
})(People || (People = {}));
