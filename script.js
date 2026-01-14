// 7 TASTE Food Delivery - Main JavaScript File (Updated for Viber/Telegram)

// ==================== GLOBAL DATA ====================
const MENU_DATA = [
    // Burgers
    { id: 1, name: "Beef Burger", description: "အမဲသား ၁၀၀% သုံးထားသော ဂျူစီဘာဂါ", price: 6500, category: "burger", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", badge: "အထူး" },
    { id: 2, name: "Chicken Burger", description: "ကြက်သား ကြော်ထားသော ကရစ်စပီဘာဂါ", price: 6000, category: "burger", image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { id: 3, name: "Cheese Burger", description: "ချိစ်အပြည့်နှင့် အမဲသားဘာဂါ", price: 7000, category: "burger", image: "https://images.unsplash.com/photo-1553979459-d2229ba7433c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", badge: "လူကြိုက်များ" },
    { id: 4, name: "Egg Burger", description: "ကြက်ဥနှင့် ဟင်းသီးဟင်းရွက်များပါဝင်သော ဘာဂါ", price: 5500, category: "burger", image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { id: 5, name: "Vegetables Burger", description: "ဟင်းသီးဟင်းရွက်များသာ ပါဝင်သော သက်သတ်လွတ်ဘာဂါ", price: 5000, category: "burger", image: "https://images.unsplash.com/photo-1561758033-7e924f619b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", badge: "သက်သတ်လွတ်" },
    
    // Sandwiches
    { id: 6, name: "Tuna Sandwich", description: "ဆယ်လ်မွန်ငါးနှင့် လတ်ဆတ်သော ဟင်းသီးဟင်းရွက်များ", price: 5500, category: "sandwich", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { id: 7, name: "Cheese Sandwich", description: "ချိစ်အမျိုးမျိုးနှင့် ဂျုံလုံးပေါင်မုန့်", price: 5000, category: "sandwich", image: "https://images.unsplash.com/photo-1481070414801-51fd732d7184?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", badge: "Cheesy" },
    
    // Hotdogs
    { id: 8, name: "Sausage Hotdog", description: "အရည်ရွှမ်းသော ဝက်အူချောင်းနှင့် ဆော့စ်များ", price: 4500, category: "hotdog", image: "https://images.unsplash.com/photo-1561501900-3701fa6a0864?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { id: 9, name: "Steak Hotdog", description: "အမဲသားစတိတ်နှင့် ချိစ်အပြည့်", price: 6000, category: "hotdog", image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" },
    { id: 10, name: "Cheese Steak Hotdog", description: "အမဲသားစတိတ် နှင့် ချိစ်ဒဲလူးရှပ်စ်", price: 7000, category: "hotdog", image: "https://images.unsplash.com/photo-1547584372-6f6d75a1e3c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", badge: "Premium" },
    
    // Specials
    { id: 11, name: "Sushi Set", description: "ဆူရှီ ၁၂ ချပ် (မက်ကရယ်၊ ထရာက်ငါး၊ ပင်လယ်စာ)", price: 12000, category: "special", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", badge: "ဂျပန်အရသာ" },
    { id: 12, name: "Spicy ခေါက်ဆွဲ", description: "ငရုတ်သီးဆူးပုံ မြန်မာ့ခေါက်ဆွဲကြော်", price: 5500, category: "special", image: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", badge: "စပ်စပ်" }
];

// ==================== CART FUNCTIONS ====================
function getCart() {
    try {
        return JSON.parse(localStorage.getItem('7taste_cart')) || [];
    } catch (error) {
        console.error('Error loading cart:', error);
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem('7taste_cart', JSON.stringify(cart));
        updateCartCount();
        // Trigger custom event for other pages to update
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
        console.error('Error saving cart:', error);
        showNotification('ဈေးခြင်းသိမ်းဆည်းရာတွင် အမှားတစ်ခုဖြစ်နေသည်။', 'error');
    }
}

function addToCart(item) {
    try {
        const cart = getCart();
        const existingItem = cart.find(i => i.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: 1,
                description: item.description || '',
                isCombo: item.isCombo || false
            });
        }
        
        saveCart(cart);
        showNotification(`${item.name} ကို ဈေးခြင်းထဲသို့ ထည့်သွင်းပြီးပါပြီ။`);
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('ဈေးခြင်းထဲသို့ထည့်ရာတွင် အမှားတစ်ခုဖြစ်နေသည်။', 'error');
    }
}

function removeFromCart(itemId) {
    try {
        const cart = getCart();
        const newCart = cart.filter(item => item.id !== itemId);
        saveCart(newCart);
        showNotification('ပစ္စည်းကို ဈေးခြင်းမှ ဖယ်ရှားပြီးပါပြီ။');
    } catch (error) {
        console.error('Error removing from cart:', error);
        showNotification('ပစ္စည်းဖယ်ရှားရာတွင် အမှားတစ်ခုဖြစ်နေသည်။', 'error');
    }
}

function updateCartItemQuantity(itemId, quantity) {
    try {
        if (quantity < 1) {
            removeFromCart(itemId);
            return;
        }
        
        const cart = getCart();
        const itemIndex = cart.findIndex(item => item.id === itemId);
        
        if (itemIndex !== -1) {
            cart[itemIndex].quantity = quantity;
            saveCart(cart);
        }
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        showNotification('အရေအတွက်ပြောင်းလဲရာတွင် အမှားတစ်ခုဖြစ်နေသည်။', 'error');
    }
}

function updateCartCount() {
    try {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElements = document.querySelectorAll('.cart-count');
        
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
        });
        
        return totalItems;
    } catch (error) {
        console.error('Error updating cart count:', error);
        return 0;
    }
}

function clearCart() {
    try {
        localStorage.removeItem('7taste_cart');
        updateCartCount();
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
        console.error('Error clearing cart:', error);
    }
}

// ==================== NOTIFICATION SYSTEM ====================
function showNotification(message, type = 'success') {
    try {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <i class="fas ${icon}" style="font-size: 1.5rem;"></i>
                <div>
                    <div style="font-weight: 700; margin-bottom: 5px;">7 TASTE</div>
                    <div>${message}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 3000);
    } catch (error) {
        console.error('Error showing notification:', error);
    }
}

// ==================== MENU FUNCTIONS ====================
function loadMenuItems(category = 'all') {
    try {
        const menuItemsContainer = document.getElementById('menuItems');
        if (!menuItemsContainer) return;
        
        const filteredItems = category === 'all' 
            ? MENU_DATA 
            : MENU_DATA.filter(item => item.category === category);
        
        menuItemsContainer.innerHTML = '';
        
        filteredItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item-card';
            menuItem.innerHTML = `
                ${item.badge ? `<div class="menu-badge">${item.badge}</div>` : ''}
                <img src="${item.image}" alt="${item.name}" class="menu-item-image" loading="lazy">
                <div class="menu-item-details">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <div class="menu-item-footer">
                        <span class="item-price">${item.price.toLocaleString()} ကျပ်</span>
                        <button class="add-to-cart-btn" data-id="${item.id}">
                            <i class="fas fa-plus"></i>
                            ထည့်မယ်
                        </button>
                    </div>
                </div>
            `;
            menuItemsContainer.appendChild(menuItem);
        });
        
        // Add event listeners to add-to-cart buttons
        menuItemsContainer.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = parseInt(this.getAttribute('data-id'));
                const item = MENU_DATA.find(i => i.id === itemId);
                if (item) {
                    addToCart(item);
                }
            });
        });
    } catch (error) {
        console.error('Error loading menu items:', error);
    }
}

