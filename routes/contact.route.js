import express from "express";
import { contactIndex, contactPost } from "../controllers/contactController.js";
const router = express.Router();
router.get("/contact", contactIndex);
router.post("/contact", contactPost);
export default router;
