const status = new Map();

const getImageFromUrl = async src => new Promise(resolve => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.setAttribute('crossorigin', 'anonymous');
  image.src = src;
});

const getDataArray = async () => Promise.all(
  Array.from({ length: 39 }, async (_, i) => {
    const image = await getImageFromUrl(`${i}.png`);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 106;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    return canvas.toDataURL();
  })
);

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
  console.log(dataArray)
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
  const dx = index % width + 2, dy = ~~(index / width) + 2;
  canvas.width = canvas.height = 106;
  context.drawImage(image, -dx, -dy);
  const cropData = canvas.toDataURL();
  console.log(dataArray.indexOf(cropData))
  // dataArray와 비교해서 같은 데이터가 있는 인덱스를 리턴한다.
  return dataArray.indexOf(cropData);
  // return dataArray.findIndex(data => data === cropData);
};

const getRCDataArray = async index => {
  const image = await getImageFromUrl(`${index}.png`);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 50;
  const context = canvas.getContext('2d');
  // context.drawImage(spriteImage, 0, 0);
  return Array.from({ length: 4 }, (_, r) => {
    return Array.from({ length: 5 }, (_, c) => {
      context.drawImage(image, -160 * c - 90, -150 * r - 60);
      return canvas.toDataURL();
    });
  });
};

const getRCFromCapture = (base64Array, image) => {
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
  const row = ~~(index / width) + 61, col = index % width + 91;

  canvas.width = canvas.height = 50;
  context.drawImage(image, -col, -row);
  const cropData = canvas.toDataURL();
  console.log(row, col, cropData)
  for (let r = 0; r < 4; ++r) {
    for (let c = 0; c < 5; ++c) {
      if (base64Array[r][c] === cropData) return [r, c];
    }
  }
  return [-1, -1];
};

const focusHandler = async () => {
  if (status.has('index')) {
    console.log('status has index');
    // 몇 번째 퍼즐인지 확인이 됐으면
    const index = status.get('index');
    // index.png 이미지를 가져오고 데이터를 만든다.
    const base64Array = status.has('data') ? status.get('data') : await getRCDataArray(index);
    // console.log(base64Array)
    // 클립보드 이미지와 데이터를 비교해서 rc 찾아낸다
    const image = await getImageFromClipboard();
    if (!image) return;
    const [row, col] = getRCFromCapture(base64Array, image);
    console.log(`row: ${row}, col: ${col}`);
    if (row !== -1) {
      status.set('row', row);
      status.set('col', col);
      // console.log(row, col)
      document.querySelector('.selected')?.classList.remove('selected');
      [...document.querySelectorAll('#app > div')][5 * row + col].classList.add('selected');
      return;
    }
  } else {
    console.log('status has no index');
    // 몇 번째 퍼즐인지 모르면
    // sprite에서 데이터를 뽑아낸다.
    const dataArray = await getDataArray();
    // 클립보드에서 이미지 가져오고 비교해서 index 찾아낸다.
    const image = await getImageFromClipboard();
    if (!image) return;
    const index = getIndexFromCapture(dataArray, image);
    if (index < 0) return;
    // status에 index 등록한다.
    status.set('index', index);
    // 배경에 index.png 깔아놓는다.
    // const root = document.querySelector(':root');
    // root.style.setProperty('--src', `url(${index}.png)`);
    document.querySelector('#app').style.background = `url(${index}.png) 0 0`;
    document.querySelector('.selected')?.classList.remove('selected');
  }
};

window.addEventListener('focus', () => {
  console.log('window focused');
  focusHandler();
})
document.querySelector('#app').append(...Array(20).fill(0).map(_ => document.createElement('div')));
navigator?.clipboard?.read?.();
