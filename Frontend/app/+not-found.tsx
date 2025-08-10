import { ThemedText } from '@/components/ThemedText';
import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => <ThemedText type="title">Oops!</ThemedText>,
        }}
      />
      <View style={styles.container}>
        <ThemedText type="title">This screen does not exist.</ThemedText>
        <Link href="/opening" style={styles.link}>
          <ThemedText type="default">Go to home screen!</ThemedText>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
