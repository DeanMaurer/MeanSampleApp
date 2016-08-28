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