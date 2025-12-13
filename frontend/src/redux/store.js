import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
// No taskSlice in repo; remove until implemented

export const store = configureStore({
    reducer: {
        auth: authReducer,
        // task reducer placeholder
    },
});


