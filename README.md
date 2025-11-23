# 🐟 Ömer Kaptan - Digital QR Menu System

> **A serverless, cost-effective digital menu solution for restaurants powered by GitHub Pages and GitHub API**

---

## 📋 Overview

**Ömer Kaptan** is a modern, fully responsive digital QR menu system designed for restaurants. Built with vanilla JavaScript and leveraging GitHub Pages for hosting and GitHub API for content management, this solution provides a **zero-cost**, **serverless** alternative to traditional restaurant menu systems.

### ✨ Key Highlights

- 🌐 **100% Serverless** - No backend servers, databases, or hosting costs
- 💰 **Completely Free** - Hosted on GitHub Pages at zero cost
- 📱 **Fully Responsive** - Perfect experience on mobile, tablet, and desktop
- 🔄 **Real-time Updates** - GitHub API integration for instant content updates
- 🎨 **Professional Admin Panel** - Comprehensive management interface
- ⚡ **Fast & Lightweight** - Optimized for performance
- 🔒 **Secure** - All data managed through GitHub's secure infrastructure

---

## 🎯 Features

### Customer-Facing Features

- **Dynamic Category Navigation** - Categories and products loaded dynamically from JSON
- **Product Detail Pages** - Rich product pages with images, descriptions, and companions
- **Smart Image Handling** - Automatic image path generation and fallback handling
- **Ingredient Lists** - Special ingredient display for meze (appetizer) products
- **Companion Items** - Free side items (Lemon, Roka, Onion, etc.) display
- **Chef Recommendations** - Intelligent product recommendations
- **Out-of-Stock Management** - Visual indicators for unavailable items
- **Loading States** - Smooth loading animations and transitions
- **Accessibility** - ARIA labels and semantic HTML for screen readers

### Technical Features

- **Dynamic Content Loading** - Products loaded from `products.json` with localStorage caching
- **Offline Support** - LocalStorage fallback for offline viewing
- **SEO Optimized** - Semantic HTML structure and meta tags
- **Performance Optimized** - Lazy loading, cache busting, and optimized assets
- **Cross-browser Compatible** - Works on all modern browsers

---

## 🔧 Professional Admin Panel

The admin panel is a comprehensive, enterprise-grade content management system that eliminates the need for traditional servers or databases. All operations are performed client-side using GitHub API.

### Admin Panel Access

Navigate to `/admin/admin.html` to access the admin panel.

### 🎛️ Core Functionality

#### 1. **Product Management**

- **Product Listing**
  - Visual grid view with product images, names, categories, and prices
  - Real-time category filtering
  - Full-text search across product names and descriptions
  - Visual badges for hidden/visible and in-stock/out-of-stock status
  - Direct edit access from product cards

- **Add New Products**
  - Category selection with automatic subcategory support
  - Image upload with automatic path generation
  - Price, description, and short description fields
  - Multi-select companion items (free sides)
  - Special ingredient fields for meze (appetizer) products
  - Visibility and stock status toggles
  - Automatic image path formatting: `assets/[category]/[product-name].jpg`

- **Edit Products**
  - Complete product information editing
  - Image replacement with preview
  - Bulk companion item management
  - Real-time form validation
  - Auto-save to localStorage with sync to GitHub

- **Delete Products**
  - Safe deletion with confirmation dialogs
  - Automatic cleanup of associated assets
  - Category and companion relationship management

#### 2. **Category Management**

- **Category Listing**
  - Visual category cards with images and product counts
  - Category ordering (drag-and-drop or move buttons)
  - Quick edit access from category cards

- **Add Categories**
  - Category name and image upload
  - Automatic HTML page generation
  - Automatic image path management
  - Slug generation for URLs

- **Edit Categories**
  - Rename categories with automatic product updates
  - Image replacement
  - Automatic HTML page regeneration
  - Asset cleanup for old images

- **Delete Categories**
  - Safe deletion with product relationship warnings
  - Automatic asset cleanup (images, HTML pages)
  - Product category reassignment options

