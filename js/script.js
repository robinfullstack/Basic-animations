/* Created by Artisteer v4.3.0.60745 */
/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, curly:false, browser:true, jquery:false */
/*global jQuery BackgroundHelper */

// css helper
browser = function ($) {
    'use strict';
    var data = [
        { str: navigator.userAgent, sub: 'Chrome', ver: 'Chrome', name: 'chrome' },
        { str: navigator.vendor, sub: 'Apple', ver: 'Version', name: 'safari' },
        { prop: window.opera, ver: 'Opera', name: 'opera' },
        { str: navigator.userAgent, sub: 'Firefox', ver: 'Firefox', name: 'firefox' },
        { str: navigator.userAgent, sub: 'MSIE', ver: 'MSIE', name: 'ie' },
        { str: navigator.userAgent, sub: 'Trident/7.0', ver: 'rv', name: 'ie' }
    ];
    var v = function (s, n) {
        var i = s.indexOf(data[n].ver);
        return (i !== -1) ? parseFloat(s.substring(i + data[n].ver.length + 1)) : 0;
    };
    var result = { name: 'unknown', version: 0 };
    var html = $('html');
    for (var n = 0; n < data.length; n++) {
        if (!result[data[n].name]) {
            result[data[n].name] = false;
        }
        if ((data[n].str && (data[n].str.indexOf(data[n].sub) !== -1)) || data[n].prop) {
            result.name = data[n].name;
            result[result.name] = true;
            result.version = v(navigator.userAgent, n) || v(navigator.appVersion, n);
            html.addClass(result.name + ' ' + result.name + parseInt(result.version, 10));
        }
    }
    return result;
} (jQuery);

jQuery(function ($) {
    if (typeof responsiveDesign === "undefined") {
        $("html").addClass("desktop");
    }
});

jQuery(function ($) {
    'use strict';
    var i, j, k, l, m;
    if (!browser.ie || browser.version !== 9) {
        return;
    }
    var splitByTokens = function (str, startToken, endToken, last) {
        if (!last) {
            last = false;
        }
        var startPos = str.indexOf(startToken);
        if (startPos !== -1) {
            startPos += startToken.length;
            var endPos = last ? str.lastIndexOf(endToken) : str.indexOf(endToken, startPos);

            if (endPos !== -1 && endPos > startPos) {
                return str.substr(startPos, endPos - startPos);
            }
        }
        return '';
    };

    var splitWithBrackets = function (str, token, brackets) {
        /*jshint nonstandard:true */
        if (!token) {
            token = ',';
        }
        if (!brackets) {
            brackets = '()';
        }
        var bracket = 0;
        var startPos = 0;
        var result = [];
        if (brackets.lenght < 2) {
            return result;
        }
        var pos = 0;
        while (pos < str.length) {
            var ch = str[pos];
            if (ch === brackets[0]) {
                bracket++;
            }
            if (ch === brackets[1]) {
                bracket--;
            }
            if (ch === token && bracket < 1) {
                result.push(str.substr(startPos, pos - startPos));
                startPos = pos + token.length;
            }
            pos++;
        }
        result.push(str.substr(startPos, pos - startPos));
        return result;
    };

    var byteToHex = function (d) {
        var hex = Number(d).toString(16);
        while (hex.length < 2) {
            hex = "0" + hex;
        }
        return hex;
    };

    for (i = 0; i < document.styleSheets.length; i++) {
        var s = document.styleSheets[i];
        var r = [s];
        for (j = 0; j < s.imports.length; j++) {
            r.push(s.imports[j]);
        }
        for (j = 0; j < r.length; j++) {
            s = r[j];
            var n = [];
            for (k = 0; k < s.rules.length; k++) {
                var css = s.rules[k].cssText || s.rules[k].style.cssText;
                if (!css) {
                    continue;
                }
                var value = splitByTokens(css, '-svg-background:', ';');
                if (value === '') {
                    continue;
                }
                var values = splitWithBrackets(value);
                for (l = 0; l < values.length; l++) {
                    var g = splitByTokens(values[l], 'linear-gradient(', ')', true);
                    if (g === '') {
                        continue;
                    }
                    var args = splitWithBrackets(g);
                    if (args.length < 3) {
                        continue;
                    }
                    var maxOffset = 0;
                    var stops = [];
                    for (m = 1; m < args.length; m++) {
                        var stopValues = splitWithBrackets($.trim(args[m]), ' ');
                        if (stopValues.length < 2) {
                            continue;
                        }
                        var stopColor = $.trim(stopValues[0]);
                        var stopOpacity = 1;
                        if (stopColor == 'transparent') {
                            stopColor = '#000000';
                            stopOpacity = 0;
                        }
                        var colorRgba = splitByTokens(stopColor, 'rgba(', ')', true);
                        var stopOffset = $.trim(stopValues[1]);
                        if (colorRgba !== "") {
                            var rgba = colorRgba.split(',');
                            if (rgba.length < 4) {
                                continue;
                            }
                            stopColor = '#' + byteToHex(rgba[0]) + byteToHex(rgba[1]) + byteToHex(rgba[2]);
                            stopOpacity = rgba[3];
                        }
                        var isPx = stopOffset.indexOf('px') !== -1;
                        if (isPx) {
                            maxOffset = Math.max(maxOffset, parseInt(stopOffset, 10) || 0);
                        }
                        stops.push({ offset: stopOffset, color: stopColor, opacity: stopOpacity, isPx: isPx });
                    }
                    var stopsXML = '';
                    var lastStop = null;
                    for (m = 0; m < stops.length; m++) {
                        if (stops[m].isPx) {
                            stops[m].offset = ((parseInt(stops[m].offset, 10) || 0) / (maxOffset / 100)) + '%';
                        }
                        stopsXML += '<stop offset="' + stops[m].offset + '" stop-color="' + stops[m].color + '" stop-opacity="' + stops[m].opacity + '"/>';
                        if (m === stops.length - 1) {
                            lastStop = stops[m];
                        }
                    }
                    var isLeft = $.trim(args[0]) === 'left';
                    var direction = 'x1="0%" y1="0%" ' + (isLeft ? 'x2="100%" y2="0%"' : 'x2="0%" y2="100%"');
                    var gradientLength = '100%';
                    if (maxOffset > 0) {
                        gradientLength = maxOffset + 'px';
                    }
                    var size = (isLeft ? 'width="' + gradientLength + '" height="100%"' : 'width="100%" height="' + gradientLength + '"');
                    var last = "";
                    if (lastStop !== null && maxOffset > 0) {
                        last = '<rect ' +
                            (isLeft ?
                                'x="' + maxOffset + '" y="0"' :
                                'x="0" y="' + maxOffset + '"') +
                            ' width="100%" height="100%" style="fill:' + lastStop.color + ';opacity:' + lastStop.opacity + ';"/>';

                    }
                    var svgGradient = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><linearGradient id="g" gradientUnits="objectBoundingBox" ' + direction + '>' + stopsXML + '</linearGradient><rect x="0" y="0" ' + size + ' fill="url(#g)" />' + last + '</svg>';
                    values[l] = values[l].replace('linear-gradient(' + g + ')', 'url(data:image/svg+xml,' + escape(svgGradient) + ')');
                }
                n.push({ s: s.rules[k].selectorText, v: 'background: ' + values.join(",") });
            }
            for (k = 0; k < n.length; k++) {
                s.addRule(n[k].s, n[k].v);
            }
        }
    }
});


