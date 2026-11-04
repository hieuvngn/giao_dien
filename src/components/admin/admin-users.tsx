'use client'

import { useMemo, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import {
  Badge,
  EmptyState,
  Pager,
  RowBtn,
  Switch,
  TableShell,
  normSearch,
  type BadgeTone,
} from './admin-ui'

/* ============================================================
   Quản trị · Quản lý người dùng
   Dữ liệu demo cục bộ — mọi hành động chỉ đổi state + toast
   ============================================================ */

type Role = 'student' | 'teacher' | 'admin'
type Status = 'active' | 'banned'

type AdminUser = {
  id: string
  name: string
  email: string
  avatar: string
  level: string
  role: Role
  joined: string
  streak: number
  status: Status
}

const INITIAL_USERS: AdminUser[] = [
  { id: 'u1', name: 'Nguyễn Minh Anh', email: 'minhanh@gmail.com', avatar: '🦊', level: 'HSK 2', role: 'student', joined: '12/03/2026', streak: 15, status: 'active' },
  { id: 'u2', name: 'Trần Quốc Bảo', email: 'quocbao@outlook.com', avatar: '🐯', level: 'HSK 4', role: 'student', joined: '02/01/2026', streak: 42, status: 'active' },
  { id: 'u3', name: 'Lê Thu Hà', email: 'thuha.ha@gmail.com', avatar: '🐰', level: 'HSK 1', role: 'student', joined: '28/03/2026', streak: 6, status: 'active' },
  { id: 'u4', name: 'Phạm Văn Đức', email: 'phamvanduc@yeah.net', avatar: '🐻', level: 'HSK 3', role: 'student', joined: '19/11/2025', streak: 0, status: 'banned' },
  { id: 'u5', name: 'Vũ Ngọc Linh', email: 'ngoclinh.kid@gmail.com', avatar: '🐱', level: 'YCT 2', role: 'student', joined: '05/02/2026', streak: 21, status: 'active' },
  { id: 'u6', name: 'Đặng Gia Hân', email: 'giahhan.cn@163.com', avatar: '🐼', level: 'HSK 5', role: 'student', joined: '14/09/2025', streak: 88, status: 'active' },
  { id: 'u7', name: 'Bùi Tuấn Kiệt', email: 'tuaniet@gnmail.com', avatar: '🦁', level: 'HSK 2', role: 'student', joined: '21/12/2025', streak: 9, status: 'active' },
  { id: 'u8', name: 'Hoàng Mai Chi', email: 'maichi@nhatkyhanngu.vn', avatar: '👩‍🏫', level: 'HSK 6', role: 'teacher', joined: '03/08/2025', streak: 120, status: 'active' },
  { id: 'u9', name: 'Quản trị viên', email: 'admin@nhatkyhanngu.vn', avatar: '🛡️', level: '—', role: 'admin', joined: '01/01/2025', streak: 365, status: 'active' },
  { id: 'u10', name: 'Nguyễn Đình Phúc', email: 'dinhphuc@box.com', avatar: '🐢', level: 'HSK 1', role: 'student', joined: '17/02/2026', streak: 0, status: 'banned' },
]

const ROLE_META: Record<Role, { label: string; tone: BadgeTone }> = {
  student: { label: 'Học viên', tone: 'cream' },
  teacher: { label: 'Giáo viên', tone: 'sky' },
  admin: { label: 'Quản trị', tone: 'lilac' },
}

const STATUS_META: Record<Status, { label: string; tone: BadgeTone }> = {
  active: { label: 'Hoạt động', tone: 'mint' },
  banned: { label: 'Đã khoá', tone: 'red' },
}

const PER_PAGE = 6

export function UsersSection() {
  const { toast } = useToast()
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS)
  const [q, setQ] = useState('')
  const [role, setRole] = useState<'all' | Role>('all')
  const [status, setStatus] = useState<'all' | Status>('all')
  const [page, setPage] = useState(1)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const nq = normSearch(q)
    return users.filter((u) => {
      if (nq && !normSearch(`${u.name} ${u.email}`).includes(nq)) return false
      if (role !== 'all' && u.role !== role) return false
      if (status !== 'all' && u.status !== status) return false
      return true
    })
  }, [users, q, role, status])

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, pages)
  const rows = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  const counts = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.status === 'active').length,
      banned: users.filter((u) => u.status === 'banned').length,
      staff: users.filter((u) => u.role !== 'student').length,
    }),
    [users],
  )

  const toggleBan = (u: AdminUser) => {
    setUsers((prev) =>
      prev.map((x) => (x.id === u.id ? { ...x, status: x.status === 'active' ? 'banned' : 'active' } : x)),
    )
    toast({
      title: u.status === 'active' ? `Đã khoá tài khoản ${u.name} 🚫` : `Đã mở khoá ${u.name} ✅`,
      description: 'Hành động demo — dữ liệu mẫu chỉ đổi trong phiên này.',
    })
  }

  const removeUser = (u: AdminUser) => {
    if (u.role === 'admin') {
      toast({ title: 'Không thể xoá quản trị viên 🛡️', description: 'Hãy giữ lại ít nhất một tài khoản admin.' })
      return
    }
    setUsers((prev) => prev.filter((x) => x.id !== u.id))
    setConfirmId(null)
    toast({ title: `Đã xoá ${u.name} 🗑️`, description: 'Tài khoản đã rời khỏi danh sách (demo).' })
  }

  const selectCls =
    'rounded-xl bg-white/70 px-2.5 py-2 text-[11px] font-bold text-[#5d4a57] ring-1 ring-[#ead9cd] outline-none transition focus:ring-[#e8aa96]'

  return (
    <section aria-label="Quản lý người dùng" className="paper-scrap rounded-3xl p-4 sm:p-6">
      {/* tiêu đề + thống kê nhanh */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-[#4f3d4a]">
            Quản lý người dùng <span className="ml-1 font-cn text-base text-[#e88aa6]">用户管理</span>
          </h2>
          <p className="mt-0.5 text-xs font-semibold text-[#8d7484]">
            Tìm kiếm, phân quyền, khoá / mở khoá tài khoản học viên.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="lilac">👥 {counts.total} tài khoản</Badge>
          <Badge tone="mint">✓ {counts.active} hoạt động</Badge>
          <Badge tone="red">🚫 {counts.banned} bị khoá</Badge>
          <Badge tone="sky">🎓 {counts.staff} cộng tác</Badge>
        </div>
      </div>

      {/* bộ lọc */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setPage(1)
          }}
          placeholder="🔍 Tìm theo tên hoặc email…"
          className="min-w-52 flex-1 rounded-xl bg-white/70 px-3.5 py-2 text-xs font-semibold text-[#5d4a57] ring-1 ring-[#ead9cd] outline-none transition placeholder:text-[#c9a2b3] focus:ring-[#e8aa96]"
          aria-label="Tìm kiếm người dùng"
        />
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value as 'all' | Role)
            setPage(1)
          }}
          className={selectCls}
          aria-label="Lọc theo vai trò"
        >
          <option value="all">Mọi vai trò</option>
          <option value="student">Học viên</option>
          <option value="teacher">Giáo viên</option>
          <option value="admin">Quản trị</option>
        </select>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as 'all' | Status)
            setPage(1)
          }}
          className={selectCls}
          aria-label="Lọc theo trạng thái"
        >
          <option value="all">Mọi trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="banned">Đã khoá</option>
        </select>
      </div>

      {/* bảng */}
      <div className="mt-4">
        {rows.length === 0 ? (
          <EmptyState emoji="🙈" text="Không tìm thấy người dùng nào khớp bộ lọc." />
        ) : (
          <TableShell head={['Người dùng', 'Cấp độ', 'Vai trò', 'Tham gia', 'Streak', 'Trạng thái', 'Hành động']}>
            {rows.map((u) => (
              <tr key={u.id} className="group">
                <td className="border-b border-dashed border-[#f2e4da] px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--pastel-butter)]/70 text-lg" aria-hidden="true">
                      {u.avatar}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-extrabold text-[#4f3d4a]">{u.name}</span>
                      <span className="block truncate text-[10px] font-semibold text-[#b58fa0]">{u.email}</span>
                    </span>
                  </div>
                </td>
                <td className="border-b border-dashed border-[#f2e4da] px-3 py-2.5 text-xs font-bold text-[#6f5a68]">{u.level}</td>
                <td className="border-b border-dashed border-[#f2e4da] px-3 py-2.5">
                  <Badge tone={ROLE_META[u.role].tone}>{ROLE_META[u.role].label}</Badge>
                </td>
                <td className="border-b border-dashed border-[#f2e4da] px-3 py-2.5 text-[11px] font-semibold text-[#8d7484]">{u.joined}</td>
                <td className="border-b border-dashed border-[#f2e4da] px-3 py-2.5">
                  <span className="text-xs font-extrabold text-[#c2547e]">🔥 {u.streak}</span>
                </td>
                <td className="border-b border-dashed border-[#f2e4da] px-3 py-2.5">
                  <Badge tone={STATUS_META[u.status].tone}>{STATUS_META[u.status].label}</Badge>
                </td>
                <td className="border-b border-dashed border-[#f2e4da] px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <Switch
                      checked={u.status === 'active'}
                      onChange={() => toggleBan(u)}
                      label={`${u.status === 'active' ? 'Khoá' : 'Mở khoá'} ${u.name}`}
                    />
                    {confirmId === u.id ? (
                      <RowBtn onClick={() => removeUser(u)} title="Xác nhận xoá" confirm>
                        ✓
                      </RowBtn>
                    ) : (
                      <RowBtn
                        onClick={() => setConfirmId(u.id)}
                        title={`Xoá ${u.name}`}
                        danger
                      >
                        🗑
                      </RowBtn>
                    )}
                    {confirmId === u.id && (
                      <RowBtn onClick={() => setConfirmId(null)} title="Bỏ qua" >
                        ✕
                      </RowBtn>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </TableShell>
        )}
      </div>

      <div className="mt-3">
        <Pager page={safePage} pages={pages} onPage={setPage} />
      </div>
    </section>
  )
}
