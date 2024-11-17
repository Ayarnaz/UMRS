import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Vector;

public class MedicalRecordDAO {

    private Connection conn;

    public MedicalRecordDAO(Connection conn) {
        this.conn = conn; // persistent connection
    }

    // Insert a new medical record
    public void insertMedicalRecord(MedicalRecord record) throws SQLException {
        System.out.println("Starting medical record insertion for PHN: " + record.getPersonalHealthNo());
        
        String sql = """
            INSERT INTO Medical_Record (
                Personal_Health_No, SLMC_No, Health_Institute_Number, 
                Date_of_Visit, Diagnosis, Treatment, Notes, Type, Summary
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;
        
        boolean originalAutoCommit = conn.getAutoCommit();
        try {
            // Ensure we're in transaction mode
            conn.setAutoCommit(false);
            
            // Perform the insert
            try (PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                pstmt.setString(1, record.getPersonalHealthNo());
                pstmt.setString(2, record.getSlmcNo());
                pstmt.setString(3, record.getHealthInstituteNumber());
                pstmt.setDate(4, java.sql.Date.valueOf(record.getDateOfVisit()));
                pstmt.setString(5, record.getDiagnosis());
                pstmt.setString(6, record.getTreatment());
                pstmt.setString(7, record.getNotes());
                pstmt.setString(8, record.getType());
                pstmt.setString(9, record.getSummary());

                int affectedRows = pstmt.executeUpdate();
                System.out.println("Affected rows after insertion: " + affectedRows);
                
                if (affectedRows > 0) {
                    try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                        if (generatedKeys.next()) {
                            record.setRecordId(generatedKeys.getInt(1));
                            System.out.println("Generated Record ID: " + record.getRecordId());
                        }
                    }
                }
            }
            
            // Commit the transaction
            conn.commit();
            System.out.println("Record insertion completed successfully");
            
        } catch (SQLException e) {
            System.err.println("Error inserting medical record: " + e.getMessage());
            try {
                conn.rollback();
            } catch (SQLException re) {
                System.err.println("Error during rollback: " + re.getMessage());
            }
            throw e;
        } finally {
            // Restore original auto-commit setting
            try {
                conn.setAutoCommit(originalAutoCommit);
            } catch (SQLException e) {
                System.err.println("Error restoring auto-commit mode: " + e.getMessage());
            }
        }
    }

    // Read all medical records for a specific patient using Vector
    public Vector<MedicalRecord> getMedicalRecordsByPatient(String personalHealthNo) {
        Vector<MedicalRecord> records = new Vector<>();
        String sql = "SELECT * FROM Medical_Record WHERE Personal_Health_No = ?";

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, personalHealthNo);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                MedicalRecord record = new MedicalRecord();
                record.setRecordId(rs.getInt("Record_ID"));
                record.setPersonalHealthNo(rs.getString("Personal_Health_No"));
                record.setSlmcNo(rs.getString("SLMC_No"));
                record.setHealthInstituteNumber(rs.getString("Health_Institute_Number"));
                record.setDateOfVisit(rs.getDate("Date_of_Visit") != null ? rs.getDate("Date_of_Visit").toLocalDate() : null);
                record.setDiagnosis(rs.getString("Diagnosis"));
                record.setTreatment(rs.getString("Treatment"));
                record.setNotes(rs.getString("Notes"));
                record.setAccessRequests(rs.getString("Access_Requests"));
                record.setSummary(rs.getString("Summary"));
                records.add(record);
            }
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }

        return records;
    }

    // Delete a medical record
    public void deleteMedicalRecord(int recordID) {
        String sql = "DELETE FROM Medical_Record WHERE Record_ID = ?";

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, recordID);
            pstmt.executeUpdate();
            System.out.println("Medical record deleted successfully.");
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
    }

    public MedicalRecord getMostRecentTestResult(String personalHealthNo) {
        String sql = "SELECT * FROM Medical_Record WHERE Personal_Health_No = ? AND Diagnosis LIKE '%Test Result%' ORDER BY Date_of_Visit DESC LIMIT 1";
        
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, personalHealthNo);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return createMedicalRecordFromResultSet(rs);
            }
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
        return null;
    }

    // New method to get the most recent medical record
    public MedicalRecord getMostRecentMedicalRecord(String personalHealthNo) {
        String sql = "SELECT * FROM Medical_Record WHERE Personal_Health_No = ? ORDER BY Date_of_Visit DESC LIMIT 1";
        
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, personalHealthNo);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return createMedicalRecordFromResultSet(rs);
            }
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
        return null;
    }

    public MedicalRecord getRecentRecordByType(String personalHealthNo, String type) throws SQLException {
        String query = "SELECT * FROM Medical_Record WHERE Personal_Health_No = ? AND Treatment LIKE ? ORDER BY Date_of_Visit DESC LIMIT 1";
        try (PreparedStatement pstmt = conn.prepareStatement(query)) {
            pstmt.setString(1, personalHealthNo);
            pstmt.setString(2, "%" + type + "%");
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return createMedicalRecordFromResultSet(rs);
                }
            }
        }
        return null;
    }

    public List<MedicalRecord> getRecordsByType(String personalHealthNo, String type) throws SQLException {
        List<MedicalRecord> records = new ArrayList<>();
        String query = "SELECT * FROM Medical_Record WHERE Personal_Health_No = ? AND Treatment LIKE ? ORDER BY Date_of_Visit DESC";
        try (PreparedStatement pstmt = conn.prepareStatement(query)) {
            pstmt.setString(1, personalHealthNo);
            pstmt.setString(2, "%" + type + "%");
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    records.add(createMedicalRecordFromResultSet(rs));
                }
            }
        }
        return records;
    }

    public List<MedicalRecord> getRecentRecords(String personalHealthNo, int limit) throws SQLException {
        String sql = "SELECT * FROM Medical_Record WHERE Personal_Health_No = ? ORDER BY Date_of_Visit DESC LIMIT ?";
        List<MedicalRecord> records = new ArrayList<>();

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, personalHealthNo);
            pstmt.setInt(2, limit);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                MedicalRecord record = new MedicalRecord();
                record.setRecordId(rs.getInt("Record_ID"));
                record.setPersonalHealthNo(rs.getString("Personal_Health_No"));
                record.setSlmcNo(rs.getString("SLMC_No"));
                record.setHealthInstituteNumber(rs.getString("Health_Institute_Number"));
                record.setDateOfVisit(rs.getDate("Date_of_Visit") != null ? rs.getDate("Date_of_Visit").toLocalDate() : null);
                record.setDiagnosis(rs.getString("Diagnosis"));
                record.setTreatment(rs.getString("Treatment"));
                record.setNotes(rs.getString("Notes"));
                record.setAccessRequests(rs.getString("Access_Requests"));
                record.setSummary(rs.getString("Summary"));
                records.add(record);
            }
        }

        return records;
    }

    public MedicalRecord getRecentRecord(String personalHealthNo) throws SQLException {
        if (personalHealthNo == null) {
            throw new IllegalArgumentException("personalHealthNo cannot be null");
        }
        String sql = "SELECT * FROM Medical_Record WHERE personal_health_no = ? ORDER BY date DESC LIMIT 1";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, personalHealthNo);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return createMedicalRecordFromResultSet(rs);
                }
            }
        }
        return null;
    }

    private MedicalRecord createMedicalRecordFromResultSet(ResultSet rs) throws SQLException {
        try {
            MedicalRecord record = new MedicalRecord();
            record.setRecordId(rs.getInt("Record_ID"));
            record.setPersonalHealthNo(rs.getString("Personal_Health_No"));
            record.setSlmcNo(rs.getString("SLMC_No"));
            record.setHealthInstituteNumber(rs.getString("Health_Institute_Number"));
            record.setDateOfVisit(rs.getDate("Date_of_Visit") != null ? rs.getDate("Date_of_Visit").toLocalDate() : null);
            record.setDiagnosis(rs.getString("Diagnosis"));
            record.setTreatment(rs.getString("Treatment"));
            record.setNotes(rs.getString("Notes"));
            record.setAccessRequests(rs.getString("Access_Requests"));
            record.setSummary(rs.getString("Summary"));
            return record;
        } catch (SQLException e) {
            System.err.println("Error creating MedicalRecord from ResultSet: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public List<MedicalRecord> getAllMedicalRecords() {
        List<MedicalRecord> records = new ArrayList<>();
        String sql = "SELECT * FROM medical_records";
        
        try (PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            
            while (rs.next()) {
                try {
                    MedicalRecord record = createMedicalRecordFromResultSet(rs);
                    records.add(record);
                } catch (SQLException e) {
                    System.err.println("Error processing row: " + e.getMessage());
                    // Continue to next row instead of breaking the loop
                }
            }
        } catch (SQLException e) {
            System.err.println("Database error: " + e.getMessage());
            e.printStackTrace();
        }
        
        return records;
    }

    public List<MedicalRecord> getAllMedicalRecords(String personalHealthNo) {
        List<MedicalRecord> records = new ArrayList<>();
        String sql = "SELECT * FROM medical_records WHERE personal_health_no = ?";
        
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, personalHealthNo);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    try {
                        MedicalRecord record = createMedicalRecordFromResultSet(rs);
                        records.add(record);
                    } catch (SQLException e) {
                        System.err.println("Error processing row: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
            }
        } catch (SQLException e) {
            System.err.println("Database error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error fetching medical records", e);
        }
        
        return records;
    }

    public MedicalRecord getMedicalRecordById(String id) throws SQLException {
        String sql = "SELECT * FROM Medical_Record WHERE Record_ID = ?";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return extractMedicalRecordFromResultSet(rs);
                }
            }
        }
        return null;
    }

        // Update a medical record
    public boolean updateMedicalRecord(MedicalRecord record) throws SQLException {
        String sql = "UPDATE Medical_Record SET SLMC_No = ?, Health_Institute_Number = ?, Date_of_Visit = ?, Diagnosis = ?, Treatment = ?, Notes = ?, Type = ?, Summary = ? WHERE Record_ID = ?";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, record.getSlmcNo());
            pstmt.setString(2, record.getHealthInstituteNumber());
            pstmt.setDate(3, java.sql.Date.valueOf(record.getDateOfVisit()));
            pstmt.setString(4, record.getDiagnosis());
            pstmt.setString(5, record.getTreatment());
            pstmt.setString(6, record.getNotes());
            pstmt.setString(7, record.getType());
            pstmt.setString(8, record.getSummary());
            pstmt.setInt(9, record.getRecordId());
            int affectedRows = pstmt.executeUpdate();
            return affectedRows > 0;
        }
    }

    public boolean deleteMedicalRecord(String id) throws SQLException {
        String sql = "DELETE FROM Medical_Record WHERE Record_ID = ?";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, id);
            int affectedRows = pstmt.executeUpdate();
            return affectedRows > 0;
        }
    }

    private MedicalRecord extractMedicalRecordFromResultSet(ResultSet rs) throws SQLException {
        MedicalRecord record = new MedicalRecord();
        record.setRecordId(rs.getInt("Record_ID"));
        record.setPersonalHealthNo(rs.getString("Personal_Health_No"));
        record.setSlmcNo(rs.getString("SLMC_No"));
        record.setHealthInstituteNumber(rs.getString("Health_Institute_Number"));
        record.setDateOfVisit(rs.getDate("Date_of_Visit") != null ? rs.getDate("Date_of_Visit").toLocalDate() : null);
        record.setDiagnosis(rs.getString("Diagnosis"));
        record.setTreatment(rs.getString("Treatment"));
        record.setNotes(rs.getString("Notes"));
        record.setAccessRequests(rs.getString("Access_Requests"));
        record.setSummary(rs.getString("Summary"));
        return record;
    }

    public List<MedicalRecord> getRecordsByPHN(String personalHealthNo) {
        List<MedicalRecord> records = new ArrayList<>();
        String sql = "SELECT * FROM Medical_Record WHERE Personal_Health_No = ? " +
                     "ORDER BY Date_of_Visit DESC";
        
        try {
            // Force a transaction read
            conn.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);
            
            try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                pstmt.setString(1, personalHealthNo);
                pstmt.setFetchDirection(ResultSet.FETCH_FORWARD);
                ResultSet rs = pstmt.executeQuery();
                
                while (rs.next()) {
                    MedicalRecord record = new MedicalRecord();
                    record.setRecordId(rs.getInt("Record_ID"));
                    record.setPersonalHealthNo(rs.getString("Personal_Health_No"));
                    record.setType(rs.getString("Type"));
                    record.setSlmcNo(rs.getString("SLMC_No"));
                    record.setSummary(rs.getString("Summary"));
                    record.setDiagnosis(rs.getString("Diagnosis"));
                    record.setTreatment(rs.getString("Treatment"));
                    record.setNotes(rs.getString("Notes"));
                    record.setDateOfVisit(rs.getDate("Date_of_Visit").toLocalDate());
                    
                    System.out.println("DEBUG: Found record ID: " + record.getRecordId());
                    records.add(record);
                }
            }
        } catch (SQLException e) {
            System.err.println("SQL Error: " + e.getMessage());
            e.printStackTrace();
        }
        
        return records;
    }

    public List<Appointment> getUpcomingAppointments(String personalHealthNo) {
        List<Appointment> appointments = new ArrayList<>();
        String sql = "SELECT * FROM Appointment " +
                    "WHERE Personal_Health_No = ? " +
                    "AND Appointment_Date >= CURRENT_DATE " +
                    "ORDER BY Appointment_Date ASC, Appointment_Time ASC";

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, personalHealthNo);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                Appointment appointment = new Appointment();
                appointment.setAppointmentID(rs.getInt("Appointment_ID"));
                appointment.setPersonalHealthNo(rs.getString("Personal_Health_No"));
                appointment.setSlmcNo(rs.getString("SLMC_No"));
                appointment.setHealthInstituteNumber(rs.getString("Health_Institute_Number"));
                appointment.setAppointmentDate(rs.getDate("Appointment_Date"));
                appointment.setAppointmentTime(rs.getTime("Appointment_Time"));
                appointment.setPurpose(rs.getString("Purpose"));
                appointment.setStatus(rs.getString("Status"));
                appointment.setNotes(rs.getString("Notes"));
                appointments.add(appointment);
            }
        } catch (SQLException e) {
            System.err.println("Error getting upcoming appointments: " + e.getMessage());
            e.printStackTrace();
        }
        return appointments;
    }

    public List<MedicalRecord> getRecentPrescriptions(String personalHealthNo) {
        List<MedicalRecord> prescriptions = new ArrayList<>();
        String sql = "SELECT * FROM Medical_Record " +
                    "WHERE Personal_Health_No = ? " +
                    "AND Type = 'prescription' " +
                    "ORDER BY Date_of_Visit DESC " +
                    "LIMIT 5";

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, personalHealthNo);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                MedicalRecord record = createMedicalRecordFromResultSet(rs);
                prescriptions.add(record);
            }
        } catch (SQLException e) {
            System.err.println("Error getting recent prescriptions: " + e.getMessage());
            e.printStackTrace();
        }
        return prescriptions;
    }

    public List<MedicalRecord> getRecentTests(String personalHealthNo) {
        List<MedicalRecord> tests = new ArrayList<>();
        String sql = "SELECT * FROM Medical_Record " +
                    "WHERE Personal_Health_No = ? " +
                    "AND Type = 'test' " +
                    "ORDER BY Date_of_Visit DESC " +
                    "LIMIT 5";

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, personalHealthNo);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                MedicalRecord record = createMedicalRecordFromResultSet(rs);
                tests.add(record);
            }
        } catch (SQLException e) {
            System.err.println("Error getting recent tests: " + e.getMessage());
            e.printStackTrace();
        }
        return tests;
    }

    public int getPendingReportsCount(String instituteNumber) throws SQLException {
        String sql = "SELECT COUNT(*) FROM Medical_Record WHERE Health_Institute_Number = ?";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, instituteNumber);
            ResultSet rs = pstmt.executeQuery();
            return rs.next() ? rs.getInt(1) : 0;
        }
    }

    public List<MedicalRecord> getRecordsByInstitute(String instituteId) {
        List<MedicalRecord> records = new ArrayList<>();
        String sql = """
            SELECT mr.*, p.Name as patient_name 
            FROM Medical_Record mr
            JOIN Patient p ON mr.Personal_Health_No = p.Personal_Health_No
            WHERE mr.Health_Institute_Number = ?
            ORDER BY mr.Date_Of_Visit DESC
        """;

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, instituteId);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                MedicalRecord record = new MedicalRecord();
                record.setRecordId(rs.getInt("Record_ID"));
                record.setPersonalHealthNo(rs.getString("Personal_Health_No"));
                record.setSlmcNo(rs.getString("SLMC_No"));
                record.setHealthInstituteNumber(rs.getString("Health_Institute_Number"));
                record.setDateOfVisit(rs.getDate("Date_of_Visit") != null ? 
                    rs.getDate("Date_of_Visit").toLocalDate() : null);
                record.setDiagnosis(rs.getString("Diagnosis"));
                record.setTreatment(rs.getString("Treatment"));
                record.setNotes(rs.getString("Notes"));
                record.setType(rs.getString("Type"));
                record.setSummary(rs.getString("Summary"));
                records.add(record);
            }
        } catch (SQLException e) {
            System.err.println("Error getting records by institute: " + e.getMessage());
            e.printStackTrace();
        }
        return records;
    }

    public List<MedicalRecord> getRecordsByProfessional(String slmcNo) throws SQLException {
        List<MedicalRecord> records = new ArrayList<>();
        String sql = """
            SELECT DISTINCT mr.* 
            FROM Medical_Record mr 
            LEFT JOIN Record_Access_Requests rar 
                ON mr.Personal_Health_No = rar.Personal_Health_No 
            WHERE mr.SLMC_No = ? 
                OR (rar.SLMC_No = ? AND rar.Status = 'approved') 
            ORDER BY mr.Date_of_Visit DESC
        """;
        
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, slmcNo);
            pstmt.setString(2, slmcNo);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    MedicalRecord record = new MedicalRecord();
                    record.setRecordId(rs.getInt("Record_ID"));
                    record.setPersonalHealthNo(rs.getString("Personal_Health_No"));
                    record.setSlmcNo(rs.getString("SLMC_No"));
                    record.setHealthInstituteNumber(rs.getString("Health_Institute_Number"));
                    record.setDateOfVisit(rs.getDate("Date_of_Visit") != null ? 
                        rs.getDate("Date_of_Visit").toLocalDate() : null);
                    record.setDiagnosis(rs.getString("Diagnosis"));
                    record.setTreatment(rs.getString("Treatment"));
                    record.setNotes(rs.getString("Notes"));
                    record.setType(rs.getString("Type"));
                    record.setSummary(rs.getString("Summary"));
                    
                    System.out.println("Found record: ID=" + record.getRecordId() + 
                        ", PHN=" + record.getPersonalHealthNo());
                    
                    records.add(record);
                }
            }
        }
        return records;
    }

    public List<MedicalRecord> getAllRecordsByPHN(String personalHealthNo) throws SQLException {
        System.out.println("Fetching all records for PHN: " + personalHealthNo);
        List<MedicalRecord> records = new ArrayList<>();
        
        // Force a fresh read
        try (Statement stmt = conn.createStatement()) {
            stmt.execute("PRAGMA read_uncommitted = 0");
            stmt.execute("PRAGMA journal_mode = WAL");
            stmt.execute("PRAGMA wal_checkpoint(FULL)");
        }
        
        String sql = """
            SELECT * FROM Medical_Record 
            WHERE Personal_Health_No = ? 
            ORDER BY Record_ID DESC, Date_of_Visit DESC
        """;
        
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, personalHealthNo);
            pstmt.setFetchDirection(ResultSet.FETCH_FORWARD);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    MedicalRecord record = new MedicalRecord();
                    record.setRecordId(rs.getInt("Record_ID"));
                    record.setPersonalHealthNo(rs.getString("Personal_Health_No"));
                    record.setSlmcNo(rs.getString("SLMC_No"));
                    record.setHealthInstituteNumber(rs.getString("Health_Institute_Number"));
                    record.setDateOfVisit(rs.getDate("Date_of_Visit") != null ? 
                        rs.getDate("Date_of_Visit").toLocalDate() : null);
                    record.setDiagnosis(rs.getString("Diagnosis"));
                    record.setTreatment(rs.getString("Treatment"));
                    record.setNotes(rs.getString("Notes"));
                    record.setType(rs.getString("Type"));
                    record.setSummary(rs.getString("Summary"));
                    
                    System.out.println("Found record: ID=" + record.getRecordId() + 
                        ", Type=" + record.getType() + ", PHN=" + record.getPersonalHealthNo());
                    
                    records.add(record);
                }
            }
        }
        
        System.out.println("Total records found: " + records.size());
        return records;
    }
}
