import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import {
      saveTodo,
      getAllTodos,
      getTodo,
      deleteTodo,
      updateTodo
} from './todoAPI';

export type ID = number | string;

export interface TodoType {
      id?: ID;
      title: string;
      completed: boolean;
      isEditable?: boolean;
}

export interface TodoState {
      todos: TodoType[];
      todo: TodoType | undefined | null;
      status: 'idle' | 'loading' | 'failed';
}

const initialState: TodoState = {
      todos: [],
      todo: null,
      status: 'idle',
};

export const addTodoAsync = createAsyncThunk(
      'todo/save',
      async (todo: TodoType) => {
            const response = await saveTodo(todo);
            // The value we return becomes the `fulfilled` action payload
            return response.data;
      }
);

export const getTodoListAsync = createAsyncThunk(
      'todolist/get',
      async () => {
            const response = await getAllTodos();
            return response.data;
      }
)

export const getTodoAsync = createAsyncThunk(
      'todo/get',
      async (id: ID) => {
            const response = await getTodo(id);
            return response.data;
      }
)

export const deleteTodoAsync = createAsyncThunk(
      'todo/delete',
      async (id: ID) => {
            const response = await deleteTodo(id);
            return response.data ? id : -1;
      }
)

export const updateTodoAsync = createAsyncThunk(
      'todo/update',
      async (todo: TodoType) => {
            const response = await updateTodo(todo);
            return response.data;
      }
)

export const todoSlice = createSlice({
      name: 'todo',
      initialState,
      reducers: {
            toggleEditable: (state, action: PayloadAction<ID>) => {
                  const index = state.todos.findIndex(todo => todo.id === action.payload);
                  state.todos[index].isEditable = !state.todos[index].isEditable;
            }
      },
      extraReducers: (builder) => {
            builder
                  .addCase(addTodoAsync.pending, (state) => {
                        state.status = 'loading';
                  })
                  .addCase(addTodoAsync.fulfilled, (state, action) => {
                        state.status = 'idle';
                        state.todos.push(action.payload);
                  })
                  .addCase(addTodoAsync.rejected, (state) => {
                        state.status = 'failed';
                  })
                  .addCase(getTodoListAsync.pending, (state) => {
                        state.status = 'loading';
                  })
                  .addCase(getTodoListAsync.fulfilled, (state, action) => {
                        state.status = 'idle';
                        state.todos = action.payload;
                  })
                  .addCase(getTodoListAsync.rejected, (state) => {
                        state.status = 'failed';
                  })
                  .addCase(getTodoAsync.pending, (state) => {
                        state.status = 'loading';
                  })
                  .addCase(getTodoAsync.fulfilled, (state, action) => {
                        state.status = 'idle';
                        state.todo = action.payload;
                  })
                  .addCase(getTodoAsync.rejected, (state) => {
                        state.status = 'failed';
                  })
                  .addCase(deleteTodoAsync.pending, (state) => {
                        state.status = 'loading';
                  })
                  .addCase(deleteTodoAsync.fulfilled, (state, action) => {
                        state.status = 'idle';
                        state.todos = state.todos.filter(todo => todo.id !== action.payload);
                  })
                  .addCase(deleteTodoAsync.rejected, (state) => {
                        state.status = 'failed';
                  })
                  .addCase(updateTodoAsync.pending, (state) => {
                        state.status = 'loading';
                  })
                  .addCase(updateTodoAsync.fulfilled, (state, action) => {
                        state.status = 'idle';
                        const index = state.todos.findIndex(todo => todo.id === action.payload.id)
                        state.todos[index] = action.payload;
                  })
                  .addCase(updateTodoAsync.rejected, (state) => {
                        state.status = 'failed';
                  });
      },
});

export const { toggleEditable } = todoSlice.actions;

export const selectTodos = (state: RootState) => state.todo.todos;

export const selectStatus = (state: RootState) => state.todo.status;

export default todoSlice.reducer;
