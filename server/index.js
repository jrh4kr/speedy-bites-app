const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const config = require('./config');
const { Logger, errorHandler, requestLogger } = require('./logger');
const { upload, generateFileName, calculateChecksum, handleUploadError } = require('./uploadMiddleware');
const { optimizeImage, deleteImages } = require('./imageOptimizer');
const DatabaseManager = require('./database');
const { checkDatabaseHealth, databaseErrorHandler, withRetry, CircuitBreaker } = require('./resilience');

// Initialize logger
const logger = new Logger();

// Validate configuration
try {
  config.validate();
  logger.info('Configuration validated successfully');
} catch (error) {
  logger.error('Configuration validation failed', error);
  process.exit(1);
}

const app = express();

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// CORS setup from config
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: config.cors.methods,
  allowedHeaders: config.cors.allowedHeaders,
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use(requestLogger);

// Serve static files for uploads
app.use('/uploads', express.static(config.upload.directory));

// ============================================
// DATABASE CONFIGURATION
// ============================================

const dbManager = new DatabaseManager();
const circuitBreaker = new CircuitBreaker(5, 60000);

// Initialize database asynchronously
let pool;
(async () => {
  try {
    pool = await dbManager.initialize();
    logger.info('✅ Database connection pool ready');
  } catch (error) {
    logger.error('❌ Failed to initialize database pool', error);
    // Continue running but database operations will fail until connected
  }
})();

// Add database health check middleware
app.use(checkDatabaseHealth(dbManager));

const PORT = config.server.port;
const HOST = config.server.host;

// ============================================
// HELPER FUNCTIONS FOR RESILIENT QUERIES
// ============================================

/**
 * Execute query with circuit breaker and retry logic
 */
async function executeQuery(text, values = []) {
  return circuitBreaker.execute(async () => {
    if (!pool) {
      throw new Error('Database pool not initialized');
    }
    return dbManager.query(text, values);
  });
}

// ============ AUTHENTICATION ENDPOINTS ============

// Simple token generator (for demo purposes)
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Hash password (simple implementation for demo)
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists in database
    const { rows } = await pool.query('SELECT * FROM public.users WHERE email = $1 AND is_active = true', [email]);
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    const dbUser = rows[0];
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    // Verify password
    if (dbUser.password_hash !== passwordHash) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    const token = generateToken();
    
    const user = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name || email.split('@')[0],
      role: dbUser.role
    };

    // Update last_login timestamp
    await pool.query('UPDATE public.users SET last_login = now() WHERE id = $1', [dbUser.id]);

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register/Sign up endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const { rows: existingUsers } = await pool.query('SELECT id FROM public.users WHERE email = $1', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    // Insert new user
    const { rows } = await pool.query(
      'INSERT INTO public.users (email, password_hash, name, role, is_active) VALUES ($1, $2, $3, $4, true) RETURNING id, email, name, role',
      [email, passwordHash, name || email.split('@')[0], 'customer']
    );

    const dbUser = rows[0];
    const token = generateToken();
    
    const user = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role
    };

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

// ============ MENU ENDPOINTS ============

// ============ MENU ENDPOINTS ============

