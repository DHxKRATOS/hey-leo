import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { cardApi, CardData, CardResponse, CardsResponse } from '../api/cardApi'

export interface CardState {
  cards: CardData[]
  currentCard: CardData | null
  isLoading: boolean
  isUpdating: boolean
  error: string | null
}

const initialState: CardState = {
  cards: [],
  currentCard: null,
  isLoading: false,
  isUpdating: false,
  error: null,
}

// Async thunks
export const fetchCards = createAsyncThunk(
  'cards/fetchCards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cardApi.getAll()
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch cards')
    }
  }
)

export const fetchCardById = createAsyncThunk(
  'cards/fetchCardById',
  async (cardId: string, { rejectWithValue }) => {
    try {
      const response = await cardApi.getById(cardId)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch card')
    }
  }
)

export const createCard = createAsyncThunk(
  'cards/createCard',
  async (cardData: Partial<CardData>, { rejectWithValue }) => {
    try {
      const response = await cardApi.create(cardData)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create card')
    }
  }
)

export const updateCard = createAsyncThunk(
  'cards/updateCard',
  async ({ id, cardData }: { id: string; cardData: Partial<CardData> }, { rejectWithValue }) => {
    try {
      const response = await cardApi.update(id, cardData)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update card')
    }
  }
)

export const updateCardWithFile = createAsyncThunk(
  'cards/updateCardWithFile',
  async ({ id, formData }: { id: string; formData: FormData }, { rejectWithValue }) => {
    try {
      const response = await cardApi.updateWithFile(id, formData)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update card with file')
    }
  }
)

export const deleteCard = createAsyncThunk(
  'cards/deleteCard',
  async (cardId: string, { rejectWithValue }) => {
    try {
      await cardApi.delete(cardId)
      return cardId
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete card')
    }
  }
)

const cardSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentCard: (state, action: PayloadAction<CardData | null>) => {
      state.currentCard = action.payload
    },
    updateCurrentCard: (state, action: PayloadAction<Partial<CardData>>) => {
      if (state.currentCard) {
        state.currentCard = { ...state.currentCard, ...action.payload }
      }
    },
    clearCurrentCard: (state) => {
      state.currentCard = null
    },
  },
  extraReducers: (builder) => {
    // Fetch Cards
    builder
      .addCase(fetchCards.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCards.fulfilled, (state, action) => {
        state.isLoading = false
        state.cards = action.payload.cards
        state.error = null
      })
      .addCase(fetchCards.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch Card By ID
    builder
      .addCase(fetchCardById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCardById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentCard = action.payload.card
        state.error = null
      })
      .addCase(fetchCardById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Create Card
    builder
      .addCase(createCard.pending, (state) => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(createCard.fulfilled, (state, action) => {
        state.isUpdating = false
        state.cards.push(action.payload.card)
        state.currentCard = action.payload.card
        state.error = null
      })
      .addCase(createCard.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload as string
      })

    // Update Card
    builder
      .addCase(updateCard.pending, (state) => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(updateCard.fulfilled, (state, action) => {
        state.isUpdating = false
        const updatedCard = action.payload.card
        
        // Update in cards array
        const cardIndex = state.cards.findIndex(card => card.id === updatedCard.id)
        if (cardIndex !== -1) {
          state.cards[cardIndex] = updatedCard
        }
        
        // Update current card if it's the same
        if (state.currentCard?.id === updatedCard.id) {
          state.currentCard = updatedCard
        }
        
        state.error = null
      })
      .addCase(updateCard.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload as string
      })

    // Update Card With File
    builder
      .addCase(updateCardWithFile.pending, (state) => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(updateCardWithFile.fulfilled, (state, action) => {
        state.isUpdating = false
        const updatedCard = action.payload.card
        
        // Update in cards array
        const cardIndex = state.cards.findIndex(card => card.id === updatedCard.id)
        if (cardIndex !== -1) {
          state.cards[cardIndex] = updatedCard
        }
        
        // Update current card if it's the same
        if (state.currentCard?.id === updatedCard.id) {
          state.currentCard = updatedCard
        }
        
        state.error = null
      })
      .addCase(updateCardWithFile.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload as string
      })

    // Delete Card
    builder
      .addCase(deleteCard.pending, (state) => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(deleteCard.fulfilled, (state, action) => {
        state.isUpdating = false
        const deletedCardId = action.payload
        state.cards = state.cards.filter(card => card.id !== deletedCardId)
        
        // Clear current card if it was deleted
        if (state.currentCard?.id === deletedCardId) {
          state.currentCard = null
        }
        
        state.error = null
      })
      .addCase(deleteCard.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentCard, updateCurrentCard, clearCurrentCard } = cardSlice.actions
export default cardSlice.reducer
