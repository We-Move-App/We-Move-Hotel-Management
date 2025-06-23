import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import AuthContextProvider from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <AuthContextProvider>
    {/* <BrowserRouter> */}
    {/* <Provider store={store} > */}
    <App />
    {/* </Provider> */}
    {/* </BrowserRouter> */}
  </AuthContextProvider>
);
