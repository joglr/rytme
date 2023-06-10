import { useState } from "react";
import clsx from "clsx";
// import reactLogo from './assets/react.svg'

const letters = "12345678QWERTYUIASDFGHJKZXCVBNM;";
const boardWidth = 8;
const boardHeight = 4;

function App() {
  const [count, setCount] = useState(0);

  const boardElements = letters.split("");

  return (
    <div className="h-screen w-screen bg-gradient-to-l from-emerald-500 to bg-emerald-700">
      <div>
        <div
          className="grid grid-cols-8 grid-rows-4 gap-2 p-2"
          style={{
            aspectRatio: `${boardWidth}/${boardHeight}`,
          }}
        >
          {boardElements.map((l) => (
            <div className="grid place-items-center bg-emerald-500">{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

