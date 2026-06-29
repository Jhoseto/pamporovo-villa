-- Run after schema update if db:push is not used
USE pamporovo_villa;

CREATE INDEX booking_villa_status_idx ON booking_requests (villa_id, status);
CREATE INDEX booking_dates_idx ON booking_requests (check_in_date, check_out_date);
CREATE INDEX booking_status_idx ON booking_requests (status);
