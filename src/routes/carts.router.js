import { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";
import CartManager from "../managers/CartManager.js";
import ProductManager from "../managers/ProductManager.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();
const cartsPath = path.join(__dirname, "..", "data", "carts.json");
const productsPath = path.join(__dirname, "..", "data", "products.json");
const cartManager = new CartManager(cartsPath);
const productManager = new ProductManager(productsPath);

router.post("/", async (_req, res) => {
  try {
    const cart = await cartManager.createCart();
    res.status(201).json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear el carrito" });
  }
});
router.get("/:cid", async (req, res) => {
  try {
    const cart = await cartManager.getById(req.params.cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    res.json(cart.products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener el carrito" });
  }
});
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const prod = await productManager.getById(req.params.pid);
    if (!prod) return res.status(404).json({ error: "Producto no encontrado" });
    const updatedCart = await cartManager.addProduct(
      req.params.cid,
      req.params.pid,
      1
    );
    res.status(201).json(updatedCart);
  } catch (err) {
    console.error(err);
    res
      .status(err.status || 500)
      .json({
        error: err.message || "Error al agregar producto al carrito",
      });
  }
});

export default router;