# Quick Start: Image Management System

## Starting the System

### 1. Start the Backend (if not already running)
```bash
cd /home/mall0y/Downloads/speedy-bites-app-main
DATABASE_URL='postgresql://mike_admin:Mwa$0152@localhost:54812/speedy_bites' node server/index.js
```

### 2. Start the Frontend (in another terminal)
```bash
cd /home/mall0y/Downloads/speedy-bites-app-main
npm run dev
```

### 3. Access the Admin Dashboard
- Navigate to: `http://localhost:5173/admin/login`
- Login with admin credentials
- Go to **Menu** → **Products/Categories** to manage items

## API Endpoints (Testing)

### Test Product Upload with Image
```bash
curl -X POST http://localhost:4000/api/admin/products \
  -F "image=@/path/to/your/image.jpg" \
  -F "name=Your Product Name" \
  -F "description=Product description" \
  -F "price=500" \
  -F "category_id=9a333ae8-4cb9-4bce-b328-38352ea55a60"
```

### Test Category Upload with Image
```bash
curl -X POST http://localhost:4000/api/admin/categories \
  -F "image=@/path/to/your/image.jpg" \
  -F "name=Category Name" \
  -F "description=Category description"
```

### List All Products
```bash
curl http://localhost:4000/api/admin/products
```

### List All Categories
```bash
curl http://localhost:4000/api/admin/categories
```

### Update Product
```bash
curl -X PUT http://localhost:4000/api/admin/products/{product-id} \
  -F "name=Updated Name" \
  -F "price=600"
```

### Update Product with New Image
```bash
curl -X PUT http://localhost:4000/api/admin/products/{product-id} \
  -F "image=@/path/to/new-image.jpg" \
  -F "name=Updated Name"
```

### Delete Product
```bash
curl -X DELETE http://localhost:4000/api/admin/products/{product-id}
```

### Delete Category
```bash
curl -X DELETE http://localhost:4000/api/admin/categories/{category-id}
```

## File Structure

### Backend Files Added
```
server/
├── imageOptimizer.js         # Image processing and optimization
├── uploadMiddleware.js        # Multer configuration and file handling
├── index.js                   # Updated with image endpoints
└── uploads/
    ├── products/             # Product images stored here
    └── categories/           # Category images stored here
```

### Frontend Files Added
```
src/
├── components/admin/
│   ├── ProductForm.tsx              # Product form with image upload
│   ├── AdminProductsSection.tsx     # Product management UI
│   └── AdminCategoriesSection.tsx   # Category management UI
├── pages/admin/
│   └── AdminMenuPage.tsx            # Main admin menu page
└── App.tsx                          # Updated with new routes
```

## Key Features

✅ **Image Upload**
- Drag and drop or click to select
- Supports: JPEG, PNG, WebP, GIF
- Max size: 5MB

✅ **Automatic Optimization**
- Converts to WebP and JPEG formats
- Creates thumbnails automatically
- Maintains aspect ratio
- ~70% size reduction with WebP

✅ **Admin Dashboard**
- Create products and categories with images
- Edit existing items
- Delete items (images auto-cleaned up)
- Real-time updates

✅ **Error Handling**
- File validation
- Database error handling
- User-friendly error messages

## Testing Checklist

- [ ] Upload a product with image via admin dashboard
- [ ] Verify image appears in product card
- [ ] Edit product - change image
- [ ] Verify old image is deleted
- [ ] Delete product - verify confirmation
- [ ] Verify image files are removed from disk
- [ ] Create category with image
- [ ] Edit category - keep same image
- [ ] Upload category - different image
- [ ] Check image files in `/server/uploads/products/` and `/server/uploads/categories/`
- [ ] Verify WebP, JPEG, and thumbnail files are created

## Default Test Category ID
For testing products, use this category ID:
```
9a333ae8-4cb9-4bce-b328-38352ea55a60
```

## Database Status
- User: `mike_admin`
- Password: `Mwa$0152`
- Database: `speedy_bites`
- Port: `54812` (Docker mapped)

## Troubleshooting

### Backend won't start
```bash
# Check if port 4000 is in use
lsof -i :4000
# Kill if needed
kill -9 <PID>
```

### Images not uploading
- Check file size < 5MB
- Check file format is JPEG, PNG, WebP, or GIF
- Check backend is running
- Check console logs for errors

### Images not displaying
- Verify `/uploads` directory exists
- Check image_url in database is correct
- Verify static files are being served

## Next Steps

1. **Customize image optimization** in `server/imageOptimizer.js`
2. **Add more features** like batch upload, image cropping
3. **Integrate with S3/cloud storage** for scalability
4. **Add image compression settings** in admin panel

---

For detailed information, see `IMAGE_MANAGEMENT_GUIDE.md`
