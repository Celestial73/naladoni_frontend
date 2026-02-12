import { Page } from '@/components/Layout/Page.jsx';
import { HalftoneBackground } from '@/components/HalftoneBackground.jsx';

export function LoadingPage({ text = 'Загрузка...' }) {
    return (
        <Page>
            <div style={{
                backgroundColor: '#888',
                minHeight: '100vh',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
            }}>
                <HalftoneBackground color="#666" />
                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    color: '#fff',
                    textAlign: 'center',
                    fontSize: '1.2em',
                    fontWeight: '700',
                    fontFamily: "'Uni Sans', sans-serif",
                    fontStyle: 'italic'
                }}>
                    {text}
                </div>
            </div>
        </Page>
    );
}

