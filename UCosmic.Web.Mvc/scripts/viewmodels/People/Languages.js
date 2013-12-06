var People;
(function (People) {
    //var modelData;// just for typescript because this is passed set up in the page itself.
    (function (ViewModels) {
        var LanguageViewModel = (function () {
            function LanguageViewModel(modelData) {
                google.load('visualization', '1', { 'packages': ['corechart'] });
                google.setOnLoadCallback(function () {
                    $(document).ready(function () {
                        var data = google.visualization.arrayToDataTable([
                            ['Year', 'Sales', 'Expenses'],
                            ['2004', 1000, 400],
                            ['2005', 1170, 460],
                            ['2006', 660, 1120],
                            ['2007', 1030, 540]
                        ]);

                        var options = {
                            title: 'Company Performance',
                            vAxis: { title: 'Year', titleTextStyle: { color: 'red' } }
                        };

                        var chart = new google.visualization.BarChart(document.getElementById('chart_div'));
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
//# sourceMappingURL=Languages.js.map
