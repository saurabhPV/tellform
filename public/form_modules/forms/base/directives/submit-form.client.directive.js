'use strict';

//FIXME: Should find an appropriate place for this
//Setting up jsep
jsep.addBinaryOp('contains', 10);
jsep.addBinaryOp('!contains', 10);
jsep.addBinaryOp('begins', 10);
jsep.addBinaryOp('!begins', 10);
jsep.addBinaryOp('ends', 10);
jsep.addBinaryOp('!ends', 10);

angular.module('view-form').directive('submitFormDirective', ['$http', 'TimeCounter', '$filter', '$rootScope', 'SendVisitorData', '$translate', '$timeout', 'dataFactory', 'VIEW_FORM_API_URL', '$location', 'AwsDocument', 'toastr',
	function ($http, TimeCounter, $filter, $rootScope, SendVisitorData, $translate, $timeout, dataFactory, VIEW_FORM_API_URL, $location, AwsDocument, toastr) {
		return {
			templateUrl: 'form_modules/forms/base/views/directiveViews/form/submit-form.client.view.html',
			restrict: 'E',
			scope: {
				myform: '=',
				ispreview: '='
			},
			controller: function ($document, $window, $scope) {

				$scope.ssn = '';
				$scope.currentPageUrl = window.location.href;
				if ($location.search().id) {
					$rootScope.patientId = $location.search().id;
				}
				if ($rootScope.patientId) {
					var url = VIEW_FORM_API_URL.apiEndpoint + VIEW_FORM_API_URL.urls.GetPatient.replace("{{patientId}}", $rootScope.patientId);

					dataFactory.get(url, function (data) {
						console.log("patent data : ", data);
						// if (!$rootScope.patientInfo) {
						// 	if (localStorage.getItem("patientInfo")) {
						// 		$rootScope.patientInfo = JSON.parse(localStorage.getItem("patientInfo"));
						// 	} else {
						// 		$rootScope.patientInfo = {}
						// 	}
						// }

						$rootScope.patientInfo = {}
						$rootScope.patientData = data;

						var patient = data.Patient;

						var patientKeys = Object.keys(patient);

						console.log("patientKeys : ", patientKeys)

						patientKeys.forEach(function (key) {
							console.log("keys : ", key);
							console.log("Array.isArray(patient[key]) : ", Array.isArray(patient[key]));
							if (Array.isArray(patient[key]) && patient[key].length != 0) {
								switch (key) {
									case 'EmailAddress':
										$rootScope.patientInfo.EmailAddress = patient[key][0].Email;
										break;

									case 'PhoneNumber':
									case 'Guarantor_Contact_phone':
										patient[key].forEach(function (element) {
											console.log("element : ", element);
											$rootScope.patientInfo[element.PHType] = element.PHNumber;
										}, this);
										break;

									case 'Address':
										$rootScope.patientInfo.Address = patient[key][0].AddressLine1;
										break;

									case 'Guarantor_Contact_Address':
										$rootScope.patientInfo.Guarantor_Contact_Address = patient[key][0].AddressLine1;
										break;

									case 'KeyValuePair':
										console.log("KeyValuePair");
										patient[key].forEach(function (element) {
											console.log("element : ", element);
											$rootScope.patientInfo[element.Key] = element.Value;

											if (element.Key == 'Pain_Point') {
												if (element.Value) {
													$scope.setExistImagePoint(element.Value);
												}
											}

											if (element.key == 'social_security_number') {
												if (element.Value) {
													$scope.decryptSSN(element.Value);
												}
											}



										}, this);
										break;

									default:
										break;
								}
							} else {
								$rootScope.patientInfo[key] = patient[key];
							}
						});

						console.log("$rootScope.patientInfo after getting data : ", $rootScope.patientInfo);
						localStorage.setItem("patientInfo", JSON.stringify($rootScope.patientInfo));

					}, function (reason) {
						console.log("reason : ", reason);
						if (!$rootScope.patientInfo) {
							if (localStorage.getItem("patientInfo")) {
								$rootScope.patientInfo = JSON.parse(localStorage.getItem("patientInfo"));
							} else {
								$rootScope.patientInfo = {}
							}
						}
					})
				}
				var NOSCROLL = false;
				var FORM_ACTION_ID = 'submit_field';
				$scope.forms = {};
				$scope.cordinateList = { front: [], side: [] };
				$scope.validSSN = false;
				//Don't start timer if we are looking at a design preview
				if ($scope.ispreview) {
					TimeCounter.restartClock();
				}

				var form_fields_count = $scope.myform.visible_form_fields.filter(function (field) {
					return field.fieldType !== 'statement';
				}).length;

				var nb_valid = $filter('formValidity')($scope.myform);
				$scope.translateAdvancementData = {
					done: nb_valid,
					total: form_fields_count,
					answers_not_completed: form_fields_count - nb_valid
				};

				// function calculateAspectRatio(element) {
				//     var $element = $(element);
				//     return $element.width() / $element.height();
				// }

				function roundNumber(number) {
					return Number(number.toFixed(2));
				}



				// $rootScope.setSSNEncrypted = $scope.setSSNEncrypted = function(){


				//     // Encrypt 
				//     var ciphertext = CryptoJS.AES.encrypt($scope.ssn, 'secret key 123');

				//     console.log(ciphertext.toString());

				//     // Decrypt 
				//     var bytes  = CryptoJS.AES.decrypt(ciphertext.toString(), 'secret key 123');
				//     var plaintext = bytes.toString(CryptoJS.enc.Utf8);

				//     console.log(plaintext);

				// };

				// $scope.setSSNEncrypted();

				$rootScope.decryptSSN = $scope.decryptSSN = function (encryptedSSN) {

					var bytes = CryptoJS.AES.decrypt(encryptedSSN.toString(), '12345');
					var plaintext = bytes.toString(CryptoJS.enc.Utf8);

					$scope.ssn = plaintext;

					angular.element('#ssn').val('****-***-' + plaintext.slice(-4));

				};


				$scope.setExistImagePoint = (function (points) {

					if ($('#front_pointer_div').length > 0) {


						var naturalWidth = $('#front_pointer_div').get(0).naturalWidth;
						var width = $("#front_pointer_div").width();

						var sideNaturalWidth = $('#side_pointer_div').get(0).naturalWidth;
						var sideWidth = $("#side_pointer_div").width();

						var widthRatio = roundNumber(naturalWidth / width);
						var sideWidthRatio = roundNumber(sideNaturalWidth / sideWidth);

						var pointList = JSON.parse(points);

						for (var key in pointList) {

							for (var index = 0; index < pointList[key].length; index++) {

								var currentWidthRatio = (key == 'front') ? widthRatio : sideWidthRatio;

								var current_x_cordinate = roundNumber(pointList[key][index].pos_x / currentWidthRatio);
								var current_y_cordinate = roundNumber(pointList[key][index].pos_y / currentWidthRatio);

								var pointer_image_width = 13

								var style = "position: absolute; top: " + (current_y_cordinate - (pointer_image_width / 2)) + "px; left: " + (current_x_cordinate - (pointer_image_width / 2)) + "px;";
								var img = $('<img />', {
									id: 'pointer_' + (pointList[key].length - 1),
									src: '/static/modules/core/img/pointt.png',
									style: style,
									width: pointer_image_width
								});

								$("#" + key + "_pointer_div").after(img);

								var cordinateDetail = { real_cordinate: { pos_x: pointList[key][index].pos_x, pos_y: pointList[key][index].pos_y }, virtual_cordinate: { pos_x: current_x_cordinate, pos_y: current_x_cordinate } };

								if (key == 'front') {
									$scope.cordinateList.front.push(cordinateDetail);
								}
								else {
									$scope.cordinateList.side.push(cordinateDetail);
								}

							}
						}

					}

				});

				$rootScope.setImagePoint = $scope.setImagePoint = function (event) {

					var elementId = event.target.id;

					var width = $("#" + elementId).width();
					var height = $("#" + elementId).height();
					var naturalWidth = $("#" + elementId).get(0).naturalWidth;
					var naturalHeight = $("#" + elementId).get(0).naturalHeight;

					var widthRatio = roundNumber(naturalWidth / width);

					var offset = $("#" + elementId).offset();

					var pos_x = event.offsetX ? (event.offsetX) : event.pageX - offset.left;
					var pos_y = event.offsetY ? (event.offsetY) : event.pageY - offset.top;

					var real_pos_x = roundNumber(pos_x * widthRatio);
					var real_pos_y = roundNumber(pos_y * widthRatio);

					var cordinateDetail = { real_cordinate: { pos_x: real_pos_x, pos_y: real_pos_y }, virtual_cordinate: { pos_x: pos_x, pos_y: pos_y } };

					if (elementId == 'front_pointer_div') {
						$scope.cordinateList.front.push(cordinateDetail);
					}
					else {
						$scope.cordinateList.side.push(cordinateDetail);
					}

					var pointer_image_width = 13

					var style = "position: absolute; top: " + (pos_y - (pointer_image_width / 2)) + "px; left: " + (pos_x - (pointer_image_width / 2)) + "px;";
					var img = $('<img />', {
						id: 'pointer_' + ($scope.cordinateList.front.length - 1),
						src: '/static/modules/core/img/pointt.png',
						style: style,
						width: pointer_image_width
					});

					$("#" + elementId).after(img);


					var cordinateListContent = { front: [], side: [] };

					for (var key in $scope.cordinateList) {

						for (var index = 0; index < $scope.cordinateList[key].length; index++) {
							cordinateListContent[key].push($scope.cordinateList[key][index].real_cordinate);
						}

					}

					$("#pain_point").val(JSON.stringify(cordinateListContent));
					$("#pain_point").trigger('change');

				};

				$rootScope.checkNumber = $scope.checkNumber = function (event) {

					var keys = {
						'up': 38, 'right': 39, 'down': 40, 'left': 37,
						'escape': 27, 'backspace': 8, 'tab': 9, 'enter': 13,
						'0': 48, '1': 49, '2': 50, '3': 51, '4': 52, '5': 53, '6': 54, '7': 55, '8': 56, '9': 57
					};

					var valid = true;

					for (var index in keys) {

						if (!keys.hasOwnProperty(index)) continue;

						if (event.charCode == keys[index] || event.keyCode == keys[index]) {
							valid = true;
							break;
						}
						else {
							valid = false;
						}
					}

					$scope.validSSN = valid;

					if (!valid) {
						event.preventDefault();
						return false;
					}

					var SSNValue = angular.element('#ssn').val();

					if (SSNValue.length > 10) {
						$scope.validSSN = false;
					}

				}

				$rootScope.ssnKeyUp = $scope.ssnKeyUp = function (event) {

					if ($scope.validSSN) {

						var SSNValue = angular.element('#ssn').val();

						SSNValue = SSNValue.replace(/ /g, '');

						var SSNLength = SSNValue.length;

						if ((SSNLength < 12) && (!(isNaN(event.key)))) {

							var ssnLengthDetail = SSNLength - 1;

							if (SSNLength > 7) {
								ssnLengthDetail = SSNLength - 3;
							}
							else if (SSNLength > 4) {
								ssnLengthDetail = SSNLength - 2;
							}

							$scope.ssn = $scope.ssn.substring(0, ssnLengthDetail);
							$scope.ssn += event.key;


							var m = 1;
							var arr = SSNValue.split('');
							var SSNnewval = "";

							if (arr.length > 0) {
								for (var m = 0; m < arr.length; m++) {
									if (m == 3 || m == 6) {
										SSNnewval = SSNnewval + '-';
									}

									if (m < 6) {

										if (arr[m] != '-') {
											SSNnewval = SSNnewval + arr[m].replace(/[0-9]/g, "*");
										}

									} else {
										if (arr[m] != '-') {
											SSNnewval = SSNnewval + arr[m];
										}

									}
								}
							}

							angular.element('#ssn').val(SSNnewval);
						}

					}

				}

				$scope.reloadForm = function () {
					//Reset Form
					$scope.myform.submitted = false;
					$scope.myform.form_fields = _.chain($scope.myform.visible_form_fields).map(function (field) {
						field.fieldValue = '';
						return field;
					}).value();

					$scope.loading = false;
					$scope.error = '';

					$scope.selected = {
						_id: '',
						index: 0
					};
					$scope.setActiveField($scope.myform.visible_form_fields[0]._id, 0, false);

					//Reset Timer
					TimeCounter.restartClock();
				};

                /*
                ** Field Controls
                */
				var evaluateLogicJump = function (field) {
					var logicJump = field.logicJump;
					if (logicJump.enabled) {
						if (logicJump.expressionString && logicJump.valueB && $rootScope.patientInfo[field.model]) {
							var parse_tree = jsep(logicJump.expressionString);
							var left, right;

							if (parse_tree.left.name === 'field') {
								left = $rootScope.patientInfo[field.model];
								right = logicJump.valueB;
							} else {
								left = logicJump.valueB;
								right = $rootScope.patientInfo[field.model];
							}

							if (field.fieldType === 'number' || field.fieldType === 'scale' || field.fieldType === 'rating') {
								switch (parse_tree.operator) {
									case '==':
										return (parseInt(left) === parseInt(right));
									case '!==':
										return (parseInt(left) !== parseInt(right));
									case '>':
										return (parseInt(left) > parseInt(right));
									case '>=':
										return (parseInt(left) > parseInt(right));
									case '<':
										return (parseInt(left) < parseInt(right));
									case '<=':
										return (parseInt(left) <= parseInt(right));
									default:
										return false;
								}
							} else {
								switch (parse_tree.operator) {
									case '==':
										return (left === right);
									case '!==':
										return (left !== right);
									case 'contains':
										return (left.indexOf(right) > -1);
									case '!contains':
										/* jshint -W018 */
										return !(left.indexOf(right) > -1);
									case 'begins':
										return left.startsWith(right);
									case '!begins':
										return !left.startsWith(right);
									case 'ends':
										return left.endsWith(right);
									case '!ends':
										return left.endsWith(right);
									default:
										return false;
								}
							}
						}
					}
				};

				var getActiveField = function () {
					if ($scope.selected === null) {
						console.error('current active field is null');
						throw new Error('current active field is null');
					}

					if ($scope.selected._id === FORM_ACTION_ID) {
						return $scope.myform.form_fields.length - 1;
					}
					return $scope.selected.index;
				};

				$scope.isActiveField = function (field) {
					if ($scope.selected._id === field._id) {
						return true
					}
					return false;
				};

				$scope.setActiveField = $rootScope.setActiveField = function (field_id, field_index, animateScroll) {
					if ($scope.selected === null || (!field_id && field_index === null)) {
						return;
					}

					if (!field_id) {
						field_id = $scope.myform.visible_form_fields[field_index]._id;
					} else if (field_index === null) {

						field_index = $scope.myform.visible_form_fields.length

						for (var i = 0; i < $scope.myform.visible_form_fields.length; i++) {
							var currField = $scope.myform.visible_form_fields[i];
							if (currField['_id'] == field_id) {
								field_index = i;
								break;
							}
						}
					}

					if ($scope.selected._id === field_id) {
						return;
					}

					$scope.selected._id = field_id;
					$scope.selected.index = field_index;

					var nb_valid = $filter('formValidity')($scope.myform);
					$scope.translateAdvancementData = {
						done: nb_valid,
						total: form_fields_count,
						answers_not_completed: form_fields_count - nb_valid
					};

					if (animateScroll) {
						NOSCROLL = true;
						setTimeout(function () {
							$document.scrollToElement(angular.element('.activeField'), -10, 1000).then(function () {
								// NOSCROLL = false;
								setTimeout(function () {
									if (document.querySelectorAll('.activeField .focusOn').length) {
										//Handle default case
										document.querySelectorAll('.activeField .focusOn')[0].focus();
									} else if (document.querySelectorAll('.activeField input').length) {
										//Handle case for rating input
										document.querySelectorAll('.activeField input')[0].focus();
									} else {
										//Handle case for dropdown input
										document.querySelectorAll('.activeField .selectize-input')[0].focus();
									}
									setTimeout(function () {
										NOSCROLL = false;
									}, 1000);
								});
							});
						});
					}
				};

				$scope.$watch('selected.index', function (oldValue, newValue) {
					if (oldValue !== newValue && newValue < $scope.myform.form_fields.length) {

						//Only send analytics data if form has not been submitted
						if (!$scope.myform.submitted) {
							console.log('SendVisitorData.send()');
							SendVisitorData.send($scope.myform, newValue, TimeCounter.getTimeElapsed());
						}
					}
				});
				function getAbsoluteBoundingRect(el) {
					var doc = document,
						win = window,
						body = doc.body,

						// pageXOffset and pageYOffset work everywhere except IE <9.
						offsetX = win.pageXOffset !== undefined ? win.pageXOffset :
							(doc.documentElement || body.parentNode || body).scrollLeft,
						offsetY = win.pageYOffset !== undefined ? win.pageYOffset :
							(doc.documentElement || body.parentNode || body).scrollTop,

						rect = el.getBoundingClientRect();

					if (el !== body) {
						var parent = el.parentNode;

						// The element's rect will be affected by the scroll positions of
						// *all* of its scrollable parents, not just the window, so we have
						// to walk up the tree and collect every scroll offset. Good times.
						while (parent !== body) {
							offsetX += parent.scrollLeft;
							offsetY += parent.scrollTop;
							parent = parent.parentNode;
						}
					}

					return {
						bottom: rect.bottom + offsetY,
						height: rect.height,
						left: rect.left + offsetX,
						right: rect.right + offsetX,
						top: rect.top + offsetY,
						width: rect.width
					};
				}
				//Fire event when window is scrolled
				$window.onscroll = function () {
					if (!NOSCROLL) {

						var scrollTop = $(window).scrollTop();
						var abselemBox = getAbsoluteBoundingRect(document.getElementsByClassName('activeField')[0]);
						var field_id, field_index;
						var elemHeight = $('.activeField').height();

						var submitSectionHeight = $('.form-actions').height();
						var maxScrollTop = $(document).height() - $(window).height();
						var fieldWrapperHeight = $('form_fields').height();

						var selector = 'form > .field-directive:nth-of-type(' + String($scope.myform.visible_form_fields.length - 1) + ')'
						var fieldDirectiveHeight = $(selector).height()
						var scrollPosition = maxScrollTop - submitSectionHeight - fieldDirectiveHeight * 1.2;

						var fractionToJump = 0.9;

						//Focus on field above submit form button
						if ($scope.selected.index === $scope.myform.visible_form_fields.length) {
							if (scrollTop < scrollPosition) {
								field_index = $scope.selected.index - 1;
								$scope.setActiveField(null, field_index, false);
							}
						}

						//Focus on submit form button
						else if ($scope.selected.index === $scope.myform.visible_form_fields.length - 1 && scrollTop > scrollPosition) {
							field_index = $scope.selected.index + 1;
							$scope.setActiveField(FORM_ACTION_ID, field_index, false);
						}

						//If we scrolled bellow the current field, move to next field
						else if (scrollTop > fractionToJump * (abselemBox.top + abselemBox.height) && $scope.selected.index < $scope.myform.visible_form_fields.length - 1) {
							field_index = $scope.selected.index + 1;
							$scope.setActiveField(null, field_index, false);
						}
						//If we scrolled above the current field, move to prev field
						else if ($scope.selected.index !== 0 && scrollTop < fractionToJump * abselemBox.top) {
							field_index = $scope.selected.index - 1;
							$scope.setActiveField(null, field_index, false);
						}
					}

					$scope.$apply();
				};

				$rootScope.nextField = $scope.nextField = function (selectedField, value) {
					$scope.myform.visible_form_fields.forEach(function (element, index) {
						if (angular.equals(element, selectedField)) {
							console.log("object match");
							$scope.selected.index = index;
						}
					}, this);
					if ($scope.selected && $scope.selected.index > -1) {
						if ($scope.selected._id !== FORM_ACTION_ID) {
							var currField = $scope.myform.visible_form_fields[$scope.selected.index];

							if (value == 'false' && currField.fieldType == "legal" && $scope.myform.endPage.action) {
								toastr.info(`You have answered "No" for the last question, so you will not need to fill this form. You will be redirected to the next form.`, 'Information');
								var data = {};
								data.HospitalMRN = $rootScope.patientId;
								data[currField.parent] = [];
								data[currField.parent].push({
									'Key': currField.model,
									'Value': value
								});
								updatePatientData(data, $scope.myform.endPage.action);
							} else {
								//Jump to logicJump's destination if it is true
								if (currField.logicJump && currField.logicJump.jumpTo && evaluateLogicJump(currField)) {
									$scope.setActiveField(currField.logicJump.jumpTo, null, true);
								} else if ($scope.selected.index < $scope.myform.visible_form_fields.length - 1) {
									$scope.setActiveField(null, $scope.selected.index + 1, true);
								} else {
									$scope.setActiveField(FORM_ACTION_ID, null, true);
								}
							}
						} else {
							//If we are at the submit actions page, go to the first field
							$rootScope.setActiveField(null, 0, true);
						}
					} else {
						//If selected is not defined go to the first field
						$rootScope.setActiveField(null, 0, true);
					}

				};

				$rootScope.prevField = $scope.prevField = function () {
					console.log('prevField');
					console.log($scope.selected);
					var selected_index = $scope.selected.index - 1;
					if ($scope.selected.index > 0) {
						$scope.setActiveField(null, selected_index, true);
					}
				};

				$rootScope.goToInvalid = $scope.goToInvalid = function () {
					var field_id = $('.row.field-directive .ng-invalid.focusOn, .row.field-directive .ng-untouched.focusOn:not(.ng-valid)').first().parents('.row.field-directive').first().attr('data-id');
					$scope.setActiveField(field_id, null, true);
				};

                /*
                ** Form Display Functions
                */
				$scope.exitStartPage = function () {
					$scope.myform.startPage.showStart = false;
					if ($scope.myform.visible_form_fields.length > 0) {
						$scope.selected._id = $scope.myform.visible_form_fields[0]._id;
					}
				};

				var getDeviceData = function () {
					var md = new MobileDetect(window.navigator.userAgent);
					var deviceType = 'other';

					if (md.tablet()) {
						deviceType = 'tablet';
					} else if (md.mobile()) {
						deviceType = 'mobile';
					} else if (!md.is('bot')) {
						deviceType = 'desktop';
					}

					return {
						type: deviceType,
						name: window.navigator.platform
					};
				};

				var getIpAndGeo = function () {
					//Get Ip Address and GeoLocation Data
					$.ajaxSetup({ 'async': false });
					var geoData = $.getJSON('https://freegeoip.net/json/').responseJSON;
					$.ajaxSetup({ 'async': true });

					if (!geoData || !geoData.ip) {
						geoData = {
							ip: 'Adblocker'
						};
					}

					return {
						ipAddr: geoData.ip,
						geoLocation: {
							City: geoData.city,
							Country: geoData.country_name
						}
					};
				};


				$rootScope.submitForm = $scope.submitForm = function () {
					//                console.log($scope.ssn);
					//                console.log($rootScope.patientId);
					//              // console.log(CryptoJS.AES.encrypt($scope.ssn, $rootScope.patientId));
					//                //console.log(CryptoJS.AES.encrypt($scope.ssn, 12345));

					//                var ciphertext = CryptoJS.AES.encrypt($scope.ssn, '123456789');

					//                console.log(ciphertext.toString());

					//                return false;
					//               // $rootScope.patientInfo[$scope.myform.form_fields[i].model] = CryptoJS.AES.encrypt($scope.ssn, $rootScope.patientId);  

					// console.log($scope.forms);
					// console.log($scope.myform);

					if ($scope.forms.myForm.$invalid) {
						$scope.goToInvalid();
						return;
					}

					//  return false;
					var formAction = "";

					var _timeElapsed = TimeCounter.stopClock();
					$scope.loading = true;

					var form = _.cloneDeep($scope.myform);

					console.log("form.endPage.action " + form.endPage.action);
					if (form.endPage.action) {
						formAction = form.endPage.action;
					}
					var deviceData = getDeviceData();
					form.device = deviceData;

					var geoData = getIpAndGeo();
					form.ipAddr = geoData.ipAddr;
					form.geoLocation = geoData.geoLocation;

					form.timeElapsed = _timeElapsed;
					form.percentageComplete = $filter('formValidity')($scope.myform) / $scope.myform.visible_form_fields.length * 100;
					delete form.endPage
					delete form.isLive
					delete form.provider
					delete form.startPage
					delete form.visible_form_fields;
					delete form.analytics;
					delete form.design;
					delete form.submissions;
					delete form.submitted;


					console.log("$rootScope.patientInfo : ", $rootScope.patientInfo);
					if (!$rootScope.patientInfo) {
						if (localStorage.getItem("patientInfo")) {
							$rootScope.patientInfo = JSON.parse(localStorage.getItem("patientInfo"));
						} else {
							$rootScope.patientInfo = {}
						}
					}
					console.log("patent info : ", $rootScope.patientInfo);
					form.signatureUrl = '';
					var data = {};
					data.HospitalMRN = $rootScope.patientId;

					for (var i = 0; i < $scope.myform.form_fields.length; i++) {
						if ($scope.myform.form_fields[i].fieldType === 'dropdown' && !$scope.myform.form_fields[i].deletePreserved) {
							$rootScope.patientInfo[$scope.myform.form_fields[i].model] = $rootScope.patientInfo[$scope.myform.form_fields[i].model].option_value;
							data[$scope.myform.form_fields[i].model] = $rootScope.patientInfo[$scope.myform.form_fields[i].model]
						} else if ($scope.myform.form_fields[i].fieldType == 'signature') {
							form.signatureUrl = $rootScope.patientInfo[$scope.myform.form_fields[i].model];
							form.signatureId = form.form_fields[i]._id;
							if (form.form_fields[i].uploadUrl) {
								form.uploadUrl = form.form_fields[i].uploadUrl;
							}
						}

						if ($scope.myform.form_fields[i].fieldType == 'social_security_number') {
							$rootScope.patientInfo[$scope.myform.form_fields[i].model] = CryptoJS.AES.encrypt($scope.ssn, $rootScope.patientId);
						}

						if ($scope.myform.form_fields[i].fieldType != 'signature') {
							if ($scope.myform.form_fields[i].parent) {

								switch ($scope.myform.form_fields[i].parent) {
									case 'KeyValuePair':
										if (!data[$scope.myform.form_fields[i].parent]) {
											data[$scope.myform.form_fields[i].parent] = [];
										}
										data[$scope.myform.form_fields[i].parent].push({
											'Key': $scope.myform.form_fields[i].model,
											'Value': $rootScope.patientInfo[$scope.myform.form_fields[i].model]
										})
										break;

									case 'PhoneNumber':
									case 'Guarantor_Contact_phone':
										if ($rootScope.patientData && $rootScope.patientData.Patient[$scope.myform.form_fields[i].parent] && $rootScope.patientData.Patient[$scope.myform.form_fields[i].parent].length != 0) {
											data[$scope.myform.form_fields[i].parent] = $rootScope.patientData.Patient[$scope.myform.form_fields[i].parent];
										} else if (!data[$scope.myform.form_fields[i].parent]) {
											data[$scope.myform.form_fields[i].parent] = [];
										}

										if (data[$scope.myform.form_fields[i].parent].length != 0) {
											var phoneNumber = null;
											phoneNumber = _.filter(data[$scope.myform.form_fields[i].parent], function (phone) {
												return (phone.PHType == $scope.myform.form_fields[i].model);
											});
											if (phoneNumber.length != 0) {
												for (var j = 0; j < data[$scope.myform.form_fields[i].parent].length; j++) {
													if (data[$scope.myform.form_fields[i].parent][j].PHType == $scope.myform.form_fields[i].model) {
														data[$scope.myform.form_fields[i].parent][j] = {
															'PHType': $scope.myform.form_fields[i].model,
															'PHNumber': $rootScope.patientInfo[$scope.myform.form_fields[i].model],
															'Region': '+91'
														}
													}
												}
											} else {
												data[$scope.myform.form_fields[i].parent].push({
													'PHType': $scope.myform.form_fields[i].model,
													'PHNumber': $rootScope.patientInfo[$scope.myform.form_fields[i].model],
													'Region': '+91'
												})
											}
										} else {
											data[$scope.myform.form_fields[i].parent].push({
												'PHType': $scope.myform.form_fields[i].model,
												'PHNumber': $rootScope.patientInfo[$scope.myform.form_fields[i].model],
												'Region': '+91'
											})
										}
										break;

									case 'Address':
									case 'Guarantor_Contact_Address':
										if (data[$scope.myform.form_fields[i].parent] && data[$scope.myform.form_fields[i].parent].length != 0) {
											data[$scope.myform.form_fields[i].parent].push({
												'AddressLine1': $rootScope.patientInfo[$scope.myform.form_fields[i].model]
											})
										} else {
											data[$scope.myform.form_fields[i].parent] = [];
											data[$scope.myform.form_fields[i].parent].push({
												'AddressLine1': $rootScope.patientInfo[$scope.myform.form_fields[i].model]
											})
										}
										break;

									case 'EmailAddress':
										if (data[$scope.myform.form_fields[i].parent] && data[$scope.myform.form_fields[i].parent].length != 0) {
											data[$scope.myform.form_fields[i].parent].push({
												'Email': $rootScope.patientInfo[$scope.myform.form_fields[i].model]
											})
										} else {
											data[$scope.myform.form_fields[i].parent] = [];
											data[$scope.myform.form_fields[i].parent].push({
												'Email': $rootScope.patientInfo[$scope.myform.form_fields[i].model]
											})
										}
										break;

									default:
										break;
								}
							} else {
								console.log("$scope.myform.form_fields[i].model : ", $scope.myform.form_fields[i].model)
								console.log("$rootScope.patientInfo[$scope.myform.form_fields[i].model] : ", $rootScope.patientInfo[$scope.myform.form_fields[i].model])
								data[$scope.myform.form_fields[i].model] = $rootScope.patientInfo[$scope.myform.form_fields[i].model]
							}
						}


						//Get rid of unnessecary attributes for each form field
						delete form.form_fields[i].submissionId;
						delete form.form_fields[i].disabled;
						delete form.form_fields[i].ratingOptions;
						delete form.form_fields[i].fieldOptions;
						delete form.form_fields[i].logicJump;
						delete form.form_fields[i].description;
						delete form.form_fields[i].validFieldTypes;
						delete form.form_fields[i].fieldType;

					}

					localStorage.setItem("patientInfo", JSON.stringify($rootScope.patientInfo));

					setTimeout(function () {
						if (formAction) {
							window.location = formAction;
							window.scrollTo(0, 0);
						}
						if (form.signatureUrl) {

							var awsFile = AwsDocument.getFile(form.signatureUrl);

							var fileUploadUrl = '';

							if (form.uploadUrl) {
								fileUploadUrl = form.uploadUrl;
							}
							else {
								console.log("$rootScope.patientData : ", $rootScope.patientData);
								fileUploadUrl = $rootScope.patientData.uploadphoto;
							}


							AwsDocument.upload(awsFile, fileUploadUrl, function (result) {

								for (var i = 0; i < $scope.myform.form_fields.length; i++) {
									if (form.signatureId == form.form_fields[i]._id) {
										$rootScope.patientInfo[form.form_fields[i].model] = result;
										data[$scope.myform.form_fields[i].parent].push({
											'Key': form.form_fields[i].model,
											'Value': $rootScope.patientInfo[form.form_fields[i].model]
										})
									}
								}
								updatePatientData(data, formAction);
							}, function () {
								updatePatientData(data, formAction);
								return false;
							});


						} else {
							updatePatientData(data, formAction);
						}


					}, 500);
				};

				var saveFormDetail = function (form, formAction, _timeElapsed) {

					$scope.submitPromise = $http.post('/forms/' + $scope.myform._id, form)
						.success(function (data, status) {
							$scope.myform.submitted = true;
							$scope.loading = false;
							SendVisitorData.send(form, getActiveField(), _timeElapsed);
							if (formAction) {
								window.location.href = "http://" + window.location.hostname + "/" + formAction;
							}
						})
						.error(function (error) {
							$scope.loading = false;
							console.error(error);
							$scope.error = error.message;
							if (formAction) {
								window.location = "http://" + window.location.hostname + ":8887/" + formAction;
								setTimeout(function () {
									console.log("time to reload");
									//$scope.reloadForm();									 
									//$location.path(formAction);
									//$scope.fadeIn();
									//window.location.reload();
									$window.animate(window.scrollTo(0, 0));
								}, 100);
							}
						});


				}

				var updatePatientData = function (data, formAction) {
					console.log("data : ", data);

					var url = VIEW_FORM_API_URL.apiEndpoint + VIEW_FORM_API_URL.urls.UpdatePatient;

					dataFactory.put(data, url, function (data) {
						console.log("data : ", data);
						if (formAction) {
							window.location.href = window.location.origin + "/" + formAction + "?id=" + $rootScope.patientId;
						}
						else {
							// window.location = $scope.currentPageUrl;
						}

					}, function (reason) {
						console.log("reason : ", reason);
						toastr.error('Oops, something went wrong. Please try again later', 'Error');
						// window.location = $scope.currentPageUrl;
						return false;
					});

					//window.location = $scope.currentPageUrl;
				}

				//Reload our form
				$scope.reloadForm();
			}
		};
	}
]);