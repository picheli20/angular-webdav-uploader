angular.module("uploadManager", [])
    .factory("upload", ["file",
        function(file) {
            function upload(host, port, path, useHTTPS) {
                if (useHTTPS)
                    this._url = "https://" + host + ":" + port + "/" + path;
                else
                    this._url = "http://" + host + ":" + port + "/" + path;

                this._host = host;
                this._port = port;
                this._path = path;
                this._useHTTPS = useHTTPS;
            };

            upload.prototype = {
                _files: [],
                _host: null,
                _port: null,
                _path: null,
                _url: null,
                _useHTTPS: null,
                enqueue: function(fileName, uploadedFile, subPath, callBack) {
                    var newFile = new file(fileName, subPath, uploadedFile, callBack, this._host, this._port, this._path, this._useHTTPS);
                    this._files.unshift(newFile);
                    return newFile;
                },
                dequeue: function(index) {
                    this._files[index].abort();
                    this._files.splice(index, 1);
                },
                hasPedding: function() {
                    var count = 0;
                    for (var i = 0; i < this._files.length; i++) {
                        if (this._files[i]._status == 0)
                            count++;
                    }
                    return count;
                },
                getQueue: function() {
                    return this._files;
                }
            };
            return upload;
        }
    ])

.factory("file", ["Slug", "general", "$http", "$rootScope",
    function(Slug, general, $http, $rootScope) {
        function upload(fileName, subPath, file, callBack, host, port, path, useHTTPS) {
            // this._sara = new nl.sara.webdav.Client({"host" : host, "port" : port, "useHTTPS" : useHTTPS});
            this._useHTTPS = useHTTPS;
            this._file = file;
            this._fileName = guid() + "-" + Slug.slugify(file.name);
            this._subPath = subPath;
            this._callback = callBack;
            this._host = host;
            this._port = port;
            this._path = path;
            this._ajax = new XMLHttpRequest();
        };

        upload.prototype = {
            _file: null,
            _fileName: null,
            _callback: null,
            _content: null,
            _scope: null,
            _ajax: null,
            _host: null,
            _port: null,
            _path: null,
            _subPath: null,
            _useHTTPS: null,
            _sara: null,
            _canExecuteCallBack: false,
            _status: 0,
            total: null,
            loaded: null,
            percentComplete: 0,
            upload: function() {
                var scope = this;
                var ajax = this._ajax;
                ajax.open("PUT", this._path + this._subPath + this._fileName, true);
                ajax.upload.fileScope = this;
                ajax.fileScope = this;
                ajax.upload.onprogress = scope.updateProgress;
                ajax.addEventListener("load", scope.transferComplete, false);
                ajax.addEventListener("error", scope.transferFailed, false);
                ajax.send(this._file);
            },
            updateProgress: function(evt) {
                var fileScope = this.fileScope;
                $rootScope.$apply(function() {
                    try{
                        fileScope.percentComplete = (evt.loaded / evt.total) * 100;
                        fileScope.total = evt.total;
                        fileScope.loaded = evt.loaded;
                        // console.log(evt.loaded + " of " + evt.total + " - (" + ((evt.loaded / evt.total) * 100) + "%)");
                    }catch(error){
                        console.log(error);
                    }
                });
            },
            isUploading : function(){
                return this._status == 0
            },
            transferComplete: function(evt) {
                var fileScope = this.fileScope;
                try {
                    fileScope._content = JSON.parse(evt.target.response);
                } catch (err) {
                    console.log('JSON not parsed: ', err);
                }
                fileScope._status = evt.target.status;
                if (fileScope._subPath != "job/") {
                    fileScope._callback(fileScope, fileScope._content);
                } else if (fileScope._canExecuteCallBack) {
                    fileScope._callback(fileScope, fileScope._content);
                }
            },
            transferFailed: function(evt) {
                console.log('transferFailed', evt);
                // general.alert(evt + " -  Error during file upload", "danger");
            },
            abort : function(){
                this._ajax.abort();
                this._status = null;
            },
            setExecuteCallBack: function(v) {
                this._canExecuteCallBack = v;
            },
            isSuccess: function() {
                return this._status >= 200 && this._status < 300;
            },
            getFileName: function() {
                return this._file.name;
            },
            getFileUrl: function() {
                if (!this.isSuccess) return false;
                var http = "";
                if (this._useHTTPS)
                    http = "https://";
                else
                    http = "http://";

                return http + this._host + ":" + this._port + "/" + this._path + this._subPath + this._fileName;
                // return this._fileName;
            }
        };
        return upload;
    }
])

.directive("fileread", [
    function() {
        return {
            scope: {
                fileread: "=",
                uploadModel: "=",
                callBack: "="
            },
            link: function(scope, element, attributes) {
                element.bind("change", function(changeEvent) {
                    var reader = new FileReader();
                    reader.onload = function(loadEvent) {
                        if (scope.uploadModel.length == 0)
                            fileName = guid();

                        var file = changeEvent.target.files[0];
                        var name = fileName + file.name.substring(file.name.length - 4, file.name.length);

                        var uploadObj = scope.fileread.enqueue(name, file, attributes.path, scope.callBack);
                        scope.uploadModel.unshift(uploadObj);
                        uploadObj.upload();
                    }
                    reader.readAsArrayBuffer(changeEvent.target.files[0]);
                });
            }
        }
    }
]);

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