function setupMenuFilters() {
    try {
        const categoryBtns = document.querySelectorAll('.category-btn');
        if (categoryBtns.length === 0) return;
        
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                categoryBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const category = this.getAttribute('data-category');
                loadMenuItems(category);
            });
        });
    } catch (error) {
        console.error('Error setting up menu filters:', error);
    }
}

// ==================== VIBER/TELEGRAM ORDER FUNCTIONS ====================
function submitOrderViaViber(orderMessage) {
    const viberNumber = '959790760003'; // ဆိုင်ရဲ့ Viber number
    const viberUrl = `viber://contact?number=${viberNumber}&text=${encodeURIComponent(orderMessage)}`;
    window.open(viberUrl, '_blank');
}

function submitOrderViaTelegram(orderMessage) {
    const telegramBot = 'seven_taste_bot'; // ဆိုင်ရဲ့ Telegram bot
    const telegramUrl = `https://t.me/${telegramBot}?text=${encodeURIComponent(orderMessage)}`;
    window.open(telegramUrl, '_blank');
}

function saveOrderToDatabase(orderData) {
    try {
        const existingOrders = JSON.parse(localStorage.getItem('7taste_orders')) || [];
        
        const newOrder = {
            id: 'ORD' + Date.now(),
            ...orderData,
            timestamp: new Date().toISOString(),
            status: 'new' // new, processing, delivered, rejected
        };
        
        existingOrders.unshift(newOrder);
        localStorage.setItem('7taste_orders', JSON.stringify(existingOrders));
        
        notifyAdminNewOrder(newOrder);
        
        return newOrder;
    } catch (error) {
        console.error('Error saving order:', error);
        return null;
    }
}

