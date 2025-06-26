// CameraFilter.tsx – Filtro cultural UNHEVAL con sobreposición de Negritos tipo demo visual

import React, { useState, useRef, useEffect } from "react";
import { Camera, X, Download } from "lucide-react";

const overlays = [
  "/overlays/negrito1.jpg",
  "/overlays/negrito2.jpg",
  "/overlays/curuchano1.jpg",
  "/overlays/curuchano2.jpg",
];

const getRandomOverlays = (count: number) => {
  const shuffled = [...overlays].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const CameraFilter: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [randomOverlays, setRandomOverlays] = useState<string[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const requestCameraPermission = async () => {
    setIsLoading(true);
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setRandomOverlays(getRandomOverlays(2));
      setHasPermission(true);
    } catch (err) {
      console.error(err);
      setError(
        "No se pudo acceder a la cámara. Por favor, revisa los permisos del navegador."
      );
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setHasPermission(null);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const loadOverlay = (
          src: string,
          x: number,
          y: number,
          w: number,
          h: number
        ): Promise<void> => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
              ctx.drawImage(img, x, y, w, h);
              resolve();
            };
          });
        };

        const drawOverlays = Promise.all([
          loadOverlay(randomOverlays[0], 30, 100, 200, 300),
          loadOverlay(randomOverlays[1], canvas.width - 230, 100, 200, 300),
        ]);

        drawOverlays.then(() => {
          ctx.fillStyle = "#fff";
          ctx.font = "bold 40px Arial";
          ctx.textAlign = "center";
          ctx.fillText("¡Feliz Aniversario FIIS 2025!", canvas.width / 2, 60);

          const link = document.createElement("a");
          link.download = `FIIS_35_ANIVERSARIO_${Date.now()}.png`;
          link.href = canvas.toDataURL();
          link.click();
        });
      }
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center text-white mb-4">
          <h1 className="text-3xl font-bold">
            🎉 ¡Feliz Aniversario FIIS 2025!
          </h1>
          <p className="text-blue-200">
            Universidad Nacional Hermilio Valdizán – Escuela Profesional de
            Ingeniería de Sistemas
          </p>
        </div>

        {hasPermission ? (
          <>
            <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden mb-6">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />

              {randomOverlays.map((overlay, index) => (
                <img
                  key={index}
                  src={overlay}
                  alt={`overlay-${index}`}
                  className={`absolute top-[100px] w-[200px] h-[300px] object-contain pointer-events-none ${
                    index === 0 ? "left-[30px]" : "right-[30px]"
                  }`}
                />
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={takePhoto}
                className="bg-amber-500 px-6 py-3 rounded shadow hover:bg-amber-600 flex items-center gap-2 text-white"
              >
                <Download className="w-5 h-5" />
                Capturar Foto
              </button>

              <button
                onClick={stopCamera}
                className="bg-red-500 px-6 py-3 rounded shadow hover:bg-red-600 flex items-center gap-2 text-white"
              >
                <X className="w-5 h-5" />
                Cerrar
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center bg-white/90 text-black p-6 rounded-xl shadow-xl">
            <Camera className="w-10 h-10 text-blue-900 mb-4" />
            <p className="mb-4">
              Para usar los filtros culturales, necesitamos permiso para acceder
              a tu cámara.
            </p>
            <button
              onClick={requestCameraPermission}
              className="bg-amber-500 px-6 py-3 rounded shadow hover:bg-amber-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Activando cámara..." : "Activar Cámara"}
            </button>
            {error && <p className="text-red-600 mt-4">{error}</p>}
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraFilter;
