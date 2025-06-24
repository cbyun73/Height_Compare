
const image = document.getElementById('uploadedImage');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const baseHeightInput = document.getElementById('baseHeight');
const resultsDisplay = document.getElementById('resultsDisplay');
const resetBtn = document.getElementById('resetBtn');
const unifyFootBtn = document.getElementById('unifyFootBtn');

let points = [];
let unifyFoot = false;
let baseFootY = null;

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
  const y = (e.clientY - rect.top) * scaleY;

  if (unifyFoot && points.length > 1 && (points.length - 2) % 2 === 0) {
    // 기준 인물 이후 비교 인물일 경우 머리만 클릭, 발은 고정
    points.push({ x, y }); // 머리
    points.push({ x, y: baseFootY }); // 발은 고정값으로 삽입
  } else {
    points.push({ x, y });
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

  let output = `📏 기준 인물 키: ${baseHeight}cm
`;
  output += `- 머리(y): ${baseTop.toFixed(1)}, 발(y): ${baseBottom.toFixed(1)}
`;
  output += `- 픽셀 높이: ${basePixelHeight.toFixed(1)}, 픽셀/cm: ${pixelPerCm.toFixed(3)}

`;

  const targetCount = Math.floor((points.length - 2) / 2);
  for (let i = 0; i < targetCount; i++) {
    const head = points[2 + i * 2].y;
    const foot = points[3 + i * 2].y;
    const pixelHeight = Math.abs(foot - head);
    const cm = pixelHeight / pixelPerCm;
    output += `👤 비교 인물 ${i + 1}:
- 머리(y): ${head.toFixed(1)}, 발(y): ${foot.toFixed(1)}
- 픽셀: ${pixelHeight.toFixed(1)} → 예측 키: ${cm.toFixed(1)} cm

`;
  }

  resultsDisplay.textContent = output.trim();
}

resetBtn.addEventListener('click', () => {
  points = [];
  baseFootY = null;
  unifyFoot = false;
  unifyFootBtn.disabled = false;
  resultsDisplay.textContent = "초기화되었습니다. 다시 클릭하세요.";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (image.src) ctx.drawImage(image, 0, 0);
});

unifyFootBtn.addEventListener('click', () => {
  if (points.length < 2) {
    resultsDisplay.textContent = "기준 인물의 머리와 발을 먼저 클릭하세요.";
    return;
  }
  unifyFoot = true;
  baseFootY = points[1].y;
  unifyFootBtn.disabled = true;
  resultsDisplay.textContent = "발끝 좌표 통일 모드 활성화됨. 이후 비교 인물은 머리만 클릭하세요.";
});

document.getElementById('copyBtn').addEventListener('click', () => {
  navigator.clipboard.writeText(resultsDisplay.textContent).then(() => {
    alert("결과가 복사되었습니다!");
  });
});
