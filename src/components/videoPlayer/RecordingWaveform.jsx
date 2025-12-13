import { useEffect, useRef } from "react";

export default function RecordingWaveform({ analyserRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = 3;
      const gap = 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 255;
        const h = v * canvas.height;

        ctx.fillStyle = "#F9F046";
        ctx.fillRect(x, canvas.height - h, barWidth, h);
        x += barWidth + gap;

        if (x > canvas.width) break;
      }
    };

    draw();
  }, [analyserRef]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={60}
      className="w-full h-[60px]"
    />
  );
}
