import React, { useState } from 'react';
import styles from './Todo.module.css';
import {
      ChevDownSolid,
      CheckedSolid,
      UnCheckedSolid,
      OptionsDots
} from '../../components/icons';

type ID = number | string;

interface TodoType {
      id: ID;
      value: string;
      completed: boolean;
      isEditable: boolean;
}

export function Todo() {

      const [selectedFilter, setFilter] = useState<string>("All");
      const [todoList, setTodoList] = useState<TodoType[]>([]);
      const [addInput, setAddInput] = useState<string>("");

      const onChangeFilter = (value: string) => {
            setFilter(value);
      }

      const onSave = (e: React.KeyboardEvent<HTMLInputElement>) => {

            if (e.key === 'Enter' && addInput) {
                  setTodoList([
                        ...todoList,
                        {
                              id: Math.random().toString(36).substring(2, 12),
                              value: addInput,
                              completed: false,
                              isEditable: false,
                        }
                  ]);
                  setAddInput("");
            }
      }

      const onAddInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = (e.target as HTMLInputElement).value;
            setAddInput(value);
      }

      const toggleEditable = (id: ID) => {
            const index = findIndex(todoList, id);
            let item = todoList[index];
            todoList[index] = {
                  ...item,
                  isEditable: !item.isEditable
            }
            setTodoList([...todoList]);
      }

      const deleteTodo = (id: ID) => {
            const result = todoList.filter((value, index) => id !== value.id);
            setTodoList(result);
      }

      const toggleComplete = (id: ID) => {
            const index = findIndex(todoList, id);
            let item = todoList[index];
            item.completed = !item.completed;
            todoList[index] = item;
            setTodoList([...todoList]);
      }

      const saveEditedTodo = (todo: TodoType) => {
            const index = findIndex(todoList, todo.id);
            todoList[index] = {
                  ...todo,
                  isEditable: false
            };
            setTodoList([...todoList]);
      }

      const findIndex = (list: TodoType[], id: ID) => list.findIndex(el => el.id === id)

      // to filter todo as selected filter
      const filter = (bool: boolean, text: string) => text === "Done" ? bool : text === "Undone" ? !bool : true;

      // callback to apply in filter array function
      const callback = (todo: TodoType) => filter(todo.completed, selectedFilter)

      return (
            <div className={styles.container}>
                  <div className={styles.innerContainer}>
                        {/* progress bar */}
                        <Progress total={todoList.length} completed={
                              todoList.reduce((ac, o) => ac = o.completed ? ac + 1 : ac, 0)} />

                        {/* tasks & filter */}
                        <section className={styles.header}>
                              <h2 className={styles.title}>Tasks</h2>
                              <Filter selected={selectedFilter} onChange={onChangeFilter} />
                        </section>

                        {/* todo list */}
                        {
                              todoList
                                    .filter(callback)
                                    .map((todo) => {

                                          const todoElement = (<div key={todo.id} className={styles.todoItem} style={{
                                                color: todo.completed ? "#A9A9A9" : "#2E2E2E",
                                                textDecoration: todo.completed ? 'line-through' : 'none'
                                          }}>
                                                {todo.completed ? <CheckedSolid onClick={() => toggleComplete(todo.id)} />
                                                      : <UnCheckedSolid onClick={() => toggleComplete(todo.id)} />}
                                                <div className={styles.todoText}>
                                                      {todo.value}
                                                </div>
                                                <button className={styles.dots}>
                                                      <OptionsDots />
                                                      <Popover
                                                            onEdit={() => {
                                                                  toggleEditable(todo.id);
                                                            }}
                                                            onDelete={() => {
                                                                  deleteTodo(todo.id);
                                                            }} />
                                                </button>
                                          </div>);

                                          return todo.isEditable ? <EditTodo key={`${todo.id}-edit`}
                                                initialValue={todo}
                                                onSave={saveEditedTodo} /> : todoElement;
                                    })
                        }

                        {/* Add todo  */}
                        <input
                              value={addInput}
                              onChange={onAddInputChange}
                              onKeyDown={onSave}
                              type="text"
                              placeholder="Add your todo..."
                              className={styles.addInput} />
                  </div>
            </div>
      )
}

interface ProgressProps {
      total: number;
      completed: number;
}

function Progress({ total = 0, completed = 0 }: ProgressProps) {
      const percent = (completed / total) * 100;
      return (
            <div className={styles.progressContainer}>
                  <h1 className={styles.progressTitle}>Progress</h1>
                  <div style={{ [`--value`]: percent.toFixed(2) + '%' } as any}
                        className={styles.progressBar}></div>
                  <span className={styles.progressCompleted}>{completed} completed</span>
            </div>
      )
}

interface FilterPropsType {
      onChange: (v: string) => void;
      selected: string
}

function Filter({ onChange, selected }: FilterPropsType) {
      const list = ["All", "Done", "Undone"];
      return (
            <div className={styles.filter}>
                  <button
                        className={styles.filterTaget}>
                        {selected}
                        <ChevDownSolid />
                  </button>
                  <ul className={styles.optionBox} >
                        {
                              list.map(value => {
                                    const isSelected = value === selected;
                                    const _style = {
                                          backgroundColor: isSelected ? "#585292" : "white",
                                          color: isSelected ? "white" : "black"
                                    };
                                    return (<li
                                          key={value}
                                          onClick={() => onChange(value)}
                                          className={styles.option} style={_style}>
                                          {value}</li>)
                              })
                        }
                  </ul>
            </div>
      )
}

interface PopoverPropType {
      onEdit: () => void;
      onDelete: () => void;
}

const Popover = ({ onEdit, onDelete }: PopoverPropType) => {
      return (
            <ul className={styles.popover} key={Math.random()}>
                  <li key="edit" className={styles.popoverMenu}
                        onClick={onEdit}>
                        Edit
                  </li>
                  <li key="delete" className={styles.popoverMenu}
                        onClick={onDelete}
                        style={{ [`--color`]: "#E07C7C" } as any}>
                        Delete
                  </li>
            </ul>
      )
}

interface EditTodoPropType {
      initialValue: TodoType
      onSave: (v: TodoType) => void;
}

const EditTodo = ({
      initialValue,
      onSave = () => { }
}: EditTodoPropType) => {
      const [todo, setTodo] = useState(initialValue);

      const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = (e.target as HTMLInputElement).value;
            setTodo({
                  ...todo,
                  value
            });
      }

      const handleSave = (e: React.MouseEvent<HTMLElement>) => {
            if (todo.value !== "") {
                  onSave(todo);
            }
      }
      return (
            <div className={styles.editBox}>
                  <input onChange={onChange} value={todo.value} className={styles.editInput} />
                  <button className={styles.saveBtn} onClick={handleSave}>Save</button>
            </div>
      )
}