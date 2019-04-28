const ctrl = require('../controller/main');

module.exports = function(app, express, fs) {
  app.get('/', function(req, res) {
    res.render('main');
  });

  app.post('/loadResv', function(req, res) {
    ctrl.loadResv(req, res);
  });

  app.post('/cmtResv', function(req, res) {
    ctrl.cmtResv(req, res);
  });

  app.get('/writeResv', function(req, res) {
    res.render('writeResv');
  });

  app.post('/chkResv', async function(req, res) {
    var rlt = await ctrl.chkResv(req, res, false);
    if(rlt.result)
      res.render('readResv', {"name": rlt.name, "num": rlt.num, "time": rlt.time});
    else
      res.render('reject');
  });

  app.get('/chkResv/:resvname', function(req, res) {
    res.render('chkResv', {"resvname": req.params.resvname });
  });

  app.get('/readResv', function(req, res) {
    res.render('readResv')
  });

  app.post('/delResv', function(req, res) {
    ctrl.chkResv(req, res, true);
  })

  app.use('/static', express.static('static'));
};
