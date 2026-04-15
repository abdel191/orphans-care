import express from "express";
import {
  stripeDonate,
  paypalDonate,
  paypalSuccess,
} from "../controllers/donateController.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.render("donate/donate");
});

router.post("/stripe", stripeDonate);
router.post("/paypal", paypalDonate);
router.get("/paypal/success", paypalSuccess);

router.get("/success", (req, res) => {
  res.send("Merci pour votre don !");
});

router.get("/cancel", (req, res) => {
  res.send("Paiement annulé.");
});

export default router;
