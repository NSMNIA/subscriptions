const PUBLISHABLE_KEY = 'pk_test_51L1DoqCjOglZiLkwBj26ZAkRfZUyNkE63zAt6oHI9rfnkrjZWUl73z4Jgt8kuGQv8UOhsZ3CHlrU2zJDdL5akObI00NGoKKseV';

const stripe = Stripe(PUBLISHABLE_KEY);
const checkOutButton = document.querySelector<HTMLButtonElement>('#checkout-button');
checkOutButton?.addEventListener('click', async (event) => {
    const product = document.querySelector('input[name="product"]:checked') as HTMLInputElement;
    fetch('/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            product: product
        })
    }).then((result: any) => result.json())
        .then(({ sessionId }) => stripe.redirectToCheckout({ sessionId }));
});