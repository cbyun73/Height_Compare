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

image.onload = function() {
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  canvas.style.width = image.width + "px";
  canvas.style.height = image.height + "px";
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
  ctx.drawImage(image, 0, 0);
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
  coordsDisplay.textContent = `정수리: (${top.x.toFixed(1)}, ${top.y.toFixed(1)})\n발끝: (${bottom.x.toFixed(1)}, ${bottom.y.toFixed(1)})`;
}

function calculateHeight() {
  const base1 = parseFloat(document.getElementById('baseHeight1').value);
  const head1 = parseFloat(document.getElementById('head1').value);
  const foot1 = parseFloat(document.getElementById('foot1').value);

  const base2 = parseFloat(document.getElementById('baseHeight2').value);
  const head2 = parseFloat(document.getElementById('head2').value);
  const foot2 = parseFloat(document.getElementById('foot2').value);

  const targetHead = parseFloat(document.getElementById('targetHead').value);
  const targetFoot = parseFloat(document.getElementById('targetFoot').value);

  let pixelHeight1 = foot1 - head1;
  let pixelHeight2 = foot2 - head2;

  let scale1 = base1 && pixelHeight1 ? base1 / pixelHeight1 : null;
  let scale2 = base2 && pixelHeight2 ? base2 / pixelHeight2 : null;

  let finalScale = scale1 && scale2 ? (scale1 + scale2) / 2 : (scale1 || scale2);

  if (!finalScale || isNaN(finalScale)) {
    heightDisplay.textContent = "기준 인물의 정보를 정확히 입력해주세요.";
    return;
  }

  let targetPixelHeight = targetFoot - targetHead;
  let estHeight = targetPixelHeight * finalScale;
  heightDisplay.textContent = `예상 키: ${estHeight.toFixed(1)} cm`;
}
