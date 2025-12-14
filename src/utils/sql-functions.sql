-- Drop the function if it already exists (optional)
DROP FUNCTION IF EXISTS get_next_invoice_serial;

-- Create the function to generate next invoice serial
DELIMITER $$

-- Create the function without DELIMITER
CREATE FUNCTION get_next_invoice_serial(pDate DATE)
RETURNS INT
DETERMINISTIC
BEGIN
  DECLARE next_serial INT;

  INSERT INTO DailyInvoiceSerial (serialDate, currentSerial)
  VALUES (pDate, 1)
  ON DUPLICATE KEY UPDATE currentSerial = currentSerial + 1;

  SELECT currentSerial INTO next_serial
  FROM DailyInvoiceSerial
  WHERE serialDate = pDate;

  RETURN next_serial;
END$$

DELIMITER ;


// OR //

-- Create the serial tracker table
CREATE TABLE IF NOT EXISTS dailyInvoiceSerials (
  serial_date DATE PRIMARY KEY,
  current_serial INT NOT NULL DEFAULT 0
);

-- Drop the function if it already exists
DROP FUNCTION IF EXISTS get_next_invoice_serial;

-- Create the function without DELIMITER
CREATE FUNCTION get_next_invoice_serial(pDate DATE)
RETURNS INT
DETERMINISTIC
BEGIN
  DECLARE next_serial INT;

  INSERT INTO DailyInvoiceSerial (serialDate, currentSerial)
  VALUES (pDate, 1)
  ON DUPLICATE KEY UPDATE currentSerial = currentSerial + 1;

  SELECT currentSerial INTO next_serial
  FROM DailyInvoiceSerial
  WHERE serialDate = pDate;

  RETURN next_serial;
END;

///------- > Latest <---------------------///

-- Create the serial tracker table if it doesn't exist
CREATE TABLE IF NOT EXISTS DailyInvoiceSerial (
  serialDate DATE PRIMARY KEY,
  currentSerial INT NOT NULL DEFAULT 0
);

-- Drop the function if it already exists
DROP FUNCTION IF EXISTS get_next_invoice_serial;

-- Create the function
CREATE FUNCTION get_next_invoice_serial(pDate DATE)
RETURNS INT
DETERMINISTIC
BEGIN
  DECLARE next_serial INT;

  -- Insert or update the current serial
  INSERT INTO DailyInvoiceSerial (serialDate, currentSerial)
  VALUES (pDate, 1)
  ON DUPLICATE KEY UPDATE currentSerial = currentSerial + 1;

  -- Get the current serial
  SELECT currentSerial INTO next_serial
  FROM DailyInvoiceSerial
  WHERE serialDate = pDate;

  RETURN next_serial;
END;
