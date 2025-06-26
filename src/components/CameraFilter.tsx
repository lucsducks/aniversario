// CameraFilter.tsx – Filtro cultural UNHEVAL con sobreposición de Negritos y decoraciones festivas en la imagen

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, X, Download } from "lucide-react";

const overlays = ["/overlays/negrito1.png", "/overlays/curuchano.png"];

const getRandomOverlays = (count: number) => {
  const shuffled = [...overlays].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const CameraFilter: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [randomOverlays, setRandomOverlays] = useState<string[]>([]);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
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
        console.error("No se pudo acceder a la cámara:", err);
        setHasPermission(false);
      }
    };
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const drawFestiveElements = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    ctx.fillStyle = "#fff";
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("¡Feliz Aniversario FIIS 2025!", width / 2, 60);

    const emojis = ["🎉", "🎊", "🎈", "⭐", "✨"];
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      ctx.font = `${Math.floor(Math.random() * 20 + 20)}px Arial`;
      ctx.fillText(emojis[Math.floor(Math.random() * emojis.length)], x, y);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const { videoWidth, videoHeight } = video;

        const isPortrait = window.innerHeight > window.innerWidth;
        canvas.width = isPortrait ? videoHeight : videoWidth;
        canvas.height = isPortrait ? videoWidth : videoHeight;

        if (isPortrait) {
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((-90 * Math.PI) / 180);
          ctx.drawImage(video, -video.videoWidth / 2, -video.videoHeight / 2);
          ctx.restore();
        } else {
          ctx.drawImage(video, 0, 0);
        }

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

        Promise.all([
          loadOverlay(randomOverlays[0], 20, canvas.height * 0.35, 100, 150),
          loadOverlay(
            randomOverlays[1],
            canvas.width - 120,
            canvas.height * 0.35,
            100,
            150
          ),
        ]).then(() => {
          drawFestiveElements(ctx, canvas.width, canvas.height);
          const photoData = canvas.toDataURL();
          setCapturedPhoto(photoData);
        });
      }
    }
  };

  const reset = () => {
    setCapturedPhoto(null);
    setRandomOverlays(getRandomOverlays(2));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center text-white mb-4">
          <h1 className="text-2xl font-bold">
            🎉 ¡Feliz Aniversario FIIS 2025!
          </h1>
          <p className="text-blue-200 text-sm">
            Universidad Nacional Hermilio Valdizán – Ingeniería de Sistemas
          </p>
        </div>

        {capturedPhoto ? (
          <div className="w-full bg-black rounded-xl overflow-hidden mb-4">
            <img
              src={capturedPhoto}
              alt="capturada"
              className="w-full object-contain"
            />
          </div>
        ) : hasPermission ? (
          <div className="relative w-full h-[75vh] bg-black rounded-xl overflow-hidden mb-4">
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
                className={`absolute w-[100px] h-[150px] object-contain pointer-events-none top-1/2 -translate-y-1/2 ${
                  index === 0 ? "left-2" : "right-2"
                }`}
              />
            ))}
          </div>
        ) : (
          <div className="text-white text-center py-10">
            <Camera className="w-10 h-10 mx-auto mb-4 animate-pulse" />
            <p className="text-lg font-semibold animate-bounce">
              Cargando cámara...
            </p>
          </div>
        )}

        <div className="flex justify-center gap-4 mt-4">
          {!capturedPhoto ? (
            <button
              onClick={takePhoto}
              className="bg-amber-500 px-6 py-3 rounded shadow hover:bg-amber-600 flex items-center gap-2 text-white"
            >
              <Download className="w-5 h-5" /> Capturar Foto
            </button>
          ) : (
            <>
              <a
                href={capturedPhoto}
                download={`FIIS_35_ANIVERSARIO_${Date.now()}.png`}
                className="bg-green-600 px-6 py-3 rounded shadow hover:bg-green-700 flex items-center gap-2 text-white"
              >
                <Download className="w-5 h-5" /> Descargar
              </a>
              <button
                onClick={reset}
                className="bg-red-500 px-6 py-3 rounded shadow hover:bg-red-600 flex items-center gap-2 text-white"
              >
                <X className="w-5 h-5" /> Nueva Foto
              </button>
            </>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraFilter;
