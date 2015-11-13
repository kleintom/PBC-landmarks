/*
   @source: https://github.com/kleintom/PBC-landmarks
   @licstart  The following is the entire license notice for the JavaScript
   code in this page.

   Copyright (C) 2011 Tom Klein

   The JavaScript code in this page is free software: you can
   redistribute it and/or modify it under the terms of the GNU
   General Public License (GNU GPL) as published by the Free Software
   Foundation, either version 3 of the License, or (at your option)
   any later version.  The code is distributed WITHOUT ANY WARRANTY;
   without even the implied warranty of MERCHANTABILITY or FITNESS
   FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.

   As additional permission under GNU GPL version 3 section 7, you
   may distribute non-source (e.g., minimized or compacted) forms of
   that code without the copy of the GNU GPL normally required by
   section 4, provided you include this license notice and a URL
   through which recipients can access the Corresponding Source.

   @licend  The above is the entire license notice for the JavaScript code in
   this page.
*/
var fopb = {}; // namespace
var gm = google.maps;

// run on page load
fopb.initialize = function() {

  var parking_doc, platforms_doc, i, m, gkml;

  //// action text to recenter and rezoom the map
  document.getElementById("recenter").onclick = fopb.recenter;

  //// add the map
  fopb.map = new gm.Map(document.getElementById("map_canvas"),
                       { mapTypeId: gm.MapTypeId.ROADMAP, scrollwheel: false });
  gkml = new gm.KmlLayer("http://maps.google.com/maps/ms?hl=en&ie=UTF8&t=h&vps=1&jsv=233a&msa=0&output=nl&msid=109419713967081798604.000484df47d724e63a3fb");
  gkml.setMap(fopb.map);

  //// create the markers
  // parking
  parking_doc = "";
  for (i = 0; i < fopb.parking_markers.length; ++i) {
    m = fopb.parking_markers[i];
    fopb.create_and_add_marker(m, false);
    // maybe add a line going to this parking area
    if (m.line_data) {
      m.line_object = new gm.Polyline({ path: m.line_data,
                                        strokeColor: "#EDE186",
                                        strokeWeight: 5, zIndex: 1});
      m.line_object.setMap(fopb.map);
    }
    // the description for this marker
    parking_doc += '<div class="marker_detail">';
    parking_doc +=
      '<img src="' + m.image + '" />';
    parking_doc +=
      '<span class="info_title">' + m.title + '</span>';
    parking_doc +=  m.info;
    parking_doc += '</div>';
  }
  fopb.create_checker_function("check_all_parking", "check_all_parking",
			       fopb.parking_markers, "parking_extra_info",
			       parking_doc);

  // platforms
  platforms_doc = "";
  for (i = 0; i < fopb.platform_markers.length; ++i) {
    m = fopb.platform_markers[i];
    fopb.create_and_add_marker(m, true);
    platforms_doc +=
      '<img src="' + m.image + '" />';
    platforms_doc +=
      '<span class="info_title">' + m.title + '</span><br />';
  }
  fopb.create_checker_function("check_all_platforms",
			       "check_all_platforms",
			       fopb.platform_markers,
			       "platforms_extra_info", platforms_doc);

  // indian mounds
  fopb.create_markers(fopb.indian_mound_markers);
  fopb.create_checker_function("check_all_indian_mounds",
			       "check_all_indian_mounds",
			       fopb.indian_mound_markers);

  // bike racks
  fopb.create_markers(fopb.bike_rack_markers);
  fopb.create_checker_function("check_all_bike_racks",
			       "check_all_bike_racks",
			       fopb.bike_rack_markers);

  // information signs
  fopb.create_markers(fopb.info_sign_markers);
  fopb.create_checker_function("check_all_info_signs",
			       "check_all_info_signs",
			       fopb.info_sign_markers);

  // benches
  fopb.create_markers(fopb.bench_markers);
  fopb.create_checker_function("check_all_benches", "check_all_benches",
			       fopb.bench_markers);

  // restrooms
  fopb.create_markers(fopb.restroom_markers);
  fopb.create_checker_function("check_all_restrooms",
			       "check_all_restrooms",
			       fopb.restroom_markers);

  // on a load, only parking is checked
  fopb.display_parking_only();
};

