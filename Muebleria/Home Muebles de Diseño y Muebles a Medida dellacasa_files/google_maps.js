if (!w2gm_maps_objects.notinclude_maps_api) {
	var w2gm_3rd_party_maps_plugin = false;
	var _warn = console.warn,
		_error = console.error;
	console.error = function() {
		var err = arguments[0];
		if (typeof err == "string") {
			if (err.indexOf('InvalidKeyMapError') != -1 || err.indexOf('MissingKeyMapError') != -1) {
				if (w2gm_3rd_party_maps_plugin)
					alert('Google Maps locator plugin: another plugin or your theme calls Google Maps library without keys. This may cause problems with Google Maps, Geocoding, addition/edition listings locations, autocomplete on addresses fields.\n\nTry to find which plugin calls Google Maps library without keys. Insert keys in its settings or disable this plugin.');
				else
					alert('Google Maps locator plugin: your Google browser API key is invalid or missing. Log in to console https://code.google.com/apis/console and generate new key. Follow instructions https://www.salephpscripts.com/wordpress_maps/demo/documentation/#google_maps_keys');
			}
			if (err.indexOf('RefererNotAllowedMapError') != -1) {
				var hostname = window.location.hostname.replace('www.','');
				var protocol = window.location.protocol;
				alert('Google Maps locator plugin: the current URL loading the Google Maps has not been added to the list of allowed referrers. Please check the "Accept requests from these HTTP referrers (web sites)" field in Google API console. Follow instructions https://www.salephpscripts.com/wordpress_maps/demo/documentation/#google_maps_keys \n\nTry one of the following URLs: *.'+hostname+'/*, '+protocol+'//'+hostname+'/*, '+protocol+'//www.'+hostname+'/*');
			}
			if (err.indexOf('ApiNotActivatedMapError') != -1) {
				alert('Google Maps locator plugin: you have to enable following APIs in Google API console https://code.google.com/apis/console : Google Maps JavaScript API, Google Static Maps API, Google Places API Web Service, Google Maps Geocoding API and Google Maps Directions API. Follow instructions https://www.salephpscripts.com/wordpress_maps/demo/documentation/#google_maps_keys\n\nNote, that it requires some time for changes to take effect.');
			}
			if (err.indexOf('You have exceeded your request quota for this API.') != -1) {
				alert('Google Maps is no longer free. You must enable billing with a credit card and have a valid API key for all of your projects. https://developers.google.com/maps/gmp-get-started');
			}
		}
		return _error.apply(console, arguments);
	};
	console.warn = function() {
		var err = arguments[0];
		if (typeof err == "string") {
			if (err.indexOf('InvalidKey') != -1 || err.indexOf('NoApiKeys') != -1) {
				if (w2gm_3rd_party_maps_plugin)
					alert('Google Maps locator plugin: another plugin or your theme calls Google Maps library without keys. This may cause problems with Google Maps, Geocoding, addition/edition listings locations, autocomplete on addresses fields.\n\nTry to find which plugin calls Google Maps library without keys. Insert keys in its settings or disable this plugin.');
				else
					alert('Google Maps locator plugin: your Google browser API key is invalid or missing. Log in to console https://code.google.com/apis/console and generate new key. Follow instructions https://www.salephpscripts.com/wordpress_maps/demo/documentation/#google_maps_keys');
			}
		}
		return _warn.apply(console, arguments);
	};
}

// google_maps_edit.js -------------------------------------------------------------------------------------------------------------------------------------------
(function($) {
	"use strict";
	
	var w2gm_load_maps_backend = function() {
	
		if ($("#w2gm_map_starting_point_metabox").length) {
			$("#w2gm_map_starting_point_metabox .inside .vp-metabox").append("<div id='w2gm-starting-point-metabox-map-canvas' style='width: auto; height: 450px'></div>");
			
			var start_zoom = 1;
			if ($("select[name='w2gm_map_starting_point[start_zoom]']").val() > 0) {
				start_zoom = parseInt($("select[name='w2gm_map_starting_point[start_zoom]']").val());
			}
			
			var mapOptions = {
					zoom: start_zoom,
					scrollwheel: true,
					gestureHandling: 'greedy',
					disableDoubleClickZoom: true,
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					fullscreenControl: false
			};
			var starting_point_map = new google.maps.Map(document.getElementById("w2gm-starting-point-metabox-map-canvas"), mapOptions);
			
			var start_latitude = 47.651968;
			var start_longitude = 9.478485;
			if ($("input[name='w2gm_map_starting_point[start_latitude]']").val()) {
				start_latitude = $("input[name='w2gm_map_starting_point[start_latitude]']").val();
			}
			if ($("input[name='w2gm_map_starting_point[start_longitude]']").val()) {
				start_longitude = $("input[name='w2gm_map_starting_point[start_longitude]']").val();
			}
			
			var starting_point_marker = new google.maps.Marker({
				position: new google.maps.LatLng(start_latitude, start_longitude),
				draggable: true
			});
	
			google.maps.event.addListener(starting_point_marker, 'dragend', function (evt) {
				$("input[name='w2gm_map_starting_point[start_latitude]']").val(evt.latLng.lat());
				$("input[name='w2gm_map_starting_point[start_longitude]']").val(evt.latLng.lng());
			});
	
			google.maps.event.addListener(starting_point_map, 'zoom_changed', function () {
				var start_zoom = starting_point_map.getZoom();
				if (start_zoom >= 1 && start_zoom <= 19) {
					$("select[name='w2gm_map_starting_point[start_zoom]']").val(start_zoom).trigger("change");
				}
			});
	
			starting_point_map.setCenter(starting_point_marker.position);
			starting_point_marker.setMap(starting_point_map);
		}

		w2gm_geocoder_backend = new google.maps.Geocoder();

		if ($("#w2gm-map-canvas").length) {
			var mapOptions = {
					zoom: 1,
					scrollwheel: true,
					gestureHandling: 'greedy',
					disableDoubleClickZoom: true,
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					fullscreenControl: false
			};
			if (w2gm_maps_objects.map_style) {
				mapOptions.styles = eval(w2gm_maps_objects.map_style);
			}
			w2gm_map_backend = new google.maps.Map(document.getElementById("w2gm-map-canvas"), mapOptions);

			var w2gm_coords_array_1 = new Array();
			var w2gm_coords_array_2 = new Array();

			if (w2gm_isAnyLocation_backend())
				w2gm_generateMap_backend();
			else
				w2gm_map_backend.setCenter(new google.maps.LatLng(w2gm_maps_objects.default_latitude, w2gm_maps_objects.default_longitude));

			google.maps.event.addListener(w2gm_map_backend, 'zoom_changed', function() {
				if (w2gm_allow_map_zoom_backend)
					$(".w2gm-map-zoom").val(w2gm_map_backend.getZoom());
			});
		}
	}

	window.w2gm_load_maps_api_backend = function() {
		$(document).trigger('w2gm_google_maps_api_loaded');

		google.maps.event.addDomListener(window, 'load', w2gm_load_maps_backend());
		
		w2gm_load_maps_api(); // Load frontend maps
		
		w2gm_setupAutocomplete();
	}
	
	window.w2gm_setupAutocomplete = function() {
		$(".w2gm-field-autocomplete").each( function() {
			if (typeof google != 'undefined' && typeof google.maps.places != 'undefined') {
				if (w2gm_maps_objects.address_autocomplete_code != '0')
					var options = { componentRestrictions: {country: w2gm_maps_objects.address_autocomplete_code}};
				else
					var options = { };
				var searchBox = new google.maps.places.Autocomplete(this, options);
				
				if ($("#w2gm-map-canvas").length) {
					google.maps.event.addListener(searchBox, 'place_changed', function () {
						w2gm_generateMap_backend();
					});
				}
			}
		});
	}

	function w2gm_setMapCenter_backend(w2gm_coords_array_1, w2gm_coords_array_2) {
		var count = 0;
		var bounds = new google.maps.LatLngBounds();
		for (count == 0; count<w2gm_coords_array_1.length; count++)  {
			bounds.extend(new google.maps.LatLng(w2gm_coords_array_1[count], w2gm_coords_array_2[count]));
		}
		if (count == 1) {
			if ($(".w2gm-map-zoom").val() == '' || $(".w2gm-map-zoom").val() == 0)
				var zoom_level = 1;
			else
				var zoom_level = parseInt($(".w2gm-map-zoom").val());
		} else {
			w2gm_map_backend.fitBounds(bounds);
			var zoom_level = w2gm_map_backend.getZoom();
		}
		w2gm_map_backend.setCenter(bounds.getCenter());
	
		// allow/disallow map zoom in listener, this option needs because w2gm_map.setZoom() also calls this listener
		w2gm_allow_map_zoom_backend = false;
		w2gm_map_backend.setZoom(zoom_level);
		w2gm_allow_map_zoom_backend = true;
	}
	
	var w2gm_coords_array_1 = new Array();
	var w2gm_coords_array_2 = new Array();
	var w2gm_attempts = 0;
	window.w2gm_generateMap_backend = function() {
		w2gm_ajax_loader_target_show($("#w2gm-map-canvas"));
		w2gm_coords_array_1 = new Array();
		w2gm_coords_array_2 = new Array();
		w2gm_attempts = 0;
		w2gm_clearOverlays_backend();
		w2gm_geocodeAddress_backend(0);
		//w2gm_setupAutocomplete();
	}
	
	function w2gm_setFoundPoint(results, location_obj, i) {
		var point = results[0].geometry.location;
		$(".w2gm-map-coords-1:eq("+i+")").val(point.lat());
		$(".w2gm-map-coords-2:eq("+i+")").val(point.lng());
		var map_coords_1 = point.lat();
		var map_coords_2 = point.lng();
		w2gm_coords_array_1.push(map_coords_1);
		w2gm_coords_array_2.push(map_coords_2);
		location_obj.setPoint(point);
		location_obj.w2gm_placeMarker();
		w2gm_geocodeAddress_backend(i+1);

		if ((i+1) == $(".w2gm-location-in-metabox").length) {
			w2gm_setMapCenter_backend(w2gm_coords_array_1, w2gm_coords_array_2);
			w2gm_ajax_loader_target_hide("w2gm-map-canvas");
		}
	}

	window.w2gm_geocodeAddress_backend = function(i) {
		if ($(".w2gm-location-in-metabox:eq("+i+")").length) {
			var locations_drop_boxes = [];
			$(".w2gm-location-in-metabox:eq("+i+")").find("select").each(function(j, val) {
				if ($(this).val())
					locations_drop_boxes.push($(this).children(":selected").text());
			});
	
			var location_string = locations_drop_boxes.reverse().join(', ');
	
			if ($(".w2gm-manual-coords:eq("+i+")").is(":checked") && $(".w2gm-map-coords-1:eq("+i+")").val()!='' && $(".w2gm-map-coords-2:eq("+i+")").val()!='' && ($(".w2gm-map-coords-1:eq("+i+")").val()!=0 || $(".w2gm-map-coords-2:eq("+i+")").val()!=0)) {
				var map_coords_1 = $(".w2gm-map-coords-1:eq("+i+")").val();
				var map_coords_2 = $(".w2gm-map-coords-2:eq("+i+")").val();
				if ($.isNumeric(map_coords_1) && $.isNumeric(map_coords_2)) {
					var point = new google.maps.LatLng(map_coords_1, map_coords_2);
					w2gm_coords_array_1.push(map_coords_1);
					w2gm_coords_array_2.push(map_coords_2);
	
					var location_obj = new w2gm_glocation_backend(i, point, 
						location_string,
						$(".w2gm-address-line-1:eq("+i+")").val(),
						$(".w2gm-address-line-2:eq("+i+")").val(),
						$(".w2gm-zip-or-postal-index:eq("+i+")").val(),
						$(".w2gm-map-icon-file:eq("+i+")").val()
					);
					location_obj.w2gm_placeMarker();
				}
				w2gm_geocodeAddress_backend(i+1);
				if ((i+1) == $(".w2gm-location-in-metabox").length) {
					w2gm_setMapCenter_backend(w2gm_coords_array_1, w2gm_coords_array_2);
					w2gm_ajax_loader_target_hide("w2gm-map-canvas");
				}
			} else if (location_string || $(".w2gm-address-line-1:eq("+i+")").val() || $(".w2gm-address-line-2:eq("+i+")").val() || $(".w2gm-zip-or-postal-index:eq("+i+")").val()) {
				var location_obj = new w2gm_glocation_backend(i, null, 
					location_string,
					$(".w2gm-address-line-1:eq("+i+")").val(),
					$(".w2gm-address-line-2:eq("+i+")").val(),
					$(".w2gm-zip-or-postal-index:eq("+i+")").val(),
					$(".w2gm-map-icon-file:eq("+i+")").val()
				);

				// Geocode by address
				if (w2gm_maps_objects.address_autocomplete_code != '0')
					var options = { 'address': location_obj.compileAddress(), componentRestrictions: {country: w2gm_maps_objects.address_autocomplete_code}};
				else
					var options = { 'address': location_obj.compileAddress() };

				if (w2gm_geocoder_backend !== null) {
					w2gm_geocoder_backend.geocode( options, function(results, status) {
						if (status != google.maps.GeocoderStatus.OK) {
							if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT && w2gm_attempts < 5) {
								w2gm_attempts++;
								setTimeout('w2gm_geocodeAddress_backend('+i+')', 2000);
							} else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
								// last chance to find correct location with Places API
								var service = new google.maps.places.PlacesService(w2gm_map_backend);
								service.textSearch({
									query: options.address
								}, function(results, status) {
									if (status == google.maps.places.PlacesServiceStatus.OK) {
										w2gm_setFoundPoint(results, location_obj, i);
									} else {
										alert("Sorry, we are unable to geocode address (address line: "+options.address+" #"+(i)+") for the following reason: " + status);
										w2gm_ajax_loader_target_hide("w2gm-map-canvas");
									}
								});
							} else {
								alert("Sorry, we are unable to geocode address (address line: "+options.address+" #"+(i)+") for the following reason: " + status);
								w2gm_ajax_loader_target_hide("w2gm-map-canvas");
							}
						} else {
							w2gm_setFoundPoint(results, location_obj, i);
						}
					});
				} else {
					alert("Google Geocoder was not loaded. Check Google API keys and enable Google Maps Geocoding API in Google APIs console.");
					w2gm_ajax_loader_target_hide("w2gm-map-canvas");
				}
			} else
				w2gm_ajax_loader_target_hide("w2gm-map-canvas");
		} else
			w2gm_attempts = 0;
	}

	window.w2gm_placeMarker_backend = function(w2gm_glocation) {
		// dragging does not work on mobile devices for PNG richtext markers
		var marker = new google.maps.Marker({
				position: w2gm_glocation.point,
				map: w2gm_map_backend,
				draggable: true
		});
		
		w2gm_markersArray_backend.push(marker);
		google.maps.event.addListener(marker, 'click', function() {
			w2gm_show_infoWindow_backend(w2gm_glocation, marker);
		});
		
		google.maps.event.addListener(marker, 'dragend', function(event) {
			var point = marker.getPosition();
			if (point !== undefined) {
				var selected_location_num = w2gm_glocation.index;
				$(".w2gm-manual-coords:eq("+w2gm_glocation.index+")").prop("checked", true);
				$(".w2gm-manual-coords:eq("+w2gm_glocation.index+")").parents(".w2gm-manual-coords-wrapper").find(".w2gm-manual-coords-block").show(200);
			
				$(".w2gm-map-coords-1:eq("+w2gm_glocation.index+")").val(point.lat());
				$(".w2gm-map-coords-2:eq("+w2gm_glocation.index+")").val(point.lng());
			}
		});
	}
	
	// This function builds info Window and shows it hiding another
	function w2gm_show_infoWindow_backend(w2gm_glocation, marker) {
		var address = w2gm_glocation.compileHtmlAddress();
		var index = w2gm_glocation.index;
	
		// we use global w2gm_infoWindow_backend, not to close/open it - just to set new content (in order to prevent blinking)
		if (!w2gm_infoWindow_backend)
			w2gm_infoWindow_backend = new google.maps.InfoWindow();
	
		w2gm_infoWindow_backend.setContent(address);
		w2gm_infoWindow_backend.open(w2gm_map_backend, marker);
	}
	
	function w2gm_clearOverlays_backend() {
		if (w2gm_markersArray_backend) {
			for(var i = 0; i<w2gm_markersArray_backend.length; i++){
				w2gm_markersArray_backend[i].setMap(null);
			}
		}
	}
	
	function w2gm_isAnyLocation_backend() {
		var is_location = false;
		$(".w2gm-location-in-metabox").each(function(i, val) {
			var locations_drop_boxes = [];
			$(this).find("select").each(function(j, val) {
				if ($(this).val()) {
					is_location = true;
					return false;
				}
			});
	
			if ($(".w2gm-manual-coords:eq("+i+")").is(":checked") && $(".w2gm-map-coords-1:eq("+i+")").val()!='' && $(".w2gm-map-coords-2:eq("+i+")").val()!='' && ($(".w2gm-map-coords-1:eq("+i+")").val()!=0 || $(".w2gm-map-coords-2:eq("+i+")").val()!=0)) {
				is_location = true;
				return false;
			}
		});
		if (is_location)
			return true;
	
		if ($(".w2gm-address-line-1[value!='']").length != 0)
			return true;
	
		if ($(".w2gm-address-line-2[value!='']").length != 0)
			return true;
	
		if ($(".w2gm-zip-or-postal-index[value!='']").length != 0)
			return true;
	}
})(jQuery);

