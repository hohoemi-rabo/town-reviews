import { createAdminClient } from './supabase/admin'

export type AuditAction = 'create' | 'update' | 'delete' | 'approve' | 'reject'
export type AuditTargetType = 'recommendation' | 'facility' | 'facility_request'

interface AuditLogParams {
  action: AuditAction
  targetType: AuditTargetType
  targetId?: string
  details?: Record<string, unknown>
  adminIdentifier?: string
}

/**
 * 監査ログを記録する
 */
export async function createAuditLog({
  action,
  targetType,
  targetId,
  details,
  adminIdentifier = 'admin',
}: AuditLogParams): Promise<void> {
  try {
    const supabase = createAdminClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('audit_logs').insert({
      action,
      target_type: targetType,
      target_id: targetId || null,
      details: details || null,
      admin_identifier: adminIdentifier,
    })

    if (error) {
      console.error('Failed to create audit log:', error)
    }
  } catch (error) {
    console.error('Audit log creation error:', error)
  }
}
