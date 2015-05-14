angular.module("webdavUploader",[])
.factory("upload", ["file", function(file){
    function upload(host, port, path, useHTTPS){
        if(useHTTPS)
            this._url = "https://" + host + ":" + port + "/" + path;
        else
            this._url = "http://" + host + ":" + port + "/" + path;

        this._host = host;
        this._port = port;
        this._path = path;
        this._useHTTPS = useHTTPS;
    };

    upload.prototype = {
        _files : [],
        _host : null,
        _port : null,
        _path : null,
        _url : null,
        _useHTTPS : null,
        enqueue : function(uploadedFile, subPath, callBack){
            var newFile = new file(subPath, uploadedFile, callBack, this._host, this._port, this._path, this._useHTTPS);
            this._files.unshift(newFile);
            return newFile;
        },
        dequeue : function(index){
            this._files.splice(index, 1)
        },
        getQueue : function(){
            return this._files;
        }
    };
    return upload;
}])

.factory("file", [function(){
    function guid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }
    function upload(subPath, file, callBack, host, port, path, useHTTPS){
        this._sara = new nl.sara.webdav.Client({"host" : host, "port" : port, "useHTTPS" : useHTTPS});
        this._useHTTPS = useHTTPS;
        this._file = file;
        this._fileName = guid() + "-" +file.name;
        this._subPath = subPath;
        this._callback = callBack;
        this._host = host;
        this._port = port;
        this._path = path;
    };

    upload.prototype = {
        _file : null,
        _fileName : null,
        _callback : null,
        _scope : null,
        _host : null,
        _port : null,
        _path : null,
        _subPath : null,
        _useHTTPS : null,
        _sara : null,
        _canExecuteCallBack : false,
        _status : 0,
        upload : function(){
            var scope = this;
            this._sara.put(this._path + this._subPath + this._fileName, function(resp, content){
                scope._status = resp;
                scope.executeCallBack(scope);
            }, this._file);
        },
        executeCallBack : function(file){
            if(this._canExecuteCallBack) this._callback(file);
        },
        setExecuteCallBack : function(v){
            this._canExecuteCallBack = v;
        },
        isSuccess : function(){
            return this._status >= 200 && this._status < 300;
        },
        getFileName : function(){
            return this._file.name;
        },
        getFileUrl : function(){
            if(!this.isSuccess) return false;
            var http = "";
            if(this._useHTTPS)
                http = "https://";
            else
                http = "http://";

            // return http + this._host + ":" + this._port + "/" + this._path + this._subPath + this._fileName;
            return this._fileName;
        }
    };
    return upload;
}])

.directive("fileread", [function () {
    return {
        scope: {
            fileread: "=",
            uploadModel: "=",
            callBack: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        var file = changeEvent.target.files[0];
                        var path = attributes.path;
                        var uploadObj = scope.fileread.enqueue(file, path, scope.callBack);
                        scope.uploadModel.unshift(uploadObj);
                        uploadObj.upload();
                    });
                }
                reader.readAsArrayBuffer(changeEvent.target.files[0]);
            });
        }
    }
}]);
