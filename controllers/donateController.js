import Stripe from "stripe";
import paypalClient from "../config/paypal.js";
import paypal from "@paypal/checkout-server-sdk";

export const stripeDonate = async (req, res) => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    return res.status(500).send("Clé Stripe manquante dans le fichier .env");
  }

  const stripe = new Stripe(stripeKey);
  const amount = Number(req.body.amount);

  if (!amount || amount <= 0) {
    return res.status(400).send("Montant invalide");
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Don pour Orphans Care Togo",
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.BASE_URL}/donate/success`,
      cancel_url: `${process.env.BASE_URL}/donate/cancel`,
    });

    res.redirect(session.url);
  } catch (error) {
    console.error("Erreur Stripe :", error);
    res.status(500).send("Erreur paiement Stripe");
  }
};

export const paypalDonate = async (req, res) => {
  const amount = Number(req.body.amount);

  if (!amount || amount <= 0) {
    return res.status(400).send("Montant invalide");
  }

  try {
    const request = new paypal.orders.OrdersCreateRequest();

    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "EUR",
            value: amount.toFixed(2),
          },
          description: "Don pour Orphans Care Togo",
        },
      ],
      application_context: {
        brand_name: "Orphans Care Togo",
        landing_page: "LOGIN",
        user_action: "PAY_NOW",
        return_url: `${process.env.BASE_URL}/donate/paypal/success`,
        cancel_url: `${process.env.BASE_URL}/donate/cancel`,
      },
    });

    const order = await paypalClient.execute(request);

    const approveLink = order.result.links.find(
      (link) => link.rel === "approve",
    );

    if (!approveLink) {
      return res.status(500).send("Lien PayPal introuvable");
    }

    res.redirect(approveLink.href);
  } catch (error) {
    console.error("Erreur PayPal :", error);
    res.status(500).send("Erreur paiement PayPal");
  }
};

export const paypalSuccess = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send("Token PayPal manquant");
  }

  try {
    const request = new paypal.orders.OrdersCaptureRequest(token);
    request.requestBody({});

    const capture = await paypalClient.execute(request);

    console.log("Paiement PayPal capturé :", capture.result);

    res.send("Merci pour votre don via PayPal !");
  } catch (error) {
    console.error("Erreur capture PayPal :", error);
    res.status(500).send("Erreur lors de la validation du paiement PayPal");
  }
};
