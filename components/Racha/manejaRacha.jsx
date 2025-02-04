import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Alert } from 'react-native';
import { useSound } from '../soundFunctions/soundFunction';
/**
 * Maneja la racha diaria del usuario, actualizando la racha actual y la máxima alcanzada.
 * @param {string} userId - ID del usuario.
 * @param {function} setShowModalRacha - Función para mostrar el modal de racha.
 * @returns {Promise<void>}
 */
export const manejarRachaDiaria = async (userId, setShowModalRacha) => {

  try {
    
    const userDocRef = doc(db, 'users', userId);

    // Obtener los datos del usuario desde Firestore
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error('El documento del usuario no existe.');
    }

    const userData = userDoc.data();
    const hoy = new Date(); 
    hoy.setHours(0, 0, 0, 0); // Establecer solo la fecha (sin hora)

    // Verificar si el campo modalRachaShow existe
    let ultimaFecha;
    

    if (userData?.modalRachaShow) {
      ultimaFecha = userData.modalRachaShow?.toDate
        ? userData.modalRachaShow.toDate() 
        : new Date(userData.modalRachaShow);
    } else {
      // Si no existe modalRachaShow, lo creamos con la fecha actual
      await updateDoc(userDocRef, { modalRachaShow: hoy.toISOString() });
      console.log('Se creó el campo modalRachaShow con la fecha actual.');
      ultimaFecha = hoy; // Asignamos hoy como última fecha
    }

    let rachaActual = Number(userData?.Racha || 0);
    let rachaMaxima = Number(userData?.RachaMaxima || 0);


    if (ultimaFecha < hoy) { 
      console.log('Es necesario actualizar la racha.');
      // Incrementar racha si se estudió ayer
      const ayer = new Date(hoy);
      ayer.setDate(hoy.getDate() - 1); 
      // Mostrar el modal de racha porque es un día nuevo
      setShowModalRacha(true);


      if (ultimaFecha && ultimaFecha.getTime() === ayer.getTime()) {
        // Incrementar racha si se estudió ayer
        rachaActual += 1;
        if (rachaActual > rachaMaxima) { 
          rachaMaxima = rachaActual; // Actualizar racha máxima
        }
      } else {
        // Reiniciar racha si no se estudió ayer
        rachaActual = 1;
       alert('Haz perdido la racha diaria') // mostrar el mensaje de que se ha perdido la racha .................... pending
        
      }

      

      // Actualizar los datos en Firestore
      await updateDoc(userDocRef, {
        modalRachaShow: hoy.toISOString(),
        Racha: rachaActual,
        RachaMaxima: rachaMaxima,
      });

      console.log('La racha diaria ha sido actualizada correctamente.');
    } else {
      console.log('No es necesario actualizar la racha.');
    }
  } catch (error) {
    console.error('Error al manejar la racha diaria:', error);
    Alert.alert('Error', 'No se pudo verificar la racha diaria.');
  }
};


// aqui manejaremos las notificaciones de la racha

