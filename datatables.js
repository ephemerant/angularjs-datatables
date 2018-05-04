angular.module('ngRows', [])
    .directive('ngRows', function($compile) {
      return {
        restrict: 'A',
        scope: {ngRows: '='},
        controller: function($scope) {
          var vm = $scope;

          vm.Math = Math;

          vm.pageSizes = [10, 25, 50, 100];

          vm.pages = {
            current: 1,
            size: vm.pageSizes[0].toString(),
            totalPages: function() {
              return Math.ceil(vm.filteredRows.length / vm.pages.size);
            },
            search: ''
          };

          vm.setPage = function(page) {
            if (page > 0 && page <= vm.pages.totalPages())
              vm.pages.current = page;
          };

          vm.generatePages = function(current, total) {
            // 0 symbolizes an ellipsis
            if (total <= 7) {
              var result = [];
              for (var i = 1; i <= total; i++) result.push(i);
              return result;
            } else if (current <= 4)
              return [1, 2, 3, 4, 5, 0, total];
            else if (total - current <= 3)
              return [1, 0, total - 4, total - 3, total - 2, total - 1, total];
            else
              return [1, 0, current - 1, current, current + 1, 0, total];
          };

          vm.visible = function(row, $index) {
            // Is the row in the current page?
            var inPage = $index >= (vm.pages.current - 1) * vm.pages.size &&
                         $index < vm.pages.current * vm.pages.size;

            return inPage;
          };

          vm.filterRows =
              function() {
            // Filter customers
            vm.filteredRows = vm.ngRows.filter(function(row) {
              if (vm.pages.search) {
                var toSearch = Object.values(row).map(function(x) {
                  return x && x.toString().toLowerCase();
                });
                var match = true;

                // Scatter search for each word (every word must be found
                // somewhere)
                vm.pages.search.toLowerCase().split(' ').forEach(function(
                    search) {
                  // Do any of the row's parameters match the search query?
                  match = match &&
                          toSearch.filter(function(x) {
                                    return x && x.indexOf(search) > -1
                                  })
                              .length;
                });

                return match;
              } else
                return true;
            });
          }

              vm.toCommaString =
                  function(n) {
            return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          }

                  // Watchers
                  vm.$watch('[ngRows, pages.search]',
                            function() { vm.filterRows(); }, true);

          vm.$watch('[pages.search, pages.size]',
                    function() { vm.pages.current = 1; }, true);
        },
        compile: function(row) {
          var html = row.html();
          row.html('');

          return function(vm, parent) {
            var $contents = angular.element(html);

            // Repeat rows
            var $row = $contents.find('tr[ng-row]');
            $row.attr('ng-repeat', 'row in filteredRows track by $index');
            $row.attr('ng-if', 'visible(row, $index)');
            $compile($contents)(vm);
            parent.append($contents);

            // Add top and bottom controls (pagination, search, etc.)
            var dropdown =
                '<select class="form-control form-control-sm" ng-model="pages.size"><option ng-repeat="size in pageSizes">{{size}}</option></select>';
            var search =
                '<input type="search" class="form-control form-control-sm" ng-model="pages.search">';
            var topControls =
                '<div class="row"><div class="col-sm-12 col-md-6"><div class="dataTables_length"><label>Show ' +
                dropdown +
                ' entries</label></div></div><div class="col-sm-12 col-md-6"><div class="dataTables_filter"><label>Search:' +
                search + '</label></div></div></div>';

            var pageInfo =
                'Showing {{Math.min(filteredRows.length, (pages.current - 1) * +pages.size + 1)}} to {{Math.min(pages.current * +pages.size, filteredRows.length)}} of {{toCommaString(filteredRows.length)}} entries';
            var pagination =
                '<li class="paginate_button page-item previous"><a href="#" tabindex="0" class="page-link" ng-click="setPage(pages.current - 1)">Previous</a></li><li class="paginate_button page-item" ng-class="{ active: page == $parent.pages.current }" ng-repeat="page in generatePages(pages.current, pages.totalPages()) track by $index"><a href="#" tabindex="0" class="page-link" ng-click="setPage(page)">{{page || "&#8230;"}}</a></li><li class="paginate_button page-item next"><a href="#" tabindex="0" class="page-link" ng-click="setPage(pages.current + 1)">Next</a></li>';
            var bottomControls =
                '<div class="row"><div class="col-sm-12 col-md-5"><div class="dataTables_info">' +
                pageInfo +
                '</div></div><div class="col-sm-12 col-md-7"><div class="dataTables_paginate paging_simple_numbers"><ul class="pagination" >' +
                pagination + '</ul></div></div></div></div>';

            var $wrapper = angular.element(
                '<div class="dataTables_wrapper container-fluid">' +
                topControls +
                '<div class="row"><div class="col-sm-12"></div></div>' +
                bottomControls + '</div>');
            $compile($wrapper)(vm);
            $wrapper.insertBefore(parent);
            $wrapper.find('.row:nth-of-type(2) > div').append(parent);
          };
        }
      };
    });