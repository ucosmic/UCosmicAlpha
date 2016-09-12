ttw.ElRelativeToEl = function (toThisElement, bindThisElement) {
    var rect = toThisElement[0].getBoundingClientRect();
    bindThisElement
        .css({
            top: (rect.bottom - rect.top) / 2 + rect.top - bindThisElement.height() / 2 + 'px',
            left: (rect.right - rect.left) / 2 + rect.left - bindThisElement.width() / 2 + 'px'
        });
};