import { test } from './support/commands';

/**
 * Simulates a logged-in session by:
 * 1. Injecting mock auth tokens into localStorage (matching what the mock backend returns)
 * 2. Mocking all API endpoints so pages load without needing real backend auth
 */
export async function loginAsDemo(page: import('@playwright/test').Page) {
  // 1. Navigate to /login first (needed for localStorage access)
  await page.goto('/login', { waitUntil: 'domcontentloaded' });

  // 2. Clear any stale auth data
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // 3. Wait for login page to fully render
  const loginPage = page.getByTestId('login-page');
  await loginPage.waitFor({ state: 'visible', timeout: 15_000 });

  // 4. Fill demo admin credentials
  await page.getByTestId('demo-account-admin').click();

  // 5. Submit
  const submitBtn = page.getByTestId('login-submit');
  await submitBtn.waitFor({ state: 'attached', timeout: 10_000 });
  await submitBtn.click();

  // 6. Wait for dashboard (auth redirect completes)
  const dashboardPage = page.getByTestId('dashboard-page');
  await dashboardPage.waitFor({ state: 'visible', timeout: 30_000 });

  // 7. Confirm topbar user is loaded (auth context fully initialized)
  await page.getByTestId('topbar-user').waitFor({ state: 'attached', timeout: 15_000 });

  // 8. Wait for Ant Design hydration to stabilize
  await page.waitForLoadState('networkidle');
}

/**
 * Logs in as demo, then mocks all management API endpoints so that
 * the target page loads with seed data without requiring real JWT auth.
 */
