const image = document.getElementById('uploadedImage');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const coordsDisplay = document.getElementById('coordsDisplay');
const heightDisplay = document.getElementById('heightEstimate');

let points = [];

document.getElementById('imageUpload').addEventListener('change', function(e) {
  const reader = new FileReader();
  reader.onload = function(event) {
    image.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
});

image.onload = function () {
  const displayWidth = image.clientWidth;
  const displayHeight = image.clientHeight;

  canvas.width = displayWidth;
  canvas.height = displayHeight;

  canvas.style.width = displayWidth + "px";
  canvas.style.height = displayHeight + "px";

  drawPoints();
};

canvas.addEventListener('click', function(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  points.push({ x, y });
  drawPoints();
  updateDisplay();
});

function drawPoints() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'red';
  ctx.font = '16px Arial';
  points.forEach((pt, index) => {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText(`${index + 1}`, pt.x + 8, pt.y - 8);
  });
}

function updateDisplay() {
  if (points.length < 2) {
    coordsDisplay.textContent = '정수리와 발끝을 클릭하세요.';
    return;
  }

  const [top, bottom] = points;
  const pixelHeight = Math.abs(bottom.y - top.y);
  const base1 = parseFloat(document.getElementById('baseHeight1').value);
  const base2 = parseFloat(document.getElementById('baseHeight2').value);
  const avgBase = base2 ? (base1 + base2) / 2 : base1;

  const scale = avgBase / pixelHeight;
  const estHeight = Math.round(pixelHeight * scale * 10) / 10;

  coordsDisplay.textContent = `정수리: (${top.x.toFixed(1)}, ${top.y.toFixed(1)})\n발끝: (${bottom.x.toFixed(1)}, ${bottom.y.toFixed(1)})`;
  heightDisplay.textContent = `${estHeight} cm`;
}
