import { createSlice } from "@reduxjs/toolkit";
const initialUser = JSON.parse(localStorage.getItem('user') || 'null');

const initialState = {
    token: null,
    user: initialUser,
    isAuthenticated: !!initialUser,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            // action.payload is the user object returned by the backend
            state.user = action.payload;
            localStorage.setItem('user', JSON.stringify(action.payload));
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            localStorage.removeItem('user');
            state.isAuthenticated = false;
        },
    },
});

export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;
