<side_bar_filter>
    <style scoped>


      #side_bar_filter_container {
        background-color: #ddd;
          border-radius: 5px;
          box-shadow: 1px 1px 5px black;
          padding: 10px;
          margin: 10px;
      }
    </style>
    <div class="layout vertical" id="side_bar_filter_container">
       <yield/>

    </div>
    <script type="es6">
        "use strict";
        let self = this;
        self.is_shown = self.opts.is_shown;


        self.on('updated', () => {
            
        })

    </script>
</side_bar_filter>