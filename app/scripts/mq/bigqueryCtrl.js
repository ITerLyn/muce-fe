define(function() {
    function mqBigqueryCtrl($scope, $rootScope, apiHelper) {
        // 支持 选项： order, querys_showed, more_querys
        function fetchHistory(type) {
            apiHelper('getBigJobList', {
                busy: type
            }).then(function(data) {
                $scope.jobList = data ? data.reverse() : [];
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

    angular.module('muceApp.mq.mqBigqueryCtrl', [])
        .controller('mqBigqueryCtrl', mqBigqueryCtrl);
});