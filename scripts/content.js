// 存储AlibabaPuHuiTi字体的唯一字符
const uniqueChars = new Set();
let intervalId = null;

// 发送消息
function sendData(data){
  chrome.runtime.sendMessage({
    from: 'content',
    to: 'popup',
    data: { ...data }
  });
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.from === "popup" && request.to === "content") {
    console.log("Message from popup:", request.data);
    dealMessage(request.data);

    // 回复消息
    chrome.runtime.sendMessage({
      from: "content",
      to: "popup",
      data: { message: "Hello back from content script!" },
    });
  }
});

// 处理从popup发送过来的消息
function dealMessage({ key, ...params }) {
  switch (key) {
    case "start_collect":
      startMonitorFonts(params);
      break;
    case "stop_collect":
      stopCollect(params);
      break;
    default:
      break;
  }
}
function dealFont(font){
  // 移除空格和引号并转为小写
  return font.replace(/['"]+/g, '').replace(/\s+/g, '').toLowerCase();

}

// 检查是否为需要的字体
function isWhatINeedFont(curFont, needFont) {
  return curFont && dealFont(curFont).includes(dealFont(needFont));
}
function startCollect(params) {
  const allElements = document.querySelectorAll('body *:not(script):not(style):not(meta)');
  for (let element of allElements) {
    const style = window.getComputedStyle(element);
    const fontFamily = style.fontFamily;
    if (isWhatINeedFont(fontFamily, params.font)) {
      const text = element.textContent.trim();
      if (text) {
        // 将文本拆分为单个字符并添加到Set中
        for (let char of text) {
          uniqueChars.add(char);
        }
      }
    }
  }
  console.log(`已收集${uniqueChars.size}个字符`)
}

// 输出最终结果
function outputResult() {
  const result = Array.from(uniqueChars).join("");
  return result;
}

// 开始监听
function startMonitorFonts(params) {
  console.log(`开始监测页面${params.font}字体`);
  document.addEventListener('click', ()=>{
    startCollect(params);
  })

  // 1分钟（60秒）后停止并输出结果
  intervalId=setTimeout(() => {
    stopCollect();
  }, params.time);
}
// 监听页面是否有点击事件
  

// 结束监听
function stopCollect() {
  clearInterval(intervalId);
  intervalId = null;
  console.log("停止监测");
  const result = outputResult();
  sendData({ result,key:"collect_result" });
}
