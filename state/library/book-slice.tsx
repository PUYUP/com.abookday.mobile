import { getDB } from "@/db/connection";
import { books, Genre } from "@/db/schema/book";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { count, desc, eq } from "drizzle-orm";

export type BookInsertType = Omit<typeof books.$inferInsert, 'id'>;
export type BookSelectType = typeof books.$inferSelect;

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface BookState {
  entities: BookSelectType[],
  entity: BookSelectType | null,
  insert: BookInsertType | null,
  pagination: PaginationMeta,
  loading: boolean,
  error: string | null,

  selectedGenres: Genre[] | [],
}

const initialPagination: PaginationMeta = {
  currentPage: 1,
  totalPages: 0,
  totalCount: 0,
  limit: 10,
  hasNextPage: false,
  hasPrevPage: false,
};

const initialState: BookState = {
  entities: [],
  entity: null,
  insert: null,
  pagination: initialPagination,
  loading: false,
  error: null,

  // saving temporary values
  selectedGenres: [],
}

// insert book
export const insertBook = createAsyncThunk(
  'book/insertBook',
  async (payload: BookInsertType, thunkAPI) => {
    try {
      const db = await getDB();
      const response = await db.insert(books).values({
        ...payload,
      }).returning();

      return response[0];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error instanceof Error ? error.message : 'Failed to insert book'
      );
    }
  },
)

// delete book
export const deleteBook = createAsyncThunk(
  'book/deleteBook',
  async (id: number, thunkAPI) => {
    try {
      const db = await getDB();
      const response = await db.delete(books).where(eq(books.id, id)).returning();
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error instanceof Error ? error.message : 'Failed to delete book'
      );
    }
  },
);

// get books with pagination
export const getBooks = createAsyncThunk(
  'book/getBooks',
  async ({ page = 1, limit = 10 }: PaginationParams, thunkAPI) => {
    try {
      const db = await getDB();
      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await db
        .select({ count: count() })
        .from(books);
      const totalCount = countResult[0]?.count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      // Get paginated books
      const bookList = await db
        .select()
        .from(books)
        .orderBy(desc(books.createdAt))
        .limit(limit)
        .offset(offset);

      // Parse genres from JSON string
      const parsedBooks = bookList.map(book => ({
        ...book,
      }));

      return {
        books: parsedBooks,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch books'
      );
    }
  },
);

// get single book by id
export const getBook = createAsyncThunk(
  'book/getBook',
  async (id: number, thunkAPI) => {
    try {
      const db = await getDB();
      const book = await db
        .select()
        .from(books)
        .where(eq(books.id, id))
        .limit(1);

      if (!book || book.length === 0) {
        return thunkAPI.rejectWithValue('Book not found');
      }

      return book[0];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch book'
      );
    }
  },
);

// update book
export const updateBook = createAsyncThunk(
  'book/updateBook',
  async (payload: { id: number, data: BookInsertType }, thunkAPI) => {
    try {
      const { id, data } = payload;
      const db = await getDB();
      const response = await db
        .update(books)
        .set({
          ...data,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(books.id, id))
        .returning();

      if (!response || response.length === 0) {
        return thunkAPI.rejectWithValue('Book not found');
      }

      return response[0];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error instanceof Error ? error.message : 'Failed to update book'
      );
    }
  },
);

export const bookSlice = createSlice({
  name: 'book',
  initialState,
  reducers: {
    setGenres: (state, action: PayloadAction<Genre[]>) => {
      state.selectedGenres = action.payload;
      return state;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // insert book
      .addCase(insertBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(insertBook.fulfilled, (state, action) => {
        state.loading = false;
        const book = {
          ...action.payload,
          genres: action.payload.genres ? JSON.parse(action.payload.genres as string) : [],
        };
        state.entity = book;
        state.entities.unshift(book);
      })
      .addCase(insertBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // get books
      .addCase(getBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.entities = action.payload.books;
        state.pagination = action.payload.pagination;
      })
      .addCase(getBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // delete book
      .addCase(deleteBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.loading = false;
        state.entities = state.entities.filter(book => book.id !== action.payload);
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // get single book
      .addCase(getBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBook.fulfilled, (state, action) => {
        state.loading = false;
        state.entity = action.payload;
      })
      .addCase(getBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
    
      // update book
      .addCase(updateBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        state.loading = false;
        const updated = {
          ...action.payload,
          genres: action.payload.genres
            ? JSON.parse(action.payload.genres as string)
            : [],
        };
        // update entity (detail)
        state.entity = updated;
        // update inside entities list if exists
        const index = state.entities.findIndex(b => b.id === updated.id);
        if (index !== -1) {
          state.entities[index] = updated;
        }
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError } = bookSlice.actions;

export default bookSlice.reducer;