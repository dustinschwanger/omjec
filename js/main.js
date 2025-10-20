// ===================================
// Mobile Navigation Toggle
// ===================================
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');

mobileMenuToggle.addEventListener('click', () => {
    mobileMenuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when a link is clicked
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ===================================
// Smooth Scrolling for Anchor Links
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // Ignore empty anchors
        if (href === '#' || href === '#!') {
            e.preventDefault();
            return;
        }

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===================================
// Hero Parallax Effect
// ===================================
const heroBackground = document.querySelector('.hero-background');

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroHeight = document.querySelector('.hero').offsetHeight;

    // Only apply parallax when within hero section
    if (scrolled <= heroHeight) {
        const parallaxSpeed = 0.5;
        heroBackground.style.transform = `translateY(${scrolled * parallaxSpeed}px) scale(1.1)`;
    }
});

// ===================================
// FAQ Accordion
// ===================================
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const isActive = faqItem.classList.contains('active');

        // Close all other FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });

        // Toggle current item
        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

// ===================================
// Contact Form Validation & Handling
// ===================================
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value.trim();

    // Validate required fields
    if (!name || !email || !subject || !message) {
        showFormStatus('Please fill out all required fields.', 'error');
        return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
        showFormStatus('Please enter a valid email address.', 'error');
        return;
    }

    // If validation passes, show success message
    // In production, this would send data to a server
    showFormStatus('Thank you for your message! We will contact you soon.', 'success');

    // Reset form
    contactForm.reset();

    // Hide success message after 5 seconds
    setTimeout(() => {
        formStatus.style.display = 'none';
    }, 5000);
});

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show form status message
function showFormStatus(message, type) {
    formStatus.textContent = message;
    formStatus.className = 'form-status ' + type;
    formStatus.style.display = 'block';
}

// ===================================
// Back to Top Button
// ===================================
const backToTopButton = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.classList.add('visible');
    } else {
        backToTopButton.classList.remove('visible');
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===================================
// Sticky Header Scroll Effect
// ===================================
const header = document.getElementById('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add shadow when scrolled
    if (currentScroll > 0) {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// ===================================
// Intersection Observer for Animations
// ===================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe service cards for fade-in animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.service-card, .quick-link-card');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// ===================================
// Keyboard Accessibility
// ===================================
// Ensure dropdown menus can be navigated with keyboard
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close mobile menu on Escape
        mobileMenuToggle.classList.remove('active');
        navMenu.classList.remove('active');

        // Close all FAQ items on Escape
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
    }
});

// ===================================
// Phone Number Formatting (Optional)
// ===================================
const phoneInput = document.getElementById('phone');

phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length > 0) {
        if (value.length <= 3) {
            value = `(${value}`;
        } else if (value.length <= 6) {
            value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
        } else {
            value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
        }
    }

    e.target.value = value;
});

// ===================================
// Console Message
// ===================================
console.log('%cOhioMeansJobs Erie County', 'color: #BA0C2F; font-size: 20px; font-weight: bold;');
console.log('%cYour Career Starts Here!', 'color: #003B7A; font-size: 14px;');
console.log('Contact us at 419-624-6451 or visit us at 221 W. Parish St., Sandusky, OH 44870');

// ===================================
// Performance Optimization
// ===================================
// Lazy load images (if any images are added later)
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src;
    });
} else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// ===================================
// Analytics Ready (Placeholder)
// ===================================
// Add Google Analytics or other tracking code here when ready
// Example:
// window.dataLayer = window.dataLayer || [];
// function gtag(){dataLayer.push(arguments);}
// gtag('js', new Date());
// gtag('config', 'GA_MEASUREMENT_ID');
