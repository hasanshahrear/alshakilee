-- Create the serial tracker table
CREATE TABLE IF NOT EXISTS daily_invoice_serials (
  serial_date DATE PRIMARY KEY,
  current_serial INT NOT NULL DEFAULT 0
);

-- Drop the function if it already exists (optional)
DROP FUNCTION IF EXISTS get_next_invoice_serial;

-- Create the function to generate next invoice serial
DELIMITER $$

CREATE FUNCTION get_next_invoice_serial(p_date DATE)
RETURNS INT
DETERMINISTIC
BEGIN
  DECLARE next_serial INT;

  INSERT INTO daily_invoice_serials (serial_date, current_serial)
  VALUES (p_date, 1)
  ON DUPLICATE KEY UPDATE current_serial = current_serial + 1;

  SELECT current_serial INTO next_serial
  FROM daily_invoice_serials
  WHERE serial_date = p_date;

  RETURN next_serial;
END$$

DELIMITER ;


// OR //

-- Create the serial tracker table
CREATE TABLE IF NOT EXISTS daily_invoice_serials (
  serial_date DATE PRIMARY KEY,
  current_serial INT NOT NULL DEFAULT 0
);

-- Drop the function if it already exists
DROP FUNCTION IF EXISTS get_next_invoice_serial;

-- Create the function without DELIMITER
CREATE FUNCTION get_next_invoice_serial(p_date DATE)
RETURNS INT
DETERMINISTIC
BEGIN
  DECLARE next_serial INT;

  INSERT INTO daily_invoice_serials (serial_date, current_serial)
  VALUES (p_date, 1)
  ON DUPLICATE KEY UPDATE current_serial = current_serial + 1;

  SELECT current_serial INTO next_serial
  FROM daily_invoice_serials
  WHERE serial_date = p_date;

  RETURN next_serial;
END;
