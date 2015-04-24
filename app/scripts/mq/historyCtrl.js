define(function() {
    function mqHistoryCtrl($scope, $rootScope, $filter, apiHelper) {
        // 支持 选项： order, querys_showed, more_querys
        function fetchHistory(type) {
            apiHelper('getJobList', {
                busy: type
            }).then(function(data) {
                $scope.jobList = data ? data.reverse() : [];
                for (var i = 0; i < $scope.jobList.length; i++) {
                    var ct = $scope.jobList[i]['cTime'],
                    st = $scope.jobList[i]['sTime'];
                    var costtime = ct-st;
                    $scope.jobList[i]['costtime'] = $filter('formatDuration')(costtime);

                }
                
            });
        }

        fetchHistory('global');
        $rootScope.$on('mq:fetchHistory', function(e, opt) {
            if (opt && opt.channel === 'auto') {
                fetchHistory('hide');
            } else {
                fetchHistory('global');
            }
        });
    }

    angular.module('muceApp.mq.mqHistoryCtrl', [])
        .controller('mqHistoryCtrl', mqHistoryCtrl);
});