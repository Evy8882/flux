import React, { useState } from "react";
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { Calendar, TrendingUp, TrendingDown, Plus } from "lucide-react-native";
import { api } from "../../services/api";

export default function Recurrences() {
  const router = useRouter();
  const [recurrences, setRecurrences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadRecurrences() {
    try {
      const response = await api.get("/recurrences");
      setRecurrences(response.data);
    } catch (err) {
      console.error("Erro ao carregar recorrências:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadRecurrences();
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
          <Text style={styles.title}>Recorrências</Text>
          <Text style={styles.subtitle}>Gerencie receitas e despesas automáticas.</Text>
        </View>

        <FlatList
          data={recurrences}
          keyExtractor={(item) => item.id || item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadRecurrences(); }} tintColor="#3b82f6" />
          }
          renderItem={({ item }) => {
            const isIncome = item.type === "receita";
            const formattedDate = item.nextDate ? new Date(item.nextDate).toLocaleDateString("pt-BR") : "";

            return (
              <View style={styles.row}>
                <View style={[styles.iconContainer, isIncome ? styles.incomeBg : styles.expenseBg]}>
                  {isIncome ? <TrendingUp size={18} color="#10b981" /> : <TrendingDown size={18} color="#ef4444" />}
                </View>

                <View style={styles.infoContainer}>
                  <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
                  <Text style={styles.details}>{item.categoryId} · {item.frequency}</Text>
                </View>

                <View style={styles.rightContainer}>
                  <Text style={[styles.amount, isIncome ? styles.positive : styles.negative]}>
                    {isIncome ? "+ " : "- "}{formatCurrency(item.amount)}
                  </Text>
                  <View style={styles.dateRow}>
                    <Calendar size={11} color="#64748b" />
                    <Text style={styles.dateText}>{formattedDate}</Text>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma recorrência cadastrada.</Text>}
        />
      </View>

      <TouchableOpacity style={styles.fab} onPress={() => router.push("/add-recurrence")}>
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
  row: { flexDirection: "row", alignItems: "center", backgroundColor: "#111827", padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: "#1f2937" },
  iconContainer: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", marginRight: 12 },
  incomeBg: { backgroundColor: "rgba(16, 185, 129, 0.15)" },
  expenseBg: { backgroundColor: "rgba(239, 68, 68, 0.15)" },
  infoContainer: { flex: 1, marginRight: 8 },
  description: { fontSize: 15, fontWeight: "600", color: "#f8fafc" },
  details: { fontSize: 11, color: "#64748b", marginTop: 2, textTransform: "capitalize" },
  rightContainer: { alignItems: "flex-end" },
  amount: { fontSize: 15, fontWeight: "bold" },
  positive: { color: "#10b981" },
  negative: { color: "#ef4444" },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  dateText: { fontSize: 11, color: "#64748b" },
  emptyText: { textAlign: "center", color: "#64748b", marginTop: 40 },
  fab: { position: "absolute", right: 20, bottom: 90, width: 56, height: 56, borderRadius: 28, backgroundColor: "#3b82f6", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 4, elevation: 6 },
});