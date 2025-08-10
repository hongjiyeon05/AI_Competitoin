import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/(onboarding)/opening');
    }, 0); // 한 틱 뒤에 실행 (라우터가 준비된 후)

    return () => clearTimeout(timeout);
  }, []);

  return null;
}
