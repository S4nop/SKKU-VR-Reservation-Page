const fs = require('fs');

module.exports = {
  loadResv : function (req, res) {
    date = getWeekStart(req.body['pmw']);
    resvList = getTT(date);
    resvList.push(date);;
    res.json(resvList);
    return;
  },
  cmtResv: function(req, res) {
    var fullData = '';
    var output = new Object(); output.status = true;
    var time = req.body['times'];

    var spliter = parse_Spliter(req.body['date']);

    try {
      fData = fs.readFileSync(spliter + ".dat", 'utf8');
    } catch (e) {
      fs.writeFile(spliter + ".dat", input, 'utf8', function(err) {
        if (err)
          res.status(500).send({ error: 'Something failed!' });
      });
    }

    for (var i = 0; i < time.length; i++) {
      var input = '\n' +
          req.body['date'] + '$' + 
          time[i] + '$' + 
          req.body['name'] + '$' +
          req.body['depart'] + '$' +
          req.body['uid'] + '$' +
          req.body['num'] + '$' +
          req.body['phone'] + '$' +
          req.body['pw'];

      if (fData.indexOf(req.body['date'] + '$' + time[i]) !== -1) {
        // 중복    
        output.status = false;
        output.data = time[i];
        break;
      }

      fullData = fullData + input;
    }

    if (output.status) {
      try {
        fs.appendFileSync(spliter + ".dat", fullData, 'utf8');
      } catch (e) {
        res.status(500).send({ error: 'Something failed!' });
      }
      res.json(output);
    }
  },
  chkResv: function(req, res, onDel) {
    var tmpSplit, splitData;
    var json = new Object();
    var spliter = parse_Spliter(req.body['resvname'].split('$')[0]);

    try {
      fData = fs.readFileSync(spliter + ".dat", 'utf8');
        
      tmpSplit = fData.split("\n");

      for (var i = 0; i < tmpSplit.length; i++) {
        if (tmpSplit[i].startsWith(req.body['resvname'])) {
          
          splitData = tmpSplit[i].split('$');

          if (splitData[7] == req.body['pw']) {
            json.name = splitData[2];
            json.num = splitData[5];
            json.time = splitData[0] + '-' + splitData[1];
            json.result = true;

            if(onDel) {
                tmpSplit.splice(i, 1);
                fs.writeFile(spliter + ".dat", tmpSplit.join('\n'), 'utf8', function(err) {
                    if (err)
                      res.status(500).send({ error: 'Something failed!' });
                    res.json(json);
                    return;
                });
            }
          } else {
            json.result = false;
          }

          return json;
        }
      }
    } catch (e) {
      res.status(500).send({ error: 'Something failed!' });
    }
  }
}

function getTT(stDay) {
    var spliter = getSpliter(stDay);
    var resvObj = new Array();
    var tmpObj = new Object();
    var fData, tmpData, resvList;
    
    try {
        fData = fs.readFileSync(spliter + ".dat", 'utf8');
        resvList = fData.split("\n");
        for (var i = 0; i < resvList.length; i++) {
            tmpData = resvList[i].split('$')
            tmpObj.date = tmpData[0];
            tmpObj.time = tmpData[1]
            tmpObj.uid = tmpData[4];
            tmpObj.pw = tmpData[7];
            resvObj.push(tmpObj);
        }
    } catch (e) {
        fs.writeFileSync(spliter + ".dat", '', 'utf8', function(err) {
            if (err) throw err;
        });
    }
    return resvObj;
}


function getWeekStart(pmWeek, day) {
  var today;
  var dd, mm, yyyy, wd;
  var date = new Object();

  today = typeof(day) == 'undefined' ? new Date() : day;
  wd = -1 * today.getDay() + 1;
  if(wd == -5) 
    wd = 2;

  today.setDate(today.getDate() + wd - pmWeek * 7);
  return today;
}


function getSpliter(tmpDate) {
  var tmpMonth, tmpDay;
  tmpMonth = (1 * tmpDate.getMonth() + 1);
  tmpDay = tmpDate.getDate();
  return tmpDate.getFullYear().toString() + (tmpMonth < 10 ? '0' + tmpMonth : tmpMonth) + (tmpDay < 10 ? '0' + tmpDay : tmpDay);
}

function parse_Spliter(date) {
  var tmpSplit = date.split('/');
  tmpDate = getWeekStart(0, new Date(tmpSplit[0], (1 * tmpSplit[1] - 1), tmpSplit[2]));
  return getSpliter(tmpDate);
}