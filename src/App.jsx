
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { RouterProvider } from "react-router-dom";

import router from "./app/router";
import { fetchCurrentUser } from "./auth/authThunks";
import { storage } from "./shared/utils/storage";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = storage.getToken();

    if (!token) return undefined;

    const request = dispatch(fetchCurrentUser());

    return () => request.abort();
  }, [dispatch]);

  return <RouterProvider router={router} />;
}

export default App;
