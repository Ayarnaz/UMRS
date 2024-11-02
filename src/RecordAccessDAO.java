import java.sql.*;
import java.util.*;
import com.zaxxer.hikari.HikariDataSource;

public class RecordAccessDAO {
    private final HikariDataSource dataSource;

    public RecordAccessDAO(HikariDataSource dataSource) {
        if (dataSource == null) {
            throw new IllegalArgumentException("DataSource cannot be null");
        }
        this.dataSource = dataSource;
    }

    public boolean createAccessRequest(RecordAccess request) {
        String sql = "INSERT INTO Record_Access_Requests (Personal_Health_No, SLMC_No, Purpose, Is_Emergency, Status) " +
                    "VALUES (?, ?, ?, ?, ?)";
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, request.getPhn());
            pstmt.setString(2, request.getSlmcNo());
            pstmt.setString(3, request.getPurpose());
            pstmt.setBoolean(4, request.isEmergency());
            pstmt.setString(5, request.isEmergency() ? "approved" : "pending");
            
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Database error: " + e.getMessage());
            return false;
        }
    }

    public Map<String, List<Map<String, Object>>> getRecordsData(String slmcNo) {
        Map<String, List<Map<String, Object>>> response = new HashMap<>();
        String sql = "SELECT r.*, p.Name as Patient_Name " +
                    "FROM Record_Access_Requests r " +
                    "LEFT JOIN Patient p ON r.Personal_Health_No = p.Personal_Health_No " +
                    "WHERE r.SLMC_No = ?";
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, slmcNo);
            ResultSet rs = pstmt.executeQuery();
            
            List<Map<String, Object>> records = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> record = new HashMap<>();
                record.put("id", rs.getInt("Request_ID"));
                record.put("personalHealthNo", rs.getString("Personal_Health_No"));
                record.put("patientName", rs.getString("Patient_Name"));
                record.put("purpose", rs.getString("Purpose"));
                record.put("requestDate", rs.getString("Request_Date"));
                record.put("status", rs.getString("Status"));
                record.put("isEmergency", rs.getBoolean("Is_Emergency"));
                records.add(record);
            }
            
            response.put("accessedRecords", records);
            response.put("medicalRecords", new ArrayList<>());
            return response;
        } catch (SQLException e) {
            System.err.println("Database error: " + e.getMessage());
            return response;
        }
    }
}