function notifyAdminNewOrder(order) {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("အော်ဒါအသစ်ရပြီ!", {
            body: `${order.customerName} မှ အော်ဒါအသစ်တင်ထားပါသည်။`,
            icon: "/favicon.ico"
        });
    }
    
    playNotificationSound();
}

function playNotificationSound() {
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
        audio.volume = 0.3;
        audio.play().catch(e => console.log("Audio play failed:", e));
    } catch (error) {
        console.log("Notification sound error:", error);
    }
}

function createOrderMessage(cart, customerInfo) {
    let message = "🍔 7 TASTE Food Delivery - New Order 🍔\n\n";
    message += "📋 Order Details:\n";
    message += "━━━━━━━━━━━━━━━━━━━━━━\n\n";
    
    message += "👤 Customer Information:\n";
    message += `• Name: ${customerInfo.name}\n`;
    message += `• Phone: ${customerInfo.phone}\n`;
    if (customerInfo.email) {
        message += `• Email: ${customerInfo.email}\n`;
    }
    message += `• Area: ${customerInfo.area}\n`;
    message += `• Address: ${customerInfo.address}\n`;
    message += `• Delivery Time: ${customerInfo.time}\n`;
    message += `• Payment: ${customerInfo.payment}\n\n`;
    
    message += "🍽️ Order Items:\n";
    message += "━━━━━━━━━━━━━━━━━━━━━━\n";
    
    let subtotal = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        message += `• ${item.name} x${item.quantity} = ${itemTotal.toLocaleString()} ကျပ်\n`;
    });
    
    const deliveryFee = subtotal >= 15000 ? 0 : 1000;
    const grandTotal = subtotal + deliveryFee;
    
    message += "\n💰 Order Summary:\n";
    message += `• Subtotal: ${subtotal.toLocaleString()} ကျပ်\n`;
    message += `• Delivery Fee: ${deliveryFee.toLocaleString()} ကျပ်\n`;
    message += `• Total: ${grandTotal.toLocaleString()} ကျပ်\n\n`;
    
    if (customerInfo.notes) {
        message += "📝 Special Instructions:\n";
        message += `${customerInfo.notes}\n\n`;
    }
    
    message += "━━━━━━━━━━━━━━━━━━━━━━\n";
    message += "Thank you for ordering from 7 TASTE! 🎉\n";
    message += "Order ID: ORD" + Date.now();
    
    return message;
}

function getPaymentMethodName(method) {
    const methods = {
        'cash': 'ငွေသား',
        'kbz': 'KBZ Pay',
        'wave': 'Wave Money',
        'cb': 'CB Pay'
    };
    return methods[method] || 'ငွေသား';
}

function requestNotificationPermission() {
    if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Notification permission granted");
            }
        });
    }
}

