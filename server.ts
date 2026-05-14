
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import db, { initSchema, seedData } from "./src/lib/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: "rouky-shop",
    allowed_formats: ["jpg", "png", "webp"],
    public_id: Date.now() + "-" + file.originalname.split('.')[0],
  }),
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const JWT_SECRET = process.env.JWT_SECRET || "rouky-shop-secret-key-premium";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Initialize DB Schema and Seed
  await initSchema();
  await seedData();

  // Create default admin if not exists
  const adminExists = await db.execute("SELECT count(*) as count FROM admins");
  if (Number(adminExists.rows[0].count) === 0) {
    const adminPass = process.env.ADMIN_PASSWORD || "admin123";
    const hashedPassword = await bcrypt.hash(adminPass, 10);
    await db.execute({
      sql: "INSERT INTO admins (username, password) VALUES (?, ?)",
      args: ["admin", hashedPassword]
    });
  }

  // --- API ROUTES ---

  async function logActivity(action: string, details?: string) {
    await db.execute({
      sql: "INSERT INTO activity_log (action, details) VALUES (?, ?)",
      args: [action, details || null]
    });
  }

  function authenticateToken(req: any, res: any, next: any) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  }

  // Public: Get products
  app.get("/api/products", async (req, res) => {
    const { category, search, sort, status, id } = req.query;
    let query = `
      SELECT 
        p.*, 
        c.name as category_name,
        (SELECT AVG(rating) FROM reviews WHERE product_id = p.id AND status = 'approved') as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE product_id = p.id AND status = 'approved') as review_count
      FROM products p 
      JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (id) {
      query += " AND p.id = ?";
      params.push(id);
    }
    if (category) {
      query += " AND c.name = ?";
      params.push(category);
    }
    if (search) {
      query += " AND (p.name LIKE ? OR p.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      query += " AND p.status = ?";
      params.push(status);
    } else {
      query += " AND p.status = 'active'";
    }

    if (sort === "price_asc") query += " ORDER BY p.price ASC";
    else if (sort === "price_desc") query += " ORDER BY p.price DESC";
    else if (sort === "views") query += " ORDER BY p.views DESC";
    else query += " ORDER BY p.created_at DESC";

    const result = await db.execute({ sql: query, args: params });
    res.json(result.rows);
  });

  // Public: Get product reviews
  app.get("/api/products/:id/reviews", async (req, res) => {
    const result = await db.execute({
      sql: "SELECT * FROM reviews WHERE product_id = ? AND status = 'approved' ORDER BY created_at DESC",
      args: [req.params.id]
    });
    res.json(result.rows);
  });

  // Public: Post review
  app.post("/api/products/:id/reviews", async (req, res) => {
    const { customer_name, rating, comment, image_url } = req.body;
    const result = await db.execute({
      sql: "INSERT INTO reviews (product_id, customer_name, rating, comment, image_url, status) VALUES (?, ?, ?, ?, ?, 'approved')",
      args: [req.params.id, customer_name, rating, comment, image_url || null]
    });
    
    await logActivity("New Review", `New review for product ${req.params.id} by ${customer_name}`);
    res.json({ success: true, id: Number(result.lastInsertRowid) });
  });

  // Public: Newsletter
  app.post("/api/newsletter", async (req, res) => {
    const { whatsapp } = req.body;
    if (!whatsapp) return res.status(400).json({ error: "WhatsApp number required" });
    try {
      await db.execute({ sql: "INSERT INTO newsletter (whatsapp) VALUES (?)", args: [whatsapp] });
      res.json({ success: true });
    } catch (err: any) {
      res.json({ success: true, alreadyExists: true });
    }
  });

  // Admin: Newsletter
  app.get("/api/admin/newsletter", authenticateToken, async (req, res) => {
    const result = await db.execute("SELECT * FROM newsletter ORDER BY created_at DESC");
    res.json(result.rows);
  });

  // Admin: Reviews
  app.get("/api/admin/reviews", authenticateToken, async (req, res) => {
    const { status, rating } = req.query;
    let query = "SELECT r.*, p.name as product_name FROM reviews r JOIN products p ON r.product_id = p.id WHERE 1=1";
    const params: any[] = [];
    if (status) { query += " AND r.status = ?"; params.push(status); }
    if (rating) { query += " AND r.rating = ?"; params.push(rating); }
    query += " ORDER BY r.created_at DESC";
    const result = await db.execute({ sql: query, args: params });
    res.json(result.rows);
  });

  app.patch("/api/admin/reviews/:id", authenticateToken, async (req, res) => {
    const { status, is_featured } = req.body;
    if (status !== undefined) {
      await db.execute({ sql: "UPDATE reviews SET status = ? WHERE id = ?", args: [status, req.params.id] });
    }
    if (is_featured !== undefined) {
      await db.execute({ sql: "UPDATE reviews SET is_featured = ? WHERE id = ?", args: [is_featured ? 1 : 0, req.params.id] });
    }
    res.json({ success: true });
  });

  app.delete("/api/admin/reviews/:id", authenticateToken, async (req, res) => {
    await db.execute({ sql: "DELETE FROM reviews WHERE id = ?", args: [req.params.id] });
    res.json({ success: true });
  });

  // Site Assets
  app.get("/api/site-assets", async (req, res) => {
    const result = await db.execute("SELECT * FROM site_assets");
    res.json(result.rows);
  });

  app.patch("/api/admin/assets/:id", authenticateToken, async (req, res) => {
    const { url, content } = req.body;
    if (url !== undefined) await db.execute({ sql: "UPDATE site_assets SET url = ? WHERE id = ?", args: [url, req.params.id] });
    if (content !== undefined) await db.execute({ sql: "UPDATE site_assets SET content = ? WHERE id = ?", args: [content, req.params.id] });
    res.json({ success: true });
  });

  // Orders
  app.post("/api/orders", async (req, res) => {
    const { customerName, customerPhone, neighborhood, totalPrice, items } = req.body;
    try {
      const orderRes = await db.execute({
        sql: "INSERT INTO orders (customer_name, customer_phone, neighborhood, total_price) VALUES (?, ?, ?, ?)",
        args: [customerName, customerPhone, neighborhood, totalPrice]
      });
      const orderId = Number(orderRes.lastInsertRowid);
      for (const item of items) {
        await db.execute({
          sql: "INSERT INTO order_items (order_id, product_id, product_name, quantity, price, color, size) VALUES (?, ?, ?, ?, ?, ?, ?)",
          args: [orderId, item.id, item.name, item.quantity, item.price, item.color || null, item.size || null]
        });
      }
      res.json({ success: true, orderId });
    } catch (err) {
      res.status(500).json({ error: "Order failed" });
    }
  });

  app.get("/api/admin/orders", authenticateToken, async (req, res) => {
    const ordersRes = await db.execute("SELECT * FROM orders ORDER BY created_at DESC");
    const orders = ordersRes.rows;
    for (let order of orders) {
      const itemsRes = await db.execute({ sql: "SELECT * FROM order_items WHERE order_id = ?", args: [order.id] });
      (order as any).items = itemsRes.rows;
    }
    res.json(orders);
  });

  app.patch("/api/admin/orders/:id", authenticateToken, async (req, res) => {
    await db.execute({ sql: "UPDATE orders SET status = ? WHERE id = ?", args: [req.body.status, req.params.id] });
    res.json({ success: true });
  });

  // Products Admin
  app.post("/api/admin/products", authenticateToken, async (req, res) => {
    const p = req.body;
    const resProd = await db.execute({
      sql: `INSERT INTO products (name, price, old_price, description, long_description, category_id, sub_category, image_url, gallery_urls, colors, sizes, stock, badge, highlights, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [p.name, p.price, p.old_price, p.description, p.long_description, p.category_id, p.sub_category, p.image_url, p.gallery_urls, p.colors, p.sizes, p.stock, p.badge, p.highlights, p.status]
    });
    res.json({ success: true, id: Number(resProd.lastInsertRowid) });
  });

  app.put("/api/admin/products/:id", authenticateToken, async (req, res) => {
    const p = req.body;
    await db.execute({
      sql: `UPDATE products SET name=?, price=?, old_price=?, description=?, long_description=?, category_id=?, sub_category=?, image_url=?, gallery_urls=?, colors=?, sizes=?, stock=?, badge=?, highlights=?, status=? WHERE id=?`,
      args: [p.name, p.price, p.old_price, p.description, p.long_description, p.category_id, p.sub_category, p.image_url, p.gallery_urls, p.colors, p.sizes, p.stock, p.badge, p.highlights, p.status, req.params.id]
    });
    res.json({ success: true });
  });

  app.delete("/api/admin/products/:id", authenticateToken, async (req, res) => {
    await db.execute({ sql: "DELETE FROM products WHERE id = ?", args: [req.params.id] });
    res.json({ success: true });
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    const result = await db.execute("SELECT * FROM categories");
    res.json(result.rows);
  });

  // Stats
  app.get("/api/admin/stats", authenticateToken, async (req, res) => {
    const visitors = await db.execute("SELECT count(*) as count FROM visitors");
    const orders = await db.execute("SELECT count(*) as count FROM orders");
    const clicks = await db.execute("SELECT SUM(whatsapp_clicks) as count FROM products");
    const activity = await db.execute("SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT 10");
    
    res.json({
      totalVisitors: Number(visitors.rows[0].count),
      totalOrders: Number(orders.rows[0].count),
      totalWhatsAppClicks: Number(clicks.rows[0].count || 0),
      recentActivity: activity.rows
    });
  });

  // Auth
  app.post("/api/admin/login", async (req, res) => {
    const { username, password } = req.body;
    const result = await db.execute({ sql: "SELECT * FROM admins WHERE username = ?", args: [username] });
    const admin = result.rows[0] as any;
    if (admin && await bcrypt.compare(password, admin.password)) {
      const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '1d' });
      res.json({ token });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Uploads
  app.post("/api/admin/upload", authenticateToken, upload.single("image"), (req: any, res) => {
    res.json({ success: true, imageUrl: req.file.path });
  });

  app.post("/api/upload", upload.single("image"), (req: any, res) => {
    res.json({ success: true, imageUrl: req.file.path });
  });

  app.post("/api/track-visitor", async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await db.execute({ sql: "INSERT INTO visitors (ip_address) VALUES (?)", args: [String(ip)] });
    res.json({ success: true });
  });

  // Vite
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, () => console.log(`Server on port ${PORT}`));
}

startServer();