jQuery(function ($) {
    "use strict";
    // ie8
    if (!browser.ie || browser.version > 8) return;
    $('.SL-shapes').each(function () {
        if ($(this).siblings('.SL-slider').length) {
            $(this).remove();
        } else {
            $(this).css('z-index', 1);
        }
    });

    // ie7
    if (!browser.ie || browser.version > 7) return;
    var textblockTexts = $('.SL-textblock div[class$="-text"]');
    textblockTexts.each(function () {
        var tbText = $(this);
        var valign = tbText.css('vertical-align') ? tbText.css('vertical-align') : 'top';
        if (valign === 'middle') {
            var wrapper = tbText.wrap('<div/>').parent();
            tbText.css({
                'position': 'relative',
                'top': '-50%',
                'height': 'auto'
            });
            wrapper.css({
                'position': 'absolute',
                'top': '50%'
            });
        } else if (valign === 'bottom') {
            tbText.css({
                'position': 'absolute',
                'height': 'auto',
                'bottom': 0
            });
        }
    });
});

/* Set wmode=transparent for youtube and other video hostings to show it under the menus, lightboxes etc. */
jQuery(function ($) {
    "use strict";
    var video = ["youtube"];

    $("iframe[src]").each(function () {
        var iframe = $(this),
            src = iframe.attr("src"),
            isVideo = false,
            i;

        for (i = 0; i < video.length; i++) {
            if (src.toLowerCase().indexOf(video[i].toLowerCase()) !== -1) {
                isVideo = true;
                break;
            }
        }

        if (!isVideo) {
            return;
        }

        if (src.lastIndexOf("?") !== -1) {
            src += "&amp;wmode=transparent";
        } else {
            src += "?wmode=transparent";
        }
        iframe.attr("src", src);
    });
});

jQuery(function ($) {
    "use strict";
    $(window).bind("resize", function () { navigatorResizeHandler($("html").hasClass("responsive")); });
});

var navigatorResizeHandler = (function ($) {
    "use strict";
    return function (responsiveDesign) {
        if (responsiveDesign) return;
        $(".SL-slider").each(function () {
            var slider = $(this);
            var sliderWidth = slider.width();
            var nav = slider.siblings(".SL-slidenavigator");
            var navWidth = nav.outerWidth();
            if (nav.length && navWidth < sliderWidth) {
                // left offset
                var left = nav.attr("data-left");
                // (margin = containerWidth - (objectPosition + objectWidth)) < 0
                var margin = sliderWidth - sliderWidth * parseFloat(left) / 100 - nav.outerWidth(false);
                if (margin < 0) {
                    nav.css("margin-left", margin);
                }
            }
        });
    };
})(jQuery);

var processElementMultiplyBg = (function ($) {
    return (function (selector, info) {
        if (!selector || !info || !info.bgimage || !info.bgposition || !info.images || !info.positions) return;
        if (typeof customHeaderImage != 'undefined') info.images = '';
        var path = "";
        var script = $('head script[src*="script.js"]');
        if (script.length) {
            path = (script.attr('src') || '');
            path = path.substr(0, path.lastIndexOf('/') + 1);
        }
        var html = '';
        var el = $(selector);
        var bgimages = info.images.split(",");
        var bgpositions = info.positions.split(",");
        for (var i = bgimages.length - 1; i >= 0; i--) {
            var bgimage = $.trim(bgimages[i]);
            if (bgimage === "")
                continue;
            var imgIdx = bgimage.lastIndexOf('images/');
            var className = bgimage.substring(imgIdx + 7, bgimage.length - 6);
            el.append("<div class=\"ie8fix " + className + "\" style=\"position:absolute;top:0;left:0;width:100%;height:100%;background:" + bgimage.replace(/(images\/[^\/]+)$/, path + '$1') + " " + bgpositions[i] + " no-repeat\"></div>");
        }
        el.css('background-image', info.bgimage.replace(/(images\/[^\/]+)$/, path + '$1'));
        el.css('background-position-x', "50%");
        el.css('background-position-y', "50%");
    });
})(jQuery);


var responsiveNavigator = (function ($) {
    "use strict";
    return function () {
        if (typeof headerObjectResizer !== 'undefined' && headerObjectResizer.isPreview) return;

        var sheet = $('.SL-sheet');
        var sheetWidth = sheet.outerWidth();

        $(".SL-slider").each(function () {
            var currentSlider = $(this);
            var currentSliderWidth = currentSlider.width();

            var sliderNavigator = currentSlider.siblings(".SL-slidenavigator");
            if (sliderNavigator.length) {
                var off = sheetLeftFunc(sheet, sliderNavigator);
                var calcWidth = isContentSlider(sliderNavigator) ? currentSliderWidth : sheetWidth;

                var navigatorWidth = sliderNavigator.outerWidth();
                var offset = parseInt(sliderNavigator.attr('data-offset') || 0, 10);

                // left offset
                sliderNavigator.css('margin-left', '0px');

                var left = parseFloat(sliderNavigator.attr("data-left"), 10);
                var newLeft = off + uniToPx(left, navigatorWidth, calcWidth);
                sliderNavigator.css('left', newLeft + 'px');


                // reset top to original value
                sliderNavigator.css("top", "");

                // top
                var navigatorHeight = sliderNavigator.outerHeight();
                var uniy = parseFloat(sliderNavigator.attr('data-top'), 10);

                var sliderHeight = parseInt(currentSlider.css('height'), 10);
                var newTop = uniToPx(uniy, navigatorHeight, sliderHeight);

                sliderNavigator.css("top", (newTop + offset) + 'px');
            }
        });
    };
})(jQuery);

jQuery(function ($) {
    "use strict";

    if (typeof responsiveDesign === "undefined") {
        $(window).bind("resize", responsiveNavigator);
    }

    $(window).on("load", function pageInitialize() {
        $(window).trigger("resize");
        $(window).off("load", pageInitialize);
    });
});

jQuery(function ($) {
    "use strict";
    if ($('#SL-main').children('header.SL-header').length) {
        $('#SL-menu-bg').insertAfter($('header.SL-header'));
    }
});


/* Icons in Header should have display block.
 * Otherwise, in case of inline-block there's a space gap in some browsers (Opera 12.16) and icon is cutted.
 */
if (browser.opera) {
    jQuery(function ($) {
        $(".SL-header a[class$='tag-icon']").css("display", "block");
    });
}

jQuery(function($) {
    "use strict";
    $('nav.SL-nav').addClass("desktop-nav");
});

