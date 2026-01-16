import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { initData, useSignal, useLaunchParams } from "@tma.js/sdk-react";
import { Placeholder, AppRoot } from '@telegram-apps/telegram-ui';
import useAuth from '../hooks/useAuth';
import useAxios from '../hooks/useAxios';

const Login = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState(false);
    const { auth, setAuth } = useAuth();
    const initDataRaw = useSignal(initData.raw);
    const lp = useLaunchParams();
    const axios = useAxios();

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
                    return;
                }

                const response = await axios.post(
                    "/auth/login-telegram",
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${initDataRaw}`
                        }
                    }
                );

                // If response is successful, store initData and all backend response data in auth context
                if (response?.status === 200 || response?.status === 201) {
                    if (isMounted) {
                        setAuth({ 
                            initData: initDataRaw,
                            ...response.data // Store all data returned by backend
                        });
                        setAuthError(false);
                        setIsLoading(false);
                    }
                } else {
                    if (isMounted) {
                        setAuthError(true);
                        setIsLoading(false);
                    }
                }
            } catch (error) {
                console.error("Authentication error:", error);
                if (isMounted) {
                    setAuthError(true);
                    setIsLoading(false);
                }
            }
        };

        // Only authenticate if we don't already have initData in context
        if (!auth?.initData) {
            authenticateWithInitData();
        } else {
            setIsLoading(false);
            setAuthError(false);
        }


        return () => { isMounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initDataRaw]);

    // Show error screen if initData is not available
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

