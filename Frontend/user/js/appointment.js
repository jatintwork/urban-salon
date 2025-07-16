// js/appointment.js

const API_BASE = "http://127.0.0.1:7002/services";

// Global variables to store services data
let servicesData = {};

// Initialize appointment form functionality
document.addEventListener('DOMContentLoaded', function() {
    // Wait for navbar to load before initializing appointment form
    setTimeout(function() {
        initializeAppointmentForm();
        loadServices();
        setupDateTimeValidation();
        
        // Check login status and populate address
        updateAppointmentFormState();
        
        // Check login status periodically (every 30 seconds)
        setInterval(updateAppointmentFormState, 30000);
    }, 1000); // Wait 1 second for navbar to load
});

// Override the shared checkUserAuthentication to also update appointment form
const originalCheckUserAuthentication = window.checkUserAuthentication;
window.checkUserAuthentication = function() {
    // Call the original function
    if (originalCheckUserAuthentication) {
        originalCheckUserAuthentication();
    }
    
    // Also update appointment form state
    updateAppointmentFormState();
};

// Initialize the appointment form
function initializeAppointmentForm() {
    const form = document.getElementById('appointmentForm');
    if (form) {
        form.addEventListener('submit', handleAppointmentSubmit);
        
        // Check login status and update form accordingly
        updateAppointmentFormState();
    }
}

// Update appointment form state based on authentication
function updateAppointmentFormState() {
    // Use the shared authentication check from auth.js
    const userData = localStorage.getItem('urbanSalonUser') || sessionStorage.getItem('urbanSalonUser');
    const submitBtn = document.querySelector('#appointmentForm button[type="submit"]');
    
    if (!userData) {
        // User not logged in - disable form and show message
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-lock me-2"></i>Login Required to Book';
            submitBtn.disabled = true;
            submitBtn.classList.remove('btn-primary');
            submitBtn.classList.add('btn-secondary');
        }
        
        // Add login prompt message
        addLoginPrompt();
        
        // Disable all form fields
        disableFormFields();
        
    } else {
        try {
            // Parse user data to ensure it's valid
            const user = JSON.parse(userData);
            
            // User is logged in - enable form
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-calendar-plus me-2"></i>Book Appointment';
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn-secondary');
                submitBtn.classList.add('btn-primary');
            }
            
            // Remove login prompt if exists
            removeLoginPrompt();
            
            // Enable all form fields
            enableFormFields();
            
            // Populate address from user data
            populateAddressFromStorage();
            
        } catch (error) {
            console.error('Error parsing user data in appointment:', error);
            // Clear invalid data and show login state
            localStorage.removeItem('urbanSalonUser');
            sessionStorage.removeItem('urbanSalonUser');
            
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-lock me-2"></i>Login Required to Book';
                submitBtn.disabled = true;
                submitBtn.classList.remove('btn-primary');
                submitBtn.classList.add('btn-secondary');
            }
            
            addLoginPrompt();
            disableFormFields();
        }
    }
}

