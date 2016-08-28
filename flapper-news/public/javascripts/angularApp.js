// /app.js
(function () {
	angular.module('flapperNews', ['ui.router']);
}());

// controllers/main.js
(function () {
    angular.module("flapperNews").controller("main", main)

    main.$inject = ['$scope', 'posts'];
    function main($scope, posts){
    	var self = this;
		$scope.posts = posts.posts;

		$scope.addPost = function() {
			if($scope.title && $scope.title !== '') {
				$scope.posts.push({
					title: $scope.title,
					link: $scope.link,
					upvotes: 0,
					comments: [
						{author: 'Joe', body: 'Cool post!', upvotes: 0},
						{author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
					]
				});
			}
			$scope.title = '';
			$scope.link = '';
		};

		$scope.incrementUpvotes = function(post) {
			post.upvotes += 1;
		};
	}
}());

// controllers/postsCtrl.js
(function () {
    angular.module("flapperNews").controller("postsCtrl", postsCtrl)

    postsCtrl.$inject = ['$scope', '$stateParams', 'posts'];
    function postsCtrl($scope, $stateParams, posts){

    	$scope.post = posts.posts[$stateParams.id];

    	$scope.addComment = function() {
    		if($scope.body !== '') {
    			$scope.post.comments.push({
    				body: $scope.body,
    				author: 'user',
    				upvotes: 0
    			});
    		}
    		$scope.body = '';
    	};

    	$scope.incrementUpvotes = function(comment)  {
    		comment.upvotes += 1;
    	}
	}
}());

// services/posts.js
(function () {
	angular.module("flapperNews").factory("posts", [function() {
	var o = {
		posts: []
	};
	return o;
}])}());

// /app.run.js
(function () {
    angular.module("flapperNews").run(run);

    run.$inject = ["$rootScope", "$state", "$stateParams", "$window"];
    function run($rootScope, $state, $stateParams, $window) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    }
}());

// /config.js
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
				templateUrl: '/home.html',
				controller: 'main',
				controllerAs: 'main'
			})
			.state('posts', {
				url: '/posts/{id}',
				templateUrl: '/posts.html',
				controller: 'postsCtrl',
				contollerAs: 'postsCtrl'
			});
    }
}());