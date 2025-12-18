// const API = "http://127.0.0.1:8000";

// // -------- SIGNUP --------
// async function signup() {
//   const username = u.value;
//   const password = p.value;

//   const res = await fetch(API + "/signup", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ username, password })
//   });

//   const data = await res.json();

//   if (!res.ok) {
//     alert(data.detail);
//     return;
//   }

//   alert("Signup successful");
//   location.href = "login.html";
// }

// // -------- LOGIN --------
// async function login() {
//   const username = u.value;
//   const password = p.value;

//   const res = await fetch(API + "/login", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ username, password })
//   });

//   const data = await res.json();

//   if (!res.ok) {
//     alert(data.detail);
//     return;
//   }

//   localStorage.setItem("token", data.token);
//   location.href = "index.html";
// }

// // -------- RESOLVE --------
// async function resolve() {
//   const ticketText = ticket.value;

//   const res = await fetch(API + "/resolve", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ ticket: ticketText })
//   });

//   const data = await res.json();
//   out.innerText = JSON.stringify(data, null, 2);
// }


















// =================================================
// CONFIG
// =================================================
const API = "https://ticket-resolver-backend.onrender.com";



// =================================================
// LOGIN (USER + ADMIN)
// =================================================
async function login() {
  const username = document.getElementById("u").value;
  const password = document.getElementById("p").value;

  if (!username || !password) {
    alert("Please enter username and password");
    return;
  }

  try {
    const res = await fetch(API + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.detail || "Invalid credentials");
      return;
    }

    // Save role
    localStorage.setItem("role", data.role);
    localStorage.setItem("username", username);

    // Redirect based on role
    if (data.role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "index.html";
    }

  } catch (err) {
    alert("Backend not reachable. Is FastAPI running?");
    console.error(err);
  }
}
async function signup() {
  const username = document.getElementById("u").value;
  const password = document.getElementById("p").value;

  if (!username || !password) {
    alert("Please enter username and password");
    return;
  }

  const res = await fetch(API + "/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.detail || "Signup failed");
    return;
  }

  alert("Signup successful. Please login.");
  window.location.href = "login.html";
}


// =================================================
// LOGOUT
// =================================================
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

// =================================================
// RESOLVE TICKET (USERS + ADMIN)
// =================================================
async function resolve() {
  const ticketEl = document.getElementById("ticket");
  const outEl = document.getElementById("out");

  if (!ticketEl || !outEl) return;

  const ticket = ticketEl.value;

  if (!ticket.trim()) {
    alert("Please enter ticket text");
    return;
  }

  try {
    const res = await fetch(API + "/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.detail || "Error resolving ticket");
      return;
    }

    outEl.innerText = JSON.stringify(data, null, 2);

  } catch (err) {
    alert("Backend not reachable");
    console.error(err);
  }
}

// =================================================
// ADMIN – LOAD SCENARIOS (VIEW / EDIT)
// =================================================
async function loadScenarios() {
  const editor = document.getElementById("scenarioEditor");
  const saveBtn = document.getElementById("saveBtn");

  if (!editor) return;

  try {
    const res = await fetch(API + "/admin/download");
    const data = await res.json();

    editor.style.display = "block";
    saveBtn.style.display = "block";
    editor.value = data.file;

  } catch (err) {
    alert("Failed to load scenarios");
    console.error(err);
  }
}

// =================================================
// ADMIN – SAVE SCENARIOS
// =================================================
async function saveScenarios() {
  const editor = document.getElementById("scenarioEditor");
  if (!editor) return;

  const text = editor.value;

  try {
    const parsed = parseScenarioText(text);

    const res = await fetch(API + "/admin/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed)
    });

    if (!res.ok) {
      alert("Failed to save scenarios");
      return;
    }

    alert("Scenarios saved successfully");

  } catch (err) {
    alert("Error while saving scenarios");
    console.error(err);
  }
}

// =================================================
// ADMIN – DOWNLOAD SCENARIOS
// =================================================
async function downloadScenarios() {
  try {
    const res = await fetch(API + "/admin/download");
    const data = await res.json();

    const blob = new Blob([data.file], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "scenarios.txt";
    a.click();

  } catch (err) {
    alert("Download failed");
    console.error(err);
  }
}

// =================================================
// ADMIN – PARSE TXT → JSON
// =================================================
function parseScenarioText(text) {
  const blocks = text.split("---");
  const scenarios = [];

  blocks.forEach(block => {
    const lines = block.trim().split("\n");
    if (lines.length < 3) return;

    const idLine = lines.find(l => l.startsWith("ID:"));
    const textLine = lines.find(l => l.startsWith("TEXT:"));
    const resLine = lines.find(l => l.startsWith("RESOLUTION:"));

    if (!idLine || !textLine || !resLine) return;

    scenarios.push({
      id: parseInt(idLine.replace("ID:", "").trim()),
      text: textLine.replace("TEXT:", "").trim(),
      resolution: resLine.replace("RESOLUTION:", "").trim()
    });
  });

  return scenarios;
}

// =================================================
// PAGE GUARD (OPTIONAL SAFETY)
// =================================================
function guardAdminPage() {
  const role = localStorage.getItem("role");
  if (role !== "admin") {
    alert("Unauthorized access");
    window.location.href = "login.html";
  }
}

function guardUserPage() {
  const role = localStorage.getItem("role");
  if (!role) {
    window.location.href = "login.html";
  }
}