jQuery(window).bind('resize', (function ($) {
    "use strict";
    return function() {
        var menu = jQuery("nav.SL-nav");
        var menuOffset = menu.offset();
        var pageOffset = jQuery('#SL-main').offset();
        if (!menuOffset || !pageOffset) {
            return;
        }
        jQuery("#SL-hmenu-bg").css({
            "height": menu.outerHeight() + "px",
            "top": (menuOffset.top - pageOffset.top) + "px"
        });
    };
})(jQuery));


jQuery(function ($) {
    "use strict";
    if (!browser.ie || browser.version > 7) {
        return;
    }
    $('ul.SL-hmenu>li:not(:first-child)').each(function () { $(this).prepend('<span class="SL-hmenu-separator"> </span>'); });
});

jQuery(function ($) {
    "use strict";
    $("ul.SL-hmenu a:not([href])").attr('href', '#').click(function (e) { e.preventDefault(); });
});


jQuery(function ($) {
    "use strict";
    if (!browser.ie || browser.version > 7) {
        return;
    }

    /* Fix width of submenu items.
    * The width of submenu item calculated incorrectly in IE6-7. IE6 has wider items, IE7 display items like stairs.
    */
    $.each($("ul.SL-hmenu ul"), function () {
        var maxSubitemWidth = 0;
        var submenu = $(this);
        var subitem = null;
        $.each(submenu.children("li").children("a"), function () {
            subitem = $(this);
            var subitemWidth = subitem.outerWidth(false);
            if (maxSubitemWidth < subitemWidth) {
                maxSubitemWidth = subitemWidth;
            }
        });
        if (subitem !== null) {
            var subitemBorderLeft = parseInt(subitem.css("border-left-width"), 10) || 0;
            var subitemBorderRight = parseInt(subitem.css("border-right-width"), 10) || 0;
            var subitemPaddingLeft = parseInt(subitem.css("padding-left"), 10) || 0;
            var subitemPaddingRight = parseInt(subitem.css("padding-right"), 10) || 0;
            maxSubitemWidth -= subitemBorderLeft + subitemBorderRight + subitemPaddingLeft + subitemPaddingRight;
            submenu.children("li").children("a").css("width", maxSubitemWidth + "px");
        }
    });
});

jQuery(function ($) {
    "use strict";
    var setDirection = function() {
        setHMenuOpenDirection({
            container: "div.SL-sheet",
            defaultContainer: "#SL-main",
            menuClass: "SL-hmenu",
            leftToRightClass: "SL-hmenu-left-to-right",
            rightToLeftClass: "SL-hmenu-right-to-left"
        });
    };
    if (typeof responsiveDesign !== "undefined") {
        $(window).on('responsive', setDirection);
    } else {
        setDirection();
    }
});

var setHMenuOpenDirection = (function ($) {
    "use strict";
    return (function(menuInfo) {
        var defaultContainer = $(menuInfo.defaultContainer);
        defaultContainer = defaultContainer.length > 0 ? defaultContainer = $(defaultContainer[0]) : null;

        $("ul." + menuInfo.menuClass + ">li>ul").each(function () {
            var submenu = $(this);

            var submenuWidth = submenu.outerWidth(false);
            var submenuLeft = submenu.offset().left;

            var mainContainer = submenu.parents(menuInfo.container);
            mainContainer = mainContainer.length > 0 ? mainContainer = $(mainContainer[0]) : null;

            var container = mainContainer || defaultContainer;
            if (container !== null) {
                var containerLeft = container.offset().left;
                var containerWidth = container.outerWidth(false);

                if (submenuLeft + submenuWidth >= containerLeft + containerWidth) {
                    /* right to left */
                    submenu.addClass(menuInfo.rightToLeftClass).find("ul").addClass(menuInfo.rightToLeftClass);
                } else if (submenuLeft <= containerLeft) {
                    /* left to right */
                    submenu.addClass(menuInfo.leftToRightClass).find("ul").addClass(menuInfo.leftToRightClass);
                }
            }
        });
    });
})(jQuery);


var menuExtendedCreate = (function ($) {
    "use strict";
    return function () {
        var sheet = $(".SL-sheet");
        var sheetLeft = sheet.offset().left;
        var sheetWidth = sheet.width();
        // reset
        $("#SL-menu-style").remove();

        var styleStr = "";
        $("<style id=\"SL-menu-style\"></style>").appendTo('head');
        var style = document.styleSheets[document.styleSheets.length - 1];

        $(".SL-hmenu>li").each(function(i, v) {
            var itm = $(this);
            var subm = itm.children("ul");
            if (subm.length === 0) {
                return;
            }

            // reset
            itm.removeClass("ext ext-r ext-l");
            itm.css("width", "").find(".ext-off,.ext-m,.ext-l,.ext-r").remove();
            subm.children("li").children("a").css("width", "");

            var lw = 0, rw = 0;
        
            if (typeof subm.attr("data-ext-l") !== "undefined" && typeof subm.attr("data-ext-r") !== "undefined") {
                lw = parseInt(subm.attr("data-ext-l"), 10) + 6;
                rw = parseInt(subm.attr("data-ext-r"), 10) + 6;
                itm.addClass("ext-r").addClass("ext-l");
            } else {
                var ltr = !subm.hasClass("SL-hmenu-right-to-left");
                itm.addClass(ltr ? "ext-r" : "ext-l");
            }

            var shadow = 6;
            if (subm.length > 0) {
                var lnk = itm.children("a");
                var lnkWidth = lnk.outerWidth(false);
                itm.css("width", Math.round(parseFloat(lnkWidth, 10)) + "px");
                var menubarMargin = 0 * 2; // margin * 2 sides
                var menubarBorder = 1 * 2; // border 1 side
                var submWidth = subm.width() + shadow + menubarMargin + menubarBorder;
                var w = submWidth - lnkWidth;
                $("<div class=\"ext-m\"></div>").insertBefore(lnk);
                if (w < 0) {
                    var submA = subm.children("li").children("a");
                    var pL = parseInt(submA.css("padding-left").replace("px", ""), 10) || 0;
                    var pR = parseInt(submA.css("padding-right").replace("px", ""), 10) || 0;
                    var bL = parseInt(submA.css("border-left").replace("px", ""), 10) || 0;
                    var bR = parseInt(submA.css("border-right").replace("px", ""), 10) || 0;
                    subm.children("li").children("a").css("width", (lnkWidth - pL - pR - bL - bR) + "px");
                    submWidth = subm.width() + shadow + menubarMargin + menubarBorder;
                    w = submWidth - lnkWidth;
                }
                $("<div class=\"ext-l\" style=\"width: " + (lw > 0 ? lw : Math.round(parseFloat(w, 10))) + "px;\"></div>").insertBefore(lnk);
                $("<div class=\"ext-r\" style=\"width: " + (rw > 0 ? rw : Math.round(parseFloat(w, 10))) + "px;\"></div>").insertBefore(lnk);
                itm.addClass("ext");
                if (style !== null && typeof style.insertRule !== "undefined") {
                    var cls = "SL-hmenu-item-" + i;
                    var selector = ".desktop ul.SL-hmenu>li." + cls + ":hover>ul:before";
                    var r = submWidth;
                    var b = subm.height() + (shadow * 2) + menubarBorder + menubarMargin;
                    var rule = "clip: rect(8px, " + Math.round(parseFloat(r, 10)) + "px, " + Math.round(parseFloat(b, 10)) + "px, -" + shadow + "px);";
                    itm.addClass(cls);
                    var rulesLen = typeof style.cssRules === "undefined" || style.cssRules === null ? 0 : style.cssRules.length;
                    style.insertRule(selector + '{' + rule + '}', rulesLen);
                }
            }
        });
    };
})(jQuery);
jQuery(window).load(menuExtendedCreate);

