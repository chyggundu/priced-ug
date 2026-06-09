import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import businessesRouter from "./businesses";
import productsRouter from "./products";
import reviewsRouter from "./reviews";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(businessesRouter);
router.use(productsRouter);
router.use(reviewsRouter);
router.use(storageRouter);

export default router;
