import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { persistStore, persistReducer } from 'redux-persist';  // ✅ NEW
import storage from 'redux-persist/lib/storage';  // ✅ NEW (localStorage)
import { apiSlice } from './api/apiSlice';
import authReducer from '../features/auth/authSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth']  // ✅ ONLY persist auth slice
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: persistedAuthReducer  // ✅ PERSISTED VERSION
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware(
      {
    serializableCheck: {
      ignoredActions: [
        'persist/PERSIST', 
        'persist/REHYDRATE',
        'persist/REGISTER',  // ✅ ADD THIS
        'auth/setCredentials'  // ✅ ADD THIS
      ]
    }
}).concat(apiSlice.middleware),
  devTools: true
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);  // ✅ NEW EXPORT

export default store;