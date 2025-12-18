const API = "http://127.0.0.1:8000";

function useTool() {
  window.location.href = "index.html";
}

async function loadScenarios() {
  const res = await fetch(API + "/admin/download");
  const data = await res.json();

  const editor = document.getElementById("scenarioEditor");
  const saveBtn = document.getElementById("saveBtn");

  editor.style.display = "block";
  saveBtn.style.display = "block";

  editor.value = data.file;
}

async function saveScenarios() {
  const editor = document.getElementById("scenarioEditor");
  const text = editor.value;

  // Save entire file back
  const res = await fetch(API + "/admin/scenarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parseScenarios(text))
  });

  if (res.ok) {
    alert("Scenarios updated successfully");
  } else {
    alert("Failed to update scenarios");
  }
}

// Parse txt to JSON (simple parser)
function parseScenarios(text) {
  const blocks = text.split("---");
  const scenarios = [];

  blocks.forEach(b => {
    const lines = b.trim().split("\n");
    if (lines.length >= 3) {
      scenarios.push({
        id: parseInt(lines[0].replace("ID:", "")),
        text: lines[1].replace("TEXT:", ""),
        resolution: lines[2].replace("RESOLUTION:", "")
      });
    }
  });

  return scenarios;
}

async function downloadScenarios() {
  const res = await fetch(API + "/admin/download");
  const data = await res.json();

  const blob = new Blob([data.file], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "scenarios.txt";
  a.click();
}
