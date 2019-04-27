var http = require('http');
var fs = require('fs');
var url = require('url');
var express = require('express');

const ajaxHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
    'Access-Control-Max-Age': 2592000, // 30 days
    'Content-Type': 'application/json; charset=utf-8',
};

var app = http.createServer(function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var path = url.parse(_url, true).pathname;
    var qs = require('querystring');
    var date, resvList = new Array();
    console.log('::Connection Requested::');
    if (request.method !== 'POST' && queryData === '') path = '/index.html';
    if (path == '/') {
        path = '/index.html';
    }
    if (path == '/index.html') {
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        response.end(fs.readFileSync(__dirname + path), 'utf8');
        return;
    }

    if (path == '/tdData') {
        var jsonData;
        date = getWeekStart(!queryData || typeof queryData.pmw == 'undefined' ? 0 : queryData.pmw);
        console.log(' [/tdData] requested with pmw == ' + queryData.pmw);
        resvList = getTT(date);
        resvList.push(date);
        jsonData = JSON.stringify(resvList);
        response.writeHead(200, ajaxHeaders);
        response.write(jsonData);
        response.end();
        console.log(' [/tdData] Finished');
        return;
    }

    if (path == '/reservfin') {
        var body = '',
            fullData = '',
            fData = '';
        var time, dParts, output = 'Success';
        console.log(' [/reservfin] requested');
        request.on('data', function(data) {
            body += data;
            if (body.length > 1e6) request.connection.destroy();
        });
        request.on('end', function() {
            queryData = new Object(qs.parse(body));
            time = JSON.parse(queryData.times);
            var spliter = parse_Spliter(queryData.date);

            try {
                fData = fs.readFileSync(spliter + ".dat", 'utf8');
            } catch (e) {
                fs.writeFile(spliter + ".dat", input, 'utf8', function(err) {
                    if (err) {
                        console.log(' [/reservfin] : Error occurred during write file');
                        response.writeHead(500, ajaxHeaders);
                        response.end("Error");
                        return;
                    }
                    console.log(' [/reservfin] : File ' + spliter + ' is created');
                });
            }

            for (var i = 0; i < time.length; i++) {
                var input = '\r\n' + queryData.date + '$' + time[i] + '$' + queryData.name + '$' + queryData.depart + '$' + queryData.uid + '$' + queryData.num + '$' + queryData.phone + '$' + queryData.pw;
                console.log(' [/reservfin] : Trying to save reservation information - ' + input);
                if (fData.indexOf(queryData.date + '$' + time[i]) !== -1) {
                    console.log(' [/reservfin] : 중복된 예약 시도: ' + queryData.date + ':' + time[i]);
                    output = time[i];
                    break;
                }
                fullData = fullData + input;
                console.log(' [/reservfin] : ' + input + ' will be saved to ' + spliter);
            }
            if (output == 'Success') {
                try {
                    fs.appendFileSync(spliter + ".dat", fullData, 'utf8');
                } catch (e) {
                    console.log(' [/reservfin] : Error occurred during write file');
                    response.writeHead(500, ajaxHeaders);
                    response.end("Error");
                }
            }
            response.writeHead(200, ajaxHeaders);
            response.end(output);
            console.log(' [/reservfin] : Finished');
        });
    }

    if (path == '/readreserv' || path == '/delreserv') {
        var tmpSplit, splitData, tmpDate;
        var json = new Object();
        var body = ''
        console.log(' [' + path + '] requested');
        request.on('data', function(data) {
            body += data;
            if (body.length > 1e6) request.connection.destroy();
        });
        console.log(' [' + path + '] : Data posted : ' + body);
        request.on('end', function() {
            queryData = new Object(qs.parse(body));
            var spliter = parse_Spliter(queryData.reservNo.split('$')[0]);
            //console.log(JSON.stringify(queryData) + " spliter: " + spliter);
            try {
                fData = fs.readFileSync(spliter + ".dat", 'utf8');
                tmpSplit = fData.split("\r\n");
                for (var i = 0; i < tmpSplit.length; i++) {
                    if (tmpSplit[i].startsWith(queryData.reservNo)) {
                        splitData = tmpSplit[i].split('$');
                        if (splitData[7] == queryData.pw) {
                            console.log(' [' + path + '] : Data found - ' + tmpSplit);
                            if (path == '/readreserv') {
                                json.name = splitData[2];
                                json.num = splitData[5];
                                json.time = splitData[0] + '-' + splitData[1];
                            } else {
                                tmpSplit.splice(i, 1);
                                fs.writeFile(spliter + ".dat", tmpSplit.join('\r\n'), 'utf8', function(err) {
                                    if (err) {
                                        console.log(' [/reservfin] : Error occurred during write file');
                                        response.writeHead(500, ajaxHeaders);
                                        response.end("Error");
                                        return;
                                    }
                                    console.log(' [' + path + '] : File ' + spliter + ' is created');
                                });
                                json.result = 'Success';
                            }
                        } else {
                            json.result = "Wrong"
                        }
                        response.writeHead(200, ajaxHeaders);
                        response.end(JSON.stringify(json)); //TOFIX
                        console.log(' [' + path + ']' + ' Finished');
                        return;
                    }
                }

            } catch (e) {
                console.log(path + ' : Unknown request');
                return;
            }
        });
    }

    if (path == '/favicon.ico') {
        response.writeHead(404);
        response.end();
        return;
    }
});

