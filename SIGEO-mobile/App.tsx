import React, { useRef, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Platform, Animated, Pressable } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Updates from "expo-updates";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { AppProvider, useApp } from "./src/contexts/AppContext";
import { LoginScreen } from "./src/screens/LoginScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { TarefasScreen } from "./src/screens/TarefasScreen";
import { AcaoRapidaScreen } from "./src/screens/AcaoRapidaScreen";
import { RelatoriosScreen } from "./src/screens/RelatoriosScreen";
import { SuporteScreen } from "./src/screens/SuporteScreen";
import { MapScreen } from "./src/screens/manager/MapScreen";
import { ApprovalScreen } from "./src/screens/manager/ApprovalScreen";
import { TeamStatusScreen } from "./src/screens/manager/TeamStatusScreen";
import { StockScreen } from "./src/screens/manager/StockScreen";
import { CreateTaskScreen } from "./src/screens/manager/CreateTaskScreen";
import { AppModals } from "./src/components/AppModals";
import { pushService } from "./src/services/pushService";

const Tab = createBottomTabNavigator();

const navigationRef = createNavigationContainerRef();

type RootParamList = { Tarefas: { openTaskId?: string } };

function navigateToTaskFromPush(taskId: string) {
  if (navigationRef.isReady() && navigationRef.current) {
    (navigationRef.current as unknown as { navigate: (name: string, params?: RootParamList["Tarefas"]) => void }).navigate("Tarefas", { openTaskId: taskId });
  }
}

function NotificationResponseHandler() {
  React.useEffect(() => {
    const handleResponse = (response: { notification: { request: { content: { data?: Record<string, unknown> } } } }) => {
      const taskId = response?.notification?.request?.content?.data?.taskId;
      if (typeof taskId === "string" && taskId) navigateToTaskFromPush(taskId);
    };

    let sub: { remove: () => void } = { remove: () => {} };
    pushService.addNotificationResponseListener(handleResponse).then((s) => { sub = s; });

    pushService.getLastNotificationResponseAsync().then((last) => {
      if (last?.notification?.request?.content?.data?.taskId) {
        const taskId = last.notification.request.content.data.taskId as string;
        setTimeout(() => navigateToTaskFromPush(taskId), 500);
      }
    });

    return () => sub.remove();
  }, []);
  return null;
}

