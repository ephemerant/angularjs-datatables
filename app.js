var app = angular.module('app', ['ngRows']);

// Config
app.config(['$compileProvider', function ($compileProvider) {
  $compileProvider.debugInfoEnabled(false);
}]);

// Controller
app.controller('main', function ($scope) {
  var vm = $scope;

  // Generate random name data for testing
  var firstNames = ['Alan', 'Alice', 'Amber', 'Amanda', 'Barney', 'Bobby', 'Bethany', 'Casey', 'Clayton', 'Cody', 'Dillon', 'Dianne', 'Edward', 'Ethan', 'Eleanor', 'Frank', 'Francene', 'Gary', 'George', 'Georgia', 'Helen', 'Harry', 'Isaac', 'Julia', 'Justin', 'Keith', 'Kathleen', 'Larry', 'Martin', 'Mary', 'Mark', 'Megan', 'Nathan', 'Oliver', 'Philip', 'Ray', 'Rebecca', 'Steve', 'Sara', 'Tina', 'Terry', 'Vince', 'Walter', 'Zeke'];
  var lastNames = ['Adams', 'Brown', 'Blevins', 'Clayton', 'Dixon', 'Edwards', 'Fitzgerald', 'Gray', 'Greene', 'Harris', 'Ibanez', 'Jensen', 'Jefferson', 'Johnson', 'Kennedy', 'Lewis', 'Lincoln', 'Martin', 'McGuire', 'Motz', 'Meyer', 'Newton', 'Penn', 'Richards', 'Russell', 'Smith', 'Stevens', 'Sweet', 'Turner', 'Thompson', 'Vick', 'Waters', 'White', 'Woods'];
  vm.countries = ['United States', 'Canada', 'Mexico'];

  // Array of row objects to display in the table
  vm.names = [];

  for (var i = 1; i <= 100000; i++) {
    var d = new Date('1/1/1970');
    d.setDate(d.getDate() + Math.floor(Math.random() * 15000));
    vm.names.push({
      id: i,
      firstName: firstNames.randomElement(),
      lastName: lastNames.randomElement(),
      birthday: d,
      country: vm.countries.randomElement(),
      netWorth: Math.floor(Math.random() * 10000000) / 100 - 10000,
      marked: false
    });
  }

  // ------------------------------------
  // NOTE: Everything below is optional
  // ------------------------------------

  // Create a selection Set for rows that can be processed by both this app and ngRows
  vm.selected = new Set();

  // Manipulate a single row
  vm.mark = function (row) {
    row.marked = !row.marked;
    vm.selected.clear();
    customerFilter(); // Refilter in case we're sorting/filtering by marked
  }

  // Manipulate selection set
  vm.markSelected = function () {
    vm.selected.forEach(function (x) { x.marked = true; })
    vm.selected.clear();
    customerFilter(); // Refilter in case we're sorting/filtering by marked
  };

  vm.deleteSelected = function () {
    vm.names = vm.names.filter(function (x) {
      return !vm.selected.has(x);
    });
    vm.selected.clear();
  };

  // Create custom filter methods
  vm.filters = {
    startDate: new Date('1/11/1970'), // date range to filter birthdays by
    endDate: new Date('1/11/2011'),
    country: undefined,
    marked: undefined
  };

  vm.$watch('[names.length, filters]', customerFilter, true);

  function customerFilter() {
    vm.filteredNames = vm.names;

    if (vm.filters.startDate)
      vm.filteredNames = vm.filteredNames.filter(function (x) { return x.birthday >= vm.filters.startDate });

    if (vm.filters.endDate)
      vm.filteredNames = vm.filteredNames.filter(function (x) { return x.birthday <= vm.filters.endDate });

    if (vm.filters.country)
      vm.filteredNames = vm.filteredNames.filter(function (x) { return x.country === vm.filters.country });

    if (vm.filters.marked)
      vm.filteredNames = vm.filteredNames.filter(function (x) { return x.marked === ('Marked' == vm.filters.marked) });
  }
});

app.filter('checkmark', function ($sce) {
  return function (input) {
    if (input)
      return $sce.trustAsHtml('<i class="fas fa-check" style="color: #0b0;"></i>');
  };
});

// puts parentheses around negative amounts of currency
app.filter('customCurrency', function ($filter) {
  return function (amount) {
    var currency = $filter('currency');

    if (amount && amount.toString().charAt(0) === '-') {
      return currency(amount.toString())
        .replace('-', '(')
        .concat(')');
    }

    return currency(amount);
  };
});

// Return a random element from an array
Array.prototype.randomElement = function () {
  return this[Math.floor(Math.random() * this.length)];
};