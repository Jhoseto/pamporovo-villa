USE pamporovo_villa;

CREATE TABLE IF NOT EXISTS blocked_dates (
  id int NOT NULL AUTO_INCREMENT,
  villa_id varchar(32) NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  note varchar(255) DEFAULT NULL,
  created_by_admin_id int DEFAULT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY blocked_villa_dates_idx (villa_id, start_date)
);
