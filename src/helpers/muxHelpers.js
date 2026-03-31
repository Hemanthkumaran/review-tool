import dummy from "../assets/images/dummy.svg";

export function uploadToMux(muxUploadURL, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", muxUploadURL, true);

    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream"
    );

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(pct);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error("Mux upload failed"));
      }
    };

    xhr.onerror = reject;
    xhr.send(file);
  });
}


export function getMuxThumbnail(playbackId) {
  if (playbackId) {
    return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=1&width=640`
  }
  return dummy;
}

export const getMuxGif = (playbackId) => {
  if (playbackId) {
    return `https://image.mux.com/${playbackId}/animated.gif?start=1&end=4&width=480&fps=10`;
  }
  return dummy;
};

export function getVideoDuration(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);

      const durationInMinutes = video.duration / 60;
      resolve(durationInMinutes); // minutes (float)
    };

    video.onerror = () => {
      reject("Failed to load video metadata");
    };

    video.src = URL.createObjectURL(file);
  });
}

export const getVideoFPS = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;

    let frameCount = 0;
    let startTime = null;

    video.onloadeddata = async () => {
      try {
        await video.play();

        const measureDuration = 1000; // 1 second

        const loop = (now) => {
          if (!startTime) startTime = now;

          frameCount++;

          const elapsed = now - startTime;

          if (elapsed >= measureDuration) {
            const fps = frameCount / (elapsed / 1000);
            video.pause();
            resolve(Math.round(fps));
            return;
          }

          video.requestVideoFrameCallback(loop);
        };

        if (video.requestVideoFrameCallback) {
          video.requestVideoFrameCallback(loop);
        } else {
          reject("requestVideoFrameCallback not supported");
        }
      } catch (err) {
        reject(err);
      }
    };

    video.onerror = (e) => reject(e);
  });
};