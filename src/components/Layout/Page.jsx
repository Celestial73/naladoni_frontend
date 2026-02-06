import { useNavigate } from 'react-router-dom';
import { backButton } from '@tma.js/sdk-react';
import { useEffect } from 'react';

export function Page({ children, back = true }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (back) {
      backButton.show();
      return backButton.onClick(() => {
        navigate(-1);
      });
    }
    backButton.hide();
  }, [back, navigate]);

  return <>{children}</>;
}