// ==================== ORDER PAGE FUNCTIONS ====================
function loadOrderItems() {
    try {
        const orderItemsContainer = document.getElementById('orderItems');
        const orderTotalsContainer = document.getElementById('orderTotals');
        const submitOrderBtn = document.getElementById('submitOrderBtn');
        
        if (!orderItemsContainer) return;
        
        const cart = getCart();
        
        if (cart.length === 0) {
            orderItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>ဈေးခြင်းထဲတွင် ပစ္စည်းမရှိသေးပါ</h3>
                    <p>ကျေးဇူးပြု၍ မီနူးမှ အစားအစာများကို ရွေးချယ်ပါ</p>
                    <a href="menu.html" class="btn btn-primary" style="margin-top: 20px;">
                        <i class="fas fa-utensils"></i>
                        မီနူးကြည့်မယ်
                    </a>
                </div>
            `;
            if (orderTotalsContainer) orderTotalsContainer.style.display = 'none';
            if (submitOrderBtn) submitOrderBtn.disabled = true;
            return;
        }
        
        let itemsHTML = '';
        let subtotal = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            itemsHTML += `
                <div class="order-item" data-id="${item.id}">
                    <div class="item-info">
                        <h4>${item.name}</h4>
                        <div class="item-price">${item.price.toLocaleString()} ကျပ်</div>
                        ${item.description ? `<small style="color: var(--gray);">${item.description}</small>` : ''}
                    </div>
                    <div class="item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn" data-action="decrease" data-id="${item.id}">-</button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn" data-action="increase" data-id="${item.id}">+</button>
                        </div>
                        <button class="remove-item" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        orderItemsContainer.innerHTML = itemsHTML;
        
        const deliveryFee = subtotal >= 15000 ? 0 : 1000;
        const grandTotal = subtotal + deliveryFee;
        
        if (orderTotalsContainer) {
            document.getElementById('subtotal').textContent = `${subtotal.toLocaleString()} ကျပ်`;
            document.getElementById('deliveryFee').textContent = `${deliveryFee.toLocaleString()} ကျပ်`;
            document.getElementById('grandTotal').textContent = `${grandTotal.toLocaleString()} ကျပ်`;
            orderTotalsContainer.style.display = 'block';
        }
        
        if (submitOrderBtn) {
            submitOrderBtn.disabled = false;
        }
        
        orderItemsContainer.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                const action = this.getAttribute('data-action');
                const cartItem = cart.find(item => item.id === itemId);
                
                if (cartItem) {
                    const newQuantity = action === 'increase' ? cartItem.quantity + 1 : cartItem.quantity - 1;
                    updateCartItemQuantity(itemId, newQuantity);
                    setTimeout(() => loadOrderItems(), 100);
                }
            });
        });
        
        orderItemsContainer.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                removeFromCart(itemId);
                setTimeout(() => loadOrderItems(), 100);
            });
        });
    } catch (error) {
        console.error('Error loading order items:', error);
        showNotification('အော်ဒါစာရင်းဖော်ပြရာတွင် အမှားတစ်ခုဖြစ်နေသည်။', 'error');
    }
}

function setupOrderPage() {
    try {
        const paymentMethods = document.querySelectorAll('.payment-method');
        const paymentMethodInput = document.getElementById('paymentMethod');
        
        if (paymentMethods.length > 0 && paymentMethodInput) {
            paymentMethods.forEach(method => {
                method.addEventListener('click', function() {
                    paymentMethods.forEach(m => m.classList.remove('selected'));
                    this.classList.add('selected');
                    paymentMethodInput.value = this.getAttribute('data-method');
                });
            });
            
            if (!document.querySelector('.payment-method.selected')) {
                document.querySelector('.payment-method[data-method="cash"]').classList.add('selected');
            }
        }
        
        const orderForm = document.getElementById('orderForm');
        if (orderForm) {
            orderForm.addEventListener('submit', function(e) {
                e.preventDefault();
                submitOrder();
            });
        }
        
        loadOrderItems();
    } catch (error) {
        console.error('Error setting up order page:', error);
    }
}

