let file;
const [inputFile, selectSplit, divNumber, divSize, button, result] = [
  'file', 'split', 'number', 'size', 'button', 'result'
].map(id => document.querySelector('#' + id));
const [liFileName, liFileSize] = document.querySelectorAll('#fileInfo > li');
const [inputNumber, inputSize] = [divNumber, divSize].map(div => div.querySelector('input'));
const selectSize = divSize.querySelector('select');
const checkboxZip = document.querySelector('input[type=checkbox]');

const sizeUnit = ['B', 'KB', 'MB', 'GB', 'TB'];
const sizeToString = size => {
  let i = ~~(Math.log2(size) / 10);
  // console.log(size, i)
  return (size / (1 << i * 10)).toFixed(2).replace(/0$|\.00$/, '') + sizeUnit[i];
};
const fileChangeHandler = () => {
  file = inputFile.files[0];
  // info
  document.querySelector('.info').style.display = '';
  liFileName.innerHTML = 'Name: ' + file.name;
  liFileSize.innerHTML = 'Size: ' + sizeToString(file.size);
};
inputFile.addEventListener('change', fileChangeHandler);

const splitChangeHandler = () => {
  if (selectSplit.value === 'number') {
    divNumber.style.display = '';
    divSize.style.display = 'none';
  } else {
    divNumber.style.display = 'none';
    divSize.style.display = '';
  }
};
selectSplit.addEventListener('change', splitChangeHandler);
splitChangeHandler(); // default


const split = async (file, size, zip) => {
  let n = Math.ceil(file.size / size);
  let blobMap = new Map();
  for (let i = 0; i < n; ++i) {
    let name = file.name + '.' + ('00' + (i + 1)).slice(-3);
    let byteStart = i * size;
    let byteEnd = byteStart + size;
    let blob = file.slice(byteStart, byteEnd, 'application/octet-stream');
    blobMap.set(name, blob);
  }
  if (zip) {
    let zip = new JSZip();
    for (const [name, blob] of blobMap) {
      zip.file(name, blob);
    }
    let zipMap = new Map();
    zipMap.set(file.name + '.zip', await zip.generateAsync({ type: "blob" }));
    console.log(zipMap)
    return zipMap;
  } else {
    return blobMap;
  }
};

button.addEventListener('click', async () => {
  try {
    let size = selectSplit.value === 'number' ? Math.ceil(file.size / +inputNumber.value) : inputSize * +selectSize;
    let zip = checkboxZip.checked;
  
    button.disabled = true;
    let blobMap = await split(file, size, zip);
    button.disabled = false;
  
    result.innerHTML = '';
    for (const [name, blob] of blobMap) {
      let p = document.createElement('p');
      let a = document.createElement('a');
      a.innerHTML = name;
      // a.target = '_blank';
      a.download = name;
      a.href = URL.createObjectURL(blob);
      p.append(a);
      result.append(p);
    }
  } catch (err) {
    result.innerHTML = err;
  }
});