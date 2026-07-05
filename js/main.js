/* js/main.js */

// Typing Animation Effect with Loop
const typingText = document.getElementById('typing-text');
const text = 'RAr\'s Crochet.';
let index = 0;
let isDeleting = false;

function typeWriter() {
    if (!isDeleting && index < text.length) {
        // Typing forward
        typingText.textContent += text.charAt(index);
        index++;
        setTimeout(typeWriter, 100);
    } else if (!isDeleting && index === text.length) {
        // Wait before deleting
        isDeleting = true;
        setTimeout(typeWriter, 2000);
    } else if (isDeleting && index > 0) {
        // Deleting backward
        typingText.textContent = text.substring(0, index - 1);
        index--;
        setTimeout(typeWriter, 50);
    } else if (isDeleting && index === 0) {
        // Wait before typing again
        isDeleting = false;
        setTimeout(typeWriter, 500);
    }
}

// Start typing animation when page loads
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(typeWriter, 500);
});

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Close mobile menu when a link is clicked
const mobileLinks = mobileMenu.querySelectorAll('a');
mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
});

// Navbar Scroll Effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
        navbar.classList.add('nav-scrolled');
        navbar.classList.replace('h-20', 'h-16'); // make it slightly thinner
    } else {
        navbar.classList.remove('nav-scrolled');
        navbar.classList.replace('h-16', 'h-20');
    }
});

// FAQ Toggle
function toggleFaq(button) {
    const content = button.nextElementSibling;
    const icon = button.querySelector('i');

    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        icon.classList.add('rotate-180');
    } else {
        content.classList.add('hidden');
        icon.classList.remove('rotate-180');
    }
}

// ─── Data Produk: diambil dari API ───────────────────────────────────────────
let productsData = {}; // Akan diisi dari API

function formatRupiah(angka) {
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
}

async function loadProductsFromAPI() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/products`);
        if (!res.ok) throw new Error('API error');
        const products = await res.json();

        // Simpan ke productsData (key by category, atau id)
        products.forEach(p => {
            productsData[p.category] = p;
            productsData[p.id] = p; // juga by id
        });

        renderProductGrid(products);
        renderGallery(products);

} catch(e) {
    console.warn('Tidak bisa terhubung ke API. Menggunakan data lokal.', e);
    // Fallback: data hardcoded minimal agar halaman tidak kosong
    renderProductGridFallback();

    // Setup static gallery filter for fallback items
    attachGalleryFilterListeners();
    // Activate first filter button if exists
    const firstBtn = document.querySelector('.gallery-filter-btn');
    if (firstBtn) {
        setActiveGalleryFilter(firstBtn);
        filterGallery(firstBtn.dataset.filter);
    }
}
}

function renderProductGrid(products) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    const delays = ['delay-100','delay-200','delay-300','delay-400','delay-500','delay-600'];
    grid.innerHTML = products.map((p, i) => `
        <div class="product-card bg-cream rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition flex flex-col stagger-item ${delays[i % delays.length]}">
            <div class="product-image-container w-full aspect-square bg-gradient-to-br from-putih via-cream/30 to-putih flex items-center justify-center border-b-2 border-coklatMuda/10 neon-border p-4">
                <img src="${p.image}" alt="${p.name}" class="w-full h-full object-contain" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 80 80%22><text y=%2260%22 font-size=%2250%22>🧶</text></svg>'">
            </div>
            <div class="p-6 flex-grow flex flex-col justify-between">
                <div class="text-center">
                    <h3 class="product-title text-xl font-bold text-coklatTua mb-2">${p.name}</h3>
                    <div class="text-yellow-400 text-sm mb-2">
                        <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                    </div>
                    <p class="text-coklatTua font-semibold text-sm mb-1">${formatRupiah(p.price)}</p>
                    <p class="text-gray-500 text-xs mb-4">${p.stock > 0 ? `Stok: ${p.stock}` : '<span class="text-red-400 font-semibold">Stok Habis</span>'}</p>
                </div>
                <div class="flex flex-col gap-2">
                    <button onclick="openDetailModal(${p.id})" class="btn-detail w-full bg-cream border border-coklatMuda text-coklatTua px-4 py-2 rounded-full font-semibold hover:bg-orange-100 transition text-sm">
                        Detail
                    </button>
                    <button onclick="event.stopPropagation(); handleAddToCartCard(${p.id})" class="w-full bg-coklatTua text-putih px-4 py-2 rounded-full font-semibold hover:bg-coklatMuda transition text-sm flex items-center justify-center gap-2" ${p.stock <= 0 ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart text-xs"></i> <span>+ Keranjang</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Re-observe for scroll animations
    const newItems = grid.querySelectorAll('.stagger-item');
    newItems.forEach(el => scrollAnimationObserver.observe(el));
}

function renderProductGridFallback() {
    const grid = document.getElementById('productGrid');
    if (grid) grid.innerHTML = `<div class="col-span-6 text-center py-12 text-gray-400"><i class="fas fa-wifi-slash text-4xl mb-3"></i><p>Pastikan server backend berjalan untuk melihat produk.</p></div>`;
}