// check and display parking markers, uncheck and hide all others
fopb.display_parking_only = function() {

    document.getElementById("check_all_parking").checked = true;
    fopb.check_all_parking();
    document.getElementById("check_all_platforms").checked = false;
    document.getElementById("check_all_indian_mounds").checked = false;
    document.getElementById("check_all_bike_racks").checked = false;
    document.getElementById("check_all_info_signs").checked = false;
    document.getElementById("check_all_benches").checked = false;
    document.getElementById("check_all_restrooms").checked = false;
};

// the marker will be initially hidden if |hide| = true
fopb.create_and_add_marker = function(marker_data, hide) {

  var options, new_marker;
  options = { position: marker_data.coords,
              icon: { url: marker_data.image},
              map: fopb.map };
  if (hide) {
    options.visible = false;
  }
  new_marker = new gm.Marker(options);
  marker_data.marker = new_marker;
  // a double click on the marker displays the marker's info
  if (marker_data.info) {
    gm.event.addDomListener(new_marker, "click", function() {
      fopb.infoWindow.setContent(marker_data.info);
      fopb.infoWindow.open(fopb.map, new_marker);
    });
  }
};

// hides all of the created markers
fopb.create_markers = function(marker_data) {

    var i;
    for (i = 0; i < marker_data.length; ++i) {
	fopb.create_and_add_marker(marker_data[i], true);
    }
};

// create a function fopb[|name_of_function|] that checks the checkbox
// |id_to_check| for whether or not to display |markers|, and displays
// |marker_detail| (if it exists) in the |marker_detail_id| div when
// |id_to_check| is checked.
fopb.create_checker_function = function(name_of_function, id_to_check, markers,
					marker_detail_id, marker_detail) {

    var show;
    fopb[name_of_function] = function() {
	if (document.getElementById(id_to_check).checked) {
	    show = true;
	}
	else {
	    show = false;
	}
	fopb.show_or_hide_all_markers(markers, show);
	if (marker_detail_id) {
	    if (show) {
		document.getElementById(marker_detail_id).innerHTML =
		    marker_detail;
	    }
	    else {
		document.getElementById(marker_detail_id).innerHTML = "";
	    }
	    fopb.update_extra_info_string();
	}
    };
    document.getElementById(id_to_check).onclick = fopb[name_of_function];
};

fopb.show_or_hide_all_markers = function(markers, show) {

    var i, m_data, m;
    for (i = 0; i < markers.length; ++i) {
	m_data = markers[i];
	m = m_data.marker;
	if (show) {
	    if (m_data.line_object) {
		m_data.line_object.setVisible(true);
	    }
	    m.setVisible(true);
	}
	else { // hide
	    if (m_data.line_object) {
		m_data.line_object.setVisible(false);
	    }
	    m.setVisible(false);
            fopb.infoWindow.close();
	}
    }
};

// generate the "more info below" string based on which of the checkboxes
// that display extra information are checked
fopb.update_extra_info_string = function() {

    var extra_info_strings, i, item, extra_info, separator;
    extra_info_strings = [];
    for (i = 0; i < fopb.more_info_markers.length; ++i) {
	item = fopb.more_info_markers[i];
	if (document.getElementById(item.id).checked) {
	    extra_info_strings.push(item.title);
	}
    }
    extra_info = "&nbsp;"; // don't leave an empty div
    if (extra_info_strings.length) {
	extra_info = "More details below for ";
	separator = "";
	if (extra_info_strings.length === 2) {
	    separator = " and ";
	}
	else if (extra_info_strings.length > 2) {
	    separator = ", ";
	}
	for (i = 0; i < extra_info_strings.length - 1; ++i) {
	    if (separator === ", " && i === extra_info_strings.length - 2) {
		separator = ", and ";
	    }
	    extra_info += extra_info_strings[i] + separator;
	}
	extra_info += extra_info_strings[extra_info_strings.length - 1];
	extra_info += " (or double-click on a marker).";
    }
    document.getElementById("additional_info").innerHTML = extra_info;
};

fopb.recenter = function() {

  fopb.map.setCenter(new gm.LatLng(43.115865, -89.484594));
  fopb.map.setZoom(15);
}

// Broken if marker_list.length > 26
fopb.add_marker_images = function(marker_list, color) {

  var char_code = 65; // A
  for (i = 0; i < marker_list.length; ++i) {
    var this_marker = marker_list[i];
    var this_letter = String.fromCharCode(char_code);
    this_marker.image = "http://www.google.com/intl/en_ALL/mapfiles/marker_" +
      color + this_letter + ".png";
    ++char_code;
  }
};

