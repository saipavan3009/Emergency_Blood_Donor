// Initial donor data
let donors = [
    { id: 1, name: "Rahul Sharma", blood: "A+", location: "Hyderabad", phone: "9876543210", registeredDate: "2024-01-15" },
    { id: 2, name: "Lakshmi Devi", blood: "O-", location: "Vijayawada", phone: "9123456780", registeredDate: "2024-02-20" },
    { id: 3, name: "Ramesh Kumar", blood: "B+", location: "Chennai", phone: "9988776655", registeredDate: "2024-03-10" },
    { id: 4, name: "Aisha Khan", blood: "AB+", location: "Bangalore", phone: "9090909090", registeredDate: "2024-04-05" }
];

// Load saved donors from localStorage
if (localStorage.getItem("donorData")) {
    donors = JSON.parse(localStorage.getItem("donorData"));
}

// Save donors to localStorage
function saveData() {
    localStorage.setItem("donorData", JSON.stringify(donors));
}

// Navigation between pages
function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Show selected page
    document.getElementById(page + 'Page').classList.add('active');
    
    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-page') === page) {
            btn.classList.add('active');
        }
    });

    // Update content based on page
    if (page === 'home') {
        updateStats();
    } else if (page === 'donors') {
        displayAllDonors();
    }
}

// Update statistics on home page
function updateStats() {
    document.getElementById('totalDonors').textContent = donors.length;
    
    const uniqueBloodGroups = new Set(donors.map(d => d.blood));
    document.getElementById('totalBloodGroups').textContent = uniqueBloodGroups.size;
    
    const uniqueLocations = new Set(donors.map(d => d.location));
    document.getElementById('totalLocations').textContent = uniqueLocations.size;
}

// Validate phone number (Indian format)
function validatePhone(phone) {
    return /^[6-9]\d{9}$/.test(phone);
}

// Clear all error messages
function clearErrors() {
    document.querySelectorAll('.error-message').forEach(error => {
        error.textContent = '';
    });
    document.querySelectorAll('.form-input').forEach(input => {
        input.classList.remove('error');
    });
}

// Show error message
function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    const inputElement = document.getElementById(fieldId);
    
    if (errorElement) {
        errorElement.textContent = message;
    }
    if (inputElement) {
        inputElement.classList.add('error');
    }
}

// Validate registration form
function validateForm() {
    clearErrors();
    let isValid = true;

    const name = document.getElementById('name').value.trim();
    const blood = document.getElementById('blood').value;
    const location = document.getElementById('location').value.trim();
    const phone = document.getElementById('phone').value;

    if (!name) {
        showError('name', 'Name is required');
        isValid = false;
    } else if (name.length < 3) {
        showError('name', 'Name must be at least 3 characters');
        isValid = false;
    }

    if (!blood) {
        showError('blood', 'Blood group is required');
        isValid = false;
    }

    if (!location) {
        showError('location', 'Location is required');
        isValid = false;
    }

    if (!phone) {
        showError('phone', 'Phone number is required');
        isValid = false;
    } else if (!validatePhone(phone)) {
        showError('phone', 'Invalid phone number (10 digits starting with 6-9)');
        isValid = false;
    }

    return isValid;
}

// Show success toast
function showSuccess() {
    const toast = document.getElementById('successToast');
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Register new donor
function registerDonor() {
    if (!validateForm()) {
        return;
    }

    const name = document.getElementById('name').value.trim();
    const blood = document.getElementById('blood').value.toUpperCase();
    const location = document.getElementById('location').value.trim();
    const phone = document.getElementById('phone').value;

    const newDonor = {
        id: Date.now(),
        name: name,
        blood: blood,
        location: location,
        phone: phone,
        registeredDate: new Date().toISOString().split('T')[0]
    };

    donors.unshift(newDonor);
    saveData();
    
    // Clear form
    document.getElementById('name').value = '';
    document.getElementById('blood').value = '';
    document.getElementById('location').value = '';
    document.getElementById('phone').value = '';
    
    clearErrors();
    showSuccess();
}

// Create donor card HTML
function createDonorCard(donor, showDelete = false) {
    const date = new Date(donor.registeredDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });

    return `
        <div class="donor-card">
            <div class="donor-card-header">
                <div class="donor-info">
                    <div class="donor-avatar">💧</div>
                    <div class="donor-name">${donor.name}</div>
                    <span class="donor-blood">${donor.blood}</span>
                </div>
                ${showDelete ? `<button class="delete-btn" onclick="deleteDonor(${donor.id})" title="Remove donor">✕</button>` : ''}
            </div>
            <div class="donor-details">
                <div class="donor-detail">
                    <span class="donor-detail-icon">📍</span>
                    <span>${donor.location}</span>
                </div>
                <div class="donor-detail">
                    <span class="donor-detail-icon">📞</span>
                    <a href="tel:${donor.phone}">${donor.phone}</a>
                </div>
                ${donor.registeredDate ? `<div class="donor-date">Registered: ${date}</div>` : ''}
            </div>
        </div>
    `;
}

// Display all donors
function displayAllDonors() {
    const donorList = document.getElementById('donorList');
    const donorsCount = document.getElementById('donorsCount');
    
    donorsCount.textContent = `${donors.length} registered hero${donors.length !== 1 ? 's' : ''}`;
    
    if (donors.length === 0) {
        donorList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No donors registered yet.</p>';
        return;
    }

    donorList.innerHTML = donors.map(donor => createDonorCard(donor, true)).join('');
}

// Search for donors
function searchDonor() {
    const blood = document.getElementById('searchBlood').value.toUpperCase();
    const location = document.getElementById('searchLocation').value.toLowerCase();

    if (!blood && !location) {
        document.getElementById('searchResults').classList.add('hidden');
        document.getElementById('noResults').classList.add('hidden');
        return;
    }

    const results = donors.filter(donor => {
        const bloodMatch = !blood || donor.blood === blood;
        const locationMatch = !location || donor.location.toLowerCase().includes(location);
        return bloodMatch && locationMatch;
    });

    const searchResults = document.getElementById('searchResults');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');
    const resultsList = document.getElementById('resultsList');

    if (results.length === 0) {
        searchResults.classList.add('hidden');
        noResults.classList.remove('hidden');
        return;
    }

    noResults.classList.add('hidden');
    searchResults.classList.remove('hidden');
    resultsCount.textContent = `Found ${results.length} Matching Donor${results.length !== 1 ? 's' : ''}`;
    resultsList.innerHTML = results.map(donor => createDonorCard(donor, false)).join('');
}

// Delete donor
function deleteDonor(id) {
    if (confirm('Are you sure you want to remove this donor?')) {
        donors = donors.filter(d => d.id !== id);
        saveData();
        displayAllDonors();
        updateStats();
    }
}

// Initialize app on page load
window.addEventListener('DOMContentLoaded', () => {
    updateStats();
    displayAllDonors();
});