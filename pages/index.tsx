import { useEffect } from 'react';
import { useRouter } from 'next/router';
const Index = () => {
  const router = useRouter();

  useEffect(() => {
    // Default page
    router.replace('/dao/UXP');
  }, []);

  return null;
};

export default Index;
