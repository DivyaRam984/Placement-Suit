import { usePlatformStore } from '@/store/usePlatformStore';
import styles from './Settings.module.css';

export default function Settings() {
  const { preferences, setPreferences, clearNotifications } = usePlatformStore();

  return (
    <div className={styles.root}>
      <h1>Settings</h1>
      <p className={styles.sub}>Preferences and platform state.</p>

      <section className={styles.card}>
        <h2>Preferences</h2>
        <label className={styles.row}>
          <span>Notify on high match job</span>
          <input
            type="checkbox"
            checked={preferences.notifyHighMatch ?? true}
            onChange={(e) => setPreferences({ notifyHighMatch: e.target.checked })}
          />
        </label>
        <label className={styles.row}>
          <span>Email notifications</span>
          <input
            type="checkbox"
            checked={preferences.notifyEmail ?? false}
            onChange={(e) => setPreferences({ notifyEmail: e.target.checked })}
          />
        </label>
      </section>

      <section className={styles.card}>
        <h2>Data</h2>
        <p className={styles.muted}>All data is stored under one key: <code>placementUser</code>. No isolated keys. Load via getUser(), save via updateUser().</p>
        <button type="button" onClick={clearNotifications} className={styles.btn}>Clear notifications</button>
      </section>
    </div>
  );
}
