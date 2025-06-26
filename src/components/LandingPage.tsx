import React, { useState, useEffect } from "react";
import { sha256 } from "js-sha256";
import {
  Sparkles,
  Camera,
  Calendar,
  Award,
  Users,
  ExternalLink,
  Heart,
  Star,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SECRET_KEY = "fiis-2025-super-clave";

const generateHash = (number: number) => {
  return sha256(`${number}-${SECRET_KEY}`);
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const [luckyNumber, setLuckyNumber] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedNumber = localStorage.getItem("unheval-lucky-number");
    const savedHash = localStorage.getItem("unheval-lucky-hash");

    if (savedNumber && savedHash) {
      const parsedNumber = parseInt(savedNumber);
      const expectedHash = generateHash(parsedNumber);

      if (expectedHash === savedHash) {
        setLuckyNumber(parsedNumber);
        setIsLoading(false);
        return;
      } else {
        localStorage.removeItem("unheval-lucky-number");
        localStorage.removeItem("unheval-lucky-hash");
      }
    }

    const newNumber = Math.floor(Math.random() * 9000) + 1000;
    const newHash = generateHash(newNumber);
    localStorage.setItem("unheval-lucky-number", newNumber.toString());
    localStorage.setItem("unheval-lucky-hash", newHash);
    setLuckyNumber(newNumber);
    setIsLoading(false);
  }, []);

  const handleCameraFilter = () => {
    navigate("/camera-filter");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 relative overflow-hidden">
      {/* Confetti Animation */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(9)].map((_, i) => (
          <div key={i} className={`confetti-piece confetti-${i + 1}`} />
        ))}
      </div>

      <div className="absolute inset-0 cultural-pattern opacity-30" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="text-center pt-8 pb-6 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex-1 flex justify-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Award className="w-8 md:w-10 h-8 md:h-10 text-blue-900" />
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              <span className="text-amber-400">🎉</span> ¡35 años de la
              <br />
              <span className="text-amber-300">
                Escuela de Ingeniería de Sistemas
              </span>
              <br />
              <span className="text-blue-200">UNHEVAL!</span>{" "}
              <span className="text-amber-400">🎉</span>
            </h1>

            <p className="text-lg md:text-xl text-blue-100 font-medium">
              Facultad de Ingeniería Industrial y de Sistemas
            </p>

            <div className="flex justify-center gap-4 mt-6">
              <Sparkles className="w-6 h-6 text-amber-400 float-animation" />
              <Calendar className="w-6 h-6 text-white" />
              <Users
                className="w-6 h-6 text-amber-400 float-animation"
                style={{ animationDelay: "1s" }}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 mb-8 border-4 border-amber-400">
              <div className="mb-6">
                <Star className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-4">
                  Tu número de la suerte es:
                </h2>
                <div className="text-6xl md:text-8xl font-black text-gradient bg-gradient-to-r from-blue-900 to-amber-600 bg-clip-text text-transparent mb-4">
                  {luckyNumber}
                </div>
                <p className="text-lg md:text-xl text-gray-700 font-medium">
                  Con este número participas automáticamente
                  <br />
                  del{" "}
                  <span className="text-amber-600 font-bold">
                    sorteo de aniversario
                  </span>
                </p>
              </div>

              <div className="flex justify-center gap-4 opacity-60 mb-5">
                <Heart className="w-6 h-6 text-red-500" />
                <Sparkles className="w-6 h-6 text-amber-500" />
                <Heart className="w-6 h-6 text-red-500" />
              </div>
              <div className="bg-red-500/90 backdrop-blur-sm rounded-2xl p-4 mb-6 border-2 border-red-400 shadow-2xl">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">
                  ⚠️ AVISO IMPORTANTE ⚠️
                </h3>
                <p className="text-white text-sm md:text-base leading-relaxed">
                  <strong>NO modifiques tu número de la suerte.</strong> Si
                  intentas cambiarlo o manipularlo, perderás automáticamente tu
                  número actual y se te asignará uno completamente nuevo. Tu
                  participación en el sorteo depende de mantener tu número
                  original intacto.
                </p>
              </div>
            </div>

            <button
              onClick={handleCameraFilter}
              className="group relative bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xl md:text-2xl px-8 py-6 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 pulse-glow w-full max-w-md mx-auto flex items-center justify-center gap-4"
            >
              <Camera className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300" />
              <span>🎭 ¡Ir al filtro cultural de cámara!</span>
              <ExternalLink className="w-6 h-6 opacity-70" />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-bounce" />
            </button>

            <p className="text-blue-100 mt-4 text-sm md:text-base">
              Experimenta con filtros culturales interactivos
            </p>
          </div>
        </main>

        <footer className="bg-blue-950/80 backdrop-blur-sm text-center py-6 px-4 border-t border-amber-400/30">
          <div className="max-w-4xl mx-auto">
            <p className="text-blue-100 font-medium text-sm md:text-base mb-2">
              Universidad Nacional Hermilio Valdizán
            </p>
            <p className="text-blue-200 text-sm md:text-base mb-2">
              Facultad de Ingeniería Industrial y de Sistemas
            </p>
            <p className="text-amber-400 font-bold text-lg">
              2025 - 35 años de excelencia académica
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-4" />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
