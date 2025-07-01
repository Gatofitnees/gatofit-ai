
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause, Eye, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/Card";

interface GatofitProgram {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  duration: string;
  difficulty: string;
  type: string;
  isActive?: boolean;
}

const GatofitProgramsPage: React.FC = () => {
  const navigate = useNavigate();

  // Datos de ejemplo - en el futuro estos vendrán de la base de datos
  const gatofitPrograms: GatofitProgram[] = [
    {
      id: "1",
      name: "Fuerza Total",
      description: "Programa completo de fuerza para desarrollar músculo y potencia",
      imageUrl: "https://storage.googleapis.com/almacenamiento-app-gatofit/Recursos%20Branding%20APP/animaciones/animacion%20gatofit%202.gif",
      duration: "8 semanas",
      difficulty: "Intermedio",
      type: "Fuerza",
      isActive: false
    },
    {
      id: "2", 
      name: "Cardio Intenso",
      description: "Rutinas de alta intensidad para quemar grasa y mejorar resistencia",
      imageUrl: "https://storage.googleapis.com/almacenamiento-app-gatofit/Recursos%20Branding%20APP/animaciones/animacion%20gatofit%202.gif",
      duration: "6 semanas",
      difficulty: "Avanzado",
      type: "Cardio",
      isActive: true
    },
    {
      id: "3",
      name: "Principiante Plus",
      description: "Programa ideal para comenzar tu journey fitness de manera segura",
      imageUrl: "https://storage.googleapis.com/almacenamiento-app-gatofit/Recursos%20Branding%20APP/animaciones/animacion%20gatofit%202.gif",
      duration: "4 semanas",
      difficulty: "Principiante",
      type: "General",
      isActive: false
    }
  ];

  const handleViewDetails = (programId: string) => {
    console.log("Ver detalles del programa:", programId);
    // Aquí iría la lógica para ver detalles
  };

  const handleStartProgram = (programId: string) => {
    console.log("Iniciar programa:", programId);
    // Aquí iría la lógica para iniciar el programa
  };

  const handlePauseProgram = (programId: string) => {
    console.log("Pausar programa:", programId);
    // Aquí iría la lógica para pausar el programa
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'principiante':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'intermedio':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'avanzado':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold text-2xl" style={{
            textShadow: '0 0 15px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4)'
          }}>
            Programas Gatofit
          </span>
          <p className="text-sm text-muted-foreground mt-1">
            Programas diseñados por expertos para maximizar tus resultados
          </p>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="space-y-6">
        {gatofitPrograms.map((program) => (
          <div
            key={program.id}
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 min-h-[200px] group"
          >
            {/* Background image */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity duration-300"
              style={{ backgroundImage: `url(${program.imageUrl})` }}
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            {/* Content */}
            <div className="relative z-10 p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{program.name}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{program.description}</p>
                  </div>
                  {program.isActive && (
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium border border-green-500/30">
                      Activo
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1 text-gray-300">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{program.duration}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-300">
                    <Target className="h-4 w-4" />
                    <span className="text-sm">{program.type}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(program.difficulty)}`}>
                    {program.difficulty}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(program.id)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalles
                </Button>
                
                {program.isActive ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePauseProgram(program.id)}
                    className="bg-orange-500/20 border-orange-500/30 text-orange-400 hover:bg-orange-500/30"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleStartProgram(program.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GatofitProgramsPage;
