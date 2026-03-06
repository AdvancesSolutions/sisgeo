import { Geolocation } from "@capacitor/geolocation";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

export const nativeGPS = {
  getCurrentPosition: async () => {
    const permission = await Geolocation.requestPermissions();
    if (permission.location === "denied") {
      throw new Error("Permissão de GPS negada");
    }
    const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    };
  },
};

export const nativeCamera = {
  takePhoto: async () => {
    const permission = await Camera.requestPermissions();
    if (permission.camera === "denied") {
      throw new Error("Permissão de câmera negada");
    }
    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      width: 1200,
      height: 1200,
    });
    return {
      base64: photo.base64String,
      format: photo.format,
      dataUrl: `data:image/${photo.format};base64,${photo.base64String}`,
    };
  },

  pickFromGallery: async () => {
    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
    });
    return {
      base64: photo.base64String,
      format: photo.format,
      dataUrl: `data:image/${photo.format};base64,${photo.base64String}`,
    };
  },
};
