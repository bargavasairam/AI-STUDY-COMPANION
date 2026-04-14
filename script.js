// --- AUTH MODE TOGGLE ---
let isSignUpMode = false;

window.toggleAuthMode = function() {
    isSignUpMode = !isSignUpMode;
    const title = document.getElementById("modalTitle");
    const mainBtn = document.getElementById("mainAuthBtn");
    const question = document.getElementById("toggleQuestion");
    const action = document.getElementById("toggleAction");
    const regNameField = document.getElementById("regName");

    if (isSignUpMode) {
        title.innerText = "Create Account";
        mainBtn.innerText = "Sign Up";
        question.innerText = "Already have an account?";
        action.innerText = "Login";
        if(regNameField) regNameField.style.display = "block";
    } else {
        title.innerText = "Sign In";
        mainBtn.innerText = "Continue";
        question.innerText = "Don't have an account?";
        action.innerText = "Sign Up";
        if(regNameField) regNameField.style.display = "none";
    }
}

// --- PASSWORD VISIBILITY ---
window.togglePasswordVisibility = function() {
    const passwordField = document.getElementById("userPass");
    const toggleIcon = document.getElementById("togglePassword");
    passwordField.type = passwordField.type === "password" ? "text" : "password";
    toggleIcon.innerText = passwordField.type === "password" ? "👁️" : "🔒";
}

// --- REAL FIREBASE AUTH LOGIC ---
window.validateAndLogin = function() {
    const email = document.getElementById("userEmail").value.trim();
    const password = document.getElementById("userPass").value.trim();
    const fullName = document.getElementById("regName").value.trim();

    if (!email || !password) {
        alert("Please fill in email and password.");
        return;
    }

    if (isSignUpMode) {
        window.createUserWithEmailAndPassword(window.auth, email, password)
            .then((userCredential) => {
                window.updateProfile(userCredential.user, { displayName: fullName || "Scholar" })
                .then(() => handleAuth(fullName || "Scholar"));
            })
            .catch((error) => alert(error.message));
    } else {
        window.signInWithEmailAndPassword(window.auth, email, password)
            .then((userCredential) => {
                handleAuth(userCredential.user.displayName || userCredential.user.email.split('@')[0]);
            })
            .catch((error) => {
                if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    alert("Wrong password or email! Please try again.");
                } else if (error.code === 'auth/user-not-found') {
                    alert("No account found with this email. Please Sign Up.");
                } else {
                    alert(error.message);
                }
            });
    }
}

// --- GOOGLE SIGN-IN ---
window.handleGoogleLogin = function() {
    const provider = new window.GoogleAuthProvider();
    window.signInWithPopup(window.auth, provider)
        .then((result) => handleAuth(result.user.displayName))
        .catch((error) => alert(error.message));
}

// --- FORGOT PASSWORD ---
window.resetPassword = function() {
    const email = document.getElementById("resetEmail").value.trim();
    if (!email) { alert("Please enter your email."); return; }
    window.sendPasswordResetEmail(window.auth, email)
        .then(() => {
            alert("Reset link sent! Check your email.");
            hideForgotPage();
        })
        .catch((error) => alert(error.message));
}

// --- CORE REDIRECT LOGIC ---
function handleAuth(nameToSave) {
    localStorage.setItem("activeUser", nameToSave);
    window.location.href = "dashboard.html";
}

window.logout = function() {
    console.log("Logout initiated...");

    // 1. Check if Firebase Auth is initialized
    if (!window.auth || !window.signOut) {
        console.error("Firebase Auth not found. Clearing local session anyway.");
        localStorage.removeItem("activeUser");
        window.location.href = "index.html";
        return;
    }

    // 2. Perform Firebase Sign Out
    window.signOut(window.auth)
        .then(() => {
            console.log("Firebase Sign Out Successful.");
            // 3. Clear Local Storage
            localStorage.removeItem("activeUser");
            // 4. Redirect
            window.location.href = "index.html";
        })
        .catch((error) => {
            console.error("Firebase Sign Out Error:", error);
            // Force logout locally even if Firebase fails
            localStorage.removeItem("activeUser");
            window.location.href = "index.html";
        });
};
window.comingSoon = function(name) {
    const toast = document.getElementById("toast");
    if (toast) {
        toast.innerText = name + " is coming soon!";
        toast.classList.add("show");
        
        // Remove the 'show' class after 3 seconds
        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    } else {
        console.error("Toast element not found! Check your HTML for <div id='toast'></div>");
    }
}

// --- INITIALIZATION ---
window.onload = function() {
    reveal();
    const storedName = localStorage.getItem("activeUser");
    const userSpan = document.getElementById("displayUser");

    // Guard: Prevent logged out users from seeing Dashboard
    if (!storedName && window.location.pathname.includes("dashboard.html")) {
        window.location.href = "index.html";
    }
    // Guard: Prevent logged in users from seeing Landing
    if (storedName && (window.location.pathname.endsWith("index.html") || window.location.pathname === "/")) {
        window.location.href = "dashboard.html";
    }

    if (userSpan) userSpan.innerText = storedName || "Scholar";
}

