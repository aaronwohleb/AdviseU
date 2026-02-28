import "dotenv/config";
import express from "express"
import http from "http"
import cors from "cors"
import createRouter from "./api/routes/route";

const PORT_NUM = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);


app.use("/api", createRouter());

const server = http.createServer(app);

server.listen(PORT_NUM, () => {
    console.log(`Server listening on port ${PORT_NUM}`);
});