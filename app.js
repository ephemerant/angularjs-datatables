var app = angular.module('app', ['ngRows']);

// Config
app.config(['$compileProvider', function ($compileProvider) {
  $compileProvider.debugInfoEnabled(false);
}]);

// Controller
app.controller('main', function($scope) {
  var vm = $scope;

  // Generate random name data for testing
  var firstNames = ['Alan', 'Alice', 'Amber', 'Amanda', 'Barney', 'Bobby', 'Bethany', 'Casey', 'Clayton', 'Cody', 'Dillon', 'Dianne', 'Edward', 'Ethan', 'Eleanor', 'Frank', 'Francene', 'Gary', 'George', 'Georgia', 'Helen', 'Harry', 'Isaac', 'Julia', 'Justin', 'Keith', 'Kathleen', 'Larry', 'Martin', 'Mary', 'Mark', 'Megan', 'Nathan', 'Oliver', 'Philip', 'Ray', 'Rebecca', 'Steve', 'Sara', 'Tina', 'Terry', 'Vince', 'Walter', 'Zeke'];
  var lastNames = ['Adams', 'Brown', 'Blevins', 'Clayton', 'Dixon', 'Edwards', 'Fitzgerald', 'Gray', 'Greene', 'Harris', 'Ibanez', 'Jensen', 'Jefferson', 'Johnson', 'Kennedy', 'Lewis', 'Lincoln', 'Martin', 'McGuire', 'Motz', 'Meyer', 'Newton', 'Penn', 'Richards', 'Russell', 'Smith', 'Stevens', 'Sweet', 'Turner', 'Thompson', 'Vick', 'Waters', 'White', 'Woods'];
  vm.countries = ['United States', 'Canada', 'Mexico'];

  vm.names = [];

  for (var i = 1; i <= 100000; i++) {
    var d = new Date('1/1/1970');
    d.setDate(d.getDate() + Math.floor(Math.random()*15000));
    vm.names.push({
      id: i,
      firstName: firstNames.randomElement(),
      lastName: lastNames.randomElement(),
      birthday: d,
      country: vm.countries.randomElement(),
      netWorth: Math.floor(Math.random() * 10000000) / 100 - 10000
    });
  }

  // (Optional) Create a selection Set for rows that can be processed by both this app and ngRows
  vm.selected = new Set(); 

  // (Optional) Create custom filter methods
  vm.filters = {
    startDate: new Date('1/11/1970'), // date range to filter birthdays by
    endDate: new Date('1/11/2011'),
    country: undefined
  };

  vm.$watch('filters', function() {
    vm.filteredNames = vm.names;

    if (vm.filters.startDate)
      vm.filteredNames = vm.filteredNames.filter(function(x) { return x.birthday >= vm.filters.startDate });

    if (vm.filters.endDate)
      vm.filteredNames = vm.filteredNames.filter(function(x) { return x.birthday <= vm.filters.endDate });

    if (vm.filters.country)
      vm.filteredNames = vm.filteredNames.filter(function(x) { return x.country === vm.filters.country });
  }, true);
});

Array.prototype.randomElement = function() {
  return this[Math.floor(Math.random() * this.length)];
};

// (Optional) Format currency
Number.prototype.formatCurrency = function() {
  return '$' + this;
}