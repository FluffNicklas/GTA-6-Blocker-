const $ = id => document.getElementById(id);
let state = { enabled: true, blockPages: true, keywords: [...GTA6_DEFAULTS] };

function save(patch) {
  Object.assign(state, patch);
  chrome.storage.local.set(patch);
  render();
}

function render() {
  $("on").checked = state.enabled;
  $("pages").checked = state.blockPages;
  $("pill").textContent = state.enabled ? "Aktiv" : "Pausiert";
  $("pill").classList.toggle("off", !state.enabled);
  $("mainTitle").textContent = state.enabled ? "Blocker aktiv" : "Blocker pausiert";
  $("mainSub").textContent = state.enabled
    ? "GTA-6-Inhalte werden ausgeblendet."
    : "Alles wird normal angezeigt.";
  document.querySelectorAll(".card:not(.main)").forEach(c => c.classList.toggle("dim", !state.enabled));

  const box = $("chips");
  box.textContent = "";
  state.keywords.forEach(k => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.appendChild(document.createTextNode(k));
    const x = document.createElement("button");
    x.textContent = "×";
    x.title = "Entfernen";
    x.addEventListener("click", () => save({ keywords: state.keywords.filter(v => v !== k) }));
    chip.appendChild(x);
    box.appendChild(chip);
  });
}

function addKeyword() {
  const v = $("newKw").value.trim();
  if (!v) return;
  const exists = state.keywords.some(k => k.toLowerCase() === v.toLowerCase());
  if (!exists) save({ keywords: [...state.keywords, v] });
  $("newKw").value = "";
}

$("on").addEventListener("change", e => save({ enabled: e.target.checked }));
$("pages").addEventListener("change", e => save({ blockPages: e.target.checked }));
$("addBtn").addEventListener("click", addKeyword);
$("newKw").addEventListener("keydown", e => { if (e.key === "Enter") addKeyword(); });
$("reset").addEventListener("click", () => save({ keywords: [...GTA6_DEFAULTS] }));

chrome.storage.local.get({ enabled: true, blockPages: true, keywords: GTA6_DEFAULTS }, r => {
  state = r;
  render();
});
