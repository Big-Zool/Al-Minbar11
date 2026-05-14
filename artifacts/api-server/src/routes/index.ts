import { Router, type IRouter } from "express";
import healthRouter from "./health";
import khutbahsRouter from "./khutbahs";
import settingsRouter from "./settings";
import translateRouter from "./translate";

const router: IRouter = Router();

router.use(healthRouter);
router.use(khutbahsRouter);
router.use(settingsRouter);
router.use(translateRouter);

export default router;
