import java.sql.*;
import java.util.Vector;

public class MedicalRecordDAO {

    private Connection conn;

    public MedicalRecordDAO(Connection conn) {
        this.conn = conn; // persistent connection
    }

    // Insert a new medical record
    public void insertMedicalRecord(MedicalRecord record) {
        String sql = "INSERT INTO Medical_Record (Personal_Health_No, SLMC_No, Health_Institute_Number, Date_of_Visit, Diagnosis, Treatment, Notes, Access_Requests) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, record.getPersonalHealthNo());
            pstmt.setString(2, record.getSlmcNo());
            pstmt.setString(3, record.getHealthInstituteNumber());
            pstmt.setDate(4, record.getDateOfVisit());
            pstmt.setString(5, record.getDiagnosis());
            pstmt.setString(6, record.getTreatment());
            pstmt.setString(7, record.getNotes());
            pstmt.setString(8, record.getAccessRequests());
            pstmt.executeUpdate();
            System.out.println("Medical record inserted successfully.");
        } catch (SQLException e) {
            System.out.println(e.getMessage());
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
                MedicalRecord record = new MedicalRecord(
                    rs.getString("Personal_Health_No"),
                    rs.getString("SLMC_No"),
                    rs.getString("Health_Institute_Number"),
                    rs.getDate("Date_of_Visit"),
                    rs.getString("Diagnosis"),
                    rs.getString("Treatment"),
                    rs.getString("Notes"),
                    rs.getString("Access_Requests")
                );
                record.setRecordID(rs.getInt("Record_ID")); // Set the Record ID
                records.add(record);
            }
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }

        return records;
    }

    // Update a medical record
    public void updateMedicalRecord(MedicalRecord record) {
        String sql = "UPDATE Medical_Record SET SLMC_No = ?, Health_Institute_Number = ?, Date_of_Visit = ?, Diagnosis = ?, Treatment = ?, Notes = ?, Access_Requests = ? WHERE Record_ID = ?";

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, record.getSlmcNo());
            pstmt.setString(2, record.getHealthInstituteNumber());
            pstmt.setDate(3, record.getDateOfVisit());
            pstmt.setString(4, record.getDiagnosis());
            pstmt.setString(5, record.getTreatment());
            pstmt.setString(6, record.getNotes());
            pstmt.setString(7, record.getAccessRequests());
            pstmt.setInt(8, record.getRecordID());
            pstmt.executeUpdate();
            System.out.println("Medical record updated successfully.");
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
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
}
