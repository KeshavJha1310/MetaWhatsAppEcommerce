const production = {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'production',
};

const development = {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: '9000',
    Meta_WA_accessToken:'EAANqto1jn9IBO4RcW3VeBDwhuwQR4vy2FAs0cm30pmYyBLendki4mVM3n5NtGmY8LaRIFqTmIRbOQesmVyc3g4GYh2RWYrTOjNTIHLM9xSmGmrKrHZCsWuuAb4BPzztTaf8tq3LVlQQnuoPEhTFyZArmxzUGGQlMgsjXyrkmAz8gtE3kQZBdDZBroWTssH6WmVdbhGZAZC6OB56uInJk6uuRKXavMZD',
    Meta_WA_SenderPhoneNumberId: '293419630518750',
    Meta_WA_wabaId: '231980446675683',
    Meta_WA_VerifyToken: 'YouCanSetYourOwnToken',
};

const fallback = {
    ...process.env,
    NODE_ENV: undefined,
};
 
module.exports = (environment) => {
    console.log(`Execution environment selected is: "${environment}"`);
    if (environment === 'production') {
        return production;
    } else if (environment === 'development') {
        return development;
    } else {
        return fallback;
    }
};