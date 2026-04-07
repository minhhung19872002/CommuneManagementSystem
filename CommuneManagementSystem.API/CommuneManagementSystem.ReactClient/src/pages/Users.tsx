import React, { useEffect, useState, useCallback } from 'react';
import { userService } from '../services/userService';
import { AppUser } from '../types';

const Users: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', fullName: '', role: 'NhanKhau' });
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const toast_ = useCallback((msg: string, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await userService.getAll(); setUsers(r.data); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    try {
      await userService.create(form);
      toast_('Thêm người dùng thành công!'); setShowModal(false);
      setForm({ username: '', password: '', fullName: '', role: 'NhanKhau' }); load();
    } catch { toast_('Lỗi!', 'error'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa người dùng?')) return;
    try { await userService.delete(id); toast_('Xóa thành công!'); load(); } catch { toast_('Lỗi!', 'error'); }
  };

  const handleToggleStatus = async (u: AppUser) => {
    try {
      await userService.update(u.id, { status: u.status === 'Active' ? 'Inactive' : 'Active' });
      toast_(`Đã ${u.status === 'Active' ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản!`);
      load();
    } catch { toast_('Lỗi!', 'error'); }
  };

  const roleLabel = (r: string) => r === 'Admin' ? 'Quản trị' : r === 'NhanKhau' ? 'Cán bộ NK' : 'Cán bộ HK';
  const roleColor = (r: string) => r === 'Admin' ? '#6a1b9a' : r === 'NhanKhau' ? '#1565c0' : '#00695c';

  return (
    <>
      <div className="topbar">
        <h1>⚙️ Quản lý Người dùng</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Thêm người dùng</button>
      </div>
      <div className="content">
        {toast && <div className="toast-container"><div className={`toast toast-${toast.type}`}>{toast.msg}</div></div>}
        <div className="card">
          <div className="card-body">
            {loading ? <div className="loading">Đang tải...</div> : (
              <table className="data-table">
                <thead><tr><th>Tài khoản</th><th>Họ tên</th><th>Vai trò</th><th>Ngày tạo</th><th>Đăng nhập cuối</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.username}</td>
                      <td>{u.fullName}</td>
                      <td><span style={{ color: roleColor(u.role), fontWeight: 600 }}>{roleLabel(u.role)}</span></td>
                      <td>{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('vi-VN') : '—'}</td>
                      <td><span className={`badge ${u.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>{u.status === 'Active' ? 'Hoạt động' : 'Khóa'}</span></td>
                      <td>
                        <div className="action-cell">
                          <button className="btn btn-sm btn-outline" onClick={() => handleToggleStatus(u)}>{u.status === 'Active' ? '🔒 Khóa' : '🔓 Mở'}</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id)}>🗑️</button>
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
            <div className="modal-header"><h3>Thêm người dùng mới</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
            <div className="modal-body">
              <div className="form-group"><label>Tài khoản</label><input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} /></div>
              <div className="form-group"><label>Mật khẩu</label><input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
              <div className="form-group"><label>Họ tên</label><input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} /></div>
              <div className="form-group"><label>Vai trò</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="Admin">Quản trị viên</option>
                  <option value="NhanKhau">Cán bộ nhân khẩu</option>
                  <option value="HoKhau">Cán bộ hộ khẩu</option>
                </select>
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-outline" onClick={() => setShowModal(false)}>Hủy</button><button className="btn btn-primary" onClick={handleCreate}>Thêm mới</button></div>
          </div>
        </div>
      )}
    </>
  );
};

export default Users;
