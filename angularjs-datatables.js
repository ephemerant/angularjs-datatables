angular.module('ngRows', [])
  .directive('ngRows', function ($compile) {
    return {
      restrict: 'A',
      scope: { ngRows: '<', ngSelected: '=' },
      controller: function ($scope) {
        var vm = $scope;

        vm.Math = Math;
        vm.Date = Date;

        vm.selected = vm.ngSelected;

        vm.pages = {
          current: 1,
          sizes: ['10', '25', '50', '100'],
          totalPages: function () {
            return Math.ceil(vm.filteredRows.length / vm.pages.size);
          },
          search: '',
          oldSearch: '',
          headers: {}
        };

        vm.pages.size = vm.pages.sizes[0];

        // Row selection
        vm.toggleSelect = function (row) {
          if (!vm.isSelected(row))
            vm.selected.add(row);
          else
            vm.selected.delete(row);
        };

        vm.isSelected = function (row) {
          return vm.selected.has(row);
        };

        vm.allSelected = function (rows) {
          var adds = 0;

          // See if anything isn't selected
          rows.forEach(function (row) {
            adds += !vm.selected.has(row);
          });

          return !adds;
        };

        vm.toggleSelectAll = function (rows) {
          var adds = 0;

          // Select all
          rows.forEach(function (row) {
            adds += !vm.selected.has(row);
            vm.selected.add(row);
          });

          // Deselect all
          if (!adds)
            vm.selected.clear();
        }

        // Sets the current page within the table and prevents any click side effects from occurring
        vm.setPage = function (page, $event) {
          if ($event) $event.preventDefault();

          // Keep page within range
          if (page > 0 && page <= vm.pages.totalPages())
            vm.pages.current = page;
        };

        // Generate the page navigation structure
        vm.generatePages = function (current, total) {
          // All pages
          if (total <= 7) {
            var result = [];
            for (var i = 1; i <= total; i++) result.push(i);
            return result;
          }
          // First pages
          else if (current <= 4)
            return [1, 2, 3, 4, 5, 0, total];  // 0 symbolizes an ellipsis
          // Last pages
          else if (total - current <= 3)
            return [1, 0, total - 4, total - 3, total - 2, total - 1, total];
          // Middle pages
          else
            return [1, 0, current - 1, current, current + 1, 0, total];
        };

        vm.getPageRows = function (rows) {
          // Return rows that are in the currently visible page
          var start = (vm.pages.current - 1) * vm.pages.size;
          var end = vm.pages.current * vm.pages.size;

          return rows.slice(start, end);
        };

        // Filter the rows based on the search query
        vm.filterRows = function (newSort) {
          if (vm.pages.search) {
            // Start with the filtered rows if the search is a subset of the previous search (e.g., we're typing)
            var rows = (!newSort && vm.pages.search.indexOf(vm.pages.oldSearch) !== -1) ? vm.filteredRows : vm.sortedRows;

            // Filter rows by the search query
            vm.filteredRows = rows.filter(function (row) {
              if (vm.pages.search) {
                var toSearch = Object.keys(row).map(function (key) {
                  var value = row[key];
                  return value && typeof value !== 'object' && value.toString().toLowerCase();
                });
                var match = true;

                // Scatter search for each word (every word must be found somewhere)
                vm.pages.search.toLowerCase().split(' ').forEach(function (search) {
                  // Do any of the row's parameters match the word?
                  match = match && toSearch.some(function (x) { return x && x.indexOf(search) !== -1 });
                });

                return match;
              } else
                return true;
            });
          } else {
            vm.filteredRows = vm.sortedRows;
          }

          vm.pages.oldSearch = vm.pages.search;
          vm.pages.current = 1;
        };

        // Specify the column sorting properties
        vm.sortCol = function (i) {
          var col = vm.pages.headers[i];

          if (!col.order)
            col.order = 1;
          else if (col.order === 1)
            col.order = -1;
          else
            col.order = 0;

          vm.pages.sorting = col.order ? col : null;

          // Reset other columns
          Object.keys(vm.pages.headers).forEach(function (key) {
            var header = vm.pages.headers[key];

            if (header !== col)
              header.order = 0;
          });

          // Sort the actual rows
          sortRows();
        };

        // Sort the rows based off of the selected column header's sort order
        function sortRows() {
          var col = vm.pages.sorting;

          if (col && col.order) {
            vm.sortedRows = vm.ngRows.slice().sort(function (a, b) {
              // Date sorting
              if (a[col.key] instanceof Date && b[col.key] instanceof Date)
                return col.order * (a[col.key].getTime() - b[col.key].getTime());

              // Other sorting
              if (col.order === 1) // Ascending
                if (a[col.key] > b[col.key])
                  return 1;
                else if (a[col.key] < b[col.key])
                  return -1;
                else
                  return 0;
              else // Descending
                if (a[col.key] < b[col.key])
                  return 1;
                else if (a[col.key] > b[col.key])
                  return -1;
                else
                  return 0;
            });
          }
          else
            vm.sortedRows = vm.ngRows;

          vm.filterRows(true);
        }

        // e.g. 1000 -> 1,000
        vm.commaString = function (n) {
          return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        };

        // Watchers
        vm.$watch('ngRows', function () {
          sortRows();
        });

        // Access ancestor scope functions
        var ancestor = vm.$parent;
        
        while (ancestor) {
          Object.keys(ancestor).forEach(function (key) {
            if (vm[key] === undefined && key.indexOf('$') === -1) { // Don't overwrite or import special Angular properties              
              var $ancestor = ancestor;
              
              Object.defineProperty(vm, key, {
                get: function() { return $ancestor[key] }
              });
            }
          });
          
          ancestor = ancestor.$parent;
        }
      },
      compile: function (row) {
        var $ = angular.element;

        // Use a non-jQlite implemention of find() in order to search for tags and classes
        function find(_this, query) {
          if (!query) return $();

          var ret = [];

          angular.forEach(_this, function (el) {
            if (el.querySelectorAll) {
              angular.forEach(el.querySelectorAll(query), function (item) {
                ret.push(item);
              });
            }
          });

          return $(ret);
        }

        // Inserts an item before an element
        function insertBefore(_this, element) {
          if (!element) return $();

          angular.forEach(_this, function (el) {
            element.parent()[0].insertBefore(el, element[0]); // Use native method
          });

          return _this;
        };

        // Add all of the datatable goodies to the table
        return function (vm, parent) {
          // Grab and clear the table's HTML to re-inject later
          var $contents = $(parent.html());
          parent.html('');

          // Repeat rows
          var $headerRow = find($contents, 'thead tr');
          var $dataRow = find($contents, 'tr[ng-row]');
          $dataRow.attr('ng-repeat', 'row in getPageRows(filteredRows) track by $index');

          // Sortable columns
          var $headerCols = find($headerRow, 'th');
          var $dataCols = find($dataRow, 'td');

          angular.forEach($headerCols, function (el, i) {
            var $th = $(el);
            var sortable = $th.attr('ng-sortable') !== undefined;

            if (sortable) {
              var $td = $($dataCols[i]);
              // Determine if a data key is being used
              if ($td.attr('ng-data')) // If no match, see if we're using ng-data
                match = /row\.(.*?)(?:\s.*?)?$/.exec($td.attr('ng-data'));
              else
                match = /{{row\.(.*?)(?:\s.*?)?}}/.exec($td.text());

              if (!match && $td.attr('ng-bind-html')) // If no match, see if we're using ng-bind-html
                match = /row\.(.*?)(?:\s.*?)?$/.exec($td.attr('ng-bind-html'));

              if (match) {
                var key = match[1];
                $th.attr('ng-class', '{ sorting: pages.headers[' + i + '].order === 0, ' +
                  'sorting_asc: pages.headers[' + i + '].order === 1, ' +
                  'sorting_desc: pages.headers[' + i + '].order === -1 }');
                $th.attr('ng-click', 'sortCol(' + i + ')');
                vm.pages.headers[i] = { order: 0, key: key };
              }
            }
          });

          // Do we want the row to be selectable?
          if (parent.attr('ng-selected') !== undefined) {
            $dataRow
              .prepend('<td ng-selectable ng-click="toggleSelect(row)""></td>')
              .attr('ng-selectable', null)
              .attr('ng-class', '{ selected: isSelected(row) }');
            $headerRow.prepend('<td ng-selectable ng-click="toggleSelectAll(filteredRows)" ng-class="{ selected: filteredRows.length && allSelected(filteredRows) }"></td>');
          }

          $compile($contents)(vm);
          parent.append($contents);

          // Add top and bottom controls (pagination, search, etc.)
          var dropdown =
            '<select class="form-control form-control-sm" ng-model="pages.size" ng-change="setPage(1)">' +
            '<option ng-repeat="size in pages.sizes">{{size}}</option>' +
            '</select>';
          var search =
            '<input type="search" class="form-control form-control-sm" ng-model="pages.search" ng-change="filterRows()">';
          var topControls =
            '<div class="row"><div class="col-sm-12 col-md-6"><div class="dataTables_length"><label>Show ' +
            dropdown +
            ' entries</label></div></div><div class="col-sm-12 col-md-6"><div class="dataTables_filter"><label>Search:' +
            search + '</label></div></div></div>';

          var pageInfo =
            'Showing {{commaString(Math.min(filteredRows.length, (pages.current - 1) * +pages.size + 1))}} to ' +
            '{{commaString(Math.min(pages.current * +pages.size, filteredRows.length))}} of {{commaString(filteredRows.length)}} entries';
          var pagination =
            '<li class="paginate_button page-item previous"><a href="#" tabindex="0" class="page-link" ng-click="setPage(pages.current - 1, $event)">Previous</a></li>' +
            '<li class="paginate_button page-item" ng-class="{ active: page === pages.current }" ng-repeat="page in generatePages(pages.current, pages.totalPages()) track by $index">' +
            '<a href="#" tabindex="0" class="page-link" ng-click="setPage(page, $event)">{{(page && commaString(page)) || "&#8230;"}}</a>' +
            '</li>' +
            '<li class="paginate_button page-item next"><a href="#" tabindex="0" class="page-link" ng-click="setPage(pages.current + 1, $event)">Next</a></li>';
          var bottomControls =
            '<div class="row"><div class="col-sm-12 col-md-5"><div class="dataTables_info">' +
            pageInfo +
            '</div></div>' +
            '<div class="col-sm-12 col-md-7"><div class="dataTables_paginate paging_simple_numbers"><ul class="pagination" >' +
            pagination +
            '</ul></div></div></div></div>';

          // Wrap everything together
          var $wrapper = $(
            '<div class="dataTables_wrapper container-fluid">' +
            topControls +
            '<div class="row"><div class="col-sm-12 inject-table"></div></div>' +
            bottomControls +
            '</div>');
          $compile($wrapper)(vm);
          insertBefore($wrapper, parent);
          find($wrapper, '.inject-table').append(parent).removeClass('inject-table');
        };
      }
    };
  });