jQuery(function($) {
    "use strict";
     $(window).bind("resize", function () {
        /*global responsiveDesign */
        "use strict";
        if (typeof responsiveDesign !== "undefined" && responsiveDesign.isResponsive)
            return;
        var sheetLeft = $(".SL-sheet").offset().left;
        $("header.SL-header #SL-flash-area").each(function () {
            var object = $(this);
            object.css("left", sheetLeft + "px");
        });
    });
});

jQuery(function ($) {
    'use strict';
    $(window).bind('resize', function () {
        var bh = $('body').height();
        var mh = 0;
        var c = $('div.SL-content');
        c.removeAttr('style');

        $('#SL-main').children().each(function() {
            if ($(this).css('position') !== 'absolute') {
                mh += $(this).outerHeight(true);
            }
        });
        
        if (mh < bh) {
            var r = bh - mh;
            c.css('height', (c.parent().outerHeight(true) + r) + 'px');
        }
    });

    if (browser.ie && browser.version < 8) {
        $(window).bind('resize', function() {
            var c = $('div.SL-content');
            var s = c.parent().children('.SL-layout-cell:not(.SL-content)');
            var w = 0;
            c.hide();
            s.each(function() { w += $(this).outerWidth(true); });
            c.w = c.parent().width(); c.css('width', c.w - w + 'px');
            c.show();
        });
    }

    $(window).trigger('resize');
});

var artButtonSetup = (function ($) {
    'use strict';
    return (function (className) {
        $.each($("a." + className + ", button." + className + ", input." + className), function (i, val) {
            var b = $(val);
            if (!b.hasClass('SL-button')) {
                b.addClass('SL-button');
            }
            if (b.is('input')) {
                b.val(b.val().replace(/^\s*/, '')).css('zoom', '1');
            }
            b.mousedown(function () {
                var b = $(this);
                b.addClass("active");
            });
            b.mouseup(function () {
                var b = $(this);
                if (b.hasClass('active')) {
                    b.removeClass('active');
                }
            });
            b.mouseleave(function () {
                var b = $(this);
                if (b.hasClass('active')) {
                    b.removeClass('active');
                }
            });
        });
    });
})(jQuery);
jQuery(function () {
    'use strict';
    artButtonSetup("SL-button");
});

jQuery(function($) {
    'use strict';
    $('input.SL-search-button, form.SL-search input[type="submit"]').attr('value', '');
});

var artRadioButtonSetup = (function ($) {
    "use strict";
    return (function (className) {
        $.each($('label.' + className), function (i, val) {
            var label = $(val),
                ctrl = new Control();
            ctrl.init(label, 'radio', artRadioButtonProcess);

            function artRadioButtonProcess() {
                var label = $(this),
                    radio = label.children('input[type="radio"]');
                if (radio.length === 0) {
                    return;
                }
                //turn off checked attribute from other radiobuttons and div-s
                $.each($(':radio[name="' + radio.attr('name') + '"]'), function () {
                    $(this).removeAttr('checked');
                    $(this).parent().removeClass('SL-checked');
                });
                radio.attr('checked', 'checked');
                label.addClass('SL-checked');
            }
        });
    });
})(jQuery);
jQuery(function () {
    "use strict";
    artRadioButtonSetup('SL-radiobutton');
});

var Control = (function ($) {
    'use strict';
    return (function () {
        this.init = function(label, type, callback) {
            var chAttr = label.find('input[type="' +type + '"]').attr('checked');
            if (chAttr === 'checked') {
              label.addClass('SL-checked');
            }

            label.mouseleave(function () {
              $(this).removeClass('hovered').removeClass('active');
            });
            label.mouseover(function () {
              $(this).addClass('hovered').removeClass('active');
            });
            label.mousedown(function (event) {
              if (event.which !== 1) {
                  return;
              }
              $(this).addClass('active').removeClass('hovered');
            });
            label.mouseup(function (event) {
              if (event.which !== 1) {
                  return;
              }
              callback.apply(this);
              $(this).removeClass('active').addClass('hovered');
            });
        };
    });
})(jQuery);

var artCheckBoxSetup = (function ($) {
    'use strict';
    return (function (className) {
        $.each($('label.' + className), function (i, val) {
            var label = $(val),
                ctrl = new Control();
            ctrl.init(label, 'checkbox', artCheckBoxProcess);

            function artCheckBoxProcess() {
                var label = $(this),
                    ch = label.children("input[type='checkbox']");
                if (ch.length) {
                  if (label.hasClass('SL-checked')) {
                    ch.removeAttr('checked');
                    label.removeClass('SL-checked');
                  }
                  else {
                    ch.attr('checked', 'checked');
                    label.addClass('SL-checked');
                  }
                  ch.click();
                }
            }
        });
    });
})(jQuery);
jQuery(function () {
    'use strict';
    artCheckBoxSetup('SL-checkbox');
});

jQuery(function ($) {
    'use strict';
    $('.SL-pager').contents().filter(
        function () {
            return this.nodeType === this.TEXT_NODE;
        }
    ).remove();
});
jQuery(function($) {
    "use strict";
    if (!$('html').hasClass('ie7')) {
        return;
    }
    $('ul.SL-vmenu li:not(:first-child),ul.SL-vmenu li li li:first-child,ul.SL-vmenu>li>ul').each(function () { $(this).append('<div class="SL-vmenu-separator"> </div><div class="SL-vmenu-separator-bg"> </div>'); });
});
jQuery(function() {
    "use strict";
    setOpenSubmenuWithHover({vMenuClass: "SL-vmenu", activeClass: "active", hoveredClass: "hovered"});
});

