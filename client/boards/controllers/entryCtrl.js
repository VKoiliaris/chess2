angular.module('chess2').controller('entryCtrl', ['$scope', '$meteor',
	function($scope, $meteor){
		$scope.boards = $meteor.collection(Chessboards).subscribe('chessboards');
		$scope.users = $meteor.collection(Meteor.users, false).subscribe('users');
		$scope.pairsOfPlayers = [];


		$scope.challenge = function(userid, userMail){
			if (!userid){
				console.log("You need to login first!");
				return;
			}else{
				Meteor.call('delete', userid, false);
				$scope.boards.push({board: '', castlingStatus: '', white: userid, black: '', challenge: true, challenger: userMail});
			}
			return;
		};

		$scope.practice = function(userid){
			Meteor.call('delete', userid, true);
			$scope.boards.push({board: '', castlingStatus: '', first: true, white: userid, black: userid, practice: true});
			window.alert("Your practice game is created, go to boards and start your game!");
			return;
		};

		$scope.challenges = function(){
			return _.filter($scope.boards, function(board){ return board.challenge === true;});
		};

		$scope.acceptChallenge = function(userId2, challengeToAccept){
			$scope.userId1 = challengeToAccept.white;
			$scope.boards.pop(challengeToAccept);
			Meteor.call('delete', $scope.userId1, false);
			Meteor.call('delete', userId2, false);
			$scope.boards.push({board: '', castlingStatus: '', first: true, white: $scope.userId1, black: userId2, newGame: true});
			window.alert("Your game is created, go to boards and start your game!");
			return;
		};
}]);



