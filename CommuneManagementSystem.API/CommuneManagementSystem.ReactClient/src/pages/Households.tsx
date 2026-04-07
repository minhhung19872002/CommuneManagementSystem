import React, { useEffect, useState, useCallback } from 'react';
import { householdService } from '../services/householdService';
import { personService } from '../services/personService';
import { Household, Person } from '../types';

const Households: React.FC = () => {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<Household | null>(null);
  const [members, setMembers] = useState<Person[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [form, setForm] = useState({ householdNumber: '', address: '', headPersonId: '' });
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const toast_ = useCallback((msg: string, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await householdService.getAll(search || undefined, statusFilter || undefined);
      setHouseholds(res.data);
    } finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    personService.getAll().then(r => setPersons(r.data)).catch(console.error);
  }, []);

  const openCreate = () => { setForm({ householdNumber: '', address: '', headPersonId: '' }); setFormMode('create'); setEditingId(null); setShowModal(true); };
  const openEdit = (h: Household) => {
    setForm({ householdNumber: h.householdNumber, address: h.address, headPersonId: String(h.headPersonId ?? '') });
    setFormMode('edit'); setEditingId(h.id); setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (formMode === 'create') {
        await householdService.create({ householdNumber: form.householdNumber, address: form.address, headPersonId: Number(form.headPersonId) });
        toast_('Thêm hộ khẩu thành công!');
      } else {
        await householdService.update(editingId!, { address: form.address, headPersonId: Number(form.headPersonId) });
        toast_('Cập nhật hộ khẩu thành công!');
      }
      setShowModal(false);
      load();
    } catch { toast_('Có lỗi xảy ra!', 'error'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa hộ khẩu này?')) return;
    try { await householdService.delete(id); toast_('Xóa thành công!'); load(); } catch { toast_('Xóa thất bại!', 'error'); }
  };

  const openDetail = async (h: Household) => {
    setShowDetail(h);
    try { const res = await householdService.getMembers(h.id); setMembers(res.data); } catch { setMembers([]); }
  };

  const getBadge = (s: string) => {
    const map: Record<string, string> = { Active: 'badge-active', Moved: 'badge-moved', Deleted: 'badge-inactive' };
    const label: Record<string, string> = { Active: 'Hoạt động', Moved: 'Đã chuyển', Deleted: 'Đã xóa' };
    return <span className={`badge ${map[s] || 'badge-inactive'}`}>{label[s] || s}</span>;
  };

  return (
    <>
      <div className="topbar">
        <h1>📋 Quản lý Hộ khẩu</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Thêm hộ khẩu</button>
      </div>
      <div className="content">
        {toast && <div className="toast-container"><div className={`toast toast-${toast.type}`}>{toast.msg}</div></div>}

        <div className="card">
          <div className="toolbar">
            <input className="search-input" placeholder="🔍 Tìm số hộ, địa chỉ..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="Active">Hoạt động</option>
              <option value="Moved">Đã chuyển</option>
            </select>
            <button className="btn btn-outline" onClick={load}>🔄 Làm mới</button>
          </div>
          <div className="card-body">
            {loading ? <div className="loading">Đang tải...</div> : (
              <table className="data-table">
                <thead>
                  <tr><th>Số HK</th><th>Địa chỉ</th><th>Chủ hộ</th><th>Thành viên</th><th>Trạng thái</th><th>Thao tác</th></tr>
                </thead>
                <tbody>
                  {households.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Không có dữ liệu</td></tr>
                    : households.map(h => (
                      <tr key={h.id}>
                        <td style={{ fontWeight: 600 }}>{h.householdNumber}</td>
                        <td>{h.address}</td>
                        <td>{h.headPersonName || '—'}</td>
                        <td><span className="badge badge-active">{h.memberCount} người</span></td>
                        <td>{getBadge(h.status)}</td>
                        <td>
                          <div className="action-cell">
                            <button className="btn btn-sm btn-outline" onClick={() => openDetail(h)}>👁️</button>
                            <button className="btn btn-sm btn-outline" onClick={() => openEdit(h)}>✏️</button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(h.id)}>🗑️</button>
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

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>{formMode === 'create' ? 'Thêm hộ khẩu mới' : 'Sửa hộ khẩu'}</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <div className="modal-body">
              <div className="form-group"><label>Số hộ khẩu</label><input value={form.householdNumber} onChange={e => setForm(f => ({ ...f, householdNumber: e.target.value }))} placeholder="VD: HK-004" disabled={formMode === 'edit'} /></div>
              <div className="form-group"><label>Địa chỉ thường trú</label><input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Thôn, Xã..." /></div>
              <div className="form-group"><label>Chủ hộ</label>
                <select value={form.headPersonId} onChange={e => setForm(f => ({ ...f, headPersonId: e.target.value }))}>
                  <option value="">— Chọn nhân khẩu —</option>
                  {persons.map(p => <option key={p.id} value={p.id}>{p.fullName} ({p.nationalId})</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave}>{formMode === 'create' ? 'Thêm mới' : 'Lưu'}</button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal" style={{ width: '700px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Chi tiết hộ khẩu: {showDetail.householdNumber}</h3><button className="modal-close" onClick={() => setShowDetail(null)}>×</button></div>
            <div className="modal-body">
              <div className="detail-section">
                <div className="detail-grid">
                  <div className="detail-item"><label>Số hộ khẩu</label><span>{showDetail.householdNumber}</span></div>
                  <div className="detail-item"><label>Chủ hộ</label><span>{showDetail.headPersonName || '—'}</span></div>
                  <div className="detail-item"><label>Địa chỉ</label><span>{showDetail.address}</span></div>
                  <div className="detail-item"><label>Trạng thái</label><span>{getBadge(showDetail.status)}</span></div>
                  {showDetail.movedTo && <div className="detail-item"><label>Chuyển đến</label><span>{showDetail.movedTo}</span></div>}
                </div>
              </div>
              <div className="detail-section">
                <h4>👥 Danh sách thành viên ({members.length})</h4>
                <table className="data-table">
                  <thead><tr><th>Họ tên</th><th>Ngày sinh</th><th>Giới tính</th><th>Quan hệ</th><th>CCCD</th><th>Nghề nghiệp</th></tr></thead>
                  <tbody>
                    {members.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center' }}>Chưa có thành viên</td></tr>
                      : members.map(m => <tr key={m.id}><td>{m.fullName}</td><td>{new Date(m.dateOfBirth).toLocaleDateString('vi-VN')}</td><td>{m.gender}</td><td>{m.relationshipToHead}</td><td>{m.nationalId}</td><td>{m.occupation}</td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-outline" onClick={() => setShowDetail(null)}>Đóng</button></div>
          </div>
        </div>
      )}
    </>
  );
};

export default Households;
