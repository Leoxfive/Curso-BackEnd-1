const fs = require('fs').promises;
const path = require('path');

class CartManager {
  constructor(filePath) {
    this.filePath = filePath || path.join(__dirname, '..', 'data', 'carts.json');
  }
  async #readFile() {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data || '[]');
    } catch (err) {
      if (err.code === 'ENOENT') return [];
      throw err;
    }
  }
  async #writeFile(data) {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }
  #normalizeId(id) {
    return String(id);
  }
  #generateId(carts) {
    const numericIds = carts
      .map(c => Number(c.id))
      .filter(n => !Number.isNaN(n));
    const maxId = numericIds.length ? Math.max(...numericIds) : 0;
    return String(maxId + 1);
  }
  async createCart() {
    const list = await this.#readFile();
    const newCart = {
      id: this.#generateId(list),
      products: []
    };
    list.push(newCart);
    await this.#writeFile(list);
    return newCart;
  }
  async getById(id) {
    const list = await this.#readFile();
    const cid = this.#normalizeId(id);
    return list.find(c => this.#normalizeId(c.id) === cid) || null;
  }
  async addProduct(cid, pid, quantity = 1) {
    const list = await this.#readFile();
    const cartId = this.#normalizeId(cid);
    const productId = this.#normalizeId(pid);
    const idx = list.findIndex(c => this.#normalizeId(c.id) === cartId);
    if (idx === -1) {
      const err = new Error('Carrito no encontrado');
      err.status = 404;
      throw err;
    }
    const cart = list[idx];
    const itemIdx = cart.products.findIndex(p => this.#normalizeId(p.product) === productId);
    if (itemIdx === -1) {
      cart.products.push({ product: productId, quantity: Number(quantity) || 1 });
    } else {
      cart.products[itemIdx].quantity += Number(quantity) || 1;
    }
    list[idx] = cart;
    await this.#writeFile(list);
    return cart;
  }
}

module.exports = CartManager;
