// /app.js
(function () {
	angular.module('flapperNews', ['ui.router']);
}());

// controllers/main.js
(function () {
    angular.module("flapperNews").controller("main", main)

    main.$inject = ['$scope', 'posts', 'auth'];
    function main($scope, posts, auth){
    	$scope.isLoggedIn = auth.isLoggedIn;
		$scope.posts = posts.posts;

		$scope.addPost = function() {
			if($scope.title && $scope.title !== '') {
				posts.create({
					title: $scope.title,
					link: $scope.link,
					author: auth.currentUser
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

    postsCtrl.$inject = ['$scope', 'posts', 'post', 'auth'];
    function postsCtrl($scope, posts, post, auth){
    	$scope.isLoggedIn = auth.isLoggedIn;
    	$scope.post = post;

    	$scope.addComment = function() {
    		if($scope.body !== '') {
    			posts.addComment(post._id, {
    				body: $scope.body,
    				author: auth.currentUser
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

// controllers/authCtrl.js
(function () {
    angular.module("flapperNews").controller("authCtrl", authCtrl)

    authCtrl.$inject = ['$scope', '$state', 'auth'];
    function authCtrl($scope, $state, auth){
    	$scope.user = {};

    	$scope.register = function() {
    		auth.register($scope.user).error(function(error) {
    			$scope.error = error;
    		}).then(function() {
    			$state.go('main');
    		});
    	};

    	$scope.login = function() {
    		auth.logIn($scope.user).error(function(error) {
    			$scope.error = error;
    		}).then(function() {
    			$state.go('main');
    		});
    	};
	}
}());

// controllers/navCtrl.js
(function () {
    angular.module("flapperNews").controller("navCtrl", navCtrl)

    navCtrl.$inject = ['$scope', 'auth'];
    function navCtrl($scope, auth){
    	$scope.isLoggedIn = auth.isLoggedIn;
    	$scope.currentUser = auth.currentUser;
    	$scope.logOut = auth.logOut;
	}
}());

// services/posts.js
(function () {
	angular.module("flapperNews").factory("posts", ['$http', 'auth', function($http, auth) {
		var o = {
			posts: []
		};

		o.getAll = function() {
			return $http.get('/posts').success(function(data) {
				angular.copy(data, o.posts);
			});
		};

		o.create = function(post) {
			return $http.post('/posts', post, {
				headers: {Authorization: 'Bearer ' +auth.getToken()}
			}).success(function(data) {
				o.posts.push(data);
			});
		};

		o.upvote = function(post) {
			return $http.put('/posts/' + post._id + '/upvote', null, {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).success(function(data) {
				post.upvotes += 1;
			});
		};

		o.get = function(id) {
			return $http.get('/posts/' + id).then(function(res) {
				return res.data;
			});
		};

		o.addComment = function(id, comment) {
			return $http.post('/posts/' + id + '/comments', comment, {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			});
		};

		o.upvoteComment = function(post, comment) {
			return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote', null, {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).success(function(data) {
				comment.upvotes += 1;
			});
		};
		
		return o;
	}])
}());

// services/auth.js
(function () {
	angular.module("flapperNews").factory("auth", ['$http', '$window', function($http, $window) {
		var auth = {};

		auth.saveToken = function(token) {
			$window.localStorage['flapper-news-token'] = token;
		};

		auth.getToken = function() {
			return $window.localStorage['flapper-news-token'];
		}

		auth.isLoggedIn = function() {
			var token = auth.getToken();

			if(token) {
				var payload = JSON.parse($window.atob(token.split('.')[1]));

				return payload.exp > Date.now() / 1000;
			} else {
				return false;
			}
		};

		auth.currentUser = function() {
			if(auth.isLoggedIn()) {
				var token = auth.getToken();
				var payload = JSON.parse($window.atob(token.split('.')[1]));
			
				return payload.username;
			}
		};

		auth.register = function(user) {
			return $http.post('/register', user).success(function(data) {
				auth.saveToken(data.token);
			});
		};

		auth.logIn = function(user) {
			return $http.post('/login', user).success(function(data) {
				auth.saveToken(data.token);
			});
		};

		auth.logOut = function() {
			$window.localStorage.removeItem('flapper-news-token');
		};

		return auth;
	}])
}());

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
			})
			.state('login', {
				url: '/login',
				templateUrl: '/login.html',
				controller: 'authCtrl',
				onEnter: ['$state', 'auth', function($state, auth) {
					if(auth.isLoggedIn()) {
						$state.go('main');
					}
				}]
			})
			.state('register', {
				url: '/register',
				templateUrl: '/register.html',
				controller: 'authCtrl',
				onEnter: ['$state', 'auth', function($state, auth) {
					if(auth.isLoggedIn()) {
						$state.go('main');
					}
				}]
			});
    }
}());


