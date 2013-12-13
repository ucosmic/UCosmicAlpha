module People.ViewModels {
    export class LanguageViewModel {
        //#region Static Google Visualization Library Loading

        private static _googleVisualizationLoadedPromise = $.Deferred();

        static loadGoogleVisualization(): JQueryPromise<void> {
            // this is necessary to load all of the google visualization API's used by this
            // viewmodel. additionally, https://www.google.com/jsapi script must be present
            google.load('visualization', '1', { 'packages': ['corechart'] });

            google.setOnLoadCallback((): void => { // when the packages are loaded
                LanguageViewModel._googleVisualizationLoadedPromise.resolve();
            });
            return LanguageViewModel._googleVisualizationLoadedPromise;
        }

        //#endregion

        constructor(modelData: server.LanguageExpertiseViewModel) {
            this.setupGoogleChart(modelData);
        }
        setupGoogleChart(modelData: server.LanguageExpertiseViewModel) {
            $.each(modelData, (index, value) => {
                modelData[index].Speaking.Meaning = this.addTooltipStyle(modelData[index].Speaking.Meaning);
                modelData[index].Listening.Meaning = this.addTooltipStyle(modelData[index].Listening.Meaning);
                modelData[index].Reading.Meaning = this.addTooltipStyle(modelData[index].Reading.Meaning);
                modelData[index].Writing.Meaning = this.addTooltipStyle(modelData[index].Writing.Meaning);
                var data = google.visualization.arrayToDataTable([
                    ['Categories', "Proficiency", { type: 'string', position: 'center', role: 'tooltip', 'p': { 'html': true } }, { role: 'style' }],
                    ['Speaking', modelData[index].Speaking.Proficiency, modelData[index].Speaking.Meaning, '#319CBD'],
                    ['Listening', modelData[index].Listening.Proficiency, modelData[index].Listening.Meaning, '#94CE39'],
                    ['Reading', modelData[index].Reading.Proficiency, modelData[index].Reading.Meaning, '#73218C'],
                    ['Writing', modelData[index].Writing.Proficiency, modelData[index].Writing.Meaning, '#B5184A'],
                ]);
                //no gradients yet - http://code.google.com/p/google-visualization-api-issues/issues/detail?id=550
                var options: google.visualization.BarChartOptions = {
                    hAxis: {
                        ticks: [{ v: 0, f: "None" }, { v: 1, f: "Elementary" }, { v: 2, f: "Limited" }, { v: 3, f: "General" },
                            { v: 4, f: "Advanced" }, { v: 5, f: "Fluent" }],
                        minValue: 0,
                        maxValue: 5,
                        viewWindowMode: 'maximized',
                        textStyle: { fontSize: 16 },
                    },
                    vAxis: {
                        viewWindowMode: 'maximized',
                        textStyle: { fontSize: 16 },
                    },
                    tooltip: { isHtml: true },
                    legend: { position: "none" },
                    width: 690,
                    height: 300,
                    chartArea: { left: 80, top: 32, bottom: 40, width: "80%", height: "80%" },
                    bar: { groupWidth: "40%" },
                };
                var chart = new google.visualization.BarChart(document.getElementById('chart_div_' + modelData[index].Id));
                chart.draw(data, options);
            });
        }
        addTooltipStyle(Meaning: string) {
            if (Meaning != null) {
                Meaning = "<div style='padding:5px; line-height:14px; width:400px;'>" + Meaning + "</div>";
            }
            return Meaning;
        }
    }
}