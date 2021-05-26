// let date = new Date();
// console.log(date)
// console.log(date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())

// 10:15~11:45까지 28번에 걸쳐서

// const outTimer = 
const audio = document.createElement('audio');
audio.src = './beep.mp3';

const day = 864e5;
const start = 369e5;
const end = 855e5;

let count = 0;
let timer = null;

const eraseBoard = i => {
  console.log('eraseBoard', i)
  document.querySelector('#main').innerHTML = '';
};
const f2 = () => {
  if (count > 27) {
    clearInterval(timer);
    asdf();
    return;
  }
  console.log('NOW!')
  audio.play();
  // [73500, 95750, 117800, 143500, 181100, 215700, 249250, 287800]
  [74000, 94000, 115000, 139000, 175000, 207000, 240000, 279000].forEach((v, i) => {
    setTimeout(eraseBoard, v, i);
  });
};
const f = () => {
  f2();
  timer = setInterval(f2, 18e5);
};
const setTimer = (delay, i) => {
  count = i;
  setTimeout(f, delay);
};

const asdf = () => {
  let date = new Date();
  let [h, m, s, ms] = [date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()];
  let t = 36e5 * h + 6e4 * m + 1e3 * s + ms;
  console.log(start, end, t)
  if (t <= start) {
    // outbound 1
    console.log('outbound1')
    setTimer(start - t, 0);
  } else if (t > end) {
    // outbound 2
    console.log('outbound2')
    setTimer(day - t + start, 0);
  } else {
    // inbound
    console.log('inbound')
    let i = Math.ceil((t - start) / 18e5);
    setTimer(start + 18e5 * i - t, i);
  }
};
asdf();
