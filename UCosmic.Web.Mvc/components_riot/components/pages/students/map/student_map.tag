<student_map>
    <style>
        header_toolbar{
            position: absolute;
            z-index: 10;
        }
    </style>
    <side_bar_filter></side_bar_filter>
    <div id="regions_div" style="width: 900px; height: 500px;"></div>

    <script type="es6">
      // https://developers.google.com/chart/interactive/docs/gallery/geochart#region-geocharts
      var self = this;



      self.on('mount', function() {
      google.charts.load('current', {'packages':['geochart']});
      google.charts.setOnLoadCallback(drawRegionsMap);

      function drawRegionsMap() {

      var data = google.visualization.arrayToDataTable([
      ['Country', 'Popularity'],
      ['Germany', 200],
      ['United States', 300],
      ['Brazil', 400],
      ['Canada', 500],
      ['France', 600],
      ['RU', 700]
      ]);

      var options = {};

      var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));

      chart.draw(data, options);
      }
      })



    </script>
</student_map>