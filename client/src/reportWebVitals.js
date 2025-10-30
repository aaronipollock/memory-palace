const reportWebVitals = onPerfEntry => {
  // Web vitals reporting is disabled by default for privacy
  // No performance data is sent externally
  // To enable, pass a function: reportWebVitals(console.log)
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
