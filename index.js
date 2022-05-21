const bodyParser = require('body-parser')
const express = require('express')
const Stripe = require('./src/connect/stripe')
const session = require('express-session')
var MemoryStore = require('memorystore')(session)


const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
    saveUninitialized: false,
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
        checkPeriod: 86400000
    }),
    resave: false,
    secret: 'keyboard cat'
}));

app.use(express.static('public'))
app.engine('html', require('ejs').renderFile)


const productToPriceMap = {
    BASIC: 'price_1L1EnzCjOglZiLkwa9TBKrED',
    PRO: 'price_1L1EoGCjOglZiLkwhEz5omPU',
}

app.get('/', async function (req, res, next) {
    res.status(200).render('login.ejs')
})

app.post('/login', async (req, res) => {
    const { name, email } = req.body
    const customer = await Stripe.getCustomerByEmail(email);
    if (customer.data.length !== 0) {
        req.session.customerId = customer.data[0].id
        req.session.email = email
        return res.redirect('/account')
    }
    const newCustomer = await Stripe.addNewCustomer(email, name);
    req.session.customerId = newCustomer.id
    req.session.email = email
    return res.redirect('/account')
})

app.get('/account', async function (req, res) {
    res.render('account.ejs')
})

app.post('/checkout', async (req, res) => {
    const { customerId } = req.session
    const session = await Stripe.createCheckoutSession(customerId, productToPriceMap.BASIC)
    res.send({ sessionId: session.id })
})

app.get('/success', (req, res) => {
    res.send('Payment successful')
})

app.get('/failed', (req, res) => {
    res.send('Payment failed')
})

const port = 4242

app.listen(port, () => console.log(`Listening on port ${port}!`))