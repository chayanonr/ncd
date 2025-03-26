// pages/compare/index.tsx

import { Box } from '@mui/material';
import { getSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';

// components
import CompareSection1 from '@/components/compare/CompareSection1';
import CompareSection2 from '@/components/compare/CompareSection2';

// styles
import styles from '@/styles/compare/compare.module.css';

const Compare = () => {
  return (
    <Box 
      className={styles.pageMainBox}  
      padding="24px" 
      display="flex" 
      flexDirection="column" 
      gap="32px"
    > 
      <CompareSection1 />
      <CompareSection2 />
    </Box>
  );
};

export default Compare;

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Retrieve the session from the server-side
  const session = await getSession(context);
  // If no session, redirect to the sign-in page
  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }
  // Otherwise, proceed to render the page
  return {
    props: { session },
  };
};