import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { TrendingUp, TrendingDown, Wallet, Plus } from "lucide-react-native";
import { api } from "../../services/api";

export default function Dashboard() {
  const router = useRouter();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadDashboard() {
    try {
      const response = await api.get("/dashboard/summary");
      setSummary(response.data);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  function formatCurrency(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadDashboard();
            }}
            tintColor="#3b82f6"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>VISÃO GERAL</Text>
          <Text style={styles.title}>Olá! 👋</Text>
          <Text style={styles.subtitle}>Acompanhe sua vida financeira em um só lugar.</Text>
        </View>

        <View style={styles.summaryContainer}>
          <View style={[styles.card, styles.balanceCard]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Saldo total</Text>
              <Wallet size={20} color="#3b82f6" />
            </View>
            <Text style={styles.balanceValue}>{formatCurrency(summary?.saldo)}</Text>
            <Text style={styles.cardSubtitle}>Saldo da sua conta</Text>
          </View>

          <View style={styles.rowCards}>
            <View style={[styles.card, styles.halfCard]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Receitas</Text>
                <View style={[styles.iconBox, styles.greenBg]}>
                  <TrendingUp size={16} color="#10b981" />
                </View>
              </View>
              <Text style={[styles.cardValue, styles.positiveText]}>{formatCurrency(summary?.totalReceitas)}</Text>
              <Text style={styles.cardSubtitle}>Total de entradas</Text>
            </View>

            <View style={[styles.card, styles.halfCard]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Despesas</Text>
                <View style={[styles.iconBox, styles.redBg]}>
                  <TrendingDown size={16} color="#ef4444" />
                </View>
              </View>
              <Text style={[styles.cardValue, styles.negativeText]}>{formatCurrency(summary?.totalDespesas)}</Text>
              <Text style={styles.cardSubtitle}>Total de saídas</Text>
            </View>
          </View>

          {/* Seção de Despesas por Categoria */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Despesas por categoria</Text>
            {summary?.byCategory?.length > 0 ? (
              summary.byCategory.map((cat) => (
                <View key={cat.id} style={styles.categoryCard}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                    <Text style={styles.categoryTotal}>{formatCurrency(cat.total)}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Nenhuma despesa registrada este mês.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Botão Flutuante para Adicionar */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/add-transaction")}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0b0f19" },
  container: { flex: 1, backgroundColor: "#0b0f19" },
  scrollContent: { padding: 16, paddingBottom: 90 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0b0f19" },
  header: { marginBottom: 20, marginTop: 10 },
  eyebrow: { fontSize: 11, fontWeight: "700", color: "#3b82f6", letterSpacing: 1.2, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: "bold", color: "#f8fafc" },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },
  summaryContainer: { gap: 12 },
  card: { backgroundColor: "#111827", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#1f2937" },
  balanceCard: { backgroundColor: "#111827", borderColor: "#1f2937" },
  rowCards: { flexDirection: "row", gap: 12 },
  halfCard: { flex: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  cardTitle: { fontSize: 13, color: "#9ca3af", fontWeight: "600" },
  balanceValue: { fontSize: 28, fontWeight: "bold", color: "#f8fafc", marginBottom: 2 },
  cardValue: { fontSize: 20, fontWeight: "bold", marginBottom: 2 },
  cardSubtitle: { fontSize: 11, color: "#64748b" },
  iconBox: { padding: 6, borderRadius: 8 },
  greenBg: { backgroundColor: "rgba(16, 185, 129, 0.15)" },
  redBg: { backgroundColor: "rgba(239, 68, 68, 0.15)" },
  positiveText: { color: "#10b981" },
  negativeText: { color: "#ef4444" },
  sectionContainer: { marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#f8fafc", marginBottom: 12 },
  categoryCard: { backgroundColor: "#111827", borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#1f2937" },
  categoryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  categoryName: { fontSize: 14, fontWeight: "600", color: "#f8fafc" },
  categoryTotal: { fontSize: 14, fontWeight: "bold", color: "#ef4444" },
  emptyText: { color: "#64748b", fontSize: 13 },
  fab: { position: "absolute", right: 20, bottom: 90, width: 56, height: 56, borderRadius: 28, backgroundColor: "#3b82f6", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 4, elevation: 6 },
});