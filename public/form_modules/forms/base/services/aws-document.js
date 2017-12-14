'use strict';

//Document upload service used for upload document on aws
angular.module('view-form').service('AwsDocument',
	function($http){

	    this.upload = function(docFile,url,success,error) {
                       
               $http({
                      url: url,
                      headers: {'Content-Type': docFile.type },
                      method: 'put',
                      data: docFile,
                      processData : false,
                      contentType: docFile.type
               })
               .success(function(result){
                 console.log("success");
                 console.log(result);

                 var image_url = url.split("?");                 
                 success(image_url[0]);                
               })            
               .error(function(result){
                  console.log("fail");
                  console.log(result);
                  error(result);                
               });               

	    };

          this.dataURItoBlob = function(dataURI, type){
                // convert base64 to raw binary data held in a string
                var byteString = self.atob(dataURI.split(',')[1]);
            
                // separate out the mime component
                //var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
            
                // write the bytes of the string to an ArrayBuffer
                var ab = new ArrayBuffer(byteString.length);
                var ia = new Uint8Array(ab);
                for (var i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
            
                // write the ArrayBuffer to a blob, and you're done
                var bb = new Blob([ab], { type: type });
                return bb;
           };

           this.getFile = function(dataUri){
                var file = [];
                var type = "image/png";
                file.push(new File([this.dataURItoBlob(dataUri, type)], 'file.png', {type: type}));        
                return file[0];
           };

    }
);
