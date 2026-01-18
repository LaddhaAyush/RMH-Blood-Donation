/**
 * Blood Donation Event Website
 * Frontend JavaScript - Vanilla JS
 * Handles form submission, validation, redirects, and dashboard updates
 */

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    API_BASE_URL: window.location.origin,
    THANK_YOU_DURATION: 10, // seconds
    STATS_REFRESH_INTERVAL: 5000, // 5 seconds
    SLOGAN_INTERVAL: 4000, // 4 seconds
    COUNT_ANIMATION_DURATION: 2000 // 2 seconds
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Makes an API request with error handling
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise} Response data
 */
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        });

        // Read raw response text first so we can handle non-JSON error pages
        const text = await response.text();

        // Try to parse JSON, but fall back to raw text for debugging
        let data = null;
        try {
            data = text ? JSON.parse(text) : {};
        } catch (err) {
            // Not valid JSON (server returned HTML or plain text). Keep raw text in dataForError
            const dataForError = text || 'Server returned a non-JSON response';
            if (!response.ok) {
                console.error('Non-JSON error response from server:', dataForError);
                throw new Error(dataForError);
            }
            // If response.ok but not JSON, return raw text as data
            return text;
        }

        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * Validates form field and shows error message
 * @param {HTMLElement} field - Input field
 * @param {string} errorId - Error message element ID
 * @param {string} message - Error message to display
 * @returns {boolean} Is field valid
 */
function validateField(field, errorId, message) {
    const errorElement = document.getElementById(errorId);
    const formGroup = field.closest('.form-group');

    if (!field.value.trim()) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        formGroup.classList.add('error');
        return false;
    }

    errorElement.classList.remove('show');
    formGroup.classList.remove('error');
    return true;
}

/**
 * Animates a number counting up
 * @param {HTMLElement} element - Element to update
 * @param {number} start - Starting number
 * @param {number} end - Ending number
 * @param {number} duration - Animation duration in ms
 */
function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    const difference = end - start;

    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(start + (difference * easeOutQuart));

        element.textContent = currentValue.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        } else {
            element.textContent = end.toLocaleString();
        }
    }

    requestAnimationFrame(updateNumber);
}

/**
 * Stores donor info in session storage for thank you page
 * @param {object} donorInfo - Donor information
 */
function storeDonorInfo(donorInfo) {
    sessionStorage.setItem('donorInfo', JSON.stringify(donorInfo));
}

/**
 * Retrieves donor info from session storage
 * @returns {object|null} Donor information
 */
function getDonorInfo() {
    const info = sessionStorage.getItem('donorInfo');
    return info ? JSON.parse(info) : null;
}

/**
 * Clears donor info from session storage
 */
function clearDonorInfo() {
    sessionStorage.removeItem('donorInfo');
}

/**
 * Formats a date to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================
// REGISTRATION FORM (index.html)
// ============================================

/**
 * Initializes the donor registration form
 */
