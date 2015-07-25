angular.module('chess2').config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
  function($urlRouterProvider, $stateProvider, $locationProvider){

    $locationProvider.html5Mode(true);

    $stateProvider
      .state('chessboard', {
        url: '/chessboard',
        templateUrl: 'client/boards/views/chessboard.ng.html',
        controller: 'ChessboardCtrl'
      });

      $urlRouterProvider.otherwise('/chessboard');
}]);