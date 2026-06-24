import { createContext, useContext, useState, useCallback } from 'react';

const AnalysisContext = createContext();

export function useAnalysis() {
  return useContext(AnalysisContext);
}

export function AnalysisProvider({ children }) {
  const [filingData, setFilingData] = useState(null);
  const [dcfData, setDcfData] = useState(null);

  const setFiling = useCallback((data) => setFilingData(data), []);
  const setDCF = useCallback((data) => setDcfData(data), []);

  return (
    <AnalysisContext.Provider value={{ filingData, setFiling, dcfData, setDCF }}>
      {children}
    </AnalysisContext.Provider>
  );
}
