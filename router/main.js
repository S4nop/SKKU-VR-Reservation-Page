const ctrl = require('../controller/main');

module.exports = function(app, express, fs) {
  app.get('/', function(req, res) {
    res.render('main');
  });
  app.post('/tdData', function(req, res) {
    ctrl.getTdData(req, res);
  });
  app.get('/write', function(req, res) {
    res.render('write');
  });
  app.get('/read', function(req, res) {
    res.render('read');
  });
  app.get('/password', function(req, res) {
    res.render('password');
  });

  app.use('/static', express.static('static'));
};
