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
                modelData[index].speaking.meaning = this.addTooltipStyle(modelData[index].speaking.meaning);
                modelData[index].listening.meaning = this.addTooltipStyle(modelData[index].listening.meaning);
                modelData[index].reading.meaning = this.addTooltipStyle(modelData[index].reading.meaning);
                modelData[index].writing.meaning = this.addTooltipStyle(modelData[index].writing.meaning);
                var data = google.visualization.arrayToDataTable([
                    ['Categories', "Proficiency", { type: 'string', position: 'center', role: 'tooltip', 'p': { 'html': true } }, { role: 'style' }],
                    ['Speaking', modelData[index].speaking.proficiency, modelData[index].speaking.meaning, '#319CBD'],
                    ['Listening', modelData[index].listening.proficiency, modelData[index].listening.meaning, '#94CE39'],
                    ['Reading', modelData[index].reading.proficiency, modelData[index].reading.meaning, '#73218C'],
                    ['Writing', modelData[index].writing.proficiency, modelData[index].writing.meaning, '#B5184A'],
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
                var chart = new google.visualization.BarChart(document.getElementById('chart_div_' + modelData[index].id));
                chart.draw(data, options);
            });
        }
        addTooltipStyle(Meaning: string) {
            if (Meaning != null) {
                Meaning = "<div style='padding:5px; line-height:14px; width:400px;'>" + Meaning + "</div>";
            }
            return Meaning;
        }


        purgeSpinner = new App.Spinner();
        $confirmDeleteLanguage: JQuery;
        private _purge(expertiseId): void {
            $.ajax({
                async: false,
                type: "DELETE",
                url: App.Routes.WebApi.LanguageExpertise.del(expertiseId),
                success: (data: any, textStatus: string, jqXHR: JQueryXHR): void => {
                    this.purgeSpinner.stop();
                },
                error: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string): void => {
                    this.purgeSpinner.stop();
                    alert(textStatus);
                }
            });
        }
        purge(expertiseId, thisData, event): void {
            this.purgeSpinner.start();
            if (this.$confirmDeleteLanguage && this.$confirmDeleteLanguage.length) {
                this.$confirmDeleteLanguage.dialog({
                    dialogClass: 'jquery-ui',
                    width: 'auto',
                    resizable: false,
                    modal: true,
                    buttons: [
                        {
                            text: 'Yes, confirm delete',
                            click: (): void => {
                                this.$confirmDeleteLanguage.dialog('close');
                                this.purgeSpinner.start(true);
                                this._purge(expertiseId);
                                //have to check before removing
                                if ($(event.target).closest("ul").find("li").length == 2) {
                                    $("#luanguages_no_results").css("display", "block");
                                }
                                $(event.target).closest("li").remove();
                            },
                            'data-confirm-delete-link': true,
                        },
                        {
                            text: 'No, cancel delete',
                            click: (): void => {
                                this.$confirmDeleteLanguage.dialog('close');
                            },
                            'data-css-link': true,
                        }
                    ],
                    close: (): void => {
                        this.purgeSpinner.stop();
                    },
                });
            }
            else {
                if (confirm('Are you sure you want to delete this language expertise?')) {
                    this._purge(expertiseId);
                }
                else {
                    this.purgeSpinner.stop();
                }
            }
        }
        edit(id): void {
            window.location.href = App.Routes.Mvc.My.LanguageExpertise.edit(id)
        }
        addLanguage(): void {
            window.location.href = App.Routes.Mvc.My.LanguageExpertise.create();
        }
    }
}