function initRegistrationForm() {
    const form = document.getElementById('donorForm');
    if (!form) return;

    const submitBtn = document.getElementById('submitBtn');
    const formMessage = document.getElementById('formMessage');

    // Form submission handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form values
        const fullName = document.getElementById('fullName');
        const bloodGroup = document.getElementById('bloodGroup');
        const age = document.getElementById('age');
        const year = document.getElementById('year');

        // Reset previous errors
        document.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));
        document.querySelectorAll('.form-group').forEach(el => el.classList.remove('error'));
        formMessage.className = 'form-message';

        // Validate all fields
        let isValid = true;

        if (!validateField(fullName, 'fullNameError', 'Please enter your full name')) {
            isValid = false;
        }

        if (!validateField(bloodGroup, 'bloodGroupError', 'Please select your blood group')) {
            isValid = false;
        }

        if (!validateField(age, 'ageError', 'Please enter your age')) {
            isValid = false;
        } else if (parseInt(age.value) < 18) {
            document.getElementById('ageError').textContent = 'You must be at least 18 years old';
            document.getElementById('ageError').classList.add('show');
            age.closest('.form-group').classList.add('error');
            isValid = false;
        } else if (parseInt(age.value) > 65) {
            document.getElementById('ageError').textContent = 'Maximum age for donation is 65 years';
            document.getElementById('ageError').classList.add('show');
            age.closest('.form-group').classList.add('error');
            isValid = false;
        }

        if (!validateField(year, 'yearError', 'Please select your academic year')) {
            isValid = false;
        }

        if (!isValid) return;

        // Show loading state
        submitBtn.classList.add('loading');

        try {
            // Submit donation
            const response = await apiRequest('/api/donate', {
                method: 'POST',
                body: JSON.stringify({
                    fullName: fullName.value.trim(),
                    bloodGroup: bloodGroup.value,
                    age: parseInt(age.value),
                    year: year.value
                })
            });

            console.log('Donation successful:', response);
            
            // Show success message on form
            formMessage.textContent = 'Registration successful! Thank you!';
            formMessage.className = 'form-message success';
            
            // Reset form
            form.reset();
            submitBtn.classList.remove('loading');

        } catch (error) {
            // Show error message
            formMessage.textContent = error.message || 'Registration failed. Please try again.';
            formMessage.className = 'form-message error';
            submitBtn.classList.remove('loading');
        }
    });

    // Real-time validation on blur
    document.getElementById('fullName').addEventListener('blur', (e) => {
        validateField(e.target, 'fullNameError', 'Please enter your full name');
    });

    document.getElementById('bloodGroup').addEventListener('change', (e) => {
        validateField(e.target, 'bloodGroupError', 'Please select your blood group');
    });

    document.getElementById('age').addEventListener('blur', (e) => {
        if (e.target.value && parseInt(e.target.value) < 18) {
            document.getElementById('ageError').textContent = 'You must be at least 18 years old';
            document.getElementById('ageError').classList.add('show');
            e.target.closest('.form-group').classList.add('error');
        } else if (e.target.value && parseInt(e.target.value) > 65) {
            document.getElementById('ageError').textContent = 'Maximum age for donation is 65 years';
            document.getElementById('ageError').classList.add('show');
            e.target.closest('.form-group').classList.add('error');
        } else {
            validateField(e.target, 'ageError', 'Please enter your age');
        }
    });

    document.getElementById('year').addEventListener('change', (e) => {
        validateField(e.target, 'yearError', 'Please select your academic year');
    });
}

// ============================================
// THANK YOU PAGE (thankyou.html)
// ============================================

/**
 * Initializes the thank you page with countdown
 */
function initThankYouPage() {
    const donorNameEl = document.getElementById('donorName');
    const donorBloodGroupEl = document.getElementById('donorBloodGroup');
    const countdownEl = document.getElementById('countdown');
    const progressFill = document.getElementById('progressFill');

    if (!donorNameEl || !countdownEl) return;

    // Get donor info from session storage
    const donorInfo = getDonorInfo();

    if (donorInfo) {
        donorNameEl.textContent = donorInfo.fullName;
        donorBloodGroupEl.textContent = donorInfo.bloodGroup;
    } else {
        // If no donor info, redirect to home
        donorNameEl.textContent = 'Anonymous Hero';
        donorBloodGroupEl.textContent = '❤️';
    }

    // Countdown timer
    let countdown = CONFIG.THANK_YOU_DURATION;
    const totalDuration = CONFIG.THANK_YOU_DURATION;

    // Update progress bar
    function updateProgress() {
        const remaining = countdown / totalDuration;
        progressFill.style.width = `${remaining * 100}%`;
    }

    // Initial progress
    updateProgress();

    // Countdown interval
    const countdownInterval = setInterval(() => {
        countdown--;
        countdownEl.textContent = countdown;
        updateProgress();

        if (countdown <= 0) {
            clearInterval(countdownInterval);
            clearDonorInfo();
            window.location.href = '/dashboard';
        }
    }, 1000);
}

// ============================================
// DASHBOARD PAGE (dashboard.html)
// ============================================

