const image = document.getElementById('uploadedImage');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const baseHeightInput = document.getElementById('baseHeight');
const resultsDisplay = document.getElementById('resultsDisplay');
const outputBox = document.querySelector('.output');

const resetBtn = document.getElementById('resetBtn');
const copyBtn = document.getElementById('copyBtn');
const lockFootBtn = document.getElementById('lockFootBtn');

let points = [];
let lockFoot = false;
let lockedFootY = null;

document.getElementById('imageUpload').addEventListener('change', function (e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    image.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

image.onload = function () {
  // Internal pixel size = native image size
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  // Visual size by CSS only (keeps aspect ratio)
  canvas.style.width = '100%';
  canvas.style.height = 'auto';

  drawPoints();
  resultsDisplay.textContent = 'Click the head and foot of the base person in order.';
  outputBox.style.display = 'block';
};

canvas.addEventListener('click', function (e) {
  if (!image.src) return;

  const rect = canvas.getBoundingClientRect();

  // Map from displayed coords -> internal pixel coords
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = (e.clientX - rect.left) * scaleX;
  let y  = (e.clientY - rect.top)  * scaleY;

  // When "lock foot" is enabled, every second click in a pair after base -> force foot Y
  if (lockFoot && points.length >= 2 && (points.length % 2 === 1)) {
    y = lockedFootY;
  }

  points.push({ x, y });

  // After base person (first 2 clicks), remember base foot in lock mode
  if (points.length === 2 && lockFoot) {
    lockedFootY = points[1].y;
  }

  drawPoints();
  updateResults();
});

function drawPoints() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (image.src) ctx.drawImage(image, 0, 0);

  ctx.fillStyle = 'red';
  ctx.font = '16px Arial';
  points.forEach((pt, index) => {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText(`${index + 1}`, pt.x + 8, pt.y - 8);
  });
}

function updateResults() {
  const baseHeight = parseFloat(baseHeightInput.value);

  if (isNaN(baseHeight)) {
    resultsDisplay.textContent = "Enter the base person’s height first.";
    outputBox.style.display = 'block';
    return;
  }

  if (points.length < 2) {
    resultsDisplay.textContent = "Click the base person’s head and foot in order.";
    outputBox.style.display = 'block';
    return;
  }

  const baseTop = points[0].y;
  const baseBottom = points[1].y;
  const basePixelHeight = Math.abs(baseBottom - baseTop);

  if (basePixelHeight === 0) {
    resultsDisplay.textContent = "Invalid base foot coordinate (duplicated or incorrect).";
    outputBox.style.display = 'block';
    return;
  }

  const pxPerCm = basePixelHeight / baseHeight;

  let output = `📏 Base height: ${baseHeight} cm\n`;
  output += `- Head(y): ${baseTop.toFixed(1)}, Foot(y): ${baseBottom.toFixed(1)}\n`;
  output += `- Pixel height: ${basePixelHeight.toFixed(1)}, px/cm: ${pxPerCm.toFixed(3)}\n\n`;

  const targetCount = Math.floor((points.length - 2) / 2);
  for (let i = 0; i < targetCount; i++) {
    const head = points[2 + i * 2].y;
    const foot = points[3 + i * 2].y;
    const pixelHeight = Math.abs(foot - head);
    const cm = pixelHeight / pxPerCm;
    output += `👤 Person ${i + 1}: ${cm.toFixed(1)} cm (px: ${pixelHeight.toFixed(1)})\n`;
  }

  resultsDisplay.textContent = output;
  outputBox.style.display = 'block';
}

resetBtn.addEventListener('click', () => {
  points = [];
  lockedFootY = null;
  lockFoot = false;
  lockFootBtn.disabled = false;
  lockFootBtn.textContent = 'Lock Foot Y';

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (image.src) ctx.drawImage(image, 0, 0);

  resultsDisplay.textContent = 'Reset. Click again to mark points.';
  outputBox.style.display = 'none';
});

copyBtn.addEventListener('click', () => {
  const text = resultsDisplay.textContent || '';
  navigator.clipboard.writeText(text).then(() => {
    alert('Copied to clipboard!');
  }).catch(() => {
    alert('Copy failed. Select and copy manually.');
  });
});

lockFootBtn.addEventListener('click', () => {
  lockFoot = true;
  lockFootBtn.disabled = true;
  lockFootBtn.textContent = 'Foot Y locked';
});
