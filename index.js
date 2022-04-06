import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const app = express();

const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());

const MONGO_URL = process.env.MONGO_URL;

async function createConnection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("Mongo is connected");
  return client;
}

export const client = await createConnection();

app.get("/", function (req, res) {
  res.send("Hello World 😊😊😊😊");
});

app.get("/mobiles", async function (req, res) {
  const mobiles = await client
    .db("ecommerce")
    .collection("mobiles")
    .find({})
    .toArray();
  res.send(mobiles);
});

app.post("/mobiles", async function (req, res) {
  const data = req.body;
  console.log(data);
  const result = await client
    .db("ecommerce")
    .collection("mobiles")
    .insertMany(data);
  res.send(result);
});

app.listen(PORT, () => console.log("App started in ", PORT));
