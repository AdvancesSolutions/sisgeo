/**
 * Leitor de QR Code
 * Escaneia etiquetas de equipamentos geradas pelo SIGEO Web
 */
import { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

type QRScannerProps = {
  onScan: (data: string) => void;
  onClose: () => void;
};

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission?.granted && permission?.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = (result: { data?: string; nativeEvent?: { data?: string } }) => {
    const data = result?.data ?? result?.nativeEvent?.data;
    if (!data || scanned) return;
    setScanned(true);
    onScan(data);
  };

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Permissão de câmera necessária para escanear QR Codes</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Permitir</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={onClose}>
          <Text style={styles.btnTextSecondary}>Fechar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      <View style={styles.overlay}>
        <View style={styles.frame} />
        <Text style={styles.hint}>Aponte para o QR Code da etiqueta do equipamento</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Fechar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  frame: {
    width: 220,
    height: 220,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  hint: {
    position: "absolute",
    bottom: 120,
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  closeBtn: {
    position: "absolute",
    bottom: 48,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 8,
  },
  closeBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  message: { color: "#fff", fontSize: 16, textAlign: "center", marginBottom: 16 },
  btn: { backgroundColor: "#2563eb", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, marginBottom: 8 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  btnSecondary: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#fff" },
  btnTextSecondary: { color: "#fff", fontSize: 16 },
});
