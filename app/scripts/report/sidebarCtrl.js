define(function() {
    return function sidebarCtrl(apiHelper, $scope, $rootScope, $modal) {
        var _state = $rootScope.state;

        $scope.switchTypeVal = function(type, val) {
            _state[type] = val;
        };

        $scope.openEditModal = function(type, data) {
            // edit for group, category, report
            var newScope = $scope.$new(true);
            $scope._data = data;

            $modal.open({
                templateUrl: 'templates/report/modal.html',
                controller: type + 'ModalCtrl',
                scope: $scope,
                size: 'lg'
            });
        };

        $scope.delReport = function(item) {
            if (!window.confirm(Config.delAlertPrefix + 'report ' + item.name)) return;
            apiHelper('delCategoryReportRelation', {
                params: {
                    categoryId: _state.category.id,
                    reportId: item.id
                }
            }).then(function(data) {
                // remove from list
                $scope.reportList = _.without($scope.reportList, item);
            });
        };
    };
});