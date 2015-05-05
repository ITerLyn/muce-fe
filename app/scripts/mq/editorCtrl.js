define(['mq/muce-hint'], function() {
    function mqEditorCtrl($scope, $rootScope, $interval, apiHelper, $state, $modal, downloadFile) {
        $scope.form = {};
        $scope.form.notification = true;

        var runTimer, runStatusTimer;

        function onBigQuery() {

            var notice = '你的 query 较大，在计算资源紧张的情况下，会跑得很慢或者被kill。'+
                        '如有疑问请联系 muce-team@wandoujia.com';
            var newScope = $scope.$new(true);
            newScope.notice = notice;

            $modal.open({
                templateUrl: 'templates/mq/partials/big-query-notice-modal.html',
                backdrop: false,
                size: 'lg',
                scope: newScope
            });
        }

        function confirmHql() {
            var confirmInfo = 'Please confirm whether you need to enter 「p_product」?';
            var newScope = $scope.$new(true);
            newScope.confirmInfo = confirmInfo;
            newScope.ok = function(){
                //console.log('ok');
                modalInst.close();
            };
            newScope.cancel = function(scope){
                //console.log('cancel');
                modalInst.close();
                var curTime = 0;
                apiHelper('addJob', {
                    data: $scope.form
                }).then(function(data) {
                    // Todo: know the job id
                    $scope.currentJob = data;
                    if (!$state.is('mq.history')) {
                        $state.go('mq.history');
                    }
                    runTimer = $interval(function() {
                        $scope.runTimeText = getFormatedTimeDelta(curTime);
                        curTime += 7;
                    }, 70);
                    runStatusTimer = $interval(function() {
                        updateStatus(data);
                    }, 3000);
                    $scope.atOnce = true;
                    updateStatus(data);
                    
                }, function() {
                });
            };

            var modalInst = $modal.open({
                templateUrl: 'templates/mq/partials/confirm-hql-modal.html',
                size: 'lg',
                scope: newScope
            });
        }

        function updateStatus(data) {
            $rootScope.$emit('mq:fetchHistory', {
                channel: 'auto'
            });
            apiHelper('getJob', data.id).then(function(job) {
                $scope.currentJob = job;
                if (job.status === 'COMPLETED' || job.status === 'FAILED' || job.status === 'TO_KILL' || job.status === 'KILLED') {
                    cancelCurrentJob();
                    // NOTICE BY TOGGLE document.title
                }
                if (job.status === 'COMPLETED'){
                    $scope.statusComplete = job.status;
                    $scope.currentJobId = job.id;
                }
                if (job.large && ((job.status == 'RUNNING') || (job.status == 'PENDING')) && $scope.atOnce){
                    $scope.atOnce = false;
                    onBigQuery();
                }
            }, function() {
                cancelCurrentJob();
                // same with
            });
        }

        $scope.runQuery = function() {
            var curTime = 0;
            $scope.statusComplete = '';
            $scope.currentJobResult = '';
            var hql = $scope.form.hql;
            var tt = /\s+p_product/;
            // if(tt.test(hql)){
            // because of server side checking , browser side checking was temporarily pretermitted
            if(true){
                apiHelper('addJob', {
                    data: $scope.form
                }).then(function(data) {
                    // Todo: know the job id
                    $scope.currentJob = data;
                    if (!$state.is('mq.history')) {
                        $state.go('mq.history');
                    }
                    runTimer = $interval(function() {
                        $scope.runTimeText = getFormatedTimeDelta(curTime);
                        curTime += 7;
                    }, 70);
                    runStatusTimer = $interval(function() {
                        updateStatus(data);
                    }, 3000);
                    $scope.atOnce = true;
                    updateStatus(data);
                    
                }, function() {
                    // error handler
                    // alert-error(error.reason)
                    // label-import - error.responseText
                });
            } else {
                confirmHql();
            }
        };

        $scope.composeNewQuery = function() {
            $scope.statusComplete = '';
            $scope.currentJobResult = '';
            $scope.form = {};
            $scope.form.notification = true;
            cancelCurrentJob();
        };

        $rootScope.$on('mq:setHqlEditor', function(e, hql) {
            if ($scope.currentJob) return;
            $scope.form.hql = hql;
        });

        function cancelCurrentJob() {
            $scope.currentJob = null;
            $interval.cancel(runTimer);
            $interval.cancel(runStatusTimer);
        }

        $scope.openCurrentJobView = function (jobid){
            apiHelper('getJobView', jobid, {busy: 'global'}).then(function(data) {
                $scope.currentJobResult = data;
                if ($scope.currentJobResult) {
                    if(angular.isObject($scope.currentJobResult)){
                        $scope.currentJobResult = '';
                        return;
                    }
                    $scope.currentJobResult = _.map($scope.currentJobResult.trim().split('\n'), function(i) {
                        return i.split('\t');
                    });
                }
            });
        };

        $scope.downloadCurrentJobView = function(id) {
            downloadFile(apiHelper.getUrl('getJobResult', id));
        };

        /* code-mirror setting */
        $scope.editorOptions = {
            autofocus: true,
            lineWrapping: true,
            lineNumbers: true,
            indentWithTabs: true,
            smartIndent: true,
            matchBrackets: true,
            mode: 'text/x-hive',
            extraKeys: {
                "Ctrl-Space": "autocomplete"
            },
            hintOptions: {
                tables: {},
                completeSingle: false
            },
            onLoad: function(_editor) {
                // Editor part
                _editor.focus();

                _editor.on("change", function(cm, change) {
                    //console.log(arguments);
                    if (change.origin != '+input') return;
                    // +input, +delete, complete
                    if (change.text[0] == " ") return;
                    if (change.text[0] == "" && change.text[1] == "") return;
                    CodeMirror.showHint(cm);
                });

                _editor.on("change", autoReplace);

                var replacements = {};
                apiHelper('getEventAbbr').then(function(data) {
                    _.extend(replacements, data);
                });

                function autoReplace(cm, change) {

                    if (change.text[0] !== ".") return; // todo: replace space to comma
                    var type = cm.getTokenTypeAt(change.from);
                    // if (type !== "operator" && type !== "builtin") return;
                    var token = cm.getTokenAt(change.from, true);
                    var replacement = replacements[token.string];
                    if (!replacement) return;
                    var line = change.to.line;
                    cm.replaceRange(replacement, {
                        ch: token.start,
                        line: line
                    }, {
                        ch: token.end,
                        line: line
                    });
                }
            }
        };

        apiHelper('getEventFields').then(function(data0) {
            var tableHint = {};
            _.each(data0, function(data, key) {
                _.each(data, function(tableArr, colKey) {
                    if (!tableHint[key]) tableHint[key] = {};
                    _.each(tableArr, function(i) {
                        tableHint[key][i] = null;
                    });
                });
            });

            $scope.editorOptions = {
                hintOptions: {
                    completeSingle: false,
                    tables: tableHint,
                    muceHintFieldsRef: data0
                }
            };
        });

        $scope.$watch('form.hql', function(val) {
            if (!val){ 
                $('.mq-editor-wrapper .CodeMirror').css('height', '112px');
                return;
            }
            if (val.split('\n').length > 7) {
                $('.mq-editor-wrapper .CodeMirror').css('height', 'auto');
            } else {
                $('.mq-editor-wrapper .CodeMirror').css('height', '112px');
            }
        });

        function pad(number, length) {
            var str = '' + number;
            while (str.length < length) {
                str = '0' + str;
            };
            return str;
        }

        function getFormatedTimeDelta(curTime) {
            var min = parseInt(curTime / 6000);
            var sec = parseInt(curTime / 100) - (min * 60);
            var micro = pad(curTime - (sec * 100) - (min * 6000), 2);
            var showTime = "";
            if (min > 0) {
                showTime = pad(min, 2) + ':';
            };
            showTime = showTime + pad(sec, 2) + ':' + micro;
            return showTime;
        }
    }

    angular.module('muceApp.mq.mqEditorCtrl', [])
        .controller('mqEditorCtrl', mqEditorCtrl);
});