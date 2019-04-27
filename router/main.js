const ctrl = require('../controller/main');

module.exports = function(app, express, fs) {
  app.get('/', function(req, res) {
    res.render('main');
  });

  app.post('/loadResv', function(req, res) {
    ctrl.loadResv(req, res);
  });

  app.post('/cmtResv', function(req, res) {
    ctrl.cmtResv(req. res);
  });

  app.get('/writeResv', function(req, res) {
    res.render('write');
  });

  app.post('/chkResv', function(req, res) {
    ctrl.chkResv(req, res);
  });

  app.get('/chkResv/:resvname', function(req, res) {
    res.render('chkResv', {"resvname": req.params.resvname });
  });

  app.get('/readResv', function(req, res) {
    res.render('readResv')
  });

  app.use('/static', express.static('static'));
};
