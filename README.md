# angular-webdav-uploader

Javascript uploader using angularJS and Sara Nl.

Required Lib :https://github.com/sara-nl/js-webdav-client

#Content

Factorys:
upload
  enqueue(file, subPath, callBack);
  dequeue(index);
  getQueue();
file
  upload()
  executeCallBack(a , b)
  isSuccess()
  getFileUrl()
Directives:
  fileread
  
#Usage Js

Include uploadManager on the |rootScope| and |upload| class in the controller
Declaration
```
var host        = "google.com";
var port        = 8080;
var path        = "upload/";
var useHTTPS    = false;
$rootScope.uploader = new upload(host, port, path, useHTTPS);
```
#Usage Js

```
<input type="file" fileread="uploader" path="file/" upload-model="uploadModel" call-back="callBack"/>
```

fileread        -> a object type upload (usually this object is setted in rootScope)
path            -> the upload subFolder path
upload-model    -> the array of the all the uploads on this field
call-back       -> Call back function to execut after the upload be completed
