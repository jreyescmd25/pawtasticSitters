// Supabase credentials - cloud database set up by Antoine
// URL is the database endpoint, ANON_KEY is the public access key
const SUPABASE_URL = "https://nkerqwvpxcalmcrycddz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_w8R2SnJ_556KppVmF4ULCQ_H3KI1MVo";
const database = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// Handles map initialization - remove if map is not used
let map;

function initMap() {
    const mapEl = document.getElementById("map");
    if (!mapEl) return;
    map = new google.maps.Map(mapEl, {
        zoom: 12,
        center: { lat: 40.7128, lng: -74.0060 },
    });
}

// backend: Replace localStorage with POST /api/login - expects { email, password }
function handleLogin() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    if (!email || !password) {
        alert("Please fill in all fields!");
        return;
    }
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("userEmail", email);
    location.href = "profile.html";
}

let selectedRole = '';
let selectedTags = [];

// Controls which fields show based on role selection
function selectRole(role) {
    selectedRole = role;
    document.getElementById("basicInfo").style.display = "flex";
    document.getElementById("submitBtn").style.display = "block";

    const ownerBtn = document.getElementById("ownerBtn");
    const sitterBtn = document.getElementById("sitterBtn");
    if (ownerBtn) ownerBtn.style.backgroundColor = "rgb(53, 53, 102)";
    if (sitterBtn) sitterBtn.style.backgroundColor = "rgb(53, 53, 102)";
    
    if (role === 'owner' && ownerBtn) ownerBtn.style.backgroundColor = "#7b7bd4";
    if (role === 'sitter' && sitterBtn) sitterBtn.style.backgroundColor = "#7b7bd4";

    if (role === 'sitter') {
        document.getElementById("sitterDetails").style.display = "flex";
    } else {
        document.getElementById("sitterDetails").style.display = "none";
    }
}

// Handles pet specialty tag selection on signup
function toggleTag(btn, tag) {
    if (selectedTags.includes(tag)) {
        selectedTags = selectedTags.filter(t => t !== tag);
        btn.style.backgroundColor = "rgb(53, 53, 102)";
    } else {
        selectedTags.push(tag);
        btn.style.backgroundColor = "#7b7bd4";
    }
}

// backend: Replace localStorage with POST /api/register - expects { firstName, lastName, email, password, username, role, avatar, location, rate, tags }
function handleSignup() {
    const firstName = document.getElementById("signupFirstName").value;
    const lastName = document.getElementById("signupLastName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const confirm = document.getElementById("signupConfirm").value;

    if (!firstName || !lastName || !email || !password || !confirm) {
        alert("Please fill in all fields!");
        return;
    }
    if (password !== confirm) {
        alert("Passwords don't match!");
        return;
    }
    if (selectedRole === '') {
        alert("Please select a role!");
        return;
    }
    if (!email.includes('@') || !email.includes('.')) {
        alert("Please enter a valid email address!");
        return;
    }
    const strongPassword = /^(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!strongPassword.test(password)) {
        alert("Password must be at least 8 characters and include a symbol (!, @, #, etc.)");
        return;
    }
    const username = document.getElementById("signupUsername").value;
    if (!username || username.length < 3) {
        alert("Please enter a valid username!");
        return;
    }
    if (selectedRole === 'sitter') {
        const loc = document.getElementById("sitterLocation").value;
        const rate = document.getElementById("hourlyRate").value;
        if (!loc || !rate || selectedTags.length === 0) {
            alert("Please fill in all sitter details!");
            return;
        }
        localStorage.setItem("userLocation", loc);
        localStorage.setItem("userRate", rate);
        localStorage.setItem("userTags", selectedTags.join(", "));
    }
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("userFirstName", firstName);
    localStorage.setItem("userLastName", lastName);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userRole", selectedRole);
    localStorage.setItem("userAvatar", selectedAvatar);
    localStorage.setItem("userUsername", username);
    location.href = "profile.html";
}

// Fetches real sitters from Supabase database and renders them as cards
// Removes decoy cards and replaces with live data
// BACKEND: Connected to sitters table in Supabase - set up by Antoine
async function loadFeaturedSitters() {
    const grid = document.getElementById("sitterGrid");
    if (!grid) return;

    const { data: sitters, error } = await database.from("sitters").select("*");
    if (error) { console.log(error.message); return; }

    grid.innerHTML = '';
    sitters.forEach(sitter => {
        grid.innerHTML += `
            <div class="sitter-card">
                <div class="sitter-avatar">🐾</div>
                <h3>${sitter.full_name}</h3>
                <p class="sitter-location">${sitter.location}</p>
                <div class="sitter-tags">
                    ${sitter.specialties.map(tag => `<span class="tag">${tag}</span>`).join("")}
                </div>
                <p class="sitter-rate">$${sitter.hourly_rate}/hr</p>
                <button onclick="openModal('${sitter.full_name}')">Message</button>
            </div>
        `;
    });
}

// Runs on page load to populate featured sitters section
window.addEventListener("load", loadFeaturedSitters);
// Opens chat modal - backend: Replace localStorage messages with Supabase realtime messages table
function openModal(name) {
    document.getElementById("modalSitterName").textContent = "Chat with " + name;
    document.getElementById("messageModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("messageModal").style.display = "none";
}

// backend: Replace localStorage with INSERT to messages table - { sender_id, receiver_id, content, timestamp }
function sendMessage() {
    const input = document.getElementById("msgInput");
    const msg = input.value.trim();
    if (!msg) return;
    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML += `<div class="msg sent">${msg}</div>`;
    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Clears session and redirects - backend: Also call /api/logout to invalidate session token
function logout() {
    localStorage.clear();
    location.href = 'index.html';
}

// Shows/hides nav buttons based on login state - backend: Check session token instead of localStorage
document.addEventListener("DOMContentLoaded", function() {
    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");
    const profileBtn = document.getElementById("profileBtn");
    const bookingsBtn = document.getElementById("bookingsBtn");
    if (localStorage.getItem("loggedIn")) {
        if (loginBtn) loginBtn.style.display = "none";
        if (signupBtn) signupBtn.style.display = "none";
        if (profileBtn) profileBtn.style.display = "block";
        if (bookingsBtn) bookingsBtn.style.display = "block";
    }
});

// Enter key triggers form submission on login and signup pages
document.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        const submitBtn = document.getElementById("submitBtn");
        const loginBtn = document.querySelector("button[onclick='handleLogin()']");
        if (submitBtn && submitBtn.style.display !== "none") {
            handleSignup();
        } else if (loginBtn) {
            handleLogin();
        }
    }
});

