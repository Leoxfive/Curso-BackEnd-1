import fs from "fs/promises";
import path from "path";

class CartManager {
  constructor(filePath) {
    this.filePath =
      filePath || path.join(process.cwd(), "src", "data", "carts.json");
  }
  async #readFile() {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data || "[]");
    } catch (err) {
      if (err.code === "ENOENT") return [];
      throw err;
    }
  }
  async #writeFile(data) {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
  }
  #normalizeId(id) {
    return String(id);
  }
  #generateId(carts) {
    const numericIds = carts
      .map((c) => Number(c.id))
      .filter((n) => !Number.isNaN(n));
    const maxId = numericIds.length ? Math.max(...numericIds) : 0;
    return String(maxId + 1);
  }
  async createCart() {
    const carts = await this.#readFile();
    const newCart = {
      id: this.#generateId(carts),
      products: [],
    };
    carts.push(newCart);
    await this.#writeFile(carts);
    return newCart;
  }
  async getById(id) {
    const carts = await this.#readFile();
    const cid = this.#normalizeId(id);
    return carts.find((c) => this.#normalizeId(c.id) === cid) || null;
  }
  async addProduct(cartId, productId, quantity = 1) {
    const carts = await this.#readFile();
    const cid = this.#normalizeId(cartId);
    const cartIndex = carts.findIndex((c) => this.#normalizeId(c.id) === cid);
    if (cartIndex === -1) {
      const err = new Error("Carrito no encontrado");
      err.status = 404;
      throw err;
    }
    const productIndex = carts[cartIndex].products.findIndex(
      (p) => this.#normalizeId(p.product) === this.#normalizeId(productId)
    );
    if (productIndex === -1) {
      carts[cartIndex].products.push({
        product: this.#normalizeId(productId),
        quantity,
      });
    } else {
      carts[cartIndex].products[productIndex].quantity += quantity;
    }
    await this.#writeFile(carts);
    return carts[cartIndex];
  }
}

export default CartManager;