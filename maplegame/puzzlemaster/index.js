const ext = document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp') ? '.png' : '.png';
const info = document.querySelector('#info');
const puzzle = new Map();

const getImageFromUrl = async src => new Promise(resolve => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.setAttribute('crossorigin', 'anonymous');
  image.src = src;
});

const getDataArray = async () => {
  const dataArray = [];
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const context = canvas.getContext('2d');
  for (let i = 0; i < 39; ++i) {
    info.innerHTML = `퍼즐 이미지 다운로드 중... ${i + 1} / 39`;
    const image = await getImageFromUrl(i + ext);
    context.drawImage(image, 0, 0);
    const { data } = context.getImageData(95, 55, 50, 50);
    dataArray.push(data);
  }
  info.innerHTML = '퍼즐 이미지 다운로드 완료';
  return dataArray;
};

const getImageFromClipboard = async () => {
  const items = await navigator?.clipboard?.read?.();
  if (!items) return;
  for (const item of items) {
    for (const type of item.types) {
      if (!type.includes('image')) continue;
      const blob = await item.getType(type);
      const src = URL.createObjectURL(blob);
      return await getImageFromUrl(src);
    }
  }
};

const getIndexFromCapture = (dataArray, image) => {
  // sprite 이미지와 비교할 지점의 좌표를 찾고 데이터를 잘라낸다.
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d'),
    width = canvas.width = image.naturalWidth,
    height = canvas.height = image.naturalHeight;
  context.drawImage(image, 0, 0);
  const imageData = context.getImageData(0, 0, width, height);
  const { buffer } = imageData.data;
  const int32Array = new Int32Array(buffer);
  const index = int32Array.findIndex((v, i, a) => {
    return v === -15654349 && a[i + 1] === -14540237 && a[i + width] === -14540254 && a[i + width + 1] === -16777216;
  });
  const sx = index % width + 97, sy = ~~(index / width) + 57;
  const cropData = context.getImageData(sx, sy, 50, 50).data;
  // dataArray에서 같은 데이터의 인덱스 값을 리턴한다.
  return dataArray.findIndex(data => data.every((v, i) => v === cropData[i]));
};

const getRCDataArray = () => {
  const dataArray = [];
  const image = puzzle.get('image');  // await getImageFromUrl(index + ext);
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  for (let r = 0; r < 4; ++r) {
    for (let c = 0; c < 5; ++c) {
      const sx = 55 + 160 * c, sy = 65 + 150 * r;
      const { data } = context.getImageData(sx, sy, 100, 30);
      dataArray.push(data);
    }
  }
  return dataArray;
};

const getRCFromCapture = (dataArray, image) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d'),
    width = canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  context.drawImage(image, 0, 0);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const { buffer } = imageData.data;
  const int32Array = new Int32Array(buffer);
  const index = int32Array.findIndex((v, i, a) => {
    return v === -2228225 && a[i + 1] === -3346689 && a[i + width] === -2228225 && a[i + width + 1] === -16777216;
  });
  const sx = index % width + 56, sy = ~~(index / width) + 66;
  const cropData = context.getImageData(sx, sy, 100, 30).data;
  const rcIndex = dataArray.findIndex(data => data.every((v, i) => v === cropData[i]));
  return [~~(rcIndex / 5), rcIndex % 5];
};

const focusHandler = async () => {
  if (puzzle.has('index')) {
    // 몇 번째 퍼즐인지 확인이 됐으면
    console.log('puzzle has index');
    info.innerHTML = '퍼즐 조각의 위치 검색 시작';
    // index.png 이미지에서 만들어진 데이터를 가져온다.
    if (!puzzle.has('rc-data')) puzzle.set('rc-data', getRCDataArray());
    const rcDataArray = puzzle.get('rc-data');
    // 클립보드 이미지와 데이터를 비교해서 rc 찾아낸다
    const image = await getImageFromClipboard();
    if (!image) {
      info.innerHTML = '클립보드 데이터에 이미지가 없습니다. 스크린샷을 찍어주세요.';
      return;
    }
    info.innerHTML = '클립보드 이미지 확인. 퍼즐 조각의 위치 검색 중...';
    const [row, col] = getRCFromCapture(rcDataArray, image);
    console.log(`row: ${row}, col: ${col}`);
    if (col !== -1) {
      info.innerHTML = `퍼즐 조각의 위치는 ${row + 1}행 ${col + 1}열입니다.`;
      document.querySelector('.selected')?.classList.remove('selected');
      [...document.querySelectorAll('#app > div')][5 * row + col].classList.add('selected');
      return;
    }
    info.innerHTML = '클립보드 이미지에 오류가 있습니다. 스크린샷을 다시 찍어주세요.';
  } else {
    // 몇 번째 퍼즐인지 모르면
    console.log('puzzle has no index');
    info.innerHTML = '퍼즐의 인덱스 검색 시작';
    // 인덱스 데이터 행렬 가져온다.
    if (!puzzle.has('index-data')) puzzle.set('index-data', await getDataArray());
    const dataArray = puzzle.get('index-data');
    // 클립보드에서 이미지 가져오고 비교해서 index 찾아낸다.
    const image = await getImageFromClipboard();
    if (!image) {
      info.innerHTML = '클립보드 데이터에 이미지가 없습니다. 스크린샷을 찍어주세요.';
      return;
    }
    info.innerHTML = '클립보드 이미지 확인. 퍼즐의 인덱스 검색 중...';
    const index = getIndexFromCapture(dataArray, image);
    if (index < 0) {
      info.innerHTML = '클립보드 이미지에 오류가 있습니다. 스크린샷을 다시 찍어주세요.';
      return;
    }
    info.innerHTML = `퍼즐의 인덱스는 ${index + 1} / 39 입니다.`;
    // puzzle에 index 등록한다.
    puzzle.set('index', index);
    puzzle.set('image', await getImageFromUrl(index + ext));
    puzzle.set('rc-data', getRCDataArray(index + ext));
    // 배경에 index.png 깔아놓는다.
    document.querySelector('#app').style.background = `url(${index}${ext}) 0 0`;
    document.querySelector('.selected')?.classList.remove('selected');
  }
};

const refresh = () => {
  for (const key of ['index', 'image', 'rc-data']) {
    puzzle.delete(key);
  }
  focusHandler();
};

window.addEventListener('load', async () => {
  console.log('window loaded');
  puzzle.set('index-data', await getDataArray());
  document.querySelector('#refresh').before(...Array.from({ length: 20 }, (_, i) => {
    const div = document.createElement('div');
    const row = ~~(i / 5), col = i % 5;
    div.style.gridArea = [row + 1, col + 1, row + 2, col + 2].join('/');
    return div;
  }));
  navigator?.clipboard?.read?.();
  focusHandler();
});
window.addEventListener('focus', () => {
  console.log('window focused');
  focusHandler();
});
document.querySelector('#refresh').addEventListener('click', refresh);
