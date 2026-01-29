import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTasksList } from '../features/tasks/useTasks';
import type { Task } from '@sigeo/shared';
import type { RootStackParamList } from '../app/types';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em execução',
  IN_REVIEW: 'Em validação',
  DONE: 'Concluída',
  REJECTED: 'Rejeitada',
};

const BADGE_BG: Record<string, { backgroundColor: string }> = {
  PENDING: { backgroundColor: '#64748b' },
  IN_PROGRESS: { backgroundColor: '#0ea5e9' },
  IN_REVIEW: { backgroundColor: '#f59e0b' },
  DONE: { backgroundColor: '#22c55e' },
  REJECTED: { backgroundColor: '#ef4444' },
};

export function TasksScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data, isLoading, isRefetching, refetch } = useTasksList(1, 50);

  const tasks = data?.data ?? [];

  const renderItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
      activeOpacity={0.7}
    >
      <Text style={styles.title} numberOfLines={1}>{item.title || 'Sem título'}</Text>
      <Text style={styles.meta}>
        {new Date(item.scheduledDate).toLocaleDateString('pt-BR')}
      </Text>
      <View style={[styles.badge, BADGE_BG[item.status] ?? styles.badge_PENDING]}>
        <Text style={styles.badgeText}>{STATUS_LABEL[item.status] ?? item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhuma tarefa encontrada.</Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            colors={['#0ea5e9']}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  list: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  title: { color: '#f8fafc', fontSize: 16, fontWeight: '600' },
  meta: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  badge_PENDING: { backgroundColor: '#64748b' },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 24 },
});
