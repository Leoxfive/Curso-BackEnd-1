const { Router } = require('express');
const path = require('path');
const ProductManager = require('../managers/ProductManager');

const router = Router();
const productManager = new ProductManager(path.join(__dirname, '..', 'data', 'products.json'));
router.get('/', async (_req, res) => {
  try {
    const products = await productManager.getAll();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});
router.get('/:pid', async (req, res) => {
  try {
    const product = await productManager.getById(req.params.pid);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});
router.post('/', async (req, res) => {
  try {
    const created = await productManager.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Error al crear el producto' });
  }
});
router.put('/:pid', async (req, res) => {
  try {
    const updated = await productManager.update(req.params.pid, req.body);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Error al actualizar el producto' });
  }
});
router.delete('/:pid', async (req, res) => {
  try {
    const deleted = await productManager.delete(req.params.pid);
    res.json({ message: 'Producto eliminado', product: deleted });
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Error al eliminar el producto' });
  }
});

module.exports = router;
