(function () {

/**
 * Variables
 */
var user_id       = '';
var user_fullname = '';
var lng           = -122.08;
var lat           = 37.38;

/**
 * Initialize
 */
function init() {
	// register event listeners
    $('login-switch').addEventListener('click', toSignup);
    $('login-btn').addEventListener('click', login);
	$('nearby-btn').addEventListener('click', loadNearbyRestaurants);
	$('fav-btn').addEventListener('click', loadFavoriteRestaurants);
	$('recommend-btn').addEventListener('click', loadRecommendedRestaurants);

	validateSession();
	
	//onSessionValid({
	//	user_id: '1111',
	//	name: 'Zekun Wang'
	//});
}

/**
 * Session
 */
function validateSession() {
	//The request parameters
	var url = './LoginServlet';
	var req = JSON.stringify({});

	// display loading message
	showLoadingMessage('Validating session...');

	ajax('GET', url, req,
		// successful callback
		function (res) {
			var result = JSON.parse(res);
			// successfully logged in
			if (result.status === 'OK') {
				onSessionValid(result);
			}
		}
	);
}

function onSessionValid(result) {
	user_id = result.user_id;
	user_fullname = result.name;

	var loginForm = $('login-form');
	var restaurantNav = $('restaurant-nav');
	var restaurantList = $('restaurant-list');
	var avatar = $('avatar');
	var welcomeMsg = $('welcome-msg');
	var logoutBtn = $('logout-link');

	welcomeMsg.innerHTML = 'Welcome, ' + user_fullname;

	showElement(restaurantNav);
	showElement(restaurantList);
	showElement(avatar);
	showElement(welcomeMsg);
	showElement(logoutBtn, 'inline-block');
	hideElement(loginForm);

	initGeoLocation();
}

function onSessionInvalid() {
	var loginForm = $('login-form');
	var restaurantNav = $('restaurant-nav');
	var restaurantList = $('restaurant-list');
	var avatar = $('avatar');
	var welcomeMsg = $('welcome-msg');
	var logoutBtn = $('logout-link');

	hideElement(restaurantNav);
	hideElement(restaurantList);
	hideElement(avatar);
	hideElement(logoutBtn);
	hideElement(welcomeMsg);
  
	showElement(loginForm);
}

function initGeoLocation() {	////////Pending Change/////////
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(onPositionUpdated, onLoadPositionFailed, {maximumAge: 60000});
		showLoadingMessage('Retrieving your location...');
	} else {
		onLoadPositionFailed();
	}
}

function onPositionUpdated(position) {
	lat = position.coords.latitude;
	lng = position.coords.longitude;

	loadNearbyRestaurants();
}

function onLoadPositionFailed() {
	console.warn('navigator.geolocation is not available');
	loadNearbyRestaurants();
}

//-----------------------------------
//  Signup
//-----------------------------------

function toSignup() {
	clearLoginError();
	$('username').value = '';
	$('password').value = '';
	$('firstName').value = '';
	$('lastName').value = '';
    var loginSwitch = $('login-switch');
    var loginBtn = $('login-btn');
    var signupInfo = $('signupInfo');
    showElement(signupInfo);
    // change text
    loginSwitch.innerHTML = 'Login';
    loginBtn.innerHTML = 'Signup';
    // remove events
    loginSwitch.removeEventListener('click', toSignup);
    loginBtn.removeEventListener('click', login);
    // add new events
    loginSwitch.addEventListener('click', toLogin);
    loginBtn.addEventListener('click', signup);
}
  
function signup() {
	var username = $('username').value;
	var password = $('password').value;
	var firstName = $('firstName').value;
	var lastName = $('lastName').value;
	
	if (username === '') {
    	showSignupError('username');
    	return;
	} else if (password === '') {
	    showSignupError('password');
    	return;
	} else if (firstName === '') {
	    showSignupError('firt name');
    	return;
	} else if (lastName === '') {
	    showSignupError('last name');
    	return;
	}
	
	password = md5(username + md5(password));
	  
	//The request parameters
	var url = './SignupServlet';
	var req = JSON.stringify({
		user_id: username,
		password: password,
		firstName: firstName,
		lastName: lastName
	});

	ajax('POST', url, req,
		// successful callback
		function (res) {
	    	var result = JSON.parse(res);
	      
	    	// successfully logged in
	    	if (result.status === 'OK') {
	    		toLogin();
	    		showSignupSuccess();
	    	}
	    },
	    // error
	    function () {
	    	showSignupError('signup');
		}
	);
}

function showSignupSuccess() {
    $('login-error').innerHTML = 'Signup Successful';
}

function showSignupError(msg) {
    $('login-error').innerHTML = 'Invalid ' + msg;
}
  
//-----------------------------------
//  Login
//-----------------------------------

function toLogin() {
	clearLoginError();
	$('username').value = '';
	$('password').value = '';
    var loginSwitch = $('login-switch');
    var loginBtn = $('login-btn');
    var signupInfo = $('signupInfo');
    hideElement(signupInfo);
    // change text
    loginSwitch.innerHTML = 'Signup';
    loginBtn.innerHTML = 'Login';
    // remove events
    loginSwitch.removeEventListener('click', toLogin);
    loginBtn.removeEventListener('click', signup);
    // add new events
    loginSwitch.addEventListener('click', toSignup);
    loginBtn.addEventListener('click', login);
}
  
function login() {
  var username = $('username').value;
  var password = $('password').value;
  password = md5(username + md5(password));
  
  //The request parameters
  var url = './LoginServlet';
  var params = 'user_id=' + username + '&password=' + password;
  var req = JSON.stringify({});

  ajax('POST', url + '?' + params, req,
    // successful callback
    function (res) {
      var result = JSON.parse(res);
      
      // successfully logged in
      if (result.status === 'OK') {
    	onSessionValid(result);
      }
    },
    // error
    function () {
      showLoginError();
    }
  );
}

function showLoginError() {
    $('login-error').innerHTML = 'Invalid username or password';
}

function clearLoginError() {
	$('login-error').innerHTML = '';
}

// -----------------------------------
//  Helper Functions
// -----------------------------------


/**
 * To make a navigation button active (clicked)
 *
 * @param btnId - id of navigation button
 */
function activeBtn(btnId) {
	var btns = document.getElementsByClassName('main-nav-btn');

	// deactivate all navigation buttons
	for (var i = 0; i < btns.length; i++) {
		btns[i].className = btns[i].className.replace(/\bactive\b/, '');
	}

	// active the one that has id = btnId
	var btn = $(btnId);
	btn.className += ' active';
}

function showLoadingMessage(msg) {
	var restaurantList = $('restaurant-list');
	restaurantList.innerHTML = '<p class="notice"><i class="fa fa-spinner fa-spin"></i>' + msg + '</p>';
}

function showWarningMessage(msg) {
	var restaurantList = $('restaurant-list');
	restaurantList.innerHTML = '<p class="notice"><i class="fa fa-exclamation-triangle"></i>' + msg + '</p>';
}

function showErrorMessage(msg) {
	var restaurantList = $('restaurant-list');
	restaurantList.innerHTML = '<p class="notice"><i class="fa fa-exclamation-circle"></i>' + msg + '</p>';
}

/**
 * To create a DOM element <tag options...>
 * 
 * @param tag
 * @param options
 * @returns
 */
function $(tag, options) {
	if (!options) {
		return document.getElementById(tag);
  	}

  	var element = document.createElement(tag);

  	for (var option in options) {
    	if (options.hasOwnProperty(option)) {
    		element[option] = options[option];
    	}
	}
	return element;
}

function hideElement(element) {
	element.style.display = 'none';
}

function showElement(element, style) {
	element.style.display = style ? style : 'block';
}

/**
 * AJAX helper function
 *
 * @param method	   - GET|POST|PUT|DELETE
 * @param url 		   - API end point
 * @param callback 	   - successful callback
 * @param errorHandler - failed callback
 */
function ajax(method, url, data, callback, errorHandler) {
	var xhr = new XMLHttpRequest();
	// open(method, url, async)
	// method: the type of request: GET or POST
	// url: the server (file) location
	// async: true (asynchronous) or false (synchronous)
	xhr.open(method, url, true);
	// run function() to decide which function to run when page loads
	xhr.onload = function () {
		switch (xhr.status) {
			case 200: callback(xhr.responseText);	// depents on input function
					  break;
			case 403: onSessionInvalid();
					  break;
			case 401: errorHandler();	// depents on input function
		}
	};
	xhr.onerror = function () {
		console.error("The request couldn't be completed.");
		errorHandler();
	};
	// send()	Sends the request to the server (used for GET)
	// send(string)	Sends the request to the server (used for POST)
	if (data === null) {
		xhr.send();
	} else {
	    xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
    	xhr.send(data);
	}
}

// ------------------------------
//	AJAX call server-side APIs
// ------------------------------

/**
 * Load nearby restaurants
 * API end point: [GET] /Dashi/restaurants?user_id=1111&lat=37.38&lon=-122.08
 */
function loadNearbyRestaurants() {
	console.log('loadNearbyRestaurants');
	// active button
	activeBtn('nearby-btn');

	// request parameters
	var url = './restaurants';
	var params = 'user_id=' + user_id + '&lat=' + lat + '&lon=' + lng;
	var req = JSON.stringify({});

	// display loading message
	showLoadingMessage('Loading nearby restaurants...');

	// make AJAX call
	ajax('GET', url + '?' + params, req, 
		// successful callback
		// callback(xhr.responseText)
		function (res) {
			// parse response JSON string to JSON object or array
			var restaurants = JSON.parse(res);
			if (!restaurants || restaurants.length === 0) {
				showWarningMessage('No nearby restaurant.');
			} else {
				// list responsed restaurants on html page
				listRestaurants(restaurants);
			}
		},
		// failed callback
		function () {
			showErrorMessage('Cannot load nearby restaurants.');
		}
	);
}

/**
 * Load favorite (or visited) restaurants
 * API end point: [GET] /Dashi/history?user_id=1111
 */
function loadFavoriteRestaurants() {
	console.log('loadFavoriteRestaurants');
	activeBtn('fav-btn');

	// request parameters
	var url = './history';
	var params = 'user_id=' + user_id;
	var req = JSON.stringify({});

	// display loading message
	showLoadingMessage('Loading favorite restaurants...');

	// make AJAX call
	ajax('GET', url + '?' + params, req,
		function (res) {
			var restaurants = JSON.parse(res);
			if (!restaurants || restaurants.length === 0) {
				showWarningMessage('No favorite restaurant.');
			} else {
				listRestaurants(restaurants);
			}
		},
		function () {
			showErrorMessage('Cannot load favorite restaurants.');
		}
	);
}

/**
 * Load recommended restaurants
 * API end point: [GET] /Dashi/recommendation?user_id=1111
 */
function loadRecommendedRestaurants() {
	console.log('loadRecommendedRestaurants');
	activeBtn('recommend-btn');
	// request parameters
	var url = './recommendation';
	var params = 'user_id=' + user_id + '&lat=' + lat + '&lon=' + lng;
	var req = JSON.stringify({});

	// display loading message
	showLoadingMessage('Loading recommended restaurants...');

	// make AJAX call
	ajax('GET', url + '?' + params, req,
		//successful callback
		function (res) {
			var restaurants = JSON.parse(res);
			if (!restaurants || restaurants.length === 0) {
				showWarningMessage('No recommended restaurant. Make sure you have favorites.');			
			} else {
				listRestaurants(restaurants);
			}
		},
		// failed callback
		function () {
			showErrorMessage('Cannot load recommended restaurants.');
		}
	);
}

/**
 * Toggle favorite (or visited) restaurants
 * 
 * @param business_id - The restaurant business id
 * 
 * API end point: [POST]/[DELETE] /Dashi/history
 * request json data: { user_id: 1111, visited: [a_list_of_business_ids] }
 */
function changeFavoriteRestaurant(business_id) {
	var li = $('restaurant-' + business_id);
	var favIcon = $('fav-icon-' + business_id);
	// isVisited: user want to set the restaurant as visited/favorite
	// isVisited = true, if not visited before, add to favorite
	//			 = false, if visited before, remove from vauorite
	var isVisited = li.dataset.visited !== 'true';

	// request parameter
	var url = './history';
	// change JSON data to JSON string
	var req = JSON.stringify({
		user_id: user_id,
		visited: [business_id]	// add one restaurant
	});
	var method = isVisited ? 'POST' : 'DELETE';
	ajax(method, url, req, 
		// successful callback
		function (res) {
			var result = JSON.parse(res);
			if (result.status === 'OK') {
				li.dataset.visited = isVisited;
				favIcon.className = isVisited ? 'fa fa-heart' : 'fa fa-heart-o';
			}
		}
	);
}


// -------------------------------------
//  Create restaurant list
// -------------------------------------

/**
 * List restaurants
 * 
 * @param restaurants - An array of restaurant JSON objects
 */
function listRestaurants(restaurants) {
	// clear current restaurants on html page
	var restaurantList = $('restaurant-list');
	restaurantList.innerHTML = '';

	// add each restaurant from JSON array
	for (var i = 0; i < restaurants.length; i++) {
		addRestaurant(restaurantList, restaurants[i]);
	}
}

/**
 * Add single restaurant to the list
 * 
 * @param restaurantList - The <ul id="restaurant-list"> tag
 * @param restaurant - The restaurant data (JSON object)
 */
function addRestaurant(restaurantList, restaurant) {
	var business_id = restaurant.business_id;
	// create <li ...>
	var li = $('li', {
		id: 'restaurant-' + business_id,
		className: 'restaurant'
	});
	// set data attribute
	li.dataset.business = business_id;
	li.dataset.visited = restaurant.is_visited;

	// restaurant image
	li.appendChild($('img', {src: restaurant.image_url}));

	// section
	var section = $('div', {});
  
	// create and add title to section
	var mil = getDistanceFromLatLonInKm(restaurant.latitude, restaurant.longitude, lat, lng);
	var diff = Math.pow(restaurant.latitude - lat, 2) + Math.pow(restaurant.longitude - lng, 2);
	var title = $('a', {href: restaurant.url, target: '_blank', className: 'restaurant-name'});
	title.innerHTML = restaurant.name;	// + ' (' + diff + ', ' + mil + ')';
	section.appendChild(title);

	// category
	var category = $('p', {className: 'restaurant-category'});
	category.innerHTML = 'Category: ' + restaurant.categories.join(', ');
	section.appendChild(category);

	// stars
	var stars = $('div', {className: 'stars'});
	for (var i = 1; i <= restaurant.stars; i++) {
		var star = $('i', {className: 'fa fa-star'});
		stars.appendChild(star);
	}
	if (('' + restaurant.stars).match(/\.5$/)) {
		var halfStar = $('i', {className: 'fa fa-star-half-o'});
		stars.appendChild(halfStar);
	}
	section.appendChild(stars);
	// end of section
	li.appendChild(section);

	// address
	var address = $('p', {className: 'restaurant-address'});
	address.innerHTML = restaurant.full_address.replace(/,/g, '<br/>');	// g means global, replace all matches
	li.appendChild(address);

	// favorite link
	var favLink = $('div', {className: 'fav-link'});
	favLink.onclick = function () {
		changeFavoriteRestaurant(business_id);
	};

	var heart = $('i', {
		id: 'fav-icon-' + business_id,
		className: restaurant.is_visited ? 'fa fa-heart' : 'fa fa-heart-o'
	});
	favLink.appendChild(heart);

	li.appendChild(favLink);

	restaurantList.appendChild(li);
}

// ‘Haversine’ formula to transform latitute, longitude to miles
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
	var R = 6371; // Radius of the earth in km
	var dLat = deg2rad(lat2-lat1);  // deg2rad below
	var dLon = deg2rad(lon2-lon1); 
	var a = 
	  Math.sin(dLat/2) * Math.sin(dLat/2) +
	  Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
	  Math.sin(dLon/2) * Math.sin(dLon/2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c; // Distance in km
	return d / 1.609344;	// km to miles
}

function deg2rad(deg) {
	return deg * (Math.PI/180);
}

init();
  
})();
