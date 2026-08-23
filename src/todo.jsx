import { useState } from 'react';
import NavBar from './components/NavBar/NavBar';
import './todo.css';

function Todo() {
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [showForm, setShowForm] = useState(true);

  const [subTasks, setSubTasks] = useState([]);

  const [schedule, setSchedule] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [breakDownTasksLoading, setBreakDownTasksLoading] = useState(false);

  const [editingTaskId, setEditingTaskId] = useState(null);

  function addTask(taskText, taskDueDate, taskDescription) {
    const newTask = {
      id: String(Date.now()),
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

    setSchedule(null);
  }

  function toggleTask(taskId) {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed
            }
          : task
      )
    );
  }

  function deleteTask(taskId) {
    setTasks(
      tasks.filter((task) => task.id !== taskId)
    );

    setSubTasks(
      subTasks.filter(
        (result) =>
          String(result.taskId) !== String(taskId)
      )
    );

    setSchedule(null);
  }

  function editTask(taskId) {
    const task = tasks.find(
      (task) => task.id === taskId
    );

    if (!task) return;

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

    setSchedule(null);
  }


  async function breakDownTasks() {
    console.log('Break Down Tasks clicked!');
    console.log('Tasks being sent:', tasks);

    setBreakDownTasksLoading(true);

    try {
      const response = await fetch(
        '/api/break-down',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tasks: tasks
          })
        }
      );

      console.log(
        'Response status:',
        response.status
      );

      const data = await response.json();

      console.log(
        'Response data:',
        data
      );

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Something went wrong'
        );
      }

      const formattedSubTasks =
        data.tasks.map((result) => ({
          taskId: String(result.taskId),

          subtasks: result.subtasks.map(
            (subtask) => ({
              text: subtask,
              completed: false
            })
          )
        }));

      console.log(
        'Formatted subtasks:',
        formattedSubTasks
      );

      setSubTasks(formattedSubTasks);
    } catch (error) {
      console.error(
        'Break down error:',
        error
      );
    }
  }


  function toggleSubTask(
    taskId,
    subtaskIndex
  ) {
    setSubTasks(
      subTasks.map((result) => {
        if (
          String(result.taskId) !==
          String(taskId)
        ) {
          return result;
        }

        return {
          ...result,

          subtasks:
            result.subtasks.map(
              (subtask, index) =>
                index === subtaskIndex
                  ? {
                      ...subtask,
                      completed:
                        !subtask.completed
                    }
                  : subtask
            )
        };
      })
    );
  }


  function addSubtasksToList(taskId) {
    const result = subTasks.find(
      (item) =>
        String(item.taskId) ===
        String(taskId)
    );

    const originalTask = tasks.find(
      (task) =>
        String(task.id) ===
        String(taskId)
    );

    if (!result || !originalTask) {
      return;
    }

    const newTasks = result.subtasks.map(
      (subtask, index) => ({
        id: `${Date.now()}-${index}`,
        text: subtask.text,
        dueDate: originalTask.dueDate,
        description: `Subtask of: ${originalTask.text}`,
        completed: subtask.completed
      })
    );

    setTasks((currentTasks) => [
      ...currentTasks,
      ...newTasks
    ]);

    setSubTasks((currentSubTasks) =>
      currentSubTasks.filter(
        (item) =>
          String(item.taskId) !==
          String(taskId)
      )
    );

    setSchedule(null);
  }


  async function createSchedule() {
    console.log(
      'Create Schedule clicked!'
    );

    console.log(
      'Tasks being sent:',
      tasks
    );

    setScheduleLoading(true);
    setSchedule(null);

    try {
      const response = await fetch(
        '/api/create-schedule',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json'
          },
          body: JSON.stringify({
            tasks: tasks
          })
        }
      );

      console.log(
        'Schedule response status:',
        response.status
      );

      const data =
        await response.json();

      console.log(
        'Schedule response:',
        data
      );

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Something went wrong while creating the schedule.'
        );
      }

      setSchedule(data);
    } catch (error) {
      console.error(
        'Schedule error:',
        error
      );
    } finally {
      setScheduleLoading(false);
    }
  }

  return (
    <div>
      <div className="todoHeader">
        <button>
          Settings
        </button>

        <button>
          Profile
        </button>
      </div>

      <h1 className="todoTitle">
        To-Do List
      </h1>

      {tasks.length === 0 ? (
        <div className="emptyState">
          <p>
            You don't have any tasks yet!
          </p>

          <input
            type="text"
            placeholder="Enter a task"
            value={taskInput}
            onChange={(event) =>
              setTaskInput(
                event.target.value
              )
            }
          />
          

          <input
            type="date"
            value={dueDate}
            onChange={(event) =>
              setDueDate(
                event.target.value
              )
            }
          />

          <input
            type="text"
            placeholder="Enter task details"
            value={taskDesc}
            onChange={(event) =>
              setTaskDesc(
                event.target.value
              )
            }
          />

          <button
            onClick={() => {
              if (
                taskInput.trim() !== ''
              ) {
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
            <div
              className="task"
              key={task.id}
            >
              {editingTaskId ===
              task.id ? (
                <div className="editForm">
                  <input
                    type="text"
                    value={taskInput}
                    onChange={(event) =>
                      setTaskInput(
                        event.target.value
                      )
                    }
                  />

                  <input
                    type="date"
                    value={dueDate}
                    onChange={(event) =>
                      setDueDate(
                        event.target.value
                      )
                    }
                  />

                  <input
                    type="text"
                    value={taskDesc}
                    onChange={(event) =>
                      setTaskDesc(
                        event.target.value
                      )
                    }
                  />

                  <button
                    onClick={() => {
                      if (
                        taskInput.trim() !==
                        ''
                      ) {
                        updateTask(
                          task.id
                        );
                      }
                    }}
                  >
                    Save
                  </button>

                  <button
                    onClick={() => {
                      setEditingTaskId(
                        null
                      );
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
                      checked={
                        task.completed
                      }
                      onChange={() =>
                        toggleTask(
                          task.id
                        )
                      }
                    />

                    <div
                      style={{
                        textDecoration:
                          task.completed
                            ? 'line-through'
                            : 'none'
                      }}
                    >
                      <div className="taskName">
                        {task.text}
                      </div>

                      {task.dueDate && (
                        <div className="taskDueDate">
                          Due:{' '}
                          {task.dueDate}
                        </div>
                      )}

                      {task.description && (
                        <div className="taskDescription">
                          {
                            task.description
                          }
                        </div>
                      )}
                    </div>
                  </div>


                  <div className="taskActions">
                    <button
                      onClick={() =>
                        editTask(
                          task.id
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteTask(
                          task.id
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>


                  {subTasks
                    .filter(
                      (result) =>
                        String(
                          result.taskId
                        ) ===
                        String(task.id)
                    )
                    .map((result) => (
                      <div
                        className="subtasksResults"
                        key={
                          result.taskId
                        }
                      >
                        <h3>
                          Suggested
                          Subtasks
                        </h3>

                        <div className="subtaskList">
                          {result.subtasks.map(
                            (
                              subtask,
                              index
                            ) => (
                              <div
                                className="subtaskItem"
                                key={
                                  index
                                }
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    subtask.completed
                                  }
                                  onChange={() =>
                                    toggleSubTask(
                                      task.id,
                                      index
                                    )
                                  }
                                />

                                <span
                                  style={{
                                    textDecoration:
                                      subtask.completed
                                        ? 'line-through'
                                        : 'none'
                                  }}
                                >
                                  {
                                    subtask.text
                                  }
                                </span>
                              </div>
                            )
                          )}
                        </div>


                        <button
                          className="addSubtasksButton"
                          onClick={() =>
                            addSubtasksToList(
                              task.id
                            )
                          }
                        >
                          Add Subtasks to My List
                        </button>
                      </div>
                    ))}
                </>
              )}
            </div>
          ))}


          {!showForm &&
            editingTaskId ===
              null && (
              <button
                className="addAnotherButton"
                onClick={() =>
                  setShowForm(true)
                }
              >
                Add another task
              </button>
            )}


          {showForm &&
            editingTaskId ===
              null && (
              <div className="emptyState">
                <input
                  type="text"
                  placeholder="Enter a task"
                  value={taskInput}
                  onChange={(event) =>
                    setTaskInput(
                      event.target.value
                    )
                  }
                />

                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(
                      event.target.value
                    )
                  }
                />

                <input
                  type="text"
                  placeholder="Enter task details"
                  value={taskDesc}
                  onChange={(event) =>
                    setTaskDesc(
                      event.target.value
                    )
                  }
                />

                <button
                  onClick={() => {
                    if (
                      taskInput.trim() !==
                      ''
                    ) {
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


      {schedule && (
        <div className="scheduleResults">
          <h2>
            Suggested Schedule
          </h2>

          {schedule.schedule &&
            schedule.schedule.map(
              (item, index) => (
                <div
                  className="scheduleItem"
                  key={index}
                >
                  <div className="scheduleNumber">
                    {index + 1}
                  </div>

                  <div>
                    <h3>
                      {item.task}
                    </h3>

                    {item.time && (
                      <p>
                        {item.time}
                      </p>
                    )}

                    {item.reason && (
                      <p>
                        {item.reason}
                      </p>
                    )}
                  </div>
                </div>
              )
            )}

          {schedule.explanation && (
            <div className="scheduleExplanation">
              <strong>
                Why this order?
              </strong>

              <p>
                {schedule.explanation}
              </p>
            </div>
          )}
        </div>
      )}


      <div className="aiActions">
        <button
          onClick={
            createSchedule
          }
          disabled={
            tasks.length === 0 ||
            scheduleLoading
          }
        >
          {scheduleLoading
            ? 'Creating Schedule...'
            : 'Create Schedule'}
        </button>

        <button
          onClick={
            breakDownTasks
          }
          disabled={
            tasks.length === 0
          }
        >
          {breakDownTasksLoading
            ? 'Breaking Down Tasks...'
            : 'Break Down Tasks'}
        </button>
      </div>

      <NavBar />
    </div>
  );
}

export default Todo;