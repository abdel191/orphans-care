import "dotenv/config";
import express from "express";
import session from "express-session";
import flash from "connect-flash";

// import router
import homeRouter from "./routes/home.route.js";
import contactRouter from "./routes/contact.route.js";
import donateRouter from "./routes/donate.route.js";

// créer une instance de l'application express
const app = express();
const port = process.env.PORT || 3003;

// parser les données des formulaires et du JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// config session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "222234565",
    resave: false,
    saveUninitialized: false,
  }),
);

// configurer connect-flash
app.use(flash());

// rendre quelques variables globales disponibles dans les vues
app.use((req, res, next) => {
  res.locals.currentUrl = req.originalUrl;
  next();
});

// définir ejs comme moteur de templates
app.set("view engine", "ejs");

// pointer le dossier des vues
app.set("views", "./views");

// pointer le dossier static public
app.use(express.static("public"));

// debug temporaire PayPal
console.log("PAYPAL_MODE =", process.env.PAYPAL_MODE);
console.log(
  "PAYPAL_CLIENT_ID =",
  process.env.PAYPAL_CLIENT_ID ? "OK" : "MANQUANT",
);
console.log("PAYPAL_SECRET =", process.env.PAYPAL_SECRET ? "OK" : "MANQUANT");

// créer les routes
app.use("/", homeRouter);
app.use("/", contactRouter);
app.use("/donate", donateRouter);

// middleware 404 simple
app.use((req, res) => {
  res.status(404).send("Page non trouvée");
});

app.listen(port, () => {
  console.log(`server is running at http://localhost:${port}/`);
});