app.get('/api/categories', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, description, image_url, display_order, is_active FROM public.menu_categories WHERE is_active = true AND name NOT LIKE \'%Test%\' ORDER BY display_order');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.get('/api/menu', async (req, res) => {
  try {
    const { category } = req.query;
    let result;
    if (category) {
      result = await pool.query(
        'SELECT m.* FROM public.menu_items m JOIN public.menu_categories c ON m.category_id = c.id WHERE m.category_id = $1 AND c.name NOT LIKE \'%Test%\' AND m.name NOT LIKE \'%Test%\'',
        [category]
      );
    } else {
      result = await pool.query(
        'SELECT m.* FROM public.menu_items m JOIN public.menu_categories c ON m.category_id = c.id WHERE c.name NOT LIKE \'%Test%\' AND m.name NOT LIKE \'%Test%\' ORDER BY m.created_at DESC'
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.get('/api/health', (req, res) => {
  const dbStatus = dbManager.getStatus();
  const cbStatus = circuitBreaker.getStatus();
  
  res.json({ 
    ok: true,
    status: 'operational',
    database: dbStatus,
    circuitBreaker: cbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============ PRODUCT MANAGEMENT ENDPOINTS ============

// Get all products
app.get('/api/admin/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM public.menu_items ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
app.get('/api/admin/products/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM public.menu_items WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create new product with image
app.post('/api/admin/products', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category_id, preparation_time, is_featured } = req.body;

    // Validate required fields
    if (!name || !price || !category_id) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    let imageUrl = null;
    if (req.file) {
      const fileName = generateFileName(req.file.originalname);
      const result = await optimizeImage(req.file.buffer, 'products', fileName);
      
      if (!result.success) {
        return res.status(400).json({ error: 'Image optimization failed: ' + result.error });
      }
      
      // Use webp format with fallback to jpeg
      imageUrl = result.paths.webp || result.paths.jpeg;
    }

    const { rows } = await pool.query(
      'INSERT INTO public.menu_items (name, description, price, category_id, preparation_time, image_url, is_featured) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, description || null, price, category_id, preparation_time || null, imageUrl, is_featured === 'true']
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product with optional image
app.put('/api/admin/products/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category_id, preparation_time, is_featured, is_available } = req.body;
    const productId = req.params.id;

    // Get current product
    const currentProduct = await pool.query('SELECT * FROM public.menu_items WHERE id = $1', [productId]);
    if (currentProduct.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let imageUrl = currentProduct.rows[0].image_url;

    // Handle new image
    if (req.file) {
      const fileName = generateFileName(req.file.originalname);
      const result = await optimizeImage(req.file.buffer, 'products', fileName);
      
      if (!result.success) {
        return res.status(400).json({ error: 'Image optimization failed: ' + result.error });
      }
      
      // Delete old image if exists
      if (imageUrl) {
        const oldFileName = path.basename(imageUrl);
        await deleteImages('products', oldFileName);
      }

      imageUrl = result.paths.webp || result.paths.jpeg;
    }

    const { rows } = await pool.query(
      'UPDATE public.menu_items SET name = $1, description = $2, price = $3, category_id = $4, preparation_time = $5, image_url = $6, is_featured = $7, is_available = $8, updated_at = NOW() WHERE id = $9 RETURNING *',
      [
        name || currentProduct.rows[0].name,
        description !== undefined ? description : currentProduct.rows[0].description,
        price || currentProduct.rows[0].price,
        category_id || currentProduct.rows[0].category_id,
        preparation_time || currentProduct.rows[0].preparation_time,
        imageUrl,
        is_featured !== undefined ? is_featured === 'true' : currentProduct.rows[0].is_featured,
        is_available !== undefined ? is_available === 'true' : currentProduct.rows[0].is_available,
        productId
      ]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product and its image
app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    // Get product to get image
    const { rows } = await pool.query('SELECT * FROM public.menu_items WHERE id = $1', [productId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = rows[0];

    // Delete image if exists
    if (product.image_url) {
      const fileName = path.basename(product.image_url);
      await deleteImages('products', fileName);
    }

    // Delete from database
    await pool.query('DELETE FROM public.menu_items WHERE id = $1', [productId]);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ============ CATEGORY MANAGEMENT ENDPOINTS ============

// Get all categories
app.get('/api/admin/categories', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM public.menu_categories ORDER BY display_order');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create new category with image
app.post('/api/admin/categories', upload.single('image'), async (req, res) => {
  try {
    const { name, description, display_order, is_active } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    let imageUrl = null;
    if (req.file) {
      const fileName = generateFileName(req.file.originalname);
      const result = await optimizeImage(req.file.buffer, 'categories', fileName);
      
      if (!result.success) {
        return res.status(400).json({ error: 'Image optimization failed: ' + result.error });
      }
      
      imageUrl = result.paths.webp || result.paths.jpeg;
    }

    const { rows } = await pool.query(
      'INSERT INTO public.menu_categories (name, description, image_url, display_order, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description || null, imageUrl, display_order || null, is_active !== 'false']
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category with optional image
app.put('/api/admin/categories/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, display_order, is_active } = req.body;
    const categoryId = req.params.id;

    const currentCategory = await pool.query('SELECT * FROM public.menu_categories WHERE id = $1', [categoryId]);
    if (currentCategory.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    let imageUrl = currentCategory.rows[0].image_url;

    if (req.file) {
      const fileName = generateFileName(req.file.originalname);
      const result = await optimizeImage(req.file.buffer, 'categories', fileName);
      
      if (!result.success) {
        return res.status(400).json({ error: 'Image optimization failed: ' + result.error });
      }

      if (imageUrl) {
        const oldFileName = path.basename(imageUrl);
        await deleteImages('categories', oldFileName);
      }

      imageUrl = result.paths.webp || result.paths.jpeg;
    }

    const { rows } = await pool.query(
      'UPDATE public.menu_categories SET name = $1, description = $2, image_url = $3, display_order = $4, is_active = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
      [
        name || currentCategory.rows[0].name,
        description !== undefined ? description : currentCategory.rows[0].description,
        imageUrl,
        display_order || currentCategory.rows[0].display_order,
        is_active !== undefined ? is_active !== 'false' : currentCategory.rows[0].is_active,
        categoryId
      ]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
app.delete('/api/admin/categories/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;

    const { rows } = await pool.query('SELECT * FROM public.menu_categories WHERE id = $1', [categoryId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const category = rows[0];

    if (category.image_url) {
      const fileName = path.basename(category.image_url);
      await deleteImages('categories', fileName);
    }

    await pool.query('DELETE FROM public.menu_categories WHERE id = $1', [categoryId]);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ============ ORDERS ENDPOINTS ============

// Get all orders for authenticated user
app.get('/api/orders', async (req, res) => {
  try {
    // For now, return empty array since we don't have a full orders table
    // In production, you would query based on the authenticated user
    const { rows } = await pool.query(
      'SELECT * FROM public.orders ORDER BY created_at DESC LIMIT 50'
    ).catch(() => ({ rows: [] }));
    
    res.json(rows || []);
  } catch (err) {
    logger.error('Failed to fetch orders', err);
    res.json([]); // Return empty array on error
  }
});

// Get single order by ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM public.orders WHERE id = $1',
      [req.params.id]
    ).catch(() => ({ rows: [] }));
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    logger.error('Failed to fetch order', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 handler
app.use((req, res) => {
  logger.warn('404 Not Found', {
    method: req.method,
    url: req.url,
    ip: req.ip,
  });
  res.status(404).json({ error: 'Not Found', message: 'The requested resource does not exist' });
});

// Global error handler
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

const server = app.listen(PORT, HOST, () => {
  logger.info(`🚀 Server started`, {
    port: PORT,
    host: HOST,
    environment: config.server.nodeEnv,
    uploadDir: config.upload.directory,
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    pool.end(() => {
      logger.info('Database pool closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    pool.end(() => {
      logger.info('Database pool closed');
      process.exit(0);
    });
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