#### 3. **Companion Items Management**

Companion items are free sides that can be paired with products (e.g., Lemon, Roka, Onion).

- **Add Companions**
  - Name and image upload
  - Automatic path generation: `assets/companions/[name].jpg`

- **Edit Companions**
  - Name and image updates
  - Automatic product relationship updates
  - Bulk update across all products using the companion

- **Delete Companions**
  - Safe deletion with product relationship updates
  - Automatic removal from all products

#### 4. **Advanced Features**

- **Visibility Management**
  - Hide/show products without deletion
  - Separate view for hidden products
  - Bulk visibility operations

- **Stock Management**
  - Mark products as out of stock
  - Visual indicators on product pages
  - "Out of Stock" banner display

- **Change Log**
  - Automatic tracking of all changes
  - Timestamped change history
  - Detailed change descriptions
  - Exportable change log

---

## 🚀 GitHub API Integration

### Serverless Architecture

This project uses **GitHub API** to manage content without requiring any backend servers:

1. **Content Storage** - All product data stored in `products.json` in the repository
2. **Asset Management** - Images uploaded directly to GitHub via API
3. **Instant Updates** - Changes pushed to GitHub are immediately live
4. **Version Control** - Full Git history for all changes
5. **No Costs** - GitHub Pages hosting is free for public repositories

### How It Works

```
Admin Panel (Browser)
    ↓
GitHub API (REST)
    ↓
GitHub Repository
    ↓
GitHub Pages (CDN)
    ↓
Live Website
```

### GitHub API Features Used

- **File Operations**
  - Create, read, update, delete files
  - Automatic commit messages
  - Branch management

- **Image Upload**
  - Direct image upload to repository
  - Base64 encoding for binary data
  - Automatic path management

- **Batch Operations**
  - Multiple file updates in single operation
  - Transaction-like behavior with rollback

### Configuration

GitHub API configuration is stored securely in the browser's localStorage. See `GITHUB_AYARLARI_NASIL.md` for setup instructions.

**Required Settings:**
- GitHub Repository (e.g., `username/repository-name`)
- Personal Access Token (with `repo` permissions)
- Branch name (typically `main` or `master`)
- File paths for products.json and assets

---

## 📁 Project Structure

```
omer-kaptan/
├── index.html                 # Homepage with category grid
├── product.html               # Product detail page template
├── admin/
│   └── admin.html            # Admin panel interface
├── assets/                    # Static assets (images)
│   ├── [category]/          # Product category images
│   └── companions/          # Companion item images
├── categories/               # Category page HTML files
├── data/
│   ├── products.json        # Product database (JSON)
│   ├── products-data.js     # Product data module
│   └── change-log.json      # Change history log
└── src/
    ├── css/
    │   ├── main.css         # Main stylesheet
    │   └── admin.css        # Admin panel styles
    └── js/
        ├── main/            # Main site scripts
        │   ├── dynamic-categories.js
        │   ├── dynamic-products.js
        │   └── script.js
        ├── admin/           # Admin panel scripts
        │   ├── admin.js
        │   └── admin-button.js
        ├── utils/           # Utility scripts
        │   ├── meze-ingredients.js
        │   └── product-visibility.js
        └── api/             # API integration
            ├── github-api.js
            └── github-api-config.js
```

---

## 🛠️ Setup & Installation

### Prerequisites

- GitHub account
- Modern web browser
- Basic understanding of Git

### Initial Setup

