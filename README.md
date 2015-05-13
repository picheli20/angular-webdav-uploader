# angular-webdav-uploader

Javascript uploader using angularJS and Sara Nl.

Required Lib :https://github.com/sara-nl/js-webdav-client

#Content Classes
```
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
```
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
#Queue example

```
<div class="uploadMenu" ng-show="root.uploader.getQueue().length != 0">
    <div class="col-md-12" ng-click="showUploadQueued = !showUploadQueued">
        <i class="fa fa-cloud-upload"></i>
    </div>
    <div ng-show="showUploadQueued" class="uploadPopup">
        <ul style="margin: 0;">
            <li ng-repeat="item in root.uploader.getQueue()" ng-class="{'isError' : item._status >= 300, 'isSuccess': item._status >= 200 && item._status < 300}">
                <i class="fa" ng-class="{'fa-exclamation-circle' : item._status >= 300, 'fa-check-circle': item._status >= 200 && item._status < 300, 'fa-play-circle': item._status == 0}"></i>
                {{item.getFileName()}}
                <button type="button" class="btn btn-danger" ng-click="root.uploader.dequeue($index)">
                    <span class="glyphicon glyphicon-trash"></span>
                </button>
            </li>
        </ul>
    </div>
 </div>
 ```

#Usage Html

```
<input type="file" fileread="uploader" path="file/" upload-model="uploadModel" call-back="callBack"/>
```

fileread        -> a object type upload (usually this object is setted in rootScope)
path            -> the upload subFolder path
upload-model    -> the array of the all the uploads on this field
call-back       -> Call back function to execut after the upload be completed
