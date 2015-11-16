var citiesArr,
  selectedCity,
  map,
  markers = [];

var CLOSE_BUTTON = '&#10060';

var geocoder = new google.maps.Geocoder();

function getVkCities() {
  $.ajax({
    url: "https://api.vk.com/method/database.getCities",
    dataType: "jsonp",
    //cache: true,
    //timeout: 5000,
    data: {
      country_id: 2,
      q: $.trim($(this).val()),
      need_all: 1,
      count: 100
    },
    success: getCts
  });
}

function getCts(result) {

  selectedCity = result.response;
  resultsHandler(selectedCity);
}

function NewCityString() { //create new city-string
  var li = $("<li city-id=" + selectedCity.cid + ">");
  li.html(selectedCity.title + '<span class="closebutton"> ' + CLOSE_BUTTON + '</span>');
  $('#citylist').append(li);
}

function resultsHandler(result) {
  $('#city').autocomplete({
    source: selectedCity.map(function(el) {
      return el.title;
    }),
    select: function(event, ui) {

      for (var i = 0; i <= selectedCity.length; i++) {

        if (selectedCity[i].title == ui.item.value) {
          selectedCity = selectedCity[i];
          break;
        }
      }
      $('#city').val(ui.item.value);

    }
  });
}

function addCity(e) {

  if (!($('#city').val())) return false;

  new NewCityString();

  geocoder.geocode({
    'address': selectedCity.title
  }, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {

      var lat = results[0].geometry.location.lat();
      var lng = results[0].geometry.location.lng();

      var marker = new google.maps.Marker({
        position: {
          lat: lat,
          lng: lng
        },
        map: map,
        title: selectedCity.title,
        cid: selectedCity.cid //VK API prop
      });

      markers.push(marker);

    } else {
      console.log("Geocoding failed: " + status);
    }
  });

  $('#city').val('');

  e.preventDefault();
}

function initializeMap() {
  var mapProp = {
    center: new google.maps.LatLng(49.508742, 30.57),
    zoom: 5,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
}

function removeLi(e) {
  var target = $(e.target);
  markers.forEach(function(el) { //marker deleting
    if (el.cid == target.parent('li').attr('city-id')) el.setMap(null);
  });

  target.parent('li').remove();
}

$(function() {

  $('#city').on('input', getVkCities);

  $('#addcity').submit(addCity);

  $('ul#citylist').on('click', '.closebutton', removeLi);

  initializeMap();
});