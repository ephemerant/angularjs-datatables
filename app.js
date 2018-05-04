var app = angular.module('app', ['ngRows']);

// Controller
app.controller('main', function($scope) {
  var vm = $scope;

  var firstNames = [
    'Alan',
    'Alice',
    'Amber',
    'Barney',
    'Bethany',
    'Casey',
    'Cody',
    'Dillon',
    'Dianne',
    'Edward',
    'Eleanor',
    'Frank',
    'Francene',
    'Gary',
    'George',
    'Georgia',
    'Helen',
    'Harry',
    'Isaac',
    'Julia',
    'Justin',
    'Keith',
    'Kathleen',
    'Larry',
    'Martin',
    'Nathan',
    'Oliver',
    'Philip',
    'Ray',
    'Steve',
    'Sara',
    'Tina',
    'Terry',
    'Vince',
    'Walter',
    'Zeke'
  ];
  var lastNames = [
    'Adams',
    'Brown',
    'Blevins',
    'Clayton',
    'Dixon',
    'Edwards',
    'Fitzgerald',
    'Gray',
    'Harris',
    'Ibanez',
    'Jefferson',
    'Kennedy',
    'Lewis',
    'McGuire',
    'Newton',
    'Penn',
    'Richards',
    'Russell',
    'Smith',
    'Stevens',
    'Sweet',
    'Turner',
    'Vick',
    'Waters',
    'White'
  ];

  vm.names = [];

  for (var i = 1; i <= 100; i++)
    vm.names.push({
      id: i,
      firstName: firstNames.randomElement(),
      lastName: lastNames.randomElement()
    });
});

Array.prototype.randomElement = function() {
  return this[Math.floor(Math.random() * this.length)];
};