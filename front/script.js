let map;

function initMap() {
    const nyc = { lat: 40.7128, lng: -74.0060 };
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: nyc,
    });
}

function searchSitters() {
    const zip = document.getElementById("zipInput").value;
    if (!zip) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: zip }, function(results, status) {
        if (status === "OK") {
            map.setCenter(results[0].geometry.location);
            map.setZoom(14);
        } else {
            document.getElementById("errorMsg").textContent = "Invalid zip code. Please try again!";
        }
    });
}

function handleLogin() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    if (!email || !password) {
        alert("Please fill in all fields!");
        return;
    }
    alert("Login successful! (Backend coming soon)");
}

let selectedRole = '';
let selectedTags = [];

function selectRole(role) {
    selectedRole = role;
    document.getElementById("basicInfo").style.display = "flex";
    document.getElementById("submitBtn").style.display = "block";
    if (role === 'sitter') {
        document.getElementById("sitterDetails").style.display = "flex";
    } else {
        document.getElementById("sitterDetails").style.display = "none";
    }
}

function toggleTag(btn, tag) {
    if (selectedTags.includes(tag)) {
        selectedTags = selectedTags.filter(t => t !== tag);
        btn.style.backgroundColor = "rgb(53, 53, 102)";
    } else {
        selectedTags.push(tag);
        btn.style.backgroundColor = "#7b7bd4";
    }
}

function handleSignup() {
    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const confirm = document.getElementById("signupConfirm").value;

    if (!name || !email || !password || !confirm) {
        alert("Please fill in all fields!");
        return;
    }
    if (password !== confirm) {
        alert("Passwords don't match!");
        return;
    }
    if (selectedRole === 'sitter') {
        const location = document.getElementById("sitterLocation").value;
        const rate = document.getElementById("hourlyRate").value;
        if (!location || !rate || selectedTags.length === 0) {
            alert("Please fill in all sitter details!");
            return;
        }
    }
    alert(`Account created as ${selectedRole}! (Backend coming soon)`);
}

function loadFeaturedSitters() {
    fetch("http://127.0.0.1:5000/api/sitters")
    .then(res => res.json())
    .then(sitters => {
        const grid = document.getElementById("sitterGrid");
        sitters.forEach(sitter => {
            grid.innerHTML += `
                <div class="sitter-card">
                    <div class="sitter-avatar">🐾</div>
                    <h3>${sitter.name}</h3>
                    <p class="sitter-location">📍 ${sitter.location}</p>
                    <p class="sitter-rate">$${sitter.rate}/hr</p>
                    <button onclick="openModal('${sitter.name}')">Message</button>
                </div>
            `;
        });
    });
}

function openModal(name) {
    document.getElementById("modalSitterName").textContent = "Chat with " + name;
    document.getElementById("messageModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("messageModal").style.display = "none";
}

function sendMessage() {
    const input = document.getElementById("msgInput");
    const msg = input.value.trim();
    if (!msg) return;
    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML += `<div class="msg sent">${msg}</div>`;
    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;
}