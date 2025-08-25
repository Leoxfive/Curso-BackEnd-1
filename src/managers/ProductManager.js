const fs = require('fs').promises;
const path = require('path');

class ProductManager {
  constructor(filePath) {
    this.filePath = filePath || path.join(__dirname, '..', 'data', 'products.json');
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
  #generateId(products) {
    const numericIds = products
      .map(p => Number(p.id))
      .filter(n => !Number.isNaN(n));
    const maxId = numericIds.length ? Math.max(...numericIds) : 0;
    return String(maxId + 1);
  }
  async getAll() {
    return await this.#readFile();
  }
  async getById(id) {
    const list = await this.#readFile();
    const pid = this.#normalizeId(id);
    return list.find(p => this.#normalizeId(p.id) === pid) || null;
  }
  async create(data) {
    const required = ['title', 'description', 'code', 'price', 'stock', 'category'];
    for (const field of required) {
      if (data[field] === undefined || data[field] === null) {
        const err = new Error(`Falta el campo requerido: ${field}`);
        err.status = 400;
        throw err;
      }
    }
    const list = await this.#readFile();
    if (list.some(p => p.code === data.code)) {
      const err = new Error('El campo "code" debe ser único');
      err.status = 400;
      throw err;
    }
    const newProduct = {
      id: this.#generateId(list),
      title: String(data.title),
      description: String(data.description),
      code: String(data.code),
      price: Number(data.price),
      status: data.status === undefined ? true : Boolean(data.status),
      stock: Number(data.stock),
      category: String(data.category),
      thumbnails: Array.isArray(data.thumbnails) ? data.thumbnails.map(String) : []
    };
    list.push(newProduct);
    await this.#writeFile(list);
    return newProduct;
  }
  async update(id, data) {
    const list = await this.#readFile();
    const pid = this.#normalizeId(id);
    const idx = list.findIndex(p => this.#normalizeId(p.id) === pid);
    if (idx === -1) {
      const err = new Error('Producto no encontrado');
      err.status = 404;
      throw err;
    }
    const { id: _, ...rest } = data || {};
    const updated = { ...list[idx], ...rest };
    if (rest.price !== undefined) updated.price = Number(rest.price);
    if (rest.stock !== undefined) updated.stock = Number(rest.stock);
    if (rest.status !== undefined) updated.status = Boolean(rest.status);
    if (rest.thumbnails !== undefined) {
      updated.thumbnails = Array.isArray(rest.thumbnails) ? rest.thumbnails.map(String) : [];
    }
    list[idx] = updated;
    await this.#writeFile(list);
    return updated;
  }
  async delete(id) {
    const list = await this.#readFile();
    const pid = this.#normalizeId(id);
    const idx = list.findIndex(p => this.#normalizeId(p.id) === pid);
    if (idx === -1) {
      const err = new Error('Producto no encontrado');
      err.status = 404;
      throw err;
    }
    const [removed] = list.splice(idx, 1);
    await this.#writeFile(list);
    return removed;
  }
}

module.exports = ProductManager;
