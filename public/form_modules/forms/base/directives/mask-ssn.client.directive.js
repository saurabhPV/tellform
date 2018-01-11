'use strict';

angular.module('view-form').directive('maskSsn', function ($rootScope) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {			
                element.unmask().maskSSN('999-99-9999', {maskedChar:'X', maskedCharsLength:5});               
        }
    };
});
