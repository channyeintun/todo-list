// saveTodo, getAllTodos, getTodo, deleteTodo 
import { ID, TodoType } from "./todoSlice";

const headers = {
      'Content-Type': 'application/json',
}

const API_URL = 'http://localhost:3001/todos';

const [GET, POST, PATCH, DELETE] = ['GET', 'POST', 'PATCH', 'DELETE'];

export function saveTodo(todo: TodoType) {
      const requestOptions = {
            method: POST,
            headers,
            body:JSON.stringify(todo)
      };
      return fetch(`${API_URL}`, requestOptions).then(handleResponse);
}

export function getAllTodos() {
      const requestOptions = {
            method: GET,
            headers
      };
      return fetch(`${API_URL}`, requestOptions).then(handleResponse);
}

export function getTodo(id: ID) {
      const requestOptions = {
            method: GET,
            headers
      };
      return fetch(`${API_URL}/${id}`, requestOptions).then(handleResponse);
}

export function updateTodo(todo: TodoType) {
      const requestOptions = {
            method: PATCH,
            headers,
            body: JSON.stringify(todo)
      };
      return fetch(`${API_URL}/${todo.id}`, requestOptions).then(handleResponse);
}

export function deleteTodo(id: ID) {
      const requestOptions = {
            method: DELETE,
            headers
      };
      return fetch(`${API_URL}/${id}`, requestOptions).then(handleResponse);
}

function handleResponse(response: any) {
      return response.text().then((text: string) => {
            const data = text && JSON.parse(text);
            if (!response.ok) {
                  const error = (data && (data.message)) || response.statusText;
                  throw new Error(error);
            }
            return { data };
      });
}