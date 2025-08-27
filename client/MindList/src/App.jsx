import { BrowserRouter } from "react-router";
import Router from "./routers";
import { BoardProvider } from "./contexts/BoardContext";

function App() {
  return (
    <BrowserRouter>
      <BoardProvider>
        <Router />
      </BoardProvider>
    </BrowserRouter>
  );
}

export default App;
