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
        _t.popup = $('.popup');

        $('body').on('click', '.product:not(.added) .product__add, .card:not(.added) .card__add', function(e) {
            _t._add.call(_t, e);
        })

        $('body').on('click', '.order__delete', function(e) {
            _t._removeItem.call(_t, e);
        });

        $('body').on('click', '.js-to-basket', function(e) {
            _t._closePopup.call(_t, e);
            Util.scrollToEl($('#order'));
        });

        $('body').on('click', '.js-to-callback', function(e) {
            Util.scrollToEl($('#callback'));
        });

        $('body').on('click', '.product__pic', function(e) {
            e.preventDefault();
            _t._openPopup.call(_t, e);
        });

        $('body').on('click', '.popup__close', function(e) {
            e.preventDefault();
            _t._closePopup.call(_t, e);
        });

        $('body').on('click', '.form__submit', function(e) {
            e.preventDefault();
            _t._submit.call(_t, e);
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
                productPic = $('<a href="#">').addClass('product__pic').append($('<img>').attr('src', el.pic)),
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

        var productCard = $(event.target).closest('.product, .card');

        productData = JSON.parse(productCard.attr('data-data'));

        productCard.addClass('added').find('.product__add').text("В корзине").addClass('js-to-basket');

        var item = {
            id: productData.id,
            quantity: productCard.find('[name="quantity"]').val() || "1",
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
    _removeItem: function(event) {
        var _t = this

        var id = $(event.target).closest('.order__delete').attr('data-delete-id');

        var basket = _t._getBasket(),
            basketFinal = [];

        basket.map(function(elem, i) {
            if (String(elem.id) !== id) basketFinal.push(elem)
        })

        $(event.target).closest('.order__item').fadeOut()

        localStorage.setItem('basket', JSON.stringify(basketFinal));

        _t._update()
    },
    _update: function() {
        var _t = this;

        var totalPrice = 0;

        $('.product').removeClass('added')

        var list = $('.order__list'),
            orderField = $('[name="order"]');

        orderField.val('')

        _t.orderString = orderField.val();

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
        $('[name="total"]').val(totalPrice)

        function renderBasketItem(elem) {

            var productString = elem.name + ' x' + elem.quantity;
            var prodItem = $('<p>').addClass('order__item').text(productString).append($('<button data-delete-id="' + elem.id + '">').addClass('order__delete').text('Удалить'))

            totalPrice += Number(elem.quantity * elem.price)

            list.append(prodItem)
            _t.orderString += _t.orderString ? ', ' + productString : productString
            $('[name="order"]').val(_t.orderString)
        }
    },
    _openPopup: function(e) {
        var _t = this,
            target = $(e.target).closest('.product'),
            product = productData = JSON.parse(target.attr('data-data')),
            img = target.find('.product__pic img').clone(),
            added = $(target).hasClass('added');

        renderPopupInfo(product, img, added, function() {
            _t.popup.fadeIn(100);
            $('body').addClass('fxdBody');
        }, )

        function renderPopupInfo(product, img, added, cb) {

            $('.card').attr('data-data', JSON.stringify(product)).removeClass('added');
            $('.card__pic').html(img);
            $('.card__name').text(product.name);
            $('.card__subname').text(product.subname);
            $('.card__value').text(product.value);
            $('.card__price').text(product.price + ',00 р.');
            $('.card__contains').html(product.contains);
            $('.card__tail').html(product.content);
            $('.card__add').attr('data-id', product.id);

            if (added) {
                $('.card').addClass('added');
                $('.card__add').text('В корзине').addClass('js-to-basket');
            }

            cb();
        }

    },
    _closePopup: function() {
        var _t = this;
        _t.popup.fadeOut(100);
        $('body').removeClass('fxdBody');
    },
    _submit: function(e) {
        var _t = this;
        var basket = _t._getBasket();
        var formId = $(e.target).closest('form').attr('id');

        if (formId === 'order') {

            basket.length > 0 && ajax($('#order'))
        } else {
            ajax($('#callback'))
        }

    },
    _clearBasket: function() {
        var _t = this
        localStorage.setItem('basket', null);

        _t._update()
    },
}

var ajax = function(form) {

    var formtarget = form,
        data = $(formtarget).serialize(),
        jqxhr = $.post("./ajax.php", data, onAjaxSuccess);

    function onAjaxSuccess(data) {

        var json = JSON.parse(data),
            status = json.status,
            message = json.message;

        if (status === 'success') {
            $('input, textarea, button[type=submit]').each(function() {
                $(this).prop("disabled", "true");
            });
        }

        addNotify(status, message)
    }

    var addNotify = function(status, msg, form) {
        var responseEl = $('.forms__response').removeClass('success error').addClass(status).text(msg);

        responseEl.slideDown();

        status === 'success' && Shop._clearBasket();
    }
}

$(function() {
    Shop.init()
});