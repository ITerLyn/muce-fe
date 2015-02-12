define([ 
    'dashboard/controllers/dashboard',
    'dashboard/directives/widget'
    ], 
function(
    dashboardController,
    widget)
{
    'use strict';
    angular.module('MuceAPP.dashboard', [])
        .controller('MuceAPP.dashboardController', dashboardController)
        .directive('dashboardWidget', widget)
        ;
});
