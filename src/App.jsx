import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css';
import TaskCategory from './TaskCategory.jsx';
import TaskTag from './TaskTag.jsx';
import TaskPrioritySelector from './TaskPrioritySelector.jsx';

function App() {
  const [count, setCount] = useState(0)

  return (
    <> 
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <TaskCategory task={{ id: 1 }} onTaskCategoryChange={(id, category) => console.log(`Changed category of task ${id} to ${category}`)} />
      <TaskTag task={{ id: 1 }} onTaskTagChange={(id, tag) => console.log(`Added tag ${tag} to task ${id}`)} />
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App

// 删除多余的分号
{/* 删除了多余的分号 */}
<TaskPrioritySelector task={{ id: 1 }} onTaskPriorityChange={(id, priority) => console.log(`Changed priority of task ${id} to ${priority}`)} />
