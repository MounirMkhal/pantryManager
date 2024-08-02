"use client";

import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material';
import { firestore } from '../firebase';
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { UserAuth } from "../context/AuthContext";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 2
};

export default function Inventory() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [itemName, setItemName] = useState('');
  const { user, googleSignIn } = UserAuth();

  const updatePantry = async () => {
    if (user) {
      const userId = user.uid;
      const inventoryCollection = collection(firestore, `users/${userId}/inventory`);
      const docs = await getDocs(inventoryCollection);
      const pantryList = docs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPantry(pantryList);
    }
  };

  useEffect(() => {
    if (user) {
      updatePantry();
    }
  }, [user]);

  const addItem = async (item) => {
    if (user && item) {
      const userId = user.uid;
      const docRef = doc(collection(firestore, `users/${userId}/inventory`), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { count } = docSnap.data();
        await setDoc(docRef, { count: count + 1, name: item });
      } else {
        await setDoc(docRef, { count: 1, name: item });
      }
      updatePantry();
    } else {
      console.error('Invalid item name.');
    }
  };

  const removeItem = async (item) => {
    if (user && item) {
      const userId = user.uid;
      const docRef = doc(collection(firestore, `users/${userId}/inventory`), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { count } = docSnap.data();
        if (count === 1) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { count: count - 1, name: item });
        }
      }
      updatePantry();
    } else {
      console.error('Invalid item name.');
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
          You must be logged in to access the inventory page.
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
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      bgcolor={'#ffffff'}
      color={'#000000'}
      gap={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2" color='black'>
            Add new item
          </Typography>
          <Stack direction={'row'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              color="secondary"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button variant="contained"
              onClick={() => {
                if (itemName.trim()) {
                  addItem(itemName.trim());
                  setItemName('');
                  handleClose();
                } else {
                  console.error('Item name cannot be empty.');
                }
              }}
            >Add</Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained" onClick={handleOpen}>
        Add New Item
      </Button>
      <Box border={'1px solid black'} width="80%" height="80%">
        <Box width="100%" height="100px" bgcolor={'#ADD8E6'}>
          <Typography
            variant='h2'
            color={'#333'}
            textAlign={'center'}
          >
            Pantry Items
          </Typography>
        </Box>
        <Stack width="100%" height="calc(100% - 100px)" spacing={2} overflow={'auto'} style={{ overflowY: 'scroll' }}>
          {pantry.map(({ id, name, count }) => (
            <Box
              key={id}
              width="100%"
              height="100px"
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'#f0f0f0'}
              color={'#000000'}
              paddingX={5}
            >
              <Typography
                variant='h3'
                color={'#333'}
                textAlign={'center'}
              >
                {name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Unnamed Item'}
              </Typography>

              <Typography
                variant='h3'
                color={'#333'}
                textAlign={'center'}
              >
                Quantity: {count}
              </Typography>
              <Stack direction={'row'} spacing={2}>
                <Button variant="contained" 
                  style={{ backgroundColor: 'green', color: 'white' }}
                  onClick={() => {
                    if (name) addItem(name);
                  }}
                >
                  +
                </Button>
                <Button variant="contained"
                  style={{ backgroundColor: 'red', color:'white' }}
                  onClick={() => {
                    if (name) removeItem(name);
                  }}
                >
                  -
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