function renderGallery(products) {
    const grid = document.getElementById('galleryGrid');
    const filterContainer = document.getElementById('galleryFilters');
    if (!grid) return;

    // Render filter buttons
    if (filterContainer) {
        const categories = [...new Set(products.map(p => p.category))];
        filterContainer.innerHTML = categories.map((cat, i) => `
            <button type="button" data-filter="${cat}" class="gallery-filter-btn ${i === 0 ? 'active bg-coklatTua text-putih' : 'bg-putih text-coklatTua'} border border-coklatTua px-5 py-2 rounded-full font-semibold hover:bg-coklatMuda hover:text-putih hover:border-coklatMuda transition">${cat}</button>
        `).join('');

        // Re-attach event listeners
        document.querySelectorAll('.gallery-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.classList.contains('active')) return;
                setActiveGalleryFilter(btn);
                filterGallery(btn.dataset.filter, true);
            });
        });
    }

    // Gather all gallery images from all products
    const galleryItems = [];
    products.forEach(p => {
        if (Array.isArray(p.gallery_images) && p.gallery_images.length > 0) {
            p.gallery_images.forEach(img => {
                galleryItems.push({ category: p.category, image: img, name: p.name });
            });
        }
    });

    // Render gallery items
    const delays = ['delay-100','delay-200','delay-300','delay-400','delay-500','delay-600'];
    
    if (galleryItems.length === 0) {
        grid.innerHTML = `<div class="col-span-6 text-center py-8 text-gray-400">Belum ada foto galeri. Admin dapat menambahkan foto galeri di Panel Admin.</div>`;
    } else {
        grid.innerHTML = galleryItems.map((item, i) => `
            <div class="gallery-item aspect-square bg-putih rounded-xl overflow-hidden cursor-pointer group scale-up ${delays[i % delays.length]} shadow-sm border border-coklatMuda/20" data-category="${item.category}">
                <img src="${item.image}" alt="${item.name}" class="w-full h-full object-contain p-3 group-hover:scale-110 transition duration-500" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 80 80%22><text y=%2260%22 font-size=%2250%22>🧶</text></svg>'">
                <div class="gallery-title">${item.name}</div>
            </div>
        `).join('');
    }

    // Re-attach gallery click listeners
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            if (!item.classList.contains('hidden-by-filter')) openGalleryPreview(item);
        });
    });

    // Re-observe scroll animations
    document.querySelectorAll('.gallery-item').forEach(el => scrollAnimationObserver.observe(el));

    // Apply initial filter
    if (products.length > 0) filterGallery(products[0].category);
}




// Modal Functions
const modal = document.getElementById('productModal');
const modalContent = document.getElementById('modalContent');

