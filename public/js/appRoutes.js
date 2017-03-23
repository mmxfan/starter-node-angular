angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider

	// home page
		.when('/', {
		templateUrl: 'views/home.html',
		controller: 'MainController'
	})

	.when('/enroll', {
		templateUrl: 'views/enroll.html',
		controller: 'EnrollController'
	})

	.when('/score', {
		templateUrl: 'views/score.html',
		controller: 'ScoreController'
	})

	// .when('/nerds', {
	// 	templateUrl: 'views/nerd.html',
	// 	controller: 'NerdController'
	// })

	// .when('/geeks', {
	// 	templateUrl: 'views/geek.html',
	// 	controller: 'GeekController'
	// })

	.otherwise({
		redirectTo: '/'
	});

	$locationProvider.html5Mode(true);

}]);