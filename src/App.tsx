import { Outlet } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import { NewAccountModal } from "./components/NewAccountModal";

function App() {
  return (
    <>
      <Navbar />
      <Outlet />
      <NewAccountModal />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