// Blocks non-letter characters in name fields
function validateLetters(input, errorId) {
    const error = document.getElementById(errorId);
    input.value = input.value.replace(/[^a-zA-Z]/g, '');
    if (input.value.length === 0) {
        error.textContent = "Only letters accepted, no spaces!";
    } else {
        error.textContent = "";
    }
}

// Validates zip code and detects NYC borough
function validateZip(input) {
    const error = document.getElementById("zipError");
    input.value = input.value.replace(/[^0-9]/g, '');
    if (input.value.length > 5) input.value = input.value.slice(0, 5);
    if (input.value.length === 5) {
        lookupBorough(input.value);
        error.textContent = "";
    } else {
        error.textContent = "Enter a valid 5-digit zip code!";
        document.getElementById("boroughMsg").textContent = "";
    }
}

// Maps zip prefix to NYC borough
function lookupBorough(zip) {
    const prefix = zip.substring(0, 3);
    const boroughMap = {
        "100": "Manhattan", "101": "Manhattan", "102": "Manhattan",
        "103": "Staten Island", "104": "The Bronx", "105": "The Bronx",
        "111": "Queens", "113": "Queens", "114": "Queens", "116": "Queens",
        "112": "Brooklyn", "113": "Brooklyn", "114": "Brooklyn", "115": "Brooklyn"
    };
    const borough = boroughMap[prefix] || "New York City";
    document.getElementById("boroughMsg").textContent = `Looks like you are in ${borough}!`;
}

// Forces @ symbol at start of username field
function addAt(input) {
    if (!input.value.startsWith('@')) {
        input.value = '@';
    }
}

// Blocks special characters and spaces in username
function validateUsername(input) {
    const error = document.getElementById("usernameError");
    let val = input.value;
    if (!val.startsWith('@')) val = '@' + val;
    val = '@' + val.slice(1).replace(/[^a-zA-Z0-9_]/g, '');
    input.value = val;
    if (val.length < 4) {
        error.textContent = "Username must be at least 3 characters!";
    } else {
        error.textContent = "";
    }
}

// Validates email format
function validateEmail(input) {
    const error = document.getElementById("emailError");
    if (!input.value.includes('@') || !input.value.includes('.')) {
        error.textContent = "Please enter a valid email address!";
    } else {
        error.textContent = "";
    }
}

// Validates password strength - min 8 chars and one symbol
function validatePassword(input) {
    const error = document.getElementById("passwordError");
    const strongPassword = /^(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!strongPassword.test(input.value)) {
        error.textContent = "Min 8 characters and at least one symbol (!, @, #...)";
    } else {
        error.textContent = "";
    }
}

// Tracks selected avatar on signup and edit profile
let selectedAvatar = '🐾';

function selectAvatar(btn, avatar) {
    selectedAvatar = avatar;
    document.querySelectorAll("#avatarSelect .tag-btn").forEach(b => {
        b.style.backgroundColor = "rgb(53, 53, 102)";
    });
    btn.style.backgroundColor = "#7b7bd4";
}

// Checks if confirm password matches password field
function validateConfirm(input) {
    const error = document.getElementById("confirmError");
    const password = document.getElementById("signupPassword").value;
    if (input.value !== password) {
        error.textContent = "Passwords do not match!";
    } else {
        error.textContent = "Passwords match!";
        document.getElementById("confirmError").style.color = "lightgreen";
    }
}

// Blocks non-numeric input on homepage zip search
function validateZipSearch(input) {
    const error = document.getElementById("searchZipError");
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 5);
    if (input.value.length > 0 && input.value.length < 5) {
        error.textContent = "Enter a valid 5-digit zip code!";
        error.style.color = "red";
    } else {
        error.textContent = "";
    }
}

// Redirects to search page with zip as URL parameter
// backend: search.html will use zip + range to query /api/sitters/nearby?zip=XXXXX&range=X
function searchNearby() {
    const zip = document.getElementById("zipInput").value;
    if (!zip || zip.length < 5) {
        document.getElementById("searchZipError").textContent = "Enter a valid 5-digit zip code!";
        return;
    }
    document.getElementById("searchZipError").textContent = "";
    location.href = `search.html?zip=${zip}`;
}