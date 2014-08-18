// TODO Rename this file to `amd_config` or something like that to avoid ambiguity
require.config({
    baseUrl: '/scripts',
    paths: {
        'bower': '../components'
    },
    shim: {
        'highcharts': {
            'exports': 'Highcharts'
        },
        'highcharts_nodata': {
            'deps': ['highcharts'],
            'exports': 'highcharts_nodata'
        }
    }
});
