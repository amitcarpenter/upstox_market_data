import express, { Application } from "express";
import cookieParser from "cookie-parser";
import router from "../routes/authRoutes";

const configureApp = (app: Application): void => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use("/api", router);
};

export default configureApp;
