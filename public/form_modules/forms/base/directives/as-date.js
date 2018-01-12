'use strict';

angular.module('view-form').directive('asDate', function ($rootScope) {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, modelCtrl) {

            function appendZero(val){
                 if(val < 10){
                 	val = '0' + val;
                 }
                 return val;
            }

            scope.$watch(attrs['ngModel'], function (v) {
               
              if(typeof v == 'object'){
                 $rootScope.patientInfo[attrs.modelName] = v.getFullYear() + '-' + appendZero((v.getMonth()+1))+ '-' + appendZero(v.getDate());
              }

            });

        }
    };
});
