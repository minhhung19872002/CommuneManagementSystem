import React, { useEffect, useState, useCallback } from 'react';
import { personService } from '../services/personService';
import { householdService } from '../services/householdService';
import { Person, Household } from '../types';

const Persons: React.FC = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<Person | null>(null);
  const [showBirth, setShowBirth] = useState(false);
  const [showDeath, setShowDeath] = useState(false);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [form, setForm] = useState<Record<string, any>>({});
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
      const res = await personService.getAll(search || undefined, statusFilter || undefined);
      setPersons(res.data);
    } finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    householdService.getAll().then(r => setHouseholds(r.data)).catch(console.error);
  }, []);

  const emptyForm = () => ({ fullName: '', dateOfBirth: '', gender: 'Nam', nationalId: '', nationalIdIssuedAt: '', nationalIdIssuedDate: '', ethnicity: 'Kinh', religion: 'Không', educationLevel: '', occupation: '', householdId: '', relationshipToHead: '' });

  const openCreate = () => { setForm(emptyForm()); setFormMode('create'); setEditingId(null); setShowModal(true); };
  const openEdit = (p: Person) => {
    setForm({ fullName: p.fullName, dateOfBirth: p.dateOfBirth.split('T')[0], gender: p.gender, nationalId: p.nationalId, nationalIdIssuedAt: p.nationalIdIssuedAt || '', nationalIdIssuedDate: p.nationalIdIssuedDate ? p.nationalIdIssuedDate.split('T')[0] : '', ethnicity: p.ethnicity, religion: p.religion, educationLevel: p.educationLevel, occupation: p.occupation, householdId: p.householdId ? String(p.householdId) : '', relationshipToHead: p.relationshipToHead });
    setFormMode('edit'); setEditingId(p.id); setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload: any = { ...form, householdId: form.householdId ? Number(form.householdId) : null, dateOfBirth: form.dateOfBirth, nationalIdIssuedDate: form.nationalIdIssuedDate || null };
      if (formMode === 'create') { await personService.create(payload); toast_('Thêm nhân khẩu thành công!'); }
      else { await personService.update(editingId!, payload); toast_('Cập nhật thành công!'); }
      setShowModal(false); load();
    } catch { toast_('Có lỗi xảy ra!', 'error'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa nhân khẩu này?')) return;
    try { await personService.delete(id); toast_('Xóa thành công!'); load(); } catch { toast_('Xóa thất bại!', 'error'); }
  };

  const handleBirth = async () => {
    try { await personService.registerBirth(form); toast_('Đăng ký khai sinh thành công!'); setShowBirth(false); setForm(emptyForm()); load(); } catch { toast_('Lỗi!', 'error'); }
  };

  const handleDeath = async () => {
    try { await personService.registerDeath(form); toast_('Đăng ký khai tử thành công!'); setShowDeath(false); setForm(emptyForm()); load(); } catch { toast_('Lỗi!', 'error'); }
  };

  const getBadge = (s: string) => {
    const map: Record<string, string> = { Alive: 'badge-active', Dead: 'badge-dead', Moved: 'badge-moved', Deleted: 'badge-inactive' };
    const label: Record<string, string> = { Alive: 'Đang sống', Dead: 'Đã mất', Moved: 'Đã chuyển', Deleted: 'Đã xóa' };
    return <span className={`badge ${map[s] || 'badge-inactive'}`}>{label[s] || s}</span>;
  };

  return (
    <>
      <div className="topbar">
        <h1>👤 Quản lý Nhân khẩu</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-accent" onClick={() => { setForm({ fullName: '', dateOfBirth: '', gender: 'Nam', birthPlace: '', fatherId: '', motherId: '' }); setShowBirth(true); }}>🍼 Khai sinh</button>
          <button className="btn btn-danger" onClick={() => { setForm({ fullName: '', dateOfDeath: '', reason: '', placeOfDeath: '', personId: '' }); setShowDeath(true); }}>⚰️ Khai tử</button>
          <button className="btn btn-primary" onClick={openCreate}>+ Thêm nhân khẩu</button>
        </div>
      </div>
      <div className="content">
        {toast && <div className="toast-container"><div className={`toast toast-${toast.type}`}>{toast.msg}</div></div>}

        <div className="card">
          <div className="toolbar">
            <input className="search-input" placeholder="🔍 Tìm tên, CCCD..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="Alive">Đang sống</option>
              <option value="Dead">Đã mất</option>
              <option value="Moved">Đã chuyển</option>
            </select>
            <button className="btn btn-outline" onClick={load}>🔄 Làm mới</button>
          </div>
          <div className="card-body">
            {loading ? <div className="loading">Đang tải...</div> : (
              <table className="data-table">
                <thead><tr><th>Họ tên</th><th>Ngày sinh</th><th>Giới tính</th><th>CCCD</th><th>Dân tộc</th><th>Nghề nghiệp</th><th>Hộ khẩu</th><th>TT</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {persons.length === 0 ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: '32px' }}>Không có dữ liệu</td></tr>
                    : persons.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.fullName}</td>
                        <td>{new Date(p.dateOfBirth).toLocaleDateString('vi-VN')}</td>
                        <td>{p.gender}</td>
                        <td>{p.nationalId || '—'}</td>
                        <td>{p.ethnicity}</td>
                        <td>{p.occupation}</td>
                        <td>{p.householdNumber || '—'}</td>
                        <td>{getBadge(p.status)}</td>
                        <td>
                          <div className="action-cell">
                            <button className="btn btn-sm btn-outline" onClick={() => setShowDetail(p)}>👁️</button>
                            <button className="btn btn-sm btn-outline" onClick={() => openEdit(p)}>✏️</button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>🗑️</button>
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

      {/* CREATE / EDIT */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>{formMode === 'create' ? 'Thêm nhân khẩu' : 'Sửa nhân khẩu'}</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <div className="modal-body">
              <div className="form-row"><div className="form-group"><label>Họ tên</label><input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} /></div>
                <div className="form-group"><label>Ngày sinh</label><input type="date" value={form.dateOfBirth} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} /></div></div>
              <div className="form-row"><div className="form-group"><label>Giới tính</label><select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}><option>Nam</option><option>Nữ</option></select></div>
                <div className="form-group"><label>CCCD</label><input value={form.nationalId} onChange={e => setForm(f => ({ ...f, nationalId: e.target.value }))} /></div></div>
              <div className="form-row"><div className="form-group"><label>Nơi cấp CCCD</label><input value={form.nationalIdIssuedAt} onChange={e => setForm(f => ({ ...f, nationalIdIssuedAt: e.target.value }))} /></div>
                <div className="form-group"><label>Ngày cấp CCCD</label><input type="date" value={form.nationalIdIssuedDate} onChange={e => setForm(f => ({ ...f, nationalIdIssuedDate: e.target.value }))} /></div></div>
              <div className="form-row"><div className="form-group"><label>Dân tộc</label><input value={form.ethnicity} onChange={e => setForm(f => ({ ...f, ethnicity: e.target.value }))} /></div>
                <div className="form-group"><label>Tôn giáo</label><input value={form.religion} onChange={e => setForm(f => ({ ...f, religion: e.target.value }))} /></div></div>
              <div className="form-row"><div className="form-group"><label>Trình độ học vấn</label><input value={form.educationLevel} onChange={e => setForm(f => ({ ...f, educationLevel: e.target.value }))} placeholder="VD: 12/12" /></div>
                <div className="form-group"><label>Nghề nghiệp</label><input value={form.occupation} onChange={e => setForm(f => ({ ...f, occupation: e.target.value }))} /></div></div>
              <div className="form-row"><div className="form-group"><label>Hộ khẩu</label><select value={form.householdId} onChange={e => setForm(f => ({ ...f, householdId: e.target.value }))}><option value="">— Chưa có —</option>{households.map(h => <option key={h.id} value={h.id}>{h.householdNumber} - {h.address}</option>)}</select></div>
                <div className="form-group"><label>Quan hệ chủ hộ</label><input value={form.relationshipToHead} onChange={e => setForm(f => ({ ...f, relationshipToHead: e.target.value }))} placeholder="VD: Vợ, Con..." /></div></div>
            </div>
            <div className="modal-footer"><button className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button><button className="btn btn-primary" onClick={handleSave}>{formMode === 'create' ? 'Thêm mới' : 'Lưu'}</button></div>
          </div>
        </div>
      )}

      {/* DETAIL */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Chi tiết nhân khẩu: {showDetail.fullName}</h3><button className="modal-close" onClick={() => setShowDetail(null)}>×</button></div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item"><label>Họ tên</label><span>{showDetail.fullName}</span></div>
                <div className="detail-item"><label>Trạng thái</label><span>{getBadge(showDetail.status)}</span></div>
                <div className="detail-item"><label>Ngày sinh</label><span>{new Date(showDetail.dateOfBirth).toLocaleDateString('vi-VN')}</span></div>
                <div className="detail-item"><label>Giới tính</label><span>{showDetail.gender}</span></div>
                <div className="detail-item"><label>CCCD</label><span>{showDetail.nationalId || '—'}</span></div>
                <div className="detail-item"><label>Nơi cấp</label><span>{showDetail.nationalIdIssuedAt || '—'}</span></div>
                <div className="detail-item"><label>Dân tộc</label><span>{showDetail.ethnicity}</span></div>
                <div className="detail-item"><label>Tôn giáo</label><span>{showDetail.religion}</span></div>
                <div className="detail-item"><label>Học vấn</label><span>{showDetail.educationLevel || '—'}</span></div>
                <div className="detail-item"><label>Nghề nghiệp</label><span>{showDetail.occupation || '—'}</span></div>
                <div className="detail-item"><label>Hộ khẩu</label><span>{showDetail.householdNumber || 'Chưa có'}</span></div>
                <div className="detail-item"><label>Quan hệ</label><span>{showDetail.relationshipToHead || '—'}</span></div>
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-outline" onClick={() => setShowDetail(null)}>Đóng</button></div>
          </div>
        </div>
      )}

      {/* BIRTH */}
      {showBirth && (
        <div className="modal-overlay" onClick={() => setShowBirth(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>🍼 Đăng ký khai sinh</h3><button className="modal-close" onClick={() => setShowBirth(false)}>×</button></div>
            <div className="modal-body">
              <div className="form-row"><div className="form-group"><label>Họ tên trẻ</label><input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} /></div>
                <div className="form-group"><label>Ngày sinh</label><input type="date" value={form.dateOfBirth} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} /></div></div>
              <div className="form-row"><div className="form-group"><label>Giới tính</label><select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}><option>Nam</option><option>Nữ</option></select></div>
                <div className="form-group"><label>Nơi sinh</label><input value={form.birthPlace} onChange={e => setForm(f => ({ ...f, birthPlace: e.target.value }))} /></div></div>
              <div className="form-row"><div className="form-group"><label>CCCD mẹ</label><input value={form.motherId} onChange={e => setForm(f => ({ ...f, motherId: e.target.value }))} placeholder="ID người mẹ" /></div>
                <div className="form-group"><label>CCCD cha</label><input value={form.fatherId} onChange={e => setForm(f => ({ ...f, fatherId: e.target.value }))} placeholder="ID người cha" /></div></div>
            </div>
            <div className="modal-footer"><button className="btn btn-outline" onClick={() => setShowBirth(false)}>Hủy</button><button className="btn btn-accent" onClick={handleBirth}>Đăng ký</button></div>
          </div>
        </div>
      )}

      {/* DEATH */}
      {showDeath && (
        <div className="modal-overlay" onClick={() => setShowDeath(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>⚰️ Đăng ký khai tử</h3><button className="modal-close" onClick={() => setShowDeath(false)}>×</button></div>
            <div className="modal-body">
              <div className="form-row"><div className="form-group"><label>Họ tên</label><input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} /></div>
                <div className="form-group"><label>ID nhân khẩu</label><input type="number" value={form.personId} onChange={e => setForm(f => ({ ...f, personId: e.target.value }))} placeholder="ID người mất" /></div></div>
              <div className="form-row"><div className="form-group"><label>Ngày mất</label><input type="date" value={form.dateOfDeath} onChange={e => setForm(f => ({ ...f, dateOfDeath: e.target.value }))} /></div>
                <div className="form-group"><label>Nơi mất</label><input value={form.placeOfDeath} onChange={e => setForm(f => ({ ...f, placeOfDeath: e.target.value }))} /></div></div>
              <div className="form-group"><label>Nguyên nhân</label><input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} /></div>
            </div>
            <div className="modal-footer"><button className="btn btn-outline" onClick={() => setShowDeath(false)}>Hủy</button><button className="btn btn-danger" onClick={handleDeath}>Xác nhận</button></div>
          </div>
        </div>
      )}
    </>
  );
};

export default Persons;
