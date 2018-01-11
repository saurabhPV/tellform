// app.directive('asDate', function () {
//     return {
//         require: 'ngModel',
//         link: function (scope, element, attrs, modelCtrl) {
//             modelCtrl.$formatters.push(function (input) {
//                 var transformedInput;
//                 if (input) transformedInput = new Date(input);
//                 else transformedInput = new Date();
//                 if (transformedInput !== input) {
//                     modelCtrl.$setViewValue(transformedInput);
//                     modelCtrl.$render();
//                 }
//                 return transformedInput;
//             });
//         }
//     };
// });