// UI Helpers
window.openLogin = () => document.getElementById("loginModal").style.display = "block";
window.closeLogin = () => document.getElementById("loginModal").style.display = "none";

window.showForgotPage = function() {
    document.getElementById("authFields").style.display = "none";
    document.querySelector(".google-btn").style.display = "none";
    document.querySelector(".divider").style.display = "none";
    document.getElementById("toggleText").style.display = "none";
    document.getElementById("forgotSection").style.display = "block";
    document.getElementById("modalTitle").innerText = "Reset";
}

window.hideForgotPage = function() {
    document.getElementById("authFields").style.display = "block";
    document.querySelector(".google-btn").style.display = "flex";
    document.querySelector(".divider").style.display = "block";
    document.getElementById("toggleText").style.display = "block";
    document.getElementById("forgotSection").style.display = "none";
    document.getElementById("modalTitle").innerText = isSignUpMode ? "Create Account" : "Sign In";
}

function reveal() {
    var reveals = document.querySelectorAll(".reveal");
    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        if (elementTop < windowHeight - 100) reveals[i].classList.add("active");
    }
}
window.addEventListener("scroll", reveal);

// --- ENHANCED STUDY PLANNER LOGIC ---

let studyTasks = JSON.parse(localStorage.getItem("studyTasks")) || [];
let currentFilter = "All";

// Modal Controls
window.openTaskModal = function() {
    document.getElementById("taskModal").style.display = "block";
    document.body.classList.add("modal-open");
};

window.closeTaskModal = function() {
    document.getElementById("taskModal").style.display = "none";
    document.body.classList.remove("modal-open");
};

window.addEventListener('load', () => {
    renderTable();
    updateProgress();
});

window.saveNewTask = function() {
    const type = document.getElementById("taskDurationType").value;
    const subject = document.getElementById("taskSubject").value;
    const topic = document.getElementById("taskTopic").value;
    const startDate = document.getElementById("taskDate").value;
    
    // Ensure ID is a string to avoid type-mismatch errors
    let newTask = {
        id: Date.now().toString(), 
        subject,
        topic,
        date: startDate,
        durationType: type,
        status: "Pending",
        priority: document.getElementById("taskPriority").value
    };

    if (type === "Short") {
        newTask.time = document.getElementById("taskTime").value;
        newTask.endTime = document.getElementById("taskEndTime").value;
    } else {
        newTask.endDate = document.getElementById("taskEndDate").value;
    }

    studyTasks.push(newTask);
    updatePlanner();
    closeTaskModal();
};

// Add 'window.' to the front so the HTML buttons can 'see' them
window.deleteTask = function(id) {
    if (confirm("Are you sure you want to remove this task?")) {
        // Convert both to string to be safe
        studyTasks = studyTasks.filter(t => String(t.id) !== String(id));
        updatePlanner();
    }
};

window.toggleComplete = function(id) {
    // Convert id to string to ensure matching works
    studyTasks = studyTasks.map(t => {
        if (String(t.id) === String(id)) {
            t.status = (t.status === "Completed") ? "Pending" : "Completed";
        }
        return t;
    });
    updatePlanner();
};

window.filterTasks = function(status, btn) {
    currentFilter = status;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTable();
};

function updatePlanner() {
    localStorage.setItem("studyTasks", JSON.stringify(studyTasks));
    renderTable();
    updateProgress();
    if (isCalendarMode && typeof initCalendar === "function") initCalendar();
}

