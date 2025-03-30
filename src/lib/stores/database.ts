import { writable } from 'svelte/store';

export const sqlQuery = writable('');

export const sqlResult = writable({
  columns: [],
  rows: [],
  error: null,
  loading: false,
  message: '',
});