// google_maps_view.js -------------------------------------------------------------------------------------------------------------------------------------------
(function($) {
	"use strict";
	
	window.w2gm_buildPoint = function(lat, lng) {
		return new google.maps.LatLng(lat, lng);
	}

	window.w2gm_buildBounds = function() {
		return new google.maps.LatLngBounds();
	}

	window.w2gm_extendBounds = function(bounds, point) {
		bounds.extend(point);
	}

	window.w2gm_mapFitBounds = function(map_id, bounds) {
		w2gm_maps[map_id].fitBounds(bounds);
	}

	window.w2gm_getMarkerPosition = function(marker) {
		return marker.position;
	}

	window.w2gm_closeInfoWindow = function(map_id) {
		if (typeof w2gm_infoWindows[map_id] != 'undefined') {
			w2gm_infoWindows[map_id].close();
			w2gm_infoWindows[map_id].location = null;
			// Removes hash from URL
			history.pushState("", document.title, window.location.pathname + window.location.search);
		}
	}
	
	window.w2gm_geocodeAddress = function(address, callback) {
		if (typeof google.maps != 'undefined' && typeof google.maps.places != 'undefined') {
			var geocoder = new google.maps.Geocoder();
			geocoder.geocode({'address': address}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					var success = true;
					var lat = results[0].geometry.location.lat();
					var lng = results[0].geometry.location.lng();
				} else {
					var success = false;
				}
				callback(success, lat, lng);
				/*if (status == google.maps.GeocoderStatus.OK) {
					post_params.start_latitude = results[0].geometry.location.lat();
					post_params.start_longitude = results[0].geometry.location.lng();
				} else {
					//alert('Sorry, we are unable to geocode entered address!');
				}
				w2gm_startAJAXSearch(post_params, search_button_obj);*/
			});
		} else {
			callback(false, 0, 0);
			/*alert("Google Geocoder was not loaded. Check Google API keys and enable Google Maps Geocoding API in Google APIs console.");
			w2gm_startAJAXSearch(post_params, search_button_obj);*/
			
		}
	}
	
	window.w2gm_callMapResize = function(map_id) {
		google.maps.event.trigger(w2gm_maps[map_id], 'resize');
	}
	
	window.w2gm_setMapCenter = function(map_id, center) {
		w2gm_maps[map_id].setCenter(center);
	}
	
	window.w2gm_setMapZoom = function(map_id, zoom) {
		var listener = google.maps.event.addListener(w2gm_maps[map_id], "idle", function() { 
			w2gm_maps[map_id].setZoom(parseInt(zoom));
			google.maps.event.removeListener(listener); 
		});
		
	}

	window.w2gm_autocompleteService = function(term, address_autocomplete_code, common_array, response, callback) {
		if (address_autocomplete_code != '0')
			var options = { input: term, componentRestrictions: {country: address_autocomplete_code}};
		else
			var options = { input: term };
		
		var autoCompleteService = new google.maps.places.AutocompleteService();
		autoCompleteService.getPlacePredictions(options, function (predictions, status) {
			var output_predictions = [];
			$.map(predictions, function (prediction, i) {
				var output_prediction = {
						label: prediction.structured_formatting.main_text,
						value: prediction.description,
						name: prediction.structured_formatting.main_text,
						sublabel: prediction.structured_formatting.secondary_text,
				};
				output_predictions.push(output_prediction);
			});
			
			callback(output_predictions, common_array, response);
		});
	}

	function w2gm_drawFreeHandPolygon(map_id) {
		var poly = new google.maps.Polyline({
			map: w2gm_maps[map_id],
			clickable:false,
			strokeColor: '#AA2143',
			strokeWeight: 2,
			zIndex: 1000,
		});
		
		var move = google.maps.event.addListener(w2gm_maps[map_id], 'mousemove', function(e) {
			poly.getPath().push(e.latLng);
		});
		
		google.maps.event.addListenerOnce(w2gm_maps[map_id], 'mouseup', function(e) {
			google.maps.event.removeListener(move);
			var path = poly.getPath();
			poly.setMap(null);
			
			// google likes to change letters-names of point property in the path,
			// check them all
			/*var letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','z','Mb','Kb'];
			for (var i in letters) {
				if (typeof path[letters[i]] != 'undefined' && path[letters[i]].length > 2) {
					var theArrayofLatLng = path[letters[i]];
				}
			}*/
			for (const [key, value] of Object.entries(path)) {
				if (Array.isArray(value)) {
					var theArrayofLatLng = path[key];
				}
			}
			var ArrayforPolygontoUse = w2gm_GDouglasPeucker(theArrayofLatLng, 50);
		
			var geo_poly = [];
			var lat_lng;
			for (lat_lng in ArrayforPolygontoUse) {
				geo_poly.push({'lat': ArrayforPolygontoUse[lat_lng].lat(), 'lng': ArrayforPolygontoUse[lat_lng].lng()});
			}

			if (geo_poly.length) {
				w2gm_sendGeoPolyAJAX(map_id, geo_poly);
			 
				var polyOptions = {
					map: w2gm_maps[map_id],
					fillColor: '#0099FF',
					fillOpacity: 0.3,
					strokeColor: '#AA2143',
					strokeWeight: 1,
					clickable: false,
					zIndex: 1,
					path:ArrayforPolygontoUse,
					editable: false
				}
	
				w2gm_polygons[map_id] = new google.maps.Polygon(polyOptions);
			}
	
			var drawButton = $(w2gm_maps[map_id].getDiv()).find('.w2gm-map-draw').get(0);
			drawButton.drawing_state = 0;
			//$('body').unbind('touchmove');
			window.removeEventListener('touchmove', w2gm_stop_touchmove_listener, { passive: false });
			w2gm_maps[map_id].setOptions({ draggableCursor: '' });
			$(drawButton).removeClass('w2gm-btn-active');
			w2gm_disableDrawingMode(map_id);
			google.maps.event.clearListeners(w2gm_maps[map_id].getDiv(), 'mousedown');
			
			var editButton = $(w2gm_maps[map_id].getDiv()).find('.w2gm-map-edit').get(0);
			$(editButton).removeAttr('disabled');
		});
	}
	function w2gm_enableDrawingMode(map_id) {
		$(w2gm_maps[map_id].getDiv()).find('.w2gm-map-custom-controls').hide();
		
		var options = {
				draggable: false, 
				scrollwheel: false,
				streetViewControl: false
		};
		w2gm_maps[map_id].setOptions(options);
	}
	function w2gm_disableDrawingMode(map_id) {
		$(w2gm_maps[map_id].getDiv()).find('.w2gm-map-custom-controls').show();
		
		var attrs_array = w2gm_get_map_markers_attrs_array(map_id);
		var enable_wheel_zoom = attrs_array.enable_wheel_zoom;
		var enable_dragging_touchscreens = attrs_array.enable_dragging_touchscreens;
		if (enable_dragging_touchscreens || !('ontouchstart' in document.documentElement)) {
			var enable_dragging = true;
		} else {
			var enable_dragging = false;
		}
		
		var enable_onefinger_dragging_touchscreens = attrs_array.enable_onefinger_dragging_touchscreens;
		if (enable_onefinger_dragging_touchscreens || !('ontouchstart' in document.documentElement)) {
			var enable_onefinger_dragging = "greedy";
		} else {
			var enable_onefinger_dragging = "cooperative";
		}
		
		var options = {
				draggable: enable_dragging, 
				scrollwheel: enable_wheel_zoom,
				streetViewControl: true,
				gestureHandling: enable_onefinger_dragging
		};
		w2gm_maps[map_id].setOptions(options);
	}
	
	window.w2gm_setMapZoomCenter = function(map_id, map_attrs, markers_array) {
		
		if (typeof map_attrs.start_zoom != 'undefined' && map_attrs.start_zoom > 0)
			var zoom_level = map_attrs.start_zoom;
		else if (markers_array.length == 1)
			var zoom_level = markers_array[0][6];
		else if (markers_array.length > 1)
			// fitbounds does not need zoom
			var zoom_level = false;
		else
			var zoom_level = 2;
	
		if (typeof map_attrs.start_latitude != 'undefined' && map_attrs.start_latitude && typeof map_attrs.start_longitude != 'undefined' && map_attrs.start_longitude) {
			
			if (wcsearch_get_uri_param('swLat')) {
				var uri_bounds = new google.maps.LatLngBounds();
				var sw_point = new google.maps.LatLng(wcsearch_get_uri_param('swLat'), wcsearch_get_uri_param('swLng'));
				var ne_point = new google.maps.LatLng(wcsearch_get_uri_param('neLat'), wcsearch_get_uri_param('neLng'));
				uri_bounds.extend(sw_point);
				uri_bounds.extend(ne_point);
				
				w2gm_maps[map_id].fitBounds(uri_bounds, 0);
			} else {
				var start_latitude = map_attrs.start_latitude;
				var start_longitude = map_attrs.start_longitude;
				w2gm_setMapCenter(map_id, new google.maps.LatLng(start_latitude, start_longitude));
				if (zoom_level == false) {
					zoom_level = 12;
				}
				// especially set up setZoom on the map without "idle" listener, so it will not "fly" after load
				w2gm_maps[map_id].setZoom(parseInt(zoom_level));
			}

			if (typeof map_attrs.ajax_loading != 'undefined' && map_attrs.ajax_loading == 1) {
				// use closures here
				w2gm_setMapAjaxListener(w2gm_maps[map_id], map_id);
			}
		} else if (typeof map_attrs.start_address != 'undefined' && map_attrs.start_address) {
			// use closures here
			w2gm_geocodeStartAddress(map_attrs, map_id, zoom_level);
		} else if (markers_array.length == 1) {
			w2gm_setMapZoom(map_id, zoom_level);
		} else if (zoom_level) {
			// no fitbounds here
			w2gm_setMapCenter(map_id, new google.maps.LatLng(w2gm_maps_objects.default_latitude, w2gm_maps_objects.default_longitude));
			w2gm_setMapZoom(map_id, zoom_level);
		}
	}

	function w2gm_load_maps() {
		for (var i=0; i<w2gm_map_markers_attrs_array.length; i++) {
			if (typeof w2gm_maps[w2gm_map_markers_attrs_array[i].map_id] == 'undefined') { // workaround for "tricky" themes and plugins to load maps twice
				w2gm_load_map(i);
			}
		}
		
		w2gm_geolocatePosition();
	}

	window.w2gm_load_maps_api = function() {
		$(document).trigger('w2gm_google_maps_api_loaded');

		// are there any markers?
		if (typeof w2gm_map_markers_attrs_array != 'undefined' && w2gm_map_markers_attrs_array.length) {
			_w2gm_map_markers_attrs_array = JSON.parse(JSON.stringify(w2gm_map_markers_attrs_array));
			google.maps.event.addDomListener(window, 'load', w2gm_load_maps());
		}

		$(".w2gm-field-autocomplete").each( function() {
			if (google.maps && google.maps.places) {
				if (w2gm_maps_objects.address_autocomplete_code != '0')
					var options = { componentRestrictions: {country: w2gm_maps_objects.address_autocomplete_code}};
				else
					var options = { };
				var searchBox = new google.maps.places.Autocomplete(this, options);
			}
		});
		
		$('body').on('click', '.w2gm-show-on-map, .w2gm-listing-location', function() {
			var location_id = $(this).data("location-id");
			var map_id = $(this).parents(".w2gm-map-canvas-wrapper").data("id");

			w2gm_showInfoWindowByLocationId(location_id);
		});
	}
	
	window.w2gm_getDirections = function(origin, destination, map_id) {
		var directionsService = new google.maps.DirectionsService();
		if (typeof w2gm_directions_display[map_id] == "undefined") {
			w2gm_directions_display[map_id] = new google.maps.DirectionsRenderer(/*{map: w2gm_maps[map_id]}*/);
		}

		var request = {
			origin: origin,
			destination: destination,
			travelMode: google.maps.DirectionsTravelMode.DRIVING
		};

		directionsService.route(request, function(response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				w2gm_directions_display[map_id].setMap(null);
				w2gm_directions_display[map_id].setMap(w2gm_maps[map_id]);
				w2gm_directions_display[map_id].set('directions', null);
				$("#w2gm-route-container-"+map_id).html("");
				w2gm_directions_display[map_id].setPanel($("#w2gm-route-container-"+map_id)[0]);
				w2gm_directions_display[map_id].setDirections(response);
			} else {
				w2gm_handleDirectionsErrors(status);
			}
		});
	}
	
	// button from templates/maps/google_directions.tpl.php template
	$('body').on('click', '.w2gm-get-directions-button', function() {
		var map_id = $(this).data("id");
		var origin = $("#w2gm-origin-address-"+map_id).val();
		var destination = $(".w2gm-select-directions-"+map_id+":checked").val();
		w2gm_getDirections(origin, destination, map_id);
	});

	window.w2gm_showInfoWindowByLocationId = function(location_id, map_id) {
		var local_w2gm_maps = [];
		if (typeof  map_id != "undefined") {
			local_w2gm_maps[map_id] = w2gm_maps[map_id];
		} else {
			local_w2gm_maps = w2gm_maps;
		}
		
		for (var map_id in local_w2gm_maps) {
			if (typeof w2gm_global_locations_array[map_id] != 'undefined') {
				for (var i=0; i<w2gm_global_locations_array[map_id].length; i++) {
					if (typeof w2gm_global_locations_array[map_id][i] == 'object') {
						if (location_id == w2gm_global_locations_array[map_id][i].id) {
							var location_obj = w2gm_global_locations_array[map_id][i];
							if (!location_obj.is_ajax_markers) {
								w2gm_applyZoomOnClick(map_id);
								w2gm_showInfoWindow(location_obj, location_obj.marker, map_id);
								w2gm_panByInfoWindow(map_id);
								w2gm_setMapCenter(map_id, location_obj.marker.position);
							} else {
								var old_zoom = w2gm_maps[map_id].getZoom();
								var new_zoom = w2gm_applyZoomOnClick(map_id);
								if ((new_zoom && new_zoom != old_zoom) || w2gm_isCenterOnClick(map_id)) {
									w2gm_setMapCenter(map_id, location_obj.marker.position);
								}
								w2gm_showInfoWindowAJAXMarker(location_obj, location_obj.marker, map_id, true);
							}
						}
					}
				}
			}
		}
	}

	//$(function() {
	document.addEventListener("DOMContentLoaded", function() {
		if ((typeof google == 'undefined' || typeof google.maps == 'undefined') && !w2gm_maps_objects.notinclude_maps_api) {
			var script = document.createElement("script");
			script.type = "text/javascript";
			var key = '';
			var language = '';
			if (w2gm_maps_objects.google_api_key)
				key = "&key="+w2gm_maps_objects.google_api_key;
			if (w2gm_js_objects.lang)
				language = "&language="+w2gm_js_objects.lang;
			script.src = "//maps.google.com/maps/api/js?libraries=places"+key+"&callback="+w2gm_maps_callback.callback+language;
			document.body.appendChild(script);
		} else {
			w2gm_3rd_party_maps_plugin = true;
			window[w2gm_maps_callback.callback]();
		}
	});

	window.w2gm_countLocations = function(map_id) {
		if (typeof w2gm_locations_counters[map_id] != undefined) {
			var counter = $(w2gm_locations_counters[map_id]).find(".w2gm-map-locations-counter").get(0);
			$(counter).html(w2gm_global_locations_array[map_id].length);
		}
	}

	var w2gm_roadmap_name;
	var w2gm_satellite_name;
	window.w2gm_load_map = function(i) {
		var map_id = w2gm_map_markers_attrs_array[i].map_id;
		var markers_array = w2gm_map_markers_attrs_array[i].markers_array;
		var enable_radius_circle = w2gm_map_markers_attrs_array[i].radius_circle;
		var enable_clusters = w2gm_map_markers_attrs_array[i].clusters;
		var counter = w2gm_map_markers_attrs_array[i].counter;
		var counter_text = w2gm_map_markers_attrs_array[i].counter_text;
		var show_directions_button = w2gm_map_markers_attrs_array[i].show_directions_button;
		var map_style = w2gm_map_markers_attrs_array[i].map_style;
		var draw_panel = w2gm_map_markers_attrs_array[i].draw_panel;
		var show_readmore_button = w2gm_map_markers_attrs_array[i].show_readmore_button;
		var enable_full_screen = w2gm_map_markers_attrs_array[i].enable_full_screen;
		var enable_full_screen_by_default = w2gm_map_markers_attrs_array[i].enable_full_screen_by_default;
		var enable_wheel_zoom = w2gm_map_markers_attrs_array[i].enable_wheel_zoom;
		var enable_dragging_touchscreens = w2gm_map_markers_attrs_array[i].enable_dragging_touchscreens;
		var enable_onefinger_dragging_touchscreens = w2gm_map_markers_attrs_array[i].enable_onefinger_dragging_touchscreens;
		var show_directions = w2gm_map_markers_attrs_array[i].show_directions;
		var map_attrs = w2gm_map_markers_attrs_array[i].map_attrs;
		
		w2gm_sticky_scroll();
		
		if (document.getElementById("w2gm-map-canvas-"+map_id) && typeof google != 'undefined' && typeof google.maps != 'undefined') {
			if (typeof w2gm_fullScreens[map_id] == "undefined" || !w2gm_fullScreens[map_id]) {
				if (!w2gm_js_objects.is_rtl) {
					var cposition = google.maps.ControlPosition.RIGHT_TOP;
					var counter_position = google.maps.ControlPosition.RIGHT_BOTTOM;
				} else {
					var cposition = google.maps.ControlPosition.LEFT_TOP;
					var counter_position = google.maps.ControlPosition.LEFT_BOTTOM;
				}
				
				if (enable_dragging_touchscreens || !('ontouchstart' in document.documentElement)) {
					var enable_dragging = true;
				} else {
					var enable_dragging = false;
				}
				
				if (enable_onefinger_dragging_touchscreens || !('ontouchstart' in document.documentElement)) {
					var enable_onefinger_dragging = "greedy";
				} else {
					var enable_onefinger_dragging = "cooperative";
				}

				var mapOptions = {
						zoom: 1,
						draggable: enable_dragging,
						scrollwheel: enable_wheel_zoom,
						disableDoubleClickZoom: false,
						streetViewControl: true,
						streetViewControlOptions: {
							position: cposition
						},
						mapTypeControl: false,
						zoomControl: false,
						panControl: false,
						scaleControl: false,
						fullscreenControl: false,
						gestureHandling: enable_onefinger_dragging
				}
				if (map_style) {
					mapOptions.styles = eval(map_style);
				}
	
				w2gm_maps[map_id] = new google.maps.Map(document.getElementById("w2gm-map-canvas-"+map_id), mapOptions);
				w2gm_maps_attrs[map_id] = map_attrs;

				var customControls;
				google.maps.event.addListenerOnce(w2gm_maps[map_id], 'idle', function() {
					w2gm_info_window_by_hash(map_id);
					//w2gm_listing_window_by_hash();
					
					if (typeof w2gm_maps[map_id].controls[cposition].getAt(-2) != 'undefined') {
						w2gm_maps[map_id].controls[cposition].removeAt(-2);
					}
					customControls = document.createElement('div');
					customControls.index = -2;
					w2gm_maps[map_id].controls[cposition].push(customControls);
					$(customControls).addClass('w2gm-map-custom-controls');
					// required workaround, otherwise w2gm_maps[map_id].mapTypes.roadmap will be undefined on reload click
					if (!w2gm_roadmap_name) {
						w2gm_roadmap_name = w2gm_maps[map_id].mapTypes.roadmap.name;
					}
					// required workaround, otherwise w2gm_maps[map_id].mapTypes.satellite will be undefined on reload click
					if (!w2gm_satellite_name) {
						w2gm_satellite_name = w2gm_maps[map_id].mapTypes.satellite.name;
					}
					$(customControls).html('<div class="w2gm-btn-group"><button class="w2gm-btn w2gm-btn-primary w2gm-map-btn-zoom-in"><span class="w2gm-glyphicon w2gm-glyphicon-plus"></span></button><button class="w2gm-btn w2gm-btn-primary w2gm-map-btn-zoom-out"><span class="w2gm-glyphicon w2gm-glyphicon-minus"></span></button></div> <div class="w2gm-btn-group"><button class="w2gm-btn w2gm-btn-primary w2gm-map-btn-roadmap">'+w2gm_roadmap_name+'</button><button class="w2gm-btn w2gm-btn-primary w2gm-map-btn-satellite">'+w2gm_satellite_name+'</button>'+(enable_full_screen ? '<button class="w2gm-btn w2gm-btn-primary w2gm-map-btn-fullscreen"><span class="w2gm-glyphicon w2gm-glyphicon-fullscreen"></span></button>' : '')+'</div>');

					google.maps.event.addDomListener($(customControls).find('.w2gm-map-btn-zoom-in').get(0), 'click', function() {
						w2gm_maps[map_id].setZoom(w2gm_maps[map_id].getZoom() + 1);
					});
					google.maps.event.addDomListener($(customControls).find('.w2gm-map-btn-zoom-out').get(0), 'click', function() {
						w2gm_maps[map_id].setZoom(w2gm_maps[map_id].getZoom() - 1);
					});
					google.maps.event.addDomListener($(customControls).find('.w2gm-map-btn-roadmap').get(0), 'click', function() {
						w2gm_maps[map_id].setMapTypeId(google.maps.MapTypeId.ROADMAP);
					});
					google.maps.event.addDomListener($(customControls).find('.w2gm-map-btn-satellite').get(0), 'click', function() {
						w2gm_maps[map_id].setMapTypeId(google.maps.MapTypeId.HYBRID);
					});
					
					if (counter && counter_text) {
						if (typeof w2gm_maps[map_id].controls[counter_position].getAt(-2) != 'undefined') {
							w2gm_maps[map_id].controls[counter_position].removeAt(-2);
						}
						w2gm_locations_counters[map_id] = document.createElement('div');
						w2gm_locations_counters[map_id].index = -2;
						w2gm_maps[map_id].controls[counter_position].push(w2gm_locations_counters[map_id]);
						var counter_html = counter_text.replace('%d', '<span class="w2gm-map-locations-counter"></span>');
						$(w2gm_locations_counters[map_id])
						.addClass('w2gm-map-locations-counter-bar')
						.html(counter_html);
						w2gm_countLocations(map_id);
					}

					var bodyStyle = document.body.style;
					if (document.body.runtimeStyle)
						bodyStyle = document.body.runtimeStyle;
					var originalOverflow = bodyStyle.overflow;
					var thePanoramaOpened = false;
					
					if (enable_full_screen_by_default) {
						w2gm_fullScreens[map_id] = true;
						openFullScreen();
					}
					
					function openFullScreen() {
						var center = w2gm_maps[map_id].getCenter();
				    	
				    	document.body.style.overflow = "hidden";
				    	$(customControls).find('.w2gm-map-btn-fullscreen span').removeClass('w2gm-glyphicon-fullscreen');
				    	$(customControls).find('.w2gm-map-btn-fullscreen span').addClass('w2gm-glyphicon-resize-small');
				    	
				    	w2gm_callMapResize(map_id);
				        w2gm_setMapCenter(map_id, center);
				    	
				    	$("#w2gm-map-wrapper-"+map_id).addClass("w2gm-map-wrapper-full-screen");
				        
				        $(window).trigger('resize');
				        
				        $("body").addClass("w2gm-body-fullscreen-map");
					}
					function closeFullScreen() {
						var center = w2gm_maps[map_id].getCenter();
				    	
				    	document.body.style.overflow = originalOverflow;
			            $(customControls).find('.w2gm-map-btn-fullscreen span').removeClass('w2gm-glyphicon-resize-small');
				        $(customControls).find('.w2gm-map-btn-fullscreen span').addClass('w2gm-glyphicon-fullscreen');
	
				        w2gm_callMapResize(map_id);
				        w2gm_setMapCenter(map_id, center);
				    	
				    	$("#w2gm-map-wrapper-"+map_id).removeClass("w2gm-map-wrapper-full-screen");
				        
				        $(window).trigger('resize');
				        
				        $("body").removeClass("w2gm-body-fullscreen-map");
					}
					if (enable_full_screen) {
						google.maps.event.addDomListener($(customControls).find('.w2gm-map-btn-fullscreen').get(0), 'click', function() {
							if (typeof w2gm_fullScreens[map_id] == "undefined" || !w2gm_fullScreens[map_id]) {
								$("#w2gm-map-canvas-wrapper-"+map_id).addClass("w2gm-map-full-screen");
								w2gm_fullScreens[map_id] = true;
								openFullScreen();
							} else {
								$("#w2gm-map-canvas-wrapper-"+map_id).removeClass("w2gm-map-full-screen");
								w2gm_fullScreens[map_id] = false;
								closeFullScreen();
							}
						});
						$(document).on("keyup", function(e) {
							if (typeof w2gm_fullScreens[map_id] != "undefined" && w2gm_fullScreens[map_id] && e.keyCode == 27 && !thePanoramaOpened) {
								$("#w2gm-map-canvas-wrapper-"+map_id).removeClass("w2gm-map-full-screen");
								w2gm_fullScreens[map_id] = false;
								closeFullScreen();
							}
						});
					}
				});

				if (draw_panel) {
					if (typeof w2gm_maps[map_id].controls[cposition].getAt(-1) != 'undefined')
						w2gm_maps[map_id].controls[cposition].removeAt(-1);
					var drawPanel = document.createElement('div');
					drawPanel.index = -1;
					w2gm_maps[map_id].controls[cposition].push(drawPanel);
					$(drawPanel).addClass('w2gm-map-draw-panel');

					var drawButton = document.createElement('button');
					$(drawButton)
					.addClass('w2gm-btn w2gm-btn-primary w2gm-map-draw')
					.attr("title", w2gm_maps_objects.draw_area_button)
					.html('<span class="w2gm-glyphicon w2gm-glyphicon-pencil"></span>');

					drawPanel.appendChild(drawButton);
					drawButton.map_id = map_id;
					drawButton.drawing_state = 0;
					$(drawButton).on("click", function(e) {
						var map_id = drawButton.map_id;
						if (this.drawing_state == 0) {
							this.drawing_state = 1;
							window.addEventListener('touchmove', w2gm_stop_touchmove_listener, { passive: false });
							w2gm_clearMarkers(map_id);
							w2gm_closeInfoWindow(map_id);
							w2gm_removeShapes(map_id);
							w2gm_removeCircles(map_id);
		
							w2gm_enableDrawingMode(map_id);
							
							var editButton = $(w2gm_maps[map_id].getDiv()).find('.w2gm-map-edit').get(0);
							$(editButton).attr('disabled', 'disabled');
		
							// remove ajax_loading and set drawing_state
							var map_attrs_array;
							if (map_attrs_array = w2gm_get_map_markers_attrs_array(map_id)) {
								map_attrs_array.map_attrs.drawing_state = 1;
								google.maps.event.clearListeners(w2gm_maps[map_id], 'idle');
								delete map_attrs_array.map_attrs.ajax_loading;
							}
			
							w2gm_maps[map_id].setOptions({ draggableCursor: 'crosshair' });
							$(this).toggleClass('w2gm-btn-active');
							
							w2gm_maps[map_id].getDiv().map_id = map_id;
							if ($('body').hasClass('w2gm-touch')) {
								w2gm_drawFreeHandPolygon(this.map_id);
							} else {
								google.maps.event.clearListeners(w2gm_maps[map_id].getDiv(), 'mousedown');
								google.maps.event.addDomListener(w2gm_maps[map_id].getDiv(), 'mousedown', function(e) {
									var el = e.target;
									do {
										if ($(el).hasClass('w2gm-map-draw-panel')) {
											return;
										}
									} while (el = el.parentNode);
									w2gm_drawFreeHandPolygon(this.map_id);
								});
							}
						} else if (this.drawing_state == 1) {
							this.drawing_state = 0;
							window.removeEventListener('touchmove', w2gm_stop_touchmove_listener, { passive: false });
							w2gm_disableDrawingMode(map_id);
							w2gm_maps[map_id].setOptions({ draggableCursor: '' });
							$(this).toggleClass('w2gm-btn-active');
							google.maps.event.clearListeners(w2gm_maps[map_id].getDiv(), 'mousedown');
							
							// repair ajax_loading and set drawing_state
							var map_attrs_array;
							if (map_attrs_array = w2gm_get_map_markers_attrs_array(map_id)) {
								map_attrs_array.map_attrs.drawing_state = 0;
								if (typeof w2gm_get_original_map_markers_attrs_array(map_id).map_attrs.ajax_loading != 'undefined' && w2gm_get_original_map_markers_attrs_array(map_id).map_attrs.ajax_loading == 1) {
									map_attrs_array.map_attrs.ajax_loading = 1;
									google.maps.event.addListener(w2gm_maps[map_id], 'idle', function() {
										w2gm_setAjaxMarkers(w2gm_maps[map_id], map_id); // draw button
									});
								}
							}
						}
					});
					
					var editButton = document.createElement('button');
					$(editButton)
					.addClass('w2gm-btn w2gm-btn-primary w2gm-map-edit')
					.attr("title", w2gm_maps_objects.edit_area_button)
					.html('<span class="w2gm-glyphicon w2gm-glyphicon-edit"></span>')
					.attr('disabled', 'disabled');
					
					drawPanel.appendChild(editButton);
					editButton.map_id = map_id;
					editButton.editing_state = 0;
					$(editButton).on("click", function(e) {
						var map_id = editButton.map_id;
						if (this.editing_state == 0) {
							this.editing_state = 1;
							$(this).toggleClass('w2gm-btn-active');
							$(this).attr("title", w2gm_maps_objects.apply_area_button);
							if (typeof w2gm_polygons[map_id] != 'undefined') {
								w2gm_polygons[map_id].setOptions({'editable': true});
							}
						} else if (this.editing_state == 1) {
							this.editing_state = 0;
							$(this).toggleClass('w2gm-btn-active');
							$(this).attr("title", w2gm_maps_objects.edit_area_button);
							if (typeof w2gm_polygons[map_id] != 'undefined') {
								w2gm_polygons[map_id].setOptions({'editable': false});
								var path = w2gm_polygons[map_id].getPath();
								var theArrayofLatLng = path.j;
								var geo_poly = [];
								var lat_lng;
								for (lat_lng in theArrayofLatLng) {
									geo_poly.push({'lat': theArrayofLatLng[lat_lng].lat(), 'lng': theArrayofLatLng[lat_lng].lng()});
								}
		
								w2gm_sendGeoPolyAJAX(map_id, geo_poly);
							}
						}
					});
					
					var reloadButton = document.createElement('button');
					$(reloadButton)
					.addClass('w2gm-btn w2gm-btn-primary w2gm-map-reload')
					.attr("title", w2gm_maps_objects.reload_map_button)
					.html('<span class="w2gm-glyphicon w2gm-glyphicon-refresh"></span>');
					
					drawPanel.appendChild(reloadButton);
					reloadButton.map_id = map_id;
					$(reloadButton).on("click", function(e) {
						var map_id = reloadButton.map_id;
						for (var i=0; i<w2gm_map_markers_attrs_array.length; i++) {
							if (w2gm_map_markers_attrs_array[i].map_id == map_id) {
								w2gm_map_markers_attrs_array[i] = JSON.parse(JSON.stringify(_w2gm_map_markers_attrs_array[i]));
								
								window.removeEventListener('touchmove', w2gm_stop_touchmove_listener, { passive: false });
		
								var editButton = $(w2gm_maps[map_id].getDiv()).find('.w2gm-map-edit').get(0);
								$(editButton).removeClass('w2gm-btn-active');
								$(editButton).find('.w2gm-map-edit-label').text(w2gm_maps_objects.edit_area_button);
								$(editButton).attr('disabled', 'disabled');
		
								w2gm_clearMarkers(map_id);
								w2gm_closeInfoWindow(map_id);
								w2gm_removeShapes(map_id);
								w2gm_removeCircles(map_id);
								// temporarily disable full screen
								var initial_enable_full_screen_by_default = w2gm_map_markers_attrs_array[i].enable_full_screen_by_default;
								w2gm_map_markers_attrs_array[i].enable_full_screen_by_default = 0;
								w2gm_load_map(i);
								google.maps.event.trigger(w2gm_maps[map_id], 'idle');
								w2gm_map_markers_attrs_array[i].enable_full_screen_by_default = initial_enable_full_screen_by_default;
								break;
							}
						}
					});

					if (w2gm_maps_objects.enable_my_location_button) {
						google.maps.event.addListenerOnce(w2gm_maps[map_id], 'tilesloaded', function(){
							var locationButton = document.createElement('button');
							$(locationButton)
							.addClass('w2gm-btn w2gm-btn-primary w2gm-map-location')
							.attr("title", w2gm_maps_objects.my_location_button)
							.html('<span class="w2gm-glyphicon w2gm-glyphicon-screenshot"></span>');

							drawPanel.appendChild(locationButton);
								
							locationButton.map_id = map_id;
							$(locationButton).on("click", function(e) {
								var map_id = locationButton.map_id;
								if (navigator.geolocation) {
								   	navigator.geolocation.getCurrentPosition(
								   		function(position) {
											var start_latitude = position.coords.latitude;
											var start_longitude = position.coords.longitude;
											w2gm_maps[map_id].setCenter(new google.maps.LatLng(start_latitude, start_longitude));
										},
										function(e) {
									   		//alert(e.message);
										},
									   	{timeout: 10000}
									);
								}
							});
						});
					}
				}
			} // end of (!fullScreen)

			w2gm_global_markers_array[map_id] = [];
			w2gm_global_locations_array[map_id] = [];

			var bounds = new google.maps.LatLngBounds();
			if (markers_array.length) {
				if (typeof map_attrs.ajax_markers_loading != 'undefined' && map_attrs.ajax_markers_loading == 1)
					var is_ajax_markers = true;
				else
					var is_ajax_markers = false;
	
				var markers = [];
				for (var j=0; j<markers_array.length; j++) {
					var map_coords_1 = markers_array[j][2];
					var map_coords_2 = markers_array[j][3];
					if ($.isNumeric(map_coords_1) && $.isNumeric(map_coords_2)) {
						var point = new google.maps.LatLng(map_coords_1, map_coords_2);
						bounds.extend(point);
	
						var location_obj = new w2gm_glocation(
							markers_array[j][0],  // location ID
							markers_array[j][1],  // listing ID
							point, 
							markers_array[j][4],  // map icon file
							markers_array[j][5],  // map icon color
							markers_array[j][7],  // listing title
							markers_array[j][8],  // logo image
							markers_array[j][9],  // content fields output
							show_directions_button,
							show_readmore_button,
							map_id,
							is_ajax_markers
						);
						var marker = location_obj.w2gm_placeMarker(map_id);
						markers.push(marker);
	
						w2gm_global_locations_array[map_id].push(location_obj);
					}
				}
				
				// do not fit bounds when there is starting address or coordinates, otherwise it will not center as expected,
				// but do it when starting zoom was not defined
				if (
					(
							!(typeof map_attrs.start_latitude != 'undefined' && map_attrs.start_latitude && typeof map_attrs.start_longitude != 'undefined' && map_attrs.start_longitude)
							&
							!(typeof map_attrs.start_address != 'undefined' && map_attrs.start_address)
					)
					||
					!(typeof map_attrs.start_zoom != 'undefined' && map_attrs.start_zoom)
				) {
					w2gm_mapFitBounds(map_id, bounds);
				}
	
				w2gm_setClusters(enable_clusters, map_id, markers);
				
				if (typeof window['radius_params'] != 'undefined') {
					var radius_params = window['radius_params'];
					
					w2gm_saveGeocodedCoordinates(radius_params, map_id);
		
					if (enable_radius_circle) {
						w2gm_drawRadius(radius_params, map_id);
					}
				}
			}
			
			w2gm_countLocations(map_id);
			w2gm_setMapZoomCenter(map_id, map_attrs, markers_array);
			
			// show markers of the current viewport only
			if (!enable_clusters) {
				google.maps.event.addListener(w2gm_maps[map_id], "idle", function (event) {
					var bounds = w2gm_maps[map_id].getBounds();
					
					if (typeof bounds != 'undefined') {
						w2gm_global_markers_array[map_id].forEach(function (item) {
							if (bounds.contains(item.position)) {
								if (item.map != w2gm_maps[map_id]){
									item.setMap(w2gm_maps[map_id]);
								}
							} else {
								item.setMap(null);
							}
						});
					}
				});
			}
		}
	}

	function w2gm_setMapAjaxListener(map, map_id, search_button_obj) {
		var search_button_obj = typeof search_button_obj !== 'undefined' ? search_button_obj : null;

		google.maps.event.addListener(map, 'idle', function() {
			w2gm_setAjaxMarkers(map, map_id, search_button_obj); // idle listener
		});
	}
	function w2gm_geocodeStartAddress(map_attrs, map_id, zoom_level) {
		var start_address = map_attrs.start_address;
		function _geocodeStartAddress(status, start_latitude, start_longitude) {
			if (status == true) {
				w2gm_setMapCenter(map_id, new google.maps.LatLng(start_latitude, start_longitude));
				w2gm_setMapZoom(map_id, zoom_level);
				
				if (typeof map_attrs.geolocation != 'undefined' && map_attrs.geolocation == 1) {
			    	w2gm_geolocatePosition();
				}
				
				if (typeof map_attrs.ajax_loading != 'undefined' && map_attrs.ajax_loading == 1) {
					// use closures here
					w2gm_setMapAjaxListener(w2gm_maps[map_id], map_id);
				}
			}
		}
		w2gm_geocodeAddress(start_address, _geocodeStartAddress);
	}
	function w2gm_geolocatePosition() {
		if (navigator.geolocation) {
			var geolocation_maps = [];
			for (var map_id in w2gm_maps_attrs) {
				if (typeof w2gm_maps_attrs[map_id].geolocation != 'undefined' && w2gm_maps_attrs[map_id].geolocation == 1) {
					geolocation_maps.push({ 'map': w2gm_maps[map_id], 'map_id': map_id});
				}
			}
			if (geolocation_maps.length) {
				navigator.geolocation.getCurrentPosition(
					function(position) {
						var start_latitude = position.coords.latitude;
						var start_longitude = position.coords.longitude;
						//start_latitude = 40.7143528;
						//start_longitude = -74.0059731;
						for (var i in geolocation_maps) {
							var map_id = geolocation_maps[i].map_id;
							
							w2gm_setMapCenter(map_id, new google.maps.LatLng(start_latitude, start_longitude));

							if (typeof w2gm_maps_attrs[map_id].start_zoom != 'undefined' && w2gm_maps_attrs[map_id].start_zoom > 0) {
								w2gm_setMapZoom(map_id, w2gm_maps_attrs[map_id].start_zoom);
							}

							for (var j=0; j<w2gm_map_markers_attrs_array.length; j++) {
								if (w2gm_map_markers_attrs_array[j].map_id == map_id) {
									w2gm_map_markers_attrs_array[j].map_attrs.start_latitude = start_latitude;
									w2gm_map_markers_attrs_array[j].map_attrs.start_longitude = start_longitude;
								}
							}
						}
					}, 
					function(e) {
						//alert(e.message);
					},
					{timeout: 10000}
				);
			}
		}
	}
	function w2gm_project(latLng) {
		var TILE_SIZE = 256;
		var siny = Math.sin(latLng.lat() * Math.PI / 180);
		siny = Math.min(Math.max(siny, -0.9999), 0.9999);
		return new google.maps.Point(
		   TILE_SIZE * (0.5 + latLng.lng() / 360),
		   TILE_SIZE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)));
	}
	window.w2gm_clearMapBounds = function() {
		// clear bounds
		for (var i=0; i<w2gm_map_markers_attrs_array.length; i++) {
			delete w2gm_map_markers_attrs_array[i].map_attrs.swLat;
			delete w2gm_map_markers_attrs_array[i].map_attrs.swLng;
			delete w2gm_map_markers_attrs_array[i].map_attrs.neLat;
			delete w2gm_map_markers_attrs_array[i].map_attrs.neLng;
		}
	}
	window.w2gm_setAjaxMarkers = function(map, map_id, search_button_obj) {
		var bounds_change_max_offset = 140;
		var attrs_array = w2gm_get_map_markers_attrs_array(map_id);
		var map_attrs = attrs_array.map_attrs;
		var enable_radius_circle = attrs_array.radius_circle;
		var enable_clusters = attrs_array.clusters;
		var show_directions_button = attrs_array.show_directions_button;
		var show_readmore_button = attrs_array.show_readmore_button;
		
		/*var address_string = '';
		if (address_string = wcsearch_get_query_string_param('address')) {
			if (typeof w2gm_searchAddresses[map_id] == "undefined" || w2gm_searchAddresses[map_id] != address_string) {
				var geocoder = new google.maps.Geocoder();
				geocoder.geocode({'address': address_string}, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						var latitude = results[0].geometry.location.lat();
						var longitude = results[0].geometry.location.lng();
					}
					map.panTo(new google.maps.LatLng(latitude, longitude));

					w2gm_setAjaxMarkers(map, map_id);
				});
				w2gm_searchAddresses[map_id] = address_string;
				
				return false;
			}
		}*/
	
		var bounds_new = map.getBounds();
		if (bounds_new) {
			var south_west = bounds_new.getSouthWest();
			var north_east = bounds_new.getNorthEast();
		} else {
			return false;
		}
		
		wcsearch_insert_param_in_uri('swLat', south_west.lat());
		wcsearch_insert_param_in_uri('swLng', south_west.lng());
		wcsearch_insert_param_in_uri('neLat', north_east.lat());
		wcsearch_insert_param_in_uri('neLng', north_east.lng());
	
		if (typeof map_attrs.swLat != 'undefined' && typeof map_attrs.swLng != 'undefined' && typeof map_attrs.neLat != 'undefined' && typeof map_attrs.neLng != 'undefined') {
			var bounds_old = new google.maps.LatLngBounds();
			var sw_point = new google.maps.LatLng(map_attrs.swLat, map_attrs.swLng);
			var ne_point = new google.maps.LatLng(map_attrs.neLat, map_attrs.neLng);
			bounds_old.extend(sw_point);
			bounds_old.extend(ne_point);
	
			var scale = 1 << map.getZoom();
			var worldCoordinate_new = w2gm_project(sw_point);
			var worldCoordinate_old = w2gm_project(south_west);
			if (
				(bounds_old.contains(south_west) && bounds_old.contains(north_east))
				||
					(bounds_change_max_offset > Math.abs(Math.floor(worldCoordinate_new.x*scale) - Math.floor(worldCoordinate_old.x*scale))
					&&
					bounds_change_max_offset > Math.abs(Math.floor(worldCoordinate_new.y*scale) - Math.floor(worldCoordinate_old.y*scale)))
			)
				return false;
		}
		
		// save bounds
		for (var i=0; i<w2gm_map_markers_attrs_array.length; i++) {
			if (w2gm_map_markers_attrs_array[i].map_id == map_id) {
				w2gm_map_markers_attrs_array[i].map_attrs.swLat = south_west.lat();
				w2gm_map_markers_attrs_array[i].map_attrs.swLng = south_west.lng();
				w2gm_map_markers_attrs_array[i].map_attrs.neLat = north_east.lat();
				w2gm_map_markers_attrs_array[i].map_attrs.neLng = north_east.lng();
			}
		}
		
		var post_params = w2gm_collectAJAXParams({ hash: map_id, from_set_ajax: 1 });
		post_params.swLat = south_west.lat();
		post_params.swLng = south_west.lng();
		post_params.neLat = north_east.lat();
		post_params.neLng = north_east.lng();
		
		if (attrs_array.use_ajax_loader) {
			w2gm_ajax_loader_target_show($('#w2gm-map-canvas-'+map_id));
		}
	
		$.ajax({
			type: "POST",
			url: w2gm_js_objects.ajaxurl,
			data: post_params,
			dataType: 'json',
			success: function(response_from_the_action_function) {
				if (response_from_the_action_function) {
					var map_id = response_from_the_action_function.hash;
					var attrs_array = w2gm_get_map_markers_attrs_array(map_id);
					if (attrs_array.use_ajax_loader) {
						w2gm_ajax_loader_target_hide("w2gm-map-canvas-"+map_id);
					}
					
					// check opened info window
					var opened_location;
					var keep_info_window_opened = false;
		    		if (typeof w2gm_infoWindows[map_id] != 'undefined') {
		    			opened_location = w2gm_infoWindows[map_id].location;
		    		}

					var map_listings_block = $('#w2gm-map-listings-panel-'+map_id);
					if (map_listings_block.length) {
						map_listings_block.find(".w2gm-no-listings-found").remove();
						if (!response_from_the_action_function.map_listings) {
			    			var empty_listings = $("<p />").addClass("w2gm-no-listings-found").html(w2gm_js_objects.no_listings);
			    			map_listings_block.html(empty_listings[0].outerHTML);
			    		} else {
			    			map_listings_block.html(response_from_the_action_function.map_listings);
			    		}
						
						if (opened_location) {
							w2gm_scrollToListingLocation(map_id, opened_location.id, 0);
							w2gm_highlightListingLocation(opened_location.id);
			    		}
					}
					
					w2gm_clearMarkers(map_id);
					w2gm_removeShapes(map_id);
					w2gm_removeCircles(map_id);
					
					if (typeof map_attrs.ajax_markers_loading != 'undefined' && map_attrs.ajax_markers_loading == 1)
						var is_ajax_markers = true;
					else
						var is_ajax_markers = false;
		
					var markers_array = response_from_the_action_function.map_markers;
					w2gm_global_locations_array[map_id] = [];
					for (var j=0; j<markers_array.length; j++) {
						var map_coords_1 = markers_array[j][2];
						var map_coords_2 = markers_array[j][3];
						if ($.isNumeric(map_coords_1) && $.isNumeric(map_coords_2)) {
							var point = new google.maps.LatLng(map_coords_1, map_coords_2);
	
							var location_obj = new w2gm_glocation(
								markers_array[j][0],
								markers_array[j][1],
								point, 
								markers_array[j][4],
								markers_array[j][5],
								markers_array[j][7],
								markers_array[j][8],
								markers_array[j][9],
								show_directions_button,
								show_readmore_button,
								map_id,
								is_ajax_markers
							);
							var marker = location_obj.w2gm_placeMarker(map_id);

							w2gm_global_locations_array[map_id].push(location_obj);
							
							// check opened info window
				    		if (opened_location && opened_location.id == location_obj.id) {
				    			keep_info_window_opened = true;
				    		}
						}
					}

					if (!keep_info_window_opened) {
						w2gm_closeInfoWindow(map_id);
					}
					
					w2gm_countLocations(map_id);
					w2gm_setClusters(enable_clusters, map_id, w2gm_global_markers_array[map_id]);
					
					if (typeof response_from_the_action_function.radius_params != 'undefined') {
						var radius_params = response_from_the_action_function.radius_params;
						
						w2gm_saveGeocodedCoordinates(radius_params, map_id);

						if (enable_radius_circle) {
							
							w2gm_drawRadius(radius_params, map_id);
						}
					}
				}
			},
			complete: w2gm_completeAJAXSearchOnMap(map_id, search_button_obj)
		});
	}
	var w2gm_completeAJAXSearchOnMap = function(map_id, search_button_obj) {
		return function() {
			
		}
	}
	window.w2gm_drawRadius = function(radius_params, map_id) {
		var map_radius = parseFloat(radius_params.radius_value);
		
		if (radius_params.dimension == 'miles') {
			map_radius *= 1.609344;
		}

		var map_coords_1 = radius_params.map_coords_1;
		var map_coords_2 = radius_params.map_coords_2;

		if ($.isNumeric(map_coords_1) && $.isNumeric(map_coords_2)) {
			map_radius *= 1000; // we need radius exactly in meters
			w2gm_drawCircles[map_id] = new google.maps.Circle({
				center: new google.maps.LatLng(map_coords_1, map_coords_2),
				radius: map_radius,
				strokeColor: "#FF0000",
				strokeOpacity: 0.25,
				strokeWeight: 1,
				fillColor: "#FF0000",
				fillOpacity: 0.1,
				map: w2gm_maps[map_id]
			});
			google.maps.event.addListener(w2gm_drawCircles[map_id], 'mouseup', function(event) {
				w2gm_dragended = false;
			});
		}
	}
	
	var w2gm_bouncing_z_index = 0;
	var w2gm_bouncing_marker = null;
	var w2gm_bouncing_timer = null;
	function w2gm_doBounce(element, times, distance, speed) {
		if (!w2gm_bouncing_marker) {
			return;
		}
		
		if (!w2gm_bouncing_marker.is(':animated')) {
			w2gm_bouncing_marker.stop(true, true);
			
			for (var i = 0; i < times; i++) {
				element
				.animate({marginTop: '-='+distance},speed)
				.animate({marginTop: '+='+distance},speed);
			}
		}
		
		w2gm_bouncing_timer = window.setTimeout(function() {
			w2gm_doBounce(element, times, distance, speed);
		}, 0);
	}
	
	window.w2gm_placeMarker = function(location, map_id) {
		if (w2gm_maps_objects.map_markers_type != 'icons') {
			if (w2gm_maps_objects.global_map_icons_path != '') {
				var re = /(?:\.([^.]+))?$/;
				if (location.map_icon_file && typeof re.exec(w2gm_maps_objects.global_map_icons_path+'icons/'+location.map_icon_file)[1] != "undefined")
					var icon_file = w2gm_maps_objects.global_map_icons_path+'icons/'+location.map_icon_file;
				else
					var icon_file = w2gm_maps_objects.global_map_icons_path+"blank.png";
		
				var customIcon = {
					url: icon_file,
					size: new google.maps.Size(parseInt(w2gm_maps_objects.marker_image_width), parseInt(w2gm_maps_objects.marker_image_height)),
					origin: new google.maps.Point(0, 0),
					anchor: new google.maps.Point(parseInt(w2gm_maps_objects.marker_image_anchor_x), parseInt(w2gm_maps_objects.marker_image_anchor_y))
				};
		
				var marker = new google.maps.Marker({
					position: location.point,
					map: w2gm_maps[map_id],
					icon: customIcon,
					animation: google.maps.Animation.DROP
				});
			} else {
				var marker = new google.maps.Marker({
					position: location.point,
					map: w2gm_maps[map_id],
					animation: google.maps.Animation.DROP
				});
			}
			
			$(document).on("mouseenter", ".w2gm-listing-has-location-"+location.id, {marker: marker}, function(event) {
				event.data.marker.setAnimation(google.maps.Animation.BOUNCE);
			});
			$(document).on("mouseleave", ".w2gm-listing-has-location-"+location.id, {marker: marker}, function(event) {
				event.data.marker.setAnimation(null);
			});
			
			w2gm_dragended = false;
		} else {
			w2gm_load_richtext();
			
			if (location.map_icon_color)
				var map_marker_color = location.map_icon_color;
			else
				var map_marker_color = w2gm_maps_objects.default_marker_color;

			if (typeof location.map_icon_file == 'string' && location.map_icon_file.indexOf("w2gm-fa-") != -1) {
				var map_marker_icon = '<span class="w2gm-map-marker-icon w2gm-fa '+location.map_icon_file+'" style="color: '+map_marker_color+';"></span>';
				var map_marker_class = 'w2gm-map-marker';
			} else {
				if (w2gm_maps_objects.default_marker_icon) {
					var map_marker_icon = '<span class="w2gm-map-marker-icon w2gm-fa '+w2gm_maps_objects.default_marker_icon+'" style="color: '+map_marker_color+';"></span>';
					var map_marker_class = 'w2gm-map-marker';
				} else {
					var map_marker_icon = '';
					var map_marker_class = 'w2gm-map-marker-empty';
				}
			}

			/**
			 * RichMarker was modified to reduce the number of nested divs,
			 * now each marker consists of 3 elements inside each other
			 */
			var marker = new RichMarker({
				div_class: map_marker_class,
				color: map_marker_color,
				location: location,
				position: location.point,
				map: w2gm_maps[map_id],
				flat: true,
				content: map_marker_icon
			});
			
			w2gm_dragended = false;
			google.maps.event.addListener(w2gm_maps[map_id], 'dragend', function(event) {
				w2gm_dragended = true;
			});
			google.maps.event.addListener(w2gm_maps[map_id], 'mouseup', function(event) {
				w2gm_dragended = false;
			});
			
			google.maps.event.addListener(marker, 'ready', function() {
				$(".w2gm-listing-has-location-"+location.id)
				.on("mouseenter", function(event) {
					if (!w2gm_bouncing_marker) {
						if ($('.w2gm-map-marker-'+location.id).is(':visible')) {
							w2gm_bouncing_z_index++;
							$('.w2gm-map-marker-'+location.id).css("z-index", w2gm_bouncing_z_index);
							w2gm_bouncing_marker = $('.w2gm-map-marker-'+location.id).parent();
							w2gm_doBounce(w2gm_bouncing_marker, 10, '10px', 300);
						}
					}
				})
				.on("mouseleave", function(event) {
					if (w2gm_bouncing_marker) {
						w2gm_bouncing_marker.finish();
						w2gm_bouncing_marker = null;
						window.clearTimeout(w2gm_bouncing_timer);
						w2gm_bouncing_timer = null;
					}
				});
			});
		}
		
		w2gm_global_markers_array[map_id].push(marker);

		google.maps.event.addListener(marker, 'click', function() {
			if (!w2gm_dragended) {
				w2gm_scrollToListingLocation(map_id, location.id, 'fast');
				w2gm_highlightListingLocation(location.id);

				var old_zoom = w2gm_maps[map_id].getZoom();
				var new_zoom = w2gm_applyZoomOnClick(map_id);
				if ((new_zoom && new_zoom != old_zoom) || w2gm_isCenterOnClick(map_id)) {
					w2gm_setMapCenter(map_id, location.marker.position);
				}
				
				if (!location.is_ajax_markers) {
					w2gm_showInfoWindow(location, marker, map_id);
					//w2gm_panByInfoWindow(map_id);
				} else {
					w2gm_showInfoWindowAJAXMarker(location, marker, map_id, true);
				}
				
				w2gm_placeDestination(location, map_id);
			}
		});
	
		return marker;
	}
	window.w2gm_showInfoWindowAJAXMarker = function(location, marker, map_id, do_panby) {
		var attrs_array = w2gm_get_map_markers_attrs_array(map_id);
		
		if (attrs_array.use_ajax_loader) {
			w2gm_ajax_loader_target_show($('#w2gm-map-canvas-'+map_id));
		}

		var post_data = {
				'location_id': location.id,
				'action': 'w2gm_get_map_marker_info',
				'map_id': map_id,
				'show_directions_button': location.show_directions_button,
				'show_readmore_button': location.show_readmore_button
		};
		$.ajax({
			type: "POST",
			url: w2gm_js_objects.ajaxurl,
			data: eval(post_data),
			map_id: map_id,
			location: location,
			marker: marker,
			dataType: 'json',
			success: function(response_from_the_action_function) {
				var map_id = this.map_id;
				var location = this.location;
				var marker = this.marker;
				var marker_array = response_from_the_action_function;
				var map_coords_1 = marker_array[2];
				var map_coords_2 = marker_array[3];
				if ($.isNumeric(map_coords_1) && $.isNumeric(map_coords_2)) {
					var point = new google.maps.LatLng(map_coords_1, map_coords_2);

					var new_location_obj = new w2gm_glocation(
						marker_array[0],
						marker_array[1],
						point, 
						marker_array[4],
						marker_array[5],
						marker_array[7],
						marker_array[8],
						marker_array[9],
						location.show_directions_button,
						location.show_readmore_button,
						map_id,
						true
					);
					w2gm_showInfoWindow(new_location_obj, marker, map_id);
					
					if (do_panby) {
						w2gm_panByInfoWindow(map_id);
					}
				}
			},
			complete: function() {
				var map_id = this.map_id
				w2gm_ajax_loader_target_hide("w2gm-map-canvas-"+map_id);
			}
		});
	}
	function w2gm_scrollToListingLocation(map_id, location_id, speed) {
		if ($('#w2gm-map-listings-panel-'+map_id).length) {
			if ($('#w2gm-map-sidebar-'+map_id+' #post-'+location_id).length) {
				$('#w2gm-map-sidebar-'+map_id).scrollTop(
						$('#w2gm-map-sidebar-'+map_id).scrollTop()
						+
						$('#w2gm-map-sidebar-'+map_id+' #post-'+location_id).offset().top
						-
						$('#w2gm-map-sidebar-'+map_id).offset().top
				);
			}
		}
	}
	function w2gm_highlightListingLocation(location_id) {
		$(".w2gm-listing-location-selected").removeClass("w2gm-listing-location-selected");
		$(".w2gm-listing-location[data-location-id='" + location_id + "']").addClass("w2gm-listing-location-selected");
	}
	// This function builds info Window and shows it hiding another
	function w2gm_showInfoWindow(w2gm_glocation, marker, map_id) {
		
		// infobox_packed.js -------------------------------------------------------------------------------------------------------------------------------------------
		function InfoBox(t){t=t||{},google.maps.OverlayView.apply(this,arguments),this.content_=t.content||"",this.disableAutoPan_=t.disableAutoPan||!1,this.maxWidth_=t.maxWidth||0,this.pixelOffset_=t.pixelOffset||new google.maps.Size(0,0),this.position_=t.position||new google.maps.LatLng(0,0),this.zIndex_=t.zIndex||null,this.boxClass_=t.boxClass||"infoBox",this.boxStyle_=t.boxStyle||{},this.closeBoxMargin_=t.closeBoxMargin||"2px",this.closeBoxURL_=t.closeBoxURL||"http://www.google.com/intl/en_us/mapfiles/close.gif",""===t.closeBoxURL&&(this.closeBoxURL_=""),this.infoBoxClearance_=t.infoBoxClearance||new google.maps.Size(1,1),"undefined"==typeof t.visible&&(t.visible="undefined"==typeof t.isHidden?!0:!t.isHidden),this.isHidden_=!t.visible,this.alignBottom_=t.alignBottom||!1,this.pane_=t.pane||"floatPane",this.enableEventPropagation_=t.enableEventPropagation||!1,this.div_=null,this.closeListener_=null,this.moveListener_=null,this.contextListener_=null,this.eventListeners_=null,this.fixedWidthSet_=null}InfoBox.prototype=new google.maps.OverlayView,InfoBox.prototype.createInfoBoxDiv_=function(){var t,e,i,o=this,s=function(t){t.cancelBubble=!0,t.stopPropagation&&t.stopPropagation()},n=function(t){t.returnValue=!1,t.preventDefault&&t.preventDefault(),o.enableEventPropagation_||s(t)};if(!this.div_){if(this.div_=document.createElement("div"),this.setBoxStyle_(),"undefined"==typeof this.content_.nodeType?this.div_.innerHTML=this.getCloseBoxImg_()+this.content_:(this.div_.innerHTML=this.getCloseBoxImg_(),this.div_.appendChild(this.content_)),this.getPanes()[this.pane_].appendChild(this.div_),this.addClickHandler_(),this.div_.style.width?this.fixedWidthSet_=!0:0!==this.maxWidth_&&this.div_.offsetWidth>this.maxWidth_?(this.div_.style.width=this.maxWidth_,this.div_.style.overflow="auto",this.fixedWidthSet_=!0):(i=this.getBoxWidths_(),this.div_.style.width=this.div_.offsetWidth-i.left-i.right+"px",this.fixedWidthSet_=!1),this.panBox_(this.disableAutoPan_),!this.enableEventPropagation_){for(this.eventListeners_=[],e=["mousedown","mouseover","mouseout","mouseup","click","dblclick","touchstart","touchend","touchmove"],t=0;t<e.length;t++)this.eventListeners_.push(google.maps.event.addDomListener(this.div_,e[t],s));this.eventListeners_.push(google.maps.event.addDomListener(this.div_,"mouseover",function(){this.style.cursor="default"}))}this.contextListener_=google.maps.event.addDomListener(this.div_,"contextmenu",n),google.maps.event.trigger(this,"domready")}},InfoBox.prototype.getCloseBoxImg_=function(){var t="";return""!==this.closeBoxURL_&&(t="<img",t+=" src='"+this.closeBoxURL_+"'",t+=" align=right",t+=" style='",t+=" position: relative;",t+=" cursor: pointer;",t+=" margin: "+this.closeBoxMargin_+";",t+="'>"),t},InfoBox.prototype.addClickHandler_=function(){var t;""!==this.closeBoxURL_?(t=this.div_.firstChild,this.closeListener_=google.maps.event.addDomListener(t,"click",this.getCloseClickHandler_())):this.closeListener_=null},InfoBox.prototype.getCloseClickHandler_=function(){var t=this;return function(e){e.cancelBubble=!0,e.stopPropagation&&e.stopPropagation(),google.maps.event.trigger(t,"closeclick"),t.close()}},InfoBox.prototype.panBox_=function(t){var e,i,o=0,s=0;if(!t&&(e=this.getMap(),e instanceof google.maps.Map)){e.getBounds().contains(this.position_)||e.setCenter(this.position_),i=e.getBounds();var n=e.getDiv(),h=n.offsetWidth,d=n.offsetHeight,l=this.pixelOffset_.width,r=this.pixelOffset_.height,a=this.div_.offsetWidth,p=this.div_.offsetHeight,_=this.infoBoxClearance_.width,f=this.infoBoxClearance_.height,v=this.getProjection().fromLatLngToContainerPixel(this.position_);if(v.x<-l+_?o=v.x+l-_:v.x+a+l+_>h&&(o=v.x+a+l+_-h),this.alignBottom_?v.y<-r+f+p?s=v.y+r-f-p:v.y+r+f>d&&(s=v.y+r+f-d):v.y<-r+f?s=v.y+r-f:v.y+p+r+f>d&&(s=v.y+p+r+f-d),0!==o||0!==s){{e.getCenter()}e.panBy(o,s)}}},InfoBox.prototype.setBoxStyle_=function(){var t,e;if(this.div_){this.div_.className=this.boxClass_,this.div_.style.cssText="",e=this.boxStyle_;for(t in e)e.hasOwnProperty(t)&&(this.div_.style[t]=e[t]);this.div_.style.WebkitTransform="translateZ(0)","undefined"!=typeof this.div_.style.opacity&&""!==this.div_.style.opacity&&(this.div_.style.MsFilter='"progid:DXImageTransform.Microsoft.Alpha(Opacity='+100*this.div_.style.opacity+')"',this.div_.style.filter="alpha(opacity="+100*this.div_.style.opacity+")"),this.div_.style.position="absolute",this.div_.style.visibility="hidden",null!==this.zIndex_&&(this.div_.style.zIndex=this.zIndex_)}},InfoBox.prototype.getBoxWidths_=function(){var t,e={top:0,bottom:0,left:0,right:0},i=this.div_;return document.defaultView&&document.defaultView.getComputedStyle?(t=i.ownerDocument.defaultView.getComputedStyle(i,""),t&&(e.top=parseInt(t.borderTopWidth,10)||0,e.bottom=parseInt(t.borderBottomWidth,10)||0,e.left=parseInt(t.borderLeftWidth,10)||0,e.right=parseInt(t.borderRightWidth,10)||0)):document.documentElement.currentStyle&&i.currentStyle&&(e.top=parseInt(i.currentStyle.borderTopWidth,10)||0,e.bottom=parseInt(i.currentStyle.borderBottomWidth,10)||0,e.left=parseInt(i.currentStyle.borderLeftWidth,10)||0,e.right=parseInt(i.currentStyle.borderRightWidth,10)||0),e},InfoBox.prototype.onRemove=function(){this.div_&&(this.div_.parentNode.removeChild(this.div_),this.div_=null)},InfoBox.prototype.draw=function(){this.createInfoBoxDiv_();var t=this.getProjection().fromLatLngToDivPixel(this.position_);this.div_.style.left=t.x+this.pixelOffset_.width+"px",this.alignBottom_?this.div_.style.bottom=-(t.y+this.pixelOffset_.height)+"px":this.div_.style.top=t.y+this.pixelOffset_.height+"px",this.div_.style.visibility=this.isHidden_?"hidden":"visible"},InfoBox.prototype.setOptions=function(t){"undefined"!=typeof t.boxClass&&(this.boxClass_=t.boxClass,this.setBoxStyle_()),"undefined"!=typeof t.boxStyle&&(this.boxStyle_=t.boxStyle,this.setBoxStyle_()),"undefined"!=typeof t.content&&this.setContent(t.content),"undefined"!=typeof t.disableAutoPan&&(this.disableAutoPan_=t.disableAutoPan),"undefined"!=typeof t.maxWidth&&(this.maxWidth_=t.maxWidth),"undefined"!=typeof t.pixelOffset&&(this.pixelOffset_=t.pixelOffset),"undefined"!=typeof t.alignBottom&&(this.alignBottom_=t.alignBottom),"undefined"!=typeof t.position&&this.setPosition(t.position),"undefined"!=typeof t.zIndex&&this.setZIndex(t.zIndex),"undefined"!=typeof t.closeBoxMargin&&(this.closeBoxMargin_=t.closeBoxMargin),"undefined"!=typeof t.closeBoxURL&&(this.closeBoxURL_=t.closeBoxURL),"undefined"!=typeof t.infoBoxClearance&&(this.infoBoxClearance_=t.infoBoxClearance),"undefined"!=typeof t.isHidden&&(this.isHidden_=t.isHidden),"undefined"!=typeof t.visible&&(this.isHidden_=!t.visible),"undefined"!=typeof t.enableEventPropagation&&(this.enableEventPropagation_=t.enableEventPropagation),this.div_&&this.draw()},InfoBox.prototype.setContent=function(t){this.content_=t,this.div_&&(this.closeListener_&&(google.maps.event.removeListener(this.closeListener_),this.closeListener_=null),this.fixedWidthSet_||(this.div_.style.width=""),"undefined"==typeof t.nodeType?this.div_.innerHTML=this.getCloseBoxImg_()+t:(this.div_.innerHTML=this.getCloseBoxImg_(),this.div_.appendChild(t)),this.fixedWidthSet_||(this.div_.style.width=this.div_.offsetWidth+"px","undefined"==typeof t.nodeType?this.div_.innerHTML=this.getCloseBoxImg_()+t:(this.div_.innerHTML=this.getCloseBoxImg_(),this.div_.appendChild(t))),this.addClickHandler_()),google.maps.event.trigger(this,"content_changed")},InfoBox.prototype.setPosition=function(t){this.position_=t,this.div_&&this.draw(),google.maps.event.trigger(this,"position_changed")},InfoBox.prototype.setZIndex=function(t){this.zIndex_=t,this.div_&&(this.div_.style.zIndex=t),google.maps.event.trigger(this,"zindex_changed")},InfoBox.prototype.setVisible=function(t){this.isHidden_=!t,this.div_&&(this.div_.style.visibility=this.isHidden_?"hidden":"visible")},InfoBox.prototype.getContent=function(){return this.content_},InfoBox.prototype.getPosition=function(){return this.position_},InfoBox.prototype.getZIndex=function(){return this.zIndex_},InfoBox.prototype.getVisible=function(){var t;return t="undefined"==typeof this.getMap()||null===this.getMap()?!1:!this.isHidden_},InfoBox.prototype.show=function(){this.isHidden_=!1,this.div_&&(this.div_.style.visibility="visible")},InfoBox.prototype.hide=function(){this.isHidden_=!0,this.div_&&(this.div_.style.visibility="hidden")},InfoBox.prototype.open=function(t,e){var i=this;e&&(this.position_=e.getPosition(),this.moveListener_=google.maps.event.addListener(e,"position_changed",function(){i.setPosition(this.getPosition())})),this.setMap(t),this.div_&&this.panBox_()},InfoBox.prototype.close=function(){var t;if(this.closeListener_&&(google.maps.event.removeListener(this.closeListener_),this.closeListener_=null),this.eventListeners_){for(t=0;t<this.eventListeners_.length;t++)google.maps.event.removeListener(this.eventListeners_[t]);this.eventListeners_=null}this.moveListener_&&(google.maps.event.removeListener(this.moveListener_),this.moveListener_=null),this.contextListener_&&(google.maps.event.removeListener(this.contextListener_),this.contextListener_=null),this.setMap(null)};
		
		var windowHtml = w2gm_glocation.content_fields;
		
		windowHtml = $(windowHtml)[0].outerHTML;
		
		var tongue_pos = (parseInt(w2gm_maps_objects.infowindow_width)/2);
	            
		var myOptions = {
				 content: windowHtml
				,alignBottom: true
				,disableAutoPan: false
				,pixelOffset: new google.maps.Size(-tongue_pos, parseInt(w2gm_maps_objects.infowindow_offset)-24)
				,zIndex: null
				,boxStyle: { 
				  width: w2gm_maps_objects.infowindow_width+"px"
				 }
				,closeBoxURL: ""
				,infoBoxClearance: new google.maps.Size(1, 1)
				,isHidden: false
				,pane: "floatPane"
				,enableEventPropagation: false
		};
	
	    // we use global infoWindow, not to close/open it - just to set new content (in order to prevent blinking)
	    if (typeof w2gm_infoWindows[map_id] != 'undefined') {
	    	w2gm_closeInfoWindow(map_id);
	    }
	
	    w2gm_infoWindows[map_id] = new InfoBox(myOptions);
	    w2gm_infoWindows[map_id].open(w2gm_maps[map_id], marker);
	    w2gm_infoWindows[map_id].marker = marker;
	    w2gm_infoWindows[map_id].location = w2gm_glocation;
	    
	    return w2gm_infoWindows[map_id];
	}

	window.w2gm_panByInfoWindow = function(map_id) {
		if (typeof w2gm_infoWindows[map_id] != 'undefined') {
			google.maps.event.addListener(w2gm_infoWindows[map_id], 'domready', function() {
				w2gm_maps[map_id].panBy(0, -50)
			});
		}
	}
	
	window.w2gm_isCenterOnClick = function(map_id) {
		var attrs_array = w2gm_get_map_markers_attrs_array(map_id);
		return attrs_array.center_map_onclick;
	}
	
	window.w2gm_applyZoomOnClick = function(map_id) {
		var attrs_array = w2gm_get_map_markers_attrs_array(map_id);
		if (attrs_array.zoom_map_onclick) {
			w2gm_maps[map_id].setZoom(parseInt(attrs_array.zoom_map_onclick));
			return attrs_array.zoom_map_onclick;
		} {
			return false;
		}
	}

	function w2gm_handleDirectionsErrors(status){
	   if (status == google.maps.DirectionsStatus.NOT_FOUND)
		 alert("No corresponding geographic location could be found for one of the specified addresses. This may be due to the fact that the address is relatively new, or it may be incorrect.");
	   else if (status == google.maps.DirectionsStatus.ZERO_RESULTS)
		 alert("No route could be found between the origin and destination.");
	   else if (status == google.maps.DirectionsStatus.UNKNOWN_ERROR)
		 alert("A directions request could not be processed due to a server error. The request may succeed if you try again.");
	   else if (status == google.maps.DirectionsStatus.REQUEST_DENIED)
		 alert("The webpage is not allowed to use the directions service.");
	   else if (status == google.maps.DirectionsStatus.INVALID_REQUEST)
		 alert("The provided DirectionsRequest was invalid.");
	   else if (status == google.maps.DirectionsStatus.OVER_QUERY_LIMIT)
		 alert("The webpage has sent too many requests within the allowed time period.");
	   else alert("An unknown error occurred.");
	}
	window.w2gm_setClusters = function(clusters, map_id, markers) {
		if (parseInt(clusters) && typeof MarkerClusterer == 'function') {
			var clusterStyles = [];
			
			if (w2gm_maps_objects.global_map_icons_path != '')
				var clusterStyles = [
					{
						url: w2gm_maps_objects.global_map_icons_path + 'clusters/icon_cluster1.png',
						height: 64,
						width: 64
					},
					{
						url: w2gm_maps_objects.global_map_icons_path + 'clusters/icon_cluster2.png',
						height: 74,
						width: 74
					},
					{
						url: w2gm_maps_objects.global_map_icons_path + 'clusters/icon_cluster3.png',
						height: 84,
						width: 84
					},
					{
						url: w2gm_maps_objects.global_map_icons_path + 'clusters/icon_cluster4.png',
						height: 94,
						width: 94
					},
					{
						url: w2gm_maps_objects.global_map_icons_path + 'clusters/icon_cluster5.png',
						height: 104,
						width: 104
					}
				];
			var mcOptions = {
				gridSize: 150,
				styles: clusterStyles
			};
			var accuracy = 8000;
			
			if (markers.length != 0) {
				for (var i=0; i < markers.length; i++) {
					var existingMarker = markers[i];
					var pos = existingMarker.getPosition();

					for (var j=0; j < markers.length; j++) {
						var markerToCompare = markers[i];
						var markerToComparePos = markerToCompare.getPosition();
						if (markerToComparePos.equals(pos)) {
							var newLat = markerToComparePos.lat() + (Math.random() -.5) / accuracy;
							var newLng = markerToComparePos.lng() + (Math.random() -.5) / accuracy;
							markers[i].setPosition(new google.maps.LatLng(newLat,newLng));
						}
					}
				}
			}
			
			w2gm_markerClusters[map_id] = new MarkerClusterer(w2gm_maps[map_id], markers, mcOptions);
		}
	}
	window.w2gm_clearMarkers = function(map_id) {
		if (typeof w2gm_markerClusters[map_id] != 'undefined')
			w2gm_markerClusters[map_id].clearMarkers();
	
		if (w2gm_global_markers_array[map_id]) {
			for(var i = 0; i<w2gm_global_markers_array[map_id].length; i++){
				w2gm_global_markers_array[map_id][i].setMap(null);
			}
		}
		w2gm_global_markers_array[map_id] = [];
		w2gm_global_locations_array[map_id] = [];
	}
	window.w2gm_removeCircles = function(map_id) {
		if (typeof w2gm_drawCircles[map_id] != 'undefined') {
			google.maps.event.clearListeners(w2gm_drawCircles[map_id], 'mouseup');
			w2gm_drawCircles[map_id].setMap(null);
		}
	}
	window.w2gm_removeShapes = function(map_id) {
		if (typeof w2gm_polygons[map_id] != 'undefined')
			w2gm_polygons[map_id].setMap(null);
	}
	window.w2gm_reloadMap = function(map_id) {
		if (typeof google != 'undefined' && typeof google.maps != 'undefined') {
    		var bounds = new google.maps.LatLngBounds();
    		for (var j=0; j<w2gm_global_markers_array[map_id].length; j++) {
    			var marker = w2gm_global_markers_array[map_id][j];
			    w2gm_extendBounds(bounds, w2gm_getMarkerPosition(marker));
    		}
    		w2gm_mapFitBounds(map_id, bounds);
    		
    		var map_attrs_array;
    		if (map_attrs_array = w2gm_get_map_markers_attrs_array(map_id)) {
    			var map_attrs = map_attrs_array.map_attrs;
    			var markers_array = map_attrs_array.markers_array;
    			
    			w2gm_setMapZoomCenter(map_id, map_attrs, markers_array);
    		}
		}
	}

	window.w2gm_geocodeField = function(field, error_message) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				function(position) {
					var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
					var geocoder = new google.maps.Geocoder();
					geocoder.geocode({'latLng': latlng}, function(results, status) {
						if (status == google.maps.GeocoderStatus.OK) {
							if (results[0]) {
								field.val(results[0].formatted_address);
								field.trigger('change');
							}
						}
					});
				},
				function(e) {
					//alert(e.message);
				},
				{enableHighAccuracy: true, timeout: 10000, maximumAge: 0}
			);
		} else
			alert(error_message);
	}
})(jQuery);


