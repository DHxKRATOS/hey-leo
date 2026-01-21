import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import cardReducer from './cardSlice'
import contactReducer from './contactSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cards: cardReducer,
    contacts: contactReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