// ==================== UPDATED SUBMIT ORDER FUNCTION ====================
function submitOrder() {
    try {
        const cart = getCart();
        if (cart.length === 0) {
            showNotification('ကျေးဇူးပြု၍ ဈေးခြင်းထဲသို့ ပစ္စည်းထည့်သွင်းပါ။', 'error');
            return;
        }
        
        const customerName = document.getElementById('customerName')?.value;
        const customerPhone = document.getElementById('customerPhone')?.value;
        const deliveryArea = document.getElementById('deliveryArea')?.value;
        const deliveryAddress = document.getElementById('deliveryAddress')?.value;
        const deliveryTime = document.getElementById('deliveryTime')?.value;
        
        if (!customerName || !customerPhone || !deliveryArea || !deliveryAddress || !deliveryTime) {
            showNotification('ကျေးဇူးပြု၍ အချက်အလက်အားလုံးကို ဖြည့်သွင်းပါ။', 'error');
            return;
        }
        
        const customerEmail = document.getElementById('customerEmail')?.value || '';
        const paymentMethod = document.getElementById('paymentMethod')?.value || 'cash';
        const orderNotes = document.getElementById('orderNotes')?.value || '';
        
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = subtotal >= 15000 ? 0 : 1000;
        const grandTotal = subtotal + deliveryFee;
        
        const orderData = {
            customerName: customerName,
            customerPhone: customerPhone,
            customerEmail: customerEmail,
            deliveryArea: deliveryArea,
            deliveryAddress: deliveryAddress,
            deliveryTime: deliveryTime,
            paymentMethod: paymentMethod,
            orderNotes: orderNotes,
            items: cart.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                description: item.description || ''
            }))
        };
        
        const savedOrder = saveOrderToDatabase(orderData);
        
        if (!savedOrder) {
            throw new Error('Failed to save order');
        }
        
        const customerInfo = {
            name: customerName,
            phone: customerPhone,
            email: customerEmail,
            area: deliveryArea,
            address: deliveryAddress,
            time: deliveryTime,
            payment: getPaymentMethodName(paymentMethod),
            notes: orderNotes
        };
        
        const orderMessage = createOrderMessage(cart, customerInfo);
        
        const deliveryMethod = confirm(
            'အော်ဒါတင်ရန် နည်းလမ်းရွေးပါ:\n\n' +
            '"OK" နှိပ် - Viber ဖြင့်ပို့မည်\n' +
            '"Cancel" နှိပ် - WhatsApp ဖြင့်ပို့မည်'
        );
        
        if (deliveryMethod) {
            submitOrderViaViber(orderMessage);
            showNotification('အော်ဒါကို Viber ဖြင့်ပို့ပါမည်။ ကျေးဇူးပြု၍ Viber app ထဲတွင် "Send" နှိပ်ပေးပါ။');
        } else {
            const whatsappUrl = `https://wa.me/959790760003?text=${encodeURIComponent(orderMessage)}`;
            window.open(whatsappUrl, '_blank');
            showNotification('အော်ဒါကို WhatsApp ဖြင့်ပို့ပါမည်။');
        }
        
        clearCart();
        
        const orderForm = document.getElementById('orderForm');
        if (orderForm) {
            orderForm.reset();
            
            const paymentMethods = document.querySelectorAll('.payment-method');
            paymentMethods.forEach(m => m.classList.remove('selected'));
            document.querySelector('.payment-method[data-method="cash"]').classList.add('selected');
            document.getElementById('paymentMethod').value = 'cash';
        }
        
        if (typeof loadOrderItems === 'function') {
            loadOrderItems();
        }
        
    } catch (error) {
        console.error('Error submitting order:', error);
        showNotification('အော်ဒါတင်ရာတွင် အမှားတစ်ခုဖြစ်နေသည်။', 'error');
    }
}

// ==================== CONTACT PAGE FUNCTIONS ====================
function setupContactForm() {
    try {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                submitContactForm();
            });
        }
    } catch (error) {
        console.error('Error setting up contact form:', error);
    }
}

