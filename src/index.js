import express from "express";
import dotenv from "dotenv";
import prisma from "./db.js"; // Importar nossa conexão com o banco

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

// Criar aplicação Express
const app = express();

// Middleware para processar JSON nas requisições
app.use(express.json());

//Healthcheck
app.get("/", (_req, res) => res.json({ ok: true, service: "API 3º Bimestre" }));

/* -------- USERS (CRUD) -------- */
// Create user
app.post('/users', async (req, res) => {
  try {
    const { email, name } = req.body;
    const user = await prisma.user.create({ data: { email, name } });
    res.status(201).json(user);
  } catch (e) { res.status(400).json({ error: e.message }); }
});




// List users
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({ include: { store: true } });
    res.json(users);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Get user by id (include store)
app.get('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) }, include: { store: true } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Update user
app.put('/users/:id', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { name, email }
    });
    res.json(user);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Delete user
app.delete('/users/:id', async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (e) { res.status(400).json({ error: e.message }); }
});

/* -------- STORES (1-1 com User) -------- */
// Create store (body: { name, userId })
app.post('/stores', async (req, res) => {
  try {
    const { name, userId } = req.body;
    const store = await prisma.store.create({ data: { name, userId: Number(userId) } });
    res.status(201).json(store);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Get all stores (optional)
app.get('/stores', async (req, res) => {
  try {
    const stores = await prisma.store.findMany({ include: { user: true, products: true } });
    res.json(stores);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// GET /stores/:id -> inclui dono (user) e produtos
app.get('/stores/:id', async (req, res) => {
  try {
    const store = await prisma.store.findUnique({
      where: { id: Number(req.params.id) },
      include: { user: true, products: true }
    });
    if (!store) return res.status(404).json({ error: 'Loja não encontrada' });
    res.json(store);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Update store
app.put('/stores/:id', async (req, res) => {
  try {
    const { name, userId } = req.body;
    const store = await prisma.store.update({
      where: { id: Number(req.params.id) },
      data: { name, userId: userId ? Number(userId) : undefined }
    });
    res.json(store);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Delete store
app.delete('/stores/:id', async (req, res) => {
  try {
    await prisma.store.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (e) { res.status(400).json({ error: e.message }); }
});

/* -------- PRODUCTS (1-N com Store) -------- */
// Create product (body: { name, price, storeId })
app.post('/products', async (req, res) => {
  try {
    const { name, price, storeId } = req.body;
    const product = await prisma.product.create({
      data: { name, price: Number(price), storeId: Number(storeId) }
    });
    res.status(201).json(product);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Get all products (inclui loja e dono da loja)
app.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { store: { include: { user: true } } }
    });
    res.json(products);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Get product by id
app.get('/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
      include: { store: { include: { user: true } } }
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Update product
app.put('/products/:id', async (req, res) => {
  try {
    const { name, price, storeId } = req.body;
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: {
        name,
        price: price ? Number(price) : undefined,
        storeId: storeId ? Number(storeId) : undefined
      }
    });
    res.json(product);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Delete product
app.delete('/products/:id', async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (e) { res.status(400).json({ error: e.message }); }
});

/* -------- start server -------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
