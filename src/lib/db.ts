
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.DATABASE_URL || 'file:database.sqlite';
const authToken = process.env.DATABASE_AUTH_TOKEN;

const db = createClient({
  url,
  authToken,
});

// Initialize schema helper
export async function initSchema() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      long_description TEXT,
      price INTEGER NOT NULL,
      old_price INTEGER,
      category_id INTEGER,
      sub_category TEXT,
      image_url TEXT,
      gallery_urls TEXT DEFAULT '[]',
      colors TEXT DEFAULT '[]',
      sizes TEXT DEFAULT '[]',
      stock INTEGER DEFAULT 0,
      badge TEXT,
      highlights TEXT DEFAULT '[]',
      status TEXT DEFAULT 'active',
      views INTEGER DEFAULT 0,
      whatsapp_clicks INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT,
      customer_phone TEXT,
      neighborhood TEXT,
      total_price INTEGER,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      product_id INTEGER,
      product_name TEXT,
      quantity INTEGER,
      price INTEGER,
      color TEXT,
      size TEXT,
      FOREIGN KEY (order_id) REFERENCES orders (id),
      FOREIGN KEY (product_id) REFERENCES products (id)
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS visitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      customer_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      image_url TEXT,
      status TEXT DEFAULT 'approved',
      is_featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products (id)
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS site_assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      url TEXT NOT NULL,
      label TEXT,
      content TEXT,
      category TEXT DEFAULT 'general'
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS newsletter (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      whatsapp TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrations for missing columns (Turso/LibSQL specific check)
  const tables = ['products', 'orders', 'site_assets'];
  for (const table of tables) {
    const columnsRes = await db.execute(`PRAGMA table_info(${table})`);
    const existingColumns = columnsRes.rows.map((c: any) => c.name);

    if (table === 'products') {
      const required = [
        { name: 'long_description', type: 'TEXT' },
        { name: 'old_price', type: 'INTEGER' },
        { name: 'sub_category', type: 'TEXT' },
        { name: 'gallery_urls', type: "TEXT DEFAULT '[]'" },
        { name: 'colors', type: "TEXT DEFAULT '[]'" },
        { name: 'sizes', type: "TEXT DEFAULT '[]'" },
        { name: 'stock', type: 'INTEGER DEFAULT 0' },
        { name: 'badge', type: 'TEXT' },
        { name: 'highlights', type: "TEXT DEFAULT '[]'" },
        { name: 'status', type: "TEXT DEFAULT 'active'" },
        { name: 'whatsapp_clicks', type: 'INTEGER DEFAULT 0' }
      ];
      for (const col of required) {
        if (!existingColumns.includes(col.name)) {
          try { await db.execute(`ALTER TABLE products ADD COLUMN ${col.name} ${col.type}`); } catch(e) {}
        }
      }
    }
    if (table === 'orders') {
      const required = [
        { name: 'neighborhood', type: 'TEXT' },
        { name: 'total_price', type: 'INTEGER' }
      ];
      for (const col of required) {
        if (!existingColumns.includes(col.name)) {
          try { await db.execute(`ALTER TABLE orders ADD COLUMN ${col.name} ${col.type}`); } catch(e) {}
        }
      }
    }
    if (table === 'site_assets' && !existingColumns.includes('content')) {
      try { await db.execute(`ALTER TABLE site_assets ADD COLUMN content TEXT`); } catch(e) {}
    }
  }
}

// Seed data helper
export async function seedData() {
  const assetCount = await db.execute('SELECT count(*) as count FROM site_assets');
  const catCount = await db.execute('SELECT count(*) as count FROM categories');

  if (Number(assetCount.rows[0].count) === 0) {
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
      await db.execute({
        sql: 'INSERT OR IGNORE INTO site_assets (key, url, label, category, content) VALUES (?, ?, ?, ?, ?)',
        args: [a.key, a.url, a.label, a.category, a.content]
      });
    }
  }

  if (Number(catCount.rows[0].count) === 0) {
    const categories = ['Vêtements femme', 'Chaussures femme', 'Sacs', 'Bijoux', 'Lunettes', 'Foulards', 'Accessoires'];
    for (const cat of categories) {
      await db.execute({ sql: 'INSERT INTO categories (name) VALUES (?)', args: [cat] });
    }
  }
}

export default db;
