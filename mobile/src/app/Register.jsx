import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { UserPlus } from "lucide-react-native";
import { api } from "../services/api";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name || !email || !password) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/register", { name, email, password });
      
      Alert.alert("Sucesso", "Conta criada com sucesso! Faça login para continuar.");
      router.back();
    } catch (err) {
      Alert.alert("Erro no cadastro", err.response?.data?.error || "Não foi possível criar a conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <UserPlus size={28} color="#3b82f6" />
          </View>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Comece a organizar suas finanças com o Flux.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            placeholderTextColor="#64748b"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Sua senha"
            placeholderTextColor="#64748b"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Cadastrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={() => router.back()}>
            <Text style={styles.linkText}>Já tem uma conta? <Text style={styles.linkBold}>Faça login</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0f19" },
  content: { flex: 1, padding: 24, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 32 },
  iconBox: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(59, 130, 246, 0.15)", justifyContent: "center", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#f8fafc", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#64748b", textAlign: "center" },
  form: { width: "100%" },
  label: { fontSize: 13, fontWeight: "600", color: "#94a3b8", marginBottom: 6 },
  input: { backgroundColor: "#111827", borderWidth: 1, borderColor: "#1f2937", borderRadius: 10, padding: 14, fontSize: 15, color: "#f8fafc", marginBottom: 16 },
  button: { backgroundColor: "#3b82f6", borderRadius: 10, padding: 16, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  linkButton: { marginTop: 20, alignItems: "center" },
  linkText: { color: "#64748b", fontSize: 14 },
  linkBold: { color: "#3b82f6", fontWeight: "600" },
});