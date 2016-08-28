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