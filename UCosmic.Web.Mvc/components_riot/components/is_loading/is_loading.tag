<is_loading>
    <style>
        .spinner {
            margin: 0;
            width: 40px;
            height: 40px;
            position: relative;
            text-align: center;

            -webkit-animation: sk-rotate 2.0s infinite linear;
            animation: sk-rotate 2.0s infinite linear;
        }

        .dot1, .dot2 {
            width: 60%;
            height: 60%;
            display: inline-block;
            position: absolute;
            top: 0;
            border-radius: 100%;

            -webkit-animation: sk-bounce 2.0s infinite ease-in-out;
            animation: sk-bounce 2.0s infinite ease-in-out;
        }

        .dot2 {
            top: auto;
            bottom: 0;
            -webkit-animation-delay: -1.0s;
            animation-delay: -1.0s;
        }

        @-webkit-keyframes sk-rotate { 100% { -webkit-transform: rotate(360deg) }}
        @keyframes sk-rotate { 100% { transform: rotate(360deg); -webkit-transform: rotate(360deg) }}

        @-webkit-keyframes sk-bounce {
            0%, 100% { -webkit-transform: scale(0.0) }
            50% { -webkit-transform: scale(1.0) }
        }

        @keyframes sk-bounce {
            0%, 100% {
                transform: scale(0.0);
                -webkit-transform: scale(0.0);
            } 50% {
                  transform: scale(1.0);
                  -webkit-transform: scale(1.0);
              }
        }

    </style>
    <div id="spinner_container" class="layout horizontal center center-justified" riot-style="width:{opts.container_width}; height:{opts.container_height}">
        <div  riot-style="margin-right: 10px; {opts.text_styles}" show="{opts.is_showing && opts.text}">
            {opts.text}
        </div>
        <div class="spinner"  riot-style="height:{opts.height}; width:{opts.width}" show="{opts.is_showing}">
            <div class="dot1" riot-style="background-color: {opts.color}"></div>
            <div class="dot2" riot-style="background-color: {opts.color}"></div>
        </div>
    </div>
</is_loading>