function submitContactForm() {
    try {
        const name = document.getElementById('name')?.value;
        const phone = document.getElementById('phone')?.value;
        const subject = document.getElementById('subject')?.value;
        const message = document.getElementById('message')?.value;
        
        if (!name || !phone || !subject || !message) {
            showNotification('ကျေးဇူးပြု၍ အချက်အလက်အားလုံးကို ဖြည့်သွင်းပါ။', 'error');
            return;
        }
        
        const email = document.getElementById('email')?.value || '';
        
        const whatsappMessage = `7 TASTE မက်ဆေ့ဂျ်%0A%0Aနာမည်: ${name}%0Aဖုန်း: ${phone}%0A${email ? `အီးမေးလ်: ${email}%0A` : ''}အကြောင်းအရာ: ${subject}%0Aမက်ဆေ့ဂျ်: ${message}%0A%0Aကျေးဇူးတင်ပါတယ်!`;
        
        window.open(`https://wa.me/959790760003?text=${whatsappMessage}`, '_blank');
        
        showNotification('မက်ဆေ့ဂျ်ကို WhatsApp ဖြင့် ပို့ဆောင်ပေးပါမည်။');
        
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.reset();
        }
    } catch (error) {
        console.error('Error submitting contact form:', error);
        showNotification('မက်ဆေ့ဂျ်ပေးပို့ရာတွင် အမှားတစ်ခုဖြစ်နေသည်။', 'error');
    }
}

// ==================== ADMIN DASHBOARD FUNCTIONS ====================
function getAdminOrders() {
    try {
        return JSON.parse(localStorage.getItem('7taste_orders')) || [];
    } catch (error) {
        console.error('Error loading admin orders:', error);
        return [];
    }
}

function updateOrderStatus(orderId, newStatus) {
    try {
        const orders = getAdminOrders();
        const orderIndex = orders.findIndex(order => order.id === orderId);
        
        if (orderIndex !== -1) {
            orders[orderIndex].status = newStatus;
            localStorage.setItem('7taste_orders', JSON.stringify(orders));
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error updating order status:', error);
        return false;
    }
}

function getOrderStatistics() {
    try {
        const orders = getAdminOrders();
        
        const totalOrders = orders.length;
        const newOrders = orders.filter(order => order.status === 'new').length;
        const processingOrders = orders.filter(order => order.status === 'processing').length;
        const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
        
        const totalRevenue = orders
            .filter(order => order.status === 'delivered')
            .reduce((sum, order) => {
                const itemsTotal = order.items.reduce((s, item) => s + (item.price * item.quantity), 0);
                const deliveryFee = itemsTotal >= 15000 ? 0 : 1000;
                return sum + itemsTotal + deliveryFee;
            }, 0);
        
        return {
            totalOrders,
            newOrders,
            processingOrders,
            deliveredOrders,
            totalRevenue
        };
    } catch (error) {
        console.error('Error getting order statistics:', error);
        return {
            totalOrders: 0,
            newOrders: 0,
            processingOrders: 0,
            deliveredOrders: 0,
            totalRevenue: 0
        };
    }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    try {
        updateCartCount();
        
        if (document.getElementById('menuItems')) {
            loadMenuItems();
            setupMenuFilters();
        }
        
        if (document.getElementById('orderForm')) {
            setupOrderPage();
        }
        
        if (document.getElementById('contactForm')) {
            setupContactForm();
        }
        
        requestNotificationPermission();
        
        window.addEventListener('storage', function(e) {
            if (e.key === '7taste_cart') {
                updateCartCount();
                if (document.getElementById('orderItems')) {
                    loadOrderItems();
                }
            }
        });
        
        window.addEventListener('cartUpdated', function() {
            updateCartCount();
            if (document.getElementById('orderItems')) {
                loadOrderItems();
            }
        });
        
        document.addEventListener('click', function(e) {
            if (e.target.closest('.category-btn')) {
                const btn = e.target.closest('.category-btn');
                const categoryBtns = document.querySelectorAll('.category-btn');
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const category = btn.getAttribute('data-category');
                loadMenuItems(category);
            }
        });
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

// ==================== EXPORT FUNCTIONS FOR GLOBAL USE ====================
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartItemQuantity = updateCartItemQuantity;
window.getCart = getCart;
window.showNotification = showNotification;
window.clearCart = clearCart;
window.loadOrderItems = loadOrderItems;
window.submitOrderViaViber = submitOrderViaViber;
window.submitOrderViaTelegram = submitOrderViaTelegram;
window.saveOrderToDatabase = saveOrderToDatabase;
window.getAdminOrders = getAdminOrders;
window.updateOrderStatus = updateOrderStatus;
window.getOrderStatistics = getOrderStatistics;