//// begin markers data
fopb.parking_markers = [
    {
	id : "park3", // arbitrary (but unique)
	title : "County lot", // the marker's name
	// the marker's description (when it has one)
	info : 'A gravel lot surrounded by prairie (there\'s a single tree at the entrance).  There\'s a small green fire lot marker facing the road with the number 4864 on it.',
	// coordinates of the marker
	coords : new gm.LatLng(43.122108, -89.491196),
	// the image for the marker
	image : "http://www.google.com/intl/en_ALL/mapfiles/marker_greyA.png",
	// the marker object for this marker, to be assigned later
	marker : null
    },
    {
	id : "park1",
	title : "City lot 1",
	info : 'A blacktopped lot with 10 parking spots and an information kiosk to the left.  Across from Gaylord Nelson Rd.',
	coords : new gm.LatLng(43.114323,-89.491207),
	image : "http://www.google.com/intl/en_ALL/mapfiles/marker_greyB.png"
    },
    {
	id : "park2",
	title : "City lot 2",
	info : 'A small blacktopped lot with 4 spaces.  Across from Whittlesey Rd.',
	coords : new gm.LatLng(43.116890, -89.491043),
	image : "http://www.google.com/intl/en_ALL/mapfiles/marker_greyC.png"
    },
    {
	id : "park4",
	title : "Orchid Heights Park lot",
	info : 'A larger lot for Orchid Heights Park.',
	coords : new gm.LatLng(43.118450, -89.477036),
	image : "http://www.google.com/intl/en_ALL/mapfiles/marker_greyD.png"
    },
    {
	id : "park5",
	title : "Highland Way street parking",
	info : 'Curbside parking in front of a conservancy gate.',
	coords : new gm.LatLng(43.110667,-89.478312),
	image : "http://www.google.com/intl/en_ALL/mapfiles/marker_greyE.png"
    },
    {
	id : "park6",
	title : "Marina Drive street parking",
	info : 'Curbside parking.',
	coords : new gm.LatLng(43.107396,-89.485693),
	image : "http://www.google.com/intl/en_ALL/mapfiles/marker_greyF.png"
    },
    {
	id : "park3-2",
	title : "Workday parking (grass)",
	info : '<b>Note: This parking is not intended for public use.  The gate to drive into this area is normally closed except on volunteer workdays, and only volunteers should drive in when it\'s open.</b><br />Enter at the county lot entrance and drive on the gravel path until you reach a bike rack on the left and an information kiosk on the right, then turn left onto a grass trail and park on the right.',
	coords : new gm.LatLng(43.122172,-89.486992),
	image : "http://www.google.com/intl/en_ALL/mapfiles/marker_yellowG.png",
	// a polyline to display when this marker is active
	line_data : [new gm.LatLng(43.122108,-89.491196),
		     new gm.LatLng(43.122054,-89.487925),
		     new gm.LatLng(43.121819,-89.487432),
		     new gm.LatLng(43.122289,-89.487099)],
	// a GPolyline created from line_data
	line_object : null
    }
];

fopb.platform_markers = [
    {
	id : "prairie_overlook",
	title : "West prairie overlook",
	info : "West prairie overlook",
	coords : new gm.LatLng(43.123054,-89.49123)
    },
    {
	id : "hill_overlook",
	title : "Frederick's Hill overlook",
	info : "Frederick's Hill overlook",
	coords : new gm.LatLng(43.123887,-89.484835)
    },
    {
	id : "spring_overlook",
	title : "Springs platform",
	info : "Springs platform",
	coords : new gm.LatLng(43.121005,-89.484127)
    },
    {
	id : "marsh_overlook",
	title : "Marsh platform",
	info : "Marsh platform",
	coords : new gm.LatLng(43.109147,-89.484975)
    }
];

fopb.indian_mound_markers = [
    {
	id : "indian_mounds",
	coords : new gm.LatLng(43.124646,-89.484846),
	image : "http://www.google.com/intl/en_ALL/mapfiles/marker_purple.png"
    }
];

