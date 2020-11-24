import express from "express";
import { join } from "path";
import { WS } from "./WS";

const path = join(__dirname, "..", "static", "index.html");
const app = express();

app.get("*", (_, res) => res.sendFile(path));

new WS(app.listen(process.env.PORT || 3000));
