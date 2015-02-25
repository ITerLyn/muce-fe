define([
    ], function() {
    'use strict';
    return ['$compile', '$window', '$sce', 'apiHelper',
    function($compile,   $window,   $sce,   apiHelper) {
        var ROYALS_HOST = 'http://10.0.69.139:8080/widget';
        var MUCE_REPORT_URL = 'http://muce3.wandoulabs.com/api/v1/report/';
        var NORMAL_BUFFER = 140;
        var HTHUMNAIL_BUFFER = 20;

        return {
            restrict: 'A',
            scope: { 
                id: '=',
                period: '=',
                chart: '=',
                layout: '='
            },
            templateUrl: 'templates/dashboard/widget.html',
            link: function($scope, $element, $attrs) {
                $scope.width = $element.width() - HTHUMNAIL_BUFFER;
                var height = 450;
                switch($scope.layout) {
                    case 0:
                        height = 450;
                    break;
                    case 1:
                        height = 250;
                    break;
                    case 2:
                        height = 250;
                    break;
                }
                $scope.height = height;
                $scope.$watch('id', function(id) {
                    if (id) {
                        var today = moment();
                        var yesterday = today.add('days', -1);
                        var endDate = moment(yesterday).format('YYYYMMDD') * 1;
                        
                        var CHART_TYPE = {
                            0: 'line',
                            1: 'pie',
                            4: 'column',
                            5: 'table',
                            6: 'kpi'
                        };
                        var params = {period: $scope.period, 
                                      endDate: endDate, 
                                      cache: true
                                  };
                        if ($scope.chart == 1 || $scope.chart == 6) {
                            params.startDate = endDate;

                            if ($scope.chart == 6) {
                                params.process = true;
                            }
                        } 
                        apiHelper('getReport', $scope.id, {
                            params: params
                        }).then(function(data) {

                            apiHelper('getReportDetail', $scope.id).then(function(meta) {
                                switch($scope.chart) {
                                    case 0:
                                    case 4:
                                        var series = [];

                                        data.metricsMeta.forEach(function(metric) {
                                            var tempObj = {};
                                            tempObj.name = metric.name;
                                            tempObj.pointInterval =  24 * 3600 * 1000;
                                            var start = data.result[0].date + '';
                                            var dateAry = start.match(/(\d{4})(\d{2})(\d{2})/);
                                            tempObj.pointStart = Date.UTC(dateAry[1], dateAry[2], dateAry[3]);
                                            tempObj.data = _.pluck(data.result, metric.id);
                                            series.push(tempObj);
                                        });

                                        $scope.chartConfig = {
                                            options: {
                                                chart: {
                                                    type: CHART_TYPE[$scope.chart]
                                                }
                                            },
                                            credits: {
                                                enabled: false
                                            },
                                            xAxis: {
                                                type: 'datetime'
                                            },
                                            series: series,
                                            title: {
                                                text: meta.name
                                            },
                                            subtitle: {
                                                text: meta.comment
                                            },
                                            loading: false
                                        }
                                    break;

                                    case 5:
                                        $scope.title = meta.name;
                                        $scope.subtitle = meta.comment;
                                        $scope.theader = ['Date'];
                                        $scope.theader = $scope.theader.concat(_.pluck(data.metricsMeta, 'name'));
                                        var length = $scope.layout == 0 ? 14 : 7;
                                        var d = data.result.slice(0, length);
                                        $scope.tbody = [];
                                        d.forEach(function(item) {
                                            var temp = [];
                                            temp.push(item.date);
                                            for (var i in item) {
                                                if (i !== 'date') {
                                                    temp.push(item[i]);
                                                }
                                            }
                                            $scope.tbody.push(temp);
                                        });
                                    break;

                                    case 1:
                                        var series = [];
                                        var tempObj = {
                                            type: CHART_TYPE[$scope.chart],
                                            name: data.metricsMeta[0].name,
                                            data: []
                                        };
                                        var metricId = data.metrics[0];
                                        var dimenId = data.dimensions[0];
                                        var sum = _.reduce(data.result, function(memo, item) {
                                            return memo + item[metricId];
                                        }, 0)
                                        data.result.forEach(function (item) {
                                            var temp = [];
                                            temp.push(item['d' + dimenId]);
                                            temp.push((item[metricId] / sum * 100).toFixed(2) * 1);
                                            tempObj.data.push(temp);
                                        });

                                        series.push(tempObj);
                                        $scope.chartConfig = {
                                            chart: {
                                                height: $scope.height - 50
                                            },
                                            credits: {
                                                enabled: false
                                            },
                                            tooltip: {
                                                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                                            },
                                            plotOptions: {
                                                pie: {
                                                    allowPointSelect: true,
                                                    cursor: 'pointer',
                                                    dataLabels: {
                                                        enabled: true,
                                                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                                                        style: {
                                                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                                                        }
                                                    }
                                                }
                                            },
                                            series: series,
                                            title: {
                                                text: meta.name
                                            },
                                            subtitle: {
                                                text: meta.comment
                                            },
                                            loading: false
                                        };
                                    break;

                                    case 6:
                                        $scope.metricName = meta.metrics[0].name;
                                        $scope.title = meta.name;
                                        $scope.subtitle = meta.comment;
                                        $scope.theader = ['', 'Data', 'Diff', 'Rate'];
                                        $scope.tbody = [];
                                        var dimenId = data.dimensions[0];
                                        var rateId = _.find(data.metricsMeta, function(item) {
                                            return item.name == 'Rate';
                                        }).id;
                                        var dataId = _.find(data.metricsMeta, function(item) {
                                            return item.name == 'Data';
                                        }).id;
                                        var diffId = _.find(data.metricsMeta, function(item) {
                                            return item.name == 'Diff';
                                        }).id;

                                        var yesterday = _.find(data.result, function(item) {
                                            return item['d' + dimenId].toLowerCase() == 'yesterday';
                                        });
                                        $scope.currentMetric = yesterday[dataId] + yesterday[diffId];

                                        data.result.forEach(function(item) {
                                            item[rateId] = (item[rateId] * 100).toFixed(2) + '%';
                                            var temp = [];
                                            temp.push(item['d' + dimenId]);
                                            for (var i in item) {
                                                if (i != 'date' && i.indexOf('d') == -1) {
                                                    temp.push(item[i]);
                                                }
                                            }
                                            $scope.tbody.push(temp);
                                        });
                                    break;
                                }
                            });
                            
                        });

                        // var url = MUCE_REPORT_URL + id + '?cache=true&period=' + $scope.period
                        //     + '&startDate=' + startDate;
                        // var link = ROYALS_HOST + '?dataUrl=' + encodeURIComponent(url) + '&charts[type]=' + type;

                        // var buffer = NORMAL_BUFFER;

                        // if ($scope.layout === 2) {
                        //     link += '&charts[layout]=thumbnail';
                        //     buffer = HTHUMNAIL_BUFFER;
                        // }

                        // link += '&charts[width]=' + ($scope.width - buffer);
                        // link += '&charts[height]=' + ($scope.height - buffer);
                        // $scope.src = $sce.trustAsResourceUrl(link);
                    }
                });
            }
        };
    }];
})