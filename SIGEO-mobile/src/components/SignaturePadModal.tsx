/**
 * Assinatura Digital do Cliente — carimbo final da O.S.
 * react-native-signature-canvas: assinatura em base64 enviada para o backend/AWS.
 */
import React, { useRef, useCallback } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert } from "react-native";
import SignatureCanvas from "react-native-signature-canvas";

interface SignaturePadModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (signatureDataUrl: string) => void;
}

export function SignaturePadModal({ visible, onClose, onConfirm }: SignaturePadModalProps) {
  const signatureRef = useRef<{ readSignature: () => void; clearSignature: () => void } | null>(null);

  const handleOK = useCallback(
    (signature: string) => {
      if (!signature || !signature.startsWith("data:")) {
        Alert.alert("Assinatura vazia", "Peça ao cliente para assinar antes de confirmar.");
        return;
      }
      onConfirm(signature);
      onClose();
    },
    [onConfirm, onClose]
  );

  const handleEmpty = useCallback(() => {
    Alert.alert("Assinatura vazia", "Peça ao cliente para assinar antes de confirmar.");
  }, []);

  const handleClear = useCallback(() => {
    signatureRef.current?.clearSignature();
  }, []);

  const handleFinalize = useCallback(() => {
    signatureRef.current?.readSignature();
  }, []);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Assinatura do Cliente</Text>
          <Text style={styles.subtitle}>
            Ao assinar, o cliente confirma a execução dos serviços listados.
          </Text>
        </View>

        <View style={styles.canvasWrap}>
          <SignatureCanvas
            ref={(ref) => { signatureRef.current = ref; }}
            onOK={handleOK}
            onEmpty={handleEmpty}
            descriptionText="Assine aqui"
            clearText="Limpar"
            confirmText="Confirmar"
            webStyle={`.m-signature-pad--footer { display: none; margin: 0; }`}
            style={styles.canvas}
            penColor="#0f172a"
            backgroundColor="rgba(255,255,255,0)"
          />
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.btnClear} onPress={handleClear}>
            <Text style={styles.btnClearText}>Limpar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnConfirm} onPress={handleFinalize}>
            <Text style={styles.btnConfirmText}>Finalizar O.S.</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btnCancel} onPress={onClose}>
          <Text style={styles.btnCancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "700", color: "#0f172a" },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 4 },
  canvasWrap: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    minHeight: 200,
  },
  canvas: { flex: 1 },
  buttons: { flexDirection: "row", gap: 12, marginBottom: 12 },
  btnClear: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnClearText: { fontWeight: "700", color: "#475569" },
  btnConfirm: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnConfirmText: { fontWeight: "700", color: "#fff" },
  btnCancel: { alignItems: "center", paddingVertical: 10 },
  btnCancelText: { fontSize: 14, color: "#64748b" },
});
