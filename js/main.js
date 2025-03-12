// Security utility functions
const Security = {
    // Sanitize user input
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },

    // Validate email format
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validate phone number format
    validatePhone(phone) {
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone);
    },

    // Validate coordinates
    validateCoordinates(lat, lng) {
        return !isNaN(lat) && !isNaN(lng) && 
               lat >= -90 && lat <= 90 && 
               lng >= -180 && lng <= 180;
    },

    // Rate limiting for API calls
    rateLimit: {
        calls: {},
        maxCalls: 100,
        timeWindow: 60000, // 1 minute

        check(endpoint) {
            const now = Date.now();
            if (!this.calls[endpoint]) {
                this.calls[endpoint] = {
                    count: 1,
                    timestamp: now
                };
                return true;
            }

            if (now - this.calls[endpoint].timestamp > this.timeWindow) {
                this.calls[endpoint] = {
                    count: 1,
                    timestamp: now
                };
                return true;
            }

            if (this.calls[endpoint].count >= this.maxCalls) {
                return false;
            }

            this.calls[endpoint].count++;
            return true;
        }
    }
};

// Global form elements
const formElements = {
    form: null,
    serviceType: null,
    hours: null,
    fareEstimate: null,
    pickupDate: null,
    pickupTime: null
};

// Form Validation with enhanced security
function validateForm() {
    const name = Security.sanitizeInput(document.getElementById('name').value);
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    let isValid = true;

    // Reset previous errors
    clearErrors();

    // Name validation with XSS prevention
    if (name.trim().length < 3) {
        showError('name', 'Name must be at least 3 characters');
        isValid = false;
    }

    // Phone validation
    if (!Security.validatePhone(phone)) {
        showError('phone', 'Please enter a valid 10-digit phone number');
        isValid = false;
    }

    // Email validation
    if (!Security.validateEmail(email)) {
        showError('email', 'Please enter a valid email address');
        isValid = false;
    }

    return isValid;
}

// Secure error display
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = Security.sanitizeInput(message);
    errorDiv.style.color = 'red';
    errorDiv.style.fontSize = '0.8rem';
    errorDiv.style.marginTop = '4px';
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = 'red';
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(error => error.remove());
    document.querySelectorAll('input').forEach(input => input.style.borderColor = '');
}

