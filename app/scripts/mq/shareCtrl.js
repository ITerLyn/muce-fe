define(function() {
    function mqShareCtrl($scope, apiHelper, $http, $filter) {

        $scope.mqShareInputHandler = function(e) {
            if (e.keyCode === 13) {
                $scope.queryUserJobList();
            }
        };
        $scope.hasQueryJobList = false;
        $scope.queryUserJobList = function() {
            $scope.hasQueryJobList = false;
            apiHelper('getJobList', {
                params: {
                    user: $scope.target.id
                },
                busy: 'global'
            }).then(function(data) {
                $scope.hasQueryJobList = true;
                $scope.jobList = data ? data.reverse() : [];
                for (var i = 0; i < $scope.jobList.length; i++) {
                    var ct = $scope.jobList[i]['cTime'],
                    st = $scope.jobList[i]['sTime'];
                    var costtime = ct-st;
                    $scope.jobList[i]['costtime'] = $filter('formatDuration')(costtime);

                }
            });
        }

        $http.get('http://who.wandoulabs.com/api/v1/list/person/').then(function(data) {
            $scope.whoList = data;
        });
    }

    angular.module('muceApp.mq.mqShareCtrl', [])
        .controller('mqShareCtrl', mqShareCtrl);
});