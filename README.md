# VideoTrimmer

Video Trimmer is designed to allow users to upload a video,
add trim markers within the video, and then trim it. After trimming, 
users can obtain the trimmed video segments.

## Description

The video trimmer is designed to simplify the video editing process.It allows users to return to the editing interface at any time to make further adjustments to their videos. 
Before finalizing cuts, users can preview the specific segments they wish to trim, ensuring everything is accurate and just right. 
Once satisfied with the edits, downloading the trimmed videos directly to their devices is quick and easy. 
Users can place trim markers on the video timeline to highlight the exact points where they want to make cuts,
and if adjustments are needed, removing these markers is a straightforward process. Additionally, the tool provides 
the option to delete any trimmed videos that are no longer needed. With these features, the video trimmer streamlines 
the editing experience, allowing users to create polished videos with minimal hassle.


## Features include

- **Back to Edit**: It allows returning to the editing interface to make further adjustments to the video.
- **Preview Selected Segment**: It allows previewing the specific segment selected for trimming, ensuring accuracy before finalizing the cut.
- **Download**: It allows downloading the trimmed videos directly to the device.
- **Add Trim Markers**: It allows placing trim markers on the video timeline to specify where to cut the video.
- **Remove Markers**: It allows easily removing trim markers if adjustments are needed.
- **Remove Trimmed Video**: It allows deleting trimmed videos.

## Packages Used

### ffmpeg
- **Purpose:** Video Trimming
- **Description:** Utilizes `ffmpeg.wasm` to enable efficient video trimming directly in the browser.This package allows users to specify start and end points for their video, ensuring they can easily create clips from longer videos.

### FilePond
- **Purpose:** File Uploading
- **Description:** Implements drag-and-drop file uploads for a seamless user experience. `FilePond` supports various file types, allowing users to view file previews and receive feedback during the upload process.


## Installation and Usage

To get started with the Video Trimmer, you can easily install it using the following command:-

```
npm i video-trimmer
```

Then click [here](https://github.com/gzuidhof/coi-serviceworker/blob/master/coi-serviceworker.min.js) to download the js file required for the trimming process.

Now, add the link to the JavaScript file in your HTML file.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video Trimmer</title>
</head>
<body>
    <script src="coi-serviceworker.min.js"></script>
</body>
</html>
```

From this package, you will receive an exported class that enables you to pass to arguments:

```js
new VideoTrimmer('.trimmer','url'); 
```

- The first argument, '.trimmer', is a selector that identifies the specific DOM element where the Video Trimmer will be applied,ensuring that it is the only one of its kind on that page.
- The second argument, 'url', is the backend URL where you want to store your trimmed video.

Integrating the Package into Your HTML File:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video Trimmer</title>
</head>
<body>
    <div class="trimmer"></div>
    <script src="coi-serviceworker.min.js"></script>
    <script type="module">
        import VideoTrimmer from "./node_modules/video-trimmer/dist/main.js";
        const video = new VideoTrimmer('.trimmer','url');
    </script>
</body>
</html>
```

## Screenshots:

### Upload your video by manually selecting it or by using drag and drop option:

![image](https://video-trimmer-demo.vercel.app/screenshots/image_upload.PNG)

### Select the video part which you want to trim with the help of marker and then click on trim video:

![image](https://video-trimmer-demo.vercel.app/screenshots/trimming_video.PNG)

### Trimmed video results:

![image](https://video-trimmer-demo.vercel.app/screenshots/trimmed_results.PNG)

## Demo Link:

click [here](https://video-trimmer-demo.vercel.app/)
<div align="center">
  <h3>🌟 Made with ❤️ by Maurya Soni</h3>
  <p>
    <a href="https://github.com/mauryasoni2201">GitHub</a> •
    <a href="https://www.linkedin.com/in/mauryasoni/">LinkedIn</a> •
  </p>
</div>