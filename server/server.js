
var Express = require('express');
var Http = require('http');
var fs = require('fs');

function paramWithName(paramName){
    var paramText = '--' + paramName + '=';
    var matchingParam = process.argv.find((v) => { return v.startsWith(paramText)});
    if(!matchingParam){
        return null;
    }
    return matchingParam.substring(paramText.length);
}

function loadConfig(){
    return {
        port: process.env.PORT || paramWithName("port") || 3002
    }
}

function init() {
    var config = loadConfig();
    console.log("PORT: " + config.port);
    startServer(config);
    console.log('Debug server listening on port ' + config.port);
}

function readMultipleFiles(paths, callback) {
    var count = 0;
    var len = paths.length;
    var data = [];
    var errs = [];

    var handler = function(error, content){
        count++;
        if (error){
            console.log('File not found:', error);
            errs.push(error);
        }
        else{
            data.push(content);
        }
        if (count == len) {
            callback(errs.length < 1 ? null : errs, data);
        }
    }

    paths.forEach((fpath) => fs.readFile(fpath, 'utf8', handler));
}

function contentFilesToJSON(fcontents) {
    var obj = {};
    fcontents.map((str) => {
        var data = JSON.parse(str);
        obj[data.id] = data;
    });
    return JSON.stringify(obj);
}

function filePathsFromIds(ids) {
    return ids.map(({ namespace, type, name}) => {
        return `server/content/${namespace}/${type}-${name}.json`;
    });
}

function startServer(config){
    var app = Express();
    var server = Http.createServer(app);

    app.use(Express.static('build', {
        setHeaders: function(res, path, stat){
            res.set('Access-Control-Allow-Origin', '*');
        }
    }));

    app.get('/content/', (req, res) => {
        var ids = req.query.ids.split(',').map((ids) => {
            var split = ids.split(':');
            return {
                namespace: split[0],
                type: split[1],
                name: split[2]
            };
        });

        console.log('Fetching', ids.length, 'ids');
        
        readMultipleFiles(filePathsFromIds(ids), (errs, content) => {
            let code, data;
            // console.log(content);
            if (errs) {
                code = 500;
                data = JSON.stringify(errs);
            } else {
                code = 200;
                data = contentFilesToJSON(content);
            }

            res.writeHead(code, {
                'Access-Control-Allow-Origin': '*'
            });

            res.end(data);
        });
    });

    server.listen(config.port);
}

init();
