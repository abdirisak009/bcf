'use client'

import { useCallback, useEffect, useState } from 'react'
import { KeyRound, Loader2, Shield, Trash2, UserPlus } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getApiBase, type ApiEnvelope } from '@/lib/api'
import { getAuthHeaders } from '@/lib/auth-client'
import { PERMISSION_LABELS, PERM, type PermissionKey } from '@/lib/permissions'

type UserRow = {
  id: string
  email: string
  role: string
  permissions?: string[]
}

const ALL_PERMS = Object.values(PERM) as PermissionKey[]

const ROLE_OPTIONS = [
  { value: 'user', label: 'Staff (permissions required)' },
  { value: 'partner', label: 'Partner (default: News only if empty)' },
  { value: 'admin', label: 'Administrator (full access)' },
]

export function UsersManagementPanel() {
  const [rows, setRows] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createRole, setCreateRole] = useState('user')
  const [createPerms, setCreatePerms] = useState<Set<string>>(new Set())
  const [createPending, setCreatePending] = useState(false)

  const [editRow, setEditRow] = useState<UserRow | null>(null)
  const [editPassword, setEditPassword] = useState('')
  const [editRole, setEditRole] = useState('user')
  const [editPerms, setEditPerms] = useState<Set<string>>(new Set())
  const [editPending, setEditPending] = useState(false)

  const [deleteRow, setDeleteRow] = useState<UserRow | null>(null)
  const [deletePending, setDeletePending] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const res = await fetch(`${getApiBase()}/api/admin/users`, {
        headers: getAuthHeaders(),
        cache: 'no-store',
      })
      const json = (await res.json()) as ApiEnvelope<{ items: UserRow[] }>
      if (!json.success || !json.data?.items) {
        setErr(json.error ?? 'Could not load users')
        setRows([])
        return
      }
      setRows(json.data.items)
    } catch {
      setErr('Network error')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function togglePerm(set: Set<string>, key: string, on: boolean) {
    const n = new Set(set)
    if (on) n.add(key)
    else n.delete(key)
    return n
  }

  async function submitCreate() {
    setCreatePending(true)
    setErr(null)
    try {
      const res = await fetch(`${getApiBase()}/api/admin/users`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: createEmail.trim(),
          password: createPassword,
          role: createRole,
          permissions: createRole === 'admin' ? [] : Array.from(createPerms),
        }),
      })
      const json = (await res.json()) as { success?: boolean; error?: string }
      if (!res.ok) {
        setErr(json.error ?? 'Create failed')
        return
      }
      setCreateOpen(false)
      setCreateEmail('')
      setCreatePassword('')
      setCreateRole('user')
      setCreatePerms(new Set())
      await load()
    } finally {
      setCreatePending(false)
    }
  }

  function openEdit(u: UserRow) {
    setEditRow(u)
    setEditPassword('')
    setEditRole(u.role)
    setEditPerms(new Set(u.role === 'admin' ? [] : (u.permissions ?? [])))
  }

  async function submitEdit() {
    if (!editRow) return
    setEditPending(true)
    setErr(null)
    try {
      const body: Record<string, unknown> = {
        role: editRole,
        permissions: editRole === 'admin' ? [] : Array.from(editPerms),
      }
      if (editPassword.trim().length >= 8) body.password = editPassword.trim()

      const res = await fetch(`${getApiBase()}/api/admin/users/${editRow.id}`, {
        method: 'PATCH',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = (await res.json()) as { success?: boolean; error?: string }
      if (!res.ok) {
        setErr(json.error ?? 'Update failed')
        return
      }
      setEditRow(null)
      await load()
    } finally {
      setEditPending(false)
    }
  }

  async function confirmDelete() {
    if (!deleteRow) return
    setDeletePending(true)
    setErr(null)
    try {
      const res = await fetch(`${getApiBase()}/api/admin/users/${deleteRow.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      const json = (await res.json()) as { success?: boolean; error?: string }
      if (!res.ok) {
        setErr(json.error ?? 'Delete failed')
        return
      }
      setDeleteRow(null)
      await load()
    } finally {
      setDeletePending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="size-6 text-brand-teal" strokeWidth={1.75} />
            <h2 className="text-xl font-semibold text-brand-navy">User management</h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            Create staff and partner accounts and choose which dashboard areas they can add, edit, or delete. Administrators
            always have full access.
          </p>
        </div>
        <Button
          type="button"
          className="shrink-0 gap-2 rounded-full bg-brand-teal px-5 font-semibold text-white shadow-lg shadow-brand-teal/25 hover:bg-brand-teal-hover"
          onClick={() => {
            setCreateOpen(true)
            setCreateEmail('')
            setCreatePassword('')
            setCreateRole('user')
            setCreatePerms(new Set())
          }}
        >
          <UserPlus className="size-4" />
          New user
        </Button>
      </div>

      {err ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {err}
        </p>
      ) : null}

      <Card className="overflow-hidden border-brand-navy/12 shadow-md">
        <div className="h-1 bg-gradient-to-r from-brand-teal to-brand-navy" />
        <CardHeader className="border-b border-brand-navy/8 bg-brand-mint/20">
          <CardTitle className="text-brand-navy">Team members</CardTitle>
          <CardDescription>Roles and module access (non-admin users need explicit permissions).</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-slate-600">
              <Loader2 className="size-5 animate-spin text-brand-teal" />
              Loading…
            </div>
          ) : (
            <ScrollArea className="max-h-[min(520px,65dvh)] w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-brand-navy/10 bg-brand-navy hover:bg-brand-navy">
                    <TableHead className="font-semibold text-white">Email</TableHead>
                    <TableHead className="font-semibold text-white">Role</TableHead>
                    <TableHead className="font-semibold text-white">Access</TableHead>
                    <TableHead className="text-right font-semibold text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((u) => (
                    <TableRow key={u.id} className="odd:bg-white even:bg-brand-mint/10">
                      <TableCell className="font-medium text-brand-navy">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize border-brand-navy/20">
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        {u.role === 'admin' ? (
                          <span className="text-sm text-slate-600">Full access</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {(u.permissions ?? []).length === 0 ? (
                              <span className="text-xs text-amber-700">
                                {u.role === 'partner' ? 'News only (default)' : 'No modules — grant access below'}
                              </span>
                            ) : (
                              u.permissions!.map((p) => (
                                <Badge key={p} variant="secondary" className="text-[10px] font-normal">
                                  {PERMISSION_LABELS[p as PermissionKey] ?? p}
                                </Badge>
                              ))
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button type="button" variant="outline" size="sm" className="mr-2" onClick={() => openEdit(u)}>
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-red-50"
                          onClick={() => setDeleteRow(u)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Create */}
      {createOpen ? (
        <Card className="border-brand-navy/12 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-brand-navy">
              <KeyRound className="size-5 text-brand-teal" />
              New user
            </CardTitle>
            <CardDescription>Minimum password length is 8 characters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cu-email">Email</Label>
                <Input
                  id="cu-email"
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  className="border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cu-pass">Password</Label>
                <Input
                  id="cu-pass"
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  className="border-slate-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={createRole} onValueChange={setCreateRole}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {createRole !== 'admin' ? (
              <div className="space-y-3 rounded-xl border border-brand-navy/10 bg-slate-50/80 p-4">
                <Label className="text-brand-navy">Module permissions</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ALL_PERMS.map((key) => (
                    <label key={key} className="flex cursor-pointer items-start gap-2 rounded-lg bg-white p-2 shadow-sm">
                      <Checkbox
                        checked={createPerms.has(key)}
                        onCheckedChange={(v) => setCreatePerms(togglePerm(createPerms, key, v === true))}
                      />
                      <span className="text-sm leading-tight text-slate-700">{PERMISSION_LABELS[key]}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={createPending} className="bg-brand-teal hover:bg-brand-teal-hover" onClick={() => void submitCreate()}>
                {createPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Create account
              </Button>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Edit */}
      {editRow ? (
        <Card className="border-brand-teal/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-brand-navy">Edit {editRow.email}</CardTitle>
            <CardDescription>Leave password blank to keep the current one.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ed-pass">New password (optional)</Label>
              <Input
                id="ed-pass"
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editRole !== 'admin' ? (
              <div className="space-y-3 rounded-xl border border-brand-navy/10 bg-slate-50/80 p-4">
                <Label className="text-brand-navy">Module permissions</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ALL_PERMS.map((key) => (
                    <label key={key} className="flex cursor-pointer items-start gap-2 rounded-lg bg-white p-2 shadow-sm">
                      <Checkbox
                        checked={editPerms.has(key)}
                        onCheckedChange={(v) => setEditPerms(togglePerm(editPerms, key, v === true))}
                      />
                      <span className="text-sm leading-tight text-slate-700">{PERMISSION_LABELS[key]}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={editPending} className="bg-brand-teal hover:bg-brand-teal-hover" onClick={() => void submitEdit()}>
                {editPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Save changes
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditRow(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <AlertDialog open={!!deleteRow} onOpenChange={(o) => !o && setDeleteRow(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. User: <strong>{deleteRow?.email}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletePending}
              onClick={(e) => {
                e.preventDefault()
                void confirmDelete()
              }}
            >
              {deletePending ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
