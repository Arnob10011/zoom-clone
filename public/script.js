const socket = io("/");

const myVideo = document.createElement("video");
const videoGrid = document.querySelector("#video-grid");
myVideo.muted = true;
let myVideoStream;

const peer = new Peer();

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;

    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      console.log(userId);
      connectToNewUser(userId, stream);
    });
  });

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

//

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

async function addVideoStream(video, stream) {
  video.srcObject = stream;

  // event listener
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });

  videoGrid.append(video);
}

const text = document.querySelector("#chat_message");
const html = document.querySelector("html");

html.addEventListener("keydown", (e) => {
  if (e.which == 13 && text.value.length !== 0) {
    socket.emit("message", text.value);

    text.value = "";
  }
});

socket.on("createMessage", (message) => {
  const ul = document.querySelector("ul");
  let li = document.createElement("li");

  li.innerHTML = `<li class= "message" ><b>user</b><span>${message}</span> </li> `;

  ul.append(li);

  scrollToButton();
});

function scrollToButton() {
  let mainChatWindow = document.querySelector(".main__chat_window");
  mainChatWindow.scrollTop = mainChatWindow.scrollHeight;
}

document
  .querySelector(".main__mute_button")
  .addEventListener("click", muteUnute);

function muteUnute() {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnMute();
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    setMute();
  }
}

function setUnMute() {
  const html = `<i class="unmute fas fa-microphone-slash "></i>
                <span>Unmute</span>
  
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
}

function setMute() {
  const html = `<i class="fas fa-microphone"></i>
                <span>Mute</span>
  
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
}

document
  .querySelector(".main__video_button")
  .addEventListener("click", playStop);

function playStop() {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    setStopVideo();
  }
}

function setPlayVideo() {
  const html = `
  <i class=" fas fa-video-slash "></i>
    <span>Start Video</span>
   
  `;

  document.querySelector(".main__video_button").innerHTML = html;
}

function setStopVideo() {
  const html = `
  <i class="fas fa-video"></i>
      <span>Stop Video</span>
  
  
  `;

  document.querySelector(".main__video_button").innerHTML = html;
}