(function ($) {
    "use strict";
    $.fn.hoverIntent = function (f, g) {
        var cfg = {
            sensitivity: 7,
            interval: 100,
            timeout: 0
        };
        cfg = $.extend(cfg, g ? {
            over: f,
            out: g
        } : f);
        var cX, cY, pX, pY;
        var track = function (ev) {
                cX = ev.pageX;
                cY = ev.pageY
            };
        var compare = function (ev, ob) {
                ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
                if ((Math.abs(pX - cX) + Math.abs(pY - cY)) < cfg.sensitivity) {
                    $(ob).unbind("mousemove", track);
                    ob.hoverIntent_s = 1;
                    return cfg.over.apply(ob, [ev])
                } else {
                    pX = cX;
                    pY = cY;
                    ob.hoverIntent_t = setTimeout(function () {
                        compare(ev, ob)
                    }, cfg.interval)
                }
            };
        var delay = function (ev, ob) {
                ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t);
                ob.hoverIntent_s = 0;
                return cfg.out.apply(ob, [ev])
            };
        var handleHover = function (e) {
                var ev = $.extend({}, e);
                var ob = this;
                if (ob.hoverIntent_t) {
                    ob.hoverIntent_t = clearTimeout(ob.hoverIntent_t)
                }
                if (e.type == "mouseenter") {
                    pX = ev.pageX;
                    pY = ev.pageY;
                    $(ob).bind("mousemove", track);
                    if (ob.hoverIntent_s != 1) {
                        ob.hoverIntent_t = setTimeout(function () {
                            compare(ev, ob)
                        }, cfg.interval)
                    }
                } else {
                    $(ob).unbind("mousemove", track);
                    if (ob.hoverIntent_s == 1) {
                        ob.hoverIntent_t = setTimeout(function () {
                            delay(ev, ob)
                        }, cfg.timeout)
                    }
                }
            };
        return this.bind('mouseenter', handleHover).bind('mouseleave', handleHover)
    }
})(jQuery);

var setOpenSubmenuWithHover = (function ($) {
    "use strict";
    return (function(vMenuInfo) {
        $("ul." + vMenuInfo.vMenuClass + " li").each(function () {
            var item = $(this);
            var simple = item.children("ul").length === 0;
            if (!simple) {
                item.children("a").hoverIntent({interval: 200, over: function() {
                    var link = $(this);
                    hideVMenuSubmenus(link, vMenuInfo.activeClass);
                    showVMenuSubmenu(link, vMenuInfo.activeClass, vMenuInfo.hoveredClass, false);
                }, out: function () { }});
            }
            item.children("a").bind("click", function(e) {
                var link = $(this);
                hideVMenuSubmenus(link, vMenuInfo.activeClass);
                showVMenuSubmenu(link, vMenuInfo.activeClass, vMenuInfo.hoveredClass, simple);
            });
        });
    });
})(jQuery);

var showVMenuSubmenu = (function ($) {
    "use strict";
    return (function(link, activeClass, hoveredClass, simple) {
        if (simple) {
            if (!link.hasClass(activeClass)) {
                link.addClass(activeClass);
            }
            return;
        }
        if (!link.hasClass(activeClass)) {
            link.siblings("ul").slideDown("fast", function() {
                $(this).siblings("a").removeClass(hoveredClass);
                $(this).addClass(activeClass).siblings("a").addClass(activeClass);
                $(this).css("display", "");
            });
        }
    });
})(jQuery);

var hideVMenuSubmenus = (function ($) {
    "use strict";
    return (function(link, activeClass) {
        link.parent().siblings().children("ul." + activeClass).slideUp(function() {
            $(this).find("a, ul").removeClass(activeClass);
            $(this).removeClass(activeClass).siblings("a").removeClass(activeClass);
            $(this).css("display", "");
        });
        link.parent().siblings().children("a." + activeClass).removeClass(activeClass);
    });
})(jQuery);


var fixRssIconLineHeight = (function ($) {
    "use strict";
    return function (className) {
        $("." + className).css("line-height", $("." + className).height() + "px");
    };
})(jQuery);

jQuery(function ($) {
    "use strict";
    var rssIcons = $(".SL-rss-tag-icon");
    if (rssIcons.length){
        fixRssIconLineHeight("SL-rss-tag-icon");
        if (browser.ie && browser.version < 9) {
            rssIcons.each(function () {
                if ($.trim($(this).html()) === "") {
                    $(this).css("vertical-align", "middle");
                }
            });
        }
    }
});
var ThemeLightbox = (function ($) {
    'use strict';
    return (function () {
        var images = $(".SL-lightbox");
        var current;
        this.init = function (ctrl) {
            $(".SL-lightbox").mouseup({ _ctrl: ctrl }, function (e) {
                if ((e.data._ctrl === true && !e.ctrlKey) || (e.which && e.which !== 1)) {
                    return;
                }

                images = $(".SL-lightbox");

                current = images.index(this);

                var imgContainer = $('.SL-lightbox-wrapper');
                if (imgContainer.length === 0) {
                    imgContainer = $('<div class="SL-lightbox-wrapper">').css('line-height', $(window).height() + "px")
                    .appendTo($("body"));

                    var closeBtn = $('<div class="close"><div class="cw"> </div><div class="ccw"> </div><div class="close-alt">&#10007;</div></div>')
                .click(close);
                    closeBtn.appendTo(imgContainer);
                    showArrows();
                }

                move(current);
            });
        };

        function move(index) {
            if (index < 0 || index >= images.length) {
                return;
            }

            showError(false);

            current = index;

            $(".SL-lightbox-wrapper .SL-lightbox-image:not(.active)").remove();

            var active = $(".SL-lightbox-wrapper .active");
            var target = $('<img class="SL-lightbox-image" alt="" src="' + getFullImgSrc($(images[current]).attr("src")) + '" />').click(function () {
                if ($(this).hasClass("active")) {
                    move(current + 1);
                }
            });

            if (active.length > 0) {
                active.after(target);
            } else {
                $(".SL-lightbox-wrapper").append(target);
            }

            showArrows();
            showLoader(true);

            bindMouse($(".SL-lightbox-wrapper").add(target));

            target.load(function () {
                showLoader(false);

                active.removeClass("active");
                target.addClass("active");
            });

            target.error(function () {
                showLoader(false);
                active.removeClass("active");
                target.addClass("active");
                target.attr("src", $(images[current]).attr("src"));
            });
        }

        function showArrows() {
            if ($(".SL-lightbox-wrapper .arrow").length === 0) {
                $(".SL-lightbox-wrapper").append(
                    $('<div class="arrow left"><div class="arrow-t ccw"> </div><div class="arrow-b cw"> </div><div class="arrow-left-alt">&#8592;</div></div>')
                        .css("top", $(window).height() / 2 - 40)
                        .click(function () {
                            if (!$(this).hasClass("disabled")) {
                                move(current - 1);
                            }
                        })
                );
                $(".SL-lightbox-wrapper").append(
                    $('<div class="arrow right"><div class="arrow-t cw"> </div><div class="arrow-b ccw"> </div><div class="arrow-right-alt">&#8594;</div></div>')
                        .css("top", $(window).height() / 2 - 40)
                        .click(function () {
                            if (!$(this).hasClass("disabled")) {
                                move(current + 1);
                            }
                        })
                );
            }

            if (current === 0) {
                $(".SL-lightbox-wrapper .arrow.left").addClass("disabled");
            } else {
                $(".SL-lightbox-wrapper .arrow.left").removeClass("disabled");
            }

            if (current === images.length - 1) {
                $(".SL-lightbox-wrapper .arrow.right").addClass("disabled");
            } else {
                $(".SL-lightbox-wrapper .arrow.right").removeClass("disabled");
            }
        }

        function showError(enable) {
            if (enable) {
                $(".SL-lightbox-wrapper").append($('<div class="lightbox-error">The requested content cannot be loaded.<br/>Please try again later.</div>')
                        .css({ "top": $(window).height() / 2 - 60, "left": $(window).width() / 2 - 170 }));
            } else {
                $(".SL-lightbox-wrapper .lightbox-error").remove();
            }
        }

        function showLoader(enable) {
            if (!enable) {
                $(".SL-lightbox-wrapper .loading").remove();
            }
            else {
                $('<div class="loading"> </div>').css({ "top": $(window).height() / 2 - 16, "left": $(window).width() / 2 - 16 }).appendTo($(".SL-lightbox-wrapper"));
            }
        }

        var close = function () {
            $(".SL-lightbox-wrapper").remove();
        };

        function bindMouse(img) {
            img.bind('mousewheel DOMMouseScroll', function (e) {
                var orgEvent = window.event || e.originalEvent;
                var delta = (orgEvent.wheelDelta ? orgEvent.wheelDelta : orgEvent.detail * -1) > 0 ? 1 : -1;
                move(current + delta);
                e.preventDefault();
            }).mousedown(function (e) {
                // close on middle button click
                if (e.which === 2) {
                    close();
                }
                e.preventDefault();
            });
        }

        function getFullImgSrc(src) {
            var fileName = src.substring(0, src.lastIndexOf('.'));
            var ext = src.substring(src.lastIndexOf('.'));
            return fileName + "-large" + ext;
        }

    });
})(jQuery);

