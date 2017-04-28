use schedules;

ALTER TABLE rpi
ADD COLUMN last_status_update DATETIME
AFTER user_id;