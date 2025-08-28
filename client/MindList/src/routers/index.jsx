import { Route, Routes } from "react-router";
import BoardPage from "../Pages/BoardPage";
import BoardListPage from "../Pages/BoardListPage";
import AppShell from "../components/AppShell";

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<BoardListPage />} />
      <Route element={<AppShell />}>
        <Route path="/boards/:id" element={<BoardPage />} />
      </Route>
    </Routes>
  );
};

export default Router;
