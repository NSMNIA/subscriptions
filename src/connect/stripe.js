const stripe = require('stripe')
require('dotenv/config');
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

const Stripe = stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2020-08-27'
})

const addNewCustomer = async (email, name) => {
    console.log({ email, name });
    const customer = await Stripe.customers.create({
        email,
        description: name
    })

    return customer
}

const getCustomerByEmail = async (email) => {
    const customer = await Stripe.customers.search({
        query: `email: '${email}'`
    })
    return customer
}

const createCheckoutSession = async (customer, price, trial = true) => {
    let checkOut = {
        mode: 'subscription',
        payment_method_types: ['sepa_debit', 'card'],
        customer,
        line_items: [
            {
                price,
                quantity: 1
            }
        ],
        subscription_data: {
            trial_period_days: 14
        },
        success_url: `http://localhost:4242/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:4242/failed`
    }

    if (!trial) {
        checkOut = {
            mode: 'subscription',
            payment_method_types: ['sepa_debit', 'card'],
            customer,
            line_items: [
                {
                    price,
                    quantity: 1
                }
            ],
            success_url: `http://localhost:4242/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:4242/failed`
        }
    }

    const session = await Stripe.checkout.sessions.create(checkOut);

    return session
}


module.exports = {
    addNewCustomer,
    getCustomerByEmail,
    createCheckoutSession
}