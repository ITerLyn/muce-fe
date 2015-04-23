define(function() {
    function mqBigqueryCtrl($scope, $rootScope, apiHelper) {
        // 支持 选项： order, querys_showed, more_querys
        function fetchHistory(type) {
            apiHelper('getBigJobList', {
                busy: type
            }).then(function(data) {
                $scope.jobList = data ? data.reverse() : [];
                for (var i = 0; i < $scope.jobList.length; i++) {
                    var ct = $scope.jobList[i]['cTime'],
                    st = $scope.jobList[i]['sTime'];
                    var costtime = ct-st;
                    $scope.jobList[i]['costtime'] = format(costtime);

                }
            });
        }

        function format(formatSecond){
            var num = parseInt(formatSecond / 1000);
            var m = 60;
            var h = 60 * 60;
            var ftime;
            if(num > h){
                var fh = parseInt(num / h);
                var fy = num % h;
                if(fy > m){
                    var gh = parseInt(fy / m);
                    var gy = fy % m;

                    ftime = fh+'H '+gh+'M '+gy+'S';
                } else {
                    ftime = fh+'H '+'0M '+fy+'S';
                }

            } else if(num == h) {
                var fh = parseInt(num /h);
                ftime = fh+'H 0M 0S';
            } else {
                if(num > m){
                    var gh = parseInt(num / m);
                    var gy = num % m;
                    ftime = gh+'M '+gy+'S';
                } else if(num == m) {
                    var gh = parseInt(num /m);
                    ftime = gh+'M 0S';
                } else {
                    ftime = num+'S';
                }
            }

            return ftime;
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