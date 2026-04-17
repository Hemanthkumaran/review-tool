export const DEFAULT_REVIEW_FPS = 30;

const STANDARD_FRAME_RATES = [24, 25, 30, 50, 60, 120];

export function normalizeVideoFps(value, fallback = DEFAULT_REVIEW_FPS) {
  const fps = Number(value);

  if (!Number.isFinite(fps) || fps <= 0) {
    return fallback;
  }

  if (fps >= 26.5 && fps <= 31) return 30;
  if (fps >= 54 && fps <= 61) return 60;
  if (fps >= 47 && fps <= 53) return 50;
  if (fps >= 23 && fps < 24.5) return 24;
  if (fps >= 24.5 && fps < 26.5) return 25;
  if (fps >= 115 && fps <= 121) return 120;

  const nearest = STANDARD_FRAME_RATES.reduce((best, rate) =>
    Math.abs(rate - fps) < Math.abs(best - fps) ? rate : best
  );

  return Math.abs(nearest - fps) <= 1 ? nearest : Math.max(1, Math.round(fps));
}

export function timeToFrame(time, fps) {
  const normalizedFps = normalizeVideoFps(fps);
  const safeTime = Number(time);

  if (!Number.isFinite(safeTime) || safeTime <= 0) {
    return 0;
  }

  return Math.max(0, Math.round(safeTime * normalizedFps));
}

export function frameToTime(frame, fps) {
  const normalizedFps = normalizeVideoFps(fps);
  const safeFrame = Number(frame);

  if (!Number.isFinite(safeFrame) || safeFrame <= 0) {
    return 0;
  }

  return Math.max(0, Math.round(safeFrame) / normalizedFps);
}

export function snapTimeToFrame(time, fps, duration) {
  const safeDuration = Number(duration);
  const hasDuration = Number.isFinite(safeDuration) && safeDuration > 0;
  const safeTime = Number(time);

  if (!Number.isFinite(safeTime) || safeTime <= 0) {
    return 0;
  }

  if (hasDuration && safeTime >= safeDuration) {
    return safeDuration;
  }

  const snappedTime = frameToTime(timeToFrame(safeTime, fps), fps);

  return hasDuration ? Math.min(snappedTime, safeDuration) : snappedTime;
}

export function getFrameSeekTime(frame, fps, duration) {
  const normalizedFps = normalizeVideoFps(fps);
  const safeDuration = Number(duration);
  const hasDuration = Number.isFinite(safeDuration) && safeDuration > 0;
  const exactTime = frameToTime(frame, normalizedFps);
  const seekBias = 0.25 / normalizedFps;

  if (!hasDuration) {
    return exactTime + seekBias;
  }

  return Math.min(exactTime + seekBias, safeDuration);
}

export function getSnappedSeekTime(time, fps, duration) {
  return getFrameSeekTime(timeToFrame(time, fps), fps, duration);
}

export function getFrameFromMarker(marker, fps) {
  const frame = Number(marker?.frame);

  if (Number.isFinite(frame)) {
    return Math.max(0, Math.round(frame));
  }

  return timeToFrame(marker?.time, fps);
}

export function getTimeFromMarker(marker, fps, duration) {
  const frame = Number(marker?.frame);

  if (Number.isFinite(frame)) {
    return snapTimeToFrame(frameToTime(frame, fps), fps, duration);
  }

  return snapTimeToFrame(marker?.time, fps, duration);
}
