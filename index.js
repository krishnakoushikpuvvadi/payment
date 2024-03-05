const express = require('express');
const app = express();
const cors = require('cors');
const port = 3003;
const Stripe = require("stripe");
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const stripeRouter = require("./routes/stripe");
const bodyParser = require('body-parser');
const Order = require('./models/orders');

dotenv.config();

const stripe = Stripe(process.env.STRIPE_SECRET);
mongoose.connect(process.env.MONGO_URL).then(() => console.log("db connected")).catch((err) => console.log(err));

const endpointSecret = "whsec_IOH8qpPLPvvHgGtnpndcaeaPQmGjZLXv";

app.use(cors());
app.use(express.json());

app.post('/webhook', bodyParser.raw({ type: 'application/json' }), (request, response) => {
  // const payload = {
  //   "id": "evt_1Oqc0DSEJtH7Sde5JTW0lq1i",
  //   "object": "event",
  //   "api_version": "2023-10-16",
  //   "created": 1709560585,
  //   "data": {
  //     "object": {
  //       "id": "cus_PfxwsSviCi1cIR",
  //       "object": "customer",
  //       "address": null,
  //       "balance": 0,
  //       "created": 1709560585,
  //       "currency": null,
  //       "default_source": null,
  //       "delinquent": false,
  //       "description": null,
  //       "discount": null,
  //       "email": null,
  //       "invoice_prefix": "08EB203A",
  //       "invoice_settings": {
  //         "custom_fields": null,
  //         "default_payment_method": null,
  //         "footer": null,
  //         "rendering_options": null
  //       },
  //       "livemode": false,
  //       "metadata": {
  //         "cart": "[{\"name\":\"UltraBoost Shoes\",\"id\":\"65b7dcb42aa73bf7797f9451\",\"price\":\"49.00\",\"cartQuantity\":1}]",
  //         "userId": "65e5c24dfedb6fc02e8159c7"
  //       },
  //       "name": null,
  //       "next_invoice_sequence": 1,
  //       "phone": null,
  //       "preferred_locales": [
  //       ],
  //       "shipping": null,
  //       "tax_exempt": "none",
  //       "test_clock": null
  //     }
  //   },
  //   "livemode": false,
  //   "pending_webhooks": 1,
  //   "request": {
  //     "id": "req_t4tkKqRqXAWAdJ",
  //     "idempotency_key": "bae2dbe4-c073-4c4c-973f-1bf532db1785"
  //   },
  //   "type": "checkout.session.completed"
  // }
  
  // const payloadString = JSON.stringify(payload, null, 2);
  // const secret = 'whsec_test_secret';
  
  // const header = stripe.webhooks.generateTestHeaderString({
  //   payload: payloadString,
  //   secret,
  // });
  
  // const event = stripe.webhooks.constructEvent(payloadString, header, secret);
  // console.log("event is : ",event)
  // Handle the event
  // switch (event.type) {
  //   case 'payment_intent.succeeded':
  //     console.log("Payment Intent Succeeded");
  //     break;

    // case 'checkout.session.completed':
      // console.log("Session Completed");
      // const checkoutData = event.data.object;
      // stripe.customers.retrieve(checkoutData.customer)
        // .then(async (customer) => {
          try {
            // const data = JSON.parse(customer.metadata.cart);
            // const products = data.map((item) => {
              // return {
                // productId: item.id,
                // quantity: item.cartQuantity,
              // };
            // });

            // console.log(products[0].supplier);

            const newOrder = new Order({
              userId:  "65e5c24dfedb6fc02e8159c7",
              customerId:  "cus_Pg4bcYCxJupE3q",
              productId: "65b7dcb42aa73bf7797f9451",
              quantity: 1,
              subtotal:  "49.00",
              total:  "49.00",
              payment_status:  "Success",
              // userId: customer.metadata.userId || "65e5c24dfedb6fc02e8159c7",
              // customerId: checkoutData.customer || "cus_Pg4bcYCxJupE3q",
              // productId: products[0].productId || "65b7dcb42aa73bf7797f9451",
              // quantity: products[0].quantity || 1,
              // subtotal: checkoutData.amount_subtotal / 100 || "49.00",
              // total: checkoutData.amount_total / 100 || "49.00",
              // payment_status: checkoutData.payment_status || "Success",
            });

            try {
               newOrder.save();
              console.log("Order processed");
            } catch (err) {
              console.log("Error saving order:", err);
            }
          } catch (err) {
            console.log("Error parsing customer metadata:", err);
          }
        // }
        // )
        // .catch((err) => console.log("Error retrieving customer:", err.message));
      // break;

    // default:
      // console.log(`Unhandled event type ${event.type}`);
  // }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

app.use("/stripe", stripeRouter);

app.listen(process.env.PORT || port, () => console.log(`App listening on port ${process.env.PORT || port}!`));
