import dotenv from 'dotenv';

dotenv.config();

export const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
export const paymentMethodId = process.env.PAYMENT_METHOD;
export const googleid = process.env.GOOGLE_CLIENT_ID;
export const googlesecret = process.env.GOOGLE_CLIENT_SECRET;
export const callbackurl = process.env.CALLBACK_URL;

export const port = process.env.PORT || 7000;