// Price Calculator
function calculateFare() {
    const hours = parseFloat(document.getElementById('hours').value) || 0;
    const serviceType = document.getElementById('serviceType').value;
    let totalFare = 0;

    // Rate calculation based on service type
    switch(serviceType) {
        case 'morning':
            // Morning Rate: 8 hours - ₹1000
            if (hours <= 8) {
                totalFare = 1000;
            } else {
                totalFare = 1000 + ((hours - 8) * 250); // Additional hours at ₹250/hour
            }
            break;
        
        case 'afternoon':
            // Afternoon Rate: 5 hours - ₹1000
            if (hours <= 5) {
                totalFare = 1000;
            } else {
                totalFare = 1000 + ((hours - 5) * 250);
            }
            break;
        
        case 'hourly':
            // Hourly Rate: ₹250 per hour
            totalFare = hours * 250;
            break;
        
        case 'night':
            // Night Rate: 2 hours - ₹750
            if (hours <= 2) {
                totalFare = 750;
            } else {
                totalFare = 750 + ((hours - 2) * 250); // Night additional hours at ₹250/hour
            }
            break;
        
        case 'tour':
            // Tour Rate: 12 hours - ₹1500
            if (hours <= 12) {
                totalFare = 1500;
            } else {
                totalFare = 1500 + ((hours - 12) * 250);
            }
            break;
        
        case 'night_stay':
            // Night Stay Rate: ₹250 per hour
            totalFare = hours * 250;
            break;
    }

    // Update the fare display
    const fareDisplay = document.getElementById('fareEstimate');
    if (fareDisplay) {
        fareDisplay.textContent = `₹${totalFare.toFixed(2)}`;
        
        // Show rate details
        const rateDetails = document.getElementById('rateDetails');
        if (rateDetails) {
            let detailsText = '';
            switch(serviceType) {
                case 'morning':
                    detailsText = 'Base rate: ₹1000 for 8 hours\nAdditional hours: ₹250/hour';
                    break;
                case 'afternoon':
                    detailsText = 'Base rate: ₹1000 for 5 hours\nAdditional hours: ₹250/hour';
                    break;
                case 'hourly':
                    detailsText = 'Standard hourly rate: ₹250/hour';
                    break;
                case 'night':
                    detailsText = 'Base rate: ₹750 for 2 hours\nAdditional hours: ₹250/hour';
                    break;
                case 'tour':
                    detailsText = 'Base rate: ₹1500 for 12 hours\nAdditional hours: ₹250/hour';
                    break;
                case 'night_stay':
                    detailsText = 'Night stay rate: ₹250/hour';
                    break;
            }
            rateDetails.textContent = detailsText;
        }
    }
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Driver Availability Checker
function checkAvailability() {
    const date = document.getElementById('bookingDate').value;
    const time = document.getElementById('bookingTime').value;
    const location = document.getElementById('location').value;
    
    if (!date || !time || !location) {
        showAvailabilityResult('Please fill in all fields', 'orange');
        return;
    }
    
    // Simulate availability check with loading state
    showAvailabilityResult('Checking availability...', 'blue');
    
    setTimeout(() => {
        const isAvailable = Math.random() > 0.3; // 70% chance of availability
        const message = isAvailable ? 
            '✅ Drivers available in your area!' : 
            '⚠️ Limited availability, please contact us directly';
        const color = isAvailable ? 'green' : 'orange';
        
        showAvailabilityResult(message, color);
    }, 1500);
}

function showAvailabilityResult(message, color) {
    const resultDiv = document.getElementById('availabilityResult');
    if (resultDiv) {
        resultDiv.textContent = message;
        resultDiv.style.color = color;
    }
}

// Testimonial Carousel
class TestimonialCarousel {
    constructor() {
        this.currentTestimonial = 0;
        this.testimonials = document.querySelectorAll('.testimonial');
        if (this.testimonials.length > 0) {
            this.initCarousel();
        }
    }

    initCarousel() {
        // Hide all except first
        this.testimonials.forEach((t, i) => {
            if (i !== 0) t.style.display = 'none';
        });

        // Start rotation
        setInterval(() => this.showNextTestimonial(), 5000);
    }

    showNextTestimonial() {
        this.testimonials[this.currentTestimonial].style.display = 'none';
        this.currentTestimonial = (this.currentTestimonial + 1) % this.testimonials.length;
        this.testimonials[this.currentTestimonial].style.display = 'block';
    }
}

// Secure geolocation handling
function getUserLocation() {
    if (!navigator.geolocation) {
        showLocationError('Geolocation is not supported by your browser');
        return;
    }

    if (!Security.rateLimit.check('geolocation')) {
        showLocationError('Too many location requests. Please try again later.');
        return;
    }

    // Show loading state
    const locationInput = document.getElementById('location');
    const locationBtn = document.getElementById('getLocation');
    if (locationBtn) {
        locationBtn.disabled = true;
        locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting location...';
    }
    if (locationInput) {
        locationInput.placeholder = 'Fetching your location...';
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            if (Security.validateCoordinates(lat, lng)) {
                // Use Geocoding API to get address
                fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
                    .then(response => response.json())
                    .then(data => {
                        const address = data.display_name;
                        // Update location input
                        if (locationInput) {
                            locationInput.value = address;
                        }
                        // Show nearby drivers with address
                        showNearbyDrivers(address);
                        // Reset button
                        if (locationBtn) {
                            locationBtn.disabled = false;
                            locationBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Use Current Location';
                        }
                    })
                    .catch(error => {
                        console.error('Error getting address:', error);
                        showLocationError('Unable to get your address. Please enter it manually.');
                        // Reset button
                        if (locationBtn) {
                            locationBtn.disabled = false;
                            locationBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Use Current Location';
                        }
                    });
            } else {
                showLocationError('Invalid coordinates received');
                // Reset button
                if (locationBtn) {
                    locationBtn.disabled = false;
                    locationBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Use Current Location';
                }
            }
        },
        error => {
            console.error('Error getting location:', error);
            showLocationError('Unable to get your location. Please enter it manually.');
            // Reset button
            if (locationBtn) {
                locationBtn.disabled = false;
                locationBtn.innerHTML = '<i class="fas fa-crosshairs"></i> Use Current Location';
            }
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

// Secure nearby drivers display
function showNearbyDrivers(location) {
    const nearbyDiv = document.getElementById('nearbyDrivers');
    if (nearbyDiv) {
        const sanitizedLocation = Security.sanitizeInput(location);
        
        // Check if location contains Delhi NCR related terms
        const delhiNcrTerms = [
            'delhi', 'ncr', 'new delhi',
            'gurgaon', 'gurugram', 
            'noida', 'greater noida',
            'ghaziabad', 'faridabad',
            'igi airport', 'indira gandhi airport', 'terminal 3', 't3',
            'dwarka', 'rohini', 'pitampura', 'janakpuri',
            'connaught place', 'cp', 'karol bagh',
            'saket', 'lajpat nagar', 'nehru place',
            'cyber city', 'cyber hub',
            'sector', 'golf course road',
            'vaishali', 'indirapuram',
            'crossing republik'
        ];
        
        const isNearDelhiNcr = delhiNcrTerms.some(term => 
            sanitizedLocation.toLowerCase().includes(term)
        );
        
        if (!isNearDelhiNcr) {
            nearbyDiv.innerHTML = `
                <div class="nearby-drivers">
                    <h3>No Drivers Available</h3>
                    <p>Sorry, we currently operate only in Delhi NCR region. Please select a location within Delhi NCR.</p>
                    <div class="location-suggestions">
                        <p>Popular locations we serve:</p>
                        <ul>
                            <li>IGI Airport (Terminal 1, 2, 3)</li>
                            <li>Connaught Place, New Delhi</li>
                            <li>Cyber City, Gurugram</li>
                            <li>Sector 18, Noida</li>
                            <li>Vaishali, Ghaziabad</li>
                        </ul>
                    </div>
                </div>
            `;
            return;
        }

        nearbyDiv.innerHTML = `
            <div class="nearby-drivers">
                <h3>Drivers in Delhi NCR</h3>
                <p>Showing available drivers near ${sanitizedLocation}</p>
                <div class="driver-list">
                    ${generateMockDrivers(sanitizedLocation)}
                </div>
            </div>
        `;
    }
}

function generateMockDrivers(location = '') {
    // Base drivers list
    const allDrivers = [
        { 
            name: 'Rajesh K.', 
            rating: 4.8, 
            experience: '5 years',
            location: 'South Delhi',
            areas: ['igi airport', 'south delhi', 'saket'],
            image: 'assets/images/profiles/driver1.jpg'
        },
        { 
            name: 'Amit S.', 
            rating: 4.9, 
            experience: '7 years',
            location: 'Noida Sector 62',
            areas: ['noida', 'greater noida', 'ghaziabad'],
            image: 'assets/images/profiles/driver2.jpg'
        },
        { 
            name: 'Pradeep M.', 
            rating: 4.7, 
            experience: '4 years',
            location: 'Gurugram Sector 45',
            areas: ['gurugram', 'cyber city', 'dwarka'],
            image: 'assets/images/profiles/driver3.jpg'
        },
        { 
            name: 'Suresh R.', 
            rating: 4.9, 
            experience: '6 years',
            location: 'IGI Airport',
            areas: ['igi airport', 'dwarka', 'gurugram'],
            image: 'assets/images/profiles/driver4.jpg'
        },
        { 
            name: 'Vikram S.', 
            rating: 4.8, 
            experience: '5 years',
            location: 'Connaught Place',
            areas: ['connaught place', 'karol bagh', 'new delhi'],
            image: 'assets/images/profiles/driver5.jpg'
        }
    ];

    // Filter drivers based on location if provided
    let relevantDrivers = allDrivers;
    if (location) {
        const searchLocation = location.toLowerCase();
        relevantDrivers = allDrivers.filter(driver => 
            driver.areas.some(area => searchLocation.includes(area))
        );
        
        // If no specific drivers found, return all drivers
        if (relevantDrivers.length === 0) {
            relevantDrivers = allDrivers;
        }
    }

    // Take the first 3 drivers
    const selectedDrivers = relevantDrivers.slice(0, 3);

    return selectedDrivers.map(driver => `
        <div class="driver-card">
            <img src="${driver.image}" alt="${driver.name}" class="driver-avatar" 
                 onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(driver.name)}&background=0D47A1&color=fff'">
            <h4>${driver.name}</h4>
            <p>⭐ ${driver.rating}</p>
            <p>Experience: ${driver.experience}</p>
            <p>Area: ${driver.location}</p>
        </div>
    `).join('');
}

// Secure error message display
function showLocationError(message) {
    const errorDiv = document.getElementById('locationError');
    if (errorDiv) {
        errorDiv.textContent = Security.sanitizeInput(message);
        errorDiv.style.display = 'block';
    }
}

// Location Autocomplete
function initLocationAutocomplete() {
    const locationInput = document.getElementById('location');
    if (!locationInput) return;

    const autocompleteContainer = document.createElement('div');
    autocompleteContainer.className = 'location-autocomplete';
    autocompleteContainer.style.display = 'none';
    locationInput.parentNode.appendChild(autocompleteContainer);

    let debounceTimer;
    let currentFocus = -1;

    locationInput.addEventListener('input', function() {
        const query = this.value.trim();
        
        // Clear previous timer
        clearTimeout(debounceTimer);
        
        // Hide autocomplete if input is empty
        if (!query) {
            autocompleteContainer.style.display = 'none';
            return;
        }

        // Debounce the API call
        debounceTimer = setTimeout(() => {
            if (!Security.rateLimit.check('geocoding')) {
                showLocationError('Too many location requests. Please wait a moment.');
                return;
            }

            // Add Delhi NCR to the search query
            const searchQuery = `${query} Delhi NCR`;
            
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=in`)
                .then(response => response.json())
                .then(data => {
                    // Filter results to prioritize Delhi NCR locations
                    const delhiNcrTerms = [
                        'delhi', 'ncr', 'new delhi',
                        'gurgaon', 'gurugram', 
                        'noida', 'greater noida',
                        'ghaziabad', 'faridabad',
                        'igi airport', 'indira gandhi airport', 'terminal 3', 't3',
                        'dwarka', 'rohini', 'pitampura', 'janakpuri',
                        'connaught place', 'cp', 'karol bagh',
                        'saket', 'lajpat nagar', 'nehru place',
                        'cyber city', 'cyber hub',
                        'sector', 'golf course road',
                        'vaishali', 'indirapuram',
                        'crossing republik'
                    ];
                    
                    const filteredData = data.filter(place => 
                        delhiNcrTerms.some(term => 
                            place.display_name.toLowerCase().includes(term)
                        )
                    );

                    if (filteredData.length > 0) {
                        const suggestions = filteredData.map(place => `
                            <div class="location-suggestion" data-location="${Security.sanitizeInput(place.display_name)}">
                                <i class="fas fa-map-marker-alt"></i>
                                ${Security.sanitizeInput(place.display_name)}
                            </div>
                        `).join('');
                        
                        autocompleteContainer.innerHTML = suggestions;
                        autocompleteContainer.style.display = 'block';

                        // Add click handlers to suggestions
                        document.querySelectorAll('.location-suggestion').forEach(suggestion => {
                            suggestion.addEventListener('click', function() {
                                locationInput.value = this.dataset.location;
                                autocompleteContainer.style.display = 'none';
                                showNearbyDrivers(this.dataset.location);
                            });
                        });
                    } else {
                        // Show popular locations when no matches found
                        autocompleteContainer.innerHTML = `
                            <div class="location-suggestion">
                                <i class="fas fa-info-circle"></i>
                                We serve these popular locations:
                            </div>
                            <div class="location-suggestion" data-location="IGI Airport, New Delhi">
                                <i class="fas fa-plane"></i>
                                IGI Airport, New Delhi
                            </div>
                            <div class="location-suggestion" data-location="Connaught Place, New Delhi">
                                <i class="fas fa-map-marker-alt"></i>
                                Connaught Place, New Delhi
                            </div>
                            <div class="location-suggestion" data-location="Cyber City, Gurugram">
                                <i class="fas fa-building"></i>
                                Cyber City, Gurugram
                            </div>
                        `;
                        autocompleteContainer.style.display = 'block';
                        
                        // Add click handlers to suggestions
                        document.querySelectorAll('.location-suggestion').forEach(suggestion => {
                            if (suggestion.dataset.location) {
                                suggestion.addEventListener('click', function() {
                                    locationInput.value = this.dataset.location;
                                    autocompleteContainer.style.display = 'none';
                                    showNearbyDrivers(this.dataset.location);
                                });
                            }
                        });
                    }
                })
                .catch(error => {
                    console.error('Error fetching locations:', error);
                    autocompleteContainer.style.display = 'none';
                });
        }, 300); // Debounce delay of 300ms
    });

    // Handle keyboard navigation
    locationInput.addEventListener('keydown', function(e) {
        const suggestions = document.querySelectorAll('.location-suggestion');
        
        if (suggestions.length === 0) return;

        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            
            // Update focus
            if (e.key === 'ArrowDown') {
                currentFocus = currentFocus < suggestions.length - 1 ? currentFocus + 1 : 0;
            } else {
                currentFocus = currentFocus > 0 ? currentFocus - 1 : suggestions.length - 1;
            }

            // Update visual focus
            suggestions.forEach((suggestion, index) => {
                if (index === currentFocus) {
                    suggestion.classList.add('focused');
                    suggestion.scrollIntoView({ block: 'nearest' });
                } else {
                    suggestion.classList.remove('focused');
                }
            });
        } else if (e.key === 'Enter' && currentFocus !== -1) {
            e.preventDefault();
            const focusedSuggestion = document.querySelector('.location-suggestion.focused');
            if (focusedSuggestion) {
                locationInput.value = focusedSuggestion.dataset.location;
                autocompleteContainer.style.display = 'none';
                showNearbyDrivers(focusedSuggestion.dataset.location);
                currentFocus = -1;
            }
        } else if (e.key === 'Escape') {
            autocompleteContainer.style.display = 'none';
            currentFocus = -1;
        }
    });

    // Hide autocomplete when clicking outside
    document.addEventListener('click', function(e) {
        if (!locationInput.contains(e.target) && !autocompleteContainer.contains(e.target)) {
            autocompleteContainer.style.display = 'none';
            currentFocus = -1;
        }
    });
}

// Booking History
class BookingHistory {
    constructor() {
        this.bookings = JSON.parse(localStorage.getItem('bookingHistory')) || [];
    }

    addBooking(booking) {
        const newBooking = {
            ...booking,
            date: new Date().toISOString(),
            id: this.generateBookingId()
        };
        this.bookings.push(newBooking);
        localStorage.setItem('bookingHistory', JSON.stringify(this.bookings));
        this.displayBookingHistory();
    }

    generateBookingId() {
        return 'BK' + Date.now().toString().slice(-6);
    }

    displayBookingHistory() {
        const historyDiv = document.getElementById('bookingHistory');
        if (!historyDiv) return;

        historyDiv.innerHTML = this.bookings.length ? 
            this.bookings.map(booking => `
                <div class="booking-item">
                    <h3>Booking #${booking.id}</h3>
                    <p>Date: ${new Date(booking.date).toLocaleDateString()}</p>
                    <p>Driver: ${booking.driverName || 'To be assigned'}</p>
                    <p>Status: ${booking.status || 'Pending'}</p>
                </div>
            `).join('') :
            '<p>No booking history available</p>';
    }
}

// Secure form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Validate form
    if (!formData.get('name') || !formData.get('phone') || !formData.get('location') || 
        !formData.get('serviceType') || !formData.get('bookingDate') || !formData.get('bookingTime')) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    try {
        // Prepare booking data
        const bookingData = {
            id: 'BK' + Date.now().toString().slice(-6),
            timestamp: new Date().toISOString(),
            name: formData.get('name'),
            phone: formData.get('phone'),
            service: formData.get('serviceType'),
            hours: formData.get('hours'),
            location: formData.get('location'),
            date: formData.get('bookingDate'),
            time: formData.get('bookingTime'),
            status: 'pending',
            estimatedFare: document.getElementById('fareEstimate').textContent
        };
        
        // Save to localStorage
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        bookings.push(bookingData);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        showNotification('Booking submitted successfully! We will contact you shortly.', 'success');
        form.reset();
        
    } catch (error) {
        console.error('Error submitting booking:', error);
        showNotification('Failed to submit booking. Please try again or contact us directly.', 'error');
    }
}

// Notification system
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Mobile Menu Toggle
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navList = document.querySelector('.nav-list');
    
    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navList.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !navList.contains(e.target)) {
                menuToggle.classList.remove('active');
                navList.classList.remove('active');
            }
        });

        // Close menu when clicking a link
        navList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navList.classList.remove('active');
            });
        });
    }
}

// Handle service selection from URL parameters
function handleServiceSelection() {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceType = urlParams.get('service');
    
    if (serviceType && formElements.serviceType) {
        // Map URL parameter to select option value
        const serviceMap = {
            'morning': 'Daily Driver Service',
            'tour': 'Outstation Trips',
            'hourly': 'Corporate Service',
            'night': 'Airport Transfer'
        };
        
        const serviceValue = serviceMap[serviceType];
        if (serviceValue) {
            formElements.serviceType.value = serviceValue;
            // Trigger fare calculation
            if (typeof updateFareEstimate === 'function') {
                updateFareEstimate();
            }
            // Scroll to booking form
            formElements.serviceType.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize testimonial carousel
    const carousel = new TestimonialCarousel();
    
    // Initialize booking history
    const bookingHistory = new BookingHistory();
    bookingHistory.displayBookingHistory();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize form elements
    formElements.form = document.getElementById('bookingForm');
    formElements.serviceType = document.getElementById('serviceType');
    formElements.hours = document.getElementById('hours');
    formElements.fareEstimate = document.getElementById('fareEstimate');
    formElements.pickupDate = document.getElementById('bookingDate');
    formElements.pickupTime = document.getElementById('bookingTime');
    
    // Handle service selection from URL
    handleServiceSelection();
    
    // Initialize form validation and other features
    if (formElements.form) {
        formElements.form.addEventListener('submit', handleFormSubmit);
        
        // Add event listeners for form fields
        if (formElements.serviceType) {
            formElements.serviceType.addEventListener('change', updateFareEstimate);
        }
        if (formElements.hours) {
            formElements.hours.addEventListener('change', updateFareEstimate);
            formElements.hours.addEventListener('input', updateFareEstimate);
        }
        
        // Initialize location services
        const locationBtn = document.getElementById('getLocation');
        if (locationBtn) {
            locationBtn.addEventListener('click', getUserLocation);
        }
    }

    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 50,
            delay: 0,
            mirror: false,
            anchorPlacement: 'top-bottom',
            disable: 'mobile'
        });
    }

    // Initialize location autocomplete
    initLocationAutocomplete();
});

// Update fare estimate based on service type and hours
function updateFareEstimate() {
    if (!formElements.serviceType || !formElements.hours || !formElements.fareEstimate) return;
    
    const serviceType = formElements.serviceType.value;
    const hours = parseInt(formElements.hours.value) || 0;
    let totalFare = 0;

    // Rate calculation based on service type
    switch(serviceType) {
        case 'morning':
            // Morning Rate: 8 hours - ₹1000
            if (hours <= 8) {
                totalFare = 1000;
            } else {
                totalFare = 1000 + ((hours - 8) * 250); // Additional hours at ₹250/hour
            }
            break;
        
        case 'afternoon':
            // Afternoon Rate: 5 hours - ₹1000
            if (hours <= 5) {
                totalFare = 1000;
            } else {
                totalFare = 1000 + ((hours - 5) * 250);
            }
            break;
        
        case 'hourly':
            // Hourly Rate: ₹250 per hour
            totalFare = hours * 250;
            break;
        
        case 'night':
            // Night Rate: 2 hours - ₹750
            if (hours <= 2) {
                totalFare = 750;
            } else {
                totalFare = 750 + ((hours - 2) * 250); // Night additional hours at ₹250/hour
            }
            break;
        
        case 'tour':
            // Tour Rate: 12 hours - ₹1500
            if (hours <= 12) {
                totalFare = 1500;
            } else {
                totalFare = 1500 + ((hours - 12) * 250);
            }
            break;
        
        case 'night_stay':
            // Night Stay Rate: ₹250 per hour
            totalFare = hours * 250;
            break;
    }

    // Update the fare display
    formElements.fareEstimate.textContent = `₹${totalFare.toFixed(2)}`;
    
    // Show rate details if the element exists
    const rateDetails = document.getElementById('rateDetails');
    if (rateDetails) {
        let detailsText = '';
        switch(serviceType) {
            case 'morning':
                detailsText = 'Base rate: ₹1000 for 8 hours\nAdditional hours: ₹250/hour';
                break;
            case 'afternoon':
                detailsText = 'Base rate: ₹1000 for 5 hours\nAdditional hours: ₹250/hour';
                break;
            case 'hourly':
                detailsText = 'Standard hourly rate: ₹250/hour';
                break;
            case 'night':
                detailsText = 'Base rate: ₹750 for 2 hours\nAdditional hours: ₹250/hour';
                break;
            case 'tour':
                detailsText = 'Base rate: ₹1500 for 12 hours\nAdditional hours: ₹250/hour';
                break;
            case 'night_stay':
                detailsText = 'Night stay rate: ₹250/hour';
                break;
        }
        rateDetails.textContent = detailsText;
    }
}

// Initialize location services
function initLocationServices() {
    // Implementation of initLocationServices function
} 