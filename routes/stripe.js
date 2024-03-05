const express = require("express");
const Stripe = require("stripe");
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config();

const stripe = Stripe(process.env.STRIPE_SECRET);

const router = express.Router();

router.get("/checkout-success", async (req, res) => {
  try {
    const checkoutSuccessPage = await fs.readFile(path.join(__dirname, 'checkout-success.html'), 'utf8');
    res.set("Content-Type", "text/html");
    res.send(checkoutSuccessPage);
  } catch (error) {
    res.status(500).send("Error loading checkout success page");
  }
});

router.get("/cancel", async (req, res) => {
  try {
    const checkoutCancelPage = await fs.readFile(path.join(__dirname, 'cancel.html'), 'utf8');
    res.set("Content-Type", "text/html");
    res.send(checkoutCancelPage);
  } catch (error) {
    res.status(500).send("Error loading cancel page");
  }
});


router.post("/create-checkout-session", async (req, res) => {
  try {
    const customer = await stripe.customers.create({
      metadata: {
        userId: req.body.userId,
        cart: JSON.stringify(req.body.cartItems),
      },
    });
    console.log("customer id is : ",customer.id)
    const line_items = req.body.cartItems.map((item) => {
      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: item.name,
            imageUrl: item.image,
            description: item.desc,
            metadata: {
              id: item.id,
            },
          },
          unit_amount: item.price * 100,
        },
        quantity: item.cartQuantity,
      };
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      phone_number_collection: {
        enabled: false,
      },
      line_items,
      mode: "payment",
      customer: customer.id,
      success_url: "https://payment-production-23a5.up.railway.app/stripe/checkout-success",
      cancel_url:  "https://payment-production-23a5.up.railway.app/stripe/cancel",
    });

    res.send({ url: session.url });
  } catch (error) {
    res.status(500).send("Error creating checkout session");
  }
});



module.exports = router;