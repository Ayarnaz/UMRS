import java.sql.*;
import java.util.Vector;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.CompletableFuture;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

public class AppointmentDAO {
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
        dataSource = new HikariDataSource(config);
    }

    public void insertAppointment(Appointment appointment) throws SQLException {
        String sql = "INSERT INTO Appointment (Personal_Health_No, SLMC_No, Health_Institute_Number, " +
                    "Appointment_Date, Appointment_Time, Purpose, Status, Notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);
            try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                pstmt.setString(1, appointment.getPersonalHealthNo());
                pstmt.setString(2, appointment.getSlmcNo());
                pstmt.setString(3, appointment.getHealthInstituteNumber());
                pstmt.setDate(4, appointment.getAppointmentDate());
                pstmt.setTime(5, appointment.getAppointmentTime());
                pstmt.setString(6, appointment.getPurpose());
                pstmt.setString(7, appointment.getStatus());
                pstmt.setString(8, appointment.getNotes());
                
                pstmt.executeUpdate();
                conn.commit();
            } catch (SQLException e) {
                try {
                    conn.rollback();
                } catch (SQLException re) {
                    e.addSuppressed(re);
                }
                throw e;
            }
        }
    }

    // Get appointments for a healthcare professional
    public Vector<Appointment> getAppointmentsByProfessional(String slmcNo) {
        Vector<Appointment> appointments = new Vector<>();
        String sql = "SELECT * FROM Appointment WHERE SLMC_No = ? ORDER BY Appointment_Date, Appointment_Time";
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, slmcNo);
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                appointments.add(mapResultSetToAppointment(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error in getAppointmentsByProfessional: " + e.getMessage());
            e.printStackTrace();
        }
        
        return appointments;
    }

    // Get pending appointment requests
    public Vector<Appointment> getPendingAppointments(String slmcNo) {
        String sql = "SELECT * FROM Appointment WHERE SLMC_No = ? AND Status = 'Pending' " +
                     "ORDER BY Appointment_Date, Appointment_Time";
        Vector<Appointment> appointments = new Vector<>();

        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, slmcNo);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                appointments.add(mapResultSetToAppointment(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error in getPendingAppointments: " + e.getMessage());
            e.printStackTrace();
        }

        return appointments;
    }

    // Get appointment by ID
    public Appointment getAppointmentById(int appointmentId) {
        String sql = "SELECT * FROM Appointment WHERE Appointment_ID = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, appointmentId);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToAppointment(rs);
            }
        } catch (SQLException e) {
            System.err.println("Error in getAppointmentById: " + e.getMessage());
            e.printStackTrace();
        }

        return null;
    }

    public void updateAppointment(Appointment appointment) throws SQLException {
        String sql = "UPDATE Appointment SET SLMC_No = ?, Health_Institute_Number = ?, " +
                    "Appointment_Date = ?, Appointment_Time = ?, Purpose = ?, Status = ?, Notes = ? " +
                    "WHERE Appointment_ID = ?";

        try (Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);
            try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                pstmt.setString(1, appointment.getSlmcNo());
                pstmt.setString(2, appointment.getHealthInstituteNumber());
                pstmt.setDate(3, appointment.getAppointmentDate());
                pstmt.setTime(4, appointment.getAppointmentTime());
                pstmt.setString(5, appointment.getPurpose());
                pstmt.setString(6, appointment.getStatus());
                pstmt.setString(7, appointment.getNotes());
                pstmt.setInt(8, appointment.getAppointmentID());
                
                int rowsAffected = pstmt.executeUpdate();
                if (rowsAffected == 0) {
                    throw new SQLException("Appointment not found with ID: " + appointment.getAppointmentID());
                }
                conn.commit();
            } catch (SQLException e) {
                try {
                    conn.rollback();
                } catch (SQLException re) {
                    e.addSuppressed(re);
                }
                throw e;
            }
        }
    }

    public Vector<Appointment> getAppointmentsByPatient(String personalHealthNo) {
        String sql = "SELECT * FROM Appointment WHERE Personal_Health_No = ? ORDER BY Appointment_Date, Appointment_Time";
        Vector<Appointment> appointments = new Vector<>();

        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, personalHealthNo);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                appointments.add(mapResultSetToAppointment(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error in getAppointmentsByPatient: " + e.getMessage());
            e.printStackTrace();
        }

        return appointments;
    }

    // Delete an appointment
    public void deleteAppointment(int appointmentID) throws SQLException {
        String sql = "DELETE FROM Appointment WHERE Appointment_ID = ?";

        try (Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);
            try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                pstmt.setInt(1, appointmentID);
                pstmt.executeUpdate();
                conn.commit();
            } catch (SQLException e) {
                try {
                    conn.rollback();
                } catch (SQLException re) {
                    e.addSuppressed(re);
                }
                throw e;
            }
        }
    }

    private Appointment mapResultSetToAppointment(ResultSet rs) throws SQLException {
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
        return appointment;
    }

    public int getTodayAppointmentsCount(String instituteId) {
        String sql = """
            SELECT COUNT(*) as count 
            FROM Appointment 
            WHERE Health_Institute_Number = ? 
            AND date(Appointment_Date) = date('now')
            AND Status != 'cancelled'
        """;

        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, instituteId);
            ResultSet rs = pstmt.executeQuery();
            return rs.next() ? rs.getInt("count") : 0;
        } catch (SQLException e) {
            System.err.println("Error getting today's appointment count: " + e.getMessage());
            return 0;
        }
    }

    public Vector<Appointment> getUpcomingAppointments(String slmcNo) {
        String sql = """
            SELECT * FROM Appointment 
            WHERE SLMC_No = ? 
            AND date(Appointment_Date) >= date('now')
            AND Status != 'cancelled'
            ORDER BY Appointment_Date, Appointment_Time
        """;
        
        Vector<Appointment> appointments = new Vector<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, slmcNo);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                appointments.add(mapResultSetToAppointment(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error getting upcoming appointments: " + e.getMessage());
        }
        return appointments;
    }

    public Vector<Appointment> getUpcomingAppointmentsForPatient(String personalHealthNo) {
        String sql = "SELECT * FROM Appointment " +
                     "WHERE Personal_Health_No = ? " +
                     "AND date(Appointment_Date) >= date('now') " +
                     "AND Status != 'cancelled' " +
                     "ORDER BY Appointment_Date, Appointment_Time";
        
        Vector<Appointment> appointments = new Vector<>();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, personalHealthNo);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                appointments.add(mapResultSetToAppointment(rs));
            }
        } catch (SQLException e) {
            System.err.println("Error getting upcoming appointments for patient: " + e.getMessage());
        }
        return appointments;
    }
}
