import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState('');
  const [visible, setVisible] = useState(false);
  let timer = null;

  const showToast = useCallback((message) => {
    setMsg(message);
    setVisible(true);
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { setVisible(false); setMsg(''); }, 2200);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div id="toast" className={visible ? 'show' : ''}>{msg}</div>
    </ToastContext.Provider>
  );
}
