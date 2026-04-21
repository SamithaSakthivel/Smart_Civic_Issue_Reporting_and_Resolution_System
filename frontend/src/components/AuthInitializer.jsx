
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRefreshQuery } from "../features/auth/authApiSlice";
import { setCredentials } from "../features/auth/authSlice";

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.accessToken);


  const { data, isFetching, isError } = useRefreshQuery(undefined, {
    skip: !!token,
  });

  useEffect(() => {
    if (data?.accessToken && data?.user) {
      dispatch(setCredentials(data)); 
    }
  }, [data, dispatch]);

  if (!token && isFetching) {
    return <p>Loading session…</p>;
  }

  return children;
};

export default AuthInitializer;