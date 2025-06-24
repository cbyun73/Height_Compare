const imageUpload = document.getElementById('imageUpload');
const imageCanvas = document.getElementById('imageCanvas');
const ctx = imageCanvas.getContext('2d');

let image = new Image();
let clickStage = 'referenceHead';
let referenceHeight = 0;
let referenceHeadY = null;
let referenceFootY = null;
let targets = [];
let currentTarget = {};

imageUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function (event) {
    image.onload = function () {
      imageCanvas.width = image.width;
      imageCanvas.height = image.height;
      ctx.drawImage(image, 0, 0);
    };
    image.src = event.target.result;
  };
  if (file) {
    reader.readAsDataURL(file);
  }
});

imageCanvas.addEventListener('click', (e) => {
  const rect = imageCanvas.getBoundingClientRect();
  const y = e.clientY - rect.top;

  switch (clickStage) {
    case 'referenceHead':
      referenceHeadY = y;
      clickStage = 'referenceFoot';
      alert('기준 인물의 발 지점을 클릭하세요.');
      break;
    case 'referenceFoot':
      referenceFootY = y;
      referenceHeight = parseFloat(document.getElementById('referenceHeight').value);
      if (isNaN(referenceHeight) || referenceHeight <= 0) {
        alert('기준 인물의 실제 키를 입력해주세요.');
        clickStage = 'referenceHead';
        referenceHeadY = null;
        referenceFootY = null;
        break;
      }
      clickStage = 'targetHead';
      alert('이제 비교할 인물의 머리 지점을 클릭하세요.');
      break;
    case 'targetHead':
      currentTarget = { headY: y };
      clickStage = 'targetFoot';
      alert('해당 인물의 발 지점을 클릭하세요.');
      break;
    case 'targetFoot':
      currentTarget.footY = y;
      const refPixelHeight = Math.abs(referenceFootY - referenceHeadY);
      const pxPerCm = referenceHeight / refPixelHeight;
      const targetPixelHeight = Math.abs(currentTarget.footY - currentTarget.headY);
      const estimatedHeight = Math.round(targetPixelHeight * pxPerCm * 10) / 10;
      targets.push(estimatedHeight);
      displayResults();
      clickStage = 'targetHead';
      alert('다음 인물의 머리 지점을 클릭하세요. (또는 초기화하려면 초기화 버튼 클릭)');
      break;
  }
});

function displayResults() {
  const resultsList = document.getElementById('resultsList');
  resultsList.innerHTML = '';
  targets.forEach((height, index) => {
    const li = document.createElement('li');
    li.textContent = `대상 인물 ${index + 1}: 약 ${height}cm`;
    resultsList.appendChild(li);
  });
}

document.getElementById('resetButton').addEventListener('click', () => {
  clickStage = 'referenceHead';
  referenceHeadY = null;
  referenceFootY = null;
  referenceHeight = 0;
  targets = [];
  currentTarget = {};
  ctx.drawImage(image, 0, 0);
  document.getElementById('resultsList').innerHTML = '';
  alert('초기화되었습니다. 기준 인물의 머리 지점을 다시 클릭하세요.');
});
