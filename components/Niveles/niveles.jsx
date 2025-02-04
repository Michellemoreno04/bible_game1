export const niveles = (experiencia) => {
  // Mapeo de insignias con sus animaciones
  const insignias = {
    1: {
      name: "Principiante",
      animation: require("../../assets/lottieFiles/insigniasNivel/award.json")// Ruta en tu carpeta public
    },
    2: {
      name: "Aprendiz",
      animation: require("../../assets/lottieFiles/insigniasNivel/award.json")
    },
    3: {
      name: "Estudiante Fiel",
      animation: require("../../assets/lottieFiles/insigniasNivel/award.json")
    },
    4: {
      name: "Profesional",
      animation: require("../../assets/lottieFiles/insigniasNivel/award.json")
    },
    5: {
      name: "Maestro",
      animation: require("../../assets/lottieFiles/insigniasNivel/award.json")
    },
    6: {
      name: "Maestro Maestro",
      animation: require("../../assets/lottieFiles/insigniasNivel/award.json")
    }
    
  };

  const experienciaPorNivel = 200;
  let nivel = Math.floor(experiencia / experienciaPorNivel) + 1;
  const maxNivel = Object.keys(insignias).length;
  
  nivel = nivel > maxNivel ? maxNivel : nivel;

  return {
    nivel,
    insignia: insignias[nivel]?.name || '...',
    animation: insignias[nivel]?.animation || '/animations/default.json'
  };
};