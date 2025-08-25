const { Router } = require('express');
const path = require('path');
const CartManager = require('../managers/CartManager');
const ProductManager = require('../managers/ProductManager');
const router = Router();
const cartsPath = path.join(__dirname, '..', 'data', 'carts.json');
const productsPath = path.join(__dirname, '..', 'data', 'products.json');
const cartManager = new CartManager(cartsPath);
const productManager = new ProductManager(productsPath);

router.post('/', async (_req, res) => {
  try {
    const cart = await cartManager.createCart();
    res.status(201).json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el carrito' });
  }
});
router.get('/:cid', async (req, res) => {
  try {
    const cart = await cartManager.getById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(cart.products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
});
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const prod = await productManager.getById(req.params.pid);
    if (!prod) return res.status(404).json({ error: 'Producto no encontrado' });

    const updatedCart = await cartManager.addProduct(req.params.cid, req.params.pid, 1);
    res.status(201).json(updatedCart);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Error al agregar producto al carrito' });
  }
});

module.exports = router;
