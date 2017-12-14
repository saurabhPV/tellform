'use strict';

//Forms service used for communicating with the forms REST endpoints
angular.module('view-form').factory('dataFactory', ['$resource', 'VIEW_FORM_API_URL',
    function ($resource, VIEW_FORM_API_URL) {
        return $resource(VIEW_FORM_API_URL.apiEndpoint, {
            pageName: '@_id'
        }, {
                'get': {
                    method: 'GET',
                    transformResponse: function (data, header) {
                        var form = angular.fromJson(data);
                        return form;
                    }
                },
                'update': {
                    method: 'PUT'
                },
                'save': {
                    method: 'POST'
                }
            });
    }
]);
