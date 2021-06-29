var express = require('express');
var exphbs  = require('express-handlebars');
var mercadopago = require('mercadopago');

var port = process.env.PORT || 3000

var app = express();

mercadopago.configure({
    access_token: 'APP_USR-6317427424180639-042414-47e969706991d3a442922b0702a0da44-469485398'//'TEST-8471938166952833-062003-ca49401116b09bc46b618aee7e3c050f-778348314'
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
    var pageInfo = {
        payment_method_id: req.query.payment_method_id,
        external_reference: req.query.external_reference,
        collection_id: req.query.collection_id || req.query.payment_id
    };
    res.render('success', pageInfo);
});

app.get('/pending', function (req, res) {
    console.dir(req.query);
    res.render('pending');
});

app.get('/failure', function (req, res) {
    console.dir(req.query);
    res.render('failure');
});

app.post('/notification', function (req, res) {
    console.dir('-- NOTIFICATION --');
    console.dir(req.body);
    console.dir('-- NOTIFICATION --');
    res.render('home');
});

app.post('/buy-product', function (req, res) {
    var item = req.body;
    item.id = '1234';
    item.description = 'Dispositivo móvil de Tienda e-commerce';
    item.quantity = parseFloat(item.quantity);
    item.unit_price = parseFloat(item.unit_price);
    item.picture_url = 'https://' + req.headers.host + item.picture_url.substring(1);
    console.dir(item);

    var preference = {
        external_reference: 'enoble2009@gmail.com',
        integrator_id: "dev_24c65fb163bf11ea96500242ac130004",
        items: [
            item
        ],
        notification_url: req.headers.host + '/notification',
        back_urls: {
            success: req.headers.host + '/success',
            pending: req.headers.host + '/pending',
            failure: req.headers.host + '/failure'
        },
        auto_return: "approved",
        payment_methods: {
            "excluded_payment_methods": [
                {id: 'amex'}
            ],
            "excluded_payment_types": [
                {id: 'atm'}
            ],
            installments: 6
        },
        payer: {
            name: 'Lalo',
            surname: 'Landa',
            email: 'test_user_63274575@testuser.com',
            phone: {
                area_code: '11',
                number: 22223333
            },
            address: {
                street_name: 'Falsa',
                street_number: 123,
                zip_code: '1111'
            }
        }
    };

    mercadopago.preferences.create(preference)
        .then((msg) => {
            console.dir(msg);
            res.redirect(msg.body.init_point);
        });
});

app.listen(port);