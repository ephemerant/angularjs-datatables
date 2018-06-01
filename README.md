# AngularJS Datatables
A simple, lightweight wrapper for interacting with data via AngularJS as a datatable.

* [Full demo](https://ephemerant.github.io/angularjs-datatables/)
* [Simple demo](https://ephemerant.github.io/angularjs-datatables/index.simple.html)

## Features
* **Virtual pagination**, allowing for rows to only be rendered as they are needed. This allows for tables of even 100,000 rows ([see the demo](https://ephemerant.github.io/angularjs-datatables/)) to be quick to load.
* **Search by data value**, rather than row value, allowing for more in-depth searches while also only showing relevant values in a row.
* **Sorting**, with built-in support for dates, currency, etc.
* **Selectable** rows
* Easy-to-implement **custom filters**, such as being able to filter rows based on a date range for a certain column.

## Overview
Given an array of data objects in your controller's scope (called "names" in this example), you can render the data as a table by doing the following:
* Add **ng-rows="names"** to the **\<table/\>**.
* Add **ng-row** to a **\<tr/\>** template that you want to use to render each data object.
* Specify the object values to display in the **\<td/\>** tags of the template.
* If you would like to sort any column, add **ng-sortable** to the desired **\<th/\>** tags of your **\<thead/\>**.

Optionally, you can make rows selectable by doing the following:
* Create an empty Set in your controllers's scope (called "selectable" in this example).
* Add **ng-selectable="selectable"** to the **\<table/\>**.

### Simple example
```html
<table class="table table-striped table-bordered dataTable" ng-rows="names">
    <thead>
        <tr>
            <th>ID</th>
            <th ng-sortable>First Name</th>
            <th ng-sortable>Last Name</th>
        </tr>
    </thead>
    <tbody>
        <tr ng-row>
            <td>{{row.id}}</td>
            <td>{{row.firstName}}</td>
            <td>{{row.lastName}}</td>
        </tr>
    </tbody>
</table>
```

```javascript
var app = angular.module('app', ['ngRows']);

app.controller('main', function($scope) {
  var vm = $scope;

  // Generate random name data for testing
  var firstNames = ['Alan', 'Alice', 'Amber', 'Amanda', 'Barney', 'Bobby', 'Bethany', 'Casey', 'Clayton', 'Cody', 'Dillon', 'Dianne', 'Edward', 'Ethan', 'Eleanor', 'Frank', 'Francene', 'Gary', 'George', 'Georgia', 'Helen', 'Harry', 'Isaac', 'Julia', 'Justin', 'Keith', 'Kathleen', 'Larry', 'Martin', 'Mary', 'Mark', 'Megan', 'Nathan', 'Oliver', 'Philip', 'Ray', 'Rebecca', 'Steve', 'Sara', 'Tina', 'Terry', 'Vince', 'Walter', 'Zeke'];
  var lastNames = ['Adams', 'Brown', 'Blevins', 'Clayton', 'Dixon', 'Edwards', 'Fitzgerald', 'Gray', 'Greene', 'Harris', 'Ibanez', 'Jensen', 'Jefferson', 'Johnson', 'Kennedy', 'Lewis', 'Lincoln', 'Martin', 'McGuire', 'Motz', 'Meyer', 'Newton', 'Penn', 'Richards', 'Russell', 'Smith', 'Stevens', 'Sweet', 'Turner', 'Thompson', 'Vick', 'Waters', 'White', 'Woods'];

  // Array of names to display in the table
  vm.names = [];

  for (var i = 1; i <= 100000; i++)
    vm.names.push({
      id: i,
      firstName: firstNames.randomElement(),
      lastName: lastNames.randomElement()
    });
});

Array.prototype.randomElement = function() {
  return this[Math.floor(Math.random() * this.length)];
};
```
