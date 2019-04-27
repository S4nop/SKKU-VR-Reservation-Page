module.exports = function(app, express)
{
     app.get('/',function(req, res){
        res.render('index.html')
     });
     app.get('/tdData',function(req, res){
        res.render('about.html');
    });

    app.use("/static", express.static("static"));
}