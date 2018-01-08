'use strict';

angular.module('view-form').directive('maskSsn', function ($rootScope) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
			
              // console.log(element);
              //setTimeout(function(){
                  element.unmask().maskSSN('999-99-9999', {maskedChar:'X', maskedCharsLength:5});
              //},1000);
               

        }
    };
});
