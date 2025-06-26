import React, { useState, useRef, useEffect } from "react";
import { Camera, X, Download, AlertCircle, RefreshCw } from "lucide-react";

const overlays = ["/overlays/negrito1.png", "/overlays/curuchano.png"];

const getRandomOverlays = (count: number) => {
  const shuffled = [...overlays].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const CameraFilter: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [randomOverlays, setRandomOverlays] = useState<string[]>([]);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const checkHttps = () => {
    return (
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost"
    );
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Verificar si estamos en HTTPS
      if (!checkHttps()) {
        throw new Error(
          "La cámara requiere HTTPS en producción. Verifica que tu sitio esté configurado correctamente."
        );
      }

      // Verificar si el navegador soporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Tu navegador no soporta acceso a la cámara.");
      }

      // Detener cualquier stream existente
      stopCamera();

      // Configuraciones más específicas para mejor compatibilidad
      const constraints = {
        video: {
          facingMode: "user",
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Configurar el video con eventos
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch((err) => {
              console.error("Error al reproducir video:", err);
              setError("Error al iniciar la reproducción del video");
            });
          }
        };

        videoRef.current.oncanplay = () => {
          setHasPermission(true);
          setRandomOverlays(getRandomOverlays(2));
          setIsLoading(false);
        };

        videoRef.current.onerror = (e) => {
          console.error("Error en el elemento video:", e);
          setError("Error en la reproducción del video");
          setIsLoading(false);
        };

        // Configurar atributos del video
        videoRef.current.autoplay = true;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
      }
    } catch (err: any) {
      console.error("Error al acceder a la cámara:", err);
      setHasPermission(false);
      setIsLoading(false);

      // Mensajes de error más específicos
      if (err.name === "NotAllowedError") {
        setError(
          "Permisos de cámara denegados. Por favor, permite el acceso y recarga la página."
        );
      } else if (err.name === "NotFoundError") {
        setError("No se encontró ninguna cámara en tu dispositivo.");
      } else if (err.name === "NotReadableError") {
        setError("La cámara está siendo usada por otra aplicación.");
      } else if (err.name === "OverconstrainedError") {
        setError("La cámara no cumple con los requisitos necesarios.");
      } else {
        setError(err.message || "Error desconocido al acceder a la cámara.");
      }
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const drawFestiveElements = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // Fondo semi-transparente para el texto
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, width, 100);

    // Texto principal
    ctx.fillStyle = "#fff";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.strokeText("¡Feliz Aniversario FIIS 2025!", width / 2, 40);
    ctx.fillText("¡Feliz Aniversario FIIS 2025!", width / 2, 40);

    // Subtítulo
    ctx.font = "16px Arial";
    ctx.fillText("UNHEVAL - Sistemas e Industrial", width / 2, 70);

    // Elementos festivos
    const emojis = ["🎉", "🎊", "🎈", "⭐", "✨"];
    ctx.font = "20px Arial";

    // Posiciones fijas para los emojis para evitar solapamiento
    const positions = [
      { x: width * 0.1, y: height * 0.15 },
      { x: width * 0.9, y: height * 0.15 },
      { x: width * 0.15, y: height * 0.85 },
      { x: width * 0.85, y: height * 0.85 },
      { x: width * 0.5, y: height * 0.9 },
    ];

    positions.forEach((pos, i) => {
      if (i < emojis.length) {
        ctx.fillText(emojis[i], pos.x, pos.y);
      }
    });
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError("Error: Video o canvas no disponible");
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      setError("Error: No se pudo obtener el contexto del canvas");
      return;
    }

    try {
      const { videoWidth, videoHeight } = video;

      if (videoWidth === 0 || videoHeight === 0) {
        setError("Error: El video no está listo");
        return;
      }

      // Configurar el canvas con las dimensiones del video
      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // Dibujar el video en el canvas
      ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

      // Función para cargar y dibujar overlays
      const loadOverlay = (
        src: string,
        x: number,
        y: number,
        w: number,
        h: number
      ): Promise<void> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            try {
              ctx.drawImage(img, x, y, w, h);
              resolve();
            } catch (err) {
              console.warn(`Error al dibujar overlay ${src}:`, err);
              resolve(); // Continuar aunque falle un overlay
            }
          };
          img.onerror = () => {
            console.warn(`No se pudo cargar overlay: ${src}`);
            resolve(); // Continuar aunque falle la carga
          };
          img.src = src;
        });
      };

      // Cargar overlays y elementos festivos
      Promise.all([
        loadOverlay(randomOverlays[0], 20, canvas.height * 0.35, 100, 150),
        loadOverlay(
          randomOverlays[1],
          canvas.width - 120,
          canvas.height * 0.35,
          100,
          150
        ),
      ])
        .then(() => {
          drawFestiveElements(ctx, canvas.width, canvas.height);

          try {
            const photoData = canvas.toDataURL("image/png", 0.9);
            setCapturedPhoto(photoData);
          } catch (err) {
            console.error("Error al generar imagen:", err);
            setError("Error al procesar la imagen");
          }
        })
        .catch((err) => {
          console.error("Error al cargar overlays:", err);
          // Continuar sin overlays
          drawFestiveElements(ctx, canvas.width, canvas.height);
          const photoData = canvas.toDataURL("image/png", 0.9);
          setCapturedPhoto(photoData);
        });
    } catch (err) {
      console.error("Error al capturar foto:", err);
      setError("Error al capturar la foto");
    }
  };

  const reset = () => {
    setCapturedPhoto(null);
    setRandomOverlays(getRandomOverlays(2));
    setError("");
  };

  const retry = () => {
    setHasPermission(null);
    setError("");
    setCapturedPhoto(null);
    startCamera();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center text-white mb-4">
          <h1 className="text-2xl font-bold">
            🎉 ¡Feliz Aniversario FIIS 2025!
          </h1>
          <p className="text-blue-200 text-sm">
            Universidad Nacional Hermilio Valdizán – Ingeniería de Sistemas e
            Industrial
          </p>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm">{error}</p>
              <button
                onClick={retry}
                className="mt-2 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Reintentar
              </button>
            </div>
          </div>
        )}

        {capturedPhoto ? (
          <div className="w-full bg-black rounded-xl overflow-hidden mb-4">
            <img
              src={capturedPhoto}
              alt="Foto capturada"
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
                onError={(e) => {
                  console.warn(`Error al cargar overlay: ${overlay}`);
                  e.currentTarget.style.display = "none";
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-white text-center py-10 bg-black/20 rounded-xl">
            <Camera
              className={`w-10 h-10 mx-auto mb-4 ${
                isLoading ? "animate-pulse" : ""
              }`}
            />
            <p className="text-lg font-semibold mb-2">
              {isLoading ? "Iniciando cámara..." : "Cámara no disponible"}
            </p>
            {!isLoading && !checkHttps() && (
              <p className="text-sm text-red-300">
                Se requiere HTTPS para usar la cámara
              </p>
            )}
          </div>
        )}

        <div className="flex justify-center gap-4 mt-4">
          {!capturedPhoto && hasPermission ? (
            <button
              onClick={takePhoto}
              disabled={isLoading}
              className="bg-amber-500 disabled:bg-amber-300 px-6 py-3 rounded shadow hover:bg-amber-600 flex items-center gap-2 text-white disabled:cursor-not-allowed"
            >
              <Camera className="w-5 h-5" /> Capturar Foto
            </button>
          ) : capturedPhoto ? (
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
          ) : null}
        </div>

        {!checkHttps() && (
          <div className="mt-4 p-3 bg-yellow-600 text-white rounded-lg text-sm">
            <strong>Nota:</strong> Para usar la cámara en producción, asegúrate
            de que tu sitio esté configurado con HTTPS.
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraFilter;
