export default function AnalyticsDashboard() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Web Analytics Dashboard</h2>
      </div>

        <iframe 
          width="100%" 
          height="800" 
          src="https://datastudio.google.com/embed/reporting/1bb8f467-6c19-47f8-bfb5-69031e18e4ea/page/jYX4F" 
          frameBorder="0" 
          style={{ border: 0, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
          allowFullScreen 
          sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        ></iframe>
      
    </div>
  );
}