function CustomTabBarButton(props: React.ComponentProps<typeof Pressable> & { children?: React.ReactNode }) {
  const { children, style, onPress, ...rest } = props;
  const scaleValue = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.customButtonContainer, style]}
      {...rest}
    >
      <Animated.View style={[styles.customButton, { transform: [{ scale: scaleValue }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

function OfflineBanner() {
  const { isOnline, pendingCount, syncing, syncNow } = useApp();
  if (isOnline && pendingCount === 0) return null;
  return (
    <View style={[styles.offlineBanner, !isOnline && styles.offlineBannerOffline]}>
      <Ionicons name={isOnline ? "cloud-upload-outline" : "cloud-offline-outline"} size={18} color={isOnline ? "#2563eb" : "#dc2626"} />
      <Text style={styles.offlineBannerText}>
        {isOnline ? `${pendingCount} pendência(s) para sincronizar` : "Modo offline — dados salvos localmente"}
      </Text>
      {isOnline && pendingCount > 0 && (
        <TouchableOpacity style={styles.offlineSyncBtn} onPress={() => syncNow()} disabled={syncing}>
          {syncing ? <ActivityIndicator size="small" color="#2563eb" /> : <Ionicons name="sync" size={16} color="#2563eb" />}
          <Text style={styles.offlineSyncBtnText}>Sincronizar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function MainTabs() {
  const { tasks } = useApp();
  const insets = useSafeAreaInsets();
  const tabBarBottom = 25 + insets.bottom;

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5", paddingTop: 20, }}>
      <OfflineBanner />
      <Tab.Navigator 
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarActiveTintColor: "#2563eb",
            tabBarInactiveTintColor: "#94a3b8",
            tabBarItemStyle: { justifyContent: "center", alignItems: "center" },
            tabBarStyle: {
              position: "absolute",
              bottom: tabBarBottom,
              left: 20,
              right: 20,
              height: 70,
              paddingTop: 15,
              paddingBottom: 15,
              paddingHorizontal: 12,
              backgroundColor: "#ffffff",
              borderRadius: 35,
              borderTopWidth: 0,
              overflow: "visible",
              elevation: 5,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
            },
          }}
        >
          <Tab.Screen
            name="Início"
            component={HomeScreen}
            options={{
              tabBarIcon: ({ focused, color }) => (
                <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Tarefas"
            component={TarefasScreen}
            options={{
              tabBarBadge: tasks.length > 0 ? tasks.length : undefined,
              tabBarIcon: ({ focused, color }) => (
                <Ionicons name={focused ? "clipboard" : "clipboard-outline"} size={24} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Ação"
            component={AcaoRapidaScreen}
            options={{
              tabBarIcon: () => <Ionicons name="add" size={32} color="#fff" />,
              tabBarButton: (props) => <CustomTabBarButton {...props} />,
            }}
          />
          <Tab.Screen
            name="Relatórios"
            component={RelatoriosScreen}
            options={{
              tabBarIcon: ({ focused, color }) => (
                <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} size={24} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Suporte"
            component={SuporteScreen}
            options={{
              tabBarIcon: ({ focused, color }) => (
                <Ionicons name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"} size={24} color={color} />
              ),
            }}
          />
      </Tab.Navigator>
    </View>
  );
}

const MANAGER_ACCENT = "#F59E0B";

function ManagerHeaderRight() {
  const { setShowUserMenu } = useApp();
  return (
    <TouchableOpacity onPress={() => setShowUserMenu(true)} style={styles.managerHeaderBtn}>
      <Ionicons name="menu" size={24} color={MANAGER_ACCENT} />
    </TouchableOpacity>
  );
}

function ManagerTabs() {
  const insets = useSafeAreaInsets();
  const tabBarBottom = 25 + insets.bottom;
  const pendingApprovals = 3;

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5", paddingTop: 0 }}>
      <OfflineBanner />
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          headerTitle: "SIGEO",
          headerTitleStyle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
          headerStyle: { backgroundColor: "#fff", elevation: 0, shadowOpacity: 0 },
          headerRight: () => <ManagerHeaderRight />,
          tabBarShowLabel: true,
          tabBarActiveTintColor: MANAGER_ACCENT,
          tabBarInactiveTintColor: "#94a3b8",
          tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
          tabBarItemStyle: { justifyContent: "center", alignItems: "center" },
          tabBarStyle: {
            position: "absolute",
            bottom: tabBarBottom,
            left: 20,
            right: 20,
            height: 70,
            paddingTop: 10,
            paddingBottom: 15,
            paddingHorizontal: 8,
            backgroundColor: "#ffffff",
            borderRadius: 35,
            borderTopWidth: 0,
            elevation: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
          },
        }}
      >
        <Tab.Screen
          name="Mapa Live"
          component={MapScreen}
          options={{
            tabBarLabel: "Mapa",
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? "map" : "map-outline"} size={22} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Nova Tarefa"
          component={CreateTaskScreen}
          options={{
            tabBarLabel: "Nova O.S.",
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? "add-circle" : "add-circle-outline"} size={24} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Validações"
          component={ApprovalScreen}
          options={{
            tabBarLabel: "Validações",
            tabBarBadge: pendingApprovals > 0 ? pendingApprovals : undefined,
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? "checkmark-done" : "checkmark-done-outline"} size={22} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Minha Equipe"
          component={TeamStatusScreen}
          options={{
            tabBarLabel: "Equipe",
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? "people" : "people-outline"} size={22} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Estoque"
          component={StockScreen}
          options={{
            tabBarLabel: "Estoque",
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? "cube" : "cube-outline"} size={22} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

function TabSwitcher() {
  const { userProfile } = useAuth();
  const role = String(userProfile?.role ?? "");
  const email = String(userProfile?.email ?? "").toLowerCase();
  const isManager =
    ["manager", "super_admin", "admin"].includes(role) ||
    email.includes("admin") ||
    email.includes("gestor");
  return isManager ? <ManagerTabs /> : <MainTabs />;
}

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2196F3" />
      <Text style={styles.loadingText}>Carregando...</Text>
    </View>
  );
}

function AppContent() {
  const { userToken, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!userToken) return <LoginScreen />;

  return (
    <AppProvider>
      <StatusBar style="light" />
      <NotificationResponseHandler />
      <NavigationContainer ref={navigationRef}>
        <TabSwitcher />
      </NavigationContainer>
      <AppModals />
    </AppProvider>
  );
}

function OTAUpdateChecker({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (__DEV__) return;
    let cancelled = false;
    (async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (cancelled || !update.isAvailable) return;
        const { isNew } = await Updates.fetchUpdateAsync();
        if (cancelled || !isNew) return;
        await Updates.reloadAsync();
      } catch {
        // Ignora: Expo Go, build sem EAS, ou rede indisponível
      }
    })();
    return () => { cancelled = true; };
  }, []);
  return <>{children}</>;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <OTAUpdateChecker>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </OTAUpdateChecker>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  customButtonContainer: {
    top: -20,
    width: 60,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "transparent",
  },
  customButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "#ffffff",
    elevation: 5,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {},
    }),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2196F3",
    gap: 12,
  },
  loadingText: { color: "#fff", fontSize: 16 },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(37,99,235,0.1)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(37,99,235,0.2)",
  },
  offlineBannerOffline: { backgroundColor: "rgba(220,38,38,0.1)", borderBottomColor: "rgba(220,38,38,0.2)" },
  offlineBannerText: { fontSize: 12, color: "#374151", flex: 1, marginLeft: 8 },
  offlineSyncBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  offlineSyncBtnText: { fontSize: 12, color: "#2563eb", fontWeight: "600" },
  managerHeaderBtn: { padding: 8, marginRight: 4 },
});
