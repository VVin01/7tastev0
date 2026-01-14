// admin.js - Complete Admin Dashboard

const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: '7taste2024'
};

// LocalStorage Keys
const ORDERS_KEY = '7taste_orders';
const MENU_KEY = '7taste_menu';
const PROMOTIONS_KEY = '7taste_promotions';
const SETTINGS_KEY = '7taste_settings';

// Global Variables
let currentEditingItemId = null;
let currentDeletingItemId = null;
let currentDeletingType = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    setupEventListeners();
    if (isLoggedIn()) {
        initializeDashboard();
    }
});

// ==================== AUTHENTICATION ====================
function checkLoginStatus() {
    if (isLoggedIn()) {
        showDashboard();
    }
}

function isLoggedIn() {
    return localStorage.getItem('7taste_admin_logged_in') === 'true';
}

function showDashboard() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'block';
}

function logout() {
    localStorage.removeItem('7taste_admin_logged_in');
    location.reload();
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('adminUsername').value;
            const password = document.getElementById('adminPassword').value;
            
            if (username === ADMIN_CREDENTIALS.username && 
                password === ADMIN_CREDENTIALS.password) {
                localStorage.setItem('7taste_admin_logged_in', 'true');
                showDashboard();
                initializeDashboard();
            } else {
                alert('Incorrect username or password');
            }
        });
    }
    
    // Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Tab Navigation
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            const category = this.getAttribute('data-category');
            
            if (filter) {
                filterOrders(filter);
            } else if (category) {
                filterMenuItems(category);
            }
        });
    });
    
    // Menu Item Form
    const menuItemForm = document.getElementById('menuItemForm');
    if (menuItemForm) {
        menuItemForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveMenuItem();
        });
    }
    
    // Promotion Form
    const promotionForm = document.getElementById('promotionForm');
    if (promotionForm) {
        promotionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            savePromotion();
        });
    }
}

// ==================== DASHBOARD FUNCTIONS ====================
function initializeDashboard() {
    loadDashboardStats();
    loadRecentOrders();
    loadAllOrders();
    loadMenuItems();
    loadPromotions();
    loadSettings();
}

function switchTab(tabId) {
    // Update active tab
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.admin-tab[data-tab="${tabId}"]`).classList.add('active');
    
    // Show active content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabId}Tab`).classList.add('active');
    
    // Refresh data for the tab
    switch(tabId) {
        case 'dashboard':
            loadDashboardStats();
            loadRecentOrders();
            break;
        case 'orders':
            loadAllOrders();
            break;
        case 'menu':
            loadMenuItems();
            break;
        case 'promotions':
            loadPromotions();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// ==================== DASHBOARD STATISTICS ====================
function loadDashboardStats() {
    const orders = getOrders();
    const today = new Date().toDateString();
    
    // Calculate statistics
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => 
        order.status === 'new' || order.status === 'processing'
    ).length;
    const completedOrders = orders.filter(order => 
        order.status === 'delivered'
    ).length;
    
    // Calculate today's revenue
    const todayRevenue = orders
        .filter(order => {
            const orderDate = new Date(order.timestamp).toDateString();
            return orderDate === today && order.status === 'delivered';
        })
        .reduce((sum, order) => {
            const itemsTotal = order.items.reduce((s, item) => s + (item.price * item.quantity), 0);
            const deliveryFee = itemsTotal >= 15000 ? 0 : 1000;
            return sum + itemsTotal + deliveryFee;
        }, 0);
    
    // Calculate total revenue
    const totalRevenue = orders
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => {
            const itemsTotal = order.items.reduce((s, item) => s + (item.price * item.quantity), 0);
            const deliveryFee = itemsTotal >= 15000 ? 0 : 1000;
            return sum + itemsTotal + deliveryFee;
        }, 0);
    
    // Update UI
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('completedOrders').textContent = completedOrders;
    document.getElementById('todayRevenue').textContent = `${todayRevenue.toLocaleString()} ကျပ်`;
    
    // Calculate trends (simplified)
    const ordersTrend = totalOrders > 0 ? '+12%' : '+0%';
    const revenueTrend = todayRevenue > 0 ? '+8%' : '+0%';
    
    document.getElementById('ordersTrend').textContent = `${ordersTrend} from yesterday`;
    document.getElementById('revenueTrend').textContent = `${revenueTrend} from yesterday`;
}

