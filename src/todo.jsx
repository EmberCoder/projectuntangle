import { useState } from 'react';
import './todo.css';
import NavBar from './components/NavBar/NavBar';

function Todo() {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [showForm, setShowForm] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState(null);

  function addTask(taskText, taskDueDate, taskDescription) {
    const newTask = {
      id: Date.now(),
      text: taskText,
      dueDate: taskDueDate,
      description: taskDescription,
      completed: false
    };

    setTasks([...tasks, newTask]);
    setTaskInput('');
    setDueDate('');
    setTaskDesc('');
    setShowForm(false);
  }

  function toggleTask(taskId) {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }

  function deleteTask(taskId) {
    setTasks(
      tasks.filter((task) => task.id !== taskId)
    );
  }

  function editTask(taskId) {
    const task = tasks.find((task) => task.id === taskId);

    setEditingTaskId(taskId);
    setTaskInput(task.text);
    setDueDate(task.dueDate);
    setTaskDesc(task.description);
  }

  function updateTask(taskId) {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              text: taskInput,
              dueDate: dueDate,
              description: taskDesc
            }
          : task
      )
    );

    setEditingTaskId(null);
    setTaskInput('');
    setDueDate('');
    setTaskDesc('');
  }

  return (
    <div className="stage">

      <div className="todoHeader">
        <button>Settings</button>
        <button>Profile</button>
      </div>

      <h1 className="todoTitle">To-Do List</h1>

      {tasks.length === 0 ? (
        <div className="emptyState">

          <p>You don't have any tasks yet!</p>

          <input
            type="text"
            placeholder="Enter a task"
            value={taskInput}
            onChange={(event) =>
              setTaskInput(event.target.value)
            }
          />

          <input
            type="date"
            value={dueDate}
            onChange={(event) =>
              setDueDate(event.target.value)
            }
          />

          <input
            type="text"
            placeholder="Enter task details"
            value={taskDesc}
            onChange={(event) =>
              setTaskDesc(event.target.value)
            }
          />

          <button
            onClick={() => {
              if (taskInput.trim() !== '') {
                addTask(
                  taskInput,
                  dueDate,
                  taskDesc
                );
              }
            }}
          >
            Add a task
          </button>

        </div>
      ) : (

        <div className="taskList">

          {tasks.map((task) => (

            <div className="task" key={task.id}>

              {editingTaskId === task.id ? (

                <div className="editForm">

                  <input
                    type="text"
                    value={taskInput}
                    onChange={(event) =>
                      setTaskInput(event.target.value)
                    }
                  />

                  <input
                    type="date"
                    value={dueDate}
                    onChange={(event) =>
                      setDueDate(event.target.value)
                    }
                  />

                  <input
                    type="text"
                    value={taskDesc}
                    onChange={(event) =>
                      setTaskDesc(event.target.value)
                    }
                  />

                  <button
                    onClick={() => {
                      if (taskInput.trim() !== '') {
                        updateTask(task.id);
                      }
                    }}
                  >
                    Save
                  </button>

                  <button
                    onClick={() => {
                      setEditingTaskId(null);
                      setTaskInput('');
                      setDueDate('');
                      setTaskDesc('');
                    }}
                  >
                    Cancel
                  </button>

                </div>

              ) : (

                <>
                  <div className="taskCard">

                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() =>
                        toggleTask(task.id)
                      }
                    />

                    <div
                      style={{
                        textDecoration: task.completed
                          ? 'line-through'
                          : 'none'
                      }}
                    >

                      <div className="taskName">
                        {task.text}
                      </div>

                      {task.dueDate && (
                        <div className="taskDueDate">
                          Due: {task.dueDate}
                        </div>
                      )}

                      {task.description && (
                        <div className="taskDescription">
                          {task.description}
                        </div>
                      )}

                    </div>

                  </div>

                  <div className="taskActions">

                    <button
                      onClick={() =>
                        editTask(task.id)
                      }
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteTask(task.id)
                      }
                    >
                      Delete
                    </button>

                  </div>
                </>

              )}

            </div>

          ))}

          {!showForm && editingTaskId === null && (
            <button
              className="addAnotherButton"
              onClick={() => setShowForm(true)}
            >
              Add another task
            </button>
          )}

          {showForm && editingTaskId === null && (

            <div className="emptyState">

              <input
                type="text"
                placeholder="Enter a task"
                value={taskInput}
                onChange={(event) =>
                  setTaskInput(event.target.value)
                }
              />

              <input
                type="date"
                value={dueDate}
                onChange={(event) =>
                  setDueDate(event.target.value)
                }
              />

              <input
                type="text"
                placeholder="Enter task details"
                value={taskDesc}
                onChange={(event) =>
                  setTaskDesc(event.target.value)
                }
              />

              <button
                onClick={() => {
                  if (taskInput.trim() !== '') {
                    addTask(
                      taskInput,
                      dueDate,
                      taskDesc
                    );
                  }
                }}
              >
                Add a task
              </button>

            </div>

          )}
          <div className="aiActions">
            <button>Create Schedule</button>
            <button>Break Down Tasks</button>
          </div>
        </div>

      )}

      <NavBar />

    </div>
  );
}

export default Todo;