// Add login prompt message
function addLoginPrompt() {
    const form = document.getElementById('appointmentForm');
    if (!form) return;
    
    // Remove existing prompt if any
    removeLoginPrompt();
    
    // Create login prompt
    const loginPrompt = document.createElement('div');
    loginPrompt.id = 'loginPrompt';
    loginPrompt.className = 'alert alert-warning mb-3';
    loginPrompt.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-exclamation-triangle me-3 fa-2x"></i>
            <div>
                <h6 class="mb-1">Login Required</h6>
                <p class="mb-2">You need to be logged in to book an appointment.</p>
                <button type="button" class="btn btn-warning btn-sm" onclick="goToLogin()">
                    <i class="fas fa-sign-in-alt me-2"></i>Go to Login
                </button>
            </div>
        </div>
    `;
    
    // Insert at the beginning of the form
    form.insertBefore(loginPrompt, form.firstChild);
}

// Remove login prompt message
function removeLoginPrompt() {
    const existingPrompt = document.getElementById('loginPrompt');
    if (existingPrompt) {
        existingPrompt.remove();
    }
}

// Disable form fields
function disableFormFields() {
    const form = document.getElementById('appointmentForm');
    if (!form) return;
    
    const fields = form.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
        field.disabled = true;
        field.style.opacity = '0.6';
    });
}

// Enable form fields
function enableFormFields() {
    const form = document.getElementById('appointmentForm');
    if (!form) return;
    
    const fields = form.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
        field.disabled = false;
        field.style.opacity = '1';
    });
}

// Go to login page
function goToLogin() {
    // Store current page to redirect back after login
    sessionStorage.setItem('redirectAfterLogin', window.location.href);
    window.location.href = 'login.html';
}

// Populate address from localStorage
function populateAddressFromStorage() {
    const userData = localStorage.getItem('urbanSalonUser') || sessionStorage.getItem('urbanSalonUser');
    const addressField = document.getElementById('address');
    
    if (!addressField) return;
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            if (user.address) {
                // Set the address value
                addressField.value = user.address;
                
                // Make address field read-only since it comes from user profile
                addressField.readOnly = true;
                addressField.style.backgroundColor = '#f8f9fa';
                addressField.style.borderColor = '#28a745';
                
                // Add a visual indicator
                const addressLabel = addressField.parentElement.querySelector('label');
                if (addressLabel) {
                    addressLabel.innerHTML = '<i class="fas fa-map-marker-alt text-success me-2"></i>Service Address (from your profile)';
                }
                
                // Add a small info badge
                const addressInfo = document.getElementById('addressInfo');
                if (addressInfo) {
                    addressInfo.innerHTML = '<small class="text-success"><i class="fas fa-info-circle me-1"></i>Address loaded from your profile</small>';
                }
                
                         } else {
                 // No address in profile, make it editable
                 addressField.placeholder = "Please enter your service address";
                 addressField.readOnly = false;
                 addressField.style.backgroundColor = '';
                 addressField.style.borderColor = '';
                 
                 const addressLabel = addressField.parentElement.querySelector('label');
                 if (addressLabel) {
                     addressLabel.innerHTML = '<i class="fas fa-map-marker-alt text-primary me-2"></i>Service Address';
                 }
                 
                 // Show message that no address found in profile
                 const addressInfo = document.getElementById('addressInfo');
                 if (addressInfo) {
                     addressInfo.innerHTML = '<small class="text-warning"><i class="fas fa-exclamation-triangle me-1"></i>No address found in profile. Please enter your service address.</small>';
                 }
             }
                 } catch (error) {
             console.error('Error parsing user data:', error);
             // Fallback to editable field
             addressField.placeholder = "Please enter your service address";
             addressField.readOnly = false;
             
             const addressInfo = document.getElementById('addressInfo');
             if (addressInfo) {
                 addressInfo.innerHTML = '<small class="text-warning"><i class="fas fa-exclamation-triangle me-1"></i>Please enter your service address.</small>';
             }
         }
         } else {
         // No user data, make it editable
         addressField.placeholder = "Please enter your service address";
         addressField.readOnly = false;
         
         const addressLabel = addressField.parentElement.querySelector('label');
         if (addressLabel) {
             addressLabel.innerHTML = '<i class="fas fa-map-marker-alt text-primary me-2"></i>Service Address';
         }
         
         const addressInfo = document.getElementById('addressInfo');
         if (addressInfo) {
             addressInfo.innerHTML = '<small class="text-warning"><i class="fas fa-exclamation-triangle me-1"></i>Please log in to auto-fill your address.</small>';
         }
     }
}

// Load services from API
async function loadServices() {
    try {
        const response = await fetch(`${API_BASE}/all-services/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        });

        if (!response.ok) {
            throw new Error('Failed to fetch services');
        }

        servicesData = await response.json();
        populateServiceDropdowns();
    } catch (error) {
        console.error('Error loading services:', error);
        showNotification('Failed to load services. Please refresh the page.', 'error');
    }
}

