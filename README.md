# OhioMeansJobs Huron County Website

A professional, responsive website for OhioMeansJobs Huron County, providing job search assistance, career counseling, and employer services.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Testing Checklist](#testing-checklist)
- [Customization](#customization)
- [Browser Support](#browser-support)
- [Accessibility](#accessibility)
- [Contact Information](#contact-information)

## ✨ Features

- **Responsive Design**: Mobile-first approach that works on all devices
- **Accessibility**: WCAG 2.1 AA compliant with high contrast support
- **Modern UI**: Clean, professional design with Ohio state branding colors
- **Interactive Elements**:
  - Smooth scrolling navigation
  - Mobile hamburger menu
  - FAQ accordion
  - Contact form with validation
  - Back-to-top button
  - Animated card effects

## 📁 Project Structure

```
huron-omj/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styles and responsive design
├── js/
│   └── main.js         # JavaScript functionality
├── images/             # Image assets (currently empty)
└── README.md           # This file
```

## 🚀 Getting Started

### Local Development

1. **Clone or download** this project to your local machine

2. **Open the project** in your preferred code editor

3. **View the website** by opening `index.html` in a web browser, or use a local server:

   **Using Python:**
   ```bash
   # Python 3
   python -m http.server 8000
   ```

   **Using Node.js:**
   ```bash
   # Install http-server globally
   npm install -g http-server

   # Run server
   http-server
   ```

   **Using VS Code:**
   - Install the "Live Server" extension
   - Right-click on `index.html` and select "Open with Live Server"

4. **Navigate to** `http://localhost:8000` (or the port shown)

## 🌐 Deployment

### Option 1: Traditional Web Hosting (cPanel, FTP)

1. **Prepare files** for upload:
   - Ensure all files maintain their folder structure
   - Check that all paths are relative (not absolute)

2. **Upload via FTP**:
   - Use an FTP client (FileZilla, Cyberduck, etc.)
   - Connect to your web host
   - Upload all files maintaining the folder structure
   - Ensure `index.html` is in the root directory or designated subfolder

3. **Configure domain**:
   - Point your domain to the directory containing `index.html`
   - Set `index.html` as the default document (usually automatic)

### Option 2: GitHub Pages (Free Hosting)

1. **Create a GitHub repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: OhioMeansJobs Huron County website"
   git branch -M main
   git remote add origin https://github.com/yourusername/huron-omj.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to repository Settings
   - Navigate to "Pages" section
   - Select branch: `main`
   - Select folder: `/ (root)`
   - Click Save

3. **Access your site** at: `https://yourusername.github.io/huron-omj/`

### Option 3: Netlify (Free Hosting with Drag & Drop)

1. **Visit** [netlify.com](https://www.netlify.com/)
2. **Sign up** for a free account
3. **Drag and drop** your project folder onto the Netlify dashboard
4. **Configure custom domain** (optional)

### Option 4: Vercel (Free Hosting)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Follow prompts** to complete deployment

## ✅ Testing Checklist

Before deploying, verify the following:

### Functionality
- [ ] All navigation links work correctly
- [ ] Mobile menu opens and closes properly
- [ ] Smooth scrolling works on all anchor links
- [ ] FAQ accordion expands/collapses correctly
- [ ] Contact form validates required fields
- [ ] Contact form validates email format
- [ ] Phone number auto-formats in contact form
- [ ] Back-to-top button appears on scroll
- [ ] External links open in new tabs

### Responsive Design
- [ ] Test on mobile devices (320px - 480px)
- [ ] Test on tablets (481px - 768px)
- [ ] Test on desktop (769px+)
- [ ] Test on large screens (1200px+)
- [ ] Mobile menu works properly
- [ ] All images scale correctly
- [ ] Text remains readable at all sizes

### Cross-Browser Compatibility
- [ ] Google Chrome
- [ ] Mozilla Firefox
- [ ] Safari
- [ ] Microsoft Edge
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Accessibility
- [ ] All images have alt text
- [ ] Color contrast meets WCAG AA standards
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators are visible
- [ ] Screen reader friendly (test with NVDA or JAWS)
- [ ] Form labels properly associated with inputs

### Performance
- [ ] Page loads in under 3 seconds
- [ ] No console errors
- [ ] All resources load correctly
- [ ] Google Maps embed loads properly

### SEO
- [ ] Page title is set
- [ ] Meta description is present
- [ ] Headings follow hierarchy (H1 → H2 → H3)
- [ ] Links have descriptive text

## 🎨 Customization

### Changing Colors

Edit the CSS variables in `css/styles.css`:

```css
:root {
    --ohio-red: #BA0C2F;      /* Primary red color */
    --ohio-blue: #003B7A;     /* Primary blue color */
    --text-dark: #2C3E50;     /* Main text color */
    --text-light: #6C757D;    /* Secondary text color */
}
```

### Adding Images

1. Place images in the `images/` folder
2. Reference them in HTML:
   ```html
   <img src="images/yourimage.jpg" alt="Description">
   ```

### Updating Contact Information

Edit the contact section in `index.html`:
- Address: Line 316-317
- Phone: Line 323
- Hours: Line 331

### Connecting Contact Form

The current form is client-side only. To make it functional:

**Option 1: Formspree**
1. Sign up at [formspree.io](https://formspree.io/)
2. Update form tag:
   ```html
   <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```

**Option 2: Google Forms**
1. Create a Google Form
2. Use a service like [FormSubmit](https://formsubmit.co/)

**Option 3: Backend Integration**
- Create a backend endpoint (PHP, Node.js, etc.)
- Update form action to point to your endpoint

### Updating Google Maps

Replace the iframe src in `index.html` (line 381) with your own Google Maps embed:
1. Visit [Google Maps](https://www.google.com/maps)
2. Search for your location
3. Click "Share" → "Embed a map"
4. Copy the iframe code
5. Replace the existing iframe

## 🌍 Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- iOS Safari (last 2 versions)
- Chrome for Android (last 2 versions)

## ♿ Accessibility

This website follows WCAG 2.1 AA guidelines:

- Semantic HTML5 elements
- Proper heading hierarchy
- ARIA labels where needed
- Keyboard navigation support
- High contrast color scheme
- Focus indicators for interactive elements
- Screen reader compatible
- Reduced motion support

### Testing Accessibility

**Tools:**
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) (built into Chrome)

**Screen Readers:**
- NVDA (Windows - Free)
- JAWS (Windows - Paid)
- VoiceOver (Mac/iOS - Built-in)

## 📞 Contact Information

**OhioMeansJobs Huron County**
- Address: 185 Shady Lane Dr., Norwalk, OH 44857
- Phone: (419) 668-8126
- Hours: Monday-Friday, 8:00 AM - 5:00 PM

## 📝 License

This website is created for OhioMeansJobs Huron County. All rights reserved.

## 🤝 Support

For technical support or questions about this website, please contact:
- Your web development team
- Huron County IT department

---

## Additional Resources

- [OhioMeansJobs Main Website](https://ohiomeansjobs.com)
- [Ohio Department of Job and Family Services](https://jfs.ohio.gov)
- [Unemployment Services](https://unemployment.ohio.gov)

---

**Built with:** HTML5, CSS3, JavaScript
**Version:** 1.0.0
**Last Updated:** 2025

---

## Quick Start Commands

```bash
# View locally (Python)
python -m http.server 8000

# View locally (Node.js)
npx http-server

# Deploy to GitHub Pages
git init
git add .
git commit -m "Initial commit"
git push

# Run accessibility check (if you have axe-cli)
axe index.html
```

---

**Note:** Remember to update the contact form with a backend solution before deploying to production.
# omjec
