import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
initializeApp();
const db = getFirestore();
const metricKeys = ['grossAdds', 'upgrades', 'homeInternet', 'watches', 'tablets', 'accessories', 'upgradePlus', 'ild', 'leases', 'billPayAdds', 'milestoneSheets'];
export const auditDailyEntry = onDocumentWritten('dailyEntries/{entryId}', async (event) => {
    if (!event.data?.before.exists || !event.data.after.exists)
        return;
    const before = event.data.before.data();
    const after = event.data.after.data();
    const changed = metricKeys.filter(key => before.metrics?.[key] !== after.metrics?.[key]);
    if (before.notes !== after.notes)
        changed.push('notes');
    if (!changed.length)
        return;
    await db.collection('auditEvents').add({ entryId: event.params.entryId, employeeId: after.employeeId, storeId: after.storeId, actorId: after.updatedBy, changedFields: changed, beforeMetrics: before.metrics, afterMetrics: after.metrics, createdAt: new Date().toISOString() });
});
export const rebuildEmployeeSummary = onDocumentWritten('dailyEntries/{entryId}', async (event) => {
    const entry = event.data?.after.exists ? event.data.after.data() : event.data?.before.data();
    if (!entry)
        return;
    const monthKey = String(entry.businessDate).slice(0, 7);
    const snapshots = await db.collection('dailyEntries').where('employeeId', '==', entry.employeeId).get();
    const actuals = Object.fromEntries(metricKeys.map(key => [key, 0]));
    snapshots.docs.filter(doc => String(doc.data().businessDate).startsWith(monthKey)).forEach(doc => metricKeys.forEach(key => actuals[key] += Number(doc.data().metrics?.[key] || 0)));
    const goal = await db.collection('monthlyGoals').doc(`${entry.employeeId}_${monthKey}`).get();
    await db.collection('monthlyEmployeeSummaries').doc(`${entry.employeeId}_${monthKey}`).set({ employeeId: entry.employeeId, storeId: entry.storeId, monthKey, actuals, targets: goal.exists ? goal.data()?.targets : {}, updatedAt: new Date().toISOString() });
});
