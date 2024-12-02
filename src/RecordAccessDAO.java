import java.sql.*;
import java.util.*;
import com.zaxxer.hikari.HikariDataSource;

public class RecordAccessDAO {
    private final HikariDataSource dataSource;

    public RecordAccessDAO(HikariDataSource dataSource) {
        this.dataSource = dataSource;
    }

    public boolean createAccessRequest(RecordAccess request) {
        System.out.println("Creating access request for: " + 
            (request.getSlmcNo() != null ? "Professional SLMC: " + request.getSlmcNo() 
                                        : "Institute: " + request.getInstituteNo()));
        System.out.println("PHN: " + request.getPhn());
        System.out.println("Purpose: " + request.getPurpose());
        System.out.println("Emergency: " + request.isEmergency());

        String checkSql = request.getSlmcNo() != null ? 
            """
            SELECT Request_ID, Status FROM Record_Access_Requests 
            WHERE Personal_Health_No = ? AND SLMC_No = ? 
            AND Status IN ('approved', 'pending')
            """ :
            """
            SELECT Request_ID, Status FROM Record_Access_Requests 
            WHERE Personal_Health_No = ? AND Institute_No = ? 
            AND Status IN ('approved', 'pending')
            """;
        
        try (Connection conn = dataSource.getConnection()) {
            try (PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {
                checkStmt.setString(1, request.getPhn());
                checkStmt.setString(2, request.getSlmcNo() != null ? 
                    request.getSlmcNo() : request.getInstituteNo());
                
                System.out.println("Checking existing request");
                ResultSet rs = checkStmt.executeQuery();
                
                if (rs.next()) {
                    String status = rs.getString("Status");
                    // If there's a pending request and this is emergency, update it
                    if (status.equals("pending") && request.isEmergency()) {
                        String updateSql = """
                            UPDATE Record_Access_Requests 
                            SET Status = 'approved', Is_Emergency = true 
                            WHERE Request_ID = ?
                        """;
                        try (PreparedStatement updateStmt = conn.prepareStatement(updateSql)) {
                            updateStmt.setInt(1, rs.getInt("Request_ID"));
                            updateStmt.executeUpdate();
                            System.out.println("Updated pending request to emergency");
                            return true;
                        }
                    }
                    // If already approved or not emergency, return existing status
                    return true;
                }
            }

            String insertSql = """
                INSERT INTO Record_Access_Requests 
                (Personal_Health_No, SLMC_No, Institute_No, Purpose, Is_Emergency, Status) 
                VALUES (?, ?, ?, ?, ?, ?)
            """;
            
            try (PreparedStatement pstmt = conn.prepareStatement(insertSql)) {
                pstmt.setString(1, request.getPhn());
                
                if (request.getSlmcNo() != null) {
                    pstmt.setString(2, request.getSlmcNo());
                    pstmt.setNull(3, Types.VARCHAR);
                } else {
                    pstmt.setNull(2, Types.VARCHAR);
                    pstmt.setString(3, request.getInstituteNo());
                }
                
                pstmt.setString(4, request.getPurpose());
                pstmt.setBoolean(5, request.isEmergency());
                pstmt.setString(6, request.isEmergency() ? "approved" : "pending");
                
                System.out.println("Executing insert for " + 
                    (request.getSlmcNo() != null ? "professional" : "institute") + 
                    " request");
                
                int result = pstmt.executeUpdate();
                System.out.println("Insert result: " + result + " rows affected");
                
                return result > 0;
            }
        } catch (SQLException e) {
            System.err.println("SQL Error in createAccessRequest: " + e.getMessage());
            System.err.println("SQL State: " + e.getSQLState());
            e.printStackTrace();
            return false;
        }
    }

    public Map<String, List<Map<String, Object>>> getRecordsData(String identifier) {
        System.out.println("Getting records data for identifier: " + identifier);
        Map<String, List<Map<String, Object>>> response = new HashMap<>();
        
        String sql = """
            SELECT r.*, p.Name as Patient_Name 
            FROM Record_Access_Requests r 
            LEFT JOIN Patient p ON r.Personal_Health_No = p.Personal_Health_No 
            WHERE r.SLMC_No = ? OR r.Institute_No = ?
            ORDER BY r.Request_Date DESC
        """;
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, identifier);
            pstmt.setString(2, identifier);
            System.out.println("Executing query: " + sql);
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
            
            System.out.println("Found " + records.size() + " records");
            response.put("accessedRecords", records);
            response.put("medicalRecords", new ArrayList<>());
            return response;
        } catch (SQLException e) {
            System.err.println("Database error in getRecordsData: " + e.getMessage());
            e.printStackTrace();
            return response;
        }
    }

    public Map<String, List<Map<String, Object>>> getInstituteRecordsData(String instituteId) {
        Map<String, List<Map<String, Object>>> response = new HashMap<>();
        
        String sql = """
            SELECT r.*, p.Name as Patient_Name 
            FROM Record_Access_Requests r 
            LEFT JOIN Patient p ON r.Personal_Health_No = p.Personal_Health_No 
            WHERE r.Institute_No = ? 
            ORDER BY r.Request_Date DESC
        """;
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, instituteId);
            System.out.println("Executing query for institute: " + instituteId);
            
            ResultSet rs = pstmt.executeQuery();
            List<Map<String, Object>> records = new ArrayList<>();
            
            while (rs.next()) {
                String phn = rs.getString("Personal_Health_No");
                int requestId = rs.getInt("Request_ID");
                
                System.out.println("Found institute record: ID=" + requestId + ", PHN=" + phn);
                
                Map<String, Object> record = new HashMap<>();
                record.put("id", requestId);
                record.put("personalHealthNo", phn);
                record.put("patientName", rs.getString("Patient_Name"));
                record.put("purpose", rs.getString("Purpose"));
                record.put("requestDate", rs.getString("Request_Date"));
                record.put("status", rs.getString("Status"));
                record.put("isEmergency", rs.getBoolean("Is_Emergency"));
                records.add(record);
            }
            
            System.out.println("Retrieved " + records.size() + " institute access records");
            response.put("accessedRecords", records);
            return response;
        } catch (SQLException e) {
            System.err.println("Database error in getInstituteRecordsData: " + e.getMessage());
            e.printStackTrace();
            return response;
        }
    }

}
