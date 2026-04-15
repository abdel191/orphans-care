import express from "express";
import { homeIndex } from "../controllers/homeController.js";
const router = express.Router();
router.get("/", homeIndex);

export default router;
