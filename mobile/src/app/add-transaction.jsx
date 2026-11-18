import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X, Check } from "lucide-react-native";
import { api } from "../services/api";

export default function AddTransaction() {
  const router = useRouter();
  const [type, setType] = useState("despesa"); // "receita" ou "despesa"
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!description || !amount || !categoryId) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);
      // Envia para a API o formato esperado pelo seu backend MERN
      await api.post("/transactions", {
        description,
        amount: Number(amount.replace(",", ".")),
        type: type,
        categoryId,
        date: new Date().toISOString(),
      });

      // Fecha o modal e volta para o Dashboard limpando o fluxo de navegação
      router.back();
    } catch (err) {
      Alert.alert("Erro", err.response?.data?.error || "Não foi possível salvar a transação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nova Transação</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        {/* Seletor de Tipo */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeButton, type === "despesa" && styles.activeExpense]}
            onPress={() => setType("despesa")}
          >
            <Text style={[styles.typeText, type === "despesa" && styles.activeText]}>Despesa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, type === "receita" && styles.activeIncome]}
            onPress={() => setType("receita")}
          >
            <Text style={[styles.typeText, type === "receita" && styles.activeText]}>Receita</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Supermercado, Aluguel..."
          placeholderTextColor="#64748b"
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Valor (R$)</Text>
        <TextInput
          style={styles.input}
          placeholder="0,00"
          placeholderTextColor="#64748b"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>Categoria ID / Nome</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Alimentação, Moradia"
          placeholderTextColor="#64748b"
          value={categoryId}
          onChangeText={setCategoryId}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.saveButtonContent}>
              <Check size={18} color="#fff" />
              <Text style={styles.saveButtonText}>Salvar Transação</Text>
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
  typeSelector: { flexDirection: "row", gap: 12, marginBottom: 20 },
  typeButton: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: "#111827", borderWidth: 1, borderColor: "#1f2937", alignItems: "center" },
  activeExpense: { backgroundColor: "rgba(239, 68, 68, 0.15)", borderColor: "#ef4444" },
  activeIncome: { backgroundColor: "rgba(16, 185, 129, 0.15)", borderColor: "#10b981" },
  typeText: { fontSize: 14, fontWeight: "600", color: "#94a3b8" },
  activeText: { color: "#f8fafc" },
  label: { fontSize: 13, fontWeight: "600", color: "#94a3b8", marginBottom: 6 },
  input: { backgroundColor: "#111827", borderWidth: 1, borderColor: "#1f2937", borderRadius: 10, padding: 14, fontSize: 15, color: "#f8fafc", marginBottom: 16 },
  saveButton: { backgroundColor: "#3b82f6", borderRadius: 10, padding: 16, alignItems: "center", marginTop: 10 },
  saveButtonContent: { flexDirection: "row", alignItems: "center", gap: 8 },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});