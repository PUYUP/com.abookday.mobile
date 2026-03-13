import { useRouter } from 'expo-router';
import React, { forwardRef, useImperativeHandle } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const GENRES = [
  'Fiction',
  'Non-Fiction',
  'Mystery',
  'Science Fiction',
  'Fantasy',
  'Biography',
  'History',
  'Romance',
  'Thriller',
  'Self-Help',
];

export type BookFormData = {
  title: string;
  author: string;
  genre: string;
  totalPages: string;
};

export type BookFormProps = {
  defaultValues?: Partial<BookFormData>;
  onSubmit?: (data: BookFormData) => void;
  showSubmitButton?: boolean;
};

export type BookFormHandle = {
  submit: () => void;
};

function BookFormInner({ defaultValues, onSubmit, showSubmitButton = false }: BookFormProps, ref: React.Ref<BookFormHandle>) {
  const router = useRouter();
 
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BookFormData>({
    defaultValues: {
      title: '',
      author: '',
      genre: '',
      totalPages: '',
      ...defaultValues,
    },
  });

  const selectedGenre = watch('genre');

  const handleFormSubmit = (data: BookFormData) => {
    if (onSubmit) {
      onSubmit(data);
    } else {
      console.log('Book submitted:', data);
    }
  };

  const submit = handleSubmit(handleFormSubmit);

  useImperativeHandle(ref, () => ({ submit }), [submit]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.flex, styles.container]}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Title*</Text>
            <Controller
              control={control}
              name="title"
              rules={{ required: 'Title is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.title && styles.inputError]}
                  placeholder="Enter book title"
                  placeholderTextColor={colors.placeholder}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  returnKeyType="next"
                />
              )}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Total Pages*</Text>
            <Controller
              control={control}
              name="totalPages"
              rules={{
                required: 'Total pages is required',
                pattern: {
                  value: /^\d+$/,
                  message: 'Must be a valid number',
                },
                min: { value: 1, message: 'Must be at least 1 page' },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.totalPages && styles.inputError]}
                  placeholder="e.g. 320"
                  placeholderTextColor={colors.placeholder}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="number-pad"
                  returnKeyType="done"
                />
              )}
            />
            {errors.totalPages && (
              <Text style={styles.errorText}>{errors.totalPages.message}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Author</Text>
            <Controller
              control={control}
              name="author"
              rules={{ required: false }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.author && styles.inputError]}
                  placeholder="Enter author name"
                  placeholderTextColor={colors.placeholder}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  returnKeyType="next"
                />
              )}
            />
            {errors.author && <Text style={styles.errorText}>{errors.author.message}</Text>}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Genre</Text>
            <Controller
              control={control}
              name="genre"
              rules={{ required: false }}
              render={() => (
                <TouchableOpacity
                  style={[styles.input, styles.selectInput, errors.genre && styles.inputError]}
                  onPress={() => router.push('/genre-selector')}
                  activeOpacity={0.7}
                >
                  <Text style={selectedGenre ? styles.selectText : styles.selectPlaceholder}>
                    {selectedGenre || 'Select a genre'}
                  </Text>
                  <Text style={styles.chevron}>▼</Text>
                </TouchableOpacity>
              )}
            />
            {errors.genre && <Text style={styles.errorText}>{errors.genre.message}</Text>}
          </View>
        </View>

        {showSubmitButton && (
            <TouchableOpacity
                style={styles.submitButton}
                onPress={submit}
                activeOpacity={0.85}
            >
                <Text style={styles.submitText}>Save Book</Text>
            </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const BookForm = forwardRef<BookFormHandle, BookFormProps>(BookFormInner);

export default BookForm;

const colors = {
  background: '#f5f5f5',
  surface: '#ffffff',
  border: '#e0e0e0',
  borderFocus: '#9e9e9e',
  borderError: '#c62828',
  text: '#1a1a1a',
  textSecondary: '#616161',
  placeholder: '#bdbdbd',
  label: '#424242',
  eyebrow: '#9e9e9e',
  activeItem: '#f5f5f5',
  activeText: '#1a1a1a',
  submit: '#212121',
  submitText: '#ffffff',
  error: '#c62828',
  chevron: '#9e9e9e',
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    backgroundColor: colors.background,
    paddingTop: 24,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  form: {
    gap: 20,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontWeight: '600',
    color: colors.label,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.borderError,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 2,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 15,
    color: colors.text,
  },
  selectPlaceholder: {
    fontSize: 15,
    color: colors.placeholder,
  },
  chevron: {
    fontSize: 10,
    color: colors.chevron,
  },
  dropdown: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemActive: {
    backgroundColor: colors.activeItem,
  },
  dropdownItemText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  dropdownItemTextActive: {
    color: colors.activeText,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.submit,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 36,
  },
  submitText: {
    color: colors.submitText,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
