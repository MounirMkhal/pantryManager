"use client";

import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material';
import { firestore } from '../firebase';
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { UserAuth } from "../context/AuthContext";
import { axios } from "axios";

export default function Recipes() {
    const [pantry, setPantry] = useState([]);
    const [Recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user, googleSignIn } = UserAuth();

    const fetchPantry = async () => {
        if (user) {
            const userId = user.uid;
            const inventoryCollection = collection(firestore, `users/${userId}/pantry`);
            const docs = await getDocs(inventoryCollection);
            const pantryList = docs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPantry(pantryList);
        }
    };

    useEffect(() => {
        if (user) {
            fetchPantry();
        }
    }, [user]);

    const generateRecipes = async () => {
        setLoading(true);
        const inventoryItems = pantry.map(item => item.name).join(',');
        const prompt = 'based on the following pantry items: ${inventoryItems}, suggest me some recipes';

        try {
            const response = await axios.post('/api/generateRecipes', { prompt });
            setRecipes(response.data);
        } catch (error) {
            console.error("Error generating recipes:", error);
        } finally {
            setLoading(false);
        }
};

if (!user) {
    return (
      <Box
        width="100vw"
        height="100vh"
        display={'flex'}
        justifyContent={'center'}
        alignItems={'center'}
        bgcolor={'#ffffff'}
        color={'#000000'}
        flexDirection={'column'}
        gap={2}
      >
        <Typography variant="h3" color="primary" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="textSecondary" textAlign="center">
          You must be logged in to access the recipes page.
        </Typography>
        <Button variant="contained" color="primary" onClick={googleSignIn}>
          Login
        </Button>
      </Box>
    );
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      bgcolor={'#ffffff'}
      color={'#000000'}
      gap={2}
      padding={5}
    >
      <Typography variant="h3" color="primary" gutterBottom>
        Recipe Suggestions
      </Typography>
      <Button variant="contained" color="primary" onClick={generateRecipes} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Generate Recipes'}
      </Button>
      {recipes.length > 0 && (
        <Box marginTop={4} width="100%">
          <Typography variant="h4" color="textPrimary" gutterBottom>
            Suggested Recipes:
          </Typography>
          <Stack spacing={2}>
            {recipes.map((recipe, index) => (
              <Box key={index} padding={2} border={'1px solid #ccc'} borderRadius={4}>
                <Typography variant="h6" color="textPrimary">
                  {recipe}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}





