var People;
(function (People) {
    var ViewModels;
    (function (ViewModels) {
        var LanguageViewModel = (function () {
            function LanguageViewModel(modelData) {
                this.purgeSpinner = new App.Spinner();
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
                    modelData[index].speaking.meaning = _this.addTooltipStyle(modelData[index].speaking.meaning);
                    modelData[index].listening.meaning = _this.addTooltipStyle(modelData[index].listening.meaning);
                    modelData[index].reading.meaning = _this.addTooltipStyle(modelData[index].reading.meaning);
                    modelData[index].writing.meaning = _this.addTooltipStyle(modelData[index].writing.meaning);
                    var data = google.visualization.arrayToDataTable([
                        ['Categories', "Proficiency", { type: 'string', position: 'center', role: 'tooltip', 'p': { 'html': true } }, { role: 'style' }],
                        ['Speaking', modelData[index].speaking.proficiency, modelData[index].speaking.meaning, '#319CBD'],
                        ['Listening', modelData[index].listening.proficiency, modelData[index].listening.meaning, '#94CE39'],
                        ['Reading', modelData[index].reading.proficiency, modelData[index].reading.meaning, '#73218C'],
                        ['Writing', modelData[index].writing.proficiency, modelData[index].writing.meaning, '#B5184A'],
                    ]);
                    var options = {
                        hAxis: {
                            ticks: [{ v: 0, f: "None" }, { v: 1, f: "Elementary" }, { v: 2, f: "Limited" }, { v: 3, f: "General" }, { v: 4, f: "Advanced" }, { v: 5, f: "Fluent" }],
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
            };
            LanguageViewModel.prototype.addTooltipStyle = function (Meaning) {
                if (Meaning != null) {
                    Meaning = "<div style='padding:5px; line-height:14px; width:400px;'>" + Meaning + "</div>";
                }
                return Meaning;
            };
            LanguageViewModel.prototype._purge = function (expertiseId) {
                var _this = this;
                $.ajax({
                    async: false,
                    type: "DELETE",
                    url: App.Routes.WebApi.LanguageExpertise.del(expertiseId),
                    success: function (data, textStatus, jqXHR) {
                        _this.purgeSpinner.stop();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        _this.purgeSpinner.stop();
                        alert(textStatus);
                    }
                });
            };
            LanguageViewModel.prototype.purge = function (expertiseId, thisData, event) {
                var _this = this;
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
                                click: function () {
                                    _this.$confirmDeleteLanguage.dialog('close');
                                    _this.purgeSpinner.start(true);
                                    _this._purge(expertiseId);
                                    if ($(event.target).closest("ul").find("li").length == 2) {
                                        $("#luanguages_no_results").css("display", "block");
                                    }
                                    $(event.target).closest("li").remove();
                                },
                                'data-confirm-delete-link': true,
                            },
                            {
                                text: 'No, cancel delete',
                                click: function () {
                                    _this.$confirmDeleteLanguage.dialog('close');
                                },
                                'data-css-link': true,
                            }
                        ],
                        close: function () {
                            _this.purgeSpinner.stop();
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
            };
            LanguageViewModel.prototype.edit = function (id) {
                window.location.href = App.Routes.Mvc.My.LanguageExpertise.edit(id);
            };
            LanguageViewModel.prototype.addLanguage = function () {
                window.location.href = App.Routes.Mvc.My.LanguageExpertise.create();
            };
            LanguageViewModel._googleVisualizationLoadedPromise = $.Deferred();
            return LanguageViewModel;
        })();
        ViewModels.LanguageViewModel = LanguageViewModel;
    })(ViewModels = People.ViewModels || (People.ViewModels = {}));
})(People || (People = {}));
