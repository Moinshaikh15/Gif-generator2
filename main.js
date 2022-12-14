//let canvas = document.getElementById("bitmap");
let canvas = document.createElement("canvas");
canvas.classList.add("bitmap");
canvas.width = 300;
canvas.height = 400;
let context = canvas.getContext("2d");
let from = document.getElementById("from");
let to = document.getElementById("to");
let message = document.getElementById("msg");
let encoder = new GIFEncoder();

let paramString = window.location.href.split("?")[1];
let queryString = new URLSearchParams(paramString);
for (let pair of queryString.entries()) {
  if (pair[0] === "to") {
    to = pair[1];
  }
  if (pair[0] === "message") {
    message = pair[1];
  }
  if (pair[0] === "from") {
    from = pair[1];
  }
}
console.log(to, from, message);

context.fillStyle = "rgb(255,255,255)";
context.fillRect(0, 0, canvas.width, canvas.height); //GIF can't do transparent so do white

let sleep = (time) => {
  return new Promise((resolve, rej) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

async function make_base(i) {
  //create new Image
  let base_image = new Image();
  // base_image.src = `/frames/GIF_no_text_4mb_1-${i} (dragged).jpg`;
  base_image.src = `https://uploads-ssl.webflow.com/63973973d862a90747f1f94f/63999308e1a38954e9da7488_GIF_no_text_4mb_1-${i}%20(dragged).jpg`;
  base_image.style.width = "300px";
  base_image.style.height = "400px";
  base_image.style.objectFit = "cover";
  await sleep(50); // wait for 50 milliseconds

  //Convert text in 3 lines
  let text2 = message;
  let textArr = text2.split(" ");
  let messageArr = ["", "", ""];
  let lineLength = 14;
  let j = 0;
  for (let i = 0; i < textArr.length; i++) {
    if (j <= 2) {
      if (
        `${messageArr[j]} ${textArr[i]}`.length > lineLength ||
        messageArr[j].length > lineLength
      ) {
        j++;
      }
      if (`${messageArr[j]} ${textArr[i]}`.length <= lineLength)
        messageArr[j] += textArr[i] + " ";
    }
  }

  // base_image.onload = function () {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(base_image, 0, 0, 300, 400);

  //from text
  context.font = "100 18pt Poppins";
  context.fontWeight = "400";
  context.fillStyle = "rgb(255,255,255)";
  context.fillText(`To: ${to}`, 30, 90);

  //message
  context.font = "24pt Poppins";
  let lineHeight = 140;
  for (let i = 0; i < messageArr.length; i++) {
    lineHeight += 35;
    context.fillText(`${messageArr[i]} `, 30, lineHeight);
  }

  //to text
  context.font = "18pt Poppins";
  context.fillText(`From: ${from}`, 130, 320);

  // };
}

async function createGIF() {
  encoder.setRepeat(0); //0  -> loop forever //1+ -> loop n times then stop
  encoder.setDelay(100); //go to next frame every 100 milliseconds
  encoder.setSize(300, 400); //set the size of frame
  encoder.setQuality(19);
  encoder.start();
  for (let i = 1; i <= 72; i++) {
    await make_base(i);
    encoder.addFrame(context);
  }
  encoder.finish();
  var binary_gif = encoder.stream().getData(); //notice this is different from the as3gif package!
  var data_url = "data:image/gif;base64," + encode64(binary_gif);
  document.getElementById("image").src =
    "data:image/gif;base64," + encode64(encoder.stream().getData());
  // encoder.download("download.gif");
}
//createGIF();

let download = () => {
  encoder.download("christmasCard.gif");
};
