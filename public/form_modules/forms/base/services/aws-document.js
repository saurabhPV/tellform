'use strict';

//Document upload service used for upload document on aws
angular.module('view-form').service('AwsDocument',
	function($http){
		//Private variables
	    this.upload = function(docFile,url,success,error) {
           
               // var fd = new FormData();
               // fd.append('file', docFile);
            
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



               // $http.put(url, fd, {                
               //    headers : {'Content-Type': docFile.type}
               // })            
               // .success(function(result){
               //   console.log("success");
               //   console.log(result);
               //   success(result);                
               // })            
               // .error(function(result){
               //    console.log("fail");
               //    console.log(result);
               //    error(result);                
               // });


          //  var current_url = "https://api.github.com/users";
          // //  success(url); 
          //   // $.ajax({
          //   //      url: url, // the presigned URL
          //   //      type: 'PUT',
          //   //      data: docFile,
          //   //      processData : false,
          //   //      contentType: docFile.type,
          //   //      crossDomain:true,
          //   //      cache:false,
          //   //      success: function(response) {
          //   //        success(response);
          //   //      },
          //   //      error: function(response) {
          //   //        error(response);
          //   //      }
          //   //  });

          //   $http.get(current_url).then(success,error);
            // $http.put(url, {data: docFile}).then(function(result){
            //      console.log(result);
            //      success(result);
            // }, function(result){
            //       console.log(result);
            //       error(result);
            // });




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
