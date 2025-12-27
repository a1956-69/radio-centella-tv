// =====================
// Reloj en tiempo real
// =====================
function updateClock() {
  const now = new Date();
  document.getElementById("time").innerText = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// =====================
// Publicidad rotativa
// =====================
let indicePublicidad = 0;

function cambiarPublicidad() {
  const banner = document.getElementById("banner");
  const { src, nombre } = publicidadConfig[indicePublicidad]; // viene de config.js

  banner.innerHTML = `
    <div class="fade">
      <img src="${src}" alt="Publicidad"
           onerror="this.src='img/fallback.png'; this.nextElementSibling.textContent='Imagen no disponible';">
      <p class="publi-nombre">${nombre}</p>
    </div>
  `;

  indicePublicidad = (indicePublicidad + 1) % publicidadConfig.length;
}
cambiarPublicidad();
setInterval(cambiarPublicidad, 5000);

// =====================
// Noticias RSS
// =====================
async function loadRSS() {
  const url = "https://news.google.com/rss?hl=es-419&gl=VE&ceid=VE:es-419"; 
  const response = await fetch("https://api.allorigins.win/get?url=" + encodeURIComponent(url));
  const data = await response.json();
  const parser = new DOMParser();
  const xml = parser.parseFromString(data.contents, "text/xml");
  const items = xml.querySelectorAll("item");
  let html = "<ul>";
  items.forEach((item, i) => {
    if (i < 5) {
      html += `<li><a href="${item.querySelector("link").textContent}" target="_blank">${item.querySelector("title").textContent}</a></li>`;
    }
  });
  html += "</ul>";
  document.getElementById("rss-feed").innerHTML = html;
}
loadRSS();

// =====================
// Utilidades Bingo
// =====================
function pad3(n) {
  return String(n).padStart(3, '0');
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
  grid[2][2] = 'FREE';
  return grid;
}

async function downloadBingoPDF(cardNumber, playerName) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const grid = generateBingoGrid();

  // Encabezado
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('BINGO CENTELLA', 300, 60, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Cartón: ${pad3(cardNumber)}`, 60, 90);
  if (playerName && playerName.trim().length > 0) {
    doc.text(`Jugador: ${playerName}`, 60, 110);
  }

  // Cabecera de columnas
  const startX = 60, startY = 150;
  const cellW = 80, cellH = 60;
  const headers = ['B', 'I', 'N', 'G', 'O'];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  headers.forEach((h, i) => {
    const x = startX + i * cellW;
    doc.rect(x, startY, cellW, cellH);
    doc.text(h, x + cellW / 2, startY + cellH / 2 + 6, { align: 'center' });
  });

  // Celdas con números
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const x = startX + c * cellW;
      const y = startY + (r + 1) * cellH;
      doc.rect(x, y, cellW, cellH);
      const val = grid[r][c] === 'FREE' ? 'FREE' : String(grid[r][c]);
      doc.text(val, x + cellW / 2, y + cellH / 2 + 6, { align: 'center' });
    }
  }

  doc.save(`bingo_centella_${pad3(cardNumber)}.pdf`);
}

// =====================
// Eventos UI Bingo
// =====================
document.getElementById('generateCard')?.addEventListener('click', () => {
  const playerName = document.getElementById('playerName').value.trim();
  const cardNumber = parseInt(document.getElementById('cardNumber').value, 10);
  if (!cardNumber || cardNumber < 1 || cardNumber > 300) {
    alert('Indica un número de cartón válido (001–300).');
    return;
  }
  downloadBingoPDF(cardNumber, playerName);
});

// =====================
// Mostrar días de Bingo (desde config.js)
// =====================
document.getElementById("bingo-days").innerText =
  `${bingoConfig.dias.join(", ")} • ${bingoConfig.hora}`;
