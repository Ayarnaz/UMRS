CREATE TABLE IF NOT EXISTS PATIENT (
    Personal_Health_No TEXT PRIMARY KEY,
    NIC TEXT UNIQUE,
    Name TEXT,
    Date_of_Birth DATE,
    Gender TEXT,
    Address TEXT,
    Phone_Number TEXT,
    Email TEXT,
    Emergency_Contact_Name TEXT,
    Emergency_Contact_Phone TEXT,
    Height REAL,
    Weight REAL,
    BMI REAL,
    Blood_Type TEXT,
    Medical_Conditions TEXT
);

CREATE TABLE IF NOT EXISTS Healthcare_Professional (
    SLMC_No TEXT PRIMARY KEY,
    NIC TEXT UNIQUE,
    Name TEXT,
    Specialty TEXT,
    Phone_Number TEXT,
    Email TEXT,
    Address TEXT,
    Health_Institute_Number TEXT,
    Role TEXT,
    FOREIGN KEY (Health_Institute_Number) REFERENCES Healthcare_Institute(Health_Institute_Number)
);

CREATE TABLE IF NOT EXISTS Healthcare_Institute (
    Health_Institute_Number TEXT PRIMARY KEY,
    Name TEXT,
    Address TEXT,
    Email TEXT,
    Phone_Number TEXT,
    Type TEXT
);

CREATE TABLE IF NOT EXISTS Medical_Record (
    Record_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Personal_Health_No TEXT,
    SLMC_No TEXT,
    Health_Institute_Number TEXT,
    Date_of_Visit DATE NOT NULL,
    Diagnosis TEXT,
    Treatment TEXT,
    Notes TEXT,
    Access_Requests TEXT,
    FOREIGN KEY (Personal_Health_No) REFERENCES PATIENT(Personal_Health_No) ON DELETE CASCADE,
    FOREIGN KEY (SLMC_No) REFERENCES Healthcare_Professional(SLMC_No) ON DELETE CASCADE,
    FOREIGN KEY (Health_Institute_Number) REFERENCES Healthcare_Institute(Health_Institute_Number) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Medical_Document (
    Document_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Record_ID INTEGER,
    Document_Type TEXT,
    File_Path TEXT,
    Upload_Date DATE,
    Uploaded_By TEXT,
    Details TEXT,
    FOREIGN KEY (Record_ID) REFERENCES Medical_Record(Record_ID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Appointment (
    Appointment_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Personal_Health_No TEXT,
    SLMC_No TEXT,
    Health_Institute_Number TEXT,
    Appointment_Date DATE NOT NULL,
    Appointment_Time TIME NOT NULL,
    Purpose TEXT,
    Status TEXT DEFAULT 'Scheduled',
    Notes TEXT,
    FOREIGN KEY (Personal_Health_No) REFERENCES PATIENT(Personal_Health_No) ON DELETE CASCADE,
    FOREIGN KEY (SLMC_No) REFERENCES Healthcare_Professional(SLMC_No) ON DELETE CASCADE,
    FOREIGN KEY (Health_Institute_Number) REFERENCES Healthcare_Institute(Health_Institute_Number) ON DELETE CASCADE
);

DROP TABLE IF EXISTS Login_2FA;

CREATE TABLE IF NOT EXISTS Login_2FA (
    Login_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    User_Type TEXT NOT NULL, -- 'patient', 'healthcare_professional', or 'institute'
    User_Identifier TEXT NOT NULL, -- Patient's PHN, SLMC number, or Institute number
    Login_Username TEXT NOT NULL UNIQUE, -- PHN, SLMC_No, or Institute_No
    Login_Password TEXT NOT NULL, -- Hashed password
    Salt BLOB NOT NULL, -- Salt for password hashing
    Portal_Type TEXT NOT NULL, -- 'patient', 'healthcare_professional', or 'institute'
    TwoFA_Preference TEXT,
    Last_TwoFA_Code TEXT,
    TwoFA_Code_Timestamp DATETIME
);

/*DELETE FROM Login_2FA;*/


-- Indexes for columns that will frequently be queried to improve performance
CREATE INDEX IF NOT EXISTS idx_patient_email ON PATIENT(Email);
CREATE INDEX IF NOT EXISTS idx_healthcare_professional_email ON Healthcare_Professional(Email);
CREATE INDEX IF NOT EXISTS idx_institute_email ON Healthcare_Institute(Email);