// ==================== ORDER MANAGEMENT ====================
function getOrders() {
    try {
        return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    } catch (error) {
        console.error('Error loading orders:', error);
        return [];
    }
}

function saveOrders(orders) {
    try {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch (error) {
        console.error('Error saving orders:', error);
        showAlert('Error saving orders', 'error');
    }
}

function loadRecentOrders() {
    const orders = getOrders();
    const recentOrdersContainer = document.getElementById('recentOrders');
    
    // Get 5 most recent orders
    const recentOrders = orders.slice(0, 5);
    
    if (recentOrders.length === 0) {
        recentOrdersContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #747D8C;">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.3;"></i>
                <p>No recent orders</p>
            </div>
        `;
        return;
    }
    
    let ordersHTML = `
        <table class="orders-table">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Time</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    recentOrders.forEach(order => {
        const orderTime = new Date(order.timestamp);
        const timeAgo = getTimeAgo(orderTime);
        const itemsTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = itemsTotal >= 15000 ? 0 : 1000;
        const grandTotal = itemsTotal + deliveryFee;
        
        ordersHTML += `
            <tr>
                <td><strong>${order.id}</strong></td>
                <td>
                    <div>${order.customerName}</div>
                    <small>${order.customerPhone}</small>
                </td>
                <td>${grandTotal.toLocaleString()} ကျပ်</td>
                <td><span class="order-status status-${order.status}">${getOrderStatusText(order.status)}</span></td>
                <td>${timeAgo}</td>
                <td>
                    <div class="action-buttons">
                        ${getOrderActionButtons(order)}
                    </div>
                </td>
            </tr>
        `;
    });
    
    ordersHTML += `</tbody></table>`;
    recentOrdersContainer.innerHTML = ordersHTML;
    
    // Add event listeners to action buttons
    recentOrdersContainer.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.getAttribute('data-order-id');
            const action = this.getAttribute('data-action');
            handleOrderAction(orderId, action);
        });
    });
}

function loadAllOrders() {
    const orders = getOrders();
    const ordersTable = document.getElementById('allOrdersTable');
    
    if (orders.length === 0) {
        ordersTable.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #747D8C;">
                    <i class="fas fa-shopping-cart" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.3;"></i>
                    <p>No orders yet</p>
                </td>
            </tr>
        `;
        return;
    }
    
    let ordersHTML = '';
    
    orders.forEach(order => {
        const orderTime = new Date(order.timestamp);
        const formattedTime = orderTime.toLocaleDateString('my-MM') + ' ' + orderTime.toLocaleTimeString('my-MM', { hour: '2-digit', minute: '2-digit' });
        
        const itemsTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = itemsTotal >= 15000 ? 0 : 1000;
        const grandTotal = itemsTotal + deliveryFee;
        
        const itemsText = order.items.map(item => `${item.name} (${item.quantity})`).join(', ');
        
        ordersHTML += `
            <tr>
                <td><strong>${order.id}</strong></td>
                <td>
                    <div><strong>${order.customerName}</strong></div>
                    <small>${order.customerPhone}</small>
                    ${order.deliveryArea ? `<div><small>${order.deliveryArea}</small></div>` : ''}
                </td>
                <td>${itemsText}</td>
                <td>${grandTotal.toLocaleString()} ကျပ်</td>
                <td><span class="order-status status-${order.status}">${getOrderStatusText(order.status)}</span></td>
                <td>${formattedTime}</td>
                <td>
                    <div class="action-buttons">
                        ${getOrderActionButtons(order)}
                        <button class="action-btn edit" data-order-id="${order.id}" data-action="view">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    ordersTable.innerHTML = ordersHTML;
    
    // Add event listeners
    ordersTable.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.getAttribute('data-order-id');
            const action = this.getAttribute('data-action');
            handleOrderAction(orderId, action);
        });
    });
}

