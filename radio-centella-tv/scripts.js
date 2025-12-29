// Asegurar que todo corre cuando el DOM está listo
window.addEventListener("DOMContentLoaded", () => {
  // =====================
  // Reloj en tiempo real
  // =====================
  const timeEl = document.getElementById("time");
  function updateClock() {
    const now = new Date();
    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }
  }
  setInterval(updateClock, 1000);
  updateClock();

  // =====================
  // Publicidad rotativa
  // =====================
  const banner = document.getElementById("banner");
  let indicePublicidad = 0;

  function cambiarPublicidad() {
    if (!banner) return;
    if (!window.publicidadConfig || publicidadConfig.length === 0) {
      banner.innerHTML = "<p>No hay publicidad configurada.</p>";
      return;
    }
    const { src, nombre, link } = publicidadConfig[indicePublicidad];
    banner.innerHTML = `
      <div class="fade">
        <a href="${link}" target="_blank" rel="noopener">
          <img src="${src}" alt="Publicidad" class="publi-img"
               onerror="this.src='img/fallback.png';">
        </a>
        ${nombre ? `<p class="publi-nombre">${nombre}</p>` : ""}
      </div>
    `;
    indicePublicidad = (indicePublicidad + 1) % publicidadConfig.length;
  }
  cambiarPublicidad();
  setInterval(cambiarPublicidad, 5000);

  // =====================
  // Bingo - Generar PDF
  // =====================
  const btnGenerate = document.getElementById("generateCard");
  const playerInput = document.getElementById("playerName");
  const cardInput = document.getElementById("cardNumber");

  function pad3(n) {
    return String(n).padStart(3, "0");
  }

  function generateColumn(min, max, count) {
    const nums = [];
    while (nums.length < count) {
      const x = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!nums.includes(x)) nums.push(x);
    }
    return nums.sort((a, b) => a - b);
  }

  function generateBingoGrid() {
    const B = generateColumn(1, 15, 5);
    const I = generateColumn(16, 30, 5);
    const N = generateColumn(31, 45, 5);
    const G = generateColumn(46, 60, 5);
    const O = generateColumn(61, 75, 5);

    const grid = [];
    for (let r = 0; r < 5; r++) {
      grid.push([B[r], I[r], N[r], G[r], O[r]]);
    }
    grid[2][2] = "FREE";
    return grid;
  }

  async function downloadBingoPDF(cardNumber, playerName) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert("No se cargó la librería jsPDF. Verifica tu conexión o el script CDN.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    const grid = generateBingoGrid();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("BINGO CENTELLA", 300, 60, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Cartón: ${pad3(cardNumber)}`, 60, 90);
    if (playerName) {
      doc.text(`Jugador: ${playerName}`, 60, 110);
    }

    const startX = 60, startY = 150;
    const cellW = 80, cellH = 60;
    const headers = ["B", "I", "N", "G", "O"];

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    headers.forEach((h, i) => {
      const x = startX + i * cellW;
      doc.rect(x, startY, cellW, cellH);
      doc.text(h, x + cellW / 2, startY + cellH / 2 + 6, { align: "center" });
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const x = startX + c * cellW;
        const y = startY + (r + 1) * cellH;
        doc.rect(x, y, cellW, cellH);
        const val = grid[r][c] === "FREE" ? "FREE" : String(grid[r][c]);
        doc.text(val, x + cellW / 2, y + cellH / 2 + 6, { align: "center" });
      }
    }

    doc.save(`bingo_centella_${pad3(cardNumber)}.pdf`);
  }

  if (btnGenerate && playerInput && cardInput) {
    btnGenerate.addEventListener("click", () => {
      const playerName = playerInput.value.trim();
      const cardNumber = parseInt(cardInput.value, 10);
      if (!cardNumber || cardNumber < 1 || cardNumber > 300) {
        alert("Indica un número de cartón válido (001–300).");
        return;
      }
      downloadBingoPDF(cardNumber, playerName);
    });
  }

  // =====================
  // Mostrar días de Bingo
  // =====================
  const bingoDaysEl = document.getElementById("bingo-days");
  if (bingoDaysEl && window.bingoConfig) {
    bingoDaysEl.textContent = `${bingoConfig.dias.join(", ")} • ${bingoConfig.hora}`;
  }

  // =====================
  // Registro de cartones vendidos
  // =====================
  const registryTableBody = document.getElementById("registryTable")
    ? document.getElementById("registryTable").querySelector("tbody")
    : null;
  const btnAdd = document.getElementById("addRegistry");
  const btnExport = document.getElementById("exportCSV");
  const btnClear = document.getElementById("clearRegistry");
  const registryName = document.getElementById("registryName");
  const registryCards = document.getElementById("registryCards");

  function getRowsAsCSV() {
    let csv = "Nombre,Cartones,Fecha\n";
    registryTableBody.querySelectorAll("tr").forEach((row) => {
      const cols = row.querySelectorAll("td");
      csv += `${cols[0].textContent},${cols[1].textContent},${cols[2].textContent}\n`;
    });
    return csv;
  }

  if (btnAdd && btnExport && btnClear && registryTableBody && registryName && registryCards) {
    btnAdd.addEventListener("click", () => {
      const name = registryName.value.trim();
      const cards = registryCards.value.trim();
      if (!name || !cards) {
        alert("Debes ingresar nombre y cartones.");
        return;
      }
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${name}</td>
        <td>${cards}</td>
        <td>${new Date().toLocaleString("es-VE")}</td>
      `;
      registryTableBody.appendChild(row);
      registryName.value = "";
      registryCards.value = "";
    });

    btnExport.addEventListener("click", () => {
      const csv = getRowsAsCSV();
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "registro_bingo.csv";
      a.click();
      URL.revokeObjectURL(url);
    });

    btnClear.addEventListener("click", () => {
      registryTableBody.innerHTML = "";
    });
  }
});
// =====================
// Noticias destacadas (RSS)
// =====================
const rssFeedEl = document.getElementById("rss-feed");
async function cargarNoticias() {
  try {
    const url = "https://api.rss2json.com/v1/api.json?rss_url=https://www.ultimasnoticias.com.ve/feed/";
    const res = await fetch(url);
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      rssFeedEl.innerHTML = "";
      data.items.slice(0, 5).forEach(item => {
        const article = document.createElement("article");
        article.innerHTML = `
          <h3><a href="${item.link}" target="_blank">${item.title}</a></h3>
          <p>${item.pubDate}</p>
        `;
        rssFeedEl.appendChild(article);
      });
    } else {
      rssFeedEl.innerHTML = "<p>No hay noticias disponibles.</p>";
    }
  } catch (err) {
    rssFeedEl.innerHTML = "<p>Error al cargar noticias.</p>";
  }
}
cargarNoticias();