define([], 
    function() 
{
    'use strict';
    return ['$scope', 'apiHelper', '$state', function($scope, apiHelper, $state) {
        console.log($state.params.id);

        function fetchCurrentDashboardData() {
            if (!$scope.currentDashboard) {
                return;
            }
            $scope.currentDashboard.style.forEach(function(item) {
                item.widgets = [];

                item.widgetIds.forEach(function(wId, index) {
                    apiHelper('getWidgetById', wId).then(function(data) {
                        item.widgets.push(data);

                        if (index == item.widgetIds.length - 1) {
                            item.widgets = _.sortBy(item.widgets, function(i) {
                                return i.id;
                            });
                        }
                    });

                    
                });
            });

        }

        // LINE(0),    // 折线图
        // PIE(1),     // 饼图
        // AREA(2),    // 面积
        // MAP(3),     // 地图
        // COLUMN(4);  // 柱状图
        // Table(5)
        // KPI Metric(6)

        // DAY(0),     // 天
        // HOUR(1),    // 小时
        // WEEK(2),    // 星期
        // MONTH(3);   // 月

        $scope.selectedLayout = 0;
        $scope.selectedChartType = 0;
        $scope.selectedFrequency = 0;
        $scope.selectedSlice = 10;
        $scope.selectedMetricList = [];

        function fetchDashboards() {
            apiHelper('getDashboards').then(function(res) {
                $scope.dashboardList = res;

                $scope.currentDashboard = _.find($scope.dashboardList, function(item) {
                    return item.id == $state.params.id;
                });

                if (!$scope.currentDashboard) {
                    $scope.currentDashboard = $scope.dashboardList[0];
                }
                fetchCurrentDashboardData();
            });
        }
        fetchDashboards();

        function getMetricList() {
            apiHelper('getMetricList').then(function(data) {
                $scope.metricList = data;
                $scope.filteredMetricList = data;
            });
        }

        function getDimensionsByMetrics() {
            if ($scope.selectedMetricList.length) {
                apiHelper('getDimensionsByMetrics', {
                    params: {
                        metrics: JSON.stringify(_.pluck($scope.selectedMetricList, 'id'))
                    }
                }).then(function(data) {
                    $scope.dimensionList = data;
                    $scope.filteredDimensionList = data;
                });
            } else {
                apiHelper('getDimensionList').then(function(data) {
                    $scope.dimensionList = data;
                    $scope.filteredDimensionList = data;
                });
            }
            
        }

        $scope.$watch('searchInputMetric', function() {
            $scope.filteredMetricList = _.filter($scope.metricList, function(item) {
                return item.name.toLowerCase().indexOf($scope.searchInputMetric.toLowerCase()) !== -1;
            });
        });

        $scope.$watch('searchInputDimension', function() {
            $scope.filteredDimensionList = _.filter($scope.dimensionList, function(item) {
                return item.name.toLowerCase().indexOf($scope.searchInputDimension.toLowerCase()) !== -1;
            });
        });

        $scope.$watch('selectedChartType', function() {
            if ($scope.selectedChartType == 1) {
                $scope.selectedMetricList = [];
            }
        });

        $scope.updateSelectedMetricList = function(item, isOnylOne) {
            if (isOnylOne) {
                $scope.selectedMetricList = [item];
                getDimensionsByMetrics();

            } else {
                $scope.selectedMetricList = _.filter($scope.metricList, function(item) {
                    return item.selected;
                });
            }
            
        };

        $scope.updateSelectedDimensionList = function(item) {
            $scope.selectedDimensionList = [item];
        };

        $scope.deleteSelectedMetric = function(item) {
            var index = _.indexOf($scope.selectedMetricList, function(i) {
                return i.id === item.id;
            });
            $scope.selectedMetricList.splice(index, 1);

            var m = _.find($scope.filteredMetricList, function(f) {
                return f.id == item.id;
            });

            m.selected = false;
        };

        $scope.showDashboard = function() {
            $scope.dashboardId = '';
            $scope.showDashboardPanel = true;
            $scope.showMask = true;
        };

        $scope.closeDashboard = function() {
            $scope.showMask = false;
            $scope.showDashboardPanel = false;
            $scope.dashboardTitle = '';
            $scope.dashboardComment = '';
            $scope.dashboardId = '';
        };
        $scope.saveDashboard = function() {
            var data = {
                name: $scope.dashboardTitle,
                comment: $scope.dashboardComment
            };

            if ($scope.dashboardId) {
                data.id = $scope.dashboardId;
                data.style = [];

                var temp = {};
                $scope.currentDashboard.style.forEach(function(item) {
                    temp = {};
                    temp.layoutType = item.layoutType;
                    temp.widgetIds = item.widgetIds;

                    data.style.push(temp);
                });

                apiHelper('updateDashboard', {data: data}).then(function() {
                    $scope.closeDashboard();
                    fetchDashboards();
                });
            } else {
                apiHelper('addDashboard', {data: data}).then(function() {
                    $scope.closeDashboard();
                    fetchDashboards();
                });
            }
            
        };

        $scope.editDashboard = function(id) {
            $scope.showDashboard();
            apiHelper('getDashboardById', id).then(function(resp) {
                $scope.dashboardTitle = resp.name;
                $scope.dashboardComment = resp.comment;
                $scope.dashboardId = resp.id;
            });
        };

        $scope.deleteDashboard = function(currentDashboard) {
            var r = confirm('Are u sure delete this dashboard: 「' + currentDashboard.name + '」?');
            if (r) {
                apiHelper('delDashboard', currentDashboard.id).then(function() {
                    fetchDashboards();
                });
            }
        };

        $scope.deleteWidget = function(w, i) {
            var r = confirm('Are u sure delete this widget?');
            if (r) {
                apiHelper('deleteWidget', w.id).then(function() {
                    var index = _.indexOf($scope.currentDashboard.style[i].widgetIds, w.id);
                    $scope.currentDashboard.style[i].widgetIds.splice(index, 1);
                    $scope.currentDashboard.style[i].widgets.splice(index, 1);
                    if (!$scope.currentDashboard.style[i].widgetIds.length) {
                        $scope.currentDashboard.style.splice(i, 1)
                    }
                });
            }
        };

        function clearWidgetInfo() {
            $scope.widgetId = '';
            $scope.dashboardId = '';
            $scope.widgetTitle = '';
            $scope.widgetComment = '';
            $scope.selectedLayout = 0;
            $scope.selectedChartType = 0;
            $scope.selectedFrequency = 0;

            $scope.selectedMetricList = [];
            $scope.selectedDimensionList = [];
        }

        $scope.editWidget = function(w, dashboardId, layout) {
            getMetricList();
            $scope.widgetId = w.id;
            $scope.dashboardId = dashboardId;
            $scope.widgetTitle = w.name;
            $scope.widgetComment = w.comment;
            $scope.selectedLayout = layout;
            $scope.selectedChartType = w.defaultChart;
            $scope.selectedFrequency = 0;
            $scope.reportId = w.reportId;

            $scope.selectedMetricList = w.metrics;

            $scope.selectedDimensionList = w.dimensions;

            if ($scope.selectedChartType == 1) {
                $scope.selectedSlice = w.sortTop;
            } else if ($scope.selectedChartType == 6) {
                var processModels = JSON.parse(w.process).processModels;
                var targetItem = _.find(processModels, function(item) { 
                    return item.processType == 3;
                });
                if (targetItem && targetItem.other) {
                    $scope.metricTarget = targetItem.other;
                }
            }

            $scope.showWidgetPanel = true;
            $scope.showMask = true;
        };

        $scope.addWidget = function(lineNum) {
            getMetricList();
            clearWidgetInfo();

            $scope.showWidgetPanel = true;
            $scope.showMask = true;
            $scope.currentLine = lineNum || 0;
        };

        $scope.closeWidget = function() {
            $scope.showMask = false;
            $scope.showWidgetPanel = false;
            clearWidgetInfo();
        };

        $scope.saveWidget = function() {
            var data = {
                dashboardId: $scope.currentDashboard.id,
                name: $scope.widgetTitle || '',
                comment: $scope.widgetComment || '',
                defaultChart: $scope.selectedChartType,
                period: $scope.selectedFrequency,
                metrics: _.pluck($scope.selectedMetricList, 'id'),
                lineNum: $scope.currentLine,
                layoutType: $scope.selectedLayout
            };

            switch($scope.selectedChartType * 1) {
                case 6:
                    data.target = $scope.metricTarget * 1 || 0;
                    break;
                case 1:
                    data.dimensions = _.pluck($scope.selectedDimensionList, 'id');
                    data.sortTop = $scope.selectedSlice;
                    break;
            }


            if ($scope.widgetId) {
                data.id = $scope.widgetId;
                data.reportId = $scope.reportId;
                apiHelper('updateWidget', {data: data}).then(function(resp) {
                    $scope.closeWidget();
                    fetchDashboards();
                });
            } else {
                apiHelper('addWidget', {data: data}).then(function(resp) {
                    $scope.closeWidget();
                    fetchDashboards();
                });
            }
            
        };

        $scope.selectDashboard = function(item) {
            $scope.currentDashboard = item;
            fetchCurrentDashboardData();
        }
    }];
});

