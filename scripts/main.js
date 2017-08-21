
var oauth_token = 'RKO1PVZEEEL0YOS4FFYUQXQ23MJ5SNETGVW4HM044KEVRVGO';
var exploreVenuesURL = "https://api.foursquare.com/v2/venues/explore";
var venueDetailsURL = "https://api.foursquare.com/v2/venues/";

var radius = "1000";
var limit = '10';
var query = "coffee";

var photoSize = "200x200";

var venuesGlobal = [];

(function(){
	switchViewToMain(true);
	getLocation();	
})();

function switchViewToMain(isShown){

	document.getElementById("profile").hidden = isShown;
	document.getElementById("actions").hidden = isShown;
	document.getElementById("shop").hidden = !isShown;	

}

//get geolocation
function getLocation() {
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(exploreVenues, showError);
  } else { 
      alert("Geolocation is not supported by this browser.");
  }
}


// Handling errors geolocation
function showError(error) {

  if(error.code === error.PERMISSION_DENIED){
    alert('Location must be enabled if you want some good coffee!  Please reload page and enable location!');
  }
  if(error.code === error.POSITION_UNAVAILABLE) {
    alert("Location information is unavailable.");
  }
  if(error.code === error.TIMEOUT) {
    alert("The request to get user location timed out.");
  }
  if(error.code === error.UNKNOWN_ERROR) {
    alert("An unknown error occurred.");
  }
  document.getElementById("products").innerHTML = "Location must be enabled if you want some good coffee! Please reload page and enable location!"
}

function exploreVenues(position) {
	
	var latlon = position.coords.latitude + ","+ position.coords.longitude;

	var url = exploreVenuesURL + '?v=' + getDateString() + '&ll=' + latlon + '&query=' + query +'&radius=' + radius + '&limit=' + limit + '&intent=checkin&venuePhotos=1&oauth_token=' + oauth_token;
	
	var exploreVenuesResult = getData(url).response.groups[0].items;
	
	showOpenedVenues(exploreVenuesResult);

}

function showOpenedVenues(venues){

	for (var i in venues) {
		if(venues[i].venue.hours!=null && venues[i].venue.hours.isOpen){			
			var id = venues[i].venue.id;
			var image = venues[i].venue.photos.groups[0].items[0].prefix+photoSize+venues[i].venue.photos.groups[0].items[0].suffix;
			var name = venues[i].venue.name;
			var distance = venues[i].venue.location.distance;
			var price = venues[i].venue.price != null ? venues[i].venue.price.message : "Unknown";
			var tier = venues[i].venue.price != null ? venues[i].venue.price.tier : 4;
			var rating = venues[i].venue.rating;
			var venue = new Venue(id,image,name,distance,price,rating, tier);
			venuesGlobal.push(venue);			
		}
	}
	showVenues(venuesGlobal,"Distance");

}


function showVenues(venues,param){

	document.getElementById("products").innerHTML = "";
	sortByParam(venuesGlobal,param);
	for (var i in venuesGlobal) {
		showVenue(venuesGlobal[i]);
	}	

}

function showVenue(venue){
	
	var venuesCatalog = document.getElementById("products");
	
	var venueTemplate = document.createElement("DIV");
	venueTemplate.setAttribute("class","col-sm-3 venue introFadeIn");
	venuesCatalog.appendChild(venueTemplate);
	
	var venueImageElement = document.createElement("IMG");
	venueImageElement.setAttribute("src",venue.ImagePath);
	venueImageElement.setAttribute("class","img-responsive img-circle");
	venueImageElement.setAttribute("alt","");
	venueTemplate.appendChild(venueImageElement);
	
	var venueNameElement = document.createElement("H4");
	venueNameElement.innerHTML = venue.Name;
	venueTemplate.appendChild(venueNameElement);
	
	var venueDistanceElement= document.createElement("P");
	venueDistanceElement.innerHTML = "Distance: ";
	venueTemplate.appendChild(venueDistanceElement);

	var venueDistanceValueElement= document.createElement("SPAN");
	venueDistanceValueElement.setAttribute("id","distance" + venue.ID);
	venueDistanceValueElement.innerHTML = venue.Distance;
	venueDistanceElement.appendChild(venueDistanceValueElement);
			
	var venueRatingElement= document.createElement("P");
	venueRatingElement.innerHTML = "Rating: ";
	venueTemplate.appendChild(venueRatingElement);

	var venueRatingValueElement= document.createElement("SPAN");
	venueRatingValueElement.setAttribute("id","rating" + venue.ID);
	venueRatingValueElement.innerHTML = venue.Rating;
	venueRatingElement.appendChild(venueRatingValueElement);
	
	var venuePriceElement= document.createElement("P");
	venuePriceElement.innerHTML = "Price: ";
	venueTemplate.appendChild(venuePriceElement);

	var venuePriceValueElement= document.createElement("SPAN");
	venuePriceValueElement.setAttribute("id","price" + venue.ID);
	venuePriceValueElement.innerHTML = venue.Price;
	venuePriceElement.appendChild(venuePriceValueElement);
	
	var btnDetailsElement= document.createElement("BUTTON");
	btnDetailsElement.setAttribute("id", venue.ID);
	btnDetailsElement.setAttribute("onclick","showDetails(this)");
	btnDetailsElement.innerHTML="Details";
	venueTemplate.appendChild(btnDetailsElement);
	
}

function showDetails(venue){

	var id = venue.id;
	var distance = getDistance(id);
	switchViewToMain(false);
	var venueDetailsUrl = venueDetailsURL + id + '?oauth_token=' + oauth_token + '&v='+getDateString();
	var venueDetails = getData(venueDetailsUrl).response.venue;
	var image = venueDetails.bestPhoto.prefix+photoSize+venueDetails.bestPhoto.suffix;
	var name = venueDetails.name;	
	var price = venueDetails.price != null ? venueDetails.price.message : "Unknown";
	var tier = venueDetails.price != null ? venueDetails.price.tier : 4;
	var rating = venueDetails.rating;
	var tips = getFilteredTips(venueDetails.tips);
	var images = getImages(venueDetails.photos.groups[0].items);
	var venue = new Venue(id,image,name,distance,price,rating, tier, tips, images);
	showVenueDetails(venue);	

}

function getFilteredTips(tips){

	var result = [];
	for(var i in tips.groups){
		for(var j in tips.groups[i].items){
			if(tips.groups[i].items[j].text.indexOf(query)>-1){
				result.push(tips.groups[i].items[j].text);
			}
		}
	}
	return result;
}

function getImages(images){
	var result = [];
	for(var i in images){

		result.push(images[i].prefix + photoSize + images[i].suffix);

	}
	return result;
}

function getDistance(id){

	for(var i in venuesGlobal){
		if(venuesGlobal[i].ID==id){
			return venuesGlobal[i].Distance;
		}
	}

}

function showVenueDetails(venue){

	document.getElementById("venueDetailsImage").setAttribute("src",venue.ImagePath);
	document.getElementById("venueDetailsName").innerHTML = venue.Name;
	document.getElementById("venueDetailsDistance").innerHTML = venue.Distance;
	document.getElementById("venueDetailsPrice").innerHTML = venue.Price;
	document.getElementById("venueDetailsTips").innerHTML = "";
	for(var i in venue.Tips){
		document.getElementById("venueDetailsTips").innerHTML += venue.Tips[i] + "<br>";
	}
	var sliderImages = document.querySelectorAll("#actions img");
	for(var i in venue.Images){
		sliderImages[i].src = venue.Images[i];
	}

}

function getDateString() {
    var today = new Date();
    var todayISO = today.toISOString();
    return todayISO.substr(0,todayISO.indexOf('T')).replace('-','').replace('-','');
}

function getData(url, username, password) {
  
    try {
      var result;
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
          if (xmlhttp.status == 200) {
            result = JSON.parse(xmlhttp.response);
          } else {
            return false;
          }
        }
      }
      xmlhttp.open("GET", url, false, username, password);
      xmlhttp.send();
      return result;
    }
    catch (err) {
      return err;
    }
}


function Venue(id, image, name, distance, price, rating,tier, tips, images){

		this.ID = id;
		this.ImagePath = image;
		this.Name = name;
		this.Distance = distance;
		this.Price = price;
		this.Rating = rating;	
		this.PriceTier = tier;
		this.Tips = tips;
		this.Images = images;

}


function sortByParam(venues,param){

	for(var i = 0; i < venues.length-1; i++){
		for(var j = i+1; j < venues.length; j++){
			if(venues[i][param]>venues[j][param]){
				var temp = venues[i];
				venues[i] = venues[j];
				venues[j] = temp;
			}
		}
	}	
}
