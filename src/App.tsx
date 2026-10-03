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
      {/* Below the navigation bar, so a toast never covers the menu button. */}
      <Toaster position="top-right" containerStyle={{ top: 72 }} />
    </>
  );
}

export default App;