fopb.bike_rack_markers = [
    {
	id : "rack_left",
	coords : new gm.LatLng(43.121968,-89.487432),
	image : "http://www.google.com/intl/en_ALL/mapfiles/marker_orangeA.png"
    },
    {
	id : "rack_middle",
	coords : new gm.LatLng(43.121537,-89.484406),
	image : "http://www.google.com/intl/en_ALL/mapfiles/marker_orangeB.png"
    },
    {
	id : "rack_right",
	coords : new gm.LatLng(43.120598,-89.48166),
	image : "http://www.google.com/intl/en_ALL/mapfiles/marker_orangeC.png"
    }
];

fopb.info_sign_markers = [
    {
	id : "Guerdons hill signs",
	coords : new gm.LatLng(43.123054,-89.49123)
    },
    {
	id : "northwest",
	coords : new gm.LatLng(43.121811,-89.487464)
    },
    {
	id : "marsh overlook signs",
	coords : new gm.LatLng(43.121817,-89.487067)
    },
    {
	id : "hilltop",
	coords : new gm.LatLng(43.124025,-89.484707)
    },
    {
	id : "springs",
	coords : new gm.LatLng(43.121057,-89.484181)
    },
    {
	id : "northeast",
	coords : new gm.LatLng(43.121404,-89.483451)
    },
    {
	id : "southeast",
	coords : new gm.LatLng(43.111027,-89.47828)
    },
    {
	id : "south",
	coords : new gm.LatLng(43.105074,-89.492603)
    },
    {
	id : "west",
	coords : new gm.LatLng(43.114559,-89.491283)
    },
    {
        id : "invasives",
        coords : new gm.LatLng(43.119749,-89.491326)
    }
];

fopb.bench_markers = [
    {
	id : "guerdons_hill",
	coords : new gm.LatLng(43.123054,-89.49123)
    },
    {
	id : "loop_left",
	coords : new gm.LatLng(43.12272,-89.49079)
    },
    {
	id : "loop_middle",
	coords : new gm.LatLng(43.121835,-89.487078)
    },
    {
	id : "hill_west",
	coords : new gm.LatLng(43.125077,-89.484996)
    },
    {
	id : "hill_south",
	coords : new gm.LatLng(43.123847,-89.484867)
    },
    {
	id : "loop_right",
	coords : new gm.LatLng(43.121702,-89.483516)
    },
    {
	id : "springs",
	coords : new gm.LatLng(43.120942,-89.484074)
    },
    {
	id : "orchid_heights_pavilion",
	coords : new gm.LatLng(43.118538,-89.477475)
    },
    {
	id : "orchid_heights_pond",
	coords : new gm.LatLng(43.116129,-89.478048)
    },
    {
	id : "orchid_heights_south_trail",
	coords : new gm.LatLng(43.1156,-89.477496)
    },
    {
	id : "woodcreek_north",
	coords : new gm.LatLng(43.112283,-89.482442)
    },
    {
	id : "woodcreek_south",
	coords : new gm.LatLng(43.1117,-89.483064)
    },
    {
	id : "southeast_bridge",
	coords : new gm.LatLng(43.108081,-89.48404)
    },
    {
	id : "south_boardwalk",
	coords : new gm.LatLng(43.108457,-89.487989)
    },
    {
	id : "southwest_corner",
	coords : new gm.LatLng(43.108852,-89.49058)
    },
    {
	id : "lot1_bench_east",
	coords : new gm.LatLng(43.112361,-89.490778)
    },
    {
	id : "lot1_bench",
	coords : new gm.LatLng(43.114182,-89.491143)
    }
];

fopb.restroom_markers = [
    {
	id : "restrooms",
	coords : new gm.LatLng(43.118514,-89.477475),
	image : "http://www.google.com/intl/en_ALL/mapfiles/marker.png"
    }
];
//// end markers data

//// data for those markers that display more information when checked
fopb.more_info_markers = [
    {
	// the actual div id for the checkbox for these markers
	id : "check_all_parking",
	// word to insert in the "more info below" string
	// (cf. update_extra_info_string())
	title : '<span style="color: #7D7D7D">parking</span>'
    },
    {
	id : "check_all_platforms",
	title : '<span style="color: #61B94A">platforms</span>'
    }
];

fopb.add_marker_images(fopb.info_sign_markers, "white");
fopb.add_marker_images(fopb.platform_markers, "green");
fopb.add_marker_images(fopb.bench_markers, "brown");

window.onload = function() {
  fopb.initialize();
  fopb.infoWindow = new gm.InfoWindow({ maxWidth : 350 });
};