// Populate service category and sub-service dropdowns
function populateServiceDropdowns() {
    const categorySelect = document.getElementById('serviceCategory');
    const subServiceSelect = document.getElementById('subService');
    
    if (!categorySelect || !subServiceSelect) return;

    // Clear existing options
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    subServiceSelect.innerHTML = '<option value="">Select Service</option>';

    // Populate categories
    Object.keys(servicesData).forEach(categoryId => {
        const category = servicesData[categoryId];
        if (category.services && category.services.length > 0) {
            const option = document.createElement('option');
            option.value = categoryId;
            option.textContent = category.category_name;
            categorySelect.appendChild(option);
        }
    });

    // Add event listener for category change
    categorySelect.addEventListener('change', function() {
        const selectedCategoryId = this.value;
        populateSubServices(selectedCategoryId);
    });
}

// Populate sub-services based on selected category
function populateSubServices(categoryId) {
    const subServiceSelect = document.getElementById('subService');
    if (!subServiceSelect) return;

    // Clear existing options
    subServiceSelect.innerHTML = '<option value="">Select Service</option>';

    if (!categoryId || !servicesData[categoryId]) return;

    const category = servicesData[categoryId];
    if (category.services && category.services.length > 0) {
        category.services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = `${service.name} - ₹${service.price}`;
            option.dataset.price = service.price;
            option.dataset.description = service.description;
            subServiceSelect.appendChild(option);
        });
    }
    
    // Add event listener for sub-service selection
    subServiceSelect.addEventListener('change', function() {
        showServiceDetails(this.value);
    });
}

// Show service details when sub-service is selected
function showServiceDetails(serviceId) {
    const serviceDetailsContainer = document.getElementById('serviceDetails');
    if (!serviceDetailsContainer) return;
    
    if (!serviceId) {
        serviceDetailsContainer.innerHTML = '';
        serviceDetailsContainer.style.display = 'none';
        return;
    }
    
    // Find the selected service
    let selectedService = null;
    for (const categoryId in servicesData) {
        const category = servicesData[categoryId];
        if (category.services) {
            selectedService = category.services.find(service => service.id === serviceId);
            if (selectedService) break;
        }
    }
    
    if (selectedService) {
        serviceDetailsContainer.innerHTML = `
            <div class="card border-primary">
                <div class="card-header bg-primary text-white">
                    <h6 class="mb-0"><i class="fas fa-info-circle me-2"></i>Service Details</h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <h6 class="text-primary">${selectedService.name}</h6>
                            <p class="mb-2">${selectedService.description}</p>
                        </div>
                        <div class="col-md-4 text-end">
                            <h5 class="text-success mb-0">₹${selectedService.price}</h5>
                            <small class="text-muted">Service Price</small>
                        </div>
                    </div>
                  
                </div>
            </div>
        `;
        serviceDetailsContainer.style.display = 'block';
    }
}

// Proceed to payment page with service details
function proceedToPayment(serviceId, serviceName, servicePrice, serviceDescription) {
    // Get user's address
    const address = document.getElementById('address').value.trim();
    
    // Create payment data
    const paymentData = {
        service_id: serviceId,
        service_name: serviceName,
        service_price: servicePrice,
        service_description: serviceDescription,
        location: address,
        user_email: JSON.parse(localStorage.getItem('urbanSalonUser') || sessionStorage.getItem('urbanSalonUser')).email
    };
    
    // Store payment data
    sessionStorage.setItem('paymentData', JSON.stringify(paymentData));
    
    // Redirect to payment page
    window.location.href = 'payment.html';
}

// Setup date and time validation
function setupDateTimeValidation() {
    const dateInput = document.getElementById('appointmentDate');
    const timeInput = document.getElementById('appointmentTime');

    if (dateInput) {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;

        // Add change event listener for date validation
        dateInput.addEventListener('change', function() {
            validateDateTime();
        });
    }

    if (timeInput) {
        // Generate 24-hour time options
        generateTimeOptions();
        
        // Add change event listener for time validation
        timeInput.addEventListener('change', function() {
            validateDateTime();
        });
    }
}

