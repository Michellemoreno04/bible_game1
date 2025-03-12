import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Alert } from 'react-native';


export const manejarRachaDiaria = async (
  userId,
  setShowModalRacha,
  setShowModalRachaPerdida
) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error('El documento del usuario no existe.');
    }

    const userData = userDoc.data();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let ultimaFecha;
    if (userData?.modalRachaShow) {
      ultimaFecha = userData.modalRachaShow?.toDate
        ? userData.modalRachaShow.toDate()
        : new Date(userData.modalRachaShow);
    } else {
      await updateDoc(userDocRef, { modalRachaShow: hoy.toISOString() });
      ultimaFecha = hoy;
    }

    let rachaActual = Number(userData?.Racha || 0);
    let rachaMaxima = Number(userData?.RachaMaxima || 0);

    if (ultimaFecha < hoy) {
      const ayer = new Date(hoy);
      ayer.setDate(hoy.getDate() - 1);

      if (ultimaFecha.getTime() === ayer.getTime()) {
        rachaActual += 1;
        if (rachaActual > rachaMaxima) {
          rachaMaxima = rachaActual;
        }
        // Mostrar modal de racha actualizada
        setShowModalRacha(true);
      } else {
        //rachaActual = 1;
        // Mostrar modal de racha perdida
        setShowModalRachaPerdida(true);
      }

      await updateDoc(userDocRef, {
        modalRachaShow: hoy.toISOString(),
        Racha: rachaActual,
        RachaMaxima: rachaMaxima,
      });
    }
  } catch (error) {
    console.error('Error al manejar la racha diaria:', error);
    Alert.alert('Error', 'No se pudo verificar la racha diaria.');
  }
};