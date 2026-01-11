import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { initData, useSignal, useLaunchParams } from "@tma.js/sdk-react";
import { Placeholder, AppRoot } from '@telegram-apps/telegram-ui';
import useAuth from '../hooks/useAuth';

const Login = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState(false);
    const { auth, setAuth } = useAuth();
    const initDataRaw = useSignal(initData.raw);
    const lp = useLaunchParams();

    useEffect(() => {
        if (!initDataRaw) {
            console.warn("InitData is not available");
            setAuthError(true);
            setIsLoading(false);
            return;
        }

        // Store initData in auth context
        setAuth({ initData: initDataRaw });
        setAuthError(false);
        setIsLoading(false);
    }, [initDataRaw, setAuth]);

    // Show error screen if initData is not available
    if (authError && !isLoading) {
        return (
            <AppRoot
                appearance="light"
                platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
            >
                <Placeholder
                    header="Authentication Failed"
                    description="Unable to authenticate. InitData is not available."
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

