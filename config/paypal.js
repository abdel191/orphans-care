import paypal from "@paypal/checkout-server-sdk";

const mode = (process.env.PAYPAL_MODE || "").trim().toLowerCase();
const clientId = (process.env.PAYPAL_CLIENT_ID || "").trim();
const secret = (process.env.PAYPAL_SECRET || "").trim();

console.log("PayPal mode =", mode);
console.log("PayPal clientId =", clientId ? "OK" : "MANQUANT");
console.log("PayPal secret =", secret ? "OK" : "MANQUANT");

const environment =
  mode === "live"
    ? new paypal.core.LiveEnvironment(clientId, secret)
    : new paypal.core.SandboxEnvironment(clientId, secret);

const client = new paypal.core.PayPalHttpClient(environment);

export default client;