export async function loginAndGoTo(
  page: import('@playwright/test').Page,
  route: string,
) {
  await loginAsDemo(page);

  // ── Mock all management API endpoints ────────────────────────────────────────
  // The backend uses a mock JWT "mock-jwt-token" that triggers 401s on protected
  // routes. We mock each endpoint so pages render with seed data regardless of
  // the auth token value.
  const seedHouseholds = [
    { id: 1, householdNumber: 'HK-001', address: 'Thôn 1, Xã An Thành', headPersonId: 1, headPersonName: 'Nguyễn Văn Minh', status: 'Active', movedTo: null, memberCount: 2 },
    { id: 2, householdNumber: 'HK-002', address: 'Thôn 2, Xã An Thành', headPersonId: 4, headPersonName: 'Trần Văn Hùng', status: 'Active', movedTo: null, memberCount: 3 },
    { id: 3, householdNumber: 'HK-003', address: 'Thôn 1, Xã An Thành', headPersonId: 7, headPersonName: 'Lê Thị Hà', status: 'Active', movedTo: null, memberCount: 2 },
  ];

  const seedPersons = [
    { id: 1, fullName: 'Nguyễn Văn Minh', dateOfBirth: '1980-05-15T00:00:00', gender: 'Nam', nationalId: '001080001234', ethnicity: 'Kinh', religion: 'Không', educationLevel: '12/12', occupation: 'Nông dân', householdId: 1, householdNumber: 'HK-001', relationshipToHead: 'Chủ hộ', status: 'Alive' },
    { id: 2, fullName: 'Nguyễn Thị Lan', dateOfBirth: '1983-08-22T00:00:00', gender: 'Nữ', nationalId: '001080001235', ethnicity: 'Kinh', religion: 'Không', educationLevel: '12/12', occupation: 'Nội trợ', householdId: 1, householdNumber: 'HK-001', relationshipToHead: 'Vợ', status: 'Alive' },
    { id: 3, fullName: 'Trần Văn Hùng', dateOfBirth: '1975-03-10T00:00:00', gender: 'Nam', nationalId: '001080001236', ethnicity: 'Kinh', religion: 'Phật giáo', educationLevel: '10/12', occupation: 'Công nhân', householdId: 2, householdNumber: 'HK-002', relationshipToHead: 'Chủ hộ', status: 'Alive' },
    { id: 4, fullName: 'Trần Thị Mai', dateOfBirth: '1978-11-30T00:00:00', gender: 'Nữ', nationalId: '001080001237', ethnicity: 'Kinh', religion: 'Không', educationLevel: '12/12', occupation: 'Buôn bán', householdId: 2, householdNumber: 'HK-002', relationshipToHead: 'Vợ', status: 'Alive' },
    { id: 5, fullName: 'Lê Văn Tùng', dateOfBirth: '2010-07-18T00:00:00', gender: 'Nam', nationalId: '', ethnicity: 'Kinh', religion: 'Không', educationLevel: '8/12', occupation: 'Học sinh', householdId: 2, householdNumber: 'HK-002', relationshipToHead: 'Con', status: 'Alive' },
    { id: 6, fullName: 'Trần Đức Anh', dateOfBirth: '2005-12-05T00:00:00', gender: 'Nam', nationalId: '001080001240', ethnicity: 'Kinh', religion: 'Không', educationLevel: '12/12', occupation: 'Học sinh', householdId: 1, householdNumber: 'HK-001', relationshipToHead: 'Con', status: 'Alive' },
    { id: 7, fullName: 'Lê Thị Hà', dateOfBirth: '1990-02-14T00:00:00', gender: 'Nữ', nationalId: '001080001241', ethnicity: 'Kinh', religion: 'Không', educationLevel: '12/12', occupation: 'Cán bộ', householdId: 3, householdNumber: 'HK-003', relationshipToHead: 'Chủ hộ', status: 'Alive' },
    { id: 8, fullName: 'Nguyễn Văn Phong', dateOfBirth: '1960-01-01T00:00:00', gender: 'Nam', nationalId: '001080001242', ethnicity: 'Kinh', religion: 'Phật giáo', educationLevel: '10/12', occupation: 'Đã nghỉ', householdId: 3, householdNumber: 'HK-003', relationshipToHead: 'Chồng', status: 'Dead' },
  ];

  const seedTempResidence = [
    { id: 1, personId: 6, personName: 'Trần Đức Anh', address: 'Ký túc xá Trường THPT An Thành', startDate: '2026-03-01', endDate: '2026-06-30', reason: 'Học tập', status: 'Active', createdAt: '2026-04-07T10:00:00' },
  ];

  const seedTempAbsence = [
    { id: 1, personId: 4, personName: 'Trần Văn Hùng', destination: 'TP. Hồ Chí Minh', startDate: '2026-04-01', endDate: '2026-04-15', reason: 'Công tác', status: 'Active', createdAt: '2026-04-07T11:00:00' },
  ];

  const seedUsers = [
    { id: 4, username: 'admin', fullName: 'Nguyễn Văn A', role: 'Admin', isActive: true },
    { id: 5, username: 'nhankhau', fullName: 'Trần Thị Bình', role: 'NhanKhau', isActive: true },
    { id: 6, username: 'hokhau', fullName: 'Lê Văn Cường', role: 'HoKhau', isActive: true },
  ];

  const seedLogs = [
    { id: 1, username: 'admin', action: 'Đăng nhập', module: 'System', timestamp: '2026-04-07T08:00:00', details: 'Đăng nhập thành công' },
    { id: 2, username: 'admin', action: 'Tạo hộ khẩu', module: 'HoKhau', timestamp: '2026-04-07T08:05:00', details: 'Tạo HK-001 thành công' },
  ];

  const base = 'http://127.0.0.1:5068';

  await page.route(`${base}/api/households/**`, async (route) => {
    const url = route.request().url();
    if (url.endsWith('/api/households')) {
      const qp = new URL(url).searchParams;
      const search = qp.get('search') ?? '';
      const status = qp.get('status') ?? '';
      let data = [...seedHouseholds];
      if (search) data = data.filter((h) => h.householdNumber.toLowerCase().includes(search.toLowerCase()) || h.address.toLowerCase().includes(search.toLowerCase()));
      if (status) data = data.filter((h) => h.status === status);
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data }) });
    } else if (url.includes('/api/households/') && url.includes('/members')) {
      const id = parseInt(url.split('/').pop()!, 10);
      const members = seedPersons.filter((p) => p.householdId === id);
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: members }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    }
  });

  await page.route(`${base}/api/persons/**`, async (route) => {
    const url = route.request().url();
    if (url.endsWith('/api/persons')) {
      const qp = new URL(url).searchParams;
      const search = qp.get('search') ?? '';
      const status = qp.get('status') ?? '';
      let data = [...seedPersons];
      if (search) data = data.filter((p) => p.fullName.toLowerCase().includes(search.toLowerCase()) || (p.nationalId && p.nationalId.includes(search)));
      if (status) data = data.filter((p) => p.status === status);
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data }) });
    } else if (url.includes('/api/persons/birth')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { id: 9 } }) });
    } else if (url.includes('/api/persons/death')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: {} }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    }
  });

  await page.route(`${base}/api/temp-residence/**`, async (route) => {
    const url = route.request().url();
    if (url.endsWith('/api/temp-residence')) {
      const qp = new URL(url).searchParams;
      const status = qp.get('status') ?? '';
      let data = [...seedTempResidence];
      if (status) data = data.filter((r) => r.status === status);
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: {} }) });
    }
  });

  await page.route(`${base}/api/temp-absence/**`, async (route) => {
    const url = route.request().url();
    if (url.endsWith('/api/temp-absence')) {
      const qp = new URL(url).searchParams;
      const status = qp.get('status') ?? '';
      let data = [...seedTempAbsence];
      if (status) data = data.filter((a) => a.status === status);
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: {} }) });
    }
  });

  await page.route(`${base}/api/users/**`, async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: seedUsers }) });
  });

  await page.route(`${base}/api/logs/**`, async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: seedLogs }) });
  });

  await page.route(`${base}/api/reports/statistics`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          totalPopulation: 8,
          totalHouseholds: 3,
          aliveCount: 7,
          maleCount: 5,
          femaleCount: 3,
          deadCount: 0,
          movedCount: 0,
          tempResidentCount: 1,
          tempAbsentCount: 1,
        },
      }),
    });
  });

  await page.route(`${base}/api/backup/**`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          success: true,
          fileName: `backup_${new Date().toISOString().split('T')[0]}.zip`,
          fileSize: '2.4 MB',
          recordCount: 42,
          timestamp: new Date().toISOString(),
        },
      }),
    });
  });

  await page.route(`${base}/api/reports/**`, async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
  });

  // 9. Navigate to the target route
  await page.goto(route, { waitUntil: 'domcontentloaded' });

  // 10. Wait for the page to settle
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}
