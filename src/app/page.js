'use client';

import React from "react";
import { Box, Typography, Button } from '@mui/material';
import Link from "next/link";
import { UserAuth } from "./context/AuthContext";

export default function Home() {
  const { user } = UserAuth();

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      justifyContent={'center'}
      bgcolor={'#ffffff'}
      color={'#000000'}
      gap={2}
      padding={5}
    >
      <Typography variant="h3" color="primary" gutterBottom>
        Welcome {user ? user.displayName : 'Guest'} to Pantry Management App
      </Typography>
      <Typography variant="h5" color="textSecondary" textAlign="center">
        This app provides the following features:
      </Typography>
      <Typography variant="body1" color="textSecondary" textAlign="center" marginTop={2}>
        1. Inventory Management: Keep track of your pantry items, add, remove, and update quantities.
      </Typography>
      <Typography variant="body1" color="textSecondary" textAlign="center" marginTop={1}>
        2. Recipes: Get recipe suggestions based on the items you have in your inventory.
      </Typography>
      <Box marginTop={4} display={'flex'} gap={2}>
        <Button variant="contained" component={Link} href="/inventory">
          Go to Inventory
        </Button>
        <Button variant="contained" component={Link} href="/recipes">
          View Recipes
        </Button>
      </Box>
    </Box>
  );
}

export { Home };