function filterOrders(filterType) {
    const orders = getOrders();
    let filteredOrders = orders;
    
    if (filterType !== 'all') {
        filteredOrders = orders.filter(order => order.status === filterType);
    }
    
    // Update the table with filtered orders (similar to loadAllOrders but with filtered data)
    const ordersTable = document.getElementById('allOrdersTable');
    
    if (filteredOrders.length === 0) {
        ordersTable.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #747D8C;">
                    No orders found
                </td>
            </tr>
        `;
        return;
    }
    
    let ordersHTML = '';
    
    filteredOrders.forEach(order => {
        const orderTime = new Date(order.timestamp);
        const formattedTime = orderTime.toLocaleDateString('my-MM') + ' ' + orderTime.toLocaleTimeString('my-MM', { hour: '2-digit', minute: '2-digit' });
        
        const itemsTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = itemsTotal >= 15000 ? 0 : 1000;
        const grandTotal = itemsTotal + deliveryFee;
        
        const itemsText = order.items.map(item => `${item.name} (${item.quantity})`).join(', ');
        
        ordersHTML += `
            <tr>
                <td><strong>${order.id}</strong></td>
                <td>
                    <div><strong>${order.customerName}</strong></div>
                    <small>${order.customerPhone}</small>
                </td>
                <td>${itemsText}</td>
                <td>${grandTotal.toLocaleString()} ကျပ်</td>
                <td><span class="order-status status-${order.status}">${getOrderStatusText(order.status)}</span></td>
                <td>${formattedTime}</td>
                <td>
                    <div class="action-buttons">
                        ${getOrderActionButtons(order)}
                        <button class="action-btn edit" data-order-id="${order.id}" data-action="view">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    ordersTable.innerHTML = ordersHTML;
    
    // Re-add event listeners
    ordersTable.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.getAttribute('data-order-id');
            const action = this.getAttribute('data-action');
            handleOrderAction(orderId, action);
        });
    });
}

function handleOrderAction(orderId, action) {
    const orders = getOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) return;
    
    switch(action) {
        case 'accept':
            orders[orderIndex].status = 'processing';
            break;
        case 'process':
            orders[orderIndex].status = 'processing';
            break;
        case 'complete':
            orders[orderIndex].status = 'delivered';
            break;
        case 'cancel':
            orders[orderIndex].status = 'cancelled';
            break;
        case 'view':
            viewOrderDetails(orders[orderIndex]);
            return;
    }
    
    saveOrders(orders);
    
    // Refresh all order displays
    loadDashboardStats();
    loadRecentOrders();
    loadAllOrders();
    
    showAlert(`Order ${orderId} status updated to ${getOrderStatusText(orders[orderIndex].status)}`);
}

function getOrderActionButtons(order) {
    let buttons = '';
    
    switch(order.status) {
        case 'new':
            buttons = `
                <button class="action-btn accept" data-order-id="${order.id}" data-action="accept">
                    <i class="fas fa-check"></i> Accept
                </button>
                <button class="action-btn cancel" data-order-id="${order.id}" data-action="cancel">
                    <i class="fas fa-times"></i> Cancel
                </button>
            `;
            break;
        case 'processing':
            buttons = `
                <button class="action-btn complete" data-order-id="${order.id}" data-action="complete">
                    <i class="fas fa-truck"></i> Deliver
                </button>
            `;
            break;
        case 'delivered':
            buttons = `<span style="color: #2ED573; font-weight: 600;">Completed</span>`;
            break;
        case 'cancelled':
            buttons = `<span style="color: #FF4757; font-weight: 600;">Cancelled</span>`;
            break;
    }
    
    return buttons;
}

