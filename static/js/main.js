// Main JavaScript for FOOD SERVICE App

// --- Toast Notification System ---
const ToastCenter = {
    show(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `p-4 rounded shadow-lg border-l-4 min-w-[300px] max-w-sm glass transform transition-all duration-300 animate-slide-up flex justify-between items-center`;

        // Colors
        let bgStyle = '';
        if (type === 'success') {
            toast.style.borderColor = '#c9a961';
            toast.innerHTML = `<div class='flex items-center gap-3'><i class='ph ph-check-circle text-gold text-2xl'></i> <span class='text-white font-medium'>${message}</span></div>`;
        } else if (type === 'danger' || type === 'error') {
            toast.style.borderColor = '#ef4444';
            toast.innerHTML = `<div class='flex items-center gap-3'><i class='ph ph-warning-circle text-red-500 text-2xl'></i> <span class='text-white font-medium'>${message}</span></div>`;
        } else {
            toast.style.borderColor = '#3b82f6';
            toast.innerHTML = `<div class='flex items-center gap-3'><i class='ph ph-info text-blue-500 text-2xl'></i> <span class='text-white font-medium'>${message}</span></div>`;
        }

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '<i class="ph ph-x"></i>';
        closeBtn.className = 'text-gray-400 hover:text-white transition';
        closeBtn.onclick = () => {
            toast.style.animation = 'fadeOutRight 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        };
        toast.appendChild(closeBtn);

        container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'fadeOutRight 0.3s forwards';
                setTimeout(() => toast.remove(), 300);
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
                <div class="text-center py-12">
                    <i class="ph ph-shopping-cart text-6xl text-gray-600 mb-4"></i>
                    <p class="text-gray-400 text-lg">Hozircha savatchangiz bo'sh. Menu orqali taomlarni ko'ring!</p>
                    <a href="/menu" class="btn-gold inline-block mt-4 px-6 py-3 font-semibold rounded-md">Menuga o'tish</a>
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
                <div class="flex items-center justify-between border-b border-lightgray py-4">
                    <div class="flex items-center gap-4">
                        <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-md">
                        <div>
                            <h4 class="font-bold text-lg">${item.name}</h4>
                            <p class="text-gold font-medium">${item.price.toLocaleString()} so'm</p>
                        </div>
                    </div>
                    
                    <div class="flex flex-col items-end gap-2">
                        <div class="flex items-center bg-darkgray rounded-md border border-lightgray">
                            <button onclick="Cart.updateQuantity(${item.id}, ${item.quantity - 1})" class="px-3 py-1 hover:text-gold transition">-</button>
                            <span class="px-2 w-8 text-center">${item.quantity}</span>
                            <button onclick="Cart.updateQuantity(${item.id}, ${item.quantity + 1})" class="px-3 py-1 hover:text-gold transition">+</button>
                        </div>
                        <p class="font-bold text-gray-300">Summa: ${itemTotal.toLocaleString()} so'm</p>
                        <button onclick="Cart.remove(${item.id})" class="text-red-500 hover:text-red-400 text-sm flex items-center gap-1"><i class="ph ph-trash"></i> O'chirish</button>
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
