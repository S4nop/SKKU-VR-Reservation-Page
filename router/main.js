module.exports = function(app, express) {
    app.get('/', function(req, res) {
        res.render('main.html')
    });
    app.get('/write', function(req, res) {
        res.render('write.html');
    });

    app.use("/static", express.static("static"));
}