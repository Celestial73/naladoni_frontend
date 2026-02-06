import { Outlet } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { initData, useSignal, useLaunchParams } from "@tma.js/sdk-react";
import { Placeholder, AppRoot, List } from '@telegram-apps/telegram-ui';
import useAuth from '@/hooks/useAuth';
import { authService } from '@/services/api/authService.js';
import { DisplayData } from '@/components/DisplayData/DisplayData.jsx';
import { Page } from '@/components/Layout/Page.jsx';

const Login = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState(false);
    const { auth, setAuth } = useAuth();
    const initDataRaw = useSignal(initData.raw);
    const initDataState = useSignal(initData.state);
    const lp = useLaunchParams();

    const initDataRows = useMemo(() => {
        if (!initDataState || !initDataRaw) {
            return;
        }
        return [
            { title: 'raw', value: initDataRaw },
            ...Object.entries(initDataState).reduce((acc, [title, value]) => {
                if (value instanceof Date) {
                    acc.push({ title, value: value.toISOString() });
                } else if (!value || typeof value !== 'object') {
                    acc.push({ title, value });
                }
                return acc;
            }, []),
        ];
    }, [initDataState, initDataRaw]);

    useEffect(() => {
        let isMounted = true;
        const abortController = new AbortController();

        const authenticateWithInitData = async () => {
            try {
                if (!initDataRaw) {
                    if (isMounted) {
                        setAuthError(true);
                        setIsLoading(false);
                    }
                    return;
                }

                const authData = await authService.loginWithTelegram(initDataRaw, abortController.signal);

                // If response is successful, store initData and all backend response data in auth context
                if (isMounted) {
                    setAuth(authData);
                    setAuthError(false);
                    setIsLoading(false);
                }
            } catch {
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


        return () => {
            isMounted = false;
            abortController.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initDataRaw]);

    // Show error screen if initData is not available
    if (authError && !isLoading) {
        return (
            <AppRoot
                appearance="light"
                platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
            >
                <Page>
                    <Placeholder
                        header="Authentication Failed"
                        description="Unable to authenticate. Please try again later."
                    />
                    {initDataRows && (
                        <List>
                            <DisplayData rows={initDataRows} />
                        </List>
                    )}
                </Page>
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

