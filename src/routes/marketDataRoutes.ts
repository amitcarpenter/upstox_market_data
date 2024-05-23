import { Router, Request, Response } from "express";
const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Upstox Market Data");
});

router.get("/market_data", (req: Request, res: Response) => {
  res.send("login success fully for the market data");
});


router.get("/market_data", (req: Request, res: Response) => {
  res.send("login success fully for the market data");
});

export default router;
