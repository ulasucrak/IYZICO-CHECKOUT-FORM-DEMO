require('dotenv').config();
const express = require('express');
const Iyzipay = require('iyzipay');

const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: process.env.IYZICO_BASE_URL,
});

app.post('/api/start-payment', (req, res) => {
    const { name, surname, email } = req.body;

    const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: 'conv-' + Date.now(),
        price: '10.00',
        paidPrice: '10.00',
        currency: Iyzipay.CURRENCY.TRY,
        basketId: 'B67832',
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        callbackUrl: 'https://iyzico-checkout-form-demo-production.up.railway.app/api/verify-payment',

        buyer: {
            id: 'BY789',
            name: name,
            surname: surname,
            email: email,
            gsmNumber: '+905350000000',
            identityNumber: '74300864791',
            registrationAddress: 'Test Mahallesi, Test Sokak',
            ip: req.ip,
            city: 'Istanbul',
            country: 'Turkey',
        },

        shippingAddress: {
            contactName: name + ' ' + surname,
            city: 'Istanbul',
            country: 'Turkey',
            address: 'Test Mahallesi, Test Sokak',
        },

        billingAddress: {
            contactName: name + ' ' + surname,
            city: 'Istanbul',
            country: 'Turkey',
            address: 'Test Mahallesi, Test Sokak',
        },

        basketItems: [
            {
                id: 'BI101',
                name: 'Dijital Danismanlik Paketi',
                category1: 'Hizmet',
                itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
                price: '10.00',
            },
        ],
    };

    iyzipay.checkoutFormInitialize.create(request, (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        if (result.status === 'success') {
            return res.json({
                success: true,
                checkoutFormContent: result.checkoutFormContent,
            });
        } else {
            return res.json({ success: false, error: result.errorMessage });
        }
    });
});

app.post('/api/verify-payment', (req, res) => {
    const token = req.body.token;

    console.log('Callback geldi, token:', token);

    iyzipay.checkoutForm.retrieve({
        locale: Iyzipay.LOCALE.TR,
        conversationId: 'conv-verify',
        token: token,
    }, (err, result) => {
        if (err) {
            return res.redirect('/result.html?status=error');
        }
        if (result.paymentStatus === 'SUCCESS') {
            return res.redirect('/result.html?status=success');
        } else {
            return res.redirect('/result.html?status=error');
        }
    });
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});