var Util = {
    randomInteger: function(min, max) {
        var rand = min + Math.random() * (max - min)
        rand = Math.round(rand);
        return rand;
    },
    scrollToEl: function(el, offset) {
        $("html,body").animate({ scrollTop: el.offset().top + (offset || 0) }, 500);
    },
    trimString: function(string) {
        return string.split(' ').join('');
    },
    translit: function(str) {

        var ru = {
                'а': 'a',
                'б': 'b',
                'в': 'v',
                'г': 'g',
                'д': 'd',
                'е': 'e',
                'ё': 'e',
                'ж': 'j',
                'з': 'z',
                'и': 'i',
                'к': 'k',
                'л': 'l',
                'м': 'm',
                'н': 'n',
                'о': 'o',
                'п': 'p',
                'р': 'r',
                'с': 's',
                'т': 't',
                'у': 'u',
                'ф': 'f',
                'х': 'h',
                'ц': 'c',
                'ч': 'ch',
                'ш': 'sh',
                'щ': 'shch',
                'ы': 'y',
                'э': 'e',
                'ю': 'u',
                'я': 'ya'
            },
            n_str = [];

        str = str.replace(/[ъь]+/g, '').replace(/й/g, 'i');

        for (var i = 0; i < str.length; ++i) {
            n_str.push(
                ru[str[i]] ||
                ru[str[i].toLowerCase()] == undefined && str[i] ||
                ru[str[i].toLowerCase()].replace(/^(.)/, function(match) { return match.toUpperCase() })
            );
        }

        return n_str.join('');
    },
    slugify: function(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-') // Replace spaces with -
            .replace(/\-\-+/g, '-') // Replace multiple - with single -
            .replace(/^-+/, '') // Trim - from start of text
            .replace(/-+$/, ''); // Trim - from end of text
    }
}

var Shop = {
    data: {},
    init: function() {
        var _t = this
        $.ajax({
            url: './js/data.json',
            success: function(data) {
                _t.data = data;
                _t.render();
                _t['grid'] = $('.case__list').isotope({
                    itemSelector: '.case__item',
                    layoutMode: 'fitRows'
                });
            }
        });

        $('body').on('click', function(event) {
            var target = $(event.target)

            if (target.hasClass("filter__but")) {
                var type = target.attr('data-filter')
                target.addClass('active').siblings().removeClass('active')
                _t.filterItems(type)
            } else return;
        });

    },
    render: function() {
        var _t = this

        var categories = _t.data.shop

        console.log(categories)
        categories.forEach(function(el, i) {
            _t._renderFilter(el.category)
            _t._renderProducts(el.products, el.category)
        });
    },
    _renderProducts: function(products, category) {
        var _t = this;

        var productsContainer = $('.case__list');

        products.forEach(function(el, i) {
           var productCase = $('<div>').addClass('case__item product '+Util.slugify(Util.translit(category))),
           productPic = $('<div>').addClass('product__pic').append($('<img>').attr('src', el.pic)),
           productName = $('<p>').addClass('product__name').text( el.name),
           productValue = $('<p>').addClass('product__value').text( el.value),
           productPrice = $('<p>').addClass('product__price').text( el.price+",00 р."),
           productQunatityEl = $('<span>').addClass('product__quantity').append($('<input type="text" name="quantity">')).append($('<span>шт.</span>')),
           productButtonAdd = $('<button>').addClass('product__add').text("Добавить в корзину");

           productCase.append(productPic)
           productCase.append(productName)
           productCase.append(productValue)
           productPrice.append(productQunatityEl)
           productCase.append(productPrice)
           productCase.append(productButtonAdd)
           productsContainer.append(productCase)
        });
    },
    _renderFilter: function(category) {
        var _t = this;

        var filterContainer = $('.filter'),
            filtersButtons = document.createDocumentFragment();

        filtersButtons.append(_createButton(category))

        function _createButton(type) {
            var filterBut = document.createElement('button');

            $(filterBut).addClass('filter__but').attr('data-filter', '.' + Util.slugify(Util.translit(type))).text(category)
            return filterBut
        }

        filterContainer.append(filtersButtons)
        filterContainer.children().first().addClass('active')
    },
    filterItems: function(type) {
        var _t = this;
        _t.grid.isotope({ filter: type });
    },
}

$(function() {
    Shop.init()
});