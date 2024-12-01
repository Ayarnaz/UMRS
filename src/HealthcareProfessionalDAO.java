import java.sql.*;
import java.util.*;

public class HealthcareProfessionalDAO {

    private Connection conn;

    public HealthcareProfessionalDAO(Connection conn) {
        this.conn = conn;
    }

    // Method to close the connection
    public void closeConnection() {
        try {
            if (conn != null && !conn.isClosed()) {
                conn.close();
                //System.out.println("Connection closed.");
            }
        } catch (SQLException e) {
            System.out.println("Error closing connection: " + e.getMessage());
        }
    }

    // Create a new healthcare professional record in the database
    public void insertHealthcareProfessional(HealthcareProfessional professional) throws SQLException {
        String sql = "INSERT INTO Healthcare_Professional (SLMC_No, NIC, Name, Specialty, Phone_Number, Email, Address, Health_Institute_Number, Role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, professional.getSlmcNo());
            pstmt.setString(2, professional.getNic());
            pstmt.setString(3, professional.getName());
            pstmt.setString(4, professional.getSpecialty());
            pstmt.setString(5, professional.getPhoneNumber());
            pstmt.setString(6, professional.getEmail());
            pstmt.setString(7, professional.getAddress());
            pstmt.setString(8, professional.getHealthInstituteNumber());
            pstmt.setString(9, professional.getRole());
            
            int result = pstmt.executeUpdate();
            if (result <= 0) {
                throw new SQLException("Failed to insert healthcare professional");
            }
            System.out.println("Healthcare Professional inserted successfully.");
        }
    }

    // Read a healthcare professional record from the database
    public HealthcareProfessional getHealthcareProfessional(String slmcNo) {
        String sql = "SELECT * FROM Healthcare_Professional WHERE SLMC_No = ?";
        HealthcareProfessional professional = null;

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, slmcNo);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                professional = new HealthcareProfessional();
                professional.setSlmcNo(rs.getString("SLMC_No"));
                professional.setNic(rs.getString("NIC"));
                professional.setName(rs.getString("Name"));
                professional.setSpecialty(rs.getString("Specialty"));
                professional.setPhoneNumber(rs.getString("Phone_Number"));
                professional.setEmail(rs.getString("Email"));
                professional.setAddress(rs.getString("Address"));
                professional.setHealthInstituteNumber(rs.getString("Health_Institute_Number"));
                professional.setRole(rs.getString("Role"));
            }
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }

        return professional;
    }

    // Update a healthcare professional record in the database
    public void updateHealthcareProfessional(HealthcareProfessional professional) {
        String sql = "UPDATE Healthcare_Professional SET NIC = ?, Name = ?, Specialty = ?, Phone_Number = ?, Email = ?, Address = ?, Health_Institute_Number = ?, Role = ? WHERE SLMC_No = ?";

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, professional.getNic());
            pstmt.setString(2, professional.getName());
            pstmt.setString(3, professional.getSpecialty());
            pstmt.setString(4, professional.getPhoneNumber());
            pstmt.setString(5, professional.getEmail());
            pstmt.setString(6, professional.getAddress());
            pstmt.setString(7, professional.getHealthInstituteNumber());
            pstmt.setString(8, professional.getRole());
            pstmt.setString(9, professional.getSlmcNo());
            pstmt.executeUpdate();
            System.out.println("Healthcare Professional updated successfully.");
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
    }

    // Delete a healthcare professional record from the database
    public void deleteHealthcareProfessional(String slmcNo) {
        String sql = "DELETE FROM Healthcare_Professional WHERE SLMC_No = ?";

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, slmcNo);
            pstmt.executeUpdate();
            System.out.println("Healthcare Professional deleted successfully.");
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
    }

    // Add these new methods to HealthcareProfessionalDAO class

    public Map<String, Object> getAnalytics(String slmcNo, int months) throws SQLException {
        Map<String, Object> analytics = new HashMap<>();
        
        // Core analytics that match your database
        analytics.put("summaryStats", getSummaryStats(slmcNo, months));
        analytics.put("monthlyTrends", getMonthlyTrends(slmcNo, months));
        analytics.put("genderDistribution", getGenderDistribution(slmcNo, months));
        analytics.put("visitTimes", getVisitTimeDistribution(slmcNo, months));
        
        return analytics;
    }

    private Map<String, Integer> getSummaryStats(String slmcNo, int months) throws SQLException {
        Map<String, Integer> stats = new HashMap<>();
        
        String sql = """
            SELECT 
                COUNT(DISTINCT mr.Personal_Health_No) as total_patients,
                COUNT(*) as total_visits,
                COUNT(DISTINCT CASE 
                    WHEN mr.Date_of_Visit >= date('now', '-30 days') 
                    THEN mr.Personal_Health_No 
                    END) as active_patients,
                COUNT(DISTINCT CASE 
                    WHEN mr.Date_of_Visit = date('now') 
                    THEN mr.Record_ID 
                    END) as today_visits
            FROM Medical_Record mr
            WHERE mr.SLMC_No = ?
            AND mr.Date_of_Visit >= date('now', ? || ' months')
        """;
        
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, slmcNo);
            pstmt.setInt(2, -months);
            
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                stats.put("totalPatients", rs.getInt("total_patients"));
                stats.put("totalVisits", rs.getInt("total_visits"));
                stats.put("activePatients", rs.getInt("active_patients"));
                stats.put("todayVisits", rs.getInt("today_visits"));
            }
        }
        
        return stats;
    }

    private List<Map<String, Object>> getMonthlyTrends(String slmcNo, int months) throws SQLException {
        List<Map<String, Object>> trends = new ArrayList<>();
        
        String sql = """
            SELECT 
                strftime('%Y-%m', Date_of_Visit) as month,
                COUNT(*) as visit_count,
                COUNT(DISTINCT Personal_Health_No) as unique_patients,
                ROUND(AVG(CASE 
                    WHEN Type = 'follow-up' THEN 1
                    ELSE 0
                END) * 100, 1) as follow_up_rate
            FROM Medical_Record 
            WHERE SLMC_No = ?
            AND Date_of_Visit >= date('now', ? || ' months')
            GROUP BY month
            ORDER BY month DESC
        """;
        
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, slmcNo);
            pstmt.setInt(2, -months);
            
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                Map<String, Object> item = new HashMap<>();
                item.put("month", rs.getString("month"));
                item.put("visitCount", rs.getInt("visit_count"));
                item.put("uniquePatients", rs.getInt("unique_patients"));
                item.put("followUpRate", rs.getDouble("follow_up_rate"));
                trends.add(item);
            }
        }
        
        return trends;
    }

    private List<Map<String, Object>> getVisitTimeDistribution(String slmcNo, int months) throws SQLException {
        String sql = """
            SELECT 
                CASE 
                    WHEN strftime('%H', Date_of_Visit) BETWEEN '09' AND '11' THEN 'Morning (9-11)'
                    WHEN strftime('%H', Date_of_Visit) BETWEEN '12' AND '14' THEN 'Noon (12-2)'
                    WHEN strftime('%H', Date_of_Visit) BETWEEN '15' AND '17' THEN 'Afternoon (3-5)'
                    ELSE 'Evening (After 5)'
                END as time_slot,
                COUNT(*) as count
            FROM Medical_Record
            WHERE SLMC_No = ?
            AND Date_of_Visit >= date('now', '-' || ? || ' months')
            GROUP BY time_slot
            ORDER BY time_slot
        """;
        
        List<Map<String, Object>> distribution = new ArrayList<>();
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, slmcNo);
            pstmt.setInt(2, months);
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                Map<String, Object> item = new HashMap<>();
                item.put("timeSlot", rs.getString("time_slot"));
                item.put("count", rs.getInt("count"));
                distribution.add(item);
            }
        }
        return distribution;
    }

    private List<Map<String, Object>> getGenderDistribution(String slmcNo, int months) throws SQLException {
        String sql = """
            SELECT 
                p.Gender,
                COUNT(DISTINCT mr.Personal_Health_No) as count
            FROM Medical_Record mr
            JOIN Patient p ON mr.Personal_Health_No = p.Personal_Health_No
            WHERE mr.SLMC_No = ?
            AND mr.Date_of_Visit >= date('now', '-' || ? || ' months')
            GROUP BY p.Gender
        """;
        
        List<Map<String, Object>> distribution = new ArrayList<>();
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, slmcNo);
            pstmt.setInt(2, months);
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                Map<String, Object> item = new HashMap<>();
                item.put("gender", rs.getString("Gender"));
                item.put("count", rs.getInt("count"));
                distribution.add(item);
            }
        }
        return distribution;
    }

    // Add similar methods for referral sources, visit frequency, and consultation duration
}
