let fs = require('fs');
let cp = require('child_process');
let isBuilding = false;

function build(fileName) {
  if (isBuilding) return;
  isBuilding = true;
  const date = new Date();
  console.log(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} - ${fileName} has changed, building now... ^_^`);
  cp.exec('npm run build', err => {
    setTimeout(() => {
      isBuilding = false;
    }, 300);
    if (err) return console.error(err);
    console.log('DONE!');
  });
}

console.log('watching file\'s change...');
fs.watch('./src/', { recursive: true }, (evt, fileName) => {
  build(fileName);
});

build('*');