// Generate 24-hour time options
function generateTimeOptions() {
    const timeSelect = document.getElementById('appointmentTime');
    if (!timeSelect) return;

    // Clear existing options
    timeSelect.innerHTML = '<option value="">Select Time</option>';

    // Generate time slots from 00:00 to 23:00 (24-hour format)
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) { // 30-minute intervals
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const displayTime = formatTimeForDisplay(timeString);
            
            const option = document.createElement('option');
            option.value = timeString;
            option.textContent = displayTime;
            timeSelect.appendChild(option);
        }
    }
}

// Format time for display (12-hour format)
function formatTimeForDisplay(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Validate date and time selection
function validateDateTime() {
    const dateInput = document.getElementById('appointmentDate');
    const timeInput = document.getElementById('appointmentTime');
    
    if (!dateInput || !timeInput) return;

    const selectedDate = dateInput.value;
    const selectedTime = timeInput.value;

    if (selectedDate && selectedTime) {
        const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
        const now = new Date();

        // Check if selected date/time is in the past
        if (selectedDateTime <= now) {
            showNotification('Please select a future date and time.', 'warning');
            timeInput.value = '';
            return false;
        }

        // Check if selected date is today and time is in the past
        const today = new Date().toISOString().split('T')[0];
        if (selectedDate === today) {
            const currentTime = new Date().toTimeString().slice(0, 5);
            if (selectedTime <= currentTime) {
                showNotification('Please select a future time for today.', 'warning');
                timeInput.value = '';
                return false;
            }
        }
    }

    return true;
}

// Validate form fields
function validateForm() {
    const requiredFields = [
        'address',
        'serviceCategory',
        'subService',
        'appointmentDate',
        'appointmentTime'
    ];

    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            showNotification(`Please fill in the ${fieldId.replace(/([A-Z])/g, ' $1').toLowerCase()}.`, 'warning');
            field?.focus();
            return false;
        }
    }

    return true;
}

// Get form data
function getFormData() {
    const userData = JSON.parse(localStorage.getItem('urbanSalonUser') || sessionStorage.getItem('urbanSalonUser'));
    
    // Combine date and time into ISO datetime string
    const appointmentDate = document.getElementById('appointmentDate').value;
    const appointmentTime = document.getElementById('appointmentTime').value;
    const scheduledDateTime = `${appointmentDate}T${appointmentTime}:00`;
    
    return {
        service_id: document.getElementById('subService').value,
        sub_service_id: document.getElementById('subService').value, // Send sub-service ID as well
        scheduled_datetime: scheduledDateTime,
        location: document.getElementById('address').value.trim(),
        email: userData.email // Include user's email in payload
    };
}

// Submit appointment to backend
async function submitAppointment(formData) {
    const userData = JSON.parse(localStorage.getItem('urbanSalonUser') || sessionStorage.getItem('urbanSalonUser'));
    
    console.log('Sending appointment data:', formData); // Debug log
    
    const response = await fetch(`${API_BASE}/create-service-request/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.access_token}`
        },
        body: JSON.stringify(formData)
    });

    console.log('Response status:', response.status); // Debug log

    // Handle 201 Created status
    if (response.status === 201) {
        const responseData = await response.json();
        console.log('201 Response data:', responseData); // Debug log
        return responseData;
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('Error response:', errorData); // Debug log
        throw new Error(errorData.message || 'Failed to submit appointment');
    }

    const responseData = await response.json();
    console.log('Success response data:', responseData); // Debug log
    return responseData;
}

