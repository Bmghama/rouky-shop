import express from "express";
import "express-async-errors";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import winston from "winston";
import { db, collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, limit } from "./src/lib/firebase.js";

dotenv.config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

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

async function seedData() {
  const assetsSnap = await getDocs(collection(db, 'site_assets'));
  if (assetsSnap.empty) {
    const defaultAssets = [
      { key: 'hero_main', url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2000', label: 'Bannière Accueil Principale', category: 'hero', content: JSON.stringify({ label: "Favori de la saison", title: "Pure Élégance", subtitle: "Look de soirée" }) },
      { key: 'hero_secondary', url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000', label: 'Bannière Accueil Secondaire', category: 'hero', content: null },
      { key: 'cat_vetements', url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800', label: 'Image Rayon Vêtements', category: 'category', content: null },
      { key: 'cat_chaussures', url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800', label: 'Image Rayon Chaussures', category: 'category', content: null },
      { key: 'cat_sacs', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800', label: 'Image Rayon Sacs', category: 'category', content: null },
      { key: 'cat_bijoux', url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800', label: 'Image Rayon Bijoux', category: 'category', content: null },
      { key: 'about_vision', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200', label: 'Image Vision (Page À Propos)', category: 'about', content: null }
    ];
    for (const a of defaultAssets) {
      await addDoc(collection(db, 'site_assets'), a);
    }
  }

  const catSnap = await getDocs(collection(db, 'categories'));
  if (catSnap.empty) {
    const categories = ['Vêtements femme', 'Chaussures femme', 'Sacs', 'Bijoux', 'Lunettes', 'Foulards', 'Accessoires'];
    for (const cat of categories) {
      await addDoc(collection(db, 'categories'), { name: cat });
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  app.use((req, res, next) => {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; font-src 'self' data: https://*.public.blob.vercel-storage.com https://fonts.gstatic.com; img-src 'self' data: https://res.cloudinary.com blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseio.com https://*.firebaseapp.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; connect-src 'self' https://*.turso.io wss://*.turso.io https://*.googleapis.com wss://*.firebaseio.com;"
    );
    next();
  });

  try {
    await seedData();
  } catch (error) {
    console.error("ERREUR CRITIQUE FIREBASE : Impossible d'exécuter seedData. Connexion Firestore échouée !");
    console.error(error);
  }

  // Create default admin if not exists
  try {
    const adminsRef = collection(db, 'admins');
    const qAdmin = query(adminsRef, where("username", "==", "admis"));
    const adminSnap = await getDocs(qAdmin);
    
    if (adminSnap.empty) {
      const adminPass = process.env.ADMIN_PASSWORD || "rouky9323";
      const hashedPassword = await bcrypt.hash(adminPass, 10);
      await addDoc(collection(db, 'admins'), {
        username: "admis",
        password: hashedPassword
      });
      console.log("Admin account 'admis' created automatically.");
    }
  } catch (error) {
    console.error("ERREUR CRITIQUE FIREBASE : Impossible de vérifier ou créer l'administrateur. Vérifiez vos variables d'environnement Firestore !");
    console.error(error);
  }

  // --- API ROUTES ---

  async function logActivity(action: string, details?: string) {
    await addDoc(collection(db, 'activity_log'), {
      action,
      details: details || null,
      timestamp: new Date().toISOString()
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

  app.get("/api/products", async (req, res) => {
    try {
      const { category, search, sort, status, id } = req.query;
      
      // Simplification for Firestore: fetch all and filter in memory since we don't have indexes and complex queries setup
      const productsSnap = await getDocs(collection(db, 'products'));
      let products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

      if (id) products = products.filter(p => p.id === id);
      if (category) products = products.filter(p => p.category_name === category);
      if (search) {
        const s = String(search).toLowerCase();
        products = products.filter(p => p.name.toLowerCase().includes(s) || (p.description && p.description.toLowerCase().includes(s)));
      }
      if (status) products = products.filter(p => p.status === status);
      else products = products.filter(p => p.status === 'active');

      if (sort === "price_asc") products.sort((a, b) => a.price - b.price);
      else if (sort === "price_desc") products.sort((a, b) => b.price - a.price);
      else if (sort === "views") products.sort((a, b) => (b.views || 0) - (a.views || 0));
      else products.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

      // Enrich with reviews
      const reviewsSnap = await getDocs(collection(db, 'reviews'));
      const reviews = reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      
      products = products.map(p => {
        const pReviews = reviews.filter(r => r.product_id === p.id && r.status === 'approved');
        const avg_rating = pReviews.length ? pReviews.reduce((sum, r) => sum + r.rating, 0) / pReviews.length : 0;
        return { ...p, avg_rating, review_count: pReviews.length };
      });

      res.json(products);
    } catch (error: any) {
      logger.error("GET /api/products error", { error: error.message });
      res.json([]); // Return empty array if DB fails
    }
  });

  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const q = query(collection(db, 'reviews'), where("product_id", "==", req.params.id), where("status", "==", "approved"));
      const snap = await getDocs(q);
      const reviews = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      reviews.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      res.json(reviews);
    } catch (error: any) {
      logger.error("GET /api/products/:id/reviews error", { error: error.message });
      res.json([]); // Return empty array if DB fails
    }
  });

  app.post("/api/products/:id/reviews", async (req, res) => {
    try {
      const { customer_name, rating, comment, image_url } = req.body;
      const docRef = await addDoc(collection(db, 'reviews'), {
        product_id: req.params.id,
        customer_name,
        rating: Number(rating),
        comment,
        image_url: image_url || null,
        status: 'approved',
        created_at: new Date().toISOString()
      });
      
      await logActivity("New Review", `New review for product ${req.params.id} by ${customer_name}`);
      res.json({ success: true, id: docRef.id });
    } catch (error: any) {
      logger.error("POST /api/products/:id/reviews error", { error: error.message });
      res.status(500).json({ error: "Failed to add review" });
    }
  });

  app.post("/api/newsletter", async (req, res) => {
    try {
      const { whatsapp } = req.body;
      if (!whatsapp) return res.status(400).json({ error: "WhatsApp number required" });
      const q = query(collection(db, 'newsletter'), where("whatsapp", "==", whatsapp));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return res.json({ success: true, alreadyExists: true });
      }
      await addDoc(collection(db, 'newsletter'), { whatsapp, created_at: new Date().toISOString() });
      res.json({ success: true });
    } catch (error: any) {
      logger.error("POST /api/newsletter error", { error: error.message });
      res.status(500).json({ error: "Failed to subscribe" });
    }
  });

  app.get("/api/admin/reviews", authenticateToken, async (req, res) => {
    try {
      const { status, rating } = req.query;
      const snap = await getDocs(collection(db, 'reviews'));
      let items = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      
      if (status) items = items.filter(i => i.status === status);
      if (rating) items = items.filter(i => Number(i.rating) === Number(rating));

      // Fetch product names
      const pSnap = await getDocs(collection(db, 'products'));
      const products = pSnap.docs.reduce((acc: any, d) => { acc[d.id] = d.data().name; return acc; }, {});
      
      items = items.map(i => ({ ...i, product_name: products[i.product_id] }));
      items.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      res.json(items);
    } catch (error: any) {
      logger.error("GET /api/admin/reviews error", { error: error.message });
      res.json([]); // Return empty array if DB fails
    }
  });

  app.patch("/api/admin/reviews/:id", authenticateToken, async (req, res) => {
    try {
      const { status, is_featured } = req.body;
      const updateData: any = {};
      if (status !== undefined) updateData.status = status;
      if (is_featured !== undefined) updateData.is_featured = is_featured ? 1 : 0;
      
      if (Object.keys(updateData).length > 0) {
        await updateDoc(doc(db, 'reviews', req.params.id), updateData);
      }
      res.json({ success: true });
    } catch (error: any) {
      logger.error("PATCH /api/admin/reviews/:id error", { error: error.message });
      res.status(500).json({ error: "Failed to update review" });
    }
  });

  app.delete("/api/admin/reviews/:id", authenticateToken, async (req, res) => {
    try {
      await deleteDoc(doc(db, 'reviews', req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      logger.error("DELETE /api/admin/reviews/:id error", { error: error.message });
      res.status(500).json({ error: "Failed to delete review" });
    }
  });

  app.get("/api/admin/assets", authenticateToken, async (req, res) => {
    try {
      const snap = await getDocs(collection(db, 'site_assets'));
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      res.json(items);
    } catch (error: any) {
      logger.error("GET /api/admin/assets error", { error: error.message });
      res.json([]); // Return empty array if DB fails
    }
  });

  app.patch("/api/admin/assets/:id", authenticateToken, async (req, res) => {
    try {
      const { url, content } = req.body;
      const updateData: any = {};
      if (url !== undefined) updateData.url = url;
      if (content !== undefined) updateData.content = content;
      
      if (Object.keys(updateData).length > 0) {
        await updateDoc(doc(db, 'site_assets', req.params.id), updateData);
      }
      res.json({ success: true });
    } catch (error: any) {
      logger.error("PATCH /api/admin/assets/:id error", { error: error.message });
      res.status(500).json({ error: "Failed to update asset" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    const { customerName, customerPhone, neighborhood, totalPrice, items } = req.body;
    try {
      const orderRef = await addDoc(collection(db, 'orders'), {
        customer_name: customerName,
        customer_phone: customerPhone,
        neighborhood,
        total_price: totalPrice,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      
      for (const item of items) {
        await addDoc(collection(db, 'order_items'), {
          order_id: orderRef.id,
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
          color: item.color || null,
          size: item.size || null
        });
      }
      res.json({ success: true, orderId: orderRef.id });
    } catch (err) {
      res.status(500).json({ error: "Order failed" });
    }
  });

  app.get("/api/admin/orders", authenticateToken, async (req, res) => {
    try {
      const snap = await getDocs(collection(db, 'orders'));
      const orders = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      orders.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      
      const itemsSnap = await getDocs(collection(db, 'order_items'));
      const allItems = itemsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      
      for (let order of orders) {
        order.items = allItems.filter(i => i.order_id === order.id);
      }
      res.json(orders);
    } catch (error: any) {
      logger.error("GET /api/admin/orders error", { error: error.message });
      res.json([]); // Return empty array if DB fails
    }
  });

  app.patch("/api/admin/orders/:id", authenticateToken, async (req, res) => {
    try {
      await updateDoc(doc(db, 'orders', req.params.id), { status: req.body.status });
      res.json({ success: true });
    } catch (error: any) {
      logger.error("PATCH /api/admin/orders/:id error", { error: error.message });
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  app.post("/api/admin/products", authenticateToken, async (req, res) => {
    try {
      const p = req.body;
      // Get category name
      let catName = "";
      if (p.category_id) {
        const cDoc = await getDoc(doc(db, 'categories', String(p.category_id)));
        if (cDoc.exists()) catName = cDoc.data().name;
      }

      const docRef = await addDoc(collection(db, 'products'), {
        name: p.name,
        price: Number(p.price),
        old_price: p.old_price ? Number(p.old_price) : null,
        description: p.description || "",
        long_description: p.long_description || "",
        category_id: p.category_id || "",
        category_name: catName,
        sub_category: p.sub_category || "",
        image_url: p.image_url || "",
        gallery_urls: p.gallery_urls || "[]",
        colors: p.colors || "[]",
        sizes: p.sizes || "[]",
        stock: Number(p.stock || 0),
        badge: p.badge || "",
        highlights: p.highlights || "[]",
        status: p.status || "active",
        views: 0,
        whatsapp_clicks: 0,
        created_at: new Date().toISOString()
      });
      await logActivity("Product Created", `New product: ${p.name}`);
      res.json({ success: true, id: docRef.id });
    } catch (error: any) {
      logger.error("POST /api/admin/products error", { error: error.message });
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/admin/products/:id", authenticateToken, async (req, res) => {
    try {
      const p = req.body;
      let catName = "";
      if (p.category_id) {
        const cDoc = await getDoc(doc(db, 'categories', String(p.category_id)));
        if (cDoc.exists()) catName = cDoc.data().name;
        else {
            // If category_id is not a document ID but the category was added differently
            const catsSnap = await getDocs(collection(db, 'categories'));
            const found = catsSnap.docs.find(d => d.id === p.category_id || d.data().name === p.category_id);
            if (found) catName = found.data().name;
        }
      }
      
      await updateDoc(doc(db, 'products', req.params.id), {
        name: p.name,
        price: Number(p.price),
        old_price: p.old_price ? Number(p.old_price) : null,
        description: p.description,
        long_description: p.long_description,
        category_id: p.category_id,
        category_name: catName || p.category_name || "",
        sub_category: p.sub_category,
        image_url: p.image_url,
        gallery_urls: p.gallery_urls,
        colors: p.colors,
        sizes: p.sizes,
        stock: Number(p.stock),
        badge: p.badge,
        highlights: p.highlights,
        status: p.status
      });
      await logActivity("Product Updated", `Product updated: ${p.name}`);
      res.json({ success: true });
    } catch (error: any) {
      logger.error("PUT /api/admin/products/:id error", { error: error.message });
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", authenticateToken, async (req, res) => {
    try {
      await deleteDoc(doc(db, 'products', req.params.id));
      await logActivity("Product Deleted", `Product deleted: ${req.params.id}`);
      res.json({ success: true });
    } catch (error: any) {
      logger.error("DELETE /api/admin/products/:id error", { error: error.message });
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const snap = await getDocs(collection(db, 'categories'));
      res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error: any) {
      logger.error("GET /api/categories error", { error: error.message });
      res.json([]); // Return empty array if DB fails
    }
  });

  app.get("/api/admin/stats", authenticateToken, async (req, res) => {
    try {
      const visitors = await getDocs(collection(db, 'visitors'));
      const orders = await getDocs(collection(db, 'orders'));
      const products = await getDocs(collection(db, 'products'));
      const activitySnap = await getDocs(query(collection(db, 'activity_log'), limit(10)));
      
      const clicks = products.docs.reduce((sum, d) => sum + (Number(d.data().whatsapp_clicks) || 0), 0);
      const activity = activitySnap.docs.map(d => ({ id: d.id, ...d.data() }));
      activity.sort((a: any, b: any) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
      
      // Count low stock products
      const lowStockCount = products.docs.filter((d) => Number(d.data().stock || 0) <= 5).length;
      
      // Get most viewed products
      const mostViewed = products.docs
        .map((d) => ({ id: d.id, name: d.data().name, views: Number(d.data().views || 0) }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);
      
      res.json({
        totalVisitors: visitors.size,
        totalOrders: orders.size,
        totalWhatsAppClicks: clicks,
        lowStockCount,
        mostViewed,
        recentActivity: activity
      });
    } catch (error: any) {
      logger.error("GET /api/admin/stats error", { error: error.message });
      res.json({
        totalVisitors: 0,
        totalOrders: 0,
        totalWhatsAppClicks: 0,
        lowStockCount: 0,
        mostViewed: [],
        recentActivity: []
      });
    }
  });

  app.post("/api/admin/categories", authenticateToken, async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: "Category name required" });
      const docRef = await addDoc(collection(db, 'categories'), { name });
      await logActivity("Category Created", `New category: ${name}`);
      res.json({ success: true, id: docRef.id });
    } catch (error: any) {
      logger.error("POST /api/admin/categories error", { error: error.message });
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.delete("/api/admin/categories/:id", authenticateToken, async (req, res) => {
    try {
      await deleteDoc(doc(db, 'categories', req.params.id));
      await logActivity("Category Deleted", `Category deleted: ${req.params.id}`);
      res.json({ success: true });
    } catch (error: any) {
      logger.error("DELETE /api/admin/categories/:id error", { error: error.message });
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  app.get("/api/admin/newsletter", authenticateToken, async (req, res) => {
    try {
      const snap = await getDocs(collection(db, 'newsletter'));
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      items.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      res.json(items);
    } catch (error: any) {
      logger.error("GET /api/admin/newsletter error", { error: error.message });
      res.json([]);
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const snap = await getDocs(query(collection(db, 'admins'), where("username", "==", username)));
      if (!snap.empty) {
        const admin = snap.docs[0].data();
        if (await bcrypt.compare(password, admin.password)) {
          const token = jwt.sign({ id: snap.docs[0].id, username: admin.username }, JWT_SECRET, { expiresIn: '1d' });
          return res.json({ token });
        }
      }
      res.status(401).json({ error: "Invalid credentials" });
    } catch (error: any) {
      console.error("Erreur détaillée lors de la connexion Firebase (/api/admin/login):", error);
      res.status(500).json({ error: "Erreur de connexion Firestore", details: error.message });
    }
  });

  app.post("/api/admin/upload", authenticateToken, upload.single("image"), (req: any, res) => {
    res.json({ success: true, imageUrl: req.file.path });
  });

  app.post("/api/upload", upload.single("image"), (req: any, res) => {
    res.json({ success: true, imageUrl: req.file.path });
  });

  app.post("/api/track-visitor", async (req, res) => {
    try {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      await addDoc(collection(db, 'visitors'), { ip_address: String(ip), timestamp: new Date().toISOString() });
      res.json({ success: true });
    } catch (error: any) {
      logger.error("POST /api/track-visitor error", { error: error.message });
      res.json({ success: true }); // Don't block if tracking fails
    }
  });

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error("Unhandled error", { error: err.message, stack: err.stack, path: req.path });
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, () => logger.info(`Server on port ${PORT}`));
}

startServer();
