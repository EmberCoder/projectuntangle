import { useState } from 'react';
import './todo.css';

function Todo() {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [showForm, setShowForm] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState(null);

  function addTask(taskText, dueDate, taskDesc) {
    const newTask = {
      id: Date.now(),
      text: taskText,
      dueDate: dueDate,
      description: taskDesc,
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

  function updateTask(taskId, taskText, dueDate, taskDesc) {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              text: taskText,
              dueDate: dueDate,
              description: taskDesc
            }
          : task
      )
    );

    setEditingTaskId(null);
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
            onChange={(event) => setTaskInput(event.target.value)}
          />

          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />

          <input
            type="text"
            placeholder="Enter task details"
            value={taskDesc}
            onChange={(event) => setTaskDesc(event.target.value)}
          />

          <button
            onClick={() => {
              if (taskInput.trim() !== '') {
                addTask(taskInput, dueDate, taskDesc);
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
                        updateTask(
                          task.id,
                          taskInput,
                          dueDate,
                          taskDesc
                        );

                        setTaskInput('');
                        setDueDate('');
                        setTaskDesc('');
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
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
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

                  <button onClick={() => editTask(task.id)}>
                    Edit
                  </button>

                  <button onClick={() => deleteTask(task.id)}>
                    Delete
                  </button>
                </>
              )}

            </div>
          ))}

          {!showForm && editingTaskId === null && (
            <button onClick={() => setShowForm(true)}>
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

        </div>
      )}

    </div>
  );
}

export default Todo;