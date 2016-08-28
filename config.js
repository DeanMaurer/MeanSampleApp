(function () {
	angular.module("flapperNews").config(config);

	config.$inject = ["$stateProvider", "$urlRouterProvider", "$locationProvider"];
    function config($stateProvider, $urlRouterProvider, $locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
        $urlRouterProvider.otherwise("/");

        $stateProvider
			.state('main', {
				url: '/',
				templateUrl: '/Templates/home.html',
				controller: 'main',
				controllerAs: 'main'
			})
			.state('posts', {
				url: '/posts/{id}',
				templateUrl: '/Templates/posts.html',
				controller: 'postsCtrl',
				contollerAs: 'postsCtrl'
			});
    }
}());