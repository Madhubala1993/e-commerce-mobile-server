import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
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
  const mobiles = await getMobilesList();
  res.send(mobiles);
});

app.get("/cart", async function (req, res) {
  const cartItems = await getCartList();
  res.send(cartItems);
});

app.post("/mobiles", async function (req, res) {
  const data = req.body;
  console.log(data);
  const result = await addMobilesList(data);
  res.send(result);
});

app.post("/checkout", async function (req, res) {
  const data = req.body;
  console.log(data);
  const result = await client.db("ecommerce").collection("cart").deleteMany({});

  const allCart = await getCartList();
  res.send(allCart);
});

app.put("/cart", async function (req, res) {
  const mobile = req.body;
  const { type } = req.query;

  console.log("mobile", mobile);

  const cartItem = await getCartItemById(mobile);

  if (cartItem) {
    if (type === "decrement" && cartItem.qty <= 1) {
      await deleteCartItemById(mobile);
    } else {
      await updateQtyById(mobile, type);
    }
  } else {
    console.log("inserting");
    await insertCartItem(mobile);
  }
  const allCart = await getCartList();
  res.send(allCart);
});

app.listen(PORT, () => console.log("App started in ", PORT));

async function deleteCartItemById(mobile) {
  return await client
    .db("ecommerce")
    .collection("cart")
    .deleteOne({ _id: mobile._id });
}

async function addMobilesList(data) {
  return await client.db("ecommerce").collection("mobiles").insertMany(data);
}

async function getMobilesList() {
  return await client.db("ecommerce").collection("mobiles").find({}).toArray();
}

async function insertCartItem(mobile) {
  return await client
    .db("ecommerce")
    .collection("cart")
    .insertOne({ ...mobile, qty: 1 });
}

async function getCartItemById(mobile) {
  return await client
    .db("ecommerce")
    .collection("cart")
    .findOne({ _id: mobile._id });
}

async function updateQtyById(mobile, type) {
  return await client
    .db("ecommerce")
    .collection("cart")
    .updateOne(
      { _id: mobile._id },
      { $inc: { qty: type === "increment" ? +1 : -1 } }
    );
}

async function getCartList() {
  return await client.db("ecommerce").collection("cart").find({}).toArray();
}