// Handle successful booking with payment redirect
function handleSuccessfulBooking(responseData) {
    console.log('Handling successful booking with data:', responseData); // Debug log
    
    // Show success message with response data
    let successMessage = 'Appointment booked successfully!';
    
    if (responseData) {
        // Check if response has a message field
        if (responseData.message) {
            successMessage = responseData.message; // Use the response message
        }
        
        successMessage += '\n\nBooking Details:';
        
        // Display all available response data
        if (responseData.id) successMessage += `\nBooking ID: ${responseData.id}`;
        if (responseData.service) successMessage += `\nService: ${responseData.service}`;
        if (responseData.sub_service) successMessage += `\nSub Service: ${responseData.sub_service}`;
        if (responseData.scheduled_datetime) successMessage += `\nDate & Time: ${new Date(responseData.scheduled_datetime).toLocaleString()}`;
        if (responseData.location) successMessage += `\nLocation: ${responseData.location}`;
        if (responseData.status) successMessage += `\nStatus: ${responseData.status}`;
        if (responseData.email) successMessage += `\nEmail: ${responseData.email}`;
        if (responseData.client) successMessage += `\nClient: ${responseData.client}`;
        if (responseData.created_at) successMessage += `\nCreated: ${new Date(responseData.created_at).toLocaleString()}`;
    }
    
    showNotification(successMessage, 'success');
    
    // Store booking data for future use
    if (responseData) {
        sessionStorage.setItem('bookingData', JSON.stringify(responseData));
    }
    
    // Get selected service details for future payment reference
    const selectedServiceId = document.getElementById('subService').value;
    let selectedService = null;
    
    if (selectedServiceId) {
        for (const categoryId in servicesData) {
            const category = servicesData[categoryId];
            if (category.services) {
                selectedService = category.services.find(service => service.id === selectedServiceId);
                if (selectedService) break;
            }
        }
    }
    
    // Store service details for future payment (optional)
    if (selectedService) {
        const address = document.getElementById('address').value.trim();
        const paymentData = {
            service_id: selectedService.id,
            service_name: selectedService.name,
            service_price: selectedService.price,
            service_description: selectedService.description,
            location: address,
            user_email: JSON.parse(localStorage.getItem('urbanSalonUser') || sessionStorage.getItem('urbanSalonUser')).email,
            booking_id: responseData.id,
            scheduled_datetime: document.getElementById('appointmentDate').value + 'T' + document.getElementById('appointmentTime').value + ':00'
        };
        
        // Store payment data for future use
        sessionStorage.setItem('paymentData', JSON.stringify(paymentData));
    }
    
    // No automatic redirect - user stays on appointment page
}

// Handle appointment form submission
async function handleAppointmentSubmit(event) {
    event.preventDefault();

    // Check if user is logged in
    const userData = localStorage.getItem('urbanSalonUser') || sessionStorage.getItem('urbanSalonUser');
    if (!userData) {
        showNotification('Please log in to book an appointment.', 'error');
        goToLogin();
        return;
    }

    // Validate form
    if (!validateForm()) {
        return;
    }

    // Validate date and time
    if (!validateDateTime()) {
        return;
    }

    // Get form data
    const formData = getFormData();
    
    try {
        // Show loading state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Booking...';
        submitBtn.disabled = true;

        // Submit appointment
        const response = await submitAppointment(formData);
        
        console.log('Appointment response:', response); // Debug log
        
        // Handle successful booking - check for response data or message
        if (response && (response.success || response.id || response.status === 201 || response.message || Object.keys(response).length > 0)) {
            // Handle successful booking
            handleSuccessfulBooking(response);
            
            // Reset form
            event.target.reset();
            // Reset service dropdowns
            populateServiceDropdowns();
            // Re-populate address
            populateAddressFromStorage();
            // Hide service details
            const serviceDetails = document.getElementById('serviceDetails');
            if (serviceDetails) {
                serviceDetails.style.display = 'none';
            }
        } else {
            console.log('No response data or failed condition'); // Debug log
            showNotification(response?.message || 'Failed to book appointment.', 'error');
        }
    } catch (error) {
        console.error('Error booking appointment:', error);
        showNotification('An error occurred while booking your appointment.', 'error');
    } finally {
        // Reset button state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // You can implement your own notification system or use a library
    alert(message);
}

// Export functions for global access
window.validateDateTime = validateDateTime;
window.handleAppointmentSubmit = handleAppointmentSubmit;
window.goToLogin = goToLogin;
window.proceedToPayment = proceedToPayment;
window.showServiceDetails = showServiceDetails; 