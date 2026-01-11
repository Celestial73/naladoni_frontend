import useAuth from "./useAuth";

const useLogout = () => {
    const { setAuth } = useAuth();

    const logout = () => {
        // Clear auth state (initData)
        setAuth({});
    }

    return logout;
}

export default useLogout