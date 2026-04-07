import React, { useEffect, useState, useCallback } from 'react';
import { tempResidenceService } from '../services/reportService';
import { personService } from '../services/personService';
import { TempResidence, Person } from '../types';

const TemporaryResidence: React.FC = () => {
  const [data, setData] = useState<TempResidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [persons, setPersons] = useState<Person[]>([]);
  const [form, setForm] = useState({ personId: '', address: '', startDate: '', endDate: '', reason: '' });
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const toast_ = useCallback((msg: string, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await tempResidenceService.getAll(); setData(r.data); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    personService.getAll('Alive').then(r => setPersons(r.data)).catch(console.error);
  }, []);

  const handleCreate = async () => {
    try {
      await tempResidenceService.create({ personId: Number(form.personId), address: form.address, startDate: form.startDate, endDate: form.endDate, reason: form.reason });
      toast_('Đăng ký tạm trú thành công!'); setShowModal(false); setForm({ personId: '', address: '', startDate: '', endDate: '', reason: '' }); load();
    } catch { toast_('Lỗi!', 'error'); }
  };

  const handleExtend = async (id: number) => {
    const newDate = prompt('Nhập ngày gia hạn mới (YYYY-MM-DD):');
    if (!newDate) return;
    try { await tempResidenceService.extend(id, newDate); toast_('Gia hạn thành công!'); load(); } catch { toast_('Lỗi!', 'error'); }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Hủy đăng ký tạm trú?')) return;
    try { await tempResidenceService.delete(id); toast_('Hủy thành công!'); load(); } catch { toast_('Lỗi!', 'error'); }
  };

  const getBadge = (s: string) => {
    const map: Record<string, string> = { Active: 'badge-active', Expired: 'badge-expired', Cancelled: 'badge-cancelled' };
    const label: Record<string, string> = { Active: 'Đang tạm trú', Expired: 'Hết hạn', Cancelled: 'Đã hủy' };
    return <span className={`badge ${map[s] || ''}`}>{label[s] || s}</span>;
  };

  return (
    <>
      <div className="topbar">
        <h1>🏠 Quản lý Tạm trú</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Đăng ký tạm trú</button>
      </div>
      <div className="content">
        {toast && <div className="toast-container"><div className={`toast toast-${toast.type}`}>{toast.msg}</div></div>}
        <div className="card">
          <div className="card-body">
            {loading ? <div className="loading">Đang tải...</div> : (
              <table className="data-table">
                <thead><tr><th>#</th><th>Người</th><th>Địa chỉ</th><th>Từ ngày</th><th>Đến ngày</th><th>Lý do</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {data.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>Không có dữ liệu</td></tr>
                    : data.map((r, i) => (
                      <tr key={r.id}>
                        <td>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{r.personName || '—'}</td>
                        <td>{r.address}</td>
                        <td>{new Date(r.startDate).toLocaleDateString('vi-VN')}</td>
                        <td>{new Date(r.endDate).toLocaleDateString('vi-VN')}</td>
                        <td>{r.reason}</td>
                        <td>{getBadge(r.status)}</td>
                        <td>
                          <div className="action-cell">
                            {r.status === 'Active' && <><button className="btn btn-sm btn-outline" onClick={() => handleExtend(r.id)}>⏰ Gia hạn</button><button className="btn btn-sm btn-danger" onClick={() => handleCancel(r.id)}>❌ Hủy</button></>}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Đăng ký tạm trú</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <div className="modal-body">
              <div className="form-group"><label>Người tạm trú</label>
                <select value={form.personId} onChange={e => setForm(f => ({ ...f, personId: e.target.value }))}>
                  <option value="">— Chọn nhân khẩu —</option>
                  {persons.map(p => <option key={p.id} value={p.id}>{p.fullName} ({p.nationalId || 'chưa có CCCD'})</option>)}
                </select>
              </div>
              <div className="form-group"><label>Địa chỉ tạm trú</label><input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
              <div className="form-row"><div className="form-group"><label>Từ ngày</label><input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
                <div className="form-group"><label>Đến ngày</label><input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div></div>
              <div className="form-group"><label>Lý do</label><input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} /></div>
            </div>
            <div className="modal-footer"><button className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button><button className="btn btn-primary" onClick={handleCreate}>Đăng ký</button></div>
          </div>
        </div>
      )}
    </>
  );
};

export default TemporaryResidence;
