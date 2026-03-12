import { configureStore } from '@reduxjs/toolkit'
import { readingSlice } from './reading/reading-slice'

export default configureStore({
  reducer: {
    reading: readingSlice.reducer,
  },
})