angular.module('app', []).controller('main', function($scope) {
    var vm = $scope;

    vm.dates = [];

    vm.dates.push(new Date());
});