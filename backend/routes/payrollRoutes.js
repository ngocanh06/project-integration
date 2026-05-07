import express from "express";
import { getPayrolls } from "../controllers/payrollController.js";

const router = express.Router();

router.get("/", getPayrolls);

export default router;