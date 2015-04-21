define([
    'mq/routes',
    'mq/indexCtrl',
    'mq/historyCtrl',
    'mq/editorCtrl',
    'mq/shareCtrl',
    'mq/jobListCtrl',
    'mq/bigqueryCtrl'
], function(routeInfo) {

    function buildCtrlDepArr(ctrlNames) {
        return _.map(ctrlNames, function(name) {
            return 'muceApp.mq.' + name;
        });
    }

    angular.module('muceApp.mq', buildCtrlDepArr(['mqCtrl', 'mqHistoryCtrl', 'mqBigqueryCtrl', 'mqEditorCtrl', 'mqShareCtrl', 'mqJobListCtrl']))
        .config(function($stateProvider) {
            _.each(routeInfo, function(opt, name) {
                $stateProvider.state(name, opt);
            });
        });
});