jQuery(function () {
    'use strict';
    new ThemeLightbox().init();
});

(function ($) {
    'use strict';
    // transition && transitionEnd && browser prefix
    $.support.themeTransition = (function () {
        var thisBody = document.body || document.documentElement,
            thisStyle = thisBody.style,
            support = thisStyle.transition !== undefined ||
                thisStyle.WebkitTransition !== undefined ||
                thisStyle.MozTransition !== undefined ||
                thisStyle.MsTransition !== undefined ||
                thisStyle.OTransition !== undefined;
        return support && {
            event: (function () {
                return "transitionend webkitTransitionEnd otransitionend oTransitionEnd";
            })(),
            prefix: (function () {
                return ({
                    opera: "-o-",
                    firefox: "-moz-",
                    chrome: "-webkit-",
                    safari: "-webkit-",
                    ie: ""
                }[browser.name] || "");
            })()
        };
    })();

    window.BackgroundHelper = function () {
        var slides = [];
        var direction = "next";
        var motion = "horizontal";
        var width = 0;
        var height = 0;
        var multiplier = 1;
        var originalWidth = 0;
        var originalHeight = 0;
        var transitionDuration = "";

        this.init = function (motionType, dir, duration) {
            direction = dir;
            motion = motionType;
            slides = [];
            width = 0;
            height = 0;
            multiplier = 1;
            originalWidth = 0;
            originalHeight = 0;
            transitionDuration = duration;
        };

        this.processSlide = function (element, modify) {
            this.updateSize(element, null);
            var pos = [];

            var bgPosition = element.css("background-position");
            var positions = bgPosition.split(",");
            $.each(positions, function (i) {
                var position = $.trim(this);
                var point = position.split(" ");
                var zeroValue = browser.ie && browser.version >= 10 ? 0.1 : 0;
                if (point.length > 1) {
                    var x = point[0].indexOf('%') === -1 ? parseFloat(point[0], 10) : zeroValue;
                    var y = point[1].indexOf('%') === -1 ? parseFloat(point[1], 10) : zeroValue;
                    pos.push({ x: x, y: y });
                } else {
                    pos.push({ x: zeroValue, y: zeroValue });
                }
            });

            slides.push({
                "images": element.css("background-image"),
                "sizes": element.css("background-size"),
                "positions": pos
            });

            if (modify)
                element.css("background-image", "none");
        };

        this.updateSize = function (element, initialSize) {
            width = element.outerWidth(false);
            height = element.outerHeight();
            if (initialSize && parseInt(initialSize.width, 10) !== 0) {
                originalWidth = parseInt(initialSize.width, 10);
                originalHeight = parseInt(initialSize.height, 10);
                if (motion === "fade") {
                    $.each(element.children(), function (i) {
                        $(this).css("background-position", getCssPositions(slides[i].positions, { x: 0, y: 0 }));
                    });
                }
            }
        };

        this.setBackground = function (element, items) {
            var bg = [];
            var sizes = [];
            $.each(items, function (i, o) {
                bg.push(o.images);
                sizes.push(o.sizes);
            });
            element.css({
                "background-image": bg.join(", "),
                //"background-size": sizes.join(", "),
                "background-repeat": "no-repeat"
            });
        };

        this.setPosition = function (element, items) {
            var pos = [];
            $.each(items, function (i, o) {
                pos.push(o.positions);
            });
            element.css({
                "background-position": pos.join(", ")
            });
        };

        this.current = function (index) {
            return slides[index] || null;
        };

        this.next = function (index) {
            var next;
            if (direction === "next") {
                next = (index + 1) % slides.length;
            } else {
                next = index - 1;
                if (next < 0) {
                    next = slides.length - 1;
                }
            }
            return slides[next];
        };

        this.items = function (prev, next, move) {
            var prevItem = { x: 0, y: 0 };
            var nextItem = { x: 0, y: 0 };
            var isDirectionNext = direction === "next";
            var verticalOffset = -(originalHeight - height) / 2;
            var horizontalOffset = -(originalWidth - width) / 2;
            if (motion === "horizontal") {
                prevItem.y = nextItem.y = -(originalHeight - height) / 2;
                prevItem.x = horizontalOffset;
                nextItem.x = (isDirectionNext ? originalWidth : -originalWidth) + horizontalOffset;
                if (move) {
                    prevItem.x += isDirectionNext ? -originalWidth : originalWidth;
                    nextItem.x += isDirectionNext ? -originalWidth : originalWidth;
                }
            } else if (motion === "vertical") {
                prevItem.x = nextItem.x = horizontalOffset;
                prevItem.y = verticalOffset;
                nextItem.y = (isDirectionNext ? originalHeight : -originalHeight) + verticalOffset;
                if (move) {
                    prevItem.y += isDirectionNext ? -originalHeight : originalHeight;
                    nextItem.y += isDirectionNext ? -originalHeight : originalHeight;
                }
            }
            var result = [];
            if (!!prev) {
                result.push({ images: prev.images, positions: getCssPositions(prev.positions, prevItem), sizes: prev.sizes });
            }
            if (!!next) {
                result.push({ images: next.images, positions: getCssPositions(next.positions, nextItem), sizes: next.sizes });
            }

            if (direction === "next") {
                result.reverse();
            }

            return result;
        };

        this.transition = function (container, on) {
            container.css($.support.themeTransition.prefix + "transition", on ? "background-position " + transitionDuration + " ease-in-out" : "");
        };

        function getCssPositions(positions, offset) {
            var result = [];
            if (positions === undefined) {
                return "";
            }
            offset.x = offset.x || 0;
            offset.y = offset.y || 0;
            for (var i = 0; i < positions.length; i++) {
                result.push((positions[i].x * 1 + offset.x) + "px " + (positions[i].y * 1 + offset.y) + "px");
            }
            return result.join(", ");
        }
    };


    var ThemeSlider = function (element, settings) {

        var interval = null;
        var active = false;
        var children = element.find(".active").parent().children();
        var last = false;
        var running = false;

        this.settings = $.extend({}, {
            "animation": "horizontal",
            "direction": "next",
            "speed": 600,
            "pause": 2500,
            "auto": true,
            "repeat": true,
            "navigator": null,
            "clickevents": true,
            "hover": true,
            "helper": null
        }, settings);

        this.move = function (direction, next) {
            var activeItem = element.find(".active"),
                nextItem = next || activeItem[direction](),
                innerDirection = this.settings.direction === "next" ? "forward" : "back",
                reset = direction === "next" ? "first" : "last",
                moving = interval,
                slider = this, tmp;

            active = true;

            if (moving) { this.stop(true); }

            if (!nextItem.length) {
                nextItem = element.find(".SL-slide-item")[reset]();
                if (!this.settings.repeat) { last = true; active = false; return; }
            }

            if ($.support.themeTransition) {
                nextItem.addClass(this.settings.direction);
                tmp = nextItem.get(0).offsetHeight;

                activeItem.addClass(innerDirection);
                nextItem.addClass(innerDirection);

                element.trigger("beforeSlide", children.length);

                element.one($.support.themeTransition.event, function () {
                    nextItem.removeClass(slider.settings.direction)
                        .removeClass(innerDirection)
                        .addClass("active");
                    activeItem.removeClass("active")
                        .removeClass(innerDirection);
                    active = false;
                    setTimeout(function () {
                        element.trigger("afterSlide", children.length);
                    }, 0);
                });
            } else {
                element.trigger("beforeSlide", children.length);

                activeItem.removeClass("active");
                nextItem.addClass("active");
                active = false;

                element.trigger("afterSlide", children.length);
            }

            this.navigate(nextItem);

            if (moving) { this.start(); }
        };

        this.navigate = function (position) {
            var index = children.index(position);
            $(this.settings.navigator).children().removeClass("active").eq(index).addClass("active");
        };

        this.to = function (index) {
            var activeItem = element.find(".active"),
                children = activeItem.parent().children(),
                activeIndex = children.index(activeItem),
                slider = this;

            if (index > (children.length - 1) || index < 0) {
                return;
            }

            if (active) {
                return element.one("afterSlide", function () {
                    slider.to(index);
                });
            }

            if (activeIndex === index) {
                return;
            }

            this.move(index > activeIndex ? "next" : "prev", $(children[index]));
        };

        this.next = function () {
            if (!active) {
                if (last) { this.stop(); return; }
                this.move("next");
            }
        };

        this.prev = function () {
            if (!active) {
                if (last) { this.stop(); return; }
                this.move("prev");
            }
        };

        this.start = function (force) {
            if (!!force) {
                setTimeout($.proxy(this.next, this), 10);
            }
            interval = setInterval($.proxy(this.next, this), this.settings.pause);
            running = true;
        };

        this.stop = function (pause) {
            clearInterval(interval);
            interval = null;
            running = !!pause;
            active = false;
        };

        this.active = function () {
            return running;
        };

        this.moving = function () {
            return active;
        };

        this.navigate(children.filter(".active"));

        if (this.settings.clickevents) {
            $(this.settings.navigator).on("click", "a", { slider: this }, function (event) {
                var activeIndex = children.index(children.filter(".active"));
                var index = $(this).parent().children().index($(this));
                if (activeIndex !== index) {
                    event.data.slider.to(index);
                }
                event.preventDefault();
            });
        }

        if (this.settings.hover) {
            var slider = this;
            element.add(this.settings.navigator)
                   .add(element.siblings(".SL-shapes")).hover(function () {
                       if (element.is(":visible") && !last) { slider.stop(true); }
                   }, function () {
                       if (element.is(":visible") && !last) { slider.start(); }
                   });
        }
    };

    $.fn.themeSlider = function (arg) {
        return this.each(function () {
            var element = $(this),
                data = element.data("slider"),
                options = typeof arg === "object" && arg;

            if (!data) {
                data = new ThemeSlider(element, options);
                element.data("slider", data);
            }

            if (typeof arg === "string" && data[arg]) {
                data[arg]();
            } else if (data.settings.auto && element.is(":visible")) {
                data.start();
            }
        });
    };

})(jQuery);




