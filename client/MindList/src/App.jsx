import { BrowserRouter } from "react-router";
import Router from "./routers";
import { BoardProvider } from "./contexts/BoardContext";
import { BoardListProvider } from "./contexts/BoardListContext";

function App() {
  return (
    <BrowserRouter>
      <BoardListProvider>
        <BoardProvider>
          <Router />
        </BoardProvider>
      </BoardListProvider>
    </BrowserRouter>
  );
}

export default App;
