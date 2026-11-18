import React, { useState } from "react";
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { Target, Plus } from "lucide-react-native";
import { api } from "../../services/api";

export default function Goals() {
  const router = useRouter();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadGoals() {
    try {
      const response = await api.get("/goals");
      setGoals(response.data);
    } catch (err) {
      console.error("Erro ao carregar metas:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [])
  );

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
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Metas</Text>
          <Text style={styles.subtitle}>Acompanhe o progresso dos seus objetivos.</Text>
        </View>

        <FlatList
          data={goals}
          keyExtractor={(item) => item.id || item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadGoals(); }} tintColor="#3b82f6" />
          }
          renderItem={({ item }) => {
            const current = Number(item.currentAmount || item.current || 0);
            const target = Number(item.targetAmount || item.target || 1);
            const percentage = Math.min(Math.round((current / target) * 100), 100);

            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <Target size={18} color="#3b82f6" />
                  </View>
                  <View style={styles.headerInfo}>
                    <Text style={styles.goalTitle}>{item.name || item.description}</Text>
                    <Text style={styles.goalDetails}>Meta: {formatCurrency(target)}</Text>
                  </View>
                  <Text style={styles.percentageText}>{percentage}%</Text>
                </View>

                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${percentage}%` }]} />
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.currentText}>Acumulado: <Text style={styles.boldText}>{formatCurrency(current)}</Text></Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma meta cadastrada.</Text>}
        />
      </View>

      <TouchableOpacity style={styles.fab} onPress={() => router.push("/add-goal")}>
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0b0f19" },
  container: { flex: 1, backgroundColor: "#0b0f19", paddingHorizontal: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0b0f19" },
  header: { marginTop: 10, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#f8fafc" },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },
  listContent: { paddingBottom: 90 },
  card: { backgroundColor: "#111827", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#1f2937" },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  iconContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(59, 130, 246, 0.15)", justifyContent: "center", alignItems: "center", marginRight: 12 },
  headerInfo: { flex: 1 },
  goalTitle: { fontSize: 16, fontWeight: "600", color: "#f8fafc" },
  goalDetails: { fontSize: 11, color: "#64748b", marginTop: 2 },
  percentageText: { fontSize: 16, fontWeight: "bold", color: "#3b82f6" },
  progressTrack: { height: 8, backgroundColor: "#1f2937", borderRadius: 4, overflow: "hidden", marginBottom: 10 },
  progressFill: { height: "100%", backgroundColor: "#3b82f6", borderRadius: 4 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  currentText: { fontSize: 12, color: "#64748b" },
  boldText: { color: "#f8fafc", fontWeight: "600" },
  emptyText: { textAlign: "center", color: "#64748b", marginTop: 40 },
  fab: { position: "absolute", right: 20, bottom: 90, width: 56, height: 56, borderRadius: 28, backgroundColor: "#3b82f6", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 4, elevation: 6 },
});