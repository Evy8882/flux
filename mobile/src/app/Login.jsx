import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LogIn } from "lucide-react-native";
import { api } from "../services/api";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/auth/login", { email, password });
      const token = response.data.token;
      
      if (token) {
        // Define o token globalmente para todas as requisições do Axios
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      // Redireciona para o Dashboard dentro das abas
      router.replace("/(tabs)/Dashboard");
    } catch (err) {
      Alert.alert("Falha no login", err.response?.data?.error || "Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <LogIn size={28} color="#3b82f6" />
          </View>
          <Text style={styles.title}>Bem-vindo de volta!</Text>
          <Text style={styles.subtitle}>Acesse sua conta para continuar no Flux.</Text>
        </View>

        <View style={styles.form}>
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

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={() => router.push("/Register")}>
            <Text style={styles.linkText}>Não tem uma conta? <Text style={styles.linkBold}>Cadastre-se</Text></Text>
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