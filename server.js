var http = require('http');
var fs = require('fs');
var url = require('url');
var express = require('express');

const ajaxHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
  'Access-Control-Max-Age': 2592000, // 30 days
  'Content-Type':'application/json; charset=utf-8',
};

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var path = url.parse(_url, true).pathname;
    var qs = require('querystring');
    var date, resvList = new Array();
    console.log(path + '::' + JSON.stringify(queryData));
    if(path == '/'){
      path = '/index.html';
    }
    if(path == '/index.html'){
      response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
      response.end(fs.readFileSync(__dirname + path), 'utf8');
    }
    else if(path == '/tdData'){
      var jsonData;
      date = getWeekStart(!queryData || typeof queryData.pmw == 'undefined' ? 0 : queryData.pmw);
        console.log('pmw == ' + queryData.pmw);
      resvList = getTT(date);
      resvList.push(date);
        console.log(resvList);
      jsonData = JSON.stringify(resvList);
      response.writeHead(200, ajaxHeaders);
        console.log('json: ' + jsonData);
      response.write(jsonData);
      response.end();
      return;

    }
    else if(path == '/reservfin'){
      var body = '';
      var time, dParts;
      request.on('data', function(data){
        body += data;
        if(body.length > 1e6) request.connection.destroy();
      });
      console.log(body);
      request.on('end', function(){
        queryData = new Object(qs.parse(body));
        time = JSON.parse(queryData.times);
        dParts = queryData.date.split('/');
        var stDay = getWeekStart(0, new Date(dParts[0], 1*dParts[1] - 1, dParts[2]));
        console.log('queryDate: ' + queryData.date + '<>dParts: ' + JSON.stringify(dParts) + '::' + (dParts[1] - 1));
        var spliter = stDay.getFullYear().toString() + (1*stDay.getMonth() + 1) + stDay.getDate();

        for(var i = 0; i < time.length; i++){
          console.log('trying');
          var input = '\r\n' + queryData.date + '$' + time[i] + '$' + queryData.name + '$' + queryData.depart + '$' + queryData.uid + '$' + queryData.num + '$' + queryData.phone + '$' + queryData.pw;
          try {
            fData = fs.readFileSync(spliter + ".dat", 'utf8');
            if(fData.indexOf(queryData.date + '$' + time[i]) !== -1){
              console.log('중복된 예약 시도: ' + queryData.date + ':' + time[i])
              response.writeHead(200, ajaxHeaders);
              response.end(time[i]);
              return;
            }
            fs.appendFileSync(spliter + ".dat", input, 'utf8');
            console.log(input + 'is saved to ' + spliter);
          } catch (e) {
            fs.writeFile(spliter + ".dat", input, 'utf8', function (err) {
              if (err) throw err;
              console.log('File ' + spliter + ' is created');
            });
          }

          response.writeHead(200, ajaxHeaders);
          response.end();
        }
      });


    }

    if(path == '/readreserv'){
      var tmpSplit, splitData, tmpDate;
      var json = new Object();
      var body = ''
      request.on('data', function(data){
        body += data;
        if(body.length > 1e6) request.connection.destroy();
      });
      request.on('end', function(){
        queryData = new Object(qs.parse(body));
        tmpSplit = queryData.reservNo.split('$')
        tmpSplit = tmpSplit[0].split('/');
        tmpDate = getWeekStart(0, new Date(tmpSplit[0], 1*tmpSplit[1] - 1, tmpSplit[2]));
        var spliter = tmpDate.getFullYear().toString() + (1*tmpDate.getMonth() + 1) + tmpDate.getDate();
        console.log(JSON.stringify(queryData) + " spliter: " + spliter);
        try {
          fData = fs.readFileSync(spliter + ".dat", 'utf8');
          tmpSplit = fData.split("\r\n");
          for(var i = 0; i < tmpSplit.length; i++){
            if(tmpSplit[i].startsWith(queryData.reservNo)){
              splitData = tmpSplit[i].split('$');
              if(splitData[7] == queryData.pw){
                json.name = splitData[2];
                json.num = splitData[5];
                json.time = splitData[0] + '-' + splitData[1];
                response.writeHead(200, ajaxHeaders);
                response.end(JSON.stringify(json));
              }
              else{
                response.writeHead(200, ajaxHeaders);
                response.end("Wrong");
              }
            }
          }
        } catch (e) {
          console.log('/readreserv : Unknown request');
          return;
        }
      });
    }

    if(path == '/delreserv'){
      var tmpSplit, splitData, tmpDate;
      var json = new Object();
      var body = ''
      request.on('data', function(data){
        body += data;
        if(body.length > 1e6) request.connection.destroy();
      });
      request.on('end', function(){
        queryData = new Object(qs.parse(body));
        tmpSplit = queryData.reservNo.split('$')
        tmpSplit = tmpSplit[0].split('/');
        tmpDate = getWeekStart(0, new Date(tmpSplit[0], 1*tmpSplit[1] - 1, tmpSplit[2]));
        var spliter = tmpDate.getFullYear().toString() + (1*tmpDate.getMonth() + 1) + tmpDate.getDate();
        console.log(JSON.stringify(queryData) + " spliter: " + spliter);
        try {
          fData = fs.readFileSync(spliter + ".dat", 'utf8');
          tmpSplit = fData.split("\r\n");
          for(var i = 0; i < tmpSplit.length; i++){
            if(tmpSplit[i].startsWith(queryData.reservNo)){
              splitData = tmpSplit[i].split('$');
              if(splitData[7] == queryData.pw){
                tmpSplit.splice(i, 1);
                fs.writeFile(spliter + ".dat", tmpSplit.join('\r\n'), 'utf8', function (err) {
                  if (err) throw err;
                  console.log('File ' + spliter + ' is created');
                });
                json.result = 'Success';
                response.writeHead(200, ajaxHeaders);
                response.end(JSON.stringify(json)); //TOFIX
              }
              else{
                response.writeHead(200, ajaxHeaders);
                response.end("Wrong request");
              }
            }
          }
        } catch (e) {
          console.log('/delreserv : Unknown request');
          return;
        }
      });
    }

    if(path == '/favicon.ico'){
      response.writeHead(404);
      response.end();
      return;
    }


});

