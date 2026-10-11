# M&B Atelier — Database Backup & Disaster Recovery Guide

**Database Location:** `data/mbatelier.sqlite` (and WAL files `data/mbatelier.sqlite-wal`, `data/mbatelier.sqlite-shm`)  
**Target RPO (Recovery Point Objective):** < 1 hour  
**Target RTO (Recovery Time Objective):** < 15 minutes  

---

## 1. Automated Online Backup Procedure

Because SQLite runs in **WAL (Write-Ahead Logging)** mode, online backups can be executed safely without stopping the web server or blocking user checkouts:

```bash
# Execute safe online vacuum backup to timestamped file
sqlite3 data/mbatelier.sqlite ".backup 'backups/mbatelier-$(date +%Y%m%d%H%M%S).sqlite'"
```

### Scheduled Cron Job (Daily / Hourly Backup):
```bash
0 * * * * cd /app && mkdir -p backups && sqlite3 data/mbatelier.sqlite ".backup 'backups/mbatelier-$(date +\%Y\%m\%d_\%H\%M).sqlite'" && find backups/ -name "*.sqlite" -mtime +14 -delete
```

---

## 2. Disaster Recovery & Restoration Procedure

If database corruption occurs or the server host experiences catastrophic storage loss:

1. Stop the application server:
   ```bash
   pkill -f "node.*server" || true
   ```

2. Archive existing data directory:
   ```bash
   mv data/mbatelier.sqlite data/mbatelier.sqlite.corrupt-$(date +%s)
   rm -f data/mbatelier.sqlite-wal data/mbatelier.sqlite-shm
   ```

3. Restore the latest valid backup snapshot:
   ```bash
   cp backups/mbatelier-latest.sqlite data/mbatelier.sqlite
   ```

4. Verify database integrity:
   ```bash
   sqlite3 data/mbatelier.sqlite "PRAGMA integrity_check;"
   # Expected output: ok
   ```

5. Restart the server:
   ```bash
   npm start
   ```
