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
        var _t = this;
        $.ajax({
            url: './js/data.json',
            success: function(data) {
                _t.data = data;
                _t.render();
                _t['grid'] = $('.case__list').isotope({
                    itemSelector: '.case__item',
                    layoutMode: 'fitRows'
                });
                _t._update();
            }
        });

        $('body').on('click', function(event) {
            var target = $(event.target);

            if (target.hasClass("filter__but")) {
                var type = target.attr('data-filter');
                target.addClass('active').siblings().removeClass('active');
                _t.filterItems(type);
            } else return;
        });

        _t.basket = $('.order');

        $('body').on('click', '.product:not(.added) .product__add', function(e) {
            _t._add.call(_t, e);
        })

        $('body').on('click', '.order__delete', function(e) {
            _t._removeItem.call(_t, e);
        });

        $('body').on('click', '.js-to-basket', function(e) {
            Util.scrollToEl($('#order'))
        });

        $('body').on('click', '.js-to-callback', function(e) {
            Util.scrollToEl($('#callback'))
        });

    },
    render: function() {
        var _t = this;

        var categories = _t.data.shop;

        categories.forEach(function(el, i) {
            _t._renderFilter(el.category);
            _t._renderProducts(el.products, el.category);
        });
    },
    _renderProducts: function(products, category) {
        var _t = this;

        var productsContainer = $('.case__list');

        products.forEach(function(el, i) {
            el['category'] = category;

            var productCase = $('<div>').addClass('case__item product ' + Util.slugify(Util.translit(category))).attr('data-data', JSON.stringify(el)).attr('data-id', el.id),
                productPic = $('<div>').addClass('product__pic').append($('<img>').attr('src', el.pic)),
                productName = $('<p>').addClass('product__name').text(el.name),
                productValue = $('<p>').addClass('product__value').text(el.value),
                productPrice = $('<p>').addClass('product__price').text(el.price + ",00 р."),
                productQunatityEl = $('<span>').addClass('product__quantity').append($('<input type="text" name="quantity" value="1">')).append($('<span>шт.</span>')),
                productButtonAdd = $('<button>').addClass('product__add').text("Добавить в корзину");

            productCase.append(productPic);
            productCase.append(productName);
            productCase.append(productValue);
            productPrice.append(productQunatityEl);
            productCase.append(productPrice);
            productCase.append(productButtonAdd);
            productsContainer.append(productCase);
        });
    },
    _renderFilter: function(category) {
        var _t = this;

        var filterContainer = $('.filter'),
            filtersButtons = document.createDocumentFragment();

        filtersButtons.append(_createButton(category));

        function _createButton(type) {
            var filterBut = document.createElement('button');

            $(filterBut).addClass('filter__but').attr('data-filter', '.' + Util.slugify(Util.translit(type))).text(category);
            return filterBut;
        }

        filterContainer.append(filtersButtons);
        filterContainer.children().first().addClass('active');
    },
    filterItems: function(type) {
        var _t = this;
        _t.grid.isotope({ filter: type });
    },
    _add: function(event) {
        var _t = this;

        var productCard = $(event.target).closest('.product');

        productData = JSON.parse(productCard.attr('data-data'));

        productCard.addClass('added').find('.product__add').text("В корзине").addClass('js-to-basket');

        var item = {
            id: productData.id,
            quantity: productCard.find('[name="quantity"]').val(),
            name: productData.name,
            price: productData.price,
        };

        _t._addBasket(item);

    },
    _addBasket: function(prod) {
        var _t = this;

        var basket = _t._getBasket();

        basket.push(prod);

        localStorage.setItem('basket', JSON.stringify(basket));

        _t._update();
    },
    _getBasket: function() {
        return JSON.parse(localStorage.getItem('basket')) || []
    },
    _update: function() {
        var _t = this;

        var totalPrice = 0;

        var list = $('.order__list')

        list.html('');

        var basket = _t._getBasket();

        basket.map(function(item) {
            var elem = $('[data-id="' + item.id + '"]');
            elem.addClass('added').find('.product__add').text("В корзине").addClass('js-to-basket');
            elem.find('[name="quantity"]').val(item.quantity);
            renderBasketItem(item);
        })

        basket.length <= 0 ? _t.basket.addClass('empty') : _t.basket.removeClass('empty')

        $('.js-total').text(totalPrice)

        function renderBasketItem(elem) {
            
            var productString = elem.name+' x'+elem.quantity;
            var prodItem = $('<p>').addClass('order__item').text(productString).append($('<button>').addClass('order__delete').text('Удалить'))

            totalPrice += Number(elem.quantity * elem.price)

            list.append(prodItem)
        }
    },
}

$(function() {
    Shop.init()
});