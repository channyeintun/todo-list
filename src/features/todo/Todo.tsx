import React, { useEffect, useState } from 'react';
import styles from './Todo.module.css';
import {
      ChevDownSolid,
      CheckedSolid,
      UnCheckedSolid,
      OptionsDots
} from '../../components/icons';
import {
      ID,
      TodoType,
      addTodoAsync,
      getTodoListAsync,
      updateTodoAsync,
      deleteTodoAsync,
      selectTodos,
      selectStatus,
      toggleEditable
} from './todoSlice';
import { useAppSelector, useAppDispatch } from '../../app/hooks';

export function Todo() {

      const dispatch = useAppDispatch();
      const todos = useAppSelector(selectTodos);
      const status = useAppSelector(selectStatus);
      const [selectedFilter, setFilter] = useState<string>("All");
      const [addInput, setAddInput] = useState<string>("");

      useEffect(() => {
            dispatch(getTodoListAsync());
      }, []);

      const onChangeFilter = (title: string) => {
            setFilter(title);
      }

      // on enter in input box to add new todo item
      const onSave = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' && addInput !== "") {
                  const newItem = {
                        title: addInput,
                        completed: false,
                        isEditable: false,
                  };
                  dispatch(addTodoAsync(newItem));
                  setAddInput("");
            }
      }

      // to control state of input box used to add new todo item
      const onAddInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = (e.target as HTMLInputElement).value;
            setAddInput(value);
      }

      // on click edit button
      const _toggleEditable = (id: ID) => {
            dispatch(toggleEditable(id));
      }

      // on click delete button
      const deleteTodo = (id: ID) => {
            dispatch(deleteTodoAsync(id));
      }

      // on click checkbox
      const toggleComplete = (id: ID) => {
            const index = findIndex(todos, id);
            const item = todos[index];
            const updated = {
                  ...item,
                  completed: !item.completed
            };
            dispatch(updateTodoAsync(updated));
      }

      // save action for editting todo item
      const saveEditedTodo = (todo: TodoType) => {
            const updated = {
                  ...todo,
                  isEditable: false
            };
            dispatch(updateTodoAsync(updated));
      }

      // utility function
      const findIndex = (list: TodoType[], id: ID) => list.findIndex(el => el.id === id)

      // to filter todo as selected filter
      const filter = (bool: boolean, text: string) => text === "Done" ? bool : text === "Undone" ? !bool : true;

      // callback to apply in filter array function
      const callback = (todo: TodoType) => filter(todo.completed, selectedFilter)

      return (
            <div className={styles.container} style={{
                  [`--cursor`]: status === 'loading' ? 'wait' : 'default'
            } as any}>
                  <div className={styles.innerContainer}>
                        {/* progress bar */}
                        <Progress total={todos.length} completed={
                              todos.reduce((ac, o) => ac = o.completed ? ac + 1 : ac, 0)} />

                        {/* tasks & filter */}
                        <section className={styles.header}>
                              <h2 className={styles.title}>Tasks</h2>
                              <Filter selected={selectedFilter} onChange={onChangeFilter} />
                        </section>

                        {/* todo list */}
                        {
                              todos
                                    .filter(callback)
                                    .map((todo) => {

                                          const todoElement = (<div key={todo.id} className={styles.todoItem} style={{
                                                color: todo.completed ? "#A9A9A9" : "#2E2E2E",
                                                textDecoration: todo.completed ? 'line-through' : 'none'
                                          }}>
                                                {todo.completed ? <CheckedSolid onClick={() => toggleComplete(todo.id as ID)} />
                                                      : <UnCheckedSolid onClick={() => toggleComplete(todo.id as ID)} />}
                                                <div className={styles.todoText}>
                                                      {todo.title}
                                                </div>
                                                <button className={styles.dots}>
                                                      <OptionsDots />
                                                      <Popover
                                                            onEdit={() => {
                                                                  _toggleEditable(todo.id as ID);
                                                            }}
                                                            onDelete={() => {
                                                                  deleteTodo(todo.id as ID);
                                                            }} />
                                                </button>
                                          </div>);

                                          return todo.isEditable ? <EditTodo key={`${todo.id}-edit`}
                                                initialValue={todo}
                                                onSave={saveEditedTodo} /> : todoElement;
                                    })
                        }

                        {/* Add todo - input */}
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
            const title = (e.target as HTMLInputElement).value;
            setTodo({
                  ...todo,
                  title
            });
      }

      const handleSave = (e: React.MouseEvent<HTMLElement>) => {
            if (todo.title !== "") {
                  onSave(todo);
            }
      }

      const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' && todo.title !== "") {
                  onSave(todo);
            }
      }

      return (
            <div className={styles.editBox}>
                  <input
                        onChange={onChange}
                        value={todo.title}
                        className={styles.editInput}
                        onKeyDown={handleKeyDown} />
                  <button
                        className={styles.saveBtn}
                        onClick={handleSave}>Save</button>
            </div>
      )
}