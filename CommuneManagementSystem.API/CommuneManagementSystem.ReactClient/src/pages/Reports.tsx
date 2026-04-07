import React, { useEffect, useState } from 'react';
import { reportService } from '../services/reportService';
import { PopulationStats } from '../types';

const Reports: React.FC = () => {
  const [stats, setStats] = useState<PopulationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('households');
  const [reportData, setReportData] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    reportService.getStatistics().then(r => { setStats(r.data); setLoading(false); }).catch(console.error);
  }, []);

  const loadReport = (type: string) => {
    setReportLoading(true);
    setReportType(type);
    let promise: Promise<any>;
    switch (type) {
      case 'households': promise = reportService.exportHouseholds(); break;
      case 'population': promise = reportService.exportPopulation(); break;
      case 'temp-residence': promise = reportService.exportTempResidence(); break;
      case 'temp-absence': promise = reportService.exportTempAbsence(); break;
      default: promise = Promise.resolve({ data: null });
    }
    promise.then(r => { setReportData(r.data); setReportLoading(false); }).catch(() => { setReportLoading(false); });
  };

  const exportJson = () => {
    if (!reportData) return;
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = reportType + '-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div>
        <div className="topbar"><h1>Reports</h1></div>
        <div className="content"><div className="loading">Loading...</div></div>
      </div>
    );
  }

  return (
    <div>
      <div className="topbar">
        <h1>Reports and Statistics</h1>
        <button className="btn btn-primary" onClick={exportJson} disabled={!reportData}>Export JSON</button>
      </div>
      <div className="content">
        {stats && (
          <div className="stats-grid" style={{ marginBottom: '20px' }}>
            <div className="stat-card"><div className="label">Total Population</div><div className="value">{stats.totalPopulation}</div></div>
            <div className="stat-card"><div className="label">Households</div><div className="value">{stats.totalHouseholds}</div></div>
            <div className="stat-card"><div className="label">Temp Residence</div><div className="value">{stats.tempResidentCount}</div></div>
            <div className="stat-card"><div className="label">Temp Absence</div><div className="value">{stats.tempAbsentCount}</div></div>
          </div>
        )}

        <div className="tabs">
          <button className={'tab-btn ' + (reportType === 'households' ? 'active' : '')} onClick={() => loadReport('households')}>Household List</button>
          <button className={'tab-btn ' + (reportType === 'population' ? 'active' : '')} onClick={() => loadReport('population')}>Population List</button>
          <button className={'tab-btn ' + (reportType === 'temp-residence' ? 'active' : '')} onClick={() => loadReport('temp-residence')}>Temp Residence</button>
          <button className={'tab-btn ' + (reportType === 'temp-absence' ? 'active' : '')} onClick={() => loadReport('temp-absence')}>Temp Absence</button>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>{reportData ? reportData.title : 'Select report type'}</h2>
          </div>
          <div className="card-body">
            {reportLoading && <div className="loading">Loading...</div>}
            {!reportLoading && !reportData && <div className="empty-state"><p>Select a report type</p></div>}
            {!reportLoading && reportData && (
              <table className="data-table">
                <thead>
                  <tr>
                    {Object.keys(reportData.data && reportData.data[0] ? reportData.data[0] : {}).map((k: string) => (
                      <th key={k}>{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.data && reportData.data.map((row: any, i: number) => (
                    <tr key={i}>
                      {Object.values(row).map((v: any, j: number) => (
                        <td key={j}>{String(v ?? '-')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