/**
 * Initializes the dashboard with live stats
 */
function initDashboard() {
    const totalUnitsEl = document.getElementById('totalUnits');
    const livesSavedEl = document.getElementById('livesSaved');
    const lastUpdatedEl = document.getElementById('lastUpdated');
    const donorsListEl = document.getElementById('donorsList');

    if (!totalUnitsEl) return;

    let previousTotal = 0;
    let isFirstLoad = true;

    /**
     * Shows the thank you popup overlay
     */
    function showThankYouPopup(donorName, bloodGroup) {
        const overlay = document.getElementById('thankYouOverlay');
        const nameEl = document.getElementById('overlayDonorName');
        const bloodEl = document.getElementById('overlayBloodGroup');

        if (overlay) {
            if (nameEl) nameEl.textContent = donorName;
            if (bloodEl) bloodEl.textContent = bloodGroup;
            overlay.classList.add('show');

            // Hide after 10 seconds
            setTimeout(() => {
                overlay.classList.remove('show');
            }, 10000);
        }
    }

    /**
     * Fetches the latest donor and shows popup
     */
    async function fetchLatestDonorAndShowPopup() {
        try {
            const response = await apiRequest('/api/donors?limit=1');
            if (response.data && response.data.length > 0) {
                const latestDonor = response.data[0];
                showThankYouPopup(latestDonor.fullName, latestDonor.bloodGroup);
            }
        } catch (error) {
            console.error('Failed to fetch latest donor:', error);
        }
    }

    /**
     * Fetches and updates statistics
     */
    async function fetchStats() {
        try {
            const response = await apiRequest('/api/stats');
            const { totalBloodUnits, lastUpdated } = response.data;

            // Detect new donor (count increased) - skip on first load
            if (!isFirstLoad && totalBloodUnits > previousTotal) {
                // New donor detected, fetch and show popup
                fetchLatestDonorAndShowPopup();
            }

            // Animate number if changed
            if (totalBloodUnits !== previousTotal) {
                animateNumber(totalUnitsEl, previousTotal, totalBloodUnits, CONFIG.COUNT_ANIMATION_DURATION);
                
                // Calculate lives saved (each unit can save up to 3 lives)
                const livesSaved = totalBloodUnits * 3;
                animateNumber(livesSavedEl, previousTotal * 3, livesSaved, CONFIG.COUNT_ANIMATION_DURATION);
                
                previousTotal = totalBloodUnits;
            }

            isFirstLoad = false;

            // Update last updated time
            if (lastUpdated) {
                lastUpdatedEl.textContent = `Last updated: ${formatDate(lastUpdated)}`;
            }

        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    }

    /**
     * Fetches and displays recent donors
     */
    async function fetchRecentDonors() {
        try {
            const response = await apiRequest('/api/donors?limit=8');
            const donors = response.data;

            if (donors.length === 0) {
                donorsListEl.innerHTML = '<p class="no-donors">No donors registered yet. Be the first!</p>';
                return;
            }

            donorsListEl.innerHTML = donors.map((donor, index) => `
                <div class="donor-chip" style="animation-delay: ${index * 0.08}s">
                    <span class="donor-name">${escapeHtml(donor.fullName)}</span>
                    <span class="blood-badge">${escapeHtml(donor.bloodGroup)}</span>
                </div>
            `).join('');

        } catch (error) {
            console.error('Failed to fetch donors:', error);
            donorsListEl.innerHTML = '<p class="loading-state">Failed to load donors</p>';
        }
    }

    /**
     * Escapes HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initial fetch
    fetchStats();
    fetchRecentDonors();

    // Auto-refresh stats
    setInterval(fetchStats, CONFIG.STATS_REFRESH_INTERVAL);
    setInterval(fetchRecentDonors, CONFIG.STATS_REFRESH_INTERVAL);

    // Initialize slogans carousel
    initSlogansCarousel();

    // Initialize all donors modal
    initAllDonorsModal();
}

/**
 * Initializes the all donors modal functionality
 */
function initAllDonorsModal() {
    const modal = document.getElementById('allDonorsModal');
    const openBtn = document.getElementById('viewAllDonorsBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const searchInput = document.getElementById('searchDonors');
    const modalContent = document.getElementById('allDonorsContent');

    if (!modal || !openBtn || !closeBtn) return;

    let allDonorsData = [];

    // Open modal
    openBtn.addEventListener('click', async () => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        await loadAllDonors();
    });

    // Close modal
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    closeBtn.addEventListener('click', closeModal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            filterDonors(searchTerm);
        });
    }

    /**
     * Loads all donors from API
     */
    async function loadAllDonors() {
        try {
            modalContent.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <span>Loading all donors...</span>
                </div>
            `;

            const response = await apiRequest('/api/donors?limit=1000');
            allDonorsData = response.data || [];

            if (allDonorsData.length === 0) {
                modalContent.innerHTML = `
                    <div class="modal-empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                        </svg>
                        <p>No donors registered yet</p>
                    </div>
                `;
                return;
            }

            renderDonors(allDonorsData);

        } catch (error) {
            console.error('Failed to load all donors:', error);
            modalContent.innerHTML = `
                <div class="modal-empty">
                    <p>Failed to load donors. Please try again.</p>
                </div>
            `;
        }
    }

    /**
     * Renders donor cards in modal
     */
    function renderDonors(donors) {
        modalContent.innerHTML = `
            <div class="modal-donors-grid">
                ${donors.map(donor => `
                    <div class="modal-donor-card">
                        <div class="modal-donor-name">${escapeHtml(donor.fullName)}</div>
                        <div class="modal-donor-info">
                            <span class="modal-donor-blood">${escapeHtml(donor.bloodGroup)}</span>
                            <span class="modal-donor-date">${formatDate(donor.donatedAt)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Filters donors based on search term
     */
    function filterDonors(searchTerm) {
        if (!searchTerm) {
            renderDonors(allDonorsData);
            return;
        }

        const filtered = allDonorsData.filter(donor => 
            donor.fullName.toLowerCase().includes(searchTerm) ||
            donor.bloodGroup.toLowerCase().includes(searchTerm)
        );

        if (filtered.length === 0) {
            modalContent.innerHTML = `
                <div class="modal-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <p>No donors found matching "${escapeHtml(searchTerm)}"</p>
                </div>
            `;
            return;
        }

        renderDonors(filtered);
    }

    /**
     * Escapes HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/**
 * Initializes the quotes carousel (dashboard)
 */
function initSlogansCarousel() {
    const quotes = document.querySelectorAll('.quote-slide');
    const indicators = document.querySelectorAll('.carousel-indicators .indicator');

    if (quotes.length === 0) return;

    let currentIndex = 0;

    function showQuote(index) {
        // Remove active class from all
        quotes.forEach(quote => {
            quote.classList.remove('active');
        });
        indicators.forEach(ind => ind.classList.remove('active'));

        // Show new quote
        currentIndex = index;
        quotes[currentIndex].classList.add('active');
        if (indicators[currentIndex]) {
            indicators[currentIndex].classList.add('active');
        }
    }

    function nextQuote() {
        const nextIndex = (currentIndex + 1) % quotes.length;
        showQuote(nextIndex);
    }

    // Auto-rotate quotes
    setInterval(nextQuote, CONFIG.SLOGAN_INTERVAL);

    // Click on indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            showQuote(index);
        });
    });
}

// ============================================
// PAGE INITIALIZATION
// ============================================

/**
 * Determines current page and initializes appropriate functionality
 */
function initializePage() {
    const path = window.location.pathname;

    // Determine which page we're on and initialize
    if (path === '/' || path === '/index.html' || path.endsWith('index.html')) {
        initRegistrationForm();
    } else if (path === '/thank-you' || path.includes('thankyou')) {
        initThankYouPage();
    } else if (path === '/dashboard' || path.includes('dashboard')) {
        initDashboard();
    }

    console.log('🩸 Blood Donation Website initialized');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializePage);
