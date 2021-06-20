var express = require('express');
var exphbs  = require('express-handlebars');
var mercadopago = require('mercadopago');

var port = process.env.PORT || 3000

var app = express();

mercadopago.configure({
    access_token: 'TEST-8471938166952833-062003-ca49401116b09bc46b618aee7e3c050f-778348314'
});
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({
    extended: true
})); // to support URL-encoded bodies

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('assets'));
 
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/detail', function (req, res) {
    res.render('detail', req.query);
});

app.get('/success', function (req, res) {
    console.dir(req.query);
    res.render('home');
});

app.get('/pending', function (req, res) {
    console.dir(req.query);
    res.render('home');
});

app.get('/failure', function (req, res) {
    console.dir(req.query);
    res.render('home');
});

app.get('/notification', function (req, res) {
    console.dir(req.body);
    res.render('home');
});

app.post('/buy-product', function (req, res) {
    var item = req.body;
    item.currency_id = 'UYU';
    item.quantity = parseFloat(item.quantity);
    item.unit_price = parseFloat(item.unit_price);
    console.dir(item);

    var preference = {
        items: [
            item
        ],
        notification_url: req.headers.host + '/notification',
        back_urls: {
            success: req.headers.host + '/success',
            pending: req.headers.host + '/pending',
            failure: req.headers.host + '/failure'
        },
        auto_return: "approved"
    };

    mercadopago.preferences.create(preference)
        .then((msg) => {
            console.dir(msg);
            res.redirect(msg.body.sandbox_init_point);
        });
});

app.listen(port);