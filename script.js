const image = document.getElementById('uploadedImage');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const baseHeightInput = document.getElementById('baseHeight');
const resultsDisplay = document.getElementById('resultsDisplay');
const resetBtn = document.getElementById('resetBtn');
const copyBtn = document.getElementById('copyBtn');
const lockFootBtn = document.getElementById('lockFootBtn');

let points = [];
let lockFoot = false;
let lockedFootY = null;

document.getElementById('imageUpload').addEventListener('change', function (e) {
  const reader = new FileReader();
  reader.onload = function (event) {
    image.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
});

image.onload = function () {
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  canvas.style.width = image.width + "px";
  canvas.style.height = image.height + "px";
  drawPoints();
};

canvas.addEventListener('click', function (e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = image.naturalWidth / rect.width;
  const scaleY = image.naturalHeight / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  let y = (e.clientY - rect.top) * scaleY;

  if (lockFoot && (points.length % 2 === 1)) {
    y = lockedFootY;
  }

  points.push({ x, y });

  if (points.length === 2 && lockFoot) {
    lockedFootY = points[1].y;
  }

  drawPoints();
  updateResults();
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

function updateResults() {
  const baseHeight = parseFloat(baseHeightInput.value);
  if (isNaN(baseHeight)) {
    resultsDisplay.textContent = "기준 인물 키를 먼저 입력하세요.";
    return;
  }

  if (points.length < 2) {
    resultsDisplay.textContent = "기준 인물의 머리와 발을 차례로 클릭하세요.";
    return;
  }

  const baseTop = points[0].y;
  const baseBottom = points[1].y;
  const basePixelHeight = Math.abs(baseBottom - baseTop);
  const pixelPerCm = basePixelHeight / baseHeight;

  let output = `📏 기준 인물 키: ${baseHeight}cm\n`;
  output += `- 머리(y): ${baseTop.toFixed(1)}, 발(y): ${baseBottom.toFixed(1)}\n`;
  output += `- 픽셀 높이: ${basePixelHeight.toFixed(1)}, 픽셀/cm: ${pixelPerCm.toFixed(3)}\n\n`;

  const targetCount = Math.floor((points.length - 2) / 2);
  for (let i = 0; i < targetCount; i++) {
    const head = points[2 + i * 2].y;
    const foot = points[3 + i * 2].y;
    const pixelHeight = Math.abs(foot - head);
    const cm = pixelHeight / pixelPerCm;
    output += `👤 비교 인물 ${i + 1}: ${cm.toFixed(1)} cm (픽셀: ${pixelHeight.toFixed(1)})\n`;
  }

  resultsDisplay.textContent = output;
}

resetBtn.addEventListener('click', () => {
  points = [];
  lockedFootY = null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (image.src) ctx.drawImage(image, 0, 0);
  resultsDisplay.textContent = "초기화되었습니다. 다시 클릭하세요.";
});

copyBtn.addEventListener('click', () => {
  const text = resultsDisplay.textContent;
  navigator.clipboard.writeText(text).then(() => {
    alert("결과가 복사되었습니다!");
  });
});

lockFootBtn.addEventListener('click', () => {
  lockFoot = true;
  lockFootBtn.disabled = true;
  lockFootBtn.textContent = "발끝 좌표 통일됨";
});
