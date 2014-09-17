define(function() {
    return function reportCtrl($scope, $modal, apiHelper, $state, $rootScope) {
        $rootScope.state = {};
        var _state = $rootScope.state;

        apiHelper('getGroupList', {
            busy: 'global'
        }).then(function(data) {
            _state.groupList = data;
            if ($state.params.group) {
                _state.group = _.find(data, function(i) {
                    return i.name === $state.params.group;
                });
            } else {
                _state.group = data[0];
            }
        });

        $scope.$watch('state.group', function(group) {
            if (!group) return;
            apiHelper('getCategoryList', {
                busy: 'global',
                params: {
                    groupId: group.id
                }
            }).then(function(data) {
                _state.categoryList = data;
                if ($state.params.category) {
                    _state.category = _.find(data, function(i) {
                        return i.name === $state.params.category;
                    });
                } else {
                    _state.category = data[0];
                }
            });
        }, true);

        $scope.$watch('state.category', function(category) {
            if (!category) return;
            apiHelper('getReportList', {
                busy: 'global',
                params: {
                    categoryId: category.id
                }
            }).then(function(data) {
                _state.reportList = data;
                if ($state.params.report) {
                    _state.report = _.find(data, function(i) {
                        return i.name === $state.params.report;
                    });
                } else {
                    _state.report = data[0];
                }
            });
        }, true);
    }
})