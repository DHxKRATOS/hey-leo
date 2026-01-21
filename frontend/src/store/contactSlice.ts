import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { contactApi, ContactData, ContactResponse, ContactsResponse, ContactFilters } from '../api/contactApi'

export interface ContactState {
  contacts: ContactData[]
  currentContact: ContactData | null
  isLoading: boolean
  isUpdating: boolean
  error: string | null
  pagination: {
    page: number
    pageSize: number
    total: number
    pageCount: number
  } | null
  filters: ContactFilters
  companies: string[]
  tags: string[]
}

const initialState: ContactState = {
  contacts: [],
  currentContact: null,
  isLoading: false,
  isUpdating: false,
  error: null,
  pagination: null,
  filters: {
    page: 1,
    pageSize: 20,
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  },
  companies: [],
  tags: [],
}

// Async thunks
export const fetchContacts = createAsyncThunk(
  'contacts/fetchContacts',
  async (filters: ContactFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await contactApi.getAll(filters)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch contacts')
    }
  }
)

export const fetchContactById = createAsyncThunk(
  'contacts/fetchContactById',
  async (contactId: string, { rejectWithValue }) => {
    try {
      const response = await contactApi.getById(contactId)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch contact')
    }
  }
)

export const createContact = createAsyncThunk(
  'contacts/createContact',
  async (contactData: Partial<ContactData>, { rejectWithValue }) => {
    try {
      const response = await contactApi.create(contactData)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create contact')
    }
  }
)

export const updateContact = createAsyncThunk(
  'contacts/updateContact',
  async ({ id, contactData }: { id: string; contactData: Partial<ContactData> }, { rejectWithValue }) => {
    try {
      const response = await contactApi.update(id, contactData)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update contact')
    }
  }
)

export const deleteContact = createAsyncThunk(
  'contacts/deleteContact',
  async (contactId: string, { rejectWithValue }) => {
    try {
      await contactApi.delete(contactId)
      return contactId
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete contact')
    }
  }
)

export const bulkDeleteContacts = createAsyncThunk(
  'contacts/bulkDeleteContacts',
  async (contactIds: string[], { rejectWithValue }) => {
    try {
      await contactApi.bulkDelete(contactIds)
      return contactIds
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete contacts')
    }
  }
)

export const fetchCompanies = createAsyncThunk(
  'contacts/fetchCompanies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await contactApi.getCompanies()
      return response.companies || []
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch companies')
    }
  }
)

export const fetchTags = createAsyncThunk(
  'contacts/fetchTags',
  async (_, { rejectWithValue }) => {
    try {
      const response = await contactApi.getTags()
      return response.tags || []
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch tags')
    }
  }
)

export const searchContacts = createAsyncThunk(
  'contacts/searchContacts',
  async (filters: ContactFilters, { rejectWithValue }) => {
    try {
      const response = await contactApi.search(filters)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to search contacts')
    }
  }
)

const contactSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentContact: (state, action: PayloadAction<ContactData | null>) => {
      state.currentContact = action.payload
    },
    updateCurrentContact: (state, action: PayloadAction<Partial<ContactData>>) => {
      if (state.currentContact) {
        state.currentContact = { ...state.currentContact, ...action.payload }
      }
    },
    clearCurrentContact: (state) => {
      state.currentContact = null
    },
    setFilters: (state, action: PayloadAction<Partial<ContactFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        page: 1,
        pageSize: 20,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      }
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.filters.page = action.payload
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.filters.pageSize = action.payload
      state.filters.page = 1 // Reset to first page when changing page size
    },
  },
  extraReducers: (builder) => {
    // Fetch Contacts
    builder
      .addCase(fetchContacts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.isLoading = false
        state.contacts = action.payload.contacts
        state.pagination = action.payload.pagination || null
        state.error = null
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Search Contacts
    builder
      .addCase(searchContacts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(searchContacts.fulfilled, (state, action) => {
        state.isLoading = false
        state.contacts = action.payload.contacts
        state.pagination = action.payload.pagination || null
        state.error = null
      })
      .addCase(searchContacts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch Contact By ID
    builder
      .addCase(fetchContactById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchContactById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentContact = action.payload.contact
        state.error = null
      })
      .addCase(fetchContactById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Create Contact
    builder
      .addCase(createContact.pending, (state) => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(createContact.fulfilled, (state, action) => {
        state.isUpdating = false
        state.contacts.unshift(action.payload.contact) // Add to beginning of list
        state.currentContact = action.payload.contact
        // Update pagination total if available
        if (state.pagination) {
          state.pagination.total += 1
        }
        state.error = null
      })
      .addCase(createContact.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload as string
      })

    // Update Contact
    builder
      .addCase(updateContact.pending, (state) => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        state.isUpdating = false
        const updatedContact = action.payload.contact
        
        // Update in contacts array
        const contactIndex = state.contacts.findIndex(contact => contact.id === updatedContact.id)
        if (contactIndex !== -1) {
          state.contacts[contactIndex] = updatedContact
        }
        
        // Update current contact if it's the same
        if (state.currentContact?.id === updatedContact.id) {
          state.currentContact = updatedContact
        }
        
        state.error = null
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload as string
      })

    // Delete Contact
    builder
      .addCase(deleteContact.pending, (state) => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.isUpdating = false
        const deletedContactId = action.payload
        state.contacts = state.contacts.filter(contact => contact.id !== deletedContactId)
        
        // Clear current contact if it was deleted
        if (state.currentContact?.id === deletedContactId) {
          state.currentContact = null
        }
        
        // Update pagination total if available
        if (state.pagination) {
          state.pagination.total -= 1
        }
        
        state.error = null
      })
      .addCase(deleteContact.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload as string
      })

    // Bulk Delete Contacts
    builder
      .addCase(bulkDeleteContacts.pending, (state) => {
        state.isUpdating = true
        state.error = null
      })
      .addCase(bulkDeleteContacts.fulfilled, (state, action) => {
        state.isUpdating = false
        const deletedContactIds = action.payload
        state.contacts = state.contacts.filter(contact => !deletedContactIds.includes(contact.id!))
        
        // Clear current contact if it was deleted
        if (state.currentContact && deletedContactIds.includes(state.currentContact.id!)) {
          state.currentContact = null
        }
        
        // Update pagination total if available
        if (state.pagination) {
          state.pagination.total -= deletedContactIds.length
        }
        
        state.error = null
      })
      .addCase(bulkDeleteContacts.rejected, (state, action) => {
        state.isUpdating = false
        state.error = action.payload as string
      })

    // Fetch Companies
    builder
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.companies = action.payload
      })

    // Fetch Tags
    builder
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.tags = action.payload
      })
  },
})

export const { 
  clearError, 
  setCurrentContact, 
  updateCurrentContact, 
  clearCurrentContact,
  setFilters,
  clearFilters,
  setPage,
  setPageSize
} = contactSlice.actions

export default contactSlice.reducer
