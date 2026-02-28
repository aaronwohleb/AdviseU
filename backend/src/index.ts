import "dotenv/config";
import express from "express"
import http from "http"
import cors from "cors"

const PORT_NUM = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);


app.use("/api", (req, res) => {
    res.json({ message: "Hello from the backend!" });
})

const server = http.createServer(app);

server.listen(PORT_NUM, () => {
    console.log(`Server listening on port ${PORT_NUM}`);
});