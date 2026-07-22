/* ==========================================================================
   BHARATBUS - SPA APPLICATION LOGIC
   ========================================================================== */

const CITIES = [
    "Delhi", "Mumbai", "Bangalore", "Kolkata", "Chennai", "Hyderabad", "Pune", "Jaipur", "Ahmedabad", 
    "Goa", "Kochi", "Shimla", "Amritsar", "Lucknow", "Guwahati", "Bhubaneswar", "Chandigarh", 
    "Dehradun", "Ranchi", "Patna", "Indore", "Nagpur", "Surat", "Vadodara", "Coimbatore", "Madurai", 
    "Visakhapatnam", "Vijayawada", "Thiruvananthapuram", "Agra", "Varanasi", "Kanpur", "Bhopal"
];

class BharatBusApp {
    constructor() {
        this.currentUser = null;
        this.selectedTrip = null;
        this.selectedSeats = new Set();
        this.bookingType = 'FULL'; // FULL or PREBOOK
        this.activePaymentTab = 'card';
        this.statsTimer = null;
        this.upiTimerInterval = null;
        this.appliedCoupon = null;
        this.discountAmount = 0.0;
        this.pendingView = null;

        this.init();
    }

    init() {
        // Parse OAuth2 redirect params if hash is present
        this.checkOAuthCallback();

        // Load session if exists
        const session = localStorage.getItem('bb_session');
        if (session) {
            this.currentUser = JSON.parse(session);
            this.updateHeaderUI();
        }

        this.loadTestimonials();

        // Set default search date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateInput = document.getElementById('search-date');
        if (dateInput) {
            dateInput.value = tomorrow.toISOString().split('T')[0];
            dateInput.min = new Date().toISOString().split('T')[0];
        }

        // Bind Autocomplete
        this.setupAutocomplete('search-from', 'from-suggestions');
        this.setupAutocomplete('search-to', 'to-suggestions');

        // Document click listener to close dropdowns/modals
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-input-group')) {
                document.getElementById('from-suggestions').style.display = 'none';
                document.getElementById('to-suggestions').style.display = 'none';
            }
        });
    }

    checkOAuthCallback() {
        const hash = window.location.hash;
        if (hash) {
            if (hash.startsWith('#oauth2-success')) {
                const queryStr = hash.includes('?') ? hash.split('?')[1] : hash.substring('#oauth2-success'.length + 1);
                const params = new URLSearchParams(queryStr);
                const token = params.get('token');
                const email = params.get('email');
                const name = params.get('name');
                const role = params.get('role');
                const userId = params.get('userId');

                if (token && email && name && role && userId) {
                    const userData = {
                        token: token,
                        email: email,
                        name: name,
                        role: role,
                        id: parseInt(userId)
                    };
                    localStorage.setItem('bb_session', JSON.stringify(userData));
                    
                    // Clear the URL hash
                    window.history.replaceState(null, null, ' ');

                    // Alert user and navigate to pending view if it exists
                    alert(`Welcome back, ${userData.name}!`);

                    const pv = localStorage.getItem('bb_pending_view');
                    localStorage.removeItem('bb_pending_view');
                    if (pv) {
                        this.showView(pv);
                    } else {
                        this.showView('home');
                    }
                }
            } else if (hash.startsWith('#oauth2-error')) {
                const queryStr = hash.includes('?') ? hash.split('?')[1] : hash.substring('#oauth2-error'.length + 1);
                const params = new URLSearchParams(queryStr);
                const error = params.get('error');

                window.history.replaceState(null, null, ' ');
                alert("Social Authentication Error: " + (error || "Unknown error occurred"));
            }
        }
    }

    // ================= VIEW NAVIGATION =================
    showView(viewId) {
        if (viewId === 'my-bookings' && !this.currentUser) {
            this.pendingView = 'my-bookings';
            localStorage.setItem('bb_pending_view', 'my-bookings');
            this.openAuthModal('login');
            return;
        }
        if (viewId === 'admin-dashboard' && (!this.currentUser || this.currentUser.role !== 'ADMIN')) {
            this.pendingView = 'admin-dashboard';
            localStorage.setItem('bb_pending_view', 'admin-dashboard');
            alert("Access Denied: Admin authorization required.");
            this.openAuthModal('login');
            return;
        }

        document.querySelectorAll('.app-view').forEach(v => {
            v.classList.remove('active');
        });
        
        const targetView = document.getElementById(`view-${viewId}`);
        if (targetView) {
            targetView.classList.add('active');
            window.scrollTo(0, 0);
        }

        // Update nav and drawer links active status
        document.querySelectorAll('.nav-link, .drawer-link').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`.nav-links a[onclick*="${viewId}"], .drawer-nav a[onclick*="${viewId}"]`);
        if (activeLink) activeLink.classList.add('active');

        // Trigger loading specific views data
        if (viewId === 'my-bookings') {
            this.loadUserDashboard();
        } else if (viewId === 'admin-dashboard') {
            this.loadAdminDashboard();
        }
    }

    toggleMobileDrawer(show) {
        const drawer = document.getElementById('mobile-drawer');
        const overlay = document.getElementById('drawer-overlay');
        if (drawer && overlay) {
            if (show) {
                drawer.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            } else {
                drawer.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = ''; // Restore scrolling
            }
        }
    }

    // ================= AUTOCOMPLETE SYSTEM =================
    setupAutocomplete(inputId, dropdownId) {
        const input = document.getElementById(inputId);
        const dropdown = document.getElementById(dropdownId);

        if (!input || !dropdown) return;

        const renderSuggestions = (val) => {
            dropdown.innerHTML = '';
            const filtered = CITIES.filter(c => c.toLowerCase().includes(val.toLowerCase())).slice(0, 5);
            
            if (filtered.length === 0) {
                dropdown.style.display = 'none';
                return;
            }

            filtered.forEach(city => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.innerHTML = `
                    <svg viewBox="0 0 24 24" width="16" height="16" style="color:#718096;"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/></svg>
                    <span>${city}</span>
                `;
                div.onclick = () => {
                    input.value = city;
                    dropdown.style.display = 'none';
                };
                dropdown.appendChild(div);
            });
            dropdown.style.display = 'block';
        };

        input.addEventListener('input', (e) => {
            renderSuggestions(e.target.value);
        });

        input.addEventListener('focus', (e) => {
            renderSuggestions(e.target.value);
        });
    }

    swapCities() {
        const fromInput = document.getElementById('search-from');
        const toInput = document.getElementById('search-to');
        if (fromInput && toInput) {
            const temp = fromInput.value;
            fromInput.value = toInput.value;
            toInput.value = temp;
        }
    }

    // ================= AUTHENTICATION =================
    openAuthModal(tab) {
        document.getElementById('auth-modal').classList.add('active');
        this.switchAuthTab(tab);
    }

    closeAuthModal() {
        document.getElementById('auth-modal').classList.remove('active');
    }

    switchAuthTab(tab) {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-content').forEach(c => c.classList.remove('active'));

        document.getElementById(`tab-${tab}`).classList.add('active');
        document.getElementById(`auth-content-${tab}`).classList.add('active');
    }

    async handleLocalLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) throw new Error("Invalid username or password");

            const data = await res.json();
            this.loginSuccess(data);
        } catch (err) {
            alert(err.message);
        }
    }

    async handleLocalRegister(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const phone = document.getElementById('register-phone').value;
        const password = document.getElementById('register-password').value;

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, password })
            });

            if (!res.ok) throw new Error("Registration failed. Email might already exist.");

            const data = await res.json();
            this.loginSuccess(data);
        } catch (err) {
            alert(err.message);
        }
    }

    // Social login popup flow
    handleSocialLogin(provider) {
        document.getElementById('popup-provider-name').innerText = provider;
        
        const logo = document.getElementById('popup-provider-logo');
        logo.className = `popup-brand-logo social-${provider.toLowerCase()}`;
        if (provider === 'Google') logo.innerHTML = 'G';
        else if (provider === 'Apple') logo.innerHTML = '';
        else logo.innerHTML = '田';

        document.getElementById('social-popup-overlay').classList.add('active');
    }

    handleSocialLoginReal(provider) {
        window.location.href = `/api/auth/oauth2/login/${provider.toLowerCase()}`;
    }

    closeSocialPopup() {
        document.getElementById('social-popup-overlay').classList.remove('active');
    }

    async selectSocialAccount(email, name, providerOverride) {
        this.closeSocialPopup();
        this.closeAuthModal();

        const provider = (providerOverride || document.getElementById('popup-provider-name').innerText || 'Google').toUpperCase();
        const providerId = "social_id_" + Math.random().toString(36).substring(2, 10);

        try {
            const res = await fetch('/api/auth/social-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, provider, providerId })
            });

            if (!res.ok) throw new Error("Social Authentication failed");

            const data = await res.json();
            this.loginSuccess(data);
        } catch (err) {
            alert(err.message);
        }
    }

    loginSuccess(userData) {
        this.currentUser = userData;
        localStorage.setItem('bb_session', JSON.stringify(userData));
        this.updateHeaderUI();
        this.closeAuthModal();
        
        // Show proper navigation buttons
        const adminNavLink = document.getElementById('admin-nav-link');
        const adminDrawerLink = document.getElementById('admin-drawer-link');
        const displayVal = (this.currentUser.role === 'ADMIN') ? 'block' : 'none';
        if (adminNavLink) adminNavLink.style.display = displayVal;
        if (adminDrawerLink) adminDrawerLink.style.display = displayVal;
        
        alert(`Welcome back, ${userData.name}!`);

        const pv = this.pendingView || localStorage.getItem('bb_pending_view');
        this.pendingView = null;
        localStorage.removeItem('bb_pending_view');
        if (pv) {
            this.showView(pv);
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('bb_session');
        const adminNavLink = document.getElementById('admin-nav-link');
        const adminDrawerLink = document.getElementById('admin-drawer-link');
        if (adminNavLink) adminNavLink.style.display = 'none';
        if (adminDrawerLink) adminDrawerLink.style.display = 'none';

        // Clear dashboard profile elements
        const lettersEl = document.getElementById('avatar-letters');
        const nameEl = document.getElementById('profile-name');
        const emailEl = document.getElementById('profile-email');
        const historyEl = document.getElementById('booking-history-list');
        if (lettersEl) lettersEl.innerText = '--';
        if (nameEl) nameEl.innerText = 'Not Logged In';
        if (emailEl) emailEl.innerText = '';
        if (historyEl) historyEl.innerHTML = '';

        this.updateHeaderUI();
        this.showView('home');
        alert("Logged out successfully.");
    }

    updateHeaderUI() {
        const area = document.getElementById('user-menu-area');
        const drawerArea = document.getElementById('drawer-user-area');
        
        const generateUserHTML = (user) => {
            if (user) {
                return `
                    <div class="user-profile-menu" style="display:flex; align-items:center; gap:12px; cursor:pointer;" onclick="app.showView('my-bookings'); if(typeof app.toggleMobileDrawer === 'function') app.toggleMobileDrawer(false);">
                        <div class="avatar-small">${user.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}</div>
                        <span style="font-weight:600; font-size:14px; color:var(--secondary);">${user.name}</span>
                    </div>
                `;
            } else {
                return `<button class="btn btn-primary" onclick="app.openAuthModal('login'); if(typeof app.toggleMobileDrawer === 'function') app.toggleMobileDrawer(false);">Login / SignUp</button>`;
            }
        };

        if (area) {
            area.innerHTML = generateUserHTML(this.currentUser);
        }

        if (drawerArea) {
            drawerArea.innerHTML = generateUserHTML(this.currentUser);
        }

        // Show/Hide Admin Portal Links
        const adminNavLink = document.getElementById('admin-nav-link');
        const adminDrawerLink = document.getElementById('admin-drawer-link');
        const displayVal = (this.currentUser && this.currentUser.role === 'ADMIN') ? 'block' : 'none';

        if (adminNavLink) adminNavLink.style.display = displayVal;
        if (adminDrawerLink) adminDrawerLink.style.display = displayVal;
    }

    // ================= BUS SEARCH & FILTERS =================
    async handleSearch(e) {
        e.preventDefault();
        const source = document.getElementById('search-from').value;
        const destination = document.getElementById('search-to').value;
        const date = document.getElementById('search-date').value;

        try {
            const res = await fetch(`/api/trips/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&date=${date}`);
            if (!res.ok) throw new Error("Failed to search buses");

            const trips = await res.json();
            this.currentTrips = trips;
            this.filteredTrips = [...trips];
            
            this.showView('results');
            document.getElementById('results-heading').innerText = `Buses from ${source} to ${destination}`;
            
            // Build filter operators list
            this.buildOperatorFilters();
            this.applyFilters();
            
        } catch (err) {
            alert(err.message);
        }
    }

    buildOperatorFilters() {
        const operators = [...new Set(this.currentTrips.map(t => t.bus.operatorName))];
        const container = document.getElementById('operator-filter-list');
        if (!container) return;

        container.innerHTML = '';
        operators.forEach(op => {
            const label = document.createElement('label');
            label.className = 'checkbox-container';
            label.innerHTML = `
                ${op}
                <input type="checkbox" value="${op}" class="filter-operator" onchange="app.applyFilters()">
                <span class="checkmark"></span>
            `;
            container.appendChild(label);
        });
    }

    updatePriceDisplay(val) {
        document.getElementById('price-limit-label').innerText = `₹${val}`;
    }

    clearFilters() {
        document.querySelectorAll('.filter-time, .filter-type, .filter-operator').forEach(cb => cb.checked = false);
        const slider = document.getElementById('filter-price-slider');
        if (slider) {
            slider.value = 3000;
            this.updatePriceDisplay(3000);
        }
        this.applyFilters();
    }

    toggleMobileFilters() {
        if (window.innerWidth > 1024) return; // Only toggle on mobile/tablet
        const sidebar = document.getElementById('filters-sidebar');
        if (sidebar) {
            sidebar.classList.toggle('expanded');
        }
    }

    applyFilters() {
        // Time Filters
        const timeFilters = Array.from(document.querySelectorAll('.filter-time:checked')).map(cb => cb.value);
        // Type Filters
        const typeFilters = Array.from(document.querySelectorAll('.filter-type:checked')).map(cb => cb.value);
        // Operator Filters
        const opFilters = Array.from(document.querySelectorAll('.filter-operator:checked')).map(cb => cb.value);
        // Price Filter
        const maxPrice = parseFloat(document.getElementById('filter-price-slider').value);

        this.filteredTrips = this.currentTrips.filter(trip => {
            // Price check
            if (trip.bus.price > maxPrice) return false;

            // Time check
            if (timeFilters.length > 0) {
                const hour = parseInt(trip.route.departureTime.split(':')[0]);
                let tripSession = '';
                if (hour >= 0 && hour < 6) tripSession = 'night';
                else if (hour >= 6 && hour < 12) tripSession = 'morning';
                else if (hour >= 12 && hour < 18) tripSession = 'afternoon';
                else tripSession = 'evening';

                if (!timeFilters.includes(tripSession)) return false;
            }

            // Type check
            if (typeFilters.length > 0) {
                let match = false;
                typeFilters.forEach(tf => {
                    if (trip.bus.busType.includes(tf)) match = true;
                });
                if (!match) return false;
            }

            // Operator check
            if (opFilters.length > 0 && !opFilters.includes(trip.bus.operatorName)) return false;

            return true;
        });

        this.renderBusCards();
    }

    renderBusCards() {
        const container = document.getElementById('bus-list');
        const countLabel = document.getElementById('results-count');
        if (!container) return;

        container.innerHTML = '';
        countLabel.innerText = `${this.filteredTrips.length} buses found`;

        if (this.filteredTrips.length === 0) {
            container.innerHTML = `
                <div class="glass-card" style="text-align:center; padding:40px; color:var(--text-muted);">
                    <h3>No Buses Match Your Filters</h3>
                    <p>Try clearing some filters or searching for another date.</p>
                </div>
            `;
            return;
        }

        this.filteredTrips.forEach(trip => {
            const card = document.createElement('div');
            card.className = 'bus-card';
            card.id = `bus-card-${trip.id}`;

            const depTime = this.formatTime12H(trip.route.departureTime);
            const arrTime = this.formatTime12H(trip.route.arrivalTime);

            card.innerHTML = `
                <div class="bus-card-primary-info">
                    <div class="operator-details">
                        <h3>${trip.bus.operatorName}</h3>
                        <span>${trip.bus.busType}</span>
                    </div>
                    
                    <div class="journey-details-flex">
                        <div class="time-details dep-time">
                            <span class="time">${depTime}</span>
                            <span class="location">${trip.route.source}</span>
                        </div>
                        <div class="time-details arr-time">
                            <span class="time">${arrTime}</span>
                            <span class="location">${trip.route.destination}</span>
                        </div>
                    </div>
                    
                    <div class="price-details">
                        <span class="price">₹${trip.bus.price}</span>
                        <div class="rating-badge" style="margin-left: 10px;">★ ${trip.bus.rating}</div>
                        <div class="seats-left">${trip.availableSeats} seats left</div>
                    </div>
                </div>
                <div class="bus-card-action-bar">
                    <button class="btn btn-secondary" onclick="app.toggleSeatsDrawer(${trip.id})">View Seats</button>
                </div>
                <!-- Expanded seats drawer -->
                <div class="seat-selection-expanded" id="seats-drawer-${trip.id}">
                    <!-- Loaded dynamically -->
                </div>
            `;
            container.appendChild(card);
        });
    }

    formatTime12H(timeStr) {
        if (!timeStr) return '';
        const parts = timeStr.split(':');
        let hours = parseInt(parts[0]);
        const minutes = parts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 should be 12
        return `${hours}:${minutes} ${ampm}`;
    }

    // ================= INTERACTIVE SEAT DRAWER =================
    async toggleSeatsDrawer(tripId) {
        const drawer = document.getElementById(`seats-drawer-${tripId}`);
        const card = document.getElementById(`bus-card-${tripId}`);
        
        if (!drawer) return;

        // If drawer is already open, close it
        if (drawer.classList.contains('active')) {
            drawer.classList.remove('active');
            card.querySelector('.btn-secondary').innerText = 'View Seats';
            return;
        }

        // Close other open drawers first
        document.querySelectorAll('.seat-selection-expanded').forEach(d => {
            d.classList.remove('active');
            const cId = d.id.replace('seats-drawer-', '');
            const c = document.getElementById(`bus-card-${cId}`);
            if (c) c.querySelector('.btn-secondary').innerText = 'View Seats';
        });

        // Open selected drawer
        drawer.classList.add('active');
        card.querySelector('.btn-secondary').innerText = 'Hide Seats';
        
        // Fetch seat layouts
        drawer.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:20px;">Loading Seat Layout...</div>`;
        
        try {
            const res = await fetch(`/api/seats/trip/${tripId}`);
            if (!res.ok) throw new Error("Failed to load seats layout");

            const seats = await res.json();
            this.renderSeatSelectionDrawer(tripId, seats);
        } catch (err) {
            drawer.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:20px; color:var(--primary);">${err.message}</div>`;
        }
    }

    renderSeatSelectionDrawer(tripId, seats) {
        const drawer = document.getElementById(`seats-drawer-${tripId}`);
        const trip = this.currentTrips.find(t => t.id === tripId);
        
        this.selectedTrip = trip;
        this.selectedSeats.clear();

        const isSleeper = trip.bus.busType.toLowerCase().includes('sleeper');
        
        let drawerHtml = `
            <div class="seat-layout-area">
                ${isSleeper ? `
                    <div class="deck-tabs">
                        <button class="deck-tab active" id="deck-tab-lower-${tripId}" onclick="app.switchDeck(${tripId}, 'lower')">Lower Deck</button>
                        <button class="deck-tab" id="deck-tab-upper-${tripId}" onclick="app.switchDeck(${tripId}, 'upper')">Upper Deck</button>
                    </div>
                ` : ''}
                
                <div class="bus-layout-grid">
                    <div class="driver-cabin">
                        <svg viewBox="0 0 24 24" width="24" height="24" class="driver-steering"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="currentColor"/></svg>
                    </div>
                    
                    <div class="seats-grid-container ${isSleeper ? 'sleeper-grid' : 'seater-grid'}" id="seats-grid-container-${tripId}">
                        <!-- Rendered by js depending on active deck/seater class -->
                    </div>
                </div>

                <div class="seat-legend">
                    <div class="legend-item"><div class="legend-color"></div> <span>Available</span></div>
                    <div class="legend-item"><div class="legend-color selected"></div> <span>Selected</span></div>
                    <div class="legend-item"><div class="legend-color booked"></div> <span>Booked</span></div>
                </div>
            </div>
            
            <div class="seat-selection-sidebar">
                <h4>Reservation Summary</h4>
                
                <div class="selection-summary-details">
                    <div><span>Seats Selected:</span> <strong id="selected-seats-labels-${tripId}">None</strong></div>
                    <div><span>Base Fare:</span> <strong id="selected-base-fare-${tripId}">₹0.00</strong></div>
                </div>

                <div class="boarding-dropping-points">
                    <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Boarding Point</label>
                    <select id="boarding-point-select-${tripId}">
                        <option value="Main Depot - 07:30 AM">Main Depot - ${this.formatTime12H(trip.route.departureTime)}</option>
                        <option value="Highway Junction - 08:00 AM">Highway Junction - 08:00 AM</option>
                    </select>
                    
                    <label style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-top:15px; display:block;">Dropping Point</label>
                    <select id="dropping-point-select-${tripId}">
                        <option value="City Terminal - ${this.formatTime12H(trip.route.arrivalTime)}">City Terminal - ${this.formatTime12H(trip.route.arrivalTime)}</option>
                        <option value="Highway Toll Gate - 11:15 AM">Highway Toll Gate - 11:15 AM</option>
                    </select>
                </div>

                <button class="btn btn-primary btn-block" onclick="app.proceedToBookingDetails(${tripId})">Proceed to Book</button>
            </div>
        `;
        
        drawer.innerHTML = drawerHtml;
        this.renderSeatsGrid(tripId, seats, isSleeper ? 'lower' : 'all');
    }

    switchDeck(tripId, deck) {
        document.getElementById(`deck-tab-lower-${tripId}`).classList.toggle('active', deck === 'lower');
        document.getElementById(`deck-tab-upper-${tripId}`).classList.toggle('active', deck === 'upper');
        
        // Retrieve seats loaded previously from api and filter
        fetch(`/api/seats/trip/${tripId}`)
            .then(res => res.json())
            .then(seats => {
                this.renderSeatsGrid(tripId, seats, deck);
            });
    }

    renderSeatsGrid(tripId, seats, deckScope) {
        const grid = document.getElementById(`seats-grid-container-${tripId}`);
        if (!grid) return;

        grid.innerHTML = '';
        
        // Filter seats based on sleeper deck
        let displaySeats = [...seats];
        if (deckScope === 'lower') {
            displaySeats = seats.filter(s => s.seatNumber.startsWith('L'));
        } else if (deckScope === 'upper') {
            displaySeats = seats.filter(s => s.seatNumber.startsWith('U'));
        }

        // Sort seats numerically
        displaySeats.sort((a,b) => {
            const numA = parseInt(a.seatNumber.replace(/\D/g, ''));
            const numB = parseInt(b.seatNumber.replace(/\D/g, ''));
            return numA - numB;
        });

        // Insert empty aisle spacer placeholder if seater
        if (deckScope === 'all') {
            // Seater has 5 rows: row 1, 2, aisle, 3, 4
            // Let's create an ordered grid where aisle empty spaces are inserted
            // A 40 seater bus will have 10 rows: row 1 to 10
            for (let row = 1; row <= 10; row++) {
                ['A', 'B', 'AISLE', 'C', 'D'].forEach(col => {
                    if (col === 'AISLE') {
                        const spacer = document.createElement('div');
                        spacer.className = 'seat-box aisle-space';
                        grid.appendChild(spacer);
                    } else {
                        const seatLabel = row + col;
                        const seatData = displaySeats.find(s => s.seatNumber === seatLabel);
                        if (seatData) {
                            grid.appendChild(this.createSeatDOM(seatData, tripId));
                        }
                    }
                });
            }
        } else {
            // Sleeper layout: 3 rows: row 1 (seats 1-6), row 2 (aisle spacer), row 3 (seats 7-18)
            // Let's lay them out in grid directly. Sleeper lower has 18 seats, upper has 18.
            // 3 rows: row 1 (A-seats), row 2 (aisle), row 3 (B,C seats)
            const prefix = deckScope === 'lower' ? 'L' : 'U';
            for (let i = 1; i <= 6; i++) {
                // A row
                const seatA = displaySeats.find(s => s.seatNumber === `${prefix}${i}`);
                if (seatA) grid.appendChild(this.createSeatDOM(seatA, tripId));
                
                // Aisle Spacer
                const spacer = document.createElement('div');
                spacer.className = 'seat-box aisle-space';
                grid.appendChild(spacer);

                // B, C rows
                const seatB = displaySeats.find(s => s.seatNumber === `${prefix}${(i+6)}`);
                const seatC = displaySeats.find(s => s.seatNumber === `${prefix}${(i+12)}`);
                if (seatB) grid.appendChild(this.createSeatDOM(seatB, tripId));
                if (seatC) grid.appendChild(this.createSeatDOM(seatC, tripId));
            }
        }
    }

    createSeatDOM(seatData, tripId) {
        const div = document.createElement('div');
        const isSleeper = this.selectedTrip.bus.busType.toLowerCase().includes('sleeper');
        
        div.className = `seat-box ${isSleeper ? 'sleeper-seat' : ''} ${seatData.isBooked ? 'booked' : ''}`;
        if (this.selectedSeats.has(seatData.seatNumber)) {
            div.classList.add('selected');
        }
        
        div.innerText = seatData.seatNumber;
        
        if (!seatData.isBooked) {
            div.onclick = () => this.toggleSeatSelection(seatData.seatNumber, tripId);
        }

        return div;
    }

    toggleSeatSelection(seatNum, tripId) {
        if (this.selectedSeats.has(seatNum)) {
            this.selectedSeats.delete(seatNum);
        } else {
            // Max 6 seats per booking standard
            if (this.selectedSeats.size >= 6) {
                alert("You can book a maximum of 6 seats at once.");
                return;
            }
            this.selectedSeats.add(seatNum);
        }

        // Re-render seats in active grid
        const isSleeper = this.selectedTrip.bus.busType.toLowerCase().includes('sleeper');
        const activeDeckTab = document.getElementById(`deck-tab-lower-${tripId}`);
        const activeDeck = activeDeckTab ? (activeDeckTab.classList.contains('active') ? 'lower' : 'upper') : 'all';
        
        // Find existing seat DOMs and toggle class
        const grid = document.getElementById(`seats-grid-container-${tripId}`);
        grid.querySelectorAll('.seat-box').forEach(seatDiv => {
            const label = seatDiv.innerText;
            if (label === seatNum) {
                seatDiv.classList.toggle('selected', this.selectedSeats.has(seatNum));
            }
        });

        // Update Summary
        const labelsLabel = document.getElementById(`selected-seats-labels-${tripId}`);
        const fareLabel = document.getElementById(`selected-base-fare-${tripId}`);

        if (this.selectedSeats.size > 0) {
            labelsLabel.innerText = Array.from(this.selectedSeats).join(', ');
            fareLabel.innerText = `₹${(this.selectedTrip.bus.price * this.selectedSeats.size).toFixed(2)}`;
        } else {
            labelsLabel.innerText = 'None';
            fareLabel.innerText = '₹0.00';
        }
    }

    // ================= BOOKING FLOW =================
    proceedToBookingDetails(tripId) {
        if (this.selectedSeats.size === 0) {
            alert("Please select at least one seat to proceed.");
            return;
        }

        if (!this.currentUser) {
            alert("Please log in to continue booking.");
            this.openAuthModal('login');
            return;
        }

        // Reset Coupon
        this.appliedCoupon = null;
        this.discountAmount = 0.0;
        const input = document.getElementById('coupon-code-input');
        if (input) input.value = '';
        const msg = document.getElementById('coupon-applied-message');
        if (msg) msg.style.display = 'none';

        // Set up Details view
        this.showView('booking');
        this.renderPassengerInputs();
        this.updateFareBreakup();
    }

    renderPassengerInputs() {
        const container = document.getElementById('passenger-inputs-container');
        if (!container) return;

        container.innerHTML = '';
        const seatsArray = Array.from(this.selectedSeats);

        seatsArray.forEach((seat, idx) => {
            const row = document.createElement('div');
            row.className = 'passenger-input-row';
            row.innerHTML = `
                <div class="passenger-title">Passenger ${idx + 1} (Seat: ${seat})</div>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" class="p-name" data-seat="${seat}" placeholder="Enter name" required>
                    </div>
                    <div class="form-group">
                        <label>Age</label>
                        <input type="number" class="p-age" placeholder="Age" min="5" max="100" required>
                    </div>
                    <div class="form-group">
                        <label>Gender</label>
                        <select class="p-gender" required>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
            `;
            container.appendChild(row);
        });

        // Prefill contact info
        document.getElementById('contact-email').value = this.currentUser.email;
    }

    setBookingType(type) {
        this.bookingType = type;
        document.getElementById('opt-pay-full').classList.toggle('active', type === 'FULL');
        document.getElementById('opt-pay-prebook').classList.toggle('active', type === 'PREBOOK');
        
        this.updateFareBreakup();
    }

    updateFareBreakup() {
        const basePrice = this.selectedTrip.bus.price;
        const count = this.selectedSeats.size;
        
        const baseFare = basePrice * count;
        const baseFareAfterDiscount = Math.max(0, baseFare - (this.discountAmount || 0));
        const gst = baseFareAfterDiscount * 0.18;
        const bookingFee = 25.00;
        const grandTotal = baseFareAfterDiscount + gst + bookingFee;

        document.getElementById('fare-base-label').innerText = `Base Fare (${count} Seat${count > 1 ? 's' : ''})`;
        
        if (this.discountAmount > 0) {
            document.getElementById('fare-base-val').innerHTML = `<span style="text-decoration: line-through; color: var(--text-muted); font-size:12px; margin-right:5px;">₹${baseFare.toFixed(0)}</span> ₹${baseFareAfterDiscount.toFixed(2)}`;
        } else {
            document.getElementById('fare-base-val').innerText = `₹${baseFare.toFixed(2)}`;
        }

        document.getElementById('fare-gst-val').innerText = `₹${gst.toFixed(2)}`;
        document.getElementById('fare-fee-val').innerText = `₹${bookingFee.toFixed(2)}`;
        document.getElementById('fare-total-val').innerText = `₹${grandTotal.toFixed(2)}`;

        const prebookBox = document.getElementById('prebook-summary-box');
        if (this.bookingType === 'PREBOOK') {
            prebookBox.style.display = 'block';
            const payableNow = 99.0 * count;
            const payableLater = grandTotal - payableNow;
            
            document.getElementById('fare-payable-now').innerText = `₹${payableNow.toFixed(2)}`;
            document.getElementById('fare-payable-later').innerText = `₹${payableLater.toFixed(2)}`;
        } else {
            prebookBox.style.display = 'none';
        }
    }

    // ================= MOCK PAYMENT GATEWAY =================
    proceedToPayment() {
        // Form validations
        let valid = true;
        document.querySelectorAll('#passenger-inputs-container input').forEach(input => {
            if (!input.checkValidity()) {
                input.reportValidity();
                valid = false;
            }
        });

        if (!valid) return;

        const emailInput = document.getElementById('contact-email');
        const phoneInput = document.getElementById('contact-phone');
        if (!emailInput.checkValidity() || !phoneInput.checkValidity()) {
            emailInput.reportValidity();
            phoneInput.reportValidity();
            return;
        }

        // Open payment modal
        const modal = document.getElementById('payment-gateway-modal');
        modal.classList.add('active');

        // Calculate amount to pay
        let amountToPay = 0;
        const count = this.selectedSeats.size;
        const baseFare = this.selectedTrip.bus.price * count;
        const baseFareAfterDiscount = Math.max(0, baseFare - (this.discountAmount || 0));
        const grandTotal = baseFareAfterDiscount + (baseFareAfterDiscount * 0.18) + 25.00;

        if (this.bookingType === 'PREBOOK') {
            amountToPay = 99.0 * count;
        } else {
            amountToPay = grandTotal;
        }

        document.getElementById('payment-modal-amount').innerText = `₹${amountToPay.toFixed(2)}`;
        
        // Generate real, scannable UPI deep-linking QR Code
        const upiUrl = `upi://pay?pa=bharatbus@upi&pn=BharatBus&am=${amountToPay.toFixed(2)}&cu=INR`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUrl)}`;
        const qrImg = document.getElementById('real-upi-qr');
        if (qrImg) qrImg.src = qrUrl;

        this.switchPaymentTab('card');
    }

    closePaymentModal() {
        document.getElementById('payment-gateway-modal').classList.remove('active');
        if (this.upiTimerInterval) clearInterval(this.upiTimerInterval);
    }

    switchPaymentTab(tab) {
        this.activePaymentTab = tab;
        document.querySelectorAll('.payment-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.payment-content').forEach(c => c.classList.remove('active'));

        // Find match
        const index = ['card', 'upi', 'net', 'wallet'].indexOf(tab);
        document.querySelectorAll('.payment-tab')[index].classList.add('active');
        document.getElementById(`pay-content-${tab}`).classList.add('active');

        if (tab === 'upi') {
            this.startUPITimer();
        } else {
            if (this.upiTimerInterval) clearInterval(this.upiTimerInterval);
        }
    }

    // Card Input events
    updateCardPreviewNum(val) {
        document.getElementById('card-preview-number').innerText = val || '•••• •••• •••• ••••';
    }
    updateCardPreviewName(val) {
        document.getElementById('card-preview-holder').innerText = (val || 'NAME ON CARD').toUpperCase();
    }
    updateCardPreviewExpiry(val) {
        document.getElementById('card-preview-expiry').innerText = val || 'MM/YY';
    }

    startUPITimer() {
        let time = 119; // 1 min 59 seconds
        const label = document.getElementById('upi-timer');
        if (this.upiTimerInterval) clearInterval(this.upiTimerInterval);

        this.upiTimerInterval = setInterval(() => {
            let minutes = Math.floor(time / 60);
            let seconds = time % 60;
            seconds = seconds < 10 ? '0' + seconds : seconds;
            label.innerText = `0${minutes}:${seconds}`;

            if (--time < 0) {
                clearInterval(this.upiTimerInterval);
                alert("UPI session expired. Please choose another payment method.");
                this.switchPaymentTab('card');
            }
        }, 1000);
    }

    // Payment triggers
    processPaymentSubmit(e) {
        e.preventDefault();
        this.triggerProcessingLoader();
    }

    verifyAndPayUPI() {
        const id = document.getElementById('upi-id-input').value;
        if (!id.includes('@')) {
            alert("Please enter a valid UPI ID (e.g. user@okhdfc)");
            return;
        }
        this.triggerProcessingLoader();
    }

    selectBank(bank) {
        alert(`Redirecting to secure ${bank} net banking...`);
        this.triggerProcessingLoader();
    }

    processWalletPayment() {
        this.triggerProcessingLoader();
    }

    triggerProcessingLoader() {
        this.closePaymentModal();
        
        const loader = document.getElementById('payment-loader-modal');
        loader.classList.add('active');
        document.getElementById('loader-title').innerText = "Processing Payment...";
        document.getElementById('loader-desc').style.display = 'block';

        setTimeout(() => {
            this.submitBookingDataToAPI();
        }, 2000);
    }

    async submitBookingDataToAPI() {
        const paymentId = 'pay_tx_' + Math.random().toString(36).substring(2, 10);
        
        // Package passengers
        const passengers = [];
        const rows = document.querySelectorAll('.passenger-input-row');
        rows.forEach(row => {
            const name = row.querySelector('.p-name').value;
            const age = parseInt(row.querySelector('.p-age').value);
            const gender = row.querySelector('.p-gender').value;
            const seatNumber = row.querySelector('.p-name').dataset.seat;
            
            passengers.push({ name, age, gender, seatNumber });
        });

        const payload = {
            tripId: this.selectedTrip.id,
            bookingType: this.bookingType,
            paymentId: paymentId,
            couponCode: this.appliedCoupon,
            passengers: passengers
        };

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || "Reservation failed.");
            }

            const bookingData = await res.json();
            
            // Payment success screens
            const loader = document.getElementById('payment-loader-modal');
            loader.querySelector('.spinner-circle').style.borderColor = 'var(--success)';
            document.getElementById('loader-title').innerText = "Booking Confirmed!";
            document.getElementById('loader-desc').style.display = 'none';

            setTimeout(() => {
                loader.classList.remove('active');
                // Reset loader colors
                loader.querySelector('.spinner-circle').style.borderColor = '#edf2f7';
                
                this.renderTicket(bookingData);
                this.showView('ticket');
            }, 1000);

        } catch (err) {
            document.getElementById('payment-loader-modal').classList.remove('active');
            alert("Error: " + err.message);
        }
    }

    // ================= RENDERING TICKETS =================
    renderTicket(booking) {
        document.getElementById('ticket-source').innerText = booking.trip.route.source.toUpperCase();
        document.getElementById('ticket-destination').innerText = booking.trip.route.destination.toUpperCase();
        document.getElementById('ticket-dep-time').innerText = this.formatTime12H(booking.trip.route.departureTime);
        document.getElementById('ticket-arr-time').innerText = this.formatTime12H(booking.trip.route.arrivalTime);
        document.getElementById('ticket-duration').innerText = booking.trip.route.duration;
        
        document.getElementById('ticket-date').innerText = booking.trip.departureDate;
        document.getElementById('ticket-bus-number').innerText = `${booking.trip.bus.busNumber} (${booking.trip.bus.operatorName})`;
        document.getElementById('ticket-booking-id').innerText = `BB-${100000 + booking.id}`;
        document.getElementById('ticket-tx-id').innerText = booking.paymentId;

        // Stamp
        const stamp = document.getElementById('ticket-stamp-type');
        stamp.innerText = booking.bookingType;
        stamp.className = `ticket-status-stamp ${booking.bookingType.toLowerCase()}`;

        // Render Passenger Rows
        const tbody = document.getElementById('ticket-passenger-rows');
        tbody.innerHTML = '';
        booking.passengers.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.name}</td>
                <td>${p.age} / ${p.gender}</td>
                <td><strong>${p.seatNumber}</strong></td>
            `;
            tbody.appendChild(tr);
        });

        // pricing details
        document.getElementById('ticket-total-fare').innerText = `₹${booking.totalFare.toFixed(2)}`;
        document.getElementById('ticket-amount-paid').innerText = `₹${booking.amountPaid.toFixed(2)}`;

        const dueRow = document.getElementById('ticket-due-row');
        if (booking.bookingType === 'PREBOOK') {
            dueRow.style.display = 'flex';
            document.getElementById('ticket-amount-due').innerText = `₹${booking.amountDue.toFixed(2)}`;
        } else {
            dueRow.style.display = 'none';
        }
    }

    // ================= USER DASHBOARD HISTORY =================
    async loadUserDashboard() {
        if (!this.currentUser) return;

        // Populate details
        document.getElementById('avatar-letters').innerText = this.currentUser.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
        document.getElementById('profile-name').innerText = this.currentUser.name;
        document.getElementById('profile-email').innerText = this.currentUser.email;

        const container = document.getElementById('booking-history-list');
        container.innerHTML = '<div>Loading bookings...</div>';

        try {
            const res = await fetch('/api/bookings/my-bookings', {
                headers: { 'Authorization': `Bearer ${this.currentUser.token}` }
            });
            if (!res.ok) throw new Error("Failed to load dashboard data");

            const bookings = await res.json();
            container.innerHTML = '';

            if (bookings.length === 0) {
                container.innerHTML = `
                    <div class="glass-card" style="text-align:center; padding:30px; color:var(--text-muted);">
                        <h3>No Bookings Found</h3>
                        <p>You haven't booked any trips yet. Start searching now!</p>
                    </div>
                `;
                return;
            }

            bookings.forEach(b => {
                const card = document.createElement('div');
                card.className = 'history-card';
                
                let payStatus = b.status;
                let payClass = 'cancelled';

                if (b.status === 'CONFIRMED') {
                    if (b.bookingType === 'PREBOOK') {
                        payStatus = `PREBOOKED (Paid: ₹${b.amountPaid.toFixed(0)}, Due: ₹${b.amountDue.toFixed(0)})`;
                        payClass = 'prebook';
                    } else {
                        payStatus = `FULLY PAID (₹${b.totalFare.toFixed(0)})`;
                        payClass = 'full';
                    }
                }

                const seatsStr = b.passengers.map(p => p.seatNumber).join(', ');

                card.innerHTML = `
                    <div class="history-journey">
                        <strong>${b.trip.route.source} ➔ ${b.trip.route.destination}</strong>
                        <span>Date: ${b.trip.departureDate} | Dep: ${this.formatTime12H(b.trip.route.departureTime)}</span>
                        <span>Seats: ${seatsStr} | Operator: ${b.trip.bus.operatorName}</span>
                    </div>
                    <div class="history-pricing">
                        <span class="price">₹${b.totalFare.toFixed(2)}</span>
                        <span class="paid-status ${payClass}">${payStatus}</span>
                    </div>
                    <div>
                        ${b.status === 'CONFIRMED' ? `
                            <button class="btn btn-secondary" onclick="app.showTicketFromHistory(${JSON.stringify(b).replace(/"/g, '&quot;')})">View Ticket</button>
                            <button class="btn btn-secondary" style="color:var(--primary); margin-left:8px;" onclick="app.handleCancelBooking(${b.id})">Cancel</button>
                        ` : `
                            <span style="color:var(--text-muted); font-weight:700;">CANCELLED</span>
                        `}
                    </div>
                `;
                container.appendChild(card);
            });

        } catch (err) {
            container.innerHTML = `<div style="color:var(--primary);">${err.message}</div>`;
        }
    }

    showTicketFromHistory(booking) {
        this.renderTicket(booking);
        this.showView('ticket');
    }

    async handleCancelBooking(bookingId) {
        if (!confirm("Are you sure you want to cancel this booking? This will release your reserved seats.")) return;

        try {
            const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.currentUser.token}` }
            });

            if (!res.ok) throw new Error("Cancellation failed");

            alert("Booking cancelled successfully. Refund initiated.");
            this.loadUserDashboard();
        } catch (err) {
            alert(err.message);
        }
    }

    // ================= ADMIN DASHBOARD PORTAL =================
    async loadAdminDashboard() {
        if (!this.currentUser || this.currentUser.role !== 'ADMIN') return;

        try {
            const headers = { 'Authorization': `Bearer ${this.currentUser.token}` };
            
            // 1. Fetch Stats
            const statsRes = await fetch('/api/admin/stats', { headers });
            if (!statsRes.ok) throw new Error("Admin authentication expired");
            const stats = await statsRes.json();

            document.getElementById('admin-stat-bookings').innerText = stats.totalBookings;
            document.getElementById('admin-stat-collected').innerText = `₹${stats.totalCollectedRevenue.toLocaleString('en-IN', {maximumFractionDigits:0})}`;
            document.getElementById('admin-stat-outstanding').innerText = `₹${stats.totalOutstandingRevenue.toLocaleString('en-IN', {maximumFractionDigits:0})}`;
            document.getElementById('admin-stat-buses').innerText = stats.activeBusesCount;
            document.getElementById('admin-stat-occupancy').innerText = `${stats.occupancyRate}%`;

            // 2. Fetch Fleet Seating Status
            this.loadAdminBusesTable();

            // 3. Fetch Bookings Tab data
            this.loadAdminBookingsTable();

        } catch (err) {
            alert("Access Denied: " + err.message);
            this.showView('home');
        }
    }

    async loadAdminBusesTable() {
        const tbody = document.getElementById('admin-bus-rows');
        tbody.innerHTML = '<tr><td colspan="8">Loading fleet status...</td></tr>';
        
        try {
            const res = await fetch('/api/admin/buses', {
                headers: { 'Authorization': `Bearer ${this.currentUser.token}` }
            });
            const buses = await res.json();
            tbody.innerHTML = '';

            buses.forEach(b => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${b.busNumber}</strong></td>
                    <td>${b.operatorName}</td>
                    <td>${b.busType}</td>
                    <td>${b.totalSeats}</td>
                    <td style="color:var(--primary); font-weight:700;">${b.bookedSeatsCount}</td>
                    <td style="color:var(--success); font-weight:700;">${b.availableSeatsCount}</td>
                    <td>₹${b.price}</td>
                    <td>★ ${b.rating}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="8" style="color:var(--primary);">${err.message}</td></tr>`;
        }
    }

    async loadAdminBookingsTable() {
        const tbody = document.getElementById('admin-booking-rows');
        tbody.innerHTML = '<tr><td colspan="10">Loading system transactions...</td></tr>';

        try {
            const res = await fetch('/api/admin/bookings', {
                headers: { 'Authorization': `Bearer ${this.currentUser.token}` }
            });
            const bookings = await res.json();
            tbody.innerHTML = '';

            bookings.forEach(b => {
                const tr = document.createElement('tr');
                const seats = b.passengers.map(p => p.seatNumber).join(', ');
                const statusClass = b.status === 'CONFIRMED' ? 'confirmed' : 'cancelled';

                tr.innerHTML = `
                    <td><strong>BB-${100000 + b.id}</strong></td>
                    <td>${b.user.name}<br><small style="color:var(--text-muted);">${b.user.email}</small></td>
                    <td>${b.trip.departureDate}</td>
                    <td>${b.trip.route.source} ➔ ${b.trip.route.destination}</td>
                    <td>${seats}</td>
                    <td><span style="font-weight:700; font-size:11px;">${b.bookingType}</span></td>
                    <td style="color:var(--success); font-weight:600;">₹${b.amountPaid.toFixed(0)}</td>
                    <td style="color:var(--warning); font-weight:600;">₹${b.amountDue.toFixed(0)}</td>
                    <td><span class="status-badge ${statusClass}">${b.status}</span></td>
                    <td>
                        ${b.status === 'CONFIRMED' ? `
                            <button class="btn btn-secondary" style="padding:4px 8px; font-size:11px; color:var(--primary);" onclick="app.adminCancelBooking(${b.id})">Cancel</button>
                        ` : '-'}
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="10" style="color:var(--primary);">${err.message}</td></tr>`;
        }
    }

    async adminCancelBooking(bookingId) {
        if (!confirm("Are you sure you want to cancel this customer booking?")) return;

        try {
            const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.currentUser.token}` }
            });

            if (!res.ok) throw new Error("Cancellation failed");

            alert("Booking cancelled successfully.");
            this.loadAdminDashboard();
        } catch (err) {
            alert(err.message);
        }
    }

    switchAdminTab(tab) {
        document.getElementById('btn-admin-tab-buses').classList.toggle('active', tab === 'buses');
        document.getElementById('btn-admin-tab-bookings').classList.toggle('active', tab === 'bookings');
        document.getElementById('btn-admin-tab-users').classList.toggle('active', tab === 'users');
        document.getElementById('btn-admin-tab-feedbacks').classList.toggle('active', tab === 'feedbacks');

        document.getElementById('admin-content-buses').classList.toggle('active', tab === 'buses');
        document.getElementById('admin-content-bookings').classList.toggle('active', tab === 'bookings');
        document.getElementById('admin-content-users').classList.toggle('active', tab === 'users');
        document.getElementById('admin-content-feedbacks').classList.toggle('active', tab === 'feedbacks');

        if (tab === 'users') {
            this.loadAdminUsersTable();
        } else if (tab === 'feedbacks') {
            this.loadAdminFeedbacksTable();
        }
    }

    // Add new Bus Fleet
    openAddBusModal() {
        document.getElementById('add-bus-modal').classList.add('active');
    }

    closeAddBusModal() {
        document.getElementById('add-bus-modal').classList.remove('active');
    }

    async handleAddBusSubmit(e) {
        e.preventDefault();
        const busNumber = document.getElementById('new-bus-number').value;
        const operatorName = document.getElementById('new-operator-name').value;
        const busType = document.getElementById('new-bus-type').value;
        const totalSeats = parseInt(document.getElementById('new-total-seats').value);
        const price = parseFloat(document.getElementById('new-bus-price').value);

        const payload = { busNumber, operatorName, busType, totalSeats, price };

        try {
            const res = await fetch('/api/admin/buses/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to add bus");

            alert("New bus added to operating fleet successfully!");
            this.closeAddBusModal();
            this.loadAdminDashboard();
        } catch (err) {
            alert(err.message);
        }
    }

    // ================= TESTIMONIALS & REVIEWS SYSTEM =================
    async loadTestimonials() {
        try {
            const res = await fetch('/api/feedbacks');
            if (!res.ok) return;
            let feedbacks = await res.json();
            
            // Filter only 5-star ratings for home screen display
            feedbacks = feedbacks.filter(f => f.rating === 5);
            
            const list = document.getElementById('homepage-feedback-list');
            if (!list) return;
            
            if (feedbacks.length === 0) {
                list.innerHTML = `
                    <div class="testimonial-card" style="grid-column: 1/-1; text-align: center; width: 100%;">
                         <p class="testimonial-comment">No 5-star reviews submitted yet. Be the first to share your premium journey experience!</p>
                    </div>
                `;
                return;
            }
            
            list.innerHTML = '';
            
            // Duplicate feedbacks list to ensure smooth scrolling marquee loop
            const displayList = [...feedbacks, ...feedbacks];
            
            displayList.forEach(f => {
                const card = document.createElement('div');
                card.className = 'testimonial-card';
                let stars = '★'.repeat(f.rating) + '☆'.repeat(5 - f.rating);
                const initials = f.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
                
                card.innerHTML = `
                    <div>
                        <div class="testimonial-stars">${stars}</div>
                        <p class="testimonial-comment">"${f.comment}"</p>
                    </div>
                    <div class="testimonial-user">
                        <div class="user-avatar-small">${initials}</div>
                        <div class="user-info-text">
                            <h4>${f.name}</h4>
                            <span>Verified Rider</span>
                        </div>
                    </div>
                `;
                list.appendChild(card);
            });
        } catch (err) {
            console.error("Testimonials error: ", err);
        }
    }

    setRatingValue(rating) {
        document.getElementById('feedback-rating-val').value = rating;
        const stars = document.querySelectorAll('.star-opt');
        stars.forEach((star, idx) => {
            if (idx < rating) {
                star.classList.add('active');
                star.style.color = '#ecc94b';
            } else {
                star.classList.remove('active');
                star.style.color = '#cbd5e0';
            }
        });
    }
    
    async handleFeedbackSubmit(e) {
        e.preventDefault();
        if (!this.currentUser) {
            alert("Please login to submit feedback.");
            return;
        }
        const rating = parseInt(document.getElementById('feedback-rating-val').value);
        const comment = document.getElementById('feedback-comment-input').value;
        const name = this.currentUser.name;
        const email = this.currentUser.email;

        try {
            const res = await fetch('/api/feedbacks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`
                },
                body: JSON.stringify({ name, email, rating, comment })
            });
            if (!res.ok) throw new Error("Could not submit feedback");
            
            alert("Thank you for your feedback! Review submitted successfully.");
            document.getElementById('feedback-form-card').style.display = 'none';
            this.loadTestimonials();
        } catch (err) {
            alert(err.message);
        }
    }

    // ================= FORGOT PASSWORD & MFA SYSTEM =================
    showForgotPasswordForm(e) {
        if (e) e.preventDefault();
        document.querySelectorAll('.auth-content').forEach(c => c.classList.remove('active'));
        document.getElementById('auth-content-forgot').classList.add('active');
        document.getElementById('forgot-form').style.display = 'block';
        document.getElementById('reset-form').style.display = 'none';
        document.getElementById('forgot-phone').value = '';
        document.getElementById('reset-otp').value = '';
        document.getElementById('reset-new-password').value = '';
    }
    
    async handleForgotPasswordSubmit(e) {
        e.preventDefault();
        const phone = document.getElementById('forgot-phone').value;
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            if (!res.ok) throw new Error("Phone number not registered with BharatBus");
            
            const data = await res.json();
            alert(`Simulated MFA OTP generated! Your temporary 6-digit OTP code is: ${data.otp}`);
            document.getElementById('forgot-form').style.display = 'none';
            document.getElementById('reset-form').style.display = 'block';
        } catch (err) {
            alert(err.message);
        }
    }
    
    async handleResetPasswordSubmit(e) {
        e.preventDefault();
        const phone = document.getElementById('forgot-phone').value;
        const otp = document.getElementById('reset-otp').value;
        const newPassword = document.getElementById('reset-new-password').value;
        
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp, newPassword })
            });
            if (!res.ok) throw new Error("Invalid OTP code or reset failed.");
            
            alert("Password updated successfully! Log in using your new credentials.");
            this.switchAuthTab('login');
        } catch (err) {
            alert(err.message);
        }
    }

    // ================= CONTACT SUPPORT SYSTEM =================
    handleContactSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-user-email').value;
        const subject = document.getElementById('contact-subject').value;
        
        alert(`Thank you, ${name}! Your request on "${subject}" has been successfully logged. We will get back to you at ${email} shortly.`);
        document.getElementById('contact-name').value = '';
        document.getElementById('contact-user-email').value = '';
        document.getElementById('contact-subject').value = '';
        document.getElementById('contact-message').value = '';
    }

    // ================= COUPONS SYSTEM =================
    selectCoupon(code) {
        document.getElementById('coupon-code-input').value = code;
    }
    
    applyCouponCode() {
        const code = document.getElementById('coupon-code-input').value.trim().toUpperCase();
        const msg = document.getElementById('coupon-applied-message');
        if (!code) {
            this.appliedCoupon = null;
            this.discountAmount = 0.0;
            if (msg) msg.style.display = 'none';
            this.updateFareBreakup();
            return;
        }
        
        const basePrice = this.selectedTrip.bus.price;
        const count = this.selectedSeats.size;
        const baseFare = basePrice * count;
        
        let discount = 0.0;
        let valid = false;
        if (code === 'BUSEASE10') {
            discount = baseFare * 0.10;
            valid = true;
        } else if (code === 'SAVE150') {
            discount = 150.0;
            valid = true;
        } else if (code === 'FIRSTBUS') {
            discount = baseFare * 0.15;
            valid = true;
        }
        
        if (valid) {
            if (discount > baseFare) discount = baseFare;
            this.appliedCoupon = code;
            this.discountAmount = discount;
            msg.style.color = 'var(--success)';
            msg.innerText = `Promo "${code}" applied! Saved ₹${discount.toFixed(2)}`;
            msg.style.display = 'block';
        } else {
            this.appliedCoupon = null;
            this.discountAmount = 0.0;
            msg.style.color = 'var(--primary)';
            msg.innerText = `Invalid coupon code.`;
            msg.style.display = 'block';
        }
        this.updateFareBreakup();
    }

    // ================= SUPPORT CHAT ASSISTANT WIDGET =================
    toggleChatWindow() {
        const panel = document.getElementById('chat-assistant-panel');
        if (panel) {
            panel.classList.toggle('active');
            document.getElementById('chat-unread-badge').style.display = 'none';
        }
    }
    
    sendQuickChatMsg(msg) {
        this.sendUserChatMsg(msg);
    }
    
    handleChatSubmit(e) {
        e.preventDefault();
        const input = document.getElementById('chat-input-msg');
        const msg = input.value.trim();
        if (!msg) return;
        input.value = '';
        this.sendUserChatMsg(msg);
    }
    
    sendUserChatMsg(msgText) {
        const logs = document.getElementById('chat-logs-area');
        if (!logs) return;
        
        // 1. User Message
        const userMsg = document.createElement('div');
        userMsg.className = 'chat-msg user';
        userMsg.innerHTML = `<p>${msgText}</p>`;
        logs.appendChild(userMsg);
        logs.scrollTop = logs.scrollHeight;
        
        // 2. Typing Indicator
        const typing = document.createElement('div');
        typing.className = 'chat-typing-bubble';
        typing.id = 'chat-typing-indicator';
        typing.innerHTML = `
            <div class="chat-typing-dot"></div>
            <div class="chat-typing-dot"></div>
            <div class="chat-typing-dot"></div>
        `;
        logs.appendChild(typing);
        logs.scrollTop = logs.scrollHeight;
        
        // 3. Bot Reply
        setTimeout(() => {
            const ind = document.getElementById('chat-typing-indicator');
            if (ind) ind.remove();
            
            let replyText = "Thank you for contacting support! One of our team agents will be with you shortly. You can also contact us via support@bharatbus.com.";
            const lower = msgText.toLowerCase();
            
            if (lower.includes('prebook')) {
                replyText = "Prebooking lets you secure your seat for just ₹99 per seat today. The balance can be paid in cash or UPI directly to the driver when boarding.";
            } else if (lower.includes('refund') || lower.includes('cancel')) {
                replyText = "Cancellations made 24 hours prior to travel receive a 100% refund. You can cancel your tickets directly from your dashboard under 'My Bookings'. Refund takes 3-5 business days.";
            } else if (lower.includes('coupon') || lower.includes('discount')) {
                replyText = "Apply coupons on the Checkout screen! Available codes: FIRSTBUS (15% Off), BUSEASE10 (10% Off), or SAVE150 (₹150 off)!";
            } else if (lower.includes('admin') || lower.includes('password') || lower.includes('credentials')) {
                replyText = "Access to the Admin dashboard is restricted to authorized administrators only. Please contact system administration for login inquiries.";
            } else if (lower.includes('help') || lower.includes('contact') || lower.includes('support')) {
                replyText = "For phone support, call us at 1800-419-2121, or use the 'Contact Us' email form at the bottom of the home screen.";
            }
            
            const botMsg = document.createElement('div');
            botMsg.className = 'chat-msg bot';
            botMsg.innerHTML = `<p>${replyText}</p>`;
            logs.appendChild(botMsg);
            logs.scrollTop = logs.scrollHeight;
        }, 1000);
    }

    // ================= ADMIN EXTENSION LOGS =================
    async loadAdminUsersTable() {
        const tbody = document.getElementById('admin-user-rows');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="7">Loading customer registrations...</td></tr>';
        
        try {
            const res = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${this.currentUser.token}` }
            });
            const users = await res.json();
            tbody.innerHTML = '';

            users.forEach(u => {
                const tr = document.createElement('tr');
                const createdDate = u.createdAt ? u.createdAt.replace('T', ' ').substring(0, 16) : '-';
                tr.innerHTML = `
                    <td><strong>USR-${1000 + u.id}</strong></td>
                     <td>${u.name}</td>
                     <td>${u.email}</td>
                     <td>${u.phone || '-'}</td>
                     <td><span style="font-weight:700; font-size:11px;">${u.provider}</span></td>
                     <td>${createdDate}</td>
                     <td><span style="font-weight:600; color:${u.role === 'ADMIN' ? 'var(--primary)' : 'var(--text-muted)'}">${u.role}</span></td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="7" style="color:var(--primary);">${err.message}</td></tr>`;
        }
    }

    async loadAdminFeedbacksTable() {
        const tbody = document.getElementById('admin-feedback-rows');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="6">Loading feedbacks log...</td></tr>';
        
        try {
            const res = await fetch('/api/admin/feedbacks', {
                headers: { 'Authorization': `Bearer ${this.currentUser.token}` }
            });
            const feedbacks = await res.json();
            tbody.innerHTML = '';

            feedbacks.forEach(f => {
                const tr = document.createElement('tr');
                const createdDate = f.createdAt ? f.createdAt.replace('T', ' ').substring(0, 16) : '-';
                let stars = '★'.repeat(f.rating) + '☆'.repeat(5 - f.rating);
                tr.innerHTML = `
                    <td><strong>FB-${200 + f.id}</strong></td>
                     <td>${f.name}</td>
                     <td>${f.email}</td>
                     <td style="color:#ecc94b; font-weight:700;">${stars}</td>
                     <td style="max-width:300px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${f.comment}">${f.comment}</td>
                     <td>${createdDate}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="6" style="color:var(--primary);">${err.message}</td></tr>`;
        }
    }
}

// Instantiate App globally
const app = new BharatBusApp();
window.app = app;
