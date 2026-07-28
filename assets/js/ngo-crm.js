(function ($) {
    "use strict";

    $(window).on("load", function () {
        $("#xb-loadding").fadeOut(200);
        if (typeof WOW === "function") {
            new WOW({
                boxClass: "wow",
                animateClass: "animated",
                offset: 0,
                mobile: true,
                live: true
            }).init();
        }
    });

    $("[data-background]").each(function () {
        $(this).css("background-image", "url(" + $(this).attr("data-background") + ")");
    });

    $("[data-bg-color]").each(function () {
        $(this).css("background-color", $(this).attr("data-bg-color"));
    });

    if ($(".stricky").length) {
        $(".stricky")
            .addClass("original")
            .clone(true)
            .insertAfter(".stricky")
            .addClass("stricked-menu")
            .removeClass("original");
    }

    $(window).on("scroll", function () {
        var scrollTop = $(this).scrollTop();
        $(".xb-backtotop").toggleClass("active", scrollTop > 500);
        $(".stricked-menu").toggleClass("stricky-fixed", scrollTop > 150);
    });

    $(".scroll").on("click", function (event) {
        event.preventDefault();
        $("html, body").animate({ scrollTop: 0 }, 500);
    });

    $(".xb-header-menu li.menu-item-has-children, .xb-menu-primary li.menu-item-has-children")
        .append('<span class="xb-menu-toggle" role="button" tabindex="0" aria-label="Toggle submenu"></span>');

    function toggleSubmenu(toggle) {
        var $toggle = $(toggle);
        var $item = $toggle.closest(".menu-item");
        $toggle.toggleClass("active");
        $item.find("> .sub-menu").toggleClass("active").stop(true, true).slideToggle(200);
    }

    $(".xb-menu-toggle").on("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        toggleSubmenu(this);
    }).on("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleSubmenu(this);
        }
    });

    $(".xb-nav-mobile").on("click", function (event) {
        event.preventDefault();
        $(this).toggleClass("active");
        $(".xb-header-menu").toggleClass("active");
        $("body").toggleClass("body-overflow");
    });

    $(".xb-menu-close, .xb-header-menu-backdrop").on("click", function () {
        $(".xb-nav-mobile").removeClass("active");
        $(".xb-header-menu").removeClass("active");
        $("body").removeClass("body-overflow");
    });

    $(".accordion_box").on("click", ".acc-btn", function () {
        var $button = $(this);
        var $accordion = $button.closest(".accordion");
        var $box = $button.closest(".accordion_box");
        var isOpen = $button.next(".acc_body").is(":visible");

        $box.find(".acc-btn").removeClass("active");
        $box.find(".accordion").removeClass("active-block");
        $box.find(".acc_body").stop(true, true).slideUp(250);

        if (!isOpen) {
            $button.addClass("active");
            $accordion.addClass("active-block");
            $button.next(".acc_body").stop(true, true).slideDown(250);
        }
    });
})(jQuery);
