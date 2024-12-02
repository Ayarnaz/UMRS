import java.sql.*;
import java.util.*;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

public class AnalyticsDAO {
    private static HikariDataSource dataSource;
    private static final int BUSY_TIMEOUT_MS = 30000; // 30 seconds

    static {
        initializeDataSource();
    }

    private static void initializeDataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:sqlite:db/umrs.db");
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.addDataSourceProperty("journal_mode", "WAL");
        config.addDataSourceProperty("busy_timeout", String.valueOf(BUSY_TIMEOUT_MS));
        config.addDataSourceProperty("foreign_keys", "ON");
        config.addDataSourceProperty("synchronous", "NORMAL");
        config.addDataSourceProperty("cache_size", "-2000");
        config.addDataSourceProperty("temp_store", "MEMORY");
        dataSource = new HikariDataSource(config);
    }

    public Map<String, Object> getAnalytics(String slmcNo, int months) throws SQLException {
        Map<String, Object> analytics = new HashMap<>();
        
        try (Connection conn = dataSource.getConnection()) {
            analytics.put("summaryStats", getSummaryStats(conn, slmcNo));
            analytics.put("monthlyTrends", getMonthlyTrends(conn, slmcNo, months));
            analytics.put("genderDistribution", getGenderDistribution(conn, slmcNo));
            analytics.put("visitTimes", getVisitTimeDistribution(conn, slmcNo));
        } catch (SQLException e) {
            System.err.println("Error getting analytics: " + e.getMessage());
            throw e;
        }
        
        return analytics;
    }

    private Map<String, Object> getSummaryStats(Connection conn, String slmcNo) throws SQLException {
        Map<String, Object> summaryStats = new HashMap<>();
        
        // Total Patients
        String totalPatientsSQL = """
            SELECT COUNT(DISTINCT Personal_Health_No) as total 
            FROM Medical_Record 
            WHERE SLMC_No = ?
        """;
        try (PreparedStatement pstmt = conn.prepareStatement(totalPatientsSQL)) {
            pstmt.setString(1, slmcNo);
            ResultSet rs = pstmt.executeQuery();
            summaryStats.put("totalPatients", rs.next() ? rs.getInt("total") : 0);
        }
        
        // Total Visits
        String totalVisitsSQL = """
            SELECT COUNT(*) as total 
            FROM Medical_Record 
            WHERE SLMC_No = ?
        """;
        try (PreparedStatement pstmt = conn.prepareStatement(totalVisitsSQL)) {
            pstmt.setString(1, slmcNo);
            ResultSet rs = pstmt.executeQuery();
            summaryStats.put("totalVisits", rs.next() ? rs.getInt("total") : 0);
        }
        
        // Active Patients (last 30 days)
        String activePatientsSql = """
            SELECT COUNT(DISTINCT Personal_Health_No) as total 
            FROM Medical_Record 
            WHERE SLMC_No = ? 
            AND Date_of_Visit >= date('now', '-30 days')
        """;
        try (PreparedStatement pstmt = conn.prepareStatement(activePatientsSql)) {
            pstmt.setString(1, slmcNo);
            ResultSet rs = pstmt.executeQuery();
            summaryStats.put("activePatients", rs.next() ? rs.getInt("total") : 0);
        }
        
        // Today's Visits
        String todayVisitsSQL = """
            SELECT COUNT(*) as total 
            FROM Medical_Record 
            WHERE SLMC_No = ? 
            AND Date_of_Visit = date('now')
        """;
        try (PreparedStatement pstmt = conn.prepareStatement(todayVisitsSQL)) {
            pstmt.setString(1, slmcNo);
            ResultSet rs = pstmt.executeQuery();
            summaryStats.put("todayVisits", rs.next() ? rs.getInt("total") : 0);
        }
        
        return summaryStats;
    }

    private List<Map<String, Object>> getMonthlyTrends(Connection conn, String slmcNo, int months) throws SQLException {
        List<Map<String, Object>> monthlyTrends = new ArrayList<>();
        
        String monthlyTrendsSQL = """
            SELECT 
                strftime('%Y-%m', Date_of_Visit) as month,
                COUNT(*) as visitCount,
                COUNT(DISTINCT Personal_Health_No) as uniquePatients
            FROM Medical_Record 
            WHERE SLMC_No = ? 
            AND Date_of_Visit >= date('now', ?) 
            GROUP BY strftime('%Y-%m', Date_of_Visit)
            ORDER BY month DESC
        """;
        
        try (PreparedStatement pstmt = conn.prepareStatement(monthlyTrendsSQL)) {
            pstmt.setString(1, slmcNo);
            pstmt.setString(2, String.format("-%d months", months));
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                Map<String, Object> trend = new HashMap<>();
                trend.put("month", rs.getString("month"));
                trend.put("visitCount", rs.getInt("visitCount"));
                trend.put("uniquePatients", rs.getInt("uniquePatients"));
                monthlyTrends.add(trend);
            }
        }
        
        return monthlyTrends;
    }

    private List<Map<String, Object>> getGenderDistribution(Connection conn, String slmcNo) throws SQLException {
        List<Map<String, Object>> genderDistribution = new ArrayList<>();
        
        String genderSQL = """
            SELECT 
                p.Gender as gender,
                COUNT(DISTINCT m.Personal_Health_No) as count
            FROM Medical_Record m
            JOIN Patient p ON m.Personal_Health_No = p.Personal_Health_No
            WHERE m.SLMC_No = ?
            GROUP BY p.Gender
        """;
        
        try (PreparedStatement pstmt = conn.prepareStatement(genderSQL)) {
            pstmt.setString(1, slmcNo);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                Map<String, Object> gender = new HashMap<>();
                gender.put("gender", rs.getString("gender"));
                gender.put("count", rs.getInt("count"));
                genderDistribution.add(gender);
            }
        }
        
        return genderDistribution;
    }

    private List<Map<String, Object>> getVisitTimeDistribution(Connection conn, String slmcNo) throws SQLException {
        List<Map<String, Object>> visitTimes = new ArrayList<>();
        
        String visitTimeSQL = """
            SELECT 
                CASE 
                    WHEN strftime('%H', Appointment_Time) < '12' THEN 'Morning'
                    WHEN strftime('%H', Appointment_Time) < '17' THEN 'Afternoon'
                    ELSE 'Evening'
                END as timeSlot,
                COUNT(*) as count
            FROM Appointment 
            WHERE SLMC_No = ?
            AND Status = 'completed'
            GROUP BY timeSlot
            ORDER BY 
                CASE timeSlot
                    WHEN 'Morning' THEN 1
                    WHEN 'Afternoon' THEN 2
                    WHEN 'Evening' THEN 3
                END
        """;
        
        try (PreparedStatement pstmt = conn.prepareStatement(visitTimeSQL)) {
            pstmt.setString(1, slmcNo);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                Map<String, Object> timeSlot = new HashMap<>();
                timeSlot.put("timeSlot", rs.getString("timeSlot"));
                timeSlot.put("count", rs.getInt("count"));
                visitTimes.add(timeSlot);
            }
        }
        
        // If no data is found, provide default time slots with 0 counts
        if (visitTimes.isEmpty()) {
            String[] defaultSlots = {"Morning", "Afternoon", "Evening"};
            for (String slot : defaultSlots) {
                Map<String, Object> timeSlot = new HashMap<>();
                timeSlot.put("timeSlot", slot);
                timeSlot.put("count", 0);
                visitTimes.add(timeSlot);
            }
        }
        
        return visitTimes;
    }

    public Map<String, Object> getInstituteAnalytics(String instituteId, int days) throws SQLException {
        Map<String, Object> analytics = new HashMap<>();
        
        try (Connection conn = dataSource.getConnection()) {
            // Get main statistics
            analytics.putAll(getInstituteSummaryStats(conn, instituteId, days));
            
            // Get trends
            analytics.putAll(getInstituteTrends(conn, instituteId, days));
            
            // Get department statistics
            analytics.put("departmentStats", getDepartmentStats(conn, instituteId, days));
            
            return analytics;
        } catch (SQLException e) {
            System.err.println("Error getting institute analytics: " + e.getMessage());
            throw e;
        }
    }

    private Map<String, Object> getInstituteSummaryStats(Connection conn, String instituteId, int days) throws SQLException {
        Map<String, Object> stats = new HashMap<>();
        
        String sql = """
            SELECT 
                COUNT(DISTINCT p.Personal_Health_No) as totalPatients,
                COUNT(DISTINCT hp.SLMC_No) as totalProfessionals,
                COUNT(DISTINCT a.Appointment_ID) as totalAppointments
            FROM Healthcare_Institute hi
            LEFT JOIN Healthcare_Professional hp ON hi.Health_Institute_Number = hp.Health_Institute_Number
            LEFT JOIN Appointment a ON hi.Health_Institute_Number = a.Health_Institute_Number
            LEFT JOIN Patient p ON a.Personal_Health_No = p.Personal_Health_No
            WHERE hi.Health_Institute_Number = ?
            AND (a.Appointment_Date IS NULL OR a.Appointment_Date >= date('now', ?))
        """;
        
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, instituteId);
            pstmt.setString(2, String.format("-%d days", days));
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                stats.put("totalPatients", rs.getInt("totalPatients"));
                stats.put("totalProfessionals", rs.getInt("totalProfessionals"));
                stats.put("totalAppointments", rs.getInt("totalAppointments"));
                stats.put("patientSatisfaction", 0); // Placeholder since we don't have feedback data
            }
        }
        
        return stats;
    }

    private Map<String, Object> getInstituteTrends(Connection conn, String instituteId, int days) throws SQLException {
        Map<String, Object> trends = new HashMap<>();
        
        String sql = """
            WITH CurrentPeriod AS (
                SELECT 
                    COUNT(DISTINCT p.Personal_Health_No) as patients,
                    COUNT(DISTINCT hp.SLMC_No) as professionals,
                    COUNT(DISTINCT a.Appointment_ID) as appointments
                FROM Healthcare_Institute hi
                LEFT JOIN Healthcare_Professional hp ON hi.Health_Institute_Number = hp.Health_Institute_Number
                LEFT JOIN Appointment a ON hi.Health_Institute_Number = a.Health_Institute_Number
                LEFT JOIN Patient p ON a.Personal_Health_No = p.Personal_Health_No
                WHERE hi.Health_Institute_Number = ?
                AND a.Appointment_Date >= date('now', ?)
            ),
            PreviousPeriod AS (
                SELECT 
                    COUNT(DISTINCT p.Personal_Health_No) as patients,
                    COUNT(DISTINCT hp.SLMC_No) as professionals,
                    COUNT(DISTINCT a.Appointment_ID) as appointments
                FROM Healthcare_Institute hi
                LEFT JOIN Healthcare_Professional hp ON hi.Health_Institute_Number = hp.Health_Institute_Number
                LEFT JOIN Appointment a ON hi.Health_Institute_Number = a.Health_Institute_Number
                LEFT JOIN Patient p ON a.Personal_Health_No = p.Personal_Health_No
                WHERE hi.Health_Institute_Number = ?
                AND a.Appointment_Date BETWEEN date('now', ?) AND date('now', ?)
            )
            SELECT 
                ROUND(((c.patients - p.patients) * 100.0 / NULLIF(p.patients, 0)), 1) as patientsTrend,
                ROUND(((c.professionals - p.professionals) * 100.0 / NULLIF(p.professionals, 0)), 1) as professionalsTrend,
                ROUND(((c.appointments - p.appointments) * 100.0 / NULLIF(p.appointments, 0)), 1) as appointmentsTrend
            FROM CurrentPeriod c, PreviousPeriod p
        """;
        
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, instituteId);
            pstmt.setString(2, String.format("-%d days", days));
            pstmt.setString(3, instituteId);
            pstmt.setString(4, String.format("-%d days", days * 2));
            pstmt.setString(5, String.format("-%d days", days));
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                trends.put("patientsTrend", rs.getDouble("patientsTrend"));
                trends.put("professionalsTrend", rs.getDouble("professionalsTrend"));
                trends.put("appointmentsTrend", rs.getDouble("appointmentsTrend"));
                trends.put("satisfactionTrend", 0.0); // Placeholder since we don't have feedback data
            }
        }
        
        return trends;
    }

    private List<Map<String, Object>> getDepartmentStats(Connection conn, String instituteId, int days) throws SQLException {
        List<Map<String, Object>> departmentStats = new ArrayList<>();
        
        String sql = """
            SELECT 
                hp.Specialty as name,
                COUNT(DISTINCT p.Personal_Health_No) as patients,
                COUNT(DISTINCT hp.SLMC_No) as professionals,
                COUNT(DISTINCT a.Appointment_ID) as appointments
            FROM Healthcare_Professional hp
            LEFT JOIN Appointment a ON hp.SLMC_No = a.SLMC_No
            LEFT JOIN Patient p ON a.Personal_Health_No = p.Personal_Health_No
            WHERE hp.Health_Institute_Number = ?
            AND (a.Appointment_Date IS NULL OR a.Appointment_Date >= date('now', ?))
            AND hp.Specialty IS NOT NULL
            GROUP BY hp.Specialty
        """;
        
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, instituteId);
            pstmt.setString(2, String.format("-%d days", days));
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                Map<String, Object> dept = new HashMap<>();
                dept.put("name", rs.getString("name"));
                dept.put("patients", rs.getInt("patients"));
                dept.put("professionals", rs.getInt("professionals"));
                dept.put("appointments", rs.getInt("appointments"));
                dept.put("satisfaction", 0); // Placeholder since we don't have feedback data
                departmentStats.add(dept);
            }
            
            // If no results, add a default entry
            if (departmentStats.isEmpty()) {
                Map<String, Object> defaultDept = new HashMap<>();
                defaultDept.put("name", "General");
                defaultDept.put("patients", 0);
                defaultDept.put("professionals", 0);
                defaultDept.put("appointments", 0);
                defaultDept.put("satisfaction", 0);
                departmentStats.add(defaultDept);
            }
        }
        
        return departmentStats;
    }
}