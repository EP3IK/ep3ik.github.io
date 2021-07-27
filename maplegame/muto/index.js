const getImageFromUrl = async src => new Promise(resolve => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.setAttribute('crossorigin', 'anonymous');
  image.src = src;
});

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

class Muto {
  constructor() {
    this.app = document.querySelector('#app');
    this.info = document.querySelector('#info');
    this.ingredients = [
      { name: '달달 발굽', pixel: '153,170,153', xy: [210, 166], array5: [0, 2], foothold: 1 },
      { name: '매콤 발굽', pixel: '153,170,0', xy: [210, 166], array5: [8, 10], foothold: 1 },
      { name: '느끼 껍질', pixel: '170,221,221', xy: [526, 166], array5: [1, 3, 6], foothold: 4 },
      { name: '새콤 껍질', pixel: '170,187,187', xy: [526, 166], array5: [9, 11, 14], foothold: 4 },
      { name: '담백 갈기', pixel: '204,0,255', xy: [74, 166], array5: [2, 4, 7], array10: [0], foothold: 2 },
      { name: '톡톡 갈기', pixel: '34,0,238', xy: [74, 166], array5: [10, 12, 15], array10: [8], foothold: 2 },
      { name: '폭신 발바닥', pixel: '255,238,153', xy: [662, 166], array5: [3, 6], array10: [1], foothold: 5 },
      { name: '쫀득 발바닥', pixel: '255,238,119', xy: [662, 166], array5: [11, 14], array10: [9], foothold: 5 },
      { name: '단단 물갈퀴', pixel: '170,0,153', xy: [52, 98], array5: [4, 5], array10: [2], foothold: 3 },
      { name: '시큼 물갈퀴', pixel: '17,0,153', xy: [52, 98], array5: [12, 13], array10: [10], foothold: 3 },
      { name: '바싹 등껍질', pixel: '51,51,51', xy: [684, 98], array5: [5, 7], array10: [3], foothold: 6 },
      { name: '말랑 등껍질', pixel: '17,17,17', xy: [684, 98], array5: [13, 15], array10: [11], foothold: 6 },
      { name: '미끈 깃털', pixel: '68,17,0', xy: [370, 106], array10: [4, 6], foothold: 7 },
      { name: '끈적 깃털', pixel: '0,0,0', xy: [370, 106], array10: [12, 14], foothold: 7 },
      { name: '텁텁 발톱', pixel: '187,0,153', xy: [370, 0], array10: [5, 7], foothold: 8 },
      { name: '쫄깃 발톱', pixel: '153,0,153', xy: [370, 0], array10: [13, 15], foothold: 8 },
      { name: '츄릅열매', pixel: '153,153,153', xy: [30, 20], array5: [6, 7, 14, 15] },
      { name: '?', pixel: '119,204,255', array5: Array.from({ length: 16 }, (_, i) => i), array10: Array.from({ length: 16 }, (_, i) => i) },
      { name: 'empty', array10: [0, 1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 13] }
    ];
    this.cuisines = [
      { name: '헉튀김', description: '헉소리나게 바삭한 튀김요리', composition: [[0, 5], [4, 10]] },
      { name: '앗볶음', description: '깨달음을 얻을 것 같은 볶음요리', composition: [[2, 5], [6, 10]] },
      { name: '이런면', description: '탱탱한 면발이 살아있는 면요리', composition: [[0, 5], [4, 5], [8, 10]] },
      { name: '저런찜', description: '특이한 조합이지만 맛좋은 찜요리', composition: [[2, 5], [6, 5], [10, 10]] },
      { name: '허허말이', description: '먹으면 허탈한 웃음이 나오는 요리', composition: [[4, 5], [8, 5], [12, 10]] },
      { name: '호호탕', description: '뜨거워서 호호 맛있어서 다시 호호', composition: [[8, 5], [10, 5], [14, 10]] },
      { name: '크헉구이', description: '충격적인 비쥬얼의 구이요리', composition: [[2, 5], [6, 5], [12, 10], [16, 1]] },
      { name: '으악샐러드', description: '둘이 먹다 하나가 으악! 하며 쓰러져도 모를 요리', composition: [[4, 5], [10, 5], [14, 10], [16, 1]] },
      { name: '낄낄볶음밥', description: '먹으면 행복함이 느껴지는 볶음밥', composition: [[1, 5], [5, 10]] },
      { name: '깔깔만두', description: '비웃음? 감탄? 어쨌든 웃게되는 요리', composition: [[3, 5], [7, 10]] },
      { name: '휴피자', description: '가슴 속 깊은 곳에서 한숨이 올라온다', composition: [[1, 5], [5, 5], [9, 10]] },
      { name: '하빵', description: '하하하하하 웃음만 나올 뿐인 빵요리', composition: [[3, 5], [7, 5], [11, 10]] },
      { name: '오잉피클', description: '재료가 궁금해지는 피클', composition: [[5, 5], [9, 5], [13, 10]] },
      { name: '큭큭죽', description: '먹으면 이성을 살려주는 죽요리', composition: [[9, 5], [11, 5], [15, 10]] },
      { name: '흑흑화채', description: '맑은 눈물 한 방울이 흐르는 화채', composition: [[3, 5], [7, 5], [13, 10], [16, 1]] },
      { name: '엉엉순대', description: '삶의 희노애락, 모든 것이 담긴 요리', composition: [[5, 5], [11, 5], [15, 10], [16, 1]] }
    ];
    this.footholds = [
      { xy: [300, 243, 200, 52] },
      { xy: [176, 166, 136, 68] },
      { xy: [40, 166, 136, 68] },
      { xy: [18, 98, 136, 68] },
      { xy: [492, 166, 136, 68] },
      { xy: [628, 166, 136, 68] },
      { xy: [650, 88, 136, 78] },
      { xy: [336, 106, 136, 68] },
      { xy: [336, 0, 136, 68] }
    ];
    this.init();
  }
  async init() {
    // get images
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    this.info.innerHTML = '데이터 다운로드 중...';
    for (const [name, size] of [['ingredients', 34], ['cuisines', 38]]) {
      canvas.width = canvas.height = size;
      const image = await getImageFromUrl(name + '.png');
      let y = 0;
      for (const obj of this[name]) {
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(image, 0, -y);
        obj.image = await getImageFromUrl(canvas.toDataURL());
        y += size;
      }
    }
    // create and put foothold divs in app
    for (let i = 0; i < 9; ++i) {
      const foothold = this.footholds[i];
      const [left, top, width, height] = foothold.xy;
      const div = document.createElement('div');
      div.classList.add('foothold');
      const image = await getImageFromUrl(`foothold/${i}.png`);
      image.style.left = left + 'px';
      image.style.top = top + 'px';
      div.append(image);
      foothold.image = image;
      this.app.querySelector('#map').append(div);
    }
    this.info.innerHTML = '데이터 다운로드 완료';
  }
  getCuisine(image) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    ctx.drawImage(image, 0, 0);
    const { data } = ctx.getImageData(0, 0, width, canvas.height);
    const uint32 = new Uint32Array(data.buffer);
    const pos = uint32.findIndex((v, i, a) => v === 0xff225544 && a[i + 1] === 0xff000000 && a[i + 2] === 0xff000000);
    const info = [];
    for (const [dx, dy] of [[116, 167], [116, 205], [276, 167], [276, 205]]) {
      const s = 4 * (pos + dx + dy * width);
      const pixel = [data[s], data[s + 4], data[s + 8]].join(',');
      const ingredient = this.ingredients.find(obj => obj.pixel === pixel) || this.ingredients[18];
      const need10 = data[s + 4 * (60 - 6 * width)] !== 255;
      info.push(ingredient['array' + (need10 ? 10 : 5)]);
    }
    const cuisineIdx = info.pop().find(x => info.every(arr => arr.includes(x)));
    return this.cuisines[cuisineIdx];
  }
  display(cuisine) {
    for (const foothold of this.footholds) {
      foothold.image.classList.remove('selected');
    }
    this.app.querySelectorAll('#map>.ingredient').forEach(div => div.remove());
    const imageDiv = this.app.querySelector('#answer>.image');
    imageDiv.innerHTML = '';
    imageDiv.append(cuisine.image);
    this.app.querySelector('#answer>.description').innerHTML = cuisine.description;
    this.app.querySelector('#answer>.name').innerHTML = cuisine.name;
    const ingredientsDiv = this.app.querySelector('#answer>.ingredients');
    ingredientsDiv.innerHTML = '';
    ingredientsDiv.append(...cuisine.composition.map(arr => {
      const [idx, count] = arr;
      const ingredient = this.ingredients[idx];
      
      const mapDiv = document.createElement('div');
      mapDiv.classList.add('ingredient');
      mapDiv.append(Object.assign(ingredient.image.cloneNode(true), {
        style: `left: ${ingredient.xy[0]}px; top: ${ingredient.xy[1]}px;`
      }));
      this.app.querySelector('#map').append(mapDiv);

      const ansDiv = document.createElement('div');
      this.footholds[ingredient.foothold]?.image.classList.add('selected');
      ansDiv.append(ingredient.image);
      ansDiv.innerHTML += `&nbsp;${ingredient.name}×${count}`;
      return ansDiv;
    }));
  }
  async focusHandler() {
    const image = await getImageFromClipboard();
    if (!image) {
      this.info.innerHTML = '클립보드 데이터에 이미지가 없습니다. 스크린샷을 찍어주세요.';
      return;
    }
    const cuisine = this.getCuisine(image);
    console.log(cuisine)
    if (!cuisine) {
      this.info.innerHTML = '요리 판독 실패. 스크린샷을 다시 찍어주세요.';
    }
    this.info.innerHTML = '요리 판독 완료.';
    this.display(cuisine);
  }
};

const muto = new Muto();
window.addEventListener('load', async () => {
  console.log('window loaded');
  navigator?.clipboard?.read?.();
  muto.focusHandler();
});
window.addEventListener('focus', () => {
  console.log('window focused');
  muto.focusHandler();
});