export interface BookDetails {
  id: string;
  title: string;
  author?: string;
  genre: string;
  coverImageUri?: string;
  description?: string;
  totalPages?: number;
  lastReadPage?: number;
  status?: 'reading' | 'paused' | 'finished' | 'archived';
}