//google_maps_clasterer.js -------------------------------------------------------------------------------------------------------------------------------------------
(function(){var d=null;function e(a){return function(b){this[a]=b}}function h(a){return function(){return this[a]}}var j;
function k(a,b,c){this.extend(k,google.maps.OverlayView);this.c=a;this.a=[];this.f=[];this.ca=[53,56,66,78,90];this.j=[];this.A=!1;c=c||{};this.g=c.gridSize||60;this.l=c.minimumClusterSize||2;this.J=c.maxZoom||d;this.j=c.styles||[];this.X=c.imagePath||this.Q;this.W=c.imageExtension||this.P;this.O=!0;if(c.zoomOnClick!=void 0)this.O=c.zoomOnClick;this.r=!1;if(c.averageCenter!=void 0)this.r=c.averageCenter;l(this);this.setMap(a);this.K=this.c.getZoom();var f=this;google.maps.event.addListener(this.c,
"zoom_changed",function(){var a=f.c.getZoom();if(f.K!=a)f.K=a,f.m()});google.maps.event.addListener(this.c,"idle",function(){f.i()});b&&b.length&&this.C(b,!1)}j=k.prototype;j.Q="http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m";j.P="png";j.extend=function(a,b){return function(a){for(var b in a.prototype)this.prototype[b]=a.prototype[b];return this}.apply(a,[b])};j.onAdd=function(){if(!this.A)this.A=!0,n(this)};j.draw=function(){};
function l(a){if(!a.j.length)for(var b=0,c;c=a.ca[b];b++)a.j.push({url:a.X+(b+1)+"."+a.W,height:c,width:c})}j.S=function(){for(var a=this.o(),b=new google.maps.LatLngBounds,c=0,f;f=a[c];c++)b.extend(f.getPosition());this.c.fitBounds(b)};j.z=h("j");j.o=h("a");j.V=function(){return this.a.length};j.ba=e("J");j.I=h("J");j.G=function(a,b){for(var c=0,f=a.length,g=f;g!==0;)g=parseInt(g/10,10),c++;c=Math.min(c,b);return{text:f,index:c}};j.$=e("G");j.H=h("G");
j.C=function(a,b){for(var c=0,f;f=a[c];c++)q(this,f);b||this.i()};function q(a,b){b.s=!1;b.draggable&&google.maps.event.addListener(b,"dragend",function(){b.s=!1;a.L()});a.a.push(b)}j.q=function(a,b){q(this,a);b||this.i()};function r(a,b){var c=-1;if(a.a.indexOf)c=a.a.indexOf(b);else for(var f=0,g;g=a.a[f];f++)if(g==b){c=f;break}if(c==-1)return!1;b.setMap(d);a.a.splice(c,1);return!0}j.Y=function(a,b){var c=r(this,a);return!b&&c?(this.m(),this.i(),!0):!1};
j.Z=function(a,b){for(var c=!1,f=0,g;g=a[f];f++)g=r(this,g),c=c||g;if(!b&&c)return this.m(),this.i(),!0};j.U=function(){return this.f.length};j.getMap=h("c");j.setMap=e("c");j.w=h("g");j.aa=e("g");
j.v=function(a){var b=this.getProjection(),c=new google.maps.LatLng(a.getNorthEast().lat(),a.getNorthEast().lng()),f=new google.maps.LatLng(a.getSouthWest().lat(),a.getSouthWest().lng()),c=b.fromLatLngToDivPixel(c);c.x+=this.g;c.y-=this.g;f=b.fromLatLngToDivPixel(f);f.x-=this.g;f.y+=this.g;c=b.fromDivPixelToLatLng(c);b=b.fromDivPixelToLatLng(f);a.extend(c);a.extend(b);return a};j.R=function(){this.m(!0);this.a=[]};
j.m=function(a){for(var b=0,c;c=this.f[b];b++)c.remove();for(b=0;c=this.a[b];b++)c.s=!1,a&&c.setMap(d);this.f=[]};j.L=function(){var a=this.f.slice();this.f.length=0;this.m();this.i();window.setTimeout(function(){for(var b=0,c;c=a[b];b++)c.remove()},0)};j.i=function(){n(this)};
function n(a){if(a.A)for(var b=a.v(new google.maps.LatLngBounds(a.c.getBounds().getSouthWest(),a.c.getBounds().getNorthEast())),c=0,f;f=a.a[c];c++)if(!f.s&&b.contains(f.getPosition())){for(var g=a,u=4E4,o=d,v=0,m=void 0;m=g.f[v];v++){var i=m.getCenter();if(i){var p=f.getPosition();if(!i||!p)i=0;else var w=(p.lat()-i.lat())*Math.PI/180,x=(p.lng()-i.lng())*Math.PI/180,i=Math.sin(w/2)*Math.sin(w/2)+Math.cos(i.lat()*Math.PI/180)*Math.cos(p.lat()*Math.PI/180)*Math.sin(x/2)*Math.sin(x/2),i=6371*2*Math.atan2(Math.sqrt(i),
Math.sqrt(1-i));i<u&&(u=i,o=m)}}o&&o.F.contains(f.getPosition())?o.q(f):(m=new s(g),m.q(f),g.f.push(m))}}function s(a){this.k=a;this.c=a.getMap();this.g=a.w();this.l=a.l;this.r=a.r;this.d=d;this.a=[];this.F=d;this.n=new t(this,a.z(),a.w())}j=s.prototype;
j.q=function(a){var b;a:if(this.a.indexOf)b=this.a.indexOf(a)!=-1;else{b=0;for(var c;c=this.a[b];b++)if(c==a){b=!0;break a}b=!1}if(b)return!1;if(this.d){if(this.r)c=this.a.length+1,b=(this.d.lat()*(c-1)+a.getPosition().lat())/c,c=(this.d.lng()*(c-1)+a.getPosition().lng())/c,this.d=new google.maps.LatLng(b,c),y(this)}else this.d=a.getPosition(),y(this);a.s=!0;this.a.push(a);b=this.a.length;b<this.l&&a.getMap()!=this.c&&a.setMap(this.c);if(b==this.l)for(c=0;c<b;c++)this.a[c].setMap(d);b>=this.l&&a.setMap(d);
a=this.c.getZoom();if((b=this.k.I())&&a>b)for(a=0;b=this.a[a];a++)b.setMap(this.c);else if(this.a.length<this.l)z(this.n);else{b=this.k.H()(this.a,this.k.z().length);this.n.setCenter(this.d);a=this.n;a.B=b;a.ga=b.text;a.ea=b.index;if(a.b)a.b.innerHTML=b.text;b=Math.max(0,a.B.index-1);b=Math.min(a.j.length-1,b);b=a.j[b];a.da=b.url;a.h=b.height;a.p=b.width;a.M=b.textColor;a.e=b.anchor;a.N=b.textSize;a.D=b.backgroundPosition;this.n.show()}return!0};
j.getBounds=function(){for(var a=new google.maps.LatLngBounds(this.d,this.d),b=this.o(),c=0,f;f=b[c];c++)a.extend(f.getPosition());return a};j.remove=function(){this.n.remove();this.a.length=0;delete this.a};j.T=function(){return this.a.length};j.o=h("a");j.getCenter=h("d");function y(a){a.F=a.k.v(new google.maps.LatLngBounds(a.d,a.d))}j.getMap=h("c");
function t(a,b,c){a.k.extend(t,google.maps.OverlayView);this.j=b;this.fa=c||0;this.u=a;this.d=d;this.c=a.getMap();this.B=this.b=d;this.t=!1;this.setMap(this.c)}j=t.prototype;
j.onAdd=function(){this.b=document.createElement("DIV");if(this.t)this.b.style.cssText=A(this,B(this,this.d)),this.b.innerHTML=this.B.text;this.getPanes().overlayMouseTarget.appendChild(this.b);var a=this;google.maps.event.addDomListener(this.b,"click",function(){var b=a.u.k;google.maps.event.trigger(b,"clusterclick",a.u);b.O&&a.c.fitBounds(a.u.getBounds())})};function B(a,b){var c=a.getProjection().fromLatLngToDivPixel(b);c.x-=parseInt(a.p/2,10);c.y-=parseInt(a.h/2,10);return c}
j.draw=function(){if(this.t){var a=B(this,this.d);this.b.style.top=a.y+"px";this.b.style.left=a.x+"px"}};function z(a){if(a.b)a.b.style.display="none";a.t=!1}j.show=function(){if(this.b)this.b.style.cssText=A(this,B(this,this.d)),this.b.style.display="";this.t=!0};j.remove=function(){this.setMap(d)};j.onRemove=function(){if(this.b&&this.b.parentNode)z(this),this.b.parentNode.removeChild(this.b),this.b=d};j.setCenter=e("d");
function A(a,b){var c=[];c.push("background-image:url('"+a.da+"');");c.push("background-position:"+(a.D?a.D:"0 0")+";");typeof a.e==="object"?(typeof a.e[0]==="number"&&a.e[0]>0&&a.e[0]<a.h?c.push("height:"+(a.h-a.e[0])+"px; padding-top:"+a.e[0]+"px;"):c.push("height:"+a.h+"px; line-height:"+a.h+"px;"),typeof a.e[1]==="number"&&a.e[1]>0&&a.e[1]<a.p?c.push("width:"+(a.p-a.e[1])+"px; padding-left:"+a.e[1]+"px;"):c.push("width:"+a.p+"px; text-align:center;")):c.push("height:"+a.h+"px; line-height:"+a.h+
"px; width:"+a.p+"px; text-align:center;");c.push("cursor:pointer; top:"+b.y+"px; left:"+b.x+"px; color:"+(a.M?a.M:"black")+"; position:absolute; font-size:"+(a.N?a.N:11)+"px; font-family:Arial,sans-serif; font-weight:bold");return c.join("")}window.MarkerClusterer=k;k.prototype.addMarker=k.prototype.q;k.prototype.addMarkers=k.prototype.C;k.prototype.clearMarkers=k.prototype.R;k.prototype.fitMapToMarkers=k.prototype.S;k.prototype.getCalculator=k.prototype.H;k.prototype.getGridSize=k.prototype.w;
k.prototype.getExtendedBounds=k.prototype.v;k.prototype.getMap=k.prototype.getMap;k.prototype.getMarkers=k.prototype.o;k.prototype.getMaxZoom=k.prototype.I;k.prototype.getStyles=k.prototype.z;k.prototype.getTotalClusters=k.prototype.U;k.prototype.getTotalMarkers=k.prototype.V;k.prototype.redraw=k.prototype.i;k.prototype.removeMarker=k.prototype.Y;k.prototype.removeMarkers=k.prototype.Z;k.prototype.resetViewport=k.prototype.m;k.prototype.repaint=k.prototype.L;k.prototype.setCalculator=k.prototype.$;
k.prototype.setGridSize=k.prototype.aa;k.prototype.setMaxZoom=k.prototype.ba;k.prototype.onAdd=k.prototype.onAdd;k.prototype.draw=k.prototype.draw;s.prototype.getCenter=s.prototype.getCenter;s.prototype.getSize=s.prototype.T;s.prototype.getMarkers=s.prototype.o;t.prototype.onAdd=t.prototype.onAdd;t.prototype.draw=t.prototype.draw;t.prototype.onRemove=t.prototype.onRemove;
})();

