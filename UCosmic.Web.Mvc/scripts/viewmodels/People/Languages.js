var People;
(function (People) {
    //var modelData;// just for typescript because this is passed set up in the page itself.
    (function (ViewModels) {
        var LanguageViewModel = (function () {
            function LanguageViewModel(modelData) {
                //$(document).ready(() => {
                this.setupGoogleChart(modelData);
                //});
            }
            LanguageViewModel.prototype.setupGoogleChart = function (modelData) {
                var _this = this;
                google.load('visualization', '1', { 'packages': ['corechart'] });
                google.setOnLoadCallback(function () {
                    $.each(modelData, function (index, value) {
                        modelData[index].SpeakingMeaning = _this.addTooltipStyle(modelData[index].SpeakingMeaning);
                        modelData[index].ListeningMeaning = _this.addTooltipStyle(modelData[index].ListeningMeaning);
                        modelData[index].ReadingMeaning = _this.addTooltipStyle(modelData[index].ReadingMeaning);
                        modelData[index].WritingMeaning = _this.addTooltipStyle(modelData[index].WritingMeaning);
                        var data = google.visualization.arrayToDataTable([
                            ['Categories', "Proficiency", { type: 'string', position: 'center', role: 'tooltip', 'p': { 'html': true } }, { role: 'style' }],
                            ['Speaking', modelData[index].SpeakingProficiency, modelData[index].SpeakingMeaning, '#319CBD'],
                            ['Listening', modelData[index].ListeningProficiency, modelData[index].ListeningMeaning, '#94CE39'],
                            ['Reading', modelData[index].ReadingProficiency, modelData[index].ReadingMeaning, '#73218C'],
                            ['Writing', modelData[index].WritingProficiency, modelData[index].WritingMeaning, '#B5184A']
                        ]);

                        //no gradients yet - http://code.google.com/p/google-visualization-api-issues/issues/detail?id=550
                        var options = {
                            hAxis: {
                                ticks: [
                                    { v: 0, f: "none" }, { v: 1, f: "Elementary" }, { v: 2, f: "Limited" }, { v: 3, f: "General" },
                                    { v: 4, f: "Advanced" }, { v: 5, f: "Fluent" }]
                                ],
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
                            chartArea: { left: 80, top: 32, bottom: 40, width: "80%", height: "80%" }
                        };

                        var chart = new google.visualization.BarChart(document.getElementById('chart_div_' + modelData[index].Id));
                        chart.draw(data, options);
                    });
                });
            };
            LanguageViewModel.prototype.addTooltipStyle = function (Meaning) {
                if (Meaning != null) {
                    Meaning = "<div style='padding:5px; line-height:14px; width:400px;'>" + Meaning + "</div>";
                }
                return Meaning;
            };
            return LanguageViewModel;
        })();
        ViewModels.LanguageViewModel = LanguageViewModel;
    })(People.ViewModels || (People.ViewModels = {}));
    var ViewModels = People.ViewModels;
})(People || (People = {}));