function openDetailModal(productId) {
    const data = productsData[productId];
    if (!data) return;

    const title = data.name || data.title || 'Produk';
    const description = data.description || '';
    const includes = data.includes || [];
    const whatsappText = `Hello admin! I'm interested in the ${title} product`;

    let includesHtml = includes.map(item => `
        <li class="flex items-start mb-2">
            <i class="fas fa-check text-coklatMuda mt-1 mr-3"></i>
            <span class="text-gray-700">${item}</span>
        </li>
    `).join('');

    modalContent.innerHTML = `
        <div class="w-full md:w-1/2 bg-gradient-to-br from-putih via-cream/40 to-putih flex items-center justify-center p-4 md:p-6 md:rounded-l-3xl shrink-0 h-64 md:h-auto overflow-hidden">
            <img src="${data.image}" alt="${title}" class="w-full h-full max-h-[220px] md:max-h-full object-contain rounded-2xl">
        </div>
        <div class="w-full md:w-1/2 p-6 md:p-10 flex flex-col flex-grow min-w-0 overflow-hidden">
            <div class="shrink-0">
                <div class="bg-orange-100 text-coklatTua px-3 py-1 rounded-full text-xs font-bold inline-block mb-3 w-max">HANDMADE</div>
                <h3 class="text-2xl md:text-3xl font-bold text-coklatTua mb-2 break-words leading-tight">${title}</h3>
                <p class="text-coklatTua font-bold text-lg mb-4">${formatRupiah(data.price || 0)}</p>
            </div>

            <div class="flex-grow overflow-y-auto pr-1 md:pr-3 mb-6 min-h-0">
                <h4 class="font-bold text-gray-800 mb-2">Deskripsi Produk:</h4>
                <p class="text-gray-600 mb-6 break-words whitespace-pre-line text-sm md:text-base leading-relaxed">${description}</p>

                <h4 class="font-bold text-gray-800 mb-3">Detail Produk:</h4>
                <ul class="mb-2">
                    ${includesHtml}
                </ul>
            </div>

            <div class="shrink-0 flex flex-col sm:flex-row gap-3 pt-2 bg-putih border-t border-gray-100 md:border-t-0">
                <button onclick="handleAddToCartCard(${data.id}); closeModal();" class="bg-coklatTua text-putih px-4 py-3 rounded-xl font-bold text-center hover:bg-coklatMuda transition flex-grow shadow-md flex items-center justify-center gap-2" ${data.stock <= 0 ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart"></i> <span>+ Keranjang</span>
                </button>
                <a href="https://wa.me/6281929761548?text=${encodeURIComponent(whatsappText)}" target="_blank" class="bg-green-500 text-putih px-4 py-3 rounded-xl font-bold text-center hover:bg-green-600 transition flex-grow shadow-md flex items-center justify-center gap-2">
                    <i class="fab fa-whatsapp"></i> WhatsApp
                </a>
                <a href="https://www.instagram.com/rarscrochet?igsh=ODVreHV0bzhkcnN6" target="_blank" class="bg-pink-500 text-putih px-4 py-3 rounded-xl font-bold text-center hover:bg-pink-600 transition flex-grow shadow-md flex items-center justify-center gap-2">
                    <i class="fab fa-instagram"></i> Instagram
                </a>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto'; // Re-enable scrolling
}

// Close modal when clicking outside the content
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Gallery Filter
const galleryGrid = document.getElementById('galleryGrid');
const galleryFilterButtons = document.querySelectorAll('.gallery-filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');
let galleryFilterTimer;

function setActiveGalleryFilter(activeButton) {
    const buttons = document.querySelectorAll('.gallery-filter-btn');
    buttons.forEach(button => {
        button.classList.remove('active', 'bg-coklatTua', 'text-putih');
        button.classList.add('bg-putih', 'text-coklatTua');
    });

    activeButton.classList.add('active', 'bg-coklatTua', 'text-putih');
    activeButton.classList.remove('bg-putih', 'text-coklatTua');
}

function filterGallery(category, withAnimation = false) {
    clearTimeout(galleryFilterTimer);

    const applyFilter = () => {
        let revealIndex = 0;

        const currentItems = galleryGrid ? galleryGrid.querySelectorAll('.gallery-item') : [];
        currentItems.forEach(item => {
            const isVisible = item.dataset.category === category;

            item.classList.remove('gallery-reveal');
            item.style.animationDelay = '';
            item.classList.toggle('hidden-by-filter', !isVisible);

            if (isVisible && withAnimation) {
                item.style.animationDelay = `${revealIndex * 90}ms`;
                item.classList.add('gallery-reveal');
                revealIndex++;
            }
        });

        if (galleryGrid) {
            galleryGrid.classList.remove('gallery-switching');
        }
    };

    if (withAnimation && galleryGrid) {
        galleryGrid.classList.add('gallery-switching');
        galleryFilterTimer = setTimeout(applyFilter, 180);
    } else {
        applyFilter();
    }
}

function attachGalleryFilterListeners() {
    const buttons = document.querySelectorAll('.gallery-filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('active')) return;
            setActiveGalleryFilter(btn);
            filterGallery(btn.dataset.filter, true);
        });
    });
}

// Gallery Preview Modal
const galleryPreviewModal = document.getElementById('galleryPreviewModal');
const galleryPreviewImage = document.getElementById('galleryPreviewImage');
const galleryPreviewTitle = document.getElementById('galleryPreviewTitle');

function openGalleryPreview(item) {
    if (!galleryPreviewModal || !galleryPreviewImage || !galleryPreviewTitle) return;

    const image = item.querySelector('img');
    const title = item.querySelector('.gallery-title')?.textContent || image?.alt || 'Gallery Preview';

    if (!image) return;

    galleryPreviewImage.src = image.src;
    galleryPreviewImage.alt = title;
    galleryPreviewTitle.textContent = title;
    galleryPreviewModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeGalleryPreview() {
    if (!galleryPreviewModal) return;

    galleryPreviewModal.classList.add('hidden');
    galleryPreviewImage.src = '';
    document.body.style.overflow = 'auto';
}

galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        if (!item.classList.contains('hidden-by-filter')) {
            openGalleryPreview(item);
        }
    });
});

if (galleryPreviewModal) {
    galleryPreviewModal.addEventListener('click', (e) => {
        if (e.target === galleryPreviewModal) {
            closeGalleryPreview();
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeGalleryPreview();
    }
});

// Scroll Animation Observer
const scrollAnimationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
});

// Apply scroll animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Animate all elements with scroll-animate class
    const scrollElements = document.querySelectorAll('.scroll-animate, .fade-in-left, .fade-in-right, .scale-up, .stagger-item');
    scrollElements.forEach(el => {
        scrollAnimationObserver.observe(el);
    });
    // Load produk dari API
    loadProductsFromAPI();
});

// Loading Screen
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loadingScreen');
    setTimeout(() => {
        loadingScreen.classList.add('fade-out');
    }, 1000); // Show loading for 1 second
});

// Helper to bridge add to cart from product list to cart.js
window.handleAddToCartCard = function(productId) {
    const p = productsData[productId];
    if (p) {
        if (typeof addToCart === 'function') {
            addToCart(p, 1);
        } else {
            console.error('addToCart function not loaded yet');
        }
    }
};

// Back to Top Button
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});