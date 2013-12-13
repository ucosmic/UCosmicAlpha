var People;
(function (People) {
    (function (ViewModels) {
        var LanguageViewModel = (function () {
            function LanguageViewModel(modelData) {
                this.setupGoogleChart(modelData);
            }
            LanguageViewModel.loadGoogleVisualization = function () {
                google.load('visualization', '1', { 'packages': ['corechart'] });

                google.setOnLoadCallback(function () {
                    LanguageViewModel._googleVisualizationLoadedPromise.resolve();
                });
                return LanguageViewModel._googleVisualizationLoadedPromise;
            };

            LanguageViewModel.prototype.setupGoogleChart = function (modelData) {
                var _this = this;
                $.each(modelData, function (index, value) {
                    modelData[index].Speaking.Meaning = _this.addTooltipStyle(modelData[index].Speaking.Meaning);
                    modelData[index].Listening.Meaning = _this.addTooltipStyle(modelData[index].Listening.Meaning);
                    modelData[index].Reading.Meaning = _this.addTooltipStyle(modelData[index].Reading.Meaning);
                    modelData[index].Writing.Meaning = _this.addTooltipStyle(modelData[index].Writing.Meaning);
                    var data = google.visualization.arrayToDataTable([
                        ['Categories', "Proficiency", { type: 'string', position: 'center', role: 'tooltip', 'p': { 'html': true } }, { role: 'style' }],
                        ['Speaking', modelData[index].Speaking.Proficiency, modelData[index].Speaking.Meaning, '#319CBD'],
                        ['Listening', modelData[index].Listening.Proficiency, modelData[index].Listening.Meaning, '#94CE39'],
                        ['Reading', modelData[index].Reading.Proficiency, modelData[index].Reading.Meaning, '#73218C'],
                        ['Writing', modelData[index].Writing.Proficiency, modelData[index].Writing.Meaning, '#B5184A']
                    ]);

                    var options = {
                        hAxis: {
                            ticks: [
                                { v: 0, f: "None" }, { v: 1, f: "Elementary" }, { v: 2, f: "Limited" }, { v: 3, f: "General" },
                                { v: 4, f: "Advanced" }, { v: 5, f: "Fluent" }],
                            minValue: 0,
                            maxValue: 5,
                            viewWindowMode: 'maximized',
                            textStyle: { fontSize: 16 }
                        },
                        vAxis: {
                            viewWindowMode: 'maximized',
                            textStyle: { fontSize: 16 }
                        },
                        tooltip: { isHtml: true },
                        legend: { position: "none" },
                        width: 690,
                        height: 300,
                        chartArea: { left: 80, top: 32, bottom: 40, width: "80%", height: "80%" },
                        bar: { groupWidth: "40%" }
                    };
                    var chart = new google.visualization.BarChart(document.getElementById('chart_div_' + modelData[index].Id));
                    chart.draw(data, options);
                });
            };
            LanguageViewModel.prototype.addTooltipStyle = function (Meaning) {
                if (Meaning != null) {
                    Meaning = "<div style='padding:5px; line-height:14px; width:400px;'>" + Meaning + "</div>";
                }
                return Meaning;
            };
            LanguageViewModel._googleVisualizationLoadedPromise = $.Deferred();
            return LanguageViewModel;
        })();
        ViewModels.LanguageViewModel = LanguageViewModel;
    })(People.ViewModels || (People.ViewModels = {}));
    var ViewModels = People.ViewModels;
})(People || (People = {}));
