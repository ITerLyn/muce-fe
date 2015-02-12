define([], function() {

    angular.module('muceApp.api', []).run(function(apiHelper) {
        // Meta
        apiHelper.configByType({
            add: ['group', 'category', 'dimension', 'metric', 'combineMetric', 'report', 'categoryReportRelation', 'annotation', 'dashboard'],
            edit: ['group', 'category', 'dimension', 'metric', 'combineMetric', 'report', 'annotation', 'dashboard'],
            del: ['group', 'category', 'dimension', 'metric', 'categoryReportRelation', 'report', 'annotation', 'dashboard'],
            list: ['group', 'category', 'report', 'event', 'field', 'fieldId', 'metric', 'dimension']
        }, {
            prefix: '/meta/'
        });

        apiHelper.config({
            'getDimensionsByMetrics': 'GET /meta/dimensionsByMetrics'
        });

        // Report
        apiHelper.config({
            'getReport': 'GET /report/:id',
            'getReportDetail': 'GET /meta/report/:id'
        });

        // Management
        apiHelper.config({
            'getDetailMetricsList': 'GET /meta/viewMetrics',
            'getDetailDimensionsList': 'GET /meta/viewDimensions',
            'getDetailReportsList': 'GET /meta/viewReports',
            'updateEnable': 'PUT /meta/updateEnable'
        });

        // Muce Query
        apiHelper.config({
            'addJob': 'POST /mq/job',
            'getJob': 'GET /mq/job/:id',
            'delJob': 'DELETE /mq/job/:id',
            'getJobList': 'GET /mq/job',

            'getJobResult': 'GET /mq/job/:id/result',
            'getJobResultSize': 'GET /mq/job/:id/result/size',
            'getJobView': 'GET /mq/job/:id/view',

            'getDatabases': 'GET /mq/databases',
            'getDbTable': 'GET /mq/:db/tables',
            'getDbSchema': 'GET /mq/:db/:tb/schema',
            'getDbParts': 'GET /mq/:db/:table/partitions',

            'getEventAbbr': 'GET /meta/eventAbb',
            'getEventFields': 'GET /meta/eventFields'
        });

        // Tools - ua metric platform - prefix UAMP
        apiHelper.config({
            'getUAMPReportList': 'GET /reportList',
            'getUAMPReportDetail': 'GET /report/:id',
            'getUAMPReportData': 'GET /reportData/:id',
            'getUAMPChartData': 'GET /chartData'
        }, {
            urlPrefix: 'http://apps-datatools0-bgp0.hy01.wandoujia.com:4000/api'
        });

        apiHelper.config({
            //'addDashboard': 'POST /meta/dashboard',
            'getDashboards': 'GET /meta/dashboards',
            //'updateDashboard': 'POST /meta/dashboard',
           // 'deleteDashboard': 'DELETE /meta/dashboard',
            'addWidget': 'POST /meta/widget',
            'deleteWidget': 'DELETE /meta/widget',
            'updateWidget': 'PUT /meta/widget',
            'getWidgetById': 'GET /meta/widget/:id'
        }
        // , {
        //     urlPrefix: 'http://private-75707-muce3.apiary-mock.com/api/v1/meta'
        // }
        )
    });
}) // TODO Missing semicolon