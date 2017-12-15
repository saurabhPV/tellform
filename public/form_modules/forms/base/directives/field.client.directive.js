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
				'pain_point'
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
				if (!$rootScope.patentInfo){
					if (localStorage.getItem("patentInfo")) {
						$rootScope.patentInfo = JSON.parse(localStorage.getItem("patentInfo"));
					}else{
						$rootScope.patentInfo = {}
					}
				}
				console.log("$rootScope.patentInfo : ",$rootScope.patentInfo)
				

				$rootScope.chooseDefaultOption = scope.chooseDefaultOption = function(type) {
					if(type === 'yes_no'){
						$rootScope.patentInfo[field.title.replace(" ", "_")] = 'true';
					}else if(type === 'rating'){
						$rootScope.patentInfo[field.title.replace(" ", "_")] = 0;
					}else if(scope.field.fieldType === 'radio'){
						$rootScope.patentInfo[field.title.replace(" ", "_")] = scope.field.fieldOptions[0].option_value;
					}else if(type === 'legal'){
						$rootScope.patentInfo[field.title.replace(" ", "_")] = 'true';
						$rootScope.nextField();
					}
				};
				
                scope.nextField = $rootScope.nextField;
				scope.setActiveField = $rootScope.setActiveField;

				var fieldName = "";
				fieldName = scope.field.title.replace(" ", "_");

				// $root$rootScope.patentInfo = $rootScope.patentInfo;
				console.log("patentInfo : ", $rootScope.patentInfo);
				// $rootScope.name = new Date();
				if (!$rootScope.patentInfo[fieldName]) {
					$rootScope.patentInfo[fieldName] = null;
				}
				console.log("$rootScope.patentInfo : ", $rootScope.patentInfo);
				console.log("field name: "+fieldName);
				console.log("patentInfo[fieldName] : " + $rootScope.patentInfo[fieldName]);
				// if ($rootScope.patentInfo[fieldName]){
				// 	$rootScope.patentInfo[field.title.replace(" ", "_")] = $rootScope.patentInfo[fieldName];
				// 	console.log("$rootScope.patentInfo[field.title.replace(" ", "_")] : " + $rootScope.patentInfo[field.title.replace(" ", "_")]);
				// }

				//Set format only if field is a date
				if(scope.field.fieldType === 'date'){
					if (scope.field.chooseDefaultDate){
						$rootScope.patentInfo[scope.field.title.replace(" ", "_")] = new Date();
					}
					scope.dateOptions = {
						changeYear: true,
						changeMonth: true,
						altFormat: 'mm/dd/yyyy',
						yearRange: '1900:-0',
						defaultDate: 0
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

				var template = getTemplateHtml(fieldType);
				element.html(template).show();
				var output = $compile(element.contents())(scope);
			}
		};
	}]);
