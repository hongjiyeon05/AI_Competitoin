import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 온보딩 화면들 */}
      <Stack.Screen name="(onboarding)/opening" />
      <Stack.Screen name="(onboarding)/splash1" />
      <Stack.Screen name="(onboarding)/splash2" />
      <Stack.Screen name="(onboarding)/splash3" />

      {/* 초기 진입을 splash1으로 redirect 하기 위한 index */}
      <Stack.Screen name="index" />

      {/* 탭 네비게이션 */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
