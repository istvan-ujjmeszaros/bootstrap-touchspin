(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = function (root, jQuery) {
      if (jQuery === undefined) {
        if (typeof window !== 'undefined') {
          jQuery = require('jquery');
        } else {
          jQuery = require('jquery')(root);
        }
      }
      factory(jQuery);
      return jQuery;
    };
  } else {
    factory(jQuery);
  }
}(function ($) {
  'use strict';

  var _currentSpinnerId = 0;

  $.fn.TouchSpin = function (options) {

    var defaults = {
      min: 0, // If null, there is no minimum enforced
      max: 100, // If null, there is no maximum enforced
      initval: '',
      replacementval: '',
      firstclickvalueifempty: null,
      step: 1,
      decimals: 0,
      stepinterval: 100,
      forcestepdivisibility: 'round', // none | floor | round | ceil
      stepintervaldelay: 500,
      verticalbuttons: false,
      verticalup: '&plus;',
      verticaldown: '&minus;',
      verticalupclass: '',
      verticaldownclass: '',
      prefix: '',
      postfix: '',
      prefix_extraclass: '',
      postfix_extraclass: '',
      booster: true,
      boostat: 10,
      maxboostedstep: false,
      mousewheel: true,
      buttondown_class: 'btn btn-primary',
      buttonup_class: 'btn btn-primary',
      buttondown_txt: '&minus;',
      buttonup_txt: '&plus;',
      callback_before_calculation: function (value) {
        return value;
      },
      callback_after_calculation: function (value) {
        return value;
      }
    };

    var attributeMap = {
      min: 'min',
      max: 'max',
      initval: 'init-val',
      replacementval: 'replacement-val',
      firstclickvalueifempty: 'first-click-value-if-empty',
      step: 'step',
      decimals: 'decimals',
      stepinterval: 'step-interval',
      verticalbuttons: 'vertical-buttons',
      verticalupclass: 'vertical-up-class',
      verticaldownclass: 'vertical-down-class',
      forcestepdivisibility: 'force-step-divisibility',
      stepintervaldelay: 'step-interval-delay',
      prefix: 'prefix',
      postfix: 'postfix',
      prefix_extraclass: 'prefix-extra-class',
      postfix_extraclass: 'postfix-extra-class',
      booster: 'booster',
      boostat: 'boostat',
      maxboostedstep: 'max-boosted-step',
      mousewheel: 'mouse-wheel',
      buttondown_class: 'button-down-class',
      buttonup_class: 'button-up-class',
      buttondown_txt: 'button-down-txt',
      buttonup_txt: 'button-up-txt'
    };

    return this.each(function () {

      var settings,
        originalinput = $(this),
        originalinput_data = originalinput.data(),
        _detached_prefix,
        _detached_postfix,
        container,
        elements,
        verticalbuttons_html,
        value,
        downSpinTimer,
        upSpinTimer,
        downDelayTimeout,
        upDelayTimeout,
        spincount = 0,
        spinning = false;

      init();

      function init() {
        if (originalinput.data('alreadyinitialized')) {
          return;
        }

        originalinput.data('alreadyinitialized', true);
        _currentSpinnerId += 1;
        originalinput.data('spinnerid', _currentSpinnerId);

        if (!originalinput.is('input')) {
          console.log('Must be an input.');
          return;
        }

        _initSettings();
        _setInitval();
        _checkValue();
        _buildHtml();
        _initElements();
        _updateButtonDisabledState();
        _hideEmptyPrefixPostfix();
        _setupMutationObservers();
        _bindEvents();
        _bindEventsInterface();
      }

      function _setInitval() {
        if (settings.initval !== '' && originalinput.val() === '') {
          originalinput.val(settings.initval);
        }
      }

      function changeSettings(newsettings) {
        _updateSettings(newsettings);
        _checkValue();

        var value = elements.input.val();

        if (value !== '') {
          value = parseFloat(settings.callback_before_calculation(elements.input.val()));
          elements.input.val(settings.callback_after_calculation(parseFloat(value).toFixed(settings.decimals)));
        }
      }

      function _initSettings() {
        settings = $.extend({}, defaults, originalinput_data, _parseAttributes(), options);

        if (parseFloat(settings.step) !== 1) {
          let remainder;

          // Modify settings.max to be divisible by step
          remainder = settings.max % settings.step;
          if (remainder !== 0) {
            settings.max = parseFloat(settings.max) - remainder;
          }

          // Do the same with min, should work with negative numbers too
          remainder = settings.min % settings.step;
          if (remainder !== 0) {
            settings.min = parseFloat(settings.min) + (parseFloat(settings.step) - remainder);
          }
        }
      }

      function _parseAttributes() {
        var data = {};

        // Setting up based on data attributes
        $.each(attributeMap, function (key, value) {
          var attrName = 'bts-' + value + '';

          if (originalinput.is('[data-' + attrName + ']')) {
            data[key] = originalinput.data(attrName);
          }
        });

        // Setting up based on input attributes if specified (input attributes have precedence)
        $.each(['min', 'max', 'step'], function (i, key) {
          if (originalinput.is('['+key+']')) {
            if (data[key] !== undefined) {
              console.warn('Both the "data-bts-' + key + '" data attribute and the "' + key + '" individual attribute were specified, the individual attribute will take precedence on: ', originalinput);
            }
            data[key] = originalinput.attr(key);
          }
        });

        return data;
      }

      function _destroy() {
        var $parent = originalinput.parent();

        stopSpin();

        originalinput.off('.touchspin');

        if ($parent.hasClass('bootstrap-touchspin-injected')) {
          originalinput.siblings().remove();
          originalinput.unwrap();
        } else {
          $('.bootstrap-touchspin-injected', $parent).remove();
          $parent.removeClass('bootstrap-touchspin');
        }

        originalinput.data('alreadyinitialized', false);
      }

      function _updateSettings(newsettings) {
        settings = $.extend({}, settings, newsettings);

        // Update postfix and prefix texts if those settings were changed.
        if (newsettings.postfix) {
          var $postfix = originalinput.parent().find('.bootstrap-touchspin-postfix');

          if ($postfix.length === 0) {
            _detached_postfix.insertAfter(originalinput);
          }

          originalinput.parent().find('.bootstrap-touchspin-postfix .input-group-text').text(newsettings.postfix);
        }

        if (newsettings.prefix) {
          var $prefix = originalinput.parent().find('.bootstrap-touchspin-prefix');

          if ($prefix.length === 0) {
            _detached_prefix.insertBefore(originalinput);
          }

          originalinput.parent().find('.bootstrap-touchspin-prefix .input-group-text').text(newsettings.prefix);
        }

        _hideEmptyPrefixPostfix();
      }

      function _buildHtml() {
        var initval = originalinput.val(),
          parentelement = originalinput.parent();

        if (initval !== '') {
	  // initval may not be parsable as a number (callback_after_calculation() may decorate it so it cant be parsed).  Use the callbacks if provided.
	  initval = settings.callback_before_calculation(initval);
          initval = settings.callback_after_calculation(parseFloat(initval).toFixed(settings.decimals));
        }

        originalinput.data('initvalue', initval).val(initval);
        originalinput.addClass('form-control');

        verticalbuttons_html = `
          <span class="input-group-addon bootstrap-touchspin-vertical-button-wrapper">
            <span class="input-group-btn-vertical">
              <button tabindex="-1" class="${settings.buttondown_class} bootstrap-touchspin-up ${settings.verticalupclass}" type="button">${settings.verticalup}</button>
              <button tabindex="-1" class="${settings.buttonup_class} bootstrap-touchspin-down ${settings.verticaldownclass}" type="button">${settings.verticaldown}</button>
            </span>
          </span>
       `;

        if (parentelement.hasClass('input-group')) {
          _advanceInputGroup(parentelement);
        } else {
          _buildInputGroup();
        }
      }

      function _advanceInputGroup(parentelement) {
        parentelement.addClass('bootstrap-touchspin');

        var prev = originalinput.prev(),
          next = originalinput.next();

        var downhtml,
          uphtml,
          prefixhtml = `
            <span class="input-group-addon input-group-prepend bootstrap-touchspin-prefix input-group-prepend bootstrap-touchspin-injected">
              <span class="input-group-text">${settings.prefix}</span>
            </span>
          `,
          postfixhtml = `
            <span class="input-group-addon input-group-append bootstrap-touchspin-postfix input-group-append bootstrap-touchspin-injected">
              <span class="input-group-text">${settings.postfix}</span>
            </span>
          `;

        if (settings.verticalbuttons) {
          $(verticalbuttons_html).insertAfter(originalinput);
        }
        else {
          if (prev.hasClass('input-group-btn') || prev.hasClass('input-group-prepend')) {
            downhtml = `
              <button tabindex="-1" class="${settings.buttondown_class} bootstrap-touchspin-down bootstrap-touchspin-injected" type="button">${settings.buttondown_txt}</button>
            `;
            prev.append(downhtml);
          } else {
            downhtml = `
              <span class="input-group-btn input-group-prepend bootstrap-touchspin-injected">
                <button tabindex="-1" class="${settings.buttondown_class} bootstrap-touchspin-down" type="button">${settings.buttondown_txt}</button>
              </span>
            `;
            $(downhtml).insertBefore(originalinput);
          }

          if (next.hasClass('input-group-btn') || next.hasClass('input-group-append')) {
            uphtml = `
            <button tabindex="-1" class="${settings.buttonup_class} bootstrap-touchspin-up bootstrap-touchspin-injected" type="button">${settings.buttonup_txt}</button>
          `;
            next.prepend(uphtml);
          } else {
            uphtml = `
            <span class="input-group-btn input-group-append bootstrap-touchspin-injected">
              <button tabindex="-1" class="${settings.buttonup_class} bootstrap-touchspin-up" type="button">${settings.buttonup_txt}</button>
            </span>
          `;
            $(uphtml).insertAfter(originalinput);
          }
        }

        $(prefixhtml).insertBefore(originalinput);
        $(postfixhtml).insertAfter(originalinput);

        container = parentelement;
      }

      function _buildInputGroup() {
        var html;

        var inputGroupSize = '';
        if (originalinput.hasClass('input-sm') || originalinput.hasClass('form-control-sm')) {
          inputGroupSize = 'input-group-sm';
        } else if (originalinput.hasClass('input-lg') || originalinput.hasClass('form-control-lg')) {
          inputGroupSize = 'input-group-lg';
        }

        if (settings.verticalbuttons) {
          html = `
            <div class="input-group ${inputGroupSize} bootstrap-touchspin bootstrap-touchspin-injected">
              <span class="input-group-addon input-group-prepend bootstrap-touchspin-prefix">
                <span class="input-group-text">${settings.prefix}</span>
              </span>
              <span class="input-group-addon bootstrap-touchspin-postfix input-group-append">
                <span class="input-group-text">${settings.postfix}</span>
              </span>
              ${verticalbuttons_html}
            </div>
          `;
        } else {
          html = `
            <div class="input-group bootstrap-touchspin bootstrap-touchspin-injected">
              <span class="input-group-btn input-group-prepend">
                <button tabindex="-1" class="${settings.buttondown_class} bootstrap-touchspin-down" type="button">${settings.buttondown_txt}</button>
              </span>
              <span class="input-group-addon bootstrap-touchspin-prefix input-group-prepend">
                <span class="input-group-text">${settings.prefix}</span>
              </span>
              <span class="input-group-addon bootstrap-touchspin-postfix input-group-append">
                <span class="input-group-text">${settings.postfix}</span>
              </span>
              <span class="input-group-btn input-group-append">
                <button tabindex="-1" class="${settings.buttonup_class} bootstrap-touchspin-up" type="button">${settings.buttonup_txt}</button>
              </span>
            </div>`;
        }

        container = $(html).insertBefore(originalinput);

        $('.bootstrap-touchspin-prefix', container).after(originalinput);

        if (originalinput.hasClass('input-sm') || originalinput.hasClass('form-control-sm')) {
          container.addClass('input-group-sm');
        } else if (originalinput.hasClass('input-lg') || originalinput.hasClass('form-control-lg')) {
          container.addClass('input-group-lg');
        }
      }

      function _initElements() {
        elements = {
          down: $('.bootstrap-touchspin-down', container),
          up: $('.bootstrap-touchspin-up', container),
          input: $('input', container),
          prefix: $('.bootstrap-touchspin-prefix', container).addClass(settings.prefix_extraclass),
          postfix: $('.bootstrap-touchspin-postfix', container).addClass(settings.postfix_extraclass)
        };
      }

      function _hideEmptyPrefixPostfix() {
        if (settings.prefix === '') {
          _detached_prefix = elements.prefix.detach();
        }

        if (settings.postfix === '') {
          _detached_postfix = elements.postfix.detach();
        }
      }

      function _bindEvents() {
        originalinput.on('keydown.touchspin', function (ev) {
          var code = ev.keyCode || ev.which;

          if (code === 38) {
            if (spinning !== 'up') {
              upOnce();
              startUpSpin();
            }
            ev.preventDefault();
          } else if (code === 40) {
            if (spinning !== 'down') {
              downOnce();
              startDownSpin();
            }
            ev.preventDefault();
          } else if (code === 9 || code === 13) {
            _checkValue();
          }
        });

        originalinput.on('keyup.touchspin', function (ev) {
          var code = ev.keyCode || ev.which;

          if (code === 38) {
            stopSpin();
          } else if (code === 40) {
            stopSpin();
          }
        });

        // change is fired before blur, so we need to work around that
        $(document).on('mousedown touchstart', function(event) {
          if ($(event.target).is(originalinput)) {
            return;
          }

          _checkValue();
        });

        originalinput.on('blur.touchspin', function () {
          _checkValue();
        });

        elements.down.on('keydown', function (ev) {
          var code = ev.keyCode || ev.which;

          if (code === 32 || code === 13) {
            if (spinning !== 'down') {
              downOnce();
              startDownSpin();
            }
            ev.preventDefault();
          }
        });

        elements.down.on('keyup.touchspin', function (ev) {
          var code = ev.keyCode || ev.which;

          if (code === 32 || code === 13) {
            stopSpin();
          }
        });

        elements.up.on('keydown.touchspin', function (ev) {
          var code = ev.keyCode || ev.which;

          if (code === 32 || code === 13) {
            if (spinning !== 'up') {
              upOnce();
              startUpSpin();
            }
            ev.preventDefault();
          }
        });

        elements.up.on('keyup.touchspin', function (ev) {
          var code = ev.keyCode || ev.which;

          if (code === 32 || code === 13) {
            stopSpin();
          }
        });

        elements.down.on('mousedown.touchspin', function (ev) {
          elements.down.off('touchstart.touchspin');  // android 4 workaround

          if (originalinput.is(':disabled,[readonly]')) {
            return;
          }

          downOnce();
          startDownSpin();

          ev.preventDefault();
          ev.stopPropagation();
        });

        elements.down.on('touchstart.touchspin', function (ev) {
          elements.down.off('mousedown.touchspin');  // android 4 workaround

          if (originalinput.is(':disabled,[readonly]')) {
            return;
          }

          downOnce();
          startDownSpin();

          ev.preventDefault();
          ev.stopPropagation();
        });

        elements.up.on('mousedown.touchspin', function (ev) {
          elements.up.off('touchstart.touchspin');  // android 4 workaround

          if (originalinput.is(':disabled,[readonly]')) {
            return;
          }

          upOnce();
          startUpSpin();

          ev.preventDefault();
          ev.stopPropagation();
        });

        elements.up.on('touchstart.touchspin', function (ev) {
          elements.up.off('mousedown.touchspin');  // android 4 workaround

          if (originalinput.is(':disabled,[readonly]')) {
            return;
          }

          upOnce();
          startUpSpin();

          ev.preventDefault();
          ev.stopPropagation();
        });

        elements.up.on('mouseup.touchspin mouseout.touchspin touchleave.touchspin touchend.touchspin touchcancel.touchspin', function (ev) {
          if (!spinning) {
            return;
          }

          ev.stopPropagation();
          stopSpin();
        });

        elements.down.on('mouseup.touchspin mouseout.touchspin touchleave.touchspin touchend.touchspin touchcancel.touchspin', function (ev) {
          if (!spinning) {
            return;
          }

          ev.stopPropagation();
          stopSpin();
        });

        elements.down.on('mousemove.touchspin touchmove.touchspin', function (ev) {
          if (!spinning) {
            return;
          }

          ev.stopPropagation();
          ev.preventDefault();
        });

        elements.up.on('mousemove.touchspin touchmove.touchspin', function (ev) {
          if (!spinning) {
            return;
          }

          ev.stopPropagation();
          ev.preventDefault();
        });

        originalinput.on('mousewheel.touchspin DOMMouseScroll.touchspin', function (ev) {
          if (!settings.mousewheel || !originalinput.is(':focus')) {
            return;
          }

          var delta = ev.originalEvent.wheelDelta || -ev.originalEvent.deltaY || -ev.originalEvent.detail;

          ev.stopPropagation();
          ev.preventDefault();

          if (delta < 0) {
            downOnce();
          } else {
            upOnce();
          }
        });
      }

      function _bindEventsInterface() {
        originalinput.on('touchspin.destroy', function () {
          _destroy();
        });

        originalinput.on('touchspin.uponce', function () {
          stopSpin();
          upOnce();
        });

        originalinput.on('touchspin.downonce', function () {
          stopSpin();
          downOnce();
        });

        originalinput.on('touchspin.startupspin', function () {
          startUpSpin();
        });

        originalinput.on('touchspin.startdownspin', function () {
          startDownSpin();
        });

        originalinput.on('touchspin.stopspin', function () {
          stopSpin();
        });

        originalinput.on('touchspin.updatesettings', function (e, newsettings) {
          changeSettings(newsettings);
        });
      }

      function _setupMutationObservers() {
        if (typeof MutationObserver !== 'undefined') {
          // MutationObserver is available
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.type === 'attributes' && (mutation.attributeName === 'disabled' || mutation.attributeName === 'readonly')) {
                _updateButtonDisabledState();
              }
            });
          });

          observer.observe(originalinput[0], {attributes: true});
        }
      }

      function _forcestepdivisibility(value) {
        if (typeof value !== 'number') {
          return value;
        }

        switch (settings.forcestepdivisibility) {
          case 'round':
            return (Math.round(value / settings.step) * settings.step).toFixed(settings.decimals);
          case 'floor':
            return (Math.floor(value / settings.step) * settings.step).toFixed(settings.decimals);
          case 'ceil':
            return (Math.ceil(value / settings.step) * settings.step).toFixed(settings.decimals);
          default:
            return value.toFixed(settings.decimals);
        }
      }

      function _checkValue() {
        var val, parsedval, returnval;

        val = settings.callback_before_calculation(originalinput.val());

        if (val === '') {
          if (settings.replacementval !== '') {
            originalinput.val(settings.replacementval);
            originalinput.trigger('change');
          }
          return;
        }

        if (settings.decimals > 0 && val === '.') {
          return;
        }

        parsedval = parseFloat(val);

        if (isNaN(parsedval)) {
          if (settings.replacementval !== '') {
            parsedval = settings.replacementval;
          } else {
            parsedval = 0;
          }
        }

        returnval = parsedval;

        if (parsedval.toString() !== val) {
          returnval = parsedval;
        }

        returnval = _forcestepdivisibility(parsedval);

        if ((settings.min !== null) && (parsedval < settings.min)) {
          returnval = settings.min;
        }

        if ((settings.max !== null) && (parsedval > settings.max)) {
          returnval = settings.max;
        }

        if (parseFloat(parsedval).toString() !== parseFloat(returnval).toString()) {
          originalinput.val(returnval);
        }

        originalinput.val(settings.callback_after_calculation(parseFloat(returnval).toFixed(settings.decimals)));
      }

      function _getBoostedStep() {
        if (!settings.booster) {
          return settings.step;
        } else {
          var boosted = Math.pow(2, Math.floor(spincount / settings.boostat)) * settings.step;

          if (settings.maxboostedstep) {
            if (boosted > settings.maxboostedstep) {
              boosted = settings.maxboostedstep;
            }
          }

          return Math.max(settings.step, boosted);
        }
      }

      function valueIfIsNaN() {
        if (typeof (settings.firstclickvalueifempty) === 'number') {
          return settings.firstclickvalueifempty;
        } else {
          return (settings.min + settings.max) / 2;
        }
      }

      function _updateButtonDisabledState() {
        const isDisabled = originalinput.is(':disabled,[readonly]');
        elements.up.prop('disabled', isDisabled);
        elements.down.prop('disabled', isDisabled);

        if (isDisabled) {
          stopSpin();
        }
      }

      function upOnce() {
        if (originalinput.is(':disabled,[readonly]')) {
          return;
        }

        _checkValue();

        value = parseFloat(settings.callback_before_calculation(elements.input.val()));

        var initvalue = value;
        var boostedstep;

        if (isNaN(value)) {
          value = valueIfIsNaN();
        } else {
          boostedstep = _getBoostedStep();
          value = value + boostedstep;
        }

        if ((settings.max !== null) && (value >= settings.max)) {
          value = settings.max;
          originalinput.trigger('touchspin.on.max');
          stopSpin();
        }

        elements.input.val(settings.callback_after_calculation(parseFloat(value).toFixed(settings.decimals)));

        if (initvalue !== value) {
          originalinput.trigger('change');
        }
      }

      function downOnce() {
        if (originalinput.is(':disabled,[readonly]')) {
          return;
        }

        _checkValue();

        value = parseFloat(settings.callback_before_calculation(elements.input.val()));

        var initvalue = value;
        var boostedstep;

        if (isNaN(value)) {
          value = valueIfIsNaN();
        } else {
          boostedstep = _getBoostedStep();
          value = value - boostedstep;
        }

        if ((settings.min !== null) && (value <= settings.min)) {
          value = settings.min;
          originalinput.trigger('touchspin.on.min');
          stopSpin();
        }

        elements.input.val(settings.callback_after_calculation(parseFloat(value).toFixed(settings.decimals)));

        if (initvalue !== value) {
          originalinput.trigger('change');
        }
      }

      function startDownSpin() {
        if (originalinput.is(':disabled,[readonly]')) {
          return;
        }

        stopSpin();

        spincount = 0;
        spinning = 'down';

        originalinput.trigger('touchspin.on.startspin');
        originalinput.trigger('touchspin.on.startdownspin');

        downDelayTimeout = setTimeout(function () {
          downSpinTimer = setInterval(function () {
            spincount++;
            downOnce();
          }, settings.stepinterval);
        }, settings.stepintervaldelay);
      }

      function startUpSpin() {
        if (originalinput.is(':disabled,[readonly]')) {
          return;
        }

        stopSpin();

        spincount = 0;
        spinning = 'up';

        originalinput.trigger('touchspin.on.startspin');
        originalinput.trigger('touchspin.on.startupspin');

        upDelayTimeout = setTimeout(function () {
          upSpinTimer = setInterval(function () {
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

        switch (spinning) {
          case 'up':
            originalinput.trigger('touchspin.on.stopupspin');
            originalinput.trigger('touchspin.on.stopspin');
            break;
          case 'down':
            originalinput.trigger('touchspin.on.stopdownspin');
            originalinput.trigger('touchspin.on.stopspin');
            break;
        }

        spincount = 0;
        spinning = false;
      }

    });

  };

}));

