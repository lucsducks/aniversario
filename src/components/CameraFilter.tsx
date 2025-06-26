import React, { useState, useRef, useEffect } from "react";
import { Camera, X, Download } from "lucide-react";

const overlays = ["/overlays/negrito1.png", "/overlays/curuchano.png"];

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
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = async () => {
          await videoRef.current?.play();
        };
      }
      setRandomOverlays(getRandomOverlays(2));
      setHasPermission(true);
    } catch (err) {
      console.error(err);
      setError("No se pudo acceder a la cámara.");
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
      <div className="w-full max-w-md mx-auto">
        <div className="text-center text-white mb-4">
          <h1 className="text-2xl font-bold">
            🎉 ¡Feliz Aniversario FIIS 2025!
          </h1>
          <p className="text-blue-200 text-sm">
            Universidad Nacional Hermilio Valdizán – Ingeniería de Sistemas
          </p>
        </div>

        {hasPermission ? (
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
          <div className="bg-white/90 text-center rounded-xl shadow p-6 text-blue-900">
            <Camera className="w-8 h-8 mx-auto mb-3" />
            <p className="mb-2 font-semibold">
              Necesitamos tu permiso para usar la cámara
            </p>
            <button
              onClick={requestCameraPermission}
              disabled={isLoading}
              className="bg-amber-500 text-white px-6 py-3 rounded-full font-bold hover:bg-amber-600 disabled:opacity-60"
            >
              {isLoading ? "Cargando..." : "Activar Cámara"}
            </button>
            {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
          </div>
        )}

        {hasPermission && (
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={takePhoto}
              className="bg-amber-500 px-6 py-3 rounded shadow hover:bg-amber-600 flex items-center gap-2 text-white"
            >
              <Download className="w-5 h-5" /> Capturar Foto
            </button>

            <button
              onClick={stopCamera}
              className="bg-red-500 px-6 py-3 rounded shadow hover:bg-red-600 flex items-center gap-2 text-white"
            >
              <X className="w-5 h-5" /> Cerrar
            </button>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraFilter;
