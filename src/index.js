import * as FilePond from "filepond";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import addImage from "./assets/images/add.png";
import closeModalButton from "./assets/images/close.png";
import downloadImage from "./assets/images/download.png";
import editButton from "./assets/images/edit.png";
import removeImage from "./assets/images/remove.png";
import saveButton from "./assets/images/save.png";
import "filepond/dist/filepond.min.css";
import "./index.css";

const ffmpeg = createFFmpeg({ log: false });
export default class VideoTrimmer {
  constructor(element, url) {
    this.videoState = {
      link: "",
      file: null,
    };
    this.element = element;
    this.url = url;
    this.trimmedVideos = [];
    this.sliders = [];
    this.init();
  }
  init() {
    const trimmerDiv = window.document.querySelector(`${this.element}`);
    trimmerDiv.innerHTML = `
    <div class="trimmer-modal-wrapper">
          <div class="trimmer-modal">
        <div class="modal-header">
          <div class="modal-heading">
            <h1>Trim Video</h1>
          </div>
          <div class="modal-close-button">
            <button id="closeButton">
              <img
                width="16"
                height="15"
                src=${closeModalButton}
                alt="close-button"
              />
            </button>
          </div>
        </div>
        <div class="modal-content">
            <div class="video-upload-input-form">
        <div class="trimmer-container">
          <div class="video-upload-wrapper">
            <input type="file" id="filepond" accept="video/mp4,video/webm" />
          </div>
        </div>
        <div class="video-upload-instructions">
          <p>Maximum upload video size: 1GB.</p>
          <p>Accepted Format: MP4, WEBM</p>
        </div>
      </div>
        </div>
        <div class="modal-footer"></div>
      </div>
      </div>
      <div id="backdrop" class="modal-backdrop"></div>
    `;
    this.initializeFilePond();
    const closeButton = window.document.getElementById("closeButton");
    closeButton.addEventListener("click", () => {
      const trimmerModal =
        window.document.getElementsByClassName("trimmer-modal")[0];
      const backDrop = window.document.getElementById("backdrop");
      trimmerModal.classList.add("hide-content");
      backDrop.classList.add("hide-content");
      this.trimmedVideos = [];
      this.sliders = [];
      this.videoState.file = null;
      this.videoState.link = null;
    });
  }
  initializeFilePond() {
    const modalContent =
      window.document.getElementsByClassName("modal-content")[0];
    const modalFooter =
      window.document.getElementsByClassName("modal-footer")[0];
    const inputElement = window.document.querySelector("#filepond");
    FilePond.create(inputElement, {
      allowMultiple: false,
      acceptedFileTypes: ["video/mp4", "video/webm"],
      maxFileSize: "1024MB",
      labelMaxFileSizeExceeded: "File is too large",
      labelMaxFileSize: "Maximum file size is 1GB",
      labelIdle: `
          <div class="file-upload-title">
            <p>Drop video here</p>
          </div>
          <div class="file-upload-options">
            <p>or</p>
          </div>
          <div>
            <span class="filepond--label-action">Select Video</span>
          </div>
        `,
      fileValidateTypeLabelExpectedTypesMap: {
        "video/mp4": ".mp4",
        "video/webm": ".webm",
      },
      onaddfile: (_, file) => {
        const videoFile = file.file;
        if (!videoFile.type.includes("video")) {
          setTimeout(() => {
            alert(`Please upload a video file.`);
          }, 500);
          return;
        }
        if (
          !(videoFile.type === "video/mp4" || videoFile.type === "video/webm")
        ) {
          setTimeout(() => {
            alert(`Please upload video in mp4 or webm format.`);
          }, 500);
          return;
        }
        const MAX_SIZE_IN_BYTES = 1 * 1024 * 1024 * 1024;
        if (videoFile.size > MAX_SIZE_IN_BYTES) {
          setTimeout(() => {
            alert(
              `The video file size should not exceed 1GB. Please upload a smaller file.`
            );
          }, 500);
          return;
        }
        const videoUrl = URL.createObjectURL(videoFile);
        this.videoState.link = videoUrl;
        this.videoState.file = file.file;
        modalContent.innerHTML = `
            <div class="video-trimmer">
              <div class="trimmer-container">
                <div class="video-player">
                  <div class="video-wrapper">
                    <video src=${
                      this.videoState.link
                    } controls class="view-video"></video>
                  </div>
                </div>
                <div class="video-timeline">
                  <div class="video-player-heading">
                    <h2>Video Timeline</h2>
                  </div>
                  <div class="video-player-options">
                    <button id="add-marker">
                      <img src=${`${addImage}`} alt="add-marker" height="16" width="18" />
                      <span>Add Trim Marker</span>
                    </button>
                  </div>
                </div>
                <div class="video-duration">
                  <div class="video-player-heading add-spacing">
                  <h2>Video Trim Markers</h2>
                 </div>
                  <ul class="sliders-container">
                  </ul>
                </div>
              </div>
            </div>
          `;
        const videoElement = window.document.querySelector(".view-video");
        videoElement.onloadedmetadata = this.videoDetails.bind(this);
        modalFooter.innerHTML = `<button id="trimvideo" class="modal-button">Trim Video</button>`;
        const trimVideo = window.document.getElementById("trimvideo");
        trimVideo.addEventListener("click", () => this.trimVideo());
      },
    });
  }
  videoDetails() {
    const video = window.document.querySelector(".view-video");
    const addButton = window.document.querySelector("#add-marker");
    this.sliders.push({ startTime: 0, endTime: video.duration });
    this.renderSliders();
    addButton.addEventListener("click", () => this.addNewSlider());
  }
  renderSliders() {
    const video = window.document.querySelector(".view-video");
    const slidersContainer =
      window.document.querySelector(".sliders-container");
    slidersContainer.innerHTML = "";
    this.sliders.forEach((slider, index) => {
      const grabberStart = `
          <div class="grabber start-grabber" style="left: ${
            (slider.startTime / video.duration) * 100
          }%;"></div>
        `;
      const grabberEnd = `
          <div class="grabber end-grabber" style="left: ${
            (slider.endTime / video.duration) * 100
          }%;"></div>
        `;
      const progressMarker = `
          <div class="video-progress-markers">
            <div class="progress" style="left: ${
              (slider.startTime / video.duration) * 100
            }%; width: ${
        ((slider.endTime - slider.startTime) / video.duration) * 100
      }%;"></div>
            <div class="video-details-and-options">
              <div class="video-information">
              <div class="video-name">
                <h3>Video ${index + 1}</h3>
                </div>
                <div class="video-time">${this.convertToHHMMSS(
                  slider.startTime
                )} - ${this.convertToHHMMSS(slider.endTime)}</div>
              </div>
              <div class="video-player-options">
                ${
                  this.sliders.length > 1
                    ? `<button class="remove-marker">
                <img src=${`${removeImage}`}>
                Remove
                </button>`
                    : ""
                }
              </div>
            </div>
          </div>
        `;
      slidersContainer.insertAdjacentHTML(
        "beforeend",
        `<li>${grabberStart}${grabberEnd}${progressMarker}</li>`
      );
      const startGrabber =
        slidersContainer.lastChild.querySelector(".start-grabber");
      const endGrabber =
        slidersContainer.lastChild.querySelector(".end-grabber");
      this.makeGrabberDraggable(startGrabber, index, true);
      this.makeGrabberDraggable(endGrabber, index, false);
    });
    const removeMarkers = window.document.querySelectorAll(".remove-marker");
    removeMarkers.forEach((_, i) => {
      removeMarkers[i].addEventListener("click", () => this.removeSlider(i));
    });
  }
  convertToHHMMSS(val) {
    const secNum = parseInt(val, 10);
    let hours = Math.floor(secNum / 3600);
    let minutes = Math.floor((secNum - hours * 3600) / 60);
    let seconds = secNum - hours * 3600 - minutes * 60;
    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    let time;
    if (hours === "00") {
      time = minutes + ":" + seconds;
    } else {
      time = hours + ":" + minutes + ":" + seconds;
    }
    return time;
  }
  makeGrabberDraggable(grabber, sliderIndex, isStartGrabber) {
    let isDragging = false;
    const video = window.document.querySelector(".view-video");
    if (isStartGrabber) {
      grabber.addEventListener("click", () => {
        video.currentTime = this.sliders[sliderIndex].startTime;
        video.play();
        const checkEndTime = () => {
          if (video.currentTime >= this.sliders[sliderIndex].endTime) {
            video.pause();
            video.currentTime = this.sliders[sliderIndex].startTime;
            video.removeEventListener("timeupdate", checkEndTime);
          }
        };
        video.addEventListener("timeupdate", checkEndTime);
      });
    }
    grabber.addEventListener("mousedown", (e) => {
      isDragging = true;
      window.document.addEventListener("mousemove", handleMouseMove);
    });
    window.document.addEventListener("mouseup", () => {
      isDragging = false;
      window.document.removeEventListener("mousemove", handleMouseMove);
    });
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const rect = video.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const newTime = (offsetX / rect.width) * video.duration;
      if (isStartGrabber) {
        if (newTime < this.sliders[sliderIndex].endTime) {
          this.sliders[sliderIndex].startTime = Math.max(newTime, 0);
          video.currentTime = this.sliders[sliderIndex].startTime;
        }
      } else {
        if (newTime > this.sliders[sliderIndex].startTime) {
          this.sliders[sliderIndex].endTime = Math.min(newTime, video.duration);
        }
      }
      this.renderSliders();
    };
  }
  addNewSlider() {
    if (this.sliders.length === 0) return;
    let longestSlider = this.sliders[0];
    this.sliders.forEach((slider) => {
      if (
        slider.endTime - slider.startTime >
        longestSlider.endTime - longestSlider.startTime
      ) {
        longestSlider = slider;
      }
    });
    const midTime = (longestSlider.startTime + longestSlider.endTime) / 2;
    const newSlider = {
      startTime:
        midTime - 0.25 * (longestSlider.endTime - longestSlider.startTime),
      endTime:
        midTime + 0.25 * (longestSlider.endTime - longestSlider.startTime),
    };
    this.sliders.push(newSlider);
    this.renderSliders();
  }
  removeSlider(index) {
    this.sliders = this.sliders.filter((_, i) => index !== i);
    this.renderSliders();
  }
  renderResultsTable() {
    const modalContent =
      window.document.getElementsByClassName("modal-content")[0];
    let content = ``;
    for (let i = 0; i < this.trimmedVideos.length; i++) {
      content += `
          <tr key="${i}">
                      <td class="video-preview-option">
                        <video
                          width="100%"
                          height="161px"
                          src=${this.trimmedVideos[i].url}
                          controls
                        />
                      </td>
                      <td class="video-edit-name">
                       <div class="edit-trimmedvideoname">
              <div class="trimmed-videoname">${this.trimmedVideos[i].name}</div>
              <div class="edit-toggle">
                <button class="editname">
                  <img src=${`${editButton}`} alt="edit-button" height={17} width={16} />
                  <span>Edit</span>
                </button>
              </div>
            </div>      
            <div style="display:none;" class="edit-name">
    <input
      placeholder="Enter video name"
      class="update-trimmed-video-name"
      type="text"
      value=${this.trimmedVideos[i].name}
      required
    />
    <div>
      <div class="edit-toggle">
        <button class="savebutton">
          <img
            src=${`${saveButton}`}
            alt="edit-button"
            height="17"
            width="16"
          />
          <span>Save</span>
        </button>
      </div>
    </div>
    </div>
            
                      </td>
                      <td class="duration">${
                        this.trimmedVideos[i].duration
                      }</td>
                      <td class="options">
                        <div class="video-trimming-options">
                          ${
                            this.trimmedVideos.length > 1
                              ? `<div class="video-player-options">
                              <button class="removevideo">
                                <img
                                  src=${`${removeImage}`}
                                  alt="remove-button"
                                  height="16"
                                  width="13"
                                />
                              </button>
                            </div>`
                              : ""
                          }
                          <div class="video-player-options">
                            <a href=${
                              this.trimmedVideos[i].url
                            } class="button" download>
                              <img
                                src=${`${downloadImage}`}
                                alt="download-button"
                                height="16"
                                width="13"
                              />
                            </a>
                          </div>
                        </div>
                      </td>
                    </tr>
        `;
    }
    modalContent.innerHTML = `
          <div class="results-table-wrapper">
          <div class="trimmer-container">
            <div class="video-timeline trimmed-videos">
              <div class="video-player-heading">
                <h2>Trimmed Videos</h2>
              </div>
              <div class="video-player-options">
                <button id="backtoedit">Back To Edit</button>
              </div>
            </div>
            <table id="results">
              <thead>
                <tr>
                  <th>Video Preview</th>
                  <th>Video Name</th>
                  <th>Duration</th>
                  <th>Options</th>
                </tr>
              </thead>
              <tbody>
              ${content}
              </tbody>
            </table>
          </div>
        </div>`;
    const backToEdit = window.document.getElementById("backtoedit");
    backToEdit.addEventListener("click", () => this.renderVideoPlayer());
    const editButtons = window.document.querySelectorAll(".editname");
    editButtons.forEach((element, index) => {
      element.addEventListener("click", () => this.handleUpdateName(index));
    });
    const saveButtons = window.document.querySelectorAll(".savebutton");
    saveButtons.forEach((element, index) => {
      element.addEventListener("click", () => this.handleSavingName(index));
    });
    const removeVideo = window.document.querySelectorAll(".removevideo");
    removeVideo.forEach((element, index) => {
      element.addEventListener("click", () => this.removeTrimmedVideo(index));
    });
  }
  async loadFFmpeg() {
    if (!this.ffmpeg) {
      this.ffmpeg = createFFmpeg({ log: false });
      await this.ffmpeg.load();
    }
  }
  async trimVideo() {
    const modalContent = document.getElementsByClassName("modal-content")[0];
    const modalFooter = document.getElementsByClassName("modal-footer")[0];
    await this.loadFFmpeg();
    modalContent.innerHTML = `
        <div class="loader-container">
            <div class="loading"></div>
        </div>
    `;
    modalFooter.innerHTML = "";
    const videoFormat = this.videoState.file.type.split("/")[1];
    const accurateSliders = this.sliders.map((element) => {
      return {
        startTime: parseInt(element.startTime),
        endTime: parseInt(element.endTime),
      };
    });
    for (let i = 0; i < this.sliders.length; i++) {
      await this.ffmpeg.FS(
        "writeFile",
        `input_${i + 1}.${videoFormat}`,
        await fetchFile(this.videoState.file)
      );
      const duration =
        accurateSliders[i].endTime - accurateSliders[i].startTime;
      await this.ffmpeg.run(
        `-ss`,
        `${accurateSliders[i].startTime}`,
        `-i`,
        `input_${i + 1}.${videoFormat}`,
        `-t`,
        `${duration}`,
        `-c`,
        `copy`,
        `video_${i + 1}.${videoFormat}`
      );
      const data = this.ffmpeg.FS("readFile", `video_${i + 1}.${videoFormat}`);
      const outputBlob = new Blob([data.buffer], {
        type: this.videoState.file.type,
      });
      const url = URL.createObjectURL(outputBlob);
      this.trimmedVideos.push({
        name: `video${i + 1}`,
        url,
        duration: this.convertToHHMMSS(duration),
        type: this.videoState.file.type,
      });
    }
    this.renderResultsTable();
    modalFooter.innerHTML = `<button id="addlessons" class="modal-button">Submit</button>`;
    const addLessons = document.getElementById("addlessons");
    addLessons.addEventListener("click", () => this.sendVideos());
  }
  renderVideoPlayer() {
    const modalContent =
      window.document.getElementsByClassName("modal-content")[0];
    const modalFooter =
      window.document.getElementsByClassName("modal-footer")[0];
    modalContent.innerHTML = `
          <div class="video-trimmer">
              <div class="trimmer-container">
                <div class="video-player">
                  <div class="video-wrapper">
                    <video src=${this.videoState.link} controls class="view-video"></video>
                  </div>
                </div>
                <div class="video-timeline">
                  <div class="video-player-heading">
                    <h2>Video Timeline</h2>
                  </div>
                  <div class="video-player-options">
                    <button id="add-marker">
                      <img src=${`${addImage}`} alt="add-marker" height="16" width="18" />
                      <span>Add Trim Marker</span>
                    </button>
                  </div>
                </div>
                <div class="video-duration">
                  <ul class="sliders-container"></ul>
                </div>
              </div>
            </div>
      `;
    modalFooter.innerHTML = `<button id="trimvideo" class="modal-button">Trim Video</button>`;
    const trimVideo = window.document.getElementById("trimvideo");
    const addButton = window.document.querySelector("#add-marker");
    trimVideo.addEventListener("click", () => this.trimVideo());
    addButton.addEventListener("click", () => this.addNewSlider());
    this.trimmedVideos = [];
    const video = window.document.querySelector(".view-video");
    video.addEventListener("loadedmetadata", () => {
      this.renderSliders();
    });
  }
  async sendVideos() {
    const response = await window.fetch(`${this.url}`, {
      method: "POST",
      body: JSON.stringify(this.trimmedVideos),
      headers: {
        "Content-type": "application/json",
      },
    });
    if (!response.ok) {
      alert(`Error occured while sending trimmed videos.`);
    } else {
      alert(`Video files sent successfully.`);
    }
  }
  removeTrimmedVideo(index) {
    this.trimmedVideos = this.trimmedVideos.filter((_, i) => index !== i);
    this.sliders = this.sliders.filter((_, i) => index !== i);
    this.renderResultsTable();
  }
  handleUpdateName(index) {
    const editName = window.document.getElementsByClassName(
      "edit-trimmedvideoname"
    )[index];
    const openForm = window.document.getElementsByClassName("edit-name")[index];
    editName.style.display = "none";
    openForm.style.display = "flex";
  }
  handleSavingName(index) {
    const editName = window.document.getElementsByClassName(
      "edit-trimmedvideoname"
    )[index];
    const openForm = window.document.getElementsByClassName("edit-name")[index];
    const inputValue = window.document.getElementsByClassName(
      "update-trimmed-video-name"
    )[index];
    if (inputValue.value === "") {
      alert(`Please enter an valid video name.`);
      return;
    }
    this.trimmedVideos[index].name = inputValue.value;
    editName.style.display = "flex";
    openForm.style.display = "none";
    this.renderResultsTable();
  }
}
