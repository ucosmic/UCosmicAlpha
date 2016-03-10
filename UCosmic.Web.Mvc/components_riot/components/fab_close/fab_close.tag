<fab_close>
    <style>
        fab_close{
            position: absolute;
            top: 5px;
            right: 3.5em;
            height:0;
            width: 0;
            overflow: visible;
        }
        fab_close #fab_close_button{
            background-color: red;
            height: 2em;
            width: 2em;
            outline: none;
            border-radius: 50%;
            border: none;
            opacity: .8;
            transition: opacity .25s ease-in-out;
            -moz-transition: opacity .25s ease-in-out;
            -webkit-transition: opacity .25s ease-in-out;
            position: relative;
            z-index:1;
        }
        fab_close #fab_close_button:active{
            -webkit-box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.11), 0 1px 3px 0 rgba(0, 0, 0, 0.11), 0 1px 1px -1px rgba(0, 0, 0, 0.1)!important;
            -moz-box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.11), 0 1px 3px 0 rgba(0, 0, 0, 0.11), 0 1px 1px -1px rgba(0, 0, 0, 0.1)!important;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.11), 0 1px 3px 0 rgba(0, 0, 0, 0.11), 0 1px 1px -1px rgba(0, 0, 0, 0.1)!important;

        }
        fab_close #fab_close_button:hover{
            cursor: pointer;
            -webkit-box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4);
            -moz-box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4);
            box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4);

            opacity: 1;
        }
    </style>
    <div id="fab_close_container">
        <div id="fab_close_button"><svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" style="pointer-events: none; display: inline-block; width: 2em; height: 2em;fill:white; ">
            <g>
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z">
                </path>
            </g>
        </svg>
        </div>
    </div>
</fab_close>