// Custom Cursor Logic
const cursorDot = document.querySelector('.cursor-dot');
const cursorGlow = document.querySelector('.cursor-glow');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
    
    cursorGlow.style.left = `${mouseX}px`;
    cursorGlow.style.top = `${mouseY}px`;
});

// Interactive Elements Custom Cursor States
const interactiveElements = document.querySelectorAll('.interactive');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', (e) => {
        document.body.classList.add('cursor-hover');
        if (el.dataset.action === 'play') document.body.classList.add('cursor-action');
    });
    el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover', 'cursor-action');
    });
});

// Magnetic Buttons
const magneticElements = document.querySelectorAll('[data-action="magnetic"]');
magneticElements.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.05)`;
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = `translate(0px, 0px) scale(1)`;
    });
});

// 3D Tilt Effect on Portfolio Items
// Portfolio hover is now pure CSS — no JS tilt needed
function initTiltEffects() {}

// Premium Loader Counter
window.addEventListener('load', () => {
    let counter = 0;
    const counterElement = document.getElementById('loader-counter');

    const updateCounter = setInterval(() => {
        counter += Math.floor(Math.random() * 10) + 1;
        if (counter >= 100) {
            counter = 100;
            clearInterval(updateCounter);
            counterElement.innerText = counter + '%';
            
            setTimeout(() => {
                document.getElementById('loader').classList.add('loaded');
                document.body.classList.add('loaded');
                
                const heroFades = document.querySelectorAll('.hero .fade-up');
                heroFades.forEach((el, index) => {
                    setTimeout(() => {
                        el.classList.add('visible');
                    }, index * 200 + 400);
                });
            }, 500);
        } else {
            counterElement.innerText = counter + '%';
        }
    }, 50);
});

// Parallax Effect
const parallaxElements = document.querySelectorAll('.parallax-bg');
window.addEventListener('scroll', () => {
    let scrollPosition = window.pageYOffset;
    parallaxElements.forEach(el => {
        let speed = el.dataset.speed || 0.4;
        el.style.transform = `translateY(${scrollPosition * speed}px)`;
    });
});

// Intersection Observer for Scroll Animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

const fadeElements = document.querySelectorAll('.fade-up:not(.hero .fade-up)');
fadeElements.forEach(el => {
    observer.observe(el);
});

// Video Hover Playback Logic
function initVideoHover() {
    const portfolioMedia = document.querySelectorAll('.portfolio-media');
    portfolioMedia.forEach(item => {
        const video = item.querySelector('.portfolio-vid-preview');
        if (video) {
            item.addEventListener('mouseenter', () => {
                video.currentTime = 0;
                let playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => console.log('Video autoplay prevented'));
                }
            });
            
            item.addEventListener('mouseleave', () => {
                video.pause();
            });
        }
    });
}

// Video Lightbox — Full Playback with Audio
function initVideoLightbox() {
    const lightbox = document.getElementById('video-lightbox');
    const lightboxVideo = document.getElementById('lightbox-video');
    const lightboxSource = document.getElementById('lightbox-source');
    const lightboxClose = document.getElementById('lightbox-close');
    if (!lightbox) return;

    // Open lightbox on play-icon or portfolio-media click
    document.querySelectorAll('.portfolio-media').forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
            const videoUrl = item.getAttribute('data-video');
            if (!videoUrl) return;
            
            lightboxSource.src = videoUrl;
            lightboxVideo.load();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
            document.body.classList.add('cursor-native');
            lightboxVideo.play().catch(() => {});
        });
    });

    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        lightboxVideo.pause();
        lightboxVideo.currentTime = 0;
        document.body.style.overflow = '';
        document.body.classList.remove('cursor-native');
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
    });
}

// ========== API INTEGRATIONS ==========

// Load Portfolio from API
async function loadPortfolio() {
    const grid = document.getElementById('portfolio-grid');
    try {
        const res = await fetch('/api/projects');
        const projects = await res.json();
        
        if (projects.length === 0) {
            grid.innerHTML = '<p style="text-align:center;color:#555;grid-column:1/-1;">Portfolio coming soon.</p>';
            return;
        }

        grid.innerHTML = projects.map((p, i) => `
            <div class="portfolio-item fade-up ${i % 2 === 0 ? 'fade-delay-1' : 'fade-delay-2'}">
                <div class="portfolio-media interactive" data-action="play" data-video="${p.videoUrl || ''}">
                    <img src="${p.thumbnail || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1000'}" alt="${p.title}" class="portfolio-thumb">
                    ${p.videoUrl ? `
                    <video muted loop playsinline class="portfolio-vid-preview">
                        <source src="${p.videoUrl}" type="video/mp4">
                    </video>` : ''}
                    <div class="play-icon"></div>
                </div>
                <div class="portfolio-info">
                    <h3>${p.title}</h3>
                    <p>${p.category} • '${p.year.slice(-2)}</p>
                </div>
            </div>
        `).join('');

        // Re-initialize effects on dynamically loaded items
        initTiltEffects();
        initVideoHover();
        initVideoLightbox();
        
        // Observe new fade-up elements
        grid.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

        // Re-initialize interactive cursor states
        grid.querySelectorAll('.interactive').forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
                if (el.dataset.action === 'play') document.body.classList.add('cursor-action');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover', 'cursor-action');
            });
        });
    } catch (err) {
        // Fallback: keep any static content
        console.log('API not available, using static portfolio');
    }
}

// Load Blog Posts from API
async function loadBlog() {
    const grid = document.getElementById('blog-grid');
    try {
        const res = await fetch('/api/blog');
        const posts = await res.json();
        
        if (posts.length === 0) {
            grid.innerHTML = '<div class="blog-empty">Journal entries coming soon. Stay tuned.</div>';
            return;
        }

        grid.innerHTML = posts.slice(0, 3).map(post => `
            <div class="blog-card">
                ${post.coverImage ? `
                <div class="blog-card-image-wrapper">
                    <img src="${post.coverImage}" alt="${post.title}" class="blog-card-image">
                </div>` : ''}
                <div class="blog-card-body">
                    <h3>${post.title}</h3>
                    <p>${post.content.substring(0, 150)}...</p>
                </div>
                <div class="blog-card-meta">
                    <div class="blog-tags">
                        ${post.tags ? post.tags.slice(0, 2).map(t => `<span class="blog-tag">${t}</span>`).join('') : ''}
                    </div>
                    <span class="blog-date">${new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
            </div>
        `).join('');
    } catch (err) {
        grid.innerHTML = '<div class="blog-empty">Journal entries coming soon. Stay tuned.</div>';
    }
}

// Contact Form Submission
document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const status = document.getElementById('contact-status');
    const btn = form.querySelector('.btn');
    
    btn.textContent = 'Sending...';
    btn.disabled = true;

    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        const res = await fetch('/api/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await res.json();
        
        if (res.ok) {
            showFormStatus(status, 'success', '✓ ' + result.message);
            form.reset();
        } else {
            showFormStatus(status, 'error', '✗ ' + (result.error || 'Something went wrong.'));
        }
    } catch (err) {
        showFormStatus(status, 'error', '✗ Could not send message. Please try again.');
    }
    
    btn.textContent = 'Send Message';
    btn.disabled = false;
});

// Booking Form Submission
document.getElementById('booking-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const status = document.getElementById('booking-status');
    const btn = form.querySelector('.btn');
    
    btn.textContent = 'Submitting...';
    btn.disabled = true;

    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await res.json();
        
        if (res.ok) {
            showFormStatus(status, 'success', '✓ ' + result.message);
            form.reset();
        } else {
            showFormStatus(status, 'error', '✗ ' + (result.error || 'Something went wrong.'));
        }
    } catch (err) {
        showFormStatus(status, 'error', '✗ Could not submit booking. Please try again.');
    }
    
    btn.textContent = 'Submit Booking Request';
    btn.disabled = false;
});

// Reviews Carousel
let currentReview = 0;
const reviewTrack = document.getElementById('review-track');
const reviewCards = document.querySelectorAll('.review-card');

function updateReview() {
    if (reviewTrack) {
        reviewTrack.style.transform = `translateX(-${currentReview * 100}%)`;
    }
}

document.getElementById('review-prev')?.addEventListener('click', () => {
    currentReview = (currentReview - 1 + reviewCards.length) % reviewCards.length;
    updateReview();
});

document.getElementById('review-next')?.addEventListener('click', () => {
    currentReview = (currentReview + 1) % reviewCards.length;
    updateReview();
});

// Auto-advance reviews
setInterval(() => {
    if (reviewCards.length > 0) {
        currentReview = (currentReview + 1) % reviewCards.length;
        updateReview();
    }
}, 5000);

// Count Up Animation for About Stats
const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = parseInt(entry.target.dataset.count);
            let current = 0;
            const increment = target / 40;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                entry.target.textContent = Math.floor(current);
            }, 50);
            countObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-count]').forEach(el => {
    countObserver.observe(el);
});

// Smooth Scroll for Nav Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Navbar Background on Scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(5,5,5,0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = 'linear-gradient(to bottom, rgba(5,5,5,0.9), transparent)';
        navbar.style.backdropFilter = 'none';
    }
});

// ========== FULL-SCREEN MENU ==========
const menuBtn = document.getElementById('menu-btn');
const menuOverlay = document.getElementById('menu-overlay');
const menuClose = document.getElementById('menu-close');
const menuLinks = document.querySelectorAll('.menu-overlay-link');

function openMenu() {
    menuOverlay.classList.add('open');
    menuBtn.classList.add('active');
    menuBtn.textContent = 'Close';
    document.body.style.overflow = 'hidden';
}

function closeMenu() {
    menuOverlay.classList.remove('open');
    menuBtn.classList.remove('active');
    menuBtn.textContent = 'Menu';
    document.body.style.overflow = '';
}

menuBtn.addEventListener('click', () => {
    if (menuOverlay.classList.contains('open')) {
        closeMenu();
    } else {
        openMenu();
    }
});

menuClose.addEventListener('click', closeMenu);

// Close menu when a link is clicked, then smooth scroll
menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        closeMenu();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 400); // Wait for menu close animation
        }
    });
});

// Close menu on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOverlay.classList.contains('open')) {
        closeMenu();
    }
});

// ========== FORM STATUS HELPER ==========
function showFormStatus(statusEl, type, message) {
    statusEl.className = `form-status ${type}`;
    statusEl.textContent = message;
    statusEl.style.display = 'block';
    statusEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 8000);
}

// Initialize API-driven content
loadPortfolio();
loadBlog();

// Prevent selecting past dates in the booking form
const dateInput = document.querySelector('input[type="date"][name="date"]');
if (dateInput) {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
    dateInput.setAttribute('min', localToday);
}

