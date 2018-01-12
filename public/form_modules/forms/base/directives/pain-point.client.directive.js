'use strict';

angular.module('view-form').directive('painPoint', function($rootScope) {
    return {
      
      restrict: 'A',
      link: function(scope, element, attrs) {

        	scope.cordinateList = { front: [], side: [] };

            element.bind('load', function() {

            	var cordinateDetail = $(element).parents('.pain-point-container').find('.pain-point-input').val();
         
                if(cordinateDetail){
                	var pointList = JSON.parse(cordinateDetail);

                	if(pointList[attrs.type]){
                		setExistPoint(pointList[attrs.type]);
                	}
                } 

            });

            function setExistPoint(pointList){

						var naturalWidth = $(element).get(0).naturalWidth;
						var width = $(element).width();

						var widthRatio = roundNumberValue(naturalWidth / width);

						for (var index = 0; index < pointList.length; index++) {

							var current_x_cordinate = roundNumberValue(pointList[index].pos_x / widthRatio);
							var current_y_cordinate = roundNumberValue(pointList[index].pos_y / widthRatio);

								var pointer_image_width = 13;

								var style = "position: absolute; top: " + (current_y_cordinate - (pointer_image_width / 2)) + "px; left: " + (current_x_cordinate - (pointer_image_width / 2)) + "px;";
								var img = $('<img />', {
									class: 'pointer-image',
									id: 'pointer_' + index,
									src: '/static/modules/core/img/pointt.png',
									style: style,
									width: pointer_image_width
								});
								
								$(element).after(img);
                                
								var cordinateDetail = { real_cordinate: { pos_x: pointList[index].pos_x, pos_y: pointList[index].pos_y }, virtual_cordinate: { pos_x: current_x_cordinate, pos_y: current_x_cordinate } };

								if (attrs.type == 'front') {
									scope.cordinateList.front.push(cordinateDetail);
								}
								else {
									scope.cordinateList.side.push(cordinateDetail);
								}

						}

            }
            
            scope.setPoint = function(event){

                    var type = angular.element(event.target).attr("data-type");
					var naturalWidth = $(element).get(0).naturalWidth;
					var width = $(element).width();

					var widthRatio = roundNumberValue(naturalWidth / width);

					var offset = angular.element(event.target).offset();

					var pos_x = event.offsetX ? (event.offsetX) : event.pageX - offset.left;
					var pos_y = event.offsetY ? (event.offsetY) : event.pageY - offset.top;

					var real_pos_x = roundNumberValue(pos_x * widthRatio);
					var real_pos_y = roundNumberValue(pos_y * widthRatio);

					var cordinateDetail = { real_cordinate: { pos_x: real_pos_x, pos_y: real_pos_y }, virtual_cordinate: { pos_x: pos_x, pos_y: pos_y } };
 
					if (type == 'front') {
						scope.cordinateList.front.push(cordinateDetail);
					}
					else {
						scope.cordinateList.side.push(cordinateDetail);
					}

					var pointer_image_width = 13;
                    
					var style = "position: absolute; top: " + (pos_y - (pointer_image_width / 2)) + "px; left: " + (pos_x - (pointer_image_width / 2)) + "px;";
					var img = $('<img />', {
						class: 'pointer-image',
						id: 'pointer_' + ( (type == 'front') ? (scope.cordinateList.front.length - 1) : (scope.cordinateList.side.length - 1) ),
						src: '/static/modules/core/img/pointt.png',
						style: style,
						width: pointer_image_width
					});

					angular.element(event.target).after(img);


					var cordinateListContent = { front: [], side: [] };

					for (var key in scope.cordinateList) {

						for (var index = 0; index < scope.cordinateList[key].length; index++) {
							cordinateListContent[key].push(scope.cordinateList[key][index].real_cordinate);
						}

					}

                    $rootScope.patientInfo[attrs.modelName] = JSON.stringify(cordinateListContent);

			}

			function roundNumberValue(number) {
				return Number(number.toFixed(2));
			}

        }
    };
}).controller('pain-point-controller', function($rootScope,$scope){
	$scope.clearPoint = function(event){
       
         var modelName = $(event.target).attr("data-model-name");
         $rootScope.patientInfo[modelName] = "";
		 $scope.cordinateList = { front: [], side: [] };
		 angular.element(".pointer-image").remove();

	};
});