/*
 * jQuery spritely 0.6.4
 * http://spritely.net/
 *
 * Documentation:
 * http://spritely.net/documentation/
 *
 * Copyright 2010-2011, Peter Chater, Artlogic Media Ltd, http://www.artlogic.net/
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 */

(function($) {
    $._spritely = {
        /* shared methods and variables used by spritely plugin */
        animate: function(options) {
            var el = $(options.el);
            var el_id = el.attr('id');
            if (!$._spritely.instances[el_id]) {
                return this;
            }
            options = $.extend(options, $._spritely.instances[el_id] || {});
            if (options.play_frames && !$._spritely.instances[el_id]['remaining_frames']) {
                $._spritely.instances[el_id]['remaining_frames'] = options.play_frames + 1;
            }
            if (options.type == 'sprite' && options.fps) {
                var frames;
                var animate = function(el) {
                    var w = options.width, h = options.height;
                    if (!frames) {
                        frames = [];
                        total = 0
                        for (var i = 0; i < options.no_of_frames; i ++) {
                            frames[frames.length] = (0 - total);
                            total += w;
                        }
                    }
                    if ($._spritely.instances[el_id]['current_frame'] == 0) {
                        if (options.on_first_frame) {
                            options.on_first_frame(el);
                        }
                    } else if ($._spritely.instances[el_id]['current_frame'] == frames.length - 1) {
                        if (options.on_last_frame) {
                            options.on_last_frame(el);
                        }
                    }
                    if (options.on_frame && options.on_frame[$._spritely.instances[el_id]['current_frame']]) {
                        options.on_frame[$._spritely.instances[el_id]['current_frame']](el);
                    }
                    if (options.rewind == true) {
                        if ($._spritely.instances[el_id]['current_frame'] <= 0) {
                            $._spritely.instances[el_id]['current_frame'] = frames.length - 1;
                        } else {
                            $._spritely.instances[el_id]['current_frame'] = $._spritely.instances[el_id]['current_frame'] - 1;
                        };
                    } else {
                        if ($._spritely.instances[el_id]['current_frame'] >= frames.length - 1) {
                            $._spritely.instances[el_id]['current_frame'] = 0;
                        } else {
                            $._spritely.instances[el_id]['current_frame'] = $._spritely.instances[el_id]['current_frame'] + 1;
                        }
                    }

                    var yPos = $._spritely.getBgY(el);
                    el.css('background-position', frames[$._spritely.instances[el_id]['current_frame']] + 'px ' + yPos);
                    if (options.bounce && options.bounce[0] > 0 && options.bounce[1] > 0) {
                        var ud = options.bounce[0]; 
                        var lr = options.bounce[1]; 
                        var ms = options.bounce[2]; 
                        el
                            .animate({top: '+=' + ud + 'px', left: '-=' + lr + 'px'}, ms)
                            .animate({top: '-=' + ud + 'px', left: '+=' + lr + 'px'}, ms);
                    }
                }
                if ($._spritely.instances[el_id]['remaining_frames'] && $._spritely.instances[el_id]['remaining_frames'] > 0) {
                    $._spritely.instances[el_id]['remaining_frames'] --;
                    if ($._spritely.instances[el_id]['remaining_frames'] == 0) {
                        $._spritely.instances[el_id]['remaining_frames'] = -1;
                        delete $._spritely.instances[el_id]['remaining_frames'];
                        return this;
                    } else {
                        animate(el);
                    }
                } else if ($._spritely.instances[el_id]['remaining_frames'] != -1) {
                    animate(el);
                }
            } else if (options.type == 'pan') {
                if (!$._spritely.instances[el_id]['_stopped']) {

                    
                    var speed = options.speed || 1;

                    switch (options.dir) {

                        case 'up':
                            speed *= -1;
                        case 'down':
                            if (!$._spritely.instances[el_id]['l'])
                                $._spritely.instances[el_id]['l'] = $._spritely.getBgX(el).replace('px', '');
                            $._spritely.instances[el_id]['t'] = ($._spritely.instances[el_id]['t'] + speed) || 0;
                            if (options.img_height)
                                $._spritely.instances[el_id]['t'] %= options.img_height;
                            break;

                        case 'left':
                            speed *= -1;
                        case 'right':
                            if (!$._spritely.instances[el_id]['t'])
                                $._spritely.instances[el_id]['t'] = $._spritely.getBgY(el).replace('px', '');
                            $._spritely.instances[el_id]['l'] = ($._spritely.instances[el_id]['l'] + speed) || 0;
                            if (options.img_width)
                                $._spritely.instances[el_id]['l'] %= options.img_width;
                            break;
                    }

                   
                    var bg_left = $._spritely.instances[el_id]['l'].toString();
                    if (bg_left.indexOf('%') == -1) {
                        bg_left += 'px ';
                    } else {
                        bg_left += ' ';
                    }

                    var bg_top = $._spritely.instances[el_id]['t'].toString();
                    if (bg_top.indexOf('%') == -1) {
                        bg_top += 'px ';
                    } else {
                        bg_top += ' ';
                    }

                    $(el).css('background-position', bg_left + bg_top);
                }
            }
            $._spritely.instances[el_id]['options'] = options;
            $._spritely.instances[el_id]['timeout'] = window.setTimeout(function() {
                $._spritely.animate(options);
            }, parseInt(1000 / options.fps));
        },
        randomIntBetween: function(lower, higher) {
            return parseInt(rand_no = Math.floor((higher - (lower - 1)) * Math.random()) + lower);
        },
        getBgUseXY: (function() {
            try {
                return typeof $('body').css('background-position-x') == 'string';
            } catch(e) {
                return false;
            }
        })(),
        getBgY: function(el) {
            if ($._spritely.getBgUseXY) {
                return $(el).css('background-position-y') || '0';
            } else {
                return ($(el).css('background-position') || ' ').split(' ')[1];
            }
        },
        getBgX: function(el) {
            if ($._spritely.getBgUseXY) {
                return $(el).css('background-position-x') || '0';
            } else {
                return ($(el).css('background-position') || ' ').split(' ')[0];
            }
        },
        get_rel_pos: function(pos, w) {
            
            var r = pos;
            if (pos < 0) {
                while (r < 0) {
                    r += w;
                }
            } else {
                while (r > w) {
                    r -= w;
                }
            }
            return r;
        },

        _spStrip: function(s, chars) {
            
            return '';
        }
    };
    $.fn.extend({

        spritely: function(options) {

            var $this = $(this),
                el_id = $this.attr('id'),
                background_image = (new Image()),
                background_image_src = $._spritely._spStrip($this.css('background-image'), 'url("); ');

            options = $.extend({
                    type: 'sprite',
                    do_once: false,
                    width: null,
                    height: null,
                    img_width: 0,
                    img_height: 0,
                    fps: 12,
                    no_of_frames: 2,
                    stop_after: null
                }, options || {});

            background_image.onload = function() {
                options.img_width = background_image.width;
                options.img_height = background_image.height;
            }

            background_image.src = background_image_src;

            options.img = background_image;

            if (!$._spritely.instances) {
                $._spritely.instances = {};
            }

            if (!$._spritely.instances[el_id]) {
                if (options.start_at_frame) {
                    $._spritely.instances[el_id] = {current_frame: options.start_at_frame - 1};
                } else {
                    $._spritely.instances[el_id] = {current_frame: -1};
                }
            }

            $._spritely.instances[el_id]['type'] = options.type;
            $._spritely.instances[el_id]['depth'] = options.depth;

            options.el = this;
            options.width = options.width || $this.width() || 100;
            options.height = options.height || $this.height() || 100;

            var get_rate = function() {
                return parseInt(1000 / options.fps);
            }

            if (!options.do_once) {
                setTimeout(function() {
                    $._spritely.animate(options);
                }, get_rate(options.fps));
            } else {
                setTimeout(function() {
                    $._spritely.animate(options);
                }, 0);
            }

            return this;

        },

        sprite: function(options) {
            var options = $.extend({
                type: 'sprite',
                bounce: [0, 0, 1000] 
            }, options || {});
            return $(this).spritely(options);
        },
        pan: function(options) {
            var options = $.extend({
                type: 'pan',
                dir: 'left',
                continuous: true,
                speed: 1 
            }, options || {});
            return $(this).spritely(options);
        },
        flyToTap: function(options) {
            var options = $.extend({
                el_to_move: null,
                type: 'moveToTap',
                ms: 1000, 
                do_once: true
            }, options || {});
            if (options.el_to_move) {
                $(options.el_to_move).active();
            }
            if ($._spritely.activeSprite) {
                if (window.Touch) { 
                    $(this)[0].ontouchstart = function(e) {
                        var el_to_move = $._spritely.activeSprite;
                        var touch = e.touches[0];
                        var t = touch.pageY - (el_to_move.height() / 2);
                        var l = touch.pageX - (el_to_move.width() / 2);
                        el_to_move.animate({
                            top: t + 'px',
                            left: l + 'px'
                        }, 1000);
                    };
                } else {
                    $(this).click(function(e) {
                        var el_to_move = $._spritely.activeSprite;
                        $(el_to_move).stop(true);
                        var w = el_to_move.width();
                        var h = el_to_move.height();
                        var l = e.pageX - (w / 2);
                        var t = e.pageY - (h / 2);
                        el_to_move.animate({
                            top: t + 'px',
                            left: l + 'px'
                        }, 1000);
                    });
                }
            }
            return this;
        },
        
        isDraggable: function(options) {
            if ((!$(this).draggable)) {
                
                return this;
            }
            var options = $.extend({
                type: 'isDraggable',
                start: null,
                stop: null,
                drag: null
            }, options || {});
            var el_id = $(this).attr('id');
            if (!$._spritely.instances[el_id]) {
                return this;
            }
            $._spritely.instances[el_id].isDraggableOptions = options;
            $(this).draggable({
                start: function() {
                    var el_id = $(this).attr('id');
                    $._spritely.instances[el_id].stop_random = true;
                    $(this).stop(true);
                    if ($._spritely.instances[el_id].isDraggableOptions.start) {
                        $._spritely.instances[el_id].isDraggableOptions.start(this);
                    }
                },
                drag: options.drag,
                stop: function() {
                    var el_id = $(this).attr('id');
                    $._spritely.instances[el_id].stop_random = false;
                    if ($._spritely.instances[el_id].isDraggableOptions.stop) {
                        $._spritely.instances[el_id].isDraggableOptions.stop(this);
                    }
                }
            });
            return this;
        },
        active: function() {
            
            $._spritely.activeSprite = this;
            return this;
        },
        activeOnClick: function() {
            
            var el = $(this);
            if (window.Touch) { 
                el[0].ontouchstart = function(e) {
                    $._spritely.activeSprite = el;
                };
            } else {
                el.click(function(e) {
                    $._spritely.activeSprite = el;
                });
            }
            return this;
        },
        spRandom: function(options) {
            var options = $.extend({
                top: 50,
                left: 50,
                right: 290,
                bottom: 320,
                speed: 4000,
                pause: 0
            }, options || {});
            var el_id = $(this).attr('id');
            if (!$._spritely.instances[el_id]) {
                return this;
            }
            if (!$._spritely.instances[el_id].stop_random) {
                var r = $._spritely.randomIntBetween;
                var t = r(options.top, options.bottom);
                var l = r(options.left, options.right);
                $('#' + el_id).animate({
                    top: t + 'px',
                    left: l + 'px'
                }, options.speed)
            }
            window.setTimeout(function() {
                $('#' + el_id).spRandom(options);
            }, options.speed + options.pause)
            return this;
        },
        makeAbsolute: function() {
            
            return this.each(function() {
                var el = $(this);
                var pos = el.position();
                el.css({position: "absolute", marginLeft: 0, marginTop: 0, top: pos.top, left: pos.left })
                    .remove()
                    .appendTo("body");
            });

        },
        spSet: function(prop_name, prop_value) {
            var el_id = $(this).attr('id');
            $._spritely.instances[el_id][prop_name] = prop_value;
            return this;
        },
        spGet: function(prop_name, prop_value) {
            var el_id = $(this).attr('id');
            return $._spritely.instances[el_id][prop_name];
        },
        spStop: function(bool) {
            $(this).each(function() {
                var el_id = $(this).attr('id');
                if ($._spritely.instances[el_id]['options']['fps']) {
                    $._spritely.instances[el_id]['_last_fps'] = $._spritely.instances[el_id]['options']['fps'];
                }
                $._spritely.instances[el_id]['_stopped'] = true;
                $._spritely.instances[el_id]['_stopped_f1'] = bool;
                if ($._spritely.instances[el_id]['type'] == 'sprite') {
                    $(this).spSet('fps', 0);
                }
                if (bool) {
                    
                    var bp_top = $._spritely.getBgY($(this));
                    $(this).css('background-position', '0 ' + bp_top);
                }
            });
            return this;
        },
        spStart: function() {
            $(this).each(function() {
                var el_id = $(this).attr('id');
                var fps = $._spritely.instances[el_id]['_last_fps'] || 12;
                if ($._spritely.instances[el_id]['type'] == 'sprite') {
                    $(this).spSet('fps', fps);
                }
                $._spritely.instances[el_id]['_stopped'] = false;
            });
            return this;
        },
        spToggle: function() {
            var el_id = $(this).attr('id');
            var stopped = $._spritely.instances[el_id]['_stopped'] || false;
            var stopped_f1 = $._spritely.instances[el_id]['_stopped_f1'] || false;
            if (stopped) {
                $(this).spStart();
            } else {
                $(this).spStop(stopped_f1);
            }
            return this;
        },
        fps: function(fps) {
            $(this).each(function() {
                $(this).spSet('fps', fps);
            });
            return this;
        },
        goToFrame: function(n) {
            var el_id = $(this).attr('id');
            if ($._spritely.instances && $._spritely.instances[el_id]) {
                $._spritely.instances[el_id]['current_frame'] = n - 1;
            }
            return this;
        },
        spSpeed: function(speed) {
            $(this).each(function() {
                $(this).spSet('speed', speed);
            });
            return this;
        },
        spRelSpeed: function(speed) {
            $(this).each(function() {
                var rel_depth = $(this).spGet('depth') / 100;
                $(this).spSet('speed', speed * rel_depth);
            });
            return this;
        },
        spChangeDir: function(dir) {
            $(this).each(function() {
                $(this).spSet('dir', dir);
            });
            return this;
        },
        spState: function(n) {
            $(this).each(function() {
                
                var yPos = ((n - 1) * $(this).height()) + 'px';
                var xPos = $._spritely.getBgX($(this));
                var bp = xPos + ' -' + yPos;
                $(this).css('background-position', bp);
            });
            return this;
        },
        lockTo: function(el, options) {
            $(this).each(function() {
                var el_id = $(this).attr('id');
                if (!$._spritely.instances[el_id]) {
                    return this;
                }
                $._spritely.instances[el_id]['locked_el'] = $(this);
                $._spritely.instances[el_id]['lock_to'] = $(el);
                $._spritely.instances[el_id]['lock_to_options'] = options;
                $._spritely.instances[el_id]['interval'] = window.setInterval(function() {
                    if ($._spritely.instances[el_id]['lock_to']) {
                        var locked_el = $._spritely.instances[el_id]['locked_el'];
                        var locked_to_el = $._spritely.instances[el_id]['lock_to'];
                        var locked_to_options = $._spritely.instances[el_id]['lock_to_options'];
                        var locked_to_el_w = locked_to_options.bg_img_width;
                        var locked_to_el_h = locked_to_el.height();
                        var locked_to_el_y = $._spritely.getBgY(locked_to_el);
                        var locked_to_el_x = $._spritely.getBgX(locked_to_el);
                        var el_l = (parseInt(locked_to_el_x) + parseInt(locked_to_options['left']));
                        var el_t = (parseInt(locked_to_el_y) + parseInt(locked_to_options['top']));
                        el_l = $._spritely.get_rel_pos(el_l, locked_to_el_w);
                        $(locked_el).css({
                            'top': el_t + 'px',
                            'left': el_l + 'px'
                        });
                    }
                }, options.interval || 20);
            });
            return this;
        },
        destroy: function() {
            var el = $(this);
            var el_id = $(this).attr('id');
            if ($._spritely.instances[el_id] && $._spritely.instances[el_id]['timeout']){
                window.clearTimeout($._spritely.instances[el_id]['timeout']);
            }
            if ($._spritely.instances[el_id] && $._spritely.instances[el_id]['interval']) {
                window.clearInterval($._spritely.instances[el_id]['interval']);
            }
            delete $._spritely.instances[el_id]
            return this;
        }
    })
})(jQuery);

try {
  document.execCommand("BackgroundImageCache", false, true);
} catch(err) {}





/* Animation Stuff */
    jQuery(document).ready(function($) {

        
        
        
        var $contentinner = $('#contentinner');
        var footerwidgets = $('#footer-widgets').height();
        var sidebarheight = $("#sidebar").height();
        var $adjust = sidebarheight + footerwidgets + 60;
            $contentinner.css({
                'min-height' : $adjust + 'px'
            });
        
        /* Animation Stuff */
        $('#hill, #hill_foot').pan({fps: 15, speed: 2.9, dir: 'left', depth: 15});
        $('#light, #light_foot').pan({fps: 12, speed: 1.5, dir: 'left', depth: 20});
        $('#house, #house_foot').pan({fps: 3, speed: 1, dir: 'left', depth: 25});
        $('#cloud, #cloud_foot').pan({fps: 3, speed: 1, dir: 'right', depth: 25});
    });