app.listen(3000);

function getWeekStart(pmWeek, day){
  var today;
  var dd, mm, yyyy, wd;
  var date = new Object();

  today = typeof(day) == 'undefined' ? new Date() : day;
  wd = -1 * today.getDay() + 1;

    console.log('getWeekStart called: pmWeek == ' + pmWeek + ' wd == ' + wd);

  today.setDate(today.getDate() + wd - pmWeek * 7);
  console.log(today);
  return today;
}

function getTT(stDay){
  console.log(stDay);
  var spliter = stDay.getFullYear().toString() + (1*stDay.getMonth() + 1) + stDay.getDate();
  var resvObj = new Array();
  var tmpObj = new Object();
  var fData, tmpData, resvList;
  console.log('getTT called: spliter == ' + spliter);
  try {
    fData = fs.readFileSync(spliter + ".dat", 'utf8');
  } catch (e) {
    fs.writeFile(spliter + ".dat", '', 'utf8', function (err) {
      if (err) throw err;
      console.log('Saved!');
    });
    console.log('File ' + spliter + ' is created');
    return;
  }
  console.log('fData: ' + fData);
  resvList = fData.split("\n");
  for(var i = 0; i < resvList.length; i++){
      tmpData = resvList[i].split('$')
      tmpObj.date = tmpData[0];
      tmpObj.time = tmpData[1]
      tmpObj.uid = tmpData[4];
      tmpObj.pw = tmpData[7];

      console.log('rsvlst: ' + resvList[i] + '\n' + JSON.stringify(tmpObj) + '\n');
      resvObj.push(JSON.parse(JSON.stringify(tmpObj)));
  }

  return resvObj;
}

function validateDate(date) {
  var regEx = /^\d{4}-\d{2}-\d{2}$/;
  if(!date.match(regEx)) return false;  // Invalid format
  var d = new Date(date);
  if(Number.isNaN(d.getTime())) return false; // Invalid date
  return d.toISOString().slice(0,10) === date;
}
