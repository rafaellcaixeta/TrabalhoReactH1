import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#fffaf7' },
        headerTintColor: '#342724',
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: '#f7f1ed' },
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="cadastro" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="home"
        options={{
          title: 'Minhas tarefas',
          headerShown: true,
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
}
