'use strict';

// SubmitForm controller
angular.module('view-form').controller('SubmitFormController', [
	'$scope', '$rootScope', '$state', '$translate', 'myForm',
	function($scope, $rootScope, $state, $translate, myForm) {
		$scope.myform = myForm;
		$rootScope.trustAsHtml = function(string) {
			return $sce.trustAsHtml(string);
		};
		$('.loader').fadeOut('slow');
		//angular.filter('trustAsHtml', function($sce) { return $sce.trustAsHtml; });
		document.body.style.background = myForm.design.colors.backgroundColor;				
		document.body.style.margin='15px';		
        $translate.use(myForm.language);
	}
]);