if (typeof window.resizeData === 'undefined') window.resizeData = {};
window.resizeData.headerPageWidth = false;
if (typeof window.defaultResponsiveData === 'undefined') window.defaultResponsiveData = [false, true, true, true, true, ];

// used to apply compicated values in style like '!important!
function applyCss(object, param, value) {
    var rg = new RegExp(param + '\s*:\s*[^;]+;', "i");
    var style = object.attr('style');
    var str = param + ': ' + value + ';';
    if (rg.test(style)) {
        style = style.replace(rg, str);
    }
    else {
        style += '; ' + str;
    }

    object.attr('style', style);
}

// convert universal coord to pixels
function uniToPx(uni, size, parentSize) {
    uni = parseFloat(uni || '0');
    if (uni < 0) {
        uni = uni * size;
    } else if (uni >= 1) {
        uni = parentSize - (2 - uni) * size;
    } else {
        uni = uni * (parentSize - size);
    }

    return uni;
}

function isContentSlider(object) {
    var isHeader = object.parents('header').length > 0;
    if (isHeader) {
        return false;
    }
    var isPageSlider = object.parents('.SL-pageslider').length > 0;
    if (isPageSlider)
        return false;

    return true;
}

function sheetLeftFunc(sheet, object) {
    var sheetLeft = sheet.offset().left;

    var isHeader = object.parents('header').length > 0;
    if (isHeader) {
        if (resizeData.headerPageWidth) return sheetLeft;
    } else {
        var isPageSlider = object.parents('.SL-pageslider').length > 0;
        if (isPageSlider) {
            if (resizeData.pageSliderPageWidth) return sheetLeft;
        }
    }

    return 0;
}

