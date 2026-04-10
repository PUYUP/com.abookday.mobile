import { configureStore } from '@reduxjs/toolkit'
import { bookSlice } from './library/book-slice'
import { readingSlice } from './reading/reading-slice'

export default configureStore({
  reducer: {
    reading: readingSlice.reducer,
    book: bookSlice.reducer,
  },
})