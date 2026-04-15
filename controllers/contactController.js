import Joi from "joi";
import nodemailer from "nodemailer";

// configuration nodemailer avec Brevo
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// schéma de validation Joi
const contactSchema = Joi.object({
  nom: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "Le nom est obligatoire",
    "string.min": "Le nom doit contenir au moins 2 caractères",
    "string.max": "Le nom ne doit pas dépasser 50 caractères",
    "any.required": "Le nom est obligatoire",
  }),
  email: Joi.string().trim().email().max(100).required().messages({
    "string.empty": "L'email est obligatoire",
    "string.max": "L'email ne doit pas dépasser 100 caractères",
    "string.email": "L'email n'est pas valide",
    "any.required": "L'email est obligatoire",
  }),
  sujet: Joi.string().trim().min(2).max(150).required().messages({
    "string.empty": "Le sujet est obligatoire",
    "string.min": "Le sujet doit contenir au moins 2 caractères",
    "string.max": "Le sujet ne doit pas dépasser 150 caractères",
    "any.required": "Le sujet est obligatoire",
  }),
  message: Joi.string().trim().min(2).max(1000).required().messages({
    "string.empty": "Le message est obligatoire",
    "string.min": "Le message doit contenir au moins 2 caractères",
    "string.max": "Le message ne doit pas dépasser 1000 caractères",
    "any.required": "Le message est obligatoire",
  }),
});

// page contact
export const contactIndex = (req, res) => {
  res.render("contact/index", {
    successMessage: req.flash("success")[0] || "",
    errorMessages: req.flash("error") || [],
    oldInput: req.flash("oldInput")[0] || {
      nom: "",
      email: "",
      sujet: "",
      message: "",
    },
  });
};

// traitement du formulaire
export const contactPost = async (req, res) => {
  const { nom, email, sujet, message } = req.body;

  console.log("Formulaire reçu :", { nom, email, sujet, message });

  const { error, value } = contactSchema.validate(
    { nom, email, sujet, message },
    {
      abortEarly: false,
      stripUnknown: true,
    },
  );

  if (error) {
    const errors = error.details.map((detail) => detail.message);

    req.flash("error", errors);
    req.flash("oldInput", {
      nom,
      email,
      sujet,
      message,
    });

    return res.redirect("/contact");
  }

  try {
    const { nom, email, sujet, message } = value;

    const mailToAdmin = {
      from: `"Orphans Care Togo" <${process.env.BREVO_SENDER_EMAIL}>`,
      to: process.env.CONTACT_RECEIVER_EMAIL,
      replyTo: email,
      subject: `Nouveau message de contact : ${sujet}`,
      html: `
        <h2>Informations de contact</h2>
        <p><strong>Nom :</strong> ${nom}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Sujet :</strong> ${sujet}</p>
        <p><strong>Message :</strong><br>${message.replace(/\n/g, "<br>")}</p>
      `,
      text: `
Nom: ${nom}
Email: ${email}
Sujet: ${sujet}
Message: ${message}
      `,
    };

    await transporter.sendMail(mailToAdmin);

    const mailToVisitor = {
      from: `"Orphans Care Togo" <${process.env.BREVO_SENDER_EMAIL}>`,
      to: email,
      subject: "Confirmation de votre demande de contact",
      html: `
        <p>Bonjour <strong>${nom}</strong>,</p>
        <p>Merci de nous avoir contactés.</p>
        <p>Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.</p>
        <p>Merci d'avoir contacté <strong>Orphans Care Togo</strong>.</p>
      `,
      text: `
Bonjour ${nom},

Merci de nous avoir contactés.
Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.

Merci d'avoir contacté Orphans Care Togo.
      `,
    };

    await transporter.sendMail(mailToVisitor);

    req.flash("success", "Votre message a été envoyé avec succès.");
    return res.redirect("/contact");
  } catch (err) {
    console.error("Erreur envoi email Brevo :", err);

    req.flash("error", [
      "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer.",
    ]);

    req.flash("oldInput", {
      nom,
      email,
      sujet,
      message,
    });

    return res.redirect("/contact");
  }
};
