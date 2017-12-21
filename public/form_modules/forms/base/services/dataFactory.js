'use strict';

//Document upload service used for upload document on aws
angular.module('view-form').service('dataFactory',
    function ($http) {

        this.get = function (url, success, error) {

            $http({
                url: url,
                method: 'get'
            })
                .success(function (result) {
                    console.log("success");
                    console.log(result);
                    success(result);
                })
                .error(function (result) {
                    console.log("fail");
                    console.log(result);
                    error(result);
                });

        };

        this.put = function (data, url, success, error) {

            $http({
                async: true,
                crossDomain: true,
                url: url,
                method: 'PUT',
                'headers': {
                    'content-type': 'application/json'
                },
                processData: false,
                data: data,
                'crossDomain': true
            })
                .success(function (result) {
                    console.log("success");
                    console.log(result);
                    success(result);
                })
                .error(function (result) {
                    console.log("fail");
                    console.log(result);
                    error(result);
                });

        };

    }
);

