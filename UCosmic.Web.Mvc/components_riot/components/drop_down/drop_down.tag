<drop_down>
    <style>
        #ddl_container{
            position: relative;
            width: 0;
            height: 0;
            overflow: visible;
            top: 20px;
        }
        ul{
            position: relative;
            right: 100px;
            padding: 10px 5px;
            list-style-type: none;
            width: 90px;
            height: 100px;
            background-color: rgba(255,255,255,.9);
            -webkit-border-radius:10px;
            -moz-border-radius:10px;
            border-radius:10px;
            -webkit-box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4);
            -moz-box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4);
            box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4);
            margin: 10px 0;
        }
        li:not(:last-child) {
            margin-bottom: 10px;
        }
    </style>
    <div id="ddl_container">
            <ul id="list" class="layout vertical center-justified pre_scale_top_right {fade_in: opts.is_shown} {fade_out: !opts.is_shown} {scale: !opts.is_shown}">
            <li class="highlight-text" each="{ item, i in opts.list }">{item.title}</li>
        </ul>
    </div>
</drop_down>