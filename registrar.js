// --- API base configuration ---
const API_BASE = (location.hostname.includes("localhost"))
  ? "http://localhost:3000"
  : "https://cybermakersite-production.up.railway.app";
// --- end config ---

document.getElementById("form-registro").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  try {
    const res = await fetch(`${API_BASE}https://cybermakersite-production.up.railway.app/api/registrar`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    if (data.success) {
      alert("Registrado com sucesso!");
      window.location.href = "login.html";
    } else {
      alert("Erro: " + data.error);
    }
  } catch (err) {
    console.error("Erro na requisição:", err);
    alert("Erro de conexão com o servidor!");
  }
});
