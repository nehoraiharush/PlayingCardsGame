import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import sliceService from './authService.js';

const initialState = {
    isLoading: false,
    isError: false,
    message: ''
}

export const login = createAsyncThunk(
    'api/login',
    async (data, thunkApi) => {
        try {
            return await sliceService.login(data)
        } catch (error) {
            return thunkApi.rejectWithValue(error.message);
        }
    }
);

export const logout = createAsyncThunk(
    'api/logout',
    async (data, thunkApi) => {
        try {
            return await sliceService.logout(data)
        } catch (error) {
            return thunkApi.rejectWithValue(error.message);
        }
    }
);

export const updatePoints = createAsyncThunk(
    'api/updatePoints',
    async (data, thunkApi) => {
        try {
            return await sliceService.updatePoints(data)
        } catch (error) {
            return thunkApi.rejectWithValue(error.message);
        }
    }
);

export const getScoreboard = createAsyncThunk(
    'api/getScoreboard',
    async (data, thunkApi) => {
        try {
            return await sliceService.getScoreboard()
        } catch (error) {
            return thunkApi.rejectWithValue(error.message);
        }
    }
);

export const authSlice = createSlice({
    name: 'api',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false
            state.isError = false
            state.message = ''
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false
                if (!action.payload.status)
                    state.message = action.payload.message
                else state.message = ''
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload.message
            })
            .addCase(logout.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload.message
            })
            .addCase(logout.fulfilled, (state, action) => {
                if (!action.payload.status)
                    state.message = action.payload.message
                else state.message = ''
            })
            .addCase(updatePoints.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload.message
            })
            .addCase(updatePoints.fulfilled, (state, action) => {
                if (!action.payload.status)
                    state.message = action.payload.message
                else state.message = ''
            })
            .addCase(getScoreboard.pending, (state, action) => {
                state.isLoading = true;
            })
            .addCase(getScoreboard.fulfilled, (state, action) => {
                state.isLoading = false;
                if (!action.payload.status) {
                    if (localStorage.getItem('scoreboard')) localStorage.removeItem('scoreboard')
                    state.message = action.payload.message;
                } else state.message = ''
            })
            .addCase(getScoreboard.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload.message
            })

    }
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;