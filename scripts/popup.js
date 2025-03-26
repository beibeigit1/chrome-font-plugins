
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const resultDiv = document.getElementById('result');

// 进行中页面状态显示控制
function updateUIStatus(isRunning) {
  const statusIndicator = document.querySelector('.status-indicator');
  const statusText = document.querySelector('#resultStatus span:last-child');
  const loadingIndicator = document.getElementById('loadingIndicator');
  
  if (isRunning) {
    statusIndicator.classList.add('status-active');
    statusText.textContent = 'Collecting fonts...';
    loadingIndicator.style.display = 'block';
    stopButton.disabled = false;
    startButton.disabled = true;
  } else {
    statusIndicator.classList.remove('status-active');
    statusText.textContent = 'Ready';
    loadingIndicator.style.display = 'none';
    stopButton.disabled = true;
    startButton.disabled = false;
  }
}

function sendData(data,to,callback){
  chrome.runtime.sendMessage({
    from: 'popup',
    to: to||'content',
    data: { ...data }
  },(response)=>callback(response));
}
// 监听按钮点击
startButton.addEventListener('click', () => {
  const time = parseInt(document.getElementById('timeInput').value) * 1000; // 转换为毫秒
  const font = document.getElementById('fontInput').value.trim();
  if (!time || !font) {
    resultDiv.textContent = 'Please enter valid time and font name.';
    return;
  }
  sendData({ time, font, key:'start_collect' },'content',(response)=>null);
  updateUIStatus(true);
});

stopButton.addEventListener('click', () => {
  sendData({ key:'stop_collect' },'content',(response)=>null);
})


// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request) => {
  if (request.from === 'content' && request.to === 'popup') {
    console.log('Message from content:', request.data);
    if (request.data.key === 'collect_result') {
      resultDiv.innerText = `${request.data.result}`;
      updateUIStatus(false);
    }
  }
});


document.addEventListener('DOMContentLoaded', () => {
    sendData({ key:'get_data' },'background',(response)=>{
      if(!response?.isCollecting){
        resultDiv.innerText = `${response?.result}`;
      }
      updateUIStatus(response?.isCollecting);
    });
    
  
});