function renderTable() {
    const tbody = document.getElementById("taskTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    const filtered = studyTasks.filter(t => {
        if (currentFilter === "All") return true;
        return t.status === currentFilter;
    });

    filtered.forEach(t => {
        let timeDisplay = (t.durationType === "Long") 
            ? `${t.date} to ${t.endDate}` 
            : `${t.date} | ${t.time} - ${t.endTime}`;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td><b>${t.subject}</b> <br><small style="color:var(--accent)">${t.durationType}</small></td>
            <td>${t.topic}</td>
            <td>${timeDisplay}</td>
            <td class="${t.priority === 'High' ? 'priority-high' : ''}">${t.priority}</td>
            <td><span class="status-badge ${t.status === 'Completed' ? 'status-completed' : 'status-pending'}">${t.status}</span></td>
            <td>
                <button class="btn-login-white" style="padding: 5px 10px; font-size: 0.7rem;" onclick="toggleComplete('${t.id}')">
                    ${t.status === 'Completed' ? 'Undo' : 'Done'}
                </button>
                <button class="btn-started" style="padding: 5px 10px; font-size: 0.7rem; background: #ff4757;" onclick="deleteTask('${t.id}')">
                    Delete
                </button>
            </td>
        `;
        tbody.appendChild(row); 
    });
}

function updateProgress() {
    const total = studyTasks.length;
    const completed = studyTasks.filter(t => t.status === "Completed").length;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

    const bar = document.getElementById("plannerProgressBar");
    const rateText = document.getElementById("completionRate");
    const statComp = document.getElementById("statCompleted");
    const statPend = document.getElementById("statPending");

    if (bar) bar.style.width = rate + "%";
    if (rateText) rateText.innerText = rate + "%";
    if (statComp) statComp.innerText = `Completed: ${completed}`;
    if (statPend) statPend.innerText = `Pending: ${total - completed}`;
}

// Ensure the table renders when the page opens
const oldOnload = window.onload;
window.onload = function() {
    if (oldOnload) oldOnload();
    renderTable();
    updateProgress();
};
let calendar; 
let isCalendarMode = false;

window.toggleCalendarView = function() {
    // Improved selector to find the table wrapper more reliably
    const tableDiv = document.getElementById('tableView') || document.querySelector('.table-wrapper');
    const calDiv = document.getElementById('calendar-container');
    const btn = document.getElementById('viewToggleBtn');
    const filterBar = document.getElementById('filterBar');

    isCalendarMode = !isCalendarMode;

    if (isCalendarMode) {
        if(tableDiv) tableDiv.style.display = "none";
        if(filterBar) filterBar.style.display = "none";
        calDiv.style.display = "block";
        btn.innerText = "Table View";
        
        // Initialize OR just update size if it already exists
        if (!calendar) {
            initCalendar();
        } else {
            calendar.render();
            calendar.updateSize(); // CRITICAL: Fixes the 'invisible calendar' bug
        }
    } else {
        if(tableDiv) tableDiv.style.display = "block";
        if(filterBar) filterBar.style.display = "flex";
        calDiv.style.display = "none";
        btn.innerText = "Calendar View";
    }
};

function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    const events = studyTasks.map(t => {
        let eventObj = {
            id: t.id,
            title: `${t.subject}: ${t.topic}`,
            start: t.date + (t.time ? `T${t.time}` : ""),
            backgroundColor: t.status === "Completed" ? "#28a745" : (t.priority === "High" ? "#ff4757" : "#8b5cf6"),
            borderColor: 'transparent',
            extendedProps: { status: t.status }
        };

        // IF it's a Long-Term task and has an endDate, add the 'end' property
        if (t.durationType === "Long" && t.endDate) {
            // NOTE: FullCalendar's 'end' date is EXCLUSIVE (it stops BEFORE this date).
            // To make it show the full end day on the grid, we don't need to change much,
            // but usually, adding 1 day or ensuring it's recognized as a range is key:
            eventObj.end = t.endDate; 
            eventObj.allDay = true; // Long term tasks usually look better as all-day bars
        }

        return eventObj;
    });

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        themeSystem: 'standard',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        events: events,
        height: 'auto',
        displayEventTime: true, // Shows start time for short tasks
        eventClick: function(info) {
            alert(`📚 Task: ${info.event.title}\n✅ Status: ${info.event.extendedProps.status}`);
        }
    });

    calendar.render();
}

// Update updatePlanner to refresh calendar if visible
const originalUpdatePlanner = window.updatePlanner;
window.updatePlanner = function() {
    if (originalUpdatePlanner) originalUpdatePlanner();
    if (isCalendarMode) initCalendar();
};

// --- NOTIFICATION SYSTEM ---

// --- THE GLOBAL COLLABORATOR ---
// This runs in the background of ANY page you have open
function globalReminderCheck() {
    const tasks = JSON.parse(localStorage.getItem("studyTasks")) || [];
    const now = new Date();

    tasks.forEach(t => {
        if (t.status === "Pending" && t.date && t.time) {
            const taskTime = new Date(`${t.date}T${t.time}`);
            
            // Calculate the exact difference in milliseconds, then convert to minutes
            const diffInMs = taskTime - now;
            const diffInMinutes = Math.floor(diffInMs / 60000);

            // Create a unique key for THIS specific minute so it only fires once
            const notifiedKey = `notified_${t.id}_${diffInMinutes}`;

            // LOGIC: Trigger if the task is starting in 4 to 6 minutes
            // This "Range" prevents the 30-second interval from missing the window
            if (diffInMinutes >= 4 && diffInMinutes <= 5) {
                if (!sessionStorage.getItem(notifiedKey) && Notification.permission === "granted") {
                    new Notification(`Upcoming: ${t.subject}`, {
                        body: `Your session for "${t.topic}" starts in 5 minutes!`,
                        icon: "images/doubt-solve.png"
                    });
                    // Mark as notified for THIS specific minute window
                    sessionStorage.setItem(notifiedKey, "true"); 
                }
            }
            
            // HIGH PRIORITY: Also trigger at 10 minutes
            if (t.priority === "High" && diffInMinutes >= 9 && diffInMinutes <= 10) {
                if (!sessionStorage.getItem(notifiedKey) && Notification.permission === "granted") {
                    new Notification(`[High Priority] ${t.subject}`, {
                        body: `Reminder: Session starts in 10 minutes!`,
                        icon: "images/doubt-solve.png"
                    });
                    sessionStorage.setItem(notifiedKey, "true");
                }
            }
        }
    });
}

// Check every 30 seconds for better accuracy
setInterval(globalReminderCheck, 30000);
