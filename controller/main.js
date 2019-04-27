const fs = require('fs');

module.exports = {
  getTdData : function (req, res) {
    date = getWeekStart(req['pmw']);
    resvList = getTT(date);
    resvList.push(date);;
    res.json(resvList);
    return;
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
            resvObj.push(JSON.parse(JSON.stringify(tmpObj)));
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
  if (wd == -5) wd = 2;

  today.setDate(today.getDate() + wd - pmWeek * 7);
  return today;
}


function getSpliter(tmpDate) {
  var tmpMonth, tmpDay;
  tmpMonth = (1 * tmpDate.getMonth() + 1);
  tmpDay = tmpDate.getDate();
  //console.log('getspliter: ' +  tmpDate.getFullYear().toString() + (tmpMonth < 10 ? '0' + tmpMonth : tmpMonth) + (tmpDay < 10 ? '0' + tmpDay : tmpDay));
  return tmpDate.getFullYear().toString() + (tmpMonth < 10 ? '0' + tmpMonth : tmpMonth) + (tmpDay < 10 ? '0' + tmpDay : tmpDay);
}