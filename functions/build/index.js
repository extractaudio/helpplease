import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import { google } from 'googleapis';
import { expectedScheduleHeaders, reconcileScheduleRows } from './schedule-sync.js';
initializeApp();
const db = getFirestore();
const metricKeys = ['grossAdds', 'upgrades', 'homeInternet', 'watches', 'tablets', 'accessories', 'upgradePlus', 'ild', 'leases', 'billPayAdds', 'milestoneSheets'];
const scheduleServiceAccount = defineSecret('SCHEDULE_SERVICE_ACCOUNT_JSON');
export const auditDailyEntry = onDocumentWritten('dailyEntries/{entryId}', async (event) => {
    const beforeSnapshot = event.data?.before;
    const afterSnapshot = event.data?.after;
    if (!beforeSnapshot?.exists || !afterSnapshot?.exists)
        return;
    const before = beforeSnapshot.data();
    const after = afterSnapshot.data();
    if (!before || !after)
        return;
    const changed = metricKeys.filter(key => before.metrics?.[key] !== after.metrics?.[key]);
    if (before.notes !== after.notes)
        changed.push('notes');
    if (changed.length)
        await db.collection('auditEvents').add({ entryId: event.params.entryId, employeeId: after.employeeId, storeId: after.storeId, actorId: after.updatedBy, changedFields: changed, beforeMetrics: before.metrics, afterMetrics: after.metrics, createdAt: new Date().toISOString() });
});
export const rebuildEmployeeSummary = onDocumentWritten('dailyEntries/{entryId}', async (event) => {
    const source = event.data?.after?.exists ? event.data.after : event.data?.before?.exists ? event.data.before : undefined;
    const entry = source?.data();
    if (!entry)
        return;
    const monthKey = String(entry.businessDate).slice(0, 7);
    const snapshots = await db.collection('dailyEntries').where('employeeId', '==', entry.employeeId).get();
    const actuals = Object.fromEntries(metricKeys.map(key => [key, 0]));
    snapshots.docs.filter(item => String(item.data().businessDate).startsWith(monthKey)).forEach(item => metricKeys.forEach(key => actuals[key] += Number(item.data().metrics?.[key] || 0)));
    const goal = await db.collection('monthlyGoals').doc(`${entry.employeeId}_${monthKey}`).get();
    await db.collection('monthlyEmployeeSummaries').doc(`${entry.employeeId}_${monthKey}`).set({ employeeId: entry.employeeId, storeId: entry.storeId, monthKey, actuals, targets: goal.exists ? goal.data()?.targets : {}, updatedAt: new Date().toISOString() });
});
export const syncAppSchedule = onSchedule({ schedule: 'every 15 minutes', timeZone: 'America/Denver', secrets: [scheduleServiceAccount] }, async () => {
    const sheetId = process.env.SCHEDULE_SHEET_ID;
    if (!sheetId)
        throw new Error('SCHEDULE_SHEET_ID is required');
    const credentials = JSON.parse(scheduleServiceAccount.value());
    const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'App Schedule!A:I' });
    const [headers, ...values] = response.data.values ?? [];
    if (JSON.stringify(headers) !== JSON.stringify(expectedScheduleHeaders))
        throw new Error('App Schedule headers do not match the documented contract');
    const rows = values.map(row => Object.fromEntries(expectedScheduleHeaders.map((header, index) => [header, String(row[index] ?? '').trim()])));
    const profileSnapshot = await db.collection('users').where('status', '==', 'active').get();
    const profiles = profileSnapshot.docs.map(item => { const value = item.data(); return { uid: item.id, fullName: String(value.fullName || ''), workEmail: String(value.workEmail || ''), storeId: String(value.storeId || '') }; });
    const existingSnapshot = await db.collection('scheduleShifts').get();
    const existing = existingSnapshot.docs.map(item => item.data());
    const result = reconcileScheduleRows(rows, profiles, existing);
    if (result.issues.length) {
        await db.collection('scheduleSyncRuns').add({ status: 'failed', issues: result.issues, createdAt: new Date().toISOString() });
        return;
    }
    const batch = db.batch();
    const syncedAt = new Date().toISOString();
    result.upserts.forEach(shift => batch.set(db.collection('scheduleShifts').doc(shift.id), { ...shift, syncedAt }));
    result.deleteIds.forEach(id => batch.delete(db.collection('scheduleShifts').doc(id)));
    result.changes.forEach(change => batch.set(db.collection('scheduleNotifications').doc(`${change.type}_${change.shiftId}_${syncedAt}`), { ...change, read: false, createdAt: syncedAt }));
    await batch.commit();
    await db.collection('scheduleSyncRuns').add({ status: 'success', received: rows.length, upserts: result.upserts.length, removed: result.deleteIds.length, createdAt: syncedAt });
});
