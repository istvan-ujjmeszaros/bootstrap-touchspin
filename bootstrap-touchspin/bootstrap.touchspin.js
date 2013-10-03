/*jshint undef: true, unused:true */
/*global jQuery: true */

/*!=========================================================================
 *  Bootstrap TouchSpin
 *  v1.0.0
 *
 *  A mobile and touch friendly input spinner component for Bootstrap 3.
 *
 *      https://github.com/istvan-meszaros/bootstrap-touchspin
 *      http://www.virtuosoft.eu/code/bootstrap-touchspin/
 *
 *  Copyright 2013 István Ujj-Mészáros
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 * ====================================================================== */

(function($) {
    "use strict";

    $.fn.TouchSpin = function(options) {

        return this.each(function() {

            var settings,
                originalinput = $(this),
                container,
                elements,
                value,
                downSpinTimer,
                upSpinTimer,
                downDelayTimeout,
                upDelayTimeout,
                spincount = 0;

            init();

            function init()
            {
                if (originalinput.data("alreadyinitialized")) {
                    return;
                }

                originalinput.data("alreadyinitialized", true);

                if (!originalinput.is("input")) {
                    console.log("Must be an input.");
                    return;
                }

                _initSettings();
                _checkValue();
                _buildHtml();
                _initElements();
                _bindEvents();
                _bindEventsInterface();
            }

            function _initSettings()
            {
                settings = $.extend({
                    min: 0,
                    max: 100,
                    step: 1,
                    stepinterval: 100,
                    stepintervaldelay: 500,
                    prefix: "",
                    postfix: "",
                    booster: true,
                    boostat: 10,
                    maxboostedstep: false
                }, options);
            }

            function _buildHtml()
            {
                originalinput.data("initvalue", originalinput.val());

                var html = '<div class="input-group bootstrap-touchspin" style=""><span class="input-group-btn"><button class="btn btn-default bootstrap-touchspin-down" type="button">-</button></span><span class="input-group-addon bootstrap-touchspin-prefix">' + settings.prefix + '</span><span class="input-group-addon bootstrap-touchspin-postfix">' + settings.postfix + '</span><span class="input-group-btn"><button class="btn btn-default bootstrap-touchspin-up" type="button">+</button></span></div>';

                container = $(html).insertBefore(originalinput);

                $(".bootstrap-touchspin-prefix", container).after(originalinput);

                $("<style type='text/css'>.bootstrap-touchspin-prefix:empty,.bootstrap-touchspin-postfix:empty{display:none;}</style>").appendTo("head");

                originalinput.addClass("form-control");
            }

            function _initElements()
            {
                elements = {
                    down: $(".bootstrap-touchspin-down", container),
                    up: $(".bootstrap-touchspin-up", container),
                    input: $("input", container),
                    prefix: $(".bootstrap-touchspin-prefix", container),
                    postfix: $(".bootstrap-touchspin-postfix", container)
                };
            }

            function _bindEvents()
            {
                elements.up.on("click", function() {
                    upOnce();
                });

                elements.down.on("click", function() {
                    downOnce();
                });

                originalinput.on("keyup", function() {
                    _checkValue();
                });

                elements.down.on("mousedown touchstart", function(ev) {
                    if (ev.which > 1) {
                        return;
                    }

                    startDownSpin();
                });

                elements.up.on("mousedown touchstart", function(ev) {
                    if (ev.which > 1) {
                        return;
                    }

                    startUpSpin();
                });

                $(document).on("mouseup touchend touchcancel", function() {
                    stopSpin();
                });
            }

            function _bindEventsInterface() {
                originalinput.on('touchspin.uponce', function() {
                    stopSpin();
                    upOnce();
                });

                originalinput.on('touchspin.downonce', function() {
                    stopSpin();
                    downOnce();
                });

                originalinput.on('touchspin.startupspin', function() {
                    startUpSpin();
                });

                originalinput.on('touchspin.startdownspin', function() {
                    startDownSpin();
                });

                originalinput.on('touchspin.stopspin', function() {
                    stopSpin();
                });
            }

            function _checkValue() {
                var val, parsedval, returnval;

                val = originalinput.val();
                parsedval = parseInt(val, 10);

                if (isNaN(parsedval)) {
                    parsedval = 0;
                }

                returnval = parsedval;

                if (parsedval.toString() !== val) {
                    returnval = parsedval;
                }

                if (parsedval < settings.min) {
                    returnval = settings.min;
                }

                if (parsedval > settings.max) {
                    returnval = settings.max;
                }

                if (val !== returnval.toString()) {
                    originalinput.val(returnval);
                    originalinput.trigger("change");
                }
            }

            function _getBoostedStep() {
                if (!settings.booster) {
                    return settings.step;
                }
                else {
                    var boosted = Math.pow(2,Math.floor(spincount / settings.boostat));

                    if (settings.maxboostedstep) {
                        if (boosted > settings.maxboostedstep) {
                            boosted = settings.maxboostedstep;
                            value = Math.round(value / boosted) * boosted;
                        }
                    }

                    return Math.max(settings.step, boosted);
                }
            }

            function upOnce() {
                value = parseFloat(elements.input.val());

                var initvalue = value,
                    boostedstep = _getBoostedStep();

                value =  value + boostedstep;

                if (value > settings.max) {
                    stopSpin();
                    value = settings.max;
                    originalinput.trigger("touchspin.max");
                }

                elements.input.val(value);

                if (initvalue !== value) {
                    originalinput.trigger("change");
                }
            }

            function downOnce() {
                value = parseFloat(elements.input.val());

                var initvalue = value,
                    boostedstep = _getBoostedStep();

                value = value - boostedstep;

                if (value < settings.min) {
                    stopSpin();
                    value = settings.min;
                    originalinput.trigger("touchspin.min");
                }

                elements.input.val(value);

                if (initvalue !== value) {
                    originalinput.trigger("change");
                }
            }

            function startDownSpin() {
                stopSpin();

                spincount = 0;

                downDelayTimeout = setTimeout(function() {
                    downSpinTimer = setInterval(function() {
                        spincount++;
                        downOnce();
                    }, settings.stepinterval);
                }, settings.stepintervaldelay);
            }

            function startUpSpin() {
                stopSpin();

                spincount = 0;

                upDelayTimeout = setTimeout(function() {
                    upSpinTimer = setInterval(function() {
                        spincount++;
                        upOnce();
                    }, settings.stepinterval);
                }, settings.stepintervaldelay);
            }

            function stopSpin() {
                clearTimeout(downDelayTimeout);
                clearTimeout(upDelayTimeout);
                clearInterval(downSpinTimer);
                clearInterval(upSpinTimer);

                spincount = 0;
            }

        });

    };

})(jQuery);