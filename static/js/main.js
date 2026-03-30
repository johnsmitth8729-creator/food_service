// Main JavaScript for FOOD SERVICE App

// --- Toast Notification System ---
const ToastCenter = {
    show(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;

        // Icon map
        const icons = {
            success: 'ph-check-circle',
            danger:  'ph-warning-circle',
            error:   'ph-warning-circle',
            info:    'ph-info',
            warning: 'ph-warning'
        };
        const iconClass = icons[type] || 'ph-info';

        toast.innerHTML = `
            <div style="display:flex;align-items:center;gap:0.75rem;flex:1">
                <i class="ph ${iconClass} toast-icon" style="font-size:1.5rem;flex-shrink:0"></i>
                <span class="toast-message">${message}</span>
            </div>
        `;

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '<i class="ph ph-x"></i>';
        closeBtn.className = 'toast-close-btn';
        closeBtn.onclick = () => {
            toast.style.animation = 'fadeOutRight 0.35s forwards';
            setTimeout(() => toast.remove(), 350);
        };
        toast.appendChild(closeBtn);

        container.appendChild(toast);

        // Auto remove after 5s
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'fadeOutRight 0.35s forwards';
                setTimeout(() => toast.remove(), 350);
            }
        }, 5000);
    }
};

// Handle Flash Messages from Flask
document.addEventListener('DOMContentLoaded', () => {
    if (typeof flashMessages !== 'undefined') {
        flashMessages.forEach(msg => {
            ToastCenter.show(msg.message, msg.type);
        });
    }
});


// --- Cart Management (LocalStorage) ---
const Cart = {
    items: [],

    init() {
        const stored = localStorage.getItem('foodcart');
        if (stored) {
            this.items = JSON.parse(stored);
        }
        this.updateBadge();
        this.renderCart();
    },

    save() {
        localStorage.setItem('foodcart', JSON.stringify(this.items));
        this.updateBadge();
    },

    add(id, name, price, image) {
        const existing = this.items.find(i => i.id == id);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.items.push({ id, name, price, image, quantity: 1 });
        }
        this.save();
        ToastCenter.show(`${name} savatchaga qo'shildi!`, 'success');
    },

    remove(id) {
        this.items = this.items.filter(i => i.id != id);
        this.save();
        this.renderCart();
    },

    updateQuantity(id, qty) {
        const existing = this.items.find(i => i.id == id);
        if (existing) {
            existing.quantity = Math.max(1, parseInt(qty) || 1);
            this.save();
            this.renderCart();
        }
    },

    clear() {
        this.items = [];
        this.save();
    },

    updateBadge() {
        const badge = document.getElementById('cart-count');
        if (badge) {
            const total = this.items.reduce((sum, item) => sum + item.quantity, 0);
            badge.innerText = total;
            // Pulse animation
            badge.classList.add('scale-150');
            setTimeout(() => badge.classList.remove('scale-150'), 200);
        }
    },

    renderCart() {
        const container = document.getElementById('cart-items-container');
        if (!container) return; // Not on Cart page

        if (this.items.length === 0) {
            container.innerHTML = `
                <div class="text-center py-16">
                    <i class="ph ph-shopping-cart-simple" style="font-size:4rem;color:#d1d5db;display:block;margin-bottom:1rem"></i>
                    <h3 style="font-size:1.25rem;font-weight:700;color:#1f2937;margin-bottom:0.5rem">Savatchangiz bo'sh</h3>
                    <p style="color:#6b7280;margin-bottom:1.5rem">Menuga o'tib o'zingizga yoqqan taomni tanlang</p>
                    <a href="/menu" style="display:inline-block;background:#ff7a00;color:#fff;padding:0.75rem 2rem;border-radius:0.5rem;font-weight:700;text-decoration:none">Menuga o'tish</a>
                </div>
            `;
            document.getElementById('cart-summary').style.display = 'none';
            return;
        }

        document.getElementById('cart-summary').style.display = 'block';

        let html = '';
        let totalSum = 0;

        this.items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            totalSum += itemTotal;
            html += `
                <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #f3f4f6;padding:1rem 0;gap:1rem">
                    <div style="display:flex;align-items:center;gap:1rem;flex:1">
                        <img src="${item.image}" alt="${item.name}" style="width:5rem;height:5rem;object-fit:cover;border-radius:0.5rem;flex-shrink:0">
                        <div>
                            <h4 style="font-weight:700;font-size:1rem;color:#1f2937;margin-bottom:0.25rem">${item.name}</h4>
                            <p style="color:#ff7a00;font-weight:600">${item.price.toLocaleString()} so'm</p>
                        </div>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.5rem">
                        <div style="display:flex;align-items:center;border:1px solid #e5e7eb;border-radius:0.5rem;overflow:hidden">
                            <button onclick="Cart.updateQuantity(${item.id}, ${item.quantity - 1})" style="padding:0.375rem 0.75rem;background:#f9fafb;color:#374151;border:none;cursor:pointer;font-size:1rem;line-height:1;transition:background 0.2s" onmouseover="this.style.background='#ff7a00';this.style.color='#fff'" onmouseout="this.style.background='#f9fafb';this.style.color='#374151'">-</button>
                            <span style="padding:0 0.75rem;font-weight:600;color:#1f2937;min-width:2rem;text-align:center">${item.quantity}</span>
                            <button onclick="Cart.updateQuantity(${item.id}, ${item.quantity + 1})" style="padding:0.375rem 0.75rem;background:#f9fafb;color:#374151;border:none;cursor:pointer;font-size:1rem;line-height:1;transition:background 0.2s" onmouseover="this.style.background='#ff7a00';this.style.color='#fff'" onmouseout="this.style.background='#f9fafb';this.style.color='#374151'">+</button>
                        </div>
                        <p style="font-weight:700;color:#1f2937;font-size:0.875rem">Jami: ${itemTotal.toLocaleString()} so'm</p>
                        <button onclick="Cart.remove(${item.id})" style="color:#ef4444;background:none;border:none;cursor:pointer;font-size:0.8rem;display:flex;align-items:center;gap:0.25rem" onmouseover="this.style.color='#b91c1c'" onmouseout="this.style.color='#ef4444'"><i class="ph ph-trash"></i> O'chirish</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        document.getElementById('cart-total-price').innerText = `${totalSum.toLocaleString()} so'm`;
        
        // Inject cart data into form input for backend processing
        const cartDataInput = document.getElementById('cart_data_input');
        if(cartDataInput) {
            cartDataInput.value = JSON.stringify(this.items);
        }
    }
};

// --- Mobile Menu Toggle ---
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// --- Navbar scroll effect ---
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (window.scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// Global scope bindings for inline event handlers
window.Cart = Cart;

// Init
document.addEventListener('DOMContentLoaded', () => {
    Cart.init();
    
    // Check if redirect has order success flag (passed via url parameters ?order=success)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('order') === 'success') {
        Cart.clear();
        // Remove param from URL cleanly
        window.history.replaceState(null, null, window.location.pathname);
    }
});

