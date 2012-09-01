(function ($) {
    $('[data-fixed-scroll=container]').each(function () {
        var $window = $(window),
            $container = $(this),
            $content = $container.find('[data-fixed-scroll=content]'),
            $anchor = $container.find('[data-fixed-scroll=anchor]'),
            fixedWidth = $content.width(),
            update = function () {
                var windowScrollTop = $window.scrollTop(),
                    anchorOffsetTop = $anchor.offset().top;
                if (windowScrollTop > anchorOffsetTop)
                    if ($content.height() > $window.height())
                        $content.css({ position: 'fixed', top: '', bottom: '0px', width: fixedWidth });
                    else
                        $content.css({ position: 'fixed', top: '0px', bottom: '', width: fixedWidth });
                else if (windowScrollTop <= anchorOffsetTop)
                    $content.css({ position: 'relative', top: '', bottom: '' });
            };
        $window.scroll(update).resize(update);
        update();
    });
}(jQuery));
