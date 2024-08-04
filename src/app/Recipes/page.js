"use client";

import { Box, Stack, Typography, Button, CircularProgress, Modal } from '@mui/material';
import { firestore } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { UserAuth } from "../context/AuthContext";
import axios from 'axios';
import { marked } from 'marked';

export default function Recipes() {
  const [pantry, setPantry] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const { user, googleSignIn } = UserAuth();

  useEffect(() => {
    if (user) {
      fetchPantry();
      loadRecipesFromLocalStorage();
    }
  }, [user]);

  const fetchPantry = async () => {
    if (user) {
      const userId = user.uid;
      const inventoryCollection = collection(firestore, `users/${userId}/inventory`);
      const docs = await getDocs(inventoryCollection);
      const pantryList = docs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPantry(pantryList);
    }
  };

  const loadRecipesFromLocalStorage = () => {
    const savedRecipes = localStorage.getItem('recipes');
    if (savedRecipes) {
      setRecipes(JSON.parse(savedRecipes));
    }
  };

  const saveRecipesToLocalStorage = (recipes) => {
    localStorage.setItem('recipes', JSON.stringify(recipes));
  };

  const generateRecipes = async () => {
    setLoading(true);
    const inventoryItems = pantry.map(item => item.name).join(', ');
    const prompt = `Based on the following pantry items: ${inventoryItems}, suggest some recipes.`;

    try {
      const response = await axios.post('/api/generate-recipes', { prompt });
      console.log("Recipes response:", response.data);

      // Ensure recipes is an array of separate recipes, skipping the first element if it's not a valid recipe
      const recipesArray = response.data.recipes.split("### ")
        .filter((recipe, index) => index > 0 || recipe.trim().startsWith("1."))
        .map(recipe => "### " + recipe.trim());
      setRecipes(recipesArray);
      saveRecipesToLocalStorage(recipesArray);
    } catch (error) {
      console.error("Error generating recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRecipe = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleCloseRecipe = () => {
    setSelectedRecipe(null);
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
                <Button variant="contained" color="primary" onClick={() => handleOpenRecipe(recipe)}>
                  View Recipe {index + 1}
                </Button>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
      <Modal
        open={!!selectedRecipe}
        onClose={handleCloseRecipe}
        aria-labelledby="recipe-modal-title"
        aria-describedby="recipe-modal-description"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box
          width="80%"
          maxHeight="80vh"
          bgcolor="background.paper"
          boxShadow={24}
          p={4}
          overflow="auto"
        >
          <Typography id="recipe-modal-title" variant="h4" gutterBottom color = 'black'>
            Recipe
          </Typography>
          <Typography id="recipe-modal-description" variant="body1" component="div" color = 'black'dangerouslySetInnerHTML={{ __html: marked(selectedRecipe || "") }} />
          <Button variant="contained" color="secondary" onClick={handleCloseRecipe} style={{ marginTop: '16px' }}>
            Close
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
