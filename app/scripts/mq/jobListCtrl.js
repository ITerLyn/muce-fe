define(function() {
    function mqJobListCtrl($scope, $rootScope, apiHelper, $modal, downloadFile) {
        $scope.setHqlEditor = function(hql) {
            $rootScope.$emit('mq:setHqlEditor', hql);
        };

        $scope.openJobResultView = function(job) {
            var newScope = $scope.$new(true);
            apiHelper('getJobView', job.id).then(function(data) {
                newScope.result = data;
                openModal();
            });

            function openModal() {
                $modal.open({
                    templateUrl: 'templates/mq/partials/job-result-modal.html',
                    size: 'lg',
                    scope: newScope,
                    controller: function($scope) {
                        // Todo: hive result stdout
                        if ($scope.result) {
                            if(angular.isObject($scope.result)){
                                $scope.result = '';
                                return;
                            }
                            $scope.result = _.map($scope.result.trim().split('\n'), function(i) {
                                return i.split('\t');
                            });
                        }
                    }
                });
            }
        };

        $scope.killJob = function(id) {
            apiHelper('delJob', id).then(function() {
                // refresh ?!
                $rootScope.$emit('mq:fetchHistory', {
                    channel: 'auto'
                });
            });
        };

        $scope.downloadJobResultView = function(id) {
            downloadFile(apiHelper.getUrl('getJobResult', id));
        };

        $scope.searchById = function(id) {
            apiHelper('getBigJob', id).then(function(data) {
                $scope.jobList = [];
                $scope.jobList.push(data);
            });
        };

        $scope.reset = function(id) {
            function fetchHistory(type) {
                apiHelper('getBigJobList', {
                    busy: type
                }).then(function(data) {
                    $scope.jobList = data ? data.reverse() : [];
                });
            }

            $scope.searchText = '';
            fetchHistory('global');
            $rootScope.$on('mq:fetchHistory', function(e, opt) {
                if (opt && opt.channel === 'auto') {
                    fetchHistory('hide');
                } else {
                    fetchHistory('global');
                }
            });
        };

    }

    angular.module('muceApp.mq.mqJobListCtrl', [])
        .controller('mqJobListCtrl', mqJobListCtrl);
});