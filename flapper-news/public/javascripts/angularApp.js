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
				posts.create({
					title: $scope.title,
					link: $scope.link,
				});
			}
			$scope.title = '';
			$scope.link = '';
		};

		$scope.incrementUpvotes = function(post) {
			posts.upvote(post);
		};
	}
}());

// controllers/postsCtrl.js
(function () {
    angular.module("flapperNews").controller("postsCtrl", postsCtrl)

    postsCtrl.$inject = ['$scope', 'posts', 'post'];
    function postsCtrl($scope, posts, post){

    	$scope.post = post;

    	$scope.addComment = function() {
    		if($scope.body !== '') {
    			posts.addComment(post._id, {
    				body: $scope.body,
    				author: 'user'
    			}).success(function(comment) {
    				$scope.post.comments.push(comment);
    			});
    		}
    		$scope.body = '';
    	};

    	$scope.incrementUpvotes = function(comment)  {
    		posts.upvoteComment(post, comment);
    	};
	}
}());

// services/posts.js
(function () {
	angular.module("flapperNews").factory("posts", ['$http', function($http) {
	var o = {
		posts: []
	};

	o.getAll = function() {
		return $http.get('/posts').success(function(data) {
			angular.copy(data, o.posts);
		});
	};

	o.create = function(post) {
		return $http.post('/posts', post).success(function(data) {
			o.posts.push(data);
		});
	};

	o.upvote = function(post) {
		return $http.put('/posts/' + post._id + '/upvote')
			.success(function(data) {
				post.upvotes += 1;
			});
	};

	o.get = function(id) {
		return $http.get('/posts/' + id).then(function(res) {
			return res.data;
		});
	};

	o.addComment = function(id, comment) {
		return $http.post('/posts/' + id + '/comments', comment);
	};

	o.upvoteComment = function(post, comment) {
		return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote')
			.success(function(data) {
				comment.upvotes += 1;
			});
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
				controllerAs: 'main',
				resolve: {
					postPromise: ['posts', function(posts) {
						return posts.getAll();
					}]
				}
			})
			.state('posts', {
				url: '/posts/{id}',
				templateUrl: '/posts.html',
				controller: 'postsCtrl',
				contollerAs: 'postsCtrl',
				resolve: {
					post: ['$stateParams', 'posts', function($stateParams, posts) {
						return posts.get($stateParams.id);
					}]
				}
			});
    }
}());


