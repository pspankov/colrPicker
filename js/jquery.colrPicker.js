(function($) {
	// Shell of the plugin
	$.fn.colrPicker = function(options) {

		options = $.extend({}, $.fn.colrPicker.defaults, options);
		// Plugin code
		options.duration
		// saving current element which we dealing with
		

		return this.each(function() {
			// do something to each item
			var $input = $(this);
			if(options.hideInput) $input.hide();

			var trigger;
			if(options.customTrigger) {
				trigger = options.customTrigger;
			}else {
				trigger = $('<div class="colorPickTrigger" />')
					.insertAfter($input);
			}
			

			var opened = false;
			var leftButtonDown = false;
			var mouseDragging = false;
			var pageTop = 0;
			var pageLeft = 0;
			var currentContainer;
			var initialColor = false;

			// check for input initial value
			if($input.val() != '') {
				$input.val(filterHex($input.val()))
				trigger.css('background-color',$input.val());
				initialColor = $input.val();
			}
			
			var colrPicker = $('<div class="colrPicker" />')
				.append('<div class="color-palette"><div class="circlePicker"><div class="circlePicker-inner"></div></div></div><div class="huebar"><div class="hueSlider"></div><div class="bar hue"></div></div><div class="satbar"><div class="satSlider"></div><div class="bar sat"></div></div><div class="britbar"><div class="britSlider"></div><div class="bar brit"></div></div><div class="color-info"><div class="hex" style="margin-right:8px"><label>HEX</label><input type="text" name="hex" class="hex-value" value="ffffff"></div><div><label>R</label><input type="text" name="red" value="255"></div><div><label>G</label><input type="text" name="green" value="255"></div><div style="margin-right:8px"><label>B</label><input type="text" name="blue" value="255"></div><div><label>H</label><input type="text" name="hue" value="360"></div><div><label>S</label><input type="text" name="sat" value="0"></div><div style="margin-right: 0";><label>B</label><input type="text" name="br" value="100"></div></div>');
			
			// load colrPicker on trigger click
			trigger.on('click', function() {
				if(!opened) {
					colrPicker.appendTo('body').hide();
					var pos = setOpenPos();
					colrPicker
						.css({'top':pos.top,'left': pos.left});
					colrPicker.fadeIn(options.fadeIn);
					if(initialColor) hexChange(initialColor);
					opened = true;
				}else {
					var pos = setOpenPos();
					colrPicker
						.css({'top':pos.top,'left': pos.left});
					colrPicker.fadeIn(options.fadeIn);
				}
			});

			// get the elements from current picker
			var palette = colrPicker.find('.color-palette').first();
			var circlePicker = colrPicker.find('.circlePicker').first();
			var huebar  = colrPicker.find('.huebar').first();
			var satbar  = colrPicker.find('.satbar').first();
			var britbar = colrPicker.find('.britbar').first();
			var hueSlider = colrPicker.find('.hueSlider').first();
			var satSlider = colrPicker.find('.satSlider').first();
			var britSlider = colrPicker.find('.britSlider').first();
			var hue = colrPicker.find('input[name="hue"]').first();
			var sat = colrPicker.find('input[name="sat"]').first();
			var br = colrPicker.find('input[name="br"]').first();
			var hex = colrPicker.find('input[name="hex"]').first();
			var red = colrPicker.find('input[name="red"]').first();
			var blue = colrPicker.find('input[name="blue"]').first();
			var green = colrPicker.find('input[name="green"]').first();

			// select values on click
			colrPicker.find(':input').click(function(){$(this).select()});
			
			// stupid chrome text cursor
			$(document).on('mousedown', function() {document.onselectstart = function () { return false; };});
			
			colrPicker.children('.color-palette, .huebar, .satbar, .britbar').on('mousedown', function(e){
				// Left mouse button was pressed, set flag
				if(e.which === 1) leftButtonDown = true;
				// current mouse coordinates
				pageLeft = e.pageX;
				pageTop = e.pageY;
				currentContainer = $(this).attr('class');
				// to update on click trigger a single event mouse dragging
				colrPicker.triggerHandler('mouseDragging',e);
			});

			$(document).mouseup(function(e) {

				if(e.which === 1) {
					// Left mouse button was released, clear flag
					leftButtonDown = false;
					
					if(mouseDragging) {
						// clear mouse dragging flag
						mouseDragging = false;
					}else {
						// close colr picker only on click (prevents from close on dragging outside colr picker)
						if (!colrPicker.is(e.target) && !trigger.is(e.target) && colrPicker.has(e.target).length === 0) {
					        colrPicker.fadeOut(options.fadeOut);
					    }
					}
				}
			});

			$(document).mousemove(function(e) {
				
				if(leftButtonDown) {
					if(!mouseDragging) {
						mouseDragging = true;
					}
				}

				if(mouseDragging) {
					colrPicker.triggerHandler('mouseDragging');
					pageLeft = e.pageX;
					pageTop = e.pageY;
				}
			});
			/* Fix for irrating text select icon on mouse drag */
			$('.colrPicker').onselectstart = function () { return false; };
			
			// trigger dragging event for different sliders
			colrPicker.bind('mouseDragging', function(e) {
				if(currentContainer == 'color-palette') colrPicker.triggerHandler('draggingPalette',e);
				if(currentContainer == 'huebar') colrPicker.triggerHandler('draggingHuebar',e);
				if(currentContainer == 'satbar') colrPicker.triggerHandler('draggingSatbar',e);
				if(currentContainer == 'britbar') colrPicker.triggerHandler('draggingBritbar',e);
				hsbChange();
			});

			colrPicker.bind('draggingPalette', function() {
				var top = pageTop-palette.offset().top;
				var left = pageLeft-palette.offset().left;

				if(top > 150) top = 150;
				if(top < 0) top = 0;
				
				if(left > 150) left = 150;
				if(left < 0) left = 0;

				circlePicker.css({'top': top-7,'left': left-7});
				satSlider.css({'top':left});
				sat.val(Math.round(left/1.5));
				britSlider.css({'top':top});
				br.val(Math.round(100-top/1.5));
				
			});

			colrPicker.bind('draggingHuebar', function() {
				var top = pageTop-huebar.offset().top;

				if(top > 150) top = 150;
				if(top < 0) top = 0;
				
				hueSlider.css({'top': top});
				hue.val(360-Math.round(top/(150/360)));
			});

			colrPicker.bind('draggingSatbar', function() {
				var top = pageTop-satbar.offset().top;

				if(top > 150) top = 150;
				if(top < 0) top = 0;
				
				satSlider.css({'top': top});
				sat.val(Math.round(top/1.5));

				circlePicker.css('left', top-7);
			});

			colrPicker.bind('draggingBritbar', function() {
				var top = pageTop-britbar.offset().top;

				if(top > 150) top = 150;
				if(top < 0) top = 0;
				
				britSlider.css({'top': top});
				br.val(Math.round(100-top/1.5));

				circlePicker.css('top', top-7);
			});

			$input.change(function(e) {
				hexChange($input.val());
			});

			hex.change(function(e) {
				hexChange(hex.val());
			});

			colrPicker.find('input[name="red"], input[name="green"], input[name="blue"]').change(function() {
				if($(this).val() < 0 || $(this).val() > 255 || !/[0-9]/.test($(this).val())) $(this).val(255);
				rgbChange();
			});
			
			hue.change(function(e) {
				if(hue.val() < 0 || hue.val() > 360 || !/[0-9]/.test(hue.val())) hue.val(360);
				setHueSlider();
				hsbChange();
			});

			colrPicker.find('input[name="sat"], input[name="br"]').change(function() {
				if($(this).val() < 0 || $(this).val() > 100 || !/[0-9]/.test($(this).val())) $(this).val(0);
				updateSliders();
				hsbChange();
			});

			function hsbChange() {
				var rgb = hsb2rgb({h:hue.val(), s: sat.val(), b: br.val()});
				setRgb(rgb);
				var hexx = rgb2hex(rgb).toUpperCase();
				hex.val(hexx);
				setHash(hexx)
				setBgColor();
			};

			function hexChange(hexx) {
				hexx = filterHex(hexx).replace('#','');
				var rgb = hex2rgb(hexx);
				setRgb(rgb);
				var hsb = hex2hsb(hexx);
				setHsb(hsb);
				updateSliders();
				hex.val(hexx);
				setHash(hexx);
				setBgColor();
			};

			function filterHex(hex) {
				if(!/^#?([a-f0-9]{6})$/i.test(hex)) hex = '#FFFFFF';
				return hex.toUpperCase();
			}

			function setHash(hex) {
				options.showHash ? $input.val('#'+hex) : $input.val(hex);
			}

			function rgbChange() {
				var rgb = {r:parseInt(red.val()), g: parseInt(green.val()), b: parseInt(blue.val())};
				var hexx = rgb2hex(rgb).toUpperCase();
				var hsb = rgb2hsb(rgb);
				
				setHsb(hsb);

				hex.val(hexx);
				setHash(hexx);

				updateSliders();
				setBgColor();
			};

			function setHsb(hsb) {
				hue.val(hsb.h);
				sat.val(hsb.s);
				br.val(hsb.b);
			}

			function setRgb(rgb) {
				red.val(rgb.r);
				green.val(rgb.g);
				blue.val(rgb.b);
			}


			function setBgColor() {
				bg = hsb2rgb({h:hue.val(), s: 100, b: 100});

				if(!options.customTrigger)
					trigger.css('background-color','#'+hex.val());

				palette.css('background-color','rgb('+bg.r+','+bg.g+','+bg.b+')');
				satbar.css('background-color','rgb('+bg.r+','+bg.g+','+bg.b+')');
				britbar.css('background-color','rgb('+bg.r+','+bg.g+','+bg.b+')');
			}

			function updateSliders() {
				setHueSlider();
				setSatSlider();
				setBrSlider();
			}

			function setHueSlider() {
				hueSlider.css('top',150-hue.val()*0.417);
			}

			function setSatSlider() {
				circlePicker.css('left', sat.val()*1.5-7);
				satSlider.css('top',sat.val()*1.5);
			}

			function setBrSlider() {
				circlePicker.css('top',150-br.val()*1.5-7);
				britSlider.css('top',150-br.val()*1.5);
			}

			function hsb2rgb(hsb) {
				var rgb = {};
				var h = Math.round(hsb.h);
				var s = Math.round(hsb.s*255/100);
				var v = Math.round(hsb.b*255/100);
				if(s === 0) {
					rgb.r = rgb.g = rgb.b = v;
				} else {
					var t1 = v;
					var t2 = (255 - s) * v / 255;
					var t3 = (t1 - t2) * (h % 60) / 60;
					if( h === 360 ) h = 0;
					if( h < 60 ) { rgb.r = t1; rgb.b = t2; rgb.g = t2 + t3; }
					else if( h < 120 ) {rgb.g = t1; rgb.b = t2; rgb.r = t1 - t3; }
					else if( h < 180 ) {rgb.g = t1; rgb.r = t2; rgb.b = t2 + t3; }
					else if( h < 240 ) {rgb.b = t1; rgb.r = t2; rgb.g = t1 - t3; }
					else if( h < 300 ) {rgb.b = t1; rgb.g = t2; rgb.r = t2 + t3; }
					else if( h < 360 ) {rgb.r = t1; rgb.g = t2; rgb.b = t1 - t3; }
					else { rgb.r = 0; rgb.g = 0; rgb.b = 0; }
				}
				return {
					r: Math.round(rgb.r),
					g: Math.round(rgb.g),
					b: Math.round(rgb.b)
				};
			}

			function rgb2hex(rgb) {
				var hex = [
					rgb.r.toString(16),
					rgb.g.toString(16),
					rgb.b.toString(16)
				];
				$.each(hex, function(nr, val) {
					if (val.length === 1) hex[nr] = '0' + val;
				});
				return hex.join('');
			}

			function hex2rgb(hex) {
				hex = parseInt(((hex.indexOf('#') > -1) ? hex.substring(1) : hex), 16);

				return {
					r: hex >> 16,
					g: (hex & 0x00FF00) >> 8,
					b: (hex & 0x0000FF)
				};
			}

			function rgb2hsb(rgb) {
				var hsb = { h: 0, s: 0, b: 0 };
				var min = Math.min(rgb.r, rgb.g, rgb.b);
				var max = Math.max(rgb.r, rgb.g, rgb.b);
				var delta = max - min;
				hsb.b = max;
				hsb.s = max !== 0 ? 255 * delta / max : 0;
				if( hsb.s !== 0 ) {
					if( rgb.r === max ) {
						hsb.h = (rgb.g - rgb.b) / delta;
					} else if( rgb.g === max ) {
						hsb.h = 2 + (rgb.b - rgb.r) / delta;
					} else {
						hsb.h = 4 + (rgb.r - rgb.g) / delta;
					}
				} else {
					hsb.h = -1;
				}
				hsb.h = Math.round(hsb.h * 60);
				if( hsb.h < 0 ) {
					hsb.h = Math.round(hsb.h + 360);
				}
				hsb.s = Math.round(hsb.s * 100/255);
				hsb.b = Math.round(hsb.b * 100/255);
				return hsb;
			}			

			function hex2hsb(hex) {
				var hsb = rgb2hsb(hex2rgb(hex));
				// Zero out hue marker for black, white, and grays (saturation === 0)
				if( hsb.s === 0 ) hsb.h = 360;
				return hsb;
			}

			function hsb2hex(hsb) {
				return rgb2hex(hsb2rgb(hsb));
			}

			function setOpenPos() {
				var pos = {};
				var tl = trigger.offset().left;
				var tt = trigger.offset().top;
				var tw = parseInt(trigger.outerWidth());
				var th = parseInt(trigger.outerHeight());
				var pw = parseInt(colrPicker.outerWidth());
				var ph = parseInt(colrPicker.outerHeight());
				
				pos.left = ((tl+pw) > window.innerWidth) ? (tl+tw)-pw : pos.left = tl;
				pos.top = (tt+th+ph-$(window).scrollTop() > window.innerHeight) ? tt-ph : tt+th;
				return pos;
			}
			
		});
	}

	$.fn.colrPicker.defaults = {
		fadeIn    : 'fast',
		fadeOut	  : 'fast',
		hideInput : true,
		showHash  : true,
		customTrigger   : false
	};

})(jQuery)