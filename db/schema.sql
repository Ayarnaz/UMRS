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
    Personal_Health_No TEXT,
    Document_Type TEXT,
    File_Path TEXT,
    Upload_Date DATE,
    Uploaded_By TEXT,
    Details TEXT,
    FOREIGN KEY (Record_ID) REFERENCES Medical_Record(Record_ID) ON DELETE CASCADE,
    FOREIGN KEY (Personal_Health_No) REFERENCES PATIENT(Personal_Health_No) ON DELETE CASCADE
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

/*DROP TABLE IF EXISTS Login_2FA;*/

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

/*DROP TABLE IF EXISTS Activity;*/

CREATE TABLE IF NOT EXISTS Activity (
    Activity_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Personal_Health_No TEXT NOT NULL,
    Description TEXT NOT NULL,
    Date DATETIME NOT NULL,
    FOREIGN KEY (Personal_Health_No) REFERENCES Patient(Personal_Health_No)
);

-- Update the Activity table
/*ALTER TABLE Activity ADD COLUMN Entity_Type TEXT DEFAULT 'patient';
ALTER TABLE Activity ADD COLUMN Entity_ID TEXT;
ALTER TABLE Activity ADD COLUMN Type TEXT DEFAULT 'general';
ALTER TABLE Activity ADD COLUMN Status TEXT DEFAULT 'completed';
ALTER TABLE Activity ADD COLUMN User_ID TEXT;

-- Update existing records to use new columns
UPDATE Activity SET 
    Entity_Type = 'patient',
    Entity_ID = Personal_Health_No,
    Type = 'general',
    Status = 'completed';*/


/*DROP TABLE IF EXISTS Record_Access_Requests;*/

CREATE TABLE IF NOT EXISTS Record_Access_Requests (
    Request_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Personal_Health_No TEXT NOT NULL,  
    SLMC_No TEXT,
    Institute_No TEXT,
    Purpose TEXT,
    Is_Emergency BOOLEAN DEFAULT 0,
    Status TEXT DEFAULT 'pending',
    Request_Date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Personal_Health_No) REFERENCES Patient(Personal_Health_No),
    FOREIGN KEY (SLMC_No) REFERENCES Healthcare_Professional(SLMC_No),
    FOREIGN KEY (Institute_No) REFERENCES Healthcare_Institute(Health_Institute_Number),
    CHECK ((SLMC_No IS NOT NULL AND Institute_No IS NULL) OR 
           (SLMC_No IS NULL AND Institute_No IS NOT NULL))
);



/*ALTER TABLE Medical_Record ADD COLUMN Summary TEXT;*/
/*ALTER TABLE Medical_Record ADD COLUMN Type TEXT;*/
/*ALTER TABLE PATIENT ADD COLUMN auth_token TEXT;*/

-- Add Personal_Health_No column
/*ALTER TABLE Medical_Document ADD COLUMN Personal_Health_No TEXT;*/

-- Add foreign key constraint
/*ALTER TABLE Medical_Document ADD CONSTRAINT fk_document_patient 
FOREIGN KEY (Personal_Health_No) REFERENCES PATIENT(Personal_Health_No) ON DELETE CASCADE;*/

/*DROP TABLE IF EXISTS Record_Requests;
DROP TABLE IF EXISTS Shared_Records;*/

CREATE TABLE IF NOT EXISTS Record_Requests (
    request_id INTEGER PRIMARY KEY AUTOINCREMENT,
    requester_slmc TEXT,
    requester_institute_id TEXT,
    receiver_slmc TEXT,
    receiver_institute_id TEXT,
    patient_phn TEXT NOT NULL,
    record_type TEXT NOT NULL,
    purpose TEXT,
    status TEXT NOT NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    requester_type TEXT NOT NULL CHECK (requester_type IN ('PROFESSIONAL', 'INSTITUTE')),
    receiver_type TEXT NOT NULL CHECK (receiver_type IN ('PROFESSIONAL', 'INSTITUTE')),
    FOREIGN KEY (requester_slmc) REFERENCES Healthcare_Professional(SLMC_No),
    FOREIGN KEY (requester_institute_id) REFERENCES Healthcare_Institute(Health_Institute_Number),
    FOREIGN KEY (receiver_slmc) REFERENCES Healthcare_Professional(SLMC_No),
    FOREIGN KEY (receiver_institute_id) REFERENCES Healthcare_Institute(Health_Institute_Number),
    FOREIGN KEY (patient_phn) REFERENCES Patient(Personal_Health_No),
    CHECK ((requester_slmc IS NOT NULL AND requester_institute_id IS NULL) OR 
           (requester_slmc IS NULL AND requester_institute_id IS NOT NULL)),
    CHECK ((receiver_slmc IS NOT NULL AND receiver_institute_id IS NULL) OR 
           (receiver_slmc IS NULL AND receiver_institute_id IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS Shared_Records (
    record_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_slmc TEXT,
    sender_institute_id TEXT,
    receiver_slmc TEXT,
    receiver_institute_id TEXT,
    patient_phn TEXT NOT NULL,
    record_type TEXT NOT NULL,
    sub_type TEXT,
    file_path TEXT,
    status TEXT NOT NULL,
    share_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('PROFESSIONAL', 'INSTITUTE')),
    receiver_type TEXT NOT NULL CHECK (receiver_type IN ('PROFESSIONAL', 'INSTITUTE')),
    FOREIGN KEY (sender_slmc) REFERENCES Healthcare_Professional(SLMC_No),
    FOREIGN KEY (sender_institute_id) REFERENCES Healthcare_Institute(Health_Institute_Number),
    FOREIGN KEY (receiver_slmc) REFERENCES Healthcare_Professional(SLMC_No),
    FOREIGN KEY (receiver_institute_id) REFERENCES Healthcare_Institute(Health_Institute_Number),
    FOREIGN KEY (patient_phn) REFERENCES Patient(Personal_Health_No),
    CHECK ((sender_slmc IS NOT NULL AND sender_institute_id IS NULL) OR 
           (sender_slmc IS NULL AND sender_institute_id IS NOT NULL)),
    CHECK ((receiver_slmc IS NOT NULL AND receiver_institute_id IS NULL) OR 
           (receiver_slmc IS NULL AND receiver_institute_id IS NOT NULL))
);


CREATE TABLE IF NOT EXISTS Institute_Professional_Association (
    Health_Institute_Number TEXT NOT NULL,
    SLMC_No TEXT NOT NULL,
    Status TEXT DEFAULT 'active',
    Join_Date TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (Health_Institute_Number, SLMC_No),
    FOREIGN KEY (Health_Institute_Number) REFERENCES Healthcare_Institute(Health_Institute_Number),
    FOREIGN KEY (SLMC_No) REFERENCES Healthcare_Professional(SLMC_No)
);

-- Indexes for columns that will frequently be queried to improve performance
CREATE INDEX IF NOT EXISTS idx_patient_email ON PATIENT(Email);
CREATE INDEX IF NOT EXISTS idx_healthcare_professional_email ON Healthcare_Professional(Email);
CREATE INDEX IF NOT EXISTS idx_institute_email ON Healthcare_Institute(Email);
CREATE INDEX IF NOT EXISTS idx_medical_document_phn ON Medical_Document(Personal_Health_No);
CREATE INDEX IF NOT EXISTS idx_activity_entity ON Activity(Entity_Type, Entity_ID);