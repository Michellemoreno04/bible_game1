

export const niveles = (experiencia) => {
    // Define el umbral de experiencia para cada nivel
    const insignias = {
      1: "Principiante",
      2: "Aprendiz",
      3: "Estudiante Fiel",
      4: "Apasionado",
      5: "Dedicado",
      6: "Estudioso",
      7: "Entendedor",
      8: "Conocedor Bíblico",
      9: "Sabio",
      10: "Maestro",
      11: "Profesor",
    };
  
    // Define la fórmula para calcular el nivel
    const experienciaPorNivel = 200; // Experiencia requerida por nivel
    let nivel = Math.floor(experiencia / experienciaPorNivel) + 1;
  
    // Limitar el nivel al máximo definido en insignias
    const maxNivel = Object.keys(insignias).length;
    if (nivel > maxNivel) {
      nivel = maxNivel;
    }
  
  
  
    return {
      nivel,
      insignia: insignias[nivel] || '...',
    };
  };
  