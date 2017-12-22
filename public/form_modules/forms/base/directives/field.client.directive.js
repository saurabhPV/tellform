'use strict';

// coffeescript's for in loop
var __indexOf = [].indexOf || function(item) {
		for (var i = 0, l = this.length; i < l; i++) {
			if (i in this && this[i] === item) return i;
		}
		return -1;
	};

angular.module('view-form').directive('fieldDirective', ['$http', '$compile', '$rootScope', '$templateCache', 'supportedFields',
	function($http, $compile, $rootScope, $templateCache, supportedFields) {

		var getTemplateHtml = function(fieldType) {
			var type = fieldType;

			var supported_fields = [
				'textfield',
				'textarea',
				'date',
				'dropdown',
				'hidden',
				'password',
				'radio',
				'legal',
				'statement',
				'rating',
				'yes_no',
				'number',
				'natural',
				'signature',
				'pain_point',
				'social_security_number',
				'agefield'
			];

			var templateUrl = 'form_modules/forms/base/views/directiveViews/field/';
           
			if (__indexOf.call(supportedFields, type) >= 0) {
				templateUrl = templateUrl+type+'.html';
			}
			return $templateCache.get(templateUrl);
		};

		return {
			template: '<div>{{field.title}}</div>',
			restrict: 'E',
			scope: {
				field: '=',
				required: '&',
				design: '=',
				index: '=',
				forms: '='
			},
			link: function(scope, element) {
				if (!$rootScope.patientInfo){
					if (localStorage.getItem("patientInfo")) {
						$rootScope.patientInfo = JSON.parse(localStorage.getItem("patientInfo"));
					}else{
						$rootScope.patientInfo = {}
					}
				}
				console.log("$rootScope.patientInfo : ",$rootScope.patientInfo)
				

				$rootScope.chooseDefaultOption = scope.chooseDefaultOption = function(type) {
					if(type === 'yes_no'){
						$rootScope.patientInfo[field.model] = 'true';
					}else if(type === 'rating'){
						$rootScope.patientInfo[field.model] = 0;
					}else if(scope.field.fieldType === 'radio'){
						$rootScope.patientInfo[field.model] = scope.field.fieldOptions[0].option_value;
					}else if(type === 'legal'){
						$rootScope.patientInfo[field.model] = 'true';
						$rootScope.nextField();
					}
				};
				
                scope.nextField = $rootScope.nextField;
				scope.setActiveField = $rootScope.setActiveField;

				var fieldName = "";
				fieldName = scope.field.model;

				// $root$rootScope.patientInfo = $rootScope.patientInfo;
				console.log("patientInfo : ", $rootScope.patientInfo);
				// $rootScope.name = new Date();
				if (!$rootScope.patientInfo[fieldName]) {
					$rootScope.patientInfo[fieldName] = null;
				}
				console.log("$rootScope.patientInfo : ", $rootScope.patientInfo);
				console.log("field name: "+fieldName);
				console.log("patientInfo[fieldName] : " + $rootScope.patientInfo[fieldName]);
				// if ($rootScope.patientInfo[fieldName]){
				// 	$rootScope.patientInfo[field.model] = $rootScope.patientInfo[fieldName];
				// 	console.log("$rootScope.patientInfo[field.model] : " + $rootScope.patientInfo[field.model]);
				// }

				//Set format only if field is a date
				if(scope.field.fieldType === 'date'){
					if (scope.field.chooseDefaultDate){
						$rootScope.patientInfo[scope.field.model] = new Date();
					}
					scope.dateOptions = {
						changeYear: true,
						changeMonth: true,
						altFormat: 'mm/dd/yyyy',
						yearRange: '1900:-0',
						defaultDate: 0,
						maxDate: new Date()
					};
				}

				var fieldType = scope.field.fieldType;

				if(scope.field.fieldType === 'number' || scope.field.fieldType === 'textfield' || scope.field.fieldType === 'email' || scope.field.fieldType === 'link' || scope.field.fieldType === 'signature1'){
					switch(scope.field.fieldType){
						case 'textfield':
							scope.input_type = 'text';
							break;
						case 'email':
							scope.input_type = 'email';
							scope.placeholder = 'joesmith@example.com';
							break;
						case 'number':
							scope.input_type = 'text';
							scope.validateRegex = /^-?\d+$/;
							break;
						case 'signature':
							scope.input_type = 'text';
							break;							
						default:
							scope.input_type = 'url';
							scope.placeholder = 'http://example.com';
							break;
					}
					fieldType = 'textfield';
				}

				if(scope.field.fieldType === 'signature'){
					 scope.input_type = 'text';
				}

				if(scope.field.fieldType == 'pain_point'){
                     scope.input_type = 'text';
				}

				if(scope.field.fieldType == 'social_security_number'){
                     scope.input_type = 'text';
				}	



				var template = getTemplateHtml(fieldType);
				element.html(template).show();
				var output = $compile(element.contents())(scope);
			}
		};
	}]);