1. **Clone or Fork the Repository**
   ```bash
   git clone https://github.com/username/omer-kaptan.git
   cd omer-kaptan
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Select source branch (usually `main`)
   - Save settings

3. **Configure GitHub API** (for admin panel)
   - Navigate to `/admin/admin.html`
   - Go to Settings tab
   - Enter repository name: `username/repository-name`
   - Generate Personal Access Token at https://github.com/settings/tokens
   - Enter token and save settings

### GitHub Personal Access Token

Create a token with the following permissions:
- ✅ `repo` - Full control of private repositories
- ✅ `workflow` (optional) - For GitHub Actions integration

**Security Note:** Never commit tokens to the repository. Store them in browser localStorage only.

---

## 📖 Usage Guide

### Managing Products

1. Access admin panel at `/admin/admin.html`
2. Navigate to "Products" tab
3. Use filters and search to find products
4. Click "Edit" on any product card to modify
5. Or use "Add Product" tab to create new products

### Updating Content on GitHub

1. Make changes in admin panel
2. Click "🚀 Update on GitHub" button
3. Wait for confirmation message
4. Changes are live immediately on GitHub Pages

### Adding Images

- Upload images directly through admin panel
- Images are automatically uploaded to GitHub
- Paths are automatically generated and managed
- Supports JPG, PNG, and other web formats

---

## 🎨 Customization

### Styling

- Main styles: `src/css/main.css`
- Admin styles: `src/css/admin.css`
- Customize colors, fonts, and layouts in CSS files

### Product Data Structure

Products are stored in `data/products.json`:

```json
{
  "categories": ["Tavalar", "Izgaralar", ...],
  "products": [
    {
      "id": 1,
      "name": "Product Name",
      "category": "Category Name",
      "price": "340",
      "shortDesc": "Short description",
      "description": "Full description",
      "image": "category/product-name.jpg",
      "companions": ["Lemon", "Roka"],
      "ingredients": ["Ingredient 1", "Ingredient 2"],
      "hidden": false,
      "outOfStock": false
    }
  ],
  "companions": [...]
}
```

---

## 🔒 Security Considerations

- **API Tokens** - Stored in browser localStorage, never in code
- **CORS** - GitHub API handles CORS automatically
- **Rate Limiting** - GitHub API has rate limits (5000 requests/hour)
- **Repository Privacy** - Public repositories work with GitHub Pages

---

## 📊 Performance

- **Initial Load** - < 2 seconds on 3G
- **Page Transitions** - Instant with localStorage caching
- **Image Loading** - Optimized with lazy loading
- **Bundle Size** - < 500KB total (without images)

---

## 🌐 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📝 License

This project is open source and available for use in restaurant menu systems.

---

## 👨‍💻 Development

### Local Development

1. Use a local server (not `file://` protocol):
   ```bash
   python -m http.server 8000
   # or
   npx serve
   ```

2. Access at `http://localhost:8000`

### Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Submit pull request

---

## 📞 Support & Documentation

- **Setup Guide:** See `GITHUB_AYARLARI_NASIL.md` for GitHub API configuration
- **Admin Panel Guide:** See `ADMIN_PANEL_KURULUM.md` for admin panel setup
- **GitHub API Docs:** See `README_GITHUB_API.md` for API details

---

## 🎯 Use Cases

Perfect for:
- 🍽️ Restaurants with QR code menus
- 📱 Food delivery platforms
- 🏪 Cafe and bistro menu systems
- 🍺 Bar and pub menus
- 🍕 Pizza and fast-food restaurants
- 🍰 Bakery and patisserie displays

---

## 🚀 Future Enhancements

- [ ] Multi-language support
- [ ] Analytics integration
- [ ] Print-friendly menu generation
- [ ] Advanced search and filtering
- [ ] Customer favorites/wishlist
- [ ] Social media integration
- [ ] Online ordering integration

---

## ⭐ Key Advantages Over Traditional Solutions

| Traditional CMS | Ömer Kaptan |
|----------------|-------------|
| Server hosting costs | ✅ Free (GitHub Pages) |
| Database management | ✅ JSON files (Git versioned) |
| Backend development | ✅ Pure frontend (JavaScript) |
| Update complexity | ✅ Simple admin panel |
| Maintenance overhead | ✅ Minimal (GitHub handles it) |
| Scalability costs | ✅ Unlimited (GitHub CDN) |
| Version control | ✅ Built-in (Git) |
| Backup & recovery | ✅ Automatic (Git history) |

---

**Built with ❤️ for the restaurant industry**

*Making digital menus accessible, affordable, and easy to manage.*

