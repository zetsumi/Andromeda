import { $, tween, $wnd } from './_utility';

/*------------------------------------------------------------------

  Init Navbar

-------------------------------------------------------------------*/
function initNavbar() {
    const self = this;
    const $navbarTop = $('.nk-navbar-top');

    // add mobile navbar
    const $mobileNavItems = $('[data-nav-mobile]');
    if ($mobileNavItems.length) {
        $mobileNavItems.each(function () {
            const $nav = $($(this).html());
            const $mobileNav = $($(this).attr('data-nav-mobile'));

            // insert into mobile nav
            $mobileNav.find('.nk-navbar-mobile-content > ul.nk-nav').append($nav);
        });

        const $nav = $('.nk-navbar-mobile-content > ul.nk-nav');

        // remove background images
        $nav.find('.bg-image, .bg-video').remove();

        // remove mega menus
        $nav.find('.nk-mega-item > .dropdown').each(function () {
            const $drop = $(this).children('ul').addClass('dropdown');

            // fix mega menu columns
            $drop.find('> li > label').each(function () {
                $(this).next().addClass('dropdown');
                $(this).parent().addClass('nk-drop-item');
                $(this).replaceWith($('<a href="#"></a>').html($(this).html()));
            });

            $(this).replaceWith($drop);
        });
        $nav.find('.nk-mega-item').removeClass('nk-mega-item');
    }

    // sticky navbar
    const navbarTop = $navbarTop.length ? $navbarTop.offset().top : 0;
    // fake hidden navbar to prevent page jumping on stick
    const $navbarFake = $('<div>').hide();
    function onScrollNav() {
        const stickyOn = $wnd.scrollTop() >= navbarTop;

        if (stickyOn) {
            $navbarTop.addClass('nk-navbar-fixed');
            $navbarFake.show();
        } else {
            $navbarTop.removeClass('nk-navbar-fixed');
            $navbarFake.hide();
        }
    }
    if ($navbarTop.hasClass('nk-navbar-sticky')) {
        $wnd.on('scroll resize', onScrollNav);
        onScrollNav();

        $navbarTop.after($navbarFake);
        self.debounceResize(() => {
            $navbarFake.height($navbarTop.innerHeight());
        });
    }

    // correct dropdown position
    function correctDropdown($item) {
        if ($item.parent().is('.nk-nav')) {
            const $dropdown = $item.children('.dropdown');
            const $parent = $item.closest('.nk-navbar');
            let $parentContainer = $parent.children('.container');
            $parentContainer = $parentContainer.length ? $parentContainer : $parent;

            // fix right value when sub menu is not hidden
            const css = {
                marginLeft: '',
                marginRight: '',
                marginTop: 0,
                display: 'block',
            };

            $dropdown.css(css);

            let rect = $dropdown[0].getBoundingClientRect();
            const rectContainer = $parentContainer[0].getBoundingClientRect();
            const itemRect = $item[0].getBoundingClientRect();

            // move dropdown from right corner (right corner will check in nav container)
            if (rect.right > rectContainer.right) {
                css.marginLeft = rectContainer.right - rect.right;
                $dropdown.css(css);
                rect = $dropdown[0].getBoundingClientRect();
            }

            // move dropdown from left corner
            if (rect.left < 0) {
                css.marginLeft = -rect.left;
                $dropdown.css(css);
                rect = $dropdown[0].getBoundingClientRect();
            }

            // check if dropdown not under item
            const currentLeftPost = rect.left + (css.marginLeft || 0);
            if (currentLeftPost > itemRect.left) {
                css.marginLeft = (css.marginLeft || 0) - (currentLeftPost - itemRect.left);
            }

            // correct top position
            // 10 - transform value
            css.marginTop = $parent.innerHeight() - $dropdown.offset().top + $parent.offset().top + 5;

            // hide menu
            css.display = 'none';

            $dropdown.css(css);
        }
    }

    // toggle dropdown
    function closeSubmenu($item) {
        if ($item.length) {
            $item.removeClass('open');
            tween.to($item.children('.dropdown'), 0.3, {
                opacity: 0,
                display: 'none',
            });
            $wnd.trigger('nk-closed-submenu', [$item]);
        }
    }
    function openSubmenu($item) {
        if (!$item.hasClass('open')) {
            correctDropdown($item);
            tween.to($item.children('.dropdown'), 0.3, {
                opacity: 1,
                display: 'block',
            });
            $item.addClass('open');
            $wnd.trigger('nk-opened-submenu', [$item]);
        }
    }
    let dropdownTimeout;
    $navbarTop.on('mouseenter', 'li.nk-drop-item', function () {
        const $item = $(this);
        const $openedSiblings = $item.siblings('.open')
            .add($item.siblings().find('.open'))
            .add($item.parents('.nk-nav:eq(0)').siblings().find('.open'))
            .add($item.parents('.nk-nav:eq(0)').siblings('.open'))
            .add($item.parents('.nk-nav:eq(0)').parent().siblings().find('.open'));

        clearTimeout(dropdownTimeout);
        closeSubmenu($openedSiblings);
        openSubmenu($item);
    }).on('mouseleave', 'li.nk-drop-item', function () {
        const $item = $(this);
        clearTimeout(dropdownTimeout);
        dropdownTimeout = setTimeout(() => {
            closeSubmenu($item);
        }, 200);
    });
    $navbarTop.on('mouseleave', () => {
        clearTimeout(dropdownTimeout);
        dropdownTimeout = setTimeout(() => {
            closeSubmenu($navbarTop.find('.open'));
        }, 400);
    });

    // hide / show
    // add / remove solid color
    const $autohideNav = $navbarTop.filter('.nk-navbar-autohide');
    self.throttleScroll((type, scroll) => {
        const start = 400;
        const hideClass = 'nk-onscroll-hide';
        const showClass = 'nk-onscroll-show';

        // hide / show
        if (type === 'down' && scroll > start) {
            $autohideNav.removeClass(showClass).addClass(hideClass);
        } else if (type === 'up' || type === 'end' || type === 'start') {
            $autohideNav.removeClass(hideClass).addClass(showClass);
        }

        // add solid color
        if ($navbarTop.hasClass('nk-navbar-transparent')) {
            $navbarTop[`${scroll > 70 ? 'add' : 'remove'}Class`]('nk-navbar-solid');
        }
    });
}

export { initNavbar };
