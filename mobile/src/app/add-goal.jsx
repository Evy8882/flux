import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X, Check } from "lucide-react-native";
import { api } from "../services/api";

export default function AddGoal() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState(""); // Exigido pelo backend
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!title || !targetAmount || !deadline) {
      Alert.alert("Erro", "Preencha o título, o valor alvo e a data limite.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/goals", {
        title, // Alterado de name para title conforme o controller
        targetAmount: Number(targetAmount.replace(",", ".")),
        currentAmount: currentAmount ? Number(currentAmount.replace(",", ".")) : 0,
        deadline: new Date(deadline.split('/').reverse().join('-')).toISOString(), // Converte DD/MM/AAAA para formato ISO se necessário
      });

      router.back();
    } catch (err) {
      Alert.alert("Erro", err.response?.data?.error || "Não foi possível salvar a meta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nova Meta</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Título da Meta</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Viagem, Carro novo..."
          placeholderTextColor="#64748b"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Valor Alvo (R$)</Text>
        <TextInput
          style={styles.input}
          placeholder="0,00"
          placeholderTextColor="#64748b"
          keyboardType="numeric"
          value={targetAmount}
          onChangeText={setTargetAmount}
        />

        <Text style={styles.label}>Valor Já Acumulado (R$ - Opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="0,00"
          placeholderTextColor="#64748b"
          keyboardType="numeric"
          value={currentAmount}
          onChangeText={setCurrentAmount}
        />

        <Text style={styles.label}>Data Limite (AAAA-MM-DD ou AAAA-MM-DDTHH:mm:ss.sssZ)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 2026-12-31"
          placeholderTextColor="#64748b"
          value={deadline}
          onChangeText={setDeadline}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.saveButtonContent}>
              <Check size={18} color="#fff" />
              <Text style={styles.saveButtonText}>Salvar Meta</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0f19" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#1f2937" },
  title: { fontSize: 18, fontWeight: "bold", color: "#f8fafc" },
  closeButton: { padding: 4, backgroundColor: "#111827", borderRadius: 8 },
  form: { padding: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#94a3b8", marginBottom: 6 },
  input: { backgroundColor: "#111827", borderWidth: 1, borderColor: "#1f2937", borderRadius: 10, padding: 14, fontSize: 15, color: "#f8fafc", marginBottom: 16 },
  saveButton: { backgroundColor: "#3b82f6", borderRadius: 10, padding: 16, alignItems: "center", marginTop: 10 },
  saveButtonContent: { flexDirection: "row", alignItems: "center", gap: 8 },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});