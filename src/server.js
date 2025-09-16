import express from "express";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 8080;
const products = [];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));
app.get("/", (req, res) => {
  res.render("home", {
    title: "Home",
    products: products,
  });
});
app.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts", {
    title: "Productos en tiempo real",
  });
});
const httpServer = app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
const io = new Server(httpServer);
io.on("connection", (socket) => {
  console.log("Cliente conectado con WebSockets");
  socket.emit("productList", products);
  socket.on("newProduct", (product) => {
    products.push(product);
    io.emit("productList", products);
  });
});