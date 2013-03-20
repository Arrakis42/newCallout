'use strict';

var module = angular.module('myApp', [
    'myApp.itemSearchCtrl',
    'myApp.cartCtrl'
]);

  module.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/itemSearch', {templateUrl: 'partials/itemSearch.html', controller: "itemSearchCtrl"});
    $routeProvider.when('/cart', {templateUrl: 'partials/cart.html', controller: "cartCtrl"});
    $routeProvider.otherwise({redirectTo: '/'});
  }]);