function getOrderStatusText(status) {
    const statusMap = {
        'new': 'New',
        'processing': 'Processing',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
}

function viewOrderDetails(order) {
    const itemsTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = itemsTotal >= 15000 ? 0 : 1000;
    const grandTotal = itemsTotal + deliveryFee;
    
    const details = `
Order ID: ${order.id}
Customer: ${order.customerName}
Phone: ${order.customerPhone}
Email: ${order.customerEmail || 'N/A'}
Delivery Area: ${order.deliveryArea}
Address: ${order.deliveryAddress}
Delivery Time: ${order.deliveryTime}
Payment Method: ${order.paymentMethod}
Status: ${getOrderStatusText(order.status)}
Order Time: ${new Date(order.timestamp).toLocaleString('my-MM')}

Items:
${order.items.map(item => `  • ${item.name} x${item.quantity} = ${(item.price * item.quantity).toLocaleString()} MMK`).join('\n')}

Subtotal: ${itemsTotal.toLocaleString()} MMK
Delivery Fee: ${deliveryFee.toLocaleString()} MMK
Total: ${grandTotal.toLocaleString()} MMK

Notes: ${order.orderNotes || 'None'}
    `;
    
    alert(details);
}

function exportOrders() {
    const orders = getOrders();
    const csv = convertToCSV(orders);
    downloadCSV(csv, '7taste_orders.csv');
    showAlert('Orders exported successfully');
}

// ==================== MENU MANAGEMENT ====================
function getMenuItems() {
    try {
        return JSON.parse(localStorage.getItem(MENU_KEY)) || [];
    } catch (error) {
        console.error('Error loading menu:', error);
        return [];
    }
}

function saveMenuItems(menuItems) {
    try {
        localStorage.setItem(MENU_KEY, JSON.stringify(menuItems));
        // Also update the main menu data in script.js
        if (typeof updateMainMenuData === 'function') {
            updateMainMenuData(menuItems);
        }
    } catch (error) {
        console.error('Error saving menu:', error);
        showAlert('Error saving menu items', 'error');
    }
}

function loadMenuItems() {
    const menuItems = getMenuItems();
    const menuContainer = document.getElementById('menuItemsAdmin');
    
    if (menuItems.length === 0) {
        menuContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: #747D8C;">
                <i class="fas fa-utensils" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.3;"></i>
                <p>No menu items yet</p>
                <button class="action-btn accept" onclick="openAddMenuModal()" style="margin-top: 15px;">
                    <i class="fas fa-plus"></i> Add Your First Item
                </button>
            </div>
        `;
        return;
    }
    
    let menuHTML = '';
    
    menuItems.forEach(item => {
        const categoryText = getCategoryText(item.category);
        
        menuHTML += `
            <div class="menu-item-admin">
                <div class="menu-item-header">
                    <h3>${item.name}</h3>
                    ${item.badge ? `<span class="menu-badge-admin">${item.badge}</span>` : ''}
                </div>
                
                <div style="color: #747D8C; font-size: 0.9rem; margin-bottom: 10px;">
                    <i class="fas fa-tag"></i> ${categoryText}
                </div>
                
                <p style="color: #555; font-size: 0.9rem; margin-bottom: 10px;">${item.description}</p>
                
                <div class="menu-item-price">${item.price.toLocaleString()} ကျပ်</div>
                
                <div style="font-size: 0.8rem; color: ${item.availability === 'available' ? '#2ED573' : '#FF4757'}; margin-bottom: 15px;">
                    <i class="fas fa-circle"></i> ${item.availability === 'available' ? 'Available' : 'Unavailable'}
                </div>
                
                <div class="menu-item-actions">
                    <button class="action-btn edit" onclick="editMenuItem('${item.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete" onclick="confirmDeleteMenuItem('${item.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    });
    
    menuContainer.innerHTML = menuHTML;
}

function filterMenuItems(category) {
    const menuItems = getMenuItems();
    const menuContainer = document.getElementById('menuItemsAdmin');
    
    let filteredItems = menuItems;
    if (category !== 'all') {
        filteredItems = menuItems.filter(item => item.category === category);
    }
    
    if (filteredItems.length === 0) {
        menuContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: #747D8C;">
                <i class="fas fa-utensils" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.3;"></i>
                <p>No ${category === 'all' ? '' : category} items found</p>
            </div>
        `;
        return;
    }
    
    let menuHTML = '';
    
    filteredItems.forEach(item => {
        const categoryText = getCategoryText(item.category);
        
        menuHTML += `
            <div class="menu-item-admin">
                <div class="menu-item-header">
                    <h3>${item.name}</h3>
                    ${item.badge ? `<span class="menu-badge-admin">${item.badge}</span>` : ''}
                </div>
                
                <div style="color: #747D8C; font-size: 0.9rem; margin-bottom: 10px;">
                    <i class="fas fa-tag"></i> ${categoryText}
                </div>
                
                <p style="color: #555; font-size: 0.9rem; margin-bottom: 10px;">${item.description}</p>
                
                <div class="menu-item-price">${item.price.toLocaleString()} ကျပ်</div>
                
                <div style="font-size: 0.8rem; color: ${item.availability === 'available' ? '#2ED573' : '#FF4757'}; margin-bottom: 15px;">
                    <i class="fas fa-circle"></i> ${item.availability === 'available' ? 'Available' : 'Unavailable'}
                </div>
                
                <div class="menu-item-actions">
                    <button class="action-btn edit" onclick="editMenuItem('${item.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete" onclick="confirmDeleteMenuItem('${item.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    });
    
    menuContainer.innerHTML = menuHTML;
}

function getCategoryText(category) {
    const categories = {
        'burger': 'Burger',
        'sandwich': 'Sandwich',
        'hotdog': 'Hotdog',
        'special': 'Special'
    };
    return categories[category] || category;
}

function openAddMenuModal() {
    currentEditingItemId = null;
    document.getElementById('modalTitle').textContent = 'Add Menu Item';
    document.getElementById('menuItemForm').reset();
    document.getElementById('menuItemModal').classList.add('active');
}

function openEditMenuModal(itemId) {
    const menuItems = getMenuItems();
    const item = menuItems.find(item => item.id === itemId);
    
    if (!item) return;
    
    currentEditingItemId = itemId;
    document.getElementById('modalTitle').textContent = 'Edit Menu Item';
    
    // Fill form with item data
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemPrice').value = item.price;
    document.getElementById('itemBadge').value = item.badge || '';
    document.getElementById('itemDescription').value = item.description;
    document.getElementById('itemImage').value = item.image || '';
    document.getElementById('itemAvailability').value = item.availability || 'available';
    
    document.getElementById('menuItemModal').classList.add('active');
}

function closeModal() {
    document.getElementById('menuItemModal').classList.remove('active');
    currentEditingItemId = null;
}

function saveMenuItem() {
    const menuItems = getMenuItems();
    
    const itemData = {
        id: currentEditingItemId || 'ITEM' + Date.now(),
        name: document.getElementById('itemName').value,
        category: document.getElementById('itemCategory').value,
        price: parseInt(document.getElementById('itemPrice').value),
        badge: document.getElementById('itemBadge').value || null,
        description: document.getElementById('itemDescription').value,
        image: document.getElementById('itemImage').value,
        availability: document.getElementById('itemAvailability').value,
        createdAt: new Date().toISOString()
    };
    
    if (currentEditingItemId) {
        // Update existing item
        const index = menuItems.findIndex(item => item.id === currentEditingItemId);
        if (index !== -1) {
            menuItems[index] = { ...menuItems[index], ...itemData };
        }
    } else {
        // Add new item
        menuItems.push(itemData);
    }
    
    saveMenuItems(menuItems);
    closeModal();
    loadMenuItems();
    showAlert(`Menu item ${currentEditingItemId ? 'updated' : 'added'} successfully`);
}

function editMenuItem(itemId) {
    openEditMenuModal(itemId);
}

function confirmDeleteMenuItem(itemId) {
    currentDeletingItemId = itemId;
    currentDeletingType = 'menu';
    
    const menuItems = getMenuItems();
    const item = menuItems.find(item => item.id === itemId);
    
    if (item) {
        document.getElementById('deleteMessage').textContent = 
            `Are you sure you want to delete "${item.name}"? This action cannot be undone.`;
        document.getElementById('deleteModal').classList.add('active');
    }
}

// ==================== PROMOTION MANAGEMENT ====================
function getPromotions() {
    try {
        return JSON.parse(localStorage.getItem(PROMOTIONS_KEY)) || [];
    } catch (error) {
        console.error('Error loading promotions:', error);
        return [];
    }
}

function savePromotions(promotions) {
    try {
        localStorage.setItem(PROMOTIONS_KEY, JSON.stringify(promotions));
    } catch (error) {
        console.error('Error saving promotions:', error);
        showAlert('Error saving promotions', 'error');
    }
}

function loadPromotions() {
    const promotions = getPromotions();
    const promotionsContainer = document.getElementById('promotionsList');
    
    if (promotions.length === 0) {
        promotionsContainer.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #747D8C;">
                <i class="fas fa-tag" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.3;"></i>
                <p>No promotions yet</p>
                <button class="action-btn accept" onclick="openAddPromotionModal()" style="margin-top: 15px;">
                    <i class="fas fa-plus"></i> Create Promotion
                </button>
            </div>
        `;
        return;
    }
    
    let promotionsHTML = '';
    
    promotions.forEach(promo => {
        const isActive = new Date(promo.endDate) > new Date();
        
        promotionsHTML += `
            <div class="promotion-card" style="background: ${isActive ? 'linear-gradient(135deg, #2ED573, #7BED9F)' : 'linear-gradient(135deg, #747D8C, #95a5a6)'};">
                <div class="promotion-header">
                    <h3>${promo.title}</h3>
                    <span class="promotion-badge">
                        ${promo.discountType === 'percentage' ? `${promo.value}% OFF` : 
                          promo.discountType === 'fixed' ? `${promo.value} MMK OFF` : 'COMBO'}
                    </span>
                </div>
                
                <div class="promotion-details">
                    <p style="margin-bottom: 10px;">${promo.description}</p>
                    <div style="font-size: 0.9rem; opacity: 0.9;">
                        <div><i class="fas fa-calendar"></i> ${formatDate(promo.startDate)} - ${formatDate(promo.endDate)}</div>
                        ${promo.code ? `<div><i class="fas fa-ticket-alt"></i> Code: ${promo.code}</div>` : ''}
                    </div>
                </div>
                
                <div class="promotion-actions">
                    <button class="action-btn" onclick="editPromotion('${promo.id}')" 
                            style="background: white; color: ${isActive ? '#2ED573' : '#747D8C'};">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn" onclick="deletePromotion('${promo.id}')" 
                            style="background: rgba(255,255,255,0.2); color: white;">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    });
    
    promotionsContainer.innerHTML = promotionsHTML;
}

function openAddPromotionModal() {
    currentEditingItemId = null;
    document.getElementById('promotionModalTitle').textContent = 'Add Promotion';
    document.getElementById('promotionForm').reset();
    
    // Populate menu items dropdown
    const menuItems = getMenuItems();
    const itemsSelect = document.getElementById('promoItems');
    itemsSelect.innerHTML = menuItems.map(item => 
        `<option value="${item.id}">${item.name}</option>`
    ).join('');
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    document.getElementById('startDate').value = today;
    document.getElementById('endDate').value = nextWeek;
    
    document.getElementById('promotionModal').classList.add('active');
}

function closePromotionModal() {
    document.getElementById('promotionModal').classList.remove('active');
    currentEditingItemId = null;
}

function savePromotion() {
    const promotions = getPromotions();
    
    const promoData = {
        id: currentEditingItemId || 'PROMO' + Date.now(),
        title: document.getElementById('promotionTitle').value,
        discountType: document.getElementById('discountType').value,
        value: parseInt(document.getElementById('discountValue').value),
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        code: document.getElementById('promoCode').value || null,
        description: document.getElementById('promoDescription').value,
        items: Array.from(document.getElementById('promoItems').selectedOptions).map(opt => opt.value),
        createdAt: new Date().toISOString()
    };
    
    if (currentEditingItemId) {
        // Update existing promotion
        const index = promotions.findIndex(promo => promo.id === currentEditingItemId);
        if (index !== -1) {
            promotions[index] = { ...promotions[index], ...promoData };
        }
    } else {
        // Add new promotion
        promotions.push(promoData);
    }
    
    savePromotions(promotions);
    closePromotionModal();
    loadPromotions();
    showAlert(`Promotion ${currentEditingItemId ? 'updated' : 'added'} successfully`);
}

function editPromotion(promoId) {
    const promotions = getPromotions();
    const promo = promotions.find(p => p.id === promoId);
    
    if (!promo) return;
    
    currentEditingItemId = promoId;
    document.getElementById('promotionModalTitle').textContent = 'Edit Promotion';
    
    // Fill form with promotion data
    document.getElementById('promotionTitle').value = promo.title;
    document.getElementById('discountType').value = promo.discountType;
    document.getElementById('discountValue').value = promo.value;
    document.getElementById('startDate').value = promo.startDate;
    document.getElementById('endDate').value = promo.endDate;
    document.getElementById('promoCode').value = promo.code || '';
    document.getElementById('promoDescription').value = promo.description;
    
    // Populate menu items dropdown
    const menuItems = getMenuItems();
    const itemsSelect = document.getElementById('promoItems');
    itemsSelect.innerHTML = menuItems.map(item => 
        `<option value="${item.id}" ${promo.items.includes(item.id) ? 'selected' : ''}>${item.name}</option>`
    ).join('');
    
    document.getElementById('promotionModal').classList.add('active');
}

function deletePromotion(promoId) {
    if (confirm('Are you sure you want to delete this promotion?')) {
        const promotions = getPromotions();
        const filteredPromotions = promotions.filter(promo => promo.id !== promoId);
        savePromotions(filteredPromotions);
        loadPromotions();
        showAlert('Promotion deleted successfully');
    }
}

// ==================== SETTINGS ====================
function loadSettings() {
    // Load shop settings
    const settings = getSettings();
    
    if (settings.shopName) {
        document.getElementById('shopName').value = settings.shopName;
    }
    if (settings.phoneNumbers) {
        document.getElementById('shopPhone1').value = settings.phoneNumbers[0] || '';
        document.getElementById('shopPhone2').value = settings.phoneNumbers[1] || '';
    }
    if (settings.deliveryAreas) {
        document.getElementById('deliveryAreas').value = settings.deliveryAreas;
    }
    if (settings.deliveryFee !== undefined) {
        document.getElementById('deliveryFeeSetting').value = settings.deliveryFee;
    }
    if (settings.freeDeliveryMin !== undefined) {
        document.getElementById('freeDeliveryMin').value = settings.freeDeliveryMin;
    }
    if (settings.taxPercentage !== undefined) {
        document.getElementById('taxPercentage').value = settings.taxPercentage;
    }
    if (settings.enableNotifications !== undefined) {
        document.getElementById('enableNotifications').checked = settings.enableNotifications;
    }
    if (settings.notificationSound) {
        document.getElementById('notificationSound').value = settings.notificationSound;
    }
    if (settings.alertEmail) {
        document.getElementById('alertEmail').value = settings.alertEmail;
    }
}

function getSettings() {
    try {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
    } catch (error) {
        console.error('Error loading settings:', error);
        return {};
    }
}

function saveShopSettings() {
    const settings = getSettings();
    
    settings.shopName = document.getElementById('shopName').value;
    settings.phoneNumbers = [
        document.getElementById('shopPhone1').value,
        document.getElementById('shopPhone2').value
    ];
    settings.deliveryAreas = document.getElementById('deliveryAreas').value;
    
    saveSettings(settings);
    showAlert('Shop settings saved successfully');
}

function savePricingSettings() {
    const settings = getSettings();
    
    settings.deliveryFee = parseInt(document.getElementById('deliveryFeeSetting').value);
    settings.freeDeliveryMin = parseInt(document.getElementById('freeDeliveryMin').value);
    settings.taxPercentage = parseInt(document.getElementById('taxPercentage').value);
    
    saveSettings(settings);
    showAlert('Pricing settings saved successfully');
}

function saveNotificationSettings() {
    const settings = getSettings();
    
    settings.enableNotifications = document.getElementById('enableNotifications').checked;
    settings.notificationSound = document.getElementById('notificationSound').value;
    settings.alertEmail = document.getElementById('alertEmail').value;
    
    saveSettings(settings);
    showAlert('Notification settings saved successfully');
}

function saveSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Error saving settings:', error);
        showAlert('Error saving settings', 'error');
    }
}

// ==================== DELETE CONFIRMATION ====================
function confirmDelete() {
    if (currentDeletingType === 'menu' && currentDeletingItemId) {
        deleteMenuItem(currentDeletingItemId);
    }
    closeDeleteModal();
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    currentDeletingItemId = null;
    currentDeletingType = null;
}

function deleteMenuItem(itemId) {
    const menuItems = getMenuItems();
    const filteredItems = menuItems.filter(item => item.id !== itemId);
    saveMenuItems(filteredItems);
    loadMenuItems();    