var headerObjectResizer = {
    
    postInit: false,

    resize: (function ($) {
        'use strict';
        return function () {
            if (!headerObjectResizer.postInit && typeof responsiveDesign !== 'undefined') {
                $(window).on('responsiveResize', headerObjectResizer.resize);
                headerObjectResizer.postInit = true;
            }

            var responsiveType = 0;
            // if we don't use full custom responsive so we MUST cleanup all styles
            var cleanUpStyles = false;
            // when use default respo so while in desktop mode always use 0-type, in other case cleanup our styles
            if (typeof responsiveDesign !== 'undefined' && 
                    defaultResponsiveData[responsiveDesign.responsiveTypeIdx] &&
                    responsiveDesign.isResponsive) {
                cleanUpStyles = true;
            }

            if (typeof responsiveDesign !== 'undefined') {
                if (responsiveDesign.responsiveType === 'tabletlandscape') {
                    responsiveType = 1;
                } else if (responsiveDesign.responsiveType === 'tabletportrait') {
                    responsiveType = 2;
                } else if (responsiveDesign.responsiveType === 'phonelandscape') {
                    responsiveType = 3;
                } else if (responsiveDesign.responsiveType === 'phoneportrait') {
                    responsiveType = 4;
                }
            }

            var sheet = $('.SL-sheet');
            var sheetWidth = sheet.outerWidth();

            var header = $('header');
            var height = 0;
            var cssPrefix = 'SL-';

            // move html shapes
            var headerQuery = 'header.SL-header .SL-shapes>*, header.SL-header .SL-textblock, header.SL-header>.SL-headline, header.SL-header>.SL-slogan, header.SL-header>.SL-positioncontrol, header.SL-header>.SL-logo';
            var pageSliderQuery = '.SL-pageslider .SL-slide-item>*';
            if (headerObjectResizer.isPreview) {
                headerQuery = 'header .SL-slider';
                pageSliderQuery = '.SL-pageslider .SL-slider, .SL-pageslider .SL-textblock';
            }
            $(headerQuery + ', ' + pageSliderQuery).each(function () {
                var object = $(this);
                height = object.parent().height();

                var off = sheetLeftFunc(sheet, object);

                var cls = object.attr('class').split(' ');
                $.each(cls, function (key, val) {
                    val = $.trim(val);
                    if (val.length === 0) return;
                    if (val.indexOf(cssPrefix) !== 0) return;

                    val = val.substring(cssPrefix.length);
                    var data = resizeData[val];
                    if (typeof data === 'undefined') return;

                    if (cleanUpStyles) {
                        object.css('display', '');
                        object.css('left', '');
                        object.css('margin-left', '');
                    }

                    var respData = data.responsive[responsiveType];
                    if (respData.visible) {
                        object.css('display', '');
                    } else {
                        applyCss(object, 'display', 'none !important');
                    }

                    if (cleanUpStyles || !respData.visible) return false;

                    var x = uniToPx(respData.left, data.autoWidth ? object.width() : data.width, sheetWidth);
                    x += off;

                    var y = uniToPx(respData.top, data.height, height);

                    object.css('left', x + 'px');
                    object.css('top', y + 'px');
                    applyCss(object, 'margin-left', '0px !important');
                    return false;
                });
            });

            // move images in slide's background-images
            var slides = $('.SL-slide-item').add(header);
            if (browser.ie && browser.version <= 8) {
                slides = slides.add('.SL-slide-item .ie8fix');
            }
            $.each(slides, function (slideIdx, slide) {
                slide = $(slide);

                if (slide.closest('.SL-collage').length > 0 || cleanUpStyles) {
                    slide.css('background-position', '');
                    return;
                }

                var slideVisible = slide.is(':visible');
                if (!slideVisible && browser.ie) {
                    slide.css('display', 'block');
                }

                var off = sheetLeftFunc(sheet, slide);

                if (browser.ie && browser.version <= 8) {
                    var s = slide.attr('style');
                    if (s) {
                        s = s.replace(/background\-position[^;]+/, '');
                        slide.attr('style', s);
                    }
                } else {
                    slide.css('background-position', '');
                }
                slide.css('background-size', '');

                var bgImage = slide.css('background-image') ? slide.css('background-image').split(',') : [];
                var bgPosition = slide.css('background-position') && (slide.css('background-position').replace(/[0][^\d]+/gi, '')).length > 0 ?
                    slide.css('background-position').split(',') :
                    [];
                if (bgImage.length !== bgPosition.length) {
                    slide.css('display', '');
                    return;
                }

                height = slide.height();
                if (height === 0) height = slide.parent().height();

                $.each(bgImage, function (idx, val) {
                    var findImageIdx = val.lastIndexOf('images/');
                    var findDotIdx = val.lastIndexOf('.');
                    if (findImageIdx === -1 || findDotIdx === -1) return;

                    var name = val.substring(findImageIdx + 7, findDotIdx);

                    var data = resizeData[name];
                    if (typeof data === 'undefined') return;

                    var respData = data.responsive[responsiveType];
                    // big default coordinates for hiding
                    var x = 9999, y = 9999;
                    if (respData.visible) {
                        x = uniToPx(respData.left, data.width, sheetWidth);
                        x += off + data.area.x;

                        y = uniToPx(respData.top, data.height, height);
                        y += data.area.y;
                    }

                    bgPosition[idx] = x + 'px ' + y + 'px';
                });

                slide.css('background-position', bgPosition.join(','));

                if (!slideVisible && browser.ie) {
                    slide.css('display', '');
                }
            });

        };
    })(jQuery),

    initialize: function ($) {
        if (!browser.ie || browser.version > 8) {
            $(window).on('resize', this.resize);
        } else {
            var resizeTimeout;
            var self = this;
            $(window).on("resize", function () {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(function () { self.resize(); }, 25);
            });
        }
    }
};

headerObjectResizer.initialize(jQuery);
jQuery(function ($) {
    "use strict";
    if (!browser.ie || browser.version > 8)
        return;
    processElementMultiplyBg(".SL-header", {
        "bgimage": "url('images/header.png')",
        "bgposition": "0 0",
        "images": "",
        "positions": ""
    });
});
if (typeof window.resizeData === 'undefined') window.resizeData = {};

window.resizeData.pageSliderPageWidth = false;


jQuery(function ($) {
    'use strict';
    artButtonSetup("button");
    
    var indexURL = $('link[rel="home"]').attr('href');
    var iframeTagPart = ['<iframe frameBorder="0" allowtransparency="true" ' , 'background-color:transparent;filter:progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0);"></iframe>'];
    if(indexURL && $('header.clickable').length) {
        if($('#SL-header-bg').length) {
            $('header').append(
                (browser.ie ? iframeTagPart[0] + 'style="position:absolute;height:100%;width:40000px;left:-20000px;' + iframeTagPart[1] : '' ) +
                '<a style="position:absolute;height:100%;width:40000px;left:-20000px;top:0px;z-index:99;" href="' + indexURL + '"></a>');
        } else {
            $('header').append(
                (browser.ie ? iframeTagPart[0] + 'style="position:absolute;height:100%;width:100%;' + iframeTagPart[1] : '' ) +
                '<a style="position:absolute;height:100%;width:100%;outline:" href="' + indexURL + '"></a>');
        }
    }
});