app.listen(3000);

function getPostData(request) {
    var body = '';
    request.on('data', function(data) {
        body += data;
        if (body.length > 1e6) request.connection.destroy();
    });
    return body;
}

function parse_Spliter(date) {
    var tmpSplit;
    tmpSplit = date.split('/');
    tmpDate = getWeekStart(0, new Date(tmpSplit[0], (1 * tmpSplit[1] - 1), tmpSplit[2]));
    return getSpliter(tmpDate);
}

function getSpliter(tmpDate) {
    var tmpMonth, tmpDay;
    tmpMonth = (1 * tmpDate.getMonth() + 1);
    tmpDay = tmpDate.getDate();
    //console.log('getspliter: ' +  tmpDate.getFullYear().toString() + (tmpMonth < 10 ? '0' + tmpMonth : tmpMonth) + (tmpDay < 10 ? '0' + tmpDay : tmpDay));
    return tmpDate.getFullYear().toString() + (tmpMonth < 10 ? '0' + tmpMonth : tmpMonth) + (tmpDay < 10 ? '0' + tmpDay : tmpDay);
}

function getWeekStart(pmWeek, day) {
    var today;
    var dd, mm, yyyy, wd;
    var date = new Object();

    today = typeof(day) == 'undefined' ? new Date() : day;
    wd = -1 * today.getDay() + 1;
    if (wd == -5) wd = 2;
    //console.log('getWeekStart called: pmWeek == ' + pmWeek + ' wd == ' + wd);

    today.setDate(today.getDate() + wd - pmWeek * 7);
    //console.log(today);
    return today;
}

function getTT(stDay) {
    //console.log(stDay);
    var spliter = getSpliter(stDay);
    var resvObj = new Array();
    var tmpObj = new Object();
    var fData, tmpData, resvList;
    //console.log('getTT called: spliter == ' + spliter);
    try {
        fData = fs.readFileSync(spliter + ".dat", 'utf8');
        resvList = fData.split("\n");
        for (var i = 0; i < resvList.length; i++) {
            tmpData = resvList[i].split('$')
            tmpObj.date = tmpData[0];
            tmpObj.time = tmpData[1]
            tmpObj.uid = tmpData[4];
            tmpObj.pw = tmpData[7];
            resvObj.push(JSON.parse(JSON.stringify(tmpObj)));
        }
    } catch (e) {
        fs.writeFileSync(spliter + ".dat", '', 'utf8', function(err) {
            if (err) throw err;
        });
    }
    return resvObj;
}