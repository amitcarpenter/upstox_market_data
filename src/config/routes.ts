import express, { Application } from "express";
import cookieParser from "cookie-parser";
import socket_router from "../routes/authRoutes";
import market_router from "../routes/authRoutes";

const configureApp = (app: Application): void => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use("/api", socket_router);
  app.use("/api/market", market_router);
};

export default configureApp;
