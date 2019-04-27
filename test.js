// 여기까지 작업 끝
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