//richmarker.js -------------------------------------------------------------------------------------------------------------------------------------------
function w2gm_load_richtext() {
	/**
	 * @license
	 * Copyright 2013 Google Inc. All Rights Reserved.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *	 http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	/**
	 * A RichMarker that allows any HTML/DOM to be added to a map and be draggable.
	 *
	 * @param {Object.<string, *>=} opt_options Optional properties to set.
	 * @extends {google.maps.OverlayView}
	 * @constructor
	 */
	function RichMarker(opt_options) {
	  var options = opt_options || {};

	  /**
	   * @type {boolean}
	   * @private
	   */
	  this.ready_ = false;

	  /**
	   * @type {boolean}
	   * @private
	   */
	  this.dragging_ = false;

	  if (opt_options['visible'] == undefined) {
		opt_options['visible'] = true;
	  }

	  if (opt_options['shadow'] == undefined) {
		opt_options['shadow'] = '7px -3px 5px rgba(88,88,88,0.7)';
	  }

	  if (opt_options['anchor'] == undefined) {
		opt_options['anchor'] = RichMarkerPosition['BOTTOM'];
	  }

	  this.setValues(options);
	}
	RichMarker.prototype = new google.maps.OverlayView();
	window['RichMarker'] = RichMarker;


	/**
	 * Returns the current visibility state of the marker.
	 *
	 * @return {boolean} The visiblity of the marker.
	 */
	RichMarker.prototype.getVisible = function() {
	  return /** @type {boolean} */ (this.get('visible'));
	};
	RichMarker.prototype['getVisible'] = RichMarker.prototype.getVisible;


	/**
	 * Sets the visiblility state of the marker.
	 *
	 * @param {boolean} visible The visiblilty of the marker.
	 */
	RichMarker.prototype.setVisible = function(visible) {
	  this.set('visible', visible);
	};
	RichMarker.prototype['setVisible'] = RichMarker.prototype.setVisible;


	/**
	 *  The visible changed event.
	 */
	RichMarker.prototype.visible_changed = function() {
	  if (this.ready_) {
		this.markerWrapper_.style['display'] = this.getVisible() ? '' : 'none';
		this.draw();
	  }
	};
	RichMarker.prototype['visible_changed'] = RichMarker.prototype.visible_changed;


	/**
	 * Sets the marker to be flat.
	 *
	 * @param {boolean} flat If the marker is to be flat or not.
	 */
	RichMarker.prototype.setFlat = function(flat) {
	  this.set('flat', !!flat);
	};
	RichMarker.prototype['setFlat'] = RichMarker.prototype.setFlat;


	/**
	 * If the makrer is flat or not.
	 *
	 * @return {boolean} True the marker is flat.
	 */
	RichMarker.prototype.getFlat = function() {
	  return /** @type {boolean} */ (this.get('flat'));
	};
	RichMarker.prototype['getFlat'] = RichMarker.prototype.getFlat;


	/**
	 * Get the width of the marker.
	 *
	 * @return {Number} The width of the marker.
	 */
	RichMarker.prototype.getWidth = function() {
	  return /** @type {Number} */ (this.get('width'));
	};
	RichMarker.prototype['getWidth'] = RichMarker.prototype.getWidth;


	/**
	 * Get the height of the marker.
	 *
	 * @return {Number} The height of the marker.
	 */
	RichMarker.prototype.getHeight = function() {
	  return /** @type {Number} */ (this.get('height'));
	};
	RichMarker.prototype['getHeight'] = RichMarker.prototype.getHeight;


	/**
	 * Sets the marker's box shadow.
	 *
	 * @param {string} shadow The box shadow to set.
	 */
	RichMarker.prototype.setShadow = function(shadow) {
	  this.set('shadow', shadow);
	  this.flat_changed();
	};
	RichMarker.prototype['setShadow'] = RichMarker.prototype.setShadow;


	/**
	 * Gets the marker's box shadow.
	 *
	 * @return {string} The box shadow.
	 */
	RichMarker.prototype.getShadow = function() {
	  return /** @type {string} */ (this.get('shadow'));
	};
	RichMarker.prototype['getShadow'] = RichMarker.prototype.getShadow;


	/**
	 * Flat changed event.
	 */
	RichMarker.prototype.flat_changed = function() {
	  if (!this.ready_) {
		return;
	  }

	  this.markerWrapper_.style['boxShadow'] =
		  this.markerWrapper_.style['webkitBoxShadow'] =
		  this.markerWrapper_.style['MozBoxShadow'] =
		  this.getFlat() ? '' : this.getShadow();
	};
	RichMarker.prototype['flat_changed'] = RichMarker.prototype.flat_changed;


	/**
	 * Sets the zIndex of the marker.
	 *
	 * @param {Number} index The index to set.
	 */
	RichMarker.prototype.setZIndex = function(index) {
	  this.set('zIndex', index);
	};
	RichMarker.prototype['setZIndex'] = RichMarker.prototype.setZIndex;


	/**
	 * Gets the zIndex of the marker.
	 *
	 * @return {Number} The zIndex of the marker.
	 */
	RichMarker.prototype.getZIndex = function() {
	  return /** @type {Number} */ (this.get('zIndex'));
	};
	RichMarker.prototype['getZIndex'] = RichMarker.prototype.getZIndex;


	/**
	 * zIndex changed event.
	 */
	RichMarker.prototype.zIndex_changed = function() {
	  if (this.getZIndex() && this.ready_) {
		this.markerWrapper_.style.zIndex = this.getZIndex();
	  }
	};
	RichMarker.prototype['zIndex_changed'] = RichMarker.prototype.zIndex_changed;

	/**
	 * Whether the marker is draggable or not.
	 *
	 * @return {boolean} True if the marker is draggable.
	 */
	RichMarker.prototype.getDraggable = function() {
	  return /** @type {boolean} */ (this.get('draggable'));
	};
	RichMarker.prototype['getDraggable'] = RichMarker.prototype.getDraggable;


	/**
	 * Sets the marker to be draggable or not.
	 *
	 * @param {boolean} draggable If the marker is draggable or not.
	 */
	RichMarker.prototype.setDraggable = function(draggable) {
	  this.set('draggable', !!draggable);
	};
	RichMarker.prototype['setDraggable'] = RichMarker.prototype.setDraggable;


	/**
	 * Draggable property changed callback.
	 */
	RichMarker.prototype.draggable_changed = function() {
	  if (this.ready_) {
		if (this.getDraggable()) {
		  this.addDragging_(this.markerWrapper_);
		} else {
		  this.removeDragListeners_();
		}
	  }
	};
	RichMarker.prototype['draggable_changed'] =
		RichMarker.prototype.draggable_changed;


	/**
	 * Gets the postiton of the marker.
	 *
	 * @return {google.maps.LatLng} The position of the marker.
	 */
	RichMarker.prototype.getPosition = function() {
	  return /** @type {google.maps.LatLng} */ (this.get('position'));
	};
	RichMarker.prototype['getPosition'] = RichMarker.prototype.getPosition;


	/**
	 * Sets the position of the marker.
	 *
	 * @param {google.maps.LatLng} position The position to set.
	 */
	RichMarker.prototype.setPosition = function(position) {
	  this.set('position', position);
	};
	RichMarker.prototype['setPosition'] = RichMarker.prototype.setPosition;


	/**
	 * Position changed event.
	 */
	RichMarker.prototype.position_changed = function() {
	  this.draw();
	};
	RichMarker.prototype['position_changed'] =
		RichMarker.prototype.position_changed;


	/**
	 * Gets the anchor.
	 *
	 * @return {google.maps.Size} The position of the anchor.
	 */
	RichMarker.prototype.getAnchor = function() {
	  return /** @type {google.maps.Size} */ (this.get('anchor'));
	};
	RichMarker.prototype['getAnchor'] = RichMarker.prototype.getAnchor;


	/**
	 * Sets the anchor.
	 *
	 * @param {RichMarkerPosition|google.maps.Size} anchor The anchor to set.
	 */
	RichMarker.prototype.setAnchor = function(anchor) {
	  this.set('anchor', anchor);
	};
	RichMarker.prototype['setAnchor'] = RichMarker.prototype.setAnchor;


	/**
	 * Anchor changed event.
	 */
	RichMarker.prototype.anchor_changed = function() {
	  this.draw();
	};
	RichMarker.prototype['anchor_changed'] = RichMarker.prototype.anchor_changed;


	/**
	 * Converts a HTML string to a document fragment.
	 *
	 * @param {string} htmlString The HTML string to convert.
	 * @return {Node} A HTML document fragment.
	 * @private
	 */
	RichMarker.prototype.htmlToDocumentFragment_ = function(htmlString) {
	  var tempDiv = document.createElement('DIV');
	  tempDiv.innerHTML = htmlString;
	  if (tempDiv.childNodes.length == 1) {
		return /** @type {!Node} */ (tempDiv.removeChild(tempDiv.firstChild));
	  } else {
		var fragment = document.createDocumentFragment();
		while (tempDiv.firstChild) {
		  fragment.appendChild(tempDiv.firstChild);
		}
		return fragment;
	  }
	};


	/**
	 * Removes all children from the node.
	 *
	 * @param {Node} node The node to remove all children from.
	 * @private
	 */
	RichMarker.prototype.removeChildren_ = function(node) {
	  if (!node) {
		return;
	  }

	  var child;
	  while (child = node.firstChild) {
		node.removeChild(child);
	  }
	};


	/**
	 * Sets the content of the marker.
	 *
	 * @param {string|Node} content The content to set.
	 */
	RichMarker.prototype.setContent = function(content) {
	  this.set('content', content);
	};
	RichMarker.prototype['setContent'] = RichMarker.prototype.setContent;


	/**
	 * Get the content of the marker.
	 *
	 * @return {string|Node} The marker content.
	 */
	RichMarker.prototype.getContent = function() {
	  return /** @type {Node|string} */ (this.get('content'));
	};
	RichMarker.prototype['getContent'] = RichMarker.prototype.getContent;


	/**
	 * Sets the marker content and adds loading events to images
	 */
	RichMarker.prototype.content_changed = function() {
	  if (!this.markerContent_) {
		// Marker content area doesnt exist.
		return;
	  }

	  this.removeChildren_(this.markerContent_);
	  var content = this.getContent();
	  if (content) {
		if (typeof content == 'string') {
		  content = content.replace(/^\s*([\S\s]*)\b\s*$/, '$1');
		  content = this.htmlToDocumentFragment_(content);
		}
		this.markerContent_.appendChild(content);

		var that = this;
		var images = this.markerContent_.getElementsByTagName('IMG');
		for (var i = 0, image; image = images[i]; i++) {
		  // By default, a browser lets a image be dragged outside of the browser,
		  // so by calling preventDefault we stop this behaviour and allow the image
		  // to be dragged around the map and now out of the browser and onto the
		  // desktop.
		  google.maps.event.addDomListener(image, 'mousedown', function(e) {
			if (that.getDraggable()) {
			  if (e.preventDefault) {
				e.preventDefault();
			  }
			  e.returnValue = false;
			}
		  });

		  // Because we don't know the size of an image till it loads, add a
		  // listener to the image load so the marker can resize and reposition
		  // itself to be the correct height.
		  google.maps.event.addDomListener(image, 'load', function() {
			that.draw();
		  });
		}

		google.maps.event.trigger(this, 'domready');
	  }

	  if (this.ready_) {
		this.draw();
	  }
	};
	RichMarker.prototype['content_changed'] = RichMarker.prototype.content_changed;

	/**
	 * Sets the cursor.
	 *
	 * @param {string} whichCursor What cursor to show.
	 * @private
	 */
	RichMarker.prototype.setCursor_ = function(whichCursor) {
	  if (!this.ready_) {
		return;
	  }

	  var cursor = '';
	  if (navigator.userAgent.indexOf('Gecko/') !== -1) {
		// Moz has some nice cursors :)
		if (whichCursor == 'dragging') {
		  cursor = '-moz-grabbing';
		}

		if (whichCursor == 'dragready') {
		  cursor = '-moz-grab';
		}

		if (whichCursor == 'draggable') {
		  cursor = 'pointer';
		}
	  } else {
		if (whichCursor == 'dragging' || whichCursor == 'dragready') {
		  cursor = 'move';
		}

		if (whichCursor == 'draggable') {
		  cursor = 'pointer';
		}
	  }

	  if (this.markerWrapper_.style.cursor != cursor) {
		this.markerWrapper_.style.cursor = cursor;
	  }
	};

	/**
	 * Start dragging.
	 *
	 * @param {Event} e The event.
	 */
	RichMarker.prototype.startDrag = function(e) {
	  if (!this.getDraggable()) {
		return;
	  }

	  if (!this.dragging_) {
		this.dragging_ = true;
		var map = this.getMap();
		this.mapDraggable_ = map.get('draggable');
		map.set('draggable', false);

		// Store the current mouse position
		this.mouseX_ = e.clientX;
		this.mouseY_ = e.clientY;

		this.setCursor_('dragready');

		// Stop the text from being selectable while being dragged
		this.markerWrapper_.style['MozUserSelect'] = 'none';
		this.markerWrapper_.style['KhtmlUserSelect'] = 'none';
		this.markerWrapper_.style['WebkitUserSelect'] = 'none';

		this.markerWrapper_['unselectable'] = 'on';
		this.markerWrapper_['onselectstart'] = function() {
		  return false;
		};

		this.addDraggingListeners_();

		google.maps.event.trigger(this, 'dragstart');
	  }
	};


	/**
	 * Stop dragging.
	 */
	RichMarker.prototype.stopDrag = function() {
	  if (!this.getDraggable()) {
		return;
	  }

	  if (this.dragging_) {
		this.dragging_ = false;
		this.getMap().set('draggable', this.mapDraggable_);
		this.mouseX_ = this.mouseY_ = this.mapDraggable_ = null;

		// Allow the text to be selectable again
		this.markerWrapper_.style['MozUserSelect'] = '';
		this.markerWrapper_.style['KhtmlUserSelect'] = '';
		this.markerWrapper_.style['WebkitUserSelect'] = '';
		this.markerWrapper_['unselectable'] = 'off';
		this.markerWrapper_['onselectstart'] = function() {};

		this.removeDraggingListeners_();

		this.setCursor_('draggable');
		google.maps.event.trigger(this, 'dragend');

		this.draw();
	  }
	};


	/**
	 * Handles the drag event.
	 *
	 * @param {Event} e The event.
	 */
	RichMarker.prototype.drag = function(e) {
	  if (!this.getDraggable() || !this.dragging_) {
		// This object isn't draggable or we have stopped dragging
		this.stopDrag();
		return;
	  }

	  var dx = this.mouseX_ - e.clientX;
	  var dy = this.mouseY_ - e.clientY;

	  this.mouseX_ = e.clientX;
	  this.mouseY_ = e.clientY;

	  var left = parseInt(this.markerWrapper_.style['left'], 10) - dx;
	  var top = parseInt(this.markerWrapper_.style['top'], 10) - dy;

	  this.markerWrapper_.style['left'] = left + 'px';
	  this.markerWrapper_.style['top'] = top + 'px';

	  var offset = this.getOffset_();

	  // Set the position property and adjust for the anchor offset
	  var point = new google.maps.Point(left - offset.width, top - offset.height);
	  var projection = this.getProjection();
	  this.setPosition(projection.fromDivPixelToLatLng(point));

	  this.setCursor_('dragging');
	  google.maps.event.trigger(this, 'drag');
	};


	/**
	 * Removes the drag listeners associated with the marker.
	 *
	 * @private
	 */
	RichMarker.prototype.removeDragListeners_ = function() {
	  if (this.draggableListener_) {
		google.maps.event.removeListener(this.draggableListener_);
		delete this.draggableListener_;
	  }
	  this.setCursor_('');
	};


	/**
	 * Add dragability events to the marker.
	 *
	 * @param {Node} node The node to apply dragging to.
	 * @private
	 */
	RichMarker.prototype.addDragging_ = function(node) {
	  if (!node) {
		return;
	  }

	  var that = this;
	  this.draggableListener_ =
		google.maps.event.addDomListener(node, 'mousedown', function(e) {
		  that.startDrag(e);
		});

	  this.setCursor_('draggable');
	};


	/**
	 * Add dragging listeners.
	 *
	 * @private
	 */
	RichMarker.prototype.addDraggingListeners_ = function() {
	  var that = this;
	  if (this.markerWrapper_.setCapture) {
		this.markerWrapper_.setCapture(true);
		this.draggingListeners_ = [
		  google.maps.event.addDomListener(this.markerWrapper_, 'mousemove', function(e) {
			that.drag(e);
		  }, true),
		  google.maps.event.addDomListener(this.markerWrapper_, 'mouseup', function() {
			that.stopDrag();
			that.markerWrapper_.releaseCapture();
		  }, true)
		];
	  } else {
		this.draggingListeners_ = [
		  google.maps.event.addDomListener(window, 'mousemove', function(e) {
			that.drag(e);
		  }, true),
		  google.maps.event.addDomListener(window, 'mouseup', function() {
			that.stopDrag();
		  }, true)
		];
	  }
	};


	/**
	 * Remove dragging listeners.
	 *
	 * @private
	 */
	RichMarker.prototype.removeDraggingListeners_ = function() {
	  if (this.draggingListeners_) {
		for (var i = 0, listener; listener = this.draggingListeners_[i]; i++) {
		  google.maps.event.removeListener(listener);
		}
		this.draggingListeners_.length = 0;
	  }
	};


	/**
	 * Get the anchor offset.
	 *
	 * @return {google.maps.Size} The size offset.
	 * @private
	 */
	RichMarker.prototype.getOffset_ = function() {
	  var anchor = this.getAnchor();
	  if (typeof anchor == 'object') {
		return /** @type {google.maps.Size} */ (anchor);
	  }

	  var offset = new google.maps.Size(0, 0);
	  if (!this.markerContent_) {
		return offset;
	  }

	  var width = this.markerContent_.offsetWidth;
	  var height = this.markerContent_.offsetHeight;

	  switch (anchor) {
	   case RichMarkerPosition['TOP_LEFT']:
		 break;
	   case RichMarkerPosition['TOP']:
		 offset.width = -width / 2;
		 break;
	   case RichMarkerPosition['TOP_RIGHT']:
		 offset.width = -width;
		 break;
	   case RichMarkerPosition['LEFT']:
		 offset.height = -height / 2;
		 break;
	   case RichMarkerPosition['MIDDLE']:
		 offset.width = -width / 2;
		 offset.height = -height / 2;
		 break;
	   case RichMarkerPosition['RIGHT']:
		 offset.width = -width;
		 offset.height = -height / 2;
		 break;
	   case RichMarkerPosition['BOTTOM_LEFT']:
		 offset.height = -height;
		 break;
	   case RichMarkerPosition['BOTTOM']:
		 offset.width = -width / 2;
		 offset.height = -height;
		 break;
	   case RichMarkerPosition['BOTTOM_RIGHT']:
		 offset.width = -width;
		 offset.height = -height;
		 break;
	  }

	  return offset;
	};


	/**
	 * Adding the marker to a map.
	 * Implementing the interface.
	 */
	RichMarker.prototype.onAdd = function() {
	  if (!this.markerWrapper_) {
		this.markerWrapper_ = document.createElement('DIV');
		this.markerWrapper_.style['position'] = 'absolute';
	  }

	  if (this.getZIndex()) {
		this.markerWrapper_.style['zIndex'] = this.getZIndex();
	  }

	  this.markerWrapper_.style['display'] = this.getVisible() ? '' : 'none';

	  if (!this.markerContent_) {
		this.markerContent_ = document.createElement('DIV');
		
		// custom code
		var div_class = this.get('div_class');
		var location = this.get('location');
		var color = this.get('color');
		this.markerContent_.setAttribute('class', div_class+' w2gm-map-marker-'+location.id);
		this.markerContent_.setAttribute('style', 'background: '+color+' none repeat scroll 0 0');
		
		this.markerWrapper_.appendChild(this.markerContent_);

		var that = this;
		google.maps.event.addDomListener(this.markerContent_, 'click', function(e) {
		  google.maps.event.trigger(that, 'click', e);
		});
		google.maps.event.addDomListener(this.markerContent_, 'mouseover', function(e) {
		  google.maps.event.trigger(that, 'mouseover', e);
		});
		google.maps.event.addDomListener(this.markerContent_, 'mouseout', function(e) {
		  google.maps.event.trigger(that, 'mouseout', e);
		});
	  }

	  this.ready_ = true;
	  this.content_changed();
	  this.flat_changed();
	  this.draggable_changed();

	  var panes = this.getPanes();
	  if (panes) {
		panes.overlayMouseTarget.appendChild(this.markerWrapper_);
	  }

	  google.maps.event.trigger(this, 'ready');
	};
	RichMarker.prototype['onAdd'] = RichMarker.prototype.onAdd;


	/**
	 * Impelementing the interface.
	 */
	RichMarker.prototype.draw = function() {
	  if (!this.ready_ || this.dragging_) {
		return;
	  }

	  var projection = this.getProjection();

	  if (!projection) {
		// The map projection is not ready yet so do nothing
		return;
	  }

	  var latLng = /** @type {google.maps.LatLng} */ (this.get('position'));
	  var pos = projection.fromLatLngToDivPixel(latLng);

	  var offset = this.getOffset_();
	  this.markerWrapper_.style['top'] = (pos.y + offset.height) + 'px';
	  this.markerWrapper_.style['left'] = (pos.x + offset.width) + 'px';

	  var height = this.markerContent_.offsetHeight;
	  var width = this.markerContent_.offsetWidth;

	  if (width != this.get('width')) {
		this.set('width', width);
	  }

	  if (height != this.get('height')) {
		this.set('height', height);
	  }
	};
	RichMarker.prototype['draw'] = RichMarker.prototype.draw;


	/**
	 * Removing a marker from the map.
	 * Implementing the interface.
	 */
	RichMarker.prototype.onRemove = function() {
	  if (this.markerWrapper_ && this.markerWrapper_.parentNode) {
		this.markerWrapper_.parentNode.removeChild(this.markerWrapper_);
	  }
	  this.removeDragListeners_();
	};
	RichMarker.prototype['onRemove'] = RichMarker.prototype.onRemove;


	/**
	 * RichMarker Anchor positions
	 * @enum {number}
	 */
	var RichMarkerPosition = {
	  'TOP_LEFT': 1,
	  'TOP': 2,
	  'TOP_RIGHT': 3,
	  'LEFT': 4,
	  'MIDDLE': 5,
	  'RIGHT': 6,
	  'BOTTOM_LEFT': 7,
	  'BOTTOM': 8,
	  'BOTTOM_RIGHT': 9
	};
	window['RichMarkerPosition'] = RichMarkerPosition;

};