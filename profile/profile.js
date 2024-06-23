import { getUserLocation } from "./getLocation.js";
import { startRecording, stopRecording } from "./getAudio.js";

const imageInput = document.getElementById("editBgIcon");
const imageInput2 = document.getElementById("editBgIcon2");
const imageInput3 = document.getElementById("editBgIcon3");
const imagePreview = document.getElementById("preview");
const imagePreview2 = document.getElementById("preview2");
const startRecordingBtn = document.getElementById("startRecording");
const stopRecordingBtn = document.getElementById("stopRecording");
const audioContainer = document.getElementById("audioContainer");
const recordContainer = document.getElementById("recordContainer");
const deleteRecordingBtn = document.getElementById("deleteRecording");

imageInput.style.display = "none";
imageInput2.style.display = "none";
imageInput3.style.display = "none";

imageInput.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      imagePreview.src = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.src = "#";
  }
});

imageInput2.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      imagePreview2.src = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview2.src = "#";
  }
});

document.getElementById("address").addEventListener("click", () => {
  getUserLocation();
});

startRecordingBtn.addEventListener("click", (e) => {
  e.preventDefault();
  recordContainer.innerHTML = `Recording...`;
  startRecording();
});

stopRecordingBtn.addEventListener("click", (e) => {
  e.preventDefault();
  recordContainer.style.display = "none";
  deleteRecordingBtn.style.display = "inline-block";
  stopRecording();
});

deleteRecordingBtn.addEventListener("click", (e) => {
  e.preventDefault();

  localStorage.removeItem("audio");
  audioContainer.innerHTML = "";
});

const bars = document.getElementById("icon");
const sidebar = document.getElementById("sidebar");

let visible = true;

bars.addEventListener("click", () => {
  if (visible == true) {
    bars.innerHTML = `✖`;
    visible = false;
    sidebar.style.left = "0px";
  } else {
    bars.innerHTML = `☰`;
    visible = true;
    sidebar.style.left = "-250px";
  }
});
