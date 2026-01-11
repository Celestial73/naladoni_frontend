import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { initData, useSignal, useLaunchParams } from "@tma.js/sdk-react";
import { Placeholder, AppRoot } from '@telegram-apps/telegram-ui';
import useRefreshToken from '../hooks/useRefreshToken';
import useAuth from '../hooks/useAuth';
import axios from "../api/axios";

const Login = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState(false);
    const refresh = useRefreshToken();
    const { auth, setAuth } = useAuth();
    const initDataRaw = useSignal(initData.raw);
    const lp = useLaunchParams();

    useEffect(() => {
        let isMounted = true;

        const authenticateWithInitData = async () => {
            try {
                if (!initDataRaw) {
                    console.warn("InitData is not available");
                    if (isMounted) {
                        setAuthError(true);
                        setIsLoading(false);
                    }
                    return false;
                }

                const response = await axios.post(
                    "/auth/initdata",
                    { initData: initDataRaw },
                    {
                        headers: { "Content-Type": "application/json" },
                        withCredentials: true,
                    }
                );

                const accessToken = response?.data?.accessToken;
                
                if (accessToken && isMounted) {
                    setAuth({ accessToken });
                    setAuthError(false);
                    return true;
                } else if (isMounted) {
                    setAuthError(true);
                    return false;
                }
                return false;
            } catch (error) {
                console.error("Authentication with initData error:", error);
                if (isMounted) {
                    setAuthError(true);
                }
                return false;
            }
        };

        const verifyRefreshToken = async () => {
            try {
                await refresh();
                if (isMounted) {
                    setAuthError(false);
                }
            }
            catch (err) {
                console.error("Refresh token error:", err);
                // If refresh fails, try login with initData
                await authenticateWithInitData();
            }
            finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        // If no accessToken, try refresh first, then login with initData if refresh fails
        if (!auth?.accessToken) {
            verifyRefreshToken();
        } else {
            setIsLoading(false);
            setAuthError(false);
        }

        return () => { isMounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        console.log(`isLoading: ${isLoading}`)
        console.log(`aT: ${JSON.stringify(auth?.accessToken)}`)
    }, [isLoading])

    // Show error screen if authentication failed
    if (authError && !isLoading) {
        return (
            <AppRoot
                appearance="light"
                platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
            >
                <Placeholder
                    header="Authentication Failed"
                    description="Unable to authenticate. Please try again later."
                />
            </AppRoot>
        );
    }

    return (
        <>
            {isLoading
                ? <p>Loading...</p>
                : <Outlet />
            }
        </>
    )
}

export default Login

