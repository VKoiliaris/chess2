

angular.module('chess2').run(['$rootScope', '$state', function($rootScope, $state) {
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    // We can catch the error thrown when the $requireUser promise is rejected
    // and redirect the user back to the main page
    if (error === "AUTH_REQUIRED") {
      $state.go('entry');
    }
  });
}]);


angular.module('chess2').config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
  function($urlRouterProvider, $stateProvider, $locationProvider){

    $locationProvider.html5Mode(true);

    $stateProvider
    	.state('chessboard', {
        	url: '/chessboard',
        	templateUrl: 'client/boards/views/chessboard.ng.html',
        	controller: 'ChessboardCtrl',
        	resolve: {
    			"currentUser": ["$meteor", function($meteor){
      				return $meteor.requireUser();
    			}]
  			}
    	})
    	.state('entry', {
        	url: '/entry',
        	templateUrl: 'client/boards/views/entry.ng.html',
        	controller: 'entryCtrl'
    	});

      $urlRouterProvider.otherwise('/entry');
}]);

/*

],
				'subscribe': [
        		'$meteor', function($meteor) {
         			return $meteor.subscribe('chessboards');
        		}]

        		*/