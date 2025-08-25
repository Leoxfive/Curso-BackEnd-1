const express = require('express');
const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});