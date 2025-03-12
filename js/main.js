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
            // Central & South Delhi Premium Areas
            'delhi', 'new delhi', 'south delhi', 'lutyens delhi', 'diplomatic enclave',
            'golf links', 'jor bagh', 'sundar nagar', 'amrita shergill marg', 'prithviraj road',
            'aurangzeb road', 'shanti path', 'vasant vihar', 'west end', 'anand niketan',
            'greater kailash', 'gk-1', 'gk-2', 'defence colony', 'maharani bagh',
            'panchsheel park', 'hauz khas', 'safdarjung enclave', 'vasant kunj',
            'new friends colony', 'south extension', 'andrews ganj', 'gulmohar park',
            'neeti bagh', 'shanti niketan', 'westend', 'satya niketan', 'sarita vihar',
            'alaknanda', 'cr park', 'chittaranjan park', 'east of kailash', 'kailash colony',
            'malviya nagar', 'sarvapriya vihar', 'sarvodaya enclave', 'green park',
            'uday park', 'masjid moth', 'khel gaon', 'asiad village', 'siri fort',
            'anand lok', 'gulmohar park', 'gautam nagar', 'jangpura', 'jangpura extension',
            'bhogal', 'nizamuddin east', 'nizamuddin west', 'sunder nagar', 'pandara road',
            'khan market', 'lodhi colony', 'lodhi road', 'golf links', 'bharti nagar',

            // West & North Delhi Areas
            'rajouri garden', 'punjabi bagh', 'paschim vihar', 'kirti nagar', 'moti nagar',
            'model town', 'gujranwala town', 'hudson lines', 'mukherjee nagar', 'civil lines',
            'kamla nagar', 'shakti nagar', 'roop nagar', 'vijay nagar', 'ashok vihar',
            'shalimar bagh', 'pitampura', 'prashant vihar', 'rohini sector 3', 'rohini sector 7',
            'rohini sector 8', 'rohini sector 9', 'rohini sector 13', 'rohini sector 14',
            'paschim puri', 'jwala heri', 'vikaspuri', 'uttam nagar', 'dwarka sector 2',
            'dwarka sector 4', 'dwarka sector 6', 'dwarka sector 7', 'dwarka sector 9',
            'dwarka sector 10', 'dwarka sector 11', 'dwarka sector 12', 'dwarka sector 13',
            'dwarka sector 14', 'dwarka sector 19', 'dwarka sector 22', 'dwarka sector 23',

            // East Delhi Areas
            'mayur vihar phase 1', 'mayur vihar phase 2', 'mayur vihar phase 3',
            'patparganj', 'preet vihar', 'nirman vihar', 'laxmi nagar', 'shakarpur',
            'pandav nagar', 'mother dairy', 'mandawali', 'ip extension', 'surajmal vihar',
            'vivek vihar', 'dilshad garden', 'jhilmil colony', 'vishwas nagar', 'shahdara',
            'geeta colony', 'gandhi nagar', 'karkardooma', 'anand vihar', 'vaishali',
            'yamuna vihar', 'bhajanpura', 'maujpur', 'gokulpuri', 'krishna nagar',

            // Premium Gurgaon Areas
            'gurgaon', 'gurugram', 'dlf city', 'dlf phase 1', 'dlf phase 2', 'dlf phase 3',
            'dlf phase 4', 'dlf phase 5', 'golf course road', 'golf course extension',
            'magnolias', 'the camellias', 'the aralias', 'palm springs', 'beverly park',
            'cyber city', 'cyber hub', 'ambience island', 'udyog vihar', 'sushant lok',
            'nirvana country', 'central park', 'emaar mgf palm drive', 'palm springs',
            'sector 42', 'sector 43', 'sector 27', 'sector 28', 'sector 54', 'sector 55',
            'sector 56', 'sector 57', 'sector 58', 'sector 59', 'sector 60', 'ardee city',
            'south city 1', 'south city 2', 'suncity', 'vipul world', 'malibu town',
            'uniworld gardens', 'vatika city', 'vatika india next', 'uppal southend',
            'sector 45', 'sector 46', 'sector 47', 'sector 50', 'sector 51', 'sector 52',
            'mg road', 'sohna road', 'golf course extension road', 'subhash chowk',
            'rajiv chowk', 'iffco chowk', 'signature tower', 'huda city centre',

            // Premium Noida Areas
            'noida', 'greater noida', 'noida expressway', 'sector 15a', 'sector 16a',
            'sector 26', 'sector 27', 'sector 28', 'sector 29', 'sector 30', 'sector 31',
            'sector 32', 'sector 39', 'sector 44', 'sector 45', 'sector 47', 'sector 50',
            'sector 93', 'sector 94', 'sector 125', 'sector 128', 'sector 131', 'sector 137',
            'jaypee greens', 'wish town', 'sector alpha', 'delta', 'gamma', 'film city',
            'sector 61', 'sector 62', 'sector 63', 'sector 64', 'sector 65', 'sector 66',
            'sector 67', 'sector 68', 'sector 70', 'sector 71', 'sector 72', 'sector 73',
            'sector 74', 'sector 75', 'sector 76', 'sector 77', 'sector 78', 'sector 79',
            'sector 82', 'sector 83', 'sector 84', 'sector 85', 'sector 86', 'sector 87',
            'sector 88', 'sector 89', 'sector 90', 'sector 91', 'sector 92', 'sector 93',
            'sector 100', 'sector 104', 'sector 105', 'sector 106', 'sector 107',
            'botanical garden', 'golf course', 'wave city center', 'logix city center',
            'dlf mall of india', 'great india place', 'worlds of wonder',

            // Greater Noida Areas
            'alpha 1', 'alpha 2', 'beta 1', 'beta 2', 'gamma 1', 'gamma 2', 'delta 1',
            'delta 2', 'delta 3', 'knowledge park 1', 'knowledge park 2', 'knowledge park 3',
            'knowledge park 4', 'knowledge park 5', 'chi phi', 'omicron', 'xu', 'zeta',
            'pari chowk', 'gaur city 1', 'gaur city 2', 'tech zone', 'greater noida west',
            'noida extension', 'yamuna expressway', 'yeida', 'jaypee sports city',

            // Premium Faridabad Areas
            'faridabad', 'greenfields colony', 'sector 14', 'sector 15', 'sector 16',
            'sector 17', 'sector 21a', 'sector 21b', 'sector 21c', 'sector 21d',
            'surajkund', 'sainik colony', 'charmwood village', 'sector 28', 'sector 29',
            'sector 30', 'sector 31', 'sector 37', 'sector 46', 'sector 48', 'sector 49',
            'sector 75', 'sector 76', 'sector 77', 'sector 78', 'sector 79', 'sector 80',
            'sector 81', 'sector 82', 'sector 83', 'sector 84', 'sector 85', 'sector 86',
            'sector 87', 'sector 88', 'neharpar', 'greater faridabad',

            // Premium Ghaziabad Areas
            'ghaziabad', 'raj nagar extension', 'kavi nagar', 'vaishali', 'indirapuram',
            'crossings republik', 'ahinsa khand', 'shakti khand', 'niti khand',
            'raj nagar', 'govindpuram', 'shastri nagar', 'nehru nagar', 'shalimar garden',
            'surya nagar', 'kaushambi', 'vasundhara sector 1', 'vasundhara sector 2',
            'vasundhara sector 3', 'vasundhara sector 4', 'vasundhara sector 5',
            'vasundhara sector 13', 'vasundhara sector 16', 'sahibabad', 'mohan nagar',
            'pratap vihar', 'delta colonies', 'brij vihar', 'ramprastha', 'pacific mall',
            'mahagun mall', 'gaur central mall',

            // Airport & Transport Hubs
            'igi airport', 'indira gandhi airport', 'terminal 3', 't3', 'terminal 2', 't2',
            'terminal 1', 't1', 'domestic airport', 'cargo terminal', 'aerocity',
            'worldmark aerocity', 'holiday inn aerocity', 'pullman aerocity',
            'anand vihar isbt', 'kashmere gate isbt', 'sarai kale khan isbt',
            'new delhi railway station', 'old delhi railway station', 'hazrat nizamuddin railway station',
            'delhi cantt railway station', 'ghaziabad railway station', 'noida city center',
            'botanical garden metro', 'huda city centre metro', 'mg road metro',
            'rajiv chowk metro', 'kashmere gate metro', 'welcome metro',

            // Business & Shopping Districts
            'nehru place', 'bhikaji cama place', 'jasola', 'aerocity', 'india gate',
            'pragati maidan', 'ito', 'barakhamba road', 'okhla industrial area',
            'naraina industrial area', 'wazirpur industrial area', 'saket mall',
            'dlf promenade', 'dlf emporio', 'the chanakya', 'select citywalk',
            'ambience mall', 'pacific mall', 'vegas mall', 'v3s mall', 'cross river mall',
            'east delhi mall', 'unity one mall', 'metro walk mall', 'city centre mall',
            'gaur central mall', 'logix city centre', 'dlf mall of india', 'great india place',
            'ansal plaza', 'v3s mall', 'shipra mall', 'mahagun metro mall', 'opulent mall',
            'pacific mall', 'gaur city mall', 'star city mall', 'wave mall'
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