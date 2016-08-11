/*---------------------------------- Model of MVVM ----------------------------------*/

var mapLocations =
[
	{
		name: "Handy Boat Marina and Portland Yacht Club",
		wikiEntry: "Casco Bay",
		location: {lat: 43.727973, lng: -70.2080978}
	},
	{
		name: "Falmouth Memorial Library",
		wikiEntry: "Falmouth Memorial Library",
		location: {lat: 43.722976, lng: -70.233731}
	},
	{
		name: "Maine Audubon at Gilsland Farm",
		wikiEntry: "National Audubon Society",
		location: {lat: 43.706024, lng: -70.243421}
	},
	{
		name: "Mackworth Island",
		wikiEntry: "Mackworth Island",
		location: {lat: 43.6891366, lng: -70.229235}
	},
	{
		name: "Martin's Point",
		wikiEntry: "Neighborhoods in Portland, Maine",
		location: {lat: 43.6876066, lng: -70.2453142}
	},
	{
		name: "Arcadia (home)",
		wikiEntry: "Neighborhoods in Portland, Maine",
		location: {lat: 43.684952, lng: -70.252525}
	},
	{
		name: "East End Beach and Promenade",
		wikiEntry: "Eastern Promenade",
		location: {lat: 43.6690862, lng: -70.2400736}
	},
	{
		name: "Commercial Street and waterfront",
		wikiEntry: "Commercial Street, Portland, Maine",
		location: {lat: 43.654356, lng: -70.2523387}
	},
	{
		name: "Portland Museum of Art",
		wikiEntry: "Portland Museum of Art",
		location: {lat: 43.653929, lng: -70.260676}
	},
	{
		name: "Back Cove",
		wikiEntry: "Back Cove, Portland, Maine",
		location: {lat: 43.663918, lng: -70.268359}
	},	{
		name: "Portland Transportation Center",
		wikiEntry: "Portland Transportation Center",
		location: {lat: 43.6542526, lng: -70.2902987}
	},
	{
		name: "The Maine Mall shopping area",
		wikiEntry: "The Maine Mall",
		location: {lat: 43.6213602, lng: -70.348349}
	}
];

/*----------------------------- ViewModel of MVVM ----------------------------*/

// define each location with a `name` & `location` in the `mapLocations` JSON above
var Location = function (info, map) {

	var self = this;

	self.name = ko.observable(info.name);
	self.location = ko.observable(info.location);
	self.searchWiki = info.wikiEntry;
	self.content = self.name();

	// define marker properties
	self.marker = new google.maps.Marker({
		name: self.name(),
		position: self.location(),
		map: map,
        animation: google.maps.Animation.DROP,
        icon: 'images/beachflag.png',
        // visible: false
	});

	// add location if it meets (or there is no) search criteria
	self.visible = ko.computed(function() {

		if (lookup().length > 0) {	// if search box has entry
			return (self.name().toLowerCase().indexOf(lookup().toLowerCase()) > -1);
		}							// true: if this location matches search string (so index is 0 or greater)
									// false: if not (index = -1)

		else {						// OR if search box is empty
			return true;			// true
		}

	}, self);

	// search Wikipedia for location info and display: name, blurb, source
	$.ajax({
		type: "GET",
		dataType: 'jsonp',
		url: wikiLink+self.searchWiki,
		timeout: 2000
	}).done(function(info) {
		self.content = '<heading>' + self.name() + '</heading>' + '<br>' +
		'<blurb>' + info[2][0] + '<br>' +
		'<i>' + '<a href=' + info[3][0] + ' target="blank">Wikipedia</a>' + '</i>'  + '</blurb>';
	}).fail(function(jqXHR, textStatus){
		alert("Wikipedia resources did not load. Please refresh page.");
	});

	// bounce map marker when it or list-location is selected
	self.bounceMarker = function() {
		self.marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function(){
			self.marker.setAnimation(null);
		}, 1400);
	};
};

var wikiLink ='https://en.wikipedia.org/w/api.php?action=opensearch&format=json&callback=wikiCallBack&search=';

var lookup = ko.observable("");  // lookup: search bar criteria

/*---------------------------------------------------------------------------*/

var ViewModel = function(){

	var self = this;

	// create map, centered near Arcadia
	self.map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 43.686000, lng: -70.2400000},
		zoom: 13,
		mapTypeControl: false
	});

	// initialize location array (using JSON above)
	self.locationsList = ko.observableArray([]);
	mapLocations.forEach(function(locationItem){
		self.locationsList.push(new Location(locationItem, self.map));
	});

	// create event listeners for marker clicks
	self.locationsList().forEach(function(location){
		google.maps.event.addListener(location.marker, 'click', function () {
			self.clickLocation(location);
		});
	});

	// open infoWindow above map marker with additional information
	var infoWindow = new google.maps.InfoWindow();
	self.clickLocation = function(location) {
		infoWindow.setContent(location.content);
		infoWindow.open(self.map, location.marker);
		location.bounceMarker();
	};

	// create array of locations meeting search criteria
	self.match = ko.computed(function(){
		var matches = [];
		self.locationsList().forEach(function(location){
			if (location.visible()) {	// if true ...
				matches.push(location);	// add location to matches array
				location.marker.setVisible(true);  // makes marker visible
			}
			else {						// if false ...
				location.marker.setVisible(false);  // makes marker invisible
			}
		});
		return matches;					// array of matches

	}, self);

};

/*---------------------------------------------------------------------------*/

// activate Knockout
function initMap(){
	ko.applyBindings(new ViewModel());
}

// alert user if map does not load
function mapError() {
	alert("Google map did not load. Please refresh page.");
}
