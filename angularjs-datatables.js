angular.module('ngRows', [])
    .directive('ngRows', function($compile) {
      return {
        restrict: 'A',
        scope: {ngRows: '<'},
        controller: function($scope) {
          var vm = $scope;

          vm.Math = Math;

          vm.pages = {
            current: 1,
            sizes: ['10', '25', '50', '100'],
            totalPages: function() {
              return Math.ceil(vm.filteredRows.length / vm.pages.size);
            },
            search: '',
            oldSearch: ''
          };

          vm.pages.size = vm.pages.sizes[0];

          vm.setPage = function(page) {
            if (page > 0 && page <= vm.pages.totalPages())
              vm.pages.current = page;
          };

          // Generate the page navigation structure
          vm.generatePages = function(current, total) {
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

          vm.getPageRows = function(rows) {
            // Return rows that are in the currently visible page
            var start = (vm.pages.current - 1) * vm.pages.size;
            var end = vm.pages.current * vm.pages.size;

            return rows.slice(start, end);
          };

          vm.filterRows = function() {
            if (vm.pages.search) {
              // Start with the filtered rows if the search is a subset of the previous search (e.g., we're typing)
              var rows = vm.pages.search.indexOf(vm.pages.oldSearch) !== -1 ? vm.filteredRows : vm.ngRows;

              // Filter rows by the search query
              vm.filteredRows = rows.filter(function(row) {
                if (vm.pages.search) {
                  var toSearch = Object.values(row).map(function(x) {
                    return x && x.toString().toLowerCase();
                  });
                  var match = true;

                  // Scatter search for each word (every word must be found somewhere)
                  vm.pages.search.toLowerCase().split(' ').forEach(function(search) {
                    // Do any of the row's parameters match the word?
                    match = match && toSearch.some(function(x) { return x && x.indexOf(search) !== -1 });
                  });

                  return match;
                } else
                  return true;
              });                          
            } else {
              vm.filteredRows = vm.ngRows;
            }

            vm.pages.oldSearch = vm.pages.search;
            vm.pages.current = 1;
          };

          // e.g. 1000 -> 1,000
          vm.toCommaString = function(n) {
            return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          };

          // Watchers
          vm.$watch('ngRows', function() {
            vm.filteredRows = vm.ngRows;
            vm.filterRows();
          });
        },
        compile: function(row) {
          var html = row.html();
          row.html('');

          // Use a non-jQlite implemention of find() in order to search for tags and classes
          function find(_this, query) {
            if (!query) return angular.element();
          
            var ret = [];
          
            angular.forEach(_this, function(el) {
                if (el.querySelectorAll)
                  el.querySelectorAll(query).forEach(function(item) {
                    ret.push(item);
                  });
            });
          
            return angular.element(ret);
          }
          
          // Inserts an item before an element
          function insertBefore(_this, element) {
            if (!element) return angular.element();
          
            angular.forEach(_this, function(el) {
              element.parent()[0].insertBefore(el, element[0]); // Use native method
            });
          
            return _this;
          };

          return function(vm, parent) {
            var $contents = angular.element(html);

            // Repeat rows
            var $row = find($contents, 'tr[ng-row]');

            $row.attr('ng-repeat', 'row in getPageRows(filteredRows) track by $index');

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
                'Showing {{Math.min(filteredRows.length, (pages.current - 1) * +pages.size + 1)}} to {{Math.min(pages.current * +pages.size, filteredRows.length)}} of {{toCommaString(filteredRows.length)}} entries';
            var pagination =
                '<li class="paginate_button page-item previous"><a href="#" tabindex="0" class="page-link" ng-click="setPage(pages.current - 1)">Previous</a></li>' +
                '<li class="paginate_button page-item" ng-class="{ active: page === pages.current }" ng-repeat="page in generatePages(pages.current, pages.totalPages()) track by $index">' + 
                  '<a href="#" tabindex="0" class="page-link" ng-click="setPage(page)">{{page || "&#8230;"}}</a>' +
                '</li>' +
                '<li class="paginate_button page-item next"><a href="#" tabindex="0" class="page-link" ng-click="setPage(pages.current + 1)">Next</a></li>';
            var bottomControls =
                '<div class="row"><div class="col-sm-12 col-md-5"><div class="dataTables_info">' +
                  pageInfo +
                '</div></div>' +
                '<div class="col-sm-12 col-md-7"><div class="dataTables_paginate paging_simple_numbers"><ul class="pagination" >' +
                  pagination +
                '</ul></div></div></div></div>';

            // Wrap everything together
            var $wrapper = angular.element(
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