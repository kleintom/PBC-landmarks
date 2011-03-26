/* 
   @source: https://github.com/kleintom/pbc_landmarks
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

// run on page load
fopb.initialize = function() {

  var parking_doc, platforms_doc, i, m;
  if (GBrowserIsCompatible()) {

    //// action text to recenter and rezoom the map
    document.getElementById("recenter").onclick = fopb.recenter;
    
    //// add the map
    fopb.gkml = new GGeoXml("http://maps.google.com/maps/ms?hl=en&ie=UTF8&t=h&vps=1&jsv=233a&msa=0&output=nl&msid=109419713967081798604.000484df47d724e63a3fb");
    fopb.map = new GMap2(document.getElementById("map_canvas"));
    fopb.map.addControl(new GSmallMapControl());
    fopb.map.addControl(new GMapTypeControl());
    fopb.map.addMapType(G_PHYSICAL_MAP);
    fopb.map.setCenter(new GLatLng(43.122626,-89.486337), 3);
    //fopb.map.setUIToDefault();
    fopb.map.addOverlay(fopb.gkml);
    fopb.gkml.gotoDefaultViewport(fopb.map);
    fopb.map.disableScrollWheelZoom();
    
    //// create the markers
    // parking
    parking_doc = "";
    for (i = 0; i < fopb.parking_markers.length; ++i) {
      m = fopb.parking_markers[i];
      fopb.create_and_add_marker(m, false);
      // maybe add a line going to this parking area
      if (m.line_data) {
	m.line_object = new GPolyline(m.line_data, "#EDE186", 5, 1);
	fopb.map.addOverlay(m.line_object);
      }
      // the description for this marker
      parking_doc += '<div class="marker_detail">';
      parking_doc += 
      '<img class="marker_icon" src="' + m.image + '" />';
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
      '<img class="marker_icon" src="' + m.image + '" />';
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
    
    // information kiosks
    fopb.create_markers(fopb.info_kiosk_markers);
    fopb.create_checker_function("check_all_info_kiosks",
				 "check_all_info_kiosks",
				 fopb.info_kiosk_markers);
    
    // benches
    fopb.assign_bench_letters();
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
  }
  else {
    alert("Sorry, this site cannot be viewed with your browser.  For a list of browsers that support this site, visit http://maps.google.com/support/bin/answer.py?hl=en&amp;topic=1499&amp;answer=16532");
  }
}; // end fopb.initialize

// check and display parking markers, uncheck and hide all others
fopb.display_parking_only = function() {
  
  document.getElementById("check_all_parking").checked = true;
  fopb.check_all_parking();
  document.getElementById("check_all_platforms").checked = false;
  document.getElementById("check_all_indian_mounds").checked = false;
  document.getElementById("check_all_bike_racks").checked = false;
  document.getElementById("check_all_info_kiosks").checked = false;
  document.getElementById("check_all_benches").checked = false;
  document.getElementById("check_all_restrooms").checked = false;
};

// <hide> if the marker should be initially hidden
fopb.create_and_add_marker = function(marker_data, hide) {

  var gicon, options, new_marker;
  gicon = new GIcon(G_DEFAULT_ICON, marker_data.image);
  if (hide) {
    options = { icon: gicon, hide: true};
  }
  else {
    options = { icon: gicon };
  }
  new_marker = new GMarker(marker_data.coords, options);
  marker_data.marker = new_marker;
  // a double click on the marker displays the marker's info
  if (marker_data.info) {
    GEvent.addListener(new_marker, "dblclick", function() {
      new_marker.openInfoWindowHtml(marker_data.info,
				    { maxWidth : 350 });
      
    });
    GEvent.addListener(new_marker, "visibilitychanged", function(visible) {
      if (!visible) {
	new_marker.closeInfoWindow();
      }
    });
    
  }
  fopb.map.addOverlay(marker_data.marker);
};

// hide all of the created markers
fopb.create_markers = function(marker_data) {
  
  var i;
  for (i = 0; i < marker_data.length; ++i) {
    fopb.create_and_add_marker(marker_data[i], true);
  }
};

fopb.assign_bench_letters = function() {

  var i;
  for (i = 0; i < fopb.bench_markers.length; ++i) {
    fopb.bench_markers[i].image = 
      "http://www.google.com/intl/en_ALL/mapfiles/marker_brown" +
      String.fromCharCode(65 + i) + ".png";
  }
};

// create a function named fopb.<name_of_function> that checks the checkbox
// <id_to_check> for whether or not to display <markers>, and displays
// <marker_detail> (if it exists) in the <marker_detail_id> div when
// <id_to_check> is checked.
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
	m_data.line_object.show();
      }
      m.show();
    }
    else {
      if (m_data.line_object) {
	m_data.line_object.hide();
      }
      m.hide();
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
  
  fopb.gkml.gotoDefaultViewport(fopb.map);
}

//// begin markers data
fopb.parking_markers = [
  {
    id : "park3", // arbitrary (but unique)
    title : "County lot", // the marker's name
    // the marker's description (when it has one)
    info : 'A gravel lot surrounded by prairie (there\'s a single tree at the entrance).  There\'s a small green fire lot marker facing the road with the number 4864 on it.',
    // coordinates of the marker
    coords : new GLatLng(43.122108, -89.491196),
    // the image for the marker
    image : "http://www.google.com/intl/en_ALL/mapfiles/marker_greyA.png",
    // the marker object for this marker, to be assigned later
    marker : null
  },
  {
    id : "park1",
    title : "City lot 1",
    info : 'A blacktopped lot with 10 parking spots and an information kiosk to the left.  Across from Gaylord Nelson Rd.',
    coords : new GLatLng(43.114323,-89.491207),
    image : "http://www.google.com/intl/en_ALL/mapfiles/marker_greyB.png"
  },
  {
    id : "park2",
    title : "City lot 2",
    info : 'A small blacktopped lot with 4 spaces.  Across from Whittlesey Rd.',
    coords : new GLatLng(43.116890, -89.491043),
    image : "http://www.google.com/intl/en_ALL/mapfiles/marker_greyC.png"
  },
  {
    id : "park4",
    title : "Orchid Heights Park lot",
    info : 'A larger lot for Orchid Heights Park.',
    coords : new GLatLng(43.118450, -89.477036),
    image : "http://www.google.com/intl/en_ALL/mapfiles/marker_greyD.png"
  },
  {
    id : "park5",
    title : "Highland Way street parking",
    info : 'Curbside parking in front of a conservancy gate.',
    coords : new GLatLng(43.110667,-89.478312),
    image : "http://www.google.com/intl/en_ALL/mapfiles/marker_greyE.png"
  },
  {
    id : "park6",
    title : "Marina Drive street parking",
    info : 'Curbside parking.',
    coords : new GLatLng(43.107396,-89.485693),
    image : "http://www.google.com/intl/en_ALL/mapfiles/marker_greyF.png"
  },
  {
    id : "park3-2",
    title : "Workday parking (grass)",
    info : '<b>Note: This parking is not intended for public use.  The gate to drive into this area is normally closed except on volunteer workdays, and only volunteers should drive in when it\'s open.</b><br />Enter at the county lot entrance and drive on the gravel path until you reach a bike rack on the left and an information kiosk on the right, then turn left onto a grass trail and park on the right.',
    coords : new GLatLng(43.122172,-89.486992),
    image : "http://www.google.com/intl/en_ALL/mapfiles/marker_yellowG.png",
    // a polyline to display when this marker is active
    line_data : [new GLatLng(43.122108,-89.491196),
		 new GLatLng(43.122054,-89.487925),
		 new GLatLng(43.121819,-89.487432),
		 new GLatLng(43.122289,-89.487099)],
    // a GPolyline created from line_data
    line_object : null
  }
];

fopb.platform_markers = [
  {
    id : "hill_overlook",
    title : "Frederick's Hill overlook",
    info : "Frederick's Hill overlook",
    coords : new GLatLng(43.123887,-89.484835),
    image : "http://www.google.com/intl/en_ALL/mapfiles/marker_greenA.png"
  },
  {
    id : "spring_overlook",
    title : "Springs platform",
    info : "Springs platform",
    coords : new GLatLng(43.121005,-89.484127),
    image : "http://www.google.com/intl/en_ALL/mapfiles/marker_greenB.png"
  },
  {
    id : "marsh_overlook",
    title : "Marsh platform",
    info : "Marsh platform",
    coords : new GLatLng(43.109147,-89.484975),
    image : "http://www.google.com/intl/en_ALL/mapfiles/marker_greenC.png"
  }
];

fopb.indian_mound_markers = [
  {
    id : "indian_mounds",
    coords : new GLatLng(43.124646,-89.484846),
    image : "http://www.google.com/intl/en_ALL/mapfiles/marker_purple.png"
  }
];

fopb.bike_rack_markers = [
  {
    id : "rack_left",
    coords : new GLatLng(43.121968,-89.487432),
    image : "http://www.google.com/intl/en_ALL/mapfiles/marker_orangeA.png"
  },
  {
    id : "rack_middle",
    coords : new GLatLng(43.121537,-89.484406),
    image : "http://www.google.com/intl/en_ALL/mapfiles/marker_orangeB.png"
  },
  {
    id : "rack_right",
    coords : new GLatLng(43.120598,-89.48166),
    image : "http://www.google.com/intl/en_ALL/mapfiles/marker_orangeC.png"
  }
];

fopb.info_kiosk_markers = [
  {
    id : "northwest",
    coords : new GLatLng(43.121811,-89.487464),
    image : "http://www.google.com/intl/en_ALL/mapfiles/marker_whiteA.png"
  },
  {
    id : "northeast",
    coords : new GLatLng(43.121404,-89.483451),
    image : "http://www.google.com/intl/en_ALL/mapfiles/marker_whiteB.png"
  },
  {
    id : "southeast",
    coords : new GLatLng(43.111027,-89.47828),
    image : "http://www.google.com/intl/en_ALL/mapfiles/marker_whiteC.png"
  },
  {
    id : "south",
    coords : new GLatLng(43.105074,-89.492603),
    image : "http://www.google.com/intl/en_ALL/mapfiles/marker_whiteD.png"
  },
  {
    id : "west",
    coords : new GLatLng(43.114559,-89.491283),
    image : "http://www.google.com/intl/en_ALL/mapfiles/marker_whiteE.png"
  }
];

// images are assigned on load
fopb.bench_markers = [
  {
    id : "loop_left",
    coords : new GLatLng(43.12272,-89.49079),
    image : ""
  },
  {
    id : "loop_middle",
    coords : new GLatLng(43.121835,-89.487078),
    image : ""
  },
  {
    id : "hill_west",
    coords : new GLatLng(43.125077,-89.484996),
    image : ""
  },
  {
    id : "hill_south",
    coords : new GLatLng(43.123847,-89.484867),
    image : ""
  },
  {
    id : "loop_right",
    coords : new GLatLng(43.121702,-89.483516),
    image : ""
  },
  {
    id : "springs",
    coords : new GLatLng(43.120942,-89.484074),
    image : ""
  },
  {
    id : "orchid_heights_pavilion",
    coords : new GLatLng(43.118538,-89.477475),
    image : ""
  },
  {
    id : "orchid_heights_pond",
    coords : new GLatLng(43.116129,-89.478048),
    image : ""
  },
  {
    id : "orchid_heights_south_trail",
    coords : new GLatLng(43.1156,-89.477496),
    image : ""
  },
  {
    id : "woodcreek_north",
    coords : new GLatLng(43.112283,-89.482442),
    image : ""
  },
  {
    id : "woodcreek_south",
    coords : new GLatLng(43.1117,-89.483064),
    image : ""
  },
  {
    id : "southeast_bridge",
    coords : new GLatLng(43.108081,-89.48404),
    image : ""
  },
  {
    id : "south_boardwalk",
    coords : new GLatLng(43.108457,-89.487989),
    image : ""
  },
  {
    id : "southwest_corner",
    coords : new GLatLng(43.108852,-89.49058),
    image : ""
  },
  {
    id : "lot1_bench_east",
    coords : new GLatLng(43.112361,-89.490778),
    image : ""
  },
  {
    id : "lot1_bench",
    coords : new GLatLng(43.114182,-89.491143),
    image : ""
  }
];

fopb.restroom_markers = [
  {
    id : "restrooms",
    coords : new GLatLng(43.118514